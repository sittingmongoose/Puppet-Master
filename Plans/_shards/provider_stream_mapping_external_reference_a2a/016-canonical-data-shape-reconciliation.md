# Shard 016: Canonical data-shape reconciliation

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L358-L379

Source SHA256: `a497a4740f6579a773ecc70aced0ba62b3da2bd91e4afd75b33b83340508eee4`

---

## Canonical data-shape reconciliation
### Required data shape

#### Acceptance carry-through
- Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id
- Define Approval Scope Key across actor/lane/run/account context and reuse it across permissions, HITL, doom-loop, and session approval caching
- In `## Canonical data-shape reconciliation` -> `### Required data shape`, store upstream OpenCode/A2A session identifiers in provider-native correlation fields rather than canonical `thread_id`.
- Keep runtime/provider continuity split by requiring bridge-only correlation fields plus `provider_attempt_ref?` without replacing PM runtime identity.
- Define and reuse `approval_scope_key` across permissions, HITL, doom-loop protection, and session approval caching for this bridge surface.

#### P5 provider-stream continuity recovery requirements

- The doc internally contradicts itself on attempt continuity: - 2026-03-09 addenda say normalized streams MUST preserve `attempt_id` - but none of the reserved diagnostic category schemas actually expose `attempt_id` - adapters currently have no canonical way to satisfy both requirements at once
- `tier_boundary` is not just stale prose here; it is a reserved diagnostic category with hard detail keys (`from_tier` / `to_tier`). That means the tier model is still embedded at the stream-schema layer and cannot be reconciled by a simple terminology sweep.
- Provider continuity fields like `provider_attempt_ref?` are named but still not owned by a stable schema slot.
- The provider boundary still lacks a legal place for rewrite-era correlation and pressure semantics: - bridged envelopes remain thinner than their own addenda - A2A still forbids new categories while the rewrite needs actor/role/account/switch/trust signals at the stream layer - `provider_attempt_ref?` and similar continuity fields are still conceptually present but not fully owned by a stable schema slot
- The A2A addenda require `attempt_id` continuity, but the schema anchor never permits it explicitly.
- Treat interview-phase `tier_id`-style coordination keys as legacy/local labels only; do not let them become canonical ownership or routing keys.
- Add explicit versioning/migration notes where A2A or bridged categories/fields must grow.
- Model-wave synthesis from Claude Opus 4.6 fleet sweep across Plans/**. Focuses on Orchestrator-model impact from the transition away from Phase/Task/Subtask/Iteration tier hierarchy toward a node-graph / work-package / feature-seam execution model.
- OpenCode and other bridged runtimes may switch or obscure upstream accounts behind the bridge; the docs currently do not say whether this is capturable, opaque-but-accepted, or a hard gap.
- Keep page-tab and panel-subview resolution as destination-layer concepts, not core identity concepts.
