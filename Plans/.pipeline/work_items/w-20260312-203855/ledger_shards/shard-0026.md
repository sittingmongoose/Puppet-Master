- Recommended meanings:
  - `recover`
    - attempt to restore or reconcile a suspect/orphaned/conflicted worktree into a safe known state
  - `archive`
    - retire from active use while preserving enough identity/metadata/lineage for historical browsing
  - `prune`
    - cleanup-oriented action for items already policy-eligible; narrower than generic remove and typically scoped to obviously stale/orphaned/live-no-longer-needed worktrees
  - `remove`
    - explicit destructive removal of live worktree backing after confirmation and eligibility checks
- The historical lane/worktree record must survive `archive`, `prune`, and `remove`.

### Eligibility / gating direction
- Cleanup must be gated by more than age.
- Recommended checks before archive/prune/remove:
  - no active-run ownership
  - no unresolved blocked recovery requiring that exact worktree
  - no required safe-point restore targeting that worktree/baseline
  - no unresolved conflict workflow the user still needs to inspect
  - no newer lineage operation depending on that lane/worktree still being live
- If any of those hold, the object should remain `retained`, `suspect`, or `restoring`, not `cleanup_eligible`.

### Trigger direction
- Good candidate transitions into `cleanup_eligible`:
  - lane/package complete and no retention reason remains
  - superseded by graph patch and no unresolved recovery depends on it
  - revoked/reopened flow leaves an old lane/worktree no longer needed live
  - recovery completed and old broken backing is no longer needed
- Good candidate transitions into `retained` instead of immediate cleanup:
  - recent completion pending review/promotion
  - weak integration still under investigation
  - unresolved concern or corroboration tied to outputs from that lane
  - manual operator retention

### Source Control vs Orchestrator boundary
- This seam reinforces the earlier boundary:
  - Orchestrator owns lane-pool truth and cleanup posture in execution context
  - Source Control owns concrete worktree actions and compact inventory display
- Because Source Control is narrow, it should default to compact current/live worktree rows with filters/toggles for:
  - retained
  - cleanup-eligible
  - archived/removed history
- Orchestrator can carry the richer historical lineage and policy explanations.

### Historical-lineage rule
- Strong recommendation:
  - live cleanup must never erase run/lane/worktree lineage from `History`, `Ledger`, or graph-linked inspection
- After live removal:
  - Orchestrator still shows the historical lane/worktree identity
  - Source Control may show it only in filtered historical mode or via lineage/detail, not necessarily in the default narrow current list

### Confirmation / undo implication
- This seam connects directly to the earlier confirmation policy:
  - archive may be `light` or `strong` depending on state
  - prune/remove should usually be `strong`
  - remove on a worktree with blocked/recovery lineage may approach `hard_gate`
- Most of these are not true undo operations.
- The clean recovery path is usually compensating action or restore via preserved metadata, not “Undo remove.”

### Contradictions / gaps surfaced
- Current docs expose worktree actions and blocked classifications, but they do not yet define the full lane/worktree cleanup lifecycle.
- `historical`, `archived`, `removed`, `retained`, and `cleanup_eligible` still need sharper cross-surface meanings.
- Without a split model, the UI risks either:
  - deleting useful historical truth
  - or keeping too much live clutter forever

### Candidate fixes to carry forward
- Define distinct lane and worktree lifecycle states, with explicit mapping but no forced identity collapse.
- Make cleanup eligibility depend on runtime/recovery/lineage checks, not only simple completion.
- Preserve historical lane/worktree records after archive/prune/remove.
- Keep Source Control worktree-first and compact, with historical/retained material behind filters or lineage views.

### Do-not-forget details
- active-run ownership must be visible before destructive worktree actions
- safe-point and blocked recovery lineage can keep an old worktree relevant even after supersession
- cleanup should reduce live clutter without erasing the historical object model

## Research Progress - 2026-03-16 - Terminology / Help / Glossary Impact Sweep

### Targeted docs read
- `Plans/Glossary.md`
- `Plans/FinalGUISpec.md`
- `Plans/Personas.md`
- `Plans/Models_System.md`
- `Plans/Multi-Account.md`

### Key findings
- The shared provider/persona/runtime docs are already fairly disciplined on several critical terms:
  - `requested` vs `effective`
  - `selection_reason`
  - skipped vs honored/clamped Persona controls
  - provider/auth/account selection flow
- That means the runtime-selection side of the vocabulary is in better shape than the newer Orchestrator object vocabulary.
- `Glossary.md` is now lagging behind the rewrite research.
- It currently covers:
  - shell/workspace terms
  - source control / Docker / GitHub / operation receipt
  - requested/effective state at a high level
- It does not yet capture many of the rewrite-critical Orchestrator terms and distinctions now emerging in research.

### Terms that now need canonical glossary ownership
- Strong candidates for glossary entries:
  - `Feature Seam`
  - `Work Package`
  - `Node`
  - `Package Overseer`
  - `Seam Overseer`
  - `Weak Integration`
  - `Promotion`
  - `Corroboration`
  - `Graph Patch`
  - `Graph Generation`
  - `Concern`
  - `Lane`
  - `Lane Pool`
  - `Worktree` as a distinct concrete object
  - `Historical Run`
  - `Reopened`
  - `Revoked`
  - `Superseded`
  - `stale_historical`
  - projection trust terms:
    - `current`
    - `refreshing`
    - `stale`
    - `degraded`
    - `unavailable`

### Terms that need explicit distinction rules
- Several word pairs are now risky unless the glossary or help system pins them down:
  - `lane` vs `worktree`
  - `record` vs `artifact`
  - `history` vs `ledger`
  - `requested` vs `effective`
  - `override` vs `requested`
  - `current` vs `historical`
  - `historical` vs `superseded`
  - `resolved` vs `dismissed` vs `acknowledged`
  - `retry from safe point` vs `start fresh attempt`
  - `archive` vs `remove` vs `prune`
- These are exactly the kinds of distinctions that can drift in GUI copy if they are not owned centrally.

### Help-system implication
- The earlier help-system work looks even more necessary now.
- Recommended rule:
  - glossary owns short canonical definitions
  - help entries own deeper explanation, examples, and related-concept links
  - contextual help can simplify wording, but must not mutate the underlying semantics
- Good dedicated help-entry candidates now look even stronger for:
  - `Weak Integration`
  - `Corroboration`
  - `Graph Patch`
  - `Promotion`
  - `Concern lifecycle`
  - `Lane vs Worktree`
  - `requested vs effective`
  - `safe point vs restore point`
  - `historical vs superseded vs revoked`

### Shared provider-runtime impact
- The shared provider/runtime docs already support the newer requested/effective language well.
- Good finding:
  - `Multi-Account.md`, `Models_System.md`, and `Personas.md` already align on:
    - requested/effective visibility
    - selection reason
    - skipped/honored control disclosure
    - attempt-level snapshotting
- This means those docs are less likely to need conceptual rewrite than the Orchestrator and glossary/help surfaces.
- The bigger risk is copy drift in GUI/help text if Orchestrator starts using newer concepts without glossary/help coverage.

### GUI copy implication
- `FinalGUISpec.md` already contains many local disclosure rules, but they are distributed.
- The rewrite now needs a stronger cross-cutting copy discipline so the UI does not casually say:
  - “retry”
  - “old”
  - “completed”
  - “degraded”
  - “history”
  when a more precise canonical term is required

### Contradictions / gaps surfaced
- `Glossary.md` is now materially behind the Orchestrator rewrite vocabulary.
- The shared runtime/provider docs are stronger than the shared concept/glossary docs.
- Without glossary/help updates, copy drift will likely happen first in:
  - Orchestrator tabs
  - Source Control / lane/worktree language
  - blocked/recovery actions
  - concerns/promotions/patches/history/ledger labels

### Candidate fixes to carry forward
- Expand `Glossary.md` to cover the rewrite-critical Orchestrator objects, states, and trust terms.
- Use glossary definitions as the canonical short-definition source for future help entries.
- Add explicit distinction guidance for the high-risk word pairs above.
- Re-check `FinalGUISpec.md` and related UX docs later for copy that uses informal synonyms where canonical terms are now required.

### Do-not-forget details
- the runtime/provider docs already provide a solid requested/effective foundation; do not reinvent that vocabulary
- glossary/help need to catch up to Orchestrator object semantics before UI copy starts crystallizing around weaker synonyms
- `lane` vs `worktree`, `history` vs `ledger`, and `historical` vs `superseded` are especially drift-prone

## Research Progress - 2026-03-16 - Shared Conversational-Actor / Runtime Identity Boundary
