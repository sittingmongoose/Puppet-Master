#!/usr/bin/env python3
"""DO sweep part 2A: the guard tables' matrix, their generated tool adapters and the guard-tool proof.

  matrix    every positive passes every row; every negative is refused by exactly one row, its target, across the
            whole boundary table (no early stop, no grouping); report rows with no single-defect negative
  generate  write one adapter per suite under scripts/do-guard-cases/ (the tool judges each file's table calls
            against that suite's own table, so every suite has its own file)
  check     the committed adapters equal the generated ones
  run       run the guard tool (scripts/pm_guard_isolation.py) on each suite, one at a time, and write the results

A suite is at most SUITE_SIZE consecutive rows of one stage table, with a projected value holding only the view keys
those rows read: the tool snapshots the whole value at every predicate instruction, so a full-lane value makes it
unusable (3.1 s per evaluation on one DO checkpoint case). The full-table matrix above is what proves isolation
across suites. Number-domain rows (NUMRULE, sweep part 2B) are tabled but not proved here.
"""
import argparse
import collections
import copy
import hashlib
import json
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_orchestrator_event_guards as guards  # noqa: E402
import pm_orchestrator_event_oracles as oracles  # noqa: E402
import importlib.util  # noqa: E402

_spec = importlib.util.spec_from_file_location('do_contracts', ROOT / 'scripts/pm-orchestrator-event-contracts.py')
contracts = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(contracts)

CASES_DIR = 'scripts/do-guards'
SUITE_SIZE = 5
NEGATIVES_PER_ROW = 2


# ---- Boundaries --------------------------------------------------------------------------------------------------

def checkpoint_tables():
    return [('RECIPE_ROWS', guards.RECIPE_ROWS)] + [(name, getattr(guards, name)) for name in oracles.CHECKPOINT_STAGES]


def recipe_negatives(case):
    """One single-defect negative per recipe row, from a valid retained case: each changes one evidence field, and
    the unsupported label is recorded with a witness for that label, so only the label is wrong."""
    def evidence(c):
        return c['historical_reader_state']['original_recipe_evidence']
    changes = (
        ('recipe_unsupported', 'recipe_supported', lambda c: oracles.record_recipe(c, 'ea-do-unsupported-v0')),
        ('recipe_unverified', 'recipe_evidence_verified', lambda c: evidence(c).update(verified=False)),
        ('recipe_value', 'recipe_evidence_value', lambda c: evidence(c)['value'].update(event_type='parser.error.foreign')),
        ('recipe_source_ref', 'recipe_evidence_source_ref', lambda c: evidence(c).update(
            source_ref='writer-recipe:evt_do_' + '0' * 64)),
        ('recipe_source_sha256', 'recipe_evidence_source_sha256', lambda c: evidence(c).update(
            source_sha256=oracles.foreign_hex(evidence(c)['source_sha256']))),
    )
    for name, target, change in changes:
        bad = copy.deepcopy(case)
        change(bad)
        yield 'recipe:' + name, bad, target


def token_schema_negative(case):
    bad = copy.deepcopy(case)
    bad['read']['read_token']['unregistered_probe'] = 'probe'
    return 'P2A:read_token_unknown_member', bad


# Negatives the lane checker keeps but that are not single-defect at the whole-table matrix, with the reason. They are
# reported, never credited, and never enter a tool suite.
LANE_ONLY = {
    'P1F05:bare_null_frame': 'schema-first form: the checkpoint schema allOf refuses a bare null frame before the '
                             'null-frame row, which also refuses it',
    'P1F05:incomplete_coverage': 'the pair of the schema const and its runtime duplicate `coverage_complete` (same '
                                 'field, same predicate, two codes): both refuse it',
}
TOKEN_LOOP = ('the read-token field loop of check_oracles asserts a non-empty refusal; its string forms also break '
              "the token schema's formats and patterns, so two rows refuse them (P1F06's token_* negatives are the "
              'single-defect ones)')


def checkpoint_inputs(fixtures):
    """(controls, negatives): controls are (id, case); negatives (id, case, expected codes or None, control id,
    lane-only reason or None)."""
    root, formats = contracts.ROOT, contracts.UTC_FORMAT
    events = fixtures['event_cases']
    bases = [next(c for c in events if c['logical_payload']['scope'] == 'project'),
             next(c for c in events if c['logical_payload']['scope'] == 'application')]
    controls = []
    for base in bases:
        controls.append((base['case_id'], base))
        controls.append((base['case_id'] + ':closed', oracles.closed_segment_case(base)))
        controls.append((base['case_id'] + ':compaction', oracles.compaction_control(base)))
        controls.append((base['case_id'] + ':gap', oracles.gap_control(base)))
    controls.append(('retained:' + fixtures['retained_event_cases'][0]['case_id'], fixtures['retained_event_cases'][0]))
    controls.append(('compatibility:' + fixtures['compatibility_event_cases'][0]['case_id'], fixtures['compatibility_event_cases'][0]))
    by_case = {id(case): cid for cid, case in controls}
    negatives = []
    for base in bases:
        closed = controls[[cid for cid, _ in controls].index(base['case_id'] + ':closed')][1]
        compaction = controls[[cid for cid, _ in controls].index(base['case_id'] + ':compaction')][1]
        for name, bad, codes, origin, _ in oracles.checkpoint_field_negatives(base):
            # The registry's bases are the case itself, its closed-segment control or its compaction control.
            control = base['case_id']
            if origin is not base:
                control = base['case_id'] + (':closed' if oracles.typed_tree(origin) == oracles.typed_tree(closed)
                                             else ':compaction' if oracles.typed_tree(origin) == oracles.typed_tree(compaction)
                                             else ':?')
            negatives.append((base['case_id'] + ':' + name, bad, codes, control, LANE_ONLY.get(name)))
        for name, bad, target in recipe_negatives(base):
            negatives.append((base['case_id'] + ':' + name, bad, ['historical_original_recipe'], base['case_id'], None))
        name, bad = token_schema_negative(base)
        negatives.append((base['case_id'] + ':' + name, bad, ['checkpoint_schema'], base['case_id'], None))
        for field in base['read']['read_token']:
            bad = copy.deepcopy(base)
            token = bad['read']['read_token']
            token[field] = (token[field] + 1 if isinstance(token[field], int) else
                            dict(token[field], manifest_generation=999) if isinstance(token[field], dict)
                            else token[field] + '-foreign')
            negatives.append((base['case_id'] + ':token:' + field, bad, None, base['case_id'], TOKEN_LOOP))
    view = lambda case: oracles.checkpoint_full_view(case, root, formats)
    return controls, negatives, view


BOUNDARIES = {
    'checkpoint': (checkpoint_tables, checkpoint_inputs),
}


# ---- More boundaries (sweep part 2A) -----------------------------------------------------------------------------

def tables_named(*names):
    return lambda: [(name, getattr(guards, name)) for name in names]


def schema_doc():
    return json.loads((ROOT / 'Plans/orchestrator_event_payloads.schema.json').read_text())


def family_cases(fixtures, key='event_cases'):
    """One case per family and scope, the first of each: the tool's base cases."""
    seen, result = set(), []
    for case in fixtures[key]:
        marker = (case['event_type'], case['logical_payload']['scope'])
        if marker not in seen:
            seen.add(marker)
            result.append(case)
    return result


def resync_inline(case):
    case['event']['payload'] = copy.deepcopy(case['logical_payload'])
    return case


def append_inputs(fixtures):
    root, formats = contracts.ROOT, contracts.UTC_FORMAT
    schema = schema_doc()
    events = fixtures['event_cases']
    by_id = {c['case_id']: c for c in events}
    controls = [(c['case_id'], c) for c in events]
    negatives = []

    def neg(name, base, change, codes=None, lane=None):
        bad = copy.deepcopy(base)
        change(bad)
        negatives.append((base['case_id'] + ':' + name, (bad, schema), codes, base['case_id'], lane))

    for test in fixtures['standing_cases']:
        base = by_id[test['case_id']]
        kind = test['mutation']
        if kind == 'replay_only':
            neg('standing:replay_only', base, lambda c: c['event'].update(replay_policy='projector_replay_only'), [test['expected_error']])
        elif kind == 'application_key':
            neg('standing:application_key', base, lambda c: c['event'].update(idempotency_key='do1:' + 'a' * 64), [test['expected_error']])
        elif kind == 'raw_project_partition':
            neg('standing:raw_project_partition', base, lambda c: c.update(scope_partition=c['logical_payload']['project_id']),
                [test['expected_error']])
        elif kind == 'identifier_lf':
            neg('standing:identifier_lf', base, lambda c: c['event'].update(event_type=c['event']['event_type'] + '\n'), None,
                'the EventRecord schema repeats the event_type pattern: a trailing LF is refused by `event_record_schema` and '
                '`event_type_pattern` alike (same field, same pattern, two codes)')
        elif kind == 'missing_required':
            neg('standing:missing_required', base, lambda c: c['event'].pop('schema_id'), [test['expected_error']])
        elif kind == 'application_for_project_only':
            neg('standing:application_for_project_only', base, lambda c: (c['logical_payload'].update(scope='application'),
                c['logical_payload'].pop('project_id')), [test['expected_error']])
        elif kind in ('unresolved_resource', 'unresolved_fragment'):
            broken = copy.deepcopy(schema)
            target = ('https://puppetmaster.local/schemas/DO-MISSING/schema.json' if kind == 'unresolved_resource' else '#/$defs/DO_MISSING')
            broken['$defs'][base['definition']]['properties']['unvisited_optional_ref'] = {'$ref': target}
            negatives.append((base['case_id'] + ':standing:' + kind, (copy.deepcopy(base), broken), [test['expected_error']],
                              base['case_id'], None))
    for test in fixtures['storage_sequence_cases']:
        if not test['valid']:
            neg('sequence:' + test['name'], by_id[test['case_id']], lambda c, v=test['value']: c['event'].update(sequence_id=v),
                test['expected_errors'])
    for test in fixtures['number_cases']:
        if test['token'] in ('1.0', '1e0'):
            neg('number:' + test['name'], by_id[test['case_id']],
                lambda c, v=json.loads(test['token']): resync_inline(c) if c['logical_payload'].update(occurrence=v) is None else c,
                ['number_domain'])
    for test in fixtures['type_cases'][:60]:
        neg('type:' + str(test.get('name', test['field'])), by_id[test['case_id']],
            lambda c, f=test['field'], v=test['value']: c['logical_payload'].update({f: copy.deepcopy(v)}), ['logical_payload_schema'])
    for base in family_cases(fixtures):
        sibling = next(c['definition'] for c in fixtures['contracts'] if c['definition'] != base['definition'])
        neg('P2A:event_id', base, lambda c: c['event'].update(event_id='evt_do_' + oracles.foreign_hex(c['event']['event_id'])))
        neg('P2A:thread_id', base, lambda c: c['event'].update(thread_id=c['event']['thread_id'] + '-foreign'))
        neg('P2A:run_id', base, lambda c: c['event'].update(run_id=c['event']['run_id'] + '-foreign'))
        neg('P2A:occurred_at_utc', base, lambda c: c['event'].update(occurred_at_utc='1999-01-01T00:00:00Z'))
        neg('P2A:payload_schema_id', base, lambda c, s=sibling: c['event'].update(
            payload_schema_id=oracles.member_payload_schema_id(s, c['logical_payload']['schema_version'])))
        neg('P2A:event_type_family', base, lambda c: c['event'].update(
            event_type='parser.error' if c['event_type'] != 'parser.error' else 'config.validation.failed'))
        neg('P2A:replay_policy_append_once', base, lambda c: c['event'].update(replay_policy='append_once'))
        if base['logical_payload']['scope'] == 'project':
            neg('P2A:project_id', base, lambda c: c['event'].update(project_id='project-foreign'))
            neg('P2A:scope_kind', base, lambda c: c['event'].update(scope_kind='application', project_id=None), None,
                "the EventRecord schema's if/then ties scope_kind to project_id: an application scope_kind needs a null "
                'project_id, so the scope join and the project join both refuse it')
    for case in events:
        family, context = case['event_type'], case['producer_context']
        if family == 'phase.force_completed':
            neg('P2A:phase_context_list', case, lambda c: c.update(producer_context=[c['producer_context']]))
            neg('P2A:phase_state', case, lambda c: c['producer_context'].update(phase_state='completed'))
            neg('P2A:completion_signal', case, lambda c: c['producer_context'].update(completion_signal=True))
            neg('P2A:max_questions_join', case, lambda c: c['producer_context'].update(max_questions=c['producer_context']['max_questions'] + 1)
                if c['logical_payload']['question_count'] > c['producer_context']['max_questions'] + 2 else
                c['producer_context'].update(max_questions=c['producer_context']['max_questions'] - 1))
            neg('P2A:question_count', case, lambda c: resync_inline(c) if c['logical_payload'].update(
                question_count=c['logical_payload']['max_questions'] + 1) is None else c)
        if family == 'subagent.output_truncated':
            neg('P2A:truncation', case, lambda c: resync_inline(c) if c['logical_payload'].update(
                truncated_length=c['logical_payload']['original_length'] + 1) is None else c)
        if family == 'subagent.retried':
            neg('P2A:retry_cause', case, lambda c: resync_inline(c) if c['logical_payload'].update(
                retry_cause=next(x for x in ('failure', 'blockage', 'interruption') if x != c['logical_payload']['retry_cause'])) is None else c)
            neg('P2A:prior_attempt_number', case, lambda c: resync_inline(c) if c['logical_payload'].update(
                prior_attempt_number=c['logical_payload']['prior_attempt_number'] + 7) is None else c)
            neg('P2A:attempt_number', case, lambda c: resync_inline(c) if c['logical_payload'].update(
                attempt_number=c['logical_payload']['attempt_number'] + 7) is None else c)
            neg('P2A:child_run_id', case, lambda c: resync_inline(c) if c['logical_payload'].update(
                child_run_id=c['logical_payload']['child_run_id'] + '-foreign') is None else c)
            neg('P2A:parent_run_id', case, lambda c: resync_inline(c) if c['logical_payload'].update(
                parent_run_id=c['logical_payload']['parent_run_id'] + '-foreign') is None else c)
            neg('P2A:transition', case, lambda c: c['producer_context'].update(permission_current=False))
    for index, test in enumerate(fixtures['context_type_cases']):
        if test['domain'] == 'phase':
            neg('ctx:' + str(index), by_id[test['case_id']], lambda c, x=test['context']: c.update(producer_context=copy.deepcopy(x)),
                ['phase_context_type'])
    view = lambda pair: oracles.append_full_view(pair[0], pair[1], contracts.identity, contracts.retry_allowed, root, formats)
    return [(cid, (case, schema)) for cid, case in controls], negatives, view


def transport_inputs(fixtures):
    by_id = {c['case_id']: c for c in fixtures['event_cases']}
    controls, negatives = [], []
    for case in fixtures['event_cases']:
        controls.append((case['case_id'], (case['event'], case['logical_payload'], case['payload_packs'], case.get('ingest_encoding', 'decoded'))))
    def external(base, logical):
        entry = oracles.pack_entry(logical)
        event = copy.deepcopy(base['event']); event['payload'] = {}; event['payload_ref'] = entry['blake3_id']
        packs = copy.deepcopy(base['payload_packs']); packs[entry['blake3_id']] = entry
        return event, packs, entry
    for test in fixtures['transport_cases']:
        base = by_id[test['case_id']]
        logical = copy.deepcopy(base['logical_payload'])
        field = test['field']
        logical[field] = test['text'] if field != 'message_ids' else [test['text']]
        event = copy.deepcopy(base['event']); event['payload'] = logical; event['payload_ref'] = None
        packs = copy.deepcopy(base['payload_packs'])
        if test['representation'] == 'external':
            event, packs, entry = external(base, logical)
            forge = test.get('forge')
            if forge == 'missing':
                del packs[entry['blake3_id']]
            elif forge == 'size':
                packs[entry['blake3_id']]['byte_size'] += 1
            elif forge == 'digest':
                packs[entry['blake3_id']]['blake3_id'] = 'blake3:' + 'f' * 64
            elif forge == 'media':
                packs[entry['blake3_id']]['media_type'] = 'image/png'
            elif forge == 'not_durable':
                packs[entry['blake3_id']]['index_durable'] = False
        item = (event, logical, packs, test.get('ingest_encoding', 'decoded'))
        tid = test['case_id'] + ':transport:' + test['name']
        if test['valid']:
            controls.append((tid, item))
        elif test.get('forge') in ('size', 'digest', 'media', 'not_durable'):
            negatives.append((tid, item, ['payload_pack_integrity_or_durability', 'payload_pack_identifier'], None, None))
        else:
            negatives.append((tid, item, None, test['case_id'], None))
    for test in fixtures['type_boundary_cases']:
        if test['domain'] == 'transport':
            base = by_id[test['case_id']]
            event = copy.deepcopy(base['event']); event['payload'] = copy.deepcopy(test['value'])
            negatives.append((test['case_id'] + ':type:' + str(test.get('name', len(negatives))),
                              (event, copy.deepcopy(test['value']), {}, 'decoded'), ['payload_types'], test['case_id'],
                              'the wrong-typed value is both the event payload and its logical copy, so both type rows refuse it '
                              '(the P2A:*_list negatives change one argument each)'))
    for base in family_cases(fixtures):
        cid = base['case_id']
        logical = base['logical_payload']
        event = copy.deepcopy(base['event']); event['payload'] = dict(event['payload'], operation_id=event['payload']['operation_id'] + '-x')
        negatives.append((cid + ':P2A:inline_join', (event, logical, base['payload_packs'], 'decoded'), None, cid, None))
        event = copy.deepcopy(base['event']); del event['payload_ref']
        negatives.append((cid + ':P2A:no_payload_ref', (event, logical, base['payload_packs'], 'decoded'), None, cid, None))
        negatives.append((cid + ':P2A:events_list', ([], logical, base['payload_packs'], 'decoded'), None, cid, None))
        negatives.append((cid + ':P2A:logical_list', (base['event'], [], base['payload_packs'], 'decoded'), None, cid, None))
        negatives.append((cid + ':P2A:packs_list', (base['event'], logical, [], 'decoded'), None, cid, None))
        event = copy.deepcopy(base['event']); event['payload'] = [logical]
        negatives.append((cid + ':P2A:inline_payload_list', (event, logical, base['payload_packs'], 'decoded'), None, cid, None))
        event, packs, entry = external(base, logical)
        controls.append((cid + ':external', (event, logical, packs, 'decoded')))
        bad = copy.deepcopy(event); bad['payload'] = {'leftover': True}
        negatives.append((cid + ':P2A:external_payload_not_empty', (bad, logical, packs, 'decoded'), None, cid + ':external', None))
        other = dict(logical, operation_id=logical['operation_id'] + '-other')
        forged = dict(oracles.pack_entry(other)); forged['blake3_id'] = entry['blake3_id']
        negatives.append((cid + ':P2A:external_entry_value', (event, logical, dict(packs, **{entry['blake3_id']: forged}), 'decoded'),
                          None, cid + ':external', None))
        moved = copy.deepcopy(event); moved['payload_ref'] = 'blake3:' + 'e' * 64
        negatives.append((cid + ':P2A:external_entry_id', (moved, logical, dict(packs, **{moved['payload_ref']: entry}), 'decoded'),
                          None, cid + ':external', None))
        text = dict(entry, media_type='text/plain; charset=utf-8')
        negatives.append((cid + ':P2A:external_entry_media', (event, logical, dict(packs, **{entry['blake3_id']: text}), 'decoded'),
                          None, cid + ':external', None))
    for case in fixtures['event_cases']:
        logical = case['logical_payload']
        if 'content_ref' in logical:
            ref = logical['content_ref']['blake3_id']
            packs = {k: v for k, v in case['payload_packs'].items() if k != ref}
            negatives.append((case['case_id'] + ':P2A:content_missing', (case['event'], logical, packs, 'decoded'), None, case['case_id'], None))
            changed = dict(case['payload_packs'], **{ref: dict(case['payload_packs'][ref], byte_size=case['payload_packs'][ref]['byte_size'] + 1)})
            negatives.append((case['case_id'] + ':P2A:content_field', (case['event'], logical, changed, 'decoded'), None, case['case_id'], None))
            break
    view = lambda item: oracles.transport_full_view(*item)
    return controls, negatives, view


def pack_inputs(fixtures):
    large = oracles.pack_entry({'large': 'x' * 17000})
    text = oracles.pack_entry('y' * 17000, 'text/plain; charset=utf-8')
    controls = [('pack:msgpack', (large, True)), ('pack:text', (text, True)), ('pack:small', (oracles.pack_entry({'a': 1}), False))]
    negatives = []
    for test in fixtures['type_boundary_cases']:
        if test['domain'] == 'pack':
            entry = copy.deepcopy(large); entry[test['field']] = copy.deepcopy(test['value'])
            negatives.append(('pack:type:' + test['field'] + ':' + json.dumps(test['value'])[:20], (entry, True), ['payload_pack_types'], 'pack:msgpack', None))
    changes = (
        ('not_object', lambda e: ['entry']), ('extra_member', lambda e: dict(e, probe=1)),
        ('bytes_durable_string', lambda e: dict(e, bytes_durable='true')), ('index_durable_int', lambda e: dict(e, index_durable=1)),
        ('byte_size_string', lambda e: dict(e, byte_size='1')), ('msgpack_value_list', lambda e: dict(e, value=[1])),
        ('media_png', lambda e: dict(e, media_type='image/png')), ('id_int', lambda e: dict(e, blake3_id=7)),
        ('id_upper', lambda e: dict(e, blake3_id=e['blake3_id'].upper())),
        ('id_forged', lambda e: dict(e, blake3_id='blake3:' + 'f' * 64)), ('size_forged', lambda e: dict(e, byte_size=e['byte_size'] + 1)),
        ('bytes_not_durable', lambda e: dict(e, bytes_durable=False)), ('index_not_durable', lambda e: dict(e, index_durable=False)),
    )
    for name, change in changes:
        negatives.append(('pack:P2A:' + name, (change(large), True), None, 'pack:msgpack', None))
    negatives.append(('pack:P2A:text_value_object', (dict(text, value={'a': 1}), True), None, 'pack:text', None))
    negatives.append(('pack:P2A:text_unencodable', (dict(text, value='\ud800'), True), None, 'pack:text', None))
    negatives.append(('pack:P2A:small_external', (oracles.pack_entry({'a': 1}), True), None, 'pack:small', None))
    def view(item):
        entry, is_large = item
        # The encoding is attempted where the lane attempts it: a six-member entry with the right types and an
        # allowed media type and identifier (pack_errors stops before it otherwise).
        result = {'entry': entry, 'large': is_large, 'expected_entry': None, 'pack_encoding_failed': None}
        view = {'entry': entry, 'large': is_large}
        if not any(oracles.run_rows(table, view) for table in (guards.PACK_SHAPE_ROWS, guards.PACK_TYPE_ROWS, guards.PACK_IDENTIFIER_ROWS)):
            result.update(oracles.pack_view(entry))
        return result
    return controls, negatives, view


def retry_context_inputs(fixtures):
    controls = [('transition:' + str(i), t['context']) for i, t in enumerate(fixtures['retry_transition_cases'])]
    negatives = [('ctx:' + str(i), t['context'], ['retry_context_type'], 'transition:0', None)
                 for i, t in enumerate(fixtures['context_type_cases']) if t['domain'] == 'retry']
    base = fixtures['retry_transition_cases'][0]['context']
    negatives.append(('ctx:P2A:not_object', [base], None, 'transition:0', None))
    negatives.append(('ctx:P2A:no_terminal_reason', {k: v for k, v in base.items() if k != 'prior_terminal_reason'}, None, 'transition:0', None))
    for field, wrong in (('retry_cause', 1), ('prior_state', None), ('operation_kind', ['retry'])):
        negatives.append(('ctx:P2A:' + field, dict(base, **{field: wrong}), None, 'transition:0', None))
    return controls, negatives, lambda context: {'context': context}


def retry_transition_inputs(fixtures):
    allowed = [(i, t) for i, t in enumerate(fixtures['retry_transition_cases']) if t['allowed']]
    controls = [('transition:' + str(i), t['context']) for i, t in allowed]
    negatives = [('transition:' + str(i), t['context'], ['retry_current_transition'], 'transition:' + str(allowed[0][0]), None)
                 for i, t in enumerate(fixtures['retry_transition_cases']) if not t['allowed']]
    base = next(t['context'] for _, t in allowed if t['context']['retry_cause'] == 'interruption')
    negatives.append(('transition:P2A:types', dict(base, stop_latched='false'), None, controls[0][0], None))
    negatives.append(('transition:P2A:fence', dict(base, interruption_fence=False), None, controls[0][0], None))
    view = lambda context: {'context': context, 'context_type_errors': oracles.retry_context_errors(context)}
    return controls, negatives, view


def historical_inputs(fixtures):
    root, formats = contracts.ROOT, contracts.UTC_FORMAT
    by_id = {c['case_id']: c for c in fixtures['event_cases']}
    controls = [(c['case_id'], c) for c in fixtures['event_cases']]
    controls += [('retained:' + c['case_id'], c) for c in fixtures['retained_event_cases']]
    negatives = []
    for test in fixtures['type_boundary_cases']:
        if test['domain'] == 'history':
            bad = copy.deepcopy(by_id[test['case_id']]); bad['historical_reader_state'][test['field']] = copy.deepcopy(test['value'])
            negatives.append((test['case_id'] + ':type:' + test['field'] + ':' + json.dumps(test['value'])[:16], bad, ['historical_state_schema'],
                              test['case_id'], None))
    for test in fixtures['historical_cases']:
        if not test['valid']:
            bad = copy.deepcopy(by_id[test['case_id']])
            for key, value in test['state_changes'].items():
                bad['historical_reader_state'][key] = copy.deepcopy(value)
            if 'current_producer_state' in test:
                bad['producer_context'] = copy.deepcopy(test['current_producer_state'])
            negatives.append((test['case_id'] + ':historical:' + test['name'], bad, [test['expected_error']], test['case_id'], None))
    for base in family_cases(fixtures):
        cid = base['case_id']
        def change(name, edit):
            bad = copy.deepcopy(base)
            edit(bad['historical_reader_state'])
            negatives.append((cid + ':P2A:' + name, bad, None, cid, None))
        change('reader_event_type', lambda s: s.update(event_type='parser.error' if base['event_type'] != 'parser.error' else 'config.validation.failed'))
        change('reader_id', lambda s: s.update(reader_id=s['reader_id'] + '.foreign'))
        change('supported_schema', lambda s: s.update(supported_payload_schema=s['supported_payload_schema'] + '.foreign'))
        for key in ('event_type', 'family_revision', 'payload_schema_id', 'event_id', 'scope_partition', 'storage_instance_id'):
            change('admission_' + key, lambda s, k=key: s['original_admission'].update({k: s['original_admission'][k] + '-foreign'}))
        change('admission_written', lambda s: s['original_admission'].update(admitted_when_written=False))
        change('source_sha256', lambda s: s.update(original_source_sha256=oracles.foreign_hex(s['original_source_sha256'])))
        change('source_ref', lambda s: s.update(original_source_ref=s['original_source_ref'] + '-foreign'))
        change('source_verified', lambda s: s.update(original_source_verified=False))
        change('access', lambda s: s.update(current_access_allowed=False))
        change('deleted', lambda s: s.update(source_deleted=True))
        change('hold', lambda s: s.update(hold_allows_disclosure=False))
    return controls, negatives, lambda case: oracles.historical_full_view(case, root, formats)


def retry_inputs(fixtures):
    by_id = {c['case_id']: c for c in fixtures['event_cases']}
    controls, negatives = [], []
    for test in fixtures['retry_cases']:
        original = by_id[test['case_id']]['event']
        item = (original, test['candidate'])
        if test['expected_status'] == 'original_result':
            controls.append((test['case_id'] + ':retry:' + test['name'], item))
        else:
            negatives.append((test['case_id'] + ':retry:' + test['name'], item, [test['expected_status']], None, None))
    first = {}
    for cid, item in controls:
        first.setdefault(cid.split(':retry:')[0], cid)
    negatives = [(n, item, codes, first[n.split(':retry:')[0]], lane) for n, item, codes, _, lane in negatives]
    for test in fixtures['type_boundary_cases']:
        if test['domain'] == 'retry':
            event = copy.deepcopy(by_id[test['case_id']]['event']); event[test['field']] = copy.deepcopy(test['value'])
            negatives.append((test['case_id'] + ':type:' + json.dumps(test['value'])[:16], (by_id[test['case_id']]['event'], event),
                              ['retry_value_schema'], first[test['case_id']], None))
    for test in fixtures['number_cases']:
        if test['token'] in ('1.0', '1e0'):
            base = by_id[test['case_id']]
            event = copy.deepcopy(base['event']); event['payload'] = dict(event['payload'], occurrence=json.loads(test['token']))
            negatives.append((test['case_id'] + ':number:' + test['token'], (base['event'], event), ['number_domain'], first[test['case_id']], None))
    for base in family_cases(fixtures):
        cid, original = base['case_id'], base['event']
        for key, value in (('event_id', 'evt_do_' + oracles.foreign_hex(original['event_id'])),
                           ('idempotency_key', original['idempotency_key'] + '-foreign')):
            negatives.append((cid + ':P2A:retry_' + key, (original, dict(original, **{key: value})), None, first[cid], None))
        # Another family's inline payload would fail that family's schema first; an externalized candidate is not
        # validated inline, so the family alone differs.
        other_family = 'parser.error' if original['event_type'] != 'parser.error' else 'config.validation.failed'
        negatives.append((cid + ':P2A:retry_event_type', (original, dict(original, event_type=other_family, payload={},
                          payload_ref='blake3:' + 'c' * 64)), None, first[cid], None))
        if original['scope_kind'] == 'project':
            negatives.append((cid + ':P2A:retry_project_id', (original, dict(original, project_id='project-foreign')), None, first[cid], None))
            negatives.append((cid + ':P2A:retry_scope_kind', (original, dict(original, scope_kind='application', project_id=None)), None, first[cid],
                              "the EventRecord schema's if/then ties scope_kind to project_id, so the candidate also changes project_id"))
        negatives.append((cid + ':P2A:retry_original_shape', (dict(original, schema_id=7), original), None, first[cid], None))
    return controls, negatives, lambda item: oracles.retry_full_view(*item)


def resync_application(case, keep_record=False):
    """Every copy and digest the application board checks derive from the source's original message, written back
    from it (as numeric_board_original_case does): the wrapper's record copy, the input and accepted-source digests,
    the accepted witness, the physical digest, the wrapper key, the stage witnesses and their proofs, and the source
    digest last."""
    source = case['source']
    message = source['original_input']
    if not keep_record:
        case['wrapper']['record'] = copy.deepcopy(message)
    source['original_input_semantic_sha256'] = oracles.semantic_hash('accepted_source', message)
    source['accepted_source_sha256'] = source['original_input_semantic_sha256']
    case['accepted_source_witness']['value'] = copy.deepcopy(message)
    case['physical_record_sha256'] = hashlib.sha256(oracles.packed(case['wrapper'])).hexdigest()
    case['wrapper_key'] = oracles.board_application_view(case)['expected_wrapper_key']
    oracles.refresh_stage_witnesses(case)
    return case


def board_inputs(fixtures):
    root, formats = contracts.ROOT, contracts.UTC_FORMAT
    boards = fixtures['board_storage_cases']
    controls = [('board:' + str(i), case) for i, case in enumerate(boards)]
    controls += [('board:' + str(i) + ':numeric', oracles.numeric_board_original_case(case))
                 for i, case in enumerate(boards) if case['payload']['scope'] == 'application']
    negatives = []
    for test in fixtures['board_custody_cases']:
        negatives.append(('custody:' + test['name'], oracles.custody_case(boards[test['board_index']], test), [test['expected_error']],
                          'board:' + str(test['board_index']) + (':numeric' if test.get('original_integral_float') else ''), None))
    nested = ('nested schemas: the source schema validates the original input it holds and the wrapper schema the record '
              'copy of it, so an input defect is refused by more than one application schema row')
    for i, test in enumerate(fixtures['board_successor_cases']):
        lane = None
        if test['expected_error'].startswith('application_') and test['case']['payload']['scope'] == 'application':
            verdicts = oracles.application_shape_view(test['case'], root, formats)
            if sum(verdicts[k] is not True for k in ('source_schema_valid', 'input_schema_valid', 'wrapper_schema_valid')) > 1:
                lane = nested
        negatives.append(('successor:' + test['name'], test['case'], [test['expected_error']], 'board:0', lane))
    for test in fixtures['project_source_join_cases']:
        bad = copy.deepcopy(boards[test['board_index']]); bad['source']['original_input'][test['field']] = test['value']
        negatives.append(('project_join:' + test['name'], bad, [test['expected_error']], 'board:' + str(test['board_index']), None))
    for i, base in enumerate(boards):
        cid = 'board:' + str(i)
        def change(name, edit, lane=None):
            bad = copy.deepcopy(base)
            edit(bad)
            negatives.append((cid + ':P2A:' + name, bad, None, cid, lane))
        change('stored_header', lambda c: c['payload'].update(schema_id='pm.event_payload.' + c['event_type'].replace('.', '_') + '.v1'),
               'a stored schema_id makes the payload refused by the closed member schema too; board_successor_cases hold the '
               'single-defect stored-header negatives')
        change('envelope_payload_schema_id', lambda c: c['envelope'].update(payload_schema_id='pm.event_payload.parser_error.v1@1.0.0'))
        change('envelope_scope_partition', lambda c: c['envelope'].update(scope_partition='project~Zm9yZWlnbg'))
        for field in ('run_id', 'thread_id', 'occurred_at_utc'):
            change('envelope_' + field, lambda c, f=field: c['envelope'].update({f: '1999-01-01T00:00:00Z' if f == 'occurred_at_utc' else c['envelope'][f] + '-foreign'}))
        change('envelope_scope', lambda c: c['envelope'].update(scope='foreign'))
        change('envelope_project_id', lambda c: c['envelope'].update(project_id='project-foreign'))
        change('replay_only', lambda c: c['envelope'].update(replay_policy='projector_replay_only'))
        change('replay_append_once', lambda c: c['envelope'].update(replay_policy='append_once'))
        change('identity_key', lambda c: c['envelope'].update(idempotency_key=c['envelope']['idempotency_key'] + '-foreign'))
        change('identity_event_id', lambda c: c['envelope'].update(event_id=c['envelope']['event_id'] + '-foreign'))
        if base.get('terminal_run') is not None:
            for field in ('scope', 'storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id', 'project_id'):
                change('anchor_' + field, lambda c, f=field: c['terminal_run'].update({f: str(c['terminal_run'].get(f)) + '-foreign'}))
            change('anchor_kind', lambda c: c['terminal_run'].update(kind='foreign'))
        change('payload_number', lambda c: c['payload'].update(probe_number=1.0))
        change('envelope_number', lambda c: c['envelope'].update(probe_number=1.0))

        def foreign_family(c):
            # Another (non-board) family, with the envelope ids recomputed for it, so only the family is foreign.
            c['event_type'] = 'parser.error'
            key, event_id = contracts.identity('parser.error', c['payload'])
            c['envelope'].update(idempotency_key=key, event_id=event_id)
        change('family_not_board', foreign_family)
        if base['payload']['scope'] == 'application':
            def message_change(edit):
                def apply(c):
                    edit(c, c['source']['original_input'])
                    resync_application(c)
                return apply
            change('wrapper_over_16k', message_change(lambda c, m: (m.update(inline_text='x' * 16300),
                   c['payload'].update(content='x' * 16300) if 'content' in c['payload'] else None)))
            change('body_representation', message_change(lambda c, m: (m.update(inline_text=None), c['payload'].pop('content', None))))
            change('message_thread_id', message_change(lambda c, m: m.update(thread_id=m['thread_id'] + '-foreign')))
            change('message_crew_id', message_change(lambda c, m: m.update(crew_id=m['crew_id'] + '-foreign')))
            change('message_run_id', message_change(lambda c, m: m.update(run_id=m['run_id'] + '-foreign')))
            change('message_sender', message_change(lambda c, m: m.update(sender_agent_id=m['sender_agent_id'] + '-foreign')))
            change('message_target_type', message_change(lambda c, m: m.update(receiver_agent_type='agent-type-foreign')))
            change('message_source', lambda c: (c['payload'].update(message_ids=['message-foreign']) if 'message_ids' in c['payload']
                                                else c['payload'].update(message_id='message-foreign')))
            change('wrapper_key', lambda c: (c.update(wrapper_key=c['wrapper_key'] + 'ff'), oracles.refresh_stage_witnesses(c)))
            change('source_storage_instance_id', lambda c: (c['source'].update(storage_instance_id='22222222-2222-4222-8222-222222222222'),
                                                            resync_application(c)))
            change('wrapper_storage_instance_id', lambda c: (c['wrapper'].update(storage_instance_id='22222222-2222-4222-8222-222222222222'),
                                                             resync_application(c, keep_record=True)))

            def operation(c):
                c['source']['original_operation_id'] += '-foreign'
                for stage in c['source']['stage_custody'].values():
                    stage['original_operation_id'] = c['source']['original_operation_id']
                resync_application(c)
            change('source_operation_join', operation)
            change('source_output_digest', lambda c: (c['source'].update(original_output_semantic_sha256='f' * 64), resync_application(c)))
            change('source_server_id', lambda c: (c['source'].update(server_id='server-foreign'), resync_application(c)))
            change('source_scope', lambda c: (c['source']['scope'].update(named_plan_id='plan-foreign'), resync_application(c)))
        if base['payload']['scope'] != 'application':
            def project_message(edit):
                return lambda c: edit(c, c['source']['original_input'])
            change('project_message_id', project_message(lambda c, m: m.update(message_id='message-foreign')))
            change('project_from_agent_id', project_message(lambda c, m: m.update(from_agent_id='agent-foreign')))
            change('project_priority', project_message(lambda c, m: m.update(priority='urgent' if m['priority'] != 'urgent' else 'low')))
            change('project_content', project_message(lambda c, m: m.update(content=(m['content'] or '') + ' foreign')))
            change('project_content_ref', project_message(lambda c, m: (m.update(content=None, content_ref={
                'blake3_id': 'blake3:' + 'a' * 64, 'byte_size': 20000, 'media_type': 'text/plain; charset=utf-8'}),
                c['payload'].update(content=None))))
            for field in ('scope', 'storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id', 'operation_id', 'project_id'):
                change('project_source_' + field, lambda c, f=field: c['source'].update({f: c['source'][f] + '-foreign'}))
            change('project_source_edition', lambda c: c['source'].update(edition='foreign'))
            change('project_source_interface', lambda c: c['source'].update(interface='foreign'))
            change('project_message_source', lambda c: c['source'].update(message_ids=c['source']['message_ids'] + ['foreign']))
    view = lambda case: board_full_view(case, root, formats)
    return controls, negatives, view


def project_input_inputs(fixtures):
    boards = fixtures['board_storage_cases']
    controls = [('board:' + str(i), {'source': case['source']}) for i, case in enumerate(boards) if case['payload']['scope'] != 'application']
    negatives = []
    for test in fixtures['project_source_cases']:
        bad = {'source': copy.deepcopy(boards[test['board_index']]['source'])}
        target = bad
        for key in test['path'][:-1]:
            target = target[key]
        target[test['path'][-1]] = copy.deepcopy(test['value'])
        negatives.append(('project_source:' + test['name'], bad, [test['expected_error']], 'board:' + str(test['board_index']), None))
    base_id, base = next((cid, case) for cid, case in controls)
    for name, edit in (('source_list', lambda s: ['x']), ('source_extra', lambda s: dict(s, probe='x')),
                       ('input_list', lambda s: dict(s, original_input=['x'])),
                       ('input_extra', lambda s: dict(s, original_input=dict(s['original_input'], probe='x'))),
                       # 9000 two-byte characters: 18000 UTF-8 bytes, over the 16 KiB inline limit, with no reference.
                       ('inline_body_over_16k', lambda s: dict(s, original_input=dict(s['original_input'], content='\u00e9' * 9000,
                                                                                       content_ref=None)))):
        negatives.append((base_id + ':P2A:' + name, {'source': edit(copy.deepcopy(base['source']))}, None, base_id, None))
    return controls, negatives, lambda item: project_input_full_view(item, contracts.UTC_FORMAT)


def board_member_inputs(fixtures):
    coordination_spec = importlib.util.spec_from_file_location('coordination_proof', ROOT / 'scripts/pm_coordination_events.py')
    coordination = importlib.util.module_from_spec(coordination_spec)
    coordination_spec.loader.exec_module(coordination)
    owner = json.loads((ROOT / coordination.PAYLOAD_PATH).read_text())['$defs']
    orchestrator = schema_doc()['$defs']
    controls, negatives = [], []
    for name in coordination.BOARD_MEMBERS:
        controls.append(('member:' + name, (name, owner, orchestrator)))
        header = {'const': f'pm.event_payload.{name}.v1'}
        both_o, both_r = copy.deepcopy(owner), copy.deepcopy(orchestrator)
        for defs in (both_o, both_r):
            defs[name]['properties']['schema_id'] = copy.deepcopy(header)
        negatives.append(('member:' + name + ':stored_header', (name, both_o, both_r), ['board_member_stored_header'], 'member:' + name, None))
        req_o, req_r = copy.deepcopy(owner), copy.deepcopy(orchestrator)
        for defs in (req_o, req_r):
            defs[name]['required'] = defs[name]['required'] + ['schema_id']
        negatives.append(('member:' + name + ':P2A:stored_header_required', (name, req_o, req_r), None, 'member:' + name, None))
        drift = copy.deepcopy(owner); drift[name]['properties']['subject_probe'] = {'type': 'string'}
        negatives.append(('member:' + name + ':copy_drift', (name, drift, orchestrator), ['board_member_copy_drift'], 'member:' + name, None))
        foreign = copy.deepcopy(owner); foreign[name]['$id'] = 'pm.event_payload.foreign.v1'
        negatives.append(('member:' + name + ':schema_id', (name, foreign, orchestrator), ['board_member_schema_id'], 'member:' + name, None))
        missing = copy.deepcopy(owner); del missing[name]
        negatives.append(('member:' + name + ':missing', (name, missing, orchestrator), ['board_member_definition_missing'], 'member:' + name, None))
    return controls, negatives, lambda item: oracles.board_member_view(*item)


def selected_inputs(fixtures):
    documents = oracles.selected_documents(contracts.ROOT)
    controls, negatives = [('selected:current', documents)], []
    for name, selection in oracles.SELECTED_SHARED_DEFINITIONS.items():
        for definition in selection['names']:
            for kind in ('tightened', 'removed'):
                result = dict(documents)
                result[name] = copy.deepcopy(documents[name])
                defs = result[name]['$defs']
                if kind == 'tightened':
                    defs[definition]['required'] = defs[definition].get('required', []) + ['probe_field']
                else:
                    defs.pop(definition)
                negatives.append(('selected:' + definition + ':' + kind, result, ['successor_selected_definitions'], 'selected:current', None))
    return controls, negatives, oracles.selected_definition_view


def coordination_storage_inputs(fixtures):
    storage = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    row = next(r for r in storage['families'] if r['family_id'] == 'coordination_event_records')
    coordination_spec = importlib.util.spec_from_file_location('coordination_proof2', ROOT / 'scripts/pm_coordination_events.py')
    coordination = importlib.util.module_from_spec(coordination_spec)
    coordination_spec.loader.exec_module(coordination)
    expected = coordination.expected_svr_rows()['coordination_event_records']
    landed = 'is landed in this registry (Storage retention landing `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`)'
    retired = 'remains on origin/plans/ea-storage-retention-20261104'
    drifted = dict(row, retention_compaction=row['retention_compaction'].replace(landed, retired))
    controls = [('storage:current', (row, expected))]
    negatives = [('storage:row_drift', (drifted, expected), ['actual_coordination_storage_member_drift'], 'storage:current', None),
                 ('storage:expected_drift', (row, dict(expected, retention_compaction=drifted['retention_compaction'])),
                  ['actual_coordination_storage_member_drift'], 'storage:current', None)]
    return controls, negatives, lambda item: oracles.coordination_storage_view(*item)


def successor_inputs(fixtures):
    inputs = oracles.successor_inputs(contracts.ROOT)
    controls, negatives = [('successor:current', inputs)], []

    def change(name, edit, regraph=True, lane=None):
        bad = copy.deepcopy(inputs)
        edit(bad)
        if regraph:
            graph = bad['graph']
            graph['graph_sha256'] = oracles.semantic_hash('source_graph', {k: v for k, v in graph.items() if k != 'graph_sha256'})
        negatives.append(('successor:P2A:' + name, bad, None, 'successor:current', lane))
    change('dangling_reference', lambda b: b['doc']['$defs']['OriginalCoordinationAppendSourceV2']['properties'].update(
        probe={'$ref': '#/$defs/DO_MISSING'}), regraph=False)
    change('graph_digest', lambda b: b['graph'].update(graph_sha256=oracles.foreign_hex(b['graph']['graph_sha256'])), regraph=False)
    change('resource_path', lambda b: b['graph']['resources'][0].update(schema_uri=b['graph']['resources'][0]['schema_uri'] + '#foreign'))
    change('resource_extra', lambda b: b['graph']['resources'].append(dict(b['graph']['resources'][0])))
    change('resource_hash', lambda b: b['file_sha256'].update({b['graph']['resources'][0]['path']: oracles.foreign_hex('file')}), regraph=False)
    change('method', lambda b: b['graph']['methods'][0].update(owner_doc='Plans/Contracts_V0.md#CV-000'))
    change('method_count', lambda b: b['graph']['methods'].append(dict(b['graph']['methods'][0])))
    graph_edits = (('graph_id', 'graph_id', 'app.foreign'), ('graph_edges', 'ordered_role_edges', []),
                   ('graph_methods', 'participating_method_ids', []), ('graph_physical_ids', 'physical_family_ids', []),
                   ('graph_selectors', 'event_selectors', []), ('graph_readers', 'reader_ids', []))
    for name, key, value in graph_edits:
        change(name, lambda b, k=key, v=value: b['graph']['graphs'][0].update({k: v}))
    def prefix_everywhere(b):
        # The key prefix and the Storage member's key shape that copies it, kept in step.
        old_prefix = b['graph']['physical_selection']['key_prefix']
        b['graph']['physical_selection']['key_prefix'] = old_prefix + '.foreign'
        row = next(x for x in b['storage']['families'] if x['family_id'] == 'crew_board_message_application_v2')
        row['key_shape'] = row['key_shape'].replace(old_prefix, old_prefix + '.foreign', 1)
    change('physical_key_prefix', prefix_everywhere)
    for name, key in (('physical_codec', 'codec_id'), ('physical_algorithm', 'codec_algorithm')):
        change(name, lambda b, k=key: b['graph']['physical_selection'].update({k: b['graph']['physical_selection'][k] + '.foreign'}))
    def wrapper_everywhere(b):
        # The wrapper root and its two copies (read/backup/restore and the Storage member), kept in step.
        foreign = 'Plans/foreign.schema.json#/$defs/X'
        b['graph']['physical_selection']['wrapper_root_ref'] = b['graph']['read_backup_restore']['wrapper_root_ref'] = foreign
        next(x for x in b['storage']['families'] if x['family_id'] == 'crew_board_message_application_v2')['value_schema_ref'] = foreign
    change('physical_wrapper', wrapper_everywhere)
    for name, key in (('rbr_reader', 'canonical_reader_id'), ('rbr_backup', 'backup_method_id'), ('rbr_restore', 'restore_method_id'),
                      ('rbr_wrapper', 'wrapper_root_ref'), ('rbr_source', 'source_root_ref'), ('rbr_owner', 'owner_ref'),
                      ('rbr_backup_owner', 'backup_owner_ref')):
        change(name, lambda b, k=key: b['graph']['read_backup_restore'].update({k: b['graph']['read_backup_restore'][k] + '.foreign'}))
    change('rbr_fences', lambda b: b['graph']['read_backup_restore'].update(same_source_access_deletion_hold_fences=False))

    def storage_row(b):
        return next(x for x in b['storage']['families'] if x['family_id'] == 'crew_board_message_application_v2')
    change('storage_missing', lambda b: b['storage'].update(families=[x for x in b['storage']['families']
                                                                      if x['family_id'] != 'crew_board_message_application_v2']), regraph=False)
    change('storage_value_schema', lambda b: storage_row(b)['value_schema'].update(description='probe'), regraph=False)
    for name, key in (('storage_schema_version', 'schema_version'), ('storage_value_schema_id', 'value_schema_id'),
                      ('storage_value_schema_ref', 'value_schema_ref'), ('storage_key_shape', 'key_shape')):
        change(name, lambda b, k=key: storage_row(b).update({k: storage_row(b)[k] + '.foreign'}), regraph=False)
    change('storage_profile', lambda b: b['storage']['storage_profile']['family_profiles']['crew_board_message_application_v2'].update(
        max_value_bytes=1), regraph=False)
    return controls, negatives, oracles.successor_view


BOUNDARIES.update({
    'append': (tables_named('APPEND_NUMBER_ROWS', 'APPEND_REFERENCE_ROWS', 'APPEND_SHAPE_ROWS', 'APPEND_JOIN_ROWS',
                            'APPEND_PHASE_CONTEXT_ROWS', 'APPEND_PREDICATE_ROWS', 'APPEND_RETRY_SOURCE_ROWS',
                            'APPEND_RETRY_TRANSITION_ROWS'), append_inputs),
    'transport': (tables_named('TRANSPORT_TYPE_ROWS', 'TRANSPORT_INLINE_ROWS', 'TRANSPORT_EXTERNAL_ROWS', 'TRANSPORT_CONTENT_ROWS',
                               'TRANSPORT_INGEST_ROWS', 'TRANSPORT_ENCODING_ROWS'), transport_inputs),
    'pack': (tables_named('PACK_SHAPE_ROWS', 'PACK_TYPE_ROWS', 'PACK_IDENTIFIER_ROWS', 'PACK_ENCODING_ROWS', 'PACK_INTEGRITY_ROWS'), pack_inputs),
    'retry_context': (tables_named('RETRY_CONTEXT_ROWS'), retry_context_inputs),
    'retry_transition': (tables_named('RETRY_TRANSITION_ROWS'), retry_transition_inputs),
    'historical': (tables_named('HISTORICAL_STATE_ROWS', 'HISTORICAL_READER_ROWS', 'HISTORICAL_DISCLOSURE_ROWS'), historical_inputs),
    'retry': (tables_named('RETRY_NUMBER_ROWS', 'RETRY_SHAPE_ROWS', 'RETRY_REPLAY_ROWS', 'RETRY_IDENTITY_ROWS', 'RETRY_SEMANTIC_ROWS'),
              retry_inputs),
    'board': (tables_named('BOARD_NUMBER_ROWS', 'BOARD_PROJECT_SOURCE_ROWS', 'BOARD_APPLICATION_SHAPE_ROWS',
                           'BOARD_APPLICATION_SOURCE_ROWS', 'BOARD_POSTED_ROWS', 'BOARD_JOIN_ROWS'), board_inputs),
    'project_input': (tables_named('PROJECT_INPUT_SHAPE_ROWS', 'PROJECT_INPUT_TYPE_ROWS', 'PROJECT_INPUT_VALUE_ROWS'), project_input_inputs),
    'board_member': (tables_named('BOARD_MEMBER_ROWS'), board_member_inputs),
    'selected': (tables_named('SELECTED_DEFINITION_ROWS'), selected_inputs),
    'coordination_storage': (tables_named('COORDINATION_STORAGE_ROWS'), coordination_storage_inputs),
    'successor': (tables_named('SUCCESSOR_ROWS', 'SUCCESSOR_GRAPH_ROWS', 'SUCCESSOR_STORAGE_COUNT_ROWS', 'SUCCESSOR_STORAGE_ROWS'),
                  successor_inputs),
})


def board_full_view(case, root, formats):
    view = {'payload_number_errors': oracles.record_number_errors(case['payload']),
            'envelope_number_errors': oracles.record_number_errors(case['envelope'])}
    try:
        if case['payload']['scope'] != 'application':
            view.update(board_branch='project', project_input_valid=not oracles.project_original_input_errors(case, formats))
            if view['project_input_valid']:
                view.update(oracles.board_project_view(case))
        else:
            view.update(oracles.application_shape_view(case, root, formats))
            view['application_shape_valid'] = all(view[k] for k in ('source_schema_valid', 'input_schema_valid', 'wrapper_schema_valid'))
            if view['application_shape_valid']:
                view.update(oracles.board_application_view(case))
    except (KeyError, TypeError, AttributeError, IndexError, ValueError):
        pass
    view.setdefault('project_input_valid', False)
    view.setdefault('application_shape_valid', False)
    view.update(contracts.board_join_view(case))
    return view


def project_input_full_view(item, formats):
    source = item['source']
    message = source.get('original_input') if type(source) is dict else None
    view = {'source': source, 'message': message, 'created_at_conforms': None, 'content_inline_body': None,
            'project_shape_valid': False, 'project_types_valid': False}
    view['project_shape_valid'] = not oracles.run_rows(guards.PROJECT_INPUT_SHAPE_ROWS, view)
    view['project_types_valid'] = view['project_shape_valid'] and not oracles.run_rows(guards.PROJECT_INPUT_TYPE_ROWS, view)
    if view['project_types_valid']:
        if type(message.get('created_at')) is str:
            view['created_at_conforms'] = formats.conforms(message['created_at'], 'date-time')
        if type(message.get('content')) is str:
            view['content_inline_body'] = oracles.inline_body(message['content'])
    return view


# ---- Rows no single-defect negative can reach, with the reason (sweep part 2A) ---------------------------------
# The full-table matrix requires the unwitnessed rows of each boundary to be exactly these; each sits in a suite of
# its own kind, so the guard tool reports it unproved without withholding another row's credit.

SCOPE_HELPER = ('delegated to the shared Projects helper `scope_failures` (scripts/pm_projects_refresh_contracts.py): the '
                'scope object is copied in the source, its original input, the wrapper and the wrapper record, closed by '
                'WorkflowScopeV2 and joined by source_scope_join, wrapper_scope_join and wrapper_record_join, so a '
                'schema-valid scope defect reaches more than one row or none (probe P2A:source_scope is refused by '
                '`application_source_schema`)')
SCOPE_CODES = ('application_scope_identity', 'outer_project_mismatch', 'project_partition_mismatch', 'server_scope_mismatch',
               'application_outer_project', 'application_thread_mismatch', 'wrapper_record_scope_mismatch',
               'wrapper_record_server_id_mismatch', 'wrapper_record_storage_instance_id_mismatch')
UNPROVED = dict({
    'coverage_complete': ("runtime duplicate of the checkpoint schema's const `complete_to_captured_boundary: true` (same field, "
                          'same predicate, codes checkpoint_schema and index_complete_source_coverage): the schema verdict refuses '
                          "every input it would (lane negative P1F05:incomplete_coverage reaches both); the tool's Duplicate "
                          'needs one code'),
    'event_type_pattern': ("runtime duplicate of the EventRecord schema's `event_type` pattern (same field, same pattern, codes "
                           'event_schema and event_type_join): standing negative identifier_lf reaches both'),
    'event_join_scope_kind': ("the EventRecord schema's if/then ties scope_kind to project_id, so a scope_kind other than the "
                              "payload's also changes project_id (probe P2A:scope_kind reaches both joins)"),
    'retry_same_scope_kind': ("the same EventRecord if/then: a candidate with another scope_kind also has another project_id "
                              '(probe P2A:retry_scope_kind)'),
    'application_input_schema': ('the V1/V2 source schema validates the original input it holds, so an input defect is refused by '
                                 '`application_source_schema` too: a nested duplicate under another code (lane negatives '
                                 'successor:*missing_subject and others reach both)'),
    'application_source_server_id': ("the source's server_id must equal its scope's (scope_failures server_scope_mismatch), so a "
                                     'server change reaches both rows (probe P2A:source_server_id)'),
    'application_wrapper_server_id': "the wrapper's server_id is bound to its scope the same way",
    'source_scope_join': ('every scope member is fixed by WorkflowScopeV2 and by scope_failures for an application source, so a '
                          "scope differing from the message's is refused by the schema or the helper (probe P2A:source_scope)"),
    'wrapper_scope_join': "the wrapper's scope is bound the same way",
}, **{record + '_scope_' + code: SCOPE_HELPER for record in ('source', 'wrapper') for code in SCOPE_CODES})


def matrix_errors(fixtures=None):
    """The complete checker's view of the guard tables: adapters current, every control accepted by every row, every
    negative refused by exactly its target (or recorded as lane-only or as a coupling probe), and the rows no
    negative witnesses exactly UNPROVED. Returns (errors, per-boundary counts)."""
    fixtures = fixtures or fixtures_now()
    errors, counts = list(adapter_errors()), {}
    unwitnessed = set()
    for name in BOUNDARIES:
        m = boundary_matrix(name, fixtures)
        errors += [('control_refused', name) + tuple(map(str, e[1:])) for e in m['errors']]
        errors += [('negative_defect', name, e['id'], e['defect'], tuple(e['refused_by'])) for e in m['negatives'] if 'defect' in e]
        unwitnessed |= set(m['unwitnessed_rows'])
        counts[name] = {'rows': len(m['rows']), 'controls': len(m['controls']), 'negatives': len(m['negatives']),
                        'single_defect': sum('target' in e for e in m['negatives']),
                        'lane_only': sum('lane_only' in e for e in m['negatives']),
                        'probes_coupled': sum('probe_coupled' in e for e in m['negatives']),
                        'other_boundary': sum('other_boundary' in e for e in m['negatives']),
                        'unwitnessed': m['unwitnessed_rows']}
    if unwitnessed != set(UNPROVED):
        errors.append(('unproved_rows_changed', sorted(unwitnessed - set(UNPROVED)), sorted(set(UNPROVED) - unwitnessed)))
    tabled = {row[0] for _t, _s, module in guards.SUITES for row in module.ROWS}
    covered = {row[0] for name, (tables_of, _) in BOUNDARIES.items() for _, rows in tables_of() for row in rows}
    if tabled != covered:
        errors.append(('rows_outside_every_boundary', sorted(tabled - covered)))
    return errors, counts


# ---- Matrix ------------------------------------------------------------------------------------------------------

def unique_inputs(inputs):
    """The boundary's inputs with every case id unique: a repeated fixture name gets a '#n' suffix."""
    controls, negatives, view_of = inputs
    seen = collections.Counter()
    def fresh(case_id):
        seen[case_id] += 1
        return case_id if seen[case_id] == 1 else case_id + '#' + str(seen[case_id])
    controls = [(fresh(cid), case) for cid, case in controls]
    negatives = [(fresh(nid),) + tuple(rest) for nid, *rest in negatives]
    return controls, negatives, view_of


def all_rows(tables):
    return [row for _, rows in tables for row in rows]


def boundary_matrix(name, fixtures):
    tables_of, inputs_of = BOUNDARIES[name]
    tables = tables_of()
    rows = all_rows(tables)
    controls, negatives, view_of = unique_inputs(inputs_of(fixtures))
    result = {'boundary': name, 'rows': [r[0] for r in rows], 'controls': [], 'negatives': [], 'errors': []}
    names = [r[0] for r in rows]
    assert len(set(names)) == len(names), 'duplicate row names'
    ids = [c[0] for c in controls] + [n[0] for n in negatives]
    if len(set(ids)) != len(ids):
        result['errors'].append(('duplicate_case_ids', sorted({i for i in ids if ids.count(i) > 1})[:10]))
    for cid, case in controls:
        refused = oracles.refusing_rows(rows, view_of(case))
        result['controls'].append({'id': cid, 'refused_by': refused})
        if refused:
            result['errors'].append(('control_refused', cid, refused))
    codes = {r[0]: r[3] for r in rows}
    for nid, case, expected, control, lane_only in negatives:
        view = view_of(case)
        refused = oracles.refusing_rows(rows, view)
        entry = {'id': nid, 'control': control, 'expected_codes': expected, 'refused_by': refused,
                 'view_keys': sorted(view)}
        if lane_only:
            entry['lane_only'] = lane_only
        elif expected is not None and not set(expected) & set(codes.values()):
            entry['other_boundary'] = True
        elif len(refused) == 1 and (expected is None or codes[refused[0]] in expected):
            entry['target'] = refused[0]
        elif ':P2A:' in nid and len(refused) != 1:
            # A negative this round generated to witness a row: when it cannot isolate one row it is evidence of how
            # the rows are coupled, recorded with the rows it reached, not a defect of the lane's fixtures.
            entry['probe_coupled'] = refused
        elif len(refused) > 1:
            entry['defect'] = 'refused_by_more_than_one_row'
        elif not refused:
            entry['defect'] = 'refused_by_no_row'
        else:
            entry['defect'] = 'refused_with_another_code'
        result['negatives'].append(entry)
    proved = {e['target'] for e in result['negatives'] if 'target' in e}
    result['unwitnessed_rows'] = [n for n in names if n not in proved]
    return result


def fixtures_now():
    return oracles.fixture_loads((ROOT / 'Plans/orchestrator_event_contract_fixtures.json').read_text())


def command_check_all(args):
    errors, counts = matrix_errors()
    print(json.dumps({'boundaries': counts, 'errors': errors[:40], 'error_count': len(errors)}, default=str))
    return 1 if errors else 0


def command_matrix(args):
    fixtures = fixtures_now()
    out = {}
    for name in args.boundary or BOUNDARIES:
        m = boundary_matrix(name, fixtures)
        out[name] = m
        defects = [e for e in m['negatives'] if 'defect' in e]
        print(json.dumps({'boundary': name, 'rows': len(m['rows']), 'controls': len(m['controls']),
                          'negatives': len(m['negatives']), 'control_errors': len(m['errors']),
                          'negative_defects': len(defects), 'unwitnessed_rows': m['unwitnessed_rows']}))
        for e in defects:
            print('  defect', e['id'], e['defect'], e['refused_by'], e['expected_codes'])
    if args.json:
        Path(args.json).write_text(json.dumps(out, indent=1, default=str) + '\n')


# ---- Adapters ----------------------------------------------------------------------------------------------------

FACTORY_MARKER = '# ---- generated factory ----\n'


def factory_text(rows):
    lines = ['', 'def factory():', '    table = g.GuardTable([']
    for name, subject, words, code, predicate, _reads, _group in rows:
        lines.append(f'        g.Guard({name!r}, g.Invariant({subject!r}, {words!r}), {code!r}, {predicate.__name__}),')
    lines += ['    ])', '    context = None', '', '    def check(complete):']
    lines += [f'        table.require({row[0]!r}, complete, context)' for row in rows]
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def suite_path(suite):
    return ROOT / CASES_DIR / ('do_' + suite + '.py')


def generated(suite, module):
    text = suite_path(suite).read_text()
    head, marker, _ = text.partition(FACTORY_MARKER)
    assert marker, ('factory marker missing', suite)
    return text, head + FACTORY_MARKER + factory_text(module.ROWS)


def adapter_errors():
    errors = []
    names = []
    for _table, suite, module in guards.SUITES:
        current, expected = generated(suite, module)
        if current != expected:
            errors.append('stale_adapter:' + suite)
        for row in module.ROWS:
            names.append(row[0])
            if row[0] != row[4].__name__ or row[4].__module__ != module.__name__:
                errors.append('row_predicate_name:' + row[0])
        defined = {n for n, v in vars(module).items() if callable(v) and getattr(v, '__module__', None) == module.__name__}
        if defined != {row[0] for row in module.ROWS} | {'factory'}:
            errors.append('suite_functions:' + suite + ':' + ','.join(sorted(defined ^ ({row[0] for row in module.ROWS} | {'factory'}))))
    if len(set(names)) != len(names):
        errors.append('duplicate_row_names')
    return errors


def command_generate(args):
    for _table, suite, module in guards.SUITES:
        current, expected = generated(suite, module)
        if current != expected:
            suite_path(suite).write_text(expected)
            print('wrote', suite_path(suite).relative_to(ROOT))
    return 0


def command_check(args):
    errors = adapter_errors()
    print(json.dumps({'adapters': len(guards.SUITES), 'errors': errors}))
    return 1 if errors else 0


# ---- Guard tool --------------------------------------------------------------------------------------------------

def suite_boundary(table):
    return next(name for name, (tables_of, _) in BOUNDARIES.items() if any(t == table for t, _ in tables_of()))


def cached_matrix(boundary, fixtures, out_dir):
    """The boundary's matrix, computed once per run and head: every suite of the boundary picks its negatives from it."""
    import subprocess
    head = subprocess.run(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    dirty = subprocess.run(['git', '-C', str(ROOT), 'status', '--porcelain', '--', 'scripts', 'Plans'], capture_output=True,
                           text=True).stdout.strip()
    path = Path(out_dir) / ('matrix-' + boundary + '.json') if out_dir else None
    if path and path.exists():
        cached = json.loads(path.read_text())
        if cached['head'] == head and not dirty and not cached['dirty']:
            return cached['matrix']
    matrix = boundary_matrix(boundary, fixtures)
    if path:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({'head': head, 'dirty': bool(dirty), 'matrix': matrix}, default=str) + '\n')
    return matrix


def suite_inputs(suite_name, fixtures, out_dir=None):
    """The tool's controls and negatives for one suite, projected to the keys its rows read."""
    import pm_guard_isolation as g
    table, module = next((t, m) for t, s, m in guards.SUITES if s == suite_name)
    boundary = suite_boundary(table)
    matrix = cached_matrix(boundary, fixtures, out_dir)
    _, inputs_of = BOUNDARIES[boundary]
    controls, negatives, view_of = unique_inputs(inputs_of(fixtures))
    rows = module.ROWS
    reads = sorted({key for row in rows for key in row[5]})
    project = lambda view: {key: view[key] for key in reads}
    targets = {row[0]: row[3] for row in rows}
    entries = {e['id']: e for e in matrix['negatives']}
    chosen, per_row = [], {}
    for nid, case, _codes, control, _lane in negatives:
        entry = entries[nid]
        target = entry.get('target')
        if target in targets and per_row.get(target, 0) < NEGATIVES_PER_ROW:
            per_row[target] = per_row.get(target, 0) + 1
            chosen.append((nid, case, target, control))
    used_controls = {c for *_, c in chosen}
    # Controls: every control a chosen negative was built from, plus the retained and compatibility originals (the
    # lane checker runs every positive through every row; the tool's controls are those the suite's negatives need).
    keep = used_controls | {cid for cid, _ in controls if cid.startswith(('retained:', 'compatibility:'))}
    if not keep:
        # A suite of unprovable rows has no negative; one control lets the tool run and report them unproved.
        keep = {controls[0][0]}
    tool_controls = [g.Control(cid, project(view_of(case)), 'retained_history') for cid, case in controls if cid in keep]
    tool_negatives = [g.Negative(nid, project(view_of(case)), target, targets[target], control,
                                 'lane negative ' + nid + ': one field changed from control ' + control)
                      for nid, case, target, control in chosen]
    missing = sorted(set(targets) - set(per_row))
    assert used_controls <= {c.id for c in tool_controls}, used_controls
    return module, tool_controls, tool_negatives, missing, reads


def run_suite(suite_name, out_dir):
    import pm_guard_isolation as g
    fixtures = fixtures_now()
    module, controls, negatives, missing, reads = suite_inputs(suite_name, fixtures, out_dir)
    path = str(suite_path(suite_name).relative_to(ROOT))
    non_guards = [g.NonGuard(path, 'factory', 'return', 'return g.Case(table, check, context)',
                             'Plumbing: returns the fresh case object the engine runs; it decides no acceptance.')]
    suite = g.Suite('do:' + suite_name, module.factory, controls, negatives, (path,), ROOT, non_guards=non_guards)
    start = time.monotonic()
    report = g.run(suite, memory=g.MemoryGate(max_rss=4096, pause_when_low=10, resume_at=11, poll=30))
    seconds = time.monotonic() - start
    rows = [{'id': r['id'], 'proved': r.get('proved'), 'own': r.get('own'), 'flips': r.get('flips'),
             'stays': len(r.get('stays') or []), 'masked': r.get('masked'), 'unrelated_changes': r.get('unrelated_changes')}
            for r in report['rows']]
    summary = {'suite': suite_name, 'status': report['status'], 'seconds': round(seconds, 1),
               'evaluations': report.get('evaluations'), 'controls': [c.id for c in controls],
               'negatives': [[n.id, n.target] for n in negatives], 'rows_without_negative': missing, 'reads': reads,
               'failures': [{k: f[k] for k in f if k in ('kind', 'error', 'guards', 'modules', 'sites', 'errors')}
                            for f in report['failures']][:20],
               'rows': rows, 'static_status': report.get('static', {}).get('status'),
               'static_undeclared': [{k: s[k] for k in ('path', 'function', 'kind', 'source')}
                                     for s in report.get('static', {}).get('sites', []) if not s['non_guard']][:20],
               'static_errors': report.get('static', {}).get('errors', [])[:10],
               'source_sha256': hashlib.sha256(suite_path(suite_name).read_bytes()).hexdigest()}
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / (suite_name + '.json')).write_text(json.dumps(report, default=str) + '\n')
    (out / (suite_name + '.summary.json')).write_text(json.dumps(summary, indent=1, default=str) + '\n')
    print(json.dumps({k: summary[k] for k in ('suite', 'status', 'seconds', 'evaluations')}
                     | {'proved': sum(bool(r['proved']) for r in rows), 'rows': len(rows),
                        'failures': sorted({f['kind'] for f in summary['failures']})}), flush=True)
    return 0 if report['status'] == 'PASS' else 1


def command_run(args):
    import subprocess
    names = args.suite or [s for _t, s, _m in guards.SUITES]
    status = 0
    for name in names:
        done = Path(args.out) / (name + '.summary.json')
        if args.resume and done.exists():
            continue
        code = subprocess.call([sys.executable, '-B', __file__, 'run-suite', name, '--out', args.out])
        status = status or code
    return status


def command_run_suite(args):
    return run_suite(args.name, args.out)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('matrix')
    p.add_argument('--boundary', action='append')
    p.add_argument('--json')
    p.set_defaults(run=command_matrix)
    p = sub.add_parser('check-all')
    p.set_defaults(run=command_check_all)
    p = sub.add_parser('generate')
    p.set_defaults(run=command_generate)
    p = sub.add_parser('check')
    p.set_defaults(run=command_check)
    p = sub.add_parser('run')
    p.add_argument('--suite', action='append')
    p.add_argument('--out', required=True)
    p.add_argument('--resume', action='store_true')
    p.set_defaults(run=command_run)
    p = sub.add_parser('run-suite')
    p.add_argument('name')
    p.add_argument('--out', required=True)
    p.set_defaults(run=command_run_suite)
    args = parser.parse_args(argv)
    return args.run(args)


if __name__ == '__main__':
    sys.exit(main())
