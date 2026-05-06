- `Plans/usage-feature.md`

### Key findings
- Storage is already closer than the UI docs to a normalized record family model.
- `storage-plan.md` already defines several canonical records:
  - `attempt_record`
  - `tier_runtime_record`
  - `blocked_projection`
  - `usage_record`
  - `evidence_record`
  - `thread_blocked_notice`
  - `wizard_runtime_state`
  - cross-surface runtime receipt record
- `Contracts_V0.md` consistently uses:
  - `detail_ref?`
  - `*_ref`
  - explicit identity fields
  - canonical event fields instead of GUI-only aliases
- The rewrite now wants many additional first-class record families:
  - concerns
  - reviews
  - corroboration requests/results
  - promotions
  - graph patch requests/results
  - recovery records
- What is still missing is a shared envelope pattern that keeps those families structurally compatible.

### Recommended normalization direction
- Strong recommendation:
  - add one shared governance/runtime record-envelope pattern, then let each family add its own payload block
- Good base envelope fields:
  - `record_id`
  - `record_kind`
  - `schema_version`
  - `project_id`
  - `run_id?`
  - `scope_type`
  - `scope_id`
  - `status`
  - `created_at_utc`
  - `updated_at_utc?`
  - `summary`
  - `summary_kind?`
  - `detail_ref?`
  - `source_refs[]`
  - `artifact_refs[]`
  - `related_record_refs[]`
  - `lineage_refs[]`
  - `actor_ref?`
  - `requested_effective_snapshot_refs?`

### Record vs artifact distinction
- Important rule:
  - record and artifact must remain different objects
- Recommended distinction:
  - record
    - structured canonical object used by projections, search, history, and ledger
  - artifact
    - blob/file/renderable output linked from a record
- This matters because many current docs still talk loosely about “review output” or “patch output” without separating:
  - exact structured record
  - human-readable rendered summary
  - attached artifact(s)

### Family-specific payload direction
- Good pattern:
  - shared envelope + family payload block
- Candidate payload examples:
  - concern payload:
    - severity, category, owner, lifecycle, resolution_kind
  - promotion payload:
    - promotion_class, source_scope, target_scope, canonical verdict, revoked/reopened lineage
  - corroboration payload:
    - claim refs, corroborator refs, 2-of-3 outcome, unresolved minority concerns
  - graph patch payload:
    - patch point, target generation, resulting generation, requested reason, applied outcome
  - recovery payload:
    - blocked episode ref, action id, preconditions, result, safe-point refs
  - review payload:
    - review scope, findings counts, unresolved findings, verdict, canonical findings summary ref

### UI / search implication
- A normalized envelope would simplify several earlier seams at once:
  - object-first search
  - History vs Ledger distinction
  - deep-link routing
  - export manifests
  - cross-tab inspectors
- Search can index the shared envelope fields while preserving family-specific filters.
- `Ledger` can inspect exact record structure consistently across families without inventing a custom viewer for every new object.

### Historical semantics implication
- Shared envelopes also help apply the earlier semantic vocabulary consistently:
  - `historical`
  - `superseded`
  - `revoked`
  - `reopened`
  - `archived`
  - `removed`
- The envelope should not collapse these into one generic old-state bit.

### Contradictions / gaps surfaced
- Current records are partially normalized, but newer governance families still risk being invented ad hoc.
- Some current docs are better at record identity than at record-family consistency.
- Without a shared envelope, search, export, ledger inspection, and cross-tab deep links will likely re-encode the same concepts repeatedly.

### Candidate fixes to carry forward
- Define a shared record-envelope contract for governance/runtime record families.
- Keep artifacts and rendered summaries linked but separate from canonical records.
- Require new first-class Orchestrator object families to reuse the envelope and shared status/lineage conventions.
- Let family-specific payloads specialize under the shared envelope instead of inventing one-off top-level shapes.

### Do-not-forget details
- `detail_ref` and `*_ref` conventions already exist and should be expanded, not replaced
- canonical findings summaries and prose summaries are artifacts/views that must still resolve back to exact records
- the envelope should carry enough shared identity for search, export, and inspector routing without flattening family-specific meaning

## Research Progress - 2026-03-16 - Lane / Worktree Cleanup Lifecycle

### Targeted docs read
- `Plans/WorktreeGitImprovement.md`
- `Plans/GitHub_Integration.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The existing docs already imply that cleanup cannot be treated as a trivial delete:
  - worktree rows expose `recover`, `prune`, and `lineage` actions
  - active-run ownership must be visible before prune/remove
  - worktree actions must preserve safe-point and remediation lineage
  - `dirty_worktree` and `worktree_conflict` are explicit runtime blocked reasons
- `WorktreeGitImprovement.md` also already distinguishes important persistence cases:
  - unresolved conflict worktrees may need to survive until user resolution
  - recovery and repopulation across restart are real
  - safe-point restore must target the exact worktree/baseline
- What is still missing is a full lifecycle that separates:
  - logical lane history
  - live worktree existence
  - cleanup eligibility
  - archive/remove semantics

### Recommended lifecycle split
- Strong recommendation:
  - treat `lane lifecycle` and `worktree lifecycle` as related but non-identical
- Reason:
  - a lane may remain historically important after its live worktree is archived or removed
  - a live worktree may be operationally suspect even while the lane remains active in orchestration terms
- Good mental model:
  - lane = orchestration lineage object
  - worktree = concrete Git/filesystem backing object

### Recommended lane-oriented states
- Current lane vocabulary still looks right and should be kept:
  - `baseline`
  - `active`
  - `suspect`
  - `restoring`
  - `retained`
  - `cleanup_eligible`
  - `archived`
  - `removed`
  - `historical`
- Working interpretation:
  - `baseline`
    - canonical starting lane for a package pool
  - `active`
    - currently eligible/in use for live work
  - `suspect`
    - not safe for normal dispatch until examined or restored
  - `restoring`
    - in explicit recovery / restore / reconcile flow
  - `retained`
    - intentionally kept after completion/failure for inspection, compare, or delayed cleanup
  - `cleanup_eligible`
    - no longer needed for live execution and may be archived/removed under policy
  - `archived`
    - historical object retained in the model, but not an active live lane
  - `removed`
    - live backing removed; only historical identity and lineage remain
  - `historical`
    - user-facing historical posture rather than a dispatchable live posture

### Worktree-oriented state implication
- Source Control still needs a more concrete worktree-first vocabulary.
- Recommended worktree row posture:
  - `live`
  - `dirty`
  - `conflict`
  - `orphaned`
  - `recovering`
  - `retained`
  - `archived`
  - `removed`
- This should stay worktree-first in Source Control, with lane/package/run metadata attached.
- Orchestrator should continue to present the lane state and show worktree status in context.

### Cleanup-action semantics
- Important rule:
  - `recover`, `archive`, `prune`, and `remove` must not blur together
