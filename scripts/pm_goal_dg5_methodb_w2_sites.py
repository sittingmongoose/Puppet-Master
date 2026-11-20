"""Check both original document schema sites in the same coverage-table run."""
import argparse
import json
import os
from pathlib import Path
import shutil
import time

import pm_goal_dg5_methodb_w2 as worker
from pm_goal_dg5_methodb_w2_forwarded import HistoricalOriginalCall, READERS, check_calls, original_later_code


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('reference', 'case', 'input', 'out'):
        parser.add_argument('--' + name, type=Path, required=True)
    parser.add_argument('--omit-site', action='store_true')
    args = parser.parse_args()
    case = json.loads(args.case.read_bytes())
    name = case['row']
    reference = worker.load_reference(args.reference, [case])
    mapping = reference['rows'][name]
    sites = {(site['path'], site['line']) for site in mapping['current_sites']}
    worker.require(sorted(mapping['roots']) == sorted(spec['root'] for spec in case['fixtures']) and
                   {tuple(spec['validation_site']) for spec in case['fixtures']} == sites,
                   'the declaration must include both existing schema sites and roots')
    worker.require(all(worker.sha(worker.ROOT / site['path']) == site['sha256']
                       for site in mapping['current_sites']), 'a schema source site changed')
    worker.pilot.PREFIX = worker.TABLE_PREFIX
    worker.pilot.SITES.clear()
    worker.pilot.SITES[name] = min(sites)
    worker.pilot.configure_tables()
    args.out.mkdir(parents=True)
    suite = worker.stage.original.Suite(args.out / 'stores')
    collector = worker.stage.sweep.Collector()
    checked = set()
    records = []
    for spec in case['fixtures'][1 if args.omit_site else 0:]:
        started = time.monotonic()
        root = spec['root']
        source = args.input / root.removeprefix('dg5:')
        prior = json.loads((source / 'result.json').read_bytes())
        exact = reference['roots'][root]
        inventory = json.loads((source / 'exact-inventory.json').read_bytes())['roots'][root]
        replay = json.loads((source / 'clause-replay.json').read_bytes())['roots'][root]
        worker.require(prior['row'] == name and prior['root'] == root and
                       prior['reference_sha256'] == worker.sha(args.reference) and
                       inventory['clause_ids'] == exact['clause_ids'] and
                       inventory['registry_sha256'] == exact['registry_sha256'] and
                       set(replay['clauses']) == set(exact['clause_ids']) and not replay['counts']['UNCOVERED'] and
                       not replay['verify']['failed'] and not replay['verify']['unverifiable'],
                       'a site is missing its complete literal rule tests')
        fixture = worker.Fixture(suite, spec['route'], spec['edition'])
        example = HistoricalOriginalCall(fixture, name, sites, spec)
        later = original_later_code(name, spec)
        if later is None:
            control, = example.prove(collector)
        else:
            control = check_calls(example, collector, root, later)
        worker.require(control['registry_sha256'] == exact['registry_sha256'] and
                       control['schema'] == json.loads(exact['schema']) and
                       tuple(control['site']) == tuple(spec['validation_site']),
                       'a complete call reached a different schema binding')
        checked.add(tuple(control['site']))
        records.append((source, prior, example, round(time.monotonic() - started, 3)))
    worker.require(sites == checked, 'the shared table is missing a validated site')
    proof = worker.pilot.run_gates(collector, args.out, [name])
    pins = proof / 'source-bindings.json'
    bindings = json.loads(pins.read_bytes())
    for file in (Path(__file__), Path(worker.__file__), Path(worker.stage.__file__),
                 Path(__file__).with_name('pm_goal_dg5_methodb_w2_forwarded.py'), worker.ROOT / READERS):
        bindings['files'][str(file.relative_to(worker.ROOT))] = worker.sha(file)
    worker.write(pins, bindings)
    output = args.out / 'rows'
    for source, prior, example, seconds in records:
        dest = output / source.name
        dest.mkdir(parents=True)
        for file in ('exact-inventory.json', 'clause-replay.json'):
            shutil.copyfile(source / file, dest / file)
        shutil.copytree(proof, dest / 'proof')
        original_result = source / 'result.json'
        shutil.copyfile(original_result, dest / 'rule-tests.json')
        worker.write(dest / 'result.json', dict(prior, calls=example.runs,
                     rule_tests_sha256=worker.sha(original_result), site_test_seed=int(os.environ['PYTHONHASHSEED']),
                     seconds=round(prior['seconds'] + seconds, 3), gate=(dest / 'proof').as_posix(),
                     status='DIRECT_OR_ENCLOSING' if any(original_later_code(name, spec) is None
                                                        for spec in case['fixtures']) else 'LATER_REFUSAL'))
    print(name, 'checked both original sites together', flush=True)


if __name__ == '__main__':
    main()
