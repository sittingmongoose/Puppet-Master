"""ACT119 reviewed new-domain copy composition; native crypto/effects remain unproved."""
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
SCHEMA='Plans/backup_reencrypt_contracts.schema.json'
BASE='Plans/backup_restore_system_contracts.schema.json'
FULL='Plans/full_thread_runtime_contracts.schema.json'
UI='Plans/ui_command_response.schema.json'
COMMAND='cmd.backup.recovery_key.reencrypt'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.backup.reencrypt.result.v1'}

@lru_cache(maxsize=1)
def schemas():
    docs={'Plans/'+p.name:json.loads(p.read_text()) for p in (CANON/'Plans').glob('*.schema.json')}
    docs[SCHEMA]=json.loads((ROOT/SCHEMA).read_text())
    return docs,Registry().with_resources((s['$id'],Resource.from_contents(s)) for s in docs.values() if '$id' in s)

def shape(definition,value,filename=SCHEMA):
    docs,registry=schemas();s=docs[filename]
    return [e.message for e in Draft202012Validator(s if definition is None else {'$ref':s['$id']+'#/$defs/'+definition},registry=registry,format_checker=FormatChecker()).iter_errors(value)]

def instant(value):return datetime.fromisoformat(value.replace('Z','+00:00'))
def snapshot_key(selection):return tuple(selection[k] for k in ('repository_id','backup_destination_id','snapshot_id'))
def validate_reencrypt_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
        resolve_record,canonical_digest,verify_original_admission,
        verify_review_admission,verify_source_custody,verify_native_reencryption,check_current_disclosure):
    """ACT119 original/review/target/verified-effect/common-response joins.

    Native adapters authenticate actual human protected submission/session, current
    review/Permissions/FileSafe/lease/confirmation, immutable source custody and real
    new-domain engine creation/copy/verification. They receive all typed originals
    and actual records. Neither unequal IDs/hashes nor fixture callbacks prove crypto.
    verify_review_admission authenticates protected authorization at the actual
    observation.admitted_at_utc, including the session's then-valid state; a later
    closed session neither supplies new admission nor erases retained effects.
    Final disclosure authenticates actual caller/source/target/error visibility.
    """
    inputs=(request,result,delivery_return_context);saved=deepcopy(inputs)
    request,result,delivery=deepcopy(saved);errors=[];cache={};live=[]
    callbacks=(resolve_record,canonical_digest,verify_original_admission,
               verify_review_admission,verify_source_custody,verify_native_reencryption,check_current_disclosure)
    if not all(callable(c) for c in callbacks):return ['reencrypt_dependencies_missing']
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
        bound={**request['authority'],'operation_id':request['operation_id'],'request_ref':request['request_ref']}
        original=read(original_binding_ref,'dispatch_binding')
        o=read(outcome_ref,'CommandOutcomeRecord',FULL);response=read(response_ref,None,UI)
        if read(original['request_ref'],'request')!=request or original['arguments']!=request:errors.append('original_request')
        if read(o['owner_result_ref'],'result')!=result:errors.append('actual_result')
        if result['original_request_ref']!=request['request_ref'] or original['request_ref']!=request['request_ref']:errors.append('original_reference')
        for k in ('command_id','command_instance_id','operation_id','return_route_ref'):
            if result[k]!=bound[k]:errors.append('result_'+k)
        for k in ('actor_ref','permission_snapshot_ref','idempotency_key'):
            if original[k]!=bound[k]:errors.append('original_'+k)
        identity=original['identity']
        errors+=full_thread_semantic_failures('IdentityEnvelope',identity)
        errors+=full_thread_semantic_failures('CommandOutcomeRecord',o)
        errors+=command_outcome_binding_failures(response,o,outcome_ref)
        if any(identity[k]!=bound[k] for k in ('operation_id','command_instance_id')):errors.append('original_identity_request')
        if identity!=o['identity'] or identity!=response['owner_identity']:errors.append('original_identity')
        if delivery!=original['return_context']:errors.append('original_caller')
        if shape('delivery_return_context',delivery,'Plans/backup_bounded_read_contracts.schema.json'):errors.append('caller_shape')
        if response['request_ref']!=request['request_ref'] or response['command_id']!=COMMAND or o['command_id']!=COMMAND:errors.append('response_request')
        if response['command_instance_id']!=bound['command_instance_id'] or response['operation_id']!=request['operation_id']:errors.append('response_identity')
        if response['response_kind']!='owner_operation' or response['owner_result_schema_ref']!=BINDING or o['owner_result_schema_ref']!=BINDING:errors.append('response_binding')
        if response['owner_result_ref']!=o['owner_result_ref']:errors.append('response_result')
        if (response['original_dispatch_id'] if response['replayed'] else response['dispatch_id'])!=original['dispatch_id']:errors.append('original_dispatch')
        for k in ('payload_sha256','dispatch_frame_id','target_generation','idempotency_key'):
            if o[k]!=original[k]:errors.append('original_'+k)
        if digest(canonical_digest,request)!=original['payload_sha256'] or digest(canonical_digest,result)!=o['owner_result_sha256']:errors.append('original_digest')
        a=request['authority'];review=read(request['preview_ref'],'review')
        if review['preview_ref']!=request['preview_ref'] or review['original_request_ref']!=request['request_ref'] or review['authority']!=a:errors.append('review_original')
        if instant(review['reviewed_at_utc'])>instant(original['accepted_at_utc']):errors.append('review_after_acceptance')
        oldset=read(review['old_recovery_set_ref'],'recovery_set_public_record',BASE)
        binding=read(review['source_repository_binding_ref'],'backup_repository_binding',BASE)
        if oldset['recovery_set_id']!=a['recovery_set_id'] or oldset['recovery_set_generation']!=a['recovery_set_generation'] or binding['recovery_set_id']!=a['recovery_set_id'] or binding['repository_id']!=a['repository_id'] or binding['repository_binding_id']!=review['source_repository_binding_ref'] or a['repository_id'] not in oldset['repository_ids']:errors.append('source_authority')
        if a['new_recovery_set_id']==a['recovery_set_id']:errors.append('new_domain_not_distinct')
        if binding['server_id']!=identity['server_id'] or binding['boundary_kind']=='project' and (identity['scope_kind']!='project' or identity['project_id']!=binding['project_id']) or binding['boundary_kind']=='server_catalog' and identity['scope_kind']!='server':errors.append('source_identity')
        session=read(review['protected_session_ref'],'recovery_kit_delivery_session',BASE)
        if session['action']!='reencrypt' or session['audience_client_id']!=a['initiating_client_id'] or any(session[k]!=a[k] for k in ('recovery_set_id','recovery_set_generation','human_step_up_receipt_ref')):errors.append('protected_original')
        # Current channel closure is not retroactive revocation of an actual
        # admission. Fresh pending acceptance still needs an available channel;
        # historical effect disclosure requires the native admission proof below.
        if result['outcome']=='accepted' and session['terminal_status'] in ('cancelled','expired','failed'):errors.append('protected_session_unavailable')
        targets=review['targets'];targetrefs=[t['destination_ref'] for t in targets]
        if len(set(targetrefs))!=len(targetrefs) or set(targetrefs)!=set(request['new_destination_refs']):errors.append('target_exact_set')
        destinations=[]
        for target in targets:
            raw=read(target['destination_ref'],'destination');destination=raw
            if raw['schema_id'].endswith('.v3'):
                if raw['destination_state_role']!='observed_result':errors.append('destination_unresolved')
                destination=raw['destination']
            destinations.append(destination)
            if destination['backup_destination_id']!=target['backup_destination_id'] or destination['destination_generation']!=target['destination_generation'] or destination['owning_server_id']!=identity['server_id']:errors.append('destination_original')
            if target['intended_repository_id'] in oldset['repository_ids']:errors.append('target_old_repository')
        histories=review['history'];keys=[snapshot_key(h['snapshot']) for h in histories]
        if len(set(keys))!=len(keys) or len({h['repository_snapshot_ref'] for h in histories})!=len(histories):errors.append('history_duplicate')
        if any(h['snapshot']['repository_id']!=a['repository_id'] or h['snapshot']['backup_destination_id'] not in binding['destination_binding_ids'] for h in histories):errors.append('history_outside_source')
        observation=read(result['observation_ref'],'observation')
        if observation['observation_ref']!=result['observation_ref'] or observation['original_request_ref']!=request['request_ref'] or observation['preview_ref']!=request['preview_ref']:errors.append('observation_original')
        resolutions=observation['sources'];sourcekeys=[snapshot_key(r['selection']) for r in resolutions]
        if len(sourcekeys)!=len(keys) or set(sourcekeys)!=set(keys):errors.append('source_exact_set')
        resolved={};manifests=[]
        for resolution in resolutions:
            def source_reader(kind,ref):return read(ref,kind,BASE)
            errors+=validate_snapshot_source_records({'selected_input':{}},resolution,resolve_record=source_reader,
                verify_source_custody=lambda *args:_proof_result(proof,'source',verify_source_custody,original,request,review,*args[1:]),
                check_current_disclosure=lambda *args:[])
            # Current disclosure is mandatory once below with all actual records;
            # this local structural-helper callback grants no source permission.
            if resolution['disposition']=='unresolved':continue
            key=snapshot_key(resolution['selection']);desc=resolution['resolved_source'];resolved[key]=desc
            selected=next(h for h in histories if snapshot_key(h['snapshot'])==key)
            if desc['repository_binding_id']!=review['source_repository_binding_ref'] or desc['repository_snapshot_ref']!=selected['repository_snapshot_ref'] or desc['recovery_set_id']!=a['recovery_set_id'] or desc['server_id']!=identity['server_id']:errors.append('immutable_source_original')
            manifests.append(read(desc['manifest_ref'],'backup_manifest',BASE))
        admitted=observation['admitted_at_utc']
        if admitted is not None:
            if not instant(original['accepted_at_utc'])<=instant(admitted)<=instant(observation['observed_at_utc']):errors.append('admission_time')
            if not instant(session['created_at_utc'])<=instant(admitted)<instant(session['expires_at_utc']):errors.append('protected_expired_at_effect')
        proof('admission',verify_original_admission,original,request,review,session)
        proof('review',verify_review_admission,original,request,review,oldset,binding,session,destinations,observation)
        newset=None
        if observation['new_recovery_set_ref'] is not None:
            newset=read(observation['new_recovery_set_ref'],'recovery_set_public_record',BASE)
            if newset['recovery_set_id']!=a['new_recovery_set_id'] or newset['recovery_set_id']==oldset['recovery_set_id']:errors.append('new_set_identity')
        targetobservations=observation['targets'];observedrefs=[t['destination_ref'] for t in targetobservations]
        if len(observedrefs)!=len(targetrefs) or set(observedrefs)!=set(targetrefs):errors.append('observed_target_exact_set')
        actualtargets=[];domains=[];verifications=[];unknown=False;attempted=False;all_verified=True
        for target in targetobservations:
            planned=next(t for t in targets if t['destination_ref']==target['destination_ref']);creation=target['creation_state']
            actual=None;domain=None;unknown|=creation=='unknown';attempted|=creation not in ('pending','not_attempted')
            if creation=='known_applied':
                actual=read(target['new_repository_binding_ref'],'backup_repository_binding',BASE);domain=read(target['domain_evidence_ref'],'domain_evidence')
                actualtargets.append(actual);domains.append(domain)
                if newset is None or actual['recovery_set_id']!=a['new_recovery_set_id'] or actual['repository_id']!=planned['intended_repository_id'] or actual['repository_binding_id']!=target['new_repository_binding_ref'] or planned['backup_destination_id'] not in actual['destination_binding_ids']:errors.append('created_target_identity')
                if newset is not None and actual['repository_id'] not in newset['repository_ids']:errors.append('created_set_membership')
                if any(actual[k]!=binding[k] for k in ('server_id','project_id','project_vault_id','boundary_kind')):errors.append('created_target_scope')
                expected={'domain_evidence_ref':target['domain_evidence_ref'],'original_request_ref':request['request_ref'],'preview_ref':request['preview_ref'],'destination_ref':target['destination_ref'],'source_recovery_set_id':a['recovery_set_id'],'new_recovery_set_id':a['new_recovery_set_id'],'new_recovery_set_ref':observation['new_recovery_set_ref'],'new_repository_binding_ref':target['new_repository_binding_ref'],'new_repository_id':planned['intended_repository_id']}
                if any(domain[k]!=v for k,v in expected.items()) or newset is not None and domain['engine_format_ref']!=newset['engine_format_ref']:errors.append('domain_original')
                if admitted is None or not instant(admitted)<=instant(domain['observed_at_utc'])<=instant(observation['observed_at_utc']):errors.append('domain_time')
                if not target['evidence_refs']:errors.append('created_without_evidence')
            elif target['new_repository_binding_ref'] is not None or target['domain_evidence_ref'] is not None:errors.append('uncreated_target_claim')
            else:all_verified=False
            members=target['history'];memberkeys=[snapshot_key(h['source']) for h in members]
            if len(memberkeys)!=len(keys) or set(memberkeys)!=set(keys):errors.append('target_history_exact_set')
            for member in members:
                state=member['state'];key=snapshot_key(member['source']);unknown|=state=='unknown';attempted|=state not in ('pending','not_attempted')
                if state!='verified':all_verified=False
                if state in ('copied_unverified','verified'):
                    if creation!='known_applied' or key not in resolved or member['target_snapshot_id'] is None or member['target_manifest_sha256'] is None or not member['evidence_refs']:errors.append('copy_without_actual_source_target')
                if state in ('pending','not_attempted','known_not_applied') and any(member[k] is not None for k in ('target_snapshot_id','target_manifest_sha256','verification_ref')):errors.append('unapplied_copy_claim')
                if state=='verified' and member['verification_ref'] is None:errors.append('verification_missing')
                if member['verification_ref'] is not None:
                    verification=read(member['verification_ref'],'verification');verifications.append(verification)
                    desc=resolved.get(key)
                    expected={'verification_ref':member['verification_ref'],'original_request_ref':request['request_ref'],'preview_ref':request['preview_ref'],'source':member['source'],'destination_ref':target['destination_ref'],'new_repository_binding_ref':target['new_repository_binding_ref'],'target_snapshot_id':member['target_snapshot_id'],'target_manifest_sha256':member['target_manifest_sha256']}
                    if any(verification[k]!=v for k,v in expected.items()) or desc is None or verification['source_manifest_ref']!=desc['manifest_ref'] or verification['source_manifest_sha256']!=desc['manifest_sha256']:errors.append('verification_original')
                    if state=='verified' and verification['status']!='passed':errors.append('verification_not_passed')
                    if state!='verified' and verification['status']=='passed':errors.append('verified_effect_erased')
                    if domain is None or not instant(domain['observed_at_utc'])<=instant(verification['observed_at_utc'])<=instant(observation['observed_at_utc']):errors.append('verification_time')
        # Public owner records describe actual created membership, not merely
        # the intended plan. Multiple reviewed destinations may share a repo.
        created_members={}
        for target in targetobservations:
            if target['creation_state']=='known_applied':
                planned=next(t for t in targets if t['destination_ref']==target['destination_ref'])
                created_members.setdefault(planned['intended_repository_id'],set()).add(planned['backup_destination_id'])
        if newset is not None and set(newset['repository_ids'])!=set(created_members):errors.append('created_set_exact_membership')
        for actual in actualtargets:
            if set(actual['destination_binding_ids'])!=created_members.get(actual['repository_id'],set()):errors.append('created_destination_exact_membership')
        if attempted and admitted is None:errors.append('effect_without_admission')
        if attempted or newset is not None:
            afterset=read(observation['old_recovery_set_after_ref'],'recovery_set_public_record',BASE);afterbinding=read(observation['source_repository_after_ref'],'backup_repository_binding',BASE)
            if {k:v for k,v in afterset.items() if k not in ('currentness_ref','updated_at_utc')}!={k:v for k,v in oldset.items() if k not in ('currentness_ref','updated_at_utc')}:errors.append('old_key_or_set_changed')
            if {k:v for k,v in afterbinding.items() if k!='currentness_ref'}!={k:v for k,v in binding.items() if k!='currentness_ref'}:errors.append('old_repository_or_policy_changed')
        status=result['outcome']
        if not instant(original['accepted_at_utc'])<=instant(observation['observed_at_utc'])<=instant(result['completed_at_utc'])<=instant(o['observed_at']) or instant(response['ts'])<instant(result['completed_at_utc']):errors.append('result_time')
        if status=='accepted':
            if attempted or newset is not None or any(t['creation_state']!='pending' or any(h['state']!='pending' for h in t['history']) for t in targetobservations) or result['receipt_ref'] is not None or result['work_ref'] is None or result['error_ref'] is not None or observation['reconciliation_ref'] is not None:errors.append('accepted_terminal')
            if o['outcome'] not in ('accepted','acknowledged','executing') or o['result_receipt_ref'] is not None:errors.append('accepted_outcome')
            if response['receipt_ref'] not in (None,o['acknowledgement_receipt_ref']):errors.append('accepted_receipt')
        else:
            if any(t['creation_state']=='pending' or any(h['state']=='pending' for h in t['history']) for t in targetobservations):errors.append('terminal_pending_effect')
            if status=='completed' and (not all_verified or set(resolved)!=set(keys) or newset is None):errors.append('false_complete')
            if unknown and status!='recovery_required':errors.append('unknown_outcome')
            if status=='recovery_required' and (not unknown or observation['reconciliation_ref'] is None):errors.append('reconciliation_missing')
            receipt=read(result['receipt_ref'],'receipt')
            for k in ('original_request_ref','operation_id','command_instance_id','outcome','observation_ref','error_ref','completed_at_utc'):
                if receipt[k]!=result[k]:errors.append('receipt_'+k)
            if receipt['receipt_ref']!=result['receipt_ref'] or receipt['original_binding_ref']!=original_binding_ref or receipt['idempotency_key']!=a['idempotency_key']:errors.append('receipt_original')
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
            if error['command_id']!=COMMAND or error['command_instance_id']!=bound['command_instance_id'] or o['error_ref']!=result['error_ref']:errors.append('actual_error')
            if status=='recovery_required' and (error['retriable'] or error['recovery_ref']!=observation['reconciliation_ref']):errors.append('unknown_no_resubmit')
            if projection['projection_ref']!=result['error_projection_ref'] or projection['owner_error_ref']!=result['error_ref'] or projection['original_request_ref']!=request['request_ref'] or projection['identity']!=identity:errors.append('error_projection_original')
            if projection['ui_error']!=response['error'] or projection['return_context']!=delivery:errors.append('error_projection_value')
            if not instant(original['accepted_at_utc'])<=instant(projection['observed_at_utc'])<=instant(o['observed_at']):errors.append('error_projection_time')
        if response['event_refs']:errors.append('unadmitted_events')
        from pm_ui_command_response import replay_failures
        errors+=replay_failures(response,read(response['original_dispatch_id'],None,UI) if response['replayed'] else None)
        proof('effect',verify_native_reencryption,original,request,review,oldset,binding,destinations,observation,newset,actualtargets,domains,verifications,manifests,receipt,work)
    except Exception as exc:errors.append('reencrypt_resolution:'+type(exc).__name__)
    if original is not None:
        try:proof('disclosure',check_current_disclosure,original,request,result,response,delivery,error,projection,cache)
        except Exception as exc:errors.append('reencrypt_disclosure:'+type(exc).__name__)
    if inputs!=saved or any(a!=b for a,b in live):errors.append('reencrypt_inputs_mutated')
    return sorted(set(errors))

def _proof_result(proof,label,fn,*args):
    proof(label,fn,*args);return []

def response_failures(bundle,dependencies):
    """Central hook: trusted retained-original resolver, never bundle authority."""
    if not isinstance(dependencies,dict):return ['reencrypt_dependencies_missing']
    saved=deepcopy(bundle);live=[]
    try:
        def read(ref):
            value=dependencies['resolve_record'](ref);live.append((value,deepcopy(value)));return deepcopy(value)
        original=read(saved['original_binding_ref']);normalized=saved['normalized_request'];errors=[]
        expected={'request_ref':original['request_ref'],'command_id':COMMAND,
            'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],
            'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','dispatch_frame_id','target_generation')}}
        if any(normalized.get(k)!=v for k,v in expected.items()):errors.append('reencrypt_normalized_original')
        if read(saved['resolved_outcome_ref'])!=saved['outcome'] or read(saved['response_ref'])!=saved['response']:errors.append('reencrypt_bundle_actual')
        errors+=validate_reencrypt_result(saved['owner_request'],saved['owner_result'],saved['original_binding_ref'],saved['resolved_outcome_ref'],saved['response_ref'],saved['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['reencrypt_response_resolution:'+type(exc).__name__]
    if bundle!=saved or any(a!=b for a,b in live):errors.append('reencrypt_bundle_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Explicit synthetic doubles; hashes and callbacks are NOT native proof."""
    from pm_ui_command_response import owner_result_digest
    return {'resolve_record':lambda ref:value['records'][ref],'canonical_digest':owner_result_digest,
            **{k:lambda *args:[] for k in ('verify_original_admission','verify_review_admission','verify_source_custody','verify_native_reencryption','check_current_disclosure')}}

def reencrypt_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['reencrypt_fixture_shape']
    return validate_reencrypt_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
