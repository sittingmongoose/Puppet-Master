"""Declared targets for the ATS-211 history fixtures (C12-GH1, G4).

Each authored negative names the row its author meant it to refuse: the case id
states the defect, and the row is the table row whose invariant reads that
field (scripts/pm_goal_history_reader_fixtures.py, history_guards / joins /
original_row_guards). A target is fixed here, before the case runs, and never
read back from an observed refusal. A case whose defect also breaks a copy or
digest compared by another row keeps its single declared target; the ledger
then classifies it multiple_refusals and gives it no kill credit.

Cases with no declared target below stay `undeclared` (regression evidence only).
"""
import re

SOURCE_FLAGS = ('authorized', 'retained', 'reader_available', 'secret_safe', 'frame_verified', 'translation_verified')
RECEIPT_FIELDS = ('storage_instance_id', 'event_id', 'event_type', 'payload_schema_id', 'idempotency_key')
RUNTIME_FIELDS = ('actor_ref', 'execution_role', 'requested_provider_ref', 'effective_provider_ref',
                  'requested_model_ref', 'effective_model_ref', 'requested_account_ref', 'effective_account_ref')

# Shared id -> row rules; each row name is a literal of the history reader.
COMMON = {
    'final_fence_changed': 'source/final_fence',            # s['captured_fence'] == current['final_fence']
    'raw_project_partition': 'source/index_key',            # index key over base64url project partition
    'forged_disclosed_event': 'source/unchanged_event',     # ev == current['event']
    'stale_actual_token': 'source/actual_token',            # token == current['token']
    'missing_original_admission': 'original/writer_admission',
    'admission_event_type': 'original/admission/event_type',
    'admission_payload_schema_id': 'original/admission/payload_schema_id',
    'admission_registry_checkpoint': 'original/checkpoint',
    'admission_owner_unit': 'original/owner_unit',
    'predecessor_goal_revision': 'original/revision_cas',
    'boolean_predecessor_revision': 'original/revision_cas',
    'predecessor_goal_id': 'original/predecessor/goal_id',
    'predecessor_project_id': 'original/predecessor/project_id',
    'semantic_digest': 'original/semantic_digest',
    'token_checkpoint_key': 'join/token/checkpoint_key',
    'token_checkpoint_ref': 'join/token/checkpoint_ref',
    'token_index_dataset_name': 'join/token/dataset',
    'token_source_storage': 'join/token/source_storage',
    'inner_project_mismatch': 'join/envelope/project_id',
    'wrong_ordinary_revision_step': 'original/revision_step',
    'represented_thread_id_mismatch': 'join/envelope/thread_id',
    'represented_idempotency_key_mismatch': 'join/envelope/idempotency_key',
    'post_digest_helper_candidate_drift': 'source/unchanged_event',
    'selector_event_mismatch': 'join/selector/event_id',
    'selector_sequence_mismatch': 'join/selector/sequence_id',
    'selector_project_id_foreign': 'join/selector/project_id',
    'selector_goal_id_foreign': 'join/selector/goal_id',
}
COMMON.update({'missing_' + flag: 'source/' + flag for flag in SOURCE_FLAGS})
COMMON.update({'receipt_' + field: 'original/first_receipt/' + field for field in RECEIPT_FIELDS})
COMMON.update({'runtime_' + field: 'original/runtime/' + field for field in RUNTIME_FIELDS})
COMMON.update({'outer_inner_' + field: 'join/envelope/' + field for field in
               ('actor_ref', 'correlation_id', 'requested_account_ref', 'effective_account_ref',
                'occurred_at_utc', 'event_type', 'payload_schema_id')})

# Family rows of original_row_guards, by authored case id.
FAMILY = {
    'child_status': {
        'child_goal_id': 'row/child_identity',
        'child_state_before': 'row/child_predecessor',
        'child_state_after': 'row/child_successor',
        'illegal_child_edge': 'row/child_legal_edge',
        'parent_state_changed': 'row/child_parent_preserved',
        # pre is unchanged and nonterminal; only pre==post is broken.
        'terminal_parent': 'row/child_parent_preserved',
    },
    'degraded': {
        'illegal_degraded_source': 'row/degraded_edge',
        'required_mutation_affected': 'row/degraded_standard',
        'missing_exception': 'row/degraded_exception',
        'unapproved_risk': 'row/degraded_approval',
        'strong_verifier_unavailable': 'row/degraded_tier',
        'repeated_unchanged_risk': 'row/degraded_new_risk',
    },
    'progressed': {
        'progress_wrong_predecessor': 'row/progress_predecessor',
        'progress_wrong_successor': 'row/progress_successor',
        'progress_wrong_artifacts': 'row/progress_artifacts',
        'cross_array_task_reuse': 'row/progress_disjoint_tasks',
        'mismatched_repeat_count': 'row/progress_repeat_count',
        'mismatched_repeat_evidence': 'row/progress_repeat_evidence',
    },
    'replanned': {
        'replan_terminal_source': 'row/replanned_edge',
        'replan_stale_evidence': 'row/replanned_evidence',
        'replan_wrong_new_revision': 'row/replanned_revision',
        'replan_missing_child_decision': 'row/replanned_children',
    },
    'scheduled': {
        'terminal_source': 'row/scheduled_edge',
        'no_budget': 'row/scheduled_budget',
        'permission_denied': 'row/scheduled_permission',
        'viewer': 'row/scheduled_writer',
        'recovery_unknown': 'row/scheduled_recovery_truth',
        'blocked_missing_recovery': 'row/scheduled_recovery',
        'not_yet_eligible': 'row/scheduled_time',
    },
    # C12-GH2 (lane 16): the five remaining history families. Each id names
    # the original fact its author changed; the row is the one whose
    # invariant reads that fact (original_row_guards).
    'stopped': {
        'stop_replanning': 'row/stopped_edge',              # state_before outside the stop edge set
        'stop_recovery_unknown': 'row/stopped_recovery',    # resumable stop, recovery not resolved
        'stop_unauthorized': 'row/stopped_authority',       # resumable stop, permission denied
        'stop_unsettled': 'row/stopped_settlement',         # settlement refs not in settled_refs
        # pre == 'stopped' and previous_boundary == current_boundary ('new').
        'stop_repeated_unchanged': 'row/stopped_new_boundary',
    },
    'verification_decided': {
        'verification_paused_source': 'row/verification_edge',
        'wrong_verifier': 'row/verification_owner',
        'wrong_cycle': 'row/verification_cycle',
        'missing_closure': 'row/verification_closure',      # passed, closure refs not current evidence
        'strong_third_failure_no_adjudicator': 'row/verification_adjudicator',
    },
    'evidence_captured': {
        'evidence_terminal': 'row/evidence_state',
        'evidence_hash_mismatch': 'row/evidence_hash',
        'evidence_provenance_mismatch': 'row/evidence_provenance',
        # Envelope redaction differs from the payload's; digest and source copy kept coherent.
        'outer_inner_redaction': 'row/evidence_redaction',
        'inverted_original_span': 'row/evidence_span',
    },
    'receipt_recorded': {
        'receipt_paused': 'row/receipt_state',
        'receipt_identity': 'row/receipt_identity',
        'receipt_decision': 'row/receipt_decision',
        'receipt_dependency_missing': 'row/receipt_dependencies',
        'missing_original_exception_risk': 'row/receipt_exception',
    },
    'tool_check_recorded': {
        'tool_terminal': 'row/tool_state',
        'tool_call_identity': 'row/tool_identity',
        'tool_permission_owner': 'row/tool_permission',
    },
}


def protocol_target(key, case):
    ident = case['id']
    if ident in FAMILY.get(key, {}):
        return FAMILY[key][ident]
    if ident in COMMON:
        return COMMON[ident]
    # C12-GH2: a source flag of another JSON type is still not `True`; the
    # source row `s[flag] is True` reads it (every family authors these).
    match = re.fullmatch(r'type_(' + '|'.join(SOURCE_FLAGS) + r')_(?:string_false|string_zero|null|array|object|number)', ident)
    if match:
        return 'source/' + match.group(1)
    match = re.fullmatch(r'unresolved_(.+)', ident) or re.fullmatch(r'boolean_resolved_revision_(.+)', ident)
    if match:
        return 'original/record/' + match.group(1)
    match = re.fullmatch(r'typed_boolean_(required_check_affected|mutation_affected|exception_required|risk_accepted)_wrong_.+', ident)
    if match and key == 'degraded':
        return 'row/degraded_boolean/' + match.group(1)
    if key == 'scheduled' and ident.startswith('type_remaining_budget_'):
        return 'row/scheduled_budget'
    return None


def join_target(key, case):
    return COMMON.get(case['id'])


def identity_join_target(key, case):
    return COMMON.get(case['id'])


def refusal_target(key, case):
    # Current-writer prohibition precedes dedupe for every mode and scope.
    return 'current_writer/prohibited'
