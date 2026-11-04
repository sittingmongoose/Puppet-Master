#!/usr/bin/env python3
"""Prove DG6B negative isolation by removing one logical guard in memory.

No production file is patched. Repeated checks of one invariant (for example
original custody in append and Persona semantics) form one guard, and every
source location is exported. Each negative must flip only for its own guard;
all other negatives must retain their exact original refusal.
"""
import argparse
import ast
import copy
import hashlib
import json
from functools import cache
from jsonschema import Draft202012Validator
from pathlib import Path

from blake3 import blake3
from pm_event_index_binding import binding_bytes

ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / 'scripts/pm-dg6b-event-contracts.py'


@cache
def checked_schema(serialized):
    # Memoize only the actual upstream pure schema check, never instance
    # validation, reference lookup, or a mutant outcome.
    return Draft202012Validator.check_schema(json.loads(serialized))


class SchemaCheckCache:
    def __new__(cls, *args, **kwargs):
        return Draft202012Validator(*args, **kwargs)

    @staticmethod
    def check_schema(schema):
        return checked_schema(json.dumps(schema, sort_keys=True))


def reason(node):
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'ValueError':
        arg = node.args[0]
        if isinstance(arg, ast.Constant):
            return arg.value
        if isinstance(arg, ast.BinOp) and isinstance(arg.left, ast.Constant):
            return arg.left.value.rstrip(': ')
    return None


def guard_name(error):
    # Both refusal paths enforce the same sole current-writer policy. Keep
    # both original production predicates intact and remove the invariant's
    # repeated enforcement together, as for other repeated guard sites.
    return 'current_writer_policy' if error in ('replay_only_not_appendable', 'writer_replay_policy') else error


def guard_inventory(source):
    guards = {}
    for function in ast.parse(source).body:
        if not isinstance(function, ast.FunctionDef):
            continue
        for node in ast.walk(function):
            if isinstance(node, ast.Raise) and reason(node.exc):
                guards.setdefault(guard_name(reason(node.exc)), []).append({'function': function.name, 'line': node.lineno})
    guards['failure_oracle'] = [{'function': 'expect_failure', 'line': next(n.lineno for f in ast.parse(source).body if isinstance(f, ast.FunctionDef) and f.name == 'expect_failure' for n in ast.walk(f) if isinstance(n, ast.Raise))}]
    guards['failure_error_reason'] = [{'function': 'expect_failure', 'line': next(n.lineno for f in ast.parse(source).body if isinstance(f, ast.FunctionDef) and f.name == 'expect_failure' for n in ast.walk(f) if isinstance(n, ast.Assert))}]
    return guards


def module_for(source, disabled=None):
    class Remove(ast.NodeTransformer):
        function = None

        def visit_FunctionDef(self, node):
            previous, self.function = self.function, node.name
            result = self.generic_visit(node)
            self.function = previous
            return result

        def visit_Assert(self, node):
            if self.function == 'expect_failure' and disabled == 'failure_error_reason':
                return ast.copy_location(ast.Pass(), node)
            return node

        def visit_If(self, node):
            # Do not remove the block containing a whole subtree of rules.
            if len(node.body) == 1 and isinstance(node.body[0], ast.Raise) and guard_name(reason(node.body[0].exc)) == disabled:
                node.test = ast.Constant(False)
                return node
            return self.generic_visit(node)

        def visit_Raise(self, node):
            # Eager resolution's exception barrier and exhaustive dispatch.
            if (guard_name(reason(node.exc)) == disabled
                    or (self.function == 'expect_failure' and disabled == 'failure_oracle'
                        and isinstance(node.exc, ast.Call) and isinstance(node.exc.func, ast.Name)
                        and node.exc.func.id == 'AssertionError')):
                return ast.copy_location(ast.Pass(), node)
            return node

    tree = ast.parse(source)
    if disabled:
        tree = Remove().visit(tree)
    ast.fix_missing_locations(tree)
    namespace = {'__file__': str(CHECKER), '__name__': 'dg6b_guard_mutant'}
    exec(compile(tree, str(CHECKER), 'exec'), namespace)
    namespace['Draft202012Validator'] = SchemaCheckCache
    return namespace


def outcome(call, namespace, schema):
    try:
        call(namespace, schema)
    except Exception as exc:
        return type(exc).__name__ + ': ' + str(exc)
    return 'accepted'


def build_probes(stock, schema, fixtures):
    probes = []

    def add(family, label, guard, call):
        probes.append({'id': family + ':' + label, 'family': family, 'guard': guard_name(guard), 'error': guard, 'call': call})

    for row in fixtures['families']:
        name = row['event_type']
        slug = name.replace('.', '_')
        payload = row['valid']
        server = stock['source_scope'](row['source'])['server_id']
        eid = row['expected_event_id']
        for index, bad in enumerate(row['invalid']):
            case = {'stage': 'payload_schema', 'payload': bad}
            add(name, 'payload_schema/' + str(index), 'payload_schema',
                lambda m, s, c=case, n=name: m['stage_contract'](n, c, s))
        for kind in ('append_invalid', 'operation_cases', 'history_cases', 'retry_cases', 'semantic_invalid', 'stage_cases'):
            for c in row.get(kind, []):
                if 'expected_error' not in c:
                    continue
                guard = c['expected_error']
                if kind == 'append_invalid':
                    fn = lambda m, s, c=c, n=name: m['append_contract'](n, c, s)
                elif kind == 'operation_cases':
                    fn = lambda m, s, c=c, n=name: m['operation_contract'](n, c['value'], c['resolved'], c['logical'], s)
                elif kind == 'history_cases':
                    fn = lambda m, s, c=c, n=name: m['history_contract'](n, c, s)
                elif kind == 'retry_cases':
                    fn = lambda m, s, c=c, n=name: m['append_contract'](n, c['candidate'], s, original=c['original'])
                elif kind == 'semantic_invalid':
                    fn = lambda m, s, c=c, n=name: m['persona_semantic'](n, c['payload'], c['scope_key'], c['source'])
                else:
                    fn = lambda m, s, c=c, n=name: m['stage_contract'](n, c, s)
                add(name, kind + '/' + c.get('label', c.get('case_id')), guard, fn)

        if name.startswith('persona.') and name != 'persona.exported':
            bad_source = copy.deepcopy(row['source'])
            bad_source['definition_writer_current'] = False
            add(name, 'extra/definition_writer', 'definition_writer',
                lambda m, s, n=name, p=payload, sk=row['scope_key'], src=bad_source: m['persona_semantic'](n, p, sk, src))
        if name == 'persona.created':
            variant = next(v for v in row['valid_variants'] if v['payload']['command_id'] == 'cmd.persona.duplicate')
            bad = copy.deepcopy(variant)
            bad['payload']['source_id'] = bad['payload']['persona_id']
            bad['source']['frozen_payload']['source_id'] = bad['payload']['source_id']
            bad['source']['request']['source_id'] = bad['payload']['source_id']
            add(name, 'extra/creation_source', 'creation_source',
                lambda m, s, n=name, b=bad: m['persona_semantic'](n, b['payload'], m['persona_scope_key'](b['payload']), b['source']))

        if name == 'persona.selected':
            from referencing import Registry, Resource
            shared = stock['load_plan']('Plans/shared_integration_runtime.schema.json')
            resource = Resource.from_contents(shared)
            resource_registry = Registry().with_resources([(shared['$id'], resource),
                ('https://puppetmaster.local/Plans/shared_integration_runtime.schema.json', resource)])
            for alias in ('requested_persona_id', 'effective_persona_id'):
                bad = {**row['source']['result'], alias: 'forbidden'}
                add(name, 'selected_result/' + alias, 'selected_result_schema',
                    lambda m, s, b=bad, sh=shared, rr=resource_registry: m['selected_result_contract'](b, sh, rr))
                bad = {**row['source']['resolution'], alias: 'forbidden'}
                add(name, 'resolution/' + alias, 'resolution_schema',
                    lambda m, s, b=bad: m['resolution_contract'](b, s))
            for key in ('requested_persona', 'effective_persona', 'runtime_snapshot_ref', 'runtime_snapshot_sha256'):
                bad = {k: v for k, v in row['source']['resolution'].items() if k != key}
                add(name, 'resolution/missing/' + key, 'resolution_schema',
                    lambda m, s, b=bad: m['resolution_contract'](b, s))

        # All generated negatives in the production checker, including LF,
        # policy/key schema controls, caller retry fields and byte stages.
        for case in row['append_valid']:
            op = stock['make_operation'](name, case)
            for field in ('idempotency_key', 'actor_ref'):
                bad = copy.deepcopy(op)
                bad[field] += '\n'
                add(name, 'operation_schema/' + case['label'] + '/LF/' + field, 'operation_schema',
                    lambda m, s, b=bad, n=name: m['stage_contract'](n, {'stage': 'operation_schema', 'value': b}, s))
            for field, value, label in (
                ('replay_policy', 'projector_replay_only', 'replay_only'),
                ('idempotency_key', name + ':' + '0' * 64 if stock['source_scope'](case['source'])['scope_kind'] == 'application'
                 else 'application@1:11:22', 'wrong_scope_key')):
                bad = {**op, field: value}
                add(name, 'operation_schema/' + case['label'] + '/' + label, 'operation_schema',
                    lambda m, s, b=bad, n=name: m['stage_contract'](n, {'stage': 'operation_schema', 'value': b}, s))
            retry = copy.deepcopy(case)
            retry['event_record'].update(sequence_id=999, observed_at_utc='2026-11-04T13:00:00Z', persisted_at_utc='2026-11-04T14:00:00Z')
            retry['event_record']['correlation_id'] += '-changed'
            add(name, 'caller_semantic_change/' + case['label'], 'idempotency_conflict',
                lambda m, s, c=retry, o=case, n=name: m['append_contract'](n, c, s, original=o))
        if not name.startswith('persona.'):
            add(name, 'semantic/identity', 'identity',
                lambda m, s, n=name, p=payload, sv=server: m['semantic'](n, p, 'application', 'other', server_id=sv))
            changed = {**payload, 'ts': '2026-11-04T12:01:00Z'}
            add(name, 'semantic/original_payload', 'original_payload_conflict',
                lambda m, s, n=name, p=changed, o=payload, e=eid, sv=server: m['semantic'](n, p, 'application', e, original=o, server_id=sv))
            # Application-only scope gets a coherent Project identity. Plugin
            # identity substitution deliberately retains the old identity.
            target_eid = stock['identity'](name, payload, 'project:other')[0] if name.startswith('auth.') else eid
            add(name, 'semantic/scope', 'scope' if name.startswith('auth.') else 'identity',
                lambda m, s, n=name, p=payload, e=target_eid: m['semantic'](n, p, 'project:other', e))
            if name == 'auth.github.token.polling':
                bad = {**payload, 'poll_interval_seconds': payload['previous_interval_seconds']}
                add(name, 'semantic/cadence', 'cadence',
                    lambda m, s, n=name, p=bad, e=eid, sv=server: m['semantic'](n, p, 'application', e, server_id=sv))
            if name == 'plugin.hook.blocked':
                for hook in ('post_tool_invoke', 'post_attempt_complete'):
                    bad = {**payload, 'hook_name': hook}
                    add(name, 'semantic/' + hook, 'observation_only_hook',
                        lambda m, s, n=name, p=bad, e=eid, sv=server: m['semantic'](n, p, 'application', e, server_id=sv))
        for size in (16383, 16384, 16385):
            body = b'x' * size
            resolved = {'ref': 'ref:payload/boundary', 'blake3_id': blake3(body).hexdigest(), 'byte_size': size,
                        'media_type': 'application/msgpack', 'bytes_hex': body.hex(), 'durable': True, 'access_current': True}
            if size > 16384:
                add(name, 'transport/16k_plus_one', 'inline_body_too_large',
                    lambda m, s, b=body: m['transport'](b, None, None))
            for field, value, error in (
                ('durable', False, 'payload_ref_unavailable'), ('access_current', False, 'payload_ref_unavailable'),
                ('byte_size', size + 1, 'payload_ref_integrity'), ('media_type', 'text/plain', 'payload_ref_integrity'),
                ('bytes_hex', '00', 'payload_ref_integrity'), ('blake3_id', '0' * 64, 'payload_ref_integrity')):
                add(name, 'transport/' + str(size) + '/' + field, error,
                    lambda m, s, b=body, r={**resolved, field: value}, ref=resolved['ref']: m['transport'](b, ref, r))

        # Guards with no old fixture: independently valid controls mutated in
        # exactly one input at the actual full contract boundary.
        base = row['append_valid'][0]
        bad = copy.deepcopy(base)
        bad['event_record']['schema_version'] = '9.0.0'
        add(name, 'extra/event_record_schema', 'event_record_schema',
            lambda m, s, c=bad, n=name: m['append_contract'](n, c, s))
        bad = copy.deepcopy(base)
        bad['event_record']['payload'] = {}
        add(name, 'extra/payload_transport_join', 'payload_transport_join',
            lambda m, s, c=bad, n=name: m['append_contract'](n, c, s))
        original = copy.deepcopy(base)
        original['event_record']['event_id'] += '-other'
        add(name, 'extra/retry_identity', 'retry_identity',
            lambda m, s, c=base, o=original, n=name: m['append_contract'](n, c, s, original=o))
        dangling = copy.deepcopy(schema)
        dangling['$defs'][slug]['allOf'] = [{'if': {'properties': {'operation_id': {'const': 'uncovered-operation'}}},
                                          'then': {'$ref': '#/$defs/REVIEW_MISSING'}}]
        add(name, 'schema_graph/dormant_ref', 'unresolved_schema_ref',
            lambda m, s, d=dangling: m['resolve_schema_graph'](d))
        for keyword in ('$ref', '$dynamicRef'):
            dangling = copy.deepcopy(schema)
            dangling['$defs']['unused_' + slug] = {keyword: '#/$defs/REVIEW_MISSING'}
            add(name, 'schema_graph/unused/' + keyword, 'unresolved_schema_ref',
                lambda m, s, d=dangling: m['resolve_schema_graph'](d))
    # Preparation guards are tested on each exact single-family projection.
    # Each projection is itself accepted before its one mutation.
    grade = stock['load_plan']('reports/event-authority-20261104/DG6B.self-grade.json')
    registry = stock['load_plan']('Plans/event_family_registry.json')
    values = stock['load_plan']('Plans/storage_value_registry.json')
    for row in fixtures['families']:
        n = row['event_type']
        g = {'rows': [next(r for r in grade['rows'] if r['event_type'] == n)]}
        v = {'families': [next(r for r in values['families'] if r['family_id'] == n.replace('.', '_') + '_operation')]}
        f = {'families': [row]}
        stock['preparation_contract']({n}, f, g, registry, v, schema)
        for guard in ('fixture_family_coverage', 'grade_family_coverage', 'unadmitted_disposition',
                      'prepared_membership', 'retention_pending', 'operation_schema_binding'):
            ff, gg, rr, vv = f, g, registry, v
            if guard == 'fixture_family_coverage': ff = {'families': [row, row]}
            if guard == 'grade_family_coverage': gg = {'rows': []}
            if guard == 'unadmitted_disposition': gg = {'rows': [{**g['rows'][0], 'disposition': 'CURRENT_WRITER'}]}
            if guard == 'prepared_membership': rr = {'families': registry['families'] + [{'event_type': n}]}
            if guard == 'retention_pending': vv = {'families': [{**v['families'][0], 'retention_policy_ref': 'UNAUTHORIZED_POLICY'}]}
            if guard == 'operation_schema_binding': vv = {'families': [{**v['families'][0], 'value_schema': {}}]}
            add(n, 'preparation/' + guard, guard,
                lambda m, s, n=n, ff=ff, gg=gg, rr=rr, vv=vv: m['preparation_contract']({n}, ff, gg, rr, vv, s))
    add('shared', 'original_server_required', 'original_server_required',
        lambda m, s: m['original_server_required'](None))
    add('shared', 'unknown_oracle_stage', 'unknown_oracle_stage',
        lambda m, s: m['stage_contract']('', {'stage': 'unknown'}, s))
    add('shared', 'success_cannot_prove_failure', 'failure_oracle',
        lambda m, s: m['expect_failure'](lambda: None, 'wanted', 'shared', 'success'))
    def wrong_reason(m, s):
        def reject():
            raise ValueError('different')
        m['expect_failure'](reject, 'wanted', 'shared', 'reason')
    add('shared', 'wrong_reason_cannot_prove_failure', 'failure_error_reason', wrong_reason)
    return probes


def run():
    paths = [CHECKER, Path(__file__).resolve(), ROOT / 'Plans/dg6b_event_contract_fixtures.json',
             ROOT / 'Plans/dg6b_event_contracts.schema.json',
             ROOT / 'reports/event-authority-20261104/DG6B.self-grade.json']
    inputs = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
    source = CHECKER.read_text()
    inventory = guard_inventory(source)
    stock = module_for(source)
    schema = json.loads((ROOT / 'Plans/dg6b_event_contracts.schema.json').read_text())
    fixtures = json.loads((ROOT / 'Plans/dg6b_event_contract_fixtures.json').read_text())
    probes = build_probes(stock, schema, fixtures)
    failures = []
    for probe in probes:
        actual = outcome(probe['call'], stock, schema)
        probe['stock'] = actual
        expected = 'ValueError: ' + probe['error']
        if not ((probe['guard'] in ('failure_oracle', 'failure_error_reason') and actual.startswith('AssertionError: ')) or actual == expected or (probe['guard'] == 'unresolved_schema_ref' and actual.startswith(expected + ': '))):
            failures.append({'id': probe['id'], 'phase': 'stock', 'expected': expected, 'actual': actual})
    table = []
    covered = {p['guard'] for p in probes}
    for guard in sorted(inventory):
        if guard not in covered:
            failures.append({'guard': guard, 'phase': 'inventory', 'error': 'no negative'})
            continue
        mutant = module_for(source, guard)
        flips, stays, wrong = [], [], []
        for p in probes:
            actual = outcome(p['call'], mutant, schema)
            if p['guard'] == guard:
                if actual == 'accepted':
                    flips.append(p['id'])
                else:
                    wrong.append({'id': p['id'], 'expected': 'accepted', 'actual': actual})
            elif actual == p['stock']:
                stays.append(p['id'])
            else:
                wrong.append({'id': p['id'], 'expected': 'unchanged refusal', 'actual': actual})
        failures.extend({'guard': guard, **w} for w in wrong)
        table.append({'guard': guard, 'locations': inventory[guard], 'negatives_that_flip': flips,
                      'negatives_that_stay_rejected': stays, 'unexpected': wrong})
        print(guard, 'flip', len(flips), 'stay', len(stays), 'unexpected', len(wrong), flush=True)
    for path, digest in inputs.items():
        if hashlib.sha256((ROOT / path).read_bytes()).hexdigest() != digest:
            failures.append({'path': path, 'phase': 'input_stability', 'error': 'input changed during proof'})
    # A fresh, unmodified module must still pass the complete fixture checker.
    stock_result = module_for(source)['run']()
    return {'status': 'pass' if not failures else 'fail', 'native_execution': 'NOT_RUN',
            'method': __doc__, 'input_sha256': inputs, 'negative_count': len(probes), 'guard_count': len(inventory),
            'families': sorted({p['family'] for p in probes if p['family'] != 'shared'}),
            'inventory': inventory, 'guard_removal_table': table, 'failures': failures,
            'restored_full_checker': stock_result['status']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    report = run()
    args.output.write_text(json.dumps(report, indent=2) + '\n')
    print(report['status'], 'negatives', report['negative_count'], 'guards', report['guard_count'],
          'failures', len(report['failures']))
    raise SystemExit(0 if report['status'] == 'pass' else 1)
