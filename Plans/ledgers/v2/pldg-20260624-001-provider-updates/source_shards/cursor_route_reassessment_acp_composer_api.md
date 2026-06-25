# Cursor Route Reassessment: CLI Bridge, ACP, and Composer API

- ledger_id: `pldg-20260624-001-provider-updates`
- created_at_utc: `2026-06-25T17:33:31Z`
- source_ref: `chat:cursor-cli-bridge-acp-composer-api-reassessment`
- scope: Ledger-only planning evidence. Do not edit canonical Plans from this shard.

## User prompt

Jared asked:

> So is this using a cli bridge?  Are we using acp?  This method https://github.com/standardagents/composer-api seems more feature complete.  Would it be a better option?  Apparently you can just get your api from your cursor sub so that would be fine.  It’s in the cursor dashboard and using your cursor sub still.

## Clarification

The previously locked Cursor primary route was a CLI bridge in PM terms:

- PM would call the local `cursor-agent` / `agent` binary in headless print mode.
- It was not ACP.
- It was not the Cursor SDK/API-key route.
- It was not `opencode-cursor`.

Current evidence adds two important alternatives:

- First-party Cursor ACP exists locally as `agent acp`.
- `standardagents/composer-api` exposes Cursor Composer through a local OpenAI-compatible HTTP API when given a Cursor user API key from Dashboard -> Integrations.

## ACP local verification

Local command surface:

- `agent acp --help` returns: `Start the Cursor Agent as an ACP (Agent Client Protocol) server`.

Minimal ACP JSON-RPC prompt probe:

- Started `agent acp`.
- Sent `initialize`.
- Sent `authenticate` with `methodId: cursor_login`.
- Created a session with `session/new`.
- Sent `session/prompt` with `Reply with exactly: cursor-acp-ok`.
- Result:
  - `ok: true`
  - `stopReason: end_turn`
  - response text: `cursor-acp-ok`

ACP capability details from the local probe:

- `protocolVersion: 1`
- `agentCapabilities.loadSession: true`
- `agentCapabilities.mcpCapabilities.http: true`
- `agentCapabilities.mcpCapabilities.sse: true`
- `promptCapabilities.image: true`
- `promptCapabilities.audio: false`
- auth method `cursor_login`

Planning disposition:

- ACP is a live first-party Cursor integration route.
- ACP is richer than simple `cursor-agent --print` for agent/session/client integration.
- ACP is still a local process/stdio bridge, not an OpenAI-compatible direct HTTP provider.

## Composer API current repo evidence

Repository inspected:

- `standardagents/composer-api`
- current local clone: `/tmp/pm-composer-api-current`
- commit: `f90f45c39e3e72065d41cf661ac17416bf6ae978`

Current README states:

- API for Cursor is a local macOS app.
- It starts a localhost `/v1` server.
- It stores the Cursor API key locally in the app UI.
- A Cursor user API key comes from the Cursor Dashboard under Integrations.
- Supported endpoints:
  - `POST /v1/chat/completions`
  - `POST /v1/responses`
  - `GET /v1/models`
- Default local base URL:
  - `http://127.0.0.1:8787/v1`
- Production path is the signed macOS app; hosted Worker routes are legacy/temporary.
- The app has an Agent Setup pane to install local OpenCode provider config pointing at the local base URL.

Compatibility notes from the repo:

- Supports text and image input.
- Supports non-streaming and streaming output.
- Supports JSON-output prompt constraints.
- Supports common SDK response shapes.
- Image inputs can be Chat Completions `image_url` parts or Responses `input_image` parts.
- Each resolved image must be 1MB or smaller.
- Intentionally rejects unsupported OpenAI controls:
  - `n` greater than `1`
  - `logprobs`
  - `top_logprobs`
  - audio output
  - OpenAI function/tool calls on Responses API
  - background Responses API jobs
- Token usage is estimated from character counts because Cursor's stream does not return OpenAI token accounting on this path.

Prior local repo tests still apply:

- `npm install` passed.
- `npm test` passed 9 test files / 227 tests.
- `npm run typecheck` passed.
- Standalone SDK bridge started and validated expected missing/fake key errors.

Current local runtime status:

- No API for Cursor app was found installed in `/Applications`, `~/Applications`, or `~/Downloads`.
- `curl http://127.0.0.1:8787/v1/models` failed to connect, so the local app/server is not currently running.
- Live completion through composer-api still requires installing/starting the app and entering a real Cursor API key from the Cursor dashboard.

## Recommendation

`composer-api` should be promoted from secondary fallback to preferred direct-provider candidate, contingent on local end-to-end verification with a real Cursor API key.

Reason:

- It gives PM an OpenAI-compatible HTTP provider surface, which fits PM's direct-provider architecture better than shelling out to `cursor-agent --print`.
- It exposes standard `/v1/models`, `/v1/chat/completions`, and `/v1/responses` surfaces.
- It supports streaming and image input.
- It can integrate with OpenCode as a local provider pointed at localhost.
- It uses the user's Cursor subscription through a Cursor dashboard API key, matching Jared's preference that the route remain tied to the Cursor subscription.

Suggested route hierarchy:

1. Preferred direct-provider candidate: `composer-api` local app / OpenAI-compatible HTTP server, after live key/app verification.
2. First-party session/agent candidate: Cursor ACP via `agent acp`, already locally prompt-verified.
3. Fallback CLI route: `cursor-agent --print --trust --mode ask`, already locally prompt-verified.
4. Non-primary/blocked: `opencode-cursor`, still blocked/hanging with parser fallback behavior.

## Negative constraints

- Do not claim composer-api live support until the local app/server is running and a real Cursor API key returns a minimal prompt.
- Do not store Cursor API keys, dashboard secrets, local credential material, or bearer tokens in ledger evidence or Plans.
- Do not keep the prior `cursor-agent --print` route as the sole locked primary route after this reassessment if composer-api verification succeeds.
- Do not use the legacy hosted Worker path as the production path; current repo guidance says the signed local macOS app is the production release path.
- Do not treat ACP as OpenAI-compatible HTTP; ACP is JSON-RPC over stdio through `agent acp`.
- Do not treat `opencode-cursor` success as implied by direct Cursor Agent, ACP, or composer-api evidence.

`gui_related`: `true`; this route affects provider setup surfaces, API-key entry/storage UI, model picker availability, image-input controls, and provider-route status/disclosure.
