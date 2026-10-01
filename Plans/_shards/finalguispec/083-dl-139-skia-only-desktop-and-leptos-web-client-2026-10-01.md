# Shard 083: DL-139 — Skia Only Desktop And Leptos Web Client (2026-10-01)

Source: `Plans/FinalGUISpec.md`

Source lines: L39817-L39948

Source SHA256: `b6c053a1765ffdf3f702d837c03f15c35da17a3794f3db8acfdd24fdd990d92e`

---

## DL-139 — Skia Only Desktop And Leptos Web Client (2026-10-01)

This addendum compiles the owner decision DL-139. Sections 2.1 to 2.4, 2.8, and Appendix B carry the matching prose. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks.

### F3-582 — Skia Renderer Extensions

```yaml
plan_unit_id: F3-582
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Puppet Master extends Slint's Skia renderer with its own code (DL-139). The Skia renderer extensions expose as
  .slint properties, drawn by Skia: element blur; backdrop blur of what is drawn underneath an element; gradient and
  alpha masks; blend modes; saturate, contrast, and brightness filters; ClearType text on Windows; and selectable rich
  text (StyledText) whose selection offsets the application can read and set. ClearType reads the Windows
  font-smoothing settings (on or off, RGB or BGR order, contrast), gives Skia surfaces the screen's subpixel layout,
  draws glyphs with subpixel edging, and falls back to grayscale for text in fading or cached layers, text being
  scaled or rotated, and transparent windows; macOS keeps grayscale text, and Linux subpixel text is out of scope
  until Skia's FreeType path supports it. On the Skia CPU raster (winit-skia-software), heavy blur is off and blurred
  panels draw solid. The extensions are written to upstream quality, offered to Slint against slint-ui/slint#612,
  slint-ui/slint#2066, and slint-ui/slint#5748, and carried as a Cargo [patch] of Slint's crates until merged; every
  Slint upgrade re-applies them and re-runs their screenshot checks before it lands. Motion that needs no renderer
  work, such as multi-step keyframes, stepped easing, and path draw-on, is built from Slint animations,
  animation-tick(), and timers rather than from these extensions.
gui_related: true
gui_classification_reason: Defines the visual capabilities the desktop renderer adds beyond stock Slint.
split_recommended: false
depends_on: [DL-139, F3-026, F3-029, F3-033, F3-417]
unblocks: []
acceptance_criteria:
  - "Each listed effect is reachable as a .slint property and drawn by Skia on both the GPU and CPU paths, except heavy blur, which draws solid on the CPU path."
  - "On Windows with ClearType on, static text over an opaque background draws with subpixel edging in the system's RGB or BGR order; text in fading or cached layers, scaled or rotated text, and transparent windows draw grayscale."
  - "StyledText supports mouse and keyboard selection and copy, and the application can read and set its selection offsets."
  - "The extensions live in a Cargo [patch] of Slint's crates with a recorded upstream issue or pull request for each, and a Slint upgrade does not land until they re-apply and their screenshot checks pass."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: renderer_extension_drift_or_upgrade_break
reasoning_tier: high
context_scope: gui_stack_skia_leptos
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_platform_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-139 (owner answers, 2026-10-01)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261001.md, SHA-256 9ca1e2ab54c77a744d629eb4c6dcc1aa8c9d206c6256efbce8b66230a0961ad6"
preserved_exact_tokens:
  - "Skia renderer extensions"
  - "backdrop blur"
  - "ClearType"
  - "StyledText"
  - "winit-skia-software"
  - "slint-ui/slint#5748"
negative_constraints:
  - "Do not add these effects to any renderer other than Skia."
  - "Do not draw heavy blur on the Skia CPU raster; draw those panels solid."
  - "Do not land a Slint upgrade without re-applying and re-verifying the extensions."
owner_hints:
  - Plans/FinalGUISpec.md
```

### F3-583 — Leptos Web Client

```yaml
plan_unit_id: F3-583
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The web GUI is a Leptos client written in Rust, compiled to WebAssembly, and rendered in the browser (client-side
  rendering). It draws its interface with browser elements and CSS, so it uses the browser's own text rendering, text
  selection, and CSS effects (DL-139). It pins the Leptos 0.8 line until 0.9 is stable and is served as a static web
  route by the trusted local daemon; first paint may later move to server rendering from the daemon if load time needs
  it. It uses no React, Tauri, or TypeScript; JavaScript is limited to generated glue and the minimal bootstrap needed
  to load the WASM module, route static assets, and connect to approved local services. The trusted local daemon
  contract and the web capability states of sections 2.4 and 2.5 apply unchanged. Desktop and web stay in step through
  one shared Rust interface-model crate that owns state, commands, formatting, and validation and that both interfaces
  bind to; one design-token source that generates the Slint theme globals and the CSS custom properties for every
  theme; and the same fixtures run through both interfaces, with screenshots of each. Web animations keep to transform
  and opacity where the design allows, long lists render only their visible rows, and long transcripts are trimmed or
  kept as page text rather than held in WebAssembly memory. The Slint/WASM canvas web GUI is retired.
gui_related: true
gui_classification_reason: Defines the technology, rendering, and parity rules of the web GUI.
split_recommended: false
depends_on: [DL-139, F3-030, F3-417, ATS-023]
unblocks: []
acceptance_criteria:
  - "The web GUI is built from Rust Leptos components and CSS, pinned to the Leptos 0.8 line until 0.9 is stable, with no React, Tauri, or TypeScript product code."
  - "The web GUI reaches OS-owned capabilities only through the trusted local daemon and reports the web capability states of section 2.5."
  - "Desktop and web bind the same interface-model crate and the same generated design tokens, and the shared fixtures produce screenshots on both."
  - "Web text is browser-rendered and selectable with the browser's own selection."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: web_client_stack_or_parity_drift
reasoning_tier: high
context_scope: gui_stack_skia_leptos
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: gui_platform_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-139 (owner answers, 2026-10-01)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261001.md, SHA-256 9ca1e2ab54c77a744d629eb4c6dcc1aa8c9d206c6256efbce8b66230a0961ad6"
preserved_exact_tokens:
  - "Leptos"
  - "Leptos 0.8"
  - "client-side rendering"
  - "trusted local daemon"
  - "interface-model crate"
  - "design-token source"
negative_constraints:
  - "Do not use React, Tauri, or TypeScript in web product code."
  - "Do not let the web client claim OS-owned capabilities directly."
  - "Do not fork interface state or theme tokens between desktop and web."
stale_retired_dispositions:
  - "DL-139 retires the Slint/WASM canvas web GUI, its cdylib canvas client, and its minimal HTML/canvas bootstrap; those names remain source lineage only."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-139, ContractName:Plans/Automated_Testing_System.md#ATS-023, ContractName:Plans/Release_Supply_Chain.md#RSC-012
