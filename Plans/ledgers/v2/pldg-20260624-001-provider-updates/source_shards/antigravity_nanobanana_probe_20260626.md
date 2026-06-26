# Antigravity Nano Banana / Google Media Probe - 2026-06-26

## Scope

Verify Jared's hypothesis that `nanobanana` / Nano Banana and other Google media models may be available through the Antigravity CLI.

No secrets, account identifiers, OAuth tokens, API keys, local user identifiers, or full log files are stored in this source shard.

## Local Commands And Results

- `agy --version` returned `1.0.12`.
- `agy models` returned:
  - `Gemini 3.5 Flash (Medium)`
  - `Gemini 3.5 Flash (High)`
  - `Gemini 3.5 Flash (Low)`
  - `Gemini 3.1 Pro (Low)`
  - `Gemini 3.1 Pro (High)`
  - `Claude Sonnet 4.6 (Thinking)`
  - `Claude Opus 4.6 (Thinking)`
  - `GPT-OSS 120B (Medium)`
- `agy models | rg -i 'nano|banana|imagen|veo|image|tts|music|video|google|gemini|flash|pro'` returned only the Gemini 3.5 / Gemini 3.1 rows; it did not list Nano Banana, Nanobanana, Imagen, Veo, image-generation, TTS, music, or video models.
- `agy --model 'Gemini 3.5 Flash (Medium)' --print-timeout 45s -p 'Reply with exactly antigravity-gemini35-ok'` returned `antigravity-gemini35-ok`.
- `agy --model 'Gemini 3.1 Pro (Low)' --print-timeout 45s -p 'Reply with exactly antigravity-gemini31-ok'` returned `antigravity-gemini31-ok`.
- `agy --log-file /tmp/agy-nanobanana-currentness.log --model 'Nano Banana' --print-timeout 45s -p 'Reply with exactly antigravity-nanobanana-probe'` returned `antigravity-nanobanana-probe`, but the log showed the model was not accepted:
  - `Failed to resolve model flag Nano Banana: model Nano Banana is not recognized as a known model or custom model in settings`
  - `Propagating selected model override to backend: label="Gemini 3.5 Flash (Medium)"`
- `/tmp/agy-nanobanana-currentness.log` was deleted after extracting the non-sensitive model-resolution lines.

## Planning Disposition

Current Antigravity CLI evidence verifies Gemini 3.5 Flash and Gemini 3.1 Pro text/coding model routes, plus listed non-Google text/coding model rows. It does not verify Nano Banana, Nanobanana, Imagen, Veo, TTS, music, video, or other generated-media routes.

Do not mark Nano Banana / Nanobanana / Google media-generation support green through Antigravity from arbitrary `--model` prompt success. Antigravity media support requires provider catalog presence plus an end-to-end generated artifact proof.
