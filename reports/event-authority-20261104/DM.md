# DM — review round 5

Branch: `plans/ea-w2-small-owners-20261104`. Reviewed input: `9439444c222a8d63bfe44ad37397f1498a7ac9e4`. Fix commit: `7ec6476fbe1e2b6b50ba24c61dcd861219643ecc`. This reporting commit records the final assessment. VM worktree: `/home/sittingmongoose/pm-worktrees/DM-fix5`. Native execution: **NOT_RUN**.

**C5-B1 fixed.** Prepared-family grades move **6/8 → 8/8 PASS AS PREPARED**, without admission. The complete checker passes **9,735 assertions**. All **56** ordered authentic foreign-family retry pairs refuse, including both context directions. Whole-lane check 11 passes **445/445** guard-removal rows across **2,192** independent negative witnesses; every mutant fails the complete checker and every unrelated refusal remains. The six passing families retain their original fixtures, prose and grades. The DL-408 Settings application is unchanged.

## Review round 5: findings and responses

- **C5-B1 — fixed (`7ec6476fbe1e2b6b50ba24c61dcd861219643ecc`). Where:** `scripts/pm-small-owner-events.py:418` (`current_retry`), `scripts/pm-small-owner-guard-audit.py:147`, and both context rows' `foreign_family_retry_cases` in `Plans/small_owner_event_fixtures.json`. **Cause:** current retry resolved a protected genuine original without binding the requested exact event family and payload-schema ID; the two context bodies have compatible shapes. **Fix:** refuse any event_type or payload_schema_id mismatch before semantic original resolution. Existing complete producer-semantic scope/identity joins remain intact. Reciprocal fixture cases use each other's authentic unchanged EventRecord and original Storage authority, then separately swap only the event or only the authority. Refusals return no original result/receipt and zero effects; inputs stay immutable. Historical readers retain their independent protected retained-source rules. No guard is weakened. **Verify:** full checker, the three retry guard rows below, `context-probes.json`, and `before-retry-boundary.json` under `fix5/`.
- **N1 — fixed (this reporting commit). Where:** all 22 `review_round_2/3.current_evidence` captures in `DM-search.json`. **Cause:** historical hashes/anchors were not labeled with their capture revision at those records. **Fix:** add explicit `current_evidence_capture_revision=fb0cac9bd45b983c1fe03118d5641788c6a4f166` and source-lineage qualification; preserve all original hashes and quotes. Separately verify all 260 current self-grade citations against this fix. **Verify:** `source-scope-audit.json` (783 checks) and its reproducible script.
- **N2 — retained integration qualification (this reporting commit).** The prior regeneration's four `generated_at_utc` clocks remain qualified; no new owner Markdown or generated artifact changes in round 5 require regeneration. Original CRLF application bytes remain unchanged. Storage profile checker retains the same 41 errors and exact comparison-main output SHA-256 `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b`. Approved DL-408 decision-branch integration and pending RT/governance work stay assigned to batch integration; no decision, retention choice or reseal occurs here.

## Standing checks and check-11 proof

All eleven standing checks pass for every prepared family. The complete shared-helper suite reruns all eight, including the six already passing. Current append/retry rejects replay-only; CV-366 exact UTF-8 application keys and encoded `project~` partitions remain; 16 KiB/SP-337 boundaries, full-match/LF grammar, semantic-only retry comparison, original Storage checkpoint identity, exit-1 failure matchers, eager schema refs and protected retained-history readers remain. The prior 1,111 independent assertions pass. Eight corrupted-original child runs exit 1 and their matchers reject exit 0.

Check 11 is rerun for the **whole lane**, including unchanged Settings guards. Every rule's own negatives flip; every other matrix negative remains refused; all mutants fail the ordinary complete checker. The compact committed table records exact flipped IDs and the exact complement in `all_probe_ids`; the external raw table records every still-rejected ID, source/schema edit and failure. All **442 original rules** retain identical mutation edits and flipped sets; three rows and 18 independent witnesses are added. The existing named redundant schema/CRLF guard sets remain explicit in their source mutations. No production guard, schema or accepted historical path is relaxed.

| New guard removed | Own negatives that flip | Still rejected | Complete checker |
|---|---:|---:|---|
| `retry.family` alone | 8 coherent family-only witnesses | 2,184 | FAIL |
| `retry.schema` alone | 8 coherent schema-only witnesses | 2,184 | FAIL |
| Named duplicate pair `retry.family_schema_duplicate` | 16 individual witnesses + 2 authentic cross-family pairs | 2,174 | FAIL |

For individual family/schema witnesses, identity, key, original receipt/result, producer digest and full-value commitment observations are recomputed together. For the authentic cross-family pair, neither input is changed: both fences intentionally reject the same foreign family/schema fact. Removing either alone leaves its named duplicate active; removing the pair admits exactly the 18 declared witnesses. This implements both check-11 clarification paragraphs without claiming masked negatives as independent proof.

Reproduce: `python3 -B scripts/pm-small-owner-guard-audit.py <external-output.json>`.

Raw table: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/fix5/guard-removal.json`, SHA-256 `fa19d7f1882b7ca90b0780b6a024edc4196d7eff3731383e71b5e43a9a71fa31`.

| Guard removed | Negatives that flip | Negatives that stay rejected | Complete checker |
|---|---|---|---|
| `envelope.schema` | 248 IDs in `DM-guard-removal.json` | All other 1944 IDs | FAIL as required |
| `custody.schema` | 128 IDs in `DM-guard-removal.json` | All other 2064 IDs | FAIL as required |
| `writer.owner` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `writer.result` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `writer.original_joins` | 112 IDs in `DM-guard-removal.json` | All other 2080 IDs | FAIL as required |
| `writer.payload_project` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `writer.time` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `writer.family_schema` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `writer.profile_policy` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `writer.identity_key` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `writer.migration` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `producer.witness` | 32 IDs in `DM-guard-removal.json` | All other 2160 IDs | FAIL as required |
| `semantic.project` | 5 IDs in `DM-guard-removal.json` | All other 2187 IDs | FAIL as required |
| `retry.semantic_conflict` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.replay_policy` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `retry.replay_only` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `retry.current_policy` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `retry.family` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `retry.schema` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `receipt.full_value` | 72 IDs in `DM-guard-removal.json` | All other 2120 IDs | FAIL as required |
| `receipt.protected_authority` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `receipt.custody_identity` | 48 IDs in `DM-guard-removal.json` | All other 2144 IDs | FAIL as required |
| `receipt.incoming_semantics` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `receipt.append_result` | 32 IDs in `DM-guard-removal.json` | All other 2160 IDs | FAIL as required |
| `receipt.event_join` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `receipt.original_receipt` | 88 IDs in `DM-guard-removal.json` | All other 2104 IDs | FAIL as required |
| `append.current_event` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.receipt_delivery` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.terminal_delivery` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.membership` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.retention_resolved` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.schema_admitted` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.writer_enabled` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.permission_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.dedupe_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.source_custody_available` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.original_intent_available` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.original_result_available` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.owner_acceptance_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.body_committed` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.lease_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.restore_controls_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.same_restore_occurrence` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.protected_origin_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `append.epoch` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `append.session_restore` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `append.durability` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `append.receipt_delivery_identity` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `reader.token_identity` | 32 IDs in `DM-guard-removal.json` | All other 2160 IDs | FAIL as required |
| `reader.retained_value` | 24 IDs in `DM-guard-removal.json` | All other 2168 IDs | FAIL as required |
| `reader.reader_enabled` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `reader.permission_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `reader.source_present` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `reader.deletion_clear` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `reader.hold_allows_disclosure` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `reader.current_frontier_verified` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `reader.version` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `reader.selected_token` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.checkpoint` | 232 IDs in `DM-guard-removal.json` | All other 1960 IDs | FAIL as required |
| `rebuild.retained_value` | 24 IDs in `DM-guard-removal.json` | All other 2168 IDs | FAIL as required |
| `rebuild.originals_present` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.source_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.coverage_complete` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.schema_supported` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.current_frontier_verified` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.cas_matches` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.reader_enabled` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.permission_current` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.source_present` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.deletion_clear` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.hold_allows_disclosure` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `rebuild.version` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `checkpoint.outer_revision` | 16 IDs in `DM-guard-removal.json` | All other 2176 IDs | FAIL as required |
| `checkpoint.selected_token` | 24 IDs in `DM-guard-removal.json` | All other 2168 IDs | FAIL as required |
| `token.storage_instance_id` | 24 IDs in `DM-guard-removal.json` | All other 2168 IDs | FAIL as required |
| `token.source_storage` | 24 IDs in `DM-guard-removal.json` | All other 2168 IDs | FAIL as required |
| `token.checkpoint_key` | 24 IDs in `DM-guard-removal.json` | All other 2168 IDs | FAIL as required |
| `token.dataset_generation` | 24 IDs in `DM-guard-removal.json` | All other 2168 IDs | FAIL as required |
| `history.family` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `history.schema` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `history.source_selection` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `token.generation_dataset_grammar` | 48 IDs in `DM-guard-removal.json` | All other 2144 IDs | FAIL as required |
| `token.other_string_grammar` | 168 IDs in `DM-guard-removal.json` | All other 2024 IDs | FAIL as required |
| `token.durable_snapshot` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `token.schema` | 112 IDs in `DM-guard-removal.json` | All other 2080 IDs | FAIL as required |
| `payload.inline_cap` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `payload.schema` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `read_helper.token` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `read_helper.permission` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `read_helper.source` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `read_helper.withdrawal` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `read_helper.version` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `schema.references` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `schema.meta` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `schema.format.applied:type` | `schema.format.applied:type\|format.applied:schema:type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:additionalProperties` | `schema.format.applied:additionalProperties\|format.applied:schema:additionalProperties` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.0` | `schema.format.applied:required.0\|format.applied:schema:missing_schema_version` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.1` | `schema.format.applied:required.1\|format.applied:schema:missing_operation_id` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.2` | `schema.format.applied:required.2\|format.applied:schema:missing_project_id` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.3` | `schema.format.applied:required.3\|format.applied:schema:missing_formatter_id` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.4` | `schema.format.applied:required.4\|format.applied:schema:missing_file_path` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.5` | `schema.format.applied:required.5\|format.applied:schema:missing_diff_bytes` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.6` | `schema.format.applied:required.6\|format.applied:schema:missing_timestamp` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.7` | `schema.format.applied:required.7\|format.applied:schema:missing_tool_output_ref` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:required.8` | `schema.format.applied:required.8\|format.applied:schema:missing_formatted_output_ref` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.schema_version.const` | `schema.format.applied:properties.schema_version.const\|format.applied:schema:properties.schema_version.const` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.type` | `schema.format.applied:properties.operation_id.type\|format.applied:schema:properties.operation_id.type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.minLength` | `schema.format.applied:properties.operation_id.minLength\|format.applied:schema:properties.operation_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.maxLength` | `schema.format.applied:properties.operation_id.maxLength\|format.applied:schema:properties.operation_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.project_id.type` | `schema.format.applied:properties.project_id.type\|format.applied:schema:properties.project_id.type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.project_id.minLength` | `schema.format.applied:properties.project_id.minLength\|format.applied:schema:properties.project_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.project_id.maxLength` | `schema.format.applied:properties.project_id.maxLength\|format.applied:schema:properties.project_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.type` | `schema.format.applied:properties.formatter_id.type\|format.applied:schema:properties.formatter_id.type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.minLength` | `schema.format.applied:properties.formatter_id.minLength\|format.applied:schema:properties.formatter_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.maxLength` | `schema.format.applied:properties.formatter_id.maxLength\|format.applied:schema:properties.formatter_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.file_path.type` | `schema.format.applied:properties.file_path.type\|format.applied:schema:properties.file_path.type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.file_path.maxLength` | `schema.format.applied:properties.file_path.maxLength\|format.applied:schema:properties.file_path.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.file_path.pattern` | `schema.format.applied:properties.file_path.pattern\|format.applied:schema:properties.file_path.pattern`; `schema.format.applied:properties.file_path.pattern\|format.applied:schema:LF:file_path` | All other 2190 IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.type` | `schema.format.applied:properties.diff_bytes.type\|format.applied:schema:properties.diff_bytes.type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.minimum` | `schema.format.applied:properties.diff_bytes.minimum\|format.applied:schema:properties.diff_bytes.minimum` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.maximum` | `schema.format.applied:properties.diff_bytes.maximum\|format.applied:schema:properties.diff_bytes.maximum` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.type` | `schema.format.applied:properties.timestamp.type\|format.applied:schema:properties.timestamp.type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.maxLength` | `schema.format.applied:properties.timestamp.maxLength\|format.applied:schema:properties.timestamp.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.format` | `schema.format.applied:properties.timestamp.format\|format.applied:schema:properties.timestamp.format` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.type` | `schema.format.applied:properties.tool_output_ref.type\|format.applied:schema:properties.tool_output_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.maxLength` | `schema.format.applied:properties.tool_output_ref.maxLength\|format.applied:schema:properties.tool_output_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.pattern` | `schema.format.applied:properties.tool_output_ref.pattern\|format.applied:schema:properties.tool_output_ref.pattern`; `schema.format.applied:properties.tool_output_ref.pattern\|format.applied:schema:LF:tool_output_ref` | All other 2190 IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.type` | `schema.format.applied:properties.formatted_output_ref.type\|format.applied:schema:properties.formatted_output_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.maxLength` | `schema.format.applied:properties.formatted_output_ref.maxLength\|format.applied:schema:properties.formatted_output_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.pattern` | `schema.format.applied:properties.formatted_output_ref.pattern\|format.applied:schema:properties.formatted_output_ref.pattern`; `schema.format.applied:properties.formatted_output_ref.pattern\|format.applied:schema:LF:formatted_output_ref` | All other 2190 IDs | FAIL as required |
| `semantic.edge` | `semantic.edge\|lsp.server.lifecycle_changed:lifecycle_edge` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:type` | `schema.lsp.server.lifecycle_changed:type\|lsp.server.lifecycle_changed:schema:type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:additionalProperties` | `schema.lsp.server.lifecycle_changed:additionalProperties\|lsp.server.lifecycle_changed:schema:additionalProperties` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.0` | `schema.lsp.server.lifecycle_changed:required.0\|lsp.server.lifecycle_changed:schema:missing_schema_version` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.1` | `schema.lsp.server.lifecycle_changed:required.1\|lsp.server.lifecycle_changed:schema:missing_operation_id` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.2` | `schema.lsp.server.lifecycle_changed:required.2\|lsp.server.lifecycle_changed:schema:missing_project_id` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.3` | `schema.lsp.server.lifecycle_changed:required.3\|lsp.server.lifecycle_changed:schema:missing_host_id` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.4` | `schema.lsp.server.lifecycle_changed:required.4\|lsp.server.lifecycle_changed:schema:missing_server_id` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.5` | `schema.lsp.server.lifecycle_changed:required.5\|lsp.server.lifecycle_changed:schema:missing_root_identity` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.6` | `schema.lsp.server.lifecycle_changed:required.6\|lsp.server.lifecycle_changed:schema:missing_lsp_session_id` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.7` | `schema.lsp.server.lifecycle_changed:required.7\|lsp.server.lifecycle_changed:schema:missing_previous_state` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.8` | `schema.lsp.server.lifecycle_changed:required.8\|lsp.server.lifecycle_changed:schema:missing_state` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.9` | `schema.lsp.server.lifecycle_changed:required.9\|lsp.server.lifecycle_changed:schema:missing_state_reason` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.10` | `schema.lsp.server.lifecycle_changed:required.10\|lsp.server.lifecycle_changed:schema:missing_ts` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.schema_version.const` | `schema.lsp.server.lifecycle_changed:properties.schema_version.const\|lsp.server.lifecycle_changed:schema:properties.schema_version.const` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.type` | `schema.lsp.server.lifecycle_changed:properties.operation_id.type\|lsp.server.lifecycle_changed:schema:properties.operation_id.type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.minLength` | `schema.lsp.server.lifecycle_changed:properties.operation_id.minLength\|lsp.server.lifecycle_changed:schema:properties.operation_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.maxLength` | `schema.lsp.server.lifecycle_changed:properties.operation_id.maxLength\|lsp.server.lifecycle_changed:schema:properties.operation_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.type` | `schema.lsp.server.lifecycle_changed:properties.project_id.type\|lsp.server.lifecycle_changed:schema:properties.project_id.type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.minLength` | `schema.lsp.server.lifecycle_changed:properties.project_id.minLength\|lsp.server.lifecycle_changed:schema:properties.project_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.maxLength` | `schema.lsp.server.lifecycle_changed:properties.project_id.maxLength\|lsp.server.lifecycle_changed:schema:properties.project_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.type` | `schema.lsp.server.lifecycle_changed:properties.host_id.type\|lsp.server.lifecycle_changed:schema:properties.host_id.type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.minLength` | `schema.lsp.server.lifecycle_changed:properties.host_id.minLength\|lsp.server.lifecycle_changed:schema:properties.host_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.maxLength` | `schema.lsp.server.lifecycle_changed:properties.host_id.maxLength\|lsp.server.lifecycle_changed:schema:properties.host_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.type` | `schema.lsp.server.lifecycle_changed:properties.server_id.type\|lsp.server.lifecycle_changed:schema:properties.server_id.type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.minLength` | `schema.lsp.server.lifecycle_changed:properties.server_id.minLength\|lsp.server.lifecycle_changed:schema:properties.server_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.maxLength` | `schema.lsp.server.lifecycle_changed:properties.server_id.maxLength\|lsp.server.lifecycle_changed:schema:properties.server_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.type` | `schema.lsp.server.lifecycle_changed:properties.root_identity.type\|lsp.server.lifecycle_changed:schema:properties.root_identity.type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.minLength` | `schema.lsp.server.lifecycle_changed:properties.root_identity.minLength\|lsp.server.lifecycle_changed:schema:properties.root_identity.minLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.maxLength` | `schema.lsp.server.lifecycle_changed:properties.root_identity.maxLength\|lsp.server.lifecycle_changed:schema:properties.root_identity.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.type` | `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.type\|lsp.server.lifecycle_changed:schema:properties.lsp_session_id.type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.minLength` | `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.minLength\|lsp.server.lifecycle_changed:schema:properties.lsp_session_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.maxLength` | `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.maxLength\|lsp.server.lifecycle_changed:schema:properties.lsp_session_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.previous_state.enum` | `schema.lsp.server.lifecycle_changed:properties.previous_state.enum\|lsp.server.lifecycle_changed:schema:properties.previous_state.enum` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state.enum` | `schema.lsp.server.lifecycle_changed:properties.state.enum\|lsp.server.lifecycle_changed:schema:properties.state.enum` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.type` | `schema.lsp.server.lifecycle_changed:properties.state_reason.type\|lsp.server.lifecycle_changed:schema:properties.state_reason.type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.minLength` | `schema.lsp.server.lifecycle_changed:properties.state_reason.minLength\|lsp.server.lifecycle_changed:schema:properties.state_reason.minLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.maxLength` | `schema.lsp.server.lifecycle_changed:properties.state_reason.maxLength\|lsp.server.lifecycle_changed:schema:properties.state_reason.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.type` | `schema.lsp.server.lifecycle_changed:properties.ts.type\|lsp.server.lifecycle_changed:schema:properties.ts.type` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.maxLength` | `schema.lsp.server.lifecycle_changed:properties.ts.maxLength\|lsp.server.lifecycle_changed:schema:properties.ts.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.format` | `schema.lsp.server.lifecycle_changed:properties.ts.format\|lsp.server.lifecycle_changed:schema:properties.ts.format` | All other 2191 IDs | FAIL as required |
| `writer.server_identity` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `payload.external_pack_synced` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `payload.external_index_synced` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `payload.external_source_present` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `payload.external_permission_current` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `payload.external_deletion_clear` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `payload.external_hold_allows_disclosure` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `payload.external_exclusivity` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `payload.external_descriptor` | 6 IDs in `DM-guard-removal.json` | All other 2186 IDs | FAIL as required |
| `payload.external_ref` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.model.catalog_refreshed:type` | `schema.model.catalog_refreshed:type\|model.catalog_refreshed:schema:type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:additionalProperties` | `schema.model.catalog_refreshed:additionalProperties\|model.catalog_refreshed:schema:additionalProperties` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.0` | `schema.model.catalog_refreshed:required.0\|model.catalog_refreshed:schema:missing_schema_version` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.1` | `schema.model.catalog_refreshed:required.1\|model.catalog_refreshed:schema:missing_operation_id` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.2` | `schema.model.catalog_refreshed:required.2\|model.catalog_refreshed:schema:missing_project_id` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.3` | `schema.model.catalog_refreshed:required.3\|model.catalog_refreshed:schema:missing_model_catalog_revision` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.4` | `schema.model.catalog_refreshed:required.4\|model.catalog_refreshed:schema:missing_provider_status_refs` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.5` | `schema.model.catalog_refreshed:required.5\|model.catalog_refreshed:schema:missing_refresh_reason` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.6` | `schema.model.catalog_refreshed:required.6\|model.catalog_refreshed:schema:missing_provider_id` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.7` | `schema.model.catalog_refreshed:required.7\|model.catalog_refreshed:schema:missing_account_id` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.8` | `schema.model.catalog_refreshed:required.8\|model.catalog_refreshed:schema:missing_completed_at_utc` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.schema_version.const` | `schema.model.catalog_refreshed:properties.schema_version.const\|model.catalog_refreshed:schema:properties.schema_version.const` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.type` | `schema.model.catalog_refreshed:properties.operation_id.type\|model.catalog_refreshed:schema:properties.operation_id.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.minLength` | `schema.model.catalog_refreshed:properties.operation_id.minLength\|model.catalog_refreshed:schema:properties.operation_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.maxLength` | `schema.model.catalog_refreshed:properties.operation_id.maxLength\|model.catalog_refreshed:schema:properties.operation_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.type` | `schema.model.catalog_refreshed:properties.project_id.anyOf.0.type\|model.catalog_refreshed:schema:properties.project_id.anyOf.0.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.minLength` | `schema.model.catalog_refreshed:properties.project_id.anyOf.0.minLength\|model.catalog_refreshed:schema:properties.project_id.anyOf.0.minLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.maxLength` | `schema.model.catalog_refreshed:properties.project_id.anyOf.0.maxLength\|model.catalog_refreshed:schema:properties.project_id.anyOf.0.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.type` | `schema.model.catalog_refreshed:properties.model_catalog_revision.type\|model.catalog_refreshed:schema:properties.model_catalog_revision.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.minimum` | `schema.model.catalog_refreshed:properties.model_catalog_revision.minimum\|model.catalog_refreshed:schema:properties.model_catalog_revision.minimum` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.maximum` | `schema.model.catalog_refreshed:properties.model_catalog_revision.maximum\|model.catalog_refreshed:schema:properties.model_catalog_revision.maximum` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.type` | `schema.model.catalog_refreshed:properties.provider_status_refs.type\|model.catalog_refreshed:schema:properties.provider_status_refs.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.maxItems` | `schema.model.catalog_refreshed:properties.provider_status_refs.maxItems\|model.catalog_refreshed:schema:properties.provider_status_refs.maxItems` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.uniqueItems` | `schema.model.catalog_refreshed:properties.provider_status_refs.uniqueItems\|model.catalog_refreshed:schema:properties.provider_status_refs.uniqueItems` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.type` | `schema.model.catalog_refreshed:properties.provider_status_refs.items.type\|model.catalog_refreshed:schema:properties.provider_status_refs.items.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.maxLength` | `schema.model.catalog_refreshed:properties.provider_status_refs.items.maxLength\|model.catalog_refreshed:schema:properties.provider_status_refs.items.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.pattern` | `schema.model.catalog_refreshed:properties.provider_status_refs.items.pattern\|model.catalog_refreshed:schema:properties.provider_status_refs.items.pattern`; `schema.model.catalog_refreshed:properties.provider_status_refs.items.pattern\|model.catalog_refreshed:schema:LF:provider_status_refs.0` | All other 2190 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.type` | `schema.model.catalog_refreshed:properties.refresh_reason.type\|model.catalog_refreshed:schema:properties.refresh_reason.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.minLength` | `schema.model.catalog_refreshed:properties.refresh_reason.minLength\|model.catalog_refreshed:schema:properties.refresh_reason.minLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.maxLength` | `schema.model.catalog_refreshed:properties.refresh_reason.maxLength\|model.catalog_refreshed:schema:properties.refresh_reason.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.type` | `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.type\|model.catalog_refreshed:schema:properties.provider_id.anyOf.0.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.minLength` | `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.minLength\|model.catalog_refreshed:schema:properties.provider_id.anyOf.0.minLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.maxLength` | `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.maxLength\|model.catalog_refreshed:schema:properties.provider_id.anyOf.0.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.type` | `schema.model.catalog_refreshed:properties.account_id.anyOf.0.type\|model.catalog_refreshed:schema:properties.account_id.anyOf.0.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.minLength` | `schema.model.catalog_refreshed:properties.account_id.anyOf.0.minLength\|model.catalog_refreshed:schema:properties.account_id.anyOf.0.minLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.maxLength` | `schema.model.catalog_refreshed:properties.account_id.anyOf.0.maxLength\|model.catalog_refreshed:schema:properties.account_id.anyOf.0.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.type` | `schema.model.catalog_refreshed:properties.completed_at_utc.type\|model.catalog_refreshed:schema:properties.completed_at_utc.type` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.maxLength` | `schema.model.catalog_refreshed:properties.completed_at_utc.maxLength\|model.catalog_refreshed:schema:properties.completed_at_utc.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.format` | `schema.model.catalog_refreshed:properties.completed_at_utc.format\|model.catalog_refreshed:schema:properties.completed_at_utc.format` | All other 2191 IDs | FAIL as required |
| `writer.child_run` | `writer.child_run\|subagent.context_rehydrated:child_run`; `writer.child_run\|subagent.context_shrunk:child_run` | All other 2190 IDs | FAIL as required |
| `semantic.revision` | `semantic.revision\|subagent.context_rehydrated:revision_successor`; `semantic.revision\|subagent.context_shrunk:revision_successor` | All other 2190 IDs | FAIL as required |
| `retry.family_schema_duplicate` | 18 IDs in `DM-guard-removal.json` | All other 2174 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:type` | `schema.subagent.context_rehydrated:type\|subagent.context_rehydrated:schema:type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:additionalProperties` | `schema.subagent.context_rehydrated:additionalProperties\|subagent.context_rehydrated:schema:additionalProperties` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.0` | `schema.subagent.context_rehydrated:required.0\|subagent.context_rehydrated:schema:missing_schema_version` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.1` | `schema.subagent.context_rehydrated:required.1\|subagent.context_rehydrated:schema:missing_operation_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.2` | `schema.subagent.context_rehydrated:required.2\|subagent.context_rehydrated:schema:missing_project_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.3` | `schema.subagent.context_rehydrated:required.3\|subagent.context_rehydrated:schema:missing_agent_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.4` | `schema.subagent.context_rehydrated:required.4\|subagent.context_rehydrated:schema:missing_run_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.5` | `schema.subagent.context_rehydrated:required.5\|subagent.context_rehydrated:schema:missing_child_run_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.6` | `schema.subagent.context_rehydrated:required.6\|subagent.context_rehydrated:schema:missing_before_revision` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.7` | `schema.subagent.context_rehydrated:required.7\|subagent.context_rehydrated:schema:missing_after_revision` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.8` | `schema.subagent.context_rehydrated:required.8\|subagent.context_rehydrated:schema:missing_source_refs` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.9` | `schema.subagent.context_rehydrated:required.9\|subagent.context_rehydrated:schema:missing_effective_context_ref` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.10` | `schema.subagent.context_rehydrated:required.10\|subagent.context_rehydrated:schema:missing_occurred_at_utc` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.schema_version.const` | `schema.subagent.context_rehydrated:properties.schema_version.const\|subagent.context_rehydrated:schema:properties.schema_version.const` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.type` | `schema.subagent.context_rehydrated:properties.operation_id.type\|subagent.context_rehydrated:schema:properties.operation_id.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.minLength` | `schema.subagent.context_rehydrated:properties.operation_id.minLength\|subagent.context_rehydrated:schema:properties.operation_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.maxLength` | `schema.subagent.context_rehydrated:properties.operation_id.maxLength\|subagent.context_rehydrated:schema:properties.operation_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.type` | `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.type\|subagent.context_rehydrated:schema:properties.project_id.anyOf.0.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.minLength` | `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.minLength\|subagent.context_rehydrated:schema:properties.project_id.anyOf.0.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.maxLength` | `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.maxLength\|subagent.context_rehydrated:schema:properties.project_id.anyOf.0.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.type` | `schema.subagent.context_rehydrated:properties.agent_id.type\|subagent.context_rehydrated:schema:properties.agent_id.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.minLength` | `schema.subagent.context_rehydrated:properties.agent_id.minLength\|subagent.context_rehydrated:schema:properties.agent_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.maxLength` | `schema.subagent.context_rehydrated:properties.agent_id.maxLength\|subagent.context_rehydrated:schema:properties.agent_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.type` | `schema.subagent.context_rehydrated:properties.run_id.type\|subagent.context_rehydrated:schema:properties.run_id.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.minLength` | `schema.subagent.context_rehydrated:properties.run_id.minLength\|subagent.context_rehydrated:schema:properties.run_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.maxLength` | `schema.subagent.context_rehydrated:properties.run_id.maxLength\|subagent.context_rehydrated:schema:properties.run_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.type` | `schema.subagent.context_rehydrated:properties.child_run_id.type\|subagent.context_rehydrated:schema:properties.child_run_id.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.minLength` | `schema.subagent.context_rehydrated:properties.child_run_id.minLength\|subagent.context_rehydrated:schema:properties.child_run_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.maxLength` | `schema.subagent.context_rehydrated:properties.child_run_id.maxLength\|subagent.context_rehydrated:schema:properties.child_run_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.type` | `schema.subagent.context_rehydrated:properties.before_revision.type\|subagent.context_rehydrated:schema:properties.before_revision.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.minimum` | `schema.subagent.context_rehydrated:properties.before_revision.minimum\|subagent.context_rehydrated:schema:properties.before_revision.minimum` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.maximum` | `schema.subagent.context_rehydrated:properties.before_revision.maximum\|subagent.context_rehydrated:schema:properties.before_revision.maximum` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.type` | `schema.subagent.context_rehydrated:properties.after_revision.type\|subagent.context_rehydrated:schema:properties.after_revision.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.minimum` | `schema.subagent.context_rehydrated:properties.after_revision.minimum\|subagent.context_rehydrated:schema:properties.after_revision.minimum` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.maximum` | `schema.subagent.context_rehydrated:properties.after_revision.maximum\|subagent.context_rehydrated:schema:properties.after_revision.maximum` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.type` | `schema.subagent.context_rehydrated:properties.source_refs.type\|subagent.context_rehydrated:schema:properties.source_refs.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.minItems` | `schema.subagent.context_rehydrated:properties.source_refs.minItems\|subagent.context_rehydrated:schema:properties.source_refs.minItems` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.maxItems` | `schema.subagent.context_rehydrated:properties.source_refs.maxItems\|subagent.context_rehydrated:schema:properties.source_refs.maxItems` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.uniqueItems` | `schema.subagent.context_rehydrated:properties.source_refs.uniqueItems\|subagent.context_rehydrated:schema:properties.source_refs.uniqueItems` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.type` | `schema.subagent.context_rehydrated:properties.source_refs.items.type\|subagent.context_rehydrated:schema:properties.source_refs.items.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.maxLength` | `schema.subagent.context_rehydrated:properties.source_refs.items.maxLength\|subagent.context_rehydrated:schema:properties.source_refs.items.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.pattern` | `schema.subagent.context_rehydrated:properties.source_refs.items.pattern\|subagent.context_rehydrated:schema:properties.source_refs.items.pattern`; `schema.subagent.context_rehydrated:properties.source_refs.items.pattern\|subagent.context_rehydrated:schema:LF:source_refs.0` | All other 2190 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.type` | `schema.subagent.context_rehydrated:properties.effective_context_ref.type\|subagent.context_rehydrated:schema:properties.effective_context_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.maxLength` | `schema.subagent.context_rehydrated:properties.effective_context_ref.maxLength\|subagent.context_rehydrated:schema:properties.effective_context_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.pattern` | `schema.subagent.context_rehydrated:properties.effective_context_ref.pattern\|subagent.context_rehydrated:schema:properties.effective_context_ref.pattern`; `schema.subagent.context_rehydrated:properties.effective_context_ref.pattern\|subagent.context_rehydrated:schema:LF:effective_context_ref` | All other 2190 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.type` | `schema.subagent.context_rehydrated:properties.occurred_at_utc.type\|subagent.context_rehydrated:schema:properties.occurred_at_utc.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.maxLength` | `schema.subagent.context_rehydrated:properties.occurred_at_utc.maxLength\|subagent.context_rehydrated:schema:properties.occurred_at_utc.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.format` | `schema.subagent.context_rehydrated:properties.occurred_at_utc.format\|subagent.context_rehydrated:schema:properties.occurred_at_utc.format` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:type` | `schema.subagent.context_shrunk:type\|subagent.context_shrunk:schema:type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:additionalProperties` | `schema.subagent.context_shrunk:additionalProperties\|subagent.context_shrunk:schema:additionalProperties` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.0` | `schema.subagent.context_shrunk:required.0\|subagent.context_shrunk:schema:missing_schema_version` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.1` | `schema.subagent.context_shrunk:required.1\|subagent.context_shrunk:schema:missing_operation_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.2` | `schema.subagent.context_shrunk:required.2\|subagent.context_shrunk:schema:missing_project_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.3` | `schema.subagent.context_shrunk:required.3\|subagent.context_shrunk:schema:missing_agent_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.4` | `schema.subagent.context_shrunk:required.4\|subagent.context_shrunk:schema:missing_run_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.5` | `schema.subagent.context_shrunk:required.5\|subagent.context_shrunk:schema:missing_child_run_id` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.6` | `schema.subagent.context_shrunk:required.6\|subagent.context_shrunk:schema:missing_before_revision` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.7` | `schema.subagent.context_shrunk:required.7\|subagent.context_shrunk:schema:missing_after_revision` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.8` | `schema.subagent.context_shrunk:required.8\|subagent.context_shrunk:schema:missing_source_refs` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.9` | `schema.subagent.context_shrunk:required.9\|subagent.context_shrunk:schema:missing_effective_context_ref` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.10` | `schema.subagent.context_shrunk:required.10\|subagent.context_shrunk:schema:missing_occurred_at_utc` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.schema_version.const` | `schema.subagent.context_shrunk:properties.schema_version.const\|subagent.context_shrunk:schema:properties.schema_version.const` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.type` | `schema.subagent.context_shrunk:properties.operation_id.type\|subagent.context_shrunk:schema:properties.operation_id.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.minLength` | `schema.subagent.context_shrunk:properties.operation_id.minLength\|subagent.context_shrunk:schema:properties.operation_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.maxLength` | `schema.subagent.context_shrunk:properties.operation_id.maxLength\|subagent.context_shrunk:schema:properties.operation_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.type` | `schema.subagent.context_shrunk:properties.project_id.anyOf.0.type\|subagent.context_shrunk:schema:properties.project_id.anyOf.0.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.minLength` | `schema.subagent.context_shrunk:properties.project_id.anyOf.0.minLength\|subagent.context_shrunk:schema:properties.project_id.anyOf.0.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.maxLength` | `schema.subagent.context_shrunk:properties.project_id.anyOf.0.maxLength\|subagent.context_shrunk:schema:properties.project_id.anyOf.0.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.type` | `schema.subagent.context_shrunk:properties.agent_id.type\|subagent.context_shrunk:schema:properties.agent_id.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.minLength` | `schema.subagent.context_shrunk:properties.agent_id.minLength\|subagent.context_shrunk:schema:properties.agent_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.maxLength` | `schema.subagent.context_shrunk:properties.agent_id.maxLength\|subagent.context_shrunk:schema:properties.agent_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.type` | `schema.subagent.context_shrunk:properties.run_id.type\|subagent.context_shrunk:schema:properties.run_id.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.minLength` | `schema.subagent.context_shrunk:properties.run_id.minLength\|subagent.context_shrunk:schema:properties.run_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.maxLength` | `schema.subagent.context_shrunk:properties.run_id.maxLength\|subagent.context_shrunk:schema:properties.run_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.type` | `schema.subagent.context_shrunk:properties.child_run_id.type\|subagent.context_shrunk:schema:properties.child_run_id.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.minLength` | `schema.subagent.context_shrunk:properties.child_run_id.minLength\|subagent.context_shrunk:schema:properties.child_run_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.maxLength` | `schema.subagent.context_shrunk:properties.child_run_id.maxLength\|subagent.context_shrunk:schema:properties.child_run_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.type` | `schema.subagent.context_shrunk:properties.before_revision.type\|subagent.context_shrunk:schema:properties.before_revision.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.minimum` | `schema.subagent.context_shrunk:properties.before_revision.minimum\|subagent.context_shrunk:schema:properties.before_revision.minimum` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.maximum` | `schema.subagent.context_shrunk:properties.before_revision.maximum\|subagent.context_shrunk:schema:properties.before_revision.maximum` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.type` | `schema.subagent.context_shrunk:properties.after_revision.type\|subagent.context_shrunk:schema:properties.after_revision.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.minimum` | `schema.subagent.context_shrunk:properties.after_revision.minimum\|subagent.context_shrunk:schema:properties.after_revision.minimum` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.maximum` | `schema.subagent.context_shrunk:properties.after_revision.maximum\|subagent.context_shrunk:schema:properties.after_revision.maximum` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.type` | `schema.subagent.context_shrunk:properties.source_refs.type\|subagent.context_shrunk:schema:properties.source_refs.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.minItems` | `schema.subagent.context_shrunk:properties.source_refs.minItems\|subagent.context_shrunk:schema:properties.source_refs.minItems` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.maxItems` | `schema.subagent.context_shrunk:properties.source_refs.maxItems\|subagent.context_shrunk:schema:properties.source_refs.maxItems` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.uniqueItems` | `schema.subagent.context_shrunk:properties.source_refs.uniqueItems\|subagent.context_shrunk:schema:properties.source_refs.uniqueItems` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.type` | `schema.subagent.context_shrunk:properties.source_refs.items.type\|subagent.context_shrunk:schema:properties.source_refs.items.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.maxLength` | `schema.subagent.context_shrunk:properties.source_refs.items.maxLength\|subagent.context_shrunk:schema:properties.source_refs.items.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.pattern` | `schema.subagent.context_shrunk:properties.source_refs.items.pattern\|subagent.context_shrunk:schema:properties.source_refs.items.pattern`; `schema.subagent.context_shrunk:properties.source_refs.items.pattern\|subagent.context_shrunk:schema:LF:source_refs.0` | All other 2190 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.type` | `schema.subagent.context_shrunk:properties.effective_context_ref.type\|subagent.context_shrunk:schema:properties.effective_context_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.maxLength` | `schema.subagent.context_shrunk:properties.effective_context_ref.maxLength\|subagent.context_shrunk:schema:properties.effective_context_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.pattern` | `schema.subagent.context_shrunk:properties.effective_context_ref.pattern\|subagent.context_shrunk:schema:properties.effective_context_ref.pattern`; `schema.subagent.context_shrunk:properties.effective_context_ref.pattern\|subagent.context_shrunk:schema:LF:effective_context_ref` | All other 2190 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.type` | `schema.subagent.context_shrunk:properties.occurred_at_utc.type\|subagent.context_shrunk:schema:properties.occurred_at_utc.type` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.maxLength` | `schema.subagent.context_shrunk:properties.occurred_at_utc.maxLength\|subagent.context_shrunk:schema:properties.occurred_at_utc.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.format` | `schema.subagent.context_shrunk:properties.occurred_at_utc.format\|subagent.context_shrunk:schema:properties.occurred_at_utc.format` | All other 2191 IDs | FAIL as required |
| `schema.project.added:type` | `schema.project.added:type\|project.added:schema:type` | All other 2191 IDs | FAIL as required |
| `schema.project.added:additionalProperties` | `schema.project.added:additionalProperties\|project.added:schema:additionalProperties` | All other 2191 IDs | FAIL as required |
| `schema.project.added:required.0` | `schema.project.added:required.0\|project.added:schema:missing_schema_version` | All other 2191 IDs | FAIL as required |
| `schema.project.added:required.1` | `schema.project.added:required.1\|project.added:schema:missing_operation_id` | All other 2191 IDs | FAIL as required |
| `schema.project.added:required.2` | `schema.project.added:required.2\|project.added:schema:missing_project_id` | All other 2191 IDs | FAIL as required |
| `schema.project.added:required.3` | `schema.project.added:required.3\|project.added:schema:missing_project_revision` | All other 2191 IDs | FAIL as required |
| `schema.project.added:required.4` | `schema.project.added:required.4\|project.added:schema:missing_stable_config_ref` | All other 2191 IDs | FAIL as required |
| `schema.project.added:required.5` | `schema.project.added:required.5\|project.added:schema:missing_registration_kind` | All other 2191 IDs | FAIL as required |
| `schema.project.added:required.6` | `schema.project.added:required.6\|project.added:schema:missing_operation_receipt_ref` | All other 2191 IDs | FAIL as required |
| `schema.project.added:required.7` | `schema.project.added:required.7\|project.added:schema:missing_completed_at_utc` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.schema_version.const` | `schema.project.added:properties.schema_version.const\|project.added:schema:properties.schema_version.const` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.operation_id.type` | `schema.project.added:properties.operation_id.type\|project.added:schema:properties.operation_id.type` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.operation_id.minLength` | `schema.project.added:properties.operation_id.minLength\|project.added:schema:properties.operation_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.operation_id.maxLength` | `schema.project.added:properties.operation_id.maxLength\|project.added:schema:properties.operation_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.project_id.type` | `schema.project.added:properties.project_id.type\|project.added:schema:properties.project_id.type` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.project_id.minLength` | `schema.project.added:properties.project_id.minLength\|project.added:schema:properties.project_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.project_id.maxLength` | `schema.project.added:properties.project_id.maxLength\|project.added:schema:properties.project_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.project_revision.type` | `schema.project.added:properties.project_revision.type\|project.added:schema:properties.project_revision.type` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.project_revision.minimum` | `schema.project.added:properties.project_revision.minimum\|project.added:schema:properties.project_revision.minimum` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.project_revision.maximum` | `schema.project.added:properties.project_revision.maximum\|project.added:schema:properties.project_revision.maximum` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.type` | `schema.project.added:properties.stable_config_ref.type\|project.added:schema:properties.stable_config_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.maxLength` | `schema.project.added:properties.stable_config_ref.maxLength\|project.added:schema:properties.stable_config_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.pattern` | `schema.project.added:properties.stable_config_ref.pattern\|project.added:schema:properties.stable_config_ref.pattern`; `schema.project.added:properties.stable_config_ref.pattern\|project.added:schema:LF:stable_config_ref` | All other 2190 IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.type` | `schema.project.added:properties.registration_kind.type\|project.added:schema:properties.registration_kind.type` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.minLength` | `schema.project.added:properties.registration_kind.minLength\|project.added:schema:properties.registration_kind.minLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.maxLength` | `schema.project.added:properties.registration_kind.maxLength\|project.added:schema:properties.registration_kind.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.type` | `schema.project.added:properties.operation_receipt_ref.type\|project.added:schema:properties.operation_receipt_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.maxLength` | `schema.project.added:properties.operation_receipt_ref.maxLength\|project.added:schema:properties.operation_receipt_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.pattern` | `schema.project.added:properties.operation_receipt_ref.pattern\|project.added:schema:properties.operation_receipt_ref.pattern`; `schema.project.added:properties.operation_receipt_ref.pattern\|project.added:schema:LF:operation_receipt_ref` | All other 2190 IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.type` | `schema.project.added:properties.completed_at_utc.type\|project.added:schema:properties.completed_at_utc.type` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.maxLength` | `schema.project.added:properties.completed_at_utc.maxLength\|project.added:schema:properties.completed_at_utc.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.format` | `schema.project.added:properties.completed_at_utc.format\|project.added:schema:properties.completed_at_utc.format` | All other 2191 IDs | FAIL as required |
| `schema.project.created:type` | `schema.project.created:type\|project.created:schema:type` | All other 2191 IDs | FAIL as required |
| `schema.project.created:additionalProperties` | `schema.project.created:additionalProperties\|project.created:schema:additionalProperties` | All other 2191 IDs | FAIL as required |
| `schema.project.created:required.0` | `schema.project.created:required.0\|project.created:schema:missing_schema_version` | All other 2191 IDs | FAIL as required |
| `schema.project.created:required.1` | `schema.project.created:required.1\|project.created:schema:missing_operation_id` | All other 2191 IDs | FAIL as required |
| `schema.project.created:required.2` | `schema.project.created:required.2\|project.created:schema:missing_project_id` | All other 2191 IDs | FAIL as required |
| `schema.project.created:required.3` | `schema.project.created:required.3\|project.created:schema:missing_project_revision` | All other 2191 IDs | FAIL as required |
| `schema.project.created:required.4` | `schema.project.created:required.4\|project.created:schema:missing_stable_config_ref` | All other 2191 IDs | FAIL as required |
| `schema.project.created:required.5` | `schema.project.created:required.5\|project.created:schema:missing_creation_result_ref` | All other 2191 IDs | FAIL as required |
| `schema.project.created:required.6` | `schema.project.created:required.6\|project.created:schema:missing_operation_receipt_ref` | All other 2191 IDs | FAIL as required |
| `schema.project.created:required.7` | `schema.project.created:required.7\|project.created:schema:missing_completed_at_utc` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.schema_version.const` | `schema.project.created:properties.schema_version.const\|project.created:schema:properties.schema_version.const` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.operation_id.type` | `schema.project.created:properties.operation_id.type\|project.created:schema:properties.operation_id.type` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.operation_id.minLength` | `schema.project.created:properties.operation_id.minLength\|project.created:schema:properties.operation_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.operation_id.maxLength` | `schema.project.created:properties.operation_id.maxLength\|project.created:schema:properties.operation_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.project_id.type` | `schema.project.created:properties.project_id.type\|project.created:schema:properties.project_id.type` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.project_id.minLength` | `schema.project.created:properties.project_id.minLength\|project.created:schema:properties.project_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.project_id.maxLength` | `schema.project.created:properties.project_id.maxLength\|project.created:schema:properties.project_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.project_revision.type` | `schema.project.created:properties.project_revision.type\|project.created:schema:properties.project_revision.type` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.project_revision.minimum` | `schema.project.created:properties.project_revision.minimum\|project.created:schema:properties.project_revision.minimum` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.project_revision.maximum` | `schema.project.created:properties.project_revision.maximum\|project.created:schema:properties.project_revision.maximum` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.type` | `schema.project.created:properties.stable_config_ref.type\|project.created:schema:properties.stable_config_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.maxLength` | `schema.project.created:properties.stable_config_ref.maxLength\|project.created:schema:properties.stable_config_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.pattern` | `schema.project.created:properties.stable_config_ref.pattern\|project.created:schema:properties.stable_config_ref.pattern`; `schema.project.created:properties.stable_config_ref.pattern\|project.created:schema:LF:stable_config_ref` | All other 2190 IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.type` | `schema.project.created:properties.creation_result_ref.type\|project.created:schema:properties.creation_result_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.maxLength` | `schema.project.created:properties.creation_result_ref.maxLength\|project.created:schema:properties.creation_result_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.pattern` | `schema.project.created:properties.creation_result_ref.pattern\|project.created:schema:properties.creation_result_ref.pattern`; `schema.project.created:properties.creation_result_ref.pattern\|project.created:schema:LF:creation_result_ref` | All other 2190 IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.type` | `schema.project.created:properties.operation_receipt_ref.type\|project.created:schema:properties.operation_receipt_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.maxLength` | `schema.project.created:properties.operation_receipt_ref.maxLength\|project.created:schema:properties.operation_receipt_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.pattern` | `schema.project.created:properties.operation_receipt_ref.pattern\|project.created:schema:properties.operation_receipt_ref.pattern`; `schema.project.created:properties.operation_receipt_ref.pattern\|project.created:schema:LF:operation_receipt_ref` | All other 2190 IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.type` | `schema.project.created:properties.completed_at_utc.type\|project.created:schema:properties.completed_at_utc.type` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.maxLength` | `schema.project.created:properties.completed_at_utc.maxLength\|project.created:schema:properties.completed_at_utc.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.format` | `schema.project.created:properties.completed_at_utc.format\|project.created:schema:properties.completed_at_utc.format` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:type` | `schema.git.clone.completed:type\|git.clone.completed:schema:type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:additionalProperties` | `schema.git.clone.completed:additionalProperties\|git.clone.completed:schema:additionalProperties` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.0` | `schema.git.clone.completed:required.0\|git.clone.completed:schema:missing_schema_version` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.1` | `schema.git.clone.completed:required.1\|git.clone.completed:schema:missing_operation_id` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.2` | `schema.git.clone.completed:required.2\|git.clone.completed:schema:missing_project_id` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.3` | `schema.git.clone.completed:required.3\|git.clone.completed:schema:missing_repo_id` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.4` | `schema.git.clone.completed:required.4\|git.clone.completed:schema:missing_workspace_id` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.5` | `schema.git.clone.completed:required.5\|git.clone.completed:schema:missing_host_id` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.6` | `schema.git.clone.completed:required.6\|git.clone.completed:schema:missing_environment_id` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.7` | `schema.git.clone.completed:required.7\|git.clone.completed:schema:missing_source_location_ref` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.8` | `schema.git.clone.completed:required.8\|git.clone.completed:schema:missing_operation_receipt_ref` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:required.9` | `schema.git.clone.completed:required.9\|git.clone.completed:schema:missing_completed_at_utc` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.schema_version.const` | `schema.git.clone.completed:properties.schema_version.const\|git.clone.completed:schema:properties.schema_version.const` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.type` | `schema.git.clone.completed:properties.operation_id.type\|git.clone.completed:schema:properties.operation_id.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.minLength` | `schema.git.clone.completed:properties.operation_id.minLength\|git.clone.completed:schema:properties.operation_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.maxLength` | `schema.git.clone.completed:properties.operation_id.maxLength\|git.clone.completed:schema:properties.operation_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.type` | `schema.git.clone.completed:properties.project_id.type\|git.clone.completed:schema:properties.project_id.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.minLength` | `schema.git.clone.completed:properties.project_id.minLength\|git.clone.completed:schema:properties.project_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.maxLength` | `schema.git.clone.completed:properties.project_id.maxLength\|git.clone.completed:schema:properties.project_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.type` | `schema.git.clone.completed:properties.repo_id.type\|git.clone.completed:schema:properties.repo_id.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.minLength` | `schema.git.clone.completed:properties.repo_id.minLength\|git.clone.completed:schema:properties.repo_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.maxLength` | `schema.git.clone.completed:properties.repo_id.maxLength\|git.clone.completed:schema:properties.repo_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.type` | `schema.git.clone.completed:properties.workspace_id.type\|git.clone.completed:schema:properties.workspace_id.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.minLength` | `schema.git.clone.completed:properties.workspace_id.minLength\|git.clone.completed:schema:properties.workspace_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.maxLength` | `schema.git.clone.completed:properties.workspace_id.maxLength\|git.clone.completed:schema:properties.workspace_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.type` | `schema.git.clone.completed:properties.host_id.type\|git.clone.completed:schema:properties.host_id.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.minLength` | `schema.git.clone.completed:properties.host_id.minLength\|git.clone.completed:schema:properties.host_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.maxLength` | `schema.git.clone.completed:properties.host_id.maxLength\|git.clone.completed:schema:properties.host_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.type` | `schema.git.clone.completed:properties.environment_id.type\|git.clone.completed:schema:properties.environment_id.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.minLength` | `schema.git.clone.completed:properties.environment_id.minLength\|git.clone.completed:schema:properties.environment_id.minLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.maxLength` | `schema.git.clone.completed:properties.environment_id.maxLength\|git.clone.completed:schema:properties.environment_id.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.type` | `schema.git.clone.completed:properties.source_location_ref.type\|git.clone.completed:schema:properties.source_location_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.maxLength` | `schema.git.clone.completed:properties.source_location_ref.maxLength\|git.clone.completed:schema:properties.source_location_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.pattern` | `schema.git.clone.completed:properties.source_location_ref.pattern\|git.clone.completed:schema:properties.source_location_ref.pattern`; `schema.git.clone.completed:properties.source_location_ref.pattern\|git.clone.completed:schema:LF:source_location_ref` | All other 2190 IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.type` | `schema.git.clone.completed:properties.operation_receipt_ref.type\|git.clone.completed:schema:properties.operation_receipt_ref.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.maxLength` | `schema.git.clone.completed:properties.operation_receipt_ref.maxLength\|git.clone.completed:schema:properties.operation_receipt_ref.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.pattern` | `schema.git.clone.completed:properties.operation_receipt_ref.pattern\|git.clone.completed:schema:properties.operation_receipt_ref.pattern`; `schema.git.clone.completed:properties.operation_receipt_ref.pattern\|git.clone.completed:schema:LF:operation_receipt_ref` | All other 2190 IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.type` | `schema.git.clone.completed:properties.completed_at_utc.type\|git.clone.completed:schema:properties.completed_at_utc.type` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.maxLength` | `schema.git.clone.completed:properties.completed_at_utc.maxLength\|git.clone.completed:schema:properties.completed_at_utc.maxLength` | All other 2191 IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.format` | `schema.git.clone.completed:properties.completed_at_utc.format\|git.clone.completed:schema:properties.completed_at_utc.format` | All other 2191 IDs | FAIL as required |
| `settings.retired_names` | `settings.retired_names\|settings:retired_name_outside_theme` | All other 2191 IDs | FAIL as required |
| `settings.theme_successor` | 8 IDs in `DM-guard-removal.json` | All other 2184 IDs | FAIL as required |
| `settings.dry_unwired` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `settings.dry_disabled_reason` | `settings.dry_disabled_reason\|settings:disabled_reason` | All other 2191 IDs | FAIL as required |
| `settings.dry_migration` | 5 IDs in `DM-guard-removal.json` | All other 2187 IDs | FAIL as required |
| `settings.dry_no_dispatch` | `settings.dry_no_dispatch\|settings:premature_dispatch` | All other 2191 IDs | FAIL as required |
| `settings.dry_exclusion` | 4 IDs in `DM-guard-removal.json` | All other 2188 IDs | FAIL as required |
| `datetime.timezone` | `datetime.timezone\|datetime:timezone` | All other 2191 IDs | FAIL as required |
| `datetime.parse` | 9 IDs in `DM-guard-removal.json` | All other 2183 IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:project_id.anyOf` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:project_id.null_branch_type` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_status_refs.items` | 4 IDs in `DM-guard-removal.json` | All other 2188 IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_id.anyOf` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_id.null_branch_type` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:account_id.anyOf` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:account_id.null_branch_type` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:project_id.anyOf` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:project_id.null_branch_type` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:source_refs.items` | 4 IDs in `DM-guard-removal.json` | All other 2188 IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:project_id.anyOf` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:project_id.null_branch_type` | 3 IDs in `DM-guard-removal.json` | All other 2189 IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:source_refs.items` | 4 IDs in `DM-guard-removal.json` | All other 2188 IDs | FAIL as required |

## What Astra keeps finding — items 1 to 10

`fix5/context-probes.py` authors 212 independent observations; each context family is exercised separately. It also checks all 56 ordered authentic foreign-family retry pairs. Prior independent regressions and the complete guard matrix supply the full unchanged-family suites.

| Class | Own probe and result |
|---|---|
| **1. Forged / contradictory facts** | Independently forge event ID, key, actor, scope, Project, parent run, semantic digest or partition; retry refuses. Contradictory selected-source recovery facts refuse operating read/rebuild. |
| **2. Payload Storage metadata** | Change sequence/observed/persisted independently: retry returns Storage's original result/receipt; both operating paths reject forged retained values against protected original authority. |
| **3. Historical readers** | Ordinary, replay-only and supported compatibility history reads/rebuilds after old request removal and live owner retirement. Withdrawal, permission, deletion/hold/source gates and every authentic foreign-family retained original still refuse. |
| **4. Representations** | Integer, uppercase, leading-space and trailing-LF spellings at both digest positions refuse. Prior exact UTF-8 Server/key normalization tests pass. |
| **5. Unvisited refs** | Inject unused dangling local pointer, anchor and external refs in each context schema; eager resolution refuses all six. |
| **6. Whole stored sizes** | Measure logical pack body, inline map, descriptor string and full stored event independently; both context bodies are 16,385 bytes external, with each inline stored part below 16 KiB. Corrupt each descriptor member; all refuse. Existing legal large/boundary suites pass. No new operation journal or contradictory null-ref prose is introduced. |
| **7. Custody on every path** | Genuine other-family event/authority, event-only and authority-only retry cases refuse both ways. Missing protected originals, arbitrary full commitments, contradictory source selections and authentic foreign history refuse read/rebuild. All 56 foreign retry pairs refuse; baseline had exactly two successes. |
| **8. Masked negatives** | Whole-lane 445-row proof verifies exact flip/complement sets; the three new rows separately prove each fence and their named duplicate pair. No mutation errors. |
| **9. Grade overclaims** | Use cycle-5 reviewed grades as before: only the two context oracle cells were PARTIAL. Their exact missing boundary now has positive/refusal and full-checker mutation evidence, restoring PASS. Six prepared siblings and both retired Settings grades are carried. Membership/retention/native limitations remain explicit. |
| **10. Numeric aliases** | Parse literal `1.0`, `1e0`, `-0`, `01` independently per context. Float/exponent forms are refused by the supported integer-only canonical MessagePack codec and cannot authorize an incoming retry; `01` is invalid JSON. Parsed `-0` becomes integer 0 with the same canonical bytes, identity and producer digest as 0. No second accepted spelling creates a second identity or digest. |

## Family grades before and after

Before is the cycle-5 review at `9439444c222a8d63bfe44ad37397f1498a7ac9e4`. Membership stays ABSENT. Six permitted retention cells stay PARTIAL. Settings remains excluded without current-writer credit.

| Family | Reviewed before | After |
|---|---|---|
| `format.applied` | 10 PASS / 1 PARTIAL / 1 ABSENT | unchanged |
| `git.clone.completed` | 10 PASS / 1 PARTIAL / 1 ABSENT | unchanged |
| `lsp.server.lifecycle_changed` | 10 PASS / 1 PARTIAL / 1 ABSENT | unchanged |
| `model.catalog_refreshed` | 10 PASS / 1 PARTIAL / 1 ABSENT | unchanged |
| `project.added` | 10 PASS / 1 PARTIAL / 1 ABSENT | unchanged |
| `project.created` | 10 PASS / 1 PARTIAL / 1 ABSENT | unchanged |
| `settings.theme.updated` | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE | unchanged |
| `settings.updated` | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE | unchanged |
| `subagent.context_rehydrated` | 10 PASS / 1 PARTIAL / 1 ABSENT; oracle PARTIAL | 11 PASS / 1 ABSENT; oracle PASS |
| `subagent.context_shrunk` | 10 PASS / 1 PARTIAL / 1 ABSENT; oracle PARTIAL | 11 PASS / 1 ABSENT; oracle PASS |

Totals: **84 PASS / 8 PARTIAL / 10 ABSENT / 18 NOT_APPLICABLE → 86 PASS / 6 PARTIAL / 10 ABSENT / 18 NOT_APPLICABLE**. Prepared verdicts: **6/8 → 8/8**. Native execution: **NOT_RUN**.

## Verification, scope and integration

The fix changes only two checker files and the two context fixture rows. Current owner prose already specifies the exact family/scope/original identity; it remains unchanged. All original family fixtures are otherwise identical. No new schema, stored value, consumer, checkpoint, event identity, admission or PlanUnit is minted. An AST audit verifies every original subject function except the strengthened `current_retry` and added `main` assertions is unchanged, and every original retry statement remains.

The **111-check Settings audit** passes, including 13 original application authority/current-owner quotes, frozen fields, row/ledger mirrors and original whole-file/complete-line hashes. All Settings application files, companions, source prose and forty retirement fixtures are byte-identical to the requested input; the complete SP-348 unit remains exact. DL-408's original revision and hashes are not restamped. Its decision-branch integration dependency remains `b6332f391a7870bad5f01a29a7e9d080050dac27`.

| Check | Result |
|---|---|
| Full lane checker | Exit 0; 9,735 assertions; all eight family suites |
| Whole-lane check 11 | Exit 0; 445/445 mutants caught; 2,192 independent negatives |
| Earlier independent regressions | Exit 0; 1,111/1,111 |
| Own ten-class probes | Exit 0; 212 observations; all 56 foreign pairs refuse |
| Failure exits | Eight exit-1 children; eight success-exit refusals |
| DL-408 application audit | Exit 0; 111 checks; unchanged application |
| Citations / historical captures / scope | Exit 0; 783 checks; 260 current quotes/hashes; 22 historical captures |
| Shard check | Exit 0; parsed top-level pass; 99 sources / 3,092 shards |
| Index validation | Exit 0 after hash-matching 15 ignored currentness inputs; parsed top-level pass; readiness blocked |
| Settings layering / DRY tests | Exit 0 / exit 0; ten tests |
| Storage recovery | Exit 0; parsed pass |
| Storage profile | Exit 1; unchanged 41-error baseline; byte-identical output |
| Whitespace | Round-5 diff passes; inherited branch CRLF qualification retained |

`DM-checks.json` records command exits and retained evidence SHA-256s. The first index validation ran without the ignored currentness edition and reported readiness drift; copying/hash-matching the required inputs restored pass without changing tracked files. No Markdown owner edit or regeneration occurs in round 5. Prior index clock/CRLF qualifications remain historical, not fresh byte-identity claims.

Entry resources: **87 GB free root disk / 18 GiB available RAM**; later checked **87 GB / 13 GiB**, above stop limits. Worktree is sparse (`Plans scripts reports tests`). No subagent, mail registration/send/reply, landing, registry append, admission, Decision Log entry, Spec Lock, governed evidence or reseal is performed. One initial inbox read preceded the no-mail brief; no later mailbox action occurred. No browser/server is started. Only requested external evidence under `fix5/` is retained; generated Python caches and the pushed worktree are removed at completion. The report and self-grade are copied to the drafts directory; `fix5/evidence-manifest.json` supplies final retained evidence paths and SHA-256s.

**IDs used:** none new. Existing **PP-151/152, CV-623/624, SP-603/604** identify the two affected families; remaining existing lane units **FS-075, LSPS-173, MS-199, PJCT-072/073, SCS-085, CV-620–627, SP-600–607, ATS-300–304** are preserved. Reused authority: **DL-045, DL-076, DL-408, CV-366, SP-278, SP-286/CV-339 and SP-337**.
