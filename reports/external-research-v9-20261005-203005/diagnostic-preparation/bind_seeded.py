#!/usr/bin/env python3
"""Bind legitimate frozen candidate/public-source bytes into one DAG stage; never launch."""
import argparse
import json
from pathlib import Path
import prepare as p

HERE = Path(__file__).resolve().parent
CATALOG_ROLES = ('source_catalog', 'witness_catalog', 'lead_inventory')


def checked_json(ref):
    path = p.regular(ref['path'])
    if p.sha(path) != ref['sha256']:
        raise ValueError('Frozen input/receipt pin mismatch: ' + str(path))
    return json.loads(path.read_text())


def content_digest(seed):
    import hashlib
    body = {'candidate_files': seed['candidate_files'],
            'public_source_files': seed['public_source_files'],
            'origin_freezes': seed['origin_freezes']}
    return hashlib.sha256(json.dumps(body, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def verify_seed(seed, pair, slot):
    if seed.get('schema') != 'er9.authentic-candidate-seed.v1':
        raise ValueError('Authentic seed contract required')
    if not seed.get('cold_cost_references'):
        raise ValueError('Cold candidate seed costs/provenance must be charged separately')
    origins = {}
    inventory = {}
    for ref in seed['origin_freezes']:
        freeze = checked_json(ref)
        if freeze.get('operational_complete') is not True or (freeze.get('native_goal_starts') or 0) < 1:
            raise ValueError('Seed requires an actual completed native candidate output freeze')
        if ref.get('actual_family') not in ('Luna', 'GLM', 'Muse'):
            raise ValueError('Sol-authored seed or unsupported candidate family denied')
        if not ref.get('actual_model') or not ref.get('actual_effort'):
            raise ValueError('Observed candidate identity must be recorded')
        origins[freeze['job_id']] = ref
        for item in freeze['artifacts']:
            path = str(p.regular(item['path']))
            if p.sha(path) != item['sha256']:
                raise ValueError('Actual native seed artifact changed')
            inventory[(freeze['job_id'], path)] = item['sha256']
    allowed = {'proposal', 'critique', 'revision', 'enrichment', 'dependencies', *CATALOG_ROLES}
    if set(seed['candidate_files']) - allowed:
        raise ValueError('Only declared candidate proposal/context roles may be bound; no evaluator answer role')
    for role, item in seed['candidate_files'].items():
        path = str(p.regular(item['path']))
        if inventory.get((item['origin_job_id'], path)) != item['sha256'] or p.sha(path) != item['sha256']:
            raise ValueError('Candidate role lacks exact actual native-output provenance: ' + role)
    if not seed['public_source_files']:
        raise ValueError('Full governing public source context required')
    for item in seed['public_source_files']:
        if item.get('kind') != 'PUBLIC_PRIMARY_CAPTURE' or not item.get('url') or not item.get('version_or_commit'):
            raise ValueError('Public primary source URL/version/commit identity required')
        path = p.regular(item['path'])
        if 'public_captures' not in path.parts or {'host-private', 'private-runtime', 'sealed', 'evaluation', 'evaluator'} & set(path.parts):
            raise ValueError('Public sources must come from admitted public_captures, never private/evaluator stores')
        if p.sha(path) != item['sha256']:
            raise ValueError('Frozen public capture changed')
        capture = checked_json(item['capture_receipt'])
        if capture.get('body_sha256', capture.get('sha256')) != item['sha256']:
            raise ValueError('Capture receipt does not bind these public bytes')
        urls = {capture.get(k) for k in ('url', 'requested_url', 'source_url', 'final_url')}
        if item['url'] not in urls:
            raise ValueError('Capture receipt does not bind source URL')
    admission = checked_json(seed['fixture_admission_receipt'])
    if admission.get('status') != 'SUITABLE_FROZEN_INPUT' or not ({pair, slot} & set(admission.get('pair_ids', []))):
        raise ValueError('This target diagnostic lacks private fixture suitability admission')
    if admission.get('input_content_digest') != content_digest(seed):
        raise ValueError('Fixture suitability applies to different input bytes')
    # Admission and origin receipts remain host-only. They are never copied to candidate.
    return origins


def predecessor_sources(step, refs, pair, arm):
    if set(refs) != set(step['prerequisite_job_ids']):
        raise ValueError('Exact declared same-arm prerequisites required; no unlisted peer output')
    copies = {}
    for job_id, ref in refs.items():
        freeze = checked_json(ref)
        if freeze.get('job_id') != job_id or freeze.get('pair_id') != pair or freeze.get('arm') != arm:
            raise ValueError('Predecessor identity/arm mismatch')
        if freeze.get('operational_complete') is not True:
            raise ValueError('Incomplete predecessor cannot release next stage')
        for item in freeze['artifacts']:
            original = p.regular(item['path'])
            if p.sha(original) != item['sha256']:
                raise ValueError('Frozen predecessor drift')
            rel = Path(item['relative_path'])
            if rel.is_absolute() or '..' in rel.parts:
                raise ValueError('Predecessor artifact path traversal')
            copies['prior/' + job_id + '/' + rel.as_posix()] = original
    return copies


def stage_instruction(method, arm, stage, required, amendment=None):
    text = ['# Exact stage output override\n',
            'For this stage only, these paths override the common final-path instructions:\n' + '\n'.join('- ' + x for x in required)]
    if stage.endswith('_record'):
        text.append('Record what the full supplied source context supports for the neutral question at out/evidence/record.md. Do not author the final proposal in this phase. The next phase is a fresh Goal and receives your immutable record.')
        if stage == 'source_first_record':
            text.append('The proposal is deliberately absent. Do not obtain it through another namespace or infer evaluator truth labels. Work only from the neutral brief/question and full raw public-source context.')
    elif stage == 'flash_check':
        text.append('Check the supplied draft/critique/revision for added or changed consequential claims and affected dependencies. Preserve good changes and write actionable scoped evidence at out/flash/review.md. Do not claim an uncharged full review or write the designated final in this stage.')
    elif stage in ('critic', 'whole_critic'):
        text.append('Write a complete useful source/coverage/derivation review at the required critique path. Preserve supported findings and identify consequential corrections with affected dependencies. This review is not the designated final proposal.')
    elif stage == 'source_critic':
        text.append('This fresh critic focuses on source interpretation/version/conditions/applicability and also checks cross-boundary assumptions with implementation consequences. You have the whole brief/proposal; do not omit coverage seams. You cannot inspect the other parallel critic before your freeze.')
    elif stage == 'implementation_critic':
        text.append('This fresh critic focuses on implementation branches/derivation/witness behavior and also checks source applicability at the seam. You have the whole brief/proposal; do not omit coverage seams. You cannot inspect the other parallel critic before your freeze.')
    elif stage == 'resolve_final':
        text.append('Read all exact declared frozen same-arm predecessor reviews and full supplied seed/source context. Resolve on evidence, never by model-majority vote. Deliver one standalone complete current proposal and catalogs. All interpretation/repair/code remain your affordable-candidate work.')
    if method == 'V06' and arm == 'treatment':
        text.append('Write a strict unified diff against the frozen supplied proposal to out/amendment.diff, with only proposal.md as file target. Change supported disputed content and affected dependencies. Preserve independent supported meaning. The host will apply the text exactly with zero fuzz; it will not supply semantic repair. Also provide current source/witness/lead catalogs at their required paths. Do not claim assembled final completion yourself.')
    if amendment:
        text.append('# Frozen current brief amendment\n\n' + amendment + '\n\nThis same amendment and identical authentic cold seed are supplied to both arms. Preserve cold/warm scope and actual reuse costs.')
    return '\n\n'.join(text)


def bind(lab, plan_ref, seed_ref, arm, stage, predecessor_refs, destination):
    p.design_pins(lab)
    plan = checked_json(plan_ref)
    seed = checked_json(seed_ref)
    verify_seed(seed, plan['pair_id'], plan['source_slot'])
    card_path = p.regular(plan['card_path'])
    if p.sha(card_path) != plan['card_sha256']:
        raise ValueError('Frozen card changed')
    card = json.loads(card_path.read_text())
    step = next(x for x in plan['stage_jobs'] if x['arm'] == arm and x['stage'] == stage)
    if step.get('native_goal') is not True:
        raise ValueError('Generic exact assembly is a separate host operation, never a native Goal')
    copies = predecessor_sources(step, predecessor_refs, plan['pair_id'], arm)
    policy = step['seed_input_policy']
    roles = policy['candidate_roles'][:]
    if roles:
        roles += list(CATALOG_ROLES)
    for role in dict.fromkeys(roles):
        if role not in seed['candidate_files']:
            raise ValueError('Missing full seed context role: ' + role)
        copies['seed/' + role + Path(seed['candidate_files'][role]['path']).suffix] = p.regular(seed['candidate_files'][role]['path'])
    source_index = []
    for i, item in enumerate(seed['public_source_files']):
        name = 'source_context/' + str(i).zfill(4) + Path(item['path']).suffix
        copies[name] = p.regular(item['path'])
        source_index.append({'candidate_path': 'inputs/' + name, 'url': item['url'],
                             'version_or_commit': item['version_or_commit'],
                             'sha256': item['sha256'], 'locator': item.get('locator'),
                             'capture_limitations': item.get('capture_limitations')})
    # Pair source closure freezes before any arm output. Later packets refer to these exact bytes.
    pair_path = destination / plan['pair_id'] / 'PAIR_SOURCE_FREEZE.json'
    pair_data = {'schema': 'er9.diagnostic-pair-source-freeze.v1',
                 'pair_id': plan['pair_id'], 'source_slot': plan['source_slot'],
                 'status': 'INPUTS_FROZEN_NOT_ADMITTED', 'card_path': str(card_path),
                 'card_sha256': p.sha(card_path), 'seed_manifest': seed_ref,
                 'seed_content_digest': content_digest(seed),
                 'requested_family': card['requested_family'], 'requested_model': card['requested_model'],
                 'requested_effort': card['requested_effort'], 'allocation': card['allocation'],
                 'cold_cost_references': seed['cold_cost_references'],
                 'source_index': source_index, 'admission_seal_required': True,
                 'proposal_exposure': 'Per-stage whitelist; source-first phase includes no candidate proposal/critique/revision/dependency text.',
                 'created_utc': p.now()}
    if pair_path.exists():
        old = json.loads(pair_path.read_text())
        if old['seed_content_digest'] != pair_data['seed_content_digest'] or old['card_sha256'] != pair_data['card_sha256']:
            raise ValueError('Pair seed source closure changed; require new prospective comparison identity')
    else:
        p.put(pair_path, pair_data)
    freeze = {'path': str(pair_path), 'sha256': p.sha(pair_path)}
    definition = {'stage': stage, 'max_native_seconds': step['max_seconds'],
                  'max_parent_responses': step['requested_parent_response_cap']}
    source_index_path = pair_path.parent / 'SOURCE_INDEX.json'
    if source_index_path.exists():
        if json.loads(source_index_path.read_text()) != {'schema': 'er9.candidate-source-index.v1', 'sources': source_index}:
            raise ValueError('Frozen source navigational index changed')
    else:
        p.put(source_index_path, {'schema': 'er9.candidate-source-index.v1', 'sources': source_index})
    copies['source_context/index.json'] = source_index_path
    instruction = stage_instruction(card['method_id'], arm, stage, step['required_artifacts'], plan.get('brief_amendment'))
    job = p.stage_packet(lab, destination, card, card_path, arm, step['stage_index'],
                         definition, freeze, sources=copies, extra_instruction=instruction,
                         required=step['required_artifacts'], prerequisites=step['prerequisite_job_ids'])
    run = Path(job['stage_json']).parent
    p.put(run / 'SOURCE_INDEX.json', {'schema': 'er9.candidate-source-index.v1', 'sources': source_index})
    # HOST only source/provenance index is not a premium semantic summary. A future binder may copy
    # its exact neutral URL/version/locator subset; no suitability/answer map is exposed.
    p.put(run / 'EXPOSURE_RECEIPT.json', {'schema': 'er9.mechanical-input-exposure.v1',
                                        'pair_id': plan['pair_id'], 'arm': arm, 'stage': stage,
                                        'candidate_roles_supplied': list(dict.fromkeys(roles)),
                                        'candidate_roles_withheld': policy['withheld_roles'],
                                        'predecessor_job_ids_supplied': list(predecessor_refs),
                                        'raw_public_sources': len(source_index),
                                        'fixture_admission_receipt_copied': False,
                                        'source_meaning_verified_by_host': False,
                                        'semantic_quality': 'NOT_ASSESSED'})
    return p.registration(destination, card_path, card, [job], request_suffix=arm + '-' + stage + '-r001')


def main():
    a = argparse.ArgumentParser(description=__doc__)
    a.add_argument('--lab', type=Path, required=True)
    a.add_argument('--plan', type=Path, required=True)
    a.add_argument('--plan-sha256', required=True)
    a.add_argument('--seed-manifest', type=Path, required=True)
    a.add_argument('--seed-sha256', required=True)
    a.add_argument('--arm', choices=['control', 'treatment'], required=True)
    a.add_argument('--stage', required=True)
    a.add_argument('--predecessor-map', type=Path)
    a.add_argument('--destination', type=Path, required=True)
    x = a.parse_args()
    refs = json.loads(x.predecessor_map.read_text()) if x.predecessor_map else {}
    result = bind(x.lab.absolute(), {'path': str(x.plan.absolute()), 'sha256': x.plan_sha256},
                  {'path': str(x.seed_manifest.absolute()), 'sha256': x.seed_sha256},
                  x.arm, x.stage, refs, x.destination.absolute())
    print(json.dumps(result))


if __name__ == '__main__':
    main()
