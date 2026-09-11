# Shard 037: Working Notebook Usage Fidelity Addendum (2026-09-05)

Source: `Plans/usage-feature.md`

Source lines: L6899-L7043

Source SHA256: `3f0a8dcc889ec2cd2f2a0df746594ff699966d6850c730b316a7ab5bd4926c6d`

---

## Working Notebook Usage Fidelity Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Active-window occupancy, cumulative request/attempt/thread consumption, pricing cost estimates, and provider subscription quota stay distinct concepts, exactly as the existing usage-window model (UF-041), value states (UF-074), and counting semantics (UF-085/UF-092) already require for their own domains. A fresh context-window transition lowers active-window occupancy but erases nothing: prior cumulative usage is preserved, and no misleading usage-reset animation, zero-fill, or quota-reset claim is shown after a fresh window, resume, or fork. Quota and window-reset truth comes from quota owners, never from occupancy.

Attribution: actual model calls for notebook capture, retrieval reasoning, summarization, re-prime, BSD advisor work, workers, reviewers, and recovery each create their own immutable linked `UsageRecord` per UF-085/UF-090 — one real provider attempt, one record, parent/child refs without folding. Local notebook search/storage work creates no provider token usage and no fabricated zero-token attempts; no-call decisions have their truthful separate operational attribution. Durable exactly-once accounting reuses existing attempt/provider/response/event identities with `dedupe_key`: a replayed usage event after reconnect, resume, window transition, fork, or child aggregation counts cumulative cost once, while a genuinely new billed retry receives a new `AttemptId`/UsageRecord linked to the parent operation and is counted. Inherited context (bounded handoff material given to a child) is not fabricated child consumption. Raw provider usage metadata is preserved per existing redaction policy; cache/reasoning buckets follow inclusive/exclusive `counting_semantics` (never added twice onto inclusive totals), missing counters render unknown — never zero — and pricing stays a labeled estimate, never provider invoice or quota truth.

Efficiency is measured only at the successful-task level by a future comparative benchmark (baseline versus enabled conditions with equivalent task criteria, total cost/tokens, cache behavior, overhead, re-reads, retries, latency, and exact-constraint/decision survival). No numerical savings or superiority claim is authorized without measured evidence; disk compression and recap UI are not token reductions. This Plans wave executes none of it: runtime performance measurement is NOT_RUN.

```yaml
plan_unit_id: UF-099
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: "Active-window occupancy, cumulative request/attempt/thread consumption, pricing cost estimate, and provider subscription quota are distinct. A fresh context-window transition, resume, or fork may lower occupancy but never erases prior cumulative usage and never resets provider quota; no usage-reset animation or quota-reset claim is displayed for these events. Cumulative usage persists durably across resume, window transition, forks, and children with exactly-once dedupe by immutable UsageRecord/provider-attempt identity and dedupe_key: replayed events count once, a genuinely new billed retry gets a new AttemptId/UsageRecord and counts, and inherited context is not fabricated child consumption."
gui_related: false
gui_classification_reason: Usage accounting is backend/display-data behavior; the display surfaces are owned by assistant-chat-design/usage GUI owners.
depends_on: [UF-085, UF-090]
unblocks: [UF-100, UF-101]
acceptance_criteria:
  - Fresh-window, resume, and fork fixtures preserve correct cumulative totals.
  - A replayed usage event does not increase cumulative cost twice; a new billed retry is counted.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures
risk_class: false_usage_reset
reasoning_tier: high
context_scope: usage_accounting
implementation_surfaces: [Plans/usage-feature.md, Plans/Prompt_Pipeline.md, Plans/assistant-chat-design.md]
node_compile_hint: {mode: usage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-U01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-U03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A36
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A37
preserved_exact_tokens: ["occupancy", "cumulative", "quota", "dedupe_key", "exactly-once"]
negative_constraints:
  - Do not show a usage reset for a fresh context window or resume.
  - Do not suppress a newly billed retry as a duplicate of the old attempt.
owner_hints: [Plans/usage-feature.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md

```yaml
plan_unit_id: UF-100
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: "All notebook- and continuity-related model overhead is attributed through existing Usage records: notebook capture calls, retrieval reasoning, summarization, re-prime, BSD advisor work, workers, reviewers, and recovery each produce their own immutable linked UsageRecord per source and actor, grouped by parent/child refs without double counting. Local notebook search/storage work is attributed as local operational work, never fabricated provider token usage; no-call decisions (e.g., a trivial exchange with no capture) produce no fabricated zero-token attempt. Raw provider usage metadata is preserved when authorized; cache and reasoning buckets follow explicit inclusive/exclusive counting semantics and are never added twice onto inclusive totals; missing counters stay unknown rather than zero, and pricing estimates stay labeled estimated, never provider invoice or quota truth."
gui_related: false
gui_classification_reason: Attribution semantics are accounting behavior, not GUI work.
depends_on: [UF-099]
unblocks: [UF-101]
acceptance_criteria:
  - Helper costs are inspectable per source and actor without double counting.
  - Inclusive reasoning/output fields are not added twice.
  - Missing counters render unknown; estimates stay labeled.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fabricated_usage
reasoning_tier: standard
context_scope: usage_accounting
implementation_surfaces: [Plans/usage-feature.md, Plans/Back_Seat_Driver.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: usage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-U02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-U04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A38
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A39
preserved_exact_tokens: ["immutable linked UsageRecord", "no fabricated zero-token attempt", "unknown rather than zero"]
negative_constraints:
  - Do not fabricate provider token usage for local search/storage work.
  - Do not add inclusive reasoning/output fields twice.
owner_hints: [Plans/usage-feature.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Back_Seat_Driver.md, ContractName:Plans/Working_Notebook.md

```yaml
plan_unit_id: UF-101
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: "Notebook/continuity efficiency claims require a future comparative measurement plan at the successful-task level: baseline and enabled conditions with equivalent task criteria, reporting total cost/tokens, cache behavior, overhead attribution per UF-100, re-reads, retries, latency, and exact-constraint/decision survival. No numerical savings or superiority claim is made without measured evidence; disk compression and recap UI are not token reductions. This Plans wave executes no benchmark: runtime performance measurement is NOT_RUN and is never inferred from schema or fixture validation."
gui_related: false
gui_classification_reason: Measurement planning is process/specification, not GUI work.
depends_on: [UF-099, UF-100]
unblocks: []
acceptance_criteria:
  - The benchmark plan names baseline and enabled conditions with equivalent task criteria.
  - Spec-only delivery reports runtime performance NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: unsubstantiated_efficiency_claim
reasoning_tier: standard
context_scope: usage_accounting
implementation_surfaces: [Plans/usage-feature.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: usage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-U05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A28
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A40
preserved_exact_tokens: ["successful-task level", "NOT_RUN", "not token reductions"]
negative_constraints:
  - Do not claim savings or superiority without measured evidence.
  - Do not treat static validation as efficiency measurement.
owner_hints: [Plans/usage-feature.md, Plans/Automated_Testing_System.md]
```

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Automated_Testing_System.md

### UF-103 - Browser Operational Attribution Without Synthetic Usage

```yaml
plan_unit_id: UF-103
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Browser admission, execution, representation, wait, effect, handoff and recovery events are operational attribution
  inputs to the existing Usage/ObservableWork owner, not billing records. Bounded refs preserve requested/effective
  strategy, exact Host/Environment and workspace/page/program lineage, coverage and terminal/effect disposition;
  real provider attempts and external billable sessions retain separately authoritative Usage and close receipts.
gui_related: true
gui_classification_reason: Usage details explain Browser strategy, waits, coverage, effects and unknown costs.
depends_on: [UF-091, SMPFS-166]
unblocks: []
acceptance_criteria:
  - Consume only admitted redacted metadata through browser_event_admission.json and the existing OperationalAttributionRecord; no parallel Browser UsageRecord family is minted.
  - Preserve compile, local work, representation, lease/resource/approval waits, handoff, reconnect/replay and safe-next-action distinctions where the actual owner supplies them; unavailable durations or costs remain unknown.
  - Real provider calls produce independently linked immutable UsageRecords; local operations, suppression, event replay and representation token estimates never fabricate model token usage or billable calls.
  - External adapters retain actual billable-session and explicit session-close receipts without treating event presence or success as provider settlement.
  - Requested/effective strategy, coverage, turns, bytes or token estimates are not proof of savings or benchmark comparability.
  - Replay cannot duplicate usage, restore a billable session, dispatch a program, or expose AuthBrowserSession, page bodies, credentials or capture content.
validation_surfaces: [Plans/browser_event_admission_fixtures.json, python3 scripts/pm-browser-event-admission.py, tests/test_pm_browser_event_admission.py, future native Browser operational attribution and provider usage integration fixtures]
risk_class: browser_operational_attribution_or_synthetic_usage
reasoning_tier: high
context_scope: browser_usage_consumer
implementation_surfaces: [Plans/usage-feature.md, Plans/shared_runtime_contracts.schema.json, Plans/browser_event_admission.json]
node_compile_hint: {mode: static_usage_consumer_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:EGO-006, source_ref:egolite-requirement:HBU-022, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md, USER-PACKET-GAP-CLOSURE-20260910]
negative_constraints: [No synthetic tokens or costs from operational events., No empirical savings or billing settlement from static fixtures., No protected authentication or secret content.]
```

ContractRef: ContractName:Plans/usage-feature.md#UF-091, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-166, ContractName:Plans/browser_event_admission.json
