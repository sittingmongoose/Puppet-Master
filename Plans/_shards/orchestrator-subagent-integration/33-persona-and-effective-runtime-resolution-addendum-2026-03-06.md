## Persona and Effective Runtime Resolution Addendum (2026-03-06)

This addendum updates the orchestrator plan so tier execution uses the Persona system as the first-class runtime role contract.

### Canonical tier reminder

The orchestrator tier model remains:
- Phase
- Task
- Subtask
- Iteration

Resolved reminder: **Iteration** remains the lowest tier. Persona switching should not introduce new tiers.

### Tier-specific Persona defaults
### Orchestrator Persona config contract

Orchestrator MUST persist one canonical Persona-resolution config object separate from delegated-subagent registry data.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Personas.md

Minimum fields:
- `mode` (`manual | auto | hybrid`)
- `tier_personas`
  - `phase`
  - `task`
  - `subtask`
  - `iteration`
- `operation_frame_personas`
  - `planning`
  - `execution`
  - `review`
  - `verification`
- optional per-tier platform/model overrides
- optional next-run explicit override
  - `requested_persona`
  - optional `requested_platform`
  - optional `requested_model`
  - `expires_after_run_start` (bool)

Rules:
- `tier_personas` expresses the default Persona per tier when no higher-precedence override wins.
- `operation_frame_personas` refines same-tier switching without creating new tiers.
- All configured Persona IDs MUST validate against `persona_registry`, not only `subagent_registry`.
  ContractRef: ContractName:Plans/Personas.md
- Delegated child-run validation still uses `subagent_registry`; surface-level runtime selection uses `persona_registry`.

The orchestrator must support Persona defaults and/or auto Persona resolution per tier.

Examples:
- **Phase:** strategic/planning Personas such as `project-manager`, `architect-reviewer`, `collaborator`
- **Task:** domain/language Personas such as `rust-engineer`, `frontend-developer`, `backend-developer`, `devops-engineer`
- **Subtask:** reviewer/writer/specialist Personas such as `code-reviewer`, `technical-writer`, `security-engineer`
- **Iteration:** execution/debugging/verification Personas such as `rust-engineer`, `frontend-developer`, `debugger`, `qa-expert`

### Planning vs execution Persona switching

The orchestrator may switch Persona within the same tier depending on the current mental frame, without changing tier structure.

Examples:
- planning/discussion inside a task -> `collaborator` or planning Persona
- execution inside the same task -> implementation Persona such as `rust-engineer`
- review/verification after execution -> reviewer Persona such as `code-reviewer` or `qa-expert`

### Requested vs effective runtime state for every tier run

Each orchestrator tier run must record:
- requested Persona,
- effective Persona,
- selection source,
- selection reason,
- requested/effective platform/model/variant,
- applied Persona controls,
- skipped Persona controls.

This must be available to event stream consumers and UI surfaces.

### Auto Persona resolution in orchestrator

When not manually set, orchestrator should auto-resolve Persona based on:
- tier level,
- task type,
- repo language/framework,
- current operation type (planning vs execution vs review),
- PRD/plan recommendations,
- config overrides.

Examples:
- Rust code execution in iteration -> `rust-engineer`
- planning mode at a tier boundary -> `collaborator`
- repo discovery before edits -> `explorer`
- production-readiness validation -> `sre`

### Registry normalization

Legacy references to `explore` are stale and must be normalized to `explorer` in the canonical registry and all derived selection logic.

### Provider-native seed sources are not canonical

Any earlier language implying `.claude/agents` or similar directories are the source of truth is superseded by `Plans/Personas.md`.

Canonical rule:
- provider-native directories are seed/import sources only,
- Puppet Master Persona storage is the sole canonical source after import.

### Acceptance criteria addendum

- Orchestrator must support Persona defaults/auto selection per tier.
- Iteration remains the lowest tier; Persona switching must not add tiers.
- Every tier run must emit effective Persona/model/platform state and selection reason.
- Registry and plan language must standardize on `explorer`, not `explore`.
