#!/usr/bin/env python3
"""DL-260 source-boundary audit. Static canon checks, no native execution claim."""
from pathlib import Path
import argparse
import json
import re
import subprocess
import sys

import yaml

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / 'Plans'
BLOCK = re.compile(r'^```yaml\n(.*?)^```', re.M | re.S)
RETIRED = {'F3-649', 'ACD-474', 'DR-070'}


def read(name):
    return json.loads((PLANS / name).read_text())


def check(history_base=None):
    failures, units = [], {}

    def require(ok, message):
        if not ok:
            failures.append(message)

    forbidden = re.compile(r'Demo[\s-]*Studio|Demo Gallery|CONCEPT_DEMO_ONLY|PM56_DEMO|'
                           r'settings_concept_boundary|legacy_browser_concept_fixture|'
                           r'Play the next hour|Back to now|Demo time', re.I)
    for path in PLANS.glob('*.md'):
        text = path.read_text()
        if path.name != 'Decision_Log.md':
            require(not forbidden.search(text), path.name + ': prototype-only product prose remains')
        for block in BLOCK.finditer(text):
            if not re.search(r'^plan_unit_id:', block[1], re.M):
                continue
            try:
                unit = yaml.load(block[1], Loader=yaml.CSafeLoader)
            except yaml.YAMLError:
                unit = yaml.safe_load(block[1])
            units[unit['plan_unit_id']] = unit
    for uid in RETIRED:
        unit = units[uid]
        require(unit['status'] == 'retired' and unit['unit_type'] == 'retirement_record',
                uid + ': active feature contract remains')
        require(not unit['gui_related'] and not unit['implementation_surfaces'] and
                not unit['depends_on'] and not unit['unblocks'] and
                not unit['node_compile_hint']['create_worknodes'] and
                not unit['node_compile_hint']['create_nodeseeds'], uid + ': retirement compiles product work')
    for uid, unit in units.items():
        if unit['owner_doc'] == 'Plans/Decision_Log.md' or uid in RETIRED:
            continue
        require(not RETIRED.intersection(unit.get('depends_on', []) + unit.get('unblocks', [])),
                uid + ': active dependency on retired feature')
    require(units['DL-260']['status'] == 'accepted' and 'Q3 B' in units['DL-260']['canonical_text'],
            'DL-260 lacks Jared authority')
    if history_base:
        previous = subprocess.check_output(
            ['git', 'show', history_base + ':Plans/Decision_Log.md'], cwd=ROOT)
        require((PLANS / 'Decision_Log.md').read_bytes().startswith(previous),
                'Historical Decision Log bytes changed during DL-260')

    settings = read('settings_system_contracts.schema.json')
    require('settings_concept_boundary' not in settings['$defs'] and
            all(r.get('$ref') != '#/$defs/settings_concept_boundary' for r in settings['oneOf']),
            'Prototype Settings record remains a product admission')
    require('legacy_browser_concept_fixture' not in settings['$defs']['settings_migration_preview']
            ['properties']['source_kind']['enum'], 'Prototype browser data remains a Settings import source')
    command = settings['$defs']['settings_command_contract']
    require('concept_simulation_allowed' not in command['required'] and
            'concept_simulation_allowed' not in command['properties'],
            'Product command contract retains a simulation policy')
    onboarding = read('product_onboarding_contracts.schema.json')
    for key in ('automatic_preparation_owner_projection', 'onboarding_connector_owner_projection'):
        projection = onboarding['$defs'][key]
        require(projection['properties']['evidence_class'] == {'const': 'production_owner_projection'} and
                projection['properties']['production_owner_work'] == {'const': True},
                key + ': product projection admits simulated work')
    onb_fixtures = read('product_onboarding_contract_fixtures.json')
    require(all('concept_' not in r['name'] and '_simulated' not in r['name'] for bucket in
                ('valid', 'invalid') for r in onb_fixtures[bucket]),
            'Onboarding retains prototype-only fixture cases')
    require(any(r['name'] == 'DL260.owner_ready_requires_receipt' for r in onb_fixtures['invalid']),
            'Native owner Ready receipt guard lost its negative vector')
    for name in ('pm7_control_bindings.json', 'Wiring_Matrix.production.json',
                 'Wiring_Matrix.production.exclusions.json', 'storage_value_registry.json'):
        require(not forbidden.search(json.dumps(read(name))), name + ': prototype admission remains')
    exclusions = read('Wiring_Matrix.production.exclusions.json')['excluded_tokens']
    require(not {'page.go', 'demo.toast', 'demo.reason'}.intersection(exclusions),
            'Removed prototype verbs remain command-catalog obligations')
    print(json.dumps({'check': 'pm7-demo-canon', 'status': 'fail' if failures else 'pass',
                      'retired_history_anchors': sorted(RETIRED), 'history_base': history_base,
                      'claim': 'static_product_canon_boundary_only', 'failures': failures}, indent=2))
    return bool(failures)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--history-base', help='Prior commit whose Decision Log bytes must remain a prefix')
    args = parser.parse_args()
    sys.exit(check(args.history_base))
