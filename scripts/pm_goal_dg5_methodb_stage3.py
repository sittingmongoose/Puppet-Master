#!/usr/bin/env python3
"""Replay declared Goal update and certification schema examples on pinned owner sources.

Each row declaration records a census root, a complete owner call and one
invalid example per literal rule. The installed source tree supplies the
owner, registry, exact rule walker and gated table runner.
"""
import argparse
from collections import Counter
import copy
import gzip
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time
from unittest.mock import patch


HERE = Path(__file__).resolve().parent
PREFIX = 'pm_goal_dg5_methodb_pilot_phase_'


def require(condition, detail):
    if not condition:
        raise ValueError(detail)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, document):
    path.write_text(json.dumps(document, indent=2, sort_keys=True) + '\n')


def errors_list(errors):
    return [[list(error.absolute_path), list(error.absolute_schema_path), error.validator,
             error.message, errors_list(error.context)] for error in errors]


def edit_example(go, document, path, change):
    go.get(document, path)
    edit = tuple(change['member']) if 'member' in change else change['value']
    return go.apply(document, path, edit)


def update_fixture(route, path):
    import pm_goal_dg_u_oracles as oracle

    w = oracle.world(path)
    goal = oracle.O.birth_goal(w)
    _, admission = oracle.run_direct(w, goal)
    progress = oracle.progress(w, goal, oracle.op_of(admission))
    request = progress['body_commit']['receipt_request']
    actor = goal['user']
    permission = goal['user_permission']
    inspect = w.inspector
    if route == 'inspect':
        event_request = inspect.request_for(goal['scope'], progress['publication']['event_id'])
        return w, lambda: inspect.inspect(event_request, actor, permission)
    if route == 'receipt':
        return w, lambda: w.body.read_receipt(request, actor, permission)
    if route == 'oracle_receipt':
        return w, lambda: w.body.read_receipt_private(request, 'oracle')
    raise ValueError(route)


def certified_fixture(route, path):
    import pm_goal_dg_cf2_oracles as oracle

    run = oracle.Run(path)
    w, ctx = run.w, run.ctx
    if route == 'guard':
        request = oracle.W.guard_request(w, ctx['scope'], ctx['op'], 'original_certification',
                                         'TEST_ONLY:guard-request:method-b')
        return w, lambda: w.guard.read_guard(request)
    if route == 'f5a':
        run.until('arm')
        intent, control = run.obs['intent'], run.obs['control_armed']
        preappend = w.coordinator.preappend_source(ctx)
        return w, lambda: w.coordinator.f5a(ctx, intent, control, preappend)
    if route == 'recover':
        run.until('arm')
        request = oracle.W.recovery_request(w, ctx, run.stored('intent')['record'])
        return w, lambda: w.coordinator.recover_original(request)
    raise ValueError(route)


class OwnerCheck:
    def __init__(self, row, site, bank_class, source, scratch, declare, collector, disabled_check):
        self.row = row
        self.code = row.removeprefix('dg5/').removesuffix('/schema')
        self.site = site
        self.bank_class = bank_class
        self.source = source
        self.scratch = scratch
        self.declare = declare
        self.collector = collector
        self.disabled_check = disabled_check
        self.runs = []
        self.capture = None

    def call(self, action, edit, *, require_exact=False):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_dg5_closure as closure
        import pm_goal_guard_tables as tables

        original = self.bank_class.validate
        errors_method = self.bank_class.errors
        record = dict(errors=[], cut=self.row in tables.CUT, observations=[])
        changed = []
        expected = self.code + '/schema/'  # extra member is rejected at the enclosing object

        def observe(bank, *args):
            if args[-1] != self.code:
                return original(bank, *args)
            frame = sys._getframe(1)
            site = [str(Path(frame.f_code.co_filename).relative_to(self.source)), frame.f_lineno]
            require(site == self.site, f'owner call source changed: {site}')
            document = args[-2]
            if edit is not None:
                require(isinstance(document, dict), 'complete-call extra-member example needs an object')
                member = edit['member'][1]
                require(member not in document, 'test document already has the extra member')
                changed.append((document, member))
                document[member] = 'gc'
            validator_args = args[:-1]
            sink = []
            saved = closure.CAPTURE[0]
            closure.CAPTURE[0] = sink
            try:
                errors = errors_method(bank, *validator_args)
            finally:
                closure.CAPTURE[0] = saved
            require(sink, 'original schema validator was not captured')
            plain = sink[0]
            actual_bank = getattr(bank, 'scoped', bank)
            registry = closure._registry_digest(plain)
            key = (type(plain).__module__ + '.' + type(plain).__qualname__,
                   json.dumps(plain.schema, sort_keys=True), registry, type(actual_bank).__qualname__)
            ident = closure.root_id(key)
            record['observations'].append(dict(root=ident, registry_sha256=registry,
                                                document=copy.deepcopy(document), errors=errors_list(errors)))
            predicate = tables.predicates(tables.rows()[self.row])[self.row]
            decision = predicate({self.row: not errors}, None)
            require(decision == (self.row if errors else None), 'row table disagrees with the owner validator')
            self.collector.observe(self.row, not errors, tuple(site))
            if not errors and edit is None:
                self.capture = plain, actual_bank, copy.deepcopy(document)
            if decision and (not record['cut'] or self.disabled_check == 'row'):
                return original(bank, *validator_args, args[-1])
            return document

        try:
            with patch.object(self.bank_class, 'validate', observe):
                action()
        except Exception as error:
            if type(error).__name__ not in bridge.REFUSAL_CLASSES:
                raise
            record['refusal'] = bridge.refusal_code(error)
            record['errors'] = [self.row if record['refusal'] == expected else bridge.row(record['refusal'])]
        finally:
            for document, member in changed:
                document.pop(member)
        self.runs.append(record)
        require(len(record['observations']) == 1, 'target must run exactly once in the complete call')
        if require_exact:
            require(record.get('refusal') == (expected if edit else None),
                    f"expected original validation message {expected if edit else None!r}, "
                    f"got {record.get('refusal')!r}")
        return record

    def prove(self, action):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_guard_tables as tables

        initial = bridge.manifest(bridge.file_state(self.scratch))
        for change in (None, {'member': ['add', 'methodb_extra']}, None):
            value = dict(store=initial, route=self.declare['route'], edit=change, site=self.site)

            def evaluate(document):
                require(document == value, 'complete-call input changed')
                require(not tables.CUT - {self.row}, 'multiple validation rows disabled')
                require(bridge.manifest(bridge.file_state(self.scratch)) == initial, 'sealed store changed')
                result = self.call(action, change, require_exact=not self.collector.replaying)
                require(bridge.manifest(bridge.file_state(self.scratch)) == initial, 'passive call changed the store')
                return result

            self.collector.invoke('Method B/' + self.declare['route'], evaluate, value, change is None,
                                  target=self.row if change else None, family=self.declare['family'])
            record = self.collector.ledger[-1]
            require(not self.collector.failures, self.collector.failures)
            require(record['outcome'] == ('exact_expected' if change else 'control'), record)
            if change:
                require(record['kill'] == 'KILLED', f'complete call has another refusal: {self.runs[-2]}')
                before, cut, restored = self.runs[-3:]
                require(before == restored and before['observations'] == cut['observations'] and not cut['errors'],
                        'the complete call did not restore the same document and validation message')
        require(self.runs[0] == self.runs[-1], 'the restored accepted control changed')
        return self.capture


def test_rules(plain, bank, document, ident, exact_ids, examples, disabled_check):
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go

    validator = closure.closure_validator(plain, ident, bank)
    nodes, installed = closure._clause_inventory(validator)
    if disabled_check == 'inventory':
        examples = dict(list(examples.items())[1:])
    inventory = {location + '/' + closure.clause_name(info['node'], keyword): keyword
                 for location, info in nodes.items() for keyword in go.clauses_of(info['node'])}
    require(installed == exact_ids, 'installed assertion inventory differs from census')
    require(set(installed) == set(examples), 'declared test examples differ from exact inventory')
    require(not list(plain.iter_errors(document)) and not go.errors_of(validator, document),
            'original or instrumented validator refused the accepted document')
    result, gaps = {}, {}
    for name in installed:
        example = examples[name]
        path = example['path']
        control = document
        if 'control' in example:
            control = edit_example(go, document, example['control']['path'], example['control'])
        require(not list(plain.iter_errors(control)), f'{name}: branch control refused')
        invalid = edit_example(go, control, path, example)
        before = go.errors_of(validator, invalid)
        actual = list(plain.iter_errors(invalid))
        require(errors_list(before) == errors_list(actual), f'{name}: original and instrumented errors differ')
        guard = closure._guard_for_location(name)
        cut = go.errors_of(validator, invalid, () if disabled_check == 'rule' else {guard})
        restore = go.errors_of(validator, invalid)
        keyword = inventory[name]
        failure = (keyword, tuple(path), name)
        from pm_goal_oracle_common import _SCHEMA_LOCATIONS

        def locations(errors):
            return {(error.validator, tuple(error.absolute_path),
                     _SCHEMA_LOCATIONS.get(getattr(error, 'oracle_guard', None)))
                    for error in each_error(errors)}

        require(failure in locations(before), f'{name}: example did not produce expected validation message')
        require(failure not in locations(cut) and errors_list(before) == errors_list(restore),
                f'{name}: disabling and restoring that one rule failed')
        record = dict(cls='KILLED', control=control, invalid=invalid, before=errors_list(actual),
                      cut=errors_list(cut), restored=errors_list(restore))
        if cut:
            gaps[name] = record
        else:
            result[name] = record
    return result, gaps


def each_error(errors):
    for error in errors:
        yield error
        yield from each_error(error.context)


def proof_output(source, output, declare, collector, clauses, root, table_path):
    import pm_goal_dg5_closure as closure
    import pm_goal_guard_sweep as sweep

    proof = output / 'proof'
    tables_dir = proof / 'tables'
    tables_dir.mkdir(parents=True)
    row, family = declare['row'], declare['family']
    table = sweep.table_id([row])
    verified = sweep.prove_table(collector, table, [row], sweep.table_records(collector), tables_dir,
                                 module_name=table_path.stem,
                                 path='scripts/' + table_path.name)
    require(verified['status'] == 'PASS' and verified['proved'] == [row], verified)
    write(tables_dir / 'summary.json', [verified])
    write(tables_dir / 'rows.json', [dict(guard=row, table=table, status='PASS', table_status='PASS')])
    write(proof / 'family-rows.json', {family: [row]})
    write(proof / 'collection.json', dict(calls=collector.calls, failures=[],
                                         rows={row: {'sites': [declare['site']]}}))
    bound = [table_path, source / declare['site'][0]]
    bound += sorted(source.glob('scripts/pm_goal_dg5_*.py'))
    bound += [source / 'scripts' / name for name in (
        'pm_goal_guard_sweep.py', 'pm_goal_guard_tables.py', 'pm_goal_go_schema_closure.py',
        'pm_goal_oracle_common.py', 'pm_guard_isolation.py')]
    write(proof / 'source-bindings.json', {'files': {str(path.relative_to(source)): sha(path) for path in bound}})
    for name, value in (('ledger', collector.ledger),
                        ('signatures', [sorted(sig) for sig in collector.signature_list])):
        with gzip.open(proof / (name + '.json.gz'), 'wt') as stream:
            json.dump(value, stream, sort_keys=True)
    entry = dict(rows=[row], families=[family], counts=dict(Counter(x['cls'] for x in clauses.values())),
                 clauses=clauses, clause_inventory=closure._clause_inventory_pin(sorted(clauses)),
                 verify=dict(passed=len(clauses), failed=0, unverifiable=0))
    write(output / 'closure.json', {'roots': {root: entry}})
    inventory = dict(mode='assertion-inventory', family=family, collection_failures=[],
                     roots={root: dict(rows=[row], families=[family], clause_ids=sorted(clauses),
                                       clause_inventory=entry['clause_inventory'])})
    write(output / 'inventory.json', inventory)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--census', type=Path, required=True)
    parser.add_argument('--declaration', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable-check', choices=('inventory', 'rule', 'row'))
    args = parser.parse_args()
    started = time.monotonic()
    source = args.source.resolve()
    declare = json.loads(args.declaration.read_text())
    revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    require(revision == declare['source'], f'wrong original source revision: {revision}')
    require(sha(args.census) == declare['census_sha256'], 'census bytes changed')
    with gzip.open(args.census, 'rt') as stream:
        census = json.load(stream)
    row, ident = declare['row'], declare['root']
    census_row, = [item for item in census['rows'] if item['row'] == row]
    root = census['roots'][ident]
    require(census_row['root_ids'] == [ident] and not root.get('inventory_variants'), 'ambiguous root inventory')
    require(declare['family'] == census['family'] and declare['site'] in census_row['sites'], 'census owner site changed')
    sys.path.insert(0, str(source / 'scripts'))
    import pm_goal_dg5_closure as closure
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables
    from pm_goal_test_owner_adapters import RootBank

    table = sweep.table_id([row])
    tables.PHASE_PREFIX = PREFIX
    tables._ROWS = {row: dict(table=table, phase=True)}
    table_name = PREFIX + table + '.py'
    table_path = source / 'scripts' / table_name
    table_bytes = (HERE / table_name).read_bytes()
    if table_path.exists():
        require(table_path.read_bytes() == table_bytes, 'source-local test table changed')
    else:
        table_path.write_bytes(table_bytes)
    args.out.mkdir(parents=True)
    fixture = args.out / 'fixture'
    fixture.mkdir()
    if declare['family'] == 'goal.updated':
        _, action = update_fixture(declare['route'], fixture)
        bank = RootBank
    else:
        from pm_goal_dg_cf2_world import RealmBank
        _, action = certified_fixture(declare['route'], fixture)
        bank = RealmBank

    closure.patch_validator_classes(force=True)
    collector = sweep.Collector()
    check = OwnerCheck(row, declare['site'], bank, source, fixture, declare, collector, args.disable_check)
    report = dict(row=row, source=revision, census_sha256=declare['census_sha256'], root=ident,
                  status='NOT_COVERED', reason=None)
    try:
        plain, actual_bank, accepted = check.prove(action)
        require({(obs['root'], obs['registry_sha256']) for run in check.runs for obs in run['observations']}
                == {(ident, root['registry_sha256'])}, 'root or registry differs from the census')
        clauses, gaps = test_rules(plain, actual_bank, accepted, ident, root['clause_ids'],
                                   declare['examples'], args.disable_check)
        report.update(clauses=clauses, gaps=gaps)
        require(not gaps, f'{len(gaps)} rules still have another validation message')
        proof_output(source, args.out, declare, collector, clauses, ident, table_path)
        report['status'] = 'COVERED'
    except ValueError as error:
        report['reason'] = str(error)
    finally:
        report.update(seconds=round(time.monotonic() - started, 3), owner_calls=check.runs)
        write(args.out / 'result.json', report)
        print(json.dumps({k: report[k] for k in ('row', 'status', 'reason', 'seconds')}), flush=True)
    return int(report['status'] != 'COVERED')


if __name__ == '__main__':
    sys.exit(main())
