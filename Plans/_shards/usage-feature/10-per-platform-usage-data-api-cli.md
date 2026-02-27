## Per-platform usage data (API / CLI)

Beyond state-file aggregation, each platform can augment Usage with API or CLI data. AGENTS.md currently summarizes usage sources; this section fleshes out what we can use to augment the Usage feature.

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

### Gemini -- APIs and CLI (mixed)

- **Availability:** **Cloud Quotas API** (`cloudquotas.googleapis.com`): quota limits, usage counts, reset times when `GOOGLE_CLOUD_PROJECT` and (optionally) `GOOGLE_APPLICATION_CREDENTIALS` are set. **Error parsing:** "Your quota will reset after 8h44m7s." from CLI errors. **CLI:** `gemini` CLI may expose usage or account info via a flag or subcommand -- **to be confirmed** (e.g. `gemini --account` or similar; not all platforms document this).
- **What we're not sure about:** Exact shape of Gemini's usage/limits from (1) CLI only (no SDK in our stack today), (2) Cloud Quotas API response (which metrics map to "5h" or "7d" or a single quota window). Plan detection is inferred from quota limits; no explicit "plan name" unless we derive it from limits.
- **Usage feature:** (1) Use Cloud Quotas API when credentials are set to get quota/usage and show in Usage view with a label like "Gemini quota". (2) Keep error-message parsing for reset countdown when a limit is hit. (3) Document in UI what "Gemini quota" means (e.g. "Quota window -- resets per API response or error message"). (4) If Gemini CLI adds an account/usage command, add a reader for it and document in this plan.

### Summary table (augmentation sources)

| Platform   | Primary augmentation              | Auth / env                    | Notes                                                                 |
|-----------|------------------------------------|-------------------------------|-----------------------------------------------------------------------|
| **Cursor**| API (usage/limits/account only; not for model invocation) | `CURSOR_API_KEY` / app auth  | OAuth + CLI for running models; Cursor API augmentation is disabled until Spec Lock pins an endpoint contract. |
| **Codex** | CLI stream + provider data         | CLI login / `CODEX_API_KEY`   | Per-run usage from CLI JSON/JSONL + optional provider quota data.      |
| **Copilot**| CLI + REST metrics API            | `GITHUB_TOKEN` / `GH_TOKEN`  | Per-run usage from CLI; org-level from `/orgs/{org}/copilot/metrics`.  |
| **Claude**| Admin API + stream-json usage     | `ANTHROPIC_API_KEY`          | Org usage + plan; per-run tokens from stream.                          |
| **Gemini**| Cloud Quotas API + error parsing  | `GOOGLE_CLOUD_PROJECT`, creds| Quota/usage from API; reset time from errors; do not rely on a CLI account/usage subcommand. |

**Implementation order:** State-file aggregation first (works for all platforms). Then add augmentation per platform: Claude (Admin API + stream) and error parsing (Codex, Gemini) are already documented; next wire Cursor API, Codex CLI usage enrichment, Copilot CLI + metrics API, and Gemini Cloud Quotas (and any CLI usage when confirmed).

