#!/usr/bin/env python3
"""DCH static contract checks. No admission, frozen validator or runtime simulation."""
import copy
import base64
import binascii
import hashlib
import json
from pathlib import Path
import re
import sys
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]

def identity(event, payload, storage_instance='storage-fixture'):
    parts = [event, '1.0.0', storage_instance, payload['scope'], payload['computer_id'], payload['thread_id'], payload['operation_id']]
    # Fixture inputs have no floating point; this is the RFC8785 subset.
    value = json.dumps(parts, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
    return 'evt_dch_' + hashlib.sha256(value).hexdigest()

def valid_scope_partition(scope):
    """CV-365 semantic join, independent of schema shape/envelope equality."""
    if scope['scope_kind'] == 'application':
        return scope['scope_partition'] == 'app' and all(
            scope[key] is None for key in ['project_id', 'project_home_server_id', 'named_plan_id'])
    project_id = scope['project_id']
    partition = scope['scope_partition']
    if scope['scope_kind'] != 'project' or not isinstance(project_id, str) or not project_id:
        return False
    if not partition.startswith('project~'):
        return False
    encoded = partition[len('project~'):]
    if not re.fullmatch(r'[A-Za-z0-9_-]+', encoded):
        return False
    try:
        decoded = base64.b64decode(encoded + '=' * (-len(encoded) % 4), altchars=b'-_', validate=True)
        exact = project_id.encode('utf-8')
        return (decoded.decode('utf-8') == project_id and decoded == exact
                and base64.urlsafe_b64encode(exact).decode('ascii').rstrip('=') == encoded)
    except (ValueError, UnicodeError, binascii.Error):
        return False

def idempotency_key(event, payload):
    if payload['scope']['scope_kind'] == 'application':
        return ('application@1:' + payload['scope']['server_id'].encode('utf-8').hex()
                + ':' + payload['operation_id'].encode('utf-8').hex())
    return 'dch:' + identity(event, payload)[len('evt_dch_'):]

def joins(record, event):
    p = record['payload']
    expected = {'event_type': event, 'event_id': identity(event, p),
                'idempotency_key': idempotency_key(event, p), 'payload_schema_id': p['schema_id'],
                'scope_kind': p['scope']['scope_kind'], 'project_id': p['scope']['project_id'],
                'thread_id': p['thread_id'], 'actor_ref': p['actor_ref'], 'occurred_at_utc': p['ts'],
                'payload_ref': None, 'run_id': None, 'node_id': None, 'attempt_id': None}
    return valid_scope_partition(p['scope']) and all(record[k] == value for k, value in expected.items())

def retry_outcome(original, retry, available=True):
    """Static CV-366 oracle; does not exercise a writer, receipt or real dedupe store."""
    if not available:
        return 'dedupe_unavailable'
    def lifetime(r):
        return (r['payload']['scope']['scope_partition'], r['event_type'], r['idempotency_key'])
    if lifetime(original) != lifetime(retry):
        return 'distinct_operation'
    return 'original_result' if original == retry else 'conflict'

def archive_joins(payload, source):
    """Static original request/commit fixture joins; never an authorization receipt."""
    before, after, request = source['before'], source['after'], source['request']
    return (payload['archive_origin'] == 'manual' and payload['command_id'] == 'cmd.chat.archive'
            and request['origin'] == 'manual' and request['command_id'] == payload['command_id']
            and request['permission_allowed'] and request['thread_selected'] and not before['active_run']
            and before['state'] in ['active', 'suspended'] and payload['previous_state'] == before['state']
            and payload['state'] == after['state'] == 'archived' and after['readback_available']
            and payload['expected_thread_revision'] == before['revision'] == request['expected_revision']
            and payload['committed_thread_revision'] == after['revision'] == before['revision'] + 1
            and payload['thread_record_ref'] == after['record_ref']
            and all(obj[key] == payload[key] for obj in [before, after, request]
                    for key in ['thread_id', 'computer_id', 'scope', 'operation_id']))

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
            check(validator.is_valid(p) and valid_scope_partition(p['scope']), event+': '+case['edition']+' positive')
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
            for oracle in case.get('partition_oracles', []):
                scope=copy.deepcopy(p['scope']); scope.update(project_id=oracle['project_id'], scope_partition=oracle['scope_partition'])
                check(valid_scope_partition(scope)==oracle['expected_valid'],event+': partition '+oracle['name'])
                if oracle['expected_valid']:
                    # Also validate complete non-ASCII/punctuation payloads and their records.
                    sample=copy.deepcopy(case['record']); sample['payload']['scope']=scope
                    sample['project_id']=scope['project_id']; sample['event_id']=identity(event,sample['payload'])
                    sample['idempotency_key']=idempotency_key(event,sample['payload'])
                    check(validator.is_valid(sample['payload']) and joins(sample,event),event+': partition record '+oracle['name'])
        check(len(set(ids))==2,event+': separated scope identities')
        for doc, unit_key in [('assistant-chat-design.md','owner_unit'),('Contracts_V0.md','payload_unit'),('storage-plan.md','storage_unit')]:
            text=(ROOT/'Plans'/doc).read_text()
            check('plan_unit_id: '+row[unit_key] in text,event+': owner '+unit_key)
        storage=(ROOT/'Plans/storage-plan.md').read_text().split('### '+row['storage_unit']+' — ',1)[1].split('```yaml',1)[0]
        for token in ['SP-278','SP-286','PENDING_RETENTION_DECISION',row['reader'],row['projector'],'Withdrawal']:
            check(token in storage,event+': adoption '+token)
    envelope=Draft202012Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()), format_checker=FormatChecker())
    for case in fixtures:
        record=case['record']; event=case['event_type']
        check(envelope.is_valid(record) and joins(record,event) and record['payload']==case['valid'], event+': envelope and source joins')
        for key in ['event_type','event_id','idempotency_key','payload_schema_id','scope_kind','project_id','thread_id','actor_ref','occurred_at_utc','payload_ref','run_id','node_id','attempt_id']:
            invalid=copy.deepcopy(record);invalid[key]='wrong'
            check(not joins(invalid,event),event+': envelope mismatch '+key)
        for oracle in case['retry_oracles']:
            retry=copy.deepcopy(record)
            for key,value in oracle.get('payload_changes',{}).items():
                retry['payload'][key]=value
            if 'actor_ref' in oracle.get('payload_changes',{}): retry['actor_ref']=retry['payload']['actor_ref']
            check(retry_outcome(record,retry,oracle.get('dedupe_available',True))==oracle['expected'],event+': retry '+oracle['name'])
            if oracle['expected'] in ['conflict','original_result']:
                check(joins(retry,event),event+': retry preserves key '+oracle['name'])
        if case['edition']=='application':
            invalid=copy.deepcopy(record);invalid['idempotency_key']='dch:'+identity(event,invalid['payload'])[len('evt_dch_'):]
            check(not joins(invalid,event),event+': reject incompatible application dch key')
            for key in ['server_id','operation_id']:
                changed=copy.deepcopy(record['payload'])
                if key=='server_id': changed['scope'][key]+=':other'
                else: changed[key]+=':other'
                check(idempotency_key(event,changed)!=record['idempotency_key'],event+': application original '+key)
        else:
            for oracle in case['partition_oracles']:
                if oracle['expected_valid']: continue
                # Keep envelope/identity internally consistent: the scope encoding alone must fail.
                invalid=copy.deepcopy(record);invalid['payload']['scope'].update(project_id=oracle['project_id'],scope_partition=oracle['scope_partition'])
                invalid['project_id']=oracle['project_id'];invalid['event_id']=identity(event,invalid['payload']);invalid['idempotency_key']=idempotency_key(event,invalid['payload'])
                check(not joins(invalid,event),event+': reject self-consistent wrong partition '+oracle['name'])
        if event=='chat.thread_archived':
            check(archive_joins(record['payload'],case['archive_source']),event+': archive original source joins')
            validator=Draft202012Validator(json.loads((ROOT/'Plans/dch_event_payloads/chat_thread_archived.schema.json').read_text()),format_checker=FormatChecker())
            for oracle in case['archive_oracles']:
                p=copy.deepcopy(record['payload']); source=copy.deepcopy(case['archive_source'])
                for path,value in oracle['changes'].items():
                    target={'payload':p,'source':source};parts=path.split('.')
                    for part in parts[:-1]: target=target[part]
                    target[parts[-1]]=value
                check((validator.is_valid(p) and archive_joins(p,source))==oracle['expected_valid'],event+': archive '+oracle['name'])
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
