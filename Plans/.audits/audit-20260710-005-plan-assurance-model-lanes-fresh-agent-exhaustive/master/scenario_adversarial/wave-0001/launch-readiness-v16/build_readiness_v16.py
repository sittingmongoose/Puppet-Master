#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,os
from pathlib import Path
BASE=Path(__file__).resolve().parent;W=BASE.parent;AUDIT=BASE.parents[3]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def digest(v):return hashlib.sha256((json.dumps(v,sort_keys=True,separators=(',',':'))+'\n').encode()).hexdigest()
def write(p,v):
 raw=(json.dumps(v,indent=2,sort_keys=True)+'\n').encode();fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
 with os.fdopen(fd,'wb') as f:f.write(raw)
def main():
 cohorts=[];allrefs=[];allpaths=[]
 for n in (1,2):
  cid=f'cohort-{n:04d}';m=W/f'cohorts/{cid}/cohort_manifest.jsonl';rr=rows(m);refs=[r for x in rr for r in x['feature_refs']];assert len(rr)==8 and len(refs)==len(set(refs))
  for x in rr:
   packet=Path(x['packet_ref']);packet=packet if packet.is_absolute() else W/packet
   assert packet.is_file() and sha(packet)==x['packet_sha256'];out=Path(x['output_directory']);assert out.is_dir() and not any(out.iterdir());assert x['model']=='gpt-5.6-sol' and x['reasoning_effort']=='xhigh' and x['prospective_agent_path'] not in allpaths;allpaths.append(x['prospective_agent_path'])
  prep=W/(f'cohorts/{cid}/activation-preparation-v2-v6-compat' if n==1 else f'cohorts/{cid}/activation-preparation-v1')
  cohorts.append({'cohort_id':cid,'assignments':[x['assignment_id'] for x in rr],'assignment_count':8,'feature_count':len(refs),'feature_digest':digest(sorted(refs)),'manifest_sha256':sha(m),'authority_sha256':sha(W/f'cohorts/{cid}/cohort_authority.json'),'launch_seal_sha256':sha(W/f'cohorts/{cid}/cohort_launch_seal.json'),'preparation_authority_sha256':sha(prep/'CANDIDATE_AUTHORITY.json'),'preparation_readiness_sha256':sha(prep/'readiness.json')});allrefs+=refs
 assert len(allrefs)==1640 and len(set(allrefs))==1640
 a={'schema_version':'scenario-adversarial-v16-launch-readiness-authority','status':'BLOCKED_AWAITING_CROSS_CUTTING_RESEARCH_CHECKPOINT_EXACT8_OF8','concurrency_policy_v16_sha256':'76a0c7b3a3559f18cab4f03e84ddc6382b3bc8d6719c8e263c642c96dc8efa72','full_wave_luna_prelaunch_sha256':'ae8e493e21a6fba1408d7555c6d3ec45f65895c24b611131283c2396c931df83','transactions':[{'transaction_id':'SCENARIO-V16-COHORT-0001-ATOMIC8','cohort_id':'cohort-0001','atomic_size':8},{'transaction_id':'SCENARIO-V16-COHORT-0002-ATOMIC8','cohort_id':'cohort-0002','atomic_size':8}],'atomic16_forbidden':True,'atomic_cap':8,'rolling_max':16,'cohorts':cohorts,'combined_assignment_count':16,'combined_feature_count':1640,'combined_feature_digest':digest(sorted(allrefs)),'disjoint':True,'future_research_checkpoint_contract':{'eligible_count':8,'rejected_count':0,'unresolved_count':0,'checkpoint_path':None,'checkpoint_sha256':None},'outputs_empty':16,'receipts':0,'results':0,'activation_files':0,'coverage_credit':0,'certification_credit':0,'verifier_sha256':sha(BASE/'verify_readiness_v16.py'),'tests_sha256':sha(BASE/'test_readiness_v16.py')};write(BASE/'authority.json',a);print(json.dumps({'authority_sha256':sha(BASE/'authority.json'),'assignments':16,'features':1640},sort_keys=True))
if __name__=='__main__':main()
