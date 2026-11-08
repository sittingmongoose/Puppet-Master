# Lane DX — sweep part 2A (guard tables on the gated tool) and part 2B numbers

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

**What Astra keeps finding, probed for part 2A.** (1) Digests and identities are recomputed in derivation and compared by rows (SD01, DC03, HI01–HI03, PK03); forged copies are the negatives, and DD01 refuses an original authenticated for another family. (2) Storage-assigned fields are compared with the owner record (RV01–RV04, TX02, TX07, TX08), never trusted from the event; retry compares only the original semantic body (TA02). (3) The current-writer replay row AP01 never runs on a retained original (historical routes use HP01); retained `projector_replay_only` history stays accepted, and withdrawn, forged, unknown or replaced originals refuse (RB01–RB05, HI01–HI03, DD01). (4) Joins compare exact typed values (`typed`) on both sides; the number pass below removes the JCS range from joins. (5) SR02/SR03 resolve every `$ref` per document root, dormant branches included. (6) PT04 measures the encoded inline body; the reference route checks every descriptor and pack field (PR01–PR06, PK01–PK12). (7) Every capture runs source custody, dependencies and the publication order; required slots come from the adapter, never the caller (SS01). (8) Masked negatives: tool `masked` empty on every row; complete-boundary re-runs above. (9) Grades unchanged; the scheduler oracle cell stays PARTIAL. (10, 10a) The number pass below. (11) Type rows test the exact type name (`type(x).__name__`) and identity with `True`/`False`, with string, number, null, array and object negatives in the existing type fixtures. (12) Timestamp formats: part 2B; interim review below.

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

## Timestamp fields — interim only

This is my own review of the DX timestamp fields, and it is **interim only** (pm7-build, 2026-11-05 16:50Z), not a certification. No date-time code from NUMRULE is adopted, and no timestamp rule changed in this pass. The DX owner text (CV-500..515) sets a stricter field-owner profile than CV-1101's broad one: complete UTC strings `[Tt]` … `Z` with calendar validity, hours 00..23, minutes and seconds 00..59, no leap seconds, unlimited fraction digits, no trailing bytes; backoff clock observations need an uppercase T. What the checker does today:
- **Payload schemas** (`ts`, `backoff_until_utc`, nested `ready_since_utc`): full-match patterns `^…[Tt]…Z(?![\s\S])` plus the strict format checker `valid_timestamp` (`scripts/pm_executor_event_semantics.py:406`), which re-checks the calendar (`calendar_valid`, `:416`). The isolated stock-checker route (`stock_schema_validate`) relies on the stock `FormatChecker` and the pattern.
- **Parsed clocks** (`instant`, `:544`; rows TS01–TS03, TZ01): under the current recipe every `utc=True` clock needs uppercase T and Z (`UTC_TIME`, `:36`). That is stricter than CV-515 for ordinary scheduler ready and wake clocks, which admit a lowercase `t`: **F19**, still open.
- **Retained v0 originals**: spelling-only schema checks; semantic clock parsing still applies (TS03 refuses a validly spelled 31 November). The v0 grammar is selected by the authenticated custody edition in code, not by a frozen date-time resource.
- **Retry-After**: delta seconds, or an HTTP-date parsed by `email.utils.parsedate_to_datetime` that must carry a zone (RA01, RA02); obsolete HTTP-date forms are not checked against EP-032's exact grammar.

## Part 2B items

Timestamp items only; each needs CV-1101 (date-time gate not yet passed) and is left exactly as it was:
- **F19 / CV-1101 field-owner profile.** `scripts/pm_executor_event_semantics.py:544` (`instant`, default `utc=True`), `:36` (`UTC_TIME`), `:652` (`validate_score_domain`), `:839` (`validate_scheduler` ready and wake sorts), `scripts/pm_executor_event_contracts.py:43` (`validate`: shape scheduler order and backoff clocks); owner `Plans/Contracts_V0.md` CV-515. Ordinary ready-since and wake clocks admit lowercase `t`; backoff observations keep uppercase T; final Z, calendar and full precision stay. Add coherent lowercase-`t` capture/shape/wake positives and replace the two `F19-wake-*-lower-t` negatives.
- **CV-1101 adoption at the DX timestamp boundaries.** `valid_timestamp` (`:406`), `calendar_valid` (`:416`), `DATE_TIME` (`:35`), `schema_validate`/`stock_schema_validate` format checkers, the 16 payload schemas' timestamp patterns, rows TS01–TS03, TZ01, RA01, RA02: `datetime_validator`/`date_time` with DX's stricter owner profile selected explicitly; leap-second, offset, lowercase and trailing-byte negatives from the shared battery.
- **SP-1101 frozen date-time profile for history.** `record_rules` (`:153`) and `valid_timestamp`'s v0 branch: the v0 spelling-only grammar becomes the frozen original resource/profile selected through the dispatcher, not a code branch.
- **Retry-After HTTP-date grammar.** `retry_after_deadline` and `validate_retry` (`:575`): EP-032's exact HTTP-date grammar against `parsedate_to_datetime`'s permissive forms.

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
