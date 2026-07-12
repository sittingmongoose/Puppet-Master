#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parent;ROOT=BASE.parents[5];IDS=['A005CDSV2-0002','A005CDSV2-0006','A005CDSV2-0039']
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def verify():
 e=[]
 try:
  a=json.loads((BASE/'authority.json').read_text());m=rows(BASE/'manifest.jsonl')
  if [x['assignment_id'] for x in m]!=IDS or len({x['prospective_agent_path'] for x in m})!=3:e.append('membership-or-paths')
  for x in m:
   packet=json.loads(Path(x['packet_path']).read_text());intent=json.loads(Path(x['dispatch_intent_path']).read_text());out=Path(x['output_directory']);source=Path(packet['source_result_path'])
   if sha(x['packet_path'])!=x['packet_sha256'] or sha(source)!=x['source_result_sha256'] or packet['primary_errors']!=packet['independent_errors']:e.append(x['assignment_id']+':binding')
   if not out.is_dir() or any(out.iterdir()) or Path(intent['receipt_path']).exists() or intent['activation_granted']:e.append(x['assignment_id']+':zero')
   original_ids=[d['normalized_edge_id'] for d in packet['source_result']['decisions']]
   if any(edge not in original_ids for edge in packet['affected_edge_ids']) or packet['permitted_change_scope']['new_decisions_forbidden'] is not True:e.append(x['assignment_id']+':scope')
  if a['source_results_preserved']!=64 or a['source_results_mutated']!=0 or a['activation_authorized']:e.append('authority')
 except Exception as ex:e.append(f'{type(ex).__name__}:{ex}')
 return {'status':'pass_blocked' if not e else 'fail','errors':e,'assignments':3,'outputs_empty':3,'results':0,'receipts':0,'activation':0,'credits':0}
if __name__=='__main__':r=verify();print(json.dumps(r,indent=2,sort_keys=True));raise SystemExit(0 if r['status']=='pass_blocked' else 1)
