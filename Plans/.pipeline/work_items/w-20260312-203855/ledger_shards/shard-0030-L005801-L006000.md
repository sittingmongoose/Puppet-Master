  - `stale_historical`
    - historical and explicitly not resumable/reusable for live execution
  - `superseded`
    - replaced by a newer canonical successor in the same lineage
  - `revoked`
    - previously accepted/promoted/active decision or state explicitly withdrawn
  - `reopened`
    - previously closed/accepted path returned to active question or work
  - `archived`
    - intentionally retained but removed from default active presentation
  - `removed`
    - live backing removed while historical identity may still persist

### Family-local lifecycle rule
- Strong recommendation:
  - do not force family-local workflows into the cross-family semantic core
- Examples:
  - annotation lifecycle:
    - `open -> addressed -> resolved`
  - concern lifecycle:
    - `active -> acknowledged -> resolved -> dismissed`
  - wizard status:
    - `attention_required` vs `blocked`
  - these should remain family-specific, while still allowing cross-family historical overlays where relevant

### Important contradiction surfaced
- There is a real contract conflict in `Plans/Contracts_V0.md` for `remediation.resolved`:
  - one section says resolution enum is:
    - `fixed`
    - `superseded`
    - `abandoned`
    - `replan_required`
  - another section defines minimum payload resolution as:
    - `success`
    - `failed`
    - `ceiling_exceeded`
- This is not just wording drift; it is a real semantic conflict.
- It matters because remediation lineage is one of the places where historical semantics, reopening, patching, and recovery all intersect.

### Remediation semantic direction
- Recommended fix direction:
  - remediation should use one canonical resolution family, and the richer lineage-aware enum looks more compatible with the rewrite than a coarse success/failed enum
- Reason:
  - `superseded` and `replan_required` matter for graph patch and generation lineage
  - `abandoned` is not the same thing as simple failure
  - a generic `failed` outcome loses too much historical meaning

### Blocked / resolved distinction
- Another important rule:
  - `resolved` does not always imply “the problem disappeared”
- Examples:
  - blocked episode can become historical after resolution, but still matters for audit and lineage
  - concern can resolve via `accepted_risk` or `superseded`, not only “fixed”
  - annotation `resolved` is a workflow completion signal, not necessarily the same as runtime problem disappearance
- This is exactly why the word `resolved` needs family-local payload detail rather than one global interpretation.

### Archived / removed / deleted direction
- Storage and UI already hint at an important distinction:
  - `archived`
  - `removed`
  - `deleted`
- Recommended rule:
  - preserve these as different meanings
- Examples:
  - thread archived vs deleted are already distinct
  - worktree archived vs removed are distinct
  - removed live backing should not imply erased canonical history

### Reopened / revoked / superseded direction
- Earlier research established these as important for promotions and graph/patch flows, but local docs are still uneven.
- Recommended rule:
  - `reopened`, `revoked`, and `superseded` should be reserved for true lineage-changing transitions, not generic “old state” labels
- This especially matters for:
  - promotions
  - seam/package completion truth
  - graph generations
  - recovery outcomes

### Search / ledger implication
- Shared historical semantics are important mainly because search and ledger need to render them consistently.
- Good rule:
  - search filters and ledger inspectors should be able to distinguish:
    - current vs historical
    - superseded vs revoked
    - archived vs removed
    - stale_historical vs merely historical
- Without that, the exact record-inspection surface will flatten the very distinctions the rewrite depends on.

### Contradictions / gaps surfaced
- `Contracts_V0.md` has a real `remediation.resolved` enum conflict.
- Several docs imply strong historical semantics, but those meanings are not yet summarized in one shared consistency rule.
- Some families clearly need local lifecycle terms, and the docs do not yet sharply separate “cross-family historical overlays” from “family-local workflow states.”

### Candidate fixes to carry forward
- Define a shared historical-semantic vocabulary for cross-family overlays:
  - `historical`
  - `stale_historical`
  - `superseded`
  - `revoked`
  - `reopened`
  - `archived`
  - `removed`
- Explicitly state that family-local workflow states remain distinct and are not collapsed into one universal lifecycle enum.
- Reconcile `remediation.resolved` to one canonical resolution enum, likely the richer lineage-aware variant.
- Make ledger/search/filter contracts preserve these distinctions rather than flattening them into generic “old” or “resolved.”

### Do-not-forget details
- consistency here means shared meaning, not one single lifecycle enum for every object family
- `resolved` is overloaded and needs family-local detail to stay meaningful
- the `remediation.resolved` contract conflict is a real reconciliation item, not just a wording preference

## Research Progress - 2026-03-16 - Concern Record Structure and Interaction Rules

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/chain-wizard-flexibility.md`
- existing concern clusters in the work-item ledger

### Key findings
- The local docs still do not define a canonical concern record family the way they define:
  - attempts
  - blocked projections
  - usage records
  - evidence records
  - wizard runtime state
- But adjacent durable-object patterns are now strong enough to use as guidance:
  - blocked episodes preserve identity across resolution
  - annotations have exact anchoring, lifecycle, and durable update rules
  - review outputs retain unresolved findings rather than collapsing everything into one pass/fail result
- This makes the concern gap more concrete:
  - concerns need exact identity, lineage, source linking, status, and interaction rules
  - they should not just be badges, notes, or review leftovers

### Concern vs adjacent object boundaries
- Strong recommendation:
  - keep concern distinct from:
    - review finding
    - annotation
    - blocked episode
    - graph patch request
    - recovery record
- Working split:
  - review finding
    - a finding produced by a review/corroboration/validation flow
  - concern
    - a durable tracked issue/observation that may aggregate, outlive, or be updated by multiple findings/events
  - blocked episode
    - runtime execution stop with canonical recovery metadata
  - annotation
    - document-review instruction/comment object with anchoring lifecycle
- A review can create or update concerns; a blocked episode can reference a concern; a patch/recovery can obsolete or resolve a concern; but these should remain different record families.

### Recommended minimum concern shape
- Recommended concern envelope + payload core:
  - `concern_id`
  - `project_id`
  - `run_id?`
  - `scope_type`
  - `scope_id`
  - `status`
  - `severity`
  - `category`
  - `summary`
  - `description?`
  - `owner_kind?`
  - `origin_kind`
  - `created_at_utc`
  - `updated_at_utc`
  - `first_observed_at_utc`
  - `last_observed_at_utc`
  - `resolution_kind?`
  - `resolution_rationale?`
  - `acknowledged_by?`
  - `acknowledged_at_utc?`
  - `dismissed_by?`
  - `dismissed_at_utc?`
  - `source_refs[]`
  - `evidence_refs[]`
  - `related_record_refs[]`
  - `lineage_refs[]`
  - `blocked_episode_refs[]?`
  - `promotion_refs[]?`
  - `graph_patch_refs[]?`
  - `recovery_refs[]?`

### Lifecycle direction
- The earlier lifecycle still stands:
  - `active`
  - `acknowledged`
  - `resolved`
  - `dismissed`
- The sharper rule now is:
  - `acknowledged` and `dismissed` are operator/user presentation/governance actions
  - `resolved` must carry exact resolution semantics
  - `active` remains the default live state even if the same concern has been seen multiple times

