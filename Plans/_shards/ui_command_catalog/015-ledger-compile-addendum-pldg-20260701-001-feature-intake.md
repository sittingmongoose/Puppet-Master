# Shard 015: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/UI_Command_Catalog.md`

Source lines: L7760-L8024

Source SHA256: `9acefb9159762fec111c86e6d075da46a5b71cf95b79a23705b801bc7b3c8dee`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum preserves the first-run onboarding command-era source obligations compiled from bootstrap ledger `pldg-20260701-001-feature-intake`. Current Product Onboarding is owned by `Plans/Planning_Wizard.md` PWIZ-021 through PWIZ-023 and supersedes the command-era behavior below with typed owner-local UI actions. This addendum does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### UCC-106 - First-Run Onboarding Command-Era Lineage And Current Typed Local Actions

```yaml
plan_unit_id: UCC-106
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'UCC-106 retains eleven historical cmd.onboarding.* identifiers as searchable command-era source lineage
  only; none is a current command, alias, primary handler, or production-wiring row. Current Product Onboarding uses
  exactly fourteen typed owner-local actions ui.onboarding.start, ui.onboarding.next, ui.onboarding.back, ui.onboarding.close,
  ui.onboarding.skip, ui.onboarding.defer, ui.onboarding.open_details, ui.onboarding.more_ways, ui.onboarding.choose_simple_path,
  ui.onboarding.open_owner_flow, ui.onboarding.run_automatic_preparation, ui.onboarding.choose_first_project, ui.onboarding.finish,
  and ui.onboarding.choose_look. These are local UI actions, not semantic commands or catalog registrations, and use
  the closed pm.product_onboarding.action_request.v2 and pm.product_onboarding.action_result.v2 contracts. ui.onboarding.choose_look
  (DL-153) is a local look preview, and so is the look ui.onboarding.start opens in (Basic Dark for first_run, the look
  on screen for settings_rerun): neither dispatches cmd.theme.* or a Settings transaction, and the look is written with
  the Project at commit. Every request consumes PWIZ-021''s closed, normalized, secret-free local_context, including
  phase-specific draft/preflight/commit bindings as defined by the owner schema; arbitrary/raw payload fields and secret-bearing
  values are rejected. An action that launches owner work carries a typed owner route or intent and maps to that owner''s
  existing canonical command and sole handler. The command-era reference to cmd.health.provider_setup.open does not give
  Product Onboarding a Health/Doctor handler. Teacher links continue to use the existing Teacher/Teach command routes
  from UCC-102 and CS-053. The packet candidates cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue,
  cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume, and cmd.onboarding.skip
  are source-lineage candidate tokens only; each is rejected as a command, alias, and handler because its semantics are
  owned by typed local ui.onboarding.* actions. The bell''s setup Continue entry forwards the original prompt''s own
  typed action, ui.onboarding.start with admitted resume intent and the same closed owner context; it adds no fifteenth
  onboarding action and never revives cmd.onboarding.resume. The separate Guided Tour Continue entry belongs to PWIZ-023
  and forwards ui.guided_tour.resume under pm.guided_tour.action_request.v3; it is not an onboarding action. QA round
  2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q6/Q7/H1/H5: the unchanged fourteen typed onboarding actions route the
  selected source and protected owner unlock. A Kit is not a destination/authentication command. Screen seeds/under trays
  add no action or payload field. DL-259, Jared 2026-10-31: D1 A: the online-service step creates or selects a code repository;
  onboarding does not publish a website, GitHub Pages, GitLab Pages or another site. Local-only Project choices remain
  valid. D2 A: explicit always-on Server setup on this computer, manual private HTTPS, a self-hosted Remote Link gateway,
  rarer SSH key types, China-region AI variants and local AI servers live in Settings, with a clear context-correct pointer
  from onboarding. The ordinary This computer choice remains the easy local-work default. The wizard says AI accounts
  available in this setup, not every AI. Existing Settings routes and owners retain the advanced capabilities. D3 A:
  generated proxy settings support Caddy, NGINX and Traefik, with Caddy the default. Nginx Proxy Manager is existing-only:
  it can be selected as an existing proxy but never sent to a generation/install/export operation. New-Server managed
  setup, export-only and existing-proxy validation are separate owner continuations; generating a file does not prove
  installation, public consent, DNS/TLS, endpoint identity or live-route success. For generation, onboarding proxy_kind
  is exactly caddy, nginx or traefik and maps to reverse_proxy_configuration.proxy_family. The existing-proxy branch
  may record nginx_proxy_manager but never emits a generated-configuration record; neither branch silently substitutes
  a family. D6 A: the human signs in on the initiating active device while the AI/tool runs on the selected execution
  host. Official tool sign-ins and private account roots stay with that tool on that host; direct API keys are held by
  Puppet Master’s secure credential store on that host. Onboarding, Settings, model selection and Usage share stable
  account/profile/host/environment references, never provider-name booleans or copied secrets. Protected returns are
  bound to the exact operation, initiating Client/session/generation and execution host. Changing account, host or route
  invalidates stale validation; another account of the same provider has a distinct identity. D7 B supersedes the former
  no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and Linux have their own built-in Tailscale
  connection and sign in once through the shared protected auth owner, with no separate Tailscale app install. The same
  signed PM-owned Go tsnet helper is supervised by its owning PM process. A Server keeps one active node per stable server_id;
  a native Client installation keeps one active node per stable client_id, independent of Projects, windows, tabs, sessions
  and Server endpoint selection. Owner-qualified configuration, process, IPC, authorization, egress and secure-state
  references prevent identity/key sharing or duplicate active nodes. Native Client nodes provide bounded Dial/stream
  access only to verified PM endpoints, not arbitrary proxying or a Server public listener. Server nodes retain the automatic
  private listener; Funnel remains Server-only, explicit, off by default and unavailable on Headscale. Human approval
  and reusable connection identity do not grant PM pairing/trust or work permission. A plain browser tab has no embedded
  Tailscale connection: it needs Remote Link or a private endpoint reachable through the device’s own Tailscale connection.
  It cannot be enrolled by a browser sign-in. Existing user-managed host Tailscale stays external and unmanaged. D8 A:
  onboarding has one FileSafe switch, default on, covering command blocklist, write scope, security filter and pre-write
  safe points together. Individual controls remain in Settings. The switch expresses a requested owner configuration,
  never approval to bypass a required guard, an absent allowlist/baseline, failed canonical-path resolution, failed initialization
  or failed safe-point persistence. Mandatory policy and effective guard state win; a refused change stays refused with
  a clear reason. No failure silently turns a guard off. ELI5: the wizard bar and Guided Tour bar expose the same global
  general.interaction.mode through the Settings owner, with values ELI5 and Expert, labels Plain English and Expert,
  and default ELI5. Both bars reflect the same effective state. Every opened onboarding question tip and prose help section
  has useful Plain English and technical versions, including FileSafe, service differences, storage, remote access and
  AI/auth choices, assuming no coding experience. Screen copy, control labels, exact fingerprints, paths and receipt
  data stay single; dual copy is limited to tips/help (DL-126). A mode change updates an open tip without rewriting a
  chat reply. Existing cmd.settings.transaction.preview/apply owns the preference; ui.guided_tour.toggle_eli5 is a compatibility
  local adapter to that shared preference, not a tour-only setting or chat ELI5 command. The predecessor tour_narration_only
  tag is retired.'
gui_related: true
gui_classification_reason: Reconciles retired visible onboarding command-era controls with the current typed owner-local Product Onboarding actions.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023, UCC-102, CS-053]
unblocks: []
acceptance_criteria:
- The eleven retained cmd.onboarding.* tokens are searchable source lineage only and receive no command registration,
  alias, primary handler, or production-wiring row.
- Every current Product Onboarding control emits exactly one of the fourteen ui.onboarding.* typed local action IDs owned
  by PWIZ-021 through PWIZ-023.
- The onboarding look choice, its NieR Mode controls and its start look are local previews through ui.onboarding.choose_look
  and ui.onboarding.start; neither dispatches cmd.theme.* or a Settings transaction (DL-153).
- The eight packet candidate cmd.onboarding.* tokens are durably rejected as commands, aliases, primary handlers, and
  production-wiring rows; they do not normalize to the typed local action set.
- Defer durably preserves exact stage, path, active branch, bounded history, revision/continuation, initiating Client,
  and focus return; Close is a non-completion dismissal; Skip records an explicit skipped session; Details is ephemeral,
  same-stage, non-persistent, and owner-command-free.
- OnboardingActionRequest/OnboardingActionResult close the request/result vocabulary. Applied, disabled, and rejected
  results are distinct; disabled/rejected results have no local effect, session write, continuation, owner route, or
  production receipt and expose exact reasons.
- Required local_context consumes the exact closed v2 owner schema rather than a catalog-owned field list; nullable owner_phase/owner_command_id/precommit_authorization_ref/project_commit_ref/setup_commit_binding
  have phase-gated requirements, and additional/raw/free-form/secret-bearing values are rejected.
- Uncreated Project drafts and Settings copy previews consume PWIZ-021/SSYS-036. Only owner-authorized read-only preflight
  or selected-source authentication may run before commit; first-time sign-in consumes MACS-005 with no fabricated identities.
  Review carries PJCT-007's exact Project-owned commit binding, and paid/free-provider owner routes require that real
  committed Project. Neither phase adds a command or handler.
- more_ways setup/project disclosure and branch-local state updates have distinct intent/scope/choice/branch combinations;
  Skip whole-session and optional Project/Remote-Access variants have distinct intent/scope/choice/branch plus session_skipped
  versus optional_scope_skipped results.
- Skip and Close never mark Health, Doctor, provider, Server, Project, backup, or any other owner Ready.
- Owner-flow actions carry typed owner route or intent and map to the target owner's existing canonical command and sole
  handler without replaying owner work.
- Teacher actions reuse existing Teacher/Teach command contracts and preserve current-surface context.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q6/Q7/H1/H5: the unchanged fourteen typed onboarding actions
  route the selected source and protected owner unlock. A Kit is not a destination/authentication command. Screen seeds/under
  trays add no action or payload field.'
- 'DL-259, Jared 2026-10-31: D1 A: the online-service step creates or selects a code repository; onboarding does not
  publish a website, GitHub Pages, GitLab Pages or another site. Local-only Project choices remain valid. D2 A: explicit
  always-on Server setup on this computer, manual private HTTPS, a self-hosted Remote Link gateway, rarer SSH key types,
  China-region AI variants and local AI servers live in Settings, with a clear context-correct pointer from onboarding.
  The ordinary This computer choice remains the easy local-work default. The wizard says AI accounts available in this
  setup, not every AI. Existing Settings routes and owners retain the advanced capabilities. D3 A: generated proxy settings
  support Caddy, NGINX and Traefik, with Caddy the default. Nginx Proxy Manager is existing-only: it can be selected
  as an existing proxy but never sent to a generation/install/export operation. New-Server managed setup, export-only
  and existing-proxy validation are separate owner continuations; generating a file does not prove installation, public
  consent, DNS/TLS, endpoint identity or live-route success. For generation, onboarding proxy_kind is exactly caddy,
  nginx or traefik and maps to reverse_proxy_configuration.proxy_family. The existing-proxy branch may record nginx_proxy_manager
  but never emits a generated-configuration record; neither branch silently substitutes a family. D6 A: the human signs
  in on the initiating active device while the AI/tool runs on the selected execution host. Official tool sign-ins and
  private account roots stay with that tool on that host; direct API keys are held by Puppet Master’s secure credential
  store on that host. Onboarding, Settings, model selection and Usage share stable account/profile/host/environment references,
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
  Tailscale stays external and unmanaged. D8 A: onboarding has one FileSafe switch, default on, covering command blocklist,
  write scope, security filter and pre-write safe points together. Individual controls remain in Settings. The switch
  expresses a requested owner configuration, never approval to bypass a required guard, an absent allowlist/baseline,
  failed canonical-path resolution, failed initialization or failed safe-point persistence. Mandatory policy and effective
  guard state win; a refused change stays refused with a clear reason. No failure silently turns a guard off. ELI5: the
  wizard bar and Guided Tour bar expose the same global general.interaction.mode through the Settings owner, with values
  ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars reflect the same effective state. Every
  opened onboarding question tip and prose help section has useful Plain English and technical versions, including FileSafe,
  service differences, storage, remote access and AI/auth choices, assuming no coding experience. Screen copy, control
  labels, exact fingerprints, paths and receipt data stay single; dual copy is limited to tips/help (DL-126). A mode
  change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply owns the
  preference; ui.guided_tour.toggle_eli5 is a compatibility local adapter to that shared preference, not a tour-only
  setting or chat ELI5 command. The predecessor tour_narration_only tag is retired.'
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
risk_class: onboarding_command_lineage_revival
reasoning_tier: high
context_scope: product_onboarding_local_actions_and_command_lineage
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: product_onboarding_local_action_lineage
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
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
source_atom_ids: [atom-0032, atom-0033, atom-0035, atom-0036, atom-0037, atom-0038, atom-0040, atom-0041, atom-0042, atom-0043, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0003, dec-0004, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
  - "cmd.onboarding.first_run.open"
  - "cmd.onboarding.provider_setup.open"
  - "cmd.onboarding.provider_setup.use_provider"
  - "cmd.onboarding.skip_to_planning_wizard"
  - "cmd.onboarding.free_models.review"
  - "cmd.onboarding.free_models.defer"
  - "cmd.onboarding.review_setup"
  - "cmd.onboarding.open_planning_wizard"
  - "cmd.onboarding.free_models.refresh"
  - "cmd.onboarding.free_models.retry"
  - "cmd.onboarding.free_models.setup"
  - "cmd.health.provider_setup.open"
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
  - "local_context"
  - "skip_product_onboarding"
  - "skip_optional_scope"
  - "toggle_setup_options"
  - "update_branch_state"
  - "session_skipped"
  - "optional_scope_skipped"
  - "Set up a paid provider"
  - "Skip for now"
  - "Use this provider"
  - "Sign in"
  - "Set up provider"
  - "Reconnect"
  - "Review Free Models"
  - "Maybe later"
  - "Continue to Planning Wizard"
  - "Open Planning Wizard"
  - "Review setup"
  - "onboarding_setup_state"
  - "Teacher"
  - "/teach"
  - "cmd.onboarding.back"
  - "cmd.onboarding.cancel"
  - "cmd.onboarding.continue"
  - "cmd.onboarding.defer"
  - "cmd.onboarding.finish"
  - "cmd.onboarding.open_details"
  - "cmd.onboarding.resume"
  - "cmd.onboarding.skip"
negative_constraints:
  - Do not register, alias, normalize, or wire any retained cmd.onboarding.* token into the current Product Onboarding flow.
  - Do not register, alias, normalize, wire, or assign a handler to any of the eight packet candidate cmd.onboarding.* tokens.
  - Do not treat ui.onboarding.* typed local actions as semantic commands or catalog rows.
  - Do not let Skip, Close, Defer, Details, or Ready-screen arrival mark Doctor/Health or any owner subsystem Ready.
  - Do not create an Onboarding-owned backend or replay owner work through a generic wrapper.
  - Do not accept an absent/open-ended local_context, arbitrary/raw payload copy, secret-bearing value, or ambiguous more_ways/skip variant.
  - Do not turn Product Onboarding into a routed page or add browser/route Back or breadcrumb chrome; typed Back remains local modal choreography.
  - Do not claim native dispatcher, native Slint controller, persistence adapter, or runtime proof from schemas, fixtures, static gates, PMConcept7, or browser verification.
  - Do not make Teacher discovery depend on slash-command knowledge.
  - Do not create a second Teacher command payload language separate from UCC-102 and CS-053.
  - Do not generate wiring JSON, WorkNodes, NodeSeeds, or executable queues during this compile phase.
compatibility_only_notes:
  - The eleven cmd.onboarding.* identifiers are retained for source search, audit, and one-time migration only; they are not aliases for ui.onboarding.* actions or owner commands.
  - The eight packet candidate cmd.onboarding.* tokens are separate source-lineage candidates rejected as commands, aliases, and handlers because typed local ui.onboarding.* actions own their semantics.
  - The command-era cmd.health.provider_setup.open reference grants Product Onboarding no Health/Doctor ownership; current owner work is launched only through typed owner route or intent.
stale_retired_dispositions:
  - The registered onboarding command-family interpretation, provider-first choreography, legacy onboarding_setup_state mutation path, and generic Onboarding handler are retired by PWIZ-021 through PWIZ-023.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
```
