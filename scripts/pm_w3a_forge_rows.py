"""W3A guard-table row inventory (Method B, gated tool 004bdedd63).

One row = one predicate over one observation the checker derives from the
complete boundary input. Shared phases apply to all 35 families; payload_<slug>
and source_<slug> phases are generated per family from its closed payload
schema, its source joins and its three FGI semantic conjuncts. The generator
(scripts/pm-w3a-table-generate.py) renders these rows into table modules; the
checker (scripts/pm_w3a_forge_events.py) refuses only through those modules.
Each row: (row_id, field, invariant, refusal_code, plan_guards).
plan_guards names the W3A-oracle-plan.json guard suffixes the row realizes.
"""
import json
from pathlib import Path

import pm_w3a_forge_spec as spec

ROOT = Path(__file__).resolve().parents[1]
UINT_SLOTS = ('publication_revision', 'matched_count', 'cursor_sequence', 'frontier_revision',
              'selected_segment_generation', 'manifest_generation', 'recovery_epoch')
RECEIPT_UINT = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')
# current_ref and manifest_ref are schema constants (CP01 judges them); every other selection field joins here.
SELECTION_FIELDS = ('storage_instance_id', 'current_bytes_sha256', 'selected_segment_generation',
                    'manifest_bytes_sha256', 'manifest_generation', 'recovery_epoch',
                    'manifest_survivor_prefix_sha256', 'retained_inventory_sha256', 'durable_watermarks_sha256',
                    'excluded_ranges_sha256', 'retired_inputs_sha256')
TOKEN_FIELDS = ('storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id', 'generation_anchor_sha256',
                'frontier_revision', 'frontier_sha256', 'index_dataset_name')
EFFECTS = ('command', 'network', 'notification', 'provider_mutation', 'usage_charge', 'canonical_source_write', 'event_append')
OWNER_CONTROLS = ('permission', 'stop', 'lease', 'capability')

SHARED = {
    'admission': ('Current writer admission before dedupe (CV-12xx, SP-12xx)', [
        ('AD01_cutoff_open', 'cutoff_open', 'no reviewed writer cutoff fence closes this family before dedupe', 'writer_withdrawn', ['withdrawal']),
        ('AD02_membership', 'membership', 'exact family/payload/version is in the admitted registry', 'missing_event_registration', ['new_append_membership']),
        ('AD03_not_replay_only', 'not_replay_only', 'current_append_policy refuses projector_replay_only', 'replay_only_not_appendable', ['replay_only']),
        ('AD04_replay_policy', 'replay_policy', 'replay_policy is exactly dedupe_by_idempotency_key', 'replay_policy_invalid', ['replay_only']),
        ('AD05_dedupe_available', 'dedupe_available', 'authoritative global and scoped dedupe are available', 'dedupe_unavailable', ['dedupe']),
    ] + [(f'AD{6 + i:02d}_control_{c}', f'control_{c}', f'current {c} control admits new work', 'owner_controls_refused', ['source_native'])
         for i, c in enumerate(OWNER_CONTROLS)]),
    'envelope': ('EventRecord 2.0.0 envelope joins (CV-317, CV-12xx)', [
        ('EN01_envelope_schema', 'envelope_schema', 'the EventRecord 2.0.0 schema validates (formats checked by EN02-EN04)', 'envelope_invalid', ['scope']),
        ('EN02_occurred_clock', 'occurred_clock', 'occurred_at_utc passes date_time with the event_record profile', 'envelope_invalid', ['timestamps']),
        ('EN03_observed_clock', 'observed_clock', 'observed_at_utc passes date_time with the storage_utc_z profile', 'envelope_invalid', ['timestamps']),
        ('EN04_persisted_clock', 'persisted_clock', 'persisted_at_utc passes date_time with the storage_utc_z profile', 'envelope_invalid', ['timestamps']),
        ('EN05_sequence_uint64', 'sequence_uint64', 'sequence_id passes storage_uint64', 'envelope_invalid', ['numbers', 'storage_metadata']),
        ('EN06_producer_sequence', 'producer_sequence', 'producer_sequence_id is null or passes current_integer(minimum=0)', 'envelope_invalid', ['numbers']),
        ('EN07_producer_qualified', 'producer_qualified', 'producer_semantic_digest qualifies the full producer projection', 'producer_route_refused', ['numbers', 'same_retry']),
        ('EN08_family', 'family', 'event_type is the family', 'envelope_invalid', ['new_append_membership']),
        ('EN09_payload_schema', 'payload_schema', 'payload_schema_id is the family payload schema id', 'envelope_invalid', ['new_append_membership']),
        ('EN10_redaction_join', 'redaction_join', 'redaction_profile equals the source profile secret_refs_only', 'envelope_invalid', ['redaction']),
        ('EN12_project_join', 'project_join', 'project_id equals the original owner scope project_id', 'scope_mismatch', ['scope']),
        ('EN13_thread_null', 'thread_null', 'thread_id is present null', 'scope_mismatch', ['scope']),
        ('EN14_run_null', 'run_null', 'run_id is present null (a provider pipeline id never fills it)', 'scope_mismatch', ['scope']),
        ('EN15_node_null', 'node_null', 'node_id is present null', 'scope_mismatch', ['scope']),
        ('EN16_attempt_null', 'attempt_null', 'attempt_id is present null', 'scope_mismatch', ['scope']),
        ('EN17_occurred_join', 'occurred_join', 'occurred_at_utc is the original source time string', 'source_join_failed', ['scope']),
        ('EN18_actor_join', 'actor_join', 'actor_ref is the original source actor', 'source_join_failed', ['scope']),
        ('EN19_requested_account_join', 'requested_account_join', 'requested_account_ref is the original source value', 'source_join_failed', ['scope']),
        ('EN20_effective_account_join', 'effective_account_join', 'effective_account_ref is the original source value', 'source_join_failed', ['scope']),
        ('EN21_correlation_join', 'correlation_join', 'correlation_id is the original source value', 'source_join_failed', ['scope']),
        ('EN22_causation_join', 'causation_join', 'causation_event_id is the original source value', 'source_join_failed', ['scope']),
        ('EN23_parent_join', 'parent_join', 'parent_event_id is the original source value', 'source_join_failed', ['scope']),
        ('EN24_inline_size', 'inline_size', 'the inline payload body is at most 16 KiB in its owner codec (SP-337)', 'payload_too_large', ['size']),
        ('EN25_payload_ref_null', 'payload_ref_null', 'payload_ref is null for an inline body', 'payload_ref_invalid', ['size']),
        ('EN26_migration_null', 'migration_null', 'every migration field of a current write is null', 'envelope_invalid', ['history']),
        ('EN27_sequence_join', 'sequence_join', 'sequence_id is Storage\'s own assigned sequence', 'storage_metadata_mismatch', ['storage_metadata']),
        ('EN28_observed_join', 'observed_join', 'observed_at_utc is Storage\'s own assigned value', 'storage_metadata_mismatch', ['storage_metadata']),
        ('EN29_persisted_join', 'persisted_join', 'persisted_at_utc is Storage\'s own assigned value', 'storage_metadata_mismatch', ['storage_metadata']),
        ('EN30_metadata_size', 'metadata_size', 'every stored metadata value is at most 16 KiB encoded', 'metadata_too_large', ['size']),
    ]),
    'identity': ('CV-12xx fact identity, event id and CV-366 key', [
        ('ID01_event_prefix', 'event_prefix', 'event_id starts with forge@1:', 'identity_mismatch', ['identity']),
        ('ID02_event_arity', 'event_arity', 'event_id carries exactly nine lowercase-hex components', 'identity_mismatch', ['identity']),
    ] + [(f'ID{3 + i:02d}_component_{c}', f'component_{c}', f'event_id component {i + 1} is hex of the authenticated {c}', 'identity_mismatch', ['identity'])
         for i, c in enumerate(('server', 'partition', 'provider', 'instance', 'account', 'subject', 'operation', 'revision', 'event_type'))] + [
        ('ID12_partition_recipe', 'partition_recipe', 'scope_partition is app, or project~ base64url(project_id) without padding', 'scope_partition_invalid', ['project_partition']),
        ('ID13_key_prefix', 'key_prefix', 'idempotency_key starts with application@1: (application) or forge@1: (Project)', 'idempotency_key_invalid', ['application_key']),
        ('ID14_key_arity', 'key_arity', 'idempotency_key has exactly its scope\'s lowercase-hex component count', 'idempotency_key_invalid', ['application_key']),
        ('ID15_key_server', 'key_server', 'an application key carries hex of the actual server_id', 'idempotency_key_invalid', ['application_key']),
        ('ID16_key_operation', 'key_operation', 'the key carries hex of forge_fact@1: H recomputed from the capture', 'idempotency_key_invalid', ['application_key', 'identity']),
    ]),
    'source_row': ('SP-12xx canonical source identity row', [
        ('SR01_source_schema', 'source_schema', 'the source row validates against its closed Storage schema', 'source_row_invalid', ['source_native']),
        ('SR02_source_key', 'source_key', 'the row key is <family>_source.v1:{storage}:{partition}:{H}', 'source_row_invalid', ['source_native']),
        ('SR03_source_scope', 'source_scope', 'the row scope is the original owner scope', 'source_row_invalid', ['scope']),
        ('SR04_source_event_id', 'source_event_id', 'the row event_id is the envelope event_id', 'source_row_invalid', ['identity']),
        ('SR05_source_idempotency', 'source_idempotency', 'the row idempotency_key is the envelope key', 'source_row_invalid', ['application_key']),
        ('SR06_source_digest', 'source_digest', 'the row producer_semantic_digest is recomputed from the envelope', 'source_row_invalid', ['same_retry']),
        ('SR07_source_fact_ref', 'source_fact_ref', 'the row fact_ref is the capture fact handle', 'source_row_invalid', ['source_native']),
        ('SR08_source_operation', 'source_operation', 'the row native_operation_ref is the capture operation', 'source_row_invalid', ['source_native']),
        ('SR09_source_revision', 'source_revision', 'the row native_fact_revision_ref is the capture revision', 'source_row_invalid', ['source_native']),
        ('SR10_source_subject', 'source_subject', 'the row subject_ref is the capture subject', 'source_row_invalid', ['source_native']),
        ('SR11_source_record', 'source_record', 'the row source_record_ref is the capture source record', 'source_row_invalid', ['source_native']),
        ('SR12_source_phase', 'source_phase', 'a first publication starts from source_committed', 'source_phase_invalid', ['settlement_receipt']),
        ('SR13_fact_unique', 'fact_unique', 'Storage\'s capture uniqueness-CAS maps F to this one fact handle', 'fact_reminted', ['identity']),
    ]),
    'pack': ('SP-337 pending intent pack', [
        ('PK01_pack_present', 'pack_present', 'the pack store holds bytes for the pending_intent_ref digest', 'pending_pack_missing', ['pending_pack_exists']),
        ('PK02_pack_digest', 'pack_digest', 'BLAKE3 of the held bytes is the ref digest', 'pending_pack_invalid', ['pending_pack_digest']),
        ('PK03_pack_size', 'pack_size', 'the ref size token is the exact byte length (current_integer_token)', 'pending_pack_invalid', ['pending_pack_digest', 'numbers']),
        ('PK05_pack_decodes', 'pack_decodes', 'the bytes decode canonically under the SP-236 event-value codec', 'pending_pack_invalid', ['pending_pack_digest']),
        ('PK06_pack_intent', 'pack_intent', 'the decoded intent is exactly the envelope producer projection', 'pending_pack_invalid', ['pending_pack_intent_join']),
    ]),
    'pack_media_entailed': ('SP-337 pack media type (entailed: no single-defect input reaches it)', [
        ('PM01_pack_media', 'pack_media', 'the pending_intent_ref media type is application/vnd.msgpack; entailed: every source row reaching the pack phase passed SR01, whose pending_intent_ref pattern (Plans/forge_event_storage_contracts.schema.json, <family>_source then-branch and anyOf) fixes the media suffix', 'pending_pack_invalid', ['size']),
    ]),
    'receipt': ('SP-286/CV-339 first receipt and settlement', [
        ('RC01_custody_schema', 'custody_schema', 'the custody validates against event_append_receipt custody_v2', 'receipt_unverified', ['first_receipt']),
        ('RC02_custody_event', 'custody_event', 'custody event_id is the event id', 'receipt_unverified', ['first_receipt']),
        ('RC03_custody_partition', 'custody_partition', 'custody scope_partition is the actual partition', 'receipt_unverified', ['first_receipt']),
        ('RC04_custody_type', 'custody_type', 'custody event_type is the family', 'receipt_unverified', ['first_receipt']),
        ('RC05_custody_key', 'custody_key', 'custody idempotency_key is the event key', 'receipt_unverified', ['first_receipt']),
        ('RC06_custody_digest', 'custody_digest', 'custody producer digest is recomputed from the retained event', 'receipt_unverified', ['first_receipt']),
        ('RC07_custody_storage', 'custody_storage', 'custody storage_instance_id is the actual Storage instance', 'receipt_unverified', ['first_receipt']),
        ('RC08_full_value', 'full_value', 'the CV-339 commitment is recomputed from the retained complete EventRecord', 'receipt_unverified', ['first_receipt']),
        ('RC09_receipt_event', 'receipt_event', 'the first receipt event_id is the event id', 'receipt_unverified', ['first_receipt']),
        ('RC10_receipt_sequence', 'receipt_sequence', 'the first receipt sequence is the retained event sequence', 'receipt_unverified', ['first_receipt', 'storage_metadata']),
    ] + [(f'RC{11 + i:02d}_receipt_{s}_uint64', f'receipt_{s}_uint64', f'first receipt {s} passes storage_uint64', 'receipt_unverified', ['numbers'])
         for i, s in enumerate(RECEIPT_UINT)] + [
        ('RC16_ack_clock', 'ack_clock', 'acknowledged_at_utc passes date_time with the EventRecord profile (E5-2)', 'receipt_unverified', ['timestamps']),
        ('RC17_settlement_ref', 'settlement_ref', 'first_append_receipt_ref resolves to this custody in Storage', 'settlement_refused', ['settlement_receipt']),
        ('RC18_settlement_phase', 'settlement_phase', 'the settled row phase is history_committed', 'settlement_refused', ['settlement_receipt']),
        ('RC19_settlement_release', 'settlement_release', 'pending_intent_ref is cleared in the same transaction', 'settlement_refused', ['settlement_release']),
        ('RC20_pin_released', 'pin_released', 'the settled pack\'s pending live reference is released', 'settlement_refused', ['settlement_release']),
        ('RC21_other_holds_kept', 'other_holds_kept', 'every other hold on the pack is kept', 'settlement_refused', ['settlement_release']),
        ('RC22_no_new_receipt', 'no_new_receipt', 'settlement after a crash resolves the issued receipt and mints none', 'settlement_refused', ['first_receipt']),
    ]),
    'retry': ('Same-key retry (SP-286 replay)', [
        ('RT01_retry_not_replay_only', 'retry_not_replay_only', 'current_append_policy refuses projector_replay_only on retry', 'replay_only_not_appendable', ['replay_only']),
        ('RT02_retry_membership', 'retry_membership', 'the family is admitted on retry', 'missing_event_registration', ['new_append_membership']),
        ('RT03_retry_dedupe_available', 'retry_dedupe_available', 'authoritative dedupe is available', 'dedupe_unavailable', ['dedupe']),
        ('RT04_retry_original_found', 'retry_original_found', 'dedupe (partition, type, key) finds the original', 'original_unavailable', ['same_retry']),
        ('RT05_retry_digest_equal', 'retry_digest_equal', 'the recomputed producer digest equals the original digest', 'idempotency_conflict', ['same_retry']),
        ('RT06_retry_receipt_original', 'retry_receipt_original', 'the retry returns the original first receipt exactly', 'retry_result_invalid', ['same_retry']),
        ('RT07_retry_no_remote', 'retry_no_remote', 'the retry repeats no remote operation', 'retry_result_invalid', ['no_effect_replay']),
    ]),
    'checkpoint': ('SP-12xx checkpoint root (SP-278)', [
        ('CP01_root_schema', 'root_schema', 'the root validates against its closed checkpoint schema', 'checkpoint_invalid', ['generation.no_fourth_key']),
        ('CP02_root_key', 'root_key', 'the key is <family>_checkpoint.v1:{storage}:{partition}:consumer.1', 'checkpoint_invalid', ['generation.no_fourth_key']),
        ('CP03_root_storage', 'root_storage', 'the root storage instance is the actual Storage instance', 'checkpoint_invalid', ['token']),
        ('CP04_root_scope', 'root_scope', 'the root scope is the actual scope', 'checkpoint_invalid', ['scope']),
    ] + [(f'CP{5 + i:02d}_{s}_uint64', f'{s}_uint64', f'every node {s} passes storage_uint64', 'checkpoint_invalid', ['numbers'])
         for i, s in enumerate(UINT_SLOTS)] + [
        ('CP12_activated_clock', 'activated_clock', 'every non-null activated_at_utc passes date_time storage_utc_z', 'checkpoint_invalid', ['timestamps']),
        ('CP13_retired_clock', 'retired_clock', 'every non-null retired_at_utc passes date_time storage_utc_z', 'checkpoint_invalid', ['timestamps']),
        ('CP14_root_size', 'root_size', 'the whole encoded root is at most 16 KiB', 'checkpoint_too_large', ['generation.root_size']),
        ('CP15_no_fourth_key', 'no_fourth_key', 'Storage holds no other key for this consumer root', 'checkpoint_invalid', ['generation.no_fourth_key']),
        ('CP16_token_full_match', 'token_full_match', 'every pattern-bearing generic_read_token string full-matches its SP-278 pattern (no trailing LF)', 'checkpoint_invalid', ['token']),
    ]),
    'generation': ('SP-12xx generation invariants (R1 independent predicates)', [
        ('GN01_current_cardinality', 'current_cardinality', 'at most one node is current', 'generation_invalid', ['generation.node_count']),
        ('GN02_node_membership', 'node_membership', 'every generation_id occurs exactly once in the root', 'generation_invalid', ['generation.node_membership']),
        ('GN03_selected_exists', 'selected_exists', 'current_generation_id names exactly one current node, or is null with none', 'generation_invalid', ['generation.selected_exists']),
        ('GN04_core_scope', 'core_scope', 'every core scope is the root scope', 'generation_invalid', ['generation.root_core_scope']),
        ('GN05_core_identity', 'core_identity', 'every core storage instance is the root storage instance', 'generation_invalid', ['generation.root_core_identity']),
        ('GN06_generation_recipe', 'generation_recipe', 'every generation_id is recomputed by the SP-278 codec over the root preimage', 'generation_invalid', ['generation.generation_recipe']),
        ('GN07_seed_issuance', 'seed_issuance', 'every seed was once durably issued by Storage for this root', 'generation_invalid', ['generation.seed_issuance']),
        ('GN08_staged_times', 'staged_times', 'a staged node has both times null', 'generation_invalid', ['generation.staged_times']),
        ('GN09_current_times', 'current_times', 'a current node has an activation time and no retirement time', 'generation_invalid', ['generation.current_retirement']),
        ('GN10_retired_anchor', 'retired_anchor', 'a retired node keeps Storage\'s recorded first retirement time', 'generation_invalid', ['generation.retired_anchor']),
        ('GN11_activation_anchor', 'activation_anchor', 'an activated node keeps Storage\'s recorded activation time', 'generation_invalid', ['generation.retired_anchor']),
    ]),
    'token': ('SP-278 nine-field durable token and live fence', [
        (f'TK{1 + i:02d}_token_{f}', f'token_{f}', f'durable token {f} is the live Storage value', 'token_stale', ['token'])
        for i, f in enumerate(TOKEN_FIELDS)] + [
        (f'TS{1 + i:02d}_selection_{f}', f'selection_{f}', f'source_selection {f} is the CURRENT-selected value', 'token_stale', ['token'])
        for i, f in enumerate(SELECTION_FIELDS)] + [
        ('TL01_live_snapshot', 'live_snapshot', 'the live token snapshot id is the actual read snapshot', 'token_stale', ['token']),
        ('TL02_live_projection', 'live_projection', 'the live token without its snapshot id is the durable token', 'token_stale', ['token']),
    ]),
    'scan': ('Complete global scan, cursor and count', [
        ('SC01_coverage_complete', 'coverage_complete', 'the scanned prefix is the complete canonical source prefix', 'scan_incomplete', ['coverage']),
        ('SC02_cursor_event', 'cursor_event', 'last_scanned event_id is the final examined record', 'cursor_mismatch', ['cursor']),
        ('SC03_cursor_sequence', 'cursor_sequence', 'last_scanned sequence_id is that record\'s Storage sequence', 'cursor_mismatch', ['cursor']),
        ('SC04_cursor_value', 'cursor_value', 'last_scanned event_value_sha256 is that record\'s value hash', 'cursor_mismatch', ['cursor']),
        ('SC05_matched_count', 'matched_count', 'matched_count is the exact matching retained event count', 'count_mismatch', ['matched_count']),
        ('SC06_resume_revalidated', 'resume_revalidated', 'the predecessor cursor event and value hash revalidate', 'cursor_mismatch', ['cursor']),
        ('SC07_no_second_disclosure', 'no_second_disclosure', 'the already-counted cursor event is not disclosed again', 'scan_incomplete', ['no_effect_replay']),
        ('SC08_matched_verified', 'matched_verified', 'every matched record has a verified first receipt', 'receipt_unverified', ['first_receipt']),
        ('SC09_empty_proof', 'empty_proof', 'a null cursor and zero count carry actual empty-inventory proof', 'scan_incomplete', ['coverage']),
    ]),
    'cas': ('Predecessor revision and hash CAS', [
        ('CS01_expected_revision', 'expected_revision', 'the request predecessor revision is the actual revision', 'cas_conflict', ['cas']),
        ('CS02_revision_step', 'revision_step', 'the candidate revision is the actual revision plus one', 'cas_conflict', ['cas']),
        ('CS03_expected_hash', 'expected_hash', 'the request predecessor hash is the actual root value hash', 'cas_conflict', ['cas']),
        ('CS04_previous_hash', 'previous_hash', 'previous_checkpoint_sha256 is the actual root value hash', 'cas_conflict', ['cas']),
        ('CS05_siblings_preserved', 'siblings_preserved', 'every unselected node is byte-identical to the predecessor', 'cas_conflict', ['generation.sibling_preserved']),
        ('CS06_selector_kept', 'selector_kept', 'a same-generation advance keeps current_generation_id', 'cas_conflict', ['generation.selected_exists']),
        ('CS07_fence_current', 'fence_current', 'the maintenance fence is Storage\'s current fence', 'cas_conflict', ['token']),
    ]),
    'slot': ('Generation slots and cleanup (RP-PROJECTION-3GEN)', [
        ('SL01_slot_free', 'slot_free', 'staging reserves a lawful free slot (fewer than three nodes)', 'slot_unavailable', ['generation.slot_protected']),
        ('SL02_cleanup_unselected', 'cleanup_unselected', 'cleanup removes only an unselected node', 'cleanup_refused', ['generation.slot_protected']),
        ('SL03_cleanup_no_hold', 'cleanup_no_hold', 'cleanup removes no held or referenced node', 'cleanup_refused', ['generation.slot_protected']),
        ('SL04_cleanup_window', 'cleanup_window', 'the original 604800-second retirement window has elapsed', 'cleanup_refused', ['generation.slot_protected']),
        ('SL05_elapsed_uint64', 'elapsed_uint64', 'the Storage elapsed-seconds value passes storage_uint64', 'cleanup_refused', ['numbers']),
    ]),
    'history': ('SP-1101 retained read: recipe only from the sealed per-original receipt', [
        ('HI01_receipt_present', 'receipt_present', 'Storage sealed a write receipt for this exact original', 'original_unavailable', ['history']),
        ('HI02_receipt_unique', 'receipt_unique', 'exactly one sealed receipt names this original', 'recipe_unsupported', ['history']),
        ('HI03_receipt_original', 'receipt_original', 'the sealed receipt binding is this original\'s binding', 'original_unavailable', ['history']),
        ('HI04_recipe_known', 'recipe_known', 'the sealed recipe tuple is an installed frozen recipe', 'recipe_unsupported', ['history']),
        ('HI05_original_verifies', 'original_verifies', 'the frozen verifier recomputes identity, digest and full value', 'original_invalid', ['history']),
        ('HI06_bytes_preserved', 'bytes_preserved', 'the read returns the stored bytes unchanged', 'original_invalid', ['history']),
        ('HI07_no_receipt_created', 'no_receipt_created', 'the read creates no receipt', 'original_invalid', ['history']),
        ('HI08_not_foreign', 'not_foreign', 'the original belongs to this Storage instance', 'original_unavailable', ['history']),
        ('HI09_reader_enabled', 'reader_enabled', 'the consumer is not withdrawn', 'consumer_withdrawn', ['withdrawal']),
        ('HI10_permission', 'permission', 'current actor/account permission allows disclosure', 'unavailable', ['redaction']),
        ('HI11_not_deleted', 'not_deleted', 'no deletion or tombstone covers the record', 'unavailable', ['redaction']),
        ('HI12_ref_available', 'ref_available', 'linked content is available (else unavailable, never reconstructed)', 'unavailable', ['redaction']),
    ]),
    'replay': ('Consumer replay performs no effect', [
        (f'RP{1 + i:02d}_no_{e}', f'no_{e}', f'replay performs no {e.replace("_", " ")}', 'replay_effect_refused', ['no_effect_replay'])
        for i, e in enumerate(EFFECTS)]),
    'withdrawal': ('Consumer withdrawal', [
        ('WD01_withdrawn_state', 'withdrawn_state', 'the selected core is withdrawn', 'withdrawal_invalid', ['withdrawal']),
        ('WD02_withdrawal_receipt', 'withdrawal_receipt', 'withdrawal_receipt_ref is Storage\'s actual withdrawal receipt', 'withdrawal_invalid', ['withdrawal']),
        ('WD03_selector_cleared', 'selector_cleared', 'current_generation_id is null', 'withdrawal_invalid', ['withdrawal']),
        ('WD05_tokens_invalidated', 'tokens_invalidated', 'Storage invalidated every disclosure token of the consumer', 'withdrawal_invalid', ['withdrawal']),
        ('WD06_no_event_created', 'no_event_created', 'withdrawal appends no event', 'withdrawal_invalid', ['withdrawal']),
    ]),
}

# Shared phase order of each path through the complete checker.
PATHS = {
    'append': ('admission', 'envelope', 'payload', 'identity', 'source', 'source_row', 'pack', 'pack_media_entailed'),
    'settle': ('receipt',),
    'retry': ('retry',),
    'publish': ('checkpoint', 'generation', 'token', 'scan', 'cas'),
    'stage': ('slot',),
    'read': ('history',),
    'replay': ('replay',),
    'withdraw': ('checkpoint', 'generation', 'withdrawal'),
}


def _schema(path):
    return json.loads((ROOT / path).read_text())


def payload_rows(fam):
    """Per-field, per-keyword rows of the family's closed payload schema."""
    schema = _schema(fam['payload_schema_path'])
    rows = []
    n = 0
    for field in schema['required']:
        prop = schema['properties'][field]
        n += 1
        rows.append((f'PY{n:02d}_required_{field}', f'required.{field}', f'payload carries required member {field}', 'payload_invalid', [f'required.{field}']))
        if 'const' in prop:
            n += 1
            rows.append((f'PY{n:02d}_const_{field}', f'const.{field}', f'payload.{field} is exactly {prop["const"]}', 'payload_invalid', [f'const.{field}']))
        elif field == 'provider':
            n += 1
            rows.append((f'PY{n:02d}_enum_{field}', f'enum.{field}', 'payload.provider is one admitted provider string (enum; the enum is its exact type)', 'payload_invalid', ['type.provider']))
        else:
            for kw, words, plan in (('type', 'is a string', 'type'), ('minLength', 'has at least 8 characters', 'minLength'),
                                    ('maxLength', 'has at most 256 characters', 'maxLength'),
                                    ('pattern', 'full-matches pmref:[A-Za-z0-9._:-]+ (no trailing LF)', 'grammar')):
                n += 1
                rows.append((f'PY{n:02d}_{kw}_{field}', f'{kw}.{field}', f'payload.{field} {words}', 'payload_invalid', [f'{plan}.{field}']))
    n += 1
    rows.append((f'PY{n:02d}_closed', 'closed', 'payload carries no member outside its closed schema', 'payload_invalid', ['closed_payload']))
    return rows


VOTE_FIELDS = ('provider', 'reviewer_ref', 'review_revision_ref', 'native_vote_ref', 'vote_value', 'required_reviewer',
               'revision_binding_kind', 'binding_evidence_ref')


def source_rows(fam):
    """Native provenance, payload-to-source joins and the three FGI conjuncts."""
    rows = [
        ('SN01_native_present', 'native_present', 'the native owner authority holds a record for the capture handle', 'native_unproven', ['source_native']),
        ('SN02_native_identical', 'native_identical', 'the capture record is exactly the authenticated owner record', 'native_unproven', ['source_native']),
        ('SN03_native_owner', 'native_owner', f'the record owner is {fam["producer"]}', 'native_unproven', ['source_native']),
        ('SN04_native_accepted', 'native_accepted', 'the native owner accepted the result', 'native_unproven', ['source_native']),
    ]
    n = 0
    for field in ('fact_ref', 'provider', 'subject_ref', 'source_record_ref') + fam['domain_refs']:
        n += 1
        rows.append((f'SJ{n:02d}_join_{field}', f'join.{field}', f'payload.{field} equals the authenticated source {field}', 'source_join_failed', [f'source_join.{field}']))
    if fam['vote']:
        for field in VOTE_FIELDS:
            n += 1
            rows.append((f'SJ{n:02d}_vote_{field}', f'vote.{field}', f'source vote_evidence.{field} is the native vote fact', 'source_join_failed', [f'vote_evidence.{field}', 'source_native']))
    for i, (name, _kind, _args, _neg) in enumerate(fam['semantic']):
        rows.append((f'SM{i + 1:02d}_{name}', f'semantic.{name}', f'FGI conjunct {name} holds on the native result', 'transition_not_emitting', [f'semantic.{name}', 'transition']))
    return rows


_GROUPS = {}
CHUNK = 4  # rows per table: the gated tool's cost grows with rows x cases per table


def payload_tables(fam):
    """The family's payload rows grouped per field (one table per payload member, plus the closed rule)."""
    if fam['slug'] in _GROUPS:
        return _GROUPS[fam['slug']]
    groups = _GROUPS[fam['slug']] = {}
    for row in payload_rows(fam):
        field = row[1]
        member = 'closed' if field == 'closed' else field.split('.', 1)[1]
        groups.setdefault(f'payload_{fam["slug"]}__{member}', []).append(row)
    return groups


def _chunks(prefix, title, rows):
    if len(rows) <= CHUNK:
        return {prefix: (title, rows)}
    out = {}
    for i in range(0, len(rows), CHUNK):
        out[f'{prefix}__{i // CHUNK + 1:02d}'] = (f'{title} (rows {i + 1}-{min(i + CHUNK, len(rows))})', rows[i:i + CHUNK])
    return out


def source_tables(fam):
    return _chunks(f'source_{fam["slug"]}', f'{fam["event_type"]} native source and FGI conjuncts ({fam["owner_unit"]})',
                   source_rows(fam))


def shared_tables(phase):
    title, rows = SHARED[phase]
    return _chunks(phase, title, rows)


def family_phases():
    out = {}
    for fam in spec.FAMILIES:
        for name, rows in payload_tables(fam).items():
            member = name.split('__', 1)[1]
            out[name] = (f'{fam["event_type"]} closed payload member {member} ({fam["owner_unit"]})', rows)
        out.update(source_tables(fam))
    return out


def family_table_names(fam):
    return list(payload_tables(fam)) + list(source_tables(fam))


_PHASES = {}


def all_phases():
    if not _PHASES:
        for phase in SHARED:
            _PHASES.update(shared_tables(phase))
        _PHASES.update(family_phases())
    return _PHASES


def phase_names(phase, fam):
    if phase == 'payload':
        return list(payload_tables(fam))
    if phase == 'source':
        return list(source_tables(fam))
    return list(shared_tables(phase))
