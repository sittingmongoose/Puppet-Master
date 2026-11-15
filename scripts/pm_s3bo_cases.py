"""Complete-case positives and independently labelled single-source mutations.

Expected rows/codes come from this witness catalogue, never a checker result.
Each negative is reconstructed from its own named control. Copy witnesses alter
only the presented copy; source/receipt/expected copies remain independent.
"""
import copy
import pm_s3bo_oracles as w


def code(row):
    return w.code_for(row)


def set_path(value, path, replacement):
    for key in path[:-1]:
        value=value[key]
    value[path[-1]]=copy.deepcopy(replacement)


def cases():
    controls=[]; negatives=[]
    def add(control, row, path, replacement, label=None):
        value=copy.deepcopy(control['value'])
        set_path(value,path,replacement)
        negatives.append(dict(id=control['id']+'/'+(label or row),family=value['family'],control=control['id'],
                              target=row,code=code(row),defect={'path':path,'replacement':repr(replacement)[:160]},value=value))
    for family in w.FAMILIES:
        scopes = [None,w.PROJECT] if w.FAMILY[family]['scope_policy']=='application_or_project' else [None]
        for project in scopes:
            value=w.build(family,project)
            control={'id':family+('/project' if value['source']['project_id'] else '/app'),'value':value,'boundary':'append'}
            controls.append(control)
            for subject,schema,row in [('event',w.read_json('Plans/event_record.schema.json'),'envelope_schema'),
                                       ('payload',w.schema_for(family),'payload_schema')]:
                for key in schema.get('required',[]):
                    altered=copy.deepcopy(value)
                    target=altered['event'] if subject=='event' else altered['event']['payload']
                    del target[key]
                    negatives.append(dict(id=control['id']+'/'+subject+'-required-'+key,family=family,
                                          control=control['id'],target=row,code=code(row),
                                          defect={'missing_required':subject+'/'+key},value=altered))
            common={
              'envelope_schema':(('event','extra'),True),
              'payload_schema':(('event','payload','extra'),True),
              'storage_sequence':(('event','sequence_id'),True),
              'physical_value':(('event','actor_ref'),1<<100),
              'producer_jcs':(('event','producer_sequence_id'),(1<<53)+1),
              'source_time':(('event','occurred_at_utc'),'2026-02-30T00:00:00Z'),
              'storage_time':(('event','observed_at_utc'),'2026-11-14T12:00:00+00:00'),
              'ack_time':(('receipt','acknowledged_at_utc'),'2026-02-30T00:00:00Z'),
              'scope_partition':(('scope_partition',),'raw-project-id'),
              'project_join':(('event','project_id'),'another-project' if project or value['source']['project_id'] else None),
              'pending_copy':(('pending_event','actor_ref'),'substituted-actor'),
              'receipt_event':(('receipt','event_id'),'other-event'),
              'receipt_sequence':(('receipt','sequence_id'),42),
              'receipt_full_value':(('full_value_sha256',),'c'*64),
              'history_copy':(('history',),[]),
              'retry_receipt':(('retry_receipt','sequence_id'),42),
              'retry_effects':(('retry_effects',),['second-append']),
              'replay_policy':(('event','replay_policy'),'projector_replay_only'),
              'record_cas':(('cas','actual_revision'),2),
              'stored_token':(('token','redb_snapshot_id'),'stale-stored-snapshot'),
              'live_snapshot':(('live_token','redb_snapshot_id'),'other-snapshot'),
              'token_join':(('token','generation_id'),'other-generation'),
              'source_selection':(('source_selection',),'other-selection'),
              'coverage':(('covered_sequences',),[]),
              'read_permission':(('current_permission',),{}),
              'deletion_fence':(('deleted_subjects',),['thread-A']),
              'sealed_dispatch':(('retained_ref',),'missing-original'),
              'store_snapshot':(('read_store_before',),{}),
              'writer_cutoff':(('writer_cutoff',),41),
              'reader_fence':(('reader_version',),'withdrawn'),
              'dedupe_available':(('dedupe_store',),{}),
              'request_digest':(('retry_request_digest',),'changed-request-digest'),
              'withdrawal_order':(('cutoff_trace',),['drain','cutoff','fence']),
              'passive_reads':(('read_effects',),['append']),
              'receipt_schema':(('receipt','extra'),'not-admitted'),
              'receipt_numbers':(('receipt','segment_generation'),True),
              'token_schema':(('live_token','extra'),True),
            }
            for row,(path,replacement) in common.items():
                # The application case has no source Project. A project swap
                # also violates the envelope's application rule; use only the
                # valid Project-shaped control for the independent join row.
                if row=='project_join' and value['source']['project_id'] is None: continue
                add(control,row,path,replacement)
            case=copy.deepcopy(value)
            case['token']['frontier_revision']=True;case['live_token']['frontier_revision']=True
            negatives.append(dict(id=control['id']+'/token-numbers',family=family,control=control['id'],target='token_numbers',
                                  code=code('token_numbers'),defect={'typed_input':'frontier_revision Boolean, both copies agree'},value=case))
            for row,left,right in [('append_order','record_cas','barrier_append'),('receipt_order','first_receipt','publish')]:
                trace=list(value['trace']);a=trace.index(left);b=trace.index(right);trace[a],trace[b]=trace[b],trace[a]
                add(control,row,('trace',),trace)
            if 'project_id' in w.schema_for(family).get('properties',{}):
                if value['source']['project_id']:
                    add(control,'payload_project',('event','payload','project_id'),'other-project')
            if family in ('storage.deletion_lifecycle_changed','storage.value_quarantine_changed','restore_point.applied','restore_point.corrupt','safe_point.recovery_unavailable'):
                add(control,'event_identity',('event','event_id'),'other-event')
                add(control,'emitter',('emitter',),'reader-trying-to-append')
            if family=='storage.deletion_lifecycle_changed':
                add(control,'deletion_ordinal',('record_history',),[{'state':'failed'}])
                add(control,'deletion_edge',('prior_state',),'purged')
            if family=='storage.value_quarantine_changed':
                record={k:value['source'][k] for k in ('source_family_id','source_locator_ref','raw_sha256')};record['state']='purged'
                add(control,'quarantine_occurrence',('record_history',),[record])
                add(control,'quarantine_edge',('prior_state',),'purged')
            if family=='restore_point.corrupt':
                add(control,'corrupt_terminal',('terminal_commits',),[{'kind':'expiry','point':'source-A'}])
            if family in ('storage.deletion_lifecycle_changed','storage.value_quarantine_changed','restore_point.applied'):
                add(control,'application_key',('event','idempotency_key'),'application@1:bad:bad')
                key={'storage.deletion_lifecycle_changed':'deletion_id','storage.value_quarantine_changed':'quarantine_id','restore_point.applied':'application_id'}[family]
                add(control,'subject_identity',('event','payload',key),'substituted-id')
            if family=='restore_point.applied':
                add(control,'thread_join',('event','thread_id'),'source-thread')
                add(control,'source_preserved',('native_after','point'),'modified-source')
                for key in ('thread','branch','worktree','files','index','queue','safe_points'):
                    add(control,'source_preserved',('native_after',key),'modified-source','source-preserved-'+key)
            for f,row,left,right in [
              ('storage.value_quarantine_changed','raw_order','raw_fsync','record_cas'),
              ('restore_point.applied','materialize_order','reserve_ids','materialize'),
              ('restore_point.corrupt','attest_order','filesafe_attest','record_cas')]:
                if family==f:
                    trace=list(value['trace']);a=trace.index(left);b=trace.index(right);trace[a],trace[b]=trace[b],trace[a]
                    add(control,row,('trace',),trace)
            if family in ('storage.boot_recovery','storage.retention_hold_changed'):
                add(control,'restore_time',('restore','accepted_at'),9)
                add(control,'restore_capability',('restore','capability_identity'),'restored-old-operation')
                add(control,'restore_digest',('restore','capability_digest'),'copied-group-digest')
            if family=='storage.boot_recovery':
                add(control,'restore_epoch',('restore','operation_epoch'),1)
                add(control,'anchor_monotone',('restore','anchor_after'),3)
                add(control,'floor_unavailable',('restore','floor','status'),'complete')
            if family=='storage.recovery_applied':
                add(control,'aftermath_receipt',('aftermath','frontier_after'),40)
                add(control,'aftermath_owner',('aftermath','checkpoint_owner'),'another-owner')
                add(control,'aftermath_generation',('aftermath','generation_after'),'generation-A')
                add(control,'aftermath_restart',('aftermath','restart_effects'),['second-rebuild'])
                # This is the same passive read invariant as passive_reads;
                # keep one real predicate, with a recovery-specific witness.
            if family=='seglog.event_appended':
                for key,row,replacement in [('seq','reference_seq',18),('type','reference_type','other.event'),
                                             ('event_ref','reference_event','other-event'),('segment_ref','reference_segment','other-segment')]:
                    add(control,row,('event','payload',key),replacement)
            if family=='storage.value_quarantine_changed':
                add(control,'quarantine_export',('raw_export_surface',),'routine')
            if family=='platform.capability_evaluated':
                add(control,'platform_marker',('persisted_read_outputs',),{'read-through-marker':'forbidden-stored-copy'})
            if family=='safe_point.recovery_unavailable':
                add(control,'anchor_receipt',('event','payload','receipt_ref'),'resolution-receipt')
                add(control,'run_context',('event','run_id'),'other-run')
                add(control,'node_context',('event','node_id'),'other-node')
            for path,number,schema in w.integers(value['event']['payload'],w.schema_for(family)):
                add(control,'integer_domain',('event','payload')+path,1.5,'integer/'+ '/'.join(map(str,path)))
            for path,text,pattern in w.patterns(value['event']['payload'],w.schema_for(family)):
                if pattern.endswith('$'):
                    add(control,'payload_pattern',('event','payload')+path,text+'\n','LF/'+'/'.join(map(str,path)))
            # Missing, ambiguous, other-original and caller-selected recipe.
            for label,replacement in [('missing',{}),('ambiguous',{'original-A':value['sealed_store']['original-A']*2})]:
                case=copy.deepcopy(value);case['sealed_store']=copy.deepcopy(replacement);case['read_store_before']=copy.deepcopy(replacement)
                negatives.append(dict(id=control['id']+'/retained-'+label,family=family,control=control['id'],target='sealed_dispatch',
                                      code=code('sealed_dispatch'),defect={'sealed_receipt':label},value=case))
            case=copy.deepcopy(value);case['sealed_store']['original-A'][0]['event']['event_id']='other-original';case['read_store_before']=copy.deepcopy(case['sealed_store'])
            negatives.append(dict(id=control['id']+'/retained-other',family=family,control=control['id'],target='sealed_dispatch',code=code('sealed_dispatch'),defect={'sealed_receipt':'other original'},value=case))
            add(control,'sealed_dispatch',('request_recipe',),'caller-selected','retained-override')
    # New custody companions: full owner schemas, not flattened field sets.
    document=w.read_json('Plans/restore_point_application_corruption_contracts.schema.json')
    for definition,family in [('application_commit','restore_point.applied'),('corruption_commit','restore_point.corrupt')]:
        root=dict(document,**{'$ref':'#/$defs/'+definition})
        value=w.sample(root)
        value.update(state='settled',append_receipt_ref='event_append_receipt_custody.v1:'+w.STORE+':'+'a'*64)
        if definition=='application_commit':
            value['reason_code']=None
        else:
            for key in ('referenced_material_field','referenced_material_ref','expected_material_hash','observed_material_hash','expected_material_length','observed_material_length'):
                value['evidence'][key]=None
        control={'id':family+'/companion-settled','value':w.build(family),'boundary':'append'}
        control['value']['auxiliary']={'schema':root,'value':value};controls.append(control)
        for key in document['$defs'][definition]['required']:
            altered=copy.deepcopy(control['value']);del altered['auxiliary']['value'][key]
            negatives.append(dict(id=control['id']+'/missing-'+key,family=family,control=control['id'],target='auxiliary_schema',
                                  code=code('auxiliary_schema'),defect={'missing_required':key},value=altered))
        add(control,'auxiliary_schema',('auxiliary','value','extra'),'raw-body','closed-extra')
        add(control,'auxiliary_pattern',('auxiliary','value','application_id' if definition=='application_commit' else 'corruption_id'),
            value['application_id' if definition=='application_commit' else 'corruption_id']+'\n','anchored-LF')
        time_key='admitted_at_utc' if definition=='application_commit' else 'committed_at_utc'
        add(control,'auxiliary_time',('auxiliary','value',time_key),'2026-11-14t12:00:00+00:00','storage-time-profile')
        if definition=='application_commit':
            # The closed schema's refused and pending branches, independently
            # authored rather than blessing the checker-generated object.
            for state in ('refused','pending'):
                alternate=copy.deepcopy(control);alternate['id']=family+'/companion-'+state
                obj=alternate['value']['auxiliary']['value']
                if state=='refused':
                    obj.update(result='refused',reason_code='permission_denied',reserved_new_thread_id=None,
                               reserved_new_branch_id=None,materialized_at_utc=None,frozen_append_input_sha256=None,
                               event_id=None,append_receipt_ref=None)
                else:
                    obj.update(state='pending',result=None,reason_code=None,materialized_at_utc=None,
                               frozen_append_input_sha256=None,event_id=None,append_receipt_ref=None,terminal_at_utc=None)
                controls.append(alternate)
                add(alternate,'auxiliary_schema',('auxiliary','value','event_id'),'forged-event','forbidden-event-'+state)
    # Platform's complete passive read output uses a real decision fixture.
    root=w.read_json('Plans/platform_capability_decision_read_output.schema.json')
    root=dict(root,**{'$ref':'#/$defs/read_output'})
    decision=next(x['value'] for x in w.read_json('Plans/platform_capability_decision_contract_fixtures.json')['value_shape_cases']
                  if x['valid'] and x['definition']=='decision')
    base=w.build('platform.capability_evaluated')
    marker={'storage_instance_id':w.STORE,'event_id':base['event']['event_id'],'sequence_id':41,
            'source_cursor_sequence_id':41,'coverage_complete':True,'read_token':copy.deepcopy(base['live_token'])}
    output={'schema_id':'pm.storage.platform_capability_decision.read_output.v1','schema_version':'1.0.0',
            'status':'read_through','decision':decision,'read_through_marker':marker,'action_authority':'none'}
    control={'id':'platform.capability_evaluated/read-output','value':base,'boundary':'append'}
    control['value']['auxiliary']={'schema':root,'value':output};controls.append(control)
    add(control,'auxiliary_schema',('auxiliary','value','action_authority'),'dispatch','read-action')
    add(control,'auxiliary_schema',('auxiliary','value','read_through_marker','coverage_complete'),False,'incomplete-marker')
    # A valid purge-pending edge, then a single held-blocker defect. It has no
    # fabricated successful purge or successor-generation proof.
    control={'id':'storage.deletion_lifecycle_changed/purge-pending','value':w.build('storage.deletion_lifecycle_changed'), 'boundary':'append'}
    control['value']['prior_state']='logically_hidden'
    control['value']['event']['payload']['state']='purge_pending'
    controls.append(control)
    add(control,'purge_holds',('event','payload','hold_blockers'),['active-hold'])
    # Carry the already-authored closed value cases through this executable
    # boundary. Their fixture expectations are independent of the checker.
    for filename,family,default_schema in [
      ('platform_capability_decision_contract_fixtures','platform.capability_evaluated','platform_capability_decision_contracts.schema'),
      ('storage_boot_custody_fixtures','storage.boot_recovery',None),
      ('storage_integrity_finding_contract_fixtures','storage.integrity_detected','storage_integrity_finding_contracts.schema')]:
        fixtures=w.read_json('Plans/'+filename+'.json')
        prior_control=None
        for item in fixtures['value_shape_cases']:
            schema_file=default_schema
            if schema_file is None:
                schema_file={'floor':'storage_boot_history_floor.schema','pending':'storage_boot_history_pending.schema',
                             'control':'storage_boot_recovery_control.schema','source':'storage_boot_original_source_contracts.schema'}[item['definition']]
            doc=w.read_json('Plans/'+schema_file+'.json')
            root=dict(doc,**{'$ref':'#/$defs/'+item['definition']}) if default_schema else doc
            value=w.build(family);value['auxiliary']={'schema':root,'value':copy.deepcopy(item['value'])}
            identifier=family+'/'+filename+'/'+item['id']
            if item['valid']:
                prior_control=identifier
                controls.append({'id':identifier,'value':value,'boundary':'append'})
            else:
                target='integer_domain' if filename=='storage_integrity_finding_contract_fixtures' and item['id']=='boolean_offset' else 'auxiliary_schema'
                negatives.append(dict(id=identifier,family=family,control=prior_control,target=target,code=code(target),
                                      defect={'owner_fixture':filename+'/'+item['id']},value=value))
    hold=w.read_json('Plans/storage_retention_hold_contract_fixtures.json')
    hold_schema=w.read_json('Plans/storage_retention_hold_contracts.schema.json')
    prior_control=None
    for item in hold['cases']:
        value=copy.deepcopy(hold['base_values'][item['base']])
        for patch in item['patch']:
            path=[p.replace('~1','/').replace('~0','~') for p in patch['path'].lstrip('/').split('/')]
            if patch['op']=='remove':
                parent=value
                for key in path[:-1]:parent=parent[key]
                del parent[path[-1]]
            else:set_path(value,path,patch['value'])
        root=dict(hold_schema,**{'$ref':'#/$defs/'+item['definition']})
        complete=w.build('storage.retention_hold_changed')
        complete['auxiliary']={'schema':root,'value':value}
        identifier='storage.retention_hold_changed/owner-fixture/'+item['id']
        if item['valid']:
            prior_control=identifier
            controls.append({'id':identifier,'value':complete,'boundary':'append'})
        else:
            negatives.append(dict(id=identifier,family='storage.retention_hold_changed',control=prior_control,
                                  target='auxiliary_schema',code=code('auxiliary_schema'),
                                  defect={'owner_fixture':'storage_retention_hold_contract_fixtures/'+item['id']},value=complete))
    # E8-5 B: deleted thread/Project raw custody is disposed only once the
    # quarantine resolves, and actual hold rows continue protecting it.
    for scope in ('thread','project'):
        for status in ('unresolved','resolved','resolved-held'):
            value=w.build('storage.value_quarantine_changed',w.PROJECT)
            raw={'raw:locator-A':'726177'}
            disposal={'deleted_scope':{'kind':scope,'subject_id':'thread-A' if scope=='thread' else w.PROJECT,
                                       'deletion_record_ref':'deletion-record-A'},
                      'raw_before':copy.deepcopy(raw),'raw_after':copy.deepcopy(raw),'resolution_event':None,
                      'resolution_receipts':{},'hold_records':{},'resolution_transition':None,
                      'resolved_value_bytes_hex':b'corrected'.hex()}
            if status!='unresolved':
                event=copy.deepcopy(value['event']);event['payload']['state']='migrated'
                ids=w.identity(value['family'],value['source'],event['payload'])
                event['event_id']=ids['event_id'];event['idempotency_key']=ids['idempotency_key'];event['sequence_id']=43
                receipt=copy.deepcopy(value['receipt']);receipt.update(event_id=event['event_id'],sequence_id=43)
                disposal['resolution_event']=event
                disposal['resolution_receipts']={event['event_id']:[{'event':copy.deepcopy(event),'receipt':receipt,
                                                                  'full_value_sha256':w.full_value_commitment(event)}]}
                disposal['resolution_transition']={'receipt_ref':'resolution-effect-A','from_state':'secured','to_state':'migrated',
                    'actor_ref':'actor-A','reason':'owner migration completed','input_sha256':value['source']['raw_sha256'],
                    'output_sha256':w.sha(b'corrected'),'event_refs':[event['event_id']],'occurred_at_utc':w.TIME}
                disposal['raw_after']={}
            if status=='resolved-held':
                disposal['hold_records']={'hold-A':{'hold_id':'hold-A','state':'held','source_ref':'raw:locator-A'}}
                disposal['raw_after']=copy.deepcopy(raw)
            value['quarantine_disposal']=disposal
            control={'id':'storage.value_quarantine_changed/E8-5/'+scope+'/'+status,'value':value,'boundary':'append'}
            controls.append(control)
            # A single proposed afterimage changes; all original source and
            # first-receipt custody remains byte-identical to its control.
            add(control,'quarantine_delete_image',('quarantine_disposal','raw_after'),
                raw if status=='resolved' else {},'wrong-purge-afterimage')
            if status=='resolved-held':
                altered=copy.deepcopy(value);altered['quarantine_disposal']['resolution_receipts']={}
                negatives.append(dict(id=control['id']+'/missing-resolution-receipt',family=value['family'],control=control['id'],
                                      target='resolution_receipt_count',code=code('resolution_receipt_count'),
                                      defect={'resolution_receipt':'missing; held bytes still preserved'},value=altered))
                eid=disposal['resolution_event']['event_id']
                receipt_path=('quarantine_disposal','resolution_receipts',eid,0,'receipt')
                for row,path,replacement in [
                  ('resolution_receipt_event',receipt_path+('event_id',),'other-event'),
                  ('resolution_receipt_sequence',receipt_path+('sequence_id',),44),
                  ('resolution_commitment',('quarantine_disposal','resolution_receipts',eid,0,'full_value_sha256'),'c'*64),
                  ('resolution_barrier',receipt_path+('durability_class',),'ordinary'),
                  ('resolution_receipt_schema',receipt_path+('extra',),True),
                  ('resolution_numbers',receipt_path+('segment_generation',),True),
                  ('resolution_time',receipt_path+('acknowledged_at_utc',),'2026-02-30T00:00:00Z'),
                  ('resolution_effect_event',('quarantine_disposal','resolution_transition','event_refs'),['other-event']),
                  ('resolution_effect_state',('quarantine_disposal','resolution_transition','to_state'),'restored'),
                  ('resolution_effect_input',('quarantine_disposal','resolution_transition','input_sha256'),'c'*64),
                  ('resolution_effect_output',('quarantine_disposal','resolution_transition','output_sha256'),'c'*64),
                  ('resolution_effect_time',('quarantine_disposal','resolution_transition','occurred_at_utc'),'2026-02-30T00:00:00Z')]:
                    add(control,row,path,replacement)
                for row,field,replacement in [('resolution_subject','quarantine_id','qtn_other'),
                                               ('resolution_event_id','event_id','other-event'),
                                               ('resolution_key','idempotency_key','other-key'),
                                               ('resolution_state','state','recovery_blocked')]:
                    altered=copy.deepcopy(value);d=altered['quarantine_disposal'];event=d['resolution_event']
                    if field in ('quarantine_id','state'):event['payload'][field]=replacement
                    else:event[field]=replacement
                    if field=='state':
                        ids=w.identity(altered['family'],altered['source'],event['payload'])
                        event['event_id']=ids['event_id'];event['idempotency_key']=ids['idempotency_key']
                    original=next(iter(d['resolution_receipts'].values()))[0]
                    original['event']=copy.deepcopy(event);original['receipt']['event_id']=event['event_id']
                    original['full_value_sha256']=w.full_value_commitment(event)
                    d['resolution_receipts']={event['event_id']:[original]}
                    d['resolution_transition']['event_refs']=[event['event_id']]
                    d['resolution_transition']['to_state']=event['payload']['state']
                    negatives.append(dict(id=control['id']+'/'+row,family=value['family'],control=control['id'],target=row,
                                          code=code(row),defect={'source_field':field,'replacement':replacement,'copies':'rebound'},value=altered))
    # Family-boundary extensions (pm_s3bo_oracles EXTENSION CONTRACT) append
    # their own complete controls and single-defect negatives after the common
    # catalogue, so the common witnesses and their guard selections are stable.
    for ext in w.EXTENSIONS:
        ext_controls,ext_negatives=ext.cases()
        controls+=ext_controls;negatives+=ext_negatives
    return controls,negatives


def negative(control,row,label,value,defect):
    """An independently labelled single-source negative of a named control."""
    return dict(id=control['id']+'/'+label,family=value['family'],control=control['id'],target=row,
                code=code(row),defect=defect,value=value)


def mutate(control,row,path,replacement,label=None):
    """Copy the control and change exactly one path (extension helper)."""
    value=copy.deepcopy(control['value'])
    set_path(value,path,replacement)
    return negative(control,row,label or row,value,{'path':list(path),'replacement':repr(replacement)[:160]})
