# Shard 051: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/FinalGUISpec.md`

Source lines: L26475-L26630

Source SHA256: `c31d1756cca31208e21ecbc6c4e44ecd72447596cb5abcf2230eefdee16ecc2f`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles the accepted Doctor/onboarding first-run GUI packet from bootstrap ledger `pldg-20260701-001-feature-intake`. It preserves `Concepts/PMConcept.html` as non-final GUI concept lineage only and does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### F3-411 - First-Run Provider Onboarding And Doctor Health GUI

```yaml
plan_unit_id: F3-411
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  First-run onboarding for newbie vibecoders appears as a separate modal/wizard before the user enters the full shell,
  remains skippable guided setup, and keeps the normal path focused on provider setup rather than a full Settings tour,
  dense Home shell, or product training sequence. The accepted four-screen order is `Connect Puppet Master to an AI
  provider`, `Set up a paid provider`, `Optional: Free Models`, and `You are ready to plan`. The first screen uses the
  body copy `Puppet Master needs an AI provider account before it can plan or code with you. Start with a paid provider
  for the most reliable setup. You can skip this and come back later.` with actions `Set up a paid provider` and `Skip
  for now`. The paid-provider screen presents compact rows with one primary action and friendly row labels such as
  `Use this provider`, `Sign in`, `Set up provider`, `Reconnect`, `Connected`, `Needs sign-in`, and `Could not connect`.
  `Optional: Free Models` appears only after the paid-provider prompt and offers `Review Free Models`, `Maybe later`, and
  `Continue to Planning Wizard` without recommendation, quality-rank, coding-strength, online-review, local-learning, or
  benchmark/probe-calibration language. The final setup screen says `Need help later? Ask Assistant Chat for Teacher.
  Try: 'What does this mean?' or 'Show me how to use this page.' Teacher explains the current screen from chat.` and
  routes `Open Planning Wizard` as the first full app page. `Skip for now` routes directly to Planning Wizard in limited
  setup state with the copy `Provider setup is not finished. You can still open Planning Wizard, but assistant features
  may need a provider before they can run.` Doctor remains a compact Health summary after onboarding with labels `Ready`,
  `Needs setup`, `Needs attention`, and `Could not connect`; it shows the simplest next action first, keeps critical
  blockers visible, and puts advanced diagnostics behind details/support.
gui_related: true
gui_classification_reason: This PlanUnit defines first-run wizard screens, copy, actions, visible provider rows, Doctor/Health labels, and GUI presentation rules.
depends_on: [F3-409, MA-040, MA-064, MS-120, MS-121, ACD-426, UCC-102, CS-053, T-088, MI-028, F2-155]
unblocks: [MS-122, MA-066, ACD-431, UCC-106, CV-305, PWIZ-017, WM-041, ATS-020]
acceptance_criteria:
  - First-run setup is a separate modal/wizard before the full shell and is skippable.
  - The four accepted screens appear in order with the accepted titles, body copy, and actions.
  - Free Models and the exact token `Fee models` remain after the paid-provider prompt, not before it.
  - Normal onboarding hides provider/runtime jargon, raw diagnostics, source hashes, upstream refs, route/probe evidence, quota/debug internals, and Settings owner-doc structure.
  - Critical blockers remain visible with one plain next action; hidden internals do not produce a false-green state.
  - Doctor/Health remains a compact summary consumer surface and does not become a generic Doctor registry/result aggregator or setup wizard clone.
  - MCP/server degraded or unavailable states and FileSafe fail-closed readiness are visible as Health/Doctor concerns when relevant, not silently hidden.
  - PMConcept.html visual lineage is treated as concept evidence only and does not become canonical HTML/CSS/demo implementation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future first-run provider wizard screen-order and copy fixtures
  - future Doctor/Health no-false-green status fixtures
  - future responsive and overflow checks for compact provider rows
risk_class: first_run_gui_false_ready
reasoning_tier: high
context_scope: first_run_onboarding_doctor_health_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - future native Rust + Slint first-run onboarding wizard
  - future Settings > Health summary
node_compile_hint:
  mode: first_run_provider_onboarding_gui_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0006
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0007
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0008
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0010
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0016
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0024
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0025
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0027
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0029
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0031
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0032
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0033
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0034
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0035
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0036
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0037
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0038
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0039
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0041
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0043
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0045
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/decisions.jsonl:dec-0003
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/decisions.jsonl:dec-0004
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/decisions.jsonl:dec-0005
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/decisions.jsonl:dec-0006
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/decisions.jsonl:dec-0007
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/decisions.jsonl:dec-0008
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/pmconcept_gui_reference_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
source_atom_ids: [atom-0006, atom-0007, atom-0008, atom-0010, atom-0015, atom-0016, atom-0024, atom-0025, atom-0027, atom-0029, atom-0031, atom-0032, atom-0033, atom-0034, atom-0035, atom-0036, atom-0037, atom-0038, atom-0039, atom-0040, atom-0041, atom-0042, atom-0043, atom-0044, atom-0045, atom-0046, atom-0047]
decision_refs: [dec-0001, dec-0002, dec-0003, dec-0004, dec-0005, dec-0006, dec-0007, dec-0008]
preserved_exact_tokens:
  - "vibecoders who don’t know how to do any of this stuff"
  - "newbie friendly"
  - "separate modal/wizard before the user enters the full shell"
  - "Skippable guided setup"
  - "Connect Puppet Master to an AI provider"
  - "Puppet Master needs an AI provider account before it can plan or code with you. Start with a paid provider for the most reliable setup. You can skip this and come back later."
  - "Set up a paid provider"
  - "Skip for now"
  - "Use this provider"
  - "Sign in"
  - "Set up provider"
  - "Reconnect"
  - "Connected"
  - "Needs sign-in"
  - "Could not connect"
  - "Fee models"
  - "Free Models"
  - "Optional: Free Models"
  - "Review Free Models"
  - "Maybe later"
  - "Continue to Planning Wizard"
  - "You are ready to plan"
  - "Need help later? Ask Assistant Chat for Teacher. Try: 'What does this mean?' or 'Show me how to use this page.' Teacher explains the current screen from chat."
  - "Open Planning Wizard"
  - "Provider setup is not finished. You can still open Planning Wizard, but assistant features may need a provider before they can run."
  - "Doctor remains as a health summary"
  - "Ready"
  - "Needs setup"
  - "Needs attention"
  - "advanced diagnostics behind details/support"
negative_constraints:
  - Do not make the full shell the initial required onboarding context.
  - Do not turn first-run into a mini Settings app.
  - Do not add a full product tour before the user reaches Planning Wizard.
  - Do not expose model/provider internals, raw provider error payloads, raw diagnostics, source hashes, upstream refs, or route/probe evidence in the default first-run path.
  - Do not introduce Free Models before first prompting the user to set up paid providers.
  - Do not use recommendation, quality-rank, coding-strength, online-review, local-learning, or benchmark/probe-calibration language.
  - Do not silently insert or reorder Free Models in the saved top-10 list.
  - Do not route skip to the dense Home shell by default.
  - Do not mark Doctor/Health as Ready when provider setup was skipped or when owner readiness is degraded, unavailable, or fail-closed.
  - Do not define a new generic Doctor registry/result aggregator in this redesign.
  - Do not frontload a full Teacher walkthrough in the setup wizard.
  - Do not require slash-command knowledge to access Teacher help from Assistant Chat.
  - Do not treat PMConcept.html as final GUI canon or copy its HTML/CSS/demo code.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Contracts_V0.md
  - Plans/Planning_Wizard.md
  - Plans/Automated_Testing_System.md
```
