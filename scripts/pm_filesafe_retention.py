"""Static Card 2 Project retention oracles; native deletion/holds remain NOT_RUN."""
import json
from pathlib import Path

import pm_filesafe_schema_graph as schema_graph
import pm_filesafe_tables as tables

ROOT = Path(__file__).resolve().parents[1]
BINDINGS = {
    'filesafe.command_denied': ('RP-OPERATIONAL-2555D', 'DL-422'),
    'filesafe.destructive_override_denied': ('RP-AUTHORITY-INDEFINITE', 'DL-423'),
    'filesafe.destructive_override_requested': ('RP-AUTHORITY-INDEFINITE', 'DL-424'),
    'filesafe.guard_init_failed': ('RP-OPERATIONAL-2555D', 'DL-425'),
    'filesafe.path_denied': ('RP-OPERATIONAL-2555D', 'DL-426'),
}
RUN_YEAR_FAMILIES = ('safe_point.created', 'safe_point.restored')


def load(path):
    return json.loads((ROOT / path).read_text())


def instant_us(value):
    return schema_graph.instant_key(value)


def _plus_seconds(value, seconds):
    base = instant_us(value)
    return (base[0] + seconds * 1_000_000, *base[1:])


def binding_failures(family, graph):
    if family in RUN_YEAR_FAMILIES:
        return tables.codes('retention_binding_runyear', {
            'policy_ref': graph['retention_policy_ref'], 'decision_ref': graph.get('retention_decision_ref')})
    if family not in BINDINGS:
        return []
    policy, decision = BINDINGS[family]
    expected = {'project': policy, 'application': 'PENDING_RETENTION_DECISION'}
    return tables.codes('retention_binding_card2', {
        'policy_by_scope': graph.get('retention_policy_by_scope'), 'expected_by_scope': expected,
        'decision_ref': graph.get('retention_decision_ref'), 'expected_decision': decision,
        'policy_ref': graph['retention_policy_ref']})


def outcome(case, policy):
    """Model the approved choices over synthetic independently saved originals.

    This is an eligibility/result oracle, not a Janitor or live deletion path.
    Retry/reprocessing/recovery observations cannot replace the original anchor.
    Each decision is one row of a retention guard table; a refusing row's code
    is the modelled result.
    """
    if policy['policy_id'] == 'RP-RUNTIME-365D':
        return run_year_outcome(case, policy)
    decided = tables.first('retention_scope', {'scope_kind': case['scope_kind']})
    if decided is not None:
        return decided
    action = case['action']
    if action == 'delete_project_data':
        decided = tables.first('retention_delete', {
            'project_delete_authorized': case['project_delete_authorized'], 'protection_refs': case['protection_refs']})
        return decided or 'delete_project_data'
    if action in ('remove_project_from_list', 'delete_described_file', 'delete_described_chat'):
        return 'retain'
    if action == 'append':
        if tables.first('retention_capacity', {
                'storage_full': case['storage_full'], 'max_cardinality': policy['max_cardinality'],
                'project_record_count': case['project_record_count']}) is None:
            return 'append'
        decided = tables.first('retention_overflow', {
            'retain_indefinitely': policy['retain_indefinitely'],
            'expired_unprotected_available': case['expired_unprotected_available']})
        return decided or 'compact_expired_then_append'
    if action != 'compact':
        raise ValueError('unknown retention oracle action')
    decided = tables.first('retention_compact_hold', {
        'retain_indefinitely': policy['retain_indefinitely'], 'protection_refs': case['protection_refs']})
    if decided is not None:
        return decided
    expiry = _plus_seconds(case['original_saved_at_utc'], policy['ttl_seconds'])
    return tables.first('retention_compact_age', {'now_us': instant_us(case['now_utc']), 'expiry_us': expiry}) or 'compact_expired'


def run_year_outcome(case, policy):
    """G28's real-run history; released snapshot/journal bodies are separate."""
    decided = tables.first('runyear_run', {'run_id': case['run_id']})
    if decided is not None:
        return decided
    if case['action'] == 'append':
        return tables.first('runyear_capacity', {
            'run_record_count': case['run_record_count'], 'max_cardinality': policy['max_cardinality'],
            'scope_kind': case['scope_kind'], 'project_record_count': case['project_record_count'],
            'project_limit': policy['additional_cardinality_limits'][0]['max_cardinality']}) or 'append'
    if case['action'] != 'compact':
        raise ValueError('unknown run-year oracle action')
    decided = tables.first('runyear_compact_hold', {
        'protection_refs': case['protection_refs'], 'run_completed_present': case['run_completed_at_utc'] is not None})
    if decided is not None:
        return decided
    expiry = _plus_seconds(case['run_completed_at_utc'], policy['ttl_seconds'])
    return tables.first('runyear_compact_age', {'now_us': instant_us(case['now_utc']), 'expiry_us': expiry}) or 'compact_expired'


def expected_policy(policy_id):
    runtime = policy_id == 'RP-RUNTIME-365D'
    permanent = policy_id == 'RP-AUTHORITY-INDEFINITE'
    expected = dict(retention_mode='indefinite' if permanent else 'fixed_ttl',
                    anchor_kind='creation' if permanent else 'terminal_transition',
                    retain_indefinitely=permanent, ttl_seconds=None if permanent else 220752000,
                    source_policy_ref=None, max_cardinality=None if permanent else 2000000,
                    cardinality_scope=None if permanent else 'project',
                    additional_cardinality_limits=[], max_bytes=None,
                    overflow_action='fail_closed', hold_eligible=True,
                    expiry_action='none' if permanent else 'compact', policy_version='1.0.0')
    if runtime:
        expected.update(anchor_kind='run_completion', ttl_seconds=31536000,
                        max_cardinality=1000000, cardinality_scope='run',
                        additional_cardinality_limits=[dict(cardinality_scope='project', max_cardinality=5000000)],
                        overflow_action='roll_successor')
    return {'policy_id': policy_id, **expected}


def check(family, registry=None, fixtures=None):
    runtime = family in RUN_YEAR_FAMILIES
    if family not in BINDINGS and not runtime:
        return []
    policy_id, decision = ('RP-RUNTIME-365D', 'DL-401') if runtime else BINDINGS[family]
    rows = (registry if registry is not None else load('Plans/storage_value_registry.json'))['retention_policies']
    matches = [r for r in rows if r['policy_id'] == policy_id]
    refused = tables.codes('retention_policy_lookup', {'match_count': len(matches)})
    if refused:
        return refused
    policy = matches[0]
    refused = tables.codes('retention_policy_value', {'policy': policy, 'expected': expected_policy(policy_id)})
    if refused:
        return refused
    fixtures = (fixtures if fixtures is not None else load('Plans/filesafe_event_retention_fixtures.json'))['families']
    row = next(r for r in fixtures if r['event_type'] == family)
    failures = tables.codes('retention_fixture_binding', {
        'project_policy_ref': row['project_policy_ref'], 'policy_id': policy_id,
        'decision_ref': row['decision_ref'], 'decision': decision})
    for case in row['cases']:
        if outcome(case, policy) != case['expected']:
            failures.append(case['id'] + ':retention_outcome')
    return failures
