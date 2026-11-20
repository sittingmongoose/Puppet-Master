#!/usr/bin/env python3
"""Replay declared examples through the original Goal run cancellation checkers."""

import argparse
from collections import Counter
import copy
from contextlib import ExitStack
import gzip
import json
from pathlib import Path
import subprocess
import sys
import time
from unittest.mock import patch

from pm_goal_dg5_methodb_stage3 import (
    each_error, edit_example, errors_list, proof_output, require, sha, test_rules, write,
)


HERE = Path(__file__).resolve().parent
FAMILY = 'goal_run.cancelled'


def fixture(edition, route, directory):
    import pm_goal_dg_r_oracles as original
    import pm_goal_dg_r_projector as projector
    import pm_goal_dg_r_readers as reader
    import pm_goal_dg_r_world as legacy

    if edition == 'integrated_original':
        from pm_goal_dg_int_old import World
    else:
        require(edition == 'original_profile', f'unknown edition {edition}')
        World = legacy.CancelWorld
    world = World({'start': 'started'}, base=directory)
    world.build()
    if route == 'current_started':
        return world, getattr(world, 'projector_class', projector.Projector)(world).read_current_started
    require(route == 'missing_original', f'unknown owner call {route}')
    consumer = getattr(world, 'consumer_class', reader.Consumer)(world)
    presentation = reader.Presentation(world)
    presentation.cancellation = None
    request = original.request_of(world)
    return world, lambda: consumer.read_retained_native(request, presentation)


def root_binding(closure, bank, plain):
    validator = type(plain).__module__ + '.' + type(plain).__qualname__
    schema = json.dumps(plain.schema, sort_keys=True)
    registry = closure._registry_digest(plain)
    ident = closure.root_id((validator, schema, registry, type(bank).__qualname__))
    return ident, dict(bank=type(bank).__module__ + '.' + type(bank).__qualname__,
                       schema=schema, registry_sha256=registry, validator_class=validator)


def scoped_rules(plain, bank, accepted, ident, ids, examples, disabled_check):
    """Run the same rule tests on the original nodes of a location-scoped bank.

    A copied reference node cannot use this bank's original identity map.
    Keep the bank's nodes and all its reference handlers in place and wrap the
    assertion functions on a separate validator instance.
    """
    import attrs
    import jsonschema
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go
    import pm_goal_oracle_common as common

    nodes, walked = closure._scoped_census(plain, ident, bank, closure._realm_location)
    if disabled_check == 'inventory':
        examples = dict(list(examples.items())[1:])
    require(walked == ids and set(walked) == set(examples), 'scoped rule examples differ from exact inventory')
    locations = {id(info['node']): location for location, info in nodes.items()}
    classes = {}

    def keyword_wrapper(word, function):
        def validate(validator, expected, value, node):
            location = locations.get(id(node))
            if location is None or word not in go.clauses_of(node):
                yield from function(validator, expected, value, node)
                return
            name = closure.clause_name(node, word)
            guard = closure._guard_for_location(location + '/' + name)
            if guard not in common._SCHEMA_CONTEXT.get()[1]:
                for error in function(validator, expected, value, node):
                    error.oracle_guard = guard
                    yield error
        return validate

    def guarded(original):
        if original in classes.values():
            return original
        if original not in classes:
            keys = go.ASSERT | {'additionalProperties', 'unevaluatedProperties'}
            overrides = {word: keyword_wrapper(word, method) for word, method in original.VALIDATORS.items()
                         if word in keys}
            extended = jsonschema.validators.extend(original, overrides)

            def evolve(instance, **changes):
                prototype = original.evolve(instance, **changes)
                return instantiate(guarded(type(prototype)), prototype)

            extended.evolve = evolve
            classes[original] = extended
        return classes[original]

    def instantiate(cls, prototype):
        return cls(**{field.alias: getattr(prototype, field.name)
                      for field in attrs.fields(type(prototype)) if field.init})

    validator = instantiate(guarded(type(plain)), plain)
    require(not list(plain.iter_errors(accepted)) and not go.errors_of(validator, accepted),
            'original and instrumented validators must both accept the valid document')
    results = {}
    for name in ids:
        example = examples[name]
        path = example['path']
        invalid = edit_example(go, accepted, path, example)
        actual = errors_list(list(plain.iter_errors(invalid)))
        before = go.errors_of(validator, invalid)
        guard = closure._guard_for_location(name)
        require(any(error.oracle_guard == guard and list(error.absolute_path) == path
                    for error in each_error(before)) and actual == errors_list(before),
                f'{name}: expected exact original validation message at {path}')
        cut = go.errors_of(validator, invalid, () if disabled_check == 'rule' else {guard})
        restored = errors_list(go.errors_of(validator, invalid))
        require(not cut and actual == restored, f'{name}: disabling and restoring that one rule failed')
        results[name] = dict(cls='KILLED', control=accepted, invalid=invalid, before=actual,
                             cut=errors_list(cut), restored=restored)
    return results


class ReaderExample:
    def __init__(self, source, row, route, collector, disabled_check):
        self.source = source
        self.row = row
        self.route = route
        self.collector = collector
        self.disabled_check = disabled_check
        self.observed = None
        self.trials = []

    def call(self, world, action, edit):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_dg5_closure as closure
        import pm_goal_dg_int_schema_cache as cache
        import pm_goal_guard_tables as tables
        from pm_goal_dg_r_world import Roots
        from pm_goal_go2_closure import value_sha

        original = Roots.validate
        code = self.row.removeprefix('dg5/').removesuffix('/schema')
        result = dict(errors=[], observations=[])

        def validate(bank, realm, ref, value, label):
            if label != code:
                return original(bank, realm, ref, value, label)
            caller = sys._getframe(1)
            site = [str(Path(caller.f_code.co_filename).relative_to(self.source)), caller.f_lineno]
            require(site == self.route['site'], f'owner source moved to {site}')
            plain = bank.validator(realm, ref)
            ident, binding = root_binding(closure, bank, plain)
            require(ident == self.route['root'], f'owner call reached unexpected root {ident}')
            if edit:
                require(edit not in value, 'test example already has the extra member')
                value[edit] = 'example'
            errors = errors_list(list(plain.iter_errors(value)))
            result['observations'].append(dict(root=ident, binding=binding, site=site,
                                               document=copy.deepcopy(value), messages=errors))
            predicate = tables.predicates(tables.rows()[self.row])[self.row]
            decision = predicate({self.row: not errors}, None)
            require(decision == (self.row if errors else None), 'table disagrees with the original validator')
            self.collector.observe(self.row, not errors, tuple(site))
            if not edit:
                self.observed = plain, bank, copy.deepcopy(value), binding
            if decision and self.row in tables.CUT and self.disabled_check != 'row':
                return value
            return original(bank, realm, ref, value, label)

        try:
            with ExitStack() as stack:
                stack.enter_context(patch.object(Roots, 'validate', validate))
                if isinstance(world.roots, cache.Roots):
                    stack.enter_context(patch.object(world.roots, 'success', {}))
                returned = action()
            result['value_sha256'] = value_sha(returned)
            if edit:
                require(returned.get(edit) == 'example', 'the accepted call did not return the altered document')
        except Exception as error:
            if type(error).__name__ not in bridge.REFUSAL_CLASSES:
                raise
            refusal = bridge.refusal_code(error)
            result.update(refusal=refusal, detail=getattr(error, 'detail', None), errors=[bridge.row(refusal)])
        self.trials.append(result)
        require(len(result['observations']) == 1, 'complete call must reach the expected site exactly once')
        return result

    def prove(self, world, action):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_guard_tables as tables

        initial = bridge.manifest(bridge.file_state(world.storage.root))
        extra = 'methodb_extra'
        for edit in (None, extra, None):
            value = dict(store=initial, route=self.route, edit=edit)

            def evaluate(document):
                require(document == value, 'complete-call inputs changed')
                require(not tables.CUT - {self.row}, 'more than the selected validation rule was disabled')
                result = self.call(world, action, edit)
                require(bridge.manifest(bridge.file_state(world.storage.root)) == initial,
                        'passive call changed the original store')
                return result

            label = f"Method B/{self.route['edition']}/{self.route['call']}"
            self.collector.invoke(label, evaluate, value, edit is None, target=self.row if edit else None,
                                  family=FAMILY)
            record = self.collector.ledger[-1]
            require(not self.collector.failures, self.collector.failures)
            require(record['outcome'] == ('exact_expected' if edit else 'control'), record)
            if edit:
                require(record['kill'] == 'KILLED',
                        f"single-check trial {record['kill']}: {record.get('cut_errors')}")
                before, disabled, restored = self.trials[-3:]
                require(before == restored and before['observations'] == disabled['observations']
                        and not disabled['errors'], 'the same invalid document and message must be restored')
                require(before['refusal'] == self.route['refusal'] and before['detail'] == self.route['detail'],
                        f"unexpected validation message: {before['refusal']} {before['detail']}")
        require(self.trials[0] == self.trials[-1], 'the restored valid call changed')
        return self.observed, initial


def publish(source, out, declare, collector, reports, inventories, table_path):
    first, clauses = next(iter(reports.items()))
    proof_output(source, out, {**declare, 'site': declare['sites'][0]}, collector,
                 clauses, first, table_path)
    closure = json.loads((out / 'closure.json').read_text())
    template = closure['roots'][first]
    for root, cases in reports.items():
        counts = dict(Counter(x['cls'] for x in cases.values()))
        closure['roots'][root] = dict(template, counts=counts, clauses=cases,
                                     clause_inventory=inventories[root]['clause_inventory'],
                                     verify={'passed': counts.get('KILLED', 0) + counts.get('COVERED_LATER', 0),
                                             'failed': 0, 'unverifiable': 0})
    write(out / 'closure.json', closure)
    write(out / 'inventory.json', dict(mode='assertion-inventory', family=FAMILY,
                                      collection_failures=[], roots=inventories))
    collection = out / 'proof/collection.json'
    value = json.loads(collection.read_text())
    value['rows'][declare['row']]['sites'] = declare['sites']
    write(collection, value)
    bindings = out / 'proof/source-bindings.json'
    value = json.loads(bindings.read_text())
    for relative, _ in declare['sites']:
        value['files'][relative] = sha(source / relative)
    write(bindings, value)


def run(args):
    source = args.source.resolve()
    declare = json.loads(args.declaration.read_text())
    require(declare['family'] == FAMILY, 'wrong test family')
    revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    require(revision == declare['source'] and sha(args.census) == declare['census_sha256'],
            'source revision or census bytes changed')
    with gzip.open(args.census, 'rt') as stream:
        census = json.load(stream)
    row = declare['row']
    census_row, = [item for item in census['rows'] if item['row'] == row]
    require(census['family'] == FAMILY and sorted(census_row['sites']) == sorted(declare['sites']),
            'declared sites differ from the census')
    require(set(census_row['root_ids']) == set(declare['examples']) ==
            {route['root'] for route in declare['routes']}, 'declared roots differ from the census')
    require({tuple(route['site']) for route in declare['routes']} == {tuple(site) for site in declare['sites']},
            'every census site needs an owner call')
    require(not census_row['roots_with_inventory_variants'], 'root inventory variants remain unresolved')

    sys.path.insert(0, str(source / 'scripts'))
    import pm_goal_dg5_closure as closure
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables

    table = sweep.table_id([row])
    tables.PHASE_PREFIX = 'pm_goal_dg5_cancelled_phase_'
    tables._ROWS = {row: dict(table=table, phase=True)}
    name = tables.PHASE_PREFIX + table + '.py'
    table_path = source / 'scripts' / name
    expected = sweep.table_source(table, [row], {row: [tuple(site) for site in declare['sites']]})
    require((HERE / name).read_text() == expected, 'committed singleton table differs from the standard generator')
    if not table_path.exists():
        table_path.write_text(expected)
    require(table_path.read_text() == expected, 'source-local table differs from the standard generator')
    args.out.mkdir(parents=True)
    started = time.monotonic()
    collector = sweep.Collector()
    reports, inventories, calls, captured = {}, {}, [], {}
    result = dict(row=row, source=revision, status='NOT_COVERED', census_sha256=declare['census_sha256'])
    try:
        for index, route in enumerate(declare['routes']):
            directory = args.out / f'fixture-{index}'
            directory.mkdir()
            world, action = fixture(route['edition'], route['call'], directory)
            check = ReaderExample(source, row, route, collector, args.disable_check)
            log = dict(route=route, trials=check.trials)
            calls.append(log)
            observation, log['store'] = check.prove(world, action)
            captured.setdefault(route['root'], observation)
        for ident, (plain, bank, accepted, binding) in captured.items():
            root = census['roots'][ident]
            require(all(root[key] == value for key, value in binding.items()),
                    f'owner validator binding changed for {ident}')
            ids = root['clause_ids']
            examples = declare['examples'][ident]
            if ids[0].split('#', 1)[0].count(':sha256:') == 1:
                clauses = scoped_rules(plain, bank, accepted, ident, ids, examples, args.disable_check)
            else:
                clauses, gaps = test_rules(plain, bank, accepted, ident, ids, examples, args.disable_check)
                require(not gaps, f'{ident} needs checked implications for {sorted(gaps)}')
            reports[ident] = clauses
            inventories[ident] = dict(binding, rows=[row], families=[FAMILY], clause_ids=ids,
                                      clause_inventory=closure._clause_inventory_pin(ids))
        publish(source, args.out, declare, collector, reports, inventories, table_path)
        result['status'] = 'COVERED'
    except ValueError as error:
        result['reason'] = str(error)
    finally:
        result.update(seconds=round(time.monotonic() - started, 3), calls=calls)
        write(args.out / 'result.json', result)
        print(json.dumps({k: v for k, v in result.items() if k != 'calls'}, sort_keys=True), flush=True)
    return int(result['status'] != 'COVERED')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--census', type=Path, required=True)
    parser.add_argument('--declaration', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable-check', choices=('inventory', 'rule', 'row'))
    sys.exit(run(parser.parse_args()))
