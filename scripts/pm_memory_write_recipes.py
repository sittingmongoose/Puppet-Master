#!/usr/bin/env python3
"""Frozen write-recipe and enforced-format witnesses; synthetic custody, native NOT_RUN."""
from copy import deepcopy
import json


def read_probe(m, state, event):
    before = deepcopy(state)
    try:
        result = m.read_canonical_history(state, event)
    except (ValueError, TypeError) as error:
        outcome = ('refused', str(error))
    else:
        assert result == state['originals'][event]['full_value'], 'changed retained value'
        outcome = ('ok',)
    assert state == before, 'history changed input'
    return outcome


def retained_states(m, contexts):
    bases = {f['event_type']: f for f in m.load('Plans/memory_canonical_history_fixtures.json')['canonical_history_families']}
    # These are frozen old-writer typed values, not current identity inputs. In particular an old
    # binary64 value must survive its fixture JSON round trip as binary64, exactly as the old writer
    # hashed it. The live-input Decimal decoder must not reinterpret that retained representation.
    fixtures = json.loads((m.ROOT / 'Plans/memory_write_recipe_fixtures.json').read_text())
    assert fixtures['old_writer_commit'] == '77323e87d65908dbce2ea655ee344b6185a13ff1'
    assert fixtures['history_recipe'] == 'integer-json-v1'
    assert fixtures['current_writer_recipe'] == 'safe-integer-write-v2'
    for family in fixtures['families']:
        event = family['event_type']
        if event not in contexts:
            continue
        for case in family['retained_cases']:
            state = deepcopy(bases[event]['states'][case['base_mode']])
            state['originals'] = deepcopy(case['originals'])
            if 'written_operation' in case:
                state['written_operation'] = deepcopy(case['written_operation'])
            assert case['output'] == state['originals'][event]['full_value']
            yield event, case['name'], state


def history_cases(m, contexts, archive=None):
    """Coherent controls are assembled before evaluation; no repair occurs while reading."""
    cases = []
    for event, name, control in retained_states(m, contexts):
        # All old-domain positives run in the full checker. Four modes of the largest old
        # sequence additionally carry isolated digest/flush/binding/edition/access negatives.
        if not name.endswith('18446744073709551615') or name.startswith('old-writer-'):
            continue
        def add(guard, label, changed):
            cases.append({'name': event + ':write-recipe:' + name + ':' + label, 'guard': guard,
                          'positive': lambda s=control,e=event:read_probe(m,s,e),
                          'negative': lambda s=changed,e=event:read_probe(m,s,e)})
        bad = deepcopy(control); bad['originals'][event]['full_value_sha256'] = '0' * 64
        add('custody_digest', 'forged-commitment', bad)
        bad = deepcopy(control); bad['originals'][event]['durability'] = 'not_flushed'
        add('custody_flush', 'unflushed', bad)
        for field, value in [('recipe_version', 'legacy-permissive'), ('schema_version', '0.9.0'),
                             ('schema_id', 'pm.foreign.v0')]:
            bad = deepcopy(control); record = bad['originals'][event]
            record['full_value'][field] = value
            record['full_value_sha256'] = m.historical_digest(record['full_value'])
            add('envelope_schema', 'forged-' + field, bad)
        bad = deepcopy(control); record = bad['originals'][event]
        record['full_value']['payload']['source_revision_sha256'] = 'b' * 64
        record['full_value_sha256'] = m.historical_digest(record['full_value'])
        add('semantic_binding' if archive else 'custody_binding', 'rehashed-foreign-source', bad)
        for field, value in [('permission', False), ('withdrawn', True)]:
            bad = {**deepcopy(control), field: value}
            add('permission_or_withdrawal', field, bad)
        for field, value in [('recipe_version', 'legacy-permissive'), ('schema_version', '0.9.0')]:
            bad = deepcopy(control); bad['written_operation'][field] = value
            add('operation_schema', 'forged-operation-' + field, bad)
    return cases


def retry_cases(m, contexts, archive=None):
    """Current retry input remains strict; the original has its frozen write-time custody recipe."""
    fixtures = json.loads((m.ROOT / 'Plans/memory_write_recipe_fixtures.json').read_text())
    cases = []
    for family in fixtures['families']:
        event = family['event_type']
        if event not in contexts:
            continue
        before = contexts[event]['writer_states']['before']
        value = m.canonical_value(before['operation'],event.rsplit('.',1)[1])
        state, _ = m.append_current(before,value,event)
        for i, receipt in enumerate(family['old_writer_receipts'] + family['old_float_writer_receipts']):
            control = deepcopy(state); control['original'] = deepcopy(receipt)
            def probe(s, e=event, v=value):
                original = deepcopy(s)
                try:
                    after, output = m.append_current(s,v,e)
                except (ValueError,TypeError) as error:
                    result = ('refused',str(error))
                else:
                    assert after == s and output == s['original']['full_value'], 'retry changed original/state'
                    result = ('ok',)
                assert s == original
                return result
            for guard, label in [('custody_digest','digest'),('custody_flush','flush'),
                                 ('semantic_binding' if archive else 'custody_binding','binding')]:
                bad = deepcopy(control)
                if label == 'digest': bad['original']['full_value_sha256'] = '0' * 64
                elif label == 'flush': bad['original']['durability'] = 'not_flushed'
                else:
                    bad['original']['full_value']['payload']['source_revision_sha256'] = 'b' * 64
                    bad['original']['full_value_sha256'] = m.historical_digest(bad['original']['full_value'])
                cases.append({'name':event+':write-recipe-retry:'+str(i)+':'+label,'guard':guard,
                              'positive':lambda p=probe,s=control:p(s),'negative':lambda p=probe,s=bad:p(s)})
    return cases


def formatted_leaves(m):
    """Visit every format declaration, including dormant branches and frozen definitions."""
    def walk(node, pointer):
        if isinstance(node, dict):
            if 'format' in node:
                yield pointer, node
            for key, value in node.items():
                if key not in m.DATA_KEYWORDS:
                    yield from walk(value, pointer + '/' + key.replace('~', '~0').replace('/', '~1'))
        elif isinstance(node, list):
            for i, value in enumerate(node):
                yield from walk(value, pointer + '/' + str(i))
    for path, doc in m.checked_documents().items():
        for pointer, schema in walk(doc, ''):
            yield path, pointer, schema


DATE_BAD = ('2026-11-04T17:00:00', '2026/11/04T17:00:00Z', '2026-13-04T17:00:00Z',
            '2026-02-30T17:00:00Z', '2026-11-04T24:00:00Z', '2026-11-04T17:60:00Z',
            '2026-11-04T17:00:60Z', '2026-11-04T17:00:00Z\n', '2026-11-04T17:00:00.Z',
            '2026-11-04T17:00:00+24:00', '2026-11-04T17:00:00+00:60')
UUID_BAD = ('11111111111141118111111111111111', '11111111-1111-4111-8111-11111111111g',
            '11111111-1111-4111-8111-111111111111\n', 'urn:uuid:11111111-1111-4111-8111-111111111111')


def format_cases(m, contexts):
    cases = []
    for path, pointer, schema in formatted_leaves(m):
        kind = schema['format']
        assert kind in ('date-time', 'uuid'), ('uncovered format', path, pointer, kind)
        good = '2026-11-04T17:00:00Z' if kind == 'date-time' else '11111111-1111-4111-8111-111111111111'
        bad_values = DATE_BAD if kind == 'date-time' else UUID_BAD
        for event in contexts:
            definition = pointer.split('/')[2]
            if 'event_payloads.schema' in path and definition != event.replace('.', '_'):
                continue
            if 'operation.schema' in path and definition not in (m.operation_name(event), 'historical_' + m.operation_name(event)):
                continue
            for i, bad in enumerate(bad_values):
                def probe(value, p=path, ptr=pointer):
                    return ('ok',) if m.formatted_value_matches(p,ptr,value) else ('refused', False)
                cases.append({'name': event + ':formats:' + path + '#' + pointer + ':' + str(i),
                              'guard': 'formats_enforced', 'positive': lambda p=probe,v=good:p(v),
                              'negative': lambda p=probe,v=bad:p(v)})
    return cases


def run(m, contexts, archive=None):
    counts = {'retained_old_recipe': 0, 'live_independent_old_recipe': 0, 'legacy_number_spellings': 0,
              'legacy_binary64_controls': 0, 'current_recipe_refusals': 0, 'forged_old_recipe': 0,
              'legacy_retry_negatives': 0, 'current_storage_controls': 0,
              'format_negatives': 0, 'format_declarations': 0, 'format_positives': 0}
    for event, name, state in retained_states(m, contexts):
        assert read_probe(m,state,event)[0] == 'ok', (event,name)
        changed = {**deepcopy(state), 'operation': {'unrelated': True}, 'admitted': False,
                   'cutoff_authorities': {}, 'selector': None, 'request_sha256': 'unrelated',
                   'current_source_revision_sha256': 'unrelated', 'effect_count': 999, 'swap_count': 999}
        assert read_probe(m,changed,event)[0] == 'ok', (event,name,'live dependency')
        counts['retained_old_recipe'] += 1; counts['live_independent_old_recipe'] += 1
        number = state['originals'][event]['full_value']['sequence_id']
        if type(number) is float:
            original = json.loads(json.dumps(state))
            assert type(original['originals'][event]['full_value']['sequence_id']) is float
            assert read_probe(m,original,event)[0] == 'ok', (event,name,'old binary64 representation')
            counts['legacy_binary64_controls'] += 1
        if type(number) is int and number > m.SAFE_INTEGER:
            for literal in (str(number) + '.0', str(number) + 'e0'):
                spelled = deepcopy(state)
                spelled['originals'][event]['full_value']['sequence_id'] = m.json_numbers(literal)
                # The frozen original commitment is unchanged; no rehash or source repair.
                assert read_probe(m,spelled,event)[0] == 'ok', (event,name,literal)
                counts['legacy_number_spellings'] += 1
    for case in history_cases(m,contexts,archive):
        assert case['positive']()[0] == 'ok', (case['name'],'control')
        assert case['negative']()[0] == 'refused', (case['name'],'forged history accepted')
        counts['forged_old_recipe'] += 1
    for case in retry_cases(m,contexts,archive):
        assert case['positive']()[0] == 'ok', (case['name'],'old receipt retry control')
        assert case['negative']()[0] == 'refused', (case['name'],'forged retry accepted')
        counts['legacy_retry_negatives'] += 1
    for case in format_cases(m,contexts):
        assert case['positive']()[0] == 'ok', (case['name'],'control')
        assert case['negative']()[0] == 'refused', (case['name'],'skipped format')
        counts['format_negatives'] += 1
    for path, pointer, schema in formatted_leaves(m):
        counts['format_declarations'] += 1
        if schema['format'] == 'date-time':
            for value in ('2024-02-29T23:59:59Z', '2026-11-04T17:00:00.0Z', '2026-11-04T17:00:00.123456789Z'):
                assert m.formatted_value_matches(path,pointer,value), (path,pointer,value)
                counts['format_positives'] += 1
    # Writer recipe selection is fixed by the entry point; a supplied legacy recipe or edition
    # cannot bypass current envelope admission. Owner-valid uint64 Storage metadata needs no override. The isolated numeric/schema guards are proved separately.
    for event, context in contexts.items():
        before = context['writer_states']['before']
        for number in (2**53,2**53+1,2**60,2**64-1):
            for override in ({}, {'recipe_version':'integer-json-v1'}, {'schema_version':'1.0.0'}):
                value = {**m.canonical_value(before['operation'],event.rsplit('.',1)[1]),
                         'sequence_id':number, **override}
                snapshot = deepcopy(before)
                try:
                    m.append_current(before,value,event)
                except ValueError:
                    assert override, (event,'writer refused owner-valid uint64',number)
                else:
                    assert not override, (event,'writer accepted legacy recipe',number,override)
                    counts['current_storage_controls'] += 1
                    assert before == snapshot
                    continue
                assert before == snapshot
                counts['current_recipe_refusals'] += 1
    assert counts['retained_old_recipe'] == sum(29 if '.index.' in event else 28 for event in contexts)
    assert counts['legacy_binary64_controls'] == 8 * len(contexts)
    return counts
