# Shard 026: Draft Decomposition Fallback / Wizard Blocked-State Addendum (2026-03-09)

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L2152-L2177

Source SHA256: `68c5caa8b0ab2dc022b78943f96a63b56c41df44912d958613b08dcdd20072e7`

---

## Draft Decomposition Fallback / Wizard Blocked-State Addendum (2026-03-09)

Wizard planning and draft decomposition must align with the runtime packet.

### Draft fallback boundary
Deterministic flat draft fallback is allowed only before graph lock. The fallback output MUST be tagged as degraded draft structure, emit warning evidence, and preserve the reason for degradation.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Progression_Gates.md

### Post-lock integrity rule
After graph lock, invalid canonical decomposition is a blocking integrity problem, not a graceful fallback case. The wizard MUST stop forward execution and surface a repair/replan path.
ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/interview-subagent-integration.md

### Wizard state contract additions
Persist:
- `attention_required_reason`
- `blocked_reason_code`
- `decomposition_degraded` boolean
- degradation reason
- active `replan_generation`
- attempted recovery actions

### UX rule
The wizard must differentiate:
- clarification still pending (`attention_required`)
- blocked on user correction / auth / approval / integrity (`blocked`)
- degraded but still usable draft structure before lock
