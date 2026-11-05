# DM — review round 8

Branch: `plans/ea-w2-small-owners-20261104`. Reviewed input: `93f27d505890f4e8ee623ff796855a5f2e6585b6`. Code head: `e8dda799efde63628c8c902f313a608aae0e64be`. **B1 and B2 fixed; eight families self-grade PASS as prepared, subject to S1/S2 cross-lane sweep and the existing integration prerequisites.** Both Settings names remain excluded. Native execution: **NOT_RUN**.

## Review round 8: findings and responses

- **B1 — fixed (`14761618b7a910124c04e9b9234f235efd5578eb`). Where:** `scripts/pm-small-owner-events.py:541`, `scripts/pm-small-owner-guard-audit.py:147`, and each family's `retry_envelope_cases` in `Plans/small_owner_event_fixtures.json`. **Why:** current retry checked the protected stored envelope while ignoring the incoming `schema_id` and `schema_version`. **Fix:** separate `pm.event.v0` and `2.0.0` current-request guards run before semantic resolution. Every family has wrong-identity and unknown-version negatives. Each changes exactly one incoming scalar, retains the authentic original event/result/receipt/commitments unchanged, and keeps the semantic digest equal. All 16 bypasses reproduce at the reviewed input and refuse here without effect or returned receipt. `PRODUCER_FIELDS` and historical decoding are unchanged; no envelope markers or Storage metadata enter the digest. **Verify:** `fix8/*-regressions.json`, the eight complete suites, and the two envelope guard rows per family.
- **B2 — fixed (`e8dda799efde63628c8c902f313a608aae0e64be`). Where:** both `genuine_other_context_event_and_receipt` cases in `Plans/small_owner_event_fixtures.json`, `scripts/pm-small-owner-guard-audit.py:159`, and `DM-guard-removal.json`. **Why:** the authentic foreign pair differs in both `event_type` and `payload_schema_id`; those predicates are not duplicates. **Fix:** mark each pair `test_class=integration_regression`, `check_11_credit=false`, list its two distinct predicates, and continue executing it in the full checker. Remove its catalogue credit and the combined `retry.family_schema_duplicate` mutation/expectation. Keep both production fences and the independent `retry.family` / `retry.schema` witnesses with all derived observations coherent. Both context integrations refuse. The current isolated inventory has neither paired case nor joint-removal row. **Verify:** both context full suites, `*-guards.json`, and `source-scope.json`.
- **S1 — OPEN sweep, not rebuilt here. Where:** `pm-small-owner-events.py:80–120,276–342,496–565`, the eight payload numeric domains, CV-620–627 and SP-600–607. **Fix at sweep:** adopt CV-1100/SP-1100/SP-1101's shared owner-qualified number rule and authenticated historical recipe selection. No new local cap, serializer, normalization or recipe is introduced. Full-u64 metadata, physical float values/bytes and signed zero must be preserved. Existing retained controls through `2**64-1` pass; they do not establish shared-rule adoption.
- **S2 — OPEN sweep, not rebuilt here. Where:** the private audit's whole-validator/whole-keyword and compound cuts, inventory coverage and old broad table. **Fix at sweep:** adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`. The older 458-row execution is historical broad-removal evidence, not complete predicate isolation. The current summary replaces that claim with the four selected narrow predicates below. No independent oracle deduction is taken solely for machinery under the 04:45Z instruction. B2 was the blocking fixture exception and is fixed separately.
- **Sol C8C-B1:** its context-fixture portion is fixed by B2; its proof-engine portion is carried as S2 under the later shared-tool instruction. No finding is disputed or stopped for a new product decision.

## Checks and limits

Eight complete family suites run **one family at a time**: **55,252 summed assertions**, including repeated shared globals. All 16 independent differential cases repair the reviewed bypasses; all 56 authentic foreign-family retry pairs refuse. Ordinary retry returns only the original Storage result/receipt. The separate full suites preserve receipt, format, type, SP-337 size, source/custody, checkpoint, withdrawal and schema-reference negatives.

The four selected narrow guard cuts run in each family: **32/32 rows PASS**, **32/32 weakened complete checkers fail**, zero mutation exceptions. Each removal flips one own negative per family, and the full rejected complement remains refused. The exact current inventory has **23,235 unique negative IDs**; the selected matrices make **93,640 observations**, with shared global witnesses repeated. This is selected proof only; the broad machinery is S2.

| Guard | Negatives that flip across eight families | Negatives that stay rejected in the union | Weakened full checkers |
|---|---:|---:|---|
| `retry.envelope_identity` | 8 | 23227 | 8/8 fail as required |
| `retry.envelope_version` | 8 | 23227 | 8/8 fail as required |
| `retry.family` | 8 | 23227 | 8/8 fail as required |
| `retry.schema` | 8 | 23227 | 8/8 fail as required |

Exact cuts, flipped IDs, full-checker failures and complement definitions are in `DM-guard-removal.json`; raw tables list every complement ID and are pinned by path/SHA-256. The authentic context integrations receive **zero isolated-negative credit**. Old broad results remain retrievable at `93f27d505890f4e8ee623ff796855a5f2e6585b6:reports/event-authority-20261104/DM-guard-removal.json` and are explicitly superseded for predicate-isolation claims.

| Standing check | Round-8 result |
|---|---|
| **1 — policy** | Current replay-only refusals and retained replay-only reads/rebuilds pass; incoming envelope markers now have independent fences. |
| **2 — application keys** | Existing exact CV-366 Server/operation UTF-8 keys and foreign/case alternatives rerun in family suites. |
| **3 — partitions** | Encoded `project~` positives and raw/foreign partition negatives pass. |
| **4 — size** | Existing 16,383/16,384 inline and 16,385 external/custody boundaries pass. |
| **5 — full matches** | Existing identifier/LF and timestamp grammar/calendar vectors pass. |
| **6 — semantics** | Semantic projection unchanged; incoming Storage metadata cannot replace original result/receipt. |
| **7 — checkpoints** | Existing source/Storage/key/generation/frontier and selected/live/durable joins rerun. |
| **8 — failures** | Each of 32 actual weakened full checkers raises its intended assertion; a successful mutant is not credited. |
| **9 — references** | Complete suites eagerly resolve every schema branch, including unused definitions. |
| **10 — history** | Ordinary/replay-only reader and rebuild controls survive missing old operation handles; retained integers through `2**64-1` pass. Shared number/history recipes remain S1. |
| **11 — isolation** | New marker cases have exactly one incoming defect and authentic unchanged originals. Separate family/schema witnesses pass narrow cuts; paired foreign cases are integration-only. Remaining machinery moves to S2. |

**Recurring Astra classes:** original ID/digest/custody/owner and source contradictions (1/7), Storage-assigned metadata (2), historical reads/withdrawal (3), consistent typed joins (4/11), eager unvisited refs (5), stored-byte limits (6), timestamp format/ranges (12) and masked copies (8) rerun through the full family suites. Independent round-8 mutations add the 16 marker cases, missing/legacy current-marker refusals, Storage-metadata substitution, 16 retained-large-integer controls, 32 historical read/rebuild controls and 56 foreign pairs. Grades (9) below reflect only repaired B1/B2, with native NOT_RUN; number spellings and authenticated original recipes (10/10a) remain S1. The broader guard-proof claim is S2.

## Family grades before and after

Before: Astra 3 / Sol 8c at `93f27d505890f4e8ee623ff796855a5f2e6585b6`. Only the eight `positive_negative_oracles` cells improve **PARTIAL → PASS**. Membership remains ABSENT; six retention cells remain PARTIAL for RT. Both context families retain RP-RUNTIME-365D. Prepared grades are not admission, native activation or sweep completion.

| Family | Reviewed before | After | Complete checker assertions |
|---|---|---|---:|
| `format.applied` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6771 |
| `lsp.server.lifecycle_changed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6825 |
| `model.catalog_refreshed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6987 |
| `subagent.context_rehydrated` | 10 PASS / 1 PARTIAL / 1 ABSENT | 11 PASS / 1 ABSENT | 7196 |
| `subagent.context_shrunk` | 10 PASS / 1 PARTIAL / 1 ABSENT | 11 PASS / 1 ABSENT | 7221 |
| `project.added` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6725 |
| `project.created` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6729 |
| `git.clone.completed` | 9 PASS / 2 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 6798 |
| `settings.updated` | 2 PASS / 1 ABSENT / 9 N/A | unchanged; EXCLUDED_CONFIRMED | — |
| `settings.theme.updated` | 2 PASS / 1 ABSENT / 9 N/A | unchanged; EXCLUDED_CONFIRMED | — |

Candidate totals: **74 PASS / 14 PARTIAL / 8 ABSENT → 82 PASS / 6 PARTIAL / 8 ABSENT**. Including exclusions: **78 PASS / 14 PARTIAL / 10 ABSENT / 18 N/A → 86 PASS / 6 PARTIAL / 10 ABSENT / 18 N/A**. All **316** self-grade source quote/hash citations verify at the code head. Prior canonical owner, search-lineage and DL-408 application evidence is unchanged.

## Integration qualifications, scope and evidence

**N1:** normal index validation uses the current copied ignored edition; result is exit **1**, top-level **fail**, recorded in `fix8/index-validate.json`. Index/currentness drift remains an integration qualification; no unrelated owner or generated artifact was changed. All 15 copied currentness files match their source SHA-256. No `Plans/*.md` owner was edited, so shard/index regeneration is not invoked for these checker/fixture fixes. Shard body/path check: exit **0**, top-level **pass**.

**N2:** carry Astra 3's existing 41-error Storage-profile baseline (not rerun; no profile/registry edit), DL-408 decision integration at `b6332f391a7870bad5f01a29a7e9d080050dac27`, six RT choices, later per-family admission and designated governance work. The pinned branch is not rebased onto later main. No current-main or governance clearance is inferred.

Only the checker, its witness catalogue/classification, fixture additions and compact reports change. AST/source-scope checks confirm all semantic/digest/number/history helpers, production family/schema fences and other fixture facts are unchanged. No owner prose/schema contract, registry, admission, Decision Log, governance artifact or test file is edited. No pm-mail, subagent, browser, server, landing or main push is used.

Entry disk/RAM: **78 GB / 7 GiB**, refreshed before worktree creation at **78 GB / 9 GiB**. Serial pre-job memory minimum: **7 GiB**; **0 paused samples**. The wrapper pauses below 6 GiB, rechecks every 120 seconds and resumes at 7 GiB. The literal-path sparse worktree is removed after the final push; the completion record pins the final head and cleanup.

**IDs used:** no new PlanUnit, family, consumer, checkpoint or storage IDs. New fixture IDs per family: `retry_wrong_envelope_identity`, `retry_unknown_envelope_version`; new guard labels: `retry.envelope_identity`, `retry.envelope_version`. Existing units: FS-075, LSPS-173, MS-199, PP-151/152, PJCT-072/073, SCS-085, CV-620–627, SP-600–607 and ATS-300–304. Assessment: `EA-DM-FIX8-SELF-20261105`. Existing authority DL-045, DL-076, DL-408, CV-366, SP-278 and SP-286/CV-339 is reused without new decisions.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/fix8/`. `evidence-manifest.json` pins retained paths, sizes and SHA-256. `DM-round8-checks.json` records commands, counts and ordinary-check results. The report and self-grade are copied to the parent DM drafts folder. Reproduce with `python3 -B fix8/run-serial.py` while this worktree exists; paths/commands in `runs.json` support recreation from the pushed code head.
