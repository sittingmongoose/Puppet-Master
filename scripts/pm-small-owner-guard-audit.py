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

    for row in fixtures['families']:
        family = row['event_type']
        e, o, a = (copy.deepcopy(row[k]) for k in ('positive_event_record', 'original_operation', 'receipt_authority'))
        vp = (row, e, o)
        envelope=json.loads((ROOT/'Plans/event_record.schema.json').read_text())
        for field in envelope['required']:
            bad=dict(e);del bad[field]
            add('envelope.schema',family+':envelope_required_'+field,'envelope_valid',(e,),(bad,),[("return Draft202012Validator(envelope, format_checker=FORMATS).is_valid(event)",'return True')])
        for field,value in [('schema_version','9.0.0'),('schema_id','pm.foreign'),('unexpected','secret')]:
            add('envelope.schema',family+':envelope_shape_'+field,'envelope_valid',(e,),(dict(e,**{field:value}),),[("return Draft202012Validator(envelope, format_checker=FORMATS).is_valid(event)",'return True')])
        custody=a['stored_custody']
        cs=json.loads((ROOT/'Plans/event_append_receipt_contracts.schema.json').read_text())['$defs']['custody_v2']
        for field in cs['required']:
            bad=dict(custody);del bad[field]
            add('custody.schema',family+':custody_required_'+field,'custody_valid',(custody,),(bad,),[("return Draft202012Validator(dict(schema, **{'$ref': '#/$defs/custody_v2'}), format_checker=FORMATS).is_valid(custody)",'return True')])
        for field,value in [('schema_version','1.0.0'),('schema_id','pm.foreign'),('unexpected','secret')]:
            add('custody.schema',family+':custody_shape_'+field,'custody_valid',(custody,),(dict(custody,**{field:value}),),[("return Draft202012Validator(dict(schema, **{'$ref': '#/$defs/custody_v2'}), format_checker=FORMATS).is_valid(custody)",'return True')])

        def writer(guard, label, event=None, original=None, expression=None, edits=None):
            add(guard, family + ':' + label, 'valid_event', vp,
                (row, e if event is None else event, o if original is None else original),
                edits if edits is not None else no_if(expression))

        writer('writer.owner', 'foreign_owner', original=dict(o, owner='foreign'), expression="original.get('owner') != owner or original.get('operation_id') != payload['operation_id']")
        orig=dict(o,operation_id='op:foreign',result_operation_id='op:foreign')
        bad=dict(e,idempotency_key=m.application_key(o['server_id'],'op:foreign')) if e['scope_kind']=='application' else e
        writer('writer.owner', 'foreign_operation',event=bad,original=orig,expression="original.get('owner') != owner or original.get('operation_id') != payload['operation_id']")
        writer('writer.result', 'foreign_result_operation', original=dict(o, result_operation_id='op:foreign'), expression="original.get('result_operation_id') != original['operation_id'] or original.get('result_payload') != payload")
        writer('writer.result', 'foreign_result_payload', original=dict(o,result_payload={}),expression="original.get('result_operation_id') != original['operation_id'] or original.get('result_payload') != payload")
        for field in m.ORIGINAL_JOINS:
            joins=copy.deepcopy(o['envelope_joins']);joins[field]='foreign'
            writer('writer.original_joins', 'original_join_'+field, original=dict(o,envelope_joins=joins), expression="any(event[k] != original['envelope_joins'][k] for k in ORIGINAL_JOINS)")
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
                [('return witness == required','return True')])
        payload=row['positive_payload']
        if row['scope_policy']=='project_only':
            add('semantic.project',family+':real_project','semantic',(payload,row['scope_policy'],family),
                (dict(payload,project_id=None),row['scope_policy'],family),no_if("scope == 'project_only' and not payload['project_id']"))
        if 'after_revision' in payload:
            add('semantic.revision',family+':revision_successor','semantic',(payload,row['scope_policy'],family),
                (dict(payload,after_revision=payload['before_revision']),row['scope_policy'],family),no_if("'after_revision' in payload and payload['after_revision'] != payload['before_revision'] + 1"))
        if family=='lsp.server.lifecycle_changed':
            add('semantic.edge',family+':lifecycle_edge','semantic',(payload,row['scope_policy'],family),
                (dict(payload,state=payload['previous_state']),row['scope_policy'],family),no_if("event == 'lsp.server.lifecycle_changed' and payload['previous_state'] == payload['state']"))
        add('retry.semantic_conflict',family+':changed_digest','replay_decision',('a','a','ref:original'),('a','b','ref:original'),no_if('original_digest != retry_digest'),lambda x:x[0]=='return_original_without_effect')
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
                no_if("commitment['sha256'] != hashlib.sha256(full_value_preimage(requested)).hexdigest() or commitment['sha256'] != hashlib.sha256(full_value_preimage(authority['stored_event'])).hexdigest()"))
        add('receipt.protected_authority',family+':unprotected_original','resolve_original',(row,e,a),(row,e,dict(a,protected_authority_current=False)),
            [(" or not authority['protected_authority_current']",'')])
        fields=['event_id','scope_partition','event_type','idempotency_key','producer_semantic_digest','storage_instance_id']
        for field in fields:
            value='f'*64 if field=='producer_semantic_digest' else 'foreign'
            bad=change(a,['stored_custody',field],value)
            add('receipt.custody_identity',family+':custody_'+field,'resolve_original',(row,e,a),(row,e,bad),no_if("expected_identity != actual_identity or custody['storage_instance_id'] != authority['storage_instance_id']"))
        add('receipt.incoming_semantics',family+':incoming_actor','resolve_original',(row,e,a),(row,dict(e,actor_ref='ref:foreign'),a),
            no_if("incoming['event_id'] != stored['event_id'] or incoming['event_type'] != stored['event_type'] or incoming['idempotency_key'] != stored['idempotency_key'] or producer_digest(incoming) != producer_digest(stored)"))
        for field in ['event_id','sequence_id','segment_ref','byte_offset']:
            value=a['original_append_result'][field];value=value+1 if isinstance(value,int) else value+':foreign'
            bad=change(a,['original_append_result',field],value)
            add('receipt.append_result',family+':result_'+field,'resolve_original',(row,e,a),(row,e,bad),no_if("result != {'event_id': stored['event_id'], 'sequence_id': stored['sequence_id'], 'segment_ref': custody['original_segment_ref'], 'byte_offset': receipt['byte_offset']}"))
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
            add('receipt.original_receipt',family+':original_receipt_'+field,'resolve_original',(row,e,a),(row,e,bad),no_if("receipt != authority['first_append_receipt']"))
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
                [('state[k] for k in ADMISSION_GATES',f"state[k] for k in ADMISSION_GATES if k != {gate!r}")],lambda x:x['durable_events']==1)
        for field in ['admission_epoch','current_admission_epoch']:
            add('append.epoch',family+':'+field,'publication',(row,pub),(row,dict(pub,**{field:2})),no_if("state['admission_epoch'] != original['accepted_admission_epoch'] or original['accepted_admission_epoch'] != state['current_admission_epoch']"),lambda x:x['durable_events']==1)
        for field in ['current_owner_session_id','current_restore_occurrence_id']:
            add('append.session_restore',family+':'+field,'publication',(row,pub),(row,dict(pub,**{field:'foreign'})),no_if("original['accepted_session_id'] != state['current_owner_session_id'] or original['restore_occurrence_id'] != state['current_restore_occurrence_id']"),lambda x:x['durable_events']==1)
        for field in ['frame_written','group_synced']:
            add('append.durability',family+':'+field,'publication',(row,pub),(row,dict(pub,**{field:False})),no_if("not state['frame_written'] or not state['group_synced']"),lambda x:x['durable_events']==1)
        bad=change(pub,['first_append_receipt','sequence_id'],42)
        add('append.receipt_delivery_identity',family+':delivered_receipt','publication',(row,pub),(row,bad),no_if("replay is None or replay[1] != state['first_append_receipt']"),lambda x:x['terminal'])
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
            old="state['version'] == '1.0.0'" if field=='version' else 'state['+repr(field)+']'
            edits=[('and '+old,'and True')] if field!='reader_enabled' else [("state['reader_enabled'] and state['permission_current']","True and state['permission_current']")]
            # Restrict first occurrence for reader gates below in source edits.
            add('reader.'+field,family+':reader_'+field,'reader_result',(row,read),(row,dict(read,**{field:'2.0.0' if field=='version' else False})),edits,lambda x:x=='available')
        bad=change(read,['selected_token','redb_snapshot_id'],'snapshot:stale')
        add('reader.selected_token',family+':selected_snapshot','reader_result',(row,read),(row,bad),[("state['live_token'] == state['selected_token']",'True')],lambda x:x=='available')
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
                [('state[k] for k in REBUILD_GATES',f"state[k] for k in REBUILD_GATES if k != {gate!r}")],lambda x:x!=rebuild['old_publication'])
        add('rebuild.version',family+':rebuild_version','rebuild_publication',(row,rebuild),(row,dict(rebuild,version='2.0.0')),
            [("state['version'] != '1.0.0' or ",'')],lambda x:x!=rebuild['old_publication'])
        bad=change(rebuild,['new_checkpoint','frontier_revision'],2)
        add('checkpoint.outer_revision',family+':outer_revision','checkpoint_matches_original',(rebuild,),(bad,),[("checkpoint.get('frontier_revision') == token['frontier_revision']",'True')])
        bad=change(rebuild,['new_checkpoint','durable_read_token','frontier_sha256'],'d'*64)
        add('checkpoint.selected_token',family+':checkpoint_selected','checkpoint_matches_original',(rebuild,),(bad,),[("token == {k: v for k, v in selected.items() if k != 'redb_snapshot_id'}",'True')])
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
        add('history.source_selection',family+':retained_source','retained_event_valid',retained,(row,e,bad,read['live_token']),[("authority['source_selection'] == selected['source_selection']",'True')])
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
        add('payload.schema',family+':logical_schema','resolved_payload',(e,ps),(bad,ps),[("body if Draft202012Validator(schema, format_checker=FORMATS).is_valid(body) else None",'body')],lambda x:x is not None)
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
            add('payload.external_descriptor',family+':external_descriptor','resolved_payload',positive,(evt,ps,bad),no_if("descriptor['byte_size'] <= INLINE_LIMIT or storage.get('descriptor') != descriptor"),lambda x:x is not None)
            small=copy.deepcopy(e);desc=m.payload_descriptor(small['payload']);small_storage=dict(storage,body=small['payload'],descriptor=desc)
            small['payload']={};small['payload_ref']=m.payload_reference(desc)
            add('payload.external_descriptor',family+':external_below_threshold','resolved_payload',positive,(small,ps,small_storage),no_if("descriptor['byte_size'] <= INLINE_LIMIT or storage.get('descriptor') != descriptor"),lambda x:x is not None)
            bad=dict(evt,payload_ref='ref:foreign')
            add('payload.external_ref',family+':external_ref','resolved_payload',positive,(bad,ps,storage),no_if("event['payload_ref'] != payload_reference(descriptor)"),lambda x:x is not None)
        # Legacy helper fences are independently enforced as well as the actual
        # operating path. Every conjunct has its own single-fact witness.
        allowed=('current','current',True,True,False,'1.0.0')
        for i,(name,expr,value) in enumerate([
            ('token','current_token == selected_token','stale'),
            ('permission','permission',False),('source','source_present',False),
            ('withdrawal','not withdrawn',True),('version',"version == '1.0.0'",'2.0.0'),
        ]):
            index=[1,2,3,4,5][i];bad=list(allowed);bad[index]=value
            add('read_helper.'+name,family+':read_helper_'+name,'read_allowed',allowed,tuple(bad),[("return current_token == selected_token and permission and source_present and not withdrawn and version == '1.0.0'","return "+' and '.join(v for j,v in enumerate(['current_token == selected_token','permission','source_present','not withdrawn',"version == '1.0.0'"]) if j!=i))])
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
            if 'const' in shape:
                schema_probe(path,'const',change(payload,value_path,'other'))
            if 'enum' in shape:
                schema_probe(path,'enum',change(payload,value_path,'OtherState'))
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
    add('datetime.timezone','datetime:timezone','utc_datetime',('2026-11-04T12:00:00Z',),('2026-11-04T12:00:00',),[('return parsed.tzinfo is not None','return True')])
    add('datetime.parse','datetime:parse','utc_datetime',('2026-11-04T12:00:00Z',),('not-a-date',),[('except ValueError:\n        return False','except ValueError:\n        return True')])
    return probes,mutants


def container_rules(fixtures, probes):
    """Composite JSON Schema gates, using the same already authored witnesses."""
    rules={}
    for row in fixtures['families']:
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
    if probe['function']=='schema_wellformed':
        try:m.assert_schema_references(*probe[which])
        except SchemaError:return False
        return True
    if probe['function']=='schema_valid':
        schema,value=probe[which]
        schema=m.json.loads(json.dumps(schema))
        return m.Draft202012Validator(schema,format_checker=m.FORMATS).is_valid(value)
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
    probes,_=catalogue(m,fixtures)
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
              or guard=='datetime.parse' and p['guard'].startswith('schema.') and p['guard'].endswith('.format')]
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
    containers=container_rules(fixtures,probes)
    mutants.update({guard:rule['edits'] for guard,rule in containers.items()})
    schema_owners={json.loads((ROOT/r['schema']).read_text())['$id']:r['event_type'] for r in fixtures['families']}
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
            calls=sorted({n.func.id for n in ast.walk(node) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id in funcs})
            if any(isinstance(n,ast.Name) and n.id=='FORMATS' for n in ast.walk(node)):
                calls=sorted(set(calls)|{'utc_datetime'})
            return ast.dump(node)+''.join(closure(c,seen) for c in calls)
        return {name:hashlib.sha256(closure(name).encode()).hexdigest() for name in funcs}
    for guard,edits in mutants.items():
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
        prints=fingerprints(changed)
        flips=[];rejected=[];errors=[]
        expected=expected_probe_ids(guard,probes,containers)
        for p in probes:
            try:
                fn={'token_schema_valid':'read_token_validator','schema_references_valid':'assert_schema_references','schema_wellformed':'assert_schema_references','schema_valid':'resolved_payload'}.get(p['function'],p['function'])
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
