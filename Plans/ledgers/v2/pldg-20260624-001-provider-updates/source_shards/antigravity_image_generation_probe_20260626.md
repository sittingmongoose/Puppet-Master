# Antigravity Image Generation Probe - 2026-06-26

Source prompt: Jared asked whether `jkalasas/opencode-antigravity-image` helps figure out Antigravity image generation capabilities.

Repository inspected:
- `https://github.com/jkalasas/opencode-antigravity-image`
- Local clone: `/tmp/pm-opencode-antigravity-image`
- Package version observed: `opencode-antigravity-image` `0.3.0`
- Dependency observed: `opencode-antigravity-auth` `^1.4.6`; current npm package inspected separately at `1.6.0`

What the repo proves as source-lineage:
- It is an unofficial OpenCode plugin, not a Google/Antigravity supported contract.
- It does not call `agy` as a CLI image-generation command.
- It uses Google OAuth credentials from `opencode-antigravity-auth`, refreshes an access token, and calls Antigravity/Cloud Code internal endpoints.
- The generation request wraps an inner `GenerateContentRequest` in an Antigravity body with `project`, `model`, `request`, `requestType: "agent"`, `userAgent: "antigravity"`, and `requestId`.
- The inner request uses `generationConfig.responseModalities: ["IMAGE"]`, `imageConfig.aspectRatio`, `imageConfig.imageSize`, and `candidateCount`.
- It supports text-to-image, image editing via `input_image`, multiple images via `count`, session continuity via `session_id`, and account rotation/soft quota handling.
- Its source defaults to `gemini-3-pro-image`.

Additional dependency evidence:
- `opencode-antigravity-auth@1.6.0` has Antigravity OAuth scopes/endpoints, project discovery, model routing, and image-model request handling.
- Its model resolver comments say `gemini-3-pro-image` is the available Antigravity API image model and that `gemini-2.5-flash-image` / Nano Banana is not supported by Antigravity, only Google AI API.
- Live probing below found that this dependency claim is stale or incomplete for the currently visible Antigravity account/catalog.

Local live probe:
- A process-local signed-in Antigravity OAuth session was used. Secret values, account identifiers, and local credential paths were not recorded.
- `agy --version` remained `1.0.12`.
- `agy models` still listed only text/coding models and did not list Nano Banana, Nanobanana, Imagen, Veo, or image-generation rows.
- `v1internal:loadCodeAssist` accepted body metadata with `platform: "PLATFORM_UNSPECIFIED"` or omitted platform.
- `v1internal:loadCodeAssist` rejected `platform: "MACOS"` with `INVALID_ARGUMENT`; this is important because the inspected auth package currently uses `MACOS` in one path.
- `v1internal:fetchAvailableModels` returned 20 visible models on daily/prod endpoints; the media-relevant visible model was `gemini-3.1-flash-image`.
- `gemini-3-pro-image` returned `404 Requested entity was not found` on daily/prod for the tested account/project, while autopush timed out.
- `gemini-3.1-flash-image` succeeded through `v1internal:generateContent` on `https://daily-cloudcode-pa.sandbox.googleapis.com`.
- The generated artifact was a JPEG, 1024x1024 pixels, 304358 bytes, SHA-256 `a60c8987f42ebb678426affb79d55f49f3efe8feebc8c09ba86772bfa91d9f5d`.
- Visual inspection confirmed the artifact matched the simple prompt: a blue square centered on a white background.

Planning conclusion:
- This repo helps substantially, but it should be treated as source-lineage for an Antigravity OAuth/internal API generated-media route, not as proof that the `agy` CLI exposes image generation through its public command/model contract.
- Current PM planning should distinguish:
  - Antigravity CLI `agy` text/coding support: live-verified for current catalog rows.
  - Antigravity generated-image support: live-verified through an OAuth/internal API route using `gemini-3.1-flash-image`, with unofficial/private-endpoint support-state and drift risk.
  - Nano Banana / `gemini-2.5-flash-image`: still not green through Antigravity; neither `agy models` nor the live internal catalog exposed that exact model name in this probe.
  - `gemini-3-pro-image`: source-lineage/stale candidate only for this environment because the live generated artifact proof used `gemini-3.1-flash-image`.

Negative constraints to preserve:
- Do not mark Antigravity CLI generated-media support green from `agy --model` prompt output or from a plugin repo alone.
- Do not present `gemini-3-pro-image` as currently verified in PM unless a fresh catalog/proof shows it works for the account/project.
- Do not alias Nano Banana, Nanobanana, or `gemini-2.5-flash-image` to Antigravity support without catalog presence plus generated-artifact proof.
- Do not store OAuth tokens, refresh tokens, account identifiers, local credential paths, or full HTTP payload logs in the ledger.
- Do not treat unofficial/private internal endpoint behavior as stable without explicit support-state, terms/risk labeling, and fallback/error handling.
