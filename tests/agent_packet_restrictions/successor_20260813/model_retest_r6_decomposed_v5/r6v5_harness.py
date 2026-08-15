#!/usr/bin/env python3
"""Emit-only R6-v5 semantic/direct-fact decomposition overlay."""
from __future__ import annotations

import argparse
import copy
import importlib.util
import json
import re
import sys
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
SUCCESSOR = HERE.parent
REPO = HERE.parents[3]
V4 = SUCCESSOR / "model_retest_r6_decomposed_v4"
V3 = SUCCESSOR / "model_retest_r6_decomposed_v3"
CONTRACT_PATH = HERE / "contract.json"
HOLDOUTS_PATH = HERE / "counterfactual_holdouts.json"
V5_ID = "PW-R6-DECOMPOSED-20260814.5"
R5_ID = "PW-R4-CAUSAL-20260813.3"


def load_v4() -> Any:
    spec = importlib.util.spec_from_file_location("r6v4_frozen_utility_for_v5", V4 / "r6v4_harness.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot import frozen R6-v4 utility")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


v4 = load_v4()
v2 = v4.v2
base = v4.base
Invalid = v4.Invalid
SubjectFail = v4.SubjectFail
sha = v4.sha
dump = v4.dump
read_payload = v4.read_payload


def contract() -> dict[str, Any]:
    obj = base.read_json(CONTRACT_PATH, "R6-v5 contract")
    if (obj.get("schema_id"), obj.get("protocol_id")) != (
        "pw-r6-decomposed-experiment-contract-v5",
        V5_ID,
    ):
        raise Invalid("R6-v5 contract identity mismatch")
    return obj


def verify_preserved() -> int:
    rows = contract()["preserved_revision_bindings"]
    for row in rows:
        data = (REPO / row["path"]).read_bytes()
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"preserved R6-v4 binding drift: {row['path']}")
    return len(rows)


def dependency_join(base_ids: list[str], extra_ids: list[str], available_ids: list[str]) -> list[str]:
    available = set(available_ids)
    if len(available) != len(available_ids) or any(not isinstance(x, str) or not x for x in available_ids):
        raise Invalid("available dependency IDs invalid")
    out: list[str] = []
    for value in base_ids + extra_ids:
        if not isinstance(value, str) or not value or value not in available:
            raise Invalid(f"dependency source unavailable: {value!r}")
        if value not in out:
            out.append(value)
    return out


def quoted_extract(excerpt: str, field: str) -> str:
    if not isinstance(excerpt, str) or not isinstance(field, str) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", field):
        raise Invalid("quoted-field extraction input invalid")
    matches = re.findall(r'"' + re.escape(field) + r'"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', excerpt)
    if len(matches) != 1:
        raise Invalid(f"quoted field {field}: expected one value, got {len(matches)}")
    return json.loads('"' + matches[0] + '"')


def semantic_match(expected: dict[str, Any], actual: dict[str, Any]) -> bool:
    if list(actual) != ["verdict", "expected_choice"]:
        return False
    if actual.get("verdict") not in ("clean", "finding"):
        return False
    if actual.get("verdict") == "clean" and actual.get("expected_choice") is not None:
        return False
    if actual.get("verdict") == "finding" and actual.get("expected_choice") is None:
        return False
    return actual == expected and type(actual.get("expected_choice")) is type(expected.get("expected_choice"))


def context_rule(decision_id: str) -> dict[str, Any] | None:
    rows = [row for row in contract()["context_dependencies"] if row["decision_id"] == decision_id]
    if len(rows) > 1:
        raise Invalid(f"decision {decision_id}: duplicate context rule")
    return rows[0] if rows else None


def direct_rule(decision_id: str) -> dict[str, Any] | None:
    rows = [row for row in contract()["direct_fact_rules"] if row["decision_id"] == decision_id]
    if len(rows) > 1:
        raise Invalid(f"decision {decision_id}: duplicate direct rule")
    return rows[0] if rows else None


def semantic_context(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> dict[str, Any]:
    if direct_rule(decision_id) is not None:
        raise Invalid(f"decision {decision_id}: direct fact is excluded from semantic subject calls")
    context = v4.decision_context(lane, decision_id, s20_payload, s20)
    _, capsule = base.topic_capsule(lane)
    record_by = v4.unique_rows(capsule["records"], "source_record_id", f"topic {lane} records")
    base_ids = [row["source_record_id"] for row in context["source_records"]]
    rule = context_rule(decision_id)
    extras = rule["additional_source_record_ids"] if rule else []
    joined = dependency_join(base_ids, extras, list(record_by))
    context = copy.deepcopy(context)
    context["source_records"] = [record_by[ref] for ref in joined]
    context["context_dependency_record_ids"] = extras
    return context


def semantic_lineage(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> str:
    return sha(dump({
        "candidate_artifact_sha256": sha(s20_payload),
        "lane": lane,
        "decision_id": decision_id,
        "context": semantic_context(lane, decision_id, s20_payload, s20),
    }))


def expected_semantic(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> dict[str, Any]:
    if direct_rule(decision_id) is not None:
        raise Invalid(f"decision {decision_id}: direct fact has no semantic expected response")
    old = v4.expected_s30_unit(lane, decision_id, s20_payload, s20)
    expected_choice = old["finding"]["expected_choice"] if old["finding"] is not None else None
    return {"verdict": old["verdict"], "expected_choice": expected_choice}


def render_semantic(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> tuple[bytes, int]:
    context = dump(semantic_context(lane, decision_id, s20_payload, s20))
    lineage = semantic_lineage(lane, decision_id, s20_payload, s20)
    prompt = base.BASE_INSTRUCTIONS + f"""ROLE: bounded single-decision semantic judge
STAGE: S30_SEMANTIC_UNIT
Judge only whether candidate_decision.choice is contradicted by the supplied exact frozen records. candidate_decision.id, authority, source_record_ids, hashes, and lineage are fixed controller data and must not be copied into the answer. Ignore candidate_decision.authority when deciding or naming the choice.
Return exactly two keys in this order: verdict,expected_choice.
verdict is clean or finding. If clean, expected_choice is null. If finding, expected_choice is exactly one supported replacement choice or exact typed direct value from the supplied evidence.
DECISION_ID={decision_id}
CANDIDATE_ARTIFACT_SHA256={sha(s20_payload)}
CONTEXT_LINEAGE_SHA256={lineage}
BEGIN_SINGLE_DECISION_SEMANTIC_CONTEXT
{context.decode()}
END_SINGLE_DECISION_SEMANTIC_CONTEXT
"""
    return prompt.encode(), len(context)


def direct_finding(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any]) -> dict[str, Any] | None:
    rule = direct_rule(decision_id)
    if rule is None:
        raise Invalid(f"decision {decision_id}: no direct rule")
    v4.s20_identity(lane, s20_payload, s20)
    decision_by = v4.unique_rows(s20["decisions"], "id", f"S20{lane} decisions")
    if decision_id not in decision_by:
        raise Invalid(f"direct decision {decision_id}: absent")
    _, capsule = base.topic_capsule(lane)
    record_by = v4.unique_rows(capsule["records"], "source_record_id", f"topic {lane} records")
    source_id = rule["source_record_id"]
    if source_id not in record_by:
        raise Invalid(f"direct decision {decision_id}: source record absent")
    expected = quoted_extract(record_by[source_id]["excerpt"], rule["quoted_field"])
    observed = decision_by[decision_id]["choice"]
    if type(observed) not in (str, bool) or type(expected) not in (str, bool):
        raise Invalid("direct fact values must be string or boolean")
    if observed == expected:
        return None
    return {
        "finding_id": "F-" + decision_id,
        "decision_id": decision_id,
        "classification": rule["classification"],
        "observed_choice": observed,
        "expected_choice": expected,
        "source_record_ids": [source_id],
    }


def canonical_semantic_finding(lane: str, decision_id: str, s20_payload: bytes, s20: dict[str, Any], semantic: dict[str, Any]) -> dict[str, Any] | None:
    expected = expected_semantic(lane, decision_id, s20_payload, s20)
    if not semantic_match(expected, semantic):
        raise SubjectFail(f"semantic decision {decision_id}: response differs from stage-specific meaning")
    if semantic["verdict"] == "clean":
        return None
    old = v4.expected_s30_unit(lane, decision_id, s20_payload, s20)
    finding = copy.deepcopy(old["finding"])
    if finding is None or finding["expected_choice"] != semantic["expected_choice"]:
        raise Invalid(f"semantic decision {decision_id}: canonical finding unavailable")
    return finding


def merge_holdout_findings(decision_order: list[str], semantic: dict[str, dict[str, Any]], direct: dict[str, dict[str, Any]]) -> list[str]:
    if len(decision_order) != len(set(decision_order)):
        raise Invalid("merge order duplicated")
    out = []
    for decision_id in decision_order:
        if decision_id in direct:
            out.append("F-" + decision_id)
        elif decision_id in semantic and semantic[decision_id].get("verdict") == "finding":
            out.append("F-" + decision_id)
    return out


def run_holdouts() -> dict[str, Any]:
    rows = base.read_json(HOLDOUTS_PATH, "R6-v5 holdouts").get("cases")
    if not isinstance(rows, list) or not rows:
        raise Invalid("R6-v5 holdouts missing")
    passed = []
    for case in rows:
        kind = case.get("kind")
        if kind == "dependency_join":
            actual = dependency_join(case["base_ids"], case["extra_ids"], case["available_ids"])
            expected = case["expected_ids"]
        elif kind == "quoted_extract":
            actual = quoted_extract(case["excerpt"], case["field"])
            expected = case["expected"]
        elif kind == "semantic_match":
            actual = semantic_match(case["expected"], case["actual"])
            expected = case["expected_result"]
        elif kind == "merge_findings":
            actual = merge_holdout_findings(case["decision_order"], case["semantic"], case["direct"])
            expected = case["expected_ids"]
        else:
            raise Invalid(f"unknown R6-v5 holdout kind: {kind}")
        if actual != expected:
            raise Invalid(f"holdout {case.get('case_id')} failed: {actual!r}")
        passed.append(case["case_id"])
    return {"cases": len(passed), "passed_case_ids": passed}


def reduce_s30(lane: str, s20_payload: bytes, s20: dict[str, Any], semantic_set: dict[str, Any]) -> dict[str, Any]:
    v4.s20_identity(lane, s20_payload, s20)
    if (semantic_set.get("protocol_id"), semantic_set.get("stage"), semantic_set.get("lane")) != (V5_ID, "S30_SEMANTIC_SET", lane):
        raise Invalid("semantic set identity mismatch")
    direct_ids = {row["decision_id"] for row in contract()["direct_fact_rules"]}
    decision_order = [row["id"] for row in s20["decisions"]]
    expected_semantic_ids = [decision_id for decision_id in decision_order if decision_id not in direct_ids]
    units = semantic_set.get("units")
    if not isinstance(units, list):
        raise Invalid("semantic set units missing")
    by_id = v4.unique_rows(units, "decision_id", "semantic set units")
    if set(by_id) != set(expected_semantic_ids):
        raise Invalid("semantic set does not cover exact non-direct decision set")
    findings = []
    for decision_id in decision_order:
        if decision_id in direct_ids:
            finding = direct_finding(lane, decision_id, s20_payload, s20)
        else:
            row = by_id[decision_id]
            if list(row) != ["decision_id", "verdict", "expected_choice", "evidence_binding"]:
                raise Invalid(f"semantic set {decision_id}: key order mismatch")
            if not isinstance(row["evidence_binding"], dict) or not row["evidence_binding"]:
                raise Invalid(f"semantic set {decision_id}: evidence binding missing")
            finding = canonical_semantic_finding(
                lane,
                decision_id,
                s20_payload,
                s20,
                {"verdict": row["verdict"], "expected_choice": row["expected_choice"]},
            )
        if finding is not None:
            findings.append(finding)
    return {
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


def project_s40(lane: str, s20_payload: bytes, s20: dict[str, Any], s30_payload: bytes, s30: dict[str, Any]) -> dict[str, Any]:
    v4.s20_identity(lane, s20_payload, s20)
    if s30.get("stage") != "S30" + lane or s30.get("candidate_artifact_sha256") != sha(s20_payload):
        raise Invalid(f"S30{lane}: candidate binding mismatch")
    decision_order = [row["id"] for row in s20["decisions"]]
    if s30.get("checked_decision_ids") != decision_order:
        raise Invalid(f"S30{lane}: checked decision order mismatch")
    findings = s30.get("findings")
    if not isinstance(findings, list):
        raise Invalid(f"S30{lane}: findings missing")
    patch = v4.project_patch_rows(s20["decisions"], findings)
    finding_ids = [row["finding_id"] for row in findings]
    finding_decisions = {row["decision_id"] for row in findings}
    return {
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


def apply_s45(
    lane: str,
    s20_payload: bytes, s20: dict[str, Any],
    s30_payload: bytes, s30: dict[str, Any],
    s40_payload: bytes, s40: dict[str, Any],
) -> dict[str, Any]:
    expected_s40 = project_s40(lane, s20_payload, s20, s30_payload, s30)
    base.require_exact_obj(s40, expected_s40, f"S40{lane} deterministic input")
    repaired = copy.deepcopy(s20)
    patch = s40["patch"]
    if len(patch) % 2:
        raise Invalid(f"S40{lane}: patch must be test/replace pairs")
    touched = set()
    for pos in range(0, len(patch), 2):
        test, replace = patch[pos], patch[pos + 1]
        match = re.fullmatch(r"/decisions/(0|[1-9][0-9]*)/choice", test.get("path", ""))
        if not match or replace.get("path") != test.get("path") or test.get("op") != "test" or replace.get("op") != "replace":
            raise Invalid(f"S40{lane}: invalid patch pair")
        index = int(match.group(1))
        if index in touched or index >= len(repaired["decisions"]):
            raise Invalid(f"S40{lane}: duplicate or out-of-range patch")
        touched.add(index)
        if repaired["decisions"][index]["choice"] != test.get("value") or replace.get("value") == test.get("value"):
            raise Invalid(f"S40{lane}: test-before-replace mismatch")
        repaired["decisions"][index]["choice"] = replace["value"]
    repaired_payload = dump(repaired)
    return {
        "protocol_id": R5_ID,
        "stage": "S45" + lane,
        "candidate_artifact_sha256": sha(s20_payload),
        "audit_artifact_sha256": sha(s30_payload),
        "patch_artifact_sha256": sha(s40_payload),
        "repaired_payload_sha256": sha(repaired_payload),
        "repaired_payload_bytes": len(repaired_payload),
        "repaired_payload": repaired,
        "closed_finding_ids": s40["addressed_finding_ids"],
        "claim_boundary": "deterministic_topic_patch_application",
        "external_audit_status": "excluded",
    }


def score_result(
    lane: str,
    decision_id: str,
    actual_payload: bytes,
    actual: dict[str, Any],
    expected: dict[str, Any],
) -> tuple[dict[str, Any], int]:
    exact = semantic_match(expected, actual)
    diffs = [] if exact else base.structural_diffs(expected, actual)
    result = {
        "schema_id": "pw-r6-stage-score-v5",
        "protocol_id": V5_ID,
        "stage": "S30_SEMANTIC_UNIT",
        "lane": lane,
        "decision_id": decision_id,
        "verdict": "PASS" if exact else "FAIL",
        "semantic_exact": exact,
        "actual_payload_sha256": sha(actual_payload),
        "actual_payload_bytes": len(actual_payload),
        "expected_payload_sha256": sha(dump(expected)),
        "expected_payload_bytes": len(dump(expected)),
        "structural_diffs": diffs,
    }
    return result, 0 if exact else 1


def diagnostics(lane: str, decision_id: str, packet: bytes, source_bytes: int) -> dict[str, Any]:
    prefix = packet.decode().split("BEGIN_", 1)[0]
    return {
        "stage": "S30_SEMANTIC_UNIT",
        "lane": lane,
        "decision_id": decision_id,
        "packet_payload_sha256": sha(packet),
        "packet_payload_bytes": len(packet),
        "admitted_source_bytes": source_bytes,
        "instruction_line_count": len([line for line in prefix.splitlines() if line.strip()]),
        "instruction_word_count": len(re.findall(r"\S+", prefix)),
        "semantic_objectives_per_call": 1,
        "model_owned_fields": ["verdict", "expected_choice"],
        "deterministic_fields": ["identity", "lineage", "observed choice", "classification", "source refs", "finding ID", "ordering", "patch path"],
        "diagnostic_only_not_model_budget_or_safety_profile": True,
    }


def preflight() -> dict[str, Any]:
    bindings = verify_preserved()
    holdouts = run_holdouts()
    s20bp, s20b = read_payload(V3 / "execution/slot-bravo/artifacts/S20B.json", "R6-v3 bravo S20B")
    repair_ids = contract()["repair_subject_decision_ids"]
    metrics = []
    for decision_id in repair_ids:
        packet, source = render_semantic("B", decision_id, s20bp, s20b)
        metrics.append(diagnostics("B", decision_id, packet, source))
    direct_ids = [row["decision_id"] for row in contract()["direct_fact_rules"]]
    semantic_units = []
    for decision in s20b["decisions"]:
        decision_id = decision["id"]
        if decision_id in direct_ids:
            continue
        expected = expected_semantic("B", decision_id, s20bp, s20b)
        semantic_units.append({
            "decision_id": decision_id,
            "verdict": expected["verdict"],
            "expected_choice": expected["expected_choice"],
            "evidence_binding": {"kind": "preflight_expected_only", "sha256": sha(dump(expected))},
        })
    semantic_set = {"protocol_id": V5_ID, "stage": "S30_SEMANTIC_SET", "lane": "B", "units": semantic_units}
    s30b = reduce_s30("B", s20bp, s20b, semantic_set)
    s30bp = dump(s30b)
    s40b = project_s40("B", s20bp, s20b, s30bp, s30b)
    s40bp = dump(s40b)
    s45b = apply_s45("B", s20bp, s20b, s30bp, s30b, s40bp, s40b)
    return {
        "schema_id": "pw-r6-v5-preflight-report-v1",
        "protocol_id": V5_ID,
        "status": "PASS",
        "subject_calls": 0,
        "preserved_bindings_checked": bindings,
        "counterfactual_holdouts": holdouts,
        "repair_subject_decision_ids": repair_ids,
        "direct_fact_decision_ids": direct_ids,
        "direct_findings": [direct_finding("B", decision_id, s20bp, s20b) for decision_id in direct_ids],
        "reduced_finding_ids": [row["finding_id"] for row in s30b["findings"]],
        "s40_patch_operation_count": len(s40b["patch"]),
        "s45_closed_finding_ids": s45b["closed_finding_ids"],
        "measurements": metrics,
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
        if name == "score":
            q.add_argument("--capture", required=True)
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == "preflight":
            sys.stdout.buffer.write(dump(preflight()) + b"\n"); return 0
        inputs = base.parse_inputs(args.input)
        if args.stage == "S30_SEMANTIC_UNIT":
            lane = v4.lane_name(args.lane)
            if not args.decision_id:
                raise Invalid("S30_SEMANTIC_UNIT requires --decision-id")
            dep = "S20" + lane
            base.require_inputs(inputs, (dep,))
            s20p, s20 = inputs[dep]
            if args.command == "render":
                sys.stdout.buffer.write(render_semantic(lane, args.decision_id, s20p, s20)[0]); return 0
            expected = expected_semantic(lane, args.decision_id, s20p, s20)
            if args.command == "expected":
                sys.stdout.buffer.write(dump(expected) + b"\n"); return 0
            if args.command == "measure":
                packet, source = render_semantic(lane, args.decision_id, s20p, s20)
                sys.stdout.buffer.write(dump(diagnostics(lane, args.decision_id, packet, source)) + b"\n"); return 0
            if args.command == "score":
                actual_payload, actual = read_payload(Path(args.capture).resolve(), f"semantic {args.decision_id}")
                result, rc = score_result(lane, args.decision_id, actual_payload, actual, expected)
                sys.stdout.buffer.write(dump(result) + b"\n"); return rc
        if args.command == "transform" and args.stage == "S30_REDUCE":
            lane = v4.lane_name(args.lane); dep = "S20" + lane
            base.require_inputs(inputs, (dep, "S30_SEMANTIC_SET"))
            s20, semantic = inputs[dep], inputs["S30_SEMANTIC_SET"]
            sys.stdout.buffer.write(dump(reduce_s30(lane, s20[0], s20[1], semantic[1])) + b"\n"); return 0
        if args.command == "transform" and args.stage == "S40_PROJECT":
            lane = v4.lane_name(args.lane); c, a = "S20" + lane, "S30" + lane
            base.require_inputs(inputs, (c, a))
            sys.stdout.buffer.write(dump(project_s40(lane, inputs[c][0], inputs[c][1], inputs[a][0], inputs[a][1])) + b"\n"); return 0
        if args.command == "transform" and args.stage == "S45_APPLY":
            lane = v4.lane_name(args.lane); c, a, p = "S20" + lane, "S30" + lane, "S40" + lane
            base.require_inputs(inputs, (c, a, p))
            sys.stdout.buffer.write(dump(apply_s45(lane, inputs[c][0], inputs[c][1], inputs[a][0], inputs[a][1], inputs[p][0], inputs[p][1])) + b"\n"); return 0
        raise Invalid("unsupported command/stage combination")
    except SubjectFail as exc:
        sys.stdout.buffer.write(dump({"schema_id": "pw-r6-harness-error-v5", "protocol_id": V5_ID, "status": "FAIL", "error": str(exc)}) + b"\n"); return 1
    except (Invalid, OSError, KeyError, TypeError, ValueError, IndexError) as exc:
        sys.stdout.buffer.write(dump({"schema_id": "pw-r6-harness-error-v5", "protocol_id": V5_ID, "status": "INVALID", "error": str(exc)}) + b"\n"); return 2


if __name__ == "__main__":
    raise SystemExit(main())

