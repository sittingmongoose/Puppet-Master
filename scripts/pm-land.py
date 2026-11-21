#!/usr/bin/env python3
"""Run Puppet Master's landing checks in a full worktree on an idle machine."""

from __future__ import annotations

import argparse
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
import subprocess
import sys
import time
import uuid

SHARED = Path("/mnt/Cursor/PuppetMaster")
EVIDENCE = SHARED.with_name("PuppetMaster-Evidence")
RUNS = EVIDENCE / "scratch/landing-remote"
LOCK = EVIDENCE / "scratch/landing-lock/held"
CLONE = Path.home() / "src/PuppetMaster"
HOSTS = {"1070ti": "1070ti", "nas1": "nas1-agent"}
MACHINES = {"1070ti": "1070ti", "nas1": "ubuntu-agent-nas1"}
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
AUDIT_FILES = (
    "Plans/.audits/audit-20260827-001-pmconcept7-usage-recovery/FINAL_REPORT.md",
    "Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/FINAL_REPORT.md",
    "Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/FINAL_REPORT.md",
    "Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json",
    "Plans/.audits/event-authority-2026-08-12/NEXT_STEPS_20260910.md",
    "Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET_ANSWERS_20260910.json",
    "Plans/.audits/event-authority-2026-08-12/OWNER_DECISION_SHEET_PLAIN_20260909.md",
)
AUDIT_DIRS = (
    "Plans/.audits/audit-20260828-002-settings-tome-tabs-preport",
    "Plans/.audits/audit-20260828-003-chat-56-fast-lane",
    "Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview",
    READINESS,
)


class Refusal(RuntimeError):
    """The landing preconditions could not be established."""


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def say(message: str) -> None:
    print(message, flush=True)


def command(argv, *, cwd=None, capture=True, check=True):
    result = subprocess.run(argv, cwd=cwd, check=False, text=True,
                            stdout=subprocess.PIPE if capture else None,
                            stderr=subprocess.PIPE if capture else None,
                            encoding="utf-8", errors="surrogateescape")
    if check and result.returncode:
        raise Refusal(f"{shlex.join(map(str, argv))} exited {result.returncode}"
                      + (f": {result.stderr.strip()}" if result.stderr else ""))
    return result


def git(root, *args, check=True):
    return command(["git", "--no-optional-locks", "-C", str(root), *args], check=check)


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


def copies(root, tracked):
    """Find the ordinary ignored inputs, including every untracked audit report the index globs."""
    paths = set(AUDIT_FILES)
    paths.update(path.relative_to(root).as_posix()
                 for path in (root / "Plans/.audits").glob("audit-*/FINAL_REPORT.md"))
    for name in AUDIT_DIRS:
        path = root / name
        if not path.is_dir() or path.is_symlink():
            raise Refusal(f"missing or non-directory ignored input: {path}")
        for child in path.rglob("*"):
            if child.is_symlink():
                raise Refusal(f"unexpected symlink in ignored inputs: {child}")
            if child.is_file():
                paths.add(child.relative_to(root).as_posix())
    return paths - tracked


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
    paths = git(worktree, "ls-files", "-z", "--", "Plans/.audits", RAW_LINK).stdout
    return set(paths.split("\0"))


def input_manifest(root, worktree, tracked):
    manifest = {name: regular_hash(root, name) for name in sorted(copies(root, tracked))}
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
    for name in AUDIT_DIRS:
        (worktree / name).mkdir(parents=True, exist_ok=True)
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
    for mode in ("check", "snapshot", "recheck"):
        result = command(["long-job", "status", job_name(folder, mode), "--json"], check=False)
        if result.returncode and not result.stdout:
            # Older long-job versions use exit 1 for a name that doesn't exist.
            if result.returncode == 1 and "no job named" in result.stderr.lower():
                continue
            raise Refusal(f"cannot establish remote job state: {result.stderr.strip()}")
        states = json.loads(result.stdout)
        if any(job["state"] in ("running", "partial") for job in states):
            raise Refusal(f"remote job is still in use: {job_name(folder, mode)}")
    # Only the uniquely named disposable worktree this run created is removed.
    git(CLONE, "worktree", "remove", "--force", str(root))


def ssh(host, *argv, capture_output=True, check=True):
    return command(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15",
                    "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", HOSTS[host],
                    shlex.join(map(str, argv))], capture=capture_output, check=check)


def helper(folder, host, mode, *args):
    return ["python3", "-B", str(folder / "worker.py"), "_remote", mode, str(folder), host, *args]


def new_run(branch, commit):
    RUNS.mkdir(parents=True, exist_ok=True)
    label = re.sub(r"[^A-Za-z0-9_.-]", "-", branch)[:50]
    folder = RUNS / f"{label}-{commit[:12]}-{uuid.uuid4().hex[:12]}"
    folder.mkdir(mode=0o700)
    shutil.copyfile(Path(__file__).resolve(), folder / "worker.py")
    return folder


def job_name(folder, mode):
    return f"pm-{mode}-{folder.name}"


def start_remote_job(folder, host, mode, *args, heartbeat=lambda: None):
    name = job_name(folder, mode)
    launch = ssh(host, "long-job", "start", name, "--log", folder / f"{mode}.log", "--",
                 *helper(folder, host, mode, *args), capture_output=False, check=False)
    if launch.returncode == 255:
        say(f"SSH disconnected while starting {name}; checking the job on reconnect.")
    elif launch.returncode:
        raise Refusal(f"could not start {host} long-job {name} (exit {launch.returncode})")
    say(f"Waiting for {host} long-job {name}. Evidence: {folder}")
    while True:
        heartbeat()
        wait = ssh(host, "long-job", "wait", name, "--timeout", "1500",
                   capture_output=False, check=False)
        if wait.returncode == 124:
            continue
        if wait.returncode == 255:
            say(f"SSH disconnected while waiting for {name}; reconnecting.")
            time.sleep(15)
            continue
        if wait.returncode:
            raise Refusal(f"remote job {name} failed; see {folder / (mode + '.log')}")
        return


def checked_remote(folder, host, ref, head, tree, base, heartbeat=lambda: None):
    start_remote_job(folder, host, "check", ref, head, tree, base, heartbeat=heartbeat)
    record = read_json(folder / "record.json")
    code = record["exit_code"]
    say(f"Landing check exit {code} ({EXIT_LABELS[code]}) in {record['check_seconds']} s. "
        f"Report {record['report']}. Diagnostics {folder / 'landing-check.stderr'}.")
    return record


def verify_over_ssh(folder, host, head, tree, base):
    ssh(host, *helper(folder, host, "verify", head, tree, base), capture_output=False)


def cleanup_over_ssh(folder, host):
    ssh(host, *helper(folder, host, "cleanup"), capture_output=False)


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
    try:
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
    finally:
        cleanup_over_ssh(folder, args.checks_on)


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


def status_paths(root):
    fields = iter(git(root, "status", "--porcelain=v1", "-z", "--untracked-files=normal").stdout.split("\0"))
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


def clean_touched(root, touched):
    hidden = {entry[2:] for entry in git(root, "ls-files", "-v", "-z").stdout.split("\0")
              if entry and (entry[0] == "S" or entry[0].islower())}
    dirty = overlaps(status_paths(root) | hidden, touched)
    if dirty:
        raise Refusal("shared checkout has uncommitted changes or hidden index flags in landing paths: "
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


class LandingLock:
    def __init__(self, agent, branch):
        self.agent = agent
        self.branch = branch
        self.token = uuid.uuid4().hex
        self.owed = ""
        self.retain = False

    def __enter__(self):
        # Serialize automatic stale cleanup on the share. The mkdir remains the lock
        # hand landers use. Their holder's time, or the directory time, protects new holders.
        with (LOCK.parent / "pm-land-reap.guard").open("a") as guard:
            while True:
                fcntl.flock(guard, fcntl.LOCK_EX)
                try:
                    LOCK.mkdir()
                except FileExistsError:
                    try:
                        age, body = holder_age(LOCK)
                    except FileNotFoundError:
                        continue
                    if age > 90 * 60:
                        if "batch-start:" in body or "follow-up-owed:" in body or "recovery-needed:" in body:
                            raise Refusal(f"the expired landing holder has work to recover: {LOCK / 'holder.txt'}")
                        # Recheck under the stale-cleanup guard, and preserve anything rewritten meanwhile.
                        final_age, final_body = holder_age(LOCK)
                        if final_age > 90 * 60 and body == final_body:
                            shutil.rmtree(LOCK)
                        continue
                else:
                    try:
                        self.write()
                    except OSError:
                        shutil.rmtree(LOCK)
                        raise
                    return self
                finally:
                    fcntl.flock(guard, fcntl.LOCK_UN)
                say("Landing lock is held. Waiting five minutes.")
                time.sleep(300)

    def write(self):
        content = f"{self.agent} {self.branch} {now()}\ntoken: {self.token}\n"
        if self.owed:
            content += f"follow-up-owed: {self.owed}\n"
        if self.retain:
            content += "recovery-needed: yes\n"
        path = LOCK / f".holder-{self.token}.tmp"
        path.write_text(content, encoding="utf-8")
        path.replace(LOCK / "holder.txt")

    def heartbeat(self):
        body = (LOCK / "holder.txt").read_text(encoding="utf-8")
        if f"token: {self.token}" not in body.splitlines():
            raise Refusal(f"landing lock has changed owners: {LOCK / 'holder.txt'}")
        self.write()

    def __exit__(self, *_):
        self.heartbeat()
        if self.owed or self.retain:
            say(f"Landing lock retained for recovery. See {LOCK / 'holder.txt'}.")
        else:
            shutil.rmtree(LOCK)


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


def push_checked_main(folder, host, head, tree, base, touched, lock, plans_followup):
    """Publish only the verified commit. Roll back an unpublished shared fast-forward."""
    if git(SHARED, "symbolic-ref", "HEAD").stdout.strip() != MAIN_REF:
        raise Refusal("shared checkout must be on main")
    old_head = revision(SHARED, "HEAD^{commit}")
    git(SHARED, "merge-base", "--is-ancestor", old_head, base)
    git(SHARED, "merge-base", "--is-ancestor", base, head)
    if old_head != base:
        clean_touched(SHARED, changed_paths(SHARED, old_head, base))
    clean_touched(SHARED, touched)
    verify_over_ssh(folder, host, head, tree, base)
    lock.heartbeat()
    published = False
    try:
        git(SHARED, "merge", "--ff-only", "--no-overwrite-ignore", head)
        if revision(SHARED, "HEAD^{commit}") != head or revision(SHARED, "HEAD^{tree}") != tree:
            raise Refusal("shared fast-forward did not produce the checked commit and tree")
        shared_shards(folder, touched)
        verify_over_ssh(folder, host, head, tree, base)
        clean_touched(SHARED, touched)
        if revision(SHARED, "HEAD^{commit}") != head:
            raise Refusal("shared HEAD changed after the fast-forward")
        lock.heartbeat()
        # The lease makes the server require the same base even if its main moved after our fetch.
        # The ancestry check above makes the update itself a fast-forward.
        result = git(SHARED, "push", f"--force-with-lease={MAIN_REF}:{base}", "origin",
                     f"{head}:{MAIN_REF}", check=False)
        if result.returncode:
            try:
                git(SHARED, "fetch", "origin")
                published = full_main(SHARED) == head
            except Refusal:
                lock.retain = True
                raise
            if not published:
                if full_main(SHARED) != base:
                    return False
                raise Refusal(f"main push failed: {result.stderr.strip()}")
            say(f"Primary main reached {head}, but the push reported an error. "
                f"Check the configured push mirrors: {result.stderr.strip()}")
        published = True
        if plans_followup:
            lock.owed = head
            lock.heartbeat()
        say(f"Pushed main at {head}.")
        return True
    finally:
        if not published and revision(SHARED, "HEAD^{commit}") != old_head:
            try:
                git(SHARED, "reset", "--keep", "origin/main")
            except Refusal:
                lock.retain = True
                raise


def remove_topic(worktree, branch, head):
    git(worktree, "fetch", "origin")
    git(worktree, "merge-base", "--is-ancestor", head, ORIGIN_MAIN)
    if revision(worktree, "HEAD^{commit}") != head or status_paths(worktree):
        raise Refusal(f"topic worktree changed during landing. Inspect before removing {worktree}")
    common = Path(git(worktree, "rev-parse", "--path-format=absolute", "--git-common-dir").stdout.strip())
    git(common, "worktree", "remove", str(worktree))
    git(common, "branch", "-d", "--", branch)


def snapshot_followup(host, head, tree, lock, wait_for_review):
    branch = f"fix/landing-snapshot-{head[:12]}-{uuid.uuid4().hex[:8]}"
    folder = new_run(branch, head)
    try:
        start_remote_job(folder, host, "snapshot", head, tree, branch, heartbeat=lock.heartbeat)
        snapshot = read_json(folder / "snapshot-record.json")
    finally:
        cleanup_over_ssh(folder, host)
    candidate = sha(snapshot["head"], "snapshot commit")
    folder = new_run(branch, candidate)
    ref = check_ref(branch)
    try:
        record = checked_remote(folder, host, ref, candidate, snapshot["tree"], head, lock.heartbeat)
        require_same_inputs(snapshot["ignored_inputs"], record["ignored_inputs"], "after recording baseline")
        git(SHARED, "fetch", "origin", ref)
        if ref_at(SHARED, "origin", ref) != candidate:
            raise Refusal("the published snapshot follow-up branch changed during its check")
        code = check_judgments(folder, host, record, lock.heartbeat, wait_for_review)
        if code in (2, 3):
            say(f"Snapshot follow-up stopped at exit {code}. See {record['report']}.")
            return code
        git(SHARED, "fetch", "origin")
        if full_main(SHARED) != head:
            raise Refusal("origin/main moved before publishing the snapshot follow-up")
        touched = changed_paths(SHARED, head, candidate)
        if not push_checked_main(folder, host, candidate, snapshot["tree"], head, touched, lock, False):
            raise Refusal("origin/main moved before publishing the snapshot follow-up")
        lock.owed = ""
        lock.heartbeat()
        return code
    finally:
        cleanup_over_ssh(folder, host)


def live_run(args, root, ref):
    host = args.checks_on
    worktree = branch_worktree(root, ref)
    agent = args.agent or os.environ.get("USER")
    if not agent or not re.fullmatch(r"[A-Za-z0-9_.-]+", agent):
        raise Refusal("supply your landing name with --agent")
    with LandingLock(agent, args.branch) as lock:
        while True:
            lock.heartbeat()
            git(SHARED, "fetch", "origin")
            base = full_main(SHARED)
            head = rebase_and_push(worktree, ref, base)
            if head is None:
                say("origin/main changed while fetching. Fetching and rebasing again.")
                continue
            if head == base:
                say(f"The topic has no changes beyond main at {base}.")
                remove_topic(worktree, args.branch, head)
                return 0
            tree = revision(worktree, "HEAD^{tree}")
            folder = new_run(args.branch, head)
            try:
                record = checked_remote(folder, host, ref, head, tree, base, lock.heartbeat)
                git(SHARED, "fetch", "origin")
                if full_main(SHARED) != base:
                    say("origin/main moved during the checks. Fetching, rebasing and checking again.")
                    continue
                git(SHARED, "fetch", "origin", ref)
                if ref_at(SHARED, "origin", ref) != head:
                    raise Refusal(f"published topic branch changed after the check started: {ref}")
                code = check_judgments(folder, host, record, lock.heartbeat, args.wait_for_review)
                if code in (2, 3):
                    return code
                git(SHARED, "fetch", "origin")
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
                remove_topic(worktree, args.branch, head)
                return code
            finally:
                cleanup_over_ssh(folder, host)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True, metavar="{run,verify}")
    run = commands.add_parser("run", help="check a branch and land it under the landing lock")
    run.add_argument("branch")
    run.add_argument("--checks-on", choices=HOSTS, default="1070ti")
    run.add_argument("--dry-run", action="store_true", help="check and verify without locking or pushing")
    run.add_argument("--agent", help="name to record in the landing lock")
    run.add_argument("--wait-for-review", action="store_true",
                     help="wait for the lander to judge timeout reruns or changed baseline rows")
    verify = commands.add_parser("verify", help="rehash a completed remote run before fast-forwarding")
    verify.add_argument("record", type=Path)
    verify.add_argument("--commit", required=True)
    verify.add_argument("--base", required=True, help="full SHA of freshly fetched origin/main")
    remote = commands.add_parser("_remote")
    remote.add_argument("mode", choices=("check", "verify", "cleanup", "snapshot", "recheck"))
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
            if args.mode == "check":
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
            git(SHARED, "fetch", "origin")
            if full_main(SHARED) != args.base:
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
