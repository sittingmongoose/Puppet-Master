"""Append-only root attempt reservations; all old API actions delegate unchanged."""
import argparse
import contextlib
import copy
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import re
import sys

CAMPAIGN = Path('LAB_ROOT')
RECOVERY = CAMPAIGN / 'ops/recovery-v1'
API = CAMPAIGN / 'ops/helper-concurrency-v2/ledger_helper_concurrency_v2.py'
API_SHA = 'eafb75b1a157a5b7e77f03f9fc52e298a7ef255e439730e22c4fde6a95dc0405'
AUTHORITY = RECOVERY / 'ATTEMPT_SUCCESSOR_DEVELOPMENT_AUTHORITY_V1.json'
AUTHORITY_SHA = '64b40261010db33ce32871db4cb42900ae130d5dc02272ac92831594bd9e2f7e'
PROPOSAL = CAMPAIGN / 'dev/tranche-successor-v8/REMAINING_CELLS.json'
PROPOSAL_SHA = 'c4644d8bcacc68a499dc28d790fa584a6892eb508de4d1075656f096ae388585'
FEASIBILITY = CAMPAIGN / 'dev/tranche-successor-v8/SOURCE_FREEZE.json'
FEASIBILITY_SHA = '86b997375679047e3c7fede8df94ecfb3ceaa4e0745485159a6d430dbf1cbe1b'
SPEC = CAMPAIGN / 'dev/tranche-successor-v8/ADDITIVE_ACTION_SPEC.json'
SPEC_SHA = 'b3cdb755dfa15e6116a056a3c0090b4edd9dca45971d5550b589d03b03005228'
DECLARATION = CAMPAIGN / 'dev/attempt-successor-declarations-v1/DECLARATION_CLOSURE.json'
DECLARATION_SHA = 'cb2fb0c8eacf1d3810f204c2f86ed812ee32684cf1924ba3d7c4dfd900778be8'
ACCEPTANCE = RECOVERY / 'ATTEMPT_RESERVATION_SOURCE_ACCEPTANCE_V1.json'
SOURCE = CAMPAIGN / 'ops/attempt-reservation-api-v1/ledger_attempt_reservations_v1.py'
MANIFEST = SOURCE.parent / 'MANIFEST.json'
DEADLINE = 1791013030.8303788
CAPS = {'stage_caps': [1200, 1200, 900], 'case_wall': 3600,
        'case_occupied': 5400, 'outside_native': 300, 'responses': 160}
RECEIPTS = 'attempt_reservation_receipts'
LINEAGE = 'attempt_lineage_by_case'
PINS = {API: API_SHA, AUTHORITY: AUTHORITY_SHA, PROPOSAL: PROPOSAL_SHA,
        FEASIBILITY: FEASIBILITY_SHA, SPEC: SPEC_SHA, DECLARATION: DECLARATION_SHA}


def require(ok, message):
    if not ok:
        raise RuntimeError('HOLD: ' + message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical_sha(value):
    return sha(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode())


def finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def digest(value):
    return isinstance(value, str) and re.fullmatch('[0-9a-f]{64}', value) is not None


def pinned(path, expected):
    path = Path(path)
    require(path.is_absolute() and '..' not in path.parts and digest(expected), 'invalid pin')
    require(not any(p.is_symlink() for p in (path, *path.parents)), 'symlink pin forbidden')
    data = path.read_bytes()
    require(sha(data) == expected, 'pinned bytes changed: ' + str(path))
    return data


def object_bytes(data):
    def unique(items):
        result = {}
        for key, value in items:
            require(key not in result, 'duplicate JSON key')
            result[key] = value
        return result
    def nonfinite(value):
        raise RuntimeError('HOLD: nonfinite JSON')
    result = json.loads(data, object_pairs_hook=unique, parse_constant=nonfinite)
    require(type(result) is dict, 'JSON object required')
    return result


def reference(ref, path):
    require(type(ref) is dict and set(ref) == {'path', 'sha256'} and ref['path'] == str(path), 'exact reference path required')
    return object_bytes(pinned(path, ref['sha256']))


def check_pins():
    for path, expected in PINS.items():
        pinned(path, expected)


check_pins()
# Only fresh isolated module objects; no shared module registration/source rewrite.
spec = importlib.util.spec_from_file_location('er8_attempt_frozen_helper_api', str(API))
base = importlib.util.module_from_spec(spec)
old_bytecode = sys.dont_write_bytecode
try:
    sys.dont_write_bytecode = True
    exec(compile(spec.loader.get_source(spec.name), str(API), 'exec'), base.__dict__)
finally:
    sys.dont_write_bytecode = old_bytecode
legacy = base.legacy
resume_api = base.resume_api


def auth():
    return base.auth()


def validate_state(state):
    base.validate_state(state)


def accounting(state, now=None):
    return base.accounting(state, now)


@contextlib.contextmanager
def transaction():
    with base.transaction() as state:
        yield state


def strings(value):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from strings(child)
    elif isinstance(value, list):
        for child in value:
            yield from strings(child)
    elif isinstance(value, str):
        yield value


def metadata(request, now):
    check_pins()
    authority = object_bytes(pinned(AUTHORITY, AUTHORITY_SHA))
    require(authority['root_authority'] is True and authority['allowed_append_action'] == 'reserve-attempt-successors'
            and authority['case_occupied'] == 5400 and authority['campaign_deadline_epoch'] == DEADLINE,
            'development authority mismatch')
    require(request['development_authority'] == {'path': str(AUTHORITY), 'sha256': AUTHORITY_SHA}, 'exact development authority required')
    require(request['source_freeze'] == {'path': str(FEASIBILITY), 'sha256': FEASIBILITY_SHA}, 'exact feasibility freeze required')
    proposal = object_bytes(pinned(PROPOSAL, PROPOSAL_SHA))
    require(request['predecessor_release'] == proposal['source_v7_release'], 'exact V7 release pin required')
    release = reference(request['predecessor_release'], CAMPAIGN / 'ops/execution-resume-v1/root-production-release-v7.json')
    require(release.get('root_authority') is True and release.get('accepted') is True, 'accepted predecessor release required')
    require(request['declaration_closure'] == {'path': str(DECLARATION), 'sha256': DECLARATION_SHA}, 'exact declaration closure pin required')
    closure = reference(request['declaration_closure'], DECLARATION)
    require(closure.get('schema') == 'pm.er8.attempt-successor-declaration-closure.v1'
            and closure.get('frozen') is True and closure.get('root_authority') is False
            and closure.get('campaign_id') == authority['campaign_id']
            and closure.get('original_start_epoch') == 1790905209
            and closure.get('campaign_deadline_epoch') == DEADLINE and closure.get('caps') == CAPS
            and closure.get('proposal') == {'path': str(PROPOSAL), 'sha256': PROPOSAL_SHA}, 'declaration closure mismatch')
    acceptance = reference(request['source_acceptance'], ACCEPTANCE)
    require(acceptance.get('schema') == 'pm.er8.attempt-reservation-source-acceptance.v1'
            and acceptance.get('root_authority') is True and acceptance.get('accepted') is True
            and acceptance.get('independent_source_review_accepted') is True
            and acceptance.get('declarations_accepted') is True
            and acceptance.get('source') == {'path': str(SOURCE), 'sha256': sha(SOURCE.read_bytes())}
            and acceptance.get('declaration_closure') == request['declaration_closure']
            and acceptance.get('development_authority') == request['development_authority']
            and finite(acceptance.get('accepted_epoch')) and authority['recorded_epoch'] <= acceptance['accepted_epoch'] <= now,
            'exact independent/root source acceptance required')
    require(Path(__file__).absolute() == SOURCE, 'unexpected source path')
    pinned(SOURCE, acceptance['source']['sha256'])
    manifest = reference(acceptance.get('source_manifest'), MANIFEST)
    require(manifest.get('source') == acceptance['source'] and manifest.get('status') == 'SOURCE_READY_REQUIRES_INDEPENDENT_REVIEW', 'source manifest mismatch')
    # Review lives in a declared metadata-only lane, never a candidate/evaluation body.
    review_ref = acceptance.get('independent_review')
    require(type(review_ref) is dict and set(review_ref) == {'path', 'sha256'}, 'independent review pin required')
    review_path = Path(review_ref['path'])
    require(review_path == CAMPAIGN / 'ops/attempt-reservation-review-v1/REVIEW.json', 'exact review metadata path required')
    review = reference(review_ref, review_path)
    require(review.get('schema') == 'pm.er8.attempt-reservation-independent-review.v1'
            and review.get('accepted') is True and review.get('independent') is True
            and review.get('source') == acceptance['source'] and review.get('source_manifest') == acceptance['source_manifest'], 'positive exact independent review required')
    return authority, proposal, release, closure


def validate_pair(pair, proposal_pair, release):
    require(type(pair) is dict and set(pair) == {'logical_pair_id', 'attempt_pair_id', 'common_binding', 'arms'}, 'pair fields mismatch')
    require(pair['logical_pair_id'] == proposal_pair['logical_pair_id'] and
            pair['attempt_pair_id'] == proposal_pair['proposed_pair_attempt_id'], 'pair identity alias forbidden')
    common = pair['common_binding']
    require(type(common) is dict and set(common) == {'route', 'account', 'model', 'pins', 'task_sha256',
            'brief_sha256', 'thin_plan_sha256', 'source_access_sha256', 'scoring_contract_sha256'}, 'common binding fields required')
    require(common['route'] == release['route'] and common['pins'] == release['pins']
            and common['model'] == 'GLM5.3FlashMax' and common['account'] == 'existing-authorized-zcode-account-v8-A', 'unchanged Z route/model/account required')
    require(all(digest(common[k]) for k in ('task_sha256', 'brief_sha256', 'thin_plan_sha256', 'source_access_sha256', 'scoring_contract_sha256')), 'common semantics pins required')
    require(type(pair['arms']) is list and len(pair['arms']) == 2, 'whole two-arm pair required')
    for arm, old in zip(pair['arms'], proposal_pair['arms']):
        require(type(arm) is dict and set(arm) == {'logical_case_id', 'logical_pair_id', 'arm', 'predecessor_attempt_case_id',
                'new_attempt_case_id', 'new_jobs', 'new_final_job', 'evaluator_attempt_id', 'source_manifest', 'method',
                'original_manifest_sha256', 'original_method_sha256'}, 'arm fields mismatch')
        expected = {'logical_case_id': old['logical_case_id'], 'logical_pair_id': old['logical_pair_id'],
                    'arm': old['arm'], 'predecessor_attempt_case_id': old['logical_case_id'],
                    'new_attempt_case_id': old['proposed_attempt_case_id'], 'new_jobs': old['proposed_jobs'],
                    'new_final_job': old['proposed_final_job'], 'evaluator_attempt_id': old['proposed_evaluation_attempt_id'],
                    'original_manifest_sha256': old['original_assigned_sources']['manifest']['sha256'],
                    'original_method_sha256': old['original_assigned_sources']['method_card']['sha256']}
        require(all(arm[k] == value for k, value in expected.items()), 'immutable arm identity/source alias forbidden')
        root = CAMPAIGN / 'cases/attempt-successors-v1/candidates' / arm['new_attempt_case_id']
        # Hash only these declared input bytes; no candidate answers are loaded.
        for key, path in (('source_manifest', root / 'manifest.json'), ('method', root / 'METHOD.md')):
            ref = arm[key]
            require(type(ref) is dict and set(ref) == {'path', 'sha256'} and ref['path'] == str(path), 'exact fresh source pin path required')
            pinned(path, ref['sha256'])
        sources = old['original_assigned_sources']
        require(common['brief_sha256'] == sources['brief']['sha256']
                and common['thin_plan_sha256'] == sources['thin_plan']['sha256']
                and common['source_access_sha256'] == sources['source_access']['sha256'], 'original common source semantics changed')


def quiet(state, arm, ref, now):
    old = arm['predecessor_attempt_case_id']
    path = RECOVERY / ('ATTEMPT_PREDECESSOR_QUIET_' + old + '.json')
    record = reference(ref, path)
    related = {old}
    for case, row in state.get(LINEAGE, {}).items():
        if row.get('logical_case_id') == arm['logical_case_id']:
            related.add(case)
    for case, row in state['cases'].items():
        if row.get('logical_case_id') == arm['logical_case_id']:
            related.add(case)
    jobs = {key: row for key, row in state['jobs'].items() if row['case'] in related}
    require(record.get('schema') == 'pm.er8.attempt-predecessor-quiet.v1' and record.get('root_authority') is True
            and record.get('campaign_id') == state['campaign_id'] and record.get('case_id') == old
            and record.get('ledger_jobs_sha256') == canonical_sha(jobs)
            and finite(record.get('observed_epoch')) and state['clock_start_epoch'] <= record['observed_epoch'] <= now,
            'exact current predecessor quiet record required')
    require(all(record.get(key) is True for key in ('native_quiescent', 'parents_absent', 'actors_absent', 'permits_settled', 'no_v7_scheduler_for_case')), 'positive native/parent/actor/permit settlement required')
    for row in jobs.values():
        q = row.get('quiescence')
        require(finite(row.get('released_epoch')) and row['released_epoch'] <= record['observed_epoch']
                and not row.get('launch_pending') and type(q) is dict and q.get('native_quiescent') is True
                and q.get('own_process_group_absent') is True and q.get('receipt_id'), 'old attempt active or pending or unquiet')
    require(not any(state['reservation_by_case'].get(case, {}).get('completed') is True
                    or state['cases'].get(case, {}).get('completed') is True for case in related), 'completed logical case cannot repeat')


def reserve(state, request):
    require(type(state) is dict and type(request) is dict, 'plain state/request objects required')
    keys = {'receipt_id', 'root_authority', 'development_authority', 'source_acceptance', 'source_freeze',
            'declaration_closure', 'predecessor_release', 'campaign_id', 'original_start_epoch',
            'campaign_deadline_epoch', 'caps', 'pairs', 'predecessor_quiet_records'}
    require(set(request) == keys and request['root_authority'] is True, 'exact root request fields required')
    now = legacy.time.time()
    require(finite(now) and state.get('closed') is False and state['clock_start_epoch'] <= now < DEADLINE
            and request['campaign_id'] == state['campaign_id'] and request['original_start_epoch'] == state['clock_start_epoch']
            and request['campaign_deadline_epoch'] == state['deadline_epoch'] == DEADLINE
            and request['caps'] == CAPS and type(request['original_start_epoch']) in (int, float)
            and not isinstance(request['original_start_epoch'], bool), 'same open finite campaign/caps required')
    authority, proposal, release, closure = metadata(request, now)
    require(state['campaign_id'] == authority['campaign_id'] and state['clock_start_epoch'] == 1790905209, 'original campaign start required')
    limit = auth()['limits']
    require(limit['native_goal_starts'] == 144 and limit['occupied_candidate_slot_seconds'] == 172800
            and limit['candidate_output_warning'] == 1200000 and limit['candidate_output_stop'] == 1500000
            and limit['active_candidates_by_family']['Z'] == 2 and limit['active_helpers'] == 12, 'unchanged envelope required')
    base.validate_receipt(state, required=True)
    require(type(request['receipt_id']) is str and re.fullmatch('[A-Za-z0-9][A-Za-z0-9._-]{0,127}', request['receipt_id']), 'unique immutable receipt id required')
    before_names = set(strings(state))
    require(request['receipt_id'] not in before_names, 'receipt identity collision')
    require(type(request['pairs']) is list and 1 <= len(request['pairs']) <= 6, 'nonempty whole-pair subset required')
    proposed_pairs = {p['logical_pair_id']: p for p in proposal['remaining_logical_pairs']}
    closed_pairs = closure.get('pairs')
    require(type(closed_pairs) is list and len(closed_pairs) == 6, 'full immutable declaration identity map required')
    closure_by_id = {p['logical_pair_id']: p for p in closed_pairs}
    require(len(closure_by_id) == 6 and set(closure_by_id) == set(proposed_pairs), 'declaration map alias/duplicate')
    for pair_id, declared in closure_by_id.items():
        validate_pair(declared, proposed_pairs[pair_id], release)
    selected_ids = [p.get('logical_pair_id') for p in request['pairs'] if type(p) is dict]
    require(len(selected_ids) == len(request['pairs']) == len(set(selected_ids)) and set(selected_ids).issubset(proposed_pairs), 'duplicate/foreign/split pair')
    new_names = [request['receipt_id']]
    arms = []
    for pair in request['pairs']:
        pair_id = pair['logical_pair_id']
        require(pair == closure_by_id[pair_id], 'request must match frozen declaration pair')
        validate_pair(pair, proposed_pairs[pair_id], release)
        new_names.append(pair['attempt_pair_id'])
        for arm in pair['arms']:
            require(arm['logical_case_id'] not in proposal['excluded_v7_queue']
                    and arm['logical_case_id'] not in proposal['excluded_operationally_complete_cases']
                    and arm['logical_case_id'] not in release.get('case_sources', {}), 'V7 scheduled/completed logical case forbidden')
            new_names.extend([arm['new_attempt_case_id'], *arm['new_jobs'], arm['evaluator_attempt_id']])
            arms.append(arm)
    require(len(new_names) == len(set(new_names)) and not before_names.intersection(new_names), 'case/job/final/evaluator/orphan identity collision')
    quiet_refs = request['predecessor_quiet_records']
    require(type(quiet_refs) is dict and set(quiet_refs) == {a['predecessor_attempt_case_id'] for a in arms}, 'exact selected quiet record set required')
    for arm in arms:
        quiet(state, arm, quiet_refs[arm['predecessor_attempt_case_id']], now)
    candidate = copy.deepcopy(state)
    for key in (RECEIPTS, LINEAGE):
        require(key not in candidate or type(candidate[key]) is dict, 'append map type required')
        candidate.setdefault(key, {})
    for pair in request['pairs']:
        for arm in pair['arms']:
            case = arm['new_attempt_case_id']
            candidate['reservation_by_case'][case] = {'native_starts': 3, 'occupied_seconds': 5400,
                                                     'completed': False, 'final_job': case + '-final-correction'}
            candidate[LINEAGE][case] = {**copy.deepcopy(arm), 'attempt_pair_id': pair['attempt_pair_id'],
                'common_binding': copy.deepcopy(pair['common_binding']), 'caps': copy.deepcopy(CAPS),
                'reservation_receipt_id': request['receipt_id'], 'recorded_epoch': now}
            candidate['evaluator_reserved_names'].append(arm['evaluator_attempt_id'])
    totals = accounting(candidate, now)
    require(not totals['candidate_output_stop'], 'current output stop')
    starts = totals['native_goal_starts'] + totals['reserved_or_committed_native_starts']
    occupied = totals['occupied_slot_seconds'] + totals['reserved_or_committed_slot_seconds']
    require(finite(starts) and finite(occupied) and starts <= 144 and occupied <= 172800, 'all old spent and future commitments plus subset exceed envelope')
    receipt = {'schema': 'pm.er8.attempt-reservation-receipt.v1', 'request': copy.deepcopy(request),
               'recorded_epoch': now, 'native_starts_with_commitments': starts,
               'occupied_seconds_with_commitments': occupied,
               'preflight_accounting': copy.deepcopy(totals), 'no_old_commitment_retirement': True}
    candidate[RECEIPTS][request['receipt_id']] = receipt
    base.validate_state(candidate)
    # Existing state values are unchanged except append-only members of these maps/list.
    result = copy.deepcopy(receipt)
    finished = legacy.time.time()
    require(finite(finished) and now <= finished < DEADLINE, 'invalid clock/cutoff during preflight')
    state.update({key: candidate[key] for key in ('reservation_by_case', 'evaluator_reserved_names', RECEIPTS, LINEAGE)})
    return result


def apply(state, action, request):
    base.validate_state(state)
    if action == 'reserve-attempt-successors':
        return reserve(state, request)
    return base.apply(state, action, request)


def admit(state, request, now, component_birth=None):
    return base.admit(state, request, now, component_birth=component_birth)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action')
    parser.add_argument('--request', type=Path)
    args = parser.parse_args()
    request = object_bytes(args.request.read_bytes()) if args.request else {}
    if args.action == 'status':
        state = object_bytes(legacy.STATE.read_bytes())
        result = apply(state, args.action, request)
    else:
        with transaction() as state:
            result = apply(state, args.action, request)
    print(json.dumps(result, indent=2, allow_nan=False))


if __name__ == '__main__':
    main()
