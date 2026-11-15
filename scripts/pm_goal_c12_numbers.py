"""C12-GH1 G6: the shared number corpus through each history family's complete reader.

Every integer/uint64 case of Plans/event_number_recipe_corpus.json (decoded by
the shared corpus decoder) plus the 4,400-digit probe is placed at every
integer slot the family's original owns: payload slots found by walking the
frozen owner payload schema over the family's lawful original, and the
EventRecord storage slots. Each case is a coherent complete original
(answer and source copies, producer digest when the producer could compute
one, coupled revision companions) read by the complete ATS-211 reader
(history_guards).

Historical-only families keep the frozen JSON-Schema integer grammar
(pm_goal_oracle_common.retained_integer_number: int or integral float) with
the owner's bounds; current writes never choose it. The expectation is fixed
before the read from that grammar, the owner bound, and whether the producer
could have formed the original's semantic digest (pm_event_numbers):
an original whose producer digest cannot exist is refused at
original/semantic_digest. A crash is a failure, never a refusal.
"""
import copy

import pm_event_numbers as numbers
import pm_goal_guard_tables as tables
import pm_goal_oracle_common as common
from pm_event_numbers_corpus import _value
from pm_goal_history_reader_fixtures import FAMILIES, PAYLOAD_FILE, OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA, history_guards
from pm_goal_schema_witnesses import applications, at, put

PLANS = common.ROOT / 'Plans'
HUGE = 10 ** 4400 - 1   # 4,400 digits, built without a decimal-string conversion
COUPLED = {'goal_revision', 'expected_goal_revision', 'new_revision'}
# Owner-coupled companions (row/progress_repeat_count, row/evidence_span): the
# companion takes the same frozen integer so only the slot's grammar decides.
COMPANIONS = {('payload', 'repeat_count'): [('payload', 'no_progress_marker', 'continuation_count')],
              ('payload', 'no_progress_marker', 'continuation_count'): [('payload', 'repeat_count')],
              ('payload', 'source_spans', 0, 'start_line'): [('payload', 'source_spans', 0, 'end_line')],
              ('payload', 'source_spans', 0, 'end_line'): [('payload', 'source_spans', 0, 'start_line')]}


def corpus_values():
    corpus = common.load(PLANS / 'event_number_recipe_corpus.json')
    out = []
    for case in corpus['cases']:
        if case['op'] in ('integer', 'uint64') and 'value' in case:
            out.append((case['op'] + '/' + case['id'], _value(case['value'])))
    out += [('probe/4400_digits', HUGE), ('probe/integral_float_one', 1.0), ('probe/negative_zero_float', -0.0),
            ('probe/two_pow_53', 1 << 53), ('probe/two_pow_53_plus_one', (1 << 53) + 1)]
    return out


def integer_nodes(v, instance):
    slots = {}
    for path, node, _ in applications(v, instance):
        kinds = node.get('type')
        kinds = {kinds} if isinstance(kinds, str) else set(kinds or ())
        if 'integer' in kinds and path:
            slots.setdefault(path, []).append(node)
    return slots


def frozen_ok(value, nodes):
    """The frozen owner grammar and bounds at this slot (no checker call)."""
    if not common.retained_integer_number(value):
        return False, 'type'
    for node in nodes:
        for keyword, holds in (('minimum', lambda b: value >= b), ('maximum', lambda b: value <= b),
                               ('exclusiveMinimum', lambda b: value > b), ('exclusiveMaximum', lambda b: value < b)):
            if keyword in node and not holds(node[keyword]):
                return False, keyword
    return True, None


def producer_digest(event):
    try:
        return numbers.producer_semantic_digest(event)
    except numbers.Refusal:
        return None


def build(base, where, path, value):
    """A coherent complete original with `value` at the slot; companions follow."""
    case = copy.deepcopy(base)
    events = (case['answer']['original_event'], case['source']['event'])
    placed = {}
    for event in events:
        root = event['payload'] if where == 'payload' else event
        changed = put(root, path, value)
        if where == 'payload':
            event['payload'] = changed
        else:
            event.clear(); event.update(changed)
    leaf = path[-1]
    if where == 'payload' and common.retained_integer_number(value):
        for companion in COMPANIONS.get(tuple(path), []):
            for event in events:
                try:
                    at(event['payload'], companion[:-1])
                except (KeyError, IndexError, TypeError):
                    continue
                event['payload'] = put(event['payload'], companion, value)
    if where == 'payload' and len(path) == 1 and leaf in COUPLED and common.retained_integer_number(value):
        for event in events:
            p = event['payload']
            if leaf == 'goal_revision':
                p['expected_goal_revision'] = value - 1
            elif leaf == 'expected_goal_revision':
                p['goal_revision'] = value + 1
            if isinstance(p.get('payload'), dict) and 'new_revision' in p['payload']:
                p['payload']['new_revision'] = p['goal_revision']
        case['original']['predecessor']['goal_revision'] = events[0]['payload']['expected_goal_revision']
        placed = dict(expected_goal_revision=events[0]['payload']['expected_goal_revision'],
                      goal_revision=events[0]['payload']['goal_revision'])
    if where == 'payload' and path == ('payload', 'new_revision') and common.retained_integer_number(value):
        for event in events:
            event['payload']['goal_revision'] = value
            event['payload']['expected_goal_revision'] = value - 1
        case['original']['predecessor']['goal_revision'] = value - 1
        placed = dict(expected_goal_revision=value - 1, goal_revision=value)
    if where == 'event' and leaf == 'sequence_id':
        if type(value) is int and 0 <= value < (1 << 64):
            import base64
            event = events[0]
            part = 'project~' + base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('=')
            case['source']['index_key'] = f"event_record_index.v2:{part}:{value:020d}:{event['event_id']}"
        case['answer']['selector']['sequence_id'] = value
    digest = producer_digest(events[0])
    if digest is not None:
        case['original']['producer_digest'] = digest
    return case, placed, digest is not None


STORAGE_SLOTS = {('event', ('sequence_id',))}


def expectation(value, nodes, placed, representable, companion_nodes, slot=None):
    if slot in STORAGE_SLOTS:
        # Storage-assigned EventRecord metadata: the SP-1100 u64 grammar, never
        # the frozen payload grammar (the index key is derived from it).
        try:
            numbers.storage_uint64(value)
        except numbers.Refusal as refusal:
            return False, ('storage_uint64', refusal.reason)
    ok, keyword = frozen_ok(value, nodes)
    if not ok:
        return False, ('schema', keyword)
    for name, companion in placed.items():
        good, word = frozen_ok(companion, companion_nodes.get(name, []))
        if not good:
            return False, ('companion:' + name, word)
    if not representable:
        return False, ('row', 'original/semantic_digest')
    return True, None


def main():
    collector = tables.COLLECTOR
    if collector is None:
        raise RuntimeError('Run through pm_goal_guard_sweep.py --source pm_goal_c12_numbers')
    paths = [OUT_SCHEMA, ER_SCHEMA, CKPT_SCHEMA]
    for key in FAMILIES:
        payload = PLANS / 'event_payloads/goal_runtime' / f"{PAYLOAD_FILE.get(key, 'goal_' + key)}.schema.json"
        if payload.exists():
            paths.append(payload)
    registry = common.schema_registry(paths)
    out_doc = common.load(OUT_SCHEMA)
    values = corpus_values()
    summary = {}
    start = len(collector.failures)
    for key, (family, _, _) in FAMILIES.items():
        fixture = common.load(PLANS / f'goal_{key}_history_contract_fixtures.json')
        pv = common.validator(common.load(PLANS / 'event_payloads/goal_runtime' / f"{PAYLOAD_FILE.get(key, 'goal_' + key)}.schema.json"), registry)
        av = common.validator({'$ref': out_doc['$id'] + '#/$defs/goal_' + key + '_history_answer'}, registry)
        ev = common.validator(common.load(ER_SCHEMA), registry)
        bases = [c['input'] for c in common.materialize_cases(fixture['protocol_cases']) if c['valid']]
        base = bases[0]
        event = base['answer']['original_event']
        # Every integer slot any lawful authored original populates, each read
        # on the first original that owns it.
        found = {}
        for candidate in bases:
            item = candidate['answer']['original_event']
            for path, nodes in integer_nodes(pv, item['payload']).items():
                found.setdefault(('payload', path), (nodes, candidate))
            for path, nodes in integer_nodes(ev, item).items():
                if len(path) == 1:
                    found.setdefault(('event', path), (nodes, candidate))
        slots = [(where, path, nodes, owner) for (where, path), (nodes, owner) in found.items()]
        top = integer_nodes(pv, event['payload'])
        companion_nodes = {name: top.get((name,), []) for name in ('goal_revision', 'expected_goal_revision')}
        def evaluate(value, pv=pv, av=av):
            return history_guards(value, pv, av)
        stats = dict(slots=['/'.join(map(str, (w,) + p)) for w, p, _, _ in slots], cases=0, accepted=0, refused=0,
                     agree=0, disagree=[], crashes=0)
        for where, path, nodes, owner in slots:
            for label, value in values:
                case, placed, representable = build(owner, where, path, value)
                valid, reason = expectation(value, nodes, placed, representable, companion_nodes, (where, path))
                slot = '/'.join(map(str, (where,) + path))
                name = f'gh1-numbers/{key}/{slot}/{label}'
                before = len(collector.ledger)
                result = collector.invoke(name, evaluate, case, valid, family=family, generated=True)
                record = collector.ledger[-1] if len(collector.ledger) > before else None
                stats['cases'] += 1
                if record is None or record.get('outcome') == 'exception':
                    stats['crashes'] += 1
                    collector.failures.append(dict(kind='number_corpus_crash', case=name,
                        exception=record and record.get('exception')))
                    continue
                errors = set(result['errors'] if isinstance(result, dict) else result)
                stats['accepted' if not errors else 'refused'] += 1
                record['number_expectation'] = dict(valid=valid, reason=list(reason) if reason else None)
                if valid == (not errors):
                    stats['agree'] += 1
                else:
                    stats['disagree'].append(dict(case=name, expected_valid=valid, reason=reason, errors=sorted(errors)))
                    collector.failures.append(dict(kind='number_corpus_disagreement', case=name, expected_valid=valid,
                                                   errors=sorted(errors)))
        summary[family] = stats
    collector.generator_stats['number_corpus'] = summary
    return int(len(collector.failures) > start)
