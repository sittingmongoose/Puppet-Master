#!/usr/bin/env python3
"""Positive projection of actual saved native Goal objects; never router inference."""
import argparse
from collections import Counter
from datetime import datetime,timezone
import hashlib
import json
from pathlib import Path

KNOWN_STATUSES={'active','complete','paused','blocked','budget_limited','usage_limited'}
TARGET_SELECTORS=('/projection/target','/session/target','/snapshot/projection/target','/snapshot/session/target')
TERMINAL_REGISTRY={'COMPLETED','FAILED','UNCERTAIN_TERMINAL_NO_FREEZE','UNCERTAIN_LAUNCH_FAILURE'}

def digest(path):
    result=hashlib.sha256()
    with Path(path).open('rb') as handle:
        for chunk in iter(lambda:handle.read(1024*1024),b''):result.update(chunk)
    return result.hexdigest()

def get(value,pointer):
    for key in pointer.strip('/').split('/'):
        if not isinstance(value,dict):return None
        value=value.get(key)
    return value

def goal_objects(value,expected_goal=None,expected_session=None):
    observations=[]
    for pointer in TARGET_SELECTORS:
        target=get(value,pointer)
        if not isinstance(target,dict):continue
        status=target.get('status')
        if status not in KNOWN_STATUSES or not isinstance(target.get('targetId'),str):continue
        if expected_goal is not None and target['targetId']!=expected_goal:continue
        if expected_session is not None and target.get('sessionId') not in (None,expected_session):continue
        milliseconds=target.get('updatedAt')
        valid_time=isinstance(milliseconds,(int,float)) and not isinstance(milliseconds,bool)
        try:utc=datetime.fromtimestamp(milliseconds/1000,timezone.utc).isoformat() if valid_time else None
        except (ValueError,OverflowError,OSError):utc=None
        observations.append({'native_goal_status':status,'goal_id':target['targetId'],
                             'native_goal_updated_at_epoch_ms':milliseconds if utc else None,
                             'native_goal_record_update_utc':utc,
                             'status_selector':pointer+'/status','goal_id_selector':pointer+'/targetId',
                             'event_time_selector':pointer+'/updatedAt'})
    if not observations:return None,'NO_ADMISSIBLE_NATIVE_GOAL_OBJECT'
    if len({(r['goal_id'],r['native_goal_status']) for r in observations})!=1:
        return None,'CONFLICTING_NATIVE_GOAL_OBJECTS'
    return observations[0],None

def project(job,receipt_path):
    receipt_path=Path(receipt_path)
    row={'job_id':job['job_id'],'pair_id':job.get('pair_id'),'arm':job.get('arm'),'stage':job.get('stage'),
         'deployment_kind':job.get('deployment_kind','candidate_stage'),
         'registry_operational_status':job.get('status'),'native_goal_status':'UNKNOWN',
         'goal_id':None,'native_goal_record_update_utc':None,'source_evidence':None,
         'status_definition':'Last directly observed saved native Goal status at the stated source time. Not router outcome, quality grade, current process occupancy or billing.'}
    if not receipt_path.is_file():
        row['unknown_reason']='NO_SAVED_NATIVE_RECEIPT_LOCATOR';return row
    receipt=json.loads(receipt_path.read_text())
    row['router_terminal_status']=receipt.get('status')
    row['router_status_source']={'path':str(receipt_path),'sha256':digest(receipt_path),'selector':'/status',
                                'definition':'Driver/router result only; not used to populate native_goal_status'}
    expected_goal=receipt.get('goal_target_id');expected_session=receipt.get('session_id')
    final=receipt_path.parent/'final-session.redacted.json'
    if final.is_file():
        observed,error=goal_objects(json.loads(final.read_text()),expected_goal,expected_session)
        if error=='CONFLICTING_NATIVE_GOAL_OBJECTS':
            row['unknown_reason']=error;return row
        if observed:
            row.update(observed)
            row['source_evidence']={'path':str(final),'sha256':digest(final),
                                    'source_kind':'saved_final_native_UI_object',
                                    'status_selector':observed['status_selector'],
                                    'goal_id_selector':observed['goal_id_selector'],
                                    'event_time_selector':observed['event_time_selector'],
                                    'time_semantics':'Native target.updatedAt is its last record-update time; not necessarily an independently observed transition event.'}
            return row
    # A missing final object can still have an exact saved RPC native snapshot.
    # Inspect only known session/read or session/goal replies, not candidate prose.
    wire=receipt_path.parent/'protocol.redacted.jsonl'
    latest=None
    if wire.is_file():
        calls={}
        with wire.open() as handle:
            for line_number,line in enumerate(handle,1):
                envelope=json.loads(line);message=envelope.get('message') or {}
                request_id=str(message.get('id'))
                if envelope.get('direction')=='out' and message.get('method') in {'session/read','session/goal'}:
                    params=message.get('params') or {}
                    calls[request_id]=(message['method'],params.get('action'))
                if envelope.get('direction')!='in' or request_id not in calls:continue
                method,action=calls[request_id]
                # Activation is earlier than termination. Do not call that a final
                # status when no final receipt exists.
                if method=='session/goal' and action=='set':continue
                observed,error=goal_objects(message.get('result') or {},expected_goal,expected_session)
                if error=='CONFLICTING_NATIVE_GOAL_OBJECTS':
                    latest=None;continue
                if observed:latest=(observed,line_number,envelope.get('at'),method,action)
        if latest:
            observed,line_number,observed_at,method,action=latest;row.update(observed)
            row['source_evidence']={'path':str(wire),'sha256':digest(wire),
                'source_kind':'saved_native_RPC_reply','line_number_1based':line_number,
                'status_selector':'/message/result'+observed['status_selector'],
                'goal_id_selector':'/message/result'+observed['goal_id_selector'],
                'event_time_selector':'/message/result'+observed['event_time_selector'],
                'host_observed_at_utc':observed_at,'host_observed_at_selector':'/at',
                'method':method,'action':action,
                'time_semantics':'Exact saved RPC observation, potentially before shutdown. Native record.updatedAt is separate from host reply observation. No later status is inferred.'}
            return row
    row['unknown_reason']='NO_DIRECT_NATIVE_GOAL_STATUS_RECEIPT'
    return row

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--jobs-json',required=True)
    parser.add_argument('--out-dir',required=True)
    parser.add_argument('--include-route-canaries',type=Path)
    args=parser.parse_args()
    path=Path(args.jobs_json).resolve(strict=True);data=json.loads(path.read_text())
    jobs=data.get('jobs',[]) if isinstance(data,dict) else data
    if isinstance(jobs,dict):jobs=list(jobs.values())
    selected=[r for r in jobs if r.get('family')=='Z' and r.get('status') in TERMINAL_REGISTRY]
    projected=[]
    for job in selected:
        stage=job.get('stage_json')
        if not stage:
            projected.append(project(job,Path('/nonexistent-er9-status-receipt')));continue
        projected.append(project(job,Path(stage).parent/'native/receipt.json'))
    if args.include_route_canaries:
        for rel in ['probe-001','canary-001','canary-002']:
            receipt=args.include_route_canaries/rel/'native/receipt.json'
            if receipt.is_file():
                meta=json.loads(receipt.read_text())
                projected.append(project({'job_id':meta['job_id'],'stage':'route_configuration' if rel.startswith('probe') else 'route_canary',
                                          'deployment_kind':'configuration_probe' if rel.startswith('probe') else 'route_canary',
                                          'status':'SAVED_ROUTE_TERMINAL'},receipt))
    out=Path(args.out_dir);out.mkdir(parents=True,exist_ok=False)
    payload={'schema':'er9.direct-native-goal-status.v1','created_utc':datetime.now(timezone.utc).isoformat(),
        'status_source_policy':'Only exact native target.status objects from saved final UI or saved structural RPC reply. No inference from registry/driver status, filename, artifact presence, response count or Goal activation alone.',
        'event_time_policy':'Native target.updatedAt is exported as the target-record update time; RPC host observation time separately identifies when a reply was saved. Neither is invented from router completion.',
        'scope':'Terminal family-Z locators in pinned registry snapshot plus explicitly selected saved route exercises. Active rows are excluded.',
        'registry_snapshot':{'path':str(path),'sha256':digest(path)},'jobs':projected,
        'counts_by_last_direct_native_goal_status':dict(Counter(r['native_goal_status'] for r in projected)),
        'candidate_stage_counts_by_last_direct_native_goal_status':dict(Counter(r['native_goal_status'] for r in projected if r['deployment_kind']=='candidate_stage')),
        'erratum':{'old_exports_preserved':True,'correction':'Accounting cohorts001..003 used router terminal outcome as native_goal_status. Cohort004 removed that inference. This new separately pinned native-evidence export supplies actual observed status where available; it does not alter router outcome, costs, source grading or old cohorts.'}}
    result=out/'NATIVE_GOAL_STATUS.json';result.write_text(json.dumps(payload,indent=2)+'\n')
    manifest={'schema':'er9.native-goal-status-manifest.v1','projection':{'path':str(result),'sha256':digest(result)},
              'exporter':{'path':str(Path(__file__).resolve()),'sha256':digest(Path(__file__).resolve())},
              'source_registry_snapshot':payload['registry_snapshot'],'safe_fields_only':True,
              'raw_sources_excluded':'Native/private runtime, protocol bodies and candidate strings are not copied. Source hashes/selectors remain as evidence pointers.'}
    (out/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(json.dumps({'projection':manifest['projection'],'counts':payload['counts_by_last_direct_native_goal_status']}))
if __name__=='__main__':main()
