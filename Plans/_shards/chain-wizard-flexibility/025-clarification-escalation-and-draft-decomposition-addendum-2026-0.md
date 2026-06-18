# Shard 025: Clarification Escalation and Draft Decomposition Addendum (2026-03-08)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2103-L2151

Source SHA256: `68c5caa8b0ab2dc022b78943f96a63b56c41df44912d958613b08dcdd20072e7`

---

## Clarification Escalation and Draft Decomposition Addendum (2026-03-08)

### 1. Canonical wizard state correction

See canonical `wizard_status` definition in §2.1.

### 2. attention_required vs blocked

Required distinction:
- `attention_required`: the current clarification cycle can continue; answering the current questions may unblock progress
- `blocked`: clarification rounds are exhausted or otherwise cannot progress automatically; the system must preserve the latest report and stop auto-rewrite/auto-advance until new explicit user input is provided
- For Debug investigation handoff, a budget trip may surface as `failed` or `attention_required` depending on whether user recovery is meaningful, but the machine-readable `stop_reason_code` remains `investigation.budget_exhausted` and MUST carry `budget_kind`.

Required `blocked` rules:
- `Proceed` and `Start Run` remain disabled
- UI copy must explicitly explain that repeated clarification attempts did not resolve the issue set
- the latest canonical quality report remains preserved
- no further automatic rewrite of requirements may happen without new explicit user input

### 3. Dashboard / thread / resume behavior


The wizard packet must support both:
- `wizard_attention_required`
- `wizard_blocked`

Required shared fields:
- `wizard_id`
- `wizard_step`
- `report_ref`
- `resume_url`
- `thread_id?`
- `status`

### 4. Draft decomposition degradation boundary

This wizard/interview planning surface owns the pre-canonical degradation allowance.

Required rule:
- if adaptive decomposition or dependency extraction produces invalid/cyclic output before canonical graph lock, the system may degrade to deterministic flat draft sequencing
- such degradation must emit warning evidence and a degradation record
- once the canonical sharded graph is locked, no silent degradation is allowed

### 5. Acceptance criteria

- `blocked` appears everywhere `wizard_status` is canonically defined.
- Wizard blocked and attention_required use distinct semantics and user copy.
- Resume/deep-link behavior works for both states.
- Draft decomposition degradation is allowed only before canonical graph lock and is evidence-backed.
