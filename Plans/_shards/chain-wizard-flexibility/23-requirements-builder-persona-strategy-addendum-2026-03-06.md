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

### Deterministic Builder Persona resolver

Requirements Builder MUST resolve Personas in this order:

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md#17.8

1. explicit stage/pass override for the current Builder execution, if present
2. configured stage/pass mapping from Builder Persona settings
3. stage default from this addendum
4. `general-purpose` as the final fallback when no valid mapping/default is available

Additional rules:
- Intake/clarification MUST bias toward `collaborator` unless the user explicitly overrides it.
  ContractRef: ContractName:Plans/Personas.md
- Review passes MUST NOT silently reuse the drafting Persona when a reviewer Persona mapping exists.
  ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/FinalGUISpec.md#17.8
- Automatic resolution may return only IDs valid in `persona_registry` (`Plans/Personas.md` §7).

### Builder Persona config contract
### Review-pass identifier contract

`review_pass_personas` MUST use canonical ordinal keys:

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md#17.8

- `pass_1`
- `pass_2`
- `pass_3`
- `pass_4`
- `pass_5`

Rules:
- Keys map to the numbered Multi-Pass Review passes configured for the Builder run.
- If a configured run uses fewer passes than a stored key set, extra keys are ignored.
- If a run uses more passes than are explicitly mapped, unmapped passes fall back to the deterministic reviewer-selection rules in §5.6.
- GUI labels may display `Pass 1`, `Pass 2`, etc., but persistence MUST use the canonical key names above.
- `review_pass_personas` maps review passes only; the final synthesis/writer step remains governed by the Builder workflow and is not implicitly overwritten by reviewer-pass mappings.

Builder Persona settings MUST persist a canonical config object with at least:

ContractRef: ContractName:Plans/FinalGUISpec.md#17.8, ContractName:Plans/Personas.md

- `mode` (`manual | auto | hybrid`)
- `stage_personas` (map of Builder stage -> Persona ID)
- `review_pass_personas` (map of pass identifier -> Persona ID)
- optional per-mapping platform/model overrides
- optional explicit override for the next eligible Builder execution

This config is the runtime backing store for the mapping editor required by `Plans/FinalGUISpec.md` §17.8.

### Builder requested/effective runtime visibility contract

For every Builder stage/pass execution, persist and expose:
- `requested_persona`
- `effective_persona`
- `persona_selection_source`
- `selection_reason`
- `effective_platform`
- `effective_model`
- `applied_persona_controls[]`
- `skipped_persona_controls[]`

Builder activity/status UIs may render this compactly, but they MUST use the same canonical requested/effective record as other surfaces.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/FinalGUISpec.md

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
