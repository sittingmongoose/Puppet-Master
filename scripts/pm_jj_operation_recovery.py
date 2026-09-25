"""Typed native recovery value joins, not native authority or an undo interpreter.

Authentic native/source/preview/permission/FileSafe/lease producers and live effect
admission remain prerequisites. Resolver fixtures prove consistency, not issuance.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json,os
from pathlib import Path
from jsonschema import Draft202012Validator,FormatChecker
from referencing import Registry,Resource
ROOT=Path(__file__).resolve().parents[1]
SC='Plans/source_control_contracts.schema.json';JJ='Plans/jujutsu_integration_contracts.schema.json';FULL='Plans/full_thread_runtime_contracts.schema.json';SELF='Plans/jj_operation_recovery.schema.json'
@lru_cache(None)
def schemas(root):
    docs={p:json.loads(((ROOT if p==SELF else Path(root))/p).read_text()) for p in (SC,JJ,FULL,SELF)}
    return docs,Registry().with_resources((s['$id'],Resource.from_contents(s)) for s in docs.values())
def shape_failures(definition,value,*,owner=SELF,canon_root=None):
    docs,reg=schemas(str(canon_root or os.environ.get('PM_CANON_ROOT',ROOT)))
    return [e.message for e in Draft202012Validator({'$ref':docs[owner]['$id']+'#/$defs/'+definition},registry=reg,format_checker=FormatChecker()).iter_errors(value)]
def time(s):return datetime.fromisoformat(s.replace('Z','+00:00'))
def entries(view):
    out={}
    for kind,collection,key in (('change','changes','change_id'),('bookmark','bookmarks','name'),('workspace','workspaces','workspace_id'),('conflict','conflicts','conflict_id'),('file','files','path')):
        for item in view[collection]:
            identity=item[key]
            if (kind,identity) in out:raise ValueError('duplicate_native_identity')
            out[kind,identity]=item
    return out
def effects_failures(before,after,effects,mode):
    b,a=entries(before),entries(after);es={(e['kind'],e['identity']):e['disposition'] for e in effects};errors=[]
    if len(es)!=len(effects) or set(es)!=set(b)|set(a):errors.append('recovery_complete_effect_set')
    for key in set(b)|set(a):
        disposition=es.get(key)
        if b.get(key)==a.get(key) and disposition!='preserved':errors.append('recovery_preserved_effect')
        if b.get(key)!=a.get(key) and disposition not in (('reversed' if mode.endswith('.undo') else 'restored'),'conflicted','unknown'):errors.append('recovery_changed_effect')
        if key[0]=='conflict' and key in a and a[key]['native_state']=='unresolved' and disposition not in ('preserved','conflicted'):errors.append('recovery_native_conflict')
    return errors
def recovery_failures(original_request,result,*,resolve_record,canon_root=None):
    original,output=deepcopy(original_request),deepcopy(result);errors=[];cache={};live={}
    if not callable(resolve_record):return ['recovery_owner_resolver_missing']
    if shape_failures('request',original,canon_root=canon_root) or shape_failures('result',output,canon_root=canon_root):return ['recovery_input_schema']
    def read(ref,definition,owner=SELF):
        if ref not in cache:live[ref]=resolve_record(ref);cache[ref]=deepcopy(live[ref])
        value=deepcopy(cache[ref])
        if shape_failures(definition,value,owner=owner,canon_root=canon_root):raise ValueError('shape:'+definition)
        return value
    def source(ref,context):
        s=read(ref,'operation_source')
        if s['source_id']!=ref or s['repository_context_ref']!=a['repository_context_ref'] or s['repo_id']!=context['repo_id']:errors.append('recovery_source_identity')
        entries(s['view'])
        for w in s['view']['workspaces']:
            if set(w['conflict_ids'])-set(c['conflict_id'] for c in s['view']['conflicts']):errors.append('recovery_source_conflicts')
        for f in s['view']['files']:
            if f['source_location_id']!=context['lineage']['source_location_id']:errors.append('recovery_file_source_location')
        return s
    try:
        a=original['authority'];r=output['owner_result']
        if (r['error'] is None)!=(output['error_projection_ref'] is None):errors.append('recovery_error_projection_presence')
        if read(output['original_request_ref'],'request')!=original:errors.append('recovery_original_request')
        c=read(a['repository_context_ref'],'repository_context',SC);p=read(original['preview_ref'],'preview')
        qualification=read(p['semantics_ref'],'qualification')
        if qualification['qualification_id']!=p['semantics_ref']:errors.append('recovery_qualification_identity')
        for k in ('command_id','command_instance_id','repository_context_ref','expected_revision','snapshot_id','selected_source_ref','current_source_ref','native_toolchain_ref','qualification','selected_parent_operation_id','complete','before','proposed','effects'):
            if qualification[k]!=p[k]:errors.append('recovery_qualification_'+k)
        lease=read(a['writer_lease_ref'],'writer_lease',SC);tool=read(p['native_toolchain_ref'],'native_toolchain_identity',SC)
        credential=read(a['credential_lease_ref'],'credential_lease',SC) if a['credential_lease_ref'] is not None else None
        if credential is not None and (credential['credential_lease_id']!=a['credential_lease_ref'] or credential['repo_id']!=c['repo_id'] or credential['operation_id']!=r['operation_id']):errors.append('recovery_credential_identity')
        selected=source(p['selected_source_ref'],c);current=source(p['current_source_ref'],c)
        if c['scm_backend']!='jujutsu' or c['revision']!=a['expected_revision'] or c['writer_lease_ref']!=a['writer_lease_ref']:errors.append('recovery_context')
        if lease['lease_id']!=a['writer_lease_ref'] or any(lease[k]!=c[k] for k in ('repo_id','workspace_id','scm_backend')):errors.append('recovery_lease_identity')
        if p['preview_id']!=original['preview_ref']:errors.append('recovery_preview_identity')
        for k in ('command_id','command_instance_id','repository_context_ref','expected_revision','writer_lease_ref','file_safe_decision_ref'):
            if p[k]!=a[k]:errors.append('recovery_preview_'+k)
        if p['permission_snapshot_ref']!=a['permission']['permission_snapshot_ref'] or p['confirmation_id']!=a['confirmation']['confirmation_id']:errors.append('recovery_preview_authority')
        if p['snapshot_id']!=a['currentness']['snapshot_id']:errors.append('recovery_preview_snapshot')
        if selected['operation_id']!=a['target']['operation_id'] or current['operation_id']!=a['expected_revision']['operation_id']:errors.append('recovery_selected_operation')
        if p['before']!=current['view']:errors.append('recovery_preview_before')
        if not any(all(w[k]==a['expected_revision'][k] for k in ('workspace_id','change_id','commit_id')) and w['snapshot_id']==a['currentness']['snapshot_id'] for w in current['view']['workspaces']):errors.append('recovery_current_workspace_snapshot')
        if p['selected_parent_operation_id'] is not None and p['selected_parent_operation_id'] not in selected['parent_operation_ids']:errors.append('recovery_parent_not_actual')
        if p['qualification']=='qualified' and a['command_id'].endswith('.undo') and p['selected_parent_operation_id'] is None:errors.append('recovery_undo_parent_unqualified')
        errors+=effects_failures(p['before'],p['proposed'],p['effects'],a['command_id'])
        for k in ('execution_host_id','execution_environment_id'):
            if tool[k]!=a['currentness'][k] or tool[k]!=c['lineage'][k]:errors.append('recovery_toolchain_scope')
        for k in ('adapter_version','certification_catalog_ref','catalog_generation'):
            if tool[k]!=a['currentness'][k]:errors.append('recovery_toolchain_currentness')
        if a['currentness']['expected_operation_id']!=current['operation_id']:errors.append('recovery_current_operation')
        if time(p['issued_at_utc'])>time(a['requested_at_utc']) or any(time(s['read_at_utc'])>time(p['issued_at_utc']) for s in (selected,current)):errors.append('recovery_preview_time')
        if time(qualification['issued_at_utc'])>time(p['issued_at_utc']) or time(tool['recorded_at_utc'])>time(p['issued_at_utc']):errors.append('recovery_qualification_time')
        for k in ('command_id','command_instance_id','repository_context_ref','observable_work_id'):
            if r[k]!=a[k]:errors.append('recovery_result_'+k)
        if r['before_revision']!=a['expected_revision']:errors.append('recovery_before_revision')
        if ('return_context' in a,a.get('return_context'))!=('return_context' in r,r.get('return_context')):errors.append('recovery_return_context')
        if r['outcome']=='accepted':
            if r['receipt_ref'] is not None or output['observation_ref'] is not None:errors.append('recovery_accepted_terminal_evidence')
            w=read(r['observable_work_id'],'ObservableWorkRecord',FULL)
            if w['observable_work_id']!=r['observable_work_id'] or w['identity']['operation_id']!=r['operation_id'] or w['identity']['command_instance_id']!=a['command_instance_id'] or w['result_receipt_ref'] is not None:errors.append('recovery_accepted_work')
            if w['identity']['scope_kind']!='project' or any(w['identity'][k]!=c['lineage'][k] for k in ('project_id','project_home_server_id','execution_host_id','execution_environment_id','source_location_id','topology_generation')):errors.append('recovery_accepted_work_scope')
        else:
            receipt=read(r['receipt_ref'],'operation_receipt',SC)
            if receipt['receipt_id']!=r['receipt_ref']:errors.append('recovery_receipt_identity')
            for k in ('command_instance_id','operation_id','outcome','repository_context_ref','before_revision','after_revision','observable_work_id','event_refs','completed_at_utc'):
                if receipt[k]!=r[k]:errors.append('recovery_receipt_'+k)
            if receipt['scm_backend']!='jujutsu' or receipt['writer_lease_ref']!=a['writer_lease_ref'] or receipt['credential_lease_ref']!=a['credential_lease_ref']:errors.append('recovery_receipt_authority')
            o=read(output['observation_ref'],'observation')
            if o['affected_identities']!=r['affected_identities']:errors.append('recovery_affected_result')
            for k,expected in (('observation_id',output['observation_ref']),('original_request_ref',output['original_request_ref']),('preview_ref',original['preview_ref']),('operation_id',r['operation_id']),('selected_operation_id',selected['operation_id']),('before_source_ref',p['current_source_ref']),('file_safe_decision_ref',a['file_safe_decision_ref'])):
                if o[k]!=expected:errors.append('recovery_observation_'+k)
            called=o['effect_state']!='not_attempted'
            if called and (p['qualification']!='qualified' or not p['complete'] or a['permission']['decision']!='allow' or a['availability']['state']!='available' or not a['availability']['effective'] or a['currentness']['catalog_currentness']!='current' or lease['state']!='active' or not time(lease['acquired_at_utc'])<=time(a['requested_at_utc'])<time(lease['expires_at_utc'])):errors.append('recovery_effect_not_qualified')
            if any(e['disposition']=='unknown' for e in p['effects']) and called:errors.append('recovery_unknown_preview_called')
            if called and credential is not None and (credential['revocation_state']!='active' or not time(credential['issued_at_utc'])<=time(a['requested_at_utc'])<time(credential['expires_at_utc'])):errors.append('recovery_credential_currentness')
            if called and any(any(c['native_state']=='unknown' or any(side['content']['state']=='unknown' for side in c['sides']) for c in view['conflicts']) or any(f['content']['state']=='unknown' for f in view['files']) for view in (selected['view'],p['before'],p['proposed'])):errors.append('recovery_unknown_native_preview')
            unknown=o['completion']=='unknown' or o['effect_state']=='unknown' or any(e['disposition']=='unknown' for e in o['effects']) or (r['error'] or {}).get('effect_state')=='unknown'
            if unknown and r['outcome']!='effect_unknown':errors.append('recovery_unknown_overall')
            if o['completion']=='completed':
                if o['effect_state']!='known_applied' or not o['complete'] or o['native_receipt_ref'] is None or r['outcome']!='succeeded':errors.append('recovery_completion_truth')
            if r['outcome']=='succeeded' and o['completion']!='completed':errors.append('recovery_success_truth')
            if o['completion']=='not_applied' and (o['effect_state'] not in ('not_attempted','known_not_applied') or o['after_source_ref'] is not None or o['effects']):errors.append('recovery_no_effect_truth')
            if o['completion']=='partial' and (r['outcome'] not in ('failed','cancelled','recovery_required','effect_unknown') or o['effect_state'] not in ('known_applied','unknown')):errors.append('recovery_partial_truth')
            if o['after_source_ref'] is not None:
                after=source(o['after_source_ref'],c)
                if after['operation_id']==current['operation_id'] and after['view']!=current['view']:errors.append('recovery_immutable_operation_view')
                if r['after_revision'] is None and not unknown:errors.append('recovery_after_operation')
                elif r['after_revision'] is not None and after['operation_id']!=r['after_revision']['operation_id']:errors.append('recovery_after_operation')
                if after['operation_id']==current['operation_id'] and o['effect_state']=='known_applied':errors.append('recovery_new_operation_missing')
                if r['after_revision'] is not None and not any(all(w[k]==r['after_revision'][k] for k in ('workspace_id','change_id','commit_id')) for w in after['view']['workspaces']):errors.append('recovery_post_workspace_snapshot')
                errors+=effects_failures(p['before'],after['view'],o['effects'],a['command_id'])
                changed={(e['kind'],e['identity']) for e in o['effects'] if e['disposition']!='preserved'}
                before_entries,after_entries=entries(p['before']),entries(after['view'])
                expected={'change_ids':{i for k,i in changed if k=='change'},'bookmark_names':{i for k,i in changed if k=='bookmark'},'workspace_ids':{i for k,i in changed if k=='workspace'},'conflict_refs':{i for k,i in changed if k=='conflict'},'operation_ids':{current['operation_id'],after['operation_id']},'commit_ids':{v['commit_id'] for values in (before_entries,after_entries) for key,v in values.items() if key in changed and key[0]=='change'}}
                if any(set(o['affected_identities'][k])!=v for k,v in expected.items()):errors.append('recovery_actual_affected_identities')
                if o['completion']=='completed' and (after['view']!=p['proposed'] or o['effects']!=p['effects']):errors.append('recovery_actual_proposal')
                if time(after['read_at_utc'])>time(o['observed_at_utc']):errors.append('recovery_post_state_time')
            elif o['completion'] in ('completed','partial'):errors.append('recovery_post_state_missing')
            elif any(o['affected_identities'].values()):errors.append('recovery_unproved_affected_identities')
            elif r['after_revision'] is not None:errors.append('recovery_unproved_after_revision')
            if not time(a['requested_at_utc'])<=time(o['observed_at_utc'])<=time(r['completed_at_utc']):errors.append('recovery_observation_time')
        if time(r['completed_at_utc'])<time(a['requested_at_utc']):errors.append('recovery_result_time')
    except Exception as exc:errors.append('recovery_unresolved:'+str(exc))
    if original_request!=original or result!=output:errors.append('recovery_input_mutated')
    if any(live[k]!=v for k,v in cache.items()):errors.append('recovery_owner_record_mutated')
    return sorted(set(errors))
def fixture_dependencies(value):
    records=deepcopy(value['records'])
    return {'resolve_record':lambda ref:deepcopy(records[ref])}
def recovery_semantic_failures(definition,value):
    return recovery_failures(value['request'],value['result'],**fixture_dependencies(value)) if definition=='fixture_case' else []
