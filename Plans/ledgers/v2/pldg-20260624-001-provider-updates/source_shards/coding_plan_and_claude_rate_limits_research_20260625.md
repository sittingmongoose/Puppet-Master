# Coding-Plan Providers and Claude Code Rate-Limit Research

- ledger_id: `pldg-20260624-001-provider-updates`
- created_at_utc: `2026-06-25T19:34:18Z`
- source_ref: `chat:coding-plan-and-claude-rate-limit-research`
- scope: Ledger-only planning evidence. Do not edit canonical Plans from this shard.

## User prompt

Jared asked:

> A few things. Can you look into this and see if it is an issue we need to address? https://www.reddit.com/r/ClaudeCode/comments/1s8tafv/claude_code_v2180_quietly_added_rate_limits_to/
>
> -Update coding plans with full support, including qwen coding, etc. [https://www.reddit.com/r/kimi/s/sSrMYHU1bn](https://www.reddit.com/r/kimi/s/sSrMYHU1bn) see if opencode uses default settings for openAI provider for the coding plans.

## Claude Code status-line rate limits

Sources inspected:

- Reddit thread: `https://www.reddit.com/r/ClaudeCode/comments/1s8tafv/claude_code_v2180_quietly_added_rate_limits_to/`
- Official Claude Code status line docs: `https://code.claude.com/docs/en/statusline`
- Local installed Claude Code: `claude --version` returned `2.1.191 (Claude Code)`.
- Current npm package: `npm view @anthropic-ai/claude-code version` returned `2.1.191`.

Relevant current facts:

- Claude Code status-line scripts receive JSON session data on `stdin`.
- The official docs list `rate_limits.five_hour.used_percentage`, `rate_limits.five_hour.resets_at`, `rate_limits.seven_day.used_percentage`, and `rate_limits.seven_day.resets_at`.
- The official docs say `rate_limits` is for Claude.ai subscription limits, is present for Pro/Max users after the first API response, and scripts should handle absent fields gracefully.
- Status-line scripts run after assistant messages and other event-driven status updates. `refreshInterval` can add idle/time-based refreshes, but PM should not assume a fixed polling timer by default.
- The official docs also expose `effort.level` and `thinking.enabled` in status-line input.
- Reddit source-lineage says prior custom status-line tools often queried `api.anthropic.com/api/oauth/usage`; PM should not require that endpoint if the local `rate_limits` status-line field is available.

Local probe caveat:

- A print-mode status-line capture attempt with `claude -p --settings ...` did not trigger the `statusLine` hook, so print-mode prompt probes should not be treated as status-line evidence.
- An interactive PTY status-line capture attempt reached the Claude TUI first-run/main prompt rather than producing durable capture evidence. The process was stopped.
- Therefore the planning requirement is sourced to official Claude Code docs and Reddit source-lineage, not to a local status-line capture.

Planning disposition:

- Yes, PM should address this if any Claude Code usage/status UI or status-line bridge is compiled.
- Prefer `rate_limits` from local Claude Code status-line `stdin` JSON when available.
- Do not require polling or scraping `api.anthropic.com/api/oauth/usage`.
- Preserve graceful absence handling for non-Pro/Max, older Claude Code versions, and sessions before the first API response.

## OpenCode and coding-plan provider behavior

Sources inspected:

- OpenCode docs: `https://opencode.ai/docs/providers/`
- OpenCode local clone: `/tmp/pm-opencode-current`
- OpenCode commit: `b60c0a5e8ccc71ef7cce327602401418d419472e`
- Live Models.dev catalog: `https://models.dev/api.json`

OpenCode source-lineage findings:

- OpenCode uses Models.dev plus AI SDK provider plugins to build provider/model catalogs.
- For `@ai-sdk/openai-compatible` providers, OpenCode calls `createOpenAICompatible(evt.options)`.
- OpenCode merges Models.dev/provider/model request headers and body fragments, including provider-level `request.headers`, provider-level `request.body`, and model-level overrides.
- `experimental.modes` from Models.dev can produce variants/body fragments.
- OpenCode does not invent provider-specific auth, client-identity, body, or model-discovery behavior that is absent from Models.dev/config/plugin code.

Answer to Jared's OpenCode question:

- For coding-plan providers declared by Models.dev as `@ai-sdk/openai-compatible`, OpenCode largely uses the generic OpenAI-compatible AI SDK path with provider-specific base URLs, model metadata, and any explicit request body/header fragments from Models.dev/config.
- That is not the same as first-party OpenAI provider defaults.
- It is also not enough to prove full support for coding-plan products whose special behavior is outside the generic path.
- Live Models.dev currently declares `kimi-for-coding` with `@ai-sdk/anthropic`, while the inspected Kimi parity plugin uses a separate OpenAI-compatible route to add Kimi-specific behavior.

Live Models.dev coding-plan/source-lineage providers observed:

- `alibaba-coding-plan`
- `alibaba-coding-plan-cn`
- `kimi-for-coding`
- `kuae-cloud-coding-plan`
- `minimax-coding-plan`
- `minimax-cn-coding-plan`
- `tencent-coding-plan`
- `umans-ai-coding-plan`
- `zai-coding-plan`
- `zhipuai-coding-plan`

Sample live catalog details:

- `alibaba-coding-plan`
  - env: `ALIBABA_CODING_PLAN_API_KEY`
  - api: `https://coding-intl.dashscope.aliyuncs.com/v1`
  - npm: `@ai-sdk/openai-compatible`
  - sample models: `MiniMax-M2.5`, `glm-4.7`, `glm-5`, `kimi-k2.5`, `qwen3-coder-next`, `qwen3-coder-plus`, `qwen3-max-2026-01-23`, `qwen3.5-plus`, `qwen3.6-flash`, `qwen3.6-plus`, `qwen3.7-max`, `qwen3.7-plus`
- `alibaba-coding-plan-cn`
  - env: `ALIBABA_CODING_PLAN_API_KEY`
  - api: `https://coding.dashscope.aliyuncs.com/v1`
  - npm: `@ai-sdk/openai-compatible`
- `kimi-for-coding`
  - env: `KIMI_API_KEY`
  - api: `https://api.kimi.com/coding/v1`
  - npm: `@ai-sdk/anthropic`
  - models observed: `k2p5`, `k2p6`, `k2p7`, `kimi-k2-thinking`
- `zai-coding-plan`
  - env: `ZHIPU_API_KEY`
  - api: `https://api.z.ai/api/coding/paas/v4`
  - npm: `@ai-sdk/openai-compatible`
- `zhipuai-coding-plan`
  - env: `ZHIPU_API_KEY`
  - api: `https://open.bigmodel.cn/api/coding/paas/v4`
  - npm: `@ai-sdk/openai-compatible`
- `tencent-coding-plan`
  - env: `TENCENT_CODING_PLAN_API_KEY`
  - api: `https://api.lkeap.cloud.tencent.com/coding/v3`
  - npm: `@ai-sdk/openai-compatible`
- `minimax-coding-plan`
  - env: `MINIMAX_API_KEY`
  - api: `https://api.minimax.io/anthropic/v1`
  - npm: `@ai-sdk/anthropic`
- `minimax-cn-coding-plan`
  - env: `MINIMAX_API_KEY`
  - api: `https://api.minimaxi.com/anthropic/v1`
  - npm: `@ai-sdk/anthropic`
- `kuae-cloud-coding-plan`
  - env: `KUAE_API_KEY`
  - api: `https://ai.kuae.com/v1`
  - npm: `@ai-sdk/openai-compatible`
- `umans-ai-coding-plan`
  - env: `UMANS_AI_CODING_PLAN_API_KEY`
  - npm: `@ai-sdk/openai-compatible`

Observed media examples from live catalog:

- `qwen3.6-flash`, `qwen3.6-plus`, `qwen3.5-plus`, `kimi-k2.5`, and some other coding-plan routes expose image/video input metadata.
- `qwen3-coder-plus` and `qwen3-coder-next` are text-only in the observed live catalog.
- `glm-5v-turbo` exposes image/video/pdf input metadata under Z.AI/Zhipu coding-plan routes.
- `MiniMax-M3` exposes image/video input metadata under MiniMax coding-plan routes.

Planning disposition:

- PM should model each coding-plan product as a first-class Provider -> models route.
- Same model IDs may appear under multiple providers and must not collapse into one shared capability record.
- Media controls must be route/model gated and backed by live E2E proof before PM calls them supported.
- OpenCode/Models.dev is useful catalog/source-lineage but not sufficient support proof by itself.

## Qwen Code / Alibaba Coding Plan

Sources inspected:

- Qwen Code docs: `https://qwenlm.github.io/qwen-code-docs/en/users/configuration/model-providers/`
- Qwen Code local clone: `/tmp/pm-qwen-code-current`
- Qwen Code commit: `0ac99f0aced153054e3a245184b6fc3d610022c2`

Current facts:

- Qwen Code model providers support OpenAI-compatible, Anthropic, Gemini, Qwen OAuth, and Vertex-style auth types.
- Qwen OAuth free tier is documented as discontinued on `2026-04-15`.
- Alibaba ModelStudio `Coding Plan` is selectable through `/auth`.
- Coding Plan endpoints:
  - China: `https://coding.dashscope.aliyuncs.com/v1`
  - Global/International: `https://coding-intl.dashscope.aliyuncs.com/v1`
- Qwen Code stores the coding-plan key in reserved env var `BAILIAN_CODING_PLAN_API_KEY`.
- Live Models.dev/OpenCode uses `ALIBABA_CODING_PLAN_API_KEY` for the Alibaba coding-plan provider.
- Qwen Code source template includes models such as `qwen3.5-plus`, `qwen3.6-plus`, `qwen3.7-plus`, `qwen3-coder-plus`, `qwen3-coder-next`, `qwen3-max-2026-01-23`, `glm-5`, `glm-4.7`, `kimi-k2.5`, and `MiniMax-M2.5`.
- Qwen Code generation config for thinking-capable coding-plan models includes `extra_body: { enable_thinking: true }`.
- Qwen Code docs warn that provider-level `generationConfig` is an impermeable atomic provider layer and that OpenAI-compatible reasoning/thinking injection interacts with `samplingParams`/`extra_body`.

Planning disposition:

- PM should support Alibaba/Qwen Coding Plan as a first-class provider setup with region selection and provider-owned/versioned model template behavior.
- PM must deliberately support, alias, or adjudicate `BAILIAN_CODING_PLAN_API_KEY` versus `ALIBABA_CODING_PLAN_API_KEY`; do not silently confuse them.
- PM should preserve model-specific media and thinking fields rather than treating the provider as one flat OpenAI-compatible model list.

## Kimi For Coding and `opencode-kimi-full`

Sources inspected:

- Reddit thread: `https://www.reddit.com/r/kimi/comments/1ssjkl2/full_kimispecific_extensions_support_in_opencode/`
- Repo: `https://github.com/lemon07r/opencode-kimi-full`
- Local clone: `/tmp/pm-opencode-kimi-full`
- Local commit: `86a3d32208b40ae537d6213e518549647e8540a2`

Plugin source-lineage findings:

- Provider ID: `kimi-for-coding-oauth`
- Model ID: `kimi-for-coding`
- API base: `https://api.kimi.com/coding/v1`
- Uses official Kimi device-flow OAuth through `https://auth.kimi.com`.
- Reuses `~/.kimi/device_id`.
- Adds `User-Agent: KimiCLI/1.41.0` and `X-Msh-*` fingerprint headers.
- Adds `prompt_cache_key`, using the OpenCode session ID.
- Adds `thinking` and `reasoning_effort` body fields.
- Effort variants:
  - `off` sends `thinking: {"type":"disabled"}`
  - `auto` omits both `thinking` and `reasoning_effort`
  - `low`, `medium`, and `high` send `thinking: {"type":"enabled"}` plus `reasoning_effort`
  - `xhigh` and `max` are clamped to `high`
- Discovers wire model slug, display name, context length, and media from `/coding/v1/models`.
- Static config must include `attachment: true`, `modalities.input ["text","image"]`, and `modalities.output ["text"]`; otherwise OpenCode strips image parts before Kimi.

Risk/caution:

- A Reddit commenter reported suspension after using the plugin and quoted a guideline containing `Do not forge or tamper with client identity information`.
- PM should not silently forge or tamper with Kimi client identity headers.
- If PM compiles Kimi For Coding support, it needs an official/allowed client identity posture or explicit user-owned Kimi CLI interop, plus local E2E verification with an active Kimi For Coding auth path.

Planning disposition:

- Kimi For Coding full support is not just generic OpenAI-compatible behavior.
- Required support shape includes auth, client identity, `prompt_cache_key`, thinking/reasoning mapping, `/coding/v1/models` discovery, and media metadata that prevents image/video inputs from being stripped.

## Local E2E verification blocker

Local credential check:

- `BAILIAN_CODING_PLAN_API_KEY`: absent
- `ALIBABA_CODING_PLAN_API_KEY`: absent
- `KIMI_API_KEY`: absent
- `MINIMAX_API_KEY`: absent
- `ZHIPU_API_KEY`: absent
- `TENCENT_CODING_PLAN_API_KEY`: absent
- `KUAE_API_KEY`: absent
- `UMANS_AI_CODING_PLAN_API_KEY`: absent

Planning disposition:

- Docs/repo/catalog inspection can define planned support.
- It cannot satisfy Jared's no-uncertainty support threshold for these coding-plan routes.
- To close support claims, PM needs local E2E prompt proof per claimed provider route, media probes for advertised image/video/pdf routes, and thinking-effort probes for provider/model-specific reasoning controls.
