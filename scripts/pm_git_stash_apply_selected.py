"""SCS-003/SCS-024 static original/selected-stash/effect joins; no Git engine or authentication.

Resolvers must supply authentic, version-pinned owner records. The final live
comparison catches mutation by a later callback; equality is not native proof.
The selected stash object must already be verified locally: this operation has
no acquisition phase or receipt, so no acquisition path is admitted, and
completed success requires its own verified post-apply stash source observed
between the apply phase finishing and the observation.
Applying retains the stash: no join here admits a pop, drop or delete effect.
"""
from copy import deepcopy
from datetime import datetime
import json,os
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

SELF='git_stash_apply_selected.schema.json'
SC='source_control_contracts.schema.json'
ROOT=Path(__file__).resolve().parents[1]
MODE_FILE_ONLY='file_changes_only'
MODE_WITH_STAGED='file_changes_plus_saved_staged_selections'


def shape_failures(definition,value,*,owner=SELF,canon_root=None):
    root=Path(canon_root or os.environ.get('PM_CANON_ROOT',ROOT))
    registry=Registry()
    for name in (SC,SELF):
        path=(ROOT/'Plans'/name) if name==SELF else root/'Plans'/name
        data=json.loads(path.read_text());registry=registry.with_resource(data['$id'],Resource.from_contents(data))
        if name==owner:schema=data
    return [e.message for e in Draft202012Validator({'$ref':schema['$id']+'#/$defs/'+definition},registry=registry,format_checker=FormatChecker()).iter_errors(value)]


def stash_apply_failures(original_request,result,*,resolve_record,canon_root=None):
    inputs=(original_request,result);saved=deepcopy(inputs);request,result=saved
    if not callable(resolve_record):return ['stash_apply_resolver_missing']
    if shape_failures('request',request,canon_root=canon_root):return ['stash_apply_request_schema']
    if shape_failures('result',result,canon_root=canon_root):return ['stash_apply_result_schema']
    failures=[];records={};live={}
    def fail(rule,condition):
        if condition:failures.append('stash_apply_'+rule)
    def read(ref,definition,owner=SELF,id_field=None):
        if ref not in records:
            live[ref]=resolve_record(ref);records[ref]=deepcopy(live[ref])
        value=deepcopy(records[ref])
        if shape_failures(definition,value,owner=owner,canon_root=canon_root):raise ValueError(definition+'_schema')
        if id_field and value[id_field]!=ref:raise ValueError(definition+'_identity')
        return value
    time=lambda x:datetime.fromisoformat(x.replace('Z','+00:00'))
    oid_length=40 if request['expected_revision']['object_format']=='sha1' else 64
    def oid(value):
        fail('object_format',value is not None and len(value)!=oid_length)
    def view(value,actual=False):
        for key in ('head_commit_oid','head_tree_oid','index_tree_oid'):oid(value[key])
        for path in value['paths']:
            oid(path['worktree']['object_id'])
            for entry in path['index_stages']:oid(entry['content']['object_id'])
        for conflict in value['conflicts']:
            for side in ('base','ours','theirs'):oid(conflict[side]['object_id'])
        paths=[p['path'] for p in value['paths']];conflicts=[c['path'] for c in value['conflicts']]
        fail('view_duplicate',len(paths)!=len(set(paths)) or len(conflicts)!=len(set(conflicts)))
        fail('conflict_path_missing',not set(conflicts)<=set(paths))
        fail('actual_head_missing',actual and value['head_commit_oid'] is None)
        for p in value['paths']:
            stages=[e['stage'] for e in p['index_stages']]
            fail('index_stages',len(stages)!=len(set(stages)) or (0 in stages and len(stages)>1))
    def unknown(value):
        return (not value['complete'] or any(p['worktree']['state']=='unknown' or any(e['content']['state']=='unknown' for e in p['index_stages']) for p in value['paths'])
                or any(c['native_state']=='unknown' or any(c[k]['state']=='unknown' for k in ('base','ours','theirs')) for c in value['conflicts']))
    def effects(before,after,values):
        left={p['path']:p for p in before['paths']};right={p['path']:p for p in after['paths']}
        actual={v['path']:v['disposition'] for v in values}
        fail('effects_complete',len(actual)!=len(values) or set(actual)!=(set(left)|set(right)))
        unresolved={c['path'] for c in after['conflicts'] if c['native_state']=='unresolved'}
        for path,disposition in actual.items():
            if path in unresolved:fail('conflict_erasure',disposition not in ('conflicted','unknown'))
            elif left.get(path)==right.get(path):fail('preserved_effect',disposition not in ('preserved','unknown'))
            else:fail('changed_effect',disposition not in ('applied','unknown'))
    def native_receipt(ref):
        value=read(ref,'native_apply_receipt',id_field='receipt_id')
        for k in ('operation_id','repository_context_ref','selection','restoration_mode','permission_snapshot_ref','file_safe_decision_ref','writer_lease_ref','credential_lease_ref'):
            fail('native_receipt_'+k,value[k]!=request[k])
        fail('native_receipt_self',value['phase']['native_receipt_ref']!=ref)
        return value
    def state(ref,actual=False):
        v=read(ref,'state_source',id_field='source_id')
        fail('state_scope',v['repository_context_ref']!=request['repository_context_ref'] or v['repo_id']!=context['repo_id'])
        fail('state_head',v['view']['head_commit_oid']!=v['revision']['commit_oid'])
        fail('state_object_format',v['revision']['object_format']!=request['expected_revision']['object_format'])
        view(v['view'],actual)
        return v
    def stash(ref):
        v=read(ref,'stash_source',id_field='source_id')
        fail('stash_scope',v['repository_context_ref']!=request['repository_context_ref'] or v['repo_id']!=context['repo_id'] or v['selection']!=request['selection'])
        fail('stash_format',v['object_format']!=request['expected_revision']['object_format'])
        fail('stash_selected_object',v['stash_commit_oid']!=request['selection']['stash_commit_oid'])
        for value_oid in (v['stash_commit_oid'],v['stash_tree_oid'],v['stash_index_tree_oid']):oid(value_oid)
        fail('stash_recorded_duplicate',len(set(v['recorded_staged_paths']))!=len(v['recorded_staged_paths']))
        return v
    try:
        fail('original',read(result['original_request_ref'],'request')!=request)
        for k in ('command_id','command_instance_id','operation_id','idempotency_key','return_context'):fail('original_'+k,result[k]!=request[k])
        context=read(request['repository_context_ref'],'repository_context',SC)
        fail('context',context['scm_backend']!='git' or context['revision']!=request['expected_revision'] or context['writer_lease_ref']!=request['writer_lease_ref'])
        lease=read(request['writer_lease_ref'],'writer_lease',SC,'lease_id')
        fail('lease_scope',lease['repo_id']!=context['repo_id'] or lease['workspace_id']!=context['workspace_id'] or lease['scm_backend']!='git')
        fail('lease_generation',lease['generation']!=request['writer_lease_generation'] or lease['epoch']!=request['writer_lease_epoch'])
        credential=None
        if request['credential_lease_ref'] is not None:
            credential=read(request['credential_lease_ref'],'credential_lease',SC,'credential_lease_id')
            fail('credential_scope',credential['repo_id']!=context['repo_id'] or credential['operation_id']!=request['operation_id'])
        preview=read(request['preview_ref'],'preview',id_field='preview_id')
        for k in ('command_id','command_instance_id','repository_context_ref','selection','restoration_mode','expected_revision','currentness_generation','permission_snapshot_ref','file_safe_decision_ref','writer_lease_ref'):
            fail('preview_'+k,preview[k]!=request[k])
        qualification=read(preview['qualification_ref'],'qualification',id_field='qualification_id')
        for k in qualification:
            if k not in ('schema_id','schema_version','qualification_id'):fail('qualification_'+k,qualification[k]!=preview[k])
        before=state(preview['before_source_ref']);selected=stash(preview['stash_source_ref'])
        fail('preview_before',before['view']!=preview['before'] or before['revision']!=request['expected_revision'] or before['config']!=preview['config'])
        fail('preview_time',time(before['observed_at_utc'])>time(preview['issued_at_utc']) or time(selected['observed_at_utc'])>time(preview['issued_at_utc']) or time(preview['issued_at_utc'])>time(request['requested_at_utc']))
        view(preview['proposed']);effects(preview['before'],preview['proposed'],preview['effects'])
        plan=preview['staged_restoration']
        fail('plan_mode',plan['mode']!=request['restoration_mode'])
        fail('plan_recorded',plan['planned']=='restore_recorded_staged_selections' and plan['paths']!=selected['recorded_staged_paths'])
        fail('plan_blocked',plan['planned']=='not_restorable' and preview['qualification']!='blocked')
        fail('preview_head_moved',preview['proposed']['head_commit_oid']!=before['view']['head_commit_oid'])
        if request['restoration_mode']==MODE_FILE_ONLY:
            fail('preview_index_mode',preview['proposed']['index_tree_oid']!=before['view']['index_tree_oid'])
        elif plan['planned']=='restore_recorded_staged_selections':
            fail('preview_index_staged',preview['proposed']['index_tree_oid']!=selected['stash_index_tree_oid'])
        fail('result_time',time(result['observed_at_utc'])<time(request['requested_at_utc']))
        fail('error_projection_presence',(result['error_ref'] is None)!=(result['error_projection_ref'] is None))
        if result['error_ref'] is not None:
            error=read(result['error_ref'],'error')
            fail('error_instance',error['command_instance_id']!=request['command_instance_id'] or error['command_id']!=request['command_id'] or error['repository_context_ref']!=request['repository_context_ref'])
            fail('error_unknown',error['effect_state']=='effect_unknown' and result['outcome'] not in ('effect_unknown','recovery_required'))
        if result['outcome']=='accepted':
            fail('accepted_terminal',result['operation_receipt_ref'] is not None or result['observation_ref'] is not None)
            fail('accepted_work',result['observable_work_id'] is None)
        else:
            receipt=read(result['operation_receipt_ref'],'operation_receipt',SC,'receipt_id')
            for k in ('command_instance_id','operation_id','repository_context_ref','writer_lease_ref','credential_lease_ref'):fail('receipt_'+k,receipt[k]!=request[k])
            fail('receipt_result',receipt['outcome']!=result['outcome'] or receipt['observable_work_id']!=result['observable_work_id'] or receipt['scm_backend']!='git' or receipt['before_revision']!=request['expected_revision'])
            fail('receipt_time',not time(request['requested_at_utc'])<=time(receipt['completed_at_utc'])<=time(result['observed_at_utc']))
            observation=read(result['observation_ref'],'observation',id_field='observation_id')
            for k in ('command_instance_id','operation_id','selection','preview_ref','restoration_mode'):fail('observation_'+k,observation[k]!=request[k])
            fail('observation_original',observation['original_request_ref']!=result['original_request_ref'])
            fail('observation_time',not time(request['requested_at_utc'])<=time(observation['observed_at_utc'])<=time(receipt['completed_at_utc']))
            applied=observation['apply']
            fail('apply_identity',applied['phase']!='apply')
            if applied['state']=='not_called':
                fail('not_called_effect',applied['effect_state']!='none' or any(applied[k] is not None for k in ('native_receipt_ref','before_source_ref','after_source_ref','stash_source_ref','stash_after_source_ref','started_at_utc','finished_at_utc')))
            else:
                fail('apply_times',applied['started_at_utc'] is None or applied['finished_at_utc'] is None)
                if applied['started_at_utc'] and applied['finished_at_utc']:fail('apply_order',not time(request['requested_at_utc'])<=time(applied['started_at_utc'])<=time(applied['finished_at_utc'])<=time(observation['observed_at_utc']))
                fail('known_native_receipt',applied['effect_state'] in ('known_applied','known_not_applied') and applied['native_receipt_ref'] is None)
                fail('completed_native_receipt',applied['state']=='completed' and applied['native_receipt_ref'] is None)
                if applied['native_receipt_ref'] is not None:fail('native_apply_facts',native_receipt(applied['native_receipt_ref'])['phase']!=applied)
                fail('called_lease',lease['state']!='active' or not time(lease['acquired_at_utc'])<=time(applied['started_at_utc'])<time(lease['expires_at_utc']))
                if credential:fail('called_credential',credential['revocation_state']!='active' or not time(credential['issued_at_utc'])<=time(applied['started_at_utc'])<time(credential['expires_at_utc']))
                fail('called_qualification',preview['qualification']!='qualified' or unknown(preview['before']) or unknown(preview['proposed']) or any(x['disposition']=='unknown' for x in preview['effects']))
                fail('called_stash_source',applied['stash_source_ref'] is None or applied['before_source_ref'] is None)
                if applied['before_source_ref'] is not None:
                    actual_input=state(applied['before_source_ref'],True)
                    fail('apply_input_drift',actual_input['view']!=before['view'] or actual_input['revision']!=before['revision'] or actual_input['config']!=before['config'])
                if applied['stash_source_ref'] is not None:
                    actual_stash=stash(applied['stash_source_ref'])
                    # The actual apply input must be the exact selected object
                    # and locally verified by its own owner.  This operation has
                    # no acquisition phase or receipt, so no other availability
                    # value can authorize the mutation.
                    fail('apply_stash_drift',any(actual_stash[k]!=selected[k] for k in ('stash_commit_oid','stash_tree_oid','stash_index_tree_oid','object_format')) or actual_stash['availability']!='verified_local')
                stash_after=None
                if applied['stash_after_source_ref'] is not None:
                    stash_after=stash(applied['stash_after_source_ref'])
                    fail('stash_after_selection',stash_after['selection']!=request['selection'] or stash_after['stash_commit_oid']!=request['selection']['stash_commit_oid'])
                    fail('stash_after_time',time(stash_after['observed_at_utc'])>time(observation['observed_at_utc']))
            after=None
            if applied['after_source_ref'] is not None:
                after=state(applied['after_source_ref'],True)
                effects(before['view'],after['view'],observation['actual_effects'])
                fail('actual_after_revision',receipt['after_revision']!=after['revision'])
                fail('actual_after_time',time(after['observed_at_utc'])>time(observation['observed_at_utc']))
                fail('actual_after_head',after['view']['head_commit_oid']!=before['view']['head_commit_oid'])
            else:fail('absent_after',receipt['after_revision'] is not None or bool(observation['actual_effects']))
            staged=observation['staged_selection_effect']
            fail('staged_mode',staged['mode']!=request['restoration_mode'])
            fail('staged_recorded',staged['recorded_paths']!=selected['recorded_staged_paths'])
            fail('staged_effect_recorded',not set(staged['restored_paths'])<=set(staged['recorded_paths']) or not set(staged['not_restored_paths'])<=set(staged['recorded_paths']))
            unresolved=(observation['completion']=='unknown' or applied['effect_state']=='unknown' or not applied['complete']
                        or any(e['disposition']=='unknown' for e in observation['actual_effects']) or staged['disposition']=='unknown'
                        or (after is not None and unknown(after['view'])))
            fail('unknown_outcome',unresolved and result['outcome'] not in ('effect_unknown','recovery_required'))
            if observation['completion']=='completed':
                fail('completion',result['outcome']!='succeeded' or applied['state']!='completed' or applied['effect_state']!='known_applied' or after is None)
                fail('stash_retained_evidence',applied['stash_after_source_ref'] is None)
                # Completed success claims the stash is still present, so it
                # needs its own post-apply source that verifies the exact
                # selected stash object locally; unknown or unavailable
                # availability stays a truthful unknown/recovery-required
                # outcome instead of an invented retention proof.
                fail('stash_after_source_independent',applied['stash_after_source_ref']==applied['stash_source_ref'])
                fail('stash_retained_verification',stash_after is None or stash_after['availability']!='verified_local')
                # The retention proof must be a genuinely post-apply
                # observation: at or after the apply phase finished and no
                # later than the observation itself.  A source observed before
                # the request or before apply completion proves nothing about
                # the applied state and cannot back a completed success.
                fail('stash_retained_window',stash_after is None or applied['finished_at_utc'] is None
                     or not time(applied['finished_at_utc'])<=time(stash_after['observed_at_utc'])<=time(observation['observed_at_utc']))
                if after:
                    fail('completed_unresolved_conflict',any(c['native_state']=='unresolved' for c in after['view']['conflicts']))
                    expected=deepcopy(preview['proposed']);actual=deepcopy(after['view'])
                    if expected['head_commit_oid'] is None:actual['head_commit_oid']=None
                    fail('completed_preview',actual!=expected or observation['actual_effects']!=preview['effects'])
                if request['restoration_mode']==MODE_WITH_STAGED:
                    if selected['recorded_staged_paths']:
                        fail('completed_staged_restored',staged['disposition']!='restored' or staged['restored_paths']!=selected['recorded_staged_paths'])
                    else:
                        fail('completed_staged_none',staged['disposition']!='not_recorded')
            else:fail('false_success',result['outcome']=='succeeded')
            if observation['completion']=='not_applied':fail('not_applied',after is not None or applied['effect_state'] not in ('none','known_not_applied'))
            if observation['completion']=='partial':fail('partial',result['outcome'] not in ('failed','cancelled','recovery_required','effect_unknown') or applied['effect_state'] not in ('known_applied','unknown'))
            if request['restoration_mode']==MODE_WITH_STAGED and staged['disposition'] in ('not_restored','partially_restored'):
                fail('not_restorable_truth',staged['reason_ref'] is None)
    except Exception as exc:failures.append('stash_apply_unresolved:'+str(exc))
    if inputs!=saved:failures.append('stash_apply_inputs_mutated')
    if any(live[k]!=v for k,v in records.items()):failures.append('stash_apply_owner_record_mutated')
    return sorted(set(failures))


def fixture_dependencies(value):
    """Synthetic fixture resolver, explicitly not native proof."""
    records=deepcopy(value['records'])
    return {'resolve_record':lambda ref:deepcopy(records[ref])}


def stash_apply_semantic_failures(definition,value):
    return stash_apply_failures(value['request'],value['result'],**fixture_dependencies(value)) if definition=='fixture_case' else []
