- Publish a single superseding canonical payload block in `Contracts_V0.md` for scheduler/safe-point/remediation records and explicitly demote older variants.
- Add a canonical actor envelope shared by runtime records, provider-account snapshots, receipts, Usage pivots, and conversational actor telemetry.
- Normalize cross-surface receipt records so `project_id`, actor refs, `created_at_utc`, and `usage_event_ref` are required whenever a surface may pivot historically or across projects.
- Define `usage_event_ref` once as a locator-grade canonical reference and reuse it everywhere rather than inventing a new opaque ID family.
- Normalize Run Graph onto canonical `cmd.runtime.*` / `cmd.orchestrator.open_in_*` command bindings, add the missing action envelope, and add trust-state gating rules.
- Allow short-term concern rendering to piggyback on `finding_refs[]`, but define a minimal non-remediation `node_concerns[]` projection next.

### Do-not-forget details
- Pre-attempt blocked episodes still need `blocked_sequence` handling without fabricating `attempt_id`.
- Thread Usage stays canonical in-shell, but app Usage pivots still need the same shared scope envelope.
- `usage_event_ref` should be a structured locator, not just a display string.
- Actor/runtime unification must preserve ontology separation: chat/interview/wizard actors share provider runtime but are not orchestration nodes.

## Research Progress - 2026-03-16 - GPT-5.3-Codex GitHub / Orchestrator / Widget Hotspot

### Targeted docs read
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/GitHub_Integration.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Widget_System.md`
- `Plans/Multi-Account.md`
- `Plans/Contracts_V0.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/storage-plan.md`

### Key findings
- GitHub account identity is still anchored to mutable login at the auth boundary:
  - `GitHub_API_Auth_and_Flows.md` still keys durable credential identity as `github_api:github.com/<login>` and exposes `login` as primary token metadata
  - Codex reinforced that this is now the clearest auth-boundary conflict with the stable internal `account_id` / requested-vs-effective model
- GitHub recovery and command ownership remain under-keyed:
  - `cmd.github.connect` is still effectively arg-less even though reconnect must bind back to a blocked run/node/thread/wizard context
  - `GitHub_Integration.md` still carries a split-brain command table that diverges from `UI_Command_Catalog.md`
  - Deferred GitHub recovery binding still needs `project_id`, `auth_realm`, actor context, and effective-account snapshot/ref to resume safely across projects and actors
- Orchestrator page contracts still lag the canonical identity model in concrete ways:
  - `Orchestrator_Page.md` still requires forbidden `requested_persona_id` / `effective_persona_id` names in live-status dependencies
  - requested/effective provider/model visibility exists, but account policy/account selection/switch fields are still missing from the required identity set
  - cross-surface pivot commands still need `project_id` or an equally strong derivation rule for multi-project correctness
- Orchestrator/Widget hostability and persistence remain inconsistent:
  - `Orchestrator_Page.md` still describes widgetized Tiers/Evidence/History/Ledger surfaces
  - `Widget_System.md` still persists layouts for them and still has an explicit internal contradiction over whether legacy `dashboard_layout:v1` is retained or deleted
  - terminal widget hostability remains split between `widget.terminal_output` and `widget.agent_terminal`
- Widget/account/trust contracts still lag the rewrite:
  - `widget.multi_account` still binds to `settings/multi_account.*` instead of the canonical `provider_accounts.*` storage family
  - widget view models still lack requested/effective account, switch-history, and projection-trust envelope requirements
  - Orchestrator ledger widget semantics still center tier-era filters rather than attempt/account/receipt-aware routing
- GitHub and Orchestrator surfaces still do not promote auth/scope/rate-limit issues into concern-aware or trust-aware projections; they remain closer to UI error states than canonical runtime records

### Highest-risk impacted docs
- `Plans/GitHub_API_Auth_and_Flows.md`
  - now the sharpest auth-boundary conflict for stable account identity, reconnect correlation, and requested/effective disclosure
- `Plans/GitHub_Integration.md`
  - still needs command normalization, trust-state gating, and stronger project/account binding for resumed flows
- `Plans/Orchestrator_Page.md`
  - still mixes forbidden canonical names, incomplete account identity, widget-era tab assumptions, and missing projection trust semantics
- `Plans/Widget_System.md`
  - still drifts from canonical storage namespaces and lacks settled hostability, migration, and trust contracts
- `Plans/UI_Command_Catalog.md` + `Plans/storage-plan.md`
  - both are now the likely owners of the normalization needed to make these surface docs converge

### Contradictions / gaps surfaced
- GitHub durable identity is still keyed by `login`, conflicting with the stable internal account model.
- GitHub Integration command IDs/args still diverge from the command catalog.
- Orchestrator still uses forbidden `requested_persona_id` / `effective_persona_id` names.
- Orchestrator and Widget docs still disagree with the rewrite’s non-widget / Progress-only direction for several surfaces.
- Widget multi-account data sourcing still points at pre-rewrite namespaces.
- Neither GitHub nor Orchestrator pages yet bind degraded-trust / stale-data states tightly enough to mutation gating and concern ownership.

### Candidate fixes to carry forward
- Replace login-keyed durable GitHub identity with stable `account_id` / `credential_ref`, keeping `login` and provider identity display-only.
- Add a canonical GitHub recovery context payload that can round-trip blocked episode, project, actor kind, auth realm, and effective-account refs.
- Publish a GitHub command migration map from legacy IDs to canonical `UI_Command_Catalog.md` IDs and payloads.
- Normalize Orchestrator/Interview/UI docs to canonical persona field names and extend their required identity sets with requested/effective account fields.
- Rebind widget multi-account/account-pressure contracts to canonical `provider_accounts.*` projections and require trust/scope inheritance from the host surface.
- Resolve one authoritative hostability and migration story for terminal widgets and legacy dashboard layout keys.
- Add trust/degraded-state gating and concern handoff rules for GitHub mutations and Orchestrator actions.

### Do-not-forget details
- Preserve the hard realm split between `github_api` and `copilot_github` even while normalizing stable account identity.
- Orchestrator already has a strong “requested vs effective must remain visible on fallback” rule; the gap is now the missing account/auth/trust fields and canonical naming alignment.
- Dashboard-hosted widgets must not become independent scope engines or stale-action loopholes.
- GitHub auth/scope/rate-limit failures likely need concern hooks without collapsing blocked-owner semantics into generic error banners.

## Research Progress - 2026-03-16 - widget persistence scope decision update

### Decision
- Orchestrator `Progress` widget layout persistence should use **app-default with project override**.

### Why this fits
- one global layout for every project is too coarse once `Progress` reflects project-specific operational habits
- fully isolated per-project layouts are too heavy and lose the value of a stable default operating surface
- app-default plus project override matches the already-emerging inherited/override/effective grammar used elsewhere in settings and runtime disclosure

### Carry-forward rule
- effective `Progress` widget layout should be computed as:
  - app default baseline
  - plus project-scoped override when present
- reset flows should distinguish:
  - reset project override back to app default
  - reset app default baseline
- historical/current run switching must not change layout identity; layout scope is project-level, not run-level

### Do-not-forget details
- the UI should make it clear when a project is using the inherited app-default layout versus a project-specific override
- this decision applies to Orchestrator `Progress`; it does not automatically decide the final persistence rule for Usage or Dashboard

## Research Progress - 2026-03-16 - project summary and blocked-owner model cluster

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/feature-list.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/WorktreeGitImprovement.md`
- current ledger escalation/current-vs-historical/blocked-owner notes

### Key findings
- The shell already assumes project-scoped background state in several places:
  - title bar shows current project context plus badges for background activity / blocked items / unsaved shell state
  - instant project switch keeps non-active project activity visible through badges and attention surfaces
  - storage already persists `projects:v1` and `project_state:v1:{project_id}`
- But the actual project summary model is still much too thin.
  - `projects:v1` currently only promises list metadata like path, detected languages, last-opened timestamp, health status, and overrides
  - that is not enough for the newer Orchestrator/concern/projection-trust model
- The cleaner split is still:
  - `activity` = is anything actively happening for this project
  - `attention` = does this project currently need user attention
  - `health` = overall project/system condition, including trust and unresolved blocking state
- The new blocked-owner logic sharpens the summary rule:
  - project cards should not just say “blocked”
  - they should identify the primary blocked owner / attention owner when one exists
  - examples: `Run`, `Concern`, `Source Control`, `GitHub`, `Auth`, `Usage pressure`, `Wizard`, `Recovery`
- Historical-only projects need explicit protection against false alarm states.
  - a project with only unrelated completed historical runs is not degraded just because it has history
  - no-active-run is not a problem state by itself
- The dashboard and attention-surface docs already imply a useful precedent:
  - `attention_required` and `blocked` must remain distinct
  - severity and routing should not collapse into one generic red project badge
  - canonical blocked episodes should outrank derived projection warnings
- Projection trust now matters at project-summary level too.
  - if a project summary is derived from stale/degraded projections, the card should not pretend to be authoritative
  - trust state may downgrade confidence, but should not automatically manufacture a blocked state

### Impacted docs
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`
- `Plans/feature-list.md`
- `Plans/Orchestrator_Page.md`
- future Projects-view / attention-center docs not yet written or expanded

### Contradictions / gaps surfaced
- There is still no canonical `project_summary` or equivalent projection contract.
  - `projects:v1` is too thin
  - `project_state:v1:{project_id}` is UI-state heavy, not operational-summary heavy
- Project cards/title-bar badges/attention surfaces do not yet share one status vocabulary.
  - some places talk about background activity
  - some talk about blocked items
  - some talk about unsaved shell state
  - none yet define precedence and rollup rules cleanly
- The model still risks conflating:
  - blocked owner
  - concern owner
  - active run owner
  - surface where the user should go next
- Current docs do not yet define how unrelated concurrent or historical runs should roll up into one project badge/card.
  - one blocked run should not necessarily flatten the whole project into a generic “red project” without context

### Candidate fixes to carry forward
- Add a canonical project-summary projection, likely alongside `projects:v1` rather than inside raw shell UI state.
- Recommended minimum project-summary shape:
  - `project_id`
  - `activity_state` (`idle | active | background_active | historical_only`)
  - `attention_state` (`none | advisory | attention_required | blocked`)
  - `health_state` (`healthy | degraded | blocked`)
  - `primary_owner_kind?`
  - `primary_reason_code?`
  - `primary_object_ref?`
  - `active_run_count`
  - `blocked_run_count`
  - `attention_object_count`
  - `projection_trust_state`
  - `last_activity_at_utc`
  - `historical_run_count`
- Recommended precedence rule:
  - canonical active blocked episodes win over derived warnings
  - `blocked` outranks `attention_required`
  - `attention_required` outranks advisory pressure/noise
  - stale/degraded trust modifies confidence/disclosure, not the underlying canonical status by itself
- Recommended project-card copy model:
  - one compact primary line: current state + owner + reason
  - one secondary line: active/background/historical summary
  - avoid dumping per-run detail into the card itself
- Keep “no active run” neutral.
  - use `historical_only` or `idle`, not a warning color/state

### Do-not-forget details
- blocked owner should help route the user to the right next surface, not merely decorate the badge
- project summaries must preserve the distinction between user-attention problems and internal degraded-trust warnings
- title-bar project badges, Projects page cards, command-palette summaries, and attention-center rows should all reuse the same status vocabulary and precedence rules
- a project can have background activity and still not be blocked

