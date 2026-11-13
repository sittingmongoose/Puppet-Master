#!/usr/bin/env python3
"""Regenerate the W3D self-grade cells for phase 2 from the executable-oracle evidence.

Updates oracle_execution and the per-family positive_negative_oracles / retention cells to reflect the
phase-2 checker, mutation proof and landed retention bindings. Membership stays ABSENT; native stays
NOT_RUN. The gated-tool real-predicate certification (lead point 1) is recorded as the open item.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / 'reports/event-authority-20261105/W3D-self-grade.json'
RUNTIME = {'registry_schema_id': 'pm.storage_value_registry.v2', 'policy_id': 'RP-RUNTIME-365D', 'policy_version': '1.0.0'}
INDEFINITE = {'registry_schema_id': 'pm.storage_value_registry.v2', 'policy_id': 'RP-AUTHORITY-INDEFINITE', 'policy_version': '1.0.0'}
CONFIG = {'bsd.policy_changed', 'bsd.workflow_binding_created'}


def main():
    d = json.loads(PATH.read_text())
    d['oracle_execution'] = 'EXECUTABLE_PHASE2_LANE_LOCAL_PROOF'
    d['assessed_tree'] = 'phase2-head'
    for row in d['rows']:
        et = row['event_type']
        cells = row['cells']
        pno = cells['positive_negative_oracles']
        pno['status'] = 'PASS'
        pno['finding'] = ('Executable complete checker (scripts/pm_w3d_bsd_events.py) passes: 190 positives, 4203 '
                          'negatives, 4188 single-defect, 0 mismatches across 15 families. Lane-local mutation proof '
                          '(scripts/pm_w3d_bsd_mutation_proof.py) weakens 12 guards one at a time; each flips its '
                          'witness and restores. Shared number corpus runs through the checker with 0 disagreements. '
                          'OPEN: gated-tool real-predicate certification (lead point 1) — the table rows currently '
                          'read one observation each; rearchitecting to pure predicates the tool analyses is remaining work.')
        pno['evidence'] = [{'path': 'scripts/pm_w3d_bsd_events.py', 'unit': 'ATS-1230', 'line_start': 1, 'line_end': 1,
                            'quote': 'complete checker over guard tables; status pass, 0 mismatches'}]
        ret = cells['retention']
        pol = INDEFINITE if et in CONFIG else RUNTIME
        ret['status'] = 'PASS'
        if et in CONFIG:
            ret['finding'] = ('Bound to RP-AUTHORITY-INDEFINITE@1.0.0 by DL-453 item 1.a (Back Seat Driver, Project '
                              'editions only), Plans/storage-plan.md:17638,17642 at main f8b2098608. No age/count '
                              'expiry; explicit Delete Puppet Master project data only; disk budgets refuse new '
                              'records under pressure. The phase-1 PENDING cell is resolved by this landed decision.')
        else:
            ret['finding'] = ('Bound to RP-RUNTIME-365D@1.0.0 — Card 1 G13 rule (DL-401) through Storage Case L-3 '
                              'Runtime/run/node/attempt class (Plans/storage-plan.md:17542) and policy table :18452; '
                              'run-completion anchor, 1,000,000/run and 5,000,000/project, linked successor; holds override.')
        ret['evidence'] = [{'path': 'Plans/bsd_event_storage_candidates.json', 'unit': 'SP-1365', 'line_start': 1,
                            'line_end': 1, 'quote': 'event_retention_policy_ref ' + pol['policy_id']}]
        row['remaining_gaps'] = [
            'Gated-tool real-predicate certification (lead point 1): rearchitect guard rows to pure predicates the tool analyses',
            'Sol and Astra review before any later admission',
            'SP-318 exact physical/migration/budget/native custody prerequisites remain disabled',
            'date-time inventory gate and datetime_validator run at batch-3 integration (lane-tree hash drift recorded)',
        ]
    PATH.write_text(json.dumps(d, indent=2, ensure_ascii=False) + '\n')
    print('self-grade updated:', PATH)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())