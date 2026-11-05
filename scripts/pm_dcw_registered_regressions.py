#!/usr/bin/env python3
"""B1 full-oracle/CLI probes, one family per invocation; synthetic native NOT_RUN.

Schema/registry mutations exist only in memory. Each reference probe changes
one input fact. Full captures are issued before validation, with no stale hashes.
This is a focused regression runner, not a replacement guard-inventory tool.
"""
import argparse
import contextlib
import copy
import io
import json

import pm_dcw_event_oracles as m
import pm_dcw_event_numeric_cases as numeric
import pm_dcw_registered_schemas as schemas
from pm_bundle_revision_events import main, validate
from pm_dcw_registered_cases import cases, mixed

PATH = 'Plans/event_payload_run_started.schema.json'
REGISTRY = 'Plans/event_family_registry.json'
EXTERNAL = 'Plans/run_started_consumer_contracts.schema.json'
FIXTURES = 'Plans/dcw_event_contract_fixtures.json'
OPS = ('read', 'rebuild', 'compatibility_read')


def audit(family):
    row = next(r for r in m.load(FIXTURES)['families'] if r['event_type'] == family)
    original_load = m.load
    records = []

    def outcome(value, operation):
        value = copy.deepcopy(value)
        if operation == 'compatibility_read':
            value['event']['replay_policy'] = 'projector_replay_only'
        try:
            return m.verify(row, value, operation, validate)
        except m.Refusal as exc:
            return str(exc)

    def record(name, operation, actual, expected, **details):
        records.append(dict(case=name, operation=operation, actual=actual, expected=expected,
                            passed=actual == expected, **details))

    for case in cases(row):
        record(case['case_id'], case['operation'], outcome(case['_value'], case['operation']), case['expected'])

    # Controls cut only the predicate under test. Every other new negative is
    # rerun, and remains rejected unless it violates that very same predicate.
    for cut in ('dispatch', 'version', 'additionalProperties', 'current_additionalProperties'):
        require = m.require
        if cut == 'dispatch':
            m.require = lambda ok, code: None if code == 'index_source_dispatch' else require(ok, code)
        elif cut == 'version':
            document = copy.deepcopy(original_load(PATH)); document['properties']['schema_version'].pop('const')
            m.load = lambda p: document if p == PATH else original_load(p)
        elif cut == 'additionalProperties':
            document = copy.deepcopy(original_load(PATH))
            document['$defs']['run_started_1_0_0_compatibility_reader'].pop('additionalProperties')
            m.load = lambda p: document if p == PATH else original_load(p)
        else:
            document = copy.deepcopy(original_load(PATH)); document.pop('additionalProperties')
            m.load = lambda p: document if p == PATH else original_load(p)
        try:
            for case in cases(row):
                own = ((cut == 'dispatch' and ('registered_schema_id_' in case['case_id'] or 'registered_unknown_version_id_' in case['case_id'])) or
                       (cut == 'version' and 'registered_payload_version_' in case['case_id']) or
                       (cut == 'additionalProperties' and 'registered_historical_payload_' in case['case_id']) or
                       (cut == 'current_additionalProperties' and 'registered_payload_body_' in case['case_id']))
                expected = 'accept' if own else case['expected']
                record('predicate_cut_' + cut + '_' + case['case_id'], case['operation'],
                       outcome(case['_value'], case['operation']), expected, predicate=cut)
        finally:
            m.require = require; m.load = original_load

    value = mixed(row)
    document = original_load(PATH)
    registry = original_load(REGISTRY)
    external = original_load(EXTERNAL)
    # A real external schema/property reference, then an unvisited transitive
    # dangling reference in that same external document. All peers stay enabled.
    linked = copy.deepcopy(document)
    linked['properties']['project_id'] = {'$ref': external['$id'] + '#/$defs/checkpoint/properties/project_id'}
    wrapped = {'$schema': document['$schema'], '$id': 'urn:pm:dcw:registered-pointer-control',
               '$defs': {'run~/started': copy.deepcopy(document)}}
    variants = [('real_external_closure', {PATH: linked}, 'accept'),
                ('exact_nonroot_pointer', {PATH: wrapped}, 'accept')]
    scoped_registry = copy.deepcopy(registry)
    scoped_owner = next(f for f in scoped_registry['families'] if f['event_type'] == 'run.started')
    scoped_owner['payload_versions'] = [dict(scope_kind='project', payload_schema_id=scoped_owner['payload_schema_id'],
                                           payload_schema_ref=copy.deepcopy(scoped_owner['payload_schema_ref']))]
    variants.append(('exact_scope_edition', {REGISTRY: scoped_registry}, 'accept'))
    changed = copy.deepcopy(scoped_registry)
    next(f for f in changed['families'] if f['event_type'] == 'run.started')['payload_versions'][0]['scope_kind'] = 'application'
    variants.append(('foreign_scope_edition', {REGISTRY: changed}, 'index_source_dispatch'))
    identity_definition = copy.deepcopy(document)
    identity_definition.pop('$id')
    identity_definition['properties']['schema_id'] = {'const': document['$id']}
    constant_wrapper = dict(wrapped, **{'$defs': {'run~/started': identity_definition}})
    constant_registry = copy.deepcopy(registry)
    next(f for f in constant_registry['families'] if f['event_type'] == 'run.started')['payload_schema_ref']['json_pointer'] = '#/$defs/run~0~1started'
    constant_inputs = {PATH: constant_wrapper, REGISTRY: constant_registry}
    variants.append(('const_identity_definition', constant_inputs, 'accept'))
    changed = copy.deepcopy(constant_wrapper)
    changed['$defs']['run~/started']['properties']['schema_id']['const'] = 'urn:pm:wrong-selected-constant'
    variants.append(('const_identity_mismatch', {PATH: changed, REGISTRY: constant_registry}, 'registered_schema_identity'))
    array_wrapper = {'$schema': document['$schema'], '$id': 'urn:pm:dcw:registered-array-pointer',
                     'allOf': [copy.deepcopy(document)]}
    for suffix, token, expected in (('exact', '0', 'accept'), ('signed', '-1', 'registered_schema_pointer'),
                                    ('leading_zero', '00', 'registered_schema_pointer')):
        changed = copy.deepcopy(registry)
        next(f for f in changed['families'] if f['event_type'] == 'run.started')['payload_schema_ref']['json_pointer'] = '#/allOf/' + token
        variants.append(('array_pointer_' + suffix, {PATH: array_wrapper, REGISTRY: changed}, expected))
    for name, field, bad, expected in (
        ('ref_schema_id', 'schema_id', 'urn:pm:wrong-reference-id', 'registered_schema_id'),
        ('ref_path', 'path', 'Plans/DCW_MISSING.schema.json', 'registered_schema_path'),
        ('ref_pointer', 'json_pointer', '#/$defs/DCW_MISSING', 'registered_schema_pointer'),
        ('ref_pointer_prefix', 'json_pointer', '/$defs/run_started_1_0_0_compatibility_reader', 'registered_schema_pointer'),
    ):
        changed = copy.deepcopy(registry)
        next(f for f in changed['families'] if f['event_type'] == 'run.started')['payload_schema_ref'][field] = bad
        variants.append((name, {REGISTRY: changed}, expected))
    changed = copy.deepcopy(registry)
    next(f for f in changed['families'] if f['event_type'] == 'run.started')['payload_schema_ref']['json_pointer'] = '#/$defs/bad~2escape'
    variants.append(('ref_pointer_syntax', {REGISTRY: changed, PATH: {
        '$schema': document['$schema'], '$id': 'urn:pm:dcw:pointer-syntax',
        '$defs': {'bad~2escape': copy.deepcopy(document)}}}, 'registered_schema_pointer'))
    changed = copy.deepcopy(document); changed['$id'] = 'urn:pm:wrong-selected-schema-id'
    variants.append(('selected_schema_id', {PATH: changed}, 'registered_schema_identity'))
    for name, ref in (('unused_local_ref', '#/$defs/DCW_MISSING'), ('unused_external_ref', 'urn:pm:dcw:missing-resource')):
        changed = copy.deepcopy(document); changed['$defs']['unvisited_reference'] = {'$ref': ref}
        variants.append((name, {PATH: changed}, 'registered_schema_ref'))
    changed = copy.deepcopy(external); changed['$defs']['unvisited_reference'] = {'$ref': '#/$defs/DCW_MISSING'}
    variants.append(('transitive_unused_ref', {PATH: linked, EXTERNAL: changed}, 'registered_schema_ref'))
    changed = copy.deepcopy(external)
    changed['$defs']['checkpoint']['properties']['project_id']['const'] = 'another-project'
    variants.append(('external_target_validation', {PATH: linked, EXTERNAL: changed}, 'index_source_payload'))

    for name, replacements, expected in variants:
        replacements = dict(replacements)
        if name == 'exact_nonroot_pointer':
            changed = copy.deepcopy(registry)
            next(f for f in changed['families'] if f['event_type'] == 'run.started')['payload_schema_ref']['json_pointer'] = '#/$defs/run~0~1started'
            replacements[REGISTRY] = changed
        for operation in OPS:
            # Execute the actual CLI entry point with this one otherwise-valid
            # mixed capture. Fixture selection changes; no product guard does.
            fixtures = copy.deepcopy(original_load(FIXTURES))
            selected = next(r for r in fixtures['families'] if r['event_type'] == family)
            selected['cases'] = [dict(case_id='round9_' + name, operation=operation,
                                      expected=expected, _value=copy.deepcopy(value))]
            if operation == 'compatibility_read':
                selected['cases'][0]['_value']['event']['replay_policy'] = 'projector_replay_only'
            inputs = dict(replacements, **{FIXTURES: fixtures})
            m.load = lambda p: inputs[p] if p in inputs else original_load(p)
            generate = numeric.cases
            numeric.cases = lambda r: []
            try:
                with contextlib.redirect_stdout(io.StringIO()):
                    main(family)
                actual = outcome(value, operation)
                record('full_cli_' + name, operation, actual, expected, full_cli_exit=0)
                if expected != 'accept':
                    # Repair only the defective reference/identity fact. The
                    # syntax witness retains its literal '~2' target key; its
                    # valid RFC6901 spelling escapes the tilde as '~0'.
                    repaired = {PATH: linked} if name in ('transitive_unused_ref', 'external_target_validation') else {}
                    if name == 'ref_pointer_syntax':
                        repaired = copy.deepcopy(replacements)
                        next(f for f in repaired[REGISTRY]['families'] if f['event_type'] == 'run.started')['payload_schema_ref']['json_pointer'] = '#/$defs/bad~02escape'
                    elif name == 'const_identity_mismatch':
                        repaired = constant_inputs
                    elif name.startswith('array_pointer_'):
                        repaired = copy.deepcopy(replacements)
                        next(f for f in repaired[REGISTRY]['families'] if f['event_type'] == 'run.started')['payload_schema_ref']['json_pointer'] = '#/allOf/0'
                    m.load = lambda p: repaired[p] if p in repaired else original_load(p)
                    record('single_fact_repair_' + name, operation, outcome(value, operation), 'accept')
                    m.load = lambda p: inputs[p] if p in inputs else original_load(p)
                if expected == 'registered_schema_ref':
                    closure = schemas.reference_closure
                    schemas.reference_closure = lambda *a: None
                    try:
                        record('closure_cut_' + name, operation, outcome(value, operation), 'accept')
                    finally:
                        schemas.reference_closure = closure
            finally:
                m.load = original_load; numeric.cases = generate

    return dict(family=family, status='PASS' if all(r['passed'] for r in records) else 'FAIL',
                outcomes=len(records), records=records, native='NOT_RUN', admission='ABSENT')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    result = audit(args.family)
    from pathlib import Path
    Path(args.output).write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k: v for k, v in result.items() if k != 'records'}))
    raise SystemExit(0 if result['status'] == 'PASS' else 1)
