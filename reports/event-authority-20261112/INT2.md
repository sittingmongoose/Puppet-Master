# INT2 — batch-2 Event Authority integration
**Restart handoff, 2026-11-12 16:0xZ:** 313 technical registry diagnostics are repaired on owning lanes’ behalf; the unchanged checker now reports only 86 pending-retention diagnostics. Source is pushed through `7a60dd72b9`. The full DT checker, DCH’s 44,458 static checks, DCH Stop/tables, the 17-family DCH preservation probe and the DG6A acknowledged regression pass. Current full validation is still running; no new full-gate pass is claimed. `int2-registry-consumers` and the sequential `int2-landing-after-registry` are persistent systemd long-jobs. Exact commands, exits so far, output paths and open items: `INT2-restart-handoff.json`. The 86-row facts table is in `drafts/INT2/RETENTION-86.md`; no policy is chosen. Resume from `drafts/INT2/RESUME.md` after the 17:00Z T3 update. The earlier packet below describes the completed `8d72011611` stage and its historical 399/800 counts; the lead superseded its carry of the 313 technical findings.


**Review packet blocked at the dry landing gate.** The remaining inherited registry diagnostics are carried without credit under the lead’s decision; no exit-0 claim is made.

Prepared branch: `plans/ea-batch2-int-20261112`, full worktree `/home/sittingmongoose/pm-worktrees/int2` (retained). Initial main base: `e9c6a46389`. Resume head: `ca3c431c81`. Main updates integrated: `b5bd6cafd1`, `f12638df47`, `52aa6b4f7e`, then `77e87db4d8` (audit closure only) and `2880dfc517` (snapshot, audit status and baseline follow-up). The final evidence identifies the exact checked tree and code head. No main push, landing lock, reseal or admission was performed.

The open Event Authority obligations originated in the August census of 252 quarantined rows. The forged answers were voided on August 12. Jared’s September 10–25 rulings set the process and decided about sixty rows and some retention; they did not decide the remaining 236 rows described in that historical census. This packet’s prepared-family readiness table is a separate integration inventory, with no admission implied.

## Merge sequence

Every merge uses `--no-ff`. The original fifteen lane remote heads were checked before merging. The lead explicitly approved replacing the earlier DF head with `59f36b0a2b`; DCO remains `be7474cb7f`.

| Input | Approved head | Integration merge |
|---|---|---|
| NUMRULE / date-time | `58c2816ff3` | `c5eb892ebb` |
| Guard tool | `004bdedd63` | `4fc207ea72` |
| Ledger compile witness | `86de8bb6d0` | `cd7560f4a9` |
| Landing checker | `ec84baffd0` | `0539485278` |
| Deck-3 answers | `ab613b2c3d` | `a961e4d0e7` |
| Deck-3 retention | `322a63944d` | `79e8d68d56` |
| CA-SEAL2 | `d43056709f` | `a14445ab0d` |
| DO | `525de6c2cd` | `1e6871f5ae` |
| DG6B | `ea11e51a21` | `3276ac1646` |
| DDBG | `fd5710a1d0` | `a87be8871a` |
| DC | `58a544186c` | `c8b7b752c9` |
| DT | `bce5208116` | `8046c2ef29` |
| DCH | `81aff2aa2a` | `db0a8828f4` |
| DX | `d7f4bddfc7` | `f4f31dd3f2` |
| DMEM | `b429745ee3` | `3b75e50eb8` |
| DS15 | `23b037b040` | `381b40da1a` |
| DG6A | `198ceb40d8` | `b85fa6ff62` |
| DCN | `913318b294` | `f5c0c40d98` |
| DFM | `3588540691` | `9782a33143` |
| DM | `4cb6c1e44b` | `ac8fea2b5c` |
| DS | `32c260c53d` | `a1da3279da` |
| DR | `6c14c42433` | `3e43e5eabd` |
| DCW | `5ba43b5701` | `af3fb090c6` |
| DF | `59f36b0a2b` | `eecf4a5761` |
| DCO | `be7474cb7f` | `2a294a6897` |
| Gated NUMRULE nested binding | `f304bfaf64` | `eb9618b2cf` |

Main update merges: `8a5f4517d4` (b5bd6cafd1), `5fba5ed7e1` (f12638df47), `38deeed3b3` (52aa6b4f7e), `ef93bcc5a5` (77e87db4d8), `7b51beeb46` (2880dfc517). The deck R2-01 sentence is `b0a4036923`. Initial census, CV-366 and Q5 repairs are `bf749785a3`, `1ad380249e` and `bf2a7b291a`.

CA-SEAL2 already contains `17c842445a`; no separate merge of that branch was needed. Its 19 commits beyond `d67201e885` carry FIX1–FIX8: independent SHA-pair parsing, unchanged legacy DL-077 parity, parser-class refusals, exact numeric steps, validator byte-chain integrity, receipt-anchor binding and strict DL-412 bridge parsing, plus specifications, reports, amendment and receipt updates.

## Conflict rules and application record

Derived conflicts were resolved by taking one complete side, then regenerating. Initial tools/decks had 822 derived conflicts; the fifteen lanes had 10,549. The final main/DCW/DF/DCO merges added 245/927/214/223: **12,980 derived path conflicts** in total. Owner append conflicts keep main first, then lanes in merge order. The original 48 owner-file conflicts plus DCW four and DF three total **55**. Registry rows merge by key; the only conflicting umbrella shape received the lead's explicit union decision. Census conflicts retain a side until one merged-tree re-pin. The source record below gives every logged path, rule and result.

The DCW umbrella `github_bundle_note_preview_browser_families.key_shape` is exactly:

```text
gha_panel_state.v1:{project_id} | bundle_registry.v1:{project_id}:{bundle_id} | note_record.v1:{bundle_id}:{note_id} | composer_prep_state.v1:{thread_id} | browser_session_state.v1:{project_id}:{browser_session_id} | browser_profile_state.v1:{project_id}:{profile_scope}
```

Both extractions remain: DS15's `ds15_preview_subject_ui_state` and DCW's `revision_run`. No row is discarded or duplicated.

`pm_coordination_numbers.py` is DCO's exact copy. The events union preserves DCO's timestamp, guard-table and CV-1100 functions and DO's BOARD constants, `board_member_definition_failures` and `board_member_failures`. The compositions add board payload/event/registry members, with separately validated board definitions excluded from agent-only isolation. The union builder asserts unrelated DCO function bodies and DO board helpers remain exact.

The two DS/DCN excluded-row unions preserve both rationales and citation sets, one disposition and the DS quality note. The ledger preserves both additions and its original mixed endings: 525 CRLF lines, LF-only lines 38/39/106. Their application record follows (each lane's after-hash is the input before-hash).

## Integration repairs

- **Shared frozen schemas:** DCW's annotations changed EventRecord and append-receipt bytes and broke frozen custody. The lead approved restoring both to gated/main bytes while keeping DCW's in-memory `current_schema()` annotations. EventRecord is `bda87b247d841e058758136731734e515ae947f2261b5f90370015603d3bd353`; append receipt is `2f41d829ac0697998a9774267d44ccb10673df6b6ec26c8a0bbd5f552abf2cf3`. Custody manifests match without restamping.
- **Index checkpoint:** DCW's analogous shared-file annotations staled CV-366's resource pin and browser checkpoint materialization. Restored exact gated/main bytes `f15e781edefe30694457361e145c44b5868a57d1e9c069a5b47a059395d577af` (before `779fe2b2434b3d565db71764602ce2262999de5f0cbc23dd2abbe84a4ec4ae9b`). DCW's normalized runtime validation schema is identical apart from root `$comment`; validation digest `47b27fa88196600140f0afadb4071a7cb73129ee3789f1fe7a087afc290004fc`. Both graph consumers, all eight DCW families, 3,040 DCW number cases and the census tests pass after restoration.
- **DO V2 graph:** its workflow resource pin moved from `79275341460c3779f5f82bf3063b1c433d64b7db34a007d09e02377040436ea4` to `2cf0d5972765362907d6d4eb05eb7bc0f06cdf5e15d6a89e777f38f4b7ebab82`. The lane's semantic hash function produces graph hash `afc924bea14ef8aee759f25030a85cb85899b302c7d90b50a367bbd2f792e0df`. The actual successor consumer changes from `successor_resource_selection` to `[]`.
- **CV-366 graph:** kept main's resource [4] and DS's [2], recomputed semantic graph hash and repaired the workflow pin in `1ad380249e`. Restoring the Index checkpoint clears its remaining source hash refusal; `graph_failures(Corpus(root))` returns `[]`.
- **Citations:** `bf2a7b291a` changes only line references, verified by quoted content. AMS-141: 2787→2799 twice, 412→413, UI catalog 8857→8860. UCC-230: 13084→13087, 14068→14071 twice, 21889→21892, 21890→21893, 21892→21895 twice. The final payload-definition check exits 0. The lead should relay this application to pm-closure-lead.
- **DG6A grade citations:** `f9a49734f1` checks all 475 quoted references against the lane tree and merged source; 275 line spans move. Quotes, grades, outcomes, findings and dispositions are unchanged. The seven original regression commands and standalone audit failed only their positive citation audit. All eight full replays pass, with separate output paths preserving the original failures.
- **DFM aggregate registry incompatibility:** all twelve complete family commands exit 1 at the aggregate registry gate after the family loops; the B4 regression refuses its positive control before running the mutation. Each emits the same 399 diagnostic records, all reproduced on exact contributing lane trees. DFM’s own lane reported exit 0. No complete DFM checker or B4 pass is credited, and the shared gate is neither filtered nor weakened. The separate retained-dispatch probe and unchanged manifests address custody only. The batch retains these registry/retention/schema obligations for review.
- **DCO timestamp census:** the combined schema has five DO board date-time nodes in addition to DCO’s fifteen. The original coordination command and one of 57 unit tests fail only this census. The four-line repair in `0fea76cc68` runs after the 85 original checks: skip only exact `BOARD_MEMBERS` in that census, while the DO member-copy validator and board consumer still run. Runtime guard predicates are unchanged; unknown definitions and missing owned timestamp fields still fail. Four boundary probes, the full coordination consumer, all 57 unit tests and the 14-table/119-row guard sweep pass.
- **Registry byte rendering:** the shared-runtime byte-render test detects two literal Unicode characters re-escaped by JSON merging (a person’s apostrophe and the Index-checkpoint title’s em dash). The two-line repair preserves every parsed JSON value and is applied after the consumer run. Regeneration passes; the materializer byte check passes and the 36-test shared-runtime replay has only its two inherited failures, carried uncredited. The 399 diagnostic and pending-retention refusals remain visible.
- **T198 registry pointers:** six DT inventory pointers moved by five array positions after DCW's rows. Their prior node hashes were verified against `ca3c431c81`, then pointers and citations relocated by `family_id`, followed by the tool's own projection and classification. `dt_usage_event_source` 452→457, `dt_usage_event_application_source` 461→466; three nodes each. No role is transferred to a different declaration.

## Repairs from the first dry landing check

The first full dry ran after the gated NUMRULE merge, at `85f80cebf3` against `2880dfc517`, and completed all three subchecks in 2,267.54 seconds with exit 2 and 869 blocking records. No infrastructure result or stale baseline excused a gate. Of these records, 798 are the 399 inherited registry diagnostics printed by both aggregate checks, and two are the resulting registry self-test failures. The remaining 69 records identify the following integration findings.

- **Implementation surfaces:** sixteen metadata entries in ATS-330..333, CV-680..683, F3-700..703 and SP-660..663 used anchor shorthand where the implementation-surface contract requires a concrete path. They now name `Plans/storage-plan.md`, as the existing path registry directs. All unit identities, dependencies and prose remain unchanged. The actual path-reference linter passes.
- **Canonical envelope joins:** eighteen runtime-artifact producer clauses now say “canonical CV-317 envelope project_id” where they previously said “EventRecord 2.0.0 project_id”. This makes their reference to the shared envelope owner explicit. Payload schemas, field joins, scope, identity, first-receipt and append behavior are unchanged. No local envelope is introduced and no legacy or non-normative waiver marker is added. The actual consumer-definition scan reports zero findings.
- **Large-number JSON fixture:** Python’s default 4,300-digit parser limit refused the committed, intentional 4,400-digit Card-2 witness before a semantic validator could inspect it. The rerun uses `PYTHONINTMAXSTRDIGITS=0`; the fixture and every gate predicate remain unchanged. Both the real JSON-syntax gate and the usage-contract drift gate pass under this environment. This is a parser configuration, not an accepted numeric value or a filtered diagnostic.

All five source documents retain their line counts. Shards and the PlanUnit index are regenerated. DG6A’s 475 quote references still match their current spans. DR’s 876 exact quotes are located in their current units, including 478 historical line spans mapped in the companion evidence; its assessed historical tree and all self-grade statuses/findings remain unchanged. Final targeted replays and T198 receipts are recorded below.


| Lane | Path | Rule | Result |
|---|---|---|---|
| DO | Plans/_shards/**, Plans/.plan_index/** | derived | 859 conflicted paths took our side; regenerated after all merges |
| DO | Plans/Contracts_V0.md | append/append | 1 hunk, empty base: main CV-369 (DL-471) first, then DO CV-740 |
| DG6B | Plans/_shards/**, Plans/.plan_index/** | derived | 910 conflicted paths took our side; regenerated after all merges |
| DG6B | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DG6B | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DG6B | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DG6B | Plans/storage_value_registry.json | json-by-key | 3-way by key: +19 families, +19 storage_profile.family_profiles (lane), +1 family/+6 policies (main side); no key changed on both sides; ensure_ascii kept as main |
| DDBG | Plans/_shards/**, Plans/.plan_index/** | derived | 295 conflicted paths took our side; regenerated after all merges |
| DDBG | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DC | Plans/_shards/**, Plans/.plan_index/** | derived | 886 conflicted paths took our side; regenerated after all merges |
| DC | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DC | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DC | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DC | Plans/storage_value_registry.json | json-by-key | 3-way by key:  critical_family_ids: ours=16 theirs=16 merged=16; mvp_required_family_ids: ours=47 theirs=47 merged=47; retention_policies: ours=41 theirs=35 merged=41; contract_family_dispositions: ours=106 theirs=106 merged=106; families: ours=364 theirs=353 merged=373; |
| DC | scripts/pm-implementation-readiness.py | census-pin | 3 hunks (family count, materialized, tier counts): kept the current side; re-pinned once from the merged registry after all merges |
| DT | Plans/_shards/**, Plans/.plan_index/** | derived | 930 conflicted paths took our side; regenerated after all merges |
| DT | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DT | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DT | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DT | Plans/storage_value_registry.json | json-by-key | 3-way by key:  critical_family_ids: ours=16 theirs=16 merged=16; mvp_required_family_ids: ours=47 theirs=47 merged=47; retention_policies: ours=41 theirs=35 merged=41; contract_family_dispositions: ours=106 theirs=106 merged=106; families: ours=373 theirs=385 merged=414; |
| DCH | Plans/_shards/**, Plans/.plan_index/** | derived | 973 conflicted paths took our side; regenerated after all merges |
| DCH | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCH | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCH | Plans/assistant-chat-design.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCH | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCH | Plans/storage_value_registry.json | json-by-key | 3-way by key:  critical_family_ids: ours=16 theirs=16 merged=16; mvp_required_family_ids: ours=47 theirs=47 merged=47; retention_policies: ours=41 theirs=35 merged=41; contract_family_dispositions: ours=106 theirs=106 merged=106; families: ours=414 theirs=361 merged=431; |
| DX | Plans/_shards/**, Plans/.plan_index/** | derived | 251 conflicted paths took our side; regenerated after all merges |
| DX | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DX | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DX | Plans/Executor_Protocol.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DX | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DMEM | Plans/_shards/**, Plans/.plan_index/** | derived | 890 conflicted paths took our side; regenerated after all merges |
| DMEM | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DMEM | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DMEM | Plans/assistant-memory-subsystem.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DMEM | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DMEM | Plans/storage_value_registry.json | json-by-key | 3-way by key:  critical_family_ids: ours=16 theirs=16 merged=16; mvp_required_family_ids: ours=47 theirs=47 merged=47; retention_policies: ours=41 theirs=35 merged=41; contract_family_dispositions: ours=106 theirs=106 merged=106; families: ours=431 theirs=352 merged=439; |
| DS15 | Plans/_shards/**, Plans/.plan_index/** | derived | 900 conflicted paths took our side; regenerated after all merges |
| DS15 | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DS15 | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DS15 | Plans/Section15_MVP_Promoted_Features_Spec.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DS15 | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DS15 | Plans/storage_value_registry.json | json-by-key | 3-way by key:  critical_family_ids: ours=16 theirs=16 merged=16; mvp_required_family_ids: ours=47 theirs=47 merged=47; retention_policies: ours=41 theirs=35 merged=41; contract_family_dispositions: ours=106 theirs=106 merged=106; families: ours=439 theirs=361 merged=456; |
| DS15 | scripts/pm-implementation-readiness.py | census-pin | 4 hunks (family, policy, status, tier counts): kept the current side; re-pinned once after all merges |
| DS15 | tests/test_pm_onboarding_phases.py | census-pin | 2 hunks (family and materialized counts): kept the current side; re-pinned once after all merges |
| DS15 | tests/test_shared_runtime_storage_contracts.py | census-pin | 2 hunks (family and materialized counts): kept the current side; re-pinned once after all merges |
| DG6A | Plans/_shards/**, Plans/.plan_index/** | derived | 1060 conflicted paths took our side; regenerated after all merges |
| DG6A | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DG6A | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DG6A | Plans/FinalGUISpec.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DG6A | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DG6A | Plans/storage_value_registry.json | json-by-key | 3-way by key:  critical_family_ids: ours=16 theirs=16 merged=16; mvp_required_family_ids: ours=47 theirs=47 merged=47; retention_policies: ours=41 theirs=35 merged=41; contract_family_dispositions: ours=106 theirs=106 merged=106; families: ours=456 theirs=377 merged=489; |
| DCN | Plans/_shards/**, Plans/.plan_index/** | derived | 327 conflicted paths took our side; regenerated after all merges |
| DCN | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCN | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCN | Plans/Section15_MVP_Promoted_Features_Spec.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCN | Plans/UI_Command_Catalog.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCN | Plans/assistant-memory-subsystem.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCN | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DFM | Plans/_shards/**, Plans/.plan_index/** | derived | 861 conflicted paths took our side; regenerated after all merges |
| DFM | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DFM | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DFM | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DFM | Plans/storage_value_registry.json | json-by-key | 3-way by key:  critical_family_ids: ours=16 theirs=16 merged=16; mvp_required_family_ids: ours=47 theirs=47 merged=47; retention_policies: ours=41 theirs=35 merged=41; contract_family_dispositions: ours=106 theirs=106 merged=106; families: ours=489 theirs=346 merged=491; |
| DFM | scripts/pm-implementation-readiness.py | census-pin | 3 hunks: kept the current side; re-pinned once after all merges |
| DM | Plans/_shards/**, Plans/.plan_index/** | derived | 323 conflicted paths took our side; regenerated after all merges |
| DM | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DM | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DM | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DM | Plans/UI_Command_Catalog.md | real (both behaviours kept) | 2 hunks: Gist Review table rows - DCN changed verify/edit/pin/discard (DL-407), DM changed toggle_auto_save_unverified (DL-408), rows disjoint, kept each side's row; UCC canonical_text - both added one sentence to the base text, kept DCN's then DM's, neither reworded; no cmd.* token added or removed |
| DS | Plans/_shards/**, Plans/.plan_index/** | derived | 826 conflicted paths took our side; regenerated after all merges |
| DS | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DS | Plans/.audits/event-authority-2026-08-12/individual-disposition/rows/ROW_coordination.debug_mirror_exported.json | real (both behaviours kept) | DCN and DS both applied RECLASSIFY_TO_EXCLUDED to this row; kept one disposition, rationale = DCN's sentence + DS's full rationale (both end with the identical "Previous rationale:" base text, kept once), citations unioned (DS's :553 note contains DCN's), DS's added quality note kept; CRLF preserved byte-exact |
| DS | Plans/.audits/event-authority-2026-08-12/individual-disposition/rows/ROW_dashboard.widget_added.json | real (both behaviours kept) | same as above for dashboard.widget_added |
| DS | Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl | real (both behaviours kept) | lines 116/126 (same two rows): same disposition on both sides; notes = base + DCN addition + DS addition; every other line taken from the side that changed it; 525 CRLF + 3 LF-only lines (38, 39, 106) preserved byte-exact |
| DS | tests/test_pm_browser_event_admission.py | real (both behaviours kept) | DCN (6bb2e66a24) and DS (b71af0a1ab) re-froze the upstream40 fingerprint to the same value 2fe49c02...; kept the one code line and both comment blocks |
| DS | Plans/application_workflow_source_graph.json | json-by-key + owner digest | main repinned resource [4] (CV-368), DS repinned resource [2]; kept both pins and recomputed graph_sha256 with pm_projects_refresh_contracts.semantic_hash (graph_failures pass); resource [4] then refreshed for DC's additions after all merges (integration defect, see report) |
| DR | Plans/_shards/**, Plans/.plan_index/** | derived | 258 conflicted paths took our side; regenerated after all merges |
| DR | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DR | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DR | Plans/Runtime_Artifacts_Panel.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DR | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| MAIN-final | Plans/_shards/**, Plans/.plan_index/** | derived | 245 conflicted paths took integration side; regenerate after all merges |
| DCW | Plans/_shards/**, Plans/.plan_index/** | derived | 927 conflicted paths took our side; regenerated after all merges |
| DCW | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCW | Plans/Planning_Wizard.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCW | Plans/assistant-chat-design.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCW | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCW | Plans/storage_value_registry.json | json-by-key + approved union | Lead approved preserving DS15 preview and DCW revision extractions; both keys removed from umbrella row |
| DCW | Plans/event_record.schema.json | approved shared frozen schema restoration | 23b58f6f9c389cd7736b9aa6bc6c477b096e65a0f6e7ed39cd280c345ef8341f -> bda87b247d841e058758136731734e515ae947f2261b5f90370015603d3bd353; no custody restamp; DCW runtime annotations retained |
| DCW | Plans/event_append_receipt_contracts.schema.json | approved shared frozen schema restoration | f18dc2004f141cdc56bcff6e85305a4fc6f6d16b73f0dc6587b7b6d078d1535b -> 2f41d829ac0697998a9774267d44ccb10673df6b6ec26c8a0bbd5f552abf2cf3; no custody restamp; DCW runtime annotations retained |
| MAIN-snapshot | - | clean | 52aa6b4f7e snapshot/baseline follow-up merged without conflicts |
| DF | Plans/_shards/**, Plans/.plan_index/** | derived | 214 conflicted paths took our side; regenerated after all merges |
| DF | Plans/Automated_Testing_System.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DF | Plans/Contracts_V0.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DF | Plans/storage-plan.md | append/append | 1 hunk(s), empty base: main side first, then lane |
| DCO | Plans/_shards/**, Plans/.plan_index/** | derived | 223 conflicted paths took our side; regenerated after all merges |
| DCO | scripts/pm_coordination_numbers.py | DCO exact copy | be7474cb7f copy retained as authorized superset |
| DCO | scripts/pm_coordination_events.py | DO+DCO union | DCO timestamp/guard/number behavior preserved; DO BOARD constants/functions/compositions added; agent isolation excludes separately validated board definitions |

### DS / DCN application hashes

```json
{
  "rows": [
    {
      "path": "Plans/.audits/event-authority-2026-08-12/individual-disposition/rows/ROW_coordination.debug_mirror_exported.json",
      "dcn_after_sha256": "ff13fa80e73702b5ff6fd3f0a9e7f49b54249ed8059173464cfdd572a61a21ad",
      "ds_after_sha256": "9cd55ed65b351dce33277bd76495c2207bcf57e58f32a5891195a0af887e9e20",
      "merged_sha256": "06cabcd81c64073f5d4eec7ade282a411106b1d2352173dfa3a2d0ed714d60cc"
    },
    {
      "path": "Plans/.audits/event-authority-2026-08-12/individual-disposition/rows/ROW_dashboard.widget_added.json",
      "dcn_after_sha256": "b7033d797e39803c9a5b03743f716828fab1f1b4c3a7f939d0e3baf8422f787c",
      "ds_after_sha256": "bbe7ed0147f3b82abc734d3d5ba16ec6f49d1e5e732ba6aff91e6d564066e51f",
      "merged_sha256": "637617d0c0226633e2480dd3eeb0a3b0d2d8b15fce7412151937f1afb85cd160"
    }
  ],
  "ledger": {
    "path": "Plans/.audits/event-authority-2026-08-12/census-adjudication/LEDGER.jsonl",
    "dcn_after_sha256": "439bd6ef2f878b3719fe6a75304d9f0f169eb20a9405daa98625a103ff807c07",
    "ds_after_sha256": "1943bcd1656b18de452c4d79fb70409ad798b2910e1342f6a08d9ec45f432a86",
    "merged_sha256": "b3c838c5168823e2b445414ba6d0fca4793f5377d3bda585e55f7c7d21fcc947",
    "lines": 528,
    "crlf_lines": 525,
    "lf_only_lines": [
      38,
      39,
      106
    ]
  }
}
```

## Integration item checklist

| Item | State | Evidence / remaining work |
|---|---|---|
| Deck 3 R2-01 | Done | b0a4036923 records the independent original first-save time with the entry, so deleting that original cannot stop expiry. |
| Shared units and new ids | Done | 8,149 unique ids. CV-1100, CV-1101, SP-1100 and SP-1101 each occur once and are byte-identical to 58c2816ff3. |
| Registry and census | Done | 496 families, 41 policies: 465 materialized, 30 deferred, 1 alias; 79 Tier 0, 407 later, 10 migration. Main 344 plus 152 added rows; DCW adds the final five. DMEM eight deferred; DG6A concern_record becomes materialized. |
| DCW umbrella extraction | Done | Lead-approved key_shape removes both preview and revision keys; dedicated DS15 preview and DCW revision_run rows remain. Registry JSON and both consumers pass. |
| DG6A removed safe caps | Done | The removed 2^53-1 caps remain removed; revisions use the SP-1100 u64 domain. No other merged copy restores the old caps. |
| T198 initial classifications | Done | DT thirteen provider-observation nodes use owner_schema / other_owner_observation. DX three data containers and DCN three data containers are content-pinned data exclusions. |
| T198 final refresh | Done | The final projection changes no nodes or classifications. It renews 169 container pins and retains 659 exclusions. Scope-all passes 13,626 cases and 1,276 owner flags; inventory passes with 254 nodes; the actual datetime validator passes. All twenty targeted phases pass. |
| T198 approved supplements | Done | The 35 CV-1101 line pins move by twelve lines, with identical statements. Eight node controls preserve the existing 133. The gated nested-binding fix resolves the six original DCH construction failures; all 141 Storage controls and both v3 nodes pass. |
| T198 earlier roles decision A | Done | One value_schema_sha256 pin renewed; same reviewed other-owner classification and 653/653 timestamp battery evidence. Diff below. |
| DFM/DCN/DS15/DS custody | Done | All frozen resource pins and manifests match; no re-record. Restoring shared schemas preserves authentic editions. Full DFM commands remain blocked by known aggregate registry diagnostics; the separate runtime probe establishes retained dispatch only. |
| Shared schema restoration | Done | EventRecord and append receipt restored to gated/main exact bytes by lead decision. Index checkpoint restored likewise for CV-366 and browser materialization; DCW current_schema installs equivalent runtime predicates (root comment ignored). |
| DO + DCO union | Done | DCO numbers exact; timestamp, guard-table and CV-1100 functions retained. DO BOARD members and board_member functions retained. Both consumers and DCO guard sweep below. |
| Graph pins | Done | CV-366 retains the main four + DS two resource union and merged workflow pin. Restored Index checkpoint clears its remaining hash error. DO V2 workflow pin repaired; both graph consumers return []. |
| Q5 / AMS-141 and UCC-230 citations | Done | bf2a7b291a re-points citations by source content. Final command payload definitions check passes. Lead must tell pm-closure-lead; worker sends no cross-thread messages except its final lead report. |
| DS + DCN excluded audit rows | Done | Both rationales/citations preserved in both rows and the ledger. The before/after application hash record is reproduced below; 525 CRLF and three LF-only ledger lines preserved. |
| UI command catalog | Done | DL-407 + DL-408 union retained; every cmd token remains wired or explicitly excluded. Final citation/wiring and landing checks below. |
| DCH S4 | Open owner/lane gap | Known Store without a legacy receipt is still treated as current strict-v4 because per-original receipts are absent. No integration policy invented; carry to reviewers. |
| DCH Stop lifetime | Held outside integration | The Stop outcome lifetime remains for Jared / the later deck. Stop is not admitted. |
| DCO weak unproved reasons | Open review gap | ledger_retention_binding and prepared_registry_row_ref_unresolved remain enforced but uncredited. Their reasons describe attempted witnesses, not general entailment proofs; no isolation credit is added. |
| DMEM byte_length caps | Review note | DMEM byte_length safe caps are outside the DG6A family/domain check; carry for batch reviewers. |
| Other trailing-LF patterns | Open before batch landing | The 43 inherited coordination patterns remain uncredited technical follow-up for the shared hardening pass named in INTEGRATION-NOTES. DS hardens its own browser contracts; INT2 adds no isolated local pattern policy or guard-tool edit. |
| DX collection cleanup | Deferred by rule | Keep /home/sittingmongoose/pm-scratch/ea-DX-p2b-resume/gt-p2b/collection.pkl until batch-2 review; do not delete it now. |
| Tool issues T1–T4 | Reported; code unchanged | T1 ignored binary PNGs fail closed; T2 generated exclusions stale after regeneration/landing; T3 4,400-digit data needs exclusion; T4 whole value-graph role pin drifts on unrelated schema changes. Carry to the lead-owned tool issue batch. |
| Admissions / native proof | Not performed | Separate admissions DL-500..599, one family per commit, follow review. All 248 rows retain native NOT_RUN; 243 membership ABSENT and five existing DS membership PASS. |
| Governance | Not performed | No landing lock, main push, reseal, Spec_Lock/.evidence/auto_decisions edit or registry append. Lead owns pre/post Sol max and Astra max and the later landing. |
| DG6A grade citation pins | Done | Commit f9a49734f1 refreshes 275 of 475 quote spans. Grades, outcomes and findings are unchanged. All seven family regressions and the standalone audit pass. The later reference edits preserve every current quote span. |
| DFM aggregate registry gates | Lead carry; not credited | Lead decision 1112102945-20bb carries the inherited diagnostics without credit. Twelve family CLIs, B4 and the materializer remain uncredited. There are 86 owner or retention choices and 313 technical fixes; zero new records. No owner fixes tonight; no gate filtering. |
| DCO timestamp census union | Done | Commit 0fea76cc68 excludes the three exact DO board definitions from DCO’s timestamp census. Four boundary probes, the coordination consumer, 57 unit tests, numeric checks and the fourteen-table, 119-row guard sweep pass. |
| Registry Unicode byte rendering | Done | Two literal Unicode characters are restored with identical parsed JSON. The byte-render unit passes. The 36-test shared-runtime group has 34 passes and two inherited failures, explicitly uncredited. The registry diagnostics are unchanged. |
| Dry landing implementation paths | Repaired; both aggregates confirm | Sixteen metadata paths now name Plans/storage-plan.md. Existing anchors and unit ids remain unchanged; actual lint-path-refs passes. The full dry retains only the inherited registry blockers. |
| Dry landing canonical envelope clauses | Repaired; both aggregates confirm | Eighteen runtime-artifact clauses explicitly join the canonical CV-317 envelope project_id. Scope/schema/identity/append predicates and line counts unchanged; no waiver marker. The full dry retains only the inherited registry blockers. |
| Dry landing integer parser | Repaired; both aggregates confirm | PYTHONINTMAXSTRDIGITS=0 permits the intentional 4,400-digit fixture to reach unchanged semantic validators; JSON syntax and usage-contract gates pass. The full dry retains only the inherited registry blockers. |
| Dry landing exit 0 | Blocked by lead carry decision | Both full dry attempts completed. The final run has 800 blocking records: 399 inherited diagnostics in each aggregate plus two derived self-test records. No new registry diagnostics or infrastructure failures. Achieving exit 0 conflicts with the instruction to carry these without owner fixes or gate filtering. |

## T198 and sanctioned data diffs

The initial refresh classified 21 declarations: DCH six frozen copies plus EventRecord v3 two as Storage; DT thirteen provider observations as other-owner. It refreshed thirteen hash-only rows and three evidence rows. Passes two/three handled main snapshot rotation and the approved roles pin. The final pass after all eighteen lanes adds no declarations, relocates six registry pointers by stable family identity, and renews scan exclusions after generation. No NUMRULE source code was hand-edited. The lead-approved nested-binding fix f304bfaf64 is integrated as a separate merge and verified against its gated blobs.

The gate runs against the exact tracked candidate in the full clean worktree. Ignored audit PNGs in the landing worktree trigger the recorded T1 fail-closed scan limitation. The dry landing check uses the full `int2` worktree with required ignored audit/currentness inputs. This distinction is explicit; no sparse landing override is used.

Checked candidate tree: `fe7da4478d4bfabbbef0a86cc63d25c2f2702994`. Code head: `d91213ff98da70921a826362b2cf2c6df9baee06`.

Final projection:

```json
{
  "root": "/home/sittingmongoose/pm-scratch/ea-int2/clean",
  "rows_changed": 0,
  "by_kind": {},
  "rows": [],
  "storage_pointer_citation_changes": [],
  "validation_errors_after_projection": [],
  "inventory_self_pin": {
    "before": "3a3b6d33291f64893eb259779f9fba8c45b2de80a08c95485dc2f182d94c8a11",
    "after": "3a3b6d33291f64893eb259779f9fba8c45b2de80a08c95485dc2f182d94c8a11"
  },
  "scan": {
    "nodes": 254,
    "errors": [],
    "unclassified": [],
    "missing": []
  }
}
```

Registry relocations:

```json
[
  {
    "family_id": "dt_usage_event_source",
    "before": "/families/452/value_schema/properties/subject",
    "after": "/families/457/value_schema/properties/subject",
    "old_node_sha256": "2bdc44411b9fad2e302a668af2bba881e50a48ab90884e45e35129a555615fd4"
  },
  {
    "family_id": "dt_usage_event_source",
    "before": "/families/452/value_schema/properties/payload/anyOf/0",
    "after": "/families/457/value_schema/properties/payload/anyOf/0",
    "old_node_sha256": "27b112c3de1d887b4e916386c4cf2aefc54caf646e849e983abbf52b658ba040"
  },
  {
    "family_id": "dt_usage_event_source",
    "before": "/families/452/value_schema/allOf/0/else/properties/payload",
    "after": "/families/457/value_schema/allOf/0/else/properties/payload",
    "old_node_sha256": "27b112c3de1d887b4e916386c4cf2aefc54caf646e849e983abbf52b658ba040"
  },
  {
    "family_id": "dt_usage_event_application_source",
    "before": "/families/461/value_schema/properties/subject",
    "after": "/families/466/value_schema/properties/subject",
    "old_node_sha256": "2bdc44411b9fad2e302a668af2bba881e50a48ab90884e45e35129a555615fd4"
  },
  {
    "family_id": "dt_usage_event_application_source",
    "before": "/families/461/value_schema/properties/payload/anyOf/0",
    "after": "/families/466/value_schema/properties/payload/anyOf/0",
    "old_node_sha256": "27b112c3de1d887b4e916386c4cf2aefc54caf646e849e983abbf52b658ba040"
  },
  {
    "family_id": "dt_usage_event_application_source",
    "before": "/families/461/value_schema/allOf/0/else/properties/payload",
    "after": "/families/466/value_schema/allOf/0/else/properties/payload",
    "old_node_sha256": "27b112c3de1d887b4e916386c4cf2aefc54caf646e849e983abbf52b658ba040"
  }
]
```

Sanctioned supplements:

```json
{
  "line_pin_count": 35,
  "node_controls_added": [
    {
      "path": "Plans/dch_retained_recipes.json",
      "origin": "json",
      "pointer": "/recipes/raw-v1/schemas/Plans~1event_record.schema.json",
      "control": "1e78ca11ac388bd617bcbf3111f0a253e257633ccc7b2383e523a51dcfc86deb"
    },
    {
      "path": "Plans/dch_retained_recipes.json",
      "origin": "json",
      "pointer": "/recipes/raw-v1/schemas/Plans~1event_record.schema.json/$defs/event_record_1_0_0_compatibility_reader",
      "control": "358cab93d41403b6571af40265be2402c61049abfe4fd3a9927de8a97c8e4f30"
    },
    {
      "path": "Plans/dch_retained_recipes.json",
      "origin": "json",
      "pointer": "/recipes/normalized-v2/schemas/Plans~1event_record.schema.json",
      "control": "1e78ca11ac388bd617bcbf3111f0a253e257633ccc7b2383e523a51dcfc86deb"
    },
    {
      "path": "Plans/dch_retained_recipes.json",
      "origin": "json",
      "pointer": "/recipes/normalized-v2/schemas/Plans~1event_record.schema.json/$defs/event_record_1_0_0_compatibility_reader",
      "control": "358cab93d41403b6571af40265be2402c61049abfe4fd3a9927de8a97c8e4f30"
    },
    {
      "path": "Plans/dch_retained_recipes.json",
      "origin": "json",
      "pointer": "/recipes/strict-v3/schemas/Plans~1event_record.schema.json",
      "control": "1e78ca11ac388bd617bcbf3111f0a253e257633ccc7b2383e523a51dcfc86deb"
    },
    {
      "path": "Plans/dch_retained_recipes.json",
      "origin": "json",
      "pointer": "/recipes/strict-v3/schemas/Plans~1event_record.schema.json/$defs/event_record_1_0_0_compatibility_reader",
      "control": "358cab93d41403b6571af40265be2402c61049abfe4fd3a9927de8a97c8e4f30"
    },
    {
      "path": "Plans/event_record_v3.schema.json",
      "origin": "json",
      "pointer": "",
      "control": "2abbcf1a7234fa6aee23e25b2c0d21bd113761b8398ded157ad78b97e389d664"
    },
    {
      "path": "Plans/event_record_v3.schema.json",
      "origin": "json",
      "pointer": "/$defs/event_record_1_0_0_compatibility_reader",
      "control": "358cab93d41403b6571af40265be2402c61049abfe4fd3a9927de8a97c8e4f30"
    }
  ],
  "new_distinct_objects": [
    "2abbcf1a7234fa6aee23e25b2c0d21bd113761b8398ded157ad78b97e389d664"
  ]
}
```

Approved 35-line / eight-control diff:

```diff
diff --git a/scripts/pm_event_datetime_mutations.json b/scripts/pm_event_datetime_mutations.json
index 73eac296be..0155388837 100644
--- a/scripts/pm_event_datetime_mutations.json
+++ b/scripts/pm_event_datetime_mutations.json
@@ -4056,7 +4056,7 @@
   {
    "id": "CV-1101:canonical_text:1.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "This newly authored technical owner unit binds the existing EventRecord envelope date_time_string format: date-time to an enforced RFC 3339 section 5.6 date-time predicate, with section 5.7 calendar and leap-second restrictions.",
    "normative": true,
    "rules": [
@@ -4072,7 +4072,7 @@
   {
    "id": "CV-1101:canonical_text:1.2",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "It is owned by EventRecord/CV-317, independently of CV-1100's number-input grammar.",
    "normative": true,
    "no_mutation": "Ownership or governance statement; no date-time code implements it."
@@ -4080,7 +4080,7 @@
   {
    "id": "CV-1101:canonical_text:1.3",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "Validate the entire string: four-digit Gregorian year, real month/day, T or t separator, hour 00..23, minute 00..59, second 00..59 or a legitimate second 60, optional fraction with one or more decimal digits and no general digit ceiling, then Z/z or a signed hh:mm offset with hour 00..23 and minute 00..59.",
    "normative": true,
    "rules": [
@@ -4101,7 +4101,7 @@
   {
    "id": "CV-1101:canonical_text:1.4",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "Missing zone, space separator, trailing LF, invalid calendar/range/offset and an illegitimate leap second refuse.",
    "normative": true,
    "rules": [
@@ -4120,7 +4120,7 @@
   {
    "id": "CV-1101:canonical_text:1.5",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "Lowercase t/z and nonzero offsets remain owner-valid for occurred_at_utc and broad family ts fields.",
    "normative": false,
    "rules": [
@@ -4135,7 +4135,7 @@
   {
    "id": "CV-1101:canonical_text:1.6",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "CV-253 binds Storage-assigned observed_at_utc and persisted_at_utc to the storage_utc_z profile: UTC with a terminal uppercase Z only; nonzero offsets, +00:00, -00:00 and lowercase z refuse.",
    "normative": true,
    "rules": [
@@ -4146,7 +4146,7 @@
   {
    "id": "CV-1101:canonical_text:1.7",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "The enforced EventRecord validator composes CV-253 constraints on only these two fields, combining the original schema and enforced date-time predicate with the terminal-Z restriction.",
    "normative": true,
    "rules": [
@@ -4159,7 +4159,7 @@
   {
    "id": "CV-1101:canonical_text:1.8",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "Composition preserves the pinned envelope schema bytes and every existing schema predicate; it does not restamp a registry resource hash.",
    "normative": true,
    "rules": [
@@ -4170,7 +4170,7 @@
   {
    "id": "CV-1101:canonical_text:1.9",
    "source": "Plans/Contracts_V0.md",
-   "line": 1155,
+   "line": 1167,
    "statement": "This profile retains arbitrary fractional precision and legitimate UTC leap seconds; it adds no universal nine-digit input requirement.",
    "normative": true,
    "rules": [
@@ -4182,7 +4182,7 @@
   {
    "id": "CV-1101:canonical_text:2.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1156,
+   "line": 1168,
    "statement": "Second 60 is admitted only at a real announced leap second after mathematically applying the complete signed offset to the represented instant; a local month-end check is insufficient.",
    "normative": true,
    "rules": [
@@ -4193,7 +4193,7 @@
   {
    "id": "CV-1101:canonical_text:2.2",
    "source": "Plans/Contracts_V0.md",
-   "line": 1156,
+   "line": 1168,
    "statement": "Frozen validator resources include their authoritative leap-second data edition.",
    "normative": false,
    "rules": [
@@ -4203,7 +4203,7 @@
   {
    "id": "CV-1101:canonical_text:2.3",
    "source": "Plans/Contracts_V0.md",
-   "line": 1156,
+   "line": 1168,
    "statement": "The reference predicate pins the IERS Bulletin C72 insertion history through 2016-12-31; later announced insertions require the applicable resource/edition update rather than guessing from a clock or treating every June/December boundary as a leap second.",
    "normative": true,
    "rules": [
@@ -4213,7 +4213,7 @@
   {
    "id": "CV-1101:canonical_text:2.4",
    "source": "Plans/Contracts_V0.md",
-   "line": 1156,
+   "line": 1168,
    "statement": "Four-digit year 0000 and Gregorian century rules are handled without a narrower host datetime range.",
    "normative": true,
    "rules": [
@@ -4224,7 +4224,7 @@
   {
    "id": "CV-1101:canonical_text:3.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1157,
+   "line": 1169,
    "statement": "Preserve every original timestamp string, case, zone spelling and all fractional digits in identity/hash preimages.",
    "normative": false,
    "rules": [
@@ -4235,7 +4235,7 @@
   {
    "id": "CV-1101:canonical_text:3.2",
    "source": "Plans/Contracts_V0.md",
-   "line": 1157,
+   "line": 1169,
    "statement": "Validation never rewrites timestamps, rounds a fraction, converts to floating epoch seconds or truncates to microseconds.",
    "normative": true,
    "rules": [
@@ -4246,7 +4246,7 @@
   {
    "id": "CV-1101:canonical_text:3.3",
    "source": "Plans/Contracts_V0.md",
-   "line": 1157,
+   "line": 1169,
    "statement": "Exact instant comparisons remain with their existing owners and compare offsets mathematically and complete fractional values.",
    "normative": true,
    "no_mutation": "Exact instant comparison stays with its existing owners; the date-time code compares no instants."
@@ -4254,7 +4254,7 @@
   {
    "id": "CV-1101:canonical_text:4.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1158,
+   "line": 1170,
    "statement": "Stricter local profiles remain selectable only where their existing field owners require them.",
    "normative": true,
    "rules": [
@@ -4265,7 +4265,7 @@
   {
    "id": "CV-1101:canonical_text:4.2",
    "source": "Plans/Contracts_V0.md",
-   "line": 1158,
+   "line": 1170,
    "statement": "The coordination record timestamp profile requires trailing uppercase Z; do not impose that restriction on every envelope timestamp.",
    "normative": true,
    "rules": [
@@ -4276,7 +4276,7 @@
   {
    "id": "CV-1101:canonical_text:4.3",
    "source": "Plans/Contracts_V0.md",
-   "line": 1158,
+   "line": 1170,
    "statement": "Legacy normalization's exactly nine fractional digits and trailing uppercase Z are its output form, not the current envelope input grammar; excess precision is never rounded merely to manufacture that output.",
    "normative": true,
    "rules": [
@@ -4288,7 +4288,7 @@
   {
    "id": "CV-1101:canonical_text:4.4",
    "source": "Plans/Contracts_V0.md",
-   "line": 1158,
+   "line": 1170,
    "statement": "No existing local profile, hash recipe, schema range or field is replaced here.",
    "normative": true,
    "rules": [
@@ -4299,7 +4299,7 @@
   {
    "id": "CV-1101:canonical_text:5.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1159,
+   "line": 1171,
    "statement": "Install and pass the actual date-time predicate to validation.",
    "normative": false,
    "rules": [
@@ -4312,7 +4312,7 @@
   {
    "id": "CV-1101:canonical_text:5.2",
    "source": "Plans/Contracts_V0.md",
-   "line": 1159,
+   "line": 1171,
    "statement": "The shared reference helper supplies an explicitly registered jsonschema format checker and a validator constructor that passes it; merely constructing FormatChecker(), or relying on a format annotation, is insufficient.",
    "normative": true,
    "rules": [
@@ -4327,7 +4327,7 @@
   {
    "id": "CV-1101:canonical_text:5.3",
    "source": "Plans/Contracts_V0.md",
-   "line": 1159,
+   "line": 1171,
    "statement": "Negatives must demonstrate that the installed predicate runs through the validator.",
    "normative": true,
    "rules": [
@@ -4338,7 +4338,7 @@
   {
    "id": "CV-1101:canonical_text:5.4",
    "source": "Plans/Contracts_V0.md",
-   "line": 1159,
+   "line": 1171,
    "statement": "Every lane adopts this check at its timestamp boundaries using the relevant existing owner profile, not a new local regex.",
    "normative": true,
    "no_mutation": "An obligation of each adopting lane at its own boundaries; no shared date-time code implements it."
@@ -4346,7 +4346,7 @@
   {
    "id": "CV-1101:canonical_text:6.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1160,
+   "line": 1172,
    "statement": "SP-1101 selects the authentic frozen original schema and date-time profile/resources before retained validation.",
    "normative": true,
    "no_mutation": "SP-1101 original selection is RetainedDispatcher in pm_event_numbers (number scope, its own rules table); the date-time code supplies only the profiles it selects, whose rules are profile.*."
@@ -4354,7 +4354,7 @@
   {
    "id": "CV-1101:canonical_text:6.2",
    "source": "Plans/Contracts_V0.md",
-   "line": 1160,
+   "line": 1172,
    "statement": "Valid lowercase, offset and arbitrarily precise old source/family timestamps remain readable with exact original bytes/results under that profile; retained Storage-assigned timestamps still use CV-253's uppercase-Z profile, and skipped past format enforcement never authorizes offset or lowercase-z Storage history; forged/wrong-profile selections and owner-invalid originals refuse.",
    "normative": true,
    "rules": [
@@ -4369,7 +4369,7 @@
   {
    "id": "CV-1101:canonical_text:6.3",
    "source": "Plans/Contracts_V0.md",
-   "line": 1160,
+   "line": 1172,
    "statement": "Accidental past acceptance by a validator that skipped format is not an owner-valid legacy grammar.",
    "normative": true,
    "rules": [
@@ -4382,7 +4382,7 @@
   {
    "id": "CV-1101:canonical_text:6.4",
    "source": "Plans/Contracts_V0.md",
-   "line": 1160,
+   "line": 1172,
    "statement": "This binds existing envelope behavior under DL-045; it creates no family admission, new encoding, product feature or native custody proof.",
    "normative": true,
    "no_mutation": "Ownership or governance statement; no date-time code implements it."
@@ -4390,7 +4390,7 @@
   {
    "id": "CV-1101:acceptance_criteria:1.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1169,
+   "line": 1181,
    "statement": "Enforced source/family validator accepts valid lowercase, offsets, real offset-adjusted leap seconds and long fractions without rewriting strings.",
    "normative": false,
    "rules": [
@@ -4406,7 +4406,7 @@
   {
    "id": "CV-1101:acceptance_criteria:2.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1170,
+   "line": 1182,
    "statement": "Storage observed_at_utc and persisted_at_utc accept uppercase-Z UTC and refuse offsets including signed zero offsets and lowercase z under CV-253.",
    "normative": true,
    "rules": [
@@ -4417,7 +4417,7 @@
   {
    "id": "CV-1101:acceptance_criteria:3.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1171,
+   "line": 1183,
    "statement": "Missing zone, space, LF, invalid day/hour/offset and false leap seconds refuse through the registered format predicate.",
    "normative": true,
    "rules": [
@@ -4435,7 +4435,7 @@
   {
    "id": "CV-1101:acceptance_criteria:4.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1172,
+   "line": 1184,
    "statement": "Coordination Z-only and legacy normalization output checks are selected only for their existing owner contexts.",
    "normative": true,
    "rules": [
@@ -4447,7 +4447,7 @@
   {
    "id": "CV-1101:acceptance_criteria:5.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1173,
+   "line": 1185,
    "statement": "Authentic retained profiles preserve exact original timestamp spelling; forged profile selections and invalid originals refuse.",
    "normative": true,
    "rules": [
@@ -4460,7 +4460,7 @@
   {
    "id": "CV-1101:negative_constraints:1.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1201,
+   "line": 1213,
    "statement": "No universal Z-only or nine-digit input restriction; no timestamp normalization in hashes.",
    "normative": true,
    "rules": [
@@ -4471,7 +4471,7 @@
   {
    "id": "CV-1101:negative_constraints:2.1",
    "source": "Plans/Contracts_V0.md",
-   "line": 1202,
+   "line": 1214,
    "statement": "No caller-selected historical profile, skipped format enforcement, new family admission or native proof.",
    "normative": true,
    "rules": [
diff --git a/scripts/pm_event_datetime_node_controls.json b/scripts/pm_event_datetime_node_controls.json
index 88fe6bfa1b..3ebb0e6b70 100644
--- a/scripts/pm_event_datetime_node_controls.json
+++ b/scripts/pm_event_datetime_node_controls.json
@@ -698,6 +698,58 @@
      "compatibility_event_type": null
     }
    }
+  },
+  "2abbcf1a7234fa6aee23e25b2c0d21bd113761b8398ded157ad78b97e389d664": {
+   "source": {
+    "path": "Plans/small_owner_event_fixtures.json",
+    "origin": "json",
+    "pointer": "/families/0/rebuild_cases/8/overrides/event"
+   },
+   "value": {
+    "schema_id": "pm.event.v0",
+    "schema_version": "3.0.0",
+    "scope_kind": "project",
+    "project_id": "project:actual-1",
+    "thread_id": "thread:format_applied:1",
+    "run_id": "run:format:1",
+    "node_id": null,
+    "attempt_id": null,
+    "actor_ref": "ref:actor.format_applied",
+    "requested_account_ref": "ref:account.requested",
+    "effective_account_ref": "ref:account.effective",
+    "producer_sequence_id": null,
+    "correlation_id": "correlation:format_applied:original",
+    "causation_event_id": null,
+    "parent_event_id": null,
+    "event_id": "evt_896dbc64a0df96491bb07cccbcc8f2bde5b03b06b80ba0d7d3b68f8bd0529953",
+    "event_type": "format.applied",
+    "occurred_at_utc": "2026-11-04T12:00:00Z",
+    "observed_at_utc": "2026-11-04T12:00:01Z",
+    "persisted_at_utc": "2026-11-04T12:00:02Z",
+    "sequence_id": 41,
+    "idempotency_key": "format.applied:896dbc64a0df96491bb07cccbcc8f2bde5b03b06b80ba0d7d3b68f8bd0529953",
+    "payload_schema_id": "pm.event_payload.format_applied.v1",
+    "payload": {
+     "schema_version": "1.0.0",
+     "operation_id": "op:format_applied:original",
+     "project_id": "project:actual-1",
+     "formatter_id": "formatter_id:format_applied:1",
+     "file_path": "src/main.rs",
+     "diff_bytes": 1,
+     "timestamp": "2026-11-04T12:00:00Z",
+     "tool_output_ref": "ref:source.1",
+     "formatted_output_ref": "ref:source.1"
+    },
+    "payload_ref": null,
+    "redaction_profile": "secret_refs_only",
+    "replay_policy": "dedupe_by_idempotency_key",
+    "migration": {
+     "migrated_from_schema_id": null,
+     "migrated_from_schema_version": null,
+     "migration_id": null,
+     "compatibility_event_type": null
+    }
+   }
   }
  },
  "nodes": [
@@ -1498,6 +1550,54 @@
    "origin": "json",
    "pointer": "/$defs/EventRecord",
    "control": "421cf1ae4be639ef62e973e72df0a33b5181d5104a92fc5f1fff2a73018daa8e"
+  },
+  {
+   "path": "Plans/dch_retained_recipes.json",
+   "origin": "json",
+   "pointer": "/recipes/raw-v1/schemas/Plans~1event_record.schema.json",
+   "control": "1e78ca11ac388bd617bcbf3111f0a253e257633ccc7b2383e523a51dcfc86deb"
+  },
+  {
+   "path": "Plans/dch_retained_recipes.json",
+   "origin": "json",
+   "pointer": "/recipes/raw-v1/schemas/Plans~1event_record.schema.json/$defs/event_record_1_0_0_compatibility_reader",
+   "control": "358cab93d41403b6571af40265be2402c61049abfe4fd3a9927de8a97c8e4f30"
+  },
+  {
+   "path": "Plans/dch_retained_recipes.json",
+   "origin": "json",
+   "pointer": "/recipes/normalized-v2/schemas/Plans~1event_record.schema.json",
+   "control": "1e78ca11ac388bd617bcbf3111f0a253e257633ccc7b2383e523a51dcfc86deb"
+  },
+  {
+   "path": "Plans/dch_retained_recipes.json",
+   "origin": "json",
+   "pointer": "/recipes/normalized-v2/schemas/Plans~1event_record.schema.json/$defs/event_record_1_0_0_compatibility_reader",
+   "control": "358cab93d41403b6571af40265be2402c61049abfe4fd3a9927de8a97c8e4f30"
+  },
+  {
+   "path": "Plans/dch_retained_recipes.json",
+   "origin": "json",
+   "pointer": "/recipes/strict-v3/schemas/Plans~1event_record.schema.json",
+   "control": "1e78ca11ac388bd617bcbf3111f0a253e257633ccc7b2383e523a51dcfc86deb"
+  },
+  {
+   "path": "Plans/dch_retained_recipes.json",
+   "origin": "json",
+   "pointer": "/recipes/strict-v3/schemas/Plans~1event_record.schema.json/$defs/event_record_1_0_0_compatibility_reader",
+   "control": "358cab93d41403b6571af40265be2402c61049abfe4fd3a9927de8a97c8e4f30"
+  },
+  {
+   "path": "Plans/event_record_v3.schema.json",
+   "origin": "json",
+   "pointer": "",
+   "control": "2abbcf1a7234fa6aee23e25b2c0d21bd113761b8398ded157ad78b97e389d664"
+  },
+  {
+   "path": "Plans/event_record_v3.schema.json",
+   "origin": "json",
+   "pointer": "/$defs/event_record_1_0_0_compatibility_reader",
+   "control": "358cab93d41403b6571af40265be2402c61049abfe4fd3a9927de8a97c8e4f30"
   }
  ]
 }

```

Earlier approved role-pin A diff (classification and battery evidence unchanged):

```diff
diff --git a/scripts/pm_event_datetime_roles.json b/scripts/pm_event_datetime_roles.json
index 8c18bf428e..6118eddaca 100644
--- a/scripts/pm_event_datetime_roles.json
+++ b/scripts/pm_event_datetime_roles.json
@@ -5,7 +5,7 @@
       "json",
       "/$defs/browser_program_result_validation/properties/result_schema_resources"
     ],
-    "value_schema_sha256": "576e670da07b7e67716bedb1fe93ba80cc5106f56bca2cb30f635be57ae05746",
+    "value_schema_sha256": "54ee3e3c961e3ca96880c2fa46c00d8de296718e7bb0a7cbecd1359e7dd00ee8",
     "role": "schema_resource_string",
     "reason": "result_schema_resources maps resource identifiers to nonempty original schema-resource strings. The cited value schema accepts all 653 battery timestamps and 15 of the 16 fixed controls, so it does not decide the string and cannot authorize a non-timestamp role. Reviewed as an owner-schema observation: `profile: owner_schema` keeps the original validation and installs no timestamp overlay. No non-timestamp role is claimed.",
     "classification": "other_owner_observation",

```

## Custody, census and generation

| Lane | Final comparison | Action |
|---|---|---|
| DFM | 12 families × five resource pins; all manifests equal | No re-record |
| DCN | card2@1: both resource pins equal | No re-seal |
| DS15 | 23 resource manifests equal | No re-record |
| DS | Six recipe manifests equal | No re-record |

The lane tools recomputed these manifests from the final source files. Full retained-reader consumers are listed below. Census source and tests agree at 496/41, with status and tier counts above. Shard generation, index generation and shard body/path check each exited 0. The generated index has 8,149 unique PlanUnits; all four shared units occur once and match the gated section bytes. Required currentness files were byte-compared with the shared checkout before final generation.

## Checkers and own-tree comparisons

All checker commands are serial long-jobs. Each starts with at least 11 GiB available under MemoryMax=2G/MemorySwapMax=0. A capped OOM is retained as a visible failure and rerun uncapped only at 13.5 GiB. Raw outputs remain under `/home/sittingmongoose/pm-scratch/ea-int2/checks/`; the compact JSON gives every command, exit, result summary and log SHA-256.

| Check | Exit | Own / required exit | Comparison | Observed summary |
|---|---|---|---|---|
| SHARED-numbers-scope | 0 | 0 | matches lane passing exit | {"case_passes": 580, "conflicts_covered": ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10"], "corpus_cases": 580, "datetime_inventory": {"command": "python3 scripts/pm_event_numbers.py --self-test --scope all", "excluded_cases": 13046, "status": "NOT_RUN_SEPARATE_SUITE"}, "guard_isolation": {"items": ["binary64 versus emitted-d |
| SHARED-numbers-all | 0 | 0 | Gatedf304fix resolves6DCHconstructors:final13626/13626cases and1276/1276owner checks pass;originalfailed log preserved. | {"case_passes": 13626, "conflicts_covered": ["C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10"], "corpus_cases": 13626, "datetime_inventory": {"failures": [], "nodes": 254, "other_owner_nodes": 102, "status": "pass", "storage_nodes": 141, "unclassified_nodes": 0, "wildcard_non_timestamp_nodes": 3, "wildcard_non_timestamp_role_nod |
| SHARED-datetime-inventory | 0 | 0 | Finalgatedinventory PASS254nodes:141Storage102other3wild8roles,zero failures/unclassified. | {"status": "pass", "nodes": 254, "storage_nodes": 141, "other_owner_nodes": 102, "wildcard_non_timestamp_nodes": 3, "wildcard_non_timestamp_role_nodes": 8, "unclassified_nodes": 0} |
| SHARED-command-payload-defs | 0 | 0 | matches lane passing exit | {} |
| DR-checker | 0 | 0 | Matches latest part-2B FIX1: 26165 assertions, 19 families, zero failures (older 22375 count is historical). | {"status": "pass", "native_execution": "NOT_RUN", "admission": "NONE", "scope": "static full-envelope/schema/receipt/hash and bounded source/append/observation models", "cases": 26165} |
| DCN-checker | 0 | 0 | Matches part-2B: 283 positives,75 controls,16690 witnesses,569 rows/142 tables,501 first refusals,12 frozen recipes; no errors. | {"status": "PASS", "native_execution": "NOT_RUN", "admission": "ABSENT", "positives": 283, "p2a_controls": 75, "negatives": 16690, "rows": 569, "tables": 142, "rows_refused_first": 501, "recipe_composition": {"replaced_payload_schema/retry": "recipe_unknown", "replaced_envelope_schema/retry": "recipe_unknown", "storage_profile_weakened/retry": "rec |
| DCN-tables | 0 | 0 | Matches:142 tables/569 rows; no stale or extra module. | {} |
| DCN-p2a | 0 | 0 | Matches:347 witnesses,75 controls,237 target rows; no stale fixtures or failures. | {"witnesses": 347, "controls": 75, "targets": 237, "stale": false} |
| DS-p2b | 0 | 0 | Matches:51/51 witnesses;110 sealed originals,66 references,zero collisions. | {"schema_id": "pm.ds.p2b_witness_check.v1", "status": "pass", "witnesses": 51, "negatives": 31, "positives": 20, "passing": 51, "custody": {"sealed": 110, "refs": 66, "collisions": 0, "malformed": [], "status": "pass"}} |
| DS-p2a | 0 | 0 | Matches latest part-2B:186/186 witnesses (198 is the historical part-2A count). | {"schema_id": "pm.ds.p2a_witness_check.v1", "status": "pass", "witnesses": 186, "passing": 186} |
| DS-tables | 0 | 0 | Part-2B generated modules current:198 tables/746 rows; no stale or extra file. | {} |
| DS-terminal-selftest | 0 | 0 | Matches:7 positives/25 negatives, intentional bad-positive CLI exit1 detected; overall self-test pass. | {"schema_id": "pm.terminal_workgroup_compatibility.check.v1", "status": "pass", "positive_count": 7, "negative_count": 25, "guard_isolation": "PARTIAL; shared guard-table adoption is part 2", "native_execution": "NOT_RUN", "boundary": "Synthetic contract observations only; no history view, saved result or original move is implemented.", "invalid_po |
| DS-layout-slot | 0 | 0 | Matches unchanged Home4 coverage:10 positives/30 schema negatives/33 invariant negatives;415 references resolved,15 payload objects. | {"claim_boundary": "Synthetic schema, joined-value, whole-value size and payload-reference checks of the Home4 contract only; no native codec, payload pack, redb transaction, authentication, durability, installation or admission proof.", "counts": {"invariant_negative": 33, "positive": 10, "schema_negative": 30}, "native_execution": "NOT_RUN", "pay |
| DS-layout-slot-selftest | 0 | 0 | Matches passing self-test:bad/misdeclared positives detected;LF source reference refused;BLAKE3 vectors pass. | {"bad_positive_fails_run": true, "blake3_vectors": true, "misdeclared_case_fails_run": true, "status": "pass", "trailing_lf_source_ref_refused": true} |
| DM-checker | 0 | 0 | All eight families PASS in one combined run:55535 assertions. Lane reports56732 summed across eight separate runs, repeating171 shared assertions per run; delta7x171=1197. Checker,guard-audit and fixture bytes match lane4cb6c1e44b. | {"status": "PASS", "assertions": 55535, "native_execution": "NOT_RUN"} |
| DT-checker | 0 | 0 | Matches latest part-2B:33961 checks across17 families,failures empty. | {"status": "pass", "per_family_checks": {"approval.requested": 1317, "approval.granted": 1445, "approval.denied": 1315, "approval.timeout": 1350, "config.migrated": 1498, "gate.evaluation_started": 1521, "gate.failed": 1525, "gate.passed": 1556, "requirements.clarification_requested": 1154, "run.background_enqueued": 1284, "tool.denied": 1840, "too |
| DT-tables | 0 | 0 | Matches:all70 DT table modules current. | {} |
| DX-tables | 0 | 0 | Matches latest generator:114 tables/291 rows,problems empty. | {} |
| DX-p2a | 0 | 0 | Matches:110 P2A witnesses and10 added custody controls;problems empty. | {"status": "pass", "witnesses": 110, "custody_added": 10, "problems": []} |
| DX-semantics | 0 | 0 | All16 families PASS:3214 transitions,230 receipt/replay/withdrawal traces,1345 history cases,2060 numeric boundaries,4020 exact-type cases;failures empty. | {"status": "pass", "sweep_p2a_witnesses": 110, "source_transition_cases": 3214, "receipt_replay_withdrawal_traces": 230, "source_score_domain_cases": 16, "isolated_schema_cases": 326, "schema_reference_cases": 208, "historical_read_cases": 1345, "numeric_boundary_cases": 2060, "exact_type_cases": 4020, "workgraph_id_boundary_cases": 168, "canonical |
| DX-contracts | 0 | 0 | All16 families PASS:775 fixture cases,80 identity/replay cases,208 reference cases;failures empty. | {"status": "pass", "fixture_cases": 775, "identity_replay_cases": 80, "schema_reference_cases": 208, "native_execution": "NOT_RUN", "families": 16} |
| DMEM-tables | 0 | 0 | 184 module files current,316 rows. The maintenance report counts183 runtime phases; the extra file is not a coverage loss. | {} |
| DMEM-maintenance | 0 | 0 | Eight families PASS;224 boundaries,126 operations,276 traces/464 steps,340 writer steps,129 ids,32 checkpoint joins,108 history cases and6 checked registry mirrors match reported suite. | {"status": "pass", "boundary_cases": 224, "operation_cases": 126, "stateful_traces": 276, "stateful_steps": {"memory.dedup_sweep.completed": 46, "memory.dedup_sweep.started": 47, "memory.index.lexical.rebuild.completed": 69, "memory.index.lexical.rebuild.started": 70, "memory.index.semantic.rebuild.completed": 69, "memory.index.semantic.rebuild.sta |
| DMEM-archive | 0 | 0 | Four archive/cutoff families PASS:982 controls accepted and982 exact negative refusals (the report lists938 earlier guard negatives);154 writer/phase steps and22 positive boundaries match. No failing observation or coverage reduction. | {"status": "pass", "guard_cases": 982, "guard_case_oracle": {"cases": 982, "controls_accepted": 982, "negatives_refused_exactly": 982}, "canonical_history_cases": {"memory.monthly_summary.completed": 92, "memory.monthly_summary.started": 92, "memory.prune_archive.completed": 92, "memory.prune_archive.started": 92}, "numeric_writer_cases": {"memory. |
| DCH-checker | 0 | 0 | All17 non-Stop families PASS in one combined run:44237 checks. Latest lane report sums47229 over17 separate family runs, repeating187 shared checks;delta16x187=2992. S4 gap remains open. | {"status": "pass", "native_execution": "NOT_RUN", "coverage": "Static standing checks 1-10; every product refusal is a named row of a phase table (scripts/pm_dch_table_*.py), and check 11 is the shared pm_guard_isolation.py run over those tables (scripts/pm-dch-guard-tables.py): append, transport, retry, registry parity, complete schema-reference c |
| DCH-stop | 0 | 0 | PASS:4612 checks,36 table witnesses,13 surfaced categories;retirement/cutover still conditional and saved-outcome retention pending. | {"status": "pass", "table_witnesses": 36, "surfaces": {"request": 407, "retry": 116, "transport": 520, "outcome": 385, "save": 24, "read": 48, "queue": 96, "schema_outcome": 265, "schema_request": 279, "index": 118, "retirement": 36, "schema_request_predicate": 3, "schema_outcome_predicate": 3}, "native_execution": "NOT_RUN", "claim_boundary": "Syn |
| DCH-tables | 0 | 0 | 78 DCH module files current,282 rows. | {} |
| DS15-checker | 0 | 0 | Matches all16 families:64payload,11776semantic,96reference,107predicate,49value,247guard-proof,3488numeric oracles;82P2A/47P2B witnesses;93sealed originals/4stores. Native NOT_RUN. | {"status": "pass", "payload_oracles": 64, "reference_closure_oracles": 96, "predicate_oracles": 107, "value_oracles": 49, "guard_proof_oracles": 247, "numeric_oracles": 3488, "sweep_p2a_witnesses": 82, "sweep_p2b_witnesses": 47, "sealed_originals": 93, "custody_stores": 4, "native_execution": "NOT_RUN", "families": 16} |
| DS15-deck2-browser.context_shared | 0 | 0 | Matches passing deck-2 family consumer: 126cases;membership ABSENT, native NOT_RUN. | {"status": "pass", "event_type": "browser.context_shared", "negative_cases": 102, "policy_cases": 0, "reference_closure_cases": 2, "native_execution": "NOT_RUN", "membership": "ABSENT", "cases": 126} |
| DS15-deck2-browser.context_share_revoked | 0 | 0 | Matches passing deck-2 family consumer: 121cases;membership ABSENT, native NOT_RUN. | {"status": "pass", "event_type": "browser.context_share_revoked", "negative_cases": 94, "policy_cases": 0, "reference_closure_cases": 2, "native_execution": "NOT_RUN", "membership": "ABSENT", "cases": 121} |
| DS15-deck2-catalog.update.started | 0 | 0 | Matches passing deck-2 family consumer: 197cases;membership ABSENT, native NOT_RUN. | {"status": "pass", "event_type": "catalog.update.started", "negative_cases": 161, "policy_cases": 13, "reference_closure_cases": 2, "native_execution": "NOT_RUN", "membership": "ABSENT", "cases": 197} |
| DS15-deck2-catalog.update.completed | 0 | 0 | Matches passing deck-2 family consumer: 197cases;membership ABSENT, native NOT_RUN. | {"status": "pass", "event_type": "catalog.update.completed", "negative_cases": 161, "policy_cases": 13, "reference_closure_cases": 2, "native_execution": "NOT_RUN", "membership": "ABSENT", "cases": 197} |
| DS15-deck2-catalog.remove.started | 0 | 0 | Matches passing deck-2 family consumer: 180cases;membership ABSENT, native NOT_RUN. | {"status": "pass", "event_type": "catalog.remove.started", "negative_cases": 157, "policy_cases": 42, "reference_closure_cases": 2, "native_execution": "NOT_RUN", "membership": "ABSENT", "cases": 180} |
| DS15-deck2-catalog.remove.completed | 0 | 0 | Matches passing deck-2 family consumer: 180cases;membership ABSENT, native NOT_RUN. | {"status": "pass", "event_type": "catalog.remove.completed", "negative_cases": 157, "policy_cases": 42, "reference_closure_cases": 2, "native_execution": "NOT_RUN", "membership": "ABSENT", "cases": 180} |
| DS15-deck2-tool.custom_headless.skipped | 0 | 0 | Matches passing deck-2 family consumer: 129cases;membership ABSENT, native NOT_RUN. | {"status": "pass", "event_type": "tool.custom_headless.skipped", "negative_cases": 107, "policy_cases": 0, "reference_closure_cases": 2, "native_execution": "NOT_RUN", "membership": "ABSENT", "cases": 129} |
| DS15-p2b | 0 | 0 | Matches47 witnesses:37negatives/10positives;fixture current,problems empty. | {"status": "pass", "witnesses": 47, "negatives": 37, "positives": 10, "stale_fixture": false, "problems": []} |
| DS15-p2a | 0 | 0 | Matches82 witnesses;fixture current,problems empty. | {"status": "pass", "witnesses": 82, "stale_fixture": false, "problems": []} |
| DS15-tables | 0 | 0 | Matches168 tables/391rows;all generated modules current. | {} |
| DG6A-domain-alert.acknowledged | 0 | 0 | matches lane passing exit | {"status": "pass", "family": "alert.acknowledged", "observations": 8965} |
| DG6A-regression-alert.acknowledged | 0 | 0 | Initial positive citation audit failed after source merges;275 quote spans refreshed without grade changes;full replay now PASS. | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 129} |
| DG6A-domain-alert.dismissed | 0 | 0 | matches lane passing exit | {"status": "pass", "family": "alert.dismissed", "observations": 9091} |
| DG6A-regression-alert.dismissed | 0 | 0 | Initial positive citation audit failed after source merges;275 quote spans refreshed without grade changes;full replay now PASS. | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 129} |
| DG6A-domain-alert.rule_muted | 0 | 0 | matches lane passing exit | {"status": "pass", "family": "alert.rule_muted", "observations": 9289} |
| DG6A-regression-alert.rule_muted | 0 | 0 | Initial positive citation audit failed after source merges;275 quote spans refreshed without grade changes;full replay now PASS. | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 129} |
| DG6A-domain-alert.snoozed | 0 | 0 | matches lane passing exit | {"status": "pass", "family": "alert.snoozed", "observations": 9850} |
| DG6A-regression-alert.snoozed | 0 | 0 | Initial positive citation audit failed after source merges;275 quote spans refreshed without grade changes;full replay now PASS. | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 155} |
| DG6A-domain-panel.redocked | 0 | 0 | matches lane passing exit | {"status": "pass", "family": "panel.redocked", "observations": 11125} |
| DG6A-regression-panel.redocked | 0 | 0 | Initial positive citation audit failed after source merges;275 quote spans refreshed without grade changes;full replay now PASS. | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 167} |
| DG6A-domain-panel.undocked | 0 | 0 | matches lane passing exit | {"status": "pass", "family": "panel.undocked", "observations": 11114} |
| DG6A-regression-panel.undocked | 0 | 0 | Initial positive citation audit failed after source merges;275 quote spans refreshed without grade changes;full replay now PASS. | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 167} |
| DG6A-domain-concern.created | 0 | 0 | matches lane passing exit | {"status": "pass", "family": "concern.created", "observations": 11834} |
| DG6A-regression-concern.created | 0 | 0 | Initial positive citation audit failed after source merges;275 quote spans refreshed without grade changes;full replay now PASS. | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 129} |
| DG6A-audit-grade | 0 | 0 | Initial positive citation audit failed after source merges;275 quote spans refreshed without grade changes;full replay now PASS. | {"status": "pass", "citations": 475, "families": 16} |
| DG6A-tables | 0 | 0 | matches lane passing exit | {} |
| DG6A-guard-check | 0 | 0 | matches lane passing exit | {"status": "pass", "vectors": {"alert.acknowledged": 224, "alert.dismissed": 224, "alert.rule_muted": 223, "alert.snoozed": 232, "panel.redocked": 223, "panel.undocked": 223, "concern.created": 253}, "proof": "none: check 11 is scripts/pm-dg6a-guard-tables.py"} |
| DG6B-checker | 0 | 0 | All19 families PASS;417references resolved. Per-family complete-path,round9,P2B negative/positive totals compared below;native NOT_RUN. | {"status": "pass", "native_execution": "NOT_RUN", "resolved_schema_references": 417} |
| DG6B-tables | 0 | 0 | Matches78phases/176rows;stale and extra empty. | {} |
| DFM-file.copied | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-folder.copied | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-file.created | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-folder.created | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-file.deleted | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-folder.deleted | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-file.exported | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-folder.exported | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-file.moved | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-folder.moved | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-file.renamed | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-folder.renamed | 1 | 0 | Lead carry, NOT_CREDITED: own DFM command passed; merged command exits1 at aggregate registry gate after family loops. All399diagnostics match exact contributing lane trees (zero new diagnostic records). Complete checker pass NOT credited; no gate filtered. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DFM-p2a | 0 | 0 | Matches1556witnesses:1112negatives/444controls;no dropped or stale fixtures. | {"witnesses": 1556, "negatives": 1112, "controls": 444, "dropped": [], "stale": false} |
| DFM-tables | 0 | 0 | Matches117tables/237rows;generated modules current. | {} |
| DFM-registry-regression | 1 | 0 | Lead carry, NOT_CREDITED: own regression passed; merged B4 positive control refuses399aggregate registry diagnostics before the mutation test. Same399records as exact contributing lane trees; regression pass NOT credited. Lead1112102945-20bb: no owner fixes tonight. | {} |
| DDBG-checker | 0 | 0 | Matches9prepared families/3178schema checks;shared corpus124route runs,zero disagreements. No admission/native claim. | {"status": "PASS", "shared_corpus": {"raw_inputs": 55, "exact_inputs": 12, "route_runs": 124, "parse_refused": 23, "slot_refused": 18, "producer_refused": 13, "accepted": 13, "disagreements": 0}, "scope": "Static payload/identity/refusal oracles only; native NOT_RUN."} |
| DDBG-views | 0 | 0 | Matches passing generated guard-view check. | {"status": "PASS", "guard_views": "scripts/pm_debug_investigation_guard_views.json"} |
| DC-checker | 0 | 0 | Matches PASS:18prepared rows,zero failures,zero admitted families,empty admission blockers;static/native NOT_RUN. Detailed counts in raw JSON. | {"admission_blockers": [], "admitted_families": [], "claim_boundary": "Static schema, ledger, registry-row and synthetic fixture checks only. No family is admitted, no checkpoint or pin moves, and no native producer, append path, projector, reader, durability, deletion, readiness or seal is proved.", "counts": {"identity_vectors": 54, "invalid_even |
| DC-tables | 0 | 0 | Matches121tables/340rows;generated modules current. | {} |
| DC-selftest | 0 | 0 | Matches PASS14/14scenarios, including failure-exit and unvisited-reference controls;baseline PASS. | {"scenarios": {"complete_baseline": true, "envelope_join_misnamed": true, "failure_cli_rejects_success_exit": true, "identity_vector_tampered": true, "integrity_oracles": true, "native_marked_passed": true, "negative_payload_accepted": true, "positive_payload_with_text_field": true, "prepared_row_in_registry_refused": true, "projection_redb_snapsho |
| DO-guard-proof-check-all | 0 | 0 | Matches passing complete proof-module currentness check;no stale or extra module. | {"errors": [], "error_count": 0} |
| DO-guard-proof-check | 0 | 0 | Matches passing guard-proof currentness check. | {"adapters": 118, "errors": []} |
| DO-coordination-events | 0 | 0 | Initial DCO timestamp census included five DO board fields. Exact board definitions excluded only from that census; full replay now PASS. | {"admission_claimed": false, "admitted_rows": ["coordination.agent_registered"], "batch_event_types": 7, "claim_boundary": "Static schema, ledger, registry-row, Storage-row and synthetic fixture checks only. No family is admitted, no checkpoint or pin moves, and no native producer, crash detector, append path, projector, reader, durability, securit |
| DO-test-coordination | 0 | 0 | Initial DCO timestamp census included five DO board fields. Exact board definitions excluded only from that census; full replay now PASS. | "Ran 57 tests in 75.684s" |
| DO-test-shared-runtime | 1 | 0 | Leadcarry NOT_CREDITED:final36tests have only2inherited failures(registry399 and pending-retention materializer);Unicodebyte-render defect fixed;zero new diagnostics. | "Ran 36 tests in 119.481s" |
| TEST-onboarding | 0 | 0 | Matches passing onboarding suite;final496-family census included. | "Ran 50 tests in 12.706s" |
| TEST-browser-admission | 0 | 0 | Matches passing browser admission suite;restored Index checkpoint clears the materialization defect. | "Ran 39 tests in 198.655s" |
| DO-checker | 0 | 0 | Matches latest part2B:25families,222702checks,stopped facets empty;native NOT_RUN. | {"status": "pass", "native": "NOT_RUN", "stopped_facets": [], "checks": 222702, "families": 25} |
| MERGE-NUMRULE-gated | 0 | 0 | matches lane passing exit | {"status": "pass", "merge_commit": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "approved_head": "f304bfaf64334fe5255ce49a295f4ae5cec443d6", "checks_pending": ["scope-all self-test", "inventory gate", "datetime_validator"]} |
| REPAIR-DCO-census | 0 | 0 | matches lane passing exit | {"status": "pass"} |
| RECHECK-DCO-census-probes | 0 | 0 | matches lane passing exit | {"status": "pass", "probes": {"valid_fifteen_coordination_and_five_board_fields": true, "missing_owned_timestamp_fails_census": true, "unknown_timestamp_definition_fails_census": true, "board_mutation_still_fails_do_copy_validation": true}, "native_execution": "NOT_RUN"} |
| RECHECK-DO-coordination-events | 0 | 0 | matches lane passing exit | {"admission_claimed": false, "admitted_rows": ["coordination.agent_registered"], "batch_event_types": 7, "claim_boundary": "Static schema, ledger, registry-row, Storage-row and synthetic fixture checks only. No family is admitted, no checkpoint or pin moves, and no native producer, crash detector, append path, projector, reader, durability, securit |
| RECHECK-DO-test-coordination | 0 | 0 | matches lane passing exit | "Ran 57 tests in 75.684s" |
| DF-contracts | 0 | 0 | Matches latest fix-round counts:{'positive': 103, 'negative': 352, 'identity': 18};failures empty,native NOT_RUN. | {"status": "pass", "native_execution": "NOT_RUN", "membership": "ABSENT"} |
| DF-authority | 0 | 0 | Matches latest fix-round counts:{'positive': 244, 'negative': 2386, 'protocol': 1323};failures empty,native NOT_RUN. | {"status": "pass", "native_execution": "NOT_RUN", "membership": "ABSENT", "authority": "synthetic contract cases only"} |
| DF-tables | 0 | 0 | Matches205tables/403rows;stale0/extra0. Credited guard subset is lead-supplied175tables/355rows;OS01 remains uncredited. | {} |
| DF-p2a | 0 | 0 | Matches1082cases kept,zero rejected,stale none. | {} |
| DF-fixcases | 0 | 0 | Matchesstale empty/failures0. OS01 four-cut entailment outputs refuse/refuse/refuse/accept;no isolation credit. | {} |
| DF-number-corpus | 0 | 0 | Matches2148routes:518accepted/1630refused,untracked0,ninefamilies. | {"status": "pass", "corpus_values": 81, "route_runs": 2148, "accepted": 518, "refused": 1630, "untracked": 0, "families": 9} |
| DF-unproved-attempts | 0 | 0 | Matches69/69attempts confirmed and14/14duplicate pair proofs;OS01 separateuncredited entailment. | {"attempts": 69, "confirmed": 69, "reachable": [], "mismatched": [], "rows_attempted": 47, "pairs": 14, "pairs_proved": 14, "pairs_not_proved": []} |
| DCO-wave2 | 0 | 0 | matches lane passing exit | {"status": "pass", "native_execution": "NOT_RUN", "admission_claimed": false} |
| DCO-number-corpus | 0 | 0 | matches lane passing exit | {"status": "pass", "agree": 16, "domain_or_refusal": 3, "skipped": 13607, "crash": 0, "disagreements": [], "huge_4400_revision": null, "progress_float": "payload_integer_slots", "local_payload_digest": "5de483fa55a64571c55d9e3c8146eb56851183d2d22790bf6780fa97a3cba7cc", "generic_producer_jcs": "separate", "retained_exact": true, "retained_forged": f |
| DCO-guard | 0 | 0 | Matches full14PASS tables/119of119rows;MISSING empty,allproblem arrays empty;content verified,not onlyexit0. | {"status": "pass", "tables": 14, "proved": 119, "rows": 119, "missing": []} |
| DFM-custody-runtime | 0 | 0 | Scoped retained-dispatch probe only:all12valid original resources must resolve without OD02;full family/B4 checks stay NOT_CREDITED under lead carry. | {} |
| RECHECK-DG6A-regression-alert.acknowledged | 0 | 0 | matches lane passing exit | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 129} |
| RECHECK-DG6A-regression-alert.dismissed | 0 | 0 | matches lane passing exit | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 129} |
| RECHECK-DG6A-regression-alert.rule_muted | 0 | 0 | matches lane passing exit | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 129} |
| RECHECK-DG6A-regression-alert.snoozed | 0 | 0 | matches lane passing exit | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 155} |
| RECHECK-DG6A-regression-panel.redocked | 0 | 0 | matches lane passing exit | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 167} |
| RECHECK-DG6A-regression-panel.undocked | 0 | 0 | matches lane passing exit | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 167} |
| RECHECK-DG6A-regression-concern.created | 0 | 0 | matches lane passing exit | {"status": "pass", "reviewed_head": "ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f", "executed_head": "eb9618b2cf4b65ea10af89478052d9fee6c086db", "cases": 129} |
| RECHECK-DG6A-audit-grade | 0 | 0 | matches lane passing exit | {"status": "pass", "citations": 475, "families": 16} |

Completed: 85/85 prepared checks and 24/24 extra/recheck commands. Any nonzero result requires the explicit own-lane comparison in the final evidence; it is not excused by the wrapper job exit.

### Registry value spot check

The prior 356-row probe grows to 399 after DCW adds its rows. The final probe was repeated on every exact lane tree with that tree's own readiness checker and registry. The validator uses one-based diagnostic row numbers; normalization maps those to stable family ids, preserving every other diagnostic field. **399 current diagnostics match own-tree records; zero new diagnostics.** This is a comparison of retained failures, not a passing registry certificate.

| Exact lane tree | Own failures | Current matching records |
|---|---|---|
| DO `525de6c2cd` | 0 | 0 |
| DX `d7f4bddfc7` | 0 | 0 |
| DCO `be7474cb7f` | 0 | 0 |
| DFM `3588540691` | 0 | 0 |
| DR `6c14c42433` | 0 | 0 |
| DDBG `fd5710a1d0` | 0 | 0 |
| DCN `913318b294` | 0 | 0 |
| DM `4cb6c1e44b` | 0 | 0 |
| DG6A `198ceb40d8` | 72 | 69 |
| DMEM `b429745ee3` | 11 | 8 |
| DS `32c260c53d` | 0 | 0 |
| DF `59f36b0a2b` | 0 | 0 |
| DCW `5ba43b5701` | 108 | 43 |
| DG6B `ea11e51a21` | 174 | 171 |
| DC `58a544186c` | 0 | 0 |
| DCH `81aff2aa2a` | 54 | 51 |
| DT `bce5208116` | 42 | 39 |
| DS15 `23b037b040` | 18 | 18 |

### Inherited registry diagnostics — lead disposition

Lead decision `1112102945-20bb`: carry explicitly uncredited; no owning-lane fixes tonight. **86 await an owner or retention decision; 313 are technical owning-lane fixes.** Every one of the 399 records is reproduced by its owning lane’s checker on that exact lane tree; zero records are new. The companion JSON lists every diagnostic, owner, kind, disposition and exact own-tree head.

DFM’s twelve full family CLIs, the B4 registry regression and the shared-runtime materializer are **not credited**: each emits only inherited diagnostics, with zero new, each reproduced by its own lane checker on its own tree. The materializer emits the pending-retention subset. No gate is filtered; no retention choice is invented. The Unicode byte-render repair is assessed separately from those inherited refusals.

| Owning lane | Kind | Count | Disposition | Example families |
|---|---|---|---|---|
| DCH | storage_value_secret_material_field | 17 | technical, owning-lane fix | dch_bundle_selection_forward_blocked_checkpoint, dch_bundle_selection_sent_to_chat_checkpoint, dch_chat_message_checkpoint |
| DCH | storage_value_secret_material_key | 34 | technical, owning-lane fix | dch_bundle_selection_forward_blocked_checkpoint, dch_bundle_selection_sent_to_chat_checkpoint, dch_chat_message_checkpoint |
| DCW | storage_value_registry_retention_policy_ref_unknown | 3 | awaiting an owner or retention decision | revision_run, wizard_open_evidence, wizard_seed_load_evidence |
| DCW | storage_value_registry_value_schema_id_const_mismatch | 5 | technical, owning-lane fix | revision_run, wizard_blocked_evidence, wizard_open_evidence |
| DCW | storage_value_registry_value_schema_not_closed | 5 | technical, owning-lane fix | revision_run, wizard_blocked_evidence, wizard_open_evidence |
| DCW | storage_value_registry_value_schema_required_property_missing | 25 | technical, owning-lane fix | revision_run, wizard_blocked_evidence, wizard_open_evidence |
| DCW | storage_value_registry_value_schema_version_const_mismatch | 5 | technical, owning-lane fix | revision_run, wizard_blocked_evidence, wizard_open_evidence |
| DG6A | storage_value_registry_required_fields_schema_mismatch | 4 | technical, owning-lane fix | alert_acknowledged_operation, alert_dismissed_operation, alert_rule_muted_operation |
| DG6A | storage_value_registry_retention_policy_ref_unknown | 33 | awaiting an owner or retention decision | alert_acknowledged_checkpoint, alert_acknowledged_operation, alert_dismissed_checkpoint |
| DG6A | storage_value_secret_material_field | 16 | technical, owning-lane fix | alert_acknowledged_checkpoint, alert_dismissed_checkpoint, alert_rule_muted_checkpoint |
| DG6A | storage_value_secret_material_key | 16 | technical, owning-lane fix | alert_acknowledged_checkpoint, alert_dismissed_checkpoint, alert_rule_muted_checkpoint |
| DG6B | storage_value_registry_required_field_absent_from_value_schema | 57 | technical, owning-lane fix | auth_github_authenticated_operation, auth_github_device_code_issued_operation, auth_github_disconnected_operation |
| DG6B | storage_value_registry_required_fields_schema_mismatch | 19 | technical, owning-lane fix | auth_github_authenticated_operation, auth_github_device_code_issued_operation, auth_github_disconnected_operation |
| DG6B | storage_value_registry_retention_policy_ref_unknown | 19 | awaiting an owner or retention decision | auth_github_authenticated_operation, auth_github_device_code_issued_operation, auth_github_disconnected_operation |
| DG6B | storage_value_registry_value_schema_id_const_mismatch | 19 | technical, owning-lane fix | auth_github_authenticated_operation, auth_github_device_code_issued_operation, auth_github_disconnected_operation |
| DG6B | storage_value_registry_value_schema_not_closed | 19 | technical, owning-lane fix | auth_github_authenticated_operation, auth_github_device_code_issued_operation, auth_github_disconnected_operation |
| DG6B | storage_value_registry_value_schema_not_object | 19 | technical, owning-lane fix | auth_github_authenticated_operation, auth_github_device_code_issued_operation, auth_github_disconnected_operation |
| DG6B | storage_value_registry_value_schema_version_const_mismatch | 19 | technical, owning-lane fix | auth_github_authenticated_operation, auth_github_device_code_issued_operation, auth_github_disconnected_operation |
| DMEM | storage_value_registry_retention_policy_ref_unknown | 8 | awaiting an owner or retention decision | memory_dedup_sweep_operation, memory_index_lexical_rebuild_operation, memory_index_lexical_selector |
| DS15 | storage_value_registry_retention_policy_ref_unknown | 18 | awaiting an owner or retention decision | dev_session_record, ds15_browser_context_captured_checkpoint, ds15_catalog_install_completed_checkpoint |
| DT | storage_value_registry_retention_policy_ref_unknown | 5 | awaiting an owner or retention decision | dt_requirements_clarification_requested_source, dt_usage_event_application_source, dt_usage_event_source |
| DT | storage_value_secret_material_field | 17 | technical, owning-lane fix | dt_approval_denied_checkpoint, dt_approval_granted_checkpoint, dt_approval_requested_checkpoint |
| DT | storage_value_secret_material_key | 17 | technical, owning-lane fix | dt_approval_denied_checkpoint, dt_approval_granted_checkpoint, dt_approval_requested_checkpoint |

### Guard evidence

DCW's restored-schema merge tree `9ddf08e2235cae25e5e57885d62286923d3fa4fa` matched the expected exits in all 36 verification phases. Its 167 guard reports match the lane archive exactly: 153 PASS, fourteen declared FAIL, 379/393 rows proved, no added masks or unrelated flips. The final Index-checkpoint restoration preserves DCW's runtime validation schema apart from root comment; the final eight family routes and 3,040 numeric routes pass. DF's approved `59f36b0a2b` full sweep is supplied by the lead: 175 tables, 355/355 credited rows proved, zero bad; OS01 remains uncredited, with schema-entailment and pair proofs. The final DCO sweep reports MISSING empty, fourteen PASS tables and 119/119; its content is verified, not merely exit 0.

## T198 nested-binding gate adoption


```json
{
  "approved_head": "f304bfaf64334fe5255ce49a295f4ae5cec443d6",
  "status": "VERIFIED",
  "reviews": [
    {
      "path": "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-NESTED/gpt-6.1-sol-max.md",
      "sha256": "05bdeddc5a836964878739f499fb43f58ee9cf038466dd0ba5b48cd6d2699276",
      "blind_caught": 20,
      "blind_total": 20,
      "verdict": "GATED"
    },
    {
      "path": "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-NESTED/gpt-6-astra-max.md",
      "sha256": "5250c88d2b3775da57f59de220a4f46c25f56ed053828480cb88c5a4656a7cb7",
      "blind_caught": 19,
      "blind_total": 20,
      "verdict": "GATED"
    }
  ],
  "T207": "A16 removes a redundant uppercase-Z pattern diagnostic; full format validation still rejects the committed suffix input. Nonblocking diagnostic-only tool-batch item; no acceptance false pass.",
  "dry_landing_before_merge": false,
  "required_reruns": [
    "scope-all self-test",
    "inventory gate",
    "datetime_validator"
  ],
  "rerun_status": "PASS",
  "merge_commit": "eb9618b2cf4b65ea10af89478052d9fee6c086db",
  "parent": "f9a49734f1d92197b0cbc4d57cbf7e4c68dc4253",
  "changed_paths": [
    "scripts/pm_event_datetime_inventory.py",
    "scripts/pm_event_datetime_mutations.json",
    "scripts/pm_event_datetime_nested_resources.json",
    "scripts/pm_event_datetime_selfcheck.py"
  ],
  "reruns": {
    "SHARED-datetime-inventory": {
      "label": "SHARED-datetime-inventory",
      "mode": "capped2G",
      "exit": 0,
      "seconds": 96,
      "max_rss_kb": 978196,
      "log": "/home/sittingmongoose/pm-scratch/ea-int2/checks/t198-gated-rerun-1/SHARED-datetime-inventory.log",
      "sha256": "aea67d829783ea2e8191dfa5e41c9c7df068ec3d14483c3cfc0ff5bb19b096e4"
    },
    "SHARED-datetime-runtime": {
      "label": "SHARED-datetime-runtime",
      "mode": "capped2G",
      "exit": 0,
      "seconds": 10,
      "max_rss_kb": 119832,
      "log": "/home/sittingmongoose/pm-scratch/ea-int2/checks/t198-gated-rerun-1/SHARED-datetime-runtime.log",
      "sha256": "3b2c1ad054eb03de8743d13e38ff6e4fa3e4f690a5c56fef410d22e9fd64bc5a"
    },
    "SHARED-numbers-all": {
      "label": "SHARED-numbers-all",
      "mode": "capped2G",
      "exit": 0,
      "seconds": 676,
      "max_rss_kb": 1147748,
      "log": "/home/sittingmongoose/pm-scratch/ea-int2/checks/t198-gated-rerun-1/SHARED-numbers-all.log",
      "sha256": "5f8ac03d616f91f25a96ce1724458946010238a975904f7c03cdf0de2a2cfd09"
    }
  },
  "six_DCH_nodes": {
    "datetime_node_402b80377457": true,
    "datetime_node_48e8e05a3597": true,
    "datetime_node_f19950f195f2": true,
    "datetime_node_ad9814f1ed36": true,
    "datetime_node_8b9436ec910b": true,
    "datetime_node_e311335df73f": true
  }
}
```

The gated reviews in `reviews/NUMRULE-NESTED/` are Sol max 20/20 and Astra max 19/20; both verdicts are GATED. Astra’s one diagnostic-only survivor is T207. The original six-node failure evidence is retained. The new scope-all run, inventory and datetime_validator results below determine STOP-T198 closure; no historical failed output is overwritten. T207 remains a nonblocking diagnostic-only tool-batch item.

## STOP-T198 closure


```json
{
  "status": "CLOSED",
  "scope_all_exit": 0,
  "case_passes": 13626,
  "inventory_nodes": 254,
  "original_failed_node_count": 6,
  "failed_node_count": 0,
  "resolved_by": "f304bfaf64334fe5255ce49a295f4ae5cec443d6",
  "merge": "eb9618b2cf4b65ea10af89478052d9fee6c086db",
  "proof": "reports/event-authority-20261112/INT2-T198-gated-final.json",
  "nonblocking_tool_item": "T207"
}
```

### Final-tree T198 proof

The gated rerun passes 13,626/13,626 cases and 1,276/1,276 owner flags, including all six previously failed DCH nodes. Inventory and the actual datetime_validator probe exit 0. The original failed log is retained byte-for-byte; the separate final receipt records its SHA-256 and the new results.


```json
{
  "status": "PASS_STOP_T198_CLOSED",
  "source_parent": "7b51beeb464509f68e139f0cd5fc4461a2b90a18",
  "source_candidate_tree_before_result_metadata": "91f8d601f3001386551985ec7e84c717ba880ef7",
  "gated_adoption": {
    "approved_head": "f304bfaf64334fe5255ce49a295f4ae5cec443d6",
    "status": "VERIFIED",
    "reviews": [
      {
        "path": "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-NESTED/gpt-6.1-sol-max.md",
        "sha256": "05bdeddc5a836964878739f499fb43f58ee9cf038466dd0ba5b48cd6d2699276",
        "blind_caught": 20,
        "blind_total": 20,
        "verdict": "GATED"
      },
      {
        "path": "/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-NESTED/gpt-6-astra-max.md",
        "sha256": "5250c88d2b3775da57f59de220a4f46c25f56ed053828480cb88c5a4656a7cb7",
        "blind_caught": 19,
        "blind_total": 20,
        "verdict": "GATED"
      }
    ],
    "T207": "A16 removes a redundant uppercase-Z pattern diagnostic; full format validation still rejects the committed suffix input. Nonblocking diagnostic-only tool-batch item; no acceptance false pass.",
    "dry_landing_before_merge": false,
    "required_reruns": [
      "scope-all self-test",
      "inventory gate",
      "datetime_validator"
    ],
    "rerun_status": "PASS",
    "merge_commit": "eb9618b2cf4b65ea10af89478052d9fee6c086db",
    "parent": "f9a49734f1d92197b0cbc4d57cbf7e4c68dc4253",
    "changed_paths": [
      "scripts/pm_event_datetime_inventory.py",
      "scripts/pm_event_datetime_mutations.json",
      "scripts/pm_event_datetime_nested_resources.json",
      "scripts/pm_event_datetime_selfcheck.py"
    ],
    "reruns": {
      "SHARED-datetime-inventory": {
        "label": "SHARED-datetime-inventory",
        "mode": "capped2G",
        "exit": 0,
        "seconds": 96,
        "max_rss_kb": 978196,
        "log": "/home/sittingmongoose/pm-scratch/ea-int2/checks/t198-gated-rerun-1/SHARED-datetime-inventory.log",
        "sha256": "aea67d829783ea2e8191dfa5e41c9c7df068ec3d14483c3cfc0ff5bb19b096e4"
      },
      "SHARED-datetime-runtime": {
        "label": "SHARED-datetime-runtime",
        "mode": "capped2G",
        "exit": 0,
        "seconds": 10,
        "max_rss_kb": 119832,
        "log": "/home/sittingmongoose/pm-scratch/ea-int2/checks/t198-gated-rerun-1/SHARED-datetime-runtime.log",
        "sha256": "3b2c1ad054eb03de8743d13e38ff6e4fa3e4f690a5c56fef410d22e9fd64bc5a"
      },
      "SHARED-numbers-all": {
        "label": "SHARED-numbers-all",
        "mode": "capped2G",
        "exit": 0,
        "seconds": 676,
        "max_rss_kb": 1147748,
        "log": "/home/sittingmongoose/pm-scratch/ea-int2/checks/t198-gated-rerun-1/SHARED-numbers-all.log",
        "sha256": "5f8ac03d616f91f25a96ce1724458946010238a975904f7c03cdf0de2a2cfd09"
      }
    },
    "six_DCH_nodes": {
      "datetime_node_402b80377457": true,
      "datetime_node_48e8e05a3597": true,
      "datetime_node_f19950f195f2": true,
      "datetime_node_ad9814f1ed36": true,
      "datetime_node_8b9436ec910b": true,
      "datetime_node_e311335df73f": true
    }
  },
  "scope_all": {
    "exit": 0,
    "case_passes": 13626,
    "corpus_cases": 13626,
    "positives": 6939,
    "negatives": 6687,
    "owner_checks": 1276,
    "owner_checks_passed": 1276,
    "failures": [],
    "six_previously_failed_nodes": {
      "datetime_node_402b80377457": true,
      "datetime_node_48e8e05a3597": true,
      "datetime_node_f19950f195f2": true,
      "datetime_node_ad9814f1ed36": true,
      "datetime_node_8b9436ec910b": true,
      "datetime_node_e311335df73f": true
    }
  },
  "inventory": {
    "status": "pass",
    "nodes": 254,
    "storage_nodes": 141,
    "other_owner_nodes": 102,
    "wildcard_non_timestamp_nodes": 3,
    "wildcard_non_timestamp_role_nodes": 8,
    "unclassified_nodes": 0,
    "failures": []
  },
  "datetime_validator": {
    "constructor": "datetime_validator(EventRecord schema, profile=EVENT_RECORD)",
    "baseline": true,
    "cv253": [
      {
        "field": "occurred_at_utc",
        "input": "2026-11-12T01:02:03+00:00",
        "raw_schema_accepts": true,
        "datetime_validator_accepts": true,
        "expected": true,
        "errors": []
      },
      {
        "field": "observed_at_utc",
        "input": "2026-11-12T01:02:03+00:00",
        "raw_schema_accepts": true,
        "datetime_validator_accepts": false,
        "expected": false,
        "errors": [
          {
            "message": "'2026-11-12T01:02:03+00:00' does not match 'Z(?![\\\\s\\\\S])'",
            "cause": null
          }
        ]
      },
      {
        "field": "persisted_at_utc",
        "input": "2026-11-12T01:02:03+00:00",
        "raw_schema_accepts": true,
        "datetime_validator_accepts": false,
        "expected": false,
        "errors": [
          {
            "message": "'2026-11-12T01:02:03+00:00' does not match 'Z(?![\\\\s\\\\S])'",
            "cause": null
          }
        ]
      }
    ]
  },
  "refresh": {
    "root": "/home/sittingmongoose/pm-scratch/ea-int2/clean",
    "rows_changed": 0,
    "by_kind": {},
    "rows": [],
    "storage_pointer_citation_changes": [],
    "validation_errors_after_projection": [],
    "inventory_self_pin": {
      "before": "3a3b6d33291f64893eb259779f9fba8c45b2de80a08c95485dc2f182d94c8a11",
      "after": "3a3b6d33291f64893eb259779f9fba8c45b2de80a08c95485dc2f182d94c8a11"
    },
    "scan": {
      "nodes": 254,
      "errors": [],
      "unclassified": [],
      "missing": []
    }
  },
  "exclusion_changes": {
    "before": 640,
    "removed": 0,
    "added": 19,
    "after": 659
  },
  "obsolete_exclusions_pruned": 19,
  "file_sha256": {
    "Plans/event_datetime_inventory.json": "8e285a102105d3e055fa377251c723c16571f368b5d56b58d1038a5f840b6ccb",
    "scripts/pm_event_datetime_exclusions.json": "f966386ef526f57d6cd589675b8114f7c647c804adcf50bd46048704dde7761b",
    "scripts/pm_event_datetime_roles.json": "44ab6f4046133ff2d54fa01e935df48a12d991b0d7904382b23bc540ca98a279",
    "scripts/pm_event_datetime_mutations.json": "3d146db3854d35f170e22795c1b5e976011d43c1c867db5b8e40b2f04c434f95",
    "scripts/pm_event_datetime_node_controls.json": "97fdd69a8001a41f6b4fd0098b0b08d22ebe155ba6342e60965b77a12745e1f2",
    "scripts/pm_event_datetime_inventory.py": "bf987821c143b004bdd422ceba99631a5600b2a4662a2280cef16ced7d7a013f",
    "scripts/pm_event_datetime_selfcheck.py": "7881ae9c2b36985199a1dcbd412c8c510c3e383936d29dccc6548cd688266be2",
    "scripts/pm_event_datetime_nested_resources.json": "52896247a15322cdb7825e2b1b157946311dd49e0f46267ed29847f8f7ffd2aa",
    "Plans/storage_value_registry.json": "7a046f5c594c7eca40fec58a6daa27e0528b8291b43e4181a9cccb22e02d1f96",
    "Plans/dch_retained_recipes.json": "619a069ee7c78b8fba1c37b4e4b93285d2912165ad5196811a8a32cae84370d1"
  },
  "historic_failure_preserved": {
    "exit": 1,
    "case_passes": 13626,
    "corpus_cases": 13626,
    "inventory": {
      "failures": [],
      "nodes": 254,
      "other_owner_nodes": 102,
      "status": "pass",
      "storage_nodes": 141,
      "unclassified_nodes": 0,
      "wildcard_non_timestamp_nodes": 3,
      "wildcard_non_timestamp_role_nodes": 8
    },
    "failures": [
      {
        "integration_check": "datetime_node_402b80377457"
      },
      {
        "integration_check": "datetime_node_48e8e05a3597"
      },
      {
        "integration_check": "datetime_node_f19950f195f2"
      },
      {
        "integration_check": "datetime_node_ad9814f1ed36"
      },
      {
        "integration_check": "datetime_node_8b9436ec910b"
      },
      {
        "integration_check": "datetime_node_e311335df73f"
      }
    ],
    "log": "/home/sittingmongoose/pm-scratch/ea-int2/checks/final-85/SHARED-numbers-all.log",
    "sha256": "dd5c6fe845a3c050c2cc70fba916c5b73e158a8af40a90fec0beecdda0c53592"
  },
  "source_scope": "Exact tracked candidate in full clean worktree;ignored binary audit PNGs in full landing int2 remain the separately reported T1 limitation.",
  "no_hand_edited_NUMRULE_source": true,
  "native_execution": "NOT_RUN"
}
```

### Final-tree supporting replays

The Unicode byte-render unit passes. The 36-test shared-runtime replay has only two inherited failures (registry diagnostics and the pending-retention materializer), explicitly uncredited. The complete 399-record diagnostic multiset is unchanged. These final replays are also the current results where they repeat a prepared command.

| Final replay | Exit | Disposition |
|---|---|---|
| POST-unit-preservation | 0 | PASS |
| POST-graphs | 0 | PASS |
| POST-custody | 0 | PASS |
| POST-registry-diagnostics | 0 | PASS |
| POST-Q5 | 0 | PASS |
| POST-DG6A-audit-grade | 0 | PASS |
| POST-shard-check | 0 | PASS |
| POST-registry-render | 0 | PASS |
| POST-shared-runtime | 1 | Lead carry; not credited |

## Dry landing check


```json
{
  "environment": {
    "PYTHONINTMAXSTRDIGITS": "0",
    "TMPDIR": "/home/sittingmongoose/pm-scratch/ea-int2/tmp"
  },
  "parser_reason": "Permit the committed 4400-digit valid JSON witness to reach unchanged semantic validators; no gate filtering.",
  "command": [
    "python3",
    "scripts/pm-landing-check.py",
    "--base",
    "origin/main",
    "--json",
    "--keep-check-reports",
    "/home/sittingmongoose/pm-scratch/ea-int2/checks/landing-dry-20261112T133710Z/subchecks",
    "--readiness-audit-root",
    "/home/sittingmongoose/pm-worktrees/int2/Plans/.audits/event-authority-2026-08-13-currentness"
  ],
  "head": "d91213ff98da70921a826362b2cf2c6df9baee06",
  "base": "2880dfc517a672e5cb18a47f9a8ed45e70a1c3b5",
  "full_worktree": true,
  "exit": 2,
  "seconds": 2432.68,
  "start_available_GiB": 17.565,
  "max_child_rss_kb": 963268,
  "report": "/home/sittingmongoose/pm-scratch/ea-int2/checks/landing-dry-20261112T133710Z/report.json",
  "stderr": "/home/sittingmongoose/pm-scratch/ea-int2/checks/landing-dry-20261112T133710Z/stderr.log",
  "report_keys": [
    "base",
    "baseline_commit",
    "baseline_currency",
    "blocking",
    "branch_paths",
    "branch_units",
    "checks",
    "commit",
    "derived_paths_excluded",
    "excused_by_kind",
    "exports",
    "generated_at_utc",
    "grown_buckets",
    "grown_subchecks",
    "infrastructure",
    "kept_check_reports",
    "new",
    "on_branch",
    "pre_existing",
    "readiness_audit_inputs",
    "readiness_audit_source",
    "rename_excuse_lost",
    "resolved_buckets",
    "schema_id",
    "subcheck_timeout_seconds",
    "subchecks_compared_by_total_only",
    "validator_pairs"
  ],
  "status": "BLOCKED_INHERITED_REGISTRY",
  "blocking_count": 800,
  "remaining_only_inherited_registry": true,
  "new_registry_diagnostics": 0,
  "infrastructure": [],
  "first_dry": {
    "command": [
      "python3",
      "scripts/pm-landing-check.py",
      "--base",
      "origin/main",
      "--json",
      "--keep-check-reports",
      "/home/sittingmongoose/pm-scratch/ea-int2/checks/landing-dry-20261112T121020Z/subchecks",
      "--readiness-audit-root",
      "/home/sittingmongoose/pm-worktrees/int2/Plans/.audits/event-authority-2026-08-13-currentness"
    ],
    "head": "85f80cebf3b09eb7e2d80d0d21c167ea6da29a1b",
    "base": "2880dfc517a672e5cb18a47f9a8ed45e70a1c3b5",
    "full_worktree": true,
    "exit": 2,
    "seconds": 2267.54,
    "start_available_GiB": 20.231,
    "max_child_rss_kb": 963584,
    "report": "/home/sittingmongoose/pm-scratch/ea-int2/checks/landing-dry-20261112T121020Z/report.json",
    "stderr": "/home/sittingmongoose/pm-scratch/ea-int2/checks/landing-dry-20261112T121020Z/stderr.log",
    "report_keys": [
      "base",
      "baseline_commit",
      "baseline_currency",
      "blocking",
      "branch_paths",
      "branch_units",
      "checks",
      "commit",
      "derived_paths_excluded",
      "excused_by_kind",
      "exports",
      "generated_at_utc",
      "grown_buckets",
      "grown_subchecks",
      "infrastructure",
      "kept_check_reports",
      "new",
      "on_branch",
      "pre_existing",
      "readiness_audit_inputs",
      "readiness_audit_source",
      "rename_excuse_lost",
      "resolved_buckets",
      "schema_id",
      "subcheck_timeout_seconds",
      "subchecks_compared_by_total_only",
      "validator_pairs"
    ]
  },
  "after_gated_numrule_merge": true,
  "rerun_reason": "First dry identified source references and the parser limit; rerun verifies those repairs. Both dry runs were after the gated NUMRULE merge.",
  "proof": "landing-final-summary.json",
  "baseline_currency": {
    "age_days": 0.06,
    "ancestor": true,
    "base": "origin/main",
    "base_commit": "2880dfc517a672e5cb18a47f9a8ed45e70a1c3b5",
    "baseline_commit": "77e87db4d89b9b04732997152b24831c3667ce9c",
    "max_age_days": 7,
    "reason": "its commit 77e87db4d89b is an ancestor of the base origin/main (2880dfc517a6) and 0.06 days older than it, within 7",
    "rule_two_applies": true
  }
}
```

Every blocking diagnostic remains visible. The companion `landing-final-summary.json` retains every blocking record and its exact own-lane reproduction. No baseline was refreshed and no gate or retention choice was filtered.

| Aggregate check | Kind | Records |
|---|---|---|
| audit-governance | implementation_readiness_self_tests_failed | 1 |
| audit-governance | storage_value_registry_required_field_absent_from_value_schema | 57 |
| audit-governance | storage_value_registry_required_fields_schema_mismatch | 23 |
| audit-governance | storage_value_registry_retention_policy_ref_unknown | 86 |
| audit-governance | storage_value_registry_value_schema_id_const_mismatch | 24 |
| audit-governance | storage_value_registry_value_schema_not_closed | 24 |
| audit-governance | storage_value_registry_value_schema_not_object | 19 |
| audit-governance | storage_value_registry_value_schema_required_property_missing | 25 |
| audit-governance | storage_value_registry_value_schema_version_const_mismatch | 24 |
| audit-governance | storage_value_secret_material_field | 50 |
| audit-governance | storage_value_secret_material_key | 67 |
| run-gates | implementation_readiness_self_tests_failed | 1 |
| run-gates | storage_value_registry_required_field_absent_from_value_schema | 57 |
| run-gates | storage_value_registry_required_fields_schema_mismatch | 23 |
| run-gates | storage_value_registry_retention_policy_ref_unknown | 86 |
| run-gates | storage_value_registry_value_schema_id_const_mismatch | 24 |
| run-gates | storage_value_registry_value_schema_not_closed | 24 |
| run-gates | storage_value_registry_value_schema_not_object | 19 |
| run-gates | storage_value_registry_value_schema_required_property_missing | 25 |
| run-gates | storage_value_registry_value_schema_version_const_mismatch | 24 |
| run-gates | storage_value_secret_material_field | 50 |
| run-gates | storage_value_secret_material_key | 67 |

### Verification after dry-run repairs

| Replay | Exit | Seconds | Output SHA-256 |
|---|---|---|---|
| GEN-shards | 0 | 3 | b2a3f730d2987b0062645349ba4ee1408b8aab0c9610eef3d63a975fa3c3b721 |
| GEN-index | 0 | 37 | 3670ed68ebd4f0edfc27aa513e67aa615264d4db17d2abe88eda1509a86cd420 |
| GEN-shard-check | 0 | 26 | 2b26beb20c5bc66b79cb8a75b5656199b21559338b2e1df44d273c2d9517ccff |
| SURFACES-lint | 0 | 6 | c3029e361d2b699753506e7132f244136cb52de4ff529f9629f16664b012989f |
| JSON-syntax | 0 | 16 | 4d3773cd82254441ba5938b40ed9a471e28be23d143b194bb17309334ac80433 |
| USAGE-contract | 0 | 14 | ea3a8368f05f17eb47ed47dbdb024077203cc62da2e8ba6258327408b27d2bc1 |
| DG6A-audit | 0 | 6 | 60f40f9e80b9dca3de67162b825d7b89b0bf042ec81d4d79d7241dd30da0498b |
| DR-checker | 0 | 1073 | 17eb718392c5e22a91f32edcc0671b151088f74428417c57f8f9869a9ce4d404 |
| FIX-envelope-scan | 0 | 1 | d41f588e6c4bf79a6e369dda4b3a8a1d02dccbac0a2bd907fe6b62b5413fa5fb |
| SYNC-clean | 0 | 1 | a16d13b910df941d334c181dfc0919e763e338f21fbf32dd96ed9c4ec49ee249 |
| T198-prune | 0 | 1 | aad9e20aa30ed72185a4da94337a32fd4444e84c42d96013677fe0e54e4edbd1 |
| T198-classify | 0 | 95 | ce3ddcb8b1776fef6583334b296f974a5727a0cf7349e3eb36f0988dd3980d19 |
| T198-refresh | 0 | 121 | c88ef89e3110262b8e29d07176fd23b1864142532fed3fb063c05d9c473c0edc |
| SYNC-inventory | 0 | 0 | 35da320e39dd549264323a28efd8648055626e93137c1bfe52117fa3cd4fe0a0 |
| SHARED-datetime-inventory | 0 | 109 | aea67d829783ea2e8191dfa5e41c9c7df068ec3d14483c3cfc0ff5bb19b096e4 |
| SHARED-datetime-runtime | 0 | 9 | 3b2c1ad054eb03de8743d13e38ff6e4fa3e4f690a5c56fef410d22e9fd64bc5a |
| SHARED-numbers-all | 0 | 661 | 5f8ac03d616f91f25a96ce1724458946010238a975904f7c03cdf0de2a2cfd09 |
| FIX-unit-preservation | 0 | 1 | 562de35609c2dae70705e883dd6c3cba1edfc94e69c0aef2a0bb3a07d55a52e2 |
| FIX-custody | 0 | 1 | b121612d035cb188c108064cf0180e46fcf5bb866aebf852191cda3dd6d79359 |
| FIX-graphs | 0 | 2 | b2a75f4e1979bcebffa9588d273acfabd76bd3f30b345ad8e11c2d97cdbf5671 |


```json
{
  "status": "PASS",
  "source_parent": "85f80cebf3b09eb7e2d80d0d21c167ea6da29a1b",
  "parser_environment": {
    "PYTHONINTMAXSTRDIGITS": "0"
  },
  "fixture_unchanged": true,
  "T198": {
    "scope_all_exit": 0,
    "case_passes": 13626,
    "owner_flags": 1276,
    "owner_flags_passed": 1276,
    "inventory_nodes": 254,
    "new_inventory_nodes": 0,
    "source_projection_changes": 0,
    "datetime_validator_exit": 0
  },
  "classification": {
    "before": 659,
    "removed": 169,
    "added": 169,
    "after": 659
  },
  "gate_filtering": false,
  "registry_owner_fixes": false,
  "grades_changed": false,
  "surface_paths_corrected": 16,
  "canonical_envelope_joins_clarified": 18,
  "line_counts_unchanged": true,
  "full_proof": "landing-fix-verification.json"
}
```

## Admission readiness — no admissions

All 248 exact families are listed. Counts are the lane self-grade cells, not a new integration grade. All native execution remains NOT_RUN. Shared T198 prerequisites are satisfied; the original lane cells are not self-upgraded. Separate batch reviews and the remaining owner obligations remain required. The blocker column names non-PASS cells; the companion JSON retains the full findings and gaps. The five DS membership PASS cells concern existing admitted rows. The other 243 memberships remain ABSENT. No registry or admission decision is written here.

| Lane | Family | Own grade | Membership | Own outcome | Before admission |
|---|---|---|---|---|---|
| DO | config.validation.failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | crew.board_message_posted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | crew.board_message_read | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | crew.board_messages_archived | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | parser.error | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | phase.force_completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.budget_warning | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.cancelled | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.context_warning | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.escalated | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.message_received | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.message_sent | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.model_switched | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.output_truncated | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.paused | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.progress | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.resumed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.retried | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.spawned | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.timeout | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.tool_called | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DO | subagent.tool_completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared without admission) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | auth.github.authenticated | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | auth.github.device_code.issued | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | auth.github.disconnected | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | auth.github.failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | auth.github.token.polling | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | plugin.hook.blocked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | plugin.hook.error | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | plugin.hook.invoked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | plugin.load_failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | plugin.loaded | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | plugin.permission.override | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | plugin.tool.collision | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | plugin.tool.registered | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | persona.created | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | persona.deleted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | persona.exported | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | persona.imported | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | persona.selected | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6B | persona.updated | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DDBG | debug.investigation.context_item_added | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DDBG | debug.investigation.context_item_state_changed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DDBG | debug.investigation.exported | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DDBG | debug.investigation.imported | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DDBG | debug.investigation.instrumentation_state_changed | 11 PASS / 1 ABSENT | ABSENT | prepared_without_admission | membership_version; integrated review pending |
| DDBG | debug.investigation.started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DDBG | debug.investigation.target_bound | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DDBG | debug.investigation.verification_recorded | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DDBG | debug.investigation.state_changed | 11 PASS / 1 ABSENT | ABSENT | prepared_without_admission | membership_version; integrated review pending |
| DC | collaboration.created | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.paused | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.resumed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.cancelled | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.completed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.failed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.participant_started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.participant_completed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.message_added | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.artifact_added | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | collaboration.configuration_changed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | brainstorm.proposal_added | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | brainstorm.vote_added | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | brainstorm.plan_synthesized | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | review.finding_added | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | review.finding_dispositioned | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DC | review.artifact_finalized | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, positive_negative_oracles; integrated review pending |
| DT | approval.requested | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | approval.granted | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | approval.denied | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | approval.timeout | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | config.migrated | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | gate.evaluation_started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | gate.failed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | gate.passed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | requirements.clarification_requested | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, retention, positive_negative_oracles; integrated review pending |
| DT | run.background_enqueued | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | tool.denied | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | tool.execution_completed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | tool.execution_started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | tool.invoked | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, positive_negative_oracles; integrated review pending |
| DT | usage.event | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, retention, positive_negative_oracles; integrated review pending |
| DT | worktree.created | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, retention, positive_negative_oracles; integrated review pending |
| DT | worktree.deleted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission_review_pending | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | bundle.selection_forward_blocked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | bundle.selection_sent_to_chat | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.message | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_archived | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_created | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_deleted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_bound | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_create_failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_merge_failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_merged | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_pr_created | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_pr_failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_pre_merge_test_failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_pre_merge_test_passed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_pre_merge_test_started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_renamed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.thread_worktree_unbound | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCH | chat.response_stop_requested | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_pending_retention_and_native_cutover | membership_version, retention, positive_negative_oracles; integrated review pending |
| DX | attempt.completed | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | attempt.started | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | node.blocked | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | node.completed | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | node.started | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | node.unblocked | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | plan.decomposition_degraded | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | remediation.resolved | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | remediation.spawned | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | run.completed | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | run.graph_integrity_failed | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | run.node_backoff_expired | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | run.node_backoff_started | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | run.node_ready | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | run.node_retry_scheduled | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DX | scheduler.pass | 11 PASS / 1 ABSENT | ABSENT | technical contract prepared without admission | membership_version; integrated review pending |
| DMEM | memory.dedup_sweep.completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.dedup_sweep.started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.index.lexical.rebuild.completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.index.lexical.rebuild.started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.index.semantic.rebuild.completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.index.semantic.rebuild.started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.verification_sweep.completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.verification_sweep.started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.monthly_summary.completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.monthly_summary.started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.prune_archive.completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DMEM | memory.prune_archive.started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention, positive_negative_oracles; integrated review pending |
| DS15 | browser.context_captured | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | browser.context_share_revoked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DS15 | browser.context_shared | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DS15 | catalog.install.completed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | catalog.install.started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | catalog.remove.completed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, positive_negative_oracles; integrated review pending |
| DS15 | catalog.remove.started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, positive_negative_oracles; integrated review pending |
| DS15 | catalog.update.completed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, positive_negative_oracles; integrated review pending |
| DS15 | catalog.update.started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, positive_negative_oracles; integrated review pending |
| DS15 | dev.session.restarting | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | dev.session.started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | dev.session.stopped | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | dev.session.stopping | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | doctor.custom_headless.checked | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | live.artifact.created | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | live.session.completed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | live.session.degraded | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | live.session.started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | live.step.updated | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | preview.session.refreshed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | preview.session.started | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | preview.session.stopped | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, retention; integrated review pending |
| DS15 | tool.custom_headless.skipped | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepared_without_admission | membership_version, positive_negative_oracles; integrated review pending |
| DG6A | alert.acknowledged | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | alert.dismissed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | alert.rule_muted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | alert.snoozed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | bundle.annotation_state_changed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | historical-only (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | bundle.note_created | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | bundle.note_status_changed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | concern.assigned | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | concern.created | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | concern.evidence_linked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | concern.promoted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | concern.reopened | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | concern.resolved | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | concern.updated | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | panel.redocked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DG6A | panel.undocked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCN | browser.session.created | 11 PASS / 1 ABSENT | ABSENT | PREPARED_WITHOUT_ADMISSION | membership_version; integrated review pending |
| DCN | browser.session.state_changed | 11 PASS / 1 ABSENT | ABSENT | PREPARED_WITHOUT_ADMISSION | membership_version; integrated review pending |
| DCN | browser.session.closed | 11 PASS / 1 ABSENT | ABSENT | PREPARED_WITHOUT_ADMISSION | membership_version; integrated review pending |
| DCN | browser.session.promoted | 11 PASS / 1 ABSENT | ABSENT | PREPARED_WITHOUT_ADMISSION | membership_version; integrated review pending |
| DCN | browser.session.takeover_state_changed | 11 PASS / 1 ABSENT | ABSENT | PREPARED_WITHOUT_ADMISSION | membership_version; integrated review pending |
| DCN | memory.gist_state_changed | 11 PASS / 1 ABSENT | ABSENT | PREPARED_WITHOUT_ADMISSION | membership_version; integrated review pending |
| DFM | file.copied | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | file.created | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | file.deleted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | file.exported | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | file.moved | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | file.renamed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | folder.copied | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | folder.created | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | folder.deleted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | folder.exported | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | folder.moved | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DFM | folder.renamed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | CURRENT_WRITER | membership_version, retention, positive_negative_oracles; integrated review pending |
| DM | format.applied | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention; integrated review pending |
| DM | git.clone.completed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention; integrated review pending |
| DM | lsp.server.lifecycle_changed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention; integrated review pending |
| DM | model.catalog_refreshed | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention; integrated review pending |
| DM | project.added | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention; integrated review pending |
| DM | project.created | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register_prepared | membership_version, retention; integrated review pending |
| DM | settings.theme.updated | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE | ABSENT | retired | Retired; no admission proposed |
| DM | settings.updated | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE | ABSENT | retired | Retired; no admission proposed |
| DM | subagent.context_rehydrated | 11 PASS / 1 ABSENT | ABSENT | register_prepared | membership_version; integrated review pending |
| DM | subagent.context_shrunk | 11 PASS / 1 ABSENT | ABSENT | register_prepared | membership_version; integrated review pending |
| DS | context.compaction.completed | 11 PASS / 1 PARTIAL | PASS | CURRENT_WRITER | positive_negative_oracles; integrated review pending |
| DS | browser.workspace.created | 11 PASS / 1 PARTIAL | PASS | CURRENT_WRITER | positive_negative_oracles; integrated review pending |
| DS | browser.workspace.reset | 11 PASS / 1 PARTIAL | PASS | CURRENT_WRITER | positive_negative_oracles; integrated review pending |
| DS | workspace.layout_changed | 11 PASS / 1 PARTIAL | PASS | CURRENT_WRITER | positive_negative_oracles; integrated review pending |
| DS | terminal.workgroup_moved | 11 PASS / 1 PARTIAL | PASS | HISTORICAL_ONLY | positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.api_web_call | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.artifact_version | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.before_after_snapshot | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.browser_recording | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.code_diff | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.context_snapshot | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.cost_usage | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.document | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.evidence | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.failed_attempts | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.hitl_approval | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.implementation_plan | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.reasoning_summary | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.restore_point | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.screenshot | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.subagent_lineage | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.suggested_next_steps | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.tool_llm_trace | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DR | runtime_artifact.validation_test | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | register (prepared) | membership_version, positive_negative_oracles; integrated review pending |
| DCW | bundle.revision_requested | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCW | bundle.revision_started | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCW | bundle.revision_completed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCW | bundle.revision_interrupted | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCW | wizard.blocked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCW | wizard.deferred_payload.loaded | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCW | wizard.opened | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DCW | wizard.unblocked | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | register_prepared_without_admission | membership_version, retention, positive_negative_oracles; integrated review pending |
| DF | filesafe.command_denied | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DF | filesafe.destructive_override_denied | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DF | filesafe.destructive_override_granted | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, positive_negative_oracles; integrated review pending |
| DF | filesafe.destructive_override_requested | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DF | filesafe.guard_init_failed | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DF | filesafe.path_denied | 9 PASS / 2 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, retention, positive_negative_oracles; integrated review pending |
| DF | filesafe.policy_degraded | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, positive_negative_oracles; integrated review pending |
| DF | safe_point.created | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, positive_negative_oracles; integrated review pending |
| DF | safe_point.restored | 10 PASS / 1 PARTIAL / 1 ABSENT | ABSENT | prepare (sweep part 2A and 2B numbers complete; part 2B timestamps and review pending; individual admission absent) | membership_version, positive_negative_oracles; integrated review pending |
| DCO | coordination.agent_aborted | 11 PASS / 1 ABSENT | ABSENT | prepared without admission | membership_version; integrated review pending |
| DCO | coordination.agent_crashed | 11 PASS / 1 ABSENT | ABSENT | prepared without admission | membership_version; integrated review pending |
| DCO | coordination.agent_file_ownership_updated | 11 PASS / 1 ABSENT | ABSENT | prepared without admission | membership_version; integrated review pending |
| DCO | coordination.agent_operation_updated | 11 PASS / 1 ABSENT | ABSENT | prepared without admission | membership_version; integrated review pending |
| DCO | coordination.agent_status_updated | 11 PASS / 1 ABSENT | ABSENT | prepared without admission | membership_version; integrated review pending |
| DCO | coordination.agent_unregistered | 11 PASS / 1 ABSENT | ABSENT | prepared without admission | membership_version; integrated review pending |

### Additional excluded and conditional-retirement labels

These fourteen touched labels have disposition/application records rather than twelve-cell self-grades. They supplement the 248 graded rows above (262 distinct touched labels total). No membership or denominator change is made.

| Lane | Exact label | Readiness / disposition | Authority | Remaining |
|---|---|---|---|---|
| DCN | browser.session.navigated | EXCLUDED; no admission proposed | DL-405; Plans/storage-plan.md:1309 | No new admission proposed. |
| DCN | browser.session.resized | EXCLUDED; no admission proposed | DL-405; Plans/storage-plan.md:1309 | No new admission proposed. |
| DCN | memory.gist.verification_requested | EXCLUDED; no admission proposed | DL-407; Plans/assistant-memory-subsystem.md:3180 | No new admission proposed. |
| DCN | memory.gist.verified | EXCLUDED; no admission proposed | DL-407; Plans/assistant-memory-subsystem.md:3180 | No new admission proposed. |
| DCN | memory.gist.verification_failed | EXCLUDED; no admission proposed | DL-407; Plans/assistant-memory-subsystem.md:3180 | No new admission proposed. |
| DCN | memory.gist.updated | EXCLUDED; no admission proposed | DL-407; Plans/assistant-memory-subsystem.md:3180 | No new admission proposed. |
| DCN | memory.gist.pinned | EXCLUDED; no admission proposed | DL-407; Plans/assistant-memory-subsystem.md:3180 | No new admission proposed. |
| DCN | memory.gist.unpinned | EXCLUDED; no admission proposed | DL-407; Plans/assistant-memory-subsystem.md:3180 | No new admission proposed. |
| DCN | memory.gist.discarded | EXCLUDED; no admission proposed | DL-407; Plans/assistant-memory-subsystem.md:3180 | No new admission proposed. |
| DCN / DS | dashboard.widget_added | EXCLUDED; no admission proposed | DL-180; Plans/UI_Command_Catalog.md:16975 | No new admission proposed. |
| DCN / DS | coordination.debug_mirror_exported | EXCLUDED; no admission proposed | DL-270; Plans/storage-plan.md:553 | No new admission proposed. |
| DCH | chat_run.cancel_requested | CUTOVER_PENDING; conditional retirement inactive | DL-406, DL-427 | Replacement retention/materialization plus native restart AND recovery verification; preserve existing history and both queue barriers. |
| DCH | chat_run.cancelled | CUTOVER_PENDING; conditional retirement inactive | DL-406, DL-427 | Replacement retention/materialization plus native restart AND recovery verification; preserve existing history and both queue barriers. |
| DCH | chat_run.cancel_timeout | CUTOVER_PENDING; conditional retirement inactive | DL-406, DL-427 | Replacement retention/materialization plus native restart AND recovery verification; preserve existing history and both queue barriers. |

## Landing note draft for the lead

Record Jared's two T32 answers together in the landing note: **"Approve (Recommended)"**, 2026-11-09 about 01:30Z through pm7-build (`1109012703-9a0e`), for the conditions that the old shard existed at base, the branch touched no evidence file in commits or worktree, and rename detection is disabled; other cases still block. Approved head was `a960ec98df`. His second answer, 2026-11-09 17:05Z, was **"Small fix, recheck + Sol max (Recommended)"**. Final change `ec84baffd0` passed 192/192 tests, Sol high and Sol max (17:54Z); no second Astra was required for that small fix. The integrated batch still receives the lead's Sol max and Astra max review.

CA-SEAL/CA-SEAL2 must land as one reviewed composition, with the actual lander recorded and a separate seal applier:

1. Finalize the third receipt on a tree containing the third validator `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91` (`17c842445a`) and DL-412, using `drafts/CA-SEAL/scripts/write_multifamily_receipt.py TREE --lander ACTUAL_LANDER_TASK`. Do **not** run that writer against this assembled fourth-validator tree.
2. Bring those finalized third-receipt bytes into the landing tree, apply/retain CA-SEAL2's fourth validator, then run `python3 -I -B reports/event-authority-20261105/write_recount_receipt.py LANDINGTREE --lander ACTUAL_LANDER_TASK`. The fourth receipt pins the finalized third receipt and the actual fourth executable.
3. Mail claude-projects-refresh the final head **before scheduling the landing**. They add two exact final-byte SHA-256 entries under `Plans/Spec_Lock.json` `canonical_ssot_hashes.files`, as a separate commit: `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json` (DL-412) and `reports/event-authority-20261105/seal-check-recount-receipt.json` (DL-451). They run `verify-spec-lock` with E's validator. Land both anchors and validator changes together. Any receipt-byte change requires redoing their entries.
4. Apply `drafts/CA-SEAL/test-patch/test_event_authority_holding_bucket.dl412.patch` in its own commit only after DL-413's ignore line is on main; omission turns the test's two failures into 41. INT2 changes no ignore rule.
5. The seal applier must exclude the author, actual lander, stream lead, CA-SEAL, FIX1–FIX8, CA-SEAL2, FIX1–FIX6 and every other fix worker. Author and lander are barred from applying the seal; the approved model does not require them to differ from one another. The lead arranges Sol then Astra before landing and immediately after.

The dry landing parser setting is also required at landing: use `PYTHONINTMAXSTRDIGITS=0` with the full-tree landing command so the intentional 4,400-digit witness reaches the unchanged JSON and usage validators. This does not clear the carried registry gates. Resolve the reported dry blockers before a landing; a carry decision does not make this an exit-0 run.

The lander alone takes the landing lock, performs the full-tree pre-push check, pushes main, then makes the separate snapshot-current/baseline follow-up. Governance staleness from changed owner documents is a later reseal request, not an INT2 reseal. Keep this worktree for review fixes; remove it only after the branch eventually lands.

## Evidence custody

| File | SHA-256 |
|---|---|
| /home/sittingmongoose/pm-scratch/ea-int2/checker-summary.json | 479836a744c911299ddd0702ab248a5ca8779e02ac695f51352c853fb0312bec |
| /home/sittingmongoose/pm-scratch/ea-int2/admission-readiness-final.json | 451a74411bb32d705df0ffd95aadc2347430bd9779dfef0219df873dc4bdeae0 |
| /home/sittingmongoose/pm-scratch/ea-int2/admission-dispositions-final.json | d70eaf040f5787c8b8073e15f0707eec6f2f5cc8509e9d74ba4fcda4caeb4cf6 |
| /home/sittingmongoose/pm-scratch/ea-int2/registry-dispositions-final.json | 904f831775cd889f837bef0590928da1061ae21f87ec964f2bac7554ceb7bb8b |
| /home/sittingmongoose/pm-scratch/ea-int2/registry-baseline-comparison.json | 38c6b1e7228a415267f2d0c373c00b52f75a84f42628eeae2cdb707893e89963 |
| /home/sittingmongoose/pm-scratch/ea-int2/dfm-registry-preflight-comparison.json | 27ddc20ee9f1dc4d2247c19509e009535c8bc9dc83d712faf2e7adf8a6495f4b |
| /home/sittingmongoose/pm-scratch/ea-int2/t198-gated-final.json | ba40a587265c691093e593ba716dbf420f45d3b3977ea043e79b964e500956ef |
| /home/sittingmongoose/pm-scratch/ea-int2/numrule-nested-gate-adoption.json | f36e0be37024df312d277b77824b68a607aaddc88d4dead87bab9dbe53c4cfb1 |
| /home/sittingmongoose/pm-scratch/ea-int2/post-gated-supporting-verification.json | 66539ff1d1d1e1377aaa5fae4bc8c680e2d3955f576b676325261bae207e7398 |
| /home/sittingmongoose/pm-scratch/ea-int2/post-gated-main-refresh.json | dc4cab8f2d8ac5335a97376f6f6b75f9a950f0159e54f708c74b2c8d1b300fab |
| /home/sittingmongoose/pm-scratch/ea-int2/post-gated-main-classify.json | 970ea562cf5f4cee8fb2491f32dde6e25a017b66ac53f2c7f7ed9a7fc3bfc563 |
| /home/sittingmongoose/pm-scratch/ea-int2/post-gated-main-pruned.json | 96ba30c12bb84fdd41a042266e3845043bce620edace50466e19d2f8ff1391aa |
| /home/sittingmongoose/pm-scratch/ea-int2/post-gated-custody.json | e68b1327d8d59ffd9074eeff88bb86d9f1d8f97851a755cb962c7d9d0567d5ad |
| /home/sittingmongoose/pm-scratch/ea-int2/post-gated-graphs.json | 342f0ff3837e4422fc6c691180f08208d55cee7a008b5241df4b53cb640f6fb9 |
| /home/sittingmongoose/pm-scratch/ea-int2/post-gated-unit-preservation.json | 865063be34a018033690dc092aa4069f045eae7dac5b7aa9dac722be188ebcb1 |
| /home/sittingmongoose/pm-scratch/ea-int2/dco-guard-final.json | 9e666774fe67a8eca3f6d66dffe63ed9cab97e4a01d121c723dcf00a8700f426 |
| /home/sittingmongoose/pm-scratch/ea-int2/dfm-retained-pin-final.json | a4da04c6beddeb4ba5b3e240858ac218722dde79c068f7dfbc4d5813f66cac07 |
| /home/sittingmongoose/pm-scratch/ea-int2/registry-unicode-repair.json | 0ce7a973e0a9fcbcc32e1cdf8c655faaf60974bf4113a74c6c38d0fdc1b0a307 |
| /home/sittingmongoose/pm-scratch/ea-int2/ds-dcn-union-hashes.json | 8b14d0a2792638e654aa9fea85e078216c5c85afc521252f52447750bde058f9 |
| /home/sittingmongoose/pm-scratch/ea-int2/index-schema-restoration.json | 812ae1dbf715e2854d92dbbe9366ea8d3b3f4330811f8fcffcc98acc12039ae7 |
| /home/sittingmongoose/pm-scratch/ea-int2/t198-final-supplement.json | ab6b8698811d357ef9986b9a4c8064abf83f9c2b601c735a13971529c22bf099 |
| /home/sittingmongoose/pm-scratch/ea-int2/t198-supplement.diff | 375430b9bc0ee5810e093ae6cf751d67179d38ec44b654a92e076ad388c5a46d |
| /home/sittingmongoose/pm-scratch/ea-int2/landing-first-census.json | b95d2b896fd7118bde9c712831997b63c5463c509b4c38541171331ae5065348 |
| /home/sittingmongoose/pm-scratch/ea-int2/landing-final-summary.json | 9b3358e9bae06d562592b1de682f411aa3981ab5187260c59586da5efcebe41f |
| /home/sittingmongoose/pm-scratch/ea-int2/landing-fix-verification.json | bb91041332d728e907f7bda2bd3d9caad6ee88d8611e5d1db08341cd89ac5023 |
| /home/sittingmongoose/pm-scratch/ea-int2/landing-fix-grade-citation-summary.json | 9a8773985d6c89dd81d06ba0add04ca7b474d3ab70cf5d8f35d29e3df8163f19 |
| /home/sittingmongoose/pm-scratch/ea-int2/landing-fix-grade-citation-check.json | 696d72e3f2e4f2255648981281d73b06ed960bfc23f1b6730d7b53523d8bb5bd |
| /home/sittingmongoose/pm-scratch/ea-int2/landing-fix-t198-refresh.json | dc4cab8f2d8ac5335a97376f6f6b75f9a950f0159e54f708c74b2c8d1b300fab |
| /home/sittingmongoose/pm-scratch/ea-int2/landing-fix-t198-classify.json | e24b8186e083a1a42be25f98f65f9a99a2f2339ebaba59f09d4220f7150ab5fd |
| /home/sittingmongoose/pm-scratch/ea-int2/landing-fix-t198-pruned.json | 37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570 |
| /home/sittingmongoose/pm-scratch/ea-int2/source-push-confirmation.json | 340ad6e59544229061b91c7d3971f2689c68d0409c08990b1b56c3acabf7ea1c |

Delivery state: Review packet pushed; the dry landing gate remains blocked solely by the explicitly uncredited inherited registry diagnostics and their two aggregate self-test records. The lead must resolve the conflict between carrying those diagnostics without fixes and requiring dry exit 0. No family admitted.
