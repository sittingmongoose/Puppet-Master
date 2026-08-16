#!/usr/bin/env python3
"""Standalone trusted sequential controller for R9 stabilization iteration 002."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import signal
import stat
import subprocess
import sys
import time
from typing import Any

from backend import invoke
from verifier import verify

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parent
SUCCESSOR = ROOT.parents[1]
REPO = ROOT.parents[4]
ITERATION_REL = ROOT.relative_to(SUCCESSOR)
OPERATING = SUCCESSOR / "r9_goal_operating_contract_v1.json"
ARCHITECTURE = ROOT / "architecture_contract.json"
SEMANTIC = ROOT / "semantic_manifest.json"
PIPELINE = ROOT / "pipeline_contract.json"
DEFAULT_EVIDENCE = ROOT / "evidence"
SIMULATOR_EVIDENCE_ENV = "PW_R9_SIMULATOR_EVIDENCE_ROOT"
SAFE = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,127}\Z")
NONCE = re.compile(r"[0-9a-f]{64}\Z")
GIT_HEAD = re.compile(r"[0-9a-f]{40,64}\Z")
STOP = False

BUNDLE_RELATIVE_PATHS = (
    Path("r9_goal_operating_contract_v1.json"),
    ITERATION_REL / "architecture_contract.json",
    ITERATION_REL / "backend.py",
    ITERATION_REL / "backend_contract.json",
    ITERATION_REL / "controller.py",
    ITERATION_REL / "fault_scenarios.json",
    ITERATION_REL / "pipeline_contract.json",
    ITERATION_REL / "regression_catalog.json",
    ITERATION_REL / "regression_inventory_receipt.json",
    ITERATION_REL / "routes.json",
    ITERATION_REL / "schedule.json",
    ITERATION_REL / "semantic_inventory_receipt.json",
    ITERATION_REL / "semantic_manifest.json",
    ITERATION_REL / "simulator_contract.json",
    ITERATION_REL / "verifier.py",
    ITERATION_REL / "verifier_contract.json",
)


class Invalid(RuntimeError):
    """A controller, transport, custody, or evidence invariant failed."""


def _canon(value: Any) -> bytes:
    try:
        return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True,
                          separators=(",", ":")).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise Invalid(f"not canonical-JSON-able: {exc}") from exc


def _semantic_canon(value: Any) -> bytes:
    """Minify while preserving the frozen manifest's declared object-key order."""
    try:
        return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=False,
                          separators=(",", ":")).encode("utf-8")
    except (TypeError, ValueError) as exc:
        raise Invalid(f"not semantic-canonical-JSON-able: {exc}") from exc


def _sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in pairs:
        if key in value:
            raise Invalid(f"duplicate JSON key: {key}")
        value[key] = item
    return value


def _regular(path: Path, label: str) -> bytes:
    try:
        info = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISREG(info.st_mode):
        raise Invalid(f"{label}: not a regular nonlink")
    return path.read_bytes()


def _json(path: Path, label: str, exact: bool = True) -> tuple[bytes, dict[str, Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise Invalid(f"{label}: not one-LF JSON storage")
    try:
        value = json.loads(storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
                           parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or (exact and storage != _canon(value) + b"\n"):
        raise Invalid(f"{label}: not a canonical object")
    return storage, value


def _semantic_json(path: Path, label: str) -> tuple[bytes, dict[str, Any]]:
    storage = _regular(path, label)
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise Invalid(f"{label}: not one-LF JSON storage")
    try:
        value = json.loads(storage[:-1].decode("utf-8"), object_pairs_hook=_pairs,
                           parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or storage != _semantic_canon(value) + b"\n":
        raise Invalid(f"{label}: not declared-order canonical object")
    return storage, value


def _dir(path: Path, label: str) -> None:
    try:
        info = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISDIR(info.st_mode):
        raise Invalid(f"{label}: not a directory nonlink")


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
        raise Invalid(f"create-only directory exists: {path}") from exc
    _dir(path, str(path))
    _sync_dir(path.parent)


def _write(path: Path, storage: bytes) -> tuple[str, int]:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        view = memoryview(storage)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise Invalid(f"short write: {path}")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    _sync_dir(path.parent)
    if _regular(path, f"reopened {path.name}") != storage:
        raise Invalid(f"reopen mismatch: {path}")
    return _sha(storage), len(storage)


def _write_json(path: Path, value: dict[str, Any]) -> tuple[str, int]:
    return _write(path, _canon(value) + b"\n")


def _binding(path: Path, storage: bytes, base: Path = SUCCESSOR) -> dict[str, Any]:
    try:
        relative = path.relative_to(base)
    except ValueError as exc:
        raise Invalid(f"binding escapes declared base: {path}") from exc
    return {"path": relative.as_posix(), "sha256": _sha(storage), "bytes": len(storage)}


def _evidence_binding(root: Path, path: Path, storage: bytes, kind: str, identity: str) -> dict[str, Any]:
    try:
        relative = path.relative_to(root).as_posix()
    except ValueError as exc:
        raise Invalid(f"causal input escapes run root: {path}") from exc
    return {"kind": kind, "id": identity, "path": relative,
            "sha256": _sha(storage), "bytes": len(storage)}


def _name(value: Any, label: str) -> str:
    if not isinstance(value, str) or not SAFE.fullmatch(value):
        raise Invalid(f"{label}: unsafe name")
    return value


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _git_head() -> str:
    completed = subprocess.run(
        ["git", "-C", str(REPO), "rev-parse", "HEAD"],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    try:
        head = completed.stdout.decode("ascii").strip()
    except UnicodeDecodeError as exc:
        raise Invalid("Git HEAD is not ASCII") from exc
    if completed.returncode != 0 or not GIT_HEAD.fullmatch(head):
        raise Invalid("current Git HEAD unavailable")
    return head


def _bundle() -> tuple[dict[str, Any], dict[str, bytes]]:
    files: list[dict[str, Any]] = []
    storages: dict[str, bytes] = {}
    for relative in sorted(BUNDLE_RELATIVE_PATHS, key=lambda item: item.as_posix()):
        path = SUCCESSOR / relative
        storage = _regular(path, f"bundle file {relative.as_posix()}")
        row = _binding(path, storage)
        files.append(row)
        storages[row["path"]] = storage
    rows = _canon(files)
    bundle = {"file_count": len(files),
              "aggregate_file_bytes": sum(row["bytes"] for row in files),
              "rows_sha256": _sha(rows), "rows_bytes": len(rows), "files": files}
    return bundle, storages


def _require_head_custody(head: str, bundle: dict[str, Any], storages: dict[str, bytes]) -> None:
    for row in bundle["files"]:
        successor_relative = Path(row["path"])
        repo_relative = (SUCCESSOR.relative_to(REPO) / successor_relative).as_posix()
        completed = subprocess.run(
            ["git", "-C", str(REPO), "show", f"{head}:{repo_relative}"],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        if completed.returncode != 0 or completed.stdout != storages[row["path"]]:
            raise Invalid(f"actual-run bundle is not pinned to Git HEAD: {row['path']}")


def _identity_matches(binding: Any, storage: bytes) -> bool:
    if not isinstance(binding, dict):
        return False
    digest = binding.get("sha256", binding.get("storage_sha256"))
    count = binding.get("bytes", binding.get("storage_bytes"))
    return (digest, count) == (_sha(storage), len(storage))


def _controls() -> dict[str, Any]:
    operating_bytes, operating = _json(OPERATING, "operating contract", False)
    if operating.get("schema_id") != "pw-r9-goal-operating-contract-v1":
        raise Invalid("operating-contract schema mismatch")
    architecture_bytes, architecture = _json(ARCHITECTURE, "architecture contract", False)
    if architecture.get("schema_id") != "pw-r9-minimal-controller-architecture-v2":
        raise Invalid("architecture-contract schema mismatch")
    lineage = architecture.get("lineage")
    operating_repo_path = OPERATING.relative_to(REPO).as_posix()
    if (not isinstance(lineage, dict)
            or not _identity_matches(lineage.get("operating_contract"), operating_bytes)
            or lineage["operating_contract"].get("path") != operating_repo_path):
        raise Invalid("architecture operating-contract lineage mismatch")
    if lineage.get("prior_controller_runtime_imported") is not False:
        raise Invalid("architecture permits prior-controller runtime import")

    semantic_bytes, semantic = _semantic_json(SEMANTIC, "semantic manifest")
    if semantic.get("schema_id") != "pw-r9-semantic-manifest-v2":
        raise Invalid("semantic-manifest schema mismatch")
    exact_top = {"schema_id", "routes", "schedule", "stage_order", "cells",
                 "deterministic_stages", "files", "canary_cell"}
    if set(semantic) != exact_top:
        raise Invalid("semantic-manifest top-level shape mismatch")
    pipeline_bytes, pipeline = _semantic_json(PIPELINE, "pipeline contract")
    if pipeline.get("schema_id") != "pw-r9-semantic-pipeline-contract-v1":
        raise Invalid("pipeline-contract schema mismatch")
    if set(pipeline) != {"schema_id", "status", "bindings", "rule", "manifest_contract",
                         "cell_dependency_gate", "stage_finalization", "execution_requirements",
                         "forbidden_dependencies", "calls", "nonclaims"}:
        raise Invalid("pipeline-contract top-level shape mismatch")
    rule = pipeline.get("rule")
    if not isinstance(rule, dict) or rule.get("id") != "pw-r9-exact-input-frozen-artifact-v1":
        raise Invalid("pipeline causal rule mismatch")
    manifest_contract = pipeline.get("manifest_contract")
    required_manifest_claims = {
        "schema_id": "pw-r9-semantic-manifest-v2", "route_count": 3, "cell_count": 97,
        "schedule_entry_count": 291, "deterministic_stage_count": 18,
        "route_local_stage_artifact_count": 54, "stage_order_is_total": True,
        "canary_cell": "S10A_DECISION_A01", "canary_dependency_gate_is_empty": True,
        "render_bytes_are_frozen_not_runtime_interpolated": True,
        "expected_outputs_are_exact_closed_oracles": True, "runtime_prior_control_imports": 0,
    }
    if manifest_contract != required_manifest_claims:
        raise Invalid("pipeline manifest contract mismatch")
    execution = pipeline.get("execution_requirements")
    required_execution = {
        "one_fresh_task_thread_turn_per_subject_invocation", "predeclared_unique_nonce_per_schedule_row",
        "attempt_created_before_dispatch", "raw_result_persisted_before_score",
        "completion_written_last", "stage_artifact_written_only_after_input_reopen",
        "independent_reopen_replays_all_cell_and_stage_gates", "no_post_fail_same_slot_dispatch",
        "no_post_invalid_dispatch",
    }
    if (not isinstance(execution, dict) or execution.get("schedule_order") != "exact slot-major schedule.json order"
            or any(execution.get(key) is not True for key in required_execution)):
        raise Invalid("pipeline execution requirements mismatch")
    bindings = pipeline.get("bindings")
    if not isinstance(bindings, dict):
        raise Invalid("pipeline bindings absent")
    pipeline_targets = {
        "r9_goal_operating_contract": (OPERATING, operating_repo_path),
        "parent_progress_assessment": (
            ROOT.parent / "iteration_001" / "progress_assessment.json",
            (ROOT.parent / "iteration_001" / "progress_assessment.json").relative_to(REPO).as_posix(),
        ),
        "causal_pipeline_diagnosis": (
            ROOT.parent / "iteration_001" / "causal_pipeline_diagnosis_v1.json",
            (ROOT.parent / "iteration_001" / "causal_pipeline_diagnosis_v1.json").relative_to(REPO).as_posix(),
        ),
        "semantic_manifest": (SEMANTIC, "semantic_manifest.json"),
        "schedule": (ROOT / "schedule.json", "schedule.json"),
        "routes": (ROOT / "routes.json", "routes.json"),
    }
    if set(bindings) != set(pipeline_targets):
        raise Invalid("pipeline binding set mismatch")
    for key, (path, declared_path) in pipeline_targets.items():
        storage = _regular(path, f"pipeline binding {key}")
        binding = bindings[key]
        if (not _identity_matches(binding, storage)
                or not isinstance(binding, dict) or binding.get("path") != declared_path):
            raise Invalid(f"pipeline binding mismatch: {key}")

    routes = semantic["routes"]
    if not isinstance(routes, list) or len(routes) != 3:
        raise Invalid("exactly three routes required")
    slots: list[str] = []
    for route in routes:
        if not isinstance(route, dict) or set(route) != {"slot", "model", "thinking"}:
            raise Invalid("route shape mismatch")
        slots.append(_name(route.get("slot"), "route slot"))
        if not all(isinstance(route.get(key), str) and route[key] for key in ("model", "thinking")):
            raise Invalid("route identity absent")
    if len(set(slots)) != 3:
        raise Invalid("route slots not unique")

    schedule = semantic["schedule"]
    cells = semantic["cells"]
    if not isinstance(schedule, list) or len(schedule) != 97:
        raise Invalid("exact 97-cell schedule required")
    schedule = [_name(item, "cell") for item in schedule]
    if len(set(schedule)) != 97 or not isinstance(cells, list) or len(cells) != 97:
        raise Invalid("schedule/cell cardinality mismatch")
    cell_fields = {
        "index", "cell", "render_utf8", "render_utf8_sha256", "render_utf8_bytes",
        "expected_output", "expected_output_sha256", "expected_output_bytes",
        "expected_output_storage_sha256", "expected_output_storage_bytes", "dependency_gate",
    }
    cell_by_id: dict[str, dict[str, Any]] = {}
    for index, cell in enumerate(cells):
        if not isinstance(cell, dict) or set(cell) != cell_fields:
            raise Invalid("cell shape mismatch")
        name = _name(cell.get("cell"), "cell")
        if cell.get("index") != index or name != schedule[index]:
            raise Invalid("cell order mismatch")
        render = cell.get("render_utf8")
        if not isinstance(render, str):
            raise Invalid("cell render absent")
        render_bytes = render.encode("utf-8")
        if not render_bytes.endswith(b"\n") or render_bytes.endswith(b"\n\n") or b"\r" in render_bytes:
            raise Invalid("render is not exact one-LF UTF-8")
        if (cell.get("render_utf8_sha256"), cell.get("render_utf8_bytes")) != (
                _sha(render_bytes), len(render_bytes)):
            raise Invalid("render identity mismatch")
        expected_payload = _semantic_canon(cell.get("expected_output"))
        expected_storage = expected_payload + b"\n"
        if (cell.get("expected_output_sha256"), cell.get("expected_output_bytes")) != (
                _sha(expected_payload), len(expected_payload)):
            raise Invalid("expected-output payload identity mismatch")
        if (cell.get("expected_output_storage_sha256"), cell.get("expected_output_storage_bytes")) != (
                _sha(expected_storage), len(expected_storage)):
            raise Invalid("expected-output storage identity mismatch")
        gate = cell.get("dependency_gate")
        if not isinstance(gate, dict) or set(gate) != {
                "rule", "required_pass_cells", "required_stage_artifacts"}:
            raise Invalid("cell dependency-gate shape mismatch")
        if gate["rule"] != "pw-r9-exact-input-frozen-artifact-v1":
            raise Invalid("cell dependency-gate rule mismatch")
        for key in ("required_pass_cells", "required_stage_artifacts"):
            if not isinstance(gate[key], list):
                raise Invalid("cell dependency list absent")
            gate[key] = [_name(item, f"{name} dependency") for item in gate[key]]
            if len(gate[key]) != len(set(gate[key])):
                raise Invalid("duplicate cell dependency")
        cell_by_id[name] = cell

    stage_order = semantic["stage_order"]
    stages = semantic["deterministic_stages"]
    if not isinstance(stage_order, list) or len(stage_order) != 18:
        raise Invalid("exact 18-stage order required")
    stage_order = [_name(item, "stage") for item in stage_order]
    if len(set(stage_order)) != 18 or not isinstance(stages, list) or len(stages) != 18:
        raise Invalid("stage cardinality mismatch")
    stage_fields = {
        "index", "stage", "rule", "predecessor_stages", "direct_subject_cells",
        "finalization_boundary", "expected_artifact", "expected_artifact_sha256",
        "expected_artifact_bytes", "expected_artifact_storage_sha256",
        "expected_artifact_storage_bytes",
    }
    stage_by_id: dict[str, dict[str, Any]] = {}
    for index, stage in enumerate(stages):
        if not isinstance(stage, dict) or set(stage) != stage_fields:
            raise Invalid("deterministic-stage shape mismatch")
        name = _name(stage.get("stage"), "stage")
        if stage.get("index") != index or name != stage_order[index]:
            raise Invalid("stage order mismatch")
        if stage.get("rule") != "pw-r9-exact-input-frozen-artifact-v1":
            raise Invalid("stage rule mismatch")
        predecessors = stage.get("predecessor_stages")
        direct = stage.get("direct_subject_cells")
        if not isinstance(predecessors, list) or not isinstance(direct, list):
            raise Invalid("stage dependency lists invalid")
        predecessors = [_name(item, f"{name} predecessor") for item in predecessors]
        direct = [_name(item, f"{name} direct cell") for item in direct]
        if len(predecessors) != len(set(predecessors)) or len(direct) != len(set(direct)):
            raise Invalid("duplicate stage dependency")
        if any(item not in stage_order[:index] for item in predecessors):
            raise Invalid("stage predecessor is not earlier")
        if any(item not in cell_by_id for item in direct):
            raise Invalid("stage direct cell absent")
        if not predecessors and not direct:
            raise Invalid("stage has no causal dependency")
        boundary = stage.get("finalization_boundary")
        if not isinstance(boundary, dict) or set(boundary) != {
                "after_cell_index", "after_cell", "stage_order_index"}:
            raise Invalid("stage finalization-boundary shape mismatch")
        after_index = boundary.get("after_cell_index")
        if (isinstance(after_index, bool) or not isinstance(after_index, int)
                or not 0 <= after_index < 97
                or boundary.get("after_cell") != schedule[after_index]
                or boundary.get("stage_order_index") != index):
            raise Invalid("stage finalization-boundary mismatch")
        if any(cell_by_id[item]["index"] > after_index for item in direct):
            raise Invalid("stage direct cell follows finalization boundary")
        artifact = stage.get("expected_artifact")
        if not isinstance(artifact, dict):
            raise Invalid("expected stage artifact is not an object")
        payload = _semantic_canon(artifact)
        storage = payload + b"\n"
        if (stage.get("expected_artifact_sha256"), stage.get("expected_artifact_bytes")) != (
                _sha(payload), len(payload)):
            raise Invalid("expected artifact payload identity mismatch")
        if (stage.get("expected_artifact_storage_sha256"),
                stage.get("expected_artifact_storage_bytes")) != (_sha(storage), len(storage)):
            raise Invalid("expected artifact storage identity mismatch")
        stage["predecessor_stages"] = predecessors
        stage["direct_subject_cells"] = direct
        stage_by_id[name] = stage

    for cell in cells:
        gate = cell["dependency_gate"]
        if any(item not in cell_by_id or cell_by_id[item]["index"] >= cell["index"]
               for item in gate["required_pass_cells"]):
            raise Invalid("cell PASS dependency is absent or not earlier")
        for name in gate["required_stage_artifacts"]:
            if name not in stage_by_id:
                raise Invalid("cell stage dependency absent")
            boundary = stage_by_id[name]["finalization_boundary"]["after_cell_index"]
            if boundary >= cell["index"]:
                raise Invalid("cell stage dependency is not finalized earlier")

    files = semantic["files"]
    if not isinstance(files, list) or not files:
        raise Invalid("semantic file inventory absent")
    file_paths: list[str] = []
    for item in files:
        if not isinstance(item, dict) or set(item) != {"path", "sha256", "bytes"}:
            raise Invalid("semantic file binding shape mismatch")
        if not isinstance(item.get("path"), str):
            raise Invalid("semantic source path absent")
        relative = Path(item["path"])
        if relative.is_absolute() or ".." in relative.parts or not relative.parts:
            raise Invalid("semantic source path is unsafe")
        if "__pycache__" in relative.parts or relative.suffix in {".pyc", ".pyo"}:
            raise Invalid("runtime cache is forbidden from semantic inventory")
        resolved = (SUCCESSOR / relative).resolve()
        try:
            resolved.relative_to(SUCCESSOR)
        except ValueError as exc:
            raise Invalid("semantic source escapes successor root") from exc
        storage = _regular(resolved, f"semantic source {relative.as_posix()}")
        if (item.get("sha256"), item.get("bytes")) != (_sha(storage), len(storage)):
            raise Invalid(f"semantic file drift: {relative.as_posix()}")
        file_paths.append(relative.as_posix())
    if file_paths != sorted(file_paths) or len(file_paths) != len(set(file_paths)):
        raise Invalid("semantic file inventory is not sorted unique")

    canary = semantic["canary_cell"]
    if canary not in cell_by_id:
        raise Invalid("canary cell absent")
    bundle, bundle_storages = _bundle()
    return {
        "operating_bytes": operating_bytes, "architecture_bytes": architecture_bytes,
        "semantic_bytes": semantic_bytes, "pipeline_bytes": pipeline_bytes,
        "semantic": semantic, "pipeline": pipeline, "routes": routes, "schedule": schedule,
        "cells": cells, "cell_by_id": cell_by_id, "stage_order": stage_order,
        "stages": stages, "stage_by_id": stage_by_id, "canary": canary,
        "bundle": bundle, "bundle_storages": bundle_storages,
    }


def _evidence_root(command: str, create_default: bool) -> Path:
    override = os.environ.get(SIMULATOR_EVIDENCE_ENV) if command in {"simulate", "reopen"} else None
    if override:
        raw = Path(override)
        if not raw.is_absolute():
            raise Invalid(f"{SIMULATOR_EVIDENCE_ENV} must be absolute")
        _dir(raw, "simulator evidence root")
        return raw.resolve()
    if create_default and not DEFAULT_EVIDENCE.exists():
        _mkdir(DEFAULT_EVIDENCE)
    else:
        _dir(DEFAULT_EVIDENCE, "evidence root")
    return DEFAULT_EVIDENCE.resolve()


def _run_root(text: str, create: bool, evidence: Path) -> Path:
    if not text:
        raise Invalid("--run-root required")
    path = Path(text)
    if not path.is_absolute() and len(path.parts) == 1:
        path = evidence / path
    path = path.resolve()
    if path.parent != evidence:
        raise Invalid("run root must be a direct child of the selected evidence root")
    _name(path.name, "run id")
    if create:
        if path.exists() or path.is_symlink():
            raise Invalid("run exists; resume and relaunch are forbidden")
        _mkdir(path)
        for directory in (path / "cells", path / "artifacts", path / "terminals"):
            _mkdir(directory)
    else:
        _dir(path, "run root")
    return path


def _rows(run_kind: str, controls: dict[str, Any]) -> tuple[list[dict[str, Any]], int]:
    cells = controls["cells"]
    if run_kind == "run-canary":
        cells = [controls["cell_by_id"][controls["canary"]]]
    rows = [
        {"ordinal": ordinal, "slot": route["slot"], "route": route,
         "index": cell["index"], "cell": cell["cell"], "nonce": secrets.token_hex(32)}
        for ordinal, (route, cell) in enumerate(
            (route, cell) for route in controls["routes"] for cell in cells
        )
    ]
    expected = 3 if run_kind == "run-canary" else 291
    if len(rows) != expected:
        raise Invalid("selected row count mismatch")
    return rows, len(cells)


def _used_values(evidence: Path) -> set[str]:
    used: set[str] = set()
    for run_root in sorted(evidence.iterdir(), key=lambda item: item.name):
        _dir(run_root, f"prior run {run_root.name}")
        if (run_root / "run.json").exists():
            _, run = _json(run_root / "run.json", "prior run")
            for row in run.get("schedule", []):
                nonce = row.get("nonce") if isinstance(row, dict) else None
                if not isinstance(nonce, str) or not NONCE.fullmatch(nonce) or nonce in used:
                    raise Invalid("prior nonce absent or duplicated")
                used.add(nonce)
        cells = run_root / "cells"
        for path in sorted(cells.glob("*/*/raw_result.json")) if cells.is_dir() else []:
            _, raw = _json(path, "prior raw result")
            result = raw.get("backend_result")
            if not isinstance(result, dict):
                raise Invalid("prior backend result malformed")
            for key in ("task_id", "thread_id", "turn_id"):
                identity = result.get(key)
                if not isinstance(identity, str) or not identity or identity in used:
                    raise Invalid("prior task/thread/turn absent or duplicated")
                used.add(identity)
    return used


def _row_path(root: Path, row: dict[str, Any]) -> Path:
    return root / "cells" / row["slot"] / f"{row['index']:03d}_{row['cell']}"


def _artifact_path(root: Path, slot: str, stage: str) -> Path:
    return root / "artifacts" / slot / f"{stage}.json"


def _request(run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any],
             attempt_id: tuple[str, int]) -> dict[str, Any]:
    storage = cell["render_utf8"].encode("utf-8")
    provider = storage[:-1]
    request = {
        "schema_id": "pw-r9-backend-request-v1", "mode": run["mode"],
        "run_id": run["run_id"], "slot": row["slot"], "cell": row["cell"],
        "index": row["index"], "route": row["route"], "nonce": row["nonce"],
        "provider_input_utf8": provider.decode("utf-8"),
        "provider_input_sha256": _sha(provider), "provider_input_bytes": len(provider),
        "attempt_sha256": attempt_id[0], "attempt_bytes": attempt_id[1],
    }
    if run["mode"] == "synthetic":
        request.update(scenario=run["scenario"],
                       synthetic_expected_output_utf8=(_semantic_canon(cell["expected_output"]) + b"\n").decode("utf-8"))
    return request


def _result(result: Any, request: dict[str, Any], used: set[str] | None) -> dict[str, Any]:
    required = {
        "schema_id", "mode", "terminal", "nonce", "resolved_route",
        "provider_input_sha256", "provider_input_bytes", "task_id", "thread_id", "turn_id",
        "returncode", "stdout_utf8", "stderr_utf8", "process", "dispatch_count",
        "retry_count", "best_of", "replacement_result", "terminal_status", "first_attempt",
        "fresh_context", "provider_model_fallback_allowed", "output_capture", "rollout",
    }
    if not isinstance(result, dict) or not required.issubset(result):
        raise Invalid("backend result shape mismatch")
    if (result["schema_id"], result["mode"], result["terminal"], result["nonce"],
        result["resolved_route"], result["provider_input_sha256"], result["provider_input_bytes"]) != (
        "pw-r9-backend-result-v1", request["mode"], True, request["nonce"], request["route"],
        request["provider_input_sha256"], request["provider_input_bytes"]):
        raise Invalid("backend terminal/request binding mismatch")
    for key in ("task_id", "thread_id", "turn_id"):
        identity = result[key]
        if not isinstance(identity, str) or not identity or (used is not None and identity in used):
            raise Invalid(f"backend {key} absent or not globally fresh")
        if used is not None:
            used.add(identity)
    if isinstance(result["returncode"], bool) or not isinstance(result["returncode"], int):
        raise Invalid("backend returncode invalid")
    if not isinstance(result["stdout_utf8"], str) or not isinstance(result["stderr_utf8"], str):
        raise Invalid("backend output capture invalid")
    process = result["process"]
    process_fields = {
        "kind", "pid", "started_utc", "ended_utc", "terminal_reason", "poll_count",
        "live_poll_count", "polls", "task_complete_observed", "task_terminal",
        "child_reaped", "reap_action", "protocol_stdout_sha256", "protocol_stdout_bytes",
        "stderr_sha256", "stderr_bytes",
    }
    if not isinstance(process, dict) or not process_fields.issubset(process):
        raise Invalid("backend process metadata incomplete")
    if not all(isinstance(process[key], str) and process[key]
               for key in ("kind", "started_utc", "ended_utc", "reap_action")):
        raise Invalid("backend process metadata invalid")
    if process["pid"] is not None and (isinstance(process["pid"], bool) or not isinstance(process["pid"], int)):
        raise Invalid("backend pid invalid")
    polls = process["polls"]
    if (isinstance(process["poll_count"], bool) or not isinstance(process["poll_count"], int)
            or not isinstance(polls, list) or process["poll_count"] != len(polls) or not polls):
        raise Invalid("backend poll metadata invalid")
    terminal = process["task_terminal"]
    if (result["terminal_status"] != "TASK_COMPLETE"
            or process["terminal_reason"] != "TASK_COMPLETE"
            or process["task_complete_observed"] is not True
            or process["child_reaped"] is not True
            or not isinstance(terminal, dict)
            or terminal.get("type") != "task_complete"
            or terminal.get("turn_id") != result["turn_id"]):
        raise Invalid("backend transport is not TASK_COMPLETE, terminal, reaped, and bound")
    if (result["dispatch_count"], result["retry_count"], result["best_of"],
            result["replacement_result"], result["first_attempt"], result["fresh_context"],
            result["provider_model_fallback_allowed"]) != (1, 0, False, False, True, True, False):
        raise Invalid("backend dispatch/retry/freshness mismatch")
    output = result["stdout_utf8"].encode("utf-8")
    capture = result["output_capture"]
    if (not isinstance(capture, dict)
            or (capture.get("sha256"), capture.get("bytes")) != (_sha(output), len(output))):
        raise Invalid("backend output-capture binding mismatch")
    stderr = result["stderr_utf8"].encode("utf-8")
    if (process["stderr_sha256"], process["stderr_bytes"]) != (_sha(stderr), len(stderr)):
        raise Invalid("backend stderr binding mismatch")
    _canon(result)
    return result


def _score(result: dict[str, Any], cell: dict[str, Any]) -> dict[str, Any]:
    wanted = _semantic_canon(cell["expected_output"]) + b"\n"
    actual = result["stdout_utf8"].encode("utf-8")
    if result["returncode"] != 0:
        verdict, reason = "FAIL", "NONZERO_AFTER_TASK_COMPLETE"
    elif actual != wanted:
        verdict, reason = "FAIL", "EXACT_OUTPUT_MISMATCH"
    else:
        verdict, reason = "PASS", "EXACT_CANONICAL_OUTPUT_MATCH"
    return {
        "rule": "EXACT_CANONICAL_JSON_PLUS_ONE_LF", "verdict": verdict, "reason": reason,
        "expected_sha256": _sha(wanted), "expected_bytes": len(wanted),
        "actual_sha256": _sha(actual), "actual_bytes": len(actual),
        "returncode": result["returncode"],
    }


def _reopen_artifact(root: Path, slot: str, stage: dict[str, Any]) -> dict[str, Any]:
    path = _artifact_path(root, slot, stage["stage"])
    storage, value = _semantic_json(path, f"stage artifact {slot}/{stage['stage']}")
    expected_storage = _semantic_canon(stage["expected_artifact"]) + b"\n"
    if storage != expected_storage or value != stage["expected_artifact"]:
        raise Invalid(f"stage artifact drift: {slot}/{stage['stage']}")
    if (stage["expected_artifact_storage_sha256"], stage["expected_artifact_storage_bytes"]) != (
            _sha(storage), len(storage)):
        raise Invalid("stage artifact manifest identity mismatch")
    return _evidence_binding(root, path, storage, "STAGE_ARTIFACT", stage["stage"])


def _causal_inputs(root: Path, run: dict[str, Any], row: dict[str, Any],
                   cell: dict[str, Any], controls: dict[str, Any],
                   memo: dict[tuple[str, str, str], dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    memo = {} if memo is None else memo
    references: list[dict[str, Any]] = []
    for cell_id in cell["dependency_gate"]["required_pass_cells"]:
        dependency_row = next((item for item in run["schedule"]
                               if item["slot"] == row["slot"] and item["cell"] == cell_id), None)
        if dependency_row is None:
            raise Invalid(f"declared PASS-cell dependency was not scheduled: {cell_id}")
        key = (row["slot"], "cell", cell_id)
        dependency = memo.get(key)
        if dependency is None:
            dependency_cell = controls["cell_by_id"][cell_id]
            dependency = _reopen_row(root, run, dependency_row, dependency_cell, controls, memo)
            memo[key] = dependency
        if dependency["status"] != "PASS":
            raise Invalid(f"declared PASS-cell dependency did not PASS: {cell_id}")
        path = _row_path(root, dependency_row) / "completion.json"
        storage = _regular(path, f"dependency completion {cell_id}")
        references.append(_evidence_binding(root, path, storage, "PASS_CELL", cell_id))
    for stage_id in cell["dependency_gate"]["required_stage_artifacts"]:
        key = (row["slot"], "stage", stage_id)
        reference = memo.get(key)
        if reference is None:
            reference = _reopen_artifact(root, row["slot"], controls["stage_by_id"][stage_id])
            memo[key] = reference
        references.append(reference)
    references.sort(key=lambda item: (item["kind"], item["id"], item["path"]))
    return references


def _reopen_row(root: Path, run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any],
                controls: dict[str, Any],
                memo: dict[tuple[str, str, str], dict[str, Any]] | None = None) -> dict[str, Any]:
    memo = {} if memo is None else memo
    path = _row_path(root, row)
    _dir(path, "row directory")
    if sorted(item.name for item in path.iterdir()) != [
            "attempt.json", "completion.json", "provider_input.txt", "raw_result.json"]:
        raise Invalid("row file inventory mismatch")
    render = _regular(path / "provider_input.txt", "provider input")
    if render != cell["render_utf8"].encode("utf-8"):
        raise Invalid("render drift")
    attempt_bytes, attempt = _json(path / "attempt.json", "attempt")
    raw_bytes, raw = _json(path / "raw_result.json", "raw result")
    _, completion = _json(path / "completion.json", "completion")
    provider = render[:-1]
    causal_inputs = _causal_inputs(root, run, row, cell, controls, memo)
    expected_attempt = {
        "schema_id": "pw-r9-attempt-v2", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "route": row["route"],
        "nonce": row["nonce"], "causal_inputs": causal_inputs,
        "render_storage_sha256": _sha(render), "render_storage_bytes": len(render),
        "provider_input_sha256": _sha(provider), "provider_input_bytes": len(provider),
        "attempt": 1, "retry_count": 0, "best_of": False, "replacement_result": False,
        "no_retry": True, "no_relaunch": True,
    }
    if attempt != expected_attempt:
        raise Invalid("attempt binding mismatch")
    if (raw.get("attempt_sha256"), raw.get("attempt_bytes")) != (_sha(attempt_bytes), len(attempt_bytes)):
        raise Invalid("raw-result attempt binding mismatch")
    request = _request(run, row, cell, (_sha(attempt_bytes), len(attempt_bytes)))
    result = _result(raw.get("backend_result"), request, None)
    score = _score(result, cell)
    expected_completion = {
        "schema_id": "pw-r9-completion-v2", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "route": row["route"],
        "nonce": row["nonce"], "task_id": result["task_id"],
        "thread_id": result["thread_id"], "turn_id": result["turn_id"],
        "render_storage_sha256": _sha(render), "render_storage_bytes": len(render),
        "provider_input_sha256": _sha(provider), "provider_input_bytes": len(provider),
        "attempt_sha256": _sha(attempt_bytes), "attempt_bytes": len(attempt_bytes),
        "raw_result_sha256": _sha(raw_bytes), "raw_result_bytes": len(raw_bytes),
        "score": score, "status": score["verdict"], "attempt": 1, "retry_count": 0,
        "best_of": False, "replacement_result": False, "completion_is_last_row_write": True,
    }
    if completion != expected_completion:
        raise Invalid("completion binding mismatch")
    complete_storage = _canon(completion) + b"\n"
    record = {
        "ordinal": row["ordinal"], "slot": row["slot"], "cell": row["cell"],
        "index": row["index"], "status": score["verdict"], "nonce": row["nonce"],
        "task_id": result["task_id"], "thread_id": result["thread_id"],
        "turn_id": result["turn_id"], "completion_sha256": _sha(complete_storage),
        "completion_bytes": len(complete_storage),
    }
    memo[(row["slot"], "cell", row["cell"])] = record
    return record


def _seal(root: Path, run: dict[str, Any], row: dict[str, Any], cell: dict[str, Any],
          controls: dict[str, Any], used: set[str]) -> dict[str, Any]:
    causal_inputs = _causal_inputs(root, run, row, cell, controls)
    slot = root / "cells" / row["slot"]
    if not slot.exists():
        _mkdir(slot)
    path = _row_path(root, row)
    _mkdir(path)
    render = cell["render_utf8"].encode("utf-8")
    render_id = _write(path / "provider_input.txt", render)
    provider = render[:-1]
    attempt = {
        "schema_id": "pw-r9-attempt-v2", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "route": row["route"],
        "nonce": row["nonce"], "causal_inputs": causal_inputs,
        "render_storage_sha256": render_id[0], "render_storage_bytes": render_id[1],
        "provider_input_sha256": _sha(provider), "provider_input_bytes": len(provider),
        "attempt": 1, "retry_count": 0, "best_of": False, "replacement_result": False,
        "no_retry": True, "no_relaunch": True,
    }
    attempt_id = _write_json(path / "attempt.json", attempt)
    request = _request(run, row, cell, attempt_id)
    started = time.monotonic_ns()
    returned = invoke(request)
    ended = time.monotonic_ns()
    raw = {
        "schema_id": "pw-r9-raw-result-v2", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "attempt_sha256": attempt_id[0],
        "attempt_bytes": attempt_id[1], "dispatch_started_monotonic_ns": started,
        "dispatch_ended_monotonic_ns": ended, "backend_result": returned,
    }
    raw_id = _write_json(path / "raw_result.json", raw)
    result = _result(returned, request, used)
    if _regular(path / "provider_input.txt", "post-terminal provider input") != render:
        raise Invalid("render mutated after admission")
    if _causal_inputs(root, run, row, cell, controls) != causal_inputs:
        raise Invalid("causal inputs mutated after admission")
    score = _score(result, cell)
    completion = {
        "schema_id": "pw-r9-completion-v2", "run_id": root.name, "slot": row["slot"],
        "cell": row["cell"], "index": row["index"], "route": row["route"],
        "nonce": row["nonce"], "task_id": result["task_id"],
        "thread_id": result["thread_id"], "turn_id": result["turn_id"],
        "render_storage_sha256": render_id[0], "render_storage_bytes": render_id[1],
        "provider_input_sha256": _sha(provider), "provider_input_bytes": len(provider),
        "attempt_sha256": attempt_id[0], "attempt_bytes": attempt_id[1],
        "raw_result_sha256": raw_id[0], "raw_result_bytes": raw_id[1], "score": score,
        "status": score["verdict"], "attempt": 1, "retry_count": 0, "best_of": False,
        "replacement_result": False, "completion_is_last_row_write": True,
    }
    _write_json(path / "completion.json", completion)
    return _reopen_row(root, run, row, cell, controls)


def _stage_inputs(root: Path, run: dict[str, Any], slot: str, stage: dict[str, Any],
                  controls: dict[str, Any]) -> list[dict[str, Any]] | None:
    references: list[dict[str, Any]] = []
    for cell_id in stage["direct_subject_cells"]:
        row = next((item for item in run["schedule"]
                    if item["slot"] == slot and item["cell"] == cell_id), None)
        if row is None:
            return None
        path = _row_path(root, row)
        if not path.exists() and not path.is_symlink():
            return None
        record = _reopen_row(root, run, row, controls["cell_by_id"][cell_id], controls)
        if record["status"] != "PASS":
            return None
        completion_path = path / "completion.json"
        storage = _regular(completion_path, f"stage direct cell {cell_id}")
        references.append(_evidence_binding(root, completion_path, storage, "PASS_CELL", cell_id))
    for predecessor in stage["predecessor_stages"]:
        path = _artifact_path(root, slot, predecessor)
        if not path.exists() and not path.is_symlink():
            return None
        references.append(_reopen_artifact(root, slot, controls["stage_by_id"][predecessor]))
    references.sort(key=lambda item: (item["kind"], item["id"], item["path"]))
    return references


def _finalize_eligible(root: Path, run: dict[str, Any], slot: str, after_index: int,
                       controls: dict[str, Any]) -> list[str]:
    created: list[str] = []
    slot_root = root / "artifacts" / slot
    if not slot_root.exists():
        _mkdir(slot_root)
    for stage in controls["stages"]:
        path = _artifact_path(root, slot, stage["stage"])
        eligible_boundary = stage["finalization_boundary"]["after_cell_index"] <= after_index
        inputs = _stage_inputs(root, run, slot, stage, controls) if eligible_boundary else None
        exists = path.exists() or path.is_symlink()
        if exists:
            if inputs is None:
                raise Invalid(f"stage artifact exists before eligibility: {slot}/{stage['stage']}")
            _reopen_artifact(root, slot, stage)
            continue
        if inputs is None:
            continue
        storage = _semantic_canon(stage["expected_artifact"]) + b"\n"
        if (_sha(storage), len(storage)) != (
                stage["expected_artifact_storage_sha256"], stage["expected_artifact_storage_bytes"]):
            raise Invalid("stage storage identity drift before finalization")
        _write(path, storage)
        _reopen_artifact(root, slot, stage)
        created.append(stage["stage"])
    return created


def _terminalize(root: Path, run: dict[str, Any], controls: dict[str, Any],
                 cause: dict[str, str] | None, failed_slots: dict[str, int]) -> None:
    if cause and cause["kind"] == "CONTROLLER_INVALID":
        _write_json(root / "controller_invalid.json", {
            "schema_id": "pw-r9-controller-invalid-v2", "run_id": root.name,
            "kind": cause["kind"], "detail": cause["detail"],
        })
    path_records: list[dict[str, Any]] = []
    path_ids: list[dict[str, Any]] = []
    for route in controls["routes"]:
        slot = route["slot"]
        scheduled = [row for row in run["schedule"] if row["slot"] == slot]
        complete: list[dict[str, Any]] = []
        invalid: list[dict[str, Any]] = []
        ineligible: list[int] = []
        stopped: list[int] = []
        aborted: list[int] = []
        missing: list[int] = []
        memo: dict[tuple[str, str, str], dict[str, Any]] = {}
        for row in scheduled:
            path = _row_path(root, row)
            if path.exists() or path.is_symlink():
                try:
                    record = _reopen_row(root, run, row, controls["cell_by_id"][row["cell"]], controls, memo)
                    if slot in failed_slots and row["ordinal"] > failed_slots[slot]:
                        invalid.append({"ordinal": row["ordinal"], "reason": "POST_SUBJECT_FAIL_DISPATCH"})
                    else:
                        complete.append(record)
                except Invalid as exc:
                    invalid.append({"ordinal": row["ordinal"], "reason": str(exc)})
                continue
            if slot in failed_slots and row["ordinal"] > failed_slots[slot]:
                ineligible.append(row["ordinal"])
            elif cause and cause["kind"] == "STOPPED_AFTER_DRAIN":
                stopped.append(row["ordinal"])
            elif cause and cause["kind"] == "CONTROLLER_INVALID":
                aborted.append(row["ordinal"])
            else:
                missing.append(row["ordinal"])
        fail_records = [item for item in complete if item["status"] == "FAIL"]
        if len(fail_records) > 1:
            invalid.append({"ordinal": fail_records[1]["ordinal"], "reason": "MULTIPLE_SUBJECT_FAILS_IN_SLOT"})
        if slot in failed_slots and (not fail_records or fail_records[0]["ordinal"] != failed_slots[slot]):
            invalid.append({"ordinal": failed_slots[slot], "reason": "SUBJECT_FAIL_STOP_BINDING_MISMATCH"})

        artifact_rows: list[dict[str, Any]] = []
        invalid_artifacts: list[dict[str, str]] = []
        missing_artifacts: list[str] = []
        eligible: set[str] = set()
        passed_cells = {item["cell"] for item in complete if item["status"] == "PASS"}
        slot_artifacts = root / "artifacts" / slot
        if slot_artifacts.exists() or slot_artifacts.is_symlink():
            try:
                _dir(slot_artifacts, f"artifact slot {slot}")
            except Invalid as exc:
                invalid_artifacts.append({"stage": "*", "reason": str(exc)})
        for stage in controls["stages"]:
            is_eligible = (all(item in passed_cells for item in stage["direct_subject_cells"])
                           and all(item in eligible for item in stage["predecessor_stages"]))
            if is_eligible:
                eligible.add(stage["stage"])
            path = _artifact_path(root, slot, stage["stage"])
            exists = path.exists() or path.is_symlink()
            if not exists:
                if is_eligible:
                    missing_artifacts.append(stage["stage"])
                continue
            if not is_eligible:
                invalid_artifacts.append({"stage": stage["stage"], "reason": "ARTIFACT_NOT_ELIGIBLE"})
                continue
            try:
                reference = _reopen_artifact(root, slot, stage)
                artifact_rows.append({"stage": stage["stage"], "path": reference["path"],
                                      "sha256": reference["sha256"], "bytes": reference["bytes"]})
            except Invalid as exc:
                invalid_artifacts.append({"stage": stage["stage"], "reason": str(exc)})
        if slot_artifacts.is_dir():
            expected_names = {f"{item}.json" for item in controls["stage_order"]}
            for item in sorted(slot_artifacts.iterdir(), key=lambda path: path.name):
                if item.name not in expected_names:
                    invalid_artifacts.append({"stage": item.name, "reason": "UNDECLARED_ARTIFACT_PATH"})

        passed = sum(item["status"] == "PASS" for item in complete)
        failed = sum(item["status"] == "FAIL" for item in complete)
        if invalid or invalid_artifacts or missing_artifacts or missing:
            status = "CONTROLLER_INVALID"
        elif aborted:
            status = "CONTROLLER_ABORTED"
        elif stopped:
            status = "STOPPED_AFTER_DRAIN"
        elif failed:
            status = "VALID_SUBJECT_FAIL"
        elif len(complete) == len(scheduled):
            status = "PASS"
        else:
            status = "CONTROLLER_INVALID"
        inventory = _canon(complete)
        record = {
            "schema_id": "pw-r9-path-terminal-v2", "run_id": root.name, "slot": slot,
            "status": status, "scheduled_rows": len(scheduled), "completed_rows": len(complete),
            "pass_rows": passed, "subject_fail_rows": failed, "invalid_rows": invalid,
            "ineligible_after_subject_fail_ordinals": ineligible,
            "stopped_after_signal_ordinals": stopped, "controller_aborted_ordinals": aborted,
            "missing_ordinals": missing, "stage_artifacts": artifact_rows,
            "stage_artifact_count": len(artifact_rows), "eligible_stage_count": len(eligible),
            "missing_stage_artifacts": missing_artifacts, "invalid_stage_artifacts": invalid_artifacts,
            "completion_inventory_sha256": _sha(inventory),
            "completion_inventory_bytes": len(inventory),
        }
        path_records.append(record)
        identity = _write_json(root / "terminals" / f"{slot}.json", record)
        path_ids.append({"slot": slot, "sha256": identity[0], "bytes": identity[1]})

    scheduled_count = sum(item["scheduled_rows"] for item in path_records)
    completed_count = sum(item["completed_rows"] for item in path_records)
    passed_count = sum(item["pass_rows"] for item in path_records)
    failed_count = sum(item["subject_fail_rows"] for item in path_records)
    invalid_count = sum(len(item["invalid_rows"]) + len(item["invalid_stage_artifacts"])
                        + len(item["missing_stage_artifacts"]) for item in path_records)
    ineligible_count = sum(len(item["ineligible_after_subject_fail_ordinals"]) for item in path_records)
    stopped_count = sum(len(item["stopped_after_signal_ordinals"]) for item in path_records)
    aborted_count = sum(len(item["controller_aborted_ordinals"]) for item in path_records)
    missing_count = sum(len(item["missing_ordinals"]) for item in path_records)
    artifact_count = sum(item["stage_artifact_count"] for item in path_records)
    full_matrix = run["planned_call_count"] == 291
    clean_matrix = (full_matrix and passed_count == 291 and failed_count == 0
                    and invalid_count == 0 and ineligible_count == 0 and stopped_count == 0
                    and aborted_count == 0 and missing_count == 0 and artifact_count == 54)
    if cause and cause["kind"] == "CONTROLLER_INVALID" or invalid_count or missing_count:
        status = "CONTROLLER_INVALID"
    elif cause and cause["kind"] == "STOPPED_AFTER_DRAIN" or stopped_count:
        status = "STOPPED_AFTER_DRAIN"
    elif failed_count:
        status = "VALID_SUBJECT_FAIL"
    elif full_matrix and clean_matrix:
        status = "PASS"
    elif not full_matrix and completed_count == scheduled_count and passed_count == scheduled_count:
        status = "PASS"
    else:
        status = "CONTROLLER_INVALID"
    matrix = {
        "schema_id": "pw-r9-matrix-terminal-v2", "run_id": root.name, "status": status,
        "cause": cause, "scheduled_rows": scheduled_count, "completed_rows": completed_count,
        "pass_rows": passed_count, "subject_fail_rows": failed_count, "invalid_rows": invalid_count,
        "ineligible_rows": ineligible_count, "stopped_rows": stopped_count,
        "controller_aborted_rows": aborted_count, "missing_rows": missing_count,
        "stage_artifact_count": artifact_count,
        "required_clean_stage_artifacts": 54 if full_matrix else 0,
        "clean_matrix": clean_matrix, "path_terminals": path_ids,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    }
    matrix_id = _write_json(root / "matrix_terminal.json", matrix)
    attempts = len(list((root / "cells").glob("*/*/attempt.json")))
    raw = len(list((root / "cells").glob("*/*/raw_result.json")))
    completions = len(list((root / "cells").glob("*/*/completion.json")))
    _write_json(root / "accounting.json", {
        "schema_id": "pw-r9-accounting-v2", "run_id": root.name, "status": status,
        "matrix_terminal_sha256": matrix_id[0], "matrix_terminal_bytes": matrix_id[1],
        "planned_calls": scheduled_count, "attempts": attempts, "captured_raw_results": raw,
        "valid_completions": completions, "pass_rows": passed_count,
        "subject_fail_rows": failed_count, "ineligible_rows": ineligible_count,
        "stopped_rows": stopped_count, "controller_aborted_rows": aborted_count,
        "invalid_rows": invalid_count, "missing_rows": missing_count,
        "stage_artifact_count": artifact_count, "unknown_or_uncaptured_dispatches": attempts - raw,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    })


RUN_FIELDS = {
    "schema_id", "operating_contract", "run_id", "run_kind", "mode", "scenario",
    "created_utc", "git_head", "custody_mode", "bundle", "semantic_manifest",
    "pipeline_contract", "routes", "schedule", "route_count", "cells_per_route",
    "planned_call_count", "stage_count", "retry_count", "best_of", "replacement_count",
}


def _reopen(root: Path, controls: dict[str, Any], evidence: Path) -> dict[str, Any]:
    run_bytes, run = _json(root / "run.json", "run")
    if set(run) != RUN_FIELDS or run.get("schema_id") != "pw-r9-run-v2" or run.get("run_id") != root.name:
        raise Invalid("run identity or shape mismatch")
    operating_binding = _binding(OPERATING, controls["operating_bytes"], REPO)
    semantic_binding = _binding(SEMANTIC, controls["semantic_bytes"])
    pipeline_binding = _binding(PIPELINE, controls["pipeline_bytes"])
    if run["operating_contract"] != operating_binding or run["semantic_manifest"] != semantic_binding:
        raise Invalid("run operating/semantic binding mismatch")
    if run["pipeline_contract"] != pipeline_binding or run["bundle"] != controls["bundle"]:
        raise Invalid("run pipeline/bundle binding mismatch")
    if run["routes"] != controls["routes"] or run["route_count"] != 3 or run["stage_count"] != 18:
        raise Invalid("run route/stage binding mismatch")
    if not isinstance(run["git_head"], str) or not GIT_HEAD.fullmatch(run["git_head"]):
        raise Invalid("recorded run Git HEAD is invalid")
    if run["mode"] == "actual":
        if run["custody_mode"] != "GIT_HEAD_PINNED":
            raise Invalid("actual run lacks Git custody")
        _require_head_custody(run["git_head"], controls["bundle"], controls["bundle_storages"])
    elif run["mode"] != "synthetic" or run["custody_mode"] != "WORKTREE_EXACT_BUNDLE":
        raise Invalid("run custody mode mismatch")
    schedule = run["schedule"]
    if not isinstance(schedule, list) or len(schedule) != run["planned_call_count"]:
        raise Invalid("run planned schedule mismatch")
    for ordinal, row in enumerate(schedule):
        if not isinstance(row, dict) or set(row) != {"ordinal", "slot", "route", "index", "cell", "nonce"}:
            raise Invalid("run schedule row shape mismatch")
        if row["ordinal"] != ordinal or not isinstance(row["nonce"], str) or not NONCE.fullmatch(row["nonce"]):
            raise Invalid("run schedule ordinal/nonce mismatch")
        if row["route"] not in controls["routes"] or row["slot"] != row["route"]["slot"]:
            raise Invalid("run schedule route mismatch")
        cell = controls["cell_by_id"].get(row["cell"])
        if cell is None or row["index"] != cell["index"]:
            raise Invalid("run schedule cell mismatch")
    if len({row["nonce"] for row in schedule}) != len(schedule):
        raise Invalid("run nonce plan is not unique")
    expected_cells = 1 if run["run_kind"] == "run-canary" else 97
    if run["cells_per_route"] != expected_cells or run["planned_call_count"] != 3 * expected_cells:
        raise Invalid("run cardinality mismatch")

    matrix_bytes, matrix = _json(root / "matrix_terminal.json", "matrix terminal")
    _, accounting = _json(root / "accounting.json", "accounting")
    if (accounting.get("matrix_terminal_sha256"), accounting.get("matrix_terminal_bytes")) != (
            _sha(matrix_bytes), len(matrix_bytes)):
        raise Invalid("matrix/accounting binding mismatch")
    expected = {
        "schema_id": "pw-r9-verifier-expectation-v2", "run_id": root.name,
        "run_kind": run["run_kind"], "planned_call_count": run["planned_call_count"],
        "evidence_root": str(evidence), "operating_contract": operating_binding,
        "bundle": controls["bundle"], "semantic_manifest": semantic_binding,
        "pipeline_contract": pipeline_binding,
    }
    report = verify(root, expected)
    if not isinstance(report, dict) or not isinstance(report.get("valid"), bool):
        raise Invalid("offline verifier report shape mismatch")
    status = matrix.get("status") if report["valid"] else "CONTROLLER_INVALID"
    return {
        "schema_id": "pw-r9-reopen-result-v2", "run_id": root.name,
        "run_sha256": _sha(run_bytes), "run_bytes": len(run_bytes), "status": status,
        "matrix_status": matrix.get("status"), "offline_verifier": report,
    }


def _stop(_signum: int, _frame: Any) -> None:
    global STOP
    STOP = True


def _execute(run_kind: str, name: str, scenario: str) -> dict[str, Any]:
    global STOP
    controls = _controls()
    evidence = _evidence_root(run_kind, True)
    used = _used_values(evidence)
    root = _run_root(name, True, evidence)
    rows, cells_per_route = _rows(run_kind, controls)
    nonces = [row["nonce"] for row in rows]
    if len(set(nonces)) != len(nonces) or any(item in used for item in nonces):
        raise Invalid("nonce plan not globally fresh")
    used.update(nonces)
    mode = "synthetic" if run_kind == "simulate" else "actual"
    head = _git_head()
    if mode == "actual":
        _require_head_custody(head, controls["bundle"], controls["bundle_storages"])
    run = {
        "schema_id": "pw-r9-run-v2",
        "operating_contract": _binding(OPERATING, controls["operating_bytes"], REPO),
        "run_id": root.name, "run_kind": run_kind, "mode": mode,
        "scenario": scenario if mode == "synthetic" else None, "created_utc": _utc_now(),
        "git_head": head,
        "custody_mode": "WORKTREE_EXACT_BUNDLE" if mode == "synthetic" else "GIT_HEAD_PINNED",
        "bundle": controls["bundle"],
        "semantic_manifest": _binding(SEMANTIC, controls["semantic_bytes"]),
        "pipeline_contract": _binding(PIPELINE, controls["pipeline_bytes"]),
        "routes": controls["routes"], "schedule": rows, "route_count": 3,
        "cells_per_route": cells_per_route, "planned_call_count": len(rows), "stage_count": 18,
        "retry_count": 0, "best_of": False, "replacement_count": 0,
    }
    _write_json(root / "run.json", run)
    cause: dict[str, str] | None = None
    failed_slots: dict[str, int] = {}
    STOP = False
    old_int = signal.signal(signal.SIGINT, _stop)
    old_term = signal.signal(signal.SIGTERM, _stop)
    try:
        for row in rows:
            if STOP:
                cause = {"kind": "STOPPED_AFTER_DRAIN", "detail": "signal before next admission"}
                break
            if row["slot"] in failed_slots:
                continue
            try:
                record = _seal(root, run, row, controls["cell_by_id"][row["cell"]], controls, used)
                if record["status"] == "PASS":
                    _finalize_eligible(root, run, row["slot"], row["index"], controls)
                else:
                    failed_slots[row["slot"]] = row["ordinal"]
            except Exception as exc:
                cause = {"kind": "CONTROLLER_INVALID",
                         "detail": f"ROW_{row['ordinal']}_INVALID:{type(exc).__name__}:{exc}"}
                break
            if STOP:
                cause = {"kind": "STOPPED_AFTER_DRAIN", "detail": "signal drained admitted invoke through seal"}
                break
    finally:
        signal.signal(signal.SIGINT, old_int)
        signal.signal(signal.SIGTERM, old_term)
    _terminalize(root, run, controls, cause, failed_slots)
    return _reopen(root, controls, evidence)


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="R9 standalone causal controller; internal iteration, zero credit."
    )
    commands = parser.add_subparsers(dest="command", required=True)
    simulate = commands.add_parser("simulate", help="synthetic slot-major causal traversal")
    simulate.add_argument("--run-root", help="new direct child of the selected evidence root")
    simulate.add_argument("--scenario", default="pass", help="synthetic backend scenario")
    simulate.add_argument("--check-only", action="store_true",
                          help="validate controls with zero evidence/backend calls")
    canary = commands.add_parser("run-canary", help="one actual canary call per route")
    canary.add_argument("--run-root", required=True)
    matrix = commands.add_parser("run-matrix", help="actual slot-major 291-row causal matrix")
    matrix.add_argument("--run-root", required=True)
    reopen = commands.add_parser("reopen", help="offline exact-chain reopen")
    reopen.add_argument("--run-root", required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "simulate" and args.check_only:
            controls = _controls()
            result = {
                "schema_id": "pw-r9-control-check-v2", "status": "PASS",
                "backend_invocations": 0, "evidence_writes": 0,
                "routes": len(controls["routes"]), "cells": len(controls["cells"]),
                "matrix_rows": len(controls["routes"]) * len(controls["cells"]),
                "deterministic_stages_per_route": len(controls["stages"]),
                "required_clean_stage_artifacts": 54,
            }
        elif args.command == "simulate":
            result = _execute("simulate", args.run_root, args.scenario)
        elif args.command in {"run-canary", "run-matrix"}:
            result = _execute(args.command, args.run_root, "actual")
        else:
            controls = _controls()
            evidence = _evidence_root("reopen", False)
            result = _reopen(_run_root(args.run_root, False, evidence), controls, evidence)
        sys.stdout.buffer.write(_canon(result) + b"\n")
        if result.get("status") == "PASS":
            return 0
        if result.get("status") == "VALID_SUBJECT_FAIL":
            return 1
        return 2
    except Exception as exc:
        sys.stdout.buffer.write(_canon({
            "schema_id": "pw-r9-controller-error-v2", "status": "CONTROLLER_INVALID",
            "error_type": type(exc).__name__, "error": str(exc),
        }) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
