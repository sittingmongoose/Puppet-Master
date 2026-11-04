# Depth of the three batch-1 seal families, 2026-11-04

Lane DS of stream E, batch 1. Machine-readable rows: `depth-b1-seal-families.json` beside this file, in the row format of `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json`.

**Graded tree:** branch `plans/ea-b1-seal-blockers-20261104` at `62e4f832f0`. Registry `2026-11-04.1`, 46 families. **Rubric:** the unchanged Step 8 rubric, `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-20260924/rubric.md`, with its 2026-09-24 clarifications.

This grades what canon says. It is not a runtime result: native execution is NOT_RUN for every family.

## Result

| Family | Rev | Disposition | PASS now | PASS 09-24 | Cells that rose |
|---|---|---|---:|---:|---|
| `context.compaction.completed` | 1.0.0 | CURRENT_WRITER | 12 | 11 | oracles |
| `browser.workspace.created` | 1.0.0 | CURRENT_WRITER | 12 | 9 | producer, consumers, oracles |
| `browser.workspace.reset` | 1.0.0 | CURRENT_WRITER | 12 | 11 | producer |

All 36 cells are PASS. 31 are carried and 5 are upgraded. There are 191 evidence items, and each quote is an exact substring of the one line it cites, checked by script. Every cell cites at least one `Plans/` source.

## What changed since 2026-09-24

- **Compaction oracles.** `64d4567f12` (2026-11-04) aligned `scripts/pm-validate-pm7-gui-fixtures.py` with DL-040. ATS-040 requires its full set to "pass together", and at this head it does: the PM7 GUI checker (one compaction family), `pm-shared-runtime-command-contracts.py validate`, `pm-plans-verify.py validate-pm7-gui-fixtures`, JSON syntax and `pm-plan-index.py validate`.
- **Compaction scope.** It was PASS on 2026-09-24. D1b graded it PARTIAL on `main` `be4766513f`, because the 2026-11-03 projects-refresh edit of ACD-461 claimed "newly admitted application editions". This branch's `d7e5840240` rewords ACD-461: the family is admitted in its Project edition only, and the app counterpart emits no EventRecord until Event Authority admits an application payload version. That now matches the `project_only` registry row, SP-259's criterion and DL-300 ("the one Event Authority grant of the projects and settings refresh"), so the cell is PASS again.
- **Browser producers.** The 2026-09-24 subsections (landed `a3d6bb616b`) adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` by name for both barriers. They also state non-reliance on `resolve_full_value.v1`.
- **Created consumer.** SP-266's v2 successor became the current definition on 2026-09-25 (`0ba3ac9019`). Its parts:
  - reader: `browser.workspace_inventory.created.v2@2.0.0`;
  - binding: `storage.browser_workspace_created_index.v2@2.0.0`;
  - stored token: SP-278's nine-field durable token, never `redb_snapshot_id`.
- **Created oracles.** The v2 oracles now test the route in force.

## Static checks at the graded head

| Check | Result |
|---|---|
| `scripts/pm-validate-pm7-gui-fixtures.py validate` | pass; `context_compaction_event_family_count` 1 |
| `scripts/pm-shared-runtime-command-contracts.py validate` | pass |
| `scripts/pm-plans-verify.py validate-pm7-gui-fixtures` | pass |
| JSON syntax, every `Plans/**/*.json` | pass |
| `scripts/pm-plan-index.py validate` | pass |
| `tests/test_pm_validate_pm7_gui_fixtures.py` | 13 OK |
| `tests/test_pm_browser_workspace_created.py` | 65 OK |
| `scripts/pm_browser_workspace_created.py`, `pm_browser_workspace_created_v2.py` | pass; v2 PASS with 3 positives |
| `tests/test_pm_browser_workspace_reset.py`, `scripts/pm_browser_workspace_reset.py` | 53 OK; pass |
| `scripts/pm-browser-event-admission.py` | pass |
| `tests/test_pm_browser_event_admission.py` (SP-262) | 38 OK after the re-freeze `62e4f832f0`; 30 of 38 failed before it on a stale `upstream40` pin |

**About the shared Browser suite.** SP-262, CV-332 and SMPFS-166 name it, so a reviewer could read its 30 failures as a Browser oracle failure.
- **Cause.** The failures were the fixture's fingerprint of the 40 pre-Browser registry rows. DL-188 (layout 2.0.0) and DL-300 (eleven Goal app editions) moved that fingerprint. They were not Browser defects.
- **Fix.** The re-freeze replaces only that pin and records the reason beside it.
- **What still guards it.** The next check is unchanged: the 40 rows must still be the exact reviewed successors.

## Still open, and not graded down

- Native execution: every listed native oracle and native proof is NOT_RUN. That includes compaction's 14 declared native oracles and both Browser families' resolve.v2 receipt-join pairs. Under the rubric, NOT_RUN alone never lowers a grade.
- An application edition of compaction or of either Browser family needs its own Event Authority admission before any app producer appends it. Owner text now says so for all three: ACD-461, SMPFS-167 ("absent app adoption remains handler_unavailable") and SMPFS-168 ("no client Boolean or documentation edit admits an app writer").

## Use

The three DL-077 admission records in `reports/event-authority-20260911/admission-records/` can point `depth_assessment` at the JSON beside this file, since every one of the 36 cells is PASS. This lane's next commit makes that change.
