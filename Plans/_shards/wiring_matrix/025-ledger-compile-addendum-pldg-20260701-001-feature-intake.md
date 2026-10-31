# Shard 025: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Wiring_Matrix.md`

Source lines: L3496-L4076

Source SHA256: `ff3936f909754a73f034d56e0ca32b0943c90c93ec9f88382be9667121d3103c`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum preserves the first-run/provider-command proposal from bootstrap ledger `pldg-20260701-001-feature-intake` as source lineage and reconciles WM-041 to the current Product Onboarding and Guided Tour owner contracts. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, wiring JSON, generated governance artifacts, or a governance seal.

### WM-041 - Product Onboarding And Guided Tour Typed Local Action And Owner-Route Wiring

```yaml
plan_unit_id: WM-041
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Current Product Onboarding wiring consumes PWIZ-021''s owner-defined main_stage_order, connect_existing_stage_order,
  and deferred_project_stage_order. The eleven-stage main path commits the Project before paid-provider setup and then
  Free Models; the six-stage connect-existing shortcut and explicit Project Later path do not fabricate a Project or
  run its provider phases. These graphs bind exactly fourteen typed local actions: `ui.onboarding.start`, `ui.onboarding.next`,
  `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`, `ui.onboarding.defer`, `ui.onboarding.open_details`,
  `ui.onboarding.more_ways`, `ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`, `ui.onboarding.run_automatic_preparation`,
  `ui.onboarding.choose_first_project`, `ui.onboarding.finish`, and `ui.onboarding.choose_look`. These actions transition
  or project local Product Onboarding state; they are not UICommands and receive no command-catalog row, semantic command
  handler, generic Onboarding mutation handler, or EventRecord. They use the closed pm.product_onboarding.action_request.v2
  -> pm.product_onboarding.action_result.v2 local contract. Every request has required closed, normalized, secret-free
  local_context fields; arbitrary/raw payload fields, additional keys, and secret-bearing values are rejected. Exact
  intent/scope/choice/branch combinations distinguish setup/project disclosure from branch-local more_ways updates and
  whole-session Skip from Project/Remote-Access optional-scope Skip. `ui.onboarding.start` opens a first_run window in
  a Basic Dark preview, with Basic Dark preselected, and a settings_rerun window in the look on screen; `ui.onboarding.choose_look`
  previews the five-family look choice (Q22), the header''s Look menu and the NieR Mode editor panel through a closed
  look_choice. Neither dispatches `cmd.theme.*` or a Settings transaction; the look is written with the Project at commit
  (F3-520, DL-153). When a selected branch needs owner work, its local draft queues the typed owner route and intent.
  The only precommit dispatch is owner-authorized read-only preflight or authentication necessary for the selected source,
  with exact current owner request validation, permission, consent, draft/session revision, hash, expiry and return context.
  MACS-005 supports first-time source sign-in without phantom Project/account/repository identities; it is not broad
  provider setup. Every other owner mutation waits for current Review and PJCT-007''s exact Project-owned setup-commit
  binding. That confirmation binds `path_kind`, `queued_setup_plan_ref`, `queued_setup_plan_revision`, `reviewed_setup_plan_revision`,
  `review_confirmation=person_confirmed_reviewed_plan`, `approved_setup_plan_sha256`, revision, and continuation generation
  plus the bounded draft and actual commit binding; a matching `automatic_preparation_currentness_ref` admits the Project
  owner''s existing command and sole commit chain once. Settings copy uses SSYS-036''s precommit preview and postcommit
  rebind/apply. Paid-provider setup then Free Models use the actual Project result; explicit paid Skip still offers Free
  Models. Current owner ObservableWork/results/receipts reverse-project through the exact reviewed revision and plan
  hash; terminal success may advance without a second confirmation, while stale, mismatched, blocked, failed, cancelled,
  or recovery-required results dispatch nothing new and cannot replace the last accepted projection. Session/continuation
  wiring preserves independent `scm_backend_selection` for local Git/Jujutsu Safe History and `forge_provider_selection`
  for an optional online copy. Legacy migration supplies exact `mapped_stage_counts` and `mapped_path_counts`, maps unresolved
  work to unconfirmed Review, and never replays owner work. Guided Tour wiring consumes PWIZ-023''s three chapters in
  exact `chat_teacher -> workspace -> planning_wizard` order over the real mounted application. Its exact eleven typed
  local actions are `ui.guided_tour.start`, `ui.guided_tour.next`, `ui.guided_tour.back`, `ui.guided_tour.pause`, `ui.guided_tour.resume`,
  `ui.guided_tour.skip`, `ui.guided_tour.focus_route`, `ui.guided_tour.toggle_eli5`, `ui.guided_tour.finish`, and `ui.guided_tour.replay`,
  and `ui.guided_tour.show_me`; they are not UICommands, owner mutations, EventRecords, or a new persistence authority.
  The Tour bar''s Look menu and sound control are not `ui.guided_tour.*` actions: a five-family Look choice (Q22), every
  live NieR Mode editor edit and the sound control''s write of `general.interaction.sound-effects` compose `cmd.settings.transaction.preview`
  then `cmd.settings.transaction.apply`, and Adjust NieR is `ui.settings.nier_editor.open` (DL-153). Chat opens first
  and uses the existing Persona/Chat commands for Teacher selection, the supplied local question, a streamed same-conversation
  answer, and that same answer in simple words as one extra, simpler reply from Explain this reply simply (`cmd.chat.eli5.explain_reply`),
  the original reply unchanged (DL-126). Workspace practice routes actual panel and widget actions through their existing
  owners. Amended 2026-10-09 (DL-180): the chat is a fixed column that moves only by popping out, so the practice that
  asked the learner to move or dock the chat is retired; the workspace chapter teaches opening a tab from the "+" menu
  (`cmd.panel_tab.open`), opening a file from the rail into a panel (`cmd.file.open`), splitting by dragging a tab to
  a panel edge (`cmd.panel_tab.move` with a split; the tab menu''s Split right and Split down count too) and adding a
  widget to the dashboard tab (`cmd.widget.add` with its `board_id`), each checkpoint observed from the panels'' own
  committed results (PWIZ-035, WM-090). Amended 2026-10-10 (DL-186; P1 B, P10): the widget practice adds Upcoming resets
  to the Home dashboard and then moves or resizes it there, through `cmd.widget.add` and then `cmd.widget.move` or `cmd.widget.resize`
  naming the Home board in their existing `room` field (it read: `board_id`), finished only by the board''s accepted
  add and then move or resize (PWIZ-035); the old Home widgets are gone from Home. Planning receives about half of meaningful
  actions and dwell (amended 2026-10-17, DL-230: it read at least half), including a genuine answer edit and its affected
  consequence. Try it and Show Me share each exact mounted owner handler and observed success predicate; generic Next,
  narration, timers, or look-alike controls cannot fabricate a checkpoint. ELI5 stays beside Pause and Skip; that tour
  control, `ui.guided_tour.toggle_eli5`, changes the shared general.interaction.mode preference (the retired `tour_narration_only`
  predecessor, Plans/guided_tour_contracts.schema.json) and never rewrites the Teacher example answer. The same-answer
  ELI5 checkpoint depends on the admission of `cmd.chat.eli5.explain_reply`: until then its control renders disabled
  with `command_not_registered` (WM-064) and the checkpoint is never synthesized. Reduced Motion remains Settings-owned.
  Skip reverse-routes restoration of the captured layout, Chat state, composer placeholder, and focus. The captured layout
  is the v2 Home layout record (`pm.home_workspace_layout.v2`, SP-330): the tour captures it when it starts and restores
  it through one `cmd.workspace_layout.restore` commit from the production entry `tour.layout_restore`, its dashboard
  boards included (UCC-200, PWIZ-035; amended 2026-10-17, review r1, it read: through `cmd.workspace_layout.*` and `cmd.panel_tab.*`
  commits), putting every panel, tab and size back; terminal sessions and unsaved buffers of tabs the learner opened
  are never ended or dropped silently (amended 2026-10-09, DL-180). While any restore runs, the application''s own notices
  about it (a widget removed, a persona applied from the next turn) stay quiet in every look, and the Tour''s closing
  note says what was put back (F3-521, DL-153). Finish restores by default or keeps layout only after explicit selection
  through the existing finish action, removes practice content, and lands on the real Planning Wizard with the committed
  Project selected and no work auto-started. Close/reload requires a safe owner- revalidated checkpoint; absent original
  state or stale observations never yield a newly invented snapshot: what of the original basis still resolves is restored,
  then a fresh session starts with a plain notice, and only a restoration failure exposes recovery. Run Onboarding Again
  resets the tour completely through its normal restoration, and Settings reaches resume and replay through the route-only
  `settings.guided_tour.resume` and `settings.guided_tour.replay`. These are static wiring obligations, not proof of
  a durable adapter, native handler, recovery, or runtime acceptance. The eleven predecessor `cmd.onboarding.*` spellings
  listed below and their provider-first/Free-Models CTA choreography remain searchable source lineage only; none is a
  production wiring row or compatibility alias. The separate packet candidates cmd.onboarding.back, cmd.onboarding.cancel,
  cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume,
  and cmd.onboarding.skip are source-lineage candidate tokens only and are rejected as commands, aliases, and handlers
  because typed local ui.onboarding.* actions own those semantics. This PlanUnit records wiring obligations only and
  does not generate wiring JSON. Amended Q22, Jared 2026-10-30 (DL-257): the fifth NieR family supersedes independent-override
  wording; SSYS-043 owns migration and retained Adjust controls. Q22 visible copy is Adjust NieR, or Adjust NieR… in
  the title-bar menu (foundations source confirmation 1030182542-5544). QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18:
  Q6/Q7: point to the actual backup before asking to unlock it. A Recovery Kit is an untrusted locator plus protected
  recovery credential, not a storage place, backup payload, NAS password or cloud sign-in. Offer the Kit first, then
  the explicit no-Kit path to a folder, another device/NAS, or a cloud service. Continue waits for the selected file/folder/device/account
  and required fields. Validate the locator/trust and reach/authenticate the selected place through its existing owner.
  An accepted Kit may unlock that backup, but cannot bypass storage authentication. Show Unlock the backup only for a
  still-locked backup without an accepted unlock; name its selected place. Select a copy, coverage and preview only afterwards.
  Repointing invalidates the former unlock and snapshot selection. Owner recovery prerequisites, approval, protected
  secret handling and actual restore/Project commit boundaries remain mandatory; only a verified Backup owner result
  proves unlock or restore. H5: the onboarding owner holds one original inert-state basis for the entire open lifetime.
  Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots nodes already
  held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds, preserves
  pre-existing inert nodes and restores focus/input. Q1/Q2: onboarding sound defaults on under general.interaction.sound-effects,
  through the existing one player and trusted-gesture gate. Until the Settings owner supplies the applicable sound preference,
  retain the factory-on or current effective choice rather than muting on every refresh. An explicit readable Project
  value wins when it binds; a genuinely refused bound write remains refused. An unavailable Settings projection never
  fabricates a saved value or authorizes a write. DL-259, Jared 2026-10-31: ELI5: the wizard bar and Guided Tour bar
  expose the same global general.interaction.mode through the Settings owner, with values ELI5 and Expert, labels Plain
  English and Expert, and default ELI5. Both bars reflect the same effective state. Every opened onboarding question
  tip and prose help section has useful Plain English and technical versions, including FileSafe, service differences,
  storage, remote access and AI/auth choices, assuming no coding experience. Screen copy, control labels, exact fingerprints,
  paths and receipt data stay single; dual copy is limited to tips/help (DL-126). A mode change updates an open tip without
  rewriting a chat reply. Existing cmd.settings.transaction.preview/apply owns the preference; ui.guided_tour.toggle_eli5
  is a compatibility local adapter to that shared preference, not a tour-only setting or chat ELI5 command. The predecessor
  tour_narration_only tag is retired. D3 A: generated proxy settings support Caddy, NGINX and Traefik, with Caddy the
  default. Nginx Proxy Manager is existing-only: it can be selected as an existing proxy but never sent to a generation/install/export
  operation. New-Server managed setup, export-only and existing-proxy validation are separate owner continuations; generating
  a file does not prove installation, public consent, DNS/TLS, endpoint identity or live-route success. For generation,
  onboarding proxy_kind is exactly caddy, nginx or traefik and maps to reverse_proxy_configuration.proxy_family. The
  existing-proxy branch may record nginx_proxy_manager but never emits a generated-configuration record; neither branch
  silently substitutes a family. D6 A: the human signs in on the initiating active device while the AI/tool runs on the
  selected execution host. Official tool sign-ins and private account roots stay with that tool on that host; direct
  API keys are held by Puppet Master’s secure credential store on that host. Onboarding, Settings, model selection and
  Usage share stable account/profile/host/environment references, never provider-name booleans or copied secrets. Protected
  returns are bound to the exact operation, initiating Client/session/generation and execution host. Changing account,
  host or route invalidates stale validation; another account of the same provider has a distinct identity. D7 B supersedes
  the former no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and Linux have their own built-in
  Tailscale connection and sign in once through the shared protected auth owner, with no separate Tailscale app install.
  The same signed PM-owned Go tsnet helper is supervised by its owning PM process. A Server keeps one active node per
  stable server_id; a native Client installation keeps one active node per stable client_id, independent of Projects,
  windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration, process, IPC, authorization,
  egress and secure-state references prevent identity/key sharing or duplicate active nodes. Native Client nodes provide
  bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying or a Server public listener. Server
  nodes retain the automatic private listener; Funnel remains Server-only, explicit, off by default and unavailable on
  Headscale. Human approval and reusable connection identity do not grant PM pairing/trust or work permission. A plain
  browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint reachable through the
  device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed host Tailscale
  stays external and unmanaged. DL-259 srv final, 2026-10-31: Creating observes only the reviewed Project creation/open/restore
  result and its actual prerequisites. It does not run optional remote-access configuration. After that owner settlement,
  a separate postcommit remote-setup view inside automatic_preparation runs any requested Remote Access continuation,
  before the normal provider/Free Models continuation; the eleven-stage graph is unchanged. Tailscale/Headscale authorization,
  new Remote Link output, and managed/export/existing proxy steps use their existing domain owners, approvals and truthful
  results. Later always finishes onboarding and leaves the committed Project intact: it does not wait for optional setup,
  certify it, undo owner effects or invent readiness. Unstarted setup is deferred; any already-started work obeys the
  owner’s existing cancel/background rules, and the app shows its actual result or pending state. Existing whole-session
  ui.onboarding.skip/close semantics supply this exit without a new mutation command. DL-259 srv final, 2026-10-31: what
  the person actually set up is what the app shows. Enter/finish binds the shell, Settings and status views to the stable
  Client, Server, Execution Host, route and Project identities supplied by current owner results and registries, with
  their actual readiness/deferred state. Display names never become IDs, and the reviewed setup plan is intent rather
  than effective state. Onboarding creates no second account/server/Project registry or durable handoff writer; its initial
  context is a non-authoritative join of existing owner receipts/projections, followed by their normal updates. No concept-global
  object, event or store key is a product contract. DL-259 owner answers, Jared 2026-10-31: CERT-1 removes PM certificate
  administration and every certificate-selection/validation gate; configuration generation and actual PM route checks
  report only their own result, never certificate validity. CLOUD-1 uses the protected console one-time-code handoff;
  DESKTOP-RESTORE-1 uses protected native local handoff with no code to type. Both consume Server-owned initial claim
  authorization through the existing exact claim tuple before separate bootstrap/full restore. REMOTE-CODE-1 is an accepted
  pre-build protocol check alongside D4; no code grammar, new resolver command or wizard caveat is invented. Existing
  public-exposure consent and truthful reachability/identity/pairing checks remain.'
gui_related: true
gui_classification_reason: Defines owner-referenced Product Onboarding phase graphs and three-scene Guided Tour actions, transitions, reverse wiring, and owner-routed GUI behavior.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023, F3-520, ACD-484, DL-180, DL-186, PWIZ-035, SP-330, WM-090]
unblocks: []
acceptance_criteria:
- Main, connect-existing and Project Later consume the three exact PWIZ-021 stage-order definitions; wiring does not
  re-own their roster. Provider/Free Models phases require a real committed Project and never appear in connect-existing
  or Project Later as fake completed work.
- Back consumes the exact durable path history: connect-existing `remote_access_setup` returns to `simple_path`, while
    main-path `remote_access_setup` returns to `server_storage_client`; no skipped shortcut stage is synthesized into
    reverse wiring.
- The exact current action set contains the fourteen named `ui.onboarding.*` IDs; every authored control emits one typed
  local action and no action is registered as a UICommand, domain event, or production wiring row. `simple_path` and
  `ui.onboarding.choose_simple_path` are current visible behavior.
- '`ui.onboarding.start` paints a Basic Dark preview for first_run (Basic Dark preselected, with NieR available as the
  fifth family (Q22)) and keeps the look on screen for settings_rerun; `ui.onboarding.choose_look` previews the five-family
  look, including NieR (Q22), the Look menu and the editor panel with no owner route, `cmd.theme.*` or Settings transaction,
  the look being written with the Project at commit (DL-153).'
- Requests and results validate against the closed action schema; applied, disabled, and rejected are distinct, and disabled/rejected
  results dispatch no owner work, write no session/continuation, carry no production receipt, and expose exact reasons.
- Every request consumes the exact closed v2 local_context definition, including phase-specific owner-command/preflight/commit
  proof. The schema owns its required/null/gated fields; missing gated proof, an additional/arbitrary/raw field, or secret-bearing
  context fails closed.
- more_ways uses toggle_setup_options plus setup_options/project_options and a matching choice for stage disclosure,
  or update_branch_state plus non-null canonical branch_kind and choice=null for branch-local updates; the variants cannot
  normalize into each other.
- Skip uses skip_product_onboarding/product_onboarding/choice=null with session_skipped and skipped status, or skip_optional_scope
  with matching Project/Remote-Access choice/scope/branch and optional_scope_skipped while the session remains active.
- Defer durably writes exact path/stage/setup-mode/local-backend/forge/queued-plan/review/branch/history/revision/continuation/initiating-Client/focus-return
  state before dismissal; Close is non-completing; Skip records an explicit skipped session; Details is ephemeral, same-stage,
  non-persistent, and has no owner command.
- Every inline SVG `?` choice-help control reuses `ui.onboarding.open_details` with `intent=toggle_choice_explanation`,
  exact current-stage scope, a stable help-topic `selection_ref`, and exact expanded state; it is same-stage, non-persistent,
  keyboard reachable, accessibility-linked, and owner-route-free.
- Before exact Project commit, selections are bounded draft writes or observations; only owner-authorized read-only preflight
  and selected-source authentication may dispatch. Both require a valid actual owner request and current authorization
  join, not a local ref/availability claim. Project/repository/filesystem mutation and broad provider setup remain forbidden.
- Close/resume preserves the actual Project binding and exact provider/free-model phase. Back does not cross into an
  uncreated draft or replay commit, completed auth, copied Settings, or settled provider work. Local action results never
  claim a production receipt.
- Person confirmation requires matching `path_kind`, `queued_setup_plan_ref`, queued/reviewed revision, exact approved-plan
  SHA-256, session revision, and continuation generation. Automatic Preparation additionally requires the matching currentness
  ref; stale, unconfirmed, expanded, revision-mismatched, hash-mismatched, path-mismatched, or currentness-mismatched
  plans dispatch nothing.
- Owner work uses the selected owner's existing canonical command and sole handler; each unchanged reviewed operation
  dispatches at most once, current terminal owner results reverse-project through ObservableWork/receipt refs, and retry/reload/resume
  observes the existing dedupe identity instead of launching a duplicate.
- Confirmed intents route only to existing Project, Git/Jujutsu/forge, Server/Storage/Client, Remote Access, backup/restore,
  provider, authentication, Settings, widget, layout, Planning, or Assistant Chat owners as applicable; Wiring Matrix
  creates no parallel owner or generic mutation handler.
- A new local Project routes through `cmd.project.new_local {init_git:true}`; `cmd.source_control.repository.init` has
  no request, alias, handler, or visible route.
- Safe History backend selection (`git|jujutsu|null`) is local and independent from optional forge selection (`github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|cursor_origin|none|null`).
  Git and Jujutsu have no service accounts; account connection/sign-in or verified official signup-page handoff, repository
  list/create, backend-appropriate clone/publish, and Project registration follow their existing owners and exact terminal
  results.
- First Project, Source Control, Server/Storage/Client, and Remote Access remain distinct progressive stages and owner
  routes; protected AuthBrowserSession content and credentials never enter Onboarding state, transport, or evidence.
- Legacy provider-first/four-screen, predecessor-five-stage, and superseded seven-stage rows map once to the first unresolved
  current stage, force `review_confirmation=unconfirmed`, report exact `mapped_stage_counts` and `mapped_path_counts`,
  quarantine secret-bearing rows, and never replay owner work.
- Skip and Close preserve truthful incomplete state, and arrival at `ready` never marks skipped Server, provider, Project,
  restore, Doctor, or other owner work Ready.
- Guided Tour consumes the v3 owner schema's exact `chat_teacher`, `workspace`, `planning_wizard` order and eleven `ui.guided_tour.*`
  actions; local transport creates no command, owner handler, EventRecord, or parallel persistence owner.
- The `ui.guided_tour.focus_route` action changes only the mounted application's visible route and focus; it cannot satisfy
  an owner-observed performed checkpoint.
- Tour Next and Back follow valid story beats with exact scene-heading focus but cannot satisfy Teacher selection, composer
  send, same-answer ELI5 (the one extra, simpler reply from Explain this reply simply), panel/widget practice, Planning
  answer edit, or any other required observed checkpoint.
- Every important practice action offers Try it and Show Me through the same mounted owner handler and success predicate;
  stale, unrelated, narrated, or timer-only observations never advance the story.
- Chat opens first; `cmd.persona.select`, `cmd.chat.send`, `cmd.chat.eli5.set` (the quick dot, later replies only), and
  `cmd.chat.eli5.explain_reply` retain their sole Persona/Chat owners and gain exact tour consumers. The guided conversation
  is locally isolated, retains its identity across the chat's Pop out and Dock back (the chat never moves inside the
  window, DL-180), and shows the same answer for ELI5 only as one extra, simpler reply from Explain this reply simply;
  the original reply is never re-sent, regenerated or rewritten (DL-126).
- ? Workspace practice consumes existing panel, workspace-layout, and widget commands according to the chosen action.
    Its four actions (amended 2026-10-09, DL-180) are opening a tab from the "+" menu, opening a file from the rail into
    a panel, splitting by dragging a tab to a panel edge (or the tab menu's Split right or Split down) and adding a widget
    to the dashboard tab (amended 2026-10-10, DL-186
  : Upcoming resets added to the Home dashboard, then moved or resized there); no step asks the learner to move or dock
    the chat. Planning retains at least half of meaningful actions and dwell, accepts a genuine edited answer, changes
    only the dependent consequence, and leaves unsure choices unresolved.
- ELI5 is at the top beside Pause and Skip; `ui.guided_tour.toggle_eli5` changes the shared general.interaction.mode
  preference and never rewrites the Teacher example answer. The same-answer ELI5 checkpoint is never satisfied while
  `cmd.chat.eli5.explain_reply` is not admitted. Effective Reduced Motion is a Settings-owned projection/change route;
  Guided Tour has no Reduced Motion setting or action.
- While a Skip or Finish restore runs, the application's own notices about it stay quiet in every look, and the Tour's
  closing note says what was put back (F3-521, DL-153).
- 'The Tour bar''s Look menu and sound control are not `ui.guided_tour.*` actions: their writes compose `cmd.settings.transaction.preview`
  then `cmd.settings.transaction.apply`, Adjust NieR is `ui.settings.nier_editor.open`, and the Tour''s census stays
  its eleven actions (DL-153).'
- Skip and Finish restore the captured v2 Home layout record (`pm.home_workspace_layout.v2`) through one `cmd.workspace_layout.restore`
  commit (`tour.layout_restore`; amended 2026-10-17, review r1, replacing the `cmd.workspace_layout.*` and `cmd.panel_tab.*`
  commits), and the restore stays quiet (DL-153) (amended 2026-10-09, DL-180).
- Skip restores captured layout, Chat state, placeholder, and focus through existing owners; Finish restores by default
  or keeps layout only on explicit selection through `ui.guided_tour.finish`, then removes practice content and focuses
  the real Planning Wizard with the committed Project and no auto-started work. No `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`,
  or generic owner mutation is introduced.
- Close/reload revalidates the last safe checkpoint and original restoration references against current owners before
  resume; missing or stale state restores what still resolves and starts a fresh session with a notice, failed restoration
  exposes recovery, and neither reports completion or captures the temporary arrangement as the original.
- Run Onboarding Again discards the tour checkpoint, snapshot ref, resume affordance, and any restoration-pending notice;
  Settings Resume Guided Tour (`settings.guided_tour.resume`) is disabled unless a checkpoint can resume.
- Retired five-chapter ordering and `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, and `ui.guided_tour.toggle_reduced_motion`
  have no current Tour control, request, alias, handler, or production row; similarly named canonical layout or Settings
  commands remain available to unrelated non-Tour consumers under their existing owners.
- Disabled/rejected Tour actions change no scene or owner state. Stale owner observations, missing exact mounted targets,
  restoration failure, layout failure, or deterministic-reply failure pause or fail closed with a named recovery reason
  and never synthesize completion.
- The eleven listed `cmd.onboarding.*` spellings remain source-lineage-only and appear as neither production wiring rows
  nor compatibility aliases.
- The eight packet candidate `cmd.onboarding.*` tokens remain source-lineage-only and are rejected as commands, aliases,
  handlers, and production rows.
- The provider-first, paid-provider-before-Free-Models, direct limited-Planning-Wizard, and Teacher-copy proposal is
  predecessor lineage rather than current stage, route, or command authority.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q6/Q7: point to the actual backup before asking to unlock it.
  A Recovery Kit is an untrusted locator plus protected recovery credential, not a storage place, backup payload, NAS
  password or cloud sign-in. Offer the Kit first, then the explicit no-Kit path to a folder, another device/NAS, or a
  cloud service. Continue waits for the selected file/folder/device/account and required fields. Validate the locator/trust
  and reach/authenticate the selected place through its existing owner. An accepted Kit may unlock that backup, but cannot
  bypass storage authentication. Show Unlock the backup only for a still-locked backup without an accepted unlock; name
  its selected place. Select a copy, coverage and preview only afterwards. Repointing invalidates the former unlock and
  snapshot selection. Owner recovery prerequisites, approval, protected secret handling and actual restore/Project commit
  boundaries remain mandatory; only a verified Backup owner result proves unlock or restore. H5: the onboarding owner
  holds one original inert-state basis for the entire open lifetime. Replacing an already-open screen acquires only newly
  encountered background nodes; it never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip
  path removes only the modal’s own holds, preserves pre-existing inert nodes and restores focus/input. Q1/Q2: onboarding
  sound defaults on under general.interaction.sound-effects, through the existing one player and trusted-gesture gate.
  Until the Settings owner supplies the applicable sound preference, retain the factory-on or current effective choice
  rather than muting on every refresh. An explicit readable Project value wins when it binds; a genuinely refused bound
  write remains refused. An unavailable Settings projection never fabricates a saved value or authorizes a write.'
- 'DL-259, Jared 2026-10-31: ELI5: the wizard bar and Guided Tour bar expose the same global general.interaction.mode
  through the Settings owner, with values ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars
  reflect the same effective state. Every opened onboarding question tip and prose help section has useful Plain English
  and technical versions, including FileSafe, service differences, storage, remote access and AI/auth choices, assuming
  no coding experience. Screen copy, control labels, exact fingerprints, paths and receipt data stay single; dual copy
  is limited to tips/help (DL-126). A mode change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply
  owns the preference; ui.guided_tour.toggle_eli5 is a compatibility local adapter to that shared preference, not a tour-only
  setting or chat ELI5 command. The predecessor tour_narration_only tag is retired. D3 A: generated proxy settings support
  Caddy, NGINX and Traefik, with Caddy the default. Nginx Proxy Manager is existing-only: it can be selected as an existing
  proxy but never sent to a generation/install/export operation. New-Server managed setup, export-only and existing-proxy
  validation are separate owner continuations; generating a file does not prove installation, public consent, DNS/TLS,
  endpoint identity or live-route success. For generation, onboarding proxy_kind is exactly caddy, nginx or traefik and
  maps to reverse_proxy_configuration.proxy_family. The existing-proxy branch may record nginx_proxy_manager but never
  emits a generated-configuration record; neither branch silently substitutes a family. D6 A: the human signs in on the
  initiating active device while the AI/tool runs on the selected execution host. Official tool sign-ins and private
  account roots stay with that tool on that host; direct API keys are held by Puppet Master’s secure credential store
  on that host. Onboarding, Settings, model selection and Usage share stable account/profile/host/environment references,
  never provider-name booleans or copied secrets. Protected returns are bound to the exact operation, initiating Client/session/generation
  and execution host. Changing account, host or route invalidates stale validation; another account of the same provider
  has a distinct identity. D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on Windows,
  macOS and Linux have their own built-in Tailscale connection and sign in once through the shared protected auth owner,
  with no separate Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning PM process.
  A Server keeps one active node per stable server_id; a native Client installation keeps one active node per stable
  client_id, independent of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration,
  process, IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate active nodes.
  Native Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying or a Server
  public listener. Server nodes retain the automatic private listener; Funnel remains Server-only, explicit, off by default
  and unavailable on Headscale. Human approval and reusable connection identity do not grant PM pairing/trust or work
  permission. A plain browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint reachable
  through the device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed host
  Tailscale stays external and unmanaged.'
- 'DL-259 srv final, 2026-10-31: Creating observes only the reviewed Project creation/open/restore result and its actual
  prerequisites. It does not run optional remote-access configuration. After that owner settlement, a separate postcommit
  remote-setup view inside automatic_preparation runs any requested Remote Access continuation, before the normal provider/Free
  Models continuation; the eleven-stage graph is unchanged. Tailscale/Headscale authorization, new Remote Link output,
  and managed/export/existing proxy steps use their existing domain owners, approvals and truthful results. Later always
  finishes onboarding and leaves the committed Project intact: it does not wait for optional setup, certify it, undo
  owner effects or invent readiness. Unstarted setup is deferred; any already-started work obeys the owner’s existing
  cancel/background rules, and the app shows its actual result or pending state. Existing whole-session ui.onboarding.skip/close
  semantics supply this exit without a new mutation command.'
- 'DL-259 srv final, 2026-10-31: what the person actually set up is what the app shows. Enter/finish binds the shell,
  Settings and status views to the stable Client, Server, Execution Host, route and Project identities supplied by current
  owner results and registries, with their actual readiness/deferred state. Display names never become IDs, and the reviewed
  setup plan is intent rather than effective state. Onboarding creates no second account/server/Project registry or durable
  handoff writer; its initial context is a non-authoritative join of existing owner receipts/projections, followed by
  their normal updates. No concept-global object, event or store key is a product contract.'
- 'DL-259 owner answers, Jared 2026-10-31: CERT-1 removes PM certificate administration and every certificate-selection/validation
  gate; configuration generation and actual PM route checks report only their own result, never certificate validity.
  CLOUD-1 uses the protected console one-time-code handoff; DESKTOP-RESTORE-1 uses protected native local handoff with
  no code to type. Both consume Server-owned initial claim authorization through the existing exact claim tuple before
  separate bootstrap/full restore. REMOTE-CODE-1 is an accepted pre-build protocol check alongside D4; no code grammar,
  new resolver command or wizard caveat is invented. Existing public-exposure consent and truthful reachability/identity/pairing
  checks remain.'
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json
  - future native Product Onboarding and Guided Tour local-action, owner-route, reverse-wiring, accessibility, and visual fixtures
risk_class: onboarding_fake_command_or_parallel_owner_wiring
reasoning_tier: high
context_scope: product_onboarding_and_guided_tour_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - future Product Onboarding and Guided Tour local-action and owner-route bindings
node_compile_hint:
  mode: product_onboarding_typed_local_action_wiring
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0016
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0032
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0033
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0035
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0036
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0037
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0040
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0041
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0043
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
- Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31; DL-259)
source_atom_ids: [atom-0016, atom-0032, atom-0033, atom-0035, atom-0036, atom-0037, atom-0038, atom-0040, atom-0041, atom-0042, atom-0043, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0003, dec-0004, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
  - "welcome"
  - "simple_path"
  - "first_project"
  - "source_control_setup"
  - "server_storage_client"
  - "remote_access_setup"
  - "review_setup_plan"
  - "automatic_preparation"
  - "ready"
  - "path_kind"
  - "queued_setup_plan_ref"
  - "queued_setup_plan_revision"
  - "reviewed_setup_plan_revision"
  - "review_confirmation"
  - "approved_setup_plan_sha256"
  - "automatic_preparation_currentness_ref"
  - "mapped_stage_counts"
  - "mapped_path_counts"
  - "scm_backend_selection"
  - "forge_provider_selection"
  - "ui.onboarding.start"
  - "ui.onboarding.next"
  - "ui.onboarding.back"
  - "ui.onboarding.close"
  - "ui.onboarding.skip"
  - "ui.onboarding.defer"
  - "ui.onboarding.open_details"
  - "ui.onboarding.more_ways"
  - "ui.onboarding.choose_simple_path"
  - "ui.onboarding.open_owner_flow"
  - "ui.onboarding.run_automatic_preparation"
  - "ui.onboarding.choose_first_project"
  - "ui.onboarding.finish"
  - "ui.onboarding.choose_look"
  - "usage"
  - "planning_wizard"
  - "chat_teacher"
  - "ui.guided_tour.start"
  - "ui.guided_tour.next"
  - "ui.guided_tour.back"
  - "ui.guided_tour.pause"
  - "ui.guided_tour.resume"
  - "ui.guided_tour.skip"
  - "ui.guided_tour.focus_route"
  - "ui.guided_tour.toggle_eli5"
  - "tour_narration_only"
  - "ui.guided_tour.finish"
  - "ui.guided_tour.replay"
  - "local_context"
  - "skip_product_onboarding"
  - "skip_optional_scope"
  - "toggle_setup_options"
  - "update_branch_state"
  - "session_skipped"
  - "optional_scope_skipped"
  - "Set up a paid provider"
  - "Use this provider"
  - "Sign in"
  - "Set up provider"
  - "Reconnect"
  - "Skip for now"
  - "Review Free Models"
  - "Maybe later"
  - "Continue to Planning Wizard"
  - "Open Planning Wizard"
  - "onboarding_setup_state"
  - "Provider setup is not finished"
  - "Teacher"
  - "cmd.onboarding.back"
  - "cmd.onboarding.cancel"
  - "cmd.onboarding.continue"
  - "cmd.onboarding.defer"
  - "cmd.onboarding.finish"
  - "cmd.onboarding.open_details"
  - "cmd.onboarding.resume"
  - "cmd.onboarding.skip"
  - "Explain this reply simply"
  - "cmd.chat.eli5.explain_reply"
stale_retired_dispositions:
  - "server_setup is superseded seven-stage source lineage only; current wiring uses server_storage_client."
  - "The five-chapter chat_teacher, shell_navigation, panel_layout, widget_workspace, planning_wizard order is retired source lineage and never a current Tour route."
  - "ui.guided_tour.restore_layout is retired as a Tour action; existing layout-owner commands remain available to unrelated consumers."
  - "ui.guided_tour.keep_layout is retired as a Tour action; existing layout-owner commands remain available to unrelated consumers."
  - "ui.guided_tour.toggle_reduced_motion is retired as a Tour action; Settings remains the sole Reduced Motion owner for every consumer."
  - "cmd.onboarding.first_run.open is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.provider_setup.open is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.provider_setup.use_provider is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.skip_to_planning_wizard is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.review is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.defer is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.review_setup is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.open_planning_wizard is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.refresh is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.retry is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.free_models.setup is source-lineage-only; it is neither a production row nor a compatibility alias."
  - "cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume, and cmd.onboarding.skip are packet source-lineage candidates rejected as commands, aliases, and handlers."
  - "Amended 2026-10-09 (DL-180): the move-or-dock-chat practice retires; the workspace chapter practises the \"+\" menu, opening a file from the rail, splitting by dragging a tab and adding a widget to the dashboard tab, and the tour captures and restores the v2 Home layout record."
  - "Amended 2026-10-10 (DL-186; P1 B, P10): the widget practice teaches Upcoming resets on the Home dashboard, added then moved or resized, its widget commands naming the Home board in room."
negative_constraints:
  - Do not generate wiring JSON, WorkNodes, NodeSeeds, executable queues, or runtime dispatch during this compile phase.
  - Do not register a `cmd.onboarding.*` semantic command, production row, compatibility alias, generic handler, or EventRecord.
  - Do not give a local `ui.onboarding.*` action a fictitious domain handler or let it replay owner work.
  - Do not accept open-ended local_context, raw/arbitrary payload copies, secret-bearing values, or ambiguous more_ways/skip variants.
  - Do not claim native Slint, dispatcher, handler, persistence, or runtime wiring from schemas, static assertions, PMConcept7, or browser evidence.
  - Do not turn the bounded modal into a route or add browser-style Back/breadcrumb chrome.
  - Do not restore provider-first setup or insert peer advanced/Tour stages; paid-provider then Free Models are the PWIZ-021 post-Project phases, not pre-Project setup. Do not treat `ready` as universal owner readiness.
  - Do not broaden current owner-authorized precommit reads/selected-source auth into mutation; do not accept stale revision/hash/path/continuation/currentness or a ref-shaped authorization claim. Exact reviewed Project commit remains mandatory before provider phases.
  - Do not restore the retired five-chapter Tour, synthesize separate move/resize/configure/focus checkpoints, or admit retired restore-layout, keep-layout, or Tour-owned Reduced Motion actions.
  - Do not let narration, timers, generic Next, look-alike controls, or browser/static fixtures fabricate a performed Tour checkpoint, owner result, native handler, production receipt, or completion.
  - Do not persist Guided Tour scene, status, Teacher text, focus, motion, demonstrated-action, or completed-action state.
  - Do not redefine installation, claim, pairing, remote access, provider auth, Project, backup/restore, update, Doctor, storage, or Planning Wizard engines in Wiring_Matrix.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
```

### WM-040 - DRY Method Settings Wiring

```yaml
plan_unit_id: WM-040
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Under DL-041, the eventual DRY Method mutation path reuses the existing cmd.settings.transaction.preview and
  cmd.settings.transaction.apply sequence for the exact app.agent_rules.dry_method_default_guard identity,
  preserving enabled | disabled_by_user and default enabled. The approved future event spelling is
  settings.updated; its eventual closed contract must preserve this exact key and the existing transaction_id,
  request_id, project_id, changed_setting_ids, revisions and receipt_ref of pm.settings_transaction_result.v1.
  Settings and Storage retain scope and persistence authority; the app. spelling cannot manufacture an
  application-scoped transaction or bypass the current Project/currentness/permission boundary. The exact
  owner key is not automatically a valid ordinary setting_id: do not insert it into changed_setting_ids, silently
  substitute memory.assembly.dry-method-guard, or claim a closed writer mapping until owner evidence establishes it.
  Until that mapping and writer are proven, owner_contract_missing disables the toggle and prevents mutation
  command dispatch and setting writes; naming agreement alone cannot enable the action. Until separate
  Event Authority admission, no settings.updated EventRecord is emitted. Assistant Chat and run-detail DRY
  disclosure projections continue to consume owner readback and receipts, and SSYS-023 renders the same
  requested/effective owner projection. The retired cmd.settings.agent_rules.dry_method_default_guard.set row
  cannot grant dispatch, handler or emission authority. Historical settings.agent_rules.dry_method_default_guard.updated
  records remain read-only lineage; no automatic alias or payload rewrite is introduced. Turning off the default
  guard preserves receipt provenance and all explicit instructions, safety, secrets, source authority, governance,
  permissions and source-control hygiene.
gui_related: true
gui_classification_reason: Defines user-visible settings toggle wiring and disclosure refresh behavior.
depends_on: [UCC-104, CV-299, SP-223, ACD-429, SSYS-023]
unblocks: [ATS-018]
acceptance_criteria:
  - Missing owner-key/writer mapping yields owner_contract_missing with zero mutation dispatches and writes. Only after the mapping is proven may the existing transaction sequence write enabled or disabled_by_user under current owner scope, revision and receipt rules.
  - Only settings.updated is the approved future event name for that change; independent admission is required, and historical dedicated names are not automatic aliases.
  - Assistant Chat and run-detail disclosures refresh after the setting changes.
  - Disabled DRY state remains receipt-backed and does not bypass non-DRY authority boundaries.
  - Settings renders the same requested/effective DRY owner projection and never becomes a second DRY owner.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY Method settings wiring fixture
risk_class: dry_method_settings_wiring_gap
reasoning_tier: high
context_scope: dry_method_settings_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - future Settings command wiring
node_compile_hint:
  mode: dry_method_settings_wiring
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-app-default
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-chat-what-why
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0073, atom-0074, atom-0089]
decision_refs: [dec-0016, dec-0017]
preserved_exact_tokens:
  - "cmd.settings.agent_rules.dry_method_default_guard.set"
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "settings.agent_rules.dry_method_default_guard.updated"
  - "DRY applied"
  - "DRY degraded"
  - "DRY disabled"
negative_constraints:
  - Do not generate wiring JSON, WorkNodes, or executable queues during this compile phase.
  - Do not treat disabled DRY as permission to bypass explicit instructions, safety, secrets, source authority, governance, permissions, or source-control hygiene.
  - Do not hide trust-affecting DRY state in backend logs only.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```
