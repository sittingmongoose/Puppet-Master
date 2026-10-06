#!/usr/bin/env python3
"""DEC006 lossless native-byte binding; no model, admission, or semantic assessment."""
import argparse
import hashlib
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import prepare as p
import bind_seeded as old

ROOT = Path(__file__).resolve().parent
LAB = ROOT.parents[2]
CATALOGS = old.CATALOG_ROLES
ALLOWED = {'proposal', 'critique', 'revision', 'enrichment', 'dependencies', *CATALOGS}
AUTHORITY = {'path': str(LAB / 'supervision/DECISIONS-006-evidence.json'),
             'sha256': 'd70fb927f4b47798cdc8f49de6b1d76cc88d4011452d2ba317060f342a7538d0'}


def digest(seed):
    return hashlib.sha256(json.dumps({k: seed[k] for k in
        ('candidate_files', 'public_source_files', 'origin_freezes', 'cold_cost_references')},
        sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def verify(seed):
    if seed.get('schema') != 'er9.authentic-partial-role-base.v2':
        raise ValueError('DEC006 authentic partial-role envelope required')
    if seed.get('base_5file_job_success_claimed') is not False or not seed.get('cold_cost_references'):
        raise ValueError('Preserve partial-role status and original cold costs')
    inventory = {}
    for ref in seed['origin_freezes']:
        freeze = old.checked_json(ref)
        if ref.get('actual_family') not in ('Luna', 'GLM', 'Muse'):
            raise ValueError('Only actual affordable-candidate origins allowed')
        if not ref.get('actual_model') or not ref.get('actual_effort'):
            raise ValueError('Observed family/model/effort required')
        if (freeze.get('operational_complete') is not True or
            freeze.get('native_quiescent') is not True or
            (freeze.get('native_goal_starts') or 0) < 1):
            raise ValueError('Completed quiescent native origin required')
        receipt_ref = ref.get('native_receipt', freeze.get('native_receipt'))
        receipt = old.checked_json(receipt_ref)
        if receipt.get('goal_activated') is not True:
            raise ValueError('Native Goal activation proof required')
        for item in freeze['artifacts']:
            path = str(p.regular(item['path']))
            if p.sha(path) != item['sha256']:
                raise ValueError('Frozen native artifact drift')
            inventory[(freeze['job_id'], path)] = item['sha256']
    if set(seed['candidate_files']) - ALLOWED:
        raise ValueError('Unknown role/evaluator answer payload denied')
    if not {'proposal', *CATALOGS} <= set(seed['candidate_files']):
        raise ValueError('Four authentic base roles required')
    for role, item in seed['candidate_files'].items():
        path = str(p.regular(item['path']))
        if inventory.get((item['origin_job_id'], path)) != item['sha256'] or p.sha(path) != item['sha256']:
            raise ValueError('Role lacks exact native byte provenance: ' + role)
    if not seed['public_source_files']:
        raise ValueError('Actual captured public source context required')
    for item in seed['public_source_files']:
        path = p.regular(item['path'])
        if (item.get('kind') != 'PUBLIC_CAPTURE' or 'public_captures' not in path.parts or
            {'host-private', 'private-runtime', 'sealed', 'evaluation', 'evaluator'} & set(path.parts)):
            raise ValueError('Only provenance-bound public captures admitted')
        if p.sha(path) != item['sha256']:
            raise ValueError('Public captured bytes changed')
        receipt = old.checked_json(item['capture_receipt'])
        if receipt.get('body_sha256') != item['sha256']:
            raise ValueError('Public capture receipt/body mismatch')
        if item['url'] not in {receipt.get(k) for k in ('url', 'requested_url', 'actual_url')}:
            raise ValueError('Capture URL provenance mismatch')
        original = receipt['original_capture_body']
        if p.sha(p.regular(original['path'])) != original['sha256'] or original['sha256'] != item['sha256']:
            raise ValueError('Lossless original source bytes required')
        metadata = old.checked_json(receipt['original_capture_metadata'])
        event = receipt['actual_origin_goal_event']
        if p.sha(p.regular(event['path'])) != event['sha256']:
            raise ValueError('Capture origin-event drift')
        row = json.loads(Path(event['path']).read_text().splitlines()[event['jsonl_line'] - 1])
        observed = row.get('source_evidence', {})
        if (row.get('tool') != 'public_https_get' or observed.get('sha256') != item['sha256'] or
            observed.get('capture_id') != item['origin_capture_id'] or
            event['job_id'] != item['origin_job_id'] or metadata.get('sha256') != item['sha256']):
            raise ValueError('Source must be tied to an actual origin Goal retrieval')
    # Source grades and private facet maps are deliberately neither read nor copied.


def source_copies(seed):
    copies = {}; index = []
    for i, item in enumerate(seed['public_source_files']):
        name = 'source_context/' + str(i).zfill(4) + '.body'
        copies[name] = p.regular(item['path'])
        index.append({'candidate_path': 'inputs/' + name, 'url': item['url'],
                      'version_or_commit': item['version_or_commit'], 'sha256': item['sha256'],
                      'capture_id': item['origin_capture_id'],
                      'capture_limitations': item.get('capture_limitations')})
    return copies, index


def scope(card, arm, step, amendment):
    body = old.stage_instruction(card['method_id'], arm, step['stage'], step['required_artifacts'], amendment)
    body += '\n\n# Current native stage scope\n\n'
    body += ('Perform only this declared stage, using the full brief and the exact admitted input inventory. '
             'Do not wait for an unspecified later researcher, critic, or author. The required paths above '
             'are this stage\'s deliverables and override other role-path examples in the common contract. '
             'Full useful content and source qualifications remain required. Native delivery completion '
             'and independent semantic qualification are separate. Preserve unresolved limitations honestly. ')
    if step['pipeline_final']:
        body += ('You are the designated author for this current diagnostic output. Deliver all required '
                 'out/final files as a standalone current proposal and catalogs within the original stage budget. ')
    if step['stage'] in ('critic_and_final', 'critic_final'):
        body += ('In this one Goal perform both critique and final authorship; review.md is optional. ')
    return body


def bind(plan_ref, seed_ref, arm, stage, predecessors, destination):
    p.design_pins(LAB); old.checked_json(AUTHORITY)
    plan = old.checked_json(plan_ref); seed = old.checked_json(seed_ref); verify(seed)
    if plan.get('schema') != 'er9.actual-card-role-dag.v2':
        raise ValueError('Prospective actual-card role DAG required')
    card_ref = {'path': plan['card_path'], 'sha256': plan['card_sha256']}
    card = old.checked_json(card_ref)
    if card['domain'] != seed['domain']:
        raise ValueError('Cross-domain seed import denied')
    step = next(x for x in plan['stage_jobs'] if x['arm'] == arm and x['stage'] == stage)
    if not step.get('native_goal'):
        raise ValueError('Exact assembly is a separate mechanical operation')
    copies = old.predecessor_sources(step, predecessors, plan['pair_id'], arm)
    roles = step['seed_input_policy']['candidate_roles'][:]
    if roles: roles += list(CATALOGS)
    roles = list(dict.fromkeys(roles))
    for role in roles:
        if role not in seed['candidate_files']:
            raise ValueError('Genuine required candidate role absent: ' + role)
        original = p.regular(seed['candidate_files'][role]['path'])
        copies['seed/' + role + original.suffix] = original
    raw, index = source_copies(seed); copies.update(raw)
    pair_path = destination / plan['pair_id'] / 'PAIR_SOURCE_FREEZE.json'
    pair = {'schema': 'er9.diagnostic-pair-source-freeze.v2', 'pair_id': plan['pair_id'],
            'source_slot': plan['source_slot'], 'status': 'INPUTS_FROZEN_NOT_ADMITTED',
            'card_ref': card_ref, 'corrected_dag_ref': plan_ref, 'authority_ref': AUTHORITY,
            'seed_manifest': seed_ref, 'seed_content_digest': digest(seed),
            'requested_family': card['requested_family'], 'requested_model': card['requested_model'],
            'requested_effort': card['requested_effort'], 'allocation': card['allocation'],
            'cold_cost_references': seed['cold_cost_references'], 'source_index': index,
            'designated_final': card['candidate_artifacts'], 'admission_seal_required': True,
            'fixture_suitability': 'UNASSESSED_PER_FACET; absent facets are not tested coverage',
            'source_selection': 'All origin-Goal captures, without quality or semantic filtering',
            'created_utc': p.now()}
    if pair_path.exists():
        prior = json.loads(pair_path.read_text())
        for field in ('seed_content_digest', 'card_ref', 'corrected_dag_ref', 'authority_ref'):
            if prior[field] != pair[field]:
                raise ValueError('Frozen pair inputs changed; new prospective identity required')
    else: p.put(pair_path, pair)
    index_path = pair_path.parent / 'SOURCE_INDEX.json'
    index_data = {'schema': 'er9.candidate-source-index.v1', 'sources': index}
    if index_path.exists():
        if json.loads(index_path.read_text()) != index_data: raise ValueError('Source index drift')
    else: p.put(index_path, index_data)
    copies['source_context/index.json'] = index_path
    definition = {'stage': stage, 'max_native_seconds': step['max_seconds'],
                  'max_parent_responses': step['max_responses'] if card['requested_family'] == 'Luna' else step['requested_parent_response_cap']}
    job = p.stage_packet(LAB, destination, card, Path(card_ref['path']), arm, step['stage_index'],
                         definition, {'path': str(pair_path), 'sha256': p.sha(pair_path)},
                         sources=copies, extra_instruction=scope(card, arm, step, plan.get('brief_amendment')),
                         required=step['required_artifacts'], prerequisites=step['prerequisite_job_ids'])
    run = Path(job['stage_json']).parent
    p.put(run / 'EXPOSURE_PREPARATION.json', {
        'schema': 'er9.mechanical-input-exposure-preparation.v2', 'pair_id': plan['pair_id'],
        'arm': arm, 'stage': stage, 'seed_ref': seed_ref, 'candidate_roles_supplied': roles,
        'candidate_roles_withheld': sorted(ALLOWED - set(roles)),
        'predecessor_job_ids_supplied': list(predecessors), 'raw_public_sources': len(index),
        'executed_candidate_exposure': False, 'new_native_starts': 0,
        'private_admission_or_evaluator_answer_copied': False, 'semantic_quality': 'NOT_ASSESSED'})
    return p.registration(destination, Path(card_ref['path']), card, [job],
                          request_suffix=arm + '-' + stage + '-dec006-r002')


def prepare_initial():
    outbox = json.loads((ROOT / 'CORRECTED_DAG_OUTBOX.json').read_text()); requests = []
    for ref in outbox['base_only_pairs']:
        plan = old.checked_json(ref)
        for step in plan['stage_jobs']:
            if step.get('native_goal') and not step['prerequisite_job_ids']:
                requests.append(bind(ref, plan['base_seed_ref'], step['arm'], step['stage'], {}, ROOT / 'prepared'))
        # Deliver an incremental, pair-ready outbox before processing the remaining queue.
        selected = [x for x in requests if json.loads(Path(x['path']).read_text())['pair_id'] == plan['pair_id']]
        p.put(ROOT / 'incremental-outboxes' / (plan['pair_id'] + '.json'), {
            'schema': 'er9.diagnostic-registration-outbox.v2', 'pair_id': plan['pair_id'],
            'requests': selected, 'new_native_starts': 0, 'status': 'PREPARED_NOT_ADMITTED'})
    p.put(ROOT / 'INITIAL_REGISTRATION_OUTBOX.json', {
        'schema': 'er9.diagnostic-registration-outbox.v2', 'prepared_pairs': len(outbox['base_only_pairs']),
        'prepared_native_stage_packets': len(requests), 'requests': requests, 'new_native_starts': 0,
        'status': 'PREPARED_NOT_ADMITTED', 'private_facet_suitability': 'UNASSESSED',
        'ordinary_required_roles': 'Authentic proposal and complete original catalogs/context',
        'later_stages': 'Use bind_imported.py with exact same-arm native output freezes; no parallel peer exposure before resolver.'})
    print(json.dumps({'pairs': len(outbox['base_only_pairs']), 'initial_stage_packets': len(requests),
                      'outbox': str(ROOT / 'INITIAL_REGISTRATION_OUTBOX.json'), 'new_native_starts': 0}))


def main():
    a = argparse.ArgumentParser(description=__doc__); a.add_argument('--prepare-initial', action='store_true')
    a.add_argument('--plan', type=Path); a.add_argument('--plan-sha256'); a.add_argument('--seed-manifest', type=Path)
    a.add_argument('--seed-sha256'); a.add_argument('--arm', choices=['control','treatment']); a.add_argument('--stage')
    a.add_argument('--predecessor-map', type=Path); a.add_argument('--destination', type=Path)
    x = a.parse_args()
    if x.prepare_initial: prepare_initial(); return
    predecessors = json.loads(x.predecessor_map.read_text()) if x.predecessor_map else {}
    print(json.dumps(bind({'path': str(x.plan.absolute()), 'sha256': x.plan_sha256},
                         {'path': str(x.seed_manifest.absolute()), 'sha256': x.seed_sha256},
                         x.arm, x.stage, predecessors, x.destination.absolute())))


if __name__ == '__main__': main()
