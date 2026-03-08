## Interview Validation, Remediation, and Blocked-State Addendum (2026-03-08)

### 1. Interview uses shared failure and remediation taxonomy

Interview validation/review flows must align with the shared runtime model.

Required behaviors:
- classify validation/review outcomes into the shared `failure_class` / `blocked_reason_code` taxonomy where applicable
- preserve stable finding IDs across remediation cycles
- record remediation generation and parent attempt lineage
- avoid blind repeat retries when the class requires remediation or explicit user input

### 2. Interview clarification escalation

Interview and wizard surfaces must recognize both:
- `attention_required`
- `blocked`

If clarification rounds are exhausted:
- persist the latest report bundle
- stop automatic rewrite/advance
- surface `blocked` to the thread + dashboard + interview surface

### 3. Draft phase-plan/decomposition fallback

Adaptive planning output may degrade only before canonical lock.

Required rule:
- invalid or cyclic draft decomposition/phase wiring may degrade to deterministic flat/ordered draft behavior with evidence
- canonical post-lock artifacts must not silently degrade

### 4. Activity-pane / chat visibility

Interview activity surfaces must expose when a phase or subagent is:
- waiting
- blocked
- in remediation
- in retry backoff

Required visible fields when relevant:
- `failure_class`
- `blocked_reason_code`
- `retry_count`
- `remediation_root_id`

### 5. Acceptance criteria

- Interview remediation loops preserve stable finding identity.
- Interview blocked escalation is explicit and persistent.
- Adaptive phase/decomposition degradation stays pre-canonical only.
- Activity-pane and chat surfaces show retry/remediation/blocked state explicitly.
