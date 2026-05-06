  - no clean lane/worktree binding exists
  - no single authority is declared between Source Control worktree state and Orchestrator receipt lineage
  - blocked worktree reason emitters and historical lineage preservation remain under-owned

### Highest-risk impacted docs
- `Plans/orchestrator-subagent-integration.md`
  - still the most contradicted orchestration doc and still structurally split-brain between body and addenda
- `Plans/Executor_Protocol.md`
  - still needs consolidation plus rewrite-era actor/corroboration/concern/wake semantics
- `Plans/WorktreeGitImprovement.md`
  - still needs node/lane-aware vocabulary and projection authority rules
- `Plans/chain-wizard-flexibility.md`
  - still needs CUP governance, handoff identity completeness, and explicit isolation/worktree policy fields

### Contradictions / gaps surfaced
- Node-native plan ingest still feeds tier-native execution models.
- Lane-aware scheduling still does not flow into worktree and active-agent tracking.
- Concern/corroboration/promotion objects remain absent from core runtime protocols.
- Wizard handoff still leaves identity/worktree policy implicit where the rewrite now needs them explicit.
- Worktree blocked reasons and historical lineage preservation still lack a single clear owner/emitter model.

### Candidate fixes to carry forward
- Consolidate `Executor_Protocol.md` addenda and add package/seam/corroboration/concern hooks.
- Introduce node/actor/lane-aware execution context into orchestrator runtime structs and active-agent tracking.
- Replace or wrap `TierContext` with a node-native execution context carrying full canonical runtime identity.
- Add explicit CUP governance and handoff fields (`execution_role`, requested/effective account, isolation/worktree mode) to wizard docs.
- Move worktree docs onto node/lane-aware vocabulary and define projection authority between Source Control and Orchestrator receipt lineage.

### Do-not-forget details
- `scheduler_lane` is already mandatory in some addenda but structurally homeless in the older orchestration body.
- Worktree lane binding and historical lineage preservation are now correctness requirements, not nice-to-have source-control polish.
- If concern/corroboration stays unowned in the execution core, surface-level concern models will remain performative rather than operational.

## Research Progress - 2026-03-16 - projection-freshness vocabulary and owner cluster

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Glossary.md`
- `Plans/Contracts_V0.md`
- current ledger projection-trust clusters

### Key findings
- The vocabulary collision is real:
  - `trust_tier` already exists in preview/browser state
  - broader Orchestrator/UI research has been using “projection trust” or “degraded trust” for stale/degraded summary data
  - keeping one overloaded trust term will make later docs muddy
- The cleaner fix is to split the concept into two axes:
  - **projection freshness**: how up to date the projection is
  - **projection health**: whether the projection is reliable/usable
- That is better than one overloaded “trust” enum because it separates:
  - time recency
  - processing/consistency/error state
  - action gating confidence
- The earlier working states still look right, but they belong under clearer names:
  - freshness axis: `current | refreshing | stale`
  - health axis: `healthy | degraded | unavailable`
- This also matches the storage-plan language better:
  - UI freshness notifications derive from committed projection state
  - on-demand refresh should leave previous rollups visible until the new scan completes
  - projector lag and failure are not the same thing as stale-but-usable state

### Recommended contract direction
- Use `projection_freshness` as the canonical recency field.
- Use `projection_health` as the canonical reliability/usability field.
- Reserve `trust_tier` for preview/browser semantics only unless those docs are later explicitly renamed too.
- Recommended supporting fields:
  - `projection_freshness`
  - `projection_health`
  - `last_projected_at_utc`
  - `source_seq?` or equivalent checkpoint/cursor
  - `degraded_reason_code?`
  - `refresh_in_progress?`

### Impacted docs
- `Plans/storage-plan.md`
- `Plans/Glossary.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Widget_System.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- any docs currently using “projection trust” as working language

### Contradictions / gaps surfaced
- Current research wording has been useful, but it still risks colliding with preview/browser `trust_tier`.
- Freshness and degradation are currently discussed together often enough that later docs could collapse them into one field family by accident.
- No owner doc yet explicitly defines projection freshness/health fields as a reusable cross-surface contract.

### Candidate fixes to carry forward
- Make `storage-plan.md` the owner of generic projection freshness/health projection fields.
- Make `Glossary.md` own the canonical term meanings:
  - `projection freshness`
  - `projection health`
- Let surface docs consume those terms instead of inventing local stale/degraded wording.
- Keep action gating rules tied to both axes:
  - stale but healthy may allow read-only use with warning
  - degraded or unavailable should gate mutating actions much more aggressively

### Do-not-forget details
- preview/browser `trust_tier` should not be casually reused as the generic projection-state term
- users need both pieces of information:
  - is this data old?
  - is this data trustworthy enough to act on?
- current posture still favors exact record-backed fallback (`History`, `Ledger`, record inspectors) when projection health is degraded

## Research Progress - 2026-03-16 - remaining-owner-doc convergence cluster

### Targeted docs read
- current `working_ledger.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Multi-Account.md`
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Glossary.md`

### Key findings
- The remaining unresolved seams now look less like “missing content” and more like “owner mismatch”.
- A consistent ownership pattern is emerging:
  - `Contracts_V0.md` should own cross-cutting persisted-envelope field families and stable event names
  - `storage-plan.md` should own redb key patterns, projector shapes, current-state projections, and canonical record families
  - `Prompt_Pipeline.md` should own requested/effective runtime resolution semantics
  - `Multi-Account.md` should own policy, selection rules, provider capability posture, and account-routing semantics
  - `UI_Command_Catalog.md` should own stable command IDs and command argument families, but not the deeper route ontology by itself
  - `Glossary.md` should own canonical terms, not behavior
  - `Executor_Protocol.md` plus `orchestrator-subagent-integration.md` should own execution-core semantics, but they are currently the shakiest pair
- The highest-friction seams are the ones currently straddling too many owners:
  - requested concrete account
  - execution role / operational identity
  - project summary / attention item projections
  - route payload vs command args
  - switch-history / pressure episode family
  - projection freshness / health
- The orchestration-core docs are still the biggest structural outlier.
  - `Executor_Protocol.md` and `orchestrator-subagent-integration.md` still behave like older tier-era execution owners
  - but the rewrite has already pushed canonical semantics upward into graph/package/seam/lane/runtime-record language
  - until those two docs are reconciled, some runtime seams will keep reappearing as “surface problems” even when they are really execution-core problems

### Recommended owner map
- `Contracts_V0.md`
  - add/own canonical snapshot field names such as:
    - `requested_account_id`
    - `requested_account_binding`
    - `execution_role`
    - operational-identity snapshot block names
  - own stable event names for:
    - account pressure / switch history
    - any new blocked/recovery/governance event families
  - own route-payload envelope name only if it becomes a generic cross-cutting contract
- `storage-plan.md`
  - own concrete record/projection families for:
    - `project_summary`
    - `project_attention_item`
    - account pressure/switch episode records
    - projection freshness/health fields on projections
  - own projector/refresh semantics and fallback rules
- `Prompt_Pipeline.md`
  - own requested/effective runtime resolution semantics, including:
    - requested concrete account semantics
    - requested/effective operational identity disclosure
    - execution role in runtime-resolution snapshots
- `Multi-Account.md`
  - own selection policy and role/account precedence rules
  - reference, but not redefine, the canonical runtime fields once added elsewhere
- `UI_Command_Catalog.md`
  - keep stable command IDs
  - align command args with canonical route payload vocabulary once that payload is owned elsewhere
- `Glossary.md`
  - own final canonical term definitions for:
    - projection freshness
    - projection health
    - project summary
    - attention item
    - operational identity
- `Executor_Protocol.md` / `orchestrator-subagent-integration.md`
  - need a consolidation pass as the eventual runtime owner for:
    - node-native execution context
    - package/seam/corroboration/concern-aware execution hooks
    - lane/worktree-aware scheduling context

### Contradictions / gaps surfaced
- Several docs still claim “no open questions” while their supposed dependencies remain undecided elsewhere.
- `UI_Command_Catalog.md` is currently being used as a de facto navigation contract in places where a deeper route payload is still unowned.
- `Executor_Protocol.md` and `orchestrator-subagent-integration.md` still trail the newer graph/package/seam/lane model enough that downstream docs keep compensating locally.

### Candidate fixes to carry forward
- Before reconciliation, define an explicit owner table for the remaining open contracts so downstream edits do not keep re-litigating field placement.
- Treat orchestration-core consolidation as a prerequisite for any “final” reconciliation of runtime/UI behavior that depends on execution semantics.
- Stop letting consumer docs fill owner gaps with “compatibility” fields or local terminology when the canonical owner is still undecided.

### Do-not-forget details
- owner clarity matters as much as field choice now; otherwise the same seam will keep reopening under different names
- runtime-core docs are still the biggest risk multiplier because stale tier-era execution assumptions leak into many downstream consumers
- current status remains `active` because owner convergence is clearer, but not fully closed

## Research Progress - 2026-03-16 - Execution-core consolidation boundary

### Targeted docs read
