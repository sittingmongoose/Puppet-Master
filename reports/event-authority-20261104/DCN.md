# DCN — Card 2 names, prepared without admission

Base `origin/main`: `16acf7594a3fe8559af89491b895f440b314b99e`. Branch: `plans/ea-w3-card2-names-20261104`. Round-4 implementation: `de58b6e10c11ab249ec05f13a2bbbdd6f2f92f4b`; reviewed starting head `ddd4e74e2707d4d225bf7c7bf1668d418cbc75dc`. **Round 4 below supersedes every older grade, check summary and exclusion-completeness claim.** B3 and S1 are fixed; B1, B2, Browser numeric ranges and SW1 await the shared sweep. Native **NOT_RUN**; membership **ABSENT**.

**Sweep part 1 (text pass), 2026-11-05:** branch rebased onto `origin/main` `2989975e8f8a4a1e49235e8ae2095b3df7ea0321`; implementation head `17f785f5f3`; see the "Sweep part 1" section at the end for the current check state, landed-citation changes and part-2 items. The last review's family grades are carried unchanged; this pass re-grades nothing.

**Sweep part 1 (fixture pass), 2026-11-05:** see the section "Sweep part 1 (fixture pass)" at the end. It corrects two things above: the census ledger now really keeps main's bytes, and the 30-failure Browser baseline is gone at this head.

**Sweep parts 2A and 2B numbers, 2026-11-10:** guard tables on the gated tool `004bdedd63` and the gated number scope; see the sections "Sweep part 2A" and "Sweep part 2B numbers" at the end. They supersede the round-4 guard-removal table and the B1/B2/Browser-range sweep items; SW1 and SP-1101 remain part 2B. This lane's timestamp review is interim only.

**Scope count:** DCN is assigned 17 names: 7 Browser + 8 memory + 2 already-retired names. All 17 are handled. The lane also explicitly lists `chat.response_stop_requested` as **not yours**, assigned to DCH; including that held name gives 18 overall. This branch leaves that name to DCH and does not extend DCN’s scope.

## Per-row outcome

| Name | Outcome | Contract / current evidence |
|---|---|---|
| `browser.session.created` | Prepared, no admission; **7 PASS / 4 PARTIAL / membership ABSENT** | `SMPFS-244` / `CV-780` / `SP-760` |
| `browser.session.state_changed` | Prepared, no admission; **6 PASS / 5 PARTIAL / membership ABSENT** | `SMPFS-245` / `CV-781` / `SP-761` |
| `browser.session.closed` | Prepared, no admission; **6 PASS / 5 PARTIAL / membership ABSENT** | `SMPFS-246` / `CV-782` / `SP-762` |
| `browser.session.promoted` | Prepared, no admission; **6 PASS / 5 PARTIAL / membership ABSENT** | `SMPFS-247` / `CV-783` / `SP-763` |
| `browser.session.takeover_state_changed` | Prepared, no admission; **6 PASS / 5 PARTIAL / membership ABSENT** | `SMPFS-248` / `CV-784` / `SP-764` |
| `memory.gist_state_changed` | Prepared, no admission; **6 PASS / 5 PARTIAL / membership ABSENT** | `AMS-130` / `CV-785` / `SP-765` |
| `browser.session.navigated` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-405; Plans/storage-plan.md:1309 |
| `browser.session.resized` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-405; Plans/storage-plan.md:1309 |
| `memory.gist.verification_requested` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3180 |
| `memory.gist.verified` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3180 |
| `memory.gist.verification_failed` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3180 |
| `memory.gist.updated` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3180 |
| `memory.gist.pinned` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3180 |
| `memory.gist.unpinned` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3180 |
| `memory.gist.discarded` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-407; Plans/assistant-memory-subsystem.md:3180 |
| `dashboard.widget_added` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-180; Plans/UI_Command_Catalog.md:16975 |
| `coordination.debug_mirror_exported` | `RECLASSIFY_TO_EXCLUDED` in row file, census and worker union input | DL-270; Plans/storage-plan.md:553 |

Four exclusions hold independently; the seven memory exclusions remain conditional pending the complete surviving contract and mandatory sweep. Exclusions preserve every legacy bucket, category and cohort pin and claim no denominator removal. `individual-disposition/LEDGER_WRITE_RULE.md` reserves the canonical union merge for the parent. This worker updates the 11 exact `rows/ROW_*.json` files and census lines and supplies `individual-disposition/deepen/DCN/LEDGER.jsonl`; the canonical union stays byte-identical to the base. The application JSON records all original/final row hashes and the census hashes. Widget/mirror exclusions overlap DS’s unlanded records: reconcile by exact name and current citation, never double-count them.

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
- **DL-401 / Card 1 G03 and G10:** exact per-name indefinite assignments are adopted without changing their terms from the retention assignment now landed as `Plans/Decision_Log.md#DL-401` (Case L-3, Card 1 retention assignments on `main`); the lineage pin `2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md#retention-authority-and-defaults` is kept. This branch cites that landed source, not a competing policy.
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

Actual whole-lane execution: **PASS**, **189 positives**, **1616 negatives**, **125 individual guards**, **136 removal rows**. Every restoration passes. The external proof lists every flipping and still-rejected case; the self-grade retains every flipping list and a hash-pinned pointer to the complete remaining list.

| Guard | Removed together | Negatives flip | Others still reject |
|---|---|---:|---:|
| `scenario_path` | `scenario_path` | 12 | 1604 |
| `scenario_shape` | `scenario_shape` | 12 | 1604 |
| `envelope_schema` | `envelope_schema` | 36 | 1580 |
| `envelope_schema` | `envelope_schema`, `scope_project_id` | 48 | 1568 |
| `envelope_schema` | `envelope_schema`, `storage_format_observed_at_utc` | 48 | 1568 |
| `envelope_schema` | `envelope_schema`, `storage_format_persisted_at_utc` | 60 | 1556 |
| `payload_schema` | `inline_size`, `payload_schema` | 24 | 1592 |
| `payload_schema` | `payload_schema` | 12 | 1604 |
| `payload_fullmatch` | `payload_fullmatch` | 12 | 1604 |
| `inline_size` | `inline_size`, `payload_schema` | 24 | 1592 |
| `inline_reference` | `inline_reference` | 12 | 1604 |
| `scope_scope_kind` | `scope_scope_kind`, `source_scope_kind` | 24 | 1592 |
| `scope_project_id` | `envelope_schema`, `scope_project_id` | 48 | 1568 |
| `scope_project_id` | `scope_project_id` | 6 | 1610 |
| `scope_thread_id` | `scope_thread_id` | 12 | 1604 |
| `scope_schema` | `scope_schema` | 12 | 1604 |
| `scope_partition` | `scope_partition` | 12 | 1604 |
| `private_thread` | `private_thread` | 1 | 1615 |
| `source_storage_instance_id` | `source_storage_instance_id` | 12 | 1604 |
| `source_server_id` | `source_server_id` | 12 | 1604 |
| `source_computer_id` | `source_computer_id` | 12 | 1604 |
| `source_thread_id` | `source_thread_id` | 12 | 1604 |
| `source_project_id` | `source_project_id` | 12 | 1604 |
| `source_scope_kind` | `scope_scope_kind`, `source_scope_kind` | 24 | 1592 |
| `source_scope_kind` | `source_scope_kind` | 12 | 1604 |
| `lineage_shape` | `lineage_shape` | 12 | 1604 |
| `lineage_run_id` | `lineage_run_id` | 12 | 1604 |
| `lineage_node_id` | `lineage_node_id` | 12 | 1604 |
| `lineage_attempt_id` | `lineage_attempt_id` | 12 | 1604 |
| `source_owner_operation_id` | `source_owner_operation_id` | 12 | 1604 |
| `source_owner_change_id` | `source_owner_change_id` | 12 | 1604 |
| `source_revision_before` | `source_revision_before` | 10 | 1606 |
| `source_revision_after` | `source_revision_after` | 12 | 1604 |
| `source_before_record_ref` | `source_before_record_ref` | 10 | 1606 |
| `source_after_record_ref` | `source_after_record_ref` | 12 | 1604 |
| `source_subject` | `source_subject` | 12 | 1604 |
| `source_workspace` | `source_workspace` | 10 | 1606 |
| `source_authentic` | `source_authentic` | 36 | 1580 |
| `source_committed` | `source_committed` | 12 | 1604 |
| `current_stop` | `current_stop` | 12 | 1604 |
| `record_resolution` | `record_resolution` | 12 | 1604 |
| `record_subject_id` | `record_subject_id` | 12 | 1604 |
| `record_storage_instance_id` | `record_storage_instance_id` | 12 | 1604 |
| `record_server_id` | `record_server_id` | 12 | 1604 |
| `record_computer_id` | `record_computer_id` | 12 | 1604 |
| `record_project_id` | `record_project_id` | 12 | 1604 |
| `record_thread_id` | `record_thread_id` | 12 | 1604 |
| `record_scope_kind` | `record_scope_kind` | 12 | 1604 |
| `record_run_id` | `record_run_id` | 12 | 1604 |
| `record_node_id` | `record_node_id` | 12 | 1604 |
| `record_attempt_id` | `record_attempt_id` | 12 | 1604 |
| `record_revision` | `record_revision` | 12 | 1604 |
| `record_ref` | `record_ref` | 36 | 1580 |
| `record_workspace` | `record_workspace` | 10 | 1606 |
| `command_source` | `command_source` | 12 | 1604 |
| `memory_command` | `memory_command` | 1 | 1615 |
| `revision_step` | `revision_step` | 12 | 1604 |
| `real_change` | `real_change` | 12 | 1604 |
| `transition` | `memory_delta`, `transition` | 30 | 1586 |
| `transition` | `memory_fact_verification_state`, `transition` | 14 | 1602 |
| `transition` | `transition` | 12 | 1604 |
| `verification_support` | `verification_support` | 2 | 1614 |
| `memory_delta` | `memory_delta` | 14 | 1602 |
| `memory_delta` | `memory_delta`, `transition` | 30 | 1586 |
| `memory_fact_previous_pinned` | `memory_fact_previous_pinned` | 2 | 1614 |
| `memory_fact_pinned` | `memory_fact_pinned` | 2 | 1614 |
| `memory_fact_previous_verification_state` | `memory_fact_previous_verification_state` | 2 | 1614 |
| `memory_fact_verification_state` | `memory_fact_verification_state`, `transition` | 14 | 1602 |
| `memory_fact_source` | `memory_fact_source` | 2 | 1614 |
| `memory_fact_evidence_refs` | `memory_fact_evidence_refs` | 2 | 1614 |
| `browser_fact_previous_session_class` | `browser_fact_previous_session_class` | 8 | 1608 |
| `browser_fact_session_class` | `browser_fact_session_class` | 10 | 1606 |
| `browser_fact_previous_takeover_state` | `browser_fact_previous_takeover_state` | 8 | 1608 |
| `browser_fact_takeover_state` | `browser_fact_takeover_state` | 10 | 1606 |
| `browser_fact_previous_lifecycle_state` | `browser_fact_previous_lifecycle_state` | 8 | 1608 |
| `browser_fact_lifecycle_state` | `browser_fact_lifecycle_state` | 10 | 1606 |
| `browser_delta` | `browser_delta` | 8 | 1608 |
| `double_record` | `double_record` | 12 | 1604 |
| `replay_only` | `replay_only` | 48 | 1568 |
| `idempotency` | `idempotency` | 12 | 1604 |
| `event_identity` | `event_identity` | 24 | 1592 |
| `first_receipt` | `first_receipt` | 12 | 1604 |
| `storage_authentic` | `storage_authentic` | 24 | 1592 |
| `original_record` | `original_record` | 72 | 1544 |
| `historical_record` | `historical_record` | 12 | 1604 |
| `storage_event_id` | `storage_event_id` | 12 | 1604 |
| `storage_sequence_id` | `storage_sequence_id` | 24 | 1592 |
| `storage_observed_at_utc` | `storage_observed_at_utc` | 12 | 1604 |
| `storage_persisted_at_utc` | `storage_persisted_at_utc` | 12 | 1604 |
| `storage_format_observed_at_utc` | `envelope_schema`, `storage_format_observed_at_utc` | 48 | 1568 |
| `storage_format_persisted_at_utc` | `envelope_schema`, `storage_format_persisted_at_utc` | 60 | 1556 |
| `storage_receipt_issued` | `storage_receipt_issued` | 12 | 1604 |
| `retry` | `retry` | 48 | 1568 |
| `token_schema` | `digest_frontier`, `token_schema` | 48 | 1568 |
| `token_schema` | `token_schema` | 12 | 1604 |
| `token_observation` | `token_observation` | 12 | 1604 |
| `snapshot` | `snapshot` | 12 | 1604 |
| `token_storage` | `token_storage` | 12 | 1604 |
| `token_source_identity` | `token_source_identity` | 12 | 1604 |
| `token_key` | `token_key` | 12 | 1604 |
| `token_ref` | `token_ref` | 12 | 1604 |
| `token_dataset` | `token_dataset` | 12 | 1604 |
| `reader_partition` | `reader_partition` | 12 | 1604 |
| `reader_event_id` | `reader_event_id` | 12 | 1604 |
| `reader_event_type` | `reader_event_type` | 12 | 1604 |
| `reader_sequence_id` | `reader_sequence_id` | 12 | 1604 |
| `digest_current_bytes_sha256` | `digest_current_bytes_sha256` | 12 | 1604 |
| `digest_manifest_bytes_sha256` | `digest_manifest_bytes_sha256` | 12 | 1604 |
| `digest_manifest_survivor_prefix_sha256` | `digest_manifest_survivor_prefix_sha256` | 12 | 1604 |
| `digest_retained_inventory_sha256` | `digest_retained_inventory_sha256` | 12 | 1604 |
| `digest_durable_watermarks_sha256` | `digest_durable_watermarks_sha256` | 12 | 1604 |
| `digest_excluded_ranges_sha256` | `digest_excluded_ranges_sha256` | 12 | 1604 |
| `digest_retired_inputs_sha256` | `digest_retired_inputs_sha256` | 12 | 1604 |
| `selection_selected_segment_generation` | `selection_selected_segment_generation` | 12 | 1604 |
| `selection_manifest_generation` | `selection_manifest_generation` | 12 | 1604 |
| `selection_recovery_epoch` | `selection_recovery_epoch` | 12 | 1604 |
| `digest_anchor` | `digest_anchor` | 12 | 1604 |
| `digest_frontier` | `digest_frontier` | 12 | 1604 |
| `digest_frontier` | `digest_frontier`, `token_schema` | 48 | 1568 |
| `frontier_revision` | `frontier_revision` | 12 | 1604 |
| `generation_identity` | `generation_identity` | 12 | 1604 |
| `anchor_storage` | `anchor_storage` | 12 | 1604 |
| `frontier_selection` | `frontier_selection` | 12 | 1604 |
| `historical_authentic` | `historical_authentic` | 12 | 1604 |
| `withdrawn` | `withdrawn` | 24 | 1592 |
| `reader_withdrawn` | `reader_withdrawn` | 12 | 1604 |
| `access` | `access` | 12 | 1604 |
| `deleted_disclosure` | `deleted_disclosure` | 12 | 1604 |
| `reader_effect` | `reader_effect` | 12 | 1604 |
| `family_checkpoint` | `family_checkpoint` | 12 | 1604 |
| `command_only_count` | `command_only_count` | 3 | 1613 |
| `command_only_result` | `command_only_result` | 3 | 1613 |
| `command_only_command` | `command_only_command` | 3 | 1613 |
| `command_only_outcome` | `command_only_outcome` | 3 | 1613 |
| `command_only_delta` | `command_only_delta` | 3 | 1613 |
| `command_only_verified` | `command_only_verified` | 1 | 1615 |

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

## Review round 1: findings and responses (historical; B6 claim superseded by round 2)

- **DCN-B1 — Fixed** in `2d50d5de0fc61eee3c17ba22a9597231111ef148`; `scripts/pm_card2_events.py:340`. Rebuilt all twelve foreign-checkpoint negatives as complete internally coherent foreign Storage selections. Only the single event/Storage predicate rejects; independently removing it passes all twelve.
- **DCN-B2 — Fixed** in `2d50d5de0fc61eee3c17ba22a9597231111ef148`; `scripts/pm_card2_events.py:234`. Separated append/retry candidates from historical originals. Original schema, source, withdrawal and custody checks remain; current policy and live stop state never reach retained originals.
- **DCN-B3 — Fixed** in `2d50d5de0fc61eee3c17ba22a9597231111ef148`; `scripts/pm_card2_events.py:312`. Authenticate and validate Storage originals before semantic retry comparison; compare observations strictly to Storage records and independently verify issued receipts, IDs, sequences and real timestamps. Storage metadata stays outside semantic equality.
- **DCN-B4 — Fixed** in `2d50d5de0fc61eee3c17ba22a9597231111ef148`; `scripts/pm_card2_events.py:235`. Resolve immutable before/after records; verify references, revisions, subject, workspace, storage/server/Computer, scope and all lineage fields against the original operation. Contradictory source facts refuse on append, retry and history.
- **DCN-B5 — Fixed** in `2d50d5de0fc61eee3c17ba22a9597231111ef148`; `scripts/pm_card2_events.py:350`. Recompute raw control-byte SHA-256 and existing SP-278 canonical binding hashes. Generation identity derives from the actual birth anchor, with no second caller-supplied generation recipe; frontier selection joins its source. Hash copies alone never qualify.
- **DCN-B6 — Fixed** in `2d50d5de0fc61eee3c17ba22a9597231111ef148`; `Plans/assistant-memory-subsystem.md:3231`. Complete before/after facts define the exact delta. Repair automatic/discard/new-gist positives and all redundant payload observations. All six operations in both scopes and no-event verifies are covered; unchanged successful verification has Verified before/after facts and an isolated false-success refusal; the seven retirement prerequisites now hold at prepared-contract depth.
- **DCN-S1 — Fixed** in `2d50d5de0fc61eee3c17ba22a9597231111ef148`; `Plans/card2_event_contracts.json:31`. Replace SP-232 with pinned retention commit 2663667e14346235daaa561d193e959422640b6e, Case L-3 / Retention authority and defaults, exact G10 Browser and G03 memory assignments.
- **DCN-N1 — Recorded** in `2d50d5de0fc61eee3c17ba22a9597231111ef148`; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/targeted-checks.json`. Reproduced the same 30 Browser upstream40 assertion failures and two coordination baseline defects. No unrelated files were repaired; scope-baseline-witness.json verifies unchanged inputs.

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

Whole-lane synthetic suite: **189 positives / 1616 negatives**, all **125 guards** proved. Independent mutation/probe driver: **491 probes, zero failures**. Shard generation/check and index generation/validation each parse top-level `pass`. Related suites reproduce only DCN-N1 baseline failures. `git diff --check` and protected/scope/baseline witnesses pass.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/oracles.json` — SHA-256 `38776a891afcc20894374297d59e7393826ae5a549c5f07f5e151edb3c906bcc`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/probes.json` — SHA-256 `d648d3801aa8a34694afe21c1c7ff5be25aad1512adf7977401af7799b386efc`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/targeted-checks.json` — SHA-256 `760553429b61ee5b8fa6d57bf916c39d86a87f625f009322b8a3b3e6ee63f7bb`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/scope-baseline-witness.json` — SHA-256 `8b1705027a6ac68aa4a77d386ef43940cc533c321d5100215b61e9c73efc3aa6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/currentness-copy.json` — SHA-256 `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/shards-generate.log` — SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/shards-check.log` — SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/index-generate.log` — SHA-256 `a0ce984126066b3fd966f7dcbb91481b610c8cf7a95acb66f680b158adf8e504`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/index-validate.log` — SHA-256 `157ab1cb7845ec32acd36d59bde614e53e61fe06f5e76d7362fd3a9848cbe82d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/build-fixtures.py` — SHA-256 `8118a8f99e2b6b6368f7475fefaa36a127d1fa296760f25ded7414f92d3ce46f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/probes.py` — SHA-256 `b5c182057aea1e20602767ab6c0780b56b0eb8d50cf42e49aa3dac6fd6fbab64`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round1/seed-fixtures.json` — SHA-256 `623c9dc920f991e86601517b1c7adf7c75d6b563f127459bb10940497831c90c`.

IDs reused, none minted: **SMPFS-244..248, CV-780..785, SP-760..765, AMS-130, ATS-380**. Existing UCC-084 companion changes and all eleven exclusion records are preserved.


## Review round 2: findings and responses (historical; B6/B8 superseded by round 3)

Implementation `ace2fabbb63f55d833db1383cf3e49b025396fd2` applies exactly **DL-405 (2a A)** and **DL-407 (2c A)**. No new ID or product choice is introduced.

- **DCN-B6 — Fixed** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`), `Plans/assistant-memory-subsystem.md:3231`, `scripts/pm_card2_events.py:204`. Complete required §3.1 semantic facts and exact source types are mandatory, independently of metadata identity/revision joins. Both snapshots omitting the same required field refuse. Both combined claim+summary edit controls pass; deleting claims from both and reporting only summary refuses solely at `memory_source_shape`. Required-field omission negatives, optional-absence/null controls, new-gist/automatic/command transitions and no-event verifies re-establish the seven retirement prerequisites. Memory bodies stay with the original owner. Verify with the full oracle and `regression-memory-completeness.py`.
- **DCN-B7 — Fixed** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`), `scripts/pm_card2_events.py:241` / `:388`. Retry recomputes lowercase SHA-256 of the exact adopted producer-semantic RFC 8785 projection using `rfc8785` 0.1.4, with no equality fallback. `1.0`, `1e0`, `0.0`, `-0`, `-0.0` and `0e0` have positive original-result controls and isolated false-conflict negatives for every family/scope. `01`, `00`, `-01` fail full JSON parsing before any recipe. Storage observations/receipts retain strict typed custody equality; assigned metadata remains outside the semantic projection. Existing string identities and SP-278 digest inputs refuse noncanonical numeric types. Verify with the full oracle, numeric recipe probes and independent review regression driver.
- **Item 11 type sweep — Fixed** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`), same checker. Exact booleans and integer counts replace truthiness/bool-int aliases. Schema guards refuse non-object payloads; fields are dereferenced only when an object exists. Source fact/claim members refuse string numbers, string booleans, null, arrays and nested objects where disallowed. A non-list `other_events`, non-string snapshot identity and any non-null family checkpoint refuse. These tighten existing DL-405/DL-407 contracts and introduce no checkpoint or new behavior. The fixture includes 3163 isolated wrong-type negatives across the six families; the whole-lane removal proof runs with every unrelated predicate active.
- **DCN-B1 — Preserved** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`): all twelve coherent foreign-checkpoint negatives still flip with only `token_storage` removed; no composite bypass.
- **DCN-B2 — Preserved** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`): genuine retained history, including replay-only, remains readable after live disappearance/state/stop changes; current append/retry refuse replay-only.
- **DCN-B3 — Preserved** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`): strict original/Storage receipt custody remains independent of canonical semantic equivalence; forged originals, unissued/mismatched receipts and withdrawal refuse.
- **DCN-B4 — Preserved** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`): independent original record references, scope/subject/workspace/lineage and revisions still join on append/retry/history.
- **DCN-B5 — Preserved** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`): original control bytes, SP-278 value commitments, generation and frontier identities still recompute and join.
- **DCN-S1 — Preserved** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`): all six routes still cite pinned retention commit `2663667e14346235daaa561d193e959422640b6e`, Case L-3/G03/G10; no competing retention rule.
- **DCN-N1 — Baseline note preserved** (`ace2fabbb63f55d833db1383cf3e49b025396fd2`): Browser tests reproduce 30 upstream40 failures; coordination reproduces exactly its payload census and projection `value_schema` failures. Related inputs are unchanged from the reviewed head. No unrelated repair.

No finding is disputed or stopped for Jared. The eleven exclusion/application records are unchanged. Four exclusions continue to hold; seven memory retirements now satisfy the complete surviving-contract prerequisite at static prepared depth. Answer/retention integration still precedes admission. Membership remains **ABSENT**, native execution **NOT_RUN**.

| Family | Cycle-two review before | Round-2 self-grade after |
|---|---|---|
| `browser.session.created` | 9 PASS / 2 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `browser.session.state_changed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `browser.session.closed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `browser.session.promoted` | 9 PASS / 2 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `browser.session.takeover_state_changed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| `memory.gist_state_changed` | 7 PASS / 4 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |

All 72 cells were reread; prior review grades are retained per cell. Current exact source quotations are relocated and verified mechanically. PASS denotes static contract depth only.

### All eleven standing checks — round 2

| Check | Result / evidence |
|---|---|
| 1 | Current append/retry replay-only negatives remain isolated; original retained policies remain valid. |
| 2 | CV-366 app keys still recompute exact UTF-8 components. |
| 3 | Project positives retain encoded `project~` partitions; raw/foreign partitions refuse. |
| 4 | Full-root MessagePack bounds remain 2,182–2,198 Browser bytes / 5,004 memory bytes; bodies remain in existing owner stores, SP-337 unchanged. |
| 5 | Full-match LF/hash/identifier refusals remain; source hash syntax is checked without coercion. |
| 6 | RFC 8785 semantic projection includes producer sequence and excludes assigned sequence/observed/persisted values; strict custody remains separate. |
| 7 | Every positive checkpoint matches its event; all twelve coherent foreign selections refuse solely at `token_storage`. |
| 8 | Actual CLI unvisited-ref injections emit FAIL and exit 1; the driver rejects success. |
| 9 | Every `$ref` in all three loaded event/token/payload schemas resolves eagerly, including unvisited definitions. |
| 10 | Retained genuine history survives changed live state and historical policies; forged, withdrawn, foreign/access/deletion negatives refuse. |
| 11 | Whole-lane actual callable removal/restoration, one guard or named duplicate set at a time; full table below and hash-pinned exact case lists. |

### What Astra keeps finding — all eleven classes, round 2

| Class | Probe and ruling |
|---|---|
| 1 Forged/contradictory inputs | Independent source/ref/subject/lineage/event identity and recomputed checkpoint/control/anchor/frontier hash mutations refuse on every path/scope. B6 omissions and hidden combined claim edits now refuse too. |
| 2 Payload-trusted Storage metadata | Candidate assigned metadata changes return the original; original observations and mismatched/unissued receipts refuse against independent Storage sources. Typed flags cannot fake issuance/authenticity. |
| 3 History wrong either way | Original valid policies, including replay-only, pass after absent live state/stale current stop. Forged/foreign/withdrawn/access/deletion negatives refuse. Current admission never reaches the retained original. |
| 4 One field read two ways | Event semantic numbers use RFC 8785; original/receipt custody stays exact. Hash IDs refuse integers, uppercase, whitespace and LF; no trim or bool/int coercion. |
| 5 Unvisited dangling refs | Three actual CLI processes inject an unreachable dangling `$ref`, each fails closed with exit 1. |
| 6 Partial size limits | Maximum all-property/full-slot roots measured in encoded bytes; every root stays under 16 KiB. No new operation store/checkpoint exists; no source body is moved into the event or contradictory SP-337 rule introduced. |
| 7 Missing custody path | Append/retry/history each exercise forged owner and source-ref/lineage contradictions; retry validates original plus issued receipt independently of its semantic digest. Family substitution refuses. |
| 8 Masked negatives | Every existing and new negative is checked for exactly its declared guard/set; all other predicates execute during each actual removal. No hash/key/post-state stale copy or composite checkpoint bypass. |
| 9 Overstated grades | The before grades are the cycle-two independent 9/2/1 and 7/4/1; fourteen cells upgrade only after defect-catching controls pass. Absent admission and native NOT_RUN stay explicit. |
| 10 Numbers two ways | Every family/scope has equivalent-result positives and false-conflict negatives for decimal/exponent/signed-zero forms, plus parser negatives for leading zeros. 168 independent numeric identity/payload negatives and eight codec cases confirm noncanonical inputs refuse outside the JCS semantic domain. |
| 11 Types confused | Exact bool/count/source-fact/claim checks; non-object inline payloads, non-list duplicate-event containers, array/object snapshot IDs and non-null phantom checkpoints refuse. String booleans/numbers, null, arrays, nested objects and bool/int aliases are tested without coercion. A separate 2,040-probe type sweep passes; an unrelated lineage defect still refuses with the named structural-schema duplicate set removed. |

### Guard-removal table — round 2

**PASS: 269 positives / 4970 negatives; 127 guards / 152 removal rows / 136 unique sets; all restored.** Plus 36 full-JSON parser refusals. Every row carries exact flipping IDs and a SHA-256-pinned complete still-rejected list in the self-grade; the full external proof is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/oracles.json`, SHA-256 `098c3e101979fc7f5b9106a138ee7cd7fadbe522cf8d715e17a985c9fbf52253`.

| Guard | Removed together | Negatives flip | Other negatives still reject | Restored |
|---|---|---:|---:|---|
| `scenario_path` | `scenario_path` | 12 | 4958 | yes |
| `scenario_shape` | `scenario_shape` | 12 | 4958 | yes |
| `envelope_schema` | `envelope_schema` | 36 | 4934 | yes |
| `envelope_schema` | `envelope_schema`, `payload_schema` | 108 | 4862 | yes |
| `envelope_schema` | `envelope_schema`, `scope_project_id` | 48 | 4922 | yes |
| `envelope_schema` | `envelope_schema`, `storage_format_observed_at_utc` | 48 | 4922 | yes |
| `envelope_schema` | `envelope_schema`, `storage_format_persisted_at_utc` | 60 | 4910 | yes |
| `payload_schema` | `envelope_schema`, `payload_schema` | 108 | 4862 | yes |
| `payload_schema` | `inline_size`, `payload_schema` | 24 | 4946 | yes |
| `payload_schema` | `payload_schema` | 12 | 4958 | yes |
| `payload_fullmatch` | `payload_fullmatch` | 12 | 4958 | yes |
| `inline_size` | `inline_size`, `payload_schema` | 24 | 4946 | yes |
| `inline_reference` | `inline_reference` | 12 | 4958 | yes |
| `scope_scope_kind` | `scope_scope_kind`, `source_scope_kind` | 24 | 4946 | yes |
| `scope_project_id` | `envelope_schema`, `scope_project_id` | 48 | 4922 | yes |
| `scope_project_id` | `scope_project_id` | 6 | 4964 | yes |
| `scope_thread_id` | `scope_thread_id` | 12 | 4958 | yes |
| `scope_schema` | `scope_schema` | 12 | 4958 | yes |
| `scope_partition` | `scope_partition` | 12 | 4958 | yes |
| `private_thread` | `private_thread` | 1 | 4969 | yes |
| `source_storage_instance_id` | `source_storage_instance_id` | 12 | 4958 | yes |
| `source_server_id` | `source_server_id` | 12 | 4958 | yes |
| `source_computer_id` | `source_computer_id` | 12 | 4958 | yes |
| `source_thread_id` | `source_thread_id` | 12 | 4958 | yes |
| `source_project_id` | `source_project_id` | 12 | 4958 | yes |
| `source_scope_kind` | `scope_scope_kind`, `source_scope_kind` | 24 | 4946 | yes |
| `source_scope_kind` | `source_scope_kind` | 12 | 4958 | yes |
| `lineage_shape` | `lineage_shape` | 12 | 4958 | yes |
| `lineage_run_id` | `lineage_run_id` | 12 | 4958 | yes |
| `lineage_node_id` | `lineage_node_id` | 12 | 4958 | yes |
| `lineage_attempt_id` | `lineage_attempt_id` | 12 | 4958 | yes |
| `source_owner_operation_id` | `source_owner_operation_id` | 12 | 4958 | yes |
| `source_owner_change_id` | `source_owner_change_id` | 12 | 4958 | yes |
| `source_revision_before` | `source_revision_before` | 10 | 4960 | yes |
| `source_revision_after` | `source_revision_after` | 12 | 4958 | yes |
| `source_before_record_ref` | `source_before_record_ref` | 10 | 4960 | yes |
| `source_after_record_ref` | `source_after_record_ref` | 12 | 4958 | yes |
| `source_subject` | `source_subject` | 12 | 4958 | yes |
| `source_workspace` | `source_workspace` | 10 | 4960 | yes |
| `source_authentic` | `source_authentic` | 360 | 4610 | yes |
| `source_committed` | `source_committed` | 336 | 4634 | yes |
| `current_stop` | `current_stop` | 228 | 4742 | yes |
| `record_resolution` | `record_resolution` | 12 | 4958 | yes |
| `record_subject_id` | `record_subject_id` | 12 | 4958 | yes |
| `record_storage_instance_id` | `record_storage_instance_id` | 12 | 4958 | yes |
| `record_server_id` | `record_server_id` | 12 | 4958 | yes |
| `record_computer_id` | `record_computer_id` | 12 | 4958 | yes |
| `record_project_id` | `record_project_id` | 12 | 4958 | yes |
| `record_thread_id` | `record_thread_id` | 12 | 4958 | yes |
| `record_scope_kind` | `record_scope_kind` | 12 | 4958 | yes |
| `record_run_id` | `record_run_id` | 12 | 4958 | yes |
| `record_node_id` | `record_node_id` | 12 | 4958 | yes |
| `record_attempt_id` | `record_attempt_id` | 12 | 4958 | yes |
| `record_revision` | `record_revision` | 12 | 4958 | yes |
| `record_ref` | `record_ref` | 36 | 4934 | yes |
| `record_workspace` | `record_workspace` | 10 | 4960 | yes |
| `command_source` | `command_source` | 12 | 4958 | yes |
| `memory_command` | `memory_command` | 1 | 4969 | yes |
| `revision_step` | `revision_step` | 12 | 4958 | yes |
| `real_change` | `real_change` | 336 | 4634 | yes |
| `transition` | `memory_delta`, `transition` | 68 | 4902 | yes |
| `transition` | `memory_fact_verification_state`, `transition` | 50 | 4920 | yes |
| `transition` | `transition` | 48 | 4922 | yes |
| `verification_support` | `verification_support` | 38 | 4932 | yes |
| `memory_source_shape` | `memory_fact_evidence_refs`, `memory_source_shape` | 120 | 4850 | yes |
| `memory_source_shape` | `memory_fact_pinned`, `memory_fact_previous_pinned`, `memory_source_shape` | 122 | 4848 | yes |
| `memory_source_shape` | `memory_fact_previous_verification_state`, `memory_fact_verification_state`, `memory_source_shape` | 120 | 4850 | yes |
| `memory_source_shape` | `memory_fact_source`, `memory_source_shape` | 120 | 4850 | yes |
| `memory_source_shape` | `memory_source_shape` | 116 | 4854 | yes |
| `memory_delta` | `memory_delta` | 16 | 4954 | yes |
| `memory_delta` | `memory_delta`, `transition` | 68 | 4902 | yes |
| `memory_fact_previous_pinned` | `memory_fact_pinned`, `memory_fact_previous_pinned`, `memory_source_shape` | 122 | 4848 | yes |
| `memory_fact_previous_pinned` | `memory_fact_previous_pinned` | 2 | 4968 | yes |
| `memory_fact_pinned` | `memory_fact_pinned` | 2 | 4968 | yes |
| `memory_fact_pinned` | `memory_fact_pinned`, `memory_fact_previous_pinned`, `memory_source_shape` | 122 | 4848 | yes |
| `memory_fact_previous_verification_state` | `memory_fact_previous_verification_state` | 2 | 4968 | yes |
| `memory_fact_previous_verification_state` | `memory_fact_previous_verification_state`, `memory_fact_verification_state`, `memory_source_shape` | 120 | 4850 | yes |
| `memory_fact_verification_state` | `memory_fact_previous_verification_state`, `memory_fact_verification_state`, `memory_source_shape` | 120 | 4850 | yes |
| `memory_fact_verification_state` | `memory_fact_verification_state`, `transition` | 50 | 4920 | yes |
| `memory_fact_source` | `memory_fact_source` | 2 | 4968 | yes |
| `memory_fact_source` | `memory_fact_source`, `memory_source_shape` | 120 | 4850 | yes |
| `memory_fact_evidence_refs` | `memory_fact_evidence_refs` | 2 | 4968 | yes |
| `memory_fact_evidence_refs` | `memory_fact_evidence_refs`, `memory_source_shape` | 120 | 4850 | yes |
| `browser_fact_previous_session_class` | `browser_fact_previous_session_class` | 8 | 4962 | yes |
| `browser_fact_session_class` | `browser_fact_session_class` | 10 | 4960 | yes |
| `browser_fact_previous_takeover_state` | `browser_fact_previous_takeover_state` | 8 | 4962 | yes |
| `browser_fact_takeover_state` | `browser_fact_takeover_state` | 10 | 4960 | yes |
| `browser_fact_previous_lifecycle_state` | `browser_fact_previous_lifecycle_state` | 8 | 4962 | yes |
| `browser_fact_lifecycle_state` | `browser_fact_lifecycle_state` | 10 | 4960 | yes |
| `browser_delta` | `browser_delta` | 8 | 4962 | yes |
| `double_record` | `double_record` | 84 | 4886 | yes |
| `replay_only` | `replay_only` | 48 | 4922 | yes |
| `idempotency` | `idempotency` | 12 | 4958 | yes |
| `event_identity` | `event_identity` | 24 | 4946 | yes |
| `first_receipt` | `first_receipt` | 228 | 4742 | yes |
| `storage_authentic` | `storage_authentic` | 240 | 4730 | yes |
| `original_record` | `original_record` | 72 | 4898 | yes |
| `historical_record` | `historical_record` | 12 | 4958 | yes |
| `storage_event_id` | `storage_event_id` | 12 | 4958 | yes |
| `storage_sequence_id` | `storage_sequence_id` | 24 | 4946 | yes |
| `storage_observed_at_utc` | `storage_observed_at_utc` | 12 | 4958 | yes |
| `storage_persisted_at_utc` | `storage_persisted_at_utc` | 12 | 4958 | yes |
| `storage_format_observed_at_utc` | `envelope_schema`, `storage_format_observed_at_utc` | 48 | 4922 | yes |
| `storage_format_persisted_at_utc` | `envelope_schema`, `storage_format_persisted_at_utc` | 60 | 4910 | yes |
| `storage_receipt_issued` | `storage_receipt_issued` | 228 | 4742 | yes |
| `retry` | `retry` | 300 | 4670 | yes |
| `token_schema` | `digest_frontier`, `token_schema` | 48 | 4922 | yes |
| `token_schema` | `token_schema` | 12 | 4958 | yes |
| `token_observation` | `token_observation` | 12 | 4958 | yes |
| `snapshot` | `snapshot` | 60 | 4910 | yes |
| `token_storage` | `token_storage` | 12 | 4958 | yes |
| `token_source_identity` | `token_source_identity` | 12 | 4958 | yes |
| `token_key` | `token_key` | 12 | 4958 | yes |
| `token_ref` | `token_ref` | 12 | 4958 | yes |
| `token_dataset` | `token_dataset` | 12 | 4958 | yes |
| `reader_partition` | `reader_partition` | 12 | 4958 | yes |
| `reader_event_id` | `reader_event_id` | 12 | 4958 | yes |
| `reader_event_type` | `reader_event_type` | 12 | 4958 | yes |
| `reader_sequence_id` | `reader_sequence_id` | 84 | 4886 | yes |
| `digest_current_bytes_sha256` | `digest_current_bytes_sha256` | 12 | 4958 | yes |
| `digest_manifest_bytes_sha256` | `digest_manifest_bytes_sha256` | 12 | 4958 | yes |
| `digest_manifest_survivor_prefix_sha256` | `digest_manifest_survivor_prefix_sha256` | 12 | 4958 | yes |
| `digest_retained_inventory_sha256` | `digest_retained_inventory_sha256` | 12 | 4958 | yes |
| `digest_durable_watermarks_sha256` | `digest_durable_watermarks_sha256` | 12 | 4958 | yes |
| `digest_excluded_ranges_sha256` | `digest_excluded_ranges_sha256` | 12 | 4958 | yes |
| `digest_retired_inputs_sha256` | `digest_retired_inputs_sha256` | 12 | 4958 | yes |
| `selection_selected_segment_generation` | `selection_selected_segment_generation` | 12 | 4958 | yes |
| `selection_manifest_generation` | `selection_manifest_generation` | 12 | 4958 | yes |
| `selection_recovery_epoch` | `selection_recovery_epoch` | 12 | 4958 | yes |
| `digest_anchor` | `digest_anchor` | 12 | 4958 | yes |
| `digest_frontier` | `digest_frontier` | 12 | 4958 | yes |
| `digest_frontier` | `digest_frontier`, `token_schema` | 48 | 4922 | yes |
| `frontier_revision` | `frontier_revision` | 12 | 4958 | yes |
| `generation_identity` | `generation_identity` | 12 | 4958 | yes |
| `anchor_storage` | `anchor_storage` | 12 | 4958 | yes |
| `frontier_selection` | `frontier_selection` | 12 | 4958 | yes |
| `historical_authentic` | `historical_authentic` | 120 | 4850 | yes |
| `withdrawn` | `withdrawn` | 240 | 4730 | yes |
| `reader_withdrawn` | `reader_withdrawn` | 120 | 4850 | yes |
| `access` | `access` | 120 | 4850 | yes |
| `deleted_disclosure` | `deleted_disclosure` | 120 | 4850 | yes |
| `reader_effect` | `reader_effect` | 12 | 4958 | yes |
| `family_checkpoint` | `family_checkpoint` | 84 | 4886 | yes |
| `command_only_count` | `command_only_count` | 21 | 4949 | yes |
| `command_only_result` | `command_only_result` | 30 | 4940 | yes |
| `command_only_command` | `command_only_command` | 3 | 4967 | yes |
| `command_only_outcome` | `command_only_outcome` | 3 | 4967 | yes |
| `command_only_source_shape` | `command_only_source_shape` | 50 | 4920 | yes |
| `command_only_source_shape` | `command_only_source_shape`, `command_only_verified` | 52 | 4918 | yes |
| `command_only_delta` | `command_only_delta` | 3 | 4967 | yes |
| `command_only_verified` | `command_only_source_shape`, `command_only_verified` | 52 | 4918 | yes |
| `command_only_verified` | `command_only_verified` | 1 | 4969 | yes |

Duplicate sets concern the same defect: schema/size; scope/schema joins; schema/Storage timestamp syntax; source completeness plus payload fact dereferences; verify-state/no-event completeness; verify/pin transition plus exact fact/delta; and token hash syntax plus its commitment. Envelope/family schemas deliberately duplicate the inline-object type rule. No pair of unrelated rules is removed to excuse a masked negative. Source resolution is the existing prerequisite to record dereferences; a non-object payload has no payload fields to inspect, while both independent structural schemas still inspect and reject its original value. Unrelated predicates stay active throughout the proof. JSON lexical refusal uses the standard complete-input parser, before a scenario exists.

### Round 2 validation and evidence

| Check | Exit | Result |
|---|---:|---|
| Whole-lane checker | 0 | PASS 269 positives / 4970 negatives, 127 guards, all restored |
| Independent review regression driver | 0 | 1498 probes, no unexpected outcome |
| Memory completeness regression | 0 | 128 omissions refuse; both combined controls pass and omissions refuse |
| Numeric identity/payload recipe regression | 0 | 168 negatives refuse; eight codec cases |
| Size / failing CLI probes | 0 | six complete-root bounds; three expected exit-1 processes |
| Shard generate / check | 0 | top-level pass; only edited memory owner shards change |
| Index generate / validate | 0 | top-level pass |
| Browser Program semantics unittest | 0 | 10 tests pass |
| Browser admission checker | 0 | top-level pass |
| Browser admission unittest | 1 | 38 tests, exactly 30 pre-existing upstream40 failures |
| Coordination checker | 1 | exactly two unchanged baseline failures |
| Scope/protected/exclusion/citation checks; git diff --check | 0 | pass |

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/oracles.json` — SHA-256 `098c3e101979fc7f5b9106a138ee7cd7fadbe522cf8d715e17a985c9fbf52253`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/cycle2-independent-probes.json` — SHA-256 `1a8dad0cace630986457caf5cb49c1e13dff3407eb72bfd51f5c5204ba1f04ad`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/cycle2-memory-completeness.json` — SHA-256 `9fc990d9716cc123c7273ee3dcdcea44eea672126df6d1e4a0aaa9465eb48b15`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/cycle2-numeric-recipes.json` — SHA-256 `f5571add9e2cf2a7be1d993905705a924e162c04fae13c693a62f7e44a69319f`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/cycle2-size-and-cli.json` — SHA-256 `9a72af58afb154560e40c474ed356c13c9d85dbfc2bb0a7523fd0d4503d88bb0`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/scope-and-baseline.json` — SHA-256 `6c13a660809263e90a796f11f3cbb261525befb57d6e7693c8cbeee85c5a1841`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/currentness-copy.json` — SHA-256 `9b236515cb2a9b9ffc00b5c988addf5baa4a9b3fcc6e47acf6314ffa3532c4d8`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/type-sweep.json` — SHA-256 `a34f8893567a86e2affccf00e4d119fd821dc524440787087684023f9fb0fdc6`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/numeric-matrix.json` — SHA-256 `eb53cfd11c63fa42f61be73ace6785274c08aeb812dd8eb2f9797cb61b12830d`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/structural-applicability.json` — SHA-256 `59b51c2dd4b495e54d9c258282d77a4a6309bda3a8eea046c73990d724897afb`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/preserved-review-cases.json` — SHA-256 `423af03bfd258a32ba46980f4ae2ec8f36dd9142c39c427539b9e27942a6eed6`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/shards-generate.log` — SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/shards-check.log` — SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/index-generate.log` — SHA-256 `36b3a96d533b946d762ae0bde60500d6822254b1132c1b66d9ed144d61ead904`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/index-validate.log` — SHA-256 `397d68aa88a242ea0dd5af8b5fe6944003dc8210bbfdac70314dfa3c8efaa50b`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round2/build-fixtures.py` — SHA-256 `13ccb69b5909c6f52263c854b0e595d09588495ce731994814f024c73b52e95c`.

IDs reused, none minted: **SMPFS-244..248, CV-780..785, SP-760..765, AMS-130, ATS-380**. Existing UCC-084 and all eleven exclusion rows are preserved. No admission/registry/Decision Log/governance edit, main push, landing lock, subagent or product choice.


## Review round 3: findings and responses (historical; superseded by round 4)

Implementation `eb4c782f744151d6eaf99208415eb974e4c0d079` fixes the full cycle-three review against `585dc855196a4bb4fbc81ace71da46f8c9c3a71f`. Applied decisions are exactly **DL-405 / 2a A** and **DL-407 / 2c A**. Both Astra items 10 and 11 apply. No finding is disputed, no product question is stopped, and no new product policy, ID, admission or governance artifact is authored.

- **DCN-B6 — fixed** (`eb4c782f744151d6eaf99208415eb974e4c0d079`). `scripts/pm_card2_events.py:216` and AMS-130 validate all six claim facts on both immutable snapshots. **AMS-044 / section 5.3** define support as a subset of the gist version evidence_refs, scoped to what it establishes, with exact currentness `current | needs_revalidation | source_unavailable`; AMS-045 defines invalidation and preserves history. Every required nested omission and wrong type refuses on append/retry/history in both scopes and on no-event verification. Distinct claim identities, support membership/uniqueness, nonempty scope and exact enum values are checked. New Verified results require actual nonempty/current per-claim support plus genuine owner evaluation; optional gist summaries cannot substitute. The existing configured manual-only exception still works and cannot authorize automatic override, malformed facts or foreign support. Complete two-claim/currentness-change controls pass; removing currentness from both and reporting only verification_state refuses. No deterministic natural-language entailment is claimed.
- **DCN-B8 — fixed** (`eb4c782f744151d6eaf99208415eb974e4c0d079`). The cap originated in draft commit `66480989f15aa8bf48fbd6c2dd2017caadc26c50`, `Plans/card2_event_payloads.schema.json` (reviewed line 1488). Section 3.1/3.3 MemoryGist/EvidenceRef canon and Storage set no 16-reference limit. The draft-derived memory <=6144-byte claim in SP-765 was not an independent owner count policy and is replaced. The schema count cap is removed. Complete **16/17-reference** controls pass on all six scope/path combinations. Larger evidence lists use a closed **SP-337 collection reference**, not truncation: original Storage/server/scope/thread custody, actual pack bytes, BLAKE3, exact integer byte count, media type, canonical MessagePack array, durability and complete source equality are checked. A 2,000-pointer list and exact **16,384-inline / 16,385-referenced** boundaries pass for every path/scope; unexternalized large bodies refuse solely at inline_size. Referenced memory metadata is at most **2,057 bytes** at all field maxima. The whole inline ceiling stays **16 KiB**. No new gist limit, body store, retention choice or successor requirement is introduced.

Only AMS-130, SP-765 and their companions change. The five Browser semantic contracts, payload definitions, positive/negative fixtures and admission manifest remain unchanged. The shared anyOf full-match helper now visits array/object alternatives; this tightens validation, and all Browser suites were rerun. The eleven existing exclusion/application records and UCC-084 remain unchanged.

### Grades and the seven memory exclusions

| Family | Cycle-three review before | Round-3 self-grade after |
|---|---|---|
| browser.session.created | 11 PASS / 0 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| browser.session.state_changed | 11 PASS / 0 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| browser.session.closed | 11 PASS / 0 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| browser.session.promoted | 11 PASS / 0 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| browser.session.takeover_state_changed | 11 PASS / 0 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |
| memory.gist_state_changed | 7 PASS / 4 PARTIAL / 1 ABSENT | 11 PASS / 0 PARTIAL / 1 ABSENT |

The four memory upgrades are producer, closed_payload_schema, transitions and positive_negative_oracles. Every current grade quotation is checked against its exact owner unit. In my judgment the seven memory exclusions now satisfy DL-407 at **prepared static-contract depth**: requested/failed/unchanged verification retains only its command result; successful verify/edit/pin/unpin/discard and automatic changes have one complete state-change contract. Names: memory.gist.verification_requested, memory.gist.verified, memory.gist.verification_failed, memory.gist.updated, memory.gist.pinned, memory.gist.unpinned, memory.gist.discarded. No denominator removal or runtime/admission proof is claimed. Pinned answer and retention branches must integrate before admission.

### Standing checks 1–11 — round 3

| Check | Evidence and result |
|---|---|
| 1 | Current append/retry refuse replay-only; retained original policies remain independently readable. |
| 2 | CV-366 application identity is recomputed from exact server/operation UTF-8. |
| 3 | All Project positives use encoded project~ partitions; raw/foreign partitions refuse. |
| 4 | Uncapped evidence uses full-root 16 KiB measurement and SP-337 collection custody. Exact boundary/large-list controls and all-field reference-root maximum are tested; no separately persisted operation body is added. |
| 5 | Full-match checks now traverse the new union too; LF/representation negatives refuse. Source support references use full-match validation. |
| 6 | The unchanged RFC 8785 producer-semantic digest excludes assigned sequence/times; original/receipt custody remains exact. Frozen reference descriptors are included in that same semantic recipe. |
| 7 | Every checkpoint positive matches its event; all twelve coherent foreign checkpoint cases still flip solely with token_storage removed. |
| 8 | Actual failing CLI processes exit 1; a success exit fails the failure oracle. |
| 9 | Unvisited dangling refs in all three schemas fail eagerly before fixtures; all refs resolve normally. |
| 10 | Genuine retained policy/source history survives changed live subjects/stop generation, including replay-only; forged/withdrawn/access/deletion/foreign sources refuse. Nested source structure is mandatory, independently of live state. |
| 11 | Entire lane actual callable removal/restoration, one guard or named duplicate set at a time; all other predicates run. All old 4,970 cases remain isolated. New cases are built from valid controls with truthful deltas and coherent copies. |

### What Astra keeps finding — all eleven classes for memory

| Class | Mutation and ruling |
|---|---|
| 1 Forged/contradictory inputs | Fresh forged original IDs and foreign original subjects refuse on all paths/scopes. Nested incomplete support, foreign support subsets and noncurrent Verified claims now refuse; original/key/hash recipes still recompute from genuine sources. Pack IDs hash actual raw bytes rather than trusted copies. |
| 2 Payload-trusted Storage metadata | Fresh receipt-time contradictions refuse on retry/history. Valid candidate assigned metadata remains outside semantic comparison; original/receipt authenticity and exact types remain mandatory. Pack durability/authenticity also refuse string/number aliases. |
| 3 History wrong either way | Fresh history controls accept all four original policy forms after live subject disappearance/stale stop. Forged/foreign/withdrawn/access/deletion inputs refuse. Historical original admission never receives current-writer rules; old noncurrent before facts do not become current support. |
| 4 One field read two ways | Full-match identifiers/hashes refuse integer, case, whitespace and LF aliases. Exact-type source values are never coerced; reference bytes are decoded uniformly and must reencode canonically. Semantic numeric equality stays RFC 8785; custody stays strict. |
| 5 Unvisited dangling refs | Three actual CLI injections in unvisited definitions fail with exit 1. Eager traversal is unchanged. |
| 6 Size only part of value | The original 16-count cap is removed. The complete metadata root is measured, not only its ref. 16,384/16,385-byte and 2,000-reference controls prove the route. All-property referenced metadata is <=2,057 bytes; its external collection is intentionally larger. No hidden operation body or new checkpoint exists, and the contradictory SP-765 small-body/successor-only sentence is removed. |
| 7 Missing custody path | All six path/scope combinations reject original record subject contradictions and pack authenticity/durability/scope/digest/size/media/encoding/resolution defects. Genuine but different resolved collections fail full source equality. Missing pack resolution never authorizes a mutation, retry result or disclosure. |
| 8 Masked negatives | Full whole-lane guard proof below. Observational event/Storage/original copies and exact deltas are coherent. Every unrelated negative retains its remaining intended failure set. Only named same-value schema/codec duplicates are removed together; no composite bypass or guard is left weakened. |
| 9 Grade overclaim | Memory starts at independent 7/4/1 and upgrades only after B6/B8 defect controls, valid-domain controls and full removal proof pass. Membership ABSENT and native NOT_RUN remain explicit. Index baseline failures below are reported, not called PASS. |
| 10 Numbers two ways | Full regression numeric recipes and fresh memory retry controls cover 1/1.0/1e0 and signed/decimal/exponent zero; leading-zero JSON refuses parsing. BLAKE3 inputs are canonical pointer-array bytes; reference byte counts require exact integers (including a float-equal-count negative). No alternate reference identity is accepted for noncanonical bytes. |
| 11 Types confused | Both snapshots, every required claim field and both claim positions get isolated omission/type tests, including string booleans/numbers, null, arrays, objects and numeric bool/int aliases. Fresh scope-array/object probes refuse. No-event claims are equally checked. Collection size/media/pack bytes and authenticity/durability types refuse malformed forms. |

### Guard-removal table — round 3

**PASS: 317 positives / 6785 negatives / 129 guards / 141 unique removal sets; every removal restored, zero proof errors.** Plus 36 full-JSON parser refusals. The checker replaces actual GUARDS callables and rechecks every negative before, during and after each removal. Full flipping/still-rejected IDs are in the pinned oracles.json; the self-grade keeps flipping IDs and its hash-pinned complete remaining list.

New intentional duplicate sets concern the **same malformed descriptor value**: payload_schema plus memory_evidence_custody for invalid size/media, and inline_size plus memory_evidence_custody for a float byte count that the physical MessagePack codec also refuses. Existing named duplicates are preserved. Source/pack resolution is only an applicability prerequisite for dereferencing unavailable values; unrelated guards still execute. Invalid source fields are never repaired with defaults.

| Guard or named duplicate set | Negatives that flip | Others still reject | Restored |
|---|---:|---:|---|
| `scenario_path` | 12 | 6773 | yes |
| `scenario_shape` | 12 | 6773 | yes |
| `envelope_schema` | 36 | 6749 | yes |
| `envelope_schema`, `payload_schema` | 108 | 6677 | yes |
| `envelope_schema`, `scope_project_id` | 48 | 6737 | yes |
| `envelope_schema`, `storage_format_observed_at_utc` | 48 | 6737 | yes |
| `envelope_schema`, `storage_format_persisted_at_utc` | 60 | 6725 | yes |
| `inline_size`, `payload_schema` | 30 | 6755 | yes |
| `memory_evidence_custody`, `payload_schema` | 282 | 6503 | yes |
| `payload_schema` | 12 | 6773 | yes |
| `payload_fullmatch` | 12 | 6773 | yes |
| `inline_size` | 6 | 6779 | yes |
| `inline_size`, `memory_evidence_custody` | 204 | 6581 | yes |
| `inline_reference` | 12 | 6773 | yes |
| `scope_scope_kind`, `source_scope_kind` | 24 | 6761 | yes |
| `scope_project_id` | 6 | 6779 | yes |
| `scope_thread_id` | 12 | 6773 | yes |
| `scope_schema` | 12 | 6773 | yes |
| `scope_partition` | 12 | 6773 | yes |
| `private_thread` | 1 | 6784 | yes |
| `source_storage_instance_id` | 12 | 6773 | yes |
| `source_server_id` | 12 | 6773 | yes |
| `source_computer_id` | 12 | 6773 | yes |
| `source_thread_id` | 12 | 6773 | yes |
| `source_project_id` | 12 | 6773 | yes |
| `source_scope_kind` | 12 | 6773 | yes |
| `lineage_shape` | 12 | 6773 | yes |
| `lineage_run_id` | 12 | 6773 | yes |
| `lineage_node_id` | 12 | 6773 | yes |
| `lineage_attempt_id` | 12 | 6773 | yes |
| `source_owner_operation_id` | 12 | 6773 | yes |
| `source_owner_change_id` | 12 | 6773 | yes |
| `source_revision_before` | 10 | 6775 | yes |
| `source_revision_after` | 12 | 6773 | yes |
| `source_before_record_ref` | 10 | 6775 | yes |
| `source_after_record_ref` | 12 | 6773 | yes |
| `source_subject` | 12 | 6773 | yes |
| `source_workspace` | 10 | 6775 | yes |
| `source_authentic` | 360 | 6425 | yes |
| `source_committed` | 336 | 6449 | yes |
| `current_stop` | 228 | 6557 | yes |
| `record_resolution` | 12 | 6773 | yes |
| `record_subject_id` | 12 | 6773 | yes |
| `record_storage_instance_id` | 12 | 6773 | yes |
| `record_server_id` | 12 | 6773 | yes |
| `record_computer_id` | 12 | 6773 | yes |
| `record_project_id` | 12 | 6773 | yes |
| `record_thread_id` | 12 | 6773 | yes |
| `record_scope_kind` | 12 | 6773 | yes |
| `record_run_id` | 12 | 6773 | yes |
| `record_node_id` | 12 | 6773 | yes |
| `record_attempt_id` | 12 | 6773 | yes |
| `record_revision` | 12 | 6773 | yes |
| `record_ref` | 36 | 6749 | yes |
| `record_workspace` | 10 | 6775 | yes |
| `command_source` | 12 | 6773 | yes |
| `memory_command` | 1 | 6784 | yes |
| `revision_step` | 12 | 6773 | yes |
| `real_change` | 336 | 6449 | yes |
| `memory_delta`, `transition` | 68 | 6717 | yes |
| `memory_fact_verification_state`, `transition` | 50 | 6735 | yes |
| `transition` | 48 | 6737 | yes |
| `verification_support` | 44 | 6741 | yes |
| `memory_evidence_custody` | 192 | 6593 | yes |
| `memory_verified_claims` | 18 | 6767 | yes |
| `memory_fact_evidence_refs`, `memory_source_shape` | 1470 | 5315 | yes |
| `memory_fact_pinned`, `memory_fact_previous_pinned`, `memory_source_shape` | 1466 | 5319 | yes |
| `memory_fact_previous_verification_state`, `memory_fact_verification_state`, `memory_source_shape` | 1464 | 5321 | yes |
| `memory_fact_source`, `memory_source_shape` | 1464 | 5321 | yes |
| `memory_source_shape` | 1460 | 5325 | yes |
| `memory_delta` | 16 | 6769 | yes |
| `memory_fact_previous_pinned` | 2 | 6783 | yes |
| `memory_fact_pinned` | 2 | 6783 | yes |
| `memory_fact_previous_verification_state` | 2 | 6783 | yes |
| `memory_fact_source` | 2 | 6783 | yes |
| `memory_fact_evidence_refs` | 8 | 6777 | yes |
| `browser_fact_previous_session_class` | 8 | 6777 | yes |
| `browser_fact_session_class` | 10 | 6775 | yes |
| `browser_fact_previous_takeover_state` | 8 | 6777 | yes |
| `browser_fact_takeover_state` | 10 | 6775 | yes |
| `browser_fact_previous_lifecycle_state` | 8 | 6777 | yes |
| `browser_fact_lifecycle_state` | 10 | 6775 | yes |
| `browser_delta` | 8 | 6777 | yes |
| `double_record` | 84 | 6701 | yes |
| `replay_only` | 48 | 6737 | yes |
| `idempotency` | 12 | 6773 | yes |
| `event_identity` | 24 | 6761 | yes |
| `first_receipt` | 228 | 6557 | yes |
| `storage_authentic` | 240 | 6545 | yes |
| `original_record` | 72 | 6713 | yes |
| `historical_record` | 12 | 6773 | yes |
| `storage_event_id` | 12 | 6773 | yes |
| `storage_sequence_id` | 24 | 6761 | yes |
| `storage_observed_at_utc` | 12 | 6773 | yes |
| `storage_persisted_at_utc` | 12 | 6773 | yes |
| `storage_receipt_issued` | 228 | 6557 | yes |
| `retry` | 300 | 6485 | yes |
| `digest_frontier`, `token_schema` | 48 | 6737 | yes |
| `token_schema` | 12 | 6773 | yes |
| `token_observation` | 12 | 6773 | yes |
| `snapshot` | 60 | 6725 | yes |
| `token_storage` | 12 | 6773 | yes |
| `token_source_identity` | 12 | 6773 | yes |
| `token_key` | 12 | 6773 | yes |
| `token_ref` | 12 | 6773 | yes |
| `token_dataset` | 12 | 6773 | yes |
| `reader_partition` | 12 | 6773 | yes |
| `reader_event_id` | 12 | 6773 | yes |
| `reader_event_type` | 12 | 6773 | yes |
| `reader_sequence_id` | 84 | 6701 | yes |
| `digest_current_bytes_sha256` | 12 | 6773 | yes |
| `digest_manifest_bytes_sha256` | 12 | 6773 | yes |
| `digest_manifest_survivor_prefix_sha256` | 12 | 6773 | yes |
| `digest_retained_inventory_sha256` | 12 | 6773 | yes |
| `digest_durable_watermarks_sha256` | 12 | 6773 | yes |
| `digest_excluded_ranges_sha256` | 12 | 6773 | yes |
| `digest_retired_inputs_sha256` | 12 | 6773 | yes |
| `selection_selected_segment_generation` | 12 | 6773 | yes |
| `selection_manifest_generation` | 12 | 6773 | yes |
| `selection_recovery_epoch` | 12 | 6773 | yes |
| `digest_anchor` | 12 | 6773 | yes |
| `digest_frontier` | 12 | 6773 | yes |
| `frontier_revision` | 12 | 6773 | yes |
| `generation_identity` | 12 | 6773 | yes |
| `anchor_storage` | 12 | 6773 | yes |
| `frontier_selection` | 12 | 6773 | yes |
| `historical_authentic` | 120 | 6665 | yes |
| `withdrawn` | 240 | 6545 | yes |
| `reader_withdrawn` | 120 | 6665 | yes |
| `access` | 120 | 6665 | yes |
| `deleted_disclosure` | 120 | 6665 | yes |
| `reader_effect` | 12 | 6773 | yes |
| `family_checkpoint` | 84 | 6701 | yes |
| `command_only_count` | 21 | 6764 | yes |
| `command_only_result` | 30 | 6755 | yes |
| `command_only_command` | 3 | 6782 | yes |
| `command_only_outcome` | 3 | 6782 | yes |
| `command_only_source_shape` | 209 | 6576 | yes |
| `command_only_source_shape`, `command_only_verified` | 211 | 6574 | yes |
| `command_only_delta` | 3 | 6782 | yes |
| `command_only_verified` | 1 | 6784 | yes |

### Validation and limits — round 3

| Check | Exit / result |
|---|---|
| Whole-lane full guard proof | 0 / PASS, counts above |
| Extended review regressions | 0 / 6,090 probes, zero unexpected outcomes |
| Prior review regressions | 0 / 1,620 probes, zero unexpected outcomes |
| Required-memory completeness regression | 0 / 48 operation bases, zero accepted incomplete sources; combined controls pass and omissions refuse |
| Numeric recipes | 0 / 168 per-family negatives and eight codec cases, all expected |
| Fresh memory class probes | 0 / 49 expected outcomes |
| Size and failing CLI probes | 0 / six all-property bounds and three expected exit-1 CLI processes |
| Shard generate/check | 0 / top-level pass; changed shard owners only assistant-memory-subsystem and storage-plan |
| Index generate | 0 / top-level pass |
| Index validate | 1 / top-level fail: exactly 22 pre-existing removal-gate failures against newer origin/main; coverage pass; readiness blocked_runtime_certification_incomplete |
| Browser semantics | 0 / ten tests pass |
| Browser admission checker | 0 / PASS, 53 positives / 576 negatives |
| Browser admission unittest | 1 / 38 tests, exactly 30 known upstream40 failures |
| Coordination checker | 1 / exactly its two unchanged baseline failures |
| Baseline/scope/grade citations and git diff --check | 0 / PASS |

The index failure is reproduced with the unmodified starting-head index against the same current origin/main: missing newer DL-302 invokes the existing removal-ledger gate, which reports twenty-one unchanged ledger-format errors plus that missing unit. The implementation adds/removes no PlanUnit and edits none of those inputs. It is not repaired or hidden by moving origin/main, substituting a passing baseline, changing validators or editing another lane. The branch stays at its requested ancestry. Browser input hashes and unchanged schemas/fixtures are recorded in baseline-witness.json. Native execution remains NOT_RUN.

Resources: preflight 10 GB available RAM / 92 GB disk; later samples remained at least 8 GB RAM / 88 GB disk. Sparse local worktree, fifteen copied currentness files SHA-256 matched before generation. No pm-mail, subagent, admission, registry/Decision Log append, main push, landing lock or reseal. No IDs minted; reused **SMPFS-244..248, CV-780..785, SP-760..765, AMS-130, ATS-380**. Worktree cleanup follows the pushed report commit.

### Round-3 evidence (paths plus SHA-256)

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/oracles.json` — SHA-256 `425628f85bf9826fb87549fee2da282c061efa92cc75c92151e120b9ed13a8c2`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/regression-extended-probes.json` — SHA-256 `d0e973313868c2959505a9cc3dbe0b446d83321c9b8bbbd0d0064a7eea09ff3f`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/regression-independent-probes.json` — SHA-256 `2e519dd5853368de8aec05f59773080da41be25511cbb8544d61b1a14f9e6811`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/regression-memory-completeness.json` — SHA-256 `5afe3f4b71edad61cd54d4cec82f6827dc4b2d30bfe96627e1a25bbfcfeca58c`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/regression-numeric-recipes.json` — SHA-256 `135b466b802f67989524e2fc81936cab55f5ef82a685d8c302e01654e845a014`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/memory-class-probes.json` — SHA-256 `ed8607bf547bc465429a986362c1f051d4c141bc4c5ac929f2fad81ddf68e0b8`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/regression-size-and-cli.json` — SHA-256 `f473d34f37543633c7aef9ab8f6fa69dfe96d3dc2a2a5d47ab37c56e1136b545`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/evidence-size-cases.json` — SHA-256 `928b8e641ae460f4821ed545397cb79ca78642f63dd88c439a4bbfcb3326d206`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/baseline-witness.json` — SHA-256 `e4748d3eb86041b215f129d9b33d77011a1739b5580275ab5319a11fe121d179`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/source-domain-search.json` — SHA-256 `51b1beb9e6c27c52c7ec9d5e60d075664fdd46fb56bc97286afcf6f5e95ffb6e`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/currentness-copy.json` — SHA-256 `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/shards-generate.log` — SHA-256 `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/shards-check.log` — SHA-256 `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/index-generate.log` — SHA-256 `5d11561152bf638c3af3324f6c3a1b7fbd66e76819a8cb73c1cab8c245a1f46f`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/index-validate.log` — SHA-256 `d26ae005e95d918b45f36203ae2a665763eeb188dbf6477512802485f177652f`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/browser-semantics.log` — SHA-256 `3f00542a994b3090378a811bb0f5e17a31a8c3593df158f21bf3e04a841c4d60`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/browser-admission.log` — SHA-256 `c8c8a795d92bc4f9cfc05125a85b541b54b21af920bb359a4a6d172aaab7cf65`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/browser-admission-tests.log` — SHA-256 `f40ab592db030b25235403d3a30d9b6c89797b2d1f65a9694c41a842155ec1a4`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/coordination.log` — SHA-256 `a7a906d97e05afa3eec03aded40a2428d67c353bc3292400bddad104e8584b8d`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/build-fixtures.py` — SHA-256 `95d0bd073d3b42bd7b22535aef07be4dac53d7a2f5e43361cde7ef4ef951591a`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/scope-audit.json` — SHA-256 `afa066224462c3b2638004e242928f4c78dbc0c5754297929e64ef3486648d95`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/unit-and-dependency-audit.json` — SHA-256 `9fa54629da64a50df9143bd7038b096a01591edff512624d15aa871630590e3a`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix-round3/oracle-inputs.json` — SHA-256 `1227daa9378aa02b5568d90a07237fbbc26d4affd1eb4b98d17f82598d7c132a`.


## Review round 4: findings and responses

Reviewed starting head: `ddd4e74e2707d4d225bf7c7bf1668d418cbc75dc`. Final implementation: `de58b6e10c11ab249ec05f13a2bbbdd6f2f92f4b`. The report-only successor changes the report, check summary and self-grade; its checked script/schema/fixture inputs are identical. The final pushed head and input verification are retained in `fix4/final-head.json`. This section supersedes all older round results and retirement-completeness claims above. The round implements exactly **DL-405 / 2a A** and **DL-407 / 2c A**. Membership remains **ABSENT**, native execution **NOT_RUN**.

- **B3 — fixed**, commits `a681b17257cee6f1ead2124f81cea378cb87600d` and `aa07a2fcbeab5d07e44d8208bf95fb27ce20843d`; final locations `scripts/pm_card2_events.py:229`, `:253`, `:275`, `:546` and `Plans/card2_event_fixtures.json`. The complete original session facts are checked against Storage's existing `browser_session_state.v1` required fields and exact types (`Plans/storage-plan.md:1189–1213`). Identity/scope/subject/workspace remain independently joined in record metadata. Both original snapshots are checked on append, retry and history, before state facts are used. Booleans require actual booleans; dimensions require actual integers; scroll coordinates and zoom require numbers, excluding booleans. Arrays contain strings; original enums and required nullable slots retain their owner domains. No source default or coercion repairs a malformed/missing value; nullable slots must also be present. All positive Browser viewport stand-ins are typed records. Commit `7b7bdd78a8` completes the nullable peer slots in session-class omission fixtures. Isolated negatives change one source field in one original record and synchronize the exact delta and all event observations. Nullable slot values and genuine retained replay policies remain positive controls after live replacement and stale stop state.
- **S1 — fixed in this report commit** (`reports/event-authority-20261104/DCN-checks.json` and `DCN-self-grade.json`). The summary and all six oracle cells identify the final round-4 implementation/run, current counts, removal proof, source hashes and actual index validation result. No round-2 success is presented as current evidence. Index failures are reported with their actual exit, top-level status and origin/main pin.

**Check-11 repairs:** the 03:56Z definition applies. Several older tests coupled a schema length violation with byte size, scope joins with an unrelated source join, or source-shape omissions with join exceptions. These are rebuilt as isolated cases; original inputs are independently rerun as refusal regressions. Memory fact joins and unchanged-verify checks now dereference only present values in their declared domain; the mandatory original source-shape guard still refuses every malformed or missing value. No accepted input domain is enlarged. Newly typed Browser controls also exposed stale viewport deltas in older transition negatives, which are repaired. The complete retained original suite is checked again, with no accepted original negative.

**Duplicate proof:** the remaining duplicate sets are exactly the same field/predicate: inline payload is an object; original observed/persisted timestamp format; evidence descriptor media_type equals the owner's constant. The additional predicate proof cuts each individual site alone and then all sites. Schema mutations remove only the relevant `type`, `format` or `const`; the custody mutation removes only the `media_type` comparison using an AST cut and leaves all peer clauses active. Broad schema or custody function removal is not the proof of these duplicates. All other negatives are rechecked for their remaining intended refusal and every predicate is restored. The full table and exact flipping/still-rejected IDs are retained below and in the hash-pinned proof files.

Commit `9f06b6637914a718b4e091ce4bfa4005e83e824e` caches only derived bytes/digests/deltas for immutable proof inputs. The new cache never memoizes a GUARDS result; every actual guard still executes during removal/restoration, caches clear on return or exception, and the independent predicate-cut proof runs with these proof caches disabled. Each row restores the exact callable, the next row rechecks all negatives, and a final full negative pass verifies the complete restored guard set. Checks run one family at a time.

### Sweep items — deliberately left for the shared rule

| Item | Location | Required cross-lane follow-up |
|---|---|---|
| **B1** | `scripts/pm_card2_events.py:462` (`semantic_digest`), retry predicate; CV-780..785; mutable revision fields in `Plans/card2_event_payloads.schema.json` | Accepted integers at/beyond 2^53 can exceed the RFC 8785 integer domain. Align append/retry/history with the authenticated write-time recipe through CV-1100/SP-1100/SP-1101. Do not add a DCN cap or serializer. |
| **B2** | Original envelope/receipt predicates in `scripts/pm_card2_events.py`; `Plans/storage-plan.md:436` (`sequence_id: u64`) | Enforce Storage u64 and its representation rule for `1.0`, `1e0`, `-0.0` and boundary values, without capping u64 at 2^53 or moving assigned metadata into semantic retry hashing. |
| **Browser numeric ranges** | `scripts/pm_card2_events.py:253`; `Plans/storage-plan.md:1208–1210` | Adopt u32 dimensions and f64 zoom/physical-number rules through the shared sweep. This round validates exact types only; it adds no numeric cap/range, serializer, float normalization or signed-zero erasure. |
| **SW1** | `scripts/pm_card2_events.py:60`, FormatChecker and envelope validation; retained original paths | Retained lowercase RFC 3339 timestamps require authenticated write-time recipe selection. Preserve genuine originals and refuse forged weaker-edition selection; do not simply loosen current writers. |

The shared owner rule is on `plans/ea-numrule-20261105`, **CV-1100, SP-1100, SP-1101**. These are sweep items, not disputed findings and not new lane-local blocking work. The witness records that the gaps remain; no PASS is inferred from their deferral.

### Six-family re-grade and eleven exclusions

| Family | Astra before (PASS / PARTIAL / ABSENT) | Round 4 after |
|---|---|---|
| `browser.session.created` | 8 / 3 / 1 | 7 / 4 / 1 |
| `browser.session.state_changed` | 7 / 4 / 1 | 6 / 5 / 1 |
| `browser.session.closed` | 7 / 4 / 1 | 6 / 5 / 1 |
| `browser.session.promoted` | 7 / 4 / 1 | 6 / 5 / 1 |
| `browser.session.takeover_state_changed` | 7 / 4 / 1 | 6 / 5 / 1 |
| `memory.gist_state_changed` | 7 / 4 / 1 | 6 / 5 / 1 |

All 72 cells are regraded against exact current owner quotations. B3 is fixed, while B1/B2 continue to limit the same replay/custody/oracle cells and mutable-payload cells Astra identified. SW1 now applies to round 4, so compatibility_withdrawal is PARTIAL in each family until authenticated historical recipe selection exists. This is a disclosed sweep gap, not a newly invented product decision. Four exclusions hold independently (`browser.session.navigated`, `browser.session.resized`, `dashboard.widget_added`, `coordination.debug_mirror_exported`). The seven memory exclusions remain conditional on the complete surviving contract after the mandatory sweep; their application/census/worker-union records are unchanged. No admission or denominator removal is claimed.

### What Astra keeps finding — current round

| Class | Current evidence / qualification |
|---|---|
| 1 Forged/contradictory inputs | Fresh coherently copied forged IDs and original-source authenticity mutations refuse for each family/scope/path. Original identity/lineage/source/frontier tests remain refusals. Numeric-domain custody remains B2. |
| 2 Storage metadata | Fresh receipt-sequence contradictions refuse against the actual Storage record; assigned metadata stays outside semantic retry hashing. Coherent out-of-domain metadata remains B2. |
| 3 History in either direction | Retained policies and required nullable source-slot values survive changed live state/stop generation. Forgery, withdrawal and access/deletion regressions refuse. SW1 stays open. |
| 4 One field read two ways | New Browser fields use exact types and strict observed-state equality; string booleans/numbers and containers refuse. Sequence representation is deferred as B2. |
| 5 Unvisited unresolved references | Each of all three loaded schemas gets an unused dangling-ref injection in a failing subprocess, before fixture selection. |
| 6 Full-value size limits | Existing whole-inline and SP-337 pack controls and original byte/custody regressions rerun; this round creates no operation value, store or serializer. |
| 7 Custody every path | Complete original Browser facts and fresh B3 defects are tested on append/retry/history, both scopes and both original snapshots. |
| 8 Masked negatives | Whole-lane removal/restoration plus predicate-specific duplicate-site proof; all observational copies and exact deltas are synchronized. Rebuilt cases are listed separately. |
| 9 Grade overclaim | All oracle cells describe the current run and remain PARTIAL because sweep gaps still exist. Actual index failure is retained. Native NOT_RUN and admission ABSENT. |
| 10 Number forms/domains | Fresh B1/B2 witnesses reproduce the known gaps, with no local numeric rule. Mandatory shared sweep owns closure. |
| 11 Exact types | Complete-path B3 matrix includes missing fields, string booleans/numbers, null, arrays, objects, bool/int aliases, list members and nested dimensions/coordinates. |
| 12 Formats | Fresh missing-zone/separator/calendar/leap-second/offset/LF cases refuse; eager date-time enforcement is active. |
| 10a Historical recipe | Fresh lowercase RFC 3339 retained originals reproduce SW1; compatibility is graded PARTIAL rather than falsely certified. |

No pm-mail, subagent, admission, registry append, Decision Log entry, main push, landing lock, reseal, numeric-policy choice or new PlanUnit ID. IDs reused: **SMPFS-244..248, CV-780..785, SP-760..765, AMS-130, ATS-380**; existing UCC-084 companion changes are retained. The only code/fixture edits in round 4 are `scripts/pm_card2_events.py` and `Plans/card2_event_fixtures.json`; no Plans Markdown owner changed, so no owner shards/index are regenerated. Read-only shard and index checks are recorded below. The sparse VM worktree is removed by literal path after the branch/report push.


### Validation and guard-removal table — round 4

**Oracle PASS: 343 positive/no-event controls, 16343 isolated negatives, 154 guards, 162 aggregated guard/removal rows, 158 unique removal sets, 814 actually executed per-family rows; all restored, zero errors.** The separate field/predicate duplicate proof executes 57 rows. Distinct parser refusals: 36. The six independent family runs partition the suite; family-specific tables retain their actual flipping/still-rejected IDs. The union table includes every original checker guard; no unproved guard is omitted.

| Family | Positive/no-event | Negative | Exit |
|---|---:|---:|---:|
| `browser.session.closed` | 44 | 2900 | 0 |
| `browser.session.created` | 44 | 1826 | 0 |
| `browser.session.promoted` | 44 | 2900 | 0 |
| `browser.session.state_changed` | 44 | 2898 | 0 |
| `browser.session.takeover_state_changed` | 44 | 2900 | 0 |
| `memory.gist_state_changed` | 123 | 2919 | 0 |

| Guard | Removed sites | Negatives that flip | Others still reject | Restored |
|---|---|---:|---:|---|
| `access` | `access` | 120 | 16223 | yes |
| `anchor_storage` | `anchor_storage` | 12 | 16331 | yes |
| `browser_delta` | `browser_delta` | 8 | 16335 | yes |
| `browser_fact_lifecycle_state` | `browser_fact_lifecycle_state` | 8 | 16335 | yes |
| `browser_fact_previous_lifecycle_state` | `browser_fact_previous_lifecycle_state` | 6 | 16337 | yes |
| `browser_fact_previous_session_class` | `browser_fact_previous_session_class` | 8 | 16335 | yes |
| `browser_fact_previous_takeover_state` | `browser_fact_previous_takeover_state` | 8 | 16335 | yes |
| `browser_fact_session_class` | `browser_fact_session_class` | 10 | 16333 | yes |
| `browser_fact_takeover_state` | `browser_fact_takeover_state` | 10 | 16333 | yes |
| `browser_source_blocked_actions` | `browser_source_blocked_actions` | 432 | 15911 | yes |
| `browser_source_capability_degradations` | `browser_source_capability_degradations` | 432 | 15911 | yes |
| `browser_source_dev_tools_open` | `browser_source_dev_tools_open` | 378 | 15965 | yes |
| `browser_source_effective_browser_runtime` | `browser_source_effective_browser_runtime` | 378 | 15965 | yes |
| `browser_source_effective_capabilities` | `browser_source_effective_capabilities` | 432 | 15911 | yes |
| `browser_source_last_error` | `browser_source_last_error` | 324 | 16019 | yes |
| `browser_source_lifecycle_state` | `browser_source_lifecycle_state` | 436 | 15907 | yes |
| `browser_source_object` | `browser_source_object` | 324 | 16019 | yes |
| `browser_source_permission_tier` | `browser_source_permission_tier` | 432 | 15911 | yes |
| `browser_source_preview_subject_id` | `browser_source_preview_subject_id` | 324 | 16019 | yes |
| `browser_source_profile_scope` | `browser_source_profile_scope` | 378 | 15965 | yes |
| `browser_source_requested_browser_runtime` | `browser_source_requested_browser_runtime` | 378 | 15965 | yes |
| `browser_source_requested_capabilities` | `browser_source_requested_capabilities` | 432 | 15911 | yes |
| `browser_source_restore_policy` | `browser_source_restore_policy` | 432 | 15911 | yes |
| `browser_source_scroll_position` | `browser_source_scroll_position` | 378 | 15965 | yes |
| `browser_source_scroll_position.x` | `browser_source_scroll_position.x` | 324 | 16019 | yes |
| `browser_source_scroll_position.y` | `browser_source_scroll_position.y` | 324 | 16019 | yes |
| `browser_source_session_class` | `browser_source_session_class` | 432 | 15911 | yes |
| `browser_source_takeover_state` | `browser_source_takeover_state` | 432 | 15911 | yes |
| `browser_source_url` | `browser_source_url` | 378 | 15965 | yes |
| `browser_source_viewport` | `browser_source_viewport` | 378 | 15965 | yes |
| `browser_source_viewport.height` | `browser_source_viewport.height` | 378 | 15965 | yes |
| `browser_source_viewport.width` | `browser_source_viewport.width` | 378 | 15965 | yes |
| `browser_source_workspace_tab_id` | `browser_source_workspace_tab_id` | 324 | 16019 | yes |
| `browser_source_zoom_level` | `browser_source_zoom_level` | 324 | 16019 | yes |
| `command_only_command` | `command_only_command` | 3 | 16340 | yes |
| `command_only_count` | `command_only_count` | 21 | 16322 | yes |
| `command_only_delta` | `command_only_delta` | 3 | 16340 | yes |
| `command_only_outcome` | `command_only_outcome` | 3 | 16340 | yes |
| `command_only_result` | `command_only_result` | 30 | 16313 | yes |
| `command_only_source_shape` | `command_only_source_shape` | 210 | 16133 | yes |
| `command_only_verified` | `command_only_verified` | 1 | 16342 | yes |
| `command_source` | `command_source` | 12 | 16331 | yes |
| `current_stop` | `current_stop` | 228 | 16115 | yes |
| `deleted_disclosure` | `deleted_disclosure` | 120 | 16223 | yes |
| `digest_anchor` | `digest_anchor` | 12 | 16331 | yes |
| `digest_current_bytes_sha256` | `digest_current_bytes_sha256` | 12 | 16331 | yes |
| `digest_durable_watermarks_sha256` | `digest_durable_watermarks_sha256` | 12 | 16331 | yes |
| `digest_excluded_ranges_sha256` | `digest_excluded_ranges_sha256` | 12 | 16331 | yes |
| `digest_frontier` | `digest_frontier` | 36 | 16307 | yes |
| `digest_manifest_bytes_sha256` | `digest_manifest_bytes_sha256` | 12 | 16331 | yes |
| `digest_manifest_survivor_prefix_sha256` | `digest_manifest_survivor_prefix_sha256` | 12 | 16331 | yes |
| `digest_retained_inventory_sha256` | `digest_retained_inventory_sha256` | 12 | 16331 | yes |
| `digest_retired_inputs_sha256` | `digest_retired_inputs_sha256` | 12 | 16331 | yes |
| `double_record` | `double_record` | 84 | 16259 | yes |
| `envelope_schema` | `envelope_schema` | 36 | 16307 | yes |
| `envelope_schema` | `envelope_schema`, `payload_schema` | 120 | 16223 | yes |
| `envelope_schema` | `envelope_schema`, `storage_format_observed_at_utc` | 48 | 16295 | yes |
| `envelope_schema` | `envelope_schema`, `storage_format_persisted_at_utc` | 60 | 16283 | yes |
| `event_identity` | `event_identity` | 24 | 16319 | yes |
| `family_checkpoint` | `family_checkpoint` | 84 | 16259 | yes |
| `first_receipt` | `first_receipt` | 228 | 16115 | yes |
| `frontier_revision` | `frontier_revision` | 12 | 16331 | yes |
| `frontier_selection` | `frontier_selection` | 12 | 16331 | yes |
| `generation_identity` | `generation_identity` | 12 | 16331 | yes |
| `historical_authentic` | `historical_authentic` | 120 | 16223 | yes |
| `historical_record` | `historical_record` | 12 | 16331 | yes |
| `idempotency` | `idempotency` | 12 | 16331 | yes |
| `inline_reference` | `inline_reference` | 12 | 16331 | yes |
| `inline_size` | `inline_size` | 6 | 16337 | yes |
| `lineage_attempt_id` | `lineage_attempt_id` | 12 | 16331 | yes |
| `lineage_node_id` | `lineage_node_id` | 12 | 16331 | yes |
| `lineage_run_id` | `lineage_run_id` | 12 | 16331 | yes |
| `lineage_shape` | `lineage_shape` | 12 | 16331 | yes |
| `memory_command` | `memory_command` | 1 | 16342 | yes |
| `memory_delta` | `memory_delta` | 20 | 16323 | yes |
| `memory_evidence_custody` | `memory_evidence_custody` | 228 | 16115 | yes |
| `memory_evidence_custody` | `memory_evidence_custody`, `payload_schema` | 280 | 16063 | yes |
| `memory_fact_evidence_refs` | `memory_fact_evidence_refs` | 8 | 16335 | yes |
| `memory_fact_pinned` | `memory_fact_pinned` | 2 | 16341 | yes |
| `memory_fact_previous_pinned` | `memory_fact_previous_pinned` | 2 | 16341 | yes |
| `memory_fact_previous_verification_state` | `memory_fact_previous_verification_state` | 2 | 16341 | yes |
| `memory_fact_source` | `memory_fact_source` | 2 | 16341 | yes |
| `memory_fact_verification_state` | `memory_fact_verification_state` | 2 | 16341 | yes |
| `memory_source_shape` | `memory_source_shape` | 1468 | 14875 | yes |
| `memory_verified_claims` | `memory_verified_claims` | 18 | 16325 | yes |
| `original_record` | `original_record` | 72 | 16271 | yes |
| `payload_fullmatch` | `payload_fullmatch` | 12 | 16331 | yes |
| `payload_schema` | `envelope_schema`, `payload_schema` | 120 | 16223 | yes |
| `payload_schema` | `memory_evidence_custody`, `payload_schema` | 280 | 16063 | yes |
| `payload_schema` | `payload_schema` | 24 | 16319 | yes |
| `private_thread` | `private_thread` | 1 | 16342 | yes |
| `reader_effect` | `reader_effect` | 12 | 16331 | yes |
| `reader_event_id` | `reader_event_id` | 12 | 16331 | yes |
| `reader_event_type` | `reader_event_type` | 12 | 16331 | yes |
| `reader_partition` | `reader_partition` | 12 | 16331 | yes |
| `reader_sequence_id` | `reader_sequence_id` | 84 | 16259 | yes |
| `reader_withdrawn` | `reader_withdrawn` | 120 | 16223 | yes |
| `real_change` | `real_change` | 336 | 16007 | yes |
| `record_attempt_id` | `record_attempt_id` | 12 | 16331 | yes |
| `record_computer_id` | `record_computer_id` | 12 | 16331 | yes |
| `record_node_id` | `record_node_id` | 12 | 16331 | yes |
| `record_project_id` | `record_project_id` | 12 | 16331 | yes |
| `record_ref` | `record_ref` | 36 | 16307 | yes |
| `record_resolution` | `record_resolution` | 12 | 16331 | yes |
| `record_revision` | `record_revision` | 12 | 16331 | yes |
| `record_run_id` | `record_run_id` | 12 | 16331 | yes |
| `record_scope_kind` | `record_scope_kind` | 12 | 16331 | yes |
| `record_server_id` | `record_server_id` | 12 | 16331 | yes |
| `record_storage_instance_id` | `record_storage_instance_id` | 12 | 16331 | yes |
| `record_subject_id` | `record_subject_id` | 12 | 16331 | yes |
| `record_thread_id` | `record_thread_id` | 12 | 16331 | yes |
| `record_workspace` | `record_workspace` | 10 | 16333 | yes |
| `replay_only` | `replay_only` | 48 | 16295 | yes |
| `retry` | `retry` | 300 | 16043 | yes |
| `revision_step` | `revision_step` | 12 | 16331 | yes |
| `scenario_path` | `scenario_path` | 12 | 16331 | yes |
| `scenario_shape` | `scenario_shape` | 12 | 16331 | yes |
| `scope_partition` | `scope_partition` | 12 | 16331 | yes |
| `scope_project_id` | `scope_project_id` | 12 | 16331 | yes |
| `scope_schema` | `scope_schema` | 12 | 16331 | yes |
| `scope_scope_kind` | `scope_scope_kind` | 12 | 16331 | yes |
| `scope_thread_id` | `scope_thread_id` | 12 | 16331 | yes |
| `selection_manifest_generation` | `selection_manifest_generation` | 12 | 16331 | yes |
| `selection_recovery_epoch` | `selection_recovery_epoch` | 12 | 16331 | yes |
| `selection_selected_segment_generation` | `selection_selected_segment_generation` | 12 | 16331 | yes |
| `snapshot` | `snapshot` | 60 | 16283 | yes |
| `source_after_record_ref` | `source_after_record_ref` | 12 | 16331 | yes |
| `source_authentic` | `source_authentic` | 360 | 15983 | yes |
| `source_before_record_ref` | `source_before_record_ref` | 10 | 16333 | yes |
| `source_committed` | `source_committed` | 336 | 16007 | yes |
| `source_computer_id` | `source_computer_id` | 12 | 16331 | yes |
| `source_owner_change_id` | `source_owner_change_id` | 12 | 16331 | yes |
| `source_owner_operation_id` | `source_owner_operation_id` | 12 | 16331 | yes |
| `source_project_id` | `source_project_id` | 12 | 16331 | yes |
| `source_revision_after` | `source_revision_after` | 12 | 16331 | yes |
| `source_revision_before` | `source_revision_before` | 10 | 16333 | yes |
| `source_scope_kind` | `source_scope_kind` | 12 | 16331 | yes |
| `source_server_id` | `source_server_id` | 12 | 16331 | yes |
| `source_storage_instance_id` | `source_storage_instance_id` | 12 | 16331 | yes |
| `source_subject` | `source_subject` | 12 | 16331 | yes |
| `source_thread_id` | `source_thread_id` | 12 | 16331 | yes |
| `source_workspace` | `source_workspace` | 10 | 16333 | yes |
| `storage_authentic` | `storage_authentic` | 240 | 16103 | yes |
| `storage_event_id` | `storage_event_id` | 12 | 16331 | yes |
| `storage_format_observed_at_utc` | `envelope_schema`, `storage_format_observed_at_utc` | 48 | 16295 | yes |
| `storage_format_observed_at_utc` | `storage_format_observed_at_utc` | 0 | 16343 | yes |
| `storage_format_persisted_at_utc` | `envelope_schema`, `storage_format_persisted_at_utc` | 60 | 16283 | yes |
| `storage_format_persisted_at_utc` | `storage_format_persisted_at_utc` | 0 | 16343 | yes |
| `storage_observed_at_utc` | `storage_observed_at_utc` | 12 | 16331 | yes |
| `storage_persisted_at_utc` | `storage_persisted_at_utc` | 12 | 16331 | yes |
| `storage_receipt_issued` | `storage_receipt_issued` | 228 | 16115 | yes |
| `storage_sequence_id` | `storage_sequence_id` | 24 | 16319 | yes |
| `token_dataset` | `token_dataset` | 12 | 16331 | yes |
| `token_key` | `token_key` | 12 | 16331 | yes |
| `token_observation` | `token_observation` | 12 | 16331 | yes |
| `token_ref` | `token_ref` | 12 | 16331 | yes |
| `token_schema` | `token_schema` | 12 | 16331 | yes |
| `token_source_identity` | `token_source_identity` | 12 | 16331 | yes |
| `token_storage` | `token_storage` | 12 | 16331 | yes |
| `transition` | `transition` | 48 | 16295 | yes |
| `verification_support` | `verification_support` | 44 | 16299 | yes |
| `withdrawn` | `withdrawn` | 240 | 16103 | yes |

Rows that remove an entire schema/custody guard are coarse guard coverage. The following table is the controlling duplicate proof under 03:56Z: each mutation cuts only the named field/predicate, keeping peer clauses enabled.

| Family | Same field/predicate | Site(s) cut | Flip | Still reject | Restored |
|---|---|---|---:|---:|---|
| `browser.session.created` | `payload_is_object` | `envelope_schema` | 0 | 1826 | yes |
| `browser.session.created` | `payload_is_object` | `payload_schema` | 0 | 1826 | yes |
| `browser.session.created` | `payload_is_object` | `envelope_schema`, `payload_schema` | 10 | 1816 | yes |
| `browser.session.created` | `observed_at_utc_format` | `envelope_schema` | 0 | 1826 | yes |
| `browser.session.created` | `observed_at_utc_format` | `storage_format_observed_at_utc` | 0 | 1826 | yes |
| `browser.session.created` | `observed_at_utc_format` | `envelope_schema`, `storage_format_observed_at_utc` | 2 | 1824 | yes |
| `browser.session.created` | `persisted_at_utc_format` | `envelope_schema` | 0 | 1826 | yes |
| `browser.session.created` | `persisted_at_utc_format` | `storage_format_persisted_at_utc` | 0 | 1826 | yes |
| `browser.session.created` | `persisted_at_utc_format` | `envelope_schema`, `storage_format_persisted_at_utc` | 4 | 1822 | yes |
| `browser.session.state_changed` | `payload_is_object` | `envelope_schema` | 0 | 2898 | yes |
| `browser.session.state_changed` | `payload_is_object` | `payload_schema` | 0 | 2898 | yes |
| `browser.session.state_changed` | `payload_is_object` | `envelope_schema`, `payload_schema` | 10 | 2888 | yes |
| `browser.session.state_changed` | `observed_at_utc_format` | `envelope_schema` | 0 | 2898 | yes |
| `browser.session.state_changed` | `observed_at_utc_format` | `storage_format_observed_at_utc` | 0 | 2898 | yes |
| `browser.session.state_changed` | `observed_at_utc_format` | `envelope_schema`, `storage_format_observed_at_utc` | 2 | 2896 | yes |
| `browser.session.state_changed` | `persisted_at_utc_format` | `envelope_schema` | 0 | 2898 | yes |
| `browser.session.state_changed` | `persisted_at_utc_format` | `storage_format_persisted_at_utc` | 0 | 2898 | yes |
| `browser.session.state_changed` | `persisted_at_utc_format` | `envelope_schema`, `storage_format_persisted_at_utc` | 4 | 2894 | yes |
| `browser.session.closed` | `payload_is_object` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.closed` | `payload_is_object` | `payload_schema` | 0 | 2900 | yes |
| `browser.session.closed` | `payload_is_object` | `envelope_schema`, `payload_schema` | 10 | 2890 | yes |
| `browser.session.closed` | `observed_at_utc_format` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.closed` | `observed_at_utc_format` | `storage_format_observed_at_utc` | 0 | 2900 | yes |
| `browser.session.closed` | `observed_at_utc_format` | `envelope_schema`, `storage_format_observed_at_utc` | 2 | 2898 | yes |
| `browser.session.closed` | `persisted_at_utc_format` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.closed` | `persisted_at_utc_format` | `storage_format_persisted_at_utc` | 0 | 2900 | yes |
| `browser.session.closed` | `persisted_at_utc_format` | `envelope_schema`, `storage_format_persisted_at_utc` | 4 | 2896 | yes |
| `browser.session.promoted` | `payload_is_object` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.promoted` | `payload_is_object` | `payload_schema` | 0 | 2900 | yes |
| `browser.session.promoted` | `payload_is_object` | `envelope_schema`, `payload_schema` | 10 | 2890 | yes |
| `browser.session.promoted` | `observed_at_utc_format` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.promoted` | `observed_at_utc_format` | `storage_format_observed_at_utc` | 0 | 2900 | yes |
| `browser.session.promoted` | `observed_at_utc_format` | `envelope_schema`, `storage_format_observed_at_utc` | 2 | 2898 | yes |
| `browser.session.promoted` | `persisted_at_utc_format` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.promoted` | `persisted_at_utc_format` | `storage_format_persisted_at_utc` | 0 | 2900 | yes |
| `browser.session.promoted` | `persisted_at_utc_format` | `envelope_schema`, `storage_format_persisted_at_utc` | 4 | 2896 | yes |
| `browser.session.takeover_state_changed` | `payload_is_object` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.takeover_state_changed` | `payload_is_object` | `payload_schema` | 0 | 2900 | yes |
| `browser.session.takeover_state_changed` | `payload_is_object` | `envelope_schema`, `payload_schema` | 10 | 2890 | yes |
| `browser.session.takeover_state_changed` | `observed_at_utc_format` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.takeover_state_changed` | `observed_at_utc_format` | `storage_format_observed_at_utc` | 0 | 2900 | yes |
| `browser.session.takeover_state_changed` | `observed_at_utc_format` | `envelope_schema`, `storage_format_observed_at_utc` | 2 | 2898 | yes |
| `browser.session.takeover_state_changed` | `persisted_at_utc_format` | `envelope_schema` | 0 | 2900 | yes |
| `browser.session.takeover_state_changed` | `persisted_at_utc_format` | `storage_format_persisted_at_utc` | 0 | 2900 | yes |
| `browser.session.takeover_state_changed` | `persisted_at_utc_format` | `envelope_schema`, `storage_format_persisted_at_utc` | 4 | 2896 | yes |
| `memory.gist_state_changed` | `payload_is_object` | `envelope_schema` | 0 | 2919 | yes |
| `memory.gist_state_changed` | `payload_is_object` | `payload_schema` | 0 | 2919 | yes |
| `memory.gist_state_changed` | `payload_is_object` | `envelope_schema`, `payload_schema` | 10 | 2909 | yes |
| `memory.gist_state_changed` | `observed_at_utc_format` | `envelope_schema` | 0 | 2919 | yes |
| `memory.gist_state_changed` | `observed_at_utc_format` | `storage_format_observed_at_utc` | 0 | 2919 | yes |
| `memory.gist_state_changed` | `observed_at_utc_format` | `envelope_schema`, `storage_format_observed_at_utc` | 2 | 2917 | yes |
| `memory.gist_state_changed` | `persisted_at_utc_format` | `envelope_schema` | 0 | 2919 | yes |
| `memory.gist_state_changed` | `persisted_at_utc_format` | `storage_format_persisted_at_utc` | 0 | 2919 | yes |
| `memory.gist_state_changed` | `persisted_at_utc_format` | `envelope_schema`, `storage_format_persisted_at_utc` | 4 | 2915 | yes |
| `memory.gist_state_changed` | `evidence_refs.media_type_constant` | `payload_schema` | 0 | 2919 | yes |
| `memory.gist_state_changed` | `evidence_refs.media_type_constant` | `memory_evidence_custody` | 0 | 2919 | yes |
| `memory.gist_state_changed` | `evidence_refs.media_type_constant` | `payload_schema`, `memory_evidence_custody` | 48 | 2871 | yes |

| Infrastructure check | Exit | Top-level result |
|---|---:|---|
| shards-check | 0 | pass |
| index-validate | 1 | fail |
| browser-semantics | 0 | see pinned log |
| browser-admission | 0 | pass |
| browser-admission-tests | 1 | see pinned log |
| coordination | 1 | fail |
| diff-check | 0 | see pinned log |

**Actual index validation: exit 1, top-level `fail`**, against origin/main `73f2231a9ec1c93190adafcdde51030f028c8c2d` (after: `73f2231a9ec1c93190adafcdde51030f028c8c2d`). The complete validator result is retained at the path and hash below. No baseline/ref is moved to disguise its failure. No owner/shard/index content is regenerated in this code/fixture-only round.

### Round-4 evidence — paths and SHA-256

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/guard-proof.json.gz` — SHA-256 `ef14fae0806d1c6f79295b210eb8dc2a66134ae0b262a75728e56874e1d32ec3`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/guard-summary.json` — SHA-256 `2415a5c2739e4aeab6e28bdc88ae77db5796a652481a0b32adad33a418fdf36f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/predicate-duplicate-proof.json` — SHA-256 `fb0b48dd373b20abebd92eff4bb85208f40c3891a1f114abe983969515f90e45`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/review-regressions.json` — SHA-256 `945630c84d498ceff2e2d9b593731ec343bcbdda283cda2417112800f28fbdb0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/sweep-witness.json` — SHA-256 `c0eaa23b5ee42630a8c1592d7f406be375480e15a12998a88b2e21b20fe7fb38`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/failure-cli-and-refs.json` — SHA-256 `069b2d26781e022cf647f344315895dec276ff27cd3fbf3983df185506d9495c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/infrastructure-checks.json` — SHA-256 `68b48c0346b6f1954c8935e4ddbe8ce17bad2a3810ea40fce79b625429e3f9eb`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/tested-inputs.json` — SHA-256 `542768e181d52244e9e6a7e895b32b32a854860c31800fcb4934f5a593753c4c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/currentness-copy.json` — SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/rebuilt-negatives.json` — SHA-256 `27ac905d98d737deeb1575ff2aeda00c34944fe9b9d66fe6c399307a465d26ec`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/narrowed-descriptor-cases.json` — SHA-256 `ef22888e471fb35c24e0f1dec5edf46a07a59912ff7a6d023aa570965cb19b3e`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/prove-duplicate-predicates.py` — SHA-256 `13890b52b101050648d40eb1bf9b5a025fd727f662f92ce7951a3638ccb25ef7`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/additional-checks.py` — SHA-256 `7ee0428ae2354b2dd174800d8c7a85841d76777ed297c1171824f91369afe1a8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/run-families.py` — SHA-256 `0745efeca258a58b8ac45d988853ea08e2f8f24be2ba613066a0afea9c541c09`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/index-validate.log` — SHA-256 `88f8ad2801c154e63e6ee3e2a408e09c8489a1b8f732a75f325351a5b984ce3a`.

Index failure detail: **23 rows** — the same 21 removal-ledger format errors and missing newer-main DL-302 reported by Astra, plus `stale_generated_index_artifact` for `Plans/.plan_index/node_readiness_report.json`. Coverage is `pass`; readiness remains `blocked_runtime_certification_incomplete`. The readiness artifact is left for its authorized refresh phase. This round does not reseal it. Browser admission tests reproduce 30 upstream40 failures in 38 tests; coordination reproduces its two existing census/value-schema failures.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/fix4/scope-and-grade-audit.json` — SHA-256 `b093ad5742e4a97a53b5e062c3f0ef327c7150651fc1a60832a56df6eaf470dc`.


## Sweep part 1 (text pass): findings and responses

Text pass only (stream E, 2026-11-05): rebase, landed citations, checkers, regeneration, this report. No checker, fixture, schema or proof edit, no hash re-pinning, no admission, registry, Decision Log, governance or `.gitignore` write, no `main` push, no subagents, no pm-mail. Working head `17f785f5f3` (report commit follows); rebase base `origin/main` `2989975e8f8a4a1e49235e8ae2095b3df7ea0321`. `origin/main` advanced to `451738fc0b` (snapshot/baseline refresh only, touching `Plans/.plan_migration/**` and `reports/landing-checks/baseline.json`, no owner document and none of this lane's files) while this pass ran; the rebase base is recorded rather than chased.

- **Rebase — done** (replayed commits ending in regeneration commit `a406e66e8c`). All 18 lane commits replayed onto `2989975e8f`; subjects identical before and after. Owner documents auto-merged with no conflict: main's batch-1 edits (J248 retention rows, Planning Wizard terminology, DL-400..452, Card 1 retention assignments) and the lane's contract text are both preserved (`git diff origin/main..HEAD` shows only lane additions; `git diff 16acf7594a..c5acd8834e` subjects equal `git log origin/main..HEAD`). Derived conflicts in `Plans/_shards/**` and `Plans/.plan_index/**` were resolved by regeneration, never hand-merged. Verify: `git merge-base --is-ancestor 2989975e8f HEAD`; `python3 scripts/pm-shard-plans.py --check` (exit 0, 3,100 shards / 99 documents).
- **Census ledger conflict — resolved mechanically** (part of the rebase). `Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl` conflicted as a single hunk spanning the whole row block (file lines 40-1020) because main's 33 J248 retention-row rewrites and this lane's 11 reclassify rows interleave line by line. No row is contested: the lane changed exactly its 11 rows (`browser.session.navigated`, `browser.session.resized`, `dashboard.widget_added`, `coordination.debug_mirror_exported`, the seven `memory.gist.*` rows) and nothing else; every one of the other 517 rows keeps main's bytes. Resolution: main row bytes except DCN's 11 rows, raw line bytes preserved. Evidence: `drafts/DCN/sweep-p1/rebase-ledger-resolution.json` and `rebase-ledger-preservation.json`. Verify: final file has 528 rows, differs from `origin/main` in exactly 11 rows and from the pre-rebase branch in exactly 33.
- **Landed citations — 19 sites changed, one commit** (`17f785f5f3`). Every citation of the then-unlanded answer/retention branches now cites the landed Decision Log entries; every lineage pin and SHA is kept verbatim.
  - Six `canonical_text` sentences (SMPFS-244..248, AMS-130): "the unlanded answer/retention commits must integrate before admission" replaced with the landed DL-405/DL-407 entries and the per-name retention assignment landed as `Plans/Decision_Log.md#DL-401`. `Plans/Section15_MVP_Promoted_Features_Spec.md:13372-13375`, `:13482-13485`, `:13593-13596`, `:13702-13705`, `:13812-13815`; `Plans/assistant-memory-subsystem.md:3160-3163`.
  - Six per-family retention citations (SP-760..765): "assignment on 2663667e...#retention-authority-and-defaults (…)" now reads "landed as `Plans/Decision_Log.md#DL-401` in Case L-3, Card 1 retention assignments (…)"; the pin `2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md#retention-authority-and-defaults` is kept verbatim as the lineage pin. `Plans/storage-plan.md:29611-29613`, `:29719-29721`, `:29827-29829`, `:29935-29937`, `:30043-30045`, `:30159-30161`.
  - Report and self-grade citation words: `reports/event-authority-20261104/DCN.md:54`; `DCN-self-grade.json:215`, `:585`, `:955`, `:1325`, `:1695`, `:2093`. The `source_input_pins` refs (`origin/plans/ea-cards1-answers-20261104` @ `b6332f391a`, `origin/plans/ea-retention-cards1-20261104` @ `2663667e14`) and every SHA-256 pin are unchanged.
  - Citations of still-unlanded shared-tool branches (`plans/ea-numrule-20261105` CV-1100/SP-1100/SP-1101, `plans/ea-guardtool-20261105`) are correctly still branch citations: neither is on `main` (`git show origin/main:Plans/Contracts_V0.md | grep -c CV-1100` = 0; `git ls-tree origin/main scripts/pm_guard_isolation.py` empty).
  - Verify: `git show 17f785f5f3 --stat`; `grep -n "DL-401" Plans/storage-plan.md | tail -6`.
- **Deck items — none assigned to this lane.**
- **Lane checkers — run one at a time, unchanged, recorded exits.** Checker inputs (`scripts/pm_card2_events.py`, `Plans/card2_event_contracts.json`, `Plans/card2_event_fixtures.json`, `Plans/card2_event_payloads.schema.json`, `Plans/browser_event_admission.json`, `Plans/event_family_registry.json`) are byte-identical across the rebase (`git diff --stat c5acd8834e 17f785f5f3 -- <those paths>` empty).

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_card2_events.py --family browser.session.created` | 0 | PASS, 44 controls |
| `python3 scripts/pm_card2_events.py --family browser.session.state_changed` | 0 | PASS, 44 controls |
| `python3 scripts/pm_card2_events.py --family browser.session.closed` | 0 | PASS, 44 controls |
| `python3 scripts/pm_card2_events.py --family browser.session.promoted` | 0 | PASS, 44 controls |
| `python3 scripts/pm_card2_events.py --family browser.session.takeover_state_changed` | 0 | PASS, 44 controls |
| `python3 scripts/pm_card2_events.py --family memory.gist_state_changed` | 0 | PASS, 123 controls |
| `python3 -m unittest discover -s tests -p test_pm_browser_program_semantics.py` | 0 | 10 tests OK |
| `python3 scripts/pm-browser-event-admission.py` | 0 | top-level pass |
| `python3 -m unittest discover -s tests -p test_pm_browser_event_admission.py` | 1 | 38 tests, exactly the 30 known pre-existing upstream40 fingerprint failures; inputs unchanged from the reviewed head |
| `python3 scripts/pm_coordination_events.py` | 1 | exactly its two known baseline failures (`payload_schema_definition_census`, coordination projection `value_schema`); unchanged machine inputs |
| `python3 scripts/pm-shard-plans.py --generate` then `--check` | 0 / 0 | pass; regenerated shard families limited to the lane's six edited owners |
| `python3 scripts/pm-plan-index.py generate` | 0 | pass, 7,507 plan units |
| `python3 scripts/pm-plan-index.py validate` | 0 | **top-level pass, zero findings** |
| `git diff --check origin/main..HEAD` | 0 | clean |

- **Index findings — none on this branch; nothing new.** Validate passes with zero findings at this head. For attribution, `validate` was also run in a clean `origin/main` (`451738fc0b`) worktree: **exit 1 with one finding**, `stale_generated_index_artifact` for `Plans/.plan_index/node_readiness_report.json` — main's own post-landing state after the GRS-027 snapshot refresh, not present on this branch, whose regeneration is self-consistent. The 22-24 inherited failures of earlier rounds (removal-ledger format, missing DL-302/PLS-025, stale readiness) are gone at this base: the units exist on current `main` and the artifacts were regenerated. Evidence: `drafts/DCN/sweep-p1/index-validate-branch.json`, `index-validate-main.log`.
- **Family grades carried unchanged from the cycle-five Sol review; nothing re-graded.** `browser.session.created` 7 PASS / 4 PARTIAL / 1 ABSENT; each of the other five families 6 PASS / 5 PARTIAL / 1 ABSENT; membership ABSENT, native execution NOT_RUN. This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.

### For an Opus or Sol worker

1. **Browser admission unittest baseline** — `tests/test_pm_browser_event_admission.py` (38 tests, 30 upstream40 fingerprint assertion failures, exit 1). Sol cycle 5 records it as the unchanged pre-existing baseline with byte-identical inputs. Deciding whether the upstream40 manifest/fingerprint mismatch is repaired (or the baseline witness re-recorded) is not a text-pass change. How to verify now: the run above reproduces exactly 30 failures.
2. **Coordination checker baseline** — `scripts/pm_coordination_events.py`, exit 1 with exactly `payload_schema_definition_census` and the coordination projection `value_schema` failure. Pre-existing machine-input failures reproduced on immutable base inputs in every round since round 1. Not repairable inside this lane's scope.
3. **Stale commit-SHA lineage references in the round-4 report artifacts** — `reports/event-authority-20261104/DCN-checks.json` and `DCN-self-grade.json` name pre-rebase commit SHAs (`de58b6e10c`, `a681b17257`, `aa07a2fcbe`, `7b7bdd78a8`, `9f06b66379`, `c5acd8834e` and others), which the rebase rewrote. Every input SHA-256 pin in them is still valid (checker inputs are byte-identical); only the commit-SHA lineage pointers are stale. Re-pinning hashes is out of this pass's scope; the Opus worker re-verifies content before any re-pin. Also `DCN-self-grade.json` `source_input_pins` still point at the unlanded answer/retention branch tips `b6332f391a` / `2663667e14` — the decisions themselves are landed (DL-401/405/407), so whether those branch-tip pins integrate or re-point is the parent's integration call.
4. **Readiness/currentness refresh** — `Plans/.plan_index/node_readiness_report.json` and the currentness edition belong to their authorized refresh/reseal phase (current `main` itself reports the stale readiness artifact above). This lane regenerates but does not reseal; reported, not repaired.

### Part 2 items

| Item | Location | Work |
|---|---|---|
| **B1 — semantic integer domain exceeds the installed RFC 8785 encoder** | `scripts/pm_card2_events.py:462-465` (`semantic_digest`), `:621-624` (retry predicate); CV-780..785; revision domains in `Plans/card2_event_payloads.schema.json` | Adopt the shared number rule (CV-1100 / SP-1100 / SP-1101 on `plans/ea-numrule-20261105`) with write-time recipe selection. No DCN-local cap or serializer. |
| **B2 — Storage u64 sequence domain unenforced** | `scripts/pm_card2_events.py:496`, `:607-624`; original/receipt/read joins; `Plans/storage-plan.md:436` (`sequence_id: u64`) | Enforce the shared Storage uint64 domain and integer spelling on the record and joins; never cap u64 at 2^53; assigned metadata stays outside producer hashing. |
| **Browser numeric ranges** | `scripts/pm_card2_events.py:253-270` (`browser_field_bad`), `:218-222` (`strict_equal`); `Plans/storage-plan.md:1208-1210` | Adopt u32 dimensions and finite f64 / physical-number rules through the shared sweep; preserve exact types and signed zero (this pass validated exact types only). |
| **SW1 — retained lowercase RFC 3339 timestamps rejected without authenticated recipe selection** | `scripts/pm_card2_events.py:60-66` (`timestamp_valid`), global FormatChecker registration, `envelope_bad`/`storage_format_*`, retained original paths | Shared exact envelope grammar (CV-1101) plus SP-1101 original resource/profile dispatch; preserve genuine originals, refuse forged weaker-edition selection. Date-time gate pending; this lane's timestamp review is interim. |
| **Shared proof-tool adoption (guard tables)** | `scripts/pm_card2_events.py:751-774` (`_run` removal machinery) and compound registered callables | Replace lane-local check-11 proof machinery with `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105` once it passes review; restructure the checker into named guard tables. |

## Sweep part 1 (fixture pass): findings and responses

Task: `lanes/SWEEP-P1-OPUS.md`. Worker head before the report commit: `688884f97b`. Base stays `origin/main` `2989975e8f`: the text pass finished its rebase, so no second rebase was made. Evidence: `drafts/DCN/sweep-p1/fixture-pass/`. No Decision Log entry, registry append, admission, seal or reseal; `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, the frozen validator and the canonical individual union are unchanged.

| Item | Result | Commit, path:line | How to verify |
|---|---|---|---|
| **Census ledger check** (lead's request) | **Correct by row, wrong by bytes. Fixed.** Details below. | `6217c9f580`; `Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl` | `git diff --numstat origin/main HEAD -- <ledger>` gives `11 11`. |
| **1. Browser admission unittest** | **Fixed.** Where: `tests/test_pm_browser_event_admission.py:71`. Why: the pinned fingerprint of the 40 live rows was last true just before `c0d688db9f` (2026-10-10), so 30 tests aborted in `all_prepared_snapshot` and asserted nothing, on `main` too. Fix: recomputed from the rows. Negative added. | `6bb2e66a24`; `tests/test_pm_browser_event_admission.py:67-72`, `:79-86` | The test exits 0 with 39 tests here. On `main` it still exits 1 with 30 of 38 failing. Pin details below. |
| **2. Coordination checker baseline** | **Left as baseline.** Where: `scripts/pm_coordination_events.py`, checks `payload_schema` (the payload census predates the `*ApplicationV1` definitions) and `coordination_read_model_projections` `value_schema`. Why not here: DO carries edits to this file and DO-C8-N5 assigns its reconciliation to DCO, so a fix on this branch would collide. | none | Exit 1 here and on `main`, byte-identical stdout. |
| **3. Stale lineage in report artifacts** | **Fixed.** Pre-rebase commit SHAs stay as written, since they are the record of those rounds; a new map reaches all 18 commits on today's branch. Checking the pins also found stale citations, below. | `688884f97b`; `reports/event-authority-20261104/DCN-rebase-lineage.json`, `DCN-self-grade.json`, `DCN-checks.json`, `DCN-exclusion-application.json`, `DCN.md:19-29` | `refs-after-relocate.json`: 155 of 155 and 20 of 20 citations resolve; the 23 `DCN-checks.json` hashes match. |
| **4. Readiness and currentness refresh** | **Left for the reseal phase.** The lane regenerates and does not reseal. | none | `pm-implementation-readiness.py validate`: `main` 59 rows, here 61. The 2 extra are `event_authority_currentness_source_drift` for `Plans/Automated_Testing_System.md` and `Plans/assistant-memory-subsystem.md`, documents the lane edits. |

### Census ledger: the check, and what was wrong

**The lead's check holds by row.** Parsed row by row against `main`, the file is `main` plus 11 in-place replacements, with `disposition` and `notes` the only changed fields. `category` and `cohort_pins` are unchanged, order is unchanged, 528 rows on both sides, and the 11 rows equal the lane's drafted rows.

**It does not hold by bytes.**
- **Where:** the ledger and the 11 `rows/ROW_*.json` files.
- **Why:** on `main`, 525 of the 528 ledger rows end in CRLF. The lane's first commit (`0216428b0c`) rewrote them all as LF, so `git diff` against `main` showed 525 changed rows, 514 of them line endings only. That is why the rebase saw one conflict across the whole row block. The text pass's "raw line bytes preserved" and `rebase-ledger-preservation.json`'s `all_other_row_bytes_preserved: true` are not true of the raw file, and no review to date flagged it.
- **Fix:** every row and row file takes the terminator it has on `main`. Parsed content is checked equal for all 12 files (`eol-restore.json`).

**Result:** the ledger diff is now `11 11` and each row file shows only its real changes, for example `ROW_browser.session.navigated.json` went from 129/119 to 12/2. A trial merge into current `origin/main` `b78a5957fd` now conflicts only in 4 generated index files.

**One side effect:** plain `git diff --check` now reports 133 CR hits on the changed lines, as any edit to these CRLF files would. `git -c core.whitespace=cr-at-eol diff --check` reports none.

### Pins and hashes changed

| Pin | Old | New | Why |
|---|---|---|---|
| Upstream40 fingerprint, `tests/test_pm_browser_event_admission.py:71` | `a27cf49b63d364ae0d6d6f62b0ebc8d3ebe9e66df6de8e58814d099194d81050` | `2fe49c025e4db8adc9183a3f32c393333c203f375d9a047cc7a98d48c6f8776e` | Three landed registry changes: `c0d688db9f` and `634412b3ac` (`workspace.layout_changed` 2.0.0, DL-188) and `102a7e99e8` (lane F-d added `scope_policy`, `payload_versions`, `payload_selection_policy` to 11 goal rows). 12 of the 40 rows moved (`upstream40-changed-rows.json`). |
| Census `before_sha256`, exclusion record | `83a1698ac3df…` | `0ee088985c80…` | Main's file at the rebase base, which differs in 33 other rows. The old value is kept as `drafting_before_sha256`. |
| Census `after_sha256`, exclusion record | `b3af78deab32…` | `3b3ee99f53b7…` | Rebase and restored line endings. The old value is kept as `drafting_after_sha256`. |
| 11 row `after_sha256` values, exclusion record | see `after_sha256_lf_superseded` | current file hash | Line endings only; `before_sha256` still matches `main`. |

**Why the fingerprint re-pin is safe:** the preservation check beside it still judges each changed row against its reviewed successor, and once setup stops aborting, all 38 original tests run and pass. This is the probe in `browser-tests-probe-repinned.out`.

**Pins checked and left alone:** `source_input_pins` (`b6332f391a`, `2663667e14`). Both branch tips are on origin, and their SHA-256 values match both the blobs and the evidence copies. Whether they re-point to the landed decisions stays the parent's integration call, as the text pass said.

### Citations repaired

The rebase moved 138 of 155 self-grade citations and 10 of 20 in the exclusion record, and the text pass reworded the owner lines behind 12 retention quotes in SP-760..765 without updating those quotes. Line numbers now come from git's own diff map from `c5acd8834e`, and each result is checked to hold its quote (`quote-relocation.json`). The 12 quotes now carry the current owner words (`quote-requote.json`). My first attempt used the nearest match and put 14 shared sentences in a sibling family's section; a check against the diff map caught that, and it was discarded.

### Census derivation

DCN adds no storage or registry family. `Plans/storage_value_registry.json` stays at 344 families and `Plans/event_family_registry.json` at 46, so no count pin moves; `tests.test_shared_runtime_storage_contracts` exits 0. The census ledger stays at 528 rows, with 11 dispositions replaced in place.

### Checker runs (serial, this head)

| Command | Exit | Result | `origin/main` |
|---|---:|---|---|
| `python3 scripts/pm_card2_events.py --family browser.session.created` | 0 | 44 positives, 1,826 negatives | not applicable |
| `... --family browser.session.state_changed` | 0 | 44, 2,898 | not applicable |
| `... --family browser.session.closed` | 0 | 44, 2,900 | not applicable |
| `... --family browser.session.promoted` | 0 | 44, 2,900 | not applicable |
| `... --family browser.session.takeover_state_changed` | 0 | 44, 2,900 | not applicable |
| `... --family memory.gist_state_changed` | 0 | 123, 2,919 | not applicable |
| `python3 -m unittest discover -s tests -p test_pm_browser_program_semantics.py` | 0 | 10 tests | not run |
| `python3 scripts/pm-browser-event-admission.py` | 0 | pass | not run |
| `python3 -m unittest discover -s tests -p test_pm_browser_event_admission.py` | **0** | 39 tests | 1, 30 of 38 failing |
| `python3 -m unittest discover -s tests -p test_pm_emit_only_event_boundaries.py` | 1 | 1 of 13 failing | same test failing |
| `python3 scripts/pm_coordination_events.py` | 1 | 2 baseline failures | same, byte-identical stdout |
| `python3 -m unittest tests.test_shared_runtime_storage_contracts` | 0 | 16 tests | not run |
| `python3 scripts/pm-implementation-readiness.py validate` | 1 | 61 rows | 1, 59 rows |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | no change | not applicable |
| `python3 scripts/pm-plan-index.py generate` | 0 | timestamps only, so not committed | not applicable |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass | not applicable |
| `python3 scripts/pm-plan-index.py validate` | **1** | 25 rows, below | 0, no rows, at `b78a5957fd` |

Family counts equal Sol cycle 5's.

### Index findings

All 25 rows appear only because `main` moved past this branch's base, and `main` itself has none of them.
- **4 rows, `plan_unit_removed_without_ledger_decision`:** DL-337, DL-338, DL-339 and DL-340. Main added them after `2989975e8f`.
- **21 rows, `plan_unit_removal_ledger_invalid`:** legacy ledgers, read only once a removal needs adjudicating.

**Check:** a trial merge into `b78a5957fd` regenerated cleanly: validate exits 0 with no rows, `--family browser.session.created` exits 0 and the Browser tests exit 0. The trial was discarded, and nothing from it is on the branch.

**Validate reads a moving ref:** its baseline is the `origin/main` ref, not the checkout, so one run on a `main` checkout at `6861d332de` reported 22 rows because the shared ref had already moved. The result above comes from a checkout at the ref itself.

### Integration note, not fixed

The same stale registry fingerprint sits in `tests/test_pm_emit_only_event_boundaries.py:28` (`a27cf49b…`) and `scripts/pm_emit_only_event_contract.py:19` (`237b757a…`), which an emit-only manifest also pins. `test_exact_six_absent_and_preexisting_forty_unchanged` fails the same way on `main`. It is not on this lane's list and it spans another owner's script and manifest.

### Grades

Family grades carry unchanged from the cycle-five Sol review: `browser.session.created` 7 PASS / 4 PARTIAL / 1 ABSENT, each of the other five 6 PASS / 5 PARTIAL / 1 ABSENT. No fix here changes a cell. Membership stays ABSENT and native execution NOT_RUN. Part 2 items are unchanged from the list above.

This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.

## Sweep part 2A: findings and responses

Task: `lanes/SWEEP-P2A.md` with its "Part 2B numbers in the same pass" section; worker brief for lane DCN (2026-11-10). Start `db8bd12630` (sweep part 1 head). Gated guard-tool merge `1315df8375` (parents `db8bd12630` and exactly `004bdedd632d9463f3535190a6ed5772338cdce1`; its 11 files only, none edited). NUMRULE merge `0bea1cefa2` (parents the tool merge and exactly `58c2816ff33365384d4039553f5efdb5370930e6`, the head the task names; `git diff a16f67c1ef 58c2816ff3 -- scripts/pm_event_numbers.py scripts/pm_event_numbers_corpus.py scripts/pm_event_numbers_mutations.json Plans/event_number_recipe_corpus.json` is empty, so its number files are the gated number scope). Its 163 conflicts were all in `Plans/_shards/{contracts_v0,storage-plan}` and `Plans/.plan_index`, resolved by `pm-shard-plans --generate`, `pm-plan-index generate` (15 currentness files SHA-256-matched) and `--check`; only Contracts_V0 and storage-plan units changed. No rebase onto main. Implementation head `1d51901d87`; the delivery head is in the external `HEAD.txt`. Membership ABSENT, native execution NOT_RUN. **This lane's own review of its timestamp fields is interim only** (pm7-build, 2026-11-05 16:50Z): no date-time code is adopted (`pm_event_datetime` is imported nowhere in this lane).

| Item | Disposition and change | Commit, path:line | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` with `--no-ff`; 11 files, no conflict, none edited. | `1315df8375` | `git diff --stat 1315df8375^1 1315df8375` lists 11 files; `git diff 1315df8375 HEAD -- scripts/pm_guard_isolation.py scripts/pm_guard_isolation_traps.py Plans/guard_isolation_traps.json scripts/guard-isolation/README.md` is empty. |
| **Part-2 item "Shared proof-tool adoption (guard tables)"** (fixed) | Every refusal of `scripts/pm_card2_events.py` is one named row of a generated Method B table: **562 rows in 138 tables** (at most 8 rows each), one predicate over one subject. Old compound guards are split per clause (for example the transition guard into 32 clause rows, evidence custody into 15, memory source shape into 27 per subject) and per subject: the candidate and the Storage original on retry, the before and the after record, the no-event before and after facts. Derivation computes one boolean observation per row (True when its predicate holds or does not apply) and decides nothing; `refusal`/`evaluate` reach a refusal only through the table predicates, in table order. Preconditions owned by an earlier row are explicit (for example `payload_schema` runs only on an object payload, owned by the envelope's `payload: type object`; a Storage-original row runs only when its candidate row holds and the original is of the candidate family, `orig_family`). The old in-process guard-removal loop and its proof caches are deleted. | `a01d8fc9ff`, `8e69371bf0`; `scripts/pm_card2_events.py:421` (`row`), `:464` (`view_rule`), `:470` (`orig_after_cand`), `:1423` (`TABLE_ROWS`), `:1464` (`observe`), `:1485` (`table_refusals`), `:1496` (`evaluate`), `:1512` (`table_order_errors`), `:1545` (`judge`); generator `scripts/pm-card2-table-generate.py`; adapter `scripts/pm_card2_guard_suites.py`; runner `scripts/pm-card2-guard-tables.py` | `python3 scripts/pm-card2-table-generate.py --check` (138 tables, 562 rows, none stale or extra); `python3 scripts/pm_card2_events.py` (also fails if a factory's `table.require` order differs from the spec); `python3 scripts/pm-card2-guard-tables.py --out <dir>`. |
| **Two-defect negatives** (fixed) | The first whole-lane run reported 820 problems: 636 negatives refused by two rows once the compound guards were split, 60 payload-object duplicate pairs, 60 integral-float positives (next row) and 64 negatives derived from those positives (60 of them removed with their bases; the other 4 were access_count and half_life_days value cases, fixed when the delta precondition learned to treat a refusing shape clause as unmet). Repairs, one subject each: 60 payload-object pairs now target `envelope_schema` (the payload verdict no longer runs on a non-object); 12 `scope_schema` wrong-edition cases move the envelope `payload_schema_id` copy with `payload.schema_id`; 120 snapshot / family-checkpoint type cases that set two independent fields now set one (alternating); 152 memory and 210 no-event source-shape cases that wrote the same defect into both sides now change one side (chosen by a fixed hash of the case ID), and 8 more drop the delta copies the shape precondition no longer reads; 10 unresolved-reference cases drop one record instead of both. | `a01d8fc9ff`; `Plans/card2_event_fixtures.json`; repair script and record in the evidence folder (`tools/fixture_repair.py`, `records/fixture-repair-record.json.gz`) | Lane matrix and the checker's own judge: every negative is refused first at its row and any other refusing row is an entailed row whose proof names that first row (0 errors). |
| **Integral-float positives** (fixed, CV-1100) | 60 retry positives (`…/retry/round2/number-{1.0,1e0,0.0,-0.0,0e0}`) accepted a candidate `producer_sequence_id` spelled as a float only because the old RFC 8785 digest erased the spelling. They are now negatives of `cand_envelope_numbers` (`…/cv1100-integer-slot`); their 60 derived negatives carried that defect too and are removed (the same retry rows keep witnesses on the plain retry bases). The `number--0` positives stay: in parsed fixtures they are the integer 0; the raw `-0` token is refused by the parser (corpus run). | `a01d8fc9ff`; `Plans/card2_event_fixtures.json` | `records/fixture-repair-record.json.gz` lists every converted and removed ID. |
| **Missing witnesses** (fixed) | The split left 239 rows with no single-row witness. `Plans/card2_event_p2a_cases.json` holds **235 coherent witnesses and 7 controls** (builder `scripts/pm-card2-p2a-cases.py` with `scripts/pm_card2_p2a_lib.py`). Each starts from a named positive, or from the retry path control of an append positive (that positive with only `path` changed, which the checker accepts), changes one fact and moves every copy that follows it: the Storage original's recomputed idempotency key and event_id, the retry observation, the receipt copies and the retry result recomputed with the shared producer digest. | `a01d8fc9ff`, `8e69371bf0`, `1d51901d87`; `scripts/pm-card2-p2a-cases.py`, `scripts/pm_card2_p2a_lib.py:48` (`sync_original`) | `python3 scripts/pm-card2-p2a-cases.py --check`: 235 witnesses, 7 controls, 229 target rows, 0 failures, not stale. |
| **Rows nothing can refuse first** (kept, with proofs) | 67 rows are never the first refusal: an earlier row always refuses first. Each sits alone in its own `entailed_*` table (tool: no negative, so unproved; no other row loses credit), with the proof and the `path:line` of every row that refuses first in `pm_card2_events.ENTAILED` and in the table below. No rule was removed. | `a01d8fc9ff`, `8e69371bf0`, `1d51901d87`; `scripts/pm_card2_events.py:1292` (`orig_entail`), `:1409` (`STRUCTURAL`) | The checker refuses any witness whose first row is entailed (`entailed_row_first`); `python3 scripts/pm-card2-entailed-fuzz.py` (randomized, below). |
| **Gating changes that remove duplicate sites** | Three defense-in-depth duplicates of round 4 became one site plus an entailed row, not a duplicate set (the tool forbids a duplicate site that is also a single-negative target): the payload-object pair (payload verdict gated on an object payload), descriptor `media_type` (custody clause entailed by the payload `const`), and Storage-assigned timestamp format (`storage_format_*` entailed by the envelope verdict of the same Storage record). Every input refused before is still refused. | `a01d8fc9ff` | Old duplicate negatives now pass the judge with the entailed co-refusal. |
| **4,400-digit integer crash** (found, fixed) | **Where:** `load()` and `--fixtures` (`json.loads`) and every guard that re-encoded a value (`validation_json = json.dumps`, `rfc8785.dumps`, jsonschema's error text). **Cause:** Python's 4,300-digit limit raised `ValueError`: a fixture file holding such an integer failed the whole run, and in memory the exception was counted as whichever guard was running (old checker: a 4,400-digit `producer_sequence_id` refused as `envelope_schema`, although that schema sets no maximum there). **Fix:** fixtures parse through the shared `loads_exact` with `current_integer` per integer token; `observe` runs under a scoped `exact_digits()`; no value is re-encoded through JSON. The same input is now `p2a/producer-route-4400-digit`, refused first at `cand_producer_route`; `p2a/sequence-4400-digit` at `cand_sequence_u64`; `p2a/revision-4400-digit` at `cand_payload_schema` (its maximum). | `a01d8fc9ff`; `scripts/pm_card2_events.py:72` (`materialize`), `:84` (`loads_fixture`), `:1453` (`exact_digits`) | `records/crash-evidence.json` in the evidence folder (old checker on the same case); corpus long-integer routes below. |
| **No predicate uses `all(...)`/`any(...)` over a generator** (T149) | Table predicates read one boolean field. In derivation every `all`/`any` takes a list. | `a01d8fc9ff` | `grep -n "all(\|any(" scripts/pm_card2_table_*.py` is empty. |
| **ATS-380 legacy proof claim** (fixed) | ATS-380 no longer describes the retired in-process guard removal; it names the guard tables, the shared tool, the part 2A witnesses and the corpus run, and its validation surfaces list the new commands. | `53f2f77486`; `Plans/Automated_Testing_System.md` (ATS-380) | Shards and index regenerated: only Automated_Testing_System, Contracts_V0 and storage-plan outputs changed; canonical text changed in exactly ATS-380, CV-780..785 and SP-760..765. |
| **Self-grade citations** (re-pinned) | The NUMRULE merge and the owner edits moved 107 cited lines; they are relocated by git's own diff map from `db8bd12630`, and the 6 quotes of the rewritten ATS-380 line are re-quoted. All 144 evidence quotes resolve at their lines; the 20 exclusion-record citations are unchanged. | report commit; `reports/event-authority-20261104/DCN-self-grade.json` | `records/pin-relocation.json` in the evidence folder. |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** no new PlanUnit, Decision Log, registry or admission ID; ATS-380, CV-780..785 and SP-760..765 change in place. New witness IDs are the `p2a/…` case IDs.

### Guard-table result (gated tool `004bdedd63`, credited exactly as reported)

Final run at the implementation head `1d51901d87` (`final/guard/summary.json`; tool SHA-256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8`, the gated file). Collection replays every DCN case once through the complete checker: **16,868 cases** (283 positives, 7 controls, 16,343 fixture negatives, 235 part 2A witnesses; 290 accepted, 16,578 refused), **0 judged errors, 0 collection findings**. A table whose rows all hold on a case contributes that observation as a control; the table holding a case's first refusal contributes its observation as a negative of that row. With boolean observations every row has one distinct negative observation, and one all-true control per table. The tool then ran once per table that has a negative: **71 runs, all `PASS`; 495 of 495 provable rows proved**; each cut swapped one row to always-pass, ran every control and negative, checked the guard-call trace against the uncut baseline and ran a fresh restoration. **0 unrelated changes, 0 masked negatives, 0 lane-matrix problems.** The 67 entailed tables have no negative by construction, so the tool does not run them and they stay unproved, each alone. Collection 555 s, total 3,976 s (the MemoryGate paused 88 times while other workers held the VM below 10 GB available), serial, MemoryGate 6,144 MiB RSS / pause below 10 GB, resume at 11. The earlier run at `8e69371bf0` (494/494 proved, 68 entailed) is kept as evidence.

| Checker part | Tables (run / PASS) | Rows | Proved | Entailed | Tool negatives / controls | Evaluations | Cut: own flips | Cut: stays | Unrelated | Masked | Lane matrix |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Scenario path and shape | 1 (1 / 1) | 3 | 3 | 0 | 3 / 1 | 40 | 3 | 6 | 0 | 0 | 0 |
| Candidate event: schema, numbers, producer route, scope, identity | 6 (6 / 6) | 40 | 40 | 0 | 40 / 6 | 1,084 | 40 | 266 | 0 | 0 | 0 |
| Candidate event: transition clauses | 3 (3 / 3) | 24 | 24 | 0 | 24 / 3 | 675 | 24 | 168 | 0 | 0 | 0 |
| Candidate event: verification, SP-337 custody, claims, delta, record joins | 5 (5 / 5) | 37 | 37 | 0 | 37 / 5 | 984 | 37 | 240 | 0 | 0 | 0 |
| Storage original (retry): schema, numbers, scope, identity | 5 (5 / 5) | 33 | 33 | 0 | 33 / 5 | 908 | 33 | 224 | 0 | 0 | 0 |
| Storage original (retry): transition, memory, browser | 4 (4 / 4) | 30 | 30 | 0 | 30 / 4 | 802 | 30 | 196 | 0 | 0 | 0 |
| Owner, command and record joins (both sides) | 5 (5 / 5) | 34 | 34 | 0 | 34 / 5 | 873 | 34 | 210 | 0 | 0 | 0 |
| Browser session source records (both sides; u32/f64) | 16 (16 / 16) | 118 | 118 | 0 | 118 / 16 | 3,230 | 118 | 796 | 0 | 0 | 0 |
| Memory source records (both sides) | 8 (8 / 8) | 56 | 56 | 0 | 56 / 8 | 1,480 | 56 | 360 | 0 | 0 | 0 |
| Publication, Storage original custody and family, retry | 4 (4 / 4) | 20 | 20 | 0 | 20 / 4 | 444 | 20 | 100 | 0 | 0 | 0 |
| Retained reader: token, source digests, access | 5 (5 / 5) | 37 | 37 | 0 | 37 / 5 | 984 | 37 | 240 | 0 | 0 | 0 |
| Command-only verification outcomes | 9 (9 / 9) | 63 | 63 | 0 | 63 / 9 | 1,656 | 63 | 402 | 0 | 0 | 0 |
| Entailed rows (one per table, no negative) | 67 (0 / 0) | 67 | 0 | 67 | 0 / 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **Total** | 138 (71 / 71) | 562 | 495 | 67 | 495 / 71 | 13,160 | 495 | 3,208 | 0 | 0 | 0 |


### Rows that cannot refuse first (67, each alone in its own table)

Each row below is never the first refusal: a row earlier in table order always refuses first. The tables of these rows hold nothing else, so the tool reports them unproved without withdrawing any other row's credit. "Structural rows" are the candidate (and, for Storage-original rows, the original) envelope and payload verdicts and number slots and the partition, plus `orig_family`, `historical_record`, `storage_authentic` and the token observation rows (`cand_envelope_schema` :490, `cand_envelope_numbers` :492, `cand_payload_schema` :496, `cand_payload_numbers` :498, `cand_scope_partition` :520, `orig_family` :1064, `historical_record` :1074, `storage_authentic` :1067, `token_observation` :1116, `token_schema_index_read_token` :1113); they refuse a malformed event, payload, original or token before any named join can be read. Line numbers are of the statement that defines the row in `scripts/pm_card2_events.py`.

| Row (code), defined at | Refused first by (scripts/pm_card2_events.py:line) | Schema clause | Proof |
|---|---|---|---|
| `cand_transition_created_before_ref` (transition), :578 | `cand_source_before_record_ref` :537, `cand_browser_fact_previous_session_class` :815, `cand_transition_created_previous_session_class` :586; plus the structural rows | — | A created event that names a before record: source_before_record_ref refuses unless the owner names the same reference; then record_resolution_before refuses unless it resolves, and the browser_before_* rows refuse unless the record holds a valid session_class string; then browser_fact_previous_session_class refuses a null previous_session_class and transition_created_previous_session_class refuses a non-null one. record_resolution_before and browser_before_* precede this entailed table as well. |
| `orig_transition_created_before_ref` (transition), :578 | `orig_source_before_record_ref` :537, `orig_browser_fact_previous_session_class` :815, `orig_transition_created_previous_session_class` :586, `cand_source_before_record_ref` :537, `cand_browser_fact_previous_session_class` :815, `cand_transition_created_previous_session_class` :586; plus the structural rows | — | A created event that names a before record: source_before_record_ref refuses unless the owner names the same reference; then record_resolution_before refuses unless it resolves, and the browser_before_* rows refuse unless the record holds a valid session_class string; then browser_fact_previous_session_class refuses a null previous_session_class and transition_created_previous_session_class refuses a non-null one. record_resolution_before and browser_before_* precede this entailed table as well. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_transition_memory_initial_before_ref` (transition), :592 | `cand_source_before_record_ref` :537, `cand_memory_fact_previous_verification_state` :794, `cand_transition_memory_initial_previous_verification` :590; plus the structural rows | — | An initial gist that names a before record: source_before_record_ref refuses unless the owner names the same reference; then record_resolution_before refuses unless it resolves, and the memory_before_* shape rows refuse unless the record holds a verification_state in its domain; then memory_fact_previous_verification_state refuses a null previous_verification_state and transition_memory_initial_previous_verification refuses a non-null one. record_resolution_before and memory_before_* precede this entailed table as well. |
| `orig_transition_memory_initial_before_ref` (transition), :592 | `orig_source_before_record_ref` :537, `orig_memory_fact_previous_verification_state` :794, `orig_transition_memory_initial_previous_verification` :590, `cand_source_before_record_ref` :537, `cand_memory_fact_previous_verification_state` :794, `cand_transition_memory_initial_previous_verification` :590; plus the structural rows | — | An initial gist that names a before record: source_before_record_ref refuses unless the owner names the same reference; then record_resolution_before refuses unless it resolves, and the memory_before_* shape rows refuse unless the record holds a verification_state in its domain; then memory_fact_previous_verification_state refuses a null previous_verification_state and transition_memory_initial_previous_verification refuses a non-null one. record_resolution_before and memory_before_* precede this entailed table as well. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_transition_closed_changed` (transition), :606 | `cand_transition_closed_previous` :604, `cand_transition_closed_lifecycle` :605, `cand_browser_fact_previous_lifecycle_state` :815, `cand_browser_fact_lifecycle_state` :815, `cand_browser_delta` :818, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | lifecycle_state missing from changed_fields: when browser_delta holds, changed_fields is the exact record delta, so the before and after records agree on lifecycle_state; when the record-join rows (browser_fact_previous_lifecycle_state, browser_fact_lifecycle_state) hold, the payload previous and current values equal those records and so each other, which refuses at transition_closed_previous or transition_closed_lifecycle. Every one of these rows precedes this entailed table. |
| `orig_transition_closed_changed` (transition), :606 | `orig_transition_closed_previous` :604, `orig_transition_closed_lifecycle` :605, `orig_browser_fact_previous_lifecycle_state` :815, `orig_browser_fact_lifecycle_state` :815, `orig_browser_delta` :818, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_transition_closed_previous` :604, `cand_transition_closed_lifecycle` :605, `cand_browser_fact_previous_lifecycle_state` :815, `cand_browser_fact_lifecycle_state` :815, `cand_browser_delta` :818, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | lifecycle_state missing from changed_fields: when browser_delta holds, changed_fields is the exact record delta, so the before and after records agree on lifecycle_state; when the record-join rows (browser_fact_previous_lifecycle_state, browser_fact_lifecycle_state) hold, the payload previous and current values equal those records and so each other, which refuses at transition_closed_previous or transition_closed_lifecycle. Every one of these rows precedes this entailed table. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_transition_promoted_changed` (transition), :613 | `cand_transition_promoted_previous` :610, `cand_transition_promoted_class` :612, `cand_browser_fact_previous_session_class` :815, `cand_browser_fact_session_class` :815, `cand_browser_delta` :818, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | session_class missing from changed_fields: when browser_delta holds, changed_fields is the exact record delta, so the before and after records agree on session_class; when the record-join rows (browser_fact_previous_session_class, browser_fact_session_class) hold, the payload previous and current values equal those records and so each other, which refuses at transition_promoted_previous or transition_promoted_class. Every one of these rows precedes this entailed table. |
| `orig_transition_promoted_changed` (transition), :613 | `orig_transition_promoted_previous` :610, `orig_transition_promoted_class` :612, `orig_browser_fact_previous_session_class` :815, `orig_browser_fact_session_class` :815, `orig_browser_delta` :818, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_transition_promoted_previous` :610, `cand_transition_promoted_class` :612, `cand_browser_fact_previous_session_class` :815, `cand_browser_fact_session_class` :815, `cand_browser_delta` :818, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | session_class missing from changed_fields: when browser_delta holds, changed_fields is the exact record delta, so the before and after records agree on session_class; when the record-join rows (browser_fact_previous_session_class, browser_fact_session_class) hold, the payload previous and current values equal those records and so each other, which refuses at transition_promoted_previous or transition_promoted_class. Every one of these rows precedes this entailed table. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_transition_takeover_changed` (transition), :619 | `cand_transition_takeover_value` :617, `cand_browser_fact_previous_takeover_state` :815, `cand_browser_fact_takeover_state` :815, `cand_browser_delta` :818, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | takeover_state missing from changed_fields: when browser_delta holds, changed_fields is the exact record delta, so the before and after records agree on takeover_state; when the record-join rows (browser_fact_previous_takeover_state, browser_fact_takeover_state) hold, the payload previous and current values equal those records and so each other, which refuses at transition_takeover_value. Every one of these rows precedes this entailed table. |
| `orig_transition_takeover_changed` (transition), :619 | `orig_transition_takeover_value` :617, `orig_browser_fact_previous_takeover_state` :815, `orig_browser_fact_takeover_state` :815, `orig_browser_delta` :818, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_transition_takeover_value` :617, `cand_browser_fact_previous_takeover_state` :815, `cand_browser_fact_takeover_state` :815, `cand_browser_delta` :818, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | takeover_state missing from changed_fields: when browser_delta holds, changed_fields is the exact record delta, so the before and after records agree on takeover_state; when the record-join rows (browser_fact_previous_takeover_state, browser_fact_takeover_state) hold, the payload previous and current values equal those records and so each other, which refuses at transition_takeover_value. Every one of these rows precedes this entailed table. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_transition_pin_changed` (transition), :630 | `cand_transition_pin_previous` :628, `cand_transition_pin_pinned` :629, `cand_memory_fact_previous_pinned` :794, `cand_memory_fact_pinned` :794, `cand_memory_delta_matches` :766, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546, `cand_memory_delta_nonempty` :764; plus the structural rows | — | pinned missing from changed_fields: when memory_delta_matches holds, changed_fields is the exact record delta, so the before and after records agree on pinned; when the record-join rows (memory_fact_previous_pinned, memory_fact_pinned) hold, the payload previous and current values equal those records and so each other, which refuses at transition_pin_previous or transition_pin_pinned. Every one of these rows precedes this entailed table. |
| `orig_transition_pin_changed` (transition), :630 | `orig_transition_pin_previous` :628, `orig_transition_pin_pinned` :629, `orig_memory_fact_previous_pinned` :794, `orig_memory_fact_pinned` :794, `orig_memory_delta_matches` :766, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `orig_memory_delta_nonempty` :764, `cand_transition_pin_previous` :628, `cand_transition_pin_pinned` :629, `cand_memory_fact_previous_pinned` :794, `cand_memory_fact_pinned` :794, `cand_memory_delta_matches` :766, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546, `cand_memory_delta_nonempty` :764; plus the structural rows | — | pinned missing from changed_fields: when memory_delta_matches holds, changed_fields is the exact record delta, so the before and after records agree on pinned; when the record-join rows (memory_fact_previous_pinned, memory_fact_pinned) hold, the payload previous and current values equal those records and so each other, which refuses at transition_pin_previous or transition_pin_pinned. Every one of these rows precedes this entailed table. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_transition_unpin_changed` (transition), :635 | `cand_transition_unpin_previous` :633, `cand_transition_unpin_pinned` :634, `cand_memory_fact_previous_pinned` :794, `cand_memory_fact_pinned` :794, `cand_memory_delta_matches` :766, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546, `cand_memory_delta_nonempty` :764; plus the structural rows | — | pinned missing from changed_fields: when memory_delta_matches holds, changed_fields is the exact record delta, so the before and after records agree on pinned; when the record-join rows (memory_fact_previous_pinned, memory_fact_pinned) hold, the payload previous and current values equal those records and so each other, which refuses at transition_unpin_previous or transition_unpin_pinned. Every one of these rows precedes this entailed table. |
| `orig_transition_unpin_changed` (transition), :635 | `orig_transition_unpin_previous` :633, `orig_transition_unpin_pinned` :634, `orig_memory_fact_previous_pinned` :794, `orig_memory_fact_pinned` :794, `orig_memory_delta_matches` :766, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `orig_memory_delta_nonempty` :764, `cand_transition_unpin_previous` :633, `cand_transition_unpin_pinned` :634, `cand_memory_fact_previous_pinned` :794, `cand_memory_fact_pinned` :794, `cand_memory_delta_matches` :766, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546, `cand_memory_delta_nonempty` :764; plus the structural rows | — | pinned missing from changed_fields: when memory_delta_matches holds, changed_fields is the exact record delta, so the before and after records agree on pinned; when the record-join rows (memory_fact_previous_pinned, memory_fact_pinned) hold, the payload previous and current values equal those records and so each other, which refuses at transition_unpin_previous or transition_unpin_pinned. Every one of these rows precedes this entailed table. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_transition_discard_changed` (transition), :642 | `cand_transition_discard_previous` :638, `cand_transition_discard_state` :640, `cand_memory_fact_previous_verification_state` :794, `cand_memory_fact_verification_state` :794, `cand_memory_delta_matches` :766, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546, `cand_memory_delta_nonempty` :764; plus the structural rows | — | verification_state missing from changed_fields: when memory_delta_matches holds, changed_fields is the exact record delta, so the before and after records agree on verification_state; when the record-join rows (memory_fact_previous_verification_state, memory_fact_verification_state) hold, the payload previous and current values equal those records and so each other, which refuses at transition_discard_previous or transition_discard_state. Every one of these rows precedes this entailed table. |
| `orig_transition_discard_changed` (transition), :642 | `orig_transition_discard_previous` :638, `orig_transition_discard_state` :640, `orig_memory_fact_previous_verification_state` :794, `orig_memory_fact_verification_state` :794, `orig_memory_delta_matches` :766, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `orig_memory_delta_nonempty` :764, `cand_transition_discard_previous` :638, `cand_transition_discard_state` :640, `cand_memory_fact_previous_verification_state` :794, `cand_memory_fact_verification_state` :794, `cand_memory_delta_matches` :766, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546, `cand_memory_delta_nonempty` :764; plus the structural rows | — | verification_state missing from changed_fields: when memory_delta_matches holds, changed_fields is the exact record delta, so the before and after records agree on verification_state; when the record-join rows (memory_fact_previous_verification_state, memory_fact_verification_state) hold, the payload previous and current values equal those records and so each other, which refuses at transition_discard_previous or transition_discard_state. Every one of these rows precedes this entailed table. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_verification_evidence` (verification_support), :664 | `cand_memory_fact_evidence_refs` :794, `cand_verified_claims_support` :746, `cand_verification_override_type` :660, `memory_after_object` :1036, `memory_after_required` :1036, `memory_after_known` :1036, `memory_after_types` :1036, `memory_after_access_count` :1036, `memory_after_half_life` :1036, `memory_after_enums` :1036, `memory_after_currentness` :1036, `memory_after_timestamps` :1036, `memory_after_hashes` :1036, `memory_after_embedding_version` :1036, `memory_after_claims_nonempty` :1036, `memory_after_string_members` :1036, `memory_after_evidence_pattern` :1036, `memory_after_evidence_unique` :1036, `memory_after_support_pattern` :1036, `memory_after_support_unique` :1036, `memory_after_support_subset` :1036, `memory_after_claim_shape` :1036, `memory_after_claim_id` :1036, `memory_after_claim_text` :1036, `memory_after_claim_created_at` :1036, `memory_after_claim_scope` :1036, `memory_after_claim_currentness` :1036, `memory_after_claim_evidence_pattern` :1036, `memory_after_claim_evidence_unique` :1036, `memory_after_claim_evidence_subset` :1036, `memory_after_claim_ids_unique` :1036, `record_resolution_after` :842; plus the structural rows | — | Empty references without override: memory_fact_evidence_refs refuses unless the after record evidence_refs is also empty; the memory_after_* shape rows require at least one claim and every claim evidence_support within evidence_refs, so every claim has empty support, and verified_claims_support refuses (its scope is the same verifying change without a verify-with-override). All these rows precede this entailed table. |
| `orig_verification_evidence` (verification_support), :664 | `orig_memory_fact_evidence_refs` :794, `orig_verified_claims_support` :746, `orig_verification_override_type` :660, `cand_memory_fact_evidence_refs` :794, `cand_verified_claims_support` :746, `cand_verification_override_type` :660, `memory_after_object` :1036, `memory_after_required` :1036, `memory_after_known` :1036, `memory_after_types` :1036, `memory_after_access_count` :1036, `memory_after_half_life` :1036, `memory_after_enums` :1036, `memory_after_currentness` :1036, `memory_after_timestamps` :1036, `memory_after_hashes` :1036, `memory_after_embedding_version` :1036, `memory_after_claims_nonempty` :1036, `memory_after_string_members` :1036, `memory_after_evidence_pattern` :1036, `memory_after_evidence_unique` :1036, `memory_after_support_pattern` :1036, `memory_after_support_unique` :1036, `memory_after_support_subset` :1036, `memory_after_claim_shape` :1036, `memory_after_claim_id` :1036, `memory_after_claim_text` :1036, `memory_after_claim_created_at` :1036, `memory_after_claim_scope` :1036, `memory_after_claim_currentness` :1036, `memory_after_claim_evidence_pattern` :1036, `memory_after_claim_evidence_unique` :1036, `memory_after_claim_evidence_subset` :1036, `memory_after_claim_ids_unique` :1036, `record_resolution_after` :842; plus the structural rows | — | Empty references without override: memory_fact_evidence_refs refuses unless the after record evidence_refs is also empty; the memory_after_* shape rows require at least one claim and every claim evidence_support within evidence_refs, so every claim has empty support, and verified_claims_support refuses (its scope is the same verifying change without a verify-with-override). All these rows precede this entailed table. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_custody_size_type` (memory_evidence_custody), :1221 | ; plus the structural rows | Plans/card2_event_payloads.schema.json:1514 | Plans/card2_event_payloads.schema.json evidence_refs anyOf/1 size_bytes {"type": "integer"} refuses every non-integer and bool through payload_schema; an integral float the stock type admits is refused by payload_numbers (current_integer). Both rows precede this one; custody applies only to an object payload, the payload_schema precondition. |
| `orig_custody_size_type` (memory_evidence_custody), :1221 | ; plus the structural rows | Plans/card2_event_payloads.schema.json:1514 | Plans/card2_event_payloads.schema.json evidence_refs anyOf/1 size_bytes {"type": "integer"} refuses every non-integer and bool through payload_schema; an integral float the stock type admits is refused by payload_numbers (current_integer). Both rows precede this one; custody applies only to an object payload, the payload_schema precondition. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `cand_custody_media_type` (memory_evidence_custody), :1226 | ; plus the structural rows | Plans/card2_event_payloads.schema.json:1519 | Plans/card2_event_payloads.schema.json evidence_refs anyOf/1 media_type {"const": EVIDENCE_MEDIA_TYPE}: a descriptor with another media type matches neither anyOf branch, so payload_schema (same object payload, earlier table) refuses first. |
| `orig_custody_media_type` (memory_evidence_custody), :1226 | ; plus the structural rows | Plans/card2_event_payloads.schema.json:1519 | Plans/card2_event_payloads.schema.json evidence_refs anyOf/1 media_type {"const": EVIDENCE_MEDIA_TYPE}: a descriptor with another media type matches neither anyOf branch, so payload_schema (same object payload, earlier table) refuses first. For the Storage original the same holds view by view; a row gated off because its candidate row refuses leaves that candidate row as the earlier refusal. |
| `token_schema_current_index_read_token` (token_schema), :1233 | `token_observation` :1116; plus the structural rows | — | token_observation requires the current token to equal the read token exactly (strict_equal). If they differ, token_observation refuses; if they are equal, the read-token row on the same predicate (token_schema_index_read_token) refuses the identical value first. Both rows are in the token table, before this one. |
| `token_fullmatch_index_read_token` (token_schema), :1243 | `token_observation` :1116, `generation_identity` :1174, `digest_anchor` :1157, `digest_frontier` :1159, `digest_current_bytes_sha256` :1146, `digest_manifest_bytes_sha256` :1146, `digest_manifest_survivor_prefix_sha256` :1150, `digest_retained_inventory_sha256` :1150, `digest_durable_watermarks_sha256` :1150, `digest_excluded_ranges_sha256` :1150, `digest_retired_inputs_sha256` :1150; plus the structural rows | Plans/event_record_index_checkpoint.schema.json:2598 and the digest patterns after it | Every patterned read_token field (Plans/event_record_index_checkpoint.schema.json $defs/read_token: generation_id, generation_anchor_sha256, frontier_sha256 and the seven source_selection digests) is compared for equality with a value recomputed from its source: generation_identity (eig_ + SP-278 binding digest), digest_anchor, digest_frontier and the seven digest_* rows. Each recomputed value is a lowercase hex digest that matches its pattern in full, so a value that fails only the full match (a trailing LF the stock $ admits) differs from it and that row refuses. All of them are in the reader_source table, before this entailed table. |
| `token_fullmatch_current_index_read_token` (token_schema), :1247 | `token_observation` :1116, `generation_identity` :1174, `digest_anchor` :1157, `digest_frontier` :1159, `digest_current_bytes_sha256` :1146, `digest_manifest_bytes_sha256` :1146, `digest_manifest_survivor_prefix_sha256` :1150, `digest_retained_inventory_sha256` :1150, `digest_durable_watermarks_sha256` :1150, `digest_excluded_ranges_sha256` :1150, `digest_retired_inputs_sha256` :1150; plus the structural rows | Plans/event_record_index_checkpoint.schema.json:2598 and the digest patterns after it | token_observation refuses any difference from the read token (strict_equal); an identical value fails the read-token full match too, which is itself always refused first by a join row: Every patterned read_token field (Plans/event_record_index_checkpoint.schema.json $defs/read_token: generation_id, generation_anchor_sha256, frontier_sha256 and the seven source_selection digests) is compared for equality with a value recomputed from its source: generation_identity (eig_ + SP-278 binding digest), digest_anchor, digest_frontier and the seven digest_* rows. Each recomputed value is a lowercase hex digest that matches its pattern in full, so a value that fails only the full match (a trailing LF the stock $ admits) differs from it and that row refuses. All of them are in the reader_source table, before this entailed table. |
| `token_numbers_index_read_token` (current_integer), :1268 | `token_observation` :1116, `frontier_revision` :1161, `selection_selected_segment_generation` :1154, `selection_manifest_generation` :1154, `selection_recovery_epoch` :1154, `frontier_selection` :1178, `digest_frontier` :1159; plus the structural rows | Plans/event_record_index_checkpoint.schema.json:2606, :2649; scripts/pm_event_index_binding.py:53 | The read_token integer slots (Plans/event_record_index_checkpoint.schema.json $defs/read_token: frontier_revision and source_selection.selected_segment_generation/manifest_generation/recovery_epoch, each integer 0..2^64-1) are each joined exactly to an SP-278 binding value: frontier_revision to frontier.publication_revision (frontier_revision row), the three selection integers to source_facts (selection_* rows) and, through frontier_selection, to frontier.source_selection. An integral float at a slot is refused by that strict join when its partner is an integer; when the partner is the same float, the SP-278 binding codec cannot encode it (pm_event_index_binding.binding_bytes accepts only uint64 integers), so digest_frontier refuses. A value outside 0..2^64-1 is refused by the token stock verdict. All these rows precede this one. |
| `token_numbers_current_index_read_token` (current_integer), :1268 | `token_observation` :1116, `frontier_revision` :1161, `selection_selected_segment_generation` :1154, `selection_manifest_generation` :1154, `selection_recovery_epoch` :1154, `frontier_selection` :1178, `digest_frontier` :1159; plus the structural rows | Plans/event_record_index_checkpoint.schema.json:2606, :2649; scripts/pm_event_index_binding.py:53 | The read_token integer slots (Plans/event_record_index_checkpoint.schema.json $defs/read_token: frontier_revision and source_selection.selected_segment_generation/manifest_generation/recovery_epoch, each integer 0..2^64-1) are each joined exactly to an SP-278 binding value: frontier_revision to frontier.publication_revision (frontier_revision row), the three selection integers to source_facts (selection_* rows) and, through frontier_selection, to frontier.source_selection. An integral float at a slot is refused by that strict join when its partner is an integer; when the partner is the same float, the SP-278 binding codec cannot encode it (pm_event_index_binding.binding_bytes accepts only uint64 integers), so digest_frontier refuses. A value outside 0..2^64-1 is refused by the token stock verdict. All these rows precede this one. For the current token, token_observation also refuses any difference from the read token first. |
| `storage_format_observed_at_utc` (storage_format_observed_at_utc), :1274 | ; plus the structural rows | Plans/event_record.schema.json:88, :210 | Plans/event_record.schema.json properties.observed_at_utc -> $defs/date_time_string (type string, format date-time) with the same registered FormatChecker. On retry the Storage record is the original view, so orig_envelope_schema refuses first. On history the retained event equals the Storage record (historical_record) or historical_record refuses; when equal, cand_envelope_schema refuses the same value first. |
| `storage_format_persisted_at_utc` (storage_format_persisted_at_utc), :1274 | ; plus the structural rows | Plans/event_record.schema.json:91, :210 | Plans/event_record.schema.json properties.persisted_at_utc -> $defs/date_time_string (type string, format date-time) with the same registered FormatChecker. On retry the Storage record is the original view, so orig_envelope_schema refuses first. On history the retained event equals the Storage record (historical_record) or historical_record refuses; when equal, cand_envelope_schema refuses the same value first. |
| `orig_payload_fullmatch` (payload_fullmatch), :501 | `orig_source_storage_instance_id` :525, `orig_source_server_id` :525, `orig_source_computer_id` :525, `orig_source_owner_operation_id` :537, `orig_source_owner_change_id` :537, `orig_source_before_record_ref` :537, `orig_source_after_record_ref` :537, `orig_source_subject` :540, `orig_source_workspace` :542, `orig_scope_project_id` :514, `orig_scope_thread_id` :514, `orig_source_thread_id` :525, `orig_memory_fact_evidence_refs` :794, `cand_source_storage_instance_id` :525, `cand_source_server_id` :525, `cand_source_computer_id` :525, `cand_source_owner_operation_id` :537, `cand_source_owner_change_id` :537, `cand_source_before_record_ref` :537, `cand_source_after_record_ref` :537, `cand_source_subject` :540, `cand_source_workspace` :542, `cand_scope_project_id` :514, `cand_scope_thread_id` :514, `cand_source_thread_id` :525, `cand_memory_fact_evidence_refs` :794; plus the structural rows | the patterned properties of Plans/card2_event_payloads.schema.json $defs/<family> | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). Every patterned payload string (Plans/card2_event_payloads.schema.json: computer_id, server_id, storage_instance_id, owner_operation_id, browser_session_id/gist_id, workspace_id, project_id, thread_id, before/after_record_ref, owner_change_id, inline evidence_refs items) is joined exactly to an owner or record value (the source_*, scope_* and memory_fact_evidence_refs rows). The candidate holds those joins and its own full match, so each joined value matches in full; an original value that fails only the full match differs from it and the join refuses first. |
| `orig_source_project_id` (source_project_id), :525 | `orig_scope_project_id` :514, `cand_scope_project_id` :514; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The candidate payload project_id equals the owner. An original payload project_id that differs: if the original envelope project_id differs from it, scope_project_id refuses; if equal, the original envelope project differs from the candidate envelope project, so its partition (project~ base64url, injective) differs from the scenario partition the candidate holds (scope_partition); in application scope the envelope project must be null (envelope_schema allOf) and scope_project_id refuses. |
| `orig_source_scope_kind` (source_scope_kind), :525 | `orig_scope_scope_kind` :514, `orig_scope_project_id` :514, `orig_scope_schema_family` :518, `cand_scope_scope_kind` :514, `cand_scope_project_id` :514, `cand_scope_schema_family` :518; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The candidate payload scope_kind equals the owner. An original payload scope_kind that differs either differs from its own envelope scope_kind (scope_scope_kind) or the original envelope scope differs from the candidate: application needs a null project_id (envelope_schema allOf, else scope_project_id against the payload), and the partition changes between 'app' and project~ (scope_partition). |
| `orig_private_thread` (private_thread), :522 | `orig_scope_thread_id` :514, `orig_source_thread_id` :525, `orig_scope_scope_kind` :514, `cand_scope_thread_id` :514, `cand_source_thread_id` :525, `cand_scope_scope_kind` :514; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An application memory original with a null envelope thread: the candidate of the same family and scope holds the rule, so its thread, equal to the owner thread (source_thread_id), is non-null; the original payload thread differs from the null envelope thread (scope_thread_id) or, when also null, from the owner (source_thread_id). An original of another scope refuses at the scope rows first. |
| `orig_lineage_run_attempt` (lineage_shape), :527 | `orig_lineage_run_id` :532, `orig_lineage_attempt_id` :532, `cand_lineage_run_id` :532, `cand_lineage_attempt_id` :532; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The candidate holds the shape, so the owner run_id and attempt_id (equal to the candidate, lineage_* joins) are null together or set together; an original with only one null differs from the owner there and that join refuses. |
| `orig_lineage_node` (lineage_shape), :529 | `orig_lineage_node_id` :532, `orig_lineage_run_id` :532, `cand_lineage_node_id` :532, `cand_lineage_run_id` :532; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An original with a null run_id and a node: if the owner run is set, lineage_run_id refuses; if null, the candidate (holding the shape and joins) has a null node equal to the owner, so lineage_node_id refuses. |
| `orig_revision_step` (revision_step), :551 | `orig_source_revision_before` :537, `orig_source_revision_after` :537, `cand_source_revision_before` :537, `cand_source_revision_after` :537; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The candidate holds the step and both revision joins, so owner after = owner before + 1; an original that breaks the step differs from the owner in revision_before or revision_after and that join refuses. |
| `orig_transition_closed_previous` (transition), :604 | `orig_browser_fact_previous_lifecycle_state` :815, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_browser_fact_previous_lifecycle_state` :815, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (previous lifecycle open) with values equal to the before/after records (browser_fact_previous_lifecycle_state); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_closed_lifecycle` (transition), :605 | `orig_browser_fact_lifecycle_state` :815, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_browser_fact_lifecycle_state` :815, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (lifecycle closed) with values equal to the before/after records (browser_fact_lifecycle_state); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_promoted_previous` (transition), :610 | `orig_browser_fact_previous_session_class` :815, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_browser_fact_previous_session_class` :815, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (previous class not normal_browsing) with values equal to the before/after records (browser_fact_previous_session_class); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_promoted_class` (transition), :612 | `orig_browser_fact_session_class` :815, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_browser_fact_session_class` :815, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (class normal_browsing) with values equal to the before/after records (browser_fact_session_class); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_takeover_value` (transition), :617 | `orig_browser_fact_previous_takeover_state` :815, `orig_browser_fact_takeover_state` :815, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_browser_fact_previous_takeover_state` :815, `cand_browser_fact_takeover_state` :815, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (a takeover state change) with values equal to the before/after records (browser_fact_previous_takeover_state, browser_fact_takeover_state); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_created_lifecycle` (transition), :587 | `orig_browser_fact_lifecycle_state` :815, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_browser_fact_lifecycle_state` :815, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (lifecycle open) with values equal to the before/after records (browser_fact_lifecycle_state); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_verify_state` (transition), :627 | `orig_memory_fact_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (verification_state Verified) with values equal to the before/after records (memory_fact_verification_state); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_discard_previous` (transition), :638 | `orig_memory_fact_previous_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_previous_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (previous state not Discarded) with values equal to the before/after records (memory_fact_previous_verification_state); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_discard_state` (transition), :640 | `orig_memory_fact_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The operation command is shared, so an original of another operation than the candidate fails memory_command_* (browser families have one transition per family). With the same operation, the candidate holds the clause (state Discarded) with values equal to the before/after records (memory_fact_verification_state); an original that breaks the clause differs from those records and the record join refuses first. |
| `orig_transition_pin_pinned` (transition), :629 | `orig_memory_fact_pinned` :794, `orig_memory_fact_previous_pinned` :794, `orig_memory_command_manual` :548, `orig_transition_pin_previous` :628, `cand_memory_fact_pinned` :794, `cand_memory_fact_previous_pinned` :794, `cand_memory_command_manual` :548, `cand_transition_pin_previous` :628; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). pin and unpin share cmd.chat.memory.pin, so the candidate is a pin or an unpin. A pin candidate holds this clause with pinned equal to the after record, so an original that breaks it refuses at memory_fact_pinned. An unpin candidate has previous_pinned equal to the before record and opposite to what pin needs, so the original refuses first at memory_fact_previous_pinned or at transition_pin_previous (an earlier row of the transition table). |
| `orig_transition_unpin_pinned` (transition), :634 | `orig_memory_fact_pinned` :794, `orig_memory_fact_previous_pinned` :794, `orig_memory_command_manual` :548, `orig_transition_unpin_previous` :633, `cand_memory_fact_pinned` :794, `cand_memory_fact_previous_pinned` :794, `cand_memory_command_manual` :548, `cand_transition_unpin_previous` :633; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). pin and unpin share cmd.chat.memory.pin, so the candidate is a pin or an unpin. A unpin candidate holds this clause with pinned equal to the after record, so an original that breaks it refuses at memory_fact_pinned. An pin candidate has previous_pinned equal to the before record and opposite to what unpin needs, so the original refuses first at memory_fact_previous_pinned or at transition_unpin_previous (an earlier row of the transition table). |
| `orig_transition_created_revision` (transition), :577 | `orig_source_revision_before` :537, `cand_source_revision_before` :537; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The candidate created event holds revision_before 0, equal to the owner before revision; an original with another revision_before refuses at source_revision_before. |
| `orig_transition_successor_revision` (transition), :599 | `orig_source_revision_before` :537, `cand_source_revision_before` :537; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The candidate holds a nonzero revision_before equal to the owner; an original with revision_before 0 refuses at source_revision_before. |
| `orig_transition_successor_before_ref` (transition), :601 | `orig_source_before_record_ref` :537, `cand_source_before_record_ref` :537; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The candidate names its before record, equal to the owner reference; an original with a null before_record_ref refuses at source_before_record_ref. |
| `orig_transition_verify_succeeded` (transition), :623 | `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The clause reads only the shared owner verification facts. A candidate verify holds it; an original verify on a candidate of another operation fails memory_command_* (cmd.chat.memory.verify is the verify command only). |
| `orig_transition_verify_not_request_only` (transition), :625 | `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The clause reads only the shared owner verification facts. A candidate verify holds it; an original verify on a candidate of another operation fails memory_command_* (cmd.chat.memory.verify is the verify command only). |
| `orig_transition_memory_initial_operation` (transition), :589 | `orig_memory_command_manual` :548, `cand_memory_command_manual` :548; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The candidate initial gist is automatic, so the shared command starts with RealMemoryProvider.; an original manual operation fails memory_command_manual, and an operation outside the enum fails payload_schema. |
| `orig_verification_override_type` (verification_support), :660 | `orig_memory_fact_verification_state` :794, `orig_memory_fact_previous_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_verification_state` :794, `cand_memory_fact_previous_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The row reads the shared owner facts and after record, scoped by the event verification_state, previous_verification_state and operation. When the original and the candidate agree on those three, the row is the candidate row on the same inputs. They cannot differ otherwise: the states are joined to the records (memory_fact_*verification_state) and the operation to the shared command (memory_command_*). |
| `orig_verification_support_type` (verification_support), :661 | `orig_memory_fact_verification_state` :794, `orig_memory_fact_previous_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_verification_state` :794, `cand_memory_fact_previous_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The row reads the shared owner facts and after record, scoped by the event verification_state, previous_verification_state and operation. When the original and the candidate agree on those three, the row is the candidate row on the same inputs. They cannot differ otherwise: the states are joined to the records (memory_fact_*verification_state) and the operation to the shared command (memory_command_*). |
| `orig_verification_override_verify` (verification_support), :662 | `orig_memory_fact_verification_state` :794, `orig_memory_fact_previous_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_verification_state` :794, `cand_memory_fact_previous_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The row reads the shared owner facts and after record, scoped by the event verification_state, previous_verification_state and operation. When the original and the candidate agree on those three, the row is the candidate row on the same inputs. They cannot differ otherwise: the states are joined to the records (memory_fact_*verification_state) and the operation to the shared command (memory_command_*). |
| `orig_verification_support_current` (verification_support), :673 | `orig_memory_fact_verification_state` :794, `orig_memory_fact_previous_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_verification_state` :794, `cand_memory_fact_previous_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The row reads the shared owner facts and after record, scoped by the event verification_state, previous_verification_state and operation. When the original and the candidate agree on those three, the row is the candidate row on the same inputs. They cannot differ otherwise: the states are joined to the records (memory_fact_*verification_state) and the operation to the shared command (memory_command_*). |
| `orig_verified_claims_support` (memory_verified_claims), :746 | `orig_memory_fact_verification_state` :794, `orig_memory_fact_previous_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_verification_state` :794, `cand_memory_fact_previous_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The row reads the shared owner facts and after record, scoped by the event verification_state, previous_verification_state and operation. When the original and the candidate agree on those three, the row is the candidate row on the same inputs. They cannot differ otherwise: the states are joined to the records (memory_fact_*verification_state) and the operation to the shared command (memory_command_*). |
| `orig_verified_claims_current` (memory_verified_claims), :753 | `orig_memory_fact_verification_state` :794, `orig_memory_fact_previous_verification_state` :794, `orig_memory_command_manual` :548, `orig_memory_command_automatic` :546, `cand_memory_fact_verification_state` :794, `cand_memory_fact_previous_verification_state` :794, `cand_memory_command_manual` :548, `cand_memory_command_automatic` :546; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The row reads the shared owner facts and after record, scoped by the event verification_state, previous_verification_state and operation. When the original and the candidate agree on those three, the row is the candidate row on the same inputs. They cannot differ otherwise: the states are joined to the records (memory_fact_*verification_state) and the operation to the shared command (memory_command_*). |
| `orig_custody_authentic` (memory_evidence_custody), :718 | `orig_memory_fact_evidence_refs` :794, `orig_custody_id` :726, `orig_custody_canonical` :728, `orig_custody_row` :710, `orig_custody_decode` :711, `orig_custody_list_type` :712, `orig_custody_list_pattern` :714, `orig_custody_list_unique` :716, `cand_memory_fact_evidence_refs` :794, `cand_custody_id` :726, `cand_custody_canonical` :728, `cand_custody_row` :710, `cand_custody_decode` :711, `cand_custody_list_type` :712, `cand_custody_list_pattern` :714, `cand_custody_list_unique` :716; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An original naming the candidate pack reads the identical pack row and decoded list, which the candidate row accepts. An original naming another pack row: that row decodes to the after-record list only if its bytes are the canonical bytes of that list (custody_canonical), whose BLAKE3 digest is the candidate pack id (custody_id); otherwise memory_fact_evidence_refs, or the row/decode/list rows, refuse first. |
| `orig_custody_durable` (memory_evidence_custody), :719 | `orig_memory_fact_evidence_refs` :794, `orig_custody_id` :726, `orig_custody_canonical` :728, `orig_custody_row` :710, `orig_custody_decode` :711, `orig_custody_list_type` :712, `orig_custody_list_pattern` :714, `orig_custody_list_unique` :716, `cand_memory_fact_evidence_refs` :794, `cand_custody_id` :726, `cand_custody_canonical` :728, `cand_custody_row` :710, `cand_custody_decode` :711, `cand_custody_list_type` :712, `cand_custody_list_pattern` :714, `cand_custody_list_unique` :716; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An original naming the candidate pack reads the identical pack row and decoded list, which the candidate row accepts. An original naming another pack row: that row decodes to the after-record list only if its bytes are the canonical bytes of that list (custody_canonical), whose BLAKE3 digest is the candidate pack id (custody_id); otherwise memory_fact_evidence_refs, or the row/decode/list rows, refuse first. |
| `orig_custody_owner_storage_instance_id` (memory_evidence_custody), :721 | `orig_memory_fact_evidence_refs` :794, `orig_custody_id` :726, `orig_custody_canonical` :728, `orig_custody_row` :710, `orig_custody_decode` :711, `orig_custody_list_type` :712, `orig_custody_list_pattern` :714, `orig_custody_list_unique` :716, `cand_memory_fact_evidence_refs` :794, `cand_custody_id` :726, `cand_custody_canonical` :728, `cand_custody_row` :710, `cand_custody_decode` :711, `cand_custody_list_type` :712, `cand_custody_list_pattern` :714, `cand_custody_list_unique` :716; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An original naming the candidate pack reads the identical pack row and decoded list, which the candidate row accepts. An original naming another pack row: that row decodes to the after-record list only if its bytes are the canonical bytes of that list (custody_canonical), whose BLAKE3 digest is the candidate pack id (custody_id); otherwise memory_fact_evidence_refs, or the row/decode/list rows, refuse first. |
| `orig_custody_owner_server_id` (memory_evidence_custody), :721 | `orig_memory_fact_evidence_refs` :794, `orig_custody_id` :726, `orig_custody_canonical` :728, `orig_custody_row` :710, `orig_custody_decode` :711, `orig_custody_list_type` :712, `orig_custody_list_pattern` :714, `orig_custody_list_unique` :716, `cand_memory_fact_evidence_refs` :794, `cand_custody_id` :726, `cand_custody_canonical` :728, `cand_custody_row` :710, `cand_custody_decode` :711, `cand_custody_list_type` :712, `cand_custody_list_pattern` :714, `cand_custody_list_unique` :716; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An original naming the candidate pack reads the identical pack row and decoded list, which the candidate row accepts. An original naming another pack row: that row decodes to the after-record list only if its bytes are the canonical bytes of that list (custody_canonical), whose BLAKE3 digest is the candidate pack id (custody_id); otherwise memory_fact_evidence_refs, or the row/decode/list rows, refuse first. |
| `orig_custody_owner_scope_kind` (memory_evidence_custody), :721 | `orig_memory_fact_evidence_refs` :794, `orig_custody_id` :726, `orig_custody_canonical` :728, `orig_custody_row` :710, `orig_custody_decode` :711, `orig_custody_list_type` :712, `orig_custody_list_pattern` :714, `orig_custody_list_unique` :716, `cand_memory_fact_evidence_refs` :794, `cand_custody_id` :726, `cand_custody_canonical` :728, `cand_custody_row` :710, `cand_custody_decode` :711, `cand_custody_list_type` :712, `cand_custody_list_pattern` :714, `cand_custody_list_unique` :716; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An original naming the candidate pack reads the identical pack row and decoded list, which the candidate row accepts. An original naming another pack row: that row decodes to the after-record list only if its bytes are the canonical bytes of that list (custody_canonical), whose BLAKE3 digest is the candidate pack id (custody_id); otherwise memory_fact_evidence_refs, or the row/decode/list rows, refuse first. |
| `orig_custody_owner_project_id` (memory_evidence_custody), :721 | `orig_memory_fact_evidence_refs` :794, `orig_custody_id` :726, `orig_custody_canonical` :728, `orig_custody_row` :710, `orig_custody_decode` :711, `orig_custody_list_type` :712, `orig_custody_list_pattern` :714, `orig_custody_list_unique` :716, `cand_memory_fact_evidence_refs` :794, `cand_custody_id` :726, `cand_custody_canonical` :728, `cand_custody_row` :710, `cand_custody_decode` :711, `cand_custody_list_type` :712, `cand_custody_list_pattern` :714, `cand_custody_list_unique` :716; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An original naming the candidate pack reads the identical pack row and decoded list, which the candidate row accepts. An original naming another pack row: that row decodes to the after-record list only if its bytes are the canonical bytes of that list (custody_canonical), whose BLAKE3 digest is the candidate pack id (custody_id); otherwise memory_fact_evidence_refs, or the row/decode/list rows, refuse first. |
| `orig_custody_owner_thread_id` (memory_evidence_custody), :721 | `orig_memory_fact_evidence_refs` :794, `orig_custody_id` :726, `orig_custody_canonical` :728, `orig_custody_row` :710, `orig_custody_decode` :711, `orig_custody_list_type` :712, `orig_custody_list_pattern` :714, `orig_custody_list_unique` :716, `cand_memory_fact_evidence_refs` :794, `cand_custody_id` :726, `cand_custody_canonical` :728, `cand_custody_row` :710, `cand_custody_decode` :711, `cand_custody_list_type` :712, `cand_custody_list_pattern` :714, `cand_custody_list_unique` :716; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). An original naming the candidate pack reads the identical pack row and decoded list, which the candidate row accepts. An original naming another pack row: that row decodes to the after-record list only if its bytes are the canonical bytes of that list (custody_canonical), whose BLAKE3 digest is the candidate pack id (custody_id); otherwise memory_fact_evidence_refs, or the row/decode/list rows, refuse first. |
| `orig_memory_delta_nonempty` (memory_delta), :764 | `orig_memory_delta_matches` :766, `cand_memory_delta_matches` :766; plus the structural rows | — | The Storage original row runs only when the candidate row on the same predicate holds and the original is of the candidate family (orig_family). The row reads only the shared before/after records of the same family, so with the candidate row holding it holds; it cannot refuse for a Storage original at all. |

### Randomized entailment check

`python3 scripts/pm-card2-entailed-fuzz.py --trials 20000 --seed 20261110`: **pass** — 12,849 of 20,000 single-leaf mutations refused, 7,151 accepted; **no entailed row was ever the first refusal**. 43 of the 67 entailed rows were seen refusing beside an earlier row. In 23 co-refusals the first row was not in the entailed row's named list; in each the same mutation also broke that earlier, non-entailed row (for example `/owner` replaced by a scalar, or a revision change that also fails `source_revision_before`). This is finite evidence beside the written proofs, not a proof. The same 20,000-trial run at `8e69371bf0` (kept in `final-8e69371bf0/fuzz.out`) did not show an entailed row first either, but replaying its co-refusals showed that the original's SP-337 route clause also depends on the original's own payload size (an original differing only in a shorter `ts` can need no pack while the candidate does), so `orig_custody_route` was reachable: it left the entailed set and got the witness `p2a/orig-pack-route-short-ts` (commit `1d51901d87`).

### Standing checks and "What Astra keeps finding" at this head

The complete checker reruns every earlier fixture (16,343 negatives, 283 positives) plus the part 2A witnesses, so the round-4 coverage of standing checks 1-11 is carried; what this pass changes is below.

| Class | How this pass rules it out (or what stays open) |
|---|---|
| 1 Forged/contradictory inputs | Identities, keys, digests and pack ids are recomputed by their rows; Storage-original rows now refuse a forged original field by field (`orig_*` witnesses), and an original of another family is `orig_family`. |
| 2 Storage-assigned metadata | sequence_id is `storage_uint64` and joined exactly to receipt and reader copies; assigned fields stay outside the producer projection. |
| 3 History both ways | Retained positives (replay-only and other policies after live changes) still pass; withdrawn/forged/foreign history refuses. Retained-recipe selection (SP-1101) is part 2B. |
| 4 One field read two ways | `strict_equal` is type- and bit-exact (int ≠ float, 0.0 ≠ -0.0); `token_observation` now uses it (before, `1 == 1.0` passed). |
| 5 Unvisited refs | Eager reference resolution of all three schemas still runs first (unchanged). |
| 6 Size of every stored part | Inline 16 KiB and SP-337 pack rows are split per clause; the Storage original's inline body has its own witness (`p2a/orig-inline-oversized`). |
| 7 Custody on every path | Pack custody rows run for the candidate and the original; Storage-original rows cover retry; the original must be of the candidate family. |
| 8 Masked negatives | Every witness is refused first at its row with no other non-entailed row (checker judge, lane matrix, tool matrix and cuts: 0 unrelated, 0 masked). |
| 9 Grades | Only cells whose stated defect is closed with witnesses moved; every other PARTIAL keeps a named part 2B gap. |
| 10 Number spellings | Integral floats at integer slots refuse (CV-1100); 2^53+1, 2^60, u64 max refuse at the producer route; corpus run passes. |
| 10a History under a stricter rule | DCN has one edition (never admitted); SP-1101 dispatch with old-recipe positives and forgery negatives is part 2B. |
| 11 Exact types | Type rows precede value rows per field (Browser, memory, claims, retry, publication, snapshot, no-event count). |
| 12 Formats | Interim only: the lane date-time grammar is enforced eagerly; CV-1101 is part 2B. |

## Sweep part 2B numbers: findings and responses

Number scope merged as `0bea1cefa2` (exactly `58c2816ff3`; number files identical to the gated `a16f67c1ef`). NUMRULE files are unedited. Date-time code is merged but **not adopted**: no `pm_event_datetime.datetime_validator`, `date_time` or inventory gate is called. Recipe IDs, preimages and tuple positions are unchanged: CV-366 `application@1`/`card2@1` keys, the `card2:` event_id, SP-278 binding digests and SP-337 BLAKE3 pack ids.

| Item | Disposition and change | Commit, path:line | Verify |
|---|---|---|---|
| **B1 — semantic integer domain** (fixed for current routes) | `semantic_digest` (lane `rfc8785.dumps`) is replaced by the shared `producer_semantic_digest`; the producer projection is qualified with `producer_semantic_bytes` before any effect, on append, retry and retained reads (`cand_producer_route`) and for the Storage original on retry (`orig_producer_route`). `2^53` encodes exactly (controls `p2a/producer-sequence-2^53`, `p2a/retry-producer-sequence-2^53`); `2^53+1`, `2^60`, `2^64-1` and a 4,400-digit value are refused at the route row. The retry result row compares the shared digests and leaves an unqualifiable projection to the route rows. The payload keeps the owner's u64 revision domain (no lane cap). | `a01d8fc9ff`; `scripts/pm_card2_events.py:504` (`producer_route`), `:1084` (`retry_expected`), `:1104` (`retry_result`); witnesses `p2a/producer-route-*`, `p2a/orig-producer-2^60` | Checker and corpus runs below. SP-1101 retained-recipe selection is part 2B (below). |
| **CV-1100 integer slots** (fixed) | Fixture text parses through the shared `loads_exact`; every integer token becomes an exact integer through `current_integer` (a `-0` token is refused). Every EventRecord, payload and read-token integer slot the stock Draft 2020-12 validator admits is passed to `current_integer`, so `1.0`, `1e0`, `-0.0` refuse at the slot row (`*_envelope_numbers`, `*_payload_numbers`; the read-token rows are entailed by their exact joins). Ranges stay with the owner schemas. | `a01d8fc9ff`; `:72` (`materialize`), `:219` (`integer_slots_exact`), `:492` (`envelope_numbers`), `:498` (`payload_numbers`) | 60 converted `…/cv1100-integer-slot` negatives; `p2a/revision-integral-float`, `p2a/pack-size-integral-float`, `p2a/orig-producer-integral-float`, `p2a/orig-sequence-integral-float`, `p2a/history-sequence-integral-float`, `p2a/orig-pack-size-float`. |
| **B2 — Storage u64 sequence** (fixed) | `sequence_id` on the event (append, retry, retained) and on the Storage original (retry) is `storage_uint64` (`*_sequence_u64`), never capped at 2^53 and outside producer semantics. Receipt and reader copies join it with exact typed equality, so a coherent out-of-range or float-spelled copy is refused at the slot or join row. | `a01d8fc9ff`; `:494` (`sequence_u64`), `:229` (`strict_equal`) | `p2a/sequence-u64`, `p2a/sequence-4400-digit`, `p2a/orig-sequence-u64`, `p2a/orig-sequence-integral-float`, `p2a/history-sequence-integral-float`. |
| **Browser numeric ranges** (fixed) | `browser_session_state.v1` viewport width/height are u32 (`current_integer(…, 0, 2^32-1)`); scroll x/y and zoom are exact finite f64 (an integer only when exactly representable). Exact types are still checked first by their own rows; no serializer, float normalization or signed-zero erasure. `strict_equal` compares floats by IEEE bits, so `0.0` and `-0.0` are different observations in deltas and joins. | `a01d8fc9ff`; `:296` (`f64_exact`), `:913` (u32 rows), `:921` (f64 rows), `:229` (`strict_equal`) | `p2a/{before,after}-record-viewport.*`, `…-scroll_position.*`, `…-zoom_level` (10 witnesses). |
| **4,400-digit crash** | See part 2A. | `a01d8fc9ff` | Corpus long-integer routes below. |
| **Self-test** | `python3 scripts/pm_event_numbers.py --self-test --scope numbers` exits 0 with `"status": "pass"`: 580/580 cases, 304 negatives, 63 owner checks. Credited exactly as reported. | — | `final/numbers-selftest.out`. |
| **Shared corpus through the complete checker** | `scripts/pm-card2-number-corpus.py` runs every number-scope corpus case (token, slot, parse, current_json, current_json_slot, uint64, integer; 163 cases) through raw ingress (`loads_fixture` against the shared `loads_current_json`) and through the complete checker at `producer_sequence_id` (append), `sequence_id` (append) and the Storage original's `producer_sequence_id` (retry), with the expected first row composed from jsonschema stock semantics and the shared helpers alone. | `23c8b65729`; `scripts/pm-card2-number-corpus.py` | `final/number-corpus.out`. |
| **Owner text** | One sweep paragraph in each of CV-780..785 (CV-1100 beside CV-317/CV-366) and SP-760..765 (SP-1100 beside SP-026/SP-236/SP-278): exact integer slots, the qualified producer route before effects, uint64 sequence outside producer semantics, exact typed joins, the Browser u32/f64 and memory integer source domains, and SP-1101 + CV-1101 still to be adopted together. | `53f2f77486`; `Plans/Contracts_V0.md` (CV-780..785), `Plans/storage-plan.md` (SP-760..765) | Shards/index regenerated; canonical text changed in exactly these units plus ATS-380. |

### Part 2B items

Timestamp items and the SP-1101 recipe tuple that carries the date-time profile. **This lane's own review of its timestamp fields is interim only.**

| Item | Location | Work |
|---|---|---|
| **SW1 / CV-1101 date-time adoption** | `scripts/pm_card2_events.py:50` (`timestamp_valid`) and its global (`:61`) `FormatChecker.checkers['date-time']` registration; the EventRecord `occurred_at_utc`/`observed_at_utc`/`persisted_at_utc` checks inside `*_envelope_schema`; payload `ts`; memory facts `created_at`/`updated_at`/`last_access_at` and claim `created_at` (`memory_*_timestamps`, `memory_*_claim_created_at`, `command_only_*` rows); entailed `storage_format_observed_at_utc` / `storage_format_persisted_at_utc` | Adopt `pm_event_datetime.datetime_validator` / `date_time` with the `event_record` profile and the CV-253 `storage_utc_z` profile for Storage-assigned observed/persisted fields, once the date-time gate passes; then rerun the witnesses, the collection and the tool. Not adopted here. |
| **SP-1101 authenticated retained-recipe dispatch** | Retry original and retained read paths (`orig_*` rows, `historical_record`, `storage_*`); NUMRULE DCN section ("historical source/schema/hash selection must come from authentic original edition") | Compose `RetainedDispatcher` with the genuine original owner and a frozen recipe map; the recipe tuple carries the number recipe and the CV-1101 timestamp profile together. Add old number/type positives and recipe-forgery negatives across every history/retry rule subset. DCN has a single edition (never admitted), so today's current recipe is the only write-time recipe; the dispatch is still required before admission. |

### Family grades before and after

Before: the round-4 grades carried by sweep part 1. After: re-graded at the implementation head against the same rubric. Membership stays ABSENT, native execution NOT_RUN. These are self-grades; Sol and Astra review the lane after part 2B.

| Family | Before (PASS / PARTIAL / ABSENT) | After | Cell that moved |
|---|---|---|---|
| `browser.session.created` | 7 / 4 / 1 | 7 / 4 / 1 | none (its closed payload was already PASS) |
| `browser.session.state_changed` | 6 / 5 / 1 | 7 / 4 / 1 | closed_payload_schema PARTIAL → PASS |
| `browser.session.closed` | 6 / 5 / 1 | 7 / 4 / 1 | closed_payload_schema PARTIAL → PASS |
| `browser.session.promoted` | 6 / 5 / 1 | 7 / 4 / 1 | closed_payload_schema PARTIAL → PASS |
| `browser.session.takeover_state_changed` | 6 / 5 / 1 | 7 / 4 / 1 | closed_payload_schema PARTIAL → PASS |
| `memory.gist_state_changed` | 6 / 5 / 1 | 7 / 4 / 1 | closed_payload_schema PARTIAL → PASS |

- **closed_payload_schema → PASS (five families):** its only stated defect was B1 (u64 revisions beyond the retry encoder). The payload keeps the owner u64 domain; every integer slot admits only an exact current integer; the qualified producer route refuses an unencodable projection before effects on append, retry and retained reads alike, with witnesses for 2^53+1, 2^60, 2^64-1 and 4,400 digits and controls for 2^53.
- **Still PARTIAL, each with its remaining part 2B gap:** replay_idempotency (SP-1101 authenticated write-time recipe selection; B1's current routes are closed), redaction_custody (B2 and the Browser ranges closed; SP-1101 original edition/recipe selection for retained custody remains), compatibility_withdrawal (SW1, CV-1101 + SP-1101), positive_negative_oracles (guard tables certified, but the timestamp review is interim only and the SP-1101 old-recipe positives and recipe-forgery negatives are part 2B).
- The 11 exclusions are unchanged (four independent; the seven memory exclusions still conditional on the complete surviving contract after part 2B). No admission or denominator removal is claimed.

### Checks at the implementation head

All serial, one at a time, at `1d51901d87` (final run `final/run.log`; it pauses between stages below 10 GB available). The first final run, at `8e69371bf0`, had the same exits; it is kept as `final-8e69371bf0/`.

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_card2_events.py` | 0 | PASS: 283 positives, 7 controls, 16,578 witnesses, 562 rows / 138 tables, 495 rows refused first, 67 entailed, 0 errors |
| `python3 scripts/pm_card2_events.py --family browser.session.created` | 0 | PASS: 34 positives, 1,852 witnesses, 187 rows refused first by this family |
| `python3 scripts/pm_card2_events.py --family browser.session.state_changed` | 0 | PASS: 34 positives, 2,952 witnesses, 277 rows refused first by this family |
| `python3 scripts/pm_card2_events.py --family browser.session.closed` | 0 | PASS: 34 positives, 2,901 witnesses, 226 rows refused first by this family |
| `python3 scripts/pm_card2_events.py --family browser.session.promoted` | 0 | PASS: 34 positives, 2,901 witnesses, 227 rows refused first by this family |
| `python3 scripts/pm_card2_events.py --family browser.session.takeover_state_changed` | 0 | PASS: 34 positives, 2,900 witnesses, 227 rows refused first by this family |
| `python3 scripts/pm_card2_events.py --family memory.gist_state_changed` | 0 | PASS: 113 positives, 3,072 witnesses, 300 rows refused first by this family |
| `python3 scripts/pm-card2-table-generate.py --check` | 0 | {'tables': 138, 'rows': 562, 'stale': [], 'extra': []} |
| `python3 scripts/pm-card2-p2a-cases.py --check` | 0 | 235 witnesses, 7 controls, 229 target rows, failures 0, stale False |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `"status": "pass"`, 580/580 cases, 63 owner checks, all true: True |
| `python3 scripts/pm-card2-number-corpus.py` | 0 | pass: 163 corpus cases, 460 route runs (213 accepted, 247 refused), 0 disagreements, 0 untracked; 4,400-digit routes at their rows |
| `python3 scripts/pm-card2-guard-tables.py --out <dir>` | 0 | 16,868 cases, 0 findings, 495/495 provable rows proved, 67 entailed; every run table PASS |
| `python3 scripts/pm-card2-entailed-fuzz.py --trials 20000` | 0 | pass: no entailed row first in 20,000 trials |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass (3,100 shards, 99 documents) |
| `python3 scripts/pm-plan-index.py validate` | 1 | 59 rows at origin/main `f0c0d38d3f`: 21 `plan_unit_removal_ledger_invalid`, 38 `plan_unit_removed_without_ledger_decision`; none names a DCN unit (units added on main after the lane base; no rebase this round) |

No browser, pm-mail, subagent, admission, registry append, Decision Log entry, governance or Spec Lock write, `.gitignore` edit, rebase or `main` push. One heavy start breached the brief's memory rule: the second final run was started at 9 GB available and stopped by me after 6 seconds; it was restarted at 14.4 GB.


### Evidence

Folder: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCN/sweep-p2a/` (`SHA256SUMS` covers every file; `HEAD.txt` names the delivery head).

| File | What it is | SHA-256 |
|---|---|---|
| `final/guard/summary.json` | final guard-tool run at 1d51901d87 (per-table reports beside it) | `e5f4524ce6e48e5fa5c5f97a3fea98d8d8a8f9fa01adbc32fa53bd2c1a0df3ae` |
| `final/checker.json` | complete checker run | `f23a7d3ab043782ebb8b1197297f7968c92e030b0a0e76334f6c459a2fc6491a` |
| `final/number-corpus.out` | shared corpus through the complete checker | `a6cd4a7d4b835c6c1484efa98dab18bdb730dde2022675a0f99edd3e0863759e` |
| `final/numbers-selftest.out` | pm_event_numbers --self-test --scope numbers | `3e81a92755d356cfe5d3d84cc01c8ed2023ebbe614a4407c93c1789607950754` |
| `final/fuzz.out` | randomized entailment check, 20,000 trials | `2e8efe70b66ba9b2abb85b42a8eb0fd46e012218b1d712b1533d216fee0526b3` |
| `final/exits.txt` | exit codes of every final stage | `615110ffcf095f7a585c7c5d95beaff5a1f83b40710deb78d49bb011d718830a` |
| `final-8e69371bf0/fuzz.out` | the 20,000-trial run at 8e69371bf0 whose replay exposed orig_custody_route | `d0b8d8b609ad48ee2077c47452c8570d8fbedd1ce42679f570c94c34f493c8cb` |
| `final-8e69371bf0/guard-summary.json` | the guard-tool run at 8e69371bf0 (494/494, 68 entailed) | `3a41f43bff17a9af127ecc4bcacb5d842cf0ed5de01284fe83b5861e8be2688d` |
| `records/fixture-repair-record.json.gz` | every converted, removed, retargeted and one-sided fixture case | `31fc7f498ffac2e45f11bdef12b07d666c82620c15bbebf385147edd1dad88a4` |
| `tools/fixture_repair.py` | the fixture repair, run on the part-1 fixtures | `aaf13d43c5bad5604748ba6c3c9249b528103a1c8f7b3e27a10e22aff9af0480` |
| `records/crash-evidence.json` | the 4,400-digit crash on the old checker | `157466378b0f7bfc4d1c8264ddae05d312739b21cd9f8c8a40427cd0b43687b0` |
| `records/pin-relocation.json` | self-grade citation relocation | `bcbc2996143b4bdad03ddd78c703c5da0b08c1ee09ccf27ab9d89fd438b11e1d` |
| `records/entailed-table.md` | the entailed-row proof table | `d52c8d376eda5093101c31fdc63abdd22b40af4502ef3afc0191912e405819c0` |
| `records/index-validate-final.json` | index validate at the delivery tree (origin/main SHA in index-validate-final.main) | `f445ba715ff28c5f48e99bbbab865887deb63424b6c00678f8c9db6f3093b2a5` |
