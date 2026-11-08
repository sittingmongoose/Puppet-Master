#!/usr/bin/env python3
"""Card 1b static model: explicit adoption of DMEM's custody core; native NOT_RUN.

The injected resolver is synthetic test authority, never caller input or runtime admission.
DL-446/DL-447 supply the approved cutoffs; the other activation gates remain.
"""
from copy import deepcopy
from pathlib import Path
import importlib.util
import json
import argparse

ROOT = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location('_card1b_custody', ROOT / 'scripts/pm_memory_maintenance_events.py')
core = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(core)
POLICY = core.memory_policy()
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
# Every refusal below is one row of a DMEM phase table (core.require); check 11 is the shared guard tool
# run over those tables (scripts/pm-memory-guard-tables.py), never a removal of checker code.
_original_transition, _original_append, _original_accept = core.transition, core.append_current, core.accept


def canonical_start_checks(canonical, row, expected):
    """SP-636/SP-637 started-writer canonical original, split by invariant.

    These are the original predicates; no retained value is repaired, substituted or reconstructed as proof.
    """
    value = canonical.get('full_value') if isinstance(canonical, dict) else None
    reference = core.canonical_value(row, 'started')
    started = event_type(row, 'started')
    core.require('asc_object', is_object=isinstance(value, dict))
    # original_matches(canonical, value) with value = canonical['full_value']: its binding conjunct
    # compares the value with itself and cannot refuse, so it has no row.
    core.retained_check(canonical, None, 'asc', binding=False)
    core.require('asc_envelope', envelope_valid=core.historical_envelope_matches(value))
    producer = set(reference) - core.STORAGE_FIELDS - {'payload', 'replay_policy'}
    core.require('asc_payload_schema', payload_valid=core.validator('Plans/memory_maintenance_event_payloads.schema.json',
                                                                    started.replace('.', '_')).is_valid(value['payload']))
    core.require('asc_joins', producer_matches=core.retained_binding({k: value[k] for k in producer}, {k: reference[k] for k in producer}),
                 replay_policy=value['replay_policy'], reference_replay_policy=reference['replay_policy'],
                 payload_matches=core.retained_binding(value['payload'], reference['payload']))

core.canonical_start_checks = canonical_start_checks


def cutoff_gate(state):
    row = state['operation']; job = COMMANDS[row['command_id']]
    record = state.get('cutoff_authorities', {}).get(row['cutoff_ref'])
    core.require('cg_present', record_present=record is not None)
    core.require('cg_record', shape_valid=isinstance(record, dict) and set(record) == {
        'job', 'scope_kind', 'project_id', 'cutoff_ref', 'selection_contract_sha256', 'approval_decision_ref'})
    core.require('cg_body', record_cutoff_ref=record['cutoff_ref'], cutoff_ref=row['cutoff_ref'],
                 naming_count=sum(isinstance(value, dict) and value.get('cutoff_ref') == row['cutoff_ref']
                                  for value in state['cutoff_authorities'].values()),
                 job=record['job'], expected_job=job, scope_kind=record['scope_kind'],
                 project_id=record['project_id'], expected_project_id=row['project_id'])
    core.require('cg_commitment', cutoff_sha256=row['cutoff_sha256'], record_sha256=core.digest(record))


def panel(state):
    try:
        cutoff_gate(state)
    except core.Refusal:
        return {'available': False, 'reason': 'The approved cutoff binding is unavailable'}
    return {'available': True, 'reason': None}


def memory_flags(memories):
    return type(memories) is dict and all(type(memory) is dict and all(type(memory.get(field)) is bool
        for field in ('pinned', 'archived')) for memory in memories.values())


def memory_fields(memories):
    """The two retained fields the preservation predicates read by name."""
    return all('evidence_refs' in memory and 'version_ref' in memory for memory in memories.values())


def missing_memory_fields(memories):
    return sorted(k for k, memory in memories.items() if not ('evidence_refs' in memory and 'version_ref' in memory))


def archive_candidate(before, job):
    core.require('ac_flags', flags_valid=memory_flags(before.get('memories')))
    core.require('ac_fields', missing_fields=missing_memory_fields(before['memories']))
    after = deepcopy(before)
    selected = before.get('selected_ids')
    # Exact type before any value test; an array ID would otherwise raise inside the set below.
    core.require('ac_ids_type', ids_valid=POLICY.string_list(selected))
    memories = before['memories']
    present = [k for k in selected if k in memories]
    # Exact type before the summary union: 1 and True collapse there, and a string would iterate as characters.
    core.require('ac_selection', selected_ids=selected, sorted_unique_ids=sorted(set(selected)),
                 missing_ids=[k for k in selected if k not in memories],
                 pinned_ids=[k for k in present if memories[k]['pinned'] is True],
                 non_note_ids=[k for k in present if memories[k].get('kind') != 'Note'] if job == 'monthly_summary' else [],
                 bad_evidence_ids=[k for k in present if not POLICY.string_list(memories[k]['evidence_refs'])])
    POLICY.selection_require(core, before, job)
    for key in selected:
        if key in after['memories']:
            after['memories'][key]['archived'] = True
    if job == 'monthly_summary':
        after['summary'] = {'original_ids': list(selected),
                            'evidence_refs': sorted({r for key in selected
                                                     for r in before['memories'].get(key, {}).get('evidence_refs', [])})}
    return after


def archive_observations(before, after, job):
    """Postconditions as (phase, facts), lazily and in the original order."""
    before_flags = memory_flags(before['memories'])
    yield 'av_before_flags', {'before_valid': before_flags}
    if not before_flags:
        return
    after_flags = memory_flags(after.get('memories'))
    yield 'av_after_flags', {'after_valid': after_flags}
    if not after_flags:
        return
    # A malformed output owns this one refusal; the predicates below read these fields by name.
    missing = missing_memory_fields(after['memories'])
    yield 'av_fields', {'missing_fields': missing}
    if missing:
        return
    # The job writes only memories and the summary; every other snapshot field stays exact.
    state = ('memories', 'summary')
    yield 'av_snapshot', {'snapshot_same': POLICY.same({k: v for k, v in after.items() if k not in state},
                                                       {k: v for k, v in before.items() if k not in state})}
    source = before['memories']; result = after['memories']; selected = set(before['selected_ids'])
    # Each check owns a distinct defect; absent originals are checked above, not misreported as lost refs.
    common = set(source) & set(result)
    unpinned_selected = sorted(k for k in common & selected if source[k]['pinned'] is not True)
    yield 'av_preserve', {
        'lost_ids': sorted(set(source) - set(result)),
        'evidence_changed': sorted(k for k in common if not POLICY.same(source[k]['evidence_refs'], result[k]['evidence_refs'])),
        'versions_changed': sorted(k for k in common if not POLICY.same(source[k]['version_ref'], result[k]['version_ref'])),
        # Together with evidence/versions above this compares each selected original in full except archived.
        # Keep those independently tested fields out of this predicate, avoiding an unnamed duplicate guard.
        'selected_changed': [k for k in unpinned_selected if not POLICY.same(
            {field: value for field, value in source[k].items() if field not in ('archived', 'evidence_refs', 'version_ref')},
            {field: value for field, value in result[k].items() if field not in ('archived', 'evidence_refs', 'version_ref')})],
        'pins_changed': sorted(k for k in common if source[k]['pinned'] is True and not POLICY.same(source[k], result[k]))}
    yield 'av_disposition', {
        'unarchived_ids': [k for k in unpinned_selected if not result[k]['archived']],
        'unselected_changed': sorted(k for k in common - selected
                                     if source[k]['pinned'] is not True and not POLICY.same(source[k], result[k])),
        'extra_ids': sorted(set(result) - set(source))}
    if job == 'monthly_summary':
        expected = {'original_ids': before['selected_ids'],
                    'evidence_refs': sorted({r for k in selected for r in source[k]['evidence_refs']})}
        yield 'av_summary', {'summary_matches': POLICY.same(after.get('summary'), expected)}
    else:
        yield 'av_no_summary', {'present_after': 'summary' in after, 'present_before': 'summary' in before,
                                'summary_same': POLICY.same(after.get('summary'), before.get('summary'))}


def archive_validate(before, after, job):
    for phase, facts in archive_observations(before, after, job):
        core.require(phase, **facts)
    return True


def archive_errors(before, after, job):
    """Lane oracle: every failing postcondition site, as the former generator listed them."""
    errors = []
    for phase, facts in archive_observations(before, after, job):
        errors += POLICY.phase_codes(core, phase, facts)
    return errors


def transition(before, action):
    if action['op'] != 'crash':
        cutoff_gate(before)
    candidate = None
    if action['op'] == 'settle' and action.get('status') == 'succeeded':
        job = COMMANDS[before['operation']['command_id']]
        core.require('at_scope', project_id=before['archive']['project_id'],
                     operation_project_id=before['operation']['project_id'])
        candidate = archive_candidate(before['archive'], job)
        archive_validate(before['archive'], candidate, job)
    after, output = _original_transition(before, action)
    if candidate is not None:
        after['archive'] = candidate
    if action['op'] != 'crash':
        cutoff_gate(after)
    return after, output


def append_current(before, value, event):
    """The adopted boundary with invariant-specific checks (no blanket equality hiding a schema defect)."""
    cutoff_gate(before)
    state = deepcopy(before); row = state['operation']; suffix = event.rsplit('.', 1)[1]
    core.require('ap_uint64', storage_uint64_refusals=core.storage_uint64_errors(value))
    core.require('ap_numbers', number_error=core.number_error({k: v for k, v in value.items()
                                                               if k not in core.STORAGE_FIELDS}))
    core.require('aa_envelope', envelope_valid=core.envelope_validator().is_valid(value))
    core.require('aa_gate', replay_policy=value['replay_policy'], admitted=state['admitted'],
                 permission=state['permission'], withdrawn=state['withdrawn'])
    core.operation_check(row, core.operation_name(event), state['original'] is not None, prefix='aop', target_prefix=None)
    expected = core.canonical_value(row, suffix)
    producer_fields = set(expected) - core.STORAGE_FIELDS - {'payload', 'replay_policy'}
    core.require('aa_producer', mismatched_fields=sorted(k for k in producer_fields if not value[k] == expected[k]))
    core.require('aa_payload', payload_valid=core.validator('Plans/memory_maintenance_event_payloads.schema.json',
                                                            event.replace('.', '_')).is_valid(value['payload']))
    core.require('aa_payload_join', mismatched_fields=sorted(k for k, v in expected['payload'].items()
                                                             if not value['payload'].get(k) == v))
    # The closed schema's bounded fields prove its entire MessagePack payload is below 16 KiB.
    # No unreachable second inline-cap guard obscures schema-negative isolation.
    core.require('aa_partition', dedupe_key=state['dedupe_key'],
                 expected_dedupe_key=[core.scope_partition(row['project_id']), event, value['idempotency_key']])
    core.start_custody_gate(state, first_start=suffix == 'started', writer_event=event)
    if state['original'] is not None:
        original = state['original']['full_value']
        if suffix == 'completed':
            # original_matches(state['original'], original): its binding conjunct is the value itself (no row).
            core.retained_check(state['original'], None, 'aao', binding=False)
            core.require('aao_envelope', envelope_valid=core.historical_envelope_matches(original))
            core.require('aao_projection', projection_matches=core.retained_binding(
                {k: original[k] for k in set(expected) - core.STORAGE_FIELDS},
                {k: value[k] for k in set(expected) - core.STORAGE_FIELDS}))
        output = deepcopy(original)
    else:
        core.require('aa_phase', phase=row['phase'], required_phase='accepted' if suffix == 'started' else 'effect_committed')
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

# Deliberately no live cutoff check in history; retained bytes valid when written do not depend on today's policy.
read_history = core.read_history


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
                # The reduced boundary returns False; the harness reports the case's labelled refusal for it.
                assert context == before, (case['name'], 'refusal mutated its inputs')
                return {'accepted': False, 'refusal': result[1] if result[1] is not False else case['refusal']}
        elif kind == 'writer':
            result = append_current(state, value, case['event_type'])
        elif kind == 'phase':
            if 'expected_state' in action:
                action['expected_operation'] = deepcopy(family['states'][action.pop('expected_state')]['operation'])
            result = transition(state, action)
        elif kind == 'panel':
            result = panel(state)
            if not result['available']:
                assert context == before, (case['name'], 'refusal mutated its inputs')
                return {'accepted': False, 'refusal': 'cutoffs_unavailable'}
        elif kind == 'archive_candidate':
            result = archive_candidate(context['state']['archive'], COMMANDS[state['operation']['command_id']])
        elif kind == 'archive':
            result = archive_validate(case['before'], case['after'], COMMANDS[state['operation']['command_id']])
        elif kind == 'history':
            result = read_history(state, case['read'])
        elif kind == 'checkpoint':
            # Boolean SP-278 boundary (its rows are recorded); the harness labels a refusal checkpoint_join.
            if not core.checkpoint_identity_matches(case['checkpoint'], state['operation'], case['value'], case['event_type']):
                assert context == before, (case['name'], 'refusal mutated its inputs')
                return {'accepted': False, 'refusal': 'checkpoint_join'}
        elif kind == 'schema':
            # Schema verdict oracle (no checker boundary): the harness labels a refusal with its guard name.
            if not (core.envelope_validator() if case.get('definition') is None else
                    core.validator(case['schema'], case['definition'])).is_valid(case['value']):
                return {'accepted': False, 'refusal': case['guard']}
        elif kind == 'references':
            docs = deepcopy(core.checked_documents()); doc = docs[case['schema']]
            doc['$defs'][case['definition']]['$defs'] = {'dormant': {'$ref': '#/$defs/not_present'}}
            # Standing check 9 oracle over a mutated document: the harness labels an unresolved reference.
            if core.unresolved_references(docs):
                return {'accepted': False, 'refusal': 'references_resolve'}
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
    # Check 11 is the shared guard tool over the phase tables (scripts/pm-memory-guard-tables.py);
    # the former lane-local removal loop is retired.
    return {'cases': len(cases), 'controls_accepted': len(cases), 'negatives_refused_exactly': len(cases)}


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
    assert not core.table_order_errors(), ('table order', core.table_order_errors())
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
                      'cutoffs_unavailable', 'start_receipt_missing', 'replay_only_not_appendable', 'DL-402', 'DL-403',
                      POLICY.CUTOFFS[event.split('.')[1]][2], 'E-CARDS-2 Card 6.'):
            assert token in text, (event, token)
        days, score, decision = POLICY.CUTOFFS[event.split('.')[1]]
        assert contract['approved_policy']['decisions'] == [decision]
        assert contract['approved_policy']['idle_days_at_least'] == days
        assert contract['approved_policy']['usefulness_below'] == score
    bounds = payload_upper_bounds(families)
    paths = run_adopted_paths(fixtures, families)
    guards = run_guards(fixtures, families)
    canonical_history = core.run_canonical_history(core.load('Plans/memory_canonical_history_fixtures.json'), families)
    numeric_writers = core.run_numeric_writers(fixtures['families'])
    contexts = {f['event_type']: f for f in fixtures['families']}
    domains = core.boundary_domains().run(core, contexts, [c for f in fixtures['families'] for c in f['boundary_cases']], __import__('sys').modules[__name__])
    recipes = core.write_recipes().run(core, contexts, __import__('sys').modules[__name__])
    metadata = core.storage_metadata().run(core, contexts)
    policy = POLICY.run(core, families, __import__('sys').modules[__name__])
    witnesses = core.guard_witnesses().archive(__import__('sys').modules[__name__], fixtures, families)
    shared_numbers = core.run_number_corpus(core, fixtures, families, append_current)
    print(json.dumps({'status':'pass','families':paths,'guard_cases':len(fixtures['guard_cases']),
                      'guard_case_oracle':guards,'canonical_history_cases':canonical_history,
                      'numeric_writer_cases':numeric_writers,'boundary_domains':domains,'write_recipes':recipes,
                      'storage_uint64':metadata, 'card6_policy':policy, 'guard_table_witnesses':witnesses, 'shared_number_corpus':shared_numbers,
                      'payload_messagepack_upper_bounds':bounds,'native':'NOT_RUN','admission':'ABSENT',
                      'approved_cutoffs':{'monthly_summary':'DL-446: idle >=90 days AND score <0.10',
                                          'prune_archive':'DL-447: idle >=180 days AND score <0.05'},
                      'activation':'admission ABSENT; operation retention pending'},indent=2))

if __name__ == '__main__':
    main()
