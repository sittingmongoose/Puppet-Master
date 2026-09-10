# Shard 076: Cumulative v3 Assistant & Settings GUI Specification (2026-09-07)

Source: `Plans/FinalGUISpec.md`

Source lines: L36334-L37022

Source SHA256: `f7aa5834ef202396ffff50a599bccb6bcd1b35b8d1ac21522b01a506f0fe9367`

---

## Cumulative v3 Assistant & Settings GUI Specification (2026-09-07)

This section incorporates the cumulative user interface, layout, and interaction specifications
established across the Assistant and Settings surfaces in accordance with APR-001 through APR-070,
superseding earlier unapplied proposals while preserving all retained v2 and Additive Correction v4
invariants.

### 17. Activity Detail Geometry, History Coexistence, and Floating Activity Bar

- **Default Left Pinned Geometry (APR-001):** Opening Activity Detail from any entry point
  defaults to a pinned side panel on the left of the chat canvas. An explicit user action on the
  Unpin control converts the currently open panel into a floating surface. When a user subsequently
  clicks an activity item or preview from another domain or record, the newly opened Activity Detail
  record always opens PINNED on the left, resetting the transient unpinned state. Prior floating or
  unpinned state is never persisted across explicit new item activations.
- **History and Activity Detail Coexistence (APR-002):** Pinned Thread History (left rail) and
  pinned Activity Detail share the available canvas width dynamically using a coordinated flex
  split. Pinned History and pinned Activity Detail never reserve independent overlapping gutters or
  cause canvas clipping. At narrow editor/chat splits, each view respects minimum readable bounds,
  and Activity Detail preserves full readability without obscuring History navigation.
- **Floating Chat Activity Bar (APR-004):** The inner Chat Activity Bar is a styled floating pill
  centered above the composer canvas. Its enclosing full-width background strip is removed, leaving
  transparent lateral sides and bottom with complete pointer event pass-through around the pill.
  The chat transcript container enforces positive bottom padding such that the final transcript
  message child at settled bottom scroll rests completely above the pill without collision or
  occlusion. The bar is never replaced with plain text and is never rendered as an opaque in-flow footer.

### 18. Transcript Constraints, Card Visual Rhythm, Diffs, and Work-Note Boundary

- **Zero Horizontal Scroll Extent (APR-003):** The chat transcript container strictly prohibits
  horizontal scrolling (`overflow-x: hidden`, `max-width: 100%`). All intrinsic-width offenders,
  including deep attachment chips, hidden preview containers, rich-plan tables, and multi-agent
  summary cards, must enforce bounded layout (`box-sizing: border-box`, `min-width: 0`,
  `overflow-wrap: break-word`, `table-layout: fixed`). Content must never be arbitrarily concealed
  to suppress scrollbars; responsive text wrapping and progressive disclosures are required.
- **Transcript Card Rhythm and Box Consolidation (APR-011):** Non-working transcript cards
  (e.g., Plan cards, collaboration summaries, scheduled-message records) enforce consistent visual
  rhythm: uniform margin tiers, aligned typography, clear status badge placement, and standardized
  action rows. Redundant nested outer boxes and nested card borders are removed.
- **Diff Presentation and Change Records (APR-055):** File modification diffs and change records
  render inline additions in theme-aware green with leading plus signs (`+`) and deletions in
  theme-aware red with leading minus signs (`-`) across transcript cards, Activity Detail Changes,
  and hover previews. Changes cards present compact, structured modification summaries rather than
  raw unformatted text dumps.
- **Internal Work-Note Boundary (APR-056):** Internal agent work notes, intermediate thought
  traces, and raw execution steps are strictly behind-the-scenes runtime state. They must never be
  rendered as ordinary transcript cards, standalone message bubbles, or user-facing deliverables.
  Only authenticated file changes, official artifacts, progress summaries, and canonical plans
  appear as transcript records.

### 19. Activity Hover Previews and Direct Navigation Routing

- **Single Outer Hover Surface (APR-005):** Activity hover previews provide a single, unified,
  lightweight hover card. To-Dos, Goals, Subagents, and Collaboration items render within one outer
  hover surface; nested floating subpanels, cascaded popovers, and duplicate list DOMs are prohibited.
- **Direct Hover Navigation (APR-006):** Redundant "Open Activity" buttons are completely removed
  from all activity hover cards. Clicking directly on an item row, task title, participant card, or
  artifact entry immediately opens that specific record in the pinned Activity Detail panel,
  preserving domain identity and focus.
- **Non-Scrolling Bounded Previews (APR-007):** All activity hover preview panels are strictly
  bounded surfaces with no internal scrollbars (`overflow: hidden`). Previews display a curated,
  representative subset of items (up to 4–6 items). An overflow summary counter (e.g., "+7 more")
  navigates directly to the full Activity Detail panel on click, but does not masquerade as an Open
  Activity action button.
- **Preview Routing Identity (APR-042):** Selecting an item from an activity preview retains exact
  item identity and domain context during routing. Selecting a file change in Changes preview routes
  directly to the specific file diff view; selecting an artifact routes directly to the artifact
  inspector with active selection preserved.

### 20. Context Lens In-Flow Layout, More Details, and Left Accent Prohibition

- **Context Lens In-Flow Placement (APR-033):** The Context Lens dropdown occupies an authentic,
  in-flow layout row positioned between the chat header and the transcript area. It does not float
  over messages or get clipped by header container boundaries.
- **Concise Context More Details (APR-009, APR-061):** The initial view of Context More Details
  presents a concise, high-signal information hierarchy: active context window usage, current
  token counts, pinned sources, and high-level Back Seat Driver (BSD) status. Detailed inspection
  (e.g., full prompt breakdown, BSD sensitivity, catch-up configuration, and stage bindings) is
  placed behind intentional disclosure toggles.
- **Strict Elimination of Left-Edge Accent Stripes (APR-034):** Decorative left-edge vertical
  accent bars, colored side stripes, inset accent borders, and pseudo-element stripes are strictly
  prohibited across all Assistant and Settings surfaces (including gray or muted substitutes).
  Perimeter borders must be uniform. Functional diff gutter indicators (`+`/`-`), tree hierarchy
  connectors, and structural rails in perfected working activities are explicitly preserved.

### 21. Wand Submenu Organization and Browser Composer Boundary

- **Wand Submenu Hierarchy (APR-013):** The wand menu organizes related capabilities into compact,
  focused submenus (e.g., Run Modes, Multi-Agent, Plan Tools, Schedule & Automation, System) rather
  than a sprawling, tall single-column command wall. Submenus open reliably within viewport bounds
  with full keyboard navigation support.
- **Browser Composer Exclusion (APR-010):** No internal-browser launcher or web-browser launch
  button is permitted within the chat composer. Browser automation, scraping, and inspection entry
  points belong to their respective dedicated tools and panel locations. Composer attachments and
  URL citations remain supported without turning the composer into a browser host.
- **Demo and Product Separation (APR-014):** All concept demonstration launchers, replay fixtures,
  test harnesses, mock scenarios, and simulation loaders are isolated in a dedicated Demo Gallery.
  No demo-only action or fixture trigger may be registered in the product wand or as a product
  command in `Plans/Commands_System.md`.

### 22. Plan Left Editor Tab Navigation, Surface Controls, and Responsive Resizing

- **Left Editor Plan Tab Navigation (APR-036):** Clicking a plan title, the "Details" link,
  "Expand", or "Open plan" in a transcript Plan card opens or focuses the plan in the left editor
  tab bar. Opening an already open plan focuses the existing tab without tab duplication.
- **Plan Tab Controls Equivalence (APR-037):** The left editor plan tab exposes the full suite of
  owner-backed plan controls matching the transcript Plan card: Rich Text / Markdown toggle, Build,
  Build With Crew, Build At (schedule), Revise, Send To Planning Wizard, Export, Cancel, and Open To-Dos.
- **Responsive Split Resizing and Narrow Presentation (APR-038, APR-066):** Activating a plan
  opens a readable editor pane even if the editor split was previously collapsed to zero. Resizing
  the editor-to-chat divider preserves a minimum functional width for the chat canvas (minimum 360 px),
  preventing chat controls or composer inputs from collapsing into the resize handle dead zone.

### 23. Typed Agent Work Records and Recorded Evidence Boundary

- **Typed Work Record Grammar (APR-039):** Generic agent activity boxes are categorized into
  explicit typed records: File Changes, Created Artifacts, User Progress Summaries, and Internal
  Execution Notes. Generic un-typed "work boxes" are prohibited.
- **Recorded File Evidence Boundary (APR-040):** Provider selector rows and file references link
  directly to authentic repository paths and evidence (e.g., `threads/provider-selector.js`).
  Fictitious or placeholder path references are forbidden.
- **Safe Inline Formatting (APR-041):** Record summaries and detail rows render bounded inline
  code (`code`), bold emphasis (`strong`), and file links safely with syntax escaping and length bounds.

### 24. Collaboration Configuration Popups, Inset Footers, and All Activity Detail Families

- **Shared Collaboration Choice Controls (APR-051):** Configuration popups for Crew, Crew Auto,
  Chat Room, BrainStorm, and Review share unified dropdown and selector primitives for Model,
  Persona, and Strategy. All pickers share consistent keyboard navigation, anchoring, and search filters.
- **Plain-Language Collaboration Configuration (APR-052):** All collaboration options use plain-language
  labels with concise descriptive subtitles explaining the exact operational difference between modes
  (e.g., Single Agent vs Multi-Pass Review, Quick vs Exhaustive BrainStorm).
- **Consistent Inset Popup Footers (APR-053):** Configuration modal footers enforce consistent
  inset padding (16 px horizontal and vertical), subtle top separator borders, and standard button
  clustering (primary action right-aligned, secondary/cancel left- or right-adjacent with clear hierarchy).
- **Single Agent Review Invariant (APR-054):** Selecting the "Single Agent" strategy in the Review
  configuration modal immediately and reactively reduces the active draft reviewer roster to exactly
  one reviewer. Switching back to Multi-Pass restores the multi-reviewer configuration without loss of choices.
- **Uniform Native Card/Grid Grammar Across All 9 Activity Detail Families (APR-060, USER-REFERENCE-LAYOUT-ROLLBACK-20260908):**
  The reference-video-derived narrow-layout and forced flat-row grammar is selectively superseded under
  user correction USER-REFERENCE-LAYOUT-ROLLBACK-20260908. Activity Detail restores prior native card,
  section panel, and grid presentation across all nine Activity Detail families while preserving
  concise hierarchy, high contrast, clear progress and state grouping, quiet action rows, and canonical routing:
  1. *Goal Detail:* Objective headline, lifecycle status, inline edit/save, progress indicators, and revision history.
  2. *To-Dos Detail:* Hierarchical task tree, inline completion status (filled dot with strike-through), owner chips, and action links without separate Done headers.
  3. *Subagents Detail:* Active and completed subagent cards, parent task link, model identity, tool invocation count, and termination status.
  4. *Crew Detail:* Coordinator card, member cards with assigned roles, live phase indicator, and output links.
  5. *BrainStorm Detail:* Idea clusters, exploration tracks, retained questions/answers, and synthesized plan seeds.
  6. *Review Detail:* Reviewer roster, pass-by-pass findings, severity ratings, consensus/single-pass summary, and remediation links.
  7. *Chat Room Detail:* Multi-agent participant list, room topic, round counter, and conversation timeline.
  8. *Changes Detail:* Aggregated file modifications, colored additions/deletions, path links, and diff inspection triggers.
  9. *Artifacts Detail:* Generated documents, diagrams, code outputs, export options, and lineage metadata.
- **Read-Only Demonstration Semantics (APR-067):** Read-only inspection fixtures and demo cards
  render findings, diagnostics, and code views without interactive mutation controls or misleading
  active buttons, clearly labeling the static or demo nature of the content.

### 25. Settings Manager Presentation Grammar Across All 38 Managers and Projections

- **Reference-Layout Supersession and Native Presentation (APR-062, APR-064, USER-REFERENCE-LAYOUT-ROLLBACK-20260908):**
  The visual prescription derived from the reference video (`ScreenRecording_08-11-2026 19-26-05_1(1).mov`)
  enforcing flattened manager surfaces, borderless sections, and forced single-column rows is selectively
  superseded under user correction USER-REFERENCE-LAYOUT-ROLLBACK-20260908. Settings surfaces restore prior
  native card, section box, and grid layouts across all thirty-eight registered Settings managers and
  the 23 concrete manager workspaces measured at the pinned base `66cd9ca232ef6017c45ce93e0ab2dcd65a44923f95ea24b580b94f53187ddf30` after the Settings manager refresh
  (USER-SETTINGS-MANAGER-REFRESH-20260908; a presentation count over the unchanged 38-key registry). The historical video analysis and
  packet evidence remain recorded, while active presentation enforces:
  1. *Stable Alignment:* Left-aligned labels, standardized form field widths, and predictable baseline alignments.
  2. *Legible Short Labels:* Plain-English setting names without nested technical paths.
  3. *Trailing Values & Controls:* Input controls, toggles, and selectors sit at the right edge of rows.
  4. *Deliberate Whitespace:* Standardized section spacing separating distinct logical setting groups.
  5. *Limited Simultaneous Detail:* Progressive disclosure for advanced, dangerous, or rarely used parameters.
  6. *One Quiet Action Row:* Secondary actions, resets, and documentation links cluster into a single subtle bottom action strip.
  7. *No Top Action Bar:* No header-level action strip; actions live in rows, section title rows, or the single quiet bottom row.
  8. *Bounded Tabs:* At most six tabs per manager.
  9. *Exactly One Advanced Disclosure:* One labeled keyboard-operable Advanced disclosure per manager view holds advanced, dangerous, rarely used, and diagnostic items.
  10. *Side Panel Anatomy:* Manager drawers and the setting Details inspector share one anatomy (identity header, sectioned body, quiet footer) and the same spring motion, without decorative accent bars; inspector width tokens are unchanged.
  11. *Status Tokens, Not Pills:* A small coloured dot with text for state; quiet text for category labels; capsules only for keyboard keys.
  12. *Themed Listboxes:* Concept-drawn listboxes over hidden native selects with the chat assistant's popout motion; no native option list is visible; menus share the popout.
  13. *Manager-Topic Settings Live Inside Their Manager:* Manager-topic canonical settings render inline inside their manager before its Advanced disclosure; core settings stay on plain pages; every inventory id renders exactly once.
- **Exhaustive Application Across 38 Settings Managers (APR-062):** The restored native presentation
  grammar applies across all thirty-eight registered Settings managers:
  1. `all-settings` (Search-first catalog)
  2. `general-appearance-input` (Theme, font, interaction style, working-activity-style)
  3. `providers-accounts-models` (API keys, endpoints, default models)
  4. `web-routes` (Web search, scrape policies)
  5. `media-routes` (Image/audio generation routing)
  6. `back-seat-driver` (BSD sensitivity, stage bindings, catch-up policy)
  7. `memory-context-instructions` (Context window, rehydration, instructions)
  8. `goals-crew-personas` (Agent rosters, personas, Goal V2 defaults)
  9. `permissions-filesafe` (File safe boundaries, tool approvals)
  10. `commands-shortcuts` (Keybindings, command palette)
  11. `tools-integrations` (MCP servers, external CLI tools)
  12. `testing-debug-capture` (Test runners, trace capture, video evidence)
  13. `files-editor-terminal` (Editor preferences, shell configuration)
  14. `notifications-sounds` (Audio cues, system notifications)
  15. `source-control` (Git defaults, branch rules, worktree policies)
  16. `browser-policy` (Headless browser runtime, security rules)
  17. `containers-registries` (Docker/Podman daemon, container settings)
  18. `storage-retention-recovery` (Database retention, snapshot pruning)
  19. `project-history-artifacts` (Build history, artifact storage)
  20. `settings-transfer` (Export/import settings profiles)
  21. `settings-export-migration` (Schema migration, legacy import)
  22. `server-claim-bootstrap` (Puppet Master server initialization)
  23. `servers-hosts-environments` (Remote execution servers)
  24. `clients-continuity` (Multi-client session synchronization)
  25. `project-hosting-files` (Project file server configuration)
  26. `project-sync-move-copy` (Remote workspace synchronization)
  27. `ssh-remote` (SSH key management and remote hosts)
  28. `remote-access` (Tunneling, reverse proxy, web access)
  29. `server-backup-restore` (Server-level disaster recovery)
  30. `project-backup` (Project-level archive and backup)
  31. `updates` (Application update channels and policies)
  32. `project-defaults-templates` (Project scaffolding templates)
  33. `onboarding-guided-tour` (Guided tour replay, onboarding flags)
  34. `doctor` (System health checks, diagnostics)
  35. `usage-budgets` (Spend limits, token quotas)
  36. `teacher-help` (Interactive tutorial and help projection)
  37. `project-search-index` (Codebase search indexing policy)
  38. `dry-method` (DRY enforcement and duplication guard policy)
  And across the three named visible-state projections: `teacher-help`, `project-search-index`,
  and `dry-method`, as well as the Assistant Settings projections (`settings.assistant`,
  `settings.bsd`, `settings.schedule`). All 892 settings in the inventory remain preserved. Census (USER-SETTINGS-MANAGER-REFRESH-20260908): `Plans/settings_inventory.json` holds 887 ordinary setting ids and the concept's `PM12_REFERENCE` holds 892 (887 plus the five concept-proposed roster/stage rows); the 828 figure in SSYS-004/SSYS-005 is a preserved historical denominator token.
- **Source-Only Builder Maintenance (APR-063, amended by USER-SETTINGS-MANAGER-REFRESH-20260908):** Settings HTML is never
  hand-edited. The published `Concepts/TestPMConcept.html` is generated by
  `Concepts/pm7-tools/build_testpm_settings_refresh.py` from the pinned published checkpoint through the
  authored T50 transform `Concepts/pm7-tools/settings_refresh_source.py` (also registered in
  `Concepts/pm7-tools/build_pm7.py`); the lane asserts every non-Settings script element byte-identical to the
  pinned base and reproduces the published bytes under `--check`. The `build_testpm_layout_b06.py` lane is
  predecessor lineage contained in the new pinned base.
- **Context-Sensitive Manager Navigation (APR-065):** When opening a Settings manager from an
  in-canvas context link or dropdown picker, the picker retains and visually indicates the specific
  manager identity for which it was opened. Context is not dropped or reset during deep navigation.
- **Manager Kit and Workspace Presentation (USER-SETTINGS-MANAGER-REFRESH-20260908):** All manager workspaces of the
  published concept render through one shared manager kit with the ten principles above; registry destinations
  are grouped into concept workspaces (separate Code & Tools workspaces for Skills, Plugins, MCP Servers, and
  Commands & Shortcuts over `tools-integrations` and `commands-shortcuts`; one System workspace "Server &
  Project Location" over the seven server/location keys; Single Owners and Browser & SCM governance as Advanced
  disclosures; Back Seat Driver as its own kit manager) without changing manager keys, routes, detail ids, or
  command ids. The setting Details inspector keeps F3-519's 350 px / min(370 px, 82 percent) tokens; domain
  switches obey F3-513 (no black-screen or uniform-frame flash; first frame at least 85 percent of settled
  brightness).

```yaml
plan_unit_id: F3-535
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Activity Detail defaults to a pinned side panel on the left of the chat canvas. An explicit Unpin
  converts the current view to floating, but clicking any subsequent activity preview item opens its
  record pinned, never persisting floating state across activations. Pinned History and pinned
  Activity Detail share canvas width dynamically without overlapping gutters. The Chat Activity Bar
  floats as a styled pill centered above the composer with transparent sides and bottom and pointer
  pass-through around the pill, with transcript bottom padding ensuring the final child at settled
  bottom scroll rests completely above the pill.
gui_related: true
gui_classification_reason: Governs the core layout geometry of Activity Detail, History rail coexistence, and the floating Chat Activity Bar.
depends_on: [F3-531, F3-533]
unblocks: [F3-537]
acceptance_criteria:
  - Opening Activity Detail defaults to pinned left geometry.
  - Clicking any activity preview item opens the record pinned, even if a previous record was unpinned.
  - Pinned History and Activity Detail share width without overlapping gutters.
  - Chat Activity Bar floats over transcript with transparent sides/bottom and pointer pass-through.
  - Transcript settled bottom scroll completely clears the activity pill.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: layout_geometry_or_floating_bar_regression
reasoning_tier: high
context_scope: assistant_layout_geometry
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: assistant_layout_specification
  create_worknodes: false
source_lineage:
  - APR-001
  - APR-002
  - APR-004
preserved_exact_tokens:
  - "Activity Detail"
  - "Chat Activity Bar"
  - "unpin"
  - "pointer pass-through"
negative_constraints:
  - Do not persist unpinned state across explicit new item activations.
  - Do not render an opaque in-flow footer for the activity bar.
owner_hints:
  - Plans/FinalGUISpec.md
```

```yaml
plan_unit_id: F3-536
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat transcript container strictly prohibits horizontal scrolling across all supported viewport
  widths. Bounded layout constraints are enforced on attachments, hidden previews, rich-plan tables,
  and cards. Non-working transcript cards follow a unified visual rhythm with consolidated outer
  borders. File change diffs render additions in theme-aware green with leading plus signs and deletions
  in red with leading minus signs. Internal agent work notes are strictly internal execution state and
  are prohibited from rendering as ordinary transcript cards.
gui_related: true
gui_classification_reason: Governs transcript horizontal extent, card visual rhythm, diff coloring, and internal work-note boundaries.
depends_on: [F3-533, F3-534]
unblocks: []
acceptance_criteria:
  - scrollWidth equals clientWidth on the transcript container without horizontal scroll.
  - Redundant outer boxes on transcript cards are eliminated.
  - Diffs display green additions with '+' and red deletions with '-'.
  - Internal work notes do not appear as transcript cards or user deliverables.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: transcript_overflow_or_work_note_leakage
reasoning_tier: high
context_scope: transcript_rendering_rules
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: transcript_rendering_specification
  create_worknodes: false
source_lineage:
  - APR-003
  - APR-011
  - APR-055
  - APR-056
preserved_exact_tokens:
  - "scrollWidth"
  - "clientWidth"
  - "internal work notes"
negative_constraints:
  - Do not permit horizontal scrollbars in the transcript.
  - Do not render internal work notes as transcript cards.
owner_hints:
  - Plans/FinalGUISpec.md
```

```yaml
plan_unit_id: F3-537
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Activity hover previews provide a single bounded preview surface per domain without nested floating
  panels or internal scrollbars. Separate Open Activity buttons are removed from previews in favor
  of direct item-click navigation into pinned Activity Detail. Previews present a curated subset with
  an overflow counter row for navigation. Preview item selection strictly preserves domain and item
  identity during routing.
gui_related: true
gui_classification_reason: Governs activity hover preview structure, bounded non-scrolling presentation, and direct navigation routing.
depends_on: [F3-533, F3-535]
unblocks: []
acceptance_criteria:
  - Previews use a single outer surface with no nested floating subpanels.
  - Separate Open Activity buttons are removed from all hover previews.
  - Previews do not scroll internally; overflow rows navigate to full detail.
  - Clicking a preview item opens that exact record in pinned Activity Detail.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: hover_preview_nesting_or_navigation_drift
reasoning_tier: high
context_scope: activity_hover_previews
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: activity_hover_specification
  create_worknodes: false
source_lineage:
  - APR-005
  - APR-006
  - APR-007
  - APR-042
preserved_exact_tokens:
  - "hover preview"
  - "Open Activity"
  - "overflow"
negative_constraints:
  - Do not allow internal scrolling within activity hover previews.
  - Do not render redundant Open Activity buttons in previews.
owner_hints:
  - Plans/FinalGUISpec.md
```

```yaml
plan_unit_id: F3-538
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Context Lens dropdown occupies a true in-flow layout row between the chat header and the transcript.
  Context More Details presents a compact first view with deeper BSD and token diagnostics placed behind
  intentional disclosures. Decorative left-edge accent bars, stripes, and pseudo-elements are strictly
  prohibited across all Assistant and Settings surfaces, preserving only functional diff gutters, tree
  connectors, and working structural rails.
gui_related: true
gui_classification_reason: Governs Context Lens in-flow placement, concise More Details hierarchy, and the complete elimination of decorative left stripes.
depends_on: [F3-531, F3-534]
unblocks: []
acceptance_criteria:
  - Context Lens renders in flow between header and transcript without clipping.
  - Context More Details first view is compact with advanced BSD data behind disclosures.
  - No decorative left stripes or pseudo-elements exist on Assistant or Settings cards.
  - Functional tree connectors, diff gutters, and working activity rails are preserved.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: lens_clipping_or_decorative_stripe_reintroduction
reasoning_tier: standard
context_scope: context_lens_and_accent_rules
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Back_Seat_Driver.md
node_compile_hint:
  mode: context_lens_specification
  create_worknodes: false
source_lineage:
  - APR-009
  - APR-033
  - APR-034
  - APR-061
preserved_exact_tokens:
  - "Context Lens"
  - "More Details"
  - "left-edge accent"
negative_constraints:
  - Do not render decorative left-edge accent bars or stripes.
  - Do not float Context Lens over transcript content.
owner_hints:
  - Plans/FinalGUISpec.md
```

```yaml
plan_unit_id: F3-539
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Assistant wand menu structures commands into compact, organized submenus rather than a single
  unbounded command list. The chat composer strictly excludes internal-browser launch controls,
  preserving independent URL and attachment capabilities. All concept demonstration fixtures, replay
  commands, and sample loaders are isolated within a dedicated Demo Gallery and excluded from product
  command menus.
gui_related: true
gui_classification_reason: Governs wand menu grouping, composer browser boundary, and demo fixture isolation.
depends_on: [F3-531]
unblocks: []
acceptance_criteria:
  - Wand menu uses submenus for logical grouping within viewport bounds.
  - No browser launch button appears in the chat composer.
  - Demo fixtures and replays are located exclusively in the Demo Gallery.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: wand_overflow_or_demo_command_pollution
reasoning_tier: standard
context_scope: wand_menu_and_composer_boundaries
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/Commands_System.md
node_compile_hint:
  mode: wand_and_boundaries_specification
  create_worknodes: false
source_lineage:
  - APR-010
  - APR-013
  - APR-014
preserved_exact_tokens:
  - "wand"
  - "submenus"
  - "Demo Gallery"
negative_constraints:
  - Do not render a browser launcher in the composer.
  - Do not register demo fixtures as product commands.
owner_hints:
  - Plans/FinalGUISpec.md
```

```yaml
plan_unit_id: F3-540
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Clicking a plan title, Details, Expand, or Open plan in the transcript opens or focuses the plan in
  the left editor tab bar with tab deduplication. The left plan tab provides the full suite of owner-backed
  plan controls equivalent to the transcript Plan card. Activating a plan opens a readable editor pane
  even from a collapsed split, and subsequent divider resizing preserves a minimum functional chat width.
gui_related: true
gui_classification_reason: Governs left editor plan tab navigation, control parity, and responsive split behavior.
depends_on: [F3-533, F3-534]
unblocks: []
acceptance_criteria:
  - Transcript plan actions open or focus the left plan tab without tab duplication.
  - The left plan tab provides Rich/Markdown toggle and all build/revise/export controls.
  - Opening a plan expands collapsed splits to readable width.
  - Resizing editor/chat split preserves minimum 360 px chat canvas width.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: plan_editor_tab_loss_or_split_deadzone
reasoning_tier: high
context_scope: plan_tab_editor_navigation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Assistant_Plan_Runtime.md
node_compile_hint:
  mode: plan_tab_navigation_specification
  create_worknodes: false
source_lineage:
  - APR-036
  - APR-037
  - APR-038
  - APR-066
preserved_exact_tokens:
  - "plan tab"
  - "deduplication"
  - "editor split"
negative_constraints:
  - Do not open duplicate tabs for the same plan.
  - Do not squeeze chat into the resize handle dead zone.
owner_hints:
  - Plans/FinalGUISpec.md
```

```yaml
plan_unit_id: F3-541
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Agent work is presented through explicit typed records separating file changes, artifacts, progress
  summaries, and internal notes. Provider selector rows and file references link strictly to authentic
  repository evidence such as threads/provider-selector.js. Record summaries and details safely render
  bounded inline code and emphasis with length limits and syntax escaping.
gui_related: true
gui_classification_reason: Governs typed work record presentation, authentic file evidence references, and inline code formatting.
depends_on: [F3-533]
unblocks: []
acceptance_criteria:
  - Agent work is categorized into typed records; generic boxes are eliminated.
  - Provider rows link directly to existing repository evidence paths.
  - Inline code and text formatting render safely within bounded lengths.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: untyped_work_box_or_invalid_evidence_ref
reasoning_tier: standard
context_scope: agent_work_record_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: agent_work_record_specification
  create_worknodes: false
source_lineage:
  - APR-039
  - APR-040
  - APR-041
preserved_exact_tokens:
  - "typed records"
  - "provider-selector.js"
  - "inline code"
negative_constraints:
  - Do not render generic un-typed agent work boxes.
  - Do not use fictitious file evidence paths.
owner_hints:
  - Plans/FinalGUISpec.md
```

```yaml
plan_unit_id: F3-542
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Collaboration configuration popups enforce shared choice controls, plain-language labels with option
  descriptions, and consistent inset footers with 16 px padding and clear button hierarchy. Selecting
  Single Agent Review immediately collapses the active reviewer roster to one. All nine Activity Detail
  families adhere to the unified native card and grid presentation grammar per USER-REFERENCE-LAYOUT-ROLLBACK-20260908,
  superseding the reference-video flat-row and forced single-column layout while preserving concise hierarchy,
  clear progress/state grouping, and quiet action rows. Read-only inspection fixtures present findings
  and code evidence without interactive mutation controls.
gui_related: true
gui_classification_reason: Governs collaboration configuration popups, footer styling, Single Agent Review invariant, and all nine Activity Detail families.
depends_on: [F3-531, F3-533, F3-535]
unblocks: []
acceptance_criteria:
  - Popups use shared choice dropdowns, plain-language options, and 16 px inset footers.
  - Switching to Single Agent Review reactively reduces draft reviewer count to exactly one.
  - All nine Activity Detail families apply the native card and grid presentation grammar with concise hierarchy, superseding the reference-video flat-row prescription.
  - Read-only inspection demos render findings without interactive mutation controls.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: collaboration_popup_or_activity_family_grammar_drift
reasoning_tier: high
context_scope: collaboration_and_activity_families
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Collaborative_Workflows.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: collaboration_and_activity_specification
  create_worknodes: false
source_lineage:
  - APR-051
  - APR-052
  - APR-053
  - APR-054
  - APR-060
  - APR-067
preserved_exact_tokens:
  - "Single Agent"
  - "inset footers"
  - "nine Activity Detail families"
negative_constraints:
  - Do not retain multiple reviewers when Single Agent Review is active.
  - Do not omit any of the nine Activity Detail families from the unified grammar.
  - Do not reintroduce reference-video flat-row or forced single-column CSS into Activity Detail.
owner_hints:
  - Plans/FinalGUISpec.md
```

```yaml
plan_unit_id: F3-543
unit_type: gui_requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Under USER-SETTINGS-MANAGER-REFRESH-20260908 the Settings manager presentation grammar gains four principles
  beyond the six restored native ones: no header-level action strip, at most six tabs, exactly one labeled
  Advanced disclosure per manager view, and one side-panel anatomy shared by manager drawers and the setting
  Details inspector (identity header, sectioned body, quiet footer, spring open and material close, no
  decorative accent bars, inspector width tokens unchanged). Manager workspaces of the published concept are
  presentation groupings over the unchanged 38-key registry: separate Code & Tools workspaces for Skills,
  Plugins, MCP Servers, and Commands & Shortcuts; one System workspace Server & Project Location; Single Owners
  and Browser & SCM governance as Advanced disclosures; Back Seat Driver as its own kit manager. Domain
  switches obey F3-513, built-in sounds are labelled demonstration tones per F3-405, and All Settings scrolls
  with the page while remaining virtualized per SSYS-005.
gui_related: true
gui_classification_reason: Owns the visible manager presentation grammar, workspace grouping, and side-panel anatomy of every Settings manager in the published concept.
split_recommended: false
depends_on: [F3-542, F3-519, F3-513, F3-405, SSYS-033]
unblocks: []
acceptance_criteria:
  - No manager workspace renders a header-level action strip; no manager exposes more than six tabs; each view has at most one Advanced disclosure.
  - Manager drawers and the setting Details inspector share one anatomy and the spring/material motion tokens; the inspector measures 350 px (min(370 px, 82 percent) overlay at 960 px and below).
  - The browser checkpoint and the slow-motion film show no blank or uniform-frame flash on domain switch, tab switch, panel open/close, or inspector open/close.
  - Eight themes at 760, 960, and 1440 px render the key managers with zero horizontal overflow.
  - (USER-SETTINGS-MANAGER-REFRESH-20260909) Status tokens instead of pills, concept-drawn listboxes and menus with the shared popout motion, independently scrolling rosters, a two-column sound grid, ordered account and route lists with inline priority controls, and inline manager-topic settings rendered exactly once (F3-551).
validation_surfaces:
  - node Concepts/pm7-tools/verify/settings_refresh_checkpoint.mjs
  - node Concepts/pm7-tools/verify/settings_refresh_film.mjs
  - python3 Concepts/pm7-tools/verify/settings_refresh_sheet.py
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: manager_presentation_regression_or_motion_flash
reasoning_tier: high
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Concepts/pm7-tools/settings_refresh/styles.css
  - Concepts/pm7-tools/settings_refresh/kit.js
  - Concepts/pm7-tools/settings_refresh/placement.json
node_compile_hint:
  mode: gui_presentation_specification
  create_worknodes: false
source_lineage:
  - USER-SETTINGS-MANAGER-REFRESH-20260908
  - USER-REFERENCE-LAYOUT-ROLLBACK-20260908
  - F3-542
  - SSYS-033
  - USER-SETTINGS-MANAGER-REFRESH-20260909
preserved_exact_tokens:
  - "No Top Action Bar"
  - "Bounded Tabs"
  - "Exactly One Advanced Disclosure"
  - "Side Panel Anatomy"
negative_constraints:
  - Do not reintroduce a per-manager top action bar or more than six tabs.
  - Do not give the Details inspector or a drawer a decorative accent bar.
  - Do not change the inspector width tokens.
  - Do not reintroduce capsule pills or a native option list in Settings.
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Settings_System.md
