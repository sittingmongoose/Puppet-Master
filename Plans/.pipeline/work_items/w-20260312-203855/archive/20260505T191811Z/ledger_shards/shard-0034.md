- `Plans/Widget_System.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`
- current ledger widget/projection/multi-run clusters

### Key findings
- `Widget_System.md` is still written for the earlier world where multiple Orchestrator tabs are widget pages.
  - its hostability, layout keys, widget caps, and catalog all still include `Orch/Tiers`, `Orch/Evidence`, `Orch/History`, and `Orch/Ledger`
  - that no longer fits the current rewrite direction where only `Progress` is widget-composed and the other Orchestrator tabs are native surfaces
- The current widget contract mixes three different things that now need to stay separate:
  - page layout persistence
  - widget-local presentation config
  - semantic scope/filter state
- For Orchestrator specifically, semantic scope cannot be widget-owned.
  - page/run context such as `project_id`, `focused_run_id`, historical-run mode, and object focus belong to the page/router state
  - widgets may add presentation or sub-filter choices, but they must not secretly select a different run or redefine the operational scope
- This seam is now tightly coupled to historical-run behavior:
  - `Progress` widgets must render against the current `focused_run_id`
  - moving between live and historical mode should not require per-widget manual retargeting
  - a widget must not drift into a stale prior run just because its own config persisted an old scope choice
- A second real issue surfaced inside `Widget_System.md` itself:
  - section 7.3 first says keep `dashboard_layout:v1` as backup and do not delete it
  - then immediately defines SSOT precedence saying legacy keys are converted and the legacy key is deleted
  - that is a direct migration contradiction, not a minor wording issue
- The persistence scoping is still too coarse for the rewrite:
  - widget layout keys are page-global (`widget_layout:v1:orchestrator:progress`)
  - but `FinalGUISpec.md` already has project-scoped state containers like `project_state:v1:{project_id}`
  - that creates an unresolved question about whether Orchestrator `Progress` layout is app-global, project-scoped, or layered

### Impacted docs
- `Plans/Widget_System.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- Native-tab contradiction:
  - widget docs still assume widgetized `Tiers`, `Evidence`, `History`, and `Ledger`
  - rewrite direction keeps converging on native `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger`
- Scope ownership gap:
  - no clear contract yet separates:
    - page/tab/global filters
    - focused-run scope
    - widget-local display config
  - without that, widgets can easily become shadow query engines
- Persistence-scope gap:
  - page-global widget layout keys may be too coarse for project/run-centric Orchestrator usage
  - but there is no explicit decision yet on app-global vs project-scoped widget layouts for Orchestrator `Progress`
- Migration contradiction:
  - `dashboard_layout:v1` backup retention vs deletion rule conflicts inside the same section

### Candidate fixes to carry forward
- Narrow the widget-hostable Orchestrator surface to `Progress` only.
  - `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` become native surfaces with their own state contracts
- Define explicit filter/scope ownership layers:
  - `router/page scope`: `project_id`, `focused_run_id`, historical/live mode, deep-link target
  - `tab scope`: tab-native filters and object pivots for that surface
  - `widget config`: presentation settings and safe subfilters only
- Add a hard anti-drift rule for Orchestrator widgets:
  - widgets may consume stable projections and canonical records
  - widgets may not invent independent semantic scope such as their own run selection, their own lane universe, or their own concern-state semantics
- Recommended default for Orchestrator `Progress` widgets:
  - inherit `focused_run_id` and page trust state automatically
  - allow only local presentational config like collapsed sections, chart style, sort, density, visible columns, or a safe subset filter that cannot escape the page scope
- Reconcile widget persistence scope:
  - `dashboard` layout can stay app-global
  - `orchestrator:progress` likely needs project-scoped persistence, or a layered model of app-default plus project override
  - `usage` may need explicit app-wide vs project-scoped mode rather than silently reusing one layout for both contexts
- Resolve the `dashboard_layout:v1` migration contradiction in one place and cross-reference it from `FinalGUISpec.md`

### Do-not-forget details
- widget trust/freshness chrome should come from the same projection-trust model used elsewhere; individual widgets should not invent their own stale-state language
- compact widget headers are not a good place to explain semantic scope; that needs page-level context and deep-link clarity
- historical-run mode will feel broken if some `Progress` widgets silently follow live events while others honor the focused historical run
- widget actions should route through the same command/deep-link payload model as search, inspectors, and palette actions

## Research Progress - 2026-03-16 - GPT-5.2 Contract / Routing Deepening

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/GitHub_Integration.md`
- `Plans/Run_Graph_View.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Widget_System.md`

### Key findings
- Canonical runtime identity is still split between strong normative prose and weaker tables/consumers:
  - `Contracts_V0.md` and `storage-plan.md` say run/attempt state must carry full requested/effective persona/runtime/auth/account identity
  - `storage-plan.md` event rows for `run.started` and `usage.event` still omit those fields by enumeration
  - downstream Orchestrator/Run Graph/UI docs still depend on compatibility-era field names or partial projections
- Account switching is still modeled as fields and latest-state hints rather than as a first-class historical record family:
  - `account_switch_reason` appears on attempt/runtime identity records
  - `recent_switch_reason` appears in account health state
  - no append-only `account.switched` / threshold / exhaustion event family exists yet for History, Ledger, Usage, or Orchestrator
- GitHub remains the sharpest account-identity mismatch:
  - `GitHub_API_Auth_and_Flows.md` still keys credential identity by mutable `login`
  - `GitHub_Integration.md` still lacks effective-account / switch-reason display and requested-vs-effective admin-capability UX
  - remote-mode docs still leave GitHub REST side effects local while remote agents run elsewhere, without a clear orchestration boundary contract
- Routing/action contracts are now stronger in `UI_Command_Catalog.md` than in the page specs that consume them:
  - HITL commands already require `request_id`
  - runtime recovery already uses `blocked_sequence` and canonical `cmd.runtime.*` actions
  - Orchestrator deep links already prefer attempt/receipt/worktree/workflow refs
  - `Run_Graph_View.md` and `Orchestrator_Page.md` still describe node-only or tier-era action/addressing patterns
- Usage and widget surfaces are still incomplete for requested-vs-effective and trust semantics:
  - `UsageRecord` carries effective-account attribution, but still lacks first-class switch-history and requested-side linkage
  - `Widget_System.md` still references the wrong multi-account keyspace and does not yet define one shared projection-trust chrome contract

### Highest-risk impacted docs
- `Plans/storage-plan.md`
  - strongest remaining table-vs-prose conflict for runtime identity, usage attribution, and receipt/projection ownership
- `Plans/Contracts_V0.md`
  - still needs explicit account-switch history semantics and tighter binding between canonical snapshot rules and downstream event/record families
- `Plans/GitHub_API_Auth_and_Flows.md` + `Plans/GitHub_Integration.md`
  - still mis-handle stable account identity and do not yet expose effective GitHub account / degraded capability clearly enough for runtime/UI parity
- `Plans/Run_Graph_View.md` + `Plans/Orchestrator_Page.md`
  - still lag behind command/catalog normalization and still encode compatibility-era identity/action fields
- `Plans/usage-feature.md` + `Plans/Widget_System.md`
  - still need stronger switch-history, requested/effective linkage, project-scoped account sourcing, and trust-state rules

### Contradictions / gaps surfaced
- `storage-plan.md` says `run.started` MUST include the full persona/runtime snapshot, but the event table row still enumerates a much thinner field set.
- `storage-plan.md` `usage.event` row still omits effective auth/account/model identity even though `usage-feature.md` `UsageRecord` expects those fields downstream.
- `Contracts_V0.md` forbids `_persona_id` canonical names while `Orchestrator_Page.md` still requires them in runtime-facing worker identity fields.
- `GitHub_API_Auth_and_Flows.md` still uses login-derived credential identity while multi-account/storage contracts require stable internal `account_id` plus disclosure-only provider metadata.
- `UI_Command_Catalog.md` already normalizes HITL and recovery around `request_id`, `blocked_sequence`, and `cmd.runtime.*`, but `Run_Graph_View.md` still presents older node-only command shapes.

### Candidate fixes to carry forward
- Align `storage-plan.md` event-table rows with the stronger normative rules:
  - either inline the canonical runtime snapshot fields explicitly
  - or normatively reference the shared snapshot object so table readers cannot under-implement it
- Add a canonical account-switch history family:
  - event or record based
  - carrying old/new effective account identity, reason, scope, and timeline semantics
- Repair GitHub account identity handling end-to-end:
  - replace login-keyed durable identity with stable internal `account_id`
  - add effective-account / switch-reason display
  - define requested-vs-effective admin capability UI and blocked-state behavior
- Make Run Graph and Orchestrator consume attempt/receipt-based canonical projections and command args already present in `UI_Command_Catalog.md`, instead of re-describing tier-era or node-only action contracts
- Bind Usage and Widget contracts to canonical `provider_accounts.*` sourcing and a shared projection-health/trust-state contract rather than page-local heuristics

### Do-not-forget details
- `manual_preferred_account_id` now exists as a concrete preferred-account override, but it still does not solve the broader missing `requested_account_id` asymmetry in the shared runtime identity grammar.
- `provider_account_id` remains a shadow-key risk unless it is explicitly subordinated to stable internal account identity.
- The cross-surface receipt record is already the strongest trust-safe pivot anchor; follow-on doc cleanup should prefer receipt/attempt-based routing over ad-hoc page-local refs.
- GitHub fixes must preserve the hard realm split between `github_api` and `copilot_github`.

## Research Progress - 2026-03-16 - Sonnet Expanded Identity / Runtime SSOT Batch

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Models_System.md`
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/Permissions_System.md`
- `Plans/Personas.md`

### Key findings
- The canonical identity/account contract still fails to enter the dispatch boundary cleanly:
  - `Prompt_Pipeline.md` still lacks a requested concrete-account field and still stores only singular `account_switch_reason?`
  - `CLI_Bridged_Providers.md` `ProviderRequestEnvelope` still omits typed account identity and execution-role fields
  - `Models_System.md` still behaves as if provider/model/variant selection is separable from account routing and role-scoped pool selection
- Tier-era naming is still embedded in the most authoritative runtime records:
  - `plan_or_tier_default` is still a persisted enum value in `Prompt_Pipeline.md`
  - `persona_override_owner_id` still allows `tier_id`
  - `Prompt_Pipeline.md` still contains a normative MUST against creating execution layers beyond `Phase / Task / Subtask / Iteration`
  - `Personas.md` still references `select_for_tier()` and still violates canonical persona field naming inside its own SSOT section
- Multi-account history and role scoping remain structurally under-modeled:
  - `Multi-Account.md` still has no durable `account.switched` / switch-episode family
  - `provider_accounts.run_snapshot` still stores only an opaque `policy_hash` rather than a queryable policy version/ref
  - no canonical role enum or `actor_kind` / `execution_role` field exists to support role-by-provider and role-by-account overrides consistently across docs
- Bridged/runtime transport docs still cannot support the rewrite’s parallel actor model safely:
  - `Provider_OpenCode.md` still leaves effective account identity opaque behind the bridge, uses a server-global SSE bus with no explicit contamination filter contract, and relies on a fixed server working directory
  - `Permissions_System.md` still scopes `always` approvals and reject-cascades to the whole session, which is unsafe for multi-lane/multi-actor execution
  - permission snapshots still have no account-switch invalidation rule even though account changes can affect effective tool availability
- Projection consumers still cannot derive complete account/pressure truth from provider/runtime streams:
  - bridged-provider `usage` events still omit effective account and pressure/switch fields
  - stop-reason and auth-state vocabularies still do not map cleanly onto Multi-Account switch-trigger and availability-state vocabularies
  - no lane/package/worktree identity enters the bridged envelope where Source Control / Orchestrator handshake now needs it

### Highest-risk impacted docs
- `Plans/Prompt_Pipeline.md`
  - still the highest-leverage SSOT for requested/effective identity, but still carries tier-era persisted values, missing scope fields, and no durable account-switch history model
- `Plans/Multi-Account.md`
  - strongest policy owner, but still missing switch-history records, queryable snapshot lineage, and a canonical requested-side account identifier
- `Plans/CLI_Bridged_Providers.md`
  - still the biggest dispatch-boundary gap for account identity, execution-role scoping, lane/worktree attribution, and projection-ready usage signals
- `Plans/Personas.md`
  - still violates canonical field naming in its own SSOT and still has no structural slot for overseer-class actor types
- `Plans/Permissions_System.md` + `Plans/Provider_OpenCode.md`
  - still encode single-session/single-actor assumptions that break under shared provider runtime, multi-lane orchestration, and server-bridged transport

### Contradictions / gaps surfaced
- `Prompt_Pipeline.md` still preserves `plan_or_tier_default`, `tier_id`, and a MUST against new execution tiers while the rewrite replaces tier authority with seam/package/node/lane authority.
- `Personas.md` still uses `_persona_id` canonical names and `select_for_tier()` references even though `Contracts_V0.md` prohibits the former and the rewrite invalidates the latter.
