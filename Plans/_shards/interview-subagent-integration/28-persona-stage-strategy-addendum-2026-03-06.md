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
Default Persona: `researcher` or domain-specific research Persona where appropriate.

Examples:
- UX/product research may use `ux-researcher`.
- broader external-source synthesis may use `researcher`.
- broader/deeper multi-source synthesis may use `deep-researcher`.

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
- Interview UI must display effective Persona/model/platform during active work.
- GUI/UI/UX interview work may prefer Gemini when available, but this must remain configurable and capability-aware.
