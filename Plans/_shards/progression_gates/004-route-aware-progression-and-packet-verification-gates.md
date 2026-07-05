# Shard 004: Route-aware progression and packet verification gates

Source: `Plans/Progression_Gates.md`

Source lines: L84-L124

Source SHA256: `04fa25266602369dfd1e39048bb64567490865af81a8aed55236c5b8f9fdd785`

---

## Route-aware progression and packet verification gates

Progression gates are the canonical owners of promotion evidence, route/open packet verification, and compatibility checks before run sealing and archival.

### Promotion classes and required evidence

Promotions follow these classes:
- **READY**: Sufficient concerns resolved, approval status clear, usage within bounds, and no blocking externalities.
- **STAGED**: Promotion state is pending; promotion review window is open and waiting for coordinator review or automated gate judgment.
- **HELD**: Temporary gate; promotion may proceed after external condition clears (e.g., rate limit window, dependent run completion).
- **REJECTED**: Promotion gate failed; promotion cannot proceed unless the gate criterion is waived by escalation or project rule.

Evidence for each promotion class:
- READY: `concern_summary` clear or resolved-with-mitigation, `approval_summary` in final state, `usage_summary` within budget, `route_target_reachability` verified, `blockers` field is empty array.
- STAGED: `coordinator_review_id`, `review_deadline_utc`, `active_blockers[]`, `pending_external_conditions[]`.
- HELD: `hold_reason`, `expected_clear_time_utc`, `blocking_external_condition_id`.
- REJECTED: `rejection_reason`, `rejected_criterion`, `waiver_required`, `escalation_contact`.

### Route-aware wiring evidence

Route awareness requires:
- `route_target` is reachable and has not changed between build time and promotion time.
- `OpenSubject` resolution is still valid (e.g., the GitHub issue still exists, the workspace path is still writable).
- Route/open commands that were executed during the run are reflected in the promotion artifact.
- Route side-effects (file writes, PR opens, issue comments) are linked in the `route_completion_refs[]` field.

### route_target/OpenSubject packet checks

Packet verification gates check:
- Every `route_target` in the run packet is present in the promotion artifact as a reachability confirmation.
- Every `OpenSubject` in the run packet is present as a resolution confirmation or explicit waiver (if the subject became unreachable).
- Cross-packet route/open references are coherent: if run A routes to run B's artifacts, run B's artifacts must be sealed before run A is promoted.

### Compatibility fallback and contradiction-fail rules


- If a route_target becomes unreachable between build and promotion, the promotion enters HELD state instead of failing silently.
- If an OpenSubject resolution contradicts the prior intent (e.g., the issue was closed externally), the gate emits a REJECTION with `rejection_reason: 'subject_state_contradiction'`.
- Waiver paths: project admins may waive route reachability or subject contradiction using a durable `gate_waiver_rule` in the project config.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md
