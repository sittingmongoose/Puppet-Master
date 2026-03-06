## Requirements Builder Persona Strategy Addendum (2026-03-06)

This addendum defines Persona behavior for the Requirements Builder / chain wizard flow.

### Builder stages requiring explicit Persona strategy

Requirements Builder and related wizard generation/review work should distinguish at least these stages:
- intake / clarification
- drafting
- domain-specialized fragment generation
- quality review
- final review / multi-pass review

### Default stage Personas

#### 1. Intake / clarification
Default Persona: `collaborator`

Behavior:
- asks clarifying questions,
- engaged and collaborative,
- suggests options and tradeoffs,
- more willing to talk than execution Personas.

#### 2. Drafting
Default Persona: `technical-writer`

#### 3. Domain-specialized fragment generation
Use domain or language Personas as needed, for example:
- `security-engineer`
- `devops-engineer`
- `ux-researcher`
- `rust-engineer`
- `frontend-developer`

#### 4. Quality review
Default Persona: `requirements-quality-reviewer`

#### 5. Final review / Multi-Pass
Use reviewer Personas such as:
- `requirements-quality-reviewer`
- `code-reviewer`
- `security-auditor`
- `architect-reviewer`

### Per-stage platform/model control

Requirements Builder settings must allow platform/model selection per stage or pass, and these settings must still pass through provider capability filtering.

### Requested vs effective visibility

Requirements Builder UI should display:
- effective Persona,
- selection reason,
- effective platform/model,
- and skipped unsupported Persona controls for the active builder stage/pass.

### Acceptance criteria addendum

- Requirements Builder must support Persona selection by stage/pass.
- Collaborator is the default intake/clarification Persona.
- Technical Writer is the default drafting Persona.
- Reviewer Personas are distinct from drafting Personas for review passes.
- Builder UI must expose effective Persona/model/platform and any skipped unsupported Persona controls.
