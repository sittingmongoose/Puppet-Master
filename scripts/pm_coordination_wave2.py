#!/usr/bin/env python3
"""Static DCO amendment checks and adversarial regression probes; no native proof."""
import copy
import importlib.util
import json
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('coordination', ROOT / 'scripts/pm_coordination_events.py')
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)


def validate_contracts(fixtures):
    failures = []
    owner = (ROOT / 'Plans/orchestrator-subagent-integration.md').read_text()
    policy = owner.split('### OSI-650 -', 1)[1].split('```yaml', 1)[0]
    for literal in ['**300000**', 'strictly greater than 300000', 'equality is insufficient']:
        if literal not in policy:
            failures.append('threshold_owner_missing:' + literal)
    # Re-derive the exact boundary from the answered number, not the runtime model.
    vectors = fixtures.get('heartbeat_expiry_vectors')
    expected = {299999: False, 300000: False, 300001: True}
    if (not isinstance(vectors, list) or len(vectors) != len(expected)
            or any(not isinstance(v, dict) or set(v) != {'age_ms', 'expected'}
                   or type(v['age_ms']) is not int or type(v['expected']) is not bool
                   for v in vectors)
            or {v['age_ms']: v['expected'] for v in vectors} != expected):
        failures.append('threshold_oracle_census')
    else:
        for vector in vectors:
            if (vector['age_ms'] > 5 * 60 * 1000) != vector['expected']:
                failures.append('threshold_oracle:' + str(vector['age_ms']))
    storage = (ROOT / 'Plans/storage-plan.md').read_text()
    for unit in range(540, 546):
        section = storage.split(f'### SP-{unit} -', 1)[1].split('### ', 1)[0]
        for literal in ['SP-278', 'SP-286/CV-339', 'no automatic mirror write', 'RP-COORDINATION-180D@1.0.0', 'RP-PROJECTION-3GEN@1.0.0', 'Membership is ABSENT']:
            if literal not in section:
                failures.append(f'SP-{unit}:' + literal)
    # Exercise Project payload null rejection and unsupported scope after census repair.
    f = c.load(c.FIXTURE_PATH)
    for event in f['valid_events']:
        if event['event_type'] == 'coordination.agent_registered':
            continue
        name = event['event_type']
        payload = next(p['payload'] for p in f['payloads'] if p['case_id'] == event['payload_case_id'])
        probe = copy.deepcopy(payload)
        probe['project_id'] = None
        if not c.payload_rejection(name, probe):
            failures.append(name + ':project_null_accepted')
        probe = copy.deepcopy(payload)
        probe['unexpected_application_extension'] = {}
        if not c.payload_rejection(name, probe):
            failures.append(name + ':extension_accepted')
    # The registry schema composition must remain exactly the Project edition.
    bundle = c.projections_bundle()
    if any(k.endswith('ApplicationV1') for k in bundle['$defs']):
        failures.append('application_definition_in_project_composition')
    if c.svr_failures():
        failures.append('project_registry_composition_mismatch')
    return {'status': 'fail' if failures else 'pass', 'failures': failures,
            'native_execution': 'NOT_RUN', 'admission_claimed': False}


def schema_regression_failures():
    failures = []
    # Census and Project null rejection still fail closed after app separation.
    original_load = c.load
    for defect in ['unknown_definition', 'project_null', 'project_app_ref', 'helper_app_ref']:
        schema = copy.deepcopy(original_load(c.PAYLOAD_PATH))
        if defect == 'unknown_definition':
            schema['$defs']['rogue'] = {'type': 'object'}
        elif defect == 'project_null':
            schema['$defs']['agent_crashed']['properties']['project_id'] = {'const': None}
        else:
            app_ref = c.PAYLOAD_SCHEMA_URI + '#/$defs/agent_status_updatedApplicationV1/properties/status_reason'
            if defect == 'project_app_ref':
                schema['$defs']['agent_status_updated']['properties']['status_reason'] = {'$ref': app_ref}
            else:
                schema['$defs']['non_secret_ref']['$ref'] = app_ref
        def patched_load(path, root=c.ROOT):
            return schema if path == c.PAYLOAD_PATH else original_load(path, root)
        with patch.object(c, 'load', side_effect=patched_load):
            expected_error = ('project_payload_reference_not_isolated' if defect.endswith('app_ref') else
                              'payload_schema_definition_census' if defect == 'unknown_definition' else
                              'payload_schema_admits_null')
            if expected_error not in {f['error'] for f in c.payload_schema_failures()}:
                failures.append('schema_mutation_accepted:' + defect)
            if c.validate()['status'] != 'fail':
                failures.append('full_checker_mutation_accepted:' + defect)
    for name in ['rogue', 'rogueApplicationV1']:
        schema = copy.deepcopy(original_load(c.PROJECTION_PATH))
        schema['$defs'][name] = {'type': 'object', 'additionalProperties': True}
        def patched_projection_load(path, root=c.ROOT):
            return schema if path == c.PROJECTION_PATH else original_load(path, root)
        with patch.object(c, 'load', side_effect=patched_projection_load):
            result = c.validate()
            errors = {f['error'] for f in result['failures']}
            if (result['status'] != 'fail' or 'projection_schema_definition_census' not in errors
                    or 'coordination_storage_family_mismatch' not in errors):
                failures.append('projection_mutation_accepted:' + name)
    return failures


def validate():
    fixtures = json.loads((ROOT / 'Plans/coordination_wave2_oracles.json').read_text())
    report = validate_contracts(fixtures)
    report['failures'].extend(schema_regression_failures())
    # Run missing/empty/incomplete/wrong-type boundary artifacts through the same
    # complete checker as the shipped fixture; no recursion or partial check.
    for defect in ['missing', 'empty', 'incomplete', 'wrong_expectation', 'integer_boolean']:
        mutated = copy.deepcopy(fixtures)
        if defect == 'missing':
            mutated.pop('heartbeat_expiry_vectors', None)
        elif defect == 'empty':
            mutated['heartbeat_expiry_vectors'] = []
        elif defect == 'incomplete':
            mutated['heartbeat_expiry_vectors'] = [{'age_ms': 300000, 'expected': False}]
        else:
            mutated['heartbeat_expiry_vectors'] = [
                {'age_ms': 299999, 'expected': False}, {'age_ms': 300000, 'expected': False},
                {'age_ms': 300001, 'expected': False if defect == 'wrong_expectation' else 1}]
        result = validate_contracts(mutated)
        if result['status'] != 'fail' or 'threshold_oracle_census' not in result['failures']:
            report['failures'].append('threshold_mutation_accepted:' + defect)
    report['status'] = 'fail' if report['failures'] else 'pass'
    return report


if __name__ == '__main__':
    report = validate()
    print(json.dumps(report, indent=2))
    raise SystemExit(bool(report['failures']))
