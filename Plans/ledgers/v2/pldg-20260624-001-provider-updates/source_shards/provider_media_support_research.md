# Provider Media Support Research

Ledger: `pldg-20260624-001-provider-updates`
Created: `2026-06-24T15:40:40Z`

## User context

Jared asked:

- `What do you think?`
- `You will need to research which support other media.`
- `I'm not sure what you mean.`

This shard records the assistant recommendation and first-pass official/current media support research for image, video, TTS/audio, and music. It is ledger/source-lineage only and is not canonical Plans prose.

## Recommendation recorded for discussion

Provider entries should follow execution/auth/billing boundaries, then optionally be grouped under a provider family for display.

Example:

- `openai_api` owns API-key/org/billing routes such as `gpt-image-2` and OpenAI speech endpoints.
- `codex` owns Codex built-in plan/account routes such as `$imagegen`.
- A ChatGPT UI route should be represented only if PM can actually execute/control it as a provider route.
- The GUI may group these under an `OpenAI` family, but the backend should not collapse them into one interchangeable provider.

## First-pass media support matrix

Status labels used here:

- `native_output_supported`: documented first-party media output route exists.
- `provider_tool_supported`: provider product exposes a built-in tool route, but route/auth/details need product-specific handling.
- `input_only`: visual/audio/media input is supported, but native generated media output is not proven.
- `external_tool_or_mcp`: possible only through configured tools/MCP/external provider APIs.
- `not_supported`: official docs indicate no native support or no route was found in this pass.
- `unknown_needs_research`: not enough source evidence yet.
- `needs_authenticated_verification`: command/API behavior needs account/API-key testing before exact behavior is canonicalized.
- `deprecated_or_retiring`: route exists but is not a stable future support target.

| Provider/product route | Image output | Video output | TTS/audio output | Music output | Notes |
| --- | --- | --- | --- | --- | --- |
| OpenAI API | `native_output_supported` via GPT Image 2 / `gpt-image-2` | `deprecated_or_retiring` for Sora/Videos API | `native_output_supported` via Audio API / `gpt-4o-mini-tts` and related speech models | `not_supported` in first pass | Do not treat Sora as stable future media support; no official first-party music route found. |
| Codex built-in | `provider_tool_supported` via `$imagegen` / `gpt-image-2` docs | `unknown_needs_research` | `unknown_needs_research` | `unknown_needs_research` | Distinct from OpenAI API billing/quota; needs account-route handling. |
| ChatGPT UI | `provider_tool_supported` for ChatGPT Images 2.0 | `unknown_needs_research` | `unknown_needs_research` | `unknown_needs_research` | Only a PM provider route if PM can execute/control it. |
| Gemini Direct API | `native_output_supported` via Nano Banana / Nano Banana Pro / image models | `native_output_supported` via Veo 3.1 | `native_output_supported` via Gemini TTS/Live audio models | `native_output_supported` via Lyria 3 | Gemini Direct API stays; Gemini CLI does not. Model-specific limits/deprecations still apply. |
| Antigravity CLI/product | `provider_tool_supported` indicated by Antigravity docs/search snippets for Nano Banana 2 generative image tool | `unknown_needs_research` | `input_only`/`unknown_needs_research` for voice transcription versus generated speech output | `unknown_needs_research` | Direct docs extraction and authenticated route probes remain needed for exact command behavior; image generation not available in EU per official snippet. |
| Cursor | `provider_tool_supported` via Cursor agent image generation using Google Nano Banana Pro | `not_supported` in first pass | `not_supported` in first pass | `not_supported` in first pass | Existing PM Cursor image-only special case is broadly consistent, but provider/model matrix should express it cleanly. |
| Claude/Anthropic | `input_only` for vision/image input | `not_supported` in first pass | `not_supported` in first pass | `not_supported` in first pass | Current Claude docs describe text/image input and text output, not generated media output. |
| GitHub Copilot | `input_only` for visuals/screenshots/diagrams | `not_supported` in first pass | `not_supported` in first pass | `not_supported` in first pass | Official docs describe multimodal visual input, not native generated media output. |
| OpenCode | `input_only` for image attachments; `external_tool_or_mcp` possible | `external_tool_or_mcp` | `external_tool_or_mcp` | `external_tool_or_mcp` | OpenCode is a provider/model broker; native generated media output is not proven as first-party OpenCode behavior. |
| MiniMax general API | `native_output_supported` | `native_output_supported` | `native_output_supported` | `native_output_supported` | PM currently mentions `MiniMax Coding Plan`; general MiniMax API media support may need a separate provider route/boundary. |
| Z.AI general API | `native_output_supported` | `native_output_supported` | `input_only` for ASR confirmed; TTS `unknown_needs_research` | `not_supported` in first pass | `GLM Coding Plan` is coding-specific and may not imply general media API support inside the same PM provider entry. |
| Alibaba Cloud Model Studio / DashScope general API | `native_output_supported` | `native_output_supported` | `native_output_supported` including Qwen-TTS/CosyVoice and Qwen-Omni speech output | `not_supported` in first pass | PM current `Alibaba Coding Plan` should remain distinct from general DashScope media APIs unless Jared chooses to add general media provider routes. |

## Official/current sources inspected

- OpenAI image generation: `https://developers.openai.com/api/docs/guides/image-generation`
- OpenAI text to speech: `https://developers.openai.com/api/docs/guides/text-to-speech`
- OpenAI video/Sora deprecation: `https://developers.openai.com/api/docs/guides/video-generation`
- Google Gemini image generation: `https://ai.google.dev/gemini-api/docs/image-generation`
- Google Gemini video generation: `https://ai.google.dev/gemini-api/docs/video`
- Google Gemini music generation: `https://ai.google.dev/gemini-api/docs/music-generation`
- Antigravity models: `https://antigravity.google/docs/models`
- Antigravity CLI prompting: `https://antigravity.google/docs/cli-prompting`
- Antigravity enterprise: `https://antigravity.google/docs/enterprise`
- Antigravity features: `https://antigravity.google/docs/features`
- Cursor 2.4 image generation changelog: `https://cursor.com/changelog/2-4`
- Anthropic Claude models overview: `https://platform.claude.com/docs/en/about-claude/models/overview`
- GitHub Copilot model comparison: `https://docs.github.com/en/copilot/reference/ai-models/model-comparison`
- OpenCode models: `https://opencode.ai/docs/models/`
- OpenCode image attachments/config: `https://opencode.ai/docs/config/`
- MiniMax API overview: `https://platform.minimax.io/docs/api-reference/api-overview`
- MiniMax image generation: `https://platform.minimax.io/docs/api-reference/image-generation-t2i`
- MiniMax video generation: `https://platform.minimax.io/docs/guides/video-generation`
- MiniMax TTS: `https://platform.minimax.io/docs/api-reference/speech-t2a-http`
- MiniMax music generation: `https://platform.minimax.io/docs/api-reference/music-generation`
- Z.AI image generation: `https://docs.z.ai/api-reference/image/generate-image`
- Z.AI video generation: `https://docs.z.ai/api-reference/video/generate-video`
- Z.AI audio transcriptions: `https://docs.z.ai/api-reference/audio/audio-transcriptions`
- Z.AI coding plan overview: `https://docs.z.ai/devpack/overview`
- Alibaba Wan image generation/editing: `https://www.alibabacloud.com/help/en/model-studio/wan-image-generation-and-editing-api-reference`
- Alibaba video generation: `https://www.alibabacloud.com/help/en/model-studio/use-video-generation`
- Alibaba realtime TTS: `https://www.alibabacloud.com/help/en/model-studio/text-to-speech`
- Alibaba model list / Qwen-Omni: `https://www.alibabacloud.com/help/en/model-studio/models`

## Open questions preserved

- Answered 2026-06-25: Jared accepted the execution/auth/billing-boundary recommendation and clarified `OpenAI was just one example, it applies to others too`.
- Answered 2026-06-25: Jared answered `Both` for coding-plan and general media API routes, meaning PM should keep coding-plan provider products and also add separate general media-capable provider routes where vendors support media.
- Should first compile rely on source-qualified official docs with explicit support-state labels, or should exact command/API behavior wait for authenticated provider probes before being canonicalized?
