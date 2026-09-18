# PROGRESS — C4 candidates currentness check and adjudication (Part 1)

Agent: Opus 5 (claude-opus-5[1m]). Started 2026-09-17.
Brief: /mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/BRIEF_C4_CANDIDATES_20260917.md
Governing: /mnt/Cursor/PuppetMaster/AGENTS.md (read; Part 1 is read-only, no canon edit, no branch)

## State
- [x] Brief read
- [x] AGENTS.md read
- [x] Bundle located: /mnt/Cursor/PuppetMaster/reports/jujutsu-research-2026-09-11/continuation4/adjudication/ (main at a6162b559b)
- [x] consolidated-candidates.json parsed: 27 candidates, 20 correction-shaped, 5 flagged inside a continuation-3 rejection (C4C-04, C4D-04, C4M-03, C4U-05, C4G-02)
- [ ] Ranking order from bundle README
- [ ] Per-candidate adjudication

## Correction-shaped, not flagged rejected (19 to adjudicate)
C4C-01, C4C-02, C4C-03, C4C-05, C4D-01, C4D-02, C4D-03,
C4H-01, C4H-02, C4H-03, C4H-04, C4H-05,
C4M-01, C4M-02, C4M-04, C4U-01, C4U-02, C4G-01, C4G-03
(C4C-04 is correction-shaped but flagged inside the continuation-3 "corruption taxonomy / extras detector / clone stage / arbitrary conflict editor" rejection -> left as recorded.)

## 2026-09-17 step log
- Bundle README read; ranking order taken from its convergence sections then the "All 27" table.
  Order: [C4C-01+C4G-01] -> [C4H-05] -> [C4D-01,C4M-02,C4C-02,C4U-02] -> [C4H-02+C4U-01] -> table order
  (C4C-03, C4C-05, C4D-02, C4D-03, C4H-01, C4H-03, C4H-04, C4M-01, C4M-04, C4G-03).
- Evidence hash check: all 23 evidence files cited by the 19 candidates exist under
  ~/PM-Experiments/jujutsu-followup-20260911/continuation4/runs/ and match their recorded SHA-256. 0 mismatches.
- Landing commits inspected: fdddacea20 (F106-F109), b0977cd851 (review fixes), a76f22a2f9 (DL-053 duplicate rows),
  d43694b6e1 (DL-054 32-parent bound / expires_at_utc echo).

### VERDICT 1 — C4C-01 + C4G-01 (MERGED): correction to land. Credit: claude (Arm C), glm53.
Currentness on main a6162b559b:
  - Plans/Jujutsu_Integration.md:484 (JJI-008 ac5) still reads "...restore the selected historical operation with
    object verification." Line moved 468 -> 484 because F106 added ac8; text unchanged.
  - Plans/forge_backup_tsnet_acceptance.json:1158 and :4841 still repeat the phrase; Plans/Backup_Restore_System.md:1210
    (BRS-017) still requires "retained-operation and object verification".
  - grep for fsck / connectivity-only / object_verification across Plans/**: ZERO hits. The phrase is used four times
    and defined nowhere.
  - Plans/jujutsu_integration_contracts.schema.json: object_closure_result is still a bare enum
    [complete, partial, failed] at :2652; the allOf branch binding verified_read_only / ready_for_owner_activation
    to object_closure_result const "complete" is still there and still unqualified by depth. F106's new branch
    constrains workspace_map_result / colocation_activation_disposition / working_copy_relation only.
  - Plans/backup_restore_system_contracts.schema.json:242 integrity_verification_level enum unchanged:
    [not_run, structure_passed, sampled_data_passed, full_data_read_passed, failed].
NOT COVERED by F106-F109 or DL-051..054.

### PART 1 COMPLETE — 2026-09-17
All 19 correction-shaped, non-flagged candidates adjudicated in the bundle's ranking order.
17 records (2 merged pairs). Outputs in this directory:
  ADJUDICATION_PART1.md  — the record, verdict table + promise/contradiction per correction
  adjudication-part1.json — machine record
  hash-manifest.json / SHA256SUMS — 45 files: this record, 9 bundle files, 23 run-state evidence files,
                                   11 canon files at main a6162b559b
Shared checkout `git status` clean at finish: no canon file edited, no branch created.

VERDICTS
 1  C4C-01 + C4G-01 (claude, glm53)   correction to land   restore-drill object verification depth
 2  C4H-05 (claude-hicap)              correction to land   divergent change has no representable state
 3  C4D-01 (deepseek41)                correction to land   no JJ tool/format version binding
 4  C4M-02 (muse13)                    correction to land   closure manifest records no resolved paths/environment
 5  C4C-02 (claude)                    correction to land   drill must resolve in-store pointers inside the boundary
 6  C4U-02 (union)                     correction to land   certification references have no record behind them
 7  C4H-02 + C4U-01 (hicap, union)     correction to land   a read declared non-mutating is never proven so
 8  C4C-03 (claude)                    correction to land (narrowed)  machine-local store entries undefined
 9  C4C-05 (claude)                    correction to land   gc fence does not state what it covered
10  C4H-01 (claude-hicap)              correction to land (narrowed)  split has no non-interactive execution
11  C4H-03 (claude-hicap)              correction to land   allowed_action_ids has no floor
12  C4H-04 (claude-hicap)              correction to land   bookmark track/untrack misclassified as transport
13  C4M-01 (muse13)                    correction to land   closure has no decision procedure
14  C4D-03 (deepseek41)                covered by Plans/Source_Control_System.md:313
15  C4D-02 (deepseek41)                rejected — inside continuation 3's marker-only-conflict rejection
16  C4M-04 (muse13)                    reclassified as product choice
17  C4G-03 (glm53)                     reclassified as product choice

NEXT: stop. Part 2 (landing) only after the reviewer confirms this list.

### POST-REVIEW REVISION — 2026-09-17
Independent review (REVIEW_ADJUDICATION_20260916.md, section "Candidate verdicts") confirmed all 17 verdicts,
both merges, both narrowings, the drifted line numbers and the C4D-02 reading (2-1 against the bundle
adjudicator; settled, supersession to be noted in the Part 2 bundle, landed artifact not edited).
Applied:
 - Record 2 (C4H-05): contradiction restated. Old claim ("divergen* returns no hit in any source-control,
   Jujutsu or GUI context") was falsifiable in one grep - my original grep was truncated by head -20.
   Verified first-hand: 5 hits in Plans/Jujutsu_Integration.md (:763 JJI-012; :1013 JJI-016 = the F022
   convergence capability; :1035/:1092/:1101 future-test lists), storage-fallback hits in UI_Command_Catalog.md,
   and ZERO hits in source_control_contracts.schema.json, final_gui_interaction_contracts.schema.json,
   jujutsu_integration_contracts.schema.json and Source_Control_System.md. Verdict unchanged.
 - Record 5 (C4C-02): isolated_verification cited at :2597 (required) and :2750 (typed const true).
 - Record 9 (C4C-05): gc_fence_outcome cited at :3192 (required) and :3259-3264 (enum). The review's :3251
   is one enum block early - it falls inside barrier_outcome (:3249-3254). Corrected, not adopted.
SHA256SUMS and hash-manifest.json regenerated. Shared checkout still clean.
HOLDING: Part 2 starts only when the coordinator relays Jared's answers to the seven questions.

## PART 2 — landing (worktree ~/pm-worktrees/c4-corrections-20260917, branch plans/c4-corrections-20260917)
Base origin/main a6162b559b. Gate baseline before any edit: pass, 1041 positive / 3379 negative.
- [x] b3fe7745fd record 1  verification depth (C4C-01+C4G-01)        gate 1041/3382
- [x] 4ba76cce97 record 2  divergent change (C4H-05)                 gate 1043/3385
- [x] f4707fcca0 records 3+6 toolchain identity + certification (C4D-01, C4U-02) gate 1044/3391
- [ ] records 4+5 pointer resolution (C4M-02 capture, C4C-02 drill)
- [ ] record 7 pinned reads (C4H-02+C4U-01)
- [ ] records 8, 9 store entries (C4C-03), fence coverage (C4C-05)
- [ ] records 10, 11, 12 split (C4H-01), action floor (C4H-03), bookmark class (C4H-04)
- [ ] record 13 closure decision procedure (C4M-01)
- [ ] semantic gate branch (4 rules) + semantic_rule negatives + tests + .gitignore
- [ ] source_lineage refs for every touched PlanUnit (one pass)
- [ ] ledger pldg-20260917-001 + registry
- [ ] DL-055 in both Decision Log sections
- [ ] bundle reports/jujutsu-research-2026-09-11/continuation4-landing/ incl. C4D-02 supersession note
- [ ] validators: gate, shard check, plan index validate, both ledger validators, unittest
Semantic rules planned (only these four, per answer 5):
  r5  jujutsu_pointer_resolution_incomplete_for_layout
  r7  jujutsu_operation_heads_changed_during_read_only_verification
  r11 jujutsu_recovery_action_not_in_canonical_inventory
  r13 jujutsu_closure_publishes_a_head_before_its_dependencies

### PART 2 COMPLETE — 2026-09-17, pushed and stopped for review
Branch plans/c4-corrections-20260917, 12 commits on top of origin/main a6162b559b, all pushed.
b3fe7745fd r1 verification depth | 4ba76cce97 r2 divergence | f4707fcca0 r3+r6 toolchain identity
49bfe79700 r4+r5 pointer resolution | e1d68f7db4 r7 pinned reads | 251b4da0a5 r8+r9 store entries + fence
fe651a1032 r10+r11+r12 split/floor/bookmark | c8471bb922 r13 closure procedure
0e857f435e semantic gate (4 rules + tests) | 53fa84cc5e DL-056/057/058
ff8dc4eed8 ledger + bundle | f390be59fe verification record
Validators: contracts pass 1047/3420 (baseline 1041/3379); shard check pass 0 failures 98 docs 2677 shards;
plan index validate pass 6656 units; 26 unittests pass; both ledger validators fail on exactly the 3
pre-existing governance-coverage errors and nothing else.
Open ledger questions q-008/q-009/q-010, none blocking. C4D-02 supersession noted in the bundle README;
continuation4/adjudication/ not edited.

### REVIEW FOLD-IN + LANDING ATTEMPT — 2026-09-17
Review verdict: land, no blocking, no should-fix (REVIEW_C4_CORRECTIONS_20260917.md).
Folded in as 8237d71e51 (pre-rebase): N1 contains:dependency_objects on materialization_order + negative;
N2 q-008/q-009/q-010 named in the five canon markers; N3 DL-058 quote whole incl. the Opus 5 sentence;
N6 adjudication-part1.json + hash in evidence-receipts.json. N4/N5 recorded, no change. Ledger evt-006.
Fold-in validators: gate pass 1047/3421 (was 3420); shard check pass 0 failures; index validate pass 6656;
26 tests pass; ledger validator 3 pre-existing errors only.

Main moved a6162b559b -> 2a92905501, so rebased as plans/c4-corrections-20260917-land1 (tip 5cc9d2cc21,
pushed, 14 ahead). No cited passage moved; only the six .plan_index files overlapped and were REGENERATED,
never hand-merged. Verified the index carries both waves (DL-056/057/058 + 0PI-068, 6656 units).
Post-rebase: gate pass 1047/3421, shard check pass, index validate pass 6656, 26 tests pass, ledger 3 errors.

LANDING BLOCKED, HELD. git merge --ff-only refused on the six .plan_index files. Diagnosis:
  git diff HEAD --name-only        -> 1 path (.omp/lsp.json, not mine). Working tree == HEAD everywhere.
  git diff --cached --name-only    -> 248 paths. Stale STAGING AREA from another thread, mtimes 05:29:55.
No real edit is at risk; the fix is `git -C /mnt/Cursor/PuppetMaster reset` (index only, rewrites no file).
Not run: AGENTS.md says hand over, and another thread's index is theirs to clear. Shared checkout HEAD
unchanged at 2a92905501; the aborted merge modified nothing. Awaiting authorization to land.

### LANDED — 2026-09-17
main = 61bea7aabc787c9d214e6c6d042ec3269a7c8536 (was 2a929055012e948e53c3884da1a9f0dd80deecc1).
Stale index cleared with `git -C /mnt/Cursor/PuppetMaster reset` (authorized); after it,
git diff HEAD named only .omp/lsp.json and git diff --cached was empty. ff-only succeeded.
Pattern recorded in the bundle README as its own section, commit 61bea7aabc.
Shard check --config: pass, 0 failures, 98 docs.
Three repository-wide checks, all pre-existing red, none stopping the landing:
  run-gates            fail | 23 of 36 checks pass; validate_new_contracts and check_shards both pass.
                       Entries naming my files: 3 (event_authority_currentness_source_drift on
                       Decision_Log/Jujutsu_Integration) + 1 (stale_batch_report_sha256_after on
                       Decision_Log). All in the expected stale-hash class.
  audit-governance     fail | 12 groups. 4 of ~600 entries name my files, same stale-hash class;
                       every other entry names files this branch never touched.
  plan-migration validate --run-dir Plans/.plan_migration/pds-20260906-017-current-planunit-snapshot
                       fail | 27488 entries, 24 name my files (stale_batch_report_sha256_after,
                       current_snapshot_live_sha256_mismatch), 27464 name other files.
RESEAL OWED for Plans/Jujutsu_Integration.md, Plans/Source_Control_System.md, Plans/Decision_Log.md.
Cleanup: worktree removed; plans/c4-corrections-20260917 and -land1 deleted locally and on origin.
