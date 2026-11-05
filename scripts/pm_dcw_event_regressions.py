#!/usr/bin/env python3
"""Eleven standing DCW contract checks, including full-runner failure probes.

Static synthetic authority only; this neither admits events nor runs native code.
Run from any directory. Optional --output writes the per-family case evidence.
"""
import argparse
import ast
import copy
import inspect
import json
import subprocess
import sys
from pathlib import Path

import pm_dcw_event_oracles as m
from pm_bundle_revision_events import main, validate


def scenario(row, case):
    value = copy.deepcopy(row['positive'])
    if 'base_case' in case:
        base = next(c for c in row['cases'] if c['case_id'] == case['base_case'])
        for mutation in base.get('mutations', ()):
            m.patch(value, mutation)
    if 'event_bytes' in case:
        from pm_dcw_event_fixtures import event_case_fixture
        event_case_fixture(row, value, case)
    if 'source_bytes' in case:
        m.source_size_fixture(row, value, case['source_bytes'],
                              case['source_representation'] == 'payload_reference',
                              case.get('payload_body_mutations', ()))
    for mutation in case.get('mutations', ()):
        m.patch(value, mutation)
    if case.get('refresh_index'):
        from pm_dcw_index_fixtures import issue
        issue(value)
    return value


def probe(family, kind):
    """Break one input/rule in memory, then run the complete CLI checker."""
    control = kind.startswith('control_')
    if control:
        kind = kind.removeprefix('control_')
        if kind != 'failure_exit':
            m.schema_references = lambda schema: None
    original_load = m.load
    rows = copy.deepcopy(original_load('Plans/dcw_event_contract_fixtures.json'))
    selected = next(r for r in rows['families'] if r['event_type'] == family)
    if kind == 'failure_exit':
        for row in rows['families']:
            row['cases'] = [c for c in row['cases'] if row['event_type'] == family and
                            c['case_id'] == 'source_inline_16385_append']
        original_verify = m.verify
        def accepted_invalid(r, s, o, v):
            try:
                return original_verify(r, s, o, v)
            except m.Refusal as exc:
                if r['event_type'] == family and str(exc) == 'refuse_oversized_source':
                    return 'accept'
                raise
        m.verify = accepted_invalid
        m.load = lambda p: rows if p == 'Plans/dcw_event_contract_fixtures.json' else original_load(p)
        if control:
            # Weaken only the result/expectation guard in the complete runner.
            tree = ast.parse(inspect.getsource(m.run))
            class RemoveOutcomeAssertion(ast.NodeTransformer):
                def visit_Assert(self, node):
                    return ast.copy_location(ast.Pass(), node) if ast.unparse(node.test) == "outcome == case['expected']" else node
            tree = ast.fix_missing_locations(RemoveOutcomeAssertion().visit(tree))
            exec(compile(tree, '<DCW failure-result guard ablation>', 'exec'), m.__dict__)
    else:
        # Put a dangling ref in an UNUSED definition: validating only positive
        # instances or only JSON Schema syntax would miss this counterexample.
        path = selected['source_schema'] if kind.startswith('source_') else selected['schema']
        schema = copy.deepcopy(original_load(path))
        ref = '#/$defs/DCW_MISSING' if kind.endswith('fragment') else 'urn:pm:dcw:missing-schema'
        schema.setdefault('$defs', {})['dcw_unreachable_probe'] = {'$ref': ref}
        registry = copy.deepcopy(original_load('Plans/storage_value_registry.json'))
        for source in registry['families']:
            if source['value_schema_ref'] == path:
                source['value_schema'] = copy.deepcopy(schema)
        for row in rows['families']:
            row['cases'] = [c for c in row['cases'] if row['event_type'] == family and c['case_id'] == 'valid_retry']
        replacements = {path: schema, 'Plans/storage_value_registry.json': registry,
                        'Plans/dcw_event_contract_fixtures.json': rows}
        m.load = lambda p: replacements[p] if p in replacements else original_load(p)
    main(family)


def audit(family=None):
    rows = m.load('Plans/dcw_event_contract_fixtures.json')['families']
    rows = [r for r in rows if family is None or r['event_type'] == family]
    results = []

    def test(row, check, name, value, operation, expected):
        try:
            actual = m.verify(row, copy.deepcopy(value), operation, validate)
        except m.Refusal as exc:
            actual = str(exc)
        results.append(dict(family=row['event_type'], check=check, case=name,
                            operation=operation, expected=expected, actual=actual,
                            passed=actual == expected))

    for row in rows:
        base = row['positive']
        # 1: ALL successful writer cases, including restore, pending drains,
        # resume, source overflow and every supported caller retry variant.
        for case in row['cases']:
            if case['expected'] != 'accept' or case['operation'] not in ('append', 'publish', 'retry'):
                continue
            value = scenario(row, case)
            if case['operation'] == 'retry':
                incoming = copy.deepcopy(value)
                incoming.setdefault('retry_request', copy.deepcopy(value['event']))
                incoming['retry_request']['replay_policy'] = 'projector_replay_only'
                test(row, 1, 'caller_policy_on_' + case['case_id'], incoming, 'retry', 'replay_only_not_appendable')
            from pm_dcw_event_fixtures import writer_policy_fixture
            writer_policy_fixture(row, value)
            test(row, 1, 'event_policy_on_' + case['case_id'], value, case['operation'], 'replay_only_not_appendable')
        # 2: project-only families refuse both valid CV-366 and malformed app keys.
        for key in ('application@1:' + b'server'.hex() + ':' + b'operation'.hex(), 'application:server:operation'):
            value = copy.deepcopy(base)
            from pm_dcw_event_fixtures import idempotency_key_fixture
            idempotency_key_fixture(row, value, key)
            test(row, 2, key, value, 'append', 'identity')
        # 3: canonical project~ positives are checked by every original_receipt.
        value = copy.deepcopy(base)
        value['authority']['custody'][value['event']['event_id']]['scope_partition'] = value['event']['project_id']
        for operation in ('publish', 'retry', 'read'):
            test(row, 3, 'raw_project_partition', value, operation, 'receipt_scope')
        # 4 and 5: exact overflow boundary plus matching malformed owner hash.
        for size, referenced, expected in ((16384, False, 'accept'), (16385, False, 'refuse_oversized_source'),
                                           (24576, True, 'accept')):
            value = copy.deepcopy(base)
            m.source_size_fixture(row, value, size, referenced)
            for operation in ('append', 'publish', 'retry', 'read', 'rebuild'):
                test(row, 4, str(size) + ('_reference' if referenced else '_inline'), value, operation, expected)
        lf = next(c for c in row['cases'] if c['case_id'] == 'trailing_LF_original_hash_append')
        for operation in ('append', 'publish', 'retry'):
            test(row, 5, 'original_hash_LF_matching_owner', scenario(row, lf), operation, 'schema')
        # 6: Storage metadata changes accept; caller semantic body changes conflict.
        for name in ('caller_retry_semantic_fields_only', 'caller_retry_metadata_observed_at_utc',
                     'caller_retry_metadata_persisted_at_utc', 'caller_retry_metadata_sequence_id',
                     'retry_changed_semantic_body'):
            case = next(c for c in row['cases'] if c['case_id'] == name)
            test(row, 6, name, scenario(row, case), 'retry', case['expected'])
        # 7: source/selected authority moves together; its old checkpoint must refuse.
        case = next(c for c in row['cases'] if c['case_id'] == 'checkpoint_different_event_storage_instance')
        test(row, 7, case['case_id'], scenario(row, case), case['operation'], case['expected'])
        # 8 and 9 use a real subprocess running the complete CLI, not an isolated
        # schema helper. No repository file, registry or fixture is edited.
        for kind in ('failure_exit', 'source_fragment', 'source_external', 'payload_fragment', 'payload_external'):
            child = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--probe', row['event_type'], kind],
                                   cwd=m.ROOT, capture_output=True, text=True)
            needle = 'refuse_oversized_source' if kind == 'failure_exit' else 'unresolved_schema_ref'
            check = 8 if kind == 'failure_exit' else 9
            rejected = child.returncode != 0 and needle in child.stderr
            if kind == 'failure_exit':
                rejected = rejected and 'AssertionError' in child.stderr and "'accept'" in child.stderr
                control = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--probe',
                                          row['event_type'], 'control_' + kind],
                                         cwd=m.ROOT, capture_output=True, text=True)
                rejected = rejected and control.returncode == 0
            else:
                # Removing only the new reference preflight must accept the
                # same otherwise-valid input, proving this mutant is specific.
                control = subprocess.run([sys.executable, str(Path(__file__).resolve()), '--probe',
                                          row['event_type'], 'control_' + kind],
                                         cwd=m.ROOT, capture_output=True, text=True)
                rejected = rejected and control.returncode == 0
            results.append(dict(family=row['event_type'], check=check, case=kind, exit=child.returncode,
                                guard_disabled_exit=control.returncode,
                                expected='nonzero: ' + needle,
                                actual=child.stderr.splitlines()[-1] if child.stderr else '',
                                passed=rejected))
    from pm_dcw_event_standing import additional_checks
    additional_checks(rows, results)
    summary = {row['event_type']: {str(check): {
        'cases': sum(r['family'] == row['event_type'] and r['check'] == check for r in results),
        'passed': all(r['passed'] for r in results if r['family'] == row['event_type'] and r['check'] == check)
    } for check in range(1, 12)} for row in rows}
    return dict(status='PASS' if all(r['passed'] for r in results) else 'FAIL',
                native='NOT_RUN', families=summary, cases=results)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--family', choices=[r['event_type'] for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']])
    parser.add_argument('--probe', nargs=2, metavar=('FAMILY', 'KIND'))
    args = parser.parse_args()
    if args.probe:
        probe(*args.probe)
    else:
        report = audit(args.family)
        if args.output:
            args.output.write_text(json.dumps(report, indent=2) + '\n')
        print(json.dumps({k: v for k, v in report.items() if k != 'cases'}, indent=2))
        sys.exit(0 if report['status'] == 'PASS' else 1)
