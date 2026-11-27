#!/usr/bin/env python3
"""Check a published Puppet Master topic remotely and verify its receipt."""

from __future__ import annotations

import argparse
import ast
from collections import Counter
from datetime import datetime, timezone
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
from typing import Any, Collection, Optional, Sequence
import uuid

SHARED = Path("/mnt/Cursor/PuppetMaster")
EVIDENCE = SHARED.with_name("PuppetMaster-Evidence")
RUNS = EVIDENCE / "scratch/landing-remote"
CLONE = Path.home() / "src/PuppetMaster"
HOSTS = {"1070ti": "1070ti", "nas1": "nas1-agent"}
MACHINES = {"1070ti": "1070ti", "nas1": "ubuntu-agent-nas1"}
DEFAULT_HOST = "nas1"
SSH_FAILURE_LIMIT = 3
RAW_LINK = "tests/agent_packet_restrictions"
RAW_MANIFEST = "tests/fixtures/governance/raw_evidence_capture_modes.json"
READINESS = "Plans/.audits/event-authority-2026-08-13-currentness"
MAIN_REF = "refs/heads/main"
ORIGIN_MAIN = "refs/remotes/origin/main"
TIMEOUT = 1800
EXIT_LABELS = {0: "clear", 1: "findings to read", 2: "landing blocked", 3: "check could not run"}
# The rule's lock and batch state. holder.txt is the record: the batch lines are additive to it.
LOCK_DIR = EVIDENCE / "scratch/landing-lock"
HAND_RULE_SECONDS = 90 * 60
BATCH_MAX_LANDINGS = 4
BATCH_MAX_SECONDS = 2 * 60 * 60
# pm-landing-check.py, rule 2: the baseline counts as current while it is at most seven days older than the base.
BASELINE_FILE = "reports/landing-checks/baseline.json"
BASELINE_LIMIT_SECONDS = 7 * 24 * 60 * 60
BASELINE_MARGIN_SECONDS = 2 * 60 * 60  # a batch's base stays behind origin/main for up to its two hours
CHECK = ("python3", "-B", "scripts/pm-landing-check.py")
SHARD = ("python3", "-B", "scripts/pm-shard-plans.py", "--check", "--config",
         "Plans/sharding_config.json")
# Roots used by the aggregates, the separate migration check, and the PM7 build check.
# json-syntax gets its ordinary inputs from Git, with raw captures selected by the manifest.
IGNORED_INPUT_ROOTS = ("Plans", "reports", "scripts", "Concepts", "tests", ".puppet-master/project")
GUI_POLICY = "scripts/pm-gui-asset-policy.py"
PLAN_INPUT_EXTENSIONS = {".md", ".json", ".jsonl", ".yaml", ".yml", ".schema", ".py"}
FIXTURE_INPUT_EXTENSIONS = PLAN_INPUT_EXTENSIONS | {".txt", ".csv", ".tsv", ".html", ".css", ".js", ".svg"}
CONCEPT_ASSET_EXTENSIONS = {".gif", ".jpeg", ".jpg", ".otf", ".png", ".ttf", ".webp", ".woff", ".woff2"}
PM7_SOURCE = "Concepts/onboarding/opus-5.5/src"
CGROUP_FS_ROOT = Path("/sys/fs/cgroup")
CLEANUP_DRAIN_SECONDS = 2.0
CLEANUP_DRAIN_POLL = 0.1
PR_SET_CHILD_SUBREAPER = 36
PR_GET_CHILD_SUBREAPER = 37
ALIVE_SYSTEMD_STATES = frozenset({"active", "activating", "deactivating", "reloading", "refreshing"})


class Refusal(RuntimeError):
    """The landing preconditions could not be established."""


class TransportFailure(Refusal):
    """The remote job may still be active, so preserve its worktree and evidence."""


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def say(message: str) -> None:
    print(message, flush=True)


def command(argv, *, capture=True, check=True, input_text=None, env=None):
    result = subprocess.run(argv, check=False, text=True,
                            stdout=subprocess.PIPE if capture else None,
                            stderr=subprocess.PIPE if capture else None,
                            encoding="utf-8", errors="surrogateescape", input=input_text, env=env)
    if check and result.returncode:
        raise Refusal(f"{shlex.join(map(str, argv))} exited {result.returncode}"
                      + (f": {result.stderr.strip()}" if result.stderr else ""))
    return result


def git(root, *args, check=True, env=None):
    return command(["git", "--no-optional-locks", "-C", str(root), *args], check=check, env=env)


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


def raw_paths(worktree, tracked, commit):
    manifest = json.loads(tracked_text(worktree, RAW_MANIFEST, tracked, commit))
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


def tracked_text(worktree, name, tracked, commit):
    if name not in tracked:
        return ""
    if commit:
        return git(worktree, "show", f"{commit}:{name}").stdout
    return (worktree / name).read_text(encoding="utf-8", errors="surrogateescape")


def declared_refs(text):
    try:
        content = json.loads(text)
    except (ValueError, UnicodeError):
        # The validator reports malformed bytes from the bound input itself.
        return {}
    return content if isinstance(content, dict) else {}


def closure_inputs(text):
    """The registry names decision inputs through whole-file and anchored references."""
    refs = set()
    for line in text.splitlines():
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


def declared_input_paths(root, worktree, ignored, tracked, commit):
    """Find exact hash targets, including artifacts whose extension is not scanned."""
    targets = set()

    def declaration(name):
        path = root / name
        if name in ignored or name == f"{READINESS}/VALIDATOR_RECEIPT.json":
            return path.read_text(encoding="utf-8", errors="surrogateescape") if path.is_file() else ""
        return tracked_text(worktree, name, tracked, commit)

    readiness = declared_refs(declaration(f"{READINESS}/VALIDATOR_RECEIPT.json")).get("artifact_hashes")
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
    evidence = (name for name in tracked | ignored
                if within(name, "Plans/.evidence") and PurePosixPath(name).name == "evidence.json")
    for name in evidence:
        artifacts = declared_refs(declaration(name)).get("artifacts")
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


def gui_policy_rules(worktree, tracked, commit):
    """The checked GUI validator's literal path rules, read without executing that tree."""
    source = tracked_text(worktree, GUI_POLICY, tracked, commit)
    if not source:
        return None
    names = {"SOURCE_ROOTS", "SOURCE_EXTENSIONS", "EXCLUDED_DIRS"}
    return {target.id: ast.literal_eval(row.value) for row in ast.parse(source).body
            if isinstance(row, ast.Assign) for target in row.targets
            if isinstance(target, ast.Name) and target.id in names}


def gui_selected(name, rules):
    path = PurePosixPath(name)
    if path.suffix.lower() not in rules["SOURCE_EXTENSIONS"]:
        return False
    for root in rules["SOURCE_ROOTS"]:
        prefix = PurePosixPath(root).parts
        if path.parts[:len(prefix)] == prefix and not rules["EXCLUDED_DIRS"].intersection(path.parts[len(prefix):]):
            return True
    return False


def copies(root, worktree, tracked, commit):
    gui_rules = gui_policy_rules(worktree, tracked, commit)
    roots = [*IGNORED_INPUT_ROOTS, *(gui_rules["SOURCE_ROOTS"] if gui_rules else [])]
    found = git(root, "ls-files", "--others", "--ignored", "--exclude-standard",
                "-z", "--", *roots).stdout
    ignored = set(found.split("\0")) - {""} - tracked
    selected = {name for name in ignored if
                any(within(name, input_root) for input_root in IGNORED_INPUT_ROOTS)
                and (not within(name, "tests") or within(name, "tests/fixtures")) and selected_ignored_input(name)}
    if gui_rules:
        selected.update(name for name in ignored if gui_selected(name, gui_rules))
    references = declared_input_paths(root, worktree, ignored, tracked, commit)
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


def tracklist(worktree, commit=None):
    args = ("ls-tree", "-r", "--name-only", "-z", commit) if commit else ("ls-files", "-z")
    paths = git(worktree, *args).stdout
    return set(paths.split("\0")) - {""}


def input_stat(path):
    try:
        info = path.lstat()
    except (FileNotFoundError, NotADirectoryError):
        return None
    return info.st_size, info.st_mtime_ns, info.st_ino


def input_manifest(root, worktree, tracked, commit=None, *, before_hash=None):
    def remember(name):
        if before_hash is not None:
            before_hash[name] = input_stat(root / name)

    manifest = {}
    for name in sorted(copies(root, worktree, tracked, commit)):
        remember(name)
        manifest[name] = regular_hash(root, name)
    link = root / RAW_LINK
    remember(RAW_LINK)
    if not link.is_symlink() or not link.is_dir():
        raise Refusal(f"missing or invalid raw evidence link: {link}")
    target = link.resolve(strict=True)
    if not target.is_relative_to(EVIDENCE.resolve(strict=True)):
        raise Refusal(f"raw evidence link leaves the evidence share: {link} -> {target}")
    manifest[RAW_LINK] = f"symlink:{target}"
    for name in sorted(raw_paths(worktree, tracked, commit)):
        remember(name)
        manifest[name] = regular_hash(root, name, through_raw_link=True)
    return manifest


def guarded_input_manifest(root, candidate):
    tracked = tracklist(root, candidate)
    for attempt in range(2):
        before_hash = {}
        try:
            manifest = input_manifest(root, root, tracked, candidate, before_hash=before_hash)
        except (OSError, Refusal):
            if attempt == 0 and any(input_stat(root / name) != saved for name, saved in before_hash.items()):
                continue
            raise
        # Revisit earlier files too: a writer can replace one after it was hashed.
        changed = sorted(name for name, saved in before_hash.items() if input_stat(root / name) != saved)
        if not changed:
            return manifest
    raise Refusal("shared publication ignored inputs changed during the re-scan: " + ", ".join(changed))


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


def capture(argv, cwd, stdout, stderr):
    start = time.monotonic()
    with stdout.open("wb") as out, stderr.open("wb") as err:
        code = subprocess.run(argv, cwd=cwd, stdout=out, stderr=err, check=False,
                              env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}).returncode
    return code, round(time.monotonic() - start, 2)


def ssh(host, *argv, capture_output=True, check=True, input_text=None):
    return command(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15",
                    "-o", "ServerAliveInterval=30", "-o", "ServerAliveCountMax=3", HOSTS[host],
                    shlex.join(map(str, argv))], capture=capture_output, check=check, input_text=input_text)


def new_run(branch, commit):
    RUNS.mkdir(parents=True, exist_ok=True)
    slug = re.sub(r"[^a-z0-9_.-]", "-", branch.lower())
    digest = hashlib.sha256(os.fsencode(branch)).hexdigest()[:8]
    label = f"{slug[:17]}-{digest}"
    folder = RUNS / f"{label}-{commit[:12]}-{uuid.uuid4().hex[:12]}"
    folder.mkdir(mode=0o700)
    shutil.copyfile(Path(__file__).resolve(), folder / "worker.py")
    return folder


def full_main(root):
    return sha(revision(root, ORIGIN_MAIN + "^{commit}"), "fetched origin/main")


def check_ref(branch):
    if branch == "HEAD" or branch.startswith("-"):
        raise Refusal(f"expected a branch name: {branch}")
    result = command(["git", "check-ref-format", f"refs/heads/{branch}"], check=False)
    if result.returncode:
        raise Refusal(f"invalid branch name: {branch}")
    return f"refs/heads/{branch}"


def changed_paths(root, base, head):
    return set(git(root, "diff", "--no-ext-diff", "--no-renames", "--name-only",
                   "-z", base, head, "--").stdout.rstrip("\0").split("\0")) - {""}


def status_paths(root):
    fields = iter(git(root, "status", "--porcelain=v1", "-z", "--ignore-submodules=none",
                      "--untracked-files=all").stdout.split("\0"))
    tracked, untracked = set(), set()
    for entry in fields:
        if entry:
            paths = untracked if entry.startswith("?? ") else tracked
            paths.add(entry[3:].rstrip("/"))
            if any(flag in "RC" for flag in entry[:2]):
                paths.add(next(fields).rstrip("/"))
    return tracked, untracked


def overlaps(changed, touched):
    touched_parents = {str(parent) for name in touched for parent in PurePosixPath(name).parents}
    return sorted(name for name in changed if name in touched or name in touched_parents or any(
        str(parent) in touched for parent in PurePosixPath(name).parents))


def affects_shared_check(name, gui_rules=None):
    # The aggregates also parse tracked and visible JSON/JSONL outside these roots, and the
    # GUI validator scans its own source roots, including visible untracked files there.
    return (any(within(name, root) for root in IGNORED_INPUT_ROOTS)
            or PurePosixPath(name).suffix.lower() in {".json", ".jsonl"}
            or name in {".gitignore", ".gitattributes", "AGENTS.md"}
            or (gui_rules is not None and gui_selected(name, gui_rules)))


def hidden_index_paths(root):
    return {entry[2:] for entry in git(root, "ls-files", "-v", "-z").stdout.split("\0")
            if entry and (entry[0] == "S" or entry[0].islower())}


def require_clean_shared_tracked(root):
    hidden = hidden_index_paths(root)
    tracked, _ = status_paths(root)
    dirty = sorted(tracked | hidden)
    if dirty:
        raise Refusal("shared checkout has uncommitted changes or hidden index flags: " + ", ".join(dirty))


def require_clean_shared_checkout(root, touched, gui_rules=None):
    hidden = hidden_index_paths(root)
    tracked, untracked = status_paths(root)
    untracked_inputs = {name for name in untracked if affects_shared_check(name, gui_rules)}
    dirty = sorted(tracked | hidden | untracked_inputs | set(overlaps(untracked, touched)))
    if dirty:
        raise Refusal("shared checkout has uncommitted changes or hidden index flags: " + ", ".join(dirty))


def require_clean_shared_index(root):
    # reset --keep can discard staged bytes even outside the rollback paths.
    output = git(root, "diff", "--cached", "--name-only", "--no-renames", "--no-ext-diff",
                 "--ignore-submodules=none", "--ita-visible-in-index", "-z", "HEAD", "--").stdout
    staged = sorted(set(output.split("\0")) - {""})
    if staged:
        tracked, _ = status_paths(root)
        extras = sorted((tracked | hidden_index_paths(root)) - set(staged))
        detail = f"; uncommitted changes or hidden index flags: {', '.join(extras)}" if extras else ""
        raise Refusal("shared checkout has staged changes: " + ", ".join(staged) + detail)


def added_paths(root, before, after):
    output = git(root, "diff", "--name-only", "--no-renames", "--diff-filter=A", "-z",
                 "--ignore-submodules=none", before, after, "--").stdout
    return set(output.split("\0")) - {""}


def publication_preflight(root, base, candidate, expected_inputs):
    """Re-read shared checker inputs at the guarded publication boundary."""
    require_clean_shared_index(root)
    touched = changed_paths(root, base, candidate)
    head = revision(root, "HEAD^{commit}")
    if head not in (base, candidate):
        # A shared checkout behind the checked base also fast-forwards through these paths.
        touched |= changed_paths(root, head, base)
    gui_rules = gui_policy_rules(root, tracklist(root, candidate), candidate)
    require_clean_shared_checkout(root, touched, gui_rules)
    if head != candidate:
        present = set()
        for name in added_paths(root, head, candidate):
            path = PurePosixPath(name)
            if os.path.lexists(root / path):
                present.add(name)
            present.update(str(parent) for parent in path.parents if
                           (root / parent).is_symlink() or (root / parent).is_file())
        if present:
            collisions = git(root, "--literal-pathspecs", "ls-files", "--others", "--ignored", "--exclude-standard",
                             "-z", "--", *sorted(present)).stdout.split("\0")
            if any(collisions):
                raise Refusal("candidate would overwrite ignored files: " + ", ".join(sorted(filter(None, collisions))))
    require_same_inputs(expected_inputs, guarded_input_manifest(root, candidate), "shared publication")
    require_clean_shared_index(root)
    require_clean_shared_checkout(root, touched, gui_rules)


def verify_rollback(candidate, target):
    """Protect local files before a hand lander resets to the fetched primary tip."""
    candidate = sha(candidate, "unpublished candidate")
    target = sha(target, "fetched rollback target")
    root = SHARED
    if git(root, "symbolic-ref", "--quiet", "HEAD", check=False).stdout.strip() != MAIN_REF:
        raise Refusal("shared checkout must be on main")
    if revision(root, "HEAD^{commit}") != candidate:
        raise Refusal(f"shared HEAD is not the rollback candidate {candidate}")
    if full_main(root) != target:
        raise Refusal(f"fetched origin/main is not the rollback target {target}")
    if is_ancestor(root, candidate, target):
        raise Refusal(f"candidate {candidate} is already in fetched origin/main")

    require_clean_shared_index(root)
    require_clean_shared_tracked(root)
    tracked = tracklist(root, candidate)
    collisions = set()
    for name in added_paths(root, candidate, target):
        path = PurePosixPath(name)
        for part in (*reversed(path.parents), path):
            try:
                mode = (root / part).lstat().st_mode
            except FileNotFoundError:
                break
            if part == path or not stat.S_ISDIR(mode):
                if str(part) not in tracked:
                    collisions.add(str(part))
                break
    if collisions:
        raise Refusal("rollback would overwrite local paths: " + ", ".join(sorted(collisions)))
    require_clean_shared_index(root)
    require_clean_shared_tracked(root)
    say(f"Verified rollback paths from {candidate} to {target}.")
    return 0


def push_targets(root: Path) -> list[tuple[list[str], str]]:
    """List each push URL once with the names of all remotes that use it.

    Git lists remote names alphabetically and resolves each remote's push URLs in order.
    Shared URLs need only one push and verification.
    """
    by_url: dict[str, list[str]] = {}
    for name in git(root, "remote").stdout.split():
        urls = git(root, "remote", "get-url", "--push", "--all", name).stdout.splitlines()
        for url in dict.fromkeys(urls):
            by_url.setdefault(url, []).append(name)
    return [(names, url) for url, names in by_url.items()]


def require_literal_push_target(root: Path, probe: str, url: str) -> None:
    """Check how Git will interpret an already resolved URL when passed as a destination."""
    if git(root, "remote", "get-url", "--", url, check=False).returncode == 0:
        raise Refusal(f"push target {url!r} also names a Git remote; use an unambiguous URL")
    fetch_url = git(root, "ls-remote", "--get-url", "--", url).stdout.splitlines()
    # Older Git does not clear configured URLs with empty overrides. A fresh remote
    # exposes the push rewrite for this URL without contacting the remote.
    rows = git(root, "-c", f"remote.{probe}.url={url}", "remote", "-v",
               env={**os.environ, "LC_ALL": "C"}).stdout.splitlines()
    prefix, suffix = f"{probe}\t", " (push)"
    push_urls = [row.removeprefix(prefix).removesuffix(suffix)
                 for row in rows if row.startswith(prefix) and row.endswith(suffix)]
    if push_urls != [url] or fetch_url != [url]:
        raise Refusal(f"Git would rewrite push target {url!r} when publishing by URL "
                      f"(push: {push_urls!r}, readback: {fetch_url!r}); check the URL rewrite rules")


def pushed_main(root: Path, url: str) -> Optional[str]:
    """The published main at one push target, read without updating any local ref; None when it has none."""
    for line in git(root, "ls-remote", "--refs", "--", url, MAIN_REF).stdout.splitlines():
        value, _, ref = line.partition("\t")
        if ref == MAIN_REF:
            return sha(value, f"main on {url}")
    return None


def update_publish_tracking_refs(root: Path, names: Collection[str], verified_urls: Collection[str],
                                 commit: str) -> None:
    """Advance tracking refs for verified fetch endpoints without overwriting concurrent updates."""
    for name in sorted(names):
        fetch = git(root, "remote", "get-url", "--", name, check=False)
        if fetch.returncode or fetch.stdout.rstrip("\n") not in verified_urls:
            say(f"fetch {name} before the next verify")
            continue
        ref = f"refs/remotes/{name}/main"
        previous = git(root, "rev-parse", "--verify", "--quiet", ref, check=False).stdout.strip()
        if previous == commit:
            continue
        if previous and not is_ancestor(root, previous, commit):
            raise Refusal(f"{ref} at {previous} cannot fast-forward to {commit}; inspect the tracking ref")
        git(root, "update-ref", "--no-deref", ref, commit, previous or "0" * len(commit))


def behind_publish_target(root: Path, url: str, tip: Optional[str], lease: str) -> Optional[str]:
    """Suggest a manual fast-forward only when the failed target is provably behind the lease."""
    try:
        if tip is None or tip == lease or not is_ancestor(root, tip, lease):
            return None
    except Refusal:
        # A tip whose commit is unknown locally cannot be classified as behind.
        return None
    repair = shlex.join(["git", "-C", str(root.resolve()), "push", "--no-follow-tags",
                         f"--force-with-lease={MAIN_REF}:{tip}",
                         "--", url, f"{lease}^{{commit}}:{MAIN_REF}"])
    return f"main at {tip} is behind publication lease {lease}. One-time catch-up:\n{repair}"


def publish_main(root: Path, lease: str, commit: str) -> int:
    """Push the landed SHA to every configured push target under the verify lease, and verify each.

    The hand-push workflow only verified origin's fetch URL. Read main at every push target
    before reporting publication complete.
    """
    for label, value in (("publication lease", lease), ("landed commit", commit)):
        sha(value, label)
        result = git(root, "--no-replace-objects", "cat-file", "-t", value, check=False)
        if result.returncode or result.stdout.strip() != "commit":
            raise Refusal(f"{label} is not a commit in {root}: {value!r}")
    if not is_ancestor(root, lease, commit):
        raise Refusal(f"publication lease {lease} is not an ancestor of landed commit {commit}: rebase on "
                      "the pinned main and check again, so the push is a fast-forward")
    local_main = revision(root, MAIN_REF)
    if commit != local_main:
        raise Refusal(f"landed commit {commit} differs from {MAIN_REF} at {local_main} in {root}")
    targets = push_targets(root)
    if not targets:
        raise Refusal(f"no push targets are configured for {root}: add a remote before publishing")
    remote_names = {name for names, _ in targets for name in names}
    probe = "pm-land-push-probe"
    while probe in remote_names:
        probe += "-"
    for _, url in targets:
        require_literal_push_target(root, probe, url)
    destinations = [(f"remote {', '.join(names)} ({url})", url) for names, url in targets]
    say("Push targets:\n" + "\n".join(f"  {label}" for label, _ in destinations))
    push_errors: dict[str, str] = {}
    for label, url in destinations:
        # The commit expression keeps a ref named after the object ID from shadowing it.
        result = git(root, "push", "--no-follow-tags", f"--force-with-lease={MAIN_REF}:{lease}",
                     "--", url, f"{commit}^{{commit}}:{MAIN_REF}", check=False)
        if result.returncode:
            push_errors[url] = (f"{label}: push exited {result.returncode}"
                                + (f": {result.stderr.strip()}" if result.stderr.strip() else ""))

    failures: list[str] = []
    warnings: list[str] = []
    verified: dict[str, str] = {}
    for label, url in destinations:
        push_error = push_errors.get(url)
        try:
            tip = pushed_main(root, url)
        except Refusal as exc:
            if push_error:
                failures.append(push_error)
            failures.append(f"{label}: could not verify main: {exc}")
            continue
        if tip == commit:
            verified[url] = f"Published {tip} to {label}: main verified"
            if push_error:
                warnings.append(f"Warning, main verified despite a push error: {push_error}")
            continue
        if push_error:
            failures.append(push_error)
        failures.append(f"{label}: main is {tip or 'missing'}; expected {commit}")
        if push_error and (repair := behind_publish_target(root, url, tip, lease)):
            failures.append(f"{label}: {repair}")
    if not failures:
        try:
            update_publish_tracking_refs(root, remote_names, verified, commit)
        except Refusal as exc:
            failures.append(f"could not update local tracking refs: {exc}")
    if failures:
        report = ["publishing the landed commit to every push target failed:", *failures, *warnings]
        if verified:
            report.extend(["Verified targets:", *verified.values(),
                           "the landed targets are published; fix the failing one and rerun publish "
                           "with the same arguments (landed targets report up to date)"])
        raise Refusal("\n".join(report))
    for warning in warnings:
        print(warning, file=sys.stderr)
    for line in verified.values():
        say(line)
    return 0


def is_ancestor(root, earlier, later):
    result = git(root, "merge-base", "--is-ancestor", earlier, later, check=False)
    if result.returncode not in (0, 1):
        raise Refusal(f"cannot compare Git commits {earlier} and {later}: {result.stderr.strip()}")
    return result.returncode == 0


def origin_refs(root, *refs):
    """Read the published tips without updating any local refs."""
    expected = set(refs)
    tips = {}
    for line in git(root, "ls-remote", "--refs", "origin", *sorted(expected)).stdout.splitlines():
        value, _, ref = line.partition("\t")
        if ref not in expected or ref in tips:
            raise Refusal(f"unexpected origin ref in listing: {line}")
        tips[ref] = sha(value, ref)
    if missing := expected - tips.keys():
        raise Refusal("origin did not publish: " + ", ".join(sorted(missing)))
    return tips


def worktree_path(folder):
    return Path.home() / "pm-worktrees" / f"landing-remote-{folder.name}"


def owner_file(worktree):
    git_dir = revision_metadata(worktree, "--git-dir")
    return git_dir / "pm-land-check-owner"


def proc_file(worktree):
    return revision_metadata(worktree, "--git-dir") / "pm-land-check-proc.json"


def long_job_state_root():
    if os.environ.get("LONG_JOB_HOME"):
        return Path(os.environ["LONG_JOB_HOME"]).expanduser()
    if os.environ.get("XDG_STATE_HOME"):
        return Path(os.environ["XDG_STATE_HOME"]) / "long-job"
    return Path.home() / ".local" / "state" / "long-job"


def read_proc_stat(pid):
    try:
        text = Path(f"/proc/{pid}/stat").read_text(encoding="utf-8", errors="replace")
        fields = text.rsplit(")", 1)[1].split()
        return {"state": fields[0], "ppid": int(fields[1]), "pgid": int(fields[2]),
                "sid": int(fields[3]), "start": fields[19]}
    except (OSError, IndexError, ValueError):
        return None


def proc_alive_as(pid, start):
    if type(pid) is not int or pid <= 0 or not isinstance(start, str) or not start.isdigit():
        return False
    info = read_proc_stat(pid)
    return info is not None and info["start"] == start and info["state"] not in ("Z", "X")


def current_cgroup():
    try:
        lines = Path("/proc/self/cgroup").read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return ""
    fallback = ""
    for line in lines:
        parts = line.split(":", 2)
        if len(parts) != 3:
            continue
        if parts[0] == "0" and parts[1] == "":
            return parts[2]
        if parts[1] == "name=systemd" and not fallback:
            fallback = parts[2]
    return fallback


def enable_child_subreaper():
    if sys.platform != "linux":
        return False
    try:
        import ctypes
        libc = ctypes.CDLL("libc.so.6", use_errno=True)
        if libc.prctl(PR_SET_CHILD_SUBREAPER, 1, 0, 0, 0) != 0:
            return False
        value = ctypes.c_int(0)
        if libc.prctl(PR_GET_CHILD_SUBREAPER, ctypes.byref(value), 0, 0, 0) != 0:
            return False
        return value.value == 1
    except (OSError, AttributeError):
        return False


def reap_children():
    reaped = 0
    while True:
        try:
            pid, _ = os.waitpid(-1, os.WNOHANG)
        except ChildProcessError:
            break
        if pid <= 0:
            break
        reaped += 1
    return reaped


def worker_live_children():
    task_dir = Path("/proc/self/task")
    if not task_dir.is_dir():
        return None, "cannot read /proc/self/task"
    my_pid = os.getpid()
    alive = []
    for _ in range(10):
        reaped = reap_children()
        child_pids = set()
        read_any = False
        try:
            task_entries = list(task_dir.iterdir())
        except OSError as exc:
            return None, f"cannot list /proc/self/task: {exc}"
        for entry in task_entries:
            children_path = entry / "children"
            try:
                text = children_path.read_text(encoding="utf-8")
            except FileNotFoundError:
                continue
            except OSError as exc:
                return None, f"cannot read {children_path}: {exc}"
            read_any = True
            for token in text.split():
                if token.isdigit():
                    child_pids.add(int(token))
        if not read_any:
            return None, "no readable /proc/self/task/*/children files"
        try:
            proc_entries = os.listdir("/proc")
        except OSError as exc:
            return None, f"cannot list /proc: {exc}"
        for name in proc_entries:
            if name.isdigit():
                info = read_proc_stat(int(name))
                if info is not None and info["ppid"] == my_pid and info["state"] not in ("Z", "X"):
                    child_pids.add(int(name))
        alive = []
        for pid in sorted(child_pids):
            info = read_proc_stat(pid)
            if info is None:
                continue
            if info["state"] in ("Z", "X"):
                reaped += reap_children()
                continue
            alive.append({"pid": pid, "start": info["start"]})
        if alive or reaped == 0:
            return alive, None
    return alive, None


def revision_metadata(root, option):
    return Path(git(root, "rev-parse", "--path-format=absolute", option).stdout.strip())


def receipt_witness(folder):
    # This belongs to the checking host's clone and survives disposal of the temporary checkout.
    return revision_metadata(CLONE, "--git-common-dir") / "pm-land-check-receipts" / f"{folder.name}.sha256"


def cleanup_receipt(folder):
    return folder / "cleanup-receipt.json"


def prepare_remote(folder, ref, head, tree, base, main=None):
    branch = ref.removeprefix("refs/heads/")
    if check_ref(branch) != ref:
        raise Refusal(f"invalid pinned topic ref: {ref}")
    sha(head, "target commit")
    sha(tree, "target tree")
    sha(base, "checked base")
    main = base if main is None else sha(main, "fetched origin/main")
    refs = tuple(dict.fromkeys((MAIN_REF, ref)))
    git(CLONE, "fetch", "--no-tags", "--no-write-fetch-head", "--refmap=", "origin", *refs)
    tips = origin_refs(CLONE, *refs)
    if tips[ref] != head:
        raise Refusal(f"published topic {ref} moved before remote checkout: {head} -> {tips[ref]}")
    if tips[MAIN_REF] != main:
        raise Refusal(f"origin/main moved before remote checkout: {main} -> {tips[MAIN_REF]}")
    if not is_ancestor(CLONE, base, main):
        raise Refusal(f"checked base {base} is not on origin/main {main}")
    git(CLONE, "merge-base", "--is-ancestor", base, head)
    root = worktree_path(folder)
    root.parent.mkdir(parents=True, exist_ok=True)
    if os.path.lexists(root):
        raise Refusal(f"remote worktree path is already in use: {root}")
    git(CLONE, "worktree", "add", "--detach", str(root), head)
    owner_file(root).write_text(folder.name + "\n", encoding="ascii")
    require_clean_full(root, head, tree)
    manifest = copy_inputs(SHARED, root)
    require_clean_full(root, head, tree)
    return root, manifest


def remote_check(folder, host, ref, head, tree, base, main=None, rows=False):
    subreaper = enable_child_subreaper()
    root, inputs = prepare_remote(folder, ref, head, tree, base, main)
    my_stat = read_proc_stat(os.getpid())
    proc_meta = {
        "folder": folder.name,
        "worktree": os.path.realpath(root),
        "worker_pid": os.getpid(),
        "worker_start": my_stat["start"] if my_stat else None,
        "pgid": os.getpgid(0),
        "sid": os.getsid(0),
        "uid": os.getuid(),
        "cgroup": current_cgroup(),
        "long_job_dir": os.environ.get("LONG_JOB_DIR"),
        "long_job_attempt": os.environ.get("LONG_JOB_ATTEMPT"),
        "subreaper": subreaper,
        "descendants_proven_ended": False,
        "surviving_descendants": [],
    }
    write_json(proc_file(root), proc_meta)
    previous_run_id = os.environ.get("PM_LAND_RUN_ID")
    os.environ["PM_LAND_RUN_ID"] = folder.name
    try:
        shard, shard_seconds = capture(SHARD, root, folder / "shards.json", folder / "shards.stderr")
        started = now()
        report = folder / "landing-check.json"
        row_report = folder / "rows.json"
        args = [*CHECK, "--base", base, "--subcheck-timeout-seconds", str(TIMEOUT), "--json",
                "--readiness-audit-root", str(root / READINESS),
                "--keep-check-reports", str(folder / "subchecks")]
        if rows:
            args += ["--row-report", str(row_report)]
        code, seconds = capture(args, root, report, folder / "landing-check.stderr")
        ended = now()
    finally:
        if previous_run_id is None:
            os.environ.pop("PM_LAND_RUN_ID", None)
        else:
            os.environ["PM_LAND_RUN_ID"] = previous_run_id
    report_digest = file_hash(report)
    validate_check_report(report, head, base, code)
    require_clean_full(root, head, tree)
    require_same_inputs(inputs, guarded_input_manifest(root, head), "remote checkout after the check")
    require_clean_full(root, head, tree)
    if file_hash(report) != report_digest:
        raise Refusal(f"landing check report changed before its receipt was recorded: {report}")
    if rows and code in (0, 1):
        if not row_report.is_file():
            raise Refusal(f"the landing check was asked for a row report and wrote none: {row_report}")
        row_digest = file_hash(row_report)
        if not read_row_report(row_report):
            raise Refusal(f"the landing check's row report is not the schema a batch reads: {row_report}")
    else:
        row_report, row_digest = None, None

    path = folder / "record.json"
    write_json(path, {"schema": 2, "host": host, "machine": socket.gethostname(), "topic": ref,
                      "head": head, "tree": tree, "base": base, "worktree": str(root),
                      "full": True, "clean": True, "job": job_name(folder), "argv": args,
                      "exit_code": code, "report": str(report), "report_sha256": report_digest,
                      "started_utc": started, "ended_utc": ended, "check_seconds": seconds,
                      "cleanup_receipt": str(cleanup_receipt(folder)),
                      "row_report": str(row_report) if row_report else None, "row_report_sha256": row_digest,
                      "shard_exit_code": shard, "shard_seconds": shard_seconds, "ignored_inputs": inputs})
    witness = receipt_witness(folder)
    witness.parent.mkdir(mode=0o700, exist_ok=True)
    with witness.open("x", encoding="ascii") as stream:
        stream.write(file_hash(path) + "\n")

    alive, check_err = worker_live_children()
    proc_meta["surviving_descendants"] = alive or []
    if check_err:
        proc_meta["descendant_check_error"] = check_err
    proc_meta["descendants_proven_ended"] = bool(subreaper and check_err is None and alive == [])
    write_json(proc_file(root), proc_meta)


def verify_record(folder, record, host, ref, head, tree, base):
    if not isinstance(record, dict):
        raise Refusal("receipt is not a JSON object")
    for key, expected in {"schema": 2, "host": host, "machine": MACHINES[host], "topic": ref,
                          "head": head, "tree": tree, "base": base, "job": job_name(folder)}.items():
        if record.get(key) != expected:
            raise Refusal(f"receipt {key} is {record.get(key)!r}; expected {expected!r}")
    for key, label in (("head", "commit"), ("tree", "tree"), ("base", "checked base")):
        sha(record.get(key), label)
    if record.get("full") is not True or record.get("clean") is not True:
        raise Refusal("receipt does not attest to a clean full remote worktree")
    if type(record.get("shard_exit_code")) is not int:
        raise Refusal("receipt has no recorded shard check exit")
    if not isinstance(record.get("ignored_inputs"), dict):
        raise Refusal("receipt has no ignored input inventory")
    report = folder / "landing-check.json"
    if record.get("report") != str(report) or file_hash(report) != record.get("report_sha256"):
        raise Refusal(f"landing check report path or SHA-256 changed: {report}")
    recorded_rows = record.get("row_report")
    if recorded_rows is not None:
        rows = folder / "rows.json"
        if recorded_rows != str(rows) or not rows.is_file() or file_hash(rows) != record.get("row_report_sha256"):
            raise Refusal(f"landing check row report path or SHA-256 changed: {recorded_rows}")
    start = datetime.fromisoformat(record["started_utc"])
    end = datetime.fromisoformat(record["ended_utc"])
    if start.utcoffset() is None or end.utcoffset() is None or end < start:
        raise Refusal("receipt check times are missing their offset or out of order")
    validate_check_report(report, head, base, record.get("exit_code"))


def require_owned_worktree(root, folder):
    if root.is_symlink() or not root.is_dir() or owner_file(root).read_text(encoding="ascii").strip() != folder.name:
        raise Refusal(f"cannot establish ownership of remote worktree: {root}")


def remote_verify(folder, digest):
    """Check the host's independent witness and inspect a worktree that still exists."""
    raw = (folder / "record.json").read_bytes()
    if digest != hashlib.sha256(raw).hexdigest() or digest != receipt_witness(folder).read_text().strip():
        raise Refusal(f"remote receipt SHA-256 changed or its witness disagrees: {folder / 'record.json'}")
    record = json.loads(raw)
    root = worktree_path(folder)
    if record.get("worktree") != str(root):
        raise Refusal(f"receipt identifies a different remote worktree: {record.get('worktree')}")
    if os.path.lexists(root):
        require_owned_worktree(root, folder)
        require_clean_full(root, record["head"], record["tree"])
        require_same_inputs(record["ignored_inputs"], guarded_input_manifest(root, record["head"]), "remote checkout")
        require_clean_full(root, record["head"], record["tree"])


def preserve_remote_copy(folder, host, state, reason=None):
    root = worktree_path(folder)
    name = job_name(folder)
    notice = f"preserved remote copy: {host}:{root} (job {name}, state {state})"
    remote_command = shlex.join(["git", "-C", str(CLONE), "worktree", "remove", "--force", str(root)])
    removal = shlex.join(["ssh", HOSTS[host], remote_command])
    path = cleanup_receipt(folder)
    say(notice)
    if reason:
        say(f"Reason: {reason}")
    say(f"Remove by hand once nothing uses it: {removal}")
    payload = {"host": host, "worktree": str(root), "job": name, "state": state,
               "preserved_remote_copy": notice, "remove_by_hand": removal}
    if reason:
        payload["reason"] = reason
    try:
        # A job can fail before producing a checker receipt. Keep this separate from its witnessed bytes.
        write_json(path, payload)
    except OSError as exc:
        say(f"Could not write cleanup receipt {path}: {exc}")
    else:
        say(f"Cleanup receipt: {path}")


def remote_job_status(name):
    result = command(["long-job", "status", name, "--json"], check=False)
    if result.returncode:
        return {}
    try:
        info = json.loads(result.stdout)
    except ValueError:
        return {}
    if (not isinstance(info, list) or len(info) != 1 or not isinstance(info[0], dict)
            or info[0].get("name") != name):
        return {}
    return info[0]


def cgroup_procs_in(cgroup_path):
    if not isinstance(cgroup_path, str) or not cgroup_path.startswith("/"):
        return None, f"invalid cgroup path: {cgroup_path!r}"
    posix = PurePosixPath(cgroup_path)
    if ".." in posix.parts or cgroup_path == "/":
        return None, f"unsafe cgroup path: {cgroup_path!r}"
    base = CGROUP_FS_ROOT / cgroup_path.lstrip("/")
    if not base.exists() and not (CGROUP_FS_ROOT / "cgroup.controllers").exists():
        legacy = CGROUP_FS_ROOT / "systemd" / cgroup_path.lstrip("/")
        if legacy.exists():
            base = legacy
    if not base.exists():
        return [], None
    pids = set()
    try:
        for dirpath, _, filenames in os.walk(base):
            if "cgroup.procs" not in filenames:
                continue
            procs_path = Path(dirpath) / "cgroup.procs"
            try:
                content = procs_path.read_text(encoding="utf-8")
            except FileNotFoundError:
                continue
            except OSError as exc:
                return None, f"cannot read {procs_path}: {exc}"
            for line in content.splitlines():
                token = line.strip()
                if token.isdigit():
                    pids.add(int(token))
    except FileNotFoundError:
        return [], None
    except OSError as exc:
        return None, f"cannot walk cgroup {base}: {exc}"
    return sorted(pids), None


def systemd_unit_ended(unit, recorded_cgroup=""):
    if not isinstance(unit, str) or not unit or unit.startswith("-"):
        return False, False, "unverified-processes", "missing systemd unit name"
    result = command(["systemctl", "--user", "show", unit,
                      "-p", "LoadState", "-p", "ActiveState", "-p", "SubState", "-p", "ControlGroup"],
                     check=False)
    if result.returncode != 0:
        return False, False, "unverified-processes", f"systemctl show {unit} exited {result.returncode}"
    props = {}
    for line in result.stdout.splitlines():
        key, sep, value = line.partition("=")
        if sep:
            props[key.strip()] = value.strip()
    load = props.get("LoadState")
    active = props.get("ActiveState")
    sub = props.get("SubState")
    cg = props.get("ControlGroup", "")
    if not load or not active or not sub:
        return False, False, "unverified-processes", f"incomplete systemctl output for {unit}"
    if active in ALIVE_SYSTEMD_STATES:
        return False, True, "active-processes", f"systemd unit {unit} is {active}/{sub}"
    if active != "inactive" or sub != "dead":
        return False, False, "unverified-processes", f"systemd unit {unit} ended in {active}/{sub}"
    cgroups_to_check = []
    if cg:
        cgroups_to_check.append(cg)
    if (recorded_cgroup and recorded_cgroup not in cgroups_to_check
            and (recorded_cgroup.endswith(f"/{unit}.service") or recorded_cgroup.endswith(f"/{unit}"))):
        cgroups_to_check.append(recorded_cgroup)
    for cg_path in cgroups_to_check:
        pids, err = cgroup_procs_in(cg_path)
        if err:
            return False, False, "unverified-processes", err
        if pids:
            return False, True, "active-processes", f"systemd cgroup {cg_path} still has live pids: {pids}"
    if load in ("not-found", "loaded"):
        return True, False, None, None
    return False, False, "unverified-processes", f"unexpected systemd LoadState={load} for {unit}"


def self_ancestor_pids():
    ancestors = {os.getpid()}
    pid = os.getpid()
    for _ in range(64):
        info = read_proc_stat(pid)
        if info is None or info["ppid"] <= 1 or info["ppid"] in ancestors:
            break
        pid = info["ppid"]
        ancestors.add(pid)
    return ancestors


def path_within_worktree(target, real_root):
    cleaned = target[:-10] if target.endswith(" (deleted)") else target
    return cleaned == real_root or cleaned.startswith(real_root + "/")


def spawned_by_root_daemon(ppid):
    if ppid <= 1:
        return False
    try:
        return os.stat(f"/proc/{ppid}").st_uid == 0
    except OSError:
        return False


def setsid_job_ended(folder, root, job):
    if not os.path.isdir("/proc/self"):
        return False, False, "unverified-processes", "cannot inspect /proc on this host"
    meta_path = proc_file(root)
    try:
        meta = read_json(meta_path)
    except (OSError, ValueError):
        return False, False, "unverified-processes", f"missing or unreadable worker process metadata: {meta_path}"
    real_root = os.path.realpath(root)
    if (not isinstance(meta, dict) or meta.get("folder") != folder.name
            or meta.get("worktree") != real_root):
        return False, False, "unverified-processes", "worker process metadata does not match this run"
    if meta.get("subreaper") is not True or meta.get("descendants_proven_ended") is not True:
        surviving = meta.get("surviving_descendants") or []
        state = "active-processes" if surviving else "unverified-processes"
        return False, False, state, (f"setsid worker did not prove all descendants ended "
                                     f"(subreaper={meta.get('subreaper')}, surviving={surviving})")
    if meta.get("surviving_descendants"):
        return False, False, "active-processes", f"descendants survived worker exit: {meta['surviving_descendants']}"

    name = job_name(folder)
    lj_dir_raw = meta.get("long_job_dir")
    job_dir_path = Path(lj_dir_raw) if isinstance(lj_dir_raw, str) and lj_dir_raw else long_job_state_root() / "jobs" / name
    if job_dir_path.name != name:
        return False, False, "unverified-processes", f"unexpected long-job directory: {job_dir_path}"
    try:
        job_json = read_json(job_dir_path / "job.json")
        run_json = read_json(job_dir_path / "run.json")
    except (OSError, ValueError) as exc:
        return False, False, "unverified-processes", f"cannot read long-job metadata in {job_dir_path}: {exc}"
    attempt = job.get("attempt")
    if (not isinstance(job_json, dict) or not isinstance(run_json, dict)
            or job_json.get("via") != "setsid"
            or job_json.get("attempt") != attempt or run_json.get("attempt") != attempt):
        return False, False, "unverified-processes", "long-job setsid metadata does not match the finished attempt"

    runner_pid = run_json.get("runner_pid") or job_json.get("runner_pid")
    runner_start = run_json.get("runner_start") or job_json.get("runner_start")
    pgid = run_json.get("pgid") or runner_pid
    worker_pid = meta.get("worker_pid")
    worker_start = meta.get("worker_start")
    worker_pgid = meta.get("pgid")
    worker_sid = meta.get("sid")
    if (type(runner_pid) is not int or runner_pid <= 0
            or not isinstance(runner_start, str) or not runner_start.isdigit()
            or type(pgid) is not int or pgid <= 0
            or type(worker_pid) is not int or worker_pid <= 0
            or not isinstance(worker_start, str) or not worker_start.isdigit()):
        return False, False, "unverified-processes", "incomplete setsid runner or worker identity"

    if proc_alive_as(worker_pid, worker_start):
        return False, True, "active-processes", f"worker pid {worker_pid} is still alive"
    if proc_alive_as(runner_pid, runner_start):
        return False, True, "active-processes", f"long-job runner pid {runner_pid} is still alive"

    min_start = min(int(runner_start), int(worker_start))
    my_uid = os.getuid()
    ancestors = self_ancestor_pids()
    target_pgids = {p for p in (pgid, worker_pgid) if type(p) is int and p > 0}
    target_sids = {s for s in (runner_pid, worker_sid) if type(s) is int and s > 0}
    job_dir_token = f"LONG_JOB_DIR={job_dir_path}".encode()
    attempt_token = f"LONG_JOB_ATTEMPT={attempt}".encode()
    run_id_token = f"PM_LAND_RUN_ID={folder.name}".encode()

    try:
        proc_entries = os.listdir("/proc")
    except OSError as exc:
        return False, False, "unverified-processes", f"cannot list /proc: {exc}"
    for entry in proc_entries:
        if not entry.isdigit():
            continue
        pid = int(entry)
        if pid in ancestors:
            continue
        info = read_proc_stat(pid)
        if info is None or info["state"] in ("Z", "X"):
            continue
        if not info["start"].isdigit():
            continue
        start_val = int(info["start"])
        if info["pgid"] in target_pgids or info["sid"] in target_sids:
            if start_val >= min_start and pid not in target_pgids and pid not in target_sids:
                return False, True, "active-processes", f"pid {pid} is still in job process group/session"
        try:
            pstat = os.stat(f"/proc/{pid}")
        except FileNotFoundError:
            continue
        except OSError as exc:
            return False, False, "unverified-processes", f"cannot stat /proc/{pid}: {exc}"
        if pstat.st_uid != my_uid or start_val < min_start:
            continue
        try:
            env_vars = Path(f"/proc/{pid}/environ").read_bytes().split(b"\0")
        except (FileNotFoundError, ProcessLookupError):
            continue
        except PermissionError as exc:
            if spawned_by_root_daemon(info["ppid"]):
                continue
            return False, False, "unverified-processes", f"cannot inspect /proc/{pid}/environ: {exc}"
        except OSError as exc:
            return False, False, "unverified-processes", f"cannot inspect /proc/{pid}/environ: {exc}"
        if (job_dir_token in env_vars and attempt_token in env_vars) or run_id_token in env_vars:
            return False, False, "active-processes", f"pid {pid} still carries job environment"
        try:
            cwd_target = os.readlink(f"/proc/{pid}/cwd")
        except (FileNotFoundError, ProcessLookupError):
            continue
        except PermissionError as exc:
            if spawned_by_root_daemon(info["ppid"]):
                continue
            return False, False, "unverified-processes", f"cannot inspect /proc/{pid}/cwd: {exc}"
        except OSError as exc:
            return False, False, "unverified-processes", f"cannot inspect /proc/{pid}/cwd: {exc}"
        if path_within_worktree(cwd_target, real_root):
            return False, False, "active-processes", f"pid {pid} still has cwd inside worktree: {cwd_target}"
        try:
            fds = os.listdir(f"/proc/{pid}/fd")
        except (FileNotFoundError, ProcessLookupError):
            continue
        except PermissionError as exc:
            if spawned_by_root_daemon(info["ppid"]):
                continue
            return False, False, "unverified-processes", f"cannot inspect /proc/{pid}/fd: {exc}"
        except OSError as exc:
            return False, False, "unverified-processes", f"cannot inspect /proc/{pid}/fd: {exc}"
        for fd in fds:
            try:
                fd_target = os.readlink(f"/proc/{pid}/fd/{fd}")
            except (FileNotFoundError, ProcessLookupError):
                continue
            except PermissionError as exc:
                if spawned_by_root_daemon(info["ppid"]):
                    continue
                return False, False, "unverified-processes", f"cannot inspect /proc/{pid}/fd/{fd}: {exc}"
            except OSError as exc:
                return False, False, "unverified-processes", f"cannot inspect /proc/{pid}/fd/{fd}: {exc}"
            if path_within_worktree(fd_target, real_root):
                return False, False, "active-processes", f"pid {pid} still holds open fd in worktree: {fd_target}"
    return True, False, None, None


def remote_job_processes_ended(folder, root, job):
    via = job.get("via")
    if via not in ("systemd", "setsid"):
        return False, "unverified-processes", f"unknown long-job isolation mode: {via!r}"
    recorded_cgroup = ""
    if via == "systemd":
        try:
            meta = read_json(proc_file(root))
            if isinstance(meta, dict) and isinstance(meta.get("cgroup"), str):
                recorded_cgroup = meta["cgroup"]
        except (OSError, ValueError):
            recorded_cgroup = ""
    deadline = time.monotonic() + max(0.0, CLEANUP_DRAIN_SECONDS)
    while True:
        if via == "systemd":
            ended, retryable, state, reason = systemd_unit_ended(job.get("unit"), recorded_cgroup)
        else:
            ended, retryable, state, reason = setsid_job_ended(folder, root, job)
        if ended:
            return True, None, None
        if not retryable or time.monotonic() >= deadline:
            return False, state or "unverified-processes", reason
        time.sleep(CLEANUP_DRAIN_POLL)


def check_receipt_allows_cleanup(folder, root):
    record_path = folder / "record.json"
    if record_path.is_symlink() or not record_path.is_file():
        return False, "missing-receipt", f"checker receipt is missing: {record_path}"
    try:
        record = read_json(record_path)
    except (OSError, ValueError) as exc:
        return False, "missing-receipt", f"cannot read checker receipt {record_path}: {exc}"
    if not isinstance(record, dict):
        return False, "missing-receipt", f"checker receipt is not a JSON object: {record_path}"
    if record.get("job") != job_name(folder) or record.get("worktree") != str(root):
        return False, "failed", "checker receipt does not match this job or worktree"
    exit_code = record.get("exit_code")
    if type(exit_code) is not int or exit_code not in (0, 1, 2):
        state = f"checker-exit-{exit_code}" if type(exit_code) is int else "failed"
        return False, state, f"landing check did not complete normally (exit_code={exit_code!r})"
    shard_exit = record.get("shard_exit_code")
    if type(shard_exit) is not int or shard_exit < 0:
        return False, "failed", f"shard check did not complete normally (shard_exit_code={shard_exit!r})"
    return True, None, None


def remote_cleanup(folder, host):
    root = worktree_path(folder)
    if not os.path.lexists(root):
        return
    job = remote_job_status(job_name(folder))
    state, code = job.get("state"), job.get("code")
    if state != "done" or type(code) is not int or code != 0 or not job.get("ended") or job.get("signal"):
        preserve_remote_copy(folder, host, state if isinstance(state, str) and state else "unknown")
        return
    ok, fail_state, fail_reason = check_receipt_allows_cleanup(folder, root)
    if not ok:
        preserve_remote_copy(folder, host, fail_state, fail_reason)
        return
    require_owned_worktree(root, folder)
    ended, proc_state, proc_reason = remote_job_processes_ended(folder, root, job)
    if not ended:
        preserve_remote_copy(folder, host, proc_state, proc_reason)
        return
    if git(root, "symbolic-ref", "--quiet", "HEAD", check=False).returncode != 1:
        raise Refusal(f"preserving {root}: could not establish that the temporary worktree is detached")
    git(CLONE, "worktree", "remove", "--force", str(root))
    say(f"Removed temporary remote worktree {root}")


def job_name(folder):
    return "pm-check-" + hashlib.sha256(os.fsencode(folder.name)).hexdigest()[:20]


def helper(folder, host, mode, *args):
    # The copied worker has its own protocol. The installed CLI exposes check and verify only.
    return ["python3", "-B", str(folder / "worker.py"), mode, host, *args]


def transport_failure(folder, host):
    fallback = next(other for other in HOSTS if other != host)
    preserve_remote_copy(folder, host, "unknown")
    write_json(folder / "transport-failure.json",
               {"host": host, "job": job_name(folder), "failed_utc": now(), "fallback_host": fallback})
    return TransportFailure(f"Lost SSH to {host}. "
                            f"Evidence: {folder}. Check the job on reconnect or retry with --on {fallback}.")


def start_remote_job(folder, host, ref, head, tree, base, main=None, rows=False):
    name = job_name(folder)
    tail = [base if main is None else main] + (["rows"] if rows else [])
    launch = ssh(host, "long-job", "start", name, "--log", folder / "check.log", "--",
                 *helper(folder, host, "check", ref, head, tree, base, *tail),
                 capture_output=False, check=False)
    failures = int(launch.returncode == 255)
    if failures:
        say(f"SSH disconnected while starting {name}. Checking the same job on reconnect.")
    elif launch.returncode:
        raise Refusal(f"could not start {host} long-job {name} (exit {launch.returncode})")
    say(f"Waiting for {host} long-job {name}. Evidence: {folder}")
    while True:
        wait = ssh(host, "long-job", "wait", name, "--timeout", "1500",
                   capture_output=False, check=False)
        if wait.returncode == 255:
            failures += 1
            if failures >= SSH_FAILURE_LIMIT:
                raise transport_failure(folder, host)
            time.sleep(15)
            continue
        failures = 0
        if wait.returncode == 124:
            continue
        if wait.returncode:
            raise Refusal(f"remote job {name} failed or could not be located. See {folder / 'check.log'}")
        return


def cleanup_after_check(folder, host):
    try:
        result = ssh(host, *helper(folder, host, "cleanup"), check=False)
        if result.returncode:
            raise Refusal(result.stderr.strip() or f"cleanup exited {result.returncode}")
    except (Refusal, OSError) as exc:
        say(f"Could not confirm remote cleanup: {exc}")
        preserve_remote_copy(folder, host, "unknown")
    else:
        if result.stdout:
            say(result.stdout.strip())


def check_topic(root, branch, host, base=None):
    ref = check_ref(branch)
    head = sha(revision(root, ref + "^{commit}"), "topic tip")
    tips = origin_refs(root, MAIN_REF, ref)
    main = tips[MAIN_REF]
    if base is None:
        checked_base = main
    else:
        # A batch member is checked against its batch-start, which is behind main once the first member pushed.
        checked_base = commit_or_refuse(root, base, "checked base")
        if not is_ancestor(root, checked_base, main):
            raise Refusal(f"checked base {checked_base} is not on the fetched origin/main {main}; inside a batch pass "
                          "its full batch-start SHA")
    if tips[ref] != head:
        raise Refusal(f"local topic {ref} is {head}; origin is {tips[ref]}. Push the exact checked topic first.")
    if revision(root, ref + "^{commit}") != head:
        raise Refusal(f"local topic {ref} changed during pinning: {head}")
    tree = revision(root, head + "^{tree}")
    git(root, "merge-base", "--is-ancestor", checked_base, head)
    folder = new_run(branch, head)
    path = folder / "record.json"
    # A batch member's report is compared with the next member's, so its check is asked for the row report
    # when the check at that commit prints one. Without those lines no batch runs, and batch-check says so.
    rows = base is not None and check_can_batch(
        git(root, "show", f"{head}:scripts/pm-landing-check.py", check=False).stdout)
    try:
        start_remote_job(folder, host, ref, head, tree, checked_base, main, rows)
        record = read_json(path)
        verify_record(folder, record, host, ref, head, tree, checked_base)
    except TransportFailure:
        raise
    except (Refusal, OSError, ValueError, KeyError, TypeError):
        cleanup_after_check(folder, host)
        raise
    cleanup_after_check(folder, host)
    code = record["exit_code"]
    say(f"Receipt: {path}")
    say(f"Landing checker exit {code} ({EXIT_LABELS[code]}). Shard check exit {record['shard_exit_code']}."
        f" Report: {record['report']}")
    return 0


# --------------------------------------------------------------------------------- batch landings
# Read-only, for the rule's "Land in batches": holder.txt is the record of the open batch, and two
# landing-check reports say what moved between two of its members. Nothing here takes the lock,
# moves main, pushes or writes anything.

REPORT_SCHEMA = "pm.landing_check.report.v1"


def read_json_report(doc: dict[str, Any]) -> dict[str, Any]:
    """The digest of the report `pm-landing-check.py --json` writes, which `check` binds into its receipt.

    It carries the comparison lines the strict rule reads, with no print cap: the gone ids, subcheck totals and
    bucket counts are complete. An older JSON report without `subcheck_totals` or `bucket_counts` reads as one
    without those lines: no batch compares with it. `pairs` is its `validator_pairs` mapping: a bucket the report
    left out because a run-gates copy was judged by its audit-governance twin is not an observed zero.
    """
    totals = doc.get("subcheck_totals")
    counts = doc.get("bucket_counts")
    resolved = doc.get("resolved_buckets")
    totals = {name: None if value is None else int(value) for name, value in totals.items()} \
        if isinstance(totals, dict) else None
    counts = {name: int(value) for name, value in counts.items()} if isinstance(counts, dict) else None
    gone_ids = [str(name) for name in resolved] if isinstance(resolved, list) else None
    pairs: dict[tuple[str, str], tuple[str, str]] = {}
    for row in doc.get("validator_pairs") or []:
        if isinstance(row, dict) and row.get("paired") and row.get("run_gates") and row.get("audit_governance"):
            pairs[("run-gates", str(row["run_gates"]))] = ("audit-governance", str(row["audit_governance"]))
    # A subcheck compared by its total only is left out of `bucket_counts` too: its missing bucket is not a zero.
    # The empty subcheck name is `-` here, as `subcheck_totals` writes it, so a name from either side matches.
    partial: set[tuple[str, str]] = set()
    for name in doc.get("subchecks_compared_by_total_only") or []:
        check, _, subcheck = str(name).partition("/")
        if check:
            partial.add((check, subcheck or "-"))
    # And `exports.subchecks` says why each of them is a sample. Only a `no_export` whose producer names the command,
    # and whose export block lists that command in `no_complete_export`, is a permanent sample: that producer decided
    # no complete export exists for it, so its total is the whole comparison. A `no_export` with no command is
    # ambiguous, and one naming a command the producer did not list as writing no complete export is unaudited
    # (`command_unread`): both read as unknown (reviews ASTRA A2-1, R7-B2).
    # `baseline_sample` is NOT permanent either: it means the batch-start baseline missed its export, and the next
    # follow-up's baseline can key it, so its counts are unknown here and the landing is judged alone (R5-B1). Any
    # other case means an export was attempted and did not key its rows (`export_timeout`, `export_unreadable`,
    # `total_mismatch`, `rows_mismatch`), and then its counts are not known, only its total. A paired run-gates
    # copy is judged by its audit-governance twin's rows, so an export of its own is not read here.
    exports = doc.get("exports") if isinstance(doc.get("exports"), dict) else {}
    rows_read = exports.get("subchecks")
    rows_read = rows_read if isinstance(rows_read, list) else None
    named_samplers = exports.get("no_complete_export")
    named_samplers = named_samplers if isinstance(named_samplers, dict) else {}
    export_failed: set[tuple[str, str]] = set()
    permanent: set[tuple[str, str]] = set()
    samples: dict[tuple[str, str], tuple[Any, Any]] = {}
    for row in rows_read or []:
        if not isinstance(row, dict):
            continue
        key = (str(row.get("check")), str(row.get("subcheck") or "-"))
        if row.get("reported") is not None and row.get("sampled") is not None:
            samples[key] = (row["reported"], row["sampled"])
        if key in pairs:
            continue
        if row.get("keyed"):
            continue
        if (row.get("case") == "no_export" and isinstance(row.get("command"), str) and row["command"].strip()
                and row["command"] in named_samplers):
            # Only a producer that names the validator, and lists it as writing no complete export, proves the sample
            # is permanent. A `no_export` with no command is the producer saying it could not read what runs; one
            # naming a command absent from `no_complete_export` is unaudited. Reading either as permanence is the
            # false pass of reviews ASTRA A2-1 and R7-B2.
            permanent.add(key)
        elif row.get("case") not in (None, "baseline_sample", "no_export", "command_unread"):
            export_failed.add(key)
        # `no_export` without a listed command, and `command_unread`, are neither: their status is unknown, so no
        # sample they leave is compared by total. A subcheck compared by its total only with no row here is likewise
        # unknown: nothing said why its export is missing (review ASTRA A2-1).
    return {
        "infrastructure": len(doc.get("infrastructure") or []),
        "crashed": False,
        "compare": int(doc.get("changed_on_branch") or 0),
        "gone": len(gone_ids) if gone_ids is not None else None,
        "gone_ids": gone_ids,
        "totals": totals,
        "bucket_counts": counts,
        # A JSON report has no print cap and no text to truncate; without totals there is nothing to compare,
        # which `shows_what_changed` says.
        "ids_unread": totals is not None and gone_ids is None,
        "pairs": pairs,
        "partial": partial,
        # What the report says about the samples it compared by their totals only: the permanent ones, and the
        # ones an export was attempted for and failed (review R4-B1). A field a report does not carry reads as
        # an empty set, which makes no sample permanent: unknown, never known.
        "permanent": permanent,
        "export_failed": export_failed,
        # How each subcheck was sampled, where the export block says: a permanent sample is the same comparison only
        # when both reports sampled it the same way.
        "samples": samples,
    }


def batch_report(text: str) -> Optional[dict[str, Any]]:
    """The JSON report `check` wrote, or None when these bytes are not one.

    A batch compares JSON only. The text report names a row by its clipped display fields and JSON by its key;
    treating those as one identity turns an unchanged row into a changed one (review ASTRA F9).
    """
    try:
        doc = json.loads(text)
    except ValueError:
        return None
    if not isinstance(doc, dict) or doc.get("schema_id") != REPORT_SCHEMA:
        return None
    return read_json_report(doc)


ROW_REPORT_SCHEMA = "pm.landing_check.rows.v1"
# What a batch reads from the landing check, in the check's own source.
BATCH_CHECK_MARKS = ("--row-report", "grown_stale", "Subcheck totals this run", "Bucket counts this run")


def check_can_batch(source: str) -> bool:
    """Whether this landing check prints what a batch compares. An older one does not, and no batch runs on it."""
    return all(mark in source for mark in BATCH_CHECK_MARKS)


def shows_what_changed(report: dict[str, Any], earlier: Sequence[Optional[dict[str, Any]]]) -> bool:
    """Whether this report and every earlier one on record print the lines that say what moved between them.

    All of them: the gone ids, the subcheck totals and the bucket counts. A report cut off before one of those
    sections prints nothing that stands in for it, so the batch closes rather than comparing what is left.
    """
    return (report.get("totals") is not None and report.get("bucket_counts") is not None
            and all(row is None or (row.get("totals") is not None and row.get("bucket_counts") is not None)
                    for row in earlier))


def read_row_report(path: Any) -> Optional[dict[str, Any]]:
    """What pm-landing-check.py --row-report wrote, or None."""
    try:
        doc = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError, TypeError):
        return None
    return doc if isinstance(doc, dict) and doc.get("schema_id") == ROW_REPORT_SCHEMA else None


def subcheck_of(bucket: str) -> str:
    """`check/subcheck` of a bucket id, `check|subcheck|error|path`."""
    check, _, rest = bucket.partition("|")
    return f"{check}/{rest.partition('|')[0] or '-'}"


# The strict batch rule (review ASTRA A2-1..A2-5, round 5). A member after the first stays only when its report is
# the previous member's: same totals, same bucket counts, same row keys wherever both row reports are complete, same
# known/sampled status. The one allowed difference is governance staleness in buckets that name a file this member's
# own branch touched, fully printed. A false pass is the danger; a false stop only means the landing goes alone.

def member_place(index: int, total: int) -> str:
    """A report's place in its batch, named: `this landing's report`, `the previous member's report`, or member N."""
    if index == total - 1:
        return "this landing's report"
    if index == total - 2:
        return f"the previous member's report (member {index + 1} of {total})"
    return f"member {index + 1}'s report (of {total})"


def row_entry(rows: Optional[dict[str, Any]], name: str) -> Optional[dict[str, Any]]:
    """One subcheck's entry in a --row-report document, or None when it has none.

    Every subcheck `subcheck_totals` names has an entry there, so a missing one is a report the rule cannot read.
    """
    entry = ((rows or {}).get("subchecks") or {}).get(name)
    return entry if isinstance(entry, dict) else None


def row_keys(entry: dict[str, Any]) -> Counter:
    """A complete subcheck's rows by key, with multiplicity: the identity a batch compares."""
    return Counter(row.get("key") for row in entry.get("rows") or []
                   if isinstance(row, dict) and isinstance(row.get("key"), str))


def rows_matching(entry: dict[str, Any], key: str) -> list[dict[str, Any]]:
    """Every row of this entry with that key, in report order.

    A scrubbed key can repeat: `names` reads the unscrubbed row while the key scrubs measured values, so two rows
    can share a key and differ in what they name. Every one of them is inspected (review R7-N2).
    """
    return [row for row in entry.get("rows") or [] if isinstance(row, dict) and row.get("key") == key]


def excused_row(entry: dict[str, Any], key: str, own: Collection[str]) -> bool:
    """Whether every row with this key is the rule's own fully printed staleness: not only the first (R7-N2)."""
    rows = rows_matching(entry, key)
    return bool(rows) and all(own_staleness(row, own) for row in rows)


def own_staleness(row: Optional[dict[str, Any]], own: Collection[str]) -> bool:
    """Whether this row is governance staleness the rule may excuse: this member's own files, seen in full.

    `kind_stale` is the landing check's own classification by error kind, which no sample or missing baseline can
    make uncertain; `grown_stale` is its whole-bucket classification, the only evidence for a renamed-shard or
    audit-closure row. A row stale by its detail text alone is neither (review ASTRA A2-5), and a row naming any file
    of the batch but this member's is not this member's to excuse.
    """
    if not isinstance(row, dict) or not row.get("stale"):
        return False
    if not (row.get("kind_stale") or row.get("grown_stale")):
        return False
    names = row.get("names") or []
    return bool(names) and set(names) <= set(own)


def bucket_of_key(key: str) -> str:
    """`check|subcheck|error|path` of a row key."""
    return key.rpartition("|")[0]


def report_buckets(report: dict[str, Any]) -> dict[str, int]:
    """Every bucket this report counted or held gone, minus the run-gates copies a complete twin judged.

    A gone bucket is a count of zero. A copy the report paired with an audit-governance twin is left to the twin,
    exactly as `pm-landing-check.py` leaves it out of its own bucket counts.
    """
    pairs = report.get("pairs") or {}
    counts: dict[str, int] = {}
    for bucket, count in (report.get("bucket_counts") or {}).items():
        pieces = bucket.split("|", 2)
        if len(pieces) >= 2 and (pieces[0], pieces[1] or "-") in pairs:
            continue
        counts[bucket] = int(count)
    for bucket in report.get("gone_ids") or []:
        pieces = bucket.split("|", 2)
        if len(pieces) >= 2 and (pieces[0], pieces[1] or "-") in pairs:
            continue
        counts.setdefault(bucket, 0)
    return counts


def strict_difference(report: dict[str, Any], rows: Optional[dict[str, Any]], previous: dict[str, Any],
                      previous_rows: Optional[dict[str, Any]], own: Collection[str],
                      total: int) -> Optional[tuple[str, str]]:
    """Why this member's report is not the previous member's: the first difference, or None when it is.

    For member N of `total`, N >= 2: the two JSON reports must agree in every subcheck total, every bucket count,
    every row key wherever both row reports are complete, and every subcheck's known/sampled status. The one allowed
    difference is governance staleness in buckets that name a file this member's own branch touched, fully printed in
    this member's report. A subcheck that is a permanent sample is compared on its total only, and only when the
    producer positively identified a validator without a complete export, it is sampled the same way in both reports,
    and its total is unchanged. Anything else judges this landing alone.
    """
    where = member_place(total - 2, total)
    now_totals, old_totals = report.get("totals") or {}, previous.get("totals") or {}
    if report.get("ids_unread") or previous.get("ids_unread"):
        return ("batch_counts_unknown", "the gone ids, subcheck totals or bucket counts of one of the two reports do "
                                        "not add up, so what moved cannot be told")
    if (report.get("pairs") or {}) != (previous.get("pairs") or {}):
        return ("batch_mapping_unreadable", "the two reports pair different validators, so which rows are compared "
                                            "is not known")
    now_buckets, old_buckets = report_buckets(report), report_buckets(previous)
    for name in sorted(set(now_totals) | set(old_totals)):
        check, _, subcheck = name.partition("/")
        if name not in now_totals:
            return ("batch_status_differs", f"{name} is in {where} and not in this landing's report")
        if name not in old_totals:
            return ("batch_status_differs", f"{name} is in this landing's report and not in {where}")
        if now_totals[name] is None or old_totals[name] is None:
            side = "this landing's report" if now_totals[name] is None else where
            return ("batch_counts_unknown", f"{name} timed out in {side}, so its count is not known")
        if (check, subcheck) in (report.get("pairs") or {}):
            # A run-gates copy judged by its complete audit-governance twin is compared under the twin's name.
            continue
        # An export that failed leaves what the check could key unknown, whatever the row report says (R4-B1).
        for side, doc in (("this landing's report", report), (where, previous)):
            if (check, subcheck) in (doc.get("export_failed") or set()):
                return ("batch_counts_unknown", f"{name}'s export did not complete in {side}, or what it runs could "
                                                "not be read, so its counts are not known")
        entry_now, entry_old = row_entry(rows, name), row_entry(previous_rows, name)
        if entry_now is None or entry_old is None:
            side = "this landing's report" if entry_now is None else where
            return ("batch_status_differs", f"{name} has no row report entry in {side}, so its rows cannot be read")
        complete_now, complete_old = bool(entry_now.get("complete")), bool(entry_old.get("complete"))
        if complete_now != complete_old:
            full, sampled = (("this landing's report", where) if complete_now
                             else (where, "this landing's report"))
            return ("batch_status_differs", f"{name} printed every row in {full} and only a sample in {sampled}, so "
                                            "its rows are not the same set")
        if not complete_now:
            for side, doc in (("this landing's report", report), (where, previous)):
                if (check, subcheck) not in (doc.get("permanent") or set()):
                    return ("batch_counts_unknown",
                            f"{name} is compared by its total only in {side}, and no producer named a validator that "
                            "writes no complete export, so its counts are not known")
            now_sample = (report.get("samples") or {}).get((check, subcheck))
            old_sample = (previous.get("samples") or {}).get((check, subcheck))
            if now_sample != old_sample:
                return ("batch_status_differs", f"{name} was sampled differently in {where} ({old_sample}) and this "
                                                f"landing's report ({now_sample}), so its total is not the same "
                                                "comparison")
            if now_totals[name] != old_totals[name]:
                return ("batch_totals_differ", f"{name}'s total changed from {old_totals[name]} to {now_totals[name]} "
                                               f"between {where} and this landing's report, and it is compared by its "
                                               "total only")
            continue
        now_keys, old_keys = row_keys(entry_now), row_keys(entry_old)
        if sum(now_keys.values()) != now_totals[name] or sum(old_keys.values()) != old_totals[name]:
            # `write_row_report` writes `complete: true` only with one row per counted failure, so a row report that
            # does not add up is corrupt: its rows are not known, never a comparison (review R7-N2).
            return ("batch_counts_unknown",
                    f"{name}'s row report does not add up to its total in this landing's report "
                    f"({sum(now_keys.values())} rows of {now_totals[name]}) or in {where} "
                    f"({sum(old_keys.values())} rows of {old_totals[name]}), so its rows are not known")
        gone, added = old_keys - now_keys, now_keys - old_keys
        for a_row in sorted(gone):
            if not excused_row(entry_old, a_row, own):
                return ("batch_rows_differ", f"a row {where} has is gone here, and it is not governance staleness on a "
                                             f"file this landing touched: {a_row}")
        for a_row in sorted(added):
            if not excused_row(entry_now, a_row, own):
                return ("batch_rows_differ", f"a new row is not governance staleness on a file this landing touched: "
                                             f"{a_row}")
        expected = old_totals[name] + sum(added.values()) - sum(gone.values())
        if now_totals[name] != expected:
            return ("batch_totals_differ", f"{name}'s total is {now_totals[name]} but the rows {where} and this report "
                                           f"show {expected}")
        # A subcheck the batch-start baseline sampled is compared by its total only, so `pm-landing-check.py` counts
        # no buckets for it while this run's row report can still print every row: the keys above are the comparison
        # there, never the absent counts (round-6 case; review ASTRA A2-2). It must be the same status in both
        # reports: one report comparing by total while the other prints every row is a status difference (R7-N1).
        now_total_only = (check, subcheck) in (report.get("partial") or set())
        old_total_only = (check, subcheck) in (previous.get("partial") or set())
        if now_total_only != old_total_only:
            side = "this landing's report" if now_total_only else where
            return ("batch_status_differs", f"{name} is compared by its total only in {side} and by every row in the "
                                            "other, so its known status is not the same")
        if now_total_only:
            continue
        # Every bucket count must be the previous report's, moved only by the rows this rule just excused: a count
        # that changed for another reason is a difference the row keys alone would hide (review ASTRA A2-2).
        seen_buckets = {b for b in now_buckets if subcheck_of(b) == name}
        seen_buckets |= {b for b in old_buckets if subcheck_of(b) == name}
        seen_buckets |= {bucket_of_key(a_row) for a_row in set(now_keys) | set(old_keys)}
        for bucket in sorted(seen_buckets):
            went = sum(count for a_row, count in gone.items() if bucket_of_key(a_row) == bucket)
            came = sum(count for a_row, count in added.items() if bucket_of_key(a_row) == bucket)
            expected = old_buckets.get(bucket, 0) + came - went
            if now_buckets.get(bucket, 0) != expected:
                return ("batch_buckets_differ",
                        f"bucket {bucket} is counted as {now_buckets.get(bucket, 0)} here and "
                        f"{old_buckets.get(bucket, 0)} in {where}, and the rows added or gone do not account for the "
                        "difference")
    return None


HOLDER_LINE = re.compile(r"^\s*([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*?)\s*$")


def parse_holder(text: str) -> dict[str, Any]:
    fields: dict[str, Any] = {"batch-landing": []}
    for line in text.splitlines():
        match = HOLDER_LINE.match(line)
        if not match:
            continue
        key, val = match.group(1).lower(), match.group(2)
        if key == "batch-landing":
            fields["batch-landing"].append(val)
        elif key in ("batch-start", "batch-first-push") and fields.get(key) not in (None, val):
            # A rewritten holder.txt can leave the old line behind: two different batch-starts, or two first
            # pushes, are not a choice to make silently, so the readers refuse instead of taking the first. For
            # `batch-first-push` that matters: a newer line above the real one would pass a batch past its two
            # hours (review OPUS N3).
            fields[f"{key}-conflict"] = f"{fields[key]} and {val}"
        else:
            fields.setdefault(key, val)
    return fields


def read_holder_text(lock_dir: Path) -> Optional[str]:
    try:
        return (lock_dir / "held" / "holder.txt").read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None


def holder_broken(text: Optional[str]) -> Optional[str]:
    """Why holder.txt cannot be read as one, or None when it can.

    A renewal replaces the file: a truncate-then-write leaves it empty for an instant, and a half-written or broken
    file must never read as a holder that names no batch (fix round 7). A holder is readable when it has at least
    one `key: value` line; an empty `batch-start:` or `batch-landing:` line is broken too, because the reader would
    otherwise take an empty value for "no batch" (R8-N1).
    """
    if text is None:
        return "holder.txt cannot be read"
    if not text.strip():
        return "holder.txt is empty"
    if not any(HOLDER_LINE.match(line) for line in text.splitlines()):
        return "holder.txt has no `key: value` line"
    for line in text.splitlines():
        match = HOLDER_LINE.match(line)
        if match and match.group(1).lower() in ("batch-start", "batch-landing") and not match.group(2).strip():
            return f"holder.txt has an empty `{match.group(1).lower()}:` line"
    return None


def holder_rule_age(lock_dir: Path, text: Optional[str]) -> float:
    """Seconds since the holder last said anything, the 90-minute rule's clock.

    The rule counts from the latest time in holder.txt (a batch rewrites it), so this takes the latest of
    every timestamp written there and the file's and folder's own times: never earlier than the rule says.
    """
    latest = 0.0
    now = time.time()
    for path in (lock_dir / "held" / "holder.txt", lock_dir / "held"):
        try:
            latest = max(latest, path.stat().st_mtime)
        except OSError:
            pass
    for found in re.findall(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", text or ""):
        moment = parse_iso(found)
        if moment is not None and moment.timestamp() <= now + 300:
            latest = max(latest, moment.timestamp())
    return now - latest


def now_utc() -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0)


def iso(moment: Optional[datetime] = None) -> str:
    return (moment or now_utc()).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(text: Any) -> Optional[datetime]:
    if not isinstance(text, str):
        return None
    try:
        return datetime.strptime(text.strip(), "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def age_seconds(text: Any) -> Optional[float]:
    moment = parse_iso(text)
    return None if moment is None else (now_utc() - moment).total_seconds()


def valid_full_sha(value: Any) -> bool:
    return isinstance(value, str) and re.fullmatch(r"[0-9a-f]{40}", value) is not None


def commit_or_refuse(root: Path, value: Any, label: str) -> str:
    """A full commit SHA for an argument that may be a name: a moving name is refused rather than pinned silently."""
    if not valid_full_sha(value):
        raise Refusal(f"{label} must be a full 40-character commit SHA, never a moving name or a short one: {value!r}")
    result = git(root, "rev-parse", "--verify", value + "^{commit}", check=False)
    if result.returncode:
        raise Refusal(f"{label} is not a commit in {root}: {value!r}")
    return sha(result.stdout.strip(), label)


def holder_verdict(lock_dir: Path) -> dict[str, Any]:
    """Is held/ taken, and is its holder dead? Only the 90-minute rule decides, with a local pid as extra evidence."""
    if not (lock_dir / "held").is_dir():
        return {"held": False, "dead": False, "reason": "the landing lock is free"}
    text = read_holder_text(lock_dir)
    broken = holder_broken(text)
    if broken:
        raise Refusal(f"the landing lock is held at {lock_dir / 'held'}, but {broken}: the holder is being written "
                      "or is broken; wait and rerun")
    fields = parse_holder(text)
    age = holder_rule_age(lock_dir, text)
    expired = age > HAND_RULE_SECONDS
    alive = False
    if fields.get("host") == socket.gethostname() and str(fields.get("pid", "")).isdigit():
        alive = proc_alive_as(int(fields["pid"]), fields.get("pid-start", ""))
    minutes = int(age // 60)
    if expired:
        reason = f"the 90-minute rule: nothing written for {minutes} min"
    elif alive:
        reason = f"pid {fields['pid']} still runs here; {minutes} min of 90 used"
    else:
        reason = f"written by hand or stopped; {minutes} min of 90 used"
    return {"held": True, "dead": expired, "fields": fields, "text": text, "age_seconds": int(age),
            "kind": "tool" if fields.get("tool") else "hand", "reason": reason}


def batch_rows(fields: dict[str, Any]) -> tuple[list[dict[str, str]], list[str]]:
    """`batch-landing: <branch> <sha> <receipt>` rows, and the rows that are not that: refused, never dropped.

    The receipt path is the record.json `check` printed for that landing. A row without it is not a batch row:
    the next member's receipt can only be compared with one whose report and row report are bound.
    """
    rows: list[dict[str, str]] = []
    malformed: list[str] = []
    for row in fields.get("batch-landing") or []:
        parts = row.split(None, 2)
        if len(parts) == 3 and valid_full_sha(parts[1]) and parts[2].strip():
            rows.append({"branch": parts[0], "sha": parts[1], "receipt": parts[2].strip()})
        else:
            malformed.append(row)
    return rows, malformed


def batch_landed(shared: Path, fields: dict[str, Any]) -> bool:
    """holder.txt names a batch-start and something landed in it: a row says so, or main has moved past it."""
    start = fields.get("batch-start")
    if not start:
        return False
    rows, _malformed = batch_rows(fields)
    if rows:
        return True
    result = git(shared, "rev-parse", ORIGIN_MAIN + "^{commit}", check=False)
    return result.returncode == 0 and result.stdout.strip() != start


def commit_time(shared: Path, value: str) -> Optional[float]:
    out = git(shared, "show", "-s", "--format=%ct", f"{value}^{{commit}}", check=False).stdout.strip()
    return float(out) if out.isdigit() else None


def baseline_age(shared: Path, rev: str) -> Optional[float]:
    """How old the baseline is by committer time when the landing check measures from `rev`.

    The check compares the baseline's commit with its base's commit times (`baseline_currency`), so this is
    `rev`'s commit time minus the baseline's: measured from the batch-start, it is the age every member's check sees.
    None when rule 2 is off anyway (no recorded commit, or one not on `rev`'s history).
    """
    shown = git(shared, "show", f"{rev}:{BASELINE_FILE}", check=False)
    try:
        recorded = json.loads(shown.stdout).get("commit") if shown.returncode == 0 else None
    except (ValueError, AttributeError):
        recorded = None
    if not isinstance(recorded, str) or not recorded:
        return None
    when, base = commit_time(shared, recorded), commit_time(shared, rev)
    if when is None or base is None or not is_ancestor(shared, recorded, rev):
        return None
    return base - when


def batch_limits(shared: Path, start: str, fields: dict[str, Any], rows: Sequence[dict[str, str]],
                 holder: dict[str, Any]) -> list[dict[str, Any]]:
    """The rule's four limits, read-only: whether this landing is within each, and the sentence batch-status prints.

    The same rows decide `batch-check` and `verify --batch-start`: something batch-status shows as a `[stop]` must
    refuse a member, never land it. `start` is the batch-start, which is what every member's check measures the
    baseline's age from.
    """
    out: list[dict[str, Any]] = []
    landings = len(rows)
    full = landings >= BATCH_MAX_LANDINGS
    out.append({"name": "landings", "within": not full,
                "text": f"landings: {landings} of {BATCH_MAX_LANDINGS}"
                        + (" (full: the next landing is judged alone)" if full else "")})
    first_push = fields.get("batch-first-push")
    conflict = fields.get("batch-first-push-conflict")
    if conflict:
        # Two lines: taking the first silently would let a newer one pass a batch past its two hours (OPUS N3).
        out.append({"name": "first push", "within": False,
                    "text": f"first push: holder.txt names two batch-first-push lines ({conflict}): rewrite it with "
                            "the one real first push"})
    else:
        from_row = False
        if not first_push and rows:
            when = commit_time(shared, rows[0]["sha"])
            if when is not None:
                first_push = iso(datetime.fromtimestamp(when, timezone.utc))
                from_row = True
        where = " (from the first row's commit time: no batch-first-push line)" if from_row else ""
        if not first_push:
            out.append({"name": "two hours", "within": True, "text": "first push: none yet; the two hours start at the "
                                                                      "first push of main"})
        else:
            age = age_seconds(first_push)
            if age is None:
                out.append({"name": "two hours", "within": False,
                            "text": f"first push: {first_push} is not a time in the rule's format{where}"})
            else:
                past = age > BATCH_MAX_SECONDS
                out.append({"name": "two hours", "within": not past,
                            "text": f"first push: {first_push}, {int(age // 60)} min of the "
                                    f"{BATCH_MAX_SECONDS // 3600} h ago{where}"
                                    + (" (past the two hours: the next landing is judged alone)" if past else "")})
    out.append({"name": "holder", "within": not holder["dead"],
                "text": f"holder: {holder['reason']}"
                        + (" (the holder is dead: the batch is closed or cleared before another landing)"
                           if holder["dead"] else "")})
    age = baseline_age(shared, start)
    if age is None:
        out.append({"name": "baseline", "within": True,
                    "text": "baseline: no recorded commit on the batch-start's history, so rule 2 is off and nothing "
                            "here depends on its age"})
    else:
        past = age > BASELINE_LIMIT_SECONDS
        near = not past and age > BASELINE_LIMIT_SECONDS - BASELINE_MARGIN_SECONDS
        edge = (", past its seven-day edge: this landing is judged alone" if past else
                ", within 2 h of its seven-day edge: this landing is judged alone" if near else "")
        out.append({"name": "baseline", "within": not (past or near),
                    "text": f"baseline: {age / 86400:.2f} days old at batch-start of the 7 rule 2 allows" + edge})
    return out


def require_batch_limits(shared: Path, start: str, fields: dict[str, Any], rows: Sequence[dict[str, str]],
                         holder: dict[str, Any]) -> None:
    """Refuse a landing the open batch may not take: the four landings, the two hours, a dead holder, the baseline."""
    for limit in batch_limits(shared, start, fields, rows, holder):
        if not limit["within"]:
            raise Refusal(f"the batch cannot take this landing ({limit['text']}). Close it with its follow-up at the "
                          "current main, then land this one alone")


def batch_state(shared: Path, lock_dir: Path) -> dict[str, Any]:
    """Everything the rule's record says about the open batch, read-only: no fetch, no lock, no write."""
    holder = holder_verdict(lock_dir)
    shown = git(shared, "rev-parse", ORIGIN_MAIN + "^{commit}", check=False)
    if shown.returncode:
        raise Refusal(f"cannot read the fetched origin/main in {shared}; fetch it first")
    main = sha(shown.stdout.strip(), "fetched origin/main")
    state: dict[str, Any] = {"holder": holder, "main": main, "batch": None}
    if not holder["held"]:
        return state
    fields = holder["fields"]
    start = fields.get("batch-start")
    if not start:
        return state
    rows, malformed = batch_rows(fields)
    batch: dict[str, Any] = {"start": start, "rows": rows, "malformed": malformed, "on_main": False,
                             "landed": batch_landed(shared, fields), "plans": None, "unlisted": []}
    if fields.get("batch-start-conflict"):
        batch["why"] = ("holder.txt names two batch-starts: " + fields["batch-start-conflict"]
                        + "; rewrite it with the one open batch's")
        state["batch"] = batch
        return state
    if not valid_full_sha(start):
        batch["why"] = f"batch-start is not a full 40-character SHA: {start!r}"
        state["batch"] = batch
        return state
    batch["on_main"] = is_ancestor(shared, start, main)
    if not batch["on_main"]:
        batch["why"] = f"batch-start {start} is not on the fetched origin/main {main}"
        state["batch"] = batch
        return state
    batch["landed_commits"] = git(shared, "rev-list", f"{start}..{main}").stdout.split()
    batch["unlisted"], why = batch_chain(shared, start, rows, main)
    if why:
        batch["why"] = why
    batch["limits"] = batch_limits(shared, start, fields, rows, holder)
    batch["plans"] = any(name.startswith("Plans/") for name in changed_paths(shared, start, main))
    state["batch"] = batch
    return state


def close_lines(start: str) -> list[str]:
    return [f"close it under the lock at the current main: one follow-up commit for its Plans paths, if it has any, then "
            f"release the lock (reports/landing-checks/README.md, \"Landing by hand\"). Its batch-start is {start}."]


def batch_status(shared: Path, lock_dir: Path) -> int:
    state = batch_state(shared, lock_dir)
    holder = state["holder"]
    if not holder["held"]:
        say("lock: free; no batch is open")
        return 0
    fields = holder["fields"]
    say(f"lock: HELD by {fields.get('agent') or '(unnamed)'} on {fields.get('branch') or '?'}; {holder['reason']}"
        + ("; PROVEN DEAD" if holder["dead"] else ""))
    if holder["kind"] == "hand":
        say("holder: written by hand (the 90-minute rule), or a stopped tool landing")
    batch = state["batch"]
    if batch is None:
        say("batch: none; holder.txt names no batch-start")
        return 0
    say(f"batch: open at batch-start {batch['start']}")
    if batch.get("why"):
        say(f"  cannot judge it: {batch['why']}")
        return 0
    say(f"  main: {state['main'][:12]}, with {len(batch['landed_commits'])} commit(s) since batch-start")
    for row in batch["rows"]:
        try:
            Path(row["receipt"]).read_bytes()
            note = ""
        except OSError:
            note = "  (receipt unreadable: the next member cannot compare with it)"
        say(f"  [landing] {row['branch']} {row['sha']}  {row['receipt']}{note}")
    for row in batch["malformed"]:
        say(f"  [unreadable] batch-landing row not `<branch> <sha> <receipt>`: {row!r}; the counts below cannot be "
            "trusted")
    if batch["unlisted"]:
        say(f"  [missing] {len(batch['unlisted'])} commit(s) on main since batch-start have no `batch-landing` row: "
            + ", ".join(name[:12] for name in batch["unlisted"][:10]))
    if not batch["landed_commits"] and not batch["rows"]:
        say("  no landing yet: this member opens the batch")
    for limit in batch["limits"]:
        say(("  [ok] " if limit["within"] else "  [stop] ") + limit["text"])
    if batch["plans"]:
        say("  Plans/: a path changed since batch-start, so the batch owes one snapshot and baseline follow-up at close")
    else:
        say("  Plans/: no path changed since batch-start, so the batch needs no follow-up")
    if holder["dead"] and batch["landed"]:
        say("  it landed something, so it is closed, not cleared:")
        for line in close_lines(batch["start"]):
            say("  " + line)
    elif holder["dead"]:
        say("  it landed nothing, so it may be cleared: the lock is free once the 90-minute rule says so")
    return 0


def batch_check_lines(report: dict[str, Any]) -> list[str]:
    """The comparison lines the report printed, re-emitted so the lander sees what the tool read."""
    lines = []
    for name in report.get("gone_ids") or []:
        lines.append(f"  [gone] {name}")
    for name, total in (report.get("totals") or {}).items():
        lines.append(f"  [total] {name}  {'timed out' if total is None else total}")
    for name, count in sorted((report.get("bucket_counts") or {}).items()):
        lines.append(f"  [count] {name}  {count}")
    return lines


def judge_batch_member(shared: Path, start: str, code: int, report: Optional[dict[str, Any]],
                       rows: Optional[dict[str, Any]], rows_unread: Sequence[str],
                       earlier: Sequence[dict[str, Any]], earlier_unread: Sequence[str],
                       own_base: Optional[str], head: str,
                       check_source: Optional[str], total: int) -> tuple[int, list[str], Optional[tuple[str, str]]]:
    """One member's report against its predecessor's bound receipt: (exit code, lines, the difference or None).

    `earlier` is the predecessor's member, read from the holder's last row: the strict rule compares a member with
    the one before it, and the earlier landings are enforced when each of them landed. `total` is this member's place
    in the batch (the holder's rows plus this one), so member 3 and 4 name the predecessor as "member 2 of 3" and
    "member 3 of 4" rather than as the second of two. The exit code is the tool's own: 0 judged, no difference; 1 a
    difference or a judgement owed first (the lines say which). The difference is None when none was found, so
    `verify --batch-start` can refuse on it alone and leave an owed judgement to the lander, exactly as a single
    landing is judged.
    """
    lines: list[str] = []
    difference: Optional[tuple[str, str]] = None
    if check_source is None:
        shown = git(shared, "show", f"{head}:scripts/pm-landing-check.py", check=False)
        if shown.returncode:
            raise Refusal(f"cannot read scripts/pm-landing-check.py at {head} in {shared}; pass --check-source")
        check_source = shown.stdout
    can_batch = check_can_batch(check_source)
    later = bool(earlier) or bool(earlier_unread)
    if not can_batch:
        lines.append("no batch: the landing check at this commit does not print the lines a batch compares "
                     "(--row-report, gone ids, subcheck totals, bucket counts).")
        if later:
            lines.append("this landing is judged alone: close the batch with its follow-up at the current main, then "
                         "rebase on the new origin/main and run its check alone.")
        else:
            lines.append("land it alone: no batch opens on a landing check that does not print those lines.")
        return 1, lines, ("batch_check_too_old", "the landing check at this commit does not print the lines a batch "
                                                 "compares")
    if report is None:
        lines.append("no batch: the receipt's report is not the JSON `pm-landing-check.py --json` writes, so the "
                     "comparison lines a batch reads are not there. Land it alone (the batch stays closed).")
        return 1, lines, ("batch_report_unreadable", "the receipt's report is not the JSON the landing check writes")
    lines.append("comparison lines this report printed:")
    lines.extend(batch_check_lines(report))
    if report["crashed"] or (code == 1 and report["infrastructure"] is None):
        lines.append("the landing check did not finish judging (" + ("a traceback" if report["crashed"] else "no Infrastructure line")
                     + " in its report), so nothing excuses it: close the batch, fix the cause, and run the check alone.")
        return 1, lines, ("batch_report_unreadable", "the landing check did not finish judging")
    if code not in (0, 1):
        lines.append(f"the landing check exited {code}: that alone decides this landing, and a member may only stay on exit 0 "
                     "or 1. Close the batch and treat the landing by the report.")
        return 1, lines, ("batch_exit", f"the landing check exited {code}")
    owed = []
    if code == 1 and report["infrastructure"]:
        owed.append(f"{report['infrastructure']} subcheck(s) did not finish (timed out or were killed). "
                    "Rerun each on its own and judge what it reports")
    if code == 1 and report["compare"]:
        owed.append(f"{report['compare']} pre-existing failure(s) changed content on files this branch touched: compare those "
                    "with the baseline's rows")
    # A report or receipt the batch needs and cannot read is a difference, never silence, and it is decided before
    # any success: the first member's corrupt row report is as unreadable as the second member's (review SOL F6).
    if rows_unread:
        difference = ("batch_row_report_unreadable", "a row report this batch needs could not be read ("
                      + "; ".join(rows_unread) + "), so the rows are not known")
    elif earlier_unread:
        difference = ("batch_earlier_receipt_unreadable", "the previous member's receipt cannot be read ("
                      + "; ".join(earlier_unread) + "), so the report this landing is compared with is not bound to its "
                      "commit")
    if difference:
        lines.append(f"TRIGGER {difference[0]}: {difference[1]}.")
        lines.append("this landing is judged alone: close the batch with its follow-up at the current main, then rebase on "
                     "the new origin/main, rerun the check alone and judge it as usual.")
        return 1, lines, difference
    if report["totals"] is None or report["bucket_counts"] is None:
        lines.append("no batch: this report does not print the subcheck totals and bucket counts a comparison reads, "
                     "so no later member could compare with it. Land it alone (the batch stays closed).")
        return 1, lines, ("batch_check_too_old", "this report does not print the subcheck totals and bucket counts a "
                                                 "comparison reads")
    if not later:
        if report["ids_unread"]:
            lines.append("no batch: this report's gone ids do not add up, so no later member could compare with it. "
                         "Land it alone (the batch stays closed).")
            return 1, lines, ("batch_check_too_old", "this report's gone ids do not add up")
        lines.append("no trigger applies: this is the first member of the batch, with no earlier report to compare with. "
                     "It may stay.")
        for what in owed:
            lines.append(f"judge first: {what}; then it may stay.")
        return (1 if owed else 0), lines, None
    previous = earlier[-1]
    own = sorted(changed_paths(shared, own_base, head)) if own_base else []
    difference = strict_difference(report, rows, previous["report"], previous["rows"], own, total)
    if not difference and own_base:
        reverted = sorted(changed_paths(shared, own_base, head) - changed_paths(shared, start, head))
        if reverted:
            difference = ("batch_reverted_path", "this landing put back what an earlier member of the batch changed, so "
                                                 "the check, measuring from batch-start, does not read it as touched: "
                          + ", ".join(reverted[:10]))
    if difference:
        lines.append(f"TRIGGER {difference[0]}: {difference[1]}.")
        lines.append("this landing is judged alone: close the batch with its follow-up at the current main, then rebase on "
                     "the new origin/main, rerun the check alone and judge it as usual.")
        return 1, lines, difference
    lines.append("no trigger: this report is the previous member's, apart from this landing's own governance staleness "
                 "printed in full, so this landing may stay.")
    for what in owed:
        lines.append(f"judge first: {what}; then it may stay.")
    return (1 if owed else 0), lines, None


def batch_receipt(path: Path) -> dict[str, Any]:
    """What a batch judges a member by, read from the record.json `check` printed.

    There is no checkout to fall back on: the receipt names the checked commit, the batch-start it was measured
    against, the report and row report it binds and the landing check's own exit, so a lander cannot leave any of
    them to another checkout's HEAD.
    """
    try:
        record = json.loads(path.read_bytes())
    except OSError as exc:
        raise Refusal(f"cannot read the receipt {path}: {exc}") from exc
    except ValueError as exc:
        raise Refusal(f"the receipt {path} is not JSON: {exc}") from exc
    if not isinstance(record, dict):
        raise Refusal(f"the receipt {path} is not a JSON object")
    for key in ("head", "base", "exit_code", "report"):
        if key not in record:
            raise Refusal(f"the receipt {path} records no {key}: it is not the record.json pm-land.py check prints")
    for key, label in (("head", "target commit"), ("base", "checked base")):
        if not valid_full_sha(record[key]):
            raise Refusal(f"receipt {label} must be a full 40-character SHA, never a moving name: {record[key]!r}")
    if record["exit_code"] not in (0, 1, 2, 3):
        raise Refusal(f"receipt exit_code is not a landing check exit: {record['exit_code']!r}")
    return record


def receipt_report(record: dict[str, Any], label: str) -> str:
    """The report a receipt binds, refused when it is missing, has no recorded digest, or is no longer those bytes.

    A receipt without a `report_sha256` binds nothing: skipping the check would let a report for another run be read
    as this member's (review R3-N1).
    """
    path = record.get("report")
    if not isinstance(path, str) or not path:
        raise Refusal(f"the {label} records no landing check report")
    try:
        raw = Path(path).read_bytes()
    except OSError as exc:
        raise Refusal(f"cannot read the {label}'s report {path}: {exc}") from exc
    recorded = record.get("report_sha256")
    if not isinstance(recorded, str):
        raise Refusal(f"the {label} records no SHA-256 for its report {path}, so the report is not bound to this receipt")
    if hashlib.sha256(raw).hexdigest() != recorded:
        raise Refusal(f"the {label}'s report {path} no longer matches the SHA-256 its receipt records")
    return raw.decode("utf-8", errors="replace")


def receipt_rows(record: dict[str, Any]) -> tuple[Optional[dict[str, Any]], bool]:
    """The row report a receipt binds, and whether the check was asked for one.

    None with `asked` true is a row report the batch cannot read: missing, corrupt, not the schema, or no longer the
    bytes the receipt recorded. The caller makes that a trigger, never silence, because a rise the row reports alone
    can show would otherwise pass unseen.
    """
    path = record.get("row_report")
    argv = record.get("argv") if isinstance(record.get("argv"), list) else []
    asked = isinstance(path, str) or "--row-report" in argv
    if not isinstance(path, str):
        return None, asked
    try:
        raw = Path(path).read_bytes()
    except OSError:
        return None, asked
    recorded = record.get("row_report_sha256")
    if not isinstance(recorded, str) or hashlib.sha256(raw).hexdigest() != recorded:
        # No digest binds nothing, exactly as a wrong one binds the wrong bytes: unreadable, never a clear (R3-N1).
        return None, asked
    try:
        doc = json.loads(raw)
    except ValueError:
        return None, asked
    return (doc if isinstance(doc, dict) and doc.get("schema_id") == ROW_REPORT_SCHEMA else None), asked


def earlier_member(row: dict[str, str], start: str) -> tuple[Optional[dict[str, Any]], Optional[str]]:
    """One earlier landing's receipt, report and row report, read from its `batch-landing` row.

    Every binding is re-hashed here: the receipt names the row's commit and the batch-start, and the receipt's
    SHA-256 binds the report and row report. A swapped, edited or wrong-member file is (None, why), which
    `batch-check` turns into a trigger, never into silence (review SOL D2, ASTRA F4).
    """
    path = Path(row["receipt"])
    who = f"{row['branch']} {row['sha'][:12]}"
    try:
        raw = path.read_bytes()
    except OSError as exc:
        return None, f"{who}: cannot read its receipt {path}: {exc}"
    try:
        record = json.loads(raw)
    except ValueError as exc:
        return None, f"{who}: its receipt {path} is not JSON: {exc}"
    if not isinstance(record, dict):
        return None, f"{who}: its receipt {path} is not a JSON object"
    if record.get("head") != row["sha"]:
        return None, f"{who}: its receipt names commit {record.get('head')!r}, not the row's {row['sha']}"
    if record.get("base") != start:
        return None, (f"{who}: its receipt was measured against {record.get('base')!r}, "
                      f"not the batch-start {start}")
    if record.get("exit_code") not in (0, 1):
        return None, (f"{who}: its receipt records landing checker exit {record.get('exit_code')!r}, so it did not "
                      "land as a batch member")
    try:
        report_text = receipt_report(record, f"{who}'s receipt")
    except Refusal as exc:
        return None, str(exc)
    report = batch_report(report_text)
    if report is None:
        return None, f"{who}: its report is not the JSON the landing check writes"
    written = json.loads(report_text)
    if written.get("commit") != row["sha"] or written.get("base") != start:
        return None, (f"{who}: its report was written for commit {written.get('commit')!r} against "
                      f"{written.get('base')!r}, not for the row's {row['sha']} against {start}")
    if not shows_what_changed(report, []):
        return None, f"{who}: its report does not print the comparison lines a batch needs"
    rows, asked = receipt_rows(record)
    if rows is None:
        return None, f"{who}: its receipt " + ("records a row report that cannot be read" if asked
                                               else "records no row report")
    if rows.get("base") != start:
        return None, f"{who}: its row report was written against {rows.get('base')!r}, not the batch-start {start}"
    return {"row": row, "report": report, "rows": rows}, None


def batch_check(shared: Path, lock_dir: Path, receipt_path: Path, check_source: Optional[Path]) -> int:
    record = batch_receipt(receipt_path)
    start, head, code = record["base"], record["head"], record["exit_code"]
    shown = git(shared, "rev-parse", ORIGIN_MAIN + "^{commit}", check=False)
    if shown.returncode:
        raise Refusal(f"cannot read the fetched origin/main in {shared}; fetch it first")
    main = sha(shown.stdout.strip(), "fetched origin/main")
    if not is_ancestor(shared, start, main):
        raise Refusal(f"the receipt's batch-start {start} is not on the fetched origin/main {main}")
    holder = holder_verdict(lock_dir)
    if not holder["held"]:
        raise Refusal(f"no batch is open: the landing lock is free, so there is nothing for this landing to stay in")
    fields = holder["fields"]
    if fields.get("batch-start-conflict"):
        raise Refusal("holder.txt names two batch-starts: " + fields["batch-start-conflict"]
                      + "; rewrite it with the one open batch's")
    if fields.get("batch-start") != start:
        raise Refusal(f"the receipt's base {start} is not the open batch's batch-start "
                      f"({fields.get('batch-start') or 'none'} in holder.txt)")
    earlier_rows, malformed = batch_rows(fields)
    if malformed:
        raise Refusal("holder.txt has batch-landing rows this check cannot read: "
                      + "; ".join(repr(row) for row in malformed)
                      + ". Repair the holder: write `batch-landing: <branch> <main SHA it pushed> <receipt path>` "
                        "for each landing, then rerun")
    # The chain from the batch-start to current main is the record of what has landed: check it before numbering
    # this member, so a pushed landing missing from the holder is a refusal to repair, never a silent first member
    # (review ASTRA F3).
    unlisted, why = batch_chain(shared, start, earlier_rows, main)
    if why:
        raise Refusal(why + ". Repair the holder, then rerun")
    if unlisted:
        raise Refusal(f"{len(unlisted)} commit(s) on the fetched origin/main since batch-start {start} have no "
                      "`batch-landing` row: " + ", ".join(name[:12] for name in unlisted[:10])
                      + ". Write one `batch-landing: <branch> <main SHA it pushed> <receipt path>` line per landing; "
                        "repair the holder, then rerun")
    require_batch_limits(shared, start, fields, earlier_rows, holder)
    own_base = earlier_rows[-1]["sha"] if earlier_rows else None
    predecessor = own_base or start
    resolved_head = commit_or_refuse(shared, head, "the receipt's commit")
    if not is_ancestor(shared, start, resolved_head):
        raise Refusal(f"the receipt's commit {resolved_head} is not a descendant of its batch-start {start}:"
                      " a batch member is rebased on the batch-start")
    if is_ancestor(shared, resolved_head, main):
        raise Refusal(f"the receipt's commit {resolved_head} is already on the fetched origin/main {main}: a member's "
                      "receipt names the commit it is about to push, so run check on the new commit")
    if not is_ancestor(shared, predecessor, resolved_head):
        raise Refusal(f"the receipt's commit {resolved_head} is not a descendant of the batch's current main "
                      f"{predecessor}: the push would not be a fast-forward")
    report_text = receipt_report(record, "receipt")
    report = batch_report(report_text)
    if report is not None:
        written = json.loads(report_text)
        if written.get("commit") != head or written.get("base") != start:
            raise Refusal(f"the receipt names commit {head} against batch-start {start}, but its report was written "
                          f"for commit {written.get('commit')!r} against {written.get('base')!r}: the receipt does not "
                          "bind this report, so rerun check on this commit")
    rows, rows_asked = receipt_rows(record)
    rows_unread: list[str] = []
    if rows is None:
        rows_unread.append("this member's, which its receipt " + ("records and cannot be read" if rows_asked else
                                                                 "does not record: check with --base <batch-start> so "
                                                                 "it writes one"))
    elif rows.get("base") != start:
        rows_unread.append(f"this member's, which was written against {rows.get('base') or 'no base'}")
        rows = None
    # The strict rule compares a member with the one before it, so only the last row's receipt is read: the earlier
    # ones were each enforced when they landed, and re-hashing one the comparison does not read adds nothing.
    earlier: list[dict[str, Any]] = []
    earlier_unread: list[str] = []
    if earlier_rows:
        member, why = earlier_member(earlier_rows[-1], start)
        if member is None:
            earlier_unread.append(why)
        else:
            earlier.append(member)
    source_text = None
    if check_source is not None:
        try:
            source_text = check_source.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            raise Refusal(f"cannot read --check-source {check_source}: {exc}") from exc
    code_out, lines, _difference = judge_batch_member(shared, start, code, report, rows, rows_unread, earlier,
                                                      earlier_unread, own_base, resolved_head, source_text,
                                                      len(earlier_rows) + 1)
    for line in lines:
        say(line)
    return code_out


def batch_chain(shared: Path, start: str, rows: Sequence[dict[str, str]],
                main: str) -> tuple[list[str], Optional[str]]:
    """Whether the `batch-landing` rows read as a chain of landings from the batch-start to main.

    A row names one landing: its branch and the main SHA it pushed, which covers every commit that fast-forward
    brought in, however many there are. So the rows climb from the batch-start, each an ancestor of the next, and
    the last must be the current main: main commits above it, or a row off the chain, mean the record and main
    disagree. Returns the main commits no row covers, and why the rows are not such a chain (None when they are).
    """
    if not is_ancestor(shared, start, main):
        return [], f"batch-start {start} is not on the fetched origin/main {main}"
    last = start
    for row in rows:
        if not is_ancestor(shared, last, row["sha"]):
            return [], (f"the `batch-landing` rows are not a chain from the batch-start: {row['sha'][:12]} "
                        f"({row['branch']}) does not descend from {last[:12]}")
        last = row["sha"]
    if not is_ancestor(shared, last, main):
        return [], f"the last `batch-landing` row {last[:12]} is not on the fetched origin/main {main}"
    return git(shared, "rev-list", f"{last}..{main}").stdout.split(), None


def require_open_batch(shared: Path, start: str, main: str) -> list[dict[str, str]]:
    """A batch member's base is accepted only while holder.txt still opens that batch and lists every landing since.

    Returns the validated rows. Review R7-B1: the caller hands these to `require_batch_judgment`, so nothing reads
    `holder.txt` a second time and judges a different batch from the one this accepted.
    """
    holder = holder_verdict(LOCK_DIR)
    if not holder["held"]:
        raise Refusal(f"no open batch: {LOCK_DIR / 'held/holder.txt'} cannot be read, and a member's receipt is verified "
                      "against its batch-start only inside the batch")
    fields = holder["fields"]
    if fields.get("batch-start-conflict"):
        raise Refusal("holder.txt names two batch-starts: " + fields["batch-start-conflict"]
                      + "; rewrite it with the one open batch's")
    named = fields.get("batch-start")
    if named != start:
        raise Refusal(f"batch-start {start} is not the open batch's batch-start ({named or 'none'} in holder.txt)")
    rows, malformed = batch_rows(fields)
    if malformed:
        raise Refusal("holder.txt has batch-landing rows this check cannot read: " + "; ".join(repr(row) for row in malformed))
    unlisted, why = batch_chain(shared, start, rows, main)
    if why:
        raise Refusal(why + ". Repair the holder, then rerun")
    if unlisted:
        raise Refusal(f"{len(unlisted)} commit(s) on origin/main since batch-start {start} are not listed as a "
                      "`batch-landing: <branch> <sha> <receipt>` row in holder.txt whose chain ends at the current "
                      "main: " + ", ".join(name[:12] for name in unlisted[:10]) + ". Repair the holder, then rerun")
    require_batch_limits(shared, start, fields, rows, holder)
    return rows


CLOSE_PATHS = ("Plans/.plan_migration/",)


def batch_close_outside(changed: Sequence[str]) -> list[str]:
    """Paths a batch's closing follow-up may not change: the snapshot and the baseline are its own."""
    return sorted(name for name in changed
                  if name != BASELINE_FILE and not name.startswith(CLOSE_PATHS))


def require_batch_close(shared: Path, pinned: str, head: str) -> str:
    """The open batch's closing follow-up, bound to its last landing, or a refusal.

    Review OPUS A1: the ordinary `verify` must not be a way past the batch judgment, so the one landing the rule
    needs after a batch's last member has its own route: `holder.txt` must still open the batch, `origin/main` must
    be its last `batch-landing` row, and the commit may change only the plan-migration snapshot and the baseline.
    """
    holder = holder_verdict(LOCK_DIR)
    if not holder["held"]:
        raise Refusal("--batch-close closes an open batch, and the landing lock is free: there is no batch to close")
    fields = holder["fields"]
    if fields.get("batch-start-conflict"):
        raise Refusal("holder.txt names two batch-starts: " + fields["batch-start-conflict"]
                      + "; rewrite it with the one open batch's")
    start = fields.get("batch-start")
    if not start:
        raise Refusal("--batch-close closes an open batch, and holder.txt names no batch-start")
    if not valid_full_sha(start):
        raise Refusal(f"batch-start is not a full 40-character SHA: {start!r}")
    if not is_ancestor(shared, start, pinned):
        raise Refusal(f"batch-start {start} is not on the fetched origin/main {pinned}")
    rows, malformed = batch_rows(fields)
    if malformed:
        raise Refusal("holder.txt has batch-landing rows this check cannot read: " + "; ".join(repr(row) for row in malformed))
    if not rows:
        raise Refusal(f"the open batch lists no landing, and origin/main is its batch-start {start}: there is nothing to "
                      "close, so clear the holder or release the lock instead")
    unlisted, why = batch_chain(shared, start, rows, pinned)
    if why:
        raise Refusal(why + ". Repair the holder, then rerun")
    if rows[-1]["sha"] != pinned:
        raise Refusal(f"origin/main is {pinned}, but the batch's last landing is {rows[-1]['sha']}: a closing follow-up "
                      "is verified against the main its last landing pushed, so fetch and verify again")
    changed = changed_paths(shared, pinned, head)
    if not changed:
        # A close with nothing to record is not the batch's one follow-up: it leaves the snapshot and the baseline
        # exactly as the last landing left them (R8-N2).
        raise Refusal("a batch's closing follow-up changes the plan-migration snapshot and "
                      f"{BASELINE_FILE}; this commit changes nothing, so there is no follow-up to verify")
    outside = batch_close_outside(changed)
    if outside:
        raise Refusal("a batch's closing follow-up changes only the plan-migration snapshot and "
                      f"{BASELINE_FILE}; this commit also changes " + ", ".join(outside[:10])
                      + ". Land that as its own landing outside the batch, or reduce this one to the snapshot and the "
                        "baseline")
    if BASELINE_FILE not in changed:
        # The baseline is the batch's own record: a snapshot alone would leave the next lander judging this batch's
        # landings by a baseline the close never wrote (R8-N2).
        raise Refusal(f"a batch's closing follow-up must include {BASELINE_FILE}, the baseline its landings are judged "
                      "against; this commit changes only the snapshot")
    return start


def require_record_bytes(path: Path, raw: bytes, record: dict[str, Any], batch: bool) -> None:
    """The bytes verification read are still the bytes on disk: the receipt, and in batch mode its report and rows."""
    if path.read_bytes() != raw:
        raise Refusal(f"receipt changed during verification: {path}")
    if not batch:
        return
    for key, digest, label in (("report", "report_sha256", "report"),
                               ("row_report", "row_report_sha256", "row report")):
        name = record.get(key)
        if not isinstance(name, str) or not name:
            continue
        try:
            current = Path(name).read_bytes()
        except OSError as exc:
            raise Refusal(f"the {label} {name} changed during verification: {exc}") from exc
        recorded = record.get(digest)
        if not isinstance(recorded, str) or hashlib.sha256(current).hexdigest() != recorded:
            raise Refusal(f"the {label} {name} no longer matches the SHA-256 its receipt records: it changed during "
                          "verification")


def require_batch_judgment(shared: Path, start: str, head: str, predecessor: str,
                           record: dict[str, Any], rows: Sequence[dict[str, str]], total: int) -> None:
    """The strict rule, judged here and now under the lock: an earlier `batch-check` result is never enough.

    Review ASTRA A2-4: `batch-check` runs before the lock, and a landing can hand over between it and the push, so a
    candidate admitted as the first member can become a second member whose report is not the new one's. `verify`
    therefore judges the receipt it is about to verify against the pinned `predecessor` it publishes on, reading the
    previous member's receipt from the rows `require_open_batch` just validated.

    Review R7-B1: those rows, never a second read of `holder.txt`. A read after the validation could see a cleared,
    edited or malformed holder and fall back to "first member"; here an empty row list is only a first member when
    the pinned predecessor is the batch-start, and anything else refuses.
    """
    if rows:
        if rows[-1]["sha"] != predecessor:
            raise Refusal(f"the batch's last landing is {rows[-1]['sha']}, but this verification pins origin/main at "
                          f"{predecessor}: the judgment and the publication would not be about the same predecessor")
    elif predecessor != start:
        # The row list require_open_batch validated is empty, but origin/main is past the batch-start: the holder no
        # longer names the landing this verification publishes on. Fail closed (review R7-B1).
        raise Refusal(f"this verification pins origin/main at {predecessor}, but holder.txt lists no `batch-landing` "
                      f"row and its batch-start is {start}: the record of what landed inside the batch is gone. Repair "
                      "the holder with every landing, then rerun")
    earlier: list[dict[str, Any]] = []
    earlier_unread: list[str] = []
    if rows:
        member, why = earlier_member(rows[-1], start)
        if member is None:
            earlier_unread.append(why)
        else:
            earlier.append(member)
    report = batch_report(receipt_report(record, "receipt"))
    rows_doc, rows_asked = receipt_rows(record)
    rows_unread: list[str] = []
    if rows_doc is None:
        rows_unread.append("this member's, which its receipt "
                           + ("records and cannot be read" if rows_asked else "does not record"))
    elif rows_doc.get("base") != start:
        rows_unread.append(f"this member's, which was written against {rows_doc.get('base') or 'no base'}")
        rows_doc = None
    _code, lines, difference = judge_batch_member(shared, start, record["exit_code"], report, rows_doc, rows_unread,
                                                 earlier, earlier_unread, predecessor if rows else None, head, None,
                                                 total)
    if difference:
        raise Refusal(f"this landing cannot stay in the batch: {difference[1]}. Close the batch with its follow-up at "
                      "the current main, then rebase on the new origin/main, rerun the check alone and judge it as "
                      "usual")
    if lines:
        say(lines[-1])


def verify_receipt(path, commit=None, base=None, batch_start=None, batch_close=False):
    path = path.absolute()
    folder = require_run_folder(path.parent)
    if path.name != "record.json" or path.is_symlink():
        raise Refusal("use the record.json receipt printed by pm-land.py check")
    raw = path.read_bytes()
    record = json.loads(raw)
    host = record["host"]
    if host not in HOSTS:
        raise Refusal(f"unknown checking host in receipt: {host}")
    head = sha(record["head"] if commit is None else commit, "target commit")
    checked_base = sha(record["base"] if base is None else base, "checked base")
    ref = record["topic"]
    if check_ref(ref.removeprefix("refs/heads/")) != ref:
        raise Refusal(f"invalid topic ref in receipt: {ref}")
    tree = revision(SHARED, head + "^{tree}")
    verify_record(folder, record, host, ref, head, tree, checked_base)
    # One publication tip, read once and pinned: every later read must still be this commit, and the hand push
    # leases on exactly the value printed at the end (review SOL D1, ASTRA F1/F2).
    pinned = full_main(SHARED)
    closing = None
    if batch_start is None:
        if pinned != checked_base:
            raise Refusal(f"shared origin/main differs from the receipt base {checked_base}; fetch and check again")
        if batch_close:
            closing = require_batch_close(SHARED, pinned, head)
        else:
            # Review OPUS A1: the single-landing route must not skip a batch's judgment. An open batch whose
            # batch-start is behind origin/main has landed at least one member, so nothing ordinary lands until it
            # closes; a batch with nothing landed yet is still at its batch-start and passes, as its first member
            # is judged exactly as a single landing.
            holder = holder_verdict(LOCK_DIR)
            fields = holder["fields"] if holder["held"] else {}
            if fields.get("batch-start-conflict"):
                raise Refusal("holder.txt names two batch-starts: " + fields["batch-start-conflict"]
                              + "; rewrite it with the one open batch's")
            start = fields.get("batch-start")
            if not start and (fields.get("batch-landing") or fields.get("batch-first-push")
                              or fields.get("batch-first-push-conflict")):
                raise Refusal("holder.txt carries batch landing/push lines without a `batch-start:` line; "
                              "rewrite it with the open batch's `batch-start:` before landing")
            if start and not valid_full_sha(start):
                raise Refusal(f"holder.txt names a batch-start that is not a full 40-character SHA: {start!r}; rewrite "
                              "it with the one open batch's batch-start")
            if start and pinned != start:
                raise Refusal(f"holder.txt names an open batch at batch-start {start}, and origin/main {pinned} has "
                              "moved past it: a landing inside the batch is verified with --batch-start <that SHA>, and "
                              "the batch's closing follow-up with --batch-close. Nothing else lands until it closes")
    else:
        # Batch mode: the receipt's base is the batch-start, which is behind main once the first member pushed.
        # The rule's own record must still open exactly that batch, and every commit main has landed since it
        # must be one of its listed landings: a receipt never covers a commit the batch does not name.
        checked_batch = sha(batch_start, "batch-start")
        if checked_base != checked_batch:
            raise Refusal(f"a batch member's receipt base is {checked_base}, but --batch-start is {checked_batch}. Inside "
                          "a batch, check with --base <full batch-start> so the receipt is judged against the batch.")
        held_rows = require_open_batch(SHARED, checked_batch, pinned)
        if record["exit_code"] not in (0, 1):
            raise Refusal(f"the receipt records landing checker exit {record['exit_code']}: a batch member may only "
                          "stay on exit 0 or 1, so this landing is judged by its report, not as a batch member")
        if not record.get("row_report"):
            raise Refusal("the receipt records no row report: inside a batch, check with --base <full batch-start> on "
                          "a landing check that prints --row-report, so the next member has what it compares with")
        if not is_ancestor(SHARED, pinned, head):
            raise Refusal(f"origin/main {pinned} is not an ancestor of the checked commit {head}: rebase on the current "
                          "origin/main and check again, so the push is a fast-forward")
        # The strict rule, judged under the lock against the pinned predecessor: an earlier batch-check is never
        # enough, because the handoff can change which member this receipt is (review ASTRA A2-4). It reads the
        # rows validated just above, never `holder.txt` again (review R7-B1).
        require_batch_judgment(SHARED, checked_batch, head, pinned, record, held_rows, len(held_rows) + 1)
    if git(SHARED, "symbolic-ref", "--quiet", "HEAD", check=False).stdout.strip() != MAIN_REF:
        raise Refusal("shared checkout must be on main")
    shared_head = revision(SHARED, "HEAD^{commit}")
    behind = (lambda base: shared_head != head and not is_ancestor(SHARED, shared_head, base))
    if batch_start is not None:
        consistent = not behind(pinned) and is_ancestor(SHARED, checked_base, head)
    else:
        consistent = not behind(checked_base) and is_ancestor(SHARED, checked_base, head)
    if not consistent:
        raise Refusal(f"shared HEAD {shared_head} or candidate {head} is inconsistent with base {checked_base}")
    digest = hashlib.sha256(raw).hexdigest()
    verifier = Path(__file__).read_text(encoding="utf-8")
    for attempt in range(SSH_FAILURE_LIMIT):
        result = ssh(host, "python3", "-B", "-", str(folder), host, digest, input_text=verifier, check=False)
        if result.returncode != 255 or attempt + 1 == SSH_FAILURE_LIMIT:
            break
        time.sleep(15)
    if result.returncode:
        raise Refusal(f"could not verify the receipt witness on {host} (exit {result.returncode}):"
                      f" {result.stderr.strip()}")
    tips = origin_refs(SHARED, MAIN_REF, ref)
    if tips[MAIN_REF] != pinned:
        raise Refusal(f"origin/main moved from {pinned} to {tips[MAIN_REF]} during verification")
    if batch_start is not None:
        # Re-read the rule's record after the witness: an open batch, every landing named, no unlisted commit.
        require_open_batch(SHARED, checked_base, pinned)
    if closing is not None:
        # R8-N3: the witness runs for a while and the holder can be rewritten under it; the close is bound to the
        # batch it read, so a holder that no longer opens it refuses here rather than after publication.
        closing = require_batch_close(SHARED, pinned, head)
    if tips[ref] != head:
        raise Refusal(f"published topic {ref} changed from checked commit {head} to {tips[ref]}")
    publication_preflight(SHARED, checked_base, head, record["ignored_inputs"])
    require_record_bytes(path, raw, record, batch_start is not None)
    if batch_start is not None:
        # The preflight scans the whole tree; neither origin/main nor the rule's record may move while it runs.
        moved = full_main(SHARED)
        if moved != pinned:
            raise Refusal(f"origin/main moved from {pinned} to {moved} during verification")
        held_rows = require_open_batch(SHARED, checked_base, pinned)
        if not is_ancestor(SHARED, pinned, head):
            raise Refusal(f"origin/main {pinned} is no longer an ancestor of the checked commit {head}")
        require_batch_judgment(SHARED, checked_batch, head, pinned, record, held_rows, len(held_rows) + 1)
        say(f"Verified {head} against batch-start {checked_base} on {host}. Landing checker exit {record['exit_code']}.")
    else:
        moved = full_main(SHARED)
        if moved != pinned:
            raise Refusal(f"origin/main moved from {pinned} to {moved} during verification")
        if closing is not None:
            # The preflight scans the whole tree, so the holder is read once more after it, as a batch member's is.
            closing = require_batch_close(SHARED, pinned, head)
            say(f"Verified {head} against {checked_base} on {host} as the closing follow-up of the batch at {closing}. "
                f"Landing checker exit {record['exit_code']}.")
        else:
            say(f"Verified {head} against {checked_base} on {host}. Landing checker exit {record['exit_code']}.")
    say(f"PUBLISH_LEASE={pinned}")
    return 0


def require_run_folder(folder):
    if folder.is_symlink() or folder.parent != RUNS or folder.resolve(strict=True).parent != RUNS.resolve(strict=True):
        raise Refusal(f"receipt folder is outside the landing evidence directory: {folder}")
    return folder


def require_host(host):
    if socket.gethostname() != MACHINES[host]:
        raise Refusal(f"SSH reached {socket.gethostname()}, expected {MACHINES[host]}")


def verify_worker(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument("folder", type=Path)
    parser.add_argument("host", choices=HOSTS)
    parser.add_argument("receipt_sha256")
    args = parser.parse_args(argv)
    require_host(args.host)
    remote_verify(require_run_folder(args.folder), args.receipt_sha256)
    return 0


def worker_main(argv):
    parser = argparse.ArgumentParser()
    jobs = parser.add_subparsers(dest="mode", required=True)
    check = jobs.add_parser("check")
    check.add_argument("host", choices=HOSTS)
    check.add_argument("ref")
    check.add_argument("head")
    check.add_argument("tree")
    check.add_argument("base")
    check.add_argument("main", nargs="?", default=None)
    check.add_argument("rows", nargs="?", default="")
    cleanup = jobs.add_parser("cleanup")
    cleanup.add_argument("host", choices=HOSTS)
    args = parser.parse_args(argv)
    folder = require_run_folder(Path(__file__).absolute().parent)
    require_host(args.host)
    if args.mode == "check":
        remote_check(folder, args.host, args.ref, args.head, args.tree, args.base, args.main, args.rows == "rows")
    else:
        remote_cleanup(folder, args.host)
    return 0


def main(argv=None):
    try:
        if __file__ == "<stdin>":
            return verify_worker(argv)
        if Path(__file__).name == "worker.py":
            return worker_main(argv)
        parser = argparse.ArgumentParser(description=__doc__)
        commands = parser.add_subparsers(dest="command", required=True)
        check = commands.add_parser("check", help="run remote landing checks on a pushed branch")
        check.add_argument("branch")
        check.add_argument("--on", choices=HOSTS, default=DEFAULT_HOST)
        check.add_argument("--base", help="the commit this branch is measured against: the fetched origin/main by "
                                          "default; inside a batch, its full batch-start SHA")
        verify = commands.add_parser("verify", help="read-only verification under the hand lander's lock")
        mode = verify.add_mutually_exclusive_group(required=True)
        mode.add_argument("--receipt", type=Path)
        mode.add_argument("--rollback-check", action="store_true", help="check paths before a hand rollback")
        verify.add_argument("--commit")
        verify.add_argument("--base")
        verify.add_argument("--batch-start", metavar="SHA", help="verify a batch member: the receipt's base must be this "
                                                                 "full batch-start, still open in holder.txt with every "
                                                                 "commit main landed since it listed there")
        verify.add_argument("--batch-close", action="store_true",
                            help="verify a batch's closing follow-up: holder.txt must still open the batch, origin/main "
                                 "must be its last batch-landing row, and the commit may change only the plan-migration "
                                 "snapshot and reports/landing-checks/baseline.json")
        verify.add_argument("--from", dest="rollback_from")
        verify.add_argument("--to", dest="rollback_to")
        status = commands.add_parser("batch-status", help="read the rule's batch record in holder.txt, writing nothing")
        status.add_argument("--shared", type=Path, default=SHARED)
        status.add_argument("--lock-dir", type=Path, default=LOCK_DIR)
        member = commands.add_parser("batch-check", help="judge one batch member's report against the previous one's")
        member.add_argument("--receipt", type=Path, required=True,
                            help="the record.json pm-land.py check printed for this member: its commit, batch-start, "
                                 "report, row report and the landing check's exit. The previous member's receipt comes "
                                 "from the last batch-landing row in holder.txt")
        member.add_argument("--repo", type=Path, default=None,
                            help="checkout the receipt's commit and the check's source are read from (default: this worktree)")
        member.add_argument("--lock-dir", type=Path, default=LOCK_DIR, help="the rule's lock directory (default: the landing lock)")
        member.add_argument("--check-source", type=Path, help="the landing check's source at the receipt's commit "
                                                              "(default: scripts/pm-landing-check.py at that commit in --repo)")
        publish = commands.add_parser("publish",
                                      help="push the landed SHA to every configured push target with the lease "
                                           "and verify each")
        publish.add_argument("--repo", type=Path, default=None,
                             help="checkout the landed commit and the remotes are read from (default: this worktree)")
        publish.add_argument("--lease", required=True, help="the PUBLISH_LEASE verify printed: the main every "
                                                            "target must still be at")
        publish.add_argument("--commit", required=True,
                             help="the landed full SHA, which must match refs/heads/main in --repo")
        args = parser.parse_args(argv)
        if args.command == "check":
            root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel").stdout.strip())
            if args.base is None:
                return check_topic(root, args.branch, args.on)
            return check_topic(root, args.branch, args.on, args.base)
        if args.command == "batch-status":
            return batch_status(args.shared, args.lock_dir)
        if args.command == "batch-check":
            repo = args.repo or Path(git(Path.cwd(), "rev-parse", "--show-toplevel").stdout.strip())
            return batch_check(repo, args.lock_dir, args.receipt, args.check_source)
        if args.command == "publish":
            repo = args.repo or Path(git(Path.cwd(), "rev-parse", "--show-toplevel").stdout.strip())
            return publish_main(repo, args.lease, args.commit)
        if args.rollback_check:
            if args.batch_start is not None or args.batch_close:
                verify.error("--batch-start and --batch-close verify a receipt and do not go with --rollback-check")
            if not (args.rollback_from and args.rollback_to) or args.commit is not None or args.base is not None:
                verify.error("--rollback-check requires --from and --to and does not take --commit or --base")
            return verify_rollback(args.rollback_from, args.rollback_to)
        if args.rollback_from is not None or args.rollback_to is not None:
            verify.error("--from and --to require --rollback-check")
        if args.batch_close and args.batch_start is not None:
            verify.error("--batch-close and --batch-start do not go together: a closing follow-up is one landing at "
                         "the batch's current main, not a batch member")
        if args.batch_close and args.base is not None:
            verify.error("--batch-close takes no --base: its base is the origin/main the batch's last landing pushed")
        return verify_receipt(args.receipt, args.commit, args.base, args.batch_start, args.batch_close)
    except (Refusal, OSError, ValueError, KeyError, TypeError) as exc:
        print(f"pm-land: {exc}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
