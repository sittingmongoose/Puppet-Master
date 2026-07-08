# Shard 014: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/UI_Command_Catalog.md`

Source lines: L7641-L7733

Source SHA256: `bcf9bc44c53ee989738328d557940fc7695e4d669fbe0f8f3934fe86802bad78`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding command obligations from bootstrap ledger `pldg-20260701-001-feature-intake` into UI_Command_Catalog ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### UCC-106 - First-Run Onboarding Command Family

```yaml
plan_unit_id: UCC-106
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  First-run onboarding GUI actions use a registered onboarding command family rather than page-local button payloads.
  Required commands include `cmd.onboarding.first_run.open`, `cmd.onboarding.provider_setup.open`,
  `cmd.onboarding.provider_setup.use_provider`, `cmd.onboarding.skip_to_planning_wizard`,
  `cmd.onboarding.free_models.review`, `cmd.onboarding.free_models.defer`, `cmd.onboarding.review_setup`,
  `cmd.onboarding.open_planning_wizard`, and `cmd.health.provider_setup.open`. Payloads carry source surface, current
  onboarding step, selected provider/account/profile refs when applicable, return route, idempotency key, and
  `onboarding_setup_state` refs where relevant. Results include step transition, setup flow launched, setup skipped,
  Free Models review opened or deferred, Planning Wizard opened, and Health provider-setup route opened. Teacher links
  from onboarding normalize to the existing Teacher/Teach command routes from UCC-102 and CS-053 rather than creating a
  second Teacher command language.
gui_related: true
gui_classification_reason: Defines user-visible button/route command IDs and command results for first-run onboarding and Health setup actions.
depends_on: [F3-411, MA-066, CV-305, ACD-431, UCC-102, CS-053]
unblocks: [WM-041, PWIZ-017, ATS-020]
acceptance_criteria:
  - Every accepted first-run onboarding action has a stable UI command route.
  - Skip routing writes or references limited `onboarding_setup_state` and opens Planning Wizard without marking Health Ready.
  - Provider setup commands preserve return context and cannot bypass Multi-Account/provider readiness semantics.
  - Free Models review/defer commands are reachable only after the paid-provider prompt has occurred.
  - Teacher actions reuse existing Teacher/Teach command contracts and preserve current-surface context.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run onboarding UICommand fixture
  - future skip-to-Planning-Wizard command idempotency fixture
risk_class: onboarding_command_gap
reasoning_tier: high
context_scope: first_run_onboarding_commands
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - future command registry and first-run onboarding controls
node_compile_hint:
  mode: first_run_onboarding_command_catalog
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
negative_constraints:
  - Do not route onboarding actions through uncataloged local command IDs.
  - Do not let skip-to-Planning-Wizard mark Doctor/Health as Ready.
  - Do not open Free Models before the paid-provider prompt has occurred.
  - Do not make Teacher discovery depend on slash-command knowledge.
  - Do not create a second Teacher command payload language separate from UCC-102 and CS-053.
  - Do not generate wiring JSON, WorkNodes, NodeSeeds, or executable queues during this compile phase.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
```
