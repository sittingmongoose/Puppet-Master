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


def _vector_shape(vectors, expected):
    if not isinstance(vectors, list) or len(vectors) != len(expected):
        return False
    rows = []
    for vector in vectors:
        if not isinstance(vector, dict) or set(vector) != {'age_ms', 'expected'}:
            return False
        if type(vector['age_ms']) is not int or type(vector['expected']) is not bool:
            return False
        rows.append(vector)
    return {vector['age_ms']: vector['expected'] for vector in rows} == expected


def validate_contracts(fixtures, owner_text=None, storage_text=None):
    failures = []
    entailed = []
    owner = owner_text if owner_text is not None else (ROOT / 'Plans/orchestrator-subagent-integration.md').read_text()
    policy = owner.split('### OSI-650 -', 1)[1].split('```yaml', 1)[0]
    literals = ['**300000**', 'strictly greater than 300000', 'equality is insufficient']
    if [literal for literal in literals if literal not in policy]:
        failures.append('threshold_owner_literals')
    # Re-derive the exact boundary from the answered number, not the runtime model.
    # 300000 is the OSI-650 policy threshold, not an integer-encoding cap.
    vectors = fixtures.get('heartbeat_expiry_vectors')
    expected = {299999: False, 300000: False, 300001: True}
    if not _vector_shape(vectors, expected):
        failures.append('threshold_oracle_census')
    else:
        for vector in vectors:
            if (vector['age_ms'] > 5 * 60 * 1000) != vector['expected']:
                entailed.append('threshold_oracle_evaluation')
    storage = storage_text if storage_text is not None else (ROOT / 'Plans/storage-plan.md').read_text()
    unit_literals = ['SP-278', 'SP-286/CV-339', 'no automatic mirror write', 'RP-COORDINATION-180D@1.0.0', 'RP-PROJECTION-3GEN@1.0.0', 'Membership is ABSENT']
    missing_unit = False
    for unit in range(540, 546):
        section = storage.split(f'### SP-{unit} -', 1)[1].split('### ', 1)[0]
        if [literal for literal in unit_literals if literal not in section]:
            missing_unit = True
    if missing_unit:
        failures.append('sp_unit_literals')
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
            failures.append('project_null_probe')
        probe = copy.deepcopy(payload)
        probe['unexpected_application_extension'] = {}
        if not c.payload_rejection(name, probe):
            failures.append('extension_probe')
    # The registry schema composition must remain exactly the Project edition.
    bundle = c.projections_bundle()
    if any(k.endswith('ApplicationV1') for k in bundle['$defs']):
        failures.append('application_definition_in_project_composition')
    if c.svr_failures():
        failures.append('project_registry_composition_mismatch')
    failures = c._gate('wave2', failures)
    entailed = c._gate('wave2_entailed', entailed)
    failures.extend(entailed)
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
                failures.append('schema_mutation_' + defect)
            if c.validate()['status'] != 'fail':
                failures.append('full_checker_mutation_' + defect)
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
                failures.append('projection_mutation_rogue' if name == 'rogue' else 'projection_mutation_rogue_application')
    return c._gate('wave2_entailed', failures)


def validate():
    fixtures = json.loads((ROOT / 'Plans/coordination_wave2_oracles.json').read_text())
    report = validate_contracts(fixtures)
    report['failures'].extend(schema_regression_failures())
    # Run missing/empty/incomplete/wrong-type boundary artifacts through the same
    # complete checker as the shipped fixture; no recursion or partial check.
    threshold_probe = []
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
            threshold_probe.append('threshold_mutation_' + defect)
    report['failures'].extend(c._gate('wave2_entailed', threshold_probe))
    report['status'] = 'fail' if report['failures'] else 'pass'
    return report


if __name__ == '__main__':
    report = validate()
    print(json.dumps(report, indent=2))
    raise SystemExit(bool(report['failures']))
