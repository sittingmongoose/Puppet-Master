"""Receipt-selection, current number and timestamp cases at Goal oracle boundaries.

Fixture issuance is separate from all reads. Each read is checked against a
complete store snapshot; none may create a receipt or mutate the store.
"""
import copy
import hashlib
import json
import pickle
from dataclasses import asdict
from pathlib import Path

import pm_event_numbers as n
import pm_event_datetime as dt
import pm_goal_oracle_common as c
import pm_goal_guard_tables as tables
import pm_goal_retained as retained
from pm_goal_history_reader_fixtures import FAMILIES
from pm_goal_own_d_oracles import logical_store, provenance_original

ROOT = Path(__file__).resolve().parents[1]
REASONS = ('original_receipt_missing','original_receipt_ambiguous','original_receipt_seal',
           'original_receipt_shape','original_binding','recipe_unknown','original_verification',
           'caller_recipe_override','current_disclosure')


def digest(value):
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


def check_read(value):
    store = value['store']
    before = digest(store)
    reason = None
    try:
        retained.resolve(store, value['event'], value['storage'],
                         recipe_override=value.get('recipe_override'))
    except n.Refusal as refusal:
        reason = refusal.reason
    g = c.Gates()
    for code in REASONS:
        g.require('retained/'+code, reason != code)
    if reason is not None and reason not in REASONS:
        raise ValueError('unexpected retained refusal: '+reason)
    # A changed store is a harness postcondition failure, never an expected
    # product refusal and never a mutation kill.
    after = digest(store)
    if after != before:
        raise AssertionError('retained read mutated the store')
    return dict(errors=g.errors,store_snapshot_sha256=before,store_after_sha256=after)


def originals():
    for key in FAMILIES:
        fixture = c.load(ROOT/('Plans/goal_'+key+'_history_contract_fixtures.json'))
        base = next(x['input'] for x in c.materialize_cases(fixture['protocol_cases']) if x['valid'])
        base = provenance_original(key, base)
        store = logical_store(key, base)
        yield FAMILIES[key][0], dict(event=copy.deepcopy(store['original_value']),
            storage=store['custody']['storage_instance_id'],store=store)
    # Separate TEST_ONLY issuance for the three current families. These are
    # conditional publication originals, not reconstructions of the archived
    # first receipt or its full-value commitment. No read issues these bytes.
    goal = c.load(ROOT/'Plans/goal_start_command_contract_fixtures.json')
    record = next(x['value']['record'] for x in goal['cases']
                  if isinstance(x['value'],dict) and x['value'].get('record',{}).get('original_publication'))
    deleted = c.load(ROOT/'Plans/restore_point_deleted_contract_fixtures.json')['value_shape_cases'][0]['value']
    run = c.load(ROOT/'Plans/run_started_consumer_contract_fixtures.json')['base']['event']
    for event in (record['producer_input'],deleted['frozen_append_input'],run):
        event = copy.deepcopy(event)
        event.update(sequence_id=1,observed_at_utc='2026-11-14T12:00:00Z',persisted_at_utc='2026-11-14T12:00:00Z')
        storage = '11111111-1111-4111-8111-111111111111'
        custody = dict(fixture='TEST_ONLY conditional original publication',event_id=event['event_id'],
                       sequence_id=event['sequence_id'],acknowledged_at_utc='2026-11-14T12:00:00Z')
        issued = retained.issue(event,storage,custody)
        store = dict(original_value=copy.deepcopy(event),custody=custody,content_permitted=True,
                     storage_instance_id=storage,sealed_receipts=[issued],
                     installed_recipes=[issued['original']['recipe']])
        yield event['event_type'],dict(event=event,storage=storage,store=store)


def current_number(value):
    """Complete number boundary: type/bounds, producer bytes and stored bytes.

    Uses a real run.started envelope. Sequence metadata never enters JCS.
    Arbitrary-precision current integers have no invented general ceiling;
    the owner's uint64 storage slot and producer codec decide representability.
    """
    ev = value['event']
    g = c.Gates()
    reason = None
    try:
        if value['field'] == 'sequence_id':
            n.storage_uint64(ev['sequence_id'])
        else:
            n.current_integer(ev[value['field']], minimum=0)
    except n.Refusal as refusal:
        reason = refusal.reason
    for code in ('integer_type','integer_range'):
        g.require('numbers/'+value['field']+'/'+code, reason != code)
    if g.errors:
        return g.errors
    try:
        n.producer_semantic_bytes(ev)
        reason = None
    except n.Refusal as refusal:
        reason = refusal.reason
    g.require('numbers/producer_representable', reason is None)
    if g.errors:
        return g.errors
    try:
        n.storage_value_bytes(ev)
        reason = None
    except n.Refusal as refusal:
        reason = refusal.reason
    g.require('numbers/storage_representable', reason is None)
    return g.errors


def timestamp(value):
    # E5-2: acknowledged_at_utc is EventRecord, never storage_utc_z.
    profile = dt.STORAGE_UTC_Z if value['field'] in ('observed_at_utc','persisted_at_utc') else dt.EVENT_RECORD
    try:
        dt.date_time(value['value'], profile=profile)
        holds = True
    except n.Refusal:
        holds = False
    g = c.Gates()
    g.require('datetime/'+value['field']+'/'+profile, holds)
    return g.errors


def main():
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_guard_sweep.py --source pm_goal_shared_oracles')
    start = len(collector.failures)
    for family, base in originals():
        collector.invoke(family+'/receipt/valid', check_read, base, True)
        for kind in ('missing','ambiguous','another_original','bad_seal','bad_shape','wrong_original_bytes',
                     'unknown_recipe','foreign_store','override','access'):
            value = copy.deepcopy(base)
            store = value['store']
            if kind == 'missing':
                store['sealed_receipts'] = []
            elif kind == 'ambiguous':
                store['sealed_receipts'] *= 2
            elif kind == 'another_original':
                store['sealed_receipts'][0]['original']['binding']['event_id'] += ':foreign'
            elif kind == 'bad_seal':
                store['sealed_receipts'][0]['seal'] = '0'*64
            elif kind == 'bad_shape':
                store['sealed_receipts'][0]['original'] = {'binding':{'event_id':value['event']['event_id']}}
            elif kind == 'wrong_original_bytes':
                store['original_value']['actor_ref'] += ':foreign'
            elif kind == 'unknown_recipe':
                store['installed_recipes'] = []
            elif kind == 'foreign_store':
                value['storage'] = '22222222-2222-4222-8222-222222222222'
            elif kind == 'override':
                value['recipe_override'] = 'caller-selected'
            elif kind == 'access':
                store['content_permitted'] = False
            collector.invoke(family+'/receipt/'+kind, check_read, value, False)
    run = c.load(ROOT/'Plans/run_started_consumer_contract_fixtures.json')['base']['event']
    corpus = c.load(ROOT/'Plans/event_number_recipe_corpus.json')
    from pm_event_numbers_corpus import _value
    for field, op in [('producer_sequence_id','integer'),('sequence_id','uint64')]:
        for case in (x for x in corpus['cases'] if x['op'] == op and 'value' in x):
            value = _value(case['value'])
            ev = copy.deepcopy(run)
            ev[field] = value
            # Expectations are authored shared grammar + this owner's bound.
            expected = 'error' not in case
            if op == 'integer' and case.get('error') == 'integer_range' and type(value) is int and value >= 0:
                # range-11 belongs to the corpus's illustrative 0..10 owner.
                # Goal producer_sequence_id has minimum 0 and no upper cap.
                expected = True
            if op == 'integer' and type(value) is int and value < 0:
                expected = False
            collector.invoke('shared-corpus/'+field+'/'+case['id'], current_number,dict(event=ev,field=field),expected)
    event = copy.deepcopy(run)
    event['producer_sequence_id'] = (1<<53)+1
    collector.invoke('shared-corpus/producer_sequence_id/jcs_loss_within_physical_range',current_number,
                     dict(event=event,field='producer_sequence_id'),False)
    huge = n.current_integer_token('9'*4400)
    for field in ('sequence_id','producer_sequence_id'):
        event = copy.deepcopy(run)
        event[field] = huge
        collector.invoke('shared-corpus/'+field+'/4400_digits',current_number,dict(event=event,field=field),False)
    event = copy.deepcopy(run)
    event['producer_sequence_id'] = 10**20
    collector.invoke('shared-corpus/producer_sequence_id/physical_overflow_after_jcs',current_number,
                     dict(event=event,field='producer_sequence_id'),False)
    values = [
        ('utc','2026-11-14T12:00:00Z',True,True),
        ('offset','2026-11-14T12:00:00+05:30',True,False),
        ('lower','2026-11-14t12:00:00z',True,False),
        ('fraction','2026-11-14T12:00:00.'+'1'*80+'Z',True,True),
        ('leap','2017-01-01T05:29:60+05:30',True,False),
        ('bad_day','2026-02-30T12:00:00Z',False,False),
        ('bad_hour','2026-11-14T24:00:00Z',False,False),
    ]
    for field in ('occurred_at_utc','observed_at_utc','persisted_at_utc','acknowledged_at_utc'):
        for label, text, event, storage in values:
            expected = storage if field in ('observed_at_utc','persisted_at_utc') else event
            collector.invoke('datetime/'+field+'/'+label,timestamp,dict(field=field,value=text),expected)
    # Exercise the actual scheduling chronology helper, including the
    # spellings that Python datetime cannot represent or truncates.
    from pm_goal_history_reader_fixtures import original_row_guards
    scheduled=c.load(ROOT/'Plans/goal_scheduled_history_contract_fixtures.json')
    sample=next(x['input'] for x in c.materialize_cases(scheduled['protocol_cases']) if x['valid'] and x['input']['source']['event']['payload']['payload']['next_action']=='dispatch')
    def chronology(value):
        gate=c.Gates();original_row_guards(value['event'],value['event']['payload'],value['original'],gate);return gate.errors
    pairs=[('leap','2016-12-31T23:59:60Z','2017-01-01T00:00:00Z',True),
           ('year_zero','0000-01-01T00:00:00Z','0001-01-01T00:00:00Z',True),
           ('offset_equivalence','2017-01-01T05:29:60+05:30','2016-12-31T23:59:60Z',True),
           ('fraction_4400','2026-11-14T12:00:00.'+'1'*4400+'Z','2026-11-14T12:00:00.'+'2'*4400+'Z',True),
           ('fraction_order','2026-11-14T12:00:00.000000002Z','2026-11-14T12:00:00.000000001Z',False)]
    for label,before,after,valid in pairs:
        value=dict(event=copy.deepcopy(sample['source']['event']),original=copy.deepcopy(sample['original']))
        value['event']['payload']['payload']['eligible_at_utc']=before
        value['event']['observed_at_utc']=after
        collector.invoke('datetime/scheduled-chronology/'+label,chronology,value,valid)
    return int(len(collector.failures)>start)
