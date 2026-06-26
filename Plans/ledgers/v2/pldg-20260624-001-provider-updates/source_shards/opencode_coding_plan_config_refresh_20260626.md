# OpenCode Coding Plan Config Refresh - 2026-06-26

Ledger: `pldg-20260624-001-provider-updates`

Scope: current OpenCode/Models.dev source-lineage for coding-plan provider config after Jared asked: "Look at opencodes config for the other coding plans as well."

Current OpenCode source:
- Repo: `https://github.com/sst/opencode`
- Ref inspected: `origin/dev`
- Commit: `753d312c28519b0c060a56e69e8cde971b3719bb`
- Local clone: `/tmp/pm-opencode-zai-current`

Current Models.dev source:
- URL: `https://models.dev/api.json`
- Fetched with `curl -L -sS -A 'Mozilla/5.0'`

## Coding-plan Providers In Models.dev

`models.dev/api.json` currently exposes these provider IDs containing `coding-plan`:

- `alibaba-coding-plan`
- `alibaba-coding-plan-cn`
- `kuae-cloud-coding-plan`
- `minimax-cn-coding-plan`
- `minimax-coding-plan`
- `tencent-coding-plan`
- `umans-ai-coding-plan`
- `zai-coding-plan`
- `zhipuai-coding-plan`

Provider routes:

| Provider ID | Name | Package | API | Env |
| --- | --- | --- | --- | --- |
| `alibaba-coding-plan` | Alibaba Coding Plan | `@ai-sdk/openai-compatible` | `https://coding-intl.dashscope.aliyuncs.com/v1` | `ALIBABA_CODING_PLAN_API_KEY` |
| `alibaba-coding-plan-cn` | Alibaba Coding Plan (China) | `@ai-sdk/openai-compatible` | `https://coding.dashscope.aliyuncs.com/v1` | `ALIBABA_CODING_PLAN_API_KEY` |
| `kuae-cloud-coding-plan` | KUAE Cloud Coding Plan | `@ai-sdk/openai-compatible` | `https://coding-plan-endpoint.kuaecloud.net/v1` | `KUAE_API_KEY` |
| `minimax-cn-coding-plan` | MiniMax Token Plan (minimaxi.com) | `@ai-sdk/anthropic` | `https://api.minimaxi.com/anthropic/v1` | `MINIMAX_API_KEY` |
| `minimax-coding-plan` | MiniMax Token Plan (minimax.io) | `@ai-sdk/anthropic` | `https://api.minimax.io/anthropic/v1` | `MINIMAX_API_KEY` |
| `tencent-coding-plan` | Tencent Coding Plan (China) | `@ai-sdk/openai-compatible` | `https://api.lkeap.cloud.tencent.com/coding/v3` | `TENCENT_CODING_PLAN_API_KEY` |
| `umans-ai-coding-plan` | Umans AI Coding Plan | `@ai-sdk/openai-compatible` | `https://api.code.umans.ai/v1` | `UMANS_AI_CODING_PLAN_API_KEY` |
| `zai-coding-plan` | Z.AI Coding Plan | `@ai-sdk/openai-compatible` | `https://api.z.ai/api/coding/paas/v4` | `ZHIPU_API_KEY` |
| `zhipuai-coding-plan` | Zhipu AI Coding Plan | `@ai-sdk/openai-compatible` | `https://open.bigmodel.cn/api/coding/paas/v4` | `ZHIPU_API_KEY` |

## OpenCode Runtime Transform Rules Relevant To Coding Plans

Source refs:
- `packages/opencode/src/provider/transform.ts`
- `packages/core/src/plugin/variant.ts`
- `packages/opencode/test/provider/transform.test.ts`
- `packages/core/test/plugin/variant.test.ts`
- `packages/web/src/content/docs/go.mdx`

Observed OpenCode transform behavior:

- `temperature(model)`:
  - `qwen*` => `0.55`
  - `glm-4.6` / `glm-4.7` => `1.0`
  - `minimax-m2*` => `1.0`
  - `kimi-k2*` => `1.0` for `thinking`, `k2.`, `k2p`, `k2-5`; otherwise `0.6`
- `topP(model)`:
  - `qwen*` => `1`
  - `minimax-m2*`, `gemini`, `kimi-k2.5`, `kimi-k2p5`, `kimi-k2-5` => `0.95`
- `topK(model)`:
  - `minimax-m2*` => `40` for `m2.`, `m25`, or `m21`; otherwise `20`
  - `gemini` => `64`
- `variants(model)`:
  - `MiniMax-M3` on `@ai-sdk/anthropic` or `@ai-sdk/openai-compatible` exposes:
    - `none` => `{ thinking: { type: "disabled" } }`
    - `thinking` => `{ thinking: { type: "adaptive" } }`
  - GLM-5.2 on `@ai-sdk/openai-compatible` exposes:
    - `high` => `{ reasoningEffort: "high" }`
    - `max` => `{ reasoningEffort: "max" }`
  - GLM-5.2 on `@ai-sdk/anthropic` exposes:
    - `high` => `{ effort: "high" }`
    - `max` => `{ effort: "max" }`
  - For IDs containing `deepseek-chat`, `deepseek-reasoner`, `deepseek-r1`, `deepseek-v3`, `minimax`, non-5.2 `glm`, `kimi`, `k2p`, `qwen`, or `big-pickle`, OpenCode returns no generated effort variants.
  - Generic `@ai-sdk/openai-compatible` models that do not match those exclusions get `low|medium|high` as `reasoningEffort`.
- `VariantPlugin.generate(model)` adds GLM-5.2 `high|max` variants with raw body `{ reasoning_effort: id }` for v2 catalog models using `@ai-sdk/openai-compatible`.
- `options(input)`:
  - Non-Claude `@ai-sdk/anthropic` routes set `toolStreaming = false`.
  - Provider IDs containing `zai` or `zhipuai` with `@ai-sdk/openai-compatible` set:
    - `thinking: { type: "enabled", clear_thinking: false }`
  - `MiniMax-M3` with `@ai-sdk/anthropic` sets:
    - `thinking: { type: "adaptive" }`
  - Anthropic SDK Kimi-style IDs containing `k2p`, `kimi-k2.`, or `kimi-k2p` set:
    - `thinking: { type: "enabled", budgetTokens: min(16000, floor(output/2 - 1)) }`
  - `alibaba-cn` with `@ai-sdk/openai-compatible` and reasoning support sets `enable_thinking = true`, except `kimi-k2-thinking`.
  - Important PM caveat: this hard-coded `enable_thinking` condition is for provider ID `alibaba-cn`, not `alibaba-coding-plan` or `alibaba-coding-plan-cn`.
- `normalizeMessages`:
  - For `capabilities.interleaved.field`, OpenCode removes normal reasoning parts from assistant content and reattaches them under `providerOptions.openaiCompatible[field]`.
  - This matters for providers using fields such as `reasoning_content` and for preserved-thinking semantics.

## Provider/Model Highlights

Alibaba Coding Plan:
- `alibaba-coding-plan` and `alibaba-coding-plan-cn` both use `@ai-sdk/openai-compatible`.
- Models include Qwen, GLM, Kimi, and MiniMax rows.
- Qwen rows inherit OpenCode defaults `temperature: 0.55`, `topP: 1`, and no generic effort variants.
- `glm-4.7` inherits `temperature: 1.0` and no generic effort variants.
- `kimi-k2.5` inherits `temperature: 1.0`, `topP: 0.95`, and no generic effort variants.
- `MiniMax-M2.5` inherits `temperature: 1.0`, `topP: 0.95`, `topK: 40`, and no generic effort variants.
- PM should not blindly copy the `alibaba-cn` `enable_thinking` assumption for coding-plan provider IDs; it needs direct test coverage or explicit provider mapping.

KUAE Cloud Coding Plan:
- One catalog row, `GLM-4.7`, through `@ai-sdk/openai-compatible`.
- OpenCode defaults imply `temperature: 1.0`, no generic effort variants.

MiniMax Coding Plan:
- `minimax-coding-plan` and `minimax-cn-coding-plan` use `@ai-sdk/anthropic`.
- All non-Claude Anthropic SDK rows set `toolStreaming = false`.
- `MiniMax-M3` sets default `thinking: { type: "adaptive" }` and exposes `none`/`thinking` variants.
- MiniMax M2 family rows use `temperature: 1.0`, `topP: 0.95`, `topK: 40` for dotted M2.x/M2.1/M2.5/M2.7 forms; base `MiniMax-M2` maps to `topK: 20`.

Tencent Coding Plan:
- Uses `@ai-sdk/openai-compatible`.
- Includes `minimax-m2.5`, `kimi-k2.5`, Hunyuan rows, `tc-code-latest`, and `glm-5`.
- MiniMax/Kimi/GLM/Qwen-style exclusions prevent generic effort variants for those IDs.
- Hunyuan reasoning rows that do not match an exclusion fall through to generic `low|medium|high` `reasoningEffort`.

Umans AI Coding Plan:
- Uses `@ai-sdk/openai-compatible`.
- Includes `umans-kimi-k2.7`, `umans-glm-5.1`, `umans-coder`, `umans-flash`, `umans-glm-5.2`, and `umans-qwen3.6-35b-a3b`.
- `umans-glm-5.2` gets GLM-5.2 `high|max` effort variants.
- `umans-coder` and `umans-flash` fall through to generic `low|medium|high` `reasoningEffort`.
- `umans-qwen3.6-35b-a3b` is Qwen-style: `temperature: 0.55`, `topP: 1`, no generic effort variants.

Z.AI / ZhipuAI Coding Plan:
- `zai-coding-plan` and `zhipuai-coding-plan` use `@ai-sdk/openai-compatible`.
- Both set preserved thinking by default in OpenCode:
  - `thinking: { type: "enabled", clear_thinking: false }`
- GLM-5.2 gets `high|max` effort variants.
- Other GLM rows do not get generic effort variants.
- `glm-5v-turbo` includes media input modalities (`text,image,video,pdf`) but must remain plan-gated if the account returns plan-not-included.

## OpenCode Go Reference

OpenCode Go is separate from the direct third-party coding-plan provider IDs above. It is OpenCode's own subscription aggregator.

OpenCode Go model list currently includes:
- GLM-5.2
- GLM-5.1
- Kimi K2.7 Code
- Kimi K2.6
- MiMo-V2.5
- MiMo-V2.5-Pro
- MiniMax M3
- MiniMax M2.7
- Qwen3.7 Max
- Qwen3.7 Plus
- Qwen3.6 Plus
- DeepSeek V4 Pro
- DeepSeek V4 Flash

OpenCode Go endpoints use mixed protocols:
- OpenAI-compatible `/chat/completions` for GLM, Kimi, DeepSeek, and MiMo rows.
- Anthropic `/messages` for MiniMax and Qwen rows.

PM should treat OpenCode Go as source-lineage or a separate optional provider if explicitly added, not as proof for PM-baked direct third-party coding-plan providers.

## Planning Disposition

Accepted for ledger planning:
- Use OpenCode current runtime transform rules as source-lineage for coding-plan defaults.
- PM must own provider/model transform mappings and tests instead of importing OpenCode assumptions wholesale.
- Provider setup must remain Provider -> models, with region/profile-separated coding-plan provider IDs.
- Do not require Jared to buy additional coding-plan subscriptions to close this planning lane. Rows without proof should be capability-gated, disabled, or explicitly unverified rather than blocking the provider compile forever.

