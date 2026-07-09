# Shard 021: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Multi-Account.md`

Source lines: L4864-L4948

Source SHA256: `da9e013f1ea114359b0f5f0680d5bbc25479d9b16fc679a04d51f31ea2ffb848`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run provider account setup behavior from bootstrap ledger `pldg-20260701-001-feature-intake` into Multi-Account ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### MA-066 - First-Run Provider Account Setup Rows And Return Context

```yaml
plan_unit_id: MA-066
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: >-
  First-run provider setup rows consume the existing Multi-Account account/profile readiness state machine. The row
  actions `Sign in`, `Set up provider`, and `Reconnect` map to existing account/auth/configuration states, and the
  friendly statuses `Connected`, `Needs sign-in`, and `Could not connect` are GUI projections over canonical account
  and provider readiness rather than new readiness states. Provider setup launched from first-run onboarding carries a
  return context back to the onboarding wizard, Planning Wizard limited-state reminder, or originating Free Models
  row/list as appropriate. Returning from setup refreshes provider/account eligibility without changing saved Free
  Models top-10 order, without collecting credentials inside Free Models, and without flattening provider-specific
  setup failures into a generic provider error.
gui_related: true
gui_classification_reason: Defines user-visible account setup row labels, actions, statuses, and return behavior.
depends_on: [MA-040, MA-043, MA-044, MA-064, MS-121]
unblocks: [F3-411, UCC-106, WM-041, ATS-020]
acceptance_criteria:
  - First-run setup rows preserve the logged-in versus Ready distinction from MA-040.
  - "`Connected` is displayed only when the backing readiness projection is safe for that label and never replaces canonical readiness state."
  - Setup cancel, failed auth, or failed validation returns to the originating onboarding or Free Models context with a refreshed state when possible.
  - Free Models setup continues to delegate to the underlying provider/account setup flow and keeps saved top-10 order unchanged.
  - Provider-specific setup failures remain distinguishable for support/detail surfaces while normal onboarding shows friendly copy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run provider setup return-context fixtures
  - future account readiness label mapping fixtures
risk_class: account_setup_ready_state_drift
reasoning_tier: high
context_scope: first_run_provider_account_setup
implementation_surfaces:
  - Plans/Multi-Account.md
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
node_compile_hint:
  mode: first_run_account_setup_rows_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0010
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0033
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
source_atom_ids: [atom-0010, atom-0016, atom-0033, atom-0034, atom-0040, atom-0041, atom-0042, atom-0044, atom-0047]
decision_refs: [dec-0004, dec-0005, dec-0008]
preserved_exact_tokens:
  - "Logged in is not ready"
  - "Sign in"
  - "Set up provider"
  - "Reconnect"
  - "Connected"
  - "Needs sign-in"
  - "Could not connect"
  - "Use this provider"
  - "originating Free Models row/list"
  - "Provider setup is not finished"
  - "Doctor remains as a health summary"
negative_constraints:
  - Do not collapse logged-in, entitlement, billing, partial setup, workspace trust, route proof, or validation states into Ready.
  - Do not collect or store underlying provider credentials inside the Free Models provider.
  - Do not strand users away from the originating onboarding wizard, Planning Wizard limited-state reminder, or Free Models row/list after setup.
  - Do not silently reorder or mutate saved top-10 order after provider setup refresh.
  - Do not flatten provider setup failures into a generic provider error.
owner_hints:
  - Plans/Multi-Account.md
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Contracts_V0.md
```
