#!/usr/bin/env python3
"""One frozen admitted attempt, passive native execution, evidence-bound accounting."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import time
ROOT=Path(__file__).resolve().parents[1]
H=ROOT/'dev/harness-v1-frozen' if (ROOT/'dev/harness-v1-frozen').exists() else ROOT/'dev/harness-v1'
sys.path.insert(0,str(H))
import slot_ledger as slots
import workspaces
import run_attempt
from review_gate import verify_freeze

def run(attempt,reserve=False):
    verify_freeze()
    meta,cmd=run_attempt.command(attempt)
    spec=meta['spec'];job=spec['job_id']
    lease=slots.acquire(job,spec['family'],spec['caps']['seconds'],reserve=reserve)
    slots.update(job,attempt=str(attempt.resolve()),operator_pid=os.getpid(),status='starting',model_requested={'M':'muse-spark-1.3-contributor','Z':'GLM-5.3-Flash'}[spec['family']],effort_requested='max')
    summary={};error=None
    try:
        summary=run_attempt.run(attempt,job)
    except Exception as exc:
        error=f'{type(exc).__name__}: {exc}'
        slots.update(job,status='boundary-error-awaiting-quiescence',operator_error=error)
    receipt_path=attempt/'native/receipt.json'
    native=json.loads(receipt_path.read_text()) if receipt_path.exists() else {}
    proof=native.get('quiescence',native)
    if not native and not (attempt/'dispatch.json').exists():
        # No exclusive pre-Popen dispatch intent exists; conservative counted admission retained.
        evidence={'native_quiescent':True,'own_process_group_absent':True,'native_started':False,'basis':'wrapper failed before exclusive pre-Popen dispatch intent','operator_error':error}
    else:
        evidence={'native_quiescent':proof.get('native_quiescent') is True,'own_process_group_absent':proof.get('own_process_group_absent') is True,
                  'native_receipt':str(receipt_path),'native_receipt_sha256':hashlib.sha256(receipt_path.read_bytes()).hexdigest() if receipt_path.exists() else None,
                  'basis':proof.get('basis',proof.get('quiescence_basis',native.get('native_quiescence_basis')))}
    if not all(evidence.get(k) is True for k in ('native_quiescent','own_process_group_absent')):
        slots.update(job,status='held-unknown-native-quiescence',operator_error=error)
        raise RuntimeError('retain occupied slot: native quiescence not established')
    integrity=None
    if receipt_path.exists():
        try:integrity=workspaces.freeze(attempt)
        except Exception as exc:error=(error or '')+f'; output freeze: {type(exc).__name__}: {exc}'
    usage=native.get('usage_totals') if spec['family']=='Z' else native.get('counters')
    if not isinstance(usage,dict):usage={}
    status='frozen-for-independent-evaluation' if integrity and not integrity.get('missing_required_outputs') and not error else 'failed-or-incomplete-preserved'
    slots.release(job,evidence,status=status,reported_output_tokens=usage.get('outputTokens'),usage_reported=usage or None,
                  usage_completeness='unknown; native children/cancelled output meters may be omitted',operator_error=error,
                  effective_model=native.get('model_id'),effective_effort=native.get('effort_effective'),native_session_id=native.get('session_id'))
    result={'job_id':job,'status':status,'native_stop_reason':native.get('stop_reason'),'goal_status':native.get('goal_status_final'),
            'operator_error':error,'receipt':str(receipt_path),'output_integrity':str(attempt/'output-integrity.json') if integrity else None}
    (attempt/'operator-receipt.json').write_text(json.dumps(result,indent=2)+'\n')
    with slots.transaction() as state:rollup=slots.accounting(state)
    print(json.dumps({'result':result,'accounting':rollup},indent=2),flush=True)
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--attempt',type=Path,required=True);p.add_argument('--reserve',action='store_true');a=p.parse_args();run(a.attempt,a.reserve)
