#!/usr/bin/env python3
"""Two-phase, fail-closed cleanup for explicitly approved final-campaign evidence.

`plan` is read-only with respect to evidence and writes only a dry-run plan.
`execute` requires a second immutable approval bound to that exact plan. It
unlinks only enumerated regular files whose pre-delete hashes still match.
`verify-post-cleanup` proves exact absence/preservation, rejects pre-authored
success receipts, and itself executes a typed hard-coded allowlist of fresh
gate, reproducibility, and governance checks. Campaign completion never
authorizes either cleanup phase.
"""
from __future__ import annotations

import argparse
import errno
import hashlib
import json
import os
import stat
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


ROOT_SCHEMA = "pm.pmconcept7.final_evidence_root_hash_manifest.v1"
USER_APPROVAL_SCHEMA = "pm.pmconcept7.final_campaign_cleanup_user_approval.v1"
EXECUTION_APPROVAL_SCHEMA = "pm.pmconcept7.final_campaign_cleanup_execution_approval.v1"
PLAN_SCHEMA = "pm.pmconcept7.final_campaign_cleanup_plan.v1"
CLEANUP_RECEIPT_SCHEMA = "pm.pmconcept7.final_campaign_cleanup_receipt.v1"
POST_SCHEMA = "pm.pmconcept7.final_campaign_post_cleanup_verification.v1"
SCHEMA_PATH = Path(__file__).with_name("final_campaign_cleanup.schema.json")
POST_GATE_SCHEMAS = {
    "post_cleanup_gate": "pm.pmconcept7.post_cleanup_gate_receipt.v1",
    "reproducible_build": "pm.pmconcept7.post_cleanup_reproducible_build_receipt.v1",
    "governance_gates": "pm.pmconcept7.post_cleanup_governance_gates_receipt.v1",
}
POST_GATE_RESULT_SCHEMAS = {
    "post_cleanup_gate": "pm.pmconcept7.post_cleanup_gate_result.v1",
    "reproducible_build": "pm.pmconcept7.post_cleanup_reproducible_build_result.v1",
    "governance_gates": "pm.pmconcept7.post_cleanup_governance_gates_result.v1",
}
REPO_ROOT = Path(os.path.abspath(Path(__file__).parents[3]))
EXPECTED_POST_GATE_PRODUCERS = {
    "post_cleanup_gate": Path(os.path.abspath(Path(__file__).with_name("final_evidence_gate.py"))),
    "reproducible_build": Path(os.path.abspath(Path(__file__).parent.parent / "build_pm7.py")),
    "governance_gates": Path(os.path.abspath(Path(__file__).parents[3] / "scripts" / "pm-plans-verify.py")),
}
PINNED_PM7_BASE_SHA256 = "7bbc1932dbfbbee45bab9533a9fe41b96b13452720ea0fd29e43cbeab710d50d"
HEX = set("0123456789abcdef")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def lexical_absolute(path: Path) -> Path:
    return Path(os.path.abspath(os.fspath(path)))


def open_parent_dir_absolute_nofollow(path: Path, *, create: bool = False) -> tuple[int, str, Path]:
    absolute = lexical_absolute(path)
    parts = absolute.parts
    if len(parts) < 2:
        raise ValueError(f"path has no leaf name: {path}")
    flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0)
    fd = os.open(parts[0], flags)
    try:
        for component in parts[1:-1]:
            try:
                next_fd = os.open(component, flags, dir_fd=fd)
            except FileNotFoundError:
                if not create:
                    raise
                os.mkdir(component, 0o755, dir_fd=fd)
                next_fd = os.open(component, flags, dir_fd=fd)
            os.close(fd)
            fd = next_fd
        return fd, parts[-1], absolute
    except Exception:
        os.close(fd)
        raise


def read_regular_nofollow(path: Path, label: str) -> tuple[Path, bytes, os.stat_result]:
    parent_fd, basename, absolute = open_parent_dir_absolute_nofollow(path)
    fd = None
    try:
        flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0)
        fd = os.open(basename, flags, dir_fd=parent_fd)
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode):
            raise ValueError(f"{label} must be a direct regular file")
        chunks: list[bytes] = []
        while block := os.read(fd, 1024 * 1024):
            chunks.append(block)
        data = b"".join(chunks)
        if len(data) != info.st_size:
            raise ValueError(f"{label} changed while being read")
        after = os.fstat(fd)
        if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns):
            raise ValueError(f"{label} changed while being read")
        return absolute, data, info
    except OSError as error:
        if error.errno in {errno.ELOOP, errno.ENOTDIR}:
            raise ValueError(f"{label} traverses a symlink or non-directory ancestor") from error
        raise
    finally:
        if fd is not None:
            os.close(fd)
        os.close(parent_fd)


def load_json_with_digest(path: Path, label: str) -> tuple[Path, Any, str, os.stat_result]:
    absolute, data, info = read_regular_nofollow(path, label)
    try:
        value = json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ValueError(f"{label} is not valid UTF-8 JSON: {error}") from error
    return absolute, value, hashlib.sha256(data).hexdigest(), info


def load_json(path: Path) -> Any:
    return load_json_with_digest(path, "JSON file")[1]


def validate_schema(value: Any, label: str) -> None:
    errors = sorted(Draft202012Validator(load_json(SCHEMA_PATH)).iter_errors(value), key=lambda row: list(row.path))
    if errors:
        raise ValueError(f"{label} fails cleanup schema: {errors[0].message}")


def load_nonsymlink_json(path: Path, label: str) -> tuple[Path, Any]:
    absolute, value, _, _ = load_json_with_digest(path, label)
    return absolute, value


def write_json_new(path: Path, value: Any) -> None:
    payload = (json.dumps(value, indent=2, sort_keys=True) + "\n").encode("utf-8")
    parent_fd, basename, absolute = open_parent_dir_absolute_nofollow(path, create=True)
    fd = None
    try:
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0)
        fd = os.open(basename, flags, 0o600, dir_fd=parent_fd)
        view = memoryview(payload)
        while view:
            written = os.write(fd, view)
            view = view[written:]
        os.fsync(fd)
    except FileExistsError as error:
        raise ValueError(f"refusing to overwrite receipt or symlink: {absolute}") from error
    finally:
        if fd is not None:
            os.close(fd)
        os.close(parent_fd)


def sha256(path: Path) -> str:
    return hashlib.sha256(read_regular_nofollow(path, "hashed file")[1]).hexdigest()


def sha256_fd(fd: int) -> str:
    digest = hashlib.sha256()
    os.lseek(fd, 0, os.SEEK_SET)
    while block := os.read(fd, 1024 * 1024):
        digest.update(block)
    return digest.hexdigest()


def valid_sha(value: Any) -> bool:
    return isinstance(value, str) and len(value) == 64 and set(value) <= HEX


def normalize_relative(raw: Any) -> str:
    if not isinstance(raw, str) or not raw.strip():
        raise ValueError("cleanup path must be a non-empty relative string")
    candidate = Path(raw)
    if candidate.is_absolute() or ".." in candidate.parts or candidate == Path("."):
        raise ValueError(f"cleanup path is not bounded: {raw!r}")
    normalized = candidate.as_posix()
    if normalized != raw or normalized.startswith("./"):
        raise ValueError(f"cleanup path is not canonically normalized: {raw!r}")
    return normalized


def resolve_under(root: Path, relative: str) -> Path:
    root = lexical_absolute(root)
    path = root / normalize_relative(relative)
    if root not in path.parents:
        raise ValueError(f"cleanup path escapes evidence root: {relative}")
    # Validate every existing ancestor without canonicalizing aliases away.
    parent_fd, basename = open_parent_dir_nofollow(root, relative)
    try:
        try:
            info = os.stat(basename, dir_fd=parent_fd, follow_symlinks=False)
        except FileNotFoundError:
            info = None
        if info is not None and stat.S_ISLNK(info.st_mode):
            raise ValueError(f"cleanup path traverses a symlink: {relative}")
    finally:
        os.close(parent_fd)
    return path


def census_row(root: Path, relative: str) -> dict[str, Any]:
    path = resolve_under(root, relative)
    _, data, info = read_regular_nofollow(path, f"cleanup evidence {relative}")
    return {"path": relative, "sha256": hashlib.sha256(data).hexdigest(), "bytes": info.st_size}


def file_ref(path: Path) -> dict[str, str]:
    absolute, data, _ = read_regular_nofollow(path, "file reference")
    return {"path": str(absolute), "sha256": hashlib.sha256(data).hexdigest()}


def validate_file_ref(spec: Any, label: str) -> tuple[Path, Any]:
    if not isinstance(spec, dict) or set(spec) != {"path", "sha256"} or not isinstance(spec.get("path"), str) or not valid_sha(spec.get("sha256")):
        raise ValueError(f"{label} reference is malformed")
    path = Path(spec["path"])
    if not path.is_absolute() or lexical_absolute(path) != path:
        raise ValueError(f"{label} reference must be an absolute canonical lexical path")
    absolute, value, digest, _ = load_json_with_digest(path, label)
    if digest != spec["sha256"]:
        raise ValueError(f"{label} reference is hash-mismatched")
    return absolute, value


def validate_binary_ref(spec: Any, label: str) -> Path:
    if not isinstance(spec, dict) or set(spec) != {"path", "sha256"} or not isinstance(spec.get("path"), str) or not valid_sha(spec.get("sha256")):
        raise ValueError(f"{label} reference is malformed")
    path = Path(spec["path"])
    if not path.is_absolute() or lexical_absolute(path) != path:
        raise ValueError(f"{label} reference must be an absolute canonical lexical path")
    absolute, data, _ = read_regular_nofollow(path, label)
    if hashlib.sha256(data).hexdigest() != spec["sha256"]:
        raise ValueError(f"{label} reference is hash-mismatched")
    return absolute


def open_parent_dir_nofollow(root: Path, relative: str) -> tuple[int, str]:
    parts = Path(normalize_relative(relative)).parts
    if not parts:
        raise ValueError("cleanup target has no basename")
    flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(root, flags)
    try:
        for component in parts[:-1]:
            next_fd = os.open(component, flags, dir_fd=fd)
            os.close(fd)
            fd = next_fd
        return fd, parts[-1]
    except Exception:
        os.close(fd)
        raise


def open_directory_absolute_nofollow(path: Path, label: str) -> tuple[Path, int]:
    parent_fd, basename, absolute = open_parent_dir_absolute_nofollow(path)
    fd = None
    try:
        flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0)
        fd = os.open(basename, flags, dir_fd=parent_fd)
        info = os.fstat(fd)
        if not stat.S_ISDIR(info.st_mode):
            raise ValueError(f"{label} must be a direct directory")
        result = fd
        fd = None
        return absolute, result
    except OSError as error:
        if error.errno in {errno.ELOOP, errno.ENOTDIR}:
            raise ValueError(f"{label} traverses a symlink or non-directory ancestor") from error
        raise
    finally:
        if fd is not None:
            os.close(fd)
        os.close(parent_fd)


def _read_regular_at(parent_fd: int, basename: str, label: str) -> tuple[bytes, os.stat_result]:
    fd = None
    try:
        fd = os.open(basename, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=parent_fd)
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode):
            raise ValueError(f"{label} must be a direct regular file")
        chunks: list[bytes] = []
        while block := os.read(fd, 1024 * 1024):
            chunks.append(block)
        data = b"".join(chunks)
        after = os.fstat(fd)
        if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) or len(data) != before.st_size:
            raise ValueError(f"{label} changed while being read")
        return data, before
    finally:
        if fd is not None:
            os.close(fd)


def exact_file_census(root: Path, excluded_paths: set[Path] | None = None) -> list[dict[str, Any]]:
    root, root_fd = open_directory_absolute_nofollow(root, "evidence root")
    excluded = {lexical_absolute(path) for path in (excluded_paths or set())}
    rows: list[dict[str, Any]] = []

    def walk(directory_fd: int, relative_parent: Path) -> None:
        with os.scandir(directory_fd) as entries:
            ordered = sorted(entries, key=lambda entry: entry.name)
        for entry in ordered:
            relative_path = relative_parent / entry.name
            absolute_path = root / relative_path
            info = entry.stat(follow_symlinks=False)
            if stat.S_ISLNK(info.st_mode):
                raise ValueError(f"evidence census contains a symlink: {relative_path.as_posix()}")
            if stat.S_ISDIR(info.st_mode):
                child_fd = os.open(entry.name, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=directory_fd)
                try:
                    child_info = os.fstat(child_fd)
                    if (child_info.st_dev, child_info.st_ino) != (info.st_dev, info.st_ino):
                        raise ValueError(f"evidence census directory changed while traversing: {relative_path.as_posix()}")
                    walk(child_fd, relative_path)
                finally:
                    os.close(child_fd)
            elif stat.S_ISREG(info.st_mode):
                if absolute_path in excluded:
                    continue
                data, opened = _read_regular_at(directory_fd, entry.name, f"evidence census file {relative_path.as_posix()}")
                if (opened.st_dev, opened.st_ino) != (info.st_dev, info.st_ino):
                    raise ValueError(f"evidence census file changed while opening: {relative_path.as_posix()}")
                rows.append({"path": relative_path.as_posix(), "sha256": hashlib.sha256(data).hexdigest(), "bytes": opened.st_size})
            else:
                raise ValueError(f"evidence census contains a non-regular entry: {relative_path.as_posix()}")

    try:
        walk(root_fd, Path())
    finally:
        os.close(root_fd)
    return sorted(rows, key=lambda row: row["path"])


def path_exists_under_nofollow(root: Path, relative: str) -> bool:
    parent_fd, basename = open_parent_dir_nofollow(root, relative)
    try:
        try:
            os.stat(basename, dir_fd=parent_fd, follow_symlinks=False)
        except FileNotFoundError:
            return False
        return True
    finally:
        os.close(parent_fd)


def exact_file_identity(path: Path, label: str) -> dict[str, Any]:
    absolute, data, info = read_regular_nofollow(path, label)
    return {
        "path": str(absolute), "sha256": hashlib.sha256(data).hexdigest(), "bytes": info.st_size,
        "device": info.st_dev, "inode": info.st_ino, "mtime_ns": info.st_mtime_ns,
    }


def _open_tracked_output(path: Path) -> tuple[int, os.stat_result]:
    parent_fd, basename, _ = open_parent_dir_absolute_nofollow(path, create=True)
    try:
        fd = os.open(basename, os.O_RDWR | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), 0o600, dir_fd=parent_fd)
        return fd, os.fstat(fd)
    finally:
        os.close(parent_fd)


def _read_tracked_output(path: Path, fd: int, initial: os.stat_result, label: str) -> tuple[bytes, dict[str, Any]]:
    current_path = os.stat(path, follow_symlinks=False)
    if not stat.S_ISREG(current_path.st_mode) or (current_path.st_dev, current_path.st_ino) != (initial.st_dev, initial.st_ino):
        raise ValueError(f"{label} output path was replaced during authenticated execution")
    before = os.fstat(fd)
    os.lseek(fd, 0, os.SEEK_SET)
    chunks: list[bytes] = []
    while block := os.read(fd, 1024 * 1024):
        chunks.append(block)
    data = b"".join(chunks)
    after = os.fstat(fd)
    if len(data) != before.st_size or (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns):
        raise ValueError(f"{label} output changed while descriptor-opened")
    return data, {
        "path": str(lexical_absolute(path)), "sha256": hashlib.sha256(data).hexdigest(), "bytes": before.st_size,
        "device": before.st_dev, "inode": before.st_ino, "mtime_ns": before.st_mtime_ns,
    }


def _execute_authenticated(gate_id: str, argv: list[str], cwd: Path,
                           output_paths: dict[str, Path], runner: Any = None) -> tuple[dict[str, Any], dict[str, bytes]]:
    if not argv or Path(argv[0]) != lexical_absolute(Path(sys.executable).resolve()):
        raise ValueError(f"{gate_id} authenticated invocation must use the verifier-selected Python interpreter")
    cwd, cwd_fd = open_directory_absolute_nofollow(cwd, f"{gate_id} working directory")
    os.close(cwd_fd)
    stdout_path = lexical_absolute(next(iter(output_paths.values())).parent / f".{gate_id}-stdout")
    stderr_path = lexical_absolute(next(iter(output_paths.values())).parent / f".{gate_id}-stderr")
    all_paths = {"stdout": stdout_path, "stderr": stderr_path, **output_paths}
    tracked: dict[str, tuple[Path, int, os.stat_result]] = {}
    try:
        for name, path in all_paths.items():
            fd, initial = _open_tracked_output(path)
            tracked[name] = (path, fd, initial)
        if runner is None:
            completed = subprocess.run(argv, cwd=cwd, stdin=subprocess.DEVNULL, stdout=tracked["stdout"][1], stderr=tracked["stderr"][1], check=False, timeout=900)
            exit_code = completed.returncode
        else:
            synthetic = runner(gate_id, list(argv), cwd, dict(output_paths))
            if not isinstance(synthetic, dict):
                raise ValueError("self-test runner returned no execution record")
            exit_code = synthetic.get("exit_code")
            for name, data in {"stdout": synthetic.get("stdout", b""), "stderr": synthetic.get("stderr", b""), **synthetic.get("outputs", {})}.items():
                if name not in tracked or not isinstance(data, bytes):
                    raise ValueError(f"self-test runner returned invalid output {name}")
                fd = tracked[name][1]
                os.ftruncate(fd, 0); os.lseek(fd, 0, os.SEEK_SET); os.write(fd, data); os.fsync(fd)
        captured: dict[str, bytes] = {}
        records: dict[str, dict[str, Any]] = {}
        for name, (path, fd, initial) in tracked.items():
            captured[name], records[name] = _read_tracked_output(path, fd, initial, f"{gate_id} {name}")
        interpreter = exact_file_identity(Path(argv[0]), f"{gate_id} interpreter")
        producer = exact_file_identity(Path(argv[1]), f"{gate_id} producer")
        execution = {
            "producer": producer, "interpreter": interpreter, "argv": argv, "cwd": str(cwd),
            "exit_code": exit_code, "stdout": records.pop("stdout"), "stderr": records.pop("stderr"),
            "outputs": [{"id": name, **record} for name, record in sorted(records.items())],
        }
        return execution, captured
    finally:
        for _, fd, _ in tracked.values():
            os.close(fd)


def _json_from_execution_output(data: bytes, label: str) -> dict[str, Any]:
    try:
        value = json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ValueError(f"{label} did not produce valid UTF-8 JSON: {error}") from error
    if not isinstance(value, dict):
        raise ValueError(f"{label} JSON output must be an object")
    return value


def unlink_verified_row(root: Path, row: dict[str, Any]) -> None:
    parent_fd, basename = open_parent_dir_nofollow(root, row.get("path"))
    file_fd = None
    try:
        before = os.stat(basename, dir_fd=parent_fd, follow_symlinks=False)
        if not stat.S_ISREG(before.st_mode) or before.st_size != row.get("bytes"):
            raise ValueError(f"cleanup target type/size changed immediately before mutation: {row.get('path')}")
        file_fd = os.open(basename, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0), dir_fd=parent_fd)
        opened = os.fstat(file_fd)
        if opened.st_dev != before.st_dev or opened.st_ino != before.st_ino or sha256_fd(file_fd) != row.get("sha256"):
            raise ValueError(f"cleanup target identity/hash changed immediately before mutation: {row.get('path')}")
        after = os.stat(basename, dir_fd=parent_fd, follow_symlinks=False)
        if after.st_dev != opened.st_dev or after.st_ino != opened.st_ino or after.st_size != opened.st_size:
            raise ValueError(f"cleanup target was replaced immediately before mutation: {row.get('path')}")
        os.unlink(basename, dir_fd=parent_fd)
    finally:
        if file_fd is not None:
            os.close(file_fd)
        os.close(parent_fd)


def exact_root_manifest(path: Path, evidence_root: Path) -> dict[str, Any]:
    path, root, _, _ = load_json_with_digest(path, "precleanup root manifest")
    evidence_root, evidence_fd = open_directory_absolute_nofollow(evidence_root, "evidence root")
    os.close(evidence_fd)
    if not isinstance(root, dict) or root.get("schema_id") != ROOT_SCHEMA or root.get("complete_file_census") is not True:
        raise ValueError("precleanup root manifest is not a complete final-evidence census")
    rows = root.get("files")
    if not isinstance(rows, list) or not rows:
        raise ValueError("precleanup root manifest is empty")
    indexed = {}
    for row in rows:
        relative = normalize_relative(row.get("path"))
        actual = census_row(evidence_root, relative)
        if row.get("sha256") != actual["sha256"] or row.get("bytes") != actual["bytes"] or relative in indexed:
            raise ValueError(f"precleanup root manifest is stale or duplicated: {relative}")
        indexed[relative] = actual
    actual_rows = exact_file_census(evidence_root, {path})
    if sorted(indexed.values(), key=lambda row: row["path"]) != actual_rows:
        raise ValueError("precleanup root manifest is not the exact current evidence census")
    return root


def authenticate_post_cleanup_producers(specs: Any, cleanup_receipt_sha256: str,
                                        runner: Any = None) -> list[dict[str, Any]]:
    if not isinstance(specs, list) or [row.get("id") for row in specs if isinstance(row, dict)] != ["post_cleanup_gate", "reproducible_build", "governance_gates"]:
        raise ValueError("post-cleanup requires exact typed gate, reproducibility, and governance requests")
    interpreter = lexical_absolute(Path(sys.executable).resolve())
    admitted: list[dict[str, Any]] = []
    with tempfile.TemporaryDirectory(prefix="pm7-post-cleanup-auth-") as raw:
        scratch = Path(raw)
        gate_spec, build_spec, governance_spec = specs
        if set(gate_spec) != {"id", "manifest"}:
            raise ValueError("post-cleanup gate request must contain only id and manifest; pre-authored receipts/argv are not proof")
        gate_manifest_path, gate_manifest = validate_file_ref(gate_spec["manifest"], "post-cleanup gate manifest")
        if not isinstance(gate_manifest, dict) or gate_manifest.get("schema_id") != "pm.pmconcept7.final_evidence_manifest.v1":
            raise ValueError("post-cleanup gate request does not cite a final evidence manifest")
        gate_output = scratch / "post-cleanup-gate-report.json"
        gate_argv = [str(interpreter), str(EXPECTED_POST_GATE_PRODUCERS["post_cleanup_gate"]), "--manifest", str(gate_manifest_path), "--report", str(gate_output)]
        gate_execution, gate_captured = _execute_authenticated("post_cleanup_gate", gate_argv, REPO_ROOT, {"gate_report": gate_output}, runner)
        gate_report = _json_from_execution_output(gate_captured["gate_report"], "post-cleanup gate")
        if gate_execution["exit_code"] != 0 or gate_report.get("schema_id") != "pm.pmconcept7.final_evidence_gate_report.v1" or gate_report.get("disposition") != "pass_with_native_runtime_platform_residuals_open" or gate_report.get("manifest_sha256") != gate_spec["manifest"]["sha256"]:
            raise ValueError("verifier-executed post-cleanup aggregate gate did not pass the exact requested manifest")
        admitted.append({"id": "post_cleanup_gate", "status": "pass", "cleanup_receipt_sha256": cleanup_receipt_sha256, "input": {"manifest": gate_spec["manifest"]}, "executions": [gate_execution], "verified_result": gate_report})

        if set(build_spec) != {"id", "base", "approved_candidate"}:
            raise ValueError("reproducible-build request must contain only id, base, and approved_candidate; pre-authored receipts/argv are not proof")
        base_path = validate_binary_ref(build_spec["base"], "reproducible-build pinned base")
        candidate_path = validate_binary_ref(build_spec["approved_candidate"], "reproducible-build approved candidate")
        expected_base_sha = build_spec["base"]["sha256"] if runner is not None else PINNED_PM7_BASE_SHA256
        if build_spec["base"]["sha256"] != expected_base_sha:
            raise ValueError("reproducible-build base differs from the build producer's exact pinned base")
        build_executions: list[dict[str, Any]] = []
        build_reports: list[dict[str, Any]] = []
        built_bytes: list[bytes] = []
        for index in (1, 2):
            outdir = scratch / f"build-{index}"
            outdir.mkdir(mode=0o700)
            output = outdir / "PM7-phaseA.html"
            report_path = outdir / "build_report.json"
            argv = [str(interpreter), str(EXPECTED_POST_GATE_PRODUCERS["reproducible_build"]), "--base", str(base_path), "--out", str(output), "--outdir", str(outdir)]
            execution, captured = _execute_authenticated(f"reproducible_build_{index}", argv, REPO_ROOT, {"built_candidate": output, "build_report": report_path}, runner)
            report = _json_from_execution_output(captured["build_report"], f"reproducible build {index}")
            if execution["exit_code"] != 0 or report.get("gates_all_pass") is not True or report.get("base_pin_ok") is not True or report.get("base_sha256") != expected_base_sha or report.get("base_sha_pinned") != expected_base_sha or report.get("output_sha256") != hashlib.sha256(captured["built_candidate"]).hexdigest() or any(row.get("status") != "ok" for row in report.get("transforms", []) if isinstance(row, dict)) or not report.get("transforms"):
                raise ValueError(f"verifier-executed reproducible build {index} did not prove a complete pinned passing build")
            pipeline = report.get("build_provenance", {}).get("pipeline")
            expected_producer = exact_file_identity(EXPECTED_POST_GATE_PRODUCERS["reproducible_build"], "reproducible-build producer")
            producer_display = str(EXPECTED_POST_GATE_PRODUCERS["reproducible_build"].relative_to(REPO_ROOT))
            if not isinstance(pipeline, dict) or pipeline.get("path") != producer_display or pipeline.get("sha256") != expected_producer["sha256"]:
                raise ValueError("reproducible build report does not bind the invoked producer")
            transform_sources = report.get("build_provenance", {}).get("authored_transform_sources_used")
            if not isinstance(transform_sources, list) or not transform_sources:
                raise ValueError("reproducible build report omits exact authored transform inputs")
            seen_transforms: set[str] = set()
            for row in transform_sources:
                if not isinstance(row, dict) or set(row) != {"transform", "path", "sha256"} or row["transform"] in seen_transforms:
                    raise ValueError("reproducible build transform-input provenance is malformed or duplicated")
                seen_transforms.add(row["transform"])
                source_path = lexical_absolute(REPO_ROOT / normalize_relative(row["path"]))
                if source_path != REPO_ROOT and REPO_ROOT not in source_path.parents:
                    raise ValueError("reproducible build transform input escapes the repository")
                if exact_file_identity(source_path, f"transform input {row['transform']}")["sha256"] != row["sha256"]:
                    raise ValueError(f"reproducible build transform input drifted: {row['transform']}")
            build_executions.append(execution); build_reports.append(report); built_bytes.append(captured["built_candidate"])
        candidate_data = read_regular_nofollow(candidate_path, "approved reproducible candidate")[1]
        if built_bytes[0] != built_bytes[1] or built_bytes[0] != candidate_data:
            raise ValueError("two verifier-owned fresh builds do not byte-match each other and the approved candidate")
        provenance_keys = ("pipeline", "authored_transform_sources_used")
        if any(build_reports[0].get("build_provenance", {}).get(key) != build_reports[1].get("build_provenance", {}).get(key) for key in provenance_keys):
            raise ValueError("fresh reproducible builds disagree on producer/transform provenance")
        admitted.append({"id": "reproducible_build", "status": "pass", "cleanup_receipt_sha256": cleanup_receipt_sha256, "input": {"base": build_spec["base"], "approved_candidate": build_spec["approved_candidate"]}, "executions": build_executions, "verified_result": {"candidate_sha256": build_spec["approved_candidate"]["sha256"], "base_sha256": expected_base_sha, "transform_inputs": build_reports[0]["build_provenance"]["authored_transform_sources_used"]}})

        if set(governance_spec) != {"id"}:
            raise ValueError("governance-gates request must contain only id; pre-authored receipts/argv are not proof")
        governance_marker = scratch / "governance-output.marker"
        governance_argv = [str(interpreter), str(EXPECTED_POST_GATE_PRODUCERS["governance_gates"]), "run-gates"]
        governance_execution, _ = _execute_authenticated("governance_gates", governance_argv, REPO_ROOT, {"marker": governance_marker}, runner)
        if governance_execution["exit_code"] != 0:
            raise ValueError("verifier-executed governance gates did not pass")
        admitted.append({"id": "governance_gates", "status": "pass", "cleanup_receipt_sha256": cleanup_receipt_sha256, "input": {}, "executions": [governance_execution], "verified_result": {"exit_code": 0}})
    return admitted


def build_plan(evidence_root: Path, root_manifest_path: Path, approval_path: Path,
               paths_path: Path, preserve_path: Path, out: Path) -> dict[str, Any]:
    evidence_root, evidence_fd = open_directory_absolute_nofollow(evidence_root, "evidence root")
    os.close(evidence_fd)
    root_manifest = exact_root_manifest(root_manifest_path, evidence_root)
    approval_path, approval = load_nonsymlink_json(approval_path, "cleanup user approval")
    targets_raw = load_json(paths_path)
    preserve_raw = load_json(preserve_path)
    if not isinstance(targets_raw, list) or not targets_raw or not isinstance(preserve_raw, list) or not preserve_raw:
        raise ValueError("target and preserve allowlists must be non-empty JSON arrays")
    targets = [normalize_relative(value) for value in targets_raw]
    preserved = [normalize_relative(value) for value in preserve_raw]
    if len(targets) != len(set(targets)) or len(preserved) != len(set(preserved)) or set(targets) & set(preserved):
        raise ValueError("cleanup target/preserve lists are duplicated or overlap")
    root_paths = [normalize_relative(row.get("path")) for row in root_manifest["files"]]
    expected_preserved = sorted(set(root_paths) - set(targets))
    if not set(targets).issubset(root_paths) or preserved != expected_preserved:
        raise ValueError("preserve list must be the exact sorted complement of approved targets in the root census")
    if not isinstance(approval, dict) or approval.get("schema_id") != USER_APPROVAL_SCHEMA or approval.get("explicit_user_approval") is not True:
        raise ValueError("cleanup lacks an explicit immutable user approval receipt")
    validate_schema(approval, "cleanup user approval")
    if approval.get("precleanup_root_manifest_sha256") != sha256(root_manifest_path) or approval.get("approved_paths") != targets:
        raise ValueError("user approval is not bound to the exact root manifest and ordered path allowlist")
    recovery = approval.get("recovery_disposition")
    if recovery not in {"recoverable_backup_verified", "permanent_deletion_explicitly_approved"}:
        raise ValueError("cleanup approval lacks an explicit recovery disposition")
    target_rows = [census_row(evidence_root, value) for value in targets]
    preserve_rows = [census_row(evidence_root, value) for value in preserved]
    plan = {
        "schema_id": PLAN_SCHEMA, "created_at_utc": utc_now(), "status": "dry_run_ready",
        "execution_authorized": False, "evidence_root": str(evidence_root),
        "approval": file_ref(approval_path), "precleanup_root_manifest": file_ref(root_manifest_path),
        "targets": target_rows, "preserved": preserve_rows, "recovery_disposition": recovery,
    }
    validate_schema(plan, "generated cleanup plan")
    write_json_new(out, plan)
    return plan


def execute_cleanup(plan_path: Path, execution_approval_path: Path, receipt_path: Path) -> dict[str, Any]:
    plan_path, plan = load_nonsymlink_json(plan_path, "cleanup plan")
    execution_approval_path, approval = load_nonsymlink_json(execution_approval_path, "execution approval")
    if not isinstance(plan, dict) or plan.get("schema_id") != PLAN_SCHEMA or plan.get("status") != "dry_run_ready" or plan.get("execution_authorized") is not False:
        raise ValueError("cleanup plan is malformed or is not the immutable dry-run state")
    validate_schema(plan, "cleanup plan")
    _, original_approval = validate_file_ref(plan.get("approval"), "original user approval")
    root_manifest_path, _ = validate_file_ref(plan.get("precleanup_root_manifest"), "precleanup root manifest")
    if original_approval.get("schema_id") != USER_APPROVAL_SCHEMA or original_approval.get("explicit_user_approval") is not True:
        raise ValueError("original user approval is no longer admissible")
    validate_schema(original_approval, "original user approval")
    targets = plan.get("targets")
    target_paths = [row.get("path") for row in targets or [] if isinstance(row, dict)]
    if not isinstance(approval, dict) or approval.get("schema_id") != EXECUTION_APPROVAL_SCHEMA or approval.get("explicit_user_approval") is not True or approval.get("cleanup_plan_sha256") != sha256(plan_path) or approval.get("approved_paths") != target_paths:
        raise ValueError("execution approval is not explicitly bound to the exact dry-run plan and ordered paths")
    validate_schema(approval, "execution approval")
    if approval.get("approval_id") == original_approval.get("approval_id"):
        raise ValueError("cleanup requires two distinct approval receipt identities")
    root = lexical_absolute(Path(plan.get("evidence_root", "")))
    root_manifest = exact_root_manifest(root_manifest_path, root)
    root_paths = {normalize_relative(row.get("path")) for row in root_manifest["files"]}
    preserve_paths = [row.get("path") for row in plan.get("preserved", []) if isinstance(row, dict)]
    if set(target_paths) | set(preserve_paths) != root_paths or set(target_paths) & set(preserve_paths):
        raise ValueError("cleanup plan no longer carries an exact target/preserve partition")
    if original_approval.get("approved_paths") != target_paths or original_approval.get("recovery_disposition") != plan.get("recovery_disposition"):
        raise ValueError("cleanup plan drifted from the original user approval")
    for row in targets or []:
        actual = census_row(root, row.get("path"))
        if actual != row:
            raise ValueError(f"cleanup target changed after planning: {row.get('path')}")
    for row in plan.get("preserved", []):
        if census_row(root, row.get("path")) != row:
            raise ValueError(f"preserved evidence changed after planning: {row.get('path')}")
    # Descriptor-relative O_NOFOLLOW traversal and an immediate inode/hash/stat
    # recheck close parent-symlink and replacement races before each mutation.
    for row in targets:
        unlink_verified_row(root, row)
    receipt = {
        "schema_id": CLEANUP_RECEIPT_SCHEMA, "executed_at_utc": utc_now(),
        "status": "enumerated_cleanup_complete", "evidence_root": str(root),
        "cleanup_plan": file_ref(plan_path), "execution_approval": file_ref(execution_approval_path),
        "removed": targets, "preserved_precleanup": plan["preserved"],
        "recovery_disposition": plan["recovery_disposition"],
    }
    validate_schema(receipt, "generated cleanup receipt")
    write_json_new(receipt_path, receipt)
    return receipt


def verify_post_cleanup(receipt_path: Path, census_path: Path, required_receipts_path: Path,
                        out: Path, *, _self_test_runner: Any = None) -> dict[str, Any]:
    receipt_path, receipt = load_nonsymlink_json(receipt_path, "cleanup receipt")
    if not isinstance(receipt, dict) or receipt.get("schema_id") != CLEANUP_RECEIPT_SCHEMA or receipt.get("status") != "enumerated_cleanup_complete":
        raise ValueError("cleanup receipt is missing or incomplete")
    validate_schema(receipt, "cleanup receipt")
    plan_path, plan = validate_file_ref(receipt.get("cleanup_plan"), "cleanup receipt plan")
    execution_approval_path, execution_approval = validate_file_ref(receipt.get("execution_approval"), "cleanup receipt execution approval")
    validate_schema(plan, "cleanup receipt plan")
    validate_schema(execution_approval, "cleanup receipt execution approval")
    _, user_approval = validate_file_ref(plan.get("approval"), "cleanup receipt user approval")
    root_manifest_path, root_manifest = validate_file_ref(plan.get("precleanup_root_manifest"), "cleanup receipt precleanup root manifest")
    validate_schema(user_approval, "cleanup receipt user approval")
    target_paths = [row.get("path") for row in plan.get("targets", []) if isinstance(row, dict)]
    if (execution_approval.get("schema_id") != EXECUTION_APPROVAL_SCHEMA
            or execution_approval.get("explicit_user_approval") is not True
            or execution_approval.get("cleanup_plan_sha256") != sha256(plan_path)
            or execution_approval.get("approved_paths") != target_paths
            or user_approval.get("schema_id") != USER_APPROVAL_SCHEMA
            or user_approval.get("explicit_user_approval") is not True
            or user_approval.get("approval_id") == execution_approval.get("approval_id")
            or user_approval.get("precleanup_root_manifest_sha256") != sha256(root_manifest_path)
            or user_approval.get("approved_paths") != target_paths
            or user_approval.get("recovery_disposition") != plan.get("recovery_disposition")
            or receipt.get("removed") != plan.get("targets")
            or receipt.get("preserved_precleanup") != plan.get("preserved")
            or receipt.get("recovery_disposition") != plan.get("recovery_disposition")):
        raise ValueError("cleanup receipt does not transitively bind one plan and two distinct exact approvals")
    root = lexical_absolute(Path(receipt.get("evidence_root", "")))
    if root != lexical_absolute(Path(plan.get("evidence_root", ""))):
        raise ValueError("cleanup receipt evidence root differs from its approved plan")
    if not isinstance(root_manifest, dict) or root_manifest.get("schema_id") != ROOT_SCHEMA or root_manifest.get("complete_file_census") is not True or not isinstance(root_manifest.get("files"), list) or not root_manifest["files"]:
        raise ValueError("cleanup receipt precleanup manifest is not a complete root census")
    root_rows: dict[str, dict[str, Any]] = {}
    for row in root_manifest["files"]:
        if not isinstance(row, dict):
            raise ValueError("cleanup receipt precleanup census contains a non-object row")
        relative = normalize_relative(row.get("path"))
        if relative in root_rows or not valid_sha(row.get("sha256")) or not isinstance(row.get("bytes"), int) or isinstance(row.get("bytes"), bool) or row["bytes"] < 0:
            raise ValueError(f"cleanup receipt precleanup census row is malformed or duplicated: {relative}")
        root_rows[relative] = row
    plan_partition = [*plan.get("targets", []), *plan.get("preserved", [])]
    if len(plan_partition) != len(root_rows) or {row.get("path") for row in plan_partition if isinstance(row, dict)} != set(root_rows) or any(root_rows.get(row.get("path")) != row for row in plan_partition if isinstance(row, dict)):
        raise ValueError("cleanup receipt plan is not the exact precleanup root-census partition")
    removed = [normalize_relative(row.get("path")) for row in receipt.get("removed", [])]
    if not removed or any(path_exists_under_nofollow(root, relative) for relative in removed):
        raise ValueError("one or more enumerated cleanup targets still exists")
    preserved = [census_row(root, row.get("path")) for row in receipt.get("preserved_precleanup", [])]
    if preserved != receipt.get("preserved_precleanup"):
        raise ValueError("preserved evidence changed during cleanup")
    _, census = load_nonsymlink_json(census_path, "post-cleanup census")
    if not isinstance(census, list) or not census:
        raise ValueError("post-cleanup census must be a non-empty JSON array")
    actual = [census_row(root, normalize_relative(row.get("path"))) for row in census if isinstance(row, dict)]
    if actual != census:
        raise ValueError("post-cleanup census is stale or incomplete")
    actual_rows = exact_file_census(root)
    if census != actual_rows:
        raise ValueError("post-cleanup census is not the exact surviving evidence-root census")
    _, specs = load_nonsymlink_json(required_receipts_path, "post-cleanup required-receipt index")
    validate_schema(specs, "post-cleanup typed producer requests")
    receipt_hash = sha256(receipt_path)
    admitted = authenticate_post_cleanup_producers(specs, receipt_hash, _self_test_runner)
    result = {
        "schema_id": POST_SCHEMA, "verified_at_utc": utc_now(), "status": "pass",
        "cleanup_receipt": file_ref(receipt_path), "removed_absent": removed,
        "preserved_current": preserved, "postcleanup_census": census,
        "required_receipts": admitted,
    }
    validate_schema(result, "generated post-cleanup verification")
    write_json_new(out, result)
    return result


def run_self_test() -> int:
    cases = []
    with tempfile.TemporaryDirectory(prefix="pm7-final-cleanup-selftest-") as raw:
        root = Path(raw); evidence = root / "evidence"; evidence.mkdir()
        for name in ("temporary.bin", "preserve.json"):
            (evidence / name).write_text(name, encoding="utf-8")
        root_manifest = evidence / "root-manifest.json"
        rows = [census_row(evidence, name) for name in ("temporary.bin", "preserve.json")]
        root_manifest.write_text(json.dumps({"schema_id": ROOT_SCHEMA, "complete_file_census": True, "files": rows}, indent=2) + "\n", encoding="utf-8")
        targets = root / "targets.json"; targets.write_text('["temporary.bin"]\n', encoding="utf-8")
        preserve = root / "preserve.json"; preserve.write_text('["preserve.json"]\n', encoding="utf-8")
        approval = root / "approval.json"
        approval.write_text(json.dumps({"schema_id": USER_APPROVAL_SCHEMA, "approval_id": "fixture", "approved_at_utc": utc_now(), "explicit_user_approval": True, "precleanup_root_manifest_sha256": sha256(root_manifest), "approved_paths": ["temporary.bin"], "recovery_disposition": "recoverable_backup_verified"}, indent=2) + "\n", encoding="utf-8")
        plan_path = root / "plan.json"
        try:
            build_plan(evidence, root_manifest, approval, targets, preserve, plan_path)
            cases.append({"case": "positive_dry_run_only", "pass": (evidence / "temporary.bin").is_file() and load_json(plan_path).get("execution_authorized") is False})
        except Exception as error:
            cases.append({"case": "positive_dry_run_only", "pass": False, "error": str(error)})
        bad = root / "bad-targets.json"; bad.write_text('["../escape"]\n', encoding="utf-8")
        try:
            build_plan(evidence, root_manifest, approval, bad, preserve, root / "bad-plan.json")
            cases.append({"case": "negative_escape", "pass": False})
        except Exception:
            cases.append({"case": "negative_escape", "pass": True})
        incomplete_preserve = root / "incomplete-preserve.json"; incomplete_preserve.write_text('["temporary.bin"]\n', encoding="utf-8")
        try:
            build_plan(evidence, root_manifest, approval, targets, incomplete_preserve, root / "incomplete-preserve-plan.json")
            cases.append({"case": "negative_incomplete_preserved_census", "pass": False})
        except Exception:
            cases.append({"case": "negative_incomplete_preserved_census", "pass": True})
        symlink = evidence / "symlink.bin"
        try:
            symlink.symlink_to(evidence / "temporary.bin")
            census_row(evidence, "symlink.bin")
            cases.append({"case": "negative_symlink_target", "pass": False})
        except Exception:
            cases.append({"case": "negative_symlink_target", "pass": True})
        finally:
            symlink.unlink(missing_ok=True)
        drifted = load_json(approval); drifted["precleanup_root_manifest_sha256"] = "0" * 64
        drifted_path = root / "drifted-approval.json"; drifted_path.write_text(json.dumps(drifted), encoding="utf-8")
        try:
            build_plan(evidence, root_manifest, drifted_path, targets, preserve, root / "drift-plan.json")
            cases.append({"case": "negative_stale_approval", "pass": False})
        except Exception:
            cases.append({"case": "negative_stale_approval", "pass": True})
        forged_receipt = root / "forged-cleanup-receipt.json"
        forged_receipt.write_text(json.dumps({
            "schema_id": CLEANUP_RECEIPT_SCHEMA, "status": "enumerated_cleanup_complete",
            "evidence_root": str(evidence), "removed": [{"path": "absent.bin", "sha256": "0" * 64, "bytes": 1}],
            "preserved_precleanup": rows,
        }), encoding="utf-8")
        try:
            verify_post_cleanup(forged_receipt, root / "unused-census.json", root / "unused-receipts.json", root / "forged-post.json")
            cases.append({"case": "negative_forged_postcleanup_without_plan_or_approvals", "pass": False})
        except Exception:
            cases.append({"case": "negative_forged_postcleanup_without_plan_or_approvals", "pass": True})
        forged_link = root / "forged-cleanup-receipt-link.json"
        try:
            forged_link.symlink_to(forged_receipt)
            verify_post_cleanup(forged_link, root / "unused-census.json", root / "unused-receipts.json", root / "forged-link-post.json")
            cases.append({"case": "negative_symlink_cleanup_receipt", "pass": False})
        except Exception:
            cases.append({"case": "negative_symlink_cleanup_receipt", "pass": True})
        post_root = root / "post-evidence"; post_root.mkdir()
        survivor_path = post_root / "survivor.bin"; survivor_path.write_bytes(b"survivor")
        removed_row = {"path": "removed.bin", "sha256": "1" * 64, "bytes": 7}
        survivor_row = census_row(post_root, "survivor.bin")
        post_root_manifest = root / "post-root-manifest.json"
        post_root_manifest.write_text(json.dumps({"schema_id": ROOT_SCHEMA, "complete_file_census": True, "files": [removed_row, survivor_row]}), encoding="utf-8")
        post_user = root / "post-user-approval.json"
        post_user.write_text(json.dumps({"schema_id": USER_APPROVAL_SCHEMA, "approval_id": "user-post", "approved_at_utc": utc_now(), "explicit_user_approval": True, "precleanup_root_manifest_sha256": sha256(post_root_manifest), "approved_paths": ["removed.bin"], "recovery_disposition": "recoverable_backup_verified"}), encoding="utf-8")
        post_plan = root / "post-plan.json"
        post_plan.write_text(json.dumps({"schema_id": PLAN_SCHEMA, "created_at_utc": utc_now(), "status": "dry_run_ready", "execution_authorized": False, "evidence_root": str(post_root.resolve()), "approval": file_ref(post_user), "precleanup_root_manifest": file_ref(post_root_manifest), "targets": [removed_row], "preserved": [survivor_row], "recovery_disposition": "recoverable_backup_verified"}), encoding="utf-8")
        post_execution = root / "post-execution-approval.json"
        post_execution.write_text(json.dumps({"schema_id": EXECUTION_APPROVAL_SCHEMA, "approval_id": "execution-post", "approved_at_utc": utc_now(), "explicit_user_approval": True, "cleanup_plan_sha256": sha256(post_plan), "approved_paths": ["removed.bin"]}), encoding="utf-8")
        post_receipt = root / "post-cleanup-receipt.json"
        post_receipt.write_text(json.dumps({"schema_id": CLEANUP_RECEIPT_SCHEMA, "executed_at_utc": utc_now(), "status": "enumerated_cleanup_complete", "evidence_root": str(post_root.resolve()), "cleanup_plan": file_ref(post_plan), "execution_approval": file_ref(post_execution), "removed": [removed_row], "preserved_precleanup": [survivor_row], "recovery_disposition": "recoverable_backup_verified"}), encoding="utf-8")
        post_census = root / "post-census.json"; post_census.write_text(json.dumps([survivor_row]), encoding="utf-8")
        minimal_specs = []
        for gate_id in ("post_cleanup_gate", "reproducible_build", "governance_gates"):
            gate_path = root / f"minimal-{gate_id}.json"
            gate_path.write_text(json.dumps({"status": "pass", "cleanup_receipt_sha256": sha256(post_receipt)}), encoding="utf-8")
            minimal_specs.append({"id": gate_id, "path": str(gate_path), "sha256": sha256(gate_path)})
        minimal_index = root / "minimal-gates.json"; minimal_index.write_text(json.dumps(minimal_specs), encoding="utf-8")
        try:
            verify_post_cleanup(post_receipt, post_census, minimal_index, root / "minimal-post-result.json")
            cases.append({"case": "negative_self_authored_status_only_gate_receipts", "pass": False})
        except Exception:
            cases.append({"case": "negative_self_authored_status_only_gate_receipts", "pass": True})
        requested_manifest = root / "post-gate-manifest.json"
        requested_manifest.write_text(json.dumps({"schema_id": "pm.pmconcept7.final_evidence_manifest.v1"}), encoding="utf-8")
        build_base = root / "build-base.html"; build_base.write_bytes(b"synthetic pinned base")
        approved_candidate = root / "approved-candidate.html"; approved_candidate.write_bytes(b"synthetic reproducible candidate")
        valid_specs = [
            {"id": "post_cleanup_gate", "manifest": file_ref(requested_manifest)},
            {"id": "reproducible_build", "base": file_ref(build_base), "approved_candidate": file_ref(approved_candidate)},
            {"id": "governance_gates"},
        ]
        valid_index = root / "valid-requests.json"; valid_index.write_text(json.dumps(valid_specs), encoding="utf-8")

        def synthetic_authenticated_runner(gate_id: str, argv: list[str], cwd: Path, outputs: dict[str, Path]) -> dict[str, Any]:
            if gate_id == "post_cleanup_gate":
                report = {"schema_id": "pm.pmconcept7.final_evidence_gate_report.v1", "disposition": "pass_with_native_runtime_platform_residuals_open", "manifest_sha256": sha256(requested_manifest)}
                return {"exit_code": 0, "stdout": b"synthetic gate stdout", "stderr": b"", "outputs": {"gate_report": json.dumps(report).encode("utf-8")}}
            if gate_id.startswith("reproducible_build_"):
                producer_sha = sha256(EXPECTED_POST_GATE_PRODUCERS["reproducible_build"])
                source_path = lexical_absolute(Path(__file__))
                report = {
                    "gates_all_pass": True, "base_pin_ok": True,
                    "base_sha256": sha256(build_base), "base_sha_pinned": sha256(build_base),
                    "output_sha256": sha256(approved_candidate), "transforms": [{"name": "fixture", "status": "ok"}],
                    "build_provenance": {"pipeline": {"path": str(EXPECTED_POST_GATE_PRODUCERS["reproducible_build"].relative_to(REPO_ROOT)), "sha256": producer_sha}, "authored_transform_sources_used": [{"transform": "fixture", "path": str(source_path.relative_to(REPO_ROOT)), "sha256": sha256(source_path)}]},
                }
                return {"exit_code": 0, "stdout": b"synthetic build stdout", "stderr": b"", "outputs": {"built_candidate": approved_candidate.read_bytes(), "build_report": json.dumps(report).encode("utf-8")}}
            if gate_id == "governance_gates":
                return {"exit_code": 0, "stdout": b"synthetic governance pass", "stderr": b"", "outputs": {"marker": b""}}
            raise AssertionError(f"unexpected synthetic producer: {gate_id}")
        try:
            positive_post = verify_post_cleanup(post_receipt, post_census, valid_index, root / "valid-post-result.json", _self_test_runner=synthetic_authenticated_runner)
            executions = positive_post.get("required_receipts", [])
            cases.append({"case": "positive_verifier_executed_postcleanup_producers", "pass": positive_post.get("status") == "pass" and [row.get("id") for row in executions] == ["post_cleanup_gate", "reproducible_build", "governance_gates"] and sum(len(row.get("executions", [])) for row in executions) == 4})
        except Exception as error:
            cases.append({"case": "positive_verifier_executed_postcleanup_producers", "pass": False, "error": str(error)})
        preauthored = [dict(row) for row in valid_specs]
        preauthored[0] = {"id": "post_cleanup_gate", "path": str(requested_manifest), "sha256": sha256(requested_manifest)}
        preauthored_index = root / "preauthored-requests.json"; preauthored_index.write_text(json.dumps(preauthored), encoding="utf-8")
        try:
            verify_post_cleanup(post_receipt, post_census, preauthored_index, root / "preauthored-post-result.json", _self_test_runner=synthetic_authenticated_runner)
            cases.append({"case": "negative_preauthored_expected_producer_receipts", "pass": False})
        except Exception:
            cases.append({"case": "negative_preauthored_expected_producer_receipts", "pass": True})
    passed = all(row["pass"] for row in cases)
    print(json.dumps({"schema_id": "pm.pmconcept7.final_campaign_cleanup_self_test.v1", "pass": passed, "destructive_execution_tested": False, "cases": cases}, indent=2))
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    plan = sub.add_parser("plan")
    plan.add_argument("--evidence-root", type=Path, required=True); plan.add_argument("--root-manifest", type=Path, required=True)
    plan.add_argument("--approval", type=Path, required=True); plan.add_argument("--paths", type=Path, required=True)
    plan.add_argument("--preserve", type=Path, required=True); plan.add_argument("--out", type=Path, required=True)
    execute = sub.add_parser("execute")
    execute.add_argument("--plan", type=Path, required=True); execute.add_argument("--execution-approval", type=Path, required=True); execute.add_argument("--receipt", type=Path, required=True)
    verify = sub.add_parser("verify-post-cleanup")
    verify.add_argument("--receipt", type=Path, required=True); verify.add_argument("--census", type=Path, required=True)
    verify.add_argument("--required-receipts", type=Path, required=True); verify.add_argument("--out", type=Path, required=True)
    sub.add_parser("self-test")
    args = parser.parse_args()
    if args.command == "plan": result = build_plan(args.evidence_root, args.root_manifest, args.approval, args.paths, args.preserve, args.out)
    elif args.command == "execute": result = execute_cleanup(args.plan, args.execution_approval, args.receipt)
    elif args.command == "verify-post-cleanup": result = verify_post_cleanup(args.receipt, args.census, args.required_receipts, args.out)
    else: return run_self_test()
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(json.dumps({"status": "fail", "error": str(error)}, indent=2), file=sys.stderr)
        raise SystemExit(1)
