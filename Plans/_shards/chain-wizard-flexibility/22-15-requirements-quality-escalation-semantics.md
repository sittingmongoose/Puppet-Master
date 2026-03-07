## 15. Requirements Quality Escalation Semantics

> **Compliance:** Follows §14 (Requirements Completion Contract) and §12 (Three-Pass Canonical Validation Workflow). Naming: "Puppet Master" only. All decisions deterministic.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md

This section defines how blocking issues in the `requirements_quality_report` that are not resolved by Pass 2 autofixes are surfaced to the user. Pass 3 (§12) never edits product requirements; instead it reads the quality report and triggers the escalation path defined here.

---

### 15.1 Escalation Trigger

Escalation fires when:

- `needs_user_clarification[]` in the final (post-Pass-2) `requirements_quality_report` is **non-empty**

No escalation fires if all blocking issues were resolved by Pass 2 autofixes.

---

### 15.2 Wizard State Transition

When escalation fires:

- Wizard state becomes: `attention_required`
- The "Proceed" / "Start Run" button is disabled
- A lock icon or warning badge appears on the wizard step that triggered the issue

The wizard returns to its normal state only when all `needs_user_clarification[]` entries are answered and Pass 1 + Pass 2 re-run with the user's answers injected produce a quality report with `verdict: "PASS"` and `needs_user_clarification[]` empty.

---

### 15.3 UI Surfaces (Mandatory — Both Required)

#### Surface 1: Thread Badge + In-Thread Clarification Message

In the relevant chat thread (the thread for this chain/wizard instance), a system message is posted with:

- `type: "clarification_request"`
- `questions[]`: the full `needs_user_clarification[]` array from the quality report
- `wizard_step`: the exact step name/ID that triggered the issue
- `resume_url`: deep-link to resume the wizard at that step

The thread list entry for this thread shows a badge (count of unanswered questions).

#### Surface 2: Dashboard CtA Card

A card appears on the Dashboard under a dedicated "Attention Required" section:

| Card Field | Value |
|---|---|
| `title` | `"Requirements need your input"` |
| `reason` | Human-readable summary of the blocking issues |
| `wizard_id` | ID of the wizard instance |
| `wizard_step` | Name/ID of the step that triggered escalation |
| `question_count` | Count of unanswered questions |
| `resume_url` | Deep-link to resume the wizard at the blocked step |

Card actions:

- **"Resume Wizard"** — deep-links to the wizard at the blocked step
- **"View in Thread"** — opens the thread where the clarification_request message was posted

The Dashboard card is dismissed automatically when all questions are answered and wizard state returns to non-`attention_required`.

---

### 15.4 Clarification Payload Storage

- The `requirements_quality_report` artifact is stored at:
  `.puppet-master/project/traceability/requirements_quality_report.json`
- The wizard record (in the app database) gains a field `attention_required_report_path` pointing to the latest quality report file
- When the user answers all clarification questions, the wizard is re-run through Pass 1 and Pass 2 with the answers injected; the canonical quality report file is regenerated at the same path and `attention_required_report_path` is updated to that canonical path

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md, Plans/Project_Output_Artifacts.md

### 15.5 Clarification round cap

A clarification cycle is one complete sequence of:
1. a report with non-empty `needs_user_clarification[]`,
2. user answer submission,
3. automatic re-run of Pass 1 + Pass 2.

The maximum clarification cycles for one wizard instance is **3**.

- Cycles 1-2: wizard state remains `attention_required` when follow-up questions remain.
- After cycle 3 still produces non-empty `needs_user_clarification[]`, wizard state becomes `blocked`.
- `blocked` disables "Proceed" and "Start Run" exactly like `attention_required`, but the UI copy MUST explain that repeated clarification attempts did not resolve the requirements set.
- In `blocked`, Puppet Master MUST preserve the latest canonical quality report and MUST NOT auto-rewrite requirements further without new explicit user input.

ContractRef: Gate:GATE-012, SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/assistant-chat-design.md#11-thread-state-lifecycle-attention_required

