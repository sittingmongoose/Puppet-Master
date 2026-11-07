# DR — Sweep part 2A: guard tables on the gated guard tool

Branch `plans/ea-w2-runtime-artifacts-20261104`; delivery head in the external sweep `HEAD.txt`. Part 2A start `5ea37cbd70`; gated tool merge `da7ef0f27d` (tool `004bdedd63`, eleven files, unchanged). No rebase onto main this round.

**All 19 families keep 10 PASS / 1 PARTIAL / 1 ABSENT.** Part 2A closes P1 (shared proof machinery and guard tables). `positive_negative_oracles` stays PARTIAL because N2 (shared number rule) and S1 (date-time formats) are part 2B. Membership stays ABSENT; native execution is NOT_RUN. Sol and Astra review the lane once, after part 2B.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` with `--no-ff` as `da7ef0f27d`: exactly the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat da7ef0f27d^1 da7ef0f27d` lists 11 files; `git diff da7ef0f27d HEAD -- scripts/pm_guard_isolation.py` is empty. |
| **P1 — guard tables** (fixed, `6aa7b1c0d3`, `11ba1a552f`) | Every product refusal of the checker is one named row in one of 63 phase tables (220 rows), reached only through `table_refusal`. Derivation computes observations (canonical-byte digests, routes, presence, recomputed identities) and decides nothing. Reused boundaries are phases of their callers. Or-chains are split into one row per predicate; chain equalities compare each copy with the authority. | `scripts/pm-runtime-artifact-event-drafts.py:59` (`TABLE_PHASES`), `:121` (`table_refusal`), `:144` (`table_order_errors`); `scripts/pm_runtime_artifact_table_*.py` | Full checker `pass`, 0 failures, including `shared:table_require_order` (each factory requires its rows in table order). |
| **P1 — retired machinery** (fixed, `6aa7b1c0d3`) | Removed the AST/mutation proof `scripts/pm-runtime-artifact-guard-isolation.py`. The standing-check witness now cuts named table rows in its trial module (`cut(...)`) instead of rewriting source text; its fixture and configuration trials are unchanged. | `scripts/pm-runtime-artifact-standing-checks.py:36` (`cut`) | See the standing-check run in the commands table. |
| **P1 — adapter and runner** (fixed, `2fc7429ff8`, `11ba1a552f`) | Suites are built from the existing causal witness pairs: valid invocations give controls, each single-defect invocation gives the observation of its first refusal, targeted at the refusing row. Pairs refused outside their label, untracked refusals and two-row witnesses are reported, never relabelled. | `scripts/pm_runtime_artifact_guard_suites.py`, `scripts/pm-runtime-artifact-guard-tables.py` | `python3 scripts/pm-runtime-artifact-guard-tables.py --family <f> --out <dir>` (one process per family). |
| **Two-defect negatives the tool/lane matrix reported** (fixed, `6aa7b1c0d3`) | `shipped_wrong_frontier` kept a stale token revision *and* frontier digest: it now keeps only the revision (C05e). The other two-row witnesses cannot be single-row by construction and are excluded from the proof with their reason (next section); their single-row equivalents prove each row. | `scripts/pm-runtime-artifact-event-drafts.py:1128` (`wrong_frontier` in `checkpoint_negative`), `scripts/pm_runtime_artifact_guard_suites.py:55`, `:66` (`EXCLUDED`, `EXCLUDED_PATTERNS`) | Lane matrix: 0 problems over all suites; tool: no masked negative. |
| **Missing negatives for unproved rows** (fixed, `6aa7b1c0d3`) | New round-9 witnesses for every row the earlier pairs never reached: application scope (D03a, V02a), missing pack (D07a), non-UTF-8 and non-JSON packs (D10u, D10j), missing provider source (B02a), unknown decoder (H05, non-provider families), node presence/state/uniqueness (C04x/b/c), live selection store (C04d), token key/generation/anchor/dataset (C03b, C05a/c/d/g/j), source digest and segment generation (C07c/e), manifest values and selection digests (C08g–p), anchor and coverage fields (C09a–n), segment count and fields (C10c, C11*), frame end and durable bound (C11g/h), cost_usage body copies. Each rebinds every observation that watches the changed fact. | `scripts/pm_runtime_artifact_round9_cases.py` | Every row of every suite has at least one negative (`rows_without_negative` empty in every summary). |
| **Rows dropped as already decided** (P1, `6aa7b1c0d3`) | Not repeated because an earlier row or the closed schema decides the same predicate on the same values: checkpoint schema-pointer target (C01b fixes the ref); read-token storage/key/selection/snapshot bytes (C03b, C03d, C04g, C04i) and field set (closed `read_token` schema); custody partition (F03 inside the preceding full-value call); `complete_to_captured_boundary` (schema const true); `empty_retained_source` (schema forces count 0, refused by C09h); segment `scan_start_offset` (schema const 0 plus C10b). Each is commented in place. No other refusal was removed. | `scripts/pm-runtime-artifact-event-drafts.py` `checkpoint_matches` comments | Reviewer check: each named schema clause in `Plans/event_record_index_checkpoint.schema.json`. |
| **ATS-260 legacy proof claim** (fixed, `70ba0ac826`) | The proof sentence and validation command name the guard tables and the shared tool; the number-rule sentence is unchanged (2B). | `Plans/Automated_Testing_System.md:7249`, `:7251`, `:7261` | Shards and index regenerated; only Automated_Testing_System outputs changed; shard check pass. |
| **N2 — shared number rule** | Part 2B (needs NUMRULE gates). | Listed below | — |
| **S1 — date-time format sweep** | Part 2B. Interim only (see below). | Listed below | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new; ATS-260's text and validation command change in place (no new units).

## Guard-table result

The gated tool ran **803 suites** (one per phase table per family, plus the shared helper phases): **2888/2888 row cells proved**, 0 failed suites, 5517 distinct single-row negatives. 220 distinct rows in 63 tables. Lane matrix problems: 0. Open collection findings: 0. Excluded witness pairs (kept in the full checker, listed below): 234. Credit is the tool's own `rows[].proved`.

Each cut swaps one table row to always-pass; the tool then runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. "Own" negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays").

| Checker | Tables | Rows | Row cells proved | Unproved (reason) | Cut: own flips / own | Cut: stays | Unrelated changes | Masked |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Exact validator (every schema occurrence) | 2 | 5 | 78/78 | none | 79/79 | 231 | 0 | 0 |
| Codec, identity, profile, oracle, references | 6 | 8 | 98/98 | none | 100/100 | 42 | 0 | 0 |
| decode | 9 | 30 | 501/501 | none | 881/881 | 3692 | 0 | 0 |
| stored_event_valid | 1 | 6 | 114/114 | none | 114/114 | 570 | 0 | 0 |
| inspect | 3 | 8 | 152/152 | none | 1084/1084 | 4375 | 0 | 0 |
| full_value_matches | 3 | 14 | 266/266 | none | 384/384 | 1380 | 0 | 0 |
| resolve_history | 1 | 1 | 19/19 | none | 19/19 | 0 | 0 | 0 |
| AppendModel.append | 4 | 7 | 133/133 | none | 722/722 | 1292 | 0 | 0 |
| policies_match | 1 | 3 | 57/57 | none | 57/57 | 114 | 0 | 0 |
| checkpoint_matches | 17 | 74 | 1406/1406 | none | 1976/1976 | 7144 | 0 | 0 |
| observation_admissible (restore_point) | 8 | 21 | 21/21 | none | 52/52 | 116 | 0 | 0 |
| Source agreement (browser_recording, cost_usage, tool_llm_trace) | 8 | 43 | 43/43 | none | 49/49 | 226 | 0 | 0 |

Per family (all phase suites that family reaches; shared toy-schema, codec and oracle witnesses ride with each family):

| Family | Suites | Row cells proved | Distinct negatives | Failed suites |
|---|---:|---:|---:|---|
| `runtime_artifact.api_web_call` | 41 | 148/148 | 284 | none |
| `runtime_artifact.artifact_version` | 41 | 148/148 | 284 | none |
| `runtime_artifact.before_after_snapshot` | 41 | 148/148 | 284 | none |
| `runtime_artifact.browser_recording` | 42 | 155/155 | 296 | none |
| `runtime_artifact.code_diff` | 41 | 148/148 | 284 | none |
| `runtime_artifact.context_snapshot` | 41 | 148/148 | 284 | none |
| `runtime_artifact.cost_usage` | 48 | 173/173 | 309 | none |
| `runtime_artifact.document` | 41 | 148/148 | 284 | none |
| `runtime_artifact.evidence` | 41 | 148/148 | 284 | none |
| `runtime_artifact.failed_attempts` | 41 | 148/148 | 284 | none |
| `runtime_artifact.hitl_approval` | 41 | 148/148 | 284 | none |
| `runtime_artifact.implementation_plan` | 41 | 148/148 | 284 | none |
| `runtime_artifact.reasoning_summary` | 41 | 148/148 | 284 | none |
| `runtime_artifact.restore_point` | 50 | 172/172 | 347 | none |
| `runtime_artifact.screenshot` | 41 | 148/148 | 284 | none |
| `runtime_artifact.subagent_lineage` | 41 | 148/148 | 284 | none |
| `runtime_artifact.suggested_next_steps` | 41 | 148/148 | 284 | none |
| `runtime_artifact.tool_llm_trace` | 47 | 167/167 | 304 | none |
| `runtime_artifact.validation_test` | 41 | 148/148 | 284 | none |
| `shared` | 1 | 1/1 | 1 | none |

Every row of every table and its per-family cut result is in `aggregate.json` and the per-suite tool reports under the evidence directory (`tool/<family>/<phase>__<family>.json.gz`).

**Witnesses excluded from the table proof (kept as refused negatives in the full checker).** O03 owner-snapshot `0.0`/`1.0` booleans (144): a float where a boolean is required violates both the type row (S07) and the number row (N01); the integer, string, null and container variants prove S07 alone. C04 live-selection type variants (57): a change to the live selection contradicts both its frontier copy (C04f) and its token copy (C04g); `wrong_frontier_store` and `wrong_token_source_store` prove each row alone. H07 `deleted_body_refs` (19): a deleted body yields `metadata_only`, a reader result, not a refusal. cost_usage `refs_usage_{event_ref,record_id}` (10): `refs.<field>` is compared with both the root and the body copy; `root_<field>` and `body_<field>` prove each row. restore_point `numeric_*_forged_first_receipt` (4): a forged predecessor receipt is carried by both supplied copies, so F12 and F13 refuse together; `original_result`, `original_custody` and `receipt_copy` prove each row.

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`). The complete path is the full checker, which reaches every refusal through the same rows. As lane evidence beyond the tool, each negative was re-run through its whole witness with only its refusing row cut: of 7,639 witness pairs, 6,217 are accepted. The rest are refused later by a distinct invariant or by derivation that relied on the cut row: owner-snapshot type variants also fail the encoded snapshot join O03b (688); wrong-type CURRENT/manifest counters also differ in value (C08g–j, 513); a cut row guarded derivation (D05, D07a, V07, C04x: 80); an undecodable pack body leaves no payload for the schema rows (S07, 38); the anchor copy shares the live-store fact (C09a, 38); an unknown decoder is also an unknown profile (S06, 23); an application envelope also fails the Project join (D13, 19); projector_replay_only is also not dedupe_by_idempotency_key (A03b, 19); a forged predecessor event also changes its commitment (F08a, 4). None of these reaches a row of its own phase, so each stays a single-row negative for the tool.

**Shared tool limits met.** Cost grows steeply with rows per table (a 10-row prototype ran 341 evaluations in 33 s; 20 rows, 1,281 in 549 s), so phases hold at most seven rows and read only their declared `FIELDS`. Each table module is prescanned from its text before use. No `NonGuard` other than the `return g.Case(table, check, context)` plumbing return was needed.

**What Astra keeps finding, probed for part 2A.** (1) identities and digests are still recomputed from source in derivation and compared by rows (F08a, F09, C05a, C05d, C05f, C14, D17); forged copies are the negatives. (2) Storage-assigned fields stay outside the semantic digest; receipt sequence bytes are compared (F06). (3) Historical routes keep their recorded recipe: the overlay, provider digest and number rows apply only to the current-writer profile; all S10 history checks pass. (4) Byte-level joins use SHA-256 of canonical bytes for both sides; scalar joins keep their original operator. (5) S01 and the preflight still walk every `$ref`. (6) Inline size is checked on decode and stored copies (D04, V05). (7) Every append, retry, history and observation path still runs the full-value phases. (8) Masked negatives: tool `masked` is empty on every row; the complete-boundary re-run above is reported. (9) Oracle cells stay PARTIAL. (10, 10a, 12) are part 2B. (11) Type rows are separate rows (`is not True/False`, exact `int`, exact `bytes`), with wrong-type negatives.

**Timestamp fields — interim only.** This is my own interim review of the timestamp fields (pm7-build, 2026-11-05 16:50Z), not a certification. In the pinned environment `FormatChecker()` has no `date-time` checker (`not-a-date` conforms), so `date-time` formats in EventRecord, receipt, checkpoint and runtime-artifact schemas are not enforced; `uuid` is. Part 2A adds no date-time rule and changes no timestamp field.

## Part 2B items

- **N2 — shared number rule (CV-1100/1101, SP-1100/1101, shared helper).** `scripts/pm-runtime-artifact-event-drafts.py:276` `canonical_numbers` (the N01 observation), `:421` (`number_errors` in `TableValidator.refusal`), `:532` `value_bytes` / `:538` `packed_value` (canonical MessagePack codec), `:569` `storage_form` (N01s), `scripts/pm_runtime_artifact_table_schema.py` `N01_canonical_numbers`, `scripts/pm_runtime_artifact_table_codec_storage.py` `N01s_storage_numbers`; witnesses `scripts/pm_runtime_artifact_round6_cases.py:128-153` and `scripts/pm_runtime_artifact_round8_cases.py:107`; `Plans/Automated_Testing_System.md:7250` (ATS-260 numeric paragraph).
- **N2 — authenticated historical recipe selection.** `scripts/pm-runtime-artifact-event-drafts.py:753` `resolve_history` (`validation=decoder`, `:763-765`) and `:1395-1403` (`recorded_decoder` in `observation_admissible`); adopt the shared write-time recipe selection.
- **N2 — Python-equality value joins over numbers.** `scripts/pm-runtime-artifact-event-drafts.py:1417` (`expected_ordinal`, O08) and the checkpoint scalar joins (C07e, C08g–j, C09c–n, C11*) keep their original `!=`; the shared rule decides spelling and range.
- **N2 — excluded two-row number witnesses.** The 144 O03 `0.0`/`1.0` owner-snapshot witnesses (type and number rows together).
- **S1 — date-time formats.** `scripts/pm-runtime-artifact-event-drafts.py:403` (`FormatChecker()` without a date-time checker), `scripts/requirements-runtime-artifact-drafts.txt` (no RFC 3339 validator), every `format: date-time` field of `Plans/event_record.schema.json`, `Plans/event_append_receipt_contracts.schema.json`, `Plans/event_record_index_checkpoint.schema.json` and the nineteen `Plans/runtime_artifact_*.schema.json`. Interim review only.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part-1 self-grade (cycle-8 reviewer grade carried). After is this part 2A self-grade at the delivery head.

| Exact family | Before → after |
|---|---|
| `runtime_artifact.api_web_call` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.artifact_version` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.before_after_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.browser_recording` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.code_diff` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.context_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.cost_usage` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.document` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.evidence` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.failed_attempts` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.hitl_approval` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.implementation_plan` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.reasoning_summary` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.restore_point` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.screenshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.subagent_lineage` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.suggested_next_steps` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.tool_llm_trace` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.validation_test` | 10P / 1Q / 1A → 10P / 1Q / 1A |

190 PASS / 19 PARTIAL / 19 ABSENT / 0 CONFLICT → the same totals. No owner unit other than ATS-260 changed; every cited quote was re-verified at its line in this tree.

## Commands and evidence

Heavy checkers (full checker, guard-tool runs, standing-check trials) ran one at a time with at least 10 GB available (the tool MemoryGate paused below 10; the per-family loop waited below 11); the read-only aggregation of the tool reports overlapped the flip count and the index validate. PM7 work was not waited on or touched. Commits: `da7ef0f27d` (tool merge), `6aa7b1c0d3`, `2fc7429ff8`, `70ba0ac826`, `11ba1a552f`, `9c23caed78`, `2aecbc6bd8`, `80f440e078` (row-spec generator; checker unchanged), then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/sweep-p2a/` (SHA-256 of every file in `MANIFEST.json`).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files |
| `python3 scripts/pm-runtime-artifact-event-drafts.py` (full checker, implementation `2aecbc6bd8`) | 0 | `pass`, 22,375 assertions (was 20,564), 0 failures, 4 min 01 s, peak RSS 296 MB (`full-checker.stdout`) |
| `python3 scripts/pm-runtime-artifact-guard-tables.py --family <f> --out tool/<f>` ×19, then `--family shared` | 0 ×20 | 803 suites `PASS`; `tool/<family>/summary.json`, `tool/aggregate.json` |
| complete-boundary flip count (`flips.json`, lane evidence) | 0 | 7,639 pairs: 6,217 accepted, 1,422 refused later (reasons above) |
| `python3 scripts/pm-runtime-artifact-standing-checks.py --case ...` (13 trials) | 0 | `pass`: all 13 caught. These are every trial whose mechanism the port changed (12 row cuts, 1 source-text change); each runs the complete checker over all nineteen families. The 33 fixture/configuration trials were not re-run in part 2A (`standing-checks.json`). |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`; only `Plans/_shards/automated_testing_system/` changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files hash-verified first) | 0 | `pass`; only Automated_Testing_System units changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 3,104 shards |
| `python3 scripts/pm-plan-index.py validate` (origin/main `5cbb92a5aa`) | 1 | top-level `fail`, 30 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers (carried from part 1) and 9 `plan_unit_removed_without_ledger_decision` for DL-333, DL-335..340, DL-349 and UCC-230, which main added after this branch's base `d5ec2f70c0`; none names a DR file. Integration rebase owns them. |

---

# DR — Sweep part 1 (earlier report, unchanged): quota and checkpoint negatives

Branch `plans/ea-w2-runtime-artifacts-20261104`; implementation `bcf623e86b82f28f12ccc530049c6e1dd6d99c27`. Reviewed head `8db97f0f445691d974755e5a3636f5a6000d3774`; rebased first onto main `d5ec2f70c0d69c469796eea9b9cfdae30f281f42`. Delivery head is recorded in the external sweep `HEAD.txt`.

**C8-B1 and C8-B2 are fixed locally. All nineteen families remain NOT_READY pending part 2.** This report supersedes the round-8 claim of 19/19 prepared: the cycle-8 review graded 0/19 ready, and sweep part 1 does not upgrade that verdict. Membership stays ABSENT; native execution is NOT_RUN.

## Sweep part 1: findings and responses

| Item | Disposition and exact change | Verification |
|---|---|---|
| **Deck-2 assignments** | None assigned to DR in this task; no decision applied or extended. Main's DL-400..452 stay intact. | `rebase-audit.json`; no Decision Log diff. |
| **C8-B1** | **Fixed (`bcf623e86b82f28f12ccc530049c6e1dd6d99c27`).** Where: `scripts/pm_runtime_artifact_round6_cases.py:227`, RAP-117/CV-537's already implemented quota rule at `scripts/pm-runtime-artifact-event-drafts.py:241`. Why: all old controls left quota sources absent/null. Fix: quota-present valid parents for each independent source, with only `flags.quota_observed` changed to false or null. | 20 pairs: schema plus inline/packed decode and fresh append. Every parent passes, every negative refuses. Removing only the quota predicate makes all 20 authored negative expectations fail, across all nineteen full family invocations. |
| **C8-B2** | **Fixed (`bcf623e86b82f28f12ccc530049c6e1dd6d99c27`).** Where: `scripts/pm_runtime_artifact_guard_cases.py:186`, `:196`, `:207`; existing `checkpoint_matches` predicates at lines 607 and 656. Why: neither leaf predicate had an authored negative. Fix: every family's own valid checkpoint now supplies a wrong selected-node generation copy and a count of 2 against its verified one-event source. | 38 pairs, two per exact family. The count case recomputes only the non-target token anchor digest; the generation case keeps its correct independent map key/token/dataset. Each predicate removed alone makes exactly its nineteen authored negative expectations fail; every other expectation stays satisfied. |
| **N1 integration** | Rebased onto current main before fixture work; DL-302 and PLS-025 are present. Regenerated shards and index with all fifteen hash-verified currentness files. No unrelated ledger or governance repair. | Original index validator: exit 1, top-level `fail`, 22 failures: `{'plan_unit_removal_ledger_invalid': 21, 'plan_unit_removed_without_ledger_decision': 1}`. Raw failures remain in `index-validate.stdout`. During verification origin/main advanced to `2989975e8f8a4a1e49235e8ae2095b3df7ea0321`; DL-336 is a later-main branch-age finding, with no Decision Log lane diff. Retain it at the next integration rebase (`main-advance.json`). |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new; existing RAP-100..118 / SP-520..538 / CV-520..538 / ATS-260 remain the 58 lane units.

## Negative handoff for part-2 guard tables

The labels B01/C04/C09 below are inherited diagnostic row labels, not duplicate sets. The part-1 verification cuts the exact named predicate alone, keeping every peer clause and schema rule. The complete 58-name inventory is `reports/event-authority-20261104/DR.sweep-p1-guards.json`.

| Actual guard | Authored negatives | Own cut flips | Other new negatives stay refused |
|---|---|---:|---:|
| `trace_quota_observed` — quota source implies flag true | B01: `quota_quota_artifact_ref_{false,null}_{schema,inline_decode,inline_append,packed_decode,packed_append}`; identical five-route list for `quota_quota_refs_{false,null}`. Trace only. | 20/20 | 38/38 |
| `checkpoint_node_generation_copy` — selected node copy equals root generation key | C04: `node_generation_copy`, separately for every one of the nineteen exact families. | 19/19 | 39/39 |
| `checkpoint_anchor_retained_event_count` — anchor count equals verified one-event source count | C09: `anchor_retained_event_count`, separately for every one of the nineteen exact families. | 19/19 | 39/39 |

The focused audit reads the actual witness closures. Quota logical payloads differ at exactly one field; structural schema accepts both, and each pack's digest/size/reference matches its actual bytes. Generation bundles differ at exactly the node copy. Count bundles differ only at the semantic count and its recomputed observing token digest; the source, frontier coverage and dataset remain the valid one-event truth. Row, event and original receipt/custody are unchanged on both checkpoint routes. All 58 valid controls accept after each of the three individual cuts. No product guard, schema, expected answer, source truth or historical original is weakened on the branch.

The full checker executes **20,564 distinct assertions** across nineteen sequential family invocations, with the identical shared assertions counted once. The pre-fix count was 20,448; the 58 added pairs contribute 116 assertions. The complete existing pair inventory grows 6,910 → **6,968**. Each deletion run evaluates that same whole lane: exactly the 20/19/19 relevant negative expectations fail, and no unrelated expectation fails. Immutable file reads alone are reused and fingerprint-verified; schema, codec, acceptance and checker outcomes are executed without result caches. This is targeted causal evidence for three review predicates, not certification of the legacy 96-row proof inventory.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the cycle-8 reviewer grade. Every family's checkpoint witnesses execute against its own original event/receipt/custody/source/checkpoint. `positive_negative_oracles` remains PARTIAL for P1/N2 and carried S1; membership remains ABSENT. Native NOT_RUN does not by itself lower a grade.

| Exact family | Before → after |
|---|---|
| `runtime_artifact.api_web_call` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.artifact_version` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.before_after_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.browser_recording` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.code_diff` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.context_snapshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.cost_usage` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.document` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.evidence` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.failed_attempts` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.hitl_approval` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.implementation_plan` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.reasoning_summary` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.restore_point` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.screenshot` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.subagent_lineage` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.suggested_next_steps` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.tool_llm_trace` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `runtime_artifact.validation_test` | 10P / 1Q / 1A → 10P / 1Q / 1A |

**190 PASS / 19 PARTIAL / 19 ABSENT / 0 CONFLICT → the same totals.** The 743 exact current citations are checked inside their named owner units/functions, with line references refreshed after rebase. Fifty-seven lane owner units remain byte-identical to the reviewed head; ATS-260 adds only explicit part-1 fixture coverage and the part-2 qualification.

## Part 2 items

- **N2 — shared number/recipe adoption.** `scripts/pm-runtime-artifact-event-drafts.py:159` (`canonical_numbers`), `:296` (`validator`), semantic/physical codecs and authenticated historical profile selection; `Plans/Automated_Testing_System.md:7250` ATS-260's numeric paragraph. Adopt CV-1100/SP-1100/SP-1101 and the shared helper after NUMRULE passes. No new local number helper, cap, serializer, physical-float normalization or signed-zero erasure was added. The count-2 fixture is a plain valid integer and isolates an ordinary semantic contradiction.
- **P1 — shared proof machinery and guard tables.** `scripts/pm-runtime-artifact-guard-isolation.py`, especially D01:134 / D12:145 / C03:193 / C04:196 / O03:212 / O12:223 and forwarded aliases, plus ATS-260's legacy proof claim. Adopt the reviewed `scripts/pm_guard_isolation.py`, expose actual named predicates in tables, and prove each duplicated same-field/same-predicate site alone, then all sites together. Compound rules/refusal codes do not define duplicate sets. Use the exact per-guard negatives above. No local proof tool was rebuilt or guard-table restructure attempted in this part.
- **S1 — carried, outside the assigned C8-B1/C8-B2 work.** `validator:296`, `scripts/requirements-runtime-artifact-drafts.txt`, and EventRecord/receipt/checkpoint/runtime-artifact date-time schema fields. Cycle 8's pinned isolated environment silently skipped date-time validation. The existing UTC Z grammar and historical-recipe preservation still need their previously requested format sweep. This item remains open; no READY claim hides it.

The shared tools and the later Sol/Astra review remain required. The original full legacy guard-removal, numeric/type and format campaigns were not rerun or re-certified here. The inherited `DR.guard-removal.json` describes earlier diagnostic evidence and is not the current part-1 guard handoff.

## Commands and evidence

DR heavyweight commands run one at a time, proceeding at 6 GB available or higher. Running commands pause below 6 GB and resume at 7 GB. The initial wrapper incorrectly waited for unrelated VM jobs; it was cancelled before its queued command started, then corrected after the user clarified per-lane serialization. Other workers are not waited on. Command JSON records preserve argv, exits, duration and memory samples. Initial disk availability was 129 GB. Shard regeneration changes only the four DR owner directories; index outputs are regenerated normally. No Spec Lock, governance evidence, auto-decisions, registry/admission, frozen validator, test file, mailbox, subagent, landing lock or main push was used.

| Command/evidence name | Exit | Outcome |
|---|---:|---|
| `shard-generate` | 0 | pass; 0 failures |
| `index-generate` | 0 | pass; 0 failures |
| `focused` | 0 | pass; 58 new pairs |
| `baseline` | 0 | pass; 20564 assertions |
| `trace_quota_observed` | 1 | fail; 20564 assertions |
| `checkpoint_node_generation_copy` | 1 | fail; 20564 assertions |
| `checkpoint_anchor_retained_event_count` | 1 | fail; 20564 assertions |
| `runtime-schemas` | 0 | pass; 0 failures |
| `shard-check` | 0 | pass; 0 failures |
| `index-validate` | 1 | fail; 22 failures |

Mutation exits 1 are the required caught defects; the baseline exits 0. `index-validate` is parsed at its top-level status and is never relabelled a pass. The currentness copy and rebase audit are read-only companions to the recorded checks. Two retained execution-driver editions differ only by per-family progress logging; `execution-driver-editions.json` identifies the edition for every run.

All evidence below is under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DR/sweep-p1/`.

| Evidence file | SHA-256 |
|---|---|
| `focused.stdout` | `b3160671efbe51847074f188c54712894b34e5a6603b4a8a4e5b727ace94e197` |
| `baseline.stdout` | `f1e4a98a63d0fed34e7d6f5dc21aaa611d34c642561f8d4ae85e54c031a7aa46` |
| `trace_quota_observed.stdout` | `e72134830f1c56f55482e7caeff44b968e912cabd8d1cd7146f1625c8bf4f97e` |
| `checkpoint_node_generation_copy.stdout` | `c332e4dae38292ed68867beb4191430a2f940d8b457b4547f00f8fc89e1f84b3` |
| `checkpoint_anchor_retained_event_count.stdout` | `ace8f2afef9eebc351d05286ed75dba13af3a070bae7aebb643d1689f50c0a5b` |
| `index-validate.stdout` | `9e6500ef5a4ccd3b75a281ef38da39ee501308801745e288484060c5052eaa23` |
| `grade-citations.json` | `94b4d0a35f1fd6d1cdcb267262760d7db2a5ccc2dd7f7be2b9705a5a701ec9a7` |
| `rebase-audit.json` | `8c2507700410a3cc2f740b19f575813ff01a94b266441cb4299f4296e28114d5` |
| `currentness-copy.json` | `9786e95661f33a7839e40e4e8e5bc936e47aa812142f30724b22ab29ddccb1ab` |
| `main-advance.json` | `13e671cc9589c36f5886aa925b4bff00f400f0c5b58f9e455642aac540dc1789` |

The report, self-grade, negative handoff, command outputs and final HEAD are copied there. The detached sparse worktree and task scratch/venv are removed after the lane branch is pushed; external `cleanup.json` records completion. No other worker's process or file is removed.
