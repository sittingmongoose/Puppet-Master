#!/usr/bin/env python3
"""Independent, read-only verifier for the R9 bounded experiment evidence."""
from __future__ import annotations

import hashlib as _hashlib
import json as _json_module
import os as _os
from pathlib import Path as _Path
from pathlib import PurePosixPath as _PurePosixPath
import re as _re
import stat as _stat
import sys as _sys
from typing import Any as _Any

_sys.dont_write_bytecode = True
__all__ = ["verify"]

_ROOT = _Path(__file__).resolve().parent
_SUCCESSOR = _ROOT.parents[1]
_REPO = _ROOT.parents[4]
_OPERATING = _SUCCESSOR / "r9_goal_operating_contract_v1.json"
_ARCHITECTURE = _ROOT / "architecture_contract.json"
_SEMANTIC = _ROOT / "semantic_manifest.json"
_SCHEDULE = _ROOT / "schedule.json"
_ROUTES = _ROOT / "routes.json"
_SEMANTIC_RECEIPT = _ROOT / "semantic_inventory_receipt.json"
_SAFE_NAME = _re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
_HEX64 = _re.compile(r"[0-9a-f]{64}\Z")
_EXPECTED_KEYS = {
    "schema_id", "run_id", "command", "scheduled_rows", "evidence_root",
    "operating_contract", "architecture_contract", "semantic_manifest",
}
_RUN_KEYS = {
    "schema_id", "run_id", "command", "mode", "scenario",
    "qualification_credit", "operating_contract", "architecture_contract",
    "semantic_manifest", "required_checkpoint", "ordering", "rows",
    "scheduled_rows", "attempts_per_row", "retry_count", "best_of",
    "replacement_result", "resume",
}
_ROW_KEYS = {"ordinal", "slot", "route", "index", "cell", "nonce"}
_ATTEMPT_KEYS = {
    "schema_id", "run_id", "slot", "cell", "index", "route", "nonce",
    "render_storage_sha256", "render_storage_bytes", "provider_input_sha256",
    "provider_input_bytes", "attempt", "retry_count", "best_of",
    "replacement_result", "no_retry", "no_relaunch",
}
_RAW_KEYS = {
    "schema_id", "run_id", "slot", "cell", "index", "attempt_sha256",
    "attempt_bytes", "dispatch_started_monotonic_ns",
    "dispatch_ended_monotonic_ns", "backend_result",
}
_COMPLETION_KEYS = {
    "schema_id", "run_id", "slot", "cell", "index", "route", "nonce",
    "task_id", "thread_id", "turn_id", "render_storage_sha256",
    "render_storage_bytes", "provider_input_sha256", "provider_input_bytes",
    "attempt_sha256", "attempt_bytes",
    "raw_result_sha256", "raw_result_bytes", "score", "status", "attempt",
    "retry_count", "best_of", "replacement_result",
    "completion_is_last_row_write",
}
_BACKEND_REQUIRED = {
    "schema_id", "mode", "terminal", "nonce", "resolved_route",
    "provider_input_sha256", "provider_input_bytes", "task_id", "thread_id",
    "turn_id", "returncode", "stdout_utf8", "stderr_utf8", "process",
    "dispatch_count", "retry_count", "best_of", "replacement_result",
}
_PATH_TERMINAL_KEYS = {
    "schema_id", "run_id", "slot", "status", "scheduled_rows",
    "completed_rows", "pass_rows", "subject_fail_rows", "invalid_rows",
    "unstarted_ordinals", "completion_inventory_sha256",
    "completion_inventory_bytes",
}
_MATRIX_KEYS = {
    "schema_id", "run_id", "status", "cause", "scheduled_rows",
    "completed_rows", "pass_rows", "subject_fail_rows", "invalid_rows",
    "path_terminals", "retry_count", "best_of", "replacement_result",
}
_ACCOUNTING_KEYS = {
    "schema_id", "run_id", "status", "matrix_terminal_sha256",
    "matrix_terminal_bytes", "scheduled_rows", "attempts",
    "captured_raw_results", "valid_completions",
    "unknown_or_uncaptured_dispatches", "retry_count", "best_of",
    "replacement_result",
}
_CHECKS = (
    "expected_interface", "semantic_bundle", "run_manifest", "exact_inventory",
    "row_chains", "schedule_prefix", "path_terminals", "matrix_terminal",
    "accounting", "global_identity_uniqueness",
)


class _Invalid(RuntimeError):
    def __init__(self, code: str, detail: str) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail


def _fail(code: str, detail: str) -> None:
    raise _Invalid(code, detail)


def _canon(value: _Any) -> bytes:
    try:
        return _json_module.dumps(
            value, ensure_ascii=False, allow_nan=False, sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        _fail("NOT_CANONICAL_JSONABLE", str(exc))
    raise AssertionError("unreachable")


def _sha(data: bytes) -> str:
    return _hashlib.sha256(data).hexdigest()


def _pairs(pairs: list[tuple[str, _Any]]) -> dict[str, _Any]:
    result: dict[str, _Any] = {}
    for key, value in pairs:
        if key in result:
            _fail("DUPLICATE_JSON_KEY", key)
        result[key] = value
    return result


def _constant(value: str) -> _Any:
    _fail("NONFINITE_JSON_NUMBER", value)


def _lstat(path: _Path, label: str) -> _os.stat_result:
    try:
        return _os.lstat(path)
    except (FileNotFoundError, NotADirectoryError) as exc:
        _fail("MISSING_PATH", f"{label}: {path}")
    except OSError as exc:
        _fail("PATH_READ_ERROR", f"{label}: {exc}")
    raise AssertionError("unreachable")


def _regular(path: _Path, label: str) -> bytes:
    info = _lstat(path, label)
    if not _stat.S_ISREG(info.st_mode):
        _fail("NOT_REGULAR_NONLINK", f"{label}: {path}")
    try:
        return path.read_bytes()
    except OSError as exc:
        _fail("FILE_READ_ERROR", f"{label}: {exc}")
    raise AssertionError("unreachable")


def _directory(path: _Path, label: str) -> None:
    info = _lstat(path, label)
    if not _stat.S_ISDIR(info.st_mode):
        _fail("NOT_DIRECTORY_NONLINK", f"{label}: {path}")


def _entries(path: _Path, label: str) -> dict[str, bool]:
    _directory(path, label)
    result: dict[str, bool] = {}
    try:
        entries = list(_os.scandir(path))
    except OSError as exc:
        _fail("DIRECTORY_READ_ERROR", f"{label}: {exc}")
    for entry in entries:
        if entry.name in result:
            _fail("DUPLICATE_DIRECTORY_ENTRY", f"{label}: {entry.name}")
        try:
            if entry.is_symlink():
                _fail("SYMLINK_FORBIDDEN", f"{label}: {entry.name}")
            if entry.is_dir(follow_symlinks=False):
                result[entry.name] = True
            elif entry.is_file(follow_symlinks=False):
                result[entry.name] = False
            else:
                _fail("SPECIAL_PATH_FORBIDDEN", f"{label}: {entry.name}")
        except OSError as exc:
            _fail("PATH_READ_ERROR", f"{label}/{entry.name}: {exc}")
    return result


def _json_object(path: _Path, label: str, canonical: bool) -> tuple[bytes, dict[str, _Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        _fail("JSON_STORAGE_FORMAT", f"{label}: exactly one terminal LF and no CR required")
    try:
        text = storage[:-1].decode("utf-8")
        value = _json_module.loads(
            text, object_pairs_hook=_pairs, parse_constant=_constant,
        )
    except (UnicodeDecodeError, _json_module.JSONDecodeError) as exc:
        _fail("INVALID_JSON", f"{label}: {exc}")
    if not isinstance(value, dict):
        _fail("JSON_OBJECT_REQUIRED", label)
    if canonical and storage != _canon(value) + b"\n":
        _fail("NONCANONICAL_JSON", label)
    return storage, value


def _exact_keys(value: dict[str, _Any], keys: set[str], label: str) -> None:
    if set(value) != keys:
        missing = sorted(keys - set(value))
        extra = sorted(set(value) - keys)
        _fail("OBJECT_SHAPE_MISMATCH", f"{label}: missing={missing}, extra={extra}")


def _name(value: _Any, label: str) -> str:
    if not isinstance(value, str) or not _SAFE_NAME.fullmatch(value):
        _fail("UNSAFE_NAME", label)
    return value


def _integer(value: _Any, label: str, minimum: int | None = None) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        _fail("INTEGER_REQUIRED", label)
    if minimum is not None and value < minimum:
        _fail("INTEGER_RANGE", label)
    return value


def _utf8(value: _Any, label: str) -> bytes:
    if not isinstance(value, str):
        _fail("STRING_REQUIRED", label)
    try:
        return value.encode("utf-8")
    except UnicodeEncodeError as exc:
        _fail("INVALID_UTF8_STRING", f"{label}: {exc}")
    raise AssertionError("unreachable")


def _backend_canon(value: _Any) -> bytes:
    """Reproduce the backend's insertion-order canonical byte convention."""
    try:
        return _json_module.dumps(
            value, ensure_ascii=False, allow_nan=False, separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        _fail("BACKEND_EVIDENCE_NOT_JSONABLE", str(exc))
    raise AssertionError("unreachable")


def _binding(path: _Path, storage: bytes) -> dict[str, _Any]:
    try:
        relative = path.relative_to(_REPO)
    except ValueError:
        _fail("CONTROL_OUTSIDE_REPOSITORY", str(path))
    return {"path": relative.as_posix(), "sha256": _sha(storage), "bytes": len(storage)}


def _binding_shape(
    value: _Any, label: str, allow_schema_id: bool = False,
) -> dict[str, _Any]:
    core = {"path", "sha256", "bytes"}
    allowed = core | ({"schema_id"} if allow_schema_id else set())
    if not isinstance(value, dict):
        _fail("BINDING_SHAPE_MISMATCH", label)
    keys = set(value)
    if keys != core and not (allow_schema_id and keys == allowed):
        _fail("BINDING_SHAPE_MISMATCH", label)
    if not isinstance(value["path"], str) or not isinstance(value["sha256"], str):
        _fail("BINDING_TYPE_MISMATCH", label)
    _integer(value["bytes"], f"{label}.bytes", 0)
    return {key: value[key] for key in ("path", "sha256", "bytes")}


def _safe_relative(value: _Any, label: str) -> _PurePosixPath:
    if not isinstance(value, str) or not value or "\\" in value:
        _fail("UNSAFE_RELATIVE_PATH", label)
    pure = _PurePosixPath(value)
    if pure.is_absolute() or any(part in {"", ".", ".."} for part in pure.parts):
        _fail("UNSAFE_RELATIVE_PATH", label)
    if pure.as_posix() != value:
        _fail("NONNORMAL_RELATIVE_PATH", label)
    return pure


def _manifest_file(pure: _PurePosixPath) -> bytes:
    current = _SUCCESSOR
    for part in pure.parts[:-1]:
        current = current / part
        _directory(current, f"semantic manifest parent {pure}")
    return _regular(_SUCCESSOR.joinpath(*pure.parts), f"semantic manifest file {pure}")


def _load_controls() -> dict[str, _Any]:
    operating_bytes, operating = _json_object(_OPERATING, "operating contract", False)
    if operating.get("schema_id") != "pw-r9-goal-operating-contract-v1":
        _fail("OPERATING_SCHEMA_MISMATCH", str(operating.get("schema_id")))

    architecture_bytes, architecture = _json_object(_ARCHITECTURE, "architecture contract", False)
    if architecture.get("schema_id") != "pw-r9-minimal-controller-architecture-v1":
        _fail("ARCHITECTURE_SCHEMA_MISMATCH", str(architecture.get("schema_id")))
    lineage = architecture.get("lineage")
    if not isinstance(lineage, dict):
        _fail("ARCHITECTURE_LINEAGE_MISSING", "lineage")
    declared_operating = _binding_shape(
        lineage.get("operating_contract"), "architecture operating binding", True,
    )
    actual_operating = _binding(_OPERATING, operating_bytes)
    if declared_operating != actual_operating:
        _fail("OPERATING_BINDING_DRIFT", "architecture lineage does not bind live operating bytes")
    checkpoint = lineage.get("required_checkpoint")
    if not isinstance(checkpoint, str) or not checkpoint:
        _fail("CHECKPOINT_MISSING", "architecture lineage")
    verifier_interface = architecture.get("verifier_interface")
    if not isinstance(verifier_interface, dict) or (
        verifier_interface.get("module"), verifier_interface.get("import"),
        verifier_interface.get("signature"), verifier_interface.get("offline"),
        verifier_interface.get("persistence"), verifier_interface.get("callbacks")
    ) != (
        "verifier.py", "from verifier import verify",
        "verify(run_root: pathlib.Path, expected: dict) -> dict",
        True, False, False,
    ):
        _fail("VERIFIER_INTERFACE_DRIFT", "architecture verifier interface")

    semantic_bytes, semantic = _json_object(_SEMANTIC, "semantic manifest", False)
    if semantic.get("schema_id") != "pw-r9-semantic-manifest-v1":
        _fail("SEMANTIC_SCHEMA_MISMATCH", str(semantic.get("schema_id")))
    routes = semantic.get("routes")
    schedule = semantic.get("schedule")
    cells = semantic.get("cells")
    files = semantic.get("files")
    if not isinstance(routes, list) or len(routes) != 3:
        _fail("ROUTE_COUNT_MISMATCH", "exactly three routes required")
    normalized_routes: list[dict[str, str]] = []
    slots: list[str] = []
    for index, route in enumerate(routes):
        if not isinstance(route, dict) or set(route) != {"slot", "model", "thinking"}:
            _fail("ROUTE_SHAPE_MISMATCH", str(index))
        slot = _name(route.get("slot"), f"route[{index}].slot")
        model = _name(route.get("model"), f"route[{index}].model")
        thinking = _name(route.get("thinking"), f"route[{index}].thinking")
        normalized_routes.append({"slot": slot, "model": model, "thinking": thinking})
        slots.append(slot)
    if len(set(slots)) != len(slots):
        _fail("DUPLICATE_ROUTE_SLOT", str(slots))
    if not isinstance(schedule, list) or len(schedule) != 97:
        _fail("SEMANTIC_SCHEDULE_COUNT", "exactly 97 cells required")
    normalized_schedule = [_name(cell, f"schedule[{index}]") for index, cell in enumerate(schedule)]
    if len(set(normalized_schedule)) != len(normalized_schedule):
        _fail("DUPLICATE_CELL", "semantic schedule")
    if not isinstance(cells, list) or len(cells) != len(normalized_schedule):
        _fail("CELL_COUNT_MISMATCH", "semantic cells")
    normalized_cells: list[dict[str, _Any]] = []
    for index, cell in enumerate(cells):
        if not isinstance(cell, dict) or set(cell) != {"index", "cell", "render_utf8", "expected_output"}:
            _fail("CELL_SHAPE_MISMATCH", str(index))
        if cell.get("index") != index or cell.get("cell") != normalized_schedule[index]:
            _fail("CELL_ORDER_MISMATCH", str(index))
        render = _utf8(cell.get("render_utf8"), f"cell[{index}].render_utf8")
        if not render.endswith(b"\n") or render.endswith(b"\n\n") or b"\r" in render:
            _fail("RENDER_STORAGE_FORMAT", str(index))
        _canon(cell.get("expected_output"))
        normalized_cells.append(cell)
    if not isinstance(files, list):
        _fail("SEMANTIC_FILE_INVENTORY_MISSING", "files")
    file_paths: list[str] = []
    for index, item in enumerate(files):
        if not isinstance(item, dict) or set(item) != {"path", "sha256", "bytes"}:
            _fail("SEMANTIC_FILE_BINDING_SHAPE", str(index))
        pure = _safe_relative(item.get("path"), f"semantic files[{index}].path")
        data = _manifest_file(pure)
        if (item.get("sha256"), item.get("bytes")) != (_sha(data), len(data)):
            _fail("SEMANTIC_FILE_BINDING_DRIFT", pure.as_posix())
        file_paths.append(pure.as_posix())
    if file_paths != sorted(file_paths) or len(file_paths) != len(set(file_paths)):
        _fail("SEMANTIC_FILE_INVENTORY_ORDER", "paths must be sorted and unique")
    canary = semantic.get("canary_cell", normalized_schedule[0])
    if canary not in normalized_schedule:
        _fail("CANARY_CELL_MISSING", str(canary))

    schedule_bytes, schedule_artifact = _json_object(_SCHEDULE, "schedule artifact", False)
    if schedule_artifact.get("schema_id") != "pw-r9-slot-major-schedule-v1":
        _fail("SCHEDULE_SCHEMA_MISMATCH", str(schedule_artifact.get("schema_id")))
    exact_entries = [
        {"index": ordinal, "slot_index": slot_index, "cell_index": cell_index,
         "slot": route["slot"], "model": route["model"],
         "thinking": route["thinking"], "cell": normalized_schedule[cell_index]}
        for ordinal, (slot_index, route, cell_index) in enumerate(
            (slot_index, route, cell_index)
            for slot_index, route in enumerate(normalized_routes)
            for cell_index in range(len(normalized_schedule))
        )
    ]
    if (
        schedule_artifact.get("order"), schedule_artifact.get("route_count"),
        schedule_artifact.get("cells_per_route"), schedule_artifact.get("entry_count"),
        schedule_artifact.get("entries")
    ) != ("slot-major", 3, 97, 291, exact_entries):
        _fail("SCHEDULE_CONTENT_MISMATCH", "schedule.json is not the exact slot-major product")
    nonce_rule = schedule_artifact.get("run_specific_nonce_rule")
    if not isinstance(nonce_rule, dict) or (
        nonce_rule.get("predeclared_in_run_manifest"),
        nonce_rule.get("semantic_manifest_contains_run_specific_nonce")
    ) != (True, False):
        _fail("NONCE_RULE_MISMATCH", "schedule.json")

    routes_bytes, routes_artifact = _json_object(_ROUTES, "routes artifact", False)
    if routes_artifact != {"schema_id": "pw-r9-routes-v1", "routes": normalized_routes}:
        _fail("ROUTES_CONTENT_MISMATCH", "routes.json")

    receipt_bytes, receipt = _json_object(_SEMANTIC_RECEIPT, "semantic inventory receipt", False)
    if receipt.get("schema_id") != "pw-r9-semantic-inventory-receipt-v1":
        _fail("SEMANTIC_RECEIPT_SCHEMA_MISMATCH", str(receipt.get("schema_id")))
    if receipt.get("bindings", {}).get("r9_goal_operating_contract") != actual_operating:
        _fail("SEMANTIC_RECEIPT_OPERATING_DRIFT", "operating contract")
    artifacts = receipt.get("artifacts")
    expected_artifacts = {
        "semantic_manifest.json": {"sha256": _sha(semantic_bytes), "bytes": len(semantic_bytes)},
        "schedule.json": {"sha256": _sha(schedule_bytes), "bytes": len(schedule_bytes)},
        "routes.json": {"sha256": _sha(routes_bytes), "bytes": len(routes_bytes)},
    }
    if artifacts != expected_artifacts:
        _fail("SEMANTIC_RECEIPT_ARTIFACT_DRIFT", "semantic bundle")
    receipt_verification = receipt.get("verification")
    if not isinstance(receipt_verification, dict) or (
        receipt_verification.get("ordered_cell_count"),
        receipt_verification.get("slot_major_schedule_entries"),
        receipt_verification.get("source_manifest_rows"),
        receipt_verification.get("provider_calls"),
        receipt_verification.get("subject_calls"),
        receipt_verification.get("empirical_evidence_claimed")
    ) != (97, 291, len(files), 0, 0, False):
        _fail("SEMANTIC_RECEIPT_FACT_MISMATCH", "verification")
    receipt_cells = receipt.get("cells")
    if not isinstance(receipt_cells, list) or len(receipt_cells) != len(normalized_cells):
        _fail("SEMANTIC_RECEIPT_CELL_COUNT", "cells")
    for index, (cell, recorded) in enumerate(zip(normalized_cells, receipt_cells)):
        if not isinstance(recorded, dict) or recorded.get("index") != index or recorded.get("cell") != cell["cell"]:
            _fail("SEMANTIC_RECEIPT_CELL_ORDER", str(index))
        render = cell["render_utf8"].encode("utf-8")
        base = render[:-1]
        expected_output = _backend_canon(cell["expected_output"])
        if (
            recorded.get("base_semantic_packet_sha256"),
            recorded.get("base_semantic_packet_bytes"),
            recorded.get("render_storage_sha256"),
            recorded.get("render_storage_bytes"),
            recorded.get("expected_output_sha256"),
            recorded.get("expected_output_bytes"),
        ) != (
            _sha(base), len(base), _sha(render), len(render),
            _sha(expected_output), len(expected_output),
        ):
            _fail("SEMANTIC_RECEIPT_CELL_BINDING_DRIFT", str(index))
    if receipt.get("unresolved_semantic_dependencies") != []:
        _fail("UNRESOLVED_SEMANTIC_DEPENDENCY", "semantic inventory receipt")

    return {
        "operating_bytes": operating_bytes,
        "architecture_bytes": architecture_bytes,
        "semantic_bytes": semantic_bytes,
        "routes": normalized_routes,
        "schedule": normalized_schedule,
        "cells": normalized_cells,
        "canary": canary,
        "checkpoint": checkpoint,
        "bundle": {
            "operating_contract": actual_operating,
            "architecture_contract": _binding(_ARCHITECTURE, architecture_bytes),
            "semantic_manifest": _binding(_SEMANTIC, semantic_bytes),
            "schedule_sha256": _sha(schedule_bytes),
            "routes_sha256": _sha(routes_bytes),
            "semantic_inventory_receipt_sha256": _sha(receipt_bytes),
            "manifest_file_count": len(files),
        },
    }


def _validate_expected(run_root: _Path, expected: _Any, controls: dict[str, _Any]) -> dict[str, _Any]:
    if not isinstance(expected, dict):
        _fail("EXPECTED_OBJECT_REQUIRED", "expected")
    _exact_keys(expected, _EXPECTED_KEYS, "expected")
    if expected.get("schema_id") != "pw-r9-verifier-expectation-v1":
        _fail("EXPECTED_SCHEMA_MISMATCH", str(expected.get("schema_id")))
    run_id = _name(expected.get("run_id"), "expected.run_id")
    command = expected.get("command")
    if command not in {"simulate", "run-canary", "run-matrix"}:
        _fail("EXPECTED_COMMAND_MISMATCH", str(command))
    rows = _integer(expected.get("scheduled_rows"), "expected.scheduled_rows", 0)
    wanted_rows = 3 if command == "run-canary" else 291
    if rows != wanted_rows:
        _fail("EXPECTED_ROW_COUNT_MISMATCH", f"{rows} != {wanted_rows}")
    if not isinstance(run_root, _Path):
        _fail("RUN_ROOT_PATH_REQUIRED", type(run_root).__name__)
    if not run_root.is_absolute():
        _fail("RUN_ROOT_ABSOLUTE_REQUIRED", str(run_root))
    _directory(run_root, "run root")
    evidence_text = expected.get("evidence_root")
    if not isinstance(evidence_text, str):
        _fail("EVIDENCE_ROOT_STRING_REQUIRED", "expected.evidence_root")
    evidence_root = _Path(evidence_text)
    if not evidence_root.is_absolute():
        _fail("EVIDENCE_ROOT_ABSOLUTE_REQUIRED", evidence_text)
    _directory(evidence_root, "evidence root")
    try:
        if run_root.parent.resolve(strict=True) != evidence_root.resolve(strict=True):
            _fail("RUN_ROOT_PARENT_MISMATCH", str(run_root))
        if run_root.resolve(strict=True).parent != evidence_root.resolve(strict=True):
            _fail("RUN_ROOT_SYMLINK_ESCAPE", str(run_root))
    except OSError as exc:
        _fail("PATH_RESOLUTION_ERROR", str(exc))
    if run_root.name != run_id:
        _fail("RUN_ID_PATH_MISMATCH", f"{run_root.name} != {run_id}")
    for key in ("operating_contract", "architecture_contract", "semantic_manifest"):
        _binding_shape(expected.get(key), f"expected.{key}")
        if expected[key] != controls["bundle"][key]:
            _fail("EXPECTED_CONTROL_BINDING_DRIFT", key)
    _canon(expected)
    return {
        "run_id": run_id, "command": command, "scheduled_rows": rows,
        "evidence_root": evidence_root,
        "operating_contract": expected["operating_contract"],
        "architecture_contract": expected["architecture_contract"],
        "semantic_manifest": expected["semantic_manifest"],
    }


def _selected_rows(command: str, controls: dict[str, _Any]) -> list[dict[str, _Any]]:
    cells = controls["cells"]
    if command == "run-canary":
        cell_index = controls["schedule"].index(controls["canary"])
        cells = [controls["cells"][cell_index]]
    return [
        {"ordinal": ordinal, "slot": route["slot"], "route": route,
         "index": cell["index"], "cell": cell["cell"]}
        for ordinal, (route, cell) in enumerate(
            (route, cell) for route in controls["routes"] for cell in cells
        )
    ]


def _load_run(run_root: _Path, expectation: dict[str, _Any], controls: dict[str, _Any]) -> tuple[bytes, dict[str, _Any], list[dict[str, _Any]]]:
    run_bytes, run = _json_object(run_root / "run.json", "run manifest", True)
    _exact_keys(run, _RUN_KEYS, "run manifest")
    command = expectation["command"]
    mode = "synthetic" if command == "simulate" else "actual"
    qualification = "EXTERNAL_ADJUDICATION_ONLY" if command == "run-matrix" else 0
    if (
        run.get("schema_id"), run.get("run_id"), run.get("command"), run.get("mode"),
        run.get("qualification_credit"), run.get("required_checkpoint"),
        run.get("ordering"), run.get("scheduled_rows"), run.get("attempts_per_row"),
        run.get("retry_count"), run.get("best_of"), run.get("replacement_result"),
        run.get("resume")
    ) != (
        "pw-r9-run-v1", expectation["run_id"], command, mode, qualification,
        controls["checkpoint"], "slot-major", expectation["scheduled_rows"], 1,
        0, False, False, False,
    ):
        _fail("RUN_MANIFEST_CONTRACT_MISMATCH", "fixed run fields")
    if mode == "synthetic":
        if not isinstance(run.get("scenario"), str) or not run["scenario"]:
            _fail("SYNTHETIC_SCENARIO_MISSING", "run.scenario")
    elif run.get("scenario") is not None:
        _fail("ACTUAL_SCENARIO_FORBIDDEN", "run.scenario")
    for key in ("operating_contract", "architecture_contract", "semantic_manifest"):
        if run.get(key) != controls["bundle"][key] or run.get(key) != expectation[key]:
            _fail("RUN_CONTROL_BINDING_DRIFT", key)
    rows = run.get("rows")
    selected = _selected_rows(command, controls)
    if not isinstance(rows, list) or len(rows) != len(selected):
        _fail("RUN_ROW_COUNT_MISMATCH", "run.rows")
    seen_nonces: set[str] = set()
    normalized: list[dict[str, _Any]] = []
    for index, (row, base) in enumerate(zip(rows, selected)):
        if not isinstance(row, dict):
            _fail("RUN_ROW_OBJECT_REQUIRED", str(index))
        _exact_keys(row, _ROW_KEYS, f"run.rows[{index}]")
        nonce = _name(row.get("nonce"), f"run.rows[{index}].nonce")
        if not _HEX64.fullmatch(nonce):
            _fail("RUN_NONCE_FORMAT", f"run.rows[{index}].nonce")
        if row.get("ordinal") != base["ordinal"] or any(row.get(key) != base[key] for key in ("slot", "route", "index", "cell")):
            _fail("RUN_ROW_SCHEDULE_MISMATCH", str(index))
        if nonce in seen_nonces:
            _fail("DUPLICATE_RUN_NONCE", nonce)
        seen_nonces.add(nonce)
        normalized.append(row)
    _canon(run)
    return run_bytes, run, normalized


def _row_path(run_root: _Path, row: dict[str, _Any]) -> _Path:
    return run_root / "cells" / row["slot"] / f"{row['index']:03d}_{row['cell']}"


def _score(result: dict[str, _Any], expected_output: _Any) -> dict[str, _Any]:
    wanted = _canon(expected_output) + b"\n"
    actual = _utf8(result.get("stdout_utf8"), "backend_result.stdout_utf8")
    # Parsing is deliberately independent of the equality decision. Malformed,
    # duplicate-key, noncanonical, or wrong-schema output deterministically FAILs.
    try:
        if actual.endswith(b"\n") and not actual.endswith(b"\n\n") and b"\r" not in actual:
            parsed = _json_module.loads(
                actual[:-1].decode("utf-8"), object_pairs_hook=_pairs,
                parse_constant=_constant,
            )
            parsed_canonical = actual == _canon(parsed) + b"\n"
        else:
            parsed_canonical = False
    except (UnicodeDecodeError, _json_module.JSONDecodeError, _Invalid):
        parsed_canonical = False
    if result["returncode"] != 0:
        verdict, reason = "FAIL", "NONZERO_EXIT"
    elif actual != wanted or not parsed_canonical:
        verdict, reason = "FAIL", "EXACT_OUTPUT_MISMATCH"
    else:
        verdict, reason = "PASS", "EXACT_CANONICAL_OUTPUT_MATCH"
    return {
        "rule": "EXACT_CANONICAL_JSON_PLUS_ONE_LF", "verdict": verdict,
        "reason": reason, "expected_sha256": _sha(wanted),
        "expected_bytes": len(wanted), "actual_sha256": _sha(actual),
        "actual_bytes": len(actual), "returncode": result["returncode"],
    }


def _backend_result(
    value: _Any, run: dict[str, _Any], row: dict[str, _Any], provider: bytes,
    expected_output: _Any,
) -> dict[str, _Any]:
    if not isinstance(value, dict) or not _BACKEND_REQUIRED.issubset(value):
        _fail("BACKEND_RESULT_SHAPE", str(row["ordinal"]))
    if (
        value.get("schema_id"), value.get("mode"), value.get("terminal"),
        value.get("nonce"), value.get("resolved_route"),
        value.get("provider_input_sha256"), value.get("provider_input_bytes"),
        value.get("dispatch_count"), value.get("retry_count"),
        value.get("best_of"), value.get("replacement_result")
    ) != (
        "pw-r9-backend-result-v1", run["mode"], True, row["nonce"], row["route"],
        _sha(provider), len(provider), 1, 0, False, False,
    ):
        _fail("BACKEND_RESULT_BINDING", str(row["ordinal"]))
    for key in ("task_id", "thread_id", "turn_id"):
        if not isinstance(value.get(key), str) or not value[key]:
            _fail("BACKEND_IDENTITY_MISSING", f"{row['ordinal']}:{key}")
    if run["mode"] == "actual" and value["task_id"] != f"codex-task:{value['thread_id']}":
        _fail("DERIVED_TASK_ID_MISMATCH", str(row["ordinal"]))
    _integer(value.get("returncode"), f"row[{row['ordinal']}].returncode")
    _utf8(value.get("stdout_utf8"), f"row[{row['ordinal']}].stdout_utf8")
    _utf8(value.get("stderr_utf8"), f"row[{row['ordinal']}].stderr_utf8")
    process = value.get("process")
    required_process = {"kind", "pid", "started_utc", "ended_utc", "terminal_reason"}
    if not isinstance(process, dict) or not required_process.issubset(process):
        _fail("BACKEND_PROCESS_SHAPE", str(row["ordinal"]))
    for key in ("kind", "started_utc", "ended_utc", "terminal_reason"):
        if not isinstance(process.get(key), str) or not process[key]:
            _fail("BACKEND_PROCESS_FIELD", f"{row['ordinal']}:{key}")
    pid = process.get("pid")
    if pid is not None:
        _integer(pid, f"row[{row['ordinal']}].process.pid")
    _validate_rich_backend_evidence(value, run, row, provider, expected_output)
    _canon(value)
    return value


def _validate_rich_backend_evidence(
    result: dict[str, _Any], run: dict[str, _Any], row: dict[str, _Any], provider: bytes,
    expected_output: _Any,
) -> None:
    """Validate optional transport evidence when the backend publishes it."""
    rich_keys = {
        "terminal_status", "first_attempt", "fresh_context",
        "provider_model_fallback_allowed", "task_identity_basis",
        "task_identity_kind", "identity_limitation", "output_capture",
        "prohibited_activity_observations", "rollout",
    }
    present = rich_keys & set(result)
    if present and present != rich_keys:
        _fail("PARTIAL_RICH_BACKEND_EVIDENCE", f"row {row['ordinal']}: {sorted(rich_keys - present)}")
    if not present:
        return
    if (
        result["first_attempt"], result["fresh_context"],
        result["provider_model_fallback_allowed"]
    ) != (True, True, False):
        _fail("BACKEND_ADMISSION_METADATA", str(row["ordinal"]))
    if not isinstance(result["terminal_status"], str) or not result["terminal_status"]:
        _fail("BACKEND_TERMINAL_STATUS", str(row["ordinal"]))
    if run["mode"] == "actual":
        if (
            result["task_identity_basis"], result["task_identity_kind"]
        ) != ("derived_from_fresh_thread_id", "DERIVED_FROM_FRESH_THREAD_ID"):
            _fail("ACTUAL_TASK_IDENTITY_BASIS", str(row["ordinal"]))
        if not isinstance(result["identity_limitation"], str) or not result["identity_limitation"]:
            _fail("ACTUAL_IDENTITY_LIMITATION_MISSING", str(row["ordinal"]))
    else:
        if (
            result["task_identity_basis"], result["task_identity_kind"],
            result["identity_limitation"]
        ) != ("synthetic_nonce_bound_distinct_identities", "SYNTHETIC_DISTINCT_IDENTITY", None):
            _fail("SYNTHETIC_TASK_IDENTITY_BASIS", str(row["ordinal"]))

    output = result["output_capture"]
    if not isinstance(output, dict) or not {"status", "sha256", "bytes"}.issubset(output):
        _fail("OUTPUT_CAPTURE_SHAPE", str(row["ordinal"]))
    stdout = _utf8(result["stdout_utf8"], f"row[{row['ordinal']}].stdout_utf8")
    if (output.get("sha256"), output.get("bytes")) != (_sha(stdout), len(stdout)):
        _fail("OUTPUT_CAPTURE_BINDING", str(row["ordinal"]))

    prohibited = result["prohibited_activity_observations"]
    prohibited_keys = {"present", "item_count", "item_types", "items", "items_sha256", "items_bytes"}
    if not isinstance(prohibited, dict) or set(prohibited) != prohibited_keys:
        _fail("PROHIBITED_ACTIVITY_SHAPE", str(row["ordinal"]))
    items = prohibited.get("items")
    item_types = prohibited.get("item_types")
    if not isinstance(items, list) or not isinstance(item_types, list):
        _fail("PROHIBITED_ACTIVITY_LISTS", str(row["ordinal"]))
    item_storage = _backend_canon(items)
    if (
        prohibited.get("present"), prohibited.get("item_count"),
        prohibited.get("items_sha256"), prohibited.get("items_bytes")
    ) != (bool(items), len(items), _sha(item_storage), len(item_storage)):
        _fail("PROHIBITED_ACTIVITY_BINDING", str(row["ordinal"]))
    if len(item_types) != len(items) or not all(isinstance(item, str) for item in item_types):
        _fail("PROHIBITED_ACTIVITY_TYPES", str(row["ordinal"]))

    rollout = result["rollout"]
    if not isinstance(rollout, dict) or not {"kind", "storage_sha256", "storage_bytes", "task_started", "task_complete"}.issubset(rollout):
        _fail("ROLLOUT_EVIDENCE_SHAPE", str(row["ordinal"]))
    for event_name in ("task_started", "task_complete"):
        event = rollout.get(event_name)
        if event is not None and (not isinstance(event, dict) or event.get("turn_id") != result["turn_id"]):
            _fail("ROLLOUT_EVENT_BINDING", f"{row['ordinal']}:{event_name}")
    process = result["process"]
    if "task_terminal" in process and process["task_terminal"] != rollout.get("task_complete"):
        _fail("PROCESS_ROLLOUT_TERMINAL_BINDING", str(row["ordinal"]))
    if "poll_count" in process:
        poll_count = _integer(process.get("poll_count"), f"row[{row['ordinal']}].poll_count", 1)
        polls = process.get("polls")
        if not isinstance(polls, list) or len(polls) != poll_count:
            _fail("PROCESS_POLL_ACCOUNTING", str(row["ordinal"]))
        for poll_index, poll in enumerate(polls):
            if not isinstance(poll, dict) or poll.get("poll_index") != poll_index:
                _fail("PROCESS_POLL_ORDER", f"{row['ordinal']}:{poll_index}")

    # A deterministically passing response must carry the strongest transport
    # attestations. The caller independently recomputes and binds the score.
    is_pass = result["returncode"] == 0 and stdout == _canon(expected_output) + b"\n"
    if is_pass:
        if prohibited != {
            "present": False, "item_count": 0, "item_types": [], "items": [],
            "items_sha256": _sha(b"[]"), "items_bytes": 2,
        }:
            _fail("PASS_PROHIBITED_ACTIVITY", str(row["ordinal"]))
        if result["terminal_status"] != "TASK_COMPLETE":
            _fail("PASS_TERMINAL_STATUS", str(row["ordinal"]))
        if process.get("task_complete_observed") is not True or process.get("child_reaped") is not True:
            _fail("PASS_PROCESS_TERMINAL_METADATA", str(row["ordinal"]))
        if run["mode"] == "actual":
            _validate_actual_rollout_attestation(result, row, provider)


def _validate_actual_rollout_attestation(
    result: dict[str, _Any], row: dict[str, _Any], provider: bytes,
) -> None:
    rollout = result["rollout"]
    if rollout.get("kind") != "codex-session-jsonl":
        _fail("ACTUAL_ROLLOUT_KIND", str(row["ordinal"]))
    digest = rollout.get("storage_sha256")
    size = rollout.get("storage_bytes")
    if not isinstance(digest, str) or not _HEX64.fullmatch(digest):
        _fail("ACTUAL_ROLLOUT_HASH", str(row["ordinal"]))
    _integer(size, f"row[{row['ordinal']}].rollout.storage_bytes", 1)
    session = rollout.get("session_meta")
    turn = rollout.get("turn_context")
    provider_message = rollout.get("provider_input_message")
    finals = rollout.get("assistant_final_messages")
    if not isinstance(session, dict) or session.get("model_provider") != "openai":
        _fail("ACTUAL_PROVIDER_ATTESTATION", str(row["ordinal"]))
    if not isinstance(turn, dict) or (
        turn.get("turn_id"), turn.get("model"), turn.get("effort")
    ) != (result["turn_id"], row["route"]["model"], row["route"]["thinking"]):
        _fail("ACTUAL_ROUTE_ATTESTATION", str(row["ordinal"]))
    if not isinstance(provider_message, dict):
        _fail("ACTUAL_PROVIDER_MESSAGE_MISSING", str(row["ordinal"]))
    content = provider_message.get("content")
    if (
        not isinstance(content, list) or len(content) != 1
        or not isinstance(content[0], dict) or content[0].get("text") != provider.decode("utf-8")
    ):
        _fail("ACTUAL_PROVIDER_MESSAGE_DRIFT", str(row["ordinal"]))
    if not isinstance(finals, list) or len(finals) != 1 or not isinstance(finals[0], dict):
        _fail("ACTUAL_FINAL_MESSAGE_CARDINALITY", str(row["ordinal"]))
    final_content = finals[0].get("content")
    if (
        not isinstance(final_content, list) or len(final_content) != 1
        or not isinstance(final_content[0], dict)
        or final_content[0].get("type") != "output_text"
        or not isinstance(final_content[0].get("text"), str)
    ):
        _fail("ACTUAL_FINAL_MESSAGE_SHAPE", str(row["ordinal"]))
    raw_text = final_content[0]["text"]
    admitted = raw_text if raw_text.endswith("\n") else raw_text + "\n"
    if admitted != result["stdout_utf8"]:
        _fail("ACTUAL_FINAL_MESSAGE_OUTPUT_BINDING", str(row["ordinal"]))
    output = result["output_capture"]
    raw_bytes = raw_text.encode("utf-8")
    if (
        output.get("status"), output.get("assistant_final_message_count"),
        output.get("raw_text_sha256"), output.get("raw_text_bytes")
    ) != ("COMPLETE_SINGLE_TEXT", 1, _sha(raw_bytes), len(raw_bytes)):
        _fail("ACTUAL_FINAL_CAPTURE_BINDING", str(row["ordinal"]))


def _validate_row(run_root: _Path, run: dict[str, _Any], row: dict[str, _Any], cell: dict[str, _Any]) -> dict[str, _Any]:
    path = _row_path(run_root, row)
    inventory = _entries(path, f"row {row['ordinal']}")
    wanted_inventory = {
        "provider_input.txt": False, "attempt.json": False,
        "raw_result.json": False, "completion.json": False,
    }
    present = set(inventory)
    if "attempt.json" in present and "completion.json" not in present:
        _fail("PERMANENT_UNSEALED_ATTEMPT", str(row["ordinal"]))
    if inventory != wanted_inventory:
        _fail("ROW_FILE_INVENTORY_MISMATCH", f"row {row['ordinal']}: {sorted(inventory)}")
    render = _regular(path / "provider_input.txt", f"row {row['ordinal']} provider input")
    expected_render = _utf8(cell["render_utf8"], f"cell[{row['index']}].render_utf8")
    if render != expected_render:
        _fail("PROVIDER_INPUT_DRIFT", str(row["ordinal"]))
    provider = render[:-1]
    attempt_bytes, attempt = _json_object(path / "attempt.json", f"row {row['ordinal']} attempt", True)
    _exact_keys(attempt, _ATTEMPT_KEYS, f"row {row['ordinal']} attempt")
    expected_attempt = {
        "schema_id": "pw-r9-attempt-v1", "run_id": run_root.name,
        "slot": row["slot"], "cell": row["cell"], "index": row["index"],
        "route": row["route"], "nonce": row["nonce"],
        "render_storage_sha256": _sha(render), "render_storage_bytes": len(render),
        "provider_input_sha256": _sha(provider), "provider_input_bytes": len(provider),
        "attempt": 1, "retry_count": 0, "best_of": False,
        "replacement_result": False, "no_retry": True, "no_relaunch": True,
    }
    if attempt != expected_attempt:
        _fail("ATTEMPT_BINDING_MISMATCH", str(row["ordinal"]))
    raw_bytes, raw = _json_object(path / "raw_result.json", f"row {row['ordinal']} raw result", True)
    _exact_keys(raw, _RAW_KEYS, f"row {row['ordinal']} raw result")
    started = _integer(raw.get("dispatch_started_monotonic_ns"), f"row[{row['ordinal']}].dispatch_started", 0)
    ended = _integer(raw.get("dispatch_ended_monotonic_ns"), f"row[{row['ordinal']}].dispatch_ended", 0)
    if ended < started:
        _fail("DISPATCH_TIME_REVERSED", str(row["ordinal"]))
    if (
        raw.get("schema_id"), raw.get("run_id"), raw.get("slot"),
        raw.get("cell"), raw.get("index"), raw.get("attempt_sha256"),
        raw.get("attempt_bytes")
    ) != (
        "pw-r9-raw-result-v1", run_root.name, row["slot"], row["cell"],
        row["index"], _sha(attempt_bytes), len(attempt_bytes),
    ):
        _fail("RAW_RESULT_BINDING_MISMATCH", str(row["ordinal"]))
    result = _backend_result(
        raw.get("backend_result"), run, row, provider, cell["expected_output"],
    )
    score = _score(result, cell["expected_output"])
    completion_bytes, completion = _json_object(
        path / "completion.json", f"row {row['ordinal']} completion", True,
    )
    _exact_keys(completion, _COMPLETION_KEYS, f"row {row['ordinal']} completion")
    expected_completion = {
        "schema_id": "pw-r9-completion-v1", "run_id": run_root.name,
        "slot": row["slot"], "cell": row["cell"], "index": row["index"],
        "route": row["route"], "nonce": row["nonce"],
        "task_id": result["task_id"], "thread_id": result["thread_id"],
        "turn_id": result["turn_id"], "render_storage_sha256": _sha(render),
        "render_storage_bytes": len(render), "provider_input_sha256": _sha(provider),
        "provider_input_bytes": len(provider), "attempt_sha256": _sha(attempt_bytes),
        "attempt_bytes": len(attempt_bytes), "raw_result_sha256": _sha(raw_bytes),
        "raw_result_bytes": len(raw_bytes), "score": score,
        "status": score["verdict"], "attempt": 1, "retry_count": 0,
        "best_of": False, "replacement_result": False,
        "completion_is_last_row_write": True,
    }
    if completion != expected_completion:
        _fail("COMPLETION_BINDING_MISMATCH", str(row["ordinal"]))
    return {
        "ordinal": row["ordinal"], "slot": row["slot"], "cell": row["cell"],
        "index": row["index"], "status": score["verdict"], "nonce": row["nonce"],
        "task_id": result["task_id"], "thread_id": result["thread_id"],
        "turn_id": result["turn_id"], "completion_sha256": _sha(completion_bytes),
        "completion_bytes": len(completion_bytes),
    }


def _validate_inventory_and_rows(run_root: _Path, run: dict[str, _Any], rows: list[dict[str, _Any]], controls: dict[str, _Any]) -> list[dict[str, _Any]]:
    root_inventory = _entries(run_root, "run root")
    if root_inventory != {
        "run.json": False, "cells": True, "terminals": True,
        "matrix_terminal.json": False, "accounting.json": False,
    }:
        _fail("RUN_ROOT_INVENTORY_MISMATCH", str(sorted(root_inventory)))
    cells_inventory = _entries(run_root / "cells", "cells root")
    expected_by_path = {
        (row["slot"], f"{row['index']:03d}_{row['cell']}"): row for row in rows
    }
    present_rows: dict[int, dict[str, _Any]] = {}
    for slot, is_dir in cells_inventory.items():
        if not is_dir or slot not in {route["slot"] for route in controls["routes"]}:
            _fail("UNEXPECTED_SLOT_PATH", slot)
        slot_inventory = _entries(run_root / "cells" / slot, f"slot {slot}")
        if not slot_inventory:
            _fail("EMPTY_SLOT_DIRECTORY", slot)
        for dirname, row_is_dir in slot_inventory.items():
            if not row_is_dir or (slot, dirname) not in expected_by_path:
                _fail("UNEXPECTED_ROW_PATH", f"{slot}/{dirname}")
            row = expected_by_path[(slot, dirname)]
            if row["ordinal"] in present_rows:
                _fail("DUPLICATE_ROW_PATH", str(row["ordinal"]))
            present_rows[row["ordinal"]] = row
    ordinals = sorted(present_rows)
    if ordinals != list(range(len(ordinals))):
        _fail("NONPREFIX_ROW_EVIDENCE", str(ordinals[:20]))
    completed: list[dict[str, _Any]] = []
    for ordinal in ordinals:
        row = present_rows[ordinal]
        completed.append(_validate_row(run_root, run, row, controls["cells"][row["index"]]))
    return completed


def _validate_terminals(run_root: _Path, rows: list[dict[str, _Any]], completed: list[dict[str, _Any]], controls: dict[str, _Any]) -> tuple[dict[str, _Any], dict[str, _Any]]:
    terminals_inventory = _entries(run_root / "terminals", "terminals root")
    expected_names = {f"{route['slot']}.json": False for route in controls["routes"]}
    if terminals_inventory != expected_names:
        _fail("PATH_TERMINAL_INVENTORY_MISMATCH", str(sorted(terminals_inventory)))
    complete_by_ordinal = {item["ordinal"]: item for item in completed}
    path_records: list[dict[str, _Any]] = []
    path_ids: list[dict[str, _Any]] = []
    for route in controls["routes"]:
        slot = route["slot"]
        scheduled = [row for row in rows if row["slot"] == slot]
        slot_complete = [complete_by_ordinal[row["ordinal"]] for row in scheduled if row["ordinal"] in complete_by_ordinal]
        passed = sum(item["status"] == "PASS" for item in slot_complete)
        failed = sum(item["status"] == "FAIL" for item in slot_complete)
        unstarted = [row["ordinal"] for row in scheduled if row["ordinal"] not in complete_by_ordinal]
        status = "INCOMPLETE" if len(slot_complete) != len(scheduled) else "VALID_SUBJECT_FAIL" if failed else "PASS"
        inventory = _canon(slot_complete)
        expected_path = {
            "schema_id": "pw-r9-path-terminal-v1", "run_id": run_root.name,
            "slot": slot, "status": status, "scheduled_rows": len(scheduled),
            "completed_rows": len(slot_complete), "pass_rows": passed,
            "subject_fail_rows": failed, "invalid_rows": [],
            "unstarted_ordinals": unstarted,
            "completion_inventory_sha256": _sha(inventory),
            "completion_inventory_bytes": len(inventory),
        }
        storage, actual_path = _json_object(
            run_root / "terminals" / f"{slot}.json", f"path terminal {slot}", True,
        )
        _exact_keys(actual_path, _PATH_TERMINAL_KEYS, f"path terminal {slot}")
        if actual_path != expected_path:
            _fail("PATH_TERMINAL_MISMATCH", slot)
        path_records.append(expected_path)
        path_ids.append({"slot": slot, "sha256": _sha(storage), "bytes": len(storage)})
    scheduled_count = len(rows)
    completed_count = len(completed)
    passed_count = sum(item["status"] == "PASS" for item in completed)
    failed_count = sum(item["status"] == "FAIL" for item in completed)
    complete_run = completed_count == scheduled_count
    matrix_status = "VALID_SUBJECT_FAIL" if complete_run and failed_count else "PASS" if complete_run else "CONTROLLER_INVALID"
    matrix_cause = None if complete_run else "STOP_REQUESTED_AFTER_DRAIN"
    expected_matrix = {
        "schema_id": "pw-r9-matrix-terminal-v1", "run_id": run_root.name,
        "status": matrix_status, "cause": matrix_cause,
        "scheduled_rows": scheduled_count, "completed_rows": completed_count,
        "pass_rows": passed_count, "subject_fail_rows": failed_count,
        "invalid_rows": 0, "path_terminals": path_ids, "retry_count": 0,
        "best_of": False, "replacement_result": False,
    }
    matrix_bytes, matrix = _json_object(run_root / "matrix_terminal.json", "matrix terminal", True)
    _exact_keys(matrix, _MATRIX_KEYS, "matrix terminal")
    if matrix != expected_matrix:
        _fail("MATRIX_TERMINAL_MISMATCH", "matrix terminal")
    expected_accounting = {
        "schema_id": "pw-r9-accounting-v1", "run_id": run_root.name,
        "status": matrix_status, "matrix_terminal_sha256": _sha(matrix_bytes),
        "matrix_terminal_bytes": len(matrix_bytes), "scheduled_rows": scheduled_count,
        "attempts": completed_count, "captured_raw_results": completed_count,
        "valid_completions": completed_count, "unknown_or_uncaptured_dispatches": 0,
        "retry_count": 0, "best_of": False, "replacement_result": False,
    }
    _, accounting = _json_object(run_root / "accounting.json", "accounting", True)
    _exact_keys(accounting, _ACCOUNTING_KEYS, "accounting")
    if accounting != expected_accounting:
        _fail("ACCOUNTING_MISMATCH", "accounting")
    return matrix, accounting


def _walk_raw_results(cells_root: _Path, label: str) -> list[_Path]:
    if not cells_root.exists() and not cells_root.is_symlink():
        return []
    _directory(cells_root, label)
    found: list[_Path] = []
    pending = [cells_root]
    while pending:
        directory = pending.pop()
        inventory = _entries(directory, label)
        for name, is_dir in inventory.items():
            child = directory / name
            if is_dir:
                pending.append(child)
            elif name == "raw_result.json":
                found.append(child)
    return sorted(found, key=lambda path: path.as_posix())


def _global_identities(evidence_root: _Path) -> tuple[int, int]:
    evidence_inventory = _entries(evidence_root, "evidence root")
    seen: dict[str, str] = {}
    run_count = 0

    def add(value: _Any, location: str) -> None:
        if not isinstance(value, str) or not value:
            _fail("GLOBAL_IDENTITY_MISSING", location)
        previous = seen.get(value)
        if previous is not None:
            _fail("GLOBAL_IDENTITY_COLLISION", f"{value}: {previous} and {location}")
        seen[value] = location

    for run_name, is_dir in sorted(evidence_inventory.items()):
        if not is_dir or not _SAFE_NAME.fullmatch(run_name):
            _fail("EVIDENCE_ROOT_ENTRY_INVALID", run_name)
        sibling = evidence_root / run_name
        _, run = _json_object(sibling / "run.json", f"global run {run_name}", True)
        if run.get("schema_id") != "pw-r9-run-v1" or run.get("run_id") != run_name:
            _fail("GLOBAL_RUN_IDENTITY_MISMATCH", run_name)
        rows = run.get("rows")
        if not isinstance(rows, list):
            _fail("GLOBAL_RUN_ROWS_MISSING", run_name)
        for index, row in enumerate(rows):
            if not isinstance(row, dict):
                _fail("GLOBAL_RUN_ROW_MALFORMED", f"{run_name}:{index}")
            add(row.get("nonce"), f"{run_name}:nonce:{index}")
        for raw_path in _walk_raw_results(sibling / "cells", f"global cells {run_name}"):
            _, raw = _json_object(raw_path, f"global raw result {raw_path}", True)
            backend = raw.get("backend_result")
            if not isinstance(backend, dict):
                _fail("GLOBAL_BACKEND_RESULT_MALFORMED", str(raw_path))
            for key in ("task_id", "thread_id", "turn_id"):
                add(backend.get(key), f"{run_name}:{raw_path.parent.name}:{key}")
        run_count += 1
    return run_count, len(seen)


def verify(run_root: _Path, expected: dict[str, _Any]) -> dict[str, _Any]:
    """Verify one terminal R9 run entirely offline and without persistence."""
    completed_checks: list[str] = []
    run_id = expected.get("run_id") if isinstance(expected, dict) and isinstance(expected.get("run_id"), str) else None
    command = expected.get("command") if isinstance(expected, dict) and isinstance(expected.get("command"), str) else None
    try:
        controls = _load_controls()
        completed_checks.append("semantic_bundle")
        expectation = _validate_expected(run_root, expected, controls)
        completed_checks.append("expected_interface")
        _, run, rows = _load_run(run_root, expectation, controls)
        completed_checks.append("run_manifest")
        completed = _validate_inventory_and_rows(run_root, run, rows, controls)
        completed_checks.extend(("exact_inventory", "row_chains", "schedule_prefix"))
        matrix, accounting = _validate_terminals(run_root, rows, completed, controls)
        completed_checks.extend(("path_terminals", "matrix_terminal", "accounting"))
        prior_run_count, identity_values = _global_identities(expectation["evidence_root"])
        completed_checks.append("global_identity_uniqueness")
        report = {
            "schema_id": "pw-r9-offline-verifier-report-v1", "valid": True,
            "run_id": expectation["run_id"], "command": expectation["command"],
            "matrix_status": matrix["status"], "error": None,
            "checks": {key: True for key in _CHECKS},
            "counts": {
                "scheduled_rows": accounting["scheduled_rows"],
                "completed_rows": matrix["completed_rows"],
                "pass_rows": matrix["pass_rows"],
                "subject_fail_rows": matrix["subject_fail_rows"],
                "unstarted_rows": matrix["scheduled_rows"] - matrix["completed_rows"],
                "evidence_runs_scanned": prior_run_count,
                "globally_unique_identity_values": identity_values,
            },
            "bundle": controls["bundle"],
            "calls": {"provider": 0, "subject": 0, "network": 0},
            "residuals": [
                "No reflection resistance, capability-token confinement, callback confinement, or hostile in-process caller resistance is claimed.",
                "Final bytes and exact chains are verified; historical O_EXCL and fsync system calls are trusted-controller obligations, not reconstructable from a filesystem snapshot.",
            ],
        }
        _canon(report)
        return report
    except _Invalid as exc:
        report = {
            "schema_id": "pw-r9-offline-verifier-report-v1", "valid": False,
            "run_id": run_id, "command": command, "matrix_status": "CONTROLLER_INVALID",
            "error": {"code": exc.code, "detail": exc.detail},
            "checks": {key: key in completed_checks for key in _CHECKS},
            "counts": None, "bundle": None,
            "calls": {"provider": 0, "subject": 0, "network": 0},
            "residuals": [
                "No reflection resistance, capability-token confinement, callback confinement, or hostile in-process caller resistance is claimed.",
            ],
        }
        return report
    except Exception as exc:  # Fail closed without exposing a traceback or mutating evidence.
        report = {
            "schema_id": "pw-r9-offline-verifier-report-v1", "valid": False,
            "run_id": run_id, "command": command, "matrix_status": "CONTROLLER_INVALID",
            "error": {"code": "UNEXPECTED_VERIFIER_ERROR", "detail": f"{type(exc).__name__}: {exc}"},
            "checks": {key: key in completed_checks for key in _CHECKS},
            "counts": None, "bundle": None,
            "calls": {"provider": 0, "subject": 0, "network": 0},
            "residuals": [
                "No reflection resistance, capability-token confinement, callback confinement, or hostile in-process caller resistance is claimed.",
            ],
        }
        return report
