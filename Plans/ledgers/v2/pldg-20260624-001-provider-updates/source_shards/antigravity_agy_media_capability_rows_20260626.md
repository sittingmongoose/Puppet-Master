# Antigravity `agy` Media Capability Rows - 2026-06-26

Source prompt: Jared corrected that whatever models `agy` supports should be added to the media capabilities.

Current public `agy` catalog probe:

```text
Gemini 3.5 Flash (Medium)
Gemini 3.5 Flash (High)
Gemini 3.5 Flash (Low)
Gemini 3.1 Pro (Low)
Gemini 3.1 Pro (High)
Claude Sonnet 4.6 (Thinking)
Claude Opus 4.6 (Thinking)
GPT-OSS 120B (Medium)
```

Planning interpretation:
- The media/capability matrix must contain every currently visible public `agy models` row under the Antigravity provider route, even when the row is text/coding only.
- The row must expose explicit modality/capability fields rather than omitting non-image rows from media capabilities.
- For current public `agy` rows, generated-media output remains `false` / not supported unless a specific row later produces a generated-media artifact.
- Current public `agy` rows should be represented as text-output models with route-specific support state, model/effort label, verification state, and media-capability fields such as image input, PDF input, generated image, generated video, generated audio/TTS, music, and artifact output.
- The separate OAuth/internal Antigravity generated-image route remains a distinct route with `gemini-3.1-flash-image` proven by local artifact output.

Negative constraints:
- Do not hide public `agy` models from the media/capability matrix just because they are not generated-image models.
- Do not mark generated image/video/audio/music support true for a public `agy` row without row-specific artifact proof.
- Do not collapse the public `agy` CLI catalog and the unofficial/private OAuth/internal image-generation catalog into one proof state.
- Do not list Nano Banana/Nanobanana as an active `agy` media row unless current `agy models` or an equivalent supported catalog exposes it and generated-artifact proof succeeds.
- Do not treat the current point-in-time `agy` catalog as static; PM should refresh catalog-backed capability rows at setup/runtime and preserve snapshot provenance.
