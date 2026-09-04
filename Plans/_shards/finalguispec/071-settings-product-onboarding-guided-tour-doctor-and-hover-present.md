# Shard 071: Settings, Product Onboarding, Guided Tour, Doctor, And Hover Presentation Reconciliation - 2026-08-31 (amended 2026-09-01)

Source: `Plans/FinalGUISpec.md`

Source lines: L34887-L35578

Source SHA256: `d5dd0b8f0f130cf3a4834576d4ac87136d579819ec48bf6b3f165ac4874adc2b`

---

## Settings, Product Onboarding, Guided Tour, Doctor, And Hover Presentation Reconciliation - 2026-08-31 (amended 2026-09-01)

This addendum is the current Final GUI presentation authority for the Settings, Product Onboarding, Guided Tour,
Doctor, and global hover-tag surfaces. It consumes system-owner state and commands; it does not move semantic,
runtime, persistence, security, probe, remediation, or domain-mutation ownership into Final GUI. The strict static
presentation sidecar is `Plans/final_gui_interaction_contracts.schema.json`, and its positive/negative examples are
`Plans/final_gui_interaction_contract_fixtures.json`. Schema and fixture success proves only contract shape.

The following predecessor clauses remain historical lineage, not current behavior:

- F3-411's four-screen/provider-first order, prohibition on a full product tour, and compact-Doctor-only language
  are superseded by F3-520 through F3-522. Its beginner-friendly, concise-copy, truthful-state, and pre-shell intent
  remains current.
- F3-409's provider-first onboarding choreography is superseded; its Free Models requested/effective override and
  truthful availability presentation remain current outside the simple default onboarding path.
- F3-513's T33-T43 build-tail statement is predecessor lineage for these surfaces; authored T44 Settings/Doctor,
  T45 Product Onboarding/Guided Tour, T46 system consumers, T47 hover, and the bounded T48 Home refresh are the
  current concept path. T48 may refresh authored Home source to expose the setup-wizard return route; it does not
  authorize a hand edit to generated `Concepts/PMConcept7.html`.
- F3-517's prohibition on Settings changes does not apply to this user-authorized Settings/Doctor port. Its rule
  against theme overlays changing functional identity remains current.
- F3-518's no-accessibility-expansion clause is superseded for the T44-T47 touched surfaces. The broader bootstrap
  boundary remains historical context, but keyboard, screen-reader, focus, tooltip, and reduced-motion acceptance
  below is required.

### F3-519 - K3 Settings And Doctor Geometry In PMConcept7 Chrome

```yaml
plan_unit_id: F3-519
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Final GUI renders Settings and operational Doctor with the selected K3 Tome Tabs geometry inside PMConcept7
  shared chrome: a 250 px domain rail, 62 px top bar, workspace tabs, continuous document, 168 px page index,
  350 px details inspector, manager destinations, and a 1040 px maximum ordinary document body, with the
  host-width responsive states owned by SSYS-003. Mild theme and surrounding-chrome adaptation may change paint,
  typography, shape, opacity, texture, and motion while preserving this information architecture. No Settings- or
  Doctor-specific Back control or breadcrumb is added merely to fit the outer shell. All eight built-in PMConcept7
  themes render the same functional inventory and geometry contract.
gui_related: true
gui_classification_reason: This unit owns the visible K3 layout, PMConcept7 chrome fit, and theme adaptation.
split_recommended: false
depends_on: [F3-513, F3-517, SSYS-003, SSYS-016, N2-152, N2-153]
unblocks: [F3-520, F3-522, F3-523, F3-524]
acceptance_criteria:
  - "Wide-state geometry proves 250/62/168/350/1040 values and preserves the continuous document/index/details/manager structure."
  - "Host-width behavior follows SSYS-003 at 1180, 960, 720, and 320 px without clipped or unreachable content."
  - "Basic, Friendly, Glass, and Retro light/dark variants preserve control identity, order, and availability while applying theme-native paint and motion."
  - "No new Settings- or Doctor-specific Back button or breadcrumb is required or rendered by this integration."
  - "Settings and Doctor consume owner projections and typed routes; neither becomes a runtime or mutation owner."
validation_surfaces:
  - Plans/final_gui_interaction_contracts.schema.json
  - Plans/final_gui_interaction_contract_fixtures.json
  - future native Slint host-width geometry and actual-pixel review
risk_class: k3_geometry_or_owner_drift
reasoning_tier: high
context_scope: k3_settings_doctor_pm7_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/settings_tome_source.py
  - Concepts/pm7-tools/build_pm7.py
  - future native Slint Settings and Doctor components
node_compile_hint: {mode: k3_settings_doctor_presentation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Settings_System.md#SSYS-003
  - Plans/Settings_System.md#SSYS-016
  - Plans/newtools.md#N2-152
  - Plans/newtools.md#N2-153
  - Concepts/settings-redesign-concepts/kimi-k3-polish/concept-12-tome-tabs.html
preserved_exact_tokens: [K3 Tome Tabs, 250px, 62px, 168px, 350px, 1040px, Basic, Friendly, Glass, Retro]
negative_constraints:
  - "Do not change K3 geometry for aesthetic cleanup."
  - "Do not add a new Settings- or Doctor-specific Back or breadcrumb requirement."
  - "Do not let Final GUI own setting values, Doctor checks, domain truth, or remediation mutations."
  - "Do not infer native Slint correctness from generated HTML or browser geometry."
owner_boundary_notes:
  - "Settings System owns Settings semantics and data; newtools Doctor owns the registry/router/projection; Final GUI owns paint, layout, motion, and overlays only."
owner_hints: [Plans/FinalGUISpec.md, Plans/Settings_System.md, Plans/newtools.md]
```

### F3-520 - Simple Cinematic Product Onboarding Presentation

```yaml
plan_unit_id: F3-520
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Product Onboarding is a beautiful, calm first impression presented as one bounded modal window over a theme-aware
  scrim, with the live PMConcept7 application still visibly present behind it; it is never a full-page route or a
  replacement application surface. The modal presents the exact nine-stage main journey welcome -> simple_path ->
  first_project -> source_control_setup -> server_storage_client -> remote_access_setup -> review_setup_plan ->
  automatic_preparation -> ready. Choosing the connect-existing path uses the exact bounded six-stage shortcut
  welcome -> simple_path -> remote_access_setup -> review_setup_plan -> automatic_preparation -> ready and does not
  fabricate empty first_project, source_control_setup, or server_storage_client stages. The bounded eight-theme choice
  appears at welcome, before Project or infrastructure choices, and changes presentation only. In user language, the
  main journey welcomes the person, chooses whether to begin here or connect to an existing Puppet Master, creates or
  opens their first project, gives the project safe version history, chooses the computer and storage places that will
  do and hold the work, offers private access, reviews the complete setup plan, prepares only the approved choices, and
  finishes in a concise Ready state. Before the person confirms the current Review Setup Plan, choices update the local
  draft and may consume cached projections, detected-account observations, and explicitly read-only Local/VPN or active
  Tailscale discovery; authentication, enrollment, pairing, trust, restore, repository creation or binding, filesystem
  writes, and every other owner mutation remain forbidden. Confirm and prepare validates that current plan and dispatches
  it exactly once through canonical owners; Automatic Preparation observes only those real owner results. Each screen has
  one clear decision, one dominant primary action, short human copy, automatic detection, safe defaults, and calm
  progressive disclosure. The First Project decision is the deliberate exception to progressive hiding: its four equal
  aligned routes remain visible together so no one must guess what a More menu conceals.
  Safe History is the beginner-facing local version timeline: Git is the recommended local engine, Jujutsu is an
  alternative local engine with no account, FileSafe adds complementary local recovery points, and GitHub, GitLab,
  Azure DevOps, Bitbucket, or eligible Cursor Origin may hold a separate optional online copy without replacing local
  history.
  User-visible copy assumes no coding or IDE knowledge: it uses familiar words and never exposes the internal term
  `shell`, raw command/route/schema identifiers, owner names, host/environment vocabulary, provider matrices,
  diagnostics dashboards, network topology, or unexplained source-control jargon. Optional owner-routed branches
  cover opening an existing or online project, restoring a backup, keeping history locally or using a connected
  source service, discovering/pairing or manually locating another computer, setting up a work computer, optional
  service help, and private-access choices; advanced detail remains deferred or disclosed only when needed. Server,
  Storage, and this Client are three independent placements; local/mounted folders, advanced SSH/SFTP sources, and
  backup sources remain distinct. Every main stage has a scene-specific, theme-native cinematic composition rather than
  a generic repeated fade. The four theme families use substantially different illustration systems and directing
  language--Basic is an exact instructional blueprint, Friendly is an organic storybook workspace, Glass is a layered
  spatial composition, and Retro is a pixel/terminal sequence--rather than recoloring one shared image or silhouette.
  The interruptible opening hero assembles the Puppet Master identity in approximately 1.2-1.5 seconds without
  blocking input; step transitions use 420-560 ms, element choreography uses 60-80 ms stagger, microinteractions use
  120-220 ms, and success settles in approximately 700 ms. Reduced Motion preserves hierarchy with immediate state
  change or a very short opacity settle. Retro uses deliberate stepped, no-scale motion and hard compact reveals;
  Basic, Friendly, and Glass use material-appropriate easing and paint.
gui_related: true
gui_classification_reason: This unit owns Onboarding's visible composition, copy density, hierarchy, and cinematic motion.
split_recommended: false
depends_on: [F3-519, PWIZ-021, PWIZ-022, PWIZ-024, RAS-014, SCS-012, FGI-011]
unblocks: [F3-521, F3-524]
acceptance_criteria:
  - "Onboarding is a bounded, centered modal window over the visibly preserved live application at every desktop width; narrow and short windows retain an explicit outer margin and modal chrome rather than becoming a full-page route."
  - "The scrim blocks interaction with the application while the modal is active, including body-level surfaces mounted after the modal opens; exactly one element exposes role=dialog and aria-modal=true, its accessible name follows the active stage or owner-branch heading, the aria-hidden outgoing visual layer is inert and contains no duplicate IDs, focus remains trapped inside, and Close/Escape returns to the exact initiating application control or the verified active application tab for automatic first-run opening."
  - "Welcome presents one immediate Begin setup/Get Started action whose availability is never delayed by the hero sequence; the exact nine-stage main order is welcome, simple_path, first_project, source_control_setup, server_storage_client, remote_access_setup, review_setup_plan, automatic_preparation, ready."
  - "Choosing connect-existing follows exactly welcome, simple_path, remote_access_setup, review_setup_plan, automatic_preparation, ready; it skips first_project, source_control_setup, and server_storage_client instead of mounting blank or inapplicable stages, while Back follows the same bounded shortcut in reverse."
  - "The connect-existing choice is composed as a first-class peer in simple_path, not a tacked-on admonition box; entering it lands on the route chooser, never on a premature Review summary or a redundant Use nearby devices/Find one I already use pre-step."
  - "The bounded eight-theme choice is available at welcome before Project and infrastructure decisions and changes presentation without dispatching owner work; Basic, Friendly, Glass, and Retro use drastically different scene imagery, composition, material, typography, and motion direction, while each family's light/dark pair preserves that family identity instead of presenting eight recolors of one illustration."
  - "Before the current review_setup_plan revision is confirmed, every choice updates only the local draft; cached projections, detected-account observation, and explicitly read-only Local/VPN or already-active Tailscale discovery may update that draft without changing external state, but no authentication, enrollment, pairing, trust, restore, repository creation/binding, filesystem write, Project/Source Control/Server/storage/Remote Access mutation, update, or other owner mutation is dispatched."
  - "Confirm and prepare at review_setup_plan validates the current path, revision, choices, consequences, and approved-plan hash, dispatches the approved owner work exactly once, and only then permits automatic_preparation to observe current real results; stale, unconfirmed, or expanded plans dispatch nothing."
  - "The first_project stage exposes four equal, aligned, keyboard-reachable choices together--Start a new project, Open a folder here, Bring one from online, and Restore a backup--with no More project choices disclosure; source_control_setup, server_storage_client, and remote_access_setup then occur before review_setup_plan rather than hiding work behind a setup shortcut."
  - "Source-control setup keeps two independent visible axes: local Safe History uses Git or Jujutsu on the selected computer, while an optional forge account/repository keeps a separate online copy; Jujutsu is never presented as an account, website, or online-copy provider, and FileSafe is described only as complementary local recovery."
  - "After current Review confirmation, a new-project owner route initializes local Git through `cmd.project.new_local {init_git:true}`; local-engine selection uses the canonical Source Control owner, while GitHub, GitLab, Azure DevOps, Bitbucket, and eligible Cursor Origin account verification, repository creation/selection, visibility, and binding remain explicit forge/auth owner routes. Cursor Origin is presented as a hosted Git forge, never as a no-host or local-only preview."
  - "An online copy becomes ready only after both a current verified account identity and the exact repository binding exist; Already connected must select and verify both and is never a no-op. Account creation, sign-in, organization/namespace/workspace/project selection, repository name, allowed visibility, and optional repository details follow the selected forge's owner contract rather than a generic one-field form."
  - "Open a folder here distinguishes a local folder, an OS-mounted SMB/NFS location, and an Advanced SSH/SFTP source; Restore a backup has its own source and transport rather than reusing an ordinary folder path. Server (where work runs), Storage (where files live), and this Client (the device in hand) remain visibly independent choices."
  - "Connect existing selects the route before discovery and pairing: Local or VPN uses LAN plus an `Include connected VPN networks` checkbox and asks for no private address by default; a usable active Tailscale tailnet needs no sign-in, otherwise one protected built-in sign-in is offered and an official site is used only for explicit account creation; Headscale takes its control URL and owner-managed enrollment; Reverse proxy accepts the existing protected Puppet Master HTTPS URL rather than offering proxy generation; Puppet Master Remote Link remains visible and accepts its link, QR, or short code. Manual Server identity/address entry appears only when safe discovery cannot find the intended Server."
  - "A visible recognition checkbox is absent. Reachability, a device label, or possession of an address never grants trust; the selected Server identity proceeds through its owner-controlled approval, code, or QR pairing after Review confirmation."
  - "Optional branches use one calm layer of progressive disclosure to collect opening/restoring, source-service, Server, storage, and access details without turning the modal into an advanced-settings surface; safe read-only discovery may inform the draft before Review, but authentication and all mutating owner execution wait for current Review confirmation."
  - "Automatic preparation shows one calm owner-projected progress statement; determinate progress appears only with an owner denominator, questions appear only when the current owner projection cannot choose safely, and timers never synthesize work or readiness."
  - "Pending, measured-running, ready, failed, and same-operation retry states remain visually calm and preserve the owner operation/work/dedupe identity across modal interruption and resume."
  - "Server, Storage, Client, source location, local Safe History, online copy, and access choices remain independently editable; selecting an already-owned Server exposes the appropriate discovery and pairing presentation without silently forcing storage or Client placement."
  - "Ready presents one dominant enter action, a working Back action, and an optional Guided Tour without trapping the user; Back returns to Review with the complete live draft intact. Starting the Tour transfers and clears saved focus ownership and releases inertness before the Tour starts, while an unavailable or throwing Tour start records no successful handoff and restores the saved workspace initiator/fallback."
  - "The Home dropdown beside the theme selector contains exactly one `Run setup wizard` item directly below `Reset Layout`; it invokes typed local action `ui.onboarding.start` with source surface `home_menu`, reopens the same modal at Welcome, and does not create a second onboarding state machine or domain command."
  - "Every visible sentence and disabled reason is understandable to a person who has never coded or used an IDE; `shell`, internal owner names, command IDs, schema IDs, route IDs, and unexplained implementation vocabulary never appear as product copy."
  - "Help uses one anchored explainer surface at a time: activating a typed SVG `?` opens a plain-language explanation attached to that exact option, replaces or closes any prior explanation, and never expands empty peer sections. The visible shared explainer is the control's actual `aria-controls` target and its active `aria-describedby` target; obsolete hidden per-card copies are absent. Primary and secondary card actions have visibly button-shaped treatment, consistent alignment and spacing, and recommended versus alternate choices differ through hierarchy, shape, iconography, and state rather than copy alone."
  - "All stages use one consistent grid, selection state, action hierarchy, explainer grammar, spacing rhythm, and in-flow footer model; specialized fields may vary by route, but controls do not change alignment or interaction rules from one setup screen to the next."
  - "One terminal owner result auto-returns and advances without a preview-return/Continue/Done confirmation; discovery, availability, capability, preview, refresh, and test-only results remain on the current choice and never masquerade as completed setup."
  - "Same-stage Details, `?`, and progressive-disclosure updates preserve the settled cinematic scene instead of replaying its entrance; forward/back stage changes use a non-overlapping directional handoff so outgoing and incoming headings never ghost through one another."
  - "Ready summarizes only the selections actually made, marks skipped choices as not set up, and never claims that all important systems or production owner work are ready."
  - "Modal controls use the typed `ui.onboarding.*` local-action vocabulary and owner branches route only to already-canonical domain commands; no `cmd.onboarding.*` family or Final-GUI-owned mutation path is introduced."
  - "The authored browser concept labels its persistence, projections, owner previews, receipts, readiness, and native binding truthfully: browser choreography is concept simulation only, production owner work/readiness remain false or unavailable, and no production or native Slint result is fabricated."
  - "Review is a live projection of the current draft: every route, placement, transport, Safe History engine, online service/account/repository/visibility, pairing choice, skip, and consequence updates immediately when the person goes Back and edits it; Review never displays stale defaults or marks an unconfigured connection ready."
  - "Back, Close, Skip, Do this later, interruption, reversal, resize, and theme changes acknowledge in the same frame and settle deterministically; Back works on every reversible stage including Ready, and Set up access later persists a truthful resumable state. The modal entrance uses fixed-bounds opacity/clipping so a cross-family theme switch cannot translate or scale the window outside its viewport margin."
  - "At the standard review viewport, each stage--including Review and Ready--fits within the bounded modal without a floating action bar, obscured content, or required page scroll; short/narrow fallback may scroll one explicit content region while its in-flow actions remain reachable and never cover the choices."
  - "Cards, buttons, focus rings, hover elevation, explainer surfaces, headings, summaries, and consequence text remain fully inside their clip/viewport bounds; no hover edge or sentence is cut off. Decorative yellow reminders, duplicate Apply Setup panels, sticky blue confirmation boxes, and left-edge color-rail callouts are absent."
  - "Every stage has a distinct visual scene and meaningful continuity of focus; the four theme families use different directing systems rather than paint-only variants, all motion uses Slint-portable opacity, translation, scale, clipping/masking, vector shapes, and theme tokens, and essential storytelling does not require browser-only effects."
validation_surfaces:
  - "Plans/final_gui_interaction_contracts.schema.json and Plans/final_gui_interaction_contract_fixtures.json (current exact nine-stage/six-stage Onboarding presentation, welcome theme choice, and Review hard-fence contract; its current F3-521 Guided Tour remains three scenes and exactly ten actions)"
  - "Plans/product_onboarding_contracts.schema.json and Plans/product_onboarding_contract_fixtures.json (current exact nine-stage/six-stage owner, action, persistence, Review-fence, independent local Safe History, optional online-forge, and typed choice-help contract)"
  - Concepts/pm7-tools/onboarding_cinematic_source.py authored guards
  - Concepts/pm7-tools/home_workspace_refresh_source.py authored guards
  - future eight-theme, Reduced Motion, interruption, reversal, and short-window film review
risk_class: onboarding_overload_or_motion_blocking
reasoning_tier: high
context_scope: product_onboarding_cinematic_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/onboarding_cinematic_source.py
  - Concepts/pm7-tools/home_workspace_source.py
  - Concepts/pm7-tools/home_workspace_refresh_source.py
  - future native Slint Product Onboarding components
node_compile_hint: {mode: onboarding_cinematic_presentation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Planning_Wizard.md#PWIZ-021
  - Plans/Planning_Wizard.md#PWIZ-022
  - Plans/Planning_Wizard.md#PWIZ-024
  - Plans/Remote_Access_System.md#RAS-014
  - Plans/Source_Control_System.md#SCS-012
  - Plans/Forge_Integrations.md#FGI-011
  - Plans/final_gui_interaction_contracts.schema.json
  - Plans/final_gui_interaction_contract_fixtures.json
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Concepts/pm7-tools/onboarding_cinematic_source.py
  - Concepts/pm7-tools/home_workspace_source.py
  - Concepts/pm7-tools/home_workspace_refresh_source.py
preserved_exact_tokens: [welcome, simple_path, first_project, source_control_setup, server_storage_client, remote_access_setup, review_setup_plan, automatic_preparation, ready, connect_existing, Get Started, Begin setup, Confirm and prepare, Do this later, Run setup wizard, Reset Layout, ui.onboarding.start, home_menu, Start a new project, Open a folder here, Bring one from online, Restore a backup, Safe History, FileSafe, Local or VPN, Include connected VPN networks, Reverse proxy, Puppet Master Remote Link, Cursor Origin, SSH/SFTP, 1.2-1.5 seconds, 420-560 ms, 60-80 ms, 120-220 ms, 700 ms]
negative_constraints:
  - "Do not render Product Onboarding as a full-page route or replacement application experience."
  - "Do not restore F3-411's four-screen/provider-first choreography."
  - "Do not restore the predecessor five-stage simple-path order as the current main journey."
  - "Do not restore the superseded seven-stage presentation, insert first_project/source_control_setup/server_storage_client into connect-existing, or bypass review_setup_plan before automatic_preparation."
  - "Do not authenticate, enroll, pair, trust, restore, create/bind a repository, write a filesystem, or dispatch any owner mutation before the person confirms the current review_setup_plan revision; do not misclassify explicitly read-only local/VPN/Tailscale discovery or detected-account observation as a mutation."
  - "Do not hide any of the four First Project choices behind More/Other project choices or frontload unrelated advanced Settings."
  - "Do not use left-edge accent rails, floating footer actions that cover scrollable content, multiple simultaneously expanded explainers, decorative duplicate warning/confirmation cards, or clipped hover/text treatment."
  - "Do not add a stage-skipping Review choices shortcut, a redundant discovery button after the route is selected, or an inert Set up access later action."
  - "Do not expose `shell`, command/schema/route IDs, owner names, host/environment terminology, or unexplained developer/source-control vocabulary in user-visible onboarding copy."
  - "Do not make animation block input, delay navigation, loop continuously, or become required to understand state."
  - "Do not require Canvas, WebGL, browser physics, heavy SVG filters, or blur-dependent storytelling."
  - "Do not move server, provider, Project, backup/restore, authentication, or persistence ownership into Final GUI."
  - "Do not let the Home relaunch item create a second onboarding controller, persistence record, or domain command."
  - "Do not promote browser-concept projections, route previews, local persistence, or receipts into production owner-work, readiness, handler, native Slint, or certification claims."
owner_boundary_notes:
  - "Planning Wizard owns Onboarding orchestration and typed session/actions/returns; Project, Source Control, Server, Remote Access, Backup/Restore, provider, and authentication owners retain their domain state and commands; Home owns only the visible relaunch trigger; Final GUI owns visual hierarchy and motion."
owner_hints: [Plans/FinalGUISpec.md, Plans/Planning_Wizard.md]
```

### F3-521 - Guided Tour Directed Beginner Film Presentation

```yaml
plan_unit_id: F3-521
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Guided Tour is a directed beginner film over the mounted Puppet Master application in one stable order: Usage,
  Planning Wizard, then Assistant Chat with Teacher. Usage first establishes basic page navigation and the meaning of
  the workspace panels, demonstrates how a real card hides and returns, and visually demonstrates that panels/cards
  can be moved and resized; the performed Try beat advances only after the person opens that card's exact Options
  control. Navigation, move, resize, change, and hide remain a compact coherent lesson rather than separate chapters.
  Planning Wizard then explains how a plain-language goal becomes a reviewable sequence, shows the resulting editable
  planning structure, and advances only after the person chooses one real intent on its mounted surface and sees the
  action acknowledged. Assistant Chat docks at the far right, shows the real guide selector, waits for the person to
  select Teacher and send one supported question through the real composer, and displays a deterministic local answer
  in that same conversation. Teacher exposes a large categorized beginner question library in addition to accepting
  free-form supported questions. ELI5 remains a persistent top control beside Pause and Skip and is called
  out in the first scene; the same opening moment explains that people who prefer less animation can enable Reduced
  Motion later in Settings. All visible copy is written for a person who has never coded or used an IDE and never
  calls the application a `shell` or exposes command IDs, owners, providers, models, tokens, receipts, routes, or
  implementation terms. The overlay tracks and highlights mounted controls without cloning them, intercepting owner
  work, or fabricating success. Automatic scene transitions focus the current scene heading, never an action, and do
  not open a visual hover tag without user intent. Pause, Back, Skip, interruption, resize, theme change, and effective
  Reduced Motion preserve real state and focus. Back and forward movement follow the valid story state and never become
  inert or skip required practice. Basic, Friendly, Glass, and Retro direct the film with substantially different
  callout composition, illustration, typography, target treatment, and motion--not one recolored overlay--while never
  using a left-edge accent rail. Transitions preserve the mounted application continuously without a black or empty
  flash. Skip restores the pre-tour layout and exact composer placeholder; successful completion keeps Assistant Chat
  at the far right so Teacher remains the natural final destination.
gui_related: true
gui_classification_reason: This unit owns the directed tour story, focus, overlay, choreography, and accessible presentation.
split_recommended: false
depends_on: [F3-520, PWIZ-023, ACD-431]
unblocks: [F3-524]
acceptance_criteria:
  - "The three visible scenes occur in the exact order Usage, Planning Wizard, and Assistant Chat/Teacher; replay and Back preserve that story instead of bouncing between features."
  - "Every enabled Back or forward control moves exactly one valid story beat, remains reachable and visibly button-shaped, and preserves the scene's mounted state; a coached beat with a required real target advances only from that target's observed action rather than from unrelated clicks, elapsed time, or a generic forward control."
  - "The first Usage beat introduces the persistent `ui.guided_tour.toggle_eli5` control beside Pause and Skip and explains Reduced Motion in the same concise moment; it reads the effective `general.visual.reduce-animations` preference and directs changes to Settings without inventing `ui.guided_tour.toggle_reduced_motion` or another screen."
  - "Usage establishes basic page navigation and panel purpose, groups card hide/reveal into one Watch beat, visibly demonstrates panel/card movement and resizing, requires the exact real card Options control for its Try beat, and explains move, resize, change, and hide together rather than dropping those concepts or splitting them into verbose pages."
  - "The Usage demonstration observes real widget-owner results for hide and reveal; highlighting, narration, elapsed animation, clicking a look-alike, or any unrelated screen change never counts as successful Try completion. The required action receives same-frame acknowledgement before the film advances, so the learner can tell that it worked."
  - "Planning Wizard explains the purpose of planning, shows how one plain-language goal becomes a reviewable and editable sequence, identifies what the learner can change next, and advances only from activation of the exact mounted intent control; it shows and narrates that real result before leaving the scene and adds no redundant confirmation click."
  - "Assistant Chat is docked at the far right before its scene begins and remains there after successful completion; the tour never returns to Usage or Planning after entering the final scene."
  - "Teacher's built-in example is deterministic and local, presents an ordinary-language question and answer in the real Chat surface, and uses no provider, model, network, token budget, protected browser content, or AI-plan execution."
  - "Teacher normal and ELI5 answers preserve the same facts but are materially different: Normal gives a concise adult beginner explanation with useful detail, while ELI5 replaces jargon and abstraction with a concrete familiar analogy and smaller next action rather than merely shortening the same sentence."
  - "Every one of the current 47 supported Teacher topics is discoverable through compact categories, search, or grouped sample questions in the real Chat surface; the initial suggestions stay calm, but the full corpus is not hidden behind knowledge of an exact phrase. Unsupported questions offer relevant categories and examples rather than one tiny hard-coded list or an unrelated fallback answer."
  - "Teacher's first view exposes four calm suggestions plus `Browse 26 more`. The expanded categorized question library is mounted inside Assistant Chat; while it is open the tour callout yields completely, the library and its Close control remain topmost and keyboard-reachable, and closing the library restores the same tour beat without growing, relocating, or clipping the callout."
  - "Teacher says Safe History is local, Git or Jujutsu organizes that local timeline without a Git/Jujutsu account, FileSafe is complementary, and GitHub, GitLab, Azure DevOps, Bitbucket, or eligible Cursor Origin can hold a separate optional online copy; it never calls Git or Jujutsu a shared home, account, website, or hosted copy."
  - "The final Teacher practice requires opening the real Assistant Chat guide selector, choosing Teacher, sending a user-authored supported message through the real composer, and receiving the deterministic reply in that same conversation before Finish becomes the concluding action."
  - "Every automatic non-interaction scene transition puts programmatic focus on the current h2 scene heading with tabindex=-1 and the documented programmatic-focus-landmark exemption; it never auto-focuses an action or opens a visual PMHoverTag, while exact coached interactions wait for the person to focus or activate the real target."
  - "Teacher practice uses the exact novice composer placeholder `Ask Teacher anything about Puppet Master…`; Skip reinstates the exact pre-tour placeholder and pre-tour layout rather than leaving Teacher copy or a partial tour arrangement behind."
  - "Visible headings, instructions, results, unavailable reasons, and buttons use novice-friendly outcome language; the internal term `shell`, raw command/route/schema IDs, receipt labels, and owner/provider/model/token jargon never appear in product copy."
  - "Pause, Back, forward navigation where applicable, and Skip are always reachable and operational; Back restores the prior beat and target state without resetting the whole film, Skip restores the captured starting arrangement, and successful Finish deliberately keeps Chat on the far right without asking for a redundant layout decision."
  - "Effective Reduced Motion removes travel choreography while retaining focus, hierarchy, announcements, and action parity; a preference change made in Settings is honored without discarding the active tour step."
  - "Callout and halo geometry is measured against the live target and viewport, remeasures after real layout changes, clamps to every edge, and never covers the target whenever any safe above/below/side placement or bounded callout shrink can avoid it; short/narrow fallback keeps both target and callout usable instead of accepting a misleading offset highlight."
  - "Guided Tour uses no left-edge color-rail callouts. Basic uses an exact instructional/blueprint director, Friendly an organic illustrated guide, Glass a spatial layered lens, and Retro a terminal/pixel director; these systems differ in silhouette, typography, target treatment, and choreography rather than just color."
  - "Scene, route, target, theme, pause, Back, and forward transitions preserve a continuously painted application frame; no black/empty full-screen flash, stale halo, off-target box, text clipping, oversized heading, or callout edge outside the viewport is accepted."
  - "Protected AuthBrowserSession content is never highlighted, captured, inspected, or described."
  - "PMConcept7 browser behavior, effect receipts, and observed mounted-owner results remain concept_fixture_only evidence; they are not production command receipts, native Slint wiring, runtime certification, or product-readiness proof."
validation_surfaces:
  - "Plans/final_gui_interaction_contracts.schema.json and Plans/final_gui_interaction_contract_fixtures.json (directed three-scene order and exact-target progression revision required before current acceptance)"
  - "Plans/guided_tour_contracts.schema.json and Plans/guided_tour_contract_fixtures.json (current v2 three-scene story, exact-target progression, ten-action census, Teacher, focus, and terminal-disposition contract)"
  - Concepts/pm7-tools/guided_tour_source.py authored guards
  - future mounted-owner handler observation, focus, Skip restoration, completion disposition, and film review
risk_class: guided_tour_fake_state_or_story_loss
reasoning_tier: high
context_scope: guided_tour_directed_beginner_film_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/guided_tour_source.py
  - future native Slint Guided Tour overlay components
node_compile_hint: {mode: guided_tour_directed_beginner_film_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Planning_Wizard.md#PWIZ-023
  - Plans/assistant-chat-design.md#ACD-431
  - Concepts/pm7-tools/guided_tour_source.py
preserved_exact_tokens: [Usage, Planning Wizard, Assistant Chat, Teacher, Ask Teacher anything about Puppet Master…, ELI5, ELI5: Off, Reduced Motion, general.visual.reduce-animations, ui.guided_tour.toggle_eli5, programmatic-focus-landmark, Pause, Skip Tour, Back, Finish tour]
negative_constraints:
  - "Do not build a tooltip carousel, parallel demo application, or five-chapter tour."
  - "Do not clone live controls, fabricate success, or cancel owner work when a view closes."
  - "Do not use a provider, model, token budget, or protected AuthBrowserSession content for the deterministic lesson."
  - "Do not restore the superseded order that opens Assistant Chat first or bounces from Chat to Usage and back."
  - "Do not omit basic navigation or the panel/card move and resize demonstration; do not teach panel float/redock or card move, resize, configure, focus, hide, and reveal as separate verbose pages."
  - "Do not put the Reduced Motion introduction into Product Onboarding or a separate tour chapter; keep the explanation in the opening Usage/ELI5 moment and preference ownership in Settings."
  - "Do not restore `ui.guided_tour.toggle_reduced_motion`; ELI5 is the only tour-specific top-bar preference toggle."
  - "Do not expose the internal word `shell`, raw action identifiers, receipts, owners, routes, or developer jargon in visible tour copy."
  - "Do not auto-focus a tour action on scene entry or leave the Teacher-practice placeholder installed after Skip."
  - "Do not use left-edge accent rails, paint-only theme variants, target-covering callouts when a safe placement exists, or any black/empty transition frame."
  - "Do not offer a redundant restore-or-keep decision after the final Teacher reply; successful completion keeps Chat at the far right and Skip restores the captured start."
  - "Do not promote mounted browser-concept owner observations or concept effect receipts into production handler, persistence, native Slint, or certification claims."
owner_boundary_notes:
  - "Planning Wizard owns tour state and typed local actions; Settings owns `general.visual.reduce-animations`; Assistant Chat, Home/workspace-layout, Usage widget, page-navigation, and Planning owners retain performed action and state authority; Final GUI owns story, focus, overlay, copy presentation, and motion."
owner_hints: [Plans/FinalGUISpec.md, Plans/Planning_Wizard.md, Plans/assistant-chat-design.md]
```

### F3-522 - Operational Doctor K3 Workspace Presentation

```yaml
plan_unit_id: F3-522
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Doctor is an ongoing operational destination in the full K3 Settings workspace, not the compact post-onboarding
  card described by predecessor F3-411. It renders the Doctor owner's cached-first normalized projections as a calm
  health overview, lazy detail, bounded logs and receipts, scoped rechecks, truthful requested/effective state,
  freshness, confidence, applicability, and one owner-routed remediation path. Pending work acknowledges immediately;
  fresh-result replacement does not move the row. Theme and motion follow F3-519 and Reduced Motion, while stable IDs
  retain focus and accessible position across virtualization and narrow host states.
gui_related: true
gui_classification_reason: This unit owns Doctor's K3 workspace composition and truthful visible projection states.
split_recommended: false
depends_on: [F3-519, N2-152, N2-153]
unblocks: [F3-524]
acceptance_criteria:
  - "Normal entry is useful from cached projections offline or under partial failure and never starts broad probing."
  - "Summary, Details, Logs, and Receipt hydrate progressively and preserve explicit freshness/confidence and stale/unknown truth."
  - "A scoped check shows immediate pending state, retains focus, and cannot convert route success into remediation success."
  - "Requested and effective state remain distinct; disabled or unavailable controls explain the owner reason."
  - "Doctor never privately installs, authenticates, repairs, updates, moves storage, browses, restores, or performs source-control mutations."
validation_surfaces:
  - Plans/final_gui_interaction_contracts.schema.json
  - Plans/doctor_contracts.schema.json
  - future cached/offline, scoped-check, stale-return, remediation-return, accessibility, and eight-theme tests
risk_class: doctor_compact_false_green_or_private_repair
reasoning_tier: high
context_scope: doctor_k3_operational_workspace
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/settings_tome_source.py
  - Concepts/pm7-tools/systems_integration_source.py
  - future native Slint Doctor components
node_compile_hint: {mode: doctor_k3_presentation_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/newtools.md#N2-152
  - Plans/newtools.md#N2-153
  - Plans/Settings_System.md#SSYS-003
preserved_exact_tokens: [Check now, Details, Logs, Receipt, requested, effective, freshness, confidence]
negative_constraints:
  - "Do not restore compact-Doctor-only or post-onboarding-only presentation."
  - "Do not infer healthy from stale, unknown, interrupted, required-missing, or security-critical state."
  - "Do not let Doctor own probes, domain truth, or remediation mutations."
owner_boundary_notes:
  - "newtools Doctor owns descriptor/router/projection state; domain owners own truth and mutation; Final GUI owns presentation."
owner_hints: [Plans/FinalGUISpec.md, Plans/newtools.md, Plans/Settings_System.md]
```

### F3-523 - Global PMHoverTag Overlay And Accessibility

```yaml
plan_unit_id: F3-523
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  One shared PMHoverTag and HoverTagController renders theme-native hover/focus help in a shared overlay root for
  every actionable or focusable control, truncated value, technical identifier, status, badge, chart mark, disabled
  control, and dynamic state such as pin/unpin, unless a documented static-copy or decorative exemption applies.
  A one-line tag has at least 24 px height, 8 px horizontal padding, and compact 12 px text; detailed tags emphasize
  line one and use 11 px explanatory text. Tags are at most 280 px wide, keep an 8 px anchor gap and 8 px viewport margin,
  center above, flip below, and clamp to every edge. Persistent accessible descriptions bind immediately, while the
  visible tag waits for deliberate intent: at least 1600 ms of pointer residence and 1100 ms of stationary intent
  within a 5 px radius, or 1000 ms of continuous keyboard focus. Pointer movement beyond that radius, target movement,
  pointer press, scrolling, or departure before the thresholds resets or cancels the pending opening; pointer departure
  after opening uses a 160 ms grace period; Escape closes.
  Copy is concise, human, contextual, and consequence-first. It explains what the control does, its current state,
  shortcut, full value, consequence, or human disabled reason without falling back to raw command IDs, schema/route
  IDs, DOM labels, machine tokens, or developer jargon; dynamic pin/unpin and other changing states remain current.
  While Product Onboarding or Guided Tour is open, only anchors inside the active overlay may open tags. Pending or
  open tags outside it close, outside description nodes temporarily lose tooltip semantics and accessibility
  exposure, and their stable relationships restore when the overlay closes. Non-Retro entrance is the reference
  240 ms translate/scale/fade; Retro uses 140 ms stepped motion with no scale; Reduced Motion is immediate. Glass
  follows live transparency while maintaining readable contrast. Initial and live census work is frame-bounded,
  performs one startup pass, and ignores exact old/current attribute reassertions while retaining every real
  semantic change, so unrelated application reconciliation cannot create a perpetual tooltip invalidation loop or
  steal Onboarding or Guided Tour's animation budget.
gui_related: true
gui_classification_reason: This unit owns the global tooltip overlay's paint, geometry, timing, and accessible attachment.
split_recommended: false
depends_on: [F3-517, F3-519]
unblocks: [F3-524]
acceptance_criteria:
  - "One overlay controller positions all tags above/below with edge clamping, no clipping, and no layout shift."
  - "A pointer tag becomes visible only after at least 1600 ms of residence plus 1100 ms of stationary intent within a 5 px radius, and a keyboard-focus tag only after 1000 ms of continuous focus; persistent accessible descriptions and relationships remain available immediately rather than waiting for either visual dwell; movement, target relocation, pointer press, scrolling, departure, or focus change resets/cancels the pending open, opened pointer tags retain the 160 ms departure grace, and Escape closes immediately."
  - "Every required target has one stable hover key, accessible name, aria-describedby-equivalent relationship, and role=tooltip semantics; disabled controls remain reachable and explain their disabled reason."
  - "general.interaction.show-tooltips suppresses visual tags without removing accessible explanatory text."
  - "User-facing native title-only behavior is absent; tests use stable IDs/data attributes rather than title text."
  - "Every tag uses human, contextual effect/state/shortcut/value/consequence language; raw command, action, schema, route, DOM, or machine identifiers never become generic visible fallback copy, while a genuinely useful technical value may appear as clearly explained secondary detail."
  - "Dynamic text, shortcut, full-value, state, consequence, and disabled reason remain current after pin/unpin, availability, truncation, theme, transparency, and Settings changes."
  - "When Product Onboarding or Guided Tour is open, outside anchors cannot open or retain a tag, outside descriptions are temporarily removed from tooltip/accessibility semantics, and both bindings and semantics restore when the active overlay closes; tags inside the active overlay remain available."
  - "One bounded startup pass and incremental live binding preserve same-frame pointer/focus acknowledgement; exact old/current attribute reassertions schedule no tag work, while real attribute, character-data, insertion, removal, and subtree changes remain observable and auditable."
  - "A generated census fails on missing bindings, undocumented exemptions, duplicate keys, stale text, clipping, inaccessible disabled controls, or native-title-only behavior."
validation_surfaces:
  - "Plans/final_gui_interaction_contracts.schema.json and Plans/final_gui_interaction_contract_fixtures.json (separate 1600 ms pointer-residence, 1100 ms stationary-intent, 5 px radius, 1000 ms visual-focus dwell, immediate accessible-description binding, and 160 ms departure-grace fields are required for current acceptance)"
  - Concepts/pm7-tools/global_hover_tags_source.py authored guards
  - future hover census, pointer/keyboard/Escape/grace/collision/zoom/theme/transparency/reduced-motion tests
risk_class: hover_overlay_accessibility_or_census_drift
reasoning_tier: high
context_scope: global_pm_hover_tag
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/global_hover_tags_source.py
  - future native Slint PMHoverTag and HoverTagController components
node_compile_hint: {mode: global_hover_tag_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/chat-assistant-concepts/5.6 Pro/PM_Chat_Assistant_5.6_Pro_Standalone.html
  - Concepts/pm7-tools/global_hover_tags_source.py
preserved_exact_tokens: [PMHoverTag, HoverTagController, 24px, 8px, 12px, 11px, 280px, 1600 ms, 1100 ms, 5 px, 1000 ms, 160 ms, 240 ms, 140 ms, role=tooltip, aria-describedby, general.interaction.show-tooltips, attributeOldValue]
negative_constraints:
  - "Do not invent domain commands for opening, closing, or repositioning a hover tag; these are typed local UI actions."
  - "Do not remove accessible explanatory text when visual tooltips are disabled."
  - "Do not use native title as the only user-facing help or as a test selector."
  - "Do not attach tags to static body copy or purely decorative elements by default."
  - "Do not expose raw command/action/schema/route/DOM identifiers, machine tokens, or developer jargon as fallback hover copy."
  - "Do not let an underlying application tag compete with or leak through active Product Onboarding or Guided Tour."
  - "Do not rescan or rewrite a tag for an exact old/current attribute no-op, and do not spend an unbounded startup/live batch on census work."
owner_boundary_notes:
  - "Final GUI owns overlay presentation, dwell timers, overlay isolation, and human fallback grammar; target owners supply truthful effect, state, shortcut, value, consequence, and disabled-reason data."
owner_hints: [Plans/FinalGUISpec.md, Plans/UI_Wiring_Rules.md]
```

### F3-524 - Model-Backed Slint Portability And Evidence Separation

```yaml
plan_unit_id: F3-524
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings, Doctor, Product Onboarding, Guided Tour, and PMHoverTag target Rust stable plus Slint 1.17.1. Settings binds
  the owner inventory and manager projections through stable typed models and variable-height virtualization; Doctor
  binds stable normalized finding IDs; Onboarding and Tour bind their owner state machines; PMHoverTag binds typed
  anchor geometry, timers, hover/focus state, accessible description identity, and theme tokens. Essential behavior
  uses native properties, models, transforms, opacity, scale, clipping/masking, vector shapes, bounded timelines, and
  precomputed tokens/assets. PMConcept7 HTML/JavaScript/localStorage, DOM selectors, CSS viewport logic, browser
  physics, Canvas/WebGL, arbitrary backdrop blur, and heavy SVG filters are concept translation inputs only. Static,
  schema, browser, visual, motion, accessibility, performance, native runtime, and certification evidence remain
  separately classified.
gui_related: true
gui_classification_reason: This unit governs native GUI portability and truthful evidence classification for all reconciled surfaces.
split_recommended: false
depends_on: [F3-519, F3-520, F3-521, F3-522, F3-523, SSYS-005, SSYS-016, TCME-007]
unblocks: []
acceptance_criteria:
  - "The complete Settings inventory remains model-backed and variable-height virtualized with stable IDs, anchor preservation, overscan, and no eager manager hydration."
  - "Concept and browser runs are labeled concept_fixture_only or browser evidence and never promoted to native Slint certification."
  - "Responsive/browser review covers widths 320, 520, 680, 720, 750, 760, 860, 900, 960, 975, 980, 1180, 1200, 1280, 1440, 1700, 2200, and 2500 across all eight themes and full/Reduced Motion."
  - "Motion evidence reports actual delivered frame pacing and dropped/delayed frames without resampling or claiming native 60 FPS."
  - "Every delivered full-resolution campaign frame receives the TCME-007 review coverage, high-risk spans receive two independent reviews, unresolved defects require repair and replacement capture, and approval-gated evidence is retained until explicit user cleanup approval."
  - "Native Slint claims require a fresh Slint 1.17.1 build/run plus platform, accessibility, visual, motion, performance, and wiring evidence for the claimed slice."
  - "Browser-only capabilities have an explicit native counterpart or named residual risk; no hidden DOM dependency is admitted."
validation_surfaces:
  - Plans/final_gui_interaction_contracts.schema.json
  - Plans/final_gui_interaction_contract_fixtures.json
  - Plans/Test_Capture_and_Motion_Evidence.md#TCME-007
  - Concepts/pm7-tools/verify/final_evidence_gate.py
  - python3 scripts/pm-plans-verify.py run-gates
  - future native Slint build/runtime and independent actual-pixel/frame review
risk_class: browser_concept_promoted_to_native_certification
reasoning_tier: high
context_scope: reconciled_gui_portability_and_evidence
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Concepts/pm7-tools/build_pm7.py
  - future native Slint components
node_compile_hint: {mode: final_gui_portability_evidence_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Settings_System.md#SSYS-005
  - Plans/Settings_System.md#SSYS-016
  - Plans/Planning_Wizard.md#PWIZ-022
preserved_exact_tokens: [Rust stable, Slint 1.17.1, variable-height virtualization, stable IDs, concept_fixture_only, Reduced Motion, 60 FPS]
negative_constraints:
  - "Do not call generated HTML, schema success, Playwright, Chrome, or Codex app browser evidence native Slint proof."
  - "Do not hand-port localStorage, DOM ownership, CSS viewport queries, or browser-only animation architecture into production."
  - "Do not imply 60 FPS by resampling or by reporting a capture target instead of delivered frames."
  - "Do not claim portability, readiness, or certification from this PlanUnit alone."
owner_boundary_notes:
  - "Final GUI owns native presentation architecture; system owners retain models and behavior; Automated Testing owns evidence execution and disposition."
owner_hints: [Plans/FinalGUISpec.md, Plans/Settings_System.md, Plans/Automated_Testing_System.md]
```

### F3-525 - K3 Plugins Owner Projection And Theme-Native Action States

```yaml
plan_unit_id: F3-525
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Plugins consumer lives inside K3 Toolchain and Extensions without changing the 250 px rail, 62 px topbar,
  split-manager roster/detail geometry, document/index/detail continuity, or responsive host behavior. Its detail uses
  calm progressive tabs for overview, update review, access/runtime bounds, and integrity/evidence. Compact cards show
  Plugins System owner facts rather than a copied runtime reducer. Every exact cmd.agent_plugin.* action is focusable,
  PMHoverTag-described, theme-native across Basic, Friendly, Glass, and Retro light/dark, and visibly
  handler_unavailable until a native owner handler exists. Invoking an unavailable action opens one truthful bounded
  explanation without changing plugin fixture state, fabricating success, issuing a production receipt, or emitting an
  EventRecord. The Doctor projects eight separate Plugins System findings and returns to the exact Plugins tab/detail.
gui_related: true
gui_classification_reason: This unit owns the K3 Plugins presentation, progressive disclosure, disabled controls, hover help, theme paint, responsive behavior, and Doctor-to-Plugins focus route.
split_recommended: false
depends_on: [F3-519, F3-522, F3-523, F3-524, SSYS-024, N2-154, PLUG-070]
unblocks: []
acceptance_criteria:
  - K3 geometry remains within the frozen manifest; only plugin detail content, owner-action chrome, theme paint, hover overlay, and named mild chrome adaptations differ.
  - Overview separates package/plugin identities, three generations, manifest lane, required/optional component state, adapter round trips, conformance, and freshness.
  - Update, Access, and Integrity tabs progressively disclose complete diff/reapproval/rollback, permissions/containment/runtime bounds, and supply-chain/bounded-evidence facts without a dense configuration wall.
  - The exact twelve command controls expose handler_unavailable, a human disabled reason, typed PluginCommandResult, receipt-only/no-EventRecord policy, stable accessible name, and PMHoverTag consequence text.
  - Legacy generic Add/Edit/Test/More, Permissions, Discover, and Remove paths fail closed for plugins and cannot mutate the concept fixture.
  - Pointer, keyboard, narrow widths, all eight themes, full/Reduced Motion, hover/focus help, Doctor routing, and no-state-change assertions pass in the browser concept; results remain non-native evidence.
  - The consolidated final film includes the Plugins owner projection, all four progressive detail tabs, one truthful handler-unavailable command path, and an exact Doctor-to-Plugins return route without promoting the recording to native or runtime proof.
validation_surfaces:
  - Plans/final_gui_interaction_contracts.schema.json
  - Plans/plugin_contracts.schema.json
  - Plans/plugin_contract_fixtures.json
  - Concepts/pm7-tools/verify/plugin_projection_matrix.mjs
  - Concepts/pm7-tools/verify/hover_tags.mjs
  - Concepts/pm7-tools/verify/accessibility_visual_matrix.mjs
  - Concepts/pm7-tools/verify/final_campaign_capture.mjs
  - future native Slint Plugins manager visual/accessibility/runtime tests
risk_class: plugin_manager_geometry_drift_or_false_owner_success
reasoning_tier: high
context_scope: pmconcept7_k3_plugins_projection
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/Plugins_System.md
  - Plans/newtools.md
  - Concepts/pm7-tools/systems_integration_source.py
  - Concepts/pm7-tools/verify/plugin_projection_matrix.mjs
  - Concepts/pm7-tools/verify/final_campaign_capture.mjs
  - future native Slint Plugins manager components
node_compile_hint: {mode: k3_plugins_owner_projection_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Plugins_System.md#PLUG-067
  - Plans/Plugins_System.md#PLUG-070
  - Plans/Settings_System.md#SSYS-024
  - Plans/newtools.md#N2-154
preserved_exact_tokens: [250 px, 62 px, plugin.json, pm-plugin.json, cmd.agent_plugin, handler_unavailable, PluginCommandResult, EventRecord, PMHoverTag, Basic, Friendly, Glass, Retro, Reduced Motion]
negative_constraints:
  - "Do not create a second Plugins System owner, package reducer, permission reducer, update engine, runtime manager, or Doctor repair path in the GUI."
  - "Do not replace K3 geometry with cards, a new sidebar, a full-page plugin surface, Back chrome, or breadcrumbs."
  - "Do not display simulated command success, mutate plugin fixture state, issue a production receipt, emit EventRecord, or claim native Slint/runtime proof."
  - "Do not expose raw package bytes, secret bytes, protected-auth content, sensitive paths, or unbounded logs."
owner_boundary_notes:
  - "Plugins System owns package/runtime truth, commands, handlers, effects, and receipts; Settings consumes owner facts; Doctor consumes normalized findings; Final GUI owns presentation, themes, focus, hover, and motion."
owner_hints: [Plans/FinalGUISpec.md, Plans/Settings_System.md, Plans/Plugins_System.md, Plans/newtools.md]
```

### F3-526 - Operational Doctor Consumer Currentness And Evidence Closure

```yaml
plan_unit_id: F3-526
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The PMConcept7 Doctor consumer projects the one Doctor registry as an 18-domain, 20-finding cached workspace with
  stable finding identity, requested/effective truth, last-known result, freshness, confidence, owner/cache
  generations, recovery divergence, and one persistent ObservableWork-view identity. Its remediation partition is
  exactly fifteen owner-command routes, one typed owner route, and four unavailable routes with explicit disabled
  reasons. Eight typed local Doctor actions cover cached summary, bounded Details/Logs/Receipt, scoped refresh/check,
  diagnostic copy, and exact owner return without creating a Doctor mutation engine. Closing, hiding, or navigating
  away detaches only the viewer; reopening rejoins the same work identity. A route is never remediation success:
  replacement requires an exact fresh owner result matching check, finding revision, target, action/route,
  idempotency key, owner generation, cache generation, and return focus.
gui_related: true
gui_classification_reason: This unit closes the exact visible Doctor catalog, evidence disclosures, action states, detach/rejoin behavior, and owner-return presentation in PMConcept7.
split_recommended: false
depends_on: [F3-522, F3-525, N2-152, N2-153, N2-154]
unblocks: []
acceptance_criteria:
  - "The exact Doctor census is 18 domain identities and 20 finding rows, partitioned into 15 owner-command routes, one typed owner route, and four unavailable routes."
  - "The eight exact local actions are ui.doctor.open, ui.doctor.open_details, ui.doctor.open_logs, ui.doctor.open_receipt, ui.doctor.open_remediation, ui.doctor.refresh_visible, ui.doctor.run_check, and ui.doctor.copy_diagnostics."
  - "Details, Logs, and Receipt hydrate only after their exact local action, remain bounded and redacted, and carry finding revision plus owner/cache generation currentness."
  - "Project/Vault authority remains Unknown without the Project Sync and Backbone owner feed; required-missing, security-critical, stale, unknown, blocked, and interrupted state cannot paint healthy."
  - "Provider CLI remediation opens the exact Settings target and does not install, authenticate, select a profile, or mark readiness. Named Plan remediation binds exact project_id and named_plan_id."
  - "View detach never cancels owner work; re-entry rejoins one persistent work identity and stale or mismatched owner returns fail closed without moving the finding row."
  - "The authored transform self-check and browser matrix prove only deterministic browser-concept behavior; production/native runtime state stays unavailable and no production mutation, receipt, EventRecord, or Slint certification is claimed."
validation_surfaces:
  - Plans/doctor_contracts.schema.json
  - Plans/doctor_contract_fixtures.json
  - Concepts/pm7-tools/systems_integration_source.py
  - Concepts/pm7-tools/verify/systems_integration.mjs
  - Concepts/pm7-tools/verify/plugin_projection_matrix.mjs
  - future native Doctor owner-feed, ObservableWork detach/rejoin, stale-return, focus, accessibility, and Slint 1.17.1 tests
risk_class: doctor_false_green_private_repair_or_stale_owner_return
reasoning_tier: high
context_scope: pmconcept7_operational_doctor_consumer_closure
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/newtools.md
  - Plans/Settings_System.md
  - Concepts/pm7-tools/systems_integration_source.py
  - Concepts/pm7-tools/verify/systems_integration.mjs
  - future native Slint Doctor consumer components
node_compile_hint: {mode: operational_doctor_consumer_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/newtools.md#N2-152
  - Plans/newtools.md#N2-153
  - Plans/newtools.md#N2-154
  - PM_Onboarding_Doctor_Dependency_and_Work_Correction_2026-08-13/REFERENCE_REVIEW_AND_REPAIR_REQUIREMENTS.md
preserved_exact_tokens: [18, 20, 15, one typed owner route, four unavailable, ui.doctor.copy_diagnostics, ObservableWork, project_id, named_plan_id]
negative_constraints:
  - "Do not make Doctor an installer, authenticator, repair engine, updater, storage mover, browser owner, backup owner, source-control owner, or private runtime scheduler."
  - "Do not infer current readiness from route success, focus, cached paint, last-known result, or a stale/unknown owner projection."
  - "Do not cancel owner work when the Doctor viewer closes or mint a second work identity when it reopens."
  - "Do not promote the browser fixture, handler target strings, static schemas, or browser receipts into native/runtime/readiness proof."
owner_boundary_notes:
  - "newtools Doctor owns registry/router/normalization; domain owners own checks and remediation; Shared Integration Runtime owns ObservableWork; Final GUI owns this consumer presentation."
owner_hints: [Plans/FinalGUISpec.md, Plans/newtools.md, Plans/Shared_Integration_Runtime.md, Plans/Settings_System.md]
```

### F3-527 - Settled Panel Undock And Redock Event Identity

```yaml
plan_unit_id: F3-527
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  panel.undocked and panel.redocked are independent persisted semantic transitions owned by the shared panel shell,
  not aliases of workspace.layout_changed. panel.undocked occurs only after cmd.panel.undock has successfully moved
  one identified panel from its settled workspace host into one identified detached window and the owner state is
  durably committed. panel.redocked occurs only after cmd.panel.redock has successfully moved one identified
  detached panel window into its settled target workspace host and the owner state is durably committed. The same
  accepted command may also emit workspace.layout_changed only when it independently changes the settled workspace
  layout; a shared correlation and an explicit nullable event reference relate the two records without collapsing
  their identities. Preview movement, pickup, window creation/close attempts, dispatch acceptance, rejected or stale
  owner results, persistence failure, cancellation, no-change settlement, and rollback emit neither panel event.
gui_related: true
gui_classification_reason: This unit defines the durable semantics behind visible panel pop-out and redock actions while keeping all preview animation view-local.
split_recommended: false
depends_on: [F3-515, UCC-147, CV-215, SP-001]
unblocks: []
acceptance_criteria:
  - "panel.undocked validates only against pm.event.panel_undocked.v1 and requires cmd.panel.undock, panel/window/host identity, exact result and receipt references, monotonic layout revisions, settled-only truth, persistence truth, and the workspace-layout co-emission relationship."
  - "panel.redocked validates only against pm.event.panel_redocked.v1 and requires cmd.panel.redock, panel/window/target-host identity, exact result and receipt references, monotonic layout revisions, settled-only truth, persistence truth, and the workspace-layout co-emission relationship."
  - "workspace.layout_changed remains separately owned; it is co-emitted only where the same accepted transition also changes the settled workspace layout, and its event reference is required exactly when co-emission is true."
  - "Cancellation, no-op, stale/rejected result, failed persistence, rollback, preview, and command acceptance produce no panel EventRecord and do not advance a projector checkpoint."
  - "Static owner text and payload schemas do not authorize event append or dispatch; admission still requires the exact registry rows, storage binding, compatibility/retention/redaction rules, and executable positive/negative/replay/recovery fixtures."
validation_surfaces:
  - Plans/event_payloads/panel_undocked.schema.json
  - Plans/event_payloads/panel_redocked.schema.json
  - Plans/event_family_registry.json
  - Plans/storage-plan.md
  - future panel transition producer, append/dedupe/replay/recovery, and projector fixtures
risk_class: panel_transition_alias_or_duplicate_event_drift
reasoning_tier: high
context_scope: settled_panel_host_transition_event_identity
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/event_payloads/panel_undocked.schema.json
  - Plans/event_payloads/panel_redocked.schema.json
  - Plans/event_family_registry.json
  - Plans/storage-plan.md
node_compile_hint: {mode: panel_transition_event_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/UI_Command_Catalog.md:8087
  - Plans/UI_Command_Catalog.md:8088
  - Plans/Contracts_V0.md:3414
  - scratchpad/pm-integration-20260831/event-authority-successor-20260901/aggregate-adjudication/owner-adjudication/PRIMARY_OWNER_DECISIONS.json
preserved_exact_tokens: [panel.undocked, panel.redocked, workspace.layout_changed, cmd.panel.undock, cmd.panel.redock, settled_only, preview_state_included]
negative_constraints:
  - "Do not alias either panel event to workspace.layout_changed or infer either transition from layout persistence alone."
  - "Do not emit a panel event for preview motion, window attempts, command acceptance, failure, rejection, cancellation, rollback, or no-change settlement."
  - "Do not register a generic panel transition event with a subtype field."
  - "Do not claim native producer, persistence, replay, runtime, buildability, or PNC-019 proof from this static owner/schema materialization."
owner_boundary_notes:
  - "Final GUI owns panel-host transition semantics and presentation; Contracts owns EventRecord; storage owns admission, append, retention, dedupe, replay, and checkpoint rules."
owner_hints: [Plans/FinalGUISpec.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/UI_Command_Catalog.md]
```
