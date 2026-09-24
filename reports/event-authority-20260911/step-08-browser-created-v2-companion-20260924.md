# Step 08 — Browser-created v2 checkpoint companion: reviewed draft and repairs

Branch `plans/browser-created-sp278-20260923` carries a conditional v2 successor for the `browser.workspace.created` filtered checkpoint. It adds a DL-046 subsection and criterion SP-266-A006 to `Plans/storage-plan.md`, a v2 reader paragraph and criterion SMPFS-167-A005 to `Plans/Section15_MVP_Promoted_Features_Spec.md`, the closed companion schema `Plans/browser_workspace_created_checkpoint_v2.schema.json`, its fixtures `Plans/browser_workspace_created_checkpoint_v2_fixtures.json`, the decoded-value oracle `scripts/pm_browser_workspace_created_v2.py`, and v2 tests in `tests/test_pm_browser_workspace_created.py`. Its definition status is `conditional_not_admitted`: no registry, event, admission or retention row changes, the registered v1 value, binding and reader stay current, and native migration, redb, source, permission and crash proofs are NOT_RUN. This report covers the unverified draft tip `c0eca9d5a9`, which it supersedes as a record, and the repairs made after a blind review. It changes no Step 08 or Step 09 count.

## The reviewed draft, `c0eca9d5a9`

The draft was inherited from a retired Codex thread and forked from `main` at `d247d57ebd`. Its three commits are `153ae37c20` (prototype report), `3b4fb20e5f` (owner edits and owner-successor report) and `c0eca9d5a9` (schema, fixtures, oracle and 12 v2 tests). At that tip `python3 -m unittest tests.test_pm_browser_workspace_created` ran 48 tests, all OK, and `python3 scripts/pm_browser_workspace_created_v2.py` printed `PASS` with `definition_status` `conditional_not_admitted` and `native` `NOT_RUN`. The two earlier reports, `step-08-browser-created-v2-prototype-20260923.md` and `step-08-browser-created-owner-successor-20260923.md`, describe `153ae37c20` and `3b4fb20e5f`; each now says so under its title.

| Authored file at `c0eca9d5a9` | SHA-256 |
|---|---|
| `Plans/browser_workspace_created_checkpoint_v2.schema.json` | `785cf65568b7705380458e0ab9baa357cef4466dc87ff7da717811258f8ba5c8` |
| `Plans/browser_workspace_created_checkpoint_v2_fixtures.json` | `24664c17d6e73c43328de152ed29df4bda4eabbc1ca01784ec511d789dc2e628` |
| `scripts/pm_browser_workspace_created_v2.py` | `ee9a6fc6abf58074fe51979dfa6d77b7cf3dd718c98446bad9150641cb13c750` |
| `tests/test_pm_browser_workspace_created.py` | `0e0cdcdca95bc6e7e8a3267450277a2c43a034e1a8cbc78b767287b1516b384c` |

## Review disposition

A blind review of `c0eca9d5a9` against `origin/main` `566970cb7b` returned **fix_then_land** with 15 findings: 2 blocking (S-01, S-04), 8 should-fix (S-02, S-03, S-05 to S-10) and 5 notes (S-11 to S-15). The review and its probes are outside the repository.

| Review evidence | SHA-256 |
|---|---|
| `/home/sittingmongoose/PM-Experiments/sp278-review-20260924/REVIEW.md` | `ce42e3e665e766e572198317b84a3086528aab8a830a58c554b0c57f7e4da983` |
| `/home/sittingmongoose/PM-Experiments/sp278-review-20260924/findings.jsonl` | `6b1c308232d2b3c111767a78777d13f0a41c256ee92fbf45b5d0ba2a399203c7` |
| External prototype manifest `/mnt/Cursor/PM-Experiments/browser-created-sp278-v2-prototype-20260923/v1/manifest.json` (rechecked) | `8616d27b9c4cfa7b11e4467e7b3d7be037e93e34b1be118309dda0b11562ae83` |

## Repairs, one commit per finding

Jared authorized the repairs through the coordinator, with two adjustments to the review's text. For S-03, the v2 value persists the nine-field durable SP-278 token without `redb_snapshot_id`, following the Storage owner decision the coordinator ruled on Jared's delegation on 2026-09-24 (landing separately on `plans/storage-owner-closeout-20260924`), instead of the open-question wording the review proposed. For S-13, the branch is rebased onto `origin/main` last, after every fix.

| Finding | Repair |
|---|---|
| S-01 (blocking) | The oracle refuses only a withdrawn value or an incomplete filter, so a degraded SP-278 survivor checkpoint commits and discloses as degraded history. `fixture_values()` can rebind to any SP-278 positive case. Three tests from `degraded_survivors`: degraded commit and disclosure pass, false-healthy and incomplete-filter candidates fail. |
| S-04 (blocking) | A DL-046 paragraph names `#/$defs/checkpoint` as the defining schema, lists the stored fields and the v1 fields and cursor components not carried forward, and names `#/$defs/generation_transaction` and `#/$defs/cleanup_transaction` with their `.v2` schema IDs as read-only resolver views of the same-key redb commit. |
| S-05 | The sibling-citing cleanup sentence is replaced by a DL-046 restatement of same-key generation custody for created v2: one current plus at most two retired cores, publication identity, refresh, replacement and rotation, the capacity wait, and cleanup inclusive at first withdrawal plus 604800 seconds with `hold_refs` resolved through `retention_hold_record`. After the handoff commits, the v1 binding cannot write the key. The oracle's cleanup now also requires the maintenance, access and deletion witnesses the restated rule names. |
| S-03 | `index_read_token` stores the nine-field `#/$defs/durable_index_read_token`; the writer and every reader join the live snapshot id at read. Prose, schema, fixtures, oracle and tests follow; a stored ten-field token is rejected. |
| S-07 | Both owner documents title the addition "Conditional SP-266 v2 successor adopting the SP-278 read token — 2026-09-23", with an explicit anchor, a DL-046 newly-authored label and a citation of `step-08-browser-pair-depth-assessment-20260923.md`. |
| S-08 | The writer commits only its own checkpoint; the historical join is published read-only and is never a durable Browser projection row. |
| S-09 | Section15 keeps the v1 checkpoint and reader as the current route until the v2 replacement. |
| S-06 | SP-266 lists the v2 schema, fixtures and oracle in `validation_surfaces`, adds SP-278 to `depends_on` and `source_lineage`, and appends SP-278 and the v2 schema ID to its ContractRef; SMPFS-167 lists the v2 schema. No dependency cycle results. |
| S-02 | Seven tests: every schema conditional on the current value, a bare core and a retired core; a verified-empty positive with fabricated-bound negatives; and negatives for every previously unexecuted oracle exit. A null `now_utc` no longer raises out of cleanup. |
| S-10 | This report, and one line in each of the two earlier reports. |
| S-11 (note) | A v2 value with more than one v1 custody entry fails with `multiple_v1_custody_entries`. |
| S-12 (note) | The v2 `storage_instance_id` keeps v1's lowercase UUID pattern next to `format: uuid`. |
| S-15 (note) | The fixture resolves its SP-278 source by `generic_fixture_source` path and pointer instead of embedding a copy; the oracle checks the SP-278 join and core relations itself, against the SP-278 schema and digest module, instead of calling the reset oracle; the tests load the v2 module in `setUpClass`. The derived fixture values are identical to the embedded ones they replace. |
| S-13 (note) | Rebased last, below. |
| S-14 (note) | Landing record and reseal names, below. |

Four changes go beyond the review's text and are named here so they are not mistaken for drift: the S-05 cleanup authority witnesses, the S-02 fix that stops a null or non-string `now_utc` from raising out of cleanup, the S-03 Section15 sentence that makes the v2 reader join its live snapshot id, and the S-15 oracle command line, which now checks three positive cases instead of one.

## Landing preparation after the rebase

After all fixes the branch was rebased onto `origin/main` `15ab001892` and pushed with a lease pinned to the previous tip `df26658634`. Conflicts arose only in derived files, the `storage-plan` and `section15_mvp_promoted_features_spec` shard trees and `Plans/.plan_index`, in the nine commits that edit an owner document. Each was resolved by regenerating with `--config Plans/sharding_config.json`, and regeneration changed no other shard tree. Both owner documents merged cleanly: each equals `git merge-file` of the fork, `main` and the pre-rebase tip. Every other branch file is byte-identical to the pre-rebase tip. `main` then gained three report-only commits, so the branch was rebased again onto `afcbec3317` (lease pinned to `2559802a59`); those commits touch only `reports/pm7-promotion-20260924/REPORT.md`, which the branch does not touch.

Before re-applying, the cited passages were re-read against the landed text. The SP-266 created section, the SP-278 generic index section, the SP-265 run-start adoption, the SP-282 reset section, the SMPFS-167 and SMPFS-168 sections and DL-046 are byte-identical at the fork `d247d57ebd` and at `15ab001892` and `afcbec3317`, and so is SP-311's snapshot-fence sentence. The section 2.3.1 SP-278 read-token rule, which landed after the fork, is identical at the review snapshot `566970cb7b` and at `15ab001892` and `afcbec3317`. The Storage owner decision on stored SP-278 tokens (`plans/storage-owner-closeout-20260924`) had not landed, and `main` has no DL-076 or later, so S-03 cites the coordinator's ruling of 2026-09-24. When that branch lands, the citation can name its Decision Log entry.

| Check at `72efcb6655` (base `afcbec3317`) | Result |
|---|---|
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | pass: 2720 shards, 99 sources |
| `python3 scripts/pm-plan-index.py validate` | pass, 0 failures: 6718 PlanUnits (`main` 6718); 26212 acceptance units (`main` 26210, plus SP-266-A006 and SMPFS-167-A005); 18345 edges (`main` 18344, plus SP-266 on SP-278); 0 cycle components |
| `python3 -m unittest tests.test_pm_browser_workspace_created` | 63 tests OK: 36 v1 and 27 v2 (48 at the draft tip) |
| `python3 scripts/pm_browser_workspace_created_v2.py` | `PASS`, 3 positive cases (default, `verified_empty`, `degraded_survivors`), `conditional_not_admitted`, native `NOT_RUN` |
| Line trace of the 27 v2 tests | every oracle statement executed except docstrings and the `__main__` block |
| `python3 -m unittest tests.test_pm_browser_workspace_reset` | 51 tests OK |
| `python3 -m unittest tests.test_pm_browser_event_admission` | 38 tests OK |
| `python3 scripts/pm-browser-event-admission.py` | pass, 42 registry families |
| `python3 scripts/pm_browser_workspace_reset.py` | pass |

The last four rows ran at `2559802a59`, whose tree differs from `72efcb6655` only by `main`'s `reports/pm7-promotion-20260924/REPORT.md`. Regenerating shards and the index at the tip changes nothing but `generated_at_utc`. The logs, the rebase and resolution scripts and the passage comparison are in `/home/sittingmongoose/PM-Experiments/sp278-fixes-20260924/`, whose `MANIFEST.sha256` has SHA-256 `4a196694877af4363a21b23f951dd5a5e93ba508987b980320d44f7c7f2accc5`. Not run: `pm-plans-verify.py run-gates` and `pm-landing-check.py`, which run in the shared checkout at landing, and every native migration, redb, source, permission and crash proof.

| File at `72efcb6655` | SHA-256 |
|---|---|
| `Plans/browser_workspace_created_checkpoint_v2.schema.json` | `a881162262c63f9e278d50a7cf8bfb9125d80f8e0180915cef86a31e74810d5f` |
| `Plans/browser_workspace_created_checkpoint_v2_fixtures.json` | `c2faf72628ca096105602b08ea6214e2616322ee87e59e26f0eb23e9323c0a42` |
| `scripts/pm_browser_workspace_created_v2.py` | `6b2869c79703140beb88df3a65553f08b77c108f4e0e8948d4bbcb1475b63a96` |
| `tests/test_pm_browser_workspace_created.py` | `00d3c414fec6f18dc9a4a4dc232015d3b28458e3f81dd2b85789601be8fc6565` |
| `Plans/storage-plan.md` | `5044ca80c582deac8cc5d531882a92240ebdd13011d54f0089f97f0e24f15c9c` |
| `Plans/Section15_MVP_Promoted_Features_Spec.md` | `138d57ec43325256585bfa978167666dab32d96465f4025dc0614a62e1f9a05c` |

Commits as rebased onto `afcbec3317`, oldest first: the draft's `97c8886583`, `174a6f864f` and `96846c95a4`; then S-01 `7c2da8fc88`, S-04 `f6644a0ffa`, S-05 `3c17f67dde`, S-03 `71f6e89810`, S-07 `593c03b128`, S-08 `c8e341cd09`, S-09 `99b59e7bc6`, S-06 `b9d8b91023`, S-02 `4497650af3`, S-10 `cde9f44931`, S-11 `9129371eee`, S-12 `bfa88ee2d2` and S-15 `72efcb6655`; this record follows them. A later rebase at landing changes these hashes but not the file hashes above.

## Landing record and reseal request

The landing record and the reseal request must name both owner documents this branch edits, `Plans/storage-plan.md` and `Plans/Section15_MVP_Promoted_Features_Spec.md`, and both new acceptance units, `SP-266-A006` and `SMPFS-167-A005`. The branch adds no PlanUnit, family, registry, event, admission or retention row. Governance staleness for those two documents (Spec Lock hashes, owner and artifact evidence hashes, the readiness report and the plan-migration snapshot) is the expected result of editing canon before the next reseal, which belongs to the designated Plans agent. The branch has not landed; the coordinator gives the go under the landing lock.
