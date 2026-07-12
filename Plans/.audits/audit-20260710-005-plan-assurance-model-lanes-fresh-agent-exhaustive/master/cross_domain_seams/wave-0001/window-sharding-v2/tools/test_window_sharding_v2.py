#!/usr/bin/env python3
from __future__ import annotations

import copy,hashlib,json,tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[5]
V1=ROOT/"master/cross_domain_seams/wave-0001"
NS=V1/"window-sharding-v2"
from verify_prelaunch_v2 import verify
from validate_postrun_v2 import validate_result_document
from generate_cohort_activation_v2 import validate_independent_report
def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(v)->str:return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(",",":")).encode()).hexdigest()
def jsonl(p:Path):return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]

def decision(eid):
    return {"normalized_edge_id":eid,"decision":"shared_subsystem_distinct","rationale":"Independent authority and lifecycle analysis preserves distinct feature identity.","authority_lifecycle_outcome_state_failure_analysis":"Authority, lifecycle, user outcome, state boundary, and failure semantics were compared and are not identical.","supporting_evidence":["Whole packet evidence and current external research support this decision."],"counterevidence":["Name and vocabulary similarity were rejected as insufficient merge proof."],"external_research":{"state":"sufficient_for_judgment","live_web_research_performed":True,"sources":[{"url":"https://example.org/standard","title":"Standard","publisher":"Example Standards Body","accessed_date":"2026-07-11"}],"claims":[{"claim":"The source distinguishes the relevant lifecycle and failure boundaries.","source_urls":["https://example.org/standard"],"applicability":"It directly constrains this seam's authority and failure semantics."}]},"unresolved_reason":None,"promotion_performed":False,"proposed_plan_revision":None}

def valid_result(packet):
    ids=[x["normalized_edge_id"] for x in packet["seams"]];num=int(packet["assignment_id"][-4:])
    return {"audit_id":"audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive","schema_version":"cross-domain-seam-window-v2-result-v1","phase":"cross_domain_seam_window_adjudication_v2","assignment_id":packet["assignment_id"],"cohort_id":packet["cohort_id"],"attempt_id":"attempt-0001","agent_path":f"/root/a005_cross_domain_seam_v2_{num:04d}_attempt_0001_terminal","model":"gpt-5.6-sol","reasoning_effort":"xhigh","status":"completed","input_binding":{"packet_id":packet["packet_id"],"packet_sha256":sha(NS/f"packets/{packet['packet_id']}.json"),"edge_membership_digest":packet["edge_membership_digest"],"source_capsule_sha256":packet["source_capsule_sha256"],"cohort_activation_sha256":"a"*64},"coverage":{"edge_count":len(ids),"normalized_edge_ids":ids},"decisions":[decision(x) for x in ids],"self_attestation":{k:True for k in ["all_edges_reviewed","whole_edge_evidence_reviewed","no_merge_by_name_similarity","no_silent_domain_collapse","no_final_promotion","external_research_used_for_each_final_judgment","no_descendants","no_peer_outputs"]}}

def main():
    tests={}
    def check(n,v):tests[n]=bool(v)
    pre=verify();check("prelaunch-pass",pre["status"]=="pass")
    v1_edges=jsonl(V1/"normalized_edge_ledger.jsonl");manifest=jsonl(NS/"manifest.jsonl");registry=jsonl(NS/"packet_registry.jsonl");authority=json.loads((NS/"authority.json").read_text());capsule=json.loads((NS/"source_capsule.json").read_text())
    check("exact64",len(manifest)==len(registry)==64);check("four-cohorts",len({x["cohort_id"] for x in manifest})==4);check("v1-exact-union",authority["edge_count"]==9365 and authority["feature_count"]==2495);check("v1-digest",authority["edge_digest"]==digest([x["normalized_edge_key"] for x in v1_edges]));check("v10",authority["concurrency_policy_v10_sha256"]=="0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1");check("zero-credit",all(authority[x]==0 for x in ["coverage_credit","research_credit","spec_credit","merge_credit","promotion_credit"]));check("zero-state",all(authority[x]==0 for x in ["activation_files","results","receipts","native_capture_rows"]));check("v1-terminal-pin",capsule["v1_terminal_report_sha256"]=="75b070ecdb20667ac46fc948ee575e6f33d1319f8bd15bbd679b6d51d29b8a98");check("v1-edge-pin",capsule["v1_edge_ledger_sha256"]=="6ebfdbd97df06dc4060421f8845d32de4fc3edc81d57a1765144986193a2925b");check("v1-source-pin",capsule["v1_source_inventory_sha256"]=="f28db2680cde7985d4ca09405e4bc5923e3f587677d67d0140bccd0a42e9d0b0")
    conflicts=[x for x in v1_edges if x["candidate_related_conflict"]];quars=[x for x in v1_edges if x["quarantined"]]
    for e in conflicts:check("conflict:"+e["normalized_edge_id"],"related_but_distinct" in e["observed_dispositions"] and any(x in e["observed_dispositions"] for x in ["merge_candidate","unsupported","uncertain"]))
    for e in quars:check("quarantine:"+e["normalized_edge_id"],bool(e["quarantine_observations"]) and any(x["source_quarantined"] for x in e["provenance"]))
    for e in v1_edges[:256]:check("edge-identity:"+e["normalized_edge_id"],e["normalized_edge_key"]=="\0".join(sorted(e["endpoint_refs"])) and len(e["provenance"])>=1)
    packet_union=[];all_paths=[]
    for row in manifest:
        p=Path(row["packet_path"]);packet=json.loads(p.read_text());ids=[x["normalized_edge_id"] for x in packet["seams"]];packet_union+=ids;all_paths.append(row["prospective_agent_path"])
        check("packet-hash:"+row["assignment_id"],sha(p)==row["packet_sha256"])
        check("packet-membership:"+row["assignment_id"],len(ids)==len(set(ids))==row["edge_count"] and digest(ids)==row["edge_membership_digest"])
        check("packet-feature-closure:"+row["assignment_id"],sorted({r for x in packet["seams"] for r in x["endpoint_refs"]})==sorted(x["provisional_feature_ref"] for x in packet["feature_records"]))
        check("packet-target-ceiling:"+row["assignment_id"],p.stat().st_size<=750000)
        check("packet-hard-ceiling:"+row["assignment_id"],p.stat().st_size<=900000)
        check("intent-hash:"+row["assignment_id"],sha(Path(row["dispatch_intent_path"]))==row["dispatch_intent_sha256"])
    check("global-no-overlap",len(packet_union)==len(set(packet_union))==9365);check("global-no-omission",set(packet_union)=={x["normalized_edge_id"] for x in v1_edges});check("fresh-paths",len(all_paths)==len(set(all_paths))==64)
    for i in range(1,5):
        cid=f"cohort-{i:04d}";rows=jsonl(NS/f"cohorts/{cid}/manifest.jsonl");template=json.loads((NS/f"cohorts/{cid}/activation.template.json").read_text())
        check("cohort16:"+cid,len(rows)==16);check("cohort-scope:"+cid,all(x["cohort_id"]==cid for x in rows));check("cohort-template-blocked:"+cid,template["activation_granted"] is False and template["semantic_transaction_cap"]==16);check("cohort-no-live-activation:"+cid,not (NS/f"cohorts/{cid}/activation.v2.json").exists())
    packet=json.loads(Path(manifest[0]["packet_path"]).read_text());base=valid_result(packet);check("valid-result",validate_result_document(base,packet)==[])
    mutations=[]
    def add(n,fn):d=copy.deepcopy(base);fn(d);mutations.append((n,d))
    add("extra",lambda d:d.__setitem__("extra",True));add("wrong-model",lambda d:d.__setitem__("model","gpt-5.6-luna"));add("wrong-effort",lambda d:d.__setitem__("reasoning_effort","max"));add("wrong-path",lambda d:d.__setitem__("agent_path","/root/reused"));add("wrong-cohort",lambda d:d.__setitem__("cohort_id","cohort-0004"));add("wrong-assignment",lambda d:d.__setitem__("assignment_id","A005CDSV2-0064"));add("wrong-packet",lambda d:d["input_binding"].__setitem__("packet_sha256","0"*64));add("wrong-source-capsule",lambda d:d["input_binding"].__setitem__("source_capsule_sha256","0"*64));add("missing-edge",lambda d:(d["coverage"]["normalized_edge_ids"].pop(),d["decisions"].pop(),d["coverage"].__setitem__("edge_count",d["coverage"]["edge_count"]-1)));add("duplicate-edge",lambda d:d["coverage"]["normalized_edge_ids"].__setitem__(-1,d["coverage"]["normalized_edge_ids"][0]));add("foreign-edge",lambda d:d["decisions"][0].__setitem__("normalized_edge_id","A005CDS-EDGE-99999"));add("no-live-web",lambda d:d["decisions"][0]["external_research"].__setitem__("live_web_research_performed",False));add("no-sources",lambda d:d["decisions"][0]["external_research"].__setitem__("sources",[]));add("no-claims",lambda d:d["decisions"][0]["external_research"].__setitem__("claims",[]));add("unregistered-source",lambda d:d["decisions"][0]["external_research"]["claims"][0].__setitem__("source_urls",["https://foreign.example/x"]));add("http-source",lambda d:d["decisions"][0]["external_research"]["sources"][0].__setitem__("url","http://example.org/x"));add("promotion",lambda d:d["decisions"][0].__setitem__("promotion_performed",True));add("insufficient-not-uncertain",lambda d:d["decisions"][0]["external_research"].__setitem__("state","insufficient_unresolved"));add("missing-attestation",lambda d:d["self_attestation"].pop("whole_edge_evidence_reviewed"));add("native-id-in-result",lambda d:d.__setitem__("task_thread_id","native"))
    for n,d in mutations:check("result-negative:"+n,bool(validate_result_document(d,packet)))
    cid="cohort-0001";rows=jsonl(NS/f"cohorts/{cid}/manifest.jsonl");report={"status":"pass","gate_passed":True,"audit_id":authority["audit_id"],"wave_id":authority["wave_id"],"cohort_id":cid,"assignment_count":16,"assignment_ids":[x["assignment_id"] for x in rows],"agent_paths":[x["prospective_agent_path"] for x in rows],"cohort_edge_count":sum(x["edge_count"] for x in rows),"cohort_edge_digest":digest([x["edge_membership_digest"] for x in rows]),"global_edge_count":9365,"global_edge_digest":authority["edge_digest"],"model":"gpt-5.6-sol","reasoning_effort":"xhigh","controller_thread_id":"019f4f5e-96c6-7893-8c94-ce2c1b760d6c","concurrency_policy_v10_sha256":"0fbaad08800f3f5e8e122e7638e2537382d9c6f6be5fc93afcd307a3a42098f1","authority_sha256":sha(NS/"authority.json"),"launch_seal_sha256":sha(NS/"launch_seal.json"),"cohort_manifest_sha256":sha(NS/f"cohorts/{cid}/manifest.jsonl"),"source_capsule_sha256":authority["source_capsule_sha256"],"outputs_empty":16,"receipts":0,"results":0,"native_capture_rows":0,"cohort_activation_files":0,"coverage_credit":0,"research_credit":0,"spec_credit":0,"merge_credit":0,"promotion_credit":0,"errors":[]}
    with tempfile.TemporaryDirectory() as td:
        p=Path(td)/"report.json";p.write_text(json.dumps(report,sort_keys=True));check("activation-report-valid",validate_independent_report(report,p,sha(p),cid)==[])
        for key in ["status","gate_passed","cohort_id","assignment_count","assignment_ids","agent_paths","cohort_edge_count","cohort_edge_digest","global_edge_count","global_edge_digest","model","reasoning_effort","controller_thread_id","concurrency_policy_v10_sha256","authority_sha256","launch_seal_sha256","cohort_manifest_sha256","source_capsule_sha256","outputs_empty","receipts","results","native_capture_rows","cohort_activation_files","coverage_credit","research_credit","spec_credit","merge_credit","promotion_credit"]:
            d=copy.deepcopy(report);v=d[key];d[key]=(not v) if isinstance(v,bool) else (v+1 if isinstance(v,int) else (v+["x"] if isinstance(v,list) else "wrong"));q=Path(td)/(key+".json");q.write_text(json.dumps(d,sort_keys=True));check("activation-negative:"+key,bool(validate_independent_report(d,q,sha(q),cid)))
        check("activation-hash-drift",bool(validate_independent_report(report,p,"0"*64,cid)))
    failed=sorted(k for k,v in tests.items() if not v);out={"schema_version":"cross-domain-seam-window-v2-tests-v1","status":"pass" if not failed else "fail","counts":{"total":len(tests),"passed":len(tests)-len(failed),"failed":len(failed)},"failed_tests":failed,"test_digest":digest(tests)};print(json.dumps(out,indent=2,sort_keys=True));raise SystemExit(0 if not failed else 1)
if __name__=="__main__":main()
