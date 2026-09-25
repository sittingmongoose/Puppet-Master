"""ACT120 static original/preview/receipt composition; not native restore proof."""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json,os,re
from pathlib import Path
from jsonschema import Draft202012Validator,FormatChecker
from referencing import Registry,Resource
from pm_backup_snapshot_semantics import validate_snapshot_source_records
from pm_full_thread_semantics import full_thread_semantic_failures,command_outcome_binding_failures
ROOT=Path(__file__).resolve().parents[1]
CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
SCHEMA='Plans/restore_selected_preview_contracts.schema.json'
BASE='Plans/backup_restore_system_contracts.schema.json'
FULL='Plans/full_thread_runtime_contracts.schema.json'
UI='Plans/ui_command_response.schema.json'
COMMAND='cmd.restore.preview'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.restore.selected_preview.result.v1'}
@lru_cache(maxsize=1)
def schemas():
    docs={'Plans/'+p.name:json.loads(p.read_text()) for p in (CANON/'Plans').glob('*.schema.json')}
    docs[SCHEMA]=json.loads((ROOT/SCHEMA).read_text())
    return docs,Registry().with_resources((s['$id'],Resource.from_contents(s)) for s in docs.values() if '$id' in s)
def shape(definition,value,filename=SCHEMA):
    docs,registry=schemas();s=docs[filename]
    return [e.message for e in Draft202012Validator(s if definition is None else {'$ref':s['$id']+'#/$defs/'+definition},registry=registry,format_checker=FormatChecker()).iter_errors(value)]
def instant(v):return datetime.fromisoformat(v.replace('Z','+00:00'))
def key(s):return (s['repository_id'],s['backup_destination_id'],s['snapshot_id'])
def validate_preview_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,resolve_record,canonical_digest,verify_original_admission,verify_source_custody,verify_target_and_mapping,verify_preview_production,validate_legacy_record,check_current_disclosure):
    """Trusted original and authentic owner resolvers are prerequisites, not booleans.

    canonical_digest computes the actual owner's canonical request/result/preview
    digest; preview self-hash exclusion is the native preview owner's contract.
    verify_target_and_mapping authenticates actual topology/identity/path/revision,
    Permissions/FileSafe and mapping evaluations; new identities remain plans only.
    verify_preview_production authenticates manifest verification/dependency closure,
    all changes, generated dependencies, receipt scope and native currentness.
    validate_legacy_record delegates existing unchanged Backup owner semantics.
    check_current_disclosure rechecks source/target/caller lifetime after all helpers.
    None of these interfaces authorizes activation or proves a native implementation.
    """
    inputs=(request,result,delivery_return_context);saved=deepcopy(inputs)
    request,result,delivery=deepcopy(saved);errors=[];cache={};live=[]
    callbacks=(resolve_record,canonical_digest,verify_original_admission,verify_source_custody,verify_target_and_mapping,verify_preview_production,validate_legacy_record,check_current_disclosure)
    if not all(callable(c) for c in callbacks):return ['preview_dependencies_missing']
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
        return []
    def digest(kind,value):
        copied=deepcopy(value);before=deepcopy(copied);out=canonical_digest(kind,copied)
        if copied!=before:errors.append('digest_inputs_mutated')
        if not isinstance(out,str) or re.fullmatch('[0-9a-f]{64}',out) is None:raise ValueError('digest_contract')
        return out
    original=response=association=preview=receipt=production_receipt=error=projection=work=None
    try:
        if shape('request',request) or shape('result',result):raise ValueError('input_shape')
        original=read(original_binding_ref,'dispatch_binding');o=read(outcome_ref,'CommandOutcomeRecord',FULL);response=read(response_ref,None,UI)
        if read(original['request_ref'],'request')!=request or original['arguments']!=request:errors.append('original_request')
        if read(o['owner_result_ref'],'result')!=result:errors.append('actual_result')
        if result['original_request_ref']!=request['request_ref'] or original['request_ref']!=request['request_ref']:errors.append('original_reference')
        for k in ('command_id','command_instance_id','operation_id','return_route_ref'):
            if result[k]!=request[k]:errors.append('result_'+k)
        for k in ('actor_ref','permission_snapshot_ref','idempotency_key'):
            if original[k]!=request[k]:errors.append('original_'+k)
        identity=original['identity'];errors+=full_thread_semantic_failures('IdentityEnvelope',identity)
        errors+=full_thread_semantic_failures('CommandOutcomeRecord',o);errors+=command_outcome_binding_failures(response,o,outcome_ref)
        if any(identity[k]!=request[k] for k in ('operation_id','command_instance_id')):errors.append('original_identity_request')
        if identity!=o['identity'] or identity!=response['owner_identity']:errors.append('original_identity')
        if delivery!=original['return_context']:errors.append('original_caller')
        if response['request_ref']!=request['request_ref'] or response['command_id']!=COMMAND or o['command_id']!=COMMAND:errors.append('response_request')
        if any(response[k]!=request[k] for k in ('command_instance_id','operation_id')):errors.append('response_identity')
        if response['response_kind']!='owner_operation' or response['owner_result_schema_ref']!=BINDING or o['owner_result_schema_ref']!=BINDING:errors.append('response_binding')
        if response['owner_result_ref']!=o['owner_result_ref']:errors.append('response_result')
        if (response['original_dispatch_id'] if response['replayed'] else response['dispatch_id'])!=original['dispatch_id']:errors.append('original_dispatch')
        for k in ('payload_sha256','dispatch_frame_id','target_generation','idempotency_key'):
            if o[k]!=original[k]:errors.append('original_'+k)
        if digest('request',request)!=original['payload_sha256'] or digest('result',result)!=o['owner_result_sha256']:errors.append('original_digest')
        proof('admission',verify_original_admission,original,request)
        selected=request['snapshots'];selected_keys=[key(s['snapshot']) for s in selected]
        if len(set(selected_keys))!=len(selected_keys) or len({s['repository_snapshot_ref'] for s in selected})!=len(selected) or set(request['snapshot_ids'])!={k[2] for k in selected_keys}:errors.append('selection_exact_set')
        maps={m['mapping_id']:m for m in request['mapping']}
        if len(maps)!=len(request['mapping']):errors.append('mapping_duplicate')
        if any(key(m['source_snapshot']) not in selected_keys or m['family_id'] not in request['selected_family_ids'] for m in maps.values()):errors.append('mapping_source')
        if (request['target']['host_id'] is None)!=(request['target']['environment_id'] is None):errors.append('target_host_environment')
        if any(m['target_path_ref'] is not None for m in maps.values()) and request['target']['host_id'] is None:errors.append('path_target_host')
        association=read(result['association_ref'],'association')
        if association['association_ref']!=result['association_ref'] or association['original_request_ref']!=request['request_ref']:errors.append('association_original')
        sources=association['sources'];sourcekeys=[key(s['selection']) for s in sources]
        if len(sourcekeys)!=len(selected_keys) or set(sourcekeys)!=set(selected_keys):errors.append('source_exact_set')
        resolved={};manifests={};coherent=set()
        for source in sources:
            errors+=validate_snapshot_source_records({'selected_input':request},source,resolve_record=lambda kind,ref:read(ref,kind,BASE),verify_source_custody=lambda *a:proof('source',verify_source_custody,original,request,*a[1:]),check_current_disclosure=lambda *a:[])
            if source['disposition']!='resolved':continue
            d=source['resolved_source'];k=key(source['selection']);resolved[k]=d
            member=next(s for s in selected if s['snapshot']==source['selection'])
            if member['repository_snapshot_ref']!=d['repository_snapshot_ref']:errors.append('immutable_reference')
            manifest=read(d['manifest_ref'],'backup_manifest',BASE);manifests[k]=manifest
            coherent.add((d['backup_id'],d['manifest_id'],d['manifest_sha256'],d['capture_set_id']))
        target=association['target_resolution']
        if target is not None:
            if target['requested_target']!=request['target'] or target['actual_target']!=request['target']:errors.append('target_original_revision')
            if any(m['target_path_ref'] is not None for m in maps.values()) and not target['filesafe_decision_refs']:errors.append('mapping_filesafe')
            if instant(target['observed_at_utc'])>instant(association['observed_at_utc']):errors.append('target_time')
        evaluations=association['mapping_evaluations'];evals={e['mapping_id']:e for e in evaluations}
        if len(evals)!=len(evaluations) or set(evals)!=set(maps):errors.append('mapping_exact_set')
        for mid,e in evals.items():
            m=maps[mid]
            if e['requested_mapping']!=m:errors.append('mapping_original')
            if e['disposition']=='mapped':
                if key(m['source_snapshot']) not in resolved or target is None or not e['evidence_refs']:errors.append('mapping_without_source_target')
                if (m['source_path_ref'] is None)!=(e['resolved_source_path_ref'] is None) or (m['target_path_ref'] is None)!=(e['resolved_target_path_ref'] is None):errors.append('mapping_path_downgrade')
            elif e['disposition'] in ('blocked','unavailable') and not e['reason_refs']:errors.append('mapping_reason_missing')
            elif e['disposition']=='pending' and (e['change_indexes'] or e['resolved_source_path_ref'] is not None or e['resolved_target_path_ref'] is not None):errors.append('pending_mapping_effect')
        proof('mapping',verify_target_and_mapping,original,request,association,manifests)
        if association['preview_ref'] is not None:
            preview=read(association['preview_ref'],'restore_preview',BASE);proof('legacy_preview',validate_legacy_record,'restore_preview',preview)
            if digest('preview',preview)!=preview['preview_sha256'] or association['preview_sha256']!=preview['preview_sha256']:errors.append('preview_hash')
            if len(coherent)!=1 or set(resolved)!=set(selected_keys):errors.append('preview_source_incoherent')
            if preview['backup_id']!=request['backup_id'] or any(d['backup_id']!=request['backup_id'] or d['manifest_id']!=preview['manifest_id'] for d in resolved.values()):errors.append('preview_source')
            if preview['mode']=='as_new' and set(preview['target_project_ids'])&{d['project_id'] for d in resolved.values() if d['project_id'] is not None}:errors.append('as_new_source_identity_reused')
            if set(preview['snapshot_ids'])!=set(request['snapshot_ids']) or preview['mode']!=request['restore_mode'] or set(preview['selected_family_ids'])!=set(request['selected_family_ids']):errors.append('preview_original_selection')
            if target is None or preview['target_server_id']!=request['target']['server_id'] or set(preview['target_project_ids'])!=set(request['target']['project_ids']):errors.append('preview_target')
            if not instant(original['accepted_at_utc'])<=instant(preview['created_at_utc'])<=instant(association['observed_at_utc']) or instant(preview['expires_at_utc'])<=instant(preview['created_at_utc']):errors.append('preview_time')
            covered=set();changes=preview['changes']
            for mid,e in evals.items():
                for i in e['change_indexes']:
                    c=changes[i];m=maps[mid];covered.add(i)
                    if c['family_id']!=m['family_id'] or c['source_identity_ref']!=m['source_identity_ref'] or c['target_identity_ref']!=m['target_identity_ref']:errors.append('change_mapping_identity')
                if e['disposition']=='mapped' and not e['change_indexes']:errors.append('mapping_changes_missing')
            deps=association['dependent_changes'];depindices=[d['change_index'] for d in deps]
            if len(set(depindices))!=len(depindices) or set(depindices)&covered:errors.append('dependent_change_duplicate')
            for d in deps:
                if not set(d['required_by_mapping_ids'])<=set(maps):errors.append('dependency_mapping')
            if covered|set(depindices)!=set(range(len(changes))):errors.append('changes_exact_coverage')
        elif association['preview_sha256'] is not None or association['preview_receipt_ref'] is not None or association['dependent_changes'] or any(e['change_indexes'] for e in evaluations):errors.append('fabricated_preview_association')
        if association['preview_receipt_ref'] is not None:
            receipt=read(association['preview_receipt_ref'],'restore_preview_receipt',BASE);proof('legacy_receipt',validate_legacy_record,'restore_preview_receipt',receipt)
            common=('restore_preview_id','backup_id','manifest_id','mode','target_server_id','target_project_ids','selected_family_ids','compatibility_result','manifest_verification_result','mutation_planned','recovery_point_required','emergency_recovery_exception','identity_rewrite_required','blocking_reason_refs','warning_refs','expires_at_utc','currentness_ref')
            if any(receipt[k]!=preview[k] for k in common):errors.append('receipt_preview')
            if receipt['receipt_id']!=association['preview_receipt_ref'] or receipt['operation_id']!=request['operation_id'] or receipt['command_id']!=COMMAND or receipt['idempotency_key']!=request['idempotency_key'] or receipt['correlation_id']!=original['correlation_id'] or receipt['server_id']!=identity['server_id']:errors.append('receipt_original')
            if not instant(original['accepted_at_utc'])<=instant(receipt['started_at_utc'])<=instant(receipt['completed_at_utc'])<=instant(association['observed_at_utc']):errors.append('receipt_time')
            if receipt['terminal_status']=='ready_for_approval' and (any(e['disposition']!='mapped' for e in evaluations) or any(c['conflict'] or c['resolution_required'] for c in preview['changes'])):errors.append('false_ready')
        status=result['outcome'];state=association['production_state']
        if result['production_receipt_ref'] is not None:
            production_receipt=read(result['production_receipt_ref'],'production_receipt')
            if receipt is not None or status in ('accepted','completed'):errors.append('fabricated_production_receipt')
            if production_receipt['receipt_ref']!=result['production_receipt_ref'] or production_receipt['original_binding_ref']!=original_binding_ref or production_receipt['reconciliation_ref']!=association['reconciliation_ref']:errors.append('production_receipt_original')
            for k in ('original_request_ref','operation_id','command_instance_id','command_id','association_ref','outcome','error_ref','completed_at_utc'):
                if production_receipt[k]!=result[k]:errors.append('production_receipt_'+k)
        terminal_receipt_ref=association['preview_receipt_ref'] or result['production_receipt_ref']
        if not instant(original['accepted_at_utc'])<=instant(association['observed_at_utc'])<=instant(result['completed_at_utc'])<=instant(o['observed_at']) or instant(response['ts'])<instant(result['completed_at_utc']):errors.append('result_time')
        if status=='accepted':
            if state!='pending' or preview is not None or result['production_receipt_ref'] is not None or result['work_ref'] is None or any(e['disposition']!='pending' for e in evaluations):errors.append('accepted_terminal')
            if o['outcome'] not in ('accepted','acknowledged','executing') or o['result_receipt_ref'] is not None or response['receipt_ref'] not in (None,o['acknowledgement_receipt_ref']):errors.append('accepted_outcome')
        else:
            if state=='pending':errors.append('terminal_pending')
            if status=='completed' and (state!='produced' or preview is None or receipt is None or receipt['terminal_status']=='failed' or any(e['disposition']=='pending' for e in evaluations)):errors.append('false_complete')
            if status=='completed' and instant(response['ts'])>=instant(preview['expires_at_utc']):errors.append('preview_expired')
            if status=='recovery_required' and (state!='unknown' or association['reconciliation_ref'] is None):errors.append('unknown_reconciliation')
            if state=='unknown' and status!='recovery_required':errors.append('unknown_outcome')
            expected={'completed':'succeeded','failed':'failed','cancelled':'cancelled','recovery_required':'terminal_unknown'}[status]
            if terminal_receipt_ref is None or o['outcome']!=expected or o['result_receipt_ref']!=terminal_receipt_ref or response['receipt_ref']!=terminal_receipt_ref:errors.append('terminal_outcome')
        if (response['ack_status'],response['result_status'])!={'accepted':('accepted','pending'),'completed':('accepted','succeeded'),'failed':('accepted','failed'),'cancelled':('accepted','cancelled'),'recovery_required':('accepted','recovery_required')}[status]:errors.append('response_outcome')
        if result['work_ref'] is not None:
            work=read(result['work_ref'],'ObservableWorkRecord',FULL);errors+=full_thread_semantic_failures('ObservableWorkRecord',work)
            if work['observable_work_id']!=result['work_ref'] or work['identity']!=identity:errors.append('work_original')
            if status=='accepted' and (work['work_state'] in ('completed','failed','cancelled','recovery-required') or work['result_receipt_ref'] is not None):errors.append('accepted_work_terminal')
        if status in ('completed','accepted'):
            if any(x is not None for x in (result['error_ref'],result['error_projection_ref'],o['error_ref'],response['error'])):errors.append('unexpected_error')
        else:
            error=read(result['error_ref'],'backup_restore_command_error',BASE);projection=read(result['error_projection_ref'],'error_projection')
            if error['command_id']!=COMMAND or error['command_instance_id']!=request['command_instance_id'] or o['error_ref']!=result['error_ref']:errors.append('actual_error')
            if status=='recovery_required' and (error['retriable'] or error['recovery_ref']!=association['reconciliation_ref']):errors.append('unknown_no_resubmit')
            if projection['projection_ref']!=result['error_projection_ref'] or projection['owner_error_ref']!=result['error_ref'] or projection['original_request_ref']!=request['request_ref'] or projection['identity']!=identity or projection['return_context']!=delivery:errors.append('error_projection_original')
            if projection['ui_error']!=response['error']:errors.append('error_projection_value')
            if not instant(original['accepted_at_utc'])<=instant(projection['observed_at_utc'])<=instant(o['observed_at']):errors.append('error_projection_time')
        if response['event_refs']:errors.append('unadmitted_events')
        from pm_ui_command_response import replay_failures
        errors+=replay_failures(response,read(response['original_dispatch_id'],None,UI) if response['replayed'] else None)
        proof('production',verify_preview_production,original,request,association,preview,receipt,production_receipt,result,manifests,work)
    except Exception as exc:errors.append('preview_resolution:'+type(exc).__name__)
    if original is not None:
        try:proof('disclosure',check_current_disclosure,original,request,result,response,delivery,error,projection,cache)
        except Exception as exc:errors.append('preview_disclosure:'+type(exc).__name__)
    if inputs!=saved or any(a!=b for a,b in live):errors.append('preview_inputs_mutated')
    return sorted(set(errors))

def response_failures(bundle,dependencies):
    if not isinstance(dependencies,dict):return ['preview_dependencies_missing']
    saved=deepcopy(bundle);live=[]
    try:
        def read(ref):
            value=dependencies['resolve_record'](ref);live.append((value,deepcopy(value)));return deepcopy(value)
        original=read(saved['original_binding_ref']);normalized=saved['normalized_request'];errors=[]
        expected={'request_ref':original['request_ref'],'command_id':COMMAND,'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','dispatch_frame_id','target_generation')}}
        if any(normalized.get(k)!=v for k,v in expected.items()):errors.append('preview_normalized_original')
        if read(saved['resolved_outcome_ref'])!=saved['outcome'] or read(saved['response_ref'])!=saved['response']:errors.append('preview_bundle_actual')
        errors+=validate_preview_result(saved['owner_request'],saved['owner_result'],saved['original_binding_ref'],saved['resolved_outcome_ref'],saved['response_ref'],saved['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['preview_response_resolution:'+type(exc).__name__]
    if bundle!=saved or any(a!=b for a,b in live):errors.append('preview_bundle_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Synthetic proof/hash doubles only; legacy validation is the real gate."""
    from pm_ui_command_response import owner_result_digest,contracts
    return {'resolve_record':lambda ref:value['records'][ref],'canonical_digest':lambda kind,v:v['preview_sha256'] if kind=='preview' else owner_result_digest(v),'validate_legacy_record':lambda kind,v:contracts().contract_semantic_failures(BASE,kind,v),**{k:lambda *a:[] for k in ('verify_original_admission','verify_source_custody','verify_target_and_mapping','verify_preview_production','check_current_disclosure')}}
def selected_preview_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['preview_fixture_shape']
    return validate_preview_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
