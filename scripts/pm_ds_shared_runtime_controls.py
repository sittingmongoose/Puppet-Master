"""Exact shared candidate seams; program budget test grants no family adoption."""
import copy
import json
import pm_event_authority_ds_round2 as ds
import pm_event_authority_ds_round3 as d3


def cases():
    gate,context,bases=d3.bases();rows=[]
    def add(uid,label,event,producer,store=None):
        def errors():return gate.candidate_failures(copy.deepcopy(event),producer,context,payload_store=store)
        rows.append({'id':'NEG-'+uid+':shared:'+label,'entry':lambda:not errors(),'errors':errors})
    for model,base in bases:
        producer=base['witness']['producer_component']
        event=copy.deepcopy(base['event']);event['payload_schema_id']='pm.foreign.payload.v1'
        add('U064',model.EVENT_TYPE+':payload_schema_identity',event,producer)
        event=copy.deepcopy(base['event']);event['redaction_profile']='redacted'
        add('U066',model.EVENT_TYPE+':redaction_profile',event,producer)
        event=copy.deepcopy(base['event'])
        event['migration']={'migrated_from_schema_id':'pm.legacy.browser.v0','migrated_from_schema_version':'0.0.0',
                            'migration_id':'migration:foreign-current-writer','compatibility_event_type':model.EVENT_TYPE}
        add('U066',model.EVENT_TYPE+':current_migration_descriptor',event,producer)
    # This exercises the existing shared prepared-candidate budget at an actual
    # program payload shape. It is a negative representation control, not a
    # current writer, admission, EventRecord-v3 adoption or operating consumer.
    source=next(c for c in gate.load_json('Plans/browser_event_admission_fixtures.json')['valid'] if c['event_type']=='browser.program.started')
    event=gate.fixture_event(source,1)
    event['payload']['artifact_refs']=[('artifact:%03d:'%i).ljust(512,'x') for i in range(64)]
    event['payload']['facts'].update(completed_action_ids=[('a%03d'%i).ljust(192,'x') for i in range(256)],
                                     unknown_effect_action_ids=[],effect_state='effects_reconciled')
    assert len(json.dumps(event['payload'],separators=(',',':'),ensure_ascii=False).encode())>65536
    objects={};event=ds.route.encode(event,objects)
    producer=next(r['producer_component'] for r in context[0]['rows'] if r['event_type']==event['event_type'])
    add('U067','schema_valid_program_reference_over_JSON_budget',event,producer,objects)
    return rows
