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
from typing import Any, Callable, Optional, Sequence
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


def command(argv, *, capture=True, check=True, input_text=None):
    result = subprocess.run(argv, check=False, text=True,
                            stdout=subprocess.PIPE if capture else None,
                            stderr=subprocess.PIPE if capture else None,
                            encoding="utf-8", errors="surrogateescape", input=input_text)
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

    It carries every row the text report prints or counts, with no print cap: `pre_unread` is False and the gone
    ids, totals and counts are complete. An older JSON report without `subcheck_totals` or `bucket_counts` reads
    as one without those lines: no batch compares with it. `pairs` is its `validator_pairs` mapping: a bucket the
    report left out because a run-gates copy was judged by its audit-governance twin is not an observed zero.
    """
    pre: dict[str, dict[str, Any]] = {}
    for item in doc.get("pre_existing") or []:
        if not isinstance(item, dict):
            continue
        bucket = (f"{item.get('check')}/{item.get('subcheck') or '-'}  {item.get('error')}  "
                  f"{item.get('path') or '(no path)'}")
        entry = pre.setdefault(bucket, {"baseline": item.get("baseline_count"), "count": item.get("count"),
                                        "improved": item.get("standing") == "improved",
                                        "content_rows": [], "rows": []})
        # The row's key, not its printed fields: every report from this landing check carries it, and it says
        # which failure a row is, not just how it read.
        entry["rows"].append(item.get("key"))
        if not item.get("branch_paths"):
            entry["content_rows"].append(item.get("key"))
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
    partial = set()
    for name in doc.get("subchecks_compared_by_total_only") or []:
        check, _, subcheck = str(name).partition("/")
        if check and subcheck:
            partial.add((check, subcheck))
    # And `exports.subchecks` says why each of them is a sample. `no_export` and `baseline_sample` are the
    # subcheck's permanent samples: no export can complete it, so its total is the whole comparison. Any other
    # case means an export was attempted and did not key its rows (`export_timeout`, `export_unreadable`,
    # `total_mismatch`, `rows_mismatch`), and then its counts are not known, only its total. A paired run-gates
    # copy is judged by its audit-governance twin's rows, so an export of its own is not read here.
    rows_read = (doc.get("exports") or {}).get("subchecks") if isinstance(doc.get("exports"), dict) else None
    rows_read = rows_read if isinstance(rows_read, list) else None
    export_failed: set[tuple[str, str]] = set()
    permanent: set[tuple[str, str]] = set()
    seen: set[tuple[str, str]] = set()
    for row in rows_read or []:
        if not isinstance(row, dict):
            continue
        key = (str(row.get("check")), str(row.get("subcheck")))
        if key in pairs:
            continue
        seen.add(key)
        if row.get("keyed"):
            continue
        if row.get("case") in ("no_export", "baseline_sample"):
            permanent.add(key)
        elif row.get("case") is not None:
            export_failed.add(key)
    if rows_read is not None:
        # Every subcheck sampled in this run has a row there. One compared by its total only with no row printed
        # every row here: the baseline's sample is why it is still compared by its total, and no export completes
        # the baseline either, so that sample is permanent in every member of the batch.
        permanent |= partial - seen
    return {
        "infrastructure": len(doc.get("infrastructure") or []),
        "crashed": False,
        "compare": int(doc.get("changed_on_branch") or 0),
        "pre": pre,
        "pre_unread": False,
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
REPORT_DIGEST = ("pre", "pre_unread", "compare", "gone", "gone_ids", "totals", "bucket_counts", "ids_unread")


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


def why_not_exempt(subcheck: str, now: Optional[dict[str, Any]], previous: Optional[dict[str, Any]],
                   own: Sequence[str]) -> Optional[str]:
    """None when what this subcheck added since the previous report is only this member's own staleness. Then alone,
    after the previous member's follow-up, each added row would be staleness on this member's files, which stops nothing.

    Every added row must be seen (the subcheck is complete in both reports, its rows adding up to its total), be
    staleness of a kind the landing check also excuses when its bucket grows, and name this member's files and no other
    file of the batch. A row stale by its detail text alone is not enough: alone, a rise in its bucket stops the landing.
    The caller gives this member's own range, so a row on another member's file is told apart. Otherwise, says why.
    """
    if now is None or previous is None:
        return "the landing check wrote no row report for one of the two runs, so what was added cannot be seen"
    rows = {}
    for side, doc in (("this", now), ("the previous", previous)):
        entry = (doc.get("subchecks") or {}).get(subcheck)
        if not isinstance(entry, dict) or not entry.get("complete") or len(entry.get("rows") or []) != entry.get("reported"):
            return (f"{subcheck} is not complete in {side} report (no row report for it, a sample, or no complete export), "
                    "so what was added cannot be seen")
        rows[side] = entry["rows"]
    added = Counter(row["key"] for row in rows["this"]) - Counter(row["key"] for row in rows["the previous"])
    if not added:
        return f"{subcheck} rose, but no added row can be found in it"
    mine = set(own)
    for row in rows["this"]:
        if not added.get(row["key"]):
            continue
        if not row.get("stale"):
            return f"an added row is not staleness: {row['key']}"
        if not row.get("grown_stale"):
            return f"an added row is staleness only by its detail text, which the check does not excuse when its bucket grows: {row['key']}"
        names = row.get("names") or []
        if not names:
            return f"an added staleness row names no file of this batch, so it cannot be attributed: {row['key']}"
        others = sorted(set(names) - mine)
        if others:
            return f"an added staleness row names another member's file ({others[0]}): {row['key']}"
    return None


def row_count_rises(now: Optional[dict[str, Any]], previous: Optional[dict[str, Any]]) -> list[tuple]:
    """Buckets that rose in a subcheck complete in both row reports. A subcheck the baseline holds as a sample prints no
    `[count]` line even when it now prints every row, so these can show what those lines do not."""
    rises: list[tuple] = []
    for name, entry in sorted(((now or {}).get("subchecks") or {}).items()):
        before = ((previous or {}).get("subchecks") or {}).get(name)
        if not (isinstance(entry, dict) and entry.get("complete") and isinstance(before, dict) and before.get("complete")):
            continue
        was = Counter(row["key"].rpartition("|")[0] for row in before.get("rows") or [])
        for bucket, count in sorted(Counter(row["key"].rpartition("|")[0] for row in entry.get("rows") or []).items()):
            if count > was[bucket]:
                rises.append((name, "batch_total_rise", f"bucket {bucket} rose from {was[bucket]} to {count} since the last "
                                                         "report, which no total shows"))
    return rises


def prior_bucket_count(report: dict[str, Any], bucket: str) -> Optional[int]:
    """A bucket's count in an earlier report: an observed number or zero, or None when that report's count is unknown.

    `bucket_counts` holds only counts of 1 or more, so an absent bucket needs telling apart from a zero. Three states:
    a complete subcheck that printed no such bucket is an observed zero; a run-gates copy judged by its complete
    audit-governance twin stands in as that twin's bucket, an observed zero when the twin did not print it; and a
    subcheck compared by its total only (`partial`: a sample, or an export that failed or timed out) printed no
    buckets at all, so its counts are unknown, never zero (review ASTRA F7, R3-B1).
    """
    counts = report.get("bucket_counts") or {}
    pieces = bucket.split("|", 3)
    if len(pieces) < 3:
        return counts.get(bucket, 0)
    key = (pieces[0], pieces[1])
    if key in (report.get("partial") or set()):
        return None
    twin = (report.get("pairs") or {}).get(key)
    if twin is None:
        return counts.get(bucket, 0)
    if twin in (report.get("partial") or set()):
        return None
    return counts.get("|".join([twin[0], twin[1], *pieces[2:]]), 0)


def bucket_was_not_printed(report: dict[str, Any], bucket: str) -> bool:
    """Whether this report left the bucket out because it is a run-gates copy judged by its complete audit-governance
    twin: only the copy's absence is explained, and the twin's bucket is still checked on its own.

    A subcheck compared by its total only is NOT this: it printed no buckets, so a bucket an earlier report held as
    gone cannot be told apart from one that is still gone, and the batch stops (review R3-B1).
    """
    pieces = bucket.split("|", 3)
    if len(pieces) < 2:
        return False
    return (pieces[0], pieces[1]) in (report.get("pairs") or {})


def member_place(index: int, total: int) -> str:
    """A report's place in its batch, named: `this landing's report`, `the previous member's report`, or member N."""
    if index == total - 1:
        return "this landing's report"
    if index == total - 2:
        return f"the previous member's report (member {index + 1} of {total})"
    return f"member {index + 1}'s report (of {total})"


def counts_unknown(report: dict[str, Any], earlier: Sequence[dict[str, Any]]) -> Optional[tuple[str, str]]:
    """The rule before any comparison: a subcheck whose counts are not fully known in a member of this batch.

    A batch compares counts, and a count a member does not have is neither a zero nor a smaller number. A subcheck's
    counts are not fully known in a report when it timed out there (`subcheck_totals` has null), when it is compared
    by its total only for any reason other than a permanent sample (`no_export`, `baseline_sample`), or when an export
    of it failed or could not be read (`exports.subchecks`: `export_timeout`, `export_unreadable`, `total_mismatch`,
    `rows_mismatch`). They are not fully known in the batch when one member printed them in full while another has
    only its total. The one exception is a subcheck that is a permanent sample in every member: no complete row set
    exists anywhere to compare it by, so its printed total is the whole comparison, as in the landing check itself.

    This runs before every comparison, so no later step has to tell an unknown count from an observed one (review
    R4-B1: a sample in the current member was compared as if its counts were known). Returns (stop code, why), naming
    the subcheck and the member: the batch closes and this landing is judged alone.
    """
    members = list(earlier) + [report]
    total = len(members)
    suspects: set[tuple[str, str]] = set()
    for member in members:
        suspects |= set(member.get("partial") or set())
        suspects |= set(member.get("export_failed") or set())
        for name, value in (member.get("totals") or {}).items():
            if value is None:
                check, _, subcheck = name.partition("/")
                suspects.add((check, subcheck))
    for check, subcheck in sorted(suspects):
        name = f"{check}/{subcheck}"
        for index, member in enumerate(members):
            if (member.get("totals") or {}).get(name, 0) is None:
                where = ("this landing's report" if index == total - 1
                         else f"an earlier member's report (member {index + 1} of {total})")
                return ("batch_counts_unknown", f"{name} timed out in {where}, so its counts are unknown and this "
                                                "landing cannot be compared with the batch")
        for index, member in enumerate(members):
            if (check, subcheck) in (member.get("export_failed") or set()):
                return ("batch_counts_unknown", f"{name}'s export did not complete in {member_place(index, total)}, so "
                                                "its counts are unknown and this landing cannot be compared with the "
                                                "batch")
        sampled = [step for step, row in enumerate(members) if (check, subcheck) in (row.get("partial") or set())]
        printed = [step for step in range(total) if step not in sampled]
        if sampled and printed:
            return ("batch_counts_unknown",
                    f"{name} was compared by its total only in {member_place(sampled[0], total)}, and "
                    f"{member_place(printed[0], total)} printed it in full, so its bucket counts are unknown and this "
                    "landing cannot be compared with the batch")
        for index, member in enumerate(members):
            if (check, subcheck) not in (member.get("permanent") or set()):
                return ("batch_counts_unknown",
                        f"{name} was compared by its total only in {member_place(index, total)} as a sample that is "
                        "not a permanent one, so its bucket counts are unknown and this landing cannot be compared "
                        "with the batch")
    return None


def batch_gap(report: dict[str, Any], earlier: Sequence[dict[str, Any]],
              exempt: Optional[Callable[[str], Optional[str]]] = None, row_rises: Sequence[tuple] = ()) -> Optional[tuple]:
    """Why this member's report, fine inside the batch, may not hold alone after the earlier members' follow-up.

    Every check in a batch is judged against the baseline from before the batch, so a bucket an earlier member lowered
    and this one raises again still reads as pre-existing, and a readiness rise is excused by the earlier member's
    stale row. An earlier member's fix may print no row at all: a bucket it emptied is only a number in `Gone since the
    baseline`, and one it lowered with no row naming a batch file prints nothing. `earlier` is each earlier member's
    report digest in order, all read from its receipt. Returns (stop code, why). What a report did not print cannot be
    seen: README, "Batch triggers". A pm-landing-check that prints gone ids, totals and bucket counts prints it all: a
    bucket no longer gone, or a total or count above the previous report's, could not rise alone unseen. A report
    without those lines closes the batch: nothing narrower stands in for them. `exempt` says why a subcheck's rise is
    not only this member's own staleness, or None when it is.
    """
    if not earlier:
        return None
    mine = report["pre"]
    if not shows_what_changed(report, earlier):
        return ("batch_check_too_old", "a report here prints no gone ids, subcheck totals or bucket counts, so what moved "
                                       "between the reports cannot be seen")
    # Counts that are not fully known are decided before any of them is compared: a sample is not an observed zero,
    # and no comparison below can tell the two apart once it has started (review R4-B1).
    unknown = counts_unknown(report, earlier)
    if unknown:
        return unknown
    if report["pre_unread"] or any(row.get("pre_unread") for row in earlier):
        if mine or report["pre_unread"] or report["compare"]:
            return ("batch_rows_overlap", "this report lists pre-existing rows, and an earlier member's report printed "
                                          "only part of its rows, so what they share cannot be told")
    else:
        shared = []
        unlisted = []
        for bucket, entry in sorted(mine.items()):
            views = [row for row in earlier if bucket in row["pre"]]
            listed = {text for row in views for text in row["pre"][bucket]["rows"]}
            if any(text not in listed for text in entry["content_rows"]):
                unlisted.append(bucket)
                continue
            if not any(row["pre"][bucket]["improved"] or row["pre"][bucket]["content_rows"] or row.get("compare")
                       for row in views):
                continue
            # Every member's report lists what the earlier ones touched too, so compare with the latest view.
            latest = views[-1]["pre"][bucket]
            if entry["count"] != latest["count"] or set(entry["rows"]) - set(latest["rows"]):
                shared.append(f"{bucket} ({latest['count']} -> {entry['count']})")
        if shared:
            return ("batch_rows_overlap", "pre-existing rows changed in a bucket an earlier member of this batch also "
                                          "changed, so the baseline's count no longer tells: " + "; ".join(shared[:10]))
        if unlisted:
            return ("batch_rows_overlap", "a `(content changed)` row no earlier report listed: an earlier member may have "
                                          "lowered its bucket without printing it, so the baseline's count no longer "
                                          "tells: " + "; ".join(unlisted[:10]))
    return moved_since_earlier(report, earlier, exempt, row_rises)


def moved_since_earlier(report: dict[str, Any], earlier: Sequence[dict[str, Any]],
                        exempt: Optional[Callable[[str], Optional[str]]] = None,
                        row_rises: Sequence[tuple] = ()) -> Optional[tuple]:
    """What the printed ids, totals and counts say rose since the previous report, unless it is only this member's own
    staleness. Each report is compared with the one before it, so one rise excused here is not held against the next.

    Every report here is fully known: `counts_unknown` runs before this and closes the batch when a subcheck timed
    out, fell back to a sample that is not permanent, or lost its export in any member (reviews SOL D5, R4-B1). So
    an absent bucket below is an observed zero or a paired copy's twin, and never a sample read as one (ASTRA F7).
    """
    if report.get("totals") is None:
        return None
    if report.get("ids_unread") or any(row.get("ids_unread") for row in earlier):
        return ("batch_rows_overlap", "a report's gone ids, subcheck totals or bucket counts do not add up, so what moved "
                                      "between the reports cannot be told")
    if not earlier:
        return None
    latest = earlier[-1]
    rises = []
    for bucket in sorted(set(latest.get("gone_ids") or []) - set(report.get("gone_ids") or [])):
        if bucket_was_not_printed(report, bucket):
            continue
        rises.append((subcheck_of(bucket), "batch_rows_overlap",
                      f"a bucket the previous member's report listed as gone is back, whatever else went: {bucket}"))
    for name, total in sorted(report["totals"].items()):
        if total is None:
            continue
        was = (latest.get("totals") or {}).get(name)
        if was is None:
            return ("batch_counts_unknown", f"the previous member's report records no count for {name}, so this landing "
                                            "cannot be compared with it")
        if total > was:
            rises.append((name, "batch_total_rise", f"{name}'s total rose from {was} to {total} since the last report, which "
                                                    "the baseline from before the batch cannot show"))
    for name, count in sorted((report.get("bucket_counts") or {}).items()):
        was = prior_bucket_count(latest, name)
        if was is None:
            # `counts_unknown` above makes this unreachable; if it is ever reached, the previous report's counts for
            # this subcheck are a sample, and reading them as a zero is the false pass the rule exists to stop.
            return ("batch_counts_unknown",
                    f"{subcheck_of(name)} was compared by its total only in the previous member's report, so its bucket "
                    "counts are unknown and this landing cannot be compared with the batch")
        if count > was:
            rises.append((subcheck_of(name), "batch_total_rise",
                          f"bucket {name} rose from {was} to {count} since the last report, which no total shows"))
    said: dict[str, Optional[str]] = {}
    for subcheck, code, what in rises + list(row_rises):
        if subcheck not in said:
            said[subcheck] = exempt(subcheck) if exempt else "the landing check wrote no row report, so what was added cannot be seen"
        if said[subcheck]:
            return (code, f"{what}; alone it would be a rise, and it is not this landing's own staleness: {said[subcheck]}")
    return None


def parse_holder(text: str) -> dict[str, Any]:
    fields: dict[str, Any] = {"batch-landing": []}
    for line in text.splitlines():
        match = re.match(r"^\s*([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*?)\s*$", line)
        if not match:
            continue
        key, val = match.group(1).lower(), match.group(2)
        if key == "batch-landing":
            fields["batch-landing"].append(val)
        elif key == "batch-start" and fields.get("batch-start") not in (None, val):
            # A rewritten holder.txt can leave the old line behind: two different batch-starts are not a choice to
            # make silently, so the readers refuse instead of taking the first.
            fields["batch-start-conflict"] = f"{fields['batch-start']} and {val}"
        else:
            fields.setdefault(key, val)
    return fields


def read_holder_text(lock_dir: Path) -> Optional[str]:
    try:
        return (lock_dir / "held" / "holder.txt").read_text(encoding="utf-8", errors="replace")
    except OSError:
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
    if text is None:
        raise Refusal(f"the landing lock is held at {lock_dir / 'held'} but holder.txt cannot be read")
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
                       check_source: Optional[str]) -> tuple[int, list[str]]:
    """One member's report against the earlier members' bound receipts: (exit code, lines). Read-only."""
    lines: list[str] = []
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
        return 1, lines
    if report is None:
        lines.append("no batch: the receipt's report is not the JSON `pm-landing-check.py --json` writes, so the "
                     "comparison lines a batch reads are not there. Land it alone (the batch stays closed).")
        return 1, lines
    lines.append("comparison lines this report printed:")
    lines.extend(batch_check_lines(report))
    if report["crashed"] or (code == 1 and report["infrastructure"] is None):
        lines.append("the landing check did not finish judging (" + ("a traceback" if report["crashed"] else "no Infrastructure line")
                     + " in its report), so nothing excuses it: close the batch, fix the cause, and run the check alone.")
        return 1, lines
    if code not in (0, 1):
        lines.append(f"the landing check exited {code}: that alone decides this landing, and a member may only stay on exit 0 "
                     "or 1. Close the batch and treat the landing by the report.")
        return 1, lines
    owed = []
    if code == 1 and report["infrastructure"]:
        owed.append(f"{report['infrastructure']} subcheck(s) timed out: rerun each on its own and judge what it reports")
    if code == 1 and report["compare"]:
        owed.append(f"{report['compare']} pre-existing failure(s) changed content on files this branch touched: compare those "
                    "with the baseline's rows")
    if report["pre_unread"]:
        owed.append("the report printed only part of its pre-existing rows, so a shared bucket cannot be told")
    # A report or receipt the batch needs and cannot read is a trigger, never silence, and it is decided before any
    # success: the first member's corrupt row report is as unreadable as the second member's (review SOL F6).
    if rows_unread:
        gap = ("batch_row_report_unreadable", "a row report this batch needs could not be read ("
               + "; ".join(rows_unread) + "), so what rose since the previous report cannot be judged")
    elif earlier_unread:
        gap = ("batch_earlier_receipt_unreadable", "an earlier member's receipt cannot be read ("
               + "; ".join(earlier_unread) + "), so the reports this landing is compared with are not bound to their commits")
    else:
        gap = None
    if gap:
        lines.append(f"TRIGGER {gap[0]}: {gap[1]}.")
        lines.append("this landing is judged alone: close the batch with its follow-up at the current main, then rebase on "
                     "the new origin/main, rerun the check alone and judge it as usual.")
        return 1, lines
    if not later:
        if report["totals"] is None or report["bucket_counts"] is None or report["ids_unread"]:
            lines.append("no batch: this report does not print the gone ids, subcheck totals and bucket counts a "
                         "later member compares with, so no later member could compare with it. Land it alone (the "
                         "batch stays closed).")
            return 1, lines
        lines.append("no trigger applies: this is the first member of the batch, with no earlier report to compare with. "
                     "It may stay.")
        for what in owed:
            lines.append(f"judge first: {what}; then it may stay.")
        return 1 if owed else 0, lines
    # Each earlier member's receipt, oldest first. Their reports and row reports are re-hashed when read, so a
    # report for another commit or another batch is never compared as this member's predecessor (review SOL D2).
    previous_rows = earlier[-1]["rows"]
    own: Optional[list[str]] = None

    def exempt(subcheck: str) -> Optional[str]:
        nonlocal own
        if own_base is None:
            return "the batch has no earlier landing, so this landing's own range cannot be told"
        if own is None:
            own = sorted(changed_paths(shared, own_base, head))
        return why_not_exempt(subcheck, rows, previous_rows, own)

    gap = batch_gap(report, [member["report"] for member in earlier], exempt,
                    row_count_rises(rows, previous_rows))
    if not gap and own_base:
        reverted = sorted(changed_paths(shared, own_base, head) - changed_paths(shared, start, head))
        if reverted:
            gap = ("batch_reverted_path", "this landing put back what an earlier member of the batch changed, so the "
                                          "check, measuring from batch-start, does not read it as touched: "
                                          + ", ".join(reverted[:10]))
    if gap:
        lines.append(f"TRIGGER {gap[0]}: {gap[1]}.")
        lines.append("this landing is judged alone: close the batch with its follow-up at the current main, then rebase on "
                     "the new origin/main, rerun the check alone and judge it as usual.")
        return 1, lines
    lines.append("no trigger: every comparison line this report prints is explained by the batch's own state, so this "
                 "landing may stay.")
    for what in owed:
        lines.append(f"judge first: {what}; then it may stay.")
    return 1 if owed else 0, lines


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
    earlier: list[dict[str, Any]] = []
    earlier_unread: list[str] = []
    for row in earlier_rows:
        member, why = earlier_member(row, start)
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
    code_out, lines = judge_batch_member(shared, start, code, report, rows, rows_unread, earlier, earlier_unread,
                                         own_base, resolved_head, source_text)
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


def require_open_batch(shared: Path, start: str, main: str) -> None:
    """A batch member's base is accepted only while holder.txt still opens that batch and lists every landing since."""
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
                      "main: " + ", ".join(unlisted[:10]) + ". Repair the holder, then rerun")
    require_batch_limits(shared, start, fields, rows, holder)


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


def verify_receipt(path, commit=None, base=None, batch_start=None):
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
    if batch_start is None:
        if pinned != checked_base:
            raise Refusal(f"shared origin/main differs from the receipt base {checked_base}; fetch and check again")
    else:
        # Batch mode: the receipt's base is the batch-start, which is behind main once the first member pushed.
        # The rule's own record must still open exactly that batch, and every commit main has landed since it
        # must be one of its listed landings: a receipt never covers a commit the batch does not name.
        checked_batch = sha(batch_start, "batch-start")
        if checked_base != checked_batch:
            raise Refusal(f"a batch member's receipt base is {checked_base}, but --batch-start is {checked_batch}. Inside "
                          "a batch, check with --base <full batch-start> so the receipt is judged against the batch.")
        require_open_batch(SHARED, checked_batch, pinned)
        if record["exit_code"] not in (0, 1):
            raise Refusal(f"the receipt records landing checker exit {record['exit_code']}: a batch member may only "
                          "stay on exit 0 or 1, so this landing is judged by its report, not as a batch member")
        if not record.get("row_report"):
            raise Refusal("the receipt records no row report: inside a batch, check with --base <full batch-start> on "
                          "a landing check that prints --row-report, so the next member has what it compares with")
        if not is_ancestor(SHARED, pinned, head):
            raise Refusal(f"origin/main {pinned} is not an ancestor of the checked commit {head}: rebase on the current "
                          "origin/main and check again, so the push is a fast-forward")
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
    if tips[ref] != head:
        raise Refusal(f"published topic {ref} changed from checked commit {head} to {tips[ref]}")
    publication_preflight(SHARED, checked_base, head, record["ignored_inputs"])
    require_record_bytes(path, raw, record, batch_start is not None)
    if batch_start is not None:
        # The preflight scans the whole tree; neither origin/main nor the rule's record may move while it runs.
        moved = full_main(SHARED)
        if moved != pinned:
            raise Refusal(f"origin/main moved from {pinned} to {moved} during verification")
        require_open_batch(SHARED, checked_base, pinned)
        if not is_ancestor(SHARED, pinned, head):
            raise Refusal(f"origin/main {pinned} is no longer an ancestor of the checked commit {head}")
        say(f"Verified {head} against batch-start {checked_base} on {host}. Landing checker exit {record['exit_code']}.")
    else:
        moved = full_main(SHARED)
        if moved != pinned:
            raise Refusal(f"origin/main moved from {pinned} to {moved} during verification")
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
        verify.add_argument("--from", dest="rollback_from")
        verify.add_argument("--to", dest="rollback_to")
        status = commands.add_parser("batch-status", help="read the rule's batch record in holder.txt, writing nothing")
        status.add_argument("--shared", type=Path, default=SHARED)
        status.add_argument("--lock-dir", type=Path, default=LOCK_DIR)
        member = commands.add_parser("batch-check", help="judge one batch member's report against the previous one's")
        member.add_argument("--receipt", type=Path, required=True,
                            help="the record.json pm-land.py check printed for this member: its commit, batch-start, "
                                 "report, row report and the landing check's exit. The earlier members' receipts come "
                                 "from their batch-landing rows in holder.txt, in order")
        member.add_argument("--repo", type=Path, default=None,
                            help="checkout the receipt's commit and the check's source are read from (default: this worktree)")
        member.add_argument("--lock-dir", type=Path, default=LOCK_DIR, help="the rule's lock directory (default: the landing lock)")
        member.add_argument("--check-source", type=Path, help="the landing check's source at the receipt's commit "
                                                              "(default: scripts/pm-landing-check.py at that commit in --repo)")
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
        if args.rollback_check:
            if args.batch_start is not None:
                verify.error("--batch-start verifies a receipt and does not go with --rollback-check")
            if not (args.rollback_from and args.rollback_to) or args.commit is not None or args.base is not None:
                verify.error("--rollback-check requires --from and --to and does not take --commit or --base")
            return verify_rollback(args.rollback_from, args.rollback_to)
        if args.rollback_from is not None or args.rollback_to is not None:
            verify.error("--from and --to require --rollback-check")
        return verify_receipt(args.receipt, args.commit, args.base, args.batch_start)
    except (Refusal, OSError, ValueError, KeyError, TypeError) as exc:
        print(f"pm-land: {exc}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
