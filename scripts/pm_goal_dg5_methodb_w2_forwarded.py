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
ORIGINAL_SCHEMAS = HISTORICAL_ORIGINAL | PROJECTOR_ORIGINAL
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
        for row, later in HISTORICAL_APPEND.items()
    },
}


class ForwardedCall(worker.CompleteCall):
    def in_child(self, sender, edit, cut, replay):
        code, member, definition, line, _ = DEPENDENCIES[self.row]
        forwarded = []
        original_validate = worker.world.Bank.validate
        reader = worker.stage.original.R
        original_same = reader.same
        historical = []

        def observe(bank, reference, value, prefix='root'):
            reader_append = self.row in HISTORICAL_APPEND
            if reader_append and prefix == 'read_historical/root':
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
                reference = self.fixture.world.edition.consumer + '#/$defs/' + definition
                worker.require(not bank.errors(reference, expected), 'the reconstructed comparison document failed validation')
                forwarded.append(dict(site=(READERS, line), schema_reference=reference,
                                      value=copy.deepcopy(value), expected=copy.deepcopy(expected), same=result,
                                      errors=worker.error_records(bank.errors(reference, value))))
            return result

        class Receipt:
            def send(self, result):
                sender.send(dict(result, forwarded=forwarded, historical=historical))

            def close(self):
                sender.close()

        with ExitStack() as changes:
            if self.row == REPRESENTATION:
                changes.enter_context(patch.object(reader, 'same', observe_equality))
            else:
                changes.enter_context(patch.object(worker.world.Bank, 'validate', observe))
            super().in_child(Receipt(), edit, cut, replay)


class HistoricalOriginalCall(worker.CompleteCall):
    def in_child(self, sender, edit, cut, replay):
        retained = self.declaration['validation_site'] == [READERS, 94]
        code = ORIGINAL_SCHEMAS[self.row]
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
            if prefix == 'read_historical/root':
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
            if frame.f_code.co_filename == reader.__file__ and frame.f_lineno == 902:
                value, other = (final, original) if '/final/' in self.row else (original, final)
                ref = self.fixture.world.edition.consumer + '#/$defs/OriginalStarted'
                worker.require(not self.fixture.bank.errors(ref, other), 'the other original copy must validate')
                forwarded.append(dict(site=(READERS, 902), value=copy.deepcopy(value), same=result,
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
            if not retained:
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
    if example.row in HISTORICAL_APPEND or example.row in HISTORICAL_ORIGINAL:
        worker.require(accepted['historical'] == [control['input']] and not disabled['historical'],
                       'the final historical document did not use the same validated append value')
    return control


def original_later_code(name, specification):
    if specification['validation_site'] == [READERS, 94]:
        return ORIGINAL_SCHEMAS[name] + '/schema/native_start:additionalProperties'
    return None if name in PROJECTOR_ORIGINAL else 'read_historical/final_fence'


def check_root(out, name, specification, sites, reference, previous, alter_copy, reference_digest):
    started = time.monotonic()
    ident = specification['root']
    worker.pilot.PREFIX = worker.TABLE_PREFIX
    worker.pilot.SITES.clear()
    worker.pilot.SITES[name] = min(sites)
    worker.pilot.configure_tables()
    out.mkdir(parents=True)
    suite = worker.stage.original.Suite(out / 'stores')
    fixture = worker.Fixture(suite, specification['route'], specification['edition'])
    original = name in ORIGINAL_SCHEMAS
    experiment_type = HistoricalOriginalCall if original else ForwardedCall
    experiment = experiment_type(fixture, name, sites, specification)
    collector = worker.stage.sweep.Collector()
    directly_accepted = name in PROJECTOR_ORIGINAL and specification['validation_site'] == [READERS, 256]
    if original:
        later_code = original_later_code(name, specification)
    else:
        late, _, _, _, defect = DEPENDENCIES[name]
        later_code = f'{late}/schema/{defect}:additionalProperties' if defect else late
    if directly_accepted:
        captured, = experiment.prove(collector, 'row' if alter_copy else None)
        worker.require(captured['root'] == ident, 'projector checked a different original root')
    else:
        captured = check_calls(experiment, collector, ident, later_code, alter_copy=alter_copy)
    examples = worker.PreviousExamples()
    replayed = worker.replay_root(fixture, captured, reference, examples.entries(previous), None)
    proof = worker.pilot.run_gates(collector, out, [name])
    binding = proof / 'source-bindings.json'
    source_bindings = json.loads(binding.read_bytes())
    checker = READERS if name == REPRESENTATION or name in HISTORICAL_APPEND or original else START
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
                 schema_reference=specification.get('schema_reference')))
    print(name, ident, len(replayed['clauses']), len(remaining), later_code, flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('reference', 'matrix', 'out'):
        parser.add_argument('--' + name, type=Path, required=True)
    parser.add_argument('--case', type=Path, action='append', required=True)
    parser.add_argument('--native-bindings', type=Path)
    parser.add_argument('--root')
    parser.add_argument('--alter-forwarded-copy', action='store_true')
    args = parser.parse_args()
    cases = [(path, json.loads(path.read_bytes())) for path in args.case]
    reference = worker.load_reference(args.reference, [case for _, case in cases], args.native_bindings)
    reference_digest = worker.sha(args.reference)
    _, rows, _ = worker.stage.matrix_inputs(args.matrix)
    v3, v7 = worker.world.v3_edition(), worker.world.v7_edition()
    banks = {'v3': v3.bank.original, 'v7': v7.bank.original}
    for path, case in cases:
        row = case['row']
        worker.require(row in DEPENDENCIES or row in ORIGINAL_SCHEMAS, f'no checked forwarding premise for {row}')
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
            bank = banks[spec['edition']]
            plain = bank.validator(json.loads(exact['schema'])['$ref'])
            if worker.closure._registry_digest(plain) != exact['registry_sha256']:
                continue
            worker.closure.PREPARED.clear()
            walk = {}
            worker.closure._describe_inventory(walk, plain, ident, bank)
            if walk.get('clause_ids') != exact['clause_ids']:
                continue
            check_root(output, row, spec, sites, exact, previous[ident], args.alter_forwarded_copy, reference_digest)


if __name__ == '__main__':
    main()
