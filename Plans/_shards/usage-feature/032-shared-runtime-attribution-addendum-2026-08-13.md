# Shard 032: Shared runtime attribution addendum (2026-08-13)

Source: `Plans/usage-feature.md`

Source lines: L6248-L6327

Source SHA256: `2798b306a8bebfc44d2add1d29c25cba2f762b388d6248a564227e8a42de2e45`

---

## Shared runtime attribution addendum (2026-08-13)

Usage consumes `Plans/Shared_Integration_Runtime.md` operation identities, `ObservableWork`, `OperationalAwarenessService`, and provider-dispatch receipts while retaining sole ownership of Usage accounting and presentation. Shared runtime facts do not invent token counts, prices, settlement, or cost.

One real provider attempt creates one immutable UsageRecord, even when it is a background or silent helper, produces no user-visible content, is later suppressed, fails, times out, is interrupted, falls back, is replayed, or is superseded. Logical parent/child refs group attempts but never fold them into an unattributed parent total or erase failed/superseded attempts. Deduplication keys prevent retry/reconnect/projector overlap from charging or rolling up the same provider attempt twice; a genuinely new retry or fallback provider attempt has its own record and links to the logical operation.

Full purpose attribution covers primary turns plus subagent/crew calls, vision/media inspection, compression/compaction/summarization, web search/fetch/extract/research, approval review, MCP routing, skill/tool discovery, title generation, probes, attachment transformation, fallback, replay, BSD, conditional-rule model assistance, and future helper classes. Each provider-backed record preserves purpose, logical operation, parent UsageRecord, project/thread/Goal/Plan/run/agent/crew lineage where present, provider attempt, requested/effective route/model/account, Host/Environment where relevant, trigger, timestamps, provider-active and wait partitions, tokens/cache facts, cost/plan-usage/settlement authority and confidence, outcome/failure/timeout/interruption, emitted/suppressed/silent disposition, and event/receipt/artifact refs. Missing provider facts remain `unknown`, never zero.

BSD attribution is complete for Off/Auto/On policy evaluation and every actual advisory attempt. `Off` or a pre-dispatch duplicate/rule suppression with no model call produces an operational decision record, not fabricated model Usage. An Auto/On call records trigger/risk/phase, assignment, cursor/prefix epoch, requested/effective route, latency, tokens/cost where known, health/fallback, advice emitted/suppressed/silent reason, failure/timeout/quota, override scope, and influence/result refs. A call remains chargeable/attributable even when Chat displays nothing. BSD failure cannot convert primary work into failed Usage or block settlement of the primary attempt.

Non-model install/update/repair/rollback, environment maintenance, outbox wait, replay/snapshot transfer, local probes, LSP/DAP/Eval local work, MCP transport wait, worktree/lease activity, and other local/runtime operations use linked operational-attribution records rather than fake token Usage. If any such operation invokes a model, the provider attempt gets a separate linked UsageRecord. Operational records preserve `operation_id`, optional command and purpose, object lineage, exact Host/Environment, status/outcome, times, and partitions for provider active, local compute, resource, permission/approval, offline/outbox, reconnect/sync/replay/snapshot, maintenance, and total elapsed.

Usage consumes freshness-labeled Operational Awareness and truthful `ObservableWork` to explain time and waits, for example provider reset followed by bounded agent waves. It does not treat either projection as billing, lifecycle, or completion authority and never exposes protected `AuthBrowserSession`, secrets, unredacted payloads, or raw registries.

### UF-090 - Complete Provider And Helper Attempt Attribution

```yaml
plan_unit_id: UF-090
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Every real provider attempt creates one immutable deduplicated UsageRecord with exact purpose and Goal/Plan/thread/run/agent lineage, including silent, suppressed, failed, interrupted, replay, fallback, BSD, subagent, vision, compression, web, approval, MCP, skill, title, probe, attachment, and other helper calls. Unknown provider facts remain unknown and every genuine retry/fallback attempt remains independently attributable.
gui_related: false
gui_classification_reason: This unit owns backend Usage identity, deduplication, purpose, lineage, and settlement facts.
depends_on: [UF-085, UF-087, UF-088, SIR-009, SIR-010]
unblocks: []
acceptance_criteria:
  - Silent/suppressed helper and failed/interrupted/fallback fixtures retain immutable Usage records whenever a provider call occurred.
  - Reconnect/projector duplicates roll up one attempt once, while genuine retries remain separate and linked.
  - Every listed purpose preserves exact parent and operational lineage and missing cost/tokens are not coerced to zero.
  - BSD failure or suppression does not alter primary attempt settlement.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, future helper-purpose and Usage deduplication fixtures]
risk_class: silent_helper_usage_loss_or_double_count
reasoning_tier: high
context_scope: complete_runtime_usage_attribution
implementation_surfaces: [Plans/usage-feature.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: complete_provider_helper_attribution, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/ASSISTANT_CHAT_SHARED_CONTRACTS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [one real provider attempt, silent, suppressed, BSD, unknown]
negative_constraints: [Do not hide background provider calls., Do not double-count replay overlap., Do not turn unknown into zero.]
owner_hints: [Plans/usage-feature.md, Plans/Shared_Integration_Runtime.md, Plans/Multi-Account.md]
```

### UF-091 - Operational Time, Wait, And BSD Attribution

```yaml
plan_unit_id: UF-091
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage links non-model operational attribution and ObservableWork timing to immutable UsageRecords without fabricating token usage. BSD records trigger, assignment, cursor/prefix, route, cost, latency, emitted/suppressed/silent outcome, failure/timeout/quota, and override scope; no-call suppression remains operational only and protected AuthBrowserSession is excluded.
gui_related: true
gui_classification_reason: Users inspect why work waited, what helper ran, whether advice was shown, and which costs remain unknown.
depends_on: [UF-090, SIR-006, SIR-007, SIR-010]
unblocks: []
acceptance_criteria:
  - OperationalAttributionRecord uses the closed value definition in Plans/shared_runtime_contracts.schema.json and the Usage owner remains the sole authority for its timing and lineage meaning.
  - Operational-only activity never creates fake provider Usage and model-backed work creates a separately linked record.
  - Provider-active, local, resource, approval, offline/outbox, reconnect/replay/snapshot, maintenance, and total times remain distinguishable.
  - BSD no-call, silent, suppressed, timeout, quota, fallback, and failure cases are attributable and do not block primary work.
  - Usage details expose no AuthBrowserSession or secret content.
validation_surfaces: [python3 scripts/pm-shared-runtime-contracts.py --self-test, python3 scripts/pm-shared-runtime-storage-materialize.py check, future operational-time and BSD attribution fixtures]
risk_class: operational_and_bsd_attribution_drift
reasoning_tier: high
context_scope: operational_usage_explanation
implementation_surfaces: [Plans/usage-feature.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: operational_usage_attribution, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/02_T3_DURABLE_THREADS_NETWORK_AND_OUTBOX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
preserved_exact_tokens: [provider-active, offline/outbox wait, emitted/suppressed, AuthBrowserSession]
negative_constraints: [Do not treat ObservableWork as billing authority., Do not fabricate usage for local operations., Do not expose protected browser or secret state.]
owner_hints: [Plans/usage-feature.md, Plans/Shared_Integration_Runtime.md]
```
