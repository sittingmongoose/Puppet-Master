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


def validate():
    failures = []
    fixtures = json.loads((ROOT / 'Plans/coordination_wave2_oracles.json').read_text())
    owner = (ROOT / 'Plans/orchestrator-subagent-integration.md').read_text()
    policy = owner.split('### OSI-650 -', 1)[1].split('```yaml', 1)[0]
    for literal in ['**300000**', 'strictly greater than 300000', 'equality is insufficient']:
        if literal not in policy:
            failures.append('threshold_owner_missing:' + literal)
    # Re-derive the exact boundary from the answered number, not the runtime model.
    for vector in fixtures['heartbeat_expiry_vectors']:
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
    # Census and Project null rejection still fail closed after app separation.
    original_load = c.load
    for defect in ['unknown_definition', 'project_null']:
        schema = copy.deepcopy(original_load(c.PAYLOAD_PATH))
        if defect == 'unknown_definition':
            schema['$defs']['rogue'] = {'type': 'object'}
        else:
            schema['$defs']['agent_crashed']['properties']['project_id'] = {'const': None}
        def patched_load(path, root=c.ROOT):
            return schema if path == c.PAYLOAD_PATH else original_load(path, root)
        with patch.object(c, 'load', side_effect=patched_load):
            if not c.payload_schema_failures():
                failures.append('schema_mutation_accepted:' + defect)
    # The registry schema composition must remain exactly the Project edition.
    bundle = c.projections_bundle()
    if any(k.endswith('ApplicationV1') for k in bundle['$defs']):
        failures.append('application_definition_in_project_composition')
    if c.svr_failures():
        failures.append('project_registry_composition_mismatch')
    return {'status': 'fail' if failures else 'pass', 'failures': failures,
            'native_execution': 'NOT_RUN', 'admission_claimed': False}


if __name__ == '__main__':
    report = validate()
    print(json.dumps(report, indent=2))
    raise SystemExit(bool(report['failures']))
