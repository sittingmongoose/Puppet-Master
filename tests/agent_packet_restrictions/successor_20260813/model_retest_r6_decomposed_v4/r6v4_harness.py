#!/usr/bin/env python3
"""Emit-only R6-v4 bounded weak-model decomposition overlay."""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
SUCCESSOR = HERE.parent
REPO = HERE.parents[3]
V2 = SUCCESSOR / "model_retest_r6_decomposed_v2"
V3 = SUCCESSOR / "model_retest_r6_decomposed_v3"
R5 = SUCCESSOR / "model_retest_r5_snapshot_v1"
CONTRACT_PATH = HERE / "contract.json"
HOLDOUTS_PATH = HERE / "counterfactual_holdouts.json"
V4_ID = "PW-R6-DECOMPOSED-20260814.4"
R5_ID = "PW-R4-CAUSAL-20260813.3"


def load_module(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot import frozen utility {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


v2 = load_module("r6v2_frozen_utility_for_v4", V2 / "r6v2_harness.py")
v3 = load_module("r6v3_frozen_utility_for_v4", V3 / "r6v3_harness.py")
base = v2.base
Invalid = base.Invalid
SubjectFail = base.SubjectFail
sha = base.sha
dump = base.dump
read_payload = base.read_payload


def contract() -> dict[str, Any]:
    obj = base.read_json(CONTRACT_PATH, "R6-v4 contract")
    if (obj.get("schema_id"), obj.get("protocol_id")) != (
        "pw-r6-decomposed-experiment-contract-v4",
        V4_ID,
    ):
        raise Invalid("R6-v4 contract identity mismatch")
    return obj


def lane_name(raw: str | None) -> str:
    if raw not in ("A", "B"):
        raise Invalid("lane must be A or B")
    return raw


def role_spec(raw: str | None) -> tuple[str, str, str]:
    if raw not in ("P", "C", "K"):
        raise Invalid("role-code must be P, C, or K")
    row = contract()["s60_unit"]["role_specs"][raw]
    return raw, row["role"], row["classification"]


def unique_rows(rows: list[dict[str, Any]], key: str, label: str) -> dict[str, dict[str, Any]]:
    if not isinstance(rows, list):
        raise Invalid(f"{label}: rows must be a list")
    out: dict[str, dict[str, Any]] = {}
    for row in rows:
        value = row.get(key)
        if not isinstance(value, str) or not value or value in out:
            raise Invalid(f"{label}: {key} missing or duplicated")
        out[value] = row
    return out


def ordered_findings(candidate_order: list[str], units: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if len(candidate_order) != len(set(candidate_order)) or any(not isinstance(x, str) or not x for x in candidate_order):
        raise Invalid("decision candidate order invalid")
    by_id = unique_rows(units, "decision_id", "decision units")
    if set(by_id) != set(candidate_order):
        raise Invalid("decision unit set does not equal candidate order")
    findings: list[dict[str, Any]] = []
    for decision_id in candidate_order:
        row = by_id[decision_id]
        verdict, finding = row.get("verdict"), row.get("finding")
        if verdict == "clean" and finding is None:
            continue
        if verdict == "finding" and isinstance(finding, dict) and finding.get("decision_id", decision_id) == decision_id:
            findings.append(finding)
            continue
        raise Invalid(f"decision unit {decision_id}: verdict/finding mismatch")
    return findings


def project_patch_rows(decisions: list[dict[str, Any]], findings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id = unique_rows(decisions, "id", "candidate decisions")
    finding_by = unique_rows(findings, "decision_id", "audit findings")
    if not set(finding_by).issubset(by_id):
        raise Invalid("finding references unknown decision")
    patch: list[dict[str, Any]] = []
    for index, decision in enumerate(decisions):
        finding = finding_by.get(decision["id"])
        if finding is None:
            continue
        observed = finding.get("observed_choice")
        expected = finding.get("expected_choice")
        if decision.get("choice") != observed or expected == observed:
            raise Invalid(f"finding {finding.get('finding_id')}: observed/expected value mismatch")
        path = f"/decisions/{index}/choice"
        patch.extend([
            {"op": "test", "path": path, "value": observed},
            {"op": "replace", "path": path, "value": expected},
        ])
    return patch


def new_edge_rows(base_edges: list[dict[str, Any]], candidate_edges: list[dict[str, Any]]) -> list[dict[str, Any]]:
    base_by = unique_rows(base_edges, "id", "base edges")
    candidate_by = unique_rows(candidate_edges, "id", "candidate edges")
    if not set(base_by).issubset(candidate_by):
        raise Invalid("candidate edge set removed a base edge")
    for edge_id, row in base_by.items():
        if candidate_by[edge_id] != row:
            raise Invalid(f"candidate edge set mutated base edge {edge_id}")
    return [row for row in candidate_edges if row["id"] not in base_by]


def ordered_unsupported(candidate_order: list[str], units: list[dict[str, Any]]) -> list[str]:
    if len(candidate_order) != len(set(candidate_order)):
        raise Invalid("specialist candidate order duplicated")
    by_id = unique_rows(units, "candidate_edge_id", "specialist units")
    if set(by_id) != set(candidate_order):
        raise Invalid("specialist unit set does not equal candidate order")
    out = []
    for edge_id in candidate_order:
        verdict = by_id[edge_id].get("verdict")
        if verdict not in ("supported", "unsupported"):
            raise Invalid(f"specialist unit {edge_id}: verdict invalid")
        if verdict == "unsupported":
            out.append(edge_id)
    return out


def run_holdouts() -> dict[str, Any]:
    rows = base.read_json(HOLDOUTS_PATH, "R6-v4 holdouts").get("cases")
    if not isinstance(rows, list) or not rows:
        raise Invalid("R6-v4 holdouts missing")
    passed: list[str] = []
    for case in rows:
        kind = case.get("kind")
        if kind == "decision_reduce":
            actual = [row["finding_id"] for row in ordered_findings(case["candidate_order"], case["units"])]
            expected = case["expected_finding_ids"]
        elif kind == "patch_project":
            actual = project_patch_rows(case["decisions"], case["findings"])
            expected = case["expected_patch"]
        elif kind == "new_edge_diff":
            actual = [row["id"] for row in new_edge_rows(case["base_edges"], case["candidate_edges"])]
            expected = case["expected_new_ids"]
        elif kind == "specialist_reduce":
            actual = ordered_unsupported(case["candidate_order"], case["units"])
            expected = case["expected_unsupported_ids"]
        else:
            raise Invalid(f"unknown R6-v4 holdout kind: {kind}")
        if actual != expected:
            raise Invalid(f"holdout {case.get('case_id')} failed: {actual!r}")
        passed.append(case["case_id"])
    return {"cases": len(passed), "passed_case_ids": passed}


def verify_preserved() -> int:
    rows = contract()["preserved_revision_bindings"]
    for row in rows:
        data = (REPO / row["path"]).read_bytes()
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"preserved R6-v3 binding drift: {row['path']}")
    return len(rows)


def s20_identity(lane: str, payload: bytes, obj: dict[str, Any]) -> None:
    if obj.get("protocol_id") != R5_ID or obj.get("stage") != "S20" + lane:
        raise Invalid(f"S20{lane}: identity mismatch")
    decisions = obj.get("decisions")
    if not isinstance(decisions, list) or len(decisions) != 18:
        raise Invalid(f"S20{lane}: expected 18 decisions")
    unique_rows(decisions, "id", f"S20{lane} decisions")
    if obj.get("base_artifact_sha256") is None or not payload:
        raise Invalid(f"S20{lane}: binding missing")


def decision_context(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> dict[str, Any]:
    s20_identity(lane, s20_payload, s20)
    decisions = unique_rows(s20["decisions"], "id", f"S20{lane} decisions")
    if decision_id not in decisions:
        raise Invalid(f"decision {decision_id}: absent from S20{lane}")
    _, capsule = base.topic_capsule(lane)
    items = unique_rows(capsule["decision_items"], "id", f"topic {lane} decision items")
    if decision_id not in items:
        raise Invalid(f"decision {decision_id}: absent from topic capsule")
    decision = decisions[decision_id]
    item = items[decision_id]
    refs = decision.get("source_record_ids")
    if not isinstance(refs, list) or not refs or refs != item.get("evidence_record_ids"):
        raise Invalid(f"decision {decision_id}: source refs differ from frozen question refs")
    record_by = unique_rows(capsule["records"], "source_record_id", f"topic {lane} records")
    if any(ref not in record_by for ref in refs):
        raise Invalid(f"decision {decision_id}: cited source record absent")
    return {
        "candidate_decision": decision,
        "question": item["question"],
        "options": item["options"],
        "source_records": [record_by[ref] for ref in refs],
    }


def decision_lineage(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> str:
    return sha(dump({
        "candidate_artifact_sha256": sha(s20_payload),
        "lane": lane,
        "decision_id": decision_id,
        "context": decision_context(lane, decision_id, s20_payload, s20),
    }))


def expected_s30_unit(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> dict[str, Any]:
    context = decision_context(lane, decision_id, s20_payload, s20)
    full = base.r5_module().expected_s30("S30" + lane, s20_payload, s20)
    matches = [row for row in full["findings"] if row["decision_id"] == decision_id]
    if len(matches) > 1:
        raise Invalid(f"decision {decision_id}: duplicate oracle findings")
    finding = matches[0] if matches else None
    return {
        "protocol_id": V4_ID,
        "stage": "S30_UNIT",
        "lane": lane,
        "decision_id": decision_id,
        "candidate_artifact_sha256": sha(s20_payload),
        "decision_lineage_sha256": decision_lineage(lane, decision_id, s20_payload, s20),
        "verdict": "finding" if finding else "clean",
        "finding": finding,
        "claim_boundary": "bounded_single_decision_audit_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def render_s30_unit(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> tuple[bytes, int]:
    context = dump(decision_context(lane, decision_id, s20_payload, s20))
    lineage = decision_lineage(lane, decision_id, s20_payload, s20)
    prompt = base.BASE_INSTRUCTIONS + f"""ROLE: bounded single-decision auditor
STAGE: S30_UNIT
Audit only the supplied candidate decision against only its exact cited frozen source record(s). Do not infer or discuss any other decision.
OUTPUT CONTRACT (exact key order):
protocol_id,stage,lane,decision_id,candidate_artifact_sha256,decision_lineage_sha256,verdict,finding,claim_boundary,external_audit_status,forbidden_action_violations.
verdict is clean or finding. If clean, finding is null. If finding, use exactly: finding_id,decision_id,classification,observed_choice,expected_choice,source_record_ids. finding_id is "F-"+decision_id. Allowed classification: authority_overclaim,evidence_strength_overclaim,wrong_order,scope_conflation,currentness_error,unsupported_choice.
Fixed protocol_id="{V4_ID}"; stage="S30_UNIT"; lane="{lane}"; decision_id="{decision_id}"; candidate_artifact_sha256="{sha(s20_payload)}"; decision_lineage_sha256="{lineage}"; claim_boundary="bounded_single_decision_audit_only"; external_audit_status="excluded"; forbidden_action_violations=[].
BEGIN_SINGLE_DECISION_CONTEXT
{context.decode()}
END_SINGLE_DECISION_CONTEXT
"""
    return prompt.encode(), len(context)


def reduce_s30(lane: str, s20_payload: bytes, s20: dict[str, Any], unit_set: dict[str, Any]) -> dict[str, Any]:
    s20_identity(lane, s20_payload, s20)
    if (unit_set.get("protocol_id"), unit_set.get("stage"), unit_set.get("lane")) != (V4_ID, "S30_UNIT_SET", lane):
        raise Invalid("S30 unit-set identity mismatch")
    decision_order = [row["id"] for row in s20["decisions"]]
    units = unit_set.get("units")
    if not isinstance(units, list):
        raise Invalid("S30 unit-set units missing")
    by_id = unique_rows(units, "decision_id", "S30 units")
    if set(by_id) != set(decision_order):
        raise Invalid("S30 unit-set does not cover exact decision set")
    for decision_id in decision_order:
        base.require_exact_obj(by_id[decision_id], expected_s30_unit(lane, decision_id, s20_payload, s20), f"S30 unit {decision_id}")
    findings = ordered_findings(decision_order, units)
    out = {
        "protocol_id": R5_ID,
        "stage": "S30" + lane,
        "candidate_artifact_sha256": sha(s20_payload),
        "checked_decision_ids": decision_order,
        "findings": findings,
        "clean_control_count": len(decision_order) - len(findings),
        "claim_boundary": "bounded_topic_audit_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }
    expected = base.r5_module().expected_s30("S30" + lane, s20_payload, s20)
    base.require_exact_obj(out, expected, f"S30{lane} reduced compatibility")
    return out


def project_s40(lane: str, s20_payload: bytes, s20: dict[str, Any], s30_payload: bytes, s30: dict[str, Any]) -> dict[str, Any]:
    s20_identity(lane, s20_payload, s20)
    expected_audit = base.r5_module().expected_s30("S30" + lane, s20_payload, s20)
    base.require_exact_obj(s30, expected_audit, f"S30{lane} input")
    patch = project_patch_rows(s20["decisions"], s30["findings"])
    finding_ids = [row["finding_id"] for row in s30["findings"]]
    finding_decisions = {row["decision_id"] for row in s30["findings"]}
    out = {
        "protocol_id": R5_ID,
        "stage": "S40" + lane,
        "candidate_artifact_sha256": sha(s20_payload),
        "audit_artifact_sha256": sha(s30_payload),
        "patch": patch,
        "addressed_finding_ids": finding_ids,
        "unchanged_decision_ids": [row["id"] for row in s20["decisions"] if row["id"] not in finding_decisions],
        "claim_boundary": "bounded_repair_proposal_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }
    expected = base.r5_module().expected_s40("S40" + lane, s20_payload, s20, s30_payload, s30)
    base.require_exact_obj(out, expected, f"S40{lane} deterministic compatibility")
    return out


def integration_chain(
    a_payload: bytes, a: dict[str, Any],
    b_payload: bytes, b: dict[str, Any],
    s50_payload: bytes, s50: dict[str, Any],
    s55_payload: bytes, s55: dict[str, Any],
) -> None:
    if a.get("stage") != "S45A" or b.get("stage") != "S45B":
        raise Invalid("specialist endpoint envelope stage mismatch")
    if s50.get("stage") != "S50" or s55.get("stage") != "S55":
        raise Invalid("specialist integration stage mismatch")
    if s50.get("topic_artifact_hashes") != {"topic_a": sha(a_payload), "topic_b": sha(b_payload)}:
        raise Invalid("S50 topic artifact hashes do not bind S45 inputs")
    expected_s55 = base.r5_module().expected_s55(s50_payload, s50)
    base.require_exact_obj(s55, expected_s55, "S55 deterministic input")
    if sha(s55_payload) == sha(s50_payload):
        raise Invalid("S55 must differ from S50")


def endpoint_decision(edge: dict[str, Any], a: dict[str, Any], b: dict[str, Any], endpoint: str) -> tuple[str, dict[str, Any], str]:
    decision_id = edge[endpoint]
    a_by = unique_rows(a["repaired_payload"]["decisions"], "id", "S45A decisions")
    b_by = unique_rows(b["repaired_payload"]["decisions"], "id", "S45B decisions")
    if decision_id in a_by and decision_id not in b_by:
        return "A", a_by[decision_id], decision_id
    if decision_id in b_by and decision_id not in a_by:
        return "B", b_by[decision_id], decision_id
    raise Invalid(f"edge endpoint {decision_id}: not uniquely bound to a topic")


def specialist_context(
    edge_id: str,
    a_payload: bytes, a: dict[str, Any],
    b_payload: bytes, b: dict[str, Any],
    s50_payload: bytes, s50: dict[str, Any],
    s55_payload: bytes, s55: dict[str, Any],
) -> dict[str, Any]:
    integration_chain(a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55)
    added = new_edge_rows(s50["cross_topic_edges"], s55["cross_topic_edges"])
    by_id = unique_rows(added, "id", "new S55 edges")
    if edge_id not in by_id:
        raise Invalid(f"specialist edge {edge_id}: not newly added after S50")
    edge = by_id[edge_id]
    endpoints = []
    source_records = []
    seen_sources: set[str] = set()
    for endpoint in ("from", "to"):
        lane, decision, decision_id = endpoint_decision(edge, a, b, endpoint)
        endpoints.append({"lane": lane, "decision": decision})
        _, capsule = base.topic_capsule(lane)
        record_by = unique_rows(capsule["records"], "source_record_id", f"topic {lane} records")
        for ref in decision["source_record_ids"]:
            if ref not in record_by:
                raise Invalid(f"endpoint {decision_id}: source record {ref} absent")
            if ref not in seen_sources:
                source_records.append(record_by[ref]); seen_sources.add(ref)
    integration = base.read_json(R5 / "integration_contract.json", "integration contract")
    contract_ids = [row["id"] for row in integration["cross_topic_edge_candidates"]]
    return {
        "candidate_edge": edge,
        "endpoint_decisions": endpoints,
        "source_records": source_records,
        "admission_facts": {
            "integration_contract_candidate_present": edge_id in contract_ids,
            "s50_semantically_admitted": edge_id in [row["id"] for row in s50["cross_topic_edges"]],
            "introduced_only_in_s55": True,
        },
    }


def specialist_lineage(
    edge_id: str,
    a_payload: bytes, a: dict[str, Any],
    b_payload: bytes, b: dict[str, Any],
    s50_payload: bytes, s50: dict[str, Any],
    s55_payload: bytes, s55: dict[str, Any],
) -> str:
    return sha(dump({
        "s45a_sha256": sha(a_payload),
        "s45b_sha256": sha(b_payload),
        "s50_sha256": sha(s50_payload),
        "s55_sha256": sha(s55_payload),
        "context": specialist_context(edge_id, a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55),
    }))


def expected_s60_unit(
    role_code: str, edge_id: str,
    a_payload: bytes, a: dict[str, Any],
    b_payload: bytes, b: dict[str, Any],
    s50_payload: bytes, s50: dict[str, Any],
    s55_payload: bytes, s55: dict[str, Any],
) -> dict[str, Any]:
    code, role, classification = role_spec(role_code)
    context = specialist_context(edge_id, a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55)
    refs = [row["source_record_id"] for row in context["source_records"]]
    facts = context["admission_facts"]
    verdict = "supported" if facts["integration_contract_candidate_present"] and facts["s50_semantically_admitted"] else "unsupported"
    return {
        "protocol_id": V4_ID,
        "stage": "S60_UNIT",
        "role": role,
        "candidate_edge_id": edge_id,
        "candidate_lineage_sha256": specialist_lineage(edge_id, a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55),
        "integration_candidate_sha256": sha(s55_payload),
        "verdict": verdict,
        "classification": classification,
        "source_record_ids": refs,
        "claim_boundary": "bounded_single_new_edge_specialist_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def render_s60_unit(
    role_code: str, edge_id: str,
    a_payload: bytes, a: dict[str, Any],
    b_payload: bytes, b: dict[str, Any],
    s50_payload: bytes, s50: dict[str, Any],
    s55_payload: bytes, s55: dict[str, Any],
) -> tuple[bytes, int]:
    code, role, classification = role_spec(role_code)
    context = dump(specialist_context(edge_id, a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55))
    lineage = specialist_lineage(edge_id, a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55)
    prompt = base.BASE_INSTRUCTIONS + f"""ROLE: bounded {role} specialist
STAGE: S60_UNIT
Judge only the one newly-added cross-topic edge using its endpoint decisions, exact cited frozen records, and typed admission facts. Do not audit topic-local edges or any sibling candidate.
OUTPUT CONTRACT (exact key order):
protocol_id,stage,role,candidate_edge_id,candidate_lineage_sha256,integration_candidate_sha256,verdict,classification,source_record_ids,claim_boundary,external_audit_status,forbidden_action_violations.
verdict is supported or unsupported. classification is exactly "{classification}". Copy the supplied source_record_ids in source-record order.
Fixed protocol_id="{V4_ID}"; stage="S60_UNIT"; role="{role}"; candidate_edge_id="{edge_id}"; candidate_lineage_sha256="{lineage}"; integration_candidate_sha256="{sha(s55_payload)}"; classification="{classification}"; claim_boundary="bounded_single_new_edge_specialist_only"; external_audit_status="excluded"; forbidden_action_violations=[].
BEGIN_SINGLE_NEW_EDGE_CONTEXT
{context.decode()}
END_SINGLE_NEW_EDGE_CONTEXT
"""
    return prompt.encode(), len(context)


def specialist_context_set(
    a_payload: bytes, a: dict[str, Any],
    b_payload: bytes, b: dict[str, Any],
    s50_payload: bytes, s50: dict[str, Any],
    s55_payload: bytes, s55: dict[str, Any],
) -> bytes:
    added = new_edge_rows(s50["cross_topic_edges"], s55["cross_topic_edges"])
    return dump({
        "integration_candidate_sha256": sha(s55_payload),
        "new_candidate_contexts": [
            specialist_context(row["id"], a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55)
            for row in added
        ],
    })


def reduce_s60(
    role_code: str,
    a_payload: bytes, a: dict[str, Any],
    b_payload: bytes, b: dict[str, Any],
    s50_payload: bytes, s50: dict[str, Any],
    s55_payload: bytes, s55: dict[str, Any],
    unit_set: dict[str, Any],
) -> dict[str, Any]:
    code, role, classification = role_spec(role_code)
    if (unit_set.get("protocol_id"), unit_set.get("stage"), unit_set.get("role_code")) != (V4_ID, "S60_UNIT_SET", code):
        raise Invalid("S60 unit-set identity mismatch")
    added = new_edge_rows(s50["cross_topic_edges"], s55["cross_topic_edges"])
    candidate_order = [row["id"] for row in added]
    units = unit_set.get("units")
    if not isinstance(units, list):
        raise Invalid("S60 unit-set units missing")
    by_id = unique_rows(units, "candidate_edge_id", "S60 units")
    if set(by_id) != set(candidate_order):
        raise Invalid("S60 unit-set does not cover exact new-edge set")
    for edge_id in candidate_order:
        expected = expected_s60_unit(code, edge_id, a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55)
        base.require_exact_obj(by_id[edge_id], expected, f"S60 {code} unit {edge_id}")
    unsupported = ordered_unsupported(candidate_order, units)
    findings = []
    for edge_id in unsupported:
        row = by_id[edge_id]
        findings.append({
            "finding_id": f"SP-{code}-{edge_id}",
            "edge_id": edge_id,
            "classification": classification,
            "verdict": "unsupported",
            "source_record_ids": row["source_record_ids"],
        })
    return {
        "protocol_id": R5_ID,
        "stage": "S60" + code,
        "role": role,
        "specialist_packet_sha256": sha(specialist_context_set(a_payload, a, b_payload, b, s50_payload, s50, s55_payload, s55)),
        "integration_candidate_sha256": sha(s55_payload),
        "checked_edge_ids": [row["id"] for row in s55["cross_topic_edges"]],
        "findings": findings,
        "false_positive_edge_ids": [],
        "claim_boundary": "bounded_specialist_audit_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def parse_inputs(values: list[str]) -> dict[str, tuple[bytes, dict[str, Any]]]:
    return base.parse_inputs(values)


def score_result(stage: str, actual_payload: bytes, actual: dict[str, Any], expected: dict[str, Any], identity: dict[str, Any]) -> tuple[dict[str, Any], int]:
    diffs = base.structural_diffs(expected, actual)
    exact = actual == expected and not diffs
    result = {
        "schema_id": "pw-r6-stage-score-v4",
        "protocol_id": V4_ID,
        "stage": stage,
        **identity,
        "verdict": "PASS" if exact else "FAIL",
        "exact": exact,
        "actual_payload_sha256": sha(actual_payload),
        "actual_payload_bytes": len(actual_payload),
        "expected_payload_sha256": sha(dump(expected)),
        "expected_payload_bytes": len(dump(expected)),
        "structural_diffs": diffs,
    }
    return result, 0 if exact else 1


def diagnostics(stage: str, packet: bytes, source_bytes: int, identity: dict[str, Any]) -> dict[str, Any]:
    prefix = packet.decode().split("BEGIN_", 1)[0]
    model_fields = contract()["s30_unit"]["model_owned_fields"] if stage == "S30_UNIT" else contract()["s60_unit"]["model_owned_fields"]
    deterministic = contract()["s30_unit"]["deterministic_fields"] if stage == "S30_UNIT" else contract()["s60_unit"]["deterministic_fields"]
    return {
        "stage": stage,
        **identity,
        "packet_payload_sha256": sha(packet),
        "packet_payload_bytes": len(packet),
        "admitted_source_bytes": source_bytes,
        "instruction_line_count": len([line for line in prefix.splitlines() if line.strip()]),
        "instruction_word_count": len(re.findall(r"\S+", prefix)),
        "semantic_objectives_per_call": 1,
        "model_owned_fields": model_fields,
        "deterministic_fields": deterministic,
        "diagnostic_only_not_model_budget_or_safety_profile": True,
    }


def preflight() -> dict[str, Any]:
    bindings = verify_preserved()
    holdouts = run_holdouts()
    s20bp, s20b = read_payload(V3 / "execution/slot-bravo/artifacts/S20B.json", "R6-v3 bravo S20B")
    decision_units = []
    decision_metrics = []
    for row in s20b["decisions"]:
        packet, source = render_s30_unit("B", row["id"], s20bp, s20b)
        decision_metrics.append(diagnostics("S30_UNIT", packet, source, {"lane": "B", "decision_id": row["id"]}))
        decision_units.append(expected_s30_unit("B", row["id"], s20bp, s20b))
    unit_set = {"protocol_id": V4_ID, "stage": "S30_UNIT_SET", "lane": "B", "units": decision_units}
    s30b = reduce_s30("B", s20bp, s20b, unit_set)
    s30bp = dump(s30b)
    s40b = project_s40("B", s20bp, s20b, s30bp, s30b)
    s20ap, s20a = read_payload(V3 / "execution/slot-bravo/artifacts/S20A.json", "R6-v3 bravo S20A")
    s30ap, s30a = read_payload(V3 / "execution/slot-bravo/captures/S30A.json", "R6-v3 bravo S30A")
    s40a = project_s40("A", s20ap, s20a, s30ap, s30a)
    a45p, a45 = read_payload(R5 / "runs/slot-alpha/artifacts/S45A.json", "R5 alpha S45A")
    b45p, b45 = read_payload(V3 / "execution/slot-alpha/artifacts/S45B.json", "R6-v3 alpha S45B")
    s50p, s50 = read_payload(V3 / "execution/slot-alpha/artifacts/S50.json", "R6-v3 alpha S50")
    s55p, s55 = read_payload(V3 / "execution/slot-alpha/artifacts/S55.json", "R6-v3 alpha S55")
    added = new_edge_rows(s50["cross_topic_edges"], s55["cross_topic_edges"])
    specialist_metrics = []
    specialist_reductions = []
    for code in ("P", "C", "K"):
        units = []
        for edge in added:
            packet, source = render_s60_unit(code, edge["id"], a45p, a45, b45p, b45, s50p, s50, s55p, s55)
            specialist_metrics.append(diagnostics("S60_UNIT", packet, source, {"role_code": code, "edge_id": edge["id"]}))
            units.append(expected_s60_unit(code, edge["id"], a45p, a45, b45p, b45, s50p, s50, s55p, s55))
        reduced = reduce_s60(code, a45p, a45, b45p, b45, s50p, s50, s55p, s55, {"protocol_id": V4_ID, "stage": "S60_UNIT_SET", "role_code": code, "units": units})
        specialist_reductions.append({"stage": reduced["stage"], "finding_ids": [row["finding_id"] for row in reduced["findings"]]})
    return {
        "schema_id": "pw-r6-v4-preflight-report-v1",
        "protocol_id": V4_ID,
        "status": "PASS",
        "subject_calls": 0,
        "preserved_bindings_checked": bindings,
        "counterfactual_holdouts": holdouts,
        "s30b_unit_count": len(decision_units),
        "s30b_reduced_exact": s30b == base.r5_module().expected_s30("S30B", s20bp, s20b),
        "s40a_deterministic_exact": s40a == base.r5_module().expected_s40("S40A", s20ap, s20a, s30ap, s30a),
        "s40b_deterministic_exact": s40b == base.r5_module().expected_s40("S40B", s20bp, s20b, s30bp, s30b),
        "new_specialist_candidate_count": len(added),
        "new_specialist_candidate_ids": [row["id"] for row in added],
        "specialist_reductions": specialist_reductions,
        "baseline_measurements": {
            "r6_v3_s30b_packet_payload_bytes": 77296,
            "r6_v3_s60_packet_payload_bytes": {"P": 128444, "C": 128460, "K": 128467},
        },
        "r6_v4_s30_measurements": decision_metrics,
        "r6_v4_s60_measurements": specialist_metrics,
        "nonclaims": contract()["nonclaims"],
    }


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("preflight")
    for name in ("render", "expected", "score", "transform", "measure"):
        q = sub.add_parser(name)
        q.add_argument("--stage", required=True)
        q.add_argument("--input", action="append", default=[])
        q.add_argument("--lane")
        q.add_argument("--decision-id")
        q.add_argument("--role-code")
        q.add_argument("--edge-id")
        if name == "score":
            q.add_argument("--capture", required=True)
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == "preflight":
            sys.stdout.buffer.write(dump(preflight()) + b"\n")
            return 0
        inputs = parse_inputs(args.input)
        if args.stage == "S30_UNIT":
            lane = lane_name(args.lane)
            if not args.decision_id:
                raise Invalid("S30_UNIT requires --decision-id")
            dep = "S20" + lane
            base.require_inputs(inputs, (dep,))
            payload, obj = inputs[dep]
            if args.command == "render":
                sys.stdout.buffer.write(render_s30_unit(lane, args.decision_id, payload, obj)[0]); return 0
            expected = expected_s30_unit(lane, args.decision_id, payload, obj)
            if args.command == "expected":
                sys.stdout.buffer.write(dump(expected) + b"\n"); return 0
            if args.command == "measure":
                packet, source = render_s30_unit(lane, args.decision_id, payload, obj)
                sys.stdout.buffer.write(dump(diagnostics("S30_UNIT", packet, source, {"lane": lane, "decision_id": args.decision_id})) + b"\n"); return 0
            if args.command == "score":
                actual_payload, actual = read_payload(Path(args.capture).resolve(), f"S30 unit {args.decision_id}")
                result, rc = score_result("S30_UNIT", actual_payload, actual, expected, {"lane": lane, "decision_id": args.decision_id})
                sys.stdout.buffer.write(dump(result) + b"\n"); return rc
        if args.command == "transform" and args.stage == "S30_REDUCE":
            lane = lane_name(args.lane); dep = "S20" + lane
            base.require_inputs(inputs, (dep, "S30_UNIT_SET"))
            s20, units = inputs[dep], inputs["S30_UNIT_SET"]
            sys.stdout.buffer.write(dump(reduce_s30(lane, s20[0], s20[1], units[1])) + b"\n"); return 0
        if args.command == "transform" and args.stage == "S40_PROJECT":
            lane = lane_name(args.lane); c, a = "S20" + lane, "S30" + lane
            base.require_inputs(inputs, (c, a))
            sys.stdout.buffer.write(dump(project_s40(lane, inputs[c][0], inputs[c][1], inputs[a][0], inputs[a][1])) + b"\n"); return 0
        if args.stage == "S60_UNIT":
            code, _, _ = role_spec(args.role_code)
            if not args.edge_id:
                raise Invalid("S60_UNIT requires --edge-id")
            base.require_inputs(inputs, ("S45A", "S45B", "S50", "S55"))
            a, b, s50, s55 = (inputs[name] for name in ("S45A", "S45B", "S50", "S55"))
            params = (code, args.edge_id, a[0], a[1], b[0], b[1], s50[0], s50[1], s55[0], s55[1])
            if args.command == "render":
                sys.stdout.buffer.write(render_s60_unit(*params)[0]); return 0
            expected = expected_s60_unit(*params)
            if args.command == "expected":
                sys.stdout.buffer.write(dump(expected) + b"\n"); return 0
            if args.command == "measure":
                packet, source = render_s60_unit(*params)
                sys.stdout.buffer.write(dump(diagnostics("S60_UNIT", packet, source, {"role_code": code, "edge_id": args.edge_id})) + b"\n"); return 0
            if args.command == "score":
                actual_payload, actual = read_payload(Path(args.capture).resolve(), f"S60 unit {code}/{args.edge_id}")
                result, rc = score_result("S60_UNIT", actual_payload, actual, expected, {"role_code": code, "edge_id": args.edge_id})
                sys.stdout.buffer.write(dump(result) + b"\n"); return rc
        if args.command == "transform" and args.stage == "S60_REDUCE":
            code, _, _ = role_spec(args.role_code)
            base.require_inputs(inputs, ("S45A", "S45B", "S50", "S55", "S60_UNIT_SET"))
            a, b, s50, s55, units = (inputs[name] for name in ("S45A", "S45B", "S50", "S55", "S60_UNIT_SET"))
            sys.stdout.buffer.write(dump(reduce_s60(code, a[0], a[1], b[0], b[1], s50[0], s50[1], s55[0], s55[1], units[1])) + b"\n"); return 0
        raise Invalid("unsupported command/stage combination")
    except SubjectFail as exc:
        sys.stdout.buffer.write(dump({"schema_id": "pw-r6-harness-error-v4", "protocol_id": V4_ID, "status": "FAIL", "error": str(exc)}) + b"\n")
        return 1
    except (Invalid, OSError, KeyError, TypeError, ValueError, IndexError) as exc:
        sys.stdout.buffer.write(dump({"schema_id": "pw-r6-harness-error-v4", "protocol_id": V4_ID, "status": "INVALID", "error": str(exc)}) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

