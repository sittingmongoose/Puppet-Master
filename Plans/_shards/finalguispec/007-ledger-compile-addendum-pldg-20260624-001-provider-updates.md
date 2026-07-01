# Shard 007: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/FinalGUISpec.md`

Source lines: L315-L436

Source SHA256: `b824671b5edfee493929996179c1892dd34c1a6ac3631c3a2ad143899ab49c9a`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into canonical GUI presentation requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### F3-400 - Provider Account Model Selector And Effort Controls

```yaml
plan_unit_id: F3-400
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Provider settings and run controls must present concrete provider/account/model rows from the Provider -> models catalog. Selectors are account-profile driven, show provider family grouping only as display metadata, expose thinking effort as requested intent where applicable, and disclose effective effort outcomes as honored, skipped, clamped, unsupported, or partially supported. Disabled, capability-gated, unverified, separate-profile, source-lineage-only, and retired/source-lineage provider states must be visible and actionable without implying generic provider failure.
gui_related: true
gui_classification_reason: Defines user-visible provider selectors, setup states, effort controls, and status labels.
depends_on: [MS-113, MS-115, MA-062, CV-293, UF-075]
unblocks: [ACD-424]
acceptance_criteria:
  - Provider/model selectors are driven by provider entry, account profile, model row, and support-state data.
  - Thinking effort UI distinguishes requested and effective outcomes.
  - Stale Gemini CLI rows are not active setup choices; Gemini Direct and Antigravity are distinct.
  - Cursor setup includes the dashboard API-key helper text without storing or echoing the key.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_settings_ui_drift
reasoning_tier: high
context_scope: provider_settings_gui
implementation_surfaces: [Plans/FinalGUISpec.md, future provider settings UI, future run control UI]
node_compile_hint: {mode: provider_account_model_selector_gui, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0018
  - pldg-20260624-001-provider-updates:atom-0103
  - pldg-20260624-001-provider-updates:atom-0118
source_atom_ids: [atom-0018, atom-0028, atom-0033, atom-0035, atom-0046, atom-0048, atom-0103, atom-0106, atom-0107, atom-0116, atom-0117, atom-0118, atom-0119, atom-0122, atom-0123, atom-0129, atom-0131, atom-0132, atom-0135, atom-0138, atom-0139, atom-0140]
preserved_exact_tokens: ["Provider -> models", "thinking effort", "honored", "skipped", "clamped", "unsupported", "partially supported", "disabled", "capability-gated", "unverified", "separate-profile", "Cursor API key can be obtained in https://cursor.com/dashboard/ in the API keys section.", "Gemini CLI", "Antigravity CLI"]
negative_constraints:
  - Do not display Gemini CLI as an active provider setup path.
  - Do not flatten provider setup failures into a generic provider error.
  - Do not show provider API keys or OAuth URLs in GUI, ledgers, logs, or artifacts.
owner_hints: [Plans/FinalGUISpec.md, Plans/Models_System.md, Plans/Multi-Account.md, Plans/usage-feature.md]
```

### F3-401 - Provider Media Capability Controls And Disclosures

```yaml
plan_unit_id: F3-401
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Media controls must consume route-specific media capability schemas and show media input, media output, and generated-media support separately. The GUI and Settings image-generation engine list must be route-specific rather than Gemini-primary: expose OpenAI API-key `gpt-image-2` generation/edit, OpenAI Responses hosted `image_generation`, mandatory ChatGPT/OpenAI/Codex subscription-backed image generation, MiniMax global `image-01` generation controls including aspect ratio or width/height, response format, seed, `n`, prompt optimizer, and 24-hour URL-expiry warnings, Antigravity OAuth/internal `gemini-3.1-flash-image` as a support-state-labeled capability-gated generated-image route, and Gemini Direct generated-image routes where direct API media proof exists. Kimi, GitHub Copilot, Cursor, Z.AI/Zhipu, public text-only `agy` rows, and other providers with partial or missing generated-artifact proof must remain visible as unsupported, disabled, capability-gated, or unverified rows with reasons rather than selectable image-generation engines.
gui_related: true
gui_classification_reason: Defines user-visible media controls, settings, disclosures, and disabled/gated states.
depends_on: [MGAC-094, MGAC-095, MGAC-096, MGAC-097, RAP-032, POA-050]
unblocks: []
acceptance_criteria:
  - GUI distinguishes media input, media output, and generated-media routes.
  - OpenAI API-key image routes and OpenAI/Codex subscription-backed routes are separate visible choices.
  - MiniMax Image-01 controls include route-specific parameters and expiry/partial-success disclosures.
  - Unsupported or gated media routes are shown as such, not hidden or implied green.
  - GUI and Settings image-generation selectors include Antigravity OAuth/internal `gemini-3.1-flash-image` only as a support-state-labeled capability-gated route, not as public `agy` CLI media.
  - Public `agy` text/coding rows remain capability metadata and do not become selectable image-generation engines unless the exact route later proves generated-media output.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: media_capability_ui_overclaim
reasoning_tier: high
context_scope: media_generation_gui
implementation_surfaces: [Plans/FinalGUISpec.md, future media generation controls, future provider settings UI]
node_compile_hint: {mode: media_capability_controls_gui, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0029
  - pldg-20260624-001-provider-updates:atom-0133
  - pldg-20260624-001-provider-updates:atom-0137
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
  - pldg-20260624-001-provider-updates:atom-0144
source_atom_ids: [atom-0028, atom-0029, atom-0031, atom-0033, atom-0034, atom-0035, atom-0037, atom-0038, atom-0039, atom-0040, atom-0041, atom-0042, atom-0043, atom-0044, atom-0045, atom-0046, atom-0048, atom-0049, atom-0074, atom-0101, atom-0105, atom-0126, atom-0127, atom-0128, atom-0129, atom-0130, atom-0131, atom-0133, atom-0134, atom-0136, atom-0137, atom-0138, atom-0142, atom-0143, atom-0144]
preserved_exact_tokens: ["ChatGPT Images 2.0", "GPT Image 2", "ChatGPT", "gpt-image-2", "image_generation", "OpenAI/Codex subscription", "OpenAI/Codex subscription-backed image generation", "MiniMax Image-01", "image-01", "gemini-3.1-flash-image", "Gemini Direct", "agy models(The ones that actually support media generation)", "aspect_ratio", "width", "height", "response_format", "url", "base64", "seed", "n", "prompt_optimizer", "24-hour URL expiry", "unsupported", "disabled", "capability-gated", "unverified", "Settings > Models", "F3-401", "ACD-424"]
negative_constraints:
  - Do not represent image input as image generation.
  - Do not make the GUI the owner of media schema truth.
  - Do not hide expiry, partial success, provider account, or provenance caveats from generated-media results.
  - Do not leave GUI or Settings supported image-generation model sections Gemini-primary after compiling provider updates.
  - Do not add public text-only `agy` rows to the image-generation engine picker as if they generate images.
  - Do not collapse OpenAI API-key `gpt-image-2`, Responses `image_generation`, and OpenAI/Codex subscription-backed image generation into one generic OpenAI row.
  - Do not collapse Antigravity public `agy` CLI text/coding rows with the separate OAuth/internal `gemini-3.1-flash-image` generated-image route.
  - Do not show unsupported/gated providers as available image-generation choices; show disabled/capability-gated/unverified state and reason.
owner_hints: [Plans/FinalGUISpec.md, Plans/Media_Generation_and_Capabilities.md, Plans/Runtime_Artifacts_Panel.md, Plans/Project_Output_Artifacts.md]
```

The `cosmic` base style is used because it supports `ColorScheme` toggling and has a neutral appearance that does not conflict with custom theming. All visual differences are driven by a `Theme` global in `.slint` rather than the base style.

### 2.4 Backend Selection

Provider CLI backend eligibility is separate from Slint renderer selection: Cursor CLI must be re-evaluated as an ACP-capable first-class CLI backend, not only a stream-json bridge, before GUI diagnostics classify it as a legacy stream transport.


Backend is chosen at startup; all windows use the same backend. Selection uses `slint::BackendSelector::new().select()` with `SLINT_BACKEND` environment variable override. Cargo features control which renderers are compiled in (e.g., `default = ["renderer-skia"]`, optional `renderer-femtovg`).

Deterministic selection order:
1. Explicit valid `SLINT_BACKEND` override wins.
2. Otherwise use the persisted app preference if it maps to a compiled-in backend.
3. Otherwise use compiled default order: `winit + Skia` → `winit + FemtoVG-wgpu` → emergency software renderer.

Failure handling:
- An invalid override or unavailable preferred backend MUST emit a startup diagnostic and fall through deterministically to the next compiled-in backend.
- The selected backend MUST be shown in diagnostics/setup surfaces so fallback behavior is inspectable.

```rust
// main.rs entry point
fn main() -> Result<(), Box<dyn std::error::Error>> {
    slint::BackendSelector::new().select()?;
    let ui = AppWindow::new()?;
    // ... state init, bridge wiring, effects generation
    ui.run()?;
    Ok(())
}
```

---
