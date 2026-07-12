#!/usr/bin/env python3
"""Capture the settled 15-file live-head delta and prepare only bounded semantic packets."""
from __future__ import annotations
import difflib, hashlib, json, os, pathlib, re, subprocess
from typing import Any

AUDIT=pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
REPO=pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster"); HERE=pathlib.Path(__file__).resolve().parent
SEMANTIC=["Plans/Planning_Wizard.md","Plans/PRD_Builder.md","Plans/FinalGUISpec.md"]
DERIVED=["Plans/.implementation_readiness/buildability_gate_report.json","Plans/.implementation_readiness/pnc019_certification_receipt.json","Plans/.plan_index/acceptance_units.jsonl","Plans/.plan_index/coverage_report.json","Plans/.plan_index/dependencies.json","Plans/.plan_index/doc_cards.json","Plans/.plan_index/node_readiness_report.json","Plans/.plan_index/plan_units.jsonl","Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl","Plans/.plan_migration/pds-20260611-002-atomize-planunits/final_validation_summary.json","Plans/Spec_Lock.json","Plans/auto_decisions.jsonl"]
BASELINE={"Plans/Planning_Wizard.md":"a4f61959f82a4fcde5872a40f7d92b8172fd609257017496f8c3945dcc992686","Plans/PRD_Builder.md":"743f16817fd9079fc6d3d39bf8691ef331aa512661ef9a68eb932d725484b2a2","Plans/FinalGUISpec.md":"2ffdc9eb454f3c3bdda9d76c2c1e073e4bbb4e1cc401fd9eb91106f07301aeb5"}
LIVE={"Plans/.implementation_readiness/buildability_gate_report.json":"3fdbbf095642af4f00da3029c8e0e1f968a5dc1a939132857fc03f88aec44533","Plans/.implementation_readiness/pnc019_certification_receipt.json":"8441b81e28e3e09b4ddd4f1b09a3d0329df33b1f8e4a49a5deb328a1ea2cd41d","Plans/.plan_index/acceptance_units.jsonl":"6dccfcf163e1f4cff2c6edc9fee9dc81e20d1053efcaee23e94c13293eeb4485","Plans/.plan_index/coverage_report.json":"c6c1fe2d5162aed1b29e7bd42c31ed331dae3443ce7a54c4b60a9441e479d933","Plans/.plan_index/dependencies.json":"72e168db14c1301afa8eb48f54c11ed99f2e38807ed4dee0dde6efc1d17f4160","Plans/.plan_index/doc_cards.json":"b737d906836e6f2f57e1daf832c2fc9df64d82a268fefb8280700e9885dc6f6b","Plans/.plan_index/node_readiness_report.json":"ee85227c4f012d12c1c56b978a056e1d55e95e5ec05bdb89b27805c15be89e99","Plans/.plan_index/plan_units.jsonl":"68895ff03ad551886d8d05662db9875b46730784f0630aaa62f0d234b66990c0","Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl":"9a98589203e851b9920878fa390aac19014a4d0d4b62b8e4d6d43ee0306d6385","Plans/.plan_migration/pds-20260611-002-atomize-planunits/final_validation_summary.json":"39637a91fcfa8df02162ad8c8855d7fcdec198ed4eb525c76b459fbbdd7e3837","Plans/FinalGUISpec.md":"0c52e700714839fefab1f760a7aca55bbb0e19ab2792961fca22bdb4996286ed","Plans/PRD_Builder.md":"27dacbbe7a1bcad074c650e89c8411bf044858dcacfeb0236b7b9492a590cbda","Plans/Planning_Wizard.md":"fee6e23abff2aafb251f978165fdf014bcfe9a9beba3d805857ddf4212000ec0","Plans/Spec_Lock.json":"91ceb0b84346e06aa77a9ca7e76733084171803bd4481920f4e73ddbf650b2d3","Plans/auto_decisions.jsonl":"912d0afbf3a8491a7b17513ef2bceb6551daba3fae97eb78892649e24102f57d"}
SOURCE_SCOPE=AUDIT/"master/macro/frozen/epoch-0016/manifests/source_scope.jsonl"; SOURCE_SCOPE_SHA="25027060861687c5a8e45024844d9de9e6c0a38f68a9470f2a84cb1774b86015"
PACKET_CEILING=750000
def sha_bytes(b:bytes)->str:return hashlib.sha256(b).hexdigest()
def sha(p:pathlib.Path)->str:return sha_bytes(p.read_bytes())
def canon(v:Any)->bytes:return (json.dumps(v,sort_keys=True,separators=(",",":"),ensure_ascii=False)+"\n").encode()
def write(path:pathlib.Path,data:bytes):path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
def baseline(path:str)->bytes:return subprocess.run(["git","show",f"HEAD:{path}"],cwd=REPO,capture_output=True,check=True).stdout
def dump(path:pathlib.Path,v:Any):write(path,canon(v))
def jsonl(path:pathlib.Path,rows:list[dict[str,Any]]):write(path,b"".join(canon(r) for r in rows))
def planunits(lines:list[str])->list[str]:return sorted(set(re.findall(r"\b(?:PWIZ|PRDB|F3)-\d{3}\b","\n".join(lines))))

def merged_ranges(opcodes,total_a,total_b,context=60):
 raw=[]
 for tag,a0,a1,b0,b1 in opcodes:
  if tag!="equal":raw.append([max(0,a0-context),min(total_a,a1+context),max(0,b0-context),min(total_b,b1+context)])
 merged=[]
 for r in raw:
  if merged and (r[0]<=merged[-1][1] or r[2]<=merged[-1][3]):
   merged[-1]=[min(merged[-1][0],r[0]),max(merged[-1][1],r[1]),min(merged[-1][2],r[2]),max(merged[-1][3],r[3])]
  else:merged.append(r)
 return merged

def main():
 if HERE.joinpath("authority.json").exists():raise SystemExit("refusing overwrite")
 if sha(SOURCE_SCOPE)!=SOURCE_SCOPE_SHA:raise SystemExit("source-scope-drift")
 for p,h in LIVE.items():
  if sha(REPO/p)!=h:raise SystemExit("live-drift:"+p)
 scope={r["path"]:r for r in [json.loads(x) for x in SOURCE_SCOPE.read_text().splitlines() if x.strip()]}
 snapshots=[]; windows=[]; packets=[]; manifest=[]; registry=[]; joins=[]
 derived_rows=[]
 for path in DERIVED:
  raw=(REPO/path).read_bytes(); head=baseline(path); derived_rows.append({"path":path,"role":"derived_integrity_join_evidence","baseline_sha256":sha_bytes(head),"candidate_sha256":sha_bytes(raw),"candidate_bytes":len(raw),"candidate_mtime_ns":(REPO/path).stat().st_mtime_ns,"changed":head!=raw})
 for index,path in enumerate(SEMANTIC,1):
  head=baseline(path); live=(REPO/path).read_bytes()
  if sha_bytes(head)!=BASELINE[path] or sha_bytes(live)!=LIVE[path]:raise SystemExit("semantic-drift:"+path)
  bpath=HERE/"snapshots/baseline"/path;cpath=HERE/"snapshots/candidate"/path;write(bpath,head);write(cpath,live)
  a=head.decode().splitlines();b=live.decode().splitlines();ops=difflib.SequenceMatcher(a=a,b=b,autojunk=False).get_opcodes(); changed=[o for o in ops if o[0]!="equal"]
  ranges=merged_ranges(changed,len(a),len(b)); doc_windows=[]
  for wi,(a0,a1,b0,b1) in enumerate(ranges,1):
   wid=f"FLHD-WIN-{index:02d}-{wi:03d}"; w={"window_id":wid,"document_path":path,"baseline_line_start":a0+1,"baseline_line_end":a1,"candidate_line_start":b0+1,"candidate_line_end":b1,"baseline_lines":[f"B{n:08d}\t{a[n-1]}" for n in range(a0+1,a1+1)],"candidate_lines":[f"L{n:08d}\t{b[n-1]}" for n in range(b0+1,b1+1)],"affected_plan_unit_ids":planunits(a[a0:a1]+b[b0:b1])}
   w["window_sha256"]=sha_bytes(canon({k:v for k,v in w.items() if k!="window_sha256"}));windows.append(w);doc_windows.append(w)
  aid=f"A005FLHD-{index:04d}"; pid=f"FLHDPKT-{index:04d}"; packet={"schema_version":"final-live-head-delta-packet-v1","audit_id":"audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive","transaction_id":"final-live-head-delta-0001","assignment_id":aid,"packet_id":pid,"document_path":path,"baseline_source_sha256":BASELINE[path],"candidate_source_sha256":LIVE[path],"source_scope_row":scope[path],"changed_opcode_count":len(changed),"window_count":len(doc_windows),"window_ids":[w["window_id"] for w in doc_windows],"windows":doc_windows,"affected_plan_unit_ids":sorted(set(x for w in doc_windows for x in w["affected_plan_unit_ids"])),"derived_join_evidence":derived_rows,"semantic_scope_rule":"review only changed/new semantic windows and affected joins; derived artifacts are evidence, not prose assignments","credit_before_independent_checkpoint":0}
  pp=HERE/f"packets/{pid}.json";dump(pp,packet);size=pp.stat().st_size
  if size>PACKET_CEILING:raise SystemExit("packet-ceiling:"+pid)
  ph=sha(pp);output=AUDIT/f"final_live_head_delta_v1/{aid}/attempts/attempt-0001";output.mkdir(parents=True,exist_ok=True)
  intent={"schema_version":"final-live-head-delta-dispatch-intent-v1","assignment_id":aid,"attempt_id":"attempt-0001","model":"gpt-5.6-sol","reasoning_effort":"xhigh","prospective_agent_path":f"/root/a005_final_live_head_delta_{index:04d}_attempt_0001_terminal","packet_ref":str(pp),"packet_sha256":ph,"result_schema_ref":str(HERE/"result.schema.json"),"output_directory":str(output),"receipt_ref":str(HERE/f"dispatch/{aid}/attempt-0001/dispatch_receipt.json"),"activation_granted":False,"fork_turns":"none","descendants_forbidden":True,"followups_forbidden":True}
  ip=HERE/f"dispatch/{aid}/attempt-0001/dispatch_intent.json";dump(ip,intent)
  row={"assignment_id":aid,"packet_id":pid,"document_path":path,"window_ids":packet["window_ids"],"window_count":len(doc_windows),"affected_plan_unit_ids":packet["affected_plan_unit_ids"],"packet_ref":str(pp),"packet_sha256":ph,"packet_bytes":size,"intent_ref":str(ip),"intent_sha256":sha(ip),"output_directory":str(output),"prospective_agent_path":intent["prospective_agent_path"],"model":"gpt-5.6-sol","reasoning_effort":"xhigh"};manifest.append(row);registry.append({k:row[k] for k in ("assignment_id","packet_id","packet_ref","packet_sha256","packet_bytes","window_ids")});packets.append(packet)
  joins.append({"document_path":path,"assignment_id":aid,"affected_plan_unit_ids":packet["affected_plan_unit_ids"],"derived_evidence_paths":[r["path"] for r in derived_rows],"join_role":"integrity_and_affected_owner_mapping_only"})
  snapshots.append({"path":path,"role":"canonical_semantic_delta_source","baseline_sha256":BASELINE[path],"candidate_sha256":LIVE[path],"baseline_bytes":len(head),"candidate_bytes":len(live),"candidate_mtime_ns":(REPO/path).stat().st_mtime_ns,"changed":head!=live,"frozen_source_scope_sha256":scope[path]["source_sha256"]})
 snapshots+=derived_rows;jsonl(HERE/"snapshot_manifest.jsonl",snapshots);jsonl(HERE/"changed_windows.jsonl",windows);jsonl(HERE/"assignment_manifest.jsonl",manifest);jsonl(HERE/"packet_registry.jsonl",registry);jsonl(HERE/"join_manifest.jsonl",joins)
 schema={"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","additionalProperties":False,"required":["assignment_id","status","window_reviews","credit"],"properties":{"assignment_id":{"enum":[r["assignment_id"] for r in manifest]},"status":{"enum":["completed","blocked_insufficient_evidence"]},"window_reviews":{"type":"array","minItems":1,"items":{"type":"object","additionalProperties":False,"required":["window_id","disposition","findings","join_impacts"],"properties":{"window_id":{"type":"string"},"disposition":{"enum":["no_gap","gap_confirmed","contradiction","unknown"]},"findings":{"type":"array","items":{"type":"string"}},"join_impacts":{"type":"array","items":{"type":"string"}}}}},"credit":{"const":0}}};dump(HERE/"result.schema.json",schema)
 prompt={"schema_version":"final-live-head-delta-leaf-prompt-v1","prompt":"Review only the assigned changed/new semantic windows against the exact frozen baseline excerpts. Treat the 12 derived files solely as hash-bound integrity/join evidence. Cover every window and affected PlanUnit join, preserve uncertainty, make no canonical edits, write one strict result.json, spawn no descendants, accept no follow-up, and return exactly PMR1."};dump(HERE/"leaf_prompt.json",prompt)
 authority={"schema_version":"final-live-head-delta-authority-v1","status":"BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_DELTA_PRELAUNCH","audit_id":"audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive","transaction_id":"final-live-head-delta-0001","baseline":{"source_scope_ref":str(SOURCE_SCOPE),"source_scope_sha256":SOURCE_SCOPE_SHA,"git_head_matches_frozen_semantic_hashes":True},"scope":{"modified_files":15,"semantic_files":SEMANTIC,"derived_evidence_files":DERIVED,"assignment_count":len(manifest),"window_count":len(windows),"packet_ceiling_bytes":PACKET_CEILING},"hashes":{"snapshot_manifest":sha(HERE/"snapshot_manifest.jsonl"),"changed_windows":sha(HERE/"changed_windows.jsonl"),"assignment_manifest":sha(HERE/"assignment_manifest.jsonl"),"packet_registry":sha(HERE/"packet_registry.jsonl"),"join_manifest":sha(HERE/"join_manifest.jsonl"),"result_schema":sha(HERE/"result.schema.json"),"leaf_prompt":sha(HERE/"leaf_prompt.json"),"preparation_script":sha(pathlib.Path(__file__)),"verifier":sha(HERE/"verify_final_live_head_delta_0001.py"),"tests":sha(HERE/"test_final_live_head_delta_0001.py")},"policies":{"concurrent_change_sha256":"b227f14a04aae9ddce62440002af2c76528a1433c4e440df613490865f9f444e","v25_sha256":"f2e0cd20f5612b8d6fa1d1946ee03f15b3f26138a38189a410926f4f69f0f63b","v26_sha256":"dc8b6856705325223b70822d31f28abe0ef32e6153f57d4fea924b4eaf0dba68"},"zero_state":{"activation":0,"results":0,"receipts":0,"capture":0,"credit":0},"launch_authorized":False};dump(HERE/"authority.json",authority)
 dump(HERE/"local-prelaunch-candidate.json",{"status":authority["status"],"authority_sha256":sha(HERE/"authority.json"),"modified_files":15,"assignments":len(manifest),"windows":len(windows),"packet_bytes_min":min(r["packet_bytes"] for r in manifest),"packet_bytes_max":max(r["packet_bytes"] for r in manifest),"empty_outputs":len(manifest),"credit":0})
 print(json.dumps(load_summary(),indent=2,sort_keys=True))
def load_summary():
 a=json.loads((HERE/"authority.json").read_text());m=[json.loads(x) for x in (HERE/"assignment_manifest.jsonl").read_text().splitlines() if x];return {"status":a["status"],"authority_sha256":sha(HERE/"authority.json"),"assignments":len(m),"windows":a["scope"]["window_count"],"packet_bytes":[r["packet_bytes"] for r in m]}
if __name__=="__main__":main()
