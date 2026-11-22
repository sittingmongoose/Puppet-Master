#!/usr/bin/env python3
"""Post-landing Event Authority checks on real owner positives (TEST_ONLY).

No result is native producer adoption, receipt authentication or publication.
The generic reader's registration cut is exercised before consumer filtering,
exactly as in the post-landing review. Mutations never write the registry.
"""
import argparse
import collections
import copy
import importlib.util
import json
from pathlib import Path
import sys
from types import SimpleNamespace as NS
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import pm_goal_test_source as generic
from pm_ea_payload_selectors import selector_id


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, ROOT / path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def read(path):
    return json.loads((ROOT / path).read_text())


def owner_positives():
    import pm_w3e_event_oracles as w3e
    import pm_dcw_event_oracles as dcw
    import pm_dcw_blockage_events as blockage
    import pm_orchestrator_event_oracles as orchestrator
    owner = load_module('postfix_orchestrator', 'scripts/pm-orchestrator-event-contracts.py')
    panel = load_module('postfix_panel', 'scripts/pm-panel-event-contracts-check.py')
    positives = []
    def add(lane, event, source, case, route='existing owner original'):
        positives.append(dict(lane=lane, event=copy.deepcopy(event), source=source, case=case, route=route))
    for name in w3e.FAMILIES:
        for scope in w3e.SCOPES[name]:
            case = w3e.build_case(name, ('control-project:' if scope == 'project' else 'control:') + name,
                                  scope='project' if scope == 'project' else None)
            assert not w3e.boundary_errors(case, 'append'), name
            add('W3E', case['event'], 'scripts/pm_w3e_event_oracles.py#build_case', name + ':' + scope)
    for path in ['Plans/dcw_event_contract_fixtures.json', 'Plans/dcw_blockage_event_fixtures.json']:
        for index, family in enumerate(read(path)['families']):
            positive = family['positive']
            if 'blockage' in path:
                blockage.envelope(positive['event'], positive['authority'])
            else:
                dcw.envelope(family, positive['event'], authority=positive['authority'])
            add('DCW', positive['event'], path, '#/families/' + str(index) + '/positive/event')
    path = 'Plans/orchestrator_event_contract_fixtures.json'
    fixture = orchestrator.fixture_loads((ROOT / path).read_text())
    schema = read('Plans/orchestrator_event_payloads.schema.json')
    for index, case in enumerate(fixture['event_cases']):
        errors = orchestrator.event_errors(case, schema, owner.identity, owner.retry_allowed, ROOT, owner.UTC_FORMAT)
        assert not errors, (case['case_id'], errors)
        add('DO', case['event'], path, '#/event_cases/' + str(index) + '/event')
    for family in read('Plans/panel_event_contracts/manifest.json')['families']:
        path = 'Plans/panel_event_contracts/' + family['slug'] + '.fixtures.json'
        fixture = panel.load(path)
        schema = panel.load(family['payload_schema'])
        capture = []
        original = panel.shared.producer_digest
        def observe(record, *args, **kwargs):
            if not capture:
                capture.append(copy.deepcopy(record))
            return original(record, *args, **kwargs)
        with patch.object(panel.shared, 'producer_digest', observe):
            panel.shared.producer_cases(fixture, family['event_type'], fixture['settled_operation']['payload'])
        assert len(capture) == 1
        add('DG6A', capture[0], path, '#/settled_operation/payload', 'existing producer semantic preimage')
        # The named Application specimen is already payload-owner positive.
        # Project its declared identity fields into the same semantic envelope;
        # this is a scope/registration probe, not a native producer assertion.
        application = [(i, c) for i, c in enumerate(fixture['payload_cases'])
                       if c['valid'] and c['name'] == 'global_shell_app_scope']
        assert len(application) == 1
        index, case = application[0]
        payload = case['value']
        assert not panel.payload_errors(payload, schema) and payload['project_id'] is None
        event = copy.deepcopy(capture[0])
        event.update(scope_kind='application', project_id=None, payload=copy.deepcopy(payload),
                     payload_schema_id=payload['schema_id'], actor_ref=payload['actor_ref'],
                     idempotency_key=payload['idempotency_key'], correlation_id=payload['correlation_id'],
                     occurred_at_utc=payload['settled_at_utc'])
        panel.shared.producer_digest(event, tuple(k for k, v in payload.items() if type(v) is int))
        add('DG6A', event, path, '#/payload_cases/' + str(index), 'named owner-positive Application payload and SP scope projection')
    for index, case in enumerate(read('Plans/collaboration_event_contract_fixtures.json')['valid_events'][:2]):
        add('DC control', case['record'], 'Plans/collaboration_event_contract_fixtures.json', '#/valid_events/' + str(index) + '/record')
    return positives


def registration(doc):
    scopes = dict(project_only=('project',), application_only=('application',),
                  application_or_project=('application', 'project'), inherits_referenced_event=('application', 'project'))
    triples = set()
    for family in doc['families']:
        versions = family.get('payload_versions')
        if versions:
            triples.update((family['event_type'], v['scope_kind'], v['payload_schema_id']) for v in versions)
        else:
            triples.update((family['event_type'], scope, family['payload_schema_id']) for scope in scopes[family['scope_policy']])
    return frozenset(triples), doc['unknown_event_disposition']


def project(event):
    row = NS(event=event, position=1, custody=None, event_id=event.get('event_id', 'semantic-preimage'), sequence_id=1)
    snapshot = generic.SourceSnapshot(generic.QUALIFICATION, 'fixture-storage', 'fixture-snapshot', {}, [row])
    result = generic.GenericSource.project(NS(storage=NS(storage_instance_id='fixture-storage')), snapshot,
                                           NS(initial=lambda: {}), select=lambda _: False, require_custody=False)
    return result['halt'][0] if result['halt'] else None


def check_dispatch(doc, positives, readiness):
    findings, bindings, results = [], [], []
    for family in doc['families']:
        versions = family.get('payload_versions') or [dict(
            scope_kind='application' if family['scope_policy'] == 'application_only' else 'project',
            payload_schema_id=family['payload_schema_id'], payload_schema_ref=family.get('payload_schema_ref'))]
        for version in versions:
            probe = dict(family)
            if version.get('payload_schema_ref'):
                probe.pop('payload_schema', None)
                probe['payload_schema_ref'] = version['payload_schema_ref']
            schema, resource = readiness.event_family_payload_schema(probe, version['scope_kind'])
            try:
                expected = selector_id(family['event_type'], version['scope_kind'], schema, resource)
            except (OSError, ValueError, KeyError, TypeError) as exc:
                findings.append(dict(kind='selector_resource_unresolved', event_type=family['event_type'], detail=str(exc)))
                continue
            binding = dict(event_type=family['event_type'], scope=version['scope_kind'],
                           selector=version['payload_schema_id'], expected=expected, resource_id=resource)
            bindings.append(binding)
            if version['payload_schema_id'] != expected:
                findings.append(dict(kind='selector_differs_from_owner', **binding))
            ref = version.get('payload_schema_ref')
            if ref and ref.get('schema_id') != resource:
                findings.append(dict(kind='resource_identity_mismatch', **binding, claimed_resource=ref.get('schema_id')))
    with patch.object(generic, 'event_family_registration', lambda: registration(doc)):
        for case in positives:
            event = case['event']
            halt = project(event)
            result = dict(event_type=event['event_type'], scope=event['scope_kind'],
                          payload_schema_id=event['payload_schema_id'], source=case['source'], case=case['case'],
                          route=case['route'], halt=halt)
            results.append(result)
            if halt is not None:
                findings.append(dict(kind='owner_positive_dispatch_refused', **result))
    return findings, bindings, results


def mutations(doc, positives):
    results = []
    owner_cases = [c for c in positives if c['lane'] != 'DC control']
    with patch.object(generic, 'event_family_registration', lambda: registration(doc)):
        for case in owner_cases:
            wrong = copy.deepcopy(case['event'])
            wrong['payload_schema_id'] += ':wrong-owner-id'
            assert project(wrong) == 'reducer/unregistered_record'
            results.append(dict(kind='wrong_id_refused', event_type=wrong['event_type'], scope=wrong['scope_kind']))
    for event in sorted({c['event']['event_type'] for c in owner_cases}):
        variant = copy.deepcopy(doc)
        family = next(f for f in variant['families'] if f['event_type'] == event)
        row_id = family['payload_schema_id']
        if row_id.rsplit('@', 1)[-1] == '1.0.0':
            family['payload_schema_id'] = row_id.rsplit('@', 1)[0]
            for version in family.get('payload_versions', []):
                version['payload_schema_id'] = version['payload_schema_id'].rsplit('@', 1)[0]
        else:
            family['payload_schema_id'] = family['payload_schema_ref']['schema_id']
            for version in family.get('payload_versions', []):
                version['payload_schema_id'] = version['payload_schema_ref']['schema_id']
        with patch.object(generic, 'event_family_registration', lambda: registration(variant)):
            assert any(project(c['event']) == 'reducer/unregistered_record' for c in owner_cases if c['event']['event_type'] == event)
        results.append(dict(kind='landed_selector_defect_killed', event_type=event))
    panels = {c['event']['event_type'] for c in owner_cases if c['lane'] == 'DG6A'}
    for event in panels:
        variant = copy.deepcopy(doc)
        family = next(f for f in variant['families'] if f['event_type'] == event)
        family['scope_policy'] = 'project_only'
        family['payload_versions'] = [v for v in family.get('payload_versions', []) if v['scope_kind'] == 'project']
        with patch.object(generic, 'event_family_registration', lambda: registration(variant)):
            application = next(c for c in owner_cases if c['event']['event_type'] == event and c['event']['scope_kind'] == 'application')
            assert project(application['event']) == 'reducer/unregistered_record'
        results.append(dict(kind='project_only_panel_defect_killed', event_type=event))
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    doc = read('Plans/event_family_registry.json')
    assert registration(doc) == generic.event_family_registration(), 'Control registration projection differs from kernel'
    readiness = load_module('postfix_readiness', 'scripts/pm-implementation-readiness.py')
    positives = owner_positives()
    findings, bindings, cases = check_dispatch(doc, positives, readiness)
    controls = mutations(doc, positives) if args.self_test and not findings else []
    result = dict(schema_id='pm.ea.postfix_dispatch.v1', qualification=generic.QUALIFICATION,
                  native_execution='NOT_RUN', registry_families=len(doc['families']),
                  owner_positive_cases=len(positives), owner_positive_families=len({c['event']['event_type'] for c in positives}),
                  findings=findings, bindings=bindings, cases=cases, mutations=controls,
                  status='fail' if findings else 'pass')
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(dict(status=result['status'], registry_families=len(doc['families']),
                          findings=len(findings), failing_families=len({f['event_type'] for f in findings}),
                          mutations=len(controls))))
    return int(bool(findings))


if __name__ == '__main__':
    raise SystemExit(main())
