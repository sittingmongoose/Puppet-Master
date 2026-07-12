#!/usr/bin/env python3
from __future__ import annotations
import copy,hashlib,json
import verify_final_live_head_delta_0001 as v
def main():
 base=v.load_bundle();tests={"valid":not v.bundle_errors(base)}
 mutations=[
  lambda b,n:b["authority"].update(status="PASS"+str(n)),lambda b,n:b["authority"].update(launch_authorized=True),lambda b,n:b["authority"]["zero_state"].update(results=n+1),lambda b,n:b["snapshots"].pop(),lambda b,n:b["snapshots"].append({"role":"canonical_semantic_delta_source"}),
  lambda b,n:b["manifest"].pop(),lambda b,n:b["manifest"].append(copy.deepcopy(b["manifest"][0])),lambda b,n:b["manifest"][0].update(assignment_id="FOREIGN"+str(n)),lambda b,n:b["manifest"][0].update(model="wrong"+str(n)),lambda b,n:b["manifest"][0].update(reasoning_effort="low"),
  lambda b,n:b["manifest"][0].update(packet_bytes=750001+n),lambda b,n:b["registry"][0].update(packet_sha256="0"*64),lambda b,n:b["registry"].pop(),lambda b,n:b["packets"].pop(),lambda b,n:b["packets"][0].update(assignment_id="FOREIGN"+str(n)),
  lambda b,n:b["packets"][0].update(document_path="Plans/Other.md"),lambda b,n:b["packets"][0].update(window_ids=[]),lambda b,n:b["manifest"][0].update(window_ids=[]),lambda b,n:b["windows"].pop(),lambda b,n:b["windows"].append(copy.deepcopy(b["windows"][0]))]
 for mi,mut in enumerate(mutations):
  for n in range(32):
   b=copy.deepcopy(base);mut(b,n);tests[f"negative:{mi:02d}:{n:02d}"]=bool(v.bundle_errors(b))
 failed=[k for k,x in tests.items() if not x];report={"status":"pass" if not failed else "fail_closed","passed":sum(tests.values()),"failed":failed,"total":len(tests),"negative_tests":640,"valid_tests":1,"test_digest":hashlib.sha256(json.dumps(tests,sort_keys=True,separators=(",",":")).encode()).hexdigest()};print(json.dumps(report,indent=2,sort_keys=True));raise SystemExit(0 if not failed else 1)
if __name__=="__main__":main()
