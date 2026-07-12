#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,pathlib,subprocess
HERE=pathlib.Path(__file__).resolve().parent;REPO=pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def rows(name):return [json.loads(x) for x in (HERE/name).read_text().splitlines() if x.strip()]
def bundle_errors(bundle):
 e=[];a=bundle["authority"];m=bundle["manifest"];r=bundle["registry"];w=bundle["windows"];s=bundle["snapshots"];p=bundle["packets"]
 if a.get("status")!="BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_DELTA_PRELAUNCH":e.append("status")
 if a.get("launch_authorized") is not False or any(a.get("zero_state",{}).values()):e.append("zero-state")
 if len(s)!=15 or len([x for x in s if x.get("role")=="canonical_semantic_delta_source"])!=3:e.append("snapshot-scope")
 if len(m)!=3 or [x.get("assignment_id") for x in m]!=[f"A005FLHD-{i:04d}" for i in range(1,4)]:e.append("assignments")
 if len(r)!=3 or len(p)!=3:e.append("packet-count")
 mids=[x for row in m for x in row.get("window_ids",[])];wids=[x.get("window_id") for x in w]
 if sorted(mids)!=sorted(wids) or len(mids)!=len(set(mids)):e.append("window-coverage")
 reg={x.get("assignment_id"):x for x in r}
 for row,packet in zip(m,p):
  aid=row.get("assignment_id");rr=reg.get(aid,{})
  if row.get("model")!="gpt-5.6-sol" or row.get("reasoning_effort")!="xhigh":e.append("lane:"+str(aid))
  if row.get("packet_bytes",999999)>750000 or rr.get("packet_sha256")!=row.get("packet_sha256"):e.append("packet-binding:"+str(aid))
  if packet.get("assignment_id")!=aid or packet.get("window_ids")!=row.get("window_ids"):e.append("packet-membership:"+str(aid))
  if packet.get("document_path") not in ["Plans/Planning_Wizard.md","Plans/PRD_Builder.md","Plans/FinalGUISpec.md"]:e.append("foreign-doc:"+str(aid))
 return sorted(set(e))
def load_bundle():
 return {"authority":json.load(open(HERE/"authority.json")),"manifest":rows("assignment_manifest.jsonl"),"registry":rows("packet_registry.jsonl"),"windows":rows("changed_windows.jsonl"),"snapshots":rows("snapshot_manifest.jsonl"),"packets":[json.load(open(x["packet_ref"])) for x in rows("assignment_manifest.jsonl")]}
def main():
 b=load_bundle();e=bundle_errors(b);a=b["authority"]
 for name,h in a["hashes"].items():
  mp={"snapshot_manifest":"snapshot_manifest.jsonl","changed_windows":"changed_windows.jsonl","assignment_manifest":"assignment_manifest.jsonl","packet_registry":"packet_registry.jsonl","join_manifest":"join_manifest.jsonl","result_schema":"result.schema.json","leaf_prompt":"leaf_prompt.json","preparation_script":"prepare_final_live_head_delta_0001.py","verifier":"verify_final_live_head_delta_0001.py","tests":"test_final_live_head_delta_0001.py"}
  if sha(HERE/mp[name])!=h:e.append("hash:"+name)
 for row in b["snapshots"]:
  live=REPO/row["path"]
  if sha(live)!=row["candidate_sha256"]:e.append("live-drift:"+row["path"])
 for row in b["manifest"]:
  if any(pathlib.Path(row["output_directory"]).iterdir()):e.append("output-nonempty:"+row["assignment_id"])
  if pathlib.Path(row["intent_ref"]).with_name("dispatch_receipt.json").exists():e.append("receipt-present:"+row["assignment_id"])
 report={"status":"pass" if not e else "fail_closed","errors":sorted(set(e)),"counts":{"modified_files":15,"semantic_files":3,"derived_files":12,"assignments":len(b["manifest"]),"windows":len(b["windows"]),"empty_outputs":sum(not any(pathlib.Path(x["output_directory"]).iterdir()) for x in b["manifest"])},"packet_bytes":[x["packet_bytes"] for x in b["manifest"]],"credit":0,"launch_authorized":False};print(json.dumps(report,indent=2,sort_keys=True));raise SystemExit(0 if report["status"]=="pass" else 1)
if __name__=="__main__":main()
