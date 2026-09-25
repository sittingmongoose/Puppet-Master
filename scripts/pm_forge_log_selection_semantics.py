"""ACT075 static original/source/content/response joins; no native log engine.

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
COMMAND='cmd.forge.pipeline.open_logs'
SCHEMA='Plans/forge_log_selection_contracts.schema.json'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.forge.log_selection.result.v1'}

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

def validate_log_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
                        resolve_record,read_content,canonical_digest,verify_original_admission,
                        verify_source_authority,verify_permission_redaction,check_current_disclosure):
    """Validate exact original admission plus actual selected log read and UI outcome.

    Every dependency is mandatory. Proof functions return list[str], never truthy
    caller facts. Native dependencies authenticate originals, run/child membership,
    cursor validity, actual read completeness, content redaction and present access.
    """
    inputs=(request,result,delivery_return_context);saved=deepcopy(inputs)
    request,result,delivery=deepcopy(saved);errors=[];snapshots=[];cache={}
    def read(ref,definition,filename=SCHEMA):
        if ref not in cache:
            actual=resolve_record(ref);snapshots.append((actual,deepcopy(actual)));cache[ref]=deepcopy(actual)
        value=deepcopy(cache[ref])
        if shape(definition,value,filename):raise ValueError('shape:'+definition)
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
        if a['permission']['scope']!='read' or a['file_safe_decision_ref'] is not None:errors.append('read_only_authority')
        if s['automation_binding_ref']!=a.get('automation_binding_ref') or s['binding_generation']!=a.get('expected_automation_binding_generation'):errors.append('selected_binding')
        binding=read(s['automation_binding_ref'],'automation_binding',forge)
        if binding['automation_binding_id']!=s['automation_binding_ref'] or binding['binding_generation']!=s['binding_generation']:errors.append('automation_binding_generation')
        if any(binding[k]!=a[k] for k in ('provider','normalized_host','account_id','repo_id','repository_binding_ref')):errors.append('automation_binding_identity')
        if original['identity']['scope_kind']=='project' and original['identity']['project_id']!=binding['project_id']:errors.append('binding_project')
        for k in ('command_id','command_instance_id','provider','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation'):
            if (k in r,r.get(k))!=(k in a,a.get(k)):errors.append('result_'+k)
        if r['event_refs']:errors.append('read_event_effect')
        receipt=None
        if r['receipt_ref'] is not None:
            receipt=read(r['receipt_ref'],'command_receipt',forge)
            if receipt['receipt_id']!=r['receipt_ref']:errors.append('receipt_identity')
            for k in ('command_id','command_instance_id','provider','repository_binding_ref','expected_binding_generation','automation_binding_ref','expected_automation_binding_generation','requested_authority_role','effective_authority_role','credential_or_grant_ref','idempotency_key'):
                if (k in receipt,receipt.get(k))!=(k in a,a.get(k)):errors.append('receipt_'+k)
            for k in ('operation_id','outcome','observable_work_id','completed_at_utc','event_refs'):
                if receipt[k]!=r[k]:errors.append('receipt_'+k)
            if receipt['recovery_actions']!=r['recovery_action_ids'] or receipt['review_revision_ref']!=a['target']['review_revision_ref']:errors.append('receipt_context')
        observation=None;run=None;content=None
        if r['terminal_provider_result_ref'] is not None:
            observation=read(r['terminal_provider_result_ref'],'observation')
            if observation['target_ref']!=r['target_ref']:errors.append('observation_target')
            if observation['selection']!=s or observation['original_request_ref']!=original['request_ref'] or observation['command_instance_id']!=a['command_instance_id'] or observation['operation_id']!=r['operation_id']:errors.append('observation_original')
            if not instant(original['accepted_at_utc'])<=instant(observation['observed_at_utc'])<=instant(r['completed_at_utc']):errors.append('observation_time')
            run=read(observation['run_source_ref'],'run_source')
            if run['source_ref']!=observation['run_source_ref'] or any(run[k]!=s[k] for k in ('automation_binding_ref','binding_generation','provider_run_id')):errors.append('run_source_selection')
            if any(run[k]!=a[k] for k in ('provider','normalized_host','account_id')) or run['pipeline_id']!=a['target']['pipeline_id']:errors.append('run_source_identity')
            if s['scope']=='whole_run':
                if a['target']['job_id'] is not None or a['target']['target_kind']!='pipeline':errors.append('whole_run_target')
            else:
                children=[c for c in run['children'] if (c['kind'],c['provider_id'])==(s['scope'],s['child_id'])]
                if len(children)!=1:errors.append('child_membership')
                elif children[0]['target_job_id']!=a['target']['job_id']:errors.append('child_target')
                if a['target']['target_kind']!=('pipeline_job' if s['scope']=='job' else 'pipeline'):errors.append('child_target_kind')
            for cursor in (s['cursor_ref'],observation['continuation_cursor_ref']):
                if cursor is None:continue
                c=read(cursor,'cursor_source')
                if c['source_ref']!=cursor or any(c[k]!=s[k] for k in ('automation_binding_ref','binding_generation','provider_run_id','scope','child_id')) or c['stream_ref']!=observation['stream_ref']:errors.append('cursor_scope')
            if observation['completeness']=='complete' and observation['continuation_cursor_ref'] is not None:errors.append('complete_with_continuation')
            if observation['status']=='available':
                if observation['content'] is None or observation['stream_ref'] is None:errors.append('available_without_content')
                else:
                    metadata=observation['content'];content=read_content(metadata['content_ref'])
                    if type(content) is not bytes or len(content)!=metadata['byte_length'] or hashlib.sha256(content).hexdigest()!=metadata['sha256']:errors.append('content_readback')
            elif observation['content'] is not None or observation['completeness']!='unknown' or observation['reason_ref'] is None or observation['continuation_cursor_ref'] is not None:errors.append('unavailable_claims_content')
        if r['outcome']=='succeeded' and (observation is None or observation['status']!='available'):errors.append('success_without_log_read')
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
        original_response=read(response['original_dispatch_id'],None,'Plans/ui_command_response.schema.json') if response['replayed'] else None
        errors+=replay_failures(response,original_response)
        proof('admission',verify_original_admission,original,request)
        proof('sources',verify_source_authority,original,binding,run,observation,deepcopy(cache))
        proof('permission_redaction',verify_permission_redaction,original,request,result,observation,content)
        proof('disclosure',check_current_disclosure,original,result,response,delivery)
    except Exception as exc:errors.append('owner_resolution:'+type(exc).__name__)
    if inputs!=saved or any(v!=frozen for v,frozen in snapshots):errors.append('original_mutated')
    return sorted(set(errors))

def response_failures(bundle,dependencies):
    """Central UI hook; dependencies are trusted adapters, never bundle facts."""
    if not isinstance(dependencies,dict):return ['log_native_dependencies_missing']
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
        if any(normalized.get(k)!=v for k,v in expected.items()):errors.append('log_normalized_original')
        if read(bundle['resolved_outcome_ref'])!=outcome or read(bundle['response_ref'])!=response:errors.append('log_bundle_actual_records')
        errors+=validate_log_result(bundle['owner_request'],result,bundle['original_binding_ref'],
                                    bundle['resolved_outcome_ref'],bundle['response_ref'],bundle['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['log_response_resolution:'+type(exc).__name__]
    if bundle!=frozen or any(a!=b for a,b in snapshots):errors.append('log_response_original_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Synthetic static doubles; not genuine issuer/content/redaction proof."""
    return {'resolve_record':lambda ref:value['records'][ref],'read_content':lambda ref:value['content_utf8'][ref].encode(),
            'canonical_digest':owner_result_digest,**{k:lambda *args:[] for k in ('verify_original_admission','verify_source_authority','verify_permission_redaction','check_current_disclosure')}}

def log_selection_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['fixture_shape']
    return validate_log_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
