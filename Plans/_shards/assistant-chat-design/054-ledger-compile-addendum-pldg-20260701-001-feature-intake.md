# Shard 054: Ledger Compile Addendum - pldg-20260701-001-feature-intake

Source: `Plans/assistant-chat-design.md`

Source lines: L23209-L23288

Source SHA256: `db0b94c750c7b812ceaa0c9bafd22d6e571af57eae0b7e4ecd0a3a8b7442f385`

---

## Ledger Compile Addendum - pldg-20260701-001-feature-intake

This addendum compiles the first-run Teacher handoff copy and Assistant Chat boundary from bootstrap ledger `pldg-20260701-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or a governance seal.

### ACD-431 - First-Run Teacher Handoff From Onboarding

```yaml
plan_unit_id: ACD-431
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  First-run onboarding tells users that Assistant Chat can access Teacher without frontloading a full Teacher walkthrough
  or requiring slash-command knowledge. The accepted onboarding handoff copy is `Need help later? Ask Assistant Chat for
  Teacher. Try: 'What does this mean?' or 'Show me how to use this page.' Teacher explains the current screen from
  chat.` Natural-language Teacher access remains mandatory for discovery, `/teach` remains an explicit route, and any
  clicked onboarding Teacher affordance opens or selects a Teacher-capable Assistant Chat thread with current-surface
  context. One-off Teacher guidance from onboarding does not become durable Teach memory unless the user explicitly
  confirms persistence. If provider setup was skipped or no usable provider route exists, Assistant Chat names the
  degraded/limited state instead of promising Teacher can answer normally.
gui_related: true
gui_classification_reason: Defines visible Assistant Chat/Teacher onboarding copy, thread launch behavior, and degraded-state user messaging.
depends_on: [ACD-426, UCC-102, CS-053, MS-117]
unblocks: [F3-411, UCC-106, WM-041, ATS-020]
acceptance_criteria:
  - The accepted Teacher handoff copy is present in first-run onboarding.
  - Users can discover Teacher through natural language examples without knowing `/teach`.
  - Onboarding does not launch a full Teacher walkthrough by default.
  - Teacher handoff preserves current-surface context and Assistant Chat thread behavior from ACD-426.
  - Provider-unavailable or skipped-setup state is named when it limits Teacher behavior.
  - One-off Teacher guidance is not auto-saved as Teach memory.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future onboarding Teacher handoff copy fixture
  - future skipped-provider Teacher degraded-state fixture
risk_class: teacher_onboarding_overexposure
reasoning_tier: standard
context_scope: first_run_teacher_handoff
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - future Assistant Chat Teacher handoff affordance
node_compile_hint:
  mode: onboarding_teacher_handoff_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0007
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0035
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0043
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/records/design_atoms.jsonl:atom-0047
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/onboarding_doctor_user_decisions_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/assistant_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/user_accepts_provider_wizard_proposal_20260701.json
  - Plans/ledgers/v2/pldg-20260701-001-feature-intake/source_shards/doctor_onboarding_plan_review_20260701.json
source_atom_ids: [atom-0007, atom-0035, atom-0043, atom-0047]
decision_refs: [dec-0006, dec-0008]
preserved_exact_tokens:
  - "assistant chat to access teacher"
  - "teacher who can tell them anything they need to know"
  - "Need help later? Ask Assistant Chat for Teacher. Try: 'What does this mean?' or 'Show me how to use this page.' Teacher explains the current screen from chat."
  - "What does this mean?"
  - "Show me how to use this page."
  - "/teach"
  - "Teacher"
  - "current screen"
  - "assistant features may need a provider before they can run"
negative_constraints:
  - Do not frontload a full Teacher walkthrough in the setup wizard.
  - Do not require users to know `/teach` before discovering Teacher.
  - Do not auto-save one-off Teacher guidance as taught memory.
  - Do not promise Teacher can operate normally when no provider is connected or no usable provider route exists.
  - Do not launch Teacher without current-surface context.
  - Do not invent a separate Teach-only chat surface when the Assistant Chat thread model can carry Teacher.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
```
