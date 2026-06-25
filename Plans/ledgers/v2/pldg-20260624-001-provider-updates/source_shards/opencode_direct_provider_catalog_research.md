# OpenCode Direct Provider Catalog Research

Ledger: `pldg-20260624-001-provider-updates`
Created: `2026-06-25T13:49:46Z`

## User instruction

Jared clarified:

- `There should be no uncertainty.`
- `We should be testing it locally to make sure it works as expected.`
- `The direct providers we can look at the opencode repo.`
- `You can pull it and inspect it.`
- `The cli providers will need to be tested by you.`

This shard records local source inspection of the active OpenCode repository for direct-provider/provider-model catalog behavior. It is ledger/source-lineage only and is not canonical Plans prose.

## Repository inspected

- Repository: `https://github.com/anomalyco/opencode`
- Local checkout: `/tmp/pm-opencode`
- Commit: `bcff162c60772aeccc8c6bbcf229da406a07eae5`
- Commit subject: `chore: update nix node_modules hashes`
- Package version observed: `opencode` / `@opencode-ai/cli` `1.17.11`
- Root package manager: `bun@1.3.14`
- Local limitation: `bun` is not installed on this machine, so OpenCode's own Bun test suite was not run in this pass. Source inspection was completed.

## Direct-provider/catalog findings

- OpenCode uses `models.dev` as a provider/model catalog source by default.
- `packages/core/src/models-dev.ts` fetches `${source}/api.json`, with default `source = https://models.dev`, cached under OpenCode's cache path with a 5 minute freshness window and 60 minute background refresh.
- The models.dev schema is provider-owned:
  - provider has `id`, `name`, `env`, optional `api`, optional `npm`, and `models`.
  - each model has `id`, `name`, `family`, `release_date`, `attachment`, `reasoning`, `temperature`, `tool_call`, optional `interleaved`, `cost`, `limit`, optional `modalities.input`, optional `modalities.output`, optional provider override `{ npm, api }`, optional status, and optional experimental modes.
- `packages/opencode/src/provider/provider.ts` converts each provider with `fromModelsDevProvider(provider)` and every model with `fromModelsDevModel(provider, model)`.
- Converted model records preserve `providerID`, `api.id`, `api.url`, `api.npm`, status, cost, limit, capabilities, release date, and generated variants.
- Capabilities include media/modalities:
  - input: `text`, `audio`, `image`, `video`, `pdf`
  - output: `text`, `audio`, `image`, `video`, `pdf`
- Configured providers/models are merged over catalog entries rather than replacing the catalog wholesale.
- Config models may inherit provider-level API package/URL from models.dev or configured provider data.
- Model variants are generated from provider/model capability facts, then config variants can disable or override individual variants.
- Deprecated and alpha models are filtered unless enabled by runtime/config gates.
- Provider allow/deny and availability are applied after provider/model materialization.

## Thinking/reasoning effort findings

- `packages/opencode/src/provider/transform.ts` computes provider/model-specific variants, not a single generic effort flag.
- The same user-facing effort label can map to different wire shapes:
  - OpenAI/Azure/Copilot-style: `reasoningEffort`, `reasoningSummary`, `include: ["reasoning.encrypted_content"]`.
  - Google/Gemini-style: `thinkingConfig.includeThoughts` plus `thinkingBudget` or `thinkingLevel`.
  - Anthropic-style: `thinking`/`effort` or budget-token variants.
  - Bedrock-style: `reasoningConfig`.
  - SAP-style: wrapped under `modelParams`.
  - OpenAI-compatible providers often use `reasoningEffort`, but special cases exist.
- OpenCode tests cover provider-specific reasoning/variant behavior across OpenAI, Azure, GitHub Copilot, Anthropic, Bedrock, Google/Gemini, OpenRouter, Cloudflare AI Gateway, SAP AI Core, MiniMax, Z.AI/GLM, Groq, xAI, and others.

## PM planning implications

- PM should treat OpenCode as source evidence for the direct-provider catalog shape, not as a black-box authority to blindly copy.
- Direct providers should be represented as `Provider -> models`, with model IDs subordinate to provider IDs.
- Same-named or same-upstream models can appear under multiple providers/routes and still need separate auth, billing, quota, endpoint, media capability, and thinking-effort wire mappings.
- PM should preserve requested effort, supported variants, and effective provider-specific wire mapping as separate facts.
- PM should avoid a boolean-only thinking-effort or media-support model.
- Direct-provider currentness should be backed by pinned OpenCode source/commit inspection plus focused local adapter tests or fixtures before compile.
