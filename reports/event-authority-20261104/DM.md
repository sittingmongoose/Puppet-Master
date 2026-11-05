# DM — review round 6

Branch: `plans/ea-w2-small-owners-20261104`. Reviewed input: `bac541604c77d9d8f4855b32d7077f2091edd033`. Numeric repair commit: `9468819e83943712135145fc7814e419d519d4a8`. The reporting commit follows it. Worktree: `/home/sittingmongoose/pm-worktrees/DM-fix6`. Native execution: **NOT_RUN**.

**C6-B1 fixed. Prepared families: 0/8 → 8/8 PASS AS PREPARED.** All eight oracle cells move PARTIAL → PASS. Membership remains absent, six retention cells remain pending RT, and both Settings names remain excluded without writer credit. The full checker passes **14,519 assertions**; whole-lane check 11 passes **454/454 guard rows over 3,508 independent negatives**, with zero mutation errors. All original 445 guards retain exactly their old flip sets over the original 2,192 witnesses.

## Review round 6: findings and responses

- **C6-B1 — fixed (`9468819e83943712135145fc7814e419d519d4a8`). Where:** `scripts/pm-small-owner-events.py` (`integer_type`, `canonical_json_numbers`, `current_producer_numbers`, `retained_producer_digest`, schema/model boundaries and `run_numeric_family`); `scripts/pm-small-owner-guard-audit.py` (`numeric_catalogue` and callback dependency fingerprints); each family's own `numeric_representation_cases` in `Plans/small_owner_event_fixtures.json`. **Why:** the mathematical JSON Schema integer test accepts Python integral floats; ordinary JSON encoding gave `1.0` different bytes from `1`, while Python equality accepted their original-operation join. **How:** current schema/model validation accepts actual integer types, the current wire decoder rejects decimal/exponent tokens and literal negative zero, and the semantic encoder gives supported equal integer aliases identical bytes. Complete-value MessagePack retains its integer-only domain. All 40 exact reviewed accepted splits reproduce at the input head and now refuse writer/retry/lost-ack publication with unchanged inputs. Safe aliases also have one producer digest. **Verify:** full checker, `numeric-probes.json`, `numeric-sweep.json`, and the complete guard table below.
- **N1 — carried integration qualification (reporting commit).** No owner Markdown or schema changes require regeneration in this round; the previous four index-clock exceptions and original CRLF application bytes remain qualified. Storage profile output remains the exact 41-error baseline, SHA-256 `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b`. DL-408 decision-branch integration, six RT retention choices, later admission and governance remain integration work. The 22 historical capture labels/hashes/quotes and all source search records are byte-identical to the reviewed input.

## Numeric boundaries and retained history

The shared DM instance validator uses the same exact integer callback for payload, envelope, custody and checkpoint schemas. Standard JSON Schema defines mathematical integers, so the representation fence belongs to this instance adapter and current input admission; no shared schema domain is rewritten. The model rejects every Python float regardless of magnitude, including integral values the base schema validator accepts. The independent sweep exercises **1,027** integral-float samples per family, covering every nonnegative finite binary exponent plus boundary mantissas, and checks full incoming JSON records for `1.0`, `1e0`, `-0`, leading zeros and the other declared spellings.

The current static producer encoder supports the exact RFC 8785 integer subset through `2**53-1` and refuses larger current producer-semantic numbers instead of approximating them. Field-specific schema minima/maxima still apply. Storage-owned u64 metadata stays outside producer semantics. Retained records select their original integer digest recipe, preserving protected original bytes and hashes; `0`, `1`, `2**53-1`, `2**53+1` and `2**64-1` upstream-sequence history all read/rebuild with their original receipt. The new append-encoder bound never reaches historical reads or original-receipt retry resolution; large retained integer retries return their original receipt. Historical number checks inspect the retained event, protected authority and selected tokens, and ignore unrelated live-owner state, obsolete requests and the opaque old derived publication. Positives include floats in those unrelated values. An already-decoded historical `-0` is integer zero and has exactly zero's bytes and digest. A historical float was never a valid member of this lane's integer-only full-value codec domain.

The sweep covers payload diff sizes/catalog/Project/context revisions; envelope upstream and Storage sequences; receipt/result sequences, offsets and generations; admission epochs; checkpoint frontier revisions; selected source segment/manifest generations and recovery epochs; and external SP-337 descriptor byte size and logical body integers. Numeric substitutions for string identity components refuse. Direct codec failures become structured refusals on writer/reader paths. External payload floats and full-value aliases require the named schema/MessagePack duplicate set in the guard proof.

## Earlier behavior and all eleven standing checks

All original fixture facts are unchanged after removing only each row's new numeric cases. Every positive EventRecord, original operation, receipt authority, context foreign-family vector and Settings retirement vector is exact. All owner prose, payload/shared schemas, search lineage, Settings application files, registry, admissions and governance files are unchanged. **1,111/1,111** prior independent observations and **521/521** focused observations are exactly equal to cycle 6; all **21** independent narrow syntax mutants still fail the complete checker. The independent eight-child failure audit requires exit 1 and refuses success exit 0.

1. **Current policy:** every append/retry replay-only refusal remains exact; historical replay-only originals remain readable.
2. **CV-366:** exact Server/original-operation UTF-8 keys and Project-only alternatives are preserved.
3. **Project partition:** encoded `project~` positives and raw-ID refusals are unchanged.
4. **Sizes:** all prior 16 KiB/SP-337 and stored-part measurements are exactly unchanged; descriptor numeric aliases add coverage.
5. **Grammar:** LF/full-match negatives and 21 narrower guard removals retain their results.
6. **Producer semantics:** Storage sequence/observed/persisted metadata remains excluded. Semantic retries return Storage's original result/receipt; complete-value reads still authenticate those metadata bytes.
7. **Checkpoints:** original Storage/source/key/generation/frontier/selected-token joins remain, with numeric representation fences added.
8. **Failure oracles:** eight exit-1 children, eight explicit success-exit refusals; infrastructure exits cannot count as refusal.
9. **References:** all refs resolve eagerly; all previous unused-pointer/anchor/external-ref probes retain their results.
10. **History:** ordinary, supported compatibility and replay-only history survives changed live state and removed old requests. Current withdrawal/source/disclosure fences remain; u64 history adds coverage.
11. **Isolation:** the whole 454-row matrix runs one guard or named duplicate set at a time. Every expected negative flips, every complement stays rejected, every mutant fails the complete checker, and there are zero mutation errors.

## What Astra keeps finding — items 1 to 10

| Class | Own probe and outcome |
|---|---|
| **1. Forged / contradictory facts** | Earlier independent ID/key/actor/digest/source-join refusals are exactly unchanged; original facts and commitments remain recomputed. |
| **2. Storage metadata** | Separate sequence/observed/persisted changes retain semantic replay's original metadata and fail complete-value reads. Numeric source/receipt state leaves add strict representation coverage. |
| **3. Historical readers** | Ordinary/compatibility/replay-only reads and rebuilds retain their results; original large integer history also succeeds without current writer admission. |
| **4. One field read two ways** | Exact digest/string/Server grammar probes retain their results. Schema, writer, checker and codec now share one admitted integer representation. |
| **5. Unvisited references** | Earlier unused dangling pointer, anchor and external refs are rerun and refused. |
| **6. Whole stored size** | All logical/descriptor/inline/full-event byte measurements are unchanged; external descriptor/body numeric probes are added. No stored journal or contradictory owner prose is introduced. |
| **7. Custody on every path** | All 56 genuine foreign retries, 112 single-input retry swaps and 112 operating foreign-family pairs retain refusals. Both context exact-family/schema fences remain exact. |
| **8. Masked negatives** | Complete guard proof includes the new independent numeric witnesses and named schema/MessagePack duplicate set. New alias negatives also belong to their own integer field's schema type rule. |
| **9. Grade overclaims** | Cycle-6 reviewed oracle PARTIAL is the before grade for every prepared family. PASS follows positive/refusal, differential and complete guard evidence; native/admission/retention limitations remain explicit. |
| **10. Numeric aliases** | All 40 reviewed splits are reproduced then repaired; all eight families include raw `1.0`, `-0`, `1e0`, leading-zero and broad integral-float cases. No admitted equal numeric value has two hashes. |

## Family grades before and after

Before is the cycle-6 independent review at `bac541604c77d9d8f4855b32d7077f2091edd033`. Only the eight oracle cells improve. Membership and pending retention remain intentional preparation exceptions.

| Family | Reviewed before | After |
|---|---|---|
| `format.applied` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `git.clone.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `lsp.server.lifecycle_changed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `model.catalog_refreshed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `project.added` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `project.created` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `subagent.context_rehydrated` | 10 PASS / 1 PARTIAL / 1 ABSENT | 11 PASS / 1 ABSENT |
| `subagent.context_shrunk` | 10 PASS / 1 PARTIAL / 1 ABSENT | 11 PASS / 1 ABSENT |
| `settings.updated` | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE | unchanged; excluded |
| `settings.theme.updated` | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE | unchanged; excluded |

Totals: **78 PASS / 14 PARTIAL / 10 ABSENT / 18 NOT_APPLICABLE → 86 PASS / 6 PARTIAL / 10 ABSENT / 18 NOT_APPLICABLE**. Native execution: **NOT_RUN**.

## Verification and integration

The Settings audit passes all **111** checks, including its **13** authority/current-owner quotes. Both exact row/ledger mirrors, both census lines, frozen fields, original before/after file and complete-line hashes, current theme/DRY companions and all forty retirement cases remain exact. The sole successor remains `settings.layer.changed` under existing owner-adoption gates. The dedicated DRY history remains read-only and its control remains disabled with `owner_contract_missing`. DL-408's original capture hashes/revision are not restamped. Its decision integration dependency remains `b6332f391a7870bad5f01a29a7e9d080050dac27`.

The source/scope audit passes **816** checks with **292** current quote/hash citations, including own-unit anchors. All old source facts, schema bodies, registry and governance paths are unchanged. No new PlanUnit, operating reader, stored value, checkpoint, event identity, admission or binding is minted. No owner Markdown edit occurs, so there is no regeneration in round 6. Fifteen ignored currentness files were copied and SHA-256 matched before index validation; shard and index top-level statuses are `pass`. Settings layering, ten DRY tests and Storage recovery pass. Storage profile retains its exact pre-existing output.

`DM-checks.json` records command exits and external evidence paths/hashes. `fix6/evidence-manifest.json` supplies the retained scripts, reports and results. Initial guard pilots exposed a codec exception that needed structured refusal, callback dependency caching, a date-parser mutation that also matched the numeric error handler, large-float tests needing schema-only baselines, and new aliases missing from their own type rule's flip set; those were repaired before the final clean whole-lane rerun. No production guard was disabled or weakened to pass it.

Entry resources: **102 GB free root disk / 9 GiB available RAM**; later resource checks stayed above the disk/RAM stop limits. The worktree is sparse (`Plans scripts reports tests`). No subagent, mail registration/send/reply, landing, registry append, admission, Decision Log entry, Spec Lock, governed evidence or reseal is performed. Initial inbox/who reads preceded interpretation of the no-mail brief; no registration, sends, replies or later mailbox action occurred. No browser/server is started. Superseded pilot outputs and Python caches are removed; the pushed worktree is removed at completion. Report and self-grade copies are retained in the drafts directory.

**IDs used:** none new. Existing affected units: **FS-075, LSPS-173, MS-199, PP-151/152, PJCT-072/073, SCS-085, CV-620–627, SP-600–607, ATS-300–304**. Reused authority: **DL-045, DL-076, DL-408, CV-366, SP-278, SP-286/CV-339**.

## Whole-lane guard-removal table

Each row records one actual guard or named duplicate set removed in memory. The exact flipped IDs are in `DM-guard-removal.json`; the still-rejected set is exactly `all_probe_ids` minus that row's flips. The external raw table includes every complement ID, source/schema edit and full-checker failure. All 445 old flip sets over the old 2,192 witnesses are identical; five mutation strings have equivalent validator/helper/local-preimage spellings, and the date-parser mutation is scoped to its own handler. Nine new numeric guard rows are added. Removing a schema integer type also removes its type callback, so its new equal-valued float negative belongs to that same rule.

Raw table: `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/fix6/guard-removal.json`, SHA-256 `d9419f3a64d0437b297dded36108bf037389743b388e2a42de65deddd18aced0`.

| Guard or named duplicate set removed | Negatives that flip | Negatives that stay rejected | Complete checker |
|---|---:|---:|---|
| `envelope.schema` | 273 exact IDs | 3235 complement IDs | FAIL as required |
| `custody.schema` | 168 exact IDs | 3340 complement IDs | FAIL as required |
| `writer.owner` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `writer.result` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `writer.original_joins` | 112 exact IDs | 3396 complement IDs | FAIL as required |
| `writer.payload_project` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `writer.time` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `writer.family_schema` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `writer.profile_policy` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `writer.identity_key` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `writer.migration` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `producer.witness` | 32 exact IDs | 3476 complement IDs | FAIL as required |
| `semantic.project` | 5 exact IDs | 3503 complement IDs | FAIL as required |
| `retry.semantic_conflict` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.replay_policy` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `retry.replay_only` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `retry.current_policy` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `retry.family` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `retry.schema` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `receipt.full_value` | 72 exact IDs | 3436 complement IDs | FAIL as required |
| `receipt.protected_authority` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `receipt.custody_identity` | 48 exact IDs | 3460 complement IDs | FAIL as required |
| `receipt.incoming_semantics` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `receipt.append_result` | 32 exact IDs | 3476 complement IDs | FAIL as required |
| `receipt.event_join` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `receipt.original_receipt` | 88 exact IDs | 3420 complement IDs | FAIL as required |
| `append.current_event` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.receipt_delivery` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.terminal_delivery` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.membership` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.retention_resolved` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.schema_admitted` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.writer_enabled` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.permission_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.dedupe_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.source_custody_available` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.original_intent_available` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.original_result_available` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.owner_acceptance_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.body_committed` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.lease_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.restore_controls_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.same_restore_occurrence` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.protected_origin_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `append.epoch` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `append.session_restore` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `append.durability` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `append.receipt_delivery_identity` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `reader.token_identity` | 32 exact IDs | 3476 complement IDs | FAIL as required |
| `reader.retained_value` | 24 exact IDs | 3484 complement IDs | FAIL as required |
| `reader.reader_enabled` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `reader.permission_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `reader.source_present` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `reader.deletion_clear` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `reader.hold_allows_disclosure` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `reader.current_frontier_verified` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `reader.version` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `reader.selected_token` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.checkpoint` | 232 exact IDs | 3276 complement IDs | FAIL as required |
| `rebuild.retained_value` | 24 exact IDs | 3484 complement IDs | FAIL as required |
| `rebuild.originals_present` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.source_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.coverage_complete` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.schema_supported` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.current_frontier_verified` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.cas_matches` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.reader_enabled` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.permission_current` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.source_present` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.deletion_clear` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.hold_allows_disclosure` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `rebuild.version` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `checkpoint.outer_revision` | 16 exact IDs | 3492 complement IDs | FAIL as required |
| `checkpoint.selected_token` | 24 exact IDs | 3484 complement IDs | FAIL as required |
| `token.storage_instance_id` | 24 exact IDs | 3484 complement IDs | FAIL as required |
| `token.source_storage` | 24 exact IDs | 3484 complement IDs | FAIL as required |
| `token.checkpoint_key` | 24 exact IDs | 3484 complement IDs | FAIL as required |
| `token.dataset_generation` | 24 exact IDs | 3484 complement IDs | FAIL as required |
| `history.family` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `history.schema` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `history.source_selection` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `token.generation_dataset_grammar` | 48 exact IDs | 3460 complement IDs | FAIL as required |
| `token.other_string_grammar` | 168 exact IDs | 3340 complement IDs | FAIL as required |
| `token.durable_snapshot` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `token.schema` | 144 exact IDs | 3364 complement IDs | FAIL as required |
| `payload.inline_cap` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `payload.schema` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `read_helper.token` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `read_helper.permission` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `read_helper.source` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `read_helper.withdrawal` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `read_helper.version` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `schema.references` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `schema.meta` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `schema.format.applied:type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:additionalProperties` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.0` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.1` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.2` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.3` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.4` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.5` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.6` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.7` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:required.8` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.schema_version.const` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.project_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.project_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.project_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.file_path.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.file_path.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.file_path.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.type` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.minimum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.maximum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.format` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `semantic.edge` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:additionalProperties` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.0` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.1` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.2` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.3` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.4` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.5` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.6` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.7` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.8` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.9` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.10` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.schema_version.const` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.previous_state.enum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state.enum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.format` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `writer.server_identity` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `payload.external_pack_synced` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `payload.external_index_synced` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `payload.external_source_present` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `payload.external_permission_current` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `payload.external_deletion_clear` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `payload.external_hold_allows_disclosure` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `payload.external_exclusivity` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `payload.external_descriptor` | 6 exact IDs | 3502 complement IDs | FAIL as required |
| `payload.external_ref` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:additionalProperties` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.0` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.1` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.2` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.3` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.4` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.5` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.6` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.7` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.8` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.schema_version.const` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.type` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.minimum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.maximum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.maxItems` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.uniqueItems` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.format` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `writer.child_run` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `semantic.revision` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `retry.family_schema_duplicate` | 18 exact IDs | 3490 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:additionalProperties` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.0` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.1` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.2` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.3` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.4` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.5` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.6` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.7` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.8` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.9` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.10` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.schema_version.const` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.type` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.minimum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.maximum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.type` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.minimum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.maximum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.minItems` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.maxItems` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.uniqueItems` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.format` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:additionalProperties` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.0` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.1` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.2` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.3` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.4` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.5` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.6` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.7` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.8` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.9` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.10` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.schema_version.const` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.type` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.minimum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.maximum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.type` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.minimum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.maximum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.minItems` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.maxItems` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.uniqueItems` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.format` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:additionalProperties` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:required.0` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:required.1` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:required.2` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:required.3` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:required.4` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:required.5` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:required.6` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:required.7` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.schema_version.const` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.project_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.project_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.project_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.project_revision.type` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.project.added:properties.project_revision.minimum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.project_revision.maximum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.format` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:additionalProperties` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:required.0` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:required.1` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:required.2` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:required.3` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:required.4` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:required.5` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:required.6` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:required.7` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.schema_version.const` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.project_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.project_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.project_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.project_revision.type` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.project.created:properties.project_revision.minimum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.project_revision.maximum` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.format` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:additionalProperties` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.0` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.1` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.2` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.3` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.4` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.5` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.6` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.7` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.8` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.9` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.schema_version.const` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.minLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.pattern` | 2 exact IDs | 3506 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.type` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.maxLength` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.format` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `settings.retired_names` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `settings.theme_successor` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `settings.dry_unwired` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `settings.dry_disabled_reason` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `settings.dry_migration` | 5 exact IDs | 3503 complement IDs | FAIL as required |
| `settings.dry_no_dispatch` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `settings.dry_exclusion` | 4 exact IDs | 3504 complement IDs | FAIL as required |
| `datetime.timezone` | 1 exact IDs | 3507 complement IDs | FAIL as required |
| `datetime.parse` | 9 exact IDs | 3499 complement IDs | FAIL as required |
| `numeric.integer_form` | 1015 exact IDs | 2493 complement IDs | FAIL as required |
| `numeric.msgpack_integer_form` | 48 exact IDs | 3460 complement IDs | FAIL as required |
| `numeric.integer_codec_duplicate` | 1124 exact IDs | 2384 complement IDs | FAIL as required |
| `numeric.jcs_integer_alias` | 48 exact IDs | 3460 complement IDs | FAIL as required |
| `numeric.jcs_nonintegral` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `numeric.current_exact_range` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `numeric.raw_float` | 96 exact IDs | 3412 complement IDs | FAIL as required |
| `numeric.raw_negative_zero` | 8 exact IDs | 3500 complement IDs | FAIL as required |
| `numeric.json_single_value` | 24 exact IDs | 3484 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:project_id.anyOf` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:project_id.null_branch_type` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_status_refs.items` | 4 exact IDs | 3504 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_id.anyOf` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_id.null_branch_type` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:account_id.anyOf` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:account_id.null_branch_type` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:project_id.anyOf` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:project_id.null_branch_type` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:source_refs.items` | 4 exact IDs | 3504 complement IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:project_id.anyOf` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:project_id.null_branch_type` | 3 exact IDs | 3505 complement IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:source_refs.items` | 4 exact IDs | 3504 complement IDs | FAIL as required |
