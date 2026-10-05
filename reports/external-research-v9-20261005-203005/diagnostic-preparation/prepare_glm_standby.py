#!/usr/bin/env python3
"""Explicit prospective same-family GLM alternatives; never substitute or launch silently."""
import copy
import json
from pathlib import Path
import prepare as p
import plan_seeded as s

HERE = Path(__file__).resolve().parent
LAB = HERE.parent.parent
ROOT = HERE / 'alternatives'


def main():
    p.design_pins(LAB)
    queue = json.loads((LAB / 'cases/diagnostics/QUEUE.json').read_text())
    rows = []
    requests = []
    for entry in queue['items']:
        if entry['requested_family'] != 'Luna':
            continue
        original_path = LAB / 'cases' / entry['card_path']
        original = json.loads(original_path.read_text())
        card = copy.deepcopy(original)
        replacement = original['pair_id'] + '-GLM-S1'
        card.update({'pair_id': replacement, 'card_version': 'prospective-GLM-standby-v1',
                     'source_slot': original.get('source_slot', original['pair_id']),
                     'replaces_unrun_pair': original['pair_id'], 'original_card_ref': {'path': str(original_path), 'sha256': p.sha(original_path)},
                     'requested_family': 'GLM', 'requested_model': 'GLM 5.3 Flash', 'requested_effort': 'Max',
                     'requested_route': 'zcode genuine app-native /goal',
                     'status': 'NOT_RUN', 'route_status': 'STANDBY_NOT_SELECTED',
                     'freeze_state': 'PROSPECTIVE_FAMILY_REPLACEMENT_NOT_LAUNCHED',
                     'observed_model': None, 'observed_effort': None,
                     'replacement_reason': 'Conditional continued Luna route hold after concrete repair; root prospectively permits usable-family replacement. Both arms change family together; not credited as Luna or same-model replication.',
                     'replacement_lineage': [original.get('replaces_unrun_pair'), original['pair_id'], replacement],
                     'slot_selection_rule': 'Root/ops chooses one active comparison identity for the existing source slot before outputs. Original unrun/hold remains reported. No automatic replacement or additional comparison credited.',
                     'semantic_inputs_unchanged': True})
        card['replacement_lineage'] = [x for x in card['replacement_lineage'] if x]
        card_path = ROOT / 'cards' / (replacement + '.json')
        p.put(card_path, card)
        if card['initial_input_class'] == 'BRIEF_ONLY_LIVE_DISCOVERY':
            freeze = p.prospective_pair(LAB, ROOT / 'prepared', card_path, card)
            jobs = []
            for arm in ('control', 'treatment'):
                for index, step in enumerate(card['stages'][arm]):
                    jobs.append(p.stage_packet(LAB, ROOT / 'prepared', card, card_path, arm, index, step, freeze))
            ref = p.registration(ROOT / 'prepared', card_path, card, jobs)
            requests.append(ref)
            state = 'PREPARED_NOT_SELECTED_NOT_ADMITTED'
        else:
            original_plan_path = HERE / 'seeded/plans' / (original['pair_id'] + '.json')
            plan = json.loads(original_plan_path.read_text())
            plan.update({'pair_id': replacement, 'card_path': str(card_path), 'card_sha256': p.sha(card_path),
                         'family': 'Z', 'requested_model': card['requested_model'], 'requested_effort': card['requested_effort'],
                         'status': 'STANDBY_AWAITING_AUTHENTIC_SEED_AND_ROOT_SELECTION',
                         'original_pair_id': original['pair_id'], 'replacement_reason': card['replacement_reason'],
                         'no_automatic_family_substitution': True})
            for job in plan['stage_jobs']:
                job['job_id'] = job['job_id'].replace(original['pair_id'], replacement, 1)
                job['prerequisite_job_ids'] = [x.replace(original['pair_id'], replacement, 1) for x in job['prerequisite_job_ids']]
                if job.get('native_goal'):
                    job['max_responses'] = job['requested_parent_response_cap']
                    job['response_cap_enforcement'] = 'SUPPORTED_NATIVE_LIMIT'
            plan_path = ROOT / 'plans' / (replacement + '.json')
            p.put(plan_path, plan)
            state = plan['status']
        rows.append({'source_slot': card['source_slot'], 'original_pair_id': original['pair_id'],
                     'replacement_pair_id': replacement, 'original_requested_family': 'Luna',
                     'original_state': 'NOT_RUN_ROUTE_HOLD_IF_SELECTED_FOR_REPLACEMENT',
                     'replacement_family': 'GLM', 'replacement_card': str(card_path),
                     'replacement_card_sha256': p.sha(card_path), 'status': state})
    p.put(ROOT / 'STANDBY_SELECTION.json', {'schema': 'er9.prospective-family-standby.v1',
                                           'status': 'NOT_SELECTED_NO_LAUNCH', 'alternative_slots': len(rows),
                                           'original_target_diagnostic_slots': 32,
                                           'counts_as_additional_comparisons': False,
                                           'originals_preserved': True, 'root_selection_required': True,
                                           'native_starts': 0, 'alternatives': rows})
    p.put(ROOT / 'prepared/LIVE_STANDBY_OUTBOX.json', {'schema': 'er9.diagnostic-registration-outbox.v1',
                                                     'status': 'PREPARED_NOT_SELECTED_NOT_ADMITTED',
                                                     'pairs': len(requests), 'arm_packets': 8,
                                                     'requests': requests, 'native_starts': 0,
                                                     'activation_requires_explicit_root_slot_selection': True,
                                                     'no_simultaneous_original_and_replacement_dispatch': True})
    print(json.dumps({'standby_alternative_slots': len(rows), 'live_pairs_prepared': len(requests),
                      'native_starts': 0, 'root': str(ROOT)}))


if __name__ == '__main__':
    main()
