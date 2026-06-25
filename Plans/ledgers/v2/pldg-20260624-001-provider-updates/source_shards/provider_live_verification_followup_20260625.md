# Provider Live Verification Follow-up: Claude Code, Antigravity, Cursor, OpenCode Server

- ledger_id: `pldg-20260624-001-provider-updates`
- created_at_utc: `2026-06-25T16:52:05Z`
- source_ref: `chat:logged-in-provider-retest-and-opencode-server`
- scope: Ledger-only planning evidence. Do not edit canonical Plans from this shard.

## User prompt

Jared said:

> claude code, antigravity, cursor are logged in now.  So you can test them.  Also, you need to test the opencode server as a direct provider.

## Test hygiene

- Account email, org identifiers, OAuth URLs, tokens, API keys, and credential material were observed only when commands printed them; they are redacted from this shard.
- No canonical Plans, PlanUnit index, WorkNodes, NodeSeeds, executable queues, Spec Lock, shards, evidence, plan_graph, or auto_decisions were touched.
- The OpenCode server process was stopped after testing.

## Claude Code retest

Local auth status:

- `loggedIn: true`
- `authMethod: claude.ai`
- `apiProvider: firstParty`
- account and org fields redacted

Prompt probes:

- Command shape: `claude -p --output-format json --permission-mode plan --tools "" --model sonnet "Reply with exactly: claude-retest-ok"`
- Result: success
- Result text: `claude-retest-ok`

Thinking-effort probe:

- Command shape: `claude -p --output-format json --permission-mode plan --tools "" --model sonnet --effort low "Reply with exactly: claude-effort-low-ok"`
- Result: success
- Result text: `claude-effort-low-ok`

Planning disposition:

- Fresh retest confirms the already-recorded Claude Code first-party `claude.ai` route remains locally live-verified.
- The `--effort low` selector is confirmed again; previous source evidence already verified `low`, `medium`, and `high`.

## Cursor Agent OAuth/session retest

Local status:

- `cursor-agent status` reported a logged-in account; account details are redacted.

Prompt probe:

- Command shape: `cursor-agent --print --trust --mode ask --model composer-2.5-fast "Reply with exactly: cursor-retest-ok"`
- Result text: `cursor-retest-ok`

Thinking-effort/model-selection surface:

- `cursor-agent --help` shows `--model <model>` and says parameterized models accept quoted bracket syntax such as `claude-opus-4-8[context=1m,effort=high,fast=false]`.
- `cursor-agent models` includes effort/model variants such as:
  - `gpt-5.3-codex-low`
  - `gpt-5.3-codex-high`
  - `gpt-5.3-codex-xhigh`
  - `claude-opus-4-8-thinking-low`
  - `claude-opus-4-8-thinking-medium`
  - `claude-opus-4-8-thinking-high`

Planning disposition:

- Fresh retest confirms the direct Cursor Agent OAuth/session route remains locally live-verified.
- Cursor effort selection should be modeled as model/variant selection and parameterized model syntax, not as a universal raw CLI flag.

## Antigravity CLI live verification

Installed binary:

- `/Users/jaredsmacbookair/.local/bin/agy`

Version:

- `1.0.12`

Relevant command surface from `agy --help`:

- `--model`
- `-p`, `--print`
- `--prompt`
- `--print-timeout`
- `--prompt-interactive`
- `--conversation`
- `--continue`
- `--sandbox`
- `--dangerously-skip-permissions`
- subcommands: `changelog`, `help`, `install`, `models`, `plugin`/`plugins`, `update`

Model catalog:

- `agy models` returned:
  - `Gemini 3.5 Flash (Medium)`
  - `Gemini 3.5 Flash (High)`
  - `Gemini 3.5 Flash (Low)`
  - `Gemini 3.1 Pro (Low)`
  - `Gemini 3.1 Pro (High)`
  - `Claude Sonnet 4.6 (Thinking)`
  - `Claude Opus 4.6 (Thinking)`
  - `GPT-OSS 120B (Medium)`

Prompt probes:

- Default model:
  - Command shape: `agy --print-timeout 45s -p "Reply with exactly: antigravity-default-ok"`
  - Result text: `antigravity-default-ok`
- Explicit Gemini effort model:
  - Command shape: `agy --print-timeout 45s --model "Gemini 3.5 Flash (Low)" -p "Reply with exactly: antigravity-model-ok"`
  - Result text: `antigravity-model-ok`
- Explicit Claude model:
  - Command shape: `agy --print-timeout 45s --model "Claude Sonnet 4.6 (Thinking)" -p "Reply with exactly: antigravity-claude-ok"`
  - Result text: `antigravity-claude-ok`

Planning disposition:

- Antigravity CLI is no longer merely auth-gated in this environment; it is locally live-verified for model listing, default prompt execution, explicit model selection, and multi-vendor model routing.
- Antigravity must not be modeled as Gemini-only.
- Current live proof is text print-mode output. No JSON or stream output mode was observed in `agy --help`; do not claim machine-readable output until separately verified.
- Effort appears in displayed model names, so PM should map requested thinking effort to provider/model-specific choices and record requested/effective behavior.

## OpenCode server direct-provider verification

Binary:

- `/tmp/pm-provider-cli-tools/bin/opencode`

Version:

- `1.17.11`

Server command shape:

- `/tmp/pm-provider-cli-tools/bin/opencode serve --hostname 127.0.0.1 --port 17891 --print-logs --log-level DEBUG`

Server health:

- `GET /global/health`
- Result: `{"healthy":true,"version":"1.17.11"}`

API surface:

- `/doc` exposes OpenAPI.
- Relevant routes include:
  - `/api/model`
  - `/api/provider`
  - `/api/session`
  - `/api/session/{sessionID}/prompt`
  - `/config/providers`
  - `/provider`
  - `/session`
  - `/session/{sessionID}/message`

Configured providers:

- `GET /config/providers?directory=/Users/jaredsmacbookair/Documents/PuppetMaster` returned:
  - default `github-copilot`: `claude-sonnet-4.6`
  - default `opencode`: `big-pickle`
  - configured providers:
    - `github-copilot`, name `GitHub Copilot`, 25 models
    - `opencode`, name `OpenCode Zen`, 5 models

Broad provider catalog:

- `GET /provider?...` summarized:
  - `all_count: 144`
  - connected providers: `github-copilot`, `opencode`
  - connected `opencode` sample models: `big-pickle`, `deepseek-v4-flash-free`, `mimo-v2.5-free`, `nemotron-3-ultra-free`, `north-mini-code-free`
  - connected `github-copilot` sample models: `claude-fable-5`, `claude-haiku-4.5`, `claude-opus-4.5`, `claude-opus-4.6`, `claude-opus-4.6-fast`, `claude-opus-4.7`, `claude-opus-4.7-fast`, `claude-opus-4.8`

OpenCode model/media catalog:

- `GET /api/model?...` for the OpenCode API surface returned:
  - model count: 21
  - active count: 5
  - deprecated count: 16
  - inputs seen: `audio`, `image`, `pdf`, `text`, `video`
  - outputs seen: `text`
  - media-capable examples include:
    - `mimo-v2.5-free`: input `text`, `image`, `audio`, `video`; output `text`; status `active`
    - `mimo-v2-omni-free`: input `text`, `image`, `audio`, `pdf`; output `text`; status `deprecated`

Direct server prompt proof:

- Created a session with model `{ "id": "big-pickle", "providerID": "opencode" }`.
- Sent prompt through `POST /session/{sessionID}/message?...` with model `{ "providerID": "opencode", "modelID": "big-pickle" }`.
- Prompt text: `Reply with exactly: opencode-server-ok`
- Assistant response:
  - provider: `opencode`
  - model: `big-pickle`
  - text part: `opencode-server-ok`

Planning disposition:

- OpenCode server is locally live-verified as a direct provider route for `opencode/big-pickle` over HTTP.
- PM should not require OpenCode CLI bridging for core OpenCode support, but can use the server API as a direct provider surface.
- The server catalog is useful for provider -> models and media capability extraction.

## OpenCode-server-routed GitHub Copilot result

Tested route:

- Same OpenCode server session.
- Sent prompt through `POST /session/{sessionID}/message?...` with model `{ "providerID": "github-copilot", "modelID": "claude-haiku-4.5" }`.
- Prompt text: `Reply with exactly: opencode-server-copilot-ok`

Observed result:

- HTTP returned an assistant message object, but it had no text parts.
- Follow-up message listing showed an assistant message with provider `github-copilot`, model `claude-haiku-4.5`, zero tokens, no text parts, and no visible error part.
- Server logs showed:
  - `stream providerID=github-copilot modelID=claude-haiku-4.5`
  - `llm runtime selected llm.runtime=ai-sdk llm.provider=github-copilot llm.model=claude-haiku-4.5`
  - `stream error ... AI_APICallError: Forbidden`

Planning disposition:

- The OpenCode server's `github-copilot` provider is catalog-visible and listed as connected, but live prompt execution is not verified; it is currently `Forbidden`.
- Do not classify OpenCode-server-routed GitHub Copilot as working from HTTP 200 or message-object creation alone.
- Direct-provider adapters must validate final text/error/log status, not only request acceptance.

## Negative constraints

- Do not preserve account emails, org identifiers, OAuth URLs, tokens, API keys, request IDs, or credential material.
- Do not leave Antigravity CLI in the open auth-gated bucket after this local prompt proof.
- Do not model Antigravity as Gemini-only.
- Do not claim `agy` JSON or stream output until verified.
- Do not classify OpenCode-server-routed GitHub Copilot as live-supported while it returns `Forbidden`.
- Do not treat OpenCode server request acceptance as equivalent to model completion success.
- Do not require OpenCode CLI bridging for core OpenCode direct-provider support.

`gui_related`: `false`; this shard records provider/auth/runtime verification evidence, not GUI/UI/visual presentation.
