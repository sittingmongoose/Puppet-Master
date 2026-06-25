# Cursor Auth Model Clarification

- ledger_id: `pldg-20260624-001-provider-updates`
- created_at_utc: `2026-06-25T15:09:13Z`
- source_ref: `chat:cursor-oauth-vs-api-auth-clarification`
- scope: Ledger-only planning evidence. Do not edit canonical Plans from this shard.

## User correction / question

Jared asked: `Doesn’t cursor use oauth logins and not an api?`

Preserved exact tokens:
- `Doesn’t cursor use oauth logins and not an api?`
- `oauth logins`
- `not an api`

## Current official docs evidence

- Cursor CLI authentication docs say the CLI supports browser-based login and API keys. Planning implication: PM must not treat Cursor CLI as API-key-only.
- Cursor headless CLI docs show non-interactive scripting with `CURSOR_API_KEY`. Planning implication: PM may treat headless/non-interactive CLI use as API-key capable, but local proof still requires a valid credential.
- Cursor TypeScript SDK docs say the SDK accepts user API keys and service account API keys for local and cloud runs. Planning implication: SDK/local agent routes require API-key auth unless a future official auth mode is verified.
- Cursor API docs say Cursor APIs accept Basic Authentication, with Cloud Agents additionally accepting Bearer tokens. Planning implication: Cursor REST/API surfaces are API-key-authenticated, not browser-login-only.
- Cursor Cloud Agents API docs say user API keys come from Cursor Dashboard API Keys or service account keys. Planning implication: Cloud Agents/API routes must be modeled separately from the interactive Cursor app/session.

Official source URLs:
- `https://cursor.com/docs/cli/reference/authentication`
- `https://cursor.com/docs/cli/headless`
- `https://cursor.com/docs/sdk/typescript`
- `https://cursor.com/docs/api`
- `https://cursor.com/docs/cloud-agent/api/endpoints`

## Local CLI evidence

Installed local binary:
- `/Users/jaredsmacbookair/.local/bin/cursor-agent`

Observed command help:
- `cursor-agent --help` exposes `--api-key <key>` and says it can also use `CURSOR_API_KEY`.
- `cursor-agent login --help` says login authenticates with Cursor and can open a browser.

Planning implication: PM should record `cursor_agent_cli` as a hybrid route: browser login/OAuth-style session for ordinary interactive CLI/app use, plus API-key auth for headless/scripted use.

## Local bridge / repo evidence

`standardagents/composer-api` evidence:
- The README says Cursor does not expose Composer as a raw OpenAI-compatible endpoint.
- The local app/bridge exposes localhost `/v1` and uses a locally stored Cursor API key.
- Source and smoke scripts expect a Cursor API key for live routing.

`Nomadcxx/opencode-cursor` evidence:
- Default/legacy flow references `cursor-agent login`.
- SDK backend requires a real Cursor API key through `CURSOR_API_KEY` or OpenCode auth.
- Current changelog says the legacy OAuth flow via `cursor-agent login` is no longer supported by the plugin's newer SDK-auth direction.

Planning implication: PM should not collapse Cursor support into one auth rule. `opencode-cursor` is hybrid/source-lineage evidence; `composer-api` / Cursor SDK local route is API-key gated and remains unverified for live completion without a real key.

## Ledger disposition

Accepted clarification:
- Cursor support must be route-specific, not `API-key-only` and not `OAuth-only`.
- Interactive Cursor app / normal Cursor Agent CLI: browser-login/OAuth-style session route.
- Cursor Agent headless / scripting: API-key-capable route via `--api-key` or `CURSOR_API_KEY`.
- Cursor SDK, Cursor REST/API, Cloud Agents, and `composer-api` local OpenAI-compatible bridge: API-key-authenticated route.
- `opencode-cursor`: hybrid route; newer SDK backend is API-key-authenticated, older/default CLI route depends on `cursor-agent` auth.

Negative constraints:
- Do not describe Cursor as API-key-only.
- Do not describe every Cursor path as OAuth-only.
- Do not treat the local `composer-api` OpenAI-compatible bridge as proof that Cursor exposes Composer as a raw OpenAI-compatible model endpoint.
- Do not let interactive browser-login proof satisfy SDK/API-key route verification.
- Do not let SDK/API-key bridge startup proof satisfy interactive Cursor Agent login verification.

`gui_related`: `false`; this is provider/auth routing and verification policy, not GUI/UI/visual presentation.
