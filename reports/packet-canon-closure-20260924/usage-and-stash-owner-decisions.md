# Usage and stash owner decisions — 2026-09-25

Status: accepted owner prose integrated on the repair branch; typed companions and native implementation remain separate. This step is not main landing, governance reseal, or whole-packet closure.

## Exact scope

DL-098 is now carried by the Usage Ledger owner prose and UF-010, UF-047 and UF-070: only the seven approved recorded filter axes, conjunctive filters, literal case-insensitive label/identifier search excluding prompts and secrets, time/tokens/cost ordering, newest-first initial order, unknowns last and stable identity ties. Selected export means precisely the selected records; filtered export means all matching records, not the visible viewport. Legacy/quota identities are not invented. The current typed query carrier still needs its separate companion work.

DL-096 is now carried by SCS-003 and new SCS-024: the original stash-apply request explicitly chooses file changes only or file changes plus saved staged selections; neither is silently assumed. Apply retains the stash and remains distinct from pop/drop. Immutable selection, qualified preview, FileSafe and Git ownership remain. The proposal's unapproved no-preselection and prescribed unset-error policy were removed after independent review. Exact unset-state mapping and the selected-request/result/preview companion remain follow-up work, not missing native implementation alone.

No new product choice, command, event, handler availability, storage family, WorkNode or NodeSeed is admitted. Newer protected owner designs and frozen cards are unchanged.

## Evidence and final gate

All proposal paths below are under `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/jobs/` and remain outside the product repository. External workers used the requested native platform Goals; GPT-6 Sol high independently reviewed their outputs; root checked the approved diffs, preimages and exact post-application hashes.

| Evidence | Relative external path | SHA-256 |
| --- | --- | --- |
| Usage independent PASS | `usage-ledger/REVIEW.md` | `5d171754ed296a220bc444d4ca1ed28e8c34eb02fdad103cdd139e646ff7e868` |
| Usage patch | `usage-ledger/changes.patch` | `c19ed4d110ab356b4e4dd7a603251de23e279bfb0dd865c45052d87c59d641c4` |
| Stash corrected independent PASS | `stash-apply-correction-01/REVIEW.md` | `07eb06c76494b0e7f36d44e921f5516ab7a243b3c17059adf81acd640e618216` |
| Stash corrected patch | `stash-apply-correction-01/changes.patch` | `daf0c0854eaf4f654f23847ff0418f9806b9712917cb93def8e549317f79a409` |
| Stash native completed run | `stash-apply-correction-01/runtime/output/run.json` | `88b63f361a5587e3f8d30ccc7b0bd9034bf140bfac31aac0e09746455b2cd357` |

Root preimages matched the frozen branch: Usage `3a0d4e31f6e476718bd30ad18eba5d513cbc4308aae524ac250d853abc8e38cd`; Source Control `6b753e3b403ecce0c65314dc5379141c0a2644c124d6cbb5db6e9a3ad60fa188`. Post-application bytes exactly match accepted candidates: Usage `2b6357e8500bee90b9e4fc8aa31555e1b0f488e3f8ad2a67d72e7ce2328d7421`; Source Control `6b0fd179606c263a6ef0d010b88c04fbf680b93cddbe215d8403917b0cd46216`.

OMP's corrected stash Goal completed on `opencode-go/deepseek-v4.1-flash`, max, without fallback. Muse Code used `muse-spark-1.3-contributor`, max, in session `01a0d923-27f6-7cc1-8677-865de0dae1c5`, Goal `goal-afe83cd5-8fec-4459-9049-cc96d012c497`. Its recovered model turn durably completed with the reviewed Usage result, but the Goal remained active after a projection fault; same-session native completion recovery is separate and this report does not falsely claim that Goal terminal receipt.

## Verification

- `git diff --check` passes.
- Shard generation and check pass: 99 documents, 2,760 shards. Only the Usage shard directory changed; Source Control is not a separately changed shard output in this configuration.
- Index generation passes: 6,740 PlanUnits and 26,508 acceptance units. Exactly SCS-024 is added, no IDs are removed, and changed existing PlanUnit rows belong only to Source Control and Usage. Runtime certification remains incomplete; no readiness unlock is claimed.
- Completed index validation still reports the same 34 pre-existing findings recorded by the preceding answer step: 20 invalid removal-ledger records on unchanged files, plus 14 newer-main IDs absent from this unreconciled branch (ATS-058, CV-353, DL-084–093, OSI-438 and SP-320). No generated-index staleness or new owner finding appears. Preserve those newer-main units during rebase; do not invent removal decisions. Aggregate gates and the locked, fresh-main landing comparison are not replaced by these scoped checks.

The earlier Settings hash-delta landing hold remains separate. No Spec Lock, source-hash binding, seal evidence, baseline or migration snapshot is refreshed in this step.
