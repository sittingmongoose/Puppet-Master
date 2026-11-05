# DR — Sweep part 1: quota and checkpoint negatives

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
