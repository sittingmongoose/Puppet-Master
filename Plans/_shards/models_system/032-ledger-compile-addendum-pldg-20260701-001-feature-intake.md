# Shard 032: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Models_System.md`

Source lines: L8296-L8446

Source SHA256: `d450764365ab58d529afb744c047514616f51a82bdf31cc6fffb224edbd8e57b`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run provider and Free Models sequencing from bootstrap ledger `pldg-20260701-001-feature-intake` into Models_System ownership. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### MS-122 - First-Run Paid Provider And Free Models Sequencing

```yaml
plan_unit_id: MS-122
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  First-run onboarding initializes provider/model setup with a paid-provider-first posture. The GUI may use friendly
  row labels such as `Connected`, `Needs sign-in`, and `Could not connect`, but `Connected` is presentation shorthand
  only and must not collapse authentication, entitlement, billing, workspace trust, route validation, quota, or
  provider-readiness proof into `Ready`. `Free Models` and the exact accepted token `Fee models` appear after the
  paid-provider prompt, not before it. Free Models setup and top-10 behavior continue to follow MS-120 and MS-121:
  the top-10 list remains global across all providers/models, paid providers are preferred by default unless the user
  explicitly ranks Free Models above them, setup delegates to the underlying provider/account flow, and current scope
  uses no recommendation, quality-rank, coding-strength, online-review, local-learning, or benchmark/probe-calibration
  language.
gui_related: true
gui_classification_reason: Governs user-visible first-run provider/model sequencing, Free Models placement, top-10 copy, and readiness labels.
depends_on: [MS-120, MS-121, MA-040, MA-064, F3-409]
unblocks: [F3-411, MA-066, ATS-020]
acceptance_criteria:
  - Paid-provider setup is prompted before Free Models in first-run onboarding.
  - Friendly `Connected` copy is not treated as proof that the provider is fully Ready unless owner readiness contracts prove it.
  - Free Models top-10 and fallback behavior continues to preserve paid-first defaults and explicit user ordering.
  - Free Models setup labels and availability reasons map through MS-121 and underlying provider/account state.
  - Recommendation, quality-rank, coding-strength, online-review, local-learning, and benchmark/probe-calibration language remains absent from this first-run flow.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run provider sequencing fixtures
  - future Free Models paid-first/top-10 copy fixtures
risk_class: provider_readiness_false_ready
reasoning_tier: high
context_scope: first_run_provider_model_setup
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: first_run_provider_model_sequence_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0033
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0039
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
source_atom_ids: [atom-0016, atom-0033, atom-0038, atom-0039, atom-0040, atom-0041, atom-0047]
decision_refs: [dec-0004, dec-0008]
preserved_exact_tokens:
  - "Fee models"
  - "Free Models"
  - "paid providers"
  - "Start with a paid provider for the most reliable setup"
  - "Set up a paid provider"
  - "Connected"
  - "Needs sign-in"
  - "Could not connect"
  - "Optional: Free Models"
  - "top 10"
  - "paid providers should be preferred over the free models unless the user configured the free models above the paid ones in the top 10 list"
  - "assistant features may need a provider before they can run"
negative_constraints:
  - Do not show Free Models before the paid-provider prompt.
  - Do not make Free Models the primary first-run path unless Jared later corrects this decision.
  - Do not treat `Connected` or `Logged in` as equivalent to Ready.
  - Do not silently fall back to unrelated paid/costed routes.
  - Do not include recommended models, `Recommended for this section`, recommendation sorting/highlighting, recommendation confidence labels, local recommendation learning, online review lookup, or benchmark/probe calibration.
  - Do not silently insert or reorder Free Models in the saved top-10 list.
owner_hints:
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
```

### MS-121 - Free Models Availability Reason Model And Setup Eligibility

```yaml
plan_unit_id: MS-121
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Free Models availability states are derived from underlying provider/account/model/setup/quota/policy facts and exposed through compact friendly labels while retaining canonical skip and pressure reasons. Normal unavailable reason priority is `Needs sign-in`, `Rate limited`, `Provider offline`, `No longer free`, `Update issue`, then `Unknown`, with `Multiple issues` when no single reason dominates. Setup actions delegate to the exact underlying PM provider/account setup surface, carry return context to the originating Free Models row/list, refresh eligibility on return, and keep saved top-10 order unchanged.
gui_related: true
gui_classification_reason: Defines user-visible availability labels, setup actions, compact row reasons, and detail expansion behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Compact rows show one top plain reason or `Multiple issues`, while expanded details may show current skip reason, underlying provider/account, last checked time, last successful route if known, cooldown/Retry now state if known, and source/ref.
  - "Setup labels map to account state: `Sign in`, `Set up provider`, or `Reconnect`."
  - Setup cancel or failed auth returns to the originating Free Models row/list, keeps saved top-10 unchanged, refreshes eligibility if possible, and shows `Still needs sign-in` or `Could not connect` without separate notification.
  - Friendly availability labels map to canonical failure/pressure/receipt records and never replace source identity.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models availability reason mapping fixtures
  - Free Models setup return-context fixtures
risk_class: availability_reason_mapping_drift
reasoning_tier: high
context_scope: free_models_availability_and_setup
implementation_surfaces:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: free_models_availability_setup_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0084, atom-0085, atom-0086, atom-0088, atom-0089, atom-0090, atom-0114, atom-0115, atom-0119, atom-0120, atom-0123, atom-0127, atom-0130, atom-0132, atom-0134, atom-0136, atom-0161, atom-0163, atom-0165, atom-0167, atom-0169, atom-0170, atom-0173, atom-0174, atom-0228, atom-0232, atom-0236, atom-0240, atom-0244, atom-0248, atom-0251, atom-0255, atom-0257, atom-0259, atom-0261, atom-0263, atom-0265, atom-0266, atom-0267, atom-0269, atom-0270, atom-0271, atom-0285, atom-0286]
preserved_exact_tokens:
  - "Needs sign-in"
  - "Rate limited"
  - "Provider offline"
  - "No longer free"
  - "Update issue"
  - "Unknown"
  - "Multiple issues"
  - "Set up provider"
  - "Sign in"
  - "Reconnect"
  - "Still needs sign-in"
  - "Could not connect"
  - "originating Free Models row/list"
negative_constraints:
  - Do not collect or store underlying provider credentials inside the Free Models provider.
  - Do not expose import/runtime jargon in the normal Free Models setup path.
  - Do not create separate notifications for setup cancel or failed auth returns.
  - Do not show raw provider error payloads in normal expanded availability rows.
owner_hints:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
```
