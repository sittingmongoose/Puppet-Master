{"line_start":2001,"line_end":2200,"invocation":"inv-c2-20260505-W02-i011"}

- `Plans/Models_System.md`
- `Plans/Personas.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
- `Plans/Permissions_System.md`

### Key findings
- The requested/effective execution identity model is still strongest on the effective side and still weak on the requested side:
  - `Prompt_Pipeline.md` and `Contracts_V0.md` preserve `requested_account_policy`
  - no canonical requested concrete-account anchor exists when a user pins a specific account
  - `Models_System.md`, `Personas.md`, and bridged-provider docs still behave as if provider/model/persona are the full identity envelope
- The account identity chain is still split across incompatible concepts:
  - `effective_account_id` is the stable internal identity
  - `effective_provider_identity` is disclosure/audit metadata
  - `provider_account_id` is being normalized in usage/storage-facing docs without a governing rule, so it risks becoming a second shadow routing identity
- Bridged-provider contracts remain materially weaker than the canonical runtime identity contract:
  - `CLI_Bridged_Providers.md` request and persistence envelopes still omit requested/effective auth/account fields
  - `Provider_OpenCode.md` never explains how PM obtains upstream account identity from behind the server bridge
  - `Provider_Stream_Mapping_External_Reference_A2A.md` maps usage and diagnostics without effective-account attribution
- Runtime ownership is still tier-bound in the identity-facing docs:
  - `Prompt_Pipeline.md`, `Models_System.md`, and `Personas.md` still embed tier ownership in selection sources, override owners, or execution framing
  - the docs have not been rewritten around node/package/seam/lane-aware execution identity
- Conversational/shared-runtime and actor-scoped permission consequences are still under-modeled:
  - `Permissions_System.md` resolves by tool/context/mode but not by invoking runtime entity, lane, or account
  - session approval carryover and reject-cascade semantics are still effectively single-session/single-lane even though the rewrite requires parallel actors sharing provider runtime

### Highest-risk impacted docs
- `Plans/Multi-Account.md`
  - strongest owner for switch/pressure behavior, but still lacks durable switch-history storage and does not align cleanly with scheduler dispatch or usage/storage identity fields
- `Plans/Prompt_Pipeline.md`
  - remains the best place to lock requested/effective identity semantics, but currently stops short of requested concrete-account identity and still embeds tier-era override ownership
- `Plans/CLI_Bridged_Providers.md`
  - still too weak to support canonical account identity, switch-reason disclosure, or conversational-actor routing through the provider facade
- `Plans/Personas.md`
  - still internally contradicts canonical field naming and still has no overseer Persona model or account disclosure rule
- `Plans/Permissions_System.md`
  - currently cannot express lane/package/account-bounded permission resolution or approval scope in a multi-lane orchestrator run

### Contradictions / gaps surfaced
- `Personas.md` still uses `requested_persona_id` / `effective_persona_id` in a runtime-facing section even though `Contracts_V0.md` explicitly prohibits those names as canonical fields.
- `Prompt_Pipeline.md` and `Contracts_V0.md` carry `requested_account_policy`, but no parallel requested-side concrete account field exists, so downstream docs are forced to guess how explicit account pinning is represented.
- `CLI_Bridged_Providers.md` requires direct providers to declare multi-account/switch capability surfaces, but bridged providers are exempt by omission even though `Multi-Account.md` expects bridged routing support.
- `Provider_OpenCode.md` and `Provider_Stream_Mapping_External_Reference_A2A.md` both assume runtime/account disclosure obligations that their current event/API mappings cannot actually satisfy.
- `Permissions_System.md` contains actor-scoped hints (`todoread`/`todowrite` default deny) but still has no general execution-entity narrowing rule, so crew/member/lane/account-bounded permissions remain unimplementable.

### Candidate fixes to carry forward
- Add one canonical requested-side concrete-account field to the requested/effective runtime identity bundle, while retaining `requested_account_policy` as the routing rule rather than the selected account.
- Add a governance rule for `provider_account_id`:
  - either retire it
  - or explicitly define it as provider-native metadata subordinate to stable internal `effective_account_id`
- Unify bridged-provider request/persistence envelopes around the same auth/account fields already used by `Contracts_V0.md` and `Prompt_Pipeline.md`.
- Replace tier-bound identity/override wording in `Prompt_Pipeline.md`, `Models_System.md`, and `Personas.md` with node/package/seam/lane-aware ownership.
- Add execution-entity, lane, package, and effective-account dimensions to permission resolution and approval carryover/cascade rules.

### Do-not-forget details
- The missing requested-side account anchor is not just a UX gap; it blocks durable historical requested-vs-effective analysis.
- The `provider_account_id` problem is now cross-doc, not local to usage: identity, storage, and provider docs all risk normalizing it differently.
- OpenCode and other bridged runtimes may switch or obscure upstream accounts behind the bridge; the docs currently do not say whether this is capturable, opaque-but-accepted, or a hard gap.
- The overseer Persona gap is structural because runtime docs now need package-overseer and seam-overseer identity without pretending they are ordinary delegated subagents.
- Approval scope in a multi-lane run must not silently remain "same session" if sessions are per-agent-spawn and lanes are parallel.

## Research Progress - 2026-03-16 - GPT-5.4 Hotspot Recheck

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/usage-feature.md`
- `Plans/storage-plan.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/GitHub_Integration.md`
- `Plans/Widget_System.md`

### Key findings
- `Contracts_V0.md` is now the clearest canonical owner for requested/effective runtime identity naming, but its downstream consumers remain materially weaker:
  - requested/effective account identity is still asymmetric
  - addendum consolidation is incomplete
  - downstream usage/storage/UI docs still weaken or rename the canonical field set
- Tier-era operator surfaces remain productized even where newer addenda have already moved the runtime model forward:
  - `Orchestrator_Page.md` still keeps `Tiers` and multi-tab widget composition
  - `Widget_System.md` still catalogs tier widgets and weak hostability rules
  - `Run_Graph_View.md` still lacks the full requested/effective identity and governance-object model the current rewrite expects
- Usage/storage remain too tier-centric and too thin on switch/pressure history:
  - `usage-feature.md` still aggregates around `tier_id`
  - `storage-plan.md` still splits tier-era event tables from newer attempt-centric records
  - neither doc yet gives a durable first-class account-switch / pressure-episode history model
- Projection freshness and degraded-trust behavior remain one of the sharpest cross-doc gaps:
  - `Orchestrator_Page.md`, `Widget_System.md`, and `Run_Graph_View.md` all imply event-driven freshness
  - none of them define one shared persisted trust/freshness contract with action gating and Ledger/direct-record fallback
- GitHub account identity is still not aligned with the canonical account model:
  - `GitHub_API_Auth_and_Flows.md` still keys storage/routing on mutable `login`
  - `GitHub_Integration.md` still lacks a strong requested/effective GitHub account display/routing contract across project/workspace surfaces

### Highest-risk impacted docs
- `Plans/Orchestrator_Page.md`
  - still acts as a practical UI SSOT while encoding the old tab/widget/tier structure
- `Plans/storage-plan.md`
  - still has the most consequential split-brain between old event tables and newer runtime records, and still lacks a durable projection-health object family
- `Plans/Run_Graph_View.md`
  - now needs explicit requested/effective identity, trust-state, and governance-record drill-in contracts to stay viable as the graph-native surface
- `Plans/Widget_System.md`
  - still contradicts current hostability and tab-boundary direction while lacking projection-trust semantics
- `Plans/GitHub_API_Auth_and_Flows.md` + `Plans/GitHub_Integration.md`
  - still rely on mutable provider identity and thin degraded-capability UX even though per-realm stable account identity is now required

### Contradictions / gaps surfaced
- `Contracts_V0.md` forbids `_persona_id` canonical names while downstream UI/runtime docs still consume or display them.
- `usage-feature.md` and `storage-plan.md` still use `provider_account_id` without a canonical ownership/deconfliction rule.
- `Orchestrator_Page.md` says Progress widgets are Dashboard-portable while `Widget_System.md` still excludes some of those widgets from Dashboard hostability.
- `Run_Graph_View.md` and `Orchestrator_Page.md` both imply richer requested/effective identity display than their actual data contracts can currently render.
- GitHub auth docs preserve realm isolation correctly, but still fail to bind GitHub identity to stable internal `account_id` plus disclosure-only provider metadata.

### Candidate fixes to carry forward
- Reconcile downstream consumers to one canonical requested/effective identity block owned by `Contracts_V0.md`, including explicit account-switch/fallback disclosure fields.
- Replace tier-first aggregation and event anchoring in usage/storage/UI docs with attempt/node/lane/package/seam-aware attribution, leaving tier terms only as compatibility aliases if needed.
- Introduce one shared projection-health / trust-state record family and require Orchestrator, widgets, and Run Graph surfaces to use it for action gating and fallback.
- Recast Orchestrator tab ownership explicitly:
  - `Progress` as the widget-hosting operational tab
  - native deep-inspection tabs for seams/graph/evidence/history/ledger
  - Source Control as the Git/worktree inventory/manipulation surface
- Replace GitHub `login` as a stable key with internal `account_id`, while keeping `login` as provider-native disclosure metadata.

### Do-not-forget details
- The biggest GPT-5.4 value-add was not just "tier drift exists"; it was showing where old and new models are both still treated as canonical in the same surface area.
- Projection trust/freshness needs a separate vocabulary from preview/browser `trust_tier`; these are currently at risk of semantic collision.
- Usage/UI requests for auth-mode/effective-account filtering are already present in adjacent GUI docs even though usage contracts do not yet guarantee them.
- GitHub fixes must preserve strict separation between `github_api` and `copilot_github` realms.
- `Contracts_V0.md` is closer to the target than many downstream docs, but it still needs addendum consolidation to stop reintroducing ambiguity from inside the supposed SSOT.
  - destructive Git/worktree actions should resolve through Source Control semantics, even if launched from Orchestrator.
- Likely action split:
  - Orchestrator-owned initiation:
    - inspect lane
    - inspect weak integration
    - request restore
    - request graph patch
    - request reopen/revocation
    - open lane in Source Control
  - Source-Control-owned execution surface:
    - open worktree
    - compare against baseline/target
    - inspect changed files/history/graph
    - recover orphaned worktree
    - archive lane worktree
    - prune/remove worktree
    - cleanup current/all eligible worktrees
- Important nuance:
  - runtime blocked reasons like `dirty_worktree` and `worktree_conflict` remain runtime truth, not Source Control-local statuses
  - Source Control surfaces the condition and executes allowed remediation actions
  - Orchestrator remains the place where blocked ownership and run consequences are clearest

### Historical reference rule
- Strong rule emerging from current docs + rewrite:
  - historical run/package/node/lane references MUST survive after live worktree cleanup
  - a missing live worktree must render as `historical/retired/removed`, not disappear
  - lineage views must preserve:
    - `worktree_id`
    - path snapshot
    - branch snapshot
    - compare target / commit-range snapshot
    - owning package/lane identity when applicable
- This supports:
  - graph generation history
  - safe-point / recovery history
  - promotion/revocation audit
  - cleanup/archive/remove traceability

### Contradictions / gaps surfaced
- `Plans/WorktreeGitImprovement.md`
  - still frames ownership around `tier` / `subtask` rather than package lane pools.
- `Plans/Orchestrator_Page.md`
  - still references `Tiers` and per-tier worktree ownership.
- `Plans/GitHub_Integration.md`
  - `Worktrees` subview is correct directionally, but object copy still centers raw worktree rows rather than lane-backed operational identity.
- `Plans/FinalGUISpec.md`
  - clearly separates Source Control from GitHub Actions and places worktree management in Health/Settings, but does not yet express the stronger Orchestrator-vs-Source-Control lane/worktree boundary.
- `Plans/MiscPlan.md`
  - cleanup actions exist, but they are not yet reconciled with `retained` vs `cleanup_eligible` vs `archived` vs `removed` lane/worktree states.
- `Plans/storage-plan.md`
  - has `worktree_id` and historical receipt linkage, but likely needs lane/package/seam linkage added so worktree records do not remain stranded as flat Git objects.

### Candidate fixes to carry forward
- Add a formal distinction between:
  - `lane lifecycle state`
  - `worktree filesystem state`
  - `runtime blocked/recovery state`
- Reword Source Control worktree rows from `owner run/tier` to something like:
  - owner run/package/lane
  - or owner package/lane with run reference secondary
- Update Orchestrator contracts so the `Seams` tab and `Node Graph` show lane/worktree state through package ownership, not legacy tier ownership.
- Ensure cleanup/archive/remove flows always preserve historical lane/worktree lineage and safe-point/remediation linkage.
- Make `Source Control` the execution surface for Git-native mutations, while `Orchestrator` remains the operational surface for why those actions matter.

### Do-not-forget details
- `dirty_worktree` and `worktree_conflict` are canonical blocked reasons and must remain visible in both surfaces without becoming generic SCM errors.
- project identity must stay stable across path moves/rebinds and across worktree-aware flows.
- cleanup of files inside a worktree is not the same thing as removing the worktree itself.
- later broader second sweep must revisit:
  - Source Control-related docs
