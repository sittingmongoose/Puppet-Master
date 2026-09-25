"""ACT090/091 static original/source/effect/UI joins, not a native test or delete engine.

All production proof callbacks are mandatory authenticated owner adapters. Static
fixture adapters at the bottom are explicitly synthetic and never authority.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json,os,sys
from pathlib import Path
from jsonschema import Draft202012Validator,FormatChecker
from referencing import Registry,Resource
ROOT=Path(__file__).resolve().parents[1];CANON=Path(os.environ.get('PM_CANON_ROOT',ROOT))
sys.path.insert(0,str(CANON/'scripts'))
from pm_full_thread_semantics import full_thread_semantic_failures,command_outcome_binding_failures
from pm_ui_command_response import owner_result_digest,replay_failures
SCHEMA='Plans/backup_destination_lifecycle_contracts.schema.json'
BACKUP='Plans/backup_restore_system_contracts.schema.json';FULL='Plans/full_thread_runtime_contracts.schema.json';UI='Plans/ui_command_response.schema.json'
TEST='cmd.backup.destination.test';REMOVE='cmd.backup.destination.remove';COMMANDS=(TEST,REMOVE)
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.backup.destination_lifecycle.result.v1'}
@lru_cache(maxsize=1)
def schemas():
    names=[SCHEMA,BACKUP,FULL,UI,'Plans/forge_integration_contracts.schema.json','Plans/source_control_contracts.schema.json','Plans/shared_runtime_command_contracts.schema.json','Plans/backup_bounded_read_contracts.schema.json','Plans/backup_snapshot_result_contracts.schema.json']
    docs={p:json.loads(((ROOT if p==SCHEMA else CANON)/p).read_text()) for p in names}
    return docs,Registry().with_resources((s['$id'],Resource.from_contents(s)) for s in docs.values())
def shape(definition,value,filename=SCHEMA):
    docs,registry=schemas();s=docs[filename];selected=s if definition is None else {'$ref':s['$id']+'#/$defs/'+definition}
    return [e.message for e in Draft202012Validator(selected,registry=registry,format_checker=FormatChecker()).iter_errors(value)]
def instant(s):return datetime.fromisoformat(s.replace('Z','+00:00'))

def validate_lifecycle_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
        resolve_record,canonical_digest,verify_original_admission,verify_destination_source,
        verify_lifecycle_effect,check_current_disclosure):
    """Original admission, scoped native source/effects and final disclosure are independent.

    Source adapter authenticates configuration/currentness, actual scratch issuance,
    capability provenance and complete dependency census under the native fence.
    Effect adapter authenticates canary/cleanup and registry observations, confinement,
    unchanged external data/credentials and original replay custody. Disclosure adapter
    authenticates receipt error projection and exact current original caller. No adapter
    can replace the finite joins below with caller booleans.
    """
    inputs=(request,result,delivery_return_context);frozen=deepcopy(inputs)
    q,r,delivery=deepcopy(frozen);errors=[];cache={};live={}
    def read(ref,definition,filename=SCHEMA):
        if ref not in cache:
            value=resolve_record(ref);live[ref]=value;cache[ref]=deepcopy(value)
        value=deepcopy(cache[ref])
        if shape(definition,value,filename):raise ValueError('shape:'+str(definition))
        return value
    def proof(name,fn,*args):
        old=deepcopy(args);answer=fn(*args)
        if type(answer) is not list or any(type(e) is not str for e in answer):errors.append(name+'_invalid_proof')
        else:errors.extend(name+':'+e for e in answer)
        if args!=old:errors.append('proof_input_mutated')
    def digest(value):
        old=deepcopy(value);answer=canonical_digest(value)
        if value!=old:errors.append('digest_input_mutated')
        if type(answer) is not str or len(answer)!=64 or any(c not in '0123456789abcdef' for c in answer):raise ValueError('digest')
        return answer
    def destination(ref):
        value=read(ref,'destination')
        if value['schema_id'].endswith('.v3'):
            if value['destination_state_role']!='observed_result':errors.append('unresolved_destination_state')
            return value['destination']
        return value
    try:
        if shape('request',q) or shape('result',r):return ['input_shape']
        a=q['authority'];command=a['command_id'];inp=q['input']
        selection={'server_id':a['target_server_id'],'backup_destination_id':a['backup_destination_id'],'destination_generation':a['expected_destination_generation']}
        original=read(original_binding_ref,'dispatch_binding');outcome=read(outcome_ref,'CommandOutcomeRecord',FULL);response=read(response_ref,None,UI)
        if read(r['original_request_ref'],'request')!=q or original['arguments']!=q or original['request_ref']!=r['original_request_ref']:errors.append('original_request')
        if read(outcome['owner_result_ref'],'result')!=r:errors.append('actual_result')
        if shape('delivery_return_context',delivery) or delivery!=original['return_context']:errors.append('original_return')
        errors+=full_thread_semantic_failures('IdentityEnvelope',original['identity'])
        errors+=full_thread_semantic_failures('CommandOutcomeRecord',outcome)
        errors+=command_outcome_binding_failures(response,outcome,outcome_ref)
        if original['identity']!=outcome['identity'] or original['identity']!=response['owner_identity']:errors.append('original_identity')
        if original['identity']['server_id']!=selection['server_id']:errors.append('original_server')
        if original['identity']['operation_id']!=q['operation_id'] or r['operation_id']!=q['operation_id'] or response['operation_id']!=q['operation_id']:errors.append('original_operation')
        if original['identity']['command_instance_id']!=a['command_instance_id'] or r['command_instance_id']!=a['command_instance_id'] or response['command_instance_id']!=a['command_instance_id']:errors.append('original_instance')
        if r['command_id']!=command or outcome['command_id']!=command or response['command_id']!=command:errors.append('original_command')
        if original['actor_ref']!=a['actor_ref'] or original['permission_snapshot_ref']!=a['permission_snapshot_ref'] or original['idempotency_key']!=a['idempotency_key']:errors.append('original_admission')
        if original['payload_sha256']!=digest(q) or outcome['owner_result_sha256']!=digest(r):errors.append('original_digest')
        for key in ('payload_sha256','dispatch_frame_id','target_generation','idempotency_key'):
            if outcome[key]!=original[key]:errors.append('original_'+key)
        if response['request_ref']!=original['request_ref'] or response['owner_result_ref']!=outcome['owner_result_ref']:errors.append('response_original')
        if response['owner_result_schema_ref']!=BINDING or outcome['owner_result_schema_ref']!=BINDING or response['response_kind']!='owner_operation':errors.append('response_binding')
        if (response['original_dispatch_id'] if response['replayed'] else response['dispatch_id'])!=original['dispatch_id']:errors.append('original_dispatch')
        if not instant(original['accepted_at_utc'])<=instant(r['observed_at_utc'])<=instant(outcome['observed_at']):errors.append('original_time')
        if instant(response['ts'])<instant(r['observed_at_utc']):errors.append('response_before_result')
        if response['event_refs']:errors.append('unadmitted_event')
        before=destination(q['before_destination_ref'])
        if before['backup_destination_id']!=selection['backup_destination_id'] or before['owning_server_id']!=selection['server_id'] or before['destination_generation']!=selection['destination_generation']:errors.append('destination_original')
        observation=scratch=preview=cleanup=after=None;dependencies=[];registry=[]
        if r['observation_ref'] is not None:
            observation=read(r['observation_ref'],'test_observation' if command==TEST else 'remove_observation')
            if observation['original_request_ref']!=original['request_ref'] or observation['selection']!=selection:errors.append('observation_original')
            if any(observation[k]!=r[k] for k in ('currentness_ref','currentness_sha256')):errors.append('observed_currentness')
            if not instant(original['accepted_at_utc'])<=instant(observation['observed_at_utc'])<=instant(r['observed_at_utc']):errors.append('observation_time')
        if command==TEST:
            if inp['mode']=='approved_canary':
                scratch=read(inp['scratch_admission_ref'],'scratch_admission')
                if scratch['admission_ref']!=inp['scratch_admission_ref'] or scratch['original_request_ref']!=original['request_ref'] or scratch['selection']!=selection or scratch['scratch_prefix_ref']!=inp['scratch_prefix_ref']:errors.append('scratch_original')
                if instant(scratch['issued_at_utc'])>instant(r['observed_at_utc']):errors.append('scratch_time')
            if observation is not None:
                if observation['input']!=inp or observation['before_destination_ref']!=q['before_destination_ref']:errors.append('test_original')
                after=destination(observation['after_destination_ref'])
                if after['currentness_ref']!=observation['currentness_ref']:errors.append('destination_result_currentness')
                mutable={'state','capabilities','last_test_receipt_ref','failure_ref','runtime_evidence_status','updated_at_utc','currentness_ref','capacity_observation_ref'}
                if {k:v for k,v in before.items() if k not in mutable}!={k:v for k,v in after.items() if k not in mutable}:errors.append('test_configuration_changed')
                caps=observation['capabilities'];names=[c['capability'] for c in caps]
                if len(set(names))!=len(names) or set(names)!=set(before['capabilities']):errors.append('capability_coverage')
                for c in caps:
                    if c['declaration']!=after['capabilities'].get(c['capability']):errors.append('capability_projection')
                    if c['method']=='not_attempted' and (c['outcome']!='not_run' or c['declaration']!='not_run' or c['evidence_refs']):errors.append('untested_capability_promoted')
                    if c['outcome']=='not_run' and (c['method']!='not_attempted' or c['declaration']!='not_run' or c['evidence_refs']):errors.append('not_run_capability_contradiction')
                    if c['method']!='not_attempted' and not c['evidence_refs']:errors.append('capability_evidence_missing')
                    if c['outcome']=='passed' and c['declaration'] not in ('supported','conditional'):errors.append('capability_pass_declaration')
                    if c['outcome']=='unsupported' and c['declaration']!='unsupported':errors.append('capability_unsupported_declaration')
                    if inp['mode']=='read_only' and (c['method']=='canary_probe' or c['method']=='read_only_probe' and c['capability'] not in ('list','read','stream_read','version')):errors.append('read_only_capability_mutation')
                canary=observation['canary']
                for c in caps:
                    if c['method']=='canary_probe' and c['outcome']=='passed':
                        phase='write' if c['capability']=='write' else 'delete' if c['capability']=='delete' else 'create'
                        if canary is None or canary[phase]!='known_applied':errors.append('capability_without_canary_effect')
                if r['outcome']=='completed' and not any(c['method']!='not_attempted' and c['outcome']!='not_run' for c in caps):errors.append('completed_without_test_observation')
                if inp['mode']=='read_only':
                    if canary is not None or r['effect_state']!='not_attempted':errors.append('read_only_effect')
                elif canary is not None:
                    if any(canary[k]!=scratch[k] for k in ('scratch_prefix_ref','canary_object_ref')) or canary['scratch_admission_ref']!=inp['scratch_admission_ref']:errors.append('canary_authority')
                    phases=[canary[k] for k in ('create','write','delete')]
                    expected='unknown' if 'unknown' in phases or canary['cleanup']=='unknown' else 'known_applied' if 'known_applied' in phases else 'not_attempted' if set(phases)=={'not_attempted'} else 'known_not_applied'
                    if r['effect_state']!=expected:errors.append('canary_effect_preservation')
                    if any(v!='not_attempted' for v in phases[1:]) and phases[0] not in ('known_applied','unknown'):errors.append('canary_phase_origin')
                    if phases[0] in ('known_applied','unknown') and canary['cleanup']=='not_required':errors.append('cleanup_obligation_erased')
                    if canary['cleanup']!='not_required':
                        cleanup=read(canary['cleanup_receipt_ref'],'cleanup_observation')
                        if cleanup['cleanup_receipt_ref']!=canary['cleanup_receipt_ref'] or cleanup['original_request_ref']!=original['request_ref'] or cleanup['selection']!=selection or any(cleanup[k]!=canary[k] for k in ('scratch_admission_ref','scratch_prefix_ref','canary_object_ref')) or cleanup['outcome']!=canary['cleanup']:errors.append('cleanup_original')
                        if cleanup['outcome']=='completed' and (canary['delete']!='known_applied' or not cleanup['evidence_refs']):errors.append('cleanup_without_evidence')
                        if not instant(scratch['issued_at_utc'])<=instant(cleanup['observed_at_utc'])<=instant(observation['observed_at_utc']):errors.append('cleanup_time')
                    elif canary['cleanup_receipt_ref'] is not None:errors.append('unattempted_cleanup_receipt')
                    if r['outcome']=='completed' and canary['cleanup'] in ('required','unknown'):errors.append('success_with_cleanup_due')
                elif r['effect_state']!='not_attempted':errors.append('missing_canary_effect')
                if r['outcome']=='completed' and any(c['outcome'] in ('failed','unavailable') for c in caps):errors.append('test_failure_erased')
        else:
            preview=read(inp['preview_ref'],'removal_preview')
            if preview['preview_ref']!=inp['preview_ref'] or preview['selection']!=selection or preview['before_destination_ref']!=q['before_destination_ref'] or preview['currentness_ref']!=a['expected_currentness_ref'] or preview['currentness_sha256']!=a['expected_currentness_sha256']:errors.append('preview_original')
            if instant(preview['reviewed_at_utc'])>instant(original['accepted_at_utc']):errors.append('preview_time')
            for dep in preview['dependencies']:
                kind='backup_policy' if dep['record']['schema_id'].endswith('backup_policy.v2') else 'backup_repository_binding'
                actual=read(dep['record_ref'],kind,BACKUP);dependencies.append(actual)
                if actual!=dep['record']:errors.append('dependency_substituted')
                if actual['server_id']!=selection['server_id'] or selection['backup_destination_id'] not in actual['destination_binding_ids']:errors.append('dependency_scope')
            deprefs=[dep['record_ref'] for dep in preview['dependencies']]
            if len(set(deprefs))!=len(deprefs):errors.append('dependency_duplicate')
            if observation is not None:
                if observation['preview_ref']!=inp['preview_ref'] or observation['dependency_refs']!=deprefs:errors.append('removal_preview_join')
                for key in ('before_registry_ref','after_registry_ref'):
                    row=read(observation[key],'registry_observation');registry.append(row)
                    if row['original_request_ref']!=original['request_ref'] or row['selection']!=selection:errors.append('registry_original')
                    if row['membership']=='present':
                        if destination(row['destination_ref'])!=before:errors.append('registry_destination_changed')
                    elif row['destination_ref'] is not None:errors.append('registry_false_destination')
                prior,later=registry
                if any(later[k]!=observation[k] for k in ('currentness_ref','currentness_sha256')):errors.append('registry_result_currentness')
                if prior['membership']!='present' or prior['destination_ref']!=q['before_destination_ref']:errors.append('registry_before')
                if not instant(prior['observed_at_utc'])<=instant(original['accepted_at_utc'])<=instant(later['observed_at_utc'])<=instant(observation['observed_at_utc']):errors.append('registry_time')
                expected='known_applied' if later['membership']=='absent' else 'unknown' if later['membership']=='unknown' else 'known_not_applied'
                if r['effect_state']!=expected:errors.append('disconnect_effect')
                if r['outcome']=='completed' and later['membership']!='absent':errors.append('disconnect_not_observed')
                if expected in ('known_applied','unknown') and (preview['disposition']!='ready' or any(dep['consequence']=='blocking' for dep in preview['dependencies'])):errors.append('disconnect_dependency_blocked')
        receipt=error=work=None
        if r['outcome']=='accepted':
            if r['receipt_ref'] is not None or r['observation_ref'] is not None or r['effect_state']!='not_attempted' or r['error_ref'] is not None or r['reconciliation_ref'] is not None:errors.append('accepted_terminal_evidence')
            if r['observable_work_ref'] is None:errors.append('accepted_without_work')
            if outcome['outcome'] not in ('accepted','acknowledged','executing') or outcome['result_receipt_ref'] is not None or response['result_status']!='pending' or response['ack_status']!='accepted' or response['receipt_ref'] not in (None,outcome['acknowledgement_receipt_ref']):errors.append('accepted_response')
            if outcome['error_ref'] is not None or response['error'] is not None:errors.append('accepted_error')
        else:
            receipt=read(r['receipt_ref'],'lifecycle_receipt')
            if receipt['receipt_ref']!=r['receipt_ref'] or receipt['original_binding_ref']!=original_binding_ref or receipt['before_destination_ref']!=q['before_destination_ref']:errors.append('receipt_original')
            for k in ('original_request_ref','operation_id','command_id','command_instance_id','outcome','effect_state','observation_ref','error_ref','reconciliation_ref','currentness_ref','currentness_sha256','observed_at_utc'):
                if receipt[k]!=r[k]:errors.append('receipt_'+k)
            if r['outcome']=='completed' and (observation is None or r['error_ref'] is not None):errors.append('completion_without_observation')
            if r['effect_state']!='not_attempted' and observation is None:errors.append('effect_without_observation')
            if r['effect_state']=='unknown' and (r['outcome']!='unknown' or r['reconciliation_ref'] is None):errors.append('unknown_effect_erased')
            if r['outcome']=='unknown' and (r['effect_state']!='unknown' or r['reconciliation_ref'] is None):errors.append('unknown_without_reconciliation')
            expected={'completed':('succeeded','succeeded'),'failed':('failed','failed'),'unavailable':('failed','failed'),'cancelled':('cancelled','cancelled'),'unknown':('terminal_unknown','recovery_required')}[r['outcome']]
            if outcome['outcome']!=expected[0] or response['result_status']!=expected[1] or response['ack_status']!='accepted':errors.append('response_outcome')
            if outcome['result_receipt_ref']!=r['receipt_ref'] or response['receipt_ref']!=r['receipt_ref']:errors.append('response_receipt')
            if outcome['error_ref']!=r['error_ref'] or response['error']!=receipt['ui_error']:errors.append('response_error')
            if r['error_ref'] is not None:
                error=read(r['error_ref'],'backup_restore_command_error',BACKUP)
                if error['command_id']!=command or error['command_instance_id']!=a['command_instance_id']:errors.append('error_original')
            elif r['outcome']!='completed' or receipt['ui_error'] is not None:errors.append('missing_error')
        if r['observable_work_ref'] is not None:
            work=read(r['observable_work_ref'],'ObservableWorkRecord',FULL);errors+=full_thread_semantic_failures('ObservableWorkRecord',work)
            if work['identity']!=original['identity'] or work['observable_work_id']!=r['observable_work_ref']:errors.append('original_work')
            if r['outcome']=='accepted' and (work['work_state'] in ('completed','failed','cancelled','recovery-required') or work['result_receipt_ref'] is not None):errors.append('accepted_work_terminal')
        original_response=read(response['original_dispatch_id'],None,UI) if response['replayed'] else None
        errors+=replay_failures(response,original_response)
        proof('admission',verify_original_admission,original,q)
        proof('source',verify_destination_source,original,q,before,scratch,preview,dependencies)
        proof('effect',verify_lifecycle_effect,original,q,r,before,after,observation,cleanup,registry,receipt,work)
        proof('disclosure',check_current_disclosure,original,q,r,response,delivery,error,receipt)
    except Exception as exc:errors.append('owner_resolution:'+type(exc).__name__)
    if inputs!=frozen or any(live[k]!=cache[k] for k in cache):errors.append('original_mutated')
    return sorted(set(errors))

def response_failures(bundle,dependencies):
    if not isinstance(dependencies,dict):return ['lifecycle_native_dependencies_missing']
    saved=deepcopy(bundle);snapshots=[]
    try:
        def read(ref):
            v=dependencies['resolve_record'](ref);snapshots.append((v,deepcopy(v)));return deepcopy(v)
        original=read(bundle['original_binding_ref']);outcome=bundle['outcome'];response=bundle['response'];q=bundle['owner_request']
        expected={'request_ref':original['request_ref'],'command_id':q['authority']['command_id'],'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}
        errors=[]
        if any(bundle['normalized_request'].get(k)!=v for k,v in expected.items()):errors.append('lifecycle_normalized_original')
        if read(bundle['resolved_outcome_ref'])!=outcome or read(bundle['response_ref'])!=response:errors.append('lifecycle_bundle_actual')
        errors+=validate_lifecycle_result(q,bundle['owner_result'],bundle['original_binding_ref'],bundle['resolved_outcome_ref'],bundle['response_ref'],bundle['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['lifecycle_response_resolution:'+type(exc).__name__]
    if bundle!=saved or any(a!=b for a,b in snapshots):errors.append('lifecycle_response_mutated')
    return sorted(set(errors))
def fixture_dependencies(v):
    """Synthetic values/doubles for static joins only, never native proof."""
    return {'resolve_record':lambda ref:v['records'][ref],'canonical_digest':owner_result_digest,**{k:lambda *a:[] for k in ('verify_original_admission','verify_destination_source','verify_lifecycle_effect','check_current_disclosure')}}
def lifecycle_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['fixture_shape']
    return validate_lifecycle_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
