#!/usr/bin/env python3
"""DM guard-removal witnesses. Mutants live in memory; production guards stay intact.

Each probe starts from a passing input and changes one semantic fact. Observation
copies (not independent facts) change together. The ordinary full checker runs the
same witnesses. This audit removes each named enforcement rule, tests the entire
witness matrix, and calls the full checker to prove that the mutant is caught.
"""
import contextlib
import ast
import copy
import hashlib
import importlib.util
import io
import json
import re
from pathlib import Path
import sys
from types import SimpleNamespace
from jsonschema import SchemaError

ROOT = Path(__file__).resolve().parents[1]
SUBJECT = ROOT / 'scripts/pm-small-owner-events.py'


def load(source=None, schema_edits=()):
    spec = importlib.util.spec_from_file_location('dm_guard_subject', SUBJECT)
    module = importlib.util.module_from_spec(spec)
    exec(compile(SUBJECT.read_text() if source is None else source, str(SUBJECT), 'exec'), module.__dict__)
    if schema_edits:
        def loads(text, *args, **kwargs):
            value=json.loads(text,*args,**kwargs)
            for edit in schema_edits:
                if isinstance(value,dict) and value.get('$id')==edit['schema_id']:
                    target=value
                    for key in edit['path'][:-1]:target=target[key]
                    if edit.get('action')=='set':
                        target[edit['path'][-1]]=edit['value']
                    else:
                        del target[edit['path'][-1]]
            return value
        module.json=SimpleNamespace(loads=loads,dumps=json.dumps)
    return module


def catalogue(m, fixtures):
    probes, mutants = [], {}

    def add(guard, label, fn, positive, negative, edits, accept=bool):
        edits = tuple(edits)
        if guard in mutants:
            assert mutants[guard] == edits, guard
        mutants[guard] = edits
        probes.append(dict(id=guard+'|'+label, guard=guard, label=label, function=fn, positive=positive,
                           negative=negative, accept=accept))

    def change(value, path, new):
        result = copy.copy(value)
        target = result
        for k in path[:-1]:
            target[k] = copy.copy(target[k])
            target = target[k]
        target[path[-1]] = copy.deepcopy(new)
        return result

    def no_if(expression):
        return [('if ' + expression + ':', 'if False:')]

    for row in m.families_for_run(fixtures):
        family = row['event_type']
        e, o, a = (copy.deepcopy(row[k]) for k in ('positive_event_record', 'original_operation', 'receipt_authority'))
        vp = (row, e, o)
        envelope=json.loads((ROOT/'Plans/event_record.schema.json').read_text())
        for field in envelope['required']:
            bad=dict(e);del bad[field]
            add('envelope.schema',family+':envelope_required_'+field,'envelope_valid',(e,),(bad,),[("return DMValidator(envelope, format_checker=FORMATS).is_valid(event)",'return True')])
        for field,value in [('schema_version','9.0.0'),('schema_id','pm.foreign'),('unexpected','secret')]:
            add('envelope.schema',family+':envelope_shape_'+field,'envelope_valid',(e,),(dict(e,**{field:value}),),[("return DMValidator(envelope, format_checker=FORMATS).is_valid(event)",'return True')])
        custody=a['stored_custody']
        cs=json.loads((ROOT/'Plans/event_append_receipt_contracts.schema.json').read_text())['$defs']['custody_v2']
        for field in cs['required']:
            bad=dict(custody);del bad[field]
            add('custody.schema',family+':custody_required_'+field,'custody_valid',(custody,),(bad,),[("return DMValidator(dict(schema, **{'$ref': '#/$defs/custody_v2'}), format_checker=FORMATS).is_valid(custody)",'return True')])
        for field,value in [('schema_version','1.0.0'),('schema_id','pm.foreign'),('unexpected','secret')]:
            add('custody.schema',family+':custody_shape_'+field,'custody_valid',(custody,),(dict(custody,**{field:value}),),[("return DMValidator(dict(schema, **{'$ref': '#/$defs/custody_v2'}), format_checker=FORMATS).is_valid(custody)",'return True')])

        def writer(guard, label, event=None, original=None, expression=None, edits=None):
            add(guard, family + ':' + label, 'valid_event', vp,
                (row, e if event is None else event, o if original is None else original),
                edits if edits is not None else no_if(expression))

        writer('writer.owner', 'foreign_owner', original=dict(o, owner='foreign'), expression="original.get('owner') != owner or original.get('operation_id') != payload['operation_id']")
        orig=dict(o,operation_id='op:foreign',result_operation_id='op:foreign')
        bad=dict(e,idempotency_key=m.application_key(o['server_id'],'op:foreign')) if e['scope_kind']=='application' else e
        writer('writer.owner', 'foreign_operation',event=bad,original=orig,expression="original.get('owner') != owner or original.get('operation_id') != payload['operation_id']")
        writer('writer.result', 'foreign_result_operation', original=dict(o, result_operation_id='op:foreign'), expression="original.get('result_operation_id') != original['operation_id'] or not exact_value(original.get('result_payload'), payload)")
        writer('writer.result', 'foreign_result_payload', original=dict(o,result_payload={}),expression="original.get('result_operation_id') != original['operation_id'] or not exact_value(original.get('result_payload'), payload)")
        for field in m.ORIGINAL_JOINS:
            joins=copy.deepcopy(o['envelope_joins']);joins[field]='foreign'
            writer('writer.original_joins', 'original_join_'+field, original=dict(o,envelope_joins=joins), expression="type(original.get('envelope_joins')) is not dict or set(original['envelope_joins']) != set(ORIGINAL_JOINS) or any(not exact_value(original['envelope_joins'][k], event[k]) for k in ORIGINAL_JOINS)")
        # Envelope/project join: keep owner-result and all lineage observations valid.
        project=next((v for v in row['scope_variants'] if v['event']['scope_kind']=='project'),dict(event=e,original_operation=o))
        project_e,project_o=project['event'],project['original_operation']
        bad=copy.deepcopy(project_e);bad['project_id']='project:foreign'
        orig=copy.deepcopy(project_o);orig['envelope_joins']['project_id']=bad['project_id']
        add('writer.payload_project',family+':payload_project_join','valid_event',(row,project_e,project_o),(row,bad,orig),no_if("event['project_id'] != payload['project_id']"))
        writer('writer.time', 'original_completion_time', original=dict(o, completed_at_utc='2026-11-04T12:01:00Z'), expression="event['occurred_at_utc'] != payload[time_field] or event['occurred_at_utc'] != original['completed_at_utc']")
        for field,value in [('event_type','foreign.family'),('payload_schema_id','pm.payload.foreign')]:
            writer('writer.family_schema',field,event=dict(e,**{field:value}),expression="event['event_type'] != row['event_type'] or event['payload_schema_id'] != payload_schema['$id']")
        for field,value in [('redaction_profile','redacted'),('replay_policy','projector_replay_only')]:
            writer('writer.profile_policy',field,event=dict(e,**{field:value}),expression="event['redaction_profile'] != profile or event['replay_policy'] != 'dedupe_by_idempotency_key'")
        for field,value in [('event_id','evt_foreign'),('idempotency_key','foreign')]:
            writer('writer.identity_key',field,event=dict(e,**{field:value}),expression="event['event_id'] != 'evt_' + identity or event['idempotency_key'] != key")
        mig=copy.deepcopy(e);mig['migration']['migration_id']='foreign'
        writer('writer.migration','migration',event=mig,expression="any(v is not None for v in event['migration'].values())")
        if e['scope_kind']=='application':
            orig=dict(o,server_id='');bad=dict(e,idempotency_key=m.application_key('',o['operation_id']))
            writer('writer.server_identity','empty_server',event=bad,original=orig,expression="not isinstance(server_id, str) or not server_id")
        if family.startswith('subagent.'):
            bad=dict(e,run_id='run:foreign');orig=copy.deepcopy(o);orig['envelope_joins']['run_id']=bad['run_id']
            writer('writer.child_run','child_run',event=bad,original=orig,expression="row['event_type'].startswith('subagent.') and event['run_id'] != payload['run_id']")
        for c in row['producer_witness_negatives']:
            add('producer.witness',family+':'+c['case_id'],'producer_witness_allowed',
                (family,row['producer_witness_positive']),(family,c['witness']),
                [('return exact_value(witness, required)','return True')])
        payload=row['positive_payload']
        if row['scope_policy']=='project_only':
            add('semantic.project',family+':real_project','semantic',(payload,row['scope_policy'],family),
                (dict(payload,project_id=None),row['scope_policy'],family),no_if("scope == 'project_only' and (type(payload['project_id']) is not str or not payload['project_id'])"))
        if 'after_revision' in payload:
            add('semantic.revision',family+':revision_successor','semantic',(payload,row['scope_policy'],family),
                (dict(payload,after_revision=payload['before_revision']),row['scope_policy'],family),no_if("'after_revision' in payload and (not integer_type(None, payload['after_revision']) or not integer_type(None, payload['before_revision']) or payload['after_revision'] != payload['before_revision'] + 1)"))
        if family=='lsp.server.lifecycle_changed':
            add('semantic.edge',family+':lifecycle_edge','semantic',(payload,row['scope_policy'],family),
                (dict(payload,state=payload['previous_state']),row['scope_policy'],family),no_if("event == 'lsp.server.lifecycle_changed' and payload['previous_state'] == payload['state']"))
        add('retry.semantic_conflict',family+':changed_digest','replay_decision',('a','a','ref:original'),('a','b','ref:original'),no_if('type(original_digest) is not str or type(retry_digest) is not str or type(original_receipt) is not str or original_digest != retry_digest'),lambda x:x[0]=='return_original_without_effect')
        hist=row['historical_reader_only']
        add('append.replay_policy',family+':append_policy','append_policy_refusal',(e,),(hist['stored_event'],),
            [("return 'replay_only_not_appendable' if event.get('replay_policy') == 'projector_replay_only' else None",'return None')],lambda x:x is None)
        add('retry.replay_only',family+':replay_only','current_retry',(row,e,a),(row,hist['stored_event'],hist),
            no_if('append_policy_refusal(incoming) is not None')+no_if("incoming.get('replay_policy') != 'dedupe_by_idempotency_key'"),lambda x:x[0]=='return_original_without_effect')
        unknown=dict(e,replay_policy='append_once')
        auth=copy.deepcopy(a);auth['stored_event']=copy.deepcopy(unknown)
        # Replay policy is not producer semantic data; retained authority remains
        # the original. Only the current policy check refuses this retry.
        add('retry.current_policy',family+':unknown_retry_policy','current_retry',(row,e,a),(row,unknown,a),no_if("incoming.get('replay_policy') != 'dedupe_by_idempotency_key'"),lambda x:x[0]=='return_original_without_effect')
        retry_family_edits = no_if("incoming.get('event_type') != row['event_type']")
        retry_schema_edits = no_if("incoming.get('payload_schema_id') != expected_schema")
        mutants['retry.family_schema_duplicate'] = tuple(retry_family_edits + retry_schema_edits)
        for field, value, guard, edits in (
            ('event_type', 'foreign.family', 'retry.family', retry_family_edits),
            ('payload_schema_id', 'pm.payload.foreign', 'retry.schema', retry_schema_edits),
        ):
            # One changed family/schema fact, with every derived identity and
            # protected observation recomputed. No stale digest can mask it.
            bad_event = dict(e, **{field: value})
            if field == 'event_type':
                bad_event['event_id'] = 'evt_' + m.digest(value, a['storage_instance_id'], row['positive_payload'])
                if e['scope_kind'] == 'project':
                    bad_event['idempotency_key'] = value + ':' + bad_event['event_id'][4:]
            bad = copy.deepcopy(a)
            bad['stored_event'] = bad_event
            custody = bad['stored_custody']
            for key in ('event_id', 'event_type', 'idempotency_key'):
                custody[key] = bad_event[key]
            custody['producer_semantic_digest'] = m.producer_digest(bad_event)
            custody['original_event_value_commitment']['sha256'] = hashlib.sha256(m.full_value_preimage(bad_event)).hexdigest()
            custody['first_append_receipt']['event_id'] = bad_event['event_id']
            bad['first_append_receipt']['event_id'] = bad_event['event_id']
            bad['original_append_result']['event_id'] = bad_event['event_id']
            add(guard, family + ':retry_' + field, 'current_retry', (row,e,a), (row,bad_event,bad), edits,
                lambda x:x[0]=='return_original_without_effect')
        for case in row.get('foreign_family_retry_cases', []):
            if not (case['foreign_event'] and case['foreign_authority']):
                continue
            foreign = next(r for r in fixtures['families'] if r['event_type'] == case['source_family'])
            # Both exact fences intentionally reject an authentic foreign
            # family/schema pair. Remove that named duplicate set together.
            add('retry.family_schema_duplicate', family + ':' + case['case_id'], 'current_retry',
                (row,e,a), (row,foreign['positive_event_record'],foreign['receipt_authority']),
                retry_family_edits + retry_schema_edits, lambda x:x[0]=='return_original_without_effect')
        for field in ['sequence_id','observed_at_utc','persisted_at_utc']:
            value=e[field]+1 if field=='sequence_id' else '2026-11-04T12:01:00Z'
            add('receipt.full_value',family+':forged_'+field,'resolve_full_value',(row,e,a),(row,dict(e,**{field:value}),a),
                no_if("commitment['sha256'] != hashlib.sha256(requested_preimage).hexdigest() or commitment['sha256'] != hashlib.sha256(stored_preimage).hexdigest()"))
        add('receipt.protected_authority',family+':unprotected_original','resolve_original',(row,e,a),(row,e,dict(a,protected_authority_current=False)),
            [(" or authority['protected_authority_current'] is not True",'')])
        fields=['event_id','scope_partition','event_type','idempotency_key','producer_semantic_digest','storage_instance_id']
        for field in fields:
            value='f'*64 if field=='producer_semantic_digest' else 'foreign'
            bad=change(a,['stored_custody',field],value)
            add('receipt.custody_identity',family+':custody_'+field,'resolve_original',(row,e,a),(row,e,bad),no_if("expected_identity != actual_identity or custody['storage_instance_id'] != authority['storage_instance_id']"))
        add('receipt.incoming_semantics',family+':incoming_actor','resolve_original',(row,e,a),(row,dict(e,actor_ref='ref:foreign'),a),
            no_if("incoming['event_id'] != stored['event_id'] or incoming['event_type'] != stored['event_type'] or incoming['idempotency_key'] != stored['idempotency_key'] or retained_producer_digest(incoming) != retained_producer_digest(stored)"))
        for field in ['event_id','sequence_id','segment_ref','byte_offset']:
            value=a['original_append_result'][field];value=value+1 if isinstance(value,int) else value+':foreign'
            bad=change(a,['original_append_result',field],value)
            add('receipt.append_result',family+':result_'+field,'resolve_original',(row,e,a),(row,e,bad),no_if("not exact_value(result, {'event_id': stored['event_id'], 'sequence_id': stored['sequence_id'], 'segment_ref': custody['original_segment_ref'], 'byte_offset': receipt['byte_offset']})"))
        for field in ['event_id','sequence_id']:
            value=a['first_append_receipt'][field];value=value+1 if isinstance(value,int) else value+':foreign'
            bad=change(a,['stored_custody','first_append_receipt',field],value)
            bad=change(bad,['first_append_receipt',field],value)
            # Result observation follows the receipt when testing its join to
            # the stored event; byte_offset is unchanged in this probe.
            add('receipt.event_join',family+':receipt_event_'+field,'resolve_original',(row,e,a),(row,e,bad),no_if("receipt['event_id'] != stored['event_id'] or receipt['sequence_id'] != stored['sequence_id']"))
        for field in a['first_append_receipt']:
            value=a['first_append_receipt'][field];value=value+1 if isinstance(value,int) else value+':foreign'
            bad=change(a,['first_append_receipt',field],value)
            add('receipt.original_receipt',family+':original_receipt_'+field,'resolve_original',(row,e,a),(row,e,bad),no_if("not exact_value(authority['first_append_receipt'], receipt)"))
        pub=row['publication_positive']
        bad=change(pub,['event','actor_ref'],'ref:foreign')
        add('append.current_event',family+':append_original_event','publication',(row,pub),(row,bad),no_if("not valid_event(row, state['event'], state['original_operation'])"),lambda x:x['durable_events']==1)
        for field,edits in [
            ('receipt_delivery',[("if state['receipt_delivery']:",'if True:')]),
            ('terminal_delivery',[("outcome['terminal'] = state['terminal_delivery']","outcome['terminal'] = True")]),
        ]:
            add('append.'+field,family+':'+field,'publication',(row,pub),(row,dict(pub,**{field:False})),edits,lambda x:x['terminal'])
        for gate in m.ADMISSION_GATES:
            add('append.'+gate,family+':cut_'+gate,'publication',(row,pub),(row,dict(pub,**{gate:False})),
                [('state[k] is True for k in ADMISSION_GATES',f"state[k] is True for k in ADMISSION_GATES if k != {gate!r}")],lambda x:x['durable_events']==1)
        for field in ['admission_epoch','current_admission_epoch']:
            add('append.epoch',family+':'+field,'publication',(row,pub),(row,dict(pub,**{field:2})),no_if("not all(integer_type(None, v) for v in (state['admission_epoch'], original['accepted_admission_epoch'], state['current_admission_epoch'])) or state['admission_epoch'] != original['accepted_admission_epoch'] or original['accepted_admission_epoch'] != state['current_admission_epoch']"),lambda x:x['durable_events']==1)
        for field in ['current_owner_session_id','current_restore_occurrence_id']:
            add('append.session_restore',family+':'+field,'publication',(row,pub),(row,dict(pub,**{field:'foreign'})),no_if("type(original['accepted_session_id']) is not str or type(original['restore_occurrence_id']) is not str or not exact_value(state['current_owner_session_id'], original['accepted_session_id']) or not exact_value(state['current_restore_occurrence_id'], original['restore_occurrence_id'])"),lambda x:x['durable_events']==1)
        for field in ['frame_written','group_synced']:
            add('append.durability',family+':'+field,'publication',(row,pub),(row,dict(pub,**{field:False})),no_if("state['frame_written'] is not True or state['group_synced'] is not True"),lambda x:x['durable_events']==1)
        bad=change(pub,['first_append_receipt','sequence_id'],42)
        add('append.receipt_delivery_identity',family+':delivered_receipt','publication',(row,pub),(row,bad),no_if("replay is None or not exact_value(state['first_append_receipt'], replay[1])"),lambda x:x['terminal'])
        read=row['reader_positive']
        for c in row['reader_cases']:
            if c['case_id'].startswith('forged_storage_'):
                bad=m.patched(dict(copy.deepcopy(read),**copy.deepcopy(c.get('overrides',{}))),c.get('patches',[]))
                add('reader.retained_value',family+':operating_'+c['case_id'],'reader_result',(row,read),(row,bad),
                    [("and retained_event_valid(row, state['event'], state['retained_authority'], state['live_token'])",'and True')],lambda x:x=='available')
            if c['case_id'].startswith('reader_equally_foreign_'):
                bad=m.patched(dict(copy.deepcopy(read),**copy.deepcopy(c.get('overrides',{}))),c.get('patches',[]))
                add('reader.token_identity',family+':operating_'+c['case_id'],'reader_result',(row,read),(row,bad),
                    [("and token_matches_original(state['live_token'], state['retained_authority'])",'and True')],lambda x:x=='available')
        for field in ['reader_enabled','permission_current','source_present','deletion_clear','hold_allows_disclosure','current_frontier_verified','version']:
            old="state['version'] == '1.0.0'" if field=='version' else 'state['+repr(field)+'] is True'
            edits=[('and '+old,'and True')] if field!='reader_enabled' else [("state['reader_enabled'] is True and state['permission_current'] is True","True and state['permission_current'] is True")]
            # Restrict first occurrence for reader gates below in source edits.
            add('reader.'+field,family+':reader_'+field,'reader_result',(row,read),(row,dict(read,**{field:'2.0.0' if field=='version' else False})),edits,lambda x:x=='available')
        bad=change(read,['selected_token','redb_snapshot_id'],'snapshot:stale')
        add('reader.selected_token',family+':selected_snapshot','reader_result',(row,read),(row,bad),[("exact_value(state['selected_token'], state['live_token'])",'True')],lambda x:x=='available')
        rebuild=row['rebuild_positive']
        for c in row['rebuild_cases']:
            if c['case_id'].startswith('forged_storage_') or c['case_id'] in (
                'checkpoint_foreign_storage_instance','checkpoint_foreign_source_storage',
                'checkpoint_foreign_key','checkpoint_unselected_frontier',
                'checkpoint_outer_frontier_mismatch','checkpoint_unselected_source',
                'checkpoint_dataset_generation_mismatch','checkpoint_foreign_storage_coherent',
            ):
                bad=m.patched(dict(copy.deepcopy(rebuild),**copy.deepcopy(c.get('overrides',{}))),c.get('patches',[]))
                is_checkpoint=c['case_id'].startswith('checkpoint_')
                guard='rebuild.checkpoint' if is_checkpoint else 'rebuild.retained_value'
                edits=no_if('not checkpoint_matches_original(state)') if is_checkpoint else [("not retained_event_valid(row, state['event'], state['retained_authority'], state['selected_live_token'])",'False')]
                add(guard,family+':operating_'+c['case_id'],'rebuild_publication',(row,rebuild),(row,bad),edits,lambda x,old=rebuild['old_publication']:x!=old)
        for gate in m.REBUILD_GATES:
            add('rebuild.'+gate,family+':rebuild_'+gate,'rebuild_publication',(row,rebuild),(row,dict(rebuild,**{gate:False})),
                [('state[k] is True for k in REBUILD_GATES',f"state[k] is True for k in REBUILD_GATES if k != {gate!r}")],lambda x:x!=rebuild['old_publication'])
        add('rebuild.version',family+':rebuild_version','rebuild_publication',(row,rebuild),(row,dict(rebuild,version='2.0.0')),
            [("state['version'] != '1.0.0' or ",'')],lambda x:x!=rebuild['old_publication'])
        bad=change(rebuild,['new_checkpoint','frontier_revision'],2)
        add('checkpoint.outer_revision',family+':outer_revision','checkpoint_matches_original',(rebuild,),(bad,),[("exact_value(checkpoint.get('frontier_revision'), token['frontier_revision'])",'True')])
        bad=change(rebuild,['new_checkpoint','durable_read_token','frontier_sha256'],'d'*64)
        add('checkpoint.selected_token',family+':checkpoint_selected','checkpoint_matches_original',(rebuild,),(bad,),[("exact_value(token, {k: v for k, v in selected.items() if k != 'redb_snapshot_id'})",'True')])
        for key,expr in [('storage_instance_id',"token['storage_instance_id'] == storage"),('source_storage',"token['source_selection']['storage_instance_id'] == storage"),('checkpoint_key',"token['checkpoint_key'] == 'event_record_index_checkpoint.v1:' + storage"),('dataset_generation',"token['index_dataset_name'] == 'event_record_index.v2@' + token['generation_id']")]:
            token=copy.deepcopy(read['live_token'])
            if key=='source_storage':token['source_selection']['storage_instance_id']='22222222-2222-4222-8222-222222222222'
            elif key=='dataset_generation':token['index_dataset_name']='event_record_index.v2@eig_'+'d'*64
            elif key=='checkpoint_key':token[key]='event_record_index_checkpoint.v1:22222222-2222-4222-8222-222222222222'
            else:token[key]='22222222-2222-4222-8222-222222222222'
            add('token.'+key,family+':token_'+key,'token_matches_original',(read['live_token'],a),(token,a),[(expr,'True')])
        retained=(row,e,read['retained_authority'],read['live_token'])
        for key,expr in [('family',"event['event_type'] == row['event_type']"),('schema',"event['payload_schema_id'] == schema['$id']")]:
            field='event_type' if key=='family' else 'payload_schema_id'
            value='foreign.family' if key=='family' else 'pm.payload.foreign'
            bad_e=dict(e,**{field:value});bad_a=copy.deepcopy(read['retained_authority']);bad_a['stored_event']=copy.deepcopy(bad_e)
            bad_a['stored_custody']['producer_semantic_digest']=m.producer_digest(bad_e)
            if key=='family':bad_a['stored_custody']['event_type']=value
            bad_a['stored_custody']['original_event_value_commitment']['sha256']=hashlib.sha256(m.full_value_preimage(bad_e)).hexdigest()
            add('history.'+key,family+':retained_'+key,'retained_event_valid',retained,(row,bad_e,bad_a,read['live_token']),[(expr,'True')])
        bad=change(read['retained_authority'],['source_selection','recovery_epoch'],1)
        add('history.source_selection',family+':retained_source','retained_event_valid',retained,(row,e,bad,read['live_token']),[("exact_value(authority['source_selection'], selected['source_selection'])",'True')])
        # All authored checkpoint grammar negatives, now with coherent copies.
        for c in row['rebuild_cases']:
            if 'trailing_LF' not in c['case_id'] and not c['case_id'].startswith('checkpoint_generation_'):
                continue
            bad=m.patched(dict(copy.deepcopy(rebuild),**copy.deepcopy(c.get('overrides',{}))),c.get('patches',[]))
            is_gen='generation' in c['case_id'] and 'anchor' not in c['case_id'] or 'index_dataset_name' in c['case_id']
            guard='token.generation_dataset_grammar' if is_gen else 'token.other_string_grammar'
            # The broad format rule is audited separately below. Specific
            # generation removal must leave every non-generation probe refused.
            edits=[("return strict(schema, format_checker=FORMATS)","schema['properties']['generation_id'].pop('pattern', None)\n    return strict(schema, format_checker=FORMATS)"),
                   ('all(single_line(v) for v in value.values())',"all(single_line(v) for k, v in value.items() if k not in ('generation_id', 'index_dataset_name'))")]
            if not is_gen:
                edits=[('if not read_token_validator(durable).is_valid(token):','if False:'),('if not single_line(token):','if False:')]
            add(guard,family+':'+c['case_id'],'rebuild_publication',(row,rebuild),(row,bad),edits,lambda x,old=rebuild['old_publication']:x!=old)
        # Stored snapshots are structurally forbidden; no identity/equality
        # mismatch is needed to demonstrate this rule.
        durable=copy.deepcopy(row['durable_read_token']);bad=dict(durable,redb_snapshot_id='snapshot:forbidden')
        add('token.durable_snapshot',family+':durable_snapshot','token_schema_valid',(durable,True),(bad,True),
            [("del schema['properties']['redb_snapshot_id']","pass  # mutant permits persisted snapshots")])
        for field in durable:
            bad=dict(durable);del bad[field]
            add('token.schema',family+':token_required_'+field,'token_schema_valid',(durable,True),(bad,True),
                [('return strict(schema, format_checker=FORMATS)',"return type('AcceptedToken', (), {'is_valid': lambda self, token: True})()")])
        add('token.schema',family+':token_object_shape','token_schema_valid',(durable,True),(None,True),
            [('return strict(schema, format_checker=FORMATS)',"return type('AcceptedToken', (), {'is_valid': lambda self, token: True})()")])
        # Body, inline/external, descriptor and access checks use their actual
        # resolver directly, so writer semantic joins cannot mask their defect.
        ps=json.loads((ROOT/row['schema']).read_text())
        oversize=copy.deepcopy(e);oversize['payload']['unrecognized_inline_padding']='x'*16385
        add('payload.inline_cap',family+':oversized_inline','resolved_payload',(e,{'type':'object'}),(oversize,{'type':'object'}),no_if('len(canonical_fixture_msgpack(body)) > INLINE_LIMIT'),lambda x:x is not None)
        bad=copy.deepcopy(e);bad['payload']['schema_version']='9.0.0'
        add('payload.schema',family+':logical_schema','resolved_payload',(e,ps),(bad,ps),[("body if DMValidator(schema, format_checker=FORMATS).is_valid(body) else None",'body')],lambda x:x is not None)
        # Only the three owners whose closed schemas legally exceed the cap.
        external=next((c for c in row['payload_boundary_cases'] if c['case_id']=='external_16385'),None)
        if external:
            ext=m.boundary_state(row,external);evt=ext['event'];storage=ext['original_operation']['payload_storage'];positive=(evt,ps,storage)
            for field in ['pack_synced','index_synced','source_present','permission_current','deletion_clear','hold_allows_disclosure']:
                edits=[("storage.get(k) is True for k in (",f"(k == {field!r} or storage.get(k) is True) for k in (")]
                add('payload.external_'+field,family+':external_'+field,'resolved_payload',positive,(evt,ps,dict(storage,**{field:False})),edits,lambda x:x is not None)
            bad=copy.deepcopy(evt);bad['payload']={'untrusted':'inline alongside external'}
            add('payload.external_exclusivity',family+':external_inline','resolved_payload',positive,(bad,ps,storage),no_if("body != {} or not isinstance(storage, dict)"),lambda x:x is not None)
            bad=change(storage,['descriptor','blake3_id'],'f'*64)
            add('payload.external_descriptor',family+':external_descriptor','resolved_payload',positive,(evt,ps,bad),no_if("descriptor['byte_size'] <= INLINE_LIMIT or not exact_value(storage.get('descriptor'), descriptor)"),lambda x:x is not None)
            small=copy.deepcopy(e);desc=m.payload_descriptor(small['payload']);small_storage=dict(storage,body=small['payload'],descriptor=desc)
            small['payload']={};small['payload_ref']=m.payload_reference(desc)
            add('payload.external_descriptor',family+':external_below_threshold','resolved_payload',positive,(small,ps,small_storage),no_if("descriptor['byte_size'] <= INLINE_LIMIT or not exact_value(storage.get('descriptor'), descriptor)"),lambda x:x is not None)
            bad=dict(evt,payload_ref='ref:foreign')
            add('payload.external_ref',family+':external_ref','resolved_payload',positive,(bad,ps,storage),no_if("event['payload_ref'] != payload_reference(descriptor)"),lambda x:x is not None)
        # Legacy helper fences are independently enforced as well as the actual
        # operating path. Every conjunct has its own single-fact witness.
        allowed=('current','current',True,True,False,'1.0.0')
        for i,(name,expr,value) in enumerate([
            ('token','type(current_token) is str and type(selected_token) is str and exact_value(current_token, selected_token)','stale'),
            ('permission','permission is True',False),('source','source_present is True',False),
            ('withdrawal','withdrawn is False',True),('version',"version == '1.0.0'",'2.0.0'),
        ]):
            index=[1,2,3,4,5][i];bad=list(allowed);bad[index]=value
            add('read_helper.'+name,family+':read_helper_'+name,'read_allowed',allowed,tuple(bad),[("return type(current_token) is str and type(selected_token) is str and exact_value(current_token, selected_token) and permission is True and source_present is True and withdrawn is False and version == '1.0.0'","return "+' and '.join(v for j,v in enumerate(['type(current_token) is str and type(selected_token) is str and exact_value(current_token, selected_token)','permission is True','source_present is True','withdrawn is False',"version == '1.0.0'"]) if j!=i))])
        schema=json.loads((ROOT/row['schema']).read_text())
        broken=copy.deepcopy(schema);broken.setdefault('$defs',{})['unused']={'$ref':row['unresolved_reference_negative']}
        add('schema.references',family+':unused_unresolved_ref','schema_references_valid',(schema,),(broken,),
            [("raise AssertionError(('unresolved schema reference', node['$ref'])) from error",'pass  # mutant ignores dangling reference')])
        broken=dict(schema,type='invalid-schema-type')
        add('schema.meta',family+':schema_wellformed','schema_wellformed',(schema,),(broken,),[('Draft202012Validator.check_schema(schema)','pass  # mutant skips schema meta-validation')])
        # Every enforcement keyword authored in each closed payload schema.
        # Pattern and CR/LF 'not' are one syntax rule: both enforce the same
        # language, so removing only its redundant implementation is not proof.
        def schema_probe(path,keyword,bad,label=None,also=()):
            guard='schema.'+family+':'+'.'.join(map(str,path+[keyword]))
            paths=[path+[keyword]]+[path+[key] for key in also]
            edits=[('@schema:'+json.dumps(dict(schema_id=schema['$id'],path=p),sort_keys=True),'delete') for p in paths]
            if keyword=='type' and 'not' in also:
                # Relax only the implicit non-string fence in not(pattern),
                # retaining its rejection of CR/LF strings.
                edits=edits[:1]+[('@schema:'+json.dumps(dict(schema_id=schema['$id'],path=path+['not','type'],action='set',value='string'),sort_keys=True),'set')]
            add(guard,family+':schema:'+(label or '.'.join(map(str,path+[keyword]))),'schema_valid',(schema,payload),(schema,bad),edits)
        schema_probe([],'type',[])
        schema_probe([],'additionalProperties',dict(payload,unexpected='secret'))
        for i,field in enumerate(schema['required']):
            bad=dict(payload);del bad[field]
            schema_probe(['required'],i,bad,'missing_'+field)
        def walk_shape(shape,path,value_path):
            typ=shape.get('type')
            if typ and typ!='null':
                # not(pattern) also rejects every non-string: pattern is
                # vacuously valid for such values, and 'not' then refuses it.
                # Remove that redundant type fence with the explicit type.
                schema_probe(path,'type',change(payload,value_path,{}),also=('not',) if 'not' in shape else ())
                current=payload
                for key in value_path: current=current[key]
                for i,bad in enumerate(row['wrong_type_cases']['integer' if typ=='integer' else 'other']):
                    if type(bad) is type(current) or bad is None and 'anyOf' in path: continue
                    schema_probe(path,'type',change(payload,value_path,bad),label='wrong_type:'+'.'.join(map(str,value_path))+':'+str(i),also=('not',) if 'not' in shape else ())
            if 'const' in shape:
                schema_probe(path,'const',change(payload,value_path,'other'))
                for i,bad in enumerate(row['wrong_type_cases']['other']):
                    if type(bad) is str: continue
                    schema_probe(path,'const',change(payload,value_path,bad),label='wrong_type_const:'+'.'.join(map(str,value_path))+':'+str(i))
            if 'enum' in shape:
                schema_probe(path,'enum',change(payload,value_path,'OtherState'))
                for i,bad in enumerate(row['wrong_type_cases']['other']):
                    if type(bad) is str: continue
                    schema_probe(path,'enum',change(payload,value_path,bad),label='wrong_type_enum:'+'.'.join(map(str,value_path))+':'+str(i))
            if 'minLength' in shape:
                schema_probe(path,'minLength',change(payload,value_path,''))
            if 'maxLength' in shape:
                n=shape['maxLength']+1
                value=('2026-11-04T12:00:00.'+'1'*n+'Z') if 'format' in shape else ('ref:'+'x'*n if 'pattern' in shape and 'ref:' in shape['pattern'] else 'x'*n)
                schema_probe(path,'maxLength',change(payload,value_path,value))
            if 'format' in shape:
                schema_probe(path,'format',change(payload,value_path,'not-a-date'))
            if 'pattern' in shape:
                value='not-a-ref' if 'ref:' in shape['pattern'] else '/absolute'
                schema_probe(path,'pattern',change(payload,value_path,value),also=('not',) if 'not' in shape else ())
                original=payload
                for key in value_path:original=original[key]
                schema_probe(path,'pattern',change(payload,value_path,original+'\n'),label='LF:'+'.'.join(map(str,value_path)),also=('not',) if 'not' in shape else ())
            for keyword in ['minimum','maximum']:
                if keyword in shape:
                    schema_probe(path,keyword,change(payload,value_path,shape[keyword]+(-1 if keyword=='minimum' else 1)))
            if typ=='array':
                if 'minItems' in shape:schema_probe(path,'minItems',change(payload,value_path,[]))
                if 'maxItems' in shape:
                    schema_probe(path,'maxItems',change(payload,value_path,['ref:'+str(i) for i in range(shape['maxItems']+1)]))
                if 'uniqueItems' in shape:schema_probe(path,'uniqueItems',change(payload,value_path,['ref:a','ref:a']))
                # An empty legal positive can still supply a single legal item
                # to the item's own shape probes.
                original=payload
                for key in value_path:original=original[key]
                if original:walk_shape(shape['items'],path+['items'],value_path+[0])
            if 'anyOf' in shape:
                for i,child in enumerate(shape['anyOf']):
                    if child.get('type')=='string':walk_shape(child,path+['anyOf',i],value_path)
        for field,shape in schema['properties'].items():
            # Null application fields have a separate Project-scope positive.
            old_payload=payload
            if payload[field] is None:
                payload=copy.deepcopy(payload);payload[field]='project:actual-1' if field=='project_id' else 'identity:actual-1'
            walk_shape(shape,['properties',field],[field])
            payload=old_payload

    docs={key:json.loads((ROOT/path).read_text()) for key,path in [
        ('matrix','Plans/Wiring_Matrix.production.json'),('touch','Plans/touch_closure.json'),('exclusions','Plans/Wiring_Matrix.production.exclusions.json')]}
    guard_index=next(i for i,p in enumerate(docs['touch']['profiles']) if p['profile_id']=='TCP-DRY-METHOD')
    def settings(guard,label,bad,edits):
        add('settings.'+guard,'settings:'+label,'settings_companions_consistent',(docs,),(bad,),edits)
    settings('retired_names','retired_name_outside_theme',change(docs,['exclusions','notes','isolated_retirement_witness'],'settings.updated'),no_if("any(name in json.dumps(document) for name in ('settings.updated', 'settings.theme.updated'))"))
    for command in ['catalog.theme_reset','catalog.theme_set_accent','catalog.theme_set_density','catalog.theme_set_mode']:
        for path in [['expected_event_types'],['effect_contract','receipt_or_event_refs']]:
            settings('theme_successor',command+':'+path[-1],change(docs,['matrix','entries',command]+path,['foreign.family']),no_if("entry['expected_event_types'] != ['settings.layer.changed'] or entry['effect_contract']['receipt_or_event_refs'] != ['settings.layer.changed']"))
    for field,value in [('event_refs',['foreign.family']),('handler_status','present'),('wiring_status','present')]:
        settings('dry_unwired',field,change(docs,['touch','profiles',guard_index,field],value),no_if("guard['event_refs'] != [] or (guard['handler_status'], guard['wiring_status']) != ('absent', 'absent')"))
    settings('dry_disabled_reason','disabled_reason',change(docs,['touch','profiles',guard_index,'disabled_reason_rule'],'disabled'),no_if("'owner_contract_missing' not in guard['disabled_reason_rule']"))
    tokens=('settings.agent_rules.dry_method_default_guard.updated','read-only','settings.layer.changed','owner-adoption','owner_contract_missing')
    for token in tokens:
        refs=docs['touch']['profiles'][guard_index]['migration_refs']
        settings('dry_migration','migration:'+token,change(docs,['touch','profiles',guard_index,'migration_refs'],[v.replace(token,'absent-token') for v in refs]),no_if("not all(token in migration for token in ('settings.agent_rules.dry_method_default_guard.updated', 'read-only', 'settings.layer.changed', 'owner-adoption', 'owner_contract_missing'))"))
    command='cmd.settings.agent_rules.dry_method_default_guard.set'
    entry=next(iter(docs['matrix']['entries']))
    settings('dry_no_dispatch','premature_dispatch',change(docs,['matrix','entries',entry,'ui_command_id'],command),no_if("any(e['ui_command_id'] == command for e in entries.values())"))
    for token in ('settings.layer.changed','owner-adoption','owner_contract_missing','disabled'):
        note=docs['exclusions']['notes'][command]
        settings('dry_exclusion','exclusion:'+token,change(docs,['exclusions','notes',command],note.replace(token,'absent-token')),[("return all(token in exclusion for token in ('settings.layer.changed', 'owner-adoption', 'owner_contract_missing', 'disabled'))",'return True')])
    type_timestamp_catalogue(m, fixtures, add, change, no_if, mutants)
    numeric_catalogue(m, fixtures, add, change)
    return probes,mutants


def type_timestamp_catalogue(m, fixtures, add, change, no_if, mutants):
    lexical = [("if re.fullmatch(r'[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-9]{2}:[0-9]{2}(?:\\.[0-9]+)?Z', value) is None:", 'if False:')]
    parse = [('return parsed.tzinfo is not None\n    except ValueError:\n        return False',
              'return parsed.tzinfo is not None\n    except ValueError:\n        return True')]
    timezone = [('return parsed.tzinfo is not None', 'return True')]
    date_edits = {'lexical_negative': lexical, 'calendar_negative': parse,
                  'timezone_negative': lexical + timezone,
                  'lexical_parse_negative': lexical + parse}
    date_guards = {'lexical_negative': 'datetime.lexical', 'calendar_negative': 'datetime.calendar',
                   'timezone_negative': 'datetime.timezone',
                   'lexical_parse_negative': 'datetime.parse'}
    add('datetime.timezone','datetime:timezone','utc_datetime',('2026-11-04T12:00:00Z',),('2026-11-04T12:00:00',),lexical+timezone)
    add('datetime.parse','datetime:parse','utc_datetime',('2026-11-04T12:00:00Z',),('not-a-date',),lexical+parse)
    def old(guard, label, fn, positive, negative, accept=bool):
        add(guard, label, fn, positive, negative, mutants[guard], accept)
    def paths(value, prefix=()):
        yield prefix, value
        if type(value) is dict:
            for k,v in value.items(): yield from paths(v, prefix+(k,))
        elif type(value) is list:
            for k,v in enumerate(value): yield from paths(v, prefix+(k,))
    def alternatives(row, value):
        key = 'boolean' if type(value) is bool else 'integer' if type(value) is int else 'other'
        # A different value with the correct type is another guard's concern.
        return [v for v in row['wrong_type_cases'][key] if type(v) is not type(value)]
    for row in m.families_for_run(fixtures):
        family=row['event_type'];pub=row['publication_positive'];e=row['positive_event_record'];a=row['receipt_authority'];o=row['original_operation']
        for kind, guard in date_guards.items():
            for i,value in enumerate(row['timestamp_representation_cases'][kind]):
                # No stale original/result/full-value copy: the one timestamp
                # fact and every observation/commitment are changed together.
                for field in ('occurred_at_utc','observed_at_utc','persisted_at_utc'):
                    bad=m.timestamp_state(row,value,field)
                    add(guard,family+':timestamp:'+field+':'+kind+':'+str(i),'publication',
                        (row,pub),(row,bad),date_edits[kind],lambda x:x['terminal'] is True)
        for guard,fn,value,args in (
            ('envelope.schema','envelope_valid',e,()),
            ('custody.schema','custody_valid',a['stored_custody'],()),
            ('token.schema','token_schema_valid',row['durable_read_token'],(True,)),
        ):
            for path,leaf in paths(value):
                # EventRecord's opaque logical payload is governed by its own
                # closed schema, not by the envelope's object-only boundary.
                if guard=='envelope.schema' and len(path)>1 and path[0]=='payload': continue
                for i,bad in enumerate(alternatives(row,leaf)):
                    negative=bad if not path else change(value,path,bad)
                    # Null or flexible enum/anyOf slots may legitimately admit
                    # another JSON type; only the schema's declared domain is a refusal.
                    if fn=='token_schema_valid': valid=m.read_token_validator(True).is_valid(negative)
                    else: valid=getattr(m,fn)(negative)
                    if valid: continue
                    old(guard,family+':type:boundary:'+guard+':'+'.'.join(map(str,path))+':'+str(i),fn,(value,)+args,(negative,)+args)
        for gate in m.ADMISSION_GATES:
            for i,value in enumerate(row['wrong_type_cases']['boolean']):
                old('append.'+gate,family+':type:append:'+gate+':'+str(i),'publication',
                    (row,pub),(row,dict(pub,**{gate:value})),lambda x:x['durable_events']==1)
        for gate in ('frame_written','group_synced'):
            for i,value in enumerate(row['wrong_type_cases']['boolean']):
                old('append.durability',family+':type:append:'+gate+':'+str(i),'publication',
                    (row,pub),(row,dict(pub,**{gate:value})),lambda x:x['durable_events']==1)
        for gate in ('receipt_delivery','terminal_delivery'):
            for i,value in enumerate(row['wrong_type_cases']['boolean']):
                add('append.delivery_types',family+':type:delivery:'+gate+':'+str(i),'delivery_types_valid',
                    (pub,),(dict(pub,**{gate:value}),),[("return type(state['receipt_delivery']) is bool and type(state['terminal_delivery']) is bool",'return True')])
        for mode, gates, fn, accept in (
            ('reader',('reader_enabled','permission_current','source_present','deletion_clear','hold_allows_disclosure','current_frontier_verified'),'reader_result',lambda x:x=='available'),
            ('rebuild',m.REBUILD_GATES,'rebuild_publication',lambda x,old=row['rebuild_positive']['old_publication']:x!=old),
        ):
            state=row[mode+'_positive']
            for gate in gates:
                for i,value in enumerate(row['wrong_type_cases']['boolean']):
                    old(mode+'.'+gate,family+':type:'+mode+':'+gate+':'+str(i),fn,(row,state),(row,dict(state,**{gate:value})),accept)
        for i,value in enumerate(row['wrong_type_cases']['boolean']):
            old('receipt.protected_authority',family+':type:protected:'+str(i),'resolve_original',
                (row,e,a),(row,e,dict(a,protected_authority_current=value)),lambda x:x is not None)
        for path in (['admission_epoch'],['current_admission_epoch'],['original_operation','accepted_admission_epoch']):
            for i,value in enumerate(row['wrong_type_cases']['integer']):
                old('append.epoch',family+':type:epoch:'+'.'.join(path)+':'+str(i),'publication',
                    (row,pub),(row,change(pub,path,value)),lambda x:x['durable_events']==1)
        for path,value in paths(row['producer_witness_positive']):
            for i,bad in enumerate(alternatives(row,value)):
                witness=bad if not path else change(row['producer_witness_positive'],path,bad)
                old('producer.witness',family+':type:witness:'+'.'.join(map(str,path))+':'+str(i),
                    'producer_witness_allowed',(family,row['producer_witness_positive']),(family,witness))
        # Source-side typed joins, tested at the exact boundary. Mutating the
        # caller/event side alone would leave a stale digest or receipt copy.
        joins = [
            ('writer.result','valid_event',(row,e,o),2,['result_payload']),
            ('writer.original_joins','valid_event',(row,e,o),2,['envelope_joins']),
            ('receipt.append_result','resolve_original',(row,e,a),2,['original_append_result']),
            ('receipt.original_receipt','resolve_original',(row,e,a),2,['first_append_receipt']),
            ('append.receipt_delivery_identity','publication',(row,pub),1,['first_append_receipt']),
            ('history.source_selection','retained_event_valid',(row,e,row['reader_positive']['retained_authority'],row['reader_positive']['live_token']),2,['source_selection']),
            ('reader.selected_token','reader_result',(row,row['reader_positive']),1,['selected_token']),
            ('checkpoint.outer_revision','checkpoint_matches_original',(row['rebuild_positive'],),0,['new_checkpoint','frontier_revision']),
        ]
        for guard,fn,args,index,base_path in joins:
            source=args[index]
            value=source
            for k in base_path:value=value[k]
            for tail,leaf in paths(value):
                # Whole envelope_joins shape has its own guard. Other whole
                # structures compare directly without dereferencing the input.
                for i,bad in enumerate(alternatives(row,leaf)):
                    arguments=list(args);arguments[index]=change(source,base_path+list(tail),bad)
                    accept=(lambda x:x['terminal'] is True) if fn=='publication' else (lambda x:x=='available') if fn=='reader_result' else bool if fn in ('valid_event','retained_event_valid','checkpoint_matches_original') else lambda x:x is not None
                    old(guard,family+':type:join:'+guard+':'+'.'.join(map(str,tail))+':'+str(i),fn,args,tuple(arguments),accept)
        external=next((c for c in row['payload_boundary_cases'] if c['case_id']=='external_16385'),None)
        if external:
            state=m.boundary_state(row,external);schema=json.loads((ROOT/row['schema']).read_text());storage=state['original_operation']['payload_storage'];evt=state['event']
            for gate in ('pack_synced','index_synced','source_present','permission_current','deletion_clear','hold_allows_disclosure'):
                for i,value in enumerate(row['wrong_type_cases']['boolean']):
                    old('payload.external_'+gate,family+':type:external:'+gate+':'+str(i),'resolved_payload',
                        (evt,schema,storage),(evt,schema,dict(storage,**{gate:value})),lambda x:x is not None)
        for field,original_field in (('current_owner_session_id','accepted_session_id'),('current_restore_occurrence_id','restore_occurrence_id')):
            for i,bad in enumerate(alternatives(row,pub[field])):
                state=change(pub,['original_operation',original_field],bad)
                state=change(state,[field],bad)
                old('append.session_restore',family+':type:session:'+field+':'+str(i),'publication',(row,pub),(row,state),lambda x:x['durable_events']==1)
        # Storage identity is independently captured by the original adapter.
        # Recompute every derived identity observation; a stale key cannot
        # accidentally enforce this type fence.
        for i,bad in enumerate(alternatives(row,o['storage_instance_id'])):
            event=copy.deepcopy(e);original=copy.deepcopy(o);original['storage_instance_id']=bad
            identity=m.digest(family,bad,row['positive_payload']);event['event_id']='evt_'+identity
            if event['scope_kind']=='project':event['idempotency_key']=family+':'+identity
            add('writer.storage_identity_type',family+':type:original_storage:'+str(i),'valid_event',(row,e,o),(row,event,original),no_if("type(original.get('storage_instance_id')) is not str"))
        for mode,fn,accept in (('reader','reader_result',lambda x:x=='available'),('rebuild','rebuild_publication',lambda x,old=row['rebuild_positive']['old_publication']:x!=old)):
            state=row[mode+'_positive']
            for i,bad in enumerate(alternatives(row,state['version'])):
                old(mode+'.version',family+':type:version:'+mode+':'+str(i),fn,(row,state),(row,dict(state,version=bad)),accept)
        for i,bad in enumerate(alternatives(row,'1.0.0')):
            old('read_helper.version',family+':type:version:helper:'+str(i),'read_allowed',('current','current',True,True,False,'1.0.0'),('current','current',True,True,False,bad))
        payload=row['positive_payload']
        if row['scope_policy']=='project_only':
            for i,bad in enumerate(alternatives(row,payload['project_id'])):
                old('semantic.project',family+':type:semantic:project:'+str(i),'semantic',
                    (payload,row['scope_policy'],family),(dict(payload,project_id=bad),row['scope_policy'],family))
        if 'after_revision' in payload:
            for field in ('before_revision','after_revision'):
                for i,bad in enumerate(row['wrong_type_cases']['integer']):
                    old('semantic.revision',family+':type:semantic:'+field+':'+str(i),'semantic',
                        (payload,row['scope_policy'],family),(dict(payload,**{field:bad}),row['scope_policy'],family))
        for i,bad in enumerate(row['wrong_type_cases']['other']):
            if type(bad) is str: continue
            old('retry.semantic_conflict',family+':type:retry_helper:digest:'+str(i),'replay_decision',
                ('a','a','ref:original'),(bad,bad,'ref:original'),lambda x:x[0]=='return_original_without_effect')
            old('retry.semantic_conflict',family+':type:retry_helper:receipt:'+str(i),'replay_decision',
                ('a','a','ref:original'),('a','a',bad),lambda x:x[0]=='return_original_without_effect')
            old('read_helper.token',family+':type:read_helper:token:'+str(i),'read_allowed',
                ('current','current',True,True,False,'1.0.0'),(bad,bad,True,True,False,'1.0.0'))
        allowed=('current','current',True,True,False,'1.0.0')
        for index,guard in ((2,'read_helper.permission'),(3,'read_helper.source'),(4,'read_helper.withdrawal')):
            for i,value in enumerate(row['wrong_type_cases']['boolean']):
                bad=list(allowed);bad[index]=value
                old(guard,family+':type:'+guard+':'+str(i),'read_allowed',allowed,tuple(bad))


def numeric_catalogue(m, fixtures, add, change):
    # The shared type callback is the same rule at schema and model boundaries.
    # The MessagePack domain is a named duplicate on paths which serialize a
    # complete retained value. Neither implementation is relaxed in production.
    integer_edits = [('return type(instance) is int', "return Draft202012Validator.TYPE_CHECKER.is_type(instance, 'integer')")]
    codec_edits = [('    if type(value) is int:\n        if 0 <= value <= 127:', '    if type(value) is float and value.is_integer():\n        value = int(value)\n    if type(value) is int:\n        if 0 <= value <= 127:')]
    def numeric(guard, family, label, fn, positive, negative, accept=bool):
        edits = {
            'numeric.integer_form': integer_edits,
            'numeric.msgpack_integer_form': codec_edits,
            'numeric.integer_codec_duplicate': integer_edits + codec_edits,
        }[guard]
        add(guard, family + ':numeric:' + label, fn, positive, negative, edits, accept)
    for row in m.families_for_run(fixtures):
        family = row['event_type']
        for token in row['numeric_representation_cases']['upstream_aliases']:
            alias = json.loads(token)
            if abs(alias) > m.MAX_SAFE_JSON_INTEGER:
                e=dict(row['positive_event_record'],producer_sequence_id=int(alias))
                numeric('numeric.integer_form',family,'envelope:producer_sequence_id_'+token,'envelope_valid',
                        (e,),(dict(e,producer_sequence_id=alias),))
                continue
            state = m.upstream_sequence_state(row, int(alias))
            e, o, a = state['event'], state['original_operation'], state['committed_authority']
            bad = dict(e, producer_sequence_id=alias)
            numeric('numeric.integer_form', family, 'writer_upstream_' + token, 'valid_event', (row,e,o), (row,bad,o))
            numeric('numeric.integer_form', family, 'retry_upstream_' + token, 'current_retry', (row,e,a), (row,bad,a), lambda x:x[0]=='return_original_without_effect')
            numeric('numeric.msgpack_integer_form', family, 'codec_upstream_' + token, 'msgpack_supported', (e,), (bad,))
            numeric('numeric.integer_codec_duplicate', family, 'full_value_upstream_' + token, 'resolve_full_value', (row,e,a), (row,bad,a), lambda x:x is not None)
            # Canonicalization itself gets an independent guard. A different
            # actor is a true positive for different semantics; only the
            # representation changes in the negative pair.
            add('numeric.jcs_integer_alias', family + ':numeric:hash_' + token, 'different_producer_digest',
                (e,dict(e,actor_ref='ref:different')), (e,bad), [('        value = int(value)\n','        value = value\n')])
        # Every numeric leaf of the actual publication/reader/rebuild/authority
        # inputs, not an invented sibling schema or a selection of fields.
        for name in ('publication_positive','reader_positive','rebuild_positive','original_operation','receipt_authority'):
            positive = row[name]
            for path, value in m.numeric_paths(positive):
                bad = change(positive, path, float(value))
                numeric('numeric.integer_form', family, name + ':' + '.'.join(map(str,path)), 'integer_tree', (positive,), (bad,))
        e, o = row['positive_event_record'], row['original_operation']
        schema = json.loads((ROOT/row['schema']).read_text())
        for path, value in m.numeric_paths(e['payload']):
            bad = change(e, ['payload'] + list(path), float(value))
            numeric('numeric.integer_form', family, 'payload_schema:' + '.'.join(map(str,path)), 'schema_valid', (schema,e['payload']), (schema,bad['payload']))
            numeric('numeric.integer_codec_duplicate', family, 'payload_writer:' + '.'.join(map(str,path)), 'valid_event', (row,e,o), (row,bad,o))
        for name, value, function, arguments in (
            ('envelope',e,'envelope_valid',()),
            ('custody',row['receipt_authority']['stored_custody'],'custody_valid',()),
            ('token',row['durable_read_token'],'token_schema_valid',(True,)),
        ):
            paths = m.numeric_paths(value)
            for path, number in paths:
                if name == 'envelope' and path[0] == 'payload':
                    continue  # the closed payload schema is tested above
                bad = change(value,path,float(number))
                numeric('numeric.integer_form', family, name + ':' + '.'.join(map(str,path)), function, (value,)+arguments, (bad,)+arguments)
        external=next((c for c in row['payload_boundary_cases'] if c['case_id']=='external_16385'),None)
        if external:
            state=m.boundary_state(row,external)
            storage=state['original_operation']['payload_storage']
            bad=change(storage,['descriptor','byte_size'],float(storage['descriptor']['byte_size']))
            numeric('numeric.integer_form',family,'external_descriptor_byte_size','resolved_payload',
                    (state['event'],schema,storage),(state['event'],schema,bad),lambda x:x is not None)
            for path,value in m.numeric_paths(storage['body']):
                bad=change(storage,['body']+list(path),float(value))
                numeric('numeric.integer_codec_duplicate',family,'external_body:'+'.'.join(map(str,path)),'resolved_payload',
                        (state['event'],schema,storage),(state['event'],schema,bad),lambda x:x is not None)
        add('numeric.jcs_nonintegral',family+':numeric:fractional_hash_refusal','producer_hash_supported',
            (row['positive_event_record'],),(dict(row['positive_event_record'],producer_sequence_id=1.5),),
            [('if not value.is_integer():','if False:')])
        large = m.upstream_sequence_state(row, m.MAX_SAFE_JSON_INTEGER+2)
        normal = m.upstream_sequence_state(row, 1)
        add('numeric.current_exact_range', family + ':numeric:writer_unsafe_integer', 'valid_event',
            (row,normal['event'],normal['original_operation']), (row,large['event'],large['original_operation']),
            [('if not retained and type(value) is int and abs(value) > MAX_SAFE_JSON_INTEGER:', 'if False:')])
        for token in row['numeric_representation_cases']['current_json_negatives']:
            if token == '-0':
                guard='numeric.raw_negative_zero'
                edits=[("if token == '-0':",'if False:')]
            elif token in ('01','00','001'):
                guard='numeric.json_single_value'
                edits=[('return json.loads(text, parse_int=current_integer_token, parse_float=current_float_token, parse_constant=current_float_token)',
                        'return json.JSONDecoder(parse_int=current_integer_token, parse_float=current_float_token, parse_constant=current_float_token).raw_decode(text)[0]')]
            else:
                guard='numeric.raw_float'
                edits=[("raise ValueError('DM current input requires integer tokens')",'return float(token)')]
            add(guard,family+':numeric:json_'+token,'current_json_valid',('1',),(token,),edits)


def container_rules(m, fixtures, probes):
    """Composite JSON Schema gates, using the same already authored witnesses."""
    rules={}
    for row in m.families_for_run(fixtures):
        schema=json.loads((ROOT/row['schema']).read_text())
        for field,shape in schema['properties'].items():
            base=['properties',field]
            targets=[]
            if 'anyOf' in shape:
                targets.append(('anyOf',base+['anyOf'],''))
                for i,child in enumerate(shape['anyOf']):
                    if child.get('type')=='null':
                        targets.append(('null_branch_type',base+['anyOf',i,'type'],''))
            if 'items' in shape:
                targets.append(('items',base+['items'],'.items.'))
            for name,path,suffix in targets:
                guard='schema.container.'+row['event_type']+':'+field+'.'+name
                prefix='schema.'+row['event_type']+':properties.'+field+'.'
                if suffix:prefix=prefix.removesuffix('.')+suffix
                expected=[p['id'] for p in probes if p['guard'].startswith(prefix)]
                assert expected,guard
                rules[guard]=dict(edits=(('@schema:'+json.dumps(dict(schema_id=schema['$id'],path=path),sort_keys=True),'delete'),),expected=expected)
    return rules


def invoke(m, probe, which):
    if probe['function']=='producer_hash_supported':
        try:m.producer_digest(*probe[which])
        except ValueError:return False
        return True
    if probe['function']=='msgpack_supported':
        try:m.canonical_fixture_msgpack(*probe[which])
        except ValueError:return False
        return True
    if probe['function']=='current_json_valid':
        try:m.decode_current_json(*probe[which])
        except ValueError:return False
        return True
    if probe['function']=='different_producer_digest':
        first,second=probe[which]
        return m.producer_digest(first)!=m.producer_digest(second)
    if probe['function']=='schema_wellformed':
        try:m.assert_schema_references(*probe[which])
        except SchemaError:return False
        return True
    if probe['function']=='schema_valid':
        schema,value=probe[which]
        schema=m.json.loads(json.dumps(schema))
        return m.DMValidator(schema,format_checker=m.FORMATS).is_valid(value)
    if probe['function']=='schema_references_valid':
        try:
            m.assert_schema_references(*probe[which])
        except AssertionError as exc:
            if isinstance(exc.args[0],tuple) and exc.args[0][0]=='unresolved schema reference':return False
            raise
        return True
    if probe['function']=='token_schema_valid':
        value,durable=probe[which]
        return m.read_token_validator(durable).is_valid(value)
    # Subjects are pure readers of their inputs. The ordinary fixture checker
    # separately asserts immutability; copying entire family rows per call would
    # duplicate all unrelated fixtures for each observation.
    return getattr(m,probe['function'])(*probe[which])


def normal_checks(namespace, fixtures, guard_first=None):
    m=SimpleNamespace(**namespace) if isinstance(namespace,dict) else namespace
    probes=getattr(m, '_guard_probe_catalogue', None)
    if probes is None:
        probes,_=catalogue(m,fixtures)
    probes=list(probes)
    if guard_first is not None:
        probes.sort(key=lambda p: p['guard'] != guard_first)
    for p in probes:
        assert p['accept'](invoke(m,p,'positive')),('guard positive',p['guard'],p['label'])
        assert not p['accept'](invoke(m,p,'negative')),('guard negative',p['guard'],p['label'])
    return 2*len(probes)


def expected_probe_ids(guard, probes, containers):
    expected=[p['id'] for p in probes if p['guard']==guard
              or guard=='token.other_string_grammar' and p['guard']=='token.generation_dataset_grammar'
              or guard=='retry.replay_only' and p['guard']=='retry.current_policy'
              or guard=='retry.family_schema_duplicate' and p['guard'] in ('retry.family','retry.schema')
              or guard=='rebuild.checkpoint' and p['guard'] in ('token.generation_dataset_grammar','token.other_string_grammar')
              or guard=='writer.original_joins' and p['guard']=='append.current_event'
              or guard=='receipt.full_value' and p['guard'] in ('reader.retained_value','rebuild.retained_value')
              or guard=='token.schema' and (p['guard']=='token.durable_snapshot'
                  or p['guard']=='token.generation_dataset_grammar' and ':checkpoint_generation_' in p['label'])
              ]
    if guard in ('datetime.timezone','datetime.parse'):
        groups={'datetime.lexical'}
        if guard=='datetime.parse': groups.add('datetime.calendar')
        expected.extend(p['id'] for p in probes if p['guard'] in groups or guard=='datetime.parse' and p['guard'].startswith('schema.') and p['guard'].endswith('.format'))
    if guard=='envelope.schema':
        expected.extend(p['id'] for p in probes if p['guard'].startswith('datetime.') and any(':timestamp:'+field+':' in p['label'] for field in ('observed_at_utc','persisted_at_utc')))
    if guard=='numeric.integer_codec_duplicate':
        expected.extend(p['id'] for p in probes if p['guard'] in ('numeric.integer_form','numeric.msgpack_integer_form'))
    numeric_validator = {'envelope.schema':'envelope:', 'custody.schema':'custody:', 'token.schema':'token:'}.get(guard)
    if numeric_validator:
        expected.extend(p['id'] for p in probes if p['guard']=='numeric.integer_form'
                        and ':numeric:'+numeric_validator in p['label'])
    # Removing an integer type keyword also removes its strict type callback.
    # These are the same field/type defect, not an unrelated numeric refusal.
    payload_integer_type=re.fullmatch(r'schema\.(.+):properties\.([^.]+)\.type',guard)
    if payload_integer_type:
        family,field=payload_integer_type.groups()
        expected.extend(p['id'] for p in probes if p['guard']=='numeric.integer_form'
                        and p['label']==family+':numeric:payload_schema:'+field)
    aliases={
        'token.storage_instance_id':['operating_checkpoint_foreign_storage_instance','operating_reader_equally_foreign_storage_instance_id'],
        'token.source_storage':['operating_checkpoint_foreign_source_storage','operating_reader_equally_foreign_source_storage'],
        'token.checkpoint_key':['operating_checkpoint_foreign_key','operating_reader_equally_foreign_checkpoint_key'],
        'token.dataset_generation':['operating_checkpoint_dataset_generation_mismatch','operating_reader_equally_foreign_index_dataset_name'],
        'checkpoint.outer_revision':['operating_checkpoint_outer_frontier_mismatch'],
        'checkpoint.selected_token':['operating_checkpoint_unselected_frontier','operating_checkpoint_unselected_source'],
    }.get(guard,[])
    expected.extend(p['id'] for p in probes if any(p['label'].endswith(':'+suffix) for suffix in aliases))
    return containers[guard]['expected'] if guard in containers else expected


def main():
    if len(sys.argv) not in (2,3):
        raise SystemExit('usage: pm-small-owner-guard-audit.py <external-output.json> [guard-name-regex]')
    source=SUBJECT.read_text();m=load(source)
    fixtures=json.loads((ROOT/'Plans/small_owner_event_fixtures.json').read_text())
    probes,mutants=catalogue(m,fixtures)
    containers=container_rules(m,fixtures,probes)
    mutants.update({guard:rule['edits'] for guard,rule in containers.items()})
    schema_owners={json.loads((ROOT/r['schema']).read_text())['$id']:r['event_type'] for r in fixtures['families']}
    m._guard_probe_catalogue=probes
    normal_checks(m,fixtures)
    table=[]
    # Reuse an observed refusal only when the tested function and its complete
    # transitive subject-function dependencies are byte-identical. This checks
    # unchanged negatives without rerunning thousands of identical validators.
    observed={}
    def fingerprints(text):
        tree=ast.parse(text)
        funcs={n.name:n for n in tree.body if isinstance(n,ast.FunctionDef)}
        def closure(name, seen=None):
            seen=set() if seen is None else seen
            if name in seen:return ''
            seen.add(name)
            node=funcs[name]
            # Include callbacks passed as values (JSON numeric token hooks),
            # not only syntactically direct calls.
            calls=sorted({n.id for n in ast.walk(node) if isinstance(n,ast.Name) and n.id in funcs})
            if any(isinstance(n,ast.Name) and n.id=='FORMATS' for n in ast.walk(node)):
                calls=sorted(set(calls)|{'utc_datetime'})
            if any(isinstance(n,ast.Name) and n.id=='DMValidator' for n in ast.walk(node)):
                calls=sorted(set(calls)|{'integer_type'})
            return ast.dump(node)+''.join(closure(c,seen) for c in calls)
        return {name:hashlib.sha256(closure(name).encode()).hexdigest() for name in funcs}
    for guard,edits in mutants.items():
        if Path('/proc/meminfo').is_file():
            available_kib=int(next(line.split()[1] for line in Path('/proc/meminfo').read_text().splitlines() if line.startswith('MemAvailable:')))
            if available_kib < 6*1024*1024:
                raise SystemExit('RESOURCE PAUSE: under 6 GiB available; no further guard run')
        if len(sys.argv)==3 and not re.search(sys.argv[2],guard):
            continue
        changed=source
        schema_edits=[]
        for old,new in edits:
            if old.startswith('@schema:'):
                schema_edits.append(json.loads(old.removeprefix('@schema:')))
                continue
            assert old in changed,(guard,old)
            changed=changed.replace(old,new)
        mutant=load(changed,schema_edits)
        mutant._guard_probe_catalogue=probes
        prints=fingerprints(changed)
        flips=[];rejected=[];errors=[]
        expected=expected_probe_ids(guard,probes,containers)
        for p in probes:
            try:
                fn={'token_schema_valid':'read_token_validator','schema_references_valid':'assert_schema_references','schema_wellformed':'assert_schema_references','schema_valid':'resolved_payload',
                    'msgpack_supported':'canonical_fixture_msgpack','current_json_valid':'decode_current_json','different_producer_digest':'producer_digest',
                    'producer_hash_supported':'producer_digest'}.get(p['function'],p['function'])
                affected=bool(schema_edits) and any(p['label'].startswith(schema_owners[e['schema_id']]+':') for e in schema_edits) and fn in ('resolved_payload','valid_event','resolve_original','resolve_full_value','reader_result','rebuild_publication','publication','current_retry')
                key=(p['id'],prints[fn],json.dumps(schema_edits,sort_keys=True) if affected else '')
                if key not in observed:
                    observed[key]=p['accept'](invoke(mutant,p,'negative'))
                accepted=observed[key]
            except Exception as exc:
                errors.append([p['id'],type(exc).__name__,str(exc)])
                continue
            (flips if accepted else rejected).append(p['id'])
        stdout=io.StringIO();failure=None
        try:
            first=guard if any(p['guard']==guard for p in probes) else next(p['guard'] for p in probes if p['id'] in expected)
            with contextlib.redirect_stdout(stdout):mutant.main(guard_first=first)
        except AssertionError as exc:
            failure=str(exc)
        except Exception as exc:
            errors.append(['full_checker',type(exc).__name__,str(exc)])
        row=dict(guard=guard,edits=[dict(before=a,after=b) for a,b in edits],negatives_that_flip=flips,negatives_that_stay_rejected=rejected,expected_flips=expected,errors=errors,full_checker_failure=failure)
        row['status']='PASS' if set(flips)==set(expected) and not errors and failure is not None else 'FAIL'
        table.append(row)
        print(guard,row['status'],len(flips),'flip',len(rejected),'stay rejected',flush=True)
    out={'schema_id':'pm.dm.guard_removal.v1','native_execution':'NOT_RUN','guards':len(table),'probes':len(probes),'table':table,'status':'PASS' if all(r['status']=='PASS' for r in table) else 'FAIL'}
    path=Path(sys.argv[1])
    path.write_text(json.dumps(out,indent=2)+'\n')
    print(out['status'],path)
    return int(out['status']!='PASS')


if __name__=='__main__':
    raise SystemExit(main())
