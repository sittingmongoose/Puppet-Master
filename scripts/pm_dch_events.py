#!/usr/bin/env python3
"""DCH static contract checks. No admission, frozen validator or runtime simulation."""
import copy
import hashlib
import json
from pathlib import Path
import sys
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]

def identity(event, payload, storage_instance='storage-fixture'):
    parts = [event, '1.0.0', storage_instance, payload['scope'], payload['computer_id'], payload['thread_id'], payload['operation_id']]
    # Fixture inputs are ASCII without floating point; this is the RFC8785 subset.
    value = json.dumps(parts, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
    return 'evt_dch_' + hashlib.sha256(value).hexdigest()

def main():
    contracts = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    fixtures = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    registry = json.loads((ROOT/'Plans/event_family_registry.json').read_text())
    failures = []
    checks = 0
    def check(ok, label):
        nonlocal checks
        checks += 1
        if not ok:
            failures.append(label)
    for row in contracts:
        event = row['event_type']
        check(event not in [f['event_type'] for f in registry['families']], event+': absent registry')
        if row['outcome']=='blocked_on_Jared':
            continue
        schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        cases = [f for f in fixtures if f['event_type']==event]
        check(len(cases)==2, event+': two editions')
        ids = []
        for case in cases:
            p = case['valid']
            check(validator.is_valid(p), event+': '+case['edition']+' positive')
            ids.append(identity(event, p))
            for field in case['missing_fields']:
                invalid=copy.deepcopy(p); del invalid[field]
                check(not validator.is_valid(invalid), event+': missing '+field)
            for name in ['extra_field','wrong_version','scope_mismatch']:
                invalid=copy.deepcopy(p)
                if name=='extra_field': invalid['unexpected']=True
                if name=='wrong_version': invalid['schema_version']='9.0.0'
                if name=='scope_mismatch': invalid['scope']['project_id']='alien' if case['edition']=='application' else None
                check(not validator.is_valid(invalid),event+': '+name)
            # Operation identity is independent of payload result: changed content
            # must be compared using the persisted semantic digest, never re-keyed.
            invalid=copy.deepcopy(p); invalid['actor_ref']='pmref:fixture:other_actor'
            check(identity(event,p)==identity(event,invalid),event+': stable retry key')
            check(hashlib.sha256(json.dumps(p,sort_keys=True).encode()).digest()!=hashlib.sha256(json.dumps(invalid,sort_keys=True).encode()).digest(), event+': changed semantics digest')
        check(len(set(ids))==2,event+': separated scope identities')
        for doc, unit_key in [('assistant-chat-design.md','owner_unit'),('Contracts_V0.md','payload_unit'),('storage-plan.md','storage_unit')]:
            text=(ROOT/'Plans'/doc).read_text()
            check('plan_unit_id: '+row[unit_key] in text,event+': owner '+unit_key)
        storage=(ROOT/'Plans/storage-plan.md').read_text().split('### '+row['storage_unit']+' — ',1)[1].split('```yaml',1)[0]
        for token in ['SP-278','SP-286','PENDING_RETENTION_DECISION',row['reader'],row['projector'],'Withdrawal']:
            check(token in storage,event+': adoption '+token)
    envelope=Draft202012Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()), format_checker=FormatChecker())
    def joins(record, event):
        p=record['payload']; eid=identity(event,p)
        expected={'event_type':event,'event_id':eid,'idempotency_key':'dch:'+eid[len('evt_dch_'):], 'payload_schema_id':p['schema_id'],'scope_kind':p['scope']['scope_kind'],'project_id':p['scope']['project_id'],'thread_id':p['thread_id'],'actor_ref':p['actor_ref'],'occurred_at_utc':p['ts'],'payload_ref':None,'run_id':None,'node_id':None,'attempt_id':None}
        return all(record[k]==value for k,value in expected.items())
    for case in fixtures:
        record=case['record']; event=case['event_type']
        check(envelope.is_valid(record) and joins(record,event), event+': envelope and source joins')
        for key in ['event_type','event_id','idempotency_key','payload_schema_id','scope_kind','project_id','thread_id','actor_ref','occurred_at_utc','payload_ref','run_id','node_id','attempt_id']:
            invalid=copy.deepcopy(record);invalid[key]='wrong'
            check(not joins(invalid,event),event+': envelope mismatch '+key)
    for case in json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text()):
        schema=json.loads((ROOT/case['schema_ref'].split('#')[0]).read_text())
        validator=Draft202012Validator(schema, format_checker=FormatChecker())
        check(validator.is_valid(case['valid']), case['event_type']+': checkpoint positive')
        for name in case['negative_cases']:
            invalid=copy.deepcopy(case['valid'])
            if name=='persisted_redb_snapshot_id': invalid['source_token']['redb_snapshot_id']='forbidden'
            if name=='wrong_consumer': invalid['consumer_id']='sibling'
            if name=='wrong_projector': invalid['projector_id']='sibling'
            if name=='missing_source_token': del invalid['source_token']
            if name=='four_generations': invalid['history']=[{}, {}, {}]
            check(not validator.is_valid(invalid), case['event_type']+': '+name)
    print(json.dumps({'status':'pass' if not failures else 'fail','checks':checks,'failures':failures,'native_execution':'NOT_RUN','coverage':'Static payload/identity/declaration checks only. Native receipt, CAS, replay, custody and withdrawal are NOT_RUN.'},indent=2))
    return bool(failures)

if __name__=='__main__':
    sys.exit(main())
