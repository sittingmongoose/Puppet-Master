# Step 9: the Contracts and Run Modes retirement edits for DL-087 and DL-088, 2026-11-04

Branch `plans/ea-dl087-088-retirements-20261104`, made from `main` `be4766513f`. It makes the owner edits that DL-087 and DL-088 (2026-09-25) call for in Contracts and Run Modes: item 3 of "Next, in order" in `step8-9-progress-20260924.md`, "The Contracts retirement edits for DL-087 and DL-088, and the Run Modes clarifying line". It is not landed; the Event Authority lead gives the landing go.

## What the decisions require

- **DL-087** (no option selected; Jared wrote "retire them but register the shared collaborative workflow events, so adding scope to this."): "the Contracts owner removes the six rows from the crew event table, narrows CV-270 to the three crew board families and retires CV-271 (accepted text), and the orchestrator owner adds a pointer from its Crew text to `Plans/Collaborative_Workflows.md`."
- **DL-088** (Approve, option 1): "The Contracts owner removes the two names from the subagent payload text, the lineage envelope sentence and the accepted units CV-116 and CV-266, keeping the rule that `chat.subagent_*` names are legacy aliases; the Run Modes owner adds one clarifying sentence to the crew queue row that says new crew spawn requests queue until a slot is free."

The places come from `step-09-batch2-card-answer-application-20260925.md`, owner follow-up 4 of the first application and 1 of the second, and from section 6 of `step-09-batch2-20260925.md`. That section groups them as item 2, "Contracts retirements": the DL-087 and DL-088 Contracts edits and the DL-088 Run Modes line. The DL-087 orchestrator pointer is in item 3, "Orchestrator", with the DL-084, DL-085 and DL-086 orchestrator edits. This branch makes item 2 only.

## The edits

| Commit | Place (today; September citation) | Change |
|---|---|---|
| `f1e021bc7e` | `Plans/Contracts_V0.md:1471` (was 1469), Tool payloads paragraph | DL-088's rule replaces the sentence that applied the PM lineage envelope to "Producer-specific request/completion names such as `subagent.spawn_requested` and `subagent.spawn_completed`". No request to start a subagent is recorded apart from the child it creates. A start that has to wait is a child in the `queued` state, and a start refused for budget before any child exists keeps its existing outcome reason in the orchestrator. |
| `f1e021bc7e` | `Plans/Contracts_V0.md:2990` (was 2983), the lineage envelope sentence | The sentence applying the envelope to the two names is replaced by one citing DL-088. The alias clause "`chat.subagent_*` and `chat.subagent_spawned` are legacy source aliases only." stays, after "Subagent events remain under `subagent.*`". |
| `f1e021bc7e` | CV-116 | The third acceptance criterion and the two tokens are removed. The canonical text adds an "Amended 2026-11-04 (DL-088)" sentence, and the unit cites DL-088 in `source_lineage`, `negative_constraints` and `stale_retired_dispositions`. |
| `f1e021bc7e` | CV-266 | The second criterion, the canonical-text clause and the two tokens are removed. It gains an "Amended 2026-11-04 (DL-088)" sentence and cites DL-088 as CV-116 does. |
| `321b66b153` | `Plans/Run_Modes.md:195` (unmoved), the `max_concurrent_crews_per_platform` row | The row keeps "New crew spawn requests queue until a slot is free." and gains "A waiting start is a child in the `queued` state, not a separate request record (DL-088)." |
| `d88350bfdd` | `Plans/Contracts_V0.md`, the crew event table: the six deleted rows were at `3070-3073` and `3077-3078` on `main` `be4766513f` (`3061-3064`, `3068-3069` in the September 2026-09-25 records); at this branch the remaining table is `3070-3076` (header, the three crew board rows at `3072-3074`, the closing ContractRef at `3076`) and the DL-087 amendment paragraph is `3058` | The six crew lifecycle rows are removed. The three crew board rows and the closing storage-plan/Run Modes ContractRef stay. |
| `d88350bfdd` | before the crew lineage sentence | A new "Amended 2026-11-04 (DL-087)" paragraph names the six retired events. It gives DL-087's rule: one Crew history, shared with all collaborative workflows (`Plans/Collaborative_Workflows.md`), and no second lifecycle history. Until the shared events are registered (DL-090), a Crew run has no registered record of its own start, finish or cancellation, only its members' child-run histories (DL-084) and the board (DL-085). The board events are not part of the retirement. |
| `d88350bfdd` | the crew lineage sentence, CV-270 | "For every `crew.*` event below" becomes "For every `crew.*` board event below". CV-270's canonical text and criteria name the three crew board events, with an "Amended 2026-11-04 (DL-087)" sentence. |
| `d88350bfdd` | CV-271 | Retired, in the form of SP-228 and F3-649. Its status is `retired`. Its canonical text says DL-087 retires it and that it remains only for historical references. Its criteria are retirement criteria, and a negative constraint forbids reintroducing the six events. Its compile hint is `retired_crew_lifecycle_event_table` with `create_nodeseeds: false`. Its tokens and ContractRef token are kept. |

Every amended unit cites its decision in `source_lineage` and `stale_retired_dispositions`, as CV-323 cites DL-180 and DL-188. No `depends_on` or `unblocks` edge changes. Retired units keep their edges on `main` (SP-228, DL-185 to F3-649).

**Judgment calls, for the lead.**
1. **The payload and envelope sentences.** These are replaced, not just stripped of the two names. Without the names, "Producer-specific request/completion names ... preserve the same PM lineage envelope" would still allow such names, and DL-088 says none are recorded. Each replacement states DL-088's rule in the decision's own words and cites it.
2. **CV-116's canonical text.** The application note lists only CV-116's third criterion and two tokens. But the canonical text's clause "request/completion variants preserve the same PM lineage envelope" paraphrases the two names, so it is replaced as well.
3. **The six crew names stay only as retirement records.** They remain in Contracts in the DL-087 amendment paragraph (`:3058`), in retired CV-271's canonical text and in its preserved-token list, like `terminal.workgroup_moved` under DL-180. DL-087 removes the rows, not every mention. DL-088's two names are gone from Contracts, as DL-088 says ("removes the two names").
4. **Run Modes.** The clarifying sentence is the one DL-088 asks for. RM-015 and its token "queue until a slot is free" are unchanged.

## Not done here

- **The DL-087 orchestrator pointer** from the Crew text to `Plans/Collaborative_Workflows.md`: DL-087 names it, and the batch 2 report files it under the Orchestrator follow-ups. It was at `Plans/orchestrator-subagent-integration.md:4200-4202` and `4258-4260` in September. The same two "Crew lifecycle, cleanup, and GUI routing" passages are now at lines 4365-4367 and 4423-4425.
- **The eight J248 rows.** DL-087's six crew rows and DL-088's two spawn rows, under `Plans/.audits/event-authority-2026-08-12/`, still say their Contracts owner edits are pending. They also cite Contracts lines that have moved or been removed. A later ledger application can note that the edits landed. Open question 8 of the Step 9 procedure record (an exclusion resting on a pending owner edit) is answered for these eight rows once this branch lands.
- **Other mentions.** The six crew names and two spawn names now appear only in `Plans/Contracts_V0.md` (the amendment paragraph and CV-271) and `Plans/Decision_Log.md`, apart from a historical work-item ledger (`Plans/ledgers/work_items/w-20260329-235630/working_ledger.md`) and earlier migration snapshots, which are left alone.

## Checks

- **Derived files.** Regenerated after each Plans commit, in a sparse local worktree (`Plans scripts reports tests`) with the currentness edition copied in and checked by SHA-256. Regenerating clean `main` there first changed only `generated_at_utc`.
- **What each commit changed.** Only its own document's shards and `Plans/.plan_index` changed:
  - `f1e021bc7e`: contracts_v0 shards; acceptance units went from 29,932 to 29,930, and no readiness row changed.
  - `321b66b153`: run_modes shards. Every Run Modes unit changed only its `source_doc_sha256`. The readiness report gained `event_authority_currentness_source_drift` for `Plans/Run_Modes.md`.
  - `d88350bfdd`: contracts_v0 shards. Accepted units went from 7,204 to 7,203 and retired from 194 to 195. No readiness row changed.
- **Shard check:** pass after each commit (3,092 shards), exit 0.
- **`pm-plan-index.py validate`:** exit 0, top-level `status` `pass`.
- **Unit tests.** These ran in the sparse worktree. Each module has the same failing tests as `main` `be4766513f`:
  - `test_event_authority_holding_bucket`: 2 failures of 34.
  - `test_pm_emit_only_event_boundaries`: 1 failure of 13.
  - `test_pm_pnc019_currentness`: 1 failure of 9, where the drift list grows from 22 to 23 rows with `Plans/Run_Modes.md`.
  - `test_pm_coordination_events`: 14 failures of 50.
- **Dry landing check** (`pm-landing-check.py --base origin/main --json`, in a full checkout at `d88350bfdd`): **exit 1, with 0 blocking items** and no timed-out subcheck. The baseline `5aa12e1dd0` is current. All 2,994 new rows are staleness, and none is pre-existing on the branch's files:
  - **`plan-migration-validate`**, 0 to 2,986 rows. All of them compare the current snapshot `pds-20261104-004` with the two edited documents: 2,954 span-metadata rows, 8 span-hash rows, and the manifest, count and pointer rows.
  - **In each aggregate**, four buckets grow, of three error kinds:
    - `event_authority_currentness_source_drift`, from 22 to 23, for `Plans/Run_Modes.md`. The Contracts drift row is already on `main`.
    - run-002 `stale_batch_report_sha256_after`, from 58 to 61.
    - `artifact_hash_stale`, in two buckets (the plan-sharding evidence bundle and the plan-graph artifact hashes), each from 1,436 to 1,467: the two documents and their changed shard files.
  - **Spec Lock** stays at 9 failures. The Contracts `stale_hash` row is already on `main`.
  - **`audit_closure`**, compared by total only, is unchanged at 201.

The outputs are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/B1/landing-check-branch2/`: `landing-check.json` SHA-256 `c2f4d3e67b39ec81f758bd2ccbfc238699bc0497e4f088f1e3161ecc1e75d01d` (source head `d88350bfdd`, 0 blocking, no infrastructure timeouts) and `exit_code.txt` (1) SHA-256 `4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865`. An independent rerun by the Sol review is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/B1-br2-sol/landing-check.json`, SHA-256 `f4157a280337d44843937dd04032a4bfdff0129902259df71fe71dbd90047c9d`.

## Reseal request

`Plans/Contracts_V0.md` (which has a Spec Lock entry) and `Plans/Run_Modes.md` (which has none) are edited. For the reseal agent:
- the Contracts Spec Lock entry;
- the plan-sharding bundle rows for both documents and their shards;
- a currentness edition that covers both, which clears the Run Modes drift row;
- run-002 `refresh-batch-hashes` and `refresh-final-summary`;
- the readiness gate report.

After the landing, the landing agent runs `snapshot-current` and `--record-baseline`.

## Review round 1 (Sol 6.1 max, LANDING_READY_WITH_NOTES)

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/B1-br2-sol/REVIEW.md`. Fixes by the stream E lead, report text only; no owner text changed.
1. **Should fix, fixed.** The crew-table locator now gives the deleted rows' coordinates with their base (`main` `be4766513f`, and the September records) and the current ones at this branch (`Contracts_V0.md:3058`, `:3070-3076`). "Stay once" is replaced: the six names remain as retirement records in the DL-087 amendment paragraph, retired CV-271's canonical text and its preserved-token list. The landing-check bullet says four buckets of three error kinds, and names both artifact-hash buckets.
2. **Should fix, fixed.** The landing-check evidence is cited by path and SHA-256, plus the review's independent rerun.
3. **Note.** DL-087's orchestrator pointer and the eight J248 disposition records are follow-ups outside this branch: the pointer is on `origin/plans/ea-w2-orchestrator-20261104` (lane DO); the eight records are updated at integration after the owner landing. This branch completes item 2 of the September section 6, not every DL-087 obligation.
4. **Note.** Regeneration reproduces every shard and JSONL byte; the four `.plan_index` JSON files differ only in `generated_at_utc`, which the validator ignores by design.
5. **Note.** Reseal request unchanged: Contracts (with its Spec Lock entry), Run Modes, their shard evidence and currentness, run-002 batch hashes and final summary, and the readiness report. The lander refreshes the migration snapshot and baseline after landing.
