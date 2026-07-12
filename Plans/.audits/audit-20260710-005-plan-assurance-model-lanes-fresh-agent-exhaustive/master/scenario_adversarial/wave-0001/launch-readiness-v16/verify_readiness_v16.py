#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;W=BASE.parent;AUDIT=BASE.parents[3]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def verify():
 e=[]
 try:
  a=json.loads((BASE/'authority.json').read_text());refs=[];paths=[]
  if sha(AUDIT/'master/coordination/CONCURRENCY_POLICY_V16.json')!=a['concurrency_policy_v16_sha256'] or sha(W/'validation/luna-prelaunch.json')!=a['full_wave_luna_prelaunch_sha256']:e.append('policy-or-luna')
  for n,c in enumerate(a['cohorts'],1):
   cid=f'cohort-{n:04d}';rr=rows(W/f'cohorts/{cid}/cohort_manifest.jsonl')
   if len(rr)!=8 or [x['assignment_id'] for x in rr]!=c['assignments']:e.append(cid+':membership')
   for x in rr:
    refs+=x['feature_refs'];paths.append(x['prospective_agent_path']);out=Path(x['output_directory']);packet=Path(x['packet_ref']);packet=packet if packet.is_absolute() else W/packet
    if not out.is_dir() or any(out.iterdir()) or sha(packet)!=x['packet_sha256']:e.append(cid+':zero-or-packet')
  if len(refs)!=1640 or len(set(refs))!=1640 or len(paths)!=16 or len(set(paths))!=16:e.append('union')
  if a['atomic_cap']!=8 or not a['atomic16_forbidden'] or a['future_research_checkpoint_contract']['checkpoint_sha256'] is not None:e.append('gating')
 except Exception as ex:e.append(f'{type(ex).__name__}:{ex}')
 return {'status':'pass_blocked' if not e else 'fail','errors':e,'assignments':16,'features':1640,'transactions':2,'atomic_size':8,'activation_files':0,'results':0,'receipts':0,'credits':0}
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass_blocked' else 1)
