# Shard 059: Usage GUI Propagation Addendum - 2026-07-09

Source: `Plans/assistant-chat-design.md`

Source lines: L24629-L24716

Source SHA256: `a1e62de14816f795e9fc94a55c2795ad1d75949b990d7aa6e5c0b78d5622f373`

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
  The chat header context circle, click-opened status module, More Details, Compact Now, Context
  Detail Pane and message-info popover consume the canonical UsageRecord/context projections used by
  the other Usage consumers, with no chat-local cost calculator or second message schema. The
  click-opened module and existing thread detail tab retain capacity, effective window/model,
  tokens, estimated cost, quota/value state, freshness/settlement, cache and useful
  compaction/transition status. More Details uses canonical route/open and Compact Now dispatches
  only cmd.chat.compact_context without rewriting historical totals. Correlation identities,
  raw_payload_ref, redaction/hash/omission/source records remain internal for enforcement/debugging.
  Normalized human-readable message facts remain available; chat has no Curated/Raw
  source-inspection view, source-composition chart or per-run inclusion receipt.
gui_related: true
gui_classification_reason: Defines visible chat context, usage, compact, detail-pane, and message inspection behavior.
depends_on: [ACD-092, ACD-410, UF-085, UF-086, UF-087, RAP-043]
unblocks: []
acceptance_criteria:
  - "The click-opened context status module displays provider authority, estimated cost or value state, stale projection state, partial settlement state, unknown confidence or value state, hidden_byok, hidden_subscription, disabled, and not_exposed states using UsageRecord value_state, projection state, settlement_status, cost_status, source_class, source_authority, and source_confidence values high, medium, low, or unknown, not chat-local math."
  - "More Details opens the existing thread Context Detail Pane through route/open; canonical event/attempt/tool/trace/raw-payload correlations are preserved internally, not displayed as source-inclusion receipts."
  - "`Compact Now` dispatches only `cmd.chat.compact_context`, preserves the context epoch, and does not mutate or recompute historical UsageRecord totals."
  - "Context Detail Pane displays cache_read, cache_write, cache_write_1h or cache_write_ttl, output_total, output_visible, reasoning/thoughts, provider_total, context_estimate, counting_semantics, settlement_status, and projection_freshness when present."
  - "Message info-popover shows human-readable fields first and deep-links to the message's canonical usage/context record rather than constructing a second message usage schema."
  - "Chat context and message-info surfaces show normalized capacity/cost/model/value-state/settlement facts and useful compaction status; source composition, Raw/Curated source inspection and per-run inclusion receipts are absent. Internal records retain redaction, hash, omission and permission context."
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
  - "DL-475; settings batch 2 round r2 complete context-inspection sweep, 2026-11-12"
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
  - "Do not implement a chat-local cost model or message-local usage schema."
  - "Do not treat context_estimate as billing, cost, quota, or provider authority."
  - "Do not make context module disclosure dispatch compaction or detail navigation without explicit user action."
  - "Do not expose source composition, raw/curated source inspection, inclusion receipts, raw payload refs, hashes or internal omission/source records through ordinary chat context/message UI."
  - "Do not keep cmd.chat.open_thread_usage, cmd.chat.focus_thread_usage or cmd.chat.close_thread_usage as canonical chat commands."
  - "Do not restore user-facing context source inspection or per-run inclusion receipts through a legacy title, preserved token, shared projection or saved view state."
stale_retired_dispositions:
  - "Hover-opened context status module retired per PMConcept7 context ring canon; the module opens on click (ACD-441) and ring hover shows only an accent glow affordance."
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
```
