Landing-ready: yes

# Re-check, review cycle 2 (DL-066): `plans/ea-browser-pair-sp286-20260924` at `d08075c7c7`

**Verdict: land.** There is no blocking finding and no should-fix finding.
- All ten cycle-1 findings are repaired. S-02 to S-07 use the cycle-1 wording exactly.
- No repair broke anything next to it. Regeneration, YAML, tests, lints and citations all hold.
- Four notes remain (R-01 to R-04), all about records rather than canon:
  - R-01 to R-03 are one-line wording fixes to the report. They can be applied before landing or recorded as open questions.
  - R-04 is a stale line number in a commit message. It needs no change.

**Scope.** This is DL-066's re-check. It reads the rows the repair commits changed and the rows they were meant to change, and nothing else.

**Read-only.**
- Nothing under `/mnt/Cursor/PuppetMaster` or `~/pm-worktrees` was edited or read from a working tree. No git worktree was created, nothing was fetched or pushed, and only read-only git commands ran.
- `scripts/pm_event_authority_independent_validator.py` never ran.
- The exports and scratch files are in `/mnt/Cursor/PM-Experiments/review-ea-browser-sp286-cycle2-20260925/`, with logs in `logs/` and helper scripts in `scratch/`.
- The ignored currentness edition was symlinked, not copied. Its five file hashes and mtimes are unchanged after every run (`logs/currentness-edition-hashes.log`).

## Order followed

**1. The authority, at base `a6480b0f7c`**, read with `git show`, never from a working tree:
- **DL-066:** `Decision_Log.md` 1119-1150.
- **DL-046:** 616-645, and its PlanUnit at 4121.
- **SP-286:** `storage-plan.md` 21921-22035, and its unit at 22037.
- **CV-339:** `Contracts_V0.md` 22096-22278. The resolve.v2 row is at 22201, the restore protocol at 22214-22218, and the producer-adoption sentence at 22220.
- **The Executor precedent:** the run.started adoption at `Executor_Protocol.md` 7285-7291, and EP-116 at 7295.
- **Section 15 terminal-move adoption:** 11886-11890, with its recheck at 11899-11901.
- **SMPFS-167 and SMPFS-168 as they stand at the base:** 11411-11560 and 11562-11714.

**2. The bytes.**
- I read the diff `a6480b0f7c..d08075c7c7`.
- I made `git archive` exports: `export-base` and `export-branch`, 14,662 and 14,663 files, which matches `git ls-tree`.
- I compared the branch's Section 15 with the cycle-1 proposed file, byte for byte.

**3. Regeneration and index checks**, in `export-branch` with the edition symlinked.

**4. Tests**, on both exports.

**5. Citations**, checked against the base text.

**6. Only then the author's report**, followed by:
- the reconciliation of its claims;
- `sha256sum -c` on the evidence directory;
- the validators behind every "Expected at landing" figure, run on both exports;
- the two full aggregates, run on both exports.

## Cycle-1 findings

| Finding | Cycle 1 | Result | Evidence |
|---|---|---|---|
| S-01 | note | Repaired | The base `a6480b0f7c` descends from `38b8c1301d`. The depth42 `.md` is present at the base (blob `db3c8f4b`). All 6 index files and 29 shards regenerate to the committed bytes, apart from 4 `generated_at_utc` stamps, so nothing was hand-merged. |
| S-02 | should fix | Repaired | The suggested restore paragraph follows its anchor directly, word for word, in both subsections (branch 11513-11521 and 11753-11760). The A006 and A005 tails are as suggested. It matches Executor 7289 and CV-339 22214, 22218 and 22220. |
| S-03 | should fix | Repaired | Both request sentences are word for word as suggested (branch 11484-11490 and 11722-11730), and the old command-level wording is gone. The named fields exist: EventRecord has `event_id` and `idempotency_key`; the payload has `context.browser_workspace_id` and `facts.prior_workspace_generation` and `facts.workspace_generation`; `resolved_transition` has `command_instance_id`, `idempotency_key` and `checked_workspace_revision`. |
| S-04 | should fix | Repaired | The created pre-commit sentence (branch 11505) and the reset retry sentence (branch 11741) each follow their anchor directly. "an issued original ... append" is in both canonical sentences and in A006 and A005. A005 carries the retry clause, and the old "resolves the original ... append" is gone. It agrees with terminal-move (base 11889-11890) and with the retained reset text (base 11637) and created text (base 11442-11443). |
| S-05 | note | Repaired | The sentence is exact, and the old "returns the original identity and result from that resolution" is gone. |
| S-06 | note | Repaired | Both subsections carry the exact "complete current protected group, after ... dedupe/restore checks". |
| S-07 | note | Repaired | A new paragraph in both subsections, directly before "Resolution is passive", word for word (branch 11523 and 11762). |
| S-08 | note | Repaired | Both `validation_surfaces` lists have one new double-quoted entry each. PyYAML reads each as a single list item. The IDs they name, SMPFS-167-A006 and SMPFS-168-A005, are the IDs the index gives the new criteria. The report says A005 has no executable oracle; A006 only by implication (R-02). |
| S-09 | should fix | Repaired | The report exists and has an "Expected at landing" block. I reproduced every figure in it on the exports (see the reconciliation below), and the author's evidence files match mine row for row. |
| S-10 | should fix | Repaired | "Effect on the depth grade" now says what S-10 asked for, more cautiously: the producer gap is closed by name; created reaches at most 10 of 12; reset reaches 12 only if the restore half holds and the oracle cell is not lowered for A005. The DL-077 sentence matches DL-077 at the base (1515 onward: "fails closed for each until its record shows all twelve criteria passing"). |

I checked the wording mechanically with `scratch/check_repairs.py`, which normalises whitespace. All 26 checks pass (`logs/check-repairs.log`): each suggested text is present, in the right place, and the text it replaced is gone.

## What the repairs did not break

**Section 15 is exactly the reviewed file plus S-08.**
- Section 15 on the branch (SHA-256 `c3ff1624...`) is the cycle-1 proposed file (`2ad113a8...`) plus two appended `validation_surfaces` entries, on lines 11608 and 11824. Nothing else differs.
- The proposed file is the cycle-1 tip's Section 15 with `proposed-edits.patch` (`e79e72d4...`) applied. `patch` reproduces it exactly.
- The S-07 commit's blob `11287a83` is the proposed file.
- `main`'s Section 15 blob `43c2f804` is the same at `ac9c0ad2e4`, `3ce6eb882c`, `38b8c1301d` and `a6480b0f7c`, so matching the old proposed file reverts nothing on `main`.

**Scope.**
- The diff is Section 15, its 29 shards, the 6 index files and the report.
- A whole-tree export diff shows the same set.
- The registry is unchanged (`0be544181eda...`, revision `2026-09-11.2`), and so are `browser_event_admission.json` and `Spec_Lock.json`.

**Regeneration and the index.**
- The shard check passes: 99 documents, 2,722 shards.
- `pm-plan-index.py validate` fails only on `plan_unit_retention_baseline_unavailable`, which needs git. I checked by hand that no PlanUnit is added or removed: 6,728 on both sides.
- SMPFS-167 and SMPFS-168 are the only units whose content changes. 166 others change only `source_doc_sha256`, and SMPFS-169 and SMPFS-170 also move lines.
- Acceptance units go from 26,258 to 26,260, adding SMPFS-167-A006 and SMPFS-168-A005.
- Nine existing SMPFS-167 and SMPFS-168 acceptance units change only `validation_surfaces`, because they inherit the S-08 entries. Prose entries like these already occur 1,742 times in the repository, and no script checks them as paths.
- Four new `depends_on` edges are added. The readiness report gains one Section 15 drift row, and its dependency counts rise by four.

**YAML.** PyYAML 6.0.2 parses both edited blocks to exactly the index values (`logs/yaml-parse-vs-index.log`).

**Tests.**
- On both exports: created 63 OK, reset 53 OK, admission 38 OK.
- `pm-browser-event-admission.py` exits 0, and its output is byte-identical on both.

**Lints.**
- `lint-contractrefs` gives the same single pre-existing failure on both: a `.audits` path absent from exports. So `#SP-286` and `#CV-339` resolve.
- `lint-banned-phrases` and `lint-path-refs` pass on both.
- The two new anchors are unique.

**The S-04 retry beside the S-02 restore rule.**
- The retry runs only "if Storage's own reconciliation establishes that no original event exists".
- SP-286 says a restored absence proves nothing ("Restoring it does not prove those identities were never issued", storage-plan 22001; also 22003 and CV-339 22214).
- So after a restore the retry condition cannot hold, and the restored pending request stays fenced. The two sentences agree.

## R-findings

All four are notes. None is blocking or should-fix. The exact wording is in `recheck-findings.jsonl`.
- **R-01** (report, line 9). The quotation "not adopted by SMPFS-167/168" does not occur in depth42. Its words are "is not adopted by SMPFS-167 or SP-266." and "is not adopted by SMPFS-168 or SP-282." The substance is right.
- **R-02** (report, line 32). The S-08 commit says the report states that A006 and A005 have no executable oracle. The report states it for A005 only (line 37). S-08 itself is repaired by the named obligations.
- **R-03** (report, line 27). The report relies on the parent evidence directory's `NOTE.txt`, but that directory's `SHA256SUMS` does not cover it. Its SHA-256 is `4bb53237...`. What it says checks out.
- **R-04** (commit `6b2f2162f5` message, outside the affected rows). "Section 15 11970-11971" is the cycle-1 tip's numbering. At the base the passage is at 11889-11890, and on the branch at 12011-12012. No change is needed.

## What I could not verify

- **`pm-landing-check.py` itself.** It needs git and a full checkout. I ran its components on the two exports instead: the four subchecks that move, `pm-plan-migration.py validate` on the current run, and both full aggregates (see the last section). Its baseline comparison and exit code were not run. The expected exit is 1, since every added row is staleness.
- **Totals in a full checkout.** Some subchecks read ignored inputs that exports lack (`tests/agent_packet_restrictions`, most of `Plans/.audits`). For those I compared deltas only, and the deltas are equal on both sides. The four named subchecks match the author's full-worktree evidence row for row.
- **How the landing check will print the 29 shard rows.** It classes every `artifact_hash_stale` row as staleness. The shard rows name no branch path, so it will list them as new staleness rather than as rows on Section 15. Exit 1 is expected either way, and the report tells the lander what the 30 rows are.
- **The rebase onto the current `origin/main` `9986aeabe5`.** `main` moved after dispatch by two report-only commits: `reports/event-authority-20260911/step8-9-progress-20260924.md` and `reports/landing-checks/LANDING_20260925_EA_HANDOVER.md`. Neither touches a path of this branch. The rebase is still needed before the fast-forward.
- **The coordinator's Step 8 instruction itself.** Only the base record `step8-9-progress-20260924.md` (lines 5 and 31) speaks to it.
- **Native behaviour** of any binding, and the next depth regrade. The first is NOT_RUN by definition; the second is a forecast.

## Reconciliation of the report's claims

| Report claim | Checked against | Result |
|---|---|---|
| Only Section 15 and its derived files change; the registry is at `2026-09-11.2` (`0be544181eda...`); `browser_event_admission.json` is unchanged. | Export tree diff; `sha256sum`; `cmp` | Confirmed. The report itself is the only other file. |
| Each unit gains a canonical sentence, a criterion, `depends_on` SP-286 and CV-339, a ContractRef line and a named obligation. | Section 15 diff; index | Confirmed. The existing ContractRef line gains two refs; no new line is added. |
| The owner never calls `issue.v2` and adopts no `resolve_full_value.v1`. The v1-route sentence is intact. | Branch text; grep | Confirmed. |
| Authority is DL-046; the gap is depth42's "not adopted by SMPFS-167/168"; the file is on `main` since `3ce6eb882c`. | DL-046; depth42 at the base | Authority and file are confirmed. The quotation is inexact (R-01). |
| Cycle 1 was fix-then-land: 0 blocking, 5 should-fix, 5 notes. There is one commit per repair, in the reviewer's wording. | `findings.jsonl`; `git log`; `check_repairs.py` | Confirmed. |
| After S-07, Section 15 equals the proposed file (`2ad113a8...`). | `git hash-object` and `sha256sum` | Confirmed. The S-07 blob is `11287a83`, which is the proposed file. |
| The checks ran at `2c71f90b61` on `a6480b0f7c`. The evidence `SHA256SUMS` is `9615042d...`. | `sha256sum -c`; `sha256sum SHA256SUMS`; `context.txt` | Confirmed: 19 of 19 OK, and the hash matches. |
| Shards 99/2,722. Validate passes with 6,728 and 26,260, against 26,258. | My runs; the author's `index-validate.json` | Confirmed. My validate fails only on the git baseline, and my hand check agrees. |
| SMPFS-167 and SMPFS-168 are the only units whose content changes. There are +4 edges and +1 Section 15 drift row. | Unit diff; index JSON diff | Confirmed for PlanUnits. Nine existing acceptance units of the same two units also change `validation_surfaces`. |
| Section 15 is the proposed file plus two entries, `c3ff1624...`. | Python byte comparison | Confirmed. |
| Tests: 63, 53 and 38 OK; the admission script passes, all as on `main`. | Both exports | Confirmed. |
| The pre-rebase run at `a6252abe46` gave the same deltas. The parent `SHA256SUMS` is `6414216a...`. `NOTE.txt` explains the base line. | `sha256sum -c` (15 OK); hash; counts 41/41/26/7, with 30/30/1/3 naming Section 15 | Confirmed. `NOTE.txt` is not covered by `SHA256SUMS` (R-03). |
| Depth: created at most 10 of 12; reset 12 only if the restore half holds and A005's oracle cell is not lowered; DL-077 records fail closed until re-pinned. | depth42 rows[40] and rows[41]; DL-077 | Confirmed. A006's lack of an oracle is not stated (R-02). |
| Evidence and plan graph: +30 `artifact_hash_stale` each, 143 to 173. | `validate-evidence` and `validate-plan-graph` on both exports | Confirmed. The 30 rows are Section 15 plus all 29 files of its shard directory, from one bundle (`pm7-usage-recovery-plan-sharding-2026-08-29`). |
| Readiness: +1 Section 15 drift row, 27 to 28. | `validate-implementation-readiness` | Confirmed. |
| Plan migration: +3 run-002 `stale_batch_report_sha256_after` rows (168 to 170), 12 to 15. | `validate-plan-migration` | Confirmed. |
| `plan-migration-validate` stays at 33,072. 12 rows change: 7 Section 15 and 5 repository-wide. | `pm-plan-migration.py validate --run-dir .../pds-20260906-017-...` on both exports | Confirmed, row for row, and identical to the author's 31.8 MB file. |
| `test_pm_pnc019_currentness` gains a Section 15 row; the existing rows are `Decision_Log`, `Goal_Runtime_System` and `storage-plan`. | The test on both exports | Confirmed. |
| There is no Spec Lock entry for Section 15. The counts are 6,728 and 26,258 to 26,260. | `Spec_Lock.json`; index | Confirmed. |
| The review's older figures (against `38b8c1301d`) are 26,257 to 26,259, 11 to 41, 25 to 26 and 4 to 7. The bases moved with the anchors landing, which added SP-214-A006 and 132 rows. | Acceptance IDs at `38b8c1301d` and `a6480b0f7c`; 11 + 132 = 143 | Confirmed. The only new acceptance ID is SP-214-A006. |
| The ordering against the anchors no longer applies, because the anchors landed (`9507c8d2e8`) and the exports repair (`d30bbc95e8`) keys a truncated subcheck from its complete export. | CLAUDE.md at the base; `EXPORT_COMMANDS` at the base (it lists `validate-evidence` and `validate-plan-graph`); commits | Consistent. The landing-check run itself was not run (see above). |
| The branch was rebased three times, with all six index files regenerated at each stop. | Commits exist; my regeneration reproduces the committed files | Consistent. |
| Reseal request: the bundle rows for Section 15 and its 29 shard files, a currentness edition with Section 15, run-002 rows 168 to 170, readiness, and the nightly snapshot. | Matches S-09's list and the measured rows | Confirmed. |

## Full aggregates on both exports

I ran `pm-plans-verify.py run-gates` (about 340 s) and `audit-governance` (about 220 s) on both exports. The files are `logs/agg-export-*/` and `logs/cmp-run-gates.log` and `logs/cmp-audit-governance.log`.

**Only four subchecks change their totals, in both aggregates:**

| Subcheck | Base | Branch |
|---|---:|---:|
| evidence | 143 | 173 |
| plan graph | 143 | 173 |
| implementation readiness | 27 | 28 |
| plan migration | 12 | 15 |

**Every other subcheck has the same total and status on both exports.** That is 32 in run-gates and 29 in audit-governance. Among the unchanged totals:
- `json_syntax` 16 and `support_refs` 1 come from ignored inputs that exports lack.
- `lint_contractrefs` stays at 1, `verify_spec_lock` at 2, `prd_planning_runtime_contracts` at 1,240, `pm7_gui_fixtures` at 3 and `audit_status_index` at 1.
- `check_shards`, `lint_banned_phrases`, `lint_path_refs` and `browser_event_admission` pass.

**One change in content only.** `audit_closure` stays at 201, but some of its printed rows change content: 8 in audit-governance and 2 in run-gates. They change only the "current" hash of `Plans/.plan_index/plan_units.jsonl`, which moves with any Plans edit, so they are repository-wide like the 5 plan-migration rows. Their error is `audit_closure_validator_error`, and their detail says "is stale", which the landing check treats as staleness. The subcheck is over the print cap and has no complete export, so the landing check compares it by total only, and the total did not rise. The report does not mention these rows, and it does not need to.

**Result.** The aggregates confirm the report's statement that the only new landing-check rows are the Section 15 staleness it lists. The printed-sample shifts in evidence and plan graph under audit-governance's 100-row cap are sampling, not new rows.
