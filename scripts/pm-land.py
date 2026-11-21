#!/usr/bin/env python3
"""Run Puppet Master's landing checks in a full worktree on an idle machine."""

from __future__ import annotations

import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import fcntl
import importlib.util
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shlex
import shutil
import socket
import stat
import subprocess
import sys
import time
from typing import NamedTuple
import uuid

SHARED = Path("/mnt/Cursor/PuppetMaster")
EVIDENCE = SHARED.with_name("PuppetMaster-Evidence")
RUNS = EVIDENCE / "scratch/landing-remote"
LOCK = EVIDENCE / "scratch/landing-lock/held"
CLONE = Path.home() / "src/PuppetMaster"
HOSTS = {"1070ti": "1070ti", "nas1": "nas1-agent"}
MACHINES = {"1070ti": "1070ti", "nas1": "ubuntu-agent-nas1"}
DEFAULT_HOST = "nas1"
SSH_FAILURE_LIMIT = 3
JOB_MODES = ('check', 'snapshot', 'recheck', 'followup')
RAW_LINK = "tests/agent_packet_restrictions"
RAW_MANIFEST = "tests/fixtures/governance/raw_evidence_capture_modes.json"
READINESS = "Plans/.audits/event-authority-2026-08-13-currentness"
BASELINE = "reports/landing-checks/baseline.json"
MIGRATION = "Plans/.plan_migration"
MAIN_REF = "refs/heads/main"
ORIGIN_MAIN = "refs/remotes/origin/main"
TIMEOUT = 1800
EXIT_LABELS = {0: "clear", 1: "findings to read", 2: "landing blocked", 3: "check could not run"}
CHECK = ("python3", "-B", "scripts/pm-landing-check.py")
SHARD = ("python3", "-B", "scripts/pm-shard-plans.py", "--check", "--config",
         "Plans/sharding_config.json")
# Roots used by the aggregates, the separate migration check, and the PM7 build check.
# json-syntax gets its ordinary inputs from Git, with raw captures selected by the manifest.
IGNORED_INPUT_ROOTS = ("Plans", "reports", "scripts", "Concepts", "tests/fixtures", ".puppet-master/project")
SHARED_INPUT_ROOTS = (*IGNORED_INPUT_ROOTS, "tests")
PLAN_INPUT_EXTENSIONS = {".md", ".json", ".jsonl", ".yaml", ".yml", ".schema", ".py"}
FIXTURE_INPUT_EXTENSIONS = PLAN_INPUT_EXTENSIONS | {".txt", ".csv", ".tsv", ".html", ".css", ".js", ".svg"}
CONCEPT_ASSET_EXTENSIONS = {".gif", ".jpeg", ".jpg", ".otf", ".png", ".ttf", ".webp", ".woff", ".woff2"}
PM7_SOURCE = "Concepts/onboarding/opus-5.5/src"


class Refusal(RuntimeError):
    """The landing preconditions could not be established."""


class TransportFailure(Refusal):
    """The remote job may still be active, so preserve its worktree and evidence."""


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def say(message: str) -> None:
    print(message, flush=True)


def command(argv, *, cwd=None, capture=True, check=True, input_text=None, pass_fds=()):
    result = subprocess.run(argv, cwd=cwd, check=False, text=True,
                            stdout=subprocess.PIPE if capture else None,
                            stderr=subprocess.PIPE if capture else None,
                            encoding="utf-8", errors="surrogateescape", input=input_text,
                            pass_fds=pass_fds)
    if check and result.returncode:
        raise Refusal(f"{shlex.join(map(str, argv))} exited {result.returncode}"
                      + (f": {result.stderr.strip()}" if result.stderr else ""))
    return result


def git(root, *args, check=True, guard_fd=None, input_text=None):
    return command(["git", "--no-optional-locks", "-C", str(root), *args], check=check,
                   input_text=input_text, pass_fds=() if guard_fd is None else (guard_fd,))


def revision(root, ref):
    return git(root, "rev-parse", "--verify", ref).stdout.strip()


def sha(value, label):
    if not isinstance(value, str) or not re.fullmatch(r"[0-9a-f]{40}", value):
        raise Refusal(f"{label} must be a full 40-character commit or tree SHA: {value!r}")
    return value


def file_hash(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def read_json(path):
    with path.open(encoding="utf-8") as stream:
        return json.load(stream)


def write_json(path, value):
    temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    temporary.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def safe_relative(name, prefix):
    path = PurePosixPath(name)
    if not name.startswith(prefix + "/") or ".." in path.parts or path.as_posix() != name:
        raise Refusal(f"unexpected input path in {prefix}: {name}")
    return name


def raw_paths(worktree):
    manifest = read_json(worktree / RAW_MANIFEST)
    return {safe_relative(row["path"], RAW_LINK) for row in manifest["entries"]}


def within(name, root):
    return name == root or name.startswith(root + "/")


def selected_ignored_input(name):
    """Union of filesystem scans, fixture reads and typed reference targets."""
    path = PurePosixPath(name)
    suffix = path.suffix.lower()
    if within(name, READINESS):
        return True
    if within(name, "scripts") or within(name, PM7_SOURCE):
        # The landing checker digests its validator tree, and the PM7 build lints its sources.
        return "__pycache__" not in path.parts
    if within(name, "tests/fixtures/usage_gui") or path.parent.as_posix() == "tests/fixtures/pm7_shared":
        # The PM7 fixture gate counts these paths before loading their JSON.
        return True
    if within(name, "Plans"):
        # plan_text_files, active_usage_source_confidence_paths, web capability and
        # migration each select a different subset. Also retain file targets admitted
        # by contract references and the audit/currentness validators.
        return suffix in PLAN_INPUT_EXTENSIONS | {".txt", ".tsv"} or ".schema." in path.name.lower()
    if within(name, "Concepts"):
        return suffix in FIXTURE_INPUT_EXTENSIONS | CONCEPT_ASSET_EXTENSIONS
    return suffix in FIXTURE_INPUT_EXTENSIONS or ".schema." in path.name.lower()


def declared_refs(document):
    if not document.is_file():
        return {}
    try:
        content = read_json(document)
    except (ValueError, UnicodeError):
        # The validator reports malformed bytes from the bound input itself.
        return {}
    return content if isinstance(content, dict) else {}


def closure_inputs(document):
    """The registry names decision inputs through whole-file and anchored references."""
    if not document.is_file():
        return set()
    refs = set()
    with document.open(encoding="utf-8", errors="surrogateescape") as stream:
        for line in stream:
            try:
                row = json.loads(line)
            except ValueError:
                continue
            if not isinstance(row, dict):
                continue
            hashes = row.get("hashes")
            if isinstance(hashes, dict):
                for key in ("owner_evidence_hashes", "closure_evidence_hashes"):
                    group = hashes.get(key)
                    if isinstance(group, dict):
                        refs.update(group)
            evidence = row.get("closure_evidence")
            if isinstance(evidence, list):
                refs.update(ref for ref in evidence if isinstance(ref, str))
    return {ref.split("#", 1)[0].split(":", 1)[0] for ref in refs}


def declared_input_paths(root, worktree, ignored, tracked):
    """Find exact hash targets, including artifacts whose extension is not scanned."""
    targets = set()

    def declaration(name):
        return (root if name in ignored else worktree) / name

    readiness = declared_refs(root / READINESS / "VALIDATOR_RECEIPT.json").get("artifact_hashes")
    if isinstance(readiness, dict):
        targets.update(readiness)

    lock = declared_refs(declaration("Plans/Spec_Lock.json")).get("canonical_ssot_hashes")
    if isinstance(lock, dict) and isinstance(lock.get("files"), list):
        targets.update(row["path"] for row in lock["files"]
                       if isinstance(row, dict) and isinstance(row.get("path"), str))

    legacy = declared_refs(declaration("Plans/.audits/_legacy_format_inventory.json")).get("directories")
    if isinstance(legacy, dict):
        for name, entry in legacy.items():
            if isinstance(entry, dict) and isinstance(entry.get("files"), dict):
                targets.update(f"Plans/.audits/{name}/{filename}" for filename in entry["files"])

    targets.update(closure_inputs(declaration("Plans/.audits/_semantic_closure_registry.jsonl")))
    evidence = set((worktree / "Plans/.evidence").glob("**/evidence.json"))
    evidence.update(root / name for name in ignored
                    if within(name, "Plans/.evidence") and PurePosixPath(name).name == "evidence.json")
    for document in evidence:
        artifacts = declared_refs(document).get("artifacts")
        if isinstance(artifacts, list):
            targets.update(row["path"] for row in artifacts if isinstance(row, dict)
                           and isinstance(row.get("path"), str) and row.get("sha256"))
    return {name for name in targets - tracked
            if name and not PurePosixPath(name).is_absolute() and ".." not in PurePosixPath(name).parts
            and PurePosixPath(name).as_posix() == name and not within(name, RAW_LINK)
            and (root / name).is_file()}


def ignored_reference_paths(root, refs):
    if not refs:
        return set()
    result = subprocess.run(["git", "--no-optional-locks", "-C", str(root), "check-ignore", "-z", "--stdin"],
                            input=os.fsencode("\0".join(sorted(refs)) + "\0"), capture_output=True, check=False)
    if result.returncode not in (0, 1):
        raise Refusal(f"cannot classify ignored artifact paths in {root}: {os.fsdecode(result.stderr).strip()}")
    return set(os.fsdecode(result.stdout).split("\0")) - {""}


def copies(root, worktree, tracked):
    found = git(root, "ls-files", "--others", "--ignored", "--exclude-standard",
                "-z", "--", *IGNORED_INPUT_ROOTS).stdout
    ignored = set(found.split("\0")) - {""} - tracked
    selected = {name for name in ignored if selected_ignored_input(name)}
    references = declared_input_paths(root, worktree, ignored, tracked)
    selected.update(ignored_reference_paths(root, references))
    return selected


def regular_hash(root, name, *, through_raw_link=False):
    path = root / name
    for parent in path.parents:
        if parent == root:
            break
        if through_raw_link and parent == root / RAW_LINK:
            continue
        if parent.is_symlink():
            raise Refusal(f"unexpected symlink in ignored input path: {parent}")
    if not path.is_file() or path.is_symlink():
        raise Refusal(f"missing or non-regular ignored input: {path}")
    return file_hash(path)


def tracklist(worktree):
    paths = git(worktree, "ls-files", "-z").stdout
    return set(paths.split("\0")) - {""}


def input_manifest(root, worktree, tracked):
    manifest = {name: regular_hash(root, name) for name in sorted(copies(root, worktree, tracked))}
    link = root / RAW_LINK
    if not link.is_symlink() or not link.is_dir():
        raise Refusal(f"missing or invalid raw evidence link: {link}")
    target = link.resolve(strict=True)
    if not target.is_relative_to(EVIDENCE.resolve(strict=True)):
        raise Refusal(f"raw evidence link leaves the evidence share: {link} -> {target}")
    manifest[RAW_LINK] = f"symlink:{target}"
    for name in sorted(raw_paths(worktree)):
        manifest[name] = regular_hash(root, name, through_raw_link=True)
    return manifest


def require_same_inputs(expected, actual, label):
    changed = [name for name in sorted(expected.keys() | actual.keys())
               if expected.get(name) != actual.get(name)]
    if changed:
        raise Refusal(f"{label} ignored input mismatch: " + ", ".join(changed))


def copy_inputs(shared, worktree):
    tracked = tracklist(worktree)
    expected = input_manifest(shared, worktree, tracked)
    for name in expected:
        if name.startswith(RAW_LINK + "/"):
            continue
        destination = worktree / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists() or destination.is_symlink():
            raise Refusal(f"refusing to overwrite an existing checkout path: {destination}")
        if name == RAW_LINK:
            destination.symlink_to((shared / name).resolve(strict=True), target_is_directory=True)
        else:
            shutil.copy2(shared / name, destination)
    require_same_inputs(expected, input_manifest(worktree, worktree, tracked), "copied")
    return expected


def require_clean_full(worktree, commit, tree):
    head = revision(worktree, "HEAD^{commit}")
    if head != commit:
        raise Refusal(f"remote HEAD is {head}; expected {commit}")
    actual_tree = revision(worktree, "HEAD^{tree}")
    if actual_tree != tree:
        raise Refusal(f"remote tree is {actual_tree}; expected {tree}")
    sparse = git(worktree, "config", "--type=bool", "--get", "core.sparseCheckout", check=False)
    if sparse.returncode not in (0, 1) or sparse.stdout.strip() == "true":
        raise Refusal(f"remote worktree is sparse or sparse status is unreadable: {worktree}")
    if git(worktree, "rev-parse", "--is-shallow-repository").stdout.strip() == "true":
        raise Refusal(f"remote git history is shallow: {worktree}")
    # A full checkout should have neither skip-worktree nor assume-unchanged entries.
    flags = git(worktree, "ls-files", "-v", "-z").stdout.split("\0")
    hidden = [entry[2:] for entry in flags if entry and (entry[0] == "S" or entry[0].islower())]
    if hidden:
        raise Refusal(f"remote index has hidden entries: {', '.join(hidden[:20])}")
    dirty = git(worktree, "status", "--porcelain", "--untracked-files=all").stdout
    if dirty:
        raise Refusal(f"remote worktree is dirty:\n{dirty.rstrip()}")


def validate_check_report(path, head, base, code):
    if type(code) is not int or code not in (0, 1, 2, 3):
        raise Refusal(f"landing check exited unexpectedly: {code!r}")
    if code == 3:
        return None
    report = read_json(path)
    if not isinstance(report, dict):
        raise Refusal(f"landing check report is not a JSON object: {path}")
    for key, expected in {
        "schema_id": "pm.landing_check.report.v1", "commit": head, "base": base,
        "subcheck_timeout_seconds": TIMEOUT,
    }.items():
        if report.get(key) != expected:
            raise Refusal(f"landing check report {key} is {report.get(key)!r}; expected {expected!r}")
    if code in (0, 1) and report.get("blocking", 0) != 0:
        raise Refusal(f"landing check exit {code} disagrees with the reported blockers")
    return report


def record_witness(worktree):
    git_dir = git(worktree, "rev-parse", "--path-format=absolute", "--git-dir").stdout.strip()
    return Path(git_dir) / "pm-land-record.sha256"


def verify_record(folder, worktree, shared, host, head, tree, base, record):
    """Verify the live remote checkout and shared inputs against an independently supplied target."""
    for label, value in (("target commit", head), ("target tree", tree), ("fetched origin/main", base),
                         ("recorded base", record.get("base"))):
        sha(value, label)
    for key, value in {"schema": 1, "host": host, "machine": socket.gethostname(), "head": head,
                       "tree": tree, "base": base, "worktree": str(worktree)}.items():
        if record.get(key) != value:
            raise Refusal(f"record {key} is {record.get(key)!r}; expected {value!r}")
    require_clean_full(worktree, head, tree)
    git(worktree, "merge-base", "--is-ancestor", base, head)
    path = folder / "landing-check.json"
    if record.get("report") != str(path) or file_hash(path) != record.get("report_sha256"):
        raise Refusal(f"landing check report path or SHA-256 changed: {path}")
    code = record.get("exit_code")
    validate_check_report(path, head, base, code)
    start = datetime.fromisoformat(record["started_utc"])
    end = datetime.fromisoformat(record["ended_utc"])
    if start.utcoffset() is None or end.utcoffset() is None or end < start:
        raise Refusal("landing check times are missing their offset or out of order")
    tracked = tracklist(worktree)
    for label, root in (("shared checkout", shared), ("remote checkout", worktree)):
        require_same_inputs(record["ignored_inputs"], input_manifest(root, worktree, tracked), label)
    # Catch a checkout change while the input hashing was in progress.
    require_clean_full(worktree, head, tree)
    return {"verified_utc": now(), "host": host, "machine": record["machine"],
            "head": head, "tree": tree, "base": base, "full": True, "clean": True,
            "started_utc": record["started_utc"], "ended_utc": record["ended_utc"],
            "exit_code": code, "report": str(path), "report_sha256": record["report_sha256"],
            "ignored_input_count": len(record["ignored_inputs"])}


def worktree_path(folder):
    return Path.home() / "pm-worktrees" / f"landing-remote-{folder.name}"


def prepare_remote(folder, ref, head, tree, base):
    root = worktree_path(folder)
    git(CLONE, "fetch", "--no-tags", "origin", *dict.fromkeys((MAIN_REF, ref)))
    # A named fetch makes the target reachable. Use the exact SHA even if that ref advanced.
    sha(head, "target commit")
    sha(base, "fetched origin/main")
    git(CLONE, "merge-base", "--is-ancestor", base, head)
    root.parent.mkdir(parents=True, exist_ok=True)
    if root.exists() or root.is_symlink():
        raise Refusal(f"remote worktree path is already in use: {root}")
    git(CLONE, "worktree", "add", "--detach", str(root), head)
    require_clean_full(root, head, tree)
    manifest = copy_inputs(SHARED, root)
    require_clean_full(root, head, tree)
    return root, manifest


def capture(argv, cwd, stdout, stderr):
    start = time.monotonic()
    with stdout.open("wb") as out, stderr.open("wb") as err:
        code = subprocess.run(argv, cwd=cwd, stdout=out, stderr=err, check=False,
                              env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}).returncode
    return code, round(time.monotonic() - start, 2)


def remote_run(folder, host, ref, head, tree, base):
    started = now()
    root, inputs = prepare_remote(folder, ref, head, tree, base)
    shard, shard_seconds = capture(SHARD, root, folder / "shards.json", folder / "shards.stderr")
    check_started = now()
    report = folder / "landing-check.json"
    args = [*CHECK, "--base", base, "--subcheck-timeout-seconds", str(TIMEOUT), "--json",
            "--readiness-audit-root", str(root / READINESS),
            "--keep-check-reports", str(folder / "subchecks")]
    code, seconds = capture(args, root, report, folder / "landing-check.stderr")
    ended = now()
    validate_check_report(report, head, base, code)
    require_clean_full(root, head, tree)
    require_same_inputs(inputs, input_manifest(root, root, tracklist(root)), "after the check")
    write_json(folder / "record.json",
               {"schema": 1, "host": host, "machine": socket.gethostname(), "worktree": str(root),
                "head": head, "tree": tree, "base": base, "argv": args, "exit_code": code,
                "report": str(report), "report_sha256": file_hash(report), "started_utc": check_started,
                "ended_utc": ended, "check_seconds": seconds, "preparation_started_utc": started,
                "shard_exit_code": shard, "shard_seconds": shard_seconds, "ignored_inputs": inputs})
    record_witness(root).write_text(file_hash(folder / "record.json") + "\n", encoding="ascii")


def remote_verify(folder, host, head, tree, base):
    try:
        root = worktree_path(folder)
        path = folder / "record.json"
        record_bytes = path.read_bytes()
        if hashlib.sha256(record_bytes).hexdigest() != record_witness(root).read_text(encoding="ascii").strip():
            raise Refusal(f"remote landing record changed since the check completed: {path}")
        result = verify_record(folder, root, SHARED, host, head, tree, base, json.loads(record_bytes))
    except (Refusal, OSError, ValueError, KeyError) as exc:
        write_json(folder / "verification.json", {"verified_utc": now(), "error": str(exc)})
        raise
    write_json(folder / "verification.json", result)
    code = result["exit_code"]
    say(f"Verified {head} on {host} against {base}; "
        f"{result['ignored_input_count']} ignored input entries match. "
        f"Landing check exit {code} ({EXIT_LABELS[code]}).")


def remote_cleanup(folder):
    root = worktree_path(folder)
    if not root.exists():
        return
    known = [mode for mode in JOB_MODES if job_receipt(folder, mode).is_file()]
    if not known:
        raise Refusal(f"cannot establish which jobs used {root}")
    for mode in known:
        name = job_name(folder, mode)
        if read_json(job_receipt(folder, mode)).get("job") != name:
            raise Refusal(f"unexpected job identity for {mode} at {folder}")
        result = command(["long-job", "status", name, "--json"], check=False)
        if result.returncode in (1, 2) and f"no job named {name} " in result.stderr:
            continue
        if result.returncode:
            raise Refusal(f"cannot establish remote job state for {name}: {result.stderr.strip()}")
        states = json.loads(result.stdout)
        if (not isinstance(states, list) or len(states) != 1
                or not isinstance(states[0], dict) or states[0].get("name") != name):
            raise Refusal(f"unexpected status for remote job {name}")
        state = states[0].get("state")
        if state in ("starting", "running", "partial"):
            raise Refusal(f"remote job is still in use: {name} ({state})")
        if state not in ("done", "failed", "stopped", "lost"):
            raise Refusal(f"unknown state for remote job {name}: {state}")
    git(CLONE, "worktree", "remove", "--force", str(root))


def ssh(host, *argv, capture_output=True, check=True):
    return command(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15",
                    "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", HOSTS[host],
                    shlex.join(map(str, argv))], capture=capture_output, check=check)


def helper(folder, host, mode, *args):
    return ["python3", "-B", str(folder / "worker.py"), "_remote", mode, str(folder), host, *args]


def new_run(branch, commit):
    RUNS.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^a-z0-9_.-]", "-", branch.lower())
    digest = hashlib.sha256(os.fsencode(branch)).hexdigest()[:8]
    label = f"{slug[:17]}-{digest}"
    folder = RUNS / f"{label}-{commit[:12]}-{uuid.uuid4().hex[:12]}"
    folder.mkdir(mode=0o700)
    shutil.copyfile(Path(__file__).resolve(), folder / "worker.py")
    return folder


def job_name(folder, mode):
    if mode not in JOB_MODES:
        raise Refusal(f"unknown remote job mode: {mode}")
    run_id = hashlib.sha256(os.fsencode(folder.name)).hexdigest()[:20]
    return f"pm-{mode}-{run_id}"


def job_receipt(folder, mode):
    return folder / f"{mode}-job.json"


def remember_job(folder, mode):
    write_json(job_receipt(folder, mode), {"job": job_name(folder, mode)})


def transport_failure(folder, host, mode, failures):
    name = job_name(folder, mode)
    fallback = next(other for other in HOSTS if other != host)
    write_json(folder / "transport-failure.json",
               {"host": host, "job": name, "mode": mode, "consecutive_failures": failures,
                "failed_utc": now(), "fallback_host": fallback})
    return TransportFailure(
        f"Lost SSH to {host} for {name}. Evidence: {folder}. "
        f"Check that job on reconnect, or retry with --checks-on {fallback}."
    )


def start_remote_job(folder, host, mode, *args, heartbeat=lambda: None):
    name = job_name(folder, mode)
    heartbeat()
    launch = ssh(host, "long-job", "start", name, "--log", folder / f"{mode}.log", "--",
                 *helper(folder, host, mode, *args), capture_output=False, check=False)
    failures = int(launch.returncode == 255)
    if failures:
        say(f"SSH disconnected while starting {name}. Checking the job on reconnect.")
    elif launch.returncode:
        raise Refusal(f"could not start {host} long-job {name} (exit {launch.returncode})")
    else:
        # This acknowledges jobs in the starting state, before the worker first runs.
        remember_job(folder, mode)
    say(f"Waiting for {host} long-job {name}. Evidence: {folder}")
    while True:
        heartbeat()
        wait = ssh(host, "long-job", "wait", name, "--timeout", "1500",
                   capture_output=False, check=False)
        if wait.returncode == 255:
            failures += 1
            if failures >= SSH_FAILURE_LIMIT:
                raise transport_failure(folder, host, mode, failures)
            say(f"SSH disconnected while waiting for {name}. Reconnecting.")
            time.sleep(15)
            continue
        failures = 0
        if wait.returncode == 124:
            continue
        if wait.returncode:
            raise Refusal(f"remote job {name} failed. See {folder / (mode + '.log')}")
        return


def checked_remote(folder, host, ref, head, tree, base, heartbeat=lambda: None, *, mode="check"):
    start_remote_job(folder, host, mode, ref, head, tree, base, heartbeat=heartbeat)
    record = read_json(folder / "record.json")
    code = record["exit_code"]
    say(f"Landing check exit {code} ({EXIT_LABELS[code]}) in {record['check_seconds']} s. "
        f"Report {record['report']}. Diagnostics {folder / 'landing-check.stderr'}.")
    return record


def verify_over_ssh(folder, host, head, tree, base):
    result = ssh(host, *helper(folder, host, "verify", head, tree, base), capture_output=False, check=False)
    if result.returncode == 255:
        mode = "followup" if job_receipt(folder, "followup").is_file() else "check"
        raise transport_failure(folder, host, mode, 1)
    if result.returncode:
        raise Refusal(f"verification on {host} exited {result.returncode}. See {folder / 'verification.json'}")


def cleanup_over_ssh(folder, host):
    ssh(host, *helper(folder, host, "cleanup"), capture_output=False)


@contextmanager
def remote_worktree(folder, host):
    cleanup = True
    try:
        yield
    except TransportFailure:
        # A lost SSH connection cannot establish whether the worker is still active.
        cleanup = False
        raise
    finally:
        if cleanup:
            try:
                cleanup_over_ssh(folder, host)
            except Exception as exc:
                # Cleanup warnings must not replace the checker or publication outcome.
                try:
                    write_json(folder / "cleanup-failure.json", {"host": host, "error": str(exc), "utc": now()})
                except OSError as record_error:
                    say(f"Could not save the cleanup warning at {folder}: {record_error}")
                say(f"Remote worktree cleanup needs attention for {folder}. {exc}")


def full_main(root):
    return sha(revision(root, ORIGIN_MAIN + "^{commit}"), "fetched origin/main")


def check_ref(branch):
    if branch == "HEAD" or branch.startswith("-"):
        raise Refusal(f"expected a branch name: {branch}")
    result = command(["git", "check-ref-format", f"refs/heads/{branch}"], check=False)
    if result.returncode:
        raise Refusal(f"invalid branch name: {branch}")
    return f"refs/heads/{branch}"


def dry_run(args, root, ref):
    git(root, "fetch", "origin")
    base = full_main(root)
    head = revision(root, ref + "^{commit}")
    tree = revision(root, head + "^{tree}")
    git(root, "merge-base", "--is-ancestor", base, head)
    folder = new_run(args.branch, head)
    with remote_worktree(folder, args.checks_on):
        record = checked_remote(folder, args.checks_on, "refs/heads/main" if head == base else ref,
                                head, tree, base)
        # Keep the evidence for the fetched base even if the trial becomes stale while checking.
        # The separate freshness check bars using that evidence for a landing at a different base.
        verify_over_ssh(folder, args.checks_on, head, tree, base)
        git(root, "fetch", "origin")
        latest = full_main(root)
        if latest != base:
            detail = f"origin/main moved during the dry-run from {base} to {latest}. Run again at the new main."
            write_json(folder / "base-moved.json", {"detected_utc": now(), "checked_base": base,
                                                  "fetched_base": latest, "error": detail})
            raise Refusal(detail)
        return record["exit_code"]


def remote_snapshot(folder, host, head, tree, branch):
    ref = check_ref(branch)
    if not branch.startswith("fix/landing-snapshot-"):
        raise Refusal(f"invalid snapshot branch: {branch}")
    root, inputs = prepare_remote(folder, MAIN_REF, head, tree, head)
    pointer = read_json(root / MIGRATION / "current_run.json")
    day = datetime.now(timezone.utc).strftime("%Y%m%d")
    pattern = re.compile(fr"pds-{day}-(\d{{3}})-current-planunit-snapshot")
    sequence = max((int(match[1]) for path in (root / MIGRATION).iterdir()
                    if (match := pattern.fullmatch(path.name))), default=0) + 1
    if sequence > 999:
        raise Refusal(f"no free plan-migration snapshot id for {day}")
    run_id = f"pds-{day}-{sequence:03d}-current-planunit-snapshot"
    code, snapshot_seconds = capture(
        ["python3", "-B", "scripts/pm-plan-migration.py", "snapshot-current",
         "--run-id", run_id, "--expected-doc-count", str(len(list((root / "Plans").glob("*.md")))),
         "--supersedes-run-id", pointer["run_id"]], root, folder / "snapshot.json",
        folder / "snapshot.stderr")
    if code:
        raise Refusal(f"snapshot-current exited {code}; see {folder / 'snapshot.json'}")
    code, baseline_seconds = capture(
        [*CHECK, "--record-baseline", "--subcheck-timeout-seconds", str(TIMEOUT),
         "--readiness-audit-root", str(root / READINESS)],
        root, folder / "baseline.stdout", folder / "baseline.stderr")
    if code or read_json(root / BASELINE).get("commit") != head:
        raise Refusal(f"baseline did not record at {head}; see {folder / 'baseline.stderr'}")
    tracked = tracklist(root)
    require_same_inputs(inputs, input_manifest(root, root, tracked), "snapshot checkout")
    require_same_inputs(inputs, input_manifest(SHARED, root, tracked), "shared checkout")
    git(root, "add", "--", MIGRATION, BASELINE)
    git(root, "commit", "-m", "plans: refresh the plan-migration snapshot and the landing-check baseline")
    commit = revision(root, "HEAD^{commit}")
    snap_tree = revision(root, "HEAD^{tree}")
    require_clean_full(root, commit, snap_tree)
    paths = changed_paths(root, head, commit)
    if BASELINE not in paths or f"{MIGRATION}/current_run.json" not in paths or any(
        name != BASELINE and not name.startswith(MIGRATION + "/") for name in paths
    ):
        raise Refusal("snapshot commit changed paths outside the snapshot and baseline scope")
    git(root, "push", "origin", f"HEAD:{ref}")
    write_json(folder / "snapshot-record.json",
               {"host": host, "branch": branch, "base": head, "head": commit, "tree": snap_tree,
                "snapshot_seconds": snapshot_seconds, "baseline_seconds": baseline_seconds,
                "ignored_inputs": inputs})


def remote_recheck(folder):
    """Rerun each timed-out validator with the checked tree's own command mapping."""
    root = worktree_path(folder)
    record = read_json(folder / "record.json")
    report = validate_check_report(Path(record["report"]), record["head"], record["base"],
                                   record["exit_code"])
    require_clean_full(root, record["head"], record["tree"])
    spec = importlib.util.spec_from_file_location("pm_landing_check_recheck", root / "scripts/pm-landing-check.py")
    if spec is None or spec.loader is None:
        raise Refusal("cannot read the landing check's subcheck command mapping")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    reruns = folder / "timeout-reruns"
    reruns.mkdir()
    names = {}
    for row in report["infrastructure"]:
        names.setdefault(row["check"], set()).add(row["subcheck"])
    commands = module.aggregate_subcheck_argv(root, names, TIMEOUT * 2)
    for number, ((aggregate, subcheck), argv) in enumerate(sorted(commands.items()), 1):
        details = module.run_export(root, argv, TIMEOUT * 2)
        output = reruns / f"{number}-{argv[0]}.json"
        write_json(output, {"argv": argv, **details})
        payload = details["report"]
        if details["error"] or details["timed_out"] or not payload or payload.get("status") not in ("pass", "fail"):
            raise Refusal(f"{aggregate}/{subcheck} did not finish on rerun; see {output}")
        if any(isinstance(item, dict) and item.get("error") in module.INFRASTRUCTURE_ERRORS
               for item in payload["failures"]):
            raise Refusal(f"{aggregate}/{subcheck} still timed out; see {output}")
        say(f"{aggregate}/{subcheck} rerun {payload['status']} in {details['elapsed_seconds']} s: {output}")


def changed_paths(root, base, head):
    return set(git(root, "diff", "--no-ext-diff", "--no-renames", "--name-only",
                   "-z", base, head, "--").stdout.rstrip("\0").split("\0")) - {""}


def status_paths(root, *, untracked="normal"):
    fields = iter(git(root, "status", "--porcelain=v1", "-z", "--ignore-submodules=none",
                      f"--untracked-files={untracked}").stdout.split("\0"))
    paths = set()
    for entry in fields:
        if entry:
            paths.add(entry[3:].rstrip("/"))
            if any(flag in "RC" for flag in entry[:2]):
                paths.add(next(fields).rstrip("/"))
    return paths


def overlaps(changed, touched):
    touched_parents = {str(parent) for name in touched for parent in PurePosixPath(name).parents}
    return sorted(name for name in changed if name in touched or name in touched_parents or any(
        str(parent) in touched for parent in PurePosixPath(name).parents))


def affects_shared_check(name):
    # The aggregates also parse tracked and visible JSON/JSONL outside these roots.
    return (any(within(name, root) for root in SHARED_INPUT_ROOTS)
            or PurePosixPath(name).suffix.lower() in {".json", ".jsonl"}
            or name in {".gitignore", ".gitattributes", "AGENTS.md"})


def clean_touched(root, touched):
    hidden = {entry[2:] for entry in git(root, "ls-files", "-v", "-z").stdout.split("\0")
              if entry and (entry[0] == "S" or entry[0].islower())}
    changed = status_paths(root, untracked="all") | hidden
    tracked_input_changes = {name for name in changed if affects_shared_check(name)}
    dirty = sorted(tracked_input_changes | set(overlaps(changed, touched)))
    if dirty:
        raise Refusal("shared checkout has uncommitted changes or hidden index flags in landing or check inputs: "
                      + ", ".join(dirty))


def shared_shards(folder, touched):
    path = folder / "shards-shared.json"
    code, _ = capture(SHARD, SHARED, path, folder / "shards-shared.stderr")
    if not code:
        return
    findings = read_json(path)["failures"]
    if not findings or any(not row.get("path") for row in findings):
        raise Refusal(f"shared shard check failed without named paths; see {path}")
    names = {row["path"] for row in findings}
    affected = overlaps(names | {row["source"] for row in findings if row.get("source")}, touched)
    if affected:
        raise Refusal("shared shard check failed on paths this branch touches: " + ", ".join(affected))
    for name in sorted(names):
        git(SHARED, "cat-file", "-e", f"HEAD:{name}")
        shard = PurePosixPath(name)
        if shard.is_relative_to("Plans/_shards") and len(shard.parts) >= 4 and shard.name != "manifest.json":
            manifest = json.loads(git(SHARED, "show", f"HEAD:{shard.parent / 'manifest.json'}").stdout)
            registered = {entry["path"] for entry in manifest["shards"]} | {manifest["index_path"]}
            if name not in registered:
                raise Refusal(f"HEAD's shard manifest does not reference {name}")
    say(f"Report to Jared: shared shard check failed on unrelated paths with consistent HEAD: "
        f"{', '.join(sorted(names))}. See {path}.")


def check_judgments(folder, host, record, heartbeat, wait_for_review):
    code = record["exit_code"]
    if code in (2, 3):
        return code
    if record["shard_exit_code"] != 0:
        raise Refusal(f"shard check on the exact commit failed; see {folder / 'shards.json'}")
    report = validate_check_report(Path(record["report"]), record["head"], record["base"], code)
    timed_out = bool(report["infrastructure"])
    if timed_out:
        start_remote_job(folder, host, "recheck", heartbeat=heartbeat)
    # The JSON has keys for the reported rows. A same-count bucket that reports a new
    # fingerprint on a touched file requires the comparison the rules already call for.
    baseline = json.loads(git(SHARED, "show", f"{record['head']}:{BASELINE}").stdout)
    partial = set(report["subchecks_compared_by_total_only"])
    counted = baseline["checks"]
    known = {}
    for table in ("buckets", "export_buckets"):
        for bucket in baseline.get(table, []):
            check, subcheck = bucket["check"], bucket["subcheck"]
            name = f"{check}/{subcheck}"
            count = counted[check]["subchecks"].get(subcheck, {})
            exported = (int(count.get("sampled", 0)) < int(count.get("reported", 0))
                        <= int(count.get("exported", 0) or 0))
            if name not in partial and exported == (table == "export_buckets"):
                key = "|".join((check, subcheck, bucket["error"], bucket["path"]))
                known[key] = bucket.get("fingerprints")
    compare = []
    for row in report["pre_existing"]:
        bucket, _, fingerprint = row["key"].rpartition("|")
        fingerprints = known.get(bucket)
        if row["branch_paths"] and fingerprints is not None and fingerprint not in fingerprints:
            compare.append(row)
    if timed_out or compare:
        review = folder / "review.json"
        write_json(review, {"report_sha256": record["report_sha256"], "changed_pre_existing": compare,
                            "timeout_reruns": str(folder / "timeout-reruns") if timed_out else None})
        say(f"Lander judgment required. Compare the rows and judge completed timeout reruns in {review}.")
        decision = folder / "judgment.json"
        if wait_for_review:
            say(f"After comparison, write {decision} with report_sha256, proceed, and a nonempty judgment. "
                "The landing will wait up to 60 minutes.")
            expires = time.monotonic() + 3600
            while not decision.is_file() and time.monotonic() < expires:
                heartbeat()
                time.sleep(15)
        if not decision.is_file():
            raise Refusal(f"the lander has not judged the results in {review}; use --wait-for-review")
        answer = read_json(decision)
        explanation = answer.get("judgment")
        if (answer.get("report_sha256") != record["report_sha256"]
                or not isinstance(explanation, str) or not explanation.strip()):
            raise Refusal(f"judgment does not name this report and explain the decision: {decision}")
        if answer.get("proceed") is not True:
            return 2
    if code == 1:
        say("Apply the landing report's notifications to Jared for any reseal request, stale baseline, "
            "or new failures outside this branch's paths.")
    return code


def holder_age(lock):
    holder = lock / "holder.txt"
    try:
        stat = holder.stat()
        body = holder.read_text(encoding="utf-8")
    except FileNotFoundError:
        stat = lock.stat()
        body = ""
    moments = re.findall(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})", body)
    latest = max([stat.st_mtime, lock.stat().st_mtime]
                 + [datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp() for value in moments])
    return time.time() - latest, body


class Publication(NamedTuple):
    base: str
    candidate: str
    plans_followup: bool
    completes_followup: bool
    phase: str = "fast-forward-pending"
    pre_merge_head: str | None = None


def holder_field(body, name):
    prefix = f"{name}: "
    values = [line[len(prefix):] for line in body.splitlines() if line.startswith(prefix)]
    if len(values) > 1:
        raise Refusal(f"duplicate {name} in landing holder")
    return values[0] if values else ""


@contextmanager
def landing_guard():
    # Hand landers use the same guard for holder updates, takeover and release.
    with (LOCK.parent / "pm-land-reap.guard").open("a") as guard:
        fcntl.flock(guard, fcntl.LOCK_EX)
        yield guard.fileno()


def sync_directory(path):
    directory = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(directory)
    finally:
        os.close(directory)


class LandingLock:
    def __init__(self, agent, branch):
        self.agent = agent
        self.branch = branch
        self.token = uuid.uuid4().hex
        self.owed = ""
        self.publication = None

    def __enter__(self):
        while True:
            with landing_guard():
                try:
                    LOCK.mkdir()
                except FileExistsError:
                    try:
                        age, body = holder_age(LOCK)
                        if age > 90 * 60:
                            age, current = holder_age(LOCK)
                            if age > 90 * 60 and body == current:
                                if self.adopt_recovery(body):
                                    return self
                                shutil.rmtree(LOCK)
                                continue
                    except FileNotFoundError:
                        continue
                else:
                    try:
                        self.write_locked(None, "")
                        sync_directory(LOCK.parent)
                    except OSError:
                        shutil.rmtree(LOCK)
                        raise
                    return self
            say("Landing lock is held. Waiting five minutes.")
            time.sleep(300)

    def adopt_recovery(self, body):
        if "batch-start:" in body or "recovery-needed:" in body:
            raise Refusal(f"the expired landing holder needs manual recovery: {LOCK / 'holder.txt'}")
        owed = holder_field(body, "follow-up-owed")
        raw_publication = holder_field(body, "publication")
        if not owed and not raw_publication:
            return False
        if owed:
            sha(owed, "owed Plans commit")
        publication = None
        if raw_publication:
            entry = json.loads(raw_publication)
            fields = set(Publication._fields)
            required = fields - {"phase", "pre_merge_head"}
            if not isinstance(entry, dict) or not required <= entry.keys() <= fields:
                raise Refusal("invalid publication marker in landing holder")
            publication = Publication(**entry)
            sha(publication.base, "publication base")
            sha(publication.candidate, "publication candidate")
            if publication.pre_merge_head is not None:
                sha(publication.pre_merge_head, "pre-merge shared HEAD")
            if (type(publication.plans_followup) is not bool
                    or type(publication.completes_followup) is not bool
                    or publication.phase not in ("fast-forward-pending", "push-pending", "rollback-pending")
                    or publication.base == publication.candidate
                    or publication.completes_followup != bool(owed)
                    or (publication.plans_followup and publication.completes_followup)):
                raise Refusal("inconsistent publication marker in landing holder")
        # Replace the owner while preserving its work in the same directory.
        self.write_locked(publication, owed)
        say(f"Took over the expired landing with its recovery marker at {LOCK / 'holder.txt'}.")
        return True

    def write_locked(self, publication, owed):
        content = f"{self.agent} {self.branch} {now()}\ntoken: {self.token}\n"
        if owed:
            content += f"follow-up-owed: {owed}\n"
        if publication:
            content += "publication: " + json.dumps(publication._asdict(), sort_keys=True) + "\n"
        path = LOCK / f".holder-{self.token}.tmp"
        with path.open("w", encoding="utf-8") as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        path.replace(LOCK / "holder.txt")
        sync_directory(LOCK)
        self.publication, self.owed = publication, owed

    def require_owner(self):
        try:
            body = (LOCK / "holder.txt").read_text(encoding="utf-8")
        except FileNotFoundError as exc:
            raise Refusal(f"landing lock disappeared: {LOCK / 'holder.txt'}") from exc
        if holder_field(body, "token") != self.token:
            raise Refusal(f"landing lock has changed owners: {LOCK / 'holder.txt'}")

    def heartbeat(self):
        with landing_guard():
            self.require_owner()
            self.write_locked(self.publication, self.owed)

    @contextmanager
    def shared_mutation(self):
        with landing_guard() as guard_fd:
            self.require_owner()
            # Git inherits the guard until it exits, including after controller loss.
            yield guard_fd

    def begin_publication(self, base, candidate, plans_followup, completes_followup, pre_merge_head):
        """Journal a fast-forward while its shared mutation guard is held."""
        if (self.publication or bool(self.owed) != completes_followup
                or (plans_followup and completes_followup)):
            raise Refusal("resolve the previous publication or Plans follow-up first")
        self.write_locked(Publication(base, candidate, plans_followup, completes_followup,
                                      pre_merge_head=pre_merge_head), self.owed)

    def mark_push_pending(self):
        """Update the journal while the push's shared mutation guard is held."""
        self.write_locked(self.publication._replace(phase="push-pending"), self.owed)

    def finish_publication(self, published):
        with landing_guard():
            self.require_owner()
            previous = self.publication
            owed = self.owed
            if published and previous.plans_followup:
                owed = previous.candidate
            elif published and previous.completes_followup:
                owed = ""
            self.write_locked(None, owed)

    def __exit__(self, *_):
        with landing_guard():
            self.require_owner()
            if self.publication or self.owed:
                self.write_locked(self.publication, self.owed)
                say(f"Landing lock retained for recovery. See {LOCK / 'holder.txt'}.")
            else:
                shutil.rmtree(LOCK)
                sync_directory(LOCK.parent)


def branch_worktree(root, ref):
    if ref == MAIN_REF:
        raise Refusal("supply the topic branch, not main")
    result = git(root, "worktree", "list", "--porcelain", "-z").stdout
    for row in result.split("\0\0"):
        fields = row.split("\0")
        if f"branch {ref}" in fields and fields[0].startswith("worktree "):
            path = Path(fields[0].removeprefix("worktree "))
            if path.resolve() == SHARED.resolve() or git(path, "rev-parse", "--path-format=absolute",
                                                          "--git-common-dir").stdout.strip() == str(path / ".git"):
                raise Refusal("land from a dedicated topic worktree")
            return path
    raise Refusal(f"{ref} is not checked out in a topic worktree")


def ref_at(root, remote, ref):
    output = git(root, "ls-remote", "--refs", remote, ref).stdout.splitlines()
    if not output:
        return ""
    if len(output) != 1 or not output[0].endswith("\t" + ref):
        raise Refusal(f"could not establish {ref} at {remote}")
    return sha(output[0].split("\t", 1)[0], ref)


def rebase_and_push(worktree, ref, base):
    git(worktree, "fetch", "origin")
    if full_main(worktree) != base:
        return None
    if status_paths(worktree):
        raise Refusal(f"topic worktree has uncommitted changes: {worktree}")
    # The lease protects someone else's push to this topic branch during our rebase.
    existing = ref_at(worktree, "origin", ref)
    original_head = revision(worktree, "HEAD^{commit}")
    if existing and git(worktree, "merge-base", "--is-ancestor", existing, original_head,
                        check=False).returncode:
        # A failed push can leave the previously published tip in the local branch's reflog after rebase.
        prior_tips = git(worktree, "reflog", "show", "--format=%H", ref).stdout.splitlines()
        if existing not in prior_tips:
            raise Refusal(f"published topic branch contains work absent from the local branch: {ref}")
    git(worktree, "rebase", base)
    head = revision(worktree, "HEAD^{commit}")
    if head == base:
        return head
    git(worktree, "push", f"--force-with-lease={ref}:{existing}", "origin", f"HEAD:{ref}")
    return head


def fetch_shared(lock, *refs):
    with lock.shared_mutation() as guard_fd:
        lock.write_locked(lock.publication, lock.owed)
        git(SHARED, "fetch", "origin", *refs, guard_fd=guard_fd)


def is_ancestor(root, earlier, later):
    result = git(root, "merge-base", "--is-ancestor", earlier, later, check=False)
    if result.returncode not in (0, 1):
        raise Refusal(f"cannot compare Git commits {earlier} and {later}: {result.stderr.strip()}")
    return result.returncode == 0


def require_shared_main():
    if git(SHARED, "symbolic-ref", "HEAD").stdout.strip() != MAIN_REF:
        raise Refusal("shared checkout must be on main")


def rollback_shared(lock, marker, upstream):
    """Apply a two-tree checkout, then conditionally move main back."""
    with lock.shared_mutation() as guard_fd:
        require_shared_main()
        shared_head = revision(SHARED, "HEAD^{commit}")
        if shared_head != marker.candidate:
            raise Refusal(f"shared main changed to {shared_head} before rolling back {marker.candidate}")
        if full_main(SHARED) != upstream or is_ancestor(SHARED, marker.candidate, upstream):
            raise Refusal(f"origin/main changed before rolling back {marker.candidate}")
        lock.write_locked(marker._replace(phase="rollback-pending"), lock.owed)
        # The two-tree checkout carries unrelated staged and unstaged entries
        # forward. Replaying it after interruption is safe.
        git(SHARED, "read-tree", "-m", "-u", marker.candidate, upstream, guard_fd=guard_fd)
        lock.require_owner()
        require_shared_main()
        git(SHARED, "update-ref", "-m", "recover unpublished landing", MAIN_REF, upstream,
            marker.candidate, guard_fd=guard_fd)


UNKNOWN_ENTRY = object()


def fast_forward_entries(before, candidate):
    """The old and candidate tree entries on paths a fast-forward can change."""
    raw = git(SHARED, "diff", "--raw", "--no-abbrev", "--no-ext-diff", "--no-renames",
              "-z", before, candidate, "--").stdout
    fields = iter(raw.split("\0"))
    changes = {}
    for metadata in fields:
        if not metadata:
            break
        old_mode, new_mode, old_oid, new_oid, _ = metadata[1:].split()
        name = next(fields)
        old = (old_mode, old_oid) if old_mode != "000000" else None
        new = (new_mode, new_oid) if new_mode != "000000" else None
        changes[name] = (old, new)
    return changes


def partial_checkout_index(paths):
    staged = {}
    fields = git(SHARED, "ls-files", "--stage", "-v", "-z").stdout.split("\0")
    for entry in fields:
        if not entry:
            continue
        metadata, name = entry.split("\t", 1)
        if name in paths:
            tag, mode, oid, stage = metadata.split()
            staged[name] = (mode, oid) if tag == "H" and stage == "0" else UNKNOWN_ENTRY
    return staged


def stat_identity(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_size, info.st_mtime_ns, info.st_ctime_ns)


def working_entry(name, object_format):
    """Read the raw worktree entry without following links or applying clean filters."""
    relative = PurePosixPath(name)
    path = SHARED / relative
    if any((SHARED / parent).is_symlink() for parent in relative.parents if parent != PurePosixPath(".")):
        return UNKNOWN_ENTRY
    try:
        metadata = path.lstat()
    except FileNotFoundError:
        return None
    except OSError:
        return UNKNOWN_ENTRY

    digest = hashlib.new(object_format, usedforsecurity=False)
    try:
        if stat.S_ISLNK(metadata.st_mode):
            data = os.fsencode(os.readlink(path))
            digest.update(f"blob {len(data)}\0".encode())
            digest.update(data)
            mode = "120000"
        elif stat.S_ISREG(metadata.st_mode):
            descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
            with os.fdopen(descriptor, "rb") as stream:
                if stat_identity(os.fstat(stream.fileno())) != stat_identity(metadata):
                    return UNKNOWN_ENTRY
                digest.update(f"blob {metadata.st_size}\0".encode())
                for block in iter(lambda: stream.read(1024 * 1024), b""):
                    digest.update(block)
            mode = "100755" if metadata.st_mode & stat.S_IXUSR else "100644"
        else:
            return UNKNOWN_ENTRY
        if stat_identity(path.lstat()) != stat_identity(metadata):
            return UNKNOWN_ENTRY
    except OSError:
        return UNKNOWN_ENTRY
    return mode, digest.hexdigest()


def partial_checkout_state(changes, object_format):
    staged = partial_checkout_index(changes)
    return {name: (staged.get(name), working_entry(name, object_format)) for name in changes}


def repair_failed_fast_forward(lock, marker, upstream):
    """Restore only affected paths whose bytes can be attributed to the failed merge."""
    before = marker.pre_merge_head
    if before is None:
        raise Refusal("publication has no pre-merge shared HEAD. Inspect its index and worktree before clearing it")
    with lock.shared_mutation() as guard_fd:
        require_shared_main()
        current = revision(SHARED, "HEAD^{commit}")
        if current != before or full_main(SHARED) != upstream or not is_ancestor(SHARED, before, marker.base):
            raise Refusal(f"shared main {current} or origin changed after the recorded pre-merge HEAD {before}")
        changes = fast_forward_entries(before, marker.candidate)
        object_format = git(SHARED, "rev-parse", "--show-object-format").stdout.strip()
        observed = partial_checkout_state(changes, object_format)
        restore, ambiguous = set(), set()
        for name, (old, new) in changes.items():
            indexed, working = observed[name]
            if indexed == old and working == old:
                continue
            if (indexed not in (old, new) or working not in (old, new)
                    or (old is None and indexed is None)):
                # An untracked candidate-shaped file can predate the merge.
                ambiguous.add(name)
            else:
                restore.add(name)
        restore.difference_update(overlaps(restore, ambiguous))
        if restore:
            lock.write_locked(marker, lock.owed)
            git(SHARED, "--literal-pathspecs", "restore", f"--source={before}",
                "--staged", "--worktree", "--no-overlay", "--pathspec-from-file=-", "--pathspec-file-nul",
                input_text="\0".join(sorted(restore)) + "\0", guard_fd=guard_fd)
            observed = partial_checkout_state(changes, object_format)
        remaining = [name for name, (old, _) in changes.items() if observed[name] != (old, old)]
        if remaining:
            raise Refusal("ambiguous index or working-tree bytes after failed fast-forward: "
                          + ", ".join(sorted(remaining)))


def record_publication_recovery(lock, error, folder):
    marker = lock.publication
    if marker is None:
        return
    path = (folder / "publication-recovery.json" if folder is not None
            else LOCK.parent / f"recovery-{marker.candidate}.json")
    try:
        write_json(path, {**marker._asdict(), "follow_up_owed": lock.owed,
                          "reason": str(error), "utc": now(), "holder": str(LOCK / "holder.txt")})
    except OSError as record_error:
        say(f"Could not save the recovery notice at {path}: {record_error}")
    say(f"Publication needs the current lock owner's attention. Recovery notice: {path}.")


def settle_publication(lock, upstream, *, require_candidate=False):
    """Resolve a journaled fast-forward against a known origin tip."""
    require_shared_main()
    marker = lock.publication
    if not is_ancestor(SHARED, marker.base, upstream) or not is_ancestor(SHARED, marker.base, marker.candidate):
        raise Refusal("publication history changed. Inspect the marker before touching shared main")
    shared_head = revision(SHARED, "HEAD^{commit}")
    if require_candidate and shared_head != marker.candidate:
        raise Refusal(f"shared main changed to {shared_head} after fast-forwarding {marker.candidate}")
    published = is_ancestor(SHARED, marker.candidate, upstream)
    if shared_head == marker.candidate and not published:
        rollback_shared(lock, marker, upstream)
        if revision(SHARED, "HEAD^{commit}") != upstream:
            raise Refusal("shared main did not return to the origin tip in the recovery check")
        say(f"Rolled the unpublished fast-forward back to {upstream}.")
    elif not is_ancestor(SHARED, shared_head, upstream):
        raise Refusal(f"shared main {shared_head} is unrelated to fetched main {upstream} "
                      f"and the recorded publication {marker.candidate}")
    elif shared_head != marker.candidate and marker.phase == "fast-forward-pending":
        repair_failed_fast_forward(lock, marker, upstream)
    lock.finish_publication(published)
    return published


def reconcile_publication(lock, folder=None, *, refresh=True, require_candidate=False):
    try:
        if refresh:
            fetch_shared(lock)
        else:
            lock.heartbeat()
        return settle_publication(lock, full_main(SHARED), require_candidate=require_candidate)
    except (Refusal, OSError, ValueError) as exc:
        record_publication_recovery(lock, exc, folder)
        raise


def push_checked_main(folder, host, head, tree, base, touched, lock, plans_followup, *,
                      completes_followup=False):
    """Journal the verified fast-forward before changing shared main."""
    require_shared_main()
    old_head = revision(SHARED, "HEAD^{commit}")
    git(SHARED, "merge-base", "--is-ancestor", old_head, base)
    git(SHARED, "merge-base", "--is-ancestor", base, head)
    shared_scope = touched | changed_paths(SHARED, old_head, base) if old_head != base else touched
    clean_touched(SHARED, shared_scope)
    verify_over_ssh(folder, host, head, tree, base)
    fast_forwarded = False
    attempted_push = False
    published = False
    try:
        with lock.shared_mutation() as guard_fd:
            require_shared_main()
            if revision(SHARED, "HEAD^{commit}") != old_head or full_main(SHARED) != base:
                raise Refusal("shared HEAD or origin/main changed before fast-forward")
            clean_touched(SHARED, shared_scope)
            lock.begin_publication(base, head, plans_followup, completes_followup, old_head)
            git(SHARED, "merge", "--ff-only", "--no-overwrite-ignore", head, guard_fd=guard_fd)
            fast_forwarded = True
        if revision(SHARED, "HEAD^{commit}") != head or revision(SHARED, "HEAD^{tree}") != tree:
            raise Refusal("shared fast-forward did not produce the checked commit and tree")
        shared_shards(folder, touched)
        verify_over_ssh(folder, host, head, tree, base)
        with lock.shared_mutation() as guard_fd:
            require_shared_main()
            if revision(SHARED, "HEAD^{commit}") != head:
                raise Refusal("shared HEAD changed after the fast-forward")
            clean_touched(SHARED, touched)
            lock.mark_push_pending()
            # The lease binds the server's base. The ancestry check makes this a fast-forward.
            attempted_push = True
            result = git(SHARED, "push", f"--force-with-lease={MAIN_REF}:{base}", "origin",
                         f"{head}:{MAIN_REF}", check=False, guard_fd=guard_fd)
        if not result.returncode:
            lock.finish_publication(True)
            say(f"Pushed main at {head}.")
            return True
    finally:
        if lock.publication:
            # After attempting a push, ask the primary before deciding whether to roll back.
            # With no attempt, the still-owned lock and last fetch establish that it is unpublished.
            published = reconcile_publication(lock, folder, refresh=attempted_push,
                                              require_candidate=fast_forwarded)
    if published:
        say(f"Primary main reached {head}, but the push reported an error. "
            f"Check the configured push mirrors: {result.stderr.strip()}")
        return True
    if full_main(SHARED) != base:
        return False
    raise Refusal(f"main push failed: {result.stderr.strip()}")


def remove_topic(worktree, branch, head):
    ref = check_ref(branch)
    git(worktree, "fetch", "origin")
    fetched_main = full_main(worktree)
    git(worktree, "merge-base", "--is-ancestor", head, fetched_main)
    if (git(worktree, "symbolic-ref", "HEAD").stdout.strip() != ref
            or revision(worktree, ref + "^{commit}") != head or status_paths(worktree)):
        raise Refusal(f"topic worktree changed during landing. Inspect before removing {worktree}")
    common = Path(git(worktree, "rev-parse", "--path-format=absolute", "--git-common-dir").stdout.strip())
    git(common, "worktree", "remove", str(worktree))
    # Git's checked-out branch in this clone can lag fetched main. Delete only
    # the proven tip, even if another writer updates the ref after worktree removal.
    git(common, "update-ref", "-d", ref, head)


def snapshot_followup(host, head, tree, lock, wait_for_review):
    branch = f"fix/landing-snapshot-{head[:12]}-{uuid.uuid4().hex[:8]}"
    folder = new_run(branch, head)
    with remote_worktree(folder, host):
        start_remote_job(folder, host, "snapshot", head, tree, branch, heartbeat=lock.heartbeat)
        snapshot = read_json(folder / "snapshot-record.json")
    candidate = sha(snapshot["head"], "snapshot commit")
    folder = new_run(branch, candidate)
    ref = check_ref(branch)
    with remote_worktree(folder, host):
        record = checked_remote(folder, host, ref, candidate, snapshot["tree"], head, lock.heartbeat,
                                mode="followup")
        require_same_inputs(snapshot["ignored_inputs"], record["ignored_inputs"], "after recording baseline")
        fetch_shared(lock, ref)
        if ref_at(SHARED, "origin", ref) != candidate:
            raise Refusal("the published snapshot follow-up branch changed during its check")
        code = check_judgments(folder, host, record, lock.heartbeat, wait_for_review)
        if code in (2, 3):
            say(f"Snapshot follow-up stopped at exit {code}. See {record['report']}.")
            return code
        fetch_shared(lock)
        if full_main(SHARED) != head:
            raise Refusal("origin/main moved before publishing the snapshot follow-up")
        touched = changed_paths(SHARED, head, candidate)
        if not push_checked_main(folder, host, candidate, snapshot["tree"], head, touched, lock, False,
                                 completes_followup=True):
            raise Refusal("origin/main moved before publishing the snapshot follow-up")
        return code


def recover_pending_landing(host, lock, wait_for_review):
    if lock.publication:
        reconcile_publication(lock)
    if not lock.owed:
        return 0
    require_shared_main()
    fetch_shared(lock)
    base = full_main(SHARED)
    git(SHARED, "merge-base", "--is-ancestor", lock.owed, base)
    say(f"Completing the recovered Plans follow-up for {lock.owed} at {base}.")
    return snapshot_followup(host, base, revision(SHARED, base + "^{tree}"), lock, wait_for_review)


def live_run(args, root, ref):
    host = args.checks_on
    worktree = branch_worktree(root, ref)
    agent = args.agent or os.environ.get("USER")
    if not agent or not re.fullmatch(r"[A-Za-z0-9_.-]+", agent):
        raise Refusal("supply your landing name with --agent")
    with LandingLock(agent, args.branch) as lock:
        recovered_code = recover_pending_landing(host, lock, args.wait_for_review)
        if recovered_code in (2, 3):
            return recovered_code
        while True:
            fetch_shared(lock)
            base = full_main(SHARED)
            head = rebase_and_push(worktree, ref, base)
            if head is None:
                say("origin/main changed while fetching. Fetching and rebasing again.")
                continue
            if head == base:
                say(f"The topic has no changes beyond main at {base}.")
                lock.heartbeat()
                remove_topic(worktree, args.branch, head)
                return recovered_code
            tree = revision(worktree, "HEAD^{tree}")
            folder = new_run(args.branch, head)
            with remote_worktree(folder, host):
                record = checked_remote(folder, host, ref, head, tree, base, lock.heartbeat)
                fetch_shared(lock)
                if full_main(SHARED) != base:
                    say("origin/main moved during the checks. Fetching, rebasing and checking again.")
                    continue
                fetch_shared(lock, ref)
                if ref_at(SHARED, "origin", ref) != head:
                    raise Refusal(f"published topic branch changed after the check started: {ref}")
                code = check_judgments(folder, host, record, lock.heartbeat, args.wait_for_review)
                if code in (2, 3):
                    return code
                fetch_shared(lock)
                if full_main(SHARED) != base:
                    say("origin/main moved while reviewing the checks. Starting again.")
                    continue
                touched = changed_paths(SHARED, base, head)
                followup = any(name.startswith("Plans/") for name in touched)
                if not push_checked_main(folder, host, head, tree, base, touched, lock, followup):
                    say("origin/main moved during the push. Fetching, rebasing and checking again.")
                    continue
                if followup:
                    code = max(code, snapshot_followup(host, head, tree, lock, args.wait_for_review))
                    if code in (2, 3):
                        return code
                lock.heartbeat()
                remove_topic(worktree, args.branch, head)
                return max(code, recovered_code)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True, metavar="{run,verify}")
    run = commands.add_parser("run", help="check a branch and land it under the landing lock")
    run.add_argument("branch")
    run.add_argument("--checks-on", choices=HOSTS, default=DEFAULT_HOST)
    run.add_argument("--dry-run", action="store_true", help="check and verify without locking or pushing")
    run.add_argument("--agent", help="name to record in the landing lock")
    run.add_argument("--wait-for-review", action="store_true",
                     help="wait for the lander to judge timeout reruns or changed baseline rows")
    verify = commands.add_parser("verify", help="rehash a completed remote run before fast-forwarding")
    verify.add_argument("record", type=Path)
    verify.add_argument("--commit", required=True)
    verify.add_argument("--base", required=True, help="full SHA of freshly fetched origin/main")
    remote = commands.add_parser("_remote")
    remote.add_argument("mode", choices=(*JOB_MODES, "verify", "cleanup"))
    remote.add_argument("folder", type=Path)
    remote.add_argument("host", choices=HOSTS)
    remote.add_argument("values", nargs="*")
    args = parser.parse_args()
    try:
        if args.command == "_remote":
            if socket.gethostname() != MACHINES[args.host]:
                raise Refusal(f"SSH reached {socket.gethostname()}, expected {MACHINES[args.host]}")
            folder = args.folder.resolve(strict=True)
            # The evidence mount can resolve through archive/ differently on each host. Keep its
            # common logical spelling for receipt paths while validating the actual destination.
            if (args.folder.is_symlink() or folder.parent != RUNS.resolve(strict=True)
                    or args.folder.parent != RUNS):
                raise Refusal(f"worker path is outside the remote landing evidence directory: {folder}")
            if args.mode in JOB_MODES:
                # The worker itself records its identity when SSH dropped during launch.
                remember_job(args.folder, args.mode)
            if args.mode in ("check", "followup"):
                remote_run(args.folder, args.host, *args.values)
            elif args.mode == "verify":
                remote_verify(args.folder, args.host, *args.values)
            elif args.mode == "snapshot":
                remote_snapshot(args.folder, args.host, *args.values)
            elif args.mode == "recheck":
                remote_recheck(args.folder)
            else:
                remote_cleanup(args.folder)
            return 0
        root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel").stdout.strip())
        if args.command == "verify":
            if args.record.name != "record.json":
                raise Refusal("expected the record.json path from the remote run")
            sha(args.commit, "target commit")
            sha(args.base, "fetched origin/main")
            if ref_at(SHARED, "origin", MAIN_REF) != args.base:
                raise Refusal("origin/main has moved from the supplied base")
            record = read_json(args.record)
            tree = revision(root, args.commit + "^{tree}")
            verify_over_ssh(args.record.parent, record["host"], args.commit, tree, args.base)
            return record["exit_code"]
        ref = check_ref(args.branch)
        if args.dry_run:
            return dry_run(args, root, ref)
        return live_run(args, root, ref)
    except (Refusal, OSError, ValueError, KeyError) as exc:
        print(f"pm-land: {exc}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
