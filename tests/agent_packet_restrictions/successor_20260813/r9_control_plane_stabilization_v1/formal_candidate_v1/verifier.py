#!/usr/bin/env python3
"""Standalone offline verifier for the R9 iteration-002 evidence contract.

The experiment-facing surface is deliberately one pure, read-only function:
``verify(run_root: pathlib.Path, expected: dict) -> dict``.  This module never
imports the controller, backend, simulator, or any predecessor candidate.
"""
from __future__ import annotations

import hashlib as _hashlib
import json as _json
import os as _os
from pathlib import Path as _Path
from pathlib import PurePosixPath as _PurePosixPath
import re as _re
import stat as _stat
import subprocess as _subprocess
import sys as _sys
from typing import Any as _Any

_sys.dont_write_bytecode = True
__all__ = ["verify"]

_ROOT = _Path(__file__).resolve().parent
_SUCCESSOR = _ROOT.parents[1]
_REPO = _ROOT.parents[4]
_OPERATING = _SUCCESSOR / "r9_goal_operating_contract_v1.json"
_SEMANTIC = _ROOT / "semantic_manifest.json"
_PIPELINE = _ROOT / "pipeline_contract.json"
_ROUTES = _ROOT / "routes.json"
_SCHEDULE = _ROOT / "schedule.json"
_SEMANTIC_RECEIPT = _ROOT / "semantic_inventory_receipt.json"
_RULE = "pw-r9-exact-input-frozen-artifact-v1"
_STAGES = (
    "S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A",
    "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C",
    "S60K", "S70", "S80", "S90",
)
_SAFE_NAME = _re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
_HEX40 = _re.compile(r"[0-9a-f]{40}\Z")
_HEX64 = _re.compile(r"[0-9a-f]{64}\Z")
_CELL_KEYS = {
    "index", "cell", "render_utf8", "render_utf8_sha256",
    "render_utf8_bytes", "expected_output", "expected_output_sha256",
    "expected_output_bytes", "dependency_gate",
    "expected_output_storage_sha256", "expected_output_storage_bytes",
}
_STAGE_KEYS = {
    "index", "stage", "rule", "predecessor_stages",
    "direct_subject_cells", "finalization_boundary", "expected_artifact",
    "expected_artifact_sha256", "expected_artifact_bytes",
    "expected_artifact_storage_sha256", "expected_artifact_storage_bytes",
}
_RUN_KEYS = {
    "schema_id", "operating_contract", "run_id", "run_kind", "mode",
    "scenario", "created_utc", "git_head", "custody_mode", "bundle",
    "semantic_manifest", "pipeline_contract", "routes", "schedule",
    "route_count", "cells_per_route", "planned_call_count", "stage_count",
    "retry_count", "best_of", "replacement_count",
}
_ROW_KEYS = {"ordinal", "slot", "route", "index", "cell", "nonce"}
_REF_KEYS = {"kind", "id", "path", "sha256", "bytes"}
_BINDING_KEYS = {"path", "sha256", "bytes"}
_CHECKS = (
    "expected_interface", "semantic_pipeline_bundle", "run_manifest",
    "custody", "exact_inventory", "causal_dependency_gates",
    "row_chains", "provider_bytes", "backend_terminals",
    "deterministic_scores", "stage_artifacts", "schedule_and_stop_rules",
    "path_terminals", "matrix_terminal", "accounting",
    "global_identity_and_nonce_freshness",
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
        return _json.dumps(
            value, ensure_ascii=False, allow_nan=False, sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        _fail("NOT_CANONICAL_JSONABLE", str(exc))
    raise AssertionError("unreachable")


def _ordered(value: _Any) -> bytes:
    """Canonical minified bytes where the declared semantic key order matters."""
    try:
        return _json.dumps(
            value, ensure_ascii=False, allow_nan=False, separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        _fail("NOT_ORDERED_JSONABLE", str(exc))
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


def _integer(value: _Any, label: str, minimum: int | None = None) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        _fail("INTEGER_REQUIRED", label)
    if minimum is not None and value < minimum:
        _fail("INTEGER_RANGE", label)
    return value


def _string(value: _Any, label: str, nonempty: bool = True) -> str:
    if not isinstance(value, str) or (nonempty and not value):
        _fail("STRING_REQUIRED", label)
    return value


def _name(value: _Any, label: str) -> str:
    text = _string(value, label)
    if not _SAFE_NAME.fullmatch(text):
        _fail("UNSAFE_NAME", label)
    return text


def _utf8(value: _Any, label: str) -> bytes:
    text = _string(value, label, False)
    try:
        return text.encode("utf-8")
    except UnicodeEncodeError as exc:
        _fail("INVALID_UTF8_STRING", f"{label}: {exc}")
    raise AssertionError("unreachable")


def _exact_keys(value: _Any, keys: set[str], label: str) -> dict[str, _Any]:
    if not isinstance(value, dict):
        _fail("OBJECT_REQUIRED", label)
    if set(value) != keys:
        _fail(
            "OBJECT_SHAPE_MISMATCH",
            f"{label}: missing={sorted(keys - set(value))}, extra={sorted(set(value) - keys)}",
        )
    return value


def _safe_relative(value: _Any, label: str) -> _PurePosixPath:
    text = _string(value, label)
    if "\\" in text:
        _fail("UNSAFE_RELATIVE_PATH", label)
    pure = _PurePosixPath(text)
    if pure.is_absolute() or pure.as_posix() != text or any(
        part in {"", ".", ".."} for part in pure.parts
    ):
        _fail("UNSAFE_RELATIVE_PATH", label)
    return pure


def _lstat(path: _Path, label: str) -> _os.stat_result:
    try:
        return _os.lstat(path)
    except (FileNotFoundError, NotADirectoryError):
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
    if not _stat.S_ISDIR(_lstat(path, label).st_mode):
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


def _json_object(
    path: _Path, label: str, *, canonical: bool,
) -> tuple[bytes, dict[str, _Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        _fail("JSON_STORAGE_FORMAT", f"{label}: one terminal LF and no CR required")
    try:
        value = _json.loads(
            storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
            parse_constant=_constant,
        )
    except (UnicodeDecodeError, _json.JSONDecodeError) as exc:
        _fail("INVALID_JSON", f"{label}: {exc}")
    if not isinstance(value, dict):
        _fail("JSON_OBJECT_REQUIRED", label)
    if canonical and storage != _canon(value) + b"\n":
        _fail("NONCANONICAL_JSON", label)
    return storage, value


def _binding(path: _Path, storage: bytes, base: _Path = _SUCCESSOR) -> dict[str, _Any]:
    try:
        relative = path.relative_to(base).as_posix()
    except ValueError:
        _fail("BINDING_OUTSIDE_BASE", str(path))
    return {"path": relative, "sha256": _sha(storage), "bytes": len(storage)}


def _binding_shape(value: _Any, label: str) -> dict[str, _Any]:
    result = _exact_keys(value, _BINDING_KEYS, label)
    _safe_relative(result.get("path"), f"{label}.path")
    digest = _string(result.get("sha256"), f"{label}.sha256")
    if not _HEX64.fullmatch(digest):
        _fail("BINDING_HASH_FORMAT", label)
    _integer(result.get("bytes"), f"{label}.bytes", 0)
    return result


def _resolve_successor_binding(value: _Any, label: str) -> tuple[_Path, bytes]:
    binding = _binding_shape(value, label)
    pure = _safe_relative(binding["path"], f"{label}.path")
    path = _SUCCESSOR.joinpath(*pure.parts)
    storage = _regular(path, label)
    if (binding["sha256"], binding["bytes"]) != (_sha(storage), len(storage)):
        _fail("BINDING_DRIFT", label)
    return path, storage


def _manifest_source(pure: _PurePosixPath) -> bytes:
    path = _SUCCESSOR
    for part in pure.parts[:-1]:
        path = path / part
        _directory(path, f"semantic source parent {pure}")
    return _regular(_SUCCESSOR.joinpath(*pure.parts), f"semantic source {pure}")


def _validate_route(value: _Any, label: str) -> dict[str, str]:
    route = _exact_keys(value, {"slot", "model", "thinking"}, label)
    return {
        "slot": _name(route.get("slot"), f"{label}.slot"),
        "model": _name(route.get("model"), f"{label}.model"),
        "thinking": _name(route.get("thinking"), f"{label}.thinking"),
    }


def _load_semantic() -> dict[str, _Any]:
    operating_bytes, operating = _json_object(_OPERATING, "operating contract", canonical=False)
    if operating.get("schema_id") != "pw-r9-goal-operating-contract-v1":
        _fail("OPERATING_SCHEMA_MISMATCH", str(operating.get("schema_id")))

    semantic_bytes, semantic = _json_object(_SEMANTIC, "semantic manifest", canonical=False)
    if semantic_bytes != _ordered(semantic) + b"\n":
        _fail("NONCANONICAL_ORDERED_JSON", "semantic manifest")
    _exact_keys(
        semantic,
        {"schema_id", "routes", "schedule", "canary_cell", "stage_order",
         "cells", "deterministic_stages", "files"},
        "semantic manifest",
    )
    if semantic.get("schema_id") != "pw-r9-semantic-manifest-v2":
        _fail("SEMANTIC_SCHEMA_MISMATCH", str(semantic.get("schema_id")))

    raw_routes = semantic.get("routes")
    if not isinstance(raw_routes, list) or len(raw_routes) != 3:
        _fail("ROUTE_COUNT_MISMATCH", "exactly three routes required")
    routes = [_validate_route(value, f"routes[{index}]") for index, value in enumerate(raw_routes)]
    slots = [route["slot"] for route in routes]
    if len(set(slots)) != 3:
        _fail("DUPLICATE_ROUTE_SLOT", str(slots))

    raw_schedule = semantic.get("schedule")
    if not isinstance(raw_schedule, list) or len(raw_schedule) != 97:
        _fail("SEMANTIC_SCHEDULE_COUNT", "exactly 97 cells required")
    schedule = [_name(value, f"schedule[{index}]") for index, value in enumerate(raw_schedule)]
    if len(set(schedule)) != 97:
        _fail("DUPLICATE_CELL", "semantic schedule")
    canary = _name(semantic.get("canary_cell"), "canary_cell")
    if canary not in schedule:
        _fail("CANARY_CELL_MISSING", canary)

    raw_stage_order = semantic.get("stage_order")
    if raw_stage_order != list(_STAGES):
        _fail("STAGE_ORDER_MISMATCH", str(raw_stage_order))

    raw_cells = semantic.get("cells")
    if not isinstance(raw_cells, list) or len(raw_cells) != 97:
        _fail("CELL_COUNT_MISMATCH", "semantic cells")
    cells: list[dict[str, _Any]] = []
    cells_by_name: dict[str, dict[str, _Any]] = {}
    for index, raw in enumerate(raw_cells):
        cell = _exact_keys(raw, _CELL_KEYS, f"cells[{index}]")
        if (cell.get("index"), cell.get("cell")) != (index, schedule[index]):
            _fail("CELL_ORDER_MISMATCH", str(index))
        render = _utf8(cell.get("render_utf8"), f"cells[{index}].render_utf8")
        if not render.endswith(b"\n") or render.endswith(b"\n\n") or b"\r" in render:
            _fail("RENDER_STORAGE_FORMAT", str(index))
        payload = render[:-1]
        expected_payload = _ordered(cell.get("expected_output"))
        expected_storage = expected_payload + b"\n"
        if (
            cell.get("render_utf8_sha256"), cell.get("render_utf8_bytes"),
            cell.get("expected_output_sha256"), cell.get("expected_output_bytes"),
            cell.get("expected_output_storage_sha256"),
            cell.get("expected_output_storage_bytes"),
        ) != (
            _sha(render), len(render), _sha(expected_payload), len(expected_payload),
            _sha(expected_storage), len(expected_storage),
        ):
            _fail("CELL_BYTE_BINDING_DRIFT", str(index))
        gate = _exact_keys(
            cell.get("dependency_gate"),
            {"rule", "required_pass_cells", "required_stage_artifacts"},
            f"cells[{index}].dependency_gate",
        )
        if gate.get("rule") != _RULE:
            _fail("CELL_GATE_RULE_MISMATCH", str(index))
        for key in ("required_pass_cells", "required_stage_artifacts"):
            if not isinstance(gate.get(key), list):
                _fail("CELL_GATE_LIST_REQUIRED", f"{index}:{key}")
            if len(gate[key]) != len(set(gate[key])):
                _fail("CELL_GATE_DUPLICATE_REF", f"{index}:{key}")
        cells.append(cell)
        cells_by_name[cell["cell"]] = cell

    raw_stages = semantic.get("deterministic_stages")
    if not isinstance(raw_stages, list) or len(raw_stages) != 18:
        _fail("DETERMINISTIC_STAGE_COUNT", "exactly 18 required")
    stages: list[dict[str, _Any]] = []
    stages_by_name: dict[str, dict[str, _Any]] = {}
    for index, raw in enumerate(raw_stages):
        stage = _exact_keys(raw, _STAGE_KEYS, f"deterministic_stages[{index}]")
        if (stage.get("index"), stage.get("stage"), stage.get("rule")) != (
            index, _STAGES[index], _RULE,
        ):
            _fail("STAGE_IDENTITY_MISMATCH", str(index))
        predecessors = stage.get("predecessor_stages")
        direct = stage.get("direct_subject_cells")
        if not isinstance(predecessors, list) or not isinstance(direct, list):
            _fail("STAGE_INPUT_LIST_REQUIRED", str(index))
        if len(predecessors) != len(set(predecessors)) or len(direct) != len(set(direct)):
            _fail("STAGE_DUPLICATE_INPUT", str(index))
        if any(value not in _STAGES[:index] for value in predecessors):
            _fail("STAGE_PREDECESSOR_ORDER", str(index))
        if any(value not in cells_by_name for value in direct):
            _fail("STAGE_UNKNOWN_DIRECT_CELL", str(index))
        boundary = _exact_keys(
            stage.get("finalization_boundary"),
            {"after_cell_index", "after_cell", "stage_order_index"},
            f"stage[{index}].finalization_boundary",
        )
        boundary_index = _integer(boundary.get("after_cell_index"), f"stage[{index}].boundary", 0)
        if (
            boundary_index >= len(cells)
            or boundary.get("after_cell") != schedule[boundary_index]
            or boundary.get("stage_order_index") != index
            or any(cells_by_name[value]["index"] > boundary_index for value in direct)
        ):
            _fail("STAGE_BOUNDARY_MISMATCH", str(index))
        payload = _ordered(stage.get("expected_artifact"))
        storage = payload + b"\n"
        if (
            stage.get("expected_artifact_sha256"), stage.get("expected_artifact_bytes"),
            stage.get("expected_artifact_storage_sha256"),
            stage.get("expected_artifact_storage_bytes"),
        ) != (_sha(payload), len(payload), _sha(storage), len(storage)):
            _fail("STAGE_ARTIFACT_BINDING_DRIFT", str(index))
        stages.append(stage)
        stages_by_name[stage["stage"]] = stage

    for cell in cells:
        gate = cell["dependency_gate"]
        index = cell["index"]
        if any(value not in cells_by_name or cells_by_name[value]["index"] >= index
               for value in gate["required_pass_cells"]):
            _fail("CELL_GATE_NONPRIOR_CELL", cell["cell"])
        for stage_name in gate["required_stage_artifacts"]:
            stage = stages_by_name.get(stage_name)
            if stage is None or stage["finalization_boundary"]["after_cell_index"] >= index:
                _fail("CELL_GATE_INELIGIBLE_STAGE", f"{cell['cell']}:{stage_name}")

    files = semantic.get("files")
    if not isinstance(files, list) or not files:
        _fail("SEMANTIC_FILE_INVENTORY_MISSING", "files")
    paths: list[str] = []
    for index, raw in enumerate(files):
        binding = _binding_shape(raw, f"semantic files[{index}]")
        pure = _safe_relative(binding["path"], f"semantic files[{index}].path")
        lowered = pure.as_posix().lower()
        if (
            pure.parts[0] == "Plans"
            or "__pycache__" in pure.parts
            or lowered.endswith((".pyc", ".pyo"))
            or _re.search(r"candidate_v(?:1[2-9]|2[01])(?:/|$)", lowered)
        ):
            _fail("FORBIDDEN_SEMANTIC_SOURCE", pure.as_posix())
        data = _manifest_source(pure)
        if (binding["sha256"], binding["bytes"]) != (_sha(data), len(data)):
            _fail("SEMANTIC_SOURCE_BINDING_DRIFT", pure.as_posix())
        paths.append(pure.as_posix())
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        _fail("SEMANTIC_SOURCE_ORDER", "paths must be sorted and unique")

    routes_bytes, routes_file = _json_object(_ROUTES, "routes artifact", canonical=False)
    if routes_bytes != _ordered(routes_file) + b"\n":
        _fail("NONCANONICAL_ORDERED_JSON", "routes artifact")
    if routes_file != {"schema_id": "pw-r9-routes-v1", "routes": routes}:
        _fail("ROUTES_CONTENT_MISMATCH", "routes.json")
    schedule_bytes, schedule_file = _json_object(_SCHEDULE, "schedule artifact", canonical=False)
    if schedule_bytes != _ordered(schedule_file) + b"\n":
        _fail("NONCANONICAL_ORDERED_JSON", "schedule artifact")
    exact_entries = [
        {"index": ordinal, "slot_index": slot_index, "cell_index": cell_index,
         "slot": route["slot"], "model": route["model"],
         "thinking": route["thinking"], "cell": schedule[cell_index]}
        for ordinal, (slot_index, route, cell_index) in enumerate(
            (slot_index, route, cell_index)
            for slot_index, route in enumerate(routes)
            for cell_index in range(len(schedule))
        )
    ]
    if (
        schedule_file.get("schema_id"), schedule_file.get("order"),
        schedule_file.get("route_count"), schedule_file.get("cells_per_route"),
        schedule_file.get("entry_count"), schedule_file.get("entries"),
    ) != ("pw-r9-slot-major-schedule-v1", "slot-major", 3, 97, 291, exact_entries):
        _fail("SCHEDULE_CONTENT_MISMATCH", "schedule.json")
    nonce_rule = schedule_file.get("run_specific_nonce_rule")
    if not isinstance(nonce_rule, dict) or (
        nonce_rule.get("predeclared_in_run_manifest"),
        nonce_rule.get("semantic_manifest_contains_run_specific_nonce"),
    ) != (True, False):
        _fail("SCHEDULE_NONCE_RULE_MISMATCH", "schedule.json")

    pipeline_bytes, pipeline = _json_object(_PIPELINE, "pipeline contract", canonical=False)
    if pipeline.get("schema_id") != "pw-r9-semantic-pipeline-contract-v1":
        _fail("PIPELINE_SCHEMA_MISMATCH", str(pipeline.get("schema_id")))
    if pipeline.get("rule", {}).get("id") != _RULE:
        _fail("PIPELINE_RULE_MISMATCH", "rule.id")
    contract = pipeline.get("manifest_contract")
    if not isinstance(contract, dict) or (
        contract.get("schema_id"), contract.get("route_count"),
        contract.get("cell_count"), contract.get("schedule_entry_count"),
        contract.get("deterministic_stage_count"),
        contract.get("route_local_stage_artifact_count"),
        contract.get("stage_order_is_total"), contract.get("canary_cell"),
        contract.get("canary_dependency_gate_is_empty"),
        contract.get("render_bytes_are_frozen_not_runtime_interpolated"),
        contract.get("expected_outputs_are_exact_closed_oracles"),
        contract.get("runtime_prior_control_imports"),
    ) != (
        "pw-r9-semantic-manifest-v2", 3, 97, 291, 18, 54, True, canary,
        True, True, True, 0,
    ):
        _fail("PIPELINE_MANIFEST_CONTRACT_MISMATCH", "manifest_contract")
    if pipeline.get("execution_requirements", {}).get("no_post_fail_same_slot_dispatch") is not True:
        _fail("PIPELINE_STOP_RULE_MISSING", "no_post_fail_same_slot_dispatch")
    if pipeline.get("execution_requirements", {}).get("no_post_invalid_dispatch") is not True:
        _fail("PIPELINE_STOP_RULE_MISSING", "no_post_invalid_dispatch")
    pipeline_bindings = pipeline.get("bindings")
    if not isinstance(pipeline_bindings, dict):
        _fail("PIPELINE_BINDINGS_MISSING", "bindings")
    binding_targets = {
        "r9_goal_operating_contract": (_OPERATING, _OPERATING.relative_to(_REPO).as_posix()),
        "parent_progress_assessment": (
            _ROOT.parent / "iteration_001" / "progress_assessment.json",
            (_ROOT.parent / "iteration_001" / "progress_assessment.json").relative_to(_REPO).as_posix(),
        ),
        "causal_pipeline_diagnosis": (
            _ROOT.parent / "iteration_001" / "causal_pipeline_diagnosis_v1.json",
            (_ROOT.parent / "iteration_001" / "causal_pipeline_diagnosis_v1.json").relative_to(_REPO).as_posix(),
        ),
        "semantic_manifest": (_SEMANTIC, "semantic_manifest.json"),
        "schedule": (_SCHEDULE, "schedule.json"),
        "routes": (_ROUTES, "routes.json"),
    }
    if set(pipeline_bindings) != set(binding_targets):
        _fail("PIPELINE_BINDING_SET_MISMATCH", str(sorted(pipeline_bindings)))
    for key, (path, expected_path) in binding_targets.items():
        data = _regular(path, f"pipeline binding {key}")
        binding = _binding_shape(pipeline_bindings[key], f"pipeline.bindings.{key}")
        if (
            binding["path"], binding["sha256"], binding["bytes"]
        ) != (expected_path, _sha(data), len(data)):
            _fail("PIPELINE_BINDING_DRIFT", key)

    receipt_bytes, receipt = _json_object(
        _SEMANTIC_RECEIPT, "semantic inventory receipt", canonical=False,
    )
    if receipt.get("schema_id") != "pw-r9-semantic-inventory-receipt-v2":
        _fail("SEMANTIC_RECEIPT_SCHEMA_MISMATCH", str(receipt.get("schema_id")))
    artifacts = receipt.get("artifacts")
    if not isinstance(artifacts, dict):
        _fail("SEMANTIC_RECEIPT_ARTIFACTS_MISSING", "artifacts")
    expected_artifacts = {
        "semantic_manifest.json": {"path": "semantic_manifest.json", "sha256": _sha(semantic_bytes), "bytes": len(semantic_bytes)},
        "pipeline_contract.json": {"path": "pipeline_contract.json", "sha256": _sha(pipeline_bytes), "bytes": len(pipeline_bytes)},
        "schedule.json": {"path": "schedule.json", "sha256": _sha(schedule_bytes), "bytes": len(schedule_bytes)},
        "routes.json": {"path": "routes.json", "sha256": _sha(routes_bytes), "bytes": len(routes_bytes)},
    }
    if artifacts != expected_artifacts:
        _fail("SEMANTIC_RECEIPT_ARTIFACT_DRIFT", "semantic controls")
    if receipt.get("unresolved_semantic_dependencies") != []:
        _fail("UNRESOLVED_SEMANTIC_DEPENDENCY", "semantic inventory receipt")

    return {
        "operating_bytes": operating_bytes,
        "semantic_bytes": semantic_bytes,
        "pipeline_bytes": pipeline_bytes,
        "routes_bytes": routes_bytes,
        "schedule_bytes": schedule_bytes,
        "semantic_receipt_bytes": receipt_bytes,
        "routes": routes,
        "slots": slots,
        "schedule": schedule,
        "cells": cells,
        "cells_by_name": cells_by_name,
        "stages": stages,
        "stages_by_name": stages_by_name,
        "canary": canary,
        "source_file_count": len(files),
        "bindings": {
            "operating_contract": _binding(_OPERATING, operating_bytes, _REPO),
            "semantic_manifest": _binding(_SEMANTIC, semantic_bytes),
            "pipeline_contract": _binding(_PIPELINE, pipeline_bytes),
        },
    }


def _component_paths() -> tuple[_PurePosixPath, ...]:
    iteration = _ROOT.relative_to(_SUCCESSOR).as_posix()
    values = (
        "r9_goal_operating_contract_v1.json",
        f"{iteration}/architecture_contract.json",
        f"{iteration}/backend.py",
        f"{iteration}/backend_contract.json",
        f"{iteration}/controller.py",
        f"{iteration}/fault_scenarios.json",
        f"{iteration}/pipeline_contract.json",
        f"{iteration}/regression_catalog.json",
        f"{iteration}/regression_inventory_receipt.json",
        f"{iteration}/routes.json",
        f"{iteration}/schedule.json",
        f"{iteration}/semantic_inventory_receipt.json",
        f"{iteration}/semantic_manifest.json",
        f"{iteration}/simulator_contract.json",
        f"{iteration}/verifier.py",
        f"{iteration}/verifier_contract.json",
    )
    return tuple(_PurePosixPath(value) for value in sorted(values))


def _component_bundle() -> tuple[dict[str, _Any], dict[str, bytes]]:
    rows: list[dict[str, _Any]] = []
    storages: dict[str, bytes] = {}
    for pure in _component_paths():
        path = _SUCCESSOR.joinpath(*pure.parts)
        storage = _regular(path, f"component bundle {pure}")
        row = {"path": pure.as_posix(), "sha256": _sha(storage), "bytes": len(storage)}
        rows.append(row)
        storages[pure.as_posix()] = storage
    row_bytes = _canon(rows)
    return {
        "file_count": len(rows),
        "aggregate_file_bytes": sum(row["bytes"] for row in rows),
        "rows_sha256": _sha(row_bytes),
        "rows_bytes": len(row_bytes),
        "files": rows,
    }, storages


def _git(*arguments: str) -> bytes:
    try:
        completed = _subprocess.run(
            ["git", "-C", str(_REPO), *arguments],
            stdin=_subprocess.DEVNULL, stdout=_subprocess.PIPE,
            stderr=_subprocess.PIPE, check=False,
        )
    except OSError as exc:
        _fail("GIT_EXECUTION_ERROR", str(exc))
    if completed.returncode != 0:
        detail = completed.stderr.decode("utf-8", errors="replace").strip()
        _fail("GIT_COMMAND_FAILED", f"{' '.join(arguments)}: {detail}")
    return completed.stdout


def _current_head() -> str:
    try:
        head = _git("rev-parse", "HEAD").decode("ascii").strip()
    except UnicodeDecodeError:
        _fail("GIT_HEAD_NOT_ASCII", "HEAD")
    if not _re.fullmatch(r"[0-9a-f]{40,64}", head):
        _fail("GIT_HEAD_FORMAT", head)
    return head


def _validate_custody(
    run: dict[str, _Any], bundle: dict[str, _Any], storages: dict[str, bytes],
) -> None:
    head = _current_head()
    if run.get("git_head") != head:
        _fail("RUN_GIT_HEAD_DRIFT", f"{run.get('git_head')} != {head}")
    if run["mode"] == "synthetic":
        if run.get("custody_mode") != "WORKTREE_EXACT_BUNDLE":
            _fail("SYNTHETIC_CUSTODY_MODE", str(run.get("custody_mode")))
        return
    if run.get("custody_mode") != "GIT_HEAD_PINNED":
        _fail("ACTUAL_CUSTODY_MODE", str(run.get("custody_mode")))
    successor_repo = _SUCCESSOR.relative_to(_REPO)
    for row in bundle["files"]:
        repo_path = (successor_repo / _Path(row["path"])).as_posix()
        blob = _git("show", f"{head}:{repo_path}")
        if blob != storages[row["path"]]:
            _fail("GIT_BUNDLE_BLOB_DRIFT", row["path"])


def _validate_expected(
    run_root: _Path, expected: _Any, controls: dict[str, _Any],
    bundle: dict[str, _Any],
) -> dict[str, _Any]:
    keys = {
        "schema_id", "run_id", "run_kind", "planned_call_count",
        "evidence_root", "operating_contract", "bundle",
        "semantic_manifest", "pipeline_contract",
    }
    value = _exact_keys(expected, keys, "expected")
    if value.get("schema_id") != "pw-r9-verifier-expectation-v2":
        _fail("EXPECTED_SCHEMA_MISMATCH", str(value.get("schema_id")))
    run_id = _name(value.get("run_id"), "expected.run_id")
    run_kind = value.get("run_kind")
    if run_kind not in {"simulate", "run-canary", "run-matrix"}:
        _fail("EXPECTED_RUN_KIND", str(run_kind))
    planned = _integer(value.get("planned_call_count"), "expected.planned_call_count", 0)
    wanted = 3 if run_kind == "run-canary" else 291
    if planned != wanted:
        _fail("EXPECTED_CALL_COUNT", f"{planned} != {wanted}")
    if not isinstance(run_root, _Path) or not run_root.is_absolute():
        _fail("RUN_ROOT_ABSOLUTE_PATH_REQUIRED", str(run_root))
    _directory(run_root, "run root")
    evidence_text = _string(value.get("evidence_root"), "expected.evidence_root")
    evidence_root = _Path(evidence_text)
    if not evidence_root.is_absolute():
        _fail("EVIDENCE_ROOT_ABSOLUTE_REQUIRED", evidence_text)
    _directory(evidence_root, "evidence root")
    try:
        resolved_evidence = evidence_root.resolve(strict=True)
        resolved_run = run_root.resolve(strict=True)
    except OSError as exc:
        _fail("PATH_RESOLUTION_ERROR", str(exc))
    if resolved_run != run_root or resolved_run.parent != resolved_evidence:
        _fail("RUN_ROOT_PARENT_OR_SYMLINK_MISMATCH", str(run_root))
    if run_root.name != run_id:
        _fail("RUN_ID_PATH_MISMATCH", f"{run_root.name} != {run_id}")
    wanted_bindings = controls["bindings"]
    for key in ("operating_contract", "semantic_manifest", "pipeline_contract"):
        _binding_shape(value.get(key), f"expected.{key}")
        if value[key] != wanted_bindings[key]:
            _fail("EXPECTED_CONTROL_BINDING_DRIFT", key)
    if value.get("bundle") != bundle:
        _fail("EXPECTED_COMPONENT_BUNDLE_DRIFT", "bundle")
    _canon(value)
    return {
        "run_id": run_id, "run_kind": run_kind, "planned_call_count": planned,
        "evidence_root": resolved_evidence,
    }


def _selected_schedule(run_kind: str, controls: dict[str, _Any]) -> list[dict[str, _Any]]:
    cells = controls["cells"]
    if run_kind == "run-canary":
        cells = [controls["cells_by_name"][controls["canary"]]]
    return [
        {"ordinal": ordinal, "slot": route["slot"], "route": route,
         "index": cell["index"], "cell": cell["cell"]}
        for ordinal, (route, cell) in enumerate(
            (route, cell) for route in controls["routes"] for cell in cells
        )
    ]


def _load_run(
    run_root: _Path, expectation: dict[str, _Any], controls: dict[str, _Any],
    bundle: dict[str, _Any],
) -> tuple[bytes, dict[str, _Any], list[dict[str, _Any]]]:
    storage, run = _json_object(run_root / "run.json", "run manifest", canonical=True)
    _exact_keys(run, _RUN_KEYS, "run manifest")
    run_kind = expectation["run_kind"]
    mode = "synthetic" if run_kind == "simulate" else "actual"
    scenario = run.get("scenario")
    if mode == "synthetic":
        _string(scenario, "run.scenario")
    elif scenario is not None:
        _fail("ACTUAL_SCENARIO_FORBIDDEN", str(scenario))
    _string(run.get("created_utc"), "run.created_utc")
    head = _string(run.get("git_head"), "run.git_head")
    if not _re.fullmatch(r"[0-9a-f]{40,64}", head):
        _fail("RUN_GIT_HEAD_FORMAT", head)
    cells_per_route = 1 if run_kind == "run-canary" else 97
    if (
        run.get("schema_id"), run.get("operating_contract"), run.get("run_id"),
        run.get("run_kind"), run.get("mode"), run.get("bundle"),
        run.get("semantic_manifest"), run.get("pipeline_contract"),
        run.get("routes"), run.get("route_count"), run.get("cells_per_route"),
        run.get("planned_call_count"), run.get("stage_count"),
        run.get("retry_count"), run.get("best_of"), run.get("replacement_count"),
    ) != (
        "pw-r9-run-v2", controls["bindings"]["operating_contract"],
        expectation["run_id"], run_kind, mode, bundle,
        controls["bindings"]["semantic_manifest"],
        controls["bindings"]["pipeline_contract"], controls["routes"], 3,
        cells_per_route, expectation["planned_call_count"], 18, 0, False, 0,
    ):
        _fail("RUN_MANIFEST_CONTRACT_MISMATCH", "fixed fields")
    rows = run.get("schedule")
    selected = _selected_schedule(run_kind, controls)
    if not isinstance(rows, list) or len(rows) != len(selected):
        _fail("RUN_SCHEDULE_COUNT", str(type(rows).__name__))
    normalized: list[dict[str, _Any]] = []
    nonces: set[str] = set()
    for index, (row, base) in enumerate(zip(rows, selected)):
        current = _exact_keys(row, _ROW_KEYS, f"run.schedule[{index}]")
        nonce = _string(current.get("nonce"), f"run.schedule[{index}].nonce")
        if not _HEX64.fullmatch(nonce) or nonce in nonces:
            _fail("RUN_NONCE_FORMAT_OR_DUPLICATE", str(index))
        if current.get("ordinal") != index or any(
            current.get(key) != base[key] for key in ("slot", "route", "index", "cell")
        ):
            _fail("RUN_SCHEDULE_ORDER_MISMATCH", str(index))
        nonces.add(nonce)
        normalized.append(current)
    return storage, run, normalized


def _row_path(run_root: _Path, row: dict[str, _Any]) -> _Path:
    return run_root / "cells" / row["slot"] / f"{row['index']:03d}_{row['cell']}"


def _artifact_path(run_root: _Path, slot: str, stage: str) -> _Path:
    return run_root / "artifacts" / slot / f"{stage}.json"


def _reference(
    run_root: _Path, path: _Path, storage: bytes, kind: str, identity: str,
) -> dict[str, _Any]:
    try:
        relative = path.relative_to(run_root).as_posix()
    except ValueError:
        _fail("CAUSAL_REFERENCE_ESCAPE", str(path))
    return {
        "kind": kind, "id": identity, "path": relative,
        "sha256": _sha(storage), "bytes": len(storage),
    }


def _score(result: dict[str, _Any], cell: dict[str, _Any]) -> dict[str, _Any]:
    wanted = _ordered(cell["expected_output"]) + b"\n"
    actual = _utf8(result.get("stdout_utf8"), "backend_result.stdout_utf8")
    if result["returncode"] != 0:
        verdict, reason = "FAIL", "NONZERO_AFTER_TASK_COMPLETE"
    elif actual != wanted:
        verdict, reason = "FAIL", "EXACT_OUTPUT_MISMATCH"
    else:
        verdict, reason = "PASS", "EXACT_CANONICAL_OUTPUT_MATCH"
    return {
        "rule": "EXACT_CANONICAL_JSON_PLUS_ONE_LF", "verdict": verdict,
        "reason": reason, "expected_sha256": _sha(wanted),
        "expected_bytes": len(wanted), "actual_sha256": _sha(actual),
        "actual_bytes": len(actual), "returncode": result["returncode"],
    }


def _validate_backend_result(
    value: _Any, run: dict[str, _Any], row: dict[str, _Any], provider: bytes,
) -> dict[str, _Any]:
    required = {
        "schema_id", "mode", "terminal", "nonce", "resolved_route",
        "provider_input_sha256", "provider_input_bytes", "task_id",
        "thread_id", "turn_id", "returncode", "stdout_utf8", "stderr_utf8",
        "process", "dispatch_count", "retry_count", "best_of",
        "replacement_result", "terminal_status", "first_attempt",
        "fresh_context", "provider_model_fallback_allowed",
        "task_identity_basis", "task_identity_kind", "identity_limitation",
        "output_capture", "prohibited_activity_observations", "rollout",
    }
    if not isinstance(value, dict) or set(value) != required:
        _fail("BACKEND_RESULT_SHAPE", str(row["ordinal"]))
    if (
        value.get("schema_id"), value.get("mode"), value.get("terminal"),
        value.get("nonce"), value.get("resolved_route"),
        value.get("provider_input_sha256"), value.get("provider_input_bytes"),
        value.get("terminal_status"), value.get("dispatch_count"),
        value.get("retry_count"), value.get("best_of"),
        value.get("replacement_result"), value.get("first_attempt"),
        value.get("fresh_context"), value.get("provider_model_fallback_allowed"),
    ) != (
        "pw-r9-backend-result-v1", run["mode"], True, row["nonce"],
        row["route"], _sha(provider), len(provider), "TASK_COMPLETE", 1, 0,
        False, False, True, True, False,
    ):
        _fail("BACKEND_RESULT_BINDING", str(row["ordinal"]))
    identities: list[str] = []
    for key in ("task_id", "thread_id", "turn_id"):
        identities.append(_string(value.get(key), f"row[{row['ordinal']}].{key}"))
    if len(set(identities)) != 3:
        _fail("BACKEND_ROW_IDENTITY_COLLISION", str(row["ordinal"]))
    if run["mode"] == "actual":
        if (
            value["task_id"] != f"codex-task:{value['thread_id']}"
            or value.get("task_identity_basis") != "derived_from_fresh_thread_id"
            or value.get("task_identity_kind") != "DERIVED_FROM_FRESH_THREAD_ID"
            or not isinstance(value.get("identity_limitation"), str)
            or not value["identity_limitation"]
        ):
            _fail("ACTUAL_IDENTITY_ATTESTATION", str(row["ordinal"]))
    elif (
        value.get("task_identity_basis"), value.get("task_identity_kind"),
        value.get("identity_limitation"),
    ) != (
        "synthetic_nonce_bound_distinct_identities", "SYNTHETIC_DISTINCT_IDENTITY", None,
    ):
        _fail("SYNTHETIC_IDENTITY_ATTESTATION", str(row["ordinal"]))
    returncode = _integer(value.get("returncode"), f"row[{row['ordinal']}].returncode")
    stdout = _utf8(value.get("stdout_utf8"), f"row[{row['ordinal']}].stdout")
    stderr = _utf8(value.get("stderr_utf8"), f"row[{row['ordinal']}].stderr")

    process = value.get("process")
    process_required = {
        "kind", "pid", "started_utc", "ended_utc", "terminal_reason",
        "poll_count", "live_poll_count", "polls", "task_complete_observed",
        "task_terminal", "child_reaped", "reap_action",
        "protocol_stdout_sha256", "protocol_stdout_bytes", "stderr_sha256",
        "stderr_bytes",
    }
    if not isinstance(process, dict) or not process_required.issubset(process):
        _fail("BACKEND_PROCESS_SHAPE", str(row["ordinal"]))
    for key in ("kind", "started_utc", "ended_utc", "terminal_reason", "reap_action"):
        _string(process.get(key), f"row[{row['ordinal']}].process.{key}")
    if process.get("pid") is not None:
        _integer(process.get("pid"), f"row[{row['ordinal']}].process.pid", 0)
    polls = process.get("polls")
    poll_count = _integer(process.get("poll_count"), f"row[{row['ordinal']}].poll_count", 1)
    _integer(process.get("live_poll_count"), f"row[{row['ordinal']}].live_poll_count", 0)
    if not isinstance(polls, list) or len(polls) != poll_count:
        _fail("BACKEND_POLL_COUNT", str(row["ordinal"]))
    poll_keys = {
        "poll_index", "observed_utc", "state", "process_returncode",
        "rollout_match_count", "task_complete_match_count",
    }
    for index, poll in enumerate(polls):
        _exact_keys(poll, poll_keys, f"row[{row['ordinal']}].polls[{index}]")
        if poll.get("poll_index") != index:
            _fail("BACKEND_POLL_ORDER", f"{row['ordinal']}:{index}")
        _string(poll.get("observed_utc"), f"row[{row['ordinal']}].poll.observed_utc")
        _string(poll.get("state"), f"row[{row['ordinal']}].poll.state")
        if poll.get("process_returncode") is not None:
            _integer(poll.get("process_returncode"), f"row[{row['ordinal']}].poll.returncode")
        _integer(poll.get("rollout_match_count"), f"row[{row['ordinal']}].poll.rollouts", 0)
        _integer(poll.get("task_complete_match_count"), f"row[{row['ordinal']}].poll.terminals", 0)
    terminal = process.get("task_terminal")
    if (
        process.get("terminal_reason") != "TASK_COMPLETE"
        or process.get("task_complete_observed") is not True
        or process.get("child_reaped") is not True
        or not isinstance(terminal, dict)
        or terminal.get("type") != "task_complete"
        or terminal.get("turn_id") != value["turn_id"]
        or (process.get("stderr_sha256"), process.get("stderr_bytes"))
        != (_sha(stderr), len(stderr))
    ):
        _fail("BACKEND_CLOSED_TERMINAL", str(row["ordinal"]))
    capture = value.get("output_capture")
    if not isinstance(capture, dict) or (
        capture.get("sha256"), capture.get("bytes")
    ) != (_sha(stdout), len(stdout)):
        _fail("BACKEND_OUTPUT_CAPTURE_BINDING", str(row["ordinal"]))
    prohibited = value.get("prohibited_activity_observations")
    prohibited_keys = {"present", "item_count", "item_types", "items", "items_sha256", "items_bytes"}
    _exact_keys(prohibited, prohibited_keys, f"row[{row['ordinal']}].prohibited")
    items = prohibited.get("items")
    item_types = prohibited.get("item_types")
    if not isinstance(items, list) or not isinstance(item_types, list):
        _fail("PROHIBITED_ACTIVITY_LIST", str(row["ordinal"]))
    item_bytes = _ordered(items)
    if (
        prohibited.get("present"), prohibited.get("item_count"),
        prohibited.get("items_sha256"), prohibited.get("items_bytes"),
    ) != (bool(items), len(items), _sha(item_bytes), len(item_bytes)):
        _fail("PROHIBITED_ACTIVITY_BINDING", str(row["ordinal"]))
    if len(item_types) != len(items) or not all(isinstance(item, str) for item in item_types):
        _fail("PROHIBITED_ACTIVITY_TYPES", str(row["ordinal"]))
    if prohibited["present"] and returncode == 0:
        _fail("PROHIBITED_ACTIVITY_ZERO_EXIT", str(row["ordinal"]))
    rollout = value.get("rollout")
    if not isinstance(rollout, dict):
        _fail("ROLLOUT_OBJECT_REQUIRED", str(row["ordinal"]))
    if run["mode"] == "synthetic":
        exact_rollout = {
            "kind", "path", "storage_sha256", "storage_bytes",
            "task_started", "task_complete",
        }
        _exact_keys(rollout, exact_rollout, f"row[{row['ordinal']}].rollout")
        if (
            rollout.get("kind"), rollout.get("path"), rollout.get("storage_sha256"),
            rollout.get("storage_bytes"), rollout.get("task_complete"),
        ) != ("synthetic-no-durable-rollout", None, None, 0, terminal):
            _fail("SYNTHETIC_ROLLOUT_BINDING", str(row["ordinal"]))
        started_event = rollout.get("task_started")
        if not isinstance(started_event, dict) or started_event.get("turn_id") != value["turn_id"]:
            _fail("SYNTHETIC_TASK_STARTED_BINDING", str(row["ordinal"]))
    else:
        required_rollout = {
            "kind", "path", "storage_sha256", "storage_bytes", "parsed_row_count",
            "session_meta", "turn_context", "task_started", "task_complete",
            "provider_input_message", "assistant_final_messages",
        }
        _exact_keys(rollout, required_rollout, f"row[{row['ordinal']}].rollout")
        digest = rollout.get("storage_sha256")
        if rollout.get("kind") != "codex-session-jsonl" or not isinstance(digest, str) or not _HEX64.fullmatch(digest):
            _fail("ACTUAL_ROLLOUT_IDENTITY", str(row["ordinal"]))
        _integer(rollout.get("storage_bytes"), f"row[{row['ordinal']}].rollout.bytes", 1)
        _integer(rollout.get("parsed_row_count"), f"row[{row['ordinal']}].rollout.rows", 1)
        session = rollout.get("session_meta")
        turn = rollout.get("turn_context")
        message = rollout.get("provider_input_message")
        finals = rollout.get("assistant_final_messages")
        if not isinstance(session, dict) or session.get("model_provider") != "openai":
            _fail("ACTUAL_PROVIDER_ATTESTATION", str(row["ordinal"]))
        if not isinstance(turn, dict) or (
            turn.get("turn_id"), turn.get("model"), turn.get("effort"),
        ) != (value["turn_id"], row["route"]["model"], row["route"]["thinking"]):
            _fail("ACTUAL_ROUTE_ATTESTATION", str(row["ordinal"]))
        if not isinstance(message, dict):
            _fail("ACTUAL_PROVIDER_MESSAGE", str(row["ordinal"]))
        content = message.get("content")
        if (
            not isinstance(content, list) or len(content) != 1
            or not isinstance(content[0], dict)
            or content[0].get("text") != provider.decode("utf-8")
        ):
            _fail("ACTUAL_PROVIDER_BYTES", str(row["ordinal"]))
        if not isinstance(finals, list):
            _fail("ACTUAL_FINALS_LIST", str(row["ordinal"]))
        if len(finals) == 1 and isinstance(finals[0], dict):
            final_content = finals[0].get("content")
            if isinstance(final_content, list) and len(final_content) == 1 and isinstance(final_content[0], dict) and isinstance(final_content[0].get("text"), str):
                raw_text = final_content[0]["text"]
                admitted = raw_text if raw_text.endswith("\n") else raw_text + "\n"
                if admitted != value["stdout_utf8"]:
                    _fail("ACTUAL_FINAL_OUTPUT_BINDING", str(row["ordinal"]))
    _canon(value)
    return value


def _load_artifacts(
    run_root: _Path, controls: dict[str, _Any],
) -> tuple[dict[tuple[str, str], dict[str, _Any]], dict[str, list[str]]]:
    inventory = _entries(run_root / "artifacts", "artifacts root")
    slots = set(controls["slots"])
    references: dict[tuple[str, str], dict[str, _Any]] = {}
    by_slot: dict[str, list[str]] = {slot: [] for slot in controls["slots"]}
    for slot, is_dir in inventory.items():
        if not is_dir or slot not in slots:
            _fail("UNEXPECTED_ARTIFACT_SLOT", slot)
        children = _entries(run_root / "artifacts" / slot, f"artifact slot {slot}")
        for name, child_is_dir in children.items():
            if child_is_dir or not name.endswith(".json"):
                _fail("UNEXPECTED_ARTIFACT_PATH", f"{slot}/{name}")
            stage_name = name[:-5]
            stage = controls["stages_by_name"].get(stage_name)
            if stage is None:
                _fail("UNDECLARED_STAGE_ARTIFACT", f"{slot}/{name}")
            path = _artifact_path(run_root, slot, stage_name)
            storage, value = _json_object(path, f"stage artifact {slot}/{stage_name}", canonical=False)
            wanted = _ordered(stage["expected_artifact"]) + b"\n"
            if storage != wanted or value != stage["expected_artifact"]:
                _fail("STAGE_ARTIFACT_PAYLOAD_DRIFT", f"{slot}/{stage_name}")
            if (
                stage["expected_artifact_storage_sha256"],
                stage["expected_artifact_storage_bytes"],
            ) != (_sha(storage), len(storage)):
                _fail("STAGE_ARTIFACT_MANIFEST_BINDING", f"{slot}/{stage_name}")
            references[(slot, stage_name)] = _reference(
                run_root, path, storage, "STAGE_ARTIFACT", stage_name,
            )
            by_slot[slot].append(stage_name)
    for slot in by_slot:
        by_slot[slot].sort(key=_STAGES.index)
    return references, by_slot


def _causal_references(
    run_root: _Path, row: dict[str, _Any], cell: dict[str, _Any],
    records: dict[tuple[str, str], dict[str, _Any]],
    artifacts: dict[tuple[str, str], dict[str, _Any]],
) -> list[dict[str, _Any]]:
    refs: list[dict[str, _Any]] = []
    gate = cell["dependency_gate"]
    for cell_name in gate["required_pass_cells"]:
        dependency = records.get((row["slot"], cell_name))
        if dependency is None or dependency["status"] != "PASS":
            _fail("CAUSAL_PASS_CELL_NOT_PASS", f"{row['slot']}:{row['cell']}:{cell_name}")
        refs.append(_reference(
            run_root, dependency["completion_path"], dependency["completion_storage"],
            "PASS_CELL", cell_name,
        ))
    for stage_name in gate["required_stage_artifacts"]:
        reference = artifacts.get((row["slot"], stage_name))
        if reference is None:
            _fail("CAUSAL_STAGE_ARTIFACT_MISSING", f"{row['slot']}:{row['cell']}:{stage_name}")
        refs.append(reference)
    refs.sort(key=lambda item: (item["kind"], item["id"], item["path"]))
    return refs


def _validate_row(
    run_root: _Path, run: dict[str, _Any], row: dict[str, _Any],
    cell: dict[str, _Any], records: dict[tuple[str, str], dict[str, _Any]],
    artifacts: dict[tuple[str, str], dict[str, _Any]],
) -> dict[str, _Any]:
    path = _row_path(run_root, row)
    if _entries(path, f"row {row['ordinal']}") != {
        "provider_input.txt": False, "attempt.json": False,
        "raw_result.json": False, "completion.json": False,
    }:
        _fail("ROW_FILE_INVENTORY_MISMATCH", str(row["ordinal"]))
    render = _regular(path / "provider_input.txt", f"row {row['ordinal']} provider input")
    expected_render = _utf8(cell["render_utf8"], f"cell {row['cell']} render")
    if render != expected_render:
        _fail("PROVIDER_RENDER_DRIFT", str(row["ordinal"]))
    provider = render[:-1]
    causal_inputs = _causal_references(run_root, row, cell, records, artifacts)
    attempt_bytes, attempt = _json_object(
        path / "attempt.json", f"row {row['ordinal']} attempt", canonical=True,
    )
    expected_attempt = {
        "schema_id": "pw-r9-attempt-v2", "run_id": run_root.name,
        "slot": row["slot"], "cell": row["cell"], "index": row["index"],
        "route": row["route"], "nonce": row["nonce"],
        "causal_inputs": causal_inputs,
        "render_storage_sha256": _sha(render), "render_storage_bytes": len(render),
        "provider_input_sha256": _sha(provider), "provider_input_bytes": len(provider),
        "attempt": 1, "retry_count": 0, "best_of": False,
        "replacement_result": False, "no_retry": True, "no_relaunch": True,
    }
    if attempt != expected_attempt:
        _fail("ATTEMPT_BINDING_MISMATCH", str(row["ordinal"]))
    for index, reference in enumerate(attempt["causal_inputs"]):
        _exact_keys(reference, _REF_KEYS, f"row {row['ordinal']} causal_inputs[{index}]")

    raw_bytes, raw = _json_object(
        path / "raw_result.json", f"row {row['ordinal']} raw result", canonical=True,
    )
    raw_keys = {
        "schema_id", "run_id", "slot", "cell", "index", "attempt_sha256",
        "attempt_bytes", "dispatch_started_monotonic_ns",
        "dispatch_ended_monotonic_ns", "backend_result",
    }
    _exact_keys(raw, raw_keys, f"row {row['ordinal']} raw result")
    started = _integer(
        raw.get("dispatch_started_monotonic_ns"),
        f"row[{row['ordinal']}].dispatch_started_monotonic_ns", 0,
    )
    ended = _integer(
        raw.get("dispatch_ended_monotonic_ns"),
        f"row[{row['ordinal']}].dispatch_ended_monotonic_ns", 0,
    )
    if ended < started:
        _fail("DISPATCH_TIME_REVERSED", str(row["ordinal"]))
    if (
        raw.get("schema_id"), raw.get("run_id"), raw.get("slot"),
        raw.get("cell"), raw.get("index"), raw.get("attempt_sha256"),
        raw.get("attempt_bytes"),
    ) != (
        "pw-r9-raw-result-v2", run_root.name, row["slot"], row["cell"],
        row["index"], _sha(attempt_bytes), len(attempt_bytes),
    ):
        _fail("RAW_RESULT_BINDING_MISMATCH", str(row["ordinal"]))
    result = _validate_backend_result(raw.get("backend_result"), run, row, provider)
    score = _score(result, cell)

    completion_path = path / "completion.json"
    completion_bytes, completion = _json_object(
        completion_path, f"row {row['ordinal']} completion", canonical=True,
    )
    completion_keys = {
        "schema_id", "run_id", "slot", "cell", "index", "route", "nonce",
        "task_id", "thread_id", "turn_id", "render_storage_sha256",
        "render_storage_bytes", "provider_input_sha256", "provider_input_bytes",
        "attempt_sha256", "attempt_bytes", "raw_result_sha256",
        "raw_result_bytes", "score", "status", "attempt", "retry_count",
        "best_of", "replacement_result", "completion_is_last_row_write",
    }
    _exact_keys(completion, completion_keys, f"row {row['ordinal']} completion")
    expected_completion = {
        "schema_id": "pw-r9-completion-v2", "run_id": run_root.name,
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
        "completion_bytes": len(completion_bytes), "dispatch_started": started,
        "dispatch_ended": ended, "completion_path": completion_path,
        "completion_storage": completion_bytes,
    }


def _load_rows(
    run_root: _Path, run: dict[str, _Any], rows: list[dict[str, _Any]],
    controls: dict[str, _Any], artifacts: dict[tuple[str, str], dict[str, _Any]],
) -> tuple[list[dict[str, _Any]], dict[tuple[str, str], dict[str, _Any]], set[int]]:
    inventory = _entries(run_root / "cells", "cells root")
    expected_paths = {
        (row["slot"], f"{row['index']:03d}_{row['cell']}"): row for row in rows
    }
    present: set[int] = set()
    for slot, is_dir in inventory.items():
        if not is_dir or slot not in controls["slots"]:
            _fail("UNEXPECTED_CELL_SLOT", slot)
        children = _entries(run_root / "cells" / slot, f"cell slot {slot}")
        if not children:
            _fail("EMPTY_CELL_SLOT_DIRECTORY", slot)
        for name, child_is_dir in children.items():
            base = expected_paths.get((slot, name))
            if not child_is_dir or base is None:
                _fail("UNEXPECTED_ROW_PATH", f"{slot}/{name}")
            if base["ordinal"] in present:
                _fail("DUPLICATE_ROW_PATH", str(base["ordinal"]))
            present.add(base["ordinal"])
    completed: list[dict[str, _Any]] = []
    records: dict[tuple[str, str], dict[str, _Any]] = {}
    previous_end: int | None = None
    for row in rows:
        if row["ordinal"] not in present:
            continue
        record = _validate_row(
            run_root, run, row, controls["cells_by_name"][row["cell"]],
            records, artifacts,
        )
        if previous_end is not None and record["dispatch_started"] < previous_end:
            _fail("DISPATCH_SCHEDULE_TIME_OVERLAP", str(row["ordinal"]))
        previous_end = record["dispatch_ended"]
        completed.append(record)
        records[(row["slot"], row["cell"])] = record
    return completed, records, present


def _root_cause(
    run_root: _Path, root_inventory: dict[str, bool], matrix: dict[str, _Any],
) -> dict[str, str] | None:
    cause = matrix.get("cause")
    if cause is not None:
        value = _exact_keys(cause, {"kind", "detail"}, "matrix cause")
        if value.get("kind") not in {"CONTROLLER_INVALID", "STOPPED_AFTER_DRAIN"}:
            _fail("MATRIX_CAUSE_KIND", str(value.get("kind")))
        _string(value.get("detail"), "matrix cause.detail")
    invalid_present = "controller_invalid.json" in root_inventory
    if invalid_present != (isinstance(cause, dict) and cause.get("kind") == "CONTROLLER_INVALID"):
        _fail("CONTROLLER_INVALID_RECEIPT_CARDINALITY", str(invalid_present))
    if invalid_present:
        _, receipt = _json_object(
            run_root / "controller_invalid.json", "controller invalid", canonical=True,
        )
        expected = {
            "schema_id": "pw-r9-controller-invalid-v2", "run_id": run_root.name,
            "kind": cause["kind"], "detail": cause["detail"],
        }
        if receipt != expected:
            _fail("CONTROLLER_INVALID_RECEIPT_MISMATCH", "controller_invalid.json")
    return cause


def _replay_schedule(
    rows: list[dict[str, _Any]], records: dict[tuple[str, str], dict[str, _Any]],
    present: set[int], cause: dict[str, str] | None,
) -> tuple[dict[str, int], int | None]:
    failed_slots: dict[str, int] = {}
    halt_ordinal: int | None = None
    for row in rows:
        ordinal = row["ordinal"]
        if row["slot"] in failed_slots:
            if ordinal in present:
                _fail("POST_FIRST_FAIL_SAME_SLOT_DISPATCH", str(ordinal))
            continue
        if halt_ordinal is not None:
            if ordinal in present:
                _fail("POST_GLOBAL_HALT_DISPATCH", str(ordinal))
            continue
        if ordinal not in present:
            if cause is None:
                _fail("UNDECLARED_UNSTARTED_ROW", str(ordinal))
            halt_ordinal = ordinal
            continue
        record = records[(row["slot"], row["cell"])]
        if record["status"] == "FAIL":
            failed_slots[row["slot"]] = ordinal
    return failed_slots, halt_ordinal


def _expected_artifacts(
    controls: dict[str, _Any], records: dict[tuple[str, str], dict[str, _Any]],
) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    for slot in controls["slots"]:
        eligible: list[str] = []
        eligible_set: set[str] = set()
        for stage in controls["stages"]:
            boundary_cell = stage["finalization_boundary"]["after_cell"]
            boundary = records.get((slot, boundary_cell))
            direct = [records.get((slot, cell)) for cell in stage["direct_subject_cells"]]
            is_eligible = (
                boundary is not None and boundary["status"] == "PASS"
                and all(item is not None and item["status"] == "PASS" for item in direct)
                and all(item in eligible_set for item in stage["predecessor_stages"])
            )
            if is_eligible:
                eligible.append(stage["stage"])
                eligible_set.add(stage["stage"])
        result[slot] = eligible
    return result


def _public_completion(record: dict[str, _Any]) -> dict[str, _Any]:
    return {
        key: record[key] for key in (
            "ordinal", "slot", "cell", "index", "status", "nonce", "task_id",
            "thread_id", "turn_id", "completion_sha256", "completion_bytes",
        )
    }


def _validate_terminals(
    run_root: _Path, run: dict[str, _Any], rows: list[dict[str, _Any]],
    controls: dict[str, _Any], completed: list[dict[str, _Any]],
    records: dict[tuple[str, str], dict[str, _Any]], present: set[int],
    artifacts: dict[tuple[str, str], dict[str, _Any]],
    artifacts_by_slot: dict[str, list[str]], root_inventory: dict[str, bool],
) -> tuple[dict[str, _Any], dict[str, _Any]]:
    matrix_bytes, matrix = _json_object(
        run_root / "matrix_terminal.json", "matrix terminal", canonical=True,
    )
    matrix_keys = {
        "schema_id", "run_id", "status", "cause", "scheduled_rows",
        "completed_rows", "pass_rows", "subject_fail_rows", "invalid_rows",
        "ineligible_rows", "stopped_rows", "controller_aborted_rows",
        "missing_rows", "stage_artifact_count", "required_clean_stage_artifacts",
        "clean_matrix", "path_terminals", "retry_count", "best_of",
        "replacement_count",
    }
    _exact_keys(matrix, matrix_keys, "matrix terminal")
    cause = _root_cause(run_root, root_inventory, matrix)
    failed_slots, _ = _replay_schedule(rows, records, present, cause)

    expected_artifacts = _expected_artifacts(controls, records)
    for slot in controls["slots"]:
        if artifacts_by_slot[slot] != expected_artifacts[slot]:
            extra = sorted(set(artifacts_by_slot[slot]) - set(expected_artifacts[slot]))
            missing = sorted(set(expected_artifacts[slot]) - set(artifacts_by_slot[slot]))
            _fail(
                "STAGE_ELIGIBILITY_INVENTORY_MISMATCH",
                f"{slot}: extra={extra}, missing={missing}",
            )
        failed = failed_slots.get(slot)
        if failed is not None:
            row = rows[failed]
            for stage_name in artifacts_by_slot[slot]:
                boundary = controls["stages_by_name"][stage_name]["finalization_boundary"]["after_cell_index"]
                if boundary >= row["index"]:
                    _fail("POST_FIRST_FAIL_SAME_SLOT_ARTIFACT", f"{slot}:{stage_name}")

    terminal_inventory = _entries(run_root / "terminals", "terminals root")
    wanted_terminal_inventory = {f"{slot}.json": False for slot in controls["slots"]}
    if terminal_inventory != wanted_terminal_inventory:
        _fail("PATH_TERMINAL_INVENTORY_MISMATCH", str(sorted(terminal_inventory)))
    completed_by_ordinal = {record["ordinal"]: record for record in completed}
    path_records: list[dict[str, _Any]] = []
    path_ids: list[dict[str, _Any]] = []
    path_terminal_keys = {
        "schema_id", "run_id", "slot", "status", "scheduled_rows",
        "completed_rows", "pass_rows", "subject_fail_rows", "invalid_rows",
        "ineligible_after_subject_fail_ordinals", "stopped_after_signal_ordinals",
        "controller_aborted_ordinals", "missing_ordinals", "stage_artifacts",
        "stage_artifact_count", "eligible_stage_count", "missing_stage_artifacts",
        "invalid_stage_artifacts", "completion_inventory_sha256",
        "completion_inventory_bytes",
    }
    for route in controls["routes"]:
        slot = route["slot"]
        scheduled = [row for row in rows if row["slot"] == slot]
        slot_completed = [
            completed_by_ordinal[row["ordinal"]]
            for row in scheduled if row["ordinal"] in completed_by_ordinal
        ]
        public_completed = [_public_completion(record) for record in slot_completed]
        first_fail = next((record["ordinal"] for record in slot_completed if record["status"] == "FAIL"), None)
        ineligible: list[int] = []
        stopped: list[int] = []
        aborted: list[int] = []
        missing: list[int] = []
        for row in scheduled:
            if row["ordinal"] in completed_by_ordinal:
                continue
            if first_fail is not None and row["ordinal"] > first_fail:
                ineligible.append(row["ordinal"])
            elif cause is not None and cause["kind"] == "STOPPED_AFTER_DRAIN":
                stopped.append(row["ordinal"])
            elif cause is not None and cause["kind"] == "CONTROLLER_INVALID":
                aborted.append(row["ordinal"])
            else:
                missing.append(row["ordinal"])
        if missing:
            _fail("UNDECLARED_MISSING_ROWS", f"{slot}:{missing}")
        pass_rows = sum(record["status"] == "PASS" for record in slot_completed)
        fail_rows = sum(record["status"] == "FAIL" for record in slot_completed)
        if fail_rows > 1:
            _fail("MULTIPLE_SUBJECT_FAILS_IN_SLOT", slot)
        if aborted:
            status = "CONTROLLER_ABORTED"
        elif stopped:
            status = "STOPPED_AFTER_DRAIN"
        elif fail_rows:
            status = "VALID_SUBJECT_FAIL"
        elif len(slot_completed) == len(scheduled):
            status = "PASS"
        else:
            _fail("PATH_TERMINAL_UNCLASSIFIED", slot)
        artifact_rows = []
        for stage_name in expected_artifacts[slot]:
            reference = artifacts[(slot, stage_name)]
            artifact_rows.append({
                "stage": stage_name, "path": reference["path"],
                "sha256": reference["sha256"], "bytes": reference["bytes"],
            })
        completion_inventory = _canon(public_completed)
        expected_path = {
            "schema_id": "pw-r9-path-terminal-v2", "run_id": run_root.name,
            "slot": slot, "status": status, "scheduled_rows": len(scheduled),
            "completed_rows": len(slot_completed), "pass_rows": pass_rows,
            "subject_fail_rows": fail_rows, "invalid_rows": [],
            "ineligible_after_subject_fail_ordinals": ineligible,
            "stopped_after_signal_ordinals": stopped,
            "controller_aborted_ordinals": aborted, "missing_ordinals": [],
            "stage_artifacts": artifact_rows, "stage_artifact_count": len(artifact_rows),
            "eligible_stage_count": len(expected_artifacts[slot]),
            "missing_stage_artifacts": [], "invalid_stage_artifacts": [],
            "completion_inventory_sha256": _sha(completion_inventory),
            "completion_inventory_bytes": len(completion_inventory),
        }
        path = run_root / "terminals" / f"{slot}.json"
        path_bytes, actual_path = _json_object(path, f"path terminal {slot}", canonical=True)
        _exact_keys(actual_path, path_terminal_keys, f"path terminal {slot}")
        if actual_path != expected_path:
            _fail("PATH_TERMINAL_MISMATCH", slot)
        path_records.append(expected_path)
        path_ids.append({"slot": slot, "sha256": _sha(path_bytes), "bytes": len(path_bytes)})

    scheduled_count = len(rows)
    completed_count = len(completed)
    passed_count = sum(record["status"] == "PASS" for record in completed)
    failed_count = sum(record["status"] == "FAIL" for record in completed)
    ineligible_count = sum(len(record["ineligible_after_subject_fail_ordinals"]) for record in path_records)
    stopped_count = sum(len(record["stopped_after_signal_ordinals"]) for record in path_records)
    aborted_count = sum(len(record["controller_aborted_ordinals"]) for record in path_records)
    artifact_count = sum(record["stage_artifact_count"] for record in path_records)
    full_matrix = run["planned_call_count"] == 291
    clean_matrix = (
        full_matrix and passed_count == 291 and failed_count == 0
        and ineligible_count == 0 and stopped_count == 0 and aborted_count == 0
        and completed_count == 291 and artifact_count == 54
    )
    if cause is not None and cause["kind"] == "CONTROLLER_INVALID":
        matrix_status = "CONTROLLER_INVALID"
    elif cause is not None and cause["kind"] == "STOPPED_AFTER_DRAIN":
        matrix_status = "STOPPED_AFTER_DRAIN"
    elif failed_count:
        matrix_status = "VALID_SUBJECT_FAIL"
    elif full_matrix and clean_matrix:
        matrix_status = "PASS"
    elif not full_matrix and completed_count == scheduled_count and passed_count == scheduled_count:
        matrix_status = "PASS"
    else:
        _fail("MATRIX_OUTCOME_UNCLASSIFIED", run_root.name)
    expected_matrix = {
        "schema_id": "pw-r9-matrix-terminal-v2", "run_id": run_root.name,
        "status": matrix_status, "cause": cause, "scheduled_rows": scheduled_count,
        "completed_rows": completed_count, "pass_rows": passed_count,
        "subject_fail_rows": failed_count, "invalid_rows": 0,
        "ineligible_rows": ineligible_count, "stopped_rows": stopped_count,
        "controller_aborted_rows": aborted_count, "missing_rows": 0,
        "stage_artifact_count": artifact_count,
        "required_clean_stage_artifacts": 54 if full_matrix else 0,
        "clean_matrix": clean_matrix, "path_terminals": path_ids,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    }
    if matrix != expected_matrix:
        _fail("MATRIX_TERMINAL_MISMATCH", "matrix_terminal.json")

    accounting_keys = {
        "schema_id", "run_id", "status", "matrix_terminal_sha256",
        "matrix_terminal_bytes", "planned_calls", "attempts",
        "captured_raw_results", "valid_completions", "pass_rows",
        "subject_fail_rows", "ineligible_rows", "stopped_rows",
        "controller_aborted_rows", "invalid_rows", "missing_rows",
        "stage_artifact_count", "unknown_or_uncaptured_dispatches",
        "retry_count", "best_of", "replacement_count",
    }
    _, accounting = _json_object(
        run_root / "accounting.json", "accounting", canonical=True,
    )
    _exact_keys(accounting, accounting_keys, "accounting")
    expected_accounting = {
        "schema_id": "pw-r9-accounting-v2", "run_id": run_root.name,
        "status": matrix_status, "matrix_terminal_sha256": _sha(matrix_bytes),
        "matrix_terminal_bytes": len(matrix_bytes), "planned_calls": scheduled_count,
        "attempts": completed_count, "captured_raw_results": completed_count,
        "valid_completions": completed_count, "pass_rows": passed_count,
        "subject_fail_rows": failed_count, "ineligible_rows": ineligible_count,
        "stopped_rows": stopped_count, "controller_aborted_rows": aborted_count,
        "invalid_rows": 0, "missing_rows": 0, "stage_artifact_count": artifact_count,
        "unknown_or_uncaptured_dispatches": 0, "retry_count": 0,
        "best_of": False, "replacement_count": 0,
    }
    if accounting != expected_accounting:
        _fail("ACCOUNTING_MISMATCH", "accounting.json")
    return matrix, accounting


def _walk_raw_results(cells_root: _Path, label: str) -> list[_Path]:
    if not cells_root.exists() and not cells_root.is_symlink():
        return []
    _directory(cells_root, label)
    found: list[_Path] = []
    pending = [cells_root]
    while pending:
        directory = pending.pop()
        for name, is_dir in _entries(directory, label).items():
            child = directory / name
            if is_dir:
                pending.append(child)
            elif name == "raw_result.json":
                found.append(child)
    return sorted(found, key=lambda path: path.as_posix())


def _global_freshness(evidence_root: _Path) -> tuple[int, int]:
    inventory = _entries(evidence_root, "evidence root")
    seen: dict[str, str] = {}
    run_count = 0

    def add(value: _Any, location: str) -> None:
        if not isinstance(value, str) or not value:
            _fail("GLOBAL_IDENTITY_MISSING", location)
        prior = seen.get(value)
        if prior is not None:
            _fail("GLOBAL_IDENTITY_OR_NONCE_COLLISION", f"{value}: {prior} and {location}")
        seen[value] = location

    for run_name, is_dir in sorted(inventory.items()):
        if not is_dir or not _SAFE_NAME.fullmatch(run_name):
            _fail("EVIDENCE_ROOT_ENTRY_INVALID", run_name)
        sibling = evidence_root / run_name
        _, run = _json_object(sibling / "run.json", f"global run {run_name}", canonical=True)
        if run.get("schema_id") != "pw-r9-run-v2" or run.get("run_id") != run_name:
            _fail("GLOBAL_RUN_IDENTITY_MISMATCH", run_name)
        schedule = run.get("schedule")
        if not isinstance(schedule, list):
            _fail("GLOBAL_RUN_SCHEDULE_MISSING", run_name)
        for index, row in enumerate(schedule):
            if not isinstance(row, dict):
                _fail("GLOBAL_RUN_ROW_MALFORMED", f"{run_name}:{index}")
            add(row.get("nonce"), f"{run_name}:nonce:{index}")
        for raw_path in _walk_raw_results(sibling / "cells", f"global cells {run_name}"):
            _, raw = _json_object(raw_path, f"global raw result {raw_path}", canonical=True)
            backend = raw.get("backend_result")
            if not isinstance(backend, dict):
                _fail("GLOBAL_BACKEND_RESULT_MALFORMED", str(raw_path))
            for key in ("task_id", "thread_id", "turn_id"):
                add(backend.get(key), f"{run_name}:{raw_path.parent.name}:{key}")
        run_count += 1
    return run_count, len(seen)


def verify(run_root: _Path, expected: dict[str, _Any]) -> dict[str, _Any]:
    """Independently verify one terminal iteration-002 run without persistence."""
    completed_checks: list[str] = []
    run_id = expected.get("run_id") if isinstance(expected, dict) and isinstance(expected.get("run_id"), str) else None
    run_kind = expected.get("run_kind") if isinstance(expected, dict) and isinstance(expected.get("run_kind"), str) else None
    try:
        controls = _load_semantic()
        bundle, bundle_storages = _component_bundle()
        completed_checks.append("semantic_pipeline_bundle")
        expectation = _validate_expected(run_root, expected, controls, bundle)
        completed_checks.append("expected_interface")
        _, run, rows = _load_run(run_root, expectation, controls, bundle)
        completed_checks.append("run_manifest")
        _validate_custody(run, bundle, bundle_storages)
        completed_checks.append("custody")

        root_inventory = _entries(run_root, "run root")
        base_root = {
            "run.json": False, "cells": True, "artifacts": True,
            "terminals": True, "matrix_terminal.json": False,
            "accounting.json": False,
        }
        if root_inventory not in (base_root, {**base_root, "controller_invalid.json": False}):
            _fail("RUN_ROOT_INVENTORY_MISMATCH", str(sorted(root_inventory)))
        artifacts, artifacts_by_slot = _load_artifacts(run_root, controls)
        completed, records, present = _load_rows(
            run_root, run, rows, controls, artifacts,
        )
        completed_checks.extend((
            "exact_inventory", "causal_dependency_gates", "row_chains",
            "provider_bytes", "backend_terminals", "deterministic_scores",
        ))
        matrix, accounting = _validate_terminals(
            run_root, run, rows, controls, completed, records, present,
            artifacts, artifacts_by_slot, root_inventory,
        )
        completed_checks.extend((
            "stage_artifacts", "schedule_and_stop_rules", "path_terminals",
            "matrix_terminal", "accounting",
        ))
        run_count, unique_values = _global_freshness(expectation["evidence_root"])
        completed_checks.append("global_identity_and_nonce_freshness")
        qualification_credit = int(
            run_kind == "run-matrix" and run["mode"] == "actual"
            and matrix["status"] == "PASS" and matrix["clean_matrix"] is True
        )
        report = {
            "schema_id": "pw-r9-offline-verifier-report-v2", "valid": True,
            "run_id": expectation["run_id"], "run_kind": expectation["run_kind"],
            "matrix_status": matrix["status"], "error": None,
            "checks": {key: True for key in _CHECKS},
            "counts": {
                "planned_calls": accounting["planned_calls"],
                "completed_rows": matrix["completed_rows"],
                "pass_rows": matrix["pass_rows"],
                "subject_fail_rows": matrix["subject_fail_rows"],
                "ineligible_rows": matrix["ineligible_rows"],
                "stopped_rows": matrix["stopped_rows"],
                "controller_aborted_rows": matrix["controller_aborted_rows"],
                "stage_artifacts": matrix["stage_artifact_count"],
                "evidence_runs_scanned": run_count,
                "globally_unique_identity_and_nonce_values": unique_values,
            },
            "credit": {
                "qualification_clean_run_credit": qualification_credit,
                "synthetic_credit": 0,
                "controller_invalid_credit": 0,
            },
            "bundle": bundle,
            "calls": {"provider": 0, "subject": 0, "network": 0},
            "residuals": [
                "Final bytes and exact causal chains are verified; historical O_EXCL and fsync calls are trusted-controller obligations not reconstructable from a filesystem snapshot.",
                "No recursive verifier authority, private-helper caller confinement, reflection resistance, or hostile in-process caller resistance is claimed.",
            ],
        }
        _canon(report)
        return report
    except _Invalid as exc:
        return {
            "schema_id": "pw-r9-offline-verifier-report-v2", "valid": False,
            "run_id": run_id, "run_kind": run_kind,
            "matrix_status": "CONTROLLER_INVALID",
            "error": {"code": exc.code, "detail": exc.detail},
            "checks": {key: key in completed_checks for key in _CHECKS},
            "counts": None, "credit": {
                "qualification_clean_run_credit": 0, "synthetic_credit": 0,
                "controller_invalid_credit": 0,
            },
            "bundle": None, "calls": {"provider": 0, "subject": 0, "network": 0},
            "residuals": [
                "No recursive verifier authority or private-helper threat chasing is claimed.",
            ],
        }
    except Exception as exc:  # fail closed without traceback or evidence mutation
        return {
            "schema_id": "pw-r9-offline-verifier-report-v2", "valid": False,
            "run_id": run_id, "run_kind": run_kind,
            "matrix_status": "CONTROLLER_INVALID",
            "error": {"code": "UNEXPECTED_VERIFIER_ERROR", "detail": f"{type(exc).__name__}: {exc}"},
            "checks": {key: key in completed_checks for key in _CHECKS},
            "counts": None, "credit": {
                "qualification_clean_run_credit": 0, "synthetic_credit": 0,
                "controller_invalid_credit": 0,
            },
            "bundle": None, "calls": {"provider": 0, "subject": 0, "network": 0},
            "residuals": ["Unexpected verifier error; evidence receives no credit."],
        }
