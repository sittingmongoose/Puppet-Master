#!/usr/bin/env python3
"""Candidate-v12 render/stop-transaction facade over immutable candidate-v11.

No provider integration and no writes. Every transitive runtime dependency is
validated as a regular non-link with exact bytes before candidate-v11 or the
candidate-local controller is dynamically imported.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import stat
import sys
from pathlib import Path
from types import ModuleType
from typing import Any

sys.dont_write_bytecode = True

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-12"
V11_CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-11"
ROOT = Path(__file__).resolve().parent
SUCCESSOR = ROOT.parent
V11_ROOT = SUCCESSOR / "model_retest_r8_candidate_v11"
V11_HARNESS = V11_ROOT / "r8_harness.py"
PROCESS_CONTROLLER = ROOT / "r8_process_controller.py"
GOAL_ADDENDUM = SUCCESSOR / "r8_goal_loop_buster_addendum_v1.json"
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
_LOCAL_FACADE_FILES = {
    ROOT / "r8_harness.py",
    ROOT / "architecture_contract.json",
    ROOT / "counterfactual_holdouts.json",
    ROOT / "deterministic_preflight_report.json",
    ROOT / "README.md",
}

# Set from the canonical minified exact sorted runtime_dependency_closure array.
_EXPECTED_CLOSURE_INVENTORY_SHA256 = "4a34ea13fe6788e1429df003a7caa6588434824d1004e857e1592cf87292af3f"
_EXPECTED_CLOSURE_INVENTORY_BYTES = 11495
_EXPECTED_CLOSURE_PATHS = 73
_V11_TRANSITIVE_PATHS = 61
_V11_FACADE_PATHS = 4
_V12_CONTROLLER_PATHS = 7
_GOAL_ACCEPTANCE_CUSTODY_PATHS = 1
_GOAL_BINDING = {
    "path": "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
    "storage_sha256": "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0",
    "storage_bytes": 4468,
}
_LINEAGE_KEYS = (
    "schema_id", "candidate_id", "status", "goal_loop_buster_addendum",
    "predecessor_candidate_id", "predecessor_preseal_audit", "predecessor_run",
    "fixed_defects", "preserved_semantics", "holdout_lineage",
    "candidate_v12_changes", "audited_candidate_bundle_contract",
    "candidate_freeze", "provider_semantic_packet_change_from_candidate_v11",
    "provider_transport_wrapper_structure_change_from_candidate_v11",
    "provider_transport_wrapper_bytes_change_from_candidate_v11",
    "provider_transport_wrapper_bytes_change_reason", "route_change_from_candidate_v11",
    "oracle_change_from_candidate_v11", "ordered_schedule_change_from_candidate_v11",
    "driver_receipt_schema_change_from_candidate_v11",
    "capture_envelope_schema_change_from_candidate_v11",
    "process_completion_contract_change_from_candidate_v11",
    "scorer_or_reducer_change_from_candidate_v11", "subject_calls", "provider_calls",
    "predecessor_qualification_credit",
)
_VERIFIER_CONTRACT_KEYS = (
    "schema_id", "candidate_id", "status", "executable", "write_behavior",
    "goal_loop_buster_addendum", "schedule_authority", "external_freeze_manifest",
    "audited_candidate_bundle", "process_completion_admission",
    "pre_dispatch_render_admission", "cell_transaction_admission",
    "validate_cell_seal_gate", "scoring_receipt_capture_interface",
    "counterfactual_and_adversarial_proofs", "qualification_contract",
    "genericity", "nonclaims",
)

_OPEN_TRACE: set[Path] = set()


def _audit_open(event: str, args: tuple[Any, ...]) -> None:
    if event != "open" or not args or not isinstance(args[0], (str, bytes, os.PathLike)):
        return
    try:
        path = Path(args[0]).resolve()
    except (OSError, TypeError, ValueError):
        return
    if path.is_relative_to(SUCCESSOR.resolve()):
        _OPEN_TRACE.add(path)


sys.addaudithook(_audit_open)


class Invalid(Exception):
    pass


class SubjectFail(Exception):
    pass


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dump(obj: Any) -> bytes:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def reject_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate key: {key}")
        out[key] = value
    return out


def regular(path: Path, label: str) -> bytes:
    try:
        before = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode):
        raise Invalid(f"{label}: not a regular nonlink")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        chunks: list[bytes] = []
        while True:
            chunk = os.read(fd, 1 << 20)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (
        opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns
    ) or (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns) != (
        after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns
    ):
        raise Invalid(f"{label}: changed while opened")
    return b"".join(chunks)


def strict_object(data: bytes, label: str) -> dict[str, Any]:
    try:
        obj = json.loads(data.decode("utf-8"), object_pairs_hook=reject_duplicates)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid UTF-8 JSON: {exc}") from exc
    if not isinstance(obj, dict):
        raise Invalid(f"{label}: top level must be object")
    return obj


def validate_declared_closure(rows: Any, *, validate_storage: bool) -> tuple[dict[str, Any], ...]:
    if not isinstance(rows, list):
        raise Invalid("runtime dependency closure must be an array")
    projected: list[dict[str, Any]] = []
    for row in rows:
        if not isinstance(row, dict) or set(row) - {"path", "sha256", "bytes", "roles"}:
            raise Invalid("runtime dependency row shape invalid")
        projection = {key: row.get(key) for key in ("path", "sha256", "bytes")}
        if (
            not isinstance(projection["path"], str)
            or not isinstance(projection["sha256"], str)
            or type(projection["bytes"]) is not int
            or projection["bytes"] < 0
        ):
            raise Invalid("runtime dependency row types invalid")
        projected.append(projection)
    paths = [row["path"] for row in projected]
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise Invalid("runtime dependency closure is not exact sorted unique")
    inventory = dump(projected)
    if (
        len(projected) != _EXPECTED_CLOSURE_PATHS
        or sha(inventory) != _EXPECTED_CLOSURE_INVENTORY_SHA256
        or len(inventory) != _EXPECTED_CLOSURE_INVENTORY_BYTES
    ):
        raise Invalid("runtime dependency closure missing, extra, or tampered row")
    if any(path.startswith("Plans/") or "/../" in f"/{path}/" or Path(path).is_absolute() for path in paths):
        raise Invalid("live Plans or non-relative runtime dependency forbidden")
    if validate_storage:
        for row in projected:
            storage = regular(SUCCESSOR / row["path"], row["path"])
            if (sha(storage), len(storage)) != (row["sha256"], row["bytes"]):
                raise Invalid(f"{row['path']}: frozen binding drift")
    return tuple(projected)


def architecture() -> dict[str, Any]:
    obj = strict_object(regular(ROOT / "architecture_contract.json", "architecture contract"), "architecture contract")
    if (obj.get("schema_id"), obj.get("candidate_id")) != (
        "pw-r8-candidate-architecture-contract-v12", CANDIDATE_ID
    ):
        raise Invalid("architecture identity mismatch")
    validate_declared_closure(obj.get("runtime_dependency_closure"), validate_storage=True)
    return obj


def goal_loop_buster_addendum() -> dict[str, Any]:
    storage = regular(GOAL_ADDENDUM, "goal loop-buster addendum")
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n") or b"\r" in storage:
        raise Invalid("goal loop-buster addendum framing invalid")
    value = strict_object(storage[:-1], "goal loop-buster addendum")
    if storage != dump(value) + b"\n":
        raise Invalid("goal loop-buster addendum must be canonical minified JSON plus one LF")
    if (sha(storage), len(storage)) != (
        "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468
    ):
        raise Invalid("goal loop-buster addendum identity mismatch")
    if (
        value.get("schema_id"), value.get("identity_family"), value.get("status")
    ) != (
        "pw-r8-goal-loop-buster-addendum-v1",
        "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815",
        "ACTIVE_BINDING_ACCEPTANCE_CRITERIA",
    ):
        raise Invalid("goal loop-buster addendum semantic identity mismatch")
    return dict(_GOAL_BINDING)


def candidate_custody_contracts(goal_binding: dict[str, Any]) -> dict[str, Any]:
    architecture_value = architecture()
    lineage = strict_object(regular(ROOT / "revision_lineage.json", "revision lineage"), "revision lineage")
    controller = strict_object(regular(ROOT / "controller_contract.json", "controller contract"), "controller contract")
    verifier = strict_object(regular(ROOT / "verifier_contract.json", "verifier contract"), "verifier contract")
    if tuple(lineage) != _LINEAGE_KEYS or lineage.get("schema_id") != "pw-r8-candidate-revision-lineage-v9":
        raise Invalid("revision lineage v9 keys/order mismatch")
    if tuple(verifier) != _VERIFIER_CONTRACT_KEYS or verifier.get("schema_id") != "pw-r8-run-verifier-contract-v11":
        raise Invalid("verifier contract v11 keys/order mismatch")
    if controller.get("schema_id") != "pw-r8-process-controller-contract-v12":
        raise Invalid("controller contract identity mismatch")
    for label, value in (
        ("architecture", architecture_value), ("revision lineage", lineage),
        ("controller contract", controller), ("verifier contract", verifier),
    ):
        binding = value.get("goal_loop_buster_addendum")
        if not isinstance(binding, dict) or tuple(binding) != tuple(_GOAL_BINDING) or binding != goal_binding:
            raise Invalid(f"{label} goal loop-buster addendum binding mismatch")
    source = regular(ROOT / "r8_run_verifier.py", "run verifier source")
    if b'adapted["schema_id"]' in source or b"_original_validate_audit =" in source:
        raise Invalid("run verifier retains prohibited audit schema-retag compatibility")
    return {
        "status": "PASS", "revision_lineage_schema": lineage["schema_id"],
        "verifier_contract_schema": verifier["schema_id"],
        "controller_contract_schema": controller["schema_id"],
        "direct_binding_records": 4, "direct_bindings_exact": True,
        "audit_schema_retag_compatibility_present": False,
        "audit_schema": "pw-r8-candidate-v12-independent-preseal-audit-v2",
        "freeze_manifest_schema": "pw-r8-external-candidate-freeze-manifest-v6",
        "run_contract_schema": "pw-r8-run-contract-v6",
        "runtime_dependency_count_owner": "architecture.runtime_dependency_closure",
        "redundant_runtime_dependency_closure_contract": False,
    }


_facade_cache: ModuleType | None = None
_process_cache: ModuleType | None = None
_v11_adapted = False


def facade_module() -> ModuleType:
    global _facade_cache
    architecture()
    if _facade_cache is None:
        spec = importlib.util.spec_from_file_location("r8_candidate_v12_bound_v11", V11_HARNESS)
        if spec is None or spec.loader is None:
            raise Invalid("candidate-v11 facade import unavailable")
        item = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(item)
        _facade_cache = item
    return _facade_cache


def process_module() -> ModuleType:
    global _process_cache
    architecture()
    if _process_cache is None:
        spec = importlib.util.spec_from_file_location("r8_candidate_v12_process_controller", PROCESS_CONTROLLER)
        if spec is None or spec.loader is None:
            raise Invalid("candidate-v12 process controller import unavailable")
        item = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(item)
        _process_cache = item
    return _process_cache


def adapt_v11_identity() -> ModuleType:
    global _v11_adapted
    facade = facade_module()
    if not _v11_adapted:
        validated_v11_architecture = facade.architecture()
        facade.architecture = lambda: validated_v11_architecture
        facade.CANDIDATE_ID = CANDIDATE_ID
        _v11_adapted = True
    return facade


def semantic_module(*, candidate_identity: bool = True) -> ModuleType:
    facade = adapt_v11_identity()
    module = facade.semantic_module(candidate_identity=False)
    if candidate_identity:
        module.CANDIDATE_ID = CANDIDATE_ID
    module.validated_capture_envelope = validated_capture_envelope_v12
    return module


def validated_capture_envelope_v12(exec_root: Path, slot: str, cell: str) -> tuple[bytes | None, dict[str, Any]]:
    module = semantic_module(candidate_identity=False)
    _, receipt_path = module.capture_paths(exec_root, slot, cell)
    receipt_storage = module.regular(receipt_path, f"{slot} {cell} driver receipt")
    try:
        process_module().validate_persisted_completion(exec_root, slot, cell, receipt_storage=receipt_storage)
    except Exception as exc:
        raise Invalid(f"{slot} {cell}: process completion admission failed: {exc}") from exc
    # Candidate-v11's wrapper expects its v1 completion observation.  After the
    # v12 controller has admitted the stronger v2 observation, call the exact
    # inherited candidate-v9 receipt-v4/capture-v3 validator directly.
    return adapt_v11_identity().adapt_v9_identity().validated_capture_envelope_v4(exec_root, slot, cell)


def derive_external_open_paths(closure: tuple[dict[str, Any], ...]) -> dict[str, Any]:
    declared = {row["path"] for row in closure}
    traced = {
        path.relative_to(SUCCESSOR.resolve()).as_posix()
        for path in _OPEN_TRACE
        if path.is_file() and path not in _LOCAL_FACADE_FILES
    }
    unbound = sorted(traced - declared)
    if unbound:
        raise Invalid(f"observed external open outside declared closure: {unbound}")
    live = sorted(path for path in declared if path.startswith("Plans/"))
    if live:
        raise Invalid("static external read/import path derivation reaches live Plans")
    return {
        "status": "PASS",
        "candidate_v11_transitive_paths": _V11_TRANSITIVE_PATHS,
        "candidate_v11_facade_paths": _V11_FACADE_PATHS,
        "candidate_v12_controller_paths": _V12_CONTROLLER_PATHS,
        "goal_acceptance_custody_paths": _GOAL_ACCEPTANCE_CUSTODY_PATHS,
        "deduplicated_paths": len(declared),
        "derived_paths_exactly_equal_declared_closure": True,
        "observed_external_open_paths": len(traced),
        "observed_external_open_paths_subset_of_declared_closure": True,
        "observed_unbound_external_open_paths": unbound,
        "live_plans_paths": live,
        "frozen_fixture_plans_paths": sum(path.startswith("frozen_plans_snapshot_20260814_v1/fixture/Plans/") for path in declared),
    }


def _holdout_group(controller: ModuleType, export: str) -> dict[str, Any]:
    function = getattr(controller, export, None)
    if not callable(function):
        raise Invalid(f"candidate-v12 controller missing holdout export: {export}")
    result = function()
    if not isinstance(result, dict):
        raise Invalid(f"candidate-v12 controller holdout interface mismatch: {export}")
    rows = result.get("results")
    if type(result.get("cases")) is not int or not isinstance(rows, list) or result["cases"] != len(rows):
        raise Invalid(f"candidate-v12 controller holdout shape mismatch: {export}")
    if result.get("answer_cell_model_specific_logic") is not False:
        raise Invalid(f"candidate-v12 controller holdout contains specific logic: {export}")
    if any(not isinstance(row, dict) or not isinstance(row.get("case_id"), str) for row in rows):
        raise Invalid(f"candidate-v12 controller holdout row mismatch: {export}")
    return result


def preflight() -> dict[str, Any]:
    goal_binding = goal_loop_buster_addendum()
    custody_contracts = candidate_custody_contracts(goal_binding)
    facade = facade_module()
    if facade.CANDIDATE_ID != V11_CANDIDATE_ID:
        raise Invalid("candidate-v11 baseline identity changed before baseline preflight")
    baseline = facade.preflight()
    baseline_storage = regular(V11_ROOT / "deterministic_preflight_report.json", "candidate-v11 preflight baseline")
    if dump(baseline) + b"\n" != baseline_storage:
        raise Invalid("candidate-v11 deterministic preflight baseline identity drift")
    inherited = strict_object(regular(V11_ROOT / "counterfactual_holdouts.json", "candidate-v11 holdouts"), "candidate-v11 holdouts")
    current = strict_object(regular(ROOT / "counterfactual_holdouts.json", "candidate-v12 holdouts"), "candidate-v12 holdouts")
    inherited_cases, current_cases = inherited.get("cases"), current.get("cases")
    if not isinstance(inherited_cases, list) or len(inherited_cases) != 75:
        raise Invalid("candidate-v11 inherited holdout count drift")
    controller = process_module()
    render_holdouts = _holdout_group(controller, "predispatch_render_holdouts")
    safe_stop_holdouts = _holdout_group(controller, "safe_boundary_holdouts")
    process_holdouts = _holdout_group(controller, "process_completion_holdouts")
    added = render_holdouts["results"] + safe_stop_holdouts["results"]
    if (
        not isinstance(current_cases, list)
        or current_cases[:75] != inherited_cases
        or len(current_cases) != 75 + len(added)
        or [row.get("case_id") for row in current_cases[75:]] != [row.get("case_id") for row in added]
    ):
        raise Invalid("candidate-v12 holdout inventory differs from inherited plus controller cases")
    module = semantic_module(candidate_identity=True)
    if len(module.SUBJECT_CELLS) != 97:
        raise Invalid("candidate-v11 semantic schedule identity drift")
    closure = validate_declared_closure(architecture()["runtime_dependency_closure"], validate_storage=True)
    read_path_proof = derive_external_open_paths(closure)
    inventory = dump([dict(row) for row in closure])
    source_count = sum(row["path"].startswith("frozen_plans_snapshot_20260814_v1/fixture/Plans/") for row in closure)
    inherited_passed = baseline["counterfactual_holdouts"]["passed_case_ids"]
    baseline.update({
        "schema_id": "pw-r8-deterministic-preflight-report-v12",
        "candidate_id": CANDIDATE_ID,
        "runtime_dependency_closure": {
            "status": "PASS",
            "exact_sorted_unique_external_files": len(closure),
            "candidate_v11_transitive_files": _V11_TRANSITIVE_PATHS,
            "candidate_v11_facade_files": _V11_FACADE_PATHS,
            "candidate_v12_controller_files": _V12_CONTROLLER_PATHS,
            "goal_acceptance_custody_files": _GOAL_ACCEPTANCE_CUSTODY_PATHS,
            "unique_frozen_fixture_source_files": source_count,
            "inventory_sha256": sha(inventory),
            "inventory_canonical_bytes": len(inventory),
            "validated_before_dynamic_import": True,
            "all_actual_external_open_candidates_subset_of_declared_closure": True,
            "derivation": "candidate-v11 exact transitive closure union exact candidate-v11 facade, candidate-v12 controller files, and one goal-acceptance custody addendum",
            "live_plans_paths": [],
            "candidate_local_facade_files_excluded": True,
        },
        "static_external_read_path_proof": read_path_proof,
        "goal_loop_buster_addendum": {
            **goal_binding,
            "status": "PASS",
            "schema_id": "pw-r8-goal-loop-buster-addendum-v1",
            "identity_family": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815",
            "acceptance_status": "ACTIVE_BINDING_ACCEPTANCE_CRITERIA",
            "exact_binding_key_order": ["path", "storage_sha256", "storage_bytes"],
        },
        "native_custody_contracts": custody_contracts,
        "predispatch_render_holdouts": render_holdouts,
        "safe_boundary_holdouts": safe_stop_holdouts,
        "process_completion_holdouts": process_holdouts,
        "counterfactual_holdouts": {
            "cases": len(current_cases),
            "passed_case_ids": inherited_passed + [row["case_id"] for row in added],
            "inherited_object_identity_to_candidate_v11": "75/75",
        },
        "candidate_v11_semantic_baseline": {
            "provider_visible_prompt_identity": baseline["candidate_v9_semantic_baseline"]["provider_visible_prompt_identity"],
            "semantic_oracle_identity": baseline["candidate_v9_semantic_baseline"]["semantic_oracle_identity"],
            "schedule_identity": baseline["candidate_v9_semantic_baseline"]["schedule_identity"],
            "deterministic_output_identity": baseline["candidate_v9_semantic_baseline"]["deterministic_output_identity"],
            "complete_preflight_storage_identity": True,
            "preflight_storage_sha256": sha(baseline_storage),
            "preflight_storage_bytes": len(baseline_storage),
        },
        "audited_candidate_bundle_custody_interface": {
            "owner": "external controller",
            "schema_id": "pw-r8-audited-candidate-bundle-v1",
            "exact_ordered_keys": ["schema_id", "candidate_id", "excluded_path", "file_count", "aggregate_file_bytes", "files", "canonical_rows_sha256", "canonical_rows_bytes"],
            "excluded_path": "independent_preseal_audit.json",
            "file_count": 12,
            "canonical_rows_rule": "sha256 and bytes over canonical minified UTF-8 JSON of the exact sorted files array only",
            "semantic_render_bytes_changed": False,
        },
        "predispatch_persisted_render_interface": {
            "required_before_subject_process_start": True,
            "generic": True,
            "requires_regular_nonlink": True,
            "requires_exact_expected_sha256_and_bytes": True,
            "requires_exactly_one_terminal_lf": True,
            "missing_two_lf_drift_nonregular_reject_before_start": True,
            "answer_cell_model_route_specific_logic": False,
        },
        "safe_boundary_stop_transaction_interface": {
            "safe_stop_boundaries": ["before_subject_process_start", "after_full_receipt_completion_capture_score_validate_chain"],
            "during_or_after_child_before_complete_cell_seal": "MUST_SEAL_CURRENT_CELL",
            "may_not_advance_to_next_cell_while_sealing": True,
            "answer_cell_model_route_specific_logic": False,
        },
        "scoring_process_completion_interface": {
            "required_before_receipt_admission": True,
            "observation_schema": "pw-r8-invocation-completion-observation-v2",
            "observation_path": "<execution_root>/invocation_completions/<slot>_<cell>.json",
            "receipt_schema": "pw-r8-direct-appserver-subject-receipt-v4",
            "capture_schema": "pw-r8-subject-capture-envelope-v3",
            "requires_pre_dispatch_render_observation": True,
            "requires_real_child_exit_zero": True,
            "requires_outer_exec_terminal_exit_zero": True,
            "requires_fully_captured_exact_canonical_receipt_stdout": True,
            "requires_current_cell_transaction_must_seal_state": True,
            "missing_unexited_empty_partial_fail_closed": True,
            "semantic_acceptance_weakened": False,
        },
        "provider_calls": 0,
        "subject_calls": 0,
        "live_plans_reads": 0,
    })
    return baseline


def execution_root(value: str) -> Path:
    path = Path(value).resolve()
    if not path.is_relative_to(SUCCESSOR.resolve()):
        raise Invalid("execution root must remain beneath successor_20260813")
    return path


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("preflight")
    sub.add_parser("list-cells")
    for name in ("render", "expected", "score", "measure"):
        q = sub.add_parser(name)
        q.add_argument("--cell", required=True)
        q.add_argument("--slot", required=True, choices=SLOTS)
        q.add_argument("--execution-root", required=True)
    q = sub.add_parser("reduce")
    q.add_argument("--stage", required=True, choices=("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80", "S90"))
    q.add_argument("--slot", required=True, choices=SLOTS)
    q.add_argument("--execution-root", required=True)
    return p


def main() -> int:
    try:
        args = parser().parse_args()
        if args.command == "preflight":
            sys.stdout.buffer.write(dump(preflight()) + b"\n")
            return 0
        module = semantic_module()
        if args.command == "list-cells":
            sys.stdout.buffer.write(dump({"candidate_id": CANDIDATE_ID, "count": len(module.SUBJECT_CELLS), "cells": list(module.SUBJECT_CELLS)}) + b"\n")
            return 0
        root = execution_root(args.execution_root)
        if args.command == "render":
            sys.stdout.buffer.write(module.render(args.cell, args.slot, root)[0])
            return 0
        if args.command == "expected":
            sys.stdout.buffer.write(dump(module.expected(args.cell, args.slot, root)) + b"\n")
            return 0
        if args.command == "measure":
            storage, source_bytes = module.render(args.cell, args.slot, root)
            packet = module.provider_payload(storage, args.cell)
            sys.stdout.buffer.write(dump(module.packet_diagnostics(args.cell, packet, source_bytes)) + b"\n")
            return 0
        if args.command == "score":
            result, rc = module.score(args.cell, args.slot, root)
            sys.stdout.buffer.write(dump(result) + b"\n")
            return rc
        if args.command == "reduce":
            sys.stdout.buffer.write(dump(module.reduce(root, args.slot, args.stage)) + b"\n")
            return 0
        raise Invalid("unsupported command")
    except Exception as exc:
        subject_fail = exc.__class__.__name__ == "SubjectFail"
        status, rc = ("FAIL", 1) if subject_fail else ("INVALID", 2)
        sys.stdout.buffer.write(dump({"schema_id": "pw-r8-harness-error-v1", "candidate_id": CANDIDATE_ID, "status": status, "error": str(exc)}) + b"\n")
        return rc


if __name__ == "__main__":
    raise SystemExit(main())
