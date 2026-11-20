"""Owner-domain counterexamples missing from the W3E phase-2 report.

Inputs are original operation journals, independently resolved receipt maps,
actual session/cursor state, repository inventories and authority snapshots.
They are test authorities, not native execution or extra event payload fields.
"""
import copy

import pm_event_datetime as dt


# BRS-006 exact successful RestoreRun path; recovery/rollback endings remain
# independent non-success paths and cannot substitute for this complete path.
RESTORE_PHASES = (
    'selecting_backup', 'reading_manifest', 'compatibility_check', 'previewing',
    'waiting_for_approval', 'pre_restore_backup', 'staging', 'verifying_staged_data',
    'resolving_identity', 'resolving_credentials', 'resolving_source_locations',
    'quiescing', 'activating', 'rebuilding_derived_state', 'post_restore_verifying', 'complete',
)
RESTORE_REFS = (
    'preview_receipt_ref', 'approval_receipt_ref', 'recovery_point_receipt_ref',
    'staged_verification_receipt_ref', 'identity_resolution_ref', 'credential_resolution_ref',
    'source_location_resolution_ref', 'derived_rebuild_ref', 'post_restore_verification_ref',
    'client_cache_invalidation_ref',
)


def instant(value):
    """Order admitted time values exactly, using the shared grammar/calendar.

    Acceptance is entirely dt.date_time. The shared matched components and
    Gregorian day-number function supply the ordering key; fractional digits are
    compared as exact strings after removing insignificant trailing zeros. Leap insertions use the same frozen shared leap table.
    No alternate timestamp grammar, acceptance profile or fraction cap exists.
    """
    dt.date_time(value, profile=dt.EVENT_RECORD)
    match = dt._DATE_TIME.fullmatch(value)
    year, month, day, hour, minute, second = map(int, match.group(1, 2, 3, 4, 5, 6))
    zone = match.group(8)
    offset = 0 if zone in ('Z', 'z') else (1 if zone[0] == '+' else -1) * (
        int(zone[1:3]) * 3600 + int(zone[4:6]) * 60)
    base = dt._day_number(year, month, day) * 86400 + hour * 3600 + minute * 60 + min(second, 59) - offset
    leaps = sum(boundary < base for boundary in dt._LEAP_PRECEDING_SECONDS)
    # Lexical ordering of fractional digits is exact after trailing-zero removal.
    fraction = (match.group(7) or '').rstrip('0')
    return (base + leaps + int(second == 60), fraction)


def inputs(case):
    family = case['family']
    after = case['source']['after_record']
    if family == 'backup.destination_changed':
        return 'destination', {
            'disposition': 'use_existing', 'initialized_repositories': [],
            'repositories_before': list(after['repository_refs']),
            'repositories_after': list(after['repository_refs']),
        }
    if family == 'server.discovery_expired':
        return 'expiry', {
            'clock': instant(after['expires_at_utc']), 'expires': instant(after['expires_at_utc']),
            'decision_observation': after['observation_id'], 'observation': after['observation_id'],
            'trust_before': ['trust:existing-client:7'], 'trust_after': ['trust:existing-client:7'],
        }
    if family == 'server.connection_state_changed':
        return 'connection', {
            'session_id': after['session_id'], 'verified_session_id': after['session_id'],
            'trust_generation': after['trust_generation'], 'current_trust_generation': after['trust_generation'],
            'cursor_ref': after['cursor_ref'], 'verified_cursor_ref': after['cursor_ref'],
            'work_before': ['goal:running-server:1'], 'work_after': ['goal:running-server:1'],
        }
    if family == 'restore.state_changed':
        original = {key: after[key] for key in RESTORE_REFS}
        return 'restore_chain', {
            'phases': list(RESTORE_PHASES), 'required_phases': list(RESTORE_PHASES),
            'resolved_receipts': copy.deepcopy(original), 'original_receipts': original,
            'active_writers_at_activation': [], 'revived_authority': [], 'running_after_restore': [],
        }
    return None


def run_cases(adapter, family, trace, refuse):
    from pm_pnc019_s4o3_store import Store
    base = adapter.build(family)
    owner = inputs(base)
    if owner is None:
        return 0
    table, value = owner
    store = Store(adapter, base, trace)
    store.require(table, value)
    defects = {
        'destination': (
            ('existing_repository', 'initialized_repositories', ['repository:illicit-new']),
            ('repository_survives_removal', 'repositories_after', []),
        ),
        'expiry': (
            ('expiry_clock', 'clock', instant('2026-08-31T12:01:59.999999999999999999999999999999999999Z')),
            ('expiry_observation', 'decision_observation', 'discovery-observation:newer'),
            ('expiry_preserves_trust', 'trust_after', []),
        ),
        'connection': (
            ('connection_session', 'verified_session_id', 'session:other'),
            ('connection_trust', 'current_trust_generation', value.get('trust_generation', 0) + 1),
            ('connection_cursor', 'verified_cursor_ref', 'cursor:unverified'),
            ('connection_work', 'work_after', ['goal:restarted:2']),
        ),
        'restore_chain': (
            ('restore_phase_order', 'phases', [p for p in RESTORE_PHASES if p != 'quiescing']),
            ('restore_evidence', 'resolved_receipts', {}),
            ('restore_quiesce', 'active_writers_at_activation', ['writer:still-running']),
            ('restore_no_revival', 'revived_authority', ['session:restored-credential']),
            ('restore_pause', 'running_after_restore', ['goal:resumed']),
        ),
    }
    for row, field, replacement in defects[table]:
        bad = copy.deepcopy(value)
        bad[field] = replacement
        refuse(store, row, lambda b=bad: store.require(table, b))
        candidate = copy.deepcopy(base)
        candidate['owner_domains'][table] = copy.deepcopy(bad)
        refuse(store, row, lambda c=candidate: store.append(c))
    if table == 'restore_chain':
        # Each receipt is independently removed; the other nine and the entire
        # phase journal remain valid. Refusal is not caused by a wrong hash.
        for field in RESTORE_REFS:
            bad = copy.deepcopy(value)
            bad['resolved_receipts'].pop(field)
            refuse(store, 'restore_evidence', lambda b=bad: store.require(table, b))
            candidate = copy.deepcopy(base)
            candidate['owner_domains'][table] = copy.deepcopy(bad)
            refuse(store, 'restore_evidence', lambda c=candidate: store.append(c))
    if table == 'expiry':
        assert instant('2026-08-31T14:02:00+02:00') == value['expires']
        assert instant('2016-12-31T23:59:59Z') < instant('2016-12-31T23:59:60Z') < instant('2017-01-01T00:00:00Z')
    return 1
