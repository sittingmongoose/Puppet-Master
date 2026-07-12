#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
NS = ROOT / "master/cross_domain_seams/wave-0001/window-sharding-v2"
V11 = "6717f715c8a32dea88d7e79e70fca87aeb4a0b637853da3742c5c6e6a0c9a086"
V10 = "0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"
ROUTING = "9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544"
CHANGE = "b227f14a04aae9ddce62440002af2c76528a1433c4e440df613490865f9f444e"
LUNA = "a2913d9a26bc2ada12e72347b6bdf4d167e43644d713a5060f82b132f4bc3207"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jsonl(path: Path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def generate(cohort_id: str, decision_path: Path, decision_sha: str, live_before: int, output: Path) -> dict:
    if cohort_id not in {"cohort-0001", "cohort-0002"}: raise RuntimeError("unauthorized cohort")
    if output.exists(): raise RuntimeError("activation already exists")
    report_path = NS / "validation/luna-independent-prelaunch-v3.json"
    if sha(report_path) != LUNA: raise RuntimeError("Luna report drift")
    report = json.loads(report_path.read_text())
    if report.get("status") != "READY_FOR_SOL_LAUNCH" or report.get("gate_passed") is not True or report.get("errors") != []: raise RuntimeError("Luna gate")
    if not decision_path.is_file() or sha(decision_path) != decision_sha: raise RuntimeError("controller decision hash")
    decision = json.loads(decision_path.read_text())
    if decision.get("status") != "PASS_READY_TO_ACTIVATE_TWO_SEPARATE_EXACT16_COHORTS" or cohort_id not in decision.get("authorized_cohorts", []): raise RuntimeError("controller decision")
    if live_before + 16 > 48: raise RuntimeError("V11 capacity")
    rows = jsonl(NS / f"cohorts/{cohort_id}/manifest.jsonl")
    if len(rows) != 16: raise RuntimeError("cohort cardinality")
    readiness = next(row for row in report["cohort_readiness"] if row["cohort_id"] == cohort_id)
    if readiness.get("ready") is not True or readiness.get("assignment_ids") != [row["assignment_id"] for row in rows]: raise RuntimeError("cohort readiness")
    for row in rows:
        intent = json.loads(Path(row["dispatch_intent_path"]).read_text())
        out = Path(row["output_directory"])
        if any(out.iterdir()) or Path(intent["dispatch_receipt_ref"]).exists(): raise RuntimeError("cohort zero state")
    if (NS / f"cohorts/{cohort_id}/runtime/native_capture.json").exists(): raise RuntimeError("capture exists")
    template = json.loads((NS / f"cohorts/{cohort_id}/activation.template.json").read_text())
    activation = dict(template)
    activation.pop("concurrency_policy_v10_sha256", None)
    activation.update({
        "schema_version":"cross-domain-seam-window-v2-cohort-activation-v11",
        "status":"ACTIVE_FOR_EXACTLY_16_FRESH_SOL_XHIGH_LEAVES",
        "activation_granted":True,
        "activation_transaction_id":f"A005-CDS-V2-V11-{cohort_id.upper()}-EXACT16",
        "independent_prelaunch_path":str(report_path),"independent_prelaunch_sha256":sha(report_path),
        "sol_controller_prelaunch_path":str(decision_path),"sol_controller_prelaunch_sha256":decision_sha,
        "authority_sha256":sha(NS / "authority.json"),"launch_seal_sha256":sha(NS / "launch_seal.json"),
        "concurrency_policy_v10_lineage_sha256":V10,"concurrency_policy_v11_sha256":V11,
        "model_lane_routing_policy_v2_sha256":ROUTING,"concurrent_change_policy_sha256":CHANGE,
        "rolling_max":48,"preferred_min":40,"preferred_max":48,"atomic_cap":16,"semantic_transaction_cap":16,
        "live_semantic_count_before_activation":live_before,"live_semantic_count_after_full_cohort":live_before+16,
        "separate_atomic_transaction":True,"atomic32_forbidden":True,
        "controller_thread_id":"019f4f5e-96c6-7893-8c94-ce2c1b760d6c","model":"gpt-5.6-sol","reasoning_effort":"xhigh",
        "coverage_credit":0,"research_credit":0,"spec_credit":0,"merge_credit":0,"promotion_credit":0,
    })
    raw = (json.dumps(activation, indent=2, sort_keys=True) + "\n").encode()
    output.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    with os.fdopen(fd, "wb") as stream: stream.write(raw)
    return {"status":"activated","cohort_id":cohort_id,"assignment_count":16,"activation_path":str(output),"activation_sha256":sha(output),"transaction_id":activation["activation_transaction_id"],"live_before":live_before,"live_after":live_before+16}


if __name__ == "__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--cohort-id",required=True);parser.add_argument("--decision",required=True);parser.add_argument("--decision-sha256",required=True);parser.add_argument("--live-before",type=int,required=True);args=parser.parse_args()
    out=NS/f"cohorts/{args.cohort_id}/activation.v2.json"
    print(json.dumps(generate(args.cohort_id,Path(args.decision).resolve(),args.decision_sha256,args.live_before,out),indent=2,sort_keys=True))
