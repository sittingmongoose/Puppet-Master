"""Prospective root output guard; imports/status read only, installation explicit.

All inherited actions and resource checks remain on isolated frozen modules.
Original auth remains original. Only the legacy output guard uses the selected
threshold within a call with a validated installed receipt. No native imports.
"""
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
HERE = CAMPAIGN / 'ops/output-guard-api-v1'
API = CAMPAIGN / 'ops/attempt-reservation-api-v1/ledger_attempt_reservations_v1.py'
API_SHA = '9bd4b17fe406cd20680c0c8eef16f96a6a45db727d977f1ba2cc42641c82d577'
AUTHORITY = CAMPAIGN / 'ops/recovery-v1/OUTPUT_GUARD_ROOT_AUTHORITY_V1.json'
AUTHORITY_SHA = '2f25c97b0cd79aa3f9b302479fab78f7828d92772271bdf7fe4b3811c7147507'
ACCEPTANCE = CAMPAIGN / 'ops/recovery-v1/OUTPUT_GUARD_SOURCE_ACCEPTANCE_V1.json'
REVIEW = CAMPAIGN / 'ops/output-guard-review-v1/REVIEW.json'
QUIET = CAMPAIGN / 'ops/recovery-v1/OUTPUT_GUARD_CURRENT_QUIET_V1.json'
SOURCE = HERE / 'ledger_output_guard_v1.py'
MANIFEST = HERE / 'MANIFEST.json'
RECEIPT_KEY = 'output_guard_authority_v1'
START = 1790905209
DEADLINE = 1791013030.8303788
WARNING = 1200000
OLD_STOP = 1500000
STOP = 2000000
VERSION = 'prospective-output-guard-v1'


def require(ok, message):
    if not ok:
        raise RuntimeError('HOLD: ' + message)


def finite(value):
    return type(value) in (int, float) and math.isfinite(value)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical_sha(value):
    return sha(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode())


def pinned(path, digest):
    path = Path(path)
    require(path.is_absolute() and '..' not in path.parts and type(digest) is str
            and re.fullmatch('[0-9a-f]{64}', digest), 'exact absolute pin required')
    require(not any(p.is_symlink() for p in (path, *path.parents)), 'symlink pin forbidden')
    data = path.read_bytes()
    require(sha(data) == digest, 'pinned bytes changed: ' + str(path))
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
    pinned(API, API_SHA)
    pinned(AUTHORITY, AUTHORITY_SHA)


check_pins()
spec = importlib.util.spec_from_file_location('er8_output_guard_frozen_attempt', str(API))
base = importlib.util.module_from_spec(spec)
old_bytecode = sys.dont_write_bytecode
try:
    sys.dont_write_bytecode = True
    exec(compile(spec.loader.get_source(spec.name), str(API), 'exec'), base.__dict__)
finally:
    sys.dont_write_bytecode = old_bytecode
legacy = base.legacy
resume_api = base.resume_api
saved_accounting = base.accounting
saved_legacy_auth = legacy.auth


def auth():
    """Keep original accepted envelope, including original output threshold."""
    return base.auth()


def authority():
    check_pins()
    a = object_bytes(pinned(AUTHORITY, AUTHORITY_SHA))
    require(a.get('schema') == 'pm.er8.prospective-output-guard-root-authority.v1'
            and a.get('root_authority') is True and a.get('campaign_id') == CAMPAIGN.name
            and finite(a.get('selected_epoch')) and START <= a['selected_epoch'] < DEADLINE
            and type(a.get('new_warning')) is int and a['new_warning'] == WARNING
            and type(a.get('new_stop')) is int and a['new_stop'] == STOP
            and a.get('prior_warning') == WARNING and a.get('prior_stop') == OLD_STOP,
            'exact finite prospective root authority required')
    limits = auth()['limits']
    require(limits['candidate_output_warning'] == WARNING and limits['candidate_output_stop'] == OLD_STOP
            and limits['native_goal_starts'] == 144 and limits['occupied_candidate_slot_seconds'] == 172800
            and limits['active_helpers'] == 12 and limits['active_candidates_by_family'] == {'M': 2, 'Z': 2, 'L': 2},
            'unchanged original global envelope required')
    require(a['governing_user_envelope']['original_start_epoch'] == START
            and a['governing_user_envelope']['deadline_epoch'] == DEADLINE, 'original authority clock required')
    return a


def source_acceptance(ref, now):
    accepted = reference(ref, ACCEPTANCE)
    source_ref = {'path': str(SOURCE), 'sha256': sha(SOURCE.read_bytes())}
    require(Path(__file__).absolute() == SOURCE, 'unexpected wrapper source path')
    require(accepted.get('schema') == 'pm.er8.output-guard-source-acceptance.v1'
            and accepted.get('root_authority') is True and accepted.get('accepted') is True
            and accepted.get('independent_source_review_accepted') is True
            and accepted.get('source') == source_ref
            and accepted.get('authority') == {'path': str(AUTHORITY), 'sha256': AUTHORITY_SHA}
            and finite(accepted.get('accepted_epoch'))
            and authority()['selected_epoch'] <= accepted['accepted_epoch'] <= now,
            'exact independent/root source acceptance required')
    manifest = reference(accepted.get('source_manifest'), MANIFEST)
    require(manifest.get('source') == source_ref and manifest.get('status') == 'SOURCE_READY_REQUIRES_INDEPENDENT_REVIEW'
            and manifest.get('authority') == accepted['authority'], 'source manifest mismatch')
    review = reference(accepted.get('independent_review'), REVIEW)
    require(review.get('schema') == 'pm.er8.output-guard-independent-review.v1'
            and review.get('accepted') is True and review.get('independent') is True
            and review.get('source') == source_ref
            and review.get('source_manifest') == accepted['source_manifest']
            and review.get('authority') == accepted['authority'], 'positive exact independent review required')
    return accepted


def validate_receipt(state, required=False, now=None):
    a = authority()
    if RECEIPT_KEY not in state:
        require(not required, 'installed output guard receipt required')
        return None
    r = state[RECEIPT_KEY]
    now = legacy.time.time() if now is None else now
    keys = {'schema', 'receipt_id', 'root_authority', 'authority', 'source_acceptance', 'current_quiet',
            'effective_epoch', 'previous_warning', 'previous_stop', 'warning', 'stop', 'version',
            'preinstall_state_sha256', 'preinstall_case_ids', 'preinstall_job_ids', 'preflight_accounting'}
    require(type(r) is dict and set(r) == keys
            and r.get('schema') == 'pm.er8.output-guard-install-receipt.v1'
            and r.get('root_authority') is True
            and r.get('authority') == {'path': str(AUTHORITY), 'sha256': AUTHORITY_SHA}
            and finite(now) and finite(r.get('effective_epoch'))
            and a['selected_epoch'] <= r['effective_epoch'] <= now and r['effective_epoch'] < DEADLINE
            and type(r.get('warning')) is int and r['warning'] == WARNING
            and type(r.get('stop')) is int and r['stop'] == STOP
            and r.get('previous_warning') == WARNING and r.get('previous_stop') == OLD_STOP
            and r.get('version') == VERSION and type(r.get('receipt_id')) is str
            and re.fullmatch('[A-Za-z0-9][A-Za-z0-9._-]{0,127}', r['receipt_id']), 'invalid installed output guard receipt')
    for key in ('preinstall_case_ids', 'preinstall_job_ids'):
        ids = r[key]
        require(type(ids) is list and all(type(x) is str for x in ids) and ids == sorted(set(ids)), 'immutable preinstall identity set required')
    source_acceptance(r['source_acceptance'], r['effective_epoch'])
    q = reference(r['current_quiet'], QUIET)
    require(q.get('ledger_state_sha256') == r['preinstall_state_sha256'], 'installed quiet state pin mismatch')
    validate_quiet(q, state, r['effective_epoch'], inspect_current=False)
    before = r['preflight_accounting']
    require(type(before) is dict and before.get('active_jobs') == [] and before.get('pending_start_permits') == 0,
            'installed quiet accounting required')
    return r


def validate_state(state):
    base.validate_state(state)
    require(finite(state.get('clock_start_epoch')) and state['clock_start_epoch'] == START
            and finite(state.get('deadline_epoch')) and state['deadline_epoch'] == DEADLINE,
            'original finite campaign clock required')
    validate_receipt(state)


def flags(result, receipt):
    if type(result) is not dict or 'generated_output_tokens_lower_bound' not in result:
        return result
    result = copy.deepcopy(result)
    lb = result['generated_output_tokens_lower_bound']
    require(type(lb) is int and lb >= 0, 'finite monotonic cumulative output lower bound required')
    stop = STOP if receipt else OLD_STOP
    result.update(candidate_output_warning=lb >= WARNING, candidate_output_stop=lb >= stop,
                  output_guard_version=VERSION if receipt else 'original-output-guard',
                  candidate_output_warning_threshold=WARNING, candidate_output_stop_threshold=stop,
                  output_guard_effective_epoch=receipt['effective_epoch'] if receipt else None)
    return result


def accounting(state, now=None):
    base.validate_state(state)
    receipt = validate_receipt(state, now=now)
    return flags(saved_accounting(state, now), receipt)


# Isolated globals only. Captured frozen accounting function is never rewritten.
base.accounting = accounting
legacy.accounting = accounting


@contextlib.contextmanager
def selected_guard(state, now=None):
    receipt = validate_receipt(state, now=now)
    prior = legacy.auth
    if receipt:
        def selected_auth():
            result = copy.deepcopy(saved_legacy_auth())
            result['limits']['candidate_output_stop'] = STOP
            return result
        legacy.auth = selected_auth
    try:
        yield receipt
    finally:
        legacy.auth = prior


@contextlib.contextmanager
def transaction():
    with base.transaction() as state:
        validate_state(state)
        yield state
        validate_state(state)


def validate_quiet(q, state, now, inspect_current=True):
    require(q.get('schema') == 'pm.er8.output-guard-current-quiet.v1'
            and q.get('root_authority') is True and q.get('campaign_id') == state['campaign_id']
            and finite(q.get('observed_epoch')) and 0 <= now - q['observed_epoch'] <= 60
            and q.get('scope') == 'all-candidate-admission-operator-execution-owned-groups'
            and all(q.get(k) is True for k in ('scheduler_absent', 'native_quiescent', 'parents_absent', 'actors_absent', 'permits_settled',
                'native_enrollment_receipts_verified', 'held_process_group_receipts_verified')),
            'positive exact current root quiet required')
    if inspect_current:
        require(q.get('ledger_state_sha256') == canonical_sha(state), 'quiet observation does not bind current ledger state')
        require(all(row.get('released_epoch') is not None and not row.get('launch_pending') for row in state['jobs'].values()),
                'active jobs or pending permits at installation')


def install(state, request):
    require(type(request) is dict and set(request) == {'receipt_id', 'root_authority', 'authority', 'source_acceptance',
            'current_quiet', 'campaign_id', 'original_start_epoch', 'campaign_deadline_epoch', 'new_warning', 'new_stop'}
            and request['root_authority'] is True, 'exact explicit root install request required')
    require(RECEIPT_KEY not in state, 'output guard amendment already installed')
    now = legacy.time.time()
    a = authority()
    require(finite(now) and a['selected_epoch'] <= now < DEADLINE and state.get('closed') is False
            and request['campaign_id'] == state['campaign_id'] == CAMPAIGN.name
            and finite(request['original_start_epoch']) and request['original_start_epoch'] == state['clock_start_epoch'] == START
            and finite(request['campaign_deadline_epoch']) and request['campaign_deadline_epoch'] == state['deadline_epoch'] == DEADLINE
            and type(request['new_warning']) is int and request['new_warning'] == WARNING
            and type(request['new_stop']) is int and request['new_stop'] == STOP
            and request['authority'] == {'path': str(AUTHORITY), 'sha256': AUTHORITY_SHA}, 'same open finite original campaign/selection required')
    require(type(request['receipt_id']) is str and re.fullmatch('[A-Za-z0-9][A-Za-z0-9._-]{0,127}', request['receipt_id'])
            and request['receipt_id'] not in set(base.strings(state)), 'fresh immutable receipt identity required')
    base.base.validate_receipt(state, required=True)
    source_acceptance(request['source_acceptance'], now)
    q = reference(request['current_quiet'], QUIET)
    validate_quiet(q, state, now)
    totals = accounting(state, now)
    starts = totals['native_goal_starts'] + totals['reserved_or_committed_native_starts']
    occupied = totals['occupied_slot_seconds'] + totals['reserved_or_committed_slot_seconds']
    require(totals['active_jobs'] == [] and totals['pending_start_permits'] == 0
            and finite(starts) and starts <= 144 and finite(occupied) and occupied <= 172800
            and totals['generated_output_tokens_lower_bound'] < STOP, 'quiet unexpired original budgets and selected output headroom required')
    r = {'schema': 'pm.er8.output-guard-install-receipt.v1', 'receipt_id': request['receipt_id'],
         'root_authority': True, 'authority': copy.deepcopy(request['authority']),
         'source_acceptance': copy.deepcopy(request['source_acceptance']), 'current_quiet': copy.deepcopy(request['current_quiet']),
         'effective_epoch': now, 'previous_warning': WARNING, 'previous_stop': OLD_STOP,
         'warning': WARNING, 'stop': STOP, 'version': VERSION,
         'preinstall_state_sha256': canonical_sha(state), 'preinstall_case_ids': sorted(state['cases']),
         'preinstall_job_ids': sorted(state['jobs']), 'preflight_accounting': copy.deepcopy(totals)}
    candidate = copy.deepcopy(state)
    candidate[RECEIPT_KEY] = r
    validate_receipt(candidate, required=True, now=now)
    finished = legacy.time.time()
    require(finite(finished) and now <= finished < DEADLINE, 'invalid clock/cutoff during installation')
    state[RECEIPT_KEY] = r
    return copy.deepcopy(r)


def prospective(state, request, now, component_birth=None, new_case=False):
    receipt = validate_receipt(state, now=now)
    if not receipt:
        return
    birth = request.get('birth_epoch', now) if component_birth is None else component_birth
    require(finite(now) and finite(birth) and receipt['effective_epoch'] <= birth <= now < DEADLINE,
            'finite newly born prospective component required')
    case = request['case']
    require(case not in receipt['preinstall_case_ids'], 'preinstall case identity cannot use selected guard')
    if not new_case:
        c = state['cases'][case]
        require(finite(c.get('birth_epoch')) and receipt['effective_epoch'] <= c['birth_epoch'] <= birth,
                'new case original birth after installation required')
    if 'job' in request:
        require(request['job'] not in receipt['preinstall_job_ids'], 'preinstall job identity cannot use selected guard')


def admit(state, request, now, component_birth=None):
    validate_state(state)
    prospective(state, request, now, component_birth)
    with selected_guard(state, now):
        return base.admit(state, request, now, component_birth=component_birth)


def apply(state, action, request):
    validate_state(state)
    if action == 'amend-output-guard':
        return install(state, request)
    now = legacy.time.time()
    if action in ('case-birth', 'prepare-admission', 'admit'):
        prospective(state, request, now, new_case=action in ('case-birth', 'prepare-admission'))
    if action == 'guard-start' and RECEIPT_KEY in state:
        job = state['jobs'][request['job']]
        prospective(state, {**job, 'job': request['job']}, now, component_birth=job['birth_epoch'])
    with selected_guard(state, now) as receipt:
        result = base.apply(state, action, request)
    return flags(result, receipt)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('action')
    p.add_argument('--request', type=Path)
    args = p.parse_args()
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
