## Persona Stage Strategy Addendum (2026-03-06)

This addendum clarifies Persona usage for Interview runs beyond the older phase-subagent mapping.

### Stage model inside Interview

Interview Persona behavior should be defined by **stage of work**, not only by top-level phase.

Required stages:
- **questioning / clarification**
- **research**
- **validation**
- **drafting / document writing**
- **review / multi-pass review**

### Default stage Personas

#### 1. Questioning / clarification
Default Persona: `collaborator`

Behavior:
- engaged,
- asks better follow-up questions,
- collaborative,
- willing to talk more,
- proactive at surfacing options and tradeoffs.

#### 2. Research
Default Persona: `explorer` for local/project investigation, or the phase/domain-specific registry Persona where appropriate.

Examples:
- UX/product research may use `ux-researcher`.
- local codebase/repository investigation uses `explorer`.
- broader multi-source synthesis uses `knowledge-synthesizer` after source collection, not an unregistered ad-hoc Persona.

#### 3. Validation
Use reviewer-oriented Personas such as:
- `architect-reviewer`
- `code-reviewer`
- `security-auditor`
- `requirements-quality-reviewer`

#### 4. Drafting / document writing
Default Persona: `technical-writer`

#### 5. Review / Multi-Pass
Use pass-specific reviewer Personas rather than reusing the same drafting Persona.

### Deterministic stage resolver (normative)

Interview MUST resolve Personas in this order:
1. stage-specific explicit override (if configured and valid in registry)
2. phase-specific primary/secondary mapping from this document
3. stage default from this addendum
4. `general-purpose` only as the final fallback when no stage/phase Persona is available

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/orchestrator-subagent-integration.md, PolicyRule:Decision_Policy.md§2

Additional rules:
- Automatic resolution may return only registry-valid IDs from `Plans/orchestrator-subagent-integration.md`.
- Requested IDs that are unavailable after capability/provider filtering must record `requested_persona_id`, `effective_persona_id`, and `selection_reason`.
- Questioning MUST bias toward `collaborator` even when a technical phase Persona exists; technical Personas inform questioning context but do not replace the conversational default unless the user explicitly overrides it.
- Review / validation stages MUST NOT silently reuse the drafting Persona as their effective reviewer when a reviewer Persona is available.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/orchestrator-subagent-integration.md, PolicyRule:Decision_Policy.md§2

### GUI / UI / UX phase model preference

When Interview is in GUI/UI/UX-oriented work and Gemini is available/configured, the Interview configuration may prefer Gemini by default for the relevant stage or phase. This preference must be adjustable in GUI and must still pass through provider availability + capability filtering.

### Requested vs effective visibility in Interview

Interview activity panes and chat surfaces must display:
- effective Persona,
- selection reason,
- effective platform/model,
- and any skipped unsupported Persona controls.

### Multi-Pass distinction

Multi-Pass Review is not the same Persona contract as asking the user questions.

Rule:
- Question asking should bias toward `collaborator`.
- Drafting should bias toward `technical-writer`.
- Review passes should bias toward explicit reviewer Personas.

### Acceptance criteria addendum

- Interview must support different Personas for questioning, research, validation, drafting, and review.
- Interview UI must display requested/effective Persona plus effective provider/model during active work.
- Automatic Interview Persona resolution must use registry-valid IDs and follow the deterministic resolver order above.
- GUI/UI/UX interview work may prefer Gemini when available, but this must remain configurable and capability-aware.
