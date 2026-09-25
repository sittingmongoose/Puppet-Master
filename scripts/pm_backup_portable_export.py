"""ACT111 static encrypted export bindings. Native encryption/effects remain unproved."""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json
import hashlib
import os
from pathlib import Path
import re
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from pm_backup_snapshot_semantics import validate_snapshot_source_records
from pm_full_thread_semantics import full_thread_semantic_failures, command_outcome_binding_failures

ROOT=Path(__file__).resolve().parents[1]
CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
SCHEMA='Plans/backup_portable_export_contracts.schema.json'
BASE='Plans/backup_restore_system_contracts.schema.json'
FULL='Plans/full_thread_runtime_contracts.schema.json'
UI='Plans/ui_command_response.schema.json'
COMMAND='cmd.backup.export'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.backup.portable_export.result.v1'}

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
def validate_export_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
        resolve_record,canonical_digest,read_output_bytes,verify_original_admission,
        verify_engine_admission,verify_source_custody,verify_export_effect,check_current_disclosure):
    """Actual original/source/destination/engine/output/caller joins, not runtime proof.

    resolve_record returns genuine owner records, not caller records. Source custody
    reuses the immutable snapshot owner. verify_engine_admission authenticates the
    exact supported encrypted operation, reviewed scope, destination Permissions and
    FileSafe, and actual pre-effect currentness. verify_export_effect authenticates
    achieved closure/encryption, all outputs and cleanup under the native effect fence.
    read_output_bytes(output,destination,admission) reads the actual delivered bytes;
    returning bytes is not itself proof of encryption or authorized native production.
    check_current_disclosure authenticates source/destination/caller/error disclosure.
    """
    inputs=(request,result,delivery_return_context);saved=deepcopy(inputs)
    request,result,delivery=deepcopy(saved);errors=[];cache={};live=[]
    callbacks=(resolve_record,canonical_digest,read_output_bytes,verify_original_admission,
               verify_engine_admission,verify_source_custody,verify_export_effect,check_current_disclosure)
    if not all(callable(c) for c in callbacks):return ['export_dependencies_missing']
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
        destination=read(request['destination_ref'],'destination')
        if destination['destination_ref']!=request['destination_ref'] or destination['original_request_ref']!=request['request_ref'] or destination['initiating_client_id']!=request['initiating_client_id'] or destination['server_id']!=identity['server_id']:errors.append('destination_original')
        proof('admission',verify_original_admission,original,request,destination)
        selections=request['snapshots'];ids=request['snapshot_ids']
        keys=[snapshot_key(s['snapshot']) for s in selections]
        if len(set(keys))!=len(keys) or len({s['repository_snapshot_ref'] for s in selections})!=len(selections) or len(set(ids))!=len(ids) or set(ids)!={k[2] for k in keys}:errors.append('selection_exact_set')
        requested={snapshot_key(m['snapshot']):m for m in request['dependency_scope']}
        if len(requested)!=len(request['dependency_scope']) or set(requested)!=set(keys):errors.append('scope_exact_set')
        observation=read(result['observation_ref'],'observation')
        if observation['observation_ref']!=result['observation_ref'] or observation['original_request_ref']!=request['request_ref'] or observation['destination_ref']!=request['destination_ref'] or set(observation['snapshot_ids'])!=set(ids):errors.append('observation_original')
        observed=[r['selection'] for r in observation['sources']]
        if len(observed)!=len(keys) or {snapshot_key(s) for s in observed}!=set(keys):errors.append('source_exact_set')
        manifests=[];resolved=[]
        for resolution in observation['sources']:
            select=resolution['selection'];key=snapshot_key(select)
            def source_reader(kind,ref):return read(ref,kind,BASE)
            errors+=validate_snapshot_source_records({'selected_input':request},resolution,resolve_record=source_reader,
                verify_source_custody=lambda *args:_proof_result(proof,'source',verify_source_custody,original,request,*args[1:]),
                check_current_disclosure=lambda *args:[])
            # Final disclosure is required once below against all genuine resolved
            # records; this local callback does not supply any authority.
            if resolution['disposition']=='unresolved':continue
            desc=resolution['resolved_source'];resolved.append(key)
            manifest=read(desc['manifest_ref'],'backup_manifest',BASE);manifests.append(manifest)
            member=next(s for s in selections if s['snapshot']==select)
            if member['repository_snapshot_ref']!=desc['repository_snapshot_ref']:errors.append('immutable_reference')
            if desc['server_id']!=identity['server_id'] or identity['scope_kind']=='project' and desc['project_id']!=identity['project_id']:errors.append('source_identity')
            scope=requested[key]
            if scope['manifest_ref']!=desc['manifest_ref'] or scope['manifest_sha256']!=desc['manifest_sha256']:errors.append('scope_manifest')
            if scope['family_dispositions']!=manifest['family_dispositions']:errors.append('scope_family_declarations')
            object_ids=[x['object_id'] for x in manifest['objects']]
            if len(set(object_ids))!=len(object_ids) or not set(scope['object_ids'])<=set(object_ids):errors.append('scope_object_membership')
        admission=None
        if observation['engine_admission_ref'] is not None:
            admission=read(observation['engine_admission_ref'],'engine_admission')
            if admission['admission_ref']!=observation['engine_admission_ref'] or admission['original_request_ref']!=request['request_ref'] or admission['destination_ref']!=request['destination_ref'] or set(admission['snapshot_ids'])!=set(ids) or admission['dependency_scope']!=request['dependency_scope']:errors.append('engine_original')
            if any(admission[k]!=request[k] for k in ('expected_currentness_ref','expected_currentness_sha256')) or admission['destination_currentness_ref']!=destination['currentness_ref'] or admission['destination_currentness_sha256']!=destination['currentness_sha256']:errors.append('engine_currentness')
            if not instant(original['accepted_at_utc'])<=instant(admission['admitted_at_utc'])<=instant(observation['observed_at_utc']):errors.append('engine_time')
        status=result['outcome'];effect=observation['effect_state'];outputs=observation['outputs']
        proof('engine',verify_engine_admission,original,request,destination,admission,observation,manifests)
        if effect in ('known_applied','unknown') and admission is None:errors.append('effect_without_admission')
        if outputs and effect not in ('known_applied','unknown'):errors.append('effect_erased')
        if len({x['output_ref'] for x in outputs})!=len(outputs):errors.append('output_duplicate')
        delivered=set()
        for output in outputs:
            output_keys=[snapshot_key(s) for s in output['snapshots']]
            if output['destination_ref']!=request['destination_ref'] or not set(output_keys)<=set(keys) or len(set(output_keys))!=len(output_keys) or admission is None or output['encryption_metadata_ref']!=admission['encryption_metadata_ref']:errors.append('output_original')
            if not set(output_keys)<=set(resolved):errors.append('output_source_unresolved')
            delivered.update(output_keys)
            if not errors:
                args=deepcopy((output,destination,admission));before=deepcopy(args);data=read_output_bytes(*args)
                if args!=before:errors.append('readback_inputs_mutated')
                if type(data) is not bytes or len(data)!=output['byte_size'] or hashlib.sha256(data).hexdigest()!=output['sha256']:errors.append('output_readback')
        achieved=observation['achieved_scope'];achieved_keys=[snapshot_key(m['snapshot']) for m in achieved]
        if len(set(achieved_keys))!=len(achieved_keys) or not set(achieved_keys)<=set(keys):errors.append('achieved_scope_membership')
        if not set(achieved_keys)<=set(resolved) or not set(achieved_keys)<=delivered:errors.append('achieved_source_unresolved')
        for member in achieved:
            expected=requested[snapshot_key(member['snapshot'])]
            if any(member[k]!=expected[k] for k in ('manifest_ref','manifest_sha256','family_dispositions')) or not set(member['object_ids'])<=set(expected['object_ids']):errors.append('achieved_scope_expansion')
        claim=observation['advertised_backup_type']
        if claim is not None:
            if set(achieved_keys)!=set(keys) or set(resolved)!=set(keys):errors.append('false_full_backup_claim')
            for manifest in manifests:
                members=[m for m in achieved if m['manifest_ref'] in [d['resolved_source']['manifest_ref'] for d in observation['sources'] if d['disposition']=='resolved' and d['resolved_source']['manifest_id']==manifest['manifest_id']]]
                if manifest['backup_type']!=claim or not members or any(set(m['object_ids'])!={o['object_id'] for o in manifest['objects']} for m in members):errors.append('false_full_backup_claim')
                if claim=='project_backup' and (manifest['source_code_inclusion_mode']!='complete_project_source_git_jj' or manifest['source_capture_completeness']!='complete'):errors.append('false_full_project_source')
        for cleanup in observation['cleanup']:
            if cleanup['temporary_output_ref'] in {x['output_ref'] for x in outputs}:errors.append('cleanup_delivered_output')
            if cleanup['outcome']=='completed' and not cleanup['evidence_refs']:errors.append('cleanup_without_evidence')
        if len({c['temporary_output_ref'] for c in observation['cleanup']})!=len(observation['cleanup']):errors.append('cleanup_duplicate')
        if not instant(original['accepted_at_utc'])<=instant(observation['observed_at_utc'])<=instant(result['completed_at_utc'])<=instant(o['observed_at']) or instant(response['ts'])<instant(result['completed_at_utc']):errors.append('result_time')
        if instant(destination['observed_at_utc'])>instant(observation['observed_at_utc']):errors.append('destination_time')
        if status=='accepted':
            if effect!='pending' or outputs or achieved or observation['cleanup'] or result['receipt_ref'] is not None or result['work_ref'] is None or result['error_ref'] is not None or observation['reconciliation_ref'] is not None:errors.append('accepted_terminal')
            if o['outcome'] not in ('accepted','acknowledged','executing') or o['result_receipt_ref'] is not None:errors.append('accepted_outcome')
            if response['receipt_ref'] not in (None,o['acknowledgement_receipt_ref']):errors.append('accepted_receipt')
        else:
            if effect=='pending':errors.append('terminal_pending_effect')
            if status=='completed' and (effect!='known_applied' or not outputs or delivered!=set(keys) or set(resolved)!=set(keys) or sorted(achieved,key=lambda x:snapshot_key(x['snapshot']))!=sorted(request['dependency_scope'],key=lambda x:snapshot_key(x['snapshot'])) or any(c['outcome']!='completed' for c in observation['cleanup'])):errors.append('false_complete')
            if effect=='unknown' and status!='recovery_required':errors.append('unknown_outcome')
            if status=='recovery_required' and (effect!='unknown' or observation['reconciliation_ref'] is None):errors.append('reconciliation_missing')
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
        proof('effect',verify_export_effect,original,request,result,destination,admission,observation,manifests,receipt,work)
    except Exception as exc:errors.append('export_resolution:'+type(exc).__name__)
    if original is not None:
        try:proof('disclosure',check_current_disclosure,original,request,result,response,delivery,error,projection,cache)
        except Exception as exc:errors.append('export_disclosure:'+type(exc).__name__)
    if inputs!=saved or any(a!=b for a,b in live):errors.append('export_inputs_mutated')
    return sorted(set(errors))

def _proof_result(proof,label,fn,*args):
    proof(label,fn,*args);return []

def response_failures(bundle,dependencies):
    """Central hook: trusted retained-original resolver, never bundle authority."""
    if not isinstance(dependencies,dict):return ['export_dependencies_missing']
    saved=deepcopy(bundle);live=[]
    try:
        def read(ref):
            value=dependencies['resolve_record'](ref);live.append((value,deepcopy(value)));return deepcopy(value)
        original=read(saved['original_binding_ref']);normalized=saved['normalized_request'];errors=[]
        expected={'request_ref':original['request_ref'],'command_id':COMMAND,
            'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],
            'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','dispatch_frame_id','target_generation')}}
        if any(normalized.get(k)!=v for k,v in expected.items()):errors.append('export_normalized_original')
        if read(saved['resolved_outcome_ref'])!=saved['outcome'] or read(saved['response_ref'])!=saved['response']:errors.append('export_bundle_actual')
        errors+=validate_export_result(saved['owner_request'],saved['owner_result'],saved['original_binding_ref'],saved['resolved_outcome_ref'],saved['response_ref'],saved['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['export_response_resolution:'+type(exc).__name__]
    if bundle!=saved or any(a!=b for a,b in live):errors.append('export_bundle_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Explicit synthetic doubles; hashes and callbacks are NOT native proof."""
    from pm_ui_command_response import owner_result_digest
    return {'resolve_record':lambda ref:value['records'][ref],'canonical_digest':owner_result_digest,
            'read_output_bytes':lambda output,destination,admission:value['output_bytes'][output['output_ref']].encode(),
            **{k:lambda *args:[] for k in ('verify_original_admission','verify_engine_admission','verify_source_custody','verify_export_effect','check_current_disclosure')}}

def portable_export_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['export_fixture_shape']
    return validate_export_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
