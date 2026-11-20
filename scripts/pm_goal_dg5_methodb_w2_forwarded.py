#!/usr/bin/env python3
"""Check Goal started schema rows whose invalid documents reach a later check."""
import argparse
from collections import Counter
import copy
import gzip
import json
import os
from pathlib import Path
import sys
import time
from unittest.mock import patch

import pm_goal_dg5_methodb_w2 as worker

START = 'scripts/pm_goal_dg_s_start.py'
DEPENDENCIES = {
    'dg5/start/commit/schema': ('start/retained_native', 'commit', 'StorageCommit', 1272, 'commit'),
    'dg5/start/origin/schema': ('start/retained_native', 'origin', 'StorageOrigin', 1272, 'origin'),
    'dg5/start/original_append/schema': (
        'start/publication_result', 'original_append', 'FullOriginalAppend', 1042, 'original_append/full_value_result'
    ),
}


class ForwardedCall(worker.CompleteCall):
    def in_child(self, sender, edit, cut, replay):
        code, member, definition, line, _ = DEPENDENCIES[self.row]
        forwarded = []
        original_validate = worker.world.Bank.validate

        def observe(bank, reference, value, prefix='root'):
            if prefix == code:
                frame = sys._getframe(2)
                site = (str(Path(frame.f_code.co_filename).relative_to(worker.ROOT)), frame.f_lineno)
                worker.require(site == (START, line), f'forwarded validation moved to {site}')
                target = bank.lookup(reference)
                selected = target.contents['properties'][member]
                exact_ref = self.fixture.world.edition.custody + '#/$defs/' + definition
                worker.require(member in target.contents['required'] and set(selected) == {'$ref'} and
                               target.resolver.lookup(selected['$ref']).contents is bank.lookup(exact_ref).contents,
                               'the later schema must require the original definition')
                forwarded.append(dict(site=site, reference=reference, member=member, schema_reference=exact_ref,
                                      value=copy.deepcopy(value[member]),
                                      errors=worker.error_records(bank.errors(reference, value))))
            return original_validate(bank, reference, value, prefix)

        class Receipt:
            def send(self, result):
                sender.send(dict(result, forwarded=forwarded))

            def close(self):
                sender.close()

        with patch.object(worker.world.Bank, 'validate', observe):
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
    return control


def check_root(out, name, specification, sites, reference, previous, alter_copy):
    started = time.monotonic()
    ident = specification['root']
    worker.pilot.PREFIX = worker.TABLE_PREFIX
    worker.pilot.SITES.clear()
    worker.pilot.SITES[name] = min(sites)
    worker.pilot.configure_tables()
    out.mkdir(parents=True)
    suite = worker.stage.original.Suite(out / 'stores')
    fixture = worker.Fixture(suite, specification['route'], specification['edition'])
    experiment = ForwardedCall(fixture, name, sites, specification)
    collector = worker.stage.sweep.Collector()
    late, _, _, _, defect = DEPENDENCIES[name]
    later_code = f'{late}/schema/{defect}:additionalProperties'
    captured = check_calls(experiment, collector, ident, later_code, alter_copy=alter_copy)
    examples = worker.PreviousExamples()
    replayed = worker.replay_root(fixture, captured, reference, examples.entries(previous), None)
    proof = worker.pilot.run_gates(collector, out, [name])
    binding = proof / 'source-bindings.json'
    source_bindings = json.loads(binding.read_bytes())
    for source in (Path(worker.__file__), Path(worker.stage.__file__), Path(__file__), worker.ROOT / START):
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
    worker.write(out / 'result.json', dict(row=name, root=ident, reference_sha256=worker.REFERENCE_SHA,
                 status='LATER_REFUSAL', later=later_code, seed=int(os.environ['PYTHONHASHSEED']),
                 seconds=round(time.monotonic() - started, 3), calls=experiment.runs,
                 controls=replayed['controls'], gaps=replayed['gaps'], counts=dict(counts),
                 historical_example_inputs=examples.pins))
    print(name, ident, len(replayed['clauses']), len(remaining), later_code, flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('reference', 'matrix', 'out'):
        parser.add_argument('--' + name, type=Path, required=True)
    parser.add_argument('--case', type=Path, action='append', required=True)
    parser.add_argument('--root')
    parser.add_argument('--alter-forwarded-copy', action='store_true')
    args = parser.parse_args()
    worker.require(worker.sha(args.reference) == worker.REFERENCE_SHA, 'reference changed')
    with gzip.open(args.reference, 'rt') as stream:
        reference = json.load(stream)
    _, rows, _ = worker.stage.matrix_inputs(args.matrix)
    v3, v7 = worker.world.v3_edition(), worker.world.v7_edition()
    banks = {'v3': v3.bank.original, 'v7': v7.bank.original}
    for path in args.case:
        case = json.loads(path.read_bytes())
        row = case['row']
        worker.require(row in DEPENDENCIES, f'no checked forwarding premise for {row}')
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
            check_root(output, row, spec, sites, exact, previous[ident], args.alter_forwarded_copy)


if __name__ == '__main__':
    main()
