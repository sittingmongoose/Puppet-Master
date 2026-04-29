## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-032: Concern linkage to adjacent families

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0483
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `concern source event/ref` = review finding, corroboration result, blocked episode, patch result, recovery outcome, etc. that supports the concern
  - concern source event/ref
  - unresolved concern or corroboration tied to outputs from that lane
  - Keep concern separate from review findings, annotations, blocked episodes, and recovery records while allowing rich cross-linking.
  - missing families now matter more because the rewrite depends on concerns, promotions, corroboration, graph patches, and recovery as first-class durable objects
  - `Executor_Protocol.md` has no concern model, no corroboration lifecycle, no wake reasons for concern/promotion/governance boundaries, and no dual-overseer actor model
  - Executor_Protocol.md
  - `UI_Command_Catalog.md` still leaves the runtime command layer under-owned: deprecated graph recovery commands are still presented as live canon, HITL `approve_continue` still has no canonical `cmd.*` mapping, cross-surface pivot payloads still lack rewrite-era structural keys, and there are still no stable `cmd.account.*`, `cmd.concern.*`, or `cmd.promotion.*` families.
  - UI_Command_Catalog.md
  - approve_continue
  - cmd.*
  - cmd.account.*
  - cmd.concern.*
  - cmd.promotion.*
  - Define canonical command families for account operations, concern operations, and promotion operations, and explicitly map HITL `allowed_action_ids` into stable `cmd.*` handlers.
  - allowed_action_ids
  - account/auth controls, concern actions, and promotion actions still have no canonical command-family owner, and command/wiring schemas still cannot encode projection-freshness/health gating for mutating actions.
  - Lane, seam, package, concern, and promotion routes are still mostly implied by UI prose instead of declared as canonical navigation identities.
  - Adjacent owners implicated by this seam:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-032
- Fidelity gap refs: cov-032
- Required fidelity items:
- Exact required item: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact required item: Allow blocked episodes to reference concerns without replacing concern identity
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-032: Concern linkage to adjacent families` exists in `Plans/Run_Graph_View.md`.
- Exact acceptance check: The `cov-032` repair states the exact requirement: Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Exact acceptance check: The `cov-032` repair states the exact requirement: Allow blocked episodes to reference concerns without replacing concern identity
- Exact acceptance check: The `cov-032` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-038: Focused run and historical routing contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0484
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `History` rows can load a historical run into the graph/evidence
  - History
  - but there is no clear mode contract for what the whole page is in after a historical run is selected
  - distinguish `active run truth` from `focused run context`
  - active run truth
  - focused run context
  - `focus_mode = historical` when the user is inspecting any non-active run
  - focus_mode = historical
  - `Historical Run Mode`
  - Historical Run Mode
  - `History` selection changes the whole page's focused run
  - `Progress` in historical mode must stop pretending to be a live dashboard and instead become a historical summary for that run, or show a reduced/locked state with a switch-back-to-live CTA
  - Progress
  - in historical mode, `Progress` becomes a historical run summary surface
  - Add a first-class `Historical Run Mode` UI contract for Orchestrator.
  - Define how `Progress` behaves when the focused run is historical.
  - The page must not auto-switch focus away from a historical run just because live activity appears.
  - The user should always know whether they are looking at the active run or a historical run.
  - when a result belongs to another run, selecting it should explicitly switch the focused run
  - the UI should disclose that the focused run changed because of the search result
  - Historical results must preserve run context clearly so search does not create silent run-focus jumps.
  - lane may still be historical
  - `historical run` must not imply:
  - historical run
  - `historical run`
  - `historical run` = any non-active/non-focused run retained for the project
  - Cross-run navigation should switch focus to the selected run, not imply that the selected object is part of the currently focused run's lineage.
  - Historical run views should show the frozen requested/effective state from that run, not recompute from current settings.
  - historical run views must stay frozen to historical requested/effective state
  - historical object retained in the model, but not an active live lane
  - `Historical Run`
  - Historical Run
  - historical run package with manifest + linked artifacts/records
  - historical-run mode will feel broken if some `Progress` widgets silently follow live events while others honor the focused historical run
  - remote-mode docs still leave GitHub REST side effects local while remote agents run elsewhere, without a clear orchestration boundary contract
  - This seam is what prevents the new route-target contract from immediately turning back into per-surface deep-link spaghetti.
  - `open_intent` is the caller’s direct purpose for opening the subject. It belongs to the subject-open contract because the same subject can be opened as source, preview, or review entry.
  - open_intent
  - `[retired-token-1]` still has unresolved MVP/gating contradictions, missing rename approval command/event families, no clear plan-mode rule for mutating LSP operations, and no multi-project-tab routing contract.
  - [retired-token-1]
  - This seam is owner-level, not consumer-level. Fixing `[retired-token-3]` or `[retired-token-2]` first would still leave stale routing at the top of the precedence stack.
  - [retired-token-3]
  - [retired-token-2]
  - default search scope = focused run, widening to project/all-runs, and required disclosure when search changes focused run
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
- Coverage rows: cov-038
- Fidelity gap refs: cov-038
- Required fidelity items:
- Exact required item: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact required item: Keep cross-tab deep links and search pivots coherent on the focused run
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-038: Focused run and historical routing contract` exists in `Plans/Run_Graph_View.md`.
- Exact acceptance check: The `cov-038` repair states the exact requirement: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact acceptance check: The `cov-038` repair states the exact requirement: Keep cross-tab deep links and search pivots coherent on the focused run
- Exact acceptance check: The `cov-038` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

