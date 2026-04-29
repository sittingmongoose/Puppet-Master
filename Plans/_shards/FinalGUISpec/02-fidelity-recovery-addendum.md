## Fidelity recovery addendum

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0257
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Do not assume package/lane/run/worktree metadata can all be shown at full fidelity at once in the panel.
  - `Recovery in progress`
  - Recovery in progress
  - `resume_url` exists for wizard/thread recovery, but no generalized equivalent is yet defined for:
  - resume_url
  - workspace/isolation refs required for side effects and recovery
  - earlier addendum requires `resume_url`
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-022: Concern record family definition

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0295
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Define an append-only account-switch / pressure-episode family with shared projection consumers.
  - missing project-summary / project-attention projection family
  - no first-class concern record/lifecycle/projection model appears in `FinalGUISpec.md`
  - FinalGUISpec.md
  - GATE evidence still cannot verify `attention_required` persistence because the storage/event family for that state remains unowned.
  - attention_required
  - Research Progress - 2026-03-16 - Wrapper commands vs explicit `cmd.nav.*` family
  - cmd.nav.*
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-022
- Fidelity gap refs: cov-022
- Required fidelity items:
- Exact required item: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact required item: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-022: Concern record family definition` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-022` repair states the exact requirement: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact acceptance check: The `cov-022` repair states the exact requirement: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Exact acceptance check: The `cov-022` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-027: Concern routing and object-first search behavior

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0296
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Required behavior:
  - distinguish `global object search` from `tab-local filtering`
  - global object search
  - tab-local filtering
  - `tab-local search`
  - tab-local search
  - tab-local search stays embedded in tabs like Graph/Evidence/Ledger
  - search should prefer stable object identity matches first
  - structured canonical object used by projections, search, history, and ledger
  - Search and deep-link routing now need object-kind vocabulary to avoid ambiguity.
  - search filters and ledger inspectors should be able to distinguish:
  - Tighten artifact/file routing around stable object identity:
  - define requested-vs-effective admin capability UI and blocked-state behavior
  - stored `resume_url` fields can remain for portability, but must not imply a separate routing ontology
  - resume_url
  - `required` concrete-account requests should not silently degrade into ordinary switching behavior
  - required
  - `Run_Modes.md` still does not resolve the Contribute(PR) vs DAE isolation conflict, DAE-jail durability across pause/resume, the `yolo` step-1 vs step-7 guard ambiguity, `external_publish_side_effect` behavior inside DAE, or mid-run account-switch invalidation of committed strategy.
  - Run_Modes.md
  - yolo
  - external_publish_side_effect
  - Research Progress - 2026-03-16 - Bridge-field behavior for `provider_attempt_ref`, `usage_event_ref`, and receipts
  - provider_attempt_ref
  - usage_event_ref
  - Update `FinalGUISpec.md` so `OpenFile` remains true for workspace files, while identity-native opens route through `OpenSubject` under the same higher-level routing model.
  - FinalGUISpec.md
  - OpenFile
  - OpenSubject
  - If this owner split is not made explicit, generated docs/artifacts and preview-backed opens will keep leaking path-based assumptions back into the routing model.
  - Research Progress - 2026-03-16 - Shell/workspace state should remain adjacent to routing, not inside it
  - Canonical routing may carry enough view intent to answer:
  - The right question for routing is “where should the user land,” not “how should every panel be laid out when they get there.”
  - Research Progress - 2026-03-17 - Routing owner-doc adoption map
  - Keep the routing tranche centralized in owner docs before touching broad consumer prose.
  - Research Progress - 2026-03-17 - Routing collision with tier-era consumer docs
  - The canonical routing model is now ahead of several high-traffic consumer docs.
  - cross-surface CTA language is newer and should normalize through object-first `route_target` behavior instead of tier-local pivots
  - route_target
  - `tier_id` is still treated as canonical execution and navigation identity in places where the rewrite now requires `run_id + node_id + attempt_id? + blocked_sequence?` with object-first routing.
  - tier_id
  - run_id + node_id + attempt_id? + blocked_sequence?
  - The routing rewrite requires `usage_event` to be a first-class routed object, but `usage-feature.md` still describes usage navigation mostly as page-local filtering behavior.
  - usage_event
  - usage-feature.md
  - but the doc still frames open/link behavior in artifact-panel terms and still uses a `task_id` rule that reflects older task-granularity language
  - task_id
  - `assistant-chat-design.md` is already using stable object identity for search/jump behavior.
  - assistant-chat-design.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-027
- Fidelity gap refs: cov-027
- Required fidelity items:
- Exact required item: Concern search results must route as object-first results with focused-run and target-tab context
- Exact required item: Concern drill-downs must preserve selected concern id and related object context
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-027: Concern routing and object-first search behavior` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-027` repair states the exact requirement: Concern search results must route as object-first results with focused-run and target-tab context
- Exact acceptance check: The `cov-027` repair states the exact requirement: Concern drill-downs must preserve selected concern id and related object context
- Exact acceptance check: The `cov-027` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-030: Concern action policy and authority model
- Coverage rows: cov-030
- Fidelity gap refs: cov-030
- Required fidelity items:
- Exact required item: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact required item: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-030: Concern action policy and authority model` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-030` repair states the exact requirement: Define actor authority, confirmation, rationale, reversibility, and audit fields for concern actions
- Exact acceptance check: The `cov-030` repair states the exact requirement: Keep acknowledged, dismissed, resolved, and structural lineage edits as distinct actions
- Exact acceptance check: The `cov-030` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-047: Projection trust and action gating

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0297
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Projection trust/freshness needs a separate vocabulary from preview/browser `trust_tier`; these are currently at risk of semantic collision.
  - trust_tier
  - attention/blocker projection
  - lane/worktree projection
  - account/usage pressure projection
  - `refreshing`: old committed projection still visible while refresh/rebuild runs
  - refreshing
  - `[retired-token-1]`: show run-level trust banner or chip when projections are stale/degraded
  - [retired-token-1]
  - Make `trust state` and `last updated` first-class UI fields for projection-backed surfaces.
  - trust state
  - last updated
  - `Projection trust degraded`
  - Projection trust degraded
  - not all surfaces need the same trust threshold
  - should show visible freshness state and route users to native tabs for exact inspection when trust drops
  - The trust model needs visible UI grammar, not just backend states.
  - `Projection degraded`
  - Projection degraded
  - Research [retired-token-1] - 2026-03-16 - Notifications / Escalation Interaction with Concerns, Blocked Ownership, and Projection Trust
  - Because projection trust now matters, some notification copy needs qualification.
  - `Projection degraded; showing canonical history only`
  - Projection degraded; showing canonical history only
  - projection trust should affect notification confidence, not only action gating
  - Projection consumers still cannot derive complete account/pressure truth from provider/runtime streams:
  - Projection trust should be derived from committed state and receipts, not reinvented per page with ad-hoc polling language.
  - Add a canonical project-summary projection, likely alongside `projects:v1` rather than inside raw shell UI state.
  - projects:v1
  - Add a shared `project_attention_item` projection or equivalent normalized row model.
  - project_attention_item
  - if an attention item is projection-derived rather than canonical-runtime-backed, the row should show that reduced trust explicitly and avoid overconfident imperative copy
  - `trust_tier` is already occupied by Preview, so projection-freshness trust needs a distinct name.
  - Rename or explicitly separate projection-freshness trust vocabulary from Preview `trust_tier`.
  - one canonical project-summary / project-attention projection owner
  - Research [retired-token-1] - 2026-03-16 - GPT-5.3-Codex Identity / Projection Closure
  - still needs governance families, route-payload normalization, and projection-freshness gating
  - Add projection-freshness gating and typed route payloads to `UI_Command_Catalog.md`.
  - UI_Command_Catalog.md
  - projection freshness/health fields on projections
  - `FinalGUISpec.md` also sharpens the projection-state naming issue: generic “projection trust” language will collide with existing preview/browser `trust_tier`; the cleaner split remains `projection_freshness` vs `projection_health`.
  - FinalGUISpec.md
  - projection_freshness
  - projection_health
  - lane/worktree projection for current state
  - Recast `tier_runtime_record` as a current-view/runtime-overlay projection rather than the canonical execution owner.
  - tier_runtime_record
  - `tier_runtime_record` may survive, but only as a derived current-view/runtime-overlay projection.
  - `projection_freshness` and `projection_health` already exist; the missing transfer is the operational UI/gating/fallback layer, not simply "invent trust states."
  - `projection_freshness` / `projection_health` still exist; the missing transfer is the operational trust UI/gating/fallback layer.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-047
- Fidelity gap refs: cov-047
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-047: Projection trust and action gating` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-047` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-047` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-047` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-050: Progress-only widget hostability
- Coverage rows: cov-050
- Fidelity gap refs: cov-050
- Required fidelity items:
- Exact required item: Restrict widget-composed Orchestrator surface to Progress
- Exact required item: Persist orchestrator:progress layout separately from Dashboard and Usage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-050: Progress-only widget hostability` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-050` repair states the exact requirement: Restrict widget-composed Orchestrator surface to Progress
- Exact acceptance check: The `cov-050` repair states the exact requirement: Persist orchestrator:progress layout separately from Dashboard and Usage
- Exact acceptance check: The `cov-050` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-052: Shared escalation ladder

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0299
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Operational identities must be displayable with provider/account identity but must not imply shared token ownership.
  - Provider/runtime boundaries still cannot express enough account-health state for shared account-pressure/degraded-trust UI:
  - they deep-link into Usage/Ledger by shared identity
  - consumer docs: only describe how their surfaces use the shared primitives
  - Add a shared route-activation override rule in the contract/GUI owner docs.
  - page-wide shared `focused_run_id` coherence across tabs
  - focused_run_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-052
- Fidelity gap refs: cov-052
- Required fidelity items:
- Exact required item: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact required item: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-052: Shared escalation ladder` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-052` repair states the exact requirement: Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications
- Exact acceptance check: The `cov-052` repair states the exact requirement: Keep attention_required distinct from blocked and resurface persistent blockers on meaningful change/persistence
- Exact acceptance check: The `cov-052` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-058: Action-surface policy
- Coverage rows: cov-058
- Fidelity gap refs: cov-058
- Required fidelity items:
- Exact required item: Default bulk actions to navigation and triage rather than live execution mutation
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-058: Action-surface policy` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-058` repair states the exact requirement: Default bulk actions to navigation and triage rather than live execution mutation
- Exact acceptance check: The `cov-058` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-062: Glossary and help governance
- Coverage rows: cov-062
- Fidelity gap refs: cov-062
- Required fidelity items:
- Exact required item: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact required item: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-062: Glossary and help governance` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-062` repair states the exact requirement: Expand Glossary.md to cover rewrite-critical objects, states, and trust terms
- Exact acceptance check: The `cov-062` repair states the exact requirement: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Exact acceptance check: The `cov-062` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-067: Notification routing policy

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0300
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `system notification`
  - system notification
  - Concerns now need to align with the newer notification model:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-067
- Fidelity gap refs: cov-067
- Required fidelity items:
- Exact required item: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact required item: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-067: Notification routing policy` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-067` repair states the exact requirement: Route notifications using severity, execution impact, blocked owner, persistence, and projection trust
- Exact acceptance check: The `cov-067` repair states the exact requirement: Allow quiet windows for advisory warnings but not for canonical blocked episodes
- Exact acceptance check: The `cov-067` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-071: Canonical route payload

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0301
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - some route activations should update stored view state
  - if the target surface is degraded, the route should still land on the canonical fallback representation when possible rather than fail opaque
  - Artifact/file/evidence surfaces still cannot route deterministically by project/attempt/generated identity without more first-class owner fields.
  - Use `cmd.nav.*` or equivalent wrappers to route through `route_target` without forcing every consumer doc to restate the model.
  - cmd.nav.*
  - route_target
  - Without a sub-selection rule, route payloads will either bloat or every surface will go back to inventing custom anchor fields.
  - The route model needs destination intent, but only at the coarse-surface level.
  - The docs do not yet clearly say when route activation should override a remembered subview versus reuse the current/persisted one.
  - route activation overrides remembered state only when required to satisfy the requested destination/object/context
  - `target_kind` is required because the route layer still needs to know what class of destination it is restoring, rather than infer everything from object identity.
  - target_kind
  - surface-local state belongs to persisted shell/view state, not to canonical route identity.
  - Keep wizard-step detail as a narrow serialized anchor, not a new top-level base route field.
  - `tab_id` is route focus refinement, not destination class and not object identity.
  - tab_id
  - `workspace_tab_id` and `browser_tab_id` remain real shell identities, but they are not canonical route `tab_id` values.
  - workspace_tab_id
  - browser_tab_id
  - keep `cmd.panel.switch` pure shell-facing and move object targeting through routed wrappers or normalized route args
  - cmd.panel.switch
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-071
- Fidelity gap refs: cov-071
- Required fidelity items:
- Exact required item: Treat resume_url as serialized transport of that route payload
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-071: Canonical route payload` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-071` repair states the exact requirement: Treat resume_url as serialized transport of that route payload
- Exact acceptance check: The `cov-071` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-079: Project summary projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0302
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Likely it needs a small project summary projection that rolls up:
  - one global layout for every project is too coarse once `Progress` reflects project-specific operational habits
  - Progress
  - Research Progress - 2026-03-16 - project summary and blocked-owner model cluster
  - `inspector_target = summary | history | reviews`
  - inspector_target = summary | history | reviews
  - `inspector_target = summary | history | reviews | lineage`
  - inspector_target = summary | history | reviews | lineage
  - summary: Re-audited the live owner and consumer docs in bounded chunks and further narrowed the unresolved set: several blockers remain real, but some exact-missing lists were overstated because the live docs already carry more receipt, glossary-label, and account-history canon than the compact gap bundle claimed.
  - summary: Ran one more narrow pass on the blocked-episode canon and confirmed that several gap-005 items were overstated as globally missing when they are actually owner-defined elsewhere and only missing from the Tools/chat/usage consumers.
  - summary: Re-audited the runtime-identity and account-history bundle for exact partial-transfer locations and replaced several pseudo-target headings with the real live sections that currently carry the partial canon.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-079
- Fidelity gap refs: cov-079
- Required fidelity items:
- Exact required item: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact required item: Give canonical blocked episodes precedence over weaker derived warnings
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-079: Project summary projection` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-079` repair states the exact requirement: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact acceptance check: The `cov-079` repair states the exact requirement: Give canonical blocked episodes precedence over weaker derived warnings
- Exact acceptance check: The `cov-079` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-082: Project attention projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0303
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - attention center rows should identify the owning object and likely next surface, not merely repeat severity
  - if the canonical source object already owns durable history, the attention row may stay projection-level but must preserve a stable `source_object_ref`
  - source_object_ref
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-082
- Fidelity gap refs: cov-082
- Required fidelity items:
- Exact required item: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-082: Project attention projection` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-082` repair states the exact requirement: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Exact acceptance check: The `cov-082` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-086: Requested concrete-account fields

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0304
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Prompt_Pipeline.md` still lacks a requested concrete-account field and still stores only singular `account_switch_reason?`
  - Prompt_Pipeline.md
  - account_switch_reason?
  - requested concrete-account gap
  - Research Progress - 2026-03-16 - requested concrete-account ownership cluster
  - scope required to make the target meaningful, such as `project_id`, `thread_id`, `focused_run_id`, or an explicitly requested panel/tab
  - project_id
  - thread_id
  - focused_run_id
  - local filters/sort/layout where they do not hide or distort the requested target
  - hide the requested target behind the wrong tab/subview
  - may reuse remembered Source Control subview only if it still exposes the requested target clearly
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-086
- Fidelity gap refs: cov-086
- Required fidelity items:
- Exact required item: Model requested_account_id separately from requested_account_policy
- Exact required item: Add requested_account_binding with none/preferred/required semantics and display Requested account / Requested binding / Effective account / Switch reason
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-086: Requested concrete-account fields` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-086` repair states the exact requirement: Model requested_account_id separately from requested_account_policy
- Exact acceptance check: The `cov-086` repair states the exact requirement: Add requested_account_binding with none/preferred/required semantics and display Requested account / Requested binding / Effective account / Switch reason
- Exact acceptance check: The `cov-086` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-090: Execution role and operational identity

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0305
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Source Control = compact Git/worktree operational panel
  - Every projection-backed operational surface should expose at least:
  - operational identity / actor role
  - Research Progress - 2026-03-16 - operational identity and actor-role disclosure cluster
  - operational identity may be displayed alongside provider/account identity
  - execution role / operational identity
  - `orchestrator-subagent-integration.md` still treats `Iteration` as a lowest execution tier and keeps significant logic at phase/task/subtask boundaries, even while newer addenda require node-first scheduling and runnable-unit identity.
  - orchestrator-subagent-integration.md
  - Iteration
  - `tier_runtime_record` may still survive, but only as a derived grouping/view object if execution ownership moves elsewhere
  - tier_runtime_record
  - Update surface specs so tier/group views carry pointers to canonical execution objects instead of using `tier_id` as the primary mutation/audit key.
  - tier_id
  - Research Progress - 2026-03-17 - Exact `tab_id` role and vocabulary
  - tab_id
  - Reconcile git/worktree coordination examples so they stop carrying `tier_id` as the operational identity anchor.
  - This is one of the clearest remaining consumer-layer pockets where the old execution model still shapes the UI.
  - Reconciliation should not reopen the execution model unless a new contradiction appears that is stronger than the current graph/seam/package/attempt/lane model already established.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-090
- Fidelity gap refs: cov-090
- Required fidelity items:
- Exact required item: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-090: Execution role and operational identity` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-090` repair states the exact requirement: Project them into effective-resolution, attempt, usage, and inspector surfaces
- Exact acceptance check: The `cov-090` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-096: Projection freshness vs projection health

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0306
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - UI freshness notifications should derive from committed projection state, not ad-hoc polling
  - blockers requiring action must not be trivially dismissible into a false sense of health
  - Projection freshness and degraded-trust remain under-specified at the command/surface layer:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-096
- Fidelity gap refs: cov-096
- Required fidelity items:
- Exact required item: Split projection_freshness from projection_health
- Exact required item: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Retired-token handling: exact retired tokens are preserved in packet metadata; live wording omits them.
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-096: Projection freshness vs projection health` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-096` repair states the exact requirement: Split projection_freshness from projection_health
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: exact source wording is preserved in packet metadata; live content uses retired-token-safe wording.
- Exact acceptance check: The `cov-096` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Fidelity recovery cov-179: Dismissed vs resolved rationale enforcement
- Coverage rows: cov-179
- Fidelity gap refs: cov-179
- Required fidelity items:
- Exact required item: Require distinct dismissal rationale and resolution rationale rules
- Exact required item: Treat accepted_risk as a resolution path rather than dismissal
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-179: Dismissed vs resolved rationale enforcement` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-179` repair states the exact requirement: Require distinct dismissal rationale and resolution rationale rules
- Exact acceptance check: The `cov-179` repair states the exact requirement: Treat accepted_risk as a resolution path rather than dismissal
- Exact acceptance check: The `cov-179` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-197: Blocked-owner eight-kind taxonomy and escalation ladder surfaces

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0308
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - exact-record surfaces should export canonical records, not UI-specific transformed rows
  - Add requested/effective + support-state disclosure blocks in runtime/history surfaces.
  - compact surfaces should show deltas only when they matter
  - Research Progress - 2026-03-16 - Projects Page Blocked-Owner / Status Model
  - Keep blocked-state persistence semantically stronger than dismissible warning surfaces.
  - large surfaces should degrade toward smaller, record-backed slices instead of trying to fake full live fidelity
  - The conversational/document-production surfaces already require runtime-identity visibility:
  - degraded surfaces should still be routable via canonical fallback views when possible
  - usage/account-pressure surfaces
  - `tier_tree` / `Tiers` ownership -> seam/worktree/package-native surfaces
  - tier_tree
  - Tiers
  - `Orchestrator_Page.md` still describes widgetized Tiers/Evidence/History/Ledger surfaces
  - Orchestrator_Page.md
  - Without a dedicated operational-identity layer, later UI surfaces will either:
  - current-state surfaces can stay simple, but history surfaces need the append-only truth
  - command/catalog/template/example integrity is still broken enough to miswire surfaces mechanically.
  - `blocked_sequence` should be runtime-owned, not invented by surfaces
  - blocked_sequence
  - still missing the deterministic policies that executor/storage/runtime surfaces now assume exist.
  - `Prompt_Pipeline.md` captures the immutable handoff bundle, but its later packet omits some fields that executor/runtime surfaces now want to inspect, such as blocked/recovery anchors when a resumed flow launches.
  - Prompt_Pipeline.md
  - Several important surfaces need more than just “open object X”:
  - evidence summaries as record-backed surfaces
  - The strongest final-pass pattern is exact structural breakage in owner docs and traceability surfaces:
  - still keys multiple surfaces and filters to `tier_id`
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-197
- Fidelity gap refs: cov-197
- Required fidelity items:
- Exact required item: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-197: Blocked-owner eight-kind taxonomy and escalation ladder surfaces` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-197` repair states the exact requirement: Define an explicit blocked-owner 8-kind taxonomy and 5-level escalation ladder with surface mapping
- Exact acceptance check: The `cov-197` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

### Recommended minimum concern record shape

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0310
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Concern importance is already established, but canonical storage/contract shape is still underdefined.
  - Recommended command-surface model
  - Minimum `worktree_projection` fields:
  - worktree_projection
  - Minimum `lane_record` / `lane_projection` should preserve:
  - lane_record
  - lane_projection
  - `attention_required` still lacks a durable persisted shape parallel to `blocked_notice`, so the gate’s evidence expectations remain only partially machine-verifiable.
  - attention_required
  - blocked_notice
  - Research Progress - 2026-03-16 - Minimum canonical field set for `route_target`
  - route_target
  - Research Progress - 2026-03-17 - Exact minimum field set for `OpenSubject`
  - OpenSubject
  - Research Progress - 2026-03-17 - Exact minimum field set for `route_target`
  - `cmd.panel.switch` is currently overloaded: it mixes pure shell-state switching with contextual object targeting in one args shape.
  - cmd.panel.switch
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-209
- Fidelity gap refs: cov-209
- Required fidelity items:
- Exact required item: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact required item: Keep `blocking_effect` explicitly separate from `severity`
- Acceptance checks represented:
- Exact acceptance check: The heading `### Recommended minimum concern record shape` exists in `Plans/FinalGUISpec.md`.
- Exact acceptance check: The `cov-209` repair states the exact requirement: Add `visibility_level`, `attention_level`, `chatworthy`, and `blocking_effect?` to the concern-family contract
- Exact acceptance check: The `cov-209` repair states the exact requirement: Keep `blocking_effect` explicitly separate from `severity`
- Exact acceptance check: The `cov-209` repair is in the owner section for `Plans/FinalGUISpec.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-22
**Status:** Authoritative specification for AI agent implementation
**Tech Stack:** Rust + Slint 1.15.1 (.slint markup compiled via slint_build)
**Renderer:** Default winit + Skia; fallback winit + FemtoVG-wgpu; emergency software renderer

---

