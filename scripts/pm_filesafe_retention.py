"""Static Card 2 Project retention oracles; native deletion/holds remain NOT_RUN."""
from datetime import datetime, timedelta
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BINDINGS = {
    'filesafe.command_denied': ('RP-OPERATIONAL-2555D', 'DL-422'),
    'filesafe.destructive_override_denied': ('RP-AUTHORITY-INDEFINITE', 'DL-423'),
    'filesafe.destructive_override_requested': ('RP-AUTHORITY-INDEFINITE', 'DL-424'),
    'filesafe.guard_init_failed': ('RP-OPERATIONAL-2555D', 'DL-425'),
    'filesafe.path_denied': ('RP-OPERATIONAL-2555D', 'DL-426'),
}


def load(path):
    return json.loads((ROOT / path).read_text())


def binding_failures(family, graph):
    if family not in BINDINGS:
        return []
    policy, decision = BINDINGS[family]
    expected = {'project': policy, 'application': 'PENDING_RETENTION_DECISION'}
    return (['card2_scope_binding'] if graph.get('retention_policy_by_scope') != expected
            or graph.get('retention_decision_ref') != decision
            or graph['retention_policy_ref'] != 'PENDING_RETENTION_DECISION' else [])


def outcome(case, policy):
    """Model the approved choices over synthetic independently saved originals.

    This is an eligibility/result oracle, not a Janitor or live deletion path.
    Retry/reprocessing/recovery observations cannot replace the original anchor.
    """
    if case['scope_kind'] == 'application':
        return 'pending_retention_decision'
    protected = bool(case['protection_refs'])
    action = case['action']
    if action == 'delete_project_data':
        return 'delete_project_data' if case['project_delete_authorized'] and not protected else 'retain'
    if action in ('remove_project_from_list', 'delete_described_file', 'delete_described_chat'):
        return 'retain'
    permanent = policy['retain_indefinitely']
    if action == 'append':
        full = case['storage_full'] or (policy['max_cardinality'] is not None
                                       and case['project_record_count'] >= policy['max_cardinality'])
        if not full:
            return 'append'
        if not permanent and case['expired_unprotected_available']:
            return 'compact_expired_then_append'
        return 'refuse_new'
    if action != 'compact':
        raise ValueError('unknown retention oracle action')
    if permanent or protected:
        return 'retain'
    original = datetime.fromisoformat(case['original_saved_at_utc'].replace('Z', '+00:00'))
    now = datetime.fromisoformat(case['now_utc'].replace('Z', '+00:00'))
    return 'compact_expired' if now >= original + timedelta(seconds=policy['ttl_seconds']) else 'retain'


def check(family):
    if family not in BINDINGS:
        return []
    policy_id, decision = BINDINGS[family]
    rows = load('Plans/storage_value_registry.json')['retention_policies']
    matches = [r for r in rows if r['policy_id'] == policy_id]
    if len(matches) != 1:
        return ['card2_policy_missing_or_ambiguous']
    policy = matches[0]
    permanent = policy_id == 'RP-AUTHORITY-INDEFINITE'
    expected = dict(retention_mode='indefinite' if permanent else 'fixed_ttl',
                    anchor_kind='creation' if permanent else 'terminal_transition',
                    retain_indefinitely=permanent, ttl_seconds=None if permanent else 220752000,
                    source_policy_ref=None, max_cardinality=None if permanent else 2000000,
                    cardinality_scope=None if permanent else 'project',
                    additional_cardinality_limits=[], max_bytes=None,
                    overflow_action='fail_closed', hold_eligible=True,
                    expiry_action='none' if permanent else 'compact', policy_version='1.0.0')
    if policy != {'policy_id': policy_id, **expected}:
        return ['card2_existing_policy_changed']
    fixtures = load('Plans/filesafe_event_retention_fixtures.json')['families']
    row = next(r for r in fixtures if r['event_type'] == family)
    failures = []
    if row['project_policy_ref'] != policy_id or row['decision_ref'] != decision:
        failures.append('card2_fixture_binding')
    for case in row['cases']:
        if outcome(case, policy) != case['expected']:
            failures.append(case['id'] + ':retention_outcome')
    return failures
