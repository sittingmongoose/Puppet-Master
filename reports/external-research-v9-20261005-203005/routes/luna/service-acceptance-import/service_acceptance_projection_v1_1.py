"""Additive fresh-active native service acceptance from structural receipts only.

Counts are the pinned fresh State's post-bind telemetry, not response counts.
No native request, candidate body, authentication or dispatch mutation occurs.
"""
import argparse
import hashlib
import json
import importlib.util
import os
from pathlib import Path
import re
import time
dependency=Path(__file__).with_name('native_error_projection.py')
_spec=importlib.util.spec_from_file_location('_er9_native_error_acceptance_dependency',dependency)
_module=importlib.util.module_from_spec(_spec);_spec.loader.exec_module(_module)
extract_errors=_module.extract

UUID=re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')
TOOLS={'pm_boundary':{'read_file','write_file','mechanical','public_https_get'},'pm_execution':{'python_execute'}}
PROJECTOR_SHA='90e955e4038c2ded933bd66a9b9bec0c153493cd09475913cce43678c67ac30b'
TAIL_PROJECTOR_SHA='1ea8c8c7de7010eb1a183172e2731ea36f97f5fc9235f4437ea4ea20432b81c5'
ERROR_READER_SHA='8e8994c72f78ede01d791e3c8414d38a9360f8891331bdbff4661e2e81a70d04'
SCHEMAS={'er9.luna.client-dynamic-stage.v1','er9.luna.client-dynamic-stage.v1.1',
         'er9.luna.client-dynamic-stage.v1.2','er9.luna.client-dynamic-stage.v1.3',
         'er9.luna.client-dynamic-stage.v1.4-bundle'}
USAGE=('inputTokens','cachedInputTokens','outputTokens','reasoningOutputTokens','totalTokens')


def encoded(value):return json.dumps(value,sort_keys=True,separators=(',',':')).encode()
def sha(raw):return hashlib.sha256(raw).hexdigest()


def regular(path):
    path=Path(path).absolute()
    if any(p.is_symlink() for p in (path,*path.parents)) or not path.is_file() or path.stat().st_uid!=os.getuid():
        raise ValueError('trusted owned regular structural receipt required')
    return path


def nonnegative(value):return type(value) is int and value>=0


def extract(native_out,expected_birth_ns,expected_thread_id=None,now_ns=None):
    now=time.monotonic_ns() if now_ns is None else now_ns
    if type(expected_birth_ns) is not int or not 0<expected_birth_ns<=now:raise ValueError('exact original birth required')
    path=regular(Path(native_out)/'result.json')
    raw=path.read_bytes()
    if len(raw)>4*1024*1024:raise ValueError('structural receipt cap')
    result=json.loads(raw)
    thread=result.get('thread_id')
    if not isinstance(thread,str) or not UUID.fullmatch(thread) or expected_thread_id is not None and thread!=expected_thread_id:
        raise ValueError('exact fresh thread identity required')
    if result.get('schema') not in SCHEMAS or result.get('original_birth_monotonic_ns')!=expected_birth_ns:
        raise ValueError('unsupported receipt or original birth mismatch')
    if result.get('requested_model')!='gpt-6-luna' or result.get('requested_effort')!='max' or result.get('model_fallback_allowed') is not False:
        raise ValueError('exact admitted Luna max identity required')
    identity=result.get('identity') or {}
    if identity.get('fresh_empty_history') is not True or identity.get('instruction_sources_empty') is not True or identity.get('model')!='gpt-6-luna' or identity.get('effort')!='max':
        raise ValueError('fresh empty native thread acknowledgement missing')
    sources=result.get('runtime_source_sha256') or {}
    if sources.get('dynamic_projector.py')!=PROJECTOR_SHA:raise ValueError('unaccepted telemetry projector')
    if result['schema']!='er9.luna.client-dynamic-stage.v1' and (result.get('prospective_completion_source_sha256') or {}).get('projection.py')!=TAIL_PROJECTOR_SHA:
        raise ValueError('unaccepted completion telemetry projector')
    allowed=result.get('allowed_client_tools') or {}
    if not isinstance(allowed,dict) or not allowed or not set(allowed)<=set(TOOLS):raise ValueError('unadmitted registered namespaces')
    for namespace,names in allowed.items():
        if not isinstance(names,list) or not names or len(names)!=len(set(names)) or not set(names)<=TOOLS[namespace]:raise ValueError('unadmitted registered tools')
    metrics=result.get('metrics') or {};activation=metrics.get('activation') or {}
    if metrics.get('fresh_session') is not True or metrics.get('goal_target_id')!=thread or metrics.get('requested_model')!='gpt-6-luna' or metrics.get('requested_effort')!='max':
        raise ValueError('fresh bound telemetry identity missing')
    activated=activation.get('observed_activation_monotonic_ns')
    if metrics.get('goal_started_turn') is not True or activation.get('native_activation_observed') is not True or activation.get('receipt_id')!=thread or type(activated) is not int or not expected_birth_ns<=activated<=now:
        raise ValueError('native activation after original birth required')
    if metrics.get('candidate_goals_set_by_host')!=1 or metrics.get('host_initial_turns_started')!=1 or metrics.get('host_followup_turns_started')!=0 or metrics.get('goal_replacements_observed')!=0:
        raise ValueError('fresh original Goal lifecycle mismatch')
    usage=metrics.get('usage_totals') or {};notifications=metrics.get('usage_notification_count')
    if usage and (set(usage)!=set(USAGE) or any(not nonnegative(usage[k]) for k in USAGE)) or not nonnegative(notifications):
        raise ValueError('invalid observed usage fields')
    success=metrics.get('tool_completed_counts') or {}
    if not isinstance(success,dict):raise ValueError('completed confined tool counts required')
    counts={}
    for key,value in success.items():
        if not isinstance(key,str) or '.' not in key or not nonnegative(value):raise ValueError('invalid tool count')
        namespace,name=key.split('.',1)
        if name not in allowed.get(namespace,[]):raise ValueError('completed unregistered tool')
        counts[key]=value
    generated=usage.get('outputTokens',0);completed=sum(counts.values())
    positive=notifications>0 and generated>0 and completed>0
    error_reader=Path(__file__).with_name('native_error_projection.py')
    if sha(error_reader.read_bytes())!=ERROR_READER_SHA:raise ValueError('error reader source drift')
    errors=extract_errors(native_out,thread)
    # The atomic metrics snapshot and error scan must concern the same receipt.
    if sha(path.read_bytes())!=sha(raw) or errors['native_result_sha256']!=sha(raw):raise ValueError('changing structural snapshot; retry bounded caller observation')
    if errors['matching_session_metadata_records']!=1 or errors['unparsed_lines']!=0:raise ValueError('matching native session metadata unavailable or ambiguous')
    stop=result.get('native_stop_monotonic_ns');active=metrics.get('goal_status_final')=='active'
    if type(stop) is not int or not expected_birth_ns<stop:raise ValueError('original native stop missing')
    adverse=bool(errors['errors']) or result.get('outcome')=='HOLD' or result.get('error_class') is not None
    eligible=positive and active and now<stop and not adverse
    receipt={'schema':'er9.luna.service-acceptance-projection.v1','metadata_status':'ACCEPTANCE_OBSERVED' if eligible else 'NO_ACTIVE_POSITIVE_ACCEPTANCE',
        'active_attempt_acceptance_observed':eligible,'positive_fresh_traffic_observed':positive,
        'snapshot_goal_active':active,'before_original_native_stop':now<stop,'adverse_receipt_observed':adverse,
        'thread_id':thread,'original_birth_monotonic_ns':expected_birth_ns,'native_activation_monotonic_ns':activated,
        'observation_monotonic_ns':now,'native_result_sha256':sha(raw),'reader_sha256':sha(Path(__file__).read_bytes()),
        'error_projection_sha256':errors['projection_sha256'],'terminal_error_count':len(errors['errors']),
        'terminal_error_classes':sorted({row['cause_class'] for row in errors['errors']}),
        'known_usage_totals':{k:usage.get(k,0) for k in USAGE},'usage_notification_count':notifications,
        'successful_registered_confined_tool_counts':counts,'successful_registered_confined_tool_count':completed,
        'after_birth_attribution':'source-pinned State initialized empty; exact fresh empty-history bind then native activation after original birth; telemetry accepts only that thread',
        'per_usage_and_tool_event_timestamps':'UNSUPPORTED in frozen live projection; no invented timestamps',
        'native_parent_response_count':'UNKNOWN; usage notifications are not response or HTTP request counts',
        'proof_scope':'this new active attempt received generated model usage and successful registered confined model-tool traffic; not full-stage completion, source quality or future service availability',
        'dispatch_policy':'sole ops-owned; reader does not launch, release, mutate backoff, retry or substitute model',
        'candidate_bodies_prompts_history_provider_secrets_exported':False,'mutations_performed':False}
    receipt['projection_sha256']=sha(encoded(receipt))
    return receipt


def main():
    p=argparse.ArgumentParser();p.add_argument('--native-out',type=Path,required=True)
    p.add_argument('--expected-birth-monotonic-ns',type=int,required=True);p.add_argument('--expected-thread-id')
    p.add_argument('--out',type=Path,required=True);args=p.parse_args()
    try:value=extract(args.native_out,args.expected_birth_monotonic_ns,args.expected_thread_id)
    except (OSError,ValueError,TypeError) as error:
        value={'schema':'er9.luna.service-acceptance-projection.v1','metadata_status':'UNAVAILABLE',
            'active_attempt_acceptance_observed':False,'error_class':type(error).__name__,
            'candidate_bodies_prompts_history_provider_secrets_exported':False,'mutations_performed':False}
    with args.out.open('x') as file:file.write(json.dumps(value,indent=2)+'\n')
    print(json.dumps({k:value.get(k) for k in ('metadata_status','active_attempt_acceptance_observed','projection_sha256')}))
    return 1 if value['metadata_status']=='UNAVAILABLE' else 0


if __name__=='__main__':raise SystemExit(main())
