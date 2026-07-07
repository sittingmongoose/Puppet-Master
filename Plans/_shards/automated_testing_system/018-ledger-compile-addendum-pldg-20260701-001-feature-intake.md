# Shard 018: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/Automated_Testing_System.md`

Source lines: L1616-L1714

Source SHA256: `dc6bbd08ba743899b05f7b1c013c133f4ca919cbf2e04068a2403fd6aac0330a`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles first-run onboarding, Doctor/Health, Teacher handoff, and Planning Wizard landing acceptance coverage from bootstrap ledger `pldg-20260701-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### ATS-020 - First-Run Onboarding Doctor And Planning Wizard Acceptance Tests

```yaml
plan_unit_id: ATS-020
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated acceptance coverage for the Doctor/onboarding rework includes the first-run four-screen sequence, accepted
  copy, skippable setup behavior, paid-provider-before-Free-Models sequencing, compact provider rows, Teacher handoff,
  structured `onboarding_setup_state`, Planning Wizard limited-state landing, and Doctor/Health no-false-green behavior.
  Tests cover setup completion, setup skip, provider setup failure, auth/logged-in-but-not-ready state, Free Models review
  and defer paths, Teacher copy with no provider route, and Health `Set up provider` return routing. Regression coverage
  also proves MCP/server degraded or unavailable rows remain visible in GUI/Doctor surfaces rather than being silently
  hidden after transient failure, and FileSafe initialization/readiness follows fail-closed owner canon rather than stale
  graceful-degradation wording.
gui_related: true
gui_classification_reason: Validates user-visible first-run screens, copy, row states, Teacher copy, Health states, and Planning Wizard landing presentation.
depends_on: [F3-411, MS-122, MA-066, ACD-431, UCC-106, CV-305, PWIZ-017, WM-041, T-088, T-089, MI-028, MI-029, F2-155]
unblocks: []
acceptance_criteria:
  - Tests verify the accepted screen order and exact first-run copy/action labels.
  - Tests verify `Skip for now` opens Planning Wizard in limited setup state and does not mark Health/Doctor Ready.
  - Tests verify the exact `Fee models` token and Free Models appear only after the paid-provider prompt and do not use recommendation/coding-strength language.
  - Tests verify `Connected` does not collapse logged-in/auth success into Ready without owner readiness proof.
  - Tests verify the Teacher handoff copy is visible and degraded provider state is named when no usable provider route exists.
  - Tests verify onboarding_setup_state contains the accepted minimum fields and excludes raw transcripts, credentials, secrets, and raw diagnostics.
  - Tests verify MCP/server unavailable rows and FileSafe fail-closed readiness remain visible Health/Doctor concerns when relevant.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run onboarding GUI acceptance fixture suite
  - future Doctor/Health no-false-green fixture suite
  - future onboarding_setup_state contract fixture
risk_class: first_run_acceptance_gap
reasoning_tier: high
context_scope: first_run_onboarding_doctor_acceptance
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - future onboarding/Health/Planning Wizard acceptance tests
node_compile_hint:
  mode: first_run_onboarding_acceptance_tests
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0007
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0008
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0043
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
source_atom_ids: [atom-0007, atom-0008, atom-0015, atom-0016, atom-0037, atom-0038, atom-0040, atom-0041, atom-0042, atom-0043, atom-0044, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0003, dec-0004, dec-0005, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
  - "Connect Puppet Master to an AI provider"
  - "Set up a paid provider"
  - "Optional: Free Models"
  - "Fee models"
  - "You are ready to plan"
  - "Skip for now"
  - "Provider setup is not finished"
  - "Need help later? Ask Assistant Chat for Teacher. Try: 'What does this mean?' or 'Show me how to use this page.' Teacher explains the current screen from chat."
  - "onboarding_setup_state"
  - "Connected"
  - "Needs sign-in"
  - "Could not connect"
  - "Ready"
  - "Needs setup"
  - "Needs attention"
  - "hide if server fails"
  - "fail-closed"
negative_constraints:
  - Do not call this feature acceptance-covered without screen order, skip state, Teacher copy, Free Models sequencing, and Doctor no-false-green tests.
  - Do not hide critical blockers just to make onboarding look simpler.
  - Do not treat `Connected` or `Logged in` as equivalent to Ready.
  - Do not silently hide MCP/server degraded or unavailable rows from GUI/Doctor surfaces.
  - Do not allow stale FileSafe graceful-degradation wording to permit disabled guards as Ready.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
  - Plans/Planning_Wizard.md
  - Plans/assistant-chat-design.md
  - Plans/Contracts_V0.md
```
