# Cursor OAuth Live Verification

- ledger_id: `pldg-20260624-001-provider-updates`
- created_at_utc: `2026-06-25T16:26:01Z`
- source_ref: `chat:retry-automated-tests-with-user-at-computer`
- scope: Ledger-only planning evidence. Do not edit canonical Plans from this shard.

## User prompt

Jared said: `try the automated tests again, i am in front of the computer you are running on.`

Preserved exact tokens:
- `try the automated tests again`
- `i am in front of the computer you are running on`

## Test hygiene

- OAuth login URL/challenge token is not preserved in ledger evidence.
- Account email was observed in command output but is redacted from this shard.
- No `CURSOR_API_KEY` was used.
- No canonical Plans, PlanUnit index, WorkNodes, NodeSeeds, executable queues, Spec Lock, shards, evidence, plan_graph, or auto_decisions were touched.
- No long-running `cursor-agent`, `opencode`, `open-cursor`, or `cursor-acp` processes were left running.

## Direct Cursor Agent OAuth/session route

Commands run:

- `cursor-agent login`
- `cursor-agent status`
- `cursor-agent about`
- `cursor-agent models`
- `cursor-agent --print --trust --mode ask --model composer-2.5-fast "Reply with exactly: cursor-oauth-ok"`
- `cursor-agent --print --trust --mode ask --output-format stream-json --model composer-2.5-fast "Reply with exactly: cursor-oauth-json-ok"`

Observed results:

- Browser OAuth login completed successfully.
- `cursor-agent status` reported logged in as the redacted account.
- `cursor-agent about` reported CLI version `2026.02.13-41ac335`, current model `Claude 4.6 Opus (Thinking)`, and the redacted account email.
- `cursor-agent models` returned a live model catalog.
- Sanitized model-count pass counted `139` model rows.
- Representative verified model rows included:
  - `composer-2.5-fast - Composer 2.5 Fast  (current, default)`
  - `gpt-5.3-codex - Codex 5.3`
  - `gpt-5.3-codex-high - Codex 5.3 High`
  - `claude-opus-4-8-thinking-high - Opus 4.8 1M Thinking`
  - `gemini-3.1-pro - Gemini 3.1 Pro`
- Text prompt returned exactly `cursor-oauth-ok`.
- `stream-json` prompt returned:
  - `apiKeySource`: `login`
  - `model`: `Composer 2.5 Fast`
  - `subtype`: `success`
  - `is_error`: `false`
  - `result`: `cursor-oauth-json-ok`

Planning disposition:

- Direct Cursor Agent OAuth/session route is locally live-verified for login, status, account visibility, model listing, text prompt completion, and stream-json prompt completion.
- Cursor provider planning can compile this route as OAuth/session-based once the broader feature is explicitly compiled, subject to preserving the exact provider/model catalog shape and thinking-effort model variants.
- This does not verify API-key / SDK / local bridge routes.

## OpenCode plugin route after OAuth login

Retested `@rama_nigg/open-cursor` / `opencode-cursor` after direct OAuth login succeeded.

Commands/conditions:

- Isolated OpenCode HOME/config at `/tmp/pm-open-cursor-home`.
- Real Cursor OAuth session in the user HOME.
- Temp OpenCode config pointed at `cursor-acp` provider/plugin.
- `open-cursor sync-models --variants --compact --dry-run`
- `opencode models cursor-acp`
- `opencode run "Reply with exactly: opencode-cursor-oauth-ok" --model cursor-acp/auto`
- Forced backend retry with `CURSOR_ACP_BACKEND=cursor-agent` and `CURSOR_ACP_HOME_DIR=/Users/jaredsmacbookair`.

Observed results:

- In isolated HOME, direct `cursor-agent status` reported `Not logged in`; direct prompt under isolated HOME failed with `Authentication required`.
- Keeping real HOME while pointing `OPENCODE_CONFIG` to the temp config allowed direct `cursor-agent status` to see the logged-in session.
- `open-cursor sync-models --variants --compact --dry-run` still warned `cursor-agent models failed; using fallback models (No models parsed from cursor-agent output)` and produced the 14-model fallback catalog.
- `opencode models cursor-acp` listed the 14 fallback `cursor-acp/...` models.
- `opencode run ... --model cursor-acp/auto` with isolated HOME failed auth exactly as before.
- `opencode run ... --model cursor-acp/auto` with real HOME and temp config no longer failed immediately on auth, but hung without producing the expected marker and was manually interrupted.
- Forced `CURSOR_ACP_BACKEND=cursor-agent` with real HOME override also hung without producing the expected marker and was manually interrupted.
- Process check after interruption showed no lingering `cursor-agent`, `opencode`, `open-cursor`, or `cursor-acp` processes.

Planning disposition:

- `opencode-cursor` remains useful source-lineage but is not live-verified for OAuth/session support.
- Its model sync/parser currently cannot parse the full live `cursor-agent models` output and falls back to 14 models.
- The plugin route has a different unresolved blocker than before: direct Cursor OAuth works, but the plugin either isolates away the session or hangs when run against the real session.
- PM should not rely on `opencode-cursor` for primary Cursor OAuth support unless this plugin-specific hang/parser problem is resolved.

## Negative constraints

- Do not require a Cursor API key for direct Cursor Agent OAuth/session support.
- Do not classify `opencode-cursor` as live-supported merely because direct `cursor-agent` OAuth is now verified.
- Do not classify plugin runtime success from process exit alone; one failed path still exits `0`, and one path hangs until interrupted.
- Do not preserve account email or OAuth challenge URLs in source evidence.
- Do not let API-key / SDK / local bridge tests substitute for OAuth/session verification.

`gui_related`: `false`; this is provider/auth routing and CLI verification evidence, not GUI/UI/visual presentation.
