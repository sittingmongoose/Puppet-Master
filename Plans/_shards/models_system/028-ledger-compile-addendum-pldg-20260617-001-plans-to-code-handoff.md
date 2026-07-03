# Shard 028: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Models_System.md`

Source lines: L7598-L7726

Source SHA256: `4bd69c6f044c0aea4d6adde610a5db4b320043e581d7818709fc68e1d359b25e`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### MS-110 - Condensed Plans-To-Code Model Settings

```yaml
plan_unit_id: MS-110
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Models_System owns the six user-facing model settings for plans-to-code automation: Default Model, Overseer Model, Worker Model, GUI / Frontend Worker Model, High-Effort Worker Model, and Auditor Model. Default Model covers assistant chat, normal Planning Wizard conversation, ordinary research/browser lookup, and fallback behavior. Overseer Model covers Planning Wizard ledger-to-Plans conversion, PRD Builder structured conversion, Plans-to-WorkNode-request compilation, seam/split/merge decisions, execution supervision, graph patch recommendations, and blocked-state reasoning. Worker Model handles normal WorkNode implementation; GUI / Frontend Worker Model handles GUI/frontend/UX/layout/visual WorkNodes; High-Effort Worker Model handles difficult, broad, repo-wide, high-risk, or high-reasoning WorkNodes; Auditor Model owns the Auditor audit-to-repair loop, verification, certification, quality gates, and evidence review. The loop repeats audit, bounded repair, and re-audit, also recorded by the legacy source token audit/repair/audit, until completion is certified or a critical block or authority boundary stops the loop. Executor has no user-facing Executor Model setting because Executor is deterministic scheduler/runtime machinery and Overseer handles execution-level reasoning around it.
  High-Effort Worker Model covers repo-wide reasoning explicitly, and Executor deterministic runtime behavior stays outside user-facing model settings.
gui_related: true
gui_classification_reason: This unit defines user-facing Settings labels and GUI/frontend model routing labels.
depends_on: [MS-109]
unblocks: [F3-396, EP-100, OP-023, GRS-028]
acceptance_criteria:
  - Exactly six user-facing model settings are exposed for this flow unless a later advanced override is accepted.
  - Plan Compiler, Planning Wizard ledger-to-Plans, and PRD Builder structured conversion map to Overseer Model.
  - Old fixed validation-pass model settings are replaced by Auditor Model and an Auditor audit-to-repair loop where this compile touches the concept.
  - Legacy `validation_pass_report` artifact family names and old Pass 1 / Pass 2 / Pass 3 names remain Project Output/Chain Wizard lineage or compatibility aliases only; they are not user-facing validation-pass model selectors or active process stages.
  - Executor remains deterministic runtime/scheduler machinery and does not gain an Executor Model setting.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - future Settings model-role review
risk_class: model_role_drift
reasoning_tier: high
context_scope: plans_to_code_model_settings
implementation_surfaces: [Plans/Models_System.md, Plans/FinalGUISpec.md, Plans/Executor_Protocol.md, Plans/Goal_Runtime_System.md]
node_compile_hint: {mode: model_settings_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0018
  - pldg-20260617-001-plans-to-code-handoff:atom-0019
  - pldg-20260617-001-plans-to-code-handoff:atom-0020
  - pldg-20260617-001-plans-to-code-handoff:atom-0021
  - pldg-20260617-001-plans-to-code-handoff:atom-0022
  - pldg-20260617-001-plans-to-code-handoff:atom-0023
  - pldg-20260617-001-plans-to-code-handoff:dec-0006
  - pldg-20260617-001-plans-to-code-handoff:dec-0007
  - pldg-20260617-001-plans-to-code-handoff:dec-0008
  - pldg-20260617-001-plans-to-code-handoff:corr-0001
  - pldg-20260617-001-plans-to-code-handoff:corr-0002
  - pldg-20260617-001-plans-to-code-handoff:corr-0003
preserved_exact_tokens:
  - "Default Model"
  - "Overseer Model"
  - "Worker Model"
  - "GUI / Frontend Worker Model"
  - "High-Effort Worker Model"
  - "Auditor Model"
  - "assistant chat"
  - "Plan Wizard conversation"
  - "research/browser lookup"
  - "ledger-to-Plans"
  - "PRD Builder"
  - "Plans-to-WorkNode"
  - "execution supervision"
  - "graph patch recommendations"
  - "repo-wide reasoning"
  - "Auditor audit-to-repair loop"
  - "audit/repair/audit"
  - "critical block"
  - "No Executor Model"
  - "Executor deterministic"
negative_constraints:
  - Do not expose a long list of internal subrole settings.
  - Do not create a separate user-facing Plan Compiler Model unless later added as advanced override.
  - Do not expose legacy Pass 1 / Pass 2 / Pass 3 Plan Wizard model settings or active stages; those names may survive only as legacy compatibility aliases.
  - Do not call the deterministic scheduler a model-backed Executor agent.
stale_retired_dispositions:
  - "Plan Wizard conversation is retained only as a legacy source token from the plans-to-code handoff cycle; current model-setting prose uses Planning Wizard."
owner_hints:
  - Plans/Models_System.md
  - Plans/FinalGUISpec.md
  - Plans/Executor_Protocol.md
  - Plans/Goal_Runtime_System.md
```

### MS-111 - Plans-To-Code Model Resolution Receipt

```yaml
plan_unit_id: MS-111
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: >-
  Every dispatched WorkNode and every plans-to-code role resolution records a model resolution receipt with requested_lane, requested_model_profile, effective_model_profile, fallback_used, fallback_reason, and capability_checks. WorkNode requests carry work_type, gui_related, frontend_related, effort class, reasoning tier, context size, validation cost, risk class, authority risk, user-visible risk, and capability lane metadata so native routing can choose Worker Model, GUI / Frontend Worker Model, High-Effort Worker Model, Auditor Model, or Overseer Model without exposing Codex-only external GUI-agent CLI bridge settings in built Puppet Master.
  The receipt is the native provider/model routing proof for built Puppet Master and preserves effort_class and capability_lane in the canonical routing body.
gui_related: false
gui_classification_reason: This unit defines backend model-resolution receipts and routing metadata; visible labels are consumed by FinalGUISpec.
depends_on: [MS-110]
unblocks: [EP-100, PNC-013, RAP-029, CV-289]
acceptance_criteria:
  - WorkNode dispatch and plans-to-code roles emit requested/effective model profile, fallback, and capability check evidence.
  - GUI/frontend and high-effort routing use native model lanes in built Puppet Master.
  - Codex bootstrap external GUI-agent CLI request artifacts remain bootstrap-only and are not exposed as built product Settings.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: model_resolution_opacity
reasoning_tier: high
context_scope: worknode_model_resolution
implementation_surfaces: [Plans/Models_System.md, Plans/plans_to_code_handoff.schema.json, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: model_resolution_receipt_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0012
  - pldg-20260617-001-plans-to-code-handoff:atom-0017
  - pldg-20260617-001-plans-to-code-handoff:atom-0024
  - pldg-20260617-001-plans-to-code-handoff:dec-0009
  - pldg-20260617-001-plans-to-code-handoff:dec-0010
  - pldg-20260617-001-plans-to-code-handoff:corr-0004
preserved_exact_tokens:
  - "GUI / Frontend Worker Model"
  - "native provider/model routing"
  - "requested_model_profile"
  - "effective_model_profile"
  - "fallback_used"
  - "capability_checks"
  - "capability_lane"
negative_constraints:
  - No Antigravity/Claude Code/Cursor/OpenCode CLI bridge setting in built Puppet Master.
owner_hints:
  - Plans/Models_System.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Executor_Protocol.md
