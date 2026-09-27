# Findings compiled by this ledger

One record per NOW register line of group G1. Each names the register line, what canon said before, and the units the prose now carries. Every `Repairs` sentence names only units this branch changed, and every unit it names is a compile target of the record's own queue item. Register: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493). Design spec: /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de).

## Record 1 — CW-01 (NOW): The configuration sheet contract

Section 3 describes a modal and its field list but not the sheet the redesign ships: its own scrim and single close path, the In your chat preview, the read-back, the estimate (which must never call a provider, MODAL-001..002), team presets, the one Advanced page and the derived card title. Scrim opacity and blur are not stated (card n05).

Repairs CWR-018. Present the configuration modal as a sheet with one close path, a preview that becomes a card only after Start, a true read-back, a no-provider estimate, prefill-only presets, one Advanced page mapped to the section 3 fields, and a derived card title.

## Record 2 — CW-03 (NOW): Card densities and the state-to-density mapping

Section 4.1 had one collapsed and one expanded card with a bounded transcript slice and a Usage summary. The redesign presents eight densities and must not show a run that waits after it started as not started (section 2.1). Which facts and actions each density keeps (card p05) and the card motion (card n04) are not compiled.

Repairs CWR-019. Eight densities derived from run state, the owner-reason rule for waiting, a result only on clean completion, the three-lane slice with a +N more row, and the meta line.

## Record 3 — CW-04 (NOW): The run view as an editor document

Section 4.2 described a panel that pins or transient-docks beside Activity. The redesign opens the full record as an editor document tab, which needs stable ids, no duplicates and a single place for run-changing controls.

Repairs CWR-020. The full panel becomes one editor-pane document per run: open or focus, stable ids, kind tabs, destination stays visible, one control set per run, approvals stay in the card.

## Record 4 — CW-08 (NOW): The Crew Auto evaluator and the admission source

Section 5.3 named criteria but not how the sheet preview and admission agree, or how a run records that Crew Auto started it. The concept overwrote the member cap from the roster length. The row label (card p01), the receipt (card p11) and where the criteria are stored (Settings, excluded) are not compiled.

Repairs CWR-021. One pure deterministic evaluator shared by admission and the sheet preview, no provider call, nothing created on decline, admission_source and crew_auto_revision on every run, and a member cap the team never raises.

## Record 5 — CW-09 (NOW): Build With Crew: the visible sheet title and the plan-changed refusal

Section 5.4 and MODAL-013..014 require the atomic plan build and the refusal of a changed Plan, but canon had no visible title for the sheet or the refusal code it shows.

Repairs CWR-022. The Build With Crew sheet is titled Build this plan with a Crew, keeps the canon name on the Plan card, dispatches the plan command and refuses in place on a changed Plan.

## Record 6 — CW-10 (NOW): Chat Room: added rounds, the explicit waiver and the kind rows

Section 6.3 describes reconfiguration but not the two card actions the redesign uses, and the Chat Room Advanced rows had no definition fields. Mid-round sends (card n03), End discussion (card p15) and the Moderator mapping (card p17) are not compiled; promotion of points, Goals and artifacts and the message-size cap are excluded.

Repairs CWR-024. Add 2 more rounds and Continue without map to reconfigure (a system entry and an explicit waiver), and the four Chat Room Advanced rows become definition fields.

## Record 7 — CW-11 (NOW): The Review sheet: target preview, focus roles and the evidence rule

Sections 7.3-7.4 list the Review modal's fields but not how the sheet shows a target that changed while it was open (MODAL-009..010), how focus areas reach reviewers, or the evidence rule the redesign adds. The display word for the frozen pack (card p19) is not compiled.

Repairs CWR-025. The target control reads a read-only preview query, a changed target is shown and chosen explicitly, focus areas become reviewer roles, taught rules become user_constraint_refs, and the evidence rule is a new field.

## Record 8 — CW-12 (NOW): Review follow-ons: default selection, re-run comparison, partial and stale actions

Section 7.6 said only selected confirmed findings; the redesign preselects a set and shows a fixed, still open and new comparison across runs, which canon had to keep from ever merging. Send Findings To Agent filling the message box (card p07) is not compiled.

Repairs CWR-026. Create To-Dos preselects confirmed findings with evidence and stays editable, a re-run shows a display-only comparison by finding_key, and the partial and stale actions map to existing commands.

## Record 9 — CW-13 (NOW): BrainStorm: voting labels, must-haves, synthesis and provisioning rows, phase labels, ties

Sections 8.5-8.6 define the protocol and hard constraints but not the fields the sheet writes, the plain phase labels or a tie action. The concept's old voting label misstated the rule as a majority. The label for the synthesis button (card p19) is not compiled.

Repairs CWR-027. Voting labels state the evidence rule, must-haves are hard_constraints[] frozen at Start, the synthesis model and provisioning posture are definition fields, the plain phase labels map to the seven phases, and a tie synthesizes with tie_resolution coordinator.

## Record 10 — CW-14 (NOW): Specialists in the Add specialists shelf

Section 9.4 placed specialists in a footer section and said nothing of their own model route or where they are refused. What Grill Me means inside Crew and Chat Room stays open (card p18).

Repairs CWR-028. Specialists are added from a shelf with their own model (Wonderer also its Persona), map to ParticipantSpec additive_role_kind, and are refused in Crew Auto teams and scheduled-build Crews.

## Record 11 — CW-15 (NOW): The configuration fields the sheets expose

The section 12 definition had no field for several choices the sheets expose. Per-kind limits (card p16), the substitution policy (card p03), roster templates and the Settings key names are not compiled.

Repairs CWR-032. CollaborativeDefinition gains the stuck, shared-notes, evidence, Chat Room and BrainStorm fields so every sheet choice is in the committed definition.

## Record 12 — CW-19 (NOW): The completion projection gains clean_completion and allowed_actions

PART-016..020 defines the projection with an open attention_reason and no list of allowed actions, so decision rows had nothing canonical to read. The limit-reached member waits on card p16.

Repairs CWR-029. The existing completion projection carries clean_completion and allowed_actions with a closed attention_reason set, and decision rows read only it.

## Record 13 — CW-21 (NOW): The participant activity projection

Canon had no source for the card's lanes, so a lane's verb and quote had no contract. The projection references EP-128's statuses without redefining them; live partial text waits on card p14.

Repairs CWR-030. A derived, never persisted projection of each participant's state, verb, detail and quote source, built from existing records and the EP-128 stream vocabulary.

## Record 14 — CW-23 (NOW): Command revisions to open, reconfigure, message and export

The section 10 rows did not match the redesign's controls: no run-view target or focus, a reconfigure usable on completed runs, messages allowed into finished runs, and four export actions with no content kind. The send-findings result change (card p07) is not compiled.

Repairs CWR-031. open gains target and focus, reconfigure is limited to live states and never reconfigures a completed run, message is unavailable on terminal runs, export gains content_kind.

## Record 15 — CW-24 (NOW): The tie payload, the stale-target waiver and the Build With Crew producer

Canon allowed finishing a stale review and resolving ties but named no payload for either, and did not say which sheet produces the Build With Crew command. End discussion and the research command (card p15) and the Crew Auto command revisions (cards p01 and p11) are not compiled.

Repairs CWR-031 and CWR-027. tie_resolution coordinator on synthesize_plan, accept_stale_target on reconfigure while target_pack_stale holds, and build_with_crew never decomposing into start.

## Record 16 — CW-25 (NOW): The collaboration view-state census

MODAL-015..018 says no command is minted for a visual toggle but did not name the redesign's new view state. The ELI5 disclosure (card p08) is not compiled; the recorded-example completion control is excluded.

Repairs CWR-033. The expand tri-state, the in-card More row, the run view tab and participant, dock reveal, the Advanced page, the stashed Crew draft and revert-view are view or draft state with no command.

## Record 17 — CW-27 (NOW): A coordinator failure shows Needs attention

PART-016..020 requires Needs attention on a coordinator failure; the concept dropped the status word. The recorded-example label is excluded.

Repairs CWR-029. A coordinator failure sets attention_reason coordinator_failed and the card shows Needs attention with its allowed actions; no participant silently becomes coordinator.

## Record 18 — CW-28 (NOW): Build With Crew is one transaction

Assistant_Plan_Runtime already requires the atomic admission; this owner recorded it only as MODAL-013..014 prose, so the rule is restated as a unit tied to the sheet's refusal.

Repairs CWR-023. The CollaborativeRun, the PlanRun and the To-Dos commit together or not at all, with the plan-changed refusal; no new contract.
