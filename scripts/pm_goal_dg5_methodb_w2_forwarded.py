#!/usr/bin/env python3
"""Check Goal started schema rows whose invalid documents reach a later check."""
import argparse
from collections import Counter
from contextlib import ExitStack
import copy
import json
import os
from pathlib import Path
import sys
import time
from unittest.mock import patch

import pm_goal_dg5_methodb_w2 as worker

START = 'scripts/pm_goal_dg_s_start.py'
READERS = 'scripts/pm_goal_dg_s_readers.py'
REPRESENTATION = 'dg5/representation/record/schema'
ADAPTERS = 'scripts/pm_goal_test_owner_adapters.py'
ISSUER_FORWARDING = {
    'dg5/goal/current_argument/schema': 'issue/CurrentGoalArgument',
    'dg5/d01/current_source/schema': 'issue/current_source',
}
CURRENT_GOAL_CHECKS = {'dg5/read_current/current_goal/schema', 'dg5/read_current/final/current_goal/schema'}
CURRENT_START_CHECKS = {'dg5/read_current/current_start/schema', 'dg5/read_current/final/current_start/schema'}
HISTORICAL_APPEND = {
    f'dg5/read_historical/{phase}/append/root/schema': f'read_historical/{phase}/root'
    for phase in ('original', 'final')
}
HISTORICAL_ORIGINAL = {
    f'dg5/read_historical/{phase}/root/schema': f'read_historical/{phase}/root'
    for phase in ('original', 'final')
}
PROJECTOR_ORIGINAL = {
    f'dg5/{where}/root/schema': where + '/root'
    for where in ('project/original', 'project/lower_original', 'cutover/original')
}
PROJECTOR_APPEND = {row.replace('/root/', '/append/root/'): code for row, code in PROJECTOR_ORIGINAL.items()}
CURRENT_ORIGINAL = {
    f'dg5/read_current/{phase}/root/schema': f'read_current/{phase}/root'
    for phase in ('original', 'final')
}
INSPECTION_ORIGINAL = {
    f'dg5/inspect_original/{phase}/root/schema': f'inspect_original/{phase}/root'
    for phase in ('original', 'final')
}
CURRENT_APPEND = {row.replace('/root/', '/append/root/'): code for row, code in CURRENT_ORIGINAL.items()}
INSPECTION_APPEND = {row.replace('/root/', '/append/root/'): code for row, code in INSPECTION_ORIGINAL.items()}
RETAINED_READ = {f'dg5/read_retained_native/{phase}/root/schema' for phase in ('retained', 'final')}
READER_APPEND = HISTORICAL_APPEND | CURRENT_APPEND
READER_ORIGINAL = HISTORICAL_ORIGINAL | CURRENT_ORIGINAL
READ_APPEND = READER_APPEND | PROJECTOR_APPEND | INSPECTION_APPEND
ORIGINAL_SCHEMAS = READER_ORIGINAL | PROJECTOR_ORIGINAL | INSPECTION_ORIGINAL
READER_COMPARISONS = {'read_historical': (902, 'read_historical/final_fence'),
                      'read_current': (928, 'read_current/final_original'),
                      'inspect_original': (884, 'inspect_original/final_fence')}
DEPENDENCIES = {
    'dg5/start/commit/schema': ('start/retained_native', 'commit', 'StorageCommit', 1272, 'commit'),
    'dg5/start/origin/schema': ('start/retained_native', 'origin', 'StorageOrigin', 1272, 'origin'),
    'dg5/start/original_append/schema': (
        'start/publication_result', 'original_append', 'FullOriginalAppend', 1042, 'original_append/full_value_result'
    ),
    **{
        f'dg5/start/{member}/schema': ('start/retained_native', member, definition, 1272, member)
        for member, definition in (
            ('control', 'StorageControl'), ('original_d01_head', 'StorageWorkflowHead'),
            ('original_d01_update', 'StorageWorkflowUpdate'),
            ('original_d01_origin', 'StorageWorkflowMutationOrigin'),
        )
    },
    REPRESENTATION: ('representation/record_equal', None, 'Projection', 486, None),
    **{
        row: (later, 'original_append', 'FullOriginalAppend', 256, 'original_append/full_value_result')
        for row, later in READ_APPEND.items()
    },
}


class ForwardedCall(worker.CompleteCall):
    def in_child(self, sender, edit, cut, replay):
        issuer = self.row in ISSUER_FORWARDING
        goal_comparison = self.row in CURRENT_GOAL_CHECKS
        start_comparison = self.row in CURRENT_START_CHECKS
        retained_comparison = self.row in RETAINED_READ
        if issuer or goal_comparison or start_comparison:
            code, member, definition, line = (ISSUER_FORWARDING[self.row], None, None, 462) if issuer else (
                ('read_current/final_current_goal', None, 'CurrentGoalArgument', 934) if goal_comparison else
                ('read_current/final_current_start', None, 'CurrentStartSource', 933))
        elif retained_comparison:
            code, member, definition, line = 'read_retained_native/final_fence', None, 'RetainedNativeStart', 870
        else:
            code, member, definition, line, _ = DEPENDENCIES[self.row]
        forwarded = []
        original_validate = worker.world.Bank.validate
        reader = worker.stage.original.R
        original_same = reader.same
        historical, workflow_members = [], []
        other_retained = []

        def observe(bank, reference, value, prefix='root'):
            if retained_comparison and prefix in ('read_retained_native/retained/root',
                                                   'read_retained_native/final/root') and prefix != self.code:
                frame = sys._getframe(2)
                reference_for_comparison = self.fixture.world.edition.consumer + '#/$defs/' + definition
                worker.require(frame.f_code.co_filename == reader.__file__ and frame.f_lineno == 94 and
                               reference == reference_for_comparison,
                               'the other retained copy used a different installed validation check')
                other_retained.append(copy.deepcopy(value))
            if issuer and prefix == code:
                frame = sys._getframe(2)
                site = str(Path(frame.f_code.co_filename).relative_to(worker.ROOT)), frame.f_lineno
                worker.require(site == (ADAPTERS, line) and reference == self.declaration['schema_reference'],
                               'the issuer uses a different original validator')
                forwarded.append(dict(site=site, reference=reference, value=copy.deepcopy(value),
                                      errors=worker.error_records(bank.errors(reference, value))))
                return original_validate(bank, reference, value, prefix)
            if start_comparison and prefix == 'd01/current_source':
                frame = sys._getframe(2)
                site = (str(Path(frame.f_code.co_filename).relative_to(worker.ROOT)), frame.f_lineno)
                worker.require(site == (START, 404) and
                               reference == self.fixture.world.edition.d01 + '#/$defs/CurrentSource',
                               'the workflow used a different original D01 schema check')
                workflow_members.append(copy.deepcopy(value))
            if start_comparison and prefix == 'read_current/root':
                target = bank.lookup(reference)
                member_ref = target.contents['properties']['current_native']['$ref']
                source = self.declaration['schema_reference']
                selected = target.resolver.lookup(member_ref)
                if set(selected.contents) == {'$ref'}:
                    selected = selected.resolver.lookup(selected.contents['$ref'])
                worker.require('current_native' in target.contents['required'] and
                               selected.contents is bank.lookup(source).contents,
                               'the reader result must require the original current workflow definition')
                historical.append(copy.deepcopy(value['current_native']))
            reader_append = self.row in READ_APPEND
            if self.row in READER_APPEND and prefix == self.code.split('/')[0] + '/root':
                target = bank.lookup(reference)
                embedded = target.contents['properties']['original']
                original = target.resolver.lookup(embedded['$ref'])
                append = original.contents['properties']['original_append']
                exact_ref = self.fixture.world.edition.custody + '#/$defs/' + definition
                worker.require('original' in target.contents['required'] and
                               'original_append' in original.contents['required'] and
                               original.resolver.lookup(append['$ref']).contents is bank.lookup(exact_ref).contents,
                               'the historical result must require the same append definition')
                historical.append(copy.deepcopy(value['original']['original_append']))
            if prefix == code and (not reader_append or reference.endswith('#/$defs/OriginalStarted')):
                frame = sys._getframe(2)
                site = (str(Path(frame.f_code.co_filename).relative_to(worker.ROOT)), frame.f_lineno)
                worker.require(site == (READERS if reader_append else START, line),
                               f'forwarded validation moved to {site}')
                target = bank.lookup(reference)
                selected = target.contents['properties'][member]
                exact_ref = self.declaration.get('schema_reference',
                    self.fixture.world.edition.custody + '#/$defs/' + definition)
                worker.require(member in target.contents['required'] and set(selected) == {'$ref'} and
                               target.resolver.lookup(selected['$ref']).contents is bank.lookup(exact_ref).contents,
                               'the later schema must require the original definition')
                forwarded.append(dict(site=site, reference=reference, member=member, schema_reference=exact_ref,
                                      value=copy.deepcopy(value[member]),
                                      errors=worker.error_records(bank.errors(reference, value))))
            return original_validate(bank, reference, value, prefix)

        def observe_equality(value, expected):
            result = original_same(value, expected)
            frame = sys._getframe(1)
            if frame.f_code.co_filename == reader.__file__ and frame.f_lineno == line:
                bank = self.fixture.bank
                reference = self.declaration.get('schema_reference',
                    self.fixture.world.edition.consumer + '#/$defs/' + definition)
                if (goal_comparison or start_comparison or retained_comparison) and '/final/' not in self.row:
                    value, expected = expected, value
                worker.require(not bank.errors(reference, expected), 'the reconstructed comparison document failed validation')
                if retained_comparison:
                    worker.require(other_retained == [expected],
                                   'the retained comparison must use the other validated copy')
                forwarded.append(dict(site=(READERS, line), schema_reference=reference,
                                      value=copy.deepcopy(value), expected=copy.deepcopy(expected), same=result,
                                      errors=worker.error_records(bank.errors(reference, value))))
            return result

        class Receipt:
            def send(self, result):
                sender.send(dict(result, forwarded=forwarded, historical=historical,
                                 workflow_members=workflow_members))

            def close(self):
                sender.close()

        with ExitStack() as changes:
            if self.row == REPRESENTATION or goal_comparison or start_comparison or retained_comparison:
                changes.enter_context(patch.object(reader, 'same', observe_equality))
            if (self.row != REPRESENTATION and not goal_comparison) or start_comparison:
                changes.enter_context(patch.object(worker.world.Bank, 'validate', observe))
            super().in_child(Receipt(), edit, cut, replay)


class HistoricalOriginalCall(worker.CompleteCall):
    def in_child(self, sender, edit, cut, replay):
        retained = self.declaration['validation_site'] == [READERS, 94]
        code = ORIGINAL_SCHEMAS[self.row]
        reader_method = code.split('/')[0]
        comparison_site, _ = READER_COMPARISONS.get(reader_method, (None, None))
        reader = worker.stage.original.R
        validate, same = worker.world.Bank.validate, reader.same
        forwarded, historical = [], []

        def observe(bank, reference, value, prefix='root'):
            edition = self.fixture.world.edition
            original_ref = edition.consumer + '#/$defs/OriginalStarted'
            retained_ref = edition.consumer + '#/$defs/RetainedNativeStart'
            if retained and prefix == code and reference == original_ref:
                frame = sys._getframe(2)
                worker.require(frame.f_code.co_filename == reader.__file__ and frame.f_lineno == 256,
                               'the enclosing retained check moved')
                target = bank.lookup(reference)
                child = target.contents['properties']['native_start']
                worker.require('native_start' in target.contents['required'] and
                               target.resolver.lookup(child['$ref']).contents is bank.lookup(retained_ref).contents,
                               'the enclosing schema must require the original retained definition')
                forwarded.append(dict(site=(READERS, 256), value=copy.deepcopy(value['native_start']),
                                      errors=worker.error_records(bank.errors(reference, value))))
            if comparison_site is not None and prefix == reader_method + '/root':
                target = bank.lookup(reference)
                child = target.contents['properties']['original']
                original = target.resolver.lookup(child['$ref'])
                worker.require('original' in target.contents['required'] and
                               original.contents is bank.lookup(original_ref).contents,
                               'the result must require the same original definition')
                if retained:
                    native = original.contents['properties']['native_start']
                    worker.require('native_start' in original.contents['required'] and
                                   original.resolver.lookup(native['$ref']).contents is bank.lookup(retained_ref).contents,
                                   'the result must require the same retained definition')
                original_value = value['original']
                historical.append(copy.deepcopy(original_value['native_start'] if retained else original_value))
            return validate(bank, reference, value, prefix)

        def compare(final, original):
            result = same(final, original)
            frame = sys._getframe(1)
            if frame.f_code.co_filename == reader.__file__ and frame.f_lineno == comparison_site:
                value, other = (final, original) if '/final/' in self.row else (original, final)
                ref = self.fixture.world.edition.consumer + '#/$defs/OriginalStarted'
                worker.require(not self.fixture.bank.errors(ref, other), 'the other original copy must validate')
                forwarded.append(dict(site=(READERS, comparison_site), value=copy.deepcopy(value), same=result,
                                      expected=copy.deepcopy(other),
                                      errors=worker.error_records(self.fixture.bank.errors(ref, value))))
            return result

        class Receipt:
            def send(self, result):
                sender.send(dict(result, forwarded=forwarded, historical=historical))

            def close(self):
                sender.close()

        with ExitStack() as changes:
            changes.enter_context(patch.object(worker.world.Bank, 'validate', observe))
            if not retained and comparison_site is not None:
                changes.enter_context(patch.object(reader, 'same', compare))
            super().in_child(Receipt(), edit, cut, replay)


def check_calls(example, collector, ident, later_code, *, alter_copy=False):
    try:
        example.prove(collector)
    except ValueError as error:
        worker.require('single rule did not isolate the complete call' in str(error), str(error))
    else:
        raise ValueError('the original call accepted with the selected row disabled')
    accepted, invalid, disabled, restored = example.runs[:4]
    worker.require(accepted['code'] is None and invalid['code'] == restored['code'] and
                   disabled['cut'] and disabled['code'] == later_code and
                   invalid['observations'] == disabled['observations'] == restored['observations'],
                   'the original calls did not reproduce the expected refusal sequence')
    (forward,) = disabled['forwarded']
    (positive_forward,) = accepted['forwarded']
    (control,) = accepted['observations']
    if alter_copy:
        forward['value'] = dict(forward['value'], test_changed_forward=True)
    worker.require(not invalid['forwarded'] and not restored['forwarded'] and control['root'] == ident,
                   'the original check did not stop the invalid call or used a different root')
    worker.require(forward['value'] == invalid['observations'][0]['input'] and
                   forward['errors'][0]['message'] == invalid['observations'][0]['first_message'] and
                   positive_forward['value'] == control['input'] and not positive_forward['errors'],
                   'the later check did not receive the same document and validation message')
    if 'same' in forward:
        worker.require(positive_forward['same'] and not forward['same'] and
                       positive_forward['expected'] == forward['expected'] == control['input'],
                       'the comparison did not use the same schema-valid document')
    if example.row in READER_APPEND or example.row in READER_ORIGINAL or example.row in CURRENT_START_CHECKS:
        worker.require(accepted['historical'] == [control['input']] and not disabled['historical'],
                       'the result did not use the same validated document')
    if example.row in CURRENT_START_CHECKS:
        member = control['input']['d01_current']
        seen = accepted['workflow_members']
        worker.require(len(seen) == 2 and all(worker.stage.original.R.same(value, member) for value in seen),
                       'the reader did not use both documents checked by the real D01 source')
    return control


def original_later_code(name, specification):
    if specification['validation_site'] == [READERS, 94]:
        return ORIGINAL_SCHEMAS[name] + '/schema/native_start:additionalProperties'
    return None if name in PROJECTOR_ORIGINAL else READER_COMPARISONS[ORIGINAL_SCHEMAS[name].split('/')[0]][1]


def checked_current_workflow_rules(fixture, captured, reference, source_path, reference_digest):
    record = json.loads(source_path.read_bytes())
    worker.require(record['row'] == 'dg5/issue/current_source/schema' and record['status'] == 'READY_FOR_MATRIX' and
                   record['reference_sha256'] == reference_digest, 'the current source rule tests are incomplete')
    child_root, = record['roots']
    child = record['roots'][child_root]
    bank = fixture.bank
    wrapper = bank.lookup(captured['schema']['$ref'])
    field = wrapper.contents['properties']['d01_current']
    worker.require(set(wrapper.contents) <= {'type', 'properties', 'required', 'additionalProperties'} and
                   'd01_current' in wrapper.contents['required'] and set(field) == {'$ref'} and
                   field['$ref'] == child['schema']['$ref'] and
                   wrapper.resolver.lookup(field['$ref']).contents is bank.lookup(field['$ref']).contents,
                   'the original wrapper must require the same complete current source definition')
    validator = bank.original.validator(field['$ref'])
    worker.require(worker.closure._registry_digest(validator) == child['registry_sha256'] and
                   type(validator).__module__ + '.' + type(validator).__qualname__ == child['validator_class'] and
                   child['schema'] == validator.schema and not child['gaps'] and
                   set(child['clauses']) == set(child['clause_ids']) <= set(reference['clause_ids']),
                   'the current source validator or exact nested rules differ')
    pin = worker.sha(source_path)
    return {rule: dict(check, nested_schema_test=dict(row=record['row'], root=child_root, transcript_sha256=pin,
                                                     instance_member='d01_current'))
            for rule, check in child['clauses'].items()}


def retained_rule_tests(directory, ident, captured, reference):
    """Reuse the complete tests of this same installed retained validator."""
    root = directory / ident.removeprefix('dg5:')
    result_path = root / 'result.json'
    rules_path = root / 'clause-replay.json'
    record = json.loads(result_path.read_bytes())
    replay = json.loads(rules_path.read_bytes())['roots'][ident]
    (prior,) = record['calls'][0]['observations']
    worker.require(record['row'] == 'dg5/inspect_original/final/root/schema' and
                   record['status'] == 'LATER_REFUSAL' and not record['gaps'] and
                   record['reference_sha256'] == worker.FULL_REFERENCE_SHA and
                   record['calls'][0]['code'] is None and prior['site'] == [READERS, 94] and
                   prior['root'] == captured['root'] == ident and
                   prior['schema'] == replay['schema'] == captured['schema'] and
                   prior['registry_sha256'] == replay['registry_sha256'] == captured['registry_sha256'] and
                   all(replay[key] == reference[key] for key in ('bank', 'validator_class', 'registry_sha256',
                                                                 'clause_ids', 'clause_inventory')) and
                   set(replay['clauses']) == set(reference['clause_ids']) and
                   replay['counts']['UNCOVERED'] == replay['verify']['failed'] == replay['verify']['unverifiable'] == 0,
                   'the retained reader did not use the fully tested installed schema')
    replay.update(controls=record['controls'], gaps={})
    return replay, {path.name: worker.sha(path) for path in (result_path, rules_path)}


def inspection_append_tests(directory, specification, fixture, reference, captured):
    """Check the exact append rules already tested in the enclosing inspection."""
    parent_id = specification['enclosing_test_root']
    root = directory / parent_id.removeprefix('dg5:')
    result_path = root / 'result.json'
    rules_path = root / 'clause-replay.json'
    result = json.loads(result_path.read_bytes())
    parent = json.loads(rules_path.read_bytes())['roots'][parent_id]
    (prior,) = result['calls'][0]['observations']
    bank = fixture.bank
    target = bank.lookup(prior['schema']['$ref'])
    child = target.contents['properties']['original_append']
    selected = bank.lookup(captured['schema']['$ref'])
    worker.require(result['row'] == specification['enclosing_test_row'] and
                   result['status'] == 'LATER_REFUSAL' and result['reference_sha256'] == worker.FULL_REFERENCE_SHA and
                   result['calls'][0]['code'] is None and prior['site'] == [READERS, 256] and
                   prior['root'] == parent_id and not result['gaps'] and
                   parent['counts']['UNCOVERED'] == parent['verify']['failed'] == parent['verify']['unverifiable'] == 0 and
                   set(parent['clauses']) == set(parent['clause_ids']) and
                   parent['validator_class'] == reference['validator_class'] and parent['bank'] == reference['bank'] and
                   parent['schema_sources'] == json.loads(json.dumps(bank.original.resource_origins)) and
                   'original_append' in target.contents['required'] and set(child) == {'$ref'} and
                   target.resolver.lookup(child['$ref']).contents is selected.contents,
                   'the accepted inspection test must use the exact required append definition')
    clauses = {rule: parent['clauses'][rule] for rule in reference['clause_ids']}
    worker.require(all('path' not in check or check['path'][:1] == ['original_append'] for check in clauses.values()),
                   'an append rule was tested outside the required member')
    replay = {key: reference[key] for key in ('clause_ids', 'clause_inventory', 'bank', 'registry_sha256', 'validator_class')}
    replay.update(schema=captured['schema'], schema_sources=bank.original.resource_origins,
                  clauses=clauses, gaps={}, controls=result['controls'])
    return replay, {path.name: worker.sha(path) for path in (result_path, rules_path)}


def check_root(out, name, specification, sites, reference, previous, alter_copy, reference_digest,
               shared_rule_tests=None, accepted_controls=None, current_source_tests=None, retained_tests=None, inspection_tests=None):
    started = time.monotonic()
    ident = specification['root']
    worker.pilot.PREFIX = worker.TABLE_PREFIX
    worker.pilot.SITES.clear()
    worker.pilot.SITES[name] = min(sites)
    worker.pilot.configure_tables()
    out.mkdir(parents=True)
    suite = worker.stage.original.Suite(out / 'stores')
    fixture = worker.Fixture(suite, specification['route'], specification['edition'])
    if accepted_controls is not None:
        worker.require(name in CURRENT_START_CHECKS, 'the additional examples apply to the current workflow only')
        fixture.additional_controls = json.loads(accepted_controls.read_bytes())['documents']
    original = name in ORIGINAL_SCHEMAS
    experiment_type = HistoricalOriginalCall if original else ForwardedCall
    experiment = experiment_type(fixture, name, sites, specification)
    collector = worker.stage.sweep.Collector()
    directly_accepted = name in PROJECTOR_ORIGINAL and specification['validation_site'] == [READERS, 256]
    if original:
        later_code = original_later_code(name, specification)
    elif name in ISSUER_FORWARDING:
        later_code = ISSUER_FORWARDING[name] + '/schema/:additionalProperties'
    elif name in CURRENT_GOAL_CHECKS:
        later_code = 'read_current/final_current_goal'
    elif name in CURRENT_START_CHECKS:
        later_code = 'read_current/final_current_start'
    elif name in RETAINED_READ:
        later_code = 'read_retained_native/final_fence'
    else:
        late, _, _, _, defect = DEPENDENCIES[name]
        later_code = f'{late}/schema/{defect}:additionalProperties' if defect else late
    if directly_accepted:
        captured, = experiment.prove(collector, 'row' if alter_copy else None)
        worker.require(captured['root'] == ident, 'projector checked a different original root')
    else:
        captured = check_calls(experiment, collector, ident, later_code, alter_copy=alter_copy)
    examples = worker.PreviousExamples()
    checked_rules = None
    if current_source_tests:
        worker.require(name in CURRENT_START_CHECKS, 'current source tests apply only to the workflow wrapper')
        checked_rules = checked_current_workflow_rules(
            fixture, captured, reference, current_source_tests, reference_digest)
    retained_pins = inspection_pins = None
    if retained_tests:
        worker.require(name in RETAINED_READ, 'the retained examples require a retained reader call')
        replayed, retained_pins = retained_rule_tests(retained_tests, ident, captured, reference)
    elif inspection_tests:
        worker.require(name in INSPECTION_APPEND, 'the enclosing examples require an inspection append call')
        replayed, inspection_pins = inspection_append_tests(inspection_tests, specification, fixture, reference, captured)
    elif shared_rule_tests:
        record = json.loads(shared_rule_tests.read_bytes())
        worker.require(record['status'] == 'READY_FOR_MATRIX' and record['reference_sha256'] == reference_digest and
                       record['row'] == specification['rule_test_row'], 'the reused rule tests are missing their original call')
        replayed = record['roots'][ident]
        worker.require(not replayed['gaps'] and replayed['schema'] == captured['schema'] and
                       replayed['registry_sha256'] == captured['registry_sha256'] == reference['registry_sha256'] and
                       replayed['clause_ids'] == reference['clause_ids'] and
                       set(replayed['clauses']) == set(reference['clause_ids']),
                       'the two calls do not reach the same fully tested installed validator')
    else:
        replayed = worker.replay_root(fixture, captured, reference, examples.entries(previous), None,
                                      checked_rules=checked_rules)
    proof = worker.pilot.run_gates(collector, out, [name])
    binding = proof / 'source-bindings.json'
    source_bindings = json.loads(binding.read_bytes())
    checker = READERS if name == REPRESENTATION or name in READ_APPEND or original or name in CURRENT_GOAL_CHECKS | CURRENT_START_CHECKS | RETAINED_READ else START
    if name in ISSUER_FORWARDING:
        source_bindings['files'][ADAPTERS] = worker.sha(worker.ROOT / ADAPTERS)
    if name in CURRENT_START_CHECKS:
        source_bindings['files'][START] = worker.sha(worker.ROOT / START)
    for source in (Path(worker.__file__), Path(worker.stage.__file__), Path(__file__), worker.ROOT / checker):
        source_bindings['files'][str(source.relative_to(worker.ROOT))] = worker.sha(source)
    worker.write(binding, source_bindings)
    keys = ('clause_ids', 'clause_inventory', 'bank', 'registry_sha256', 'schema',
            'validator_class', 'schema_sources')
    inventory = {key: replayed[key] for key in keys}
    inventory.update(rows=[name], families=[worker.FAMILY])
    worker.write(out / 'exact-inventory.json', dict(mode='assertion-inventory', roots={ident: inventory}))
    remaining = {rule: dict(cls='UNCOVERED', detail=detail) for rule, detail in replayed['gaps'].items()}
    counts = Counter(entry['cls'] for entry in replayed['clauses'].values())
    counts['UNCOVERED'] = len(remaining)
    closure = dict(inventory, clauses=replayed['clauses'] | remaining, counts=dict(counts),
                   verify=dict(passed=counts['KILLED'] + counts['COVERED_LATER'], failed=0, unverifiable=0))
    worker.write(out / 'clause-replay.json', {'roots': {ident: closure}})
    worker.write(out / 'result.json', dict(row=name, root=ident, reference_sha256=reference_digest,
                 status='LATER_REFUSAL', later=later_code, seed=int(os.environ['PYTHONHASHSEED']),
                 seconds=round(time.monotonic() - started, 3), calls=experiment.runs,
                 controls=replayed['controls'], gaps=replayed['gaps'], counts=dict(counts),
                 historical_example_inputs=examples.pins,
                 schema_reference=specification.get('schema_reference'),
                 retained_rule_tests_sha256=retained_pins, inspection_append_tests_sha256=inspection_pins,
                 shared_rule_tests_sha256=worker.sha(shared_rule_tests) if shared_rule_tests else None,
                 additional_controls_sha256=worker.sha(accepted_controls) if accepted_controls else None,
                 current_source_tests_sha256=worker.sha(current_source_tests) if current_source_tests else None))
    print(name, ident, len(replayed['clauses']), len(remaining), later_code, flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('reference', 'matrix', 'out'):
        parser.add_argument('--' + name, type=Path, required=True)
    parser.add_argument('--case', type=Path, action='append', required=True)
    parser.add_argument('--native-bindings', type=Path)
    parser.add_argument('--root')
    parser.add_argument('--show-differences', action='store_true')
    parser.add_argument('--shared-rule-tests', type=Path)
    parser.add_argument('--accepted-controls', type=Path)
    parser.add_argument('--retained-tests', type=Path)
    parser.add_argument('--inspection-tests', type=Path)
    parser.add_argument('--current-source-tests', type=Path)
    parser.add_argument('--alter-forwarded-copy', action='store_true')
    args = parser.parse_args()
    cases = [(path, json.loads(path.read_bytes())) for path in args.case]
    reference = worker.load_reference(args.reference, [case for _, case in cases], args.native_bindings)
    reference_digest = worker.sha(args.reference)
    _, rows, _ = worker.stage.matrix_inputs(args.matrix)
    v3 = worker.world.v3_edition()
    banks = {'v3': v3.bank.original, 'goal-v3': v3.goal_bank.original}
    if any(spec['edition'] == 'v7' for _, case in cases for spec in case['fixtures']):
        banks['v7'] = worker.world.v7_edition().bank.original
    for path, case in cases:
        row = case['row']
        worker.require(row in DEPENDENCIES or row in ORIGINAL_SCHEMAS or row in ISSUER_FORWARDING or row in CURRENT_GOAL_CHECKS | CURRENT_START_CHECKS | RETAINED_READ,
                       f'no checked forwarding premise for {row}')
        worker.require(not args.inspection_tests or row in INSPECTION_APPEND,
                       'enclosing inspection tests apply only to the inspection append rows')
        worker.require(not args.retained_tests or row in RETAINED_READ,
                       'retained rule tests apply only to the retained reader rows')
        worker.require(not args.shared_rule_tests or row in ISSUER_FORWARDING or row in CURRENT_GOAL_CHECKS,
                       'reused rules require the same captured validator and a declared dependency')
        mapped = reference['rows'][row]
        worker.require(sorted(mapped['roots']) == sorted(item['root'] for item in case['fixtures']),
                       f'{row}: declaration omits or repeats an exact root')
        sites = {(item['path'], item['line']) for item in mapped['current_sites']}
        worker.require(all(worker.sha(worker.ROOT / item['path']) == item['sha256']
                           for item in mapped['current_sites']), f'{row}: current validator source changed')
        previous = {item['root']: item for item in rows[row]['schema_closure']['roots']}
        for spec in case['fixtures']:
            ident = spec['root']
            output = args.out / path.stem / ident.removeprefix('dg5:')
            if (args.root and args.root != ident) or (output / 'result.json').is_file():
                continue
            exact = reference['roots'][ident]
            bank = banks[spec.get('bank', spec['edition'])]
            plain = bank.validator(json.loads(exact['schema'])['$ref'])
            if worker.closure._registry_digest(plain) != exact['registry_sha256']:
                if args.show_differences:
                    print(row, ident, 'registry digest differs', flush=True)
                continue
            if not (args.retained_tests or args.inspection_tests):
                worker.closure.PREPARED.clear()
                walk = {}
                worker.closure._describe_inventory(walk, plain, ident, bank)
                if walk.get('clause_ids') != exact['clause_ids']:
                    if args.show_differences:
                        print(row, ident, 'literal rule names differ',
                              len(set(walk.get('clause_ids', ())) - set(exact['clause_ids'])), flush=True)
                    continue
            check_root(output, row, spec, sites, exact, previous[ident], args.alter_forwarded_copy, reference_digest,
                       args.shared_rule_tests, args.accepted_controls, args.current_source_tests, args.retained_tests,
                       args.inspection_tests)


if __name__ == '__main__':
    main()
