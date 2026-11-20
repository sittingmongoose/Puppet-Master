# Lane DX — sweep part 2B (shared CV-1101 date-time check)

Branch `plans/ea-w2-executor-20261104`; part 2A head `35f2cfd65b`; gated NUMRULE merge `f025ad6e74` (exact commit `58c2816ff3`, never the branch head); implementation commits `183f4c36bd` (adoption), `cfa0aad472` (witnesses), `bb67fb0573` (owner text, shards, index); the delivery head is in the external `HEAD.txt`. No rebase onto main this round.

**All 16 families: 176 PASS / 0 PARTIAL / 16 ABSENT** (part 2A: 175 / 1 / 16). DX had already merged the number scope in part 2A, so part 2B is date-time only. Every DX timestamp field is now checked by the shared `pm_event_datetime.date_time` predicate with an explicit profile per field, and the timestamp review is **no longer interim** for those fields (table below). F19 is closed: scheduler ready-since and wake clocks admit a lowercase `t`, backoff clock observations keep the uppercase `T`, and `scheduler.pass`'s oracle cell moves from PARTIAL to PASS. The gated guard tool proves **285 of 291 rows** in 114 tables at `cfa0aad472`; the 6 unprovable rows are the same six as in part 2A, each alone in its table. `datetime_validator` and the whole-`Plans/` inventory gate are not called in this lane tree (lead addendum 2): both refuse here only because of hash drift from the lane's Plans edits, and they run at batch-2 integration. Membership stays ABSENT; native execution is NOT_RUN.

**Readiness:** NOT_READY (prepared for the batch-2 review). Both part 2 halves are done (guard tables, numbers, date-time). Still open, and owned by batch-2 integration: the rebase, the date-time inventory and exclusions refresh followed by `datetime_validator`, the inventory gate and the combined self-test, the census pins, and the Sol max then Astra max review of the batch. Nothing is stopped for Jared.

## Sweep part 2B: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Merge the gated NUMRULE head** | Head confirmed at the part 2A head `35f2cfd65b`, then `git merge --no-ff 58c2816ff33365384d4039553f5efdb5370930e6` as `f025ad6e74`. No conflict of any kind: the merge brought exactly the 7 date-time files that changed on NUMRULE between `a16f67c1ef` and `58c2816ff3` (`scripts/pm_event_datetime.py`, `_inventory.py`, `_mutations.json`, `_mutations.py`, `_node_controls.json`, `_selfcheck.py`, `reports/event-authority-20261104/NUMRULE.md`), none of which DX ever edited, and no Plans file, so nothing was regenerated for it. Neither addendum 1 resolution was needed. No NUMRULE file is edited afterwards. | merge `f025ad6e74` | `git diff --stat f025ad6e74^1 f025ad6e74` lists those 7 files; for each of them and `pm_event_numbers.py`, `pm_event_numbers_corpus.py`, `Plans/event_number_recipe_corpus.json`, `Plans/event_datetime_inventory.json`, `scripts/pm_event_datetime_exclusions.json`: `git diff --quiet 58c2816ff3 HEAD -- <path>` exits 0 (`numrule-identity.txt`). |
| **F19 / CV-515 field-owner profile** (fixed, `183f4c36bd`, `cfa0aad472`) | Scheduler ready-since clocks (`validate_score_domain`, the capture and shape scheduler sorts) and wake clocks are ordinary DX timestamps: `[Tt]` through the shared predicate. Backoff clock observations keep the uppercase `T`: every clock `validate_retry` compares (failure, receipt, scheduling, observation, refresh, rebuild, both `backoff_until_utc`) and the shape oracle's backoff clocks call `instant(..., backoff=True)` (row TC05). The reading follows cycle 10's fix text ("preserve `[Tt]...Z` for ordinary scheduler timestamps and the existing uppercase-T restriction for backoff clocks"); a wake clock is a wake clock whatever its reason, including `backoff_expired`, because it orders wakes and is never compared with a backoff deadline. Coherent positives: `F19-control-ready-since-lower-t` (every copy: payload, inline envelope, operation and scheduler records, transition mirror; rehashed), `F19-control-wakes-lower-t`, `F19-shape-control-ready-since-lower-t`, `F19-score-control-lower-t`. The two contrary negatives `F19-wake-0-lower-t` and `F19-wake-1-lower-t` now expect accept. | `scripts/pm_executor_event_semantics.py:664` (`instant`), `:781` (`validate_score_domain`), `:985`, `:997` (scheduler sorts), `:740`-`:778` (backoff clocks); `scripts/pm_executor_event_contracts.py:94`-`:102`, `:122`; `Plans/executor_event_p2a_cases.json:2982`; `Plans/executor_event_semantic_fixtures.json:464296`, `:464522` | `python3 scripts/pm_executor_event_semantics.py --family scheduler.pass` and `pm_executor_event_contracts.py --family scheduler.pass` exit 0; the four controls pass; `before-after.json`: the part 2A checker refuses all six F19 controls at `TS02_utc_route`. |
| **CV-1101 adoption at the DX timestamp boundaries** (fixed, `183f4c36bd`) | The lane grammar is gone (`UTC_TIME`, `valid_timestamp`, `calendar_valid`, row `TS02_utc_route`). Current owner clocks call `pm_event_datetime.date_time(value, profile=STORAGE_UTC_Z)` and refuse through the new table `clock_owner`: TC01 syntax/type, TC02 zone not a terminal `Z`, TC03 calendar, ranges and unannounced second 60, TC04 the DX owner's "no second 60" (an announced leap second the shared profile admits), TC05 the backoff uppercase `T`. The strict payload-schema boundary registers the same predicate explicitly as its `date-time` format checker (`strict_format_checker` → `timestamp_format`), so the schema refuses an announced leap second its pattern admits (`PS01-ts-announced-leap-second`). The exact instant is computed from the validated text over the proleptic Gregorian calendar (year 0000 included, every fraction digit kept, no host `datetime`), on the same epoch as the frozen v0 route. The isolated stock-schema route (`stock_schema_validate`, PS02) is unchanged: it isolates the schema patterns' exact-end guard (standing check 5) and is never a validation boundary. | `scripts/pm_executor_event_semantics.py:30` (import), `:470` (`strict_format_checker`), `:491` (`shared_date_time_refusal`), `:500` (`timestamp_format`), `:523`-`:541` (exact instant), `:664` (`instant`); table spec `scripts/pm-executor-table-generate.py:181`; `scripts/pm_executor_table_clock_owner.py` | Helper witnesses TC01–TC05 and controls (lowercase `t`, year 0000, 5,001 fraction digits); `own-probes.json` 58/58; the guard tool proves TC01–TC05. |
| **SP-1101 frozen date-time profile for history** (fixed, `183f4c36bd`, `cfa0aad472`) | The v0 date-time profile (the v0 spelling, its original clock parse and its email Retry-After route) is no longer chosen by `record_rules() == RETAINED_RECIPE` inside the format and clock code. `installed_recipes` installs, for each exact recipe tuple, `frozen_verifier(verify, version)`, which runs the original's verification under that tuple's frozen date-time edition; the dispatcher reaches it only through the original's authenticated tuple, so request data cannot select it. A stored `execution_unit_context` dependency body takes the edition its own authenticated custody records. Current disclosure and current writes always run the current edition. Witnesses: `TS-control-v0-zero-offset` and `TS-control-v0-lowercase-z` (retained v0 originals read under the frozen v0 profile), `TC02-current-edition-lowercase-z` (an original authenticated under the current edition refuses lowercase `z`), `TS01-v0-space-separator`, and the existing `TS03-v0-impossible-date`. The forged-edition controls RB01–RB05 and DD01 are unchanged. | `scripts/pm_executor_event_semantics.py:49` (`_DATETIME`), `:200` (`datetime_edition`), `:1121` (`installed_recipes`), `:1128` (`frozen_verifier`), `:1031` (dependency edition), `:682` (`v0_instant`); `Plans/executor_event_p2a_cases.json:3370` | All 1,345 history cases still pass; the four new history witnesses pass at their rows. |
| **Retry-After HTTP-date grammar** (fixed, `183f4c36bd`, `cfa0aad472`) | Current edition: a non-decimal Retry-After must match one RFC 9110 section 5.6.7 HTTP-date form as a whole (IMF-fixdate, rfc850-date, asctime-date; case sensitive), the grammar EP-032's "Retry-After … HTTP-date" names (table `retry_after_http_date`: RG01 grammar, RG02 a real date and time through the shared `date_time`). An rfc850-date's two-digit year is read in the receipt's century unless that is more than 50 years after the original `response_received_at_utc`, as RFC 9110 requires. The frozen v0 edition keeps its email-parser route and its rows RA01/RA02 (10a: a then-valid original stays readable). Before this, `email.utils` accepted five non-HTTP-dates (numeric zone, no weekday, one-digit day, two-digit IMF year, lowercase `gmt`) and refused the asctime form RFC 9110 requires recipients to accept. | `scripts/pm_executor_event_semantics.py:262` (`HTTP_DATE_FORMS`), `:270` (`http_date_text`), `:299` (`retry_after_deadline`), `:316` (`v0_retry_after_deadline`), `:756` (edition dispatch); `Plans/executor_event_p2a_cases.json:3830` | Witnesses RG01 ×5, RG02 ×1, rfc850 and asctime controls; v0 helper witnesses RA01, RA02 and a numeric-zone control; the century rule in `own-probes.json`. |
| **Other owners' date-time** (fixed, `183f4c36bd`) | `execution_unit_context.schema.json`'s `created_at_utc`/`updated_at_utc` are that schema's own `format: date-time`; DX now validates them with the shared broad `event_record` profile (RFC 3339: offsets, lowercase, announced leap seconds) instead of DX's own grammar. | `scripts/pm_executor_event_semantics.py:1031` | `DS-control-context-created-offset` (a `+05:00` offset accepted), `DS01-context-created-no-zone` (refused at DS01). |
| **SP-1101 retained-record dispatch (brief step 4)** | DX's dispatch was done in part 2A (S-N5); as for DF, it is checked against the gated date-time check, not redone: the date-time edition now rides on the same authenticated recipe tuple (row above). | as above | as above |
| **Owner text** (`bb67fb0573`) | Each CV-500..515 timestamp paragraph gains one sentence citing CV-1101: every current timestamp, at the payload-schema format boundary and every owner clock, is checked by the shared `pm_event_datetime.date_time` predicate under the `storage_utc_z` profile, then by the unit's stricter rules, and SP-1101 dispatch selects a retained original's frozen date-time edition. No rule changed. | `Plans/Contracts_V0.md:24622` (CV-500) … `:25432` (CV-515), at the end of each line | Shards regenerated: only `Plans/_shards/contracts_v0/**` changed (every shard carries the source hash); index generate: only Contracts_V0 plan units changed; shard check exit 0. |
| **Fixture expectations** (`183f4c36bd`) | 22 cases changed, each with a `date_time_rule` note: 18 year-0000 schema cases and the 2 F19 wake cases now expect accept; the two naive Retry-After helper cases are re-routed to the new current-edition helper (the negative now refuses at RG01). | `Plans/executor_event_semantic_fixtures.json` | `fixture-changes.json`; section below. |
| **Witnesses** (`cfa0aad472`) | 34 part 2B witnesses (19 negatives, 15 controls), built by the part 2A builder from named valid seeds: one changed fact, every copy moved, every changed owner record rehashed, kept only when the complete checker refuses at exactly the target row. Four new modelled originals get custody entries (`write_time_edition` `DX-sweep-p2a`); no existing entry changes. The builder now fails on a custody-entry collision (it had let one witness's original silently re-authenticate another's under a different edition while this round's witnesses were being written; caught and fixed before commit). The runner gained the `schema` (strict) and `score` routes. | `scripts/pm-executor-p2a-cases.py:479` (`build_p2b`), `:166` (collision guard); `scripts/pm_executor_p2a_cases.py:78`, `:81` | `python3 scripts/pm-executor-p2a-cases.py --check`: 110 witnesses, 10 custody additions, files current. |
| **Numbers (lane already on the number scope)** | Nothing to adopt. Rerun at this head: `--self-test --scope numbers` exit 0, `"status": "pass"`, 580/580; the shared number corpus through DX's complete routes: 6,432 route runs, 0 disagreements (1,840 accepted, 4,592 refused), unchanged from part 2A. | `scripts/pm-executor-number-corpus.py` | `selftest-numbers.json`, `number-corpus.json`. |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** no new PlanUnit, Decision Log or admission ID; CV-500..515 change in place. New witness IDs are the part 2B case IDs in `Plans/executor_event_p2a_cases.json` (listed in the witness table).

## Timestamp fields and the shared check that covers each

Profiles: **DX owner** = `date_time(value, profile=STORAGE_UTC_Z)` (whole string, `T` or `t`, Gregorian calendar including year 0000, hours 00..23, minutes 00..59, second 60 only where a leap second was announced, terminal uppercase `Z`, any number of fraction digits), then the CV-500..515 restriction "no second 60" (TC04, or the format predicate). **DX backoff** = DX owner plus an uppercase `T` (TC05). **Other owner** = `date_time(value, profile=EVENT_RECORD)`, the RFC 3339 `format: date-time` of the field's own schema. **Frozen v0** = the v0 spelling and the original clock parse, selected only for an original whose authenticated SP-1101 recipe tuple names `executor-json-integer-v0`.

| Field (families) | Boundary | Profile and shared check | Rows |
|---|---|---|---|
| Payload `ts` (all 16) | strict payload-schema format | DX owner: registered `date-time` predicate = shared `date_time` (storage_utc_z) + no second 60; the schema pattern `[Tt]…Z(?![\s\S])` stays as the owner's exact-end guard | PS01 |
| Payload `ts` (`run.node_backoff_started`, `run.node_backoff_expired`, `run.node_retry_scheduled`) | EP-032 retry and backoff comparison (`validate_retry`) | DX backoff | TC01–TC05 |
| Payload `backoff_until_utc` (`run.node_backoff_started`) | schema format; backoff comparison and shape oracle | DX owner at the schema; DX backoff at the comparison | PS01; TC01–TC05 |
| Payload `backoff_until_utc` (`attempt.completed`) | schema format (no comparison) | DX owner | PS01 |
| Payload `ready_since_utc` (`run.node_ready`) | schema format | DX owner | PS01 |
| Payload `ready_nodes[].ready_since_utc`, `selected_nodes[].score_tuple.ready_since_utc` (`scheduler.pass`) | schema format; score domain; capture and shape scheduler order | DX owner (ordinary: `t` admitted, F19) | PS01; TC01–TC04 |
| Source `scheduler.wakes[].recorded_at_utc` (`scheduler.pass`) | capture wake order | DX owner (ordinary, F19) | TC01–TC04 |
| Source `operation`/`scheduler` ready and selected score clocks (`scheduler.pass`) | score domain | DX owner (ordinary, F19) | TC01–TC04 |
| Source `failure.failed_at_utc`, `failure.response_received_at_utc`, `retry.scheduled_at_utc`, `retry.backoff_until_utc` (three retry families) | `validate_retry` | DX backoff | TC01–TC05 |
| Source `failure.refresh.completed_at_utc`, `failure.refresh.client_rebuilt_at_utc` (`auth_expired`) | `validate_retry` | DX backoff | TC01–TC05 |
| Shape context `now_utc`, `backoff_until_utc` (`run.node_backoff_expired`) | shape oracle | DX backoff | TC01–TC05 |
| Joined copies (inline envelope payload, `operation.body.observed_at_utc` = payload `ts`, transition `observed_payload`) | exact typed equality with the validated payload field | inherits the payload field's check; never parsed separately | source-join rows |
| Source `failure.retry_after_header`, HTTP-date form (`rate_limited`) | `retry_after_deadline` | RFC 9110 HTTP-date grammar (lane, EP-032), then shared `date_time` (storage_utc_z) on the named date and time | RG01, RG02 |
| Dependency `execution_unit_context` `created_at_utc`, `updated_at_utc` (`node.started` and every family that resolves it) | dependency schema | Other owner: shared `date_time` (event_record) as that schema's `format: date-time` | DS01 |
| Any of the above in a retained v0 original | the frozen verifier the SP-1101 dispatcher installs for the original's tuple | Frozen v0: v0 spelling, original clock parse, email Retry-After route | PS01, TS01, TS03, TZ01, RA01, RA02 |

DX models no EventRecord envelope timestamp (`occurred_at_utc`, `observed_at_utc`, `persisted_at_utc`): no DX schema or fixture declares one. Those fields stay with the EventRecord validator (CV-1101 `datetime_validator`, CV-253 `storage_utc_z`), which runs at batch-2 integration. The `deleted_at` and `event_deleted_at` deletion markers are presence checks (PK12, DC04, HD03 refuse any non-null value), so no timestamp is ever accepted there and no date-time profile applies.

## Fixture expectations that changed

Every changed case carries a `date_time_rule` note with its reason. Nothing else in the fixtures changed.

| Cases | Before → after | Reason (the case's `date_time_rule`) |
|---|---|---|
| `S12-calendar-ts-'0000-11-04T12:00:00Z'` (16 families) and `S12-calendar-backoff_until_utc-'0000-11-04T12:00:00Z'` (2), strict schema route | reject → accept | CV-1101: "Four-digit year 0000 and Gregorian century rules are handled without a narrower host datetime range." The DX grammar `[0-9]{4}` with Gregorian calendar validity admits year 0000; the old format checker refused it only because Python's `datetime` has no year 0. |
| `scheduler.pass` `F19-wake-0-lower-t`, `F19-wake-1-lower-t` | reject → accept | F19: CV-515 admits `[Tt]` for an ordinary scheduler wake clock; only backoff clock observations need an uppercase `T`. The old route refused them at `TS02_utc_route`. |
| helper `F10-naive-retry-after-valid` | accept → accept | Re-routed to the current-edition helper `retry_after_date` (value now names the receipt clock the rfc850 century rule reads). |
| helper `F10-naive-retry-after` (`Wed, 04 Nov 2026 12:00:30`) | reject → reject, reason `Retry-After date timezone` → `Retry-After HTTP-date` | RG01: an HTTP-date always ends in `GMT`, so a header without a zone matches no form; the old email route refused its missing zone at `RA02_date_timezone`, which now serves only the v0 edition. |

Every other expectation is unchanged: the existing timestamp negatives (offsets, lowercase `z`, space separators, missing zones, invalid days, unannounced leap seconds, empty fractions, trailing LF, backoff lowercase `t`) still refuse, now at TC01–TC05 or, inside a payload, at PS01.

## Guard-table result (part 2B rerun)

One fresh collection and one gated-tool run per table at `cfa0aad472` (long-job `dx-p2b-gt`, 26,345 witnesses: 13,520 accepted, 12,594 refused, 231 traces; collection 217 s, whole run 31 min). Every table was rerun, not only the changed ones, because the flipped F19 cases and the new controls change control sets across tables. **285 of 291 rows proved** in 114 tables; 111 tool runs, all PASS; 2,372 distinct single-row negatives (10,437 further witnesses ride as aliases), 38,621 tool evaluations. Lane-matrix problems: 0. Collection findings: 0. Masked negatives: 0. Unrelated changes: 0. Credit is the tool's own `rows[].proved`. The 6 unprovable rows are unchanged from part 2A (IR01, IR03, IR04, IR05, IF06, RM09), each alone in a table with its reason (`identity_replay_fixed`, `integrity_numeric_fixed`, `remediation_ceiling_join`); the runner exits 1 for those three tables only, exactly as in part 2A.

Changed tables (the rest keep their rows; their part 2B cut results are in `DX.guard-tables.json`):

| Table | Rows | Proved | Negatives / controls to the tool | Cuts (own flips / stays) | Change from part 2A |
|---|---|---|---|---|---|
| `clock_owner` | TC01_shared_syntax, TC02_shared_utc_z, TC03_shared_calendar, TC04_owner_no_leap_second, TC05_backoff_upper_t | 5/5 | 13 / 3 | TC01 3/3, 10; TC02 2/2, 11; TC03 6/6, 7; TC04 1/1, 12; TC05 1/1, 12 | new: the shared CV-1101 predicate and the DX owner profile (replaces TS02 and the lane grammar) |
| `clock_spelling` | TS01_spelling, TS03_parses | 2/2 | 2 / 1 | TS01 1/1, 1; TS03 1/1, 1 | now the frozen v0 route only; TS02_utc_route removed |
| `clock_timezone` | TZ01_timezone | 1/1 | 1 / 1 | TZ01 1/1, 0 | unchanged row; now documented as the frozen v0 route |
| `dependency_schema` | DS01_context_schema | 1/1 | 1 / 1 | DS01 1/1, 0 | same row; other-owner fields now use the shared event_record profile |
| `payload_schema` | PS01_payload_schema | 1/1 | 1 / 1 | PS01 1/1, 0 | same row; its format checker is now the shared predicate with the DX owner profile |
| `retry_after_date` | RA01_date_parses, RA02_date_timezone | 2/2 | 2 / 1 | RA01 1/1, 1; RA02 1/1, 1 | unchanged rows; now the frozen v0 route only |
| `retry_after_http_date` | RG01_http_date_grammar, RG02_http_date_calendar | 2/2 | 2 / 3 | RG01 1/1, 1; RG02 1/1, 1 | new: RFC 9110 HTTP-date for the current edition |

| Checker | Tables | Rows | Proved | Cut: own flips / own | Cut: stays | Unrelated | Masked |
|---|---:|---:|---:|---:|---:|---:|---:|
| Replay policy | 1 | 2 | 2 | 2/2 | 2 | 0 | 0 |
| Retry/backoff EP-032 and SP-238 (validate_retry and helpers) | 15 | 47 | 47 | 130/130 | 404 | 0 | 0 |
| Shared number rule adoption (CV-1100, SP-1100) and owner value domain | 6 | 12 | 12 | 13/13 | 16 | 0 | 0 |
| Capture route: dispatch, scope, envelope, source records, joins, transition, effects, publication (validate_capture) | 25 | 61 | 61 | 593/593 | 849 | 0 | 0 |
| Owner clocks (instant: shared CV-1101 date_time with the DX owner profile; frozen v0 edition) | 3 | 8 | 8 | 16/16 | 54 | 0 | 0 |
| Dependencies (validate_dependencies) | 7 | 10 | 10 | 69/69 | 138 | 0 | 0 |
| Fixture routes and authoring notation | 2 | 7 | 7 | 7/7 | 22 | 0 | 0 |
| SP-337 payload transport and packs, grants | 7 | 28 | 28 | 688/688 | 1434 | 0 | 0 |
| Retained reader: recipe binding, custody, disclosure, SP-1101 dispatch | 6 | 15 | 15 | 607/607 | 2044 | 0 | 0 |
| Identity recipe (pm_executor_event_contracts.identity) and replay self-checks | 4 | 12 | 8 | 22/22 | 66 | 0 | 0 |
| CLI fixture integrity | 8 | 14 | 13 | 13/13 | 20 | 0 | 0 |
| Schema occurrences and reference admission | 4 | 5 | 5 | 5/5 | 2 | 0 | 0 |
| Family predicates: remediation, scheduler.pass, attempt/node families | 11 | 31 | 30 | 37/37 | 101 | 0 | 0 |
| Shape oracle (pm_executor_event_contracts.validate) | 10 | 30 | 30 | 145/145 | 474 | 0 | 0 |
| Receipt/replay trace model (run_trace) | 5 | 9 | 9 | 25/25 | 24 | 0 | 0 |

Part 2A: 279/285 rows in 112 tables at `51732062cb`. Part 2B: TS02 removed; TC01–TC05, RG01, RG02 added (+7 rows, +2 tables); every new row is proved by a part 2B or existing witness. Complete-boundary re-runs of each refused witness with only its row cut: 9,819 accepted, 2,990 refused later by a distinct invariant (per table in the JSON). The lane matrix confirms each negative is refused by its target row alone within its table.

## What each new witness did before and after

`before-after.json` runs all 34 part 2B witnesses through the part 2A checker (`git archive 35f2cfd65b scripts`, same fixtures) and through this head. 12 results change: the 6 F19 controls (refused by the part 2A checker at `TS02_utc_route`), year 0000 (refused at `TS01_spelling`), the asctime-date control (refused at `RA02_date_timezone`) and the 5 `RG01` negatives (each **accepted** by the part 2A checker: `email.utils` read numeric zones, a missing weekday, a one-digit day, a two-digit IMF year and lowercase `gmt` as dates). Every other witness keeps its accept or reject result and now refuses at the new row. All 34 match their expectation at this head.

| Witness | Family / route | Expected | Part 2A checker | This head |
|---|---|---|---|---|
| `F19-control-ready-since-lower-t` | scheduler.pass / capture | accept | reject TS02_utc_route | accept |
| `F19-control-wakes-lower-t` | scheduler.pass / capture | accept | reject TS02_utc_route | accept |
| `TC04-wake-announced-leap-second` | scheduler.pass / capture | reject | reject TS01_spelling | reject TC04_owner_no_leap_second |
| `F19-shape-control-ready-since-lower-t` | scheduler.pass / shape | accept | reject TS02_utc_route | accept |
| `TC05-shape-backoff-now-lower-t` | run.node_backoff_expired / shape | reject | reject TS02_utc_route | reject TC05_backoff_upper_t |
| `F19-score-control-lower-t` | scheduler.pass / score | accept | reject TS02_utc_route | accept |
| `TS-control-v0-zero-offset` | run.node_backoff_started / history | accept | accept | accept |
| `TC02-current-edition-lowercase-z` | run.node_backoff_started / history | reject | reject TS02_utc_route | reject TC02_shared_utc_z |
| `TS-control-v0-lowercase-z` | run.node_backoff_started / history | accept | accept | accept |
| `TS01-v0-space-separator` | run.node_backoff_started / history | reject | reject TS01_spelling | reject TS01_spelling |
| `TC-control-helper-lower-t` | attempt.completed / helper | accept | reject TS02_utc_route | accept |
| `TC-control-helper-year-0000` | attempt.completed / helper | accept | reject TS01_spelling | accept |
| `TC-control-helper-long-fraction` | attempt.completed / helper | accept | accept | accept |
| `TC04-helper-announced-leap-second` | attempt.completed / helper | reject | reject TS01_spelling | reject TC04_owner_no_leap_second |
| `TC05-helper-backoff-lower-t` | attempt.completed / helper | reject | reject TS02_utc_route | reject TC05_backoff_upper_t |
| `TC03-helper-unannounced-leap-second` | attempt.completed / helper | reject | reject TS01_spelling | reject TC03_shared_calendar |
| `TC02-helper-zero-offset` | attempt.completed / helper | reject | reject TS02_utc_route | reject TC02_shared_utc_z |
| `TC01-helper-trailing-LF` | attempt.completed / helper | reject | reject TS01_spelling | reject TC01_shared_syntax |
| `RA-control-v0-numeric-zone` | attempt.completed / helper | accept | accept | accept |
| `RA01-v0-not-a-date` | attempt.completed / helper | reject | reject RA01_date_parses | reject RA01_date_parses |
| `RA02-v0-naive-date` | attempt.completed / helper | reject | reject RA02_date_timezone | reject RA02_date_timezone |
| `TS-control-v0-helper-offset` | attempt.completed / helper | accept | accept | accept |
| `PS01-ts-announced-leap-second` | attempt.completed / schema | reject | reject PS01_payload_schema | reject PS01_payload_schema |
| `PS01-control-ts-lower-t` | attempt.completed / schema | accept | accept | accept |
| `DS-control-context-created-offset` | node.started / capture | accept | accept | accept |
| `DS01-context-created-no-zone` | node.started / capture | reject | reject DS01_context_schema | reject DS01_context_schema |
| `RG-control-rfc850-date` | run.node_backoff_started / capture | accept | accept | accept |
| `RG-control-asctime-date` | run.node_backoff_started / capture | accept | reject RA02_date_timezone | accept |
| `RG01-numeric-zone` | run.node_backoff_started / capture | reject | accept | reject RG01_http_date_grammar |
| `RG01-no-weekday` | run.node_backoff_started / capture | reject | accept | reject RG01_http_date_grammar |
| `RG01-one-digit-day` | run.node_backoff_started / capture | reject | accept | reject RG01_http_date_grammar |
| `RG01-two-digit-year` | run.node_backoff_started / capture | reject | accept | reject RG01_http_date_grammar |
| `RG01-lowercase-gmt` | run.node_backoff_started / capture | reject | accept | reject RG01_http_date_grammar |
| `RG02-31-november` | run.node_backoff_started / capture | reject | reject RA01_date_parses | reject RG02_http_date_calendar |

## Date-time inventory gate and the combined self-test (lead addendum 2)

Run on the committed tree (the ignored currentness copy moved aside first, so the gate sees exactly the branch content). Neither call is made from a DX checker; both are recorded here as addendum 2 asks, and both run at batch-2 integration after the inventory and exclusions refresh.

- `python3 scripts/pm_event_datetime_inventory.py` exits **1**: status `fail`, 233 classified nodes (133 storage, 89 other-owner, 3 + 8 wildcard), 0 unclassified nodes, **203 failure rows**: 112 `unclassified_mentioning_container`, 48 `stale_scan_exclusion`, 43 `unreadable_mentioning_container`. **No `inventory_node_changed`**: no classified node's resource changed in this tree, so the DO-style hash drift does not occur here. Credited exactly: the gate fails (`inventory-gate.json`).
- Where the rows are:

| Area | Error | Rows |
|---|---|---:|
| `Plans/.plan_migration` | `unclassified_mentioning_container` | 95 |
| `Plans/_shards` | `stale_scan_exclusion` | 41 |
| `Plans/_shards` | `unreadable_mentioning_container` | 38 |
| `Plans/.plan_index` | `unclassified_mentioning_container` | 14 |
| `Plans/.plan_index` | `stale_scan_exclusion` | 2 |
| `Plans/Decision_Log.md` | `stale_scan_exclusion` | 2 |
| `Plans/Decision_Log.md` | `unreadable_mentioning_container` | 2 |
| `Plans/usage-feature.md` | `stale_scan_exclusion` | 2 |
| `Plans/usage-feature.md` | `unreadable_mentioning_container` | 2 |
| `Plans/Contracts_V0.md` | `stale_scan_exclusion` | 1 |
| `Plans/Contracts_V0.md` | `unreadable_mentioning_container` | 1 |
| `Plans/executor_event_contracts.json` | `unclassified_mentioning_container` | 1 |
| `Plans/executor_event_p2a_cases.json` | `unclassified_mentioning_container` | 1 |
| `Plans/executor_event_semantic_fixtures.json` | `unclassified_mentioning_container` | 1 |

- **The DX rows, for the batch-2 classification:** `Plans/executor_event_contracts.json`, `Plans/executor_event_semantic_fixtures.json` and `Plans/executor_event_p2a_cases.json` are `unclassified_mentioning_container` because they mention `observed_at_utc` (the contracts' adapter join `ts → operation.body.observed_at_utc` and that field in the fixtures' Executor operation records). That field is the Executor operation record's copy of payload `ts`, joined by exact equality; it is not EventRecord's Storage-assigned `observed_at_utc`. These three files are static fixture and contract data with no schema declaration; all three already mentioned the field at the part 2A head (the p2a cases file once). `Plans/Contracts_V0.md` `stale_scan_exclusion` at `fence:20988` plus `unreadable_mentioning_container` at `fence:21002` are one fence whose content is byte-identical and shifted 14 lines by this branch's earlier Contracts_V0 edits (`numrule-identity.txt` holds the comparison). No row names a file part 2B created; the rest are regenerated `_shards`, `.plan_index`, `.plan_migration` and two documents this lane never edited (`Decision_Log.md`, `usage-feature.md`).
- `python3 scripts/pm_event_numbers.py --self-test` (`--scope all`) exits **1**: `case_execution: NOT_RUN_ADMISSION_REFUSED`, 0 cases run, the only failing check `datetime_inventory_complete_and_classified` (the same 203 gate rows). Recorded, not credited.
- `python3 scripts/pm_event_numbers.py --self-test --scope numbers` exits **0**: `"status": "pass"`, 580 of 580 cases (`selftest-numbers.json`).
- `python3 scripts/pm_event_datetime.py --self-test` is not counted: the module has no entry point (addendum 2's correction).
- `datetime_validator` is not called anywhere in the DX checkers; the shared `date_time` predicate with an explicit profile per field is the part 2B adoption (addendum 2, point 1).

## What Astra keeps finding, probed for part 2B

(1) A forged or caller-chosen edition cannot select the v0 profile: the date-time edition rides on the authenticated recipe tuple (`frozen_verifier`), and RB01–RB05 and DD01 keep refusing forged, unknown or replaced selections. (2) No Storage-assigned timestamp exists in DX's model: no EventRecord `observed_at_utc`/`persisted_at_utc` is read, and `operation.body.observed_at_utc` is the Executor owner record's copy of payload `ts`, joined by exact typed equality. (3) Historical readers both ways: retained v0 originals with `+00:00`, lowercase `z` and an impossible-but-spelled date read or refuse exactly as their frozen edition says (`TS-control-v0-*`, `TS03-v0-impossible-date`), the email Retry-After route stays for v0 (`RA-control-v0-numeric-zone`), and a current-edition original refuses lowercase `z` (`TC02-current-edition-lowercase-z`). (4) One field read two ways: every timestamp is read by one predicate per edition and profile; the joined copies are compared as exact strings, never re-parsed; `t`/`T` and `.1`/`.10` give one instant (`own-probes.json`). (5) No new schema reference. (6) No size rule changed. (7) Custody unchanged. (8) Masked negatives: each part 2B negative changes one fact from a named seed, and the tool reports no masked negative (guard section). (9) The one upgrade is `scheduler.pass`'s oracle cell, with the F19 controls and wake cases as evidence. (10, 10a) Year 0000 and long fractions are kept exactly; tightening the Retry-After grammar applies to the current edition only, and the v0 edition keeps its then-valid route. (11) Wrong types (`None`, integers) refuse at TC01 through the shared predicate's `date_time_type`. (12) Formats: `date-time` is an explicitly registered predicate in every DX validator; the stock route exists only to isolate the patterns' exact-end guard. Own probes: 58 of 58 pass (`own-probes.json`).

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part 2A self-grade; after is this self-grade at `bb67fb0573`.

| Family | Before → after |
|---|---|
| `attempt.completed` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `attempt.started` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `node.blocked` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `node.completed` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `node.started` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `node.unblocked` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `plan.decomposition_degraded` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `remediation.resolved` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `remediation.spawned` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.completed` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.graph_integrity_failed` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.node_backoff_expired` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.node_backoff_started` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.node_ready` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.node_retry_scheduled` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `scheduler.pass` | 10P / 1Q / 1A → **11P / 0Q / 1A** |

**175 PASS / 1 PARTIAL / 16 ABSENT → 176 PASS / 0 PARTIAL / 16 ABSENT.** The one change: `scheduler.pass` `positive_negative_oracles` PARTIAL → PASS. Timestamps were its only reason (F19), and the shared check now covers them: ordinary scheduler clocks admit a lowercase `t` through `pm_event_datetime.date_time`, backoff clocks keep TC05, and the coherent lowercase-`t` capture, shape, score and wake positives pass with the guard tool proving TC01–TC05. Every other oracle cell keeps PASS with its evidence extended (the shared date-time calls, the frozen-edition binding); every family's `remaining_gaps` drops "timestamp review interim" and keeps "membership ABSENT" and "datetime_validator and the inventory gate at batch-2 integration". No other cell depended on timestamps. Every self-grade evidence quote was re-checked at its line at `bb67fb0573`: 586 quotes, 0 missing (83 relocated to their moved lines, 4 re-pointed from the removed `instant` fraction line to `utc_text_instant`, 70 new for the part 2B evidence).

## Commands and evidence

Heavy runs one at a time, each started at 15–16 GB available (floor 13.5 GB); the guard run used the tool's MemoryGate (pause below 10 GB) and never paused. Receipt: `reports/event-authority-20261104/DX.checks.json`. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p2b/` (SHA-256 of every file in `SHA256SUMS`; the 75 MB guard collection pickle stays local and is named there by hash only).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 58c2816ff33365384d4039553f5efdb5370930e6` | 0 | `f025ad6e74`, clean; 7 NUMRULE files; none edited since (`numrule-identity.txt`) |
| `python3 scripts/pm-executor-table-generate.py --check` | 0 | 114 tables, 291 rows |
| `python3 scripts/pm-executor-p2a-cases.py --check` | 0 | 110 witnesses (76 + 34), 10 custody additions, files current |
| `python3 scripts/pm_executor_event_semantics.py --family F` (16) | 0 | `pass` each, 0 failures, 110 witnesses in total |
| `python3 scripts/pm_executor_event_contracts.py --family F` (16) | 0 | `pass` each |
| `python3 scripts/pm-executor-number-corpus.py --json …` | 0 | 6,432 route runs, 0 disagreements |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580/580 |
| `python3 scripts/pm_event_numbers.py --self-test` (scope all) | 1 | `NOT_RUN_ADMISSION_REFUSED` (inventory gate); not credited |
| `python3 scripts/pm_event_datetime_inventory.py` | 1 | 203 rows, no `inventory_node_changed`; not credited |
| `python3 scripts/pm-executor-guard-tables.py --out … --save-collection …` (long-job `dx-p2b-gt`) | 1 | 111 tool runs PASS, 285/291 rows; exit 1 only for the 3 by-construction tables |
| `before-after.py` (part 2A checker vs this head) | 0 | 34 witnesses, 12 results changed, all 34 as expected now |
| `own-probes.py` | 0 | 58/58 |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | only `Plans/_shards/contracts_v0/**` changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files hash-verified first) | 0 | only Contracts_V0 plan units changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass` |
| `python3 scripts/pm-plan-index.py validate` (origin/main `77bae0c636`) | 1 | top-level `fail`, 60 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers (as in part 2A) and 39 `plan_unit_removed_without_ledger_decision` for units added on main after this unrebased branch's base (DL-333..341, DL-349, DL-470..472, CV-369, EP-236, UCC-230/231 and others); none names a DX file. The batch-2 rebase owns them. |
| `git diff --check 35f2cfd65b HEAD` | 0 | clean |

Governance staleness for Contracts_V0 (edited again) is expected before the next reseal; no reseal was attempted. No admission, registry append, Decision Log entry, new PlanUnit ID, NUMRULE-file edit, test-file edit, pm-mail beyond the final line, or subagent.

---

# DX sweep part 2A and part 2B numbers (earlier report; part 2B above supersedes its timestamp and grade statements)

Branch `plans/ea-w2-executor-20261104`; start `d987fd25af`; gated tool merge `a2fe401091` (tool `004bdedd63`, eleven files, none edited); gated NUMRULE number-scope merge `3505142713` (exact commit `a16f67c1ef`, never the branch head); implementation head `51732062cb`. The delivery head is in the external `HEAD.txt`. No rebase onto main this round. Both merges brought no main commit into the lane (the NUMRULE merge base `fb441b27fd` is already on main).

**All 16 families keep their part-1 grades (175 PASS / 1 PARTIAL / 16 ABSENT).** Part 2A closes P1: every refusal of the three DX checkers is one named row of a Method B guard table, and the gated tool proves **279 of 285 rows** in 112 tables; the other 6 rows cannot be refused by any input, and each sits in its own table with its reason so the other rows keep their credit. Part 2B numbers closes S-N1..S-N5 with the shared CV-1100/SP-1100/SP-1101 calls. `scheduler.pass` keeps its PARTIAL oracle cell for F19, which is a timestamp item (part 2B). Membership stays ABSENT; native execution is NOT_RUN. Sol and Astra review the lane once, after part 2B's timestamp items.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` with `--no-ff` as `a2fe401091`: exactly the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat a2fe401091^1 a2fe401091` lists 11 files; `git diff a2fe401091 HEAD -- scripts/pm_guard_isolation.py` is empty. |
| **P1 — guard tables** (fixed, `3af763b3df`) | Every refusal of `scripts/pm_executor_event_semantics.py`, `scripts/pm_executor_event_contracts.py` and `scripts/pm_executor_schema_refs.py` is one named predicate row of a phase table (`scripts/pm_executor_table_*.py`, at most eight rows each), generated from one row spec. The checkers derive the observation of the phase they are about to evaluate (recomputed digests and identities, typed values, resolved routes, presence) and refuse only through `refuse`/`refusal`. A derivation that depends on an earlier row of the same phase is computed only when that row passes. Compound `require(a and b ...)` leaves are split into one row each; a value row carries its type row's pass condition. Reused boundaries (string-list grants, dependency custody, schema occurrences) keep their callers' legacy messages. The receipt/replay trace model returns row codes as its outputs. The CLI fixture-integrity checks are rows too, and the semantic CLI fails unless every factory requires its rows in table order (IT01). | `scripts/pm_executor_event_semantics.py:82` (`table_refusals`), `:100` (`refusal`), `:106` (`refuse`), `:1265` (`check_table_order`); row spec `scripts/pm-executor-table-generate.py` | `python3 scripts/pm-executor-table-generate.py --check` (112 tables, 285 rows; no stale or extra module); both family CLIs pass for all 16 families. |
| **P1 — behaviour preserved** (`3af763b3df`) | A per-witness differential ran the original checkers and the restructured ones over every existing witness. | `differential-summary.json` | 19,767 witnesses: every accept/reject result unchanged; 19,148 refusal messages identical; 619 changed, all explained: 610 `jsonschema` errors now refused through their schema row with the same text, 6 untracked `KeyError`s now refused by `source record set`, 3 raw HTTP-date parse errors now refused by `Retry-After HTTP-date`. All 32 family CLI outputs byte-identical. |
| **Two-defect negatives the lane matrix reported** (fixed, `a6d1d5d6c6`) | Eight witness groups were refused by two rows of one table once the compound leaves were split. Each later row now carries the earlier row's pass condition where one defect precedes the other on the same field: NB03 (anchor, given a safe point), PK06 (descriptor size, given a self-consistent pack), RF02 (failure Storage class, given a null retry class), RT09 (prior attempt, given a joined failed attempt), SX11, RV03, PT04, PR04–PR06 (descriptor fields, given a resolved descriptor), GJ06, EF07. | `scripts/pm-executor-table-generate.py` rows of those names | Lane matrix: 0 problems in every table; tool: 0 masked negatives, 0 unrelated changes. |
| **NB01 removed** (`a6d1d5d6c6`) | `pre-attempt omission` re-checked exactly the predicate EP02 (`episode attempt presence`) refuses earlier on the same path (payload `attempt_id` against the episode record's `attempt_id`); no input could reach it. Removing it changes no result for any input. | `scripts/pm_executor_event_semantics.py:801` (the comment that records EP02 owns it) | Differential and every CLI unchanged. |
| **Missing negatives** (fixed, `2774354a58`, `569373ba68`, `51732062cb`) | `Plans/executor_event_p2a_cases.json` holds 76 witnesses (73 negatives for 72 rows, 3 controls), built by `scripts/pm-executor-p2a-cases.py` from named valid seeds of their own family. Each changes one fact and moves every copy of it (inline envelope payload, joined owner record, transition mirror, dependency refs) and rehashes every changed owner record; the builder keeps it only when the complete checker refuses it at exactly its target row, and the semantic CLI checks the row too. Four new modelled originals (and two more for DD01) get their own custody entries (`write_time_edition` `DX-sweep-p2a`); no existing custody entry changed. Note: commit `2774354a58`'s message says "64 negatives, 5 controls"; that commit actually held 67 negatives and 2 controls. | `scripts/pm_executor_p2a_cases.py:39` (`action`), `:112` (`run`) | `python3 scripts/pm-executor-p2a-cases.py --check`; the CLI's `sweep_p2a_witnesses` count is 76 across families. |
| **Adapter and runner** (`7a69e2ab92`, `190face978`) | Suites come from the checkers' own witnesses run once under the observation recorder (26,311 witnesses: semantic capture/history/type/numeric/score/schema/reference/workgraph/helper/golden cases and their seeds, shape cases and seeds, 231 receipt traces, CLI integrity checks, part 2A witnesses). Accepted invocations give per-phase controls; each refused witness gives the observation of its refusal, targeted at the refusing row; each refusal a trace returns as an output is a negative. Untracked refusals, unexpected results and multi-record refusals are reported, never relabelled: the final collection has none. Negative IDs are numbered per phase (`190face978`; a trace can give several negatives of one row). | `scripts/pm_executor_guard_suites.py:66` (`witnesses`), `:195` (`collect`), `:272` (`complete_boundary_flip`), `:294` (`lane_matrix`), `:334` (`suite_for`); `scripts/pm-executor-guard-tables.py` | `python3 scripts/pm-executor-guard-tables.py --out <dir>` (batches with `--phase`, `--save-collection`/`--load-collection`). |
| **Rows unprovable by construction** (`a6d1d5d6c6`, `190face978`) | Six rows have no input that can refuse them; each sits in its own table so the gated tool credits the rest: IR01, IR03, IR04, IR05 (identity-recipe self-checks: a pure function's properties), IF06 (numeric spelling independence once CV-1100 admits the spelling) and RM09 (payload generation within the ceiling, implied by the `remediation_generation` source join SJ01, RM08 and RM07, which refuse first on every path). They stay as checks; they earn no credit. | tables `identity_replay_fixed`, `integrity_numeric_fixed`, `remediation_ceiling_join` | `DX.guard-tables.json` `rows_unproved`. |
| **Cross-table defense in depth, proved site by site** | On the current-writer routes the envelope Storage instance's type and non-emptiness are checked by transport (PT01, PT02) and again by the identity recipe (ID06, ID07); a retained read's Storage root is checked by HD05 and again by the SP-1101 binding inside DD01. Cutting PT01, PT02 or HD05 alone leaves each of its witnesses refused by its partner for the same defect; cutting both accepts it. Each partner also has negatives of its own route that only it refuses (the identity boundary has no transport; DD01's replaced-resource and foreign-family originals). | `duplicate-pairs.json` | PT01 alone → 288 refused by ID06; both → 288 accepted. PT02 → ID07: 32 / 32. HD05 → DD01: 32 / 32. |
| **Part 2 items from part 1** | P1 fixed (above). S-N1..S-N5 fixed in the number pass (next section). F19 is a timestamp item: part 2B. | — | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** no new PlanUnit, Decision Log or admission ID; SP-500..515 and ATS-250..257 change in place. New witness IDs are the part 2A case IDs in `Plans/executor_event_p2a_cases.json`.

## Guard-table result

The gated tool ran **109 table suites**: **279 rows proved**, 0 failed suites; the 3 tables of unprovable rows have no negative and get no tool run. 2,359 distinct single-row negatives (10,451 further witnesses with an identical observation ride as aliases), 38,349 tool evaluations. Lane-matrix problems: 0. Open collection findings: 0. Credit is the tool's own `rows[].proved`.

Each cut swaps one table row to always-pass; the tool then runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. Own negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays"). Controls given to the tool are every family's first control of the table, then the rest in recorded order up to 40; the lane matrix checks every control and negative directly.

| Checker | Tables | Rows | Proved | Unproved (reason) | Cut: own flips / own | Cut: stays | Unrelated changes | Masked |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Capture route: dispatch, scope, envelope, source records, joins, transition, effects, publication (validate_capture) | 25 | 61 | 61/61 | none | 593/593 | 849 | 0 | 0 |
| Family predicates: remediation, scheduler.pass, attempt/node families | 11 | 31 | 30/31 | RM09_payload_ceiling (by construction; see above) | 37/37 | 101 | 0 | 0 |
| Retry/backoff EP-032 and SP-238 (validate_retry and helpers) | 14 | 45 | 45/45 | none | 128/128 | 402 | 0 | 0 |
| SP-337 payload transport and packs, grants | 7 | 28 | 28/28 | none | 688/688 | 1434 | 0 | 0 |
| Dependencies (validate_dependencies) | 7 | 10 | 10/10 | none | 69/69 | 138 | 0 | 0 |
| Retained reader: recipe binding, custody, disclosure, SP-1101 dispatch | 6 | 15 | 15/15 | none | 607/607 | 2044 | 0 | 0 |
| Shared number rule adoption (CV-1100, SP-1100) and owner value domain | 6 | 12 | 12/12 | none | 13/13 | 16 | 0 | 0 |
| Owner clocks (instant; timestamp grammar part 2B) | 2 | 4 | 4/4 | none | 5/5 | 8 | 0 | 0 |
| Identity recipe (pm_executor_event_contracts.identity) and replay self-checks | 4 | 12 | 8/12 | IR01_metadata_neutral, IR03_storage_bound, IR04_deterministic, IR05_body_digest (by construction; see above) | 22/22 | 66 | 0 | 0 |
| Shape oracle (pm_executor_event_contracts.validate) | 10 | 30 | 30/30 | none | 145/145 | 474 | 0 | 0 |
| Schema occurrences and reference admission | 4 | 5 | 5/5 | none | 5/5 | 2 | 0 | 0 |
| Replay policy | 1 | 2 | 2/2 | none | 2/2 | 2 | 0 | 0 |
| Receipt/replay trace model (run_trace) | 5 | 9 | 9/9 | none | 25/25 | 24 | 0 | 0 |
| Fixture routes and authoring notation | 2 | 7 | 7/7 | none | 7/7 | 22 | 0 | 0 |
| CLI fixture integrity | 8 | 14 | 13/14 | IF06_numeric_spelling (by construction; see above) | 13/13 | 20 | 0 | 0 |

Rows each family's own witnesses prove (a row is credited per table; shared rows are proved by every family that reaches them, and family-specific rows only by their family):

| Family | Rows proved by its own witnesses |
|---|---:|
| `attempt.completed` | 164 |
| `attempt.started` | 115 |
| `node.blocked` | 121 |
| `node.completed` | 113 |
| `node.started` | 113 |
| `node.unblocked` | 113 |
| `plan.decomposition_degraded` | 102 |
| `remediation.resolved` | 114 |
| `remediation.spawned` | 113 |
| `run.completed` | 105 |
| `run.graph_integrity_failed` | 102 |
| `run.node_backoff_expired` | 125 |
| `run.node_backoff_started` | 136 |
| `run.node_ready` | 104 |
| `run.node_retry_scheduled` | 141 |
| `scheduler.pass` | 128 |
| `shared` | 19 |

**Runs.** The first full run (collection with complete-boundary flips, then one tool run per table) used inputs at `569373ba68`/`aaf6d90855`; 106 tables passed, and two failed on the lane's side: `integrity_numeric` (IF06 had no negative, which withholds the table's credit) and `trace_read` (the adapter gave two negatives one ID). After the fixes (`190face978`) and one more control witness (`51732062cb`), a fresh collection at `51732062cb` matched the first one on 107 tables exactly (control observations; negative targets, codes, observations, witnesses, flips and families). The 5 that differed are explained in `collection-compare.json` (the IF06 split, one more table-order control, one more stock-schema control, and a flip label in `current_number`); those 5 plus `trace_read` were re-run at `51732062cb` and all pass.

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`), as in DC, DR and DG6B. The complete path is the full checker, which reaches every refusal through the same rows. As lane evidence beyond the tool, each refused witness was re-run through the whole checker with only its refusing row cut: 9,694 are then accepted and 3,116 are refused later by a distinct invariant on the same source fact (kinds per cut row in `flips.json`). The largest groups: a cut source join is caught by the complete source observation (SJ01 → SO01, 665); a cut inline payload join is caught by the source join, the scope Project or the JCS identity of the same changed field (PT03 → SJ01 338, SC01 192, JQ01 160, JQ02 160); the Storage-instance pair above (PT01 → ID06, 288); a cut row whose derivation then reads the refused value (for example a cut JCS row returns no text, a cut clock-spelling row leaves no instant): `derivation_requires_cut_row`, 663. None reaches a second row of its own table, so each stays a single-row negative for the tool.

**What Astra keeps finding, probed for part 2A.** (1) Digests and identities are recomputed in derivation and compared by rows (SD01, DC03, HI01–HI03, PK03); forged copies are the negatives, and DD01 refuses an original authenticated for another family. (2) Storage-assigned fields are compared with the owner record (RV01–RV04, TX02, TX07, TX08), never trusted from the event; retry compares only the original semantic body (TA02). (3) The current-writer replay row AP01 never runs on a retained original (historical routes use HP01); retained `projector_replay_only` history stays accepted, and withdrawn, forged, unknown or replaced originals refuse (RB01–RB05, HI01–HI03, DD01). (4) Joins compare exact typed values (`typed`) on both sides; the number pass below removes the JCS range from joins. (5) SR02/SR03 resolve every `$ref` per document root, dormant branches included. (6) PT04 measures the encoded inline body; the reference route checks every descriptor and pack field (PR01–PR06, PK01–PK12). (7) Every capture runs source custody, dependencies and the publication order; required slots come from the adapter, never the caller (SS01). (8) Masked negatives: tool `masked` empty on every row; complete-boundary re-runs above. (9) Grades unchanged; the scheduler oracle cell stays PARTIAL. (10, 10a) The number pass below. (11) Type rows test the exact type name (`type(x).__name__`) and identity with `True`/`False`, with string, number, null, array and object negatives in the existing type fixtures. (12) Timestamp formats: done in sweep part 2B (above).

## Sweep part 2B numbers: findings and responses

The number scope was merged as the exact gated commit and adopted through the shared helper only: no NUMRULE file is edited and no date-time code is imported (`pm_event_datetime*` is not used anywhere in the DX checkers). The number recipes keep DX's recipe IDs (`executor-jcs-binary64-v1`, `executor-json-integer-v0`), identity preimages and tuple positions exactly.

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **S-N2 — qualified JCS** (fixed, `569373ba68`) | `canonical` uses the shared `qualified_jcs` for the current recipe, so an integer refuses unless its binary64 value and its emitted JCS decimal both equal it: 2^53 passes, 2^53+1 refuses `jcs_binary64` (JQ01), 2^60 refuses `jcs_decimal` (JQ02), and any other helper refusal (a lone surrogate) is JQ03. It runs only for actual identity/digest preimages. The frozen retained recipe `executor-json-integer-v0` keeps its exact integer JSON bytes. Current capture and shape writes now compute the event identity after transport, so the old blanket walk's job (refusing 2^53+1 event sequences) is done by the identity preimage itself. | `scripts/pm_executor_event_semantics.py:275` (`canonical`), `:679` (capture identity); `scripts/pm_executor_event_contracts.py:52` (shape identity) | Canonical golden, numeric and coherent-sequence cases; part 2A witness JQ03-lone-surrogate-jcs. |
| **S-N3 — separate domains** (fixed, `569373ba68`) | Joins compare exact typed values (`typed`: the owner value domain, then exact JSON text; no JCS range), so Storage-assigned revisions and other joined integers are no longer capped by the JCS route. The capture-domain walk keeps only the owner value domain (CS01: null, string, boolean or integer; MK01: string keys). Retained routes never run current slot admission. | `:296` (`validate_canonical_domain`), `:309` (`typed`) | Every retained v0 original with integers above 2^53 still reads (all F15 history cases pass). |
| **S-N1 — current tokens and slots** (fixed, `569373ba68`) | `run_numeric_case` parses spellings with the shared `loads_current_json` (CN01 `integer_token` refuses `-0`; CN02 `json_syntax` refuses `01`; CN03 refuses `NaN` and other refusals). Current writes call `current_integer` at every declared payload integer slot, nested slots included (IS01 `integer_type`, IS02 `integer_range`); identity integer domains use `current_integer` too (ID04, ID05). No blanket integer walk. | `:453` (`current_number`), `:463` (`admit_integer_slot`), `:482` (`admit_integer_slots`), `:1167` (`run_numeric_case`); `scripts/pm_executor_event_contracts.py:15` (`identity`) | Numeric cases; part 2A witness CN03-nonfinite-spelling. |
| **S-N4 — physical bytes** (fixed, `569373ba68`) | `payload_bytes` is the shared `storage_value_bytes(..., profile=EVENT_VALUE)` (SP-1100's Case L-2 canonical MessagePack: exact signed/unsigned 64-bit integers, minimal widths, UTF-8 key order). PV01 refuses integers outside −2^63..2^64−1, PV02 any other refusal. The fixture codec and its scalar row PB01 are gone; every existing pack's bytes are unchanged (all referenced-payload cases pass). | `:439` (`payload_bytes`) | Witnesses PV01-uint64-overflow, PV02-lone-surrogate-bytes. |
| **S-N5 — SP-1101 dispatch** (fixed, `569373ba68`) | The retained reader resolves the original through the shared `RetainedDispatcher`. `CustodyOwner` over the sealed custody catalogue returns the authenticated binding (Storage, scope, Project, family, event identity, source commitment) and the recipe tuple recorded for the original's write-time edition, including the SHA-256 manifest of the frozen resources it was written against (payload-schema bytes, semantic adapter, identity fields). The tuple → frozen-verifier map is installed from this head's resources outside request data. A replaced same-URI resource resolves to no verifier, and an original authenticated for another family fails the binding: both refuse DD01. Current disclosure runs as the dispatcher's `disclose` step. Recipe selection keeps the existing custody rows RB01–RB05 (one authenticated edition, no caller override, no current-then-legacy probing). Modelling assumption, stated: the static model records this head's resources as the frozen resources of each modelled edition; the static oracle has one Server and no native owner-operation id, so both binding fields are fixed constants on both sides. | `:967` (`CustodyOwner`), `:990` (`installed_recipes`), `:1002` (`_validate_history`); `Plans/executor_event_recipe_custody_fixtures.json` `resource_manifests` | Witnesses DD01-replaced-resource, DD01-foreign-family, the RB witnesses, and all 1,345 history cases. |
| **Long integers** (fixed, `569373ba68`) | The corpus run found a real lane crash: a valid 4,400-digit integer (no schema maximum; CV-1100 allows no global cap) made `jsonschema` raise `ValueError` while it rendered an error message. Schema evaluation and typed join text now render integers exactly under a scoped, restored `int_max_str_digits(0)`; no integer value is changed. | `:121` (`exact_integer_text`) | Number-corpus run: 0 untracked results. |
| **Fixture expectations** (`569373ba68`) | 292 cases that expected accept now reject under the shared rule. Each records its refusing row and CV-1100 reason in a `number_rule` field: 100 JQ02 (2^60-class decimals, including the coherent 2^60 sequence capture and shape of each family, and four canonical goldens), 64 CN01 (`-0`), 128 IS02 (negative `event_sequence` at the minimum-0 slot for the digest and payload-bytes boundaries). Nothing else in the fixtures changed. | `Plans/executor_event_semantic_fixtures.json`, `Plans/executor_event_contract_fixtures.json` | `numrule-flips.json` lists every case and row. |
| **Owner text** (`aaf6d90855`) | Each SP-500..515 retained-recipe paragraph states the CV-1100 qualification of `executor-jcs-binary64-v1`, CV-1100 current-input admission, SP-1100 typed joins without a JCS range and SP-1101 dispatch pinning the frozen resources; the SP-337 paragraph names the EVENT_VALUE profile. Each ATS-250..257 family has a sweep acceptance paragraph naming the guard-table runner and the corpus run. | `Plans/storage-plan.md` (SP-500..515), `Plans/Automated_Testing_System.md` (ATS-250..257) | Shards and index regenerated; only Automated_Testing_System and storage-plan outputs changed. |
| **Shared corpus through the complete checker** (`569373ba68`) | `scripts/pm-executor-number-corpus.py` places every number value of the shared corpus's number scope (81 values: raw spellings and exact integers) at each family's `event_sequence` slot and runs it through the four numeric boundaries, the complete current-writer capture (every copy moved, the operation record rehashed) and the receipt trace (append, then exact retry returning the first receipt). The expected outcome is composed from the shared helpers alone. | `scripts/pm-executor-number-corpus.py` | 6,432 route runs, 0 disagreements (1,840 accepted, 4,592 refused). |
| **Number self-test** | `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | — | Exit 0, `"status": "pass"`, 580 of 580 cases. Credited exactly as reported. Environment note: msgpack here is 1.2.4 (the guide names 1.1.2); rfc8785 0.1.4, blake3 1.0.11, jsonschema 4.19.2, referencing 0.36.2. |

`producer_semantic_bytes`/`_digest` are not used: DX defines no EventRecord producer projection; its identity and digest recipes are payload-only and keep their own preimages. `storage_uint64` is not used: no DX field is declared uint64 by its owner.

## Timestamp fields (superseded)

This section held part 2A's own review of the DX timestamp fields. Sweep part 2B replaced it: every field is now checked by the shared CV-1101 `pm_event_datetime.date_time` predicate with its owner profile, as the field table in "Timestamp fields and the shared check that covers each" above records. The part 2A list of what the lane grammar did is in git history at `35f2cfd65b`.

## Part 2B items (closed)

All four timestamp items of part 2A (F19, CV-1101 adoption at the DX timestamp boundaries, the SP-1101 frozen date-time profile for history, the Retry-After HTTP-date grammar) are closed in "Sweep part 2B: findings and responses" above.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part 1 self-grade; after is this self-grade at the implementation commit.

| Family | Before → after |
|---|---|
| `attempt.completed` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `attempt.started` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `node.blocked` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `node.completed` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `node.started` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `node.unblocked` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `plan.decomposition_degraded` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `remediation.resolved` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `remediation.spawned` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.completed` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.graph_integrity_failed` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.node_backoff_expired` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.node_backoff_started` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.node_ready` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `run.node_retry_scheduled` | 11P / 0Q / 1A → 11P / 0Q / 1A |
| `scheduler.pass` | 10P / 1Q / 1A → 10P / 1Q / 1A |

**175 PASS / 1 PARTIAL / 16 ABSENT → the same totals.** Every self-grade evidence quote was relocated at the implementation commit with zero misses (436 quotes: 305 moved line, 16 re-quoted for the extended SP-337 sentence, 44 pointed at the code that replaced the old line); each oracle cell also cites its ATS sweep paragraph, its SP number-rule sentence, `refuse`, the dispatcher call and slot admission.

## Commands and evidence

Heavy checkers ran one at a time; the tool's MemoryGate paused below 10 GB available and resumed at 11 GB, and it paused for most of the first run while other work held memory. PM7 work was not waited on or touched. Commits: `a2fe401091` (tool merge), `3505142713` (NUMRULE number-scope merge), `3af763b3df` (tables), `a6d1d5d6c6` (two-row splits), `2774354a58` (witnesses), `7a69e2ab92` (adapter, runner), `569373ba68` (numbers), `aaf6d90855` (owner text, shards, index), `190face978` (IF06 table, negative IDs), `51732062cb` (stock-schema control), then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p2a/` (SHA-256 of every file in `SHA256SUMS`; large files gzipped).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files, none edited |
| `git merge --no-ff a16f67c1ef` | conflicts in generated files only | `Plans/_shards/contracts_v0`, `Plans/_shards/storage-plan`, `Plans/.plan_index` resolved by regenerating (shard generate, index generate, shard check pass), never by hand |
| differential: original vs restructured checkers | 0 | 19,767 witnesses, 0 result changes, 0 unexplained message changes (`differential-summary.json`) |
| `python3 scripts/pm-executor-table-generate.py --check` | 0 | 112 tables, 285 rows |
| `python3 scripts/pm-executor-p2a-cases.py --check` | 0 | 76 witnesses, 6 custody additions; fixture and custody files current |
| `python3 scripts/pm_executor_event_contracts.py --family F` (16 families) | 0 | `pass` each (`cli/`) |
| `python3 scripts/pm_executor_event_semantics.py --family F` (16 families) | 0 | `pass` each, 76 part 2A witnesses in total (`cli/`) |
| `python3 scripts/pm-executor-guard-tables.py --out ... --save-collection ...` (long-job `dx-p2a-gt`) | 1 | 106 tables PASS; `integrity_numeric`, `trace_read` failed on lane defects, fixed in `190face978` (`tool/gt2/`) |
| same, `--collect-only` at `51732062cb`, then `--load-collection` for 6 tables | 1 / 0 | collection identical on 107 tables (`collection-compare.json`); the 6 re-run tables PASS (`tool/gt4/`); collect-only exits 1 only for the 6 unprovable rows |
| joint-cut proof of the cross-table pairs | 0 | `duplicate-pairs.json` |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580/580 |
| `python3 scripts/pm-executor-number-corpus.py --json ...` | 0 | 6,432 route runs, 0 disagreements |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`; only `Plans/_shards/automated_testing_system/` and `Plans/_shards/storage-plan/` changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files hash-verified first) | 0 | `pass`; only Automated_Testing_System and storage-plan units changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass` |
| `python3 scripts/pm-plan-index.py validate` (origin/main `5cbb92a5aa`) | 1 | top-level `fail`, 30 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers and 9 `plan_unit_removed_without_ledger_decision` (DL-333, DL-335..340, DL-349, UCC-230, added on main after this branch's base `d5ec2f70c0`); the identical set DC and DR recorded at the same origin/main; none names a DX file. Integration rebase owns them. |

---


# DX sweep part 1 — retention text and isolated graph-ID fixtures (earlier report, unchanged)

Branch `plans/ea-w2-executor-20261104`; original lane head `976fc2bea824659e86baf3130fe8bc0ce877b70a`; rebased onto fetched main `d5ec2f70c0d69c469796eea9b9cfdae30f281f42`. Graded code/fixture head `52fb3ad7809f29eb7d4f37730530ed5ba3c2dc09`; the following report-only commit preserves that tree. Final pushed head is in `sweep-p1/head.txt`.

**NOT_READY: part 2 remains required.** Sixteen prepared contracts remain unadmitted; native execution **NOT_RUN**. No deck-2 items were assigned to DX in this task. The assigned decision application is the residual first-deck G28/DL-401 text repair. No new owner choice is needed.

## Sweep part 1: findings and responses

| Item | Location, cause and fix | Commit / verification |
|---|---|---|
| **F16 / G28** | `Plans/Executor_Protocol.md:9773` (EP-216) still declared retention stopped after SP-506 and its companion had applied DL-401. Replace that stop with `RP-OPERATIONAL-2555D@1.0.0` from original fallback commitment and the SP-506 pointer. Preserve pre-lock/no-run, holds, overflow refusal and independent body/checkpoint policies. | `52fb3ad7809f29eb7d4f37730530ed5ba3c2dc09`. Compare EP-216 with `Plans/storage-plan.md:29961` and landed `Plans/Decision_Log.md:4493`; the old stop is absent. Shard check and both decomposition family CLIs pass. |
| **F20** | Graph-ID cases in twelve families changed an ID but left its joined peer well typed and different. Rebuild all 144 demonstrated multi-defect cases at the owner-read boundary, plus the 24 float cases previously masked by canonical admission. Keep 24 separate full-capture equality negatives with nonempty string IDs and recomputed source digests. | `7693cd0ba8`. `scripts/pm_executor_event_semantics.py:151` / `911`; `Plans/executor_event_semantic_fixtures.json:39770` / `12529`. Run both family CLIs and external `verify-f20.py`, `verify-cli.py`. |
| **F19** | Ordinary scheduler clocks still refuse CV-515-admitted lowercase `t`; the two `F19-wake-*-lower-t` negatives encode that mistake. | **Part 2**, as assigned: adopt CV-1101's field-owner profile with NUMRULE. Exact locations and required controls below. No new local format/number helper. |
| **Other review findings** | F1–F15, F17–F18 and S12 repairs are preserved. Cycle 10 reports no other lane-local non-number/non-proof blocker. N1/N2 remain integration gaps; N3 closes after rebase, as assessed below. | All old baselines, histories, traces, numeric/schema fixtures and unrelated source cases are unchanged; normal family suites and 230 fresh adversarial probes pass. |

### Landed decision and premise check

DL-401 records Jared's answer **“approve all except 4c B”** and the approved G28 option at `Plans/Decision_Log.md:4493`: **“The 2 restore-point records: Run year. The fallback record: 7 years, kept as operational history and counted from when the fallback result was committed.”** The current EP-216 owner still describes pre-lock fallback without a run; SP-506 already binds the same terminal commitment anchor, 2,555 days, 2,000,000/Project, expired-unheld deletion only and new-write refusal on count overflow. This repair applies that decision only to the fallback's residual semantic-owner sentence. The two restore-point contracts are outside this repair.

## Family grades before and after

PASS / PARTIAL / ABSENT against independent cycle 10. These are finite normative/static rubric cells, not admission or whole-lane readiness. All sixteen verdicts remain `NOT_READY_PENDING_PART_2` until the shared tools/profile adoptions pass.

| Family | Before | After |
|---|---|---|
| `attempt.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `attempt.started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.blocked` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.completed` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `node.unblocked` | 10 / 1 / 1 | 11 / 0 / 1 |
| `plan.decomposition_degraded` | 10 / 1 / 1 | 11 / 0 / 1 |
| `remediation.resolved` | 10 / 1 / 1 | 11 / 0 / 1 |
| `remediation.spawned` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.completed` | 11 / 0 / 1 | 11 / 0 / 1 |
| `run.graph_integrity_failed` | 11 / 0 / 1 | 11 / 0 / 1 |
| `run.node_backoff_expired` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_backoff_started` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_ready` | 10 / 1 / 1 | 11 / 0 / 1 |
| `run.node_retry_scheduled` | 10 / 1 / 1 | 11 / 0 / 1 |
| `scheduler.pass` | 10 / 1 / 1 | 10 / 1 / 1 |

Totals: **162 PASS / 14 PARTIAL / 16 ABSENT → 175 PASS / 1 PARTIAL / 16 ABSENT**. F16 upgrades one retention cell; F20 upgrades twelve oracle cells. Scheduler's oracle cell stays PARTIAL for F19. Current source quotations were mechanically relocated/rechecked and source pins refreshed; no governance hash was restamped.

## Finding-specific guard witnesses

The owner-read ID boundary is called separately for node and run before equality. String type and nonempty-string are different predicates. Nonempty applies to strings only, so null/false cannot add a second emptiness defect. Boundary cases have one value and no peer/hash observation to leave stale. Every seed is the valid ID from that family's real owner record. Full-capture equality cases retain both type/nonempty checks, all revisions, copies and independently recomputed source hashes.

| Single predicate removed | Negatives that flip in each affected family | Others remain rejected |
|---|---|---|
| Node ID string type | Six node wrong-type values, including null/float | Eight boundary negatives retain their exact own refusal |
| Run ID string type | Six run wrong-type values, including null/float | Eight boundary negatives retain their exact own refusal |
| Node ID nonempty string | One node empty string | Thirteen boundary negatives retain their exact own refusal |
| Run ID nonempty string | One run empty string | Thirteen boundary negatives retain their exact own refusal |
| Node/run ID equality only | Two well-typed, nonempty full-capture disagreements per family | Source hashes, revisions, type and emptiness predicates stay enabled |

All twelve families pass these witnesses. The full `attempt.completed` semantic CLI fails on exactly its own six/six/one/one boundary cases under the four corresponding per-field cuts and passes after restoration. No unrelated predicate is removed; no distinct predicates are called duplicates. This is F20-specific evidence. **Whole-lane check 11 completeness remains P1 for part 2; no new inventory, guard table or general proof machinery was authored.**

## Checks and integration limits

All DX jobs run serially with the 6 GB available-memory floor; no aggregate checker was launched. The bounded check/generator children peaked at 463.1 MiB RSS, with at least 14 GB available at every normal command start; no low-memory pause was needed. No checker failure is hidden by a nested status. All 32 normal family commands exit 0 with top-level `pass`. Fresh adversarial probes: **230 expected outcomes**. Targeted F20 witnesses, all unchanged-original fixture preservation checks and source-pin/quotation checks pass.

Semantic totals:

```json
{
  "source_transition_cases": 3214,
  "receipt_replay_withdrawal_traces": 230,
  "source_score_domain_cases": 16,
  "isolated_schema_cases": 326,
  "schema_reference_cases": 208,
  "historical_read_cases": 1345,
  "numeric_boundary_cases": 2060,
  "exact_type_cases": 4020,
  "workgraph_id_boundary_cases": 168
}
```

The sixteen semantic processes also run 56 shared helper and 21 canonical golden cases each. The 168 graph-ID boundary cases are counted separately from full captures.

| Check | Exit / result |
|---|---|
| Shards generate / check | 0 / 0 |
| Index generate | 0 / pass |
| Index validate | 0 / top-level `pass`, 0 failures |
| Event-index tests | 0 |
| Runtime-vocabulary tests | 1 / existing N1 |
| `git diff --check` | 0 |

**N1:** renderer-order assertion remains outside DX. Its test and both governing GUI/release sources are byte-identical to rebased main. **N2:** the shared dormant `execution_unit_context.schema.json` → goal `body_application_v1` reference remains outside lane-owned schemas; its source is byte-identical to rebased main. **N3 is resolved by the required rebase:** current index validation exits 0 with top-level pass and zero failures, replacing cycle 10's 22 integration failures. The comparison is in `index-baseline-comparison.json`; DL-302 is now present. Changed-owner governance staleness remains for integration/reseal; no reseal was attempted.

### Standing and recurring checks

1–3: all current append/retry/replay refusals, encoded Project scope and independent foreign-Project probes pass; CV-366 application keys are N/A to these Project-only families. 4–5: existing exact inline limits, referenced logical bodies and whole-string/calendar refusals pass; scheduler lowercase-`t` remains F19 and general physical codec remains S-N4. 6–7: original semantic retry body/first receipt, source revisions/roots, checkpoint identities and exact primitive joins remain tested. 8: closed payloads still refuse success-exit injection; these are not process-exit families. 9: dormant lane reference mutations refuse; N2 remains shared. 10: unchanged retained originals read after live transitions, while withdrawal/source loss/foreign disclosure refuse; S-N5 remains. 11: F20-specific isolation passes; P1 remains open.

Fresh own mutations cover recurring classes 1–7, 11 and 12: forged source hashes, Storage identity/revision disagreement, retained disclosure fences, typed equality, dormant refs, large linked-body corruption and publication ordering. The full existing family suites retain exact size thresholds and fresh custody cases. Class 8 has the F20 table above. Class 9 is the explicit partial/readiness reporting here. Number domains (10), frozen write-time resources (10a) and full physical bytes remain the named shared adoptions; no broader clearance is claimed.

## Part 2 items

- **F19 / CV-1101:** `scripts/pm_executor_event_semantics.py:362` (`instant`, default UTC), `458` (`validate_score_domain`), scheduler ready/wake sorts and `scripts/pm_executor_event_contracts.py:92`. Owner `Plans/Contracts_V0.md:25295` (CV-515). Adopt CV-1101's field-owner profile: ordinary ready-since and prerequisite/capacity wake clocks admit lowercase `t`; backoff observations retain uppercase T; final Z/calendar/full precision remain. Add four coherent admitted lowercase-`t` capture/shape/wake positives and replace the two contrary wake negatives, preserving source copies/digests/originals.
- **S-N1:** `run_numeric_case` loses original `-0` tokens; adopt shared current token admission at declared slots, preserving authenticated old editions.
- **S-N2:** `canonical` / `validate_canonical_domain` admit `2^60` without qualifying actual JCS decimal output; adopt CV-1100 qualification over actual owner preimages and existing tuple/prefix rules.
- **S-N3:** `validate_capture_domain`, `stored_digest`, source/dependency walks conflate JCS inputs, owner integers, Storage uint64 and physical values; separate domains with the shared helper, without local caps.
- **S-N4:** `payload_bytes` uses the restricted integer/string fixture codec; adopt SP-1100 where general physical values are needed, preserving float types and signed zero.
- **S-N5:** `record_rules`, `identity`, `schema_validate` still resolve current same-URI resources for originals; adopt SP-1101's authenticated original tuple and frozen schema/recipe/format resources. Keep valid predecessor and forgery controls.
- **P1:** restructure into named predicate guard tables and adopt `scripts/pm_guard_isolation.py` after the shared tool passes. Whole-lane predicate/duplicate completeness remains unproved until then. Existing AST/removal-set artifacts are superseded as proof claims.

## Scope and evidence

No admissions, registry append, Decision Log entry, new PlanUnit ID, new binding, test-file edit, governance artifact edit, local number helper, pm-mail or subagent. Existing IDs only: EP-210..225, CV-500..515, SP-500..515, ATS-250..257; cited DL-401. Source changes in this sweep are EP-216, the semantic checker and its graph-ID fixtures. Rebase regeneration covers the lane's existing EP/CV/SP/ATS edits; no other document's shards changed. All 15 ignored currentness inputs were copied and SHA-256 matched. The temporary worktree is removed after the lane branch is pushed; main is never pushed.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/`.

- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/f20-verification.json` — SHA-256 `f32545d00250430b2d6021ab471d6c0537b1e73333b465eb2060be62ca34179a`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/f20-cli-verification.json` — SHA-256 `f8b46c3cf4d9cc23b9471a58f34f648d5c7cea5d2adb174fb0b132c45112f4ad`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/own-probes.json` — SHA-256 `64213529110079724adf1dfcdeb02ad881876505ad7779efe51fc759bfcd0f7c`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/preservation.json` — SHA-256 `5754ef09343ef79076393da68deea3cfb3397f6dee3f728cd8ab3acb78122b9c`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/checks.json` — SHA-256 `3a9de2be5e8064860fd928adb8e11596202ba1f624b901eb1f42ffddf32b1582`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/quote-audit.json` — SHA-256 `fe013898af395ac50dc3b6b8f23c2faf405520d316f931ae60dd00a87c28a296`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/currentness.json` — SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.
- `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/sweep-p1/index-baseline-comparison.json` — SHA-256 `86d9e1dcb562a0beb6fbeaddb299ce2b7d6291163e30e4cec1813cb2a54d26da`.

## Original contract binding/search lineage

The earlier per-family searches and newly authored bindings below are retained as source lineage. Their earlier grades and proof-completeness claims are superseded by this sweep report and its explicit part-2 gaps. The original binding searches remain source lineage; CV-500..515 and SP-500..515 received round 8’s numeric/format amendments.

### First-pass independent binding searches

Each row below independently searched all live top-level Plans markdown/JSON before writing. Generated shards, ledger source memory and historical audits were excluded as authority. The search captured every exact-name hit with its source line/text. Existing EventRecord, runtime snapshot/execution context, Case L-5 dedupe, SP-278 generic index and SP-286/CV-339 full-value receipt contracts are reused. No family borrows a sibling identity. New emitter/reader/version and hash recipe are labeled newly authored owner contracts. No new projector/checkpoint ID, physical family or retention policy was created.

Raw per-family search: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/binding-search.json`, SHA-256 `5c17e252b884e1f4ac1d574f73f06a9648d49ba78901729586091c2a4ee91578`.

### `attempt.completed`

Search: 12 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2753, Plans/Contracts_V0.md:15232, Plans/Contracts_V0.md:15241, Plans/Contracts_V0.md:15259, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.attempt_completed.emitter.v1@1.0.0`. New operating consumer: `executor.attempt_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-500. Transition: active_attempt -> terminal_attempt; terminal outcome must have success=true or failure_class, never both; retry/backoff evidence is not a second dispatch.

### `attempt.started`

Search: 16 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:508, Plans/Contracts_V0.md:522, Plans/Contracts_V0.md:2741, Plans/Contracts_V0.md:15181, Plans/Contracts_V0.md:15191, Plans/Contracts_V0.md:15209, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.attempt_started.emitter.v1@1.0.0`. New operating consumer: `executor.attempt_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-501. Transition: admitted candidate -> started attempt; frozen permission/model/runtime snapshots and exact worktree baseline are durable before the barrier; increment policy counters once before worker spawn.

### `node.blocked`

Search: 39 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:598, Plans/Contracts_V0.md:712, Plans/Contracts_V0.md:2453, Plans/Contracts_V0.md:2455, Plans/Contracts_V0.md:2459, Plans/Contracts_V0.md:2762, Plans/Contracts_V0.md:2814. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_blocked.emitter.v1@1.0.0`. New operating consumer: `executor.node_blocked.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "blocked_sequence", "event_sequence"]`; exact RFC8785/hash recipe in SP-502. Transition: eligible node -> blocked episode; mint blocked_sequence once per actual episode under node CAS. Before an attempt exists omit attempt_id. Required restore anchors and snapshot refs publish atomically with the block, never fabricate a prior attempt.

### `node.completed`

Search: 4 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:940, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7104, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_completed.emitter.v1@1.0.0`. New operating consumer: `executor.node_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-503. Transition: verified -> done or verify_pending -> failed; preserve verifier and packaging evidence. Removing a node from the ready set cannot complete it.

### `node.started`

Search: 4 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:939, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7103, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_started.emitter.v1@1.0.0`. New operating consumer: `executor.node_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-504. Transition: queued -> in_progress after admitted readiness and frozen actual attempt; a ready event alone cannot start a node.

### `node.unblocked`

Search: 55 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:598, Plans/Contracts_V0.md:921, Plans/Contracts_V0.md:2478, Plans/Contracts_V0.md:2480, Plans/Contracts_V0.md:2491, Plans/Contracts_V0.md:2815, Plans/Contracts_V0.md:14271. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.node_unblocked.emitter.v1@1.0.0`. New operating consumer: `executor.node_unblocked.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "blocked_sequence", "event_sequence"]`; exact RFC8785/hash recipe in SP-505. Transition: matching unresolved blocked episode -> resolved; require the exact ordered action/current prerequisite and durable recovery result. No stale approval and no safe-point anchor release before its owner terminal result.

### `plan.decomposition_degraded`

Search: 12 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2665, Plans/Contracts_V0.md:2709, Plans/Contracts_V0.md:14819, Plans/Contracts_V0.md:14828, Plans/Contracts_V0.md:14843, Plans/Contracts_V0.md:15040, Plans/Contracts_V0.md:15049. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.plan_decomposition_degraded.emitter.v1@1.0.0`. New operating consumer: `executor.plan_decomposition_degraded.history_reader.v1@1.0.0`. New identity input order: `["project_id", "source_stage", "event_sequence"]`; exact RFC8785/hash recipe in SP-506. Transition: pre-lock decomposition -> degraded pre-lock shape; graph_locked=true rejects. Shapes are redacted bounded shape descriptors, not plan bodies; evidence_ref resolves the original evidence.

### `remediation.resolved`

Search: 45 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:417, Plans/Contracts_V0.md:500, Plans/Contracts_V0.md:540, Plans/Contracts_V0.md:778, Plans/Contracts_V0.md:2643, Plans/Contracts_V0.md:2646, Plans/Contracts_V0.md:2657. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.remediation_resolved.emitter.v1@1.0.0`. New operating consumer: `executor.remediation_resolved.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "child_attempt_id", "remediation_root_id", "remediation_generation", "event_sequence"]`; exact RFC8785/hash recipe in SP-507. Transition: active remediation child -> fixed, superseded, abandoned or replan_required with exact original parent/root/child joins; ceiling_exceeded is blocked-state evidence, not a current resolution.

### `remediation.spawned`

Search: 33 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2626, Plans/Contracts_V0.md:2628, Plans/Contracts_V0.md:2630, Plans/Contracts_V0.md:2784, Plans/Contracts_V0.md:2816, Plans/Contracts_V0.md:14697, Plans/Contracts_V0.md:14706. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.remediation_spawned.emitter.v1@1.0.0`. New operating consumer: `executor.remediation_spawned.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "child_attempt_id", "remediation_root_id", "remediation_generation", "event_sequence"]`; exact RFC8785/hash recipe in SP-508. Transition: classified failed parent -> admitted remediation child, within existing generation/ceiling policy; append lineage before child dispatch; child_attempt_id is the child attempt identity, never the parent.

### `run.completed`

Search: 47 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:938, Plans/Contracts_V0.md:2366, Plans/Contracts_V0.md:7072, Plans/Contracts_V0.md:7102, Plans/Contracts_V0.md:13479, Plans/Contracts_V0.md:13489, Plans/Contracts_V0.md:13507. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_completed.emitter.v1@1.0.0`. New operating consumer: `executor.run_completed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-509. Transition: active run -> owner-declared terminal result only after all required Document Set packaging audits pass and in-flight work is reconciled. Canonical usage remains usage.event; optional usage_ref resolves the UF-085 snapshot; no legacy inline token tuple.

### `run.graph_integrity_failed`

Search: 8 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2675, Plans/Contracts_V0.md:14863, Plans/Contracts_V0.md:14871, Plans/Contracts_V0.md:14886, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_graph_integrity_failed.emitter.v1@1.0.0`. New operating consumer: `executor.run_graph_integrity_failed.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-510. Transition: active graph validation -> integrity failure and replan path; never convert locked graph corruption into pre-lock decomposition degradation or blind retry.

### `run.node_backoff_expired`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2507, Plans/Contracts_V0.md:14363, Plans/Contracts_V0.md:14371, Plans/Contracts_V0.md:14387, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_backoff_expired.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_backoff_expired.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-511. Transition: matching active backoff -> elapsed wake only at or after durable backoff_until_utc; no attempt dispatch or success inferred from timer expiry.

### `run.node_backoff_started`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2497, Plans/Contracts_V0.md:14320, Plans/Contracts_V0.md:14328, Plans/Contracts_V0.md:14344, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_backoff_started.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_backoff_started.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-512. Transition: classified retryable failure -> scheduled backoff with existing per-error budgets; no retry of graph_integrity, verification_failed or reviewer_findings; timer never converts to terminal success.

### `run.node_ready`

Search: 5 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2444, Plans/Contracts_V0.md:14127, Plans/Contracts_V0.md:14135, Plans/Contracts_V0.md:14151, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_ready.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_ready.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-513. Transition: not ready -> dependency-satisfying ready; all blockers resolve and current graph/Spec Lock/capacity requirements pass. Preserve ready_since_utc while continuously ready, do not dispatch from this event.

### `run.node_retry_scheduled`

Search: 7 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:2515, Plans/Contracts_V0.md:14406, Plans/Contracts_V0.md:14415, Plans/Contracts_V0.md:14431, Plans/Decision_Log.md:579. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.run_node_retry_scheduled.emitter.v1@1.0.0`. New operating consumer: `executor.run_node_retry_scheduled.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "node_id", "prior_attempt_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-514. Transition: classified prior attempt -> scheduled successor admission under the existing retry budget; preserve prior identity, verify safe-point/worktree and refresh permission before any distinct successor attempt.

### `scheduler.pass`

Search: 71 exact-name hits; partial-contract evidence: Plans/Contracts_V0.md:540, Plans/Contracts_V0.md:712, Plans/Contracts_V0.md:2418, Plans/Contracts_V0.md:2423, Plans/Contracts_V0.md:2425, Plans/Contracts_V0.md:2732, Plans/Contracts_V0.md:2740. Current semantic minima were read independently, including the March addenda, current taxonomy, July sequence fallback and current snapshot naming closure.
Inspected exact-name hits do not define this family's versioned operating reader with complete SP-278 adoption, exact identity hash recipe and withdrawal fences. Existing semantic minima and shared index/receipt contracts are reused; the new family-specific binding below is newly authored under DL-045, not inferred from run.started.
New emitter: `executor.scheduler_pass.emitter.v1@1.0.0`. New operating consumer: `executor.scheduler_pass.history_reader.v1@1.0.0`. New identity input order: `["project_id", "run_id", "scheduler_pass_id", "event_sequence"]`; exact RFC8785/hash recipe in SP-515. Transition: one pending wake set -> one scored pass, before dispatch; first recovery wake is startup_recovered. Select at most available_slots using the canonical score order, retain every nonselected ready node and its exclusion reason. Legacy non_selected is import-only.


## Pass-two evidence receipts

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-binding-search.json` — SHA-256 `bf22655fd256e6ec4e3cfbfde40da9b90cc84f4b487573365a8d41184a9b7600`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-id-search.json` — SHA-256 `c329cfa01802d3529a337baac0205a34824ec84317f0fe899a70af7b6c096400`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-currentness-sha256.log` — SHA-256 `7861f231de81ca0ce756a9b27d297e2c5f2700a7f7a000697492191912f685e1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DX/pass2-runtime-baseline.json` — SHA-256 `abac3b4abdee0293aebdb2863521002a67ce5f5eaf1a7694e90518f8df898e1b`.
