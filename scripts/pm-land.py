#!/usr/bin/env python3
"""Check a published Puppet Master topic remotely and verify its receipt."""

from __future__ import annotations

import argparse
import ast
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


def gui_test_inputs(ignored, worktree, tracked, commit):
    source = tracked_text(worktree, GUI_POLICY, tracked, commit)
    if not source:
        return set()
    # Read the validator's literal path rules from the checked tree without executing that tree.
    names = {"SOURCE_ROOTS", "SOURCE_EXTENSIONS", "EXCLUDED_DIRS"}
    rules = {target.id: ast.literal_eval(row.value) for row in ast.parse(source).body
             if isinstance(row, ast.Assign) for target in row.targets
             if isinstance(target, ast.Name) and target.id in names}
    if "tests" not in rules["SOURCE_ROOTS"]:
        return set()
    return {name for name in ignored if name.startswith("tests/") and
            PurePosixPath(name).suffix.lower() in rules["SOURCE_EXTENSIONS"] and
            not rules["EXCLUDED_DIRS"].intersection(PurePosixPath(name).parts[1:])}


def copies(root, worktree, tracked, commit):
    found = git(root, "ls-files", "--others", "--ignored", "--exclude-standard",
                "-z", "--", *IGNORED_INPUT_ROOTS).stdout
    ignored = set(found.split("\0")) - {""} - tracked
    selected = {name for name in ignored if
                (not within(name, "tests") or within(name, "tests/fixtures")) and selected_ignored_input(name)}
    selected.update(gui_test_inputs(ignored, worktree, tracked, commit))
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


def affects_shared_check(name):
    # The aggregates also parse tracked and visible JSON/JSONL outside these roots.
    return (any(within(name, root) for root in IGNORED_INPUT_ROOTS)
            or PurePosixPath(name).suffix.lower() in {".json", ".jsonl"}
            or name in {".gitignore", ".gitattributes", "AGENTS.md"})


def hidden_index_paths(root):
    return {entry[2:] for entry in git(root, "ls-files", "-v", "-z").stdout.split("\0")
            if entry and (entry[0] == "S" or entry[0].islower())}


def require_clean_shared_tracked(root):
    hidden = hidden_index_paths(root)
    tracked, _ = status_paths(root)
    dirty = sorted(tracked | hidden)
    if dirty:
        raise Refusal("shared checkout has uncommitted changes or hidden index flags: " + ", ".join(dirty))


def require_clean_shared_checkout(root, touched):
    hidden = hidden_index_paths(root)
    tracked, untracked = status_paths(root)
    untracked_inputs = {name for name in untracked if affects_shared_check(name)}
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
    require_clean_shared_checkout(root, touched)
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
    require_clean_shared_checkout(root, touched)


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


def revision_metadata(root, option):
    return Path(git(root, "rev-parse", "--path-format=absolute", option).stdout.strip())


def receipt_witness(folder):
    # This belongs to the checking host's clone and survives disposal of the temporary checkout.
    return revision_metadata(CLONE, "--git-common-dir") / "pm-land-check-receipts" / f"{folder.name}.sha256"


def cleanup_receipt(folder):
    return folder / "cleanup-receipt.json"


def prepare_remote(folder, ref, head, tree, base):
    branch = ref.removeprefix("refs/heads/")
    if check_ref(branch) != ref:
        raise Refusal(f"invalid pinned topic ref: {ref}")
    sha(head, "target commit")
    sha(tree, "target tree")
    sha(base, "fetched origin/main")
    refs = tuple(dict.fromkeys((MAIN_REF, ref)))
    git(CLONE, "fetch", "--no-tags", "--no-write-fetch-head", "--refmap=", "origin", *refs)
    tips = origin_refs(CLONE, *refs)
    if tips[ref] != head:
        raise Refusal(f"published topic {ref} moved before remote checkout: {head} -> {tips[ref]}")
    if tips[MAIN_REF] != base:
        raise Refusal(f"origin/main moved before remote checkout: {base} -> {tips[MAIN_REF]}")
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


def remote_check(folder, host, ref, head, tree, base):
    root, inputs = prepare_remote(folder, ref, head, tree, base)
    shard, shard_seconds = capture(SHARD, root, folder / "shards.json", folder / "shards.stderr")
    started = now()
    report = folder / "landing-check.json"
    args = [*CHECK, "--base", base, "--subcheck-timeout-seconds", str(TIMEOUT), "--json",
            "--readiness-audit-root", str(root / READINESS),
            "--keep-check-reports", str(folder / "subchecks")]
    code, seconds = capture(args, root, report, folder / "landing-check.stderr")
    ended = now()
    report_digest = file_hash(report)
    validate_check_report(report, head, base, code)
    require_clean_full(root, head, tree)
    require_same_inputs(inputs, guarded_input_manifest(root, head), "remote checkout after the check")
    require_clean_full(root, head, tree)
    if file_hash(report) != report_digest:
        raise Refusal(f"landing check report changed before its receipt was recorded: {report}")

    path = folder / "record.json"
    write_json(path, {"schema": 2, "host": host, "machine": socket.gethostname(), "topic": ref,
                      "head": head, "tree": tree, "base": base, "worktree": str(root),
                      "full": True, "clean": True, "job": job_name(folder), "argv": args,
                      "exit_code": code, "report": str(report), "report_sha256": report_digest,
                      "started_utc": started, "ended_utc": ended, "check_seconds": seconds,
                      "cleanup_receipt": str(cleanup_receipt(folder)),
                      "shard_exit_code": shard, "shard_seconds": shard_seconds, "ignored_inputs": inputs})
    witness = receipt_witness(folder)
    witness.parent.mkdir(mode=0o700, exist_ok=True)
    with witness.open("x", encoding="ascii") as stream:
        stream.write(file_hash(path) + "\n")


def verify_record(folder, record, host, ref, head, tree, base):
    if not isinstance(record, dict):
        raise Refusal("receipt is not a JSON object")
    for key, expected in {"schema": 2, "host": host, "machine": MACHINES[host], "topic": ref,
                          "head": head, "tree": tree, "base": base, "job": job_name(folder)}.items():
        if record.get(key) != expected:
            raise Refusal(f"receipt {key} is {record.get(key)!r}; expected {expected!r}")
    for key, label in (("head", "commit"), ("tree", "tree"), ("base", "fetched origin/main")):
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


def preserve_remote_copy(folder, host, state):
    root = worktree_path(folder)
    name = job_name(folder)
    notice = f"preserved remote copy: {host}:{root} (job {name}, state {state})"
    remote_command = shlex.join(["git", "-C", str(CLONE), "worktree", "remove", "--force", str(root)])
    removal = shlex.join(["ssh", HOSTS[host], remote_command])
    path = cleanup_receipt(folder)
    say(notice)
    say(f"Remove by hand once nothing uses it: {removal}")
    try:
        # A job can fail before producing a checker receipt. Keep this separate from its witnessed bytes.
        write_json(path, {"host": host, "worktree": str(root), "job": name, "state": state,
                          "preserved_remote_copy": notice, "remove_by_hand": removal})
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


def remote_cleanup(folder, host):
    root = worktree_path(folder)
    if not os.path.lexists(root):
        return
    job = remote_job_status(job_name(folder))
    state, code = job.get("state"), job.get("code")
    if state != "done" or type(code) is not int or code != 0 or not job.get("ended") or job.get("signal"):
        preserve_remote_copy(folder, host, state if isinstance(state, str) and state else "unknown")
        return
    require_owned_worktree(root, folder)
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


def start_remote_job(folder, host, ref, head, tree, base):
    name = job_name(folder)
    launch = ssh(host, "long-job", "start", name, "--log", folder / "check.log", "--",
                 *helper(folder, host, "check", ref, head, tree, base), capture_output=False, check=False)
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


def check_topic(root, branch, host):
    ref = check_ref(branch)
    head = sha(revision(root, ref + "^{commit}"), "topic tip")
    tips = origin_refs(root, MAIN_REF, ref)
    base = tips[MAIN_REF]
    if tips[ref] != head:
        raise Refusal(f"local topic {ref} is {head}; origin is {tips[ref]}. Push the exact checked topic first.")
    if revision(root, ref + "^{commit}") != head:
        raise Refusal(f"local topic {ref} changed during pinning: {head}")
    tree = revision(root, head + "^{tree}")
    git(root, "merge-base", "--is-ancestor", base, head)
    folder = new_run(branch, head)
    path = folder / "record.json"
    try:
        start_remote_job(folder, host, ref, head, tree, base)
        record = read_json(path)
        verify_record(folder, record, host, ref, head, tree, base)
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


def verify_receipt(path, commit=None, base=None):
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
    if full_main(SHARED) != checked_base:
        raise Refusal(f"shared origin/main differs from the receipt base {checked_base}; fetch and check again")
    if git(SHARED, "symbolic-ref", "--quiet", "HEAD", check=False).stdout.strip() != MAIN_REF:
        raise Refusal("shared checkout must be on main")
    shared_head = revision(SHARED, "HEAD^{commit}")
    if (shared_head != head and not is_ancestor(SHARED, shared_head, checked_base)) or not is_ancestor(
        SHARED, checked_base, head
    ):
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
    if tips[MAIN_REF] != checked_base:
        raise Refusal(f"origin/main moved from receipt base {checked_base} to {tips[MAIN_REF]}")
    if tips[ref] != head:
        raise Refusal(f"published topic {ref} changed from checked commit {head} to {tips[ref]}")
    publication_preflight(SHARED, checked_base, head, record["ignored_inputs"])
    if path.read_bytes() != raw:
        raise Refusal(f"receipt changed during verification: {path}")
    say(f"Verified {head} against {checked_base} on {host}. Landing checker exit {record['exit_code']}.")
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
    cleanup = jobs.add_parser("cleanup")
    cleanup.add_argument("host", choices=HOSTS)
    args = parser.parse_args(argv)
    folder = require_run_folder(Path(__file__).absolute().parent)
    require_host(args.host)
    if args.mode == "check":
        remote_check(folder, args.host, args.ref, args.head, args.tree, args.base)
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
        verify = commands.add_parser("verify", help="read-only verification under the hand lander's guard")
        mode = verify.add_mutually_exclusive_group(required=True)
        mode.add_argument("--receipt", type=Path)
        mode.add_argument("--rollback-check", action="store_true", help="check paths before a hand rollback")
        verify.add_argument("--commit")
        verify.add_argument("--base")
        verify.add_argument("--from", dest="rollback_from")
        verify.add_argument("--to", dest="rollback_to")
        args = parser.parse_args(argv)
        if args.command == "check":
            root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel").stdout.strip())
            return check_topic(root, args.branch, args.on)
        if args.rollback_check:
            if not (args.rollback_from and args.rollback_to) or args.commit is not None or args.base is not None:
                verify.error("--rollback-check requires --from and --to and does not take --commit or --base")
            return verify_rollback(args.rollback_from, args.rollback_to)
        if args.rollback_from is not None or args.rollback_to is not None:
            verify.error("--from and --to require --rollback-check")
        return verify_receipt(args.receipt, args.commit, args.base)
    except (Refusal, OSError, ValueError, KeyError, TypeError) as exc:
        print(f"pm-land: {exc}", file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
