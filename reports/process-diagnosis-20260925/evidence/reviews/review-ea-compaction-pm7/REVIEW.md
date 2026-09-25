# Review: fix/ea-compaction-pm7-validator-20260924 (tip a3f68cbaf0, against main 38b8c1301d)

**Verdict: fix_then_land. Landing-ready: no.**

There are 9 findings, all in `findings.jsonl`:
- 2 blocking: C-01 and C-02
- 4 should-fix: C-03, C-04, C-05 and C-09
- 3 notes: C-06, C-07 and C-08

I followed the review form's order:
1. The bytes against the authority, which produced C-01 to C-08. They were written at 00:06:27Z (`logs/findings-written-at.txt`), before I opened the author's report.
2. The author's report.
3. The reconciliation, which added C-09 (`RECONCILIATION.md`). No blind finding was changed or withdrawn after I read the report.

**How the review was run.**
- Everything was read-only. I used `git archive` exports of `38b8c1301d` (main) and `a3f68cbaf0` (tip), plus a simulated rebase: main with the branch's three files laid over it. I rebuilt none of them.
- Probes and mutations ran in two small copies (`probe-tree`, `probe-tree-repaired`), which held only `scripts/`, the top-level `Plans/*.json`, `Plans/event_payloads/` and the two fixture directories.
- Nothing under `/mnt/Cursor/PuppetMaster` was edited. No worktree was created and nothing was pushed.
- The only git write was `git fetch origin`. I did not run `git merge-tree`; a rebase conflict was ruled out by path intersection (C-07).

## Authority, read first

- **DL-039** prose and PlanUnit, **DL-040** prose (DL-040 has no PlanUnit twin) and **DL-077** prose, all on `main` `38b8c1301d`.
- **`Plans/event_family_registry.json`**: revision `2026-09-11.2`, SHA-256 `0be544181eda...`, which is the value cited. The compaction row is `#/families/39`:
  - `event-family-context-compaction-completed`, revision `1.0.0`, scope `project_only`
  - payload `pm.context_compaction_completed.schema.v1`, with pointer `Plans/event_payload_context_compaction_completed.schema.json#`; that file's `$id` matches
  - retention `RP-AUTHORITY-INDEFINITE@1.0.0`, with no aliases
- **Step 6** (`b240dd93e2`):
  - The fixture diff renames `pm7_context_compaction_result_receipt_without_event` to `pm7_context_compaction_committed_completion_event`, and replaces `pm7_context_compaction_cannot_fabricate_event` with six negatives.
  - The ATS diff amends ATS-017, ATS-037 and ATS-040.
  - `step-06-contract-validation.md` and `step-06-check-summary.json` both say the PM7 validator was left byte-identical, failing with exactly the three errors. The retained evidence `pm7-validation.json` shows those three.
- **ATS-040** on main requires the following:
  - exactly one `context.compaction.completed` family, with started and failed unregistered;
  - a completed trace carries exactly one completion, and every other outcome carries none;
  - line 3701: the PM7 GUI fixture validator "must also pass together".
- **The PM7 fixtures the script reads.** These are the 27 files in `tests/fixtures/pm7_shared` (7) and `tests/fixtures/usage_gui` (20), all now tracked and named one by one in `.gitignore`. The script also reads `Plans/shared_runtime_command_contract_fixtures.json`, its `pm7_context_compaction_trace` schema, the registry, the Wiring Matrix and the Home layout schema. It runs `scripts/pm-shared-runtime-command-contracts.py validate`.
- **The depth42 assessment** on main:
  - `step-08-depth42-assessment-20260924.json`, SHA-256 `ba9b84f99e0e...`, as cited, and the `.md`.
  - Compaction has 11 PASS. `positive_negative_oracles` is PARTIAL, and its one stated ground is this checker.
  - Rubric criterion 12 (`rubric.md`, `81f1d8b2...`, listed in `SHA256SUMS` `d3bb2f55...`): "where a static checker exists, it is expected to pass".
- **`reports/landing-checks/baseline.json`**, recorded at `792d2fb8b1`, holds exactly three PM7 rows in each aggregate:
  - `forbidden_context_compaction_event_family` (`e43c09e39e87`)
  - `missing_pm7_invalid_command_fixtures` (`0bd711c39c41`)
  - `missing_pm7_valid_command_fixtures` (`49aae096cffa`)

## What holds

The seven items in the dispatch, in order.

**1. Scope.** The branch touches exactly three paths, one per commit:
- `scripts/pm-validate-pm7-gui-fixtures.py` (`81a7c1caed`)
- `tests/test_pm_validate_pm7_gui_fixtures.py` (`766de902ca`)
- the new report `reports/event-authority-20260911/step-08-compaction-pm7-validator-20260924.md` (`a3f68cbaf0`)

The test file already exists and is tracked (blob `117d4013` on main, added by `289983decc`). `.gitignore` line 89 already names it (`!/tests/test_pm_validate_pm7_gui_fixtures.py`), so no new ignore line is needed.

All three files are LF, and `git diff --check` is clean. The branch sits on `ac9c0ad2e4`, not on main; the rebase is clean (C-07).

**2. Identity.** The script now accepts `context.compaction.completed` and forbids every other `context.compaction.*` event type. It requires exactly one admitted row, and it compares `family_id` and `payload_schema_id`. It is still **wider than the admitted row**:
- revision, payload schema pointer, scope and retention are not compared (C-01, blocking);
- a legacy alias that maps `context.compaction.started` onto the row also passes (C-04).

**3. Names.** The required sets change exactly as Step 6 did; the names were extracted from source (`logs/required-sets.log`):
- **valid:** 14 names on both sides; only `..._result_receipt_without_event` is replaced, by `..._committed_completion_event`;
- **invalid:** 10 names become 15; `..._cannot_fabricate_event` is replaced by the six Step 6 negatives.

Nothing else in the script's checks is loosened:
- the Usage, shared-file, workspace-event, status-bar and Home checks are unchanged;
- the old blanket prohibition now exempts only the admitted row.

One stale assertion survives unchanged, the open-drawer Compact Now expectation `event_types: []` (C-05). It is at branch lines 491-505, main lines 439-453.

**4. Tests.**
- The five new tests pass: 12 OK on the tip and on the rebased tree, and 7 OK on main. The module form `python3 -m unittest tests.test_pm_validate_pm7_gui_fixtures` also gives 12 OK.
- They cover acceptance, another compaction family, family_id and payload_schema_id changes, a missing or duplicated row, and the name constants.
- None of them runs `validate()`. Four mutations of the `validate()` wiring survive (C-03).

**5. The gate and the subcheck.** Both were run the way `pm-plans-verify.py` runs them.

`pm-validate-pm7-gui-fixtures.py validate` and `pm-plans-verify.py validate-pm7-gui-fixtures`:

| Tree | Result | Exit |
|---|---|---|
| main | fail, with exactly the three baseline errors | 1 |
| tip | pass, 0 failures | 0 |
| rebased | pass, 0 failures | 0 |

Full `run-gates` and `audit-governance` on main and on the rebased tree (`logs/compare-*.log`, `logs/aggregate-totals.log`):

| Aggregate | Failing subchecks, main | Failing subchecks, rebased | What changed |
|---|---|---|---|
| `run-gates` (36 subchecks) | 10 | 9 | only `validate_pm7_gui_fixtures`, from 3 to 0 |
| `audit-governance` (33 subchecks) | 9 | 8 | only `pm7_gui_fixtures`, from 3 to 0 |

- Every other subcheck has identical rows and totals, including the truncated ones: 201 and 1,240 on both sides.
- The three pre-existing failures resolve and no new one appears.
- I did not run `pm-plan-migration.py validate`. The branch touches nothing under `Plans/`.

**6. The oracle cell.**
- The fix removes the one ground the assessment gives for PARTIAL, because the named checker now passes.
- It does not change the grade. The grade sits in the pinned assessment and moves only through a regrade. DL-077 needs "a current depth assessment with all twelve criteria passing".
- A regrade has to weigh C-05: the passing checker still asserts that a committed Compact Now carries no event.
- The bytes support "one obstacle removed", not "12 of 12" (C-06 note; the report's overclaim is C-09).

**7. Ownership.**
- **Conflict.** Another live thread has a competing fix of the same lines: `96ab84f13c`, on the packet-canon-closure thread's `fix/named-plan-identity-joins-20260924` and `fix/packet-canon-repairs-20260924`. It is stricter on identity and has `validate()`-level tests and an independent review (C-02, blocking).
- **No conflict with the other owners:**
  - `289983decc` (landing-check thread: `missing_inputs` and the tracked tests) is preserved, and its 7 tests pass.
  - `concept/pm7-promotion-20260924` touches none of these files.
  - The shared checkout has no uncommitted change to them.
  - `Concepts/pm7-tools/README.md` lists `validate-pm7-gui-fixtures` as a repository check. It records that transform T34 removed "the two context-compaction lookalikes", so the PM7 concept is event-silent for Compact Now. That supports C-05 and does not conflict with this edit.

## What must change before landing

**C-01 (blocking): identity pin.**
- Add `family_revision` 1.0.0, `scope_policy` project_only, the full `payload_schema_ref` and DL-040's `retention_policy_ref` to the admitted identity.
- Report the mismatched fields.
- Probes R1 to R5 show that each of these currently passes.

**C-02 (blocking): a choice between two fixes.**
- The coordinator decides whether this branch or `96ab84f13c` lands, and tells the other thread.
- C-01's field set contains all of `96ab84f13c`'s, so the two converge if this branch lands.

**Should fix in the same pass:**
- **C-03:** tests that run `validate()`.
- **C-04:** an alias guard.
- **C-05 and C-09:** report wording that discloses the open-drawer no-event assumption and stops predicting 12 of 12 and a passing DL-077 record.

## Exact edits to land

All the files below are in `proposed/`, built by `proposed/make_repairs.py` from the tip's files.

**`script-repairs.patch` (C-01, C-04).** The full file is `pm-validate-pm7-gui-fixtures.repaired.py`, LF. The identity and the alias guard become:

```python
ADMITTED_COMPACTION_EVENT_FAMILIES = {
    "context.compaction.completed": {
        "family_id": "event-family-context-compaction-completed",
        "family_revision": "1.0.0",
        "scope_policy": "project_only",
        "payload_schema_id": "pm.context_compaction_completed.schema.v1",
        "payload_schema_ref": {
            "path": "Plans/event_payload_context_compaction_completed.schema.json",
            "json_pointer": "#",
            "schema_id": "pm.context_compaction_completed.schema.v1",
        },
        "retention_policy_ref": {
            "registry_schema_id": "pm.storage_value_registry.v2",
            "policy_id": "RP-AUTHORITY-INDEFINITE",
            "policy_version": "1.0.0",
        },
    },
}
...
    alias_types = [
        alias.get("alias_event_type") if isinstance(alias, dict) else alias for f in families
        for alias in ((f.get("legacy") if isinstance(f.get("legacy"), dict) else {}).get("aliases") or [])
    ]
    aliases = sorted({
        a for a in alias_types if isinstance(a, str) and a.startswith(FORBIDDEN_COMPACTION_EVENT_PREFIX)
    })
    if aliases:
        failures.append({"error": "forbidden_context_compaction_event_alias", "aliases": aliases})
...
        else:
            mismatched = sorted(key for key, value in identity.items() if rows[0].get(key) != value)
            if mismatched:
                failures.append({"error": "admitted_context_compaction_event_family_mismatch", "event_type": event_type, "fields": mismatched})
```

**`tests-repairs.patch` (C-01, C-03, C-04).** The full file is `test_pm_validate_pm7_gui_fixtures.repaired.py`. It adds:
- `test_a_changed_revision_scope_schema_ref_or_retention_fails`
- `test_a_started_or_failed_alias_is_forbidden`
- the class `CompactionChecksReachValidate`, whose three tests run `validate()` with `load` and `subprocess.run` patched

**The report (C-05, C-06, C-09).** The exact sentences are in C-05 and C-09.

**What the repairs do, verified** (`logs/probe_identity_repaired.log`, `logs/probe_alias_repaired.log`, `logs/mutation-repaired.log`, `logs/gate-rebased-with-repair.out`):
- The live inputs still pass. `context_compaction_event_family_count` is 1, and the gate passes on the full rebased tree.
- Probes R1 to R6 and R6b fail closed. R7 (owner documents) still passes, by design: owners are not identity.
- There are 17 tests, all OK. On the tip's script exactly the six new identity and alias subtests fail.
- All 12 mutations are killed, including the four that survive today.

## Landing procedure

1. **Decide C-02.** The coordinator decides which fix lands. If it is this branch:
   - Apply the two patches and the report wording.
   - Run `python3 -m unittest tests.test_pm_validate_pm7_gui_fixtures`; expect 17 OK.
   - Commit per concern.
2. **Rebase onto main.** Run `git fetch origin` and `git rebase origin/main`. It is clean: no shared path.
3. **Land under the landing lock:**
   - fast-forward;
   - `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`;
   - `python3 scripts/pm-landing-check.py --base origin/main` in the shared checkout;
   - push `main`.

   The landing check should list the three PM7 buckets under "Gone since the baseline" in both aggregates and report nothing new. No Plans document changes, so no reseal is owed.
4. **Tell the packet-canon-closure thread.** Tell it to drop `96ab84f13c` when it rebases (worktrees `~/pm-worktrees/named-plan-identity-joins-20260924` and `~/pm-worktrees/packet-canon-repairs-20260924`).
5. **Follow up on C-05.** Route the open-drawer Compact Now fixture and its expectation to the ATS-037 owner as a separate task, before the compaction regrade.

## Not verified

- **`pm-landing-check.py` itself and `pm-plan-migration.py validate`.** I compared the two aggregates directly on exports, which are not git repositories.
- **Whether the regrade will put the oracle cell at PASS.** That is the grader's call, and C-05 bears on it.
- **Whether DL-039's "no validator edits" is meant to cover this script.** I read it as covering the independent seal check, following DL-077's own text (C-08); the coordinator should confirm.
- **The correctness of the depth42 grades and of `96ab84f13c` beyond its diff.** For `96ab84f13c` I verified only its diff, its report and its two evidence hashes.

## What I ran (logs/)

- **Setup:** `fetch.log`, `revparse.log`, `branch-shape.log`, `blob-identity.log`, `script_test_sha.log`, `started-at.txt`
- **Authority:** `registry_sha.log`, `depth42_sha.log`, plus the saved copies in `authority/`
- **Tests:** `tests-{main,branch,rebased}.log`
- **Validator and gate:** `validator-*.json`/`.exit`, `gate-*.out`/`.exit`, `gate-rebased-with-repair.out`
- **Aggregates:**
  - `run_aggregates.sh`
  - `run-gates-*.json`/`.stdout`/`.stderr`/`.exit` and `audit-governance-*` (the same set)
  - `compare_aggregate.py`, `compare-run-gates.log`, `compare-audit-governance.log`, `aggregate-totals.log`
- **Probes:**
  - `probe_identity.py`/`.log`/`.json` and the `_repaired` versions
  - `probe_alias.py`/`.log` and the `_repaired` versions
- **Mutation:** `mutate_tests.py`, `mutation.log`, `mutate_tests_repaired.py`, `mutation-repaired.log`
- **Diffs and checks:**
  - `required-sets.log`, `diff-check.log`
  - `competing-96ab84f13c-{script,tests}.diff`
  - `ownership-check.log`, `branches-touching-script.log`
  - `report-claims-check.log`, `report_sha.log`
- **Findings:** `write_findings.py`, `append_reconciliation.py`, `findings-written-at.txt`, `reconciliation-appended-at.txt`
- **Diffs at the top level:** `script.diff` and `tests.diff`

After the review I deleted the exports and probe trees (`export-main`, `export-branch`, `export-rebased`, `probe-tree`, `probe-tree-repaired`). `git archive` of `38b8c1301d` and `a3f68cbaf0` recreates them. I kept `authority/`, `proposed/` and `logs/`.

## Addendum: main moved during the review

At 00:05:20Z `origin/main` advanced from `38b8c1301d` to `2cdd280768` (`logs/main-moved.log`).

**What landed.** Four report-only commits, the Step 8 plan landing.
- They touch none of the paths this review depends on: the script, its test, the PM7 and Usage fixtures, the registry, the command fixtures and their schema, the ATS document, the Wiring Matrix, the baseline and the depth42 assessment.
- They share no path with the branch.
- `96ab84f13c` is still not on main.

The findings stand as written. The rebase target is now `2cdd280768`, and the rebase is still clean.

**What the new records say about this branch.**
- `step-08-remaining-source-work-plan-20260924.md` line 9 and `step8-9-progress-20260924.md` line 32 name this branch as the compaction fix, "in review".
- Neither mentions the competing fix `96ab84f13c` (C-02).
- Line 45 of the same plan says the oracle cell "is blocked by the PM7 GUI validator, which sits under `Concepts/`, outside this agent's scope". The validator is `scripts/pm-validate-pm7-gui-fixtures.py`, and the plan's own line 9 treats it as in scope.

That stale sentence is on main, not on this branch. It is for the Step 8-9 thread to correct, and it is not a finding against this branch.
