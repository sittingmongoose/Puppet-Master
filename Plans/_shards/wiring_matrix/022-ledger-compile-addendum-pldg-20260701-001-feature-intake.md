# Shard 022: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Wiring_Matrix.md`

Source lines: L3262-L3404

Source SHA256: `d0e6748a3fa3a920fc557eabe4c198ee2512b7948ff45642932f209e2ee2d566`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding route wiring obligations from bootstrap ledger `pldg-20260701-001-feature-intake` into Wiring_Matrix ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, wiring JSON, generated governance artifacts, or a governance seal.

### WM-041 - First-Run Onboarding CTA And Route Wiring

```yaml
plan_unit_id: WM-041
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  First-run onboarding wiring maps the visible wizard CTAs to the UI_Command_Catalog onboarding command family and
  owner-doc consumers. `Set up a paid provider`, `Use this provider`, `Sign in`, `Set up provider`, and `Reconnect`
  open or resume provider/account setup with return context. `Skip for now` writes or references limited
  `onboarding_setup_state` and opens Planning Wizard in limited setup state without marking Doctor/Health Ready.
  `Review Free Models`, `Maybe later`, and `Continue to Planning Wizard` preserve the paid-provider-before-Free-Models
  sequence and saved top-10 order. `Open Planning Wizard` routes to Planning Wizard as the first full app page after
  setup or skip. The onboarding Teacher copy routes through Assistant Chat/Teacher contracts rather than a separate
  Teacher surface. Health/Doctor `Set up provider` reuses the same provider setup route and return context. This PlanUnit
  records wiring obligations only and does not generate wiring JSON.
gui_related: true
gui_classification_reason: Defines user-visible CTA routing, first-run step transitions, and cross-surface GUI route behavior.
depends_on: [F3-411, UCC-106, CV-305, MA-066, MS-122, ACD-431, PWIZ-017]
unblocks: [ATS-020]
acceptance_criteria:
  - Every accepted first-run CTA maps to a cataloged UI command or existing Teacher/Planning Wizard route.
  - Skip routing preserves limited setup state and cannot produce a false-ready Health state.
  - Provider setup return context routes back to onboarding, Planning Wizard limited state, Health, or the originating Free Models row/list as appropriate.
  - Free Models review/defer wiring occurs only after the paid-provider prompt.
  - Wiring consumes owner docs rather than redefining provider auth, model readiness, Teacher behavior, or Planning Wizard state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run onboarding command wiring fixture
  - future Health provider-setup return-route fixture
risk_class: onboarding_wiring_gap
reasoning_tier: high
context_scope: first_run_onboarding_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - future first-run onboarding route wiring
node_compile_hint:
  mode: first_run_onboarding_wiring
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
source_atom_ids: [atom-0016, atom-0032, atom-0033, atom-0035, atom-0036, atom-0037, atom-0038, atom-0040, atom-0041, atom-0042, atom-0043, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0003, dec-0004, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
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
negative_constraints:
  - Do not generate wiring JSON, WorkNodes, NodeSeeds, executable queues, or runtime dispatch during this compile phase.
  - Do not route skip to the dense Home shell by default.
  - Do not mark Doctor/Health as Ready when provider setup was skipped.
  - Do not define UICommand payload/result schemas outside UI_Command_Catalog.
  - Do not redefine provider/account readiness or Teacher behavior in Wiring_Matrix.
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
  projections, and records receipt provenance for enabled and disabled_by_user states. This wiring does not generate
  wiring JSON and does not disable explicit instructions, safety, secrets, source authority, governance, permissions,
  or source-control hygiene when the default DRY guard is turned off.
gui_related: true
gui_classification_reason: Defines user-visible settings toggle wiring and disclosure refresh behavior.
depends_on: [UCC-104, CV-299, SP-223, ACD-429]
unblocks: [ATS-018]
acceptance_criteria:
  - The Settings toggle writes only enabled or disabled_by_user to the DRY default-guard setting.
  - Assistant Chat and run-detail disclosures refresh after the setting changes.
  - Disabled DRY state remains receipt-backed and does not bypass non-DRY authority boundaries.
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
