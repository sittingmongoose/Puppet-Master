# Cursor Local Approach Testing

Ledger: `pldg-20260624-001-provider-updates`
Created: `2026-06-25T14:50:30Z`

## User prompt

Jared asked:

- `Test the cursor approaches if you can`

## Test hygiene

- Credential-bearing values were not printed into ledger evidence.
- Email/account-like output was redacted when commands exposed account fields.
- A non-dry-run `open-cursor sync-models` command briefly created `~/.config/opencode/opencode.json` with only the test-added `cursor-acp` provider block. `stat` showed the file birth time matched the test. Because the file did not exist before the test, it was deleted and `open-cursor status --json` again reported provider disabled, model count `0`, plugin missing.
- Remaining OpenCode/plugin tests used isolated HOME/config paths under `/tmp/pm-open-cursor-home`.
- No long-running `cursor-agent`, `opencode`, `vite`, SDK bridge, or Swift test processes were left running at the end of testing.

## Raw `cursor-agent` CLI route

Local command:

- Path: `/Users/jaredsmacbookair/.local/bin/cursor-agent`
- Version: `2026.02.13-41ac335`

Observed command surface:

- `cursor-agent --help` exposes `--api-key`, `--print`, `--output-format text|json|stream-json`, `--stream-partial-output`, `--mode plan|ask`, `--model`, `--list-models`, `--trust`, `--workspace`, `status|whoami`, `models`, `about`, `update`, and chat/session commands.

Observed readiness:

- `cursor-agent status` reports login success but cannot fetch user details.
- `cursor-agent about` reports `User Email Not logged in`.
- `cursor-agent models` reports `No models available for this account.`
- `cursor-agent --print --output-format text --trust --mode ask "Return exactly: ok"` exits `1` with `Authentication required. Please run 'agent login' first, or set CURSOR_API_KEY environment variable.`
- `cursor-agent --print --output-format stream-json --stream-partial-output --trust --mode ask "Return exactly: ok"` returns the same auth-required error.

Planning disposition:

- The raw Cursor Agent CLI route remains blocked for PM CLI-bridged support.
- The blocker is not just missing install or missing command surface; it is inconsistent local auth/model readiness and failed headless prompt execution.
- A real `CURSOR_API_KEY` may be the cleanest way to make this route testable, but it should not be confused with the separate Cursor SDK/local API provider route.

## `Nomadcxx/opencode-cursor` / `@rama_nigg/open-cursor`

Package/currentness:

- `@rama_nigg/open-cursor` latest npm version: `2.4.14`.
- Existing clone remained up to date at `21631ec9b05bc4ac02eb734e1a742a3a9e48e0d3`.
- Temp install succeeded under `/tmp/pm-open-cursor-prefix`.

Packaged CLI checks:

- `open-cursor --help` is not accepted as a command; `open-cursor help` is the supported help form. Unknown commands print the help text.
- `open-cursor status --json` in the real user environment reports provider disabled, plugin missing, `legacyCursorAuthFile: true`, `sdkApiKey: false`, backend preference `auto`.
- `open-cursor install --config /tmp/pm-open-cursor-test/opencode.json --plugin-dir /tmp/pm-open-cursor-test/plugin --skip-models --dry-run` reports it would install `cursor-acp` without writing files.
- `open-cursor sync-models --config /tmp/pm-open-cursor-test/opencode.json --variants --compact --dry-run` reports `cursor-agent models failed; using fallback models`, `Models synced: 14`, `Grouped Cursor models: 12`, and `Dry run: no changes written`.

Isolated OpenCode integration check:

- Isolated HOME/config: `/tmp/pm-open-cursor-home`.
- `open-cursor install --skip-models` in the isolated HOME succeeded but warned: `failed to install @ai-sdk/openai-compatible via bun (spawnSync bun ENOENT)`.
- `open-cursor sync-models --variants --compact` in the isolated HOME again fell back from failed `cursor-agent models` and wrote 14 fallback models.
- `/tmp/pm-provider-cli-tools/bin/opencode models cursor-acp` under the isolated HOME listed 14 `cursor-acp/...` model ids including `auto`, `composer-1`, `composer-1.5`, `gemini-3`, `gemini-3.1-pro`, `gpt-5.2`, `gpt-5.3-codex`, `gpt-5.4`, `grok`, `kimi-k2.5`, `opus-4.5`, `opus-4.6`, `sonnet-4.5`, and `sonnet-4.6`.
- `/tmp/pm-provider-cli-tools/bin/opencode run "Return exactly: ok" --model cursor-acp/auto` under the isolated HOME printed `cursor-acp error: Error: Authentication required. Please run 'agent login' first, or set CURSOR_API_KEY environment variable.` but exited `0`.
- Forcing `CURSOR_ACP_BACKEND=sdk` with a fake `CURSOR_API_KEY` still did not produce a successful run; OpenCode surfaced `cursor-acp error: cursor-agent exited with code 1 and no output` and exited `0`.
- Plugin logs showed the SDK child was spawned in forced SDK mode and completed requests with exit code `1`.

Planning disposition:

- `opencode-cursor` is useful as source-lineage for setup, fallback model catalog shaping, OpenCode provider config, and tool-loop/plugin boundary behavior.
- It is not a clean PM primary support route without additional work because its visible runtime behavior can fail while OpenCode exits `0`; PM must inspect output/events, not process exit alone.
- In this local environment, it does not produce a successful minimal prompt without working Cursor auth/API-key state.
- Missing `bun` also blocks its installer from fully satisfying the `@ai-sdk/openai-compatible` dependency in an isolated OpenCode HOME.

## `standardagents/composer-api`

Repo/currentness:

- Existing clone remained up to date at `f90f45c39e3e72065d41cf661ac17416bf6ae978`.
- `api-for-cursor` is not currently published as `api-for-cursor` on npm; testing is from the repo/local app path.
- `@cursor/sdk` latest npm version observed: `1.0.21`.

TypeScript/Worker adapter checks:

- `npm install` succeeded in `/tmp/pm-composer-api`.
- `npm test` passed: 9 test files, 227 tests.
- `npm run typecheck` passed with `tsc --noEmit`.

Vite/Cloudflare dev server check:

- `npm run dev -- --port 8797` did not start because the Cloudflare Vite plugin attempted to build container images and Docker CLI/daemon was unavailable.
- Retrying with `--enable-containers=false` failed because Vite treated that as an unknown option.
- This blocks ad hoc HTTP probing of the Worker dev server in this environment, but it is a local tooling/container issue rather than evidence that the adapter logic failed.

Standalone Cursor SDK bridge check:

- `node scripts/cursor-sdk-local-agent-bridge.mjs` started successfully on a temporary port.
- `GET /health` returned `{"ok":true,"agents":0}`.
- `POST /sdk` without `apiKey` returned HTTP 400 with `Missing apiKey`.
- `POST /sdk` with a fake API key returned HTTP 401 with `Missing or invalid authorization`.
- This proves the bridge process can start and validates key-gated request behavior locally; it does not prove live Cursor completion without a real Cursor API key.

Swift/macOS local API package check:

- `swift --version` is available locally.
- `swift test` and targeted `swift test --filter LocalAPIServerTests/testHealthEndpointReportsLoopbackAndSDKReadiness` both stalled on downloading Sparkle's binary artifact from GitHub and were manually interrupted.
- Treat Swift/macOS package tests as blocked by dependency artifact download, not as a local API server test failure.

Planning disposition:

- `composer-api` remains the strongest primary Cursor support direction after testing.
- Verified locally: TypeScript adapter/test suite, typecheck, SDK bridge startup and auth validation.
- Still unverified: real live Cursor completion through `/v1/chat/completions` or `/v1/responses`, because no real Cursor API key/local app session was available and the Worker dev server is blocked by Cloudflare container/Docker setup.
