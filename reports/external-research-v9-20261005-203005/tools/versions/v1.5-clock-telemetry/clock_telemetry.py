"""Trusted original-action clock metadata, separate from tool business payloads.

No deadline enforcement, timer creation, source interpretation, or Goal transition.
The caller binds original controller values; total cleanup stop is never an action
deadline substitute. Runtime snapshots expose scalars, never proof host paths.
"""
import hashlib
import json
import os
from pathlib import Path
import stat
import time

PROFILE_SCHEMA = 'er9.original-action-clock.profile.v1'
TELEMETRY_SCHEMA = 'er9.original-action-clock.telemetry.v1'
FIELDS = {'schema', 'stage_id', 'original_birth_monotonic_ns',
          'original_stage_allocation_seconds',
          'original_candidate_action_deadline_monotonic_ns',
          'original_total_cleanup_stop_monotonic_ns', 'action_deadline_proof'}

def encoded(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False,
                      sort_keys=True, separators=(',', ':')).encode('utf-8')

def strict_pairs(pairs):
    value = {}
    for key, item in pairs:
        if key in value: raise ValueError('duplicate clock key')
        value[key] = item
    return value

def bounded_file(path):
    p = Path(path).absolute()
    if any(q.is_symlink() for q in (p, *p.parents)):
        raise ValueError('clock/proof symlink denied')
    fd = os.open(p, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    try:
        meta = os.fstat(fd)
        if not stat.S_ISREG(meta.st_mode) or meta.st_nlink != 1 or meta.st_size > 1048576:
            raise ValueError('bounded regular clock/proof required')
        raw = os.read(fd, meta.st_size + 1)
        after = os.fstat(fd)
        if len(raw) != meta.st_size or after.st_mtime_ns != meta.st_mtime_ns:
            raise ValueError('clock/proof drift')
        return raw
    finally: os.close(fd)

def validate(value, verify_controller=False):
    if not isinstance(value, dict) or set(value) != FIELDS or value['schema'] != PROFILE_SCHEMA:
        raise ValueError('exact original-clock schema required')
    stage = value['stage_id']
    if not isinstance(stage, str) or not stage or len(stage.encode()) > 256 or any(ord(c) < 32 for c in stage):
        raise ValueError('bounded stage identity required')
    birth, action, total = (value[key] for key in (
        'original_birth_monotonic_ns', 'original_candidate_action_deadline_monotonic_ns',
        'original_total_cleanup_stop_monotonic_ns'))
    cap = value['original_stage_allocation_seconds']
    for number in (birth, action, total):
        if number is not None and (type(number) is not int or not 0 <= number <= 2**63-1):
            raise ValueError('original monotonic ns bound')
    if cap is not None and (type(cap) is not int or not 1 <= cap <= 43200):
        raise ValueError('original allocation bound')
    if birth is not None and total is not None:
        if total <= birth: raise ValueError('reversed original clock')
        if cap is not None and total - birth != cap * 1000000000:
            raise ValueError('allocation/total drift')
    if action is not None:
        if birth is not None and action < birth: raise ValueError('action before original birth')
        if total is not None and action > total: raise ValueError('action after cleanup stop')
    proof = value['action_deadline_proof']
    if proof is not None:
        if not isinstance(proof, dict) or set(proof) != {'kind', 'controller_path', 'controller_sha256', 'action_field', 'receipt'}:
            raise ValueError('exact action proof required')
        if proof['kind'] != 'explicit_original_native_action_deadline': raise ValueError('action origin denied')
        if not isinstance(proof['controller_path'], str) or not Path(proof['controller_path']).is_absolute():
            raise ValueError('absolute pinned controller source required')
        sha = proof['controller_sha256']
        if not isinstance(sha, str) or len(sha) != 64 or any(c not in '0123456789abcdef' for c in sha):
            raise ValueError('controller SHA required')
        if not isinstance(proof['action_field'], str) or not proof['action_field'] or len(proof['action_field']) > 256:
            raise ValueError('actual controller action field required')
        receipt = proof['receipt']
        selector_keys = {'stage_id_selector': 'stage_id',
            'birth_selector': 'original_birth_monotonic_ns',
            'allocation_selector': 'original_stage_allocation_seconds',
            'action_deadline_selector': 'original_candidate_action_deadline_monotonic_ns',
            'total_cleanup_selector': 'original_total_cleanup_stop_monotonic_ns'}
        if not isinstance(receipt, dict) or set(receipt) != {'path', 'sha256', *selector_keys}:
            raise ValueError('exact original-controller clock receipt required')
        if not isinstance(receipt['path'], str) or not Path(receipt['path']).is_absolute():
            raise ValueError('absolute clock receipt required')
        if not isinstance(receipt['sha256'], str) or len(receipt['sha256']) != 64 or any(c not in '0123456789abcdef' for c in receipt['sha256']):
            raise ValueError('clock receipt SHA required')
        for selector in selector_keys:
            if not isinstance(receipt[selector], str) or not receipt[selector].startswith('/') or len(receipt[selector]) > 512:
                raise ValueError('original clock receipt pointer required')
        if verify_controller and hashlib.sha256(bounded_file(proof['controller_path'])).hexdigest() != sha:
            raise ValueError('controller source pin drift')
        if verify_controller:
            raw = bounded_file(receipt['path'])
            if hashlib.sha256(raw).hexdigest() != receipt['sha256']:
                raise ValueError('original clock receipt drift')
            saved = json.loads(raw, object_pairs_hook=strict_pairs)
            for selector, field in selector_keys.items():
                actual = saved
                for part in receipt[selector][1:].split('/'):
                    token = part.replace('~1', '/').replace('~0', '~')
                    actual = actual[int(token)] if isinstance(actual, list) else actual[token]
                if type(actual) is not type(value[field]) or actual != value[field]:
                    raise ValueError('clock/receipt value or stage drift')
    return value

def load(path, expected_sha=None, verify_controller=False):
    raw = bounded_file(path)
    if len(raw) > 32768: raise ValueError('clock descriptor cap')
    if expected_sha is not None and hashlib.sha256(raw).hexdigest() != expected_sha:
        raise ValueError('clock descriptor pin drift')
    value = json.loads(raw, object_pairs_hook=strict_pairs,
                       parse_constant=lambda _: (_ for _ in ()).throw(ValueError('nonfinite clock')))
    return validate(value, verify_controller)

def snapshot(profile=None, now_ns=None):
    now = time.monotonic_ns() if now_ns is None else now_ns
    if type(now) is not int or not 0 <= now <= 2**63-1: raise ValueError('observation clock bound')
    if profile is not None: validate(profile)
    value = profile or {}
    birth = value.get('original_birth_monotonic_ns')
    action = value.get('original_candidate_action_deadline_monotonic_ns')
    proof = value.get('action_deadline_proof')
    known = action is not None and proof is not None
    clock = {'stage_id': value.get('stage_id'),
             'action_deadline_status': 'KNOWN' if known else 'UNKNOWN',
             'original_stage_allocation_seconds': value.get('original_stage_allocation_seconds'),
             'original_birth_monotonic_ns': birth,
             'original_candidate_action_deadline_monotonic_ns': action if known else None,
             'original_total_cleanup_stop_monotonic_ns': value.get('original_total_cleanup_stop_monotonic_ns'),
             'observation_monotonic_ns': now,
             'elapsed_since_original_birth_ms': max(0, (now-birth)//1000000) if birth is not None and now >= birth else None,
             'remaining_candidate_action_ms': max(0, (action-now)//1000000) if known and (birth is None or now >= birth) else None}
    if birth is not None and now < birth:
        clock['action_deadline_status'] = 'UNKNOWN: observation precedes original birth'
    return {'schema': TELEMETRY_SCHEMA, 'stage_clock': clock,
            'scope': 'Snapshot of original controller action window; cleanup stop is separate. No timer reset, extension, permission or Goal status. Clock-awareness is a common behavioral overlay.'}

def append_result(result, profile=None):
    # Preserve content[0] and all original business fields byte-for-byte.
    return {**result, 'content': [*result.get('content', []),
            {'type': 'text', 'text': encoded(snapshot(profile)).decode('utf-8')}]}
