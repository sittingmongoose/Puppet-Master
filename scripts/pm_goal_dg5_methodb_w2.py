#!/usr/bin/env python3
"""Replay Goal started schema examples against the current callers and exact walks."""
import argparse
import ast
from collections import Counter, defaultdict
from contextlib import ExitStack
import copy
import inspect
import gzip
import json
import multiprocessing
import os
from pathlib import Path
import shutil
import sys
import time
from unittest.mock import patch

from jsonschema import Draft202012Validator

import pm_goal_dg5_methodb_stage1 as stage

pilot = stage.pilot
closure, rules, world = stage.closure, stage.clauses, stage.world
ROOT, FAMILY, require, sha, write = stage.ROOT, stage.FAMILY, stage.require, stage.sha, stage.write
REFERENCE_SHA = 'cb562fa287b7987eabe3b49fc9d3c5119948a69df444ce0a3a0b2d76bdbd4cf2'
TABLE_PREFIX = 'pm_goal_dg5_methodb_w2_phase_'


class Fixture(stage.Fixture):
    def prepare(self):
        if self.route in ('publish_result', 'publish_original_append'):
            return self.world.start.commit_start, (stage.original.request(self.world), self.handles)
        if self.route.startswith(('read_append/', 'read_native/')):
            method = 'inspect_original' if self.route.startswith('read_append/') else 'read_retained_native'
            reader = stage.original.R.StartedReaders(self.world.registry, world=self.world)
            return getattr(reader, method), (stage.original.sreq(self.world),)
        if self.route == 'issue/launch_chain':
            owner = self.world.owners['launch']
            return self.issue_arguments(owner, 'launch_chain')
        if self.route.startswith('issue/seven_input:'):
            kind = self.route.removeprefix('issue/')
            return self.issue_arguments(self.world.owners['input:' + kind.split(':', 1)[1]], kind)
        if self.route.startswith('issue/activation_source:'):
            kind = self.route.removeprefix('issue/')
            owner = self.world.owners['activation:' + kind.split(':', 1)[1]]
            return self.issue_arguments(owner, kind)
        return super().prepare()

    def issue_arguments(self, owner, kind):
        self.issue_kind = kind
        reference, = owner.inventory(kind)
        entry = owner._originals[reference]
        value = world.A.CODECS[owner.custody_codec][1](entry['raw'])
        return owner.issue, (entry['root'], value)

    def variants(self, document):
        yield from super().variants(document)
        if self.route != 'issue/launch_chain':
            return
        ref = self.world.edition.activation + '#/$defs/OriginalSourceBinding'
        binding = world.skeleton(self.bank, ref)
        prepared = copy.deepcopy(document['input'])
        prepared['current_outbox']['record'].update(
            phase='prepared', activation_receipt=copy.deepcopy(binding), staging_source=binding)
        yield prepared

    def call(self, edit):
        if self.route.startswith(('read_append/', 'read_native/')):
            return self.call_reader(edit)
        if self.route in ('publish_result', 'publish_original_append', 'publish_commit',
                          'publish_start_origin', 'publish_retained'):
            return self.call_start(edit)
        if not self.route.startswith('issue/'):
            return super().call(edit)
        root, value = self.args
        if edit:
            position, path, change = edit
            require(position == 1, 'issuer edit must change the document argument')
            value = rules.apply(value, path, tuple(change) if isinstance(change, list) else change)
        return self.action(root, value, kind=self.issue_kind)

    def call_reader(self, edit):
        if not edit:
            return self.action(*self.args)
        route, selected_where = self.route.split('/', 1)
        _, path, change = edit
        readers = stage.original.R
        storage = self.world.storage
        change_value = lambda value: rules.apply(value, path, tuple(change))
        if route == 'read_append':
            original = readers.original_append
            fetch = storage.full_value_result

            def original_append(world, event_id, where='append'):
                with ExitStack() as stack:
                    if where == selected_where:
                        stack.enter_context(patch.object(storage, 'full_value_result',
                                                         lambda event_id: change_value(fetch(event_id))))
                    return original(world, event_id, where=where)

            with patch.object(readers, 'original_append', original_append):
                return self.action(*self.args)
        original = readers.retained_native
        fetch = storage.cell
        key = self.world.ctx.run_key('workflow_start_control_origin.v1')

        def cell(family, physical_key):
            value = fetch(family, physical_key)
            if (family, physical_key) == ('workflow_start_control_origin', key):
                return dict(value, value=change_value(value['value']))
            return value

        def retained_native(world, op=None, *, where='retained'):
            with ExitStack() as stack:
                if where == selected_where:
                    stack.enter_context(patch.object(storage, 'cell', cell))
                return original(world, op, where=where)

        with patch.object(readers, 'retained_native', retained_native):
            return self.action(*self.args)

    def call_start(self, edit):
        if not edit:
            return self.action(*self.args)
        _, path, change = edit
        apply = lambda value: rules.apply(value, path, tuple(change))
        args = list(self.args)
        if self.route == 'publish_commit':
            args[-1] = dict(args[-1], commit=apply)
        elif self.route == 'publish_retained':
            args[2] = dict(args[2])
            birth = dict(args[2]['native_birth'])
            birth['initial_control_origin'] = apply(birth['initial_control_origin'])
            args[2]['native_birth'] = birth
        elif self.route == 'publish_result':
            def union(value):
                return dict(value, d01_lineage=apply(value['d01_lineage']))

            return self.action(*args, edits={'union': union})
        elif self.route == 'publish_original_append':
            storage = self.world.storage
            original = storage.full_value_result
            with patch.object(storage, 'full_value_result', lambda event_id: apply(original(event_id))):
                return self.action(*args)
        elif self.route == 'publish_start_origin':
            skeleton = world.skeleton
            ref = self.world.edition.custody + '#/$defs/StorageOrigin'

            def origin(bank, selector):
                value = skeleton(bank, selector)
                return apply(value) if selector == ref else value

            with patch.object(world, 'skeleton', origin):
                return self.action(*args)
        return self.action(*args)


class CompleteCall(stage.Example):
    def run(self, edit=None, cut=False):
        if self.fixture.route not in ('publish_result', 'publish_original_append'):
            return super().run(edit, cut)
        # These two checks run after the original start has written some or all
        # of its publication. Every execution starts from an independent copy.
        original = self.fixture.path
        require(stage.store(original) == self.before, 'complete-call store preimage changed')
        replay = original.with_name(original.name + f'-late-publication-{len(self.runs)}')
        shutil.copytree(original, replay)
        require(stage.store(replay) == self.before, 'publication replay copy differs from its source')
        receiver, sender = multiprocessing.get_context('fork').Pipe(duplex=False)
        child = multiprocessing.get_context('fork').Process(target=self.in_child, args=(sender, edit, cut, replay))
        child.start()
        sender.close()
        try:
            record = receiver.recv()
        finally:
            receiver.close()
            child.join()
        require(child.exitcode == 0, 'complete-call child failed')
        require(stage.store(original) == self.before, 'complete call changed the original stored test bytes')
        record['before'] = self.before
        self.runs.append(record)
        return record


class PreviousExamples:
    """Old edits are candidate documents; current tests assign every rule ID."""
    def __init__(self):
        self.reports = {}
        self.pins = {}

    def entries(self, previous):
        root = previous['root']
        result = defaultdict(list)
        for path in previous['reports']:
            if path not in self.reports:
                source = Path(path)
                self.pins[path] = sha(source)
                self.reports[path] = json.loads(source.read_bytes())['roots']
            for rule_id, record in self.reports[path][root]['clauses'].items():
                if 'path' not in record or 'edit' not in record:
                    continue
                try:
                    edit = ast.literal_eval(record['edit'])
                except (SyntaxError, ValueError):
                    continue
                item = (record['path'], edit, path)
                if item not in result[rule_id]:
                    result[rule_id].append(item)
        return result


def error_records(errors):
    return [dict(path=list(e.absolute_path), schema_path=list(e.absolute_schema_path),
                 keyword=e.validator, message=e.message, context=error_records(e.context)) for e in errors]


def finite_implication(validator, nodes, info, keyword, cut, path):
    """Check a co-required finite rule against the compound schema's other rule."""
    if keyword not in ('type', 'enum', 'minimum', 'minLength', 'maxLength'):
        return None
    node = info['node']
    other_at_path = {name for name, seen_path in pilot.located_errors(cut) if seen_path == tuple(path)}
    options = defaultdict(list)
    for location, candidate in nodes.items():
        schema = candidate['node']
        for finite in ('const', 'enum'):
            other = location + '/' + finite
            if finite not in schema or other not in other_at_path:
                continue
            if validator.VALIDATORS[finite] is not Draft202012Validator.VALIDATORS[finite]:
                continue
            values = [schema[finite]] if finite == 'const' else schema[finite]
            if keyword == 'type':
                types = node[keyword] if isinstance(node[keyword], list) else [node[keyword]]

                def type_ok(value):
                    if value is None or type(value) in (bool, str):
                        return any(validator.is_type(value, kind) for kind in types)
                    if type(value) is int and abs(value) <= 2**53:
                        return all(any(validator.is_type(number, kind) for kind in types)
                                   for number in (value, float(value)))
                    return False

                holds = all(type_ok(value) for value in values)
            elif keyword == 'enum':
                holds = (validator.VALIDATORS['enum'] is Draft202012Validator.VALIDATORS['enum'] and
                         all(isinstance(value, str) and value in node[keyword] for value in values))
            elif keyword == 'minimum':
                holds = (inspect.unwrap(validator.VALIDATORS['minimum']) is Draft202012Validator.VALIDATORS['minimum'] and
                         all(type(value) is int and abs(value) <= 2**53 and value >= node[keyword] for value in values))
            else:
                bound = node[keyword]
                holds = all(isinstance(value, str) and
                            (len(value) >= bound if keyword == 'minLength' else len(value) <= bound)
                            for value in values)
            if holds:
                options[other].extend(candidate['reach'])
    for other, reaches in options.items():
        if all(any(candidate['ipath'] == reach['ipath'] and
                   rules.applies(candidate, rules.scope_of(reach, nodes)) for candidate in reaches)
               for reach in info['reach']):
            return dict(covering_rule=other, premise='Every JSON value allowed by the co-required rule satisfies this rule.')
    return None


def outbox_implication(nodes, rule_id, path, cut):
    """Both branches independently restrict the value to the optional binding schema."""
    if tuple(path[:-1]) != ('current_outbox', 'record') or path[-1] not in ('activation_receipt', 'staging_source'):
        return None
    field = path[-1]
    prefix = 'https://puppetmaster.local/proposals/workflow_activation_sources.v4.schema.json'
    location = prefix + '#/$defs/StartOutboxIntent'
    member = f'{location}/properties/{field}'
    if rule_id not in (member + '/anyOf', member + '/anyOf/1/type'):
        return None
    node = nodes[location]['node']
    conditional, = node['allOf']
    condition = conditional['if']['properties']['phase']
    optional = node['properties'][field]['anyOf']
    required_null = conditional['then']['properties'][field]
    required_object = conditional['else']['properties'][field]
    if not (set(conditional['if']) <= {'properties', 'x-pm-oracle-id'} and
            list(conditional['if']['properties']) == ['phase'] and condition.get('const') == 'reserved' and
            set(condition) <= {'const', 'x-pm-oracle-id'} and
            'phase' in node['required'] and field in node['required'] and
            len(optional) == 2 and isinstance(required_object.get('$ref'), str) and
            optional[0].get('$ref') == required_object['$ref'] and
            set(optional[0]) <= {'$ref', 'x-pm-oracle-id'} and
            set(required_object) <= {'$ref', 'x-pm-oracle-id'} and
            optional[1].get('type') == required_null.get('type') == 'null' and
            set(optional[1]) <= {'type', 'x-pm-oracle-id'}):
        return None
    other = required_null['x-pm-oracle-id'] + '/type'
    if (other, tuple(path)) not in pilot.located_errors(cut):
        return None
    return dict(covering_rule=other, prepared_binding=required_object['$ref'],
                source=location, premise='The reserved branch requires null and the other branch requires the same binding reference. Both outcomes already accept through one of these two alternatives.')


def accepted_branch_controls(plain, validator, controls, info, cache):
    """Reuse the Goal suite's branch fixture construction."""
    for reach in info['reach']:
        for variant in range(3):
            key = (reach['ipath'], tuple(rules.ctx_key(c) for c in reach['ctx']), variant)
            if key not in cache:
                try:
                    value, path = rules.realize(controls[0], reach, variant, validator)
                except (KeyError, IndexError, TypeError, ValueError, RecursionError):
                    value, path = None, None
                cache[key] = None
                if path is None or value is None or value == controls[0]:
                    continue
                if list(plain.iter_errors(value)) or rules.errors_of(validator, value):
                    continue
                digest = stage.sweep.digest(value)
                index = next((i for i, control in enumerate(controls) if stage.sweep.digest(control) == digest), None)
                if index is None:
                    index = len(controls)
                    controls.append(value)
                cache[key] = (index, path)
            if cache[key] is not None:
                yield cache[key]


def per_rule_candidates(plain, validator, controls, info, keyword, old, cache):
    def edits(control, path):
        return rules.defects(keyword, info['node'], rules.get(control, path))

    for index, control in enumerate(controls):
        for path, edit, source in old:
            try:
                yield index, stage.actual_path(control, path), edit, source
            except (KeyError, IndexError, TypeError, ValueError):
                continue
        for reach in info['reach']:
            for path in rules.concrete(control, reach['ipath']):
                for edit in edits(control, path):
                    yield index, path, edit, 'installed rule'
                if tuple(path[:-1]) == ('current_outbox', 'record') and path[-1] in ('activation_receipt', 'staging_source'):
                    for candidate in controls:
                        alternate = rules.get(candidate, path)
                        if alternate is not None:
                            yield index, path, alternate, 'accepted prepared outbox binding'
    for index, path in accepted_branch_controls(plain, validator, controls, info, cache):
        for edit in edits(controls[index], path):
            yield index, path, edit, 'accepted branch document'


def replay_rule(plain, validator, nodes, controls, rule_id, info, keyword, old, disable, cache):
    node = info['node']
    if all(any(c[0] in ('if', 'not') for c in reach['ctx']) for reach in info['reach']):
        return dict(cls='SELECTOR_OR_NEGATED', reason='all occurrences are inside an if condition or negation'), None
    if keyword in ('minItems', 'minLength', 'minProperties') and node[keyword] == 0:
        return dict(cls='VACUOUS', reason=f'{keyword}: 0 holds for every applicable value'), None
    _, guard = closure._clause_identity(node, keyword)
    result = None
    tried = set()
    for index, path, edit, source in per_rule_candidates(plain, validator, controls, info, keyword, old, cache):
        candidate_key = (index, tuple(path), repr(edit))
        if candidate_key in tried:
            continue
        tried.add(candidate_key)
        try:
            changed = rules.apply(controls[index], path, edit)
        except (KeyError, IndexError, TypeError, ValueError):
            continue
        located = (rule_id, tuple(path))
        before = rules.errors_of(validator, changed)
        if located not in pilot.located_errors(before):
            continue
        actual = error_records(plain.iter_errors(changed))
        require(error_records(before) == actual, f'{rule_id}: validator instrumentation changed the original messages')
        cut = rules.errors_of(validator, changed, set() if disable == 'clause' else {guard})
        restored = rules.errors_of(validator, changed)
        require(rule_id not in rules.locations(cut) and error_records(restored) == actual,
                f'{rule_id}: individual rule disable or restoration failed')
        implication = None
        if cut:
            implication = (finite_implication(plain, nodes, info, keyword, cut, path) or
                           outbox_implication(nodes, rule_id, path, cut) or
                           stage.regex_implication(plain, node, keyword, rule_id, path, cut))
        record = dict(path=list(path), edit=repr(edit), edit_source=source, control=index,
                      input_sha256=stage.sweep.digest(changed), before=actual, cut=error_records(cut),
                      restored=error_records(restored))
        if cut and implication is None:
            if result is None:
                result = record
            continue
        if implication:
            record['implication'] = implication
        record['cls'] = 'COVERED_LATER' if cut else 'KILLED'
        return record, None
    if result is None:
        proof = (rules.contradicted_branch(info, nodes) or rules.forbidden_member(info, nodes) or
                 rules.excluded_by_cases(info, nodes))
        if all(reach['empty_domain'] for reach in info['reach']):
            proof = 'Every occurrence requires an item of an array whose installed schema has maxItems: 0.'
        if proof:
            return dict(cls='UNREACHABLE', premise=proof), None
    return None, (result or {'reason': 'no example exercised the exact rule on the accepted documents'})


def replay_root(fixture, captured, reference, examples, disable):
    bank = fixture.bank.original
    selector = captured['schema']['$ref']
    plain = bank.validator(selector)
    root = captured['root']
    bank_name = type(bank).__module__ + '.' + type(bank).__qualname__
    validator_name = type(plain).__module__ + '.' + type(plain).__qualname__
    require(bank_name == reference['bank'] and validator_name == reference['validator_class'] and
            json.loads(reference['schema']) == plain.schema == captured['schema'] and
            closure._registry_digest(plain) == reference['registry_sha256'] == captured['registry_sha256'],
            f'{root}: installed bank, schema or registry differs from the fresh walk')
    # Each DG5 reference walk used a fresh annotation cache. Shared resources
    # must receive their location from this registry's exact retrieval URIs.
    closure.PREPARED.clear()
    rules.SCOPES.clear()
    validator = closure.closure_validator(plain, root, bank)
    nodes, ids = closure._clause_inventory(validator)
    expected = reference['clause_ids']
    if disable == 'inventory':
        expected = expected[1:]
    require(ids == expected and closure._clause_inventory_pin(ids) == reference['clause_inventory'],
            f'{root}: exact rule inventory differs from the fresh walk, '
            f'only current={sorted(set(ids) - set(expected))[:3]}, '
            f'only reference={sorted(set(expected) - set(ids))[:3]}')
    controls = list(fixture.variants(captured))
    require(all(not error_records(plain.iter_errors(value)) and not rules.errors_of(validator, value)
                for value in controls), f'{root}: accepted schema control refused')
    results, gaps, branch_cache = {}, {}, {}
    for location, info in nodes.items():
        node = info['node']
        for keyword in rules.clauses_of(node):
            rule_id = location + '/' + closure.clause_name(node, keyword)
            record, problem = replay_rule(plain, validator, nodes, controls, rule_id, info, keyword,
                                          examples.get(rule_id, ()), disable, branch_cache)
            (gaps if problem else results)[rule_id] = problem or record
    require(set(results) | set(gaps) == set(ids), f'{root}: incomplete rule accounting')
    return dict(clauses=results, gaps=gaps, controls=controls, clause_inventory=reference['clause_inventory'],
                clause_ids=ids, bank=bank_name, registry_sha256=reference['registry_sha256'],
                schema=captured['schema'], validator_class=validator_name,
                schema_sources=bank.resource_origins)


def run_case(case, reference, prior_row, output, disable, selected=None):
    started = time.monotonic()
    name = case['row']
    mapping = reference['rows'][name]
    roots = {ident: reference['roots'][ident] for ident in mapping['roots']}
    seed = int(os.environ['PYTHONHASHSEED'])
    specs = [entry for entry in case['fixtures']
             if (entry['root'] == selected if selected is not None else entry['hash_seed'] == seed)]
    require(specs, f'{name}: no fixture is declared for the selected root or seed')
    sites = {(item['path'], item['line']) for item in mapping['current_sites']}
    require(all(sha(ROOT / item['path']) == item['sha256'] and
                (ROOT / item['path']).read_text().splitlines()[item['line'] - 1].strip() == item['line_text']
                for item in mapping['current_sites']), f'{name}: current validator source changed')
    pilot.PREFIX = TABLE_PREFIX
    pilot.SITES.clear()
    pilot.SITES[name] = min(sites)
    pilot.configure_tables()
    output.mkdir(parents=True)
    report = dict(row=name, status='NOT_COVERED', roots={}, calls={}, reference_sha256=REFERENCE_SHA,
                  current_sites=mapping['current_sites'], seed=seed)
    collector = stage.sweep.Collector()
    examples = PreviousExamples()
    original_roots = {item['root']: item for item in prior_row['schema_closure']['roots']}
    try:
        suite = stage.original.Suite(output / 'stores')
        for spec in specs:
            fixture = Fixture(suite, spec['route'], spec['edition'])
            experiment = CompleteCall(fixture, name, sites, spec)
            try:
                documents = experiment.prove(collector, disable)
            finally:
                report['calls'][spec['root']] = experiment.runs
            require({document['root'] for document in documents} == {spec['root']},
                    f"expected {spec['root']}, observed {[document['root'] for document in documents]}")
            ident = spec['root']
            report['roots'][ident] = replay_root(fixture, documents[0], roots[ident],
                                                examples.entries(original_roots[ident]), disable)
        require(not collector.failures, f'unexpected complete-call failures: {collector.failures}')
        target = pilot.run_gates(collector, output, [name])
        bindings = json.loads((target / 'source-bindings.json').read_bytes())
        for path in {Path(__file__), Path(stage.__file__), *(ROOT / file for file, _ in sites)}:
            bindings['files'][str(path.relative_to(ROOT))] = sha(path)
        write(target / 'source-bindings.json', bindings)
        results = {}
        inventories = {}
        for ident, root in report['roots'].items():
            keys = ('clause_ids', 'clause_inventory', 'bank', 'registry_sha256', 'schema',
                    'validator_class', 'schema_sources')
            inventories[ident] = {key: root[key] for key in keys}
            inventories[ident].update(rows=[name], families=[FAMILY])
            counts = Counter(item['cls'] for item in root['clauses'].values())
            entries = dict(root['clauses'])
            entries.update((rule, dict(cls='UNCOVERED', detail=detail)) for rule, detail in root['gaps'].items())
            counts['UNCOVERED'] = len(root['gaps'])
            results[ident] = dict(inventories[ident], clauses=entries, counts=dict(counts),
                                  verify=dict(passed=counts['KILLED'] + counts['COVERED_LATER'],
                                              failed=0, unverifiable=0))
        write(output / 'exact-inventory.json', dict(mode='assertion-inventory', roots=inventories))
        write(output / 'clause-replay.json', {'roots': results})
        require(all(not root['gaps'] for root in report['roots'].values()), 'exact rule tests incomplete')
        report['status'] = 'READY_FOR_MATRIX'
    except (ValueError, KeyError, TypeError) as error:
        report['reason'] = str(error)
    finally:
        report.update(seconds=round(time.monotonic() - started, 3), historical_example_inputs=examples.pins)
        write(output / 'result.json', report)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--matrix', type=Path, required=True)
    parser.add_argument('--reference', type=Path, required=True)
    parser.add_argument('--case', type=Path, action='append', required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable', choices=('row', 'clause', 'inventory'))
    parser.add_argument('--root', help='replay one exact declared root and publish its proof fragment')
    args = parser.parse_args()
    require(sha(args.reference) == REFERENCE_SHA, 'fresh reference bundle changed')
    with gzip.open(args.reference, 'rt') as stream:
        reference = json.load(stream)
    _, rows, _ = stage.matrix_inputs(args.matrix)
    world.v3_edition()
    world.v7_edition()
    okay = True
    for path in args.case:
        case = json.loads(path.read_bytes())
        name = case['row']
        specs = case['fixtures']
        require(sorted(row['root'] for row in specs) == sorted(reference['rows'][name]['roots']),
                f'{name}: declaration omits or repeats an exact root')
        report = run_case(case, reference, rows[name], args.out / stage.sweep.table_id([name]),
                          args.disable, args.root)
        print(name, report['status'], report['seconds'], report.get('reason', ''), flush=True)
        okay &= report['status'] == 'READY_FOR_MATRIX'
    return 0 if okay else 1


if __name__ == '__main__':
    sys.exit(main())
