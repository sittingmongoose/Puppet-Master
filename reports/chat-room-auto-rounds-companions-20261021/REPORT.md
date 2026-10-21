# DL-231 companion implementation

Round 1 follow-up: [REVIEW-R1.md](REVIEW-R1.md) records the four fixes, the authorized DL-231 clarification, index validation with all 15 baseline-bound audit inputs, and the nonblocking landing check. Its paired index result supersedes the input-incomplete pass reported below.

Branch: `plans/chat-room-auto-rounds-companions-20261021`.
Checked source head: `fd812aad57bb1feb4198124bfc467050233c69f2`.
Base: `681ae1578caabf69417f82868dc9222e786b6ddb`.
The branch is pushed to both remotes. This report is a separate documentation-only follow-up.

**Landing-check verdict: exit 2.** The repository comparison reports **zero blocking findings, zero non-stale on-branch findings, no grown buckets and zero infrastructure failures**. The separate final PM7 inventory guard then fails with `Plans inventory changed; regenerate the PM7 pages`. It runs `python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7 --check`. The task explicitly forbids Concepts edits, so that refresh remains for the lead. No guard or baseline was changed to bypass it. Nothing was landed.

## Changed files

| File | What changed and why |
|---|---|
| `Plans/collaborative_workflows_contracts.schema.json` | Add optional boolean `pause_between_rounds`, default false, forbidden on the other three kinds. Add boolean `set_pause_between_rounds`. Narrow Next Round descriptions while retaining its envelopes and IDs. |
| `Plans/collaborative_workflows_contract_fixtures.json` | Add field values, on/off requests and results, legacy omission, both Next Round hosts and a refusal result. Add wrong-kind/type/change and state/other-wait negatives. The pair has 134 positives and 194 negatives. |
| `scripts/pm-new-contracts-verify.py` | Add fixture-only owner-state joins. Next Round requires an explicitly known between-round wait; switch off/absent, active rounds, exhaustion, other waits and unknown position reject with `run_state_invalid`. Switching another kind is rejected. Context adds no persisted or request field. |
| `Plans/UI_Command_Catalog.md` | Correct reconfigure's nonterminal states and narrow Next Round. Admit Cancel while a Chat Room waits. Retire Ask Everyone's producer. Add the setup Draft and runtime switch: census 193 to 195, retaining the retired row. Add UCC-207 and its source-unit registration. |
| `Plans/Commands_System.md` | Narrow the existing Next Round handler and CDRY-022 census note. Round 1 needs no extra command beyond Start/Confirm; automatic later starts mint and dispatch nothing. |
| `Plans/Wiring_Matrix.production.json` | Reconfigure gains both Chat Room hosts, switch acceptance and tests, including existing card add-rounds and waiver producers. Next Round gains exact admission and zero automatic-dispatch requirements. Cancel gains waiting-room acceptance. |
| `Plans/Wiring_Matrix.md` | Add WM-095 for those existing rows, their sources, single actionable host, revision/system entry, boundary and refusal rules. |
| `Plans/Settings_System.md` | Register the false toggle and alias beside rounds. SSYS-028's count becomes fifty-one. State the default snapshot and Save as default boundary. |
| `Plans/settings_inventory.json` | Add `branching.crew.chat-room-pause-between-rounds` beside max rounds with the existing scope, tier and feature conventions. Alias `assistant.multi_agent.chat_room.pause_between_rounds` resolves once. Inventory grows 1,006 to 1,007 entries. |
| `Plans/Contracts_V0.md` | Add CV-364 for the optional field, change variant, retained command identity and static proof boundary. |
| `Plans/Automated_Testing_System.md` | Add ATS-079 and eleven obligation rows covering all CWR-044 criteria, negative paths and races. Native execution remains a future obligation. |
| `Plans/_shards/**` | Regenerate 399 changed paths in the six edited-source groups. No unrelated source group changes. |
| `Plans/.plan_index/**` | Regenerate six outputs. Four new units: UCC-207, WM-095, CV-364 and ATS-079. |
| This report | Record file scope, before/after checks, input restoration and the remaining PM7 dependency. |

`Plans/storage-plan.md` needs no change. A missing `pause_between_rounds` reads false and validates without a rewrite. There is no new family, schema version, writer or migration row.

The supplied owner prose in `Collaborative_Workflows.md`, `assistant-chat-design.md`, `Decision_Log.md` and `00-plans-index.md` was not edited by this task. Spec Lock, `.evidence`, `auto_decisions.jsonl` and Concepts were not edited. The final regeneration followed a rebase onto the newest main above.

## Validator before/after

Before is the supplied prose branch at `8c2e0b003c`. Final results use the companion content and restored authentic ignored verification inputs. Counts are complete standalone reports or the identical standalone commands invoked by the complete aggregate.

| Check | Before | After |
|---|---|---|
| `pm-plans-verify.py validate-new-contracts` | Pass, 0 failures | Pass, 0 |
| `pm-plans-verify.py validate-wiring-matrix` | Pass, 0 | Pass, 0 |
| `pm-plans-verify.py validate-ui-command-response` | Pass, 0 | Pass, 0 |
| Settings inventory JSON Schema, duplicate IDs and alias census | Pass; 1,006 IDs | Pass; 1,007 unique IDs, one new alias, false default |
| `pm-plans-verify.py json-syntax` | 16 missing raw-input findings | 17 known findings matching the current baseline after restoring its required symlink; no changed companion JSON fails parsing |
| `pm-plans-verify.py validate-plan-graph` | 127 `artifact_hash_stale` | 526 `artifact_hash_stale` and one obsolete Settings shard reference in existing evidence |
| `pm-plans-verify.py lint-contractrefs` | One missing historical audit input | Pass, 0 after restoring the authentic ignored input |
| `pm-plans-verify.py lint-path-refs` | Pass, 0 | Pass, 0 |
| `pm-plans-verify.py lint-banned-phrases` | Pass, 0 | Pass, 0 |
| `pm-plan-index.py validate` | Pass; 7,175 units | Pass; 7,179 units and 28,639 acceptance units; also passes with restored inputs |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | Independent pre-edit result not captured | Pass; 99 sources, 2,891 shards |
| `git diff --check` | Clean worktree | Pass |

A focused probe used the old schema and semantic function from `8c2e0b003c`. The new boolean field and both switch changes were rejected before and accepted after. A legacy definition without the field passes both. Next Round with the switch false/absent, an active round or exhausted rounds had no semantic rejection before; each now fails with `run_state_invalid`. All 134 positives pass selected-definition and aggregate-root validation. All 194 negatives fail their named shape or semantic condition. Other user waits and unknown wait position are explicitly negative.

The obsolete evidence reference is `Plans/_shards/settings_inventory/127-lines-25128-25138.md`; generation replaces the tail with `127-lines-25128-25165.md`. Its owner is `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`. That protected evidence remains for a separate reseal.

## Full landing check

Command: `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <external-directory>` in this full, non-sparse T3 worktree. It checked source head `fd812aad57` against main `681ae1578c`. All subchecks finished. The baseline is current and its audit inputs match.

| Aggregate | Recorded baseline failures | Current failures |
|---|---:|---:|
| run-gates | 1,486 | 2,598 |
| audit-governance | 1,469 | 2,581 |
| current plan-migration snapshot | 0 | 2,995 |

The repository classifier reports zero blocking items. Every on-branch finding is staleness. The four new non-stale rows outside branch files are the same obsolete Settings shard reference seen in the evidence and graph validators of both aggregates. A local historical audit-status finding is nonblocking. Governance staleness requires a reseal. The independent PM7 freshness guard raises the actual exit to **2** after the JSON report; its result is not included in JSON's `blocking` field. The branch must not be treated as ready to land until that refresh is handled.

Earlier verification exposed two environment prerequisites. The first preflight refused the old baseline during the concurrent reseal; fetching and rebasing onto its landed follow-up resolved that binding. A subsequent full run found only two non-stale branch rows: both copies of a historical audit report missing from the fresh T3 worktree. The runbook in `reports/landing-checks/README.md` documents this exact input issue.

The authentic report was copied as an ignored local regular file from `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-widget-report-input-snapshot-20260921/audit_report.json`, SHA-256 `ef4eeb5f4c13a9baa23ed08f37c04a19c758dedc1dc84508b77169701ed2d294`. Its 13,236 bytes are unchanged. The required ignored `tests/agent_packet_restrictions` symlink now points to the existing Evidence tree. These verification inputs are retained for review and are not committed. No shared checkout operation was used to restore them.

Complete check reports, exports, before/after results and input custody are retained at `/mnt/Cursor/PuppetMaster-Evidence/tests/dl231-companions-20261021/`. Its `manifest.json` SHA-256 is `41f0dab8b49e2aa3abc05d2a08e907985527605c144427653549f8b7077d96ea`.

## Additional findings and open questions

The listed work also needed the fixture semantic gate: the switch and wait position are owner state, so request shape alone cannot prove refusal. The Cancel catalog row also excluded waiting Chat Rooms, contrary to CWR-044; its narrow waiting case and wiring acceptance are fixed. The older reconfigure state contradiction and missing card round-extension/waiver sources are fixed with the new switch.

No owner-prose contradiction or unresolved product question was found. Remaining dependencies are **PM7 concept generation**, prohibited in this task, and the later **governance reseal**. Review and landing belong to the lead. No landing lock was taken, no shared checkout state changed, and the T3 worktree is retained.
