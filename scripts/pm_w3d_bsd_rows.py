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
from pathlib import Path

import pm_w3d_bsd_spec as spec

ROOT = Path(__file__).resolve().parents[1]

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
    'operation_size_entailed': ('Operation 16 KiB inline limit (entailed, no single-defect witness)', [
        ('OZ01_operation_size', 'OZ01_operation_size',
         'The complete encoded operation value is at most 16 KiB. ENTAILED: the operation stores only redacted refs and '
         'identity (SP-1350, Plans/storage-plan.md:29614); bodies are externalized via SP-337 first. Every inline field is '
         'schema-bounded (const tags/media, sha256 digest, uint64 byte_size, safe_ref<=512 source_state_ref, enum state, '
         'null-or-AppendReceipt receipt) or an identifier joined earlier at OP03/OP04/OP05/OP06, or refused by the '
         'preceding envelope/identity phases (EN17, ID rows). No single-defect input is first refused here.',
         'operation_oversize'),
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
    'checkpoint_size_entailed': ('Checkpoint 16 KiB inline limit (entailed, no single-defect witness)', [
        ('CZ01_checkpoint_size', 'CZ01_checkpoint_size',
         'The complete encoded checkpoint value is at most 16 KiB. ENTAILED: the checkpoint stores only the nine-field '
         'durable token, the cursor and identity (SP-1350, Plans/storage-plan.md:29615); no body is inline. Every '
         'unbounded token field (checkpoint_key, checkpoint_ref, index_dataset_name) is joined earlier at '
         'CP08/CP09/CP14, and every other field is schema-bounded (uuid, eig_[64hex], sha256, uint64, const). No '
         'single-defect input is first refused here.',
         'checkpoint_oversize'),
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
        ('HI14_backup_coherent', 'HI14_backup_coherent', 'Canonical operation, original lifecycle records, receipt, pack refs and controls restore as one verified coherent cut.', 'backup_cut_incoherent'),
    ]),
    'foreign_original_entailed': ('Original Storage-instance ownership (entailed by HI05 identity)', [
        ('HI08_not_foreign', 'HI08_not_foreign',
         'The original belongs to this Storage instance and Project partition. ENTAILED: a foreign storage_instance_id changes '
         'the event_id recipe preimage; HI05_original_verifies recomputes event_id from the binding storage and refuses first '
         '(frozen_verify identity_ok, scripts/pm_w3d_bsd_events.py). No single-defect input is first refused here.',
         'original_foreign'),
    ]),
    'replay': ('No-effect historical replay', _rows('RP', [
        (f'no_{e}', f'Replay performs no {e} effect; only the rebuildable projection/checkpoint changes.',
         f'replay_effect_{e}') for e in EFFECTS
    ])),
    'withdrawal': ('Writer cutoff and governed withdrawal', _rows('WD', [
        ('cutoff_recorded', 'The writer cutoff fences new owner operations and records the exact cutoff under Storage governance.',
         'cutoff_not_recorded'),
        ('pending_drained', 'Previously issued pending inputs are drained/resolved before withdrawal.', 'pending_not_drained'),
        ('selector_withdrawn', 'The reader selector is withdrawn and publications/checkpoints invalidated.', 'selector_not_withdrawn'),
        ('no_advance', 'A withdrawn publication never advances.', 'withdrawn_advance'),
        ('no_event_created', 'Withdrawal creates no event.', 'withdrawal_event_created'),
    ])),
})

# Shared phase order of each path through the complete checker.
PATHS = {
    'append': ['admission', 'eligibility', 'envelope', 'joins', 'identity', 'payload', 'source', 'operation', 'pack'],
    'settle': ['receipt'],
    'retry': ['retry'],
    'publish': ['checkpoint', 'scan', 'cas'],
    'read': ['history'],
    'replay': ['replay'],
    'withdraw': ['withdrawal'],
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
    return [(name, name, inv, code) for name, inv, code in wrapper] + numbered


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


def family_phases():
    out = {}
    for fam in spec.FAMILIES:
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


def phase_name(phase, fam):
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


def path_phases(path, fam):
    out = []
    for phase in PATHS[path]:
        if phase == 'source' and fam['slug'] == 'review_started':
            out.append('start_body_review_started')
        name = phase_name(phase, fam)
        if name is not None:
            out.append(name)
    return out