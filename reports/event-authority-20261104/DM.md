# DM — fix round 3, final permitted round

Worker: **DM-FIX3**, VM. Branch: `plans/ea-w2-small-owners-20261104`. Input: `d30cd99c371276ece97105f402e72d7487d5a60f`. Contract/checker fix: `1eaddcd0ed045e78ac36d59fa1648799203640ab`.

The checkpoint identity gap is fixed across all eight prepared families. All standing checks pass; every family has eight explicit negative regressions run through the full checker. **64/64 full-checker subprocesses rejected the negative, and 8/8 harness probes rejected success exit 0.** The full current suite passes **4,846 assertions**. These are static contract/model oracles; native execution remains **NOT_RUN**.

## Review round 3: findings and responses

- **Standing check 7 — fixed (`1eaddcd0ed045e78ac36d59fa1648799203640ab`).** `scripts/pm-small-owner-events.py:337` validates the shared live token schema with strict full matches and its nine-field durable projection; `:352` joins original Storage/source/key/generation, `:372` joins every durable field to an independent selected live token and frontier, and `:396` fences publication. Passive reads validate the same identities. Each family's own three owner units and ATS paragraph state the rule; its fixture adds 37 checkpoint and four reader refusal cases. Every refusal preserves the complete old publication and produces no owner effect. The pinned input checker accepts the exact foreign-Storage mutation in all eight; the fixed checker refuses it in all eight. Removing the new gate fails the full checker for every family.
- **Cycle-2 B1 — remains fixed (`6eb5a0ba62`).** All three application families use exact CV-366 actual-Server UTF-8-hex keys; former hash recipes, foreign/missing Server and normalization refuse. The five Project-only families reject foreign/noncanonical keys without being given an application writer.
- **Cycle-2 B2 — remains fixed (`6eb5a0ba62`).** All three legal large-body families reject the review's >32 KiB inline bodies and pass their own 16383/16384/16385-byte and SP-337 external-reference boundaries. All eight additionally exercise Storage's byte gate with an oversized synthetic object before logical-schema validation. For the five bounded closed schemas, that artificial object is not a legal payload; no external-body product behavior is invented for them.
- **Cycle-2 B3 — remains fixed (`6eb5a0ba62`).** Every family rejects compatibility-only replay policy before current append/retry, preserves immutable historical reads and rejects every mutated/missing delivered receipt field before terminal success. A foreign delivered receipt leaves its already durable frame but exposes no receipt or success.
- **Cycle-1 resolved findings — preserved (`9f276c6e08`).** Correct closed redaction enums, 104 original-envelope joins, 77 payload joins, eight timestamp joins, family-specific clauses and producer witnesses remain enforced. All 24 current owner bodies match after their role heading. Project registration/new creation/ordinary Git clone boundaries stay distinct.
- **Settings disposition — preserved (`6757da332b`).** `settings.updated` and `settings.theme.updated` remain retired as superseded under DL-408. `settings.layer.changed` is the sole future Settings family. Historical bytes remain readable; DRY guard mapping stays disabled with `owner_contract_missing`. No Settings writer or event fixture was added. The cycle-2 review predates DL-408; its old request for a decision is superseded, not reopened.

No finding is disputed or stopped for Jared in this fix. Membership/admission and six previously pending retention cells remain outside this round.

## Per-family standing checks

| Exact family | 1 replay-only | 2 key | 3 partition | 4 byte cap | 5 LF | 6 semantic body | 7 checkpoint | 8 failure exit |
|---|---|---|---|---|---|---|---|---|
| `format.applied` | pass | pass (Project-only) | pass | pass | pass | pass | fixed (`1eaddcd0ed`) | pass |
| `lsp.server.lifecycle_changed` | pass | pass (Project-only) | pass | pass | pass | pass | fixed (`1eaddcd0ed`) | pass |
| `model.catalog_refreshed` | pass | pass | pass | pass | pass | pass | fixed (`1eaddcd0ed`) | pass |
| `subagent.context_rehydrated` | pass | pass | pass | pass | pass | pass | fixed (`1eaddcd0ed`) | pass |
| `subagent.context_shrunk` | pass | pass | pass | pass | pass | pass | fixed (`1eaddcd0ed`) | pass |
| `project.added` | pass | pass (Project-only) | pass | pass | pass | pass | fixed (`1eaddcd0ed`) | pass |
| `project.created` | pass | pass (Project-only) | pass | pass | pass | pass | fixed (`1eaddcd0ed`) | pass |
| `git.clone.completed` | pass | pass (Project-only) | pass | pass | pass | pass | fixed (`1eaddcd0ed`) | pass |

Check 2 is application-format applicable to three families; the five Project-only rows instead prove their exact current Project recipe and reject a foreign application-form key. Every family has an encoded Project positive, including independently authored Project variants of the three application-capable families. Check 5 covers all existing payload LF negatives plus new token LF negatives, including coherent token substitution. Check 6 proves changes to `sequence_id`, `observed_at_utc` and `persisted_at_utc` leave caller semantic identity unchanged, while full-value recovery rejects changed stored bytes.

## Negative cases and full-checker rejection

The complete 64-cell matrix, per-negative command, failure text and evidence path/SHA-256 are in `reports/event-authority-20261104/DM-round3-standing-checks.json` and `fix3/standing-checks.json`.

| Check | Per-family negative that catches a regression |
|---|---|
| 1 | Allow current retry of a genuine historical `projector_replay_only` original. Full checker refuses the regression. |
| 2 | Replace the current positive key with `application@1:NOT_HEX:wrong_operation`. Full checker rejects the positive. |
| 3 | Replace the authored encoded `project~` partition with its raw Project id. Full checker rejects it. |
| 4 | Bypass the 16 KiB Storage byte gate for this family. Full checker rejects the oversized inline acceptance; the three reachable external-body matrices also stay active. |
| 5 | Strip trailing LF from checkpoint identifiers instead of refusing it. The coherent selected/proposed-token LF negative fails the full checker. |
| 6 | Include Storage-assigned `sequence_id` in this family's caller semantic digest. Full checker rejects the changed digest. |
| 7 | Restore this family's unchecked rebuild publication. The explicit foreign Storage checkpoint case fails the full checker. |
| 8 | Mark an invalid original producer witness as a positive. The complete checker exits nonzero; separately passing success exit 0 to the failure-oracle guard raises a failure for every family. |

Every negative child calls `main()` with all eight families and all original checks enabled, with only the selected fixture/adapter mutated in memory. No repository fixture is overwritten by the audit. Initial execution checked every child exit and printed each family completion only after all eight refusals; its finalizer then used the obsolete Settings outcome spelling. The finalizer was corrected to the existing `retired` value and revalidated the eight completion records plus 64 retained failure outputs using `--summarize-completed`. All product checker/fixture bytes were unchanged; no completed subprocess result was replaced with a success or silently ignored.

## Grades before and after

Before is the requested input head's self-grade, including the checkpoint PARTIAL downgrade. After is the full source/checker head above. Intentional absent membership and the six permitted retention holds prevent a claim of all-twelve admission PASS.

| Exact family | Before | After |
|---|---|---|
| `format.applied` | 9 PASS/2 PARTIAL/1 ABSENT | 10 PASS/1 PARTIAL/1 ABSENT |
| `git.clone.completed` | 9 PASS/2 PARTIAL/1 ABSENT | 10 PASS/1 PARTIAL/1 ABSENT |
| `lsp.server.lifecycle_changed` | 9 PASS/2 PARTIAL/1 ABSENT | 10 PASS/1 PARTIAL/1 ABSENT |
| `model.catalog_refreshed` | 9 PASS/2 PARTIAL/1 ABSENT | 10 PASS/1 PARTIAL/1 ABSENT |
| `project.added` | 9 PASS/2 PARTIAL/1 ABSENT | 10 PASS/1 PARTIAL/1 ABSENT |
| `project.created` | 9 PASS/2 PARTIAL/1 ABSENT | 10 PASS/1 PARTIAL/1 ABSENT |
| `settings.theme.updated` | 2 PASS/1 ABSENT/9 NOT_APPLICABLE | 2 PASS/1 ABSENT/9 NOT_APPLICABLE |
| `settings.updated` | 2 PASS/1 ABSENT/9 NOT_APPLICABLE | 2 PASS/1 ABSENT/9 NOT_APPLICABLE |
| `subagent.context_rehydrated` | 10 PASS/1 PARTIAL/1 ABSENT | 11 PASS/1 ABSENT |
| `subagent.context_shrunk` | 10 PASS/1 PARTIAL/1 ABSENT | 11 PASS/1 ABSENT |

Both retired rows keep two PASS disposition cells, nine NOT_APPLICABLE current-writer cells and ABSENT membership. Their disposition is not graded as a current-writer prepared contract.

## Exact owner locations and shared hunks

| Exact family | Added identity contract locations |
|---|---|
| `format.applied` | `FS-075` `Plans/Formatters_System.md:1132`; `CV-620` `Plans/Contracts_V0.md:24496`; `SP-600` `Plans/storage-plan.md:29505` |
| `lsp.server.lifecycle_changed` | `LSPS-173` `Plans/LSPSupport.md:7271`; `CV-621` `Plans/Contracts_V0.md:24548`; `SP-601` `Plans/storage-plan.md:29558` |
| `model.catalog_refreshed` | `MS-199` `Plans/Models_System.md:9930`; `CV-622` `Plans/Contracts_V0.md:24600`; `SP-602` `Plans/storage-plan.md:29611` |
| `subagent.context_rehydrated` | `PP-151` `Plans/Prompt_Pipeline.md:6065`; `CV-623` `Plans/Contracts_V0.md:24652`; `SP-603` `Plans/storage-plan.md:29664` |
| `subagent.context_shrunk` | `PP-152` `Plans/Prompt_Pipeline.md:6117`; `CV-624` `Plans/Contracts_V0.md:24704`; `SP-604` `Plans/storage-plan.md:29717` |
| `project.added` | `PJCT-072` `Plans/Project_System.md:1007`; `CV-625` `Plans/Contracts_V0.md:24756`; `SP-605` `Plans/storage-plan.md:29770` |
| `project.created` | `PJCT-073` `Plans/Project_System.md:1059`; `CV-626` `Plans/Contracts_V0.md:24808`; `SP-606` `Plans/storage-plan.md:29823` |
| `git.clone.completed` | `SCS-085` `Plans/Source_Control_System.md:2165`; `CV-627` `Plans/Contracts_V0.md:24860`; `SP-607` `Plans/storage-plan.md:29876` |

- **Plans/Contracts_V0.md**: `@@ -24495,0 +24496 @@ canonical_text: |-`, `@@ -24546,0 +24548 @@ canonical_text: |-`, `@@ -24597,0 +24600 @@ canonical_text: |-`, `@@ -24648,0 +24652 @@ canonical_text: |-`, `@@ -24699,0 +24704 @@ canonical_text: |-`, `@@ -24750,0 +24756 @@ canonical_text: |-`, `@@ -24801,0 +24808 @@ canonical_text: |-`, `@@ -24852,0 +24860 @@ canonical_text: |-`
- **Plans/storage-plan.md**: `@@ -29504,0 +29505 @@ canonical_text: |-`, `@@ -29556,0 +29558 @@ canonical_text: |-`, `@@ -29608,0 +29611 @@ canonical_text: |-`, `@@ -29660,0 +29664 @@ canonical_text: |-`, `@@ -29712,0 +29717 @@ canonical_text: |-`, `@@ -29764,0 +29770 @@ canonical_text: |-`, `@@ -29816,0 +29823 @@ canonical_text: |-`, `@@ -29868,0 +29876 @@ canonical_text: |-`
- **Plans/Automated_Testing_System.md**: `@@ -7242 +7242 @@ canonical_text: |-`, `@@ -7282 +7282 @@ canonical_text: |-`, `@@ -7322 +7322 @@ canonical_text: |-`, `@@ -7362 +7362 @@ canonical_text: |-`, `@@ -7402 +7402 @@ canonical_text: |-`, `@@ -7433 +7433 @@ negative_constraints:`, `@@ -7436 +7436 @@ project.added — ATS-304 independent oracle supplement. project.added independe`, `@@ -7439 +7439 @@ project.created — ATS-304 independent oracle supplement. project.created indep`

These are refinements of each existing newly authored owner contract under DL-045, following independent exact-family inspection recorded in `DM-search.json`. Existing SP-278 consumer/projector/checkpoint identities and DL-076 token shape are reused. No new persisted value, technical identifier or owner authority is introduced.

## Verification and evidence

| Check | Exit / result |
|---|---|
| Full exact-family checker | 0; 4,846 assertions |
| All eight standing checks across eight prepared families | 0; 64 failure processes and eight zero-exit harness mutations verified |
| Previous 22 weakened-checker mutations | 0; 22 caught |
| Independent cycle-2 probe and current result assertions | 0; B1–B3 and resolved findings stay fixed |
| Shard generate / check | 0 / 0; parsed `pass` |
| Index generate / validate | 0 / 0; parsed top-level `pass` |
| Currentness input copy | 15 files, matching SHA-256 before generation |
| Derived ownership audit | No generated shard for an unedited owner changed |
| Storage recovery self-test | 0; `pass` |
| Storage profile | 1; same 41 missing-profile errors, output byte-identical to prior apply run |
| Evidence quotes and hashes / whitespace | 0 / 0 |

Exact commands, exit codes and output SHA-256 values are in `DM-checks.json`. Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/fix3/`. `artifact-manifest.json` records retained evidence paths and hashes. Report/self-grade copies are delivered in the parent `drafts/DM/` directory. Original input report, grades, checks and search records are preserved as `fix3/input-DM*`.

No new IDs were minted. Existing units used: **FS-075, LSPS-173, MS-199, PP-151/152, PJCT-072/073, SCS-085, CV-620–627, SP-600–607, ATS-300–304**. No registry append, admission, Decision Log entry, governance reseal, frozen-validator edit, profile change, native activation, subagent, landing or main push. An initial inbox/who read preceded the no-pm-mail brief; no registration or message was sent and no later mailbox call was made.

Entry resources: **16 GiB available memory, 115 GB available root disk**. The requested sparse detached worktree was created at the exact input head from `~/src/PuppetMaster`; currentness was copied and verified. After the final report push, remove `/home/sittingmongoose/pm-worktrees/DM-fix3` with the literal-path worktree command. No browser, server or venv was started.
