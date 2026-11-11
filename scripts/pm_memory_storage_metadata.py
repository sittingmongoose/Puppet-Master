#!/usr/bin/env python3
"""SP-236 exact uint64 current-writer and metadata-only retry oracles; native NOT_RUN."""
from copy import deepcopy
import json


def fixtures(m):
    # These are typed boundary inputs: retain the authored binary64 1.0 negative.
    result = json.loads((m.ROOT / 'Plans/memory_storage_uint64_fixtures.json').read_text())
    assert tuple(result['fields']) == m.STORAGE_UINT64_FIELDS == ('sequence_id',)
    return result


def writer_probe(m, before, value, event):
    untouched = deepcopy(before)
    try:
        m.append_current(before, value, event)
    except (ValueError, TypeError) as error:
        result = ('refused', str(error))
    else:
        result = ('ok',)
    assert before == untouched, 'Storage metadata probe changed input'
    return result


def inputs(m, contexts):
    for event, context in contexts.items():
        before = context['writer_states']['before']
        value = m.canonical_value(before['operation'], event.rsplit('.', 1)[1])
        appended, _ = m.append_current(before, value, event)
        yield event, 'fresh', before, value
        yield event, 'metadata-only-retry', appended, value


def negative_cases(m, contexts):
    cases = []
    for event, route, state, value in inputs(m, contexts):
        for field in fixtures(m)['fields']:
            for case in fixtures(m)['negative_values']:
                bad = {**deepcopy(value), field: case['value']}
                cases.append({'name': event + ':storage-uint64:' + route + ':' + field + ':' + case['name'],
                              'guard': case['guard'],
                              'positive': lambda s=state,v=value,e=event:writer_probe(m,s,v,e),
                              'negative': lambda s=state,v=bad,e=event:writer_probe(m,s,v,e)})
    return cases


def run(m, contexts):
    counts = {'fresh_positives': 0, 'metadata_only_retry_positives': 0,
              'fresh_negatives': 0, 'metadata_only_retry_negatives': 0,
              'high_original_retry_positives': 0, 'fields': fixtures(m)['fields']}
    for event, route, state, value in inputs(m, contexts):
        m.check_resources()
        for field in fixtures(m)['fields']:
            for number in fixtures(m)['positive_values']:
                candidate = {**deepcopy(value), field: number}
                snapshot = deepcopy(state)
                after, output = m.append_current(state, candidate, event)
                assert state == snapshot
                if route == 'fresh':
                    assert output == candidate and type(output[field]) is int and output[field] == number
                    assert after['append_count'] == state['append_count'] + 1
                    assert after['original']['full_value_sha256'] == m.numbers.full_value_commitment(candidate)
                    counts['fresh_positives'] += 1
                    # A retry against each newly stored boundary original preserves the exact receipt.
                    again, returned = m.append_current(after, value, event)
                    assert again == after and returned == after['original']['full_value']
                    assert type(returned[field]) is int and returned[field] == number
                    counts['high_original_retry_positives'] += 1
                else:
                    assert after == state and output == state['original']['full_value']
                    assert after['original'] == state['original']
                    counts['metadata_only_retry_positives'] += 1
    for case in negative_cases(m, contexts):
        assert case['positive']()[0] == 'ok', (case['name'], 'invalid control')
        assert case['negative']()[0] == 'refused', (case['name'], 'invalid Storage uint64 accepted')
        counts['metadata_only_retry_negatives' if ':metadata-only-retry:' in case['name'] else 'fresh_negatives'] += 1
    return counts
