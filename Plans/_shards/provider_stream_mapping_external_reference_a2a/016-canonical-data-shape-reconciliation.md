# Shard 016: Canonical data-shape reconciliation

Source: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`

Source lines: L373-L399

Source SHA256: `a068e282f37be95699a82dba71b64c812aa14b7cf4ce556c2f7ed110b9eb6906`

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

Provider-stream continuity is resolved through the versioned common diagnostic-details slot in §5.1A and the facade owner in `Plans/CLI_Bridged_Providers.md`.

Normative requirements:
- every runtime-scoped reserved diagnostic category exposes PM runtime `attempt_id` through `ProviderDiagnosticDetailsV1`
- reconnect and observe-only provider flows preserve the same PM `attempt_id`
- retries, remediation reruns, prerequisite resumes, and restore-before-reruns create a new PM `attempt_id`
- `provider_attempt_ref?` records upstream provider/session/task continuity and MUST NOT replace PM runtime identity
- `correlation_id?` and `sequence?` preserve bridge ordering and replay/repair evidence when the upstream protocol provides it
- actor, account, trust, switch, and pressure signals are carried as references to owner records through `actor_ref?`, `account_ref?`, `trust_state_ref?`, and `pressure_state_ref?`
- `tier_boundary`, `from_tier`, and `to_tier` are compatibility/source diagnostic labels only; they do not reintroduce tier-era runtime ownership
- Treat interview-phase `tier_id`-style coordination keys as legacy/local labels only; do not let them become canonical ownership or routing keys.
- Add explicit versioning/migration notes when A2A or bridged fields grow beyond `ProviderDiagnosticDetailsV1`.
- Model-wave synthesis from Claude Opus 4.6 fleet sweep across Plans/**. Focuses on Orchestrator-model impact from the transition away from Phase/Task/Subtask/Iteration tier hierarchy toward a node-graph / work-package / feature-seam execution model.
- OpenCode and other bridged runtimes may switch or obscure upstream accounts behind the bridge; the docs currently do not say whether this is capturable, opaque-but-accepted, or a hard gap.
- Keep page-tab and panel-subview resolution as destination-layer concepts, not core identity concepts.
