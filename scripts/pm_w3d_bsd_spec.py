"""W3D Back Seat Driver family spec for the phase-2 oracles (wave 3, stream E).

Fifteen prepared families BSD/CV/SP-1350..1364 (+SP-1365 source graph), project
only, prepared without admission. Metadata is read from the lane's own phase-1
contracts (Plans/bsd_event_oracle_plan.json, Plans/bsd_event_payloads.schema.json,
Plans/bsd_event_storage_contracts.schema.json); the owner prose in
Plans/Back_Seat_Driver.md, Plans/Contracts_V0.md and Plans/storage-plan.md stays
the authority. Semantic predicates below encode each family's BSD-135x section 9
transition facts; every one has a named single-defect witness.

A semantic entry is (name, invariant, fn, target, negative_value, variant):
- fn(facts, payload) decides one owner invariant;
- target is ('fact', key) or ('payload', field): the one value the witness changes;
- variant names the valid case the witness is built from (fact overrides applied
  to POSITIVE_FACTS; the variant itself must satisfy every semantic predicate).

Retention (W3-P2 step 5) binds to the decisions now on main:
- the thirteen assignment-backed families: RP-RUNTIME-365D@1.0.0, Card 1 G13
  rule (DL-401) through Storage Case L-3's Runtime/run/node/attempt class
  (Plans/storage-plan.md:17542 at main f8b2098608) and the policy table at :18452;
- bsd.policy_changed and bsd.workflow_binding_created: RP-AUTHORITY-INDEFINITE@1.0.0,
  third-sitting DL-453 item 1.a Back Seat Driver (Plans/storage-plan.md:17638,17642
  at main f8b2098608). No age/count expiry; explicit Delete Puppet Master project
  data only; finite disk budgets refuse new records under pressure.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / 'Plans/bsd_event_oracle_plan.json'
PAYLOADS = ROOT / 'Plans/bsd_event_payloads.schema.json'
STORAGE = ROOT / 'Plans/bsd_event_storage_contracts.schema.json'

# slug -> (producer, subject_field, source_kind, assignment_backed)
_META = {
    'advice_emitted': ('BackSeatDriverService::deliver_advice', 'bsd_finding_id', 'finding', True),
    'assignment_paused': ('BackSeatDriverService::commit_assignment_pause', 'bsd_assignment_id', 'assignment', True),
    'assignment_resumed': ('BackSeatDriverService::commit_assignment_resume', 'bsd_assignment_id', 'assignment', True),
    'assignment_started': ('BackSeatDriverService::commit_assignment_start', 'bsd_assignment_id', 'assignment', True),
    'assignment_stopped': ('BackSeatDriverService::commit_assignment_stop', 'bsd_assignment_id', 'assignment', True),
    'finding_cleared': ('BackSeatDriverService::commit_finding_clear', 'bsd_finding_id', 'finding', True),
    'finding_held': ('BackSeatDriverService::commit_finding_hold', 'bsd_finding_id', 'finding', True),
    'finding_reconfirmed': ('BackSeatDriverService::commit_finding_reconfirmation', 'bsd_finding_id', 'finding', True),
    'finding_suppressed': ('BackSeatDriverService::commit_finding_suppression', 'bsd_finding_id', 'finding', True),
    'output_quarantined': ('BackSeatDriverService::commit_output_quarantine', 'quarantine_id', 'quarantine', True),
    'policy_changed': ('BackSeatDriverService::commit_policy_revision', 'policy_id', 'policy', False),
    'review_failed': ('BackSeatDriverService::commit_review_failure', 'review_cycle_id', 'review_cycle', True),
    'review_started': ('BackSeatDriverService::commit_review_start', 'review_cycle_id', 'review_start', True),
    'review_timed_out': ('BackSeatDriverService::commit_review_timeout', 'review_cycle_id', 'review_cycle', True),
    'workflow_binding_created': ('BackSeatDriverService::commit_workflow_binding_revision', 'binding_id', 'workflow_binding', False),
}

RETENTION_RUNTIME = {'registry_schema_id': 'pm.storage_value_registry.v2',
                     'policy_id': 'RP-RUNTIME-365D', 'policy_version': '1.0.0'}
RETENTION_DL453 = {'registry_schema_id': 'pm.storage_value_registry.v2',
                   'policy_id': 'RP-AUTHORITY-INDEFINITE', 'policy_version': '1.0.0'}
RETENTION_CITE_RUNTIME = ('DL-401 Card 1 G13 rule; Storage Case L-3 Runtime/run/node/attempt class, '
                          'Plans/storage-plan.md:17542 and policy table :18452 at main f8b2098608')
RETENTION_CITE_DL453 = ('DL-453 item 1.a Back Seat Driver (Project editions only), '
                        'Plans/storage-plan.md:17638,17642 at main f8b2098608')

SEVERITY_ORDER = {'nit': 0, 'concern': 1, 'critical': 2}


def _severity_ge(a, b):
    return SEVERITY_ORDER[a] >= SEVERITY_ORDER[b]


def _no_authority(f, p):
    return f['primary_mutation'] is None and f['mandatory_role_satisfied'] is False


_NO_AUTH = ('no_authority', 'BSD output never mutates the primary or satisfies/fails a mandatory role.',
            _no_authority, ('fact', 'mandatory_role_satisfied'), True, {})

# slug -> [semantic entries]; each witness changes exactly one fact or payload field.
SEMANTIC = {
    'advice_emitted': [
        ('boundary', 'Emission is at an actual eligible primary step boundary.',
         lambda f, p: f['boundary_eligible'] is True, ('fact', 'boundary_eligible'), False, {}),
        ('single_delivery', 'At most one accepted note is delivered for this review cycle.',
         lambda f, p: f['prior_accepted_delivery'] is False, ('fact', 'prior_accepted_delivery'), True, {}),
        ('basis_reconfirmed', 'The reconfirmed basis has the actual newer checked finding evidence.',
         lambda f, p: f['delivery_basis'] != 'reconfirmed' or f['reconfirmation_completed'] is True,
         ('fact', 'reconfirmation_completed'), False, {}),
        ('basis_frozen', 'The frozen basis has an authentic frozen_boundary review record.',
         lambda f, p: f['delivery_basis'] != 'frozen_boundary' or f['freeze_recorded'] is True,
         ('fact', 'freeze_recorded'), False,
         {'delivery_basis': 'frozen_boundary', 'freeze_recorded': True}),
        ('basis_nit', 'async_nit requires nit and a nonterminal boundary.',
         lambda f, p: f['delivery_basis'] != 'async_nit' or (
             f['finding_severity'] == 'nit' and f['boundary_terminal'] is False),
         ('fact', 'boundary_terminal'), True,
         {'delivery_basis': 'async_nit', 'finding_severity': 'nit', 'stamped_weight': 'aside'}),
        ('basis_terminal', 'terminal_timeout_stale requires a critical held finding at an expired terminal catch-up.',
         lambda f, p: f['delivery_basis'] != 'terminal_timeout_stale' or (
             f['finding_severity'] == 'critical' and f['finding_held'] is True and f['terminal_expired'] is True),
         ('fact', 'terminal_expired'), False,
         {'delivery_basis': 'terminal_timeout_stale', 'finding_severity': 'critical', 'finding_held': True,
          'terminal_expired': True, 'boundary_terminal': True, 'stale_decision': True,
          'unreconfirmed_decision': True}),
        ('weight', 'presentation_weight equals the owner decision stamped at emission.',
         lambda f, p: p['presentation_weight'] == (
             'aside' if (f['finding_severity'] == 'nit' or f['cooldown_routed'] is True) else 'note'),
         ('payload', 'presentation_weight'), 'aside', {}),
        ('stale_mark', 'stale equals the decision for this exact delivery basis.',
         lambda f, p: p['stale'] is (f['delivery_basis'] == 'terminal_timeout_stale'),
         ('payload', 'stale'), False,
         {'delivery_basis': 'terminal_timeout_stale', 'finding_severity': 'critical', 'finding_held': True,
          'terminal_expired': True, 'boundary_terminal': True, 'stale_decision': True,
          'unreconfirmed_decision': True}),
        ('unreconfirmed_mark', 'unreconfirmed equals the decision for this exact delivery basis.',
         lambda f, p: p['unreconfirmed'] is (f['delivery_basis'] == 'terminal_timeout_stale'),
         ('payload', 'unreconfirmed'), False,
         {'delivery_basis': 'terminal_timeout_stale', 'finding_severity': 'critical', 'finding_held': True,
          'terminal_expired': True, 'boundary_terminal': True, 'stale_decision': True,
          'unreconfirmed_decision': True}),
        _NO_AUTH,
    ],
    'assignment_paused': [
        ('pause_source', 'pause_cause is proved by its actual owner command or quarantine result.',
         lambda f, p: (f['pause_cause'] == 'user' and f['pause_command_accepted'] is True) or (
             f['pause_cause'] == 'safety' and f['quarantine_result_authentic'] is True),
         ('fact', 'pause_command_accepted'), False, {}),
        ('safety_counter', 'A safety pause is the second consecutive quarantine, not the first.',
         lambda f, p: f['pause_cause'] != 'safety' or f['consecutive_quarantines'] == 2,
         ('fact', 'consecutive_quarantines'), 1,
         {'pause_cause': 'safety', 'consecutive_quarantines': 2}),
        ('pause_transition', 'Only an actual change to paused creates this event.',
         lambda f, p: f['prior_assignment_state'] != 'paused', ('fact', 'prior_assignment_state'), 'paused', {}),
        ('queue_fence', 'A paused assignment cannot queue another review.',
         lambda f, p: f['review_queued_after_pause'] is False, ('fact', 'review_queued_after_pause'), True, {}),
        _NO_AUTH,
    ],
    'assignment_resumed': [
        ('resume_source', 'Resume is the accepted explicit owner action for this assignment.',
         lambda f, p: f['resume_accepted'] is True, ('fact', 'resume_accepted'), False, {}),
        ('paused_precondition', 'The original resume source selects a paused assignment.',
         lambda f, p: f['prior_assignment_state'] == 'paused', ('fact', 'prior_assignment_state'), 'reviewing', {}),
        ('cause_clear', 'The resumed assignment clears its pause_cause.',
         lambda f, p: f['resulting_pause_cause'] is None, ('fact', 'resulting_pause_cause'), 'user', {}),
        ('cursor_preserved', 'Resume begins from the actual retained cursor.',
         lambda f, p: f['resume_cursor'] == f['retained_cursor'], ('fact', 'resume_cursor'), 'cursor-later', {}),
        _NO_AUTH,
    ],
    'assignment_started': [
        ('one_assignment', 'Double dispatch cannot create two assignments for the same actual run/stage activation.',
         lambda f, p: f['run_stage_occupied'] is False, ('fact', 'run_stage_occupied'), True, {}),
        ('seed_cursor', 'Mid-run enablement seeds the actual current primary generation.',
         lambda f, p: f['seeded_generation'] == f['current_generation'], ('fact', 'seeded_generation'), 0, {}),
        ('frozen_identity', 'The route and Persona snapshot equals the real frozen owner resolution.',
         lambda f, p: f['snapshot_ref'] == f['frozen_snapshot_ref'], ('fact', 'snapshot_ref'),
         'pmref:snapshot.unrelated', {}),
        ('tool_profile', 'The resolved profile contains only the fixed read-only permissions.',
         lambda f, p: f['tool_profile_read_only'] is True, ('fact', 'tool_profile_read_only'), False, {}),
        _NO_AUTH,
    ],
    'assignment_stopped': [
        ('stop_source', 'Stop has an actual accepted assignment or primary-ending source.',
         lambda f, p: f['stop_accepted'] is True, ('fact', 'stop_accepted'), False, {}),
        ('terminal_once', 'The source changes a nonterminal assignment to stopped once.',
         lambda f, p: f['prior_assignment_state'] != 'stopped', ('fact', 'prior_assignment_state'), 'stopped', {}),
        ('late_callback', 'A stopped assignment admits no later finding or cursor write.',
         lambda f, p: f['late_callback_applied'] is False, ('fact', 'late_callback_applied'), True, {}),
        ('wait_release', 'Stop releases actual pending catch-up waiters without primary mutation.',
         lambda f, p: f['waiters_released'] is True, ('fact', 'waiters_released'), False, {}),
        _NO_AUTH,
    ],
    'finding_cleared': [
        ('held_subject', 'The prior owner finding is held or reconfirming under this key.',
         lambda f, p: f['prior_finding_state'] in ('held', 'reconfirming'),
         ('fact', 'prior_finding_state'), 'emitted', {}),
        ('silent_review', 'The completing reconfirmation actually omits the supplied held key.',
         lambda f, p: f['clear_basis'] != 'reconfirmation_silence' or f['review_omits_key'] is True,
         ('fact', 'review_omits_key'), False, {}),
        ('newer_review', 'Silence belongs to a completed review of newer primary state.',
         lambda f, p: f['clear_basis'] != 'reconfirmation_silence' or f['review_generation_newer'] is True,
         ('fact', 'review_generation_newer'), False, {}),
        ('replacement_source', 'epoch_replaced uses the genuine primary-epoch replacement.',
         lambda f, p: f['clear_basis'] != 'epoch_replaced' or f['replacement_authentic'] is True,
         ('fact', 'replacement_authentic'), False, {'clear_basis': 'epoch_replaced'}),
        ('failed_not_silence', 'A failed or timed-out review is never a silence result.',
         lambda f, p: f['clear_basis'] != 'reconfirmation_silence' or f['review_result'] == 'silent',
         ('fact', 'review_result'), 'timed_out', {}),
        ('replacement_control_current',
         'epoch_replaced clearance consumes the authentic currently selected primary replacement control.',
         lambda f, p: f['clear_basis'] != 'epoch_replaced' or f['selected_replacement_control'] == f['live_replacement_control'],
         ('fact', 'live_replacement_control'), 'control-other', {'clear_basis': 'epoch_replaced'}),
        _NO_AUTH,
    ],
    'finding_held': [
        ('hold_basis', 'Hold basis matches severity and the actual asynchronous/terminal boundary.',
         lambda f, p: (f['hold_basis'] == 'async_high' and f['finding_severity'] in ('concern', 'critical')
                       and f['boundary_terminal'] is False) or (
                       f['hold_basis'] == 'terminal_nit' and f['finding_severity'] == 'nit'
                       and f['boundary_terminal'] is True),
         ('fact', 'hold_basis'), 'terminal_nit', {}),
        ('async_not_frozen', 'An asynchronous high-severity hold source is not a frozen immediate-delivery claim.',
         lambda f, p: f['hold_basis'] != 'async_high' or f['frozen_review'] is False,
         ('fact', 'frozen_review'), True, {}),
        ('held_persistence', 'The held finding exists under canonical owner custody outside the transcript.',
         lambda f, p: f['held_in_canonical_custody'] is True, ('fact', 'held_in_canonical_custody'), False, {}),
        ('held_no_weight', 'A held finding has no presentation_weight or delivered note.',
         lambda f, p: f['held_weight'] is None, ('fact', 'held_weight'), 'note', {}),
        ('next_preamble', 'The next eligible newer review includes the exact held key.',
         lambda f, p: f['next_preamble_includes_key'] is True, ('fact', 'next_preamble_includes_key'), False, {}),
        _NO_AUTH,
    ],
    'finding_reconfirmed': [
        ('same_key', 'Reconfirmation uses the actual held key, not a newly invented equivalent key.',
         lambda f, p: f['reconfirmed_key'] == f['held_key'], ('fact', 'reconfirmed_key'), 'finding-key-new', {}),
        ('newer_generation', 'The checked generation is newer than the raised generation.',
         lambda f, p: f['latest_checked_generation'] > f['raised_against_generation'],
         ('fact', 'latest_checked_generation'), 1, {}),
        ('explicit_reraise', 'The completed review explicitly re-raises the held finding.',
         lambda f, p: f['review_reraises_key'] is True, ('fact', 'review_reraises_key'), False, {}),
        ('count', 'The reconfirmation count is the authentic prior count plus one.',
         lambda f, p: f['reconfirmation_count'] == f['prior_count'] + 1, ('fact', 'reconfirmation_count'), 3, {}),
        ('no_downgrade', 'Severity cannot decrease to bypass hold.',
         lambda f, p: _severity_ge(f['finding_severity'], f['prior_severity']),
         ('fact', 'finding_severity'), 'nit', {}),
        ('current_evidence', 'The finding cites the newer review evidence.',
         lambda f, p: f['evidence_ref'] == f['newer_evidence_ref'], ('fact', 'evidence_ref'),
         'pmref:evidence.superseded', {}),
        _NO_AUTH,
    ],
    'finding_suppressed': [
        ('duplicate_predicate', 'duplicate_suppressed has the unchanged key/evidence and non-escalating severity.',
         lambda f, p: f['suppression_kind'] != 'duplicate' or (
             f['key_unchanged'] is True and f['evidence_unchanged'] is True and not f['severity_escalates']),
         ('fact', 'severity_escalates'), True, {}),
        ('content_free', 'content_free_suppressed has no concrete reason.',
         lambda f, p: f['suppression_kind'] != 'content_free' or f['concrete_reason'] is False,
         ('fact', 'concrete_reason'), True, {'suppression_kind': 'content_free'}),
        ('budget', 'Suppressed noise consumes no accepted-note budget.',
         lambda f, p: f['accepted_budget_consumed'] is False, ('fact', 'accepted_budget_consumed'), True, {}),
        ('cooldown_routing', 'Cooldown routes an eligible concern as an aside instead of suppressing it.',
         lambda f, p: f['cooldown_eligible_concern_dropped'] is False,
         ('fact', 'cooldown_eligible_concern_dropped'), True, {}),
        ('closed_survival', 'Unchanged durable closed keys remain closed across reset.',
         lambda f, p: f['closed_key_reopened'] is False, ('fact', 'closed_key_reopened'), True, {}),
        _NO_AUTH,
    ],
    'output_quarantined': [
        ('whole_turn', 'No part of a quarantined turn is dispatched or accepted as advice.',
         lambda f, p: f['turn_components_dispatched'] == 0, ('fact', 'turn_components_dispatched'), 1, {}),
        ('first_action', 'The first consecutive quarantine takes exactly one re_prime.',
         lambda f, p: f['consecutive_quarantine_count'] != 1 or f['terminal_action'] == 're_prime',
         ('fact', 'terminal_action'), 'pause_bsd', {}),
        ('second_action', 'The second consecutive quarantine takes pause_bsd.',
         lambda f, p: f['consecutive_quarantine_count'] != 2 or f['terminal_action'] == 'pause_bsd',
         ('fact', 'terminal_action'), 're_prime',
         {'consecutive_quarantine_count': 2, 'terminal_action': 'pause_bsd'}),
        ('success_reset', 'A successful review resets the quarantine counter.',
         lambda f, p: f['counter_after_success'] == 0, ('fact', 'counter_after_success'), 1, {}),
        ('warning_once', 'The second-quarantine host warning is deduplicated by the original pause source.',
         lambda f, p: f['warning_publications'] <= 1, ('fact', 'warning_publications'), 2, {}),
        ('raw_not_rendered', 'Raw quarantined output is never rendered in an advice surface.',
         lambda f, p: f['raw_rendered'] is False, ('fact', 'raw_rendered'), True, {}),
        _NO_AUTH,
    ],
    'policy_changed': [
        ('revision_cas', 'The accepted policy change checks the actual expected prior revision.',
         lambda f, p: f['expected_policy_revision'] == f['actual_prior_revision'],
         ('fact', 'expected_policy_revision'), 0, {}),
        ('actual_change', 'changed_fields exactly names fields whose semantic values changed.',
         lambda f, p: f['claimed_changed_fields'] == f['actual_changed_fields'],
         ('fact', 'claimed_changed_fields'), ['mode'], {}),
        ('canonical_preferences', 'Only canonical safety.approvals.bsd-* preference writes feed policy resolution.',
         lambda f, p: f['legacy_alias_write'] is False, ('fact', 'legacy_alias_write'), True, {}),
        ('freeze_preserved', 'A policy default change cannot rewrite an existing frozen binding.',
         lambda f, p: f['frozen_binding_rewritten'] is False, ('fact', 'frozen_binding_rewritten'), True, {}),
        ('explicit_off', 'Import preserves an explicitly stored Off.',
         lambda f, p: f['explicit_off_migrated'] is False, ('fact', 'explicit_off_migrated'), True, {}),
        _NO_AUTH,
    ],
    'review_failed': [
        ('failed_source', 'The actual terminal review result is failed.',
         lambda f, p: f['terminal_result'] == 'failed', ('fact', 'terminal_result'), 'silent', {}),
        ('single_terminal', 'The review cycle has one selected terminal outcome.',
         lambda f, p: f['prior_terminal'] is None, ('fact', 'prior_terminal'), 'timed_out', {}),
        ('bounded_overflow', 'input_does_not_fit follows only one failed fresh-context replay.',
         lambda f, p: f['failure_kind'] != 'input_does_not_fit' or f['fresh_context_replays'] == 1,
         ('fact', 'fresh_context_replays'), 2,
         {'failure_kind': 'input_does_not_fit', 'fresh_context_replays': 1}),
        ('waiter_release', 'Known failure releases pending catch-up waiters.',
         lambda f, p: f['waiters_released'] is True, ('fact', 'waiters_released'), False, {}),
        ('usage_unknown', 'Missing actual cost/attempt stays unknown rather than fabricated zero.',
         lambda f, p: f['usage_attribution_present'] is True or f['usage_fabricated_zero'] is False,
         ('fact', 'usage_fabricated_zero'), True, {}),
        ('failure_exit_code', 'A success exit code cannot substantiate a failed result; absence is not synthesized as zero.',
         lambda f, p: f['exit_code'] is None or f['exit_code'] != 0, ('fact', 'exit_code'), 0, {}),
        _NO_AUTH,
    ],
    'review_started': [
        ('actual_admission', 'Provider work requires actual shared resource and route admission.',
         lambda f, p: f['resource_admission_accepted'] is True, ('fact', 'resource_admission_accepted'), False, {}),
        ('no_call', 'A no_call_* evaluation creates no review-start/provider attempt.',
         lambda f, p: not str(f['evaluation']).startswith('no_call'), ('fact', 'evaluation'), 'no_call_off', {}),
        ('bounded_manifest', 'Input is the bounded delta and typed refs from the actual cursor.',
         lambda f, p: f['manifest_is_bounded_delta'] is True, ('fact', 'manifest_is_bounded_delta'), False, {}),
        ('redaction_before_route', 'The original manifest redaction receipt precedes advisor-route access.',
         lambda f, p: f['redaction_receipt_present'] is True, ('fact', 'redaction_receipt_present'), False, {}),
        ('held_preamble', 'The actual held keys are present for a reconfirmation review.',
         lambda f, p: f['trigger_kind'] != 'repeated_normalized_failure' or f['held_keys_in_preamble'] is True,
         ('fact', 'held_keys_in_preamble'), False, {'trigger_kind': 'repeated_normalized_failure'}),
        ('freeze_source', 'frozen_boundary=true has an actual synchronous frozen safe point.',
         lambda f, p: f['frozen_boundary'] is False or f['owner_freeze_recorded'] is True,
         ('fact', 'owner_freeze_recorded'), False, {'frozen_boundary': True, 'owner_freeze_recorded': True}),
        _NO_AUTH,
    ],
    'review_timed_out': [
        ('real_deadline', 'The actual review deadline has expired.',
         lambda f, p: f['deadline_expired'] is True, ('fact', 'deadline_expired'), False, {}),
        ('not_catchup', 'Catch-up release/expiry alone is not review timeout.',
         lambda f, p: f['expiry_kind'] == 'review_deadline', ('fact', 'expiry_kind'), 'catchup_cap', {}),
        ('timeout_terminal', 'The cycle has no previously accepted terminal result.',
         lambda f, p: f['prior_terminal'] is None, ('fact', 'prior_terminal'), 'silent', {}),
        ('late_result', 'Late results cannot replace this terminal timeout.',
         lambda f, p: f['late_result_replaced'] is False, ('fact', 'late_result_replaced'), True, {}),
        ('wait_release', 'Review timeout releases its catch-up waiters.',
         lambda f, p: f['waiters_released'] is True, ('fact', 'waiters_released'), False, {}),
        _NO_AUTH,
    ],
    'workflow_binding_created': [
        ('accepted_binding', 'An accepted configuration or workflow start actually committed the binding.',
         lambda f, p: f['binding_accepted'] is True, ('fact', 'binding_accepted'), False, {}),
        ('stage_mapping', 'The binding uses the actual BSD-029 operational stage expansion.',
         lambda f, p: f['stage_in_mapping'] is True, ('fact', 'stage_in_mapping'), False, {}),
        ('frozen_binding', 'The run consumes the immutable accepted binding revision and identity.',
         lambda f, p: f['past_review_rewritten'] is False, ('fact', 'past_review_rewritten'), True, {}),
        ('revision_lineage', 'A replacement revision links its actual immutable previous binding.',
         lambda f, p: f['previous_binding_ref'] == f['actual_previous_binding_ref'],
         ('fact', 'previous_binding_ref'), 'pmref:binding.unrelated', {}),
        ('off_no_assignment', 'An off stage creates no assignment.',
         lambda f, p: f['off_stage_assignment_created'] is False, ('fact', 'off_stage_assignment_created'), True, {}),
        _NO_AUTH,
    ],
}

# Positive owner decision facts per family (every semantic conjunct holds).
POSITIVE_FACTS = {
    'advice_emitted': {
        'boundary_eligible': True, 'prior_accepted_delivery': False, 'delivery_basis': 'reconfirmed',
        'reconfirmation_completed': True, 'freeze_recorded': False, 'finding_severity': 'concern',
        'boundary_terminal': False, 'finding_held': True, 'terminal_expired': False,
        'cooldown_routed': False, 'stamped_weight': 'note', 'stale_decision': False,
        'unreconfirmed_decision': False, 'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'assignment_paused': {
        'pause_cause': 'user', 'pause_command_accepted': True, 'quarantine_result_authentic': True,
        'consecutive_quarantines': 0, 'prior_assignment_state': 'reviewing',
        'review_queued_after_pause': False, 'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'assignment_resumed': {
        'resume_accepted': True, 'prior_assignment_state': 'paused', 'resulting_pause_cause': None,
        'resume_cursor': 'cursor-0007', 'retained_cursor': 'cursor-0007',
        'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'assignment_started': {
        'run_stage_occupied': False, 'resolved_mode': 'Auto', 'seeded_generation': 4,
        'current_generation': 4, 'snapshot_ref': 'pmref:snapshot.frozen.0001',
        'frozen_snapshot_ref': 'pmref:snapshot.frozen.0001', 'tool_profile_read_only': True,
        'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'assignment_stopped': {
        'stop_accepted': True, 'prior_assignment_state': 'reviewing', 'late_callback_applied': False,
        'waiters_released': True, 'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'finding_cleared': {
        'prior_finding_state': 'held', 'clear_basis': 'reconfirmation_silence', 'review_omits_key': True,
        'review_generation_newer': True, 'replacement_authentic': True, 'review_result': 'silent',
        'selected_replacement_control': 'control-0001', 'live_replacement_control': 'control-0001',
        'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'finding_held': {
        'hold_basis': 'async_high', 'finding_severity': 'concern', 'boundary_terminal': False,
        'frozen_review': False, 'held_in_canonical_custody': True, 'held_weight': None,
        'next_preamble_includes_key': True, 'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'finding_reconfirmed': {
        'reconfirmed_key': 'finding-key-0001', 'held_key': 'finding-key-0001',
        'latest_checked_generation': 5, 'raised_against_generation': 3, 'review_reraises_key': True,
        'reconfirmation_count': 2, 'prior_count': 1, 'finding_severity': 'concern',
        'prior_severity': 'concern', 'evidence_ref': 'pmref:evidence.newer.0001',
        'newer_evidence_ref': 'pmref:evidence.newer.0001', 'primary_mutation': None,
        'mandatory_role_satisfied': False,
    },
    'finding_suppressed': {
        'suppression_kind': 'duplicate', 'key_unchanged': True, 'evidence_unchanged': True,
        'severity_escalates': False, 'concrete_reason': False, 'accepted_budget_consumed': False,
        'cooldown_eligible_concern_dropped': False, 'closed_key_reopened': False,
        'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'output_quarantined': {
        'turn_components_dispatched': 0, 'consecutive_quarantine_count': 1, 'terminal_action': 're_prime',
        'counter_after_success': 0, 'warning_publications': 1, 'raw_rendered': False,
        'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'policy_changed': {
        'expected_policy_revision': 3, 'actual_prior_revision': 3,
        'claimed_changed_fields': ['trigger_sensitivity'], 'actual_changed_fields': ['trigger_sensitivity'],
        'legacy_alias_write': False, 'frozen_binding_rewritten': False, 'explicit_off_migrated': False,
        'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'review_failed': {
        'terminal_result': 'failed', 'prior_terminal': None, 'failure_kind': 'provider_error',
        'fresh_context_replays': 0, 'waiters_released': True, 'usage_attribution_present': False,
        'usage_fabricated_zero': False, 'exit_code': None, 'primary_mutation': None,
        'mandatory_role_satisfied': False,
    },
    'review_started': {
        'resource_admission_accepted': True, 'evaluation': 'started', 'manifest_is_bounded_delta': True,
        'redaction_receipt_present': True, 'trigger_kind': 'pre_first_material_mutation',
        'held_keys_in_preamble': True, 'frozen_boundary': False, 'owner_freeze_recorded': False,
        'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
    'review_timed_out': {
        'deadline_expired': True, 'expiry_kind': 'review_deadline', 'prior_terminal': None,
        'late_result_replaced': False, 'waiters_released': True, 'primary_mutation': None,
        'mandatory_role_satisfied': False,
    },
    'workflow_binding_created': {
        'binding_accepted': True, 'stage_in_mapping': True, 'past_review_rewritten': False,
        'previous_binding_ref': 'pmref:binding.previous.0001',
        'actual_previous_binding_ref': 'pmref:binding.previous.0001',
        'off_stage_assignment_created': False, 'primary_mutation': None, 'mandatory_role_satisfied': False,
    },
}


def _load(path):
    return json.loads(path.read_text())


def load_families():
    plan = _load(PLAN)
    payloads = _load(PAYLOADS)
    out = []
    for fam in plan['families']:
        slug = fam['event_type'].split('.', 1)[1]
        producer, subject, kind, backed = _META[slug]
        schema = payloads['$defs'][slug]
        retention = RETENTION_RUNTIME if backed else RETENTION_DL453
        out.append({
            'slug': slug,
            'event_type': fam['event_type'],
            'payload_schema_id': schema['properties']['schema_id']['const'],
            'payload_schema_ref': fam['payload_schema_ref'],
            'producer': producer,
            'subject_field': subject,
            'source_kind': kind,
            'logical_schema_id': f'pm.bsd.{kind}.v1',
            'assignment_backed': backed,
            'retention': retention,
            'retention_citation': RETENTION_CITE_RUNTIME if backed else RETENTION_CITE_DL453,
            'semantic': SEMANTIC[slug],
            'positive_facts': POSITIVE_FACTS[slug],
            'owner_units': fam['owner_units'],
        })
    return out


FAMILIES = load_families()
SLUGS = tuple(f['slug'] for f in FAMILIES)
BY_SLUG = {f['slug']: f for f in FAMILIES}