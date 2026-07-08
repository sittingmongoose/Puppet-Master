# Shard 034: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Contracts_V0.md`

Source lines: L19277-L19360

Source SHA256: `4ba6e6824049cf7d730459e43feba01ba802800f526dca6d1d8aa946b51caad3`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles the first-run onboarding handoff state contract from bootstrap ledger `pldg-20260701-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### CV-305 - Onboarding Setup State And Health Summary Contract

```yaml
plan_unit_id: CV-305
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  First-run onboarding passes a structured `onboarding_setup_state` to Planning Wizard, Health/Doctor projections, and
  command/wiring consumers rather than copying a raw onboarding transcript. The minimum fields are `setup_completed`,
  `setup_skipped`, `connected_provider_count`, `provider_warning_count`, `free_models_reviewed`, and
  `health_summary_state`. `health_summary_state` uses canonical machine values such as `ready`, `needs_setup`,
  `needs_attention`, and `could_not_connect`, with GUI labels `Ready`, `Needs setup`, `Needs attention`, and `Could not
  connect`. Optional fields may carry return context, limited setup reason, last setup action, source surface,
  `assistant_chat_handoff_seed`, and provider/account refs, but the record never carries raw credentials, provider-native error payloads, secrets, raw
  diagnostics, source hashes, upstream refs, or an unbounded setup transcript.
gui_related: false
gui_classification_reason: Defines structured state fields and contract payload boundaries consumed by GUI surfaces, but not visual presentation itself.
depends_on: [MA-040, MS-121]
unblocks: [F3-411, UCC-106, PWIZ-017, WM-041, ATS-020]
acceptance_criteria:
  - "`onboarding_setup_state` includes the accepted minimum fields."
  - Setup skipped and setup completed can both be represented without inferring false readiness.
  - Health summary labels map to canonical machine values and owner readiness facts.
  - Planning Wizard receives structured state, not a raw onboarding transcript.
  - No secrets, credentials, raw diagnostics, raw provider error payloads, or unbounded transcripts are stored in the handoff payload.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future onboarding_setup_state schema fixtures
  - future first-run skip and provider-warning handoff fixtures
risk_class: onboarding_handoff_state_drift
reasoning_tier: high
context_scope: first_run_onboarding_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Planning_Wizard.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: onboarding_setup_state_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
source_atom_ids: [atom-0034, atom-0042, atom-0044, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0005, dec-0007, dec-0008]
preserved_exact_tokens:
  - "onboarding_setup_state"
  - "setup_completed"
  - "setup_skipped"
  - "connected_provider_count"
  - "provider_warning_count"
  - "free_models_reviewed"
  - "health_summary_state"
  - "assistant_chat_handoff_seed"
  - "Ready"
  - "Needs setup"
  - "Needs attention"
  - "Could not connect"
  - "Provider setup is not finished"
negative_constraints:
  - Do not use the raw onboarding transcript as the sole Planning Wizard handoff.
  - Do not store raw credentials, secrets, provider-native error payloads, raw diagnostics, source hashes, upstream refs, or unbounded setup transcripts in onboarding_setup_state.
  - Do not mark Health/Doctor as Ready when provider setup was skipped or canonical owner readiness is unresolved.
  - Do not create WorkNodes, NodeSeeds, executable queues, or runtime/build surfaces as part of first-run handoff.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Planning_Wizard.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
```
