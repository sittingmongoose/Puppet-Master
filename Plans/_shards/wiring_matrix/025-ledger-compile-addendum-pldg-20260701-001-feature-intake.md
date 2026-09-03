# Shard 025: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Wiring_Matrix.md`

Source lines: L3463-L3774

Source SHA256: `d108a46be70fbc2c9a91dc216f291f8238ed1201412f6582a4ad93a1ccad03f6`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum preserves the first-run/provider-command proposal from bootstrap ledger `pldg-20260701-001-feature-intake` as source lineage and reconciles WM-041 to the current Product Onboarding and Guided Tour owner contracts. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, wiring JSON, generated governance artifacts, or a governance seal.

### WM-041 - Product Onboarding And Guided Tour Typed Local Action And Owner-Route Wiring

```yaml
plan_unit_id: WM-041
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Current Product Onboarding wiring binds the exact nine-stage `welcome -> simple_path -> first_project ->
  source_control_setup -> server_storage_client -> remote_access_setup -> review_setup_plan -> automatic_preparation ->
  ready` main path and exact six-stage `welcome -> simple_path -> remote_access_setup -> review_setup_plan ->
  automatic_preparation -> ready` connect-existing shortcut to exactly thirteen typed local actions:
  `ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`,
  `ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`, `ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`,
  `ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`. These
  actions transition or project local Product Onboarding state; they are not UICommands and receive no command-catalog
  row, semantic command handler, generic Onboarding mutation handler, or EventRecord. They use the closed
  pm.product_onboarding.action_request.v1 -> pm.product_onboarding.action_result.v1 local contract. Every request has
  required closed, normalized, secret-free local_context fields; arbitrary/raw payload fields, additional keys, and
  secret-bearing values are rejected. Exact intent/scope/choice/branch combinations distinguish setup/project disclosure
  from branch-local more_ways updates and whole-session Skip from Project/Remote-Access optional-scope Skip. When a selected branch needs owner
  work, its local draft queues only the typed owner route and intent. No network probe, command, handler, or owner
  mutation is reachable until the person confirms the current `review_setup_plan`. That confirmation binds
  `path_kind`, `queued_setup_plan_ref`, `queued_setup_plan_revision`, `reviewed_setup_plan_revision`,
  `review_confirmation=person_confirmed_reviewed_plan`, `approved_setup_plan_sha256`, revision, and continuation
  generation; only a matching `automatic_preparation_currentness_ref` admits the existing canonical command to that
  owner's sole handler once. Current owner ObservableWork/results/receipts reverse-project through the exact reviewed
  revision and plan hash; terminal success may advance without a second confirmation, while stale, mismatched, blocked,
  failed, cancelled, or recovery-required results dispatch nothing new and cannot replace the last accepted projection.
  Session/continuation wiring preserves independent `scm_backend_selection` for local Git/Jujutsu Safe History and
  `forge_provider_selection` for an optional online copy. Legacy migration supplies exact `mapped_stage_counts` and
  `mapped_path_counts`, maps unresolved work to unconfirmed Review, and never replays owner work.

  Guided Tour wiring is a separate ephemeral three-scene film in exact `usage -> planning_wizard -> chat_teacher` order
  over the real mounted application. Its exact ten typed local actions are `ui.guided_tour.start`,
  `ui.guided_tour.next`, `ui.guided_tour.back`, `ui.guided_tour.pause`, `ui.guided_tour.resume`,
  `ui.guided_tour.skip`, `ui.guided_tour.focus_route`, `ui.guided_tour.toggle_eli5`, `ui.guided_tour.finish`, and
  `ui.guided_tour.replay`; they are not UICommands, owner mutations, EventRecords, or persistence authority. Usage Watch
  observes the same real card hide and return through widget-owner results, and Usage Try advances only from that same
  card's exact mounted Options control. Planning advances only from the exact mounted intent-chip result. Chat is placed
  at the far right through the layout owner, then advances only through the real guide selector, `Teacher` selection,
  real composer send, and deterministic local reply in that conversation. ELI5 stays at the top beside Pause and Skip;
  Reduced Motion is read from and changed through Settings, never a Tour-owned toggle. Skip reverse-routes restoration of
  the captured pre-tour layout, composer placeholder, and focus through their existing owners; Finish retains Chat at the
  far right without a keep-layout action. Generic Next, narration, timers, or look-alike controls cannot fabricate a
  performed checkpoint. Guided Tour state is not persisted, and static/schema/browser evidence proves no native handler.

  The eleven predecessor
  `cmd.onboarding.*` spellings listed below and their provider-first/Free-Models CTA choreography remain searchable source
  lineage only; none is a production wiring row or compatibility alias. The separate packet candidates
  cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish,
  cmd.onboarding.open_details, cmd.onboarding.resume, and cmd.onboarding.skip are source-lineage candidate tokens only and
  are rejected as commands, aliases, and handlers because typed local ui.onboarding.* actions own those semantics. This
  PlanUnit records wiring obligations only and does not generate wiring JSON.
gui_related: true
gui_classification_reason: Defines user-visible nine-/six-stage Product Onboarding and three-scene Guided Tour actions, transitions, reverse wiring, and owner-routed GUI behavior.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023, F3-520]
unblocks: []
acceptance_criteria:
  - The main path is exactly `welcome`, `simple_path`, `first_project`, `source_control_setup`, `server_storage_client`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, `ready`; the connect-existing shortcut is exactly `welcome`, `simple_path`, `remote_access_setup`, `review_setup_plan`, `automatic_preparation`, `ready`, omitting rather than executing the three main-path-only stages.
  - Back consumes the exact durable path history: connect-existing `remote_access_setup` returns to `simple_path`, while main-path `remote_access_setup` returns to `server_storage_client`; no skipped shortcut stage is synthesized into reverse wiring.
  - The exact current action set contains the thirteen named `ui.onboarding.*` IDs; every authored control emits one typed local action and no action is registered as a UICommand, domain event, or production wiring row. `simple_path` and `ui.onboarding.choose_simple_path` are current visible behavior.
  - Requests and results validate against the closed action schema; applied, disabled, and rejected are distinct, and disabled/rejected results dispatch no owner work, write no session/continuation, carry no production receipt, and expose exact reasons.
  - Every request carries the exact required closed local_context fields intent, scope, branch_kind, branch_step, selection_ref, target_ref, owner_operation_ref, owner_branch_ref, expanded, start_tour, and recovery_condition. `review_confirmation` is the sole additionally admitted field and is required only for the schema-gated current Review/Automatic-Preparation owner-flow cases; missing gated proof, any other additional/arbitrary/raw field, or secret-bearing context fails closed.
  - more_ways uses toggle_setup_options plus setup_options/project_options and a matching choice for stage disclosure, or update_branch_state plus non-null canonical branch_kind and choice=null for branch-local updates; the variants cannot normalize into each other.
  - Skip uses skip_product_onboarding/product_onboarding/choice=null with session_skipped and skipped status, or skip_optional_scope with matching Project/Remote-Access choice/scope/branch and optional_scope_skipped while the session remains active.
  - Defer durably writes exact path/stage/setup-mode/local-backend/forge/queued-plan/review/branch/history/revision/continuation/initiating-Client/focus-return state before dismissal; Close is non-completing; Skip records an explicit skipped session; Details is ephemeral, same-stage, non-persistent, and has no owner command.
  - Every inline SVG `?` choice-help control reuses `ui.onboarding.open_details` with `intent=toggle_choice_explanation`, exact current-stage scope, a stable help-topic `selection_ref`, and exact expanded state; it is same-stage, non-persistent, keyboard reachable, accessibility-linked, and owner-route-free.
  - Before person confirmation of the current Review revision, all choices are local draft writes or cached reads and reverse wiring exposes no network probe, owner route, command, handler, mutation, or production receipt.
  - Person confirmation requires matching `path_kind`, `queued_setup_plan_ref`, queued/reviewed revision, exact approved-plan SHA-256, session revision, and continuation generation. Automatic Preparation additionally requires the matching currentness ref; stale, unconfirmed, expanded, revision-mismatched, hash-mismatched, path-mismatched, or currentness-mismatched plans dispatch nothing.
  - Owner work uses the selected owner's existing canonical command and sole handler; each unchanged reviewed operation dispatches at most once, current terminal owner results reverse-project through ObservableWork/receipt refs, and retry/reload/resume observes the existing dedupe identity instead of launching a duplicate.
  - Confirmed intents route only to existing Project, Git/Jujutsu/forge, Server/Storage/Client, Remote Access, backup/restore, provider, authentication, Settings, widget, layout, Planning, or Assistant Chat owners as applicable; Wiring Matrix creates no parallel owner or generic mutation handler.
  - A new local Project routes through `cmd.project.new_local {init_git:true}`; `cmd.source_control.repository.init` has no request, alias, handler, or visible route.
  - Safe History backend selection (`git|jujutsu|null`) is local and independent from optional forge selection (`github|gitlab|azure_devops|bitbucket_cloud|bitbucket_data_center|cursor_origin|none|null`). Git and Jujutsu have no service accounts; account connection/sign-in or verified official signup-page handoff, repository list/create, backend-appropriate clone/publish, and Project registration follow their existing owners and exact terminal results.
  - First Project, Source Control, Server/Storage/Client, and Remote Access remain distinct progressive stages and owner routes; protected AuthBrowserSession content and credentials never enter Onboarding state, transport, or evidence.
  - Legacy provider-first/four-screen, predecessor-five-stage, and superseded seven-stage rows map once to the first unresolved current stage, force `review_confirmation=unconfirmed`, report exact `mapped_stage_counts` and `mapped_path_counts`, quarantine secret-bearing rows, and never replay owner work.
  - Skip and Close preserve truthful incomplete state, and arrival at `ready` never marks skipped Server, provider, Project, restore, Doctor, or other owner work Ready.
  - Guided Tour uses exactly the three scenes `usage`, `planning_wizard`, `chat_teacher` and exactly the ten named `ui.guided_tour.*` actions; those actions are typed local transport only, the session is ephemeral/nonpersisted, and no Tour action is a command, owner handler, or EventRecord.
  - The `ui.guided_tour.focus_route` action changes only the mounted application's visible route and focus; it cannot satisfy an owner-observed performed checkpoint.
  - Tour Next and Back may reverse-route watch-only narration with exact scene-heading focus, but neither can satisfy Usage Options, Planning intent, Teacher selection, composer send, deterministic reply, or any other required performed checkpoint.
  - Usage Watch observes one real card's owner-confirmed hide and return, and Usage Try advances only from that same card's exact mounted Options control; move, resize, configure, and focus are explanation text rather than separate performed checkpoints.
  - Planning advances only from the exact mounted Planning intent-chip handler result. Chat is owner-placed at the far right and advances only through the real guide selector, `Teacher`, a real composer send, and a deterministic local reply in the same conversation.
  - ELI5 is at the top beside Pause and Skip. Effective Reduced Motion is a Settings-owned projection/change route; Guided Tour has no Reduced Motion setting or action.
  - Skip restores the exact captured pre-tour layout, composer placeholder, and focus through existing owners; Finish keeps Chat at the far right. Neither behavior introduces `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, or a generic owner mutation.
  - Retired five-chapter ordering and `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, and `ui.guided_tour.toggle_reduced_motion` have no current Tour control, request, alias, handler, or production row; similarly named canonical layout or Settings commands remain available to unrelated non-Tour consumers under their existing owners.
  - Disabled/rejected Tour actions change no scene or owner state. Stale owner observations, missing exact mounted targets, restoration failure, layout failure, or deterministic-reply failure pause or fail closed with a named recovery reason and never synthesize completion.
  - The eleven listed `cmd.onboarding.*` spellings remain source-lineage-only and appear as neither production wiring rows nor compatibility aliases.
  - The eight packet candidate `cmd.onboarding.*` tokens remain source-lineage-only and are rejected as commands, aliases, handlers, and production rows.
  - The provider-first, paid-provider-before-Free-Models, direct limited-Planning-Wizard, and Teacher-copy proposal is predecessor lineage rather than current stage, route, or command authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Plans/guided_tour_contracts.schema.json
  - Plans/guided_tour_contract_fixtures.json
  - Concepts/pm7-tools/onboarding_cinematic_source.py static assertions
  - Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier
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
negative_constraints:
  - Do not generate wiring JSON, WorkNodes, NodeSeeds, executable queues, or runtime dispatch during this compile phase.
  - Do not register a `cmd.onboarding.*` semantic command, production row, compatibility alias, generic handler, or EventRecord.
  - Do not give a local `ui.onboarding.*` action a fictitious domain handler or let it replay owner work.
  - Do not accept open-ended local_context, raw/arbitrary payload copies, secret-bearing values, or ambiguous more_ways/skip variants.
  - Do not claim native Slint, dispatcher, handler, persistence, or runtime wiring from schemas, static assertions, PMConcept7, or browser evidence.
  - Do not turn the bounded modal into a route or add browser-style Back/breadcrumb chrome.
  - Do not restore the provider-first flow, add provider/advanced setup/Guided Tour as a canonical stage, or treat `ready` as owner readiness.
  - Do not dispatch any external Onboarding owner work before person-confirmed current Review or accept a stale revision, hash, path, continuation, or currentness ref.
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
  DRY Method settings wiring maps `cmd.settings.agent_rules.dry_method_default_guard.set` from Settings > General >
  Agent Rules to `app.agent_rules.dry_method_default_guard` storage, emits
  `settings.agent_rules.dry_method_default_guard.updated`, refreshes Assistant Chat and run-detail DRY disclosure
  projections, binds the SSYS-023 Settings consumer to the same requested/effective owner projection, and records receipt
  provenance for enabled and disabled_by_user states. This wiring does not generate
  wiring JSON and does not disable explicit instructions, safety, secrets, source authority, governance, permissions,
  or source-control hygiene when the default DRY guard is turned off.
gui_related: true
gui_classification_reason: Defines user-visible settings toggle wiring and disclosure refresh behavior.
depends_on: [UCC-104, CV-299, SP-223, ACD-429, SSYS-023]
unblocks: [ATS-018]
acceptance_criteria:
  - The Settings toggle writes only enabled or disabled_by_user to the DRY default-guard setting.
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
