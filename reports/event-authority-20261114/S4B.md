# S4B — PNC-019 lane s4b: the 51 Browser Program recount names (stream E, 2026-11-14)

**Branch** `plans/ea-pnc-s4b-20261114`. **Base** `3c33510c576d87a9ad512c4519d417e4fd4441df` (batch-3 integration; batch 3 had not landed). **Content head** `a2d4c7646f`; this report commit follows it. Planning-document and static-oracle work only. No admission, registry family append, Decision Log entry, reseal, Spec Lock, `.evidence` or frozen-validator edit; `main` not pushed; no landing lock.

## Result

| Item | Result |
|---|---|
| **Families** | 51 prepared (bucket b), 0 merged, 0 excluded, 0 stopped for Jared |
| **Grade per family** | before **3/7/2**, after **11/0/1 x51** (PASS/PARTIAL/ABSENT; membership ABSENT until admission) |
| **Complete checker** | `pass`: 338 rows in 62 tables (at most 8 rows each), 1020 controls, 45191 negatives (18649 explicit, 26542 generated and credited), 11791 of 11957 row/family pairs witnessed, the rest each with a checked reason |
| **Gated guard tool** (`004bdedd63`) | 62 tables, 338 rows: 336 proved, 2 unproved (each with a written proof, alone in its own table); 60/60 run tables PASS; masked 0 |
| **Mutations** | 50/50 killed |
| **Numbers** | shared corpus through the complete append route: {"accepted": 1020, "refused": 2244, "load_refused": 2346}, 0 disagreements; `--self-test --scope numbers` `pass` |
| **Native execution** | NOT_RUN |

## Authority and premise checks

- **DL-046** (`Plans/Decision_Log.md`, "Bounded Browser technical bindings and individual admission landings") grants Browser and Storage owners bounded technical bindings for exactly these 53 names, "only after a documented **per-family** search", with each new definition "explicitly labelled newly authored". Every binding here is so labelled; no definition is shared between families or inferred from a sibling.
- **Retention.** SP-262 assigns the 51: 23 Run-bound families `RP-RUNTIME-365D`, 28 others `RP-AUTHORITY-INDEFINITE`. DL-401 (Card 1) records: "Browser retention was not put to a ruling: SP-262’s split stands." The premise holds at the base: every policy exists in `Plans/storage_value_registry.json` and the admission validator confirms each row's binding. Each derived checkpoint gets `RP-PROJECTION-3GEN@1.0.0`. **No retention cell is pending; no question for Jared.**
- **Envelope edition.** CV-332: "Other prepared Browser families retain their existing 2.0.0 edition". SP-286 custody v2 pins `original_event_value_commitment.event_schema_version` to `2.0.0` (`Plans/event_append_receipt_contracts.schema.json`), so the section 1.2.1 EventRecord 3.0.0 reference route cannot carry v2 custody yet. Each CV-25xx keeps the 2.0.0 inline route: a body above 16384 canonical bytes refuses `payload_inline_limit` before append, without narrowing the schema (the rule W3A used for numbers). See "Notes for integration".
- **Registration permission** (card 1) is S5's, not this lane's. These families are prepared only.

## Per-family search and outcome

An exact-token scan of every tracked file under `Plans/`, `scripts/` and `tests/` at the base (5512 files; shards, plan index, migration runs, audits, evidence and ledgers excluded) finds each of the 51 names only in the section 3.18A census, DL-046's list, its prepared row, its payload definition, the candidate inventory, the admission fixtures and DS's retained-read fixture custody (`Plans/ds_original_custody.json`), plus the production wiring row for the 16 command-bound families. No family has any publisher, identity recipe, consumer, projector, checkpoint or withdrawal binding: the binding-identifier scan returns zero hits. Evidence: `reports/event-authority-20261114/S4B-search.json`.

| Event | Envelope | Storage | Operating reader | Checkpoint family | Event retention |
|---|---|---|---|---|---|
| `browser.workspace.closed` | CV-2500 | SP-2500 | `browser.workspace_inventory.workspace_closed.v1@1.0.0` | `browser_workspace_closed_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.page.created` | CV-2501 | SP-2501 | `browser.page_history.page_created.v1@1.0.0` | `browser_page_created_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.page.activated` | CV-2502 | SP-2502 | `browser.page_history.page_activated.v1@1.0.0` | `browser_page_activated_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.page.closed` | CV-2503 | SP-2503 | `browser.page_history.page_closed.v1@1.0.0` | `browser_page_closed_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.controller_lease.granted` | CV-2504 | SP-2504 | `browser.controller_history.controller_lease_granted.v1@1.0.0` | `browser_controller_lease_granted_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.controller_lease.renewed` | CV-2505 | SP-2505 | `browser.controller_history.controller_lease_renewed.v1@1.0.0` | `browser_controller_lease_renewed_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.controller_lease.lost` | CV-2506 | SP-2506 | `browser.controller_history.controller_lease_lost.v1@1.0.0` | `browser_controller_lease_lost_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.controller_lease.takeover_requested` | CV-2507 | SP-2507 | `browser.controller_history.controller_lease_takeover_requested.v1@1.0.0` | `browser_controller_lease_takeover_requested_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.controller_lease.takeover_completed` | CV-2508 | SP-2508 | `browser.controller_history.controller_lease_takeover_completed.v1@1.0.0` | `browser_controller_lease_takeover_completed_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.navigation.generation_changed` | CV-2509 | SP-2509 | `browser.page_history.navigation_generation_changed.v1@1.0.0` | `browser_navigation_generation_changed_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.document.generation_changed` | CV-2510 | SP-2510 | `browser.page_history.document_generation_changed.v1@1.0.0` | `browser_document_generation_changed_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.representation.captured` | CV-2511 | SP-2511 | `browser.representation_history.representation_captured.v1@1.0.0` | `browser_representation_captured_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.representation.delta_created` | CV-2512 | SP-2512 | `browser.representation_history.representation_delta_created.v1@1.0.0` | `browser_representation_delta_created_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.representation.queried` | CV-2513 | SP-2513 | `browser.representation_history.representation_queried.v1@1.0.0` | `browser_representation_queried_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.representation.invalidated` | CV-2514 | SP-2514 | `browser.representation_history.representation_invalidated.v1@1.0.0` | `browser_representation_invalidated_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.script.compile_started` | CV-2515 | SP-2515 | `browser.program_inspect.script_compile_started.v1@1.0.0` | `browser_script_compile_started_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.script.compiled` | CV-2516 | SP-2516 | `browser.program_inspect.script_compiled.v1@1.0.0` | `browser_script_compiled_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.script.compile_failed` | CV-2517 | SP-2517 | `browser.program_inspect.script_compile_failed.v1@1.0.0` | `browser_script_compile_failed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.execution_strategy.selected` | CV-2518 | SP-2518 | `browser.routing_history.execution_strategy_selected.v1@1.0.0` | `browser_execution_strategy_selected_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.execution_strategy.fallback_selected` | CV-2519 | SP-2519 | `browser.routing_history.execution_strategy_fallback_selected.v1@1.0.0` | `browser_execution_strategy_fallback_selected_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.program.started` | CV-2520 | SP-2520 | `browser.program_inspect.program_started.v1@1.0.0` | `browser_program_started_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.checkpointed` | CV-2521 | SP-2521 | `browser.program_inspect.program_checkpointed.v1@1.0.0` | `browser_program_checkpointed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.paused` | CV-2522 | SP-2522 | `browser.program_inspect.program_paused.v1@1.0.0` | `browser_program_paused_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.resumed` | CV-2523 | SP-2523 | `browser.program_inspect.program_resumed.v1@1.0.0` | `browser_program_resumed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.completed` | CV-2524 | SP-2524 | `browser.program_inspect.program_completed.v1@1.0.0` | `browser_program_completed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.failed` | CV-2525 | SP-2525 | `browser.program_inspect.program_failed.v1@1.0.0` | `browser_program_failed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.cancelled` | CV-2526 | SP-2526 | `browser.program_inspect.program_cancelled.v1@1.0.0` | `browser_program_cancelled_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.segment.started` | CV-2527 | SP-2527 | `browser.program_inspect.program_segment_started.v1@1.0.0` | `browser_program_segment_started_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.segment.checkpointed` | CV-2528 | SP-2528 | `browser.program_inspect.program_segment_checkpointed.v1@1.0.0` | `browser_program_segment_checkpointed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.segment.completed` | CV-2529 | SP-2529 | `browser.program_inspect.program_segment_completed.v1@1.0.0` | `browser_program_segment_completed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.segment.failed` | CV-2530 | SP-2530 | `browser.program_inspect.program_segment_failed.v1@1.0.0` | `browser_program_segment_failed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.segment.timed_out` | CV-2531 | SP-2531 | `browser.program_inspect.program_segment_timed_out.v1@1.0.0` | `browser_program_segment_timed_out_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.timeout.stopped` | CV-2532 | SP-2532 | `browser.program_inspect.program_timeout_stopped.v1@1.0.0` | `browser_program_timeout_stopped_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.timeout.effects_reconciled` | CV-2533 | SP-2533 | `browser.program_inspect.program_timeout_effects_reconciled.v1@1.0.0` | `browser_program_timeout_effects_reconciled_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program.timeout.effect_state_unknown` | CV-2534 | SP-2534 | `browser.program_inspect.program_timeout_effect_state_unknown.v1@1.0.0` | `browser_program_timeout_effect_state_unknown_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program_workspace.created` | CV-2535 | SP-2535 | `browser.program_inspect.program_workspace_created.v1@1.0.0` | `browser_program_workspace_created_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program_workspace.updated` | CV-2536 | SP-2536 | `browser.program_inspect.program_workspace_updated.v1@1.0.0` | `browser_program_workspace_updated_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program_workspace.checkpointed` | CV-2537 | SP-2537 | `browser.program_inspect.program_workspace_checkpointed.v1@1.0.0` | `browser_program_workspace_checkpointed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program_workspace.spilled` | CV-2538 | SP-2538 | `browser.program_inspect.program_workspace_spilled.v1@1.0.0` | `browser_program_workspace_spilled_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.program_workspace.closed` | CV-2539 | SP-2539 | `browser.program_inspect.program_workspace_closed.v1@1.0.0` | `browser_program_workspace_closed_index_checkpoint` | `RP-RUNTIME-365D@1.0.0` |
| `browser.screenshot.model_attachment_selected` | CV-2540 | SP-2540 | `browser.routing_history.screenshot_model_attachment_selected.v1@1.0.0` | `browser_screenshot_model_attachment_selected_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.screenshot.skipped` | CV-2541 | SP-2541 | `browser.routing_history.screenshot_skipped.v1@1.0.0` | `browser_screenshot_skipped_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.route.fetch_selected` | CV-2542 | SP-2542 | `browser.routing_history.route_fetch_selected.v1@1.0.0` | `browser_route_fetch_selected_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.route.browser_escalated` | CV-2543 | SP-2543 | `browser.routing_history.route_browser_escalated.v1@1.0.0` | `browser_route_browser_escalated_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.routine.generated` | CV-2544 | SP-2544 | `browser.routine_history.routine_generated.v1@1.0.0` | `browser_routine_generated_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.routine.validated` | CV-2545 | SP-2545 | `browser.routine_history.routine_validated.v1@1.0.0` | `browser_routine_validated_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.routine.promoted` | CV-2546 | SP-2546 | `browser.routine_history.routine_promoted.v1@1.0.0` | `browser_routine_promoted_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.routine.invalidated` | CV-2547 | SP-2547 | `browser.routine_history.routine_invalidated.v1@1.0.0` | `browser_routine_invalidated_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.routine.disabled` | CV-2548 | SP-2548 | `browser.routine_history.routine_disabled.v1@1.0.0` | `browser_routine_disabled_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.session.reconstructed_on_host` | CV-2549 | SP-2549 | `browser.handoff_history.session_reconstructed_on_host.v1@1.0.0` | `browser_session_reconstructed_on_host_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `browser.session.interrupted` | CV-2550 | SP-2550 | `browser.handoff_history.session_interrupted.v1@1.0.0` | `browser_session_interrupted_index_checkpoint` | `RP-AUTHORITY-INDEFINITE@1.0.0` |

Per-family identifiers (publication operation, owner transition, subject pointer, checkpoint key and schema, predicates) are in `reports/event-authority-20261114/S4B-contracts.json`.

## What this lane adds

| Path | What it is |
|---|---|
| `Plans/Section15_MVP_Promoted_Features_Spec.md` "Browser Program prepared event authority — 2026-11-14" | One semantic owner section per family (`#browser-program-event-authority-<slug>`): search and reuse, entitling transition, event-silent outcomes, family predicates, producer and order, retention, consumer, custody, compatibility and withdrawal |
| `Plans/Contracts_V0.md` CV-2500..CV-2550 | Envelope, identity, idempotency, body route and history dispatch per family |
| `Plans/storage-plan.md` SP-2500..SP-2550 | Append order, SP-286 custody, the filtered SP-278 checkpoint, read and rebuild, retention and custody, SP-1101 retained reads, withdrawal per family |
| `Plans/Automated_Testing_System.md` ATS-2500 | The oracle contract the checker executes |
| `Plans/browser_program_event_contracts.schema.json` | 51 closed checkpoint and 51 retired-generation definitions; shared `$defs` are mechanical primitives only |
| `Plans/storage_value_registry.json` | 51 materialized `later_gui_or_feature_projection` checkpoint rows, appended at the end (the date-time inventory addresses rows by position) |
| `Plans/browser_event_admission.json` | Each of the 51 rows: `semantic_owner_ref` to its own section; `consumer_contract_refs` gain its SP and CV unit. `admission_status` stays `prepared_not_admitted` |
| `scripts/pm_s4b_browser_events.py`, `scripts/pm_s4b_table_*.py`, `scripts/pm-s4b-table-generate.py` | The complete checker and its 62 generated guard tables |
| `scripts/pm-s4b-guard-proof.py` | Gated-tool driver (one tool run per table) |
| `scripts/pm-s4b-mutations.py` | Mutation proof |
| `reports/event-authority-20261114/S4B-*.json` | Contracts spec, search evidence, self-grade |

## How the checker is built

- **One predicate per row** (`row()`, `scripts/pm_s4b_browser_events.py:1185`), generated into one module per table (`scripts/pm-s4b-table-generate.py`); `evaluate()` (`scripts/pm_s4b_browser_events.py:2472`) refuses only through those modules.
- **Authority first.** `build_case()` (`scripts/pm_s4b_browser_events.py:517`) builds Storage's state and the committed owner transition, then derives payload, envelope, Storage's record, partition and custody. A witness applies one hook at one stage; every later stage is re-derived, so copies, digests and receipts stay coherent.
- **Computed store operations.** Dedupe and retry (`retry_op`, `scripts/pm_s4b_browser_events.py:981`), compare-and-swap advance (`advance`, `scripts/pm_s4b_browser_events.py:715`), withdrawal (`scripts/pm_s4b_browser_events.py:724`), rebuild (`scripts/pm_s4b_browser_events.py:733`) and cleanup (`scripts/pm_s4b_browser_events.py:739`) are model code, never fixture flags.
- **Full owner schemas** with the shared CV-1101 checker (`schema_errors`, `scripts/pm_s4b_browser_events.py:153`); every Plans schema is registered offline and every `$ref` resolves eagerly ({"payloads": 789, "owner": 370, "event_record": 46, "receipt": 13, "checkpoints": 1451}).
- **Family predicates** mirror the shared Browser owner validator's GS01..GS41, one row each (`PREDICATES`, `scripts/pm_s4b_browser_events.py:570`), cross-checked against `semantic_failures` on every case (`predicate_agreement`, 21323 checks, 0 disagreements).
- **Known-answer checks** pin the identity tuple, partition, prefix scan and binding hash independently (`known_answer_checks`, `scripts/pm_s4b_browser_events.py:3042`).

## Items (W3-P2 steps)

| # | Item | Outcome | Commit, location | How to verify |
|---:|---|---|---|---|
| 1 | Owner text per family (DL-046) | Done: 51 Section 15 sections, CV-2500..2550, SP-2500..2550, ATS-2500, 51 checkpoint schemas and registry rows, admission-row refs | `f1d3a22171`, `41ca186dbf`; `Plans/Section15_MVP_Promoted_Features_Spec.md:12374`, `Plans/Contracts_V0.md:26890`, `Plans/storage-plan.md:19984`, `Plans/Automated_Testing_System.md:14153`, `Plans/browser_program_event_contracts.schema.json:198` | `python3 scripts/pm_s4b_browser_events.py` (spec_consistency); `python3 scripts/pm-browser-event-admission.py` |
| 2 | Guard tables (step 1) | Done: 62 tables, 338 rows; 336 proved by the tool, 2 entailed alone in own tables with proofs | `5020f48de9`, `f0fc9e6e74`; `scripts/pm_s4b_browser_events.py:1185` (row), `scripts/pm_s4b_browser_events.py:2472` (evaluate), `scripts/pm_s4b_table_*.py` | `python3 scripts/pm-s4b-table-generate.py --check`; `python3 scripts/pm-s4b-guard-proof.py collect --out D` then `run --out D` |
| 3 | Numbers (step 2) | Done: shared calls at every integer slot; corpus 0 disagreements; self-test pass; 4,400-digit integers refuse with codes | `5020f48de9`; `scripts/pm_s4b_browser_events.py:2995`, `scripts/pm_s4b_browser_events.py:1445` | `python3 scripts/pm_event_numbers.py --self-test --scope numbers` |
| 4 | Timestamps (step 3) | Done: shared `date_time` per field and profile; inventory re-derived each run; lane-tree inventory gate recorded (sparse-cone only) | `5020f48de9`; `scripts/pm_s4b_browser_events.py:2877`, `scripts/pm_s4b_browser_events.py:2888` | `python3 scripts/pm_event_datetime_inventory.py` (recorded) |
| 5 | Retained reads (step 4) | Done from the start: sealed-receipt dispatch, missing/ambiguous/foreign negatives, store snapshot, instrumented current gate | `5020f48de9`; `scripts/pm_s4b_browser_events.py:943`, `scripts/pm_s4b_browser_events.py:812`; `Plans/storage-plan.md:19996` | retained boundary rows in the complete checker |
| 6 | Retention (step 5) | Done: 51 bound (SP-262; DL-401 keeps the split), checkpoints RP-PROJECTION-3GEN; none pending | `f1d3a22171`; `Plans/storage-plan.md:19940`, `Plans/Decision_Log.md:4500` | `python3 scripts/pm-browser-event-admission.py` (retention_policy_binding) |
| 7 | Mutation proof (quality bar) | Done: 50/50 killed | `f0fc9e6e74`; `scripts/pm-s4b-mutations.py:25` | `python3 scripts/pm-s4b-mutations.py --scratch S` |
| 8 | Re-grade (step 7) | Done: 11/0/1 x51 | report commit; `reports/event-authority-20261114/S4B-self-grade.json` | every quote located at its line by the generator |

## Guard tables on the gated tool (`004bdedd63`)

`python3 scripts/pm-s4b-guard-proof.py collect --out D`, then `run --out D` (per table, at most four tool processes at once, each under `MemoryMax=2G`, `MemorySwapMax=0`). Tool `scripts/pm_guard_isolation.py` sha256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8` (unedited). Each table's tool report names exactly its own module in `static.files`; credit is copied from the tool's rows.

| Result | Count |
|---|---:|
| Tables | 62 |
| Rows | 338 |
| Proved by the tool | 336 |
| Unproved (entailed, each alone in its own table) | 2 |
| Run tables PASS | 60 / 60 |
| Masked negatives | 0 |

**Unproved rows and their proofs:**

- **`append_json_budget`** (rows that always refuse first: `append_inline_limit`, `append_payload_schema`). A payload this row judges passed append_payload_schema (gate pay_dict and table order) and its canonical MessagePack map is at most 16384 bytes (the row applies only then, and append_inline_limit refuses every larger one). For every family, json_budget_bound(family) (scripts/pm_s4b_browser_events.py) walks the closed payload schema and bounds len(JSON) - len(MessagePack) per accepted value: +2 per string (two quotes; every string grammar admits only ASCII characters JSON does not escape), +21 per integer, +4 per boolean, +3 per null, +2 per key, separators and brackets, arrays by maxItems. main() checks every family's bound is finite and 16384 + bound <= 65536 (reported as json_budget_bounds), so no payload reaching this row exceeds 65536 UTF-8 JSON bytes.
- **`retained_resolved`** (rows that always refuse first: `retained_override`, `retained_query`, `retained_receipt_present`, `retained_receipt_unique`, `retained_receipt_wellformed`, `retained_binding`, `retained_recipe_known`, `retained_disclosure`, `retained_no_current_gate`, `retained_frozen_decodes`, `retained_frozen_envelope_schema`, `retained_frozen_family`, `retained_frozen_recipe_family`, `retained_frozen_observed_utc_z`, `retained_frozen_persisted_utc_z`, `retained_frozen_source_commitment`, `retained_frozen_result_event_id`, `retained_frozen_receipt_schema`, `retained_frozen_receipt_full_value`, `retained_frozen_receipt_event_id`, `retained_frozen_payload_schema_id`, `retained_frozen_payload_schema`, `retained_frozen_identity`, `retained_frozen_key`, `retained_frozen_receipt_semantic`). RetainedDispatcher.resolve (scripts/pm_event_numbers.py:523-545) refuses itself only with caller_recipe_override, original_query, original_authority, original_binding, recipe_selection, recipe_unknown, original_bytes_type, original_verification or current_disclosure; any other reason is raised by the owner or the frozen verifier. SealedReceiptOwner.authenticated_original raises only original_receipt_missing and original_receipt_ambiguous, then _custody_from_sealed, which refuses sealed_receipt_malformed unless the row has exactly SEALED_KEYS, BINDING_FIELDS and RECIPE_FIELDS and three even-length lowercase-hex strings, and re-raises the shared constructors' own refusals (RecipeTuple: recipe_tuple, recipe_resource_hash; OriginalBinding: original_binding, original_scope; scripts/pm_event_numbers.py:442-485) as sealed_receipt_malformed. It returns an OriginalCustody of an OriginalBinding, a RecipeTuple and three bytes values, so original_authority, recipe_selection and original_bytes_type cannot occur. retained_request returns an OriginalBinding or None, and None is refused as original_query. _frozen_verify is the conjunction of frozen_components, which raises no Refusal (decoding and digest refusals are caught; identity runs only on a schema-valid payload). The negative-only current_gated verifier may raise the current writer gate's reason; it calls the instrumented gate whenever it runs, so retained_no_current_gate refuses first. Every remaining reason has its own dispatch row, and original_verification is refused exactly when a retained_frozen row refuses.

**Per-family entailments.** 166 row/family pairs have no lone witness; each has a reason the checker verifies from the family's schema or from an implication between two of its own predicate rows, and a claimed reason that any witness contradicts fails the run (`entailment_reason`, `scripts/pm_s4b_browser_events.py:3121`). By reason:

| Row | Kind | Families |
|---|---|---:|
| `append_pred_complete_budget` | implied | 1 |
| `append_pred_complete_frames` | implied | 1 |
| `append_pred_complete_no_collisions` | implied | 1 |
| `append_pred_complete_no_omissions` | implied | 1 |
| `append_pred_generation_not_regressed` | implied | 2 |
| `append_pred_lease_epoch_not_regressed` | implied | 3 |
| `append_pred_lease_generation_not_regressed` | implied | 2 |
| `append_pred_no_action_overlap` | implied | 7 |
| `append_pred_no_effect_no_completed` | implied | 1 |
| `append_pred_no_effect_no_unknown` | implied | 9 |
| `append_pred_page_generation_paired` | schema | 31 |
| `append_pred_page_has_workspace` | schema | 34 |
| `append_pred_run_attempt_paired` | schema | 23 |
| `append_pred_session_workspace_paired` | schema | 34 |
| `append_pred_unknown_actions_no_retry` | implied | 9 |
| `append_pred_unknown_state_no_retry` | implied | 7 |

The full list with each family's reason is `row_family_pairs_entailed` in `drafts/PNC019/s4b/checker.json`.

## Mutation table

`python3 scripts/pm-s4b-mutations.py --scratch S --json M` on families `browser.program.completed`, `browser.controller_lease.takeover_completed`, `browser.representation.captured`, `browser.routine.promoted`, `browser.session.reconstructed_on_host`, `browser.page.activated`. A mutation edits a scratch copy of the checker, regenerates its tables and probes one row; it counts as killed only when one of that row's own witnesses (refused at exactly that row before) is accepted, is refused at exactly a stated other row, a stated control is refused at exactly the stated row, or a stated cross-check fails. **50/50 killed.**

| Id | Row | Kind | Result |
|---|---|---|---|
| C01 | `append_admitted` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/only a sibling admitted |
| C02 | `append_writer_cutoff` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/family withdrawn |
| C03 | `append_dedupe_caught_up` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/dedupe one behind |
| C04 | `append_source_committed` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/acceptance only |
| C05 | `append_lineage_thread` | control | killed: control append-linked:browser.routine.promoted refused at append_lineage_thread |
| C06 | `append_copy_requested_account` | control | killed: control append-linked:browser.routine.promoted refused at append_copy_requested_account |
| C07 | `append_event_id` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/caller nonce prefix |
| C08 | `append_producer_route` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/producer sequence 2**53+1 |
| C09 | `append_inline_limit` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/40 artifact refs of 420 bytes |
| C10 | `append_payload_integers` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/boolean at context/page_generation |
| C11 | `append_observed_utc_z` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/+00:00 |
| C12 | `append_storage_sequence_id` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/record differs |
| C13 | `append_partition` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/another project partition |
| C14 | `append_custody_semantic` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/custody semantic forged |
| C15 | `append_receipt_acknowledged` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/custody receipt acknowledged_at_utc differs from Storage |
| C16 | `append_success_receipt` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/failed group reported as success |
| C17 | `append_fact_effect_state` | witness | killed: witness accepted: browser.program.completed/transition fact effect_state differs |
| C18 | `append_context_program` | control | killed: control append:browser.program.completed refused at append_context_program |
| C19 | `append_pred_new_fence_page_generation` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/new_fence_page_generation candidate 1 |
| C20 | `append_pred_takeover_epoch_advances` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/takeover_epoch_advances candidate 1 |
| C21 | `append_envelope_schema` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/occurred February 30 |
| C22 | `retry_writer_cutoff` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/same-key retry after withdrawal |
| C23 | `retry_semantic` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/changed actor |
| C24 | `retry_result_receipt` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/result returns another receipt |
| C25 | `derived_count` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/count 3 |
| C26 | `derived_previous` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/stale predecessor hash |
| C27 | `derived_token_generation_id` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/token generation_id stale |
| C28 | `derived_count` | check | killed: known_answers: [['scan', 'browser.program.completed'], ['scan_prefix', 'browser.program.completed']] |
| C29 | `append_event_id` | check | killed: known_answers: ['identity_recipe'] |
| C30 | `retained_frozen_identity` | check | killed: agreement: 6 cases (first ['frozen', 'browser.program.completed', 'forged original event_id']) |
| C31 | `retained_no_receipt_creation` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/owner logs an access receipt |
| C32 | `retained_no_current_gate` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/verifier runs the writer gate |
| C33 | `retained_receipt_present` | refused_at | killed: witness accepted: browser.controller_lease.takeover_completed/only another original's receipt |
| C34 | `cleanup_window` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/offset time one second early |
| C35 | `cleanup_not_held` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/held retired generation |
| C36 | `read_access` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/access revoked |
| C37 | `withdrawal_no_event` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/withdrawal appended an event |
| C38 | `rebuild_retired_head` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/withdrawal time refreshed |
| C39 | `append_payload_schema` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/unknown member at / |
| C40 | `derived_value_schema` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/current with a withdrawal receipt (state allOf) |
| C41 | `retained_frozen_payload_schema` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/forged original payload unknown member |
| C42 | `retry_no_append` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/retry appended again |
| C43 | `read_coverage` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/retained original past the checkpoint coverage |
| C44 | `rebuild_publication_new` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/withdrawn publication reused |
| C45 | `cleanup_remaining` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/target kept |
| C46 | `derived_prior_current` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/advance over a withdrawn predecessor |
| C47 | `append_source_family` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/sibling transition |
| C48 | `retained_override` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/caller override |
| C49 | `append_replay_only` | refused_at | killed: witness refused at append_replay_policy: browser.controller_lease.takeover_completed/projector_replay_only |
| C50 | `append_persisted_utc_z` | witness | killed: witness accepted: browser.controller_lease.takeover_completed/+02:00 |

## Numbers

- **Shared calls at every integer slot:** `storage_uint64` at Storage's sequence (`scripts/pm_s4b_browser_events.py:1445`), the five first-receipt slots, every checkpoint slot and retired core; `current_integer(minimum=0)` at the producer sequence (`scripts/pm_s4b_browser_events.py:1452`); `current_integer` at every integer slot the closed payload declares (`payload_integer_paths`, `scripts/pm_s4b_browser_events.py:236`); `storage_value_bytes(EVENT_VALUE)` for the whole event, the payload and each checkpoint value; `producer_semantic_digest` with `producer_sequence_id` type-sensitive; `RetainedDispatcher` for history.
- **Corpus:** 55 shared spellings through `loads_current_json` at the sequence and producer-sequence slots of every family, the complete append route: {"accepted": 1020, "refused": 2244, "load_refused": 2346}, **0 disagreements**.
- **Self-test:** `python3 scripts/pm_event_numbers.py --self-test --scope numbers` exit 0, `"status": "pass"` (580 cases).
- **4,400-digit integers** are negatives at the sequence and producer-sequence slots and in the corpus; each refuses with a code at its row and none raises.
- **Fixture expectations the shared rule changed:** none existed (no executed lane fixtures before). A value outside the RFC 8785 route (for example a producer sequence of 2^53+1) refuses at `append_producer_route` without narrowing the schema.

## Timestamps (shared CV-1101 check, owner profile per field)

| Subject | Field | Profile | Rows |
|---|---|---|---|
| EventRecord | `occurred_at_utc` | event_record | append_envelope_schema (format); copy append_copy_occurred |
| EventRecord | `observed_at_utc` | event_record + storage_utc_z | append_envelope_schema; append_observed_utc_z; append_storage_observed; retained_frozen_observed_utc_z |
| EventRecord | `persisted_at_utc` | event_record + storage_utc_z | append_envelope_schema; append_persisted_utc_z; append_storage_persisted; retained_frozen_persisted_utc_z |
| custody_v2 | `first_append_receipt/acknowledged_at_utc` | event_record (E5-2) | append_custody_schema (format); append_receipt_acknowledged |
| checkpoint | `withdrawn_at_utc` | event_record | derived_value_schema / withdrawal_value_valid / rebuild_value_valid / read_checkpoint_valid; withdrawal_withdrawn |
| checkpoint | `retired_generations/*/withdrawn_at_utc` | event_record | checkpoint schema rows; rebuild_retired_head; cleanup_window (instant) |
| cleanup | `now` | event_record | cleanup_now_time; cleanup_window (shared instant/after_seconds) |

`timestamp_inventory()` re-derives every `format: date-time` location from the schemas each run and fails on any difference. `acknowledged_at_utc` stays on the EventRecord profile (E5-2). **Inventory gate in this lane tree:** `python3 scripts/pm_event_datetime_inventory.py` exit 1, `fail`: 290 nodes, 0 unclassified; its 4 failure rows all name `Plans/.audits/stage-a-plan-assurance-rolling-trial-packet-v1/CAPABILITY_OBLIGATION_GRAPH.schema.json`, which the lane's sparse cone leaves out by the disk rule. The gate runs in the full tree at integration; the NUMRULE inventory and exclusions files are not edited.

## Retained reads (SP-1101, built as batch 2 fix 1 requires)

- **Recipe only from the sealed receipt** for that exact original (`SealedReceiptOwner`, `scripts/pm_s4b_browser_events.py:812`), through the shared `RetainedDispatcher` with a frozen map installed outside the request.
- **Refused, each at its own row:** missing receipt, only another original's receipt, ambiguous, malformed (including the shared constructors' own refusals), foreign binding, unknown recipe, caller override, refused disclosure.
- **Store snapshot** before and after every read (`resolve_retained`, `scripts/pm_s4b_browser_events.py:943`); a store-writing owner is refused by `retained_no_receipt_creation`. **The current writer gate is instrumented** and never called; a verifier that calls it is refused by `retained_no_current_gate`.
- **History after a live change still verifies** (`retained-live`: the family withdrawn and no longer admitted, the owner transition gone), as does a retained `projector_replay_only` original the current writer refuses.
- **Frozen verifier:** 16 components, each its own row, witnessed by coherent forged originals; the dispatcher refuses `original_verification` exactly when a frozen row refuses (1938 agreement checks).

## Retention cells

All 51 bound, none pending: 28 `RP-AUTHORITY-INDEFINITE@1.0.0` and 23 `RP-RUNTIME-365D@1.0.0` exactly as SP-262 assigns them (DL-401 keeps the split), plus `RP-PROJECTION-3GEN@1.0.0` for each derived checkpoint.

## Quality bar (PNC019-RUN.md)

- **Guard rows are the checker's real predicates, on the gated tool, at most 8 rows per table:** the 62 table modules are the only refusal path; the tool scans each module itself; the largest table has 8 rows.
- **Only the expected refusal counts as a kill:** 50/50 mutations killed by their own witness being accepted, a stated other row, a stated control, or a stated cross-check.
- **Owner schema keywords kept:** every owner schema is validated in full (one row per subject) with the shared CV-1101 checker; schema walks put a single defect at every payload and checkpoint leaf; mutations C39 and C40 drop a keyword and are killed.
- **Shared number and date-time calls:** `storage_uint64`, `current_integer`, `storage_value_bytes`, `qualified_jcs`, `producer_semantic_digest`, `full_value_commitment`, `pm_event_datetime.date_time`; `acknowledged_at_utc` on the EventRecord profile (E5-2).
- **Retained reads from the sealed receipt, with a store snapshot:** SealedReceiptOwner and RetainedDispatcher, snapshot before and after, instrumented gate.
- **Join rows with distinct copy witnesses:** linked controls give every copied lineage, account and causality field a distinct non-null value; swap witnesses put a sibling value in one copy (C05, C06, C18 killed by those controls).
- **Honest grades with exact citations:** 1377 quotes located at their current lines; criterion 12 PASS only with the checker, tool and mutation results above.

## Grades before and after

Before (base `3c33510c57`, author re-read of the prepared rows): **3/7/2** per family. Membership ABSENT; owner route, closed payload and retention PASS; producer, scope/identity, replay, redaction/custody, transitions, compatibility/withdrawal and oracles PARTIAL (generic row text, shared validator fixtures only); consumers/checkpoints ABSENT (generic consumer labels).

After: **11/0/1** x51. Every quote in `reports/event-authority-20261114/S4B-self-grade.json` was located at its current line by the generator (1377 quotes).

## Checks (exit codes)

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_s4b_browser_events.py --json` | 0 | `pass`: 51 families, 338 rows, 1020 controls, 45191 negatives, 11791/11957 pairs witnessed, 166 entailed with reasons, failures 0 |
| `python3 scripts/pm-s4b-table-generate.py --check` | 0 | 62 tables, 338 rows, 2 entailed, none stale |
| `python3 scripts/pm-s4b-guard-proof.py collect --out D` | 0 | pass; 1,020 controls, 45191 negatives, 0 findings, 0 matrix problems; rows without a negative: the two entailed rows |
| `python3 scripts/pm-s4b-guard-proof.py run --out D` | 0 | 60/60 tables PASS, 336/338 rows proved, 2 entailed with proofs |
| `python3 scripts/pm-s4b-mutations.py --scratch S` | 0 | 50/50 killed |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580 cases |
| `python3 scripts/pm_event_datetime_inventory.py` | 1 | fail closed on 4 rows naming one `Plans/.audits/` file outside the sparse cone; 290 nodes, 0 unclassified |
| `python3 scripts/pm-browser-event-admission.py` | 0 | `pass`, 0 failures, 51 prepared, 2 admitted |
| `python3 -m unittest tests.test_pm_browser_event_admission` | 0 | 39 tests OK |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 99 sources; regeneration touched only the four edited documents' shards and the registry's |
| `python3 scripts/pm-plan-index.py validate` (origin/main `d6159397cc`) | 0 | `pass`, 0 failures |

## Notes for integration

- **Storage census re-pin.** 51 new materialized `later_gui_or_feature_projection` families: 678 -> 729 families, 647 -> 698 materialized, 589 -> 640 later. The pins in `scripts/pm-implementation-readiness.py` and the storage-plan Census bullet are re-pinned once at integration, as for W3A..W3I; this lane does not re-pin them.
- **Date-time inventory.** The new `withdrawn_at_utc` nodes (each checkpoint and retired generation in `Plans/browser_program_event_contracts.schema.json`, and their `value_schema` copies in the 51 registry rows, appended at the end) need CV-1101 classification (EventRecord profile) in the integration inventory refresh.
- **Admission (s5w).** `scripts/pm-browser-event-admission.py` `authority_binding_failures` admits only the two workspace families (`GA01_reviewed_binding`), and the central binding check requires `source_refs` to hold the row ref, `semantic_owner_ref` (now the family's own Section 15 anchor) and the payload ref. Admitting an s4b family needs a reviewed per-family binding there (this checker is its oracle) and the family's CV and SP refs in its registry `source_refs`.
- **Bodies above 16 KiB.** Kept on the 2.0.0 inline route, so a schema-legal body above 16384 canonical bytes refuses `payload_inline_limit`. Moving these families to the section 1.2.1 EventRecord 3.0.0 reference route first needs an SP-286 custody edition for 3.0.0 (the custody schema pins `event_schema_version` to 2.0.0). This is a technical owner item, not a product choice.
- **Governance staleness** from these Plans edits (currentness edition drift, Spec Lock hashes) is the expected reseal request; nothing was resealed.

## Stopped for Jared

None. Retention is decided by landed text; no row needs a DL-045 choice.

## Commits

- `a2d4c7646f merge origin/main d6159397cc (batch 3 landed) into s4b`
- `f0fc9e6e74 scripts: s4b streaming negatives, allOf and coverage witnesses, 50 mutations`
- `41ca186dbf plans: s4b ATS-2500 states exactly what the checker executes; SP-2500..2550 withdrawal and cleanup wording`
- `5020f48de9 scripts: s4b complete static checker for the 51 Browser Program families, guard tables, tool driver, mutations`
- `d6159397cc reports: INT3 landing note (batch 3)`
- `77f7e5adbc plans: merge origin/main 090bafbbe9 into the batch-3 integration for landing`
- `f1d3a22171 plans: s4b owner text for the 51 prepared Browser Program families (PNC-019 lane s4b, DL-046)`
- `090bafbbe9 concept(projects): B-1 - the last Done brings Create into view before it focuses it; np-next checks Create is on screen, out of order in a 1280x720 window`
- `5d39235879 concept(projects): README - Jared 1113 #8, Done opens the next unfinished section`
- `617917233c concept(projects): Jared 1113 #8 - New Project's Done opens the next unfinished section, brings it into view and focuses its first control; after the last, focus on Create; np-next check`
- `9f7e0eac0a concept(settings): only a row the inventory types as a map or list takes the inventory's default over the page's old shape (the two folder rows' path descriptors stay paths)`
- `c29b7cc8b8 concept(settings): a value the page's own control can't hold (Model nicknames under batch 4) is never put into it; the row says it in words with Change opening the per-place editor; jared1113 objects part`
- `3946dbc186 concept(settings): README - the engine's first fill is not a change; per-account rows the inventory ladders; base hooks the per-place editors use (FO-182 note)`
- `19953cf125 concept(settings): jared1113 checks - a Set for... menu that a redraw closes is pressed again; where's per_item count names the permission rows (batch 4 adds Model nicknames)`
- `8191ff5624 concept(settings): the router never reads the engine's first fill of a row as a person's change (found testing Jared 1113: revealing Rules wrote Rules everywhere); per-account rows Plans' inventory ladders get their places; jared1113 fills part`
- `20a91f76d2 concept(settings): README - Jared 1113 (model picker overlay, every Set for... path, one source of limits, batch 4 nicknames)`
- `bce4af3021 concept(settings): Jared 1113 - a project's nickname list starts with its own lines; the row's own editor's unchanged Save sets the place's own; jared1113 checks wait out redraws`
- `87818d943e concept(settings): Jared 1113 - model rows use the shared model picker as an overlay with the inventory's inherit words and depth inside; every Set for... path ends in an editor (maps in the row's own editor for that place); per-place editor and PSX.write take the main control's limits; Model nicknames per_item (batch 4)`

