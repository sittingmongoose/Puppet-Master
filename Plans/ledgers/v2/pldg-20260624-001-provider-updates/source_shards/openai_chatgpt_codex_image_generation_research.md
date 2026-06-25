# OpenAI ChatGPT/Codex Image Generation Research

Ledger: `pldg-20260624-001-provider-updates`
Created: `2026-06-24T11:14:11Z`

## User correction/context

Jared clarified:

- `Gemini direct provider via api is ok to keep.`
- Media support needs adjustment because Gemini CLI is being removed/replaced by Antigravity.
- `openAI(ChatGPT/codex) added ChatGPT 2 image generation.`
- This needs `deep research` before compile.

## Official OpenAI sources inspected

- OpenAI announcement: `https://openai.com/index/introducing-chatgpt-images-2-0/`
- API image generation guide: `https://developers.openai.com/api/docs/guides/image-generation`
- Responses image-generation tool guide: `https://developers.openai.com/api/docs/guides/tools-image-generation`
- Image API reference: `https://developers.openai.com/api/reference/resources/images/methods/generate`
- OpenAI models index: `https://developers.openai.com/api/docs/models/all`
- Codex app features: `https://developers.openai.com/codex/app/features`
- Codex CLI features: `https://developers.openai.com/codex/cli/features`
- Codex IDE features: `https://developers.openai.com/codex/ide/features`
- ChatGPT Images 2.0 Help Center: `https://help.openai.com/en/articles/11317408-chatgpt-images-2-0`
- C2PA in ChatGPT Help Center: `https://help.openai.com/en/articles/8912793-c2pa-in-chatgpt`
- Image generation rate limits Help Center: `https://help.openai.com/en/articles/6696591-what-are-the-rate-limits-for-image-generation`
- API organization verification Help Center: `https://help.openai.com/en/articles/10910291-api-organization-verification`

## Findings

- OpenAI announced `ChatGPT Images 2.0` on 2026-06-24 and identifies API availability as `GPT Image 2`.
- The OpenAI model index lists `gpt-image-2` as an image input/output model released `2026-06-24`.
- API docs describe two relevant routes:
  - Responses API image generation through the `image_generation` tool, where `gpt-image-2` is selected as the tool model, not as the Responses text model.
  - Direct Image API generation/edit workflows, where `model` can be the image model and advanced image parameters are available.
- Documented image parameters include size/custom size behavior, quality, output format, output compression, input fidelity, partial image/streaming controls, background behavior, moderation, and count.
- Codex app, CLI, and IDE feature docs describe built-in image generation powered by `gpt-image-2`. The docs identify `$imagegen` as the explicit trigger and mention reference-image workflows.
- Codex docs distinguish built-in Codex image generation from larger/batch API workflows: built-in use is account/plan/rate-limit bounded, while larger batches should use an OpenAI API key through image generation MCP or OpenAI MCP server.
- Help Center provenance docs say images generated through ChatGPT, Codex, API, and Sora include C2PA metadata as of 2026-06-24; ChatGPT, Codex, and API images also include SynthID. These markers are not durable under all transformations and should not be overpromised as complete provenance.
- Help Center/API docs indicate access and limits are not just static model capability: rate limits can vary, and some limited-access models/features such as GPT Image 2 can require API organization verification.

## Endpoint/product distinctions to preserve

- ChatGPT Images 2.0 product capabilities and direct API capabilities are not identical surfaces.
- Codex built-in `$imagegen`, ChatGPT UI image generation, OpenAI API image generation, and OpenAI MCP/image-generation MCP should not be treated as one interchangeable backend without account, billing, quota, auth, batch, and capability distinctions.
- Existing PM Codex account-family modeling should preserve the difference between ChatGPT-plan-backed Codex behavior and API-key-backed OpenAI behavior.

## Documentation nuance/risk

- API guide/reference/model-card pages currently need endpoint-specific interpretation for `gpt-image-2`, because model-card and endpoint docs differ in how they expose streaming/partial images and exact model parameter placement.
- Product/help docs mention transparency/background editing capabilities in ChatGPT contexts, while API tool docs include endpoint-specific support limits. Compile should not promise a universal transparent-background capability across all OpenAI/Codex routes unless the selected endpoint supports it.
- Exact provider taxonomy remains a product decision: OpenAI API, ChatGPT Images, and Codex built-in image generation may be separate provider entries or separate account/routes under one OpenAI/Codex provider family.
