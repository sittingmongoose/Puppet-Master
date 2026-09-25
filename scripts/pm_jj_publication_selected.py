"""Finite original/preview/qualification/remote-outcome value joins.

The resolver supplies authentic owner records. Static matching never authenticates
issuance, native effect admission, Permissions/FileSafe, or remote observations.
No subprocess, force authorization, storage writer, retry or native engine exists.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import json
import os
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT=Path(__file__).resolve().parents[1]
SC='Plans/source_control_contracts.schema.json'
JJ='Plans/jujutsu_integration_contracts.schema.json'
SELF='Plans/jj_publication_selected.schema.json'
FULL='Plans/full_thread_runtime_contracts.schema.json'

@lru_cache(maxsize=None)
def schemas(canon_root):
    root=Path(canon_root)
    docs={SC:json.loads((root/SC).read_text()),JJ:json.loads((root/JJ).read_text()),FULL:json.loads((root/FULL).read_text()),SELF:json.loads((ROOT/SELF).read_text())}
    registry=Registry().with_resources((v['$id'],Resource.from_contents(v)) for v in docs.values())
    return docs,registry

def shape_failures(definition,value,*,owner=SELF,canon_root=None):
    docs,registry=schemas(str(canon_root or os.environ.get('PM_CANON_ROOT',ROOT)))
    return [e.message for e in Draft202012Validator({'$ref':docs[owner]['$id']+'#/$defs/'+definition},registry=registry,format_checker=FormatChecker()).iter_errors(value)]

def _unique(values):
    values=list(values)
    return len(values)==len(set(values))
def _time(s):return datetime.fromisoformat(s.replace('Z','+00:00'))

def publication_failures(original_request,result,*,resolve_record,canon_root=None):
    original,output=deepcopy(original_request),deepcopy(result)
    errors=shape_failures('request',original,canon_root=canon_root)+shape_failures('result',output,canon_root=canon_root)
    cache={};live={}
    def read(ref,definition,owner=SELF):
        if ref not in cache:
            live[ref]=resolve_record(ref)
            cache[ref]=deepcopy(live[ref])
        value=deepcopy(cache[ref])
        failures=shape_failures(definition,value,owner=owner,canon_root=canon_root)
        if failures:raise ValueError('shape:'+definition)
        return value
    if not callable(resolve_record):return ['publication_owner_resolver_missing']
    if errors:return ['publication_input_schema']
    try:
        a=original['authority'];r=output['owner_result'];selection=original['bookmarks']
        if read(output['original_request_ref'],'request')!=original:errors.append('publication_original_request')
        context=read(a['repository_context_ref'],'repository_context',SC)
        remote=read(original['remote_operation_target_ref'],'remote_operation_target',SC)
        qualification=read(original['qualification_ref'],'qualification')
        capability=read(qualification['publication_capability_ref'],'effective_operation_capability',SC)
        toolchain=read(qualification['native_toolchain_ref'],'native_toolchain_identity',SC)
        lease=read(a['writer_lease_ref'],'writer_lease',SC)
        credential=read(a['credential_lease_ref'],'credential_lease',SC)
        receipt=read(r['receipt_ref'],'operation_receipt',SC) if r['receipt_ref'] is not None else None
        if lease['lease_id']!=a['writer_lease_ref']:errors.append('publication_writer_lease_identity')
        if credential['credential_lease_id']!=a['credential_lease_ref']:errors.append('publication_credential_lease_identity')
        if receipt is not None and receipt['receipt_id']!=r['receipt_ref']:errors.append('publication_receipt_identity')
        if context['scm_backend']!='jujutsu' or context['revision']!=a['expected_revision']:errors.append('publication_context_revision')
        if context['writer_lease_ref']!=a['writer_lease_ref']:errors.append('publication_context_lease')
        if remote['repository_id']!=context['repo_id'] or remote['project_id']!=context['lineage']['project_id']:errors.append('publication_remote_repository')
        if a['target']['remote_identity']!=remote['remote_id']:errors.append('publication_selected_remote')
        if original['target_selection_generation']!=remote['selection_snapshot_generation']:errors.append('publication_selection_generation')
        if a['target']['bookmark_name'] is not None and a['target']['bookmark_name'] not in [v['name'] for v in selection]:errors.append('publication_bookmark_anchor')
        if not _unique(v['name'] for v in selection):errors.append('publication_duplicate_bookmark')
        for key in ('repository_context_ref','expected_revision'):
            if qualification[key]!=a[key]:errors.append('publication_qualification_'+key)
        if qualification['snapshot_id']!=a['currentness']['snapshot_id']:errors.append('publication_qualification_snapshot')
        for key in ('execution_host_id','execution_environment_id'):
            if a['currentness'][key]!=context['lineage'][key] or toolchain[key]!=context['lineage'][key]:errors.append('publication_native_'+key)
        for key in ('adapter_version','certification_catalog_ref','catalog_generation'):
            if toolchain[key]!=a['currentness'][key]:errors.append('publication_native_'+key)
        if a['currentness']['expected_operation_id']!=a['expected_revision']['operation_id']:errors.append('publication_expected_operation')
        if qualification['publication_capability_ref'] is None or capability['operation']!='publish':errors.append('publication_capability_kind')
        if capability['repository_context_ref']!=a['repository_context_ref'] or capability['remote_binding_ref']!=remote['remote_id']:errors.append('publication_capability_binding')
        if capability['revision_ref']!=remote['revision_ref']:errors.append('publication_capability_revision')
        for key in ('repo_id','workspace_id','scm_backend'):
            if lease[key]!=context[key]:errors.append('publication_lease_'+key)
        if credential['repo_id']!=context['repo_id'] or credential['operation_id']!=r['operation_id']:errors.append('publication_credential_scope')
        for key in ('command_id','command_instance_id','repository_context_ref','observable_work_id'):
            if r[key]!=a[key]:errors.append('publication_result_'+key)
        if r['before_revision']!=a['expected_revision']:errors.append('publication_before_revision')
        if receipt is None and r['outcome']!='accepted':errors.append('publication_terminal_receipt_missing')
        if receipt is not None:
            for key in ('command_instance_id','operation_id','outcome','repository_context_ref','before_revision','after_revision','observable_work_id','event_refs','completed_at_utc'):
                if receipt[key]!=r[key]:errors.append('publication_receipt_'+key)
            if receipt['scm_backend']!='jujutsu':errors.append('publication_receipt_backend')
            for key in ('writer_lease_ref','credential_lease_ref'):
                if receipt[key]!=a[key]:errors.append('publication_receipt_'+key)
        if ('return_context' in a,a.get('return_context'))!=('return_context' in r,r.get('return_context')):errors.append('publication_return_context')
        if remote['operation_id']!=r['operation_id']:errors.append('publication_remote_operation')
        targets={v['target_id']:v for v in remote['push_targets']}
        outputs={v['target_id']:v for v in output['target_results']}
        qualified={v['target_id']:v for v in qualification['qualified_targets']}
        accepted=r['outcome']=='accepted'
        if (len(targets)!=len(remote['push_targets']) or len(outputs)!=len(output['target_results']) or len(qualified)!=len(qualification['qualified_targets']) or (set(outputs)!=(set() if accepted else set(targets))) or set(targets)!=set(qualified)):
            raise ValueError('publication_target_set')
        if accepted:
            work=read(r['observable_work_id'],'ObservableWorkRecord',FULL)
            if work['observable_work_id']!=r['observable_work_id'] or work['identity']['operation_id']!=r['operation_id']:errors.append('publication_accepted_work')
            if work['identity']['command_instance_id']!=a['command_instance_id'] or work['result_receipt_ref'] is not None:errors.append('publication_accepted_work_origin')
            for key in ('project_id','project_home_server_id','execution_host_id','execution_environment_id','source_location_id','topology_generation'):
                if work['identity'][key]!=context['lineage'][key]:errors.append('publication_work_scope')
        states=[];had_call=False
        for target_id,target in targets.items():
            preview=read(target['preview_ref'],'target_preview')
            for key,expected in (('preview_ref',target['preview_ref']),('command_instance_id',a['command_instance_id']),('operation_id',r['operation_id']),('repository_context_ref',a['repository_context_ref']),('expected_revision',a['expected_revision']),('remote_operation_target_ref',original['remote_operation_target_ref']),('target_selection_generation',original['target_selection_generation']),('target_id',target_id),('push_url',target['push_url']),('refspecs',target['refspecs']),('qualification_ref',original['qualification_ref'])):
                if preview[key]!=expected:errors.append('publication_preview_'+key)
            mappings=preview['mappings']
            if mappings!=qualified[target_id]['mappings']:errors.append('publication_qualified_mappings')
            if [v['bookmark'] for v in mappings]!=selection:errors.append('publication_complete_bookmarks')
            if [v['refspec'] for v in mappings]!=target['refspecs']:errors.append('publication_mapping_refspecs')
            if not _unique(v['destination_ref'] for v in mappings):errors.append('publication_duplicate_destination')
            if any(v['git_object_id']!=v['proposed_head'] for v in mappings):errors.append('publication_proposed_mapping')
            if accepted:continue
            target_result=outputs[target_id]
            observation=read(target_result['observation_ref'],'target_observation')
            reconciliation=read(target_result['reconciliation_ref'],'external_effect_reconciliation',SC)
            for key,expected in (('original_request_ref',output['original_request_ref']),('operation_id',r['operation_id']),('target_id',target_id),('preview_ref',target['preview_ref']),('mappings',mappings)):
                if observation[key]!=expected:errors.append('publication_observation_'+key)
            if reconciliation['operation_id']!=r['operation_id'] or reconciliation['operation_kind']!='push' or reconciliation['intended_target_ref']!=target['preview_ref']:errors.append('publication_reconciliation_target')
            if target['preview_ref'] not in reconciliation['precondition_refs']:errors.append('publication_actual_preconditions')
            for ref in reconciliation['precondition_refs']:
                if ref!=target['preview_ref']:errors.append('publication_untyped_precondition')
            if reconciliation['force_guard']!=preview['force_guard']:errors.append('publication_force_guard')
            if preview['force_guard']['force_requested'] and (preview['force_guard']['expected_head_ref']!=target['preview_ref'] or preview['force_guard']['lease_ref']!=a['writer_lease_ref']):errors.append('publication_force_original_guards')
            if reconciliation['provider_idempotency_supported'] and reconciliation['idempotency_key']!=target['idempotency_key']:errors.append('publication_target_idempotency')
            states.append(observation['outcome'])
            called=observation['effect_state']!='not_attempted';had_call=had_call or called
            if called and any(v['expected_head']['state']=='unknown' for v in mappings):errors.append('publication_unknown_precondition_called')
            if observation['outcome']=='succeeded':
                if observation['effect_state']!='known_applied' or observation['native_receipt_ref'] is None or reconciliation['state']!='observed_success':errors.append('publication_success_evidence')
                expected=[{'destination_ref':v['destination_ref'],'head':{'state':'known','object_id':v['proposed_head']}} for v in mappings]
                if observation['observed_heads']!=expected:errors.append('publication_success_heads')
                if target_result['observation_ref'] not in reconciliation['exact_reconciliation_evidence_refs']:errors.append('publication_reconciliation_evidence')
            elif observation['outcome']=='outcome_unknown' or observation['effect_state']=='unknown':
                if observation['outcome']!='outcome_unknown' or reconciliation['state'] not in ('outcome_unknown','reconciling'):errors.append('publication_unknown_preservation')
            elif observation['effect_state'] not in ('not_attempted','known_not_applied') or reconciliation['state'] not in ('observed_failure','blocked_stale'):errors.append('publication_known_failure_evidence')
            if _time(observation['observed_at_utc'])>_time(r['completed_at_utc']) or _time(observation['observed_at_utc'])<_time(a['requested_at_utc']):errors.append('publication_observation_time')
        if had_call:
            if (a['permission']['decision']!='allow' or a['availability']['state']!='available' or not a['availability']['effective'] or a['currentness']['catalog_currentness']!='current' or capability['support_state']!='supported' or capability['availability']!='ready' or capability['freshness']['state']!='current'):
                errors.append('publication_effect_not_qualified')
            ready_inputs={'product_support':'supported','adapter_implementation':'implemented','instance_version_tier_feature':'configured','credential_scopes':'ready','repository_branch_permissions':'allowed','pm_policy':'allowed','locks_revision':'current','connectivity':'online'}
            if capability['inputs']!=ready_inputs:errors.append('publication_capability_inputs')
            if _time(qualification['recorded_at_utc'])>_time(a['requested_at_utc']) or _time(capability['evaluated_at_utc'])>_time(a['requested_at_utc']):errors.append('publication_qualification_time')
            expiry=capability['freshness']['expires_at_utc']
            if expiry is not None and _time(expiry)<=_time(a['requested_at_utc']):errors.append('publication_capability_expired')
            if lease['state']!='active' or credential['revocation_state']!='active':errors.append('publication_original_lease_state')
            if not (_time(lease['acquired_at_utc'])<=_time(a['requested_at_utc'])<_time(lease['expires_at_utc'])) or not (_time(credential['issued_at_utc'])<=_time(a['requested_at_utc'])<_time(credential['expires_at_utc'])):errors.append('publication_original_lease_time')
        unknown='outcome_unknown' in states or (r['error'] or {}).get('effect_state')=='unknown'
        if unknown and r['outcome']!='effect_unknown':errors.append('publication_unknown_overall')
        if r['outcome']=='succeeded' and any(s!='succeeded' for s in states):errors.append('publication_fanout_not_all_success')
        if states and all(s=='succeeded' for s in states) and r['outcome']!='succeeded':errors.append('publication_completed_result')
        if 'succeeded' in states and len(set(states))>1 and not unknown and r['outcome'] not in ('failed','recovery_required'):errors.append('publication_partial_result')
        if _time(r['completed_at_utc'])<_time(a['requested_at_utc']):errors.append('publication_result_time')
    except Exception as exc:
        errors.append('publication_unresolved:'+str(exc))
    if original_request!=original or result!=output:errors.append('publication_inputs_mutated')
    if any(live[ref]!=value for ref,value in cache.items()):errors.append('publication_owner_record_mutated')
    return sorted(set(errors))

def fixture_dependencies(value):
    """Synthetic record reader only; never a native allow/authority callback."""
    records=deepcopy(value['records'])
    return {'resolve_record':lambda ref:deepcopy(records[ref])}

def publication_semantic_failures(definition,value):
    if definition!='fixture_case':return []
    return publication_failures(value['request'],value['result'],**fixture_dependencies(value))
