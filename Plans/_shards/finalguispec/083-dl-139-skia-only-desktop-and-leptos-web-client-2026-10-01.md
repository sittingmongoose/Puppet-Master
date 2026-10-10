# Shard 083: DL-139 — Skia Only Desktop And Leptos Web Client (2026-10-01)

Source: `Plans/FinalGUISpec.md`

Source lines: L40724-L40891

Source SHA256: `cf498d16d8ec3cf08792900c526af3abe56cf49b137a19142400f978c0bbbed1`

---

## DL-139 — Skia Only Desktop And Leptos Web Client (2026-10-01)

This addendum compiles the owner decision DL-139. Sections 2.1 to 2.4, 2.7, 2.8, 9, 11.3, 14.1, the Rendering Surface Addendum, the Theme Token Tables backdrop-filter budget, and Appendix B carry the matching prose. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks.

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
  scaled or rotated, and transparent windows; macOS keeps grayscale text, and Linux subpixel text needs more work in
  Skia's FreeType setup and follows after Windows. On the Skia CPU raster (winit-skia-software), backdrop blur is not
  drawn and frosted surfaces draw solid in their own fill; the other effects still draw. The extensions are written to upstream quality, offered to Slint against slint-ui/slint#612,
  slint-ui/slint#2066, and slint-ui/slint#5748, and carried as a Cargo [patch] of Slint's crates until merged; every
  Slint upgrade re-applies them and re-runs their screenshot checks. Slint-portability notes that ban blur, backdrop
  blur, masks, blend modes, or filter effects only because stock Slint could not draw them no longer bind for these
  effects; their other guidance remains a performance option. Setup popups (the sheets of F3-566) take DL-114's extra
  blur on the GPU path and stay solid on the CPU raster, and F3-431's blur budget admits that sheet blur and nothing
  more. Motion that needs no renderer
  work, such as multi-step keyframes, stepped easing, and path draw-on, is built from Slint animations,
  animation-tick(), and timers rather than from these extensions. Slint remains the native UI framework (layout,
  input, focus, text editing, clipboard, drag and drop, windows); the extensions are this fixed property set,
  implemented centrally in the Cargo [patch], and screens use only these .slint properties and never call the
  renderer or Skia directly. Replacing Slint needs a new owner decision.
gui_related: true
gui_classification_reason: Defines the visual capabilities the desktop renderer adds beyond stock Slint.
split_recommended: false
depends_on: [DL-139, F3-026, F3-029, F3-033, F3-417]
unblocks: [F3-566]
acceptance_criteria:
  - "Each listed effect is reachable as a .slint property and drawn by Skia on both the GPU and CPU paths, except backdrop blur, whose surfaces draw solid in their own fill on the CPU path."
  - "On Windows with ClearType on, static text over an opaque background draws with subpixel edging in the system's RGB or BGR order; text in fading or cached layers, scaled or rotated text, and transparent windows draw grayscale."
  - "StyledText supports mouse and keyboard selection and copy, and the application can read and set its selection offsets."
  - "The extensions live in a Cargo [patch] of Slint's crates with a recorded upstream issue or pull request for each, and each Slint upgrade re-applies them and re-runs their screenshot checks."
  - "Slint-portability bans on these effects no longer bind; sheets are frosted on the GPU path and solid on the CPU raster, and F3-431 admits only that sheet blur."
  - "No screen or view calls the renderer or Skia directly; every effect is reached through the fixed extension properties."
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
  - "Plans/Decision_Log.md#DL-139 (owner answers, 2026-10-01 and 2026-10-02)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261001.md, SHA-256 9ca1e2ab54c77a744d629eb4c6dcc1aa8c9d206c6256efbce8b66230a0961ad6"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/CRITIQUE-RESPONSE-20261001.md, SHA-256 76047abe87b2488f52b3e6df94160aa9da09ec1883d3a91876b20d3e1741a1da"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261002.md, SHA-256 6a4c9f58ef4439d0a1882b7306c0b8d446a94e5f45f2346ab4430b66f13f2e84"
preserved_exact_tokens:
  - "Skia renderer extensions"
  - "backdrop blur"
  - "ClearType"
  - "StyledText"
  - "winit-skia-software"
  - "slint-ui/slint#5748"
negative_constraints:
  - "Do not draw backdrop blur on the Skia CPU raster; draw those surfaces solid in their own fill."
  - "Do not widen F3-431's blur budget beyond the sheet blur DL-139 admits."
  - "Do not let a screen or view call the renderer or Skia directly, and do not add effects outside this unit's fixed property set."
compatibility_only_notes: []
stale_retired_dispositions:
  - "DL-139 lifts Slint-portability bans on blur, backdrop blur, masks, blend modes and filter effects that existed only because stock Slint could not draw them; the individual notes are updated when their units are next edited."
owner_boundary_notes:
  - "FinalGUISpec owns the extension contract; Release_Supply_Chain consumes it for packaging and renderer-order verification."
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
  selection, and CSS effects (DL-139), except that the web terminal tracks its own selection in the terminal grid's
  data rather than with the browser's selection, so a selection survives scrolling and new output. It pins the Leptos 0.8 line until 0.9 is stable and is served as a static web
  route by the trusted local daemon; first paint may later move to server rendering from the daemon if load time needs
  it. It uses no React, Tauri, or TypeScript; JavaScript is limited to generated glue and the minimal bootstrap needed
  to load the WASM module, route static assets, and connect to approved local services. The trusted local daemon
  contract and the web capability states (the Trusted Local Daemon Contract and Web Capability Matrix sections) apply
  unchanged. Desktop and web share behavior, not pixels. They stay in step through one shared Rust interface-model
  crate that owns shared commands, typed requests and results, domain state and validation, document and editing
  models, and formatting, and that both interfaces bind to; one design-token source that generates the Slint theme
  globals and the CSS custom properties for every theme; and the same behavioral scenarios and fixtures run through
  both interfaces, with screenshots of each checked against that interface's own visual baselines. Presentation
  stays per interface; concept HTML is a design reference, not script to run under Leptos; and each stateful page
  region has one owner. Browser text carries no ClearType guarantee, so web text readability, selection, and caret
  behavior are checked on Windows at the expected display scaling, at rest and during transitions, including text
  under masks. The UI Scale setting applies to the whole page through one root-level CSS scale (Contracts_V0
  CV-188). Development and test builds expose the test-build observability of ATS-067. Web animations keep to transform
  and opacity where the design allows, long lists render only their visible rows, and long transcripts are trimmed or
  kept as page text rather than held in WebAssembly memory. The web terminal draws the same Rust terminal grid as a
  fixed, reused set of visible page-text rows updated by diff (the SMPFS-072 web exception) and ships only after the
  heavy-output speed tests. The Slint/WASM canvas web GUI is retired.
gui_related: true
gui_classification_reason: Defines the technology, rendering, and parity rules of the web GUI.
split_recommended: false
depends_on: [DL-139, F3-030, F3-417, ATS-023]
unblocks: []
acceptance_criteria:
  - "The web GUI is built from Rust Leptos components and CSS, pinned to the Leptos 0.8 line until 0.9 is stable, with no React, Tauri, or TypeScript product code."
  - "The web GUI reaches OS-owned capabilities only through the trusted local daemon and reports the web capability states of the Web Capability Matrix section."
  - "Desktop and web bind the same interface-model crate (shared commands, typed requests and results, domain state and validation, document and editing models) and the same generated design tokens, and the shared behavioral scenarios produce screenshots on both, each checked against its own interface's visual baselines."
  - "Web text is browser-rendered and selectable with the browser's own selection, with no ClearType guarantee; its readability, selection, and caret behavior are checked on Windows at the expected display scaling, at rest and during transitions, including text under masks."
  - "The web terminal tracks its own selection in the terminal grid's data, not with the browser's selection, and a selection survives scrolling and new output."
  - "The web terminal renders only its visible rows as reused page-text rows from the Rust terminal grid and passes the heavy-output speed tests before it ships."
  - "Web animations keep to transform and opacity where the design allows, long lists render only their visible rows, and long transcripts are trimmed or kept as page text."
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
  - "Plans/Decision_Log.md#DL-139 (owner answers, 2026-10-01 and 2026-10-02)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261001.md, SHA-256 9ca1e2ab54c77a744d629eb4c6dcc1aa8c9d206c6256efbce8b66230a0961ad6"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/CRITIQUE-RESPONSE-20261001.md, SHA-256 76047abe87b2488f52b3e6df94160aa9da09ec1883d3a91876b20d3e1741a1da"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/ANSWERS-20261002.md, SHA-256 6a4c9f58ef4439d0a1882b7306c0b8d446a94e5f45f2346ab4430b66f13f2e84"
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
  - "Do not run concept HTML scripts under Leptos or let Leptos and hand-written JavaScript own the same stateful page region."
  - "Do not compare desktop and web screenshots pixel for pixel; each interface has its own visual baselines."
stale_retired_dispositions:
  - "DL-139 retires the Slint/WASM canvas web GUI, its cdylib canvas client, and its minimal HTML/canvas bootstrap; those names remain source lineage only."
compatibility_only_notes: []
owner_boundary_notes:
  - "FinalGUISpec owns the web-client contract; Automated_Testing_System owns the web dev/test workflow (ATS-023) and test-build observability (ATS-067)."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-139, ContractName:Plans/Automated_Testing_System.md#ATS-023, ContractName:Plans/Release_Supply_Chain.md#RSC-012
