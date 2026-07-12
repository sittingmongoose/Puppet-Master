#!/usr/bin/env python3
"""Audit-runtime verifier for the frozen exact-299 V1 preparation.

This V2 is compatibility evidence only.  It hard-pins the audit runtime,
revalidates every V1 byte and V1 semantic gate, and authorizes no execution,
credit, dispatch, certification, promotion, or canonical write.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib
import importlib.metadata
import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
from types import ModuleType
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple

sys.dont_write_bytecode = True

HERE = Path(__file__).resolve().parent
PROJECT_ROOT = HERE.parents[5]
AUDIT_ROOT = HERE.parents[2]
V1_ROOT = HERE.parent / "exhaustive299-bound-supersession-v32"

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
PREPARATION_ID = "exhaustive299-bound-supersession-v32-runtime-compatibility-v2"
RUNTIME_EXE = Path(
    "/Users/jaredsmacbookair/.cache/codex-runtimes/"
    "codex-primary-runtime/dependencies/python/bin/python3"
)
SITE_PACKAGES = (
    AUDIT_ROOT
    / "master/dependencies/jsonschema-draft202012-v1/site-packages"
).resolve()

V1_TREE_FILE_COUNT = 19
V1_TREE_BYTE_COUNT = 164999
V1_TREE_SHA256 = "2cbc0fa005eefbd8a8844cb9ff7e3ba2b9cc0e13cf31a0b978b1e917453a0dcb"
V1_ARTIFACT_SEAL_SHA256 = "6acb57ec1729411e6e5100703adc9b969d009a6a1ccdebdd915f685b4c2b316f"
V1_TEST_REPORT_SHA256 = "009a02d1267297efc92f3d303606723ce9f8e936cfdef92fb99cddb3cc4827ad"
V1_TERMINAL_SHA256 = "fc83d54ae2d8eac165c013584d90ae555c6f89f6dbb4d16fc051a55efb716699"
V1_TERMINAL_SEAL_SHA256 = "28886cbd6924a46e5d10e280e5abdaae599a0ff76b6dd61ea83f302f2930772b"
V1_BASELINE_TOTAL = 1576
V1_BASELINE_CASE_DIGEST = "c27c84343eb20e94ad2ad59a48e2a55eba496886eecf5d7cb9a6d13a69c438ec"

EXACT_CONTENT_STATE_SHA256 = "cd988d47ef4c935baf4347d7199cfa293d508393363a2bf77b77336aad695a1f"

PROHIBITIONS = [
    "activation",
    "agent_dispatch",
    "canonical_writes",
    "capture",
    "certification_credit",
    "closure",
    "coverage_credit",
    "launches",
    "merge_credit",
    "promotion",
    "receipts",
    "research_credit",
    "results",
    "reviewer_dispatch",
    "spec_credit",
]
ZERO_COUNTERS = [
    "activation_transactions",
    "agent_dispatches",
    "canonical_writes",
    "capture_rows",
    "certification_credit",
    "closure_credit",
    "coverage_credit",
    "launches",
    "merge_credit",
    "promotion_credit",
    "receipts",
    "research_credit",
    "results",
    "reviewer_dispatches",
    "spec_credit",
]

CORE_FILES = sorted(
    [
        "authority.json",
        "build_runtime_compatibility_v2.py",
        "readiness.json",
        "runtime_lock.json",
        "test_runtime_compatibility_v2.py",
        "v1_tree_inventory.json",
        "verify_runtime_compatibility_v2.py",
        "zero_state.json",
        "schema/authority.schema.json",
        "schema/runtime_lock.schema.json",
        "schema/terminal.schema.json",
        "schema/v1_tree_inventory.schema.json",
    ]
)
FINAL_FILES = sorted(
    CORE_FILES
    + [
        "ARTIFACT_SEAL.json",
        "TERMINAL_SEAL.json",
        "terminal-runtime-compatibility-report.json",
        "test-report.json",
    ]
)


class ValidationError(RuntimeError):
    pass


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def canonical_compact_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def strict_read_bytes(
    path: Path,
    trace: Optional[List[str]] = None,
    after_open_hook: Optional[Callable[[], None]] = None,
) -> bytes:
    path = Path(path)
    try:
        before_lstat = os.lstat(path)
    except OSError as exc:
        raise ValidationError(f"unreadable path: {path}: {exc}") from exc
    if not stat.S_ISREG(before_lstat.st_mode) or before_lstat.st_nlink != 1:
        raise ValidationError(f"unsafe non-regular, symlink, or multi-link path: {path}")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        fd = os.open(path, flags)
    except OSError as exc:
        raise ValidationError(f"safe open failed: {path}: {exc}") from exc
    try:
        before_fd = os.fstat(fd)
        if not stat.S_ISREG(before_fd.st_mode) or before_fd.st_nlink != 1:
            raise ValidationError(f"unsafe opened object: {path}")
        if (before_fd.st_dev, before_fd.st_ino) != (before_lstat.st_dev, before_lstat.st_ino):
            raise ValidationError(f"TOCTOU identity mismatch: {path}")
        if after_open_hook:
            after_open_hook()
        chunks: List[bytes] = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
        after_fd = os.fstat(fd)
    finally:
        os.close(fd)
    try:
        after_lstat = os.lstat(path)
    except OSError as exc:
        raise ValidationError(f"path disappeared after read: {path}") from exc
    before = (
        before_fd.st_dev,
        before_fd.st_ino,
        before_fd.st_size,
        before_fd.st_mtime_ns,
        before_fd.st_nlink,
    )
    after_open = (
        after_fd.st_dev,
        after_fd.st_ino,
        after_fd.st_size,
        after_fd.st_mtime_ns,
        after_fd.st_nlink,
    )
    after_path = (
        after_lstat.st_dev,
        after_lstat.st_ino,
        after_lstat.st_size,
        after_lstat.st_mtime_ns,
        after_lstat.st_nlink,
    )
    if before != after_open or before != after_path:
        raise ValidationError(f"TOCTOU mutation detected: {path}")
    if trace is not None:
        trace.append(str(path.resolve()))
    return b"".join(chunks)


def load_json(path: Path, trace: Optional[List[str]] = None) -> Any:
    try:
        return json.loads(strict_read_bytes(path, trace).decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValidationError(f"invalid JSON: {path}: {exc}") from exc


def file_sha256(path: Path, trace: Optional[List[str]] = None) -> str:
    return sha256_bytes(strict_read_bytes(path, trace))


def tree_inventory(root: Path, trace: Optional[List[str]] = None) -> Tuple[List[Dict[str, Any]], int, str]:
    rows: List[Dict[str, Any]] = []
    for path in sorted(root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()):
        item_stat = os.lstat(path)
        if path.is_dir() and not stat.S_ISLNK(item_stat.st_mode):
            continue
        if not stat.S_ISREG(item_stat.st_mode) or item_stat.st_nlink != 1:
            raise ValidationError(f"tree contains unsafe entry: {path}")
        data = strict_read_bytes(path, trace)
        rows.append(
            {
                "byte_count": len(data),
                "path": path.relative_to(root).as_posix(),
                "sha256": sha256_bytes(data),
            }
        )
    byte_count = sum(row["byte_count"] for row in rows)
    digest = sha256_bytes(canonical_compact_bytes(rows))
    return rows, byte_count, digest


def false_authorizations() -> Dict[str, bool]:
    return {name: False for name in PROHIBITIONS}


def zero_state() -> Dict[str, int]:
    return {name: 0 for name in ZERO_COUNTERS}


def runtime_snapshot() -> Dict[str, Any]:
    try:
        jsonschema_version = importlib.metadata.version("jsonschema")
    except importlib.metadata.PackageNotFoundError:
        jsonschema_version = None
    try:
        jsonschema_module = importlib.import_module("jsonschema")
        module_file = str(Path(jsonschema_module.__file__).resolve())
    except Exception:
        module_file = None
    return {
        "environment": {
            "PYTHONHASHSEED": os.environ.get("PYTHONHASHSEED"),
            "PYTHONNOUSERSITE": os.environ.get("PYTHONNOUSERSITE"),
            "PYTHONPATH": os.environ.get("PYTHONPATH"),
            "PYTHONDONTWRITEBYTECODE": os.environ.get("PYTHONDONTWRITEBYTECODE"),
        },
        "flags": {
            "dont_write_bytecode": sys.flags.dont_write_bytecode,
            "hash_randomization": sys.flags.hash_randomization,
            "no_site": sys.flags.no_site,
            "no_user_site": sys.flags.no_user_site,
            "optimize": sys.flags.optimize,
        },
        "jsonschema_module_file": module_file,
        "jsonschema_version": jsonschema_version,
        "python_executable": sys.executable,
        "python_version": ".".join(str(value) for value in sys.version_info[:3]),
        "site_imported": "site" in sys.modules,
        "site_package_paths": sorted(path for path in sys.path if "site-packages" in path),
    }


def expected_runtime_snapshot() -> Dict[str, Any]:
    return {
        "environment": {
            "PYTHONHASHSEED": "0",
            "PYTHONNOUSERSITE": "1",
            "PYTHONPATH": str(SITE_PACKAGES),
            "PYTHONDONTWRITEBYTECODE": "1",
        },
        "flags": {
            "dont_write_bytecode": 1,
            "hash_randomization": 0,
            "no_site": 1,
            "no_user_site": 1,
            "optimize": 0,
        },
        "jsonschema_module_file": str(SITE_PACKAGES / "jsonschema/__init__.py"),
        "jsonschema_version": "4.26.0",
        "python_executable": str(RUNTIME_EXE),
        "python_version": "3.12.13",
        "site_imported": False,
        "site_package_paths": [str(SITE_PACKAGES)],
    }


def runtime_errors(snapshot: Dict[str, Any]) -> List[str]:
    expected = expected_runtime_snapshot()
    errors: List[str] = []
    for key in sorted(expected):
        if snapshot.get(key) != expected[key]:
            errors.append(f"runtime mismatch {key}: expected={expected[key]!r} actual={snapshot.get(key)!r}")
    if set(snapshot) != set(expected):
        errors.append("runtime snapshot field-set drift")
    return errors


def enforce_runtime() -> Dict[str, Any]:
    snapshot = runtime_snapshot()
    errors = runtime_errors(snapshot)
    if errors:
        raise ValidationError("; ".join(errors))
    return snapshot


def expected_runtime_lock() -> Dict[str, Any]:
    return {
        "command_contract": {
            "environment": expected_runtime_snapshot()["environment"],
            "executable": str(RUNTIME_EXE),
            "required_flags": ["-S", "-B"],
            "verifier_script": "verify_runtime_compatibility_v2.py",
            "test_script": "test_runtime_compatibility_v2.py",
        },
        "expected_runtime": expected_runtime_snapshot(),
        "schema_version": "audit005-exhaustive299-runtime-lock-v2",
        "status": "HARD_PINNED_AUDIT_RUNTIME",
    }


def historical_v1_runtime_check(value: Dict[str, Any]) -> None:
    expected = {
        "determinism": {
            "json_key_order": "sorted",
            "pythonhashseed": "0",
            "timestamps": "omitted",
        },
        "runtime": {"jsonschema": "4.25.1", "python": "3.9.6"},
        "schema_version": "audit005-exhaustive299-runtime-lock-v32",
        "status": "PINNED_CURRENT_PREPARATION_RUNTIME",
    }
    if value != expected:
        raise ValidationError("frozen V1 historical runtime declaration drift")


def load_v1_verifier() -> ModuleType:
    module_name = "audit005_exhaustive299_v1_verify_frozen"
    if module_name in sys.modules:
        module = sys.modules[module_name]
    else:
        spec = importlib.util.spec_from_file_location(module_name, V1_ROOT / "verify_preparation.py")
        if spec is None or spec.loader is None:
            raise ValidationError("unable to load frozen V1 verifier")
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
    module._runtime_check = historical_v1_runtime_check
    return module


def expected_v1_tree_inventory(trace: Optional[List[str]] = None) -> Dict[str, Any]:
    files, byte_count, tree_sha = tree_inventory(V1_ROOT, trace)
    if (len(files), byte_count, tree_sha) != (
        V1_TREE_FILE_COUNT,
        V1_TREE_BYTE_COUNT,
        V1_TREE_SHA256,
    ):
        raise ValidationError(
            f"frozen V1 whole-tree drift: count={len(files)} bytes={byte_count} digest={tree_sha}"
        )
    terminal_bindings = {
        "artifact_seal_sha256": V1_ARTIFACT_SEAL_SHA256,
        "terminal_report_sha256": V1_TERMINAL_SHA256,
        "terminal_seal_sha256": V1_TERMINAL_SEAL_SHA256,
        "test_report_sha256": V1_TEST_REPORT_SHA256,
    }
    for name, expected_sha in [
        ("ARTIFACT_SEAL.json", V1_ARTIFACT_SEAL_SHA256),
        ("test-report.json", V1_TEST_REPORT_SHA256),
        ("terminal-preparation-report.json", V1_TERMINAL_SHA256),
        ("TERMINAL_SEAL.json", V1_TERMINAL_SEAL_SHA256),
    ]:
        if file_sha256(V1_ROOT / name, trace) != expected_sha:
            raise ValidationError(f"frozen V1 terminal lineage drift: {name}")
    return {
        "byte_count": byte_count,
        "file_count": len(files),
        "files": files,
        "schema_version": "audit005-exhaustive299-v1-tree-inventory-v2",
        "status": "V1_FROZEN_CONTROLLER_VALID_NOT_AUDIT_RUNTIME_AUTHORITY",
        "terminal_lineage": terminal_bindings,
        "tree_sha256": tree_sha,
    }


def verify_frozen_v1(trace: Optional[List[str]] = None) -> Dict[str, Any]:
    expected_v1_tree_inventory(trace)
    v1 = load_v1_verifier()
    try:
        report = v1.verify_filesystem(require_terminal=True, trace=trace if trace is not None else [])
    except Exception as exc:
        raise ValidationError(f"frozen V1 full exact-299 validation failed: {exc}") from exc
    if report.get("member_count") != 299:
        raise ValidationError("V1 no longer proves exact 299")
    if report.get("semantic_document_count") != 3:
        raise ValidationError("V1 semantic count drift")
    if report.get("generated_governance_integrity_join_count") != 296:
        raise ValidationError("V1 generated/governance count drift")
    if report.get("blocker_count") != 7 or report.get("credit") != 0:
        raise ValidationError("V1 blocker or credit drift")
    if report.get("semantic_prose_reads") != 0 or report.get("zero_state") != zero_state():
        raise ValidationError("V1 prose/zero-state drift")
    return report


def expected_authority(runtime_lock_sha: str, v1_tree_inventory_sha: str) -> Dict[str, Any]:
    return {
        "append_only": True,
        "audit_id": AUDIT_ID,
        "authorizations": false_authorizations(),
        "bindings": {
            "runtime_lock_sha256": runtime_lock_sha,
            "v1_artifact_seal_sha256": V1_ARTIFACT_SEAL_SHA256,
            "v1_terminal_report_sha256": V1_TERMINAL_SHA256,
            "v1_terminal_seal_sha256": V1_TERMINAL_SEAL_SHA256,
            "v1_test_report_sha256": V1_TEST_REPORT_SHA256,
            "v1_tree_inventory_sha256": v1_tree_inventory_sha,
            "v1_tree_sha256": V1_TREE_SHA256,
        },
        "blocker_count": 7,
        "credit": 0,
        "exact_scope": {
            "content_state_sha256": EXACT_CONTENT_STATE_SHA256,
            "generated_governance_integrity_join_count": 296,
            "member_count": 299,
            "semantic_document_count": 3,
        },
        "preparation_id": PREPARATION_ID,
        "preparation_only": True,
        "ready": False,
        "runtime_accepted": True,
        "schema_version": "audit005-exhaustive299-runtime-compatibility-authority-v2",
        "status": "AUDIT_RUNTIME_VALID_PREPARATION_ONLY_BLOCKED",
        "zero_state": zero_state(),
    }


def expected_zero_state() -> Dict[str, Any]:
    return {
        "authorizations": false_authorizations(),
        "expected_namespace_files": FINAL_FILES,
        "preparation_id": PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-runtime-compatibility-zero-state-v2",
        "semantic_prose_reads": 0,
        "status": "ZERO_STATE_RUNTIME_COMPATIBILITY_ONLY",
        "zero_state": zero_state(),
    }


def expected_readiness() -> Dict[str, Any]:
    return {
        "activation_ready": False,
        "audit_id": AUDIT_ID,
        "blocker_count": 7,
        "credit": 0,
        "exact_scope": {
            "content_state_sha256": EXACT_CONTENT_STATE_SHA256,
            "generated_governance_integrity_join_count": 296,
            "member_count": 299,
            "semantic_document_count": 3,
        },
        "preparation_complete": True,
        "preparation_id": PREPARATION_ID,
        "runtime_accepted": True,
        "schema_version": "audit005-exhaustive299-runtime-compatibility-readiness-v2",
        "status": "PREPARATION_COMPLETE_BLOCKED_EXACT_SEVEN",
        "zero_state": zero_state(),
    }


def validate_artifact_seal(value: Dict[str, Any], hashes: Dict[str, Tuple[int, str]]) -> None:
    expected = {
        "files": [
            {"byte_count": hashes[name][0], "path": name, "sha256": hashes[name][1]}
            for name in CORE_FILES
        ],
        "preparation_id": PREPARATION_ID,
        "schema_version": "audit005-exhaustive299-runtime-compatibility-artifact-seal-v2",
        "sealed_file_count": len(CORE_FILES),
        "status": "SEALED_AUDIT_RUNTIME_COMPATIBILITY_CORE",
    }
    if value != expected:
        raise ValidationError("V2 artifact seal membership/hash drift")


def validate_test_report(value: Dict[str, Any]) -> None:
    baseline = value.get("v1_baseline", {})
    if baseline != {
        "case_id_digest": V1_BASELINE_CASE_DIGEST,
        "failed": 0,
        "passed": V1_BASELINE_TOTAL,
        "total": V1_BASELINE_TOTAL,
    }:
        raise ValidationError("V1 1576-case baseline was reduced or drifted")
    negatives = value.get("runtime_negative", {})
    if negatives.get("failed") != 0 or negatives.get("passed") != negatives.get("total"):
        raise ValidationError("runtime-negative test failure")
    if negatives.get("total", 0) < 15:
        raise ValidationError("insufficient runtime-negative coverage")
    if value.get("failed") != 0 or value.get("passed") != value.get("total"):
        raise ValidationError("V2 aggregate tests failed")
    expected_total = V1_BASELINE_TOTAL + negatives["total"] + value.get("v2_valid_fixture_count", 0)
    if value.get("total") != expected_total:
        raise ValidationError("V2 aggregate test count framing drift")


def expected_terminal(artifact_seal_sha: str, test_report: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "artifact_seal_sha256": artifact_seal_sha,
        "audit_id": AUDIT_ID,
        "authorizations": false_authorizations(),
        "blocker_count": 7,
        "credit": 0,
        "exact_scope": {
            "content_state_sha256": EXACT_CONTENT_STATE_SHA256,
            "generated_governance_integrity_join_count": 296,
            "member_count": 299,
            "semantic_document_count": 3,
        },
        "preparation_complete": True,
        "preparation_id": PREPARATION_ID,
        "ready_for_activation": False,
        "runtime": {
            "jsonschema": "4.26.0",
            "python": "3.12.13",
            "runtime_lock_sha256": file_sha256(HERE / "runtime_lock.json"),
        },
        "schema_version": "audit005-exhaustive299-runtime-compatibility-terminal-v2",
        "semantic_prose_reads": 0,
        "status": "PASS_AUDIT_RUNTIME_PREPARATION_ONLY_BLOCKED_ZERO_CREDIT",
        "test_report": {
            "failed": 0,
            "passed": test_report["passed"],
            "sha256": sha256_bytes(canonical_bytes(test_report)),
            "total": test_report["total"],
            "v1_baseline_total": V1_BASELINE_TOTAL,
        },
        "v1_immutability": {
            "file_count": V1_TREE_FILE_COUNT,
            "tree_sha256": V1_TREE_SHA256,
            "unchanged": True,
        },
        "zero_state": zero_state(),
    }


def _validate_schema(instance: Any, schema: Any, label: str) -> None:
    jsonschema = importlib.import_module("jsonschema")
    try:
        jsonschema.Draft202012Validator.check_schema(schema)
        jsonschema.Draft202012Validator(schema).validate(instance)
    except Exception as exc:
        raise ValidationError(f"schema validation failed for {label}: {exc}") from exc


def _namespace_check() -> None:
    observed: List[str] = []
    for path in sorted(HERE.rglob("*")):
        item_stat = os.lstat(path)
        if path.is_dir() and not stat.S_ISLNK(item_stat.st_mode):
            continue
        if not stat.S_ISREG(item_stat.st_mode) or item_stat.st_nlink != 1:
            raise ValidationError(f"unsafe V2 namespace entry: {path}")
        observed.append(path.relative_to(HERE).as_posix())
    if observed != FINAL_FILES:
        raise ValidationError(f"V2 namespace membership drift: {observed!r}")


def verify_filesystem(require_terminal: bool = True, trace: Optional[List[str]] = None) -> Dict[str, Any]:
    runtime = enforce_runtime()
    trace = trace if trace is not None else []
    v1_report = verify_frozen_v1(trace)
    expected_tree = expected_v1_tree_inventory(trace)

    runtime_lock = load_json(HERE / "runtime_lock.json", trace)
    if runtime_lock != expected_runtime_lock():
        raise ValidationError("V2 runtime lock drift")
    v1_tree = load_json(HERE / "v1_tree_inventory.json", trace)
    if v1_tree != expected_tree:
        raise ValidationError("V1 whole-tree inventory artifact drift")
    authority = load_json(HERE / "authority.json", trace)
    expected_auth = expected_authority(
        file_sha256(HERE / "runtime_lock.json", trace),
        file_sha256(HERE / "v1_tree_inventory.json", trace),
    )
    if authority != expected_auth:
        raise ValidationError("V2 authority drift or forbidden credit/authorization leakage")
    zero = load_json(HERE / "zero_state.json", trace)
    if zero != expected_zero_state():
        raise ValidationError("V2 zero-state drift")
    readiness = load_json(HERE / "readiness.json", trace)
    if readiness != expected_readiness():
        raise ValidationError("V2 readiness drift")

    schemas = {
        name: load_json(HERE / f"schema/{name}.schema.json", trace)
        for name in ["authority", "runtime_lock", "terminal", "v1_tree_inventory"]
    }
    _validate_schema(runtime_lock, schemas["runtime_lock"], "runtime_lock")
    _validate_schema(v1_tree, schemas["v1_tree_inventory"], "v1_tree_inventory")
    _validate_schema(authority, schemas["authority"], "authority")

    hashes: Dict[str, Tuple[int, str]] = {}
    for name in CORE_FILES:
        data = strict_read_bytes(HERE / name, trace)
        hashes[name] = (len(data), sha256_bytes(data))
    seal = load_json(HERE / "ARTIFACT_SEAL.json", trace)
    validate_artifact_seal(seal, hashes)

    if require_terminal:
        test_report = load_json(HERE / "test-report.json", trace)
        validate_test_report(test_report)
        terminal = load_json(HERE / "terminal-runtime-compatibility-report.json", trace)
        expected_term = expected_terminal(file_sha256(HERE / "ARTIFACT_SEAL.json", trace), test_report)
        if terminal != expected_term:
            raise ValidationError("V2 terminal runtime-compatibility report drift")
        _validate_schema(terminal, schemas["terminal"], "terminal")
        terminal_files = []
        for name in ["ARTIFACT_SEAL.json", "terminal-runtime-compatibility-report.json", "test-report.json"]:
            data = strict_read_bytes(HERE / name, trace)
            terminal_files.append({"byte_count": len(data), "path": name, "sha256": sha256_bytes(data)})
        expected_terminal_seal = {
            "files": terminal_files,
            "preparation_id": PREPARATION_ID,
            "schema_version": "audit005-exhaustive299-runtime-compatibility-terminal-seal-v2",
            "sealed_file_count": 3,
            "status": "SEALED_AUDIT_RUNTIME_COMPATIBILITY_TERMINAL",
        }
        if load_json(HERE / "TERMINAL_SEAL.json", trace) != expected_terminal_seal:
            raise ValidationError("V2 terminal seal drift")
        _namespace_check()

    if any(path.endswith(".md") and "/Plans/" in path for path in trace):
        raise ValidationError("canonical Plans prose read detected")

    return {
        "blocker_count": 7,
        "credit": 0,
        "generated_governance_integrity_join_count": 296,
        "member_count": 299,
        "preparation_id": PREPARATION_ID,
        "runtime": {"jsonschema": runtime["jsonschema_version"], "python": runtime["python_version"]},
        "semantic_document_count": 3,
        "semantic_prose_reads": 0,
        "status": "PASS_AUDIT_RUNTIME_PREPARATION_ONLY_BLOCKED_ZERO_CREDIT",
        "v1_tree_sha256": V1_TREE_SHA256,
        "zero_state": zero_state(),
    }


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--core-only", action="store_true")
    args = parser.parse_args(argv)
    try:
        report = verify_filesystem(require_terminal=not args.core_only, trace=[])
    except ValidationError as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL_CLOSED"}, sort_keys=True))
        return 1
    print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
