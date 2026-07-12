#!/usr/bin/env python3
from __future__ import annotations
import hashlib,json,os
from pathlib import Path

ROOT=Path(__file__).resolve().parents[5]
NS=ROOT/'master/cross_domain_seams/wave-0001/window-sharding-v2'
V14='6d64c47798f97cba4e2c30d9d3c6d3d1bedc1c974ba6033b6fce20efe0ff6375'
LUNA='a2913d9a26bc2ada12e72347b6bdf4d167e43644d713a5060f82b132f4bc3207'
TERMINAL='1e8af80b32fb1d998d4f1bdb24f049f26f93b6c25892a60b96982bd17bc052c9'
ROUTING='9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544'
CONTROLLER='019f4f5e-96c6-7893-8c94-ce2c1b760d6c'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]

def main():
    out=NS/'cohorts/cohort-0004/activation.v4.json'
    if out.exists():raise RuntimeError('activation exists')
    if sha(ROOT/'master/coordination/CONCURRENCY_POLICY_V14.json')!=V14:raise RuntimeError('V14 drift')
    luna=NS/'validation/luna-independent-prelaunch-v3.json'
    terminal=NS/'validation/terminal-sol-preparation-report.json'
    if sha(luna)!=LUNA or sha(terminal)!=TERMINAL:raise RuntimeError('readiness drift')
    report=json.loads(luna.read_text())
    if report.get('status')!='READY_FOR_SOL_LAUNCH' or report.get('gate_passed') is not True or report.get('errors')!=[]:raise RuntimeError('readiness fail')
    manifest=rows(NS/'cohorts/cohort-0004/manifest.jsonl')
    ready=next(x for x in report['cohort_readiness'] if x['cohort_id']=='cohort-0004')
    if len(manifest)!=16 or not ready.get('ready') or ready.get('assignment_ids')!=[x['assignment_id'] for x in manifest]:raise RuntimeError('cohort membership')
    for row in manifest:
        intent=json.loads(Path(row['dispatch_intent_path']).read_text());od=Path(row['output_directory'])
        if any(od.iterdir()) or Path(intent['dispatch_receipt_ref']).exists():raise RuntimeError('cohort4 nonzero')
    for i in range(1,49):
        rp=NS/f'dispatch/A005CDSV2-{i:04d}/attempt-0001/dispatch_receipt.json'
        op=ROOT/f'cross_domain_seams_window_v2/A005CDSV2-{i:04d}/attempts/attempt-0001/result.json'
        if not rp.is_file() or not op.is_file():raise RuntimeError('prior closure missing')
    template=json.loads((NS/'cohorts/cohort-0004/activation.template.json').read_text())
    template.pop('concurrency_policy_v10_sha256',None)
    template.update({'schema_version':'cross-domain-seam-window-v2-cohort-activation-v14','status':'ACTIVE_FOR_EXACTLY_16_FRESH_SOL_XHIGH_LEAVES','activation_granted':True,'activation_transaction_id':'A005-CDS-V2-V14-COHORT-0004-EXACT16','independent_prelaunch_path':str(luna),'independent_prelaunch_sha256':LUNA,'terminal_preparation_report_path':str(terminal),'terminal_preparation_report_sha256':TERMINAL,'concurrency_policy_v14_sha256':V14,'model_lane_routing_policy_v2_sha256':ROUTING,'rolling_max':32,'atomic_cap':16,'semantic_transaction_cap':16,'live_semantic_count_before_activation':0,'live_semantic_count_after_full_cohort':16,'separate_atomic_transaction':True,'atomic32_forbidden':True,'controller_thread_id':CONTROLLER,'model':'gpt-5.6-sol','reasoning_effort':'xhigh','coverage_credit':0,'research_credit':0,'spec_credit':0,'merge_credit':0,'promotion_credit':0})
    raw=(json.dumps(template,indent=2,sort_keys=True)+'\n').encode();fd=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
    with os.fdopen(fd,'wb') as f:f.write(raw)
    print(json.dumps({'status':'activated','path':str(out),'sha256':sha(out),'assignments':16},indent=2,sort_keys=True))
if __name__=='__main__':main()
