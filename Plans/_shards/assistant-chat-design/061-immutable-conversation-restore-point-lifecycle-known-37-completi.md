# Shard 061: Immutable conversation restore-point lifecycle - Known-37 completion

Source: `Plans/assistant-chat-design.md`

Source lines: L24136-L24153

Source SHA256: `4f05884b775e23367a0d722ec0cc8a1392dd703302a694415ff22fd1f92c2b41`

---

## Immutable conversation restore-point lifecycle - Known-37 completion

Status: `STATICALLY_MATERIALIZED`; runtime behavior is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`.

The sole corrupt edge is `available -> corrupt`, selected in this order: missing record uses the separate unavailable path; trusted record-hash mismatch selects `record_hash_mismatch`; otherwise present undecodable/invalid record selects `unreadable_record`; missing referenced material stays separate and leaves the record `available`; present material hash/length mismatch selects `corrupt_referenced_material`; only then may supported-scope failure select `unsupported_content_scope`. No fifth reason or alias exists.

The exact reason/evidence pairs are:

| reason_code | evidence_kind | required branch |
|---|---|---|
| `record_hash_mismatch` | `record_hash_comparison` | non-null unequal record hashes; referenced-material fields absent |
| `unreadable_record` | `record_decode_failure` | `expected_hash=null`, valid observed hash; referenced-material fields absent |
| `corrupt_referenced_material` | `referenced_material_integrity_check` | equal record hashes; one canonical material ref; all material hashes/lengths present; at least one unequal pair |
| `unsupported_content_scope` | `content_scope_validation` | equal record hashes; canonical material ref; material comparison fields absent |

The current writer is `Plans/event_payload_restore_point_corrupt.schema.json#` at payload ID `.../restore_point_corrupt/2.0.0`; the exact v1 is reader-only. Storage uses `MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001@1.0.0` and quarantine reason `restore_point_corrupt_v1_upgrade_unresolvable`.

Recovery-unavailable UI consumes, without reordering, either `[open_details, locate_and_verify_recovery, replan, abandon_recovery]` or the admitted isolated-successor form with `start_fresh_attempt` between replan and abandonment. It dispatches only the canonical commands, displays the owner reason and preserved-local-work warning, and treats only a committed domain result plus `recovery_unavailable_resolution_receipt` as success. UI acknowledgement alone never releases, cleans up, retries, or creates a successor.
