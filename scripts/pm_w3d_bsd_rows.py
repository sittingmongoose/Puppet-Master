"""W3D guard-table row inventory (Method B, gated tool 004bdedd63).

Every refusal of the complete checker (scripts/pm_w3d_bsd_events.py) goes through
one named row below, evaluated in row order on an observation dict the checker
derives from the complete boundary input. Each row reads exactly one boolean
observation; the generated table modules (scripts/pm_w3d_bsd_table_<phase>.py)
hold the predicates. Edit this inventory and regenerate with
scripts/pm-w3d-table-generate.py; never edit a table module.

Row names map to the phase-1 plan guards in Plans/bsd_event_oracle_plan.json;
the phase-2 report records the mapping. Codes are the checker's refusal strings.
"""
import json
import re
from pathlib import Path

import pm_w3d_bsd_spec as spec

ROOT = Path(__file__).resolve().parents[1]
MIGRATION_FIELDS = ('migrated_from_schema_id', 'migrated_from_schema_version', 'compatibility_event_type')
CHECKPOINT_INTEGERS = ('selected_segment_generation', 'manifest_generation', 'recovery_epoch')
FINDING_OPERANDS = ('family', 'affected', 'rules', 'evidence', 'original')

# Nine-field durable token (SP-278) and its source-selection control fields.
TOKEN_FIELDS = ('storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id',
                'generation_anchor_sha256', 'frontier_revision', 'frontier_sha256', 'index_dataset_name')
SELECTION_FIELDS = ('storage_instance_id', 'current_bytes_sha256', 'selected_segment_generation',
                    'manifest_bytes_sha256', 'manifest_generation', 'recovery_epoch',
                    'manifest_survivor_prefix_sha256', 'retained_inventory_sha256',
                    'durable_watermarks_sha256', 'excluded_ranges_sha256', 'retired_inputs_sha256')
# current_ref and manifest_ref are schema constants; the CP01 schema row judges them.
RECEIPT_UINT = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')
EFFECTS = ('review_dispatch', 'tool_call', 'usage_charge', 'transcript_note', 'notification',
           'canonical_lifecycle_write', 'event_append')
ENVELOPE_JOINS = ('thread_id', 'requested_account_ref', 'effective_account_ref', 'actor_ref',
                  'correlation_id', 'causation_event_id', 'parent_event_id', 'node_id', 'attempt_id')
# Terminal review body fields joined to the authentic original start (SP-1365).
TERMINAL_START_FIELDS = ('review_cycle_id', 'bsd_assignment_id', 'trigger_kind', 'trigger_reason',
                         'primary_generation', 'input_manifest_ref', 'frozen_boundary')
# Start body fields joined to the authentic accepted admission (review_started).
START_JOIN_FIELDS = ('admission_ref', 'origin_context_ref', 'assignment_ref', 'binding_ref', 'cursor_ref',
                     'stable_prefix_hash', 'requested_effective_snapshot_ref', 'trigger_kind',
                     'trigger_reason', 'input_manifest_ref', 'redaction_receipt_ref', 'frozen_boundary')


def _rows(prefix, entries):
    return [(f'{prefix}{i:02d}_{name}', f'{prefix}{i:02d}_{name}', inv, code)
            for i, (name, inv, code) in enumerate(entries, 1)]


ADMISSION_ENTRIES = [
    ('registration', 'Current append requires the exact event/version registry membership and payload selector.',
     'membership_absent'),
    ('physical_admission', 'Current operation cannot run before SP-318 physical registration prerequisites close.',
     'physical_registration_pending'),
    ('replay_writer', 'Current writer and retry reject projector_replay_only as replay_only_not_appendable.',
     'replay_only_not_appendable'),
    ('project_scope', 'The payload project_id equals the actual Project scope and original owner source.',
     'project_scope_mismatch'),
    ('actor', 'The envelope actor equals the actual admitted owner-operation actor.', 'actor_mismatch'),
    ('dedupe_available', 'Append uses authoritative tail-current dedupe or refuses dedupe_unavailable.',
     'dedupe_unavailable'),
    ('current_write_permission', 'Current append has actual write permission for this exact operation, independent of reader access.',
     'write_permission_refused'),
    ('current_owner', 'Current append uses the actually registered owner of this exact operation.', 'owner_mismatch'),
    ('current_writer_generation', 'Current append uses the live admitted writer generation.', 'writer_generation_stale'),
    ('current_stop', 'Current append passes the effective Stop fence for its exact operation class.', 'stop_refused'),
]

SHARED = {
    'admission': ('Current-writer admission (assignment-backed families)', _rows('AD', ADMISSION_ENTRIES + [
        ('current_epoch', 'Current callback/fresh append matches the live assignment epoch; old-epoch history reads are separate.',
         'epoch_mismatch')])),
    'admission_config': ('Current-writer admission (configuration families, no assignment epoch)',
                         _rows('AD', ADMISSION_ENTRIES)),
    'eligibility': ('Pre-creation start eligibility (assignment_started)', _rows('EL', [
        ('not_off', 'Before assignment creation the genuine resolved owner mode is Auto or On; Off has no assignment or start payload.',
         'resolved_mode_off')])),
    'envelope': ('EventRecord envelope, shared number/date-time calls and Storage metadata joins', _rows('EN', [
        ('envelope_schema', 'The complete closed EventRecord 2.0.0 envelope validates with every referenced branch resolved.',
         'envelope_schema_invalid'),
        ('occurred_clock', 'occurred_at_utc satisfies the CV-1101 event_record profile (shared date_time).',
         'occurred_at_invalid'),
        ('observed_clock', 'observed_at_utc satisfies the CV-253 storage_utc_z profile (shared date_time).',
         'observed_at_invalid'),
        ('persisted_clock', 'persisted_at_utc satisfies the CV-253 storage_utc_z profile (shared date_time).',
         'persisted_at_invalid'),
        ('sequence_uint64', 'sequence_id is an exact Storage uint64 (shared storage_uint64).', 'sequence_out_of_domain'),
        ('producer_sequence', 'producer_sequence_id is null or an exact current integer (shared current_integer).',
         'producer_sequence_invalid'),
        ('producer_qualified', 'The envelope-owner semantic projection qualifies under the shared producer route (CV-317/CV-1100).',
         'producer_not_qualified'),
        ('family', 'The envelope event_type is this exact family.', 'family_mismatch'),
        ('payload_schema', 'The envelope payload_schema_id is this exact closed payload selector.', 'payload_selector_mismatch'),
        ('redaction_join', 'The envelope redaction_profile equals the original source redaction profile.', 'redaction_mismatch'),
        ('inline_size', 'An inline payload body is at most 16 KiB encoded (SP-337 route above it).', 'inline_body_oversize'),
        ('payload_route', 'Inline payload and payload_ref are exactly one route: null ref with body, or ref with null body.',
         'payload_route_invalid'),
        ('migration_null', 'No earlier admitted BSD event version exists; every migration field stays null.',
         'migration_not_null'),
        ('sequence_join', 'Envelope sequence_id equals the actual Storage-assigned original record.', 'sequence_mismatch'),
        ('observed_join', 'Envelope observed_at_utc equals the actual Storage-assigned original record.', 'observed_mismatch'),
        ('persisted_join', 'Envelope persisted_at_utc equals the actual Storage-assigned original record.', 'persisted_mismatch'),
        ('metadata_size', 'Every encoded envelope identity part stays within the 16 KiB stored-value limit.', 'metadata_oversize'),
        ('replay_policy', 'The current writer selects dedupe_by_idempotency_key.', 'replay_policy_invalid'),
    ])),
    'joins': ('Envelope-to-original-operation joins (assignment-backed)', _rows('JN', [
        ('run_join', 'Envelope run_id equals the authentic assignment primary_run_id, independently of the payload.',
         'run_join_mismatch'),
        ('project_join', 'Envelope project_id equals the authentic original operation Project and is non-null.',
         'project_join_mismatch')] + [
        (f'{f}_join', f'Envelope {f} equals that exact fact in the authentic original operation context; null stays null.',
         f'{f}_join_mismatch') for f in ENVELOPE_JOINS])),
    'joins_config': ('Envelope-to-original-operation joins (configuration families)', _rows('JN', [
        ('run_null', 'A configuration-only event keeps envelope run_id null and never invents a run.', 'run_not_null'),
        ('project_join', 'Envelope project_id equals the authentic original operation Project and is non-null.',
         'project_join_mismatch')] + [
        (f'{f}_join', f'Envelope {f} equals that exact fact in the authentic original operation context; null stays null.',
         f'{f}_join_mismatch') for f in ENVELOPE_JOINS])),
    'identity': ('CV-135x original operation, event and idempotency recipes', [
        ('ID01_event_prefix', 'ID01_event_prefix', 'event_id uses the exact bsd-event@1 prefix.', 'event_prefix_invalid'),
        ('ID03_event_storage', 'ID03_event_storage', 'event_id component one is the actual storage_instance_id.', 'event_storage_mismatch'),
        ('ID04_event_type', 'ID04_event_type', 'event_id component two is this exact event_type.', 'event_type_mismatch'),
        ('ID05_event_project', 'ID05_event_project', 'event_id component three is the actual Project.', 'event_project_mismatch'),
        ('ID06_event_operation', 'ID06_event_operation', 'event_id component four is the canonical owner_operation_id.', 'event_operation_mismatch'),
        ('ID07_operation_recipe', 'ID07_operation_recipe', 'owner_operation_id is bsd-op@1:hex(original_source_id):hex(transition_component):hex(subject_id) recomputed from the authentic original source.', 'operation_recipe_invalid'),
        ('ID08_key_prefix', 'ID08_key_prefix', 'idempotency_key uses the exact bsd-key@1 prefix.', 'key_prefix_invalid'),
        ('ID10_key_project', 'ID10_key_project', 'idempotency_key component one is the actual Project.', 'key_project_mismatch'),
        ('ID11_key_operation', 'ID11_key_operation', 'idempotency_key component two is the canonical owner_operation_id.', 'key_operation_mismatch'),
        ('ID12_partition_recipe', 'ID12_partition_recipe', 'The index/key partition is Storage project~base64url of the Project, unpadded and reversible.', 'partition_recipe_invalid'),
    ]),
    'event_arity_entailed': ('event_id component arity/hex (entailed by ID03-ID06)', [
        ('ID02_event_components', 'ID02_event_components',
         'event_id has exactly five lowercase-hex UTF-8 components. ENTAILED: ID03/ID04/ID05/ID06 each require a five-part '
         'event_id whose indexed component equals an exact lowercase-hex preimage (obs_identity, scripts/pm_w3d_bsd_events.py). '
         'Any input satisfying all four necessarily satisfies the arity and hex check, so no single-defect input is first refused here.',
         'event_components_invalid'),
    ]),
    'key_arity_entailed': ('idempotency_key component arity/hex (entailed by ID10-ID11)', [
        ('ID09_key_components', 'ID09_key_components',
         'idempotency_key has exactly three lowercase-hex components. ENTAILED: ID10 and ID11 each require a three-part key '
         'whose indexed component equals an exact lowercase-hex preimage (obs_identity, scripts/pm_w3d_bsd_events.py). Any input '
         'satisfying both necessarily satisfies the arity and hex check, so no single-defect input is first refused here.',
         'key_components_invalid'),
    ]),
}

SHARED.update({
    'operation': ('Exact-family pending/complete operation value (SP-135x)', _rows('OP', [
        ('operation_schema', 'The complete closed operation schema validates with every referenced branch resolved.',
         'operation_schema_invalid'),
        ('operation_key', 'The operation key is bsd_<family>_operation.v1:{scope_partition}:{hex(owner_operation_id)}.',
         'operation_key_invalid'),
        ('operation_storage', 'Operation storage_instance_id equals the selected actual EventRecord storage.',
         'operation_storage_mismatch'),
        ('operation_project', 'Operation project_id equals the authentic original Project.', 'operation_project_mismatch'),
        ('operation_event', 'Operation event_id equals the envelope event_id.', 'operation_event_mismatch'),
        ('operation_key_join', 'Operation idempotency_key equals the envelope idempotency_key.', 'operation_key_mismatch'),
        ('operation_digest', 'Operation producer_semantic_digest equals the recomputed envelope-owner semantic projection.',
         'operation_digest_mismatch'),
        ('operation_state', 'A fresh append carries state pending_event; complete requires the original first receipt.',
         'operation_state_invalid'),
        ('pending_not_current', 'A pending source cannot become current before the original barrier receipt resolves.',
         'pending_published_early'),
        ('operation_source_ref', 'Operation source_state_ref names the exact immutable source wrapper for this operation.',
         'operation_source_ref_mismatch'),
    ])),
    'operation_size': ('Operation 16 KiB inline limit', [
        ('OZ01_operation_size', 'OZ01_operation_size',
         'The complete encoded operation value is at most 16 KiB (SP-1350). Reachable: a long authentic original '
         'source identity makes the operation (owner_operation_id plus its hex copies in event_id and idempotency_key) '
         'exceed 16 KiB while the envelope metadata stays within EN17.', 'operation_oversize'),
    ]),
    'pack': ('SP-337 durable packs: event intent and logical source body', _rows('PK', [
        ('pack_present', 'The referenced event payload pack exists in the durable store.', 'pack_missing'),
        ('pack_digest', 'The pack BLAKE3 digest equals the referenced digest.', 'pack_digest_mismatch'),
        ('pack_size', 'The pack byte size equals the referenced size.', 'pack_size_mismatch'),
        ('pack_media', 'The pack media type is the declared application/msgpack.', 'pack_media_invalid'),
        ('pack_decodes', 'The pack bytes decode as canonical Storage MessagePack (shared decode_storage_value).',
         'pack_noncanonical'),
        ('pack_intent', 'The pack bytes equal the exact producer intent projection of this envelope.', 'pack_intent_mismatch'),
        ('source_pack_present', 'The logical source body pack exists and resolves before use.', 'source_pack_missing'),
        ('source_pack_size', 'The wrapper logical_payload_byte_size equals the actual original pack bytes.',
         'source_pack_size_mismatch'),
        ('source_body_schema', 'The logical source body validates under its exact existing logical BSD schema.',
         'source_body_invalid'),
        ('source_body_clocks', 'Every logical source body timestamp satisfies the shared CV-1101 event_record profile.',
         'source_body_clock_invalid'),
    ])),
    'receipt': ('SP-286/CV-339 first receipt, full value, barrier settlement and head publish', _rows('RC', [
        ('custody_schema', 'The complete closed custody v2 schema validates.', 'custody_schema_invalid'),
        ('custody_event', 'Custody event_id equals the original event.', 'custody_event_mismatch'),
        ('custody_partition', 'Custody scope_partition equals the actual Project partition.', 'custody_partition_mismatch'),
        ('custody_type', 'Custody event_type equals this exact family.', 'custody_type_mismatch'),
        ('custody_key', 'Custody idempotency_key equals the original key.', 'custody_key_mismatch'),
        ('custody_digest', 'Custody producer_semantic_digest equals the recomputed semantic digest.', 'custody_digest_mismatch'),
        ('custody_storage', 'Custody storage_instance_id equals the actual Storage instance.', 'custody_storage_mismatch'),
        ('full_value', 'The original complete EventRecord value commitment agrees with authentic CV-339 v2 custody (shared full_value_commitment).',
         'full_value_mismatch'),
        ('receipt_event', 'The first receipt event_id equals the original event.', 'receipt_event_mismatch'),
        ('receipt_sequence', 'The first receipt sequence_id equals the actual Storage-assigned sequence.', 'receipt_sequence_mismatch'),
        ('receipt_sequence_uint64', 'The receipt sequence_id is an exact Storage uint64 (shared storage_uint64).',
         'receipt_sequence_out_of_domain'),
    ] + [
        (f'receipt_{slot}_uint64', f'The receipt {slot} is an exact Storage uint64 (shared storage_uint64).',
         f'receipt_{slot}_out_of_domain') for slot in RECEIPT_UINT[1:]
    ] + [
        ('ack_clock', 'The receipt acknowledged_at_utc satisfies the CV-1101 EventRecord profile (shared date_time); CV-253 storage_utc_z binds only envelope observed/persisted.',
         'acknowledged_at_invalid'),
        ('receipt_durability', 'The first receipt durable_end_offset covers the appended byte range at the genuine sync boundary.',
         'receipt_not_durable'),
        ('barrier_receipt', 'The settlement receipt uses the selected barrier durability class.', 'barrier_class_mismatch'),
        ('settlement_ref', 'The settled source row names the exact original first receipt reference.', 'settlement_ref_mismatch'),
        ('settlement_phase', 'The settled source row is history_committed only after receipt resolution.', 'settlement_phase_invalid'),
        ('settlement_release', 'Settlement releases the pending intent reference exactly once.', 'settlement_release_invalid'),
        ('pin_released', 'The pending pin is released after settlement while other holds remain.', 'pin_not_released'),
        ('other_holds_kept', 'Unrelated protection holds survive settlement.', 'holds_dropped'),
        ('no_new_receipt', 'Restart after receipt issuance never mints a second receipt.', 'second_receipt_minted'),
        ('head_cas', 'The complete operation and actual lifecycle head publish atomically under the expected prior head state.',
         'head_cas_mismatch'),
        ('head_source_join', 'The canonical head key, subject, operation and original receipt resolve the correct source wrapper.',
         'head_source_join_mismatch'),
    ])),
    'retry': ('Lost-ack retry and original custody', _rows('RT', [
        ('retry_not_replay_only', 'Retry rejects projector_replay_only as replay_only_not_appendable.', 'replay_only_not_appendable'),
        ('retry_membership', 'Retry requires the exact current registry membership.', 'membership_absent'),
        ('retry_dedupe_available', 'Retry uses authoritative tail-current dedupe or refuses dedupe_unavailable.', 'dedupe_unavailable'),
        ('retry_original_found', 'Retry resolves the authentic original record under the same idempotency identity.',
         'original_unavailable'),
        ('retry_digest_equal', 'Same identity with a different semantic body refuses idempotency_conflict.', 'idempotency_conflict'),
        ('retry_receipt_original', 'A valid lost-ack retry returns the immutable original four-field result and first receipt, never a remint.',
         'retry_result_reminted'),
        ('retry_no_remote', 'Retry performs no remote operation.', 'retry_remote_effect'),
        ('original_retry_custody', 'Retry resolves the authentic original record/receipt custody before returning a terminal result.',
         'original_custody_unavailable'),
        ('retry_envelope_schema', 'The retry candidate is a complete valid EventRecord.', 'retry_envelope_invalid'),
        ('retry_producer_sequence', 'The retry producer_sequence_id is null or an exact non-negative current integer.',
         'retry_producer_sequence_invalid'),
    ])),
    'checkpoint': ('SP-278 derived checkpoint value and nine-field durable token', [
        ('CP01_root_schema', 'CP01_root_schema', 'The complete closed checkpoint schema validates with every referenced branch resolved.', 'checkpoint_schema_invalid'),
        ('CP02_checkpoint_storage', 'CP02_checkpoint_storage', 'Checkpoint storage_instance_id equals the selected actual EventRecord storage.', 'checkpoint_storage_mismatch'),
        ('CP04_checkpoint_project', 'CP04_checkpoint_project', 'Checkpoint project_id equals the actual Project.', 'checkpoint_project_mismatch'),
    ] + [
        (f'CP{7 + i:02d}_token_{f}', f'CP{7 + i:02d}_token_{f}',
         f'Durable token field {f} matches the actual selected SP-278 control in this live snapshot.', f'token_{f}_mismatch')
        for i, f in enumerate(TOKEN_FIELDS)
    ] + [
        (f'CP{15 + i:02d}_selection_{f}', f'CP{15 + i:02d}_selection_{f}',
         f'Durable token source_selection field {f} matches the actual selected SP-278 control.', f'selection_{f}_mismatch')
        for i, f in enumerate(SELECTION_FIELDS)
    ] + [
        ('CP26_token_uint64', 'CP26_token_uint64',
         'Every durable token uint64 slot is an exact Storage uint64 (shared storage_uint64), even where jsonschema admits a float spelling.',
         'token_uint64_out_of_domain'),
        ('CP27_token_storage_uuid', 'CP27_token_storage_uuid',
         'The durable token storage_instance_id satisfies its owner schema format uuid (JSON Schema format checker), never a silently skipped annotation.',
         'token_storage_not_uuid'),
        ('CP27_selection_storage_uuid', 'CP27_selection_storage_uuid',
         'The token source_selection storage_instance_id satisfies its owner schema format uuid.', 'selection_storage_not_uuid'),
        ('CZ01_checkpoint_size', 'CZ01_checkpoint_size',
         'The complete encoded checkpoint value is at most 16 KiB (SP-1350). Reachable: the joined live Storage control '
         'strings (checkpoint_key, checkpoint_ref, index_dataset_name) are unbounded.', 'checkpoint_oversize'),
    ]),
    'checkpoint_type_entailed': ('Checkpoint selected_event_type (entailed by CP01 const)', [
        ('CP03_checkpoint_type', 'CP03_checkpoint_type',
         'Checkpoint selected_event_type equals this exact family. ENTAILED: selected_event_type is a schema const '
         '(Plans/bsd_event_storage_contracts.schema.json, <family>_checkpoint). Any other value is refused by CP01_root_schema '
         'first, so no single-defect input is first refused here.', 'checkpoint_type_mismatch'),
    ]),
    'checkpoint_consumer_entailed': ('Checkpoint consumer_id (entailed by CP01 const)', [
        ('CP05_checkpoint_consumer', 'CP05_checkpoint_consumer',
         'Checkpoint consumer_id is the exact projector.bsd.<family>@1.0.0. ENTAILED: consumer_id is a schema const '
         '(Plans/bsd_event_storage_contracts.schema.json, <family>_checkpoint). Any other value is refused by CP01_root_schema '
         'first, so no single-defect input is first refused here.', 'checkpoint_consumer_mismatch'),
    ]),
    'checkpoint_snapshot_entailed': ('Durable token field set (entailed by CP01 closed schema)', [
        ('CP06_token_snapshot', 'CP06_token_snapshot',
         'The persisted token has exactly the nine durable fields without redb_snapshot_id. ENTAILED: durable_read_token is a '
         'closed schema with exactly these required fields and additionalProperties=false '
         '(Plans/bsd_event_storage_contracts.schema.json). An extra or missing field is refused by CP01_root_schema first, so no '
         'single-defect input is first refused here.', 'snapshot_persisted'),
    ]),
    'scan': ('Complete scanned-range proof and verified matches', _rows('SC', [
        ('generic_source', 'SP-278 actual CURRENT-selected global complete index coverage is proved, not caller flags.',
         'generic_index_incomplete'),
        ('coverage_complete', 'Advance proves the full captured scanned range including verified nonmatches and legal gaps.',
         'scan_coverage_incomplete'),
        ('cursor_event', 'The examined cursor event_id equals the actual last scanned record.', 'cursor_event_mismatch'),
        ('cursor_sequence', 'The examined cursor sequence equals the actual last scanned record and never regresses.',
         'cursor_sequence_mismatch'),
        ('cursor_value', 'The cursor event value hash equals the actual stored record bytes.', 'cursor_value_mismatch'),
        ('matched_verified', 'Every claimed match resolves full value/payload refs and original custody before processing.',
         'match_unverified'),
        ('no_second_disclosure', 'A matched record is disclosed exactly once per advance.', 'second_disclosure'),
        ('empty_proof', 'An empty-source claim carries the actual complete inventory proof.', 'empty_proof_missing'),
    ])),
    'cas': ('Exact prior-value CAS and atomic derived advance', _rows('CS', [
        ('expected_revision', 'The request expected_revision equals the actual prior publication revision.',
         'expected_revision_mismatch'),
        ('revision_step', 'The candidate revision advances by exactly one.', 'revision_step_invalid'),
        ('expected_hash', 'The request expected_hash equals the actual prior checkpoint binding hash.', 'expected_hash_mismatch'),
        ('prior_unchanged', 'The actual prior checkpoint at commit still equals the expected prior value.',
         'prior_checkpoint_changed'),
        ('siblings_preserved', 'Unchanged derived rows and sibling state survive the advance.', 'siblings_changed'),
        ('fence_current', 'The advance holds the current Storage fence.', 'fence_stale'),
    ])),
    'history': ('SP-1101 retained read: sealed per-original receipt selection and frozen verification', [
        ('HI01_receipt_present', 'HI01_receipt_present', 'A retained read selects its recipe only from an independently sealed receipt for that exact original; none stays unavailable.', 'original_unavailable'),
        ('HI02_receipt_unique', 'HI02_receipt_unique', 'Several sealed receipts for one original are ambiguous and stay unsupported; bytes are preserved.', 'recipe_ambiguous'),
        ('HI03_receipt_original', 'HI03_receipt_original', 'The sealed receipt binds this exact original (storage, scope, family, event, key, operation, commitment).', 'original_unavailable'),
        ('HI04_recipe_known', 'HI04_recipe_known', 'The sealed receipt names a recipe in the immutable frozen recipe map.', 'recipe_unsupported'),
        ('HI05_original_verifies', 'HI05_original_verifies', 'The frozen verifier recomputes every original join, hash and identity from the original bytes under the selected recipe.', 'original_invalid'),
        ('HI06_bytes_preserved', 'HI06_bytes_preserved', 'A retained read returns the original bytes unchanged.', 'bytes_altered'),
        ('HI07_no_receipt_created', 'HI07_no_receipt_created', 'No receipt is ever created while reading.', 'receipt_created_on_read'),
        ('HI09_reader_enabled', 'HI09_reader_enabled', 'A withdrawn reader publication stops reads pending governed rebuild.', 'reader_withdrawn'),
        ('HI10_permission', 'HI10_permission', 'Every read checks current access to the original data.', 'access_refused'),
        ('HI11_not_deleted', 'HI11_not_deleted', 'A deleted/withdrawn linked body is unavailable and never resurrected.', 'body_deleted'),
        ('HI12_ref_available', 'HI12_ref_available', 'The original reference resolves; missing source is explicitly unavailable.', 'original_unavailable'),
        ('HI13_retained_recipe', 'HI13_retained_recipe', 'Historical reading uses the authenticated original admission/version/number/format recipe without current live-state tests.', 'retained_recipe_invalid'),
        ('HI14_backup_coherent', 'HI14_backup_coherent', 'Canonical operation, original lifecycle records, receipt, pack refs and controls restore as one verified coherent cut (computed by the restore model).', 'backup_cut_incoherent'),
        ('HI08_not_foreign', 'HI08_not_foreign', 'The original belongs to this Storage instance. Reachable: a fully coherent original sealed by another Storage instance passes every frozen recomputation.', 'original_foreign'),
        ('HI11_body_not_deleted', 'HI11_body_not_deleted', 'The linked logical body is not tombstoned; a deleted body is unavailable and never resurrected.', 'linked_body_deleted'),
    ]),
    'replay': ('No-effect historical replay (instrumented replay model)', _rows('RP', [
        (f'no_{e}', f'Replay performs no {e} effect; only the rebuildable projection/checkpoint changes (sink snapshot).',
         f'replay_effect_{e}') for e in EFFECTS
    ] + [('projection_rebuilt', 'Replay rebuilds exactly the derived projection of the authentic original event.',
          'replay_projection_invalid')])),
    'withdrawal': ('Writer cutoff and governed withdrawal (withdrawal model)', _rows('WD', [
        ('cutoff_recorded', 'The writer cutoff for this exact family is recorded under Storage governance.',
         'cutoff_not_recorded'),
        ('pending_drained', 'No previously issued pending operation is left pending after withdrawal.', 'pending_not_drained'),
        ('selector_withdrawn', 'The family reader selector is withdrawn.', 'selector_not_withdrawn'),
        ('publication_invalidated', 'Reader publications/checkpoints are invalidated (publication_state withdrawn).',
         'publication_not_invalidated'),
        ('no_event_created', 'Withdrawal creates no event (log snapshot unchanged).', 'withdrawal_event_created'),
        ('order', 'Cutoff fences first, pending inputs drain next, then the selector and publications are withdrawn.',
         'withdrawal_order_invalid'),
        ('drain_honest', 'Each drained operation settles with its own original receipt or is explicitly unavailable; no success is fabricated.',
         'withdrawal_drain_fabricated'),
    ])),
})

# Independent compound clauses found in the lane-wide derivation audit.
_extras = {
    'AD01_registration': [('AD01_cutoff', 'No writer cutoff is recorded under Storage governance for this exact family.', 'writer_cutoff')],
    'AD09_current_writer_generation': [('AD09_writer_generation_domain',
        'The owner writer_generation is an exact non-negative current integer (shared current_integer); typed equality alone admits matching floats.',
        'writer_generation_out_of_domain')],

    'AD04_project_scope': [('AD04_scope_kind', 'The actual source scope kind is Project.', 'scope_kind_mismatch')],
    'EN13_migration_null': [('EN13_migration_' + k, 'This migration member remains null: ' + k,
                            'migration_' + k + '_not_null') for k in MIGRATION_FIELDS],
    'PK10_source_body_clocks': [('PK10_source_updated_clock', 'The source updated_at satisfies EventRecord time.', 'source_updated_clock_invalid')],
    'CP26_token_uint64': [('CP26_uint64_' + k, 'Exact Storage uint64 source_selection slot: ' + k,
                          k + '_out_of_domain') for k in CHECKPOINT_INTEGERS],
    'SC04_cursor_sequence': [('SC04_no_regression', 'The scanned cursor does not regress behind its prior.', 'cursor_regressed')],
    'SC05_cursor_value': [('SC05_cursor_unique', 'Exactly one stored record matches a non-empty selected cursor.', 'cursor_ambiguous')],
    'SC06_matched_verified': [('SC06_custody_event', 'The resolved custody full-value commitment equals the matched record (original custody verified, not merely present).', 'scan_custody_event_mismatch')],
}
for _phase in ('admission', 'admission_config', 'envelope', 'pack', 'checkpoint', 'scan'):
    _title, _rows0 = SHARED[_phase]
    SHARED[_phase] = (_title, [r for row in _rows0 for r in
        [row] + [(n, n, inv, code) for n, inv, code in _extras.get(row[0], [])]])


# Separate independent receipt clauses, preserving original stable row ids.
_receipt_extras = {
    'RC24_no_new_receipt': [('RC24_one_original_receipt', 'Exactly one original receipt existed before settlement.', 'original_receipt_count_invalid')],
    'RC25_head_cas': [('RC25_head_operation', 'The head operation id equals the authentic operation.', 'head_operation_mismatch')],
    'RC26_head_source_join': [
        ('RC26_head_committed', 'The selected head source exists in the committed wrapper store.', 'head_source_not_committed'),
        ('RC26_head_subject', 'The head subject equals the authentic source subject.', 'head_subject_mismatch')],
}
_title, _receipt_rows = SHARED['receipt']
SHARED['receipt'] = (_title, [r for row in _receipt_rows for r in
    [row] + [(n, n, inv, code) for n, inv, code in _receipt_extras.get(row[0], [])]])

# --- PNC-019 s4d: appended rows (stable existing ids preserved) -----------------------------------------
def _append(phase, entries):
    title, rows0 = SHARED[phase]
    SHARED[phase] = (title, rows0 + [(n, n, inv, code) for n, inv, code in entries])


_append('receipt', [
    ('RC27_head_schema', 'The published head value validates under its exact closed head schema.', 'head_schema_invalid'),
    ('RC28_operation_complete_schema', 'The settled complete operation validates under its closed operation schema; state complete carries the receipt.',
     'operation_complete_invalid'),
    ('RC29_operation_receipt_join', 'The complete operation stores exactly the original first AppendReceipt.', 'operation_receipt_mismatch'),
    ('RC30_head_receipt_join', 'The published head stores exactly the original first AppendReceipt.', 'head_receipt_mismatch'),
    ('RC31_operation_complete_identity', 'Settlement changes only state and receipt; every other pending operation field is preserved.',
     'operation_settlement_rewrote'),
])
_append('retry', [
    ('RT11_retry_no_new_event', 'Retry appends no EventRecord (Storage log snapshot unchanged).', 'retry_appended_event'),
    ('RT12_retry_no_new_receipt', 'Retry mints no receipt custody (receipt index snapshot unchanged).', 'retry_minted_receipt'),
])
_append('scan', [
    ('SC09_degraded_state', 'An unverifiable frame in the captured range makes the publication degraded at its survivor prefix; it is never skipped as empty or current.',
     'scan_corruption_skipped'),
    ('SC10_inclusive_restart', 'Restart rescans the retained prior cursor frame inclusively.', 'scan_restart_exclusive'),
])
_append('cas', [('CS07_publication_not_withdrawn', 'A withdrawn publication never advances.', 'withdrawn_advance')])

BODY_JOINS = {
    'policy': ('project_id', 'revision'),
    'workflow_binding': ('binding_id', 'policy_revision'),
    'assignment': ('bsd_assignment_id', 'binding_id', 'primary_run_id', 'epoch'),
    'review_cycle': ('review_cycle_id', 'bsd_assignment_id', 'primary_generation'),
    'finding': ('bsd_finding_id', 'assignment_id', 'finding_key'),
    'quarantine': ('quarantine_id', 'assignment_id', 'review_cycle_id'),
    'review_start': ('project_id', 'policy_revision', 'binding_id', 'bsd_assignment_id', 'primary_run_id', 'epoch',
                     'primary_generation', 'review_cycle_id'),
}
for _kind, _fields in BODY_JOINS.items():
    SHARED[f'body_{_kind}'] = (f'Stored logical {_kind} body identity joined to the authentic source (SP-1365)', [
        (f'BJ_{f}', f'BJ_{f}', f'The stored logical {_kind} body {f} equals the authentic owner source for this transition.',
         f'body_{f}_mismatch') for f in _fields])

SHARED['redaction'] = ('Protected owner content never enters the event', _rows('RD', [
    ('payload_no_protected', 'No protected owner content (claim, transcript, raw output, instructions, authentication session) appears in the event payload.',
     'payload_protected_content'),
    ('envelope_no_protected', 'No protected owner content appears in envelope metadata.', 'envelope_protected_content'),
]))
SHARED['projection'] = ('Derived projection value of the matched original event', _rows('PJ', [
    ('projection_schema', 'The derived projection validates under its exact closed projection schema.', 'projection_schema_invalid'),
    ('projection_key', 'The projection key is bsd_<family>_projection.v1:{scope_partition}:{hex(owner_operation_id)}.', 'projection_key_invalid'),
    ('projection_event', 'The projection event_id equals the matched original event.', 'projection_event_mismatch'),
    ('projection_sequence', 'The projection sequence_id equals the matched original Storage sequence.', 'projection_sequence_mismatch'),
    ('projection_operation', 'The projection owner_operation_id equals the matched original operation.', 'projection_operation_mismatch'),
    ('projection_source', 'The projection source_state_ref equals the matched original source wrapper.', 'projection_source_mismatch'),
    ('projection_event_ref', 'The projection source_event_ref resolves exactly the matched original Storage record.', 'projection_event_ref_invalid'),
]))
SHARED['projection_size_entailed'] = ('Projection 16 KiB inline limit (entailed by EN17 on the admitted record)', [
    ('PJ08_projection_size', 'PJ08_projection_size',
     'The complete encoded projection is at most 16 KiB. ENTAILED: every projection string is joined to the admitted record '
     '(PJ03-PJ07) except constants, source_state_ref (safe_ref <= 512) and the fixed-width Storage locator. Write P for the '
     'projection strings and E for the record envelope strings EN17 bounded at append: E includes event_id, '
     'idempotency_key = "bsd-key@1:" + hex(project) + ":" + hex(op) (length 2p + 2o + 11) and project_id, so '
     'p + o + |event_id| <= E - o - 2p - 11. The non-joined projection parts total below 800 bytes, so P > 16384 needs '
     'o + 2p < E - 15595 <= 789, which bounds |event_id| (87 + 2|type| + 2p + 2o) and P below 2,700 bytes: a contradiction. '
     'No admitted record makes a projection first refused here.', 'projection_oversize'),
])
SHARED['rebuild'] = ('Governed successor rebuild after withdrawal (rebuild model)', _rows('RB', [
    ('successor_admitted', 'Rebuild runs only under an explicitly admitted successor reader recorded by Storage governance.', 'successor_not_admitted'),
    ('canonical_preserved', 'Canonical original EventRecord bytes are unchanged by rebuild.', 'canonical_bytes_changed'),
    ('derived_only', 'Rebuild discards and rewrites only derived rows; canonical operations, sources and heads are unchanged.', 'canonical_rows_changed'),
    ('lost_source_unavailable', 'A lost or expired source is reported unavailable, never rebuilt as empty or success.', 'lost_source_rebuilt'),
    ('no_fresh_effects', 'Rebuild performs no review, tool, Usage, note, notification, lifecycle write or event append.', 'rebuild_effect'),
    ('successor_reader', 'Rebuilt rows name the admitted successor reader, never a fallback alias of the withdrawn reader.', 'rebuild_reader_alias'),
    ('derived_rebuilt', 'Each rebuilt projection equals the deterministic projection of its canonical original.', 'rebuild_projection_invalid'),
]))
RESTORE_PARTS = ('source_wrapper', 'logical_pack', 'operation', 'payload_pack', 'receipt_custody', 'head', 'controls')
RESTORE_CHAIN_PARTS = ('start_wrapper', 'start_pack')


def _restore_rows(parts, joins):
    out = []
    for part in parts:
        out.append((f'{part}_present', f'The backup cut contains the required {part}.', f'restore_{part}_missing'))
        out.append((f'{part}_cut', f'The backed-up {part} belongs to the one selected coherent cut.', f'restore_{part}_other_cut'))
    return [(f'RS_{n}', f'RS_{n}', inv, code) for n, inv, code in out + joins]


SHARED['restore'] = ('Coherent mandatory backup cut and restore (restore model)', _restore_rows(RESTORE_PARTS, [
    ('operation_source', 'The restored operation source_state_ref names the restored source wrapper.', 'restore_operation_source_mismatch'),
    ('custody_event', 'The restored receipt custody belongs to the restored operation event.', 'restore_custody_event_mismatch'),
    ('payload_pack_digest', 'The restored payload pack bytes match the operation payload_ref digest and size.', 'restore_payload_pack_mismatch'),
    ('logical_pack_digest', 'The restored logical pack bytes match the wrapper logical_payload_ref digest and size.', 'restore_logical_pack_mismatch'),
    ('head_source', 'The restored head names the restored source wrapper.', 'restore_head_source_mismatch'),
    ('head_receipt', 'The restored head carries the restored original first receipt.', 'restore_head_receipt_mismatch'),
    ('controls_selection', 'The restored recovery controls select the restored Storage instance and manifest generation.', 'restore_controls_mismatch'),
    ('restored_equal', 'Restore writes exactly the backed-up bytes; nothing is altered or reconstructed.', 'restore_bytes_altered'),
]))
SHARED['restore_review_chain'] = ('Coherent backup of the immutable review start (restore model, review chain)', _restore_rows(RESTORE_CHAIN_PARTS, [
    ('start_pack_digest', 'The restored start pack bytes match the start wrapper logical_payload_ref.', 'restore_start_pack_mismatch'),
]))
_DERIVED_POLICY_ROWS = [
    (f'RN{13 + i}_{k}_policy', f'The candidate {k} row keeps its own {p} policy, never the event policy.', f'retention_{k}_policy_mismatch')
    for i, (k, p) in enumerate((('operation', 'RP-EVENT-IDENTITY-APPROOT'), ('projection', 'RP-PROJECTION-3GEN'),
                                ('checkpoint', 'RP-PROJECTION-3GEN')))]


def _numbered(entries):
    return [(n, n, inv, code) for n, inv, code in entries]


SHARED['retention_runtime'] = ('Event retention RP-RUNTIME-365D binding (retention model)', _numbered([
    ('RN01_policy_bound', 'The family record carries exactly the retention_policy_ref bound for this family.', 'retention_policy_mismatch'),
    ('RN02_policy_in_catalog', 'The bound policy is an exact object of the Storage retention catalog.', 'retention_policy_unknown'),
    ('RN03_anchor_run', 'The expiry anchor is the recorded completion of the actual primary_run_id this record names.', 'retention_anchor_wrong_run'),
    ('RN04_no_fabricated_anchor', 'A missing or nonterminal run completion never fabricates an anchor; the record stays ineligible.', 'retention_anchor_fabricated'),
    ('RN05_no_restart', 'Retry, replay and restore never restart the expiry anchor.', 'retention_anchor_restarted'),
    ('RN06_ttl_inclusive', 'Expiry is inclusive at anchor plus 31,536,000 seconds (catalog ttl_seconds).', 'retention_ttl_boundary_invalid'),
    ('RN07_hold_override', 'Holds and protecting references override expiry eligibility.', 'retention_hold_ignored'),
    ('RN08_cap_rolls_successor', 'Past 1,000,000 per run or 5,000,000 per Project the overflow action is roll_successor.',
     'retention_overflow_not_rolled'),
    ('RN08_cap_keeps_history', 'Overflow deletes no unexpired history.', 'retention_overflow_deleted'),
] + _DERIVED_POLICY_ROWS))
SHARED['retention_indefinite'] = ('Event retention RP-AUTHORITY-INDEFINITE binding, DL-453 (retention model)', _numbered([
    ('RN01_policy_bound', 'The family record carries exactly the retention_policy_ref bound for this family.', 'retention_policy_mismatch'),
    ('RN02_policy_in_catalog', 'The bound policy is an exact object of the Storage retention catalog.', 'retention_policy_unknown'),
    ('RN09_no_age_expiry', 'The history has no age expiry.', 'retention_age_expiry'),
    ('RN10_no_count_expiry', 'The history has no count expiry or eviction.', 'retention_count_expiry'),
    ('RN11_explicit_delete_only', 'Only explicit Delete Puppet Master project data removes it; Remove project from list does not.', 'retention_delete_rule_invalid'),
    ('RN12_pressure_refuses_new', 'Under disk pressure a new record is refused.', 'retention_pressure_accepted'),
    ('RN12_pressure_keeps_history', 'Under disk pressure existing history is kept (nothing evicted).', 'retention_pressure_evicted'),
] + _DERIVED_POLICY_ROWS))
SHARED['crash'] = ('Producer crash boundaries and recovery (producer model)', [(n, n, inv, code) for n, inv, code in [
    ('CR01_packs_before_refs', 'Payload and body packs are durable before any committed value references them.', 'crash_ref_before_pack'),
    ('CR02_source_op_atomic', 'The source wrapper and pending operation commit together: every cut holds both or neither.', 'crash_source_op_split'),
    ('CR03_head_prior_until_receipt', 'The lifecycle head stays at its prior state at every cut until the operation completes with its original receipt (the head never leads).', 'crash_head_early'),
    ('CR05_frozen_intent', 'Recovery appends exactly the frozen pending intent bytes, never a re-derived input.', 'crash_intent_rederived'),
    ('CR06_single_append', 'After recovery exactly one EventRecord exists for this idempotency identity.', 'crash_second_append'),
    ('CR07_original_receipt', 'Recovery resolves the original first receipt; it never mints a second one.', 'crash_receipt_reminted'),
    ('CR08_complete_before_result', 'No successful result is exposed at any cut before the complete operation with its original receipt is durable, so never before the first receipt.', 'crash_result_before_complete'),
    ('CR09_head_with_operation', 'Whenever the operation is complete the head is published with it in the same atomic step (the head never lags).', 'crash_head_split'),
    ('CR10_outcome_preserved', 'The recovered outcome equals the uncrashed outcome (event id, receipt, head).', 'crash_outcome_changed'),
    ('CR11_settled_values_valid', 'The settled operation and head validate under their closed schemas.', 'crash_settled_invalid'),
]])
SHARED['crash_review_start'] = ('Review start settles before provider dispatch (producer model, review_started)', _rows('CD', [
    ('dispatch_after_receipt', 'Provider dispatch happens only after the start barrier receipt settles, and recovery never dispatches twice.',
     'crash_dispatch_early'),
]))

# Shared phase order of each path through the complete checker.
PATHS = {
    'append': ['admission', 'eligibility', 'envelope', 'joins', 'identity', 'payload', 'source', 'operation',
               'operation_size', 'pack', 'body', 'owner', 'redaction'],
    'settle': ['receipt'],
    'retry': ['retry'],
    'publish': ['checkpoint', 'scan', 'cas', 'projection'],
    'read': ['history'],
    'replay': ['replay'],
    'withdraw': ['withdrawal'],
    'rebuild': ['rebuild'],
    'restore': ['restore', 'restore_review_chain'],
    'retention': ['retention'],
    'crash': ['crash', 'crash_review_start'],
}


_SCHEMA_CACHE = {}


def _schema(path):
    if path not in _SCHEMA_CACHE:
        _SCHEMA_CACHE[path] = json.loads((ROOT / path).read_text())
    return _SCHEMA_CACHE[path]


def _payload_join_fields(fam):
    plan = _schema('Plans/bsd_event_oracle_plan.json')
    for f in plan['families']:
        if f['event_type'] == fam['event_type']:
            return [g['guard_id'].split('.', 1)[1][len('payload_'):-len('_source_join')]
                    for g in f['guards']
                    if g['guard_id'].split('.', 1)[1].startswith('payload_')
                    and g['guard_id'].split('.', 1)[1].endswith('_source_join')]
    raise KeyError(fam['event_type'])


def _keyword_rows(field, spec_):
    """One row per schema keyword of one payload field (refs resolved)."""
    rows = []
    if '$ref' in spec_:
        ref = spec_['$ref'].split('/')[-1]
        base = _schema('Plans/bsd_event_payloads.schema.json')['$defs'][ref]
        spec_ = dict(base)
    if 'oneOf' in spec_:
        rows.append((f'payload.{field}.type', f'Payload {field} satisfies its exact nullable union.',
                     f'payload_{field}_type_invalid'))
        return rows
    if 'const' in spec_:
        rows.append((f'payload.{field}.const', f'Payload {field} is the exact constant value and type.',
                     f'payload_{field}_const_invalid'))
        return rows
    if 'enum' in spec_:
        rows.append((f'payload.{field}.enum', f'Payload {field} is one of the exact closed enum values.',
                     f'payload_{field}_enum_invalid'))
        return rows
    if spec_.get('type') == 'array':
        rows.append((f'payload.{field}.type', f'Payload {field} is an array.', f'payload_{field}_type_invalid'))
        if 'minItems' in spec_:
            rows.append((f'payload.{field}.minItems', f'Payload {field} has at least {spec_["minItems"]} items.',
                         f'payload_{field}_minItems_invalid'))
        if spec_.get('uniqueItems'):
            rows.append((f'payload.{field}.uniqueItems', f'Payload {field} items are unique.',
                         f'payload_{field}_uniqueItems_invalid'))
        items = spec_.get('items', {})
        if 'enum' in items:
            rows.append((f'payload.{field}.items_enum', f'Payload {field} items are exact closed enum values.',
                         f'payload_{field}_items_enum_invalid'))
        return rows
    if 'type' in spec_:
        rows.append((f'payload.{field}.type', f'Payload {field} has the exact declared type.',
                     f'payload_{field}_type_invalid'))
    for kw in ('minimum', 'maximum', 'minLength', 'maxLength'):
        if kw in spec_:
            if kw == 'minLength' and 'pattern' in spec_:
                continue  # the pattern already requires at least minLength characters; entailed, documented in report
            if kw == 'maxLength' and spec_.get('pattern') == '^[0-9a-f]{64}$':
                continue  # the sha256 pattern fixes the exact length; entailed, documented in report
            rows.append((f'payload.{field}.{kw}', f'Payload {field} satisfies {kw}={spec_[kw]}.',
                         f'payload_{field}_{kw}_invalid'))
    if 'pattern' in spec_:
        rows.append((f'payload.{field}.pattern', f'Payload {field} full-matches its exact character pattern.',
                     f'payload_{field}_pattern_invalid'))
    not_ = spec_.get('not', {})
    if 'pattern' in not_:
        rows.append((f'payload.{field}.no_linebreak', f'Payload {field} contains no CR/LF (exact full-match guard).',
                     f'payload_{field}_linebreak_invalid'))
    return rows


def payload_rows(fam):
    """Per-field, per-keyword rows of the family's closed payload schema, plus source joins."""
    schema = _schema('Plans/bsd_event_payloads.schema.json')['$defs'][fam['slug']]
    rows = []
    for field in schema['properties']:
        rows.append((f'payload.{field}.required', f'Payload {field} is present (closed required set).',
                     f'payload_{field}_required_missing'))
        rows.extend(_keyword_rows(field, schema['properties'][field]))
    rows.append(('payload.closed', 'The payload root is closed: no additional member is accepted.',
                 'payload_closed_invalid'))
    for field in _payload_join_fields(fam):
        rows.append((f'payload_{field}_source_join',
                     f'Payload {field} equals the authentic selected owner source fact for this transition.',
                     f'payload_{field}_source_join_mismatch'))
    return [(name, name, inv, code) for name, inv, code in rows]


def source_rows(fam):
    """Wrapper custody, family semantics, finding operands and the review start/terminal chain."""
    slug = fam['slug']
    wrapper = [
        ('SR01_wrapper_schema', 'The complete closed source wrapper schema validates.', 'source_wrapper_schema_invalid'),
        ('SR02_wrapper_subject', 'Source wrapper subject matches its exact logical payload identity.', 'source_subject_mismatch'),
        ('SR04_wrapper_operation', 'The wrapper owner_operation_id equals this canonical operation.', 'source_operation_mismatch'),
        ('SR05_wrapper_original', 'original_source_ref resolves the genuine original owner operation and its captured accepted inputs.',
         'source_original_missing'),
        ('SR06_source_commitment', 'The complete source-state reference resolves the exact authentic committed BSD record version.',
         'source_commitment_mismatch'),
        ('SR07_operation_source', 'The selected transition source is the original owner-committed operation, not an arbitrary reference.',
         'operation_source_invalid'),
    ]
    wrapper.insert(5, ('SR06_committed_wrapper', 'The exact selected source reference is present in the committed wrapper store.',
                       'source_not_committed'))
    wrapper.append(('SR07_operation_identity', 'The selected source operation id equals the canonical operation id.',
                    'source_operation_identity_mismatch'))
    entries = []
    for name, inv, _fn, _target, _neg, _variant in fam['semantic']:
        entries.append((f'sem_{name}', inv, f'semantic_{name}_invalid'))
    if fam['source_kind'] == 'finding':
        entries.append(('finding_identity_operands',
                        'Finding-key inputs come from the actual authenticated original identity manifest and evidence owner; the key is recomputed, never accepted as supplied.',
                        'finding_identity_invalid'))
    review_chain = slug in REVIEW_CHAIN
    if review_chain:
        entries.append(('terminal_start_custody',
                        'A genuine terminal review wrapper resolves its original immutable review_start_ref before outcome use; replacement-control-only clearance has no fabricated terminal review.',
                        'terminal_start_custody_unavailable'))
        for field in TERMINAL_START_FIELDS:
            entries.append((f'terminal_start_{field}_join',
                            f'Terminal body {field} equals its authentic original start {field}.',
                            f'terminal_start_{field}_mismatch'))
    if slug == 'review_started':
        entries.extend([
            ('start_source_kind', 'Start source is authentic pre-dispatch review admission, not a terminal review object.',
             'start_source_kind_invalid'),
            ('start_admission_identity', 'original_source_id is the actual accepted review_admission_id, used in the existing CV-1362 operation recipe.',
             'start_admission_identity_mismatch'),
            ('start_ref_join', 'review_start_ref equals the source_state_ref selection of this immutable admission.',
             'start_ref_join_mismatch'),
        ])
        for field in START_JOIN_FIELDS:
            entries.append((f'start_{field}_source_join',
                            f'Start {field} equals the authentic accepted admission fact.',
                            f'start_{field}_source_join_mismatch'))
    numbered = [(f'SR{i:02d}_{name}', f'SR{i:02d}_{name}', inv, code)
                for i, (name, inv, code) in enumerate(entries, 8)]
    expanded = []
    for row in numbered:
        expanded.append(row)
        name = row[0]
        if name.endswith('_finding_identity_operands'):
            for suffix in (*FINDING_OPERANDS, 'key'):
                child = name + '_' + suffix
                expanded.append((child, child, f'Authenticated finding identity {suffix} equals its independent source.',
                                 f'finding_identity_{suffix}_mismatch'))
        if name.endswith('_terminal_start_custody'):
            child = name + '_ref'
            expanded.append((child, child, 'The terminal wrapper resolves the exact original immutable start reference.',
                             'terminal_start_ref_mismatch'))
    return [(name, name, inv, code) for name, inv, code in wrapper] + expanded


def source_logical_schema_entailed():
    return [('SR03_wrapper_logical_schema', 'SR03_wrapper_logical_schema',
             'The exact logical payload schema/version matches the wrapper kind. ENTAILED: logical_schema_id and '
             'logical_schema_version are schema consts on each source wrapper '
             '(Plans/bsd_event_storage_contracts.schema.json, source_<kind>). Any other value is refused by '
             'SR01_wrapper_schema first, so no single-defect input is first refused here.',
             'source_logical_schema_mismatch')]


def start_body_rows():
    """Per-field rows of the closed review_start body (review_started only)."""
    schema = _schema('Plans/bsd_event_storage_contracts.schema.json')['$defs']['review_start']
    rows = []
    for field in schema['properties']:
        rows.append((f'start_body.{field}.required', f'Start body {field} is present (closed required set).',
                     f'start_body_{field}_required_missing'))
        spec_ = schema['properties'][field]
        if 'const' in spec_:
            rows.append((f'start_body.{field}.value', f'Start body {field} is the exact constant value and type.',
                         f'start_body_{field}_value_invalid'))
        elif 'enum' in spec_:
            rows.append((f'start_body.{field}.value', f'Start body {field} is one of the exact closed enum values.',
                         f'start_body_{field}_value_invalid'))
        else:
            rows.append((f'start_body.{field}.value', f'Start body {field} satisfies its exact declared type and bounds.',
                         f'start_body_{field}_value_invalid'))
    rows.append(('start_body.closed', 'The start body root is closed: no result, latency or extra member.',
                 'start_body_closed_invalid'))
    return [(name, name, inv, code) for name, inv, code in rows]


REVIEW_CHAIN = ('advice_emitted', 'finding_cleared', 'finding_held', 'finding_reconfirmed',
                'finding_suppressed', 'output_quarantined', 'review_failed', 'review_started',
                'review_timed_out')


def owner_rows(fam):
    rows = []
    for field, src in fam['owner_sources']:
        what = {'scope': 'the authentic Project scope', 'operation': 'the operation recomputed from the authentic source',
                'fact': 'the authentic owner decision', 'fact_map': 'the authentic owner decision mapped to its payload tag',
                'body': 'the authentic stored logical source body', 'start': 'the authentic immutable review start',
                'ref': 'the reference named by the authentic owner decision', 'evidence': 'the evidence owner commitment',
                'null': 'null: no such object exists at this transition'}[src[0]]
        rows.append((f'OW_{field}_join', f'Payload {field} equals {what}.', f'owner_{field}_mismatch'))
        if field in spec.REF_KINDS and src[0] != 'null':
            kind = spec.REF_KINDS[field]
            rows.append((f'OW_{field}_resolved', f'Payload {field} resolves an owner-held object; a matching string is never source authority.',
                         f'owner_{field}_unresolved'))
            rows.append((f'OW_{field}_kind', f'The {field} object is a {kind}.', f'owner_{field}_kind_mismatch'))
            rows.append((f'OW_{field}_subject', f'The {field} object belongs to this exact subject.', f'owner_{field}_subject_mismatch'))
            rows.append((f'OW_{field}_project', f'The {field} object belongs to this Project.', f'owner_{field}_project_mismatch'))
    return [(n, n, inv, code) for n, inv, code in rows]


def family_phases():
    out = {}
    for fam in spec.FAMILIES:
        out[f'owner_{fam["slug"]}'] = (f'Payload fields joined to authentic owner sources: {fam["event_type"]}', owner_rows(fam))
        out[f'payload_{fam["slug"]}'] = (f'Closed payload schema and source joins: {fam["event_type"]}',
                                         payload_rows(fam))
        out[f'source_{fam["slug"]}'] = (f'Original source custody and transition semantics: {fam["event_type"]}',
                                        source_rows(fam))
        out[f'source_logical_schema_entailed_{fam["slug"]}'] = (
            f'Wrapper logical schema const (entailed): {fam["event_type"]}', source_logical_schema_entailed())
    out['start_body_review_started'] = ('Closed pre-dispatch review start body (review_started)', start_body_rows())
    out['start_premature_result_entailed'] = ('Start body premature result (entailed by closed start schema)', [
        ('SR26_start_no_premature_result', 'SR26_start_no_premature_result',
         'Closed start body has no terminal result field or result placeholder. ENTAILED: result, latency_ms, '
         'no_call_reason and usage_attempt_ref are not members of the closed review_start schema '
         '(Plans/bsd_event_storage_contracts.schema.json, review_start, additionalProperties=false); any of them is '
         'refused by start_body.closed first, so no single-defect input is first refused here.',
         'start_premature_result'),
    ])
    return out


_ALL_PHASES_CACHE = {}


def all_phases():
    if not _ALL_PHASES_CACHE:
        phases = dict(SHARED)
        phases.update(family_phases())
        _ALL_PHASES_CACHE.update(phases)
    return _ALL_PHASES_CACHE


CHUNK_SIZE = 8
_CHUNK_SUFFIX = re.compile(r'__c\d+$')


def base_phase(phase):
    return _CHUNK_SUFFIX.sub('', phase)


def is_chunk(phase):
    return base_phase(phase) != phase


def chunk_names(base):
    rows = all_phases()[base][1]
    if len(rows) <= CHUNK_SIZE:
        return [base]
    n = (len(rows) + CHUNK_SIZE - 1) // CHUNK_SIZE
    return [f'{base}__c{i}' for i in range(n)]


def chunked_phases():
    out = {}
    for phase, (title, rows) in all_phases().items():
        if len(rows) <= CHUNK_SIZE:
            out[phase] = (title, rows)
            continue
        for i in range(0, len(rows), CHUNK_SIZE):
            out[f'{phase}__c{i // CHUNK_SIZE}'] = (f'{title} [chunk {i // CHUNK_SIZE}]', rows[i:i + CHUNK_SIZE])
    return out


def phase_name(phase, fam):
    if phase == 'owner':
        return f'owner_{fam["slug"]}'
    if phase == 'body':
        return f'body_{fam["source_kind"]}'
    if phase == 'retention':
        return 'retention_runtime' if fam['assignment_backed'] else 'retention_indefinite'
    if phase == 'restore_review_chain':
        return phase if fam['slug'] in REVIEW_CHAIN else None
    if phase == 'crash_review_start':
        return phase if fam['slug'] == 'review_started' else None
    if phase == 'payload':
        return f'payload_{fam["slug"]}'
    if phase == 'source':
        return f'source_{fam["slug"]}'
    if phase == 'admission':
        return 'admission' if fam['assignment_backed'] else 'admission_config'
    if phase == 'joins':
        return 'joins' if fam['assignment_backed'] else 'joins_config'
    if phase == 'eligibility':
        return 'eligibility' if fam['slug'] == 'assignment_started' else None
    return phase


def family_phase_names(fam):
    """Every unchunked phase a family's paths evaluate (used for the per-family witness requirement)."""
    out = []
    for path in PATHS:
        for phase in PATHS[path]:
            if phase == 'source' and fam['slug'] == 'review_started':
                out.append('start_body_review_started')
            name = phase_name(phase, fam)
            if name is not None and name not in out:
                out.append(name)
    return out


def path_phases(path, fam):
    out = []
    for phase in PATHS[path]:
        if phase == 'source' and fam['slug'] == 'review_started':
            out.extend(chunk_names('start_body_review_started'))
        name = phase_name(phase, fam)
        if name is not None:
            out.extend(chunk_names(name))
    return out
