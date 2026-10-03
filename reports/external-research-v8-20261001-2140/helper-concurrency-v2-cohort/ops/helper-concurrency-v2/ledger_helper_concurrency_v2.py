"""Pinned prospective helper concurrency successor; import/status never write.

The only added state transition is amend-helper-concurrency. It records one
root-authorized receipt, without changing any existing state key. Native
candidate admission and every old accounting rule delegate to the frozen API.
"""
import argparse
import contextlib
import copy
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys

CAMPAIGN = Path('LAB_ROOT')
RECOVERY = CAMPAIGN / 'ops/recovery-v1'
API = RECOVERY / 'ledger_resume.py'
API_SHA = 'a98cf53c1826f1f4c9fa47a9e181eaae8beb971ea41e6564578a253059450b61'
AUTHORITY = RECOVERY / 'HELPER_CONCURRENCY_AUTHORITY_20261003.json'
AUTHORITY_SHA = 'f1682a991232997556aed7fb88f167e706317259913d9365c5a1fb72fc572a79'
RECEIPT_KEY = 'helper_concurrency_authority_v1'
PINS = {
    API: API_SHA,
    AUTHORITY: AUTHORITY_SHA,
    RECOVERY / 'ledger_overlay.py': '597a3d3349154fbb4614ed7ece864f1cd77ecfea145fbfddaefc79fe0a1cd618',
    RECOVERY / 'RESUME_20261002.json': '9fc1c92a3b6074610b3b4026bd4d7500e0f0a135b506863965e2919fb640c02f',
    RECOVERY / 'AUTHORITY_AMENDMENT.json': '1479c0b44869d13878b90ccd2f02d5fb2d755cfa0f0b17315105dc48d57616ec',
    CAMPAIGN / 'ops/accounting-v1/slot_ledger.py': '5590fdc09936005e09b2de7aa4ac4113bbe0ddeefa4a8caf3548d78b0e3045af',
    CAMPAIGN / 'AUTHORIZATION.json': '25609fc787d622958fd62afa5df218a1e4789f61595a4152865ceb0c143304f2',
}


def pinned(path, expected):
    path = Path(path)
    if any(p.is_symlink() for p in (path, *path.parents)):
        raise RuntimeError('symlink dependency forbidden')
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise RuntimeError('frozen helper concurrency dependency changed')
    return path


def check_pins():
    for path, digest in PINS.items():
        pinned(path, digest)


def finite_epoch(value):
    return (isinstance(value, (int, float)) and not isinstance(value, bool)
            and math.isfinite(value))


check_pins()
# No source rewrites, shared module registration, or bytecode-cache writes.
spec = importlib.util.spec_from_file_location('er8_helper_concurrency_frozen_resume', str(API))
resume_api = importlib.util.module_from_spec(spec)
old_bytecode = sys.dont_write_bytecode
try:
    sys.dont_write_bytecode = True
    exec(compile(spec.loader.get_source(spec.name), str(API), 'exec'), resume_api.__dict__)
finally:
    sys.dont_write_bytecode = old_bytecode
legacy = resume_api.legacy
overlay = resume_api.overlay
saved_old_auth = resume_api.auth


def authority():
    check_pins()
    value = json.loads(AUTHORITY.read_text())
    old = saved_old_auth()
    required = {
        'schema': 'pm.er8.helper-concurrency-authority.v1',
        'root_authority': True,
        'campaign_id': old['campaign_id'],
        'recorded_epoch': 1790996057.7366228,
        'explicit_user_instruction': 'You can use more than 6 concurrent helpers.',
        'root_selected_prospective_active_helpers': 12,
        'previous_active_helpers': 6,
        'applies_to': 'Prospective helper admissions only, including conservative native Muse helpers',
        'original_start_epoch': resume_api.resume['original_start_epoch'],
        'campaign_deadline_epoch': old['root_work_clock_deadline_epoch'],
        'authorized_pause_seconds_unchanged': resume_api.resume['authorized_excluded_seconds'],
        'candidate_slots_by_family_unchanged': old['limits']['active_candidates_by_family'],
        'native_goal_start_ceiling_unchanged': old['limits']['native_goal_starts'],
        'occupied_candidate_seconds_ceiling_unchanged': old['limits']['occupied_candidate_slot_seconds'],
        'no_budget_reset': True,
        'frozen_history_outcomes_job_caps_and_usage_unchanged': True,
        'prior_resume_authority_sha256': resume_api.RESUME_SHA,
        'prior_resume_api_sha256': API_SHA,
        'no_candidate_boundary_provider_tool_profile_authorization_change': True,
    }
    # JSON equality alone equates true with 1; booleans and epochs need type guards.
    if (value != required or any(value.get(k) is not True for k in (
            'root_authority', 'no_budget_reset',
            'frozen_history_outcomes_job_caps_and_usage_unchanged',
            'no_candidate_boundary_provider_tool_profile_authorization_change'))
            or any(not finite_epoch(value.get(k)) for k in (
                'recorded_epoch', 'original_start_epoch', 'campaign_deadline_epoch',
                'authorized_pause_seconds_unchanged'))
            or type(value.get('previous_active_helpers')) is not int
            or type(value.get('root_selected_prospective_active_helpers')) is not int
            or old['limits']['active_helpers'] != 6):
        raise RuntimeError('exact root helper concurrency authority required')
    return value


def auth():
    authority()
    result = copy.deepcopy(saved_old_auth())
    result['limits']['active_helpers'] = 12
    return result


# These are isolated imported module objects. Originals on disk remain unchanged.
authority()
resume_api.auth = auth
resume_api.legacy.auth = auth
resume_api.overlay.auth = auth


def validate_receipt(state, required=False):
    a = authority()
    receipt = state.get(RECEIPT_KEY)
    if RECEIPT_KEY not in state:
        if required:
            raise RuntimeError('exact installed helper concurrency receipt required')
        return
    expected = {
        'schema': 'pm.er8.helper-concurrency-receipt.v1',
        'authority_path': str(AUTHORITY), 'authority_sha256': AUTHORITY_SHA,
        'root_authority': True, 'previous_active_helpers': 6,
        'active_helpers': 12, 'effective_epoch': receipt.get('effective_epoch') if isinstance(receipt, dict) else None,
    }
    if (not isinstance(receipt, dict) or receipt != expected
            or receipt.get('root_authority') is not True
            or type(receipt.get('previous_active_helpers')) is not int
            or type(receipt.get('active_helpers')) is not int
            or not finite_epoch(receipt.get('effective_epoch'))
            or not a['recorded_epoch'] <= receipt['effective_epoch'] < a['campaign_deadline_epoch']):
        raise RuntimeError('invalid helper concurrency receipt')
    return receipt


def validate_state(state):
    resume_api.validate_state(state)
    validate_receipt(state)


@contextlib.contextmanager
def transaction():
    with resume_api.transaction() as state:
        validate_state(state)
        yield state


def accounting(state, now=None):
    validate_state(state)
    return resume_api.accounting(state, now)


def apply(state, action, request):
    validate_state(state)
    if action == 'amend-helper-concurrency':
        expected = {'root_authority': True, 'authority_path': str(AUTHORITY),
                    'authority_sha256': AUTHORITY_SHA}
        if request != expected or request.get('root_authority') is not True:
            raise RuntimeError('exact explicit root installation request required')
        if RECEIPT_KEY in state:
            raise RuntimeError('helper concurrency amendment already installed')
        now = legacy.time.time()
        a = authority()
        if (not finite_epoch(now) or not a['recorded_epoch'] <= now < state['deadline_epoch']
                or state.get('closed') is not False):
            raise RuntimeError('prospective open campaign installation required')
        receipt = {'schema': 'pm.er8.helper-concurrency-receipt.v1',
                   **expected, 'previous_active_helpers': 6,
                   'active_helpers': 12, 'effective_epoch': now}
        state[RECEIPT_KEY] = receipt
        return copy.deepcopy(receipt)
    if action == 'helper-start':
        receipt = validate_receipt(state, required=True)
        now = legacy.time.time()
        birth = request.get('started_epoch', now)
        if (not finite_epoch(now) or not finite_epoch(birth)
                or not receipt['effective_epoch'] <= birth <= now):
            raise RuntimeError('prospective finite helper birth required')
        # Carry the validated default across the frozen API's later clock reads.
        request = {**request, 'started_epoch': birth}
    return resume_api.apply(state, action, request)


def admit(state, request, now, component_birth=None):
    validate_state(state)
    return resume_api.admit(state, request, now, component_birth=component_birth)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action')
    parser.add_argument('--request', type=Path)
    args = parser.parse_args()
    request = json.loads(args.request.read_text()) if args.request else {}
    if args.action == 'status':
        # Native transaction saves on exit; status deliberately avoids it.
        state = json.loads(legacy.STATE.read_text())
        result = apply(state, 'status', request)
    else:
        with transaction() as state:
            result = apply(state, args.action, request)
    print(json.dumps(result, indent=2, allow_nan=False))


if __name__ == '__main__':
    main()
