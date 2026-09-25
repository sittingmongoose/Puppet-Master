"""Finite ACT-087 composition, not a secret handler or native authority proof.

All resolvers operate under authentic owner custody. Mandatory admission verifies
the original human/active Client, actual permission decision, connection and SIR
mapping. Submission proof verifies actual issuer, audience, freshness/revocation,
consumption/zeroization or truthful refusal/uncertainty, and actual source readback.
Scope proof authenticates owner operation/capability applicability and upstream
restrictions, including null-dimension applicability; null is never a wildcard.
Final disclosure independently checks current authorization without reexecuting.
These interfaces return list[str] failures, not caller-supplied allow Booleans.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path
import re
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from pm_full_thread_semantics import full_thread_semantic_failures

SCHEMA = 'Plans/credential_source_add_contracts.schema.json'
COMMAND = 'cmd.credential_source.add'
BINDING = {'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.credential.source_add.result.v1'}
DIMENSIONS = ('provider_id','profile_ref','server_id','project_id','execution_host_id','execution_environment_id','repository_ref')


@lru_cache(maxsize=None)
def validator(definition, canon_root=None):
    root = Path(canon_root) if canon_root else Path(__file__).resolve().parents[1]
    own = Path(__file__).resolve().parents[1]
    documents = [json.loads(p.read_text()) for p in (root/'Plans').glob('*.schema.json')]
    companion = json.loads((own/SCHEMA).read_text());documents.append(companion)
    registry = Registry().with_resources((d['$id'],Resource.from_contents(d)) for d in documents if '$id' in d)
    return Draft202012Validator({'$ref':companion['$id']+'#/$defs/'+definition},registry=registry,format_checker=FormatChecker())


def structural_failures(definition,value,*,canon_root=None):
    return [e.message for e in validator(definition,str(canon_root) if canon_root else None).iter_errors(value)]


def instant(value):
    return datetime.fromisoformat(value.replace('Z','+00:00'))


def scope_failures(requested,effective):
    errors=[]
    for label,scope in (('requested',requested),('effective',effective)):
        if scope is not None and scope['expires_at_utc'] is not None and instant(scope['expires_at_utc']) <= instant(scope['issued_at_utc']):
            errors.append('credential_'+label+'_scope_time')
    if effective is None:return errors
    if any(effective[k] != requested[k] for k in DIMENSIONS):errors.append('credential_scope_identity')
    for k in ('operation_refs','capability_refs'):
        if not set(effective[k]) <= set(requested[k]):errors.append('credential_scope_'+k)
    if instant(effective['issued_at_utc']) < instant(requested['issued_at_utc']):errors.append('credential_scope_issued_widening')
    end=requested['expires_at_utc'];actual=effective['expires_at_utc']
    if end is not None and (actual is None or instant(actual)>instant(end)):errors.append('credential_scope_expiry_widening')
    return errors


def response_failures(bundle,*,resolve_record,canonical_request_digest,
                      verify_original_admission,verify_secure_interaction,
                      verify_scope_authority,check_current_disclosure,canon_root=None):
    """Join authentic SIR original, existing expansion authority/permission/result,
    protected issuance metadata, secure receipt, source readback and common UI.

    Terminal immediate source-add only. Result.requested_state resolves to original
    request; effective_state resolves to this secure receipt (including no-effect
    and partial outcomes). Both are existing SafeRefs with exact typed referents.
    Distinct request_id, invocation_id and command_instance_id retain their actual
    authenticated original mapping. Replays disclose the original outcome only.
    """
    saved=deepcopy(bundle);errors=[];cache={};live={};request=None
    callbacks=(resolve_record,canonical_request_digest,verify_original_admission,
               verify_secure_interaction,verify_scope_authority,check_current_disclosure)
    if not all(callable(c) for c in callbacks):return ['credential_dependencies_missing']
    def read(kind,ref):
        if ref not in cache:
            value=resolve_record(ref);live[ref]=value;cache[ref]=deepcopy(value)
        value=deepcopy(cache[ref])
        if structural_failures(kind,value,canon_root=canon_root):raise ValueError(kind+'_schema')
        return value
    def checked(callback,label,*values):
        args=deepcopy(values);before=deepcopy(args)
        try:
            result=callback(*args)
            if not isinstance(result,list) or not all(isinstance(e,str) and e for e in result):return [label+'_invalid_response']
            return ([label+'_inputs_mutated'] if args!=before else [])+[label+':'+e for e in result]
        except Exception:return [label+'_unavailable']
    try:
        original=read('dispatch_binding',saved['original_binding_ref'])
        request=read('request',original['request_ref']);a=request['authority'];s=request['selection'];scope=s['requested_scope']
        result=saved['owner_result']
        if structural_failures('result',result,canon_root=canon_root):raise ValueError('result_schema')
        r=result['owner_result'];receipt=read('receipt',result['receipt_ref'])
        connection=read('connection',s['connection_source_ref'])
        submission=read('submission',s['secure_submission_ref'])
        permission=read('permission_decision',original['permission_decision_ref'])
        source=read('source',receipt['source_ref']) if receipt['source_ref'] is not None else None
        identity=original['identity'];errors+=full_thread_semantic_failures('IdentityEnvelope',identity)
        if original['arguments']!=request or saved.get('owner_request')!=request:errors.append('credential_original_arguments')
        if result['original_request_ref']!=original['request_ref'] or receipt['original_request_ref']!=original['request_ref'] or receipt['original_binding_ref']!=saved['original_binding_ref']:
            errors.append('credential_original_ref')
        for k in ('request_id','invocation_id','actor_ref','permission_snapshot_ref','idempotency_key','return_context_ref'):
            if original[k]!=a[k]:errors.append('credential_original_'+k)
        if original['initiating_client_id']!=s['initiating_client_id']:errors.append('credential_original_client')
        for k in ('command_id','action','request_id','invocation_id','sole_handler_target'):
            if r[k]!=a[k]:errors.append('credential_result_'+k)
        for k in ('request_id','invocation_id'):
            if receipt[k]!=a[k]:errors.append('credential_receipt_'+k)
        if receipt['identity']!=identity:errors.append('credential_receipt_identity')
        if a['target_refs']['connection_id']!=s['connection_id']:errors.append('credential_target_connection')
        if connection['source_ref']!=s['connection_source_ref'] or connection['connection_id']!=s['connection_id'] or connection['connection_generation']!=s['expected_connection_generation']:
            errors.append('credential_connection_selection')
        for k in ('owner_generation','topology_generation'):
            if connection[k]!=a['expected_'+k]:errors.append('credential_connection_'+k)
        for k in DIMENSIONS:
            if k in connection and connection[k]!=scope[k]:errors.append('credential_connection_scope_'+k)
        for k in ('server_id','project_id','execution_host_id','execution_environment_id'):
            if identity[k]!=scope[k]:errors.append('credential_identity_'+k)
        if identity['topology_generation']!=a['expected_topology_generation']:errors.append('credential_identity_topology')
        draft=connection['draft_record']
        if draft is not None:
            for ck,dk in (('connection_id','connection_id'),('connection_generation','connection_generation'),('provider_id','provider_id'),('profile_ref','profile_ref'),('server_id','home_server_id'),('project_id','project_id'),('execution_host_id','execution_host_id'),('execution_environment_id','execution_environment_id')):
                if connection[ck]!=draft[dk]:errors.append('credential_draft_'+ck)
        for k in ('command_id','action','sole_handler_target','permission_snapshot_ref','confirmation_ref'):
            if permission[k]!=a[k]:errors.append('credential_permission_'+k)
        if permission['decision_id']!=original['permission_decision_ref']:errors.append('credential_permission_ref')
        effect=receipt['effect_state'];disposition=receipt['input_disposition']
        if permission['decision']!='admitted' and (effect!='none' or disposition=='consumed_and_zeroized'):errors.append('credential_unadmitted_effect')
        errors+=checked(verify_original_admission,'credential_admission',request,original,connection,permission)
        for k,v in (('secure_submission_ref',s['secure_submission_ref']),('original_request_ref',original['request_ref']),('operation_id',identity['operation_id']),('actor_ref',a['actor_ref']),('initiating_client_id',s['initiating_client_id']),('connection_id',s['connection_id']),('connection_generation',s['expected_connection_generation']),('requested_scope',scope)):
            if submission[k]!=v:errors.append('credential_submission_'+k)
        if submission['binding_ref']!=submission['lifecycle']['binding_ref']:errors.append('credential_submission_lifecycle_binding')
        if receipt['secure_submission_ref']!=s['secure_submission_ref'] or receipt['submission_generation']!=submission['lifecycle']['generation']:errors.append('credential_receipt_submission')
        if receipt['requested_scope']!=scope:errors.append('credential_receipt_requested_scope')
        errors+=scope_failures(scope,receipt['effective_scope'])
        if receipt['receipt_ref']!=result['receipt_ref'] or result['receipt_ref'] not in r['receipt_refs']:errors.append('credential_result_receipt')
        if r['requested_state']!=original['request_ref'] or r['effective_state']!=result['receipt_ref']:errors.append('credential_result_state_referents')
        if r['outcome']!=receipt['outcome'] or r['completed_at_utc']!=receipt['completed_at_utc']:errors.append('credential_result_receipt_outcome')
        for k in ('owner_generation','topology_generation'):
            if r[k]!=receipt[k]:errors.append('credential_receipt_'+k)
        if r['operation_generation']!=identity['operation_generation'] or r['observed_operation_generation']!=r['operation_generation']:errors.append('credential_operation_generation')
        if instant(receipt['completed_at_utc'])<instant(original['accepted_at_utc']) or instant(original['accepted_at_utc'])<instant(a['requested_at_utc']):errors.append('credential_operation_time')
        if instant(submission['issued_at_utc'])>=instant(submission['lifecycle']['expires_at_utc']):errors.append('credential_submission_time')
        consumed=receipt['consumed_at_utc']
        checked_at=receipt['input_checked_at_utc']
        if disposition not in ('unknown','cancelled_before_consumption') and checked_at is None:errors.append('credential_input_check_missing')
        if checked_at is not None:
            if not instant(original['accepted_at_utc'])<=instant(checked_at)<=instant(receipt['completed_at_utc']):errors.append('credential_input_check_time')
            if disposition=='rejected_expired' and instant(checked_at)<instant(submission['lifecycle']['expires_at_utc']):errors.append('credential_false_expiry')
            if consumed is not None and instant(consumed)<instant(checked_at):errors.append('credential_consumption_before_check')
        if (disposition=='consumed_and_zeroized') != (consumed is not None):errors.append('credential_consumption_time_presence')
        if consumed is not None and not (instant(submission['issued_at_utc'])<=instant(consumed)<instant(submission['lifecycle']['expires_at_utc']) and instant(original['accepted_at_utc'])<=instant(consumed)<=instant(receipt['completed_at_utc'])):
            errors.append('credential_consumption_time')
        if (source is None)!=(receipt['source_generation'] is None) or (source is None)!=(receipt['effective_scope'] is None):errors.append('credential_source_presence')
        if effect in ('registered','partial') and source is None:errors.append('credential_known_effect_missing_source')
        if effect=='none' and source is not None:errors.append('credential_none_has_source')
        if source is not None:
            for k,v in (('source_ref',receipt['source_ref']),('source_generation',receipt['source_generation']),('registration_receipt_ref',result['receipt_ref']),('original_request_ref',original['request_ref']),('connection_id',s['connection_id']),('effective_scope',receipt['effective_scope'])):
                if source[k]!=v:errors.append('credential_source_'+k)
            if disposition not in ('consumed_and_zeroized','unknown'):errors.append('credential_source_without_consumption')
        success=receipt['outcome']=='succeeded'
        if success and (effect!='registered' or disposition!='consumed_and_zeroized' or source is None or source['status']!='registered' or receipt['failure_ref'] is not None or receipt['ui_error'] is not None):errors.append('credential_success_truth')
        if not success and receipt['failure_ref'] is None:errors.append('credential_failure_evidence')
        owner_error=receipt['owner_error']
        if (owner_error is None)!=success:errors.append('credential_owner_error_presence')
        if owner_error is not None:
            for k in ('command_id','action','request_id','sole_handler_target'):
                if owner_error[k]!=a[k]:errors.append('credential_owner_error_'+k)
            if owner_error['return_settlement']!=r['return_settlement']:errors.append('credential_owner_error_return')
            if not instant(original['accepted_at_utc'])<=instant(owner_error['occurred_at_utc'])<=instant(receipt['completed_at_utc']):errors.append('credential_owner_error_time')
            if owner_error['retryable']:errors.append('credential_secret_resubmission_forbidden')
            if effect=='none' and owner_error['effect_state'] not in ('none','known_not_applied'):errors.append('credential_error_effect_truth')
            if effect in ('registered','partial') and owner_error['effect_state'] not in ('known_applied','unknown','recovery_required'):errors.append('credential_error_effect_truth')
            if effect=='unknown' and owner_error['effect_state'] not in ('unknown','recovery_required'):errors.append('credential_error_effect_truth')
        unknown=(effect=='unknown' or disposition=='unknown' or receipt['outcome'] in ('effect_unknown','recovery_required') or (owner_error or {}).get('effect_state') in ('unknown','recovery_required'))
        if unknown and success:errors.append('credential_unknown_success')
        if receipt['outcome']=='cancelled' and not unknown:
            if receipt['ui_error'] is not None:errors.append('credential_cancelled_error')
        elif not success and receipt['ui_error'] is None:errors.append('credential_failure_error')
        errors+=checked(verify_secure_interaction,'credential_secure_proof',request,original,submission,receipt,source,r)
        errors+=checked(verify_scope_authority,'credential_scope_proof',request,connection,permission,receipt,source)
        response=saved['response'];outcome=saved['outcome'];normalized=saved['normalized_request']
        if response['owner_result_schema_ref']!=BINDING:errors.append('credential_response_binding')
        if response['owner_identity']!=identity or outcome['identity']!=identity:errors.append('credential_response_identity')
        for k,v in (('command_id',COMMAND),('command_instance_id',identity['command_instance_id']),('operation_id',identity['operation_id']),('request_ref',original['request_ref'])):
            if response[k]!=v or normalized.get(k)!=v:errors.append('credential_response_'+k)
        dispatch=response['original_dispatch_id'] if response['replayed'] else response['dispatch_id']
        if dispatch!=original['dispatch_id']:errors.append('credential_response_dispatch')
        for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id'):
            if original[k]!=normalized.get(k) or original[k]!=outcome[k]:errors.append('credential_response_'+k)
        digest_args=deepcopy(request);digest=canonical_request_digest(digest_args)
        if not isinstance(digest,str) or re.fullmatch('[0-9a-f]{64}',digest) is None:errors.append('credential_digest_contract')
        elif digest!=original['payload_sha256']:errors.append('credential_original_digest')
        if digest_args!=request:errors.append('credential_digest_mutated')
        if 'delivery_return_context' not in saved or structural_failures('delivery_return_context',saved.get('delivery_return_context'),canon_root=canon_root):errors.append('credential_delivery_missing_or_schema')
        elif saved['delivery_return_context']!=original['return_context']:errors.append('credential_delivery_original')
        if r['return_settlement']['return_context_ref']!=original['return_context_ref']:errors.append('credential_return_ref')
        if original['return_context'] is None and r['return_settlement']['settlement']=='restored':errors.append('credential_fabricated_restored_caller')
        expected='terminal_unknown' if unknown else receipt['outcome']
        if outcome['outcome']!=expected or response['result_status']=='no_op':errors.append('credential_response_outcome')
        if response['receipt_ref']!=result['receipt_ref'] or outcome['result_receipt_ref']!=result['receipt_ref']:errors.append('credential_response_receipt')
        if outcome['error_ref']!=receipt['failure_ref'] or response['error']!=receipt['ui_error']:errors.append('credential_response_error')
        if any(instant(t)<instant(receipt['completed_at_utc']) for t in (response['ts'],outcome['observed_at'])):errors.append('credential_response_time')
        if response['event_refs']:errors.append('credential_unadmitted_events')
    except Exception as exc:
        errors.append('credential_unavailable:'+str(exc) if isinstance(exc,ValueError) else 'credential_unavailable:'+type(exc).__name__)
    if request is not None:errors+=checked(check_current_disclosure,'credential_final_disclosure',request,saved.get('owner_result'))
    if bundle!=saved or any(live[k]!=v for k,v in cache.items()):errors.append('credential_inputs_mutated')
    return sorted(set(errors))


def fixture_dependencies(value,ui):
    """Synthetic fixture dependencies only: all native proof remains NOT_RUN."""
    records=deepcopy(value['records'])
    return dict(resolve_owner_record=lambda ref:records[ref],canonical_request_digest=ui.owner_result_digest,
        credential_source_dependencies=dict(verify_original_admission=lambda *_:[],verify_secure_interaction=lambda *_:[],
            verify_scope_authority=lambda *_:[],check_current_disclosure=lambda *_:[]))


def credential_source_semantic_failures(definition,value,*,canon_root=None):
    if definition!='fixture_case':return []
    import pm_ui_command_response as ui
    return ui.response_bundle_failures(value['bundle'],**fixture_dependencies(value,ui))
