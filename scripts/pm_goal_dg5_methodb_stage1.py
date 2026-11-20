#!/usr/bin/env python3
"""Run the declared Goal started validation examples against the original checker."""
import argparse
import ast
from collections import Counter, defaultdict
from contextlib import ExitStack
import copy
import hashlib
import json
import multiprocessing
from pathlib import Path
import shutil
import subprocess
import sys
import time
from unittest.mock import patch

import pm_goal_dg5_methodb_pilot as pilot
from pm_goal_own_c_oracles import exact_pattern, uuid_string
from pm_goal_dg5_methodb_pilot import (
    FAMILY, MATRIX_SHA, ROOT, bridge, clauses, closure, common, original,
    require, sha, store, sweep, tables, world, write,
)

ROW_PREFIX = 'dg5/'
UUID_PATTERN = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
PATTERN_PINS = {
    'scripts/pm_goal_own_c_oracles.py': 'ec8daf13cf3814e3264be408c5861fdd7d51aff2ebe62c36d9042990c61136c4',
    'scripts/pm_goal_own_c_roots.py': 'cf1737c777fa7f126ecb0a922d2e53d92c18801af2c86ccaac24724c09002290',
}


def matrix_inputs(path):
    require(sha(path) == MATRIX_SHA, 'started matrix pin mismatch')
    baseline = json.loads(path.read_bytes())
    rows = {row['row']: row for row in baseline['families'][FAMILY]['matrix']}
    files = sorted({file for row in rows.values() for root in (row['schema_closure'] or {}).get('roots', [])
                    for file in root['reports']})
    return baseline, rows, files


class Inventory:
    def __init__(self):
        self.reports = {}

    def root(self, report, ident):
        if report not in self.reports:
            self.reports[report] = json.loads(Path(report).read_bytes())['roots']
        return self.reports[report][ident]

    def compare(self, row):
        result = {}
        for root in row['schema_closure']['roots']:
            ident = root['root']
            entries = [(path, self.root(path, ident)) for path in root['reports']]
            sources = [(path, item) for path, item in entries if 'registry_sha256' in item and 'clauses' in item]
            require(sources, f'{ident}: no historical report records the original registry and rule IDs')
            reference, first = sources[0]
            keys = set(first['clauses'])
            differences = []
            for path, entry in entries:
                other = set(entry.get('clauses', ()))
                if keys != other:
                    differences.append(dict(report=path, missing=sorted(keys - other), added=sorted(other - keys)))
                require('registry_sha256' not in entry or first['registry_sha256'] == entry['registry_sha256'],
                        f'{ident}: identical root ID has a different registry digest')
            result[ident] = dict(reference=reference, rule_count=len(keys), differences=differences,
                                 reports_without_registry=[path for path, entry in entries
                                                           if 'registry_sha256' not in entry],
                                 gaps=root['uncovered_clauses'], matrix_error=root['error'])
        return result


def single_rows(rows):
    return [row for row in rows.values() if row['row'] != pilot.REQUEST and row['schema_closure']
            and row['predicate']['gated'] == 'UNPROVED' and not row['schema_closure']['uncovered']
            and len(row['schema_closure']['roots']) == 1]


def expected_code(code, path, keyword):
    return f"{code}/schema/{'/'.join(map(str, path))}:{keyword}"


class Example:
    """Each run uses the same issued source, store bytes and original checker."""

    def __init__(self, fixture, row, sites, declaration):
        self.fixture = fixture
        self.row = row
        self.code = row.removeprefix(ROW_PREFIX).removesuffix('/schema')
        self.sites = sites
        self.declaration = declaration
        self.before = store(fixture.path)
        self.clock_ns = time.time_ns()
        self.runs = []

    def run(self, edit=None, cut=False):
        require(store(self.fixture.path) == self.before, 'complete-call store preimage changed')
        replay = self.fixture.path
        if self.fixture.route.startswith('publish_'):
            replay = replay.parent / (replay.name + f'-publication-replay-{len(self.runs)}')
            shutil.copytree(self.fixture.path, replay)
            require(store(replay) == self.before, 'publication replay copy differs from its source')
        context = multiprocessing.get_context('fork')
        receiver, sender = context.Pipe(duplex=False)
        child = context.Process(target=self.in_child, args=(sender, edit, cut, replay))
        child.start()
        sender.close()
        try:
            record = receiver.recv()
        finally:
            receiver.close()
            child.join()
        require(child.exitcode == 0, 'complete-call child failed')
        require(store(self.fixture.path) == self.before, 'complete call changed the original stored test bytes')
        require(record['after'] == self.before or
                (replay != self.fixture.path and record.get('result_sha256') is not None),
                'refused or passive call changed stored test bytes')
        self.runs.append(record)
        return record

    def in_child(self, sender, edit, cut, replay):
        original_validate = world.Bank.validate
        record = dict(code=None, observations=[], cut=cut, edit=edit)

        def observe(bank, ref, value, code='root'):
            if code != self.code:
                return original_validate(bank, ref, value, code)
            frame = sys._getframe(1)
            site = (str(Path(frame.f_code.co_filename).relative_to(ROOT)), frame.f_lineno)
            require(site in self.sites, f'unexpected original validator call site {site}')
            admitted_site = self.declaration.get('validation_site')
            if admitted_site is not None and site != tuple(admitted_site):
                return original_validate(bank, ref, value, code)
            validator = bank.original.validator(ref)
            registry = closure._registry_digest(validator)
            key = (type(validator).__module__ + '.' + type(validator).__qualname__,
                   json.dumps(validator.schema, sort_keys=True), registry, type(bank.original).__qualname__)
            errors = bank.errors(ref, value)
            first = min(errors, key=lambda e: list(e.absolute_path)) if errors else None
            predicate = tables.predicates(tables.rows()[self.row])[self.row]
            refusal = predicate({self.row: not errors}, None)
            require(refusal == (self.row if errors else None), 'singleton check disagrees with original validator')
            record['observations'].append(dict(site=site, root=closure.root_id(key), registry_sha256=registry,
                                                schema=validator.schema, input=copy.deepcopy(value),
                                                errors=error_records(errors), first_message=first.message if first else None))
            if refusal and not cut:
                return original_validate(bank, ref, value, code)
            return value

        try:
            with ExitStack() as changes:
                changes.enter_context(patch.object(world.Bank, 'validate', observe))
                if replay != self.fixture.path:
                    storage = self.fixture.world.storage
                    storage_path = storage.root.relative_to(self.fixture.path)
                    changes.enter_context(patch.object(storage, 'root', replay / storage_path))
                    changes.enter_context(patch.object(original.S.time, 'time_ns', return_value=self.clock_ns))
                result = self.fixture.call(edit)
            record['result_sha256'] = self.fixture.result_digest(result)
        except self.fixture.refusals as error:
            record['code'] = world.code_of(error)
        except Exception as error:
            record['exception'] = f'{type(error).__name__}: {error}'
        record['after'] = store(replay)
        sender.send(record)
        sender.close()

    def prove(self, collector, disable=None):
        declaration = self.declaration
        label = f"Method B/{self.fixture.edition}/{self.fixture.route}"
        documents = []
        positive = (None, None)
        negative = (declaration['edit'], expected_code(self.code, *declaration['error']))
        for edit, expected in (positive, negative, positive):
            valid = edit is None
            value = dict(store=self.before, fixture=self.fixture.binding, edit=edit, expected=expected)

            def evaluate(presented):
                require(sweep.digest(presented) == sweep.digest(value), 'changed complete-call input')
                require(not tables.CUT - {self.row}, 'this replay disables only the selected validation row')
                cut = self.row in tables.CUT or (disable == 'row' and not valid)
                record = self.run(edit, cut)
                require('exception' not in record, record.get('exception'))
                require(record['observations'], 'target validator did not run')
                for observation in record['observations']:
                    collector.observe(self.row, not observation['errors'], tuple(observation['site']))
                if not collector.replaying:
                    require(record['code'] == expected,
                            f"expected complete-call validation code {expected!r}, got {record['code']!r}")
                return {'errors': [bridge.row(record['code'])] if record['code'] else []}

            collector.invoke(label + ('/valid' if valid else '/invalid'), evaluate, value, valid,
                             target=None if valid else self.row, family=FAMILY)
            record = collector.ledger[-1]
            require(record['outcome'] == ('control' if valid else 'exact_expected'),
                    f'complete-call validity check failed: {record}')
            if valid:
                documents.extend(self.runs[-1]['observations'])
            else:
                require(record['kill'] == 'KILLED', f'single rule did not isolate the complete call: {record}')
                before, cut, restored = self.runs[-3:]
                require(before['code'] == restored['code'] == expected and cut['code'] is None and
                        before['observations'] == restored['observations'] and
                        before['observations'][0] == cut['observations'][0],
                        'the invalid document or validation message changed during restoration')
        require(self.runs[0]['result_sha256'] == self.runs[-1]['result_sha256'],
                'the restored valid call changed its result')
        require(self.runs[0]['observations'] == self.runs[-1]['observations'], 'restored control input changed')
        return documents[:len(self.runs[0]['observations'])]


def error_records(errors):
    return [dict(path=list(error.absolute_path), schema_path=list(error.absolute_schema_path),
                 keyword=error.validator, message=error.message) for error in errors]


class Fixture:
    """Test documents constructed by the existing Goal started fixture owners."""
    refusals = (*world.REFUSALS, original.R.G.Halt)

    def __init__(self, suite, route, edition):
        self.route = route
        self.edition = edition
        if route in ('entry_joins', 'start_candidate') or route.startswith('publish_'):
            self.world, self.handles = original.new_world(suite, edition)
        else:
            self.world, self.handles, _ = original.started(suite, edition)
        self.path = Path(self.world.work)
        self.bank = self.world.edition.bank
        self.goal_bank = self.world.edition.goal_bank
        self.projector = None
        self.action, self.args = self.prepare()
        self.binding = dict(
            caller=str(Path(self.action.__code__.co_filename).relative_to(ROOT)),
            caller_line=self.action.__code__.co_firstlineno, caller_sha256=sha(Path(self.action.__code__.co_filename)),
            arguments_sha256=bridge.descriptor_sha256(self.args, self.world),
            world_sha256=bridge.descriptor_sha256(vars(self.world), self.world),
        )

    def prepare(self):
        w = self.world
        route = self.route
        readers = original.R
        if route in ('inspect_original', 'read_retained_native'):
            reader = readers.StartedReaders(w.registry, world=w)
            return getattr(reader, route), (original.sreq(w),)
        if route == 'read_historical':
            self.projector, reader, _ = original.projected(w)
            return reader.read_historical, (original.sreq(w),)
        if route == 'dedupe':
            return w.start.dedupe, (original.request(w),)
        if route == 'entry_joins':
            sources, _ = w.start.acquire_all(self.handles)
            return w.start.entry_joins, (original.request(w), sources)
        if route == 'body_commitment':
            native = w.owners['native'].current()
            return w.start.body_commitment, (native['body'], native['control'])
        if route == 'start_candidate' or route.startswith('publish_'):
            return self.capture_start_arguments('candidate' if route == 'start_candidate' else 'publication_union')
        if route.startswith('issue/'):
            kind = route.split('/', 1)[1]
            owner = w.owners['activation:' + kind]
            reference, = owner.inventory('activation_source:' + kind)
            entry = owner._originals[reference]
            value = world.A.CODECS[owner.custody_codec][1](entry['raw'])
            return owner.issue, (entry['root'], value)
        if route == 'd01/current_source':
            return w.owners['d01'].current_source, (w.owners['native'].current(),)
        if route == 'cutover_original':
            return readers.original_started, (w,)
        if route == 'reducer':
            artifact = readers.original_started(w)
            append = artifact['original_append']
            event = append['event']
            reducer = readers.StartReducer(w, {event['event_id']: artifact['native_start']})
            return reducer.step, (reducer.initial(), event, append['exact_custody'])
        if route == 'prefix':
            _, _, result = original.project_once(w)
            self.projector, _, _ = original.projected(w)
            _, _, _, row = self.projector.current_row()
            return readers.processed_prefix, (w, result, self.projector.rep.projection_key(), row['value'])
        self.projector, _, _ = original.projected(w)
        cell, logical = self.projector.checkpoint()
        if route == 'projector_logical':
            return self.projector._logical, (logical['generations'], logical['current_generation_id'])
        if route == 'storage_checkpoint':
            return self.projector.rep.decode_checkpoint, (cell['value'],)
        if route == 'logical_checkpoint':
            logical['generations'][logical['current_generation_id']]['hold_refs'] = [
                f'TEST_ONLY:hold:{i:04d}:' + 'x' * 80 for i in range(200)
            ]
            wrapper = self.projector.rep.encode_checkpoint(logical)
            require(wrapper['content']['kind'] == 'payload_reference', 'logical fixture must use a stored pack')
            invalid = dict(logical, gc_extra_member='gc')
            self.invalid_checkpoint = self.projector.rep.encode_checkpoint(invalid, force='payload_reference')
            return self.projector.rep.decode_checkpoint, (wrapper,)
        raise ValueError(f'unknown Goal started fixture {route}')

    def capture_start_arguments(self, method):
        """Seal the actual caller arguments at the entry to the test routine."""
        start = self.world.start
        action = getattr(start, method)
        captured = []

        class AtBoundary(Exception):
            pass

        def capture(*args):
            captured.extend(args)
            raise AtBoundary

        with patch.object(start, method, capture):
            try:
                start.commit_start(original.request(self.world), self.handles)
            except AtBoundary:
                pass
        require(captured, f'original Start call did not reach {method}')
        return action, tuple(captured)

    def call(self, edit):
        args = self.args
        if self.route.startswith('publish_'):
            return self.call_publication(edit)
        if self.route == 'cutover_original':
            retained = original.R.retained_native

            def changed(*arguments, **keywords):
                value = retained(*arguments, **keywords)
                return clauses.apply(value, edit[1], tuple(edit[2])) if edit else value

            with patch.object(original.R, 'retained_native', changed):
                return self.action(*args, where='cutover/original')
        if edit and self.route == 'logical_checkpoint':
            args = (self.invalid_checkpoint,)
        elif edit:
            position, path, value = edit
            changed = clauses.apply(args[position], path, tuple(value) if isinstance(value, list) else value)
            args = args[:position] + (changed,) + args[position + 1:]
        if self.route.startswith('issue/'):
            return self.action(*args, kind='activation_source:' + self.route.split('/', 1)[1])
        return self.action(*args)

    def call_publication(self, edit):
        if not edit:
            return self.action(*self.args)
        _, path, value = edit
        w = self.world
        args = list(self.args)
        change = lambda document: clauses.apply(document, path, tuple(value))
        if self.route == 'publish_control':
            args[2] = copy.deepcopy(args[2])
            origin = args[2]['native_birth']
            origin['start_control'] = change(origin['start_control'])
            return self.action(*args)
        if self.route == 'publish_origin':
            args[-1] = dict(args[-1], d01_origin=change)
            return self.action(*args)
        if self.route == 'publish_head':
            skeleton = world.skeleton

            def selected(bank, ref):
                document = skeleton(bank, ref)
                if ref == w.edition.consumer + '#/$defs/RetainedNativeStart':
                    document['original_d01_head'] = change(document['original_d01_head'])
                return document

            with patch.object(world, 'skeleton', selected):
                return self.action(*args)
        require(self.route == 'publish_pointer', f'unknown publication fixture {self.route}')
        cell = w.storage.cell
        pointer = (original.ST.d01_families(w.edition)['pointer'], w.owners['d01'].pointer_key())

        def chosen(family, key):
            stored = cell(family, key)
            if (family, key) == pointer:
                return dict(stored, value=change(stored['value']))
            return stored

        with patch.object(w.storage, 'cell', chosen):
            return self.action(*args)

    def result_digest(self, result):
        if self.route.startswith('issue/'):
            owner = self.action.__self__
            return hashlib.sha256(owner._originals[owner._handles[result]]['raw']).hexdigest()
        return sweep.digest(result)

    def variants(self, document):
        value = document['input']
        yield value
        if self.route == 'storage_checkpoint':
            _, logical = self.projector.checkpoint()
            yield self.projector.rep.encode_checkpoint(logical, store=False, force='payload_reference')
        if self.route in ('projector_logical', 'storage_checkpoint', 'logical_checkpoint'):
            variant = copy.deepcopy(value)
            logical = variant['content']['checkpoint'] if self.route == 'storage_checkpoint' else variant
            generation = logical['generations'][logical['current_generation_id']]
            if not generation['hold_refs']:
                generation['hold_refs'] = ['TEST_ONLY:hold:stage-1']
                yield variant


def actual_path(document, recorded):
    """Bind a historical instance path to this fixture's sole generation key."""
    output = []
    current = document
    for key in recorded:
        if isinstance(current, list) and isinstance(key, str) and key.isdecimal():
            key = int(key)
        if isinstance(current, dict) and isinstance(key, str) and key.startswith('grsg_') and key not in current:
            keys = [item for item in current if item.startswith('grsg_')]
            require(len(keys) == 1, 'generation instance path is ambiguous')
            key, = keys
        current = current[key]
        output.append(key)
    return output


def regex_implication(validator, node, keyword, name, path, cut):
    """Check the Goal checkpoint duplicates against the installed full-match predicates."""
    pattern = node.get('pattern')
    if validator.VALIDATORS['pattern'] is not exact_pattern:
        return None
    width = {'^' + UUID_PATTERN + '$': 36, '^[0-9a-f]{64}$': 64}.get(pattern)
    if width is None:
        return None
    if keyword == 'minLength' and node[keyword] <= width or keyword == 'maxLength' and node[keyword] >= width:
        covering = 'pattern'
        premise = f'Every full match has exactly {width} characters.'
        source = (exact_pattern,)
    elif (keyword in ('format', 'pattern') and pattern == '^' + UUID_PATTERN + '$' and
          node.get('format') == 'uuid' and validator.format_checker.checkers['uuid'][0] is uuid_string and
          UUID_PATTERN in uuid_string.__code__.co_consts):
        covering = 'pattern' if keyword == 'format' else 'format'
        premise = 'The UUID format and the schema pattern both full-match the same 36-character expression.'
        source = (exact_pattern, uuid_string)
    else:
        return None
    other = name.rsplit('/', 1)[0] + '/' + covering
    if (other, tuple(path)) not in pilot.located_errors(cut):
        return None
    return dict(covering_rule=other, checked_pattern=pattern, premise=premise,
                sources=[dict(path=str(Path(f.__code__.co_filename).relative_to(ROOT)),
                              line=f.__code__.co_firstlineno, sha256=sha(Path(f.__code__.co_filename))) for f in source])


def body_selector_implication(validator, bank, ref, node, keyword, path, cut):
    """Check the installed selector's sibling constant for the same field."""
    if not ref.endswith('#/$defs/BodyIssuanceCommitment') or len(path) != 2 or path[0] not in ('body', 'control'):
        return None
    if keyword not in ('type', 'minLength'):
        return None
    which, field = path
    root = validator._resolver.lookup(ref)
    shared, narrowed = root.contents['properties'][which]['allOf']
    selector = root.resolver.lookup(shared['$ref'])
    selector = selector.resolver.lookup(selector.contents['$ref'])
    assertion = selector.contents['properties'].get(field)
    constant = narrowed['properties'].get(field)
    if assertion is not node or constant is None or type(constant.get('const')) is not str:
        return None
    value = constant['const']
    if not (keyword == 'type' and assertion['type'] == 'string' or
            keyword == 'minLength' and len(value) >= assertion['minLength']):
        return None
    other = constant['x-pm-oracle-id'] + '/const'
    if (other, tuple(path)) not in pilot.located_errors(cut):
        return None
    return dict(covering_rule=other, constant=value, premise='The selector field must equal this string.',
                sources=[pilot.schema_documents(bank, uri) for uri in
                         (ref.split('#', 1)[0], assertion['x-pm-oracle-id'].split('#', 1)[0])])


def test_declared_rules(fixture, captured, entry, disable=None):
    """Replay previously authored single-rule edits against this exact schema."""
    resolved = captured['schema']['$ref']
    bank = next((item for item in (fixture.bank, fixture.goal_bank)
                 if closure._registry_digest(item.original.validator(resolved)) == captured['registry_sha256']), None)
    require(bank is not None, 'validator bank absent from fixture')
    plain = bank.original.validator(resolved)
    require(closure._registry_digest(plain) == captured['registry_sha256'], 'schema registry changed after capture')
    validator = closure.closure_validator(plain, captured['root'], bank.original)
    unresolved = len(clauses.UNRESOLVED)
    nodes = clauses.walk(validator)
    require(len(clauses.UNRESOLVED) == unresolved, 'schema contains an unresolved reference')
    inventory = defaultdict(list)
    for location, info in nodes.items():
        for keyword in clauses.clauses_of(info['node']):
            inventory[location + '/' + clauses.name_of(keyword)].append((keyword, info))
    old = dict(entry['clauses'])
    if disable == 'inventory':
        old.pop(next(iter(old)))
    collisions = {name: [word for word, _ in bindings] for name, bindings in inventory.items() if len(bindings) != 1}
    uri = resolved.split('#', 1)[0]
    if uri == original.R.SUCCESSOR:
        # This registered successor is attached by its own $id when the bank
        # is composed. Check the full definition against its selected file.
        path = 'Plans/goal_run_projection_reference_contracts/started.v1.schema.json'
        require(bank.lookup(uri).contents == json.loads((ROOT / path).read_bytes()),
                'installed projection successor differs from the selected source')
        source = dict(uri=uri, paths=[path], sha256=sha(ROOT / path), pointer='')
    else:
        source = pilot.schema_documents(bank, uri)
    result = dict(root=captured['root'], source=source,
                  missing_ids=sorted(old.keys() - inventory.keys()), added_ids=sorted(inventory.keys() - old.keys()),
                  literal_collisions=collisions, clauses={}, gaps={})
    if result['missing_ids'] or result['added_ids'] or collisions:
        return result

    controls = list(fixture.variants(captured))
    require(all(not list(plain.iter_errors(control)) for control in controls), 'a declared valid schema document refused')
    result['controls'] = controls
    for name, ((keyword, info),) in sorted(inventory.items()):
        expected = old[name]
        node = info['node']
        if expected['cls'] == 'SELECTOR_OR_NEGATED':
            if all(any(condition[0] == 'if' for condition in reached['ctx']) for reached in info['reach']):
                result['clauses'][name] = dict(cls='SELECTOR_OR_NEGATED', reason='if selects a branch')
            else:
                result['gaps'][name] = 'conditional selector premise differs'
            continue
        if expected['cls'] == 'VACUOUS' and keyword in ('minItems', 'minLength', 'minProperties') and node[keyword] == 0:
            result['clauses'][name] = dict(cls='VACUOUS', reason=f'{keyword}: 0 holds for every applicable value')
            continue
        if 'path' not in expected or 'edit' not in expected:
            result['gaps'][name] = f"no replayable exact example ({expected['cls']})"
            continue
        try:
            edit = ast.literal_eval(expected['edit'])
            recipe = 'historical edit'
        except (SyntaxError, ValueError):
            if name.endswith('/LogicalCheckpoint/properties/generations/maxProperties') and node[keyword] == 3:
                recipe = 'four entries copied from one accepted Generation'
            else:
                result['gaps'][name] = 'historical edit was truncated and needs an authored example'
                continue
        cut_id = common.schema_guard(node, keyword)
        for index, control in enumerate(controls):
            try:
                path = actual_path(control, expected['path'])
                if recipe == 'four entries copied from one accepted Generation':
                    entry = next(iter(clauses.get(control, path).values()))
                    edit = {f'grsg_{i:064x}': entry for i in range(4)}
                changed = clauses.apply(control, path, edit)
            except (KeyError, IndexError, TypeError, ValueError):
                continue
            original_errors = clauses.errors_of(validator, changed)
            if (name, tuple(path)) not in pilot.located_errors(original_errors):
                continue
            actual = list(plain.iter_errors(changed))
            require(closure._signature(original_errors) == closure._signature(actual),
                    f'{name}: annotated validator changed the exact refusal')
            cut = clauses.errors_of(validator, changed, set() if disable == 'clause' else {cut_id})
            restored = clauses.errors_of(validator, changed)
            require((name, tuple(path)) not in pilot.located_errors(cut) and
                    error_records(original_errors) == error_records(restored),
                    f'{name}: individual rule cut/restoration failed')
            implication = None
            if cut:
                implication = (regex_implication(plain, node, keyword, name, path, cut) or
                               body_selector_implication(validator, bank, resolved, node, keyword, path, cut))
            if cut and implication is None:
                result['gaps'][name] = dict(reason='needs a checked implication for the remaining rejection',
                                            path=path, edit=expected['edit'], control=index,
                                            after_disable=error_records(cut))
                continue
            result['clauses'][name] = dict(cls='COVERED_LATER' if cut else 'KILLED',
                                           path=path, edit=expected['edit'], control=index,
                                           before=error_records(actual), cut=error_records(cut),
                                           restored=error_records(restored), input_sha256=sweep.digest(changed))
            if recipe != 'historical edit':
                result['clauses'][name].update(recipe=recipe, invalid_value=edit)
            if implication:
                result['clauses'][name]['implication'] = implication
            result['gaps'].pop(name, None)
            break
        if name not in result['clauses'] and name not in result['gaps']:
            result['gaps'][name] = 'declared edit did not reach this literal rule on the accepted documents'
    return result


def run_row(row, declaration, inventory, output, disable, fragments=False):
    started = time.monotonic()
    name = row['row']
    sites = {(site['path'], site['line']) for site in row['predicate']['sites']}
    output.mkdir(parents=True)
    report = dict(row=name, status='NOT_COVERED', roots={}, calls={})
    results = {}
    collector = sweep.Collector()
    try:
        root_inventory = inventory.compare(row)
        report['historical'] = root_inventory
        if not declaration:
            require(any(root['matrix_error'] for root in root_inventory.values()),
                    'a constructible single-root row needs a declared fixture')
            report['reason'] = 'DG5 blocks this exact root inventory before any new row proof can qualify'
            return report
        pilot.SITES.clear()
        pilot.SITES.update({name: min(sites)})
        pilot.configure_tables()
        current_sites = {tuple(site) for site in declaration.get('current_sites', ())} or sites
        report['source_sites'] = dict(matrix=sorted(sites), observed_expected=sorted(current_sites))
        scratch = output / 'stores'
        scratch.mkdir()
        suite = original.Suite(scratch)
        for spec in declaration['fixtures']:
            fixture = Fixture(suite, spec['route'], spec['edition'])
            experiment = Example(fixture, name, current_sites, spec)
            try:
                captured = experiment.prove(collector, disable)
            finally:
                key = f"{spec['edition']}/{spec['route']}"
                report['calls'][key] = experiment.runs
            for document in captured:
                ident = document['root']
                if ident not in root_inventory:
                    report['roots'][ident] = dict(error='the original root is outside the matrix inventory')
                    continue
                if ident in report['roots']:
                    continue
                old = inventory.root(root_inventory[ident]['reference'], ident)
                result = test_declared_rules(fixture, document, old, disable)
                report['roots'][ident] = result
                if not any(result[field] for field in ('missing_ids', 'added_ids', 'literal_collisions', 'gaps')):
                    counts = Counter(item['cls'] for item in result['clauses'].values())
                    results[ident] = dict(rows=[name], families=[FAMILY], clauses=result['clauses'],
                                          registry_sha256=document['registry_sha256'], counts=dict(counts),
                                          verify=dict(passed=counts['KILLED'] + counts['COVERED_LATER'],
                                                      failed=0, unverifiable=0))
        report['missing_roots'] = sorted(root_inventory.keys() - report['roots'].keys())
        report['complete_roots'] = sorted(results)
        require(current_sites == sites, 'original validation call moved from the matrix source site')
        require(set(report['roots']) <= set(root_inventory), 'original root differs from the matrix inventory')
        require(not any(record['matrix_error'] for record in root_inventory.values()),
                'DG5 has conflicting inventory or verification records for this row')
        require(results and len(results) == len(report['roots']), 'exact rule coverage incomplete')
        require(fragments or not report['missing_roots'], 'exact root coverage incomplete')
        require(not collector.failures, f'unexpected complete-call failures: {collector.failures}')
        proof = pilot.run_gates(collector, output, [name])
        binding_path = proof / 'source-bindings.json'
        bindings = json.loads(binding_path.read_bytes())
        own_files = [Path(__file__), *(ROOT / path for path, _ in sites)]
        bindings['files'].update({str(path.relative_to(ROOT)): sha(path) for path in own_files})
        write(binding_path, bindings)
        write(output / 'clause-replay.json', {'roots': results})
        report['status'] = 'ROOT_FRAGMENTS' if report['missing_roots'] else 'READY_FOR_MATRIX'
        return report
    except (ValueError, KeyError) as error:
        report['reason'] = str(error)
        return report
    finally:
        report['seconds'] = round(time.monotonic() - started, 3)
        write(output / 'result.json', report)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--matrix', required=True, type=Path)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--case', type=Path, action='append', default=[])
    parser.add_argument('--inventory-blockers', action='store_true')
    parser.add_argument('--root-fragments', action='store_true')
    parser.add_argument('--merge', type=Path, action='append', default=[])
    parser.add_argument('--disable', choices=('row', 'clause', 'inventory'))
    args = parser.parse_args()
    require(all(sha(ROOT / path) == digest for path, digest in (pilot.TOOL_PINS | PATTERN_PINS).items()),
            'pinned checker or tool drift')
    baseline, rows, files = matrix_inputs(args.matrix)
    args.out.mkdir(parents=True)
    if args.merge:
        covered_roots = defaultdict(set)
        for directory in args.merge:
            result = json.loads((directory / 'result.json').read_bytes())
            require(result['status'] in ('READY_FOR_MATRIX', 'ROOT_FRAGMENTS'), f'{directory}: no exact proof')
            replay = json.loads((directory / 'clause-replay.json').read_bytes())['roots']
            require(sorted(replay) == result['complete_roots'], f'{directory}: coverage root list differs from the replay')
            covered_roots[result['row']].update(replay)
        for row, roots in covered_roots.items():
            expected = {item['root'] for item in rows[row]['schema_closure']['roots']}
            require(roots == expected, f'{row}: exact root coverage incomplete: {sorted(expected - roots)}')
        command = [sys.executable, '-B', pilot.matrix.__file__, *baseline['proof_dirs']]
        command += [str(directory / 'proof') for directory in args.merge]
        for shared in baseline['shared_proof_dirs']:
            command += ['--shared-proof', shared]
        for path in [*files, *(directory / 'clause-replay.json' for directory in args.merge)]:
            command += ['--closure', str(path)]
        path = args.out / 'matrix.json'
        command += ['--family', FAMILY, '--out', str(path)]
        subprocess.run(command, check=True, cwd=ROOT)
        after = {r['row']: r for r in json.loads(path.read_bytes())['families'][FAMILY]['matrix']}
        selected = set(covered_roots)
        require(rows.keys() == after.keys(), 'matrix row inventory changed')
        changed = {row for row in rows if rows[row]['status'] != after[row]['status']}
        require(changed == selected and all(after[row]['status'] == 'CLOSED' for row in selected),
                f'stock matrix result differs: {sorted(changed)}')
        write(args.out / 'accepted.json', {row: after[row] for row in sorted(selected)})
        return 0
    inventory = Inventory()
    if args.inventory_blockers:
        blocked = [r for r in single_rows(rows) if r['schema_closure']['errors']]
        for row in blocked:
            result = run_row(row, None, inventory, args.out / sweep.table_id([row['row']]), args.disable)
            print(row['row'], result['status'], result['reason'], flush=True)
    okay = True
    for path in args.case:
        declaration = json.loads(path.read_bytes())
        row = rows[declaration['row']]
        print('Checking', row['row'], flush=True)
        result = run_row(row, declaration, inventory, args.out / sweep.table_id([row['row']]),
                         args.disable, args.root_fragments)
        print(row['row'], result['status'], result.get('reason', ''), f"{result['seconds']} s", flush=True)
        okay &= result['status'] in ('READY_FOR_MATRIX', 'ROOT_FRAGMENTS')
    return 0 if okay else 1


if __name__ == '__main__':
    sys.exit(main())
