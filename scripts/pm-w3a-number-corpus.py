#!/usr/bin/env python3
"""Run the shared NUMRULE number corpus through the W3A complete checker's integer slots.

Part A runs the corpus integer cases (token, integer, slot, uint64, current_json,
current_json_slot) through the shared calls with each case's own bounds.
Part B places every corpus integer value, plus a 4,400-digit integer, into each
W3A integer slot of a complete world (EventRecord sequence_id and
producer_sequence_id, the five first-receipt uint64 slots, checkpoint node
slots, the cleanup elapsed-seconds slot) and runs the complete checker path.
A value the shared call accepts must pass that slot (a later row may refuse it
only for its own documented reason: the producer JCS route above 2^53, the
cleanup window below 604800 s); a value it refuses must refuse at the slot row
or the schema row in front of it. Acceptance, refusal and an untracked
exception are three separate outcomes; an untracked exception always fails.
Usage: python3 scripts/pm-w3a-number-corpus.py [--json out.json]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_event_numbers as numbers  # noqa: E402
import pm_w3a_forge_events as w3a  # noqa: E402
import pm_w3a_forge_spec as spec  # noqa: E402

OPS = ('token', 'integer', 'slot', 'uint64', 'current_json', 'current_json_slot')


def typed(value):
    """Decode the corpus's type-aware value notation."""
    if isinstance(value, dict) and len(value) == 1:
        (tag, raw), = value.items()
        if tag == '@int':
            return int(raw)
        if tag == '@float':
            return float(raw)
    return value


def classify(fn):
    try:
        return 'accepted', fn()
    except numbers.Refusal as refusal:
        return 'refused', refusal.reason
    except Exception as error:  # noqa: BLE001 - an untracked exception is the reported defect
        return 'untracked:' + type(error).__name__, None


def part_a(corpus):
    counts = dict(total=0, agree=0, disagree=0, untracked=0)
    bad = []
    for case in corpus['cases']:
        if case.get('date_time_profile') or case.get('op') not in OPS:
            continue
        counts['total'] += 1
        bounds = case.get('bounds') or {}
        op = case['op']
        if op == 'token':
            outcome = classify(lambda: numbers.current_integer_token(case['raw'], **bounds))
        elif op == 'integer':
            outcome = classify(lambda: numbers.current_integer(typed(case['value']), **bounds))
        elif op == 'uint64':
            outcome = classify(lambda: numbers.storage_uint64(typed(case['value'])))
        elif op == 'slot':
            outcome = classify(lambda: numbers.current_integer(numbers.loads_current_json(case['raw']), **bounds))
        elif op == 'current_json':
            outcome = classify(lambda: numbers.loads_current_json(case['raw']))
        else:
            def slot():
                value = numbers.loads_current_json(case['raw'])
                for key in case['path']:
                    value = value[key]
                return numbers.current_integer(value, **bounds)
            outcome = classify(slot)
        kind, value = outcome
        if kind.startswith('untracked'):
            counts['untracked'] += 1
            bad.append((case['id'], kind))
        elif ('error' in case) == (kind == 'refused') and (kind == 'refused' or 'returns' not in case or op == 'current_json'
                                                           or value == typed(case['returns'])):
            counts['agree'] += 1
        else:
            counts['disagree'] += 1
            bad.append((case['id'], kind, case.get('error')))
    return counts, bad


def slot_values(corpus):
    values = []
    for case in corpus['cases']:
        if case.get('date_time_profile'):
            continue
        if case.get('op') in ('integer', 'uint64'):
            values.append((case['id'], typed(case['value'])))
        elif case.get('op') in ('slot', 'token'):
            outcome = classify(lambda: numbers.loads_current_json(case['raw']))
            if outcome[0] == 'accepted':
                values.append((case['id'], outcome[1]))
    with w3a.exact_integer_digits():
        values.append(('w3a-4400-digit-integer', int('9' * 4400)))
        values.append(('w3a-4400-digit-negative', -int('9' * 4400)))
    return values


SLOTS = (
    # name, path, hook, shared predicate, rows allowed when refused, rows allowed when accepted (owner reason)
    ('envelope.sequence_id', 'append', lambda v: {'meta': w3a.setp('sequence_id', v)}, numbers.storage_uint64,
     {'EN01_envelope_schema', 'EN05_sequence_uint64'}, set()),
    ('envelope.producer_sequence_id', 'append', lambda v: {'envelope': w3a.setp('producer_sequence_id', v)},
     lambda v: None if v is None else numbers.current_integer(v, minimum=0), {'EN01_envelope_schema', 'EN06_producer_sequence'},
     {'EN07_producer_qualified'}),
    ('receipt.segment_generation', 'settle', lambda v: {'receipt': w3a.setp('segment_generation', v)}, numbers.storage_uint64,
     {'RC01_custody_schema', 'RC12_receipt_segment_generation_uint64'}, set()),
    ('receipt.byte_offset', 'settle', lambda v: {'receipt': w3a.setp('byte_offset', v)}, numbers.storage_uint64,
     {'RC01_custody_schema', 'RC13_receipt_byte_offset_uint64'}, set()),
    ('checkpoint.retired_node.publication_revision', 'publish',
     lambda v: {'pred': w3a.setp('generations', 1, 'core', 'publication_revision', v)}, numbers.storage_uint64,
     {'CP01_root_schema', 'CP05_publication_revision_uint64'}, set()),
    ('checkpoint.staged_node.frontier_revision', 'publish',
     lambda v: {'pred': w3a.setp('generations', 2, 'core', 'generic_token', 'frontier_revision', v)}, numbers.storage_uint64,
     {'CP01_root_schema', 'CP08_frontier_revision_uint64'}, set()),
    ('cleanup.elapsed_seconds', 'stage',
     lambda v: {'stage': lambda st, W: st.update(op='cleanup', root=w3a.copy.deepcopy(W['pred']),
                                                 target=W['pred']['generations'][1]['generation_id'], holds=[], elapsed_seconds=v)},
     numbers.storage_uint64, {'SL04_cleanup_window', 'SL05_elapsed_uint64'}, {'SL04_cleanup_window'}),
)


def part_b(corpus):
    fam = spec.FAMILIES[0]
    counts = dict(routes=0, agree=0, disagree=0, untracked=0)
    bad = []
    values = slot_values(corpus)
    with w3a.exact_integer_digits():
        for name, path, muts, shared, refuse_rows, accept_rows in SLOTS:
            for kind in ('application', 'project'):
                for vid, value in values:
                    counts['routes'] += 1
                    shared_ok = classify(lambda: shared(value))[0] == 'accepted'
                    try:
                        W = w3a.build(fam, kind, muts(value))
                        result = w3a.run_path(path, W)
                    except Exception as error:  # noqa: BLE001 - untracked
                        counts['untracked'] += 1
                        bad.append((name, kind, vid, 'untracked:' + type(error).__name__))
                        continue
                    row = result[1] if result else None
                    good = (row is None or row in accept_rows) if shared_ok else (row in refuse_rows)
                    if good:
                        counts['agree'] += 1
                    else:
                        counts['disagree'] += 1
                        bad.append((name, kind, vid, 'shared accepts' if shared_ok else 'shared refuses', row))
    return counts, bad


def main():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    with w3a.exact_integer_digits():  # corpus expectations include integers above Python's default digit limit
        a_counts, a_bad = part_a(corpus)
        b_counts, b_bad = part_b(corpus)
    status = 'pass' if not (a_bad or b_bad) else 'fail'
    result = dict(status=status, part_a=a_counts, part_b=b_counts, failures=(a_bad + b_bad)[:50])
    text = json.dumps(result, indent=1, default=str)
    if '--json' in sys.argv:
        Path(sys.argv[sys.argv.index('--json') + 1]).write_text(text + '\n')
    print(text)
    return 0 if status == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
