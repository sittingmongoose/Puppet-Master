#!/usr/bin/env python3
"""Frozen PW-R4 .2 renderer, deterministic transformer, and read-only verifier."""
from __future__ import annotations
import argparse, hashlib, json, os, stat, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent
REPO=Path("/mnt/Cursor/PuppetMaster")
ID="PW-R4-CAUSAL-20260813.2"
STATIC=("S10A","S10B","S30A","S30B","S40A","S40B","S50","S60P","S60C","S60K","S70")
SUBJECT=STATIC+("S90",)
def sha(b): return hashlib.sha256(b).hexdigest()
def raw(path): return path.read_bytes()
def payload(path):
 d=raw(path)
 if not d.endswith(b"\n"): raise ValueError(f"{path}: storage LF")
 return d.rstrip(b"\n")
def canon(b,label):
 try: o=json.loads(b.decode())
 except Exception as e: raise ValueError(f"{label}: JSON {e}")
 if json.dumps(o,ensure_ascii=False,separators=(",",":")).encode()!=b: raise ValueError(f"{label}: noncanonical")
 return o
def subst(template:str, values:dict[str,str])->str:
 out=template
 for k,v in values.items():
  token="{{"+k+"}}"
  count=out.count(token)
  if count>1: raise ValueError(f"token {token} duplicate")
  if count==1: out=out.replace(token,v)
 if "{{" in out or "}}" in out: raise ValueError("unresolved token")
 return out
def oracle(stage): return payload(ROOT/"oracle_artifacts"/f"{stage}.json")
def load_capture(path):
 p=Path(path).resolve(); rr=(ROOT/"runs").resolve()
 if rr not in p.parents: raise ValueError("capture outside runs")
 b=raw(p); return b,canon(b,"capture")
def capvals(name,path):
 b,o=load_capture(path); return {f"{name}_RAW":b.decode(),f"{name}_SHA256":sha(b),f"{name}_BYTES":str(len(b))},o
def basevals():
 a=raw(ROOT/"topic_a_capsule.json");b=raw(ROOT/"topic_b_capsule.json")
 return {"TOPIC_A_CAPSULE_RAW":a.decode(),"TOPIC_A_CAPSULE_SHA256":sha(a),"TOPIC_A_CAPSULE_BYTES":str(len(a)),
 "TOPIC_B_CAPSULE_RAW":b.decode(),"TOPIC_B_CAPSULE_SHA256":sha(b),"TOPIC_B_CAPSULE_BYTES":str(len(b)),
 "INTEGRATION_CONTRACT_RAW":raw(ROOT/"integration_contract.json").decode().rstrip("\n")}
def render(stage,args):
 vals=basevals()
 deps={"S30A":["S20A"],"S30B":["S20B"],"S40A":["S20A","S30A"],"S40B":["S20B","S30B"],
 "S50":["S45A","S45B"],"S70":["S55","S60P","S60C","S60K"]}
 for dep in deps.get(stage,[]):
  v,_=capvals(dep,getattr(args,dep.lower())); vals.update(v)
 if stage.startswith("S60"):
  sp=subst(raw(ROOT/"specialist_packet_template.txt").decode().rstrip("\n"),{
   **{k:vals[k] for k in ("TOPIC_A_CAPSULE_RAW","TOPIC_A_CAPSULE_SHA256","TOPIC_A_CAPSULE_BYTES","TOPIC_B_CAPSULE_RAW","TOPIC_B_CAPSULE_SHA256","TOPIC_B_CAPSULE_BYTES")},
   **capvals("S55",args.s55)[0]})
  vals.update({"SPECIALIST_PACKET_RAW":sp,"SPECIALIST_PACKET_SHA256":sha(sp.encode()),"SPECIALIST_PACKET_BYTES":str(len(sp.encode()))})
 if stage=="S90":
  chain=[]
  for name in ("S10A","S10B","S20A","S20B","S30A","S30B","S40A","S40B","S45A","S45B","S50","S55","S60P","S60C","S60K","S70","S80"):
   b,_=load_capture(getattr(args,name.lower()));chain.append(f"ARTIFACT={name} SHA256={sha(b)} BYTES={len(b)}\nBEGIN_{name}_RAW\n{b.decode()}\nEND_{name}_RAW")
  wb,_=load_capture(args.write_receipt)
  line={"protocol_id":ID,"slot":args.slot,"artifacts":[{"stage":name,"sha256":sha(load_capture(getattr(args,name.lower()))[0])} for name in ("S10A","S10B","S20A","S20B","S30A","S30B","S40A","S40B","S45A","S45B","S50","S55","S60P","S60C","S60K","S70","S80")],"write_receipt_sha256":sha(wb),"edges":[["S10A","S20A"],["S10B","S20B"],["S20A","S30A"],["S20B","S30B"],["S30A","S40A"],["S30B","S40B"],["S40A","S45A"],["S40B","S45B"],["S45A","S50"],["S45B","S50"],["S50","S55"],["S55","S60P"],["S55","S60C"],["S55","S60K"],["S60P","S70"],["S60C","S70"],["S60K","S70"],["S70","S80"],["S80","S90"]]}
  lr=json.dumps(line,separators=(",",":"))
  vals.update({"RUNTIME_LINEAGE_RAW":lr,"RUNTIME_LINEAGE_SHA256":sha(lr.encode()),"COMPLETE_RAW_ARTIFACT_CHAIN":"\n".join(chain),"WRITE_RECEIPT_RAW":wb.decode(),"WRITE_RECEIPT_SHA256":sha(wb)})
 t=raw(ROOT/"templates"/f"{stage}.txt").decode().rstrip("\n")
 return subst(t,vals).encode()
def apply_topic(cand,patch):
 x=json.loads(json.dumps(cand))
 for op in patch:
  parts=op["path"].split("/")
  if len(parts)!=4 or parts[1]!="decisions" or parts[3]!="choice": raise ValueError("topic patch path")
  i=int(parts[2])
  if op["op"]=="test":
   if x["decisions"][i]["choice"]!=op["value"]: raise ValueError("topic test")
  elif op["op"]=="replace": x["decisions"][i]["choice"]=op["value"]
  else: raise ValueError("topic op")
 return x
def transform(stage,args):
 if stage in ("S20A","S20B"):
  src_name="S10A" if stage=="S20A" else "S10B"; b,x=load_capture(getattr(args,src_name.lower()))
  idx,choice=(15,"canonical_runtime_enforced") if stage=="S20A" else (14,"executed_fixture_pass")
  out={"protocol_id":ID,"stage":stage,"topic_id":x["topic_id"],"source_capsule_sha256":x["source_capsule_sha256"],"source_capsule_bytes":x["source_capsule_bytes"],"base_artifact_sha256":sha(b),"decisions":x["decisions"],"supported_edge_ids":x["supported_edge_ids"],"selected_tension_ids":x["selected_tension_ids"],"claim_boundary":x["claim_boundary"],"external_audit_status":x["external_audit_status"],"forbidden_action_violations":x["forbidden_action_violations"]}
  out["decisions"][idx]["choice"]=choice
 elif stage in ("S45A","S45B"):
  lane=stage[-1]; cb,c=load_capture(getattr(args,f"s20{lane.lower()}"));ab,a=load_capture(getattr(args,f"s30{lane.lower()}"));pb,p=load_capture(getattr(args,f"s40{lane.lower()}"))
  repaired=apply_topic(c,p["patch"]);rp=json.dumps(repaired,separators=(",",":")).encode()
  if p["candidate_artifact_sha256"]!=sha(cb) or p["audit_artifact_sha256"]!=sha(ab): raise ValueError("S45 binding")
  out={"protocol_id":ID,"stage":stage,"candidate_artifact_sha256":sha(cb),"audit_artifact_sha256":sha(ab),"patch_artifact_sha256":sha(pb),"repaired_payload_sha256":sha(rp),"repaired_payload_bytes":len(rp),"repaired_payload":repaired,"closed_finding_ids":p["addressed_finding_ids"],"claim_boundary":"deterministic_topic_patch_application","external_audit_status":"excluded"}
 elif stage=="S55":
  b,x=load_capture(args.s50);out=x;out["cross_topic_edges"].append({"id":"I-E99","from":"A14","to":"B12","type":"requires","statement":"BSD Off is required for bootstrap Plan Compile authority."})
 elif stage=="S80":
  cb,c=load_capture(args.s55);rb,r=load_capture(args.s70);fb,f=load_capture(args.s50)
  if r["integration_candidate_sha256"]!=sha(cb): raise ValueError("S80 reducer binding")
  out=json.loads(json.dumps(c))
  for op in r["patch"]:
   if op["path"]!="/cross_topic_edges/6"+("/id" if op["op"]=="test" else ""): raise ValueError("S80 path")
   if op["op"]=="test":
    if out["cross_topic_edges"][6]["id"]!=op["value"]: raise ValueError("S80 test")
   elif op["op"]=="remove": out["cross_topic_edges"].pop(6)
   else: raise ValueError("S80 op")
  if json.dumps(out,separators=(",",":")).encode()!=fb: raise ValueError("S80 did not restore S50")
 else: raise ValueError("unknown transform")
 return json.dumps(out,separators=(",",":")).encode()
def source_check():
 custody=json.loads(raw(ROOT/"source_custody.json"));bad=[]
 for f in custody["corpus_files"]:
  d=raw(REPO/f["path"])
  if sha(d)!=f["sha256"] or len(d)!=f["bytes"]: bad.append(f["path"])
 if bad: raise ValueError("source drift: "+",".join(bad))
 return len(custody["corpus_files"])
def preflight():
 source_count=source_check();schemas=json.loads(raw(ROOT/"schemas.json"))
 detached=json.loads(raw(ROOT.parent/"r4_causal_v2_launch_custody.json"))
 launch=raw(ROOT/"launch_manifest.json")
 if sha(launch)!=detached["launch_manifest_sha256"] or len(launch)!=detached["launch_manifest_bytes"]: raise ValueError("detached launch custody")
 manifest=json.loads(launch)
 for f in manifest["immutable_files"]:
  d=raw(ROOT/f["path"])
  if sha(d)!=f["sha256"] or len(d)!=f["bytes"]: raise ValueError("immutable drift: "+f["path"])
 for s in STATIC:
  b=oracle(s);canon(b,s);e=schemas["static_expected"][s]
  if sha(b)!=e["sha256"] or len(b)!=e["bytes"]: raise ValueError(f"{s} oracle")
 for p in ("protocol.json","execution_contract.json","source_custody.json","schemas.json","topic_a_capsule.json","topic_b_capsule.json","scorer_key.json","integration_contract.json"):
  if json.loads(raw(ROOT/p))["protocol_id"]!=ID: raise ValueError(p+" ID")
 return {"protocol_id":ID,"status":"PASS","sources_checked":source_count,"static_oracles_checked":len(STATIC),"immutable_files_checked":len(manifest["immutable_files"]),"detached_launch_custody":True}
def score(stage,capture):
 actual,_=load_capture(capture);expected=oracle(stage)
 return {"protocol_id":ID,"stage":stage,"actual_sha256":sha(actual),"expected_sha256":sha(expected),"exact":actual==expected,"verdict":"PASS" if actual==expected else "FAIL"}
def main():
 p=argparse.ArgumentParser();sub=p.add_subparsers(dest="cmd",required=True);sub.add_parser("preflight")
 r=sub.add_parser("render");r.add_argument("--stage",required=True,choices=SUBJECT);r.add_argument("--output")
 t=sub.add_parser("transform");t.add_argument("--stage",required=True,choices=("S20A","S20B","S45A","S45B","S55","S80"));t.add_argument("--output")
 s=sub.add_parser("score");s.add_argument("--stage",required=True,choices=STATIC);s.add_argument("--capture",required=True)
 for q in (r,t):
  for n in ("s10a","s10b","s20a","s20b","s30a","s30b","s40a","s40b","s45a","s45b","s50","s55","s60p","s60c","s60k","s70","s80","write_receipt"):q.add_argument("--"+n.replace("_","-"))
 r.add_argument("--slot")
 a=p.parse_args()
 try:
  if a.cmd=="preflight": out=json.dumps(preflight(),separators=(",",":")).encode()
  elif a.cmd=="score": out=json.dumps(score(a.stage,a.capture),separators=(",",":")).encode()
  elif a.cmd=="render": out=render(a.stage,a)
  else: out=transform(a.stage,a)
  if getattr(a,"output",None):
   print(json.dumps({"status":"READY_FOR_APPLY_PATCH","bytes":len(out),"sha256":sha(out),"output":a.output,"payload":out.decode()},separators=(",",":")))
  else: sys.stdout.buffer.write(out+b"\n")
  return 0
 except Exception as e:
  print(json.dumps({"protocol_id":ID,"status":"INVALID","error":str(e)},separators=(",",":")));return 2
if __name__=="__main__": raise SystemExit(main())
