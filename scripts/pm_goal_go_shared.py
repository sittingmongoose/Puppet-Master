"""C12-GO shared boundaries for goal.created, restore_point.deleted and run.started (lane 18).

1. Retained reads (SP-1101): the original is selected only through its
   independently sealed receipt and installed recipe (pm_goal_retained); every
   read records a complete store digest before and after; none issues a
   receipt. Ten declared-target negatives per family (GH1's READ_TARGETS).
2. The shared number corpus (G6) through each family's own complete checker,
   at integer slots its originals populate, every case a coherent complete
   original (coupled copies and re-derived digests). The expectation is fixed
   before the call from the corpus case, the owner schema bound/const at the
   slot, and the shared codec's representability (pm_event_numbers):
   * goal.created custody: goal_revision (payload, body commit, owner result:
     const 1), accepted_objective_revision (const 1), first-receipt sequence_id
     (four copies, minimum 0, inside the RFC 8785 custody digests),
     source owner_epoch (two copies, minimum 0, inside the source digests);
   * goal.created SP-298 reader: the matching frame's sequence_id (Storage
     uint64 admission grammar, shared storage_uint64);
   * run.started consumer: EventRecord sequence_id (envelope, index, cursor,
     coverage and index-key copies; owner minimum 0, no maximum) and
     producer_sequence_id (nullable, minimum 0, inside the producer digest);
   * restore_point.deleted retained read: the receipt-selected terminal
     companion append receipt sequence_id (shared Storage unsigned codec).
3. The shared date-time corpus (default EventRecord profile, E5-2) at
   goal.created's occurred_at_utc and first-receipt acknowledged_at_utc, with
   the CV-341 order rows as the coupled owner facts.
The repository-wide date-time inventory is NOT_RUN on this base (TOOL-ISSUES
C12-DC1-DTGATE-ROTATION; the base predates S1's T198 refresh).
"""
import copy
import hashlib
import pickle
from pathlib import Path

import pm_event_numbers as n
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as c
import pm_goal_retained as retained
from pm_event_numbers_corpus import _value
from pm_goal_time import instant

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / 'Plans'
HUGE = 10 ** 4400 - 1
READ_TARGETS = dict(missing='original_receipt_missing', ambiguous='original_receipt_ambiguous',
                    another_original='original_receipt_missing', bad_seal='original_receipt_seal',
                    bad_shape='original_receipt_shape', wrong_original_bytes='original_verification',
                    unknown_recipe='recipe_unknown', foreign_store='original_binding',
                    override='caller_recipe_override', access='current_disclosure')
GO_EVIDENCE = {}


# --------------------------------------------------------------------------- retained reads

def originals():
    """TEST_ONLY conditional original publication for the three GO families (as s3ao)."""
    goal = c.load(PLANS / 'goal_start_command_contract_fixtures.json')
    record = next(x['value']['record'] for x in goal['cases']
                  if isinstance(x['value'], dict) and x['value'].get('record', {}).get('original_publication'))
    deleted = c.load(PLANS / 'restore_point_deleted_contract_fixtures.json')['value_shape_cases'][0]['value']
    run = c.load(PLANS / 'run_started_consumer_contract_fixtures.json')['base']['event']
    for event in (record['producer_input'], deleted['frozen_append_input'], run):
        event = copy.deepcopy(event)
        event.update(sequence_id=1, observed_at_utc='2026-11-14T12:00:00Z', persisted_at_utc='2026-11-14T12:00:00Z')
        storage = '11111111-1111-4111-8111-111111111111'
        custody = dict(fixture='TEST_ONLY conditional original publication', event_id=event['event_id'],
                       sequence_id=event['sequence_id'], acknowledged_at_utc='2026-11-14T12:00:00Z')
        issued = retained.issue(event, storage, custody)
        store = dict(original_value=copy.deepcopy(event), custody=custody, content_permitted=True, storage_instance_id=storage,
                     sealed_receipts=[issued], installed_recipes=[issued['original']['recipe']])
        yield event['event_type'], dict(event=event, storage=storage, store=store)


def reads(collector):
    from pm_goal_shared_oracles import check_read
    count = 0
    for family, base in originals():
        collector.invoke(family + '/receipt/valid', check_read, base, True, family=family)
        for kind, code in READ_TARGETS.items():
            value = copy.deepcopy(base)
            store = value['store']
            if kind == 'missing':
                store['sealed_receipts'] = []
            elif kind == 'ambiguous':
                store['sealed_receipts'] *= 2
            elif kind == 'another_original':
                store['sealed_receipts'][0]['original']['binding']['event_id'] += ':foreign'
            elif kind == 'bad_seal':
                store['sealed_receipts'][0]['seal'] = '0' * 64
            elif kind == 'bad_shape':
                store['sealed_receipts'][0]['original'] = {'binding': {'event_id': value['event']['event_id']}}
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
            collector.invoke(family + '/receipt/' + kind, check_read, value, False, target='retained/' + code, family=family)
            count += 1
    return count


# --------------------------------------------------------------------------- number corpus

def corpus():
    out = []
    for case in c.load(PLANS / 'event_number_recipe_corpus.json')['cases']:
        if case['op'] in ('integer', 'uint64') and 'value' in case:
            out.append((case['op'] + '/' + case['id'], _value(case['value'])))
    out += [('probe/4400_digits', HUGE), ('probe/integral_float_one', 1.0), ('probe/negative_zero_float', -0.0),
            ('probe/two_pow_53', 1 << 53), ('probe/two_pow_53_plus_one', (1 << 53) + 1)]
    return out


def is_int(value):
    """The current-integer grammar the corpus fixes (CV-1100): a JSON integer, never bool/float/string."""
    return type(value) is int


def jcs_ok(value):
    try:
        n.qualified_jcs({'v': value})
        return True
    except n.Refusal:
        return False


def put(root, path, value):
    node = root
    for part in path[:-1]:
        node = node[part]
    node[path[-1]] = value


def created_numbers(collector, created):
    fixture = c.load(PLANS / 'goal_start_command_contract_fixtures.json')
    base = next(x['value'] for x in fixture['cases'] if x['id'] == 'successful_original_settlement_row')
    schema_row = created.checks().custody.row
    slots = {
        'goal_revision': [('producer_input', 'payload', 'goal_revision'), ('body_commit', 'goal_revision'), ('owner_result', 'goal_revision')],
        'accepted_objective_revision': [('producer_input', 'payload', 'accepted_objective_revision')],
        'first_receipt_sequence_id': [(where, 'first_append_receipt', 'sequence_id') for where in ('original_publication',)]
        + [('original_publication', 'original_append_result', 'sequence_id'),
           ('owner_result', 'creation_receipt', 'first_append_receipt', 'sequence_id'),
           ('owner_result', 'creation_receipt', 'original_append_result', 'sequence_id')],
        'source_owner_epoch': [('original_source', 'owner_epoch'), ('current_source', 'owner_epoch')],
    }
    count = 0
    for slot, paths in slots.items():
        for label, value in corpus():
            case = copy.deepcopy(base)
            for path in paths:
                put(case['record'], path, copy.deepcopy(value))
            # The producer re-derives every digest it could form; one it could not form keeps the
            # original bytes, so the stored digest no longer matches (no digest is invented).
            r = case['record']
            for field, of in (('original_source_sha256', r['original_source']), ('current_source_sha256', r['current_source']),
                              ('producer_semantic_sha256', r['producer_input'])):
                digest = created.H(of)
                if digest is not None:
                    r[field] = digest
            digest = created.H(r['owner_result'])
            if digest is not None:
                r['command_outcome']['owner_result_sha256'] = digest
            # Expectation, fixed before the call: the owner node at the slot (`const: 1` with JSON-Schema numeric
            # equality for the revisions; `type: integer, minimum: 0` under the CV-1100 current-integer grammar
            # elsewhere), then CV-1100 at the type-less literals, then the RFC 8785 custody digests the producer
            # could not form (their stored bytes are kept, so those digest rows refuse).
            if slot in ('goal_revision', 'accepted_objective_revision'):
                schema_ok = type(value) is not bool and (type(value) in (int, float) or type(value).__name__ == 'Decimal') \
                    and value == 1
            else:
                schema_ok = is_int(value) and value >= 0
            if not schema_ok:
                ok, target = False, schema_row
            else:
                expected = set()
                if slot in ('goal_revision', 'accepted_objective_revision') and not is_int(value):
                    expected.add('goal.created/current_integers')
                for row_name, container in (('goal.created/digest/original_source', r['original_source']),
                                            ('goal.created/digest/current_source', r['current_source']),
                                            ('goal.created/digest/producer_semantic', r['producer_input']),
                                            ('goal.created/outcome/owner_result_sha256', r['owner_result'])):
                    if created.H(container) is None:
                        expected.add(row_name)
                ok = not expected
                target = None if ok else (next(iter(expected)) if len(expected) == 1 else tuple(sorted(expected)))
            collector.invoke('goal.created/numbers/custody/' + slot + '/' + label, created.custody, case, ok,
                             target=target, family='goal.created')
            count += 1
    # SP-298 reader: one matching frame whose sequence_id carries the case; every source proof coherent.
    world = created.reader_world()
    world['source']['frames'] = [world['source']['frames'][1]]
    for label, value in corpus():
        case = copy.deepcopy(world)
        created.coherent_frame(case, 0, lambda e, v=value: e.__setitem__('sequence_id', copy.deepcopy(v)))
        u64 = is_int(value) and 0 <= value <= (1 << 64) - 1
        targets = set() if u64 else {'goal.created/reader/admission/frame_sequence'}
        if case['source']['frames'][0]['value_sha256'] is None:
            targets.add('goal.created/reader/admission/frame_values')
        target = None if not targets else (next(iter(targets)) if len(targets) == 1 else tuple(sorted(targets)))
        collector.invoke('goal.created/numbers/reader/sequence_id/' + label, created.read, case, u64, target=target,
                         family='goal.created')
        count += 1
    return count


def created_datetimes(collector, created):
    fixture = c.load(PLANS / 'goal_start_command_contract_fixtures.json')
    base = next(x['value'] for x in fixture['cases'] if x['id'] == 'successful_original_settlement_row')
    schema_row = created.checks().custody.row
    cases = [x for x in c.load(PLANS / 'event_number_recipe_corpus.json')['cases']
             if x['op'] == 'datetime' and x.get('profile') is None]
    ack = instant(base['record']['original_publication']['first_append_receipt']['acknowledged_at_utc'])
    occurred = instant(base['record']['producer_input']['occurred_at_utc'])
    settled = instant(base['record']['command_outcome']['observed_at'])
    count = 0
    for case in cases:
        text = case['value']
        grammar = 'error' not in case
        for slot, paths in (('occurred_at_utc', [('producer_input', 'occurred_at_utc')]),
                            ('acknowledged_at_utc', [('original_publication', 'first_append_receipt', 'acknowledged_at_utc'),
                                                     ('owner_result', 'creation_receipt', 'first_append_receipt', 'acknowledged_at_utc')])):
            value = copy.deepcopy(base)
            for path in paths:
                put(value['record'], path, text)
            created.rehash(value)
            if not grammar:
                ok, target = False, schema_row
            else:
                moment = instant(text)
                if slot == 'occurred_at_utc':
                    ok = moment <= ack
                    target = None if ok else 'goal.created/order/body_before_receipt'
                elif moment < occurred:
                    ok, target = False, 'goal.created/order/body_before_receipt'
                elif moment > settled:
                    ok, target = False, 'goal.created/order/receipt_before_settlement'
                else:
                    ok, target = True, None
            collector.invoke('goal.created/datetime/' + slot + '/' + case['id'], created.custody, value, ok,
                             target=target, family='goal.created')
            count += 1
    return count


def run_numbers(collector, run_started):
    fixture = c.load(PLANS / 'run_started_consumer_contract_fixtures.json')
    base = next(x['bundle'] for x in fixture['static_join_cases'] if x['expect_valid'])
    boundary = run_started.bundle_boundary
    rows = run_started.CHECKS
    count = 0
    part = base['index']['scope_partition']
    for label, value in corpus():
        case = copy.deepcopy(base)
        e = case['event']
        e['sequence_id'] = copy.deepcopy(value)
        case['index']['sequence_id'] = copy.deepcopy(value)
        case['index']['source_locator']['sequence_id'] = copy.deepcopy(value) if 'sequence_id' in case['index']['source_locator'] else None
        if case['index']['source_locator'].get('sequence_id') is None:
            case['index']['source_locator'].pop('sequence_id', None)
        case['checkpoint']['source_cursor']['last_sequence_id'] = copy.deepcopy(value)
        grammar = is_int(value) and value >= 0
        u64 = grammar and value <= (1 << 64) - 1
        if grammar:
            case['checkpoint']['first_retained_sequence_id'] = min(case['checkpoint']['first_retained_sequence_id'], value)
            case['checkpoint']['index_through_sequence_id'] = max(case['checkpoint']['index_through_sequence_id'], value)
        if u64:
            case['lookup']['index_key'] = f'event_record_index.v2:{part}:{value:020d}:{e["event_id"]}'
        ok = u64
        if not grammar:
            target = tuple(sorted({rows['envelope'].row, rows['index'].row, rows['checkpoint'].row}))
        elif not u64:
            target = 'run.started/storage_sequence_uint64'
        else:
            target = None
        collector.invoke('run.started/numbers/sequence_id/' + label, boundary, case, ok, target=target, family='run.started')
        count += 1
    for label, value in corpus() + [('probe/null', None)]:
        case = copy.deepcopy(base)
        e = case['event']
        e['producer_sequence_id'] = copy.deepcopy(value)
        grammar = value is None or (is_int(value) and value >= 0)
        digest = None
        if grammar:
            try:
                digest = n.producer_semantic_digest(e)
            except n.Refusal:
                digest = None
        if digest is not None:
            case['index']['producer_semantic_digest'] = digest
        if not grammar:
            ok, target = False, rows['envelope'].row
        elif digest is None:
            ok, target = False, 'run.started/index_producer_digest'
        else:
            ok, target = True, None
        collector.invoke('run.started/numbers/producer_sequence_id/' + label, boundary, case, ok, target=target,
                         family='run.started')
        count += 1
    return count


def deleted_numbers(collector):
    import pm_goal_deleted_retained_oracles as rr_module
    import pm_goal_deleted_components as components
    fs, rr, check, base = rr_module.RETAINED_CONTEXT
    profile = 'restore_point.deleted/retained/receipt-selected original uint64 physical profile'
    join = 'restore_point.deleted/retained/original receipt surviving event identity'
    count = 0
    original = base['store']['model'].rows['terminal_companion']['value']['append_receipt']['sequence_id']
    for label, value in corpus():
        case = copy.deepcopy(base)
        row = case['store']['model'].rows['terminal_companion']
        document = copy.deepcopy(row['value'])
        document['append_receipt']['sequence_id'] = copy.deepcopy(value)
        try:
            components.uint_value(document)
            storable = True
        except n.Refusal:
            storable = False
        if storable:
            case['store']['model'].rows['terminal_companion'] = fs.packrow(row['key'], document)
        else:
            row['value'] = document
        same = is_int(value) and value == original
        ok = storable and same
        target = None if ok else (profile if not storable else join)
        collector.invoke('restore_point.deleted/numbers/receipt_sequence_id/' + label, check, case, ok, target=target,
                         family='restore_point.deleted')
        count += 1
    return count


def main():
    import pm_goal_go_created as created
    import pm_goal_go_run_started as run_started
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_go_sweep.py')
    start = len(collector.failures)
    GO_EVIDENCE['retained_negatives'] = reads(collector)
    GO_EVIDENCE['numbers'] = dict(goal_created=created_numbers(collector, created), run_started=run_numbers(collector, run_started),
                                  restore_point_deleted=deleted_numbers(collector))
    GO_EVIDENCE['datetimes'] = dict(goal_created=created_datetimes(collector, created))
    GO_EVIDENCE['datetime_inventory'] = 'NOT_RUN (base predates S1 T198 refresh; TOOL-ISSUES C12-DC1-DTGATE-ROTATION)'
    return int(len(collector.failures) > start)
