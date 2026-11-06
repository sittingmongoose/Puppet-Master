# Shard 079: Grill Me rounds and agreement — DL-218

Source: `Plans/assistant-chat-design.md`

Source lines: L28288-L29060

Source SHA256: `d8416202d71866909a534630a1aa3fcfba8e9fee408134822f864c8f55d03973`

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
  The shared assistant is the Home column's only conversation surface (DL-232), under F3-637 and bound by
  ACD-500/501/502. One History list serves it; History pin is ui.chat_column.pin_history, and its header
  offers the column's Keep open choice. Activity Detail and bounded hover previews remain inside chat.
  Booting chat opens no plan or other panel tab. Every opened body uses the exact domain identity and
  registered kind in ACD-500: plan revision and discovery as plan, versioned artifact as artifact,
  file/diff as editor, child feed as transcript, collaboration/evidence as run or owner document, thread
  detail as context, rules/memory/revert/debug/Lens/Wonderer as document, tool calls as record, addresses
  as browser and command sessions as terminal. Goal stays in Activity Detail. Unknown IDs grant no kind or
  route. The host owns body, strip, deduplication and focus, and reports close/activation to chat. A user
  open takes focus; unsolicited agent opens stay in the background, and file modifiers obey F3-634. Wand
  setup/thread dialogs are app modals; attachments use their exact artifact/file owner; More Info is a
  bounded popover; export/print and Send to Planning Wizard keep their existing routes. A run card yields
  controls only while its run tab is active in a visible panel; close, collapse, narrow hiding or leaving
  Home restores them and clears shared editor-revealed state. Browser capture retains its original thread
  and composer destination through thread switches and every attachment/list/insertion path. If the origin
  destination changed, restore the saved destination or refuse before mutating a draft. Context actions
  use their own tab's thread; attachment viewers preserve thread/message/attachment identity. Images have
  a preview; other kinds state truthfully when no preview exists. The compact command card hands off to
  the exact terminal or retained output, with Open in Terminal, View output and Rerun in Terminal, no
  embedded interactive shell, duplicate Show Terminal control or Explain action. All five families'
  Light/Dark variants, shared fonts, NieR parts and Reduced Motion reach the column and hosted bodies.
  Container width governs those bodies; window size governs app modals. The shared hover owner controls
  tags; a sheet traps keys only while open; unmodified chat shortcuts require chat focus, and Escape
  closes only the innermost surface. Settings use SSYS-055 and their admitted
  application/Project/current-chat scopes. DL-218's Wonderer/Grill Me and DL-231's automatic Chat Room
  rounds remain. The accepted Guided Tour keeps its teaching surface while this chat is hidden, under
  PWIZ-036. These are product requirements; source prototypes and browser results do not certify native
  completion. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: H6: at the default narrow layout, 900
  px and below folds chat to its existing 32 px edge strip under the centre-width ladder (C<480, with its
  hysteresis and explicit Keep open/peek rules). Suppress the hosted chat subtree’s painting/layout
  interaction while folded; a descendant visibility:visible must not expose a squeezed transcript, dock or
  composer. Open the chat/peek restores the same subtree at usable width, rather than a new chat instance.
  No folded/peek state is persisted and the saved message minimum, History and Activity Detail rules
  remain. Amended DL-260, Jared 2026-10-31: only real product behavior remains an implementation
  requirement. Current Settings admission includes the exact inventory-declared
  Everywhere/Computer/Device/Project/current-chat levels through one resolver/transaction (omitting
  Project for app work). This supersedes universal three-scope wording only; hosted bodies, capture
  origin, focus and one-node rules remain unchanged.
gui_related: true
gui_classification_reason: Defines hosted conversation presentation, opened surface kinds, shared preferences and focus behavior.
split_recommended: false
depends_on: [DL-232, ACD-500, ACD-501, ACD-502, ACD-503, DR-075, SSYS-055, DL-234]
unblocks: []
acceptance_criteria:
- One hosted chat replaces the stand-in without seeding a plan tab, duplicate History or lab chrome.
- Each surface opens through the existing owner and kind; closing or activating a run tab updates its card.
- Wonderer leads, Grill Me agreement confirmation and Chat Room automatic rounds preserve DL-218 and DL-231.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: H6: at the default narrow layout, 900 px and below folds chat
  to its existing 32 px edge strip under the centre-width ladder (C<480, with its hysteresis and explicit Keep open/peek
  rules). Suppress the hosted chat subtree’s painting/layout interaction while folded; a descendant visibility:visible
  must not expose a squeezed transcript, dock or composer. Open the chat/peek restores the same subtree at usable width,
  rather than a new chat instance. No folded/peek state is persisted and the saved message minimum, History and Activity
  Detail rules remain.'
- Every admitted preference uses SSYS-055 and its existing Settings transaction owner.
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
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
preserved_exact_tokens:
- Keep open
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
  stay separate and appear only as linked owners here. Presence requires running/input work, retained
  while card/detail open; scheduled/finished alone never keep icon. By state orders Needs input, Running,
  Scheduled, Finished this session; many subagents can use By owner. Hover uses existing
  dwell/compaction/tones; full detail has Stop and thread Stop all and bounded output. Footer says
  composer Stop ends reply only. Prompt quick answers are safe-first yes/no; other input opens exact
  terminal. Processes uses console glyph, agent category robot, individual rows Pip; glyph
  colour/backlight use common domain tones. All consume SIR-054 and one needs-you set, no duplicate
  runtime. App Goal/Crew/Plan/schedule rows join this same thread-owned projection with real Computer and
  admitted scope; schedule review/cancel preserves exact schedule/version and its Scheduling authority. No
  Project filter can silently hide app work as an empty global result.
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
  - "reports/pm7-build-20261029/IDS.md"
  - "Concepts/background-activity/opus-5.5/README.md"
  - "Concepts/Icon-Concepts/Opus5.5icon/README.md"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
  view; Pin/unpin changes lifetime across thread switches only. Within the current thread, keep it until ×, Esc or icon-again. G2, Jared follow-up 2026-10-30: widen chat first within its centre/page floor. When the column cannot
  widen further, dock full-size detail inside it and squeeze the messages if at least 360 px remain;
  below 360 px cover the transcript at full column height. This is the constrained rendering exception to
  the ordinary 400 px message minimum; the saved message-area width still has a 400 px minimum. No fixed
  760 px cap; preserve the current centre floor/narrow ladder and History’s user-sized pin. Popped-out chat
  uses its actual container. Activity/History/attachment floating Glass plates use persona/model menu
  plate. Friendly/Glass context ring is continuous, antialiased and never segmented by broken transforms.
  All ten looks, widths 860/1024/1280/~1390/1920, narrow/short, Reduced Motion and drag budgets are
  acceptance surfaces. G9/C5: the shared presentation owner draws the Basic/Friendly/Glass context meter as
  a continuous antialiased ring approximately 3 px thick. Its middle matches the header ground, with no
  tiled gradient slivers at the border or meter fill leaking into the middle. Retro/NieR retain their own
  drawings. Actual widths, device pixel ratios and Reduced Motion remain native acceptance surfaces;
  concept diagnosis or a static drawing is not certification. G1 B (Jared
  2026-10-30): Pin/unpin is the view-local ui.activity_detail.pin action
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
- Every Activity domain opens full detail directly. Widen first, then dock/squeeze at the column limit
  with at least 360 px of messages; below 360 px cover at full column height, never a small view.
- Pinned detail follows selected-thread data across switches; unpinned detail closes on a switch, and stale
  rows/actions/subscriptions are removed.
- Chat drag has no fixed 760 cap and preserves the minimum, centre/page floor, user History width and narrow
  ladder.
- Glass Activity/History/attachment plates use the same menu token, and C5 remains an explicit measured acceptance/investigation
  until the GUI report records its fix.
validation_surfaces:
  - scripts/pm-shard-plans.py
  - scripts/pm-plan-index.py
  - Concepts/background-activity/opus-5.5/HANDOFF.md
  - future 60 fps GPU recordings across ten looks, narrow/short widths and Reduced Motion
  - scripts/pm7-build-check.py
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
- "DL-260 source lineage only (no product stylesheet, selector or implementation obligation): the activity lane report and pm7-port/css/20-controls.css resolved PM7-C5-CONTEXT-RING; a conic background tiled into a faint 1 px border (Friendly 6 percent, Glass 9 percent alpha), while a clear --surface disc exposed the meter as a pie. The concept repair used an isolated ::before layer and radial mask; native rendering must satisfy the shared visual invariant."
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
canonical_text: 'PC1–PC5/S1–S9, X1/X3, L1. F3-594 is the single Pip agent primitive, reached through shared mark/row/empty/sheet
  functions rather than innerHTML hooks, observers or layered legacy drawings. Cast/role props, helper marks, Activity
  agent rows, sheet host by Close, Scheduled/Memory faces, Plans, wand and sleeping empty lists share kit/parts. Host
  watches at 420 ms, wonders while typing, oops on unusable primary without activation and cheers on success; blink changes,
  stable last-pointer gaze, no random wink, paused shared sway. Lift-off is one overlay-owned copy released on finish.
  Pip in Orbit centre has current-tool badge and hands off with thinking placeholder, one Pip per reply. No added chat
  capability/welcome-back message. Main-button keyboard/pointer acknowledgement ≤100 ms, single commit; fix busy stall
  instead of delaying dispatch. Parts use SSYS-056’s one transaction and app voice obeys master/chat mute. PC1/X3 sheet
  motion (2026-10-29): a host drops in when its sheet opens, using the shared rig and installed parts. Dots, sleep and
  happy faces never follow the pointer; other gaze retains the last known position. Retro entrance/face changes step;
  live NieR sheet changes cut with a bounded flicker, no black frame. Effective Reduced Motion/Still snaps to the settled
  state without entrance, sway, flicker or lift-off travel. Static NieR brand/tray/app marks remain static; acknowledgement
  stays ≤100 ms with no dispatch deferral or double commit. PC1–PC5/S5, DL-260: sheet hosts, face lists and Orbit consume
  the shared Pip kit; chat mute gates that same sound owner. Existing controls acknowledge within 100 ms and commit once
  without replaying activation. Transcript reconciliation preserves the shared loader’s owner identity and attributes,
  never a replacement observer or private loader. Source adapter and scheduling helper spellings remain lineage only.
  QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q16: You is the person alone, head and shoulders in each family’s
  materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross,
  and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. DL-260: the
  one shared You primitive serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single
  Pip primitive retain their existing meaning. Q15: the menu head and trigger use the same registry wand with the same
  rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s
  role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon. DL-259
  Q1 B, Jared 2026-10-31: shared say/vocals use F3-599’s one per-look kit room, sends 0.35 (Glass 0.30, NieR 0.16), no
  stacked rooms and approximately 0.4 dB loudness bound; the shared preference and gesture gates still apply.'
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
- Sheets use a single shared Pip host with 420 ms watch, deterministic face/gaze exceptions and family-specific entrance/change/rest
  behavior.
- Pointer and keyboard main-button acknowledgement are ≤100 ms with exactly one commit; disabled oops never activates.
- Orbit/thinking handoff shows one Pip per reply, and casts/lists/Plans/wand/empty surfaces use shared primitives and
  owner states.
- All optional placements, sound/motion and exit copies obey SSYS-056, the common player/overlay and teardown gates.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q16: You is the person alone, head and shoulders in each family’s
  materials and small-size maps. It carries no marionette cross, strings, holding arm/control or connection to a cross,
  and is never an agent Pip. Diagram edges to You express the plate’s result/topology, not puppet strings. DL-260: the
  one shared You primitive serves crew diagrams, cast plates, run cards and rosters. Optional agent strings and the single
  Pip primitive retain their existing meaning. Q15: the menu head and trigger use the same registry wand with the same
  rod/star/sparkle ink roles. Pip and that wand remain the head’s own children so a wrapper cannot discard the glyph’s
  role-specific colours. The sign’s kind glyph matches its sheet head; do not fork a second wand or fallback icon.'
- 'DL-259 Q1 B, Jared 2026-10-31: shared say/vocals use F3-599’s one per-look kit room, sends 0.35 (Glass 0.30, NieR
  0.16), no stacked rooms and approximately 0.4 dB loudness bound; the shared preference and gesture gates still apply.'
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
- 'DL-260 implementation lineage only: PM56_PIP, PM56_SHELL.pmxPip/pmxStatusFace/pmxEmpty/pmxPipHost/pmxPipLook/pmxPipMood/pmxPipOn,
  O55.sound.pip.chatMute, PMX kept-subtree slots, ppYou/PX_YOU/pnYou and the press helper are source adapters, not native
  product APIs.'
preserved_exact_tokens: []
negative_constraints:
- Do not treat concept JavaScript or static fixtures as native runtime certification.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-239, ContractName:Plans/FinalGUISpec.md#F3-594, ContractName:Plans/FinalGUISpec.md#F3-566, ContractName:Plans/FinalGUISpec.md#F3-586, ContractName:Plans/Settings_System.md#SSYS-056, ContractName:Plans/DRY_Rules.md#DR-072




Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.

### ACD-508 - No Project Place Computer And Lazy Chat Folder

```yaml
plan_unit_id: ACD-508
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: 'No project is a first-class chat place with project_id=null, scope_kind=application and scope_partition=app.
  The connected, already claimed Server owns it. Default to this computer''s set-up service, otherwise the person''s
  named main Computer; a dormant service is never silently claimed. Always name the work Computer on phone/web and
  whenever it differs from the viewing device. Freeze it after the first user message; Continue on another computer
  creates a new chat with a summary and links both ways. thr_{ulid} is minted only at the first user message, never
  for an empty draft. Where selects place before that message and differs from composer message destination. After
  it, Where offers the two conversions and continuation, never silently rebinds. New is a split button offering
  this Project, No project or another Project; the title-bar switcher has a fixed No project row using the existing
  switch/open-new-tab owners. Here and All chats list exact coverage; unreachable chats remain listed with last-loaded
  read-only state and a not-answering reason. The first saved file, drop or command lazily allocates one unique
  visible <home>/Puppet Master Chats/<unique title> folder on the work Computer, outside PM data; talk-only and
  internal planning records create none. A pre-message saved attachment remains draft-owned until first-message
  identity adoption, without minting a thread early. Commands start in this folder or an explicitly granted place.
  Rename changes no folder path. Archive keeps the folder and is never automatic. Delete immediately hides thread
  content, follows existing purge/tombstone/hold deadlines and offers a separate unticked folder-deletion choice
  with a truthful file count. The full path is available wherever the folder is named. Eligible chat defaults follow
  Everywhere → Computer → This chat with factory fallback and declared Device screen exceptions, never a Project
  rung. Selected account_resolution uses MA-074 on the exact work Computer. No Basic Dark flash or no-project Settings
  write ban. N15 Set up a project later still performs protected AI setup on that Computer in app scope, then lands
  in No project chat; Guided Tour Finish/Skip returns to that exact app chat/layout without a practice Project or
  claiming an unexecuted Project step completed. Computer use consumes T-186/PS-145 policy: named Computer, task-allowed
  apps, separate provider screen disclosure and protected-auth exclusion, with a visible session-bound strip/Stop
  and existing double-Esc stop; it is no root grant or hidden desktop access. Delivery stages are chat/Goals/Crew/Plan/Deep
  Plan/schedules/conversion, then cross-project reads/requests, then computer use/continue elsewhere/cross-computer
  conversion; unfinished routes disclose typed unavailability. The shared CV-365 execution envelope permits explicit
  empty admitted roots and null working_directory for talk-only/internal planning. The actual granted or newly created
  folder supplies process cwd; no HOME or viewing-device fallback is inferred.

  Pre-message intake selects AttachmentAddRequestV3/ResultV3 and AttachmentOwnerContextV1: draft_id/revision, actual Computer/Environment/roots, initiating Client, exact composer destination/generation, source digest/read grant and idempotency remain draft-owned. First-message commit alone mints the real thread and performs AttachmentDraftAdoptionV1 once against the complete immutable attachment manifest and both writer generations. Exact retry returns the same adoption receipt; conflicting digest/generation refuses and preserves the draft. Cancellation before commit cleans only unheld draft payloads after the owner receipt; late intake never inserts into a different composer. No first-message evidence means no adoption and no early thread creation.

  Attachment Details/Open/Remove/Retry/Download/Freeze reference select their operation-specific V3 request/result in Plans/projects_refresh_fix_contracts.schema.json with the exact registered command ID, attachment/version/digest and revision. Read/navigation returns details/open/download disposition; Remove detaches only the composer reference and preserves independently held payloads; Retry binds the failed owner operation; Freeze rechecks the source read grant/hash and returns the captured version. Add and Save to project retain their own historical contracts. An added result is not a Remove/Open success.'
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- AI-069
- SIR-055
unblocks: []
acceptance_criteria:
- Talk-only chat and internal Plan creation allocate no folder; concurrent first saves/commands allocate exactly
  one folder.
- Computer stays fixed after first message; unavailable Server yields last-loaded read-only state and unsent draft,
  not a writable replica.
- Empty/filtered Here lists state coverage and offer All chats; narrow labels remain text, with the shared container-width
  rules.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N1-N5-N7-N8-N12-N14-N15-N17-N23; Q3-Q5-Q6-Q8
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: I approve the outstanding questions with their recommended settings.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c01
preserved_exact_tokens:
- No project
- project_id=null
- scope_kind=application
- scope_partition=app
- Where
- thr_{ulid}
- <home>/Puppet Master Chats/<unique title>
- Here
- All chats
negative_constraints:
- Do not create a hidden scratch Project, auto-archive, silently claim a service or move credentials.
- Deleting a chat does not imply deleting its files; retaining bytes under a hold does not restore ordinary visibility.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-508, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365, ContractName:Plans/storage-plan.md#SP-349

### ACD-509 - Explicit Cross Project Reads And Thread Requests

```yaml
plan_unit_id: ACD-509
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Every chat may explicitly read permitted Projects and request work from their chats through projects.list/status/search/read_file/read_chat/read_plans
  and the existing thread.request, thread.spawn and thread.await owners. Automatic retrieval remains within the
  owning Project or the app thread's own messages/files; no ambient merged index or other-thread memory. Metadata-only
  list/status exposes only information the person may open and honors source-project Off; content reads use a named
  set or all, source-Computer checks on every read and provider exposure/secret scrub. Regular offers This time
  / For this chat / Always on this computer / No; a named reference grants only its explicit subject. YOLO uses
  Plans/Permissions_System.md's explicit task-scoped mode authority and invents no human consent or Always rule. Every read appears in Activity.
  One coverage formatter records requested, looked_in, not_looked_in with reasons and partial with missing ranges;
  empty/partial replies and empty/filtered UI always disclose coverage, with a quiet expandable line. Archived Projects
  are skipped unless named. Notebooks, private memory, credentials, safe copies and denied files remain excluded.
  An outgoing request shows exact target, task text and effect before Regular Send or YOLO dispatch under PS-145.
  Sender authority never changes receiver mode; Off refuses, and unseen Regular Ask me requests remain read/answer-only
  until accepted. A person-reviewed send may satisfy that message's receiving choice, but is never fabricated for
  YOLO. Delivery is ordered at a safe turn boundary, distinct from the person's two-slot composer queue; request
  results/replies are idempotent and route by stable thread after conversion. From another chat uses chat_message_in,
  names sender and recipient, and never impersonates user input. At most three automatic round trips occur; extending
  that budget requires the person. Offline delivery waits and expires after one day with a truthful result. The
  has-read provenance mark survives; N19 outward actions use Plans/Permissions_System.md's mode-aware disclosure/actual-effect rules, including
  ordinary YOLO publication, and never hide coverage. CV-365 freezes preview as ui.thread.request.preview or ui.thread.spawn.preview,
  a typed local redacted draft projection without persistence, outbox commit, EventRecord or authority. Send uses
  the existing cmd.thread.request and cmd.thread.spawn sole handlers with the explicit ThreadRequestFacadeRequestV2/ResultV2
  or ThreadSpawnFacadeRequestV2/ResultV2 at Plans/application_workflow_contracts.schema.json#/$defs/<name>; cmd.thread.await
  is unchanged. Preview captures exact target/input/currentness/return commitments, and Send revalidates them immediately
  before the one durable outbox commit. No separate .preview/.send domain primaries, aliases or operation=preview
  branch are admitted.
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- ACD-508
- PS-145
- T-185
- OSI-439
unblocks: []
acceptance_criteria:
- Empty/partial/all/named search shows exact coverage including denied, archived, offline and rebuilding sources.
- Regular/YOLO sender-receiver pairs preserve Off, Ask me, read-only ceilings and a three-round-trip stop.
- Reply after conversion follows thread identity with current destination checks; repeated delivery produces no
  duplicate turn or billing.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N3-N4-N18-N19; Q4-Q7-Q9-Q10
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: I approve the outstanding questions with their recommended settings.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c01
preserved_exact_tokens:
- projects.list/status/search/read_file/read_chat/read_plans
- thread.request
- thread.spawn
- thread.await
- requested
- looked_in
- not_looked_in
- partial
- chat_message_in
- From another chat
negative_constraints:
- No direct cross-Project mutation or service control follows from reading, messaging or shared settings.
- No notebook/private-memory merge, hidden content injection, approval answer or unlimited send-to-all.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-509, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365

### ACD-510 - Two Explicit Conversion Paths And Current Preview

```yaml
plan_unit_id: ACD-510
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Make a project from this chat and Move this chat into a project are equal first-class actions; neither
  is preselected by a general chooser. Named entry goes directly to its path with the other visible. Entry points
  are Where/place, New Project From a chat, History-row More, palette and each of the three Project-required workflow
  notices. Merge means a chat joins a Project, never two chats; Project-to-Project chat moves remain deferred. New-project
  conversion calls PJCT-009/PWIZ-037 and the exact PJCT-010 creation chain, then waits for real commit/listing/readback.
  Partial or unknown setup reuses the retained Project operation/resume_creation; retry never starts a second creation
  or remote side effect. Applicable file choices are move selected chat-folder files, use that folder, use a worked-in
  folder or start empty; preserve found Git/Jujutsu history through inspection and use Your usual settings/copy
  through Settings. Existing-project conversion selects the actual destination and files, defaults to a separate
  Git branch/worktree or Jujutsu change/bookmark plus chosen folder, and exposes direct main landing only in Advanced.
  Same content skips; Different defaults to Keep both where a direct collision applies; unsaved target buffers block.
  Source history is not grafted onto an existing repository. Before any mutation show a plain statement and live
  current preview naming exact destination/full paths/Computer, selected history and file counts, settings/account/permission
  differences, what remains, active Goal/Plan/Crew and schedules, remote effects and Undo boundary. Only picked
  content moves. Regular applies via Create project and move chat, Move chat and files or Move chat only. N27 permits
  a registered guarded YOLO agent route for a clearly requested new destination or named existing Project; it consumes
  the same visible current preview and fresh destination authority without clicking a human-only control. Ambiguous
  convert this still asks for destination. Any destination/file/conflict/currentness/authority change invalidates
  the preview. Existing approvals settle first; active work/timers are fenced by their owners. Conversion never
  enters Planning Wizard, PRD Builder or Orchestrator automatically. CV-367 owns the exhaustive ChatMoveManifestV1
  and every per-family disposition; CV-366 owns its conversion_manifest semantic hash, and SP-350 owns operation/cutover/lineage/Undo
  custody. The live preview and apply preserve the same complete family plan across the draft-preview to real-target cutover binding specified by CV-367; absent owner/source/policy materialization is a
  typed blocker, never an implicit nothing-to-move result.
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- ACD-508
- PSB-007
- GRS-087
- APR-074
unblocks: []
acceptance_criteria:
- Both paths and their alternate are visible, with no silent new-project default.
- Stale preview, unsaved overwrite, active unfenced work, missing destination or retained approval refuses before
  effect.
- Regular person and YOLO guarded route share one owner transaction; YOLO never defaults to main or publication.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N2-N9-N25-N27; Q1-Q2
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: I approve the outstanding questions with their recommended settings.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c02
preserved_exact_tokens:
- Make a project from this chat
- Move this chat into a project
- Keep both
- Your usual settings
- Create project and move chat
- Move chat and files
- Move chat only
- N27
negative_constraints:
- Do not use cmd.thread.branch, direct owner-record edits, simulated approval clicks or path-derived Project identity.
- No automatic Project-to-Project chat movement, chat merge, history graft or permission carryover.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-510, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/Contracts_V0.md#CV-367, ContractName:Plans/storage-plan.md#SP-350

### ACD-511 - Conversion Lineage Recovery Report And Undo

```yaml
plan_unit_id: ACD-511
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: A successful conversion retains thread_id, copies full conversation into new destination-owned scope
  records, records source/destination lineage and a new detail generation, removes the live app index entry and
  publishes the destination once. Original app event/result/Usage bytes and canonical sources remain immutable;
  local payloads may be shared, cross-Computer payloads are verified copies. The ordinary source conversation is
  sealed for Undo, then purged under chat deletion/holds with a content-free destination pointer. Independently
  retained Goal objective/history/control, approved Plan revisions/sources, Crew/task audit, schedule occurrences,
  permission receipts and shared artifacts outlive Undo as their owners require; source work is fenced/stopped/terminal,
  never an orphan writable task. Re-root carried file chips, restore-point/revert baselines, handoff/Lens, To-Dos,
  notebook, artifacts and indexes through the manifest; outside files/terminal processes/credentials/source grants
  stay and are listed. This chat preferences travel as content choices, while destination effective settings/mode,
  tools, Persona, account_resolution, routes and permission evidence resolve freshly. The manifest records exact
  notebook entries/checkpoints/payload/restriction refs, selected gist/capsule, owner_thing_previews and reach/install/trust
  re-resolution. Live terminal/browser/Eval/MCP/provider sessions stay on their original Computer; no profile or
  provider-native history is mutated to pretend it moved. Disposable app indexes/cache entries are rebuilt/rejoined
  only from selected authorized refs, never copied as another chat's content. Restore namespaces keep the counterpart
  2,048 cap and app web cache keeps T-187's 500 MB per-Computer default/TTL/LRU; no conversion resets a bucket.
  Every result, including partial failure, produces a system divider, operation report and PM Notify summary with
  exact moved/stayed/held/failed effects and safe Undo. Undo requires its own current preview and ends at the first
  new message/work/accepted resume/dispatch or changed moved file, or seven days, whichever comes first; an unreachable
  Computer does not extend it. For a new Project use list-only remove, restore selected moved files, and remove
  only unchanged PM-created history or empty folders; worked-in folders remain untouched. For an existing Project
  remove only unchanged created draft/files and restore source content. Never remove modified work, remote repository/branch,
  online copy or backup. Ineligible Undo states the exact reason. An old backup restore checks lineage/current owner
  to avoid two live chats; Project Backup includes carried full history and destination custody, and Full Server
  Backup retains required app custody. The exact manifest and inverse use CV-367/SP-350. SP-349 owns application
  restore-point keys and the shared Server bucket; CV-329/SP-259 own compaction consumer/storage, while CV-334 remains
  historical child-state exclusion and SP-319 remains terminal-move historical inspection. These historical resources
  are not application Goal or compaction source hosts. Missing durable app family/root/retention-policy binding
  remains unavailable rather than being reconstructed from a receipt or current Settings.
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- ACD-510
unblocks: []
acceptance_criteria:
- New/existing/local/cross-Server reports account for every manifest family and distinguish publication without
  Undo.
- Undo before and after each eligibility boundary preserves modified files and remote resources; no two live current
  Plans or timer authorities emerge.
- Expiry purges only eligible source-chat content, retaining separately required canonical task/audit bodies and
  references.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N11-N13-N20-N24-N25-N27; Q5
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: I approve the outstanding questions with their recommended settings.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c02
preserved_exact_tokens:
- thread_id
- Undo
- seven days
- PM Notify
- Project Backup
- Full Server Backup
negative_constraints:
- Never recategorize past Usage or rewrite original EventRecord scope, identity, idempotency or receipts.
- No transferred source grant, approval, safe point, YOLO flag or credential serves as destination authority.
owner_hints:
- Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-511, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-367, ContractName:Plans/storage-plan.md#SP-349, ContractName:Plans/storage-plan.md#SP-350
