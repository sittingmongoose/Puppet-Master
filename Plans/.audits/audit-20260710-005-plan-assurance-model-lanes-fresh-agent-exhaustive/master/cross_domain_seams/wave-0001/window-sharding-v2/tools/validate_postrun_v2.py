#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parents[5]
NS=ROOT/"master/cross_domain_seams/wave-0001/window-sharding-v2"
sys.path.insert(0,str(ROOT/"master/dependencies/jsonschema-draft202012-v1/site-packages"))
import jsonschema

def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()
def jsonl(p:Path):return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
SCHEMA=json.loads((NS/"schema/result.schema.json").read_text())
VALIDATOR=jsonschema.Draft202012Validator(SCHEMA,format_checker=jsonschema.FormatChecker())

def validate_result_document(doc:dict,packet:dict)->list[str]:
    errors=["schema:"+"/".join(map(str,e.absolute_path))+":"+e.message for e in sorted(VALIDATOR.iter_errors(doc),key=lambda e:(list(e.absolute_path),e.message))]
    expected=[x["normalized_edge_id"] for x in packet["seams"]]
    cov=doc.get("coverage",{}); decisions=doc.get("decisions",[]); decision_ids=[x.get("normalized_edge_id") for x in decisions if isinstance(x,dict)]
    if cov.get("edge_count")!=len(expected):errors.append("coverage_count")
    if cov.get("normalized_edge_ids")!=expected:errors.append("coverage_membership_or_order")
    if decision_ids!=expected:errors.append("decision_membership_or_order")
    if len(set(decision_ids))!=len(decision_ids):errors.append("duplicate_decision")
    binding=doc.get("input_binding",{}); pp=NS/f"packets/{packet['packet_id']}.json"
    for key,value in {"packet_id":packet["packet_id"],"packet_sha256":sha(pp),"edge_membership_digest":packet["edge_membership_digest"],"source_capsule_sha256":packet["source_capsule_sha256"]}.items():
        if binding.get(key)!=value:errors.append(f"binding:{key}")
    if doc.get("cohort_id")!=packet["cohort_id"] or doc.get("assignment_id")!=packet["assignment_id"]:errors.append("identity_scope")
    for d in decisions:
        if not isinstance(d,dict):continue
        eid=d.get("normalized_edge_id"); research=d.get("external_research",{}); state=research.get("state"); sources=research.get("sources",[]); claims=research.get("claims",[]); registered={x.get("url") for x in sources if isinstance(x,dict)}
        if state=="sufficient_for_judgment":
            if research.get("live_web_research_performed") is not True:errors.append(f"research_not_live:{eid}")
            if not sources or not claims:errors.append(f"research_underfilled:{eid}")
            if d.get("unresolved_reason") is not None:errors.append(f"resolved_has_unresolved:{eid}")
        elif state=="insufficient_unresolved":
            if d.get("decision")!="uncertain_requires_targeted_research":errors.append(f"insufficient_not_uncertain:{eid}")
            if not d.get("unresolved_reason"):errors.append(f"insufficient_missing_reason:{eid}")
        for s in sources:
            u=s.get("url") if isinstance(s,dict) else None; q=urlparse(u or "")
            if q.scheme!="https" or not q.netloc or any(c.isspace() for c in (u or "")):errors.append(f"invalid_url:{eid}")
        for c in claims:
            for u in c.get("source_urls",[]) if isinstance(c,dict) else []:
                if u not in registered:errors.append(f"unregistered_claim_source:{eid}")
        if d.get("promotion_performed") is not False:errors.append(f"promotion_veto:{eid}")
        if d.get("decision")=="conflict_requires_plan_revision" and not d.get("proposed_plan_revision"):errors.append(f"missing_revision:{eid}")
    return sorted(set(errors))

def validate_cohort(cohort_id:str)->dict:
    errors=[]; rows=jsonl(NS/f"cohorts/{cohort_id}/manifest.jsonl"); activation=NS/f"cohorts/{cohort_id}/activation.v2.json"; capture=NS/f"cohorts/{cohort_id}/runtime/native_capture.json"
    if len(rows)!=16:errors.append("cohort_manifest_cardinality")
    if not activation.is_file():errors.append("missing_activation")
    if not capture.is_file():errors.append("missing_capture")
    captures={x.get("assignment_id"):x for x in json.loads(capture.read_text()).get("rows",[])} if capture.is_file() else {}
    reports=[]; paths=set();threads=set();turns=set()
    for row in rows:
        aid=row["assignment_id"]; pp=Path(row["packet_path"]); packet=json.loads(pp.read_text()); out=Path(row["output_directory"]); rp=out/"result.json"; receipt=NS/f"dispatch/{aid}/attempt-0001/dispatch_receipt.json"; er=[]
        if sorted(x.name for x in out.iterdir())!=["result.json"]:er.append("output_confinement")
        if not rp.is_file():er.append("missing_result")
        if not receipt.is_file():er.append("missing_receipt")
        if rp.is_file():
            try:
                doc=json.loads(rp.read_text()); er+=validate_result_document(doc,packet)
                if "task_thread_id" in doc or "native_child_thread_id" in doc or "native_turn_id" in doc:er.append("result_native_identity_forbidden")
            except Exception as exc:er.append(f"result_parse:{exc}")
        if receipt.is_file():
            rec=json.loads(receipt.read_text())
            if rec.get("schema_version")!="cross-domain-seam-window-v2-dispatch-receipt-v1":er.append("receipt_schema")
            for key,val in {"assignment_id":aid,"cohort_id":cohort_id,"packet_sha256":row["packet_sha256"],"dispatch_intent_sha256":row["dispatch_intent_sha256"],"model":"gpt-5.6-sol","reasoning_effort":"xhigh","terminal_status":"completed","terminal_response":"PMR1"}.items():
                if rec.get(key)!=val:er.append(f"receipt:{key}")
            if rp.is_file() and rec.get("result_sha256")!=sha(rp):er.append("receipt_result_hash")
            for field,seen in (("agent_path",paths),("native_child_thread_id",threads),("native_turn_id",turns)):
                v=rec.get(field)
                if not v or v in seen:er.append(f"identity:{field}")
                seen.add(v)
            cap=captures.get(aid)
            if not cap:er.append("capture_missing")
            elif any(cap.get(k)!=rec.get(k) for k in ("agent_path","native_child_thread_id","native_turn_id")):er.append("capture_receipt_identity")
        reports.append({"assignment_id":aid,"eligible":not er,"errors":sorted(set(er))})
    if len(captures)!=16:errors.append("capture_cardinality")
    eligible=[x["assignment_id"] for x in reports if x["eligible"]]
    return {"schema_version":"cross-domain-seam-window-v2-cohort-postrun-v1","cohort_id":cohort_id,"status":"pass_candidate_only" if len(eligible)==16 and not errors else "fail","errors":errors,"assignments":reports,"eligible_assignment_ids":eligible,"counts":{"eligible":len(eligible),"rejected":16-len(eligible)},"credits":{"coverage":0,"research":0,"spec":0,"merge":0,"promotion":0}}

if __name__=="__main__":
    ap=argparse.ArgumentParser();ap.add_argument("--cohort-id",required=True,choices=[f"cohort-{i:04d}" for i in range(1,5)]);a=ap.parse_args();r=validate_cohort(a.cohort_id);print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r["status"]=="pass_candidate_only" else 1)
