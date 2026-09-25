"""ACT105 static composition, not a Backup engine or native authority proof.

All adapters are mandatory trusted owner interfaces. Original admission covers
actual Permissions/FileSafe/maintenance/confirmation/currentness; retention proof
authenticates actual preview issuance, revisions, original immutable membership,
decision applicability and pre-effect fences. Source custody is the existing
BRS-030 interface. Effect proof authenticates deletion/non-deletion/uncertainty,
not byte reclamation. Final disclosure authenticates current caller and the actual
error projection. No callback accepts a caller-supplied Boolean authority token.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json
import os
from pathlib import Path
import re
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from pm_backup_snapshot_semantics import validate_snapshot_source_records
from pm_full_thread_semantics import full_thread_semantic_failures, command_outcome_binding_failures

ROOT=Path(__file__).resolve().parents[1]
CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
SCHEMA='Plans/backup_selected_delete_contracts.schema.json'
BASE='Plans/backup_restore_system_contracts.schema.json'
FULL='Plans/full_thread_runtime_contracts.schema.json'
UI='Plans/ui_command_response.schema.json'
COMMAND='cmd.backup.delete'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.backup.selected_delete.result.v1'}

@lru_cache(maxsize=1)
def schemas():
    docs={'Plans/'+p.name:json.loads(p.read_text()) for p in (CANON/'Plans').glob('*.schema.json')}
    docs[SCHEMA]=json.loads((ROOT/SCHEMA).read_text())
    return docs,Registry().with_resources((s['$id'],Resource.from_contents(s)) for s in docs.values() if '$id' in s)

def shape(definition,value,filename=SCHEMA):
    docs,registry=schemas();s=docs[filename]
    return [e.message for e in Draft202012Validator(s if definition is None else {'$ref':s['$id']+'#/$defs/'+definition},registry=registry,format_checker=FormatChecker()).iter_errors(value)]

def instant(value):return datetime.fromisoformat(value.replace('Z','+00:00'))
def selected_key(value):
    s=value['snapshot'];return s['repository_id'],s['backup_destination_id'],s['snapshot_id'],value['repository_snapshot_ref']

def validate_delete_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
        resolve_record,canonical_digest,canonical_candidate_digest,verify_original_admission,
        verify_retention_authority,verify_source_custody,verify_delete_effect,check_current_disclosure):
    """Join retained original through actual owner records to common UI outcome.

    canonical_candidate_digest(preview, selected immutable repository refs) is
    the actual Backup owner hash contract, not an invented serialization codec.
    canonical_digest is the existing dispatcher request/result digest authority.
    Both are mandatory and must return lowercase SHA-256. Verification adapters
    return list[str]. Native fences and physical custody are unbuilt prerequisites.
    """
    inputs=(request,result,delivery_return_context);saved=deepcopy(inputs)
    request,result,delivery=deepcopy(saved);errors=[];cache={};live=[]
    callbacks=(resolve_record,canonical_digest,canonical_candidate_digest,verify_original_admission,
               verify_retention_authority,verify_source_custody,verify_delete_effect,check_current_disclosure)
    if not all(callable(c) for c in callbacks):return ['delete_dependencies_missing']
    def read(ref,definition,filename=SCHEMA):
        if ref not in cache:
            actual=resolve_record(ref);live.append((actual,deepcopy(actual)));cache[ref]=deepcopy(actual)
        value=deepcopy(cache[ref])
        if shape(definition,value,filename):raise ValueError('shape:'+str(definition))
        return value
    def proof(label,fn,*args):
        args=deepcopy(args);before=deepcopy(args);value=fn(*args)
        if type(value) is not list or any(type(x) is not str or not x for x in value):errors.append(label+'_invalid_response')
        else:errors.extend(label+':'+x for x in value)
        if args!=before:errors.append(label+'_inputs_mutated')
    def digest(fn,*values):
        args=deepcopy(values);before=deepcopy(args);value=fn(*args)
        if args!=before:errors.append('digest_inputs_mutated')
        if not isinstance(value,str) or re.fullmatch('[0-9a-f]{64}',value) is None:raise ValueError('digest_contract')
        return value
    original=response=observation=error=projection=receipt=work=None
    try:
        if shape('request',request) or shape('result',result):raise ValueError('input_shape')
        original=read(original_binding_ref,'dispatch_binding')
        o=read(outcome_ref,'CommandOutcomeRecord',FULL);response=read(response_ref,None,UI)
        if read(original['request_ref'],'request')!=request or original['arguments']!=request:errors.append('original_request')
        if read(o['owner_result_ref'],'result')!=result:errors.append('actual_result')
        if result['original_request_ref']!=request['request_ref'] or original['request_ref']!=request['request_ref']:errors.append('original_reference')
        for k in ('command_id','command_instance_id','operation_id','return_route_ref'):
            if result[k]!=request[k]:errors.append('result_'+k)
        for k in ('actor_ref','permission_snapshot_ref','idempotency_key'):
            if original[k]!=request[k]:errors.append('original_'+k)
        identity=original['identity']
        errors+=full_thread_semantic_failures('IdentityEnvelope',identity)
        errors+=full_thread_semantic_failures('CommandOutcomeRecord',o)
        errors+=command_outcome_binding_failures(response,o,outcome_ref)
        if any(identity[k]!=request[k] for k in ('operation_id','command_instance_id')):errors.append('original_identity_request')
        if identity!=o['identity'] or identity!=response['owner_identity']:errors.append('original_identity')
        if delivery!=original['return_context']:errors.append('original_caller')
        if shape('delivery_return_context',delivery,'Plans/backup_bounded_read_contracts.schema.json'):errors.append('caller_shape')
        if response['request_ref']!=request['request_ref'] or response['command_id']!=COMMAND or o['command_id']!=COMMAND:errors.append('response_request')
        if response['command_instance_id']!=request['command_instance_id'] or response['operation_id']!=request['operation_id']:errors.append('response_identity')
        if response['response_kind']!='owner_operation' or response['owner_result_schema_ref']!=BINDING or o['owner_result_schema_ref']!=BINDING:errors.append('response_binding')
        if response['owner_result_ref']!=o['owner_result_ref']:errors.append('response_result')
        if (response['original_dispatch_id'] if response['replayed'] else response['dispatch_id'])!=original['dispatch_id']:errors.append('original_dispatch')
        for k in ('payload_sha256','dispatch_frame_id','target_generation','idempotency_key'):
            if o[k]!=original[k]:errors.append('original_'+k)
        if digest(canonical_digest,request)!=original['payload_sha256'] or digest(canonical_digest,result)!=o['owner_result_sha256']:errors.append('original_digest')
        preview=read(request['retention_preview_ref'],'retention_preview',BASE)
        binding=read(request['repository_binding_ref'],'backup_repository_binding',BASE)
        policy=read(request['backup_policy_id'],'backup_policy',BASE)
        if policy['backup_policy_id']!=request['backup_policy_id'] or policy['policy_revision']!=request['policy_revision']:errors.append('policy_revision')
        if request['repository_binding_ref'] not in policy['repository_binding_ids'] or policy['server_id']!=binding['server_id']:errors.append('policy_repository')
        if binding['boundary_kind']=='project' and binding['project_id'] not in policy['project_ids']:errors.append('policy_project')
        if preview['retention_preview_id']!=request['retention_preview_ref']:errors.append('preview_identity')
        if binding['repository_binding_id']!=request['repository_binding_ref'] or binding['repository_id']!=request['repository_id']:errors.append('repository_identity')
        if identity['server_id']!=binding['server_id']:errors.append('repository_server')
        if binding['boundary_kind']=='project' and (identity['scope_kind']!='project' or identity['project_id']!=binding['project_id']):errors.append('repository_project')
        if binding['boundary_kind']=='server_catalog' and identity['scope_kind']!='server':errors.append('repository_catalog_scope')
        for k in ('repository_id','repository_revision','backup_policy_id','policy_revision','candidate_set_sha256'):
            if preview[k]!=request[k]:errors.append('preview_'+k)
        if preview['mutation_lease_ref']!=request['maintenance_lease_ref'] or preview['confirmation_receipt_ref']!=request['confirmation_receipt_ref']:errors.append('preview_admission')
        keys=[selected_key(s) for s in request['selected_input']['snapshots']]
        refs=[s['repository_snapshot_ref'] for s in request['selected_input']['snapshots']]
        snapshots=[k[:3] for k in keys]
        if len(set(keys))!=len(keys) or len(set(refs))!=len(refs) or len(set(snapshots))!=len(snapshots):errors.append('selection_duplicate')
        if set(refs)!=set(preview['candidate_snapshot_refs']) or len(preview['candidate_snapshot_refs'])!=len(refs):errors.append('preview_exact_set')
        if digest(canonical_candidate_digest,preview,sorted(refs))!=preview['candidate_set_sha256']:errors.append('candidate_hash')
        observation=read(result['observation_ref'],'observation')
        if observation['observation_ref']!=result['observation_ref'] or observation['original_request_ref']!=request['request_ref'] or observation['original_binding_ref']!=original_binding_ref:errors.append('observation_original')
        memberkeys=[selected_key(m['selected']) for m in observation['members']]
        if len(set(memberkeys))!=len(memberkeys) or set(memberkeys)!=set(keys):errors.append('observation_exact_set')
        effects=[];decisions=[]
        for member in observation['members']:
            selection=member['selected'];resolution=member['resolution'];effect=member['effect'];effects.append(effect)
            if selection['snapshot']!=resolution['selection']:errors.append('member_selection')
            if selection['snapshot']['repository_id']!=request['repository_id'] or selection['snapshot']['backup_destination_id'] not in binding['destination_binding_ids']:errors.append('member_repository')
            if selection['snapshot']['backup_destination_id'] not in policy['destination_binding_ids']:errors.append('policy_destination')
            resolved=resolution['disposition']=='resolved';descriptor=resolution['resolved_source']
            if resolved!=(descriptor is not None) or resolved!=(resolution['failure_reason'] is None):errors.append('resolution_disposition')
            if resolved:
                if descriptor['repository_snapshot_ref']!=selection['repository_snapshot_ref'] or descriptor['repository_binding_id']!=request['repository_binding_ref']:errors.append('immutable_member')
            elif effect not in ('unresolved','pending'):errors.append('unresolved_effect')
            if effect=='unresolved' and resolved:errors.append('resolved_as_unresolved')
            errors+=validate_snapshot_source_records(request,resolution,
                resolve_record=lambda kind,ref:read(ref,kind,BASE),
                verify_source_custody=lambda *args: _proof_result(proof,'source',verify_source_custody,*args),
                check_current_disclosure=lambda *args: _proof_result(proof,'source_disclosure',check_current_disclosure,*args))
            decision=None
            if member['retention_decision_ref'] is not None:
                decision=read(member['retention_decision_ref'],'backup_retention_decision',BASE)
                if not resolved or decision['decision_id']!=member['retention_decision_ref'] or decision['evaluated_backup_id']!=descriptor['backup_id']:errors.append('decision_identity')
                if decision['backup_policy_id']!=request['backup_policy_id'] or decision['policy_revision']!=request['policy_revision']:errors.append('decision_policy')
            decisions.append(decision)
            if effect in ('deleted','unknown'):
                admitted=observation['admitted_at_utc']
                if decision is None or decision['decision']!='delete_eligible' or any(decision[k] for k in ('protected','held','active_parent','last_known_good','recovery_required')):errors.append('delete_ineligible')
                if selection['repository_snapshot_ref'] in preview['held_snapshot_refs'] or selection['repository_snapshot_ref']==preview['last_known_good_snapshot_ref']:errors.append('preview_exclusion')
                if admitted is None or not instant(preview['created_at_utc'])<=instant(admitted)<instant(preview['expires_at_utc']):errors.append('preview_effect_expiry')
                if decision is not None and (decision['delete_after_utc'] is None or admitted is None or instant(decision['delete_after_utc'])>instant(admitted) or instant(decision['decided_at_utc'])>instant(admitted)):errors.append('decision_effect_time')
                if not member['effect_evidence_refs']:errors.append('effect_evidence_missing')
            if effect in ('not_deleted','unresolved','unknown') and member['reason_ref'] is None:errors.append('member_reason_missing')
        if not instant(original['accepted_at_utc'])<=instant(observation['observed_at_utc'])<=instant(result['completed_at_utc'])<=instant(o['observed_at']) or instant(response['ts'])<instant(result['completed_at_utc']):errors.append('result_time')
        if observation['admitted_at_utc'] is not None and not instant(original['accepted_at_utc'])<=instant(observation['admitted_at_utc'])<=instant(observation['observed_at_utc']):errors.append('admission_time')
        status=result['outcome']
        if status=='accepted':
            if set(effects)!={'pending'} or result['receipt_ref'] is not None or result['work_ref'] is None or result['error_ref'] is not None:errors.append('accepted_terminal')
            if o['outcome'] not in ('accepted','acknowledged','executing') or o['result_receipt_ref'] is not None:errors.append('accepted_outcome')
            if response['receipt_ref'] not in (None,o['acknowledgement_receipt_ref']):errors.append('accepted_receipt')
        else:
            if 'pending' in effects:errors.append('terminal_pending_member')
            if status=='completed' and set(effects)!={'deleted'}:errors.append('false_complete')
            if 'unknown' in effects and status!='recovery_required':errors.append('unknown_outcome')
            if status=='recovery_required' and observation['reconciliation_ref'] is None:errors.append('reconciliation_missing')
            receipt=read(result['receipt_ref'],'receipt')
            for k in ('original_request_ref','operation_id','command_instance_id','outcome','observation_ref','error_ref','completed_at_utc'):
                if receipt[k]!=result[k]:errors.append('receipt_'+k)
            if receipt['receipt_ref']!=result['receipt_ref'] or receipt['original_binding_ref']!=original_binding_ref or receipt['idempotency_key']!=request['idempotency_key']:errors.append('receipt_original')
            expected={'completed':'succeeded','failed':'failed','cancelled':'cancelled','recovery_required':'terminal_unknown'}[status]
            if o['outcome']!=expected or o['result_receipt_ref']!=result['receipt_ref'] or response['receipt_ref']!=result['receipt_ref']:errors.append('terminal_outcome')
        expected_ui={'accepted':('accepted','pending'),'completed':('accepted','succeeded'),'failed':('accepted','failed'),'cancelled':('accepted','cancelled'),'recovery_required':('accepted','recovery_required')}[status]
        if (response['ack_status'],response['result_status'])!=expected_ui:errors.append('response_outcome')
        if result['work_ref'] is not None:
            work=read(result['work_ref'],'ObservableWorkRecord',FULL);errors+=full_thread_semantic_failures('ObservableWorkRecord',work)
            if work['observable_work_id']!=result['work_ref'] or work['identity']!=identity:errors.append('work_original')
            if status=='accepted' and (work['work_state'] in ('completed','failed','cancelled','recovery-required') or work['result_receipt_ref'] is not None):errors.append('accepted_work_terminal')
        if status in ('completed','accepted'):
            if result['error_ref'] is not None or result['error_projection_ref'] is not None or o['error_ref'] is not None or response['error'] is not None:errors.append('unexpected_error')
        else:
            error=read(result['error_ref'],'backup_restore_command_error',BASE)
            projection=read(result['error_projection_ref'],'error_projection')
            if error['command_id']!=COMMAND or error['command_instance_id']!=request['command_instance_id'] or o['error_ref']!=result['error_ref']:errors.append('actual_error')
            if status=='recovery_required' and (error['retriable'] or error['recovery_ref']!=observation['reconciliation_ref']):errors.append('unknown_no_resubmit')
            if projection['projection_ref']!=result['error_projection_ref'] or projection['owner_error_ref']!=result['error_ref'] or projection['original_request_ref']!=request['request_ref'] or projection['identity']!=identity:errors.append('error_projection_original')
            if projection['ui_error']!=response['error'] or projection['return_context']!=delivery:errors.append('error_projection_value')
            if not instant(original['accepted_at_utc'])<=instant(projection['observed_at_utc'])<=instant(o['observed_at']):errors.append('error_projection_time')
        if response['event_refs']:errors.append('unadmitted_events')
        from pm_ui_command_response import replay_failures
        errors+=replay_failures(response,read(response['original_dispatch_id'],None,UI) if response['replayed'] else None)
        proof('admission',verify_original_admission,original,request,binding,preview)
        proof('retention',verify_retention_authority,original,request,preview,binding,policy,observation,decisions)
        proof('effect',verify_delete_effect,original,request,result,observation,receipt,work)
    except Exception as exc:errors.append('delete_resolution:'+type(exc).__name__)
    if original is not None:
        try:proof('disclosure',check_current_disclosure,original,request,result,response,delivery,error,projection)
        except Exception as exc:errors.append('delete_disclosure:'+type(exc).__name__)
    if inputs!=saved or any(a!=b for a,b in live):errors.append('delete_inputs_mutated')
    return sorted(set(errors))

def _proof_result(proof,label,fn,*args):
    proof(label,fn,*args);return []

def response_failures(bundle,dependencies):
    """Central hook: trusted retained-original resolver, never bundle authority."""
    if not isinstance(dependencies,dict):return ['delete_dependencies_missing']
    saved=deepcopy(bundle);live=[]
    try:
        def read(ref):
            value=dependencies['resolve_record'](ref);live.append((value,deepcopy(value)));return deepcopy(value)
        original=read(saved['original_binding_ref']);normalized=saved['normalized_request'];errors=[]
        expected={'request_ref':original['request_ref'],'command_id':COMMAND,
            'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],
            'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','dispatch_frame_id','target_generation')}}
        if any(normalized.get(k)!=v for k,v in expected.items()):errors.append('delete_normalized_original')
        if read(saved['resolved_outcome_ref'])!=saved['outcome'] or read(saved['response_ref'])!=saved['response']:errors.append('delete_bundle_actual')
        errors+=validate_delete_result(saved['owner_request'],saved['owner_result'],saved['original_binding_ref'],saved['resolved_outcome_ref'],saved['response_ref'],saved['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['delete_response_resolution:'+type(exc).__name__]
    if bundle!=saved or any(a!=b for a,b in live):errors.append('delete_bundle_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Explicit synthetic doubles; hashes and callbacks are NOT native proof."""
    from pm_ui_command_response import owner_result_digest
    return {'resolve_record':lambda ref:value['records'][ref],'canonical_digest':owner_result_digest,
            'canonical_candidate_digest':lambda preview,refs:preview['candidate_set_sha256'],
            **{k:lambda *args:[] for k in ('verify_original_admission','verify_retention_authority','verify_source_custody','verify_delete_effect','check_current_disclosure')}}

def selected_delete_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['delete_fixture_shape']
    return validate_delete_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
