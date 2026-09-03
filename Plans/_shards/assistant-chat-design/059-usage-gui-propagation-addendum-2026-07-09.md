# Shard 059: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/assistant-chat-design.md`

Source lines: L23836-L23912

Source SHA256: `3a7c8066cfd8103cbc605111d917224c61ae3d7ee19f2e6e354076306c67919e`

---

## Usage GUI Propagation Addendum - 2026-07-09

This addendum binds Assistant Chat context and usage displays to the canonical UsageRecord projection. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### ACD-434 - Context Detail UsageRecord Projection Contract

```yaml
plan_unit_id: ACD-434
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The chat header context circle, click-opened context status module, More Details action, Compact Now action, Context Detail Pane, message info-popover, and Raw/Curated views consume the same UsageRecord/context projection records used by Usage, Ledger, Runtime Artifacts, Run Graph, and Orchestrator. The context circle is an entrypoint and status disclosure, not a cost calculator. The context status module (opened by clicking the context circle per ACD-441; hovering the circle shows only an accent glow affordance) shows stateful usage, tokens, context, cost, quota, freshness, and hidden/background contribution summaries from UsageRecord projections. More Details opens or focuses the editor-tab Context Detail Pane through canonical route/open. Compact Now dispatches only `cmd.chat.compact_context` and never recalculates usage. Message info-popovers link to the message-scoped UsageRecord/context rows by usage_event_ref, provider_attempt_ref, attempt_id, node_id, tool_call_id, raw_payload_ref, trace_ref, or receipt refs when available. Curated view renders normalized provider, token, context, cost, quota, authority, settlement, and source-confidence fields; Raw view renders redacted raw_payload_ref, redaction_status, provider_payload_hash, omitted evidence counts, and permission state without exposing secrets.
gui_related: true
gui_classification_reason: Defines visible chat context, usage, compact, detail-pane, and message inspection behavior.
depends_on: [ACD-092, ACD-410, UF-085, UF-086, UF-087, RAP-043]
unblocks: []
acceptance_criteria:
  - The click-opened context status module displays provider authority, estimated cost or value state, stale projection state, partial settlement state, unknown confidence or value state, hidden_byok, hidden_subscription, disabled, and not_exposed states using UsageRecord value_state, projection state, settlement_status, cost_status, source_class, source_authority, and source_confidence values high, medium, low, or unknown, not chat-local math.
  - "`More Details` opens the editor-tab Context Detail Pane through route/open and preserves usage_event_ref plus attempt_id, provider_attempt_ref, node_id, tool_call_id, trace_ref, receipt refs, and raw_payload_ref when present."
  - "`Compact Now` dispatches only `cmd.chat.compact_context`, preserves the context epoch, and does not mutate or recompute historical UsageRecord totals."
  - Context Detail Pane displays cache_read, cache_write, cache_write_1h or cache_write_ttl, output_total, output_visible, reasoning/thoughts, provider_total, context_estimate, counting_semantics, settlement_status, and projection_freshness when present.
  - Message info-popover shows human-readable fields first and deep-links to the message's canonical usage/context record rather than constructing a second message usage schema.
  - Raw view shows redacted refs, hashes, omitted counts, and permissioned-unavailable states, and never displays credentials, account identifiers, unredacted provider payloads, or local machine paths.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - future GUI usage projection fixture suite
risk_class: chat_usage_projection_false_pass
reasoning_tier: high
context_scope: assistant_chat_usage_projection
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: assistant_chat_usage_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/assistant-chat-design.md:1217-1248"
  - "Plans/assistant-chat-design.md:1706-1720"
  - "Plans/usage-feature.md:156-194"
  - "Plans/usage-feature.md:5412-5605"
  - "Plans/Runtime_Artifacts_Panel.md:262-316"
  - "uploaded:opencode-dev/packages/app/src/components/session-context-usage.tsx"
  - "uploaded:opencode-dev/packages/app/src/components/session/session-context-tab.tsx"
  - "https://github.com/anomalyco/opencode/issues/30649"
preserved_exact_tokens:
  - Context Detail Pane
  - context circle
  - More Details
  - Compact Now
  - Curated
  - Raw
  - UsageRecord
  - usage_event_ref
  - provider_attempt_ref
  - raw_payload_ref
  - source_confidence
  - settlement_status
  - counting_semantics
negative_constraints:
  - Do not implement a chat-local cost model or message-local usage schema.
  - Do not treat context_estimate as billing, cost, quota, or provider authority.
  - Do not make context module disclosure dispatch compaction or detail navigation without explicit user action.
  - Do not expose unredacted raw provider payloads, credentials, account identifiers, or local paths in Raw view.
  - Do not keep `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, or `cmd.chat.close_thread_usage` as canonical chat commands.
stale_retired_dispositions:
  - "Hover-opened context status module retired per PMConcept7 context ring canon; the module opens on click (ACD-441) and ring hover shows only an accent glow affordance."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```
