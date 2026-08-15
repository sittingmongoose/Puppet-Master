#!/usr/bin/env python3
"""Emit-only R6-v3 per-edge micro-unit overlay."""
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
R5 = SUCCESSOR / "model_retest_r5_snapshot_v1"
CONTRACT_PATH = HERE / "contract.json"
HOLDOUTS_PATH = HERE / "counterfactual_holdouts.json"
V3_ID = "PW-R6-DECOMPOSED-20260814.3"
R5_ID = "PW-R4-CAUSAL-20260813.3"


def load_v2() -> Any:
    spec = importlib.util.spec_from_file_location("r6v2_frozen_utility", V2 / "r6v2_harness.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot import frozen R6-v2 utility")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


v2 = load_v2()
base = v2.base
Invalid = base.Invalid
SubjectFail = base.SubjectFail
sha = base.sha
dump = base.dump
read_payload = base.read_payload


def contract() -> dict[str, Any]:
    obj = base.read_json(CONTRACT_PATH, "R6-v3 contract")
    if (obj.get("schema_id"), obj.get("protocol_id")) != (
        "pw-r6-decomposed-experiment-contract-v3", V3_ID
    ):
        raise Invalid("R6-v3 contract identity mismatch")
    return obj


def edge_candidates() -> list[dict[str, Any]]:
    _, capsule = base.topic_capsule("B")
    rows = capsule.get("edge_candidates")
    if not isinstance(rows, list) or not rows:
        raise Invalid("topic B edge candidates missing")
    ids = [row.get("id") for row in rows]
    if any(not isinstance(eid, str) for eid in ids) or len(ids) != len(set(ids)):
        raise Invalid("topic B edge candidate IDs invalid")
    return rows


def edge_candidate(edge_id: str) -> dict[str, Any]:
    rows = [row for row in edge_candidates() if row["id"] == edge_id]
    if len(rows) != 1:
        raise Invalid(f"edge {edge_id}: candidate missing or duplicated")
    return rows[0]


def source_join(endpoint_rows: list[dict[str, Any]], available_records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    available = {row.get("source_record_id"): row for row in available_records}
    if None in available or len(available) != len(available_records):
        raise Invalid("available source-record IDs missing or duplicated")
    ordered_ids: list[str] = []
    for endpoint in endpoint_rows:
        refs = endpoint.get("source_record_ids")
        if not isinstance(refs, list) or not refs or any(not isinstance(ref, str) for ref in refs):
            raise Invalid("endpoint source-record refs missing or invalid")
        for ref in refs:
            if ref not in available:
                raise Invalid(f"endpoint source record unavailable: {ref}")
            if ref not in ordered_ids:
                ordered_ids.append(ref)
    return [available[ref] for ref in ordered_ids]


def reduce_micro_edges(candidate_order: list[str], units: list[dict[str, Any]]) -> list[str]:
    return base.reduce_edges(candidate_order, units)


def run_holdouts() -> dict[str, Any]:
    rows = base.read_json(HOLDOUTS_PATH, "R6-v3 holdouts").get("cases")
    if not isinstance(rows, list) or not rows:
        raise Invalid("R6-v3 holdouts missing")
    passed = []
    for case in rows:
        if case.get("kind") == "micro_edge_reduce":
            actual = reduce_micro_edges(case["candidate_order"], case["units"])
        elif case.get("kind") == "source_join":
            records = [{"source_record_id": rid} for rid in case["available_record_ids"]]
            actual = [row["source_record_id"] for row in source_join(case["endpoint_rows"], records)]
        else:
            raise Invalid(f"unknown R6-v3 holdout kind: {case.get('kind')}")
        if actual != case.get("expected"):
            raise Invalid(f"R6-v3 holdout {case.get('case_id')} failed: {actual!r}")
        passed.append(case["case_id"])
    return {"cases":len(passed),"passed_case_ids":passed}


def edge_context(edge_id: str, decision_payload: bytes, decisions: dict[str, Any]) -> dict[str, Any]:
    base.require_exact_obj(decisions, v2.expected_decisions(), "reused S10B_DECISIONS")
    edge = edge_candidate(edge_id)
    decision_by = {row["id"]: row for row in decisions["decisions"]}
    endpoints = [decision_by[edge["from"]], decision_by[edge["to"]]]
    _, capsule = base.topic_capsule("B")
    records = source_join(endpoints, capsule["records"])
    return {
        "edge_candidate": edge,
        "endpoint_decisions": endpoints,
        "source_records": records,
    }


def edge_lineage(edge_id: str, decision_payload: bytes, decisions: dict[str, Any]) -> str:
    return sha(dump({"source_decisions_sha256":sha(decision_payload),"context":edge_context(edge_id,decision_payload,decisions)}))


def expected_edge(edge_id: str, decision_payload: bytes, decisions: dict[str, Any]) -> dict[str, Any]:
    edge = edge_candidate(edge_id)
    supported = set(base.r5_key()["topic_b"]["supported_edge_ids"])
    return {
        "protocol_id": V3_ID,
        "stage": "S10B_EDGE",
        "edge_id": edge_id,
        "candidate_lineage_sha256": edge_lineage(edge_id,decision_payload,decisions),
        "source_decisions_sha256": sha(decision_payload),
        "verdict": "supported" if edge_id in supported else "unsupported",
        "source_decision_ids": [edge["from"],edge["to"]],
        "claim_boundary": "bounded_single_edge_semantics_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def render_edge(edge_id: str, decision_payload: bytes, decisions: dict[str, Any]) -> tuple[bytes, int]:
    context = dump(edge_context(edge_id,decision_payload,decisions))
    prompt = base.BASE_INSTRUCTIONS + f"""ROLE: bounded single-edge judge
STAGE: S10B_EDGE
Judge only the one supplied edge candidate against its two keyed endpoint decisions and their exact frozen source-record excerpts. Do not infer or discuss any other edge.
OUTPUT CONTRACT (exact key order):
protocol_id,stage,edge_id,candidate_lineage_sha256,source_decisions_sha256,verdict,source_decision_ids,claim_boundary,external_audit_status,forbidden_action_violations.
verdict is supported or unsupported. source_decision_ids are the supplied from/to decision IDs in order.
Fixed protocol_id=\"{V3_ID}\"; stage=\"S10B_EDGE\"; edge_id=\"{edge_id}\"; candidate_lineage_sha256=\"{edge_lineage(edge_id,decision_payload,decisions)}\"; source_decisions_sha256=\"{sha(decision_payload)}\"; claim_boundary=\"bounded_single_edge_semantics_only\"; external_audit_status=\"excluded\"; forbidden_action_violations=[].
BEGIN_SINGLE_EDGE_CONTEXT
{context.decode()}
END_SINGLE_EDGE_CONTEXT
"""
    payload = prompt.encode()
    other_ids = [row["id"] for row in edge_candidates() if row["id"] != edge_id]
    if any(other.encode() in payload for other in other_ids):
        raise Invalid(f"edge {edge_id}: another edge candidate leaked into packet")
    return payload, len(context)


def expected_edge_set(decision_payload: bytes, decisions: dict[str, Any]) -> dict[str, Any]:
    return {
        "protocol_id": V3_ID,
        "stage": "S10B_EDGE_SET",
        "edge_units": [expected_edge(row["id"],decision_payload,decisions) for row in edge_candidates()],
    }


def validate_edge_set(edge_set: dict[str, Any], decision_payload: bytes, decisions: dict[str, Any]) -> None:
    base.require_exact_obj(edge_set, expected_edge_set(decision_payload,decisions), "S10B_EDGE_SET")


def reduce_s10b(decision_payload: bytes, decisions: dict[str, Any], tension: dict[str, Any], edge_set: dict[str, Any]) -> dict[str, Any]:
    base.require_exact_obj(decisions, v2.expected_decisions(), "reused S10B_DECISIONS")
    semantic_ids = v2.contract()["s10b"]["semantic_subject_candidate_ids"]
    if len(semantic_ids) != 1:
        raise Invalid("frozen R6-v2 semantic candidate set drift")
    base.require_exact_obj(tension, v2.expected_tension(semantic_ids[0]), "reused S10B_TENSION")
    validate_edge_set(edge_set,decision_payload,decisions)
    units = edge_set["edge_units"]
    selected_edges = reduce_micro_edges([row["id"] for row in edge_candidates()],units)
    source_payload, source = base.topic_capsule("B")
    selected_tensions = semantic_ids if tension["verdict"] == "supported_unresolved_tension" else []
    return {
        "protocol_id": R5_ID,
        "stage": "S10B",
        "topic_id": source["topic_id"],
        "source_capsule_sha256": sha(source_payload),
        "source_capsule_bytes": len(source_payload),
        "decisions": decisions["decisions"],
        "supported_edge_ids": selected_edges,
        "selected_tension_ids": selected_tensions,
        "claim_boundary": "bounded_source_synthesis_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def parse_inputs(values: list[str]) -> dict[str, tuple[bytes, dict[str, Any]]]:
    return base.parse_inputs(values)


def verify_preserved() -> int:
    for row in contract()["preserved_revision_bindings"]:
        data=(REPO/row["path"]).read_bytes()
        if (sha(data),len(data)) != (row["sha256"],row["bytes"]):
            raise Invalid(f"preserved R6-v2 binding drift: {row['path']}")
    expected=contract()["reused_passing_payloads"]
    for slot in ("slot-alpha","slot-bravo","slot-charlie"):
        for stage in ("S10B_DECISIONS","S10B_TENSION"):
            path=V2/"execution"/slot/"captures"/f"{stage}.json"
            storage=path.read_bytes();payload=storage[:-1] if storage.endswith(b"\n") else storage
            row=expected[stage]
            if (sha(payload),len(payload),sha(storage),len(storage)) != (row["sha256"],row["bytes"],row["storage_sha256"],row["storage_bytes"]):
                raise Invalid(f"reused passing payload drift: {slot}/{stage}")
            obj=base.load_json_bytes(payload,f"{slot}/{stage}",canonical=True)
            exp=v2.expected_decisions() if stage=="S10B_DECISIONS" else v2.expected_tension(v2.contract()["s10b"]["semantic_subject_candidate_ids"][0])
            base.require_exact_obj(obj,exp,f"{slot}/{stage}")
    return len(contract()["preserved_revision_bindings"])+6


def diagnostics(edge_id: str, packet: bytes, source_bytes: int) -> dict[str, Any]:
    prefix=packet.decode().split("BEGIN_",1)[0]
    return {"edge_id":edge_id,"packet_payload_sha256":sha(packet),"packet_payload_bytes":len(packet),"admitted_source_bytes":source_bytes,"instruction_line_count":len([line for line in prefix.splitlines() if line.strip()]),"instruction_word_count":len(re.findall(r"\S+",prefix)),"semantic_objectives_per_call":1,"model_owned_fields":contract()["edge_micro_unit"]["model_owned_fields"],"deterministic_fields":contract()["edge_micro_unit"]["deterministic_fields"],"diagnostic_only_not_model_budget_or_safety_profile":True}


def preflight() -> dict[str, Any]:
    bindings=verify_preserved(); inherited=v2.run_holdouts(); holdouts=run_holdouts()
    decision_path=V2/"execution/slot-alpha/captures/S10B_DECISIONS.json"; tension_path=V2/"execution/slot-alpha/captures/S10B_TENSION.json"
    dp,d=read_payload(decision_path,"reused decisions");_,t=read_payload(tension_path,"reused tension")
    packets=[]; units=[]
    for row in edge_candidates():
        packet,source=render_edge(row["id"],dp,d);packets.append(diagnostics(row["id"],packet,source));units.append(expected_edge(row["id"],dp,d))
    edge_set={"protocol_id":V3_ID,"stage":"S10B_EDGE_SET","edge_units":units}
    s10=reduce_s10b(dp,d,t,edge_set);s10p=dump(s10);s20=v2.transform_s20b(s10p,s10)
    if s10["supported_edge_ids"] != base.r5_key()["topic_b"]["supported_edge_ids"]:
        raise Invalid("R6-v3 edge reducer does not reproduce the source-scoped supported set")
    return {"schema_id":"pw-r6-v3-preflight-report-v1","protocol_id":V3_ID,"status":"PASS","subject_calls":0,"immutable_and_reused_bindings_checked":bindings,"inherited_counterfactual_holdouts":inherited,"new_counterfactual_holdouts":holdouts,"edge_candidate_count":len(units),"one_candidate_per_subject_packet":True,"reused_passing_predecessor_cells":6,"supported_edge_projection":s10["supported_edge_ids"],"selected_tension_projection":s10["selected_tension_ids"],"s20b_transform_valid":s20["stage"]=="S20B","measurements":packets,"nonclaims":contract()["nonclaims"]}


def parser() -> argparse.ArgumentParser:
    p=argparse.ArgumentParser();sub=p.add_subparsers(dest="command",required=True);sub.add_parser("preflight")
    for name in ("render","expected","score","transform"):
        q=sub.add_parser(name);q.add_argument("--stage",required=True);q.add_argument("--input",action="append",default=[]);q.add_argument("--edge-id")
        if name=="score":q.add_argument("--capture",required=True)
    return p


def main() -> int:
    args=parser().parse_args()
    try:
        if args.command=="preflight":sys.stdout.buffer.write(dump(preflight())+b"\n");return 0
        inputs=parse_inputs(args.input)
        if args.stage=="S10B_EDGE":
            if not args.edge_id:raise Invalid("S10B_EDGE requires --edge-id")
            base.require_inputs(inputs,("S10B_DECISIONS",));dp,d=inputs["S10B_DECISIONS"]
            if args.command=="render":sys.stdout.buffer.write(render_edge(args.edge_id,dp,d)[0]);return 0
            if args.command=="expected":sys.stdout.buffer.write(dump(expected_edge(args.edge_id,dp,d))+b"\n");return 0
            if args.command=="score":
                ap,a=read_payload(Path(args.capture).resolve(),f"{args.edge_id} capture");expected=expected_edge(args.edge_id,dp,d);diffs=base.structural_diffs(expected,a);exact=a==expected and not diffs
                result={"schema_id":"pw-r6-stage-score-v3","protocol_id":V3_ID,"stage":"S10B_EDGE","edge_id":args.edge_id,"verdict":"PASS" if exact else "FAIL","exact":exact,"actual_payload_sha256":sha(ap),"actual_payload_bytes":len(ap),"expected_payload_sha256":sha(dump(expected)),"expected_payload_bytes":len(dump(expected)),"structural_diffs":diffs}
                sys.stdout.buffer.write(dump(result)+b"\n");return 0 if exact else 1
        if args.command=="transform" and args.stage=="S10B_REDUCE":
            base.require_inputs(inputs,("S10B_DECISIONS","S10B_TENSION","S10B_EDGE_SET"));d,t,e=inputs["S10B_DECISIONS"],inputs["S10B_TENSION"],inputs["S10B_EDGE_SET"]
            sys.stdout.buffer.write(dump(reduce_s10b(d[0],d[1],t[1],e[1]))+b"\n");return 0
        if args.command=="transform" and args.stage=="S20B":
            base.require_inputs(inputs,("S10B",));sys.stdout.buffer.write(dump(v2.transform_s20b(*inputs["S10B"]))+b"\n");return 0
        raise Invalid("unsupported command/stage combination")
    except SubjectFail as exc:
        sys.stdout.buffer.write(dump({"schema_id":"pw-r6-harness-error-v3","protocol_id":V3_ID,"status":"FAIL","error":str(exc)})+b"\n");return 1
    except (Invalid,OSError,KeyError,TypeError,ValueError,IndexError) as exc:
        sys.stdout.buffer.write(dump({"schema_id":"pw-r6-harness-error-v3","protocol_id":V3_ID,"status":"INVALID","error":str(exc)})+b"\n");return 2


if __name__=="__main__":raise SystemExit(main())
