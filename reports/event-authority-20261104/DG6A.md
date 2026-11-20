# DG6A — sweep part 2B (CV-1101 date-time, SP-1101 retained dispatch)

**Branch:** `plans/ea-w2-gui-concerns-20261104`. Start: the part 2A head `e5df77bb7e`. Gated NUMRULE merge `d3fd87730a` (exactly `58c2816ff3`, `--no-ff`). It merged clean: no conflict, so neither addendum-1 resolution was needed. It brings only the seven date-time and report files; the number-scope files at `58c2816ff3` are byte-identical to the `a16f67c1ef` merged in part 2A. No NUMRULE file is edited. Implementation commits `f587c80cd8` (scripts), `a041faf303` (owner text, shards, index), `98760da363` (one more witness). The report commit is in the external `HEAD.txt`. No rebase.

**All sixteen families keep 9 PASS / 2 PARTIAL / 1 ABSENT.** Every DG6A timestamp now goes through the shared CV-1101 predicate `pm_event_datetime.date_time` with the explicit owner profile of its field (lead addendum 2). SP-1101 retained dispatch (part 2A item S-N2) is composed through the shared `RetainedDispatcher` for every retained read and every retained retry. **My timestamp review is no longer interim:** the table "Timestamp fields and the shared check that covers each" names the check and profile for each field. `datetime_validator` and the whole-Plans inventory gate are not called in this lane tree; they run at batch-2 integration (addendum 2), and their failure rows here are recorded below. `positive_negative_oracles` stays PARTIAL, but timestamps are no longer among its reasons. Membership stays ABSENT. Native execution is NOT_RUN.

**Readiness: NOT_READY** (prepared for the batch-2 review; nothing is admitted). This section and `DG6A.self-grade.json` supersede every status below, including every "interim only" statement in the part 2A section.

## Sweep part 2B: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Merge the gated NUMRULE head** | `git merge --no-ff 58c2816ff33365384d4039553f5efdb5370930e6` gave `d3fd87730a`, clean. The branch head was the part 2A head `e5df77bb7e` beforehand. The merge brings `scripts/pm_event_datetime{,_inventory,_mutations,_selfcheck}.py`, `pm_event_datetime_mutations.json`, `pm_event_datetime_node_controls.json` and `reports/event-authority-20261104/NUMRULE.md`. DG6A had never edited any of them since `a16f67c1ef`, so there was no add/add or owner-text conflict and neither addendum-1 resolution was used. No derived file conflicted. | merge commit | `git log --format=%P -1 d3fd87730a` gives `e5df77bb7e 58c2816ff3`; `git diff --stat d3fd87730a^1 d3fd87730a` lists 7 files; for each, `git rev-parse d3fd87730a:<path>` equals `git rev-parse 58c2816ff3:<path>` (all 7 same). |
| **S-FMT1: shared CV-1101 predicate** (fixed, `f587c80cd8`) | The lane grammar (`INSTANT_PATTERN`, `datetime.fromisoformat`) is gone. Every JSON Schema `format: date-time` the lane validates runs the shared `pm_event_datetime.date_time` with the EventRecord profile through the lane format checker (`raises=Refusal`, so the shared Refusal is the validation error's cause). Named semantic timestamps in recipe preimages use `semantic_formats`, which picks the field profile (`profile_of`). This follows lead addendum 2: `datetime_validator` and the inventory gate are not called in the lane tree. | `scripts/pm-dg6a-domain.py:33` (`FIELD_PROFILES`), `:36` (`profile_of`), `:41` (`instant_refusal`), `:58` (`event_record_date_time`), `:192` (`semantic_formats`) | `grep -n "fromisoformat\|INSTANT_PATTERN" scripts/pm-dg6a-domain.py` finds nothing; all sixteen family checkers pass. |
| **CV-253 Storage profile** (fixed, `f587c80cd8`, `3fc13d0ccc`) | Storage-assigned `observed_at_utc`/`persisted_at_utc` take `storage_utc_z` wherever DG6A reads them: the retained event's instants (HG05), recipe preimages (`semantic_formats`), and the producer route's record (new row **PD04**, `invalid Storage timestamp`). `3fc13d0ccc` fixes a crash I introduced in `f587c80cd8`: PD04 read the two fields unconditionally, and the shared number corpus's producer-only record has neither, so it raised `KeyError`. PD04 now checks only the fields a record carries; the producer projection excludes them. | `scripts/pm-alert-event-contracts-check.py:609` (`producer_observation`), `:620` (PD04 fact), `scripts/pm_dg6a_table_producer_route.py` | `producer_cases` refuses each `STORAGE_REFUSALS` value at PD04; the number corpus runs clean (below). |
| **Exact instant order** (fixed, `f587c80cd8`) | `instant_key` no longer uses host `datetime`. It applies offsets in integer proleptic-Gregorian arithmetic (year 0000 included) and keeps every fractional digit. A legitimate leap second sorts after `23:59:59.x` and before the next `00:00:00`. AP06/CS06 (`snooze_until` after `ts`) use it. | `scripts/pm-dg6a-domain.py:167` (`instant_key`), `:185` (`instant_le`) | Domain-check records `leap second order`, `year 0000 order`, `extreme calendar offsets`, `fraction precision`, all pass. |
| **Lane-local leaks** | DG6A's interim grammar already refused `24:00:00Z`, a trailing LF and lowercase-`t` errors such as hour 24. One real leak was found and closed: the old format check `type(v) is not str or instant(v)` passed a `str` subclass without checking it. The shared predicate refuses it as `date_time_type`. New witness at every payload timestamp field of all sixteen families (`98760da363`). The leaks other lanes recorded all refuse here through the shared check, each with the shared Refusal as cause: `24:00:00Z` → `date_time_hour`, trailing LF → `date_time_syntax`, a space separator → `date_time_syntax`, a missing zone → `date_time_syntax`, an illegitimate second 60 → `date_time_leap_second`, offset hour 24 → `date_time_offset_hour`. | `scripts/pm_dg6a_p2b_witnesses.py:23` (`DATETIME_REFUSALS`), `:55` (`datetime_payload`) | All sixteen family checkers pass. |
| **Widening, stated plainly** | CV-1101 makes two forms owner-valid that DG6A's grammar refused: year 0000 and a real (offset-adjusted) leap second. CV-680..686 said "no leap seconds"; that sentence is replaced by CV-1101's grammar ("Every lane adopts this check at its timestamp boundaries using the relevant existing owner profile, not a new local regex"). Lowercase `t`/`z` and offsets were already accepted by DG6A and stay accepted (EventRecord profile). No DG6A field owner sets a stricter profile, so no field takes `coordination_utc_z` or `legacy_normalization_output`. The adoption guide's authority boundary assigns the grammar to CV-1101/CV-253, so no Jared choice is involved. | `Plans/Contracts_V0.md:24628` (CV-680) … `:24986` (CV-686) | Domain-check `GOOD_DATES` and witness `DATETIME_ACCEPTS`. |
| **The shared predicate runs through the validator** (new witnesses, `f587c80cd8`, `98760da363`) | CV-1101 requires negatives that show the installed predicate refusing through the validator. For every DG6A family, at every timestamp field of its standalone payload: each of 11 malformed values is refused by the complete payload check (the `sch_*_payload` verdict row), and the cause of the lane validator's error is exactly the shared Refusal reason; a `str` subclass gives `date_time_type`; 8 owner-valid values are accepted (leap second, offset leap second, fractional leap second, year 0000, lowercase `t`/`z`, 12-digit fraction, `-05:30`, 29 February). The producer route adds 11 `occurred_at_utc` refusals (PD01) and 12 Storage refusals (PD04), plus 14 acceptances. | `scripts/pm_dg6a_p2b_witnesses.py:44` (`causes`), `:55`; `scripts/pm-alert-event-contracts-check.py` `producer_cases` | Family checkers; standing trial `CV1101_predicate_removed` (below). |
| **S-N2: SP-1101 retained dispatch** (fixed, `f587c80cd8`) | Every retained read (all sixteen families, via `historical_refusals`) and every retained retry (alert ×4, panel ×2, via `retained_retry_observation`) first resolves its original through the shared `RetainedDispatcher`, which is composed in `scripts/pm_dg6a_custody.py`. `DG6AOriginalOwner` authenticates the fetched original's SP-1100 `EVENT_VALUE` bytes against Storage's sealed custody at its `event_ref` and returns the sealed binding and `RecipeTuple`. The dispatcher joins the binding, looks up the installed `FrozenRecipe` (no caller override, no current-then-legacy probing), and runs its verifier. The verifier recomputes the source commitment, checks the family, and recomputes the event identity of the family's owner unit. The custody-selected recipe also selects the frozen payload validator (HG15, RR04). Composition seals the committed positive originals of the sixteen fixture files; tests that model another Storage history declare it with `written(...)`; no reader seals. Native custody stays NOT_RUN. New rows: **HC01–HC05** (`history_custody`: `original_unavailable`, `original_authority`, `original_binding`, `recipe_unsupported`, `original_verification`) and **RQ01–RQ05** (retry, family retry code). | `scripts/pm_dg6a_custody.py:157` (`_verifier`), `:192` (`recipe_of`), `:218` (`binding_of`), `:283` (`written`), `:304` (`DG6AOriginalOwner`), `:322` (`resolve`); `scripts/pm-alert-event-contracts-check.py:243`, `:260`, `:815`, `:878`; `scripts/pm_dg6a_table_history_custody.py` | Witnesses below; trial `SP1101_owner_authentication_removed`. |
| **Frozen recipes** (`f587c80cd8`) | 24 installed editions, each pinned by the SHA-256 of its exact schema bytes. The DG6A prepared editions (alert ×4 1.0.0, panel ×2 2.0.0, concern.created 1.0.0, Card 5 ×9 current) had no earlier writer, so their recipe is the current one: lane validator (CV-1100 exact integers, CV-1101 EventRecord predicate) and recomputed identity (`evt_<family>_` + H over the owner unit's array). The panel v1 1.0.0 editions and the Card 5 concern legacy v1 1.0.0 editions predate the lane (unchanged since 2026-09-02). Their recipe is the original schema's own Draft 2020-12 type and number validation, with the CV-1101 predicate installed and the original event id retained exactly, as NUMRULE-ADOPTION's DG6A section asks ("Retain original schema type/format/number validation on history, with new current guards excluded"). CV-684/685 already say the "immutable v1 schema stays historical-only and dispatches by its own stored schema id/version". | `scripts/pm_dg6a_custody.py:91` (`Edition`), `:118` (`_editions`), `:145` (`expected_event_id`) | `retained_integral_float_*` witnesses; trial `SP1101_legacy_recipe_current_numbers`. |
| **Rows moved by custody** (`f587c80cd8`) | HG14 (`edition_known`) and RR02 (`edition_known`) selected the edition from the original's own copy or its event type. The selection is now SP-1101's, so those rows became HC04 and RQ04. Under custody RR03 (`stored_object`) is entailed: every installed verifier refuses a non-object payload (RQ05) and every frozen edition schema is an object schema (RR04). It moves to the table of its own, `retry_retained_<caller>_entailed`, beside RR08. Its old witness (a string payload) now refuses at RQ04, and RR04 gets a new witness: a sealed original whose stored payload violates its edition. | `scripts/pm-dg6a-table-generate.py` (`history_custody`, `retry_retained_*`, `history_original`) | `python3 scripts/pm-dg6a-table-generate.py scripts --check`: 90 generated tables, 478 rows (+9 hand-written). |
| **Custody witnesses** (`f587c80cd8`) | History (all sixteen): forged original (unsealed bytes) → `original_authority`; the same original declared as Storage history → readable; foreign-Store binding → `original_binding`; replaced resource → `recipe_unsupported`; another family's recipe → `original_verification`; a sealed current-edition original whose `event_id` is not its recipe identity → `original_verification`; unknown `event_ref` → `original_unavailable` (fifteen families: the HISTORICAL_ONLY mapping joins the original ref). Downgrade: a panel v2 or Card 5 concern v2 original sealed under its family's v1 tuple resolves, and the frozen v1 edition refuses the current payload (HG15). The request never picks an edition. Retry (alert ×4, panel ×2): forged, unknown ref, foreign binding, replaced resource and foreign recipe each refuse with the family retry code; the declared-history control returns the original. | `scripts/pm_dg6a_p2b_witnesses.py:110` (`history_custody`), `:187` (`history_downgrade`), `:203` (`retry_all`) | Family checkers. |
| **Retained timestamps, numbers and metadata** (`f587c80cd8`) | Each original is Storage history (`written`). Owner-valid retained timestamps (the 8 accepts) are readable with exact strings. Owner-invalid ones (the 11 refusals) refuse at HG15, because a writer that skipped format checks does not make history owner-valid (CV-1101, SP-1101). `acknowledged_at_utc` with lowercase `z` or an offset is readable (its owner schemas declare broad `format: date-time`). Retained `observed_at_utc`/`persisted_at_utc` take `storage_utc_z`: 3 accepted and 6 refused per field (HG05). An integral float in an integer slot is readable under a legacy recipe and refused under a current one (HG15). A retained original at sequence 2^64−1 under a checkpoint through 2^64−1 is readable. | `scripts/pm_dg6a_p2b_witnesses.py:138` (`history_retained`) | Family checkers; trials `CV253_storage_profile_removed`, `SP1101_legacy_recipe_current_numbers`. |
| **Owner text** (`a041faf303`, `ffc43eae22`) | CV-680..686: the lane grammar sentence is replaced by CV-1101 through the shared predicate with each field's owner profile and exact instant order. SP-660..666: one added sentence states the RetainedDispatcher composition and the unavailable/unsupported refusals without fallback. F3-706..714: "remain a sweep dependency"/"remains a sweep item" now state the adopted CV-1100/CV-1101/SP-1101 rules, and the C12 sentence names only what stays open (part 2A's F3 C12 item). `ffc43eae22` rewords the same sentences so they no longer spell the two CV-253 field names. As first written, each edited unit fence became a new container the date-time inventory gate must classify (22 new `unreadable_mentioning_container` rows). All 23 edited YAML blocks parse. | `Plans/Contracts_V0.md:24628`…`:24986`; `Plans/storage-plan.md:29830`, `:29978`, `:30125`, `:30272`, `:30426`, `:30588`, `:30768`; `Plans/FinalGUISpec.md:50709`…`:51247` | Shards and index regenerated twice; only these three documents' outputs and the index changed; shard check pass. |
| **Standing trials** (`f587c80cd8`) | `scripts/pm-dg6a-p2b-trials.py` removes one adopted mechanism per run, and the complete checker must fail: `CV1101_predicate_removed`, `CV253_storage_profile_removed`, `SP1101_owner_authentication_removed`, `SP1101_identity_not_recomputed` (each on alert.snoozed, panel.undocked, concern.created, concern.resolved), and `SP1101_legacy_recipe_current_numbers` (panel.undocked, concern.resolved). | `scripts/pm-dg6a-p2b-trials.py` | **18 of 18 caught**, each by an assertion naming its witness. |
| **Inventory gate and `datetime_validator`** | Not called by any lane check (addendum 2). The gate refuses in this tree on Plans drift alone; its rows are below. They run at batch-2 integration. The inventory and exclusions files are not edited. | — | Section "Self-tests and the inventory gate". |
| **Part 2A item: F3-706..714 C12 wording** | Closed by `a041faf303` (row "Owner text"). | — | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** none new. CV-680..686, SP-660..666 and F3-706..714 change in place; the new guard rows (HC01–HC05, RQ01–RQ05, PD04) are table row names, not PlanUnit IDs.

## Timestamp fields and the shared check that covers each

| Field | Owner | Shared check and profile | Where validated |
|---|---|---|---|
| alert payload `ts`, `snooze_until` (snoozed), `mute_expires_at` (rule_muted), and the same fields in the operation `original_command`/payload and the shared alert/rule state schemas | CV-680..683 | `date_time`, **EventRecord** profile, through the lane format checker | `sch_alert_payload`, `sch_alert_operation`, state schemas; retained HG15 and retry RR04 under the custody-selected frozen edition |
| panel v2 `settled_at_utc` (payload and operation) | CV-684/685 | `date_time`, **EventRecord** | `sch_panel_payload`, `sch_panel_operation`; HG15, RR04 |
| panel v1 `settled_at_utc` (retained only) | CV-684/685 (immutable v1 schema) | `date_time`, **EventRecord**, in the frozen v1 recipe | HG15 (legacy recipe) |
| concern.created payload `ts`; concern record `created_at`, `updated_at`, `resolved_at` (nullable) | CV-686 | `date_time`, **EventRecord** | `sch_concern_payload`, `sch_concern_operation`, record schema; HG15 |
| Card 5 payload `ts` (nine families, current and concern legacy v1 editions) | F3-706..714 | `date_time`, **EventRecord** | `sch_c5_payload`, `sch_c5_operation`, `sch_c5_field`; HG15 |
| EventRecord `occurred_at_utc` (producer route) | EventRecord, CV-317/CV-1101 | `date_time`, **EventRecord** | PD01 |
| `observed_at_utc`, `persisted_at_utc` (producer record, retained event, recipe preimages) | Storage, CV-253 | `date_time`, **storage_utc_z** | PD04, HG05, `semantic_formats` |
| first-receipt `acknowledged_at_utc` (retained receipt, recipe preimages) | CV-339/SP-286 AppendReceipt; owner schemas declare `format: date-time` | `date_time`, **EventRecord** | HG17, `semantic_formats` |
| exact order `snooze_until` > `ts` | CV-682/683 | the shared predicate first, then the lane's exact `instant_le` (CV-1101 keeps comparison with its owners) | AP06, CS06 |

Every field above is checked by the shared predicate with the named profile. The review is no longer interim.

## Fixture expectations that changed

No committed fixture file changed, and no committed fixture case changed its expected result: none uses a leap second, year 0000 or a forged retained original. The changes are in the lane's own drivers:

| Case | Before → now | Refusing row / reason |
|---|---|---|
| p2a witness `history_edition_unknown` (an original declaring `9.0.0`, now declared as Storage history) | `['historical_payload']` (HG14) → `['recipe_unsupported']` | HC04: Storage's tuple for that original names no installed verifier |
| p2a witness `retry_unknown_edition` | `[retry code, append code]`, unchanged; row RR02 → RQ04 | RQ04 |
| p2a witness `retry_stored_not_object` | replaced by `retry_stored_invalid` (`correlation_id` 7) | RR03 is entailed (own table); RR04 is the new witness's row |
| alert `retained_revision_cases` `unsupported_original_edition` | `[retry code]`, unchanged; row RR02 → RQ04 | RQ04 |
| alert/panel `retained_revision_cases` (all) | unchanged results; their driver-built originals are now declared as Storage history | — |
| domain-check `BAD_DATES` | `0000-01-01T00:00:00Z` moved to `GOOD_DATES` (refused → accepted at every `format: date-time` leaf and composed context); `2016-12-31T23:59:60+01:00` and `2026-06-30T23:59:60Z` added | shared predicate: year 0000 is RFC 3339; the two seconds 60 are not real leap seconds (`date_time_leap_second`) |
| domain-check `GOOD_DATES` | added `2016-12-31T23:59:60Z`, `2017-01-01T01:59:60+02:00`, `2016-12-31T23:59:60.999Z` | — |
| domain-check coherent retained timestamp negatives | unchanged guards (`historical_payload`/`original_receipt`); the malformed original is now declared as Storage history, so custody resolves it and the timestamp row refuses | HG15 / HG17 |
| final-regression B2 (one CLI case per payload timestamp field per `BAD_DATES` value) | +1 per field (−1 year 0000, +2 seconds 60): alert 25→26 (snoozed 50→52), panel 25→26, concern 28→29 | — |

Counts: family checkers alert 522/525/526/539 → 635/638/639/667, panel 504/503 → 666/665, concern.created 639 → 745, Card 5 annotation 354 → 380, note_created 955 → 1,024, note_status_changed 962 → 1,031, assigned 989 → 1,107, evidence_linked 968 → 1,086, promoted 990 → 1,108, reopened 969 → 1,087, resolved 1,015 → 1,133, updated 969 → 1,087. Domain-check 8,909/9,035/9,218/9,760/11,095/11,084/11,762 → 8,965/9,091/9,289/9,850/11,125/11,114/11,834. Final regression 128/128/128/153/166/166/128 → 129/129/129/155/167/167/129.

## Guard-table result (gated tool `004bdedd63`, rerun at `3fc13d0ccc`)

Part 2B changes guarded predicates in several ways. The shared date-time predicate sits inside every schema verdict row and inside PD01, HG05, HG17, AP06, CS06 and RC01. The custody rows HC01–HC05, RQ01–RQ05 and PD04 are new. HG14 and RR02 became custody rows, and RR03 moved to an entailed table. So I reran the tool on every table: one collection run of all sixteen complete family suites (suite counts as in the family checkers), then the tool per table. **99 tables, 518 rows: 498 proved; 20 unprovable by construction**, each in one of the nine tables of its own that have no negative (tool `NOT_RUN`). The 90 tables that have a negative all `PASS`. 521 tool negatives and 143 controls; 14,764 tool evaluations. Masked: 0. Unrelated changes: 0. Lane-matrix problems: 0. Credit is the tool's own `rows[].proved`. Long-job `dg6a-p2b-vg2` at `3fc13d0ccc`, `guard/summary.json`; it started at 17.7 GiB available, and the tool's MemoryGate paused 52 times below 10 GiB, resuming at 11. The later commit `ffc43eae22` changes only owner text and its derived files, which no table or witness reads.

Part 2A was 98 tables, 505 rows and 487 proved. The change is +5 HC rows, +4 net per retry table (RQ01–RQ05 less RR02), +1 PD04 and −1 HG14. RR03 ×2 joins the unproved by-construction rows; its proof is below.

| Checker part | Tables | Rows | Proved | Unproved (own tables) | Tool negatives / controls | Cut: own flips | Cut: stays | Masked | Unrelated changes |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|
| Hand-written first-pass tables (Card 5, alert, panel, concern) | 9 | 40 | 40 | none | 41 / 9 | 41 | 217 | 0 | 0 |
| Schema documents and schema occurrences (verdict rows) | 13 | 15 | 14 | CONCERN_OPERATION_PAYLOAD_schema | 17 / 12 | 17 | 6 | 0 | 0 |
| Alert payload and operation (shared library) | 11 | 67 | 64 | OK07_command_id, OK12_handler_target, OK16_mute_scope | 73 / 20 | 73 | 472 | 0 | 0 |
| Checkpoint, producer route, protocol shape, retries and append evidence (shared) | 12 | 57 | 52 | CZ00_encodable, RR03_stored_object, RR08_digest, RR03_stored_object, RR08_digest | 58 / 19 | 58 | 386 | 0 | 0 |
| Retained-history reader, SP-1101 custody and bounded read-through (shared) | 8 | 43 | 43 | none | 45 / 19 | 45 | 282 | 0 | 0 |
| Panel (pm-panel-event-contracts-check.py) | 12 | 52 | 49 | PK03_command_id, PK07_panel_id, PK13_target_host | 50 / 20 | 50 | 273 | 0 | 0 |
| concern.created (pm-concern-created-contracts-check.py) | 12 | 78 | 76 | CK03_command_id, CK07_handler_target | 77 / 24 | 77 | 603 | 0 | 0 |
| Card 5 operations, mapping and history mapping (pm-card5-event-contracts-check.py) | 22 | 166 | 160 | G_after_bundle_id, G_after_doc_id, G_after_annotation_id, G_after_note_id, G_after_provenance_ref, HN09_after_present | 160 / 20 | 160 | 1334 | 0 | 0 |
| **Total** | 99 | 518 | 498 | 20 | 521 / 143 | 521 | 3573 | 0 | 0 |

**Rows unprovable by construction.** Each sits in a table of its own, so the other rows keep their credit. The tool reports these tables `NOT_RUN` (no negative): no input reaches their rows first. Line numbers are current at the final head.

| Table | Rows | Why no input reaches the row first (path:line) |
|---|---|---|
| `alert_command_keys_entailed` | OK07 `command_id`, OK12 `handler_target`, OK16 `mute_scope` | the operation schema fixes both copies to the same const, so `sch_alert_operation` refuses any other value first: `Plans/alert_event_contracts/alert_acknowledged_operation.schema.json:136`/`:388` (`command_id`), `:133`/`:385` (`handler_target`); `alert_dismissed_operation.schema.json:138`/`:392`, `:135`/`:389`; `alert_rule_muted_operation.schema.json:145`/`:398`, `:142`/`:395`, `:129`/`:382` (`mute_scope`); `alert_snoozed_operation.schema.json:142`/`:400`, `:139`/`:397` (payload/command); files unchanged since part 2A |
| `panel_command_keys_entailed` | PK03 `command_id`, PK07 `panel_id`, PK13 `target_host` | same: `Plans/panel_event_contracts/panel_redocked_operation.schema.json:192`/`:403`, `:189`/`:406`, `:204`/`:424`; `panel_undocked_operation.schema.json:192`/`:403`, `:189`/`:406` (its command declares no `target_host`) |
| `concern_command_keys_entailed` | CK03 `command_id`, CK07 `handler_target` | same: `Plans/concern_created_contracts/concern_created_operation.schema.json:106`/`:410`, `:109`/`:407` |
| `sch_concern_operation_payload` | `CONCERN_OPERATION_PAYLOAD_schema` | the operation schema embeds the payload schema (its `payload_*` `$defs` renamed), so `sch_concern_operation` refuses every payload defect first; `payload_schema_entailment` (`scripts/pm-concern-created-contracts-check.py:148`, called at `:401`) checks the two are equal on every run |
| `checkpoint_encoding_entailed` | CZ00 `encodable` | every checkpoint integer slot is a Storage sequence bounded 0..2^64-1 (SP-1100) and no slot admits a fractional number, so `sch_checkpoint` refuses every value the recipe cannot encode; `checkpoint_encoding_entailment` (`scripts/pm-alert-event-contracts-check.py:475`) checks each family's checkpoint schema on every run (alert `:1330`, panel `scripts/pm-panel-event-contracts-check.py:308`, concern `scripts/pm-concern-created-contracts-check.py:374`, Card 5 `scripts/pm-card5-event-contracts-check.py:689`) |
| `retry_retained_alert_entailed`, `retry_retained_panel_entailed` | RR08 `digest` | RR06 (`scripts/pm-alert-event-contracts-check.py:273`) equates the earlier-recipe digest of the stored body with the operation's `request_digest`; RR07 (`:274`) makes the retry body exactly that stored body; both call sites pass the original operation's `request_digest` as the comparison digest (`:342`, `scripts/pm-panel-event-contracts-check.py:189`) |
| `retry_retained_alert_entailed`, `retry_retained_panel_entailed` | **RR03 `stored_object` (new in part 2B)** | under SP-1101 a custody-verified original's payload is an object. Every installed frozen verifier returns False for a non-object payload (`scripts/pm_dg6a_custody.py:169`, giving RQ05), and every one of the 24 frozen edition schemas has root `"type": "object"`, so RR04 (`scripts/pm-alert-event-contracts-check.py:266`) refuses such a payload as well. Row spec: `scripts/pm-dg6a-table-generate.py:215`. Part 2A's RR03 witness (a string payload) is now RQ04's witness, because no edition is installed for it |
| `c5_after_note_entailed` | `after_bundle_id`, `after_doc_id`, `after_annotation_id`, `after_note_id`, `after_provenance_ref` | the expected post-state value is the before record's field, and `note_after_<field>`/`note_before_<field>` (`scripts/pm-card5-event-contracts-check.py:280`, `:282`) join both records to the payload field first; the fields are string-typed, so exact and `==` agree |
| `c5_history_mapping_after_entailed` | HN09 `after_present` | `mapping_errors` refuses a non-object `after` first (`after_object`, `scripts/pm-card5-event-contracts-check.py:550`) |

**Two-row witnesses excluded** (the same sets as part 2A, by construction): `checkpoint_token` (CT01+CT03, one changed token Store read by both) and `c5_concern_a` (two recorder-role pairs).

**New and changed tables:**

| Table | Rows | Proved | Tool | Negatives / controls | Evaluations |
|---|---:|---:|---|---:|---:|
| `history_custody` (HC01–HC05) | 5 | 5 | PASS | 5 / 1 | 96 |
| `retry_retained_alert` (RR01, RQ01–RQ05, RR04–RR07) | 10 | 10 | PASS | 10 / 1 | 341 |
| `retry_retained_panel` | 10 | 10 | PASS | 10 / 1 | 341 |
| `producer_route` (PD01, PD04, PD02, PD03) | 4 | 4 | PASS | 4 / 1 | 65 |
| `history_original` (HG15–HG21) | 7 | 7 | PASS | 8 / 1 | 198 |
| `history_event` (HG05–HG15 event members) | 11 | 11 | PASS | 11 / 1 | 408 |
| `retry_retained_{alert,panel}_entailed` (RR03, RR08) | 2 + 2 | 0 | NOT_RUN (no negative, by construction) | 0 / 0 | 0 |

Per table (credit as the tool reports it; flips and stays summed over rows; report SHA-256 prefix of `guard/<table>.json`):

| Table | Rows | Proved | Tool | Negatives / controls (tool) | Distinct single-row negatives | Flips | Stays | Two-row witnesses excluded | Report SHA-256 (12) |
|---|---:|---:|---|---:|---:|---:|---:|---:|---|
| `alert_candidate_state` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `52c78bb160b3` |
| `alert_command_keys_a` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `ed1055291e48` |
| `alert_command_keys_b` | 12 | 12 | PASS | 12 / 1 | 12 | 12 | 132 | 0 | `77c713956f79` |
| `alert_command_keys_entailed` | 3 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `alert_operation_identity` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `1617bd1d902c` |
| `alert_operation_joins` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `7734986e1051` |
| `alert_operation_size` | 2 | 2 | PASS | 6 / 10 | 6 | 6 | 6 | 0 | `2173674904c4` |
| `alert_owner_candidate` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `6d8ef5cea16e` |
| `alert_owner_prior` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `48d4e91d4f1b` |
| `alert_payload` | 7 | 7 | PASS | 12 / 2 | 12 | 12 | 72 | 0 | `a0ba26432e0c` |
| `alert_protocol` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `181da1f69bb5` |
| `append_result` | 11 | 11 | PASS | 13 / 2 | 13 | 13 | 130 | 0 | `04071b98e578` |
| `c5_after` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `2bc298153373` |
| `c5_after_note_entailed` | 5 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `c5_assessment` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `9886e36ed559` |
| `c5_before` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `93cdb571bf2b` |
| `c5_concern_a` | 12 | 12 | PASS | 12 / 1 | 12 | 12 | 132 | 2 | `41f0e052e3cf` |
| `c5_concern_b` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `7fed8a46e5cf` |
| `c5_concern_c` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `3bb33327f782` |
| `c5_core_a` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `83d0d40f7415` |
| `c5_core_b` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `7c72ce694f7e` |
| `c5_history_mapping_after` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `861bc0c4130c` |
| `c5_history_mapping_after_entailed` | 1 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `c5_history_mapping_before` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `6af08a761728` |
| `c5_history_mapping_object` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `a332070b1028` |
| `c5_history_mapping_payload` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `a2241ba20bca` |
| `c5_mapping` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `553d390f58d4` |
| `c5_mapping_shape` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `177a4079a032` |
| `c5_note_ids` | 10 | 10 | PASS | 10 / 1 | 10 | 10 | 90 | 0 | `49067cddb83b` |
| `c5_note_state` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `cba02de148c3` |
| `c5_outgoing` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `34a1d2e7da58` |
| `c5_phase` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `404e5c35359c` |
| `c5_receiving` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `dead47997ec5` |
| `c5_resolution` | 15 | 15 | PASS | 15 / 1 | 15 | 15 | 210 | 0 | `c92ce078b50f` |
| `checkpoint_encoding_entailed` | 1 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `checkpoint_size` | 1 | 1 | PASS | 5 / 10 | 8 | 5 | 0 | 0 | `c0c7ef642e6b` |
| `checkpoint_token` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 1 | `49d7ac10f604` |
| `concern_authority` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `05d9365e53be` |
| `concern_command_keys_a` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `8ec9d899d360` |
| `concern_command_keys_b` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `c7e6cf8b7537` |
| `concern_command_keys_entailed` | 2 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `concern_creator` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `c8e130a7df21` |
| `concern_existence` | 4 | 4 | PASS | 5 / 5 | 5 | 5 | 15 | 0 | `d47aeefb1fed` |
| `concern_identity` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `dbc244e17d0c` |
| `concern_operation_joins` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `d9c7ac7e48f5` |
| `concern_operation_size` | 2 | 2 | PASS | 2 / 10 | 2 | 2 | 2 | 0 | `a4f612385e35` |
| `concern_protocol_flags` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `b16700d5dbcc` |
| `concern_record_a` | 14 | 14 | PASS | 14 / 1 | 14 | 14 | 182 | 0 | `4453125e1e11` |
| `concern_record_b` | 14 | 14 | PASS | 14 / 1 | 14 | 14 | 182 | 0 | `9bd59fba928e` |
| `concern_scope` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `b95b81a91c16` |
| `current_context` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `7b6619172437` |
| `current_header` | 4 | 4 | PASS | 5 / 1 | 5 | 5 | 15 | 0 | `1bc8419940ed` |
| `cursor` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `6f289b5e7af7` |
| `decision_citation` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `8aaeec5fb720` |
| `history_checkpoint` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `e7615ef4ab50` |
| `history_custody` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `7ac89b9c3d18` |
| `history_disclosure` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `6f6dc7fa8248` |
| `history_event` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `b4416d6b1bb0` |
| `history_original` | 7 | 7 | PASS | 8 / 1 | 8 | 8 | 48 | 0 | `556915906ce5` |
| `history_page_bytes` | 1 | 1 | PASS | 2 / 10 | 2 | 2 | 0 | 0 | `ad8b801b9c93` |
| `history_page_ref` | 1 | 1 | PASS | 1 / 3 | 1 | 1 | 0 | 0 | `8d247d25cfe8` |
| `history_shape` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `28dc1150df21` |
| `panel_command_keys` | 12 | 12 | PASS | 12 / 1 | 12 | 12 | 132 | 0 | `d07a0e3466c9` |
| `panel_command_keys_entailed` | 3 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `panel_host_candidate` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `de1a2a5cd73d` |
| `panel_host_prior` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `f7805a1836fb` |
| `panel_identity` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `f4be05d96726` |
| `panel_operation_joins` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `2a661cea0c4b` |
| `panel_operation_size` | 2 | 2 | PASS | 3 / 10 | 3 | 3 | 3 | 0 | `21ad2f632807` |
| `panel_payload` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `6e0bc642d9e1` |
| `panel_protocol` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `865f670e0766` |
| `panel_publication` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `f6213e67cd15` |
| `panel_request` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `11eb25120043` |
| `panel_result_refs` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `433d745421d7` |
| `panel_scope` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `21c23d260471` |
| `producer_route` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `2e79df9aef55` |
| `profile` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `c7cff6a61c5e` |
| `protocol_shape` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `5f7127d33c13` |
| `retry_current_alert` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `7a3785f07c50` |
| `retry_current_panel` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `2f43db3b77d7` |
| `retry_retained_alert` | 10 | 10 | PASS | 10 / 1 | 10 | 10 | 90 | 0 | `8fc65b35d0f4` |
| `retry_retained_alert_entailed` | 2 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `retry_retained_panel` | 10 | 10 | PASS | 10 / 1 | 10 | 10 | 90 | 0 | `dcdb5594276a` |
| `retry_retained_panel_entailed` | 2 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `sch_alert_operation` | 1 | 1 | PASS | 2 / 1 | 2 | 2 | 0 | 0 | `3bf4347b1a68` |
| `sch_alert_payload` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `5d3c1cc8dd4b` |
| `sch_c5_field` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `5ed4a4499139` |
| `sch_c5_operation` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `2ffd868fa6fe` |
| `sch_c5_payload` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `876101c07650` |
| `sch_checkpoint` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `8e527440cdfe` |
| `sch_concern_operation` | 1 | 1 | PASS | 2 / 1 | 2 | 2 | 0 | 0 | `83f68debea6b` |
| `sch_concern_operation_payload` | 1 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `sch_concern_payload` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `f022f672e2e1` |
| `sch_panel_operation` | 1 | 1 | PASS | 2 / 1 | 2 | 2 | 0 | 0 | `107aa65d709a` |
| `sch_panel_payload` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `2fc7fbe24513` |
| `schema_document` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `e927e3d56662` |
| `schema_ref` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `291174db1e8f` |
| `storage_schema` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `94d9851befba` |
| `writer_policy` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `e1bd8029ce92` |

## Self-tests and the inventory gate

| Command | Exit | Credited result |
|---|---:|---|
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `"status": "pass"`, 580 of 580 cases (304 negatives), 0 failures |
| `python3 scripts/pm_event_numbers.py --self-test` (scope all) | 1 | `"status": "fail"`, `case_execution: NOT_RUN_ADMISSION_REFUSED`: the inventory gate refuses before any of the 13,626 cases runs (`datetime_inventory_complete_and_classified`). Recorded, as addendum 2 asks; not a lane result. |
| `python3 scripts/pm_event_datetime_inventory.py` (final head `ffc43eae22`) | 1 | `"status": "fail"`, 233 nodes, 0 unclassified nodes, 0 `inventory_node_changed`, 234 scan rows: 139 `unclassified_mentioning_container`, 48 `stale_scan_exclusion`, 47 `unreadable_mentioning_container` |
| the same at `3fc13d0ccc` (before the owner-text rewording) | 1 | 300 scan rows; the 22 extra were my edited CV/SP/F3 unit fences, removed by `ffc43eae22` |
| the same gate on the lane tree before any part 2B edit (the merge `d3fd87730a`, a scratch sparse worktree) | 1 | 230 scan rows. The final head has exactly those 230 plus the 4 rows from the local ignored currentness copy: **part 2B adds no gate row** |
| `python3 scripts/pm_event_datetime.py --self-test` | 0 | **not credited**: the module has no entry point and runs nothing (addendum 2 correction) |

Scan rows at the final head, by source: 213 derived (regenerated `_shards`, `.plan_index` and migration outputs whose exclusion pins went stale); 7 DG6A fixture files (alert ×4, panel ×2, concern.created), whose `semantic_digest_cases` and retry metadata spell `observed_at_utc` as data; 4 in the git-ignored currentness copy, which `pm-plan-index.py generate` needs locally; 4 `Plans/Decision_Log.md` and 4 `Plans/usage-feature.md` fences (DL-028, DL-054, DL-418, DL-450, UF-079, UF-085, UF-087, UF-088); 2 `Plans/Contracts_V0.md` fences (CV-317, CV-318). None of the last ten is a DG6A unit. No row is a false pass: the gate fails closed. The inventory and exclusions files are NUMRULE's and were not edited. The batch-2 integration refresh owns these rows. **`datetime_validator` and the inventory gate run at batch-2 integration.**

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. "Before" is the part 2A self-grade; "after" is this self-grade.

| Family | Before → after |
|---|---|
| `alert.acknowledged`, `alert.dismissed`, `alert.rule_muted`, `alert.snoozed` | 9P / 2Q / 1A → 9P / 2Q / 1A (each) |
| `panel.redocked`, `panel.undocked` | 9P / 2Q / 1A → 9P / 2Q / 1A (each) |
| `concern.created` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `bundle.note_created`, `bundle.note_status_changed`, `bundle.annotation_state_changed` | 9P / 2Q / 1A → 9P / 2Q / 1A (each) |
| `concern.assigned`, `concern.evidence_linked`, `concern.promoted`, `concern.reopened`, `concern.resolved`, `concern.updated` | 9P / 2Q / 1A → 9P / 2Q / 1A (each) |

**144 PASS / 32 PARTIAL / 16 ABSENT, unchanged.** No cell changes status.
- **C12 `positive_negative_oracles` stays PARTIAL.** Timestamps are no longer a reason: every field is checked by the shared CV-1101 predicate with its profile, and witnesses show the shared Refusal as the validation cause. Part 2A's S-FMT1 and S-N2 are closed. It stays PARTIAL because JSON Schema keyword cuts are not ported to the tool (schema occurrences are verdict rows), because `datetime_validator` and the whole-Plans inventory gate run at batch-2 integration (they refuse in a lane tree on drift alone), and because the batch Sol/Astra review has not run.
- **`compatibility_withdrawal` stays PASS.** Its finding now cites the SP-1101 composition, with the edition selected by custody rather than caller evidence.
- C7 retention stays PARTIAL (PENDING_RETENTION_DECISION); C1 membership stays ABSENT.

Self-grade changes: the C12 and `compatibility_withdrawal` findings and evidence (custody `resolve`, the custody call in `historical_refusals`, `history_custody` and `datetime_payload` witnesses, the shared predicate in the lane format checker), `remaining_gaps`, and a `sweep_p2b` record. Every quote was re-checked at its line: 309 at their line, 70 relocated by line number inside their own unit section or file, and 9 re-pointed to the successor sentence in F3-706..714 ("C12 remains PARTIAL: JSON Schema keyword cuts are not ported to that tool,"). `--audit-grade-only`: pass, 16 families, 475 citations.

## What Astra keeps finding, probed (part 2B deltas)

- **Class 1, forged or contradictory inputs:** a retained original's bytes must be the ones Storage sealed at its ref (HC02/RQ02). Its binding must equal the sealed binding (HC03/RQ03). Its identity is recomputed by the frozen verifier (HC05). A coherent forgery of candidate and original together now refuses; before part 2B it was accepted.
- **Class 2, Storage metadata:** Storage instants take CV-253's strict profile at every read site (PD04, HG05, preimages).
- **Class 3, historical readers:** owner-valid retained history stays readable after the grammar change. That covers leap seconds, lowercase/offset timestamps, legacy integral floats and 2^64−1 metadata. Owner-invalid, unsealed, foreign-bound, unsupported or foreign-recipe originals refuse. Current writer rows never run on a retained original.
- **Class 4, one field read two ways:** timestamps are validated once by the shared predicate and compared only by the lane's exact `instant_le`; strings are never rewritten.
- **Class 7, custody:** both retained paths (read and retry) run the dispatcher; custody is never taken from a caller flag.
- **Class 10a, history after a tightened rule:** the frozen recipe comes from sealed custody, never from request data; downgrade and replaced-resource selections refuse.
- **Class 11, exact types:** a `str`-subclass timestamp refuses (`date_time_type`).
- **Class 12, skipped formats:** the predicate is installed explicitly in the lane format checker. The witnesses read the shared Refusal as the error cause, and the trial `CV1101_predicate_removed` is caught.
- The other classes are unchanged from part 2A.

## Commands and evidence

Heavy runs went one at a time on the VM's local disk. Two gated long-jobs ran: `dg6a-p2b-vg` at `98760da363` and `dg6a-p2b-vg2` at `3fc13d0ccc`. Each started only at ≥13.5 GiB available and paused below 10 GiB, resuming at 11; the guard tool has its own MemoryGate (10/11). Three slips, stated plainly:
- the collect-only guard pass started at 15 GiB, but a first verification job started at 9 GiB and was stopped after 8 s (one family checker had run);
- four single-family smoke runs (about 30 s each) ran at 10 GiB;
- the first gated run found the PD04 crash and a stale self-grade line. It was stopped between stages, never mid-mutation: final-regression writes fixtures in place. Both were fixed (`3fc13d0ccc`) and everything was rerun at `3fc13d0ccc`.

No browser was used. PM7 work was not touched.

| Command (at `3fc13d0ccc` unless noted) | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 58c2816ff33365384d4039553f5efdb5370930e6` | 0 | clean (`d3fd87730a`), 7 files, each equal to `58c2816ff3` |
| sixteen family checkers | 0 each | `pass`: alert 635/638/639/667, panel 666/665, concern.created 745, Card 5 annotation 380, note_created 1,024, note_status_changed 1,031, assigned 1,107, evidence_linked 1,086, promoted 1,108, reopened 1,087, resolved 1,133, updated 1,087 |
| `python3 scripts/pm-dg6a-domain-check.py --family F` (7 families) | 0 each | `pass`: 8,965 / 9,091 / 9,289 / 9,850 / 11,125 / 11,114 / 11,834 observations |
| `python3 scripts/pm-dg6a-final-regression-check.py --family F` (7 families) | 0 each | `pass`: 129/129/129/155 (alert), 167/167 (panel), 129 (concern); every mutated input restored |
| `python3 scripts/pm-dg6a-final-regression-check.py --audit-grade-only` (final head) | 0 | `pass`, 16 families, 475 citations |
| `python3 scripts/pm-dg6a-table-generate.py scripts --check` | 0 | 90 generated tables, 478 rows (+9 hand-written); no stale or extra module |
| `python3 scripts/pm-dg6a-guard-check.py` | 0 | fixture vectors 224/224/223/232/223/223/253; `proof: none` |
| `python3 scripts/pm-dg6a-number-corpus.py --json …` | 0 | 5,184 route runs over 81 values and 16 families, 0 disagreements (1,264 accepted, 3,920 refused). At `98760da363` it exited 1 with `KeyError: 'observed_at_utc'` from PD04; fixed in `3fc13d0ccc` |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580/580 (304 negatives) |
| `python3 scripts/pm_event_numbers.py --self-test` | 1 | admission refused by the inventory gate, 0 cases run (recorded, addendum 2) |
| `python3 scripts/pm_event_datetime_inventory.py` (final head / pre-edit merge) | 1 / 1 | 234 / 230 scan rows; the difference is the local ignored currentness copy |
| `python3 scripts/pm_event_datetime.py --self-test` | 0 | runs nothing; not credited |
| `python3 scripts/pm-dg6a-p2b-trials.py <trial> <checker> <family>` ×18 | 0 each | 18/18 caught |
| `python3 scripts/pm-dg6a-guard-tables.py --out <dir>` (long-job `dg6a-p2b-vg2`) | 1 | 99 tables: 90 `PASS`, 9 entailed `NOT_RUN`; 498/518 proved; 0 masked, 0 unrelated changes, 0 lane-matrix problems (exit 1 only because the entailed tables have no negative) |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json`; `python3 scripts/pm-plan-index.py generate` (currentness edition SHA-256 tree `69e5e402…` equal to the shared checkout's), twice (`a041faf303`, `ffc43eae22`) | 0 | only `Plans/_shards/{contracts_v0,storage-plan,finalguispec}` and `Plans/.plan_index` changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass` |
| `python3 scripts/pm-plan-index.py validate` (origin/main `77bae0c636`, final head) | 1 | top-level `fail`, 59 failures, the same set as part 2A. 38 `plan_unit_removed_without_ledger_decision` are units main added after this branch's base (for example DL-470..472, F3-716..718, ACD-637..640, CV-369); 21 are `plan_unit_removal_ledger_invalid` in existing ledgers. None names a DG6A unit. The integration rebase owns them. |

Commits: `d3fd87730a` (merge), `f587c80cd8` (scripts), `a041faf303` (owner text, shards, index), `98760da363` (`str`-subclass witness), `3fc13d0ccc` (PD04 fix), `ffc43eae22` (owner text rewording, shards, index), then the report commit (external `HEAD.txt`). Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/sweep-p2b/`, with SHA-256 of every file in `SHA256SUMS`. No pm-mail other than the final line, no subagent, no admission, no registry append, no Decision Log change, no governance artifact edit, no landing lock and no push to main. The worktree is removed after publication.

---

Everything below is **superseded source lineage**. Its "interim only" timestamp statements and its "Part 2B items" list are closed by the section above.

# Earlier reports — historical; the sweep part 2B report above is current

# DG6A — sweep part 2A (guard tables on the gated tool) and part 2B numbers

**Branch:** `plans/ea-w2-gui-concerns-20261104`, part 2A start `2a0ceaa355`. Gated guard-tool merge `5ce68412d9` (tool `004bdedd63`, eleven files, none edited). Gated NUMRULE number-scope merge `b789fd717b` (exactly `a16f67c1ef`, never the branch head; it brings no main commit; its 163 conflicts were all in `Plans/_shards/**` and `Plans/.plan_index/**` and were resolved by regeneration, never by hand). Implementation head `e8de3e0b52`; the delivery head (this report commit) is in the external `HEAD.txt`. No rebase onto main this round.

**All sixteen families keep their grades** (9 PASS / 2 PARTIAL / 1 ABSENT each). Part 2A closes part-2 item 1 (S1): every refusal of all four DG6A checkers — the alert shared library, the panel, concern.created and Card 5 checkers — is one named row of a Method B guard table (**98 tables, 505 rows**: 89 generated from one row spec plus the nine first-pass tables), and the gated tool proves **487 of 505 rows**, every table that has a negative `PASS`, with 0 masked negatives and 0 unrelated changes. The 18 rows it cannot prove are refused first by a schema const or bound, or by an earlier row, by construction; each sits in a table of its own with its proof (below), so the other rows keep their credit. Part 2B numbers closes S2 and its stale expectations with the shared CV-1100/SP-1100 calls; SP-1101 authenticated retained dispatch and CV-1101 date-time stay part 2B. Membership stays ABSENT; native execution is NOT_RUN. **This lane's own review of its timestamp fields is interim only** (pm7-build, 2026-11-05 16:50Z). Sol and Astra review the lane once, after part 2B.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` with `--no-ff` as `5ce68412d9`: exactly the eleven tool files, no conflict, none edited since. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat 5ce68412d9^1 5ce68412d9` lists 11 files; `git diff 5ce68412d9 HEAD -- scripts/pm_guard_isolation.py scripts/pm_guard_isolation_traps.py Plans/guard_isolation_traps.json` is empty. |
| **S1 — first-pass tables** (fixed, `fdca07b70e` … `a94c77a6bd`) | Nine hand-written tables (40 rows): Card 5 `decision_citation`, `storage_schema`, `current_header`, `current_context`; alert `profile`, `writer_policy`, `cursor`; panel and concern checkpoint scope. Unchanged this session and re-proved in the final run. | `scripts/pm_dg6a_table_{decision_citation,storage_schema,current_header,current_context,profile,writer_policy,cursor,panel_scope,concern_scope}.py` | Final run: all nine `PASS`, 40/40. |
| **S1 — every other refusal** (fixed, `9ae2db3d40`) | All remaining refusals of the four checkers go through 89 generated tables (465 rows) from one row spec, `scripts/pm-dg6a-table-generate.py`, dispatched by `scripts/pm_dg6a_tables.py` (`first` for an early-return chain, `every` for a collect-all site). Derivations recompute digests, identities, sizes and typed joins and decide nothing. Or-chains are one row per predicate (same code kept); per-key loops are one row per key (command/payload fields, owner snapshot fields, candidate-record fields, retained identity fields); a guard required with different predicates on different branches is one row per predicate (Card 5 `recorder` ×3, `old_owner`/`new_owner` ×2). Each schema occurrence is one verdict row, as in DS15, DT, DO, DR and DCH (JSON Schema keyword cuts are not ported). Card 5 `operation_guards` keeps its body as the derivation (`require` records a fact) and asserts every recorded fact has a row. | `scripts/pm_dg6a_tables.py:48` (`first`), `:61` (`every`); `scripts/pm-alert-event-contracts-check.py:64` (`errors`), `:205` (`operation_errors`), `:279` (`retry_refusals`), `:327` (`protocol_errors`), `:347` (`append_result_errors`), `:449` (`checkpoint_errors`), `:712` (`history_page`), `:835` (`historical_refusals`); `scripts/pm-panel-event-contracts-check.py:151`, `:170`; `scripts/pm-concern-created-contracts-check.py:100`, `:117`; `scripts/pm-card5-event-contracts-check.py` `operation_refusals`, `history_mapping_refusals`, `mapping_errors` | `python3 scripts/pm-dg6a-table-generate.py scripts --check` (89 generated tables, 465 rows, no stale or extra module); all sixteen family checkers `pass`. |
| **S1 — the `history_shape` early-return defect** (fixed, `9ae2db3d40`, retired `e1aa809286`) | `history_shape` is now a nine-row chained table (`HS01`–`HS09`); the reader returns its refusal before deriving any later fact. The guard-check `history_matrix` that popped the early return and bypassed the remaining reader checks is removed. | `scripts/pm-alert-event-contracts-check.py:746` (`history_shape_refusal`); `scripts/pm_dg6a_table_history_shape.py` | Final run: `history_shape` `PASS` 9/9. |
| **Missing negatives** (fixed, `efd21e5a48`, `874a37002a`, the PK14 commit) | The first collection left 98 generated rows with no single-row negative. `scripts/pm_dg6a_p2a_witnesses.py` builds one-defect witnesses from valid parents of each family, with every observing copy moved (recomputed request digests; the concern candidate-record fields the recipe derives from the command; optional command fields added coherently to command and payload first); each asserts the complete checker's exact result. Rows covered: command/payload per-field joins (alert, panel, concern), append evidence shape/event type/settled receipt, checkpoint token selection and server id, protocol shape containers, retained retry edition/stored/payload, current retry preimage and digest, every `history_shape` row, retained event instants/members/scope/observed/persisted, payload edition, receipt instants, original admission, Card 5 mapping shape and history mapping evidence, concern identity/project/creator kind, producer route, operation encodability. | `scripts/pm_dg6a_p2a_witnesses.py:383` (`alert_all`), `:418` (`panel_all`), `:440` (`concern_all`), `:354` (`card5_mapping`), `:451` (`unencodable`) | Lane matrix 0 problems; final run rows without a negative are exactly the 18 entailed rows. |
| **Two-row negatives** | The collection never feeds a witness refused by two rows of one table to the tool; it lists them. Two kinds exist, both by construction, and single-row witnesses prove each row of each set (table below). | `scripts/pm-dg6a-guard-tables.py:70` (`Collector`, `multi`) | Final run summary `multi_row`. |
| **Retired machinery** (`e1aa809286`, `9ae2db3d40`, `874a37002a`) | `pm-dg6a-guard-check.py` keeps only the fixture vector runner the checkers call (`vectors`, `fixture_cases`, `run_case`); `rejection_mutants`, `install`/`restore`, `duplicate_proofs`, `executed_cases`, `history_matrix` and `checkpoint_schema_matrix` are removed. The in-checker `historical_guards` weakening blocks are removed (each history `historical_reader_cases` call loses 31 such runs). `pm-dg6a-domain-check.py` loses its keyword-removal and `patch.object` guard-removal proofs; its case generation stays. No proof credit is claimed from either driver. | `scripts/pm-dg6a-guard-check.py:1-160`; `scripts/pm-dg6a-domain-check.py` | `python3 scripts/pm-dg6a-guard-check.py` prints vector counts and `proof: none`. |
| **Real crash: 4,400-digit integers** (fixed, `874a37002a`) | The old raw ingress (`json.loads(..., parse_int=int)`) raised `ValueError: Exceeds the limit (4300 digits)` on a valid 4,400-digit integer, and stock jsonschema raises the same while formatting an error message about one. CV-1100 sets no global cap. Raw JSON now goes through the shared `loads_current_json`, and validation messages are formatted under a scoped, restored `int_max_str_digits(0)`. | `scripts/pm-dg6a-domain.py:63` (`exact_integer_text`), `:77` (`ExactSchemaValidator`), `:108` (`loads`) | Number corpus value `token-unbounded` (5,000 digits): payload slot accepted, checkpoint refused, no exception. |
| **Real crash: unencodable integers** (fixed, `874a37002a`) | With no lane cap, an integer outside the canonical MessagePack recipe domain reached `len(packed(value))` and raised. Physical size phases now refuse it through a row (`OS00`, `PZ00`, `QZ00`; the checkpoint row `CZ00` is entailed, below). | `scripts/pm-alert-event-contracts-check.py:81` (`encoded_size`) | Witness `operation_unencodable` per alert/panel/concern family. |
| **Card 5 manifest `decision_branch`** | Already closed in sweep part 1: the manifest names the landed `Plans/Decision_Log.md`, and `decision_citation` refuses a retained `decision_branch` (DC rows). | `Plans/card5_event_contracts/manifest.json:4` | `decision_citation` `PASS` 5/5. |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new PlanUnit, Decision Log or admission IDs; CV-680..686 and SP-660..666 change in place.

## Guard-table result

The gated tool ran once per table that has a negative (**89 runs, all `PASS`**) over **509 negatives and 142 controls**, drawn from one recorded run of all sixteen complete family suites (generated tables) and the first-pass collectors (hand-written tables). **487 of 505 rows are proved; 18 are unprovable by construction** and sit in the nine tables of their own that have no negative (tool `NOT_RUN`, listed below). Credit is the tool's own `rows[].proved`. Each cut swaps one table row to always-pass; the tool runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. "Own" negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays"). 14340 tool evaluations; run at `0380bc0c2b` (long-job `dg6a-p2a-final`, `guard/summary.json`). The one later commit (`e8de3e0b52`) changes only the replacement value of one witness (the same `CT05` observation).

| Checker part | Tables | Rows | Proved | Unproved (own tables, proofs below) | Tool negatives / controls | Cut: own flips | Cut: stays | Masked | Unrelated changes |
|---|---:|---:|---:|---|---:|---:|---:|---:|---:|
| Hand-written first-pass tables (Card 5, alert, panel, concern) | 9 | 40 | 40 | none | 41 / 9 | 41 | 217 | 0 | 0 |
| Schema documents and schema occurrences (verdict rows) | 13 | 15 | 14 | CONCERN_OPERATION_PAYLOAD_schema | 17 / 12 | 17 | 6 | 0 | 0 |
| Alert payload and operation (shared library) | 11 | 67 | 64 | OK07_command_id, OK12_handler_target, OK16_mute_scope | 73 / 20 | 73 | 472 | 0 | 0 |
| Checkpoint, producer route, protocol shape, retries and append evidence (shared) | 12 | 48 | 45 | CZ00_encodable, RR08_digest, RR08_digest | 51 / 19 | 51 | 284 | 0 | 0 |
| Retained-history reader and bounded read-through (shared) | 7 | 39 | 39 | none | 40 / 18 | 40 | 270 | 0 | 0 |
| Panel (pm-panel-event-contracts-check.py) | 12 | 52 | 49 | PK03_command_id, PK07_panel_id, PK13_target_host | 50 / 20 | 50 | 273 | 0 | 0 |
| concern.created (pm-concern-created-contracts-check.py) | 12 | 78 | 76 | CK03_command_id, CK07_handler_target | 77 / 24 | 77 | 603 | 0 | 0 |
| Card 5 operations, mapping and history mapping (pm-card5-event-contracts-check.py) | 22 | 166 | 160 | G_after_bundle_id, G_after_doc_id, G_after_annotation_id, G_after_note_id, G_after_provenance_ref, HN09_after_present | 160 / 20 | 160 | 1334 | 0 | 0 |
| **Total** | 98 | 505 | 487 | 18 | 509 / 142 | 509 | 3459 | 0 | 0 |

Lane matrix (uncapped, every distinct negative against every row of its table): **0 problems**. The runner exits 1 only because the nine entailed tables have no negative. Per table:

| Table | Rows | Proved | Tool | Negatives / controls (tool) | Distinct single-row negatives | Flips | Stays | Two-row witnesses excluded | Report SHA-256 (12) |
|---|---:|---:|---|---:|---:|---:|---:|---:|---|
| `alert_candidate_state` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `c4ad1fe6669a` |
| `alert_command_keys_a` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `6d43f485a6cd` |
| `alert_command_keys_b` | 12 | 12 | PASS | 12 / 1 | 12 | 12 | 132 | 0 | `fd4d3f6441b4` |
| `alert_command_keys_entailed` | 3 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `alert_operation_identity` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `02dead9393e1` |
| `alert_operation_joins` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `89b965180115` |
| `alert_operation_size` | 2 | 2 | PASS | 6 / 10 | 6 | 6 | 6 | 0 | `9edc706ac90e` |
| `alert_owner_candidate` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `f220a9448865` |
| `alert_owner_prior` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `2058e5ba05c7` |
| `alert_payload` | 7 | 7 | PASS | 12 / 2 | 12 | 12 | 72 | 0 | `3e990ac90e08` |
| `alert_protocol` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `2b87691ab889` |
| `append_result` | 11 | 11 | PASS | 13 / 2 | 13 | 13 | 130 | 0 | `7d0b5eddd9c8` |
| `c5_after` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `532243f60e31` |
| `c5_after_note_entailed` | 5 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `c5_assessment` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `18649e5c4f60` |
| `c5_before` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `5e4588b42aec` |
| `c5_concern_a` | 12 | 12 | PASS | 12 / 1 | 12 | 12 | 132 | 2 | `dead47b6c72b` |
| `c5_concern_b` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `a02279b0beb5` |
| `c5_concern_c` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `74ee64cdb80d` |
| `c5_core_a` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `be71c0e6f00b` |
| `c5_core_b` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `cd85773077a9` |
| `c5_history_mapping_after` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `fa87bd02f4ff` |
| `c5_history_mapping_after_entailed` | 1 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `c5_history_mapping_before` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `d52c201769e9` |
| `c5_history_mapping_object` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `bc9263313df7` |
| `c5_history_mapping_payload` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `078642383f55` |
| `c5_mapping` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `154b31121d22` |
| `c5_mapping_shape` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `8e7cbc0811ef` |
| `c5_note_ids` | 10 | 10 | PASS | 10 / 1 | 10 | 10 | 90 | 0 | `b88aee1e5210` |
| `c5_note_state` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `aaeaf8aadba0` |
| `c5_outgoing` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `9414443378da` |
| `c5_phase` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `888cf3102807` |
| `c5_receiving` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `dcc00cf603b1` |
| `c5_resolution` | 15 | 15 | PASS | 15 / 1 | 15 | 15 | 210 | 0 | `3a3b4245b610` |
| `checkpoint_encoding_entailed` | 1 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `checkpoint_size` | 1 | 1 | PASS | 5 / 10 | 8 | 5 | 0 | 0 | `ec0812c7cdf7` |
| `checkpoint_token` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 1 | `c6f98a3169c6` |
| `concern_authority` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `307850679380` |
| `concern_command_keys_a` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `446847d42216` |
| `concern_command_keys_b` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `db44207f73c0` |
| `concern_command_keys_entailed` | 2 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `concern_creator` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `41b3396041ec` |
| `concern_existence` | 4 | 4 | PASS | 5 / 5 | 5 | 5 | 15 | 0 | `67619bf529a1` |
| `concern_identity` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `3ed0d16bcd8f` |
| `concern_operation_joins` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `947e30d04292` |
| `concern_operation_size` | 2 | 2 | PASS | 2 / 10 | 2 | 2 | 2 | 0 | `fdc9ecee3192` |
| `concern_protocol_flags` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `0deb1f39177a` |
| `concern_record_a` | 14 | 14 | PASS | 14 / 1 | 14 | 14 | 182 | 0 | `9d927adac76e` |
| `concern_record_b` | 14 | 14 | PASS | 14 / 1 | 14 | 14 | 182 | 0 | `af1b2bd2bceb` |
| `concern_scope` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `1e04411bc05b` |
| `current_context` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `5cef6702ffd0` |
| `current_header` | 4 | 4 | PASS | 5 / 1 | 5 | 5 | 15 | 0 | `0e3ac06d28c2` |
| `cursor` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `c59dc4153e4c` |
| `decision_citation` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `e10cbaf02a73` |
| `history_checkpoint` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `ba200f939c4c` |
| `history_disclosure` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `f8cf0942d661` |
| `history_event` | 11 | 11 | PASS | 11 / 1 | 11 | 11 | 110 | 0 | `3a365fd46162` |
| `history_original` | 8 | 8 | PASS | 8 / 1 | 8 | 8 | 56 | 0 | `a87be908e79b` |
| `history_page_bytes` | 1 | 1 | PASS | 2 / 10 | 2 | 2 | 0 | 0 | `e16d00969ed4` |
| `history_page_ref` | 1 | 1 | PASS | 1 / 3 | 1 | 1 | 0 | 0 | `d233604428a7` |
| `history_shape` | 9 | 9 | PASS | 9 / 1 | 9 | 9 | 72 | 0 | `f9791f447009` |
| `panel_command_keys` | 12 | 12 | PASS | 12 / 1 | 12 | 12 | 132 | 0 | `9abab3a31040` |
| `panel_command_keys_entailed` | 3 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `panel_host_candidate` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `64390993d880` |
| `panel_host_prior` | 4 | 4 | PASS | 4 / 1 | 4 | 4 | 12 | 0 | `512eb31cd824` |
| `panel_identity` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `dc489fb11695` |
| `panel_operation_joins` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `62b7e2a38fb8` |
| `panel_operation_size` | 2 | 2 | PASS | 3 / 10 | 3 | 3 | 3 | 0 | `6b6ff20d792b` |
| `panel_payload` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `a343f9822f24` |
| `panel_protocol` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `0cfaea441415` |
| `panel_publication` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `3a911e88fbc9` |
| `panel_request` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `8a6c932c008a` |
| `panel_result_refs` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `873cb7e7846c` |
| `panel_scope` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `db02dc1460e3` |
| `producer_route` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `f2eb935a77b5` |
| `profile` | 5 | 5 | PASS | 5 / 1 | 5 | 5 | 20 | 0 | `0c71e133b22a` |
| `protocol_shape` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `7dc0f4e50aac` |
| `retry_current_alert` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `7b7b5fed550f` |
| `retry_current_panel` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `72d8efa40485` |
| `retry_retained_alert` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `deacf9f2ecea` |
| `retry_retained_alert_entailed` | 1 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `retry_retained_panel` | 7 | 7 | PASS | 7 / 1 | 7 | 7 | 42 | 0 | `c0df7ed54ae3` |
| `retry_retained_panel_entailed` | 1 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `sch_alert_operation` | 1 | 1 | PASS | 2 / 1 | 2 | 2 | 0 | 0 | `da316207b5ed` |
| `sch_alert_payload` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `79783cb4a35d` |
| `sch_c5_field` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `38ea58a9f886` |
| `sch_c5_operation` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `23cb4280c011` |
| `sch_c5_payload` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `c00a545a6f85` |
| `sch_checkpoint` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `f9eddb1184bf` |
| `sch_concern_operation` | 1 | 1 | PASS | 2 / 1 | 2 | 2 | 0 | 0 | `0c59cd459e4f` |
| `sch_concern_operation_payload` | 1 | 0 | NOT_RUN (no negative) | 0 / 0 | 0 | 0 | 0 | 0 | `` |
| `sch_concern_payload` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `d0788a702040` |
| `sch_panel_operation` | 1 | 1 | PASS | 2 / 1 | 2 | 2 | 0 | 0 | `cb8152091a9f` |
| `sch_panel_payload` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `964879c399e0` |
| `schema_document` | 1 | 1 | PASS | 1 / 1 | 1 | 1 | 0 | 0 | `7914a56306ff` |
| `schema_ref` | 3 | 3 | PASS | 3 / 1 | 3 | 3 | 6 | 0 | `5e872806bd71` |
| `storage_schema` | 6 | 6 | PASS | 6 / 1 | 6 | 6 | 30 | 0 | `7e835e4fd7ff` |
| `writer_policy` | 2 | 2 | PASS | 2 / 1 | 2 | 2 | 2 | 0 | `76d8b58ed80f` |

Per family, generated-table rows refused by that family's own single-row witnesses (rows shared by several families count for each):

| Family | Rows refused by its own single-row witnesses |
|---|---:|
| `alert.acknowledged` | 120 |
| `alert.dismissed` | 120 |
| `alert.rule_muted` | 121 |
| `alert.snoozed` | 124 |
| `bundle.annotation_state_changed` | 72 |
| `bundle.note_created` | 60 |
| `bundle.note_status_changed` | 66 |
| `concern.assigned` | 89 |
| `concern.created` | 139 |
| `concern.evidence_linked` | 71 |
| `concern.promoted` | 91 |
| `concern.reopened` | 74 |
| `concern.resolved` | 106 |
| `concern.updated` | 72 |
| `panel.redocked` | 124 |
| `panel.undocked` | 123 |

**Rows unprovable by construction (kept as checks; each in a table of its own, so the other rows keep their credit).** The tool reports these tables `NOT_RUN` (no negative); no input reaches their rows first.

| Table | Row(s) | Why no input can refuse there first |
|---|---|---|
| `alert_command_keys_entailed` | OK07 `command_id`, OK12 `handler_target`, OK16 `mute_scope` | the operation schema fixes both copies to the same const, so `sch_alert_operation` refuses any other value first: `Plans/alert_event_contracts/alert_acknowledged_operation.schema.json:136`/`:388` (`command_id`), `:133`/`:385` (`handler_target`); `alert_dismissed_operation.schema.json:138`/`:392`, `:135`/`:389`; `alert_rule_muted_operation.schema.json:145`/`:398`, `:142`/`:395`, `:129`/`:382` (`mute_scope`); `alert_snoozed_operation.schema.json:142`/`:400`, `:139`/`:397` (payload/command) |
| `panel_command_keys_entailed` | PK03 `command_id`, PK07 `panel_id`, PK13 `target_host` | same: `Plans/panel_event_contracts/panel_redocked_operation.schema.json:192`/`:403`, `:189`/`:406`, `:204`/`:424`; `panel_undocked_operation.schema.json:192`/`:403`, `:189`/`:406` (its command declares no `target_host`) |
| `concern_command_keys_entailed` | CK03 `command_id`, CK07 `handler_target` | same: `Plans/concern_created_contracts/concern_created_operation.schema.json:106`/`:410`, `:109`/`:407` (command/payload) |
| `sch_concern_operation_payload` | `CONCERN_OPERATION_PAYLOAD_schema` | the operation schema embeds the payload schema (its `payload_*` `$defs` renamed), so `sch_concern_operation` refuses every payload defect first; `payload_schema_entailment` (`scripts/pm-concern-created-contracts-check.py:147`, called at `:391`) checks the two are equal after renaming on every run |
| `checkpoint_encoding_entailed` | CZ00 `encodable` | every checkpoint integer slot is a Storage sequence bounded 0..2^64-1 (SP-1100) and no slot admits a fractional number, so `sch_checkpoint` refuses every value the recipe cannot encode; `checkpoint_encoding_entailment` (`scripts/pm-alert-event-contracts-check.py:473`) checks each family's checkpoint schema on every run (alert `:1264`, panel `:307`, concern `:373`, Card 5 `:654`) |
| `retry_retained_alert_entailed`, `retry_retained_panel_entailed` | RR08 `digest` | RR06 (`scripts/pm-alert-event-contracts-check.py:272`) equates the earlier-recipe digest of the stored body with the operation's `request_digest`, and RR07 (`:273`) makes the retry body exactly that stored body; both call sites pass the original operation's `request_digest` as the comparison digest (`:340`, `scripts/pm-panel-event-contracts-check.py:188`) |
| `c5_after_note_entailed` | `after_bundle_id`, `after_doc_id`, `after_annotation_id`, `after_note_id`, `after_provenance_ref` | the expected post-state value is the before record's field, and `note_after_<field>` and `note_before_<field>` (`scripts/pm-card5-event-contracts-check.py:279`, `:281`) join both records to the payload field first; the fields are string-typed, so exact and `==` agree (note creation copies the after record, so no mismatch exists there) |
| `c5_history_mapping_after_entailed` | HN09 `after_present` | `mapping_errors` refuses a non-object `after` first (`MS05_after_object`, `scripts/pm-card5-event-contracts-check.py:549`) |

**Witnesses excluded from the table proof (still refused in the full checker).**

| Table | Rows refused together | Why two rows by construction (single-row witnesses prove each row) |
|---|---|---|
| `c5_concern_a` | `worker_proposal_only` with `recorder_controller` (5.b/5.d/5.f/5.g) or `recorder_user_or_controller` (5.c) | an action by a `worker` is both a worker proposal and not a controller/user recorder; the fixture expects both codes (`['worker_proposal_only', 'recorder']`); the recorder-kind and worker-proposal single-row witnesses prove each row |
| `checkpoint_token` | CT01 `token_storage` with CT03 `storage_instance_id` | a checkpoint of another Storage instance differs from its token and from the original-event context; `checkpoint_context_cases` (token only) and the context witnesses prove each row |

**Cross-table pair.** `PW01_window` (`panel_operation_joins`) and `PK14_window_id` (`panel_command_keys`) read the same panel.redocked command field when the command has no `target_window`; the `command_window_id` witness is refused by exactly those two rows, each the only row of its own table, and each table's cut flips it (`scripts/pm_dg6a_p2a_witnesses.py:271`, `panel_operation`).

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`), as in DS15, DR, DX, DC and DCH. The complete path is the full checker, which reaches every refusal through the same rows in the same order. No `NonGuard` other than the `return g.Case(table, check, context)` plumbing return was needed; every table module was prescanned before its run. Witness collection runs every complete family suite once under the recorder (`scripts/pm-dg6a-guard-tables.py:94`); a passing evaluation is a control, a single-row refusal a negative; the tool then runs per table on up to five negatives per row (families round-robin) and up to ten controls, after the uncapped lane matrix checked every distinct negative against every row of its table.

**What Astra keeps finding, probed for part 2A.** (1) Forged identities and digests: recomputed in derivation and compared by rows (OI01–OI03, PI01–PI02, CI01–CI04, c5 `operation_identity`/`event_identity`/`request_digest`); forged copies are the negatives. (2) Storage-assigned metadata: retry comparison covers the caller body only (`retry_refusals`, CC05); receipt and source fields join the independent original (AR01–AR10, HG17–HG19). (3) Historical readers: current-writer rows never run on a retained original (`historical_refusals` calls no protocol/writer table); retained large-revision history reads; withdrawn, forged and foreign originals refuse (HG01–HG26). (4) One field read two ways: typed exact joins at retained/append evidence (`exact_value`), integer slots through `current_integer`. (5) Unresolved references: SR01–SR03 per reference occurrence, unused definitions included. (6) Size: OS/PZ/QZ/CZ rows measure the complete encoded value and refuse an unencodable one. (7) Custody: retry, recovery and return paths run the retained recipe and the append evidence joins. (8) Masked negatives: lane matrix 0 problems; tool 0 masked, 0 unrelated changes. (9) Grades unchanged; C12 stays PARTIAL. (10, 10a) Numbers: below. (11) Exact types: AP05, PH01–PH06, HS01–HS09, MS01–MS08, CC01 with wrong-type negatives. (12) Timestamps: interim only, part 2B.

## Sweep part 2B numbers: findings and responses

The NUMRULE number scope was merged at exactly `a16f67c1ef` after the guard-tool merge. The date-time code is **not** adopted: `pm_event_datetime` is imported nowhere in the lane, and `datetime_validator`, `date_time` and the inventory gate are not called. Recipe IDs, identity preimages and tuple positions are unchanged.

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Merge the gated number scope** | `git merge --no-ff a16f67c1ef` as `b789fd717b`; only NUMRULE's own files and text; 163 conflicts, all generated, resolved by `pm-shard-plans --generate`, `pm-plan-index generate` (currentness edition hash-verified) and `--check`. | merge commit | `git log --format=%P -1 b789fd717b`; `git diff b789fd717b HEAD -- scripts/pm_event_numbers.py scripts/pm_event_numbers_corpus.py Plans/event_number_recipe_corpus.json` is empty. |
| **S2 — current tokens and integer slots** (fixed, `874a37002a`) | `loads` is the shared `loads_current_json` (`-0`, `01`, nonfinite, duplicate keys and lone surrogates refuse; fractional tokens stay exact carriers). Every schema integer slot is admitted by the shared `current_integer` (the exact type checker of the lane validator) with the slot's own `minimum`/`maximum`; no blanket walk. The `SAFE_INTEGER` cap in `semantic_numbers` is gone: a semantic recipe preimage refuses float/Decimal carriers only (one numeric form), and an integer outside the canonical MessagePack recipe domain is refused by that recipe. | `scripts/pm-dg6a-domain.py:45` (`current_integer_slot`), `:108` (`loads`), `:115` (`semantic_numbers`) | All sixteen suites; number corpus. |
| **S2 — producer route** (fixed, `874a37002a`) | `producer_digest` uses the shared `producer_semantic_digest`, `type_sensitive_paths` at `producer_sequence_id` and every payload integer field, after the EventRecord `current_integer(minimum=0)` admission of `producer_sequence_id`; it refuses only through `producer_route` (PD01–PD03). Byte-identical to the old JCS codec on every fixture record (asserted on each run). | `scripts/pm-alert-event-contracts-check.py:607` (`producer_observation`), `:630` (`producer_digest`), `:643` (`producer_cases`) | `producer_route` `PASS` 3/3; `semantic_digest_cases` unchanged. |
| **S2 — embedded operation/state schemas** (fixed, `874a37002a`) | The DG6A operation schemas (alert ×4, panel ×2, concern), the shared alert/rule state schemas and the concern record schema carried `maximum: 9007199254740991` on revisions, repeating the I-JSON safe range; the standalone payload schemas carry none. Under "bound only an actually owner-bounded field" those 37 maxima are removed (minimums stay), also from the ten byte-identical `Plans/storage_value_registry.json` rows and the const `concern_revision` of the concern payload. Current revisions above 2^53 and at the uint64 edge are accepted (new positives); the producer route still refuses beyond binary64 (PD03). | `Plans/{alert_event_contracts,panel_event_contracts,concern_created_contracts}/*.schema.json`; `Plans/storage_value_registry.json`; `Plans/event_payloads/concern/concern_created.schema.json` | `large_revision_*`, `large_host_revision_*` witnesses; registry rows asserted equal to the external files by each main. |
| **Stale number-boundary expectations** (fixed, `874a37002a`) | `pm-dg6a-domain-check.py` used an invented u64 default maximum and expected 2^53/2^53+1 refusals; it now expects exactly the slot's own bounds (no default cap) and the one-form semantic rule. Final-regression B1 drops the 2^53 and 2^53+1 spellings (valid at an uncapped slot; the corpus covers them). The known sweep-part-1 failure (six alert/panel selections at standalone `prior_revision` 2^64) is gone. | `scripts/pm-dg6a-domain-check.py` (`number field`, `semantic number rejection`/`admission`); `scripts/pm-dg6a-final-regression-check.py` (B1) | Domain-check `pass` for all seven alert/panel/concern families. |
| **Shared corpus through every complete checker** (`874a37002a`) | `scripts/pm-dg6a-number-corpus.py` writes every number-scope value of the shared corpus (81 values: raw spellings and exact integers, including a 5,000-digit token) as JSON text into a valid input of each of the sixteen families, parses it through the checker's own raw ingress and runs four complete routes: the payload integer slot, the checkpoint `through_sequence_id` (complete `checkpoint_errors`), the read-through cursor/frontier rows and the producer route. The expected outcome is composed from the shared helpers alone; a raise is a disagreement. | `scripts/pm-dg6a-number-corpus.py` | **5,184 route runs, 0 disagreements (1,264 accepted, 3,920 refused)** |
| **Number self-test** | `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | — | **Exit 0, `"status": "pass"`, **580 of 580** cases (304 negatives).** Credited exactly as reported. |
| **Owner text** (fixed, `88a9d3810d`, `56d7088be5`) | CV-680..686 no longer repeat "the I-JSON safe range -9007199254740991..9007199254740991": current numbers follow CV-1100 and SP-1100 beside the CV-317, CV-339, SP-278 and SP-286 profile owners (loads_current_json, current_integer within each field's own bounds, no lane-wide cap; retained originals keep their write-time recipe, selected by SP-1101; Storage sequences u64 per SP-1100). Float/Boolean/negative-zero/leading-zero refusals and the timestamp grammar are unchanged. SP-660..666 gain one sentence citing the same owners (SP-666 as its own paragraph, so its cited closing line stays intact). F3-700..714 state no number rule and are unchanged. | `Plans/Contracts_V0.md` (CV-680..686), `Plans/storage-plan.md` (SP-660..666) | Shards and index regenerated; only Contracts_V0, storage-plan and storage value registry outputs and the index changed; shard check pass. |

**Not used, by design:** `RetainedDispatcher` (S-N2, part 2B: SP-1101 selects the frozen CV-1101 date-time profile in the same recipe tuple, so its adoption crosses the ungated date-time scope, as DS15 found), `loads_exact` (no schema-directed `JsonNumber` caller), `qualified_jcs` outside the producer route (DG6A identity and request recipes are canonical MessagePack), `storage_value_bytes`/`decode_storage_value`/`full_value_commitment`/`verify_payload_bytes` (DG6A encodes no stored bytes beyond its own recipe and holds no payload packs). No lane serializer, cap or number grammar was added.

## Timestamp fields — interim only

This lane's own review of its timestamp fields is **interim only** (pm7-build, 2026-11-05 16:50Z); it is not a certification and changes nothing. DG6A enforces its own full-match RFC3339 grammar with a registered `date-time` checker (`scripts/pm-dg6a-domain.py:28` `instant`, `:91` `validator`), compares instants exactly (`instant_key`, `instant_le`) and checks named semantic timestamps in recipe preimages (`semantic_formats`). Part 2A and the number pass change no timestamp field or rule; the producer route keeps the same timestamp check as its first row (PD01).

## Part 2B items

Timestamp items and the retained dispatch that selects a date-time profile, each left exactly as it was:

- **S-FMT1 — CV-1101 date-time at every DG6A boundary.** `scripts/pm-dg6a-domain.py:28` (`instant`), `:91` (`validator`, registered `date-time`/`uuid` checkers), `:133` (`instant_key`), `:156` (`semantic_formats`); `scripts/pm-alert-event-contracts-check.py:607` (`producer_observation`, EventRecord `occurred_at_utc`), `:787` (`historical_observation`, Storage `observed_at_utc`/`persisted_at_utc` via `stored_instants_valid`); the `format: date-time` fields of `Plans/event_payloads/attention/*.schema.json`, `Plans/event_payloads/panel_*_v2.schema.json`, `Plans/event_payloads/concern/concern_created.schema.json` and the DG6A operation/checkpoint schemas; the timestamp sentence of CV-680..686. Adopt `datetime_validator` with the EventRecord profile, CV-253 `storage_utc_z` for Storage-assigned `observed_at_utc`/`persisted_at_utc`, and any stricter field-owner profile explicitly; malformed negatives and valid edge positives from the shared battery; rerun the guard tables with the format capability.
- **S-N2 — SP-1101 authenticated retained dispatch (it selects the frozen CV-1101 date-time profile in the same tuple).** `scripts/pm-alert-event-contracts-check.py:241` (`retained_retry_observation`, edition chosen from the alert/panel manifests by the original's event type), `:787` (`historical_observation`, edition chosen from original admission evidence), `scripts/pm-panel-event-contracts-check.py:199` (`historical_panel_page`, v1/v2 editions), `scripts/pm-concern-created-contracts-check.py:223`, `scripts/pm-card5-event-contracts-check.py` `history` stage (legacy edition map). Compose `RetainedDispatcher` with the authenticated original owner and the frozen recipes, so selection is authenticated rather than taken from supplied evidence; add retained positives written under an older number rule (for example a panel v1 original whose integer slot holds an integral float, if its recipe admitted one) and forged or downgraded-selector negatives.
- **F3-706..714 C12 wording.** Each still says "C12 remains PARTIAL pending the shared isolation/number-domain sweep"; after part 2B it should name only what is then open. Owner text quoted by the self-grade, so it moves with the next citation relocation.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the sweep part 1 self-grade; after is the self-grade at this head.

| Family | Before → after |
|---|---|
| `alert.acknowledged` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `alert.dismissed` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `alert.rule_muted` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `alert.snoozed` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `panel.redocked` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `panel.undocked` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `concern.created` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `bundle.note_created` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `bundle.note_status_changed` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `bundle.annotation_state_changed` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `concern.assigned` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `concern.evidence_linked` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `concern.promoted` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `concern.reopened` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `concern.resolved` | 9P / 2Q / 1A → 9P / 2Q / 1A |
| `concern.updated` | 9P / 2Q / 1A → 9P / 2Q / 1A |

**144 PASS / 32 PARTIAL / 16 ABSENT → the same totals.** No cell changes. The tool proof closes S1 for all sixteen families and the number pass closes S2, but C12 (positive/negative oracles) stays PARTIAL: S-FMT1 and S-N2 remain open, the timestamp review is interim only, and these cells have not been independently reviewed; I do not upgrade a self-grade on that basis. C7 (retention) stays PARTIAL (PENDING_RETENTION_DECISION); C1 membership stays ABSENT. Self-grade changes (`0380bc0c2b`): 194 citations relocated by line number only, each inside its own unit section; 20 re-pointed to renamed or retired code (`retained_retry_digest` → `retained_retry_observation`, 6; guard-check `duplicate_proofs`/`executed_cases` → `pm-dg6a-guard-tables.py` `run_generic_phase`/`collect_generic`, 14); `remaining_gaps` names part 2B. `--audit-grade-only`: pass, 16 families, 379 citations.

## Commands and evidence

Heavy checks ran one at a time on the VM's local disk, each started at 13.5 GiB or more available (the runner refuses to start below that and pauses below 10 GiB, resuming at 11). Commits: `5ce68412d9` (tool merge), `b789fd717b` (NUMRULE number-scope merge), `fdca07b70e`–`a94c77a6bd` (first-pass tables) with their report commits, `9ae2db3d40` (generated tables), `efd21e5a48` (witnesses, entailed tables), `874a37002a` (numbers), `88a9d3810d` (owner text, shards, index), `e1aa809286` (retired machinery), `56d7088be5` (SP-666 paragraph), `0ba256a612` (PK14), `0380bc0c2b` (self-grade), then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/sweep-p2a/` (SHA-256 of every file in `SHA256SUMS`; large files gzipped).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files, none edited |
| `git merge --no-ff a16f67c1ef` | conflicts in generated files only | `Plans/_shards/{contracts_v0,storage-plan}` and `Plans/.plan_index` regenerated (shard generate, index generate, shard check pass), never by hand |
| `python3 scripts/pm-dg6a-guard-tables.py --out <dir>` (long-job `dg6a-p2a-final`, at `0380bc0c2b`) | 1 | 98 tables: 89 `PASS`, 9 entailed tables `NOT_RUN` (no negative); 487/505 rows proved; 0 masked, 0 unrelated changes; lane matrix 0 problems |
| `python3 scripts/pm-dg6a-guard-tables.py --phase panel_command_keys --phase panel_command_keys_entailed` (after the PK14 move, before the final run) | 1 | `panel_command_keys` `PASS` 12/12; the entailed table `NOT_RUN` |
| `python3 scripts/pm-dg6a-table-generate.py scripts --check` | 0 | 89 generated tables, 465 rows (+9 hand-written); no stale or extra module |
| sixteen family checkers (`pm-alert-event-contracts-check.py --family F` ×4, `pm-panel-event-contracts-check.py --family F` ×2, `pm-concern-created-contracts-check.py`, `pm-card5-event-contracts-check.py --family F` ×9) | 0 each | `pass`: alert 522/525/526/539, panel 504/503, concern.created 639, Card 5 annotation 354, note_created 955, note_status_changed 962, assigned 989, evidence_linked 968, promoted 990, reopened 969, resolved 1015, updated 969 |
| `python3 scripts/pm-dg6a-guard-check.py` | 0 | fixture vectors: alert 224/224/223/232, panel 223/223, concern 253; `proof: none` |
| `python3 scripts/pm-dg6a-domain-check.py --family F` (7 families) | 0 each | `pass`; 8,909 / 9,035 / 9,218 / 9,760 / 11,095 / 11,084 / 11,762 observations; no guard-removal rows |
| `python3 scripts/pm-dg6a-final-regression-check.py --family F` (7 families) | 0 each | `pass`: 128/128/128/153 (alert), 166/166 (panel, rerun after `e8de3e0b52`), 128 (concern) |
| `python3 scripts/pm-dg6a-number-corpus.py --json ...` | 0 | 5,184 route runs over 81 values and 16 families, 0 disagreements (1,264 accepted, 3,920 refused) |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580 of 580 cases (304 negatives); date-time inventory `NOT_RUN_SEPARATE_SUITE` |
| `python3 scripts/pm-dg6a-final-regression-check.py --audit-grade-only` | 0 | `pass`, 16 families, 379 citations |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json`; `python3 scripts/pm-plan-index.py generate` (currentness edition SHA-256 tree `69e5e402…` matches the shared checkout) | 0 | only `Plans/_shards/{contracts_v0,storage-plan,storage_value_registry}` and the index changed (every registry shard embeds the source SHA-256) |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 99 documents, 3,190 shards |
| `python3 scripts/pm-plan-index.py validate` (live origin/main `47d9dc7655`) | 1 | top-level `fail`, 59 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers and 38 `plan_unit_removed_without_ledger_decision` for units added on main after this branch's base (`2989975e8f`), e.g. DL-470..472, F3-716..718, ACD-637..640, UCC-230..231, CV-369 (absent at `2a0ceaa355` too); none names a DG6A unit; the integration rebase owns them |

---

# Earlier reports — historical; the sweep part 2A and 2B numbers report above is current

# DG6A: sweep part 1 (fixture pass)

Branch `plans/ea-w2-gui-concerns-20261104`. **Fix commit:** `d3045f0ca5`. **Start:** text-pass head `5f61b7d259`. **Rebase:** none; the text pass did not abort its rebase, so this round stayed on base `2989975e8f`.

This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.

## Sweep part 1 (fixture pass): findings and responses

| # | Item | Result | Commit |
|---|---|---|---|
| 1 | B1, registered Storage schema checks | Fixed, awaiting review. Left as it is; its checkers rerun below. | `806ee0517c` (round 10) |
| 2 | B2, standalone timestamp probes | Fixed, awaiting review. Left as it is; its checkers rerun below. | `eac56c62de` (round 10) |
| 3 | `Plans/card5_event_contracts/manifest.json:4` named the old decision branch | **Fixed.** | `d3045f0ca5` |
| 4 | Cycle-9 note 4, index state | No lane edit. Its text-pass "resolved" no longer holds at today's `origin/main`; see "Index findings". | none |

### Item 3: stale decision source

- **Where:** `Plans/card5_event_contracts/manifest.json:4`.
- **Why it broke:** the manifest still read `"decision_branch": "plans/ea-cards2-answers-20261105"` after DL-437..443 landed. Nothing read the field, so nothing noticed.
- **Fix:** the key is now `"decision_source": "Plans/Decision_Log.md"`. No script read the old key.
- **Guard:** `decision_citation_errors`, `scripts/pm-card5-event-contracts-check.py:113`, called from `main` (`:430`) through `decision_citation_cases` (`:130`). Each of the nine Card 5 families now requires the landed source, no leftover branch key, exactly one `### DL-nnn:` entry for its decision, and its exact option-A text in that entry's `A (recommended)` line.
- **Negatives:** 7 per family plus 1 control, all in the normal family suite: stale branch source, non-string source, old key kept, unknown decision, foreign decision, changed option text, non-string option text.
- **Verify:** `python3 scripts/pm-card5-event-contracts-check.py --family concern.resolved`, or the removal table below.

**Guard removal (each predicate alone, complete process, all nine families):** controls 9 x 0. Every row 9 x 1. Evidence: `drafts/DG6A/sweep-p1/fixture-pass/citation-removal.json`.

| Predicate removed | First failure |
|---|---|
| source must be the landed log | `stale_branch_source` accepted |
| old branch key refused | `old_branch_key_kept` accepted |
| exactly one decision entry | `unknown_decision` raises `ValueError` |
| option text in that entry | `foreign_decision` accepted |
| option text exact type | `option_text_not_string` raises `TypeError` |

The source test is exact string equality, so `source_not_string` needs no separate type predicate. This is a witness for this guard only, not a whole-lane check-11 claim; that stays S1.

**Case counts:** each of the nine families gains 8 observations. `bundle.annotation_state_changed` 345, `bundle.note_created` 954, `bundle.note_status_changed` 961, `concern.assigned` 988, `concern.evidence_linked` 967, `concern.promoted` 989, `concern.reopened` 968, `concern.resolved` 1014, `concern.updated` 968. Complete-family total 11,598 to 11,670.

### Checks (serial, at `d3045f0ca5`)

| Command (under `scripts/`) | Exit |
|---|---|
| `pm-alert-event-contracts-check.py --family`, 4 families | 4 x 0 |
| `pm-panel-event-contracts-check.py --family`, 2 families | 2 x 0 |
| `pm-concern-created-contracts-check.py --family concern.created` | 0 |
| `pm-card5-event-contracts-check.py --family`, 9 families | 9 x 0 |
| `pm-dg6a-domain-check.py --family`, 7 families | `concern.created` 0; six alert and panel families 1, the known S2 assertion at `pm-dg6a-domain-check.py:101` (`prior_revision` or `prior_host_revision` 18446744073709551616). Part 2, unchanged. |
| `pm-dg6a-guard-check.py --family`, 7 families | 7 x 0 |
| `pm-dg6a-final-regression-check.py --family`, 7 families | 7 x 0 |
| `pm-dg6a-final-regression-check.py --audit-grade-only` | 0 |
| `pm-storage-profile-check.py` | 1, on this head and on `origin/main` `6861d332de`. The two outputs differ only in `families` (377 vs 344) and `profiles` (336 vs 303); every error line matches. Not lane-caused. |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 |
| `pm-plan-index.py generate` | 0; only four `generated_at_utc` clock lines change, so nothing derived is committed |
| `pm-plan-index.py validate` | **1**, top-level `fail`, 24 findings |

### Index findings

All 24 are **new here and not on `origin/main`**; `origin/main` `6861d332de` validates with exit 0, no findings.

- **Where:** 3 x `plan_unit_removed_without_ledger_decision` (DL-337, DL-338, DL-339), and 21 x `plan_unit_removal_ledger_invalid` (legacy ledger records, read only when a removal is detected).
- **Why:** `pm-plan-index.py` compares against `origin/main`, which gained those three units after this lane's base. This lane removes nothing.
- **Check:** the same validation with the baseline set in memory to the merge base `2989975e8f` exits 0, no findings. No source or index was edited for it.
- **Fix:** the next rebase onto `origin/main` clears them.

### Grades and other records

Family grades are carried unchanged: all sixteen families 9 PASS / 2 PARTIAL / 1 ABSENT. C1 membership ABSENT, C7 retention PARTIAL, C12 PARTIAL pending the shared tools. Native NOT_RUN. `DG6A.self-grade.json` is unchanged; its quotes still resolve (`--audit-grade-only` exits 0).

Part 2 items 1-4 below are unchanged. No Decision Log entry, registry append, admission, seal, `Spec_Lock`, `.evidence`, `auto_decisions`, `.gitignore` or frozen-validator edit. No pm-mail or subagent.

---

# DG6A — Sweep part 1 (text pass)

Branch `plans/ea-w2-gui-concerns-20261104`; lane input `5c7b434364d88fe44cffa60185237ad6f7298101`; rebased onto `origin/main` `2989975e8f8a4a1e49235e8ae2095b3df7ea0321`. Technical head `1a3c3be654` (citations `72326566ea`; self-grade relocation `1a3c3be654`); this report commit is self-inclusive. Text pass only: rebase, landed citations, deck confirmation, checker runs, regeneration. No checker, fixture, schema or proof edit; no Decision Log entry, admission, registry append or governance artifact.

Rebased commit mapping for round 10: B1 `d065f3c664` -> `806ee0517c`; B2 `e635cb861f` -> `eac56c62de`; round-10 report `5c7b434364` -> `7fb1ec33ec`. **B1 and B2 remain fixed, awaiting review** (fixed in round 10, not yet re-reviewed).

This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.

## Sweep part 1 (text pass): findings and responses

| Item | Change (commit) | Where / how to verify |
|---|---|---|
| Rebase onto `origin/main` | 35 lane commits replayed; zero non-derived conflicts | Every unmerged path during the rebase was under `Plans/_shards/**` or `Plans/.plan_index/**` (942+ unmerged entries at the first stop alone). They were resolved only by wholesale side-taking to let the replay proceed, then rewritten by full regeneration at the head (`72326566ea`); no shard or index file was hand-merged. Verify: `git log --oneline origin/main..HEAD` shows the 35 replayed commits; `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` exits 0 (status pass, 99 source documents). |
| Landed citation — owner text (9 sites) | `72326566ea` | `Plans/FinalGUISpec.md:50683`, `:50751`, `:50819`, `:50881`, `:50949`, `:51017`, `:51085`, `:51153`, `:51221`: "Pending Decision Log companion: plans/ea-cards2-answers-20261105; no Decision Log entry is authored here." -> "Decision Log companion landed as DL-437..443 in Plans/Decision_Log.md on main (batch 1); no Decision Log entry is authored here." Only the citation words changed; every lineage pin, SHA and the deck SHA-256 are untouched. Verify: `grep -c "cards2-answers" Plans/FinalGUISpec.md` -> 0. |
| Landed citation — lane report | `72326566ea` | `reports/event-authority-20261104/DG6A.md:121` at that commit (round-9 historical section; shifted down by this prepended section at the final head): "being written on `plans/ea-cards2-answers-20261105`" -> "since landed in `Plans/Decision_Log.md` on `main` (batch 1)". Verify: `git grep -n "cards2-answers" 72326566ea -- reports/event-authority-20261104/DG6A.md` -> no match; at the final head the string appears only in this sweep-p1 section's before/after quotes. |
| Landed citation — self-grade | `72326566ea` | `reports/event-authority-20261104/DG6A.self-grade.json`: 9 family notes ("... on pending companion branch plans/ea-cards2-answers-20261105." -> "... , landed in Plans/Decision_Log.md (batch 1).") and 9 `"decision_log_companion_branch"` values -> `"Plans/Decision_Log.md (landed, batch 1)"`. JSON parses; 0 remaining `cards2-answers` occurrences. |
| Self-grade citation lines after the rebase | `1a3c3be654` | The rebase moved cited owner text: the A5 grade/citation audit inside `pm-dg6a-final-regression-check.py` failed first (`Plans/storage-plan.md:29487` quote no longer on that line). All **379** structured evidence refs were re-checked byte-for-byte against the rebased owner text: 106 resolve unchanged, **273 relocated** to their current lines, **0 missing, 0 ambiguous**; only `line_start`/`line_end` changed. Verify: `python3 scripts/pm-dg6a-final-regression-check.py --audit-grade-only` exits 0. |
| Deck confirmation — E-CARDS-2 5.a..5.g = DL-437..443 | no change needed | Each landed Decision Log option A text is byte-identical to the owner unit's embedded card text (see table below). All nine units confirmed; nothing was written or altered. |
| Regeneration | `72326566ea` | `pm-shard-plans.py --generate` (exit 0, status pass, 99 docs) then `pm-plan-index.py generate` (exit 0, 7522 plan units) then `pm-shard-plans.py --check` (exit 0). Currentness edition copied into `Plans/.audits/` and `diff -r` clean before generating. Regenerated shard changes are confined to the six owner documents this branch edits (`finalguispec`, `storage_value_registry`, `storage-plan`, `contracts_v0`, `automated_testing_system`, `orchestrator_page`) plus the four `.plan_index` JSON files; no other document's shards changed. |

### Deck items 5.a..5.g confirmed byte for byte

| Item | Landed entry (`Plans/Decision_Log.md`) | Owner text (`Plans/FinalGUISpec.md`) | Result |
|---|---|---|---|
| 5.a / DL-437 | `:5291` (option A) | `:50685` (F3-706 bundle.note_created), `:50753` (F3-707 bundle.note_status_changed), `:50821` (F3-708 bundle.annotation_state_changed) | byte-identical ×3 |
| 5.b / DL-438 | `:5315` | `:50883` (F3-709 concern.assigned) | byte-identical |
| 5.c / DL-439 | `:5339` | `:50951` (F3-710 concern.evidence_linked) | byte-identical |
| 5.d / DL-440 | `:5363` | `:51019` (F3-711 concern.promoted) | byte-identical |
| 5.e / DL-441 | `:5387` | `:51087` (F3-712 concern.reopened) | byte-identical |
| 5.f / DL-442 | `:5411` | `:51155` (F3-713 concern.resolved) | byte-identical |
| 5.g / DL-443 | `:5435` | `:51223` (F3-714 concern.updated) | byte-identical |

Jared's verbatim "i approve all of it", the fast-reply rule selecting A, and the deck SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30` are unchanged in the report and owner units.

### Lane checker runs (serial, one at a time)

| Command (all under `scripts/`) | Exit |
|---|---|
| `pm-alert-event-contracts-check.py --family alert.acknowledged` / `alert.dismissed` / `alert.rule_muted` / `alert.snoozed` | 0 / 0 / 0 / 0 |
| `pm-panel-event-contracts-check.py --family panel.redocked` / `panel.undocked` | 0 / 0 |
| `pm-concern-created-contracts-check.py --family concern.created` | 0 (622 cases, status pass) |
| `pm-card5-event-contracts-check.py --family` each of the nine manifest families | 0 ×9 |
| `pm-dg6a-domain-check.py --family` seven old families | `concern.created` 0; six alert/panel selections 1 — the known S2 stale expectation, unchanged from cycle 9: assertion `('…', 'number field', {'schema': 'Plans/event_payloads/attention/alert_acknowledged.schema.json', 'field': ('properties', 'prior_revision'), 'value': '18446744073709551616'})` at `pm-dg6a-domain-check.py:101` via `:142`. Listed, not fixed (number handling is part 2). |
| `pm-dg6a-guard-check.py --family` seven old families | 0 ×7 (the nine navigation proof rows inside it remain the S1 part-2 item) |
| `pm-dg6a-final-regression-check.py --family` seven old families | 0 ×7 (after the self-grade line relocation; includes the A5 unmodified grade/citation/hold audit, now exit 0). First run failed the A5 audit on stale lines; five runs paused on the runner's under-6-GiB gate and were rerun clean once memory recovered. |
| `pm-storage-profile-check.py` | 1 on this head and 1 on a clean `origin/main` worktree with the identical 41-error set (byte-compared: 41 common, 0 branch-only, 0 main-only) — pre-existing, not lane-caused. |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 |
| `pm-plan-index.py generate` / `validate` | 0 / **0 (status pass, zero failures)** |

One operator error recorded for honesty: a `pm-card5-event-contracts-check.py --family concern.created` invocation exits 1 (`StopIteration`) because `concern.created` is not a card5 manifest family; the nine manifest families all pass, and `concern.created` passes under its own checker.

### Index findings: new or also on main

`pm-plan-index.py validate` exits **0 / status pass / zero failures** at this head, and also **0 / pass** at a clean `origin/main` worktree (`2989975e8f`, same copied currentness edition). There are no index findings to classify. The pre-rebase branch's 22-23 known failures (21 legacy ledger-shape rows, the DL-302 comparison, PLS-025) do not exist at this head or on current main.

### Family grades

Carried unchanged from the last review (cycle 9 independent re-grade; round 10 recorded B1/B2 repairs without re-grading): all sixteen families **9 PASS / 2 PARTIAL / 1 ABSENT** — C1 membership ABSENT, C7 retention PARTIAL / `PENDING_RETENTION_DECISION`, C12 PARTIAL pending the shared guard-tool and number-rule adoption. Native execution NOT_RUN. This text pass does not re-grade any family.

## For an Opus or Sol worker

1. **B1 (cycle-9 blocking) — fixed in round 10, awaiting review.** Old `d065f3c664`, rebased `806ee0517c`. The checker now loads each of the seventeen declared Storage registry rows, validates their metaschemas, eagerly closes every reference including unused definitions, and requires type-aware content equality with the tested companions: `scripts/pm-card5-event-contracts-check.py:50` and `:388`. The review asked for registered-schema drift/unvisited-ref negatives with positive controls; round 10 added 136 CLI negatives and nine controls. Needs the cycle-10 re-review.
2. **B2 (cycle-9 blocking) — fixed in round 10, awaiting review.** Old `e635cb861f`, rebased `eac56c62de`. Standalone-payload timestamp probes with reconciled command/record/commitment copies: `scripts/pm-dg6a-final-regression-check.py:66`, `:140`; `scripts/pm-concern-created-contracts-check.py:163`; additive `payload_cases` in `Plans/concern_created_contracts/concern_created.fixtures.json`. The review asked for a genuine standalone payload case or reconciled copies; round 10 did both (25 malformed timestamp negatives). Needs the cycle-10 re-review.
3. **`Plans/card5_event_contracts/manifest.json:4`** still reads `"decision_branch": "plans/ea-cards2-answers-20261105"`. It is a checker-read data file (loaded by `scripts/pm-card5-event-contracts-check.py:380`), so this text pass leaves it; the value is unused by the checker. Update it to the landed `Plans/Decision_Log.md` citation when data edits are authorized.
4. **Cycle-9 note 4 (derived/integration state) — resolved by this rebase, no action left.** Index validate now passes at this head and at clean main (see above); the old 22-23 failure set no longer exists.

## Part 2 items

1. **S1 — shared proof machinery and guard tables.** `scripts/pm-dg6a-guard-check.py:389`, `:407-413`: the nine `history_shape` rows still pop the early-return rejection and bypass remaining reader checks (cycle-8/9 finding; bytes unchanged this pass). Adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105` across all sixteen families, inventory runtime/schema/retained-retry/Card 5 predicates, cut compound rules per field/predicate, require same-field/same-predicate site-by-site duplicate proofs, and restructure the lane checker into guard tables once the tool passes.
2. **S2 — shared number rule.** Adopt CV-1100/SP-1100/SP-1101 for `scripts/pm-dg6a-domain.py:66-69`, CV-680..686 wording, the embedded operation/state schemas, the F3-706..714 codecs and authenticated historical dispatch. No lane-local cap, serializer, physical-float normalization, signed-zero erasure or Storage-uint64 2^53 cap.
3. **Stale number-boundary expectations (S2, reproduced this pass).** `scripts/pm-dg6a-domain-check.py:140-142` (six alert/panel selections exit 1 at standalone `prior_revision` 18446744073709551616; assertion at `:101`) and the range/physical expectations in `scripts/pm-dg6a-final-regression-check.py:144-148`. Align with the shared owner domains during S2 adoption; do not restore lowered schema maxima.
4. **Date-time gate.** The existing enforced date-time/UUID grammar is unchanged; no new format rule. This lane's own review of its timestamp fields is interim only until the shared date-time gate passes.

Initial resources: 102 GB root free / 8 GiB available RAM; all heavy commands serial; the final-regression runs paused once below the 6-GiB gate and resumed at 8 GiB. Sparse worktree `/home/sittingmongoose/pm-worktrees/DG6A-p1t`; the clean-main comparison worktree was removed after the validate/profile comparison. No pm-mail, no subagents, no `main` push, no `rm -rf`.

# DG6A — review round 10

Branch `plans/ea-w2-gui-concerns-20261104`; reviewed input `22fc9d0ef738e700efd16ed185dea91d6e058c83`. **B1 fixed in `d065f3c664cfee2627a116ad8c4e99f11b4a24b5`; B2 fixed in `e635cb861fe7470e593858b358bfde5a54b40245`.** The final report/grade commit is self-inclusive. Complete family reruns consume technical head `e635cb861fe7470e593858b358bfde5a54b40245`. Exact source hashes are in `fix10/consumed-sources.json`.

All sixteen are **self-graded PASS AS PREPARED**, versus six passing preparations in cycle 9; independent re-review remains pending. Every twelve-cell grade remains **9 PASS / 2 PARTIAL / 1 ABSENT**. Admission is ABSENT; retention is PARTIAL / PENDING_RETENTION_DECISION; C12 is PARTIAL for shared guard-tool/number-rule adoption; native execution is NOT_RUN. No new Jared choice is required. Card 5's DL-437..443 answers and round 8's retained-original repair are unchanged.

## Review round 10: findings and responses

| Finding | Where / why / fix | Verification |
|---|---|---|
| **B1 — fixed (`d065f3c664cfee2627a116ad8c4e99f11b4a24b5`)** | `scripts/pm-card5-event-contracts-check.py:50` and `:388`. The nine new family entry points validated companion files but skipped the seventeen authoritative Storage copies. Load each exact declared row, require one row and its exact companion ref/schema ID, validate its metaschema, eagerly resolve every ref including unused definitions, and require exact type-aware schema content equality. Then run operation/checkpoint validators on those registered copies. Generic annotation remains checkpoint-only. | All seventeen rows receive separate unused-dangling-ref and open-schema mutations: the review's **34 counterexamples now refuse**. **136 actual CLI negatives** (eight per row) refuse with their precise single diagnostic, and nine unmodified CLI controls pass. The complete normal family suites also execute the 136 named negatives plus nine positive registry controls. |
| **B2 — fixed (`e635cb861fe7470e593858b358bfde5a54b40245`)** | `scripts/pm-dg6a-final-regression-check.py:66`, `:140`; `scripts/pm-concern-created-contracts-check.py:163`; additive `payload_cases` in `Plans/concern_created_contracts/concern_created.fixtures.json`. The old timestamp mutation changed an operation payload but left its frozen command and digest stale. Use the review's standalone-payload option for first-validator probes in every kind. Concern now has a genuine valid standalone payload; its command, canonical record and request commitment remain exactly unchanged. The same audit covers concern's numeric-probe branch; numeric policy remains S2. | **25 malformed timestamp CLI negatives** refuse (exit 1), with an unmodified full-checker positive (exit 0). Every input changes exactly one standalone leaf, fails only `format:ts`, passes with only that exact timestamp predicate weakened, and refuses after restoration. `ts='false'` additionally passes the **entire 622-case concern checker** under that same exact predicate cut. Six permitted calendar/case/fraction/offset values pass. No format/product guard is weakened in shipped code. |
| **S1 — sweep, unchanged** | `scripts/pm-dg6a-guard-check.py` retains the cycle-8 early-return/navigation proof defects; its bytes are unchanged. Adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105` across all sixteen. Inventory all runtime, schema, retained-retry and Card 5 predicates. Cut compound rules per field/predicate. Duplicates require the **same field and same predicate**, site-by-site single removals and all-site removal; a shared refusal/enforcement site is insufficient. | No old 509-row count or new complete lane proof is claimed. The focused B2 timestamp cuts prove only those repaired standalone cases. New Storage guard/negative names are listed below for shared-tool adoption. C12 stays PARTIAL for every family. |
| **S2 — sweep, unchanged** | Adopt CV-1100/SP-1100/SP-1101 for `pm-dg6a-domain.py:66–69`, CV-680..686, existing embedded operation/state schemas, F3-706..714 codecs and authenticated historical dispatch. Align `pm-dg6a-domain-check.py:140–142` and the final-regression numeric boundary expectations with the shared owner domains. | No new cap, serializer, physical-float normalization, signed-zero erasure or Storage-uint64 2^53 cap. Round 8's eighteen earlier-recipe originals and exact retries remain exercised by the unchanged alert/panel suites. The stale six alert/panel domain-driver failures are carried as sweep items, not reported as passing reruns. |
| **Formats — retained** | Existing date-time/UUID grammars and old historical schema editions are unchanged. | Invalid timestamp forms and valid edge controls rerun for B2; no new format-domain rule or weaker historical recipe is introduced. |
| **Derived/integration state — recorded** | No owner Markdown/schema/registry/index/shard changes. Read-only index validation exits 1 / top-level fail with **23 failures**: 21 legacy ledger-shape rows, the older branch's DL-302 comparison, and PLS-025 now present only on newer `origin/main` (`57c28f706e10dd9f7c6b13ed5e962de74e9a6ea5`). | Both owner files and every generated input are unchanged from the reviewed head. `index-failure-context.json` proves the two newer-main units are absent at the pinned branch and present on fetched main. Shard check passes. No generation, currentness restamping, governance reseal, migration snapshot or baseline refresh is performed. |

## Family grades before and after

P/p/A = PASS/PARTIAL/ABSENT; every row's criteria statuses are unchanged from cycle 9. B1/B2 are additional local oracle blockers that are now repaired; S1/S2 remain explicit preparation limits. All 192 cells were re-graded against current source/citations. The seven older and nine Card 5 families retain their own separate contracts and oracles.

| Family | Cycle-9 preparation verdict | Before P/p/A | After P/p/A | Round-10 self-verdict | Cases / exit |
|---|---|---|---|---|---|
| `alert.acknowledged` | PASS AS PREPARED | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 460 / 0 |
| `alert.dismissed` | PASS AS PREPARED | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 463 / 0 |
| `alert.rule_muted` | PASS AS PREPARED | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 463 / 0 |
| `alert.snoozed` | PASS AS PREPARED | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 476 / 0 |
| `bundle.annotation_state_changed` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 337 / 0 |
| `bundle.note_created` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 946 / 0 |
| `bundle.note_status_changed` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 953 / 0 |
| `concern.assigned` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 980 / 0 |
| `concern.created` | NOT_READY — B2 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 622 / 0 |
| `concern.evidence_linked` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 959 / 0 |
| `concern.promoted` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 981 / 0 |
| `concern.reopened` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 960 / 0 |
| `concern.resolved` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 1006 / 0 |
| `concern.updated` | NOT_READY — B1 | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 960 / 0 |
| `panel.redocked` | PASS AS PREPARED | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 516 / 0 |
| `panel.undocked` | PASS AS PREPARED | 9/2/1 | 9/2/1 | PASS AS PREPARED; S1/S2 | 516 / 0 |

**11,598 complete-family static cases**, all sixteen exact-family selections exit 0, one family at a time. Relative to round 9's 11,452, the ordinary suites add **145 registered-schema observations** (136 negatives and nine controls) and **one concern standalone positive**. The separate actual registry-CLI and timestamp-isolation/CLI campaigns are not added to that total. Minimum recorded family-start available memory: 13 GiB.

## New guards and one-defect inputs

Each row applies separately to every declared stored schema (seventeen rows). The normal family checker calls `storage_schema_cases`; `registry-cli.json` runs the same eight independent mutations through the complete entry point, with exact refusal expectations. These names are an inventory for the shared proof tool, **not a claim of complete guard isolation**.

| Input invariant | Negative name / mutation | Expected refusal |
|---|---|---|
| Exactly one declared row | `missing_row`: remove only that row; `duplicate_row`: add only a copy of that row | `storage_row_count:<family_id>` |
| Companion path | `companion_ref`: change only `value_schema_ref` | `storage_companion_ref:<family_id>` |
| Registered schema identity | `schema_id`: change only `value_schema_id` | `storage_schema_id:<family_id>` |
| Schema is valid JSON Schema | `invalid_schema`: change only embedded `type` to 0 | `storage_schema_invalid:<family_id>` |
| Every reference resolves | `unvisited_ref`: add one unused definition pointing at a missing local definition | `storage_schema_reference:<family_id>` |
| Registered content equals tested companion | `open_schema`: change only `additionalProperties` false -> true; `embedded_identity`: change only embedded `$id` | `storage_schema_drift:<family_id>` |

B2's negatives cover missing zone, wrong separators, invalid calendar/time/offset fields, LF/space suffixes, leap seconds and malformed fractions. They use a valid standalone payload rather than an incomplete canonical operation. All existing operation/digest/command/record joins remain active and all retained fixture sections remain identical. Number-range/spelling assertions remain explicitly delegated to S2.

## Standing checks and recurring defect classes

The complete family suites retain checks 1–10 for each exact family: current replay-only refusal (unconditional no-new-write refusal for generic history), CV-366 app keys or Project-only refusal, encoded Project partitions, complete stored/emitted byte limits and SP-337 routing, trailing-LF refusal, caller-only retry semantics, checkpoint/original Storage identity, failure-exit refusal, eager schema closure, and retained-history validity. B1 closes the nine families' registered-schema gap. Check 11 remains **PENDING_SHARED_TOOL** for all sixteen; only the focused repaired B2 witness is credited here.

| Recurring class | Round-10 evidence / limit |
|---|---|
| 1 Forgery / contradictory facts | Existing recomputed identity/request digests and command/snapshot/source mutations rerun in each complete family suite. Registered schema identity/content forgeries additionally refuse in all seventeen rows. |
| 2 Storage-assigned metadata | Existing independent original-event, receipt, source-selection and full-result mutation cases rerun; caller data does not become Storage authority. |
| 3 Historical direction | Existing retained current/v1/replay-only and generic history positives survive live changes; forged/foreign/withdrawn controls refuse. Round-8 retained-original sources/fixtures are unchanged. |
| 4 Multiple representations | Existing exact-type nested joins, digest representation and authority-type cases rerun. No new lane-local cross-type comparison is introduced. |
| 5 Unvisited references | All seventeen registered copies now reject the review's unused dangling-ref mutation through their exact family CLI; companion closure remains active. |
| 6 Partial byte limits | Existing complete operation/checkpoint/response, boundary and 1000-match traversal cases rerun. No byte-size or SP-337 contract changes. |
| 7 Custody paths | Existing prepared/committed/settled, retry/recovery and historical joins rerun; no new custody path is authored. |
| 8 Masked negatives | B2 is repaired and directly isolated; all operation copies stay unchanged. General compound/navigation/proof machinery remains S1. |
| 9 Overgrading | All C12 cells stay PARTIAL; membership stays ABSENT, exact retention pending, native NOT_RUN. Local blocker repair does not claim a completed shared proof. |
| 10 / 10a Numbers and old recipes | Shared-rule adoption and stale boundary expectations remain S2; no numeric rule is added. Old admitted-original editions and recipe dispatch are preserved exactly. |
| 11 Confused types | Existing string Boolean/number, null/array/object and source/role shape negatives rerun. New schema metadata/content joins use exact recursive types. |
| 12 Formats | Twenty-five malformed standalone timestamp inputs refuse, six valid edge controls pass, and the exact predicate cut exposes only the named standalone defect. |

## Verification, unchanged scope and resources

| Check | Exit / result |
|---|---|
| Sixteen complete family selections at `e635cb861fe7470e593858b358bfde5a54b40245` | 0 each; **11,598** cases. |
| Registered-schema full CLI campaign | Nine positive controls exit 0; **136 negatives exit 1**, every exact expected refusal. Includes all 34 review counterexamples. |
| Concern timestamp full CLI campaign | Baseline exit 0; **25 malformed inputs exit 1**. Executed before the B2 commit with the same source bytes committed in `e635cb861fe7470e593858b358bfde5a54b40245`; result metadata retains its actual then-HEAD `d065f3c664cfee2627a116ad8c4e99f11b4a24b5`. |
| Concern first-validator isolation / edge controls | 0; 25 exact one-leaf refusals/own-predicate flips/restored refusals; six valid values; whole-checker `ts='false'` cut passes 622 cases. |
| Grade/citation audit | 0 / pass; 379 exact citations; all sixteen intended grade shapes. |
| Scope / retained-source audit | 0 / pass; every pre-existing concern fixture key unchanged, all owner docs/registries/Card 5 choices/old-recipe code and other fixtures unchanged; no new PlanUnit ID. |
| Shard check | 0 / pass. No regeneration required because no owner Markdown changed. |
| Index validation | 1 / top-level fail; 23 failures with the unchanged-input/newer-main context above. |
| `git diff --check` | 0 after inputs restored. |

Initial root free disk / available RAM: **107 GB / 10 GiB**, above the prescribed worktree gates. Sparse detached worktree: `/home/sittingmongoose/pm-worktrees/DG6A-fix10`. All family jobs and mutation campaigns run serially. No under-6-GiB pause was needed; the reproduction driver pauses below 6 and rechecks every two minutes until at least 7. Two read-only Git scans initially overlapped a registry replacement and exited 135 (mmap/SIGBUS); the file was restored byte-for-byte and the scans passed when serialized after mutations. No repository/index repair was required.

All six changed paths are lane-local: three scripts, the additive concern fixture probe, this report and its self-grade. No event registry/admission/Decision Log/governance/frozen-validator/ignore edit, main push, pm-mail, subagent, browser or server. No standard aggregate landing gates or native execution are claimed. Reports/self-grade and retained reproduction evidence are copied to `drafts/DG6A/`; the worktree is removed with the literal prescribed `git worktree remove --force` path after push.

**IDs retained:** SP-660..666, CV-680..686, ATS-330..334, F3-700..714 (34 existing definitions). **New IDs: none.** DL-437..443 are decision references only. Shared CV-1100/SP-1100/SP-1101 are sweep references. Remaining items: admission by integration; exact retention binding; shared S1/S2 adoption; actual note mapping inventory proof/owner approval; independent re-review; native NOT_RUN.

## Round-10 evidence

All paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/`; SHA-256 pins the complete artifact, including exact commands/results and restoration checks. `SHA256SUMS.json` additionally covers the exported report/grade and reproduction scripts.

| Artifact | SHA-256 |
|---|---|
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/family-commands.json` | `cce9d2e90376c1e3016f8100bb77639e6817bcf20689eaabd80c8c34c58ef463` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/registry-cli.json` | `f2eced3eb5035bf4eb1f1e2fa8400ecc6cd6e74c0c566db49b2f3a5b66cb2925` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/concern_created.format.json` | `4fb00dfa9a2a82f1c87b4d51b490d6890d4778ed8bbb3aa69d68ea3fef0aba5b` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/concern-probe-isolation.json` | `b1282d1d171b7942288648446b631dab1341d40c4bea5cfe8d54cc9a6772bc43` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/repository-checks.json` | `c9bf6ce026dda0db46ca33b86318ca9f086d36bfdf04a24e56096a02e3b3c268` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/scope-and-regrades.json` | `a147330315d83d0c888ea41ff56119ab76684d3c206f9b9470012ddc7940aba6` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/consumed-sources.json` | `6258959d1f7b330cbc9519297f67443cc939fbb0561427b835231376a9af59c3` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/index-failure-context.json` | `bdbdfef872de7010ceddc30de70c8e8bfb61673b1292630f6feae5ba7e61c3a3` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/currentness-copy.json` | `daf80cdc1395935c791eed463d54ff4d0405f90ce97f39f12e10fbb0a547f8ac` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/run-checks.py` | `f8b98d5db67e8970ada6cc2fb3b84e5709f0a6c213b06115a723bfa2054be90a` |
| `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix10/scope-audit.py` | `57896119be20d2af7847d251525598e8020b4b63e19410838856537d132fb033` |

## Earlier rounds — preserved historical record

# DG6A — Round 9: deck-2 Card 5 applied

Branch `plans/ea-w2-gui-concerns-20261104`; input `4b8147737ca4674db837e95bb3cbee548e8be7e0`. This is application of Jared’s deck-2 answers, not a review-fix round. The final report commit is self-inclusive; `r9/consumed-source-hashes.json` pins the verified source bytes.

Jared’s verbatim answer is **“i approve all of it”**. The as-presented deck’s fast-reply rule selects option A on every item. Card 5’s exact options and definitions are copied into each new owner unit and `Plans/card5_event_contracts/manifest.json`; they are the card’s wording, not quotations attributed to Jared. DL-437 (5.a) and DL-438..443 (5.b..5.g) are cited as companion entries, since landed in `Plans/Decision_Log.md` on `main` (batch 1); this lane authors no Decision Log entry. The deck SHA-256 is `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`.

All nine holds below are superseded by this section. Older stopped questions/recommendations remain source history only. **No family remains stopped for a new Jared question.** The separate creator proposal remains unapplied and `concern.created` is unchanged.

## Outcomes and twelve-criterion self-grade

A = ABSENT; P = PASS; p = PARTIAL. C1 membership, C2 owner, C3 producer, C4 closed payload, C5 scope/identity, C6 replay/idempotency, C7 retention, C8 custody/redaction, C9 transitions, C10 consumer/checkpoint, C11 compatibility/withdrawal, C12 positive/negative oracles. Every row is **9 PASS / 2 PARTIAL / 1 ABSENT**: C1 admission absent, C7 exact event/value retention pending, C12 shared guard-isolation/number-domain sweep pending. Native execution is NOT_RUN. All seven existing family grade records are structurally identical to round 8.

| Family | Outcome | Owner / answer | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | Cases / exit |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `alert.acknowledged` | prepared, unchanged | pre-round contract | A | P | P | P | P | P | p | P | P | P | P | p | 460 / 0 |
| `alert.dismissed` | prepared, unchanged | pre-round contract | A | P | P | P | P | P | p | P | P | P | P | p | 463 / 0 |
| `alert.rule_muted` | prepared, unchanged | pre-round contract | A | P | P | P | P | P | p | P | P | P | P | p | 463 / 0 |
| `alert.snoozed` | prepared, unchanged | pre-round contract | A | P | P | P | P | P | p | P | P | P | P | p | 476 / 0 |
| `bundle.annotation_state_changed` | historical-only, prepared | F3-708 / DL-437 | A | P | P | P | P | P | p | P | P | P | P | p | 328 / 0 |
| `bundle.note_created` | prepared | F3-706 / DL-437 | A | P | P | P | P | P | p | P | P | P | P | p | 929 / 0 |
| `bundle.note_status_changed` | prepared | F3-707 / DL-437 | A | P | P | P | P | P | p | P | P | P | P | p | 936 / 0 |
| `concern.assigned` | prepared | F3-709 / DL-438 | A | P | P | P | P | P | p | P | P | P | P | p | 963 / 0 |
| `concern.created` | prepared, unchanged | pre-round contract | A | P | P | P | P | P | p | P | P | P | P | p | 621 / 0 |
| `concern.evidence_linked` | prepared | F3-710 / DL-439 | A | P | P | P | P | P | p | P | P | P | P | p | 942 / 0 |
| `concern.promoted` | prepared | F3-711 / DL-440 | A | P | P | P | P | P | p | P | P | P | P | p | 964 / 0 |
| `concern.reopened` | prepared | F3-712 / DL-441 | A | P | P | P | P | P | p | P | P | P | P | p | 943 / 0 |
| `concern.resolved` | prepared | F3-713 / DL-442 | A | P | P | P | P | P | p | P | P | P | P | p | 989 / 0 |
| `concern.updated` | prepared | F3-714 / DL-443 | A | P | P | P | P | P | p | P | P | P | P | p | 943 / 0 |
| `panel.redocked` | prepared, unchanged | pre-round contract | A | P | P | P | P | P | p | P | P | P | P | p | 516 / 0 |
| `panel.undocked` | prepared, unchanged | pre-round contract | A | P | P | P | P | P | p | P | P | P | P | p | 516 / 0 |

All sixteen complete family entry points ran **one family at a time**, all exit 0, **11,452 static observations/cases** in total. New family totals include standalone schema-field/domain cases and five complete-response byte-boundary cases per family; these are not native executions or a guard-removal proof. Exact commands, UTC starts, available-memory readings and exits are in `r9/family-commands.json`. The minimum available RAM recorded before a family is 7 GiB; no under-6-GiB pause was required in the final run. Initial disk/RAM were 54 GB / 20 GiB, satisfying the 50-GB/6-GiB worktree gate.

## Exact decisions applied

- **5.a / F3-706..708 / DL-437:** one creation event and one event per later real status change. No generic co-emission or new generic writes. Preserve all five statuses and original note/provenance identity. Generic originals use authenticated original-event/view/snapshot joins, owner-proved and approved creation/status mapping, and a read-only inspection quarantine for ambiguous originals. No synthesized split append, guessed alias or history rewrite. Actual inventory proof and owner approval remain a required release gate (NOT_RUN), not an unanswered product choice or a falsely claimed completed migration.
- **5.b / F3-709 / DL-438:** only the scoped authorized controller records; users/workers request. Same-area transfer adds no confirmation. Cross-area transfer requires outgoing authorized-human approval and explicit receiving-owner acceptance, separately evidenced and action-bound. Recording is neither confirmation; a controller receiving ownership must separately accept. No outgoing-owner veto from assignment. Lateral transfer does not invent a promotion prompt; wider transfer also satisfies 5.d.
- **5.c / F3-710 / DL-439:** authorized user/controller may add links after source access and latest-revision checks. No ordinary extra prompt. Preserve who linked what; replacement/removal requires a separate authorized action. Workers propose only.
- **5.d / F3-711 / DL-440:** scoped controller records wider-scope promotion after evidence/gate/approval checks. Ordinary automation stays automatic; required critical/security/governance/HITL approvals remain. A simultaneous owner transfer also satisfies 5.b.
- **5.e / F3-712 / DL-441:** currently responsible, independently authorized owner records evidence-backed resolved/dismissed -> active; user/worker requests confer no recording permission. Preserve new evidence, reason and prior closure. Extra confirmation only under existing policy.
- **5.f / F3-713 / DL-442:** controller chooses/records all seven named non-risk outcomes. Authorized human alone chooses accepted_risk; controller records that explicit decision, evidence and remaining risk. Guided audited supersession/merge/split preserve links/history and do not prove a fix. Acknowledge/dismiss cannot clear a live blocker; transfer/promotion follow their own contracts.
- **5.g / F3-714 / DL-443:** controller records only permitted severity/category/authority assessment changes, with current evidence, exact revision and reason. Authority assessment grants no permission. Assessment cannot substitute for transfer, promotion, evidence linking, reopening, resolution or a canonical record action through display edits.

## New technical bindings and owner placement

Each family has its own full owner unit in `Plans/FinalGUISpec.md#F3-706` through `#F3-714`, its own closed payload/operation/checkpoint route and fixtures under `Plans/card5_event_contracts/`, and its own complete checker selection. Concern current payload editions are **2.0.0**; all six existing **1.0.0** schemas stay byte-identical and historical-only. Generic compatibility uses a closed decoded view with retained original byte/receipt custody. No new generic operation value exists.

Per family, newly authored bindings are the exact private handler/operation key (for the eight current-writer preparations), identity/full-request commitment, `projector.<family_slug>.history@1.0.0`, `reader.<family_slug>.history@1.0.0`, and `<family_slug>_checkpoint.v1:{project_id}:{storage_instance_id}`. Newly named note handlers bind already specified note actions; they add no public feature. Existing concern handlers/public command signatures, canonical record keys, SP-278/DL-076 tokens, SP-286/CV-339 full-value receipt custody, CV-315/SP-233 owner records, Storage’s physical budgets and SP-337 payload-ref route are reused by exact name.

**Per-family search evidence:** `r9/binding-search.json` records the input-head top-level live owner Markdown searches and each new projector/reader/operation/checkpoint identifier search across those docs, top-level scripts and existing alert/panel/concern schema packages. Existing exact event minima/roles are reused; no prior binding with any newly selected technical identifier was found. Each new unit is labeled a newly authored owner contract. No sibling’s contract serves as another family’s contract. Card definitions and current OP-002/OP-004/UCC-147, SP-095/CV-077, the existing annotation lifecycle and immutable legacy schema premises still hold. No old retention answer was extended, and no premise check failed.

**Shared-file hunks:** append nine new F3 units only; append seventeen new stored-value rows and their physical profiles (eight canonical operations and nine derived checkpoints) to `Plans/storage_value_registry.json`. All 360 existing value rows, existing profiles, groups/budgets, retention policies and registry top-level metadata are unchanged. No edits to existing seven contracts, their schemas/fixtures/checkers, `Contracts_V0`, `storage-plan`, Orchestrator, Executor, ATS, event registry, Decision Log, locks/evidence, auto_decisions, frozen validators or immutable panel v1 schemas.

**Retention:** existing concern_record RP-AUTHORITY-INDEFINITE and existing source/blocked-episode holds stay bound to those same records. Each new event, original operation/mapping/action custody and History checkpoint explicitly remains PENDING_RETENTION_DECISION. Case L-3/SP-026 audit/telemetry and RP-PROJECTION-3GEN are candidates only, not selected policies.

## Guard inventory and standing checks

Each new fixture’s **`guard_inventory`** lists every authored runtime/schema site and its named negatives; schema-field cases also record the exact schema path. The complete cross-family inventory is copied to `r9/new-guard-inventory.json`. `r9/runtime-guard-coverage.json` records every exercised operation predicate with no uncovered predicate. Each semantic negative starts from a valid named base and carries explicit coherent payload/command/digest/key/post-state patches. Standalone field/domain negatives test isolated values, not a fabricated full canonical record. The shared tool must still perform field/predicate cuts, classify true same-field/same-predicate duplicates site by site, and run the full composed isolation proof. No compound-keyword removal, merged unrelated predicate set or old proof count is offered as proof. The old lane guard-proof scripts are byte-identical; **C12 stays PARTIAL**.

| Astra item / standing issue | Evidence in the new exact-family checkers |
|---|---|
| 1 forged/contradictory inputs | Recompute event/operation/full original-request commitments; join command and each snapshot field/effect; independent original action/before/after/commit/result/dispatch and append evidence. Generic mapping joins every snapshot fact and original Event ref to its retained decoded source. |
| 2 Storage metadata | Resolver output must equal independent retained Storage Event, complete source selection, eleven-field first receipt and four-field original result. Caller metadata is not authoritative. |
| 3 history both directions | Valid retained originals survive live changes/admission closure; six immutable concern-v1 editions retain large revision originals. Forged/foreign/withdrawn data refuses; current writer predicates never validate a retained original. |
| 4 representations | Exact type-aware recursive joins and recomputed digests; current Boolean authority facts require actual Boolean values, not strings/numbers/containers. |
| 5 dangling refs | Eager whole-schema closure, including an unused-definition dangling-ref negative for each family. |
| 6 complete byte limits | Complete operation/checkpoint and complete History response limits, exact 16384-byte response/checkpoint boundaries, unpageable ref/metadata refusals; 1000 retained matches remain reachable. SP-337 externalization never waives a mandatory operation bound. |
| 7 every custody path | Prepared/committed/settled shapes, independent commit/result/dispatch joins, changed-body retry refusal and original first/full-value receipt recovery. Current and historical paths authenticate exact family/scope/source. |
| 8 isolated negatives | Coherent valid-base mutations, explicit expected refusal sets; no source-guard-removal proof claimed. Shared-tool isolation remains a sweep item. |
| 9 grading | Every exact row stays 9 P / 2 p / 1 A; all native obligations NOT_RUN. Seven prior grade records unchanged; all current citations re-resolve. |
| 10 and 10a numbers/history | No new cap, serializer, normalization or physical float rule. Reuse existing MessagePack; old concern editions are authenticated from original admission, not the caller’s version selector. Shared CV-1100/SP-1100/SP-1101 adoption, physical-number bytes/ranges and general recipe dispatch remain sweep work, including the seven unchanged families’ prior locations. |
| 11 types | Standalone per-schema-node type/constant/enum/required/union/array checks plus full runtime wrong-role, false Boolean, string Boolean/number, null and wrong-container negatives. |
| 12 formats | Existing enforced date-time/UUID checker reused; missing zone, separators, invalid date/time, trailing LF, leap second and malformed fraction refuse. No new lane format grammar/serializer. |
| Other standing checks | Project encoded partition; replay-only writer/retry refusal for all current families and unconditional no-new-write refusal for generic history; failure-oracle subprocess rejects exit zero; CP Storage identity/publication joins; no persisted redb_snapshot_id; post-helper disclosure fences; no application writer invented. |

## Regeneration and verification

| Command/check | Exit / result |
|---|---|
| Sixteen family selections, serial | 0 each; 11452 total static cases/observations. |
| `pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 / top-level pass. |
| `pm-plan-index.py generate` | 0 / top-level pass; contract_only hints added to all nine new units after the initial metadata rejection. No WorkNodes/NodeSeeds created. |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 / pass. |
| `pm-plan-index.py validate` | 1 / parsed top-level fail; exactly 22 pre-existing failures: 21 legacy removal-ledger shapes and the input branch’s older DL-302 vs current origin/main. All seven stale-index/live-unit mismatch failures from the pre-generation 29-row result are gone; no new failure. |
| `pm-storage-profile-check.py` | 1 / exactly 41 pre-existing missing profiles, equal to the input registry’s missing-profile set. All seventeen new value/profile bindings match their declared schemas. |
| Currentness copy | Fifteen ignored edition files copied immediately before each index generation and SHA-256 matched. |
| Citation / scope / source / boundary audit | 0; 369 citations; old family rows and source bytes unchanged; all new runtime guards have named negatives. |
| `git diff --check` | 0. |

Generated shard changes are confined to **finalguispec** and **storage_value_registry**, the two edited owner sources; no unrelated document body changes. Indexes are generated normally, including the existing generated_at_utc timestamp behavior; nothing is hand-restamped or resealed. Governance staleness remains for later integration/reseal. Standard aggregate landing gates are not run by this drafting worker, and no main landing is attempted.

## IDs and remaining items

**New IDs:** F3-706..714, checked free against 529 origin refs / 64 unique FinalGUISpec blobs before minting (`r9/id-audit.json`). **Retained IDs:** SP-660..666, CV-680..686, F3-700..705, ATS-330..334. **Decision references only:** DL-437..443; no entries authored. Remaining items are admission by integration, exact retention binding, the shared number/guard sweep, required actual mapping proof/owner approval, and native NOT_RUN. **Stopped questions: none.**

No pm-mail, subagents, main push, admission, event-family registry append, governance refresh or browser/server. The sparse detached worktree is removed with its literal path after the branch push.

## Evidence

| File | Absolute path | SHA-256 |
|---|---|---|
| `family-commands.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/family-commands.json` | `5d8f3530bb641cd6e9dd0aaeeecd07be25976c1a52dea57df9c69b0876caf36f` |
| `boundary-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/boundary-audit.json` | `33c1d112a5cebf28ee571581219dae91b3e688b97f1139dd05cc0bfcbf845404` |
| `consumed-source-hashes.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/consumed-source-hashes.json` | `8c1f709ea3c141e920874c5e081510775084954a254245d8894e25f7db84868c` |
| `binding-search.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/binding-search.json` | `5d0a710f45eb0afcc4df7df270b433b61e96ebc9d4a945c88750eb5a6d3449a5` |
| `id-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/id-audit.json` | `d305a423c5b2cca4bdd20c676a8e1370ec5cab53f90345c58941e6e478a04b6c` |
| `new-guard-inventory.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/new-guard-inventory.json` | `7a598d658f0e92f90ec0eaf4b2e491bfe36f02325243131b24732e925eaab550` |
| `runtime-guard-coverage.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/runtime-guard-coverage.json` | `3d91769f2e40da63f24110aad236174bef769cd3e6743e5ce3ff0b4c257b8996` |
| `schema-field-inventory.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/schema-field-inventory.json` | `24066a336d496a16dc6457d99fd2d64ade29fb7fb91c87ee633ad17968299bc8` |
| `currentness-copy.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/currentness-copy.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `shard-generate.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/shard-generate.json` | `098ed9163523553e30f3242db80c22163707ab886d71462c8c02183ded96d458` |
| `shard-check.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/shard-check.json` | `73cbf558e2f1234bfb549029fef2b1a654d976fae979ea456a5ff6eafd5ce9f6` |
| `index-generate.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/index-generate.json` | `b1b0b7e35ff98822892b610134614ef0f44b11c91317b6c67e77c4f7ed3fd7a3` |
| `index-generate.initial.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/index-generate.initial.json` | `24ae17b5b2ed521318d12f363ed8a0acbf05f89c216d713137305f016303b885` |
| `index-before.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/index-before.json` | `944486167aac5d811160d5510ccd8f941d475c8564d1ca164755b9eec3630f8f` |
| `index-validate.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/index-validate.json` | `38d0963c1c2e992e813b4b35d03075a6345d26979ca929a53ddc974f177ec516` |
| `storage-profile.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/r9/storage-profile.json` | `3406135c62dfbac183307f939f9d86cb9c8d79c7c394872198bc208c48d10406` |

## Earlier rounds — preserved historical record

# DG6A — review round 8

Branch `plans/ea-w2-gui-concerns-20261104`; reviewed input `ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f`. B1 repair **7298ede10ed9e3aae621419af8e77cd4ea893474**; coherent admission-negative follow-up **da26fea8ad8ce783a0f842e933ed3744f33bbee8**. The final report commit is self-inclusive and changes reporting only. All seven complete family checkers ran serially at `da26fea8ad8ce783a0f842e933ed3744f33bbee8` and passed **3,515 cases**. Source SHA-256 pins match that commit.

Seven families remain prepared without admission, each **9 PASS / 2 PARTIAL / 1 ABSENT**. C6 and C11 recover for the six B1 families. C12 remains PARTIAL for all seven because B2 is explicitly assigned to the shared guard-isolation sweep. Membership ABSENT, retention PARTIAL / `PENDING_RETENTION_DECISION`, native NOT_RUN, and all nine held records/questions/recommendations remain unchanged. This section supersedes the earlier 509/509 proof and 10/1/1 grade claims below; those sections are historical records only.

## Review round 8: findings and responses

| Finding | Where / why / fix | Verification |
|---|---|---|
| **B1 — fixed (`7298ede10e`, test refinement `da26fea8ad`)** | Four `Plans/event_payloads/attention/alert_*.schema.json` revision pairs at lines 22–23 and both `panel_*_v2.schema.json` host-revision pairs at lines 126–132. Round 7 narrowed schemas while retaining their IDs/versions. Remove those lowered maxima, restoring earlier owner ranges. `scripts/pm-alert-event-contracts-check.py:157` now uses the existing exact MessagePack recipe for committed/settled originals, selected from independently supplied original admission evidence and its known family/schema edition, never the caller's retry payload. It validates the retained original digest and exact body; existing append-resolution/source/receipt joins remain. `historical_guards:480` selects the schema from the independent original's edition. Current `request_digest`/`semantic_packed` and exact type/token/format checks remain. Panel `protocol_errors:123` supplies the same independent original evidence. No new number cap, serializer, normalization, schema ID or version. | Every affected family has prior revisions 9007199254740991, 9007199254740992 and 9007199254740993, with result prior+1, coherent commands/snapshots and pinned earlier-codec digests/payload-byte hashes. All 18 retained reads and 18 exact retries pass. Per original, mismatched edition/source fail separately through History and retry, each changing one leaf and producing only its owning refusal. Supplemental admission/digest/unsupported-original-edition controls also refuse. |
| **B2 — sweep item, unchanged** | `scripts/pm-dg6a-guard-check.py:389,407–413`: the nine `history_shape` rows pop an early-return rejection and bypass the remaining reader checks. The original cycle-8 review proves this; the table is not complete proof. Adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105` in the cross-lane sweep. The round instruction moves proof machinery there, so this repair does not rebuild or claim to repair the lane proof script. | The proof script is byte-identical to reviewed input. All seven C12 cells remain PARTIAL. The grade audit refuses an invented C12 PASS for each family. No new complete guard-removal count or duplicate-set proof is claimed. |
| **N1 — existing integration item** | The copied ignored currentness edition still makes `Plans/.plan_index/node_readiness_report.json` stale. Read-only index validation's complete 23-row failure array equals cycle 8's pre-generation array exactly: 21 legacy ledger shapes, newer-main DL-302 comparison, and readiness staleness. | Fifteen currentness files copied and SHA-256 matched. No owner Markdown changed in this B1 repair, so no regeneration was required or performed. Integration should regenerate normally against the current edition; no diagnostic restamping or governance reseal here. |

## New B1 cases

`scripts/pm-alert-event-contracts-check.py:685` exercises `retained_revision_cases` from each of the six family fixtures through the actual composed reader and protocol checker. Expected request digests and encoded-payload hashes are pinned from cycle 8's independent earlier-recipe evidence at `adda7279f8067637b109125f9524b0952f88f96b`; no new serializer or current-domain re-encoding supplies the expected values. Source: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DG6A-sol/cycle8-evidence/history-number-recipes.json`, SHA-256 `e64faee85bfcc5ac6ad5d47d66674ffeb8668ffd3e37dd3363721ee821d61152`.

Per revision: retained-original read and exact retry are positive; History edition/source mismatches and retry edition/source mismatches are four separate one-leaf negatives. A digest-only forgery is another one-leaf negative. Missing original admission keeps both original and resolver observations coherently false; it fails only the admission-dependent retry guard. An unsupported original edition reconciles all four payload copies and recomputes the earlier-codec digest, so it fails only edition selection. These last two each have one semantic defect, with no stale copy or digest. The admission witness was corrected in `da26fea8ad` before the final complete rerun.

Total: **18 retained originals, 18 exact retries, 126 refusals; 162 new observations**. All pass. Each affected family contributes 27 observations. `concern.created` gains no revision-range fixture and its complete checker still passes. Both immutable panel-v1 readers remain exercised and their schemas are unchanged. Existing live-state/replay-only positives, forged/withdrawn controls, current writer type/spelling checks, byte limits, source custody and full-u64 cursor positives remain in the seven checkers.

## Family grades before and after

Before = independent cycle-8 re-grade. P/p/A = PASS/PARTIAL/ABSENT.

| Family | Before P/p/A | Round 8 P/p/A | Complete checker cases |
|---|---|---|---:|
| alert.acknowledged | 7/4/1 | 9/2/1 | 460 |
| alert.dismissed | 7/4/1 | 9/2/1 | 463 |
| alert.rule_muted | 7/4/1 | 9/2/1 | 463 |
| alert.snoozed | 7/4/1 | 9/2/1 | 476 |
| panel.redocked | 7/4/1 | 9/2/1 | 516 |
| panel.undocked | 7/4/1 | 9/2/1 | 516 |
| concern.created | 9/2/1 | 9/2/1 | 621 |

All 84 prepared-family cells have cycle-8 priors and current citations. The grade audit resolves **603 citations**. All nine held grade records remain structurally identical to the reviewed input. The exact stopped questions and unapplied recommendations below remain authoritative as holds.

## Sweep items and proof limits

- **B2 / check 11:** replace the lane machinery with the shared guard-isolation tool, prove each field/predicate separately, distinguish exact same-invariant duplicates from shared enforcement sites, and replace the nine unproved navigation rows. Include the retained-retry guards and new witnesses in the shared inventory. The earlier 500/509 independent result belongs to the reviewed head, not this repair head.
- **Shared number rule / SP-1101:** complete CV-1100/SP-1100/SP-1101 adoption and authenticated write-time recipe dispatch in the sweep. This repair only preserves the six existing earlier exact MessagePack editions for independently admitted originals; it authors no general dispatch system. Current range rules and physical-number-byte concerns beyond this cap removal remain sweep work, including `scripts/pm-dg6a-domain.py:66–69`, current-only embedded operation/shared-state schemas and CV-680..686's current-number wording. Storage uint64 metadata and cursors must keep their complete domain; no 2^53 metadata cap is introduced.
- **Number-domain oracle expectations:** `scripts/pm-dg6a-domain-check.py:170,180,253` and `scripts/pm-dg6a-final-regression-check.py:146` still contain round-7 unsafe-range expectations, including standalone payload refusal at 2^53/2^53+1. Align them with the owner domains during shared-rule adoption; do not restore the rejected payload maxima to satisfy those expectations. Those broader domain/full-CLI drivers are not claimed as passing reruns here. The seven complete family entry points are the reruns reported above.
- **N1:** regenerate the index with the current copied ignored edition at integration; keep the existing four-timestamp exception and report diagnostic changes honestly. No index/governance artifacts were edited in this bounded repair.

The shared-tool instruction supersedes round-local proof rebuilding. No full source-removal/domain matrix or 719-CLI campaign was rerun or represented as passing. Current family checkers and the new B1 positive/negative cases all pass; C12 remains PARTIAL until shared isolation is completed.

## Verification, scope and evidence

| Check | Exit / result |
|---|---|
| Seven complete family entry points, serial at `da26fea8ad` | 0 each; 3,515 total cases. Exact commands, input head and memory readings in `family-commands.json`. |
| New retained-revision cases | 162/162; 36 positives and 126 negatives. Per-family observations in `*.retained.json`. |
| Grade baseline and seven false C12-PASS controls | Expected exits 0 then seven 1s; 8/8 pass. Inputs restored byte-for-byte. |
| Grade/citation/held-record audit | 0; 603 citations; all nine held records identical. |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | 0/pass; 99 docs, 3,129 shard bodies. |
| `pm-plan-index.py validate` | 1; parsed top-level status fail; exactly the same complete 23 failures as cycle 8 before generation. |
| Scope/source/whitespace audit | pass; source bytes match code commit; no new PlanUnit IDs or forbidden-path edits. |

Owner Markdown, both registries, Decision Log, immutable panel-v1 schemas, currentness/governance artifacts, storage profiles and budgets, and the lane proof/domain scripts are unchanged. The only companion edits are six payload schemas, six family fixtures and the alert/panel checkers; the grade-audit driver is updated to enforce truthful C12 PARTIAL with seven new false-PASS controls. There is no admission, registry append, Decision Log entry, retention answer, actor grant, product feature, new identity recipe, main push, pm-mail, subagent, browser or server.

Existing IDs retained: **SP-660..666, CV-680..686, F3-700..705, ATS-330..334** (25 definitions). **No new IDs.** SP-1101 and the shared-tool branch are sweep references, not lane allocations. Initial root disk free 94 GB and available RAM 13 GiB met the 50-GB/6-GiB gates. Every family run records a resource check; no memory pause was needed. The sparse detached worktree is removed with the literal prescribed path after the final report/grade copy and push.

| Evidence | Absolute path | SHA-256 |
|---|---|---|
| `verification-summary.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/verification-summary.json` | `588054adf9c46b702844e8368d788cd92374cb889f0510bd47be34d3945fdb48` |
| `family-commands.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/family-commands.json` | `7d0b77ce79f201714676dddf3fca0f508a96f767dc55d6fca53d5b2fc54ef7af` |
| `consumed-sources.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/consumed-sources.json` | `688213e28d89fd0858cb40239c0aaec613557f1b30d3a1e06471a25c87fd2453` |
| `regrade-summary.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/regrade-summary.json` | `34c36eec361105db56542672a1775237a8df210fbfb6b8b6e42be384b34b6a57` |
| `grade-controls.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/grade-controls.json` | `ea6313e693ac93790337fcfaf7bceb359db7877fd70fb4905f115c8b63b5d4aa` |
| `boundary-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/boundary-audit.json` | `73da6681990b63c65ecf73898835e56133b4dd75b43c6efbdef07610d6a631c3` |
| `shard-check.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/shard-check.log` | `48c1f857e2193456e9db56b97c616373bfca9a7db703b6ebe4b0efe2ae378363` |
| `index-validate.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/index-validate.log` | `b36502925ee11fffee1f8ab525d000398791fc8ba9ae6b5d3f7ca427c3ec4e3b` |
| `index-baseline-comparison.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/index-baseline-comparison.json` | `de1acb8142e500a8a70be88e83717648c66548859ad01a20cfd1add195c1ec26` |
| `currentness-copy.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix8/currentness-copy.json` | `260def53a52691607d7f8bbb9790c4626cd49842f94e3cc39b308ab33eaad507` |

## Earlier rounds (unchanged historical record)

# DG6A — review round 7

Branch `plans/ea-w2-gui-concerns-20261104`; reviewed input `adda7279f8067637b109125f9524b0952f88f96b`. Technical repair **da37d7ac9d947f8a26b6b66f053dffb4eaa6f150**; navigation-proof refinement **f34fec9eb0c00754638a05e65b456e576b9d818a**. The final report commit is self-inclusive. Earlier round records and all nine held questions/recommendations remain below unchanged.

This round began after all twelve Astra items were published; no cutoff exemption is claimed.

Seven families are prepared without admission. Each changes from the cycle-7 review's **9 PASS / 2 PARTIAL / 1 ABSENT** to **10 PASS / 1 PARTIAL / 1 ABSENT**. Only C12 recovers. Membership remains ABSENT, retention PARTIAL / `PENDING_RETENTION_DECISION`, native execution NOT_RUN.

## Review round 7: findings and responses

| Finding | Where / why / fix | Verification |
|---|---|---|
| **B1 — fixed (da37d7ac9d947f8a26b6b66f053dffb4eaa6f150)** | CV-680..686, the seven payload schemas, their operation/shared-state/record schemas and mirrored registry schemas, and all three family checkers. JSON Schema's mathematical integer accepted `1.0`/`1e0` while MessagePack refused them. Embedded `$schema` also silently selected the permissive base validator. The exact validator now remains active throughout nested schemas. Current semantic revision numbers are exact JSON integer tokens in the I-JSON safe range, subject to field bounds. The same domain precedes request/producer hashing and retry. Raw negative zero and leading zeros refuse at parsing; integral/exponent floats, Boolean numbers and wrong containers refuse at the first validator. Storage-assigned u64 sequence/frontier values retain their existing exact physical domain. | Per-field type/number/range guards; standalone payload, all three operation states, checkpoint, protocol and current/v1 History sweeps; actual family CLI mutations for same-value `.0`/`e0`, `-0`, `-0.0`, `01`, 2^53 and 2^53+1. No new codec, integer coercion or retained-original normalization. |
| **B2 — fixed (da37d7ac9d947f8a26b6b66f053dffb4eaa6f150)** | `scripts/pm-dg6a-domain.py` and all schema-validation entry points. The VM's optional `date-time` support was absent. Required date-time and UUID checkers are now registered locally and supplied on every validation, including panel operations/checkpoints and embedded payloads. Full-match RFC3339 grammar plus Gregorian calendar validation requires a zone and valid time/offset fields. Leap seconds, malformed fractions, separators, whitespace and trailing LF refuse. Arbitrarily long valid fractions are preserved; snooze compares their complete precision. | Every authored format leaf, including nullable/optional branches, receives malformed values. Standalone and composed validators and actual family CLI counterexamples refuse them. Valid leap-day, lower-case T/Z, offset and long-fraction positives pass. Hash preimages validate semantic timestamp fields too. |
| **P1 — fixed (da37d7ac9d947f8a26b6b66f053dffb4eaa6f150)** | Shared `historical_guards` and schema dispatch. Navigation containers and required members are checked before indexing, `.get`, `.items` or hash-table lookup. Malformed History input returns modeled `HistoryUnavailable(['history_shape'])`; non-string schema selectors fail their owning payload guard. The sweep also repairs protocol navigation, malformed independent append evidence and non-string concern creator set membership. | All seven current readers and both panel-v1 readers receive wrong-container, missing-member and wrong-leaf-type mutations. Incidental exceptions fail the sweep. A one-change wrong-payload-container negative joins each reader's full guard-removal matrix. |

**B1:** `scripts/pm-dg6a-domain.py:31`. **B2:** `scripts/pm-dg6a-domain.py:14`. **P1:** `scripts/pm-alert-event-contracts-check.py:400`. The final navigation guard and witness refinement is `f34fec9eb0c00754638a05e65b456e576b9d818a`.

## Grades

| Family | Cycle 7 | Round 7 |
|---|---|---|
| alert.acknowledged | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| alert.dismissed | same | same |
| alert.rule_muted | same | same |
| alert.snoozed | same | same |
| concern.created | same | same |
| panel.redocked | same | same |
| panel.undocked | same | same |

The nine held grade records are structurally identical to the reviewed head. The three bundle identities and six concern actor/confirmation choices remain STOPPED_FOR_JARED; no recommendation is applied. Event registry, Decision Log, immutable panel-v1 schemas, governance locks and frozen validators are unchanged.

## Guard table and field sweep

**509/509 full source/checkpoint/history rows**, **26 named duplicate matrices**, **1829 current negatives** and **522 historical negatives** pass. The separate input-domain matrix has **1620 passing rows** and **73,026 observations**, covering **1,160 family-specific schema field nodes** and **4,909 context-specific endpoints**. Another **35/35 parser/instant implementation rows** independently remove raw-number parsing, full-match grammar, Gregorian parsing and the named three-way leap-second duplicate set.

The navigation refinement removes the owning `if` and continues every remaining protocol check. Prepared-state positive originals are schema-valid; deleting only the required navigation member produces the negative. `.get` occurs after the unchanged mandatory-member/type guard, preserving production validation. The reader’s malformed-payload witness likewise runs its actual page/typed-unavailable path. No early success replaces the remaining protocol checks.

The [guard table](DG6A.guard-removal.md) distinguishes the full current/source/checkpoint/historical matrix from per-field domain-rule proofs. Every existing guard is retained; source guards and named duplicate sets are weakened only in memory, one at a time, with restoration in `finally`. Full matrices name flipping negatives, rejected complements, changed diagnostics and duplicate pairs. The generated foreign-token witness uses a valid foreign UUID so the Storage-identity guard alone rejects it; malformed UUID syntax has separate field-domain witnesses. No unrelated pair excuses a masked negative.

Domain rows enumerate each authored schema's field rules, including optional, nullable and constant fields. Their scalar/container-type predicates have their own valid inputs and single-field negatives. Each exercised rule or named same-field duplicate set is removed and the same-field negative complement rerun. These are input-domain proofs; the separate full composed sweep and real CLI runs establish integration. Live state and the unused `append_family` annotation remain nonauthoritative. Schema-permitted null/union alternatives and full u64 physical values are positives, never mislabeled negative successes.

## Twelve Astra classes

| Item | How it is ruled out in all seven prepared families |
|---|---|
| **1 Forgery/contradiction** | Existing recomputed operation/event/request identities and per-field owner joins remain; source guard and full CLI mutations reject forged IDs, arbitrary digests and contradictory snapshots. |
| **2 Assigned metadata** | Storage event/receipt/source values still compare to independently supplied originals with exact nested types. Caller retry equality excludes Storage-assigned metadata. |
| **3 Historical direction** | Current and v1 retained-original/replay-only positives survive changed or absent live state; forged, foreign, withdrawn, deleted and access-denied originals refuse through composed readers. |
| **4 Two interpretations** | Exact types and semantic safe integers precede schema/compare/hash/identity use. Instant grammar and complete-fraction comparison remove skipped formats and lexical/truncation disagreement. |
| **5 Unresolved refs** | Eager unvisited `$ref` mutations still fail for payload, operation, checkpoint and registry-embedded schemas; optional referenced positives remain. |
| **6 Partial size limits** | Existing complete operation/checkpoint/response byte caps and exact boundaries remain. SP-337 payload refs do not exempt mandatory metadata; no size guard changes. |
| **7 Custody paths** | Prepared no-append, committed recovery and settled return retain their separate custody paths. Independent source/receipt/append-result and foreign-reference mutations still refuse. |
| **8 Masked negatives** | Whole source/checkpoint/history matrices rerun, including earlier repaired one-change witnesses. New domain negatives have their own rule removals and explicitly named duplicate sets. |
| **9 Overgrading** | Only the repaired C12 cell recovers; admission ABSENT, retention PARTIAL, native NOT_RUN and nine held records remain explicit. Input-domain proof is not represented as native authentication. |
| **10 Number spellings** | Exact integer tokens, semantic safe bounds, raw JSON spelling failures, per-field schema checks and actual CLI/hash counterexamples cover `1.0`, `1e0`, `-0`, `-0.0`, leading zeros, 2^53 and beyond. Storage's declared physical u64 domain stays exact. |
| **11 Types** | Every schema field and actual payload/operation/checkpoint/protocol/history endpoint receives string Boolean/number, null, array, nested-object, Boolean and numeric alternatives. Owning guards refuse invalid forms; accepted nullable or ignored fields are recorded explicitly. Wrong-container navigation returns modeled unavailability. |
| **12 Formats** | All authored date-time/UUID leaves and actual timestamp fields are exercised, including optional and nullable leaves. Missing zones, bad separators/dates/times/offsets, trailing LF, leap seconds and malformed fractions refuse independently of optional installed packages. Valid fractional/calendar/offset forms remain positive. |

All eleven standing checks are retained and rerun across the CLI suite and full guard matrices: replay-only current refusal; exact CV-366 app keys; encoded Project partitions; full-value/SP-337 limits; full-string identifiers; caller-only retry semantics; original checkpoint identities; actual failure exits; eager refs; retained History; guard isolation. Project-only families still refuse application writes.

## Verification and scope

| Check | Exit/result |
|---|---|
| Seven complete family checkers | 0 each; 3,353 cases/assertions at final code |
| Seven complete source/history guard matrices | 0 each; 509/509 rows, 26 named matrices |
| Seven field/input-domain sweeps | 0 each; 1,620 rows / 73,026 observations |
| Parser/instant implementation removal proof | 0; 35/35 rows |
| Full CLI regression, seven serial families at `da37d7ac9d` | 0 each; 1,016 observations, 719 actual CLI invocations, 297 composed History observations |
| Final navigation refinement `f34fec9eb0` | Seven complete family/domain/guard reruns, unchanged production validation |
| Fixture/input restoration | pass; 30 CLI-mutated input paths match their exact execution blobs, final inputs match final code head |
| Grade/citation/held-record audit | 0; 591 current citations; nine held records unchanged |
| Shard generate / index generate / shard check | 0 / 0 / 0; only Contracts_V0/storage_value_registry shard directories and six index paths changed |
| Index validate | 1, top-level status=fail; exactly the same 22 cycle-7 failures |
| Whitespace / boundary audit | pass; prior fixtures, profiles, holds, admissions, immutable v1 schemas and governance freeze preserved |

The full CLI runs consume the committed technical repair, with source hashes checked before and after every family. The later navigation refinement changes only guarded dictionary access, the counterfactual removal, its prepared-state witnesses and grade metadata; exact numeric/date/hash/identity/size code and canonical docs/schemas remain the tested technical blobs. Final complete family/domain/source-guard runs cover that refinement. No earlier worktree run is represented as a CLI run at the later head.

Index validation retains the 21 legacy-ledger record-shape failures and DL-302 comparison against newer origin/main. Its complete failure array equals the cycle-7 input byte-for-byte. No new index failure is introduced, and index pass is not claimed. Governance remains unsealed after canon changes; integration needs its assigned batch reseal. No Spec Lock, evidence, migration snapshot or baseline is refreshed. Unrelated profile/Assistant suite failures from the review are not reclassified as DG6A successes; this repair does not modify those checkers or the Assistant test file.

Canonical owner prose changes are confined to the seven existing CV-680..686 contracts. Companion changes are the seven payloads, their operation/shared-state/record schemas, corresponding registry mirrors and fixtures/checkers. Derived changes are regenerated, never hand-edited. Existing profiles, group budgets and concern_record retention remain unchanged. No new binding, product feature, actor grant, admission, retention answer, Decision Log entry, reseal, main push, subagent or pm-mail.

Existing IDs retained: **SP-660..666, CV-680..686, F3-700..705, ATS-330..334** (25 definitions). **No new IDs.** Initial resources: 20 GiB available RAM, 76 GiB root free; sparse detached worktree. All family and CLI gates require at least 6 GiB available RAM. The worktree is removed after push and evidence/report copies.

| Evidence | Absolute path | SHA-256 |
|---|---|---|
| `guard-summary.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/guard-summary.json` | `927d6839683c16060e6a6ce1ba5373102d0168d3ab53a2a2b71e36f15e206790` |
| `final-family-commands.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/final-family-commands.json` | `f4aea4f968bac90e270288606a6affaebb1c667eac147195e5ce81ab26b2439f` |
| `final-cli-commands.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/final-cli-commands.json` | `ee5ce585097dd2ad5a73cc7d58a2a4021c3ba36cd7e5f9fcca58b7089087a88d` |
| `cli-summary.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/cli-summary.json` | `6b1a36c93fbedcbdb50a2c805caadf57e8ae241f71eaa86621ef8b7347f8f661` |
| `parser-format-guards.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/parser-format-guards.json` | `00cc18ec8c276aa0ba5b108e015400aa7ecfd47b23e59f7771b7eb378f954cb2` |
| `parser-format-proof.py` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/parser-format-proof.py` | `2f6ac4402ecf280e51dfb00c78bff373502e4f7d73aa1d95c5c4e13a4cbd0734` |
| `final-consumed-sources.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/final-consumed-sources.json` | `fda2a2680b92c46250d67162459bf2f04e97addb49ffbf981156b6094f17860e` |
| `full-cli-consumed-sources.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/full-cli-consumed-sources.json` | `171fd917ebb732e1eaefcb71314fb712e18e8017cf24d5106cc6ada7be000c3b` |
| `input-restoration.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/input-restoration.json` | `1ac26011993333bd064f5861d7506e23251f592b990cd8490235dfe79629fbf7` |
| `boundary-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/boundary-audit.json` | `ecfdb42715c233806de2b9909e06205226f23cce0f4140503b745a705cd80caf` |
| `repository-checks.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/repository-checks.json` | `9608c653bbaa7b251a975c381753a372d6b5075cf7913e3048c397badfe4cc57` |
| `index-validate.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/index-validate.log` | `f340efef803579c9b6904a6f02109875a331d12f9559a0bc51999aa8fa25f063` |
| `index-baseline-comparison.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/index-baseline-comparison.json` | `aca7e40ef6da380a89ad1bcd649af24e17a449371b0af6e8e03b510cc217c9fb` |
| `currentness-copy.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/currentness-copy.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `grade-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix7/grade-audit.json` | `a47c82da58fd275f143ac493b38d946042cfff0fe7f10e5c8281ab652b243c94` |

## Earlier rounds (unchanged historical record)

# DG6A — Astra 2 fix round 6

Branch `plans/ea-w2-gui-concerns-20261104`; reviewed input `69776a6b88c79f5ad871d9b98304bc7ef89fcd83`; technical repair `387e5747032abe6376fd2792f01c4e2d9de81692`, boundary-positive follow-up `7a56f2132d`. This section supersedes earlier grade/proof claims; all earlier fixes and the nine stopped questions below are retained. The final report commit is self-inclusive.

Seven families are prepared without admission. Each has **10 PASS / 1 PARTIAL / 1 ABSENT**. Membership remains ABSENT, retention PARTIAL / `PENDING_RETENTION_DECISION`, native execution NOT_RUN. No held-family action, role, confirmation, annotation identity, admission or retention choice is applied.

## Review round 6: findings and responses

| Finding | Location / cause / fix | Verification |
|---|---|---|
| **B1 — fixed (`387e574703`)** | Four alert fixture files had incomplete `missing_token` and `persisted_snapshot_forbidden` witnesses. Each now starts from the complete positive and removes only the token or adds only the forbidden snapshot field. The foreign-token witness now changes only token Storage identity. `fixture_cases`, `executed_cases` and `checkpoint_schema_matrix` in `scripts/pm-dg6a-guard-check.py` cover every negative collection and actual current predicate calls generated by the checker, plus individual exercised checkpoint schema rules. | All four checkpoint families flip their missing-token and snapshot negatives under the precise schema-rule removal; every other negative remains rejected. The broader capture also found and repaired size/schema-masked accumulating-ref witnesses, a full-v1-as-current malformed witness, a mixed-instance checkpoint witness and an authority-kind mismatch carrying an unrelated forbidden role. These retain independent size, compatibility, source and creator tests. |
| **B2 — fixed (`387e574703`)** | `scripts/pm-concern-created-contracts-check.py` applied fresh-create absence predicates to a settled original. Prepared creation alone requires key/subject absence. Committed recovery and settled retry authenticate the retained original and original append custody; settled retry returns its exact record/result/dispatch/append references. The caller comparison uses UCC-147's six input fields, with `title_ref` committing exact title bytes. Assigned timestamps, receipt fields and current record state do not enter the new caller body. | Positive retries with the original key present, subject active, both present and new assigned request metadata return the original. Every caller-body field and wrong-type body has an isolated refusal. Fresh creation still refuses existing key/subject; creator/source/permission and original-digest guards remain. |
| **B3 — fixed (`387e574703`)** | `append_result_errors` and the three current protocol entry points join current resolution to independently supplied original evidence. Complete resolved event, source selection, first eleven-field receipt and four-field append result compare with exact nested types and values. Family, Storage, Project/scope, original event and original payload bind that evidence to this operation. Settled append-result refs match the original exactly; committed operations retain null refs. Fixture refs are unique to Storage/scope/event. | Every family has a one-field foreign-reference negative and guard-removal flip, committed-ref refusal, and per-leaf resolution mutations for committed recovery and settled return. Full checker CLIs reject Astra's exact `pmref:foreign:original_append` counterexample. Synthetic custody relation only: genuine Storage authentication remains native NOT_RUN. |
| **P1 — fixed (`387e574703`, `7a56f2132d`)** | `cursor_errors` precedes paging in the shared History reader and panel current protocol. Its complete bound is `0 <= after <= frontier <= 18446744073709551615`. | All nine reader versions reject -1, frontier+1 and u64 overflow. Composed-reader positives cover 0, the actual frontier and u64 max with its independent publication; the domain guard has its own removal witnesses. The max-frontier positive uses the declared compact publication so an exact-16-KiB original is never enlarged past its cap. |
| **S1 — fixed (`387e574703`)** | The cursor domain requires `type(value) is int` for both cursor and frontier before comparing values. | All nine composed readers refuse true, false, string numbers/booleans, null, arrays, objects, nested objects and floats. Both cursor inputs have wrong-type classification negatives. Item 11 applies to this round and is included in the sweep. |

## Family grades before and after

| Family | Astra 2 at `69776a6b88` | Round 6 |
|---|---|---|
| alert.acknowledged | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| alert.dismissed | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| alert.rule_muted | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| alert.snoozed | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| concern.created | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| panel.redocked | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| panel.undocked | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |

C8 and C12 recover in all seven; C6 recovers in concern.created. All other reviewed cells carry forward against unchanged owner prose. The self-grade records Astra 2 as the prior for all 84 current-family cells. Its 577 exact citations resolve; all nine held rows are structurally identical to the reviewed head.

## Guard table and eleven-class sweep

The [guard table](DG6A.guard-removal.md) records **493/493 passing rows**, **1,822 current negatives**, **513 historical negatives**, **65 duplicate witnesses** and **26 named duplicate-set matrices**. Each source guard or named duplicate set is removed serially in memory, swept across its complete family negative set, and restored in `finally`. Remaining diagnostics must stay unchanged or have the named duplicate proof. Exceptions, unproved guards and unrelated masked negatives fail the audit. Family-inapplicable branches are proved in the owning snooze/rule family rather than counted as passes elsewhere. The table names every flipping set and rejection complement through hashed JSON evidence. Historical publication/source guards are composed across all nine versions; cursor classification has its own domain-removal witnesses and composed-reader boundary/type tests.

The independent round-6 sweep has **403 passing observations**, covering every class for every prepared family. The standard checker entry points also exercise all six number spellings through the actual producer digest codec for each family.

| Astra item | How this round rules it out |
|---|---|
| **1 — forgery/contradiction** | Each family's event/operation/request identities are recomputed; owner snapshots retain the previous per-field joins. Own forged-ID and arbitrary-digest mutations reject. New append family/scope/original bindings reject foreign originals. |
| **2 — assigned metadata** | Current resolution is compared to independent original Storage evidence, including every sequence, segment, offset, durability and receipt leaf. Historical evidence retains its type-exact joins. New request metadata does not change concern caller equality. |
| **3 — historical direction** | Current and immutable panel-v1 readers retain valid originals with live state absent under current and replay-only historical policy. Withdrawn/foreign/forged originals and revoked disclosure remain unavailable. Current writer/retry predicates never validate a historical original. |
| **4 — two interpretations** | Digest integer/uppercase/space/LF/null/array/object mutations refuse. Existing instant-based snooze comparisons remain. New cursor type checks prevent Boolean-as-integer interpretation; nested evidence equality compares types and values. |
| **5 — unused unresolved refs** | Every schema is traversed eagerly; an unused dangling definition rejects in each family. Full CLI tests retain payload/operation/checkpoint and embedded-registry probes. |
| **6 — partial size limits** | Complete canonical MessagePack operation, checkpoint and emitted response limits remain. Physical-limit witnesses are schema-valid and separate from forbidden-field witnesses. Existing SP-337 owner routes and mandatory-value caps are unchanged. |
| **7 — custody on every path** | Both committed recovery and settled return bind original resolution to the same family, scope and operation. Foreign append refs refuse; committed nonnull refs refuse. Original receipt/source leaf mutations reject independently. Fresh prepared creation does not return an append result. |
| **8 — masked negatives** | All fixture negative collections and generated current predicate calls join the matrix. Individual checkpoint required/additionalProperties rules are proved. Redundant malformed witnesses are rebuilt; unrelated pairs are never used to excuse them. Named duplicates protect the same fact. |
| **9 — overgrading** | Only C6/C8/C12 defects actually repaired are upgraded. Admission ABSENT, retention PARTIAL, native NOT_RUN and the nine holds remain explicit. No native authentication claim is inferred from synthetic evidence. |
| **10 — number spellings** | `1` uses integer bytes; `1.0`, `1e0` and `-0.0` are refused by canonical MessagePack/digest codecs; integer `-0` has exactly zero's bytes/digest; JSON `01` fails parsing. All seven producer suites exercise these forms. |
| **11 — confused types** | Exact authorization Booleans, schema container types, complete nested source types and exact unsigned cursors are tested with string booleans/numbers, null, arrays and nested objects. Floats and Boolean cursors refuse before paging. |

## Verification, scope and retained evidence

| Check | Exit/result |
|---|---|
| Seven family entry points, each `--family <exact name>` | 0 each; 3,343 assertions/cases in the serial entry-point summaries |
| Seven complete guard runs, each `--family <exact name>` | 0 each; 493/493 rows, 1,822 current negatives, 513 historical negatives, 26 named set matrices |
| Independent eleven-class sweep | 0; 403/403 observations |
| Full CLI regression, seven serial family runs | 0 each; 725 observations, 428 actual CLI invocations, 297 composed-history observations; executed code `7a56f2132d37b48085cb5e39c94c4f4e23da7f97` |
| Focused exact-cap/u64 positive | 0; concern and both panels remain valid with an exact 16-KiB original checkpoint |
| Input restoration | pass; 30 mutated inputs equal exact code-head blobs after restoration |
| Shard check | 0; pass; no regeneration |
| Index validate | 1 / top-level `status=fail`; 22 identical failures reproduced at reviewed input against the same origin/main; copied currentness edition hash-verified |
| Assistant tests | 1; 41 tests, exactly the two pre-existing failures named below |
| Grade/citation/hold audit | 0; 577 citations; nine held rows identical |
| Scope and whitespace | pass; no protected/generated/owner Markdown changes or new IDs; `git diff --check` clean |

Index validation's 21 legacy-ledger record-shape errors and missing DL-302 comparison are byte-for-byte identical at the reviewed input and this repair against origin/main `fb441b27fd75440e14115fb382b15a5258ad7ea3`. This branch does not change those inputs or remove a PlanUnit; the newer main baseline contains DL-302. No baseline refresh, ledger repair or governance change was attempted. The temporary baseline worktree was removed.

The Assistant failures remain `test_definitionless_records_stay_blocked` and `test_live_equivalent_negatives_fail_for_intended_reason`, as in Astra 2. The max-frontier fixture-positive failure found in the first CLI pass was corrected in `7a56f2132d`; those failed/intermediate outputs are superseded by the complete final rerun above. No earlier CLI run is represented as a run at this final code head.

No canonical owner Markdown, registry, immutable panel-v1 schema, held-family contract, Spec Lock, generated shard/index, evidence bundle, Decision Log or governance artifact changes in round 6. Therefore no shard/index generation is required. Shard checking and top-level index validation are read-only. All prior technical fixes remain in history and are exercised by the CLI regression. The known Assistant failures are recorded separately; no unrelated repair is made.

Existing IDs retained: **SP-660..666, CV-680..686, F3-700..705, ATS-330..334** (25 definitions). **No new IDs.** No subagents, admissions, registry appends, landing lock or main push. The worker used the prescribed detached sparse worktree and serial resource gates; initial checks showed 9 GiB available RAM and 78 GB free root disk. Resource checks before every family, guard and CLI stop below 6 GiB. The worktree is removed after the final report/grade copy and branch push.

| Evidence | Absolute path | SHA-256 |
|---|---|---|
| `guard-summary.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/guard-summary.json` | `9df9a860015e30499e8eaac28628940334c6e6a9ce957696ee47ef0310abd949` |
| `serial-checks.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/serial-checks.json` | `0c5b1f8f916db7afdbcc731da6678b5779d94913d4f8f6e5f6a4647dcbc68635` |
| `sweep-round6.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/sweep-round6.json` | `a8cb2543acd910324e117db37070ae9f5ee3fef28c0347b23d06200918174858` |
| `sweep-round6.py` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/sweep-round6.py` | `323a0a0b01d862da26493c62699d84dd733bb246a3fbaa396780b89b59d087d8` |
| `maximum-frontier-boundary.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/maximum-frontier-boundary.json` | `253370a6e5d7631c9f04e7bcc9672eae91f9560264947bfcdeef14f95c130973` |
| `input-restoration.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/input-restoration.json` | `af1542470bac2dbed3493f17220913449f5963fd77fedd554393c2abc8d7ef25` |
| `boundary-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/boundary-audit.json` | `59c2cb3509e24c19dfe950c4e90a9b235306640a13fb99a9b11a886078a031b4` |
| `repository-checks.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/repository-checks.json` | `d1fe9448a593bb36b85a0e0c927b27c4bd03175b3ac8920cddadca5ebef27445` |
| `currentness-copy.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/currentness-copy.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `index-baseline-comparison.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/index-baseline-comparison.json` | `0ce33b4e86bff10a5d6548fe4aab46ade5ed36cce2df6295224c461ec86602c5` |
| `index-baseline.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/index-baseline.log` | `c0cdade7d387e6e215381c587d3c8e87923a4022f1e26aef48453c7320da024a` |
| `assistant-tests.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/assistant-tests.log` | `4eb1fcf329433e09957183b5bc8b4237e4c06a275ab360762a52764546e9608e` |
| `index-validate.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/index-validate.log` | `3e7f1b56b1c686ee2a6490099ecfe40afd81e08945be53ed2325535a8bf34380` |
| `grade-audit.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/grade-audit.log` | `97e1cdf976881188f483138b653d937297f3d35668783ec1c7f52a98da51cdcd` |
| `alert_acknowledged.guard.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/alert_acknowledged.guard.json` | `56a22bdccad2dbf30502a231397df61d8c25c1e8feeafd3b1d7e6711abcb9416` |
| `alert_dismissed.guard.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/alert_dismissed.guard.json` | `fb8090cef8bad7b20e8f0bf1e415a55cc441c9361749a44f18daa5ca077dc107` |
| `alert_rule_muted.guard.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/alert_rule_muted.guard.json` | `3d4e49b2096387b5e92eac6e87b6a7678b7acc57291093b404ba772a978667ba` |
| `alert_snoozed.guard.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/alert_snoozed.guard.json` | `3b422b078b15a4034180f75dbf30616eacbd27f3ff39e4a12e11e97fb8626597` |
| `concern_created.guard.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/concern_created.guard.json` | `f6e8780d1d927db679f0fc25eeecb50d64768db9e5fe01ebc2e99049009dfb3b` |
| `panel_redocked.guard.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/panel_redocked.guard.json` | `9e41b671ca018b78460307a42e5c612cfc15b5475035620f0ff6f865e8464621` |
| `panel_undocked.guard.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/panel_undocked.guard.json` | `c46083368eccc8dc96bbcec6f11bda494249392d17489fe0fed37bb9faa0833d` |
| `alert_acknowledged.cli.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/alert_acknowledged.cli.json` | `dc48cff99311b09aff54f8d6948a9c3db33ae9f1bed2f71434c0d48c1ee07fb0` |
| `alert_dismissed.cli.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/alert_dismissed.cli.json` | `b452be43da2892c184d30839d181e71796577072b390bb957ba4e4d1c1025645` |
| `alert_rule_muted.cli.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/alert_rule_muted.cli.json` | `60f68ccd8d5c953c4c77791cf00f5c8630da073de9f25dc7335d4d665ad6c7d3` |
| `alert_snoozed.cli.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/alert_snoozed.cli.json` | `096b7774144d78dea4d9415b02e0a002ac9f96f1e771324ad8bae77ebd8fa452` |
| `concern_created.cli.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/concern_created.cli.json` | `550372547da81db195d61d9c953c457ef04f2227dcbaf2a8e2cc91d6bd20c551` |
| `panel_redocked.cli.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/panel_redocked.cli.json` | `6c4a2399543fac5152c60154e4736192581a50de6a030aee5569b9ef8ff8d9dd` |
| `panel_undocked.cli.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix6/panel_undocked.cli.json` | `eb4d99300f56b6fecba2fb55532ffe9f9c7ba1b23e7bd638bf1e277523a6b9f9` |

## Earlier rounds (unchanged historical record)

# DG6A — post-Astra technical fix round 5

Worker: DG6A-FIX5, VM. Branch: `plans/ea-w2-gui-concerns-20261104`. Reviewed head: `370e7718684f2bcb025dafa3a3993091a96a49fd`. Technical commits: `e0102de48fd3d5ce199473f3ac91e6ee425af973` (independent counters and six source-comparison helper guard proofs), `6780aafe6c6383459386d50d7807211760bb679a` (type-exact proofs and historical source joins), `50d7f966de` (optional command presence and instant ordering), `b65638d1a610f4abc9ab4662aa96fcae7e608c33` (B1–B3), `74cbca0ca4` (new generated registry shards), and `87628f167daf8372a65ba652c2fd4371ae63d651` (independent protocol witnesses). The final report commit is self-inclusive. This section supersedes round 4's oracle-grade claims; earlier records and all nine stopped questions remain below unchanged.

Seven families remain **prepared without admission**, each **10 PASS / 1 PARTIAL / 1 ABSENT** after repair, versus Astra's **9 PASS / 2 PARTIAL / 1 ABSENT**. Criterion 12 is restored with current-operation and whole-lane guard witnesses. Membership remains ABSENT, retention PARTIAL / `PENDING_RETENTION_DECISION`, and native execution NOT_RUN. No new retention, creator, lifecycle, or stopped-family policy is chosen.

## Review round 5: findings and responses

- **B1 — fixed (`b65638d1a6`, `87628f167d`). Where:** the four alert operation schemas/fixtures, SP-660..663, storage registry embedded schemas, and `scripts/pm-alert-event-contracts-check.py` (`operation_errors`, `request_digest`, `protocol_errors`). **Cause:** only shape/bytes were checked; all operation identities and digests were placeholders, and source refs disagreed with payload refs. **Fix:** each family's original normalized command is retained in a closed private snapshot; the exact canonical MessagePack command/payload preimage is specified separately in each existing owner. Event identity and operation digest are recomputed from the existing per-family Storage/Project/family/key array. Request digests are recomputed over the complete retained preimage. Original command, Project/key, subject/source, prior/result revisions and states, unchanged snapshot fields, unread/inbox effects, root cause and original deadlines join field by field. Same-key retry bodies are compared against retained original inputs. Forged IDs, arbitrary digests, foreign or contradictory snapshots and incorrect action effects have isolated witnesses. No digest is repaired while validating an input. The final strict-guard commit `50d7f966de` also rejects an optional payload field omitted from the retained command, and the converse optional command-only mismatch, with isolated negatives.
- **B2 — fixed (`b65638d1a6`, `87628f167d`). Where:** both panel fixtures and `scripts/pm-panel-event-contracts-check.py`, with the guard runner. **Cause:** host snapshots, detached window and original result/receipt joins had no isolated current-operation witnesses; Home and successor checks were also unprotected. **Fix:** each host snapshot's session, host, revision and window, all three result/receipt links, command/payload and scope joins, Home context, application key and successor boundary are exercised independently. The original event identity in protocol evidence is also joined to the retained operation, preventing coherent forgery of both supplied receipt IDs. The redock window comparison deliberately repeats its generic command/window join; both are named and removed together for that witness.
- **B3 — fixed (`b65638d1a6`, `87628f167d`). Where:** concern checker and fixture (`operation_errors`, `protocol_errors`, `isolated_cases`). **Cause:** unauthorized creators retained stale retry digests, while changed-body tests also broke unrelated joins. **Fix:** all unrelated command/record/retry commitments are reconciled before testing creator authority; every original authorized creator remains positive. A digest-only case changes no source object. Command, record, scope, creator/actor, revision-one ref, authority and receipt seams have separate witnesses. The old no-change alert/panel cases now use schema-valid equal revisions, so they exercise succession alone. Protocol vectors retain their own independent originals, preventing optional-array positives from leaving a borrowed original stale.
- **N1 — retained generator exception.** Regeneration uses the copied, hash-verified ignored currentness edition; no timestamp is hand-restamped. Only the edited Storage owner and registry have changed shards. Index artifacts are regenerated normally; their existing `generated_at_utc` exception remains disclosed. No governance reseal occurs.
- **N2 — pre-existing, unchanged.** The Assistant test file still runs 41 tests with exactly the two failures Astra reproduced at the pre-lane base: `test_definitionless_records_stay_blocked` and `test_live_equivalent_negatives_fail_for_intended_reason`. No test or unrelated Brainstorm/scheduling owner is changed in this round.

## Family grades before and after

| Family | Astra at 370e771868 | Round 5 | Remaining boundaries |
|---|---|---|---|
| alert.acknowledged | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | admission absent; retention pending; native NOT_RUN |
| alert.dismissed | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | same |
| alert.rule_muted | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | same |
| alert.snoozed | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | same |
| concern.created | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | same |
| panel.redocked | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | same |
| panel.undocked | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | same |

## Check 11: whole-lane guard-removal proof

The [guard-removal table](DG6A.guard-removal.md) records each guard, flipping witnesses, remaining rejections and named duplicates. The hashed JSON evidence contains every name and diagnostic, including the exact complement of each flipping set.

- **247/247 guard rows pass:** 148 current-operation/payload/protocol/checkpoint/profile/schema/pager/source-comparison rejection sites across the three checker contexts; 99 historical rows, eleven guards across nine reader versions.
- **702 nonhistorical negative vectors** produce **35,036 source-removal trials**. Every negative has a singleton witness or a named duplicate proof. No unrelated pair is used to excuse a masked defect.
- **54 duplicate witnesses / 11 pair matrices** cover replay-only versus generic unsupported-policy refusal, schema representation versus exact digest equality, the concern embedded/standalone payload schema, and redock's repeated window comparison. Every paired removal is swept across the full relevant negative set. All 55 changed-but-still-rejected diagnostics have named duplicate proofs; unrelated rejections retain their own reason.
- **513 historical negative vectors / 5,643 cross-guard trials** prove exact original Storage/event/payload/receipt/source/publication and current disclosure guards. **18 positives** retain current/v1 originals, including replay-only history, with live state absent. Existing returning-helper revocation vectors continue to exercise the second disclosure fence.
- Source-comparison helper guards have six additional direct witnesses per family: exact type, object keys/children, array length/children and scalar value. The leaf counter has its own type comparison and does not call the authentication helper, so helper weakening cannot be masked by a changed counter. Missing first-receipt sequence fields also have composed-reader witnesses. Each mutant is compiled only in memory and the exact original function is restored in `finally`. The shipped checker retains every original guard and adds joins. The new vector assertions run through the normal three checker entry points.

## All nine Astra defect classes, all seven prepared families

The scope of every row below is explicitly all seven families in the grade table. Each family runs its own fixtures, schemas, operation, original evidence and reader. The full CLI regression separately mutates each exact family rather than inferring one sibling's result from another.

| Astra class | Alert acknowledged / dismissed / rule_muted / snoozed | Concern created | Panel redocked / undocked |
|---|---|---|---|
| 1 Forgery/contradiction | Recomputed event/operation/request digests; command and every snapshot field/effect witness | Recomputed identity/request digest; command, Project/key, creator and every candidate-record field witness | Recomputed identities/digest; command, both hosts/windows, result/receipt and coherent original-ID forgery witnesses |
| 2 Assigned metadata | Independently retained Storage event identity/sequence/observed/persisted time and all receipt leaves, with type-exact source joins | Same per-family Storage evidence | Same, for both current and immutable v1 readers |
| 3 Historical direction | Valid retained current/replay-only originals survive absent/changed live state; forged/foreign/withdrawn inputs fail | Same; existing concern does not invalidate its original | Same; ended session/closed window do not invalidate current/v1 originals |
| 4 Two representations | Integer, uppercase, spaced and LF digest probes; exact recomputation refuses each. Snooze offsets are parsed as instants, with past/equal/future offset witnesses in both predicates | Same; proof flags require literal Booleans and Storage maxima require integers | Same; proof flags/Storage maxima are type-exact; application keys retain CV-366 exact lowercase UTF-8 hex |
| 5 Unresolved refs | Eager whole-schema traversal, including unused definitions; metaschema and dangling-ref source removals | Same, including embedded record/payload branches | Same, including current and immutable v1 schemas |
| 6 Partial size limit | Complete canonical MessagePack operation, checkpoint and response measured; 16384/16385 boundaries; oversized metadata refused | Schema-valid multi-array stress updates all copies/digest and still fails only the complete operation cap | Complete operation/checkpoint/page cap witnesses; no fixed overhead allowance |
| 7 Missing custody path | Retry source/receipt joins plus original read evidence; wrong event family refused | Authority/source/receipt/retry joins plus original read evidence | Source/session/window/retry and original receipt joins plus original read evidence |
| 8 Masked negatives | Guard matrix, schema-valid successor witnesses, independent originals | Reconciled creator/retry copies; digest-only and field-specific negatives; matrix | Separate host/window/result/Home/successor negatives; named redock duplicate; matrix |
| 9 Overgraded cells | PASS only for the tested static contract; admission ABSENT, retention PARTIAL, native NOT_RUN | Same; five existing creators preserved, no stopped transition privilege applied | Same; immutable v1 remains reader-only |

Source hashes in historical fixtures are synthetic independently supplied Storage witnesses; native source authentication remains NOT_RUN. The original event and receipt are never reconstructed from a candidate. Physical guards measure every complete stored operation/checkpoint and emitted page, and the semantic producer digest excludes Storage-assigned metadata. The unchanged per-family SP-337 route externalizes event bodies above 16 KiB; it never permits an oversized mandatory operation value. A class-4 probe also found that lexically compared RFC3339 deadlines could accept an offset timestamp already before, or equal to, the original ts. `50d7f966de` uses one instant comparison in payload and operation predicates; the wrong-interpretation mutant reintroduces lexical comparison and admits exactly the four new offset negatives. Current writer/retry always refuses `projector_replay_only`; that rule never reaches the historical original.

The final class-4 probes reproduced **58 accepted malformed current proof/profile representations** across all seven families. `6780aafe6c` requires literal Boolean authorization/absence/protection facts and integer Storage maxima. Historical joins now compare nested values **and types**; 63 Boolean/integer/float forgeries across all nine reader versions reject for their own guard, while a deliberately coercive comparison mutant discloses each. The leaf-change counter also distinguishes these types. Current writer predicates still never reach a retained historical original.

## Authority, search and unchanged stops

Per-family pinned searches across Storage, Contracts, FinalGUISpec, UI_Command_Catalog and Automated_Testing_System found no existing closed alert `original_command` field at 370e771868. Each existing identity array, command/handler, owner transition and source/currentness fence is reused; the exact private normalized snapshot/preimage is newly authored separately under SP-660, SP-661, SP-662 and SP-663. The public payloads and command signatures remain unchanged. `alert-binding-search.json` records the scope, source lines and negative schema evidence for each family. Earlier checked DL-045/DL-076/DL-188 premises remain applicable; no retention answer is extended.

**All nine stopped families remain exact:** bundle.annotation_state_changed, bundle.note_created, bundle.note_status_changed, concern.assigned, concern.evidence_linked, concern.promoted, concern.reopened, concern.resolved and concern.updated. Their grade rows and questions/recommendations below are unchanged. No admission, registry append, Decision Log entry, new PlanUnit ID, governance artifact or main push occurs. IDs used remain **SP-660..666, CV-680..686, F3-700..705, ATS-330..334** (25 existing definitions).


## Round 5 verification and evidence

Technical input head: `e0102de48fd3d5ce199473f3ac91e6ee425af973`. The 700-observation broad regression ran with its inputs frozen at `87628f167d`; the 18 focused CLI cases then verified the optional-field and offset additions at `50d7f966de`. After the final type-exact changes, all three complete family checkers and the entire source/historical removal matrix pass again. The 63 historical representation observations run the actual composed readers with an independent coercive-comparison mutant, without weakening the leaf counter. No older result is represented as a full CLI rerun at the final head.

| Check | Exit/result |
|---|---|
| Alert checker | 0 / pass; 1170 cases, four families |
| Panel checker | 0 / pass; 652 cases, two families including immutable v1 readers |
| Concern checker | 0 / pass; 456 cases |
| Whole-lane guard runner | 0 / pass; 247 guard rows, 702 nonhistorical negatives, 513 historical negatives, 11 paired matrices |
| Broad CLI regression | 0 / pass; 700 observations, including 403 real CLI calls |
| Focused CLI regression | 0 / pass; 18 real CLI calls, 10 refusals and eight optional-array positives |
| Historical type interpretation mutant | 0 / pass; 63 exact own-guard refusals, each disclosed only by the deliberately coercive mutant |
| Offset interpretation mutant | 0 / pass; four isolated offset negatives accepted by the former lexical predicate |
| Grade/citation/hold audit | 0 / pass; 16 rows, 541 current citations, nine stops unchanged |
| Shard generate/check; index generate/validate | 0 / pass; top-level JSON status parsed; currentness edition's 15 files SHA-256 matched before generation |
| Assistant test file | 1; 41 tests, exactly the two pre-existing N2 failures |
| Boundary/input audit; git diff --check | 0 / pass; only four alert operation registry schemas changed, no profile rows changed, no forbidden paths or new IDs |

The initial optional-array CLI replay found a stale borrowed protocol original; its interrupted run is not counted as passing. Explicit independent protocol witnesses repaired that construction before the completed 700-observation rerun. The final strict additions found by the requested Astra-class probes add rules and negatives; they remove no existing valid rule.

Initial resources: 13 GiB available RAM / 116 GB root disk free. Final check: 7 GiB / 91 GB. No subagents, messages to other threads, browser, server, main push or governance reseal. The detached sparse worktree is removed after the final report push; retained evidence and reports are copied to the draft folder.

| Retained evidence | Absolute path | SHA-256 |
|---|---|---|
| `guard-removal.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/guard-removal.json` | `4e1b71edc2904e88e5f2046022136e87ea5c9c1ae955ca814da74846b51f2029` |
| `guard-summary.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/guard-summary.json` | `17b38320013f6f4a62ca79d26ca1b09d25dffd4169778c79318107ed2a9947ec` |
| `full-cli-mutations.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/full-cli-mutations.json` | `75d6bbaa3676db7983341f3d0596d76958348308919034e4c135450a06d85fdc` |
| `final-cli.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/final-cli.json` | `e9cb51c6f8f9d7e8d6a00a1441bc1565c2339aa664cde32bfebd75317ee7eb75` |
| `typed-inputs-before.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/typed-inputs-before.json` | `576a2214ae0bcb61f32884050af09d5ce0572da10c740844c13852f9caf06f03` |
| `historical-representation-probe.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/historical-representation-probe.json` | `6451d522dbb62ec4c16dda42afff1c90705edac5e2af3c2f027c014f872576e8` |
| `representation-probe.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/representation-probe.json` | `04203bfbf9e1a02ce5ca6263305d8e9a517b33bfe1b3c9de6b4daa8b866e1f56` |
| `boundary-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/boundary-audit.json` | `c5394848df32adc68f07129e06c90d8c935369ff85d18a9903a2685ef630e25d` |
| `alert-binding-search.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/alert-binding-search.json` | `8e774284a0a8639a5b0ae78fbe127423dc428e4a1da491f25f52522c6d81c42d` |
| `currentness-copy.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/currentness-copy.json` | `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84` |
| `review-evidence.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/review-evidence.json` | `e98c678640a9332b20390a8cacecd90d66b832f64c842c2884e6d934125ea7d6` |
| `grade-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/grade-audit.json` | `e673d3b8b7c02c0dc158f9aa7b1f79de8622d2d07e368cb5625f0304fa824457` |
| `alerts.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/alerts.log` | `3fb03e13b1754c8b753da6651205994686faf373868692a210337ae80483f53c` |
| `panels.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/panels.log` | `4381506461cc2d4ddafab8725308f771ec4c03a0de9e3e5cdaed900aa6c1f196` |
| `concern.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/concern.log` | `394fd4143a3567424d3b704d3d1606149716339af93fbe81b532ff13a3e9cab3` |
| `assistant-tests.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/assistant-tests.log` | `ec1eb8cc809b5a847c88c7459bb47f169b4c1a3115bcee66643a6b76317d1c89` |
| `shard-generate.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/shard-generate.json` | `32a149ab6029e00e969dad0c0c34dec8d8559259481c573d0387cd6050928d52` |
| `shard-check.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/shard-check.log` | `48c1f857e2193456e9db56b97c616373bfca9a7db703b6ebe4b0efe2ae378363` |
| `index-generate.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/index-generate.json` | `5aff95b150b6a7fea98fbb9794671240dc785886f4f1745e74a361008eb5c32f` |
| `index-validate.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix5/index-validate.json` | `f4514cf8c856e212bb47a90831ad2bfa3661df07c1d10f918f150669a629393d` |

## Earlier rounds (retained record)

# DG6A — standing-check fix round 4

Worker: DG6A-FIX4, VM. Branch: `plans/ea-w2-gui-concerns-20261104`.
Reviewed head: `de28e8be91b347e209f8b75e25838ef3bf686f73`. Repair commit: `8142c5bfa35e47b011ae7e8ff0ae8452e30e189c`. The final report commit is self-inclusive.

Seven families are prepared without admission. Each recovers the historical-oracle cell from the cycle-4 review's PARTIAL to PASS. Membership stays ABSENT, retention stays PARTIAL / PENDING_RETENTION_DECISION, and native execution stays NOT_RUN. All nine stopped family records and their exact final question/recommendation pairs are unchanged.

## Family grades before and after

| Family | Cycle-4 independent review | Round-4 self-grade |
|---|---|---|
| `alert.acknowledged` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.dismissed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.rule_muted` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `alert.snoozed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `concern.created` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `panel.redocked` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `panel.undocked` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |

All other cells carry forward after current-citation verification. All 534 final citations resolve. No native or event admission is claimed.

## Review round 4: findings and responses

1. **Blocking 1 — fixed (`8142c5bfa35e47b011ae7e8ff0ae8452e30e189c`). Where:** `scripts/pm-alert-event-contracts-check.py:196,228,268,367`, `scripts/pm-panel-event-contracts-check.py:121`, `scripts/pm-concern-created-contracts-check.py:103`, each of the seven exact family's fixtures, and `scripts/pm-dg6a-final-regression-check.py:187`. **Cause:** the prior byte pager never consumed actual checkpoint publication state and original-event evidence. **Fix:** the read-only historical gate validates the actual checkpoint and independently supplied original event/payload/schema, original eleven-field receipt/four-field result, Storage/source selection and current disclosure permissions/deletion/withdrawal. It feeds only accepted refs into pagination and rechecks after the helper returns. It does not invoke current writer/retry predicates. Superseded alert/rule revision, ended panel session/closed window and already-created concern positives remain readable while the respective writer models refuse new actions. Each exact family refuses withdrawn/staged checkpoints and events, forged publications/tokens/originals/payloads/receipts/source, foreign Storage/Project/consumer context, unknown payload version and originally invalid writes. Panel v1 and v2 are dispatched by their stored payload id/version; both immutable v1 schemas are unchanged. Verify with the three family checkers and the full regression command below.

   Each historical version has 26 one-leaf negative vectors plus five returning-helper revocation cases. Every one fails for exactly its named guard, then discloses through the same reader and byte pager when only that guard is weakened. Permission includes current membership and original source access. The event `state` in this synthetic read-evidence wrapper describes publication availability, never a new EventRecord field or live owner lifecycle. Exact-16384-byte ACTUAL-checkpoint positives are tested before isolated negatives use a separately declared compact publication witness; otherwise changing current to withdrawn would also exceed the byte cap. Neither physical bounds nor state schemas are weakened. Stored withdrawn/staged states remain valid storage lifecycle values but cannot authorize disclosure.

2. **Note 2 — addressed in this report.** No generated timestamp is hand-edited and no governance artifact is refreshed. Pinned no-edit regeneration leaves all 3325 shard files and both JSONL indexes byte-identical. The same four JSON artifacts change only `generated_at_utc`: coverage_report, dependencies, doc_cards and node_readiness_report. This pre-existing timestamp exception is retained explicitly.

## Per-family standing checks

P = pass. F = fixed by `8142c5bfa35e47b011ae7e8ff0ae8452e30e189c`. † = Project-only family: an application attempt is refused; no application writer is invented. Each cell links to actual observations in `standing-checks.json` and `full-cli-mutations.json`.

| Family | 1 replay | 2 app key | 3 partition | 4 bytes/ref | 5 LF | 6 semantic | 7 context | 8 exit | 9 refs | 10 history | 11 isolation |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `alert.acknowledged` | P | P† | P | P | P | P | P | P | P | F | F |
| `alert.dismissed` | P | P† | P | P | P | P | P | P | P | F | F |
| `alert.rule_muted` | P | P† | P | P | P | P | P | P | P | F | F |
| `alert.snoozed` | P | P† | P | P | P | P | P | P | P | F | F |
| `concern.created` | P | P† | P | P | P | P | P | P | P | F | F |
| `panel.redocked` | P | P | P | P | P | P | P | P | P | F | F |
| `panel.undocked` | P | P | P | P | P | P | P | P | P | F | F |

| Check | Verification |
|---|---|
| 1 | Current writer/retry projector_replay_only remains replay_only_not_appendable; false positive-policy expectations exit 1 per family. |
| 2 | Both panel application positives use CV-366's exact application@1 lowercase UTF-8 hex recipe; malformed/unequal/uppercase/raw keys exit 1. Project-only null-Project attempts exit 1. |
| 3 | Encoded project~Zml4dHVyZQ positives remain; raw Project partition mutations exit 1 per family. |
| 4 | Schema-valid complete operations above 16384 bytes exit 1; alert exact 16384/16385 boundaries remain. All seven unchanged owner contracts use SP-337 payload refs above the EventRecord inline cap; oversized metadata is still refused. |
| 5 | Payload identifier and nested token trailing-LF mutations exit 1; existing suites exercise every authored pattern leaf with full-string guards. |
| 6 | Altered caller bodies cannot retain the same digest; changes only to assigned sequence/observed/persisted metadata cannot change it. False expectations exit 1 per family. |
| 7 | Single foreign token and coherent checkpoint/token/source Storage triple mutations exit 1, independently of the original operation. |
| 8 | A negative marked valid and a real process exit 0 supplied to the failure-oracle entry point both exit 1. All process negatives compare actual exits. |
| 9 | Every schema and embedded-schema unresolved-ref mutation exits 1; all eight permitted nonempty alert optional-array positives exit 0/status pass. |
| 10 | Actual withdrawn/staged checkpoint and event mutations, original evidence forgeries, foreign contexts and denied disclosure fail. Originally valid retained refs survive live owner changes. Both panel historical v1 readers pass the same composed suite. |
| 11 | All 279 historical negative witnesses (31 per reader version, nine versions) change exactly one leaf, fail exactly one guard and disclose only after that guard is weakened; the 18 live-change positives pass. |

## Earlier findings rerun

All **221 earlier observations pass again**, with their original required exits: 202 refusals and 19 successes. Added historical coverage produces **700/700 total observations**: 403 full CLI runs (384 exit-1 refusals, 19 exit-0 successes) and 297 composed historical/isolation observations. Mutated inputs are restored byte-for-byte in finally and SHA-256 verified.

| Earlier finding | Rerun result |
|---|---|
| A1 physical profiles | Every operation/checkpoint, both shared alert states and concern_record profile removal is refused (17 probes). |
| A2 bounded History | All seven refuse 1000 accumulated refs, persisted redb_snapshot_id and oversized complete checkpoints; exact 16384 positives pass (28 probes). Existing large-token, complete-response boundaries, unpageable ref/metadata, 1000-match and empty-filter continuation cases remain. A legitimate changed positive token carries its independently supplied matching publication witness. |
| A3 panel semantics | Generic panel, saved host, layout co-emission and historical-v1-as-current-writer mutations are refused (8 probes). |
| A4 authorized creators | Worker/User/External Resource/Recovery/Observer changes update both creator fields and recompute the full digest; all five are refused. Existing authorized creators remain positive. |
| A5 grades/citations | Each false retention-PASS and wrong CV-049 annotation citation is refused; the unmodified 534-citation/nine-hold audit passes (9 observations). |
| Full panel digests | Both unchanged-digest timestamp/transaction mutations remain refused per panel (4 probes). |
| Cycle-3 checkpoint/alert/ref findings | Exact coherent foreign triple, two 17000-byte owner refs and unused unresolved refs remain refused; permitted alert arrays remain positive. |
| A6 known authority | All nine stopped records and final question/recommendation pairs remain exact. No creator, owner or resolver privilege is added. |

## Nine stopped families: unchanged decision-card questions

Each row remains STOPPED_FOR_JARED. Its exact question and recommendation are copied unchanged from the reviewed report; all recommendations remain unapplied. Existing lifecycle, creator/owner/resolver separation, GUI/runtime split, permissions/currentness and blocking-promotion prerequisites stay fixed.

| Family | Final narrowed question | Review recommendation — unapplied | Current evidence |
|---|---|---|---|
| `bundle.annotation_state_changed` | Which exact serialized identity governs durable annotation creation/status changes: the split bundle.note_created/bundle.note_status_changed identities, a distinct bundle.annotation_state_changed, or approved co-emission? If the generic spelling is compatibility-only, what verifiable mapping applies? | Use the existing split native identities: one bundle.note_created per creation and one bundle.note_status_changed per real status transition. Make bundle.annotation_state_changed a compatibility spelling only after an explicit verifiable mapping is approved; no duplicate co-emission, and quarantine ambiguous legacy data. | `Plans/Contracts_V0.md:907` (CV-077); `Plans/Contracts_V0.md:951` (CV-077 / event catalog); `Plans/storage-plan.md:1170` (SP-095) |
| `bundle.note_created` | For a durable annotation creation, is bundle.note_created the sole event, or is a distinct generic annotation event also required? What approved read mapping, if any, relates the generic spelling? | Emit one bundle.note_created for durable creation, preserving annotation id/provenance; no additional generic event for the same mutation. note_record.v1 compatibility lineage does not itself decide an EventRecord alias. | `Plans/Contracts_V0.md:907` (CV-077); `Plans/Contracts_V0.md:951` (CV-077 / event catalog); `Plans/storage-plan.md:1169` (SP-095) |
| `bundle.note_status_changed` | For a committed annotation lifecycle change, is bundle.note_status_changed the sole current spelling, or is a distinct generic annotation event required? What approved compatibility mapping applies? | Emit one bundle.note_status_changed for each real committed lifecycle transition, preserving open/addressed/still_open/cannot_apply/resolved; generic annotation spelling becomes compatibility-only only after Jared approves the mapping. | `Plans/Contracts_V0.md:907` (CV-077); `Plans/Contracts_V0.md:951` (CV-077 / event catalog); `Plans/storage-plan.md:1170` (SP-095) |
| `concern.assigned` | Which actors may commit concern owner reassignment, which may only request it, and when is additional confirmation required? Concern identity and separate creator/owner/resolver roles remain fixed. | Accountable runtime or scoped package/seam authority commits; others request. Require reason, original/new owner and authority evidence, preserve identity, and require strong confirmation for a cross-authority transfer. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8573` (UCC-147) |
| `concern.evidence_linked` | Which actors may commit additive concern evidence links rather than propose them, and does that addition require extra confirmation under existing permission/currentness rules? Destructive replacement/removal is a separate action. | Permit authorized user and accountable runtime/overseer additions through the owner command with current source-access and revision checks. Ordinary additive linking needs no extra confirmation; destructive replacement/removal needs a separate authorized action. Preserve who linked what. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8576` (UCC-147) |
| `concern.promoted` | Which scoped actors commit concern promotion versus request it, and which confirmation/HITL privileges remain for the user? Existing automation-first gate/evidence and critical/security/governance rules stay fixed. | Scoped runtime/overseer commits after gate/evidence validation; a user requests promotion or answers a true HITL gate. Preserve automation-first promotion and explicit critical/security/governance gates. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8577` (UCC-147) |
| `concern.reopened` | Who may commit reopening, who may only request it, and what additional confirmation applies under existing critical/HITL policy? The new-evidence resolved-or-dismissed -> active transition and prior terminal lineage remain fixed. | Current accountable owner commits when new evidence invalidates the prior resolution/dismissal; user or worker may request. Require new evidence, reason and retained terminal lineage; confirmation only where existing critical/HITL policy requires it. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8575` (UCC-147) |
| `concern.resolved` | Which actors may commit evidence-backed true resolution or authorize accepted_risk, with which confirmation? Acknowledgement/dismissal remain distinct triage actions and cannot clear an active blocker; lineage edits remain guided and audited. | Scoped runtime/overseer records evidence-backed true resolution. Accepted risk requires an explicit authorized human decision and retained evidence. Preserve separate acknowledge/dismiss triage and guided, audited lineage edits. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8574` (UCC-147) |
| `concern.updated` | Which actors may commit operational severity/category/authority patches versus request them, and what additional confirmation is required? Existing current evidence, exact revision and consequential-change rationale rules stay fixed. | Accountable runtime/overseer commits operational severity/category/authority patches within scope; user/worker requests go through that owner. Require current evidence, exact revision and rationale for consequential reclassification, never a projection edit. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8572` (UCC-147) |


## Separate unapplied creator proposal (not a preparation blocker)

The following original question/recommendation is preserved as a separate proposed feature expansion. No new direct creator or additional confirmation policy is applied to canon.

| Family | Final narrowed question | Review recommendation — unapplied | Current evidence |
|---|---|---|---|
| `concern.created` | Beyond the already authorized runtime/package-overseer/seam-overseer/corroboration/graph-patch creators and worker nomination-only rule, may User or External Resource input directly commit a concern, or must an authorized owner accept its nomination, and with what confirmation? | Keep the already specified canonical creators. Worker, User and External Resource input is nomination until accepted by an authorized owner. Record creator separately from accountable owner. Do not re-ask whether the listed runtime creators may create. | `Plans/Orchestrator_Page.md:118` (OP-002); `Plans/Orchestrator_Page.md:176` (OP-002); `Plans/UI_Command_Catalog.md:8571` (UCC-147) |


## Authority, scope and IDs

No new PlanUnit ID or product binding is authored in round 4. Existing IDs remain **SP-660..666, CV-680..686, F3-700..705, ATS-330..334** (25 definitions). Existing exact-family owner contracts already require these historical-read fences; only their synthetic oracle composition is repaired.

Storage, Contracts, Orchestrator, Executor, FinalGUISpec and Automated_Testing_System owner docs are byte-identical to the reviewed head, as are storage/event registries, Decision Log and immutable panel v1 schemas. Previous per-family searches and checked premises remain applicable to these unchanged contracts; no old retention answer is extended and no Jared choice is taken. No admission, registry append, Decision Log, .gitignore, Spec Lock, .evidence, auto_decision, frozen validator, governance seal or main edit/push occurs. All previous writer, retry, byte and reference guards remain.

## Verification and evidence

| Command/check | Exit | Result |
|---|---:|---|
| python3 scripts/pm-alert-event-contracts-check.py | 0 | pass; 709 cases, four exact families. |
| python3 scripts/pm-panel-event-contracts-check.py | 0 | pass; 448 cases, two exact families including immutable historical v1. |
| python3 scripts/pm-concern-created-contracts-check.py | 0 | pass; 340 cases, concern.created. |
| python3 scripts/pm-dg6a-final-regression-check.py --output <evidence>/full-cli-mutations.json | 0 | 700/700 observations, all eleven checks per family and all earlier mutation probes. Executed repair head and restored input hashes are recorded. |
| Same runner --audit-grade-only | 0 | All 534 current citations resolve; nine stopped records identical. |
| pm-shard-plans.py --check / --generate / --check | 0 each | All 3325 shard files stable; 99 source documents. |
| pm-plan-index.py validate / generate / validate | 0 each | Parsed top-level status pass before/after; only four timestamp differences. |
| Boundary/input audit | 0 | Exact unchanged owner/registry/historical-schema comparisons; zero new IDs or forbidden paths. |
| git diff --check | 0 | No whitespace errors. |

The mutation runner uses the exclusive assigned worktree. Derived regeneration uses a selective pinned scratch extract to avoid reading the runner's temporarily mutated fixtures. Its first incomplete-input validation stopped before generation; the review's unchanged pinned read transport supplied missing tracked references for the complete rerun, without changing parsers, schemas, validators or assertions. That extract used 195679367 bytes and is deleted. Every ignored currentness-edition file was copied and SHA-256 matched before generation.

| Evidence | Absolute path | SHA-256 |
|---|---|---|
| `full-cli-mutations.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/full-cli-mutations.json` | `46abe5b46c3a7db4eca6ea533906a7c1f684f87d6d875484ea3de1274a496102` |
| `standing-checks.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/standing-checks.json` | `62c584227106fd9811678f448baf19fcf3cf27ecba9d2c7f12478fadc332cf35` |
| `targeted-checks.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/targeted-checks.json` | `3adf0208d7d539f6d200afadac8e1c0c461ac3b515bd1f1e1765998efb752527` |
| `boundary-audit.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/boundary-audit.json` | `41158df3c647e73282abf8cb623d31a91a3df7b30ed3626838b8bb0f1270dc3c` |
| `regeneration.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/regeneration.json` | `a5af23fcff8a488712e876a353ad868a299824def005aaaba27db7b1aa760a0d` |
| `history-coverage.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/history-coverage.json` | `5cf310a7c52524dff73cf5d833aa521fa837484429501613116af70b4c0386cd` |
| `currentness-copy.json` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/currentness-copy.json` | `1b765b9ac2ab42d60576eba5c1f1edd03454965e434717497da8cbcf32c009bf` |
| `derived-inputs.jsonl` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/derived-inputs.jsonl` | `02a14215862d54254884b213e6a1825d02dd1d4dec3cb80e43a957b9eaecd2d9` |
| `index-incomplete-extract.log` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6A/fix4/index-incomplete-extract.log` | `8102db82dd39e69875698e03d6a00cb906b13f09129d6bf680cfe2f1e1dfe06d` |

Initial resources were 18 GiB available RAM and 89 GB root disk free; repeated checks remained above the required 6 GiB / 50 GB thresholds. Only the lane branch is pushed. The sparse detached worktree is removed after final push and evidence copies. No pm-mail, subagent, browser or server was used. Remaining open facets are the allowed pending admission/retention, native NOT_RUN, and the same nine Jared decision holds.
