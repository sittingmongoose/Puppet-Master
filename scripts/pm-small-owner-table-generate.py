#!/usr/bin/env python3
"""Generate DM Method B guard-table modules from the row spec below.

Each predicate reads one observation the checker derives from the complete
boundary input; predicates never recompute, repair or call helpers. The
checker (scripts/pm-small-owner-events.py) refuses only through these rows,
in spec order. Edit the spec here and regenerate; never edit a table module.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# phase: (code, title, [(row, field, invariant), ...])  -- field defaults to row
# A row entry may carry a 4th element: its own refusal code.
SPEC = {
    'writer': ('writer_refused', 'Current writer original-operation admission', [
        ('WR01_envelope_schema', 'envelope_schema', 'the complete EventRecord validates'),
        ('WR26_storage_clocks', 'storage_clocks', 'observed_at_utc and persisted_at_utc pass date_time with storage_utc_z'),
        ('WR02_producer_numbers', 'producer_numbers', 'producer integers pass CV-1100 current slots and JCS qualification'),
        ('WR03_original_integer', 'original_integer', 'the original operation carries integer leaves only'),
        ('WR04_payload_resolved', 'payload_resolved', 'the payload resolves inline or through SP-337 custody'),
        ('WR05_owner_match', 'owner_match', 'the original owner is the family owner'),
        ('WR06_operation_match', 'operation_match', 'the original operation id is the payload operation id'),
        ('WR07_result_operation', 'result_operation', 'the result operation id is the original operation id'),
        ('WR08_result_payload', 'result_payload', 'the result payload is exactly the resolved payload'),
        ('WR09_producer_witness', 'producer_witness', 'the producer witness passes its phase'),
        ('WR10_semantic', 'semantic', 'the payload passes its semantic phase'),
        ('WR11_joins_shape', 'joins_shape', 'envelope joins are exactly the original join fields'),
        ('WR12_joins_match', 'joins_match', 'every envelope join equals the event field exactly'),
        ('WR13_project_join', 'project_join', 'the envelope project is the payload project'),
        ('WR14_time_payload', 'time_payload', 'occurred_at_utc equals the payload time field'),
        ('WR15_time_original', 'time_original', 'occurred_at_utc equals the original completion time'),
        ('WR16_family_match', 'family_match', 'the event type is the family'),
        ('WR17_schema_match', 'schema_match', 'the payload schema id is the family schema'),
        ('WR18_profile_match', 'profile_match', 'the redaction profile is the family profile'),
        ('WR19_policy_match', 'policy_match', 'the replay policy is dedupe_by_idempotency_key'),
        ('WR20_storage_instance', 'storage_instance', 'the storage instance id is a string'),
        ('WR21_server_identity', 'server_identity', 'an application event has a non-empty server id'),
        ('WR22_identity_join', 'identity_join', 'the event id is the recomputed identity'),
        ('WR23_key_join', 'key_join', 'the idempotency key is the recomputed key'),
        ('WR24_migration_empty', 'migration_empty', 'every migration field is null'),
        ('WR25_subagent_run', 'subagent_run', 'a subagent event run id is the payload run id'),
    ]),
    'semantic': ('semantic_refused', 'Payload semantic rules', [
        ('SE01_project_scope', 'project_scope', 'a project-only payload has a non-empty string project id'),
        ('SE02_revision_types', 'revision_types', 'revision fields are exact integers'),
        ('SE03_revision_step', 'revision_step', 'after_revision is before_revision + 1'),
        ('SE04_lsp_state_change', 'lsp_state_change', 'an LSP lifecycle payload changes state'),
    ]),
    'witness': ('witness_refused', 'Producer witness exactness', [
        ('WI01_witness_exact', 'witness_exact', 'the witness is exactly the family required witness'),
    ]),
    'payload': ('payload_refused', 'Payload resolution and SP-337 custody', [
        ('PL01_body_codec', 'body_codec', 'the inline body encodes in the DM subset'),
        ('PL02_storage_body_codec', 'storage_body_codec', 'the stored body encodes in the DM subset'),
        ('PL03_inline_size', 'inline_size', 'an inline body is at most 16 KiB encoded'),
        ('PL04_external_shape', 'external_shape', 'an external body is empty inline with storage present'),
        ('PL05_pack_synced', 'pack_synced', 'the external pack is synced'),
        ('PL06_index_synced', 'index_synced', 'the external index is synced'),
        ('PL07_source_present', 'source_present', 'the external source is present'),
        ('PL08_permission_current', 'permission_current', 'external permission is current'),
        ('PL09_deletion_clear', 'deletion_clear', 'external deletion is clear'),
        ('PL10_hold_allows', 'hold_allows', 'the external hold allows disclosure'),
        ('PL11_storage_body_type', 'storage_body_type', 'the stored body is an object'),
        ('PL12_descriptor_size', 'descriptor_size', 'the external descriptor exceeds the inline limit'),
        ('PL13_descriptor_match', 'descriptor_match', 'the descriptor is the recomputed descriptor'),
        ('PL14_descriptor_integer', 'descriptor_integer', 'the descriptor carries integer leaves only'),
        ('PL15_ref_match', 'ref_match', 'the payload_ref is the serialized descriptor'),
        ('PL16_payload_schema', 'payload_schema', 'the resolved body validates against the payload schema'),
    ]),
    'publication': ('publication_refused', 'Append publication admission', [
        ('PB01_receipt_delivery_bool', 'receipt_delivery_bool', 'receipt delivery is a boolean'),
        ('PB02_terminal_delivery_bool', 'terminal_delivery_bool', 'terminal delivery is a boolean'),
        ('PB03_integer_state', 'integer_state', 'the publication state carries integer leaves only'),
        ('PB04_append_policy', 'append_policy', 'the event is not projector_replay_only'),
    ] + [(f'PB05_gate_{i:02d}_{name}', f'gate_{name}', f'admission gate {name} holds') for i, name in enumerate([
        'membership', 'retention_resolved', 'schema_admitted', 'writer_enabled',
        'permission_current', 'dedupe_current', 'source_custody_available',
        'original_intent_available', 'original_result_available', 'owner_acceptance_current',
        'body_committed', 'lease_current', 'restore_controls_current',
        'same_restore_occurrence', 'protected_origin_current'])] + [
        ('PB20_epoch_types', 'epoch_types', 'the three admission epochs are exact integers'),
        ('PB21_epoch_state', 'epoch_state', 'the state epoch is the accepted epoch'),
        ('PB22_epoch_current', 'epoch_current', 'the accepted epoch is the current epoch'),
        ('PB23_session_types', 'session_types', 'session and restore ids are strings'),
        ('PB24_session_match', 'session_match', 'the current owner session is the accepted session'),
        ('PB25_restore_match', 'restore_match', 'the current restore occurrence is the accepted occurrence'),
        ('PB26_writer_valid', 'writer_valid', 'the event passes the writer phase'),
        ('PB27_frame_written', 'frame_written', 'the frame is written'),
        ('PB28_group_synced', 'group_synced', 'the group is synced'),
    ]),
    'receipt': ('receipt_refused', 'First-receipt delivery', [
        ('RC01_replay_resolves', 'replay_resolves', 'the committed authority resolves the full value'),
        ('RC02_receipt_match', 'receipt_match', 'the delivered receipt is the original first receipt'),
    ]),
    'resolve': ('resolve_refused', 'Retained original semantic resolution', [
        ('RS24_write_receipt_present', 'write_receipt_present', 'the protected authority holds a sealed write receipt for the exact stored original (SP-1101; no default recipe)'),
        ('RS25_write_receipt_unique', 'write_receipt_unique', 'exactly one sealed write receipt selects the stored original\'s recipe'),
        ('RS26_write_recipe_known', 'write_recipe_known', 'the sealed write receipt names a DM recipe (dm-retained-producer-v1 or dm-cv1100-producer-v1)'),
        ('RS01_custody_schema', 'custody_schema', 'the stored custody validates'),
        ('RS02_protected_current', 'protected_current', 'the protected authority is current'),
        ('RS03_authority_integer', 'authority_integer', 'the authority carries integer leaves only'),
        ('RS04_incoming_integer', 'incoming_integer', 'the incoming producer fields carry integer leaves only'),
        ('RS05_stored_envelope', 'stored_envelope', 'the stored event validates as an envelope'),
        ('RS06_stored_payload', 'stored_payload', 'the stored payload resolves'),
        ('RS07_sequence_uint64', 'sequence_uint64', 'stored, receipt and result sequences are SP-1100 uint64'),
        ('RS08_identity_event', 'identity_event', 'custody event id is the stored event id'),
        ('RS09_identity_partition', 'identity_partition', 'custody partition is the stored scope partition'),
        ('RS10_identity_type', 'identity_type', 'custody event type is the stored type'),
        ('RS11_identity_key', 'identity_key', 'custody key is the stored idempotency key'),
        ('RS12_identity_digest', 'identity_digest', 'custody digest is the producer digest of the sealed recipe'),
        ('RS13_identity_instance', 'identity_instance', 'custody storage instance is the authority instance'),
        ('RS14_incoming_event', 'incoming_event', 'incoming event id is the stored event id'),
        ('RS15_incoming_type', 'incoming_type', 'incoming type is the stored type'),
        ('RS16_incoming_key', 'incoming_key', 'incoming key is the stored key'),
        ('RS17_incoming_digest', 'incoming_digest', 'incoming digest is the stored digest under the sealed recipe'),
        ('RS18_result_exact', 'result_exact', 'the original result is exactly the stored result join'),
        ('RS19_receipt_event', 'receipt_event', 'receipt event id is the stored event id'),
        ('RS20_receipt_sequence', 'receipt_sequence', 'receipt sequence is the stored sequence'),
        ('RS21_receipt_exact', 'receipt_exact', 'the first receipt copy is exactly the custody receipt'),
        ('RS22_storage_clocks', 'storage_clocks', 'the retained stored event passes date_time with the recipe storage_utc_z profile'),
    ]),
    # INT3 (E5-2 = A): RS23 is entailed. resolve_original validates custody_v2 with format_checker(EVENT_RECORD) at
    # RS01, so every acknowledged_at_utc string the EventRecord profile refuses is refused first at RS01; RS23 stays
    # as its own single-row table so the resolve table's 25 rows remain provable by the gated tool.
    'resolve_entailed': ('resolve_refused', 'Retained receipt acknowledgement profile (entailed: RS01 custody_v2 validation with format_checker(EVENT_RECORD) refuses first every value this row would refuse; E5-2 = A)', [
        ('RS23_ack_clock', 'ack_clock', 'acknowledged_at_utc passes date_time with the recipe EventRecord profile (E5-2)'),
    ]),
    'fullvalue': ('fullvalue_refused', 'Full-value original commitment', [
        ('FV01_requested_integer', 'requested_integer', 'the requested event carries integer leaves only'),
        ('FV02_resolve_ok', 'resolve_ok', 'semantic resolution passes its phase'),
        ('FV03_preimage_ok', 'preimage_ok', 'both full-value preimages encode'),
        ('FV04_commitment_requested', 'commitment_requested', 'the commitment is the requested preimage hash'),
        ('FV05_commitment_stored', 'commitment_stored', 'the commitment is the stored preimage hash'),
    ]),
    'retry': ('identity_conflict_without_effect', 'Current retry dispatch', [
        ('RT01_closure_keys', 'closure_keys', 'the incoming envelope has no extension keys'),
        ('RT02_schema_id', 'schema_id', 'the schema id is pm.event.v0'),
        ('RT03_schema_version', 'schema_version', 'the schema version is 2.0.0'),
        ('RT04_not_replay_only', 'not_replay_only', 'the replay policy is not projector_replay_only', 'replay_only_not_appendable'),
        ('RT05_replay_policy', 'replay_policy', 'the replay policy is dedupe_by_idempotency_key'),
        ('RT06_family', 'family', 'the event type is the family'),
        ('RT07_payload_schema', 'payload_schema', 'the payload schema id is the family schema'),
        ('RT08_producer_integer', 'producer_integer', 'producer fields carry integer leaves only'),
        ('RT09_resolve_ok', 'resolve_ok', 'the retained original resolves'),
    ]),
    'token': ('token_refused', 'Read-token original identity', [
        ('TK01_token_schema', 'token_schema', 'the token validates with full-match identifiers'),
        ('TK02_single_line', 'single_line', 'no token string carries CR or LF'),
        ('TK03_storage_match', 'storage_match', 'the token storage instance is the original instance'),
        ('TK04_selection_storage', 'selection_storage', 'the selection storage instance is the original instance'),
        ('TK05_checkpoint_key', 'checkpoint_key', 'the checkpoint key names the original instance'),
        ('TK06_dataset_name', 'dataset_name', 'the dataset name carries the token generation'),
    ]),
    'checkpoint': ('checkpoint_refused', 'Checkpoint original identity', [
        ('CP01_checkpoint_integer', 'checkpoint_integer', 'the checkpoint carries integer leaves only'),
        ('CP02_durable_token', 'durable_token', 'the durable token passes its phase'),
        ('CP03_selected_token', 'selected_token', 'the selected live token passes its phase'),
        ('CP04_token_projection', 'token_projection', 'the durable token is the live token without snapshot id'),
        ('CP05_frontier_match', 'frontier_match', 'the checkpoint frontier is the token frontier'),
    ]),
    'retained': ('retained_refused', 'Retained event read validity', [
        ('RE01_envelope_schema', 'envelope_schema', 'the retained event validates as an envelope'),
        ('RE02_family_match', 'family_match', 'the event type is the family'),
        ('RE03_schema_match', 'schema_match', 'the payload schema id is the family schema'),
        ('RE04_source_selection', 'source_selection', 'the authority selection is the selected selection'),
        ('RE05_fullvalue_ok', 'fullvalue_ok', 'the full value resolves'),
    ]),
    'reader': ('reader_refused', 'Retained reader availability', [
        ('RD01_state_integer', 'state_integer', 'reader inputs carry integer leaves only'),
        ('RD02_reader_enabled', 'reader_enabled', 'the reader is enabled'),
        ('RD03_permission', 'permission', 'permission is current'),
        ('RD04_source_present', 'source_present', 'the source is present'),
        ('RD05_deletion_clear', 'deletion_clear', 'deletion is clear'),
        ('RD06_hold_allows', 'hold_allows', 'the hold allows disclosure'),
        ('RD07_version', 'version', 'the version is 1.0.0'),
        ('RD08_frontier', 'frontier', 'the current frontier is verified'),
        ('RD09_live_token', 'live_token', 'the live token passes its phase'),
        ('RD10_selected_match', 'selected_match', 'the selected token is exactly the live token'),
        ('RD11_retained_ok', 'retained_ok', 'the retained event passes its phase'),
    ]),
    'rebuild': ('rebuild_refused', 'Publication rebuild', [
        ('RB01_state_integer', 'state_integer', 'rebuild inputs carry integer leaves only'),
    ] + [(f'RB02_gate_{i:02d}_{name}', f'gate_{name}', f'rebuild gate {name} holds') for i, name in enumerate([
        'originals_present', 'source_current', 'coverage_complete', 'schema_supported',
        'current_frontier_verified', 'cas_matches', 'reader_enabled', 'permission_current',
        'source_present', 'deletion_clear', 'hold_allows_disclosure'])] + [
        ('RB13_version', 'version', 'the version is 1.0.0'),
        ('RB14_retained_ok', 'retained_ok', 'the retained event passes its phase'),
        ('RB15_checkpoint_ok', 'checkpoint_ok', 'the checkpoint passes its phase'),
    ]),
    'settings': ('settings_refused', 'DL-408 Settings companions', [
        ('ST01_no_retired_names', 'no_retired_names', 'no companion names a retired Settings event'),
        ('ST02_theme_entries', 'theme_entries', 'theme commands record only settings.layer.changed'),
        ('ST03_guard_disabled', 'guard_disabled', 'the DRY guard profile is absent with no event refs'),
        ('ST04_guard_reason', 'guard_reason', 'the disabled reason names owner_contract_missing'),
        ('ST05_migration_tokens', 'migration_tokens', 'migration refs carry the read-only owner-adoption tokens'),
        ('ST06_no_dry_command', 'no_dry_command', 'no entry wires the DRY guard command'),
        ('ST07_exclusion_tokens', 'exclusion_tokens', 'the exclusion note carries the DL-408 tokens'),
    ]),
    'readfence': ('read_refused', 'Read fence', [
        ('RF01_current_str', 'current_str', 'the current token is a string'),
        ('RF02_selected_str', 'selected_str', 'the selected token is a string'),
        ('RF03_tokens_equal', 'tokens_equal', 'the tokens are exactly equal'),
        ('RF04_permission', 'permission', 'permission is exactly true'),
        ('RF05_source', 'source', 'the source is exactly present'),
        ('RF06_not_withdrawn', 'not_withdrawn', 'the source is not withdrawn'),
        ('RF07_version', 'version', 'the version is 1.0.0'),
    ]),
    'replay': ('identity_conflict_without_effect', 'Semantic replay decision', [
        ('RP01_original_digest_str', 'original_digest_str', 'the original digest is a string'),
        ('RP02_retry_digest_str', 'retry_digest_str', 'the retry digest is a string'),
        ('RP03_receipt_str', 'receipt_str', 'the original receipt is a string'),
        ('RP04_digests_equal', 'digests_equal', 'the digests are equal'),
    ]),
}


def render(phase, code, title, rows):
    fields = tuple(field for _, field, *_ in rows)
    lines = [
        f'"""DM guard table {phase}: {title}.',
        '',
        'Method B guard rows (scripts/pm_guard_isolation.py) for the DM checker. Each predicate reads one',
        'observation the checker derives from the complete boundary input. Predicates never recompute,',
        'repair or call helpers. The checker refuses only through these rows, in this order.',
        'Generated by scripts/pm-small-owner-table-generate.py; edit the row spec there.',
        '"""',
        'import pm_guard_isolation as g',
        '',
        f'FIELDS = {fields!r}',
        '',
    ]
    for row in rows:
        name, field = row[0], row[1]
        row_code = row[3] if len(row) > 3 else code
        lines += [f"def {name}(value, context):",
                  f"    return {row_code!r} if value[{field!r}] is not True else None", '']
    guard_lines = []
    for row in rows:
        name, field, invariant = row[0], row[1], row[2]
        row_code = row[3] if len(row) > 3 else code
        guard_lines.append(f"        g.Guard({name!r}, g.Invariant({'/' + field!r}, {invariant!r}), {row_code!r}, {name}),")
    lines += ['def case(value):',
              '    context = None',
              '    table = g.GuardTable(['] + guard_lines + [
              '    ])',
              '',
              '    def check(value):']
    for row in rows:
        lines.append(f"        table.require({row[0]!r}, value, context)")
    lines += ['        return True',
              '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def main():
    for phase, (code, title, rows) in SPEC.items():
        path = ROOT / 'scripts' / f'pm_small_owner_table_{phase}.py'
        path.write_text(render(phase, code, title, rows))
        print(path.name, len(rows))


if __name__ == '__main__':
    main()
