# GitHub Copilot CLI and Cursor SDK Route Research

Ledger: `pldg-20260624-001-provider-updates`
Created: `2026-06-25T14:26:23Z`

## User prompt

Jared asked:

- `Look into ghcopilot cli more.`
- `Also, does this help with the cursor cli? see if this is a better approach to cursor support.`
- `Maybe use the Cursor SDK?`
- `https://github.com/Nomadcxx/opencode-cursor`
- `https://github.com/standardagents/composer-api`

## GitHub Copilot CLI findings

Local stale/current split:

- Existing PATH command `/Users/jaredsmacbookair/.local/bin/copilot` reports `GitHub Copilot CLI 0.0.421`.
- Current npm package `@github/copilot@1.0.65` was installed into `/tmp/pm-github-copilot-cli`.
- `/tmp/pm-github-copilot-cli/bin/copilot --version` reports `GitHub Copilot CLI 1.0.65`.
- `gh copilot -- version` also surfaced the old `0.0.421` command and an update notice.

Current command surface from `1.0.65`:

- Non-interactive prompt mode: `-p, --prompt <text>`.
- Script-friendly output: `--output-format text|json`.
- Streaming control: `--stream on|off`.
- Agent modes: `--mode interactive|plan|autopilot`, plus `--plan` and `--autopilot`.
- Reasoning/thinking effort: `--effort, --reasoning-effort <level>` with choices `none`, `low`, `medium`, `high`, `xhigh`, `max`.
- Attachment input: `--attachment <path>` for image or native document files in non-interactive mode.
- Permission controls: `--allow-all`, `--allow-all-tools`, `--allow-all-paths`, `--allow-all-urls`, `--available-tools`, `--disable-builtin-mcps`, `--no-custom-instructions`.

Version-drift finding:

- The old prompt probe used `--no-alt-screen`.
- Current `1.0.65` rejects `--no-alt-screen` as an unknown option.
- PM should not compile exact GitHub Copilot CLI command templates without version-gated verification.

Current hosted Copilot prompt probe:

```txt
PATH=/tmp/pm-github-copilot-cli/bin:$PATH COPILOT_AUTO_UPDATE=false copilot -p "Return exactly: ok" -s --no-color --allow-all --disable-builtin-mcps --no-custom-instructions --stream off --log-level all --log-dir /tmp/pm-copilot-latest-logs2
```

Sanitized result:

```txt
Error: Access denied by policy settings
Your Copilot CLI policy setting may be preventing access.
exit=1
```

Sanitized log detail:

- `Starting Copilot CLI: 1.0.65`
- `Failed to fetch OAuth user login (401): GitHub returned: Bad credentials`
- `Error loading models: Error: 403 "unauthorized: not authorized to use this Copilot feature\n"`
- `runPromptMode: exiting with code 1`

Local credential/environment checks:

- No `COPILOT_GITHUB_TOKEN`, `GH_TOKEN`, or `GITHUB_TOKEN` override was present in the shell environment.
- `security find-generic-password -s copilot-cli` found a macOS Keychain item for the Copilot CLI service; no secret was printed or recorded.
- Official GitHub troubleshooting maps `Access denied by policy settings` to org policy blocking Copilot CLI or the account lacking a Copilot license.

BYOK/custom provider surface:

- `copilot help providers` says setting `COPILOT_PROVIDER_BASE_URL` activates BYOK mode.
- It says GitHub authentication is not required when using a custom provider.
- Supported provider types include `openai`, `azure`, and `anthropic`.
- Key variables include `COPILOT_PROVIDER_API_KEY`, `COPILOT_PROVIDER_BEARER_TOKEN`, `COPILOT_PROVIDER_WIRE_API` (`completions` or `responses`), `COPILOT_MODEL`, `COPILOT_PROVIDER_MODEL_ID`, and `COPILOT_PROVIDER_WIRE_MODEL`.

Planning disposition:

- Hosted GitHub Copilot CLI is not locally end-to-end verified.
- The active blocker is now specific: policy/subscription/license/admin enablement, not generic install failure and not just unknown no-output behavior.
- Current Copilot CLI does support a thinking-effort control surface, but the hosted provider route cannot be compiled as working until the policy/license issue is resolved or explicitly compiled as blocked.
- BYOK mode is a separate custom-provider feature and should not be confused with hosted GitHub Copilot model access.

## Cursor route findings

### `Nomadcxx/opencode-cursor`

Local clone:

- Repository: `https://github.com/Nomadcxx/opencode-cursor`
- Commit: `21631ec9b05bc4ac02eb734e1a742a3a9e48e0d3`
- Package: `@rama_nigg/open-cursor@2.4.14`
- Optional dependency: `@cursor/sdk ^1.0.18`
- Binaries: `open-cursor`, `cursor-discover`, `mcptool`

Relevant behavior:

- The project is primarily an OpenCode plugin/provider route named `cursor-acp`.
- It exposes an OpenAI-compatible local proxy base URL, commonly `http://127.0.0.1:32124/v1`.
- Its documented auth path for most users is `cursor-agent login`.
- Its SDK backend requires a real Cursor API key from `cursor.com/settings`, `CURSOR_ACP_BACKEND=sdk`, or SDK fallback.
- It explicitly rejects using the historical `cursor-agent` placeholder string as an SDK key.
- Its dual-backend runtime defaults to `auto` and prefers the `cursor-agent` binary when present.
- If `cursor-agent` is unavailable and a real Cursor API key exists, or if `CURSOR_ACP_BACKEND=sdk` is set, it runs `@cursor/sdk` through `scripts/sdk-runner.mjs`.
- It includes MCP/tool-loop bridging for OpenCode, with tool execution owned by OpenCode in the default `CURSOR_ACP_TOOL_LOOP_MODE=opencode`.

Planning disposition:

- Useful reference for Cursor model routing, OpenCode plugin integration, SDK fallback, and tool-loop boundary handling.
- Not ideal as PM's primary Cursor support shape because its default path still depends on `cursor-agent`, and PM's local `cursor-agent` state is currently inconsistent.
- If PM uses this route, it should be treated as an OpenCode plugin compatibility path, not as the core Cursor provider architecture.

### `standardagents/composer-api`

Local clone:

- Repository: `https://github.com/standardagents/composer-api`
- Commit: `f90f45c39e3e72065d41cf661ac17416bf6ae978`
- Package: `api-for-cursor@0.1.0`
- Dependency: `@cursor/sdk ^1.0.13`
- Current npm `@cursor/sdk` latest observed: `1.0.21`

Relevant behavior:

- The project provides local OpenAI-compatible `chat.completions` and `responses` endpoints backed by Cursor Composer.
- Default local base URL: `http://127.0.0.1:8787/v1`.
- Endpoints: `GET /v1/models`, `POST /v1/chat/completions`, `POST /v1/responses`.
- The production path is a local macOS app that starts the localhost `/v1` server and stores the Cursor API key locally.
- The hosted Worker route is retained for temporary compatibility; the repo says Cursor asked them to take down the hosted API path, so production is the local app.
- OpenCode and Codex setup examples point to the local base URL, not the hosted Worker.
- Smoke scripts include isolated Codex and OpenCode provider checks against the local API.
- Model IDs in setup/smoke evidence include `composer-2.5` and `composer-2.5-fast`.

Media/compatibility evidence:

- Supports text and image input.
- Supports non-streaming and streaming output.
- Supports JSON-output prompt constraints and common SDK response shapes.
- Image inputs can be Chat Completions `image_url` parts or Responses `input_image` parts.
- Each resolved image must be 1MB or smaller.
- Explicitly rejects `n > 1`, `logprobs`, `top_logprobs`, audio output, OpenAI function/tool calls on the Responses API, and background Responses API jobs.
- Token usage is estimated from character counts because Cursor's stream does not return OpenAI token accounting on this path.

Local verification status:

- No `CURSOR_API_KEY` was present in the shell environment.
- `curl --max-time 2 http://127.0.0.1:8787/v1/models` failed to connect, so the local API app/server is not currently running.
- `/Applications` contains `Cursor.app`, but no `API for Cursor.app` process or local Cursor SDK bridge process was found.

Planning disposition:

- This is the better primary Cursor support direction than bridging `cursor-agent` directly: PM can model it as a Cursor SDK / local OpenAI-compatible direct provider route with normal provider/model/media capability records.
- It still needs local end-to-end proof with a real Cursor API key or running local app before PM can compile it as supported.
- `cursor-agent` should remain a separate optional CLI-bridged route and currently remains blocked by account/model/prompt readiness.
