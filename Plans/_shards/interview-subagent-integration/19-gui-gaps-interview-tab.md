## GUI gaps: Interview tab
The Config view Interview tab is the canonical execution-affecting control surface for interview behavior. This section replaces the prior “gaps” framing with the final runtime contract.

### Activity and progress visibility

### Shared question-system alignment
Interview question UX is the baseline visual and behavioral pattern for the shared PM question system.

Rules:
- Interview may emit one question or a structured questionnaire
- suggested-option chips and `Something else` / freeform remain baseline affordances when applicable
- question identity remains stable across interview, assistant clarification, and requirements-builder clarification flows
- the shared `question` tool contract can drive Interview-style multi-question flows without inventing Interview-only payload shapes

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/chain-wizard-flexibility.md

Interview document generation and Multi-Pass Review MUST surface the same underlying progress stream in two synchronized surfaces when the user is on the Interview page:
- interviewer chat is the primary streaming surface
- the Interview page agent activity pane mirrors the same event source in structured form

The agent activity pane is also used on the wizard / requirements page when Builder or Multi-Pass Review is triggered there. Redundant display on the Interview page is intentional and acceptable because both surfaces subscribe to the same normalized event projection.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Widget_System.md

The Interview page MUST also show a status strip with:
- current step text
- determinate progress when total work is known
- indeterminate progress otherwise
- canonical states: `idle`, `generating`, `reviewing`, `paused`, `cancelling`, `cancelled`, `interrupted`, `complete`, `error`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/chain-wizard-flexibility.md

Progress stale rule:
- stale threshold is 30 seconds since the last progress event
- UI copy is `Progress stalled — last update [N]s ago`
- config key is `ui.progress.stale_threshold_s`, default `30`
- the same rule applies to interview, orchestrator, and chain-wizard progress surfaces

### Pause, resume, and cancel
Button labels are canonical and shared across interview, orchestrator, and chain-wizard:
- `Resume`
- `Pause`
- `Cancel`

Button order is `[Resume] [Pause] [Cancel]`.
- `Resume` is disabled while running
- `Pause` is disabled while paused
- `Cancel` remains enabled while a run is in progress
- cancel requires confirmation and does not apply pending changes
- interrupted runs restore the same CTA set so the user can resume from checkpoint or start over

### Runtime identity visibility
For each interview stage, the UI MUST display:
- `requested_persona_id`
- `effective_persona_id`
- `selection_reason`
- `provider`
- `model`

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md

If a requested control becomes unavailable after capability filtering, the UI shows it as skipped or disabled with a reason; Interview MUST NOT hide runtime substitutions that would be visible on Builder or Assistant surfaces.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/assistant-chat-design.md

### Interview execution-affecting config wiring
`InterviewGuiConfig` and `InterviewOrchestratorConfig` MUST expose and use the following execution-affecting fields:

| Field | Canonical behavior |
|---|---|
| `min_questions_per_phase` | Default `1`. Phase completion cannot occur below this threshold. |
| `max_questions_per_phase` | Default existing configured maximum; supports `Unlimited` as an explicit UI state rather than relying on a hidden hardcoded limit. |
| `require_architecture_confirmation` | Gates architecture-phase completion and any downstream transitions that require explicit architectural confirmation. |
| `vision_provider` | Passed through at runtime now, even if specific image workflows are expanded later. |
| `platform`, `model`, `reasoning_level`, `backup_platforms`, `first_principles`, `output_dir`, `generate_playwright_requirements`, `generate_initial_agents_md` | Already exposed controls remain execution-affecting and MUST flow into the runtime config built at start. |

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/WorktreeGitImprovement.md

Question-limit semantics:
- hardcoded `3/8` behavior is retired
- prompts and phase-manager logic receive the configured min/max values
- phase-complete logic rejects completion below `min_questions_per_phase`
- when a max is configured, the phase uses soft-cap behavior until the configured completion logic requires closure
- when `Unlimited` is selected, no synthetic hard maximum is applied

### Multi-Pass Review configuration
Multi-Pass Review is execution-affecting and belongs in the Interview run config.

Canonical fields:
- `enabled` (default `false`)
- reviewer count / number of reviews (default `3` for Interview)
- `max_subagents_spawn` (default `3`, warning required because token usage can spike)
- `use_different_models`
- `model_provider_list` drawn from node config by default
- final approval gate state and findings-summary preview

Persistence:
- interview key = `multi_pass:interview:config`
- requirements-doc-builder key = `multi_pass:requirements:config`

Final approval state MUST persist so interrupted runs restore to the findings summary and `Accept | Reject | Edit` decision point.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### Preview and document surfaces
The Interview page preview section shows:
- Multi-Pass findings summary
- final approval gate (`Accept | Reject | Edit`)
- read-only rendered Plan Graph with explicit notice that plan-graph edits occur through Assistant rather than in-place here

A separate embedded document pane is required for human-readable interview artifacts and is distinct from the activity pane.

### Interview-phase verification mirror
Interview phases mirror orchestrator node verification:
- start = config wiring + readiness + sequence validation
- end = config wiring re-check + acceptance + quality review

Interview-phase quality criteria are:
- document completeness
- decision clarity
- unresolved clarification handling
- readiness for downstream plan generation and packetization

### Recovery and restore behavior
Recovery persistence MUST capture:
- `awaiting_final_approval`
- current run identifier and step/document indices needed for resume
- selected document / pane context when restorable

Restored interview runs return the user to the same approval or in-progress context whenever possible.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Personas.md
