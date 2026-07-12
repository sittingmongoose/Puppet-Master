#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[5];NS=ROOT/'master/cross_domain_seams/wave-0001/window-sharding-v2';SESS=Path.home()/'.codex/sessions';CTRL='019f4f5e-96c6-7893-8c94-ce2c1b760d6c'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def main():
 m=rows(NS/'cohorts/cohort-0004/manifest.jsonl');wanted={x['prospective_agent_path']:x for x in m};sessions={}
 for p in SESS.rglob('rollout-*.jsonl'):
  try:meta=json.loads(p.open().readline())['payload']
  except Exception:continue
  if meta.get('agent_path') in wanted:sessions[meta['agent_path']]=(p,meta)
 payloads=[]
 for ap,row in wanted.items():
  p,meta=sessions[ap];ev=rows(p);st=[x['payload'] for x in ev if x.get('type')=='event_msg' and x.get('payload',{}).get('type')=='task_started'];done=[x['payload'] for x in ev if x.get('type')=='event_msg' and x.get('payload',{}).get('type')=='task_complete'];ctx=[x['payload'] for x in ev if x.get('type')=='turn_context']
  if len(st)!=1 or len(done)!=1 or done[0].get('last_agent_message')!='PMR1' or ctx[0].get('model')!='gpt-5.6-sol' or ctx[0].get('effort')!='xhigh':raise RuntimeError('terminal proof')
  intent_path=Path(row['dispatch_intent_path']);intent=json.loads(intent_path.read_text());out=Path(row['output_directory']);entries=sorted(x.name for x in out.iterdir())
  if entries!=['result.json']:raise RuntimeError('output confinement '+row['assignment_id'])
  recp=Path(intent['dispatch_receipt_ref']);result=out/'result.json';act=NS/'cohorts/cohort-0004/activation.v4.json'
  rec={'schema_version':'cross-domain-seam-window-v2-dispatch-receipt-v1','audit_id':intent['audit_id'],'wave_id':intent['wave_id'],'cohort_id':'cohort-0004','assignment_id':row['assignment_id'],'attempt_id':'attempt-0001','controller_thread_id':CTRL,'agent_path':ap,'task_thread_id':ap,'native_child_thread_id':meta['id'],'native_turn_id':st[0]['turn_id'],'model':'gpt-5.6-sol','reasoning_effort':'xhigh','fresh_child':True,'fork_turns':'none','packet_path':row['packet_path'],'packet_sha256':row['packet_sha256'],'dispatch_intent_path':str(intent_path),'dispatch_intent_sha256':sha(intent_path),'cohort_activation_path':str(act),'cohort_activation_sha256':sha(act),'result_path':str(result),'result_sha256':sha(result),'terminal_status':'completed','terminal_response':'PMR1'};payloads.append((recp,rec))
 if len({x[1]['native_child_thread_id'] for x in payloads})!=16 or len({x[1]['native_turn_id'] for x in payloads})!=16:raise RuntimeError('identity reuse')
 for p,v in payloads:
  raw=(json.dumps(v,indent=2,sort_keys=True)+'\n').encode();fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
  with os.fdopen(fd,'wb') as f:f.write(raw)
 print(json.dumps({'status':'closed','receipts':16,'results':16},sort_keys=True))
if __name__=='__main__':main()
