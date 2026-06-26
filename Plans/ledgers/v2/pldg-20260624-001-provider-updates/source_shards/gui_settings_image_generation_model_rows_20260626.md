# GUI and Settings Image Generation Model Rows - 2026-06-26

Source prompt: Jared asked whether the GUI Plans section and Settings section for supported image generation models will be updated with the ledger changes. He clarified those sections were primarily Gemini models before, but now ChatGPT and `agy` models that actually support media generation should be added to the mix.

Relevant owner surfaces observed:
- `Plans/FinalGUISpec.md`
  - `F3-400 - Provider Account Model Selector And Effort Controls`
  - `F3-401 - Provider Media Capability Controls And Disclosures`
- `Plans/Models_System.md`
  - `MS-113 - Provider-Owned Model Catalog And Evidence States`
  - `MS-114 - Direct Coding-Plan Provider Route Matrix`
  - `MS-115 - Provider-Specific Thinking Effort And Transform Defaults`
  - `Settings > Models`
- `Plans/Media_Generation_and_Capabilities.md`
  - `MGAC-094 - Provider Media Route Taxonomy`
  - `MGAC-095 - OpenAI/Codex Images 2 Route Families`
  - `MGAC-096 - MiniMax Image-01 Generated-Media Route`
  - Tested provider media support section around unsupported/gated rows
- `Plans/Multi-Account.md`
  - provider account/profile rows for OpenAI API-key image routes, OpenAI/Codex subscription-backed image generation, Antigravity CLI/internal routes, Gemini Direct, MiniMax global/CN, and gated providers
- `Plans/assistant-chat-design.md`
  - `ACD-424 - Chat Provider Model Effort And Media Route Consumers`

Planning clarification:
- Yes, when the ledger deltas are compiled, the GUI and Settings image-generation model sections must be updated too.
- This is not only a backend/media-matrix change.
- Settings and GUI image-generation selectors must stop being Gemini-primary and must include the new route families:
  - official OpenAI API-key `gpt-image-2` generation/edit route;
  - OpenAI Responses API hosted `image_generation` route;
  - mandatory OpenAI/Codex subscription-backed image generation route;
  - Antigravity OAuth/internal generated-image route with `gemini-3.1-flash-image` proven by local artifact output;
  - MiniMax global `image-01`;
  - Gemini Direct generated-image models where direct API media support is available;
  - Z.AI/Zhipu image-generation rows only as gated/disabled/unverified where plan/balance/resource-package proof is missing.
- Public `agy` text/coding rows still belong in broader media/capability metadata with generated-image=false, but they must not appear as selectable image-generation engines unless they actually support generated-image output.

Negative constraints:
- Do not leave the GUI/Settings supported image-generation model list Gemini-primary after compiling provider updates.
- Do not add text-only public `agy` rows to the image-generation engine picker as if they generate images.
- Do not collapse OpenAI API-key `gpt-image-2`, Responses `image_generation`, and OpenAI/Codex subscription-backed image generation into one generic OpenAI row.
- Do not collapse Antigravity public `agy` CLI text/coding rows with the separate OAuth/internal `gemini-3.1-flash-image` generated-image route.
- Do not show unsupported/gated providers as available image-generation choices; show them as disabled/capability-gated/unverified with the reason.
- Do not treat this as already compiled into canonical Plans; this shard is ledger-only until an explicit compile.
