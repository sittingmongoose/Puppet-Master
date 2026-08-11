#!/usr/bin/env python3
"""Fail-closed empirical controller for the agent-packet restriction study.

Python standard library only.  This module never imports Puppet Master product
code and never writes outside tests/agent_packet_restrictions/.
"""

from __future__ import annotations

import argparse
import copy
import datetime as dt
import hashlib
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence


CONTROLLER_VERSION = "2.0.0"
METHOD_ID = "apr-method-v2.0.0"
LANE = Path(__file__).resolve().parents[1]
CONTROLLER_SOURCE = Path(__file__).resolve()
CASES = LANE / "cases" / "semantic_cases.v2.json"
RESPONSE_SCHEMA = LANE / "cases" / "response.schema.json"
IMPLEMENTATION_GATED = LANE / "cases" / "implementation_gated.v1.json"
FIXTURES = LANE / "fixtures" / "deterministic_cases.v2.json"
ROUTE_CANARY = LANE / "fixtures" / "nonsemantic_route_canary.v2.json"
PILOT_PLAN = LANE / "charter" / "pilot_plan.v2.json"
METHOD = LANE / "charter" / "method.v2.md"
ACCEPTED_CONTRACT = LANE / "charter" / "accepted_contract.v1.md"
DIRTY_TREE_BOUNDARY = LANE / "charter" / "dirty_tree_boundary.md"
CONTROL_PLANE_DEFECT = LANE / "charter" / "control_plane_defect-0001-v1-qualification-invalid.md"
MATRIX_STATUS = LANE / "inventory" / "model_matrix_status.v2.json"
SURFACES = LANE / "inventory" / "surfaces.v1.json"
MODEL_SELECTION_HOLD = LANE / "charter" / "correction-0001-user-model-selection-hold.md"

BASE_FROZEN_INPUTS = (
    METHOD,
    PILOT_PLAN,
    CASES,
    RESPONSE_SCHEMA,
    IMPLEMENTATION_GATED,
    FIXTURES,
    ROUTE_CANARY,
    MATRIX_STATUS,
    SURFACES,
    ACCEPTED_CONTRACT,
    DIRTY_TREE_BOUNDARY,
    MODEL_SELECTION_HOLD,
    CONTROL_PLANE_DEFECT,
    CONTROLLER_SOURCE,
)
REQUIRED_TERMINALS = {
    "PASS",
    "SEMANTIC_FAIL",
    "PROTOCOL_FAIL",
    "FALSE_COMPLETION",
    "EVIDENCE_FAIL",
    "UNCERTAINTY_FAIL",
    "FORBIDDEN_ACTION",
    "ROUTE_UNAVAILABLE",
    "IDENTITY_AMBIGUOUS",
    "TIMEOUT",
    "CONTROL_PLANE_DEFECT",
    "IMPLEMENTATION_GATED",
}
CONTROL_PLANE_TERMINALS = {
    "FORBIDDEN_ACTION",
    "ROUTE_UNAVAILABLE",
    "IDENTITY_AMBIGUOUS",
    "TIMEOUT",
    "CONTROL_PLANE_DEFECT",
}
SECRET_NAME = re.compile(r"(?:KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|AUTH|COOKIE)", re.I)
ABSOLUTE_PATH = re.compile(r"(?<![A-Za-z0-9_.-])/(?:[^\s\x00\"'<>]+/)*[^\s\x00\"'<>]*")
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*\Z")


class ControllerError(RuntimeError):
    """A fail-closed controller error."""


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def new_run_id(command: str) -> str:
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return f"{command.replace('-', '_')}-{stamp}-{secrets.token_hex(4)}"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def relative(path: Path) -> str:
    try:
        return path.resolve().relative_to(LANE.resolve()).as_posix()
    except ValueError as exc:
        raise ControllerError(f"path escapes lane: {path}") from exc


def assert_lane_path(path: Path) -> None:
    relative(path)


def read_json(path: Path) -> Any:
    assert_lane_path(path)
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ControllerError(f"required input missing: {relative(path)}") from exc
    except json.JSONDecodeError as exc:
        raise ControllerError(f"invalid JSON in {relative(path)}: {exc}") from exc


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode("utf-8")


def write_json_exclusive(path: Path, value: Any) -> None:
    assert_lane_path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    data = json_bytes(value)
    try:
        with path.open("xb") as handle:
            handle.write(data)
    except FileExistsError as exc:
        raise ControllerError(f"immutable artifact already exists: {relative(path)}") from exc


def write_bytes_exclusive(path: Path, data: bytes) -> None:
    assert_lane_path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with path.open("xb") as handle:
            handle.write(data)
    except FileExistsError as exc:
        raise ControllerError(f"immutable artifact already exists: {relative(path)}") from exc


def artifact(path: Path) -> dict[str, Any]:
    return {
        "relative_path": relative(path),
        "sha256": sha256_file(path),
        "bytes": path.stat().st_size,
    }


def authorized_matrix_path(status: Mapping[str, Any]) -> Path | None:
    ref = status.get("authorized_matrix_ref")
    if ref is None:
        return None
    if not isinstance(ref, str) or not ref.strip():
        raise ControllerError("authorized_matrix_ref must be null or a nonempty lane-relative path")
    path = (LANE / ref).resolve()
    assert_lane_path(path)
    if relative(path) != Path(ref).as_posix():
        raise ControllerError("authorized_matrix_ref must be normalized and lane-relative")
    return path


def frozen_inputs(status: Mapping[str, Any] | None = None) -> tuple[Path, ...]:
    status = status if status is not None else read_json(MATRIX_STATUS)
    if not isinstance(status, dict):
        raise ControllerError("model matrix status must be a JSON object")
    matrix = authorized_matrix_path(status)
    return BASE_FROZEN_INPUTS + ((matrix,) if matrix is not None else ())


def freeze_digest(inputs: Sequence[Mapping[str, Any]]) -> str:
    manifest = [
        {"relative_path": item.get("relative_path"), "sha256": item.get("sha256"), "bytes": item.get("bytes")}
        for item in inputs
    ]
    return sha256_bytes(json.dumps(manifest, separators=(",", ":"), sort_keys=True).encode("utf-8"))


def get_slots(matrix: Mapping[str, Any]) -> list[dict[str, Any]]:
    slots = matrix.get("slots")
    if not isinstance(slots, list) or not all(isinstance(item, dict) for item in slots):
        raise ControllerError("model matrix must contain a slots array of objects")
    return list(slots)


def validate_matrix(matrix: Mapping[str, Any]) -> list[str]:
    errors: list[str] = []
    slots = get_slots(matrix)
    if len(slots) != 10 or matrix.get("exact_slot_count") != 10:
        errors.append("matrix must contain exactly 10 slots")
    classes = [slot.get("relative_class") for slot in slots]
    if classes.count("relative_low") != 8 or classes.count("relative_high") != 2:
        errors.append("matrix must contain exactly 8 relative_low and 2 relative_high slots")
    required_counts = matrix.get("required_class_counts")
    if required_counts != {"relative_low": 8, "relative_high": 2}:
        errors.append("required_class_counts must be exactly relative_low=8 and relative_high=2")
    for field in ("slot_id", "route", "model_id", "distinct_underlying_model_key"):
        values = [slot.get(field) for slot in slots]
        if any(not isinstance(value, str) or not value for value in values):
            errors.append(f"every slot needs a non-empty {field}")
        if len(set(values)) != len(values):
            errors.append(f"slot {field} values must be unique; replacements/duplicates are forbidden")
    if any(not SAFE_ID.fullmatch(str(slot.get("slot_id", ""))) for slot in slots):
        errors.append("slot_id values must be safe path-independent identifiers")
    if any(not isinstance(slot.get("provider_id"), str) or not slot.get("provider_id") for slot in slots):
        errors.append("every slot needs a non-empty provider_id")
    for slot in slots:
        route = slot.get("route", "")
        expected = f"{slot.get('provider_id')}/{slot.get('model_id')}"
        if route != expected:
            errors.append(f"{slot.get('slot_id')}: route must exactly equal provider_id/model_id")
        if slot.get("requested_variant") is not None:
            errors.append(f"{slot.get('slot_id')}: requested_variant must be null")
        if slot.get("requested_reasoning") != "provider_default_no_override":
            errors.append(f"{slot.get('slot_id')}: reasoning override is forbidden")
    adapter = matrix.get("route_adapter", {})
    if adapter.get("controller_retry_count") != 0 or adapter.get("fallback_allowed") is not False:
        errors.append("matrix must forbid controller retries and fallback")
    return errors


def validate_surface_inventory(document: Mapping[str, Any], semantic_ids: set[str]) -> list[str]:
    errors: list[str] = []
    expected_counts = {
        "rows": 54,
        "runnable_current_deterministic": 1,
        "isolated_contract_simulation": 2,
        "blocked_production_implementation": 51,
    }
    if document.get("schema_id") != "pm.agent_packet_restrictions.surface_inventory.v1":
        errors.append("surface inventory schema_id mismatch")
    definitions = document.get("execution_class_definitions")
    expected_classes = set(expected_counts) - {"rows"}
    if not isinstance(definitions, dict) or set(definitions) != expected_classes:
        errors.append("surface inventory execution classes are not the exact preregistered set")
    if document.get("counts") != expected_counts:
        errors.append("surface inventory declared row/class counts do not match 54/1/2/51")
    rows = document.get("rows")
    if not isinstance(rows, list) or not all(isinstance(row, dict) for row in rows):
        return errors + ["surface inventory rows must be an array of objects"]
    row_ids: list[str] = []
    computed = {name: 0 for name in expected_classes}
    for index, row in enumerate(rows):
        rid = row.get("surface_id")
        if not isinstance(rid, str) or not SAFE_ID.fullmatch(rid):
            errors.append(f"surface row {index} has invalid surface_id")
        else:
            row_ids.append(rid)
        execution_class = row.get("execution_class")
        if execution_class not in computed:
            errors.append(f"{rid or index}: unknown execution_class")
        else:
            computed[execution_class] += 1
        for field in ("family", "surface", "why_affected", "current_evidence"):
            if not isinstance(row.get(field), str) or not row[field].strip():
                errors.append(f"{rid or index}: {field} must be nonempty text")
        for field, allow_empty in (("restriction_dimensions", False), ("source_refs", False), ("semantic_case_ids", True)):
            values = row.get(field)
            if not isinstance(values, list) or not all(isinstance(value, str) and value for value in values):
                errors.append(f"{rid or index}: {field} must be a string array")
            elif not allow_empty and not values:
                errors.append(f"{rid or index}: {field} must not be empty")
            elif len(values) != len(set(values)):
                errors.append(f"{rid or index}: {field} contains duplicates")
        case_refs = row.get("semantic_case_ids")
        if isinstance(case_refs, list) and not set(case_refs).issubset(semantic_ids):
            errors.append(f"{rid or index}: semantic_case_ids contain unknown IDs")
    if len(rows) != expected_counts["rows"] or computed != {key: expected_counts[key] for key in expected_classes}:
        errors.append("surface inventory computed row/class counts do not match 54/1/2/51")
    if len(row_ids) != len(set(row_ids)):
        errors.append("surface inventory surface_id values must be unique")
    dimensions = document.get("closure_dimensions")
    if not isinstance(dimensions, list) or not all(isinstance(item, dict) for item in dimensions):
        errors.append("surface inventory closure_dimensions must be an array of objects")
    else:
        dimension_names: list[str] = []
        for item in dimensions:
            name = item.get("dimension")
            refs = item.get("row_ids")
            if not isinstance(name, str) or not name:
                errors.append("closure dimension needs a nonempty dimension")
            else:
                dimension_names.append(name)
            if not isinstance(refs, list) or not refs or not all(isinstance(ref, str) for ref in refs):
                errors.append(f"closure dimension {name!r} needs nonempty row_ids")
            elif len(refs) != len(set(refs)) or not set(refs).issubset(row_ids):
                errors.append(f"closure dimension {name!r} has duplicate or unknown row_ids")
        if len(dimension_names) != len(set(dimension_names)):
            errors.append("closure dimension names must be unique")
    return errors


def validate_implementation_gated(document: Mapping[str, Any], surfaces: Mapping[str, Any]) -> list[str]:
    errors: list[str] = []
    if document.get("schema_id") != "pm.agent_packet_restrictions.implementation_gated_tests.v1":
        errors.append("implementation-gated schema_id mismatch")
    if document.get("inventory_id") != surfaces.get("inventory_id"):
        errors.append("implementation-gated inventory_id does not bind the surface inventory")
    if document.get("method_id") != surfaces.get("method_id"):
        errors.append("implementation-gated method_id does not bind the surface inventory")
    if not isinstance(document.get("claim_boundary"), str) or not document["claim_boundary"].strip():
        errors.append("implementation-gated claim_boundary must be nonempty text")
    surface_ids = {
        row.get("surface_id") for row in surfaces.get("rows", [])
        if isinstance(row, dict) and isinstance(row.get("surface_id"), str)
    }
    tests = document.get("tests")
    if not isinstance(tests, list) or not tests or not all(isinstance(item, dict) for item in tests):
        return errors + ["implementation-gated tests must be a nonempty array of objects"]
    test_ids: list[str] = []
    for index, item in enumerate(tests):
        tid = item.get("test_id")
        if not isinstance(tid, str) or not SAFE_ID.fullmatch(tid):
            errors.append(f"implementation-gated test {index} has invalid test_id")
        else:
            test_ids.append(tid)
        for field in ("title", "acceptance"):
            if not isinstance(item.get(field), str) or not item[field].strip():
                errors.append(f"{tid or index}: {field} must be nonempty text")
        for field in ("surface_ids", "production_prerequisites"):
            values = item.get(field)
            if not isinstance(values, list) or not values or not all(isinstance(value, str) and value for value in values):
                errors.append(f"{tid or index}: {field} must be a nonempty string array")
            elif len(values) != len(set(values)):
                errors.append(f"{tid or index}: {field} contains duplicates")
        refs = item.get("surface_ids")
        if isinstance(refs, list) and not set(refs).issubset(surface_ids):
            errors.append(f"{tid or index}: surface_ids contain unknown inventory rows")
    if len(test_ids) != len(set(test_ids)):
        errors.append("implementation-gated test_id values must be unique")
    return errors


def validate_route_canary(document: Mapping[str, Any]) -> list[str]:
    errors: list[str] = []
    if document.get("schema_id") != "pm.agent_packet_restrictions.nonsemantic_route_canary.v2":
        errors.append("route canary schema_id mismatch")
    if document.get("method_id") != METHOD_ID:
        errors.append("route canary method_id mismatch")
    if document.get("canary_id") != "apr-route-canary-v2.0.0":
        errors.append("route canary canary_id mismatch")
    prompt = document.get("prompt_template")
    if not isinstance(prompt, str) or prompt.count("{EXPECTED_JSON}") != 1:
        errors.append("route canary prompt_template must contain exactly one {EXPECTED_JSON}")
    expected = document.get("expected_json_template")
    if expected != {"route_canary": "ok", "nonce": "{RUNTIME_NONCE}"}:
        errors.append("route canary expected_json_template is not the frozen nonce object")
    for field in (
        "purpose", "nonce_rule", "response_rule", "identity_rule", "slot_rule",
        "tool_rule", "fleet_gate", "model_selection_hold",
    ):
        if not isinstance(document.get(field), str) or not document[field].strip():
            errors.append(f"route canary {field} must be nonempty text")
    return errors


def validate_matrix_status(document: Mapping[str, Any]) -> list[str]:
    errors: list[str] = []
    if document.get("schema_id") != "pm.agent_packet_restrictions.model_matrix_status.v2":
        errors.append("model matrix status schema_id mismatch")
    if document.get("method_id") != METHOD_ID:
        errors.append("model matrix status method_id mismatch")
    state = document.get("authorized_matrix_status")
    ref = document.get("authorized_matrix_ref")
    if state == "user_model_selection_pending":
        if ref is not None:
            errors.append("pending model selection must have null authorized_matrix_ref")
    elif state in {"authorized", "approved", "frozen_authorized"}:
        if not isinstance(ref, str) or not ref:
            errors.append("authorized model selection needs a nonempty authorized_matrix_ref")
    else:
        errors.append("model matrix authorization status is not recognized")
    if not isinstance(document.get("calls_launched_from_any_matrix"), int) or document["calls_launched_from_any_matrix"] < 0:
        errors.append("calls_launched_from_any_matrix must be a nonnegative integer")
    blocked = document.get("blocked_commands")
    if not isinstance(blocked, list) or set(blocked) != {"route-canary", "pilot", "fleet"}:
        errors.append("model matrix status blocked_commands must name route-canary, pilot, and fleet")
    return errors


def validate_fixture_document(document: Mapping[str, Any]) -> list[str]:
    errors: list[str] = []
    if document.get("schema_id") != "pm.agent_packet_restrictions.deterministic_cases.v2":
        errors.append("deterministic fixture schema_id mismatch")
    if document.get("method_id") != METHOD_ID:
        errors.append("deterministic fixture method_id mismatch")
    canary = document.get("scorer_canary")
    if not isinstance(canary, dict):
        errors.append("deterministic fixtures need one scorer_canary object")
    else:
        mutations = canary.get("negative_mutations")
        if not isinstance(mutations, list) or len(mutations) != 13 or not all(isinstance(item, dict) for item in mutations):
            errors.append("scorer canary must contain exactly 13 negative mutation objects")
        else:
            ids = [item.get("canary_id") for item in mutations]
            if ids != [f"CANARY-{index:02d}" for index in range(1, 14)]:
                errors.append("scorer canary IDs must be exactly CANARY-01 through CANARY-13")
    fixtures = document.get("fixtures")
    if not isinstance(fixtures, list) or len(fixtures) != 36 or not all(isinstance(item, dict) for item in fixtures):
        errors.append("deterministic fixture set must contain exactly 36 objects")
    else:
        fixture_ids = [item.get("fixture_id") for item in fixtures]
        if any(not isinstance(fid, str) or not SAFE_ID.fullmatch(fid) for fid in fixture_ids) or len(fixture_ids) != len(set(fixture_ids)):
            errors.append("deterministic fixture IDs must be safe and unique")
        counts: dict[str, int] = {}
        for item in fixtures:
            kind = item.get("fixture_kind")
            counts[str(kind)] = counts.get(str(kind), 0) + 1
            if not isinstance(item.get("input"), dict) or not isinstance(item.get("expected"), dict):
                errors.append(f"{item.get('fixture_id')}: fixture input and expected must be objects")
        if counts != {"dispatch_contract": 19, "coverage_manifest": 4, "reducer_manifest": 7, "evidence_admission": 6}:
            errors.append("deterministic fixture kind counts must be exactly 19/4/7/6")
    return errors


def get_cases(document: Mapping[str, Any]) -> list[dict[str, Any]]:
    for key in ("cases", "semantic_cases"):
        value = document.get(key)
        if isinstance(value, list) and all(isinstance(item, dict) for item in value):
            return list(value)
    raise ControllerError("semantic case document must contain cases array")


def case_id(case: Mapping[str, Any]) -> str:
    value = case.get("case_id") or case.get("id")
    if not isinstance(value, str) or not value:
        raise ControllerError("every semantic case needs case_id")
    if not SAFE_ID.fullmatch(value):
        raise ControllerError("case_id must be a safe path-independent identifier")
    return value


def validate_case_and_plan_documents(cases_doc: Mapping[str, Any], plan: Mapping[str, Any], slots: Sequence[Mapping[str, Any]]) -> list[str]:
    errors: list[str] = []
    if cases_doc.get("schema_id") != "pm.agent_packet_restrictions.semantic_cases.v2":
        errors.append("semantic cases schema_id mismatch")
    if plan.get("schema_id") != "pm.agent_packet_restrictions.pilot_plan.v2":
        errors.append("pilot plan schema_id mismatch")
    cases = get_cases(cases_doc)
    ids = [case_id(case) for case in cases]
    if len(ids) != len(set(ids)):
        errors.append("semantic case IDs must be unique")
    if any(case.get("semantic_core") is not True for case in cases):
        errors.append("all semantic cases must have semantic_core=true")
    if cases_doc.get("response_schema_ref") != relative(RESPONSE_SCHEMA):
        errors.append("semantic cases must reference the frozen response schema")
    fixed = cases_doc.get("fixed_profile")
    if not isinstance(fixed, dict):
        errors.append("semantic cases must contain one fixed_profile object")
    elif fixed.get("tools") != "none" or fixed.get("semantic_retries") != 0 or fixed.get("model_specific_tuning") is not False:
        errors.append("fixed_profile must disable tools/retries/model-specific tuning")
    for case in cases:
        cid = case_id(case)
        packet = case.get("packet")
        oracle = case.get("oracle")
        if not isinstance(packet, dict) or packet.get("case_id") != cid:
            errors.append(f"{cid}: packet case_id mismatch")
            continue
        acceptance = packet.get("acceptance_group")
        requirements = acceptance.get("requirements") if isinstance(acceptance, dict) else None
        evidence = packet.get("evidence")
        if not isinstance(packet.get("objective"), str) or not packet.get("objective"):
            errors.append(f"{cid}: packet needs exactly one nonempty objective")
        if not isinstance(requirements, list) or not requirements:
            errors.append(f"{cid}: packet needs one nonempty acceptance group")
            requirement_ids: list[str] = []
        else:
            requirement_ids = ids_from_items(requirements, ("id",))
            if len(requirement_ids) != len(requirements) or len(set(requirement_ids)) != len(requirement_ids):
                errors.append(f"{cid}: packet requirement IDs must be complete and unique")
        if not isinstance(evidence, list):
            errors.append(f"{cid}: packet evidence must be a bounded array")
            evidence_ids: list[str] = []
        else:
            evidence_ids = ids_from_items(evidence, ("id",))
            if len(evidence_ids) != len(evidence) or len(set(evidence_ids)) != len(evidence_ids):
                errors.append(f"{cid}: evidence IDs must be complete and unique")
        if not isinstance(oracle, dict):
            errors.append(f"{cid}: oracle must be an object")
        else:
            if set((oracle.get("requirement_statuses") or {}).keys()) != set(requirement_ids):
                errors.append(f"{cid}: oracle requirement statuses must exactly cover packet IDs")
            if set(oracle.get("allowed_evidence_refs") or []) != set(evidence_ids):
                errors.append(f"{cid}: oracle allowed evidence must exactly bind packet evidence")
            claim_ids = set((oracle.get("claim_values") or {}).keys())
            requirement_refs = oracle.get("requirement_evidence_refs")
            claim_refs = oracle.get("claim_evidence_refs")
            if not isinstance(requirement_refs, dict) or set(requirement_refs) != set(requirement_ids):
                errors.append(f"{cid}: requirement_evidence_refs must exactly cover packet requirements")
            if not isinstance(claim_refs, dict) or set(claim_refs) != claim_ids:
                errors.append(f"{cid}: claim_evidence_refs must exactly cover oracle claims")
            for name, joins in (("requirement_evidence_refs", requirement_refs), ("claim_evidence_refs", claim_refs)):
                if isinstance(joins, dict):
                    for join_id, refs in joins.items():
                        if not isinstance(refs, list) or len(refs) != len(set(refs)) or not set(refs).issubset(evidence_ids):
                            errors.append(f"{cid}: {name}[{join_id}] is not an exact unique allowed-evidence list")
            for field in ("terminal", "completion_claim", "claim_values", "requirement_evidence_refs", "claim_evidence_refs", "required_uncertainty_ids", "required_missing_evidence_requests", "expected_forbidden_actions"):
                if field not in oracle:
                    errors.append(f"{cid}: oracle missing {field}")
    slot_ids = [str(slot.get("slot_id")) for slot in slots]
    pilot_slots = plan.get("pilot_slots")
    pilot_cases = plan.get("pilot_case_ids")
    fleet_gate = plan.get("fleet_gate", {})
    if not isinstance(pilot_slots, list) or not set(pilot_slots).issubset(slot_ids):
        errors.append("pilot slots must be an explicit subset of the frozen matrix")
    if not isinstance(pilot_cases, list) or not set(pilot_cases).issubset(ids):
        errors.append("pilot cases must be an explicit subset of frozen semantic cases")
    if plan.get("expected_call_count") != len(pilot_slots or []) * len(pilot_cases or []):
        errors.append("pilot expected_call_count does not equal its preregistered cross product")
    if plan.get("fresh_context_per_call") is not True or plan.get("controller_semantic_retries") != 0:
        errors.append("pilot must require fresh contexts and zero controller retries")
    fleet_slots = fleet_gate.get("slots")
    fleet_cases = fleet_gate.get("semantic_cases")
    if fleet_slots != slot_ids:
        errors.append("fleet slots must exactly equal the frozen matrix in frozen order")
    if fleet_cases != ids:
        errors.append("fleet cases must exactly equal all semantic case IDs in frozen order")
    if fleet_gate.get("expected_call_count") != len(slot_ids) * len(ids):
        errors.append("fleet expected_call_count does not equal matrix x semantic cases")
    if fleet_gate.get("fresh_context_per_call") is not True or fleet_gate.get("controller_semantic_retries") != 0:
        errors.append("fleet must require fresh contexts and zero controller retries")
    method_id = plan.get("method_id")
    if method_id != cases_doc.get("method_id"):
        errors.append("pilot and semantic cases method_id mismatch")
    return errors


def make_receipt(command: str, run_id: str, status: str, **fields: Any) -> dict[str, Any]:
    if status not in {"PASS", "FAIL"}:
        raise ControllerError("receipt status must be PASS or FAIL")
    return {
        "schema_id": "pm.agent_packet_restrictions.controller_receipt.v2",
        "controller_version": CONTROLLER_VERSION,
        "method_id": METHOD_ID,
        "command": command,
        "run_id": run_id,
        "created_at_utc": utc_now(),
        "status": status,
        **fields,
    }


def receipt_path(command: str, run_id: str) -> Path:
    return LANE / "receipts" / command.replace("-", "_") / f"{run_id}.json"


def verify_freeze(_: argparse.Namespace) -> int:
    run_id = new_run_id("verify-freeze")
    errors: list[str] = []
    inputs: list[dict[str, Any]] = []
    status: Mapping[str, Any] = {}
    try:
        status_value = read_json(MATRIX_STATUS)
        if not isinstance(status_value, dict):
            raise ControllerError("model matrix status must be a JSON object")
        status = status_value
        paths = frozen_inputs(status)
        missing = [relative(path) for path in paths if not path.is_file()]
        if missing:
            errors.extend(f"missing frozen input: {path}" for path in missing)
            inputs = [artifact(path) for path in paths if path.is_file()]
        else:
            inputs = [artifact(path) for path in paths]
            cases_doc = read_json(CASES)
            schema = read_json(RESPONSE_SCHEMA)
            fixtures = read_json(FIXTURES)
            plan = read_json(PILOT_PLAN)
            surfaces = read_json(SURFACES)
            implementation_gated = read_json(IMPLEMENTATION_GATED)
            route_canary_doc = read_json(ROUTE_CANARY)
            if not all(isinstance(value, dict) for value in (cases_doc, schema, fixtures, plan, surfaces, implementation_gated, route_canary_doc)):
                raise ControllerError("every frozen JSON input must be an object")
            matrix_path = authorized_matrix_path(status)
            if matrix_path is None:
                slots = [{"slot_id": slot_id} for slot_id in plan.get("fleet_gate", {}).get("slots", [])]
                if status.get("authorized_matrix_status") != "user_model_selection_pending":
                    errors.append("null authorized matrix requires user_model_selection_pending status")
            else:
                matrix = read_json(matrix_path)
                if not isinstance(matrix, dict):
                    raise ControllerError("authorized model matrix must be a JSON object")
                errors.extend(validate_matrix(matrix))
                slots = get_slots(matrix)
                if matrix.get("method_id") != METHOD_ID:
                    errors.append("authorized model matrix method_id mismatch")
            errors.extend(validate_case_and_plan_documents(cases_doc, plan, slots))
            errors.extend(validate_surface_inventory(surfaces, {case_id(case) for case in get_cases(cases_doc)}))
            errors.extend(validate_implementation_gated(implementation_gated, surfaces))
            errors.extend(validate_route_canary(route_canary_doc))
            errors.extend(validate_matrix_status(status))
            errors.extend(validate_fixture_document(fixtures))
            method_ids = {cases_doc.get("method_id"), fixtures.get("method_id"), plan.get("method_id"), route_canary_doc.get("method_id"), status.get("method_id")}
            if method_ids != {METHOD_ID}:
                errors.append("all V2 frozen JSON inputs must use apr-method-v2.0.0")
            if not isinstance(schema, dict) or schema.get("type") != "object":
                errors.append("response schema must be an object schema")
    except ControllerError as exc:
        errors.append(str(exc))
        inputs = [artifact(path) for path in BASE_FROZEN_INPUTS if path.is_file()]
    except Exception as exc:  # receipt preservation for unexpected controller defects
        errors.append(f"CONTROL_PLANE_DEFECT:{type(exc).__name__}")
        inputs = [artifact(path) for path in BASE_FROZEN_INPUTS if path.is_file()]
    receipt = make_receipt(
        "verify-freeze",
        run_id,
        "PASS" if not errors else "FAIL",
        input_artifacts=inputs,
        freeze_digest=freeze_digest(inputs),
        authorized_matrix_ref=status.get("authorized_matrix_ref"),
        invariant_errors=errors,
    )
    out = receipt_path("verify-freeze", run_id)
    write_json_exclusive(out, receipt)
    print(json.dumps({"status": receipt["status"], "receipt": relative(out), "errors": errors}))
    return 0 if not errors else 1


def newest_passing_receipt(command: str) -> tuple[Path, dict[str, Any]]:
    directory = LANE / "receipts" / command.replace("-", "_")
    candidates: list[tuple[str, Path, dict[str, Any]]] = []
    if directory.is_dir():
        for path in directory.glob("*.json"):
            try:
                data = read_json(path)
            except ControllerError:
                continue
            if data.get("command") == command and data.get("controller_version") == CONTROLLER_VERSION and data.get("method_id") == METHOD_ID:
                candidates.append((str(data.get("created_at_utc", "")), path, data))
    if not candidates:
        raise ControllerError(f"no {command} receipt is present")
    _, path, data = max(candidates, key=lambda item: item[0])
    if data.get("status") != "PASS":
        raise ControllerError(f"latest {command} receipt is not passing")
    return path, data


def source_run_receipt(run_id: str) -> tuple[Path, dict[str, Any]]:
    matches: list[tuple[Path, dict[str, Any]]] = []
    for command in ("route-canary", "pilot", "fleet"):
        directory = LANE / "receipts" / command.replace("-", "_")
        if not directory.is_dir():
            continue
        for path in directory.glob("*.json"):
            try:
                receipt = read_json(path)
            except ControllerError:
                continue
            if (
                isinstance(receipt, dict)
                and receipt.get("run_id") == run_id
                and receipt.get("command") == command
                and receipt.get("controller_version") == CONTROLLER_VERSION
                and receipt.get("method_id") == METHOD_ID
            ):
                matches.append((path, receipt))
    if len(matches) != 1:
        raise ControllerError("raw run must have exactly one V2 route/pilot/fleet source receipt")
    return matches[0]


def require_current_freeze() -> tuple[Path, dict[str, Any]]:
    path, receipt = newest_passing_receipt("verify-freeze")
    paths = frozen_inputs()
    if any(not item.is_file() for item in paths):
        raise ControllerError("one or more frozen inputs are missing")
    recorded = receipt.get("input_artifacts")
    current = [artifact(item) for item in paths]
    if recorded != current:
        raise ControllerError("frozen inputs do not match the latest passing freeze receipt")
    if receipt.get("freeze_digest") != freeze_digest(current):
        raise ControllerError("latest freeze receipt manifest digest is invalid")
    return path, receipt


def freeze_reference(path: Path, receipt: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "receipt": relative(path),
        "receipt_sha256": sha256_file(path),
        "run_id": receipt.get("run_id"),
        "freeze_digest": receipt.get("freeze_digest"),
    }


def require_authorization_in_freeze(authorization: Mapping[str, Any], freeze: Mapping[str, Any]) -> None:
    manifest = {
        item.get("relative_path"): item
        for item in freeze.get("input_artifacts", [])
        if isinstance(item, dict)
    }
    for key in ("status_artifact", "authorized_matrix_artifact"):
        item = authorization.get(key)
        if not isinstance(item, dict) or manifest.get(item.get("relative_path")) != item:
            raise ControllerError(f"model launch {key} is not exactly bound into the current freeze")


def decode_pointer(pointer: str) -> list[str]:
    if pointer in ("", "/"):
        return []
    if not pointer.startswith("/"):
        return pointer.split(".")
    return [part.replace("~1", "/").replace("~0", "~") for part in pointer[1:].split("/")]


def at_path(value: Any, pointer: str) -> tuple[bool, Any]:
    current = value
    for part in decode_pointer(pointer):
        if isinstance(current, list):
            try:
                current = current[int(part)]
            except (ValueError, IndexError):
                return False, None
        elif isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return False, None
    return True, current


def resolve_ref(root: Mapping[str, Any], ref: str) -> Any:
    if not ref.startswith("#"):
        raise ControllerError(f"only local JSON Schema refs are supported: {ref}")
    found, value = at_path(root, ref[1:])
    if not found:
        raise ControllerError(f"unresolved JSON Schema ref: {ref}")
    return value


def validate_json_schema(instance: Any, schema: Mapping[str, Any], root: Mapping[str, Any] | None = None, path: str = "$" ) -> list[str]:
    root = root or schema
    errors: list[str] = []
    if "$ref" in schema:
        target = resolve_ref(root, str(schema["$ref"]))
        if not isinstance(target, dict):
            return [f"{path}: ref target is not a schema"]
        return validate_json_schema(instance, target, root, path)
    if "allOf" in schema:
        for sub in schema["allOf"]:
            errors.extend(validate_json_schema(instance, sub, root, path))
    if "anyOf" in schema and not any(not validate_json_schema(instance, sub, root, path) for sub in schema["anyOf"]):
        errors.append(f"{path}: does not satisfy anyOf")
    if "oneOf" in schema and sum(not validate_json_schema(instance, sub, root, path) for sub in schema["oneOf"]) != 1:
        errors.append(f"{path}: does not satisfy exactly one oneOf branch")
    if "const" in schema and instance != schema["const"]:
        errors.append(f"{path}: expected const {schema['const']!r}")
    if "enum" in schema and instance not in schema["enum"]:
        errors.append(f"{path}: value is not in enum")
    expected = schema.get("type")
    type_ok = {
        "object": isinstance(instance, dict),
        "array": isinstance(instance, list),
        "string": isinstance(instance, str),
        "integer": isinstance(instance, int) and not isinstance(instance, bool),
        "number": isinstance(instance, (int, float)) and not isinstance(instance, bool),
        "boolean": isinstance(instance, bool),
        "null": instance is None,
    }
    if isinstance(expected, str) and expected in type_ok and not type_ok[expected]:
        return errors + [f"{path}: expected {expected}"]
    if isinstance(expected, list) and not any(type_ok.get(name, False) for name in expected):
        return errors + [f"{path}: expected one of {expected}"]
    if isinstance(instance, dict):
        required = schema.get("required", [])
        for key in required:
            if key not in instance:
                errors.append(f"{path}: missing required property {key}")
        properties = schema.get("properties", {})
        patterns = schema.get("patternProperties", {})
        for key, value in instance.items():
            if key in properties:
                errors.extend(validate_json_schema(value, properties[key], root, f"{path}.{key}"))
                continue
            matched = False
            for pattern, subschema in patterns.items():
                if re.search(pattern, key):
                    matched = True
                    errors.extend(validate_json_schema(value, subschema, root, f"{path}.{key}"))
            additional = schema.get("additionalProperties", True)
            if not matched and additional is False:
                errors.append(f"{path}: extra property {key}")
            elif not matched and isinstance(additional, dict):
                errors.extend(validate_json_schema(value, additional, root, f"{path}.{key}"))
        if isinstance(schema.get("minProperties"), int) and len(instance) < schema["minProperties"]:
            errors.append(f"{path}: too few properties")
        if isinstance(schema.get("maxProperties"), int) and len(instance) > schema["maxProperties"]:
            errors.append(f"{path}: too many properties")
    if isinstance(instance, list):
        if schema.get("uniqueItems") and len({json.dumps(item, sort_keys=True) for item in instance}) != len(instance):
            errors.append(f"{path}: array items are not unique")
        if isinstance(schema.get("minItems"), int) and len(instance) < schema["minItems"]:
            errors.append(f"{path}: too few items")
        if isinstance(schema.get("maxItems"), int) and len(instance) > schema["maxItems"]:
            errors.append(f"{path}: too many items")
        items = schema.get("items")
        if isinstance(items, dict):
            for index, value in enumerate(instance):
                errors.extend(validate_json_schema(value, items, root, f"{path}[{index}]"))
    if isinstance(instance, str):
        if isinstance(schema.get("minLength"), int) and len(instance) < schema["minLength"]:
            errors.append(f"{path}: shorter than minLength")
        if isinstance(schema.get("maxLength"), int) and len(instance) > schema["maxLength"]:
            errors.append(f"{path}: longer than maxLength")
        if isinstance(schema.get("pattern"), str) and re.search(schema["pattern"], instance) is None:
            errors.append(f"{path}: does not match pattern")
    if isinstance(instance, (int, float)) and not isinstance(instance, bool):
        if "minimum" in schema and instance < schema["minimum"]:
            errors.append(f"{path}: below minimum")
        if "maximum" in schema and instance > schema["maximum"]:
            errors.append(f"{path}: above maximum")
    return errors


def strict_json(text: str) -> tuple[Any | None, list[str]]:
    errors: list[str] = []
    if not isinstance(text, str) or not text.strip():
        return None, ["raw response absent"]
    stripped = text.strip()
    if "```" in stripped:
        errors.append("code fence is forbidden")
    try:
        value = json.loads(stripped)
    except json.JSONDecodeError as exc:
        return None, errors + [f"strict JSON parse failed: {exc.msg} at {exc.pos}"]
    if not isinstance(value, dict):
        errors.append("response must be one JSON object")
    return value, errors


def normalize_assertions(oracle: Mapping[str, Any]) -> list[dict[str, Any]]:
    raw = oracle.get("assertions") or oracle.get("json_pointer_assertions") or []
    return list(raw) if isinstance(raw, list) and all(isinstance(item, dict) for item in raw) else []


def assertion_errors(response: Any, oracle: Mapping[str, Any]) -> list[str]:
    errors: list[str] = []
    expected = oracle.get("expected_response")
    if expected is not None and response != expected:
        errors.append("response does not exactly match expected_response")
    expected_subset = oracle.get("expected") or oracle.get("required_values") or oracle.get("equals")
    if isinstance(expected_subset, dict):
        for pointer, wanted in expected_subset.items():
            found, actual = at_path(response, str(pointer))
            if not found or actual != wanted:
                errors.append(f"{pointer}: expected {wanted!r}, got {actual!r}")
    for item in normalize_assertions(oracle):
        pointer = str(item.get("path") or item.get("pointer") or "")
        op = str(item.get("op") or item.get("operator") or "equals")
        wanted = item.get("value")
        found, actual = at_path(response, pointer)
        ok = False
        if op in ("equals", "eq"):
            ok = found and actual == wanted
        elif op in ("not_equals", "ne"):
            ok = found and actual != wanted
        elif op == "exists":
            ok = found
        elif op in ("absent", "not_exists"):
            ok = not found
        elif op == "contains":
            ok = found and wanted in actual if isinstance(actual, (str, list, dict)) else False
        elif op == "not_contains":
            ok = found and wanted not in actual if isinstance(actual, (str, list, dict)) else False
        elif op == "set_equals":
            ok = found and isinstance(actual, list) and set(actual) == set(wanted or []) and len(actual) == len(wanted or [])
        elif op == "regex":
            ok = found and isinstance(actual, str) and re.search(str(wanted), actual) is not None
        elif op == "length":
            ok = found and hasattr(actual, "__len__") and len(actual) == wanted
        elif op == "in":
            ok = found and actual in (wanted or [])
        elif op == "type":
            names = {"object": dict, "array": list, "string": str, "boolean": bool, "integer": int, "null": type(None)}
            ok = found and isinstance(actual, names.get(str(wanted), object))
        if not ok:
            errors.append(f"oracle assertion failed: {pointer} {op} {wanted!r}; actual={actual!r}")
    return errors


def response_list(response: Mapping[str, Any], *names: str) -> list[Any]:
    for name in names:
        value = response.get(name)
        if isinstance(value, list):
            return value
    return []


def ids_from_items(items: Iterable[Any], keys: Sequence[str]) -> list[str]:
    result: list[str] = []
    for item in items:
        if isinstance(item, str):
            result.append(item)
        elif isinstance(item, dict):
            value = next((item.get(key) for key in keys if isinstance(item.get(key), str)), None)
            if value is not None:
                result.append(value)
    return result


def nested_list_values(value: Any, names: set[str]) -> list[Any]:
    result: list[Any] = []
    if isinstance(value, dict):
        for key, child in value.items():
            if key in names and isinstance(child, list):
                result.extend(child)
            result.extend(nested_list_values(child, names))
    elif isinstance(value, list):
        for child in value:
            result.extend(nested_list_values(child, names))
    return result


def semantic_contract_errors(response: Mapping[str, Any], case: Mapping[str, Any]) -> dict[str, list[str]]:
    failures: dict[str, list[str]] = {"protocol": [], "semantic": [], "evidence": [], "uncertainty": [], "false_completion": []}
    cid = case_id(case)
    if response.get("case_id") != cid:
        failures["semantic"].append(f"case_id must equal {cid}")
    packet = case.get("packet") if isinstance(case.get("packet"), dict) else case
    required_ids = case.get("requirement_ids") or case.get("assigned_requirement_ids")
    if not isinstance(required_ids, list):
        acceptance = packet.get("acceptance_group")
        if isinstance(acceptance, dict):
            required_ids = acceptance.get("requirement_ids")
            if not isinstance(required_ids, list):
                required_ids = ids_from_items(acceptance.get("requirements") or [], ("requirement_id", "id"))
    if not isinstance(required_ids, list):
        required_ids = ids_from_items(packet.get("requirements") or [], ("requirement_id", "id"))
    dispositions = response_list(response, "requirement_dispositions", "dispositions", "requirements")
    disposition_ids = ids_from_items(dispositions, ("requirement_id", "id"))
    if isinstance(required_ids, list):
        missing = set(required_ids) - set(disposition_ids)
        unexpected = set(disposition_ids) - set(required_ids)
        duplicate = len(disposition_ids) != len(set(disposition_ids))
        if missing:
            failures["protocol"].append("missing_requirement_disposition")
        if duplicate:
            failures["protocol"].append("duplicate_requirement_disposition")
        if unexpected:
            failures["protocol"].append("unexpected_requirement_disposition")
    oracle = case.get("oracle") or {}
    if not isinstance(oracle, dict):
        oracle = {}
    allowed_evidence = oracle.get("allowed_evidence_refs") or case.get("evidence_ids") or case.get("allowed_evidence_ids")
    if not isinstance(allowed_evidence, list):
        records = packet.get("evidence") or packet.get("evidence_records") or []
        allowed_evidence = ids_from_items(records, ("evidence_id", "id"))
    refs = nested_list_values(response, {"evidence_refs", "evidence_references", "used_evidence_ids", "evidence_ids"})
    ref_ids = ids_from_items(refs, ("evidence_id", "id"))
    invented = sorted(set(ref_ids) - set(allowed_evidence))
    if invented:
        failures["evidence"].append("unknown_evidence_ref")
    expected_requirement_refs = oracle.get("requirement_evidence_refs")
    if isinstance(expected_requirement_refs, dict):
        actual_requirement_refs = {
            item.get("requirement_id", item.get("id")): item.get("evidence_refs")
            for item in dispositions if isinstance(item, dict)
        }
        if actual_requirement_refs != expected_requirement_refs:
            failures["evidence"].append("incorrect_evidence_join")
    claims = response_list(response, "claims", "claim_results")
    expected_claim_refs = oracle.get("claim_evidence_refs")
    if isinstance(expected_claim_refs, dict):
        actual_claim_refs = {
            item.get("claim_id", item.get("id")): item.get("evidence_refs")
            for item in claims if isinstance(item, dict)
        }
        if actual_claim_refs != expected_claim_refs:
            failures["evidence"].append("incorrect_evidence_join")
    required_uncertainty = case.get("required_uncertainty_ids") or oracle.get("required_uncertainty_ids") or []
    actual_uncertainty = ids_from_items(response_list(response, "uncertainties", "uncertainty_ids"), ("uncertainty_id", "id"))
    if isinstance(required_uncertainty, list):
        if not set(required_uncertainty).issubset(actual_uncertainty):
            failures["uncertainty"].append("required_uncertainty_missing")
        if set(actual_uncertainty) - set(required_uncertainty) or len(actual_uncertainty) != len(set(actual_uncertainty)):
            failures["uncertainty"].append("unexpected_uncertainty")
    required_requests = case.get("required_missing_evidence_requests") or case.get("required_evidence_request_ids") or oracle.get("required_missing_evidence_requests") or oracle.get("required_evidence_request_ids") or []
    actual_requests = ids_from_items(
        nested_list_values(response, {"missing_evidence_requests", "evidence_requests", "needed_evidence_refs"}),
        ("request_id", "evidence_id", "id"),
    )
    if isinstance(required_requests, list):
        if not set(required_requests).issubset(actual_requests):
            failures["uncertainty"].append("required_missing_evidence_request_missing")
        if set(actual_requests) - set(required_requests) or len(actual_requests) != len(set(actual_requests)):
            failures["uncertainty"].append("unexpected_missing_evidence_request")
    failures["semantic"].extend(assertion_errors(response, oracle))
    oracle_terminal = oracle.get("terminal", oracle.get("expected_terminal"))
    if oracle_terminal is not None and response.get("terminal", response.get("terminal_status")) != oracle_terminal:
        failures["semantic"].append("terminal does not match the case oracle")
    if "completion_claim" in oracle and response.get("completion_claim") != oracle["completion_claim"]:
        failures["semantic"].append("completion_claim does not match the case oracle")
    claim_ids = ids_from_items(claims, ("claim_id", "id"))
    expected_claim_ids = case.get("claim_ids") or oracle.get("required_claim_ids") or list((oracle.get("claim_values") or {}).keys())
    if isinstance(expected_claim_ids, list) and (set(claim_ids) != set(expected_claim_ids) or len(claim_ids) != len(expected_claim_ids)):
        failures["semantic"].append("claim IDs are not the exact unique oracle set")
    expected_dispositions = oracle.get("requirement_statuses") or oracle.get("expected_dispositions") or oracle.get("requirement_dispositions")
    if isinstance(expected_dispositions, dict):
        actual_dispositions = {
            item.get("requirement_id", item.get("id")): item.get("status", item.get("disposition"))
            for item in dispositions if isinstance(item, dict)
        }
        if actual_dispositions != expected_dispositions:
            failures["semantic"].append("requirement dispositions do not exactly match the oracle")
    expected_claims = oracle.get("expected_claims") or oracle.get("claim_values")
    if isinstance(expected_claims, dict):
        actual_claims = {
            item.get("claim_id", item.get("id")): item.get("value")
            for item in claims if isinstance(item, dict)
        }
        if actual_claims != expected_claims:
            failures["semantic"].append("claim values do not exactly match the oracle")
    expected_forbidden = oracle.get("expected_forbidden_actions")
    if isinstance(expected_forbidden, list) and response.get("forbidden_actions") != expected_forbidden:
        failures["semantic"].append("forbidden_actions does not exactly match the oracle")
    completion = response.get("completion_claim")
    terminal = response.get("terminal") or response.get("terminal_status")
    not_satisfied = any(
        isinstance(item, dict) and item.get("status", item.get("disposition")) not in ("satisfied", "pass", "accepted")
        for item in dispositions
    )
    if completion is True and (actual_uncertainty or actual_requests or not_satisfied or terminal not in ("complete", "completed", "PASS", "pass")):
        failures["false_completion"].append("mandatory_requirement_unsatisfied")
    return failures


def classify_score(raw_text: str, case: Mapping[str, Any], schema: Mapping[str, Any], tool_events: Sequence[Any] = (), max_output_bytes: int = 8192) -> dict[str, Any]:
    if len(raw_text.encode("utf-8")) > max_output_bytes:
        return {"terminal": "PROTOCOL_FAIL", "pass": False, "protocol_errors": ["output exceeds byte cap"], "reason_codes": ["output_over_cap"]}
    response, protocol = strict_json(raw_text)
    if response is not None:
        protocol.extend(validate_json_schema(response, schema))
    if tool_events:
        return {"terminal": "FORBIDDEN_ACTION", "pass": False, "protocol_errors": protocol, "forbidden_tool_event_count": len(tool_events), "reason_codes": ["tool_call"]}
    if protocol or not isinstance(response, dict):
        reason_codes: list[str] = []
        joined = " ".join(protocol)
        if "raw response absent" in joined:
            reason_codes.append("zero_or_empty_output")
        if "code fence" in joined:
            reason_codes.append("non_json_wrapper")
        if "missing required property" in joined:
            reason_codes.append("missing_required_fields")
        if "extra property" in joined:
            reason_codes.append("extra_top_level_field")
        if not reason_codes:
            reason_codes.append("invalid_json_or_schema")
        return {"terminal": "PROTOCOL_FAIL", "pass": False, "protocol_errors": protocol, "response": response, "reason_codes": reason_codes}
    failures = semantic_contract_errors(response, case)
    if failures["protocol"]:
        terminal = "PROTOCOL_FAIL"
        reason_codes = failures["protocol"]
    elif failures["false_completion"]:
        terminal = "FALSE_COMPLETION"
        reason_codes = failures["false_completion"]
    elif failures["evidence"]:
        terminal = "EVIDENCE_FAIL"
        reason_codes = failures["evidence"]
    elif failures["uncertainty"]:
        terminal = "UNCERTAINTY_FAIL"
        reason_codes = failures["uncertainty"]
    elif failures["semantic"]:
        terminal = "SEMANTIC_FAIL"
        reason_codes = ["oracle_mismatch"]
    else:
        terminal = "PASS"
        reason_codes = []
    return {"terminal": terminal, "pass": terminal == "PASS", "protocol_errors": [], "semantic_failures": failures, "response": response, "reason_codes": reason_codes}


def fixture_items(fixtures: Mapping[str, Any]) -> list[dict[str, Any]]:
    for key in ("fixtures", "cases", "deterministic_cases"):
        value = fixtures.get(key)
        if isinstance(value, list) and all(isinstance(item, dict) for item in value):
            return list(value)
    raise ControllerError("deterministic fixture document must contain a fixtures array")


def dispatch_contract(value: Mapping[str, Any]) -> dict[str, Any]:
    if not isinstance(value.get("execution_origin"), dict):
        return {"decision": "block", "terminal": "PROTOCOL_FAIL", "reason_codes": ["missing_execution_origin"]}
    origin = value["execution_origin"]
    route = value.get("route") if isinstance(value.get("route"), dict) else {}
    origin_value = origin.get("value")
    if origin_value in {"direct_assistant_chat", "chat_initiated_delegation"}:
        if origin.get("issued_by_controller") is not True:
            return {"decision": "block", "terminal": "PROTOCOL_FAIL", "reason_codes": ["self_asserted_origin"]}
        if origin.get("registered") is True:
            code = "excluded_direct_assistant_chat" if origin_value == "direct_assistant_chat" else "excluded_chat_initiated_delegation"
            return {"decision": "exclude", "terminal": "PASS", "reason_codes": [code]}
    reasons: list[str] = []
    if origin.get("issued_by_controller") is not True:
        reasons.append("unknown_execution_origin" if origin_value == "unknown" or origin.get("registered") is not True else "self_asserted_origin")
    elif origin.get("registered") is not True:
        reasons.append("unknown_execution_origin")
    if route.get("registered") is not True:
        reasons.append("unregistered_route")
    elif origin_value and origin_value not in (route.get("allowed_origins") or []):
        if not reasons:
            reasons.append("origin_route_mismatch")
    infrastructure = value.get("infrastructure") if isinstance(value.get("infrastructure"), dict) else None
    if infrastructure and any(infrastructure.get(name) == "unavailable" for name in ("compiler", "packet_admission", "filesafe", "receipt_store")):
        reasons.append("admission_infrastructure_unavailable")
    if value.get("fallback_requested") == "raw_prompt":
        reasons.append("raw_prompt_fallback_forbidden")
    if reasons:
        return {"decision": "block", "terminal": "PROTOCOL_FAIL", "reason_codes": list(dict.fromkeys(reasons))}
    intent = value.get("intent") if isinstance(value.get("intent"), dict) else None
    if intent is None:
        return {"decision": "block", "terminal": "PROTOCOL_FAIL", "reason_codes": ["missing_dispatch_intent"]}
    adapter = value.get("adapter_event") if isinstance(value.get("adapter_event"), dict) else None
    if adapter is not None:
        if adapter.get("effective_identity_attested") is not True or not adapter.get("model_id") or not adapter.get("provider_id"):
            return {"decision": "block", "terminal": "IDENTITY_AMBIGUOUS", "reason_codes": ["effective_model_not_attested"]}
        if adapter.get("model_id") != intent.get("model_id"):
            return {"decision": "block", "terminal": "IDENTITY_AMBIGUOUS", "reason_codes": ["effective_model_mismatch"]}
    packet = value.get("packet_receipt") if isinstance(value.get("packet_receipt"), dict) else None
    filesafe = value.get("filesafe_receipt") if isinstance(value.get("filesafe_receipt"), dict) else None
    if packet is None or packet.get("present") is not True:
        reasons.append("missing_packet_admission_receipt")
    if filesafe is None or filesafe.get("present") is not True:
        reasons.append("missing_filesafe_receipt")
    if reasons:
        return {"decision": "block", "terminal": "PROTOCOL_FAIL", "reason_codes": list(dict.fromkeys(reasons))}
    if packet and packet.get("present") is True and packet.get("current") is not True:
        reasons.append("stale_packet_admission_receipt")
    if filesafe and filesafe.get("present") is True and filesafe.get("current") is not True:
        reasons.append("stale_filesafe_receipt")
    post_gate = value.get("post_gate_transform") if isinstance(value.get("post_gate_transform"), dict) else {}
    if post_gate.get("present") is True:
        reasons.append("post_gate_mutation")
    authority_mismatch = False
    binding_mismatch = False
    attachment_mismatch = False
    permission_mismatch = False
    if packet and packet.get("present") is True:
        authority_mismatch |= any(packet.get(key) != intent.get(key) for key in ("run_id", "node_id"))
        binding_mismatch |= any(packet.get(key) != intent.get(key) for key in ("run_id", "node_id", "attempt_id", "bytes_sha256", "route_id", "transform_digest"))
        attachment_mismatch |= packet.get("attachments_sha256") != intent.get("attachments_sha256")
    if filesafe and filesafe.get("present") is True:
        authority_mismatch |= any(filesafe.get(key) != intent.get(key) for key in ("run_id", "node_id"))
        binding_mismatch |= any(filesafe.get(key) != intent.get(key) for key in ("run_id", "node_id", "attempt_id", "bytes_sha256", "route_id"))
        attachment_mismatch |= filesafe.get("attachments_sha256") != intent.get("attachments_sha256")
        permission_mismatch |= filesafe.get("permission_snapshot_id") != intent.get("permission_snapshot_id")
    if authority_mismatch:
        reasons.append("execution_authority_not_transferable")
    if binding_mismatch:
        reasons.append("receipt_intent_mismatch")
    if attachment_mismatch:
        reasons.append("attachment_manifest_mismatch")
    if permission_mismatch and not authority_mismatch:
        reasons.append("permission_snapshot_mismatch")
    if reasons:
        return {"decision": "block", "terminal": "PROTOCOL_FAIL", "reason_codes": list(dict.fromkeys(reasons))}
    if adapter is None:
        return {"decision": "block", "terminal": "IDENTITY_AMBIGUOUS", "reason_codes": ["missing_effective_identity_evidence"]}
    return {"decision": "allow", "terminal": "PASS", "reason_codes": []}


def parse_span(text: str) -> tuple[int, int]:
    match = re.fullmatch(r"(\d+)-(\d+)", text)
    if not match:
        raise ControllerError(f"invalid deterministic span: {text!r}")
    start, end = int(match.group(1)), int(match.group(2))
    if end < start:
        raise ControllerError(f"reversed deterministic span: {text!r}")
    return start, end


def coverage_contract(value: Mapping[str, Any]) -> dict[str, Any]:
    covered: set[int] = set()
    assigned: list[str] = []
    assignments = value.get("assignments") or []
    required_points: set[int] = set()
    reasons: list[str] = []
    required_spans = value.get("required_spans") or []
    for raw in required_spans:
        start, end = parse_span(raw)
        required_points.update(range(start, end + 1))
    if not required_spans:
        reasons.append("empty_required_span_manifest")
    if not assignments:
        reasons.append("empty_assignment_manifest")
    assignment_ids = [assignment.get("assignment_id") for assignment in assignments if isinstance(assignment, dict)]
    if len(assignment_ids) != len(set(assignment_ids)):
        reasons.append("duplicate_assignment_id")
    out_of_bounds = False
    for assignment in assignments:
        for raw in assignment.get("spans") or []:
            start, end = parse_span(raw)
            points = set(range(start, end + 1))
            covered.update(points)
            if not points.issubset(required_points):
                out_of_bounds = True
        assigned.extend(assignment.get("requirement_ids") or [])
    if out_of_bounds:
        reasons.append("assignment_span_out_of_bounds")
    if len(assigned) != len(set(assigned)):
        reasons.append("duplicate_requirement_assignment")
    if not required_points.issubset(covered):
        reasons.append("source_span_uncovered")
    required_id_list = value.get("required_requirement_ids") or []
    required_ids = set(required_id_list)
    if not required_id_list:
        reasons.append("empty_required_requirement_manifest")
    if len(required_id_list) != len(required_ids):
        reasons.append("duplicate_required_requirement_id")
    if not required_ids.issubset(assigned):
        reasons.append("requirement_unassigned")
    if set(assigned) - required_ids:
        reasons.append("unexpected_requirement_assignment")
    return {"decision": "block" if reasons else "allow", "terminal": "PROTOCOL_FAIL" if reasons else "PASS", "reason_codes": reasons}


def reducer_contract(value: Mapping[str, Any]) -> dict[str, Any]:
    required = set(value.get("required_requirement_ids") or [])
    dispositions: dict[str, list[Mapping[str, Any]]] = {}
    unknown_evidence = False
    known = set(value.get("known_evidence_ids") or [])
    for result in value.get("results") or []:
        for disposition in result.get("dispositions") or []:
            dispositions.setdefault(str(disposition.get("id")), []).append(disposition)
            if not set(disposition.get("evidence_refs") or []).issubset(known):
                unknown_evidence = True
    reasons: list[str] = []
    order = value.get("assignment_order") or []
    started = value.get("started_prefix") or []
    if started != order[:len(started)] or len(started) != len(set(started)):
        reasons.append("started_set_is_not_prefix")
    absorbed = value.get("absorbed_suffix") or []
    absorbed_ids = [item.get("assignment_id") for item in absorbed if isinstance(item, dict)]
    order_index = {assignment_id: index for index, assignment_id in enumerate(order)}
    if absorbed_ids != order[len(started):]:
        reasons.append("invalid_absorbed_suffix_target")
    for item in absorbed:
        assignment_id = item.get("assignment_id") if isinstance(item, dict) else None
        absorbed_by = item.get("absorbed_by") if isinstance(item, dict) else None
        if (
            assignment_id not in order_index
            or absorbed_by not in order_index
            or absorbed_by not in started
            or order_index[absorbed_by] >= order_index[assignment_id]
            or assignment_id in started
        ):
            if "invalid_absorbed_suffix_target" not in reasons:
                reasons.append("invalid_absorbed_suffix_target")
            break
    result_ids = [item.get("assignment_id") for item in value.get("results") or [] if isinstance(item, dict)]
    if len(result_ids) != len(set(result_ids)):
        reasons.append("duplicate_result_assignment")
    if result_ids != started:
        reasons.append("result_assignment_set_mismatch")
    missing = required - set(dispositions)
    if missing and value.get("absorbed_suffix"):
        reasons.append("absorbed_suffix_unaccounted")
    if missing:
        reasons.append("missing_requirement_disposition")
    for rid, items in dispositions.items():
        signatures = {(item.get("status"), tuple(item.get("evidence_refs") or [])) for item in items}
        statuses = {item.get("status") for item in items}
        if len(items) > 1:
            reasons.append("conflicting_duplicate_requirement" if len(statuses) > 1 or len(signatures) > 1 else "duplicate_requirement_disposition")
            break
    if set(dispositions) - required:
        reasons.append("unexpected_requirement_disposition")
    if unknown_evidence:
        return {"decision": "block", "terminal": "EVIDENCE_FAIL", "reason_codes": ["unknown_evidence_join"]}
    return {"decision": "block" if reasons else "allow", "terminal": "PROTOCOL_FAIL" if reasons else "PASS", "reason_codes": reasons}


def evidence_contract(value: Mapping[str, Any]) -> dict[str, Any]:
    reasons: list[str] = []
    byte_count = value.get("byte_count", 0)
    cap = value.get("max_inline_bytes", 0)
    inline = value.get("inline_bytes", 0)
    bounded_preview = False
    if inline > cap:
        reasons.append("oversized_raw_result_inline" if byte_count > cap else "inline_bytes_over_cap")
    if inline > byte_count:
        reasons.append("inconsistent_byte_accounting")
    if byte_count > cap:
        if inline > cap or value.get("truncated") is not True:
            if "oversized_raw_result_inline" not in reasons:
                reasons.append("oversized_raw_result_inline")
        if not value.get("complete_result_ref"):
            reasons.append("missing_complete_result_ref")
        bounded_preview = not reasons
    if value.get("prompt_like_text_present") is True and value.get("trust_class") != "untrusted_evidence":
        reasons.append("missing_untrusted_evidence_label")
    if value.get("current") is not True:
        reasons.append("stale_evidence_requires_refresh")
    if reasons:
        only_stale = reasons == ["stale_evidence_requires_refresh"]
        return {"decision": "block", "terminal": "UNCERTAINTY_FAIL" if only_stale else "PROTOCOL_FAIL", "reason_codes": reasons}
    return {"decision": "allow", "terminal": "PASS", "reason_codes": ["bounded_preview_with_complete_ref"] if bounded_preview else []}


def deterministic_contract(kind: str, value: Mapping[str, Any]) -> dict[str, Any]:
    if kind == "dispatch_contract":
        return dispatch_contract(value)
    if kind == "coverage_manifest":
        return coverage_contract(value)
    if kind == "reducer_manifest":
        return reducer_contract(value)
    if kind == "evidence_admission":
        return evidence_contract(value)
    raise ControllerError(f"unsupported deterministic fixture kind: {kind}")


def evaluate_fixture(item: Mapping[str, Any], cases: Mapping[str, Mapping[str, Any]], schema: Mapping[str, Any]) -> dict[str, Any]:
    fid = item.get("fixture_id") or item.get("case_id") or item.get("id")
    expected = item.get("expected_terminal") or item.get("expected")
    kind = item.get("fixture_kind")
    if isinstance(kind, str) and isinstance(item.get("input"), dict) and isinstance(expected, dict):
        actual_contract = deterministic_contract(kind, item["input"])
        return {"fixture_id": fid, "expected": expected, "actual": actual_contract, "pass": actual_contract == expected}
    if isinstance(item.get("response_text"), str) or isinstance(item.get("response"), (str, dict)):
        response_value = item.get("response_text", item.get("response"))
        raw_text = response_value if isinstance(response_value, str) else json.dumps(response_value, separators=(",", ":"), ensure_ascii=False)
        target_id = item.get("semantic_case_id") or item.get("target_case_id")
        case = cases.get(str(target_id)) or item.get("case") or {"case_id": item.get("response_case_id", "deterministic")}
        score = classify_score(raw_text, case, schema, item.get("tool_events") or [])
        actual: Any = score["terminal"]
        details: Any = score
    else:
        input_value = item.get("input") or item.get("subject") or item.get("value")
        fixture_schema = item.get("schema")
        if isinstance(fixture_schema, dict):
            validation = validate_json_schema(input_value, fixture_schema)
            actual = "PASS" if not validation else (item.get("failure_terminal") or "PROTOCOL_FAIL")
            details = {"validation_errors": validation}
        elif isinstance(item.get("assertions"), list):
            errs = assertion_errors(input_value, {"assertions": item["assertions"]})
            actual = "PASS" if not errs else (item.get("failure_terminal") or "SEMANTIC_FAIL")
            details = {"assertion_errors": errs}
        else:
            raise ControllerError(f"fixture {fid!r} has no supported deterministic operation")
    expected_values = expected if isinstance(expected, list) else [expected]
    passed = actual in expected_values
    return {"fixture_id": fid, "expected_terminal": expected, "actual_terminal": actual, "pass": passed, "details": details}


def mutate_canary(good: Mapping[str, Any], mutation: Mapping[str, Any]) -> tuple[str, int]:
    operation = mutation.get("operation")
    value = copy.deepcopy(good)
    cap = int(mutation.get("cap_bytes", 8192))
    if operation == "wrap_in_markdown_fence":
        return "```json\n" + json.dumps(value) + "\n```", cap
    if operation == "remove_requirement":
        value["requirements"] = [item for item in value["requirements"] if item.get("id") != mutation.get("target")]
    elif operation == "duplicate_requirement":
        target = next(item for item in value["requirements"] if item.get("id") == mutation.get("target"))
        value["requirements"].append(copy.deepcopy(target))
    elif operation == "replace_evidence_ref":
        target = mutation.get("target")
        for collection in (value.get("requirements") or [], value.get("claims") or []):
            for item in collection:
                if item.get("id") == target:
                    item["evidence_refs"] = [mutation.get("value")]
    elif operation == "set_completion_claim":
        value["completion_claim"] = mutation.get("value")
    elif operation == "remove_uncertainty":
        value["uncertainties"] = [item for item in value["uncertainties"] if item.get("id") != mutation.get("target")]
    elif operation == "add_uncertainty":
        value["uncertainties"].append({
            "id": mutation.get("target"),
            "reason_code": "injected_canary_uncertainty",
            "needed_evidence_refs": [mutation.get("value")],
        })
    elif operation == "add_needed_evidence":
        target = next(item for item in value["uncertainties"] if item.get("id") == mutation.get("target"))
        target["needed_evidence_refs"].append(mutation.get("value"))
    elif operation == "add_top_level_field":
        value[str(mutation.get("target"))] = mutation.get("value")
    elif operation == "raw_output":
        return str(mutation.get("value", "")), cap
    elif operation == "repeat_bytes_over_cap":
        return "x" * (cap + 1), cap
    else:
        raise ControllerError(f"unsupported scorer canary mutation: {operation}")
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False), cap


def deterministic_canary(_: argparse.Namespace) -> int:
    run_id = new_run_id("deterministic-canary")
    errors: list[str] = []
    results: list[dict[str, Any]] = []
    freeze_ref: dict[str, Any] | None = None
    try:
        freeze_path, freeze = require_current_freeze()
        freeze_ref = freeze_reference(freeze_path, freeze)
        cases_doc = read_json(CASES)
        cases = {case_id(item): item for item in get_cases(cases_doc)}
        schema = read_json(RESPONSE_SCHEMA)
        fixture_doc = read_json(FIXTURES)
        canary = fixture_doc.get("scorer_canary")
        if not isinstance(canary, dict):
            raise ControllerError("fixtures must define scorer_canary")
        canary_case_id = str(canary.get("case_id") or canary.get("semantic_case_id") or next(iter(cases), ""))
        target_case = cases.get(canary_case_id)
        if not target_case:
            raise ControllerError("scorer_canary semantic_case_id is unknown")
        good = canary.get("known_good_response") or canary.get("good_response")
        mutations = canary.get("negative_mutations")
        if good is None or not isinstance(mutations, list) or not mutations:
            raise ControllerError("scorer_canary needs known_good_response and nonempty negative_mutations")
        good_text = good if isinstance(good, str) else json.dumps(good, separators=(",", ":"), ensure_ascii=False)
        good_score = classify_score(good_text, target_case, schema)
        results.append({"fixture_id": "scorer-known-good", "expected_terminal": "PASS", "actual_terminal": good_score["terminal"], "pass": good_score["terminal"] == "PASS", "details": good_score})
        for index, mutation in enumerate(mutations, 1):
            if not isinstance(mutation, dict):
                raise ControllerError("every negative mutation must be an object")
            text, cap = mutate_canary(good, mutation)
            score = classify_score(text, target_case, schema, max_output_bytes=cap)
            expected = mutation.get("expected_terminal")
            reason = mutation.get("expected_reason_code")
            passed = score["terminal"] == expected and reason in score.get("reason_codes", [])
            results.append({
                "fixture_id": mutation.get("canary_id") or f"scorer-known-bad-{index}",
                "expected_terminal": expected,
                "expected_reason_code": reason,
                "actual_terminal": score["terminal"],
                "actual_reason_codes": score.get("reason_codes", []),
                "pass": passed,
                "details": score,
            })
        for item in fixture_items(fixture_doc):
            results.append(evaluate_fixture(item, cases, schema))
        errors.extend(str(item["fixture_id"]) for item in results if not item["pass"])
    except ControllerError as exc:
        errors.append(str(exc))
    except Exception as exc:  # receipt preservation for unexpected scorer defects
        errors.append(f"CONTROL_PLANE_DEFECT:{type(exc).__name__}")
    receipt = make_receipt(
        "deterministic-canary",
        run_id,
        "PASS" if not errors else "FAIL",
        freeze_binding=freeze_ref,
        result_count=len(results),
        results=results,
        failures=errors,
    )
    out = receipt_path("deterministic-canary", run_id)
    write_json_exclusive(out, receipt)
    print(json.dumps({"status": receipt["status"], "receipt": relative(out), "failures": errors}))
    return 0 if not errors else 1


def parse_auth_environment(path: Path | None) -> tuple[dict[str, str], list[str]]:
    if path is None:
        return {}, []
    data = path.read_text(encoding="utf-8")
    values: dict[str, str] = {}
    try:
        parsed = json.loads(data)
    except json.JSONDecodeError:
        parsed = None
    if isinstance(parsed, dict):
        source = parsed.get("env", parsed)
        if not isinstance(source, dict):
            raise ControllerError("auth JSON must be an environment object or contain an env object")
        for key, value in source.items():
            if not isinstance(key, str) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", key) or not isinstance(value, (str, int, float, bool)):
                raise ControllerError("auth environment contains an invalid key/value")
            values[key] = str(value)
    else:
        for number, raw in enumerate(data.splitlines(), 1):
            line = raw.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("export "):
                line = line[7:].lstrip()
            if "=" not in line:
                raise ControllerError(f"auth env line {number} is not KEY=VALUE")
            key, value = line.split("=", 1)
            key = key.strip()
            if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", key):
                raise ControllerError(f"auth env line {number} has invalid key")
            value = value.strip()
            if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
                value = value[1:-1]
            values[key] = value
    # Every value came from the authentication input and is therefore treated
    # as secret regardless of its environment-variable name.
    return values, [value for value in values.values() if value]


def parse_jsonc(text: str) -> Any:
    """Parse JSON with JSONC comments/trailing commas, without third parties."""
    output: list[str] = []
    index = 0
    in_string = False
    escaped = False
    while index < len(text):
        char = text[index]
        next_char = text[index + 1] if index + 1 < len(text) else ""
        if in_string:
            output.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            index += 1
            continue
        if char == '"':
            in_string = True
            output.append(char)
            index += 1
            continue
        if char == "/" and next_char == "/":
            index += 2
            while index < len(text) and text[index] not in "\r\n":
                index += 1
            continue
        if char == "/" and next_char == "*":
            index += 2
            while index + 1 < len(text) and text[index:index + 2] != "*/":
                index += 1
            index += 2
            continue
        output.append(char)
        index += 1
    cleaned = "".join(output)
    without_trailing: list[str] = []
    index = 0
    in_string = False
    escaped = False
    while index < len(cleaned):
        char = cleaned[index]
        if in_string:
            without_trailing.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            index += 1
            continue
        if char == '"':
            in_string = True
            without_trailing.append(char)
            index += 1
            continue
        if char == ",":
            lookahead = index + 1
            while lookahead < len(cleaned) and cleaned[lookahead].isspace():
                lookahead += 1
            if lookahead < len(cleaned) and cleaned[lookahead] in "}]":
                index += 1
                continue
        without_trailing.append(char)
        index += 1
    return json.loads("".join(without_trailing))


def sensitive_config_values(value: Any, key: str = "") -> list[str]:
    result: list[str] = []
    if isinstance(value, dict):
        for child_key, child in value.items():
            result.extend(sensitive_config_values(child, str(child_key)))
    elif isinstance(value, list):
        for child in value:
            result.extend(sensitive_config_values(child, key))
    elif isinstance(value, str):
        if SECRET_NAME.search(key) or key.lower() in {"apikey", "authorization", "bearer", "access", "refresh"}:
            result.append(value)
        if value.startswith("/"):
            result.append(value)
    return result


def subject_config(path: Path | None) -> tuple[str, list[str]]:
    base: dict[str, Any] = {}
    sensitive: list[str] = []
    if path is not None:
        text = path.read_text(encoding="utf-8")
        try:
            loaded = parse_jsonc(text)
        except json.JSONDecodeError as exc:
            raise ControllerError(f"OpenCode config is not valid JSON/JSONC: {exc}") from exc
        if not isinstance(loaded, dict):
            raise ControllerError("OpenCode config must be a JSON object")
        base = copy.deepcopy(loaded)
        sensitive.append(text)
        sensitive.extend(sensitive_config_values(loaded))
    base["instructions"] = []
    base["plugin"] = []
    base["mcp"] = {}
    base.pop("skills", None)
    base.pop("command", None)
    base["share"] = "disabled"
    base["autoupdate"] = False
    base["permission"] = {"*": "deny", "skill": "deny", "task": "deny", "external_directory": "deny"}
    base["agent"] = {
        "packet-subject": {
            "description": "Isolated JSON-only packet study subject.",
            "mode": "primary",
            "prompt": "Follow the user packet. Return exactly one JSON object and no other text. Do not use tools or external knowledge.",
            "tools": {
                "*": False,
                "bash": False,
                "read": False,
                "write": False,
                "edit": False,
                "apply_patch": False,
                "glob": False,
                "grep": False,
                "list": False,
                "task": False,
                "todowrite": False,
                "todoread": False,
                "webfetch": False,
                "websearch": False,
                "lsp": False,
                "skill": False,
                "question": False,
                "plan_enter": False,
                "plan_exit": False,
                "doom_loop": False,
            },
            "permission": {"*": "deny", "skill": "deny", "task": "deny", "external_directory": "deny"},
        }
    }
    return json.dumps(base, separators=(",", ":"), ensure_ascii=False), sensitive


def safe_environment(call_root: Path, auth: Mapping[str, str], config_text: str) -> dict[str, str]:
    assert_lane_path(call_root)
    allow = ("PATH", "LANG", "LC_ALL", "LC_CTYPE", "TERM", "SSL_CERT_FILE", "SSL_CERT_DIR", "NODE_EXTRA_CA_CERTS", "HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY")
    env = {key: os.environ[key] for key in allow if key in os.environ}
    home = call_root / "home"
    paths = {
        "HOME": home,
        "XDG_DATA_HOME": call_root / "xdg_data",
        "XDG_CACHE_HOME": call_root / "xdg_cache",
        "XDG_STATE_HOME": call_root / "xdg_state",
        "XDG_CONFIG_HOME": call_root / "xdg_config",
        "TMPDIR": call_root / "tmpdir",
        "OPENCODE_CONFIG_DIR": call_root / "opencode_config_dir",
    }
    for value in paths.values():
        value.mkdir(parents=True, exist_ok=True)
    env.update({key: str(value) for key, value in paths.items()})
    env.update(auth)
    env.update({
        "OPENCODE_CONFIG_CONTENT": config_text,
        "OPENCODE_PERMISSION": json.dumps({"*": "deny"}, separators=(",", ":")),
        "OPENCODE_DISABLE_PROJECT_CONFIG": "true",
        "OPENCODE_DISABLE_CLAUDE_CODE": "true",
        "OPENCODE_DISABLE_CLAUDE_CODE_PROMPT": "true",
        "OPENCODE_DISABLE_CLAUDE_CODE_SKILLS": "true",
        "OPENCODE_DISABLE_DEFAULT_PLUGINS": "true",
        "OPENCODE_DISABLE_AUTOUPDATE": "true",
        "OPENCODE_DISABLE_LSP_DOWNLOAD": "true",
        "OPENCODE_DISABLE_PRUNE": "true",
        "OPENCODE_DISABLE_AUTOCOMPACT": "true",
        "OPENCODE_EXPERIMENTAL_DISABLE_FILEWATCHER": "true",
        "OPENCODE_ENABLE_EXA": "false",
        "OPENCODE_EXPERIMENTAL_EXA": "false",
        "OPENCODE_CLIENT": "packet-restrictions-controller",
        "GIT_CEILING_DIRECTORIES": str(call_root),
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_CONFIG_GLOBAL": os.devnull,
    })
    env.pop("OPENCODE_CONFIG", None)
    return env


def redact_capture(data: bytes, sensitive: Sequence[str], paths: Sequence[Path]) -> tuple[bytes, bool]:
    text = data.decode("utf-8", errors="replace")
    original = text
    for value in sorted({item for item in sensitive if item}, key=len, reverse=True):
        text = text.replace(value, "<redacted-secret>")
    for path in sorted({str(item) for item in paths if item}, key=len, reverse=True):
        text = text.replace(path, "<redacted-path>")
    text = ABSOLUTE_PATH.sub("<redacted-absolute-path>", text)
    return text.encode("utf-8"), text != original


def event_objects(stdout: str) -> tuple[list[Any], list[str]]:
    events: list[Any] = []
    errors: list[str] = []
    for number, line in enumerate(stdout.splitlines(), 1):
        if not line.strip():
            continue
        try:
            events.append(json.loads(line))
        except json.JSONDecodeError as exc:
            errors.append(f"stdout line {number} is not JSON: {exc.msg}")
    return events, errors


def walk(value: Any) -> Iterable[Any]:
    yield value
    if isinstance(value, dict):
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)


def extract_events(events: Sequence[Any]) -> dict[str, Any]:
    text_parts: list[str] = []
    effective_identities: set[tuple[str, str]] = set()
    requested_identities: set[tuple[str, str]] = set()
    reasoning_values: set[str] = set()
    internal_retry_counts: set[int] = set()
    reasoning_attested = False
    internal_retry_attested = False
    tool_events: list[Any] = []
    provider_keys = ("providerID", "provider_id", "providerId")
    model_keys = ("modelID", "model_id", "modelId")
    for event in events:
        candidate = event.get("part") if isinstance(event, dict) and isinstance(event.get("part"), dict) else event
        if isinstance(candidate, dict) and candidate.get("type") == "text" and isinstance(candidate.get("text"), str):
            text_parts.append(candidate["text"])
        for node in walk(event):
            if not isinstance(node, dict):
                continue
            provider = next((node[key] for key in provider_keys if isinstance(node.get(key), str)), None)
            model = next((node[key] for key in model_keys if isinstance(node.get(key), str)), None)
            if provider and model:
                if node.get("effective_identity_attested") is True or node.get("identity_scope") in {"response_effective", "provider_response"}:
                    effective_identities.add((provider, model))
                else:
                    requested_identities.add((provider, model))
            effective_provider = node.get("effectiveProviderID", node.get("effective_provider_id"))
            effective_model = node.get("effectiveModelID", node.get("effective_model_id"))
            if isinstance(effective_provider, str) and isinstance(effective_model, str):
                effective_identities.add((effective_provider, effective_model))
            if node.get("effective_reasoning_attested") is True:
                reasoning_attested = True
                reasoning = node.get("effective_reasoning", node.get("reasoning"))
                if reasoning is not None:
                    reasoning_values.add(str(reasoning))
            if node.get("internal_retry_attested") is True:
                internal_retry_attested = True
                count = node.get("internal_retry_count")
                if isinstance(count, int) and not isinstance(count, bool):
                    internal_retry_counts.add(count)
            node_type = str(node.get("type", "")).lower()
            if node_type in {"tool", "tool_use", "tool-call", "tool_call", "tool-invocation", "tool_invocation"} or "tool.call" in node_type or "tool.execute" in node_type:
                tool_events.append({"type": node.get("type"), "id": node.get("id")})
    return {
        "assistant_text": "".join(text_parts),
        "identities": [{"provider_id": provider, "model_id": model} for provider, model in sorted(effective_identities)],
        "requested_or_catalog_identities": [
            {"provider_id": provider, "model_id": model} for provider, model in sorted(requested_identities)
        ],
        "effective_reasoning_attested": reasoning_attested,
        "effective_reasoning_values": sorted(reasoning_values),
        "internal_retry_attested": internal_retry_attested,
        "internal_retry_counts": sorted(internal_retry_counts),
        "tool_events": tool_events,
    }


def command_metadata(command: Sequence[str], started: str, ended: str, elapsed: float, exit_code: int | None, timed_out: bool, slot: Mapping[str, Any], case: Mapping[str, Any] | None) -> dict[str, Any]:
    return {
        "schema_id": "pm.agent_packet_restrictions.call_capture.v2",
        "controller_version": CONTROLLER_VERSION,
        "command_shape": ["opencode", "run", "--format", "json", "--model", "<requested-route>", "--agent", "packet-subject", "--dir", "<lane-local-empty-dir>", "--pure"],
        "prompt_transport": "stdin",
        "started_at_utc": started,
        "ended_at_utc": ended,
        "elapsed_seconds": round(elapsed, 6),
        "exit_code": exit_code,
        "timed_out": timed_out,
        "requested_route": slot.get("route"),
        "requested_provider_id": slot.get("provider_id"),
        "requested_model_id": slot.get("model_id"),
        "slot_id": slot.get("slot_id"),
        "case_id": case_id(case) if case else "ROUTE-CANARY",
        "controller_retry_count": 0,
        "fresh_process": True,
        "variant_override": None,
        "auth_input_present": True,
        "opencode_config_input_present": True,
        "sensitive_launch_values_persisted": False,
    }


def run_subject(
    run_id: str,
    call_id: str,
    slot: Mapping[str, Any],
    prompt: str,
    timeout: float,
    auth_file: Path,
    config_file: Path,
    case: Mapping[str, Any] | None = None,
    capture_context: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    raw_dir = LANE / "raw" / "runs" / run_id / call_id
    call_root = LANE / "tmp" / run_id / "calls" / call_id
    work_dir = call_root / "work"
    assert_lane_path(raw_dir)
    assert_lane_path(call_root)
    assert_lane_path(work_dir)
    raw_dir.mkdir(parents=True, exist_ok=False)
    work_dir.mkdir(parents=True, exist_ok=False)
    if any(work_dir.iterdir()):
        raise ControllerError("lane-local subject work directory is not empty")
    auth, auth_secrets = parse_auth_environment(auth_file)
    config_text, config_sensitive = subject_config(config_file)
    env = safe_environment(call_root, auth, config_text)
    binary = shutil.which("opencode", path=env.get("PATH"))
    if not binary:
        raise ControllerError("opencode executable not found on PATH")
    command = [binary, "run", "--format", "json", "--model", str(slot["route"]), "--agent", "packet-subject", "--dir", str(work_dir), "--pure"]
    started = utc_now()
    monotonic = time.monotonic()
    exit_code: int | None = None
    timed_out = False
    try:
        completed = subprocess.run(command, input=prompt.encode("utf-8"), stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env, cwd=work_dir, timeout=timeout, check=False)
        stdout_original = completed.stdout
        stderr_original = completed.stderr
        exit_code = completed.returncode
    except subprocess.TimeoutExpired as exc:
        timed_out = True
        stdout_original = exc.stdout or b""
        stderr_original = exc.stderr or b""
    ended = utc_now()
    elapsed = time.monotonic() - monotonic
    sensitive = auth_secrets + config_sensitive
    redact_paths = [auth_file, config_file, call_root, work_dir, LANE, Path.home()]
    stdout, stdout_redacted = redact_capture(stdout_original, sensitive, redact_paths)
    stderr, stderr_redacted = redact_capture(stderr_original, sensitive, redact_paths)
    stdout_path = raw_dir / "stdout.jsonl"
    stderr_path = raw_dir / "stderr.txt"
    metadata_path = raw_dir / "command.json"
    extracted_path = raw_dir / "extracted.json"
    write_bytes_exclusive(stdout_path, stdout)
    write_bytes_exclusive(stderr_path, stderr)
    metadata = command_metadata(command, started, ended, elapsed, exit_code, timed_out, slot, case)
    metadata.update({
        "prompt_sha256": sha256_bytes(prompt.encode("utf-8")),
        "prompt_bytes": len(prompt.encode("utf-8")),
        "stdout_original_sha256": sha256_bytes(stdout_original),
        "stdout_capture_sha256": sha256_bytes(stdout),
        "stderr_original_sha256": sha256_bytes(stderr_original),
        "stderr_capture_sha256": sha256_bytes(stderr),
        "stdout_redacted": stdout_redacted,
        "stderr_redacted": stderr_redacted,
    })
    if capture_context is not None:
        metadata["fixed_call_context"] = copy.deepcopy(dict(capture_context))
    write_json_exclusive(metadata_path, metadata)
    events, event_errors = event_objects(stdout.decode("utf-8", errors="replace"))
    extracted = extract_events(events)
    write_json_exclusive(extracted_path, {
        "schema_id": "pm.agent_packet_restrictions.extracted_call.v2",
        "event_parse_errors": event_errors,
        "assistant_final_text": extracted["assistant_text"],
        "event_identities": extracted["identities"],
        "requested_or_catalog_identities": extracted["requested_or_catalog_identities"],
        "effective_reasoning_attested": extracted["effective_reasoning_attested"],
        "effective_reasoning_values": extracted["effective_reasoning_values"],
        "internal_retry_attested": extracted["internal_retry_attested"],
        "internal_retry_counts": extracted["internal_retry_counts"],
        "tool_events": extracted["tool_events"],
    })
    return {
        "call_id": call_id,
        "slot_id": slot.get("slot_id"),
        "case_id": metadata["case_id"],
        "requested_route": slot.get("route"),
        "started_at_utc": started,
        "ended_at_utc": ended,
        "elapsed_seconds": round(elapsed, 6),
        "exit_code": exit_code,
        "timed_out": timed_out,
        "raw_artifacts": [artifact(stdout_path), artifact(stderr_path), artifact(metadata_path), artifact(extracted_path)],
        "event_parse_errors": event_errors,
        **extracted,
    }


def identity_terminal(call: Mapping[str, Any], slot: Mapping[str, Any]) -> tuple[str, list[str]]:
    errors: list[str] = []
    if call.get("timed_out"):
        return "TIMEOUT", ["controller deadline expired"]
    if call.get("exit_code") != 0:
        return "ROUTE_UNAVAILABLE", [f"opencode exited {call.get('exit_code')}"]
    if call.get("event_parse_errors"):
        return "CONTROL_PLANE_DEFECT", list(call["event_parse_errors"])
    if call.get("tool_events"):
        return "FORBIDDEN_ACTION", ["subject emitted a tool event"]
    identities = call.get("identities") or []
    expected = {"provider_id": slot.get("provider_id"), "model_id": slot.get("model_id")}
    unique = {(item.get("provider_id"), item.get("model_id")) for item in identities if isinstance(item, dict)}
    if not unique:
        errors.append("adapter exposed no response-effective provider/model attestation")
    elif unique != {(expected["provider_id"], expected["model_id"])}:
        errors.append(f"effective identities {sorted(unique)} do not exactly match requested identity")
    if call.get("effective_reasoning_attested") is not True or len(call.get("effective_reasoning_values") or []) != 1:
        errors.append("effective reasoning setting attestation is absent")
    if call.get("internal_retry_attested") is not True:
        errors.append("provider internal-retry attestation is absent")
    elif call.get("internal_retry_counts") != [0]:
        errors.append("provider internal-retry count is not exactly zero")
    return ("PASS", []) if not errors else ("IDENTITY_AMBIGUOUS", errors)


def render_route_canary(document: Mapping[str, Any], nonce: str) -> tuple[str, dict[str, Any]]:
    errors = validate_route_canary(document)
    if errors:
        raise ControllerError("; ".join(errors))
    expected = copy.deepcopy(document["expected_json_template"])
    expected["nonce"] = nonce
    expected_json = json.dumps(expected, separators=(",", ":"), ensure_ascii=False)
    prompt = str(document["prompt_template"]).replace("{EXPECTED_JSON}", expected_json)
    return prompt, expected


def launch_args(args: argparse.Namespace) -> tuple[Path, Path]:
    if not args.auth_file or not args.opencode_config:
        raise ControllerError("model-call commands require --auth-file and --opencode-config")
    auth = Path(args.auth_file).expanduser().resolve()
    config = Path(args.opencode_config).expanduser().resolve()
    if not auth.is_file() or not config.is_file():
        raise ControllerError("auth/config launch input is not a readable file")
    return auth, config


def require_model_launch_authorized() -> dict[str, Any]:
    if not MATRIX_STATUS.is_file():
        raise ControllerError("model launch status is missing; fail-closed authorization required")
    status = read_json(MATRIX_STATUS)
    if not isinstance(status, dict):
        raise ControllerError("model launch status must be a JSON object")
    status_errors = validate_matrix_status(status)
    if status_errors:
        raise ControllerError("; ".join(status_errors))
    allowed_states = {"authorized", "approved", "frozen_authorized"}
    state = status.get("authorized_matrix_status")
    authorized_ref = status.get("authorized_matrix_ref")
    matrix_path = authorized_matrix_path(status)
    if state not in allowed_states or matrix_path is None or not matrix_path.is_file():
        reason = "USER_MODEL_SELECTION_PENDING" if state == "user_model_selection_pending" else "MODEL_MATRIX_NOT_AUTHORIZED"
        raise ControllerError(f"{reason}: route-canary, pilot, and fleet are blocked before launch")
    return {
        "status_artifact": artifact(MATRIX_STATUS),
        "authorized_matrix_artifact": artifact(matrix_path),
        "authorized_matrix_ref": authorized_ref,
        "authorized_matrix_status": state,
    }


def route_canary(args: argparse.Namespace) -> int:
    run_id = new_run_id("route-canary")
    calls: list[dict[str, Any]] = []
    failures: list[str] = []
    prerequisites: dict[str, Any] = {}
    try:
        prerequisites["model_launch_authorization"] = require_model_launch_authorized()
        freeze_path, freeze = require_current_freeze()
        require_authorization_in_freeze(prerequisites["model_launch_authorization"], freeze)
        freeze_ref = freeze_reference(freeze_path, freeze)
        prerequisites["freeze"] = freeze_ref
        prerequisites["deterministic_canary"] = current_gate_reference("deterministic-canary", freeze_ref)
        auth, config = launch_args(args)
        status = read_json(MATRIX_STATUS)
        matrix_path = authorized_matrix_path(status)
        if matrix_path is None:
            raise ControllerError("MODEL_MATRIX_NOT_AUTHORIZED: authorized matrix reference is absent")
        matrix = read_json(matrix_path)
        if not isinstance(matrix, dict):
            raise ControllerError("authorized model matrix must be a JSON object")
        matrix_errors = validate_matrix(matrix)
        if matrix_errors:
            raise ControllerError("; ".join(matrix_errors))
        canary_doc = read_json(ROUTE_CANARY)
        for index, slot in enumerate(get_slots(matrix), 1):
            nonce = secrets.token_hex(16)
            prompt, expected = render_route_canary(canary_doc, nonce)
            call_id = f"{index:02d}-{slot['slot_id']}-route-canary"
            context = {"canary_id": canary_doc.get("canary_id"), "runtime_nonce": nonce, "expected_response": expected}
            call = run_subject(run_id, call_id, slot, prompt, args.timeout, auth, config, capture_context=context)
            terminal, call_errors = identity_terminal(call, slot)
            parsed, json_errors = strict_json(str(call.get("assistant_text", "")))
            if terminal == "PASS" and (json_errors or parsed != expected):
                terminal = "CONTROL_PLANE_DEFECT"
                call_errors.extend(json_errors or ["nonsemantic canary response did not echo the fixed nonce object exactly"])
            call["assistant_text_sha256"] = sha256_bytes(str(call.pop("assistant_text", "")).encode("utf-8"))
            call["terminal"] = terminal
            call["errors"] = call_errors
            call["pass"] = terminal == "PASS"
            call.update(context)
            calls.append(call)
            if terminal != "PASS":
                failures.append(f"{slot['slot_id']}:{terminal}")
    except ControllerError as exc:
        failures.append(str(exc))
    except Exception as exc:  # preserve a terminal canary receipt without leaking launch paths
        failures.append(f"CONTROL_PLANE_DEFECT:{type(exc).__name__}")
    receipt = make_receipt(
        "route-canary",
        run_id,
        "PASS" if not failures and len(calls) == 10 else "FAIL",
        prerequisites=prerequisites,
        freeze_binding=prerequisites.get("freeze"),
        exact_expected_call_count=10,
        actual_call_count=len(calls),
        no_replacements=True,
        controller_semantic_retries=0,
        calls=calls,
        failures=failures,
    )
    out = receipt_path("route-canary", run_id)
    write_json_exclusive(out, receipt)
    print(json.dumps({"status": receipt["status"], "receipt": relative(out), "failures": failures}))
    return 0 if receipt["status"] == "PASS" else 1


def build_subject_prompt(case: Mapping[str, Any], schema: Mapping[str, Any], profile: str | None) -> str:
    prompt = case.get("subject_prompt") or case.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        packet = case.get("packet") or case.get("subject_packet") or {
            key: value for key, value in case.items() if key not in {"oracle", "expected_response", "expected_terminal"}
        }
        prompt = "Evaluate this bounded packet using only its contents:\n" + json.dumps(packet, separators=(",", ":"), ensure_ascii=False)
    pieces = []
    if profile:
        pieces.append(profile)
    pieces.append(prompt)
    pieces.append("Return exactly one JSON object matching this schema and no other text:\n" + json.dumps(schema, separators=(",", ":"), ensure_ascii=False))
    return "\n\n".join(pieces)


def profile_text(cases_doc: Mapping[str, Any]) -> str | None:
    for key in ("fixed_profile", "packet_profile", "profile_text"):
        value = cases_doc.get(key)
        if isinstance(value, str):
            return value
        if isinstance(value, dict):
            return json.dumps(value, separators=(",", ":"), ensure_ascii=False)
    return None


def current_gate_reference(command: str, current_freeze: Mapping[str, Any]) -> dict[str, Any]:
    path, receipt = newest_passing_receipt(command)
    if receipt.get("freeze_binding") != dict(current_freeze):
        raise ControllerError(f"latest passing {command} receipt is not bound to the exact current freeze")
    return {
        "receipt": relative(path),
        "receipt_sha256": sha256_file(path),
        "run_id": receipt.get("run_id"),
        "freeze_digest": current_freeze.get("freeze_digest"),
    }


def execute_semantic_phase(args: argparse.Namespace, phase: str) -> int:
    run_id = new_run_id(phase)
    calls: list[dict[str, Any]] = []
    failures: list[str] = []
    prerequisites: dict[str, Any] = {}
    try:
        prerequisites["model_launch_authorization"] = require_model_launch_authorized()
        freeze_path, freeze = require_current_freeze()
        require_authorization_in_freeze(prerequisites["model_launch_authorization"], freeze)
        freeze_ref = freeze_reference(freeze_path, freeze)
        prerequisites["freeze"] = freeze_ref
        prerequisites["deterministic_canary"] = current_gate_reference("deterministic-canary", freeze_ref)
        prerequisites["route_canary"] = current_gate_reference("route-canary", freeze_ref)
        if phase == "fleet":
            pilot_path, pilot_receipt = newest_passing_receipt("pilot")
            if pilot_receipt.get("freeze_binding") != freeze_ref:
                raise ControllerError("latest passing pilot receipt is not bound to the exact current freeze")
            if pilot_receipt.get("control_plane_qualified") is not True:
                raise ControllerError("latest passing pilot is not control-plane qualified")
            prerequisites["pilot"] = {"receipt": relative(pilot_path), "sha256": sha256_file(pilot_path), "run_id": pilot_receipt.get("run_id")}
        auth, config = launch_args(args)
        status = read_json(MATRIX_STATUS)
        matrix_path = authorized_matrix_path(status)
        if matrix_path is None:
            raise ControllerError("MODEL_MATRIX_NOT_AUTHORIZED: authorized matrix reference is absent")
        matrix = read_json(matrix_path)
        if not isinstance(matrix, dict):
            raise ControllerError("authorized model matrix must be a JSON object")
        matrix_errors = validate_matrix(matrix)
        if matrix_errors:
            raise ControllerError("; ".join(matrix_errors))
        plan = read_json(PILOT_PLAN)
        cases_doc = read_json(CASES)
        schema = read_json(RESPONSE_SCHEMA)
        slots_by_id = {str(slot["slot_id"]): slot for slot in get_slots(matrix)}
        cases_by_id = {case_id(case): case for case in get_cases(cases_doc)}
        if phase == "pilot":
            slot_ids = plan["pilot_slots"]
            case_ids = plan["pilot_case_ids"]
            expected_count = plan["expected_call_count"]
        else:
            gate = plan["fleet_gate"]
            slot_ids = gate["slots"]
            case_ids = gate["semantic_cases"]
            expected_count = gate["expected_call_count"]
        if len(slot_ids) != len(set(slot_ids)) or len(case_ids) != len(set(case_ids)):
            raise ControllerError(f"{phase} plan contains duplicate slots/cases; replacements are forbidden")
        pairs = [(slot_id, semantic_id) for slot_id in slot_ids for semantic_id in case_ids]
        if len(pairs) != expected_count or len(set(pairs)) != expected_count:
            raise ControllerError(f"{phase} call plan is not the exact preregistered cross product")
        profile = profile_text(cases_doc)
        for index, (slot_id, semantic_id) in enumerate(pairs, 1):
            slot = slots_by_id[slot_id]
            case = cases_by_id[semantic_id]
            call_id = f"{index:03d}-{slot_id}-{semantic_id}"
            prompt = build_subject_prompt(case, schema, profile)
            call = run_subject(run_id, call_id, slot, prompt, args.timeout, auth, config, case)
            identity, identity_errors = identity_terminal(call, slot)
            if identity != "PASS":
                terminal = identity
                score = {"terminal": terminal, "pass": False, "control_plane_errors": identity_errors}
            else:
                score = classify_score(str(call.get("assistant_text", "")), case, schema, call.get("tool_events") or [])
                terminal = score["terminal"]
            text = str(call.pop("assistant_text", ""))
            call.update({
                "assistant_text_sha256": sha256_bytes(text.encode("utf-8")),
                "terminal": terminal,
                "pass": terminal == "PASS",
                "score": score,
            })
            calls.append(call)
            if terminal in CONTROL_PLANE_TERMINALS:
                failures.append(f"{call_id}:{terminal}")
        control_plane_qualified = len(calls) == expected_count and not failures
        status = "PASS" if control_plane_qualified else "FAIL"
    except (ControllerError, KeyError) as exc:
        failures.append(str(exc))
        expected_count = 0
        control_plane_qualified = False
        status = "FAIL"
    except Exception as exc:  # preserve all completed calls plus a fail-closed terminal receipt
        failures.append(f"CONTROL_PLANE_DEFECT:{type(exc).__name__}")
        expected_count = 0
        control_plane_qualified = False
        status = "FAIL"
    terminal_counts: dict[str, int] = {}
    for call in calls:
        terminal_counts[call["terminal"]] = terminal_counts.get(call["terminal"], 0) + 1
    receipt = make_receipt(
        phase,
        run_id,
        status,
        prerequisites=prerequisites,
        freeze_binding=(prerequisites.get("freeze")),
        expected_call_count=expected_count,
        actual_call_count=len(calls),
        controller_semantic_retries=0,
        subject_repair_calls=0,
        replacements=0,
        fresh_context_per_call=True,
        control_plane_qualified=control_plane_qualified,
        semantic_failures_preserved=True,
        terminal_counts=terminal_counts,
        calls=calls,
        failures=failures,
    )
    out = receipt_path(phase, run_id)
    write_json_exclusive(out, receipt)
    print(json.dumps({"status": status, "receipt": relative(out), "terminal_counts": terminal_counts, "control_plane_qualified": control_plane_qualified, "failures": failures}))
    return 0 if status == "PASS" else 1


def pilot(args: argparse.Namespace) -> int:
    return execute_semantic_phase(args, "pilot")


def fleet(args: argparse.Namespace) -> int:
    return execute_semantic_phase(args, "fleet")


def score(args: argparse.Namespace) -> int:
    run_id = new_run_id("score")
    failures: list[str] = []
    scored: list[dict[str, Any]] = []
    target = args.run_id
    freeze_ref: dict[str, Any] | None = None
    source_ref: dict[str, Any] | None = None
    try:
        if not SAFE_ID.fullmatch(target):
            raise ControllerError("--run-id is not a safe controller run identifier")
        freeze_path, freeze = require_current_freeze()
        freeze_ref = freeze_reference(freeze_path, freeze)
        source_path, source_receipt = source_run_receipt(target)
        if source_receipt.get("freeze_binding") != freeze_ref:
            raise ControllerError("source run receipt is not bound to the exact current freeze")
        source_ref = {
            "receipt": relative(source_path),
            "receipt_sha256": sha256_file(source_path),
            "run_id": source_receipt.get("run_id"),
            "status": source_receipt.get("status"),
            "freeze_digest": freeze_ref.get("freeze_digest"),
        }
        raw_root = LANE / "raw" / "runs" / target
        assert_lane_path(raw_root)
        if not raw_root.is_dir():
            raise ControllerError(f"raw run not found: {target}")
        cases_doc = read_json(CASES)
        cases_by_id = {case_id(case): case for case in get_cases(cases_doc)}
        schema = read_json(RESPONSE_SCHEMA)
        for call_dir in sorted(path for path in raw_root.iterdir() if path.is_dir()):
            metadata_path = call_dir / "command.json"
            stdout_path = call_dir / "stdout.jsonl"
            if not metadata_path.is_file() or not stdout_path.is_file():
                failures.append(f"{call_dir.name}: incomplete raw capture")
                continue
            metadata = read_json(metadata_path)
            events, parse_errors = event_objects(stdout_path.read_text(encoding="utf-8"))
            extracted = extract_events(events)
            cid = metadata.get("case_id")
            control_call = {
                **extracted,
                "timed_out": metadata.get("timed_out"),
                "exit_code": metadata.get("exit_code"),
                "event_parse_errors": parse_errors,
            }
            requested_slot = {
                "provider_id": metadata.get("requested_provider_id"),
                "model_id": metadata.get("requested_model_id"),
            }
            control_terminal, control_errors = identity_terminal(control_call, requested_slot)
            if control_terminal != "PASS":
                terminal = control_terminal
                details = {"control_plane_errors": control_errors, "event_parse_errors": parse_errors}
            elif cid == "ROUTE-CANARY":
                context = metadata.get("fixed_call_context") if isinstance(metadata.get("fixed_call_context"), dict) else {}
                expected = context.get("expected_response")
                parsed, response_errors = strict_json(extracted["assistant_text"])
                terminal = "PASS" if not response_errors and isinstance(expected, dict) and parsed == expected else "CONTROL_PLANE_DEFECT"
                details = {"event_parse_errors": parse_errors, "response_errors": response_errors, "expected_response_present": isinstance(expected, dict)}
            elif cid not in cases_by_id:
                terminal = "CONTROL_PLANE_DEFECT"
                details = {"error": "unknown semantic case_id in capture"}
            else:
                details = classify_score(extracted["assistant_text"], cases_by_id[cid], schema, extracted["tool_events"])
                terminal = details["terminal"]
            scored.append({
                "call_id": call_dir.name,
                "case_id": cid,
                "terminal": terminal,
                "pass": terminal == "PASS",
                "source_artifacts": [artifact(metadata_path), artifact(stdout_path)],
                "assistant_text_sha256": sha256_bytes(extracted["assistant_text"].encode("utf-8")),
                "details": details,
            })
            if terminal in CONTROL_PLANE_TERMINALS:
                failures.append(f"{call_dir.name}:{terminal}")
        if not scored:
            failures.append("no complete call captures found")
    except ControllerError as exc:
        failures.append(str(exc))
    except Exception as exc:
        failures.append(f"CONTROL_PLANE_DEFECT:{type(exc).__name__}")
    receipt = make_receipt(
        "score",
        run_id,
        "PASS" if not failures else "FAIL",
        target_run_id=target,
        freeze_binding=freeze_ref,
        source_run_receipt=source_ref,
        scored_call_count=len(scored),
        scores=scored,
        failures=failures,
    )
    out = receipt_path("score", run_id)
    write_json_exclusive(out, receipt)
    print(json.dumps({"status": receipt["status"], "receipt": relative(out), "failures": failures}))
    return 0 if not failures else 1


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("--version", action="version", version=CONTROLLER_VERSION)
    sub = result.add_subparsers(dest="command", required=True)
    p_verify = sub.add_parser("verify-freeze", help="validate and hash all frozen study inputs")
    p_verify.set_defaults(function=verify_freeze)
    p_deterministic = sub.add_parser("deterministic-canary", help="run the stdlib scorer canary and all deterministic fixtures")
    p_deterministic.set_defaults(function=deterministic_canary)
    for name, function, help_text in (
        ("route-canary", route_canary, "call all ten exact routes with one fixed nonsemantic nonce case"),
        ("pilot", pilot, "run the preregistered nine-call semantic pilot"),
        ("fleet", fleet, "run the preregistered sixty-call semantic fleet"),
    ):
        item = sub.add_parser(name, help=help_text)
        item.add_argument("--auth-file", required=True, help="read-only JSON/dotenv environment input; path is never persisted")
        item.add_argument("--opencode-config", required=True, help="read-only JSON/JSONC provider config; path/content are never persisted")
        item.add_argument("--timeout", type=float, default=180.0, help="per-call deadline in seconds (default: 180)")
        item.set_defaults(function=function)
    p_score = sub.add_parser("score", help="deterministically rescore a captured raw run without model calls")
    p_score.add_argument("--run-id", required=True, help="raw run ID below raw/runs")
    p_score.set_defaults(function=score)
    return result


def main(argv: Sequence[str] | None = None) -> int:
    args = parser().parse_args(argv)
    if hasattr(args, "timeout") and args.timeout <= 0:
        parser().error("--timeout must be positive")
    try:
        return int(args.function(args))
    except ControllerError as exc:
        print(json.dumps({"status": "FAIL", "error": str(exc)}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
