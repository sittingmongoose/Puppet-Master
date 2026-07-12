#!/usr/bin/env python3
from __future__ import annotations

import argparse,hashlib,json,os
from pathlib import Path

ROOT=Path(__file__).resolve().parents[5]
NS=ROOT/"master/cross_domain_seams/wave-0001/window-sharding-v2"
V10_SHA="0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1"
def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()
def jsonl(p:Path):return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]

def validate_independent_report(report:dict,path:Path,report_sha:str,cohort_id:str)->list[str]:
    authority=json.loads((NS/"authority.json").read_text()); rows=jsonl(NS/f"cohorts/{cohort_id}/manifest.jsonl")
    expected={"status":"pass","gate_passed":True,"audit_id":authority["audit_id"],"wave_id":authority["wave_id"],"cohort_id":cohort_id,"assignment_count":16,"assignment_ids":[x["assignment_id"] for x in rows],"agent_paths":[x["prospective_agent_path"] for x in rows],"cohort_edge_count":sum(x["edge_count"] for x in rows),"cohort_edge_digest":hashlib.sha256(json.dumps([x["edge_membership_digest"] for x in rows],sort_keys=True,separators=(",",":")).encode()).hexdigest(),"global_edge_count":9365,"global_edge_digest":authority["edge_digest"],"model":"gpt-5.6-sol","reasoning_effort":"xhigh","controller_thread_id":"019f4f5e-96c6-7893-8c94-ce2c1b760d6c","concurrency_policy_v10_sha256":V10_SHA,"authority_sha256":sha(NS/"authority.json"),"launch_seal_sha256":sha(NS/"launch_seal.json"),"cohort_manifest_sha256":sha(NS/f"cohorts/{cohort_id}/manifest.jsonl"),"source_capsule_sha256":authority["source_capsule_sha256"],"outputs_empty":16,"receipts":0,"results":0,"native_capture_rows":0,"cohort_activation_files":0,"coverage_credit":0,"research_credit":0,"spec_credit":0,"merge_credit":0,"promotion_credit":0}
    errors=[]
    if sha(path)!=report_sha:errors.append("report_hash")
    for k,v in expected.items():
        if report.get(k)!=v:errors.append(f"report:{k}")
    if report.get("errors")!=[]:errors.append("report_errors")
    return errors

def generate(cohort_id:str,report_path:Path,report_sha:str,output:Path)->dict:
    if output.exists():raise RuntimeError("activation already exists")
    report=json.loads(report_path.read_text()); errors=validate_independent_report(report,report_path,report_sha,cohort_id)
    if errors:raise RuntimeError(";".join(errors))
    from verify_prelaunch_v2 import verify
    pre=verify()
    if pre["status"]!="pass":raise RuntimeError("global zero-state failed")
    rows=jsonl(NS/f"cohorts/{cohort_id}/manifest.jsonl")
    if any(any(Path(x["output_directory"]).iterdir()) or Path(json.loads(Path(x["dispatch_intent_path"]).read_text())["dispatch_receipt_ref"]).exists() for x in rows):raise RuntimeError("cohort zero-state failed")
    template=json.loads((NS/f"cohorts/{cohort_id}/activation.template.json").read_text())
    activation=dict(template);activation.update({"status":"ACTIVE_FOR_EXACTLY_16_FRESH_SOL_XHIGH_LEAVES","activation_granted":True,"independent_prelaunch_path":str(report_path),"independent_prelaunch_sha256":report_sha,"authority_sha256":sha(NS/"authority.json"),"launch_seal_sha256":sha(NS/"launch_seal.json"),"activation_transaction_id":f"A005-CDS-V2-{cohort_id.upper()}-EXACT16"})
    raw=(json.dumps(activation,indent=2,sort_keys=True)+"\n").encode();output.parent.mkdir(parents=True,exist_ok=True);fd=os.open(output,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
    with os.fdopen(fd,"wb") as f:f.write(raw)
    return activation

if __name__=="__main__":
    ap=argparse.ArgumentParser();ap.add_argument("--cohort-id",required=True,choices=[f"cohort-{i:04d}" for i in range(1,5)]);ap.add_argument("--independent-report",required=True);ap.add_argument("--independent-report-sha256",required=True);ap.add_argument("--output");a=ap.parse_args();out=Path(a.output).resolve() if a.output else NS/f"cohorts/{a.cohort_id}/activation.v2.json";r=generate(a.cohort_id,Path(a.independent_report).resolve(),a.independent_report_sha256,out);print(json.dumps({"status":"activated","cohort_id":a.cohort_id,"activation_sha256":sha(out),"assignment_count":len(r["assignment_ids"])},sort_keys=True))
