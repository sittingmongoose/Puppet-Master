#!/usr/bin/env python3
from __future__ import annotations
import argparse,hashlib,json,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[6]
NS=ROOT/'master/cross_domain_seams/wave-0001/window-sharding-v2'
SESS=Path.home()/'.codex/sessions'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def main(cid):
    out=NS/f'cohorts/{cid}/runtime/native_capture.json'
    if out.exists():raise RuntimeError('capture exists')
    manifest=rows(NS/f'cohorts/{cid}/manifest.jsonl'); idx={}
    for p in SESS.rglob('rollout-*.jsonl'):
        try:m=json.loads(p.open().readline())['payload']
        except Exception:continue
        if m.get('agent_path') in {x['prospective_agent_path'] for x in manifest}:idx[m['agent_path']]=(p,m)
    captured=[]
    for row in manifest:
        aid=row['assignment_id'];ap=row['prospective_agent_path'];rp=NS/f'dispatch/{aid}/attempt-0001/dispatch_receipt.json';rec=json.loads(rp.read_text())
        p,m=idx[ap];events=rows(p);done=[x['payload'] for x in events if x.get('type')=='event_msg' and x.get('payload',{}).get('type')=='task_complete']
        if len(done)!=1 or done[0].get('last_agent_message')!='PMR1':raise RuntimeError('terminal mismatch')
        for k in ('agent_path','native_child_thread_id','native_turn_id'):
            if not rec.get(k):raise RuntimeError('identity missing')
        captured.append({'cohort_id':cid,'assignment_id':aid,'agent_path':rec['agent_path'],'native_child_thread_id':rec['native_child_thread_id'],'native_turn_id':rec['native_turn_id'],'terminal_status':'completed','terminal_response':'PMR1','result_sha256':rec['result_sha256'],'receipt_sha256':sha(rp),'native_session_path':str(p),'native_session_sha256':sha(p)})
    if len({x['native_child_thread_id'] for x in captured})!=16 or len({x['native_turn_id'] for x in captured})!=16:raise RuntimeError('identity reuse')
    payload={'schema_version':'cross-domain-seam-window-v2-native-capture-v1','cohort_id':cid,'row_count':16,'rows':captured}
    out.parent.mkdir(parents=True,exist_ok=True);raw=(json.dumps(payload,indent=2,sort_keys=True)+'\n').encode();fd=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
    with os.fdopen(fd,'wb') as f:f.write(raw)
    print(json.dumps({'cohort_id':cid,'path':str(out),'sha256':sha(out),'rows':16},sort_keys=True))
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--cohort-id',required=True);a=ap.parse_args();main(a.cohort_id)
