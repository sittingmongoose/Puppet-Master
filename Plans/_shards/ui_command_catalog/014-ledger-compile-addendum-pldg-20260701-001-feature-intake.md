# Shard 014: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/UI_Command_Catalog.md`

Source lines: L7673-L7829

Source SHA256: `e90c2d9e9cd4dd77d91979cf6ed178eb6f9bf117ad4dbda3dbf62a060fe35af9`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum preserves the first-run onboarding command-era source obligations compiled from bootstrap ledger `pldg-20260701-001-feature-intake`. Current Product Onboarding is owned by `Plans/Planning_Wizard.md` PWIZ-021 through PWIZ-023 and supersedes the command-era behavior below with typed owner-local UI actions. This addendum does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### UCC-106 - First-Run Onboarding Command-Era Lineage And Current Typed Local Actions

```yaml
plan_unit_id: UCC-106
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  UCC-106 retains eleven historical cmd.onboarding.* identifiers as searchable command-era source lineage only; none is
  a current command, alias, primary handler, or production-wiring row. Current Product Onboarding uses exactly thirteen typed
  owner-local actions ui.onboarding.start, ui.onboarding.next, ui.onboarding.back, ui.onboarding.close,
  ui.onboarding.skip, ui.onboarding.defer, ui.onboarding.open_details, ui.onboarding.more_ways,
  ui.onboarding.choose_simple_path, ui.onboarding.open_owner_flow,
  ui.onboarding.run_automatic_preparation, ui.onboarding.choose_first_project, and ui.onboarding.finish. These are local
  UI actions, not semantic commands or catalog registrations, and use the closed pm.product_onboarding.action_request.v1
  and pm.product_onboarding.action_result.v1 contracts. Every request requires closed, normalized, secret-free
  local_context fields for intent, scope, branch, selection, owner-operation, disclosure, tour, and recovery identity;
  arbitrary/raw payload fields and secret-bearing values are rejected. An action that launches owner work carries a typed owner
  route or intent and maps to that owner's existing canonical command and sole handler. The command-era reference to
  cmd.health.provider_setup.open does not give Product Onboarding a Health/Doctor handler. Teacher links continue to use
  the existing Teacher/Teach command routes from UCC-102 and CS-053. The packet candidates cmd.onboarding.back,
  cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish,
  cmd.onboarding.open_details, cmd.onboarding.resume, and cmd.onboarding.skip are source-lineage candidate tokens only;
  each is rejected as a command, alias, and handler because its semantics are owned by typed local ui.onboarding.* actions.
gui_related: true
gui_classification_reason: Reconciles retired visible onboarding command-era controls with the current typed owner-local Product Onboarding actions.
depends_on: [PWIZ-021, PWIZ-022, PWIZ-023, UCC-102, CS-053]
unblocks: []
acceptance_criteria:
  - The eleven retained cmd.onboarding.* tokens are searchable source lineage only and receive no command registration, alias, primary handler, or production-wiring row.
  - Every current Product Onboarding control emits exactly one of the thirteen ui.onboarding.* typed local action IDs owned by PWIZ-021 through PWIZ-023.
  - The eight packet candidate cmd.onboarding.* tokens are durably rejected as commands, aliases, primary handlers, and production-wiring rows; they do not normalize to the typed local action set.
  - Defer durably preserves exact stage, path, active branch, bounded history, revision/continuation, initiating Client, and focus return; Close is a non-completion dismissal; Skip records an explicit skipped session; Details is ephemeral, same-stage, non-persistent, and owner-command-free.
  - OnboardingActionRequest/OnboardingActionResult close the request/result vocabulary. Applied, disabled, and rejected results are distinct; disabled/rejected results have no local effect, session write, continuation, owner route, or production receipt and expose exact reasons.
  - Required local_context accepts only the schema's normalized intent, scope, branch_kind, branch_step, selection_ref, target_ref, owner_operation_ref, owner_branch_ref, expanded, start_tour, and recovery_condition fields; additional/raw/free-form/secret-bearing values are rejected.
  - "more_ways setup/project disclosure and branch-local state updates have distinct intent/scope/choice/branch combinations; Skip whole-session and optional Project/Remote-Access variants have distinct intent/scope/choice/branch plus session_skipped versus optional_scope_skipped results."
  - Skip and Close never mark Health, Doctor, provider, Server, Project, backup, or any other owner Ready.
  - Owner-flow actions carry typed owner route or intent and map to the target owner's existing canonical command and sole handler without replaying owner work.
  - Teacher actions reuse existing Teacher/Teach command contracts and preserve current-surface context.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Concepts/pm7-tools/onboarding_cinematic_source.py static assertions
  - Concepts/pm7-tools/verify/onboarding_cinematic.mjs browser-concept verifier
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
