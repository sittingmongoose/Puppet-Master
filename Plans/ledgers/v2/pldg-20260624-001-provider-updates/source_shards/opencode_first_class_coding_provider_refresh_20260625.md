# OpenCode First-Class Coding-Plan Provider Refresh

- ledger_id: `pldg-20260624-001-provider-updates`
- created_at_utc: `2026-06-25T20:05:35Z`
- source_ref: `chat:opencode-first-class-provider-refresh`
- scope: Ledger-only planning evidence. Do not edit canonical Plans from this shard.

## User prompt

Jared asked:

> Did you pull in the newest opencode repo to look at those first class providers and see how Opencode handles them specifically, because we are going to need to implement them.

## OpenCode repo refresh

Local clone:

- path: `/tmp/pm-opencode-current`
- remote: `https://github.com/sst/opencode`
- branch: `dev`
- current upstream after `git fetch --prune origin`: `b60c0a5e8ccc71ef7cce327602401418d419472e`
- commit date: `2026-06-25T19:09:22Z`
- commit subject: `fix(app): use tab-scoped servers in sessions (#33946)`
- package version observed: `1.17.11`

Disposition:

- The clone was current with `origin/dev` at the time of inspection.
- No canonical Plans were edited.

## How OpenCode handles first-class coding-plan providers

OpenCode first-class provider visibility for coding plans is mostly Models.dev-driven, not one bespoke provider implementation file per coding-plan product.

Relevant source files:

- `/tmp/pm-opencode-current/packages/core/src/plugin/models-dev.ts`
- `/tmp/pm-opencode-current/packages/core/src/catalog.ts`
- `/tmp/pm-opencode-current/packages/core/src/plugin/provider/openai-compatible.ts`
- `/tmp/pm-opencode-current/packages/core/src/plugin/provider/alibaba.ts`
- `/tmp/pm-opencode-current/packages/core/src/plugin/variant.ts`
- `/tmp/pm-opencode-current/packages/opencode/src/provider/transform.ts`
- `/tmp/pm-opencode-current/packages/ui/src/components/provider-icons/types.ts`

Observed OpenCode mechanics:

- `ModelsDevPlugin` ingests every Models.dev provider with non-empty `env` values as an integration with key/env auth methods.
- `ModelsDevPlugin` creates one provider record per Models.dev provider ID, including coding-plan provider IDs.
- Provider API fields are populated from `item.npm` and `item.api`.
- Model records include name, family, API package/URL overrides, modalities, output modalities, tool-call support, variants, release time, cost, status, enabled flag, and limits.
- OpenCode project/catalog projection merges provider-level and model-level request headers/body.
- `OpenAICompatiblePlugin` handles any package containing `@ai-sdk/openai-compatible` by calling `createOpenAICompatible(evt.options)` and setting `includeUsage` unless explicitly disabled.
- `AlibabaPlugin` only handles exact package `@ai-sdk/alibaba`; the live coding-plan providers inspected currently use `@ai-sdk/openai-compatible`, so Alibaba/Qwen Coding Plan is not routed through that plugin.
- OpenCode has provider icons for coding-plan IDs such as `zhipuai-coding-plan`, `zai-coding-plan`, `minimax-coding-plan`, `minimax-cn-coding-plan`, `kuae-cloud-coding-plan`, and `kimi-for-coding`.

Implementation disposition:

- PM should implement coding-plan products as first-class provider records with Provider -> models hierarchy, matching the provider IDs and per-provider auth/env/baseURL/media metadata.
- PM should not expect OpenCode to have a dedicated `alibaba-coding-plan.ts`, `kimi-for-coding.ts`, or `zai-coding-plan.ts` adapter file that can be copied wholesale.
- PM should copy the architecture pattern: catalog ingestion plus provider/model transform rules plus per-provider tests.

## OpenCode transform behavior relevant to coding plans

Relevant source file:

- `/tmp/pm-opencode-current/packages/opencode/src/provider/transform.ts`

Observed option/variant behavior:

- `temperature()` defaults:
  - IDs containing `qwen`: `0.55`
  - IDs containing `gemini`: `1.0`
  - IDs containing `glm-4.6` or `glm-4.7`: `1.0`
  - IDs containing `minimax-m2`: `1.0`
  - IDs containing `kimi-k2` with `thinking`, `k2.`, `k2p`, or `k2-5`: `1.0`
  - other `kimi-k2`: `0.6`
- `topP()` defaults:
  - IDs containing `qwen`: `1`
  - IDs containing `minimax-m2`, `gemini`, `kimi-k2.5`, `kimi-k2p5`, or `kimi-k2-5`: `0.95`
- `topK()` defaults:
  - `minimax-m2` with `m2.`, `m25`, or `m21`: `40`
  - other `minimax-m2`: `20`
  - `gemini`: `64`
- Unsupported user file/image parts are converted into user-visible error text when the selected model lacks the corresponding modality.
- `ProviderTransform.options()` sets `thinking: { type: "enabled", clear_thinking: false }` when `providerID` includes `zai` or `zhipuai` and the SDK package is `@ai-sdk/openai-compatible`.
- `ProviderTransform.options()` sets `thinking: { type: "adaptive" }` by default for `minimax-m3` through `@ai-sdk/anthropic`.
- `ProviderTransform.options()` enables thinking for Kimi `k2p` / `kimi-k2.` / `kimi-k2p` models routed through `@ai-sdk/anthropic` or `@ai-sdk/google-vertex/anthropic`, using `budgetTokens: Math.min(16_000, Math.floor(output_limit / 2 - 1))`.
- `ProviderTransform.options()` sets `enable_thinking: true` only for provider ID `alibaba-cn` with OpenAI-compatible reasoning models, excluding `kimi-k2-thinking`.
- `ProviderTransform.variants()` returns no variants for generic IDs containing `qwen`, `kimi`, `k2p`, `minimax`, non-GLM-5.2 `glm`, DeepSeek, and `big-pickle`.
- `ProviderTransform.variants()` gives `MiniMax-M3` two variants for both Anthropic and OpenAI-compatible routes:
  - `none`: `thinking: { type: "disabled" }`
  - `thinking`: `thinking: { type: "adaptive" }`
- `ProviderTransform.variants()` gives GLM-5.2 variants:
  - OpenAI-compatible: `high` / `max` via `reasoningEffort`
  - Anthropic-compatible: `high` / `max` via `effort`
  - OpenRouter: `high` / `xhigh` via `reasoning.effort`
- Core v2 `VariantPlugin.generate()` also adds `reasoning_effort` body variants `high` and `max` for OpenAI-compatible GLM-5.2 model IDs.

Implementation caution:

- Qwen Code docs/source previously recorded that Alibaba/Qwen Coding Plan needs `extra_body: { enable_thinking: true }` for thinking-capable models.
- Stock OpenCode's `enable_thinking` default is currently coded for `alibaba-cn`, not `alibaba-coding-plan` or `alibaba-coding-plan-cn`.
- Therefore PM must not rely on stock OpenCode behavior as a complete Qwen/Alibaba Coding Plan implementation. PM needs its own coding-plan-specific transform tests and live probes.

## Live Models.dev coding-plan payload refresh

Live query:

- source: `https://models.dev/api.json`
- fetched_at_utc: `2026-06-25T20:04:49Z`

Relevant provider IDs and current package/API/env shape:

- `alibaba-coding-plan`
  - env: `ALIBABA_CODING_PLAN_API_KEY`
  - npm: `@ai-sdk/openai-compatible`
  - api: `https://coding-intl.dashscope.aliyuncs.com/v1`
  - model_count: `12`
- `alibaba-coding-plan-cn`
  - env: `ALIBABA_CODING_PLAN_API_KEY`
  - npm: `@ai-sdk/openai-compatible`
  - api: `https://coding.dashscope.aliyuncs.com/v1`
  - model_count: `12`
- `kimi-for-coding`
  - env: `KIMI_API_KEY`
  - npm: `@ai-sdk/anthropic`
  - api: `https://api.kimi.com/coding/v1`
  - model_count: `4`
- `zai-coding-plan`
  - env: `ZHIPU_API_KEY`
  - npm: `@ai-sdk/openai-compatible`
  - api: `https://api.z.ai/api/coding/paas/v4`
  - model_count: `6`
- `zhipuai-coding-plan`
  - env: `ZHIPU_API_KEY`
  - npm: `@ai-sdk/openai-compatible`
  - api: `https://open.bigmodel.cn/api/coding/paas/v4`
  - model_count: `7`
- `tencent-coding-plan`
  - env: `TENCENT_CODING_PLAN_API_KEY`
  - npm: `@ai-sdk/openai-compatible`
  - api: `https://api.lkeap.cloud.tencent.com/coding/v3`
  - model_count: `8`
- `minimax-coding-plan`
  - env: `MINIMAX_API_KEY`
  - npm: `@ai-sdk/anthropic`
  - api: `https://api.minimax.io/anthropic/v1`
  - model_count: `7`
- `minimax-cn-coding-plan`
  - env: `MINIMAX_API_KEY`
  - npm: `@ai-sdk/anthropic`
  - api: `https://api.minimaxi.com/anthropic/v1`
  - model_count: `7`
- `kuae-cloud-coding-plan`
  - env: `KUAE_API_KEY`
  - npm: `@ai-sdk/openai-compatible`
  - api: `https://coding-plan-endpoint.kuaecloud.net/v1`
  - model_count: `1`
- `umans-ai-coding-plan`
  - env: `UMANS_AI_CODING_PLAN_API_KEY`
  - npm: `@ai-sdk/openai-compatible`
  - api: `https://api.code.umans.ai/v1`
  - model_count: `6`

Media examples from the live catalog:

- Alibaba/Qwen Coding Plan includes text-only `qwen3-coder-plus` and `qwen3-coder-next`, while `qwen3.5-plus`, `qwen3.6-flash`, `qwen3.7-plus`, and `kimi-k2.5` expose image or image/video inputs depending on region/current catalog entry.
- `kimi-for-coding` models `k2p5`, `k2p6`, and `k2p7` expose text/image/video input.
- `glm-5v-turbo` exposes text/image/video/pdf input under Z.AI/Zhipu coding-plan routes.
- `MiniMax-M3` exposes text/image/video input under MiniMax coding-plan routes.

## Planning disposition

- Yes, the current OpenCode repo has been pulled/refreshed and inspected specifically for these first-class providers.
- OpenCode treats coding-plan provider IDs as first-class catalog/provider entries, but mostly through Models.dev ingestion and generic AI SDK packages.
- PM should implement first-class provider records and per-provider/model transform rules directly, with OpenCode as a useful implementation reference but not a complete correctness oracle.
