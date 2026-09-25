"""ACT156 static original/fence/effect/response joins; no native thread reply engine.

Resolvers and proof adapters must authenticate actual immutable owner inputs and
span current permission/redaction/disclosure fences. Fixture doubles do neither.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import hashlib
import json
import os
from pathlib import Path
import sys
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT=Path(__file__).resolve().parents[1]
CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(CANON/'scripts'))
from pm_full_thread_semantics import full_thread_semantic_failures, command_outcome_binding_failures
from pm_ui_command_response import replay_failures, owner_result_digest
COMMAND='cmd.forge.review.thread.reply'
SCHEMA='Plans/forge_thread_reply_contracts.schema.json'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.forge.thread_reply.result.v1'}

@lru_cache(maxsize=1)
def schemas():
    names=[SCHEMA,'Plans/forge_integration_contracts.schema.json','Plans/full_thread_runtime_contracts.schema.json',
           'Plans/source_control_contracts.schema.json','Plans/ui_command_response.schema.json','Plans/shared_runtime_command_contracts.schema.json']
    docs={name:json.loads(((ROOT if name==SCHEMA else CANON)/name).read_text()) for name in names}
    return docs,Registry().with_resources((s['$id'],Resource.from_contents(s)) for s in docs.values())

def shape(definition,value,filename=SCHEMA):
    docs,registry=schemas();s=docs[filename]
    selected=s if definition is None else {'$ref':s['$id']+'#/$defs/'+definition}
    return [e.message for e in Draft202012Validator(selected,registry=registry,format_checker=FormatChecker()).iter_errors(value)]

def instant(s):return datetime.fromisoformat(s.replace('Z','+00:00'))

def validate_reply_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
                        resolve_record,canonical_digest,verify_original_admission,
                        verify_thread_authority,verify_reply_effect,check_current_disclosure):
    """Validate exact original admission plus actual selected thread reply and UI outcome.

    Every dependency is mandatory. Proof functions return list[str], never truthy
    caller facts. Native dependencies authenticate originals, thread/revision/window
    membership, actual posted reply, safe error projection and present access.
    """
    inputs=(request,result,delivery_return_context);saved=deepcopy(inputs)
    request,result,delivery=deepcopy(saved);errors=[];snapshots=[];cache={}
    def read(ref,definition,filename=SCHEMA):
        if ref not in cache:
            actual=resolve_record(ref);snapshots.append((actual,deepcopy(actual)));cache[ref]=deepcopy(actual)
        value=deepcopy(cache[ref])
        if shape(definition,value,filename):raise ValueError('shape:'+str(definition))
        return value
    def proof(name,fn,*args):
        prior=deepcopy(args);value=fn(*args)
        if type(value) is not list or any(type(x) is not str for x in value):errors.append(name+'_invalid_proof')
        else:errors.extend(name+':'+x for x in value)
        if args!=prior:errors.append('proof_input_mutated')
    def digest(value):
        copy=deepcopy(value);d=canonical_digest(copy)
        if copy!=value:errors.append('digest_input_mutated')
        if not isinstance(d,str) or len(d)!=64 or any(c not in '0123456789abcdef' for c in d):raise ValueError('digest')
        return d
    try:
        if shape('request',request) or shape('result',result):return ['input_shape']
        a=request['authority'];s=request['selection'];r=result['owner_result'];forge='Plans/forge_integration_contracts.schema.json'
        original=read(original_binding_ref,'dispatch_binding')
        actual_request=read(result['original_request_ref'],'request')
        o=read(outcome_ref,'CommandOutcomeRecord','Plans/full_thread_runtime_contracts.schema.json')
        response=read(response_ref,None,'Plans/ui_command_response.schema.json')
        if read(o['owner_result_ref'],'result')!=result:errors.append('actual_result')
        if actual_request!=request or original['arguments']!=request or original['request_ref']!=result['original_request_ref']:errors.append('original_request')
        if shape('delivery_return_context',delivery) or delivery!=original['return_context']:errors.append('original_return')
        errors+=full_thread_semantic_failures('IdentityEnvelope',original['identity'])
        errors+=full_thread_semantic_failures('CommandOutcomeRecord',o)
        errors+=command_outcome_binding_failures(response,o,outcome_ref)
        expected={'accepted':('accepted',{'pending'}),'acknowledged':('accepted',{'pending'}),
                  'executing':('accepted',{'pending'}),'succeeded':('accepted',{'succeeded'}),
                  'failed':('accepted',{'failed'}),'cancelled':('accepted',{'cancelled'}),
                  'rejected':('rejected',{None}),'terminal_unknown':('accepted',{'recovery_required'})}[o['outcome']]
        if response['ack_status']!=expected[0] or response['result_status'] not in expected[1]:errors.append('response_outcome')
        expected_receipts=(None,o['acknowledgement_receipt_ref']) if o['outcome'] in ('accepted','acknowledged','executing') else (o['result_receipt_ref'],)
        if response['receipt_ref'] not in expected_receipts:errors.append('response_receipt')
        if response['event_refs']!=r['event_refs']:errors.append('response_events')
        if response['response_kind']!='owner_operation' or response['owner_result_schema_ref']!=BINDING or o['owner_result_schema_ref']!=BINDING:errors.append('response_binding')
        if response['request_ref']!=original['request_ref'] or response['owner_result_ref']!=o['owner_result_ref']:errors.append('response_original')
        if response['command_id']!=COMMAND or o['command_id']!=COMMAND:errors.append('response_command')
        if any(v!=original['identity'] for v in (o['identity'],response['owner_identity'])):errors.append('original_identity')
        if a['command_instance_id']!=original['identity'].get('command_instance_id') or response['command_instance_id']!=a['command_instance_id']:errors.append('original_instance')
        if r['operation_id']!=original['identity']['operation_id']:errors.append('original_operation')
        if (response['original_dispatch_id'] if response['replayed'] else response['dispatch_id'])!=original['dispatch_id']:errors.append('original_dispatch')
        for k in ('dispatch_frame_id','target_generation','payload_sha256','idempotency_key'):
            if o[k]!=original[k]:errors.append('original_'+k)
        if original['payload_sha256']!=digest(request) or o['owner_result_sha256']!=digest(result):errors.append('original_digest')
        if original['idempotency_key']!=a['idempotency_key'] or original['permission_snapshot_ref']!=a['permission']['permission_snapshot_ref']:errors.append('original_authority')
        if not instant(a['requested_at_utc'])<=instant(original['accepted_at_utc'])<=instant(r['completed_at_utc'])<=instant(o['observed_at']):errors.append('original_time')
        if instant(response['ts'])<instant(r['completed_at_utc']):errors.append('response_before_result')
        actual_error=projection=None
        if r['error'] is None:
            if o['error_ref'] is not None or response['error'] is not None or result['error_projection_ref'] is not None:errors.append('error_presence')
        else:
            actual_error=read(o['error_ref'],'command_error_record',forge)
            if actual_error['error']!=r['error'] or any(actual_error[k]!=a[k] for k in ('command_id','command_instance_id','provider','repository_binding_ref')):errors.append('actual_owner_error')
            projection=read(result['error_projection_ref'],'error_projection')
            if projection['projection_id']!=result['error_projection_ref'] or projection['owner_error_ref']!=o['error_ref'] or projection['original_request_ref']!=original['request_ref'] or projection['identity']!=original['identity']:errors.append('error_projection_source')
            if projection['ui_error']!=response['error']:errors.append('error_projection_value')
            if projection['return_context']!=original['return_context'] or projection['return_context']!=delivery:errors.append('error_projection_caller')
            if not instant(a['requested_at_utc'])<=instant(actual_error['recorded_at_utc'])<=instant(r['completed_at_utc']):errors.append('owner_error_time')
            if not instant(actual_error['recorded_at_utc'])<=instant(projection['recorded_at_utc'])<=instant(o['observed_at']):errors.append('error_projection_time')
        if a['permission']['scope']!='remote_side_effect':errors.append('thread reply_authority')
        if r['observable_work_id']!=a['observable_work_id']:errors.append('original_work_reference')
        binding=read(a['repository_binding_ref'],'repository_binding',forge)
        if binding['binding_id']!=a['repository_binding_ref'] or binding['binding_generation']!=a['expected_binding_generation']:errors.append('repository_binding_generation')
        if any(binding[k]!=a[k] for k in ('provider','provider_variant','normalized_host','account_id','repo_id')):errors.append('repository_binding_identity')
        if binding['provider_repository_id']!=a['target']['provider_repository_id']:errors.append('repository_identity')
        for k in ('command_id','command_instance_id','provider','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation'):
            if (k in r,r.get(k))!=(k in a,a.get(k)):errors.append('result_'+k)
        if r['event_refs']:errors.append('unadmitted_event_effect')
        receipt=None
        if r['receipt_ref'] is not None:
            receipt=read(r['receipt_ref'],'command_receipt',forge)
            if receipt['receipt_id']!=r['receipt_ref']:errors.append('receipt_identity')
            for k in ('command_id','command_instance_id','provider','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation','requested_authority_role','effective_authority_role','credential_or_grant_ref','idempotency_key'):
                if (k in receipt,receipt.get(k))!=(k in a,a.get(k)):errors.append('receipt_'+k)
            for k in ('operation_id','outcome','observable_work_id','completed_at_utc','event_refs'):
                if receipt[k]!=r[k]:errors.append('receipt_'+k)
            if receipt['recovery_actions']!=r['recovery_action_ids'] or receipt['review_revision_ref']!=a['target']['review_revision_ref']:errors.append('receipt_context')
        for key in ('provider_review_id','thread_id','review_revision_ref'):
            if s[key]!=a['target'][key]:errors.append('selected_'+key)
        thread=read(s['thread_ref'],'review_thread',forge)
        revision=read(s['review_revision_ref'],'review_revision',forge)
        if thread['thread_id']!=s['thread_id'] or thread['review_revision_ref']!=s['review_revision_ref']:errors.append('thread_identity')
        if thread['revision_anchor']!=s['revision_anchor']:errors.append('thread_original_window')
        if revision['review_revision_id']!=s['review_revision_ref']:errors.append('revision_identity')
        for key in ('base_revision','head_revision','merge_base_revision'):
            if revision[key]!=s[key]:errors.append('revision_'+key)
        if s['change_version'] is not None and s['change_version']!=revision['version']:errors.append('selected_change_version')
        revisions=[revision]
        for key in ('created_at_review_revision_ref','left_review_revision_ref','right_review_revision_ref'):
            ref=s['revision_anchor'][key];window=read(ref,'review_revision',forge);revisions.append(window)
            if window['review_revision_id']!=ref:errors.append('window_revision_identity')
        for row in revisions:
            if row['provider_review_id']!=s['provider_review_id'] or row['provider']!=a['provider'] or row['repository_binding_ref']!=a['repository_binding_ref']:errors.append('revision_review_scope')
        observation=None
        if r['terminal_provider_result_ref'] is not None and r['terminal_provider_result_ref']!=result['observation_ref']:errors.append('terminal_observation_reference')
        if result['observation_ref'] is not None:
            observation=read(result['observation_ref'],'observation')
            if observation['selection']!=s or observation['original_request_ref']!=original['request_ref'] or observation['command_instance_id']!=a['command_instance_id'] or observation['operation_id']!=r['operation_id']:errors.append('observation_original')
            if observation['target_ref']!=r['target_ref'] or observation['provider']!=a['provider'] or observation['repository_binding_ref']!=a['repository_binding_ref']:errors.append('observation_target')
            if not instant(original['accepted_at_utc'])<=instant(observation['observed_at_utc'])<=instant(r['completed_at_utc']):errors.append('observation_time')
            if observation['outcome']=='posted' and (observation['effect_state']!='known_applied' or observation['provider_receipt_ref'] is None or observation['provider_reply_id'] is None):errors.append('posted_without_provider_reply')
            if observation['outcome']=='unknown' or observation['effect_state']=='unknown':
                if observation['outcome']!='unknown' or observation['effect_state']!='unknown' or observation['reconciliation_ref'] is None or r['outcome']!='effect_unknown':errors.append('unknown_effect_preservation')
            elif observation['outcome']!='posted' and observation['effect_state'] not in ('not_attempted','known_not_applied'):errors.append('contradictory_known_failure')
        if r['outcome']=='succeeded' and (observation is None or observation['outcome']!='posted'):errors.append('success_without_posted_reply')
        if r['outcome']!='accepted' and observation is None:errors.append('terminal_observation_missing')
        if observation is not None and observation['outcome']=='posted' and r['outcome']!='succeeded':errors.append('posted_result_mismatch')
        if r['outcome']=='accepted':
            if o['outcome'] not in ('accepted','acknowledged','executing') or o['result_receipt_ref'] is not None or observation is not None:errors.append('accepted_not_terminal')
            if r['observable_work_id'] is None:errors.append('accepted_without_work')
            if r['receipt_ref'] is not None and r['receipt_ref']!=o['acknowledgement_receipt_ref']:errors.append('acceptance_receipt')
        elif r['outcome']=='degraded':errors.append('degraded_mapping_unadmitted')
        else:
            expected={'succeeded':'succeeded','blocked':'rejected','failed':'failed','cancelled':'cancelled','effect_unknown':'terminal_unknown','recovery_required':'terminal_unknown'}[r['outcome']]
            if (r['error'] or {}).get('effect_state')=='unknown':expected='terminal_unknown'
            if o['outcome']!=expected or o['result_receipt_ref']!=r['receipt_ref'] or receipt is None:errors.append('terminal_outcome')
        if r['observable_work_id'] is not None:
            work=read(r['observable_work_id'],'ObservableWorkRecord','Plans/full_thread_runtime_contracts.schema.json')
            errors+=full_thread_semantic_failures('ObservableWorkRecord',work)
            if work['identity']!=original['identity'] or work['observable_work_id']!=r['observable_work_id']:errors.append('original_work')
            if r['outcome']=='accepted' and (work['work_state'] in ('completed','failed','cancelled','recovery-required') or work['result_receipt_ref'] is not None):errors.append('accepted_work_terminal')
        original_response=read(response['original_dispatch_id'],None,'Plans/ui_command_response.schema.json') if response['replayed'] else None
        errors+=replay_failures(response,original_response)
        proof('admission',verify_original_admission,original,request)
        proof('thread',verify_thread_authority,original,binding,thread,revision,revisions,request)
        proof('effect',verify_reply_effect,original,request,result,thread,revision,observation)
        proof('disclosure',check_current_disclosure,original,result,response,delivery,actual_error,projection)
    except Exception as exc:errors.append('owner_resolution:'+type(exc).__name__)
    if inputs!=saved or any(v!=frozen for v,frozen in snapshots):errors.append('original_mutated')
    return sorted(set(errors))

def response_failures(bundle,dependencies):
    """Central UI hook; dependencies are trusted adapters, never bundle facts."""
    if not isinstance(dependencies,dict):return ['reply_native_dependencies_missing']
    frozen=deepcopy(bundle);snapshots=[]
    try:
        resolver=dependencies['resolve_record']
        def read(ref):
            actual=resolver(ref);snapshots.append((actual,deepcopy(actual)));return deepcopy(actual)
        original=read(bundle['original_binding_ref'])
        result=bundle['owner_result'];response=bundle['response'];outcome=bundle['outcome']
        normalized=bundle['normalized_request'];errors=[]
        expected={'request_ref':original['request_ref'],'command_id':COMMAND,
                  'command_instance_id':original['identity']['command_instance_id'],
                  'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],
                  **{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}
        if any(normalized.get(k)!=v for k,v in expected.items()):errors.append('reply_normalized_original')
        if read(bundle['resolved_outcome_ref'])!=outcome or read(bundle['response_ref'])!=response:errors.append('reply_bundle_actual_records')
        errors+=validate_reply_result(bundle['owner_request'],result,bundle['original_binding_ref'],
                                    bundle['resolved_outcome_ref'],bundle['response_ref'],bundle['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['reply_response_resolution:'+type(exc).__name__]
    if bundle!=frozen or any(a!=b for a,b in snapshots):errors.append('reply_response_original_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Synthetic static doubles; not genuine issuer/content/redaction proof."""
    return {'resolve_record':lambda ref:value['records'][ref],
            'canonical_digest':owner_result_digest,**{k:lambda *args:[] for k in ('verify_original_admission','verify_thread_authority','verify_reply_effect','check_current_disclosure')}}

def thread_reply_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['fixture_shape']
    return validate_reply_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
