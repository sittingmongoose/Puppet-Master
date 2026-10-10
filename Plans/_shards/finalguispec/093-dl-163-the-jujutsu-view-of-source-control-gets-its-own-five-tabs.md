# Shard 093: DL-163 — The Jujutsu View Of Source Control Gets Its Own Five Tabs (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L42544-L42728

Source SHA256: `cd565db534a964f90654091d88978a3baf84614c772aee4fc81a7639e14d90f9`

---

## DL-163 — The Jujutsu View Of Source Control Gets Its Own Five Tabs (2026-10-09)

This addendum compiles DL-163, the answer to the owner's question of 2026-10-09 whether the Jujutsu view of Source Control should have tabs. It does: its own strip of the five views the Jujutsu owner already names (`Plans/Jujutsu_Integration.md` section 4.1 and JJI-006), drawn in the Polish grammar of F3-618 to F3-622. The units below own the presentation only. Native semantics, the 31-command inventory and the closed disabled-reason vocabulary stay with `Plans/Jujutsu_Integration.md` (JJI-001 to JJI-022), sections and bookmark disclosure with `Plans/Source_Control_System.md#SCS-005` and DL-057, and the census with F3-529. The concept is source lineage only (`Concepts/leftrail-redesign/src/concepts/d/`, lane commits 8693996260 and 2f77b78710): its example repository, class names and local disabled-reason codes are not canon.

### F3-623 — The Jujutsu Tab Strip, The Engine Switch And The Panel Frame

```yaml
plan_unit_id: F3-623
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  In the left rail each Source Control engine has its own segmented tab strip with one view shown at a time
  (DL-163). Git's strip is Changes, Worktrees, History (which carries the graph) and Branches (which carries
  branches and stashes). Jujutsu's strip is Changes, Workspaces, History, Bookmarks and Operation Log, in JJI
  section 4.1's order and JJI-006's words; it is a separate strip at the top of the Jujutsu view, not Git's strip
  relabelled, and Git's strip, list and footer are hidden in Jujutsu mode while the Jujutsu view is hidden in Git
  mode. Both strips are the rail's one tab component (F3-618 to F3-621), each with its own tablist name ("Jujutsu
  views" for Jujutsu), tabs that carry their selected state and controlled pane, and Left, Right, Home and End
  choosing along the strip with focus following, as on every rail strip (F3-621, amended 2026-10-09 after the
  shared cleanup, DL-163; until then focus waited for the chosen tab to settle). Operation Log's tab icon is a list; the
  undo arrow is kept for the Undo action alone, so no view tab looks like a button that rewrites, and Fetch's
  download icon differs from Refresh's. Selecting a tab of either strip is cmd.source_control.select_tab with that engine's tab set;
  it changes no repository state. Slots 1 to 4 sit in the same positions in both strips (Changes; Worktrees or
  Workspaces; History; Branches or Bookmarks) as a rule about positions, not a claim that the views are
  equivalent: the presentation-only engine switch ui.source_control.profile.preview (F3-529) opens the view in the
  same slot, opens Git's History when it leaves Operation Log, keeps focus on the engine control that was pressed,
  places the shown strip's ink without sliding, and never dispatches cmd.source_control.backend.select. Both
  Source Control strips fit by their longest label rather than the active one (refining F3-620's tab ladder for
  these two strips): every label shows when every tab fits its label; otherwise the active tab keeps its label and
  the others shrink to their icon, no narrower than 24 px, if the longest label would fit as the active one;
  otherwise icons only, each with its full name as hover tag and accessible name, so a strip never changes mode
  while one clicks through it, and icons only is the expected result at the larger text sizes. Publish and review
  is not a tab: it is the card at the foot of both views (F3-622), with one fold state for both engines, while the
  review list and checks stay in that card and their owners (SCS-005, F3-529). In Jujutsu mode the panel head adds
  two icon buttons: Undo, whose hover tag names the newest operation it reverts (cmd.jujutsu.operation.undo), and
  Refresh (cmd.jujutsu.status.refresh), which reads the working copy, bookmarks and operations again and never
  brings an out-of-date workspace up to date. In a colocated repository where Jujutsu is the mutation authority,
  the Git presentation shows Git's mutating controls disabled with the colocation reason and keeps its reads
  (JJI-004); there is one writer only.
gui_related: true
gui_classification_reason: Defines the Jujutsu view's visible tab strip, the engine switch, tab fitting and the panel head in Source Control.
split_recommended: false
depends_on: [DL-163, F3-620, F3-622, F3-529, SCS-005, JJI-004, JJI-006]
unblocks: [F3-624]
acceptance_criteria:
  - "In Jujutsu mode the Jujutsu strip shows exactly Changes, Workspaces, History, Bookmarks and Operation Log and Git's strip is not shown; in Git mode the reverse."
  - "Every engine switch from slot n opens slot n of the other strip, Operation Log opens Git's History, focus stays on the pressed engine control, and no backend selection is dispatched."
  - "At 240 px and 280 px in every theme variant and NieR Mode, neither Source Control strip changes its fit mode while each of its tabs is selected in turn, and no tab label is shortened."
  - "Undo and Refresh appear in the panel head only in Jujutsu mode, and Undo's hover tag names the operation it would revert."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - node Concepts/leftrail-redesign/tools/rail_boot.mjs (concept acceptance on GPU Chrome)
risk_class: rail_presentation_drift
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-163"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06 (issue 2)"
  - "Concepts/leftrail-redesign/src/concepts/d/15-jj.js and css/71-source.src.css, css/73-jj.src.css (lane commits 8693996260 and 2f77b78710; concept lineage only)"
  - "Concepts/leftrail-redesign/src/concepts/d/15-jj.js and css/22-tabs.src.css, the Jujutsu strip on the rail's tab engine with Arrow, Home and End choosing (shared cleanup lane commit a136797dad; concept lineage only)"
preserved_exact_tokens:
  - "Operation Log"
  - "cmd.source_control.select_tab"
  - "ui.source_control.profile.preview"
  - "longest label"
negative_constraints:
  - "Do not relabel Git's strip for Jujutsu, and do not show Git's tabs in Jujutsu mode."
  - "Do not make publishing or reviews a tab, and do not dispatch backend selection from the engine switch."
compatibility_only_notes:
  - "The concept keeps its two strips apart with their own attributes because the shell's tab handler toggles every tab in the panel; the product scopes tab handling to each strip."
stale_retired_dispositions:
  - "Today's PMConcept7 Jujutsu cards without a strip, and Git's four tabs showing through in Jujutsu mode, are retired by this unit."
owner_boundary_notes:
  - "Jujutsu_Integration owns the views' semantics and labels, Source_Control_System owns the section set and bookmark disclosure, and this unit owns how the rail presents them."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Jujutsu_Integration.md
  - Plans/Source_Control_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-163, ContractName:Plans/Jujutsu_Integration.md#JJI-006, ContractName:Plans/Jujutsu_Integration.md#JJI-004, ContractName:Plans/Source_Control_System.md#SCS-005, ContractName:Plans/FinalGUISpec.md#F3-529, ContractName:Plans/FinalGUISpec.md#F3-622

### F3-624 — The Five Jujutsu Views

```yaml
plan_unit_id: F3-624
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The five Jujutsu views (F3-623, DL-163) use two-line rows: line 1 the name with a file letter, an age or a diff at
  its end, and line 2 the state glyph and word (F3-619) and then the facts, left-aligned under the name. Raw commit,
  operation and workspace IDs appear only in a Technical details disclosure in the expanded row (JJI section 4.1);
  whether a change's short change ID may also show on line 2 is an open owner question (DL-163). Every dropdown is
  the chat picker (F3-621). Changes shows the current change @ first: its description or "No description yet",
  its state (conflicted, empty, on an older main, divergent), a note offering Rebase onto main when main has moved,
  a description box with Describe, then New change as the primary action, Squash, and More with Rebase onto…,
  Split, Discard edits and Abandon; then a Conflicts shelf when there are conflicts, read-only with Open diff as
  the way to inspect them (DL-056); then the changed files with their letter, folder and diff. It has no staging,
  no Untracked group, no stash and no per-file discard, and a footnote says every edit is part of the current
  change. Workspaces lists each workspace as Jujutsu names it (default@) with the owner and last activity, the
  Owner dropdown of F3-622, and the states you are here, active, out of date (a stale workspace, JJI-006), missing
  and hidden (JJI-014); Open and Switch stay available on an out-of-date row, which explains how it is brought up
  to date and offers the operation log; Remove is unavailable on the workspace you are in; New workspace says it
  starts a new change beside the current one. History shows Jujutsu's default log view, the mutable stacks and
  main grouped by stack with a label naming the stack's bookmark or "No bookmark", and states what it leaves out
  with Open full history (cmd.jujutsu.history.open); its states are current, conflicted, divergent, empty,
  immutable and pushed. Rewrite actions (Edit, which works on the change chosen, Describe, Rebase onto…, Squash
  into parent, Set bookmark, Abandon) are unavailable on immutable changes, which are the adapter's immutable set
  and not "what was pushed", while New change on top stays available everywhere; a divergent change offers its
  versions as child rows, each acting on its own commit (JJI-003). Rewritten and abandoned show as the change's
  evolution facts and in operation details. Bookmarks shows each bookmark with DL-057's remote-scope word, plus
  conflicted (JJI-019) or deleted here, still on a remote, and "on your current change" where it applies; every
  button names the one remote it touches, Fetch defaults to origin with all remotes as a named pick, Move here
  never moves a bookmark backwards, a conflicted bookmark lists its targets read-only with one Move per target and
  no picker (JJI-019), Rename and Delete confirm from the bookmark's own remote set, naming every remote that keeps
  a copy until its deletion is pushed there, or saying that it is on no remote and nothing on any remote changes,
  Delete never shares a control with forgetting a remote, and a Git shelf shows colocation
  with Import and Export disabled for the upstream race with no fallback (JJI-006). Operation Log leads with Undo
  naming the newest operation, automatic working-copy saves included, then the operations described from receipts
  (JJI-011) with who and where, each expanding to what changed, Inspect, and Restore to this point…, which returns
  the repository to its state right after that operation, so its preview names the later operations it undoes and
  says the operation itself stays; it is labelled apart from Undo and from Backup (JJI-005, JJI-012, F3-553). Group undo, redo, reversing one operation, markers,
  filters and earlier-state browsing (F3-552 to F3-554) are not shown until they are admitted. A blocked
  repository shows one row naming the reason with Open Operation Log, Inspect last operation and Refresh (JJI-003's
  recovery floor), and every mutating control is disabled with that reason. Every control dispatches an existing
  command (the 31 cmd.jujutsu.* commands, cmd.forge.review.*, cmd.file.open, ui.source_control.backup_history.open
  and the shell's routes) and every disabled reason is drawn from JJI-003's closed vocabulary.
gui_related: true
gui_classification_reason: Defines the rows, states and actions of the five Jujutsu views in Source Control.
split_recommended: false
depends_on: [F3-623, DL-163, JJI-003, JJI-006, JJI-011, JJI-012, JJI-014, JJI-019, DL-056, DL-057]
unblocks: []
acceptance_criteria:
  - "Each view shows only Jujutsu sections: no staging, stash, Untracked group or Branches wording appears in the Jujutsu view."
  - "Rewrite actions on an immutable change are unavailable with a reason, and New change on top stays available."
  - "Every bookmark control and confirmation names the remotes it affects before dispatch (DL-057)."
  - "Undo always names the operation it reverts; Restore to this point previews first and is labelled apart from Undo and Backup."
  - "Every control maps to an existing command or route; no new command id, ui.* action or disabled-reason code is introduced."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: rail_presentation_drift
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-163"
  - "Concepts/leftrail-redesign/src/concepts/d/15-jj.js (lane commits 8693996260 and 2f77b78710; concept lineage only)"
preserved_exact_tokens:
  - "Technical details"
  - "immutable"
  - "out of date"
  - "Restore to this point"
negative_constraints:
  - "Do not show staging, stash or a per-file discard in the Jujutsu view."
  - "Do not treat a pushed change as immutable, or offer a rewrite of an immutable one."
  - "Do not render a blocked Jujutsu view without its recovery actions."
compatibility_only_notes:
  - "The concept renders one ready repository; its empty, blocked, setup and no-remote states are specified here but not drawn."
  - "The concept disables some controls with local reason codes the closed vocabulary lacks (immutable_change, immutable_parent, change_empty, workspace_current, bookmark_move_backwards, remote_bookmark_absent, change_description_missing, conflict_surface_read_only_on_jujutsu); admitting codes for them is an open question for the Jujutsu owner recorded in DL-163."
stale_retired_dispositions: []
owner_boundary_notes:
  - "JJI-003 owns the commands and disabled reasons, JJI-012 what undo and restore do, JJI-014 workspace visibility, JJI-019 conflicted bookmarks and DL-057 the bookmark words; this unit only presents them."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Jujutsu_Integration.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-163, ContractName:Plans/FinalGUISpec.md#F3-623, ContractName:Plans/Jujutsu_Integration.md#JJI-003, ContractName:Plans/Jujutsu_Integration.md#JJI-012, ContractName:Plans/Jujutsu_Integration.md#JJI-014, ContractName:Plans/Jujutsu_Integration.md#JJI-019, ContractName:Plans/Decision_Log.md#DL-057
