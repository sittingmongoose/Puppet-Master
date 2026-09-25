"""ACT118 static original/source/effect/UI joins, not a native key/crypto engine.

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
SCHEMA='Plans/backup_key_rotation_contracts.schema.json'
BACKUP='Plans/backup_restore_system_contracts.schema.json';FULL='Plans/full_thread_runtime_contracts.schema.json';UI='Plans/ui_command_response.schema.json'
COMMAND='cmd.backup.recovery_key.rotate'
BINDING={'path':SCHEMA,'json_pointer':'#/$defs/result','schema_id':'pm.backup.key_rotation.result.v1'}
@lru_cache(maxsize=1)
def schemas():
    names=[SCHEMA,BACKUP,FULL,UI,'Plans/forge_integration_contracts.schema.json','Plans/source_control_contracts.schema.json','Plans/shared_runtime_command_contracts.schema.json','Plans/backup_bounded_read_contracts.schema.json','Plans/backup_snapshot_result_contracts.schema.json','Plans/multi_account_contracts.schema.json']
    docs={p:json.loads(((ROOT if p==SCHEMA else CANON)/p).read_text()) for p in names}
    return docs,Registry().with_resources((s['$id'],Resource.from_contents(s)) for s in docs.values())
def shape(definition,value,filename=SCHEMA):
    docs,registry=schemas();s=docs[filename];selected=s if definition is None else {'$ref':s['$id']+'#/$defs/'+definition}
    return [e.message for e in Draft202012Validator(selected,registry=registry,format_checker=FormatChecker()).iter_errors(value)]
def instant(s):return datetime.fromisoformat(s.replace('Z','+00:00'))

def validate_rotation_result(request,result,original_binding_ref,outcome_ref,response_ref,delivery_return_context,*,
        resolve_record,canonical_digest,verify_original_admission,verify_rotation_sources,verify_protected_session,
        verify_engine_effects,check_current_disclosure):
    """Original admission, scoped native source/effects and final disclosure are independent.

    Source adapter authenticates RecoverySet/repository/key-slot membership and
    original review/currentness. Protected adapter authenticates human, Client,
    step-up, no-store input issuance/one-use/zeroize and same-operation progress.
    Engine adapter authenticates actual phase receipts and causal verification
    barrier, public summary and independent kit delivery/test facts. Disclosure
    authenticates safe error and current caller/audience. No boolean grants.
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
    try:
        if shape('request',q) or shape('result',r):return ['input_shape']
        a=q['authority'];command=a['command_id']
        original=read(original_binding_ref,'dispatch_binding');outcome=read(outcome_ref,'CommandOutcomeRecord',FULL);response=read(response_ref,None,UI)
        if read(r['original_request_ref'],'request')!=q or original['arguments']!=q or original['request_ref']!=r['original_request_ref']:errors.append('original_request')
        if read(outcome['owner_result_ref'],'result')!=r:errors.append('actual_result')
        if shape('delivery_return_context',delivery) or delivery!=original['return_context']:errors.append('original_return')
        errors+=full_thread_semantic_failures('IdentityEnvelope',original['identity'])
        errors+=full_thread_semantic_failures('CommandOutcomeRecord',outcome)
        errors+=command_outcome_binding_failures(response,outcome,outcome_ref)
        if original['identity']!=outcome['identity'] or original['identity']!=response['owner_identity']:errors.append('original_identity')
        if original['identity']['operation_id']!=q['operation_id'] or r['operation_id']!=q['operation_id'] or response['operation_id']!=q['operation_id']:errors.append('original_operation')
        if original['identity']['command_instance_id']!=a['command_instance_id'] or r['command_instance_id']!=a['command_instance_id'] or response['command_instance_id']!=a['command_instance_id']:errors.append('original_instance')
        if r['command_id']!=command or outcome['command_id']!=command or response['command_id']!=command:errors.append('original_command')
        if original['actor_ref']!=a['actor_ref'] or original['permission_snapshot_ref']!=a['permission_snapshot_ref'] or original['idempotency_key']!=a['idempotency_key']:errors.append('original_admission')
        if original['initiating_client_id']!=a['initiating_client_id']:errors.append('original_client')
        if original['payload_sha256']!=digest(q) or outcome['owner_result_sha256']!=digest(r):errors.append('original_digest')
        for key in ('payload_sha256','dispatch_frame_id','target_generation','idempotency_key'):
            if outcome[key]!=original[key]:errors.append('original_'+key)
        if response['request_ref']!=original['request_ref'] or response['owner_result_ref']!=outcome['owner_result_ref']:errors.append('response_original')
        if response['owner_result_schema_ref']!=BINDING or outcome['owner_result_schema_ref']!=BINDING or response['response_kind']!='owner_operation':errors.append('response_binding')
        if (response['original_dispatch_id'] if response['replayed'] else response['dispatch_id'])!=original['dispatch_id']:errors.append('original_dispatch')
        if not instant(original['accepted_at_utc'])<=instant(r['observed_at_utc'])<=instant(outcome['observed_at']):errors.append('original_time')
        if instant(response['ts'])<instant(r['observed_at_utc']):errors.append('response_before_result')
        if response['event_refs']:errors.append('unadmitted_event')
        before=read(q['before_recovery_set_ref'],'recovery_set_public_record',BACKUP)
        review=read(q['review_ref'],'review');association=read(q['session_association_ref'],'session_association')
        scope={'original_request_ref':original['request_ref'],'operation_id':q['operation_id'],'review_ref':q['review_ref'],'recovery_set_id':a['recovery_set_id'],'recovery_set_generation':a['recovery_set_generation']}
        def scoped(value):
            if any(value[k]!=v for k,v in scope.items()):errors.append('rotation_original_scope')
        scoped(review);scoped(association)
        if association['currentness_ref']!=r['currentness_ref']:errors.append('session_currentness')
        if review['review_id']!=q['review_ref'] or association['association_id']!=q['session_association_ref'] or r['session_association_ref']!=q['session_association_ref']:errors.append('rotation_reference_identity')
        if review['before_recovery_set_ref']!=q['before_recovery_set_ref'] or before['recovery_set_id']!=a['recovery_set_id'] or before['recovery_set_generation']!=a['recovery_set_generation']:errors.append('recovery_set_original')
        if review['engine_format_ref']!=before['engine_format_ref']:errors.append('engine_format_original')
        if review['currentness_ref']!=a['expected_currentness_ref'] or review['currentness_sha256']!=a['expected_currentness_sha256']:errors.append('review_currentness')
        if instant(review['reviewed_at_utc'])>instant(original['accepted_at_utc']):errors.append('review_after_admission')
        submission=read(association['submission_ref'],'submission');scoped(submission)
        session=read(association['delivery_session_ref'],'recovery_kit_delivery_session',BACKUP)
        use=read(association['protected_use_ref'],'protected_use');scoped(use)
        for value in (review,association,submission):
            if value['actor_ref']!=a['actor_ref'] or value['audience_client_id']!=a['initiating_client_id'] or value['human_step_up_receipt_ref']!=a['human_step_up_receipt_ref']:errors.append('human_audience_step_up')
        if submission['submission_id']!=a['protected_submission_ref'] or association['submission_ref']!=a['protected_submission_ref'] or submission['input_contract']['binding_ref']!=submission['submission_id']:errors.append('protected_submission_identity')
        if session['delivery_session_id']!=association['delivery_session_ref'] or submission['delivery_session_ref']!=association['delivery_session_ref'] or use['delivery_session_ref']!=association['delivery_session_ref']:errors.append('protected_session_identity')
        if session['action']!='rotate' or session['recovery_set_id']!=a['recovery_set_id'] or session['recovery_set_generation']!=a['recovery_set_generation'] or session['audience_client_id']!=a['initiating_client_id'] or session['human_step_up_receipt_ref']!=a['human_step_up_receipt_ref'] or session['protected_channel_ref']!=submission['protected_channel_ref']:errors.append('protected_session_scope')
        if use['use_id']!=association['protected_use_ref'] or use['submission_ref']!=submission['submission_id'] or use['input_generation']!=submission['input_contract']['generation']:errors.append('protected_use_original')
        if not instant(submission['issued_at_utc'])<=instant(original['accepted_at_utc'])<=instant(submission['input_contract']['expires_at_utc']):errors.append('protected_admission_time')
        if not instant(session['created_at_utc'])<=instant(original['accepted_at_utc'])<=instant(session['expires_at_utc']):errors.append('session_admission_time')
        if not instant(original['accepted_at_utc'])<=instant(use['observed_at_utc'])<=instant(association['observed_at_utc'])<=instant(r['observed_at_utc']):errors.append('protected_observation_time')
        if use['state']=='unused' and any(use[k] is not None for k in ('consume_receipt_ref','zeroize_receipt_ref','reconciliation_ref','consumed_at_utc')):errors.append('unused_with_consumption')
        if use['state']=='consumed_zeroized' and (use['consume_receipt_ref'] is None or use['zeroize_receipt_ref'] is None or use['consumed_at_utc'] is None):errors.append('consumed_without_zeroize_evidence')
        if use['state']=='unknown' and (use['reconciliation_ref'] is None or r['outcome']!='unknown'):errors.append('unknown_consumption_erased')
        if use['consumed_at_utc'] is not None:
            if not instant(original['accepted_at_utc'])<=instant(use['consumed_at_utc'])<=instant(use['observed_at_utc']):errors.append('protected_consumption_time')
            if instant(use['consumed_at_utc'])>instant(submission['input_contract']['expires_at_utc']):errors.append('expired_input_consumption')
            if not instant(session['created_at_utc'])<=instant(use['consumed_at_utc'])<=instant(session['expires_at_utc']):errors.append('expired_session_consumption')
        member_ids=[m['repository_id'] for m in review['members']]
        if len(set(member_ids))!=len(member_ids) or not set(member_ids)<=set(before['repository_ids']):errors.append('review_repository_scope')
        sources={};bindings=[]
        for member in review['members']:
            repository=read(member['repository_binding_ref'],'backup_repository_binding',BACKUP);bindings.append(repository)
            if repository['repository_binding_id']!=member['repository_binding_ref'] or repository['repository_id']!=member['repository_id'] or repository['recovery_set_id']!=a['recovery_set_id']:errors.append('repository_binding_identity')
            snap=read(member['before_slot_snapshot_ref'],'slot_snapshot');sources[member['repository_id']]=snap
            if snap['snapshot_id']!=member['before_slot_snapshot_ref'] or snap['repository_id']!=member['repository_id'] or snap['recovery_set_id']!=a['recovery_set_id'] or snap['recovery_set_generation']!=a['recovery_set_generation'] or snap['engine_format_ref']!=before['engine_format_ref']:errors.append('slot_snapshot_original')
            if instant(snap['observed_at_utc'])>instant(review['reviewed_at_utc']):errors.append('snapshot_after_review')
            slots={s['key_slot_id']:s for s in snap['key_slots']}
            if len(slots)!=len(snap['key_slots']) or not set(member['retire_slot_ids'])<=set(slots):errors.append('old_slot_selection')
            if any(slots[k]['state']!='active' for k in member['retire_slot_ids'] if k in slots):errors.append('old_slot_not_active')
            public={s['key_slot_id']:s for s in before['key_slots']}
            if len(public)!=len(before['key_slots']):errors.append('duplicate_public_slot_identity')
            if any(k not in public or public[k]!=v for k,v in slots.items()):errors.append('public_original_slots')
        transition=None;after=None;phase_rows=[];after_sources=[];kit_sessions=[];all_phases=[];verified_refs=set();retirements=[];complete=True
        if r['transition_ref'] is not None:
            transition=read(r['transition_ref'],'transition');scoped(transition)
            if transition['transition_id']!=r['transition_ref'] or transition['before_recovery_set_ref']!=q['before_recovery_set_ref']:errors.append('transition_original')
            if transition['currentness_ref']!=r['currentness_ref'] or transition['currentness_sha256']!=r['currentness_sha256']:errors.append('transition_currentness')
            if not instant(original['accepted_at_utc'])<=instant(transition['observed_at_utc'])<=instant(r['observed_at_utc']):errors.append('transition_time')
            after=read(transition['after_recovery_set_ref'],'recovery_set_public_record',BACKUP)
            immutable=('recovery_set_id','engine_format_ref','repository_ids','protected_scheduler_attachment_ref','pm_escrow','raw_recovery_credential_present','tsnet_identity_included')
            if any(after[k]!=before[k] for k in immutable):errors.append('rotation_domain_changed')
            if after['currentness_ref']!=r['currentness_ref']:errors.append('after_currentness')
            mids=[m['repository_id'] for m in transition['members']]
            if len(set(mids))!=len(mids) or set(mids)!=set(member_ids):errors.append('transition_membership')
            review_by={m['repository_id']:m for m in review['members']}
            for member in transition['members']:
                selected=review_by[member['repository_id']];old=sources[member['repository_id']]
                if member['before_slot_snapshot_ref']!=selected['before_slot_snapshot_ref']:errors.append('transition_before_snapshot')
                newer=read(member['after_slot_snapshot_ref'],'slot_snapshot');after_sources.append(newer)
                if newer['snapshot_id']!=member['after_slot_snapshot_ref'] or newer['repository_id']!=member['repository_id'] or newer['recovery_set_id']!=a['recovery_set_id'] or newer['recovery_set_generation']!=after['recovery_set_generation'] or newer['engine_format_ref']!=before['engine_format_ref']:errors.append('after_slot_identity')
                oldslots={s['key_slot_id']:s for s in old['key_slots']};newslots={s['key_slot_id']:s for s in newer['key_slots']}
                if len(newslots)!=len(newer['key_slots']) or set(member['replacement_slot_ids'])&set(oldslots):errors.append('replacement_not_new')
                phases=[]
                for pref in member['phase_receipt_refs']:
                    p=read(pref,'phase_receipt');scoped(p);phases.append(p);phase_rows.append(p);all_phases.append(p['fact'])
                    if p['phase_receipt_id']!=pref or p['repository_id']!=member['repository_id']:errors.append('phase_identity')
                    if not instant(original['accepted_at_utc'])<=instant(p['observed_at_utc'])<=instant(transition['observed_at_utc']):errors.append('phase_time')
                    if p['fact']!='not_run' and not p['native_evidence_refs']:errors.append('phase_evidence_missing')
                    if p['fact']=='applied' and (p['key_slot_id'] not in newslots or newslots[p['key_slot_id']]['generation']!=p['slot_generation']):errors.append('phase_slot_result')
                key={(p['kind'],p['key_slot_id']):p for p in phases}
                required={('add',k) for k in member['replacement_slot_ids']}|{('verify',k) for k in member['replacement_slot_ids']}|{('retire',k) for k in selected['retire_slot_ids']}
                if len(key)!=len(phases) or set(key)!=required:errors.append('phase_inventory')
                complete=complete and set(p['fact'] for p in phases)=={'applied'}
                for slot in member['replacement_slot_ids']:
                    add=key[('add',slot)];verify=key[('verify',slot)]
                    if verify['fact']!='not_run' and add['fact']=='applied' and (verify['slot_generation']!=add['slot_generation'] or slot not in newslots or verify['slot_generation']!=newslots[slot]['generation']):errors.append('verify_selected_slot_generation')
                    if verify['fact']=='applied':
                        verified_refs.add(verify['phase_receipt_id'])
                        if add['fact']!='applied' or verify['causal_predecessor_refs']!=[add['phase_receipt_id']] or newslots[slot]['state']!='active':errors.append('verify_without_actual_add')
                    if add['fact'] in ('not_run','not_applied') and slot in newslots:errors.append('unapplied_new_slot_present')
                for slot in selected['retire_slot_ids']:
                    retire=key[('retire',slot)];retirements.append(retire)
                    if retire['slot_generation']!=oldslots[slot]['generation'] or slot in newslots and newslots[slot]['generation']!=oldslots[slot]['generation']:errors.append('retire_original_slot_generation')
                    if slot not in newslots:errors.append('old_slot_fact_erased')
                    elif retire['fact']=='applied' and newslots[slot]['state']!='retired':errors.append('retired_slot_not_retired')
                    elif retire['fact'] in ('not_run','not_applied') and newslots[slot]!=oldslots[slot]:errors.append('surviving_old_slot_changed')
                untouched=set(oldslots)-set(selected['retire_slot_ids'])
                if any(newslots.get(k)!=oldslots[k] for k in untouched) or set(newslots)-set(oldslots)-set(member['replacement_slot_ids']):errors.append('unreviewed_slot_effect')
                public_after={s['key_slot_id']:s for s in after['key_slots']}
                if len(public_after)!=len(after['key_slots']) or any(k not in public_after or public_after[k]['generation']!=v['generation'] for k,v in newslots.items()):errors.append('public_after_slots')
            required_verifications=sum(len(m['replacement_slot_ids']) for m in transition['members'])
            for p in retirements:
                if p['fact'] not in ('not_run','not_applied') and (len(verified_refs)!=required_verifications or set(p['causal_predecessor_refs'])!=verified_refs):errors.append('retirement_before_global_verification')
            if any(p['fact']=='applied' and p['kind']=='add' for p in phase_rows) and after['kit_confirmation'] not in ('needs_updated_kit','human_acknowledged','unlock_tested'):errors.append('updated_kit_obligation_erased')
            for kref in transition['kit_session_refs']:
                kit=read(kref,'recovery_kit_delivery_session',BACKUP);kit_sessions.append(kit)
                if kit['delivery_session_id']!=kref or kit['recovery_set_id']!=after['recovery_set_id'] or kit['recovery_set_generation']!=after['recovery_set_generation'] or kit['audience_client_id']!=a['initiating_client_id']:errors.append('kit_actual_scope')
            if any(p['fact']=='applied' and p['kind']=='add' for p in phase_rows) and after['kit_confirmation'] in ('human_acknowledged','unlock_tested'):
                expected=('acknowledge_saved','acknowledged') if after['kit_confirmation']=='human_acknowledged' else ('test_saved','tested')
                if not any((k['action'],k['terminal_status'])==expected and k['result_receipt_ref'] is not None and k['result_receipt_ref']==after['last_kit_delivery_receipt_ref'] for k in kit_sessions):errors.append('kit_confirmation_without_actual_session')
        phase_unknown='unknown' in all_phases or use['state']=='unknown'
        effect='unknown' if phase_unknown else 'known_applied' if 'applied' in all_phases else 'known_not_applied' if 'not_applied' in all_phases else 'not_attempted'
        if r['effect_state']!=effect:errors.append('rotation_effect_truth')
        if phase_unknown and (r['outcome']!='unknown' or r['reconciliation_ref'] is None):errors.append('rotation_unknown_erased')
        if r['outcome']=='unknown' and r['reconciliation_ref'] is None:errors.append('unknown_without_reconciliation')
        if transition is not None and transition['reconciliation_ref']!=r['reconciliation_ref']:errors.append('transition_reconciliation')
        if any(p['fact']!='not_run' for p in phase_rows) and use['state']=='unused':errors.append('engine_without_consumed_input')
        if r['outcome']=='completed' and (transition is None or not complete or phase_unknown):errors.append('incomplete_rotation_success')
        if r['outcome']=='completed' and r['error_ref'] is not None:errors.append('completed_with_error')
        receipt=error=None
        if r['outcome']=='accepted':
            if association['phase']=='terminal' or r['receipt_ref'] is not None or r['error_ref'] is not None or r['reconciliation_ref'] is not None:errors.append('accepted_terminal_evidence')
            if association['phase']=='awaiting_protected_input' and (use['state']!='unused' or transition is not None or session['terminal_status']!='created'):errors.append('awaiting_input_state')
            if association['phase']=='awaiting_protected_input' and instant(association['observed_at_utc'])>instant(submission['input_contract']['expires_at_utc']):errors.append('expired_pending_input')
            if association['phase']=='engine_in_progress' and (use['state']!='consumed_zeroized' or transition is None):errors.append('engine_progress_without_evidence')
            if instant(association['observed_at_utc'])>instant(session['expires_at_utc']):errors.append('expired_nonterminal_session')
            if outcome['outcome'] not in ('accepted','acknowledged','executing') or outcome['result_receipt_ref'] is not None or response['result_status']!='pending' or response['ack_status']!='accepted' or response['receipt_ref'] not in (None,outcome['acknowledgement_receipt_ref']):errors.append('accepted_response')
            if outcome['error_ref'] is not None or response['error'] is not None:errors.append('accepted_error')
        else:
            if association['phase']!='terminal':errors.append('terminal_session_association')
            receipt=read(r['receipt_ref'],'rotation_receipt')
            if receipt['receipt_ref']!=r['receipt_ref'] or receipt['original_binding_ref']!=original_binding_ref:errors.append('receipt_identity')
            for k in r:
                if k not in ('schema_id','schema_version') and receipt[k]!=r[k]:errors.append('receipt_'+k)
            expected={'completed':('succeeded','succeeded'),'failed':('failed','failed'),'cancelled':('cancelled','cancelled'),'unknown':('terminal_unknown','recovery_required')}[r['outcome']]
            if outcome['outcome']!=expected[0] or response['result_status']!=expected[1] or response['ack_status']!='accepted':errors.append('response_outcome')
            if outcome['result_receipt_ref']!=r['receipt_ref'] or response['receipt_ref']!=r['receipt_ref']:errors.append('response_receipt')
            if outcome['error_ref']!=r['error_ref'] or response['error']!=receipt['ui_error']:errors.append('response_error')
            if r['error_ref'] is not None:
                error=read(r['error_ref'],'backup_restore_command_error',BACKUP)
                if error['command_id']!=command or error['command_instance_id']!=a['command_instance_id']:errors.append('error_original')
            elif r['outcome']!='completed' or receipt['ui_error'] is not None:errors.append('missing_error')
        original_response=read(response['original_dispatch_id'],None,UI) if response['replayed'] else None
        errors+=replay_failures(response,original_response)
        proof('admission',verify_original_admission,original,q)
        proof('source',verify_rotation_sources,original,q,review,before,sources,bindings,after,after_sources)
        proof('protected',verify_protected_session,original,q,association,submission,session,use)
        proof('engine',verify_engine_effects,original,q,r,review,transition,phase_rows,receipt,kit_sessions)
        proof('disclosure',check_current_disclosure,original,q,r,response,delivery,error,receipt)
    except Exception as exc:errors.append('owner_resolution:'+type(exc).__name__)
    if inputs!=frozen or any(live[k]!=cache[k] for k in cache):errors.append('original_mutated')
    return sorted(set(errors))

def response_failures(bundle,dependencies):
    if not isinstance(dependencies,dict):return ['rotation_native_dependencies_missing']
    saved=deepcopy(bundle);snapshots=[]
    try:
        def read(ref):
            v=dependencies['resolve_record'](ref);snapshots.append((v,deepcopy(v)));return deepcopy(v)
        original=read(bundle['original_binding_ref']);outcome=bundle['outcome'];response=bundle['response'];q=bundle['owner_request']
        expected={'request_ref':original['request_ref'],'command_id':q['authority']['command_id'],'command_instance_id':original['identity']['command_instance_id'],'operation_id':original['identity']['operation_id'],'owner_identity':original['identity'],**{k:original[k] for k in ('payload_sha256','idempotency_key','target_generation','dispatch_frame_id')}}
        errors=[]
        if any(bundle['normalized_request'].get(k)!=v for k,v in expected.items()):errors.append('rotation_normalized_original')
        if read(bundle['resolved_outcome_ref'])!=outcome or read(bundle['response_ref'])!=response:errors.append('rotation_bundle_actual')
        errors+=validate_rotation_result(q,bundle['owner_result'],bundle['original_binding_ref'],bundle['resolved_outcome_ref'],bundle['response_ref'],bundle['delivery_return_context'],**dependencies)
    except Exception as exc:errors=['rotation_response_resolution:'+type(exc).__name__]
    if bundle!=saved or any(a!=b for a,b in snapshots):errors.append('rotation_response_mutated')
    return sorted(set(errors))
def fixture_dependencies(v):
    """Synthetic values/doubles for static joins only, never native proof."""
    return {'resolve_record':lambda ref:v['records'][ref],'canonical_digest':owner_result_digest,**{k:lambda *a:[] for k in ('verify_original_admission','verify_rotation_sources','verify_protected_session','verify_engine_effects','check_current_disclosure')}}
def rotation_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    if shape(definition,value):return ['fixture_shape']
    return validate_rotation_result(value['request'],value['result'],value['original_binding_ref'],value['outcome_ref'],value['response_ref'],value['delivery_return_context'],**fixture_dependencies(value))
