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

## WAIT wave (2026-09-27): lines compiled after the owner answered their decision cards

Each record below compiles only what the owner's answer settles, as recorded in `Plans/Decision_Log.md` (both sections). The answers are in /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json (SHA-256 4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f). Parts an entry leaves to lead follow-up stay open questions.

## Record 19 — CW-02 (WAIT, answered): An unavailable chosen model blocks Start

Canon contradicted itself: section 2.2 and section 15 spoke of acceptable substitutes, while PART-021..024 said Start is blocked or needs explicit replacement. Card p03 chose blocking (Decision_Log entry 121).

Repairs CWR-034 and CWR-018. No stand-in for a chosen model at Start, not even a same-provider one; the sheet's substitution row becomes a sentence; after Start, replacement stays explicit.

## Record 20 — CW-03 (WAIT, answered): Compact card faces and theme-family motion

Section 4.1 lists facts and actions every card shows; the collapsed face and the receipt drop some of them. Card p05 allowed it, card n04 gave each theme family its own motion personality without defining one, and card n06 made Reduce Motion instant.

Repairs CWR-035. Actions may sit behind Expand and the count in the hover card below 520 px, a finished run's Message is disabled with its reason, motion follows the theme family and Reduce Motion is instant; the per-family rules stay open.

## Record 21 — CW-05 (WAIT, answered): The Activity chip and the compact Activity Detail

Section 4.4 routed every click through Activity Detail and the 2026-09-08 rollback asked for native cards and grids there. Card p04 allowed the short team list for the four kinds.

Repairs CWR-036. The chip reveals the newest card, hover rows still route to Activity Detail, and the four kinds show a short team list there, with the full content in the run view.

## Record 22 — CW-06 (WAIT, answered): Helpers on screen

Section 4.5's example said 4 participants, and the concept showed a Read marker canon never defined. Card p06 chose helpers on screen with participant kept in data.

Repairs CWR-036. Screens say helpers (reviewers in Review), records keep participant, the ribbon example reads 4 helpers and no read marker is shown.

## Record 23 — CW-07 (WAIT, answered): Coordinator specification and coordinator-authored parts

Section 5.2 and CWR-004 made expected outputs and dependencies sheet fields and left the coordinator untyped; the self-approval rule for a lead that also works had no checker. Cards p10 and p17 answered both.

Repairs CWR-037 and CWR-004. coordinator_spec is typed, the coordinator authors expected outputs and dependencies at split time, and this chat's assistant checks a lead's own part.

## Record 24 — CW-08 (WAIT, answered part): The Crew Auto settings row

Section 5.3's menu had no route to the Crew Auto sheet other than the check. Card p01 kept the Plans and added only Crew Auto settings…; the Crew Auto receipt (card p11) is still unanswered.

Repairs CWR-038. The Multi-Agent submenu gains Crew Auto settings… under the check, and Manage Defaults… keeps its name and route.

## Record 25 — CW-10 (WAIT, answered part): Chat Room mid-round sends, End discussion and the Moderator

The concept refused mid-round sends while its copy said the message waits; End discussion had no command; the Moderator row had no field. Cards n03, p15 and p17 answered all three, but who receives a mid-round steer is left to the lead.

Repairs CWR-024. A mid-round message queues for the next round unless sent now to steer without interrupting, End discussion settles the room completed, and the Moderator writes coordinator_spec.

## Record 26 — CW-11 (WAIT, answered part): The display word snapshot

The screens needed a plain word for the frozen target pack. Card p19 approved snapshot on screen with the data word kept.

Repairs CWR-025. Screens call the pack the snapshot; records and commands keep ReviewTargetPack and frozen target pack.

## Record 27 — CW-12 (WAIT, answered part): Send Findings To Agent fills the message box

Section 7.6 and section 10 sent findings as a message straight away. Card p07 chose filling the message box.

Repairs CWR-031. Send Findings To Agent writes a fix request into the empty composer and never sends it.

## Record 28 — CW-13 (WAIT, answered part): Write the plan

CWR-027 left the synthesis phase and action without a plain label. Card p19 approved Write the plan.

Repairs CWR-027. The synthesis phase and action read Write the plan; the command id is unchanged.

## Record 29 — CW-14 (WAIT, answered part): Grill Me is a skill

The identity of Grill Me was contested between Persona and skill. Card p18 made it a skill; its question allowance outside BrainStorm stays open.

Repairs CWR-028. Grill Me is a methodology Skill, never a Persona, so its row has no Persona picker.

## Record 30 — CW-15 (WAIT, answered part): A run's own limits, and no substitution policy

Section 2.4 let configured limits only narrow, so a sheet could promise more time than the general run limit allows; the register also proposed a substitution policy field. Cards p16 and p03 answered both.

Repairs CWR-032. The definition's time and cost limits override the general run limit for the run, token and concurrency ceilings still narrow, and no substitution policy is stored.

## Record 31 — CW-17 (WAIT, answered): Review and BrainStorm keep their entry points

The register asked whether to record an exception to CWR-017 for wand rows. Card p01 kept the Plans unchanged.

Repairs CWR-038. Review keeps the mode menu and BrainStorm keeps Deep Plan as their entry points, with no wand rows in canon.

## Record 32 — CW-23 (WAIT, answered part): The send_findings result and refusal

Section 10 returned CollaborationMessageResult for send_findings_to_agent. Card p07 changes the command to fill the composer.

Repairs CWR-031. The command returns ComposerBufferResult and refuses composer_not_empty.

## Record 33 — CW-24 (WAIT, answered part): New command rows and the Crew Auto commit

Section 10 had no command for ending a room or checking a Wonderer lead, and the Crew Auto primary could dispatch twice. Card p15 added all seven commands and card p01 answered the menu label; the Crew Auto receipt surface waits on card p11.

Repairs CWR-031 and CWR-038. cmd.chat_room.end and cmd.brainstorm.research_lead join section 10, open_config gains the workflow_modal surface, and one Crew Auto click dispatches one cmd.chat.crew_auto.set.

## Record 34 — CW-26 (WAIT, answered): Team presets per kind

Canon had no preset catalog, registered none of the preset Personas for teams, and the concept hid presets on Review. Cards p18 and n08 answered; which Review presets ship is open.

Repairs CWR-039. A built-in preset catalog for every kind including Review, prefill only, using the Personas registered for team use, with Grill Me only as a specialist row.

## Record 35 — CW-18 (lead ruling): Crew Auto is the assistant's permission, on by default

Section 5.3 treated Crew Auto as automatic admission that opens its sheet before the check appears, the legacy per-chat Crew switch had no ruling, and the owner's answer (the agent may summon Crews; Crew Auto tells it that it may) was not reconciled with the deterministic evaluator. The design lead ruled on the owner's behalf: Crew Auto is the assistant's permission, on by default for a project, a chat's check overrides it for that chat, and the evaluator stays the gate.

Repairs CWR-004, CWR-021 and CWR-038. Crew Auto is the assistant's permission to start a Crew by itself, on by default for a project and overridable per chat; the assistant starts one only when Crew Auto is on for the chat and the evaluator admits the request; Build With Crew stays a user choice; no separate per-chat switch; the request names its scope, project or thread.

## Record 36 — CW-08 (answered part): Crew Auto's note in the chat

Canon had no chat record for turning on a project-wide setting. The owner kept the note, worded for the project.

Repairs CWR-038. Turning Crew Auto on for the project leaves one line in that chat, Crew Auto is on for this project, owned by this document and never a run, card or Usage; its Change control opens the sheet from the crew_auto_receipt surface.

## Record 37 — CW-10 (lead ruling): Who reads a mid-round steer

A message sent now during a Chat Room round steered the round without interrupting it, but canon did not say which participant receives it.

Repairs CWR-024. The next participant to speak reads a steer first, and every later speaker in that round sees it; no turn is cancelled.

## Record 38 — CW-26 (lead ruling): Review's team presets

Review offered presets but named none.

Repairs CWR-039. Review ships Careful review (the default), Quick check and Deep audit.

## Record 39 — CW-20 with the CW-19 WAIT part (lead ruling): How a run at its limit ends

A run's own limit overrode the general one, but canon did not say how a run that reaches it ends, and the register proposed a limit_reached attention reason.

Repairs CWR-029. A run at its time, cost or token limit settles cancelled with a stop_reason, reads Stopped at your limit and is never a failure; no run state and no attention reason is added.

## Record 40 — CW-04 (section 18 leftover): The run view in the verification section

Section 18 still tested that a card pops out to a full panel after section 4.2 became the run view.

Repairs CWR-020. Section 18 now tests that a card opens the same run in the run view docked in the editor pane, as CWR-020 specifies.
