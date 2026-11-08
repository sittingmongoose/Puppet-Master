"""DDBG guard constants: literal module constants only.

The phase modules pm_debug_investigation_guards_<phase>.py import these with
`from pm_debug_investigation_guard_constants import NAME`; each is a single
top-level literal binding, so the guard-isolation tool certifies the import as
immutable data and does not scan this module (GUARDTOOL-ADOPTION.md,
"The lane's own module").

Every refusal of the DDBG static checkers is a named predicate row in a guard
table. A checker is a sequence of phases; each phase is a fresh g.Case whose
check calls table.validate (schema rows) and table.require (code rows) in the
original order and returns True. The production entry points in
pm_debug_investigation_transitions.py run these same Case objects and report
the issued row; the proof adapter pm_debug_investigation_guard_suites.py gives
each phase to the shared guard-isolation tool.

Domain rule. A code predicate checks one invariant on inputs inside its schema
domain. Where an input it reads is outside that domain (not an object, a
missing member, a wrong type, a value outside a closed enum or length bound),
the predicate passes and the named schema row that owns the domain refuses the
input instead: a phase validates its own schema subjects before any code row,
and the payload phase validates the payload before any later phase runs. No
refusal leaves the complete checker: each such input is refused by its schema
row. Predicates are total, so the lane runner can run every phase on every
fixture negative and require that exactly one phase refuses it.

Factories compute only selections and measurements a predicate may not compute
itself (the referenced detail record, encoded byte sizes, the encoded Project
partition, recomputed identities and digests); the predicate makes the
decision. Static models only: source, proof and detail values are fixture
projections; native append, Storage and evidence dereference remain NOT_RUN.
"""

INLINE_LIMIT = 16384

RECIPE_REF = 'debug-project-rfc8785-v1'

CURRENT_WRITER_POLICY = 'dedupe_by_idempotency_key'

READER_ONLY_POLICY = 'projector_replay_only'

PROJECT_PREFIX = 'project~'

STARTED_EVENT = 'debug.investigation.started'

CONTEXT_STATE_EVENT = 'debug.investigation.context_item_state_changed'

LIFECYCLE_URI = 'https://pm.invalid/debug/lifecycle_source.schema.json'

LIFECYCLE_ROOTS = ('https://pm.invalid/debug/lifecycle_source.schema.json',)

SOURCE_URI = 'https://pm.invalid/debug/instrumentation_source.schema.json'

SOURCE_ROOTS = ('https://pm.invalid/debug/instrumentation_source.schema.json',)

# The original source schema is judged in two exact parts: structure (type,
# closed members, required list) and its property value constraints.
SOURCE_VALUES_URI = 'https://pm.invalid/debug/instrumentation_source.values.schema.json'

SOURCE_VALUES_ROOTS = ('https://pm.invalid/debug/instrumentation_source.values.schema.json',)

DETAIL_URI = 'https://pm.invalid/debug/instrumentation_change_detail.schema.json'

DETAIL_ROOTS = ('https://pm.invalid/debug/instrumentation_change_detail.schema.json',)

# The detail schema is judged in six exact parts (structure: type, closed
# members and the first half of the required list; the second half of the
# required list; then the value constraints of its properties 1-5 (values A),
# 6-10 (values D), 11-20 (values B) and 21-30 (values C)), so each part's schema
# rows are attributed on their own; pm_debug_investigation_transitions.
# detail_documents() checks the parts recombine to the published definition.
DETAIL_VALUES_A_URI = 'https://pm.invalid/debug/instrumentation_change_detail.values_a.schema.json'

DETAIL_VALUES_A_ROOTS = ('https://pm.invalid/debug/instrumentation_change_detail.values_a.schema.json',)

DETAIL_VALUES_B_URI = 'https://pm.invalid/debug/instrumentation_change_detail.values_b.schema.json'

DETAIL_VALUES_B_ROOTS = ('https://pm.invalid/debug/instrumentation_change_detail.values_b.schema.json',)

DETAIL_VALUES_C_URI = 'https://pm.invalid/debug/instrumentation_change_detail.values_c.schema.json'

DETAIL_VALUES_C_ROOTS = ('https://pm.invalid/debug/instrumentation_change_detail.values_c.schema.json',)

DETAIL_VALUES_D_URI = 'https://pm.invalid/debug/instrumentation_change_detail.values_d.schema.json'

DETAIL_VALUES_D_ROOTS = ('https://pm.invalid/debug/instrumentation_change_detail.values_d.schema.json',)

DETAIL_REQUIRED_URI = 'https://pm.invalid/debug/instrumentation_change_detail.required_b.schema.json'

DETAIL_REQUIRED_ROOTS = ('https://pm.invalid/debug/instrumentation_change_detail.required_b.schema.json',)

# The payloads of instrumentation_state_changed, started, target_bound and
# state_changed are judged in two exact parts: structure (type, closed members,
# required list, conditionals) in the payload phase and their property value
# constraints in the payload values phase.
PAYLOAD_VALUES_URI = 'https://pm.invalid/debug/payload.values.schema.json'

PAYLOAD_VALUES_ROOTS = ('https://pm.invalid/debug/payload.values.schema.json',)

PAYLOAD_URI = 'https://pm.invalid/debug/payload.schema.json'

PAYLOAD_ROOTS = ('https://pm.invalid/debug/payload.schema.json',)

RETRY_URI = 'https://pm.invalid/debug/cleanup_retry_request.schema.json'

RETRY_ROOTS = ('https://pm.invalid/debug/cleanup_retry_request.schema.json',)

FAILED_REASONS = (
    'investigation.verification_failed', 'investigation.no_repro_observed',
    'investigation.budget_exhausted', 'investigation.runtime_unavailable',
    'investigation.target_unreachable', 'investigation.adapter_unavailable')

TERMINAL = ('failed', 'resolved', 'cancelled', 'superseded')

ATTENTION = (
    'auth_handoff_required', 'manual_repro_required', 'manual_verification_required',
    'external_app_start_required', 'session_reconnect_required',
    'missing_credentials_or_secret', 'degraded_evidence_review_required',
    'sensitive_capture_review_required', 'adapter_switch_recommended',
    'target_selection_required', 'workspace_binding_required', 'import_bundle_required')

# Closed vocabularies the predicates use for their domain; the lane runner
# checks that each equals its schema enum.
LIFECYCLE_STATES = ('active', 'blocked', 'attention_required', 'verifying', 'failed_cleanup',
                    'resolved', 'failed', 'cancelled', 'superseded')

LIFECYCLE_PHASES = ('target_binding', 'baseline_capture', 'instrumentation', 'reproduction',
                    'analysis', 'repair', 'verification', 'cleanup')

CONTEXT_STATES = ('active', 'redacted', 'revoked', 'blocked', 'expired', 'omitted')

INSTR_STATES = ('planned', 'active', 'collecting', 'cleanup_pending', 'cleanup_failed', 'cleaned')

CLEANUP_RESULTS = ('not_needed', 'pending', 'succeeded', 'failed', 'superseded')

TRANSITION_KINDS = (
    'installation_succeeded', 'collection_started', 'collection_paused_or_finished',
    'ended_never_needed', 'leftovers_require_cleanup', 'inspection_never_needed',
    'removal_succeeded', 'removal_failed', 'retry_begins', 'retry_outcome_succeeded',
    'retry_outcome_failed', 'responsibility_handoff', 'receiving_owner_begins',
    'receiving_owner_cannot_retry', 'replacement_never_needed')

# The eight legal (status, cleanup result) pairs of DL-429.
PAIRS = (('planned', 'not_needed'), ('active', 'pending'), ('collecting', 'pending'),
         ('cleanup_pending', 'pending'), ('cleanup_pending', 'superseded'),
         ('cleanup_failed', 'failed'), ('cleaned', 'not_needed'), ('cleaned', 'succeeded'))

# Exactly the approved edges, including both retry outcome alternatives:
# (transition kind, approved before pairs, the one after pair).
EDGES = (
    ('installation_succeeded', (('planned', 'not_needed'),), ('active', 'pending')),
    ('collection_started', (('active', 'pending'),), ('collecting', 'pending')),
    ('collection_paused_or_finished', (('collecting', 'pending'),), ('active', 'pending')),
    ('ended_never_needed', (('planned', 'not_needed'), ('active', 'pending'), ('collecting', 'pending')), ('cleaned', 'not_needed')),
    ('leftovers_require_cleanup', (('planned', 'not_needed'), ('active', 'pending'), ('collecting', 'pending')), ('cleanup_pending', 'pending')),
    ('inspection_never_needed', (('cleanup_pending', 'pending'), ('cleanup_pending', 'superseded'), ('cleanup_failed', 'failed')), ('cleaned', 'not_needed')),
    ('removal_succeeded', (('cleanup_pending', 'pending'),), ('cleaned', 'succeeded')),
    ('removal_failed', (('cleanup_pending', 'pending'),), ('cleanup_failed', 'failed')),
    ('retry_begins', (('cleanup_failed', 'failed'),), ('cleanup_pending', 'pending')),
    ('retry_outcome_succeeded', (('cleanup_pending', 'pending'),), ('cleaned', 'succeeded')),
    ('retry_outcome_failed', (('cleanup_pending', 'pending'),), ('cleanup_failed', 'failed')),
    ('responsibility_handoff', (('planned', 'not_needed'), ('active', 'pending'), ('collecting', 'pending'),
                                ('cleanup_pending', 'pending'), ('cleanup_failed', 'failed')), ('cleanup_pending', 'superseded')),
    ('receiving_owner_begins', (('cleanup_pending', 'superseded'),), ('cleanup_pending', 'pending')),
    ('receiving_owner_cannot_retry', (('cleanup_pending', 'superseded'),), ('cleanup_failed', 'failed')),
    ('replacement_never_needed', (('planned', 'not_needed'), ('active', 'pending'), ('collecting', 'pending')), ('cleaned', 'not_needed')))

NEVER_NEEDED = ('ended_never_needed', 'inspection_never_needed', 'replacement_never_needed')

REMOVAL_SUCCESS = ('removal_succeeded', 'retry_outcome_succeeded')

NEEDS_OBLIGATIONS = ('leftovers_require_cleanup', 'removal_failed', 'retry_outcome_failed',
                     'responsibility_handoff', 'receiving_owner_cannot_retry')

RECEIVING = ('receiving_owner_begins', 'receiving_owner_cannot_retry')

ATTEMPT_KINDS = ('leftovers_require_cleanup', 'retry_begins', 'receiving_owner_begins',
                 'removal_succeeded', 'removal_failed', 'retry_outcome_succeeded', 'retry_outcome_failed')

RETRY_CEILING = 2

HEX = '0123456789abcdef'

DIGEST_FIELDS = ('scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
                 'attempt_id', 'actor_ref', 'requested_account_ref',
                 'effective_account_ref', 'occurred_at_utc', 'producer_sequence_id',
                 'correlation_id', 'causation_event_id', 'parent_event_id',
                 'idempotency_key', 'payload_schema_id', 'payload_ref',
                 'redaction_profile', 'migration')
