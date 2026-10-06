#!/usr/bin/env python3
"""Append genuinely named native roles to a fixed base; byte/provenance work only."""
import argparse
import copy
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import prepare as p
import build_imports as captures
import bind_imported_v4 as b


def extend(base_ref, role_map, destination):
    base = b.old.checked_json(base_ref); b.verify(base); result = copy.deepcopy(base)
    if not role_map or set(role_map) - {'critique', 'revision', 'enrichment', 'dependencies'}:
        raise ValueError('Only genuinely missing auxiliary roles may extend this fixed base')
    jobs = json.loads((b.LAB / 'state/jobs.json').read_text())['jobs']; seen = set()
    for role, assignment in role_map.items():
        if role in result['candidate_files']: raise ValueError('Do not overwrite an existing frozen role')
        freeze_ref = assignment['freeze_ref']; freeze = b.old.checked_json(freeze_ref)
        row = next(x for x in jobs if x['job_id'] == freeze['job_id'])
        expected_stage = {'critique': 'critique', 'revision': 'revision',
                          'enrichment': 'enrichment', 'dependencies': 'enrichment'}[role]
        if freeze.get('pair_id') != 'SEED-DEV-' + base['domain'] or freeze.get('stage') != expected_stage:
            raise ValueError('Only declared same-domain fixed-base role Goal may supply this extension')
        spec = json.loads(Path(row['stage_json']).read_text())
        actual_inputs = set(spec['input_pins'].values())
        if not {x['sha256'] for x in base['candidate_files'].values()} <= actual_inputs:
            raise ValueError('Role Goal did not receive the exact complete fixed base')
        # All native byte/Goal checks are also rerun by b.verify after lossless composition.
        item = next(x for x in freeze['artifacts'] if x['relative_path'] == assignment['relative_path'])
        if item['relative_path'] not in b.ROLE_PATHS[role]:
            raise ValueError('A proposal cannot impersonate an absent named auxiliary role')
        if p.sha(p.regular(item['path'])) != item['sha256']:
            raise ValueError('Frozen actual role drift')
        result['candidate_files'][role] = {'path': item['path'], 'sha256': item['sha256'],
             'origin_job_id': freeze['job_id'], 'original_relative_path': item['relative_path'], 'bytes': item['bytes']}
        if freeze['job_id'] in seen: continue
        seen.add(freeze['job_id']); receipt_ref = freeze['native_receipt']; receipt = b.old.checked_json(receipt_ref)
        family = freeze.get('family', row.get('family'))
        family = {'L': 'Luna', 'Z': 'GLM', 'M': 'Muse'}.get(family, family)
        identity = receipt.get('identity', {})
        origin = {**freeze_ref, 'actual_family': family,
                  'actual_model': identity.get('model') if family == 'Luna' else receipt.get('observed_model'),
                  'actual_effort': identity.get('effort') if family == 'Luna' else receipt.get('observed_effort'),
                  'native_receipt': receipt_ref}
        result['origin_freezes'].append(origin)
        result['cold_cost_references'].append({'job_id': freeze['job_id'], 'native_receipt': receipt_ref,
            'original_native_goal_starts': freeze['native_goal_starts'], 'original_elapsed_seconds': freeze['elapsed_seconds'],
            'reuse_new_native_starts': 0, 'accounting_rule': 'Actual fixed-base candidate role cost charged once, then reused by exact origin; original failed seeds remain charged.'})
        result['public_source_files'].extend(captures.snapshot_captures(freeze['job_id'], spec))
    result['roles_available'] = list(result['candidate_files'])
    result['roles_missing'] = sorted(b.ALLOWED - set(result['candidate_files']))
    result['base_origin_ref'] = base_ref; result['added_authentic_role_origins'] = sorted(seen)
    result['mechanical_extension_new_native_starts'] = 0; result['source_grade_used_for_selection'] = False
    b.verify(result); p.put(destination, result)
    return {'path': str(destination), 'sha256': p.sha(destination), 'new_native_starts': 0}


def main():
    a = argparse.ArgumentParser(description=__doc__)
    a.add_argument('--base', type=Path, required=True); a.add_argument('--base-sha256', required=True)
    a.add_argument('--role-map', type=Path, required=True); a.add_argument('--destination', type=Path, required=True)
    x = a.parse_args()
    print(json.dumps(extend({'path': str(x.base.absolute()), 'sha256': x.base_sha256},
                           json.loads(x.role_map.read_text()), x.destination.absolute())))


if __name__ == '__main__': main()
