  - higher-level objects like promotions, concerns, graph patches, recovery records, and lane/worktree lifecycle states are not yet using one shared semantic vocabulary
- There are several similar-but-different concepts in play:
  - `historical`
  - `stale_historical`
  - `superseded`
  - `revoked`
  - `reopened`
  - `archived`
  - `deleted` / `removed`
- These should not collapse into a generic "old" state.

### Recommended semantic split
- Strong recommendation:
  - separate `time status`, `replacement status`, and `validity status`
- Working interpretation:
  - `historical`
    - no longer current/live, but still part of valid history
  - `stale_historical`
    - historical and specifically not resumable/reusable as live execution state
  - `superseded`
    - replaced by a newer canonical successor for the same semantic slot
  - `revoked`
    - previously accepted/active decision or state was explicitly withdrawn
  - `reopened`
    - an object previously treated as settled/completed became active again
  - `archived`
    - hidden from default operational surfaces but retained and queryable
  - `removed`
    - live backing object is gone, but history may remain

### Important distinction examples
- `historical` vs `superseded`
  - every superseded object is historical
  - not every historical object is superseded
- `superseded` vs `revoked`
  - `superseded` = replaced by newer truth
  - `revoked` = prior acceptance/approval/promotion was invalidated or withdrawn
- `archived` vs `historical`
  - `historical` is record/time truth
  - `archived` is visibility/operational-surface policy
- `removed` vs `revoked`
  - `removed` is backing-object or storage-presence state
  - `revoked` is semantic validity state

### Candidate application by object family
- attempts
  - already have `stale_historical`
  - should also expose when an attempt is superseded by later remediation/graph generation
- promotions
  - need explicit distinction between:
    - current accepted promotion
    - historical prior promotion
    - revoked promotion
    - superseded promotion if replaced by a later accepted promotion
- concerns
  - lifecycle already includes `active`, `acknowledged`, `resolved`, `dismissed`
  - still needs historical semantics:
    - merged/split/superseded concern records
    - resolved-but-historical concern lineage
- graph patches
  - old path/generation is historical
  - invalidated prior path may be superseded by newer generation
  - the patch request/decision record itself may later be historical without being revoked
- recovery records
  - restore attempts and recovery episodes need current vs historical semantics
  - failed or abandoned recovery attempts should remain visible without masquerading as current recovery truth
- lane/worktree records
  - backing worktree may be removed
  - lane may still be historical
  - archival policy should be separate from semantic validity

### UI direction
- Recommended rule:
  - the UI should show these semantics explicitly and consistently, not infer them ad hoc by color or disappearance
- Examples:
  - `Historical`
  - `Superseded by Generation 4`
  - `Promotion Revoked`
  - `Reopened by New Evidence`
  - `Worktree Removed`
  - `Archived`
- This matters especially in:
  - Ledger exact records
  - History chronology
  - Graph generations
  - Seams completion/promotions
  - lane/worktree cleanup lifecycle

### Contradictions / gaps surfaced
- Attempts have a clearer historical contract than other major record families.
- There is not yet one shared semantic glossary for `historical` / `superseded` / `revoked` / `reopened` / `archived` / `removed`.
- Deletion/archive language in storage docs risks bleeding into semantic validity language if not separated carefully.
- Orchestrator/UI docs currently refer to some of these ideas conceptually, but not yet as one consistent cross-record system.

### Candidate fixes to carry forward
- Define a shared record-semantic vocabulary applied across:
  - attempts
  - promotions
  - concerns
  - graph patches
  - recovery records
  - lane/worktree objects
- Add explicit successor/predecessor links where `superseded` is possible.
- Keep visibility policy (`archived`, hidden from default lists) separate from semantic state (`historical`, `revoked`, `superseded`).
- Ensure exact-record surfaces expose why a record is no longer current rather than simply dimming it.

### Do-not-forget details
- `stale_historical` is specifically stronger than plain `historical`; it carries non-resumable/non-live semantics.
- old graph paths should remain visible and clickable even when superseded.
- these semantics will affect search, exports, reconciliation, and help/glossary copy later.

## Research Progress - 2026-03-16 - Project-Level Run Relationship Clarification

### Confirmed clarification
- Multiple Orchestrator runs within the same project may be completely unrelated.
- Example:
  - run A adds one feature
  - run B later adds a different feature
  - both are in the same project/repo
  - neither should imply lineage or semantic succession relative to the other unless an explicit relationship exists

### Implications
- `historical run` must not imply:
  - predecessor/successor relationship
  - continuation of the same orchestration thread
  - supersession by a newer project run
  - shared seam/package/node identity
- `historical` at the run level should mean only:
  - not the currently focused live run
  - or older in time than another selected/current run
- Relationship must be explicit, not inferred from same-project membership.

### Recommended run-semantics split
- Distinguish:
  - `historical run`
  - `related run`
  - `derived run`
  - `retry/recovery run` or continuation lineage if such a concept exists later
- Working interpretation:
  - `historical run` = any non-active/non-focused run retained for the project
  - `related run` = explicitly linked by user/system relationship metadata
  - `derived run` = intentionally spawned from or based on another run's outputs/graph/contracts
- Default rule:
  - same project does not mean related
  - same repo does not mean related
  - temporal order does not mean related

### UI direction
- History should default to chronological project run history, not lineage history.
- If there is no explicit relationship, runs should appear as separate entries only.
- If explicit relationships are introduced later, the UI may add:
  - `derived from run ...`
  - `retry of run ...`
  - `continuation of run ...`
  - `shares feature seam with run ...`
- But those must be explicit metadata, not inferred by heuristics.

### Search / routing implication
- Search results should preserve run identity exactly and avoid collapsing similarly named seams/packages/nodes across unrelated runs.
- Cross-run navigation should switch focus to the selected run, not imply that the selected object is part of the currently focused run's lineage.

### Historical semantics refinement
- At the run level:
  - `historical` is mostly a focus/time classification
  - not a semantic replacement classification
- `superseded`, `revoked`, `reopened`, etc. should apply only where real object lineage/validity relationships exist, not to arbitrary project runs.

### Candidate fixes to carry forward
- Keep project run history chronological-first.
- Add explicit run-relationship metadata if the product later wants cross-run derivation/continuation concepts.
- Avoid UI copy like `superseded by newer run` unless there is an explicit relationship proving that.

## Research Progress - 2026-03-16 - Concern Record Lifecycle / Details

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Run_Graph_View.md`
- existing concern entries in this working ledger

### Key findings
- The prior discussion already established the high-level concern model well:
  - concern is first-class
  - lifecycle includes `active`, `acknowledged`, `resolved`, `dismissed`
  - canonical concern creators are runtime / package overseer / seam overseer / corroboration outcome / graph patch logic
  - workers may nominate but should not mint canonical concerns directly
- The local docs are still relatively sparse on exact concern record shape.
- Compared with attempts/blocked/remediation, concerns currently lack:
  - explicit canonical record schema
  - merge/split/supersession semantics
  - relationship rules to reviews/corroboration/graph patches/recovery
  - stronger search/routing semantics

### Recommended concern object split
- Strong recommendation:
  - distinguish between:
    - `concern record`
    - `concern source event/ref`
