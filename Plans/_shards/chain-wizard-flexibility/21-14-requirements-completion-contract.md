## 14. Requirements Completion Contract

> **Compliance:** Normative and machine-checkable. Follows `Plans/Decision_Policy.md §6` for unknown resolution. Naming: "Puppet Master" only.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/requirements_quality_report.schema.json, PolicyRule:Decision_Policy.md§6

This section defines the minimum criteria every requirement MUST satisfy before it can leave the Chain Wizard/Interview phase. The Three-Pass Canonical Validation Workflow (§12) enforces these criteria automatically: Pass 1 identifies issues, Pass 2 auto-fixes where possible, and Pass 3 escalates any remaining blocking issues per §15.

Each requirement MUST satisfy ALL of the following coverage criteria:

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§6

---

### C-1: Scenario Coverage

- At minimum: **1 positive (happy-path) scenario** + **1 negative/failure scenario**
- Scenarios must be in structured form: `{given, when, then}` or equivalent
- Blocking issue type: `missing_scenarios`

---

### C-2: Boundary Declaration

- Explicit **in-scope** statement (what the feature covers)
- Explicit **out-of-scope** statement (what is explicitly excluded)
- May not use deferred placeholder text (for example: "later" or unresolved marker text), or similar deferral language
- Blocking issue type: `missing_boundary`

---

### C-3: Implementation Anchor

At least one of:

- A `ProjectContract:*` reference that pins the implementing spec
- An explicit "research node required" annotation (which creates a blocking research node in the plan graph before implementation can start)

Blocking issue type: `missing_anchor`

---

### C-4: Executable Verification

- At least one acceptance check command path that will appear in the acceptance manifest
- Format: `verify: <command-or-gate-id>` inline in the requirement, OR referenced via a named verification gate (`Gate:GATE-XXX`)
- Blocking issue type: `missing_acceptance`

---

### C-5: Unknown Resolution

All unknowns must become either:

- **(a) A blocking research node** — creates a graph dependency; implementation cannot start until research resolves it
- **(b) A deterministic auto-decision** — only when it is truly a choice between equally valid options, not missing user intent (see `Plans/Decision_Policy.md §6`)

Open unknowns that do not fit (a) or (b) MUST become `needs_user_clarification[]` entries in the quality report.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§6

Blocking issue type: `missing_research` (for unresolved unknowns)

---

### 14.1 Quality Report Artifact

The `requirements_quality_report` artifact produced during Pass 1 (§12) captures the per-requirement evaluation against C-1 through C-5. After Pass 2 autofixes, the report is updated in-place. Schema: `pm.requirements_quality_report.schema.v1` (`ContractName:Plans/requirements_quality_report.schema.json`).

Key fields:

| Field | Description |
|---|---|
| `verdict` | Overall report verdict: `PASS` \| `FAIL` |
| `requirements_touched[]` | Requirement IDs inspected in this quality analysis pass |
| `issues[]` | Detected issues (`issue_id`, `category`, `requirement_id`, `severity`, `auto_fixable`, etc.) |
| `auto_fixes_applied[]` | Deterministic fixes applied in Pass 2 (each references `issue_id` and `requirement_id`) |
| `needs_user_clarification[]` | Clarification questions that require user input (each references `issue_id` and `requirement_id`) |

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/requirements_quality_report.schema.json

### 14.2 Deterministic report shaping

The `requirements_quality_report` artifact MUST be stable across equivalent reruns.

Deterministic shaping rules:
- `requirements_touched[]` MUST follow canonical requirement order from `requirements.md`.
- `issues[]` MUST be ordered by `(requirement_id, category, description)` using normalized lexicographic comparison.
- `issue_id` values MUST be emitted as zero-padded ordinals in report order: `ISS-0001`, `ISS-0002`, ...
- `auto_fixes_applied[]` MUST be ordered by referenced `issue_id`; `fix_id` values MUST be emitted as `FIX-0001`, `FIX-0002`, ...
- `needs_user_clarification[]` MUST be ordered by referenced `issue_id`; `question_id` values MUST be emitted as `Q-0001`, `Q-0002`, ...
- Re-running Pass 1 + Pass 2 with unchanged requirement content and unchanged user answers MUST preserve byte-stable ordering for these arrays.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, Invariant:INV-005, PolicyRule:Decision_Policy.md§2

---

