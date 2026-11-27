"""Check the Goal argument in the original Start call."""
import argparse
from collections import Counter
import json
import os
from pathlib import Path
import shutil
import sys
import time

import pm_goal_dg5_methodb_w2 as worker

ROW = 'dg5/start/goal_argument/schema'
SITE = ('scripts/pm_goal_dg_s_start.py', 997)


class Publication(worker.Fixture):
    def prepare(self):
        self.bank = self.goal_bank
        return self.world.start.commit_start, (worker.stage.original.request(self.world), self.handles)

    def call(self, edit):
        if not edit:
            return self.action(*self.args)
        _, path, change = edit
        seen = []
        source = worker.stage.original.ST.__file__

        def update(frame, event, _):
            if event == 'line' and frame.f_lineno == SITE[1]:
                value = frame.f_locals['src']['goal']
                changed = worker.rules.apply(value, path, tuple(change))
                value.clear()
                value.update(changed)
                seen.append(frame.f_lineno)
            return update

        def match(frame, event, arg):
            if event == 'call' and frame.f_code.co_filename == source and frame.f_code.co_name == 'commit_start':
                return update
            return None

        prior = sys.gettrace()
        sys.settrace(match)
        try:
            return self.action(*self.args)
        finally:
            sys.settrace(prior)
            worker.require(seen == [SITE[1]], 'the example must edit just the Goal argument')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('reference', 'rule-tests', 'out'):
        parser.add_argument('--' + name, type=Path, required=True)
    parser.add_argument('--omit-disable', action='store_true')
    args = parser.parse_args()
    started = time.monotonic()
    case = dict(row=ROW)
    published = worker.load_reference(args.reference, [case])
    ident, = published['rows'][ROW]['roots']
    reference = published['roots'][ident]
    earlier = json.loads(args.rule_tests.read_bytes())
    reference_digest = worker.sha(args.reference)
    worker.require(earlier['row'] == 'dg5/issue/OriginalGoalArgument/schema' and
                   earlier['status'] == 'READY_FOR_MATRIX' and earlier['reference_sha256'] == reference_digest,
                   'the original issuer test must be complete')
    held = earlier['roots'][ident]
    bank = worker.world.v3_edition().goal_bank.original
    plain = bank.validator(json.loads(reference['schema'])['$ref'])
    worker.require(held['registry_sha256'] == reference['registry_sha256'] == worker.closure._registry_digest(plain)
                   and held['schema'] == plain.schema, 'the Start Goal argument uses a different schema')
    worker.closure.PREPARED.clear()
    walk = {}
    worker.closure._describe_inventory(walk, plain, ident, bank)
    worker.require(walk.get('clause_ids') == held['clause_ids'] == reference['clause_ids'] and
                   set(held['clauses']) == set(reference['clause_ids']) and not held['gaps'],
                   'the complete literal rule list differs')
    sites = published['rows'][ROW]['current_sites']
    worker.require(len(sites) == 1 and (sites[0]['path'], sites[0]['line']) == SITE and
                   worker.sha(worker.ROOT / SITE[0]) == sites[0]['sha256'], 'the Start validation site changed')

    table = worker.stage.sweep.table_id([ROW])
    template = worker.ROOT / 'scripts' / (worker.TABLE_PREFIX + table + '.py')
    worker.pilot.PREFIX = worker.TABLE_PREFIX
    worker.pilot.SITES.clear()
    worker.pilot.SITES[ROW] = SITE
    worker.pilot.configure_tables()
    fixture_spec = dict(route='publish_goal_argument', edition='v3', root=ident,
                        hash_seed=int(os.environ['PYTHONHASHSEED']),
                        edit=[0, [], ['add', 'gc_extra_member']], error=[[], 'additionalProperties'])
    out = args.out / ident.removeprefix('dg5:')
    suite = worker.stage.original.Suite(out / 'stores')
    fixture = Publication(suite, fixture_spec['route'], 'v3')
    experiment = worker.CompleteCall(fixture, ROW, {SITE}, fixture_spec)
    collector = worker.stage.sweep.Collector()
    accepted, = experiment.prove(collector, 'row' if args.omit_disable else None)
    worker.require(accepted['root'] == ident and accepted['registry_sha256'] == held['registry_sha256'] and
                   accepted['schema'] == held['schema'], 'the original Start call used a different installed validator')
    proof = worker.pilot.run_gates(collector, out, [ROW])
    binding = proof / 'source-bindings.json'
    bound = json.loads(binding.read_bytes())
    for file in (Path(__file__), Path(worker.__file__), Path(worker.stage.__file__), worker.ROOT / SITE[0]):
        bound['files'][str(file.relative_to(worker.ROOT))] = worker.sha(file)
    worker.write(binding, bound)
    keys = ('clause_ids', 'clause_inventory', 'bank', 'registry_sha256', 'schema',
            'validator_class', 'schema_sources')
    inventory = {key: held[key] for key in keys}
    inventory.update(rows=[ROW], families=[worker.FAMILY])
    counts = Counter(check['cls'] for check in held['clauses'].values())
    counts['UNCOVERED'] = 0
    replay = dict(inventory, clauses=held['clauses'], counts=dict(counts),
                  verify=dict(failed=0, unverifiable=0, passed=counts['KILLED'] + counts['COVERED_LATER']))
    worker.write(out / 'exact-inventory.json', dict(mode='assertion-inventory', roots={ident: inventory}))
    worker.write(out / 'clause-replay.json', dict(roots={ident: replay}))
    worker.write(out / 'result.json', dict(row=ROW, roots={ident: held}, status='READY_FOR_MATRIX',
                 calls={ident: experiment.runs}, reference_sha256=reference_digest,
                 shared_rule_tests_sha256=worker.sha(args.rule_tests),
                 seed=fixture_spec['hash_seed'], seconds=round(time.monotonic()-started, 3)))
    worker.write(args.out / 'case.json', dict(case, fixtures=[fixture_spec]))
    shutil.copyfile(template, args.out / template.name)
    print(ROW, len(held['clauses']), 'rules checked', flush=True)


if __name__ == '__main__':
    main()
