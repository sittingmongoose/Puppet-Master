## Scope of the Usage Feature

### 1. Quota and plan visibility (primary)

- **5h and 7d windows:** Show current usage vs limit (e.g. "5h: X / Y", "7d: X / Y") per platform where the platform or org API provides it.
- **Plan type:** Show detected or configured plan (e.g. Pro, Team) where available (see AGENTS.md plan detection).
- **Placement:** Always visible in at least one of: dashboard, header, or a dedicated **Usage** page. Tier config / setup should show current usage when selecting a platform so users can avoid platforms near limit.
- **Refresh:** Background refresh (e.g. periodic or after runs) so numbers stay up to date without blocking the UI. Document which platforms support "live" vs "after-run" stats.
- **Always-visible limits:** Match UX expectations set by tools like [yume](https://aofp.github.io/yume/) -- 5h and 7d usage always visible so users don't need a manual "usage" command.

### 2. Alerts and thresholds

- **Approaching limit:** Optional warning when usage is near limit (e.g. 80% of 5h window) so the user can switch tier or pause.
- **Rate limit hit:** When a run hits quota/rate limit, surface a clear message and, where possible, suggested action (e.g. "Try again after X" or "Switch platform"); link to the Usage view.

### 3. Event ledger (existing concept, under Usage umbrella)

- **Event-level log:** Keep the existing concept of an event ledger (platform, operation, tokens in/out, cost, tier/session) so users can inspect per-request usage. This may remain the current "Ledger" page or be presented as a tab/section under a unified **Usage** area.
- **Filtering and export:** Retain filtering (e.g. by type, tier, session) and export (e.g. JSON) as part of the Usage feature.

### 4. Optional analytics and reporting

- **Aggregated view:** Over time, support an analytics view that aggregates usage by time window, platform, project, or tier (as in newfeatures §7). Can be a separate page or a section under Usage.
- **Cost tracking and attribution:** Where data is available (from platform APIs), show cost breakdowns by model, project, and date (see [openclaudecto](https://github.com/josharsh/openclaudecto), [yume analytics](https://aofp.github.io/yume/)).
- **Retention:** Policy for how long to keep usage/ledger data (e.g. file-based or redb-backed) to bound disk use while supporting 5h/7d and historical views.

### 5. Per-thread usage in Chat (OpenCode-style)
ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md

Per-thread usage is a canonical in-shell surface.

Rules:
- chat header context indicator is always the entrypoint
- hover shows summary metrics
- activation opens the thread Usage surface in the chat shell
- a detached usage pop-out is not canonical
- the same usage identity powers thread Usage, app-wide Usage, and cost_usage artifact deep-links
- mid-stream updates are allowed but must use explicit in-progress states until final usage totals are known

Thread Usage content:
- total tokens
- context-window fill percentage when known
- input/output/reasoning/cache breakdown when reported
- per-turn or per-segment usage history when available
- direct navigation to app-wide Usage preserving filters
### Cursor -- API (usage/account only; not for model invocation)

- **Distinction:** The **Cursor API** is for **augmenting usage/account data only** -- usage, limits, plan, billing, etc. We **do not** use it to engage with the platform to run models. Model invocation stays **CLI + OAuth** (subscription auth only). AGENTS.md "No API available" refers to "no API for invoking models"; the Cursor API that exists is a different surface (usage/account/limits) and does not conflict with our "CLI-only for execution, OAuth for auth" policy.
- **Availability:** Cursor exposes an API we can call to get usage/limits/account info. Using it only augments the Usage view; we do not use it to send prompts or run agents.
- **Auth:** For API calls (usage/account): `CURSOR_API_KEY` for headless/CI or app auth where applicable. Model runs continue to use OAuth/subscription via the CLI.
- **What we can get:** Usage, limits, or plan info where the API exposes it. **Deterministic default:** Cursor API augmentation is **disabled** until a Spec Lock update pins the endpoint contract; local aggregation from `usage.jsonl` remains the primary source of truth for 5h/7d and ledger.
- **Usage feature:** When implemented, call the Cursor API only for usage/limits/account data (with rate limiting and fallback to local aggregation); show Cursor usage and limits in the Usage view. If the API does not expose 5h/7d, keep local aggregation from `usage.jsonl` as primary and use the API for any extra fields (e.g. plan, feature flags).

### Codex -- CLI + provider data

- **Availability:** Run Codex via `codex exec ...` after OAuth/device-code auth (`codex login` / `codex login --device-auth`) or `CODEX_API_KEY` in headless contexts.
- **What we can get:** Structured CLI output (`--json` / JSONL), run metadata, and error parsing (including 5-hour window reset hints). Optional provider-side usage/quota endpoints can augment plan/limit display when available.
- **Usage feature:** Persist per-run usage metadata parsed from CLI events into `usage.jsonl`, and enrich with provider quota/reset data where supported. No SDK integration path.

### Copilot -- CLI + REST metrics

- **Availability:** Run Copilot through the CLI after GitHub OAuth/device auth (`/login`) or token auth (`GITHUB_TOKEN` / `GH_TOKEN`).
- **What we can get:** CLI run outputs plus GitHub REST metrics (`/orgs/{org}/copilot/metrics`) for org-level usage and limits.
- **Usage feature:** Record per-run usage from CLI output into `usage.jsonl`, and augment with GitHub metrics API data when tokens are configured. No SDK integration path.

### Claude Code -- Admin API (existing)

- **Availability:** Anthropic **Admin API** (`/v1/organizations/usage_report/claude_code`); env: `ANTHROPIC_API_KEY`. Already documented in AGENTS.md.
- **What we get:** Organization-level usage and cost; `customer_type`, `subscription_type` for plan detection. Per-session usage also available from **stream-json** output when we use `--output-format stream-json` (usage events in the stream).
- **Usage feature:** Use Admin API for 5h/7d or org windows when key is set; use stream-json usage events for per-run tokens and optional mid-stream context %. No SDK required for CLI-based runs.

### Gemini -- Direct-provider (local counters + estimated cost)
- **Availability:** Gemini is a **Direct-provider** with one provider surface and mixed account pools. Supported auth surfaces include OAuth and API key; Google credential-based execution remains capability-gated where supported.
- **What we show (authoritative):** One shared Gemini usage surface built from the canonical `UsageRecord` pipeline. It may combine provider runtime usage, provider quota APIs, provider usage APIs, provider error hints, and project rollups, but it MUST keep source/effective-mode labels visible.
- **Mode-aware labeling:** OAuth-backed quota views may be labeled `Gemini quota` when provider semantics are authoritative. API-key/local-only views MUST use source-qualified wording such as `Gemini (estimated)` when authoritative quota data is unavailable.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

- **Account attribution:** Gemini usage records SHOULD expose `effective_account_id`, `effective_auth_mode`, `provider_account_id?`, `signal_confidence`, and `effective_project_id?`.
- **Project context:** OAuth-backed Gemini usage may require configured/effective project context. That context is part of the effective runtime identity and MUST NOT be inferred from token presence alone.
- **Naming:** Use `Gemini API key` / `Google API key` terminology. Do not hardcode `AI Studio key` as the canonical product boundary.
- **Media:** Media generation follows the same requested/effective auth/account rules as normal Gemini usage rather than a separate key-only account system.

ContractRef: ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD, ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/rewrite-tie-in-memo.md
### Summary table (augmentation sources)
| Platform   | Primary augmentation | Auth / env | Notes |
|-----------|----------------------|------------|-------|
| **Cursor** | API (usage/limits/account only; not for model invocation) | `CURSOR_API_KEY` / app auth | OAuth + CLI for running models; Cursor API augmentation is disabled until Spec Lock pins an endpoint contract. |
| **Codex** | CLI stream + provider data | CLI login / `CODEX_API_KEY` | Per-run usage from CLI JSON/JSONL + optional provider quota data. |
| **Copilot** | CLI + REST metrics API | `GITHUB_TOKEN` / `GH_TOKEN` | Per-run usage from CLI; org-level from `/orgs/{org}/copilot/metrics`. |
| **Claude** | Admin API + stream-json usage | `ANTHROPIC_API_KEY` | Org usage + plan; per-run tokens from stream. |
| **Gemini** | Shared usage pipeline with auth/account attribution; provider runtime usage, quota APIs, usage APIs, error hints, and project rollups as available | Gemini OAuth accounts and/or Gemini API-key accounts; provider/account policy selects the effective auth surface | One provider surface; OAuth and API-key buckets are distinct and MUST remain source-labeled. |

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md
