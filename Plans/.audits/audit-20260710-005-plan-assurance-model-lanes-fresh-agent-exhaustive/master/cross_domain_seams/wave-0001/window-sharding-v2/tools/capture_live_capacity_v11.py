#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[5]
NS = ROOT / "master/cross_domain_seams/wave-0001/window-sharding-v2"
CONTROLLERS = {"019f4f5e-96c6-7893-8c94-ce2c1b760d6c", "019f5078-6501-7223-b52f-2251010bdc41"}
V11 = "6717f715c8a32dea88d7e79e70fca87aeb4a0b637853da3742c5c6e6a0c9a086"


def active_children() -> list[dict]:
    rows = []
    for path in Path("/Users/jaredsmacbookair/.codex/sessions/2026/07/11").glob("*.jsonl"):
        try:
            objects = [json.loads(line) for line in path.read_text().splitlines()]
        except Exception:
            continue
        if not objects or objects[0].get("type") != "session_meta": continue
        meta = objects[0].get("payload", {})
        if meta.get("cwd") != "/Users/jaredsmacbookair/Documents/PuppetMaster" or meta.get("parent_thread_id") not in CONTROLLERS: continue
        starts=[]; completes=[]; context=None
        for index, item in enumerate(objects):
            payload=item.get("payload", {})
            if item.get("type")=="event_msg" and payload.get("type")=="task_started": starts.append(index)
            if item.get("type")=="event_msg" and payload.get("type")=="task_complete": completes.append(index)
            if item.get("type")=="turn_context" and context is None: context=payload
        if starts and (not completes or starts[-1] > completes[-1]):
            rows.append({
                "native_child_thread_id":meta.get("id"),"parent_thread_id":meta.get("parent_thread_id"),
                "agent_path":meta.get("agent_path"),"nickname":meta.get("agent_nickname"),
                "model":(context or {}).get("model"),"reasoning_effort":(context or {}).get("effort"),
                "session_path":str(path),"session_capture_sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
            })
    return sorted(rows,key=lambda row:row["native_child_thread_id"])


if __name__ == "__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--cohort-id",required=True);parser.add_argument("--output",required=True);parser.add_argument("--requested",type=int,default=16);args=parser.parse_args()
    active=active_children(); before=len(active); after=before+args.requested; fits=after<=48
    report={
        "schema_version":"audit005-v11-live-semantic-capacity-decision-v1","cohort_id":args.cohort_id,
        "concurrency_policy_v11_sha256":V11,"rolling_semantic_max":48,"atomic_transaction_cap":16,
        "active_semantic_children_before":before,"active_semantic_children":active,
        "requested_whole_cohort_size":args.requested,"projected_after_full_cohort":after,
        "capacity_decision":"LAUNCH_WHOLE_COHORT" if fits else "READY_CAPACITY_DEFERRED",
        "fits":fits,"partial_cohort_forbidden":True,"atomic32_forbidden":True,
    }
    output=Path(args.output);raw=(json.dumps(report,indent=2,sort_keys=True)+"\n").encode();output.parent.mkdir(parents=True,exist_ok=True)
    if output.exists(): raise SystemExit("capacity decision exists")
    fd=os.open(output,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
    with os.fdopen(fd,"wb") as stream:stream.write(raw)
    print(json.dumps({"status":report["capacity_decision"],"active_before":before,"projected_after":after,"report_path":str(output),"report_sha256":hashlib.sha256(raw).hexdigest(),"active":active},indent=2,sort_keys=True))
    raise SystemExit(0 if fits else 2)
