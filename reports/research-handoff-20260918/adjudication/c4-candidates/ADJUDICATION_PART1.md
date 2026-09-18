# Continuation-4 candidates — Part 1 adjudication record

**I am an Opus 5 agent** (`claude-opus-5[1m]`). Part 1 only. No canon file was edited and no Plans branch was created.

- `main` at adjudication: `a6162b559b502278458a56e95c5c0891c3e2a505`
- Candidates adjudicated: **19** (the correction-shaped candidates not flagged as inside a continuation-3 rejection), in **17** records after merging 2 pairs.
- Ranking order: reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md - the convergence sections in order, then the All 27 table order for the rest.
- Test applied: Continuation 3's test, applied exactly: a candidate is a correction when it names an existing promise and a contradiction or gap that makes that promise unfalsifiable or false, and adds no capability beyond repairing that.
- Evidence: 23/23 cited evidence files re-hashed from the read-only run state; 0 mismatches.

## Post-review revision

**Review.** REVIEW_ADJUDICATION_20260916.md, section 'Candidate verdicts', 2026-09-17

**Reviewer verdict.** All seventeen records confirmed, both merges, both narrowings, the drifted line numbers and the C4D-02 reading (now two to one against the bundle adjudicator; treated as settled, with the supersession to be noted in the Part 2 bundle rather than by editing the landed artifact).

**Changes applied.**

- Record 2 (C4H-05): contradiction restated. The overbroad 'no hit in any source-control, Jujutsu or GUI context' claim is replaced by the accurate and stronger form - canon contemplates divergence in owner prose, inside an unapproved capability and in future-test lists, while every closed enum that would have to represent it omits it and no typed reason code names it. All five Plans/Jujutsu_Integration.md hits and the four zero-hit files re-verified first-hand.
- Record 5 (C4C-02): isolated_verification now cited at both :2597 (required) and :2750 (typed const true), per the review.
- Record 9 (C4C-05): gc_fence_outcome now cited at :3192 (required) and :3259-3264 (enum). The review's :3251 is one enum block early - it falls inside barrier_outcome (:3249-3254). Verified first-hand and corrected rather than adopted.

**Unchanged.** All seventeen verdicts, both merges, both narrowings and the seven questions stand exactly as recorded.

## Verdict table

| # | Candidate(s) | Arm(s) | Verdict | Label |
|---|---|---|---|---|
| 1 | `C4C-01` + `C4G-01` *(merged)* | claude, glm53 | **correction to land** | Restore-drill object verification has no defined depth |
| 2 | `C4H-05` | claude-hicap | **correction to land** | A divergent change has no representable state anywhere in the corpus |
| 3 | `C4D-01` | deepseek41 | **correction to land** | No record binds the JJ tool or store-format version a closure requires |
| 4 | `C4M-02` | muse13 | **correction to land** | The closure manifest records neither the resolved backend paths nor the environment that resolved them |
| 5 | `C4C-02` | claude | **correction to land** | The isolated drill must resolve and rebind in-store location pointers |
| 6 | `C4U-02` | union | **correction to land** | The certification references have no scenario matrix behind them |
| 7 | `C4H-02` + `C4U-01` *(merged)* | claude-hicap, union | **correction to land** | A read declared non-mutating is never proven non-mutating |
| 8 | `C4C-03` | claude | **correction to land (narrowed)** | Machine-local and ephemeral native store entries have no stated disposition |
| 9 | `C4C-05` | claude | **correction to land** | gc_fence_outcome held_during_capture does not state what the fence covered |
| 10 | `C4H-01` | claude-hicap | **correction to land (narrowed)** | cmd.jujutsu.change.split has no expressible non-interactive execution |
| 11 | `C4H-03` | claude-hicap | **correction to land** | allowed_action_ids has no floor, so a blocked repository can admit no recovery action |
| 12 | `C4H-04` | claude-hicap | **correction to land** | bookmark.track and bookmark.untrack are classified as transport mutations requiring a credential lease |
| 13 | `C4M-01` | muse13 | **correction to land** | JJI-008 states the ends of closure completeness but names no decision procedure |
| 14 | `C4D-03` | deepseek41 | **covered** | The JJ command inventory has no conflict-resolution entry, so the Conflict-assistant commands have no JJ-scoped preconditions |
| 15 | `C4D-02` | deepseek41 | **rejected as inside continuation 3's rejection 'Marker-only conflict command is a JJ owner defect'** | mark_conflict_resolved's text-based precondition can contradict JJI-005 |
| 16 | `C4M-04` | muse13 | **reclassified as product choice** | Bookmark controls have the hooks for scope disclosure but none of the content |
| 17 | `C4G-03` | glm53 | **reclassified as product choice** | merge_editor_available is referenced as a command condition and defined by no owner |

**Totals.** correction to land: 13, covered: 1, rejected as inside a continuation-3 rejection: 1, reclassified as product choice: 2.

**Merged pairs.** `C4C-01` + `C4G-01`; `C4H-02` + `C4U-01`.

**Not adjudicated here** (out of the Part 1 set): C4C-04 (correction-shaped, flagged inside continuation 3's F082/F086/F056 refinement rejection); C4D-04; C4M-03; C4U-05; C4G-02 (non-correction, flagged); C4M-05, C4U-03, C4U-04 (non-correction, not flagged).

## Corrections to land — promise and contradiction for each

### 1. `C4C-01 + C4G-01` — Restore-drill object verification has no defined depth

*Arms:* claude, glm53. *Verdict:* **correction to land**.

**Merged because.** Same defect reached from two directions: Arm C from receipt admissibility (object_closure_result: complete is admissible whatever depth produced it), glm53 from the undefined term (a connectivity-only verifier passes a corrupt-blob closure). One repair closes both.

**Promise.** Plans/Jujutsu_Integration.md:484 (JJI-008 acceptance criterion 5) - 'Restore verification is isolated, read-only against the original, version-compatible, and ignore-working-copy where required; a disposable restored copy can list operations, inspect views, and restore the selected historical operation with object verification.' Reinforced by Plans/Jujutsu_Integration.md:486 (ac7) 'missing object closure ... remain distinct receipt refs. A blocked/conflicted result cannot be promoted to successful Backup activation', by Plans/Backup_Restore_System.md:1207-1210 (BRS-017) 'missing or corrupt history cannot be masked by a readable cache' and 'retained-operation and object verification remain required', and by Plans/forge_backup_tsnet_acceptance.json:1158 and :4841 which repeat the phrase as consumer acceptance.

**Contradiction.** 'object verification' is used four times in canon and defined nowhere. A repository-wide search of Plans/** for fsck, connectivity-only and object_verification returns zero hits. Plans/jujutsu_integration_contracts.schema.json:2652 still types object_closure_result as a bare enum [complete, partial, failed], and the allOf branch that gates the two activation-eligible outcomes (verified_read_only, ready_for_owner_activation) to object_closure_result const 'complete' places no constraint on the depth that produced it. The cheapest conforming implementation is a reachability walk, which returns success on a store with corrupt blob content, so the acceptance criterion is satisfiable by a pass that detects nothing it claims to detect and BRS-017's 'corrupt history cannot be masked' is falsified. The corpus contradicts itself on the same axis: Plans/backup_restore_system_contracts.schema.json:242 gives Backup an explicit integrity_verification_level enum [not_run, structure_passed, sampled_data_passed, full_data_read_passed, failed], and Plans/Backup_Restore_System.md:253 (BRS-005 ac4) requires 'a committed but unverified snapshot, a structurally verified but unread snapshot, and a snapshot without a restore drill remain visibly distinct'. The product is precise about verification depth for Backup snapshots and silent about it for the JJ restore drill that gates Backup activation.

**Adds no capability.** The repair defines an existing phrase and, optionally, $refs an enum the Backup owner already ships. The bound (run once on the disposable restored copy before activation, never on the original, never while holding the capture barrier) is the isolation discipline JJI-008 already states.

**Currentness.** NOT covered. F106 (fdddacea20) added ac8 to JJI-008 and a readiness conditional over workspace_map_result / colocation_activation_disposition / working_copy_relation only; it moved the ac5 line from 468 to 484 and changed no word of it. DL-051..054 and the object-format picker (JJI-021, JJI-022, SCS-022) touch new-repository format selection, not restore verification.

**Discriminating fixture.** glm53 supplies it: a byte-flipped blob under matching refs. A connectivity-only verifier passes; a content-reading verifier fails. Torn-pack negative and intact positive complete the set, across the three layout fixtures already named at Plans/forge_backup_tsnet_acceptance.json:2334.

**Landing note.** Two forms exist and the owner picks: a behavioural rule in JJI-008 alone, or that plus an object_verification_depth field on the receipt $ref-ing Plans/backup_restore_system_contracts.schema.json#/$defs integrity_verification_level. The schema form is the falsifiable one. Shared-seed disclosure from the bundle stands: both arms were handed the same frozen discovery leads; three other arms with the same pointer did not convert it.

**Cross-reference.** C4M-01 is the same JJI-008 family, different defect (expansion and ordering, not depth).

### 2. `C4H-05` — A divergent change has no representable state anywhere in the corpus

*Arms:* claude-hicap. *Verdict:* **correction to land**.

**Concurrence.** muse13's C4M-05 half (A) is the same representability gap; C4M-05 is classified capability in the bundle (its half (B) is covered by union finding F068) and is out of this Part 1 set, so muse13 is credited as concurring rather than merged.

**Promise.** Plans/Source_Control_System.md:1053-1054 (SCS-017 canonical text) - 'Jujutsu renders stable change identity, current commit identity, rewrites, abandonment, and conflicts without a fake staging model', with ac2 at :1066 requiring a stable change reference for every node. Plans/Source_Control_System.md:949-952 (SCS-015 canonical text) - 'Jujutsu preserves current @, stable change ID, current commit ID, describe/new/edit/split/squash/abandon, bookmarks/tracking, conflicts, workspaces, and operation history'. Plans/Jujutsu_Integration.md:237 (JJI-006) - 'ambiguous or unsupported colocation remains blocked with a typed reason and recovery actions', and its ac3 'Unsupported object formats, versions, helpers, or colocation states degrade reads and fail mutations closed'.

**Contradiction.** Canon contemplates divergence in owner prose - inside an unapproved capability and in future-test lists - while every closed enum that would have to represent it omits it, and no typed reason code names it. The prose hits are all in Plans/Jujutsu_Integration.md: :763 (JJI-012, rejecting divergent intervening work), :1013 (JJI-016, 'Convergence selects exact divergent immutable commits of one stable change ID' - this is union finding F022, the explicit-convergence capability, which this record excludes), and :1035, :1092 and :1101, which are 'future' test-surface lists. The Plans/UI_Command_Catalog.md hits are storage-root fallback divergence, a different domain. Against that, divergen* returns ZERO hits in Plans/source_control_contracts.schema.json, Plans/final_gui_interaction_contracts.schema.json, Plans/jujutsu_integration_contracts.schema.json and Plans/Source_Control_System.md - the four files that would have to carry the representation. Plans/source_control_contracts.schema.json:2871 closes node_state at [normal, rewritten, abandoned, conflicted]. Plans/final_gui_interaction_contracts.schema.json:933 closes graph_states at prefixItems [rewritten, abandoned, conflicted, local_bookmarks, remote_bookmarks] with items:false. Plans/jujutsu_integration_contracts.schema.json:120-145 and :146-175 close disabled_reason_code and error_code with no divergence code. So a producer facing divergence must either mislabel the rows as normal or drop one, and a command whose change target resolves to two commits has no defined refusal. The nearest existing code, invalid_target_identity, occurs exactly twice in the corpus - both as bare enum members in Plans/jujutsu_integration_contracts.schema.json - and is defined by no owner text, so it cannot be cited as covering. The gap is therefore not an oversight of the concept but of its representation, which is a stronger contradiction than the overbroad 'no hit anywhere' claim this record carried before the independent review corrected it.

**Adds no capability.** The repair adds a state value, a reason code and a fail-closed refusal. It does not add union finding F022's explicit-convergence command, which is the capability in this area and is excluded.

**Currentness.** NOT covered. DL-053 (a76f22a2f9) made node_ref unique within a page, which does not close this: stable_change_ref has no in-page uniqueness rule, so two nodes may legitimately share a change reference while node_state has no value to describe why. DL-052/DL-054 (655f7ee2bd, d43694b6e1) bound parent_refs at 32 and fixed the expansion fence; neither touches node_state.

**Post-review correction.** Independent review REVIEW_ADJUDICATION_20260916.md section 'Candidate verdicts' (2026-09-17) confirmed the verdict and narrowed this wording. The superseded sentence claimed a repository-wide search for divergen* 'returns no hit in any source-control, Jujutsu or GUI context'; that is falsifiable in one grep. Restated 2026-09-17 by the same Opus 5 agent after verifying all five Jujutsu_Integration.md hits and the four zero-hit files first-hand. Verdict unchanged: correction to land.

**Landing note.** graph_states in Plans/final_gui_interaction_contracts.schema.json:933 is a frozen prefixItems list inside post_integration_dry_component_reconciliation. Extending it is an owner decision, not a mechanical edit, and should be a question for Jared rather than an assumed part of the repair. The reason code may reuse invalid_target_identity rather than mint change_divergent_ambiguous_target; that is also an owner choice.

### 3. `C4D-01` — No record binds the JJ tool or store-format version a closure requires

*Arms:* deepseek41. *Verdict:* **correction to land**.

**Promise.** Plans/Jujutsu_Integration.md:484 (JJI-008 ac5) - restore verification is 'version-compatible'. Plans/Source_Control_System.md:185-186 (SCS-004) - 'Signed moving certification catalogs own supported mutation versions; historical Git 2.55.0 and Jujutsu 0.44.0 values are initial packet inputs, not timeless floors.'

**Contradiction.** Neither record that would carry the binding has a version field. Plans/jujutsu_integration_contracts.schema.json backup_jj_closure_record requires 25 fields and backup_jj_restore_verification_receipt requires 30; neither list contains any tool, adapter or store-format version. Both bind only a jujutsu_revision (change/commit/operation/workspace/bookmarks) plus context refs. The only adapter_version in the family sits on jj_effective_capability_snapshot at Plans/source_control_contracts.schema.json:874, which the closure records do not reference. So 'version-compatible' cannot be evaluated by the corpus's own schemas or fixtures, and a closure captured by one jj generation and read by another produces no typed blocked outcome.

**Adds no capability.** The repair adds identity fields to records that already exist and a typed blocked outcome from the vocabulary already in historical_operation_result. It admits no new command, surface or migration.

**Currentness.** NOT covered. JJI-022 (dfffb0015e) added a certified object-format profile and states explicitly at Plans/Jujutsu_Integration.md:1435 that 'the exact engine, command-line and repository-format qualification requirement stays with JJI-006, SCS-004 and SCS-015' - a pointer to three units that do not enumerate it, not a definition.

**Cross-reference.** Shares a field vocabulary with C4U-02. Land one version-identity block that serves both records rather than two.

### 4. `C4M-02` — The closure manifest records neither the resolved backend paths nor the environment that resolved them

*Arms:* muse13. *Verdict:* **correction to land**.

**Promise.** Plans/Jujutsu_Integration.md:481 (JJI-008 ac2) - 'Non-colocated closure preserves the JJ operation/object store and every explicitly mapped backing/alternate store without assuming a colocated Git checkout; shared multi-workspace closure preserves stable workspace/source mappings while foreign absolute paths remain non-authoritative.' Plans/Source_Control_System.md:886 (SCS-014 ac1) requires the capture to bind 'dirty/approved-untracked/LFS/submodule/alternate/shared-store state, missing dependencies, and a source-closure receipt'.

**Contradiction.** The closure records the result of discovery and nothing about how discovery resolved. alternate_store_refs, shared_store_refs and git_common_directory_ref are opaque non_secret_refs. A repository-wide search of Plans/*.md and Plans/*.json for alternates, commondir, gitfile, GIT_DIR and GIT_OBJECT_DIRECTORY returns no resolution rule at all. The two pointer kinds resolve against different bases - objects/info/alternates relative to the object database, commondir relative to the Git directory - so a single-base implementation resolves the wrong store while satisfying every shipped fixture, and 'every explicitly mapped backing/alternate store' cannot be checked because nothing records what a hop resolved to or what environment resolved it.

**Adds no capability.** The repair records resolution inputs and hops that the capture must already perform, and routes an unfollowable or out-of-boundary hop into the existing missing_dependency_refs. No new store kind, command or surface.

**Currentness.** NOT covered. Nothing landed this week touches closure discovery.

**Cross-reference.** Capture-side complement of C4C-02 (drill-side). Land together; they are distinct defects, not one.

### 5. `C4C-02` — The isolated drill must resolve and rebind in-store location pointers

*Arms:* claude. *Verdict:* **correction to land**.

**Promise.** Plans/Source_Control_System.md:872 (SCS-014 canonical text) - 'Every restored repository is verified in an isolated boundary before activation.' Plans/Jujutsu_Integration.md:484 (JJI-008 ac5) - 'Restore verification is isolated, read-only against the original'. Plans/Jujutsu_Integration.md:473 (JJI-008 canonical text) - 'no restore drill pushes, executes hooks, resumes Goals, or mutates the original repository.'

**Contradiction.** Plans/jujutsu_integration_contracts.schema.json requires isolated_verification at :2597 and types it at :2750 as {"const": true} - the receipt asserts isolation as a constant and nothing anywhere constrains what makes it true. A same-host drill whose restored copy still carries the original's store/git_target, objects/info/alternates or linked-workspace gitdir links resolves every object out of the original store, passes every existing check including object_closure_result: complete, and emits isolated_verification: true while the isolation claim is false. There is no typed blocker for a pointer resolving outside the boundary; the clean-host condition survives in Plans/Jujutsu_Integration.md:495 only as a 'future colocated/non-colocated/shared-workspace clean-host restore' test surface.

**Adds no capability.** The repair requires the drill to resolve pointers it must already follow, record where each resolved, and block when one leaves the boundary. Recommend landing the blocking half as the obligation and leaving in-boundary rebinding admitted-but-not-required, so no new restore action is introduced.

**Currentness.** NOT covered.

**Cross-reference.** Drill-side complement of C4M-02.

### 6. `C4U-02` — The certification references have no scenario matrix behind them

*Arms:* union. *Verdict:* **correction to land**.

**Promise.** Plans/Jujutsu_Integration.md:238-239 (JJI-006 canonical text) - 'Jujutsu 0.44.0 colocated import/export defaults effective false unless the exact adapter and live environment have current certification evidence.' Plans/Jujutsu_Integration.md:122-123 (JJI-003 canonical text) - 'Colocated import/export dispatch additionally requires its exact effective capability to be true under the current certified adapter gate.' Plans/Source_Control_System.md:185 (SCS-004) - 'Signed moving certification catalogs own supported mutation versions'.

**Contradiction.** The certification is referenced as a gate and defined as nothing. jj_effective_capability_snapshot at Plans/source_control_contracts.schema.json requires certification_catalog_ref, certified_adapter_gate_ref and exact_live_probe_ref, all opaque non_secret_refs, and carries one adapter_version string with no separate jj executable or build identity, no Git version, no Host/Environment/OS/filesystem, no workspace or common-directory identity and no scenario axis. So 'current certification evidence' can never be checked against anything, and nothing forbids a root certification from being read as certifying a child layout.

**Adds no capability.** The repair gives content to a record the corpus already requires, over scenarios canon already names (non-mutating observation, ordinary snapshot, explicit import, explicit export, stale-workspace refresh, external-Git compatibility, workspace creation and removal, approved conversion). It admits no new capability and no new command.

**Currentness.** NOT covered, and now sharper: JJI-022 (dfffb0015e) shipped exactly this record shape for object formats - one profile per format per exact Execution Host and Environment, naming its certification catalog and official source, with independent support states each carrying named evidence - and then said at Plans/Jujutsu_Integration.md:1435 that the engine/CLI/repository-format qualification requirement 'stays with JJI-006, SCS-004 and SCS-015'. None of those three enumerates it. There is now a precedent shape and an explicit pointer to an owner who has not written it.

**Cross-reference.** Shares a version-identity vocabulary with C4D-01.

### 7. `C4H-02 + C4U-01` — A read declared non-mutating is never proven non-mutating

*Arms:* claude-hicap, union. *Verdict:* **correction to land**.

**Merged because.** One defect: a JJ read is DECLARED non-mutating and never PROVEN non-mutating at the adapter boundary. claude-hicap repairs it capture-and-drill side (pin every read to an exact operation, record the op-head set before and after and assert equality); union repairs it command side (name the adapter's complete native effect scope, require a proven non-mutating observation path, return a typed stale/blocked/degraded result rather than a default mutating invocation). The two repairs are complementary halves of one rule.

**Promise.** Plans/Jujutsu_Integration.md:483 (JJI-008 ac4) - 'Capture cannot manufacture a JJ snapshot/commit/operation to align dirty files with the last recorded operation.' Plans/Jujutsu_Integration.md:473 - no restore drill 'mutates the original repository'. Plans/Jujutsu_Integration.md:317 (section 3.3) - 'Reads and navigation carry no writer, credential, FileSafe, confirmation, or interop authority.' Plans/jujutsu_integration_contracts.schema.json:2945 (x-puppet-master-assertions) - 'read verification uses an ignore-working-copy mode where required and does not manufacture a JJ snapshot'.

**Contradiction.** The obligation lives in an x- annotation as prose, carries an undefined qualifier ('where required'), and has no field behind it. Nothing in the schema requires a read to be pinned to an exact operation, and no receipt field records the disposable copy's operation-head set before and after, so 'does not manufacture a JJ snapshot' cannot be falsified by any record the corpus defines. Against jj as pinned by both arms, a default writable invocation snapshots the working copy and may refresh a stale workspace, so the obvious implementation of a read-class command authors an operation while its request declares null writer authority. All five shipped fixtures carrying operation_head_refs hold exactly one head, so the contract is never exercised against more than one.

**Adds no capability.** Both halves constrain how an existing read is issued and what the existing receipt records. Neither grants write authority; both explicitly keep the read branch's null authority, which is the side continuation 3 took when it rejected a mutating status.refresh branch.

**Currentness.** NOT covered.

**Relation to continuation 3.** Runs WITH continuation 3's rejection of 'Add mutating status.refresh branch as a required correction', not against it. Two arms that never saw continuation 3 arrived independently at the boundary continuation 3 drew.

**Landing note.** Divergence probing appears in claude-hicap's assertion ('divergence must be probed and recorded without being resolved, with every head in operation_head_refs and a distinct divergent closure state'). That clause depends on record 2 (C4H-05) and should land with it or be dropped from this repair, not landed twice.

### 8. `C4C-03` — Machine-local and ephemeral native store entries have no stated disposition

*Arms:* claude. *Verdict:* **correction to land (narrowed)**.

**Promise.** Plans/Jujutsu_Integration.md:482 (JJI-008 ac3) - 'Complete closure includes operation heads/views, commits/trees/conflicts, retained non-current/abandoned/rebased objects, current workspace files, and required dependency stores.' Plans/Source_Control_System.md:892 (SCS-014 ac7) - 'Mutable Git/JJ configuration is sanitized and inactive by default.' Plans/Source_Control_System.md:872-874 (SCS-014) - 'Restore-as-new creates a new Project/repository binding'.

**Contradiction.** The store tree holds entries that are neither history nor configuration: native lock files and per-machine store identity files. Canon's inclusion list does not name them and its sanitization clause does not reach them, so 'complete' is asserted over a tree whose contents have no stated classification, and a restored copy may carry another machine's store identity as live state while SCS-014 promises new identity and an isolated boundary. An implementer's cheapest answer is a filename pattern such as '*.lock', which silently drops or restores real content when the native layout changes.

**Adds no capability.** Narrow the landing to three obligations that repair rather than extend: (i) an unrecognized entry inside the store tree yields partial with a named ref rather than complete; (ii) machine-local and ephemeral entries are captured as bytes but never restored as active state; (iii) the classification is source-traced against the pinned JJ version and is never a filename pattern. The enumerated list itself is an owner audit of jj internals the arm did not run - its stated evidence limit is documentation and schema reading - so the list lands as an obligation with a question, not as a table.

**Currentness.** NOT covered. A search of Plans/*.md and Plans/*.json for machine-local, ephemeral and lock-file dispositions returns only unrelated hits (BinaryLocator caches, Architecture_Invariants install budget, memory tiering).

### 9. `C4C-05` — gc_fence_outcome held_during_capture does not state what the fence covered

*Arms:* claude. *Verdict:* **correction to land**.

**Promise.** Plans/Jujutsu_Integration.md:167-172 (JJI-004 canonical text) - 'When an active .jj store is verified in a colocated repository, Jujutsu is the sole mutation authority by default', and 'a late or unmatched Git mutation quarantines the workspace'. Plans/Source_Control_System.md:887 (SCS-014 ac2) - 'Complete source closure rejects a lost barrier/fence or any missing dependency'. Plans/jujutsu_integration_contracts.schema.json:2563 - 'capture_barrier_ref and gc_fence_ref are owner evidence and do not authorize a second mutation authority'.

**Contradiction.** Plans/source_control_contracts.schema.json requires gc_fence_outcome at :3192 and types it at :3259-3264 as [held_during_capture, not_acquired, lost_during_capture], with barrier_outcome identical at :3249-3254 and no coverage field anywhere. (The independent review cited :3251 for this enum; :3251 is one block early, inside barrier_outcome. Verified first-hand and corrected here.) A fence genuinely held over the native JJ process while a colocated Git process or a registered external/automation path mutated the same store during the window records held_during_capture and capture_completeness: complete, truthfully by the letter and falsely in substance. 'Rejects a lost fence' is enforced; 'the fence covered every writer path' is claimed by nobody and checkable by nothing.

**Adds no capability.** The repair enumerates the paths a fence the product already acquires actually covered, and routes an unassertable path into the existing partial state. No new lock, process or authority.

**Currentness.** NOT covered.

**Evidence caveat.** The bundle's own amendment (arm-c-candidates.json, amendments, 2026-09-16) withdraws one supporting leg: Arm C's claim that jj's op-store GC with SystemTime::UNIX_EPOCH 'preserves nothing by recency' is factually wrong - remove_file_if_not_new KEEPS a file when mtime > keep_newer, so UNIX_EPOCH removes nothing. The candidate survives on the lock-coverage leg alone. The landing must not cite the UNIX_EPOCH claim in any receipt or acceptance criterion.

### 10. `C4H-01` — cmd.jujutsu.change.split has no expressible non-interactive execution

*Arms:* claude-hicap. *Verdict:* **correction to land (narrowed)**.

**Promise.** Plans/Source_Control_System.md:950 (SCS-015 canonical text) - 'Jujutsu preserves current @, stable change ID, current commit ID, describe/new/edit/split/squash/abandon, bookmarks/tracking, conflicts, workspaces, and operation history'. Plans/Jujutsu_Integration.md:131 (JJI-003 ac1) - 'Each primary JJ command has one schema-valid request path and one rejected negative fixture'. Plans/Jujutsu_Integration.md:317 (section 3.3) - 'The command request enum is exactly the 31 IDs in section 3.1' and 'Availability uses a closed disabled-reason vocabulary and allowed recovery command IDs'.

**Contradiction.** cmd.jujutsu.change.split is in the frozen inventory at Plans/Jujutsu_Integration.md:276 and bound to the sole future handler handlers::jujutsu::change_split at :381 and :404, while Plans/jujutsu_integration_contracts.schema.json command_target admits exactly twelve fields, none of which can name a path, hunk or content selection. A native jj split with no path arguments opens an interactive diff editor. So the one canonical command the corpus says is preserved has, as its only schema-expressible native execution, a session the product cannot host, for which there is no typed result, no disabled reason and no blocked state in the closed vocabulary.

**Adds no capability.** Narrowed to the repair only: state in section 3.3 that no canonical Jujutsu command may reach an adapter invocation that can start an interactive diff or merge editor, and add a disabled reason so the command blocks truthfully instead of being nominally available. That is fail-closed and adds nothing.

**Currentness.** NOT covered.

**Capability half set aside.** The change_content_selection target extension ({selection_kind: whole_change|explicit_paths, repo_relative_paths, interactive_editor: prohibited}) that would make split executable is a capability and is set aside for a decision card. It is the same territory as union finding F028 (machine-readable partial-change specifications) and should not be landed as a correction.

### 11. `C4H-03` — allowed_action_ids has no floor, so a blocked repository can admit no recovery action

*Arms:* claude-hicap. *Verdict:* **correction to land**.

**Promise.** Plans/Contracts_V0.md:508 - 'recovery actions are admitted only when the current blocked episode exposes the corresponding ordered actions.' Plans/Jujutsu_Integration.md:237 (JJI-006 canonical text) - 'ambiguous or unsupported colocation remains blocked with a typed reason and recovery actions'. Plans/Jujutsu_Integration.md:317 (section 3.3) - 'Availability uses a closed disabled-reason vocabulary and allowed recovery command IDs.'

**Contradiction.** Plans/jujutsu_integration_contracts.schema.json availability_payload requires allowed_action_ids and types it as an array of command-id strings with uniqueItems and no minItems. Its three allOf branches constrain effective, reason_codes and disabled_reason_code by state and say nothing about allowed_action_ids. So an empty array validates for state: blocked with disabled_reason_code: repository_quarantined, and under the Contracts_V0 rule an empty set means no recovery action is admitted at all. The promise of 'blocked with a typed reason and recovery actions' is false for a record the schema accepts.

**Adds no capability.** The floor is two commands already in the frozen 31 - cmd.jujutsu.operation.log and cmd.jujutsu.operation.show. No new command, handler or surface.

**Currentness.** NOT covered.

**Landing note.** The second half of the assertion - that the floor commands must be servable from the operation store alone, without a current working-copy snapshot, a valid writer lease or a healthy status projection - is what makes the floor meaningful, but it is an adapter obligation no schema can express. It lands as an owner obligation marked unenforced unless Jared authorizes a semantic-gate branch.

### 12. `C4H-04` — bookmark.track and bookmark.untrack are classified as transport mutations requiring a credential lease

*Arms:* claude-hicap. *Verdict:* **correction to land**.

**Promise.** Plans/Jujutsu_Integration.md:317 (section 3.3) - 'Transport requires a bounded credential lease', which implies transport is what carries one. Plans/Jujutsu_Integration.md:9 states the product's local-first boundary. JJI-001's negative constraint 'Do not make Jujutsu a Git command skin' at Plans/Jujutsu_Integration.md:69.

**Contradiction.** Plans/jujutsu_integration_contracts.schema.json command_request allOf branch 5 puts cmd.jujutsu.bookmark.track and .untrack in the same conditional as git.clone, git.fetch and git.push, narrowing credential_lease_ref to a non-null ref and pinning command_class to the const transport_mutation. The two shipped fixtures contradict that inside a single record: command_request_jujutsu_bookmark_track and command_request_jujutsu_bookmark_untrack both carry command_class: transport_mutation AND permission.scope: local_mutation. Against jj as pinned by the arm, track and untrack are local view transactions with no remote call and no credential use. The consequence is user-visible: without a credential lease a schema-valid untrack request cannot be formed at all, so a purely local operation would surface credential_lease_missing.

**Adds no capability.** The repair reclassifies two commands already in the frozen 31 and nulls one field. Writer lease, FileSafe decision, permission snapshot, expected-revision fence and currentness are unchanged. The remote_identity requirement in branch 17 stays, because track and untrack name a remote bookmark without contacting it.

**Currentness.** NOT covered. F109 concerns transport credential evidence fields and does not reach this classification.

**Landing note.** This is the only candidate in the set whose repair contradicts a shipped positive fixture, so the fixture pair changes with the schema and the negative fixture is a track request carrying a credential lease.

### 13. `C4M-01` — JJI-008 states the ends of closure completeness but names no decision procedure

*Arms:* muse13. *Verdict:* **correction to land**.

**Promise.** Plans/Jujutsu_Integration.md:482 (JJI-008 ac3) - 'Complete closure includes operation heads/views, commits/trees/conflicts, retained non-current/abandoned/rebased objects, current workspace files, and required dependency stores; a text op log, Git push, mirror clone, Git bundle, current bookmarks, or remote availability alone cannot satisfy it.' Plans/Jujutsu_Integration.md:486 (ac7) - 'missing object closure ... remain distinct receipt refs'. Plans/Source_Control_System.md:887 (SCS-014 ac2) - 'Complete source closure rejects a lost barrier/fence or any missing dependency.'

**Contradiction.** Canon states what completeness must contain and what it must reject, and never states how either is decided. There is no operation-to-view-to-commit-to-tree expansion rule, no objects-before-heads publication order, no dependency-safe materialization order with heads and activation markers last, and no typed blockers for a missing parent, a malformed id, a self-parent or a parent cycle - a repository-wide search finds those blockers only in the unrelated ToDo graph contract. So missing_dependency_refs can be empty while the closure is incomplete, and complete is a determination with no defined computation behind it.

**Adds no capability.** The repair writes down the procedure the capture and restore must already perform and routes its failures into blockers the receipt already carries. It adds no new record, command or surface.

**Currentness.** NOT covered.

**Cross-reference.** Same JJI-008 family as record 1, different defect: expansion and ordering, not verification depth. claude-hicap reached the same gap independently in its J0027 Gap 1, which the bundle records.

## Not landing

### `C4D-03` — The JJ command inventory has no conflict-resolution entry, so the Conflict-assistant commands have no JJ-scoped preconditions

*Arm:* deepseek41. *Verdict:* **covered**.

**Covering passage.** Plans/Source_Control_System.md:313 - 'Existing Git conflict/merge/review/graph/stage/commit/stash/branch/compare commands remain Git adapter commands unless the command owner explicitly normalizes them.' Read with Plans/Source_Control_System.md:307 ('The generic command scope admits only those exact nineteen IDs', which do not include any conflict command) and Plans/Jujutsu_Integration.md:269-301 (the frozen 31-ID inventory, which deliberately contains no conflict-resolution command), canon already answers the question the candidate asks.

**Reasoning.** The candidate's premise is that an existing command family serves two backends and has preconditions for only one. Current canon says the family serves one backend. The Jujutsu conflict path is JJI-005, which keeps conflicts typed and terminal without a conflict command. Writing JJ-scoped preconditions onto those four rows would open a surface canon explicitly keeps Git-only, which is the opposite of a correction.

**Currentness.** The covering passage moved from line 308 (continuation 3's citation) to line 313 on current main; its text is unchanged.

### `C4D-02` — mark_conflict_resolved's text-based precondition can contradict JJI-005

*Arm:* deepseek41. *Verdict:* **rejected as inside continuation 3's rejection 'Marker-only conflict command is a JJ owner defect'**.

**Covering passage.** Plans/Source_Control_System.md:313 - 'Existing Git conflict/merge/review/graph/stage/commit/stash/branch/compare commands remain Git adapter commands unless the command owner explicitly normalizes them.'

**Reasoning.** Continuation 3 rejected this exact boundary with this exact reason: 'Frozen Source Control line 308 scopes legacy commands to Git absent explicit normalization; same finding withdrawn from P21/P26.' The candidate asserts that cmd.source_control.mark_conflict_resolved's no_conflict_markers gate is insufficient FOR A JUJUTSU BACKEND. If the command is a Git adapter command, the gate is never applied to a Jujutsu backend and cannot contradict JJI-005. The candidate's premise is the premise continuation 3 rejected, not, as the bundle adjudicator read it, the same boundary from the other side. I differ from the bundle here and say so plainly.

**Residual observation for Jared.** One cosmetic asymmetry is worth passing to Jared without calling it a correction: at Plans/UI_Command_Catalog.md:548 cmd.source_control.open_conflict carries git_available && conflict_present, while at :551 cmd.source_control.mark_conflict_resolved carries only conflict_file_selected && no_conflict_markers, with no backend token, although both sit in the backend-neutral cmd.source_control.* namespace and neither is among the nineteen admitted generic IDs. Owner prose settles the scope; the table does not restate it.

**Currentness.** The row at Plans/UI_Command_Catalog.md:551 is unchanged on current main: 'Marks a conflicted file as resolved after validation confirms no conflict markers remain', condition conflict_file_selected && no_conflict_markers.

### `C4M-04` — Bookmark controls have the hooks for scope disclosure but none of the content

*Arm:* muse13. *Verdict:* **reclassified as product choice**.

**Reasoning.** The gap is real: a repository-wide search of Plans/*.md and Plans/*.json finds no synced, unsynced, polymorphic, combined-bookmark or combined-chip vocabulary anywhere. But it fails both legs of continuation 3's correction test. No canon promise is made false or unfalsifiable by the absence: JJI-006 ac1 promises JJ sections use Bookmarks and Operation Log and never Branches or Stash aliases, which is true; section 4.1 at Plans/Jujutsu_Integration.md:325 permits human copy to say change, bookmark, operation, workspace and conflict, which is permissive, not a completeness claim; and the destructive-action promise is already machine-bound, since JJI-003 requires target-bound confirmation and the confirmation record carries target_binding_sha256. The specific harms the candidate names are also not representable in canon: there is no forget-remote command in the frozen 31 to be confused with delete, and Plans/jujutsu_integration_contracts.schema.json command_request allOf branch 17 already requires a non-null target.remote_identity for track and untrack, so an all-remotes untrack is not admitted in the first place. What remains is a specification of confirmation wording, label distinctions and disclosure content - new user-visible product surface, which the test excludes.

**Set aside for.** A decision card on JJ bookmark control presentation and confirmation scope.

**Currentness.** NOT covered, and not a correction.

### `C4G-03` — merge_editor_available is referenced as a command condition and defined by no owner

*Arm:* glm53. *Verdict:* **reclassified as product choice**.

**Reasoning.** The fact holds on current main: merge_editor_available occurs exactly once in canon, at Plans/UI_Command_Catalog.md:549 as the condition on cmd.source_control.open_merge_editor, plus its generated shard at Plans/_shards/ui_command_catalog/005-2.-canonical-command-ids.md:518. No owner defines it. But the arm's own restraint is right and I keep it: an undefined condition on a command that is a Git adapter command (Plans/Source_Control_System.md:313) and has no handler yet makes no false claim, so the second leg of the correction test is not met. What the flag actually gates is whether Puppet Master ships a structured merge editor at all, which is the same decision as the C4D-04 / C4M-03 / C4G-02 cluster the bundle already routed to the owners.

**Set aside for.** The same decision card as the diff/merge-editor save-surface cluster (C4D-04, C4M-03, C4G-02). If that surface is ever approved, merge_editor_available needs a definition with explicit backend and tool scoping in the same edit.

**Currentness.** NOT covered; not a correction.

## Questions for Jared raised by Part 1

- Record 1 (`C4C-01`/`C4G-01`): behavioural rule in JJI-008 alone, or that plus an `object_verification_depth` field on the restore receipt `$ref`-ing Backup's existing `integrity_verification_level` enum? Only the second is falsifiable by a fixture.
- Record 2 (`C4H-05`): may `graph_states` in `Plans/final_gui_interaction_contracts.schema.json:933` — a frozen `prefixItems` list inside `post_integration_dry_component_reconciliation` — be extended with `divergent`, and should the refusal reuse the existing undefined `invalid_target_identity` code or mint a new one?
- Records 3 and 6 (`C4D-01`, `C4U-02`): one shared version-identity block serving both the closure records and the certification profile, on JJI-022's pattern, or two?
- Record 8 (`C4C-03`): the enumerated machine-local/ephemeral entry list needs a source audit of jj internals no arm ran. Land the three obligations now and carry the list as an open question?
- Record 11 (`C4H-03`) and the relational halves of records 5, 7 and 13: these are rules JSON Schema cannot express. Is the `source_control_contracts` / `jujutsu_integration_contracts` semantic-gate branch in `scripts/pm-new-contracts-verify.py` authorised for them, or do they land as owner obligations marked unenforced?
- Records 16 and 17 (`C4M-04`, `C4G-03`): both are now decision cards rather than corrections. `C4G-03` belongs with the deferred diff/merge-editor save-surface cluster (`C4D-04`, `C4M-03`, `C4G-02`); should they be presented as one card?
- Record 15 (`C4D-02`): I differ from the bundle adjudicator and place this inside continuation 3's marker-only-conflict rejection. Confirm, or reopen it.

## Files

- `adjudication-part1.json` — the machine record, one entry per candidate with verdict, promise, contradiction, currentness and cited passages.
- `ADJUDICATION_PART1.md` — this document.
- `SHA256SUMS` — hash manifest: this record, the bundle files read, the run-state evidence files, and every canon file cited, as of `main` at the commit named above.
- `PROGRESS.md` — step log.
