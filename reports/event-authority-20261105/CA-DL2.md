# CA-DL2 — E-CARDS-2 Decision Log entries

**Branch:** `plans/ea-cards2-answers-20261105`.
**Exact base:** `origin/plans/ea-cards1-answers-20261104` at `b6332f391a7870bad5f01a29a7e9d080050dac27`.

## Result

Wrote exactly **38** `### DL-NNN:` entries, **DL-415 through DL-452**, in `Plans/Decision_Log.md`. Every item maps to exactly one A option; **unmapped or ambiguous items: none**. Item 9.c retains its different literal label, `A — Delivery only.`

Each entry preserves the item label and exact question; Jared’s verbatim answer, "i approve all of it"; the answer source and `2026-11-05T04:33:13Z` timestamp; the deck’s fast-reply mapping; verbatim A text; the exact Sources line; and scoped supersession/conditions. pm7-build’s relayed reading is explicitly labelled as theirs, not Jared’s words.

The complete Debug probe/cleanup proposal is reproduced in DL-429. The catalog scope tables and existing exceptions are reproduced in DL-434/DL-435. DL-450 preserves all 148 exact appendix names, descriptions and source evidence in their original order; appendix subgroup headings are rendered as bold labels within the one Decision Log entry.

DL-427 answers DL-406’s return-to-Jared condition without claiming that the replacement Stop-outcome record is already specified or verified. DL-446/DL-447 supply DL-403’s independent cutoffs while keeping remaining application/review/recording conditions. DL-451 expressly names DL-412 as the third recorded seal-check change and records authorization for the fourth only.

The pre-existing Decision Log body is byte-preserved after removing the inserted entry block. No family was admitted, no event registry or governance artifact was edited, no owner-text application was performed, and no main push was made. The changes are the entries, their generated shards/index and this report.

## Entry map

| Decision Log id | Deck item | Selection | Entry |
|---|---|---|---|
| DL-415 | 1.a | A | The 90-day history clock starts at the first durable save |
| DL-416 | 1.b | A | No-project Debug history has its own bounded allowance |
| DL-417 | 1.c | A | No-project memory-maintenance history has its own bounded allowance |
| DL-418 | 1.d | A | No-project plugin load, tool and permission history has its own allowance |
| DL-419 | 1.e | A | No-project plugin-hook history has its own 90-day allowance |
| DL-420 | 1.f | A | No-project model-list refresh history has its own 90-day allowance |
| DL-421 | 1.g | A | No-project preview history has its own 90-day allowance |
| DL-422 | 2.a | A | filesafe.command_denied is seven-year troubleshooting history |
| DL-423 | 2.b | A | filesafe.destructive_override_denied is permanent decision proof |
| DL-424 | 2.c | A | filesafe.destructive_override_requested is permanent request proof |
| DL-425 | 2.d | A | filesafe.guard_init_failed is seven-year troubleshooting history |
| DL-426 | 2.e | A | filesafe.path_denied is seven-year troubleshooting history |
| DL-427 | 3.a | A | Chat and Storage may define the missing saved Stop outcome |
| DL-428 | 3.b | A | Debug investigations may end Failed for exactly six reasons |
| DL-429 | 3.c | A | Debug probes preserve the complete status and cleanup transition proposal |
| DL-430 | 3.d | A | A FileSafe block records only the FileSafe refusal |
| DL-431 | 4.a | A | Wizard Blocked belongs to the whole Planning Run |
| DL-432 | 4.b | A | Wizard Unblocked records clearance of every required condition |
| DL-433 | 4.c | A | Browser sharing has a separate grant for each recipient chat |
| DL-434 | 4.d | A | Catalog updates wait for the next safe reload or start |
| DL-435 | 4.e | A | Catalog removal is refused while any listed use or reference remains |
| DL-436 | 4.f | A | Doctor’s skipped notice uses the first check that finds the setting absent |
| DL-437 | 5.a | A | Notes record creation once and each later status change once |
| DL-438 | 5.b | A | Concern reassignment is recorded by the authorized controller |
| DL-439 | 5.c | A | Authorized users and controllers may add concern evidence |
| DL-440 | 5.d | A | The authorized controller records concern promotion |
| DL-441 | 5.e | A | The responsible authorized owner records evidence-backed concern reopening |
| DL-442 | 5.f | A | Controllers record seven concern outcomes and humans choose accepted risk |
| DL-443 | 5.g | A | The authorized controller records concern assessment changes |
| DL-444 | 6.a | A | The oldest eligible duplicate memory keeps its identity |
| DL-445 | 6.b | A | Other merged memory originals are archived and never automatically deleted |
| DL-446 | 6.c | A | Monthly summary uses both 90 idle days and score below 0.10 |
| DL-447 | 6.d | A | Prune archive uses both 180 idle days and score below 0.05 |
| DL-448 | 7.a | A | Prepare a distinct application edition of goal_run.stopped |
| DL-449 | 8.a | A | Retired terminal history requires no new inspection view |
| DL-450 | 9.a | A | Technical drafting permission extends to exactly 148 appendix names |
| DL-451 | 9.b | A | Fourth recorded seal-check change may read the frozen recount |
| DL-452 | 9.c | A | Sibling cancellation requests remain delivery only |

## ID scan

At `2026-11-05T04:51:55.121750+00:00`, `git ls-remote origin` advertised **525 branches**. Every corresponding fetched `refs/remotes/origin/*` ref was verified against its advertised SHA and scanned separately with `git grep -n -I -E` in `Plans/Decision_Log.md` for every ID DL-415..DL-452. **No matches on any branch**, including current `origin/main`; the requested destination branch did not exist. The clone’s local `main` was also scanned separately with no matches.

The full advertised ref list and per-ref scan results are retained below with SHA-256. This scan preceded writing the entries.

## Regeneration and checks

| Check | Exit | Result |
|---|---:|---|
| Deck SHA-256 | 0 | Exact match: `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30` |
| Entry/source verification | 0 | All 38 questions, answers, A options, Sources lines and boundaries present; prior body unchanged; 148 appendix names exact |
| Currentness edition copy | 0 | All 15 files copied from the shared currentness edition and SHA-256 matched before index generation |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | Top-level `pass`; 99 documents, 3,092 shards |
| `python3 scripts/pm-plan-index.py generate` | 0 | Top-level `pass`; 96 documents, 7,438 PlanUnits, 29,983 acceptance units |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Top-level `pass`; 99 documents, 3,092 shards; no failures |
| `python3 scripts/pm-plan-index.py validate` | 1 | Parsed top-level `fail`; 22 pre-existing retention failures, zero introduced |
| `python3 -m unittest discover -s tests -p test_pm_plan_index.py` | 0 | 18 tests passed |
| `git diff --check` | 0 | No whitespace errors |

Only `Plans/_shards/decision_log/**` changed among per-document shards. Only the Decision Log document card changed; the 281 existing index rows whose source metadata changed are all owned by `Plans/Decision_Log.md`. The indexed PlanUnit ID set is unchanged; the requested new entries use the same prose heading form as DL-401..DL-414.

The aggregate readiness report remains `blocked_runtime_certification_incomplete`. With the required copied currentness edition, its currentness-drift diagnostics are 79 rather than the base artifact’s 23 (56 additional diagnostic rows); source-hash-stale diagnostics remain 17. These are generated diagnostic changes, not edits to any unrelated owner document, governance source, certification receipt or frozen validator. No readiness or governance pass is claimed.

## Pre-existing validation failures

The full validation reports 21 `plan_unit_removal_ledger_invalid` failures (20 ledger streams without required nonempty `record_id` values and one non-array `superseded_by` value) and one `plan_unit_removed_without_ledger_decision` for **DL-302**. The branch is explicitly stacked on b6332f391a, whose indexed unit set already lacks DL-302 relative to current `origin/main`.

The unchanged `plan_unit_retention_failures` function was run with both the base indexed unit set and the regenerated live indexed unit set, against the same `origin/main` `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Both produce exactly the complete 22-failure live validation list. Every invalid-ledger input is byte-identical to base. **New failures: 0.** This is a direct retention-check comparison, not a claim that a separate full baseline validation was run. The failures are reported without changing ledger records or the stacked branch base.

## Scope and limits

The rubric/mutation checklist applies to prepared per-family contracts; this worker authored none, so it asserts no family self-grade, admission, new binding or mutation proof. No `.gitignore`, registry, Spec Lock, `auto_decisions.jsonl`, frozen validator or governance evidence edit is included. Per-family admission IDs are DL-500 and up, as the lane brief states. All owner applications, the CA-SEAL2 implementation and wave-3 exclusion record remain assigned to their other workers.

Resource preflight before creating the sparse worktree: 81 GB available disk (minimum 50 GB), 15 GB available RAM (minimum 6 GB). The worktree uses sparse cones `Plans scripts reports tests`; removal follows a successful push to the requested destination. No pm-mail or subagents were used.

## Evidence

Paths below are retained outside the repository. SHA-256 identifies the exact inputs and check outputs.

| Artifact | Absolute path | SHA-256 |
|---|---|---|
| Shared brief | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/BRIEF-DRAFT.md` | `41864b36b0ec066dd89e05ce02241cd87dbdcfcedcd3cc6bfaad43830e322191` |
| Lane and item/ID allocation | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/CARDS2-APPLY.md` | `95289dc973f3a0696eb7f7099345130f57ec42368654f387f2a7da8a813e0891` |
| Answer record | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md` | `e7e8d3f3a2f23737b201becddd94ff0c707815520a366ab32758088c720927fd` |
| Frozen presented deck | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md` | `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30` |
| origin-refs-before.tsv | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/origin-refs-before.tsv` | `a94928196a2df8392cc1557462f6ca0ed656d3893306377f32c36c87188d3f8f` |
| id-scan.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/id-scan.json` | `9a6edd4fdf406ee163d6b2ab6ab4422ccabd6cbd5d4a5eb76ab51c09e3756744` |
| local-main-id-scan.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/local-main-id-scan.json` | `78be0cd46328eaaa47f6ea159ef80e8a4f2afa58a1117e79f97d6c0a6c5d97eb` |
| currentness-copy.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/currentness-copy.json` | `c4820d55d0e55aea80a2c490c654a20c2287518e1e42eabd01ee17741fad24cc` |
| entry-construction.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/entry-construction.json` | `173c6c51f53bb202497ad25f606d2c2fc89ae64a1c33ee78d1f371f64bc6e3f7` |
| entry-verification.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/entry-verification.json` | `4679b62b1321d4589712ebb821d98121eaccdf87ff5189acc9067061cfd02e3f` |
| derived-scope.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/derived-scope.json` | `a161f9eec7022b799a32662d28518efc3820c5a17282998bdf5de84c1b97e299` |
| shard-generate.stdout | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/shard-generate.stdout` | `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4` |
| shard-generate.result.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/shard-generate.result.json` | `0efa43927e7028caf911b8f64c9e73c615e82230e10eda631bcd148f8af2d401` |
| index-generate.stdout | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/index-generate.stdout` | `1e791e64c95d00b432516f80a9c441731dbe22733ed76804311849c69114ee19` |
| index-generate.result.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/index-generate.result.json` | `1149e6796a3d77ac1a95bede880a159211c877e96ba06a31a2d0bc5f8a3610ab` |
| shard-check.stdout | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/shard-check.stdout` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| shard-check.result.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/shard-check.result.json` | `f9fe247104128ea7aa8c20a02748120fb0084498058eea8fc6fd94e18d82e15d` |
| index-validate.stdout | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/index-validate.stdout` | `a98de8efde6ec69dbf776d6e46e7e967eacf89052eebcf776992aa230ddb8ade` |
| index-validate.result.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/index-validate.result.json` | `07afb78dd83d03eb60e0cb3667d2a5db938319fc6678c13b24af11f090757fe2` |
| index-tests.stderr | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/index-tests.stderr` | `380c849663eaf7aaf126f1b02c39d9f5bc207ea4e4336dab3dd840105b2369ff` |
| index-tests.result.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/index-tests.result.json` | `24ea796227d1b4c5f38c5be88b8e20164f9d29038fdb59c11089d8920d6fce9b` |
| validation-baseline-comparison.json | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/validation-baseline-comparison.json` | `3ed2342d5c6c61bc7f6f0fb3e050ac38b9178c0030e7ffb94c98db3091f5ec07` |

Report copy: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/CA-DL2.md`.

## Review round 1: findings and responses

This section supersedes the original report’s statement that the indexed PlanUnit-ID set is unchanged. Round 1 starts at `7ddbd14d27b41b29d041b9db5105ff39fc2eb350` and preserves its stack on deck 1 at `b6332f391a7870bad5f01a29a7e9d080050dac27`. Both fixes are in commit `d152e079438081df8ec935522b3040f3ecab146c`.

| Finding | Where and cause | Response and verification |
|---|---|---|
| **CA-RET2-sol finding 1 — fixed** | DL-415..DL-452 were prose-only; Storage’s seven SP-237 dependencies had no indexed targets. | Added exactly **38** YAML PlanUnit fences in `Plans/Decision_Log.md:6881` through the DL-452 fence at `:11276`, in `## PlanUnits` immediately after DL-414 and before DL-002. All 21 fields and their order match DL-401..DL-414 on the pinned deck-1 base. Each fence carries its own complete entry text, decision scope, source lineage and metadata. The regenerated index has every DL-415..DL-452 target, no removed IDs, zero unresolved references and no cycles. The seven SP-237 edges on retention head `9b76338594c6f1ca75de6c757e7a8b98ab68e229` all resolve against these indexed targets. |
| **CA-DL2 Astra N1 — fixed** | DL-428’s exact option A referred to “those six reasons” without reproducing the Gap paragraph. | Added the presented item 3.b **Gap paragraph verbatim** at `Plans/Decision_Log.md:5044`, under “Card’s presented context (not Jared’s words)” at `:5042`. The corresponding DL-428 PlanUnit at `:8173` contains the same context. Option A, Jared’s quote and every Sources line remain unchanged. |

**Source fidelity:** removing only the 38 inserted PlanUnit blocks and the labelled DL-428 context restores the pinned Decision Log bytes exactly. Existing PlanUnit field values are unchanged. All 38 new `canonical_text` values match their own full prose entries. The unchanged frozen validator’s `decision_section_bytes` function extracts all 38 complete entries, including DL-429’s proposal and DL-450’s appendix. No frozen validator was edited or full seal validator executed.

**Checks at the fixed content commit:**

| Check | Exit | Result |
|---|---:|---|
| Currentness edition copy and `sha256sum` comparison | 0 | All 15 ignored files match the shared edition before index generation. |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | Top-level **pass**, 99 documents / 3,092 shards. |
| `python3 scripts/pm-plan-index.py generate` | 0 | Top-level **pass**, 96 documents / **7,476 PlanUnits** / 30,097 acceptance units; **38 PlanUnits added**, none removed. |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Top-level **pass**, zero failures. |
| `python3 scripts/pm-plan-index.py validate`, before and after | 1 / 1 | Parsed top-level **fail** in both runs. Full failure arrays are exactly equal: 21 `plan_unit_removal_ledger_invalid` rows and one `plan_unit_removed_without_ledger_decision` for DL-302. **New failures: 0.** Both runs compare with `origin/main` at `73f2231a9ec1c93190adafcdde51030f028c8c2d`. |
| Dependency graph / external retention target check | 0 | All DL-415..DL-452 indexed; zero unresolved references overall; build order available; zero cycles; zero missing targets among the seven external SP-237 edges. |
| `python3 -m unittest discover -s tests -p test_pm_plan_index.py` | 0 | All 18 existing tests pass. |
| `git diff --check` | 0 | No whitespace errors. |

**Derived scope:** only the 13 existing `Plans/_shards/decision_log/**` paths and six `Plans/.plan_index/**` outputs changed. The 281 changed existing index rows are all Decision Log units and change only `source_doc_sha256` / `source_location`. All unrelated documents’ unit rows are unchanged. Normal generator timestamps are retained. Runtime readiness remains `blocked_runtime_certification_incomplete`; no governance or runtime pass is claimed.

**Grades and limits:** family self-grades remain **not applicable → not applicable**: this lane prepares decision records, not family contracts, checkers or fixtures, and has no family self-grade file to update. No guard-isolation or mutation-proof implementation changed. IDs used are the existing reserved DL-415..DL-452 only; no new allocation. Astra’s mutable Wizard historical-source note and preservation of current main’s DL-302 remain integration work. This round changes no earlier prose other than the requested DL-428 context, no other owner document, registry, admission, script, test, governance lock or evidence bundle. There was no pm-mail, delegation, landing or `main` push.

Resource preflight: 113 GB available disk and 10 GB available RAM before worktree creation; sparse cones are `Plans scripts reports tests`. Checkers ran sequentially with at least 8 GB available RAM. The detached worktree `/home/sittingmongoose/pm-worktrees/ca-dl2-fix1` is removed with a literal-path `git worktree remove --force` after the report commit is pushed.

Round-1 evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-DL2/fix1/`. The `SHA256SUMS` manifest has SHA-256 `c66e556741d2367610f6baadbf9a0602ecd7199f48e397622da842d8aba47d0e` and covers all 27 retained check/proof files.

| Evidence file in `fix1/` | SHA-256 |
|---|---|
| `entry-verification.json` | `42c8796fda73155b18a9fae23b488570bb4c041ae8aa9fbcafa56d90267c0d7d` |
| `frozen-parser-check.json` | `78c2c96885bb1e1caad1e02fdbd930b9c401330c3e7ffab819bb327ebc0b44e6` |
| `index-and-scope-check.json` | `c6a09b74c1c26994604760dfb114df245bd3004389b411c6e5794d7652a96726` |
| `validation-baseline-comparison.json` | `359a292b383df8fa8b8de1e9d8290cf93741da9d332726d0dbd26111d0763f7d` |
| `index-validate-before.stdout` | `6cb3267ace6091c9774e1b502d6c5a5d15e18446dd323c791861a6b6d3c04d37` |
| `index-validate-after.stdout` | `f42f0c16259e92aa4107022cb0cf8a9fe3a299a0851dc0b7e93de7266e6b2289` |
