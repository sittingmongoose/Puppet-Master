# DL-231 companion review round 1 fixes

Branch: `plans/chat-room-auto-rounds-companions-20261021`.
Reviewed input: `38c3d97530310531f60cac70d29c74e5bdf1a9b8`.
Checked source commit: `b1ee03d8d9cf729e6c129d23da3f7a4c7992a4a9`.
Base: `681ae1578caabf69417f82868dc9222e786b6ddb` (`origin/main`).

All four findings are accepted. No disagreements or open product questions.
The supplied full review was read and its SHA-256 matched `0a59669cd08c47c22f1a59857be17e6ec550e7aea24f76a8af8d9b8ab6d34407`.

| Finding | Fix and location |
|---|---|
| FIX 1 | `Plans/Collaborative_Workflows.md:190`, `:3486`, `:3530`: completing a round creates no pacing wait. Permission, ordinary needs-you and every later Grill Me session's current Confirm still gate only dependent work. Eligible rounds continue automatically after the gate clears. Exhaustion/stop waits and explicit ending remain. |
| FIX 1, attention | `Plans/assistant-chat-design.md:26732`: every session's Confirm is `yourmove`; questions, approvals and failures remain `needs`. An interval between numbered rounds is `live` only when no existing user gate or manual pause requires attention. |
| FIX 1, decision record | `Plans/Decision_Log.md:16905`, `:16937`: the separately authorized DL-231 clarification retains all gates and widens Confirm coverage to mid-run sessions. No other entry or metadata changed. |
| FIX 1, obligations | `Plans/Automated_Testing_System.md:6721`: qualify automatic progression; add mid-run/later Confirm and ordinary questions and permissions with Grill Me off. ATS-079 tracks all thirteen CWR-044 criteria. |
| FIX 1, fixtures | `Plans/collaborative_workflows_contract_fixtures.json:3558`, `:5539`: add two ParticipantActivity shapes and two Next Round refusal cases. Every previous fixture, including the other-user-wait refusal, is unchanged. There are now 136 positives and 196 negatives. Shapes and refusal joins do not prove native gate sequencing or dock rendering. |
| FIX 2 | `Plans/.plan_index/node_readiness_report.json:44036`: regenerate with the authentic currentness inputs available. The receipt is found; unavailable-audit/missing-source-path diagnostics are gone. Truthful stale-hash and source-drift disclosures remain, and runtime certification remains blocked. |
| LOW 1 | `Plans/collaborative_workflows_contracts.schema.json:958`: the sheet snapshots the Settings default at open; commit writes the current draft choice. |
| LOW 2 | `Plans/00-plans-index.md:15`: setup is Draft; only the running card/run view changes the switch through reconfigure. The summary also preserves existing gates and attention tones. |

The seven source files above are the only authored Plans files changed in this pass.
Generation also updates all six index files (`plan_units.jsonl`, `acceptance_units.jsonl`, `doc_cards.json`, `dependencies.json`, `coverage_report.json`, `node_readiness_report.json`) and 175 shard paths in four groups: `00-plans-index`, `assistant-chat-design`, `automated_testing_system`, `decision_log`. Every changed shard group belongs to an edited document. Generation reports 99 sources and 2,891 shard bodies. The index reports 7,179 PlanUnits and 28,643 acceptance units.

`Plans/settings_inventory.json` and `Concepts/**` are unchanged from the pulled PMConcept7 rebuild commit. No further concept rebuild was needed. No Spec Lock, protected evidence, audit input, automatic-decision registry or migration snapshot was edited. No landing, lock or shared-checkout operation ran. The T3 worktree is retained.

| Check | Before at 38c3d97530 | After at b1ee03d8d9 |
|---|---|---|
| `pm-plan-index.py validate`, same authentic inputs | Exit 1: one `stale_generated_index_artifact`; exact hashes match Astra's finding | Exit 0: zero failures |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | Pass, 99 sources / 2,891 shards | Pass, same counts |
| `pm-plans-verify.py validate-new-contracts` | Pass | Pass; 136 positives / 196 negatives for collaboration |
| `validate-wiring-matrix`, `validate-ui-command-response` | Both pass | Both pass |
| Settings JSON Schema, ID/alias census | Pass; 1,007 unique IDs, one pause alias, false default | Pass; unchanged |
| `lint-contractrefs`, `lint-path-refs`, `lint-banned-phrases` | All pass | All pass |
| `json-syntax` | 17 known raw-evidence findings | Same 17 decoded rows |
| `validate-plan-graph` | 527: 526 stale artifact hashes, one obsolete Settings-shard reference in protected evidence | Same counts and error kinds |
| `build.py --publish-pm7 --check` | Pass | Pass |
| `git diff --check` | Clean | Pass |
| Full landing check | Astra's supplied review: exit 1, zero blocking items | Exit 1; zero blocking items, non-stale on-branch findings, grown buckets or infrastructure failures |

Before/after commands ran in this full, non-sparse Git worktree. The initial report's index pass lacked the currentness inputs; the paired validation above supersedes that result.

The ignored directory `Plans/.audits/event-authority-2026-08-13-currentness` links to `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261021/prepared-currentness/`. Every one of the baseline's 15 bound files was hashed before linking; all matched. The landing check also verifies the complete binding before and after its checks. The receipt SHA-256 is `75f0a3f2a245e61e102efb27fd1da7bbd732b01952ea47b162c9e81fd35d6b78`. No input was synthesized or refreshed. The authentic widget-followup report and ignored raw-evidence link retained from the earlier pass remain available for verification.

```bash
python3 scripts/pm-landing-check.py --base origin/main \
  --readiness-audit-root /mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261021/prepared-currentness \
  --json --keep-check-reports <external-evidence>/full/check-reports
```

The final process exit is **1**, including the successful PMConcept7 guard. All 3,161 on-branch records are staleness. The baseline is current and every audit input matches. Raw totals are 2,598 run-gates findings versus baseline 1,486; 2,581 audit-governance findings versus 1,469; and 2,995 current-snapshot findings versus 0. All three checks completed without timeout.

Four new non-stale records outside the branch refer to the same obsolete `Plans/_shards/settings_inventory/127-lines-25128-25138.md` path in protected `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`. That evidence reference and stale governance hashes need the separately assigned reseal. Missing historical final-report inputs also retain the disclosed nonblocking audit-status-index staleness. No protected repair was attempted.

The full check ran at the source commit above. The following report-only commit does not change the validated Plans or concept bytes.

Full before/after outputs, complete landing exports, source hashes and input bindings are retained at `/mnt/Cursor/PuppetMaster-Evidence/tests/dl231-companions-review-r1-20261021-b1ee03d8d9/`. The bundle has 94 members. Manifest: `/mnt/Cursor/PuppetMaster-Evidence/tests/dl231-companions-review-r1-20261021-b1ee03d8d9/manifest.json`, SHA-256 `114436a23b6670ba52b5dad539e393c92308d2ce1b119d9e1d4395e6417e565b`. Temporary duplicate scratch files and the owned mailbox waiter are removed at handoff; the required ignored verification inputs remain available.
