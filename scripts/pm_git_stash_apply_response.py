"""SCS-003/SCS-024 + SIR-042 actual SIR original/delivery/domain/common joins, not authentication."""
from copy import deepcopy
from datetime import datetime
import json,re
from pathlib import Path
from jsonschema import Draft202012Validator,FormatChecker
from referencing import Resource
from pm_git_stash_apply_selected import stash_apply_failures,shape_failures
from pm_full_thread_semantics import full_thread_semantic_failures

COMMANDS=frozenset(('cmd.source_control.stash.apply',))
BINDING={'path':'Plans/git_stash_apply_selected.schema.json','json_pointer':'#/$defs/result','schema_id':'pm.source_control.git_stash_apply.result.v1'}
SCHEMA='Plans/sir_git_stash_apply_dispatch.schema.json'


def binding_shape_failures(value,*,registry,definition='dispatch_binding'):
    schema=json.loads((Path(__file__).resolve().parents[1]/SCHEMA).read_text())
    registry=registry.with_resource(schema['$id'],Resource.from_contents(schema))
    return [e.message for e in Draft202012Validator({'$ref':schema['$id']+'#/$defs/'+definition},registry=registry,format_checker=FormatChecker()).iter_errors(value)]


def response_failures(response,outcome,owner_result,owner_request,normalized_request,original_binding_ref,delivery_return_context,*,resolve_record,canonical_request_digest,canon_root,registry):
    inputs=(response,outcome,owner_result,owner_request,normalized_request,original_binding_ref,delivery_return_context)
    saved=deepcopy(inputs);response,outcome,result,request,normalized,binding_ref,delivery=saved
    if not callable(resolve_record) or not callable(canonical_request_digest):return ['stash_apply_response_dependencies_missing']
    failures=[];records={};live={}
    def fail(rule,condition):
        if condition:failures.append('stash_apply_response_'+rule)
    def read(ref):
        if ref not in records:live[ref]=resolve_record(ref);records[ref]=deepcopy(live[ref])
        return deepcopy(records[ref])
    time=lambda s:datetime.fromisoformat(s.replace('Z','+00:00'))
    try:
        original=read(binding_ref)
        if binding_shape_failures(original,registry=registry):raise ValueError('original_schema')
        if binding_shape_failures(delivery,registry=registry,definition='delivery_return_context'):raise ValueError('delivery_schema')
        failures+=full_thread_semantic_failures('IdentityEnvelope',original['identity'])
        fail('original_arguments',original['arguments']!=request)
        failures+=stash_apply_failures(request,result,resolve_record=read,canon_root=canon_root)
        if not failures:
            fail('delivery_original',delivery!=original['return_context'] or request['return_context']!=original['return_context'])
            identity=original['identity'];context=read(request['repository_context_ref'])
            fail('context_identity',identity['scope_kind']!='project' or any(identity.get(k)!=context['lineage'][k] for k in ('project_id','project_home_server_id','execution_host_id','execution_environment_id','source_location_id','topology_generation')))
            fail('context_lineage',any(identity.get(dst)!=context['lineage'].get(src) for src,dst in (('plan_id','named_plan_id'),('goal_id','goal_id'))))
            fail('identity',identity!=outcome['identity'] or identity!=response['owner_identity'] or identity!=normalized.get('owner_identity'))
            fail('command',request['command_id']!=response['command_id'] or request['command_id'] not in COMMANDS)
            fail('instance',request['command_instance_id']!=response['command_instance_id'] or request['command_instance_id']!=identity['command_instance_id'])
            fail('operation',request['operation_id']!=identity['operation_id'] or request['operation_id']!=response['operation_id'])
            fail('original_ref',any(v!=original['request_ref'] for v in (result['original_request_ref'],response['request_ref'],normalized.get('request_ref'))))
            fail('idempotency',request['idempotency_key']!=original['idempotency_key'] or outcome['idempotency_key']!=original['idempotency_key'])
            fail('permission',request['permission_snapshot_ref']!=original['permission_snapshot_ref'])
            fail('dispatch',(response['original_dispatch_id'] if response['replayed'] else response['dispatch_id'])!=original['dispatch_id'])
            for field in ('dispatch_frame_id','target_generation','payload_sha256'):fail('original_'+field,outcome[field]!=original[field] or normalized.get(field)!=original[field])
            digest_input=deepcopy(request)
            try:
                digest=canonical_request_digest(digest_input)
                fail('digest_contract',not isinstance(digest,str) or re.fullmatch('[0-9a-f]{64}',digest) is None)
                fail('original_payload',digest!=original['payload_sha256'])
            except Exception:failures.append('stash_apply_response_digest_unavailable')
            fail('digest_mutated',digest_input!=request)
            fail('time',not time(request['requested_at_utc'])<=time(original['accepted_at_utc'])<=time(result['observed_at_utc'])<=time(outcome['observed_at']))
            if result['error_ref'] is None:
                fail('error_absence',outcome['error_ref'] is not None or response['error'] is not None or result['error_projection_ref'] is not None)
            else:
                fail('error_ref',outcome['error_ref']!=result['error_ref'])
                error=read(result['error_ref']);projection=read(result['error_projection_ref'])
                if binding_shape_failures(projection,registry=registry,definition='error_projection'):raise ValueError('error_projection_schema')
                fail('error_projection_source',projection['projection_id']!=result['error_projection_ref'] or projection['owner_error_ref']!=result['error_ref'] or projection['command_id']!=request['command_id'] or projection['command_instance_id']!=request['command_instance_id'])
                fail('error_projection_value',projection['ui_error']!=response['error'])
                fail('error_projection_payload',projection['owner_error']!=error)
                fail('error_disclosure',projection['return_context']!=original['return_context'] or projection['return_context']!=delivery)
                fail('error_time',not time(request['requested_at_utc'])<=time(error['occurred_at_utc'])<=time(projection['recorded_at_utc'])<=time(outcome['observed_at']))
            if result['outcome']=='accepted':
                fail('accepted_terminal',outcome['outcome'] not in ('accepted','acknowledged','executing') or outcome['result_receipt_ref'] is not None or response['receipt_ref'] is not None)
            else:
                expected={'succeeded':'succeeded','blocked':'rejected','failed':'failed','cancelled':'cancelled','recovery_required':'terminal_unknown','effect_unknown':'terminal_unknown'}[result['outcome']]
                fail('outcome',outcome['outcome']!=expected or response['result_status']=='no_op')
                fail('receipt',result['operation_receipt_ref']!=outcome['result_receipt_ref'])
                fail('receipt_events',response['event_refs']!=read(result['operation_receipt_ref'])['event_refs'])
            if result['observable_work_id'] is not None:
                work=read(result['observable_work_id']);root_schema=json.loads((Path(canon_root)/'Plans/full_thread_runtime_contracts.schema.json').read_text())
                if not Draft202012Validator({'$ref':root_schema['$id']+'#/$defs/ObservableWorkRecord'},registry=registry,format_checker=FormatChecker()).is_valid(work):raise ValueError('work_schema')
                failures+=full_thread_semantic_failures('ObservableWorkRecord',work)
                fail('work_identity',work['observable_work_id']!=result['observable_work_id'] or work['identity']!=identity)
                fail('work_premature_receipt',result['outcome']=='accepted' and work['result_receipt_ref'] is not None)
                fail('work_terminal_at_acceptance',result['outcome']=='accepted' and work['work_state'] in ('completed','failed','cancelled','recovery-required'))
    except Exception as exc:failures.append('stash_apply_response_unresolved:'+str(exc))
    if inputs!=saved:failures.append('stash_apply_response_inputs_mutated')
    if any(live[k]!=v for k,v in records.items()):failures.append('stash_apply_response_owner_record_mutated')
    return sorted(set(failures))


def fixture_dependencies(value,*,ui_module):
    """Explicit synthetic reader/digest doubles, not native authority."""
    records=deepcopy(value['records'])
    return dict(resolve_owner_record=lambda ref:deepcopy(records[ref]),canonical_request_digest=ui_module.owner_result_digest)


def stash_apply_dispatch_semantic_failures(definition,value,*,ui_module=None):
    if definition=='dispatch_binding':return full_thread_semantic_failures('IdentityEnvelope',value['identity'])
    if definition!='fixture_case':return []
    if ui_module is None:import pm_ui_command_response as ui_module
    return ui_module.response_bundle_failures(value['bundle'],**fixture_dependencies(value,ui_module=ui_module))
