# Lane DG: depth of the registered Goal families, 2026-11-04

Drafting worker DG, stream E (Event Authority), running on Nas1. Branch `plans/ea-goal-depth-20261104`, cut from `origin/main` `be4766513f`, head `c352a417ba`. Worktree `~/pm-worktrees/ea-dg` on Nas1 (left in place for the lead). Map: D1a (`surveys/D1a/REPORT.md`, `DEPTH.jsonl`), checked again against the branch.

Nothing is admitted. `Plans/event_family_registry.json`, `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl`, `.gitignore`, the frozen validator and the Decision Log are untouched. No application (DL-300) edition changed. No registry row was appended or edited; the two prepared v3 rows are in `DG-prepared-registry-rows.json`, not applied.

## What each family now has

| Family | D1a | Self-grade | What changed on this branch |
|---|---:|---:|---|
| `goal.child_status_changed` | 9 | 12/12 (PPPPPPPPPPPP) | SP-420 admission proof adopted in SP-271; operating consumer (SP-339 `pm inspect`, F3-666); closed eight-field answer; fixture answer/join/current-canon cases; EA-UND-0003 marked historical |
| `goal.degraded` | 9 | 12/12 (PPPPPPPPPPPP) | Same pattern in SP-277; EA-UND-0006 marked historical |
| `goal.scheduled` | 9 | 12/12 (PPPPPPPPPPPP) | Same pattern in SP-280; EA-UND-0011 marked historical |
| `goal.progressed` | 9 | 12/12 (PPPPPPPPPPPP) | SP-420 in SP-300; operating consumer; new fixture file with payload, answer, join, current-canon and refusal cases |
| `goal.replanned` | 9 | 12/12 (PPPPPPPPPPPP) | Same in SP-301; notes the `catalog.runtime_replan` wiring row (open item 5) |
| `goal.stopped` | 9 | 12/12 (PPPPPPPPPPPP) | Same in SP-302 |
| `goal.verification_decided` | 9 | 12/12 (PPPPPPPPPPPP) | Same in SP-303 |
| `goal.updated` | 9 | 11/12 (PPpPPPPPPPPP) | SP-421 identity recipe; ATS-210 oracles. Producer cell stays PARTIAL (agent route, out of scope) |
| `goal.cancelled` | 9 | 10/12 (PPPPPPPPPPpp) | SP-422 identity recipe; SP-423 writer cutoff, reader withdrawal, rebuild fence; ATS-210 oracles |
| `goal_run.started` | 10 | 11/12 (PPPPPPPPPPPp) | SP-424 withdrawal protocol; ATS-210 projector cases |
| `goal_run.cancelled` | 10 | 11/12 (PPPPPPPPPPPp) | SP-425 withdrawal protocol; ATS-210 projector cases |
| `goal_run.certified` | 11 | 11/12 (PPPPPPPPPPPp) | ATS-210 GRS-085 projection cases only; oracles stay PARTIAL |
| `goal_run.stopped` | 3 | 8/12 (PPpppPPPPpPP) | DL-080 current contract, prepared: EP-200 writer listing, GRS-200, GRS-202/SP-428 projection extension, SP-426, CV-420 v3 payload, ATS-212 |
| `goal_run.blocked` | 3 | 8/12 (PPpppPPPPpPP) | Same for blocked: EP-200, GRS-201, GRS-202/SP-428, SP-427, CV-421, ATS-212 |
| `goal.blocked`, `goal.completed` | 3 | 3 | Not drafted (open item 8) |
| `goal.created` | 12 | 12 | Not touched |
| `goal.evidence_captured`, `goal.receipt_recorded`, `goal.tool_check_recorded`, `goal_run.replanned` | 3 | 3 | Out of lane scope |

The self-grade JSON (`DG-self-grade.json`) carries every cell with its evidence; carried cells keep D1a's citations, relocated to the branch head. It is a self-grade: the independent grader and the Sol and Astra reviewers decide.

## Newly authored owner contracts (DL-045)

Every one is labelled in its owner text as a newly authored owner contract under DL-045 and carries its own search scope and negative evidence.

| Id | Family or families | Binding | Search recorded in |
|---|---|---|---|
| SP-420 | the seven historical families | Original admission proof: SP-286 first-receipt custody plus an owner unit and approved registry checkpoint that admitted a writer. Finds no such writer for any of the seven | SP-420 "Per-family search" paragraph |
| SP-271/277/280/300..303 amendments | one each | Adoption of SP-420 with the family's own outcome; operating consumer `pm inspect` / F3-666; closed answer (SP-271/277/280) | SP-420 search; SP-339 |
| SP-339 paragraph | the seven | `pm inspect` and the record inspector call the family's reader; `pm tail`/`pm export`/`pm db dump` do not | — |
| `Plans/goal_history_reader_outputs.schema.json` | the seven, one `$def` each | Closed eight-field answers | — |
| SP-421 | `goal.updated` | `D = SHA256(JCS(["pm.goal.updated.command.v1","project",…]))`, event ID `goal.updated.v1:{D}`, key `goal.updated.command.v1:{D}` | SP-421 "Search" paragraph |
| SP-422 | `goal.cancelled` | Same shape, own domain `pm.goal.cancelled.command.v1`; frozen through the late-assignment profile | SP-422 "Search" paragraph |
| SP-423 | `goal.cancelled` | Writer cutoff, reader withdrawal, rebuild fence; unenrolled bindings refused until SP-305's migration | — (withdrawal mechanics; D1a's search) |
| SP-424 | `goal_run.started` | Writer cutoff, per-method reader withdrawal, new-generation rebuild fence | — |
| SP-425 | `goal_run.cancelled` | Same for D06 and the combined projector | — |
| EP-200 | `goal_run.stopped`, `goal_run.blocked` | Writers `owner.executor.workflow_run.stop.v1` and `owner.executor.workflow_run.block.v1`, entrypoints and order | EP-200 "Search" paragraph |
| GRS-200, GRS-201 | one each | Current contract: D-R21 / D-R16 edges over the native Workflow status set, GRS-075 reconciliation | EP-200 search |
| GRS-202, SP-428 | both | GRS-085 projection extension for qualifying births; value delta | — |
| SP-426, SP-427 | one each | Identity `pm.goal_run.stopped.v1` / `pm.goal_run.blocked.v1` recipes, custody, withdrawal | SP-426 / SP-427 "Search" paragraphs |
| CV-420, CV-421 | one each | v3 payload roots `goal-run-stopped.v3` / `goal-run-blocked.v3` | — |
| ATS-210, ATS-211, ATS-212 | as named | Oracle entries; fixtures and checkers below | — |

## Premise checks

| Answer | Premise | Today's text | Result |
|---|---|---|---|
| DL-045 (2026-09-11) | The 21 Goal families are in the registered depth-only scope | DL-045 table, Goal_Runtime_System row, lists all 21 | Holds |
| DL-080 (2026-09-24) | Pause/Abort wiring expects `goal_run.stopped` | `Wiring_Matrix.production.json` `catalog.orchestrator_pause`, `catalog.runtime_abort_run` still list it | Holds |
| DL-080 | The writer list names no writer | EP-118: "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`" | Holds |
| DL-080 | The run-history projection stops at these rows | GRS-085: "unsupported same-run replanned/blocked/stopped profiles … halt before that row" | Holds |
| DL-080 | Resume depends on `goal_run.replanned` | D-R21: "`resumable=false` forbids future resume without a distinct replan" | Holds |
| DL-080 | Stopped and blocked can come "first", before the Replan source work | EP-124 binds the whole `all_writers.v7` descriptor before birth; neither writer is in it | **Partly fails**: the writers need a fresh Workflow source edition. Applied as far as canon allows (EP-200 lists them, refused until that edition); reported as open item 2 |
| DL-080 | One Workflow-run scope | DL-300 (2026-11-04) gave `goal_run.blocked` a dormant app edition but `goal_run.stopped` none | Project contracts written; app asymmetry reported (open item 4), not changed |
| DL-081 (2026-09-24) | A route contract for the approved verification exception will exist | No unit cites DL-081; GRS-065 still says the route "remains separately unbound" | Gap: `goal.completed` exception path cannot be written (open item 8) |
| DL-079 (2026-09-24) | — | Out of lane scope (DL-079 vs DL-300 card) | Not applied |

## Ids used

GRS-200, GRS-201, GRS-202; SP-420 … SP-428; CV-420, CV-421; ATS-210, ATS-211, ATS-212; EP-200. None exists on `origin/main` (checked with `git grep` over `Plans scripts reports` at `be4766513f`) or in any of the other 497 `origin` branches (`git grep` over `Plans/*.md` at each branch tip after a fresh fetch: 0 hits). SIR-100..109 and BRS-100..104 are unused.

## Commits

- `936b424efe` plans: closed answers, fixtures and checker for the seven historical Goal readers
- `8de46420c4` plans: original admission proof, operating consumer and oracle routing for the seven historical Goal readers
- `bf649f1b05` plans: event identity recipes for goal.updated and goal.cancelled v3
- `e7d344c3fa` plans: writer cutoff, reader withdrawal and rebuild fences for goal.cancelled, goal_run.started and goal_run.cancelled v3
- `cf68c36329` plans: oracle fixtures and checker for five current Goal writers
- `9a95bc081f` plans: ATS-210 and ATS-211 name the current-writer and historical-reader Goal oracles
- `7138faa0d4` plans: prepared v3 payload schemas, fixtures and checker for goal_run.stopped and goal_run.blocked (DL-080)
- `19b7200918` plans: current contracts for goal_run.stopped and goal_run.blocked under DL-080, prepared without admission
- `c352a417ba` plans: make the DL-080 unit dependencies acyclic

Commit `19b7200918` was pushed with a failing `pm-plan-index.py validate` (a dependency cycle among the new DL-080 units; my command chain did not stop on it). `c352a417ba` fixes it with no text change; validate passes at the head.

## Checks

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-plan-index.py validate` (head `c352a417ba`) | 0 | status pass, no failures |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass; regeneration changed only shards of the five edited documents |
| `python3 scripts/pm_goal_history_reader_fixtures.py` (new) | 0 | 7 families: payload, answer, join, current-canon and refusal cases |
| `python3 scripts/pm_goal_current_writer_oracles.py` (new) | 0 | 5 families; fault-injected copies fail as expected |
| `python3 scripts/pm_goal_run_stop_block_oracles.py` (new) | 0 | 2 families: 63 cases |
| `python3 scripts/pm_emit_only_event_contract.py` | 0 | registry and app admission unchanged |
| `python3 scripts/pm-plans-verify.py validate-browser-event-admission` | 0 | |
| `python3 scripts/pm-runtime-integration-canon-validate.py validate` | 1 | 157 rows, identical set on base `be4766513f` (stale owner-file hash pins) |
| `python3 -m unittest tests.test_pm_assistant_contract_closure` | 1 | same 3 failures on base `be4766513f` |

pytest is not installed on Nas1; unittest ran the test module. The landing check, run-gates and audit-governance were not run (landing-only, about ten minutes each, and the brief limits this lane to targeted checks).

The two failing existing checks fail identically on the base `be4766513f`: `pm-runtime-integration-canon-validate.py validate` reports the same 157 rows (`owner_file_hash_stale` pins, including files this branch never touched), and `tests.test_pm_assistant_contract_closure` has the same three failures. Nothing new. The hash pins are governance staleness for a reseal; this lane restamps nothing.

## Open items

1. **SP-420 is one contract shared by seven families.** The lane asked for "the shared original-admission custody paragraph"; the brief forbids "a shared contract for several families". Each reader adopts it in its own amendment with its own outcome, but the lead should confirm this is acceptable.
2. **The stop and block writers cannot be installed yet.** The Workflow native writer set is closed by the `all_writers.v7` descriptor (EP-124). A fresh Workflow source edition that lists `owner.executor.workflow_run.stop.v1` and `owner.executor.workflow_run.block.v1` is needed; it is a technical package like `all_writers.v8` for Replan, not authored here. Producer, schema-at-registered-version, scope (registry `run_id` pointer) and consumer (profile key and version) cells stay PARTIAL until then.
3. **Admission of the prepared rows.** `DG-prepared-registry-rows.json` has the v3 rows for `goal_run.stopped` (`#/families/5`) and `goal_run.blocked` (`#/families/0`, application version copied unchanged). Admission is the batch integration step's.
4. **No application stopped event.** DL-300 gave `goal_run.blocked` a dormant app edition and `goal_run.stopped` none, while GRS-086 gives app runs Stop. Whether app runs need a stopped edition is for the owner; nothing changed here.
5. **Wiring row expects a historical family.** `catalog.runtime_replan` lists `goal.replanned` as the expected event of `cmd.runtime.replan`; GRS-070 refuses that writer. The row should name the current `goal_run.replanned` once that contract exists. Not edited (DL-080 changes no wiring).
6. **`goal.cancelled`**: SP-305's migration of unenrolled binding representations is still a separate dependency (SP-423 refuses those cancellations until it lands); GRS-081/SP-313 inspection has routing cases only.
7. **Oracle depth still short**: started-v3 and cancelled-v3 production (Start and D06 publication) have no cases; `goal_run.certified` still lacks the ATS-057 coordinator and consumer P4-P8 suite.
8. **`goal.blocked` and `goal.completed` not drafted.** Canon has no Goal V2 transition table (GRS-048 names the four states and their meanings only), so writing edges would decide behavior; the producers need current-writer successors at CV-341/SP-294 depth; and DL-081's route contract does not exist, so `goal.completed`'s exception finish cannot be written. Reported rather than drafted.
9. **Memory notes named in the brief are not on Nas1** (`pm-plan-id-allocation.md`, `pm-index-needs-currentness-edition.md` under `~/.claude-t3/me/…`). I followed the brief's own rules for ids and the currentness copy (15 files, sha256 match).
10. **Hygiene, no grade effect**: `Plans/Commands_System.md`'s adjudication roster still lists `goal.created` and `goal.updated` as `requires_central_adjudication`; F3-666 is not amended (SP-339 is the adoption point, and F3-666 matches `pm inspect`).
