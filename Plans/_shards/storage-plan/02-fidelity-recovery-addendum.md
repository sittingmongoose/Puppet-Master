## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-002: Owner-first fidelity recovery order
- Coverage rows: cov-002
- Fidelity gap refs: cov-002
- Required fidelity items:
- Exact required item: Apply owner-doc corrections before consumer and mirror cleanup
- Exact required item: Rerun fidelity audit only after owner and consumer corrections are in place
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-002: Owner-first fidelity recovery order` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-002` repair states the exact requirement: Apply owner-doc corrections before consumer and mirror cleanup
- Exact acceptance check: The `cov-002` repair states the exact requirement: Rerun fidelity audit only after owner and consumer corrections are in place
- Exact acceptance check: The `cov-002` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-013: Shared governance/runtime record envelope

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0667
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - record and artifact must remain different objects
  - JSON summary export is not equivalent to canonical record export unless it preserves the exact record envelope
  - Preserve canonical ids/refs in artifact and record exports; do not invent export-local shadow identity.
  - config bundles, render exports, artifact exports, and Orchestrator record exports are different families and should not be blurred together
  - filtered JSON is not automatically a canonical record export
  - `Runtime_Artifacts_Panel.md` now has a stronger failure: it mandates a concrete envelope + 19 per-type JSON schema files that do not exist, making its validation contract unimplementable as written.
  - Runtime_Artifacts_Panel.md
  - export-family distinctions (Evidence / Artifact / Ledger / Run / Record)
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-013
- Fidelity gap refs: cov-013
- Required fidelity items:
- Exact required item: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact required item: Keep record objects distinct from artifacts and rendered summaries
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-013: Shared governance/runtime record envelope` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-013` repair states the exact requirement: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact acceptance check: The `cov-013` repair states the exact requirement: Keep record objects distinct from artifacts and rendered summaries
- Exact acceptance check: The `cov-013` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-018: Export taxonomy and manifest contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0668
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - what is the canonical manifest
  - `Evidence export`
  - Evidence export
  - `Artifact export`
  - Artifact export
  - `Ledger export`
  - Ledger export
  - `Ledger export` should be record-shaped first, CSV/JSON second
  - `Evidence export` should preserve evidence/artifact distinction
  - Candidate manifest fields:
  - Evidence / artifact export direction
  - Evidence export should likely include:
  - Artifact export should likely focus on:
  - Add a shared Orchestrator export manifest contract.
  - `Orchestrator_Page.md` still has relatively thin export language:
  - Orchestrator_Page.md
  - no strong run/evidence/history/record-bundle export contract yet
  - Good manifest fields:
  - export convenience must not redefine canonical source-of-truth
  - This means artifact export should remain linked to the exact record/identity model, not become a detached blob dump with lost context.
  - or re-query from canonical/current backing data before export
  - `Runtime_Artifacts_Panel.md` depends on artifact identity opens without fully owning the resolver contract, so the open-by-identity behavior still risks being re-invented per surface.
  - Runtime_Artifacts_Panel.md
  - `storage-plan.md` and `FinalGUISpec.md` are already speaking in stronger identity terms (`preview_subject_id`, `doc:<document_id>`, `artifact:<artifact_id>`), but that identity model has not been lifted into the cross-cutting contract layer.
  - storage-plan.md
  - FinalGUISpec.md
  - preview_subject_id
  - doc:<document_id>
  - artifact:<artifact_id>
  - any non-trivial bundle export should preserve canonical IDs/refs and include a manifest
  - Reuse `Project_Output_Artifacts.md` manifest discipline as the strongest model for general export bundles.
  - Project_Output_Artifacts.md
  - `FinalGUISpec.md` and adjacent docs already contain enough `doc:` / `artifact:` / `generated://` concepts to imply `OpenSubject`, but there is still no owner contract stating that split directly.
  - doc:
  - artifact:
  - generated://
  - OpenSubject
  - shared Orchestrator export manifest contract
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-018
- Fidelity gap refs: cov-018
- Required fidelity items:
- Exact required item: Define record export, bundle export, and view export as distinct export classes
- Exact required item: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-018: Export taxonomy and manifest contract` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-018` repair states the exact requirement: Define record export, bundle export, and view export as distinct export classes
- Exact acceptance check: The `cov-018` repair states the exact requirement: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Exact acceptance check: The `cov-018` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-020: Concern record family definition
- Coverage rows: cov-020
- Fidelity gap refs: cov-020
- Required fidelity items:
- Exact required item: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact required item: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-020: Concern record family definition` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-020` repair states the exact requirement: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact acceptance check: The `cov-020` repair states the exact requirement: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Exact acceptance check: The `cov-020` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-025: Concern lifecycle and resolution kinds

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0670
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - subject kinds should at minimum include `doc:<document_id>` and `artifact:<artifact_id>`
  - doc:<document_id>
  - artifact:<artifact_id>
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-025
- Fidelity gap refs: cov-025
- Required fidelity items:
- Exact required item: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact required item: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-025: Concern lifecycle and resolution kinds` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-025` repair states the exact requirement: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact acceptance check: The `cov-025` repair states the exact requirement: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Exact acceptance check: The `cov-025` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-039: Focused run and historical routing contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0671
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Routing contract direction
  - Reuse the same routing contract for:
  - Attempts have a clearer historical contract than other major record families.
  - Routing contract implication
  - live backing removed while historical identity may still persist
  - Research Progress - 2026-03-16 - GPT-5.2 Contract / Routing Deepening
  - `[retired-token-3]` still contradicts itself on persona field names, still truncates auth/account identity from its shared-runtime contract, still writes “blocked bundle” language against `[retired-token-1]`, and still contains a likely routing bug (`[retired-token-2]`) inside its pseudo-tier message keys.
  - [retired-token-3]
  - [retired-token-1]
  - [retired-token-2]
  - `UI_Command_Catalog.md` therefore has to carry routing meaning indirectly in per-command arg tables instead of relying on a shared contract family.
  - UI_Command_Catalog.md
  - That is useful, but it should be treated as one serialized transport form of the broader routing model, not as the hidden canonical navigation contract.
  - The routing and command-normalization model now depends on checks that `GATE-010` cannot express, which means the gate layer is behind the owner contract layer.
  - GATE-010
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-039
- Fidelity gap refs: cov-039
- Required fidelity items:
- Exact required item: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact required item: Keep cross-tab deep links and search pivots coherent on the focused run
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-039: Focused run and historical routing contract` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-039` repair states the exact requirement: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact acceptance check: The `cov-039` repair states the exact requirement: Keep cross-tab deep links and search pivots coherent on the focused run
- Exact acceptance check: The `cov-039` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-043: Source Control and worktree handshake
- Coverage rows: cov-043
- Fidelity gap refs: cov-043
- Required fidelity items:
- Exact required item: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact required item: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-043: Source Control and worktree handshake` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-043` repair states the exact requirement: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact acceptance check: The `cov-043` repair states the exact requirement: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Exact acceptance check: The `cov-043` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-044: Projection trust and action gating
- Coverage rows: cov-044
- Fidelity gap refs: cov-044
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-044: Projection trust and action gating` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-044` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-044` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-044` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-060: Lane vs worktree lifecycle split

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0673
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - lane/worktree lifecycle split
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-060
- Fidelity gap refs: cov-060
- Required fidelity items:
- Exact required item: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-060: Lane vs worktree lifecycle split` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-060` repair states the exact requirement: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Exact acceptance check: The `cov-060` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-074: Historical semantic consistency
- Coverage rows: cov-074
- Fidelity gap refs: cov-074
- Required fidelity items:
- Exact required item: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-074: Historical semantic consistency` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-074` repair states the exact requirement: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Exact acceptance check: The `cov-074` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-077: Project summary projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0674
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - parent-summary artifact vs evidence summary
  - Research Progress - 2026-03-16 - project summary and attention storage contract cluster
  - summary: Rewrote the work item bundle to the v2 artifact shapes and re-confirmed that mutation planning is still blocked because eight material blocker families remain.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-077
- Fidelity gap refs: cov-077
- Required fidelity items:
- Exact required item: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-077: Project summary projection` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-077` repair states the exact requirement: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact acceptance check: The `cov-077` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-080: Project attention projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0675
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - attention fields:
  - project card should surface background work independently from blocked attention
  - the attention center should still point to the canonical owning object and next action path, not just show copied banner text
  - `resume_url` can remain one serialized route form, but project attention should ultimately align with the shared internal route payload model
  - resume_url
  - primary attention reason field
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-080
- Fidelity gap refs: cov-080
- Required fidelity items:
- Exact required item: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-080: Project attention projection` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-080` repair states the exact requirement: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Exact acceptance check: The `cov-080` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-163: Coverage blocker concern lifecycle owner section
- Coverage rows: cov-163
- Fidelity gap refs: cov-163
- Required fidelity items:
- Exact required item: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact required item: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-163: Coverage blocker concern lifecycle owner section` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-163` repair states the exact requirement: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact acceptance check: The `cov-163` repair states the exact requirement: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Exact acceptance check: The `cov-163` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-176: Concern source-event vs record vs projection split
- Coverage rows: cov-176
- Fidelity gap refs: cov-176
- Required fidelity items:
- Exact required item: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-176: Concern source-event vs record vs projection split` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-176` repair states the exact requirement: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Exact acceptance check: The `cov-176` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-181: Runtime attribution ownership split

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0676
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Runtime_Artifacts_Panel.md` still collides with `Contracts_V0.md` on what “envelope” means, still requires missing schema files, still omits `attempt_id` from the common identity set, and still does not pin whether artifact attribution comes from embedded runtime snapshots or mandatory attempt joins.
  - Runtime_Artifacts_Panel.md
  - Contracts_V0.md
  - attempt_id
  - Runtime artifact schema ownership is still split awkwardly:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-181
- Fidelity gap refs: cov-181
- Required fidelity items:
- Exact required item: Let Contracts_V0 own cross-family attribution packet shape
- Exact required item: Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-181: Runtime attribution ownership split` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-181` repair states the exact requirement: Let Contracts_V0 own cross-family attribution packet shape
- Exact acceptance check: The `cov-181` repair states the exact requirement: Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins
- Exact acceptance check: The `cov-181` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-182: Bridge-field precedence for attempt/provider/usage/receipt joins

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0677
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Add a bridge-field precedence note to the canonical runtime/storage owner docs:
  - evidence / artifact joins still lack the canonical fields needed to move from runtime/worktree receipts to concrete artifact/evidence subjects.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-182
- Fidelity gap refs: cov-182
- Required fidelity items:
- Exact required item: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact required item: None of those bridge fields replace the primary local key
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-182: Bridge-field precedence for attempt/provider/usage/receipt joins` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-182` repair states the exact requirement: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact acceptance check: The `cov-182` repair states the exact requirement: None of those bridge fields replace the primary local key
- Exact acceptance check: The `cov-182` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-188: Projection fields for startup rehydration

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0678
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - startup recovery wakeups are named but not tied to a concrete blocked-episode restoration rule
  - startup recovery should rehydrate unresolved blocked episodes, not create fresh ones opportunistically
  - startup recovery still lacks a single owner, but GPT-5.2 also exposed that the governance UX wants a stable `blocked_owner` field that the canonical blocked projection schema still does not define.
  - blocked_owner
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-188
- Fidelity gap refs: cov-188
- Required fidelity items:
- Exact required item: Carry blocked_reason_code and lifecycle state in worktree projections for startup recovery
- Exact required item: Carry dirty_state and conflict_state in worktree projections
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-188: Projection fields for startup rehydration` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-188` repair states the exact requirement: Carry blocked_reason_code and lifecycle state in worktree projections for startup recovery
- Exact acceptance check: The `cov-188` repair states the exact requirement: Carry dirty_state and conflict_state in worktree projections
- Exact acceptance check: The `cov-188` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-190: Artifacts index exact indexed fields
- Coverage rows: cov-190
- Fidelity gap refs: cov-190
- Required fidelity items:
- Exact required item: Index attempt_id and thread_id in artifact index families to preserve attempt-native artifact routing
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-190: Artifacts index exact indexed fields` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-190` repair states the exact requirement: Index attempt_id and thread_id in artifact index families to preserve attempt-native artifact routing
- Exact acceptance check: The `cov-190` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-205: Lane cleanup lineage fields
- Coverage rows: cov-205
- Fidelity gap refs: cov-205
- Required fidelity items:
- Exact required item: Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-205: Lane cleanup lineage fields` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-205` repair states the exact requirement: Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families
- Exact acceptance check: The `cov-205` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-20
**Status:** Implementation checklist + detailed design
**Cross-references:** Plans/rewrite-tie-in-memo.md, Plans/assistant-chat-design.md (§10-§11, §24), Plans/assistant-memory-subsystem.md, Plans/usage-feature.md, Plans/FileManager.md (§2.9), Plans/Tools.md (§8.0, §8.4 -- tool events and rollups), AGENTS.md. **Validation:** Deterministic verifier gates plus SSOT acceptance/evidence contracts are authoritative for this stack (`python3 scripts/pm-plans-verify.py run-gates`, `Plans/Progression_Gates.md`, `Plans/evidence.schema.json`); SQLite remains off the table.

---

