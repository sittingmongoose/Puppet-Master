#!/usr/bin/env python3
"""Card 1b static model: explicit adoption of DMEM's custody core; native NOT_RUN.

The injected policy resolver is synthetic test authority, never caller input or a real cutoff approval.
No age, activation score or count cutoff is selected by this file or its fixtures.
"""
from copy import deepcopy
from contextlib import contextmanager
from pathlib import Path
import importlib.util
import json
import argparse

ROOT = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location('_card1b_custody', ROOT / 'scripts/pm_memory_maintenance_events.py')
core = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(core)
JOBS = ('monthly_summary', 'prune_archive')
COMMANDS = {'cmd.chat.memory.summarize_monthly': 'monthly_summary',
            'cmd.chat.memory.prune_archive': 'prune_archive'}
_old_event_type = core.event_type

def event_type(row, phase):
    job = COMMANDS.get(row['command_id'])
    return 'memory.' + job + '.' + phase if job else _old_event_type(row, phase)

core.event_type = event_type
_old_payload_from = core.payload_from

def payload_from(row, suffix):
    value = _old_payload_from(row, suffix)
    if row['command_id'] in COMMANDS:
        value.update({k:row[k] for k in ('cutoff_ref','cutoff_sha256')})
        if COMMANDS[row['command_id']] == 'monthly_summary':
            value['month'] = row['month']
    return value

core.payload_from = payload_from

# Distinct module instance: the eight-family checker and its original fixture expectations are untouched.
_original_transition, _original_append, _original_accept = core.transition, core.append_current, core.accept
_original_require = core.require
_REMOVED = None
_REQUESTED_EVENT = None


def guard(name, test, reason=None):
    if name != _REMOVED:
        _original_require(test, reason or name)


def start_custody_gate(state, first_start=False, writer_event=None, canonical_history=False):
    """SP-636/SP-637 gate, with the canonical comparisons split by invariant for check 11.

    These are the original predicates; no retained value is repaired, substituted or reconstructed as proof.
    """
    core.require(core.flag(state['withdrawn'], False), 'permission_or_withdrawal')
    row = state['operation']; started = event_type(row, 'started'); completed = event_type(row, 'completed')
    expected = (core.canonical_value if canonical_history else core.full_value)(row, 'started'); start_id = expected['event_id']
    record = state['originals'].get(started)
    canonical = state.get('original') if writer_event == started else None
    terminal = state.get('original') if writer_event == completed else None
    later = [x.get('full_value') if isinstance(x, dict) else None
             for x in (state['originals'].get(completed), terminal) if x is not None]
    receipt_recorded = row['phase'] != 'accepted' or row['started_event_id'] is not None
    core.require(row['phase'] in core.lawful_phases(row), 'start_receipt_missing')
    core.require(row['started_event_id'] == (None if row['phase'] == 'accepted' else start_id), 'start_receipt_missing')
    if receipt_recorded or later:
        core.require(record is not None, 'start_receipt_missing')
        core.require(writer_event != started or canonical is not None, 'start_receipt_missing')
    elif not first_start:
        core.require(record is not None or canonical is not None, 'start_receipt_missing')
    if record is not None:
        core.require((core.historical_matches if canonical_history else core.original_matches)(record, expected), 'start_receipt_missing')
    if canonical is not None:
        value = canonical.get('full_value') if isinstance(canonical, dict) else None
        reference = core.canonical_value(row, 'started')
        core.require(isinstance(value, dict) and core.original_matches(canonical, value), 'start_receipt_missing')
        guard('envelope_schema', core.historical_envelope_matches(value), 'start_receipt_missing')
        guard('payload_schema', core.validator('Plans/memory_maintenance_event_payloads.schema.json',
                                               started.replace('.', '_')).is_valid(value['payload']), 'start_receipt_missing')
        producer = set(reference) - core.STORAGE_FIELDS - {'payload', 'replay_policy'}
        guard('semantic_binding', core.retained_binding({k: value[k] for k in producer}, {k: reference[k] for k in producer}), 'start_receipt_missing')
        guard('replay_policy', value['replay_policy'] == reference['replay_policy'], 'start_receipt_missing')
        guard('semantic_binding', core.retained_binding(value['payload'], reference['payload']), 'start_receipt_missing')
    for value in later:
        core.require(isinstance(value, dict) and value.get('causation_event_id') == start_id
                     and isinstance(value.get('payload'), dict)
                     and value['payload'].get('started_event_id') == start_id, 'start_receipt_missing')

core.start_custody_gate = start_custody_gate


def cutoff_gate(state):
    row = state['operation']; job = COMMANDS[row['command_id']]
    record = state.get('cutoff_authorities', {}).get(row['cutoff_ref'])
    guard('cutoffs_unavailable', record is not None)
    # A removed availability guard models an unchecked missing-policy dispatch; no real policy is invented.
    if record is None:
        return
    shape = isinstance(record, dict) and set(record) == {'job','scope_kind','project_id','cutoff_ref','selection_contract_sha256','approval_decision_ref'}
    guard('cutoff_record', shape)
    if not shape:
        return
    guard('cutoff_reference', record['cutoff_ref'] == row['cutoff_ref'])
    guard('cutoff_unique', sum(isinstance(value, dict) and value.get('cutoff_ref') == row['cutoff_ref']
                               for value in state['cutoff_authorities'].values()) <= 1)
    guard('cutoff_scope', record['job'] == job and record['scope_kind'] == 'project'
          and record['project_id'] == row['project_id'])
    guard('cutoff_commitment', core.digest(record) == row['cutoff_sha256'])


def panel(state):
    try:
        cutoff_gate(state)
    except core.Refusal:
        return {'available': False, 'reason': 'Approved age and activation-score cutoffs are missing'}
    return {'available': True, 'reason': None}


def memory_flags(memories):
    return type(memories) is dict and all(type(memory) is dict and all(type(memory.get(field)) is bool
        for field in ('pinned', 'archived')) for memory in memories.values())


def archive_candidate(before, job):
    guard('memory_flags', memory_flags(before['memories']))
    after = deepcopy(before)
    selected = before['selected_ids']
    guard('selection_unique', selected == sorted(set(selected)))
    guard('selection_exists', all(k in before['memories'] for k in selected))
    guard('selection_pinned', all(before['memories'][k]['pinned'] is not True for k in selected if k in before['memories']))
    guard('selection_kind', job != 'monthly_summary'
          or all(before['memories'][k]['kind'] == 'Note' for k in selected if k in before['memories']))
    for key in selected:
        if key in after['memories']:
            after['memories'][key]['archived'] = True
    if job == 'monthly_summary':
        after['summary'] = {'original_ids': list(selected),
                            'evidence_refs': sorted({r for key in selected
                                                     for r in before['memories'].get(key, {}).get('evidence_refs', [])})}
    return after


def archive_validate(before, after, job):
    guard('memory_flags', memory_flags(before['memories']) and memory_flags(after['memories']))
    source = before['memories']; result = after['memories']; selected = set(before['selected_ids'])
    guard('originals_preserved', set(source) <= set(result))
    # Each check owns a distinct defect; absent originals are checked above, not misreported as lost refs.
    common = set(source) & set(result)
    guard('evidence_preserved', all(source[k]['evidence_refs'] == result[k]['evidence_refs'] for k in common))
    guard('versions_preserved', all(source[k]['version_ref'] == result[k]['version_ref'] for k in common))
    # Together with evidence/versions above this compares each selected original in full except archived.
    # Keep those independently tested fields out of this predicate, avoiding an unnamed duplicate guard.
    guard('selected_fields_preserved', all(
        {field: value for field, value in source[k].items() if field not in ('archived', 'evidence_refs', 'version_ref')}
        == {field: value for field, value in result[k].items() if field not in ('archived', 'evidence_refs', 'version_ref')}
        for k in common & selected if source[k]['pinned'] is not True))
    guard('pins_preserved', all(source[k] == result[k] for k in common if source[k]['pinned'] is True))
    guard('selected_archived', all(result[k]['archived'] for k in common & selected if source[k]['pinned'] is not True))
    guard('unselected_preserved', all(source[k] == result[k] for k in common - selected if source[k]['pinned'] is not True))
    guard('no_extra_memories', set(result) <= set(source))
    if job == 'monthly_summary':
        expected = {'original_ids': before['selected_ids'],
                    'evidence_refs': sorted({r for k in selected for r in source[k]['evidence_refs']})}
        guard('summary_provenance', after.get('summary') == expected)
    else:
        guard('no_prune_summary', after.get('summary') == before.get('summary'))
    return True


def transition(before, action):
    if action['op'] != 'crash':
        cutoff_gate(before)
    candidate = None
    if action['op'] == 'settle' and action.get('status') == 'succeeded':
        job = COMMANDS[before['operation']['command_id']]
        candidate = archive_candidate(before['archive'], job)
        archive_validate(before['archive'], candidate, job)
    global _REQUESTED_EVENT
    requested = _REQUESTED_EVENT
    try:
        _REQUESTED_EVENT = action.get('event_type')
        after, output = _original_transition(before, action)
    finally:
        _REQUESTED_EVENT = requested
    if candidate is not None:
        after['archive'] = candidate
    if action['op'] != 'crash':
        cutoff_gate(after)
    return after, output


def append_current(before, value, event):
    """The adopted boundary with invariant-specific checks (no blanket equality hiding a schema defect)."""
    cutoff_gate(before)
    state = deepcopy(before); row = state['operation']; suffix = event.rsplit('.', 1)[1]
    guard('commitment_numbers', core.numbers_supported(value), 'invalid_number')
    guard('envelope_schema', core.envelope_validator().is_valid(value))
    if value['replay_policy'] == 'projector_replay_only' and _REMOVED != 'replay_policy':
        raise core.Refusal('replay_only_not_appendable')
    guard('replay_policy', value['replay_policy'] == 'dedupe_by_idempotency_key')
    guard('admission', core.flag(state['admitted'], True))
    guard('permission_or_withdrawal', core.flag(state['permission'], True) and core.flag(state['withdrawn'], False))
    guard('operation_valid', core.valid_operation(row, core.operation_name(event), state['original'] is not None))
    expected = core.canonical_value(row, suffix)
    producer_fields = set(expected) - core.STORAGE_FIELDS - {'payload', 'replay_policy'}
    guard('semantic_binding', all(value[k] == expected[k] for k in producer_fields), 'producer_join')
    guard('payload_schema', core.validator('Plans/memory_maintenance_event_payloads.schema.json',
                                          event.replace('.', '_')).is_valid(value['payload']))
    guard('semantic_binding', all(value['payload'].get(k) == v for k, v in expected['payload'].items()), 'payload_join')
    # The closed schema's bounded fields prove its entire MessagePack payload is below 16 KiB.
    # No unreachable second inline-cap guard obscures schema-negative isolation.
    guard('partition', state['dedupe_key'] == [core.scope_partition(row['project_id']), event, value['idempotency_key']])
    core.start_custody_gate(state, first_start=suffix == 'started', writer_event=event)
    if state['original'] is not None:
        original = state['original']['full_value']
        if suffix == 'completed':
            guard('original_value', core.original_matches(state['original'], original)
                  and core.historical_envelope_matches(original)
                  and core.retained_binding({k: original[k] for k in set(expected) - core.STORAGE_FIELDS},
                                           {k: value[k] for k in set(expected) - core.STORAGE_FIELDS}))
        output = deepcopy(original)
    else:
        guard('phase', row['phase'] == ('accepted' if suffix == 'started' else 'effect_committed'))
        state['original'] = core.retained(value); state['append_count'] += 1
        output = deepcopy(value)
    core.start_custody_gate(before, first_start=suffix == 'started', writer_event=event)
    core.start_custody_gate(state, writer_event=event)
    return state, output


def accept(payload, contract, context):
    try:
        cutoff_gate(context)
    except core.Refusal:
        return False
    return _original_accept(payload, contract, context)

core.transition, core.append_current, core.accept = transition, append_current, accept

# Logical guard groups span redundant checks of the same invariant. All original sites are restored in finally.
REASONS = {'invalid_operation': 'operation_valid', 'invalid_operation_after': 'operation_valid',
           'start_receipt_missing': 'start_custody', 'not_admitted': 'admission',
           'permission_or_withdrawal': 'permission_or_withdrawal',
           'replay_only_not_appendable': 'replay_policy', 'replay_policy_mismatch': 'replay_policy',
           'envelope_join': 'semantic_binding', 'idempotency_conflict': 'semantic_binding',
           'invalid_payload': 'payload_schema', 'invalid_event_record': 'envelope_schema',
           'inline_payload_too_large': 'inline_cap', 'scope_partition_mismatch': 'partition',
           'original_value_changed': 'original_value', 'original_missing': 'original_custody', 'request_changed': 'request',
           'operation_cas_conflict': 'operation_cas', 'wrong_phase': 'phase',
           'terminal_receipt_missing': 'terminal_custody', 'source_changed': 'source',
           'repeated_effect': 'effect_once', 'committed_effect_cannot_fail': 'effect_once',
           'outcome_invalid': 'outcome', 'unknown_action': 'action', 'unknown_event': 'history_event'}

def _require(test, reason):
    name = REASONS.get(reason, reason)
    if reason == 'original_missing' and (_REQUESTED_EVENT or '').endswith('.started'):
        name = 'start_custody'
    if name != _REMOVED:
        _original_require(test, reason)

core.require = _require

_ISOLATION = None


def guard_isolation():
    """Load the sibling audit by absolute path, including when this checker is imported by a reviewer."""
    global _ISOLATION
    if _ISOLATION is None:
        spec = importlib.util.spec_from_file_location('_dmem_guard_isolation', ROOT / 'scripts/pm_memory_guard_isolation.py')
        _ISOLATION = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_ISOLATION)
    return _ISOLATION


@contextmanager
def removed(name):
    """Audit-only removal of one logical guard, restored even when a probe fails."""
    global _REMOVED
    if name == 'semantic_binding':
        custody_mutant = guard_isolation().custody_mutant
        saved = _REMOVED
        try:
            _REMOVED = name
            with custody_mutant(core, 'custody_binding', archive=True):
                yield
        finally:
            _REMOVED = saved
        return
    if name.startswith('custody_'):
        custody_mutant = guard_isolation().custody_mutant
        with custody_mutant(core, name, archive=True):
            yield
        return
    saved = _REMOVED
    try:
        _REMOVED = name
        yield
    finally:
        _REMOVED = saved


_core_read_history = core.read_history

def read_history(state, event):
    # Deliberately no live cutoff check; retained bytes valid when written do not depend on today's policy.
    global _REQUESTED_EVENT
    requested = _REQUESTED_EVENT
    try:
        _REQUESTED_EVENT = event
        return _core_read_history(state, event)
    finally:
        _REQUESTED_EVENT = requested


core.read_history = read_history

def probe(case, fixtures, contracts):
    """The actual model entry points, not a parallel classifier. Negative mutations are fixture-declared."""
    family = next(f for f in fixtures['families'] if f['event_type'] == case['event_type'])
    kind = case['kind']
    state = deepcopy(family['states'][case.get('initial', 'started') if case.get('initial', 'started') in family['states'] else 'started'])
    value = deepcopy(case.get('value'))
    action = deepcopy(case.get('action'))
    if kind == 'writer':
        state = deepcopy(family['writer_states'][case['initial']])
        value = core.canonical_value(state['operation'], case['event_type'].rsplit('.', 1)[1])
    context = {'state': state, 'value': value, 'action': action}
    context = core.patch(context, case.get('edits', []))
    before = deepcopy(context)
    try:
        state, value, action = (deepcopy(context[k]) for k in ('state', 'value', 'action'))
        if kind == 'matrix':
            adopted = {'cases':[x for f in fixtures['families'] for x in f['boundary_cases']]}
            ctx = {'event_type':case['event_type'], 'states':family['states'], 'writer_states':family['writer_states']}
            result = core.matrix_call(adopted, ctx, case['path'], case.get('matrix_edits', []), contracts)
            if result[0] == 'refused':
                raise core.Refusal(result[1] if result[1] is not False else case['refusal'])
        elif kind == 'writer':
            result = append_current(state, value, case['event_type'])
        elif kind == 'phase':
            if 'expected_state' in action:
                action['expected_operation'] = deepcopy(family['states'][action.pop('expected_state')]['operation'])
            result = transition(state, action)
        elif kind == 'panel':
            result = panel(state)
            if not result['available']:
                raise core.Refusal('cutoffs_unavailable')
        elif kind == 'archive_candidate':
            result = archive_candidate(context['state']['archive'], COMMANDS[state['operation']['command_id']])
        elif kind == 'archive':
            result = archive_validate(case['before'], case['after'], COMMANDS[state['operation']['command_id']])
        elif kind == 'history':
            result = read_history(state, case['read'])
        elif kind == 'checkpoint':
            result = core.checkpoint_identity_matches(case['checkpoint'], state['operation'], case['value'], case['event_type'])
            guard('checkpoint_join', result)
        elif kind == 'schema':
            result = (core.envelope_validator() if case.get('definition') is None else
                      core.validator(case['schema'], case['definition'])).is_valid(case['value'])
            guard(case['guard'], result)
        elif kind == 'references':
            docs = deepcopy(core.checked_documents()); doc = docs[case['schema']]
            doc['$defs'][case['definition']]['$defs'] = {'dormant': {'$ref': '#/$defs/not_present'}}
            guard('references_resolve', not core.unresolved_references(docs))
            result = True
        else:
            raise AssertionError(kind)
    except core.Refusal as error:
        assert context == before, (case['name'], 'refusal mutated its inputs')
        return {'accepted': False, 'refusal': str(error)}
    assert context == before, (case['name'], 'entry point mutated caller inputs')
    return {'accepted': True}


def run_guards(fixtures, contracts):
    cases = fixtures['guard_cases']; names = [c['name'] for c in cases]
    assert len(names) == len(set(names))
    for case in cases:
        control = deepcopy(case)
        control['edits'] = []
        control['matrix_edits'] = []
        if 'control_action' in case:
            control['action'] = case['control_action']
        if case['kind'] == 'archive':
            control['after'] = case['control_after']
        elif case['kind'] == 'schema':
            control['value'] = case['control_value']
        elif case['kind'] == 'checkpoint':
            control['checkpoint'] = case['control_checkpoint']
            control['value'] = case.get('control_value', case['value'])
        elif case['kind'] == 'references':
            # Resolving reference control independently walks the same document, with no mutation.
            assert not core.unresolved_references(core.checked_documents())
            control = None
        if control is not None:
            assert probe(control, fixtures, contracts)['accepted'], (case['name'], 'invalid positive control')
        result = probe(case, fixtures, contracts)
        assert result == {'accepted': False, 'refusal': case['refusal']}, (case['name'], result)
    table = []
    for name in sorted({case['guard'] for case in cases}):
        own = [c for c in cases if c['guard'] == name]
        others = [c for c in cases if c['guard'] != name]
        with removed(name):
            flipped = [c['name'] for c in own if probe(c, fixtures, contracts)['accepted']]
            stayed = [c['name'] for c in others if probe(c, fixtures, contracts)
                      == {'accepted': False, 'refusal': c['refusal']}]
        assert len(flipped) == len(own), (name, 'masked negative', set(c['name'] for c in own)-set(flipped))
        assert len(stayed) == len(others), (name, 'unrelated negative changed', set(c['name'] for c in others)-set(stayed))
        table.append({'guard': name, 'negatives_that_flip': flipped, 'other_negatives_stay_rejected': len(stayed),
                      'other_negatives': [c['name'] for c in others], 'restored': True})
    assert _REMOVED is None
    return table


def run_adopted_paths(fixtures, contracts):
    counts = {}
    for family in fixtures['families']:
        event = family['event_type']; steps = 0
        for trace in family['traces']:
            state = deepcopy(family['states'][trace['initial']])
            for step in trace['steps']:
                action = deepcopy(step['action'])
                if 'expected_state' in action:
                    action['expected_operation'] = deepcopy(family['states'][action.pop('expected_state')]['operation'])
                state, output = transition(state, action)
                assert state == family['states'][step['after']], (trace['name'], action['op'], 'after')
                assert output == step.get('output'), (trace['name'], 'output')
                steps += 1
        for case in family['writer_cases']:
            state = deepcopy(family['writer_states'][case['initial']])
            for step in case['steps']:
                state, output = append_current(state, step['value'], event)
                assert state == family['writer_states'][step['after']], (case['name'], 'after')
                assert output == step['output'], (case['name'], 'original')
                steps += 1
        for case in family['boundary_cases']:
            assert accept(case['payload'], contracts[event], case['context']), case['name']
        for case in family['history_cases']:
            state = core.patch(family['states'][case['initial']], case.get('edits', []))
            assert read_history(state, case['read']) == case['output'], case['name']
            state['cutoff_authorities'] = {}
            assert read_history(state, case['read']) == case['output'], (case['name'], 'live cutoff affected history')
        counts[event] = {'phase_writer_steps': steps, 'positive_boundaries': len(family['boundary_cases']),
                         'history_cases_each_with_and_without_cutoffs': len(family['history_cases'])}
    return counts


def payload_upper_bounds(families):
    bounds = {}
    for event in families:
        schema = core.load('Plans/memory_maintenance_event_payloads.schema.json')['$defs'][event.replace('.', '_')]
        assert schema['additionalProperties'] is False and set(schema['required']) == set(schema['properties'])
        largest = {}
        for key, prop in schema['properties'].items():
            if 'const' in prop:
                largest[key] = prop['const']
            elif 'enum' in prop:
                largest[key] = max(prop['enum'], key=lambda x:len(core._CODEC.binding_bytes(x)))
            else:
                # A Unicode scalar takes at most four UTF-8 bytes. Using it also overbounds ASCII patterns.
                assert 'maxLength' in prop, (event, key, 'unbounded inline property')
                largest[key] = '\U0010ffff' * prop['maxLength']
        bounds[event] = len(core._CODEC.binding_bytes(largest))
        assert bounds[event] <= 16384, (event, bounds[event])
    return bounds


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--family'); args = parser.parse_args()
    core.check_resources()
    contracts = core.load('Plans/memory_archive_contracts.json')
    fixtures = core.load('Plans/memory_archive_event_fixtures.json')
    families = {f['event_type']: f for f in contracts['families']}
    assert len(families) == 4 and {f['event_type'] for f in fixtures['families']} == set(families)
    registered = {x['event_type'] for x in core.load('Plans/event_family_registry.json')['families']}
    assert not set(families) & registered
    if args.family:
        assert args.family in families
        families = {args.family: families[args.family]}; fixtures = core.select_family(fixtures, args.family)
    core.require_resolved_references()
    values = core.load('Plans/storage_value_registry.json')['families']
    operations = core.load('Plans/memory_maintenance_operation.schema.json')['$defs']
    for job in JOBS:
        value = next(v for v in values if v['family_id'] == 'memory_' + job + '_operation')
        assert value['value_schema'] == operations[job]
        assert value['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        assert value['status'] == 'deferred_not_build_blocking'
        assert not core.unresolved_references({'registry': core.load('Plans/storage_value_registry.json')},
                                              roots={'registry': [('', value['value_schema'])]})
    for event, contract in families.items():
        path, unit = contract['storage_owner'].split('#')
        text = (ROOT/path).read_text().split('### '+unit+' - ',1)[1].split('\n### ',1)[0]
        for token in (event, contract['payload_schema_id'], contract['consumer_id'], 'SP-278', 'SP-286', 'CV-339',
                      'cutoffs_unavailable', 'start_receipt_missing', 'replay_only_not_appendable', 'DL-402', 'DL-403'):
            assert token in text, (event, token)
    bounds = payload_upper_bounds(families)
    paths = run_adopted_paths(fixtures, families)
    guards = run_guards(fixtures, families)
    canonical_history = core.run_canonical_history(core.load('Plans/memory_canonical_history_fixtures.json'), families)
    numeric_writers = core.run_numeric_writers(fixtures['families'])
    contexts = {f['event_type']: f for f in fixtures['families']}
    domains = core.boundary_domains().run(core, contexts, [c for f in fixtures['families'] for c in f['boundary_cases']], __import__('sys').modules[__name__])
    recipes = core.write_recipes().run(core, contexts, __import__('sys').modules[__name__])
    print(json.dumps({'status':'pass','families':paths,'guard_cases':len(fixtures['guard_cases']),
                      'guard_removal_table':guards,'canonical_history_cases':canonical_history,
                      'numeric_writer_cases':numeric_writers,'boundary_domains':domains,'write_recipes':recipes,
                      'payload_messagepack_upper_bounds':bounds,'native':'NOT_RUN','admission':'ABSENT',
                      'real_cutoffs':'ABSENT; numeric proposals in report only'},indent=2))

if __name__ == '__main__':
    main()
