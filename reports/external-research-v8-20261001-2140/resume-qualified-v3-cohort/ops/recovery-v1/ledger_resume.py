"""Deadline-only ER8 explicit-user-resume binding; imports and status are read-only.

Frozen historical accounting and policy source remain unchanged. The root has
already amended shared state; this module never creates or amends that receipt.
"""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
OVERLAY = HERE / 'ledger_overlay.py'
OVERLAY_SHA = '597a3d3349154fbb4614ed7ece864f1cd77ecfea145fbfddaefc79fe0a1cd618'
RESUME = HERE / 'RESUME_20261002.json'
RESUME_SHA = '9fc1c92a3b6074610b3b4026bd4d7500e0f0a135b506863965e2919fb640c02f'


def pinned(path, expected):
    if path.is_symlink() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise RuntimeError('frozen resume dependency changed')
    return path


pinned(OVERLAY, OVERLAY_SHA)
pinned(RESUME, RESUME_SHA)
resume = json.loads(RESUME.read_text())
spec = importlib.util.spec_from_file_location('er8_resume_frozen_overlay', str(OVERLAY))
overlay = importlib.util.module_from_spec(spec)
spec.loader.exec_module(overlay)
legacy = overlay.legacy
prior_auth = overlay.auth
prior_accounting = overlay.accounting
transaction = overlay.transaction

if (resume.get('schema') != 'pm.er8.explicit-user-resume.v1'
        or resume.get('no_budget_reset') is not True
        or resume.get('frozen_jobs_and_caps_unchanged') is not True
        or resume.get('campaign_id') != prior_auth()['campaign_id']
        or resume.get('previous_authority_sha256') != overlay.AMENDMENT_SHA
        or resume.get('original_start_epoch') != overlay.policy['clock_start_epoch']
        or resume.get('previous_deadline_epoch') != overlay.policy['deadline_epoch']
        or resume['authorized_excluded_seconds'] != resume['resume_observed_epoch'] - resume['pause_epoch']
        or resume['prospective_deadline_epoch'] != resume['previous_deadline_epoch'] + resume['authorized_excluded_seconds']):
    raise RuntimeError('exact additive explicit user resume required')


def auth():
    pinned(RESUME, RESUME_SHA)
    result = copy.deepcopy(prior_auth())
    result['root_work_clock_deadline_epoch'] = resume['prospective_deadline_epoch']
    return result


overlay.auth = auth
legacy.auth = auth


def validate_state(state):
    auth()
    expected = {'path': str(RESUME), 'sha256': RESUME_SHA,
                'pause_seconds': resume['authorized_excluded_seconds'],
                'prospective_deadline_epoch': resume['prospective_deadline_epoch']}
    if (state.get('user_resume_authority') != expected
            or state.get('clock_start_epoch') != resume['original_start_epoch']
            or state.get('campaign_id') != resume['campaign_id']
            or state.get('authorization_sha256') != legacy.AUTH_SHA
            or state.get('deadline_epoch') != resume['prospective_deadline_epoch']
            or state.get('prospective_authority_amendment', {}).get('authority_sha256') != overlay.AMENDMENT_SHA):
        raise RuntimeError('already root-authorized exact shared resume state required')


def accounting(state, now=None):
    """Public clock excludes only elapsed overlap with the authorized pause."""
    validate_state(state)
    now = legacy.time.time() if now is None else now
    result = prior_accounting(state, now)
    excluded = max(0, min(now, resume['resume_observed_epoch']) - resume['pause_epoch'])
    result['elapsed_seconds_including_user_pause'] = result['elapsed_seconds']
    result['authorized_user_pause_excluded_seconds'] = excluded
    result['elapsed_seconds'] = max(0, result['elapsed_seconds'] - excluded)
    return result


def prospective(request, now, component_birth=None):
    birth = request.get('birth_epoch', now) if component_birth is None else component_birth
    if now < resume['resume_observed_epoch'] or birth < resume['resume_observed_epoch']:
        raise RuntimeError('resume deadline applies only to prospective births')


def apply(state, action, request):
    validate_state(state)
    now = legacy.time.time()
    if action == 'status':
        return accounting(state, now)
    if action in ('prepare-admission', 'case-birth'):
        prospective(request, now)
    return overlay.apply(state, action, request)


def admit(state, request, now, component_birth=None):
    validate_state(state)
    prospective(request, now, component_birth)
    return overlay.admit(state, request, now, component_birth=component_birth)
