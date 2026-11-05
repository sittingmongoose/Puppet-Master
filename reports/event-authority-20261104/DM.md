# DM — review round 7

Branch: `plans/ea-w2-small-owners-20261104`. Reviewed input: `6c0c65f6a1fdc009f2bfe2ab8ce323c127f761aa`. New fetched/rebased base: **`fb441b27fd75440e14115fb382b15a5258ad7ea3`**. Integration/derived commit: `382c5c4a2f5946dcd875a6b529b00d2f2aaf24b8`. Timestamp/type repair commit: `d5cacd38aa2120e53f877fcf77c71480ce004904`. Audit-driver coverage commit: `aa45d09c450145d5710df426080fd6c110619cf4`. The reporting commit follows. Native execution: **NOT_RUN**.

**B1, I1, S1 and S2 fixed. Eight families pass as prepared; both Settings exclusions remain exact.** The eight oracle cells improve PARTIAL → PASS. Membership remains absent, six retention cells stay pending RT, and no writer is activated. Serial unmodified checkers pass **55,158 assertions**. The complete table passes **458 distinct guards over 23,221 unique negatives**, across **1,296 serial family/guard runs**. Every expected flip set is exact, every complement stays rejected, every mutant fails the complete checker, and there are zero mutation errors.

## Review round 7: findings and responses

- **B1 — fixed (`d5cacd38aa2120e53f877fcf77c71480ce004904`). Where:** `scripts/pm-small-owner-events.py:23`; each family's `timestamp_representation_cases` in `Plans/small_owner_event_fixtures.json`; `scripts/pm-small-owner-guard-audit.py:454`. **Why:** Python's broad ISO parser accepted an arbitrary separator, non-Z offset and omitted seconds. This Python version also normalizes `24:00:00`. **Fix:** full-match ASCII `YYYY-MM-DDTHH:MM:SS[.fraction]Z`, explicit 00–23 hour range and calendar/time parsing; no trailing LF/CR, whitespace, basic dates/times, comma or empty fractions, lower-case T/Z, offset or missing seconds. Gregorian/leap-day, month/day, minute/second and year range vectors are explicit. All **32** reviewed successful malformed publications now refuse. Every family has coherent owner/result/Storage copies, valid leap-day/fraction positives, and isolated lexical/calendar/duplicate-set proof. AppendReceipt acknowledgment time also has **32** additional family/guard rows with coherent receipt copies. **Verify:** checker/guard results, `review-reproductions.json` and `receipt-time-probes.json`.
- **I1 — fixed (`382c5c4a2f5946dcd875a6b529b00d2f2aaf24b8`). Where:** rebased branch and regenerated `Plans/_shards/**` / `Plans/.plan_index/**`. **Why:** the old branch predated main's DL-302. **Fix:** fetched origin, rebased all twenty lane commits onto `fb441b27fd75440e14115fb382b15a5258ad7ea3`; source files auto-merged without conflict. Only generated conflicts were deferred for regeneration. Main's Decision Log is byte-identical to that base; DL-302 is in the regenerated index. Main-only blobs are preserved. Copied all fifteen ignored currentness files and matched source/destination with `sha256sum`; ran the exact shard-generate → index-generate → shard-check sequence and normal index validation. Both top-level validation statuses are `pass`, without pinning the validator's baseline or editing legacy ledgers. Generated shard owners belong only to this lane's changed canonical documents. **Verify:** `rebase.log`, `currentness-copy.json`, `derived-scope.json`, `regeneration-checks.json`, `source-scope-audit.json`.
- **S1 — fixed (`d5cacd38aa2120e53f877fcf77c71480ce004904`). Where:** `scripts/pm-small-owner-events.py:462`, `delivery_types_valid`, `resolve_original`, `reader_result`, `rebuild_publication`, `read_allowed` and external payload access. **Why:** truthiness let nonempty strings/containers and integer 1 grant permission. **Fix:** exact Boolean gates require `is True` / `is False`; delivery flags have an explicit Boolean type boundary before their values are used. Wrong-type negatives cover append, retry, read, rebuild, durability, delivery, source/deletion/hold, protected authority and each SP-337 access flag. Strings `"false"`, `"0"`, `"true"`, `"1"`, integers, null, arrays and nested objects refuse. Legitimate Boolean false delivery/outage behavior remains unchanged. **Verify:** all serial family checker/guard runs and independent probes.
- **S2 — fixed (`d5cacd38aa2120e53f877fcf77c71480ce004904`). Where:** `scripts/pm-small-owner-events.py:61`, producer witnesses, epochs and observation joins. **Why:** Python treats Boolean/integer values as equal in mappings and scalar comparisons. **Fix:** recursively check exact field types before values; integers use the same strict callback as schemas. Every original/current admission epoch is an actual integer. Both witness collision directions, formatter exit `False` vs 0, all epoch observations, result/payload/envelope joins, receipt/result fields, selected source/live/durable copies and outer frontier are exercised. Coherently changed owner-session, restore and original Storage identity types are also refused. No type is normalized by truthiness or Python's loose equality. All **65** selected review type bypasses reproduce at the old head and refuse here. **Verify:** `review-reproductions.json`, independent probes and the exact guard flip sets.
- **N1 — qualified (reporting commit).** Regeneration is normal; `coverage_report.json`, `dependencies.json`, `doc_cards.json` and `node_readiness_report.json` retain their generator-owned `generated_at_utc` clock qualification. Preserved audit CRLF bytes use `core.whitespace=cr-at-eol` for the whole-branch whitespace check.
- **N2 — preserved (reporting commit).** DL-408's application record, both exact Settings rows and ledger/census mirrors, captured authority quotes/hashes, theme routes and disabled DRY companion are unchanged. Decision integration still requires `b6332f391a7870bad5f01a29a7e9d080050dac27`; six RT decisions remain prerequisites before admission. No Decision Log entry, registry admission, activation, migration snapshot, governance lock or reseal is added.

## All eleven standing checks

1. **Current policy:** all eight append/retry replay-only refusals remain; `replay_only_not_appendable` is exact. Retained replay-only history still reads/rebuilds.
2. **CV-366 keys:** exact Server/operation UTF-8 hex, including non-ASCII Server, is preserved. Case/normalization/hash-key alternatives refuse.
3. **Project partition:** encoded `project~` positives and raw-Project custody refusals remain.
4. **Stored sizes:** 16,383/16,384 inline and 16,385 external positives; recomputed SP-337 body/BLAKE3/descriptor and stored-part measurements. Bounded owners retain isolated cap probes. No new stored operation journal.
5. **Full-match syntax:** every old identifier/LF case remains. UTC timestamps now have their own full-match grammar and range tests, including receipt acknowledgment.
6. **Semantic retry:** caller semantic fields stay frozen; Storage sequence/observed/persisted changes return only Storage's original result/receipt and fail full-value reads. Incoming Storage fields never become authority.
7. **Checkpoint identity:** Storage/source/key/generation/dataset/frontier and selected/live/durable joins stay exact. Every numeric/Boolean observation is typed before comparison.
8. **Failure exits:** eight intended exit-1 children and eight real exit-0 weakened-validator children; the failure oracle refuses success and never counts infrastructure exit as contract refusal.
9. **Schema references:** eager resolution includes unused definitions and all branches. Independent unused dangling references still fail for every family.
10. **History:** ordinary/compatibility/replay-only originals survive live owner retirement and missing old operation handles. Retained integer history through `2**64-1` keeps its original bytes/digest/receipt. Unrelated live floats and opaque old publications stay outside historical validation. Current reader/source/disclosure/withdrawal and forged/foreign-byte fences remain. Current-writer validation never runs on retained originals.
11. **Isolation:** one family and one guard or named duplicate set at a time; no parallel checker jobs or bypass. Every original **454** guard name and **3,508** negative ID is retained, with exactly the same intersections against the old witness set. New lexical and calendar guards are separate. The existing date parse/timezone rows explicitly remove the named grammar/parser or grammar/timezone duplicates. Every mutated full checker fails. Dependency caching reuses only byte-identical transitive functions; the fixed baseline witness list is reused intact in mutant full-checker calls.

## What Astra keeps finding — items 1 to 11

| Class | Own probe and outcome |
|---|---|
| **1. Forged/contradictory inputs** | ID/key/actor/correlation, source joins, exact digests and coherent checkpoint mutants refuse. Identity/digest/descriptor values are recomputed. Source adapters and independently authenticated Storage observations remain explicitly synthetic; native NOT_RUN. Eight whole-authority replacement explorations are disclosed outside the caller-input verdict. |
| **2. Storage metadata** | Incoming Storage sequence/timestamp changes are not trusted. Original receipt replay returns Storage's source values; complete-value reads authenticate the same changed bytes and refuse them. |
| **3. History both directions** | Retained ordinary/replay-only/u64 positives survive obsolete current writer state; withdrawal, missing source, permission and foreign/forged values refuse. |
| **4. One field read two ways** | Exact Server/digest strings, full-match identifiers, UTC syntax, strict integers and recursive typed joins agree. No bool/int or string-Boolean alias grants authority. |
| **5. Unvisited references** | Unused dangling reference injection refuses in all eight schemas; complete eager traversal remains. |
| **6. Whole stored size** | Exact inline/external/descriptor/full-event byte measurements remain; external payloads have an empty inline map and correct small descriptor. Owner prose is unchanged and retains SP-337 consistently. |
| **7. Custody every path** | All 56 genuine foreign retries and both context family directions remain refused; reader/rebuild foreign pairs and receipt/publication/custody source joins are rerun. |
| **8. Masked negatives** | All original flip sets remain exact; new source-side type probes do not leave stale caller hashes. Timestamp, session, restore, Storage ID and receipt-time observations are coherent. Complements are recorded per raw family table and in the compact global table. |
| **9. Grade overclaims** | Current quotes/hashes are refreshed; only the eight reviewed oracle cells improve. ABSENT membership, six pending retention cells, Settings exclusions, clock qualification and native NOT_RUN remain explicit. |
| **10. Numeric forms** | Every numeric leaf in publication/read/rebuild/source/receipt/checkpoint/external descriptor is swept. Raw `1.0`, `1e0`, `-0`, `01` and declared alternatives refuse current input; all 1,027 integral-float samples per family refuse strict integer admission. Equal supported hash aliases have one canonical digest; retained u64 originals preserve their recipe. Identity components governed as strings refuse numeric forms. |
| **11. Types** | Boolean gates, source witnesses, all epoch copies, source/receipt/result joins, coherent owner/restore/Storage observations, schema fields/items/constants/enums and inline/external container shapes have wrong-type vectors. String booleans/numbers, bool/int collisions, null, arrays and nested objects refuse. Legitimate nullable branches remain admitted. |

Independent reviewer-derived probes now pass **1,587 applicable observations**, including **1,067 type observations**, with zero applicable failures. Its **8** deliberately replaced authenticated-authority explorations remain outside the caller-input claim. The separate differential suite repairs all **97** selected review reproductions (32 timestamp + 65 type). The focused, numeric, exact-exit, receipt-time, source/scope, Settings layering/DRY and Storage recovery checks pass.

## Family grades before and after

Before is Astra 2 at `6c0c65f6a1fdc009f2bfe2ab8ce323c127f761aa`. Membership/retention cells are unchanged. Both context families retain RP-RUNTIME-365D; the other six retain PENDING_RETENTION_DECISION.

| Family | Reviewed before | After | Unmodified checker assertions |
|---|---|---|---:|
| `format.applied` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6,759 |
| `lsp.server.lifecycle_changed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6,813 |
| `model.catalog_refreshed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6,975 |
| `subagent.context_rehydrated` | 10 PASS / 1 PARTIAL / 1 ABSENT | 11 PASS / 1 ABSENT | 7,185 |
| `subagent.context_shrunk` | 10 PASS / 1 PARTIAL / 1 ABSENT | 11 PASS / 1 ABSENT | 7,210 |
| `project.added` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6,713 |
| `project.created` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6,717 |
| `git.clone.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6,786 |
| `settings.updated` | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE | unchanged; excluded | — |
| `settings.theme.updated` | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE | unchanged; excluded | — |

Totals including exclusions: **78 PASS / 14 PARTIAL / 10 ABSENT / 18 NOT_APPLICABLE → 86 PASS / 6 PARTIAL / 10 ABSENT / 18 NOT_APPLICABLE**. Native execution: **NOT_RUN**.

## Scope, resources and evidence

The source/scope audit passes **707** checks. All **29** family owner units and every earlier fixture fact/type remain exact. Main-only files and main's Decision Log are preserved. The self-grade has **316** current quote/hash citations. All source search lineage and historical application pins remain captured history; no new binding, PlanUnit ID, consumer, cursor, event identity, storage value or retention choice is minted.

Entry resources were 88 GB free root disk and 16 GiB available RAM. Subsequent checks stayed above the stop limits; available RAM is checked before every guard. Work is serial in the sparse `Plans scripts reports tests` worktree. Initial inbox/who reads preceded the no-mail brief; no registration, send/reply or later mailbox action occurred. No subagent, browser, server, admission, registry append, Decision Log edit, main push, governance reseal or protected-artifact edit is performed. The pushed worktree is removed at completion. Reports and grades are copied to the lane drafts folder.

IDs used: **none new**. Existing affected units: **FS-075, LSPS-173, MS-199, PP-151/152, PJCT-072/073, SCS-085, CV-620–627, SP-600–607, ATS-300–304**. Reused authority: **DL-045, DL-076, DL-408, CV-366, SP-278, SP-286/CV-339**.

Evidence lives under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/fix7/`. Each retained file's path, SHA-256 and size is in `evidence-manifest.json`; raw tables are also individually pinned in `DM-guard-removal.json`. The final completion record supplies branch/head/base and cleanup. Pilot outputs not needed by the result are deleted.

## Whole-lane guard-removal table

Every row is an actual guard or named duplicate set removed in memory. Exact flipped IDs and complete checker failures are in `DM-guard-removal.json`; still-rejected IDs are exactly `all_probe_ids` minus that row's flips. Raw serial family tables retain every complement ID. Shared rules are rerun in each family; family-specific schema edits select only the exact schema `$id`. All old intersections are exact. No production guard is weakened.

| Guard / named duplicate set | Negatives that flip | Negatives that stay rejected | Mutant complete checker |
|---|---:|---:|---|
| `envelope.schema` | 2981 exact IDs | 20240 complement IDs | FAIL as required |
| `custody.schema` | 2512 exact IDs | 20709 complement IDs | FAIL as required |
| `writer.owner` | 16 exact IDs | 23205 complement IDs | FAIL as required |
| `writer.result` | 821 exact IDs | 22400 complement IDs | FAIL as required |
| `writer.original_joins` | 1181 exact IDs | 22040 complement IDs | FAIL as required |
| `writer.payload_project` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `writer.time` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `writer.family_schema` | 16 exact IDs | 23205 complement IDs | FAIL as required |
| `writer.profile_policy` | 16 exact IDs | 23205 complement IDs | FAIL as required |
| `writer.identity_key` | 16 exact IDs | 23205 complement IDs | FAIL as required |
| `writer.migration` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `producer.witness` | 445 exact IDs | 22776 complement IDs | FAIL as required |
| `semantic.project` | 50 exact IDs | 23171 complement IDs | FAIL as required |
| `retry.semantic_conflict` | 152 exact IDs | 23069 complement IDs | FAIL as required |
| `append.replay_policy` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `retry.replay_only` | 16 exact IDs | 23205 complement IDs | FAIL as required |
| `retry.current_policy` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `retry.family` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `retry.schema` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `receipt.full_value` | 72 exact IDs | 23149 complement IDs | FAIL as required |
| `receipt.protected_authority` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `receipt.custody_identity` | 48 exact IDs | 23173 complement IDs | FAIL as required |
| `receipt.incoming_semantics` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `receipt.append_result` | 408 exact IDs | 22813 complement IDs | FAIL as required |
| `receipt.event_join` | 16 exact IDs | 23205 complement IDs | FAIL as required |
| `receipt.original_receipt` | 992 exact IDs | 22229 complement IDs | FAIL as required |
| `append.current_event` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `append.receipt_delivery` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `append.terminal_delivery` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `append.membership` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.retention_resolved` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.schema_admitted` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.writer_enabled` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.permission_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.dedupe_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.source_custody_available` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.original_intent_available` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.original_result_available` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.owner_acceptance_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.body_committed` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.lease_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.restore_controls_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.same_restore_occurrence` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.protected_origin_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `append.epoch` | 256 exact IDs | 22965 complement IDs | FAIL as required |
| `append.session_restore` | 160 exact IDs | 23061 complement IDs | FAIL as required |
| `append.durability` | 192 exact IDs | 23029 complement IDs | FAIL as required |
| `append.receipt_delivery_identity` | 912 exact IDs | 22309 complement IDs | FAIL as required |
| `reader.token_identity` | 32 exact IDs | 23189 complement IDs | FAIL as required |
| `reader.retained_value` | 24 exact IDs | 23197 complement IDs | FAIL as required |
| `reader.reader_enabled` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `reader.permission_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `reader.source_present` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `reader.deletion_clear` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `reader.hold_allows_disclosure` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `reader.current_frontier_verified` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `reader.version` | 80 exact IDs | 23141 complement IDs | FAIL as required |
| `reader.selected_token` | 1768 exact IDs | 21453 complement IDs | FAIL as required |
| `rebuild.checkpoint` | 232 exact IDs | 22989 complement IDs | FAIL as required |
| `rebuild.retained_value` | 24 exact IDs | 23197 complement IDs | FAIL as required |
| `rebuild.originals_present` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.source_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.coverage_complete` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.schema_supported` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.current_frontier_verified` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.cas_matches` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.reader_enabled` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.permission_current` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.source_present` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.deletion_clear` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.hold_allows_disclosure` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `rebuild.version` | 80 exact IDs | 23141 complement IDs | FAIL as required |
| `checkpoint.outer_revision` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `checkpoint.selected_token` | 24 exact IDs | 23197 complement IDs | FAIL as required |
| `token.storage_instance_id` | 24 exact IDs | 23197 complement IDs | FAIL as required |
| `token.source_storage` | 24 exact IDs | 23197 complement IDs | FAIL as required |
| `token.checkpoint_key` | 24 exact IDs | 23197 complement IDs | FAIL as required |
| `token.dataset_generation` | 24 exact IDs | 23197 complement IDs | FAIL as required |
| `history.family` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `history.schema` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `history.source_selection` | 1040 exact IDs | 22181 complement IDs | FAIL as required |
| `token.generation_dataset_grammar` | 48 exact IDs | 23173 complement IDs | FAIL as required |
| `token.other_string_grammar` | 168 exact IDs | 23053 complement IDs | FAIL as required |
| `token.durable_snapshot` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `token.schema` | 1832 exact IDs | 21389 complement IDs | FAIL as required |
| `payload.inline_cap` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `payload.schema` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `read_helper.token` | 80 exact IDs | 23141 complement IDs | FAIL as required |
| `read_helper.permission` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `read_helper.source` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `read_helper.withdrawal` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `read_helper.version` | 80 exact IDs | 23141 complement IDs | FAIL as required |
| `schema.references` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `schema.meta` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `schema.format.applied:type` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:additionalProperties` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.0` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.1` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.2` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.3` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.4` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.5` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.6` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.7` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:required.8` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.schema_version.const` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.operation_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.project_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.format.applied:properties.project_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.project_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatter_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.file_path.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.format.applied:properties.file_path.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.file_path.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.type` | 12 exact IDs | 23209 complement IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.minimum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.diff_bytes.maximum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.timestamp.format` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.tool_output_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.format.applied:properties.formatted_output_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `settings.retired_names` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `settings.theme_successor` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `settings.dry_unwired` | 3 exact IDs | 23218 complement IDs | FAIL as required |
| `settings.dry_disabled_reason` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `settings.dry_migration` | 5 exact IDs | 23216 complement IDs | FAIL as required |
| `settings.dry_no_dispatch` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `settings.dry_exclusion` | 4 exact IDs | 23217 complement IDs | FAIL as required |
| `datetime.timezone` | 289 exact IDs | 22932 complement IDs | FAIL as required |
| `datetime.parse` | 633 exact IDs | 22588 complement IDs | FAIL as required |
| `datetime.lexical` | 264 exact IDs | 22957 complement IDs | FAIL as required |
| `datetime.calendar` | 216 exact IDs | 23005 complement IDs | FAIL as required |
| `append.delivery_types` | 176 exact IDs | 23045 complement IDs | FAIL as required |
| `writer.storage_identity_type` | 72 exact IDs | 23149 complement IDs | FAIL as required |
| `numeric.integer_form` | 1015 exact IDs | 22206 complement IDs | FAIL as required |
| `numeric.msgpack_integer_form` | 48 exact IDs | 23173 complement IDs | FAIL as required |
| `numeric.integer_codec_duplicate` | 1124 exact IDs | 22097 complement IDs | FAIL as required |
| `numeric.jcs_integer_alias` | 48 exact IDs | 23173 complement IDs | FAIL as required |
| `numeric.jcs_nonintegral` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `numeric.current_exact_range` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `numeric.raw_float` | 96 exact IDs | 23125 complement IDs | FAIL as required |
| `numeric.raw_negative_zero` | 8 exact IDs | 23213 complement IDs | FAIL as required |
| `numeric.json_single_value` | 24 exact IDs | 23197 complement IDs | FAIL as required |
| `retry.family_schema_duplicate` | 18 exact IDs | 23203 complement IDs | FAIL as required |
| `semantic.edge` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:type` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:additionalProperties` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.0` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.1` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.2` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.3` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.4` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.5` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.6` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.7` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.8` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.9` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:required.10` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.schema_version.const` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.operation_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.project_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.host_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.server_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.root_identity.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.lsp_session_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.previous_state.enum` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state.enum` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.state_reason.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.lsp.server.lifecycle_changed:properties.ts.format` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `writer.server_identity` | 3 exact IDs | 23218 complement IDs | FAIL as required |
| `payload.external_pack_synced` | 36 exact IDs | 23185 complement IDs | FAIL as required |
| `payload.external_index_synced` | 36 exact IDs | 23185 complement IDs | FAIL as required |
| `payload.external_source_present` | 36 exact IDs | 23185 complement IDs | FAIL as required |
| `payload.external_permission_current` | 36 exact IDs | 23185 complement IDs | FAIL as required |
| `payload.external_deletion_clear` | 36 exact IDs | 23185 complement IDs | FAIL as required |
| `payload.external_hold_allows_disclosure` | 36 exact IDs | 23185 complement IDs | FAIL as required |
| `payload.external_exclusivity` | 3 exact IDs | 23218 complement IDs | FAIL as required |
| `payload.external_descriptor` | 6 exact IDs | 23215 complement IDs | FAIL as required |
| `payload.external_ref` | 3 exact IDs | 23218 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:type` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:additionalProperties` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.0` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.1` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.2` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.3` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.4` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.5` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.6` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.7` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:required.8` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.schema_version.const` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.operation_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.type` | 9 exact IDs | 23212 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.project_id.anyOf.0.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.type` | 12 exact IDs | 23209 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.minimum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.model_catalog_revision.maximum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.maxItems` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.uniqueItems` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_status_refs.items.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.refresh_reason.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.type` | 9 exact IDs | 23212 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.provider_id.anyOf.0.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.type` | 9 exact IDs | 23212 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.account_id.anyOf.0.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.model.catalog_refreshed:properties.completed_at_utc.format` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:project_id.anyOf` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:project_id.null_branch_type` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_status_refs.items` | 13 exact IDs | 23208 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_id.anyOf` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:provider_id.null_branch_type` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:account_id.anyOf` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.model.catalog_refreshed:account_id.null_branch_type` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `writer.child_run` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `semantic.revision` | 42 exact IDs | 23179 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:type` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:additionalProperties` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.0` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.1` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.2` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.3` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.4` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.5` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.6` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.7` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.8` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.9` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:required.10` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.schema_version.const` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.operation_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.type` | 9 exact IDs | 23212 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.project_id.anyOf.0.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.agent_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.run_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.child_run_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.type` | 12 exact IDs | 23209 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.minimum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.before_revision.maximum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.type` | 12 exact IDs | 23209 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.minimum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.after_revision.maximum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.minItems` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.maxItems` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.uniqueItems` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.source_refs.items.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.effective_context_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_rehydrated:properties.occurred_at_utc.format` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:project_id.anyOf` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:project_id.null_branch_type` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.subagent.context_rehydrated:source_refs.items` | 13 exact IDs | 23208 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:type` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:additionalProperties` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.0` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.1` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.2` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.3` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.4` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.5` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.6` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.7` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.8` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.9` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:required.10` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.schema_version.const` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.operation_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.type` | 9 exact IDs | 23212 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.project_id.anyOf.0.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.agent_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.run_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.child_run_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.type` | 12 exact IDs | 23209 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.minimum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.before_revision.maximum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.type` | 12 exact IDs | 23209 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.minimum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.after_revision.maximum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.minItems` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.maxItems` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.uniqueItems` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.source_refs.items.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.effective_context_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.subagent.context_shrunk:properties.occurred_at_utc.format` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:project_id.anyOf` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:project_id.null_branch_type` | 11 exact IDs | 23210 complement IDs | FAIL as required |
| `schema.container.subagent.context_shrunk:source_refs.items` | 13 exact IDs | 23208 complement IDs | FAIL as required |
| `schema.project.added:type` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:additionalProperties` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:required.0` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:required.1` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:required.2` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:required.3` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:required.4` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:required.5` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:required.6` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:required.7` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.schema_version.const` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.project_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.added:properties.project_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.project_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.project_revision.type` | 12 exact IDs | 23209 complement IDs | FAIL as required |
| `schema.project.added:properties.project_revision.minimum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.project_revision.maximum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.stable_config_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.registration_kind.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.operation_receipt_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.added:properties.completed_at_utc.format` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:type` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:additionalProperties` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:required.0` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:required.1` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:required.2` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:required.3` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:required.4` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:required.5` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:required.6` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:required.7` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.schema_version.const` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.project_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.created:properties.project_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.project_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.project_revision.type` | 12 exact IDs | 23209 complement IDs | FAIL as required |
| `schema.project.created:properties.project_revision.minimum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.project_revision.maximum` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.stable_config_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.creation_result_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.operation_receipt_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.project.created:properties.completed_at_utc.format` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:type` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:additionalProperties` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.0` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.1` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.2` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.3` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.4` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.5` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.6` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.7` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.8` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:required.9` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.schema_version.const` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.project_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.repo_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.workspace_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.host_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.minLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.environment_id.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.source_location_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.operation_receipt_ref.pattern` | 2 exact IDs | 23219 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.type` | 10 exact IDs | 23211 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.maxLength` | 1 exact IDs | 23220 complement IDs | FAIL as required |
| `schema.git.clone.completed:properties.completed_at_utc.format` | 1 exact IDs | 23220 complement IDs | FAIL as required |
