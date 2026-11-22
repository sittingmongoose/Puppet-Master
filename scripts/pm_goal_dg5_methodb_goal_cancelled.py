#!/usr/bin/env python3
"""Check the original Goal Cancelled callers and their exact schema examples."""
import argparse
import copy
import gzip
from itertools import count
import json
from pathlib import Path
import multiprocessing
import shutil
import subprocess
import sys
import time
from types import SimpleNamespace
from unittest.mock import patch
from uuid import UUID

from pm_goal_dg5_methodb_stage3 import (
    OwnerCheck, PREFIX, RootCapture, errors_list, proof_output,
    require, sha, test_rules, write,
)

HERE = Path(__file__).resolve().parent


def assignment_fixture(route, path, variant):
    from pm_goal_dg_ca_assignment import AssignedCancel, assigned_world
    from pm_goal_dg_ca_c4_cases import STEPS

    world = assigned_world(path)
    cancellation = AssignedCancel(world)
    cancellation.dispatch(cancellation.user_request())
    if route == 'assignment/reference':
        for step in ('capture_source', 'reserve_append_assignment'):
            getattr(cancellation, step)()
        if variant == 'publish':
            return world, cancellation.issue_assignment_audit
        cancellation.issue_assignment_audit()
        return world, lambda: world.assigner.resolve_audit(cancellation.audit_key)
    method = route.split('/')[1]
    action = 'append_original' if method == 'append_reserved' else method
    for step in STEPS:
        if step == action:
            break
        getattr(cancellation, step)()
    return world, getattr(cancellation, action)


def issue_action(world, scope, route):
    from pm_goal_dg_cb_c5_cases import cancel_request, plan_bound

    if route in ('issue/origin', 'issue/TEST_ONLY:host_stop_receipt'):
        return lambda: world.host_stop.manual(scope, 'stop')
    if route == 'issue/TEST_ONLY:plan_pending_attach':
        return lambda: world.plans.stage_pending_attach(scope, disposition='no_effect')
    if route == 'issue/TEST_ONLY:scheduler_callback_admission':
        _, run = plan_bound(world, scope)
        stop = world.host_stop.record(scope)
        return lambda: world.scheduler.admit_callback(scope, run, run_epoch=0, stop_epoch=stop['user_stop_epoch'])
    if route == 'issue/TEST_ONLY:workflow_activation_source':
        return lambda: world.workflows.attach(scope)
    if route == 'issue/TEST_ONLY:workflow_pending_operation':
        run = world.workflows.attach(scope)
        return lambda: world.workflows.begin_pending(scope, run)
    if route in ('issue/TEST_ONLY:sir_accepted_dispatch', 'issue/sir_command_outcome'):
        _, request = cancel_request(world, scope)
        if route == 'issue/sir_command_outcome':
            world.sir.accept(request)
            return lambda: world.sir.finish_no_effect(request['command_instance_id'])
        return lambda: world.sir.accept(request)
    raise ValueError(f'unknown issuance fixture {route!r}')


def migration_action(world, scope, route, *, enrolled, variant):
    from pm_goal_dg_cb_c5_cases import cancel_request, plan_bound
    from pm_goal_dg_cb_c6_cases import withdrawal_request
    import pm_goal_dg_cb_migration as migration

    coordinator = world.coordinator
    selection = migration.selector(scope)
    mid = selection['migration_id']
    if route in ('contracts/MigrationSelector', 'M/exclusion'):
        return lambda: coordinator.capture(selection)
    if route == 'contracts/OwnerMapping':
        return lambda: world.goal.enumerate_for_migration(scope)
    if route == 'contracts/MigrationRequest':
        coordinator.acquire_exclusion(scope, mid)
        return lambda: coordinator.capture(selection)
    if route == 'contracts/ManifestPart':
        request = coordinator.capture(selection)
        return lambda: coordinator.commit(request)
    if route.endswith(('/origin_schema', '/source_schema')):
        if variant == 'plan':
            world.plans.stage_pending_attach(scope, disposition='no_effect')
        elif variant == 'workflow':
            run_id = world.workflows.attach(scope)
            world.workflows.begin_pending(scope, run_id)
        elif variant == 'scheduler':
            plan_bound(world, scope, callbacks=1, settled=1)
        elif variant == 'sir':
            _, request = cancel_request(world, scope)
            world.sir.accept(request)
            world.sir.finish_no_effect(request['command_instance_id'])
        else:
            require(variant is None, f'unknown source fixture {variant!r}')
        if route.startswith('M/capture/'):
            coordinator.acquire_exclusion(scope, mid)
            return lambda: coordinator.capture(selection)
        request = coordinator.capture(selection)
        return lambda: coordinator.commit(request)
    if enrolled or route in ('contracts/MigrationResult', 'domain/cutoff'):
        coordinator.commit(coordinator.capture(selection))
    if route == 'contracts/MigrationResult':
        return lambda: coordinator.read_result(selection)
    if route == 'domain/cutoff':
        return world.binding.withdraw
    if route in ('contracts/MigrationWithdrawalRequest', 'contracts/MigrationWithdrawalResult'):
        request = withdrawal_request(world, scope, mid)
        return lambda: coordinator.withdraw(request)
    raise ValueError(f'unknown Goal Cancelled fixture {route!r}')


def cancel_fixture(route, path, *, enrolled=False, variant=None):
    from pm_goal_dg_ca_owners import Clock
    import pm_goal_dg_ca_owners as ca
    import pm_goal_dg_cb_migration as migration
    import pm_goal_dg_cb_owners as owners

    if route.startswith(('C4A/', 'assignment/')):
        world, action = assignment_fixture(route, path, variant)
    elif route == 'maintenance/source':
        if variant == 'update':
            world = migration.migration_world(path)
            action = world.maintenance.maintenance_window
        else:
            with patch.object(owners.MaintenanceOwner, 'birth', lambda self: None):
                world = migration.migration_world(path)
            action = world.maintenance.birth
    else:
        world = migration.migration_world(path)
        if route == 'registration/state':
            if variant == 'implementation':
                action = lambda: world.registration.add_implementation('plan_goal_birth_or_attach', 'old_adapter')
            else:
                action = world.registration.register_all
        else:
            scope = owners.legacy_goal(world, revisions=2)
            if route.startswith('issue/'):
                action = issue_action(world, scope, route)
            else:
                action = migration_action(world, scope, route, enrolled=enrolled, variant=variant)
    stamp = time.time_ns() // 1_000_000 + 100

    def now(clock):
        clock.last = max(clock.last + 1, stamp)
        return ca.S.format_ms(clock.last)

    def run():
        identifiers = count(1)
        with patch.object(Clock, 'now', now), patch.object(ca.uuid, 'uuid4',
                                                           side_effect=lambda: UUID(int=next(identifiers))):
            if route == 'C4A/append_reserved/reference':
                with patch.object(ca.S, 'time', SimpleNamespace(time_ns=lambda: stamp * 1_000_000)):
                    return action()
            return action()

    return world, run


class CancelCheck(OwnerCheck):
    def call(self, action, edit, *, require_exact=False, prefix_store=None):
        import pm_goal_dg5_boundaries as bridge
        import pm_goal_dg5_closure as closure
        import pm_goal_guard_tables as tables

        original = self.bank_class.validate
        record = dict(errors=[], cut=self.row in tables.CUT, observations=[])
        expected = self.code + '/schema/'
        edited = []
        matches = 0
        occurrence = self.declare.get('occurrence')
        repeated = self.declare.get('repeat_equal', False)
        reference = self.declare['reference']

        def observe(bank, ref, value, code='root'):
            nonlocal matches
            if code != self.code or ref != reference:
                return original(bank, ref, value, code)
            matches += 1
            if occurrence is not None and matches != occurrence:
                return original(bank, ref, value, code)
            frame = sys._getframe(1)
            site = [str(Path(frame.f_code.co_filename).relative_to(self.source)), frame.f_lineno]
            require(site == self.site, f'original cancellation caller changed: {site}')
            if prefix_store is not None:
                record['at_validator'] = bridge.manifest(bridge.file_state(prefix_store))
            if edit and (not edited or repeated):
                member = edit['member'][1]
                if member in value:
                    require(repeated and edited and value[member] == 'gc',
                            'the edited value was not passed to the repeated original check')
                else:
                    edited.append((value, member))
                    value[member] = 'gc'
            sink = []
            saved = closure.CAPTURE[0]
            closure.CAPTURE[0] = sink
            try:
                errors = bank.errors(ref, value)
            finally:
                closure.CAPTURE[0] = saved
            require(sink, 'the original schema validator was not captured')
            plain = sink[0]
            registry = closure._registry_digest(plain)
            key = (type(plain).__module__ + '.' + type(plain).__qualname__,
                   json.dumps(plain.schema, sort_keys=True), registry, type(bank).__qualname__)
            record['observations'].append(dict(root=closure.root_id(key), registry_sha256=registry,
                                                document=copy.deepcopy(value), errors=errors_list(errors)))
            decision = tables.predicates(tables.rows()[self.row])[self.row]({self.row: not errors}, None)
            require(decision == (self.row if errors else None), 'the coverage table disagrees with the original schema')
            self.collector.observe(self.row, not errors, tuple(site))
            if not errors and not edit:
                self.capture = plain, bank, copy.deepcopy(value)
                if self.probe_root:
                    raise RootCapture
            if errors and (not record['cut'] or self.disabled_check == 'row'):
                return original(bank, ref, value, code)
            return value

        try:
            with patch.object(self.bank_class, 'validate', observe):
                value = action()
            record['result_sha256'] = self.result_digest(value)
        except Exception as error:
            if type(error).__name__ not in bridge.REFUSAL_CLASSES:
                raise
            record['refusal'] = bridge.refusal_code(error)
            record['errors'] = [self.row if record['refusal'] == expected else bridge.row(record['refusal'])]
        finally:
            for value, member in edited:
                value.pop(member)
        self.runs.append(record)
        require(record['observations'], 'the original cancellation caller did not reach its schema')
        if not repeated:
            require(len(record['observations']) == 1, 'the original caller checked more than one document')
        else:
            require(all(value == record['observations'][0] for value in record['observations']),
                    'the repeated original caller validated a different document')
        if require_exact:
            require(record.get('refusal') == (expected if edit else None),
                    f"original refusal differs: expected {expected if edit else None!r}, got {record.get('refusal')!r}")
        return record


    def call_on_copy(self, world, action, edit, require_exact):
        if self.declare.get('variant') != 'publish':
            return super().call_on_copy(world, action, edit, require_exact)
        import pm_goal_dg5_boundaries as bridge

        copied = self.scratch.parent / ('transaction-' + str(len(self.runs)))
        shutil.copytree(self.scratch, copied)
        original = bridge.manifest(bridge.file_state(copied))
        relative = world.storage.root.relative_to(self.scratch)
        recv, send = multiprocessing.get_context('fork').Pipe(duplex=False)

        def replay():
            try:
                with patch.object(world.storage, 'root', copied / relative):
                    trial = self.call(action, edit, require_exact=require_exact, prefix_store=copied)
                    trial['after_call'] = bridge.manifest(bridge.file_state(copied))
                require(trial['at_validator'] != original, 'the original audit pack write did not precede validation')
                if trial['errors']:
                    require(trial['at_validator'] == trial['after_call'], 'the refusal wrote after the original pack write')
                send.send(trial)
            except Exception as error:
                send.send({'exception': str(error)})
            finally:
                send.close()

        process = multiprocessing.get_context('fork').Process(target=replay)
        process.start()
        send.close()
        try:
            trial = recv.recv()
        finally:
            recv.close()
            process.join()
        require(process.exitcode == 0 and 'exception' not in trial, trial)
        self.runs.append(trial)
        for observed in trial['observations']:
            self.collector.observe(self.row, not observed['errors'], tuple(self.site))
        return trial


def length_checks(plain, bank, root, examples, rules, gaps):
    import pm_goal_dg5_closure as closure
    import pm_goal_go_schema_closure as go
    from pm_goal_oracle_common import ecma_pattern

    validator = closure.closure_validator(plain, root, bank)
    nodes, _ = closure._clause_inventory(validator)
    for name, gap in list(gaps.items()):
        if not examples[name].get('length_pattern'):
            continue
        location, keyword = name.rsplit('/', 1)
        node = nodes[location]['node']
        pattern = ecma_pattern(node['pattern'])
        if pattern.pattern == r'^[0-9a-f]{64}\Z':
            require(node[keyword] == 64 and keyword in ('minLength', 'maxLength'),
                    'the digest length rule changed')
            explanation = 'The original ECMA pattern requires exactly 64 lowercase hexadecimal characters.'
        else:
            require(keyword == 'minLength' and node[keyword] == 2 and
                    pattern.pattern in (r'^(?:[0-9a-f]{2})+\Z', r'^([0-9a-f]{2})+\Z'),
                    'the byte-string length rule changed')
            explanation = 'The original ECMA pattern requires at least one complete lowercase hexadecimal byte.'
        pattern_rule = location + '/pattern'
        cut = go.errors_of(validator, gap['invalid'], {closure._guard_for_location(name)})
        pattern_cut = go.errors_of(validator, gap['invalid'], {closure._guard_for_location(pattern_rule)})
        restored = go.errors_of(validator, gap['invalid'])
        require(go.locations(cut) == {pattern_rule} and errors_list(cut) == gap['cut'] and
                go.locations(pattern_cut) == {name} and errors_list(restored) == gap['restored'],
                'the two separate cuts did not leave their exact remaining validation messages')
        rules[name] = dict(gap, cls='COVERED_LATER', implication=dict(source=pattern_rule,
                          path=examples[name]['path'], premise=explanation,
                          pattern_disabled=errors_list(pattern_cut)))
        gaps.pop(name)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--census', type=Path, required=True)
    parser.add_argument('--declaration', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--disable-check', choices=('inventory', 'rule', 'row'))
    args = parser.parse_args()
    start = time.monotonic()
    source = args.source.resolve()
    declare = json.loads(args.declaration.read_text())
    revision = subprocess.check_output(['git', '-C', source, 'rev-parse', 'HEAD'], text=True).strip()
    require(revision == declare['source'] and sha(args.census) == declare['census_sha256'],
            'original source or exact inventory changed')
    with gzip.open(args.census, 'rt') as stream:
        census = json.load(stream)
    row, ident = declare['row'], declare['root']
    scoped, = [entry for entry in census['rows'] if entry['row'] == row]
    require(census['family'] == declare['family'] == 'goal.cancelled' and
            ident in scoped['root_ids'] and declare['site'] in scoped['sites'],
            'the cancellation schema root or original caller changed')
    root = census['roots'][ident]
    require(not root.get('inventory_variants'), 'the exact root is ambiguous')
    sys.path.insert(0, str(source / 'scripts'))
    import pm_goal_dg5_closure as closure
    import pm_goal_guard_sweep as sweep
    import pm_goal_guard_tables as tables
    from pm_goal_test_owner_adapters import RootBank

    table = sweep.table_id([row])
    tables.PHASE_PREFIX = PREFIX
    tables._ROWS = {row: dict(table=table, phase=True)}
    name = PREFIX + table + '.py'
    table_path = source / 'scripts' / name
    expected = (HERE / name).read_bytes()
    if table_path.exists():
        require(table_path.read_bytes() == expected, 'source-local validation table changed')
    else:
        table_path.write_bytes(expected)
    args.out.mkdir(parents=True)
    fixture = args.out / 'fixture'
    fixture.mkdir()
    world, action = cancel_fixture(declare['route'], fixture, enrolled=declare.get('enrolled', False),
                                   variant=declare.get('variant'))
    closure.patch_validator_classes(force=True)
    collector = sweep.Collector()
    check = CancelCheck(row, declare['site'], RootBank, source, fixture, declare, collector, args.disable_check)
    report = dict(row=row, source=revision, census_sha256=declare['census_sha256'], root=ident,
                  status='NOT_COVERED', reason=None)
    try:
        plain, bank, accepted = check.prove(world, action)
        require({(obs['root'], obs['registry_sha256']) for run in check.runs for obs in run['observations']} ==
                {(ident, root['registry_sha256'])}, 'the original caller resolved a different schema root')
        clauses, gaps = test_rules(plain, bank, accepted, ident, root['clause_ids'], declare['examples'],
                                   args.disable_check, declare.get('accepted_branches'))
        length_checks(plain, bank, ident, declare['examples'], clauses, gaps)
        report.update(clauses=clauses, gaps=gaps, schema_resources=bank.pins)
        require(not gaps, f'{len(gaps)} rules still have a separate validation message')
        proof_output(source, args.out, declare, collector, clauses, ident, table_path)
        report['status'] = 'COVERED'
    except ValueError as error:
        report['reason'] = str(error)
    finally:
        report.update(seconds=round(time.monotonic()-start,3), owner_calls=check.runs)
        write(args.out/'result.json',report)
        print(json.dumps({key:report[key] for key in ('row','status','reason','seconds')}),flush=True)
    return int(report['status']!='COVERED')


if __name__=='__main__':
    sys.exit(main())
