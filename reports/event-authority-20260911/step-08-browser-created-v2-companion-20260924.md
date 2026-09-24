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
| S-06 | SP-266 lists the v2 schema, fixtures and oracle in `validation_surfaces`, depends on SP-278, and names SP-278 and the v2 schema ID in `source_lineage` and its ContractRef; SMPFS-167 lists the v2 schema. No dependency cycle results. |
| S-02 | Seven tests: every schema conditional on the current value, a bare core and a retired core; a verified-empty positive with fabricated-bound negatives; and negatives for every previously unexecuted oracle exit. A null `now_utc` no longer raises out of cleanup. |
| S-10 | This report, and one line in each of the two earlier reports. |

The notes S-11, S-12 and S-15 and the rebase (S-13) follow in later commits; the landing-preparation record below is added after the rebase, with the final counts and the landing and reseal names S-14 asks for.
