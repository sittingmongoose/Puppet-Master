# DCN — Card 2 names, prepared without admission

Base `origin/main`: `16acf7594a3fe8559af89491b895f440b314b99e`. Branch: `plans/ea-w3-card2-names-20261104`. Round 1 implementation commit: `d7421ece0b3757b5659b92cda0d1bc42569d037b` (supersedes reviewed `cf5469dca0`). Native execution: **NOT_RUN**. Prior blind Sol review: **NOT_READY** at `cf5469dca0`; this round is the implementation response, not an independent re-review.

**Scope count:** DCN is assigned 17 names: 7 Browser + 8 memory + 2 already-retired names. All 17 are handled. The lane also explicitly lists `chat.response_stop_requested` as **not yours**, assigned to DCH; including that held name gives 18 overall. This branch leaves that name to DCH and does not extend DCN’s scope.

## Per-row outcome

| Name | Outcome | Contract / current evidence |
|---|---|---|
| `browser.session.created` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-244` / `CV-780` / `SP-760` |
| `browser.session.state_changed` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-245` / `CV-781` / `SP-761` |
| `browser.session.closed` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-246` / `CV-782` / `SP-762` |
| `browser.session.promoted` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-247` / `CV-783` / `SP-763` |
| `browser.session.takeover_state_changed` | Prepared, no admission; **11 PASS / membership ABSENT** | `SMPFS-248` / `CV-784` / `SP-764` |
| `memory.gist_state_changed` | Prepared, no admission; **11 PASS / membership ABSENT** | `AMS-130` / `CV-785` / `SP-765` |
| `browser.session.navigated` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-405; Plans/storage-plan.md:1309 |
| `browser.session.resized` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-405; Plans/storage-plan.md:1309 |
| `memory.gist.verification_requested` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.verified` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.verification_failed` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.updated` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.pinned` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.unpinned` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `memory.gist.discarded` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3179 |
| `dashboard.widget_added` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-180; Plans/UI_Command_Catalog.md:16973 |
| `coordination.debug_mirror_exported` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-270; Plans/storage-plan.md:553 |

Exclusions preserve every legacy bucket, category and cohort pin and claim no denominator removal. `individual-disposition/LEDGER_WRITE_RULE.md` reserves the canonical union merge for the parent. This worker updates the 11 exact `rows/ROW_*.json` files and census lines and supplies `individual-disposition/deepen/DCN/LEDGER.jsonl`; the canonical union stays byte-identical to the base. The application JSON records all original/final row hashes and the census hashes. Widget/mirror exclusions overlap DS’s unlanded records: reconcile by exact name and current citation, never double-count them.

## Newly authored bindings and per-family search

Every family was searched independently across live top-level `Plans/*.md`, all top-level `Plans/*.schema.json`, the central registry and Browser admission manifest. Generated mirrors and source-lineage ledgers were excluded. Existing name occurrences are retained with paths/lines in the pinned external search file. None supplies this exact family’s complete payload, history-reader, operation identity or withdrawal contract. The six families are in DL-045’s original scope; DL-046 is reused only for the existing Browser Program relationship and generic Browser source owners, never as membership for these five manual families.

| Family | New Project / application payload IDs | New reader (version 1.0.0) |
|---|---|---|
| `browser.session.created` | `pm.browser.session.created.payload.v1` / `pm.browser.session.created.payload.application.v1` | `reader.browser.session.created.history` |
| `browser.session.state_changed` | `pm.browser.session.state_changed.payload.v1` / `pm.browser.session.state_changed.payload.application.v1` | `reader.browser.session.state_changed.history` |
| `browser.session.closed` | `pm.browser.session.closed.payload.v1` / `pm.browser.session.closed.payload.application.v1` | `reader.browser.session.closed.history` |
| `browser.session.promoted` | `pm.browser.session.promoted.payload.v1` / `pm.browser.session.promoted.payload.application.v1` | `reader.browser.session.promoted.history` |
| `browser.session.takeover_state_changed` | `pm.browser.session.takeover_state_changed.payload.v1` / `pm.browser.session.takeover_state_changed.payload.application.v1` | `reader.browser.session.takeover_state_changed.history` |
| `memory.gist_state_changed` | `pm.memory.gist_state_changed.payload.v1` / `pm.memory.gist_state_changed.payload.application.v1` | `reader.memory.gist_state_changed.history` |

Per-family new identity contracts also bind the original operation component (`event_type + ":" + original operation ID`), stable `owner_change_id`, Project `card2@1` key and global event-ID recipe. Application idempotency uses CV-366 exactly: `application@1:{hex(server_id)}:{hex(component)}`. Identical semantic changes seen through manual-session and workspace/controller owners share a change ID; distinct real changes remain distinct. No record reference is used as cross-owner fact identity.

**Reuse:** `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0`, the real `event_record_index_checkpoint.v1:{storage_instance_id}` generation value and complete SP-278 source token. These are the exact generic index roles, not a sibling’s family binding. Each family explicitly has no independent durable projection/checkpoint (`none_required`), so no new checkpoint/storage registry row or derived retention policy is created. Its reader returns only an ephemeral answer, revalidates complete frontier/source/access/deletion fences and never advances generic progress.

## Premise checks

- **DL-045:** each of the six names is still present in its exact approved 285-family scope. Current partial definitions are documented by the per-family searches. No technical permission is extended to a new feature.
- **DL-046:** Browser Program still has its 53-name census and existing workspace identities. The five manual names are outside that census and remain DL-045 work; the session’s `workspace_id` links to the actual Browser workspace.
- **DL-405 / Card 2a:** the current manual commands still name exactly the five surviving events. Navigate/Reload declare no session event; Storage stores the current URL/viewport. The new rule is at both the behavior owner and actual Storage session record/list.
- **DL-407 / Card 2c:** Contracts still names the single gist-state candidate, while UCC-084 named seven button histories. The new contract covers verify/edit/pin/unpin/discard and every real automatic mutation, including new gists and automatic verification. Requested, failed and unchanged verification retain their command result only. Memory section 7.2 and DL-402/403 are not edited.
- **DL-401 / Card 1 G03 and G10:** exact per-name indefinite assignments are read from the pinned unlanded retention source and adopted without changing their terms. This branch must integrate with that source, not restate a competing policy.
- **DL-180 / UCC-202:** the old dashboard table row is explicitly amended and its event withdrawn.
- **DL-270 / SP-339:** mirror files and their writer/event are retired. Residual prepared Contracts minima do not authorize new mirror writes.

**Failed product-premise checks:** none. **Owner-decision rows stopped:** none among the 17 named rows. The separate Stop row remains out of scope under the lane’s explicit assignment.

## Standing checks 1–11 — round 1

All eleven checks pass for each of the six families in both Project and application scope. Native execution stays NOT_RUN.

| Check | Evidence |
|---|---|
| 1 | Current append and retry reject replay-only; historical originals of a current retry use original-policy validation. |
| 2 | CV-366 application keys are recomputed from exact UTF-8 server and declared operation component. |
| 3 | Real Project positives use the reversible `project~` partition; coherent raw/foreign partitions refuse. |
| 4 | Complete encoded metadata roots remain below 16 KiB; SP-337 governs larger separately approved successors. No new operation value or family checkpoint is stored. |
| 5 | Full-match syntax rejects LF; integer, upper-case, spaced and boolean hash variants refuse without coercion. Explicit timestamp checking works without jsonschema optional dependencies. |
| 6 | Retry equality covers only caller-semantic fields; Storage record and receipt authentication is separate. Valid changed candidate observations still return the original. |
| 7 | Every positive checkpoint matches the event Storage identity; twelve internally coherent foreign checkpoints refuse solely at `token_storage`. |
| 8 | Actual failing CLI fixture subprocess exits 1; zero exit is rejected by the probe driver. |
| 9 | Each of three schemas receives an unvisited dangling-ref injection; eager resolution fails before fixture traversal. |
| 10 | Every family/scope accepts valid retained dedupe, append-once, event-ID-dedupe and replay-only originals after absent/replaced live state and obsolete current stop generation. Forged, foreign and withdrawn history refuses. |
| 11 | Individual predicate removal, coherent observational copies and named duplicate pairs are proved by the following whole-lane table. |

## Guard-removal table — round 1

Actual whole-lane execution: **PASS**, **189 positives**, **1603 negatives**, **124 individual guards**, **135 removal rows**. Every restoration passes. The full external proof lists every flipping and still-rejected case; the self-grade retains each flipping list and a hash-pinned pointer to the complete remaining list.

| Guard | Removed together | Negatives flip | Others still reject |
|---|---|---:|---:|
| `scenario_path` | `scenario_path` | 12 | 1591 |
| `scenario_shape` | `scenario_shape` | 12 | 1591 |
| `envelope_schema` | `envelope_schema` | 36 | 1567 |
| `envelope_schema` | `envelope_schema`, `scope_project_id` | 48 | 1555 |
| `envelope_schema` | `envelope_schema`, `storage_format_observed_at_utc` | 48 | 1555 |
| `envelope_schema` | `envelope_schema`, `storage_format_persisted_at_utc` | 48 | 1555 |
| `payload_schema` | `inline_size`, `payload_schema` | 24 | 1579 |
| `payload_schema` | `payload_schema` | 12 | 1591 |
| `payload_fullmatch` | `payload_fullmatch` | 12 | 1591 |
| `inline_size` | `inline_size`, `payload_schema` | 24 | 1579 |
| `inline_reference` | `inline_reference` | 12 | 1591 |
| `scope_scope_kind` | `scope_scope_kind`, `source_scope_kind` | 24 | 1579 |
| `scope_project_id` | `envelope_schema`, `scope_project_id` | 48 | 1555 |
| `scope_project_id` | `scope_project_id` | 6 | 1597 |
| `scope_thread_id` | `scope_thread_id` | 12 | 1591 |
| `scope_schema` | `scope_schema` | 12 | 1591 |
| `scope_partition` | `scope_partition` | 12 | 1591 |
| `private_thread` | `private_thread` | 1 | 1602 |
| `source_storage_instance_id` | `source_storage_instance_id` | 12 | 1591 |
| `source_server_id` | `source_server_id` | 12 | 1591 |
| `source_computer_id` | `source_computer_id` | 12 | 1591 |
| `source_thread_id` | `source_thread_id` | 12 | 1591 |
| `source_project_id` | `source_project_id` | 12 | 1591 |
| `source_scope_kind` | `scope_scope_kind`, `source_scope_kind` | 24 | 1579 |
| `source_scope_kind` | `source_scope_kind` | 12 | 1591 |
| `lineage_shape` | `lineage_shape` | 12 | 1591 |
| `lineage_run_id` | `lineage_run_id` | 12 | 1591 |
| `lineage_node_id` | `lineage_node_id` | 12 | 1591 |
| `lineage_attempt_id` | `lineage_attempt_id` | 12 | 1591 |
| `source_owner_operation_id` | `source_owner_operation_id` | 12 | 1591 |
| `source_owner_change_id` | `source_owner_change_id` | 12 | 1591 |
| `source_revision_before` | `source_revision_before` | 10 | 1593 |
| `source_revision_after` | `source_revision_after` | 12 | 1591 |
| `source_before_record_ref` | `source_before_record_ref` | 10 | 1593 |
| `source_after_record_ref` | `source_after_record_ref` | 12 | 1591 |
| `source_subject` | `source_subject` | 12 | 1591 |
| `source_workspace` | `source_workspace` | 10 | 1593 |
| `source_authentic` | `source_authentic` | 36 | 1567 |
| `source_committed` | `source_committed` | 12 | 1591 |
| `current_stop` | `current_stop` | 12 | 1591 |
| `record_resolution` | `record_resolution` | 12 | 1591 |
| `record_subject_id` | `record_subject_id` | 12 | 1591 |
| `record_storage_instance_id` | `record_storage_instance_id` | 12 | 1591 |
| `record_server_id` | `record_server_id` | 12 | 1591 |
| `record_computer_id` | `record_computer_id` | 12 | 1591 |
| `record_project_id` | `record_project_id` | 12 | 1591 |
| `record_thread_id` | `record_thread_id` | 12 | 1591 |
| `record_scope_kind` | `record_scope_kind` | 12 | 1591 |
| `record_run_id` | `record_run_id` | 12 | 1591 |
| `record_node_id` | `record_node_id` | 12 | 1591 |
| `record_attempt_id` | `record_attempt_id` | 12 | 1591 |
| `record_revision` | `record_revision` | 12 | 1591 |
| `record_ref` | `record_ref` | 36 | 1567 |
| `record_workspace` | `record_workspace` | 10 | 1593 |
| `command_source` | `command_source` | 12 | 1591 |
| `memory_command` | `memory_command` | 1 | 1602 |
| `revision_step` | `revision_step` | 12 | 1591 |
| `real_change` | `real_change` | 12 | 1591 |
| `transition` | `memory_delta`, `transition` | 30 | 1573 |
| `transition` | `memory_fact_verification_state`, `transition` | 14 | 1589 |
| `transition` | `transition` | 12 | 1591 |
| `verification_support` | `verification_support` | 2 | 1601 |
| `memory_delta` | `memory_delta` | 14 | 1589 |
| `memory_delta` | `memory_delta`, `transition` | 30 | 1573 |
| `memory_fact_previous_pinned` | `memory_fact_previous_pinned` | 2 | 1601 |
| `memory_fact_pinned` | `memory_fact_pinned` | 2 | 1601 |
| `memory_fact_previous_verification_state` | `memory_fact_previous_verification_state` | 2 | 1601 |
| `memory_fact_verification_state` | `memory_fact_verification_state`, `transition` | 14 | 1589 |
| `memory_fact_source` | `memory_fact_source` | 2 | 1601 |
| `memory_fact_evidence_refs` | `memory_fact_evidence_refs` | 2 | 1601 |
| `browser_fact_previous_session_class` | `browser_fact_previous_session_class` | 8 | 1595 |
| `browser_fact_session_class` | `browser_fact_session_class` | 10 | 1593 |
| `browser_fact_previous_takeover_state` | `browser_fact_previous_takeover_state` | 8 | 1595 |
| `browser_fact_takeover_state` | `browser_fact_takeover_state` | 10 | 1593 |
| `browser_fact_previous_lifecycle_state` | `browser_fact_previous_lifecycle_state` | 8 | 1595 |
| `browser_fact_lifecycle_state` | `browser_fact_lifecycle_state` | 10 | 1593 |
| `browser_delta` | `browser_delta` | 8 | 1595 |
| `double_record` | `double_record` | 12 | 1591 |
| `replay_only` | `replay_only` | 48 | 1555 |
| `idempotency` | `idempotency` | 12 | 1591 |
| `event_identity` | `event_identity` | 24 | 1579 |
| `first_receipt` | `first_receipt` | 12 | 1591 |
| `storage_authentic` | `storage_authentic` | 24 | 1579 |
| `original_record` | `original_record` | 72 | 1531 |
| `historical_record` | `historical_record` | 12 | 1591 |
| `storage_event_id` | `storage_event_id` | 12 | 1591 |
| `storage_sequence_id` | `storage_sequence_id` | 24 | 1579 |
| `storage_observed_at_utc` | `storage_observed_at_utc` | 12 | 1591 |
| `storage_persisted_at_utc` | `storage_persisted_at_utc` | 12 | 1591 |
| `storage_format_observed_at_utc` | `envelope_schema`, `storage_format_observed_at_utc` | 48 | 1555 |
| `storage_format_persisted_at_utc` | `envelope_schema`, `storage_format_persisted_at_utc` | 48 | 1555 |
| `storage_receipt_issued` | `storage_receipt_issued` | 12 | 1591 |
| `retry` | `retry` | 48 | 1555 |
| `token_schema` | `digest_frontier`, `token_schema` | 48 | 1555 |
| `token_schema` | `token_schema` | 12 | 1591 |
| `token_observation` | `token_observation` | 12 | 1591 |
| `snapshot` | `snapshot` | 12 | 1591 |
| `token_storage` | `token_storage` | 12 | 1591 |
| `token_source_identity` | `token_source_identity` | 12 | 1591 |
| `token_key` | `token_key` | 12 | 1591 |
| `token_ref` | `token_ref` | 12 | 1591 |
| `token_dataset` | `token_dataset` | 12 | 1591 |
| `reader_partition` | `reader_partition` | 12 | 1591 |
| `reader_event_id` | `reader_event_id` | 12 | 1591 |
| `reader_event_type` | `reader_event_type` | 12 | 1591 |
| `reader_sequence_id` | `reader_sequence_id` | 12 | 1591 |
| `digest_current_bytes_sha256` | `digest_current_bytes_sha256` | 12 | 1591 |
| `digest_manifest_bytes_sha256` | `digest_manifest_bytes_sha256` | 12 | 1591 |
| `digest_manifest_survivor_prefix_sha256` | `digest_manifest_survivor_prefix_sha256` | 12 | 1591 |
| `digest_retained_inventory_sha256` | `digest_retained_inventory_sha256` | 12 | 1591 |
| `digest_durable_watermarks_sha256` | `digest_durable_watermarks_sha256` | 12 | 1591 |
| `digest_excluded_ranges_sha256` | `digest_excluded_ranges_sha256` | 12 | 1591 |
| `digest_retired_inputs_sha256` | `digest_retired_inputs_sha256` | 12 | 1591 |
| `selection_selected_segment_generation` | `selection_selected_segment_generation` | 12 | 1591 |
| `selection_manifest_generation` | `selection_manifest_generation` | 12 | 1591 |
| `selection_recovery_epoch` | `selection_recovery_epoch` | 12 | 1591 |
| `digest_anchor` | `digest_anchor` | 12 | 1591 |
| `digest_frontier` | `digest_frontier` | 12 | 1591 |
| `digest_frontier` | `digest_frontier`, `token_schema` | 48 | 1555 |
| `frontier_revision` | `frontier_revision` | 12 | 1591 |
| `generation_identity` | `generation_identity` | 12 | 1591 |
| `anchor_storage` | `anchor_storage` | 12 | 1591 |
| `frontier_selection` | `frontier_selection` | 12 | 1591 |
| `historical_authentic` | `historical_authentic` | 12 | 1591 |
| `withdrawn` | `withdrawn` | 24 | 1579 |
| `reader_withdrawn` | `reader_withdrawn` | 12 | 1591 |
| `access` | `access` | 12 | 1591 |
| `deleted_disclosure` | `deleted_disclosure` | 12 | 1591 |
| `reader_effect` | `reader_effect` | 12 | 1591 |
| `family_checkpoint` | `family_checkpoint` | 12 | 1591 |
| `command_only_count` | `command_only_count` | 3 | 1600 |
| `command_only_result` | `command_only_result` | 3 | 1600 |
| `command_only_command` | `command_only_command` | 3 | 1600 |
| `command_only_outcome` | `command_only_outcome` | 3 | 1600 |
| `command_only_delta` | `command_only_delta` | 3 | 1600 |

Named duplicate groups are deliberate: metadata schema/inline byte ceiling, a hash slot's syntax/commitment check, application Project-null shape/join, scope-kind envelope/source joins, verify target-state/source fact, pin/unpin changed-field inclusion/exact delta, and the exact same timestamp format checked by envelope and Storage. There is no stale frontier-hash or unpaired lineage case hidden in a duplicate group. Lineage joins use a valid execution-source base; frontier revision changes update its hash. Reference resolution is a prerequisite for dependent record dereferences, so missing source never throws or pretends to be a different predicate failure. No guard was weakened or left removed.

## IDs and source/companion scope

`SMPFS-244..248` (main highest SMPFS-184 + 60), `SP-760..765`, `CV-780..785`, `AMS-130`, `ATS-380`: 19 new PlanUnits. Every origin branch (519 refs) was scanned across all current top-level Plans owner documents, deduplicating 1345 immutable blobs; no collision. UCC-084 and the actual memory command table are amended in place. The test-file path `tests/test_pm_card2_names.py` is ignored by the general `/tests/*` rule, with no explicit `!` allowance, so no test file is added; the executable suite lives under `scripts/`.

The two machine-memory paths required by the brief are absent on Nas1. Searches of both available `.claude-t3` account trees found no copies. The lane’s explicit ID allocations govern, and the currentness edition was copied and file-by-file SHA-256 verified before index generation. No missing-memory default was invented. Round 1 ran on the VM, read both required memory files, and reused the existing nineteen allocations without minting any ID.

## Original drafting checks (historical, superseded by round 1 below)

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | Top-level `pass` |
| `python3 scripts/pm-plan-index.py generate` | 0 | Top-level `pass` |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Top-level `pass` |
| `python3 scripts/pm-plan-index.py validate` | 0 | Top-level `pass` |
| `python3 scripts/pm_card2_events.py` | 0 | PASS: 59 positives, 368 negatives, all 15 guards removed/restored with only their own negatives flipping. |
| Browser Program semantics unittest | 0 | 10 tests pass. |
| Browser event admission checker | 0 | 53 positives, 576 negatives; no failures. |
| Browser admission unittest | 1 | 38 tests, 30 failures at the same pre-existing upstream40 fingerprint assertion. Test/code/registry/manifest/fixture inputs are byte-identical to the base; the baseline witness reproduces the mismatched base fingerprint. |
| Coordination checker | 1 | Two pre-existing machine-input failures: payload-definition census and coordination projection value-schema mismatch. Both failing sections reproduce on immutable base inputs. |
| Injected failure / unresolved-schema-reference subprocesses | 1 each, expected | Both fail closed; the driver asserts success exit codes are invalid. |
| Exact grade citations / exclusion hashes / hard limits / `git diff --check` | 0 | 72 exact citations and eleven final row hashes verify; protected files and canonical union unchanged. |

`DCN-checks.json` records commands, exits and the guard counts. The full guard case lists are in `DCN-self-grade.json`. Index coverage passes; `blocked_runtime_certification_incomplete` remains the expected native-proof boundary, not a static validation failure. Every cited baseline failure is reported, not repaired outside this lane.

## Integration items and limits

1. Integrate the pinned answer and retention branches before admission. Do not append any family from this branch merely because its static suite passes.
2. Parent merges the 11 local disposition rows into the canonical individual union under its ledger write rule, preserving buckets/cohorts and reconciling DS’s two overlapping exclusions.
3. The lane’s separate Stop row belongs to DCH and remains untouched.
4. No main push, landing lock, admission record, registry append, Decision Log write, frozen-validator edit, reseal, governance artifact edit or policy choice was performed. Expected governance staleness belongs to the integration/reseal owner.

## Evidence paths and SHA-256

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/per-family-search.json` — SHA-256 `cebdbe820b9e43da54b2b8ee64ee892d262f50ef54b5c9531b3d63fb68d571fb`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/id-scan.json` — SHA-256 `3bd122facb0cca719becee8b79a5ec5ceb5a93051dd5314fa4f0beb0c13fe731`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/currentness-copy.json` — SHA-256 `e86c3eb59f33f0311d29561d52d4ecc90ad5155fe481a82e4074bc3ead0c13f5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/payload-size-bounds.json` — SHA-256 `64658663c4d1d504c7d506548d20f19278cf4e4d491b0eda2e5f8c3f04149ab0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/decision-inputs.json` — SHA-256 `b6001cc93221825e956308f58c70753e7b18675b10deedaefe95962877784b10`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/oracles.json` — SHA-256 `5270a1472565b531b45052fb3a68a251caa0364f5a3f5b23a83dc69cf489807d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/infrastructure-checks.json` — SHA-256 `5e1e70ca7fde164b14c4d9c9edc2799347b861be42c00add564349f47e4b3a57`.

The exact append policy selected by each prepared companion contract is `dedupe_by_idempotency_key`; the suite also rejects the other two current append policies for these bindings, as well as compatibility-reader-only `projector_replay_only`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/derived-checks.json` — SHA-256 `76c74e3e4e3a91bbfa80fa929b1029b7a2da9627db367bf7a772b04e93a47258`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/targeted-checks.json` — SHA-256 `3e7cd1aad75e29176c267d973b643d1f88c24b77478900a9c363c1f2d1fbad3c`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/browser-test-baseline-witness.json` — SHA-256 `d7da08268712ac1e61dbb2fa77e62ea30d7eb7a60007318cfedcd3206041571b`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/coordination-baseline-witness.json` — SHA-256 `c11869809dfcc0711ca686d4fa1d11b7f9244cf1b9c4c489432cf5af2d9e4c95`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/hard-limit-check.json` — SHA-256 `c742505e23330f87dea367c91e3d11cc30ee53a5c150a25c69541f1e5509d447`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/scope-and-citations.json` — SHA-256 `c40028c8dab1f9c0c9246dbe38bf842d37263f1bd97d359e7e9335ef581ca2cf`.

## Review round 1: findings and responses

- **DCN-B1 — Fixed** in `d7421ece0b3757b5659b92cda0d1bc42569d037b`; `scripts/pm_card2_events.py:340`. Rebuilt all twelve foreign-checkpoint negatives as complete internally coherent foreign Storage selections. Only the single event/Storage predicate rejects; independently removing it passes all twelve.
- **DCN-B2 — Fixed** in `d7421ece0b3757b5659b92cda0d1bc42569d037b`; `scripts/pm_card2_events.py:234`. Separated append/retry candidates from historical originals. Original schema, source, withdrawal and custody checks remain; current policy and live stop state never reach retained originals.
- **DCN-B3 — Fixed** in `d7421ece0b3757b5659b92cda0d1bc42569d037b`; `scripts/pm_card2_events.py:312`. Authenticate and validate Storage originals before semantic retry comparison; compare observations strictly to Storage records and independently verify issued receipts, IDs, sequences and real timestamps. Storage metadata stays outside semantic equality.
- **DCN-B4 — Fixed** in `d7421ece0b3757b5659b92cda0d1bc42569d037b`; `scripts/pm_card2_events.py:235`. Resolve immutable before/after records; verify references, revisions, subject, workspace, storage/server/Computer, scope and all lineage fields against the original operation. Contradictory source facts refuse on append, retry and history.
- **DCN-B5 — Fixed** in `d7421ece0b3757b5659b92cda0d1bc42569d037b`; `scripts/pm_card2_events.py:350`. Recompute raw control-byte SHA-256 and existing SP-278 canonical binding hashes. Generation identity derives from the actual birth anchor, with no second caller-supplied generation recipe; frontier selection joins its source. Hash copies alone never qualify.
- **DCN-B6 — Fixed** in `d7421ece0b3757b5659b92cda0d1bc42569d037b`; `Plans/assistant-memory-subsystem.md:3231`. Complete before/after facts define the exact delta. Repair automatic/discard/new-gist positives and all redundant payload observations. All six operations in both scopes and no-event verifies are covered; the seven retirement prerequisites now hold at prepared-contract depth.
- **DCN-S1 — Fixed** in `d7421ece0b3757b5659b92cda0d1bc42569d037b`; `Plans/card2_event_contracts.json:31`. Replace SP-232 with pinned retention commit 2663667e14346235daaa561d193e959422640b6e, Case L-3 / Retention authority and defaults, exact G10 Browser and G03 memory assignments.
- **DCN-N1 — Recorded** in `d7421ece0b3757b5659b92cda0d1bc42569d037b`; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/targeted-checks.json`. Reproduced the same 30 Browser upstream40 assertion failures and two coordination baseline defects. No unrelated files were repaired; scope-baseline-witness.json verifies unchanged inputs.

The implementation applies exactly E-CARDS-1 **2a A / DL-405** and **2c A / DL-407**. No finding is disputed or stopped for a product question. No admission, registry append, Decision Log entry, policy choice, main push or governance reseal occurred. The eleven disposition records remain byte-identical to the mechanically accepted reviewed head. Four prior exclusions still hold outright; the seven memory exclusions now meet DL-407's complete surviving-contract prerequisite. Pinned answer/retention integration still precedes admission.

| Family | Blind-review before | Self-grade after |
|---|---|---|
| `browser.session.created` | 4 PASS / 7 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `browser.session.state_changed` | 4 PASS / 7 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `browser.session.closed` | 4 PASS / 7 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `browser.session.promoted` | 4 PASS / 7 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `browser.session.takeover_state_changed` | 4 PASS / 7 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `memory.gist_state_changed` | 3 PASS / 8 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |

Membership remains ABSENT for all six. These are prepared contracts with static proof; native execution is NOT_RUN. Every one of the 72 cells was regraded, and every exact quotation was relocated and verified against the implementation head.

## What Astra keeps finding — round 1

Each row below was probed independently for **each of the five Browser families and memory, in both scopes**; memory-specific delta probes additionally cover all six operation kinds. The probes ran after the final checker/fixture edits.

| Class | How ruled out |
|---|---|
| 1 Forged/contradictory input | Forged original IDs/schema, source node/reference contradictions on all three paths, arbitrary anchor/frontier/control/source-value hashes refuse. Event/key identities and all checkpoint commitments recompute from their owner sources; redundant snapshot facts and source selections join explicitly. |
| 2 Payload-trusted Storage metadata | Original observation changes refuse against independent Storage records. Forged receipt sequence/time and invalid original metadata refuse; boolean sequence is not integer 1. Valid candidate observation changes remain outside semantic comparison. |
| 3 History in either direction | Genuine retained policies, including replay-only, pass after live subject disappearance and stale current stop state. Forged Storage/owner/observations, withdrawal, foreign family and foreign checkpoint refuse. Current policy runs on the candidate only. |
| 4 One field read two ways | Strict typed comparison refuses bool/int aliases. Full-match hash/identifier checks refuse LF, integer, uppercase and spaced representations. Timestamp syntax/calendar validation is explicit when optional jsonschema format dependencies are absent. |
| 5 Unvisited refs | Each schema is eagerly traversed before selecting fixtures; dangling refs in unvisited definitions exit nonzero. |
| 6 Partial size limit | Constructive complete-root encoded bounds cover all six metadata roots, all identifier/ref maxima and all array slots. Event payloads are bounded metadata; source-owner bodies are separate existing stores, not a hidden operation value. No family projection/checkpoint was created; SP-337 successor routing remains consistent with current inline metadata. |
| 7 Missing custody path | Append, retry and history each refuse forged original owner records and contradictory record refs. Retry independently validates the original record plus issued Storage receipt before result selection. Reader event-family substitution refuses. No recovery reruns the owner effect. |
| 8 Masked negatives | Every final negative has one logical defect. Observational keys/refs/hashes/post-state are updated coherently. The exact twelve B1 cases flip only after removing `token_storage`; all actual guards and declared related duplicates have full removal/restoration evidence. |
| 9 Grade overclaim | Reviewed 4/7/1 Browser and 3/8/1 memory cells become 11/0/1 only after the corresponding source/schema/transition/custody/checkpoint and negative proofs pass. Membership and native execution are explicitly unclaimed. |

## Round 1 validation and evidence

Whole-lane synthetic suite: **189 positives / 1603 negatives**, all **124 guards** proved. Independent mutation/probe driver: **466 probes, zero failures**. Shard generation/check and index generation/validation each parse top-level `pass`. Related suites reproduce only DCN-N1's baseline failures. `git diff --check` and protected/scope/baseline witnesses pass.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/oracles.json` — SHA-256 `7aa605b28c6d629940d256240db5f889c320859c44729c1cef2e815efd9367d2`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/probes.json` — SHA-256 `2c011bd06957d9bf2de95949b1d42c100a896565dbe6dd12c118a69706ba5b67`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/targeted-checks.json` — SHA-256 `760553429b61ee5b8fa6d57bf916c39d86a87f625f009322b8a3b3e6ee63f7bb`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/scope-baseline-witness.json` — SHA-256 `8b1705027a6ac68aa4a77d386ef43940cc533c321d5100215b61e9c73efc3aa6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/currentness-copy.json` — SHA-256 `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/shards-generate.log` — SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/shards-check.log` — SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/index-generate.log` — SHA-256 `a0ce984126066b3fd966f7dcbb91481b610c8cf7a95acb66f680b158adf8e504`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/index-validate.log` — SHA-256 `157ab1cb7845ec32acd36d59bde614e53e61fe06f5e76d7362fd3a9848cbe82d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/build-fixtures.py` — SHA-256 `09fc15d8e65f85c244ce224e65e52dd094b3146a0881642af4165ed2ce063f08`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/probes.py` — SHA-256 `f6db8aac966a364cb04a0266d6a7c1dc65c17d0410ff70449a95ca99c332517e`.

IDs reused, none minted: **SMPFS-244..248, CV-780..785, SP-760..765, AMS-130, ATS-380**. Existing UCC-084 companion changes and all eleven exclusion records are preserved.

Fixture regeneration source: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/seed-fixtures.json` — SHA-256 `623c9dc920f991e86601517b1c7adf7c75d6b563f127459bb10940497831c90c`; required by the preserved `build-fixtures.py` reproduction.
