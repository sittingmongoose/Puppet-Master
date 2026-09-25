"""Finite publication associations consumed by ACT048; no push or native authority."""
from datetime import datetime
SC='Plans/source_control_contracts.schema.json'
JJ='Plans/jj_publication_selected.schema.json'
JJI='Plans/jujutsu_integration_contracts.schema.json'
def instant(s):return datetime.fromisoformat(s.replace('Z','+00:00'))
def publication_failures(selection,head,read,resolve,digest,proof,verify_approval,verify_owner,forge_original):
    from pm_jj_publication_selected import publication_failures as jj_failures
    errors=[];kind=selection['kind'];a=read(selection['association_ref'],'git_association' if kind=='git' else 'jj_association')
    if a['association_ref']!=selection['association_ref'] or a['kind']!=kind:errors.append('publication_association_identity')
    approval=read(a['approval_ref'],'publication_approval')
    if approval['approval_ref']!=a['approval_ref'] or approval['original_request_ref']!=a['original_request_ref'] or approval['identity']!=a['identity']:errors.append('publication_approval_original')
    if kind=='git':
        op=read(a['original_request_ref'],'operation_request',SC);context=read(op['repository_context_ref'],'repository_context',SC);remote=read(a['remote_operation_target_ref'],'remote_operation_target',SC)
        if op['scm_backend']!='git' or op['command_id']!='cmd.source_control.remote.publish' or context['scm_backend']!='git' or op['expected_revision']!=context['revision']:errors.append('publication_original_git')
        if op.get('observable_work_id') is not None and op['observable_work_id']!=a['work_ref']:errors.append('publication_original_work_reference')
        qualification=read(a['qualification_ref'],'publication_qualification')
        if qualification['qualification_ref']!=a['qualification_ref'] or qualification['original_request_ref']!=a['original_request_ref'] or qualification['repository_context_ref']!=op['repository_context_ref'] or qualification['credential_lease_ref']!=op['credential_lease_ref']:errors.append('publication_qualification_original')
        capability=read(qualification['capability_ref'],'effective_operation_capability',SC);credential=read(op['credential_lease_ref'],'credential_lease',SC);lease=read(op['writer_lease_ref'],'writer_lease',SC);toolchain=read(qualification['native_toolchain_ref'],'native_toolchain_identity',SC)
        if capability['operation']!='publish' or capability['repository_context_ref']!=op['repository_context_ref'] or capability['remote_binding_ref']!=remote['remote_id'] or capability['revision_ref']!=remote['revision_ref']:errors.append('publication_capability_scope')
        if credential['credential_lease_id']!=op['credential_lease_ref'] or credential['operation_id']!=a['identity']['operation_id'] or credential['repo_id']!=context['repo_id']:errors.append('publication_credential_scope')
        if lease['lease_id']!=op['writer_lease_ref'] or context['writer_lease_ref']!=op['writer_lease_ref'] or any(lease[k]!=context[k] for k in ('repo_id','workspace_id','scm_backend')):errors.append('publication_writer_scope')
        if any(toolchain[k]!=context['lineage'][k] for k in ('execution_host_id','execution_environment_id')):errors.append('publication_toolchain_scope')
        if approval['permission_snapshot_ref']!=op['permission_snapshot_ref']:errors.append('publication_approval_permission')
        owner_result=None;receipt=read(a['owner_receipt_ref'],'operation_receipt',SC) if a['owner_receipt_ref'] is not None else None
        targets=remote['push_targets'];previews=[read(t['preview_ref'],'git_preview') for t in targets]
        if len({t['target_id'] for t in targets})!=len(targets):errors.append('publication_duplicate_target')
        results={v['target_id']:v for v in a['target_results']}
        if len(results)!=len(a['target_results']) or set(results)!=(set() if a['status']=='accepted' else {t['target_id'] for t in targets}):errors.append('publication_result_target_set')
        observations=[];length=40 if context['revision']['object_format']=='sha1' else 64
        def oid(v):return isinstance(v,str) and len(v)==length and all(c in '0123456789abcdef' for c in v)
        states=[];had_effect=False
        for target,preview in zip(targets,previews):
            for key,expected in (('preview_ref',target['preview_ref']),('original_request_ref',a['original_request_ref']),('operation_id',a['identity']['operation_id']),('command_instance_id',op['command_instance_id']),('repository_context_ref',op['repository_context_ref']),('expected_revision',op['expected_revision']),('remote_operation_target_ref',a['remote_operation_target_ref']),('target_selection_generation',remote['selection_snapshot_generation']),('target_id',target['target_id']),('push_url',target['push_url']),('refspecs',target['refspecs'])):
                if preview[key]!=expected:errors.append('publication_preview_'+key)
            mappings=preview['mappings']
            if [v['refspec'] for v in mappings]!=target['refspecs'] or len({v['destination_ref'] for v in mappings})!=len(mappings):errors.append('publication_mapping_targets')
            for mapping in mappings:
                if not oid(mapping['source_object']) or mapping['source_object']!=mapping['proposed_head'] or (mapping['expected_head']['state']=='known' and not oid(mapping['expected_head']['object_id'])):errors.append('publication_mapping_object_format')
            if a['status']=='accepted':continue
            entry=results.get(target['target_id'])
            if entry is None:continue
            observed=read(entry['observation_ref'],'git_observation');reconcile=read(entry['reconciliation_ref'],'external_effect_reconciliation',SC);observations.append(observed);states.append(observed['outcome'])
            heads=observed['observed_heads']
            if len({h['destination_ref'] for h in heads})!=len(heads) or any(h['destination_ref'] not in {m['destination_ref'] for m in mappings} or (h['head']['state']=='known' and not oid(h['head']['object_id'])) for h in heads):errors.append('publication_observed_head_scope')
            for k,expected in (('original_request_ref',a['original_request_ref']),('operation_id',a['identity']['operation_id']),('target_id',target['target_id']),('preview_ref',target['preview_ref']),('mappings',mappings)):
                if observed[k]!=expected:errors.append('publication_observation_'+k)
            if reconcile['operation_id']!=a['identity']['operation_id'] or reconcile['operation_kind']!='push' or reconcile['intended_target_ref']!=target['preview_ref'] or reconcile['precondition_refs']!=[target['preview_ref']]:errors.append('publication_reconciliation_scope')
            if reconcile['force_guard']!=preview['force_guard']:errors.append('publication_force_guard')
            if reconcile['provider_idempotency_supported'] and reconcile['idempotency_key']!=target['idempotency_key']:errors.append('publication_idempotency')
            if preview['force_guard']['force_requested'] and (preview['force_guard']['expected_head_ref']!=target['preview_ref'] or preview['force_guard']['lease_ref']!=op['writer_lease_ref'] or preview['force_guard']['dangerous_action_policy_ref'] is None):errors.append('publication_force_original')
            called=observed['effect_state']!='not_attempted';had_effect|=called
            if called and any(v['expected_head']['state']=='unknown' for v in mappings):errors.append('publication_unknown_precondition')
            if observed['outcome']=='succeeded':
                expected=[{'destination_ref':v['destination_ref'],'head':{'state':'known','object_id':v['proposed_head']}} for v in mappings]
                if observed['effect_state']!='known_applied' or observed['native_receipt_ref'] is None or observed['observed_heads']!=expected or reconcile['state']!='observed_success' or entry['observation_ref'] not in reconcile['exact_reconciliation_evidence_refs']:errors.append('publication_success_evidence')
            elif observed['effect_state']=='unknown' or observed['outcome']=='outcome_unknown':
                if observed['effect_state']!='unknown' or observed['outcome']!='outcome_unknown' or reconcile['state'] not in ('outcome_unknown','reconciling'):errors.append('publication_unknown_truth')
            elif observed['effect_state']=='known_applied':
                if observed['native_receipt_ref'] is None or reconcile['state'] not in ('observed_success','observed_failure'):errors.append('publication_partial_applied_evidence')
            elif observed['effect_state'] not in ('not_attempted','known_not_applied') or reconcile['state'] not in ('observed_failure','blocked_stale'):errors.append('publication_failure_truth')
            if receipt is not None and not instant(op['requested_at_utc'])<=instant(observed['observed_at_utc'])<=instant(receipt['completed_at_utc']):errors.append('publication_observation_time')
        if a['status']=='accepted':
            if receipt is not None or a['work_ref'] is None:errors.append('publication_accepted_work')
        elif receipt is None:errors.append('publication_terminal_receipt')
        if receipt is not None:
            for key,expected in (('receipt_id',a['owner_receipt_ref']),('operation_id',a['identity']['operation_id']),('command_instance_id',op['command_instance_id']),('repository_context_ref',op['repository_context_ref']),('scm_backend','git'),('before_revision',op['expected_revision']),('writer_lease_ref',op['writer_lease_ref']),('credential_lease_ref',op['credential_lease_ref']),('observable_work_id',a['work_ref'])):
                if receipt[key]!=expected:errors.append('publication_receipt_'+key)
            expected='effect_unknown' if a['status']=='unknown' else a['status']
            if receipt['outcome']!=expected:errors.append('publication_receipt_status')
            if receipt['after_revision'] is not None and receipt['after_revision']['object_format']!=context['revision']['object_format']:errors.append('publication_receipt_object_format')
        if a['status']=='succeeded' and (not states or any(v!='succeeded' for v in states)):errors.append('publication_false_complete')
        if 'outcome_unknown' in states and a['status']!='unknown':errors.append('publication_unknown_overall')
        if a['work_ref'] is not None:
            work=read(a['work_ref'],'ObservableWorkRecord','Plans/full_thread_runtime_contracts.schema.json')
            if work['observable_work_id']!=a['work_ref'] or work['identity']!=a['identity']:errors.append('publication_work_original')
            if a['status']=='accepted' and (work['work_state'] in ('completed','failed','cancelled','recovery-required') or work['result_receipt_ref'] is not None):errors.append('publication_accepted_terminal_work')
        if had_effect:
            if capability['support_state']!='supported' or capability['availability']!='ready' or capability['freshness']['state']!='current' or lease['state']!='active' or credential['revocation_state']!='active':errors.append('publication_original_admission_state')
            if not instant(lease['acquired_at_utc'])<=instant(op['requested_at_utc'])<instant(lease['expires_at_utc']) or not instant(credential['issued_at_utc'])<=instant(op['requested_at_utc'])<instant(credential['expires_at_utc']):errors.append('publication_original_lease_time')
    else:
        request=read(a['original_request_ref'],'request',JJ);owner_result=read(a['owner_result_ref'],'result',JJ);errors+=jj_failures(request,owner_result,resolve_record=resolve)
        op=request['authority'];context=read(op['repository_context_ref'],'repository_context',SC);remote=read(request['remote_operation_target_ref'],'remote_operation_target',SC)
        dispatch=read(a['original_dispatch_ref'],'dispatch_binding','Plans/sir_jj_publication_dispatch.schema.json')
        if dispatch['identity']!=a['identity'] or dispatch['arguments']!=request or dispatch['request_ref']!=a['original_request_ref'] or dispatch['return_context']!=a['return_context']:errors.append('publication_jj_original_dispatch')
        if dispatch['payload_sha256']!=digest(request):errors.append('publication_jj_original_payload')
        if dispatch['idempotency_key']!=op['idempotency_key']:errors.append('publication_jj_original_idempotency')
        if dispatch['permission_snapshot_ref']!=op['permission']['permission_snapshot_ref']:errors.append('publication_jj_original_permission')
        if not instant(op['requested_at_utc'])<=instant(dispatch['accepted_at_utc'])<=instant(owner_result['owner_result']['completed_at_utc']):errors.append('publication_jj_original_admission_time')
        if approval['confirmation']!=op['confirmation'] or approval['permission_snapshot_ref']!=op['permission']['permission_snapshot_ref']:errors.append('publication_jj_actual_approval')
        previews=[read(t['preview_ref'],'target_preview',JJ) for t in remote['push_targets']];observations=[read(t['observation_ref'],'target_observation',JJ) for t in owner_result['target_results']]
        receipt=read(owner_result['owner_result']['receipt_ref'],'operation_receipt',SC) if owner_result['owner_result']['receipt_ref'] is not None else None
    if a['identity']['operation_id']!=remote['operation_id'] or a['identity']['command_instance_id']!=op['command_instance_id']:errors.append('publication_original_identity')
    if remote['repository_id']!=context['repo_id'] or remote['project_id']!=context['lineage']['project_id']:errors.append('publication_source_repository')
    for k in ('project_id','project_home_server_id','execution_host_id','execution_environment_id','source_location_id','topology_generation'):
        if a['identity'].get(k)!=context['lineage'][k]:errors.append('publication_identity_'+k)
    for source,target in (('plan_id','named_plan_id'),('goal_id','goal_id')):
        if a['identity'].get(target)!=context['lineage'].get(source):errors.append('publication_identity_'+target)
    if approval['approval_target_ref'] not in (p['preview_ref'] for p in previews) and approval['approval_target_ref']!=(a.get('remote_operation_target_ref') or request['remote_operation_target_ref']):errors.append('publication_approval_target')
    if set(approval['preview_refs'])!={p['preview_ref'] for p in previews}:errors.append('publication_approval_previews')
    values={'original_request_ref':a['original_request_ref'],'identity':a['identity'],'remote_target':remote,'previews':previews}
    if approval['reviewed_values_sha256']!=digest(values) or approval['confirmation']['target_binding_sha256']!=approval['reviewed_values_sha256']:errors.append('publication_approval_digest')
    if approval['effective_account_binding']!=remote['account_id']:errors.append('publication_approval_account')
    if instant(approval['confirmation']['confirmed_at_utc'])>instant(op['requested_at_utc']):errors.append('publication_approval_time')
    matches=[p for p in previews if p['target_id']==selection['target_id']]
    if len(matches)!=1:errors.append('publication_selected_target')
    else:
        mapping=[m for m in matches[0]['mappings'] if m['destination_ref']==selection['destination_ref']]
        if len(mapping)!=1 or mapping[0]['destination_ref']!=head['ref'] or mapping[0]['proposed_head']!=head['object_id']:errors.append('publication_review_head')
    proof('publication_approval',verify_approval,forge_original,a,approval,values)
    proof('publication_owner',verify_owner,forge_original,selection,head,a,context,remote,previews,observations,owner_result,receipt)
    return errors,{'association':a,'approval':approval,'previews':previews,'observations':observations}
