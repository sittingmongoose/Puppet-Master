# Shard 027: BSD and sustainable-capacity policy addendum (2026-08-13)

Source: `Plans/Run_Modes.md`

Source lines: L1184-L1263

Source SHA256: `d7be41e69ee6aceaf934c98677c2adbb6e9a8041f08ce5e707937f6cbb9575cd`

---

## BSD and sustainable-capacity policy addendum (2026-08-13)

Back Seat Driver mode is a separate policy axis from runtime mode, overlay, strategy, access profile, Persona, and Crew. Its closed values are `Off`, `Auto`, and `On`; the effective default and recommended value are `Auto`. Missing, invalid, stale, or unresolved policy resolves to Auto with a recorded resolution reason. An explicit stored Off remains Off and performs no advisory provider call.

Every applicable run snapshot preserves `requested_bsd_mode`, `effective_bsd_mode`, policy source/generation, trigger policy ref, and narrowing reason. Off performs no provider advisory call. Auto evaluates only on owner-defined risk/phase triggers. On may evaluate every eligible turn within its own quota. All three remain read-only: no BSD choice widens runtime mode, overlay, strategy, tool, FileSafe, permission, network, file, child, or cross-project authority. Ask and Plan remain read-only even with BSD On. Children inherit or narrow the parent authority ceiling independently of BSD mode.

`BackSeatDriverService` lifecycle and isolation remain owned by `Plans/Shared_Integration_Runtime.md`: independent assignment, cursor, stable prefix, requested/effective route, Usage lineage, fallback, quota, and health; bounded delta input; semantic duplicate suppression; no protected `AuthBrowserSession`; and non-blocking timeout/failure/quota behavior. Usage owns cost/accounting. Chat owns presentation. This owner decides effective mode policy only.

Time-Traveling conditional rules are likewise a separate Prompt Pipeline/shared-runtime consumer. A rule conditioned on runtime mode or Goal phase may remind or request a bounded steer/retry, but cannot change effective runtime mode, approve an action, bypass deterministic safety, or widen authority.

The concurrency defaults in §4.1 remain hard ceilings, not promised admission. Effective sustainable concurrency is always less than or equal to those ceilings and is determined by `RuntimeResourceGovernor` from actual Host/Environment capacity, provider/account/model/reset permits, memory/process pressure, leases, dependency readiness, cost policy, and physical-parent sharing. Provider request permits are held only during provider request/stream production, not while an agent performs local work or awaits children.

Admission reserves capacity for interactive control, pause/stop/approval, parent synthesis, required testing, verification, and repair before optional fan-out. Required specialists denied simultaneous admission remain queued and run in bounded waves; they are not silently discarded or reclassified optional. Windows/WSL and host/container/Kubernetes child environments share their physical-parent capacity. Every queued, reduced, waiting, or admitted outcome projects through `ObservableWork` with a typed reason and reevaluation condition.

### RM-050 - BSD Effective Mode Policy

```yaml
plan_unit_id: RM-050
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: >-
  BSD is an independent Off/Auto/On policy axis with effective default and recommended value Auto. Auto uses owner-defined risk/phase triggers and On may evaluate every eligible turn, but BSD always remains read-only, independently routed and attributed, and cannot widen runtime authority or block primary work.
gui_related: false
gui_classification_reason: This unit owns effective run-policy resolution rather than visual BSD presentation.
depends_on: [RM-003, RM-004, SIR-010]
unblocks: [GRS-045, ACD-446]
acceptance_criteria:
  - Missing/invalid/stale policy resolves Auto with evidence; explicit Off produces no provider advisory call.
  - Auto trigger/no-trigger and On eligible-turn fixtures preserve requested/effective policy evidence.
  - BSD cannot widen ask/plan or any parent authority ceiling and cannot access AuthBrowserSession.
  - BSD failure/timeout/quota never changes the primary run outcome.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future BSD mode-resolution and authority fixtures]
risk_class: bsd_mode_or_authority_drift
reasoning_tier: high
context_scope: bsd_effective_run_policy
implementation_surfaces: [Plans/Run_Modes.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: bsd_effective_policy, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [Off, Auto, On, effective default Auto, AuthBrowserSession]
negative_constraints: [Do not rewrite an explicit stored Off as Auto., Do not let BSD widen authority., Do not make advisor failure block primary work.]
owner_hints: [Plans/Run_Modes.md, Plans/Shared_Integration_Runtime.md, Plans/usage-feature.md]
```

### RM-051 - Sustainable Concurrency And Reserve Capacity

```yaml
plan_unit_id: RM-051
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: >-
  Configured concurrency values are hard ceilings; effective sustainable concurrency remains capacity-, permit-, pressure-, lease-, dependency-, cost-, and topology-aware. Admission reserves interactive control and parent synthesis/testing/verification/repair, holds provider permits only around requests, and runs required specialists in bounded waves instead of dropping them.
gui_related: true
gui_classification_reason: Effective limits, queues, waves, waits, reductions, and reserve-pressure reasons are user-visible work state.
depends_on: [RM-012, RM-013, SIR-006, SIR-007]
unblocks: [OSI-434]
acceptance_criteria:
  - Effective concurrency never exceeds hard ceilings and can reduce under host/provider/memory/process pressure.
  - Parent/child provider-permit deadlock is impossible because permits wrap requests rather than agent lifetime.
  - Saturation preserves interactive pause/stop/approval and parent synthesis/testing/repair reserve.
  - Required specialists execute in visible bounded waves and physical child environments share parent budgets.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future sustainable-concurrency and reserve-pressure fixtures]
risk_class: unsustainable_concurrency_or_reserve_starvation
reasoning_tier: high
context_scope: sustainable_run_capacity
implementation_surfaces: [Plans/Run_Modes.md, Plans/Shared_Integration_Runtime.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: sustainable_run_capacity_policy, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [sustainable concurrency, reserve, required specialists run in waves, provider request permits]
negative_constraints: [Do not treat caps as guaranteed capacity., Do not drop required specialists., Do not create a second governor or ObservableWork owner.]
owner_hints: [Plans/Run_Modes.md, Plans/Shared_Integration_Runtime.md, Plans/orchestrator-subagent-integration.md]
```
