# Shard 050: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/FinalGUISpec.md`

Source lines: L25905-L26367

Source SHA256: `7236ee5f73d5999720dab50565a293e5e396ce8833679acb4b42393e21a9c585`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into GUI owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### F3-404 - Inline Visualizer V2 Tokens Components And Feedback States

```yaml
plan_unit_id: F3-404
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Inline visualizer v2 renders as a PM-native chat artifact with stable progressive-render states, no visible flicker
  or remount during finalization, and fallback copy for Rendering visualization..., Streaming visualization unavailable,
  Copied, Visualization ready, library unavailable, sandbox denied, render error, stream gap, and snapshot fallback.
  The visualizer default style exposes nine PM color ramps, `data-accent`, pre-styled bare button, input, textarea,
  select, table, details, summary, `dl[data-layout="grid"]`, SVG utility classes, `aria-invalid="true"`, and
  `:focus-visible` hooks through Final GUI-owned variables such as `--pm-viz-ramp-{family}-{step}`. Native Rust + Slint
  builds host the visible card through the PM-owned isolated webview adapter defined by CV-300, so loading, copied,
  denied, render-error, and fallback states stay visually identical whether the runtime uses iframe/postMessage or the
  native webview message bridge.
gui_related: true
gui_classification_reason: Defines visible inline visualizer presentation, tokens, components, feedback copy, and fallback states.
depends_on: [ACD-427, CV-300]
unblocks: [ATS-015]
acceptance_criteria:
  - Streaming visualizations have stable loading, degraded, copied, ready, denied, render-error, stream-gap, and snapshot-fallback states.
  - Finalization preserves chart canvases, SVGs, and script-populated containers without visible remount flicker.
  - PM visualizer tokens include neutral, accent, info, success, warning, danger, cyan, violet, and amber ramps with 50 through 950 steps.
  - Component hooks cover the listed form/table/details/SVG/focus/error primitives without importing external CSS themes.
  - Native webview adapter rendering preserves the same visible states and fallback copy as iframe/postMessage rendering.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Inline visualizer v2 GUI state fixtures
risk_class: inline_visualizer_gui_underspecification
reasoning_tier: high
context_scope: inline_visualizer_v2_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - future Assistant Chat inline visualizer UI
node_compile_hint:
  mode: inline_visualizer_v2_gui_surface
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-visual-tokens-components-fallbacks
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0058
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0058, atom-0088]
preserved_exact_tokens:
  - "Rendering visualization..."
  - "Streaming visualization unavailable"
  - "Copied"
  - "Visualization ready"
  - "library unavailable"
  - "sandbox denied"
  - "render error"
  - "stream gap"
  - "snapshot fallback"
  - "data-accent"
  - "`--pm-viz-ramp-{family}-{step}`"
  - "Rust + Slint"
  - "webview"
negative_constraints:
  - Do not render inline visualizer degradation as blank content.
  - Do not let finalization remount visible chart or SVG containers when safe reconciliation can preserve them.
  - Do not import external visual themes or CDN CSS for the default PM visualizer style.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### F3-405 - Notifications And Sounds Settings Surface

```yaml
plan_unit_id: F3-405
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings > General > Notifications & Sounds provides the master notification enable, in-app toast/banner,
  system/tray, sound enable, volume, per-event routing matrix, quiet/focus behavior, destination list and status,
  sound library and mapping, upload/import/export, preview, and explicit test-send controls. The surface supports
  Slack, Discord, generic webhook, ntfy, Pushover, Telegram, in-app toast/banner, system/tray, normal notification
  sounds, custom uploaded sounds, and PeonPing/OpenPeon-compatible imported packs only after compatibility and
  licensing checks. Provider forms expose only masked or ref-backed fields: Slack channel/mrkdwn/mention policy,
  Discord thread/allowed_mentions/identity policy, generic webhook method/header/body template/success predicate, ntfy
  server/topic/priority/tags/click policy, Pushover device/priority/sound/retry policy, and Telegram chat/thread/parse
  mode/disable-notification fields. The routing matrix uses canonical event categories and default sound mappings, and
  the sound library shows built-in normal notification sound entries with source/license/version/duration/hash metadata
  beside uploaded and imported assets. Sound is never the sole carrier for important state, and missing audio support
  hides or labels controls rather than failing silently.
gui_related: true
gui_classification_reason: Defines Settings GUI, notification destination controls, sound library controls, upload UI, preview, and test-send presentation.
depends_on: [ACD-428, CV-298, SP-222, PS-124, UCC-103]
unblocks: [ATS-016]
acceptance_criteria:
  - The settings path is exactly Settings > General > Notifications & Sounds, not a new top-level Settings tab.
  - Users can configure destination routing, global/project overrides, quiet/focus behavior, sound mappings, and uploaded sounds from the GUI.
  - Provider-specific forms expose the canonical fields without revealing raw secrets, webhook URLs, tokens, or private paths.
  - Built-in normal notification sounds show source, license, version, duration, hash, and default mapping metadata.
  - Preview is local only; test-send is explicit, labeled, rate-limited, masked, receipt-recorded, and never mutates alert state.
  - Audio absence or disabled sound remains accessible through visible labels and non-audio state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notifications and Sounds settings GUI fixtures
risk_class: notification_settings_gui_gap
reasoning_tier: high
context_scope: notifications_sounds_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - future Settings > General > Notifications & Sounds UI
node_compile_hint:
  mode: notifications_sounds_settings_surface
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-settings-gui-command-wiring
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:sound-catalog-default-mappings
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:sound-upload-asset-lifecycle
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:peonping-openpeon-import-map
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0052
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0065
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0066
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0067
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0068
source_atom_ids: [atom-0052, atom-0064, atom-0065, atom-0066, atom-0067, atom-0068]
decision_refs: [dec-0009, dec-0010, dec-0011, dec-0012, dec-0013]
preserved_exact_tokens:
  - "Settings > General > Notifications & Sounds"
  - "Slack"
  - "Discord"
  - "ntfy"
  - "Pushover"
  - "Telegram"
  - "toast"
  - "system/tray"
  - "sound"
  - "custom uploaded sounds"
  - "PeonPing"
  - "OpenPeon"
  - "preview"
  - "test-send"
  - "event_category"
  - "source/license"
  - "default sound mappings"
  - "allowed_mentions"
  - "parse mode"
negative_constraints:
  - Do not create a top-level Settings tab for notifications.
  - Do not bundle PeonPing-style voice packs until license verification permits it.
  - Do not make sound the sole carrier of blocked, approval-required, failure, or completion state.
  - Do not let preview send external notifications.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```

### F3-406 - DRY Method Settings And Visible State Placement

```yaml
plan_unit_id: F3-406
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The GUI exposes the application-level DRY Method default guard as a user-controllable setting for
  `app.agent_rules.dry_method_default_guard` with default enabled and stored states enabled or disabled_by_user.
  Assistant Chat and relevant run detail surfaces show compact DRY applied, DRY degraded, DRY disabled, rules missing,
  rules stale, owner/source route found, owner/source route unresolved, mutation blocked, exploratory caveat used,
  and existing owner reused states when the DRY Method materially affects trust, mutation, or routing. The setting uses
  the UI_Command_Catalog and Wiring_Matrix commands for `cmd.settings.agent_rules.dry_method_default_guard.set`, and
  help copy says: "DRY Method is on by default. Turning it off disables only PM's default reuse-first guard; project/user
  instructions, safety, secrets, source authority, governance, permissions, and source-control rules still apply."
gui_related: true
gui_classification_reason: Defines visible setting placement and DRY state/disclosure presentation in GUI surfaces.
depends_on: [ACD-429, ARC-036, CV-299, SP-223, UCC-104, WM-040]
unblocks: [ATS-018]
acceptance_criteria:
  - Users can turn the default DRY Method guard off without disabling unrelated safety, source authority, governance, secrets, or source-control rules.
  - Settings help text explains exactly what disabling DRY does and does not change.
  - Trust-affecting missing or stale rule state is visible to the user, not logs-only.
  - Routine no-effect turns avoid chat flooding while receipts still preserve provenance.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method settings and disclosure GUI fixtures
risk_class: dry_method_gui_transparency_gap
reasoning_tier: high
context_scope: dry_method_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - future Assistant Chat DRY disclosure UI
  - future Settings UI
node_compile_hint:
  mode: dry_method_gui_settings_disclosure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-chat-what-why
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-003
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0054, atom-0073, atom-0074, atom-0083, atom-0089]
decision_refs: [dec-0016, dec-0017]
preserved_exact_tokens:
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "DRY applied"
  - "DRY degraded"
  - "DRY disabled"
  - "rules missing"
  - "rules stale"
  - "owner/source route unresolved"
  - "mutation blocked"
  - "exploratory caveat used"
  - "cmd.settings.agent_rules.dry_method_default_guard.set"
  - "DRY Method is on by default. Turning it off disables only PM's default reuse-first guard; project/user instructions, safety, secrets, source authority, governance, permissions, and source-control rules still apply."
negative_constraints:
  - Do not make DRY opt-in by default.
  - Do not make it impossible for the user to turn off the default DRY guard.
  - Do not treat disabled DRY as permission to bypass explicit user instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
  - Do not hide trust-affecting DRY state in backend logs only.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
```

### F3-403 - Teach Help Icon Teacher Thread And Guided Overlay GUI

```yaml
plan_unit_id: F3-403
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Teach/Teacher uses the Assistant Chat window/thread model rather than a detached teaching app. Help
  icons on major surfaces launch a new Teacher thread with current-surface context. Teacher thread presentation
  includes persona badge, low-end/fast model source, context/model chips, source/context disclosure, activity cards,
  footer status where relevant, and thread states such as working, unread, blocked, degraded, draft, archived, or
  handoff. Guided GUI overlay uses highlight/spotlight, anchored captions, Back, Next, Stop, Let me try, and Do
  it controls, confirmation for mutations, degraded state recovery, keyboard and screen-reader accessibility, responsive
  behavior, and no stale target stepping.
gui_related: true
gui_classification_reason: Defines visible help icons, Teacher thread chrome, source panels, overlay captions, controls,
  degraded states, and responsive/accessibility behavior.
depends_on:
- ACD-426
- UCC-102
- G-026
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_gui_underspecification
reasoning_tier: high
context_scope: teach_teacher_gui
implementation_surfaces:
- Plans/FinalGUISpec.md
- future Assistant Chat Teacher thread
- future guided overlay
node_compile_hint:
  mode: teach_guided_gui_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0103
- pldg-20260626-001-feature-name:atom-0104
- pldg-20260626-001-feature-name:atom-0106
- pldg-20260626-001-feature-name:atom-0130
- pldg-20260626-001-feature-name:atom-0139
- pldg-20260626-001-feature-name:atom-0141
- pldg-20260626-001-feature-name:atom-0143
- pldg-20260626-001-feature-name:atom-0144
- pldg-20260626-001-feature-name:atom-0150
- pldg-20260626-001-feature-name:atom-0151
- pldg-20260626-001-feature-name:atom-0154
- chat:teach-visual-specificity-challenge
- chat:teacher-feature-initial-framing
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/FinalGUISpec.md#F3-016-help-and-contextual-affordances
- Plans/FinalGUISpec.md#19.5-runtime-display-requirements
- Plans/Media_Generation_and_Capabilities.md#capability-usability-semantics
- Concepts/PMConcept.html
- chat:assistant-chat-threads-modeled-in-concept
- Concepts/PMConcept.html#chat-panel
- Concepts/PMConcept.html#chat-thread-sidebar
- Concepts/PMConcept.html#switchToChatThread
- chat:pmconcept-gui-reference
source_atom_ids:
- atom-0103
- atom-0104
- atom-0106
- atom-0130
- atom-0139
- atom-0141
- atom-0143
- atom-0144
- atom-0150
- atom-0151
- atom-0154
decision_refs:
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0002
- corr-0003
preserved_exact_tokens:
- help icon
- how it will look
- major page/panel headers
- tooltip
- new Teacher thread
- current surface
- assistant chat window
- opens a new thread
- Teacher
- persona badge
- context chip
- low-end/fast model
- How it will show the user
- control the Gui
- highlight
- spotlight
- Back
- Next
- Stop
- Let me try
- Do it
- Assistant Chat thread header
- Teacher activity cards
- Sources used
- PM context panel
- guided overlay captions
- Teach memory capture prompts
- Settings > model row
- command palette `/teach` result
- Help/Glossary pages
- current-context example
- clicked
- brings the user to the assistant chat window
- Teacher mode
- Teacher badge
- model chip
- source disclosure
- Teacher mode header
- requested/effective Persona
- current surface/context chip
- Teach capture availability
- Start guided walkthrough
- Show sources
- Save as taught memory
- Hand off
- spotlight/outline
- anchored caption
- step counter
- return-to-chat
- small screens
- safe spacing
- target surface unavailable
- route/control no longer exists
- context stale
- selection lost
- permission blocked
- capability unavailable
- help entry missing
- model fallback/clamp
- user stops
- For the Gui
- PMConcept.html
- That isnt the final form
- just a concept
- will give you an idea
- figure the gui out for these features
- The assistant chat window and threads are modeled in the concept too.
- Assistant Chat
- thread
- persona
- new thread
- dense workbench
- activity rail
- page tabs
- resizable chat panel
- floating chat
- compact chips
- role badges
- runtime popovers
- activity cards
negative_constraints:
- Do not bury Teach behind only slash commands.
- Do not add a loud or decorative help affordance that competes with primary workflow controls.
- Do not launch Teacher without current-surface context.
- Do not create a detached Teacher-only shell that hides standard Assistant Chat controls.
- Do not omit requested/effective persona or model disclosure from the Teacher thread.
- Do not make Teacher launch a modal that blocks normal navigation as the only path.
- Do not use raw cursor/click automation as the teaching UI.
- Do not obscure the target control with the explanatory caption.
- Do not allow Teacher to click destructive/mutating controls without confirmation and permission gates.
- Do not fork labels between surfaces.
- Do not make context help available only from the full Help page.
- Do not include generic examples when current surface context is available.
- Do not silently mutate an existing non-Teacher thread into Teacher mode.
- Do not lose the originating surface/control context during launch.
- Do not require users to know `/teach` before discovering help.
- Do not invent a separate chat product surface for Teacher.
- Do not hide requested/effective Persona/model state.
- Do not show Save as taught memory unless the content is eligible and user confirmation is still required.
- Do not obscure the target control with the explanation caption.
- Do not make the overlay inaccessible without keyboard or screen-reader fallback.
- Do not trap the user in the overlay without Stop/return-to-chat.
- Do not keep stepping through a stale or missing UI target.
- Do not hide permission/capability/model degraded states.
- Do not turn degraded guidance into generic apology text without a next action.
- Do not treat PMConcept.html as final or canonical UI truth.
- Do not copy the concept HTML/CSS directly into canonical Plans or implementation.
- Do not let the concept override accepted ledger decisions or canonical Plans owner docs during a future compile.
- Do not invent a separate Teach-only chat surface when the Assistant Chat thread model can carry Teacher.
- Do not lose Teacher persona/model/source/context disclosure when launching from a help icon or summon phrase.
- Do not hide thread state such as working, unread, blocked, degraded, draft, archived, or handoff state when relevant.
- Do not freeze PMConcept colors, CSS, demo data, or HTML class names as canonical implementation details.
- Do not use PMConcept visual inspiration to skip responsive, accessibility, overflow, or actual Slint/Rust feasibility
  checks.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Models_System.md
- Plans/Personas.md
- Plans/Permissions_System.md
- Plans/Glossary.md
- Plans/Commands_System.md
- Plans/Automated_Testing_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Orchestrator_Page.md
compatibility_only_notes:
- Concept/source-lineage references are preserved for routing and audit only; they do not make external plugins
  or PMConcept.html canonical implementation source.
```
