# Cursor API-Key / Composer-API Live Verification - 2026-06-25

Source refs:
- chat:cursor-api-key-live-verification
- local_clone:/tmp/pm-composer-api-current@f90f45c39e3e72065d41cf661ac17416bf6ae978
- github:https://github.com/standardagents/composer-api
- local_temp:/tmp/pm-composer-api-current/.pm-tests/*.mjs

Secret handling:
- Jared provided a Cursor API key for live testing and explicitly said: `Dont put it in the ledger.`
- The key is intentionally not recorded here, not copied into repo files, and not included in command summaries.
- Test harnesses read the key from process environment only.

Repo/currentness:
- `/tmp/pm-composer-api-current` was already cloned from `https://github.com/standardagents/composer-api`.
- `git pull --ff-only` reported `Already up to date.`
- Current commit: `f90f45c39e3e72065d41cf661ac17416bf6ae978`.
- `npm install` completed in the temp clone.

Direct Cursor SDK probe:
- `Cursor.models.list({ apiKey })` succeeded.
- Live model count: `31`.
- First model IDs included `default`, `composer-2.5`, `claude-opus-4-8`, `gpt-5.5`, `claude-sonnet-4-6`, `composer-2`, `gpt-5.3-codex`, `claude-opus-4-7`, `grok-build-0.1`, `gpt-5.4`, `claude-opus-4-6`, `claude-opus-4-5`.
- `Agent.create` + `agent.send` with local cwd `/tmp/pm-cursor-sdk-workspace` returned exactly `cursor-api-sdk-ok`.
- Completion status: `finished`.
- Agent ID and run ID were present.

Standalone `scripts/cursor-sdk-responses-proxy.mjs` probe:
- Local proxy started on `http://127.0.0.1:8791/v1`.
- `/v1/health` returned `ok: true`.
- `/v1/models` with the Cursor API key returned live model count `31`.
- `POST /v1/responses` non-streaming returned exactly `cursor-responses-ok`.
- `GET /v1/responses/{id}` returned the stored response.
- `POST /v1/responses` streaming emitted Responses SSE events and completed with exactly `cursor-responses-stream-ok`.
- `input_image` data URL probe used a generated solid red PNG and returned exactly `red`.
- This is the strongest local proof that the Cursor SDK route can carry image input when the adapter passes image bytes into `Agent.send`.

Standalone `scripts/cursor-sdk-local-agent-bridge.mjs` probe:
- Local bridge started on `http://127.0.0.1:8792/sdk`.
- `/health` returned `ok: true`.
- `POST /sdk` non-streaming returned exactly `cursor-bridge-ok`.
- `POST /sdk` with `streamEvents: true` returned NDJSON `text` events plus `done`, completing with exactly `cursor-bridge-stream-ok`.
- Client-tool forwarding probe returned `status: tool_call`.
- Captured SDK tool call shape:
  - `name: mcp`
  - `providerIdentifier: client`
  - `toolName: pm_echo`
  - `args.message: cursor-tool-ok`
- This verifies that the bridge forwards outer-client tools through Cursor SDK MCP rather than executing tools inside the bridge runtime.

Worker/local OpenAI-compatible HTTP probe:
- The signed production macOS app was not installed locally, so the app-packaged localhost server itself was not tested.
- The repo Worker/Vite surface was run locally on `http://127.0.0.1:8787/v1` after temp-clone-only config changes:
  - `dev.enable_containers=false`
  - removed temp `CURSOR_SDK_BRIDGE_CONTAINER` binding so the Worker used `CURSOR_SDK_BRIDGE_URL`
  - `.dev.vars` supplied non-secret local bridge settings
- Initial dev attempts failed usefully:
  - Docker/Cloudflare container build was required by the default config.
  - With containers disabled but the Durable Object binding still present, `/v1/chat/completions` failed because containers were not enabled for that class.
  - Without `.dev.vars`, the Worker did not see `CURSOR_SDK_BRIDGE_URL` and fell back to the legacy Cursor backend path with `Cursor backend URL is not configured`.
- After temp config was corrected:
  - `GET /v1/models` returned 19 static Worker models including `default`, `composer-2.5`, `composer-2.5-fast`, `composer-2`, `composer-latest`, `gpt-5.3-codex`, `gpt-5.2-codex`, `gpt-5.1-codex-max`, `gpt-5.1-codex-mini`, `gpt-5.2`.
  - `POST /v1/chat/completions` returned exactly `cursor-worker-chat-ok`.
  - streaming `POST /v1/chat/completions` returned OpenAI data-only SSE chunks and completed with exactly `cursor-worker-chat-stream-ok`.
  - `POST /v1/responses` returned exactly `cursor-worker-responses-ok` in `output[0].content[0].text`.
  - `GET /v1/responses/{id}` returned the stored response.
  - Chat Completions tool-call probe returned `finish_reason: tool_calls`, function name `pm_echo`, and arguments `{"message":"cursor-worker-tool-ok"}`.
- Compatibility note: the Worker Responses object did not include an `output_text` convenience field even though text was present in `output[0].content[0].text`.
- Media caveat: when the Worker uses the external SDK bridge path, `worker/cursor-sdk.ts` `sdkPrompt()` only appends a text note that image inputs were attached; it does not transmit image bytes to the bridge. Do not treat Worker+external-bridge as image-input verified. The standalone Responses proxy image test is the verified image path.

Automated repo checks:
- `npm test` passed: 9 test files, 227 tests.
- `npm run typecheck` passed: `tsc --noEmit`.

Planning conclusions:
- The Cursor Dashboard API-key / Cursor SDK route is live-verified for model discovery and prompt completion.
- The composer-api-style Responses proxy is live-verified for models, non-streaming responses, streaming responses, response retrieval/state, and image input.
- The local-agent bridge is live-verified for non-streaming text, streaming NDJSON, and client-tool forwarding via SDK MCP.
- The Worker OpenAI-compatible HTTP route is live-verified in local dev with external bridge config for models, chat completions, chat streaming, Responses create/retrieve, and chat tool calls.
- `opencode-cursor` is not needed for PM Cursor support because PM can implement native Cursor support directly; OpenCode does not support Cursor natively without that plugin, and the plugin remains non-primary.
- GUI setup should tell users that a Cursor API key can be obtained at `https://cursor.com/dashboard/` in the API keys section.
