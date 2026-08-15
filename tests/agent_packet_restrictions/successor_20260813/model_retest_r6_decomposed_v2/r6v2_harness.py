#!/usr/bin/env python3
"""Emit-only R6-v2 overlay over the frozen R5 fixture and R6-v1 utilities."""
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
V1 = SUCCESSOR / "model_retest_r6_decomposed_v1"
R5 = SUCCESSOR / "model_retest_r5_snapshot_v1"
CONTRACT_PATH = HERE / "contract.json"
HOLDOUTS_PATH = HERE / "counterfactual_holdouts.json"
V2_ID = "PW-R6-DECOMPOSED-20260814.2"
R5_ID = "PW-R4-CAUSAL-20260813.3"


def load_base() -> Any:
    spec = importlib.util.spec_from_file_location("r6v1_bound_utility", V1 / "r6_harness.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot import frozen R6-v1 utility")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.HERE = HERE
    module.CONTRACT_PATH = CONTRACT_PATH
    module.HOLDOUTS_PATH = HOLDOUTS_PATH
    module.R6_ID = V2_ID
    return module


base = load_base()
Invalid = base.Invalid
SubjectFail = base.SubjectFail
sha = base.sha
dump = base.dump
load_json_bytes = base.load_json_bytes
read_payload = base.read_payload


def contract() -> dict[str, Any]:
    obj = base.read_json(CONTRACT_PATH, "R6-v2 contract")
    if (obj.get("schema_id"), obj.get("protocol_id")) != (
        "pw-r6-decomposed-experiment-contract-v2", V2_ID
    ):
        raise Invalid("R6-v2 contract identity mismatch")
    return obj


def route_candidates(facts: dict[str, bool], candidates: list[dict[str, Any]]) -> dict[str, str]:
    if any(type(value) is not bool for value in facts.values()):
        raise Invalid("candidate routing facts must be booleans")
    seen_ids: set[str] = set(); seen_orders: set[int] = set(); ordered = []
    for row in candidates:
        cid, order = row.get("id"), row.get("order")
        required, resolves = row.get("requires"), row.get("resolves")
        if not isinstance(cid, str) or not cid or cid in seen_ids:
            raise Invalid("candidate routing ID missing or duplicated")
        if type(order) is not int or order < 0 or order in seen_orders:
            raise Invalid("candidate routing order missing or duplicated")
        if not isinstance(required, list) or not required or any(fid not in facts for fid in required):
            raise Invalid(f"candidate routing {cid}: required facts invalid")
        if not isinstance(resolves, list) or any(fid not in facts for fid in resolves):
            raise Invalid(f"candidate routing {cid}: resolution facts invalid")
        seen_ids.add(cid); seen_orders.add(order); ordered.append((order, cid, required, resolves))
    result: dict[str, str] = {}
    for _, cid, required, resolves in sorted(ordered):
        if not all(facts[fid] for fid in required):
            result[cid] = "unsupported_excluded"
        elif any(facts[fid] for fid in resolves):
            result[cid] = "resolved_deterministically"
        else:
            result[cid] = "semantic_subject"
    return result


def run_holdouts() -> dict[str, Any]:
    rows = base.read_json(HOLDOUTS_PATH, "R6-v2 holdouts").get("cases")
    if not isinstance(rows, list) or not rows:
        raise Invalid("R6-v2 holdouts missing")
    passed = []
    for case in rows:
        kind = case.get("kind")
        if kind == "candidate_route":
            actual = route_candidates(case["facts"], case["candidates"])
        elif kind == "edge_reduce":
            actual = base.reduce_edges(case["candidate_order"], case["verdicts"])
        elif kind == "authority_projection":
            actual = base.project_authority(case["decisions"], case["spec"])
        else:
            raise Invalid(f"unknown R6-v2 holdout kind: {kind}")
        if actual != case.get("expected"):
            raise Invalid(f"holdout {case.get('case_id')} failed: {actual!r}")
        passed.append(case["case_id"])
    return {"cases": len(passed), "passed_case_ids": passed}


def actual_facts() -> dict[str, bool]:
    decisions = {row["id"]: row["choice"] for row in base.r5_decisions("B")}
    facts = {}
    for row in contract()["s10b"]["candidate_facts"]:
        did = row["decision_id"]
        facts[row["fact_id"]] = decisions[did] in row["accepted_choices"]
    return facts


def actual_routes() -> dict[str, str]:
    rows = contract()["s10b"]["candidate_routing"]
    candidates = [{"id": row["candidate_id"], "order": row["source_order"], "requires": row["required_true_fact_ids"], "resolves": row["resolution_fact_ids"]} for row in rows]
    routed = route_candidates(actual_facts(), candidates)
    declared = {row["candidate_id"]: row["expected_route"] for row in sorted(rows, key=lambda item: item["source_order"])}
    if routed != declared:
        raise Invalid("R6-v2 declared candidate routes differ from generic derivation")
    return routed


def decision_capsule_b() -> tuple[bytes, dict[str, Any]]:
    _, original = base.topic_capsule("B")
    derived = copy.deepcopy(original)
    edges = derived.pop("edge_candidates", None)
    tensions = derived.pop("tension_candidates", None)
    if not isinstance(edges, list) or not isinstance(tensions, list):
        raise Invalid("topic B decision capsule source candidates missing")
    output = derived.get("output_contract")
    if not isinstance(output, dict):
        raise Invalid("topic B decision output contract missing")
    if output.pop("supported_edge_ids", None) is None or output.pop("selected_tension_ids", None) is None:
        raise Invalid("topic B decision output contract did not contain both removed objectives")
    derived["selection_rule"] = "Choose only the 18 decision values from cited evidence. Edge and tension judgments are separate bounded stages."
    payload = dump(derived)
    candidate_ids = [row["id"] for row in edges] + [row["id"] for row in tensions]
    if any(cid.encode() in payload for cid in candidate_ids):
        raise Invalid("decision capsule retained an edge or tension candidate")
    return payload, derived


def expected_decisions() -> dict[str, Any]:
    payload, capsule = decision_capsule_b()
    return {
        "protocol_id": V2_ID,
        "stage": "S10B_DECISIONS",
        "topic_id": capsule["topic_id"],
        "source_capsule_sha256": sha(payload),
        "source_capsule_bytes": len(payload),
        "decisions": base.r5_decisions("B"),
        "claim_boundary": "bounded_source_decision_synthesis_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def render_decisions() -> tuple[bytes, int]:
    payload, _ = decision_capsule_b()
    prompt = base.BASE_INSTRUCTIONS + f"""ROLE: bounded topic decision synthesizer
STAGE: S10B_DECISIONS
Decide only the 18 keyed decisions from the frozen capsule. Edge selection and tension classification are intentionally absent. Resolve stale prose against explicit frozen fields; lineage state reports snapshot planning history only.
OUTPUT CONTRACT (exact key order):
protocol_id,stage,topic_id,source_capsule_sha256,source_capsule_bytes,decisions,claim_boundary,external_audit_status,forbidden_action_violations.
Each decision: id,choice,authority,source_record_ids. Copy id/order/source IDs from evidence_record_ids; choose one option; authority equals cited record authority.
Fixed protocol_id=\"{V2_ID}\"; stage=\"S10B_DECISIONS\"; claim_boundary=\"bounded_source_decision_synthesis_only\"; external_audit_status=\"excluded\"; forbidden_action_violations=[].
CAPSULE_SHA256={sha(payload)}
CAPSULE_BYTES={len(payload)}
BEGIN_DECISION_CAPSULE_RAW
{payload.decode('utf-8')}
END_DECISION_CAPSULE_RAW
"""
    return prompt.encode(), len(payload)


def edge_context(decision_payload: bytes, decisions_obj: dict[str, Any]) -> dict[str, Any]:
    base.require_exact_obj(decisions_obj, expected_decisions(), "S10B_DECISIONS")
    _, capsule = base.topic_capsule("B")
    candidates = capsule["edge_candidates"]
    decision_map = {row["id"]: row for row in decisions_obj["decisions"]}
    endpoint_ids = []
    for edge in candidates:
        endpoint_ids.extend([edge["from"], edge["to"]])
    unique = []
    for did in endpoint_ids:
        if did not in unique: unique.append(did)
    return {
        "source_decisions_sha256": sha(decision_payload),
        "endpoint_decisions": [decision_map[did] for did in unique],
        "edge_candidates": candidates,
    }


def expected_edges(decision_payload: bytes, decisions_obj: dict[str, Any]) -> dict[str, Any]:
    context = edge_context(decision_payload, decisions_obj)
    supported = set(base.r5_key()["topic_b"]["supported_edge_ids"])
    verdicts = [{"edge_id": edge["id"], "verdict": "supported" if edge["id"] in supported else "unsupported", "source_decision_ids": [edge["from"], edge["to"]]} for edge in context["edge_candidates"]]
    return {
        "protocol_id": V2_ID,
        "stage": "S10B_EDGES",
        "source_decisions_sha256": sha(decision_payload),
        "checked_edge_ids": [edge["id"] for edge in context["edge_candidates"]],
        "edge_verdicts": verdicts,
        "claim_boundary": "bounded_topic_edge_semantics_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def render_edges(decision_payload: bytes, decisions_obj: dict[str, Any]) -> tuple[bytes, int]:
    context = dump(edge_context(decision_payload, decisions_obj))
    prompt = base.BASE_INSTRUCTIONS + f"""ROLE: bounded topic edge judge
STAGE: S10B_EDGES
Judge only the supplied topic edge candidates against compact keyed endpoint decisions. Decision synthesis and tension classification are not part of this call.
OUTPUT CONTRACT (exact key order):
protocol_id,stage,source_decisions_sha256,checked_edge_ids,edge_verdicts,claim_boundary,external_audit_status,forbidden_action_violations.
Preserve candidate order. Each edge_verdict: edge_id,verdict,source_decision_ids. verdict is supported or unsupported; source_decision_ids are the supplied from/to IDs in order.
Fixed protocol_id=\"{V2_ID}\"; stage=\"S10B_EDGES\"; source_decisions_sha256=\"{sha(decision_payload)}\"; claim_boundary=\"bounded_topic_edge_semantics_only\"; external_audit_status=\"excluded\"; forbidden_action_violations=[].
BEGIN_COMPACT_EDGE_CONTEXT
{context.decode()}
END_COMPACT_EDGE_CONTEXT
"""
    return prompt.encode(), len(context)


def candidate_row(candidate_id: str) -> dict[str, Any]:
    _, capsule = base.topic_capsule("B")
    rows = [row for row in capsule["tension_candidates"] if row["id"] == candidate_id]
    if len(rows) != 1: raise Invalid(f"candidate {candidate_id}: source row mismatch")
    return rows[0]


def routing_row(candidate_id: str) -> dict[str, Any]:
    rows = [row for row in contract()["s10b"]["candidate_routing"] if row["candidate_id"] == candidate_id]
    if len(rows) != 1: raise Invalid(f"candidate {candidate_id}: routing row mismatch")
    return rows[0]


def fact_rows(candidate_id: str) -> list[dict[str, Any]]:
    route = routing_row(candidate_id)
    fact_by = {row["fact_id"]: row for row in contract()["s10b"]["candidate_facts"]}
    decisions = {row["id"]: row for row in base.r5_decisions("B")}
    out = []
    for fid in route["required_true_fact_ids"]:
        fact = fact_by[fid]; decision = decisions[fact["decision_id"]]
        value = decision["choice"] in fact["accepted_choices"]
        if value is not True: raise Invalid(f"candidate {candidate_id}: admitted fact is false")
        out.append({"fact_id":fid,"value":True,"decision_id":decision["id"],"decision_choice":decision["choice"],"source_record_ids":fact["source_record_ids"]})
    return out


def candidate_lineage(candidate_id: str) -> str:
    route = routing_row(candidate_id)
    material = {"candidate":candidate_row(candidate_id),"source_order":route["source_order"],"required_true_fact_ids":route["required_true_fact_ids"],"facts":fact_rows(candidate_id)}
    return sha(dump(material))


def expected_tension(candidate_id: str) -> dict[str, Any]:
    if actual_routes().get(candidate_id) != "semantic_subject":
        raise Invalid(f"candidate {candidate_id}: not routed to a subject")
    return {
        "protocol_id": V2_ID,
        "stage": "S10B_TENSION",
        "candidate_id": candidate_id,
        "candidate_lineage_sha256": candidate_lineage(candidate_id),
        "verdict": "supported_unresolved_tension",
        "supporting_fact_ids": routing_row(candidate_id)["required_true_fact_ids"],
        "claim_boundary": "bounded_single_candidate_tension_verdict",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def render_tension(candidate_id: str) -> tuple[bytes, int]:
    evidence = dump({"candidate":candidate_row(candidate_id),"facts":fact_rows(candidate_id)})
    prompt = base.BASE_INSTRUCTIONS + f"""ROLE: bounded single-candidate tension judge
STAGE: S10B_TENSION
Judge only whether this admitted, unresolved candidate is a supported unresolved tension or a resolved difference. Unsupported candidates and candidates with explicit authority/currentness resolution were removed deterministically before compilation.
OUTPUT CONTRACT (exact key order):
protocol_id,stage,candidate_id,candidate_lineage_sha256,verdict,supporting_fact_ids,claim_boundary,external_audit_status,forbidden_action_violations.
Allowed verdict: supported_unresolved_tension or resolved_difference. Cite the minimal supplied fact IDs in supplied order.
Fixed protocol_id=\"{V2_ID}\"; stage=\"S10B_TENSION\"; candidate_id=\"{candidate_id}\"; candidate_lineage_sha256=\"{candidate_lineage(candidate_id)}\"; claim_boundary=\"bounded_single_candidate_tension_verdict\"; external_audit_status=\"excluded\"; forbidden_action_violations=[].
BEGIN_SINGLE_CANDIDATE_EVIDENCE
{evidence.decode()}
END_SINGLE_CANDIDATE_EVIDENCE
"""
    payload = prompt.encode()
    forbidden = [cid for cid, route in actual_routes().items() if route != "semantic_subject"]
    if any(cid.encode() in payload for cid in forbidden):
        raise Invalid("non-subject tension candidate leaked into subject packet")
    return payload, len(evidence)


def reduce_s10b(decision_payload: bytes, decisions: dict[str, Any], edges: dict[str, Any], tension_rows: list[dict[str, Any]]) -> dict[str, Any]:
    base.require_exact_obj(decisions, expected_decisions(), "S10B_DECISIONS")
    base.require_exact_obj(edges, expected_edges(decision_payload, decisions), "S10B_EDGES")
    semantic_ids = contract()["s10b"]["semantic_subject_candidate_ids"]
    if [row.get("candidate_id") for row in tension_rows] != semantic_ids:
        raise Invalid("semantic tension subject rows do not match exact declared set/order")
    for row in tension_rows:
        base.require_exact_obj(row, expected_tension(row["candidate_id"]), f"tension {row['candidate_id']}")
    selected_semantic = [row["candidate_id"] for row in tension_rows if row["verdict"] == "supported_unresolved_tension"]
    ordered_candidates = [row["candidate_id"] for row in sorted(contract()["s10b"]["candidate_routing"], key=lambda item:item["source_order"])]
    selected = [cid for cid in ordered_candidates if cid in selected_semantic]
    source_payload, source = base.topic_capsule("B")
    selected_edges = base.reduce_edges(edges["checked_edge_ids"], edges["edge_verdicts"])
    return {
        "protocol_id": R5_ID,
        "stage": "S10B",
        "topic_id": source["topic_id"],
        "source_capsule_sha256": sha(source_payload),
        "source_capsule_bytes": len(source_payload),
        "decisions": decisions["decisions"],
        "supported_edge_ids": selected_edges,
        "selected_tension_ids": selected,
        "claim_boundary": "bounded_source_synthesis_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def transform_s20b(s10_payload: bytes, s10: dict[str, Any]) -> dict[str, Any]:
    if s10.get("stage") != "S10B" or s10.get("protocol_id") != R5_ID:
        raise Invalid("S20B input identity mismatch")
    fault = base.r5_key()["topic_faults"]["B"]
    idx = fault["index"]
    if s10["decisions"][idx]["id"] != fault["decision_id"] or s10["decisions"][idx]["choice"] != fault["expected_choice"]:
        raise Invalid("S20B fault binding mismatch")
    out = copy.deepcopy(s10); out["stage"] = "S20B"; out["decisions"][idx]["choice"] = fault["injected_choice"]
    ordered = {name:out[name] for name in ("protocol_id","stage","topic_id","source_capsule_sha256","source_capsule_bytes")}
    ordered["base_artifact_sha256"] = sha(s10_payload)
    for name in ("decisions","supported_edge_ids","selected_tension_ids","claim_boundary","external_audit_status","forbidden_action_violations"):
        ordered[name] = out[name]
    return ordered


def reduce_s50(a_payload: bytes, a: dict[str, Any], b_payload: bytes, b: dict[str, Any], semantic: dict[str, Any]) -> dict[str, Any]:
    expected = base.expected_s50_semantic(a_payload, a, b_payload, b)
    base.require_exact_obj(semantic, expected, "S50_SEMANTIC")
    decisions = base.r5_decision_map_from_s45(a, b)
    authority = base.project_authority(decisions, contract()["s50"]["authority_projection"])
    integration = base.read_json(R5 / "integration_contract.json", "integration contract")
    candidates = integration["cross_topic_edge_candidates"]
    selected = set(base.reduce_edges([row["id"] for row in candidates], semantic["edge_verdicts"]))
    out = {
        "protocol_id": R5_ID,
        "stage": "S50",
        "topic_artifact_hashes": {"topic_a":sha(a_payload),"topic_b":sha(b_payload)},
        "authority_matrix": authority,
        "cross_topic_edges": [row for row in candidates if row["id"] in selected],
        "unresolved_tension_ids": a["repaired_payload"]["selected_tension_ids"] + b["repaired_payload"]["selected_tension_ids"],
        "closed_topic_finding_ids": a["closed_finding_ids"] + b["closed_finding_ids"],
        "claim_boundary": "bounded_cross_topic_integration_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }
    for spec, row in zip(contract()["s50"]["authority_projection"], out["authority_matrix"]):
        base.strict_bool_or_string(row["value"], spec["value_type"], f"S50 authority {row['id']}")
    return out


def parse_inputs(values: list[str]) -> dict[str, tuple[bytes, dict[str, Any]]]:
    return base.parse_inputs(values)


def render_stage(stage: str, inputs: dict[str, tuple[bytes, dict[str, Any]]]) -> tuple[bytes, int]:
    if stage == "S10B_DECISIONS":
        base.require_inputs(inputs, ()); return render_decisions()
    if stage == "S10B_EDGES":
        base.require_inputs(inputs, ("S10B_DECISIONS",)); return render_edges(*inputs["S10B_DECISIONS"])
    if stage == "S10B_TENSION":
        base.require_inputs(inputs, ())
        candidate_ids = contract()["s10b"]["semantic_subject_candidate_ids"]
        if len(candidate_ids) != 1: raise Invalid("this revision requires exactly one semantic tension candidate")
        return render_tension(candidate_ids[0])
    if stage == "S50_SEMANTIC":
        base.require_inputs(inputs, ("S45A","S45B")); a,b=inputs["S45A"],inputs["S45B"]
        return base.render_s50_semantic(a[0],a[1],b[0],b[1])
    return base.render_unchanged(stage, inputs)


def expected_stage(stage: str, inputs: dict[str, tuple[bytes, dict[str, Any]]]) -> dict[str, Any]:
    if stage == "S10B_DECISIONS":
        base.require_inputs(inputs, ()); return expected_decisions()
    if stage == "S10B_EDGES":
        base.require_inputs(inputs, ("S10B_DECISIONS",)); return expected_edges(*inputs["S10B_DECISIONS"])
    if stage == "S10B_TENSION":
        base.require_inputs(inputs, ())
        candidate_ids = contract()["s10b"]["semantic_subject_candidate_ids"]
        if len(candidate_ids) != 1: raise Invalid("this revision requires exactly one semantic tension candidate")
        return expected_tension(candidate_ids[0])
    if stage == "S50_SEMANTIC":
        base.require_inputs(inputs, ("S45A","S45B")); a,b=inputs["S45A"],inputs["S45B"]
        return base.expected_s50_semantic(a[0],a[1],b[0],b[1])
    return base.expected_unchanged(stage, inputs)


def transform(stage: str, inputs: dict[str, tuple[bytes, dict[str, Any]]]) -> dict[str, Any]:
    if stage == "S10B_REDUCE":
        base.require_inputs(inputs, ("S10B_DECISIONS","S10B_EDGES","S10B_TENSION"))
        d,e,t=inputs["S10B_DECISIONS"],inputs["S10B_EDGES"],inputs["S10B_TENSION"]
        return reduce_s10b(d[0],d[1],e[1],[t[1]])
    if stage == "S20B":
        base.require_inputs(inputs, ("S10B",)); return transform_s20b(*inputs["S10B"])
    if stage == "S50_REDUCE":
        base.require_inputs(inputs, ("S45A","S45B","S50_SEMANTIC")); a,b,s=inputs["S45A"],inputs["S45B"],inputs["S50_SEMANTIC"]
        return reduce_s50(a[0],a[1],b[0],b[1],s[1])
    return base.transform(stage, inputs)


def diagnostics(stage: str, packet: bytes, source_bytes: int) -> dict[str, Any]:
    text=packet.decode(); prefix=text.split("BEGIN_",1)[0]; lines=[line for line in prefix.splitlines() if line.strip()]
    if stage == "S10B_DECISIONS":
        objectives=1; model=["decisions"]; deterministic=contract()["s10b"]["decision_deterministic_fields"]
    elif stage == "S10B_EDGES":
        objectives=1; model=["edge_verdicts"]; deterministic=contract()["s10b"]["edge_deterministic_fields"]
    elif stage == "S10B_TENSION":
        objectives=1; model=contract()["s10b"]["tension_model_owned_fields"]; deterministic=["candidate admission","candidate lineage","canonical order","fixed claims"]
    elif stage == "S50_SEMANTIC":
        objectives=1; model=["edge_verdicts"]; deterministic=contract()["s50"]["semantic_deterministic_fields"]
    else:
        objectives=1; model=["stage_specific_subject_payload"]; deterministic=["hashes","bindings","fixed claims","canonical order"]
    return {"stage":stage,"packet_payload_sha256":sha(packet),"packet_payload_bytes":len(packet),"admitted_source_bytes":source_bytes,"instruction_line_count":len(lines),"instruction_word_count":len(re.findall(r"\S+",prefix)),"semantic_objectives_per_call":objectives,"model_owned_fields":model,"deterministic_fields":deterministic,"diagnostic_only_not_model_budget_or_safety_profile":True}


def verify_preserved() -> int:
    for row in contract()["preserved_revision_bindings"]:
        data=(REPO/row["path"]).read_bytes()
        if (sha(data),len(data)) != (row["sha256"],row["bytes"]):
            raise Invalid(f"preserved R6-v1 binding drift: {row['path']}")
    v1_contract=base.read_json(V1/"contract.json","frozen R6-v1 contract")
    for row in v1_contract["immutable_bindings"]:
        data=(REPO/row["path"]).read_bytes()
        if (sha(data),len(data)) != (row["sha256"],row["bytes"]):
            raise Invalid(f"R5/postmortem binding drift: {row['path']}")
    return len(contract()["preserved_revision_bindings"])+len(v1_contract["immutable_bindings"])


def preflight() -> dict[str, Any]:
    bindings=verify_preserved(); holdouts=run_holdouts(); routes=actual_routes()
    packets={}
    p,src=render_decisions(); packets["S10B_DECISIONS"]=(p,src)
    d=expected_decisions(); dp=dump(d)
    p,src=render_edges(dp,d); packets["S10B_EDGES"]=(p,src)
    semantic_ids=contract()["s10b"]["semantic_subject_candidate_ids"]
    if len(semantic_ids)!=1: raise Invalid("this revision requires exactly one semantic tension candidate")
    p,src=render_tension(semantic_ids[0]); packets["S10B_TENSION"]=(p,src)
    excluded=[cid for cid,route in routes.items() if route!="semantic_subject"]
    if any(cid.encode() in packet for cid in excluded for packet,_ in packets.values()):
        raise Invalid("excluded/resolved candidate appears in an S10B subject packet")
    e=expected_edges(dp,d); t=expected_tension(semantic_ids[0])
    s10=reduce_s10b(dp,d,e,[t]); s10p=dump(s10)
    if s10["selected_tension_ids"] != semantic_ids:
        raise Invalid("R6-v2 deterministic/semantic tension projection mismatch")
    s20b=transform_s20b(s10p,s10); s20bp=dump(s20b)
    m=base.r5_module(); s30b=m.expected_s30("S30B",s20bp,s20b); s30bp=dump(s30b)
    s40b=m.expected_s40("S40B",s20bp,s20b,s30bp,s30b); s40bp=dump(s40b)
    s45b=m.expected_s45("S45B",s20bp,s20b,s30bp,s30b,s40bp,s40b); s45bp=dump(s45b)
    s45ap,s45a=read_payload(R5/"runs/slot-alpha/artifacts/S45A.json","R5 alpha S45A")
    sem=base.expected_s50_semantic(s45ap,s45a,s45bp,s45b)
    s50=reduce_s50(s45ap,s45a,s45bp,s45b,sem)
    projected_by_id={row["id"]:row["value"] for row in s50["authority_matrix"]}
    for spec in contract()["s50"]["authority_projection"]:
        base.strict_bool_or_string(projected_by_id[spec["id"]],spec["value_type"],f"R6-v2 authority {spec['id']}")
    metrics=[diagnostics(stage,*value) for stage,value in packets.items()]
    old=(V1/"packets/shared/S10B_CORE.txt").read_bytes()[:-1]
    return {
        "schema_id":"pw-r6-v2-preflight-report-v1","protocol_id":V2_ID,"status":"PASS","subject_calls":0,
        "immutable_bindings_checked":bindings,"counterfactual_holdouts":holdouts,"candidate_routes":routes,
        "non_subject_candidate_ids_absent_from_all_subject_packets":excluded,
        "selected_tension_ids_after_generic_routing":s10["selected_tension_ids"],
        "transitive_payload_change_from_r5_and_r6_v1":sha(s10p)!=sha(dump(m.expected_s10("S10B"))),
        "s20b_transform_valid":s20b["decisions"][base.r5_key()["topic_faults"]["B"]["index"]]["choice"]==base.r5_key()["topic_faults"]["B"]["injected_choice"],
        "s50_boolean_projection_valid":True,
        "baseline":{"r6_v1_core_packet_payload_sha256":sha(old),"r6_v1_core_packet_payload_bytes":len(old)},
        "r6_v2_measurements":metrics,"nonclaims":contract()["nonclaims"]
    }


def parser() -> argparse.ArgumentParser:
    p=argparse.ArgumentParser(); sub=p.add_subparsers(dest="command",required=True); sub.add_parser("preflight")
    for name in ("render","expected","score","transform","measure"):
        q=sub.add_parser(name); q.add_argument("--stage",required=True); q.add_argument("--input",action="append",default=[])
        if name=="score":q.add_argument("--capture",required=True)
    return p


def main() -> int:
    args=parser().parse_args()
    try:
        if args.command=="preflight":sys.stdout.buffer.write(dump(preflight())+b"\n");return 0
        inputs=parse_inputs(args.input)
        if args.command=="render":sys.stdout.buffer.write(render_stage(args.stage,inputs)[0]);return 0
        if args.command=="expected":sys.stdout.buffer.write(dump(expected_stage(args.stage,inputs))+b"\n");return 0
        if args.command=="transform":sys.stdout.buffer.write(dump(transform(args.stage,inputs))+b"\n");return 0
        if args.command=="measure":
            packet,source=render_stage(args.stage,inputs);sys.stdout.buffer.write(dump(diagnostics(args.stage,packet,source))+b"\n");return 0
        if args.command=="score":
            actual_payload,actual=read_payload(Path(args.capture).resolve(),f"{args.stage} capture");expected=expected_stage(args.stage,inputs)
            diffs=base.structural_diffs(expected,actual);exact=actual==expected and not diffs
            result={"schema_id":"pw-r6-stage-score-v2","protocol_id":V2_ID,"stage":args.stage,"verdict":"PASS" if exact else "FAIL","exact":exact,"actual_payload_sha256":sha(actual_payload),"actual_payload_bytes":len(actual_payload),"expected_payload_sha256":sha(dump(expected)),"expected_payload_bytes":len(dump(expected)),"structural_diffs":diffs}
            sys.stdout.buffer.write(dump(result)+b"\n");return 0 if exact else 1
        raise Invalid("unreachable command")
    except SubjectFail as exc:
        sys.stdout.buffer.write(dump({"schema_id":"pw-r6-harness-error-v2","protocol_id":V2_ID,"status":"FAIL","error":str(exc)})+b"\n");return 1
    except (Invalid,OSError,KeyError,TypeError,ValueError,IndexError) as exc:
        sys.stdout.buffer.write(dump({"schema_id":"pw-r6-harness-error-v2","protocol_id":V2_ID,"status":"INVALID","error":str(exc)})+b"\n");return 2


if __name__=="__main__":raise SystemExit(main())
