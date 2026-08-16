#!/usr/bin/env python3
"""Compact zero-provider simulator for the iteration-005 public controller CLI.

The simulator never imports controller, backend, or verifier code.  It runs only
``controller.py simulate`` and ``controller.py reopen`` in subprocesses, while
the controller continues to load immutable iteration-005 controls in place.
Synthetic evidence has zero empirical and qualification credit.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import stat
import subprocess
import sys
import time
from typing import Any, Callable

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parent
STABILIZATION = ROOT.parent
SUCCESSOR = ROOT.parents[1]
REPO = ROOT.parents[4]
RUNS = STABILIZATION / "simulator_runs"
OPERATING = SUCCESSOR / "r9_goal_operating_contract_v1.json"
SEMANTIC = ROOT / "semantic_manifest.json"
SCHEDULE = ROOT / "schedule.json"
CATALOG = ROOT / "regression_catalog.json"
CONTRACT = ROOT / "simulator_contract.json"
FAULTS = ROOT / "fault_scenarios.json"
CONTROLLER = ROOT / "controller.py"
BACKEND = ROOT / "backend.py"
VERIFIER = ROOT / "verifier.py"
SIMULATOR = ROOT / "simulator.py"
PREDECESSOR_ROOT = STABILIZATION / "iteration_002"
REOPEN_REPAIR_CHECKPOINT = STABILIZATION / "git_checkpoint_iteration_003_v1.json"
REOPEN_REPAIR_PROGRESS = STABILIZATION / "progress_assessment_iteration_003_final_v1.json"
REOPEN_REPAIR_SUITE_RECEIPT = (
    STABILIZATION / "simulator_runs" / "iteration-003-final-self-test-001"
    / "simulator_receipt.json"
)
REOPEN_REPAIR_IDENTITIES = {
    REOPEN_REPAIR_CHECKPOINT: {
        "sha256": "f71b6d8fa4749fc7a212d104bd158b83dfa8933253527b2b31e57df53afcd027",
        "bytes": 6197,
    },
    REOPEN_REPAIR_PROGRESS: {
        "sha256": "a1684c896e846d445f4bcfef0d6ff367a903c2fefc4666d3abe2eda525ea5904",
        "bytes": 2542,
    },
    REOPEN_REPAIR_SUITE_RECEIPT: {
        "sha256": "365bc09467296174762cac501e1ec25a7f7203299c0d7ba8583eeeab24eb7749",
        "bytes": 260482,
    },
}
PERSISTENCE_PREDECESSOR_RECEIPT = (
    STABILIZATION / "simulator_runs" / "iteration-004-final-self-test-001"
    / "faults" / "025-loss-after-completion" / "receipt.json"
)
PERSISTENCE_PREDECESSOR_COMPLETION = (
    STABILIZATION / "simulator_runs" / "iteration-004-final-self-test-001"
    / "fault_evidence" / "025-loss-after-completion" / "run" / "cells"
    / "slot-alpha" / "000_S10A_DECISION_A01" / "completion.json"
)
PERSISTENCE_PREDECESSOR_IDENTITIES = {
    PERSISTENCE_PREDECESSOR_RECEIPT: {
        "sha256": "1955606fdbfd1d0b3d349c6ebc618111ce1b5036d6c233b512551f5d2851bb3e",
        "bytes": 451,
    },
    PERSISTENCE_PREDECESSOR_COMPLETION: {
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "bytes": 0,
    },
}
SAFE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
HEX64 = re.compile(r"[0-9a-f]{64}\Z")
FORBIDDEN_IMPORT = re.compile(
    r"(?:model_retest_r8_candidate_v|r8_candidate_v)(?:1[2-9]|20|21)(?:\.|/|\b)"
)
CONTROLLER_COMMANDS = ["reopen", "run-canary", "run-matrix", "simulate"]
ROW_FILES = ["attempt.json", "completion.json", "provider_input.txt", "raw_result.json"]
OBSERVED_EVIDENCE_SCHEMAS = {
    "attempt": "pw-r9-attempt-v2",
    "raw_result": "pw-r9-raw-result-v2",
    "completion": "pw-r9-completion-v2",
}


class SimulationError(RuntimeError):
    """Fail-closed simulator assertion."""


def _canon(value: Any) -> bytes:
    try:
        return json.dumps(
            value, ensure_ascii=False, allow_nan=False, sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise SimulationError(f"not canonical JSON: {exc}") from exc


def _semantic_canon(value: Any) -> bytes:
    try:
        return json.dumps(
            value, ensure_ascii=False, allow_nan=False, sort_keys=False,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise SimulationError(f"not semantic-canonical JSON: {exc}") from exc


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _identity(data: bytes) -> dict[str, Any]:
    return {"sha256": _sha(data), "bytes": len(data)}


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in pairs:
        if key in value:
            raise SimulationError(f"duplicate JSON key: {key}")
        value[key] = item
    return value


def _regular(path: Path, label: str) -> bytes:
    try:
        info = os.lstat(path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise SimulationError(f"{label}: absent: {path}") from exc
    if not stat.S_ISREG(info.st_mode):
        raise SimulationError(f"{label}: not a regular nonlink: {path}")
    try:
        return path.read_bytes()
    except OSError as exc:
        raise SimulationError(f"{label}: read failed: {exc}") from exc


def _directory(path: Path, label: str) -> None:
    try:
        info = os.lstat(path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        raise SimulationError(f"{label}: absent: {path}") from exc
    if not stat.S_ISDIR(info.st_mode):
        raise SimulationError(f"{label}: not a directory nonlink: {path}")


def _json(path: Path, label: str, canonical: bool = False) -> tuple[bytes, dict[str, Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise SimulationError(f"{label}: exactly one terminal LF and no CR required")
    try:
        value = json.loads(
            storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
            parse_constant=lambda token: (_ for _ in ()).throw(
                SimulationError(f"nonfinite JSON value: {token}")
            ),
        )
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise SimulationError(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise SimulationError(f"{label}: object required")
    if canonical and storage != _canon(value) + b"\n":
        raise SimulationError(f"{label}: noncanonical storage")
    return storage, value


def _sync_dir(path: Path) -> None:
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def _mkdir(path: Path) -> None:
    try:
        os.mkdir(path, 0o755)
    except FileExistsError as exc:
        raise SimulationError(f"create-only directory exists: {path}") from exc
    _directory(path, "created directory")
    _sync_dir(path.parent)


def _ensure_dir(path: Path, boundary: Path) -> None:
    boundary = boundary.resolve()
    missing: list[Path] = []
    current = path
    while not current.exists():
        try:
            current.resolve(strict=False).relative_to(boundary)
        except ValueError as exc:
            raise SimulationError(f"directory escapes boundary: {path}") from exc
        missing.append(current)
        current = current.parent
    _directory(current, "existing ancestor")
    for item in reversed(missing):
        _mkdir(item)


def _write(path: Path, storage: bytes) -> dict[str, Any]:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(storage)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise SimulationError(f"short write: {path}")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    _sync_dir(path.parent)
    if _regular(path, "reopened write") != storage:
        raise SimulationError(f"reopen mismatch: {path}")
    return _identity(storage)


def _write_json(path: Path, value: dict[str, Any]) -> dict[str, Any]:
    return _write(path, _canon(value) + b"\n")


def _relative(path: Path) -> str:
    try:
        return path.resolve().relative_to(REPO.resolve()).as_posix()
    except ValueError as exc:
        raise SimulationError(f"path outside repository: {path}") from exc


def _suite_root(text: str, create: bool) -> Path:
    if not text:
        raise SimulationError("--run-root required")
    if not RUNS.exists():
        if not create:
            raise SimulationError("simulator runs root absent")
        _mkdir(RUNS)
    else:
        _directory(RUNS, "simulator runs root")
    supplied = Path(text)
    path = RUNS / supplied if not supplied.is_absolute() and len(supplied.parts) == 1 else supplied
    path = path.resolve(strict=False)
    if path.parent != RUNS.resolve() or not SAFE.fullmatch(path.name):
        raise SimulationError(f"run root must be a safe direct child of {RUNS}")
    if create:
        if path.exists() or path.is_symlink():
            raise SimulationError("run root already exists; reuse forbidden")
        _mkdir(path)
        for name in ("evidence", "fault_evidence", "faults", "work"):
            _mkdir(path / name)
    else:
        _directory(path, "suite root")
    return path


def _source_paths() -> list[Path]:
    _, semantic = _json(SEMANTIC, "semantic manifest")
    rows = semantic.get("files")
    if not isinstance(rows, list):
        raise SimulationError("semantic files list absent")
    paths = [OPERATING]
    for source in sorted(ROOT.iterdir(), key=lambda item: item.name):
        if source.name == "evidence":
            continue
        if source.name == "__pycache__":
            raise SimulationError("pycache forbidden in iteration_004")
        info = os.lstat(source)
        if stat.S_ISREG(info.st_mode) and source.suffix in {".json", ".py", ".md"}:
            paths.append(source)
        elif stat.S_ISDIR(info.st_mode):
            raise SimulationError(f"unexpected iteration control directory: {source.name}")
        elif not stat.S_ISREG(info.st_mode):
            raise SimulationError(f"nonregular iteration control member: {source.name}")
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or set(row) != {"path", "sha256", "bytes"}:
            raise SimulationError(f"semantic file row {index}: shape mismatch")
        text = row.get("path")
        if not isinstance(text, str):
            raise SimulationError(f"semantic file row {index}: path absent")
        rel = Path(text)
        if rel.is_absolute() or ".." in rel.parts or "__pycache__" in rel.parts or rel.suffix == ".pyc":
            raise SimulationError(f"semantic file row {index}: unsafe or bytecode path")
        source = SUCCESSOR / rel
        data = _regular(source, f"semantic source {text}")
        if _identity(data) != {"sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise SimulationError(f"semantic source identity drift: {text}")
        paths.append(source)
    unique = {path.resolve(): path for path in paths}
    return sorted(unique.values(), key=_relative)


def _git(args: list[str], input_bytes: bytes | None = None, allow_fail: bool = False) -> bytes | None:
    completed = subprocess.run(
        ["git", *args], cwd=REPO, input=input_bytes, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, check=False, env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"},
    )
    if completed.returncode != 0:
        if allow_fail:
            return None
        raise SimulationError(
            f"git {' '.join(args)} failed rc={completed.returncode}: "
            f"{completed.stderr.decode('utf-8', 'replace')}"
        )
    return completed.stdout.rstrip(b"\n")


def _git_at(repository: Path, args: list[str], allow_fail: bool = False,
            preserve_output: bool = False) -> bytes | None:
    """Run local-only Git in an isolated causal-reproducer repository."""
    completed = subprocess.run(
        ["git", "-C", str(repository), *args], stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        env={
            **os.environ,
            "GIT_CONFIG_GLOBAL": os.devnull,
            "GIT_CONFIG_SYSTEM": os.devnull,
            "GIT_OPTIONAL_LOCKS": "0",
            "GIT_AUTHOR_NAME": "R9 deterministic simulator",
            "GIT_AUTHOR_EMAIL": "r9-simulator.invalid@example.invalid",
            "GIT_COMMITTER_NAME": "R9 deterministic simulator",
            "GIT_COMMITTER_EMAIL": "r9-simulator.invalid@example.invalid",
            "GIT_AUTHOR_DATE": "2001-01-01T00:00:00Z",
            "GIT_COMMITTER_DATE": "2001-01-01T00:00:00Z",
            "LC_ALL": "C",
        },
    )
    if completed.returncode != 0:
        if allow_fail:
            return None
        raise SimulationError(
            f"isolated git {' '.join(args)} failed rc={completed.returncode}: "
            f"{completed.stderr.decode('utf-8', 'replace')}"
        )
    return completed.stdout if preserve_output else completed.stdout.rstrip(b"\n")


def _sandbox_source_paths(component_root: Path) -> list[Path]:
    """Return the exact minimum runtime/source closure for a historical-HEAD proof."""
    _directory(component_root, "sandbox component root")
    semantic_path = component_root / "semantic_manifest.json"
    _, semantic = _json(semantic_path, "sandbox semantic manifest")
    rows = semantic.get("files")
    if not isinstance(rows, list):
        raise SimulationError("sandbox semantic inventory absent")
    paths = [OPERATING]
    for source in sorted(component_root.iterdir(), key=lambda item: item.name):
        info = os.lstat(source)
        if stat.S_ISDIR(info.st_mode):
            if source.name == "evidence":
                continue
            raise SimulationError(f"sandbox component directory forbidden: {source}")
        if not stat.S_ISREG(info.st_mode) or source.suffix not in {".json", ".py", ".md"}:
            raise SimulationError(f"sandbox component member forbidden: {source}")
        paths.append(source)
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or set(row) != {"path", "sha256", "bytes"}:
            raise SimulationError(f"sandbox semantic row {index}: shape mismatch")
        text = row.get("path")
        if not isinstance(text, str):
            raise SimulationError(f"sandbox semantic row {index}: path absent")
        pure = Path(text)
        if pure.is_absolute() or ".." in pure.parts:
            raise SimulationError(f"sandbox semantic row {index}: unsafe path")
        source = SUCCESSOR / pure
        storage = _regular(source, f"sandbox semantic source {text}")
        if _identity(storage) != {"sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise SimulationError(f"sandbox semantic source drift: {text}")
        paths.append(source)
    _, pipeline = _json(component_root / "pipeline_contract.json", "sandbox pipeline contract")
    bindings = pipeline.get("bindings")
    if not isinstance(bindings, dict):
        raise SimulationError("sandbox pipeline bindings absent")
    for key, row in bindings.items():
        if not isinstance(row, dict) or not isinstance(row.get("path"), str):
            raise SimulationError(f"sandbox pipeline binding malformed: {key}")
        pure = Path(row["path"])
        if pure.is_absolute() or ".." in pure.parts:
            raise SimulationError(f"sandbox pipeline binding unsafe: {key}")
        source = REPO / pure if pure.parts and pure.parts[0] == "tests" else component_root / pure
        storage = _regular(source, f"sandbox pipeline binding {key}")
        if _identity(storage) != {"sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise SimulationError(f"sandbox pipeline binding drift: {key}")
        paths.append(source)
    unique = {path.resolve(): path for path in paths}
    return sorted(unique.values(), key=_relative)


def _materialize_sandbox_repository(repository: Path, component_root: Path,
                                    boundary: Path) -> tuple[Path, dict[str, Any]]:
    """Create a minimal local Git repository without importing executable code."""
    _mkdir(repository)
    sources = _sandbox_source_paths(component_root)
    rows: list[dict[str, Any]] = []
    for source in sources:
        relative = Path(_relative(source))
        target = repository / relative
        _ensure_dir(target.parent, boundary)
        storage = _regular(source, "sandbox source")
        _write(target, storage)
        rows.append({"path": relative.as_posix(), **_identity(storage)})
    _git_at(repository, ["init", "--quiet"])
    _git_at(repository, ["add", "--", *[row["path"] for row in rows]])
    _git_at(repository, ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null",
                         "commit", "--quiet", "-m", "recorded exact experiment bytes"])
    head_raw = _git_at(repository, ["rev-parse", "HEAD"])
    if head_raw is None:
        raise SimulationError("sandbox recorded HEAD absent")
    recorded_head = head_raw.decode("ascii")
    component_relative = Path(_relative(component_root))
    return repository / component_relative, {
        "recorded_git_head": recorded_head,
        "source_file_count": len(rows),
        "source_rows_sha256": _sha(_canon(rows)),
        "source_rows_bytes": len(_canon(rows)),
        "source_rows": rows,
        "component_root": component_relative.as_posix(),
    }


def _advance_sandbox_head(repository: Path, label: str) -> str:
    marker = repository / "historical_head_marker.json"
    _write_json(marker, {
        "schema_id": "pw-r9-simulator-historical-head-marker-v1",
        "label": label,
        "meaning": "unbound metadata advances current HEAD without changing experiment bytes",
    })
    _git_at(repository, ["add", "--", marker.name])
    _git_at(repository, ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null",
                         "commit", "--quiet", "-m", "advance unrelated evidence custody"])
    head_raw = _git_at(repository, ["rev-parse", "HEAD"])
    if head_raw is None:
        raise SimulationError("sandbox advanced HEAD absent")
    return head_raw.decode("ascii")


def _reopen_recorded_sources(repository: Path, recorded_head: str,
                             rows: list[dict[str, Any]]) -> dict[str, Any]:
    reopened: list[dict[str, Any]] = []
    for row in rows:
        path = row.get("path")
        if not isinstance(path, str):
            raise SimulationError("recorded source row path absent")
        blob = _git_at(repository, ["show", f"{recorded_head}:{path}"], preserve_output=True)
        if blob is None or _identity(blob) != {"sha256": row.get("sha256"), "bytes": row.get("bytes")}:
            raise SimulationError(f"recorded source blob drift: {path}")
        reopened.append({"path": path, **_identity(blob)})
    return {
        "status": "PASS", "recorded_git_head": recorded_head,
        "reopened_blob_count": len(reopened),
        "reopened_rows_sha256": _sha(_canon(reopened)),
        "reopened_rows_bytes": len(_canon(reopened)),
    }


def _source_snapshot() -> dict[str, Any]:
    paths = _source_paths()
    files: list[dict[str, Any]] = []
    matches_head = True
    for path in paths:
        data = _regular(path, "bound source")
        rel = _relative(path)
        current_blob_raw = _git(["hash-object", "--stdin"], data)
        current_blob = current_blob_raw.decode("ascii") if current_blob_raw is not None else None
        head_blob_raw = _git(["rev-parse", f"HEAD:{rel}"], allow_fail=True)
        head_blob = head_blob_raw.decode("ascii") if head_blob_raw else None
        matches_head = matches_head and current_blob == head_blob
        files.append({
            "path": rel, **_identity(data), "git_blob_oid": current_blob,
            "head_blob_oid": head_blob, "matches_head": current_blob == head_blob,
        })
    head_raw = _git(["rev-parse", "HEAD"])
    origin_raw = _git(["rev-parse", "refs/remotes/origin/main"], allow_fail=True)
    status_raw = _git(
        ["status", "--porcelain=v2", "--untracked-files=all", "--", *[row["path"] for row in files]]
    )
    return {
        "schema_id": "pw-r9-source-bundle-binding-v1",
        "files": files,
        "file_count": len(files),
        "head": head_raw.decode("ascii") if head_raw else None,
        "origin_main": origin_raw.decode("ascii") if origin_raw else None,
        "head_equals_origin_main": bool(head_raw and origin_raw and head_raw == origin_raw),
        "all_bound_files_match_head": matches_head,
        "bound_status_porcelain_v2": status_raw.decode("utf-8") if status_raw else "",
        "bound_status_identity": _identity(status_raw or b""),
    }


def _stable_source_rows(snapshot: dict[str, Any], label: str) -> list[dict[str, Any]]:
    """Project only durable source identity, excluding mutable Git observations."""
    files = snapshot.get("files")
    if not isinstance(files, list):
        raise SimulationError(f"{label}: source files absent")
    if snapshot.get("file_count") != len(files):
        raise SimulationError(f"{label}: source file count mismatch")
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, row in enumerate(files):
        if not isinstance(row, dict):
            raise SimulationError(f"{label}: source row {index} is not an object")
        path = row.get("path")
        sha256 = row.get("sha256")
        size = row.get("bytes")
        if (not isinstance(path, str) or not path or Path(path).is_absolute()
                or ".." in Path(path).parts):
            raise SimulationError(f"{label}: unsafe source path at row {index}")
        if path in seen:
            raise SimulationError(f"{label}: duplicate source path: {path}")
        if not isinstance(sha256, str) or not HEX64.fullmatch(sha256):
            raise SimulationError(f"{label}: invalid source SHA-256: {path}")
        if not isinstance(size, int) or isinstance(size, bool) or size < 0:
            raise SimulationError(f"{label}: invalid source byte count: {path}")
        seen.add(path)
        rows.append({"path": path, "sha256": sha256, "bytes": size})
    return sorted(rows, key=lambda row: row["path"])


def _snapshot_recorded_source_paths(recorded: dict[str, Any]) -> dict[str, Any]:
    """Reopen the exact recorded path set and record current Git custody separately."""
    expected = _stable_source_rows(recorded, "recorded source bundle")
    files: list[dict[str, Any]] = []
    matches_head = True
    for row in expected:
        path = REPO / row["path"]
        data = _regular(path, f"reopened recorded source {row['path']}")
        current_blob_raw = _git(["hash-object", "--stdin"], data)
        current_blob = current_blob_raw.decode("ascii") if current_blob_raw is not None else None
        head_blob_raw = _git(["rev-parse", f"HEAD:{row['path']}"], allow_fail=True)
        head_blob = head_blob_raw.decode("ascii") if head_blob_raw else None
        matches_head = matches_head and current_blob == head_blob
        files.append({
            "path": row["path"], **_identity(data), "git_blob_oid": current_blob,
            "head_blob_oid": head_blob, "matches_head": current_blob == head_blob,
        })
    head_raw = _git(["rev-parse", "HEAD"])
    origin_raw = _git(["rev-parse", "refs/remotes/origin/main"], allow_fail=True)
    status_raw = _git([
        "status", "--porcelain=v2", "--untracked-files=all", "--",
        *[row["path"] for row in files],
    ])
    return {
        "schema_id": "pw-r9-source-bundle-binding-v1",
        "files": files,
        "file_count": len(files),
        "head": head_raw.decode("ascii") if head_raw else None,
        "origin_main": origin_raw.decode("ascii") if origin_raw else None,
        "head_equals_origin_main": bool(head_raw and origin_raw and head_raw == origin_raw),
        "all_bound_files_match_head": matches_head,
        "bound_status_porcelain_v2": status_raw.decode("utf-8") if status_raw else "",
        "bound_status_identity": _identity(status_raw or b""),
    }


def _source_identity_comparison(before: dict[str, Any], after: dict[str, Any],
                                current: dict[str, Any]) -> dict[str, Any]:
    """Compare stable sorted path/hash/byte rows and retain typed mismatch details."""
    before_rows = _stable_source_rows(before, "source bundle before")
    after_rows = _stable_source_rows(after, "source bundle after")
    current_rows = _stable_source_rows(current, "current source bundle")
    before_map = {row["path"]: row for row in before_rows}
    current_map = {row["path"]: row for row in current_rows}
    missing = sorted(set(before_map) - set(current_map))
    extra = sorted(set(current_map) - set(before_map))
    drift = [
        {"path": path, "expected": before_map[path], "observed": current_map[path]}
        for path in sorted(set(before_map) & set(current_map))
        if before_map[path] != current_map[path]
    ]
    before_after_equal = before_rows == after_rows
    before_current_equal = before_rows == current_rows
    return {
        "status": "PASS" if before_after_equal and before_current_equal else "FAIL",
        "projection": "sorted path/sha256/bytes",
        "before_after_equal": before_after_equal,
        "before_current_equal": before_current_equal,
        "expected_file_count": len(before_rows),
        "current_file_count": len(current_rows),
        "expected_rows_sha256": _sha(_canon(before_rows)),
        "expected_rows_bytes": len(_canon(before_rows)),
        "current_rows_sha256": _sha(_canon(current_rows)),
        "current_rows_bytes": len(_canon(current_rows)),
        "missing_paths": missing,
        "extra_paths": extra,
        "identity_drift": drift,
    }


def _current_git_custody(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Report present custody without coupling it to historical receipt metadata."""
    head_origin = snapshot.get("head_equals_origin_main") is True
    files_head = snapshot.get("all_bound_files_match_head") is True
    return {
        "status": "PASS" if head_origin and files_head else "FAIL",
        "local_head": snapshot.get("head"),
        "origin_main": snapshot.get("origin_main"),
        "head_equals_origin_main": head_origin,
        "all_bound_files_match_head": files_head,
        "bound_status_porcelain_v2": snapshot.get("bound_status_porcelain_v2"),
        "bound_status_identity": snapshot.get("bound_status_identity"),
        "historical_status_or_head_equality_required": False,
    }


def _recorded_component_root(snapshot: dict[str, Any]) -> Path:
    """Resolve the one controller directory already bound by the suite receipt."""
    rows = _stable_source_rows(snapshot, "recorded component source bundle")
    matches = [row for row in rows if row["path"].endswith("/controller.py")]
    if len(matches) != 1:
        raise SimulationError("recorded source bundle must contain exactly one controller.py")
    root = (REPO / matches[0]["path"]).parent
    for name in ("backend.py", "controller.py", "semantic_manifest.json", "verifier.py"):
        path = root / name
        expected = [row for row in rows if row["path"] == _relative(path)]
        if len(expected) != 1 or _identity(_regular(path, f"recorded {name}")) != {
            "sha256": expected[0]["sha256"], "bytes": expected[0]["bytes"],
        }:
            raise SimulationError(f"recorded component closure mismatch: {name}")
    return root


def _reopen_repair_causal_proof(receipt_storage: bytes, before: dict[str, Any],
                                after: dict[str, Any], current: dict[str, Any],
                                stable: dict[str, Any], custody: dict[str, Any]) -> dict[str, Any] | None:
    """Bind the exact iteration-003 post-push FAIL and its byte-stable successor."""
    if _identity(receipt_storage) != REOPEN_REPAIR_IDENTITIES[REOPEN_REPAIR_SUITE_RECEIPT]:
        return None
    evidence: list[dict[str, Any]] = []
    values: dict[Path, dict[str, Any]] = {}
    for path in (REOPEN_REPAIR_CHECKPOINT, REOPEN_REPAIR_PROGRESS):
        storage, value = _json(path, f"reopen-repair evidence {path.name}", True)
        if _identity(storage) != REOPEN_REPAIR_IDENTITIES[path]:
            raise SimulationError(f"reopen-repair predecessor evidence drift: {path.name}")
        evidence.append({"path": _relative(path), **_identity(storage)})
        values[path] = value
    checkpoint = values[REOPEN_REPAIR_CHECKPOINT]
    progress = values[REOPEN_REPAIR_PROGRESS]
    normalized = checkpoint.get("command", {}).get("normalized_report", {})
    failure = progress.get("failure", {})
    predecessor_fail = (
        checkpoint.get("status") == "POST_PUSH_REOPEN_FAIL"
        and normalized.get("status") == "FAIL"
        and normalized.get("source_bundle_matches") is False
        and sorted(normalized.get("clean_run_statuses", {}).values()) == ["PASS", "PASS"]
        and failure.get("normalized_family") == "DURABLE_REOPEN_COUPLED_TO_MUTABLE_GIT_STATE"
        and failure.get("signature")
        == "POST_PUSH_REOPEN_FAIL/source_bundle_matches=false after byte-identical bundle became tracked at pushed HEAD"
    )
    old_mutable_equal = before == after == current
    head_transition = before.get("head") != current.get("head")
    status_transition = (
        before.get("bound_status_identity") != current.get("bound_status_identity")
        or before.get("bound_status_porcelain_v2") != current.get("bound_status_porcelain_v2")
    )
    successor_pass = (
        stable.get("status") == "PASS" and custody.get("status") == "PASS"
        and head_transition and status_transition and not old_mutable_equal
    )
    status = "PASS" if predecessor_fail and successor_pass else "FAIL"
    return {
        "status": status,
        "normalized_signature": "R9_REG_20_HISTORICAL_RUN_GIT_HEAD_DRIFT",
        "normalized_family": "DURABLE_REOPEN_COUPLED_TO_MUTABLE_GIT_STATE",
        "predecessor": {
            "result": "FAIL", "exact_evidence": evidence,
            "legacy_full_mutable_snapshot_equal": old_mutable_equal,
            "clean_runs_individually_reopened": True,
        },
        "successor": {
            "result": "PASS" if successor_pass else "FAIL",
            "stable_path_sha256_bytes": stable.get("status"),
            "current_git_custody": custody.get("status"),
            "recorded_head": before.get("head"), "current_head": current.get("head"),
            "head_transition_observed": head_transition,
            "tracking_or_status_transition_observed": status_transition,
        },
        "causal_delta": "delete full mutable snapshot equality; retain exact byte identity and current Git custody",
        "calls": {"subject": 0, "provider": 0, "network": 0},
        "qualification_credit": 0,
    }


def _controller_commands() -> list[str]:
    tree = ast.parse(_regular(CONTROLLER, "controller source").decode("utf-8"), filename=str(CONTROLLER))
    commands: set[str] = set()
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not isinstance(node.func, ast.Attribute):
            continue
        if node.func.attr != "add_parser" or not node.args:
            continue
        first = node.args[0]
        if isinstance(first, ast.Constant) and isinstance(first.value, str):
            commands.add(first.value)
    return sorted(commands)


def _candidate_imports() -> list[str]:
    findings: list[str] = []
    for path in (CONTROLLER, BACKEND, VERIFIER, SIMULATOR):
        source = _regular(path, "Python source").decode("utf-8")
        tree = ast.parse(source, filename=str(path))
        for node in ast.walk(tree):
            names: list[str] = []
            if isinstance(node, ast.Import):
                names = [alias.name for alias in node.names]
            elif isinstance(node, ast.ImportFrom):
                names = [node.module or ""]
            for name in names:
                if FORBIDDEN_IMPORT.search(name):
                    findings.append(f"{path.name}:{getattr(node, 'lineno', 0)}:{name}")
    return findings


def _history() -> list[dict[str, Any]]:
    _, catalog = _json(CATALOG, "regression catalog")
    rows = catalog.get("families")
    if not isinstance(rows, list):
        raise SimulationError("regression catalog families absent")
    result: list[dict[str, Any]] = []
    for family in rows:
        if not isinstance(family, dict):
            raise SimulationError("regression family is not an object")
        evidence: list[dict[str, Any]] = []
        for ref in family.get("evidence_refs", []):
            if not isinstance(ref, dict) or not isinstance(ref.get("path"), str):
                raise SimulationError("predecessor evidence reference malformed")
            path = REPO / ref["path"]
            data = _regular(path, f"predecessor {ref['path']}")
            expected = {"sha256": ref.get("sha256"), "bytes": ref.get("bytes")}
            if _identity(data) != expected:
                raise SimulationError(f"predecessor evidence drift: {ref['path']}")
            evidence.append({"path": ref["path"], "role": ref.get("role"), **expected})
        result.append({
            "regression_id": family.get("regression_id"),
            "scenario_id": family.get("stabilized_simulator_scenario", {}).get("scenario_id"),
            "predecessor_result": "FAIL",
            "predecessor_disposition": "PRESERVED_FAIL_NEVER_RECLASSIFIED",
            "evidence": evidence,
        })
    return result


def _persistence_predecessor() -> dict[str, Any]:
    """Reopen the exact iteration-004 existence-observer failure without reclassifying it."""
    rows: list[dict[str, Any]] = []
    values: dict[Path, dict[str, Any]] = {}
    for path, expected in PERSISTENCE_PREDECESSOR_IDENTITIES.items():
        storage = _regular(path, f"persistence predecessor {path.name}")
        if _identity(storage) != expected:
            raise SimulationError(f"persistence predecessor drift: {_relative(path)}")
        rows.append({"path": _relative(path), **expected})
        if path == PERSISTENCE_PREDECESSOR_RECEIPT:
            parsed_storage, value = _json(path, "persistence predecessor receipt", True)
            if parsed_storage != storage:
                raise SimulationError("persistence predecessor receipt reopen mismatch")
            values[path] = value
    receipt = values[PERSISTENCE_PREDECESSOR_RECEIPT]
    if not (
        receipt.get("schema_id") == "pw-r9-compact-fault-receipt-v2"
        and receipt.get("identifier") == "loss-after-completion"
        and receipt.get("strategy") == "supervised_observation"
        and receipt.get("current_result") == "FAIL"
        and receipt.get("error", {}).get("message")
        == "completion: exactly one terminal LF and no CR required"
    ):
        raise SimulationError("persistence predecessor receipt semantics drift")
    return {
        "normalized_signature": "R9_REG_007_EXISTENCE_BEFORE_PERSISTENCE",
        "result": "FAIL_PRESERVED",
        "observer": "iteration_004 path-existence-only supervisor",
        "exact_evidence": rows,
        "zero_byte_completion": True,
        "qualification_credit": 0,
        "calls": {"subject": 0, "provider": 0, "network": 0},
    }


def _static_check() -> dict[str, Any]:
    _, contract = _json(CONTRACT, "simulator contract")
    _, faults = _json(FAULTS, "fault scenarios")
    _, catalog = _json(CATALOG, "regression catalog")
    _, semantic = _json(SEMANTIC, "semantic manifest")
    _, schedule = _json(SCHEDULE, "schedule")
    if contract.get("schema_id") != "pw-r9-simulator-contract-v4":
        raise SimulationError("simulator contract schema mismatch")
    if faults.get("schema_id") != "pw-r9-fault-scenarios-v3":
        raise SimulationError("fault scenario schema mismatch")
    catalog_rows, scenario_rows = catalog.get("families"), faults.get("scenarios")
    if not isinstance(catalog_rows, list) or not isinstance(scenario_rows, list):
        raise SimulationError("catalog or scenario rows absent")
    catalog_map = {
        row["regression_id"]: row["stabilized_simulator_scenario"]["scenario_id"]
        for row in catalog_rows
    }
    scenario_map = {row["regression_id"]: row["scenario_id"] for row in scenario_rows}
    if len(scenario_map) != len(scenario_rows) or scenario_map != catalog_map:
        raise SimulationError("normalized 20-family scenario coverage mismatch")
    variants = [variant for row in scenario_rows for variant in row.get("variants", [])]
    globals_ = faults.get("global_fault_cases")
    if len(variants) != 47 or not isinstance(globals_, list) or len(globals_) < 10:
        raise SimulationError("fault variant/global case count mismatch")
    labels = {
        label for row in variants + globals_ for label in row.get("fault_labels", [])
        if isinstance(label, str)
    }
    required = set(contract.get("required_faults", []))
    if not required.issubset(labels):
        raise SimulationError(f"required fault labels missing: {sorted(required - labels)}")
    commands = _controller_commands()
    if commands != CONTROLLER_COMMANDS:
        raise SimulationError(f"controller command surface drift: {commands}")
    imports = _candidate_imports()
    if imports:
        raise SimulationError(f"forbidden candidate runtime imports: {imports}")
    if semantic.get("schema_id") != "pw-r9-semantic-manifest-v2":
        raise SimulationError("semantic manifest v2 required")
    semantic_files = semantic.get("files")
    cells = semantic.get("cells")
    stages = semantic.get("deterministic_stages")
    stage_order = semantic.get("stage_order")
    entries = schedule.get("entries")
    if not isinstance(semantic_files, list) or len(semantic_files) != 38:
        raise SimulationError("exact 38-row transitive semantic inventory required")
    fixture_rows = [
        row for row in semantic_files if isinstance(row, dict)
        and str(row.get("path", "")).startswith("frozen_plans_snapshot_20260814_v1/fixture/Plans/")
    ]
    if len(fixture_rows) != 15:
        raise SimulationError("exact 15 frozen fixture Plan rows required")
    if not isinstance(cells, list) or len(cells) != 97:
        raise SimulationError("97 semantic cells required")
    if not isinstance(stages, list) or len(stages) != 18:
        raise SimulationError("18 deterministic stages required")
    if not isinstance(stage_order, list) or len(stage_order) != 18:
        raise SimulationError("18-stage total order required")
    if not isinstance(entries, list) or len(entries) != 291:
        raise SimulationError("291-row schedule required")
    for cell in cells:
        gate = cell.get("dependency_gate") if isinstance(cell, dict) else None
        if not isinstance(gate, dict) or set(gate) != {
            "rule", "required_pass_cells", "required_stage_artifacts"
        }:
            raise SimulationError("cell dependency gate shape mismatch")
    for stage in stages:
        if not isinstance(stage, dict) or stage.get("stage") not in stage_order:
            raise SimulationError("deterministic stage row mismatch")
        payload = _semantic_canon(stage.get("expected_artifact"))
        storage = payload + b"\n"
        if _identity(payload) != {
            "sha256": stage.get("expected_artifact_sha256"),
            "bytes": stage.get("expected_artifact_bytes"),
        } or _identity(storage) != {
            "sha256": stage.get("expected_artifact_storage_sha256"),
            "bytes": stage.get("expected_artifact_storage_bytes"),
        }:
            raise SimulationError(f"stage identity mismatch: {stage.get('stage')}")
    persistence_predecessor = _persistence_predecessor()
    snapshot = _source_snapshot()
    return {
        "schema_id": "pw-r9-simulator-check-v2", "status": "PASS",
        "qualification_credit": 0,
        "calls": {"subject": 0, "provider": 0, "network": 0, "controller": 0},
        "regression_families": len(scenario_rows), "variants": len(variants),
        "global_cases": len(globals_), "fault_labels": sorted(labels),
        "controller_commands": commands,
        "candidate_v12_v21_runtime_imports": imports,
        "semantic_counts": {"cells": 97, "schedule_rows": 291, "stages": 18,
                            "route_local_artifacts": 54},
        "source_bundle": snapshot,
        "historical_predecessors": _history(),
        "persistence_predecessor": persistence_predecessor,
    }


def _parse_stdout(stdout: bytes) -> dict[str, Any] | None:
    lines = [line for line in stdout.splitlines() if line.strip()]
    if not lines:
        return None
    try:
        value = json.loads(lines[-1])
    except json.JSONDecodeError:
        return None
    return value if isinstance(value, dict) else None


def _controller_env(evidence_parent: Path) -> dict[str, str]:
    _directory(evidence_parent, "controller evidence parent")
    return {
        **os.environ,
        "PYTHONDONTWRITEBYTECODE": "1",
        "R9_SIMULATOR_ZERO_PROVIDER": "1",
        "PW_R9_SIMULATOR_EVIDENCE_ROOT": str(evidence_parent.resolve()),
    }


def _invocation_record(args: list[str], rc: int, stdout: bytes, stderr: bytes,
                       elapsed_ns: int) -> dict[str, Any]:
    return {
        "args": args, "rc": rc, "stdout": _identity(stdout),
        "stderr": _identity(stderr), "stdout_utf8": stdout.decode("utf-8", "replace"),
        "stderr_utf8": stderr.decode("utf-8", "replace"),
        "result": _parse_stdout(stdout), "elapsed_monotonic_ns": elapsed_ns,
    }


def _invoke(evidence_parent: Path, args: list[str], timeout: float = 600.0) -> dict[str, Any]:
    if not args or args[0] not in {"simulate", "reopen"}:
        raise SimulationError("simulator may invoke only public simulate or reopen")
    started = time.monotonic_ns()
    try:
        completed = subprocess.run(
            [sys.executable, "controller.py", *args], cwd=ROOT,
            env=_controller_env(evidence_parent), stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, timeout=timeout, check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise SimulationError(f"controller timed out: {args}") from exc
    return _invocation_record(
        args, completed.returncode, completed.stdout, completed.stderr,
        time.monotonic_ns() - started,
    )


def _invoke_from(component_root: Path, evidence_parent: Path, args: list[str],
                 timeout: float = 600.0) -> dict[str, Any]:
    """Invoke only the public simulator/reopen surface in an isolated local repo."""
    if not args or args[0] not in {"simulate", "reopen"}:
        raise SimulationError("historical reproducer may invoke only simulate or reopen")
    _directory(component_root, "historical component root")
    started = time.monotonic_ns()
    try:
        completed = subprocess.run(
            [sys.executable, "controller.py", *args], cwd=component_root,
            env=_controller_env(evidence_parent), stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, timeout=timeout, check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise SimulationError(f"historical controller timed out: {args}") from exc
    return _invocation_record(
        args, completed.returncode, completed.stdout, completed.stderr,
        time.monotonic_ns() - started,
    )


def _assert_invocation(invocation: dict[str, Any], rc: int, status: str) -> None:
    result = invocation.get("result")
    actual = result.get("status") if isinstance(result, dict) else None
    if invocation.get("rc") != rc or actual != status:
        raise SimulationError(
            f"controller result mismatch rc/status={invocation.get('rc')}/{actual!r}, "
            f"expected {rc}/{status!r}: {invocation.get('stdout_utf8')}"
        )


def _assert_backend_observation(summary: dict[str, Any], scenario: str) -> None:
    observation = summary["backend_observation"]
    expected = {
        "immediate": (["immediate"], ["TASK_COMPLETE"], [0], ["PRESENT"]),
        "yielded_multi_poll": (["yielded_multi_poll"], ["TASK_COMPLETE"], [0], ["PRESENT"]),
        "missing_output": (["missing_output"], ["TASK_COMPLETE"], [0], ["MISSING"]),
        "lf_only_output": (["lf_only_output"], ["TASK_COMPLETE"], [0], ["PRESENT"]),
        "partial_output": (["partial_output"], ["TASK_COMPLETE"], [0], ["PRESENT"]),
        "malformed_output": (["malformed_output"], ["TASK_COMPLETE"], [0], ["PRESENT"]),
    }
    if scenario not in expected:
        return
    actual = (
        observation["scenarios"], observation["terminal_statuses"],
        observation["returncodes"], observation["output_statuses"],
    )
    if actual != expected[scenario]:
        raise SimulationError(f"backend observation mismatch for {scenario}: {actual}")
    if scenario == "missing_output" and observation["maximum_stdout_bytes"] != 0:
        raise SimulationError("missing_output retained nonempty stdout")
    if scenario == "lf_only_output" and (
        observation["minimum_stdout_bytes"], observation["maximum_stdout_bytes"]
    ) != (1, 1):
        raise SimulationError("lf_only_output did not retain exactly one LF byte")


def _row_dirs(run_root: Path) -> list[Path]:
    return sorted(run_root.glob("cells/*/*"), key=lambda path: path.as_posix())


def _artifact_files(run_root: Path) -> list[Path]:
    candidates = list(run_root.glob("artifacts/**/*.json"))
    candidates.extend(run_root.glob("stage_artifacts/**/*.json"))
    return sorted(set(candidates), key=lambda path: path.as_posix())


def _evidence_summary(run_root: Path, complete: bool) -> dict[str, Any]:
    _directory(run_root, "controller run root")
    run_storage, run = _json(run_root / "run.json", "run manifest", True)
    rows = _row_dirs(run_root)
    identities = {key: [] for key in ("nonce", "task_id", "thread_id", "turn_id")}
    pass_count = fail_count = invalid_count = 0
    poll_counts: list[int] = []
    stdout_sizes: list[int] = []
    scenarios: set[str] = set()
    terminal_statuses: set[str] = set()
    returncodes: set[int] = set()
    output_statuses: set[str] = set()
    anomalies: list[dict[str, Any]] = []
    run_rows = run.get("schedule", run.get("rows"))
    if not isinstance(run_rows, list):
        raise SimulationError("run rows absent")
    for row in run_rows:
        if isinstance(row, dict) and isinstance(row.get("nonce"), str):
            identities["nonce"].append(row["nonce"])
    for row_path in rows:
        names = sorted(item.name for item in row_path.iterdir())
        if names != ROW_FILES:
            invalid_count += 1
            anomalies.append({"path": row_path.relative_to(run_root).as_posix(), "files": names})
            continue
        render = _regular(row_path / "provider_input.txt", "provider input")
        if not render.endswith(b"\n") or render.endswith(b"\n\n") or b"\r" in render:
            invalid_count += 1
        _, raw = _json(row_path / "raw_result.json", "raw result", True)
        _, completion = _json(row_path / "completion.json", "completion", True)
        backend = raw.get("backend_result")
        if not isinstance(backend, dict):
            invalid_count += 1
            continue
        for key in ("task_id", "thread_id", "turn_id"):
            if isinstance(backend.get(key), str):
                identities[key].append(backend[key])
        process = backend.get("process")
        if isinstance(process, dict):
            if isinstance(process.get("poll_count"), int):
                poll_counts.append(process["poll_count"])
            if isinstance(process.get("scenario"), str):
                scenarios.add(process["scenario"])
        if isinstance(backend.get("terminal_status"), str):
            terminal_statuses.add(backend["terminal_status"])
        if isinstance(backend.get("returncode"), int) and not isinstance(backend.get("returncode"), bool):
            returncodes.add(backend["returncode"])
        capture = backend.get("output_capture")
        if isinstance(capture, dict) and isinstance(capture.get("status"), str):
            output_statuses.add(capture["status"])
        stdout = backend.get("stdout_utf8")
        if isinstance(stdout, str):
            stdout_sizes.append(len(stdout.encode("utf-8")))
        status = completion.get("status")
        pass_count += status == "PASS"
        fail_count += status == "FAIL"
    artifacts = _artifact_files(run_root)
    artifact_stages: list[str] = []
    artifact_slots: list[str] = []
    _, semantic = _json(SEMANTIC, "semantic manifest")
    stage_by_id = {
        row["stage"]: row for row in semantic.get("deterministic_stages", [])
        if isinstance(row, dict) and isinstance(row.get("stage"), str)
    }
    for path in artifacts:
        storage, value = _json(path, "stage artifact")
        stage = value.get("stage")
        slot = path.parent.name
        if isinstance(stage, str):
            artifact_stages.append(stage)
            declared = stage_by_id.get(stage)
            if not isinstance(declared, dict):
                raise SimulationError(f"undeclared stage artifact: {stage}")
            expected = _semantic_canon(declared["expected_artifact"]) + b"\n"
            if storage != expected or value != declared["expected_artifact"]:
                raise SimulationError(f"stage artifact exact payload drift: {slot}/{stage}")
        if isinstance(slot, str):
            artifact_slots.append(slot)
    terminal_files: dict[str, dict[str, Any]] = {}
    for name in ("matrix_terminal.json", "accounting.json"):
        path = run_root / name
        if path.is_file():
            terminal_files[name] = _identity(_regular(path, name))
    path_terminals = sorted(run_root.glob("terminals/*.json"), key=lambda path: path.name)
    artifact_pairs = list(zip(artifact_slots, artifact_stages))
    expected_pairs = {
        (slot, stage) for slot in ("slot-alpha", "slot-bravo", "slot-charlie")
        for stage in stage_by_id
    }
    terminal_names = {path.stem for path in path_terminals}
    if complete and (
        len(rows), pass_count, fail_count, invalid_count, len(artifacts), len(path_terminals)
    ) != (291, 291, 0, 0, 54, 3):
        raise SimulationError(
            "clean evidence mismatch: "
            f"rows/pass/fail/invalid/artifacts/terminals="
            f"{len(rows)}/{pass_count}/{fail_count}/{invalid_count}/{len(artifacts)}/{len(path_terminals)}"
        )
    if complete and (
        set(artifact_pairs) != expected_pairs or len(artifact_pairs) != len(set(artifact_pairs))
        or terminal_names != {"slot-alpha", "slot-bravo", "slot-charlie"}
    ):
        raise SimulationError("clean route-local artifact or path-terminal inventory mismatch")
    return {
        "run_id": run_root.name, "run": _identity(run_storage),
        "scheduled_rows": len(run_rows), "row_directories": len(rows),
        "pass_rows": pass_count, "subject_fail_rows": fail_count,
        "invalid_row_chains": invalid_count, "row_anomalies": anomalies,
        "stage_artifacts": len(artifacts), "artifact_stage_count": len(set(artifact_stages)),
        "artifact_slot_count": len(set(artifact_slots)),
        "s90_artifacts": sum(stage == "S90" for stage in artifact_stages),
        "path_terminals": len(path_terminals), "terminal_files": terminal_files,
        "identities": identities,
        "backend_observation": {
            "scenarios": sorted(scenarios), "terminal_statuses": sorted(terminal_statuses),
            "returncodes": sorted(returncodes), "output_statuses": sorted(output_statuses),
            "minimum_poll_count": min(poll_counts) if poll_counts else None,
            "maximum_poll_count": max(poll_counts) if poll_counts else None,
            "minimum_stdout_bytes": min(stdout_sizes) if stdout_sizes else None,
            "maximum_stdout_bytes": max(stdout_sizes) if stdout_sizes else None,
        },
    }


def _run_clean(evidence_parent: Path, run_id: str) -> dict[str, Any]:
    invocation = _invoke(evidence_parent, [
        "simulate", "--run-root", run_id, "--scenario", "immediate",
    ])
    _assert_invocation(invocation, 0, "PASS")
    summary = _evidence_summary(evidence_parent / run_id, True)
    _assert_backend_observation(summary, "immediate")
    reopen_a = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
    reopen_b = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
    _assert_invocation(reopen_a, 0, "PASS")
    _assert_invocation(reopen_b, 0, "PASS")
    if reopen_a.get("result") != reopen_b.get("result"):
        raise SimulationError("repeated public reopen reports differ")
    return {
        "status": "PASS", "run_id": run_id, "qualification_credit": 0,
        "controller": invocation, "summary": summary,
        "reopen_a": reopen_a, "reopen_b": reopen_b,
    }


def _run_clean_pair(suite: Path, before: dict[str, Any]) -> dict[str, Any]:
    evidence = suite / "evidence"
    first = _run_clean(evidence, "synthetic-clean-001")
    middle = _source_snapshot()
    if middle != before:
        raise SimulationError("bound source bytes changed after first clean run")
    second = _run_clean(evidence, "synthetic-clean-002")
    after = _source_snapshot()
    if after != before:
        raise SimulationError("bound source bytes changed during clean pair")
    combined = {key: [] for key in ("nonce", "task_id", "thread_id", "turn_id")}
    for run in (first, second):
        for key in combined:
            combined[key].extend(run["summary"]["identities"][key])
    uniqueness: dict[str, dict[str, int]] = {}
    for key, values in combined.items():
        uniqueness[key] = {"count": len(values), "unique": len(set(values))}
        if len(values) != 582 or len(set(values)) != 582:
            raise SimulationError(f"clean-pair {key} uniqueness mismatch")
    return {
        "status": "PASS", "qualification_credit": 0,
        "unchanged_source_bundle": True, "runs": [first, second],
        "identity_uniqueness": uniqueness,
    }


def _clone_tree(source: Path, target: Path, boundary: Path) -> None:
    _directory(source, "clone source")
    _mkdir(target)
    for current, directories, files in os.walk(source):
        directories.sort()
        files.sort()
        current_path = Path(current)
        for name in directories:
            source_dir = current_path / name
            _directory(source_dir, "clone source directory")
            target_dir = target / source_dir.relative_to(source)
            _ensure_dir(target_dir.parent, boundary)
            _mkdir(target_dir)
        for name in files:
            source_file = current_path / name
            target_file = target / source_file.relative_to(source)
            _ensure_dir(target_file.parent, boundary)
            _write(target_file, _regular(source_file, "clone source file"))


def _exact_unlink_tree(path: Path, boundary: Path) -> dict[str, int]:
    resolved = path.resolve(strict=False)
    if resolved.parent != boundary.resolve() or not path.name.startswith("tmp-"):
        raise SimulationError(f"temporary cleanup boundary mismatch: {path}")
    _directory(path, "temporary cleanup root")
    files = directories = 0
    for current, dirnames, filenames in os.walk(path, topdown=False, followlinks=False):
        current_path = Path(current)
        for name in filenames:
            target = current_path / name
            info = os.lstat(target)
            if not stat.S_ISREG(info.st_mode):
                raise SimulationError(f"temporary cleanup refuses nonregular: {target}")
            os.unlink(target)
            files += 1
        for name in dirnames:
            target = current_path / name
            _directory(target, "temporary cleanup directory")
            os.rmdir(target)
            directories += 1
    os.rmdir(path)
    directories += 1
    _sync_dir(boundary)
    return {"exact_unlinked_files": files, "rmdir_directories": directories}


def _mutate_storage(path: Path, storage: bytes) -> tuple[bytes, bytes]:
    before = _regular(path, "mutation before")
    if storage == before:
        raise SimulationError("mutation made no byte change")
    os.chmod(path, 0o600)
    fd = os.open(path, os.O_WRONLY | os.O_TRUNC)
    try:
        view = memoryview(storage)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise SimulationError("short mutation write")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, 0o400)
    _sync_dir(path.parent)
    return before, _regular(path, "mutation after")


def _mutate_json(path: Path, change: Callable[[dict[str, Any]], None]) -> tuple[bytes, bytes]:
    _, value = _json(path, "mutation JSON", True)
    change(value)
    return _mutate_storage(path, _canon(value) + b"\n")


def _mutate_semantic_json(path: Path, change: Callable[[dict[str, Any]], None]) -> tuple[bytes, bytes]:
    _, value = _json(path, "semantic mutation JSON")
    change(value)
    return _mutate_storage(path, _semantic_canon(value) + b"\n")


def _capture_change(fault_root: Path, sequence: int, path: Path,
                    before: bytes, after: bytes, work_root: Path) -> dict[str, Any]:
    captures = fault_root / "captures"
    if not captures.exists():
        _mkdir(captures)
    before_path = captures / f"{sequence:02d}-before.bin"
    after_path = captures / f"{sequence:02d}-after.bin"
    _write(before_path, before)
    _write(after_path, after)
    return {
        "mutated_path": path.relative_to(work_root).as_posix(),
        "before": {"path": before_path.relative_to(fault_root).as_posix(), **_identity(before)},
        "after": {"path": after_path.relative_to(fault_root).as_posix(), **_identity(after)},
    }


def _first_rows(run_root: Path, count: int = 2) -> list[Path]:
    rows = _row_dirs(run_root)
    if len(rows) < count:
        raise SimulationError(f"need {count} completed rows, found {len(rows)}")
    return rows[:count]


def _rebind_identity_collision(run_root: Path) -> list[tuple[Path, bytes, bytes]]:
    rows = _first_rows(run_root)
    _, first_raw = _json(rows[0] / "raw_result.json", "first raw", True)
    first_backend = first_raw.get("backend_result")
    if not isinstance(first_backend, dict):
        raise SimulationError("first backend result absent")
    changes: list[tuple[Path, bytes, bytes]] = []
    second_raw_path = rows[1] / "raw_result.json"

    def collide(value: dict[str, Any]) -> None:
        backend = value.get("backend_result")
        if not isinstance(backend, dict):
            raise SimulationError("second backend result absent")
        for key in ("task_id", "thread_id", "turn_id"):
            backend[key] = first_backend[key]
        process = backend.get("process")
        rollout = backend.get("rollout")
        if isinstance(process, dict) and isinstance(process.get("task_terminal"), dict):
            process["task_terminal"]["turn_id"] = first_backend["turn_id"]
        if isinstance(rollout, dict):
            for name in ("task_started", "task_complete"):
                event = rollout.get(name)
                if isinstance(event, dict):
                    event["turn_id"] = first_backend["turn_id"]

    changes.append((second_raw_path, *_mutate_json(second_raw_path, collide)))
    raw_storage = _regular(second_raw_path, "collided raw")
    second_completion_path = rows[1] / "completion.json"

    def completion_change(value: dict[str, Any]) -> None:
        for key in ("task_id", "thread_id", "turn_id"):
            value[key] = first_backend[key]
        value["raw_result_sha256"] = _sha(raw_storage)
        value["raw_result_bytes"] = len(raw_storage)

    changes.append((second_completion_path, *_mutate_json(second_completion_path, completion_change)))
    _, run = _json(run_root / "run.json", "collision run", True)
    run_rows = run.get("schedule", run.get("rows"))
    if not isinstance(run_rows, list):
        raise SimulationError("collision run rows absent")
    row_map = {
        (row["slot"], f"{row['index']:03d}_{row['cell']}"): row
        for row in run_rows if isinstance(row, dict)
    }
    affected_slot = rows[1].parent.name
    completed: list[dict[str, Any]] = []
    for row_path in _row_dirs(run_root):
        row = row_map[(row_path.parent.name, row_path.name)]
        completion_storage, completion = _json(row_path / "completion.json", "completion", True)
        completed.append({
            "ordinal": row["ordinal"], "slot": row["slot"], "cell": row["cell"],
            "index": row["index"], "status": completion["status"], "nonce": row["nonce"],
            "task_id": completion["task_id"], "thread_id": completion["thread_id"],
            "turn_id": completion["turn_id"], "completion_sha256": _sha(completion_storage),
            "completion_bytes": len(completion_storage),
        })
    slot_complete = sorted(
        [row for row in completed if row["slot"] == affected_slot],
        key=lambda row: row["ordinal"],
    )
    path_terminal = run_root / "terminals" / f"{affected_slot}.json"

    def terminal_change(value: dict[str, Any]) -> None:
        inventory = _canon(slot_complete)
        value["completion_inventory_sha256"] = _sha(inventory)
        value["completion_inventory_bytes"] = len(inventory)

    changes.append((path_terminal, *_mutate_json(path_terminal, terminal_change)))
    terminal_storage = _regular(path_terminal, "collided path terminal")
    matrix_path = run_root / "matrix_terminal.json"

    def matrix_change(value: dict[str, Any]) -> None:
        refs = value.get("path_terminals")
        if not isinstance(refs, list):
            raise SimulationError("matrix path-terminal refs absent")
        for ref in refs:
            if isinstance(ref, dict) and ref.get("slot") == affected_slot:
                ref["sha256"], ref["bytes"] = _sha(terminal_storage), len(terminal_storage)

    changes.append((matrix_path, *_mutate_json(matrix_path, matrix_change)))
    matrix_storage = _regular(matrix_path, "collided matrix terminal")
    accounting_path = run_root / "accounting.json"

    def accounting_change(value: dict[str, Any]) -> None:
        value["matrix_terminal_sha256"] = _sha(matrix_storage)
        value["matrix_terminal_bytes"] = len(matrix_storage)

    changes.append((accounting_path, *_mutate_json(accounting_path, accounting_change)))
    return changes


def _tamper(run_root: Path, fault_root: Path, tamper: str) -> list[dict[str, Any]]:
    rows = _first_rows(run_root)
    changes: list[tuple[Path, bytes, bytes]] = []
    created: list[dict[str, Any]] = []
    if tamper == "create_wrong_render_directory_member":
        target = run_root / "renders"
        _mkdir(target)
        created.append({"path": target.relative_to(run_root).as_posix(), "kind": "directory"})
    elif tamper == "append_lf_to_render":
        path = rows[0] / "provider_input.txt"
        changes.append((path, *_mutate_storage(path, _regular(path, "render") + b"\n")))
    elif tamper == "change_render_byte":
        path = rows[0] / "provider_input.txt"
        data = _regular(path, "render")
        changes.append((path, *_mutate_storage(path, bytes([data[0] ^ 1]) + data[1:])))
    elif tamper in {"change_raw_result_byte", "change_raw_result_schema"}:
        path = rows[0] / "raw_result.json"
        changes.append((path, *_mutate_json(
            path, lambda value: value.__setitem__("schema_id", "pw-r9-raw-result-tampered")
        )))
    elif tamper == "change_embedded_score":
        path = rows[0] / "completion.json"
        def score_change(value: dict[str, Any]) -> None:
            score = value.get("score")
            if not isinstance(score, dict):
                raise SimulationError("completion score absent")
            score["actual_bytes"] = int(score.get("actual_bytes", 0)) + 1
        changes.append((path, *_mutate_json(path, score_change)))
    elif tamper in {"plant_future_attempt", "plant_future_completion"}:
        future = run_root / "cells" / "slot-alpha" / "999_future"
        _mkdir(future)
        name = "attempt.json" if tamper.endswith("attempt") else "completion.json"
        identity = _write_json(future / name, {"schema_id": "pw-r9-illegal-future-v1"})
        created.append({"path": (future / name).relative_to(run_root).as_posix(),
                        "kind": "file", **identity})
    elif tamper in {"change_run_semantic_binding", "change_run_operating_binding"}:
        path = run_root / "run.json"
        key = "semantic_manifest" if "semantic" in tamper else "operating_contract"
        def binding_change(value: dict[str, Any]) -> None:
            binding = value.get(key)
            if not isinstance(binding, dict):
                raise SimulationError(f"run {key} binding absent")
            binding["sha256"] = "0" * 64
        changes.append((path, *_mutate_json(path, binding_change)))
    elif tamper == "change_matrix_terminal_byte":
        path = run_root / "matrix_terminal.json"
        changes.append((path, *_mutate_json(
            path, lambda value: value.__setitem__("pass_rows", int(value.get("pass_rows", 0)) - 1)
        )))
    elif tamper == "change_accounting_count":
        path = run_root / "accounting.json"
        changes.append((path, *_mutate_json(
            path, lambda value: value.__setitem__(
                "valid_completions", int(value.get("valid_completions", 0)) - 1
            )
        )))
    elif tamper == "duplicate_run_nonce":
        path = run_root / "run.json"
        def nonce_change(value: dict[str, Any]) -> None:
            run_rows = value.get("schedule", value.get("rows"))
            if not isinstance(run_rows, list) or len(run_rows) < 2:
                raise SimulationError("run rows absent")
            run_rows[1]["nonce"] = run_rows[0]["nonce"]
        changes.append((path, *_mutate_json(path, nonce_change)))
    elif tamper == "reuse_prior_backend_identities":
        changes.extend(_rebind_identity_collision(run_root))
    elif tamper in {"change_stage_artifact_byte", "change_s90_artifact_byte"}:
        artifacts = _artifact_files(run_root)
        if tamper == "change_s90_artifact_byte":
            artifacts = [path for path in artifacts if "S90" in path.name]
        if not artifacts:
            raise SimulationError(f"no artifact found for {tamper}")
        path = artifacts[0]
        changes.append((path, *_mutate_semantic_json(
            path, lambda value: value.__setitem__("schema_id", "pw-r9-artifact-tampered")
        )))
    else:
        raise SimulationError(f"unsupported evidence tamper: {tamper}")
    captures = [
        _capture_change(fault_root, index, path, before, after, run_root)
        for index, (path, before, after) in enumerate(changes, 1)
    ]
    return captures + created


def _canonical_evidence_observation(
    path: Path, expected_schema: str, observed_path: str,
) -> tuple[dict[str, Any], bytes | None]:
    """Observe a durable JSON candidate without treating mere existence as persistence."""
    try:
        storage = _regular(path, "supervised evidence candidate")
    except SimulationError as exc:
        return {"status": "NOT_READY", "reason": str(exc)}, None
    identity = _identity(storage)
    base = {"path": observed_path, **identity, "expected_schema_id": expected_schema}
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        return {**base, "status": "NOT_READY", "reason": "EXACT_ONE_TERMINAL_LF_REQUIRED"}, None
    try:
        value = json.loads(
            storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
            parse_constant=lambda token: (_ for _ in ()).throw(
                SimulationError(f"nonfinite JSON value: {token}")
            ),
        )
    except (UnicodeDecodeError, json.JSONDecodeError, SimulationError) as exc:
        return {**base, "status": "NOT_READY", "reason": f"INVALID_JSON:{type(exc).__name__}"}, None
    if not isinstance(value, dict):
        return {**base, "status": "NOT_READY", "reason": "JSON_OBJECT_REQUIRED"}, None
    if storage != _canon(value) + b"\n":
        return {**base, "status": "NOT_READY", "reason": "CANONICAL_STORAGE_REQUIRED"}, None
    if value.get("schema_id") != expected_schema:
        return {
            **base, "status": "NOT_READY", "reason": "EXPECTED_SCHEMA_ID_REQUIRED",
            "observed_schema_id": value.get("schema_id"),
        }, None
    return {**base, "status": "READY", "observed_schema_id": value["schema_id"]}, storage


def _phased_persistence_reproducer(fault_root: Path) -> dict[str, Any]:
    """Deterministically separate path existence from canonical persistence."""
    predecessor = _persistence_predecessor()
    witness_path = fault_root / "phased_completion.json"
    value = {
        "schema_id": "pw-r9-completion-v2",
        "witness": "iteration-005-stable-canonical-persistence",
    }
    canonical = _canon(value) + b"\n"
    fd = os.open(witness_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.fsync(fd)
        _sync_dir(witness_path.parent)
        empty = _regular(witness_path, "phased empty witness")
        empty_exists = witness_path.exists()
        empty_probe, _ = _canonical_evidence_observation(
            witness_path, "pw-r9-completion-v2", witness_path.name,
        )

        partial = canonical[:-1]
        view = memoryview(partial)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise SimulationError("phased partial witness short write")
            view = view[count:]
        os.fsync(fd)
        observed_partial = _regular(witness_path, "phased partial witness")
        partial_exists = witness_path.exists()
        partial_probe, _ = _canonical_evidence_observation(
            witness_path, "pw-r9-completion-v2", witness_path.name,
        )

        count = os.write(fd, b"\n")
        if count != 1:
            raise SimulationError("phased terminal-LF witness short write")
        os.fsync(fd)
        ready_a, ready_a_storage = _canonical_evidence_observation(
            witness_path, "pw-r9-completion-v2", witness_path.name,
        )
        ready_b, ready_b_storage = _canonical_evidence_observation(
            witness_path, "pw-r9-completion-v2", witness_path.name,
        )
    finally:
        os.close(fd)
    _sync_dir(witness_path.parent)
    retained = _regular(witness_path, "retained phased witness")
    predecessor_accepts = {
        "empty_path_exists": empty_exists,
        "partial_path_exists": partial_exists,
    }
    successor_pass = (
        _identity(empty) == PERSISTENCE_PREDECESSOR_IDENTITIES[PERSISTENCE_PREDECESSOR_COMPLETION]
        and observed_partial == partial
        and empty_probe.get("status") == "NOT_READY"
        and partial_probe.get("status") == "NOT_READY"
        and ready_a.get("status") == ready_b.get("status") == "READY"
        and ready_a_storage == ready_b_storage == retained == canonical
        and _identity(ready_a_storage or b"") == _identity(ready_b_storage or b"")
        and all(predecessor_accepts.values())
    )
    if not successor_pass:
        raise SimulationError("phased persistence reproducer did not close existence-observer defect")
    stable_identity = _identity(retained)
    return {
        "schema_id": "pw-r9-persistence-observer-causal-proof-v1",
        "status": "PASS",
        "normalized_signature": "R9_REG_007_EXISTENCE_BEFORE_PERSISTENCE",
        "predecessor": predecessor,
        "phases": {
            "empty": {
                **_identity(empty), "iteration_004_existence_observer": "ACCEPTS",
                "iteration_005_persistence_observer": empty_probe,
            },
            "partial": {
                **_identity(observed_partial), "iteration_004_existence_observer": "ACCEPTS",
                "iteration_005_persistence_observer": partial_probe,
            },
            "stable_canonical_a": ready_a,
            "stable_canonical_b": ready_b,
            "retained": {"path": witness_path.name, **stable_identity},
        },
        "successor": {
            "result": "PASS", "required_consecutive_identical_observations": 2,
            "path_sha256_bytes_identical": True, "retained_bytes_identical": True,
            "signal_before_stable_persistence": False,
        },
        "calls": {"subject": 0, "provider": 0, "network": 0},
        "qualification_credit": 0,
    }


def _supervised(evidence_parent: Path, run_id: str, scenario: str,
                observe: str, signal_name: str, timeout: float = 30.0) -> dict[str, Any]:
    patterns = {
        "attempt": "cells/*/*/attempt.json",
        "raw_result": "cells/*/*/raw_result.json",
        "completion": "cells/*/*/completion.json",
    }
    if observe not in patterns or signal_name not in {"SIGTERM", "SIGKILL"}:
        raise SimulationError("unsupported supervisor configuration")
    expected_schema = OBSERVED_EVIDENCE_SCHEMAS[observe]
    command = [sys.executable, "controller.py", "simulate", "--run-root", run_id,
               "--scenario", scenario]
    started = time.monotonic_ns()
    process = subprocess.Popen(
        command, cwd=ROOT, env=_controller_env(evidence_parent),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True,
    )
    run_root = evidence_parent / run_id
    deadline = time.monotonic() + timeout
    observed: Path | None = None
    observed_storage: bytes | None = None
    consecutive: list[dict[str, Any]] = []
    last_key: tuple[str, str, int] | None = None
    not_ready_observations = 0
    while time.monotonic() < deadline:
        matches = sorted(run_root.glob(patterns[observe])) if run_root.exists() else []
        if matches:
            candidate = matches[0]
            observed_rel = candidate.relative_to(run_root).as_posix()
            probe, storage = _canonical_evidence_observation(
                candidate, expected_schema, observed_rel,
            )
            if probe.get("status") == "READY" and storage is not None:
                key = (observed_rel, probe["sha256"], probe["bytes"])
                if key == last_key:
                    consecutive.append(probe)
                else:
                    consecutive = [probe]
                    last_key = key
                if len(consecutive) >= 2:
                    if process.poll() is not None:
                        raise SimulationError(
                            f"supervisor observed stable {observe} only after controller exit"
                        )
                    observed = candidate
                    observed_storage = storage
                    break
            else:
                not_ready_observations += 1
                consecutive = []
                last_key = None
        if process.poll() is not None:
            break
        time.sleep(0.0005)
    if observed is None or observed_storage is None:
        if process.poll() is None:
            os.killpg(process.pid, signal.SIGKILL)
        stdout, stderr = process.communicate()
        raise SimulationError(
            f"supervisor did not observe stable canonical {observe}; rc={process.returncode}; "
            f"stdout={stdout.decode('utf-8', 'replace')}; stderr={stderr.decode('utf-8', 'replace')}"
        )
    sent = getattr(signal, signal_name)
    os.kill(process.pid, sent)
    try:
        stdout, stderr = process.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGKILL)
        stdout, stderr = process.communicate()
    retained = _regular(observed, f"retained supervised {observe}")
    if retained != observed_storage:
        raise SimulationError(f"supervised {observe} bytes changed after persistence witness")
    record = _invocation_record(
        command[2:], process.returncode, stdout, stderr, time.monotonic_ns() - started,
    )
    record.update({
        "observed": observe, "observed_path": observed.relative_to(run_root).as_posix(),
        "signal": signal_name,
        "persistence_witness": {
            "schema_id": "pw-r9-supervised-persistence-witness-v1",
            "expected_schema_id": expected_schema,
            "required_consecutive_identical_observations": 2,
            "observations": consecutive[-2:],
            "path_sha256_bytes_identical": True,
            "not_ready_observations_before_witness": not_ready_observations,
            "signal_sent_only_after_witness": True,
            "retained": {**_identity(retained), "identical_to_observed": True},
        },
    })
    return record


def _fault_root(suite: Path, sequence: int, label: str) -> Path:
    safe_label = re.sub(r"[^A-Za-z0-9_.-]+", "-", label.lower()).strip("-")
    name = f"{sequence:03d}-{safe_label}"[:127]
    path = suite / "faults" / name
    _mkdir(path)
    return path


def _fault_evidence_parent(suite: Path, sequence: int, label: str) -> Path:
    safe_label = re.sub(r"[^A-Za-z0-9_.-]+", "-", label.lower()).strip("-")
    parent = suite / "fault_evidence" / f"{sequence:03d}-{safe_label}"[:127]
    _mkdir(parent)
    return parent


def _source_projection(tamper: str, snapshot: dict[str, Any]) -> dict[str, Any]:
    files = snapshot.get("files")
    if not isinstance(files, list) or not files:
        raise SimulationError("source bundle empty")
    first = files[0]
    if tamper == "omit_declared_semantic_source":
        return {"tamper": tamper, "before_count": len(files), "after_count": len(files) - 1,
                "mismatch": "MISSING_DECLARED_MEMBER", "admitted": False}
    if tamper == "add_undeclared_control_member":
        return {"tamper": tamper, "before_count": len(files), "after_count": len(files) + 1,
                "mismatch": "EXTRA_UNDECLARED_MEMBER", "admitted": False}
    if tamper == "declared_source_as_directory":
        return {"tamper": tamper, "path": first["path"], "before_kind": "regular_nonlink",
                "after_kind": "directory", "mismatch": "NONREGULAR_MEMBER", "admitted": False}
    if tamper in {"change_declared_source_byte", "change_required_checkpoint", "change_architecture_schema"}:
        after_sha = "0" * 64 if first["sha256"] != "0" * 64 else "1" * 64
        return {"tamper": tamper, "path": first["path"],
                "before": {"sha256": first["sha256"], "bytes": first["bytes"]},
                "after": {"sha256": after_sha, "bytes": first["bytes"]},
                "mismatch": "IDENTITY_DRIFT", "admitted": False}
    raise SimulationError(f"unsupported source projection: {tamper}")


def _historical_head_sandbox(suite: Path, sequence: int, label: str,
                             component_source: Path, expect_success: bool) -> dict[str, Any]:
    """Advance HEAD around one exact synthetic run without changing its bundle."""
    work = suite / "work"
    repository = work / f"tmp-{sequence:03d}-{label}"
    cleanup: dict[str, int] | None = None
    observation: dict[str, Any] | None = None
    try:
        component_root, source = _materialize_sandbox_repository(repository, component_source, work)
        evidence_parent = repository / "sandbox_evidence"
        _mkdir(evidence_parent)
        run_id = "historical-head-run"
        launch = _invoke_from(component_root, evidence_parent, [
            "simulate", "--run-root", run_id, "--scenario", "malformed_output",
        ])
        _assert_invocation(launch, 1, "VALID_SUBJECT_FAIL")
        run_root = evidence_parent / run_id
        _, run = _json(run_root / "run.json", "historical run", True)
        recorded = source["recorded_git_head"]
        if run.get("git_head") != recorded or run.get("custody_mode") != "WORKTREE_EXACT_BUNDLE":
            raise SimulationError(f"{label}: recorded run custody mismatch")
        summary = _evidence_summary(run_root, False)
        if summary["row_directories"] != 3 or summary["subject_fail_rows"] != 3:
            raise SimulationError(f"{label}: bounded valid-FAIL run did not stop each route at row one")
        before = _tree_inventory(run_root)
        advanced = _advance_sandbox_head(repository, label)
        if advanced == recorded:
            raise SimulationError(f"{label}: HEAD did not advance")
        changed_raw = _git_at(repository, [
            "diff-tree", "--no-commit-id", "--name-only", "-r", recorded, advanced,
        ])
        changed = changed_raw.decode("utf-8").splitlines() if changed_raw else []
        if changed != ["historical_head_marker.json"]:
            raise SimulationError(f"{label}: experiment bytes changed across HEAD advance: {changed}")
        recorded_blobs = _reopen_recorded_sources(repository, recorded, source["source_rows"])
        reopen = _invoke_from(component_root, evidence_parent, ["reopen", "--run-root", run_id])
        after = _tree_inventory(run_root)
        if before != after:
            raise SimulationError(f"{label}: public reopen mutated retained run evidence")
        result = reopen.get("result")
        if not isinstance(result, dict):
            raise SimulationError(f"{label}: public reopen result absent")
        offline = result.get("offline_verifier")
        if expect_success:
            _assert_invocation(reopen, 1, "VALID_SUBJECT_FAIL")
            if not isinstance(offline, dict) or offline.get("valid") is not True:
                raise SimulationError(f"{label}: successor offline verifier did not pass")
            custody = offline.get("custody")
            expected_custody = {
                "mode": "WORKTREE_EXACT_BUNDLE",
                "recorded_git_head": recorded,
                "current_head_equality_required": False,
                "exact_live_bundle_reopened": True,
                "recorded_commit_blobs_reopened": False,
                "historical_head_reopen": "PASS",
            }
            if custody != expected_custody:
                raise SimulationError(f"{label}: typed successor custody mismatch: {custody}")
            disposition = "SUCCESSOR_VALID_REOPEN_HISTORICAL_HEAD"
            error_code = None
        else:
            _assert_invocation(reopen, 2, "CONTROLLER_INVALID")
            if not isinstance(offline, dict) or offline.get("valid") is not False:
                raise SimulationError(f"{label}: predecessor verifier failure absent")
            error = offline.get("error")
            error_code = error.get("code") if isinstance(error, dict) else None
            if error_code != "RUN_GIT_HEAD_DRIFT" or offline.get("custody") is not None:
                raise SimulationError(f"{label}: predecessor failure was not RUN_GIT_HEAD_DRIFT")
            disposition = "PREDECESSOR_FAIL_PRESERVED"
        observation = {
            "label": label, "disposition": disposition,
            "recorded_git_head": recorded, "advanced_git_head": advanced,
            "head_equal": recorded == advanced, "changed_paths": changed,
            "recorded_commit_source_reopen": recorded_blobs,
            "component_source": _relative(component_source),
            "component_source_identity": {
                "source_file_count": source["source_file_count"],
                "source_rows_sha256": source["source_rows_sha256"],
                "source_rows_bytes": source["source_rows_bytes"],
            },
            "launch": launch, "reopen": reopen, "reopen_error_code": error_code,
            "run_summary": summary, "evidence_unchanged_by_reopen": True,
        }
    finally:
        if repository.exists():
            cleanup = _exact_unlink_tree(repository, work)
        if cleanup is not None and cleanup["exact_unlinked_files"] < 1:
            raise SimulationError(f"{label}: sandbox cleanup retained no file accounting")
    if observation is None or cleanup is None:
        raise SimulationError(f"{label}: sandbox observation or cleanup accounting absent")
    observation["sandbox_cleanup"] = cleanup
    return observation


def _historical_head_pair(suite: Path, sequence: int) -> dict[str, Any]:
    predecessor = _historical_head_sandbox(
        suite, sequence, "predecessor-head-drift", PREDECESSOR_ROOT, False,
    )
    successor = _historical_head_sandbox(
        suite, sequence, "successor-head-reopen", ROOT, True,
    )
    return {
        "normalized_signature": "R9_REG_20_HISTORICAL_RUN_GIT_HEAD_DRIFT",
        "predecessor": predecessor, "successor": successor,
        "causal_delta": {
            "same_reproducer": "advance HEAD only; recorded run, exact source closure, and evidence unchanged",
            "predecessor": "FAIL/RUN_GIT_HEAD_DRIFT",
            "successor": "VALID_REOPEN/HISTORICAL_HEAD_REOPEN",
            "recorded_commit_sources_reopened": True,
        },
        "calls": {"subject": 0, "provider": 0, "network": 0},
        "qualification_credit": 0,
    }


def _fault_record(suite: Path, clean: dict[str, Any], check: dict[str, Any],
                  row: dict[str, Any], sequence: int, kind: str) -> dict[str, Any]:
    identifier = row.get("variant_id") or row.get("case_id")
    if not isinstance(identifier, str):
        raise SimulationError("fault row identifier absent")
    fault_root = _fault_root(suite, sequence, identifier)
    strategy = row.get("strategy")
    record: dict[str, Any] = {
        "schema_id": "pw-r9-compact-fault-receipt-v2",
        "kind": kind, "sequence": sequence, "identifier": identifier,
        "strategy": strategy, "expected": row.get("expect"),
        "fault_labels": row.get("fault_labels", []),
        "qualification_credit": 0,
        "calls": {"subject": 0, "provider": 0, "network": 0},
        "current_result": "FAIL",
    }
    if kind == "normalized_variant":
        record["regression_id"] = row.get("regression_id")
        record["scenario_id"] = row.get("scenario_id")
        record["predecessor_result"] = "FAIL"
        record["predecessor_disposition"] = "PRESERVED_FAIL_NEVER_RECLASSIFIED"
    if strategy == "clean_reference":
        first = clean["runs"][0]
        record["observation"] = {
            "clean_run": first["run_id"], "summary": first["summary"],
            "reopen_a": first["reopen_a"]["result"], "reopen_b": first["reopen_b"]["result"],
        }
        record["current_result"] = "PASS"
    elif strategy == "subject_fail_path_stop":
        run_id = "run"
        evidence_parent = _fault_evidence_parent(suite, sequence, identifier)
        invocation = _invoke(evidence_parent, [
            "simulate", "--run-root", run_id, "--scenario", row["backend_scenario"],
        ])
        expected = row.get("expect", {})
        _assert_invocation(invocation, int(expected.get("rc", 1)), str(expected.get("status")))
        summary = _evidence_summary(evidence_parent / run_id, False)
        _assert_backend_observation(summary, row["backend_scenario"])
        if summary["row_directories"] != int(expected.get("rows", 3)):
            raise SimulationError(f"{identifier}: post-FAIL row count mismatch")
        slots = []
        for path in _row_dirs(evidence_parent / run_id):
            slots.append(path.parent.name)
        if len(slots) != len(set(slots)):
            raise SimulationError(f"{identifier}: later same-slot row exists after FAIL")
        if summary["subject_fail_rows"] != int(expected.get("fail_rows", len(slots))):
            raise SimulationError(f"{identifier}: subject FAIL count mismatch")
        record["observation"] = {"controller": invocation, "summary": summary,
                                 "evidence_parent": evidence_parent.relative_to(suite).as_posix(),
                                 "slots_started": slots, "no_later_same_slot_start": True}
        record["current_result"] = "PASS"
    elif strategy == "controller_invalid_backend":
        run_id = "run"
        evidence_parent = _fault_evidence_parent(suite, sequence, identifier)
        invocation = _invoke(evidence_parent, [
            "simulate", "--run-root", run_id, "--scenario", row["backend_scenario"],
        ])
        expected = row.get("expect", {})
        _assert_invocation(invocation, int(expected.get("rc", 2)), str(expected.get("status")))
        run_root = evidence_parent / run_id
        summary = _evidence_summary(run_root, False)
        counts = {
            "rows": len(_row_dirs(run_root)),
            "attempts": len(list(run_root.glob("cells/*/*/attempt.json"))),
            "raw_results": len(list(run_root.glob("cells/*/*/raw_result.json"))),
            "completions": len(list(run_root.glob("cells/*/*/completion.json"))),
        }
        for key in ("rows", "attempts", "raw_results", "completions"):
            if counts[key] != int(expected.get(key, counts[key])):
                raise SimulationError(f"{identifier}: {key} {counts[key]} != {expected.get(key)}")
        raw_paths = sorted(run_root.glob("cells/*/*/raw_result.json"))
        if len(raw_paths) != 1:
            raise SimulationError(f"{identifier}: one raw result required")
        _, raw = _json(raw_paths[0], "controller-invalid backend raw", True)
        backend = raw.get("backend_result")
        if not isinstance(backend, dict) or (
            backend.get("terminal_status"), backend.get("returncode")
        ) != ("PROCESS_EXIT_NONZERO", 17):
            raise SimulationError(f"{identifier}: nonzero terminal evidence mismatch")
        record["observation"] = {"controller": invocation, "summary": summary,
                                 "evidence_parent": evidence_parent.relative_to(suite).as_posix(),
                                 "counts": counts, "no_later_start": True}
        record["current_result"] = "PASS"
    elif strategy == "supervised_observation":
        run_id = "run"
        evidence_parent = _fault_evidence_parent(suite, sequence, identifier)
        persistence_causal_proof = (
            _phased_persistence_reproducer(fault_root)
            if identifier == "loss-after-completion" else None
        )
        invocation = _supervised(
            evidence_parent, run_id, row["backend_scenario"],
            row["observe"], row["stop_signal"],
        )
        reopen = _invoke(evidence_parent, ["reopen", "--run-root", run_id])
        if reopen["rc"] != 2:
            raise SimulationError(f"{identifier}: interrupted root did not fail closed")
        summary = _evidence_summary(evidence_parent / run_id, False)
        if summary["row_directories"] and not summary["invalid_row_chains"]:
            _assert_backend_observation(summary, row["backend_scenario"])
        expected = row.get("expect", {})
        observation = summary["backend_observation"]
        minimum_poll = expected.get("minimum_poll_count")
        if isinstance(minimum_poll, int) and (observation["minimum_poll_count"] or 0) < minimum_poll:
            raise SimulationError(f"{identifier}: poll count below {minimum_poll}")
        supervised_observation = {
            "controller": invocation, "reopen": reopen, "summary": summary,
            "evidence_parent": evidence_parent.relative_to(suite).as_posix(),
        }
        if persistence_causal_proof is not None:
            supervised_observation["persistence_causal_proof"] = persistence_causal_proof
        record["observation"] = supervised_observation
        record["current_result"] = "PASS"
    elif strategy == "same_root_reinvoke":
        evidence = suite / "evidence"
        before = _tree_inventory(evidence / "synthetic-clean-001")
        second = _invoke(evidence, [
            "simulate", "--run-root", "synthetic-clean-001", "--scenario", "immediate",
        ])
        after = _tree_inventory(evidence / "synthetic-clean-001")
        if second["rc"] != int(row.get("expect", {}).get("second_rc", 2)) or before != after:
            raise SimulationError("same-root reinvocation did not reject without mutation")
        record["observation"] = {"controller": second, "evidence_unchanged": True,
                                 "clean_root_inventory_digest": _sha(_canon(before))}
        record["current_result"] = "PASS"
    elif strategy == "evidence_mutation":
        work = suite / "work"
        run_id = f"tmp-{sequence:03d}-{identifier}"[:127]
        temp = work / run_id
        _clone_tree(suite / "evidence" / "synthetic-clean-001", temp, work)
        try:
            changes = _tamper(temp, fault_root, str(row.get("tamper")))
            invocation = _invoke(work, ["reopen", "--run-root", run_id])
            if invocation["rc"] != int(row.get("expect", {}).get("rc", 2)):
                raise SimulationError(f"{identifier}: tampered reopen did not fail closed")
            result = invocation.get("result")
            status = result.get("status") if isinstance(result, dict) else None
            expected_status = row.get("expect", {}).get("status", "CONTROLLER_INVALID")
            if status != expected_status:
                raise SimulationError(f"{identifier}: tampered status {status!r} != {expected_status!r}")
            record["observation"] = {"tamper": row.get("tamper"), "changes": changes,
                                     "controller": invocation}
        finally:
            if temp.exists():
                record["ephemeral_cleanup"] = _exact_unlink_tree(temp, work)
        record["current_result"] = "PASS"
    elif strategy == "source_binding_projection":
        record["observation"] = _source_projection(str(row.get("tamper")), check["source_bundle"])
        if record["observation"]["admitted"] is not False:
            raise SimulationError(f"{identifier}: source projection admitted")
        record["current_result"] = "PASS"
    elif strategy == "historical_head_reopen_pair":
        record["observation"] = _historical_head_pair(suite, sequence)
        expected = row.get("expect", {})
        if (
            expected.get("predecessor_result") != "FAIL"
            or expected.get("predecessor_error_code") != "RUN_GIT_HEAD_DRIFT"
            or expected.get("successor_result") != "PASS"
            or expected.get("head_equal") is not False
            or record["observation"]["predecessor"]["disposition"]
                != "PREDECESSOR_FAIL_PRESERVED"
            or record["observation"]["successor"]["disposition"]
                != "SUCCESSOR_VALID_REOPEN_HISTORICAL_HEAD"
        ):
            raise SimulationError(f"{identifier}: historical HEAD causal proof mismatch")
        record["current_result"] = "PASS"
    elif strategy == "static_assertion":
        assertion = row.get("assertion")
        if assertion == "public_check_only_pass":
            invocation = _invoke(suite / "fault_evidence", ["simulate", "--check-only"])
            _assert_invocation(invocation, 0, "PASS")
            observation: Any = invocation
        elif assertion == "all_declared_regular_exact":
            observation = {"file_count": check["source_bundle"]["file_count"],
                           "all_declared_present": True, "all_regular_nonlinks": True,
                           "all_hashes_exact": True}
        elif assertion in {"candidate_import_scan", "public_command_set"}:
            observation = {
                "candidate_v12_v21_runtime_imports": check["candidate_v12_v21_runtime_imports"],
                "controller_commands": check["controller_commands"],
            }
        elif assertion == "historical_predecessor_exact":
            observation = {"historical_predecessors": len(check["historical_predecessors"]),
                           "all_results": [item["predecessor_result"]
                                           for item in check["historical_predecessors"]]}
        elif assertion == "git_bundle_binding":
            observation = check["source_bundle"]
        else:
            raise SimulationError(f"unsupported static assertion: {assertion}")
        record["observation"] = observation
        record["current_result"] = "PASS"
    elif strategy == "coverage_meta":
        record["observation"] = {"deferred_until_dependencies_terminal": True}
        record["current_result"] = "DEFERRED_META"
    else:
        raise SimulationError(f"unsupported fault strategy: {strategy}")
    if record["current_result"] == "DEFERRED_META":
        return {
            "identifier": identifier, "kind": kind, "current_result": "DEFERRED_META",
            "pending_receipt": record,
            "pending_root": fault_root.relative_to(suite).as_posix(),
        }
    _write_json(fault_root / "receipt.json", record)
    return {
        "identifier": identifier, "kind": kind, "current_result": record["current_result"],
        "receipt": {"path": (fault_root / "receipt.json").relative_to(suite).as_posix(),
                    **_identity(_regular(fault_root / "receipt.json", "fault receipt"))},
    }


def _run_faults(suite: Path, clean: dict[str, Any], check: dict[str, Any]) -> dict[str, Any]:
    _, faults = _json(FAULTS, "fault scenarios")
    records: list[dict[str, Any]] = []
    sequence = 0
    meta_indexes: list[int] = []
    for scenario in faults.get("scenarios", []):
        for variant in scenario.get("variants", []):
            sequence += 1
            row = {**variant, "regression_id": scenario.get("regression_id"),
                   "scenario_id": scenario.get("scenario_id")}
            try:
                record = _fault_record(suite, clean, check, row, sequence, "normalized_variant")
            except Exception as exc:
                record = {"identifier": variant.get("variant_id"), "kind": "normalized_variant",
                          "current_result": "FAIL", "error_type": type(exc).__name__, "error": str(exc)}
                matches = sorted((suite / "faults").glob(f"{sequence:03d}-*"))
                if len(matches) == 1 and not (matches[0] / "receipt.json").exists():
                    failure = {
                        "schema_id": "pw-r9-compact-fault-receipt-v2",
                        "kind": "normalized_variant", "sequence": sequence,
                        "identifier": variant.get("variant_id"),
                        "regression_id": scenario.get("regression_id"),
                        "scenario_id": scenario.get("scenario_id"),
                        "strategy": variant.get("strategy"), "current_result": "FAIL",
                        "qualification_credit": 0,
                        "calls": {"subject": 0, "provider": 0, "network": 0},
                        "error": {"type": type(exc).__name__, "message": str(exc)},
                    }
                    identity = _write_json(matches[0] / "receipt.json", failure)
                    record["receipt"] = {
                        "path": (matches[0] / "receipt.json").relative_to(suite).as_posix(),
                        **identity,
                    }
            if record.get("current_result") == "DEFERRED_META":
                meta_indexes.append(len(records))
            records.append(record)
    globals_: list[dict[str, Any]] = []
    for case in faults.get("global_fault_cases", []):
        sequence += 1
        try:
            globals_.append(_fault_record(suite, clean, check, case, sequence, "global_case"))
        except Exception as exc:
            record = {"identifier": case.get("case_id"), "kind": "global_case",
                      "current_result": "FAIL", "error_type": type(exc).__name__,
                      "error": str(exc)}
            matches = sorted((suite / "faults").glob(f"{sequence:03d}-*"))
            if len(matches) == 1 and not (matches[0] / "receipt.json").exists():
                failure = {
                    "schema_id": "pw-r9-compact-fault-receipt-v2",
                    "kind": "global_case", "sequence": sequence,
                    "identifier": case.get("case_id"), "strategy": case.get("strategy"),
                    "current_result": "FAIL", "qualification_credit": 0,
                    "calls": {"subject": 0, "provider": 0, "network": 0},
                    "error": {"type": type(exc).__name__, "message": str(exc)},
                }
                identity = _write_json(matches[0] / "receipt.json", failure)
                record["receipt"] = {
                    "path": (matches[0] / "receipt.json").relative_to(suite).as_posix(),
                    **identity,
                }
            globals_.append(record)
    dependency_pass = all(
        row.get("current_result") == "PASS" for index, row in enumerate(records)
        if index not in meta_indexes
    ) and all(row.get("current_result") == "PASS" for row in globals_)
    for index in meta_indexes:
        summary = records[index]
        receipt = summary.pop("pending_receipt")
        pending_root = summary.pop("pending_root")
        receipt["current_result"] = "PASS" if dependency_pass else "FAIL"
        receipt["observation"] = {"all_dependency_variants_pass": dependency_pass}
        receipt_path = suite / pending_root / "receipt.json"
        identity = _write_json(receipt_path, receipt)
        summary["current_result"] = receipt["current_result"]
        summary["receipt"] = {"path": receipt_path.relative_to(suite).as_posix(), **identity}
    passed = sum(row.get("current_result") == "PASS" for row in records)
    global_passed = sum(row.get("current_result") == "PASS" for row in globals_)
    return {
        "status": "PASS" if passed == len(records) and global_passed == len(globals_) else "FAIL",
        "qualification_credit": 0,
        "normalized_variants": records, "global_cases": globals_,
        "normalized_passed": passed, "normalized_total": len(records),
        "global_passed": global_passed, "global_total": len(globals_),
    }


def _tree_inventory(root: Path, exclude: set[str] | None = None) -> list[dict[str, Any]]:
    _directory(root, "inventory root")
    excluded = exclude or set()
    entries: list[dict[str, Any]] = []
    for current, directories, files in os.walk(root):
        directories.sort()
        files.sort()
        current_path = Path(current)
        for directory in directories:
            path = current_path / directory
            _directory(path, "inventory directory")
            if path.name == "__pycache__":
                raise SimulationError(f"pycache forbidden in retained evidence: {path}")
        for name in files:
            path = current_path / name
            rel = path.relative_to(root).as_posix()
            if rel in excluded:
                continue
            data = _regular(path, "inventory file")
            if path.suffix == ".pyc":
                raise SimulationError(f"bytecode forbidden in retained evidence: {path}")
            entries.append({"path": rel, **_identity(data)})
    return entries


def _write_inventory(suite: Path) -> dict[str, Any]:
    work = suite / "work"
    if any(work.iterdir()):
        raise SimulationError("ephemeral work roots remain before inventory")
    os.rmdir(work)
    entries = _tree_inventory(suite, {"inventory.json"})
    manifest = {
        "schema_id": "pw-r9-retained-evidence-inventory-v1",
        "root": suite.name,
        "coverage": "every retained regular file except this self-referential inventory.json",
        "self_exclusion": {"path": "inventory.json", "reason": "cryptographic self-reference"},
        "entry_count": len(entries), "entries": entries,
        "entries_sha256": _sha(_canon(entries)), "entries_bytes": len(_canon(entries)),
    }
    identity = _write_json(suite / "inventory.json", manifest)
    reopened = _verify_inventory(suite)
    return {"path": "inventory.json", **identity, "independent_reopen": reopened}


def _verify_inventory(suite: Path) -> dict[str, Any]:
    storage, manifest = _json(suite / "inventory.json", "retained inventory", True)
    entries = manifest.get("entries")
    if not isinstance(entries, list):
        raise SimulationError("inventory entries absent")
    actual = _tree_inventory(suite, {"inventory.json"})
    if entries != actual:
        raise SimulationError("retained evidence inventory mismatch")
    if manifest.get("entry_count") != len(entries):
        raise SimulationError("inventory entry count mismatch")
    if manifest.get("entries_sha256") != _sha(_canon(entries)):
        raise SimulationError("inventory entry digest mismatch")
    return {"status": "PASS", "inventory": _identity(storage), "entry_count": len(entries)}


def _suite_receipt(command: str, before: dict[str, Any], clean: dict[str, Any] | None,
                   faults: dict[str, Any] | None, error: Exception | None) -> dict[str, Any]:
    after = _source_snapshot()
    status = "PASS"
    if error is not None or before != after:
        status = "FAIL"
    if clean is not None and clean.get("status") != "PASS":
        status = "FAIL"
    if faults is not None and faults.get("status") != "PASS":
        status = "FAIL"
    open_blockers = [
        {"blocker_id": "HOLISTIC_INDEPENDENT_XHIGH_REVIEW_NOT_PART_OF_SIMULATOR",
         "meaning": "A simulator cannot mint or substitute the required independent holistic review."}
    ]
    if not before.get("head_equals_origin_main") or not before.get("all_bound_files_match_head"):
        open_blockers.append({
            "blocker_id": "PUSHED_GIT_BYTE_CUSTODY_NOT_YET_CLOSED",
            "meaning": "Bound current bytes are recorded exactly but do not all match fetched origin/main custody.",
        })
    return {
        "schema_id": "pw-r9-simulator-suite-receipt-v2",
        "status": status, "command": command, "qualification_credit": 0,
        "calls": {"subject": 0, "provider": 0, "network": 0},
        "source_bundle_before": before, "source_bundle_after": after,
        "source_bundle_unchanged": before == after,
        "clean_pair": clean, "faults": faults,
        "historical_predecessors": _history(),
        "stabilization_exit": {"status": "FAIL", "open_blockers": open_blockers,
                               "simulator_may_authorize_exit": False},
        "error": None if error is None else {"type": type(error).__name__, "message": str(error)},
        "residual_risks": [
            "malicious trusted-controller fabrication", "host or OS compromise",
            "arbitrary in-process private callers", "capability tokens",
            "recursive or self-hosting verifier authority", "callback confinement",
            "reflection resistance", "production FileSafe or read-isolation proof",
        ],
        "nonclaims": [
            "Synthetic evidence has zero empirical and qualification credit.",
            "Suite PASS is not stabilization exit, candidate, audit, freeze, canary, qualification, readiness, or release evidence.",
        ],
    }


def _suite_receipt_gate(receipt: dict[str, Any]) -> dict[str, Any]:
    """Fail closed on the retained command result before reopening any clean run."""
    command = receipt.get("command")
    blockers: list[str] = []
    if receipt.get("schema_id") != "pw-r9-simulator-suite-receipt-v2":
        blockers.append("SUITE_RECEIPT_SCHEMA_NOT_V2")
    if command not in {"run-clean-pair", "run-regressions", "self-test"}:
        blockers.append("SUITE_COMMAND_UNSUPPORTED")
    if receipt.get("status") != "PASS":
        blockers.append("SUITE_RECEIPT_STATUS_NOT_PASS")
    if receipt.get("error") is not None:
        blockers.append("SUITE_RECEIPT_ERROR_PRESENT")
    if receipt.get("source_bundle_unchanged") is not True:
        blockers.append("SUITE_SOURCE_BUNDLE_NOT_UNCHANGED")
    if receipt.get("calls") != {"subject": 0, "provider": 0, "network": 0}:
        blockers.append("SUITE_CALL_ACCOUNTING_NOT_ZERO")
    clean = receipt.get("clean_pair")
    if not isinstance(clean, dict) or clean.get("status") != "PASS":
        blockers.append("COMMAND_REQUIRED_CLEAN_PAIR_NOT_PASS")
    faults = receipt.get("faults")
    if command in {"run-regressions", "self-test"}:
        if not isinstance(faults, dict) or faults.get("status") != "PASS":
            blockers.append("COMMAND_REQUIRED_FAULTS_NOT_PASS")
    elif command == "run-clean-pair" and faults is not None:
        blockers.append("CLEAN_PAIR_COMMAND_HAS_UNDECLARED_FAULT_SECTION")
    return {
        "status": "PASS" if not blockers else "FAIL",
        "command": command,
        "required_sections": (
            ["clean_pair", "faults"]
            if command in {"run-regressions", "self-test"} else ["clean_pair"]
        ),
        "suite_receipt_status": receipt.get("status"),
        "clean_pair_status": clean.get("status") if isinstance(clean, dict) else None,
        "faults_status": faults.get("status") if isinstance(faults, dict) else None,
        "blockers": blockers,
    }


def _reopen_suite(suite: Path) -> dict[str, Any]:
    inventory = _verify_inventory(suite)
    receipt_storage, receipt = _json(suite / "simulator_receipt.json", "suite receipt", True)
    receipt_gate = _suite_receipt_gate(receipt)
    before = receipt.get("source_bundle_before")
    after = receipt.get("source_bundle_after")
    if not isinstance(before, dict) or not isinstance(after, dict):
        raise SimulationError("suite source snapshots absent")
    source_now = _snapshot_recorded_source_paths(before)
    source_identity = _source_identity_comparison(before, after, source_now)
    custody = _current_git_custody(source_now)
    component_root = _recorded_component_root(before)
    clean_reports: list[dict[str, Any]] = []
    clean = receipt.get("clean_pair")
    if not isinstance(clean, dict):
        raise SimulationError("suite clean-pair receipt absent")
    runs = clean.get("runs")
    if not isinstance(runs, list) or len(runs) != 2:
        raise SimulationError("suite must bind exactly two clean runs")
    for run in runs:
        if not isinstance(run, dict) or not isinstance(run.get("run_id"), str):
            raise SimulationError("clean receipt run reference malformed")
        if (
            receipt_gate.get("status") != "PASS"
            or source_identity.get("status") != "PASS"
            or custody.get("status") != "PASS"
        ):
            break
        invocation = _invoke_from(
            component_root, suite / "evidence", ["reopen", "--run-root", run["run_id"]],
        )
        _assert_invocation(invocation, 0, "PASS")
        summary = _evidence_summary(suite / "evidence" / run["run_id"], True)
        if summary != run.get("summary"):
            raise SimulationError(f"clean run summary drift: {run['run_id']}")
        clean_reports.append({"run_id": run["run_id"], "controller": invocation,
                              "summary": summary})
    causal_proof = _reopen_repair_causal_proof(
        receipt_storage, before, after, source_now, source_identity, custody,
    )
    causal_pass = causal_proof is None or causal_proof.get("status") == "PASS"
    status = "PASS" if (
        receipt_gate.get("status") == "PASS"
        and source_identity.get("status") == "PASS" and custody.get("status") == "PASS"
        and len(clean_reports) == 2 and causal_pass
    ) else "FAIL"
    return {
        "schema_id": "pw-r9-simulator-suite-reopen-v2", "status": status,
        "qualification_credit": 0, "calls": {"subject": 0, "provider": 0, "network": 0},
        "suite_receipt": _identity(receipt_storage), "inventory": inventory,
        "retained_suite_gate": receipt_gate,
        "stable_source_identity": source_identity,
        "current_git_custody": custody,
        "historical_mutable_snapshot_equality_required": False,
        "clean_reopens": clean_reports,
        "same_family_causal_proof": causal_proof,
        "stabilization_exit": "NOT_AUTHORIZED_BY_SIMULATOR",
    }


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="R9 compact zero-provider public-CLI simulator")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("check", help="zero-write static contract, source, history, and Git binding check")
    for name, help_text in (
        ("run-clean-pair", "retain two complete clean 291-row matrices and 54 artifacts each"),
        ("run-regressions", "run all 20 normalized families and causal/global fault cases"),
        ("self-test", "clean pair plus all normalized and causal/global fault cases"),
    ):
        command = commands.add_parser(name, help=help_text)
        command.add_argument("--run-root", required=True, help=f"new direct child of {RUNS}")
    reopen = commands.add_parser("reopen-suite", help="independently inventory and public-reopen retained suite")
    reopen.add_argument("--run-root", required=True, help=f"existing direct child of {RUNS}")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        check = _static_check()
        if args.command == "check":
            sys.stdout.buffer.write(_canon(check) + b"\n")
            return 0
        if args.command == "reopen-suite":
            report = _reopen_suite(_suite_root(args.run_root, False))
            sys.stdout.buffer.write(_canon(report) + b"\n")
            return 0 if report["status"] == "PASS" else 2
        suite = _suite_root(args.run_root, True)
        before = check["source_bundle"]
        clean = faults = None
        error: Exception | None = None
        try:
            if args.command in {"run-clean-pair", "self-test", "run-regressions"}:
                clean = _run_clean_pair(suite, before)
            if args.command in {"run-regressions", "self-test"}:
                faults = _run_faults(suite, clean, check)
        except Exception as exc:
            error = exc
        receipt = _suite_receipt(args.command, before, clean, faults, error)
        receipt_identity = _write_json(suite / "simulator_receipt.json", receipt)
        inventory = _write_inventory(suite)
        result = {
            "schema_id": "pw-r9-simulator-command-result-v2",
            "status": receipt["status"], "suite": suite.name,
            "qualification_credit": 0,
            "calls": {"subject": 0, "provider": 0, "network": 0},
            "receipt": {"path": "simulator_receipt.json", **receipt_identity},
            "inventory": inventory,
            "stabilization_exit": "NOT_AUTHORIZED_BY_SIMULATOR",
        }
        sys.stdout.buffer.write(_canon(result) + b"\n")
        return 0 if result["status"] == "PASS" else 2
    except Exception as exc:
        result = {
            "schema_id": "pw-r9-simulator-error-v2", "status": "FAIL",
            "qualification_credit": 0,
            "calls": {"subject": 0, "provider": 0, "network": 0},
            "error_type": type(exc).__name__, "error": str(exc),
            "stabilization_exit": "NOT_AUTHORIZED_BY_SIMULATOR",
        }
        sys.stdout.buffer.write(_canon(result) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
