# Shard 014: Retry, Blocking, and Safe-Point Clarification Addendum (2026-03-08)

Source: `Plans/Run_Modes.md`

Source lines: L582-L634

Source SHA256: `d7be41e69ee6aceaf934c98677c2adbb6e9a8041f08ce5e707937f6cbb9575cd`

---

## Retry, Blocking, and Safe-Point Clarification Addendum (2026-03-08)

### 1. Mode interaction with runtime failure classes

Run mode does not replace runtime failure classification.

Required rule:
- `ask`, `plan`, `regular`, and `yolo` all use the shared `failure_class` / `blocked_reason_code` taxonomy
- mode may change which classes are likely, but not the meaning of those classes

Failover reason codes are part of the shared runtime classification and remain stable across modes.

Required failover reason codes:
- `hard_exhaustion_failover`
- `auth_failure_failover`
- `workspace_deactivated_failover`
- `model_unsupported_failover`
- `provider_unhealthy_failover`

Rules:
- failover reason codes are recorded in `reason_codes[]` or the owning runtime/audit envelope for the attempt
- changing from `ask` or `plan` to an execution-capable mode does not rewrite the original failover reason
- provider/account routing surfaces may add selection, preemptive-switch, clamp/substitution, or blocked reasons, but those reason families do not replace failover classification

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md

### 2. Ask/plan/headless interaction

Existing headless behavior remains authoritative:
- when tool policy resolves to `ask` and no interactive approval path is available, the outcome becomes `headless_ask_denied` unless the active flow explicitly supports pending HITL at that boundary
- this is a blocked/denied outcome, not an auto-retry class

### 3. Counters and kill-switch interaction

Required clarifications:
- blocked outcomes do not count as qualifying writes
- blocked outcomes do not count as retryable provider errors
- `max_retryable_errors` applies only to retryable classes such as `provider_transient` unless another class is explicitly declared retryable by the shared matrix

### 4. Safe-point applicability

Runtime safe points are required only for mutation-capable attempts.

Rules:
- `ask` and `plan` remain read-only for project files and therefore do not require mutation safe points for ordinary planning/inspection work
- `regular` and `yolo` must create safe points before risky mutation-capable attempts

### 5. Acceptance criteria

- Run modes do not invent alternative retry taxonomies.
- Headless ask denial remains explicit and non-magical.
- Blocked outcomes are excluded from write-thrash and retryable-provider ceilings.
- Safe-point creation follows execution authority, not generic run existence.
