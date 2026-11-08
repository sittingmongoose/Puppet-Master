# Lane DC — sweep part 2A: guard tables on the gated guard tool

Branch `plans/ea-collab-prep-20261104`; part 2A start `f27a51130c`; gated tool merge `1990b6bd33` (tool `004bdedd63`, eleven files, none edited); implementation commit `ff8520b261`. The delivery head is in the external `HEAD.txt`. No rebase onto main this round.

**All 18 families keep 10 PASS / 1 PARTIAL / 1 ABSENT.** Part 2A closes SW-P1: every refusal of the checker is one named row of a guard table, and the gated tool proves **322 of 322 rows** in 111 tables, with no masked negative and no unrelated change. `positive_negative_oracles` stays PARTIAL because SW-N1..SW-N5 (shared number rule) and SW-F1 (timestamp grammar) are part 2B. Membership stays ABSENT; native execution is NOT_RUN. Sol and Astra review the lane once, after part 2B.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` with `--no-ff` as `1990b6bd33`: exactly the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat 1990b6bd33^1 1990b6bd33` lists 11 files; `git diff 1990b6bd33 HEAD -- scripts/pm_guard_isolation.py` is empty. |
| **SW-P1 — guard tables** (fixed, `0c7344493d`) | Every product and integrity refusal of `scripts/pm_collaboration_events.py` is one named row in one of 111 phase tables (322 rows, at most seven each), generated from one row spec. The checker derives observations (canonical SHA-256 digests, recomputed identities, resolved routes, presence) for the phase it is about to evaluate and refuses only through `table_refusals`; integrity collectors use the same rows through `collect`. Or-chains are split into one row per predicate. A reused boundary (payload, envelope, reference, source) is a phase chain of its callers; a caller that forwards it under a legacy code (`payload`, `source_payload`, `checkpoint_event`) still refuses through the boundary's own row. Every legacy code and result is unchanged. | `scripts/pm_collaboration_events.py:129` (`table_refusals`), `:147` (`refusal`), `:153` (`collect`), `:171` (`table_order_errors`); row spec `scripts/pm-collab-table-generate.py`; generated `scripts/pm_collab_table_*.py` | `python3 scripts/pm-collab-table-generate.py --check` (no stale or extra module); full checker `pass`, including `table_require_order`; differential below. |
| **SW-P1 — behaviour preserved** | A differential runs the previous checker (`f27a51130c`) and this one over every earlier probe (27,492), every earlier integrity case (68), the fixture report and every collector. | `differential.log` in the evidence | 0 mismatches. |
| **SW-P1 — retired machinery** (fixed, `0c7344493d`) | Removed `guard_removal_report`, `schema_guard_removal_report`, `integrity_guard_removal_report` and the `--guard-removal` / `--guard-layer` flags (the AST rewrite, `exec` mutants and trace-based removal tables). The self-test is unchanged. | `scripts/pm_collaboration_events.py` `main` | `--guard-removal` is no longer an argument. |
| **SW-P1 — adapter and runner** (fixed, `270c3b0021`) | Suites are built from the checker's own witnesses run once under its observation recorder: accepted invocations give controls; each refused witness gives the observation of its FIRST refusal, targeted at the refusing row. One tool run per table, all eighteen families' witnesses together; each row's proving families are recorded. Unexpected results, untracked refusals and two-row witnesses are reported, never relabelled. | `scripts/pm_collab_guard_suites.py:106` (`collect`), `:160` (`complete_boundary_flip`), `:185` (`lane_matrix`), `:215` (`suite_for`); `scripts/pm-collab-guard-tables.py` | `python3 scripts/pm-collab-guard-tables.py --out <dir>` (batches with `--phase`, `--save-collection` / `--load-collection`). |
| **Two-defect negatives the lane matrix reported** (fixed, `0c7344493d`) | Ten witness groups refused at two rows of one table once or-chains were split. Nine are fixed; the tenth (`:roster`) is two rows by construction (next rows). Seven are rebuilt so every copy of the changed fact moves together: checkpoint `:cursor` (context cursor copy too, CK15 alone), `:index_through_sequence_id` (cursor copies too, CK10 alone), source `:owner_record_ref` (captured control too, SF11), `:participant_identity` (captured identity too, SF28), `:review_pack` (captured pack too, SF31), `:required_snapshot` (captured control too where the body copies requiredness, SF38/SF39), `:currentness` (record copy too, SF40). Two are fixed in the rows: EV04 compares project ids only between records of the same scope kind (an application record carrying a project payload is EV03 alone), and SF15 no longer repeats the identity joins SF14 already compares (170 witnesses; no field is compared by two rows, so there is no duplicate set). SF45–SF47 compare a roster only when it has distinct slots (SF43/SF44 own duplicates). | `scripts/pm_collaboration_events.py:1747`, `:1777`, `:1784`, `:1818`, `:1822`, `:1849`, `:1854`, `:896`; `scripts/pm_collab_table_envelope_scope.py:21`; `scripts/pm_collab_table_source_roster.py:29` | Lane matrix: 0 problems in every table; tool: no masked negative. |
| **Missing negatives for unproved rows** (fixed, `0c7344493d`) | 83 rows had no negative of their own, and CK12 and SF15 only two-row ones. `scripts/pm_collab_p2a_cases.py` adds 251 probes and 40 integrity cases, each from a named valid parent of its own family with one changed fact: non-object payload, source holder and history control (PO01, SO01, HI01), negative write epoch (HI07); checkpoint token/selection/context instance copies, cursor end, cursor context/generation/frame/sequence and last-event scope/project (CK03–CK06, CK11, CK12–CK14, CK16–CK18); renamed record joins, terminal record time, waiver actor and actor ref, identity slot and captured identity, pack run and captured pack, duplicate snapshot/record slots, record roster order, Review targets/reviewer control/duplicate vote, wrapper instance and scope (SF15, SF20, SF25–SF27, SF29, SF30, SF32, SF43, SF44, SF46, SF52, SF53, SF57, WR04, WR06); transition revision, kind, collaboration, latest revision, unsynthesized BrainStorm, removed slot, attempt slot/revision, message attempt slot, proposal attempt slot, superseded vote attempt and unaccepted partial coverage (TR05, TR06, TR12, TR13, TR16, TR23, TR29, TR33, TR34, TR43, TR47, TR51, TR65); every physical and prepared-source binding field, binding source/owner schemas and checkpoint adoption, ledger row event type, family id form, payload anchor, ref path/definition and scope policy, payload definition type, fixture numeric validity, edition, valid-event payload case, identity partition, five family case floors, and table order. | `scripts/pm_collab_p2a_cases.py:13` (`probes`), `:177` (`integrity_cases`) | Every table: `rows_without_negative` empty; full checker `pass` with every expected code. |
| **Witnesses excluded from the table proof** | 4 witnesses stay refused negatives in the full checker but are not single-row proof: source `:roster` for `collaboration.created` and `collaboration.configuration_changed` in both scopes. An extra slot in `slot_requirements` contradicts every copy of the roster (captured control SF45, record specs SF46, body roster SF47) by construction; `original_control:participant_slot_ids`, `r2:semantic_roster` and `p2a:...:record_roster_order` prove each row alone. | `scripts/pm_collab_guard_suites.py:28` (`EXCLUDED_PATTERNS`) | Listed in `DC.guard-tables.json` `excluded`. |
| **Part 1 handoff: requiredness, subsumption, fixed width** | Classified under Method B. Each schema occurrence (payload edition, source family, EventRecord, checkpoint, wrapper, component definition) is one row of its table, refusing whatever the closed schema refuses; required members, fixed-width lengths and the 72 identity-input required members are clauses of that schema row, witnessed by the 19,322 schema negatives (each refused by its schema row) and never merged with a checker predicate. No keyword-level cut is claimed: the tool's per-keyword `SchemaCatalog` route is not used for these 509 KB/208 KB/198 KB schemas. Checker predicates that an earlier row subsumes carry that row's pass condition instead of being merged (EV04, SF03, SF37, SF38, SF45–SF47, retention value rows, TR rows over a known attempt or finding). | row spec `scripts/pm-collab-table-generate.py` | Table rows SH01, PS01, SO03, EV01, CK01, WR01. |
| **Membership table without a control** (fixed, `ff8520b261`) | The registry holds none of the 18 prepared families, so no valid membership row was ever evaluated and `int_membership_row` had no control. `integrity_controls` plants one valid state (an admitted ledger row whose registry row equals its prepared row); the full checker requires it to report no failure. | `scripts/pm_collab_p2a_cases.py:289` (`integrity_controls`); `scripts/pm_collaboration_events.py:2323` (`integrity_failures`) | Both membership tables re-run at `ff8520b261`: PASS, 3/3 rows. |
| **ATS-230 legacy proof claim** (fixed, `8463edd7a9`) | The check-11 bullet, the round-one paragraph, the guard-removal sentence and the canonical text name the guard tables and the shared tool; the runner joins the validation and implementation surfaces. The number and timestamp sentences are unchanged (part 2B). | `Plans/Automated_Testing_System.md:7248`, `:7281`, `:7296`, `:7353` (ATS-230) | Shards and index regenerated; only Automated_Testing_System outputs changed; shard check pass. |
| **SW-N1..SW-N5 — shared number rule** | Part 2B (needs NUMRULE gates). | Listed below | — |
| **SW-F1 — timestamp grammar** | Part 2B. Interim review only (below). | Listed below | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new PlanUnit, Decision Log or admission IDs; ATS-230 changes in place. New fixture-free witness IDs are the `p2a:` probes and `integrity:p2a:` cases.

## Guard-table result

The gated tool ran **111 table suites**: **322/322 rows proved**, 0 failed suites, 4149 distinct single-row negatives (23131 further witnesses with an identical observation ride as aliases), 86,061 tool evaluations. Lane matrix problems: 0. Open collection findings: 0. Credit is the tool's own `rows[].proved`.

Each cut swaps one table row to always-pass; the tool then runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. Own negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays"). Controls given to the tool are every family's first control of the table, then the rest in recorded order up to 40; the lane matrix checks every control and negative directly.

| Checker | Tables | Rows | Rows proved | Unproved | Cut: own flips / own | Cut: stays | Unrelated changes | Masked |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Reducer admission (transitions) | 21 | 67 | 67/67 | none | 87/87 | 309 | 0 | 0 |
| application_wrapper_rejection (SP-351) | 2 | 6 | 6/6 | none | 72/72 | 212 | 0 | 0 |
| checkpoint_rejection (projection checkpoint) | 6 | 19 | 19/19 | none | 46/46 | 156 | 0 | 0 |
| envelope_rejection (EventRecord joins) | 6 | 14 | 14/14 | none | 137/137 | 462 | 0 | 0 |
| fixture_report oracles | 12 | 30 | 30/30 | none | 30/30 | 74 | 0 | 0 |
| historical_rejection (retained reader) | 2 | 8 | 8/8 | none | 1012/1012 | 6048 | 0 | 0 |
| integrity collectors (schemas, units, ledger, registry, references, physical, ATS, probes) | 31 | 77 | 77/77 | none | 77/77 | 238 | 0 | 0 |
| payload_rejection (CV-460 payload layers) | 3 | 8 | 8/8 | none | 442/442 | 2200 | 0 | 0 |
| prepared_event_rejection | 1 | 2 | 2/2 | none | 80/80 | 80 | 0 | 0 |
| read_token_rejection (SP-278 exemption) | 1 | 1 | 1/1 | none | 1/1 | 0 | 0 | 0 |
| representation / reference_rejection (SP-337) | 3 | 8 | 8/8 | none | 88/88 | 248 | 0 | 0 |
| retention_rejection (DL-092 policy) | 5 | 16 | 16/16 | none | 60/60 | 247 | 0 | 0 |
| shape probes (schema occurrences) | 1 | 1 | 1/1 | none | 1/1 | 0 | 0 | 0 |
| source_rejection / source_fact_rejection (prepared custody) | 16 | 64 | 64/64 | none | 2015/2015 | 8000 | 0 | 0 |
| table order | 1 | 1 | 1/1 | none | 1/1 | 0 | 0 | 0 |

Rows each family's own witnesses prove (a row is credited per table; shared rows are proved by every family that reaches them, and family-specific rows only by their family):

| Family | Rows proved by its own witnesses |
|---|---:|
| `brainstorm.plan_synthesized` | 62 |
| `brainstorm.proposal_added` | 61 |
| `brainstorm.vote_added` | 62 |
| `collaboration.artifact_added` | 62 |
| `collaboration.cancelled` | 68 |
| `collaboration.completed` | 70 |
| `collaboration.configuration_changed` | 68 |
| `collaboration.created` | 72 |
| `collaboration.failed` | 62 |
| `collaboration.message_added` | 71 |
| `collaboration.participant_completed` | 65 |
| `collaboration.participant_started` | 66 |
| `collaboration.paused` | 62 |
| `collaboration.resumed` | 64 |
| `collaboration.started` | 81 |
| `review.artifact_finalized` | 69 |
| `review.finding_added` | 61 |
| `review.finding_dispositioned` | 63 |
| `shared` | 154 |

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`), as in DR and DG6B. The complete path is the full checker, which reaches every refusal through the same rows. As lane evidence beyond the tool, each refused witness was re-run through the whole checker with only its refusing row cut: 25,817 are then accepted and 1,463 are refused later by a distinct invariant that watches the same source fact (kinds and counts per cut row in `DC.guard-tables.json` `complete_boundary_flips`): the event id recipe sees the epoch a cut history or source epoch row let through (EV14, 324); a cut type or shape row leaves derivation reading a wrong-typed field (`derivation_requires_cut_row`, 527); a payload schema negative in a timestamp or identity field also fails the timestamp or identity-recipe row (PR03, PR04, 272); a missing captured control slot, once SO05 is cut, fails the row that reads that slot (SF02, SF10, SF13, SF21, SF36, SF40, SF42, SF59: 40 each); and 20 others (CK16, EV01, TR17, EV04, RT02, CK07, TR27, IF14). None reaches a second row of its own table, so each stays a single-row negative for the tool.

**What Astra keeps finding, probed for part 2A.** (1) Identities and digests are recomputed in derivation and compared by rows (PR04, EV14, SF04–SF10, CK08, HI08, WR03); forged copies are the negatives. (2) Retry compares only the producer digest of the caller body (TR01); `:assigned_metadata` (Storage sequence and times changed) stays accepted. (3) The current-writer replay row EV06 is its own phase, never called for a retained original or a checkpoint's last event; `:retained_replay_only` stays accepted, withdrawn/forged originals refused. (4) Object joins compare SHA-256 of canonical bytes on both sides (`canonical_sha`); scalar joins keep their original operator; number spelling is part 2B. (5) IX01 resolves every `$ref` per document root, unused branches included; the self-test's unvisited-reference control still fails the CLI. (6) RP01 measures the inline body, WR02 the complete MessagePack wrapper. (7) Every prepared route runs source, wrapper, envelope and prepared joins; required slots come from the owner snapshot and the captured control (SF36–SF39), never a caller-supplied success set; the envelope family row EV02 refuses a sibling family. (8) Masked negatives: tool `masked` empty on every row; complete-boundary re-runs reported above. (9) Oracle cells stay PARTIAL. (10, 10a, 12) are part 2B. (11) Type rows are separate (`type(...).__name__` names and `is True`/`is False`), with string, number, null, array and object negatives.

**Timestamp fields — interim only.** This is my own interim review of the timestamp fields (pm7-build, 2026-11-05 16:50Z), not a certification. Every DC validator is a `Draft202012Validator` with no format checker. The payload `utc_timestamp` (`Plans/collaboration_event_payloads.schema.json:21`) is a full-match pattern ending in `Z` with 1–9 fraction digits; PR03 (`valid_utc`, `scripts/pm_collaboration_events.py:307`) then refuses `2026-02-30` and `23:59:60`, but **accepts `24:00:00Z`** (Python 3.14 `fromisoformat`). `valid_utc` alone also accepts a lowercase `t`, a space separator, minutes-only and basic-format times, which the payload pattern refuses first. The owner-record `utc_timestamp` (`Plans/collaborative_workflows_contracts.schema.json:213`) uses an unguarded `$`, so it accepts a trailing LF, numeric offsets and impossible dates; original-source times (SF17, SF18, SF20) and EV13 join those spellings as strings. Part 2A adds no date-time rule and changes no timestamp field.

## Part 2B items

- **SW-N1 — shared number parsing (CV-1100).** `scripts/pm_collaboration_events.py:192` `decode_json`, `:231` `canonical`, identity helpers `:279`–`:294` (`subject_values`, `owner_operation_id`, `idempotency_key`, `event_id`); `Plans/storage-plan.md:29603` (SP-460). Preserve local identity tuples and prefixes.
- **SW-N2 — physical profiles (SP-1100).** `:688` `reference_rejection` (`decode_json` of packs), `:1065` `application_wrapper_rejection` (MessagePack size), `:1581` `stored_size_report`, `:713` `payload_reference`; SP-460. Keep finite float types and Storage uint64, no 2^53 cap.
- **SW-N3 — signed zero and integer/float distinctions.** `:231` `canonical`, `:302` `same_fact`, `:163` `canonical_sha` (every object join of the tables), row and reference commitments.
- **SW-N4 — digest recipes.** `:298` `producer_digest`, `:251` `row_sha256`, `:255` `jcs`; `Plans/Contracts_V0.md:24489` (CV-460), SP-460. Payload-only producer projection stays; no v1 restamping.
- **SW-N5 — authenticated historical recipe selection (SP-1101).** `:812` `historical_rejection` (identity domain from the captured `write_epoch`), `:763` `checkpoint_rejection` last-event pass; no caller-selected weaker recipe, no current-first fallback.
- **Number-domain row operators (kept as written).** PR02/PR05/PR06 (`pm_collab_table_payload_rules.py`), SF03 (`pm_collab_table_source_identity.py`), CK11/CK13/CK14 (`pm_collab_table_checkpoint_join.py`, `pm_collab_table_checkpoint_cursor.py`), HI07, TR15/TR16/TR18/TR31/TR40/TR65/TR66 and SF56–SF58 keep the original Python comparisons; the shared rule decides spelling and range.
- **SW-F1 — timestamp grammar.** `Plans/collaborative_workflows_contracts.schema.json:213` and `Plans/collaboration_event_payloads.schema.json:21` (`utc_timestamp`), `scripts/pm_collaboration_events.py:307` `valid_utc` (PR03), original-source times SF17/SF18/SF20 and the EV13 string join, and the absent format checker in `validator`. Exact current calendar/zone/fraction/LF grammar with isolated negatives, authenticated old-original grammar selection; retained schemas are not tightened in place. Interim review only.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part 1 self-grade; after is this part 2A self-grade at the implementation commit.

| Family | Before → after |
|---|---|
| `collaboration.created` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.started` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.paused` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.resumed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.cancelled` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.completed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.failed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.participant_started` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.participant_completed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.message_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.artifact_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.configuration_changed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `brainstorm.proposal_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `brainstorm.vote_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `brainstorm.plan_synthesized` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `review.finding_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `review.finding_dispositioned` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `review.artifact_finalized` | 10P / 1Q / 1A → 10P / 1Q / 1A |

**180 PASS / 18 PARTIAL / 18 ABSENT → the same totals.** Every self-grade evidence quote was relocated mechanically at the implementation commit with zero mismatches; each oracle cell now also cites ATS-230's guard-table sentence and `table_refusals`.

## Commands and evidence

Heavy checkers ran one at a time with at least 10 GB available (the tool MemoryGate pauses below 10 and resumes at 11). PM7 work was not waited on or touched. Commits: `1990b6bd33` (tool merge), `0c7344493d` (tables, witnesses), `270c3b0021` (adapter, runner), `8463edd7a9` (ATS-230, shards, index), `ff8520b261` (membership control), then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p2a/` (SHA-256 of every file in `SHA256SUMS`; large files gzipped).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files, none edited |
| differential: previous checker (`f27a51130c`) vs this one | 0 | 27,492 probes, 68 integrity cases, fixture report and 8 collectors: 0 mismatches (`differential.log`) |
| `python3 scripts/pm-collab-table-generate.py --check` | 0 | 111 tables, 322 rows; no stale or extra module |
| `python3 scripts/pm_collaboration_events.py --json` (inputs `ff8520b261`) | 0 | `pass`, 18 prepared rows, 0 admitted, 0 failures, no admission blocker; 27,743 probes and 108 integrity cases plus 1 control; 2 min 30 s, peak RSS 883 MB (`full-checker.stdout`) |
| `python3 scripts/pm_collaboration_events.py --self-test` | 0 | `pass`, 14/14 scenarios, including the failure-exit and unvisited-reference controls; 6 min 51 s (`self-test.stdout`) |
| `python3 scripts/pm-collab-guard-tables.py --out ... --save-collection ...` (batch 0, then batches 1-2 with `--load-collection`) | 0 | 110 tables `PASS`, 320/320 rows proved (`tool/batch0.log`, `tool/batch12.log`) |
| `python3 scripts/pm-collab-guard-tables.py --phase int_membership_row --phase int_membership_ledger` (fresh collection at `ff8520b261`) | 0 | both `PASS`, 3/3 rows; the other 109 suites are identical to the first collection (`collection-compare.json`) |
| complete-boundary flip re-run (`flips.json`, lane evidence) | 0 | 27,280 witness pairs: 25,817 accepted, 1,463 refused later by a distinct invariant or derivation |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`; only `Plans/_shards/automated_testing_system/` changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files hash-verified first) | 0 | `pass`; only Automated_Testing_System units changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 3,185 shards |
| `python3 scripts/pm-plan-index.py validate` (origin/main `5cbb92a5aa`) | 1 | top-level `fail`, 30 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers and 9 `plan_unit_removed_without_ledger_decision` (DL-333, DL-335..340, DL-349, UCC-230, added on main after this branch's base `d5ec2f70c0`); the identical set DR recorded at the same origin/main; none names a DC file. Integration rebase owns them. |

---

# Lane DC — sweep part 1 (earlier report, unchanged)

Branch `plans/ea-collab-prep-20261104`; tested implementation commit `8a57581d724f4b41c3c24a30ad08434711426aa4`. Rebased onto `origin/main` `d5ec2f70c0d69c469796eea9b9cfdae30f281f42` before fixture repair. This report supersedes the round-3 report for current grades and verification; its prior binding searches remain in `DC-binding-search.md` and earlier Git commits.

**Part 1 fixture repairs pass; the lane is NOT_READY pending part 2.** No deck-2 item was assigned to DC in this task. C4-B1, C4-B2 and C4-B3 are fixed. The production checker, schemas, identity/number helpers and legacy proof machinery are unchanged by the fixture repair. Current base materializes the selected Chat retention policy; retention rises to PASS. Membership remains ABSENT, oracles remain PARTIAL and native execution remains NOT_RUN.

## Sweep part 1: findings and responses

| Item | Response and location | How to verify |
|---|---|---|
| C4-B1 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** All 1,631 reviewed stale-key cases are rebuilt. Computable full payloads refresh the key; invalid primitive identity operands use their actual canonical property node and a valid counterpart. `Plans/collaboration_event_contract_fixtures.json:95452` is the reviewed created/Project LF witness. The inventory covers all 18 families and additional explicit payload peers. | `fixture-audit.json`: 14,302 full-payload key checks, zero stale keys; `guard-cases.json` lists every parent and actual guard. Run the full checker. |
| C4-B2 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** The original revision ID remains a coherent full-payload adjacency negative so the prepared ledger keeps its valid reference; `configuration_changed_revision_1:minimum_component` separately isolates the subsumed minimum at the actual property node. Four ordinary completed/failed count minima refresh the other reviewer count; both single-reviewer large-request cases refresh the completed count. Wrong-type arithmetic operands use primitive components. `Plans/collaboration_event_contract_fixtures.json:281918` and `:49155`. | The fixture audit checks 929 revision pairs and 1,054 reviewer sums, all coherent. Original adjacency and reviewer-sum rejection guards remain enabled in the full checker. |
| C4-B3 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** All 38 reviewed overlapping-enum negatives now target the root `state_before` property component. Two additional full-payload `paused` cases isolate the distinct non-End conditional, with the root predicate satisfied. `Plans/collaboration_event_contract_fixtures.json:38525` and `:8758`. | Actual property negatives and their valid counterparts run in schema probes; both full conditional witnesses run through `payload_rejection`. |
| C4-I1 rebase integration | **Advanced-main units incorporated in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** Landed DL-404 and the existing Storage policy are preserved; the inherited pending-policy timing claims in CWR-105..123, SP-460 and ATS-230 are corrected. Goal schema additions on main are preserved alongside DC wrapper additions. No retention value or Decision Log answer is changed. | The checker reports no missing-policy admission blocker; the final index result is recorded below without resealing. |

## Valid parents and per-guard inventory

2980 repaired or added cases: 1,402 canonical property-component witnesses and 1,578 full-payload witnesses. Each record names its valid parent, the target field, any refreshed companion and, for components, its valid counterpart. There are 243 new parent-specific component positives. The fixture has 19,322 schema negatives, 276 schema positives, 127 positive payloads and 193 explicit negative payloads.

`reports/event-authority-20261104/DC-sweep-p1-guards.json` groups the exact case IDs under 299 observed guard locations and records their parents. `guard-cases.json` retains the complete annotated inventory. This is fixture consistency evidence, not shared-tool guard-removal proof. The 72 missing identity-input required-member witnesses remain explicitly shape-boundary evidence; current identity cannot be evaluated without its required input. Part 2 must classify those dependencies/subsumptions without merging independent predicates. Existing fixed-width schema overlaps are also left to that predicate inventory.

## Part 2 items

| Item | Location and required work |
|---|---|
| SW-P1 | `scripts/pm_collaboration_events.py:2230,2385,2428`: adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`, **method B**, with named predicate functions in shared guard tables. Use the per-guard case inventory. Preserve compound peers; prove genuine duplicates site by site; classify requiredness/subsumption and fixed-width implications. The legacy table is not proof. |
| SW-N1 | `decode_json:106`, `canonical:145`, identity helpers `:193`, SP-460: adopt CV-1100 parsing/current integer-token admission; preserve local identity tuples and prefixes. |
| SW-N2 | Decoder/canonical/reference/wrapper/stored-size paths and SP-460: adopt SP-1100 owner-selected physical profiles; preserve finite float types/bytes and Storage uint64, with no 2^53 cap. |
| SW-N3 | `canonical:145`, `same_fact:216`, row/reference commitments and SP-460: preserve signed zero and integer/float distinctions in the selected physical domain. |
| SW-N4 | `producer_digest:212`, row/reference commitments, CV-460/SP-460: retain the payload-only producer projection and local recipe ownership; use qualified RFC8785 only where required, without v1 restamping. |
| SW-N5 | `historical_rejection:703` and current helper calls: adopt SP-1101 authenticated original edition/recipe selection, without caller-selected weaker recipes or current-first fallback. |
| SW-F1 | `Plans/collaborative_workflows_contracts.schema.json:213`, `utc_timestamp`, original source/wrapper paths: exact current calendar/zone/fraction/LF grammar and isolated negatives, with authenticated old-original grammar selection. Do not tighten retained schemas in place. |

No new number serializer, cap, guard-proof machinery, product binding, product decision, admission, registry member or PlanUnit ID is introduced in this sweep part.

## Family grades before and after

P/Q/A mean PASS/PARTIAL/ABSENT across the same twelve criteria. The nine prior PASS cells remain supported. Retention becomes the tenth PASS because the selected policy is materialized on the current base. Oracles stay PARTIAL until the shared method-B proof passes; membership stays ABSENT until separate admission.

| Family | Before P/Q/A | After P/Q/A | Preparation |
|---|---|---|---|
| `collaboration.created` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.started` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.paused` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.resumed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.cancelled` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.completed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.failed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.participant_started` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.participant_completed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.message_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.artifact_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.configuration_changed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.proposal_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.vote_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.plan_synthesized` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.finding_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.finding_dispositioned` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.artifact_finalized` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |

**Totals:** 162 PASS / 36 PARTIAL / 18 ABSENT → 180 PASS / 18 PARTIAL / 18 ABSENT. No family is READY or admitted. All 576 current self-grade evidence quotes were relocated and hashed mechanically, with zero mismatches.

## Verification

All heavy checker processes ran sequentially. The resource controller waited for the prior Nas1 lane, deferred while another checker was active, and paused its process group if available memory fell below 6 GB. Exact commands, exits, elapsed times and resource samples are in `check-results.json`.

| Check | Exit / result |
|---|---|
| `fixture-audit` | 0 |
| `checker` | 0 |
| `self-test` | 0 |
| `shards-generate` | 0 |
| `index-generate` | 0 |
| `shards-check` | 0 |
| `index-validate` | 0 |

Full checker: `pass`, 18 prepared rows, zero admitted families, 0 failures, no missing-policy blocker. Self-test: `pass`, 14 scenarios, including both failure-exit and unvisited-reference controls.

Index validation: top-level `pass`, 0 failures. Its readiness status remains `blocked_runtime_certification_incomplete`; this is not runtime certification or a governance reseal. Shards and the index were regenerated from the rebased sources. No unrelated source document is changed.

Standing checks 1–10 and the recurring forgery/custody/type/reference/size/history/format controls execute in the unchanged full checker and self-test. Check 11 remains qualified by SW-P1. Numeric and original-source timestamp qualifications remain SW-N1..N5 and SW-F1; this sweep claims no shared-rule or native clearance.

## IDs and evidence

Existing allocations remain CWR-105..123, CV-460..478, SP-460..478 and ATS-230..248. No new PlanUnit, Decision Log, OSI, event admission or WorkNode ID is minted. New fixture IDs are 243 parent-specific valid component IDs, `configuration_changed_revision_1:minimum_component`, and four `sweep-p1:` full-payload adjacency/state cases. The original revision ID is retained for its prepared-ledger reference.

Evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/manifest.json` — SHA-256 `24f8e8d11765f1377a74a3e3a47e1bc16cb62739377a0cdb897f2152f998fa05`.

- Fixture audit: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/fixture-audit.json` — SHA-256 `62ecf17302538343cb43d447bfbb9adb2fbd408818dcfd572926ad1de561aaa2`.
- Per-guard inventory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/guard-cases.json` — SHA-256 `ff0a682520bf145436b4d995228620199ce362de98a72be4013fc187d27bba8e`.
- Check results: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/check-results.json` — SHA-256 `a21521e95d9270fbdd53d12e760272c9243874c8df04597e61a80bb949782fba`.
- Currentness copy: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/currentness-copy.json` — SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.

The report and self-grade are copied to the lane evidence directory and its `sweep-p1` folder. Only the lane branch is pushed; the temporary worktree is removed after the push.
