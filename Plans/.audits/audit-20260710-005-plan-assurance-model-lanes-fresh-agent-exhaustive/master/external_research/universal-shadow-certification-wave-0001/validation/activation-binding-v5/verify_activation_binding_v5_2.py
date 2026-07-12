#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;WAVE=BASE.parents[1];AUDIT=BASE.parents[4]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def require(x,m):
 if not x:raise RuntimeError(m)
def validate_exact(value,baseline,label):require(value==baseline,label+'-drift')
def verify():
 e=[]
 try:
  h=rows(BASE/'historical-byte-manifest-v5.jsonl');c=rows(BASE/'current-candidate-byte-manifest-v5.jsonl');require(len(h)==53 and len(c)==33,'manifest-count')
  for label,rr in [('historical',h),('candidate',c)]:
   require(len({x['path'] for x in rr})==len(rr),label+'-duplicate')
   for x in rr:
    p=AUDIT/x['path'];require(p.is_file() and not p.is_symlink(),label+'-file');require(sha(p)==x['sha256'] and p.stat().st_size==x['size'],label+'-bytes')
  a=json.loads((BASE/'authority-v5.json').read_text());require(a['status']=='BLOCKED_AWAITING_FRESH_LUNA_PRELAUNCH_V5','authority-status');require(a['historical_scope']['manifest_sha256']==sha(BASE/'historical-byte-manifest-v5.jsonl'),'history-manifest');require(a['current_candidate_scope']['manifest_sha256']==sha(BASE/'current-candidate-byte-manifest-v5.jsonl'),'candidate-manifest')
  require(sha(WAVE/'validation/activation-binding-v3/luna-independent-prelaunch-v3.json')=='c6da2d69cb2950ec2ed1cfbcfa80900af3c317daae0e660f2b4dd6c4868dddb5','v3-failure');require(sha(WAVE/'validation/activation-binding-v4/luna-independent-prelaunch-v4.json')=='9c3927dd6d36e8552209a74fbb0adf085f302aef2c0486b4ab2cc7caea28ca82','v4-failure')
  m=rows(WAVE/'batch_manifest.jsonl');require(len(m)==16,'assignments')
  for x in m:
   out=Path(x['output_directory']);require(out.is_dir() and not any(out.iterdir()),'output-nonempty');intent=json.loads(Path(x['intent_ref']).read_text());require(not Path(intent['dispatch_receipt_ref']).exists(),'receipt-present')
  require(not any((WAVE/n).exists() for n in ('activation.json','activation-v2.json','activation-v3.json','activation-v4.json','activation-v5.json')),'activation-present')
 except Exception as ex:e.append(f'{type(ex).__name__}: {ex}')
 return {'schema_version':'activation-binding-v5.2-verifier-report','status':'pass' if not e else 'fail','errors':e,'historical_files':53,'candidate_files':33,'assignments':16,'features':3888,'outputs_empty':16,'activation_authorized':False,'credits':0}
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass' else 1)
