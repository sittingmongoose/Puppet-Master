"""Static ACT017 original/native-value joins; no Git engine or authentication.

Resolvers must supply authentic, version-pinned owner records. The final live
comparison catches mutation by a later callback; equality is not native proof.
"""
from copy import deepcopy
from datetime import datetime
import json,os
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

SELF='git_pull_selected.schema.json'
SC='source_control_contracts.schema.json'
ROOT=Path(__file__).resolve().parents[1]


def shape_failures(definition,value,*,owner=SELF,canon_root=None):
    root=Path(canon_root or os.environ.get('PM_CANON_ROOT',ROOT))
    registry=Registry()
    for name in (SC,SELF):
        path=(ROOT/'Plans'/name) if name==SELF else root/'Plans'/name
        data=json.loads(path.read_text());registry=registry.with_resource(data['$id'],Resource.from_contents(data))
        if name==owner:schema=data
    return [e.message for e in Draft202012Validator({'$ref':schema['$id']+'#/$defs/'+definition},registry=registry,format_checker=FormatChecker()).iter_errors(value)]


def pull_failures(original_request,result,*,resolve_record,canon_root=None):
    inputs=(original_request,result);saved=deepcopy(inputs);request,result=saved
    if not callable(resolve_record):return ['git_pull_resolver_missing']
    if shape_failures('request',request,canon_root=canon_root):return ['git_pull_request_schema']
    if shape_failures('result',result,canon_root=canon_root):return ['git_pull_result_schema']
    failures=[];records={};live={}
    def fail(rule,condition):
        if condition:failures.append('git_pull_'+rule)
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
    def phase_oids(value):
        for value_oid in value['fetched_object_oids']:oid(value_oid)
        for update in value['ref_updates']:
            oid(update['before_oid']);oid(update['after_oid'])
    def native_receipt(ref):
        value=read(ref,'native_phase_receipt',id_field='receipt_id')
        for k in ('operation_id','repository_context_ref','selection','permission_snapshot_ref','file_safe_decision_ref','writer_lease_ref','credential_lease_ref'):fail('native_receipt_'+k,value[k]!=request[k])
        fail('native_receipt_self',value['phase']['native_receipt_ref']!=ref)
        phase_oids(value['phase'])
        return value
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
            else:fail('changed_effect',disposition not in ('integrated','unknown'))
    def state(ref):
        v=read(ref,'state_source',id_field='source_id')
        fail('state_scope',v['repository_context_ref']!=request['repository_context_ref'] or v['repo_id']!=context['repo_id'])
        fail('state_head',v['view']['head_commit_oid']!=v['revision']['commit_oid'])
        fail('state_object_format',v['revision']['object_format']!=request['expected_revision']['object_format'])
        view(v['view'],True)
        return v
    def upstream(ref):
        v=read(ref,'upstream_source',id_field='source_id')
        fail('upstream_scope',v['repository_context_ref']!=request['repository_context_ref'] or v['repo_id']!=context['repo_id'] or v['selection']!=request['selection'])
        fail('upstream_format',v['object_format']!=request['expected_revision']['object_format'])
        oid(v['upstream_commit_oid']);oid(v['upstream_tree_oid'])
        fail('upstream_acquisition_presence',(v['availability']=='acquired_under_admission')!=(v['acquisition_receipt_ref'] is not None))
        if v['acquisition_receipt_ref'] is not None:
            acquisition=native_receipt(v['acquisition_receipt_ref'])['phase']
            fail('upstream_acquisition',acquisition['phase']!='fetch' or acquisition['state']!='completed' or acquisition['effect_state']!='known_applied' or acquisition['upstream_source_ref']!=ref)
            fail('upstream_acquisition_time',acquisition['finished_at_utc'] is None or time(acquisition['finished_at_utc'])>time(v['observed_at_utc']))
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
            fail('credential_remote',credential['transport']!=request['selection']['transport'] or credential['host_identity']!=request['selection']['host_identity'])
        preview=read(request['preview_ref'],'preview',id_field='preview_id')
        for k in ('command_id','command_instance_id','repository_context_ref','selection','expected_revision','permission_snapshot_ref','file_safe_decision_ref','writer_lease_ref'):fail('preview_'+k,preview[k]!=request[k])
        qualification=read(preview['qualification_ref'],'qualification',id_field='qualification_id')
        for k in qualification:
            if k not in ('schema_id','schema_version','qualification_id'):fail('qualification_'+k,qualification[k]!=preview[k])
        before=state(preview['before_source_ref']);source=upstream(preview['upstream_source_ref'])
        fail('preview_before',before['view']!=preview['before'] or before['revision']!=request['expected_revision'] or before['config']!=preview['config'])
        fail('preview_time',time(before['observed_at_utc'])>time(preview['issued_at_utc']) or time(source['observed_at_utc'])>time(preview['issued_at_utc']) or time(preview['issued_at_utc'])>time(request['requested_at_utc']))
        view(preview['proposed']);effects(preview['before'],preview['proposed'],preview['effects'])
        for value_oid in preview['ancestry']['merge_base_oids']+preview['ancestry']['rewritten_commit_oids']:oid(value_oid)
        if request['selection']['strategy']=='ff_only' and preview['qualification']=='qualified':
            fail('ff_only_ancestry',preview['ancestry']['upstream_is_descendant']!='yes' or bool(preview['ancestry']['rewritten_commit_oids']))
            fail('ff_only_head',preview['proposed']['head_commit_oid']!=source['upstream_commit_oid'])
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
            for k in ('command_instance_id','operation_id','selection','preview_ref'):fail('observation_'+k,observation[k]!=request[k])
            fail('observation_original',observation['original_request_ref']!=result['original_request_ref'])
            fail('observation_time',not time(request['requested_at_utc'])<=time(observation['observed_at_utc'])<=time(receipt['completed_at_utc']))
            fetched=observation['fetch'];integration=observation['integration']
            fail('phase_identity',fetched['phase']!='fetch' or integration['phase']!='integrate')
            called=integration['state']!='not_called'
            for phase in (fetched,integration):
                phase_oids(phase)
                fail('phase_ref_duplicate',len({r['ref_name'] for r in phase['ref_updates']})!=len(phase['ref_updates']))
                fail('integration_fetch_objects',phase['phase']=='integrate' and bool(phase['fetched_object_oids']))
                if phase['state']=='not_called' or phase['effect_state'] in ('none','known_not_applied'):fail('phase_no_effect',bool(phase['fetched_object_oids']) or bool(phase['ref_updates']))
                if phase['state']=='not_called':fail('not_called_effect',phase['effect_state']!='none' or any(phase[k] is not None for k in ('native_receipt_ref','before_source_ref','after_source_ref','upstream_source_ref','started_at_utc','finished_at_utc')))
                else:
                    fail('phase_times',phase['started_at_utc'] is None or phase['finished_at_utc'] is None)
                    if phase['started_at_utc'] and phase['finished_at_utc']:fail('phase_order',not time(request['requested_at_utc'])<=time(phase['started_at_utc'])<=time(phase['finished_at_utc'])<=time(observation['observed_at_utc']))
                    fail('known_native_receipt',phase['effect_state'] in ('known_applied','known_not_applied') and phase['native_receipt_ref'] is None)
                    fail('completed_native_receipt',phase['state']=='completed' and phase['native_receipt_ref'] is None)
                    if phase['native_receipt_ref'] is not None:fail('native_phase_facts',native_receipt(phase['native_receipt_ref'])['phase']!=phase)
                    fail('called_lease',lease['state']!='active' or not time(lease['acquired_at_utc'])<=time(phase['started_at_utc'])<time(lease['expires_at_utc']))
                    if credential:fail('called_credential',credential['revocation_state']!='active' or not time(credential['issued_at_utc'])<=time(phase['started_at_utc'])<time(credential['expires_at_utc']))
            if fetched['state']!='not_called':
                fail('fetch_before_integrate',called and fetched['state']!='completed')
                fail('completed_fetch_source',fetched['state']=='completed' and fetched['upstream_source_ref'] is None)
                if fetched['upstream_source_ref'] is not None:
                    actual_upstream=upstream(fetched['upstream_source_ref'])
                    fail('fetch_qualified_object',called and any(actual_upstream[k]!=source[k] for k in ('upstream_commit_oid','upstream_tree_oid','object_format')))
                fail('fetch_before_integration',called and time(fetched['finished_at_utc'])>time(integration['started_at_utc']))
                if fetched['before_source_ref'] is not None or fetched['after_source_ref'] is not None:
                    fetch_before=state(fetched['before_source_ref']);fetch_after=state(fetched['after_source_ref'])
                    fail('fetch_working_copy_changed',fetch_before['view']!=fetch_after['view'] or fetch_before['revision']!=fetch_after['revision'] or fetch_before['config']!=fetch_after['config'])
            if called:
                actual_input=state(integration['before_source_ref']);actual_upstream=upstream(integration['upstream_source_ref'])
                fail('integration_input_drift',actual_input['view']!=before['view'] or actual_input['revision']!=before['revision'] or actual_input['config']!=before['config'])
                fail('integration_upstream_drift',any(actual_upstream[k]!=source[k] for k in ('upstream_commit_oid','upstream_tree_oid','object_format')) or actual_upstream['availability'] not in ('verified_local','acquired_under_admission'))
                fail('integration_qualification',preview['qualification']!='qualified' or unknown(preview['before']) or unknown(preview['proposed']) or any(x['disposition']=='unknown' for x in preview['effects']))
                fail('integration_lease',lease['state']!='active' or not time(lease['acquired_at_utc'])<=time(integration['started_at_utc'])<time(lease['expires_at_utc']))
                if credential:fail('credential_current',credential['revocation_state']!='active' or not time(credential['issued_at_utc'])<=time(integration['started_at_utc'])<time(credential['expires_at_utc']))
            after=None
            if integration['after_source_ref'] is not None:
                after=state(integration['after_source_ref']);effects(before['view'],after['view'],observation['actual_effects'])
                fail('actual_after_revision',receipt['after_revision']!=after['revision'])
                fail('actual_after_time',time(after['observed_at_utc'])>time(observation['observed_at_utc']))
            else:fail('absent_after',receipt['after_revision'] is not None or bool(observation['actual_effects']))
            unresolved=observation['completion']=='unknown' or any(p['state']=='unknown' or p['effect_state']=='unknown' or not p['complete'] for p in (fetched,integration)) or any(e['disposition']=='unknown' for e in observation['actual_effects'])
            unresolved=unresolved or (after is not None and unknown(after['view']))
            fail('unknown_outcome',unresolved and result['outcome'] not in ('effect_unknown','recovery_required'))
            if observation['completion']=='completed':
                fail('completion',result['outcome']!='succeeded' or integration['state']!='completed' or integration['effect_state']!='known_applied' or after is None)
                if after:
                    fail('completed_unresolved_conflict',any(c['native_state']=='unresolved' for c in after['view']['conflicts']))
                    expected=deepcopy(preview['proposed']);actual=deepcopy(after['view'])
                    if expected['head_commit_oid'] is None:actual['head_commit_oid']=None
                    fail('completed_preview',actual!=expected or observation['actual_effects']!=preview['effects'])
            else:fail('false_success',result['outcome']=='succeeded')
            if observation['completion']=='not_applied':fail('not_applied',after is not None or integration['effect_state'] not in ('none','known_not_applied'))
            if observation['completion']=='partial':fail('partial',result['outcome'] not in ('failed','cancelled','recovery_required','effect_unknown') or not any(p['effect_state'] in ('known_applied','unknown') for p in (fetched,integration)))
    except Exception as exc:failures.append('git_pull_unresolved:'+str(exc))
    if inputs!=saved:failures.append('git_pull_inputs_mutated')
    if any(live[k]!=v for k,v in records.items()):failures.append('git_pull_owner_record_mutated')
    return sorted(set(failures))


def fixture_dependencies(value):
    """Synthetic fixture resolver, explicitly not native proof."""
    records=deepcopy(value['records'])
    return {'resolve_record':lambda ref:deepcopy(records[ref])}


def git_pull_semantic_failures(definition,value):
    return pull_failures(value['request'],value['result'],**fixture_dependencies(value)) if definition=='fixture_case' else []
