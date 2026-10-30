# Shard 079: Grill Me rounds and agreement — DL-218

Source: `Plans/assistant-chat-design.md`

Source lines: L28057-L28488

Source SHA256: `8ff8cd2ffe0dc8e681ec6e6df5253dcbbea369bfbef0c0c2c07ef8aa382dae68`

---

## Grill Me rounds and agreement — DL-218

This is a profile of section 7.4's existing questionnaire, consumed by CWR-042, CWR-043 and APR-072. It adds no alternate question store. The host numbers the round's frontier questions and marks the recommended option in its description; that existing option ID is seeded through default_values. The recommendation is only a draft. Accepting an individual recommendation uses cmd.questionnaire.draft_update on that question’s PM-managed draft; it submits no other question. One explicit cmd.questionnaire.submit accepts all validated answers in the whole round. Answers from completed rounds are staged for the session, not yet decisions the workflow may act on. I don't know is a supported freeform answer: it removes that decision from the frontier, lists it as open in What we agreed and does not ask it again unless the user reopens it.

The session ends by itself only when no decision is ready, no fact research is pending and no branch is unsettled. A decision left open, and every decision that depends on it, is listed as open in What we agreed and does not count as an unsettled branch. If every remaining question waits on research, the host waits, says it is looking things up and recomputes when research returns. Automatic completion, the safety cap and Wrap up each show that session's What we agreed card with every answer and every open decision and reason. It is a review of existing answers, not a new charged QuestionItem. Wrap up uses cmd.questionnaire.grill_me.wrap_up and preserves any unfinished draft without submitting it. Confirm uses cmd.questionnaire.grill_me.confirm against the current agreement revision; only its acknowledged owner result confirms the accumulated decisions. Keep going uses cmd.questionnaire.grill_me.keep_going to return to the same interview with its answers and one counter intact. At the cap it may revisit existing answers but cannot admit another fresh question. Each newly presented question is still charged once under QMAX; a recommendation, action button or agreement render charges nothing.

The three typed request/result pairs live in Plans/assistant_chat_contracts.schema.json and its fixture pair. They reference the existing host session and source flow, current questionnaire and agreement, revision and currentness; they define no new durable record family. The session states interviewing, awaiting_confirmation and confirmed describe this profile's owner state, not new QuestionnaireEnvelope.flow_state values. The envelope's answer sources, response_kind and lifecycle enums stay locked. Authenticated host user provenance, revision checks and idempotent replay apply; an actor_ref string supplied by an agent is never proof of user action. Dismissal still pauses, resume restores the same paused envelope, and neither confirms or wraps up. No step may consume the staged agreement before that session's current Confirm. Initially this gates Plan writes, Crew split, room round 1 or BrainStorm blind proposals. Enabling Grill Me mid-run starts the interview at the next round, assignment or phase boundary; already running work continues, and only the step using new answers waits. Every later decision session ends in its own What we agreed revision with fresh Confirm and the same question counter. A stale confirmation changes nothing. The controls never mutate a target project, start execution or grant permission. No EventRecord is admitted (DL-093).

### ACD-503 - Grilling Rounds And What We Agreed

```yaml
plan_unit_id: ACD-503
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  DL-218 makes Grill Me use the existing QuestionnaireEnvelope host: numbered frontier questions, a
  recommended option seeded by default_values, edits or acceptance of one recommendation through
  cmd.questionnaire.draft_update, and explicit cmd.questionnaire.submit to accept the whole ready
  round. Default selection is no submitted answer. The host stages round answers until What we
  agreed lists every answer and every open decision. The interview ends by itself only when no
  decision is ready, no fact research is pending and no branch is unsettled. A decision left open,
  and every decision that depends on it, is listed as open in What we agreed and does not count as
  an unsettled branch. A frontier blocked on research waits with looking-things-up feedback and
  recomputes on return. I don't know removes a decision from the frontier and lists it as open until
  the user reopens it. Wrap up and exhaustion may end earlier with open items listed.
  cmd.questionnaire.grill_me.wrap_up ends questioning without submitting incomplete drafts;
  cmd.questionnaire.grill_me.confirm confirms that current agreement;
  cmd.questionnaire.grill_me.keep_going returns to the same interview and recomputes its frontier
  with the existing answers and question count. These are session operations, distinct from dismiss,
  resume and round submission. The three request/result pairs are
  QuestionnaireGrillWrapUpRequest/QuestionnaireGrillWrapUpResult,
  QuestionnaireGrillConfirmRequest/QuestionnaireGrillConfirmResult and
  QuestionnaireGrillKeepGoingRequest/QuestionnaireGrillKeepGoingResult in
  Plans/assistant_chat_contracts.schema.json. They reference existing host state, add no durable
  family and preserve locked envelope enums. Only authenticated host user actions and current
  agreement revisions may commit; retries return the original outcome. Grill Me enabled mid-run
  starts at the next round, assignment or phase boundary. Already running work continues; only the
  step consuming new answers waits for Confirm of that session's current agreement. Every later
  decision session has its own What we agreed revision and fresh Confirm, with no reuse of an
  earlier confirmation for new answers. The host never resets the shared question counter. The cap
  remains a safety net; Keep going at the cap may revisit existing answers but admits no new
  question. What we agreed and its controls are not charged QuestionItems. No control mutates the
  target project, starts execution or grants permission.
gui_related: true
gui_classification_reason: Defines the visible controls and their owner behavior.
depends_on:
- ACD-459
- CWR-042
- CWR-043
- APR-072
unblocks: []
acceptance_criteria:
  - "Each recommendation uses an existing option and remains a draft until explicit user submit; accept-the-round submits all validated responses once."
  - "Pending fact research keeps an otherwise blocked interview waiting, with visible feedback and recomputation when research returns."
  - "I do not know leaves an open item outside the frontier until reopened."
  - "Automatic completion requires no ready decision, pending fact research or unsettled branch; Wrap up and exhaustion list open items. A decision left open, and every decision that depends on it, is listed as open in What we agreed and does not count as an unsettled branch."
  - "Each session has its own current agreement and Confirm; stale and repeated actions do not release a later gate."
  - "Mid-run enablement starts at the next boundary, preserves running work and gates only the step using new answers."
  - "Keep going preserves answers, session and the shared counter."
validation_surfaces:
- python3 scripts/pm-new-contracts-verify.py
- python3 scripts/pm-plan-index.py validate
risk_class: grilling_confirmation_boundary
reasoning_tier: high
context_scope: wonderer_grill_me_companions
implementation_surfaces:
- Plans/assistant-chat-design.md
- Plans/assistant_chat_contracts.schema.json
- Plans/assistant_chat_contract_fixtures.json
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md DL-218"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DECISIONS.md sha256:dfa2f354936defd187d610de4aee77a3d8b75b6d25692e592ba48f7b66bfebce"
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/DEFAULTS-APPROVED.md sha256:f199f188e3e4b1ecd5474a1bc2f87c2d5156863909eb9de9cc3ee9fcb7bfd5be"
preserved_exact_tokens:
- default_values
- cmd.questionnaire.submit
- cmd.questionnaire.grill_me.wrap_up
- cmd.questionnaire.grill_me.confirm
- cmd.questionnaire.grill_me.keep_going
- What we agreed
negative_constraints:
- Do not infer a user answer from a preselection.
- Do not act on answers before Confirm.
- Do not add envelope enum values or a second question counter.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Collaborative_Workflows.md#CWR-041, ContractName:Plans/Collaborative_Workflows.md#CWR-042, ContractName:Plans/Collaborative_Workflows.md#CWR-043


### ACD-504 - The Hosted Chat Replaces The Stand-In

```yaml
plan_unit_id: ACD-504
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The 5.6 Pro chat is the Home column's conversation surface (DL-232), replacing the scripted stand-in
  under F3-637 and bound by ACD-500, ACD-501 and ACD-502. One History list serves it; History pin is
  the column's ui.chat_column.pin_history and its header menu carries the column's Keep open choice.
  Activity Detail and its bounded hover previews remain inside the chat. The lab header, lab editor
  pane, lab status bar and chat-local Demo Studio launcher are absent from hosted mode. Booting the
  chat opens no plan or other panel tab. Every opened body uses the correct host kind and domain
  identity from ACD-500: exact plan revision and Deep Plan discovery as plan, versioned artifact as
  artifact, file or diff as editor, child transcript as transcript, collaboration and evidence as run
  or its owner document, thread detail as context, rules/memory/revert/debug/Lens/Wonderer as
  document, tool calls as record, addresses as browser, command sessions as terminal. The host owns
  each body, its strip, deduplication and focus, and reports close and activation so the chat's run
  card relinquishes or restores its controls. A user open takes focus, an unsolicited agent open stays
  in the background, and modifier file opens keep F3-634's rules. Wand setup and thread dialogs remain
  app modals; attachments open their artifact/file owner while More Info remains a popover; Plan
  Export/PDF remains a print/download and Send to Planning Wizard remains page navigation. The stale
  Goal document never returns: Goal remains in Activity Detail. The compact command card hands off to
  the existing terminal and retained-output routes, never draws an interactive shell or adds Explain.
  Presentation follows the app's Basic, Friendly, Glass and Retro light/dark looks, its fonts, NieR
  Mode parts and Reduced Motion; container width drives the chat and hosted tab bodies, while app
  modals use the window. The app's hover controller owns tags and the sheet's keyboard trap exists
  only while that sheet is open; unmodified chat shortcuts require focus in chat and Escape stops at
  the innermost surface. Settings preferences follow SSYS-055; a concept adapter exposes renderer
  projections without making those global names product APIs. DL-218's Wonderer and Grill Me behavior
  and DL-231's automatic Chat Room rounds remain intact. All demonstration launches and family mixers
  are sections of F3-649's one Demo Studio. The port's screenshots, fixtures and browser checks remain
  concept evidence; unmet native requirements stay owed. Amended 2026-10-23 (DL-233): the concept's
  scripted stand-in chat and its Demo Studio swap are removed; the hosted assistant is the column's
  only conversation surface, and its own controls open the panels. Demo fixture
  workspaces may use ordinary Home tabs under the concept-only disposition of ACD-500, never native
  kinds or product routes. Integrated concept 59ca2d4382 implements the id-to-kind table in
  pm7-port/js/60-surfaces.js: plan aliases converge on one plan tab; deep-discovery is plan; bare and
  revision artifacts are artifact; thread-<agent> is read-only transcript; collab-run, crew-work,
  review, room, brainstorm and their evidence are run; teach, memory, revert, debug, lens and wonderer
  sources are document; search, mcp, app and work-record are record; link is Home Browser; file is
  the Home editor, with a change opening diff view. goal-artifact opens Activity Detail without a tab.
  Lab workspace ids are marked lab and open concept-only document bodies; an unknown id falls back
  to document, not a newly admitted product kind. D7 file gestures and D8 background agent opens use
  Home's opener and narrow rule. A run card says Deciding in the panel beside the chat while its run
  tab is active in any visible panel; closing, collapsing or hiding that panel restores the card's
  controls. Browser capture must keep its originating thread and composer destination even after a
  thread switch; the concept retains the thread and isolated direct delivery preserves the saved
  destination, but Astra's round-2 check finds that composer attachment/list/insertion paths still
  lose it when the origin composer's destination changes. Those paths need destination restoration
  or mismatch refusal before draft mutation. context:<thread> actions target that tab's own thread.
  Attachment Open uses D7 for a known
  project file, its existing exact artifact route, or an artifact-kind
  attachment:<tid>|<mid>|<aid> viewer. More Info is now a bounded popover. Images have a preview; other
  attachment kinds disclose that the concept has no preview, and browser captures are labelled
  fixture drawings rather than real screenshots. The Shell slot is the terminal's PMT.card with Open
  in Terminal, View output for a gone session and Rerun in Terminal, without a separate Show Terminal
  button; the simulated shell does not implement every real command. Wand sheets remain window-centred
  app modals. Demo Studio's Chat section follows Workspace and contains Guided examples, Moments,
  and Takes (family takes, recipes and motion voice), plus Show the chat and Reset the chat demo.
  Start offers chat recipes; Workspace offers layouts and agents opening things, with no stand-in row
  (DL-233). Snapshot inventory and demo-lane reconciliation remain concept-only lineage in
  demo-inventory-20261022.md, cited in source_lineage, never product counts or native evidence.
  Final acceptance remains pending for the hover press defect, Persona clipping, shelf-header and
  plate-spacing sweep, and films. The window-based isPhone helper and scoped body-level overlay
  wrapper do not prove ACD-501's full container and single-root requirements. SSYS-055 separately
  records the Thought Stream preference, whose live display streams the concept's recorded reasoning
  (ACD-221, DL-234), and session-only All chats ELI5; neither is native completion.
  Astra also finds that the shared activeEditor/editorRevealed projection still counts a hidden Home
  panel after collapse or leaving Home. The separate run-card visibility wrapper passes; fixing that
  shared editor state remains pending and is not implied by the run-card result.
gui_related: true
gui_classification_reason: Defines hosted conversation presentation, opened surface kinds, shared preferences and focus behavior.
split_recommended: false
depends_on: [DL-232, ACD-500, ACD-501, ACD-502, ACD-503, DR-075, SSYS-055, DL-234]
unblocks: []
acceptance_criteria:
  - "One hosted chat replaces the stand-in without seeding a plan tab, duplicate History or lab chrome."
  - "Each surface opens through the existing owner and kind; closing or activating a run tab updates its card."
  - "All admitted preferences use SSYS-055, and concept-only choices remain in the Demo Studio."
  - "Wonderer leads, Grill Me agreement confirmation and Chat Room automatic rounds preserve DL-218 and DL-231."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: hosted_chat_owner_drift
reasoning_tier: high
context_scope: chat56_pmconcept7_port
implementation_surfaces:
  - "Plans/assistant-chat-design.md"
node_compile_hint:
  mode: owner_presentation_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-185"
  - "/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D3, D4, D7, D8, D9, D26, D27, D28)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/CONTRACT.md, SHA-256 10adf449002887257c2a95eb97bf25d923e68a1650264622b6461e954f87389b (concept integration lineage, not native API authority)"
  - "/mnt/Cursor/share/puppet-master/2026-10-20-wonderer-grill-me-concept/PORT-CARRY-OVER.md, SHA-256 67195793eeda6a463b5e2da60e7ae294ae62ef435a4a89e56fcd3e25587884fa (accepted layout and styling repairs)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/lead-checkpoint-20261022-2155.md, SHA-256 9063fdc033b2aac0d2558eba612d2f0ab33b032f0a0df72c848c21112ee72e98 (lead checkpoint; concept integration and rulings, not native proof)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/demo-inventory-20261022.md, SHA-256 3f1f8f372c1ec03a047cd6936853f14f3b745b056791bd2f7a30d929a00e60cd (concept-only Studio inventory, not product counts or native APIs)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/integrated-behavior-59ca2d4382.md, SHA-256 108510ec4a80a24dc8a3fe05d7c45ebb7632934cd5b36bfd4edb3f01f833c649 (lead integration brief, corroborated against concept source; not native or final visual verification)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/capture-destination-r2-gap.md, SHA-256 9f8937823eeac12174ab07a023a4c3d5b867bf94b498e99e5b96aeaafb691208 (Astra round-2 verified composer destination gap; corrects the broad integrated capture claim)"
  - "/mnt/Cursor/share/puppet-master/2026-10-22-chat56-port/handoff/plans-sources/astra-r2-verified-capture-visibility.md, SHA-256 00e29db6dca53bbaeb5f3414acd13be6b36ab5c7af2f61a4ccfdf45e9158bcd7 (frozen partial independent review: shared editor visibility and composer destination gaps; separate run-card visibility passes)"
preserved_exact_tokens:
  - "Demo Studio"
  - "Keep open"
negative_constraints:
  - "Do not draw a second editor pane, context drawer, browser modal or inline terminal in hosted mode."
  - "Do not weaken ACD-500 when an implementation is incomplete."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - "Plans/assistant-chat-design.md"
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/FinalGUISpec.md#F3-659, ContractName:Plans/Settings_System.md#SSYS-055, ContractName:Plans/Decision_Log.md#DL-218, ContractName:Plans/Decision_Log.md#DL-231


### ACD-505 - Processes Activity Domain

```yaml
plan_unit_id: ACD-505
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  D1–D4/D7–D14, G4/G5/G7; F3-664. Processes is the tenth domain after Subagents; it covers this
  thread/subagents’ processes, scripts, servers, watchers, browser sessions and scheduled runs. Subagents
  stay separate and appear only as linked owners here. Presence requires running/input work, retained while
  card/detail open; scheduled/finished alone never keep icon. By state orders Needs input, Running,
  Scheduled, Finished this session; many subagents can use By owner. Hover uses existing
  dwell/compaction/tones; full detail has Stop and thread Stop all and bounded output. Footer says composer
  Stop ends reply only. Prompt quick answers are safe-first yes/no; other input opens exact terminal.
  Processes uses console glyph, agent category robot, individual rows Pip; glyph colour/backlight use
  common domain tones. All consume SIR-054 and one needs-you set, no duplicate runtime.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-241
- SIR-054
- F3-533
- ACD-471
- ACD-476
unblocks: []
acceptance_criteria:
- Only this thread/descendants’ eligible work appears, with subagents linked as owners rather than duplicated
  as processes.
- D4 presence/retention rules and By state/By owner ordering hold in hover and full detail.
- Stop all is thread-scoped, composer Stop stays reply-only and input/terminal/delivery actions preserve exact
  owner identity.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- Concepts/background-activity/opus-5.5/HANDOFF.md (22 checks rewritten for native owner surfaces)
- 60 fps GPU recordings across ten looks, narrow/short widths and Reduced Motion
- python3 scripts/pm7-build-check.py
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-241, ContractName:Plans/Shared_Integration_Runtime.md#SIR-054, ContractName:Plans/FinalGUISpec.md#F3-533, ContractName:Plans/assistant-chat-design.md#ACD-471, ContractName:Plans/assistant-chat-design.md#ACD-476




### ACD-506 - Full Activity Detail And Dynamic Chat Width

```yaml
plan_unit_id: ACD-506
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  G1–G3/G9, DL-254. Activity-bar click directly opens full-size Activity Detail, never a small transient
  view; Pin/unpin changes lifetime across thread switches only. Within the current thread, keep it until ×, Esc or icon-again. If dock
  does not fit, widen chat within
  centre/page floor; at window limit cover transcript at full column height. No fixed 760 px cap; preserve
  400 px message minimum, current centre floor/narrow ladder and History’s user-sized pin. Popped-out chat
  uses its actual container. Activity/History/attachment floating Glass plates use persona/model menu
  plate. Friendly/Glass context ring is continuous, antialiased and never segmented by broken transforms.
  All ten looks, widths 860/1024/1280/~1390/1920, narrow/short, Reduced Motion and drag budgets are
  acceptance surfaces. W7/C5 context-ring clause is an acceptance outcome, not an asserted diagnosis: open
  investigation PM7-C5-CONTEXT-RING remains owned by the activity GUI lane until its report identifies the
  renderer/token cause and resulting drawing rule. Do not invent a causal fix from this prose. Recheck
  Friendly/Glass at actual widths/DPR/Reduced Motion after that implementation; Step 4 reconciles its
  measured mechanism. G1 B (Jared 2026-10-30): Pin/unpin is the view-local ui.activity_detail.pin action
  (binding chat.activity.pin), default false. Pinned Activity Detail stays open across thread switches and
  reprojects the selected thread’s data; unpinned detail closes on a thread switch. Pin changes lifetime only:
  one full-size docked-or-full-height-cover view, no small form. A switch cancels stale subscriptions and
  never leaves the previous thread’s rows/actions in the new thread. A missing domain shows its truthful
  empty/unavailable state. Pin is session view state, not a Settings row, durable layout field or runtime
  mutation.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-254
- F3-637
- F3-535
- DR-067
unblocks: []
acceptance_criteria:
- Every Activity domain opens full detail directly, widening then covering transcript at full height when
  constrained, without a small view.
- Pinned detail follows selected-thread data across switches; unpinned detail closes on a switch, and stale
  rows/actions/subscriptions are removed.
- Chat drag has no fixed 760 cap and preserves the minimum, centre/page floor, user History width and narrow
  ladder.
- Glass Activity/History/attachment plates use the same menu token, and C5 remains an explicit measured acceptance/investigation
  until the GUI report records its fix.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- Concepts/background-activity/opus-5.5/HANDOFF.md (22 checks rewritten for native owner surfaces)
- 60 fps GPU recordings across ten looks, narrow/short widths and Reduced Motion
- python3 scripts/pm7-build-check.py
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/background-activity/opus-5.5/README.md
- "/mnt/Cursor/share/puppet-master/2026-10-29-pm7-build-decisions/README.md — Jared's answers (2026-10-30)"
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-254, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/FinalGUISpec.md#F3-535, ContractName:Plans/DRY_Rules.md#DR-067




### ACD-507 - Pip Hosts Faces And Orbit

```yaml
plan_unit_id: ACD-507
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  PC1–PC5/S1–S9, X1/X3, L1. F3-594 is the single Pip agent primitive, reached through shared
  mark/row/empty/sheet functions rather than innerHTML hooks, observers or layered legacy drawings.
  Cast/role props, helper marks, Activity agent rows, sheet host by Close, Scheduled/Memory faces, Plans,
  wand and sleeping empty lists share kit/parts. Host watches at 420 ms, wonders while typing, oops on
  unusable primary without activation and cheers on success; blink changes, stable last-pointer gaze, no
  random wink, paused shared sway. Lift-off is one overlay-owned copy released on finish. Pip in Orbit
  centre has current-tool badge and hands off with thinking placeholder, one Pip per reply. No added chat
  capability/welcome-back message. Main-button keyboard/pointer acknowledgement ≤100 ms, single commit; fix
  busy stall instead of delaying dispatch. Parts use SSYS-056’s one transaction and app voice obeys
  master/chat mute. PC1/X3 sheet motion (2026-10-29): a host drops in when its sheet opens, using the
  shared rig and installed parts. Dots, sleep and happy faces never follow the pointer; other gaze retains
  the last known position. Retro entrance/face changes step; live NieR sheet changes cut with a bounded
  flicker, no black frame. Effective Reduced Motion/Still snaps to the settled state without entrance,
  sway, flicker or lift-off travel. Static NieR brand/tray/app marks remain static; acknowledgement stays
  ≤100 ms with no dispatch deferral or double commit. PC1–PC5/S5, PM7 Step4, 2026-10-30: the joined adapters
  are PM56_PIP and PM56_SHELL.pmxPip/pmxStatusFace/pmxEmpty/pmxPipHost/pmxPipLook/pmxPipMood/pmxPipOn. Sheet
  hosts, face lists and Orbit use the shared kit rather than a second renderer. O55.sound.pip.chatMute binds
  hosted chat mute to the same sound owner. The concept’s press helper acknowledges in the first painted frame
  and runs the existing action in the next task without replaying a click; native ≤100 ms acknowledgment and
  one-commit acceptance are unchanged. PMX kept-subtree slots preserve loader owner attributes while the
  transcript reconciles; they do not admit a replacement observer or private loader.
gui_related: true
gui_classification_reason: Defines visible PM7 presentation and interactions.
split_recommended: false
depends_on:
- DL-239
- F3-594
- F3-566
- F3-586
- SSYS-056
- DR-072
unblocks: []
acceptance_criteria:
- Sheets use a single shared Pip host with 420 ms watch, deterministic face/gaze exceptions and family-specific
  entrance/change/rest behavior.
- Pointer and keyboard main-button acknowledgement are ≤100 ms with exactly one commit; disabled oops never
  activates.
- Orbit/thinking handoff shows one Pip per reply, and casts/lists/Plans/wand/empty surfaces use shared primitives
  and owner states.
- All optional placements, sound/motion and exit copies obey SSYS-056, the common player/overlay and teardown
  gates.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- Concepts/background-activity/opus-5.5/HANDOFF.md (22 checks rewritten for native owner surfaces)
- 60 fps GPU recordings across ten looks, narrow/short widths and Reduced Motion
- python3 scripts/pm7-build-check.py
risk_class: owner_drift
reasoning_tier: high
context_scope: pm7_build_20261029
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- reports/pm7-build-20261029/IDS.md
- Concepts/Icon-Concepts/Opus5.5icon/README.md
- Concepts/chat-assistant-concepts/opus-5.5-pip/README.md
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-239, ContractName:Plans/FinalGUISpec.md#F3-594, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-586, ContractName:Plans/Settings_System.md#SSYS-056, ContractName:Plans/DRY_Rules.md#DR-072
