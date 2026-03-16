## Gaps (Current State vs. Desired)

### Gap 1: 5h/7d not in GUI

- **Current state**
  - No 5h or 7d window is displayed anywhere in the app (Dashboard, Config, Ledger, or header).
  - **Data exists:** `usage.jsonl` has `timestamp`, `platform`, `tokens`, `tier_id`, `session_id` per event -- we can aggregate by 5h/7d from this file.
  - `platforms::UsageTracker` has `QuotaInfo`, `PlanInfo`, and error parsing (e.g., Codex 5h message limit); the GUI never calls these.
  - Doctor `usage_check` only counts ledger lines per platform; it does not compute 5h/7d or show limits.
- **Desired**
  - Always-visible 5h/7d (or platform-equivalent window) per platform in at least one of: Dashboard, header, or dedicated Usage page.
  - Plan label shown where available (from API or error-derived `PlanInfo`).
  - **Primary feed:** aggregate from `usage.jsonl` (filter by timestamp; sum tokens/requests per platform). **Optional:** platform APIs when env vars are set.
- **Acceptance**
  - User can see "Last 5h: X requests, Y tokens" (and, where applicable, "7d" or platform-specific label) per platform without running a CLI command.

### Gap 2: No live platform usage APIs in GUI path

- **Current state**
  - AGENTS.md documents Claude Admin API (`/v1/organizations/usage_report/claude_code`), Copilot metrics API, Gemini direct-provider usage (local counters + estimated cost), Codex error parsing.
  - No app code path calls these APIs and exposes results to the UI.
  - Quota is inferred from config (`platform_config.quota`) or from error parsing only after a run fails.
- **Desired**
  - Optional background fetch of platform/org usage APIs when the user has set the required env vars.
  - Results surfaced in Usage view and (optionally) in tier config when selecting a platform.
  - Clear "N/A" or "Set ANTHROPIC_API_KEY for live data" when APIs are not configured; local aggregation still shown.
- **Acceptance**
  - When env vars are set, Usage can show provider-reported 5h/7d (or equivalent) where the platform supports it; when not set, we still show usage from `usage.jsonl`.

### Gap 3: Ledger vs. usage_tracker split
The canonical fix is a single normalized `UsageRecord` contract shared by Ledger, Usage, Run Graph, and Orchestrator surfaces.

### Canonical UsageRecord fields
Required fields:
- `run_kind`
- `run_id`
- `tier_id`
- `attempt_id?`
- `thread_id?`
- `effective_platform`
- `effective_model`
- `effective_auth_mode?`
- `effective_account_id?`
- `input_tokens`
- `output_tokens`
- `total_tokens`
- `estimated_cost?`
- timestamps sufficient for rollups and ordering

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md

Optional but recommended attribution fields:
- `provider_account_id?`
- `usage_source_kind`
- `signal_confidence`
- `effective_project_id?`
- `currency?`
- `prompt_cache_hit?` / similar optimization counters when available

Ownership and consumption:
- Ledger reads normalized `UsageRecord` projections rather than ad hoc log parsing
- Usage page rollups are derived from the same record family
- Run Graph and Orchestrator aggregate by `tier_id` and `attempt_id?` from the same contract
- Interview, assistant, builder, and orchestrator runs share the same schema; `run_kind` distinguishes workflow families without creating parallel usage systems

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FinalGUISpec.md

Rule:
- There is one usage schema. Compatibility shims may ingest older sources, but new runtime surfaces MUST NOT define alternate token/model/auth/account attribution records.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md
### Ownership and consumption
- Ledger reads normalized `UsageRecord` projections rather than ad hoc log parsing
- Usage page rollups are derived from the same record family
- Run Graph and Orchestrator aggregate by `tier_id` and `attempt_id?` from the same contract
- Interview and orchestrator runs share the same schema; `run_kind` distinguishes workflow families without creating parallel usage systems

### Rule
There is one usage schema. Compatibility shims may ingest older sources, but new runtime surfaces MUST NOT define alternate token/model attribution records.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md
### Gap 4: Quota/plan only from errors
- **Current state**
  - Some providers can only expose reset/plan hints after an error.
  - For Gemini, the stale assumption that all quota data is local/estimated is no longer sufficient.
- **Desired**
  - Proactive usage/quota display from provider APIs or structured runtime output when configured and available.
  - Error parsing remains a fallback for reset time, plan hints, and rate-limit recovery when stronger signals are unavailable.
  - Gemini surfaces remain mode-aware: OAuth-backed quota and API-key/local-only estimates MUST stay labeled distinctly.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

- **Acceptance**
  - User can see usage and reset countdown before hitting a limit when strong or structured signals exist.
  - After a limit, the app still surfaces `Resets in X` and the switch/fallback reason when available.
  - The UI shows whether quota pressure came from authoritative, structured, heuristic, or local-only signals.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD
### Gap 5: Alert threshold not configurable

- **Current state**
  - "Approaching limit" (e.g. 80%) is mentioned in the plan only; there is no setting or UI for warning threshold.
  - No way to dismiss or quiet a warning for a period.
- **Desired**
  - Configurable warning threshold (e.g. 70%, 80%, 90%) in Settings or Usage/Config.
  - Optional dismiss or "quiet for N hours" so the same warning does not repeat until after cooldown.
- **Acceptance**
  - User can set "Warn when usage above X%" and optionally suppress repeat warnings for a chosen period.

### Gap 6: Analytics not implemented

- **Current state**
  - No analytics view. Metrics view shows run-level/platform execution stats (e.g. subtask metrics), not usage-by-date, usage-by-project, or cost-by-model.
  - No export of usage or analytics (Ledger has "Export Ledger" but no date-range or analytics export).
- **Desired**
  - Analytics section or page: aggregate usage by date range, platform, project (if multi-project later), and model; optional cost when available; export current view as CSV/JSON.
- **Acceptance**
  - User can see "Usage last 7d / 30d by platform" and "By model" (and optionally cost), and export the visible data.

### Gap 7: Interview vs. orchestrator usage policy

- **Current state**
  - Orchestrator records usage to project-level `.puppet-master/usage/usage.jsonl` via `state::UsageTracker`.
  - Interview runs may or may not write to the same file or in the same format; no single documented policy.
- **Desired**
  - Clear policy: all runs (orchestrator and interview) write usage in the same format to the same project-level `usage.jsonl` (or a documented alternative with a single aggregation path).
  - Usage view is global for the project (or workspace): one place for all platform usage regardless of flow.
- **Acceptance**
  - Opening Usage for a project shows combined usage from both orchestrator and interview runs, with consistent fields and no duplicate or conflicting schemas.

---

