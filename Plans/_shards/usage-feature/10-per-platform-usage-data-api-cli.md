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

### Gemini -- Direct-provider (local counters + estimated cost)

- **Availability:** Gemini is a **Direct-provider**. Puppet Master records local per-run usage events into `usage.jsonl` and can display **estimated** cost (estimate only).
- **What we show (authoritative):** Local counters and ledger derived from `usage.jsonl` (e.g., 5h/7d rollups) plus per-run totals when available from provider responses.
- **Optional external reference:** Provide an optional UI link/button to AI Studio "Usage & Limits" for account-level quota/limit visibility. Do **not** claim authoritative remaining quota in-app unless a supported API exists for the configured key/account.


### Summary table (augmentation sources)

| Platform   | Primary augmentation              | Auth / env                    | Notes                                                                 |
|-----------|------------------------------------|-------------------------------|-----------------------------------------------------------------------|
| **Cursor**| API (usage/limits/account only; not for model invocation) | `CURSOR_API_KEY` / app auth  | OAuth + CLI for running models; Cursor API augmentation is disabled until Spec Lock pins an endpoint contract. |
| **Codex** | CLI stream + provider data         | CLI login / `CODEX_API_KEY`   | Per-run usage from CLI JSON/JSONL + optional provider quota data.      |
| **Copilot**| CLI + REST metrics API            | `GITHUB_TOKEN` / `GH_TOKEN`  | Per-run usage from CLI; org-level from `/orgs/{org}/copilot/metrics`.  |
| **Claude**| Admin API + stream-json usage     | `ANTHROPIC_API_KEY`          | Org usage + plan; per-run tokens from stream.                          |
| **Gemini**| Local counters + estimated cost (no authoritative quota) | Google Gemini API key (see Settings) | Optional external link to AI Studio "Usage & Limits"; do not claim remaining quota in-app without a supported API. |

**Implementation order:** State-file aggregation first (works for all platforms). Then add augmentation per platform: Claude (Admin API + stream) and error parsing (Codex) is already documented; next wire Cursor API, Codex CLI usage enrichment, Copilot CLI + metrics API, and Gemini estimated-cost display (plus optional AI Studio link).

