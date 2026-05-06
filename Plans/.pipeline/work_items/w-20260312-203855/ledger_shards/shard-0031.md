### Resolution-kind direction
- `resolved` should not be bare.
- Candidate `resolution_kind` values still look right:
  - `fixed`
  - `accepted_risk`
  - `superseded`
  - `merged`
  - `split`
  - `invalidated`
  - `obsoleted_by_patch`
  - `obsoleted_by_recovery`
- Important rule:
  - `dismissed` is not a substitute for `resolved`
  - `accepted_risk` is a resolution, not a dismissal

### Merge / split / supersession direction
- Concern lineage now needs more exact rules.
- Recommended semantics:
  - `merge`
    - several concern records collapse into a surviving concern with lineage refs from the old ones
  - `split`
    - one concern is reframed into multiple more precise concerns; original resolves with `resolution_kind = split`
  - `superseded`
    - concern replaced by a newer concern or broader canonical object framing
- Good rule:
  - old concern ids remain queryable in Ledger/History after merge/split/supersession
  - newer concern should carry lineage back to prior ids

### Source update rule
- Recommended rule:
  - repeated sightings of the same underlying issue should usually update an existing concern rather than minting endless duplicates
- But:
  - do not merge automatically just because summaries look similar
  - use source/scope/category/lineage-aware heuristics or explicit governance action
- This is especially important for:
  - weak integration
  - review findings that recur across generations
  - corroboration minority concerns

### Interaction with other families
- Good interaction rules:
  - review findings may nominate or update concerns, but the review record remains distinct
  - corroboration can:
    - validate a concern
    - downgrade it to advisory/minor
    - leave an unresolved minority concern
  - graph patch can:
    - resolve concern
    - obsolete concern
    - split concern into more precise post-patch concerns
  - recovery can:
    - resolve concern
    - create follow-on concern if recovery exposes a new issue
  - blocked episodes can:
    - reference concern when a concern becomes execution-blocking
    - but should not be replaced by the concern record

### UI / search / ledger implication
- This sharper concern shape now supports the earlier UI model:
  - `Progress`
    - summarized active concerns
  - `Seams`
    - seam/package concern rollups
  - `Evidence`
    - concern-linked findings/evidence
  - `History`
    - chronological concern evolution
  - `Ledger`
    - exact concern record, sources, lineage, merge/split/supersession, acknowledgment/dismissal rationale
- Search should support:
  - active concerns
  - acknowledged concerns
  - dismissed concerns
  - concern lineage lookups by prior id

### Interaction with notifications and blocked routing
- Concerns now need to align with the newer notification model:
  - `acknowledged` may reduce reminder noise
  - `active` + execution impact may escalate
  - `dismissed` should suppress concern presentation but not canonical blocked episodes if those remain active
- Blocked owner should remain separate from concern owner:
  - concern owner = who is responsible for the concern
  - blocked owner = who/what is currently blocking progress
- Those may overlap, but they are not the same field.

### Contradictions / gaps surfaced
- There is still no obvious concern event family or concern record family in the local docs comparable to attempts/blocked/remediation.
- Concern semantics are now distributed across ledger reasoning rather than any one local SSOT.
- The docs have enough adjacent durable-record rigor to make the absence of a concern contract more risky now than earlier.

### Candidate fixes to carry forward
- Add a canonical concern record family and corresponding projection contract.
- Add explicit concern lineage fields for merge/split/supersession.
- Add `resolution_kind` and rationale requirements for dismiss/resolve paths.
- Keep concern separate from review findings, annotations, blocked episodes, and recovery records while allowing rich cross-linking.

### Do-not-forget details
- concerns need durable identity and lineage, not just severity/status
- `acknowledged` is a noise-control state, not a semantic resolution
- blocked owner and concern owner are related but distinct concepts

## Research Progress - 2026-03-16 - Gemini broader second-sweep delta cluster (identity, storage, UI ownership)

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/usage-feature.md`
- `Plans/storage-plan.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/GitHub_Integration.md`
- `Plans/Widget_System.md`
- `Plans/FileManager.md`
- `Plans/Runtime_Artifacts_Panel.md`
- current work-item ledger/meta

### Key findings
- Requested/effective identity pressure is now showing up across more than persona/runtime docs:
  - `Contracts_V0.md` is strong on canonical effective identity and envelope normalization
  - but downstream docs still do not consistently model `requested identity` alongside verified/effective identity
  - this is especially visible in `GitHub_API_Auth_and_Flows.md`, `GitHub_Integration.md`, `Run_Graph_View.md`, and `Runtime_Artifacts_Panel.md`
- Storage/usage contracts still carry tier-era runtime assumptions in places the broader second sweep now makes more obviously risky:
  - `storage-plan.md` still leans on `tier_id` / `run.tier_*`
  - `usage-feature.md` still treats `tier_id` as a core attribution dimension and does not yet pivot to `seam_id` / `package_id` / `lane_id`
  - neither doc is yet explicit enough about graph-patch lineage or degraded projection-trust states
- UI ownership drift is now clearly cross-doc rather than isolated:
  - `Orchestrator_Page.md` still centers `Tiers`
  - `Widget_System.md` still widgetizes surfaces that the rewrite increasingly treats as native/specialized tabs
  - `Run_Graph_View.md` still assumes a simpler phase/task/subtask tree and under-specifies concern/corroboration/promotion/patch lineage
- Source Control and artifact navigation surfaces are showing a broader object-identity problem:
  - `GitHub_Integration.md` still frames worktree ownership around `run/tier`
  - `FileManager.md` already wants identity-based artifact opening, but its open contract is still too path-first
  - `Runtime_Artifacts_Panel.md` is missing `attempt_id` in its canonical id set and does not yet absorb trust-tier / degraded-artifact semantics cleanly

### Impacted docs
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/Contracts_V0.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/GitHub_Integration.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Widget_System.md`
- `Plans/FileManager.md`
- `Plans/Runtime_Artifacts_Panel.md`

### Contradictions / gaps surfaced
- The rewrite now expects a stronger requested/effective/provider/account identity split than several non-runtime docs currently expose:
  - GitHub auth/integration docs mostly model effective identity only
  - graph/page/artifact docs require identity disclosure but do not yet define a shared display/record contract
- Storage and usage docs already hold canonical-ish runtime data, but still encode obsolete routing/grouping terms:
  - `tier_id` remains an important field in usage/storage thinking
  - seam/package/lane/worktree lineage is not yet treated as first-class storage/usage attribution everywhere it needs to be
- The native-tab vs widget boundary is still inconsistent:
  - `Widget_System.md` implies broader widget portability
  - `Orchestrator_Page.md` still treats multiple tabs as widget containers
  - newer ledger direction keeps `Progress` as the widget-heavy surface and pushes `Seams` / `Evidence` / `History` / `Ledger` toward stronger native ownership
- Artifact and file-opening semantics are not yet fully aligned with recovery/run-aware identity:
  - `FileManager.md` is moving toward identity-based opens
  - `Runtime_Artifacts_Panel.md` and related surfaces still need a tighter canonical id/trust/freshness contract

### Candidate fixes to carry forward
- Define one shared requested/effective identity disclosure contract reusable across:
  - graph detail
  - artifacts
  - GitHub/auth surfaces
  - usage/account-pressure surfaces
- Rework storage/usage attribution to treat `seam_id`, `package_id`, `lane_id`, and `attempt_id` as first-class where the runtime model now requires them, instead of centering `tier_id`
- Replace or deprecate tier-era event and widget assumptions:
  - `run.tier_*` -> seam/package/lane-aware runtime events
  - `tier_tree` / `Tiers` ownership -> seam/worktree/package-native surfaces
- Tighten artifact/file routing around stable object identity:
  - support `attempt_id` and other runtime object ids directly
  - define read-only / historical / restricted-trust render behavior explicitly
- Add explicit projection freshness / degraded-trust states to storage-driven UI docs rather than assuming silently fresh projections

### Do-not-forget details
- `effective_provider_identity` / display labels are audit/display fields, not routing keys
- Source-qualified usage wording still matters for Gemini and other estimate-only providers; that requirement should survive the broader identity rewrite
- Dashboard portability should stay attached to the right widget set, not be used as a reason to widgetize every Orchestrator tab
- `attempt_id` is increasingly looking like a cross-surface anchor, not an optional artifact detail
- this Gemini cluster is an early broader-second-sweep delta; jumbo-doc section reads and later model passes are still in flight

## Research Progress - 2026-03-16 - Gemini broader second-sweep delta cluster (policy, invariants, authority drift)

### Targeted docs read
- `Plans/Permissions_System.md`
- `Plans/Decision_Policy.md`
- `Plans/Architecture_Invariants.md`
- `Plans/chain-wizard-flexibility.md` (section 1)
- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`
- `Plans/orchestrator-subagent-integration.md`
- current work-item ledger/meta

### Key findings
- The broader second sweep is surfacing a governance-layer lag, not just a UI/storage lag:
  - `Decision_Policy.md` still lacks first-class concern/corroboration/promotion objects and their authority/lifecycle rules
  - `Permissions_System.md` does not yet integrate the stricter requested/effective identity model that `Contracts_V0.md` now makes canonical
  - `Architecture_Invariants.md` needs to reflect newer runtime invariants like scheduler lane ordering and mutation-safe-point requirements
