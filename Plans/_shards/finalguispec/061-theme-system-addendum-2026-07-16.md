# Shard 061: Theme System Addendum - 2026-07-16

Source: `Plans/FinalGUISpec.md`

Source lines: L28722-L29717

Source SHA256: `cb8e793fd3b46d17be00745b05ace785aadc8d791bd0d3261415c532351d2b22`

---

## Theme System Addendum - 2026-07-16

This addendum promotes the user-approved PMConcept6 eight-theme system into canonical PlanUnits and carries the exact per-variant token tables as spec data. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-425 - Eight Built-In Themes And Friendly Dark Default

```yaml
plan_unit_id: F3-425
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The built-in theme set is exactly eight variants across four families: friendly-dark,
  friendly-light, glass-dark, glass-light, retro-dark, retro-light, basic-dark, and basic-light.
  The default theme is friendly-dark. The selector additionally carries a presentation mode
  dimension (Light, Dark, Auto); Auto resolves the selected family to its dark or light variant
  by following the operating system appearance (prefers-color-scheme) and updates live when the
  OS setting changes. This supersedes the prior three-family adjudication
  (exactly three built-in theme choices with a Retro Dark default), which is preserved as
  clearly labeled migration lineage prose so its exact tokens remain findable. Theme identity
  persistence continues through the existing theme:v1 storage contract carrying the theme
  family, presentation mode, and resolved variant; no new storage key is introduced for theme
  identity.
gui_related: true
gui_classification_reason: This unit defines the user-visible built-in theme set and the default theme selection.
split_recommended: false
depends_on: [F3-073, F3-217]
unblocks: []
acceptance_criteria:
- "The theme selector exposes exactly eight built-in variants: friendly-dark, friendly-light, glass-dark, glass-light, retro-dark, retro-light, basic-dark, and basic-light."
- "The selector additionally exposes a Light/Dark/Auto presentation mode, and in Auto the selected family resolves to its dark or light variant by following the OS appearance (prefers-color-scheme) live."
- "The default theme is friendly-dark."
- "The superseded three-family selector contract remains findable in the owner doc as clearly labeled migration lineage prose."
- "theme:v1 persists the theme family, presentation mode, and resolved variant, and no new storage key is registered for theme identity."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: eight_built_in_themes_and_friendly_dark_default
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:166"
- "Plans/FinalGUISpec.md:177"
- "Plans/FinalGUISpec.md:964"
- "Plans/FinalGUISpec.md:1035"
- "Plans/FinalGUISpec.md:2632"
- "Plans/FinalGUISpec.md:7441"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "friendly-dark"
- "friendly-light"
- "glass-dark"
- "glass-light"
- "theme:v1"
- "prefers-color-scheme"
- "Light, Dark, Auto"
negative_constraints:
- "Retro Dark is not the default."
- "Do not register a new storage key for theme identity; theme:v1 carries the theme family, presentation mode, and resolved variant."
compatibility_only_notes:
- "Slint portability: all eight built-in variants resolve to deterministic precomputed token sets; no arbitrary-content backdrop blur, no SVG filters, color math is precomputed rather than runtime-mixed, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions:
- "The three-family / Retro-Dark-default selector adjudication is superseded per dec-2026-07-16-pm6-theme-settings-canon-promotion-seal and preserved as migration lineage prose."
owner_boundary_notes:
- "The theme:v1 key row and its write frequency remain owned by the section 15.1 redb schema and F3-217; this unit widens only the persisted enum."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-426 - Per-Family Theme Token Contract

```yaml
plan_unit_id: F3-426
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Each of the eight built-in theme variants ships a complete precomputed token table covering
  surfaces, text colors, borders, the six named accents plus the primary accent and its RGB
  triple, the six graph-state colors, elevation shadows, radius and border-width geometry,
  motion easing resolution and durations, the per-variant diff-tint variable set, and
  typography. The exact values are spec data carried in the Theme Token Tables of this
  addendum; they are canonical, not illustrative. Token values that the concept derives at
  runtime through color-mix() or alpha-scaling calc() expressions are resolved to precomputed
  per-variant constants at build time, and the application performs no runtime color
  derivation.
gui_related: true
gui_classification_reason: This unit defines the visible color, typography, and geometry token values for every built-in theme variant.
split_recommended: false
depends_on: [F3-425, F3-074, F3-078]
unblocks: []
acceptance_criteria:
- "Every one of the eight built-in variants has a complete token table in the owner doc covering surfaces, text, borders, accents with the primary accent and RGB triple, graph-state colors, elevation, geometry, motion, diff tints, and typography."
- "The addendum token table values are treated as canonical spec data, and per-variant values marked runtime-derived in the concept are precomputed constants in the product."
- "No token value is derived at runtime through color-mix() or alpha-scaling calc() expressions."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: per_family_theme_token_contract
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:978"
- "Plans/FinalGUISpec.md:7491"
- "Plans/FinalGUISpec.md:7699"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "--accent-primary"
- "--accent-primary-rgb"
- "--graph-pending"
- "--diff-added-bg"
- "--ease-default"
negative_constraints:
- "Do not derive theme token values at runtime; per-variant tables carry precomputed constants."
compatibility_only_notes:
- "Slint portability: precomputed per-variant token tables replace the concept's color-mix() and alpha-scaling calc() derivation at build time; no arbitrary-content backdrop blur, no SVG filters, color math is precomputed rather than runtime-mixed, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions:
- "The concept's runtime color-mix() and calc()-alpha token derivation is demo technique only; canon carries precomputed per-variant values."
owner_boundary_notes:
- "The section 6.2 table remains the Retro/Basic variant matrix; the Friendly and Glass variant tables and the full eight-variant spec data live in this addendum."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-427 - Glass Composition Single-Blur Contract

```yaml
plan_unit_id: F3-427
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Glass themes composite exactly one in-viewport backdrop blur of 34px with saturate 160% on
  the app-shell slab, plus one more of the same material on the floating chat slab, which
  floats outside the pane and is never nested inside it. Interior glass structure is expressed
  as a four-step transparency scale of plain fills with no additional blur: step one is the
  clearest see-through region for side panels, step two is the light frost for toolbars,
  controls, and cards, step three is the lighter frosted selection pill, and the near-opaque
  reading plate backs code surfaces and popovers. Pane fills derive from the pane k-factors:
  .73, .57, and .67 for glass-dark and .62, .36, and .47 for glass-light. The cloudscape
  wallpaper ships as a pre-blurred baked asset; the concept's runtime filter blur over
  gradient layers is demo technique only.
gui_related: true
gui_classification_reason: This unit defines the visible glass slab composition, blur budget, and transparency structure of glass themes.
split_recommended: false
depends_on: [F3-425]
unblocks: []
acceptance_criteria:
- "Glass themes render exactly one app-shell backdrop blur at 34px with saturate 160% plus one floating-chat blur of the same material, and no other in-viewport backdrop blur inside the pane."
- "Interior glass surfaces use the four-step transparency scale (step one through step three plus the reading plate) as plain fills without additional blur."
- "Pane fills use the k-factors .73/.57/.67 for glass-dark and .62/.36/.47 for glass-light."
- "The glass wallpaper is a pre-blurred baked asset; no wallpaper blur runs at runtime."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: glass_composition_single_blur_contract
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:964"
- "Plans/FinalGUISpec.md:2632"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "34"
- "160%"
- ".73"
- ".57"
- ".67"
- ".62"
- ".36"
- ".47"
negative_constraints:
- "No nested backdrop-filter; no runtime wallpaper blur."
compatibility_only_notes:
- "Slint portability: the two permitted blurs map to frosted slabs composited over the known pre-blurred wallpaper asset; no arbitrary-content backdrop blur, no SVG filters, color math is precomputed rather than runtime-mixed, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions:
- "The concept's per-zone glass tint casts were retired in the concept itself; the one-pane composition with transparency steps is the promoted model."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-428 - Glass Background Modes

```yaml
plan_unit_id: F3-428
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Glass themes offer three wallpaper background modes selected through the data-glass-bg
  state: mesh, depth, and minimal, with mesh as the default. Mesh renders the full cloudscape
  (base sky plus one billow layer) with one very slow transform-only drift. Depth renders the
  same cloudscape plus a second parallax billow layer and cloud puffs whose offsets are
  pointer-driven; depth parallax and all drift animation are disabled under reduced motion.
  Minimal renders the base gradient sky only, static. The selected mode persists at
  glass_background_mode:v1.
gui_related: true
gui_classification_reason: This unit defines the visible glass wallpaper modes, their layer inventory, and their motion behavior.
split_recommended: false
depends_on: [F3-427, F3-444]
unblocks: []
acceptance_criteria:
- "Glass themes expose exactly the mesh, depth, and minimal background modes with mesh as the default."
- "Depth mode adds pointer-driven parallax cloud layers, and reduced motion disables parallax and drift."
- "Minimal mode renders a static base gradient sky with no billow layers."
- "The selected mode persists at glass_background_mode:v1."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: glass_background_modes
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:964"
- "Plans/FinalGUISpec.md:2292"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "mesh"
- "depth"
- "minimal"
- "glass_background_mode:v1"
negative_constraints:
- "Do not run drift or parallax animation under reduced motion."
compatibility_only_notes:
- "Slint portability: each background mode renders from pre-blurred baked bitmaps, with depth layers baked separately so parallax offsets remain applicable; no arbitrary-content backdrop blur, no SVG filters, color math is precomputed rather than runtime-mixed, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions:
- "The concept localStorage name pm.glassBg is a demo persistence shim; the canonical key is glass_background_mode:v1."
owner_boundary_notes:
- "Registration of glass_background_mode:v1 in the section 15.1 storage tables is owned by F3-444; this unit consumes the key."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-429 - Glass Alpha Transparency Slider

```yaml
plan_unit_id: F3-429
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Glass themes expose a user-facing transparency control bound to --glass-alpha. Defaults are
  .60 for glass-dark and .55 for glass-light. Values clamp per theme: .35 through .85 for
  glass-dark and .45 through .88 for glass-light. Changes apply live to every alpha-driven
  glass fill and persist at glass_alpha:v1. The slider is a glass-only setting and renders
  only while a glass theme is active.
gui_related: true
gui_classification_reason: This unit defines a user-facing transparency control and its visible effect on glass surfaces.
split_recommended: false
depends_on: [F3-427, F3-444]
unblocks: []
acceptance_criteria:
- "The --glass-alpha control defaults to .60 on glass-dark and .55 on glass-light."
- "Values clamp to .35 through .85 on glass-dark and .45 through .88 on glass-light."
- "Slider changes apply live to alpha-driven glass fills and persist at glass_alpha:v1."
- "The slider is glass-only."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: glass_alpha_transparency_slider
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:964"
- "Plans/FinalGUISpec.md:2292"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "--glass-alpha"
- ".60"
- ".55"
- ".35"
- ".85"
- ".45"
- ".88"
- "glass_alpha:v1"
negative_constraints:
- "Do not accept alpha values outside the per-theme clamps, and do not render the slider for non-glass themes as an editable control."
compatibility_only_notes:
- "Slint portability: alpha-driven fills resolve to a bounded set of precomputed fill values sampled across the clamp range or to a native alpha-composited constant tint; no arbitrary-content backdrop blur, no SVG filters, color math is precomputed rather than runtime-mixed, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions:
- "The concept localStorage name pm.glassAlpha is a demo persistence shim; the canonical key is glass_alpha:v1."
owner_boundary_notes:
- "Registration of glass_alpha:v1 in the section 15.1 storage tables is owned by F3-444; the locked non-glass presentation row is owned by F3-443."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-430 - Friendly Family Ingredients And Font Rules

```yaml
plan_unit_id: F3-430
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Friendly family ships Cal Sans display, Quicksand body, and Nunito fallback fonts
  bundled locally with the application; no runtime font CDN is used. The Friendly ground is a
  warm paper texture with an 18px dot grid and static pastel corner glows. Frosted chrome
  backdrop blur of 14px is limited to the title bar, status bar, and bottom panel. Five
  category pastels (mint, sky, coral, lavender, butter) tint category surfaces through the
  cozy hook tokens. The theme-switching restart rules extend to cross-family switches
  involving Friendly or Retro fonts: same-family switches stay live; cross-family switches
  that change font families between Retro (Orbitron, Rajdhani) and Friendly (Cal Sans,
  Quicksand, Nunito) require restart; and switches between the system-font Glass and Basic
  families stay live.
gui_related: true
gui_classification_reason: This unit defines the visible Friendly theme fonts, ground texture, frosted chrome, pastels, and switch behavior.
split_recommended: false
depends_on: [F3-425, F3-077]
unblocks: []
acceptance_criteria:
- "Cal Sans, Quicksand, and Nunito are bundled locally and no runtime font CDN request is made."
- "The Friendly ground renders the paper texture with an 18px dot grid, and frosted 14px chrome blur is limited to the title bar, status bar, and bottom panel."
- "The five category pastels (mint, sky, coral, lavender, butter) drive category surface tinting."
- "Cross-family theme switches that change Retro or Friendly font families require restart, while same-family and Glass/Basic system-font switches stay live."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: friendly_family_ingredients_and_font_rules
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:964"
- "Plans/FinalGUISpec.md:7647"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Cal Sans"
- "Quicksand"
- "Nunito"
- "18px"
- "14px"
negative_constraints:
- "Do not load Friendly fonts from a runtime font CDN, and do not apply frosted chrome blur outside the title bar, status bar, and bottom panel."
compatibility_only_notes:
- "Slint portability: bundled font files register with the Slint font database; the paper texture, dot grid, and corner glows render as precomputed opaque or baked surfaces; the three chrome frosts render over known shell content; no arbitrary-content backdrop blur, no SVG filters, color math is precomputed rather than runtime-mixed, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions:
- "The concept loads Cal Sans, Quicksand, and Nunito from a runtime font CDN; that loading path is demo technique only and is replaced by locally bundled fonts."
owner_boundary_notes:
- "The live/restart switching matrix remains owned by F3-077; this unit extends its restart set to cross-family Friendly/Retro font changes."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-431 - Slint Theme Hazard Remediation

```yaml
plan_unit_id: F3-431
unit_type: constraint
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Slint theme hazard remediation constraints bind all eight built-in variants. Every
  color-mix() and alpha-scaling calc() token in the concept CSS is resolved to precomputed
  per-variant values at build time, matching the precomputed-color constraint already carried
  by PWIZ-019. All theme fonts are bundled locally. Glass cloudscapes are baked as pre-blurred
  bitmaps per background mode, with depth-mode parallax layers baked as separate bitmaps so
  the parallax offset variables continue to operate. The backdrop-filter budget is enumerated
  and closed: two glass-theme blurs (app shell and floating chat), three friendly-theme blurs
  (title bar, status bar, bottom panel), and two settings-modal blurs (the bloom backdrop
  scrim and, under glass, the bloom and project-settings modal slabs). Effects the concept
  builds with mix-blend-mode or mask-composite, such as the glass pane sheen and gradient
  hairline rings, are either renderable natively by the toolkit or precomputed into baked
  assets.
gui_related: true
gui_classification_reason: This unit constrains how visible theme effects are produced so every variant renders on the Slint toolkit.
split_recommended: false
depends_on: [F3-426, F3-427, F3-430]
unblocks: []
acceptance_criteria:
- "No color-mix() or alpha-scaling calc() color derivation survives to runtime; per-variant precomputed values replace them at build time."
- "All theme fonts are bundled locally and cloudscapes are baked as pre-blurred bitmaps per background mode, with depth parallax layers baked separately."
- "The backdrop-filter budget is closed at two glass blurs, three friendly blurs, and two settings-modal blurs, and no surface adds a blur outside that enumeration."
- "mix-blend-mode and mask-composite effects are renderable natively or precomputed into baked assets."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: slint_theme_hazard_remediation
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:1035"
- "Plans/FinalGUISpec.md:7699"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "color-mix()"
- "backdrop-filter"
- "mix-blend-mode"
- "mask-composite"
negative_constraints:
- "No arbitrary-content backdrop blur; no SVG filters; no runtime color math."
compatibility_only_notes:
- "Slint portability: this unit is the family-wide remediation contract; no arbitrary-content backdrop blur, no SVG filters, color math is precomputed rather than runtime-mixed, and any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
stale_retired_dispositions: []
owner_boundary_notes:
- "The precomputed-color constraint phrasing aligns with PWIZ-019 in Plans/Planning_Wizard.md; that unit remains owner of the embedded-chat surface it constrains."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### Theme Token Tables (F3-426 spec data)

Values below are transcribed verbatim from the concept CSS: `Concepts/pm6-build/parts/02-css-tokens.part.html` (root contract :28-66, theme blocks :140-552, glass background stage :554-733), `Concepts/pm6-build/parts/03-css-glass-a.part.html` (:19-49, :59-153), `Concepts/pm6-build/parts/04-css-glass-b.part.html` (:11-56, :138-196), `Concepts/pm6-build/parts/10x-pm6-css-global.part.html` (:139-176 friendly chrome), `Concepts/pm6-build/parts/10-css-settings.part.html` (:580-590, :912-940), and `Concepts/pm6-build/parts/29-js-settings-engine.part.html` (:60-86 alpha clamps). Values containing `calc()`, `color-mix()`, or `var()` chains are runtime-derived in concept; precompute per F3-431.

#### Root fallback contract (`:root`, 02-css-tokens.part.html:28-66)

Variants inherit these values wherever a per-variant table row says "not defined (inherits root)".

| Token | Root value |
|---|---|
| `--radius-xs` | `2px` |
| `--radius-sm` | `6px` |
| `--radius-md` | `10px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `22px` |
| `--radius-pill` | `999px` |
| `--border-width` | `2px` |
| `--border-radius` | `0px` |
| `--accent-primary` | `var(--accent-blue)` |
| `--accent-primary-rgb` | `0,71,171` |
| `--accent-soft` | `color-mix(in srgb, var(--accent-primary) 12%, transparent)` (runtime-derived in concept; precompute per F3-431) |
| `--accent-glow` | `color-mix(in srgb, var(--accent-primary) 25%, transparent)` (runtime-derived in concept; precompute per F3-431) |
| `--elev-1` | `0 1px 2px rgba(0,0,0,.12)` |
| `--elev-2` | `0 4px 14px rgba(0,0,0,.16)` |
| `--elev-3` | `0 12px 36px rgba(0,0,0,.22)` |
| `--elev-hover` | `0 10px 30px var(--accent-glow)` (runtime-derived in concept; precompute per F3-431) |
| `--motion-fast` | `120ms` |
| `--motion-med` | `240ms` |
| `--motion-slow` | `420ms` |
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` |
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` |
| `--ease-smooth` | `cubic-bezier(.4,0,.2,1)` |
| `--ease-snap` | `cubic-bezier(.2,0,0,1)` |
| `--ease-default` | `var(--ease-smooth)` |
| `--sheen-dur` | `.6s` |
| `--display-font` | `'Orbitron', sans-serif` |
| `--body-font` | `'Rajdhani', sans-serif` |
| `--mono-font` | `ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace` |
| `--base-font-size` | `14px` |
| `--line-height` | `1.4` |
| `--letter-spacing` | `normal` |
| `--grid-gap` | `24px` |

#### retro-dark (02-css-tokens.part.html:140-187)

| Group | Token | Value |
|---|---|---|
| Surfaces | `--background` | `#1A1A1A` |
| Surfaces | `--surface` | `#1A1A1A` |
| Surfaces | `--surface-elevated` | `#252525` |
| Surfaces | `--surface-alt` | not defined (friendly-only token; no root definition) |
| Text | `--text-primary` | `#E0E0E0` |
| Text | `--text-secondary` | `#A6A6A6` |
| Text | `--text-muted` | `#909090` |
| Borders | `--border` | `#A8ACB3` |
| Borders | `--border-light` | `#3A3D42` |
| Accents | `--accent-blue` | `#0047AB` |
| Accents | `--accent-magenta` | `#FF1493` |
| Accents | `--accent-lime` | `#00FF41` |
| Accents | `--accent-orange` | `#FF7F27` |
| Accents | `--accent-warning` | `#FFB300` |
| Accents | `--accent-error` | `#FF5252` |
| Accents | `--accent-primary` | `var(--accent-lime)` (resolves to `#00FF41`) |
| Accents | `--accent-primary-rgb` | `0,255,65` |
| Graph | `--graph-pending` | `#6C757D` |
| Graph | `--graph-running` | `#FF9800` |
| Graph | `--graph-passed` | `#4CAF50` |
| Graph | `--graph-failed` | `#F44336` |
| Graph | `--graph-planning` | `#2196F3` |
| Graph | `--graph-gating` | `#9C27B0` |
| Elevation | `--shadow` | `3px 3px 0 rgba(224,224,224,.55)` |
| Elevation | `--pm6-rb-shadow-hard` | `3px 3px 0 rgba(224,224,224,.55)` |
| Elevation | `--elev-1` | `2px 2px 0 rgba(224,224,224,.40)` |
| Elevation | `--elev-2` | `3px 3px 0 rgba(224,224,224,.55)` |
| Elevation | `--elev-3` | `5px 5px 0 rgba(224,224,224,.55)` |
| Elevation | `--elev-hover` | `4px 4px 0 var(--accent-glow)` (runtime-derived in concept; precompute per F3-431) |
| Geometry | `--border-radius` | `0px` |
| Geometry | `--border-width` | `2px` |
| Geometry | `--border-width-inner` | `1px` |
| Geometry | `--radius-xs` | `2px` |
| Geometry | `--radius-sm` | `0px` |
| Geometry | `--radius-md` | `0px` |
| Geometry | `--radius-lg` | `0px` |
| Geometry | `--radius-xl` | `0px` |
| Geometry | `--radius-pill` | `2px` |
| Geometry | `--grid-gap` | `24px` |
| Motion | `--ease-default` | `var(--ease-snap)` (resolves to `cubic-bezier(.2,0,0,1)`) |
| Motion | `--motion-med` | `140ms` |
| Motion | `--sheen-dur` | `.35s` |
| Typography | `--display-font` | `'Orbitron', sans-serif` |
| Typography | `--display-font-sm` | `'Rajdhani', sans-serif` |
| Typography | `--body-font` | `'Rajdhani', sans-serif` |
| Typography | `--base-font-size` | `15px` |
| Typography | `--line-height` | `1.55` |
| Typography | `--letter-spacing` | not defined (inherits root: `normal`) |

#### retro-light (02-css-tokens.part.html:192-239)

| Group | Token | Value |
|---|---|---|
| Surfaces | `--background` | `#F5F0E8` |
| Surfaces | `--surface` | `#F5F0E8` |
| Surfaces | `--surface-elevated` | `#FAF7F2` |
| Surfaces | `--surface-alt` | not defined (friendly-only token; no root definition) |
| Text | `--text-primary` | `#1A1A1A` |
| Text | `--text-secondary` | `#444444` |
| Text | `--text-muted` | `#524F49` |
| Borders | `--border` | `#4A463F` |
| Borders | `--border-light` | `#D8D1C7` |
| Accents | `--accent-blue` | `#0047AB` |
| Accents | `--accent-magenta` | `#FF1493` |
| Accents | `--accent-lime` | `#00FF41` |
| Accents | `--accent-orange` | `#FF7F27` |
| Accents | `--accent-warning` | `#F57C00` |
| Accents | `--accent-error` | `#D32F2F` |
| Accents | `--accent-primary` | `var(--accent-blue)` (resolves to `#0047AB`) |
| Accents | `--accent-primary-rgb` | `0,71,171` |
| Graph | `--graph-pending` | `#ADB5BD` |
| Graph | `--graph-running` | `#FFB74D` |
| Graph | `--graph-passed` | `#66BB6A` |
| Graph | `--graph-failed` | `#EF5350` |
| Graph | `--graph-planning` | `#42A5F5` |
| Graph | `--graph-gating` | `#AB47BC` |
| Elevation | `--shadow` | `3px 3px 0 rgba(26,26,26,.30)` |
| Elevation | `--pm6-rb-shadow-hard` | `3px 3px 0 rgba(26,26,26,.30)` |
| Elevation | `--elev-1` | `2px 2px 0 rgba(26,26,26,.22)` |
| Elevation | `--elev-2` | `3px 3px 0 rgba(26,26,26,.30)` |
| Elevation | `--elev-3` | `5px 5px 0 rgba(26,26,26,.30)` |
| Elevation | `--elev-hover` | `4px 4px 0 var(--accent-glow)` (runtime-derived in concept; precompute per F3-431) |
| Geometry | `--border-radius` | `0px` |
| Geometry | `--border-width` | `2px` |
| Geometry | `--border-width-inner` | `1px` |
| Geometry | `--radius-xs` | `2px` |
| Geometry | `--radius-sm` | `0px` |
| Geometry | `--radius-md` | `0px` |
| Geometry | `--radius-lg` | `0px` |
| Geometry | `--radius-xl` | `0px` |
| Geometry | `--radius-pill` | `2px` |
| Geometry | `--grid-gap` | `24px` |
| Motion | `--ease-default` | `var(--ease-snap)` (resolves to `cubic-bezier(.2,0,0,1)`) |
| Motion | `--motion-med` | `140ms` |
| Motion | `--sheen-dur` | `.35s` |
| Typography | `--display-font` | `'Orbitron', sans-serif` |
| Typography | `--display-font-sm` | `'Rajdhani', sans-serif` |
| Typography | `--body-font` | `'Rajdhani', sans-serif` |
| Typography | `--base-font-size` | `15px` |
| Typography | `--line-height` | `1.55` |
| Typography | `--letter-spacing` | not defined (inherits root: `normal`) |

#### basic-light (02-css-tokens.part.html:244-286)

| Group | Token | Value |
|---|---|---|
| Surfaces | `--background` | `#EAECEF` |
| Surfaces | `--surface` | `#EAECEF` |
| Surfaces | `--surface-elevated` | `#FFFFFF` |
| Surfaces | `--surface-alt` | not defined (friendly-only token; no root definition) |
| Text | `--text-primary` | `#1A1A1A` |
| Text | `--text-secondary` | `#3B3B3B` |
| Text | `--text-muted` | `#5C6470` |
| Borders | `--border` | `#C4C4C4` |
| Borders | `--border-light` | `#E0E0E0` |
| Accents | `--accent-blue` | `#0056B3` |
| Accents | `--accent-magenta` | `#D32F2F` |
| Accents | `--accent-lime` | `#0B8043` |
| Accents | `--accent-orange` | `#E65100` |
| Accents | `--accent-warning` | `#E65100` |
| Accents | `--accent-error` | `#C62828` |
| Accents | `--accent-primary` | not defined (inherits root: `var(--accent-blue)`; resolves to `#0056B3` in this variant) |
| Accents | `--accent-primary-rgb` | `0,86,179` |
| Graph | `--graph-pending` | `#ADB5BD` |
| Graph | `--graph-running` | `#FF9800` |
| Graph | `--graph-passed` | `#4CAF50` |
| Graph | `--graph-failed` | `#F44336` |
| Graph | `--graph-planning` | `#2196F3` |
| Graph | `--graph-gating` | `#9C27B0` |
| Elevation | `--shadow` | `none` |
| Elevation | `--elev-1` | `0 1px 2px rgba(0,0,0,.08)` |
| Elevation | `--elev-2` | `0 2px 8px rgba(0,0,0,.10)` |
| Elevation | `--elev-3` | `0 6px 20px rgba(0,0,0,.14)` |
| Elevation | `--elev-hover` | `0 6px 18px var(--accent-glow)` (runtime-derived in concept; precompute per F3-431) |
| Geometry | `--border-radius` | `4px` |
| Geometry | `--border-width` | `1px` |
| Geometry | `--radius-xs` | `2px` |
| Geometry | `--radius-sm` | `4px` |
| Geometry | `--radius-md` | `6px` |
| Geometry | `--radius-lg` | `8px` |
| Geometry | `--radius-xl` | `10px` |
| Geometry | `--radius-pill` | not defined (inherits root: `999px`) |
| Geometry | `--grid-gap` | `24px` |
| Motion | `--ease-default` | `var(--ease-smooth)` (resolves to `cubic-bezier(.4,0,.2,1)`) |
| Motion | `--motion-med` | `200ms` |
| Motion | `--sheen-dur` | not defined (inherits root: `.6s`) |
| Typography | `--display-font` | `'Inter', system-ui, sans-serif` |
| Typography | `--body-font` | `'Inter', system-ui, sans-serif` |
| Typography | `--base-font-size` | `15px` |
| Typography | `--line-height` | `1.6` |
| Typography | `--letter-spacing` | `0.02em` |

#### basic-dark (02-css-tokens.part.html:291-333)

| Group | Token | Value |
|---|---|---|
| Surfaces | `--background` | `#121212` |
| Surfaces | `--surface` | `#1E1E1E` |
| Surfaces | `--surface-elevated` | `#2D2D2D` |
| Surfaces | `--surface-alt` | not defined (friendly-only token; no root definition) |
| Text | `--text-primary` | `#E8E8E8` |
| Text | `--text-secondary` | `#A0A0A0` |
| Text | `--text-muted` | `#6B7280` |
| Borders | `--border` | `#424242` |
| Borders | `--border-light` | `#333333` |
| Accents | `--accent-blue` | `#64B5F6` |
| Accents | `--accent-magenta` | `#FF69B4` |
| Accents | `--accent-lime` | `#3DD68C` |
| Accents | `--accent-orange` | `#FFA347` |
| Accents | `--accent-warning` | `#FFB74D` |
| Accents | `--accent-error` | `#EF5350` |
| Accents | `--accent-primary` | not defined (inherits root: `var(--accent-blue)`; resolves to `#64B5F6` in this variant) |
| Accents | `--accent-primary-rgb` | `100,181,246` |
| Graph | `--graph-pending` | `#6C757D` |
| Graph | `--graph-running` | `#FF9800` |
| Graph | `--graph-passed` | `#4CAF50` |
| Graph | `--graph-failed` | `#F44336` |
| Graph | `--graph-planning` | `#2196F3` |
| Graph | `--graph-gating` | `#9C27B0` |
| Elevation | `--shadow` | `none` |
| Elevation | `--elev-1` | `0 1px 2px rgba(0,0,0,.20)` |
| Elevation | `--elev-2` | `0 2px 8px rgba(0,0,0,.24)` |
| Elevation | `--elev-3` | `0 6px 20px rgba(0,0,0,.30)` |
| Elevation | `--elev-hover` | `0 6px 18px var(--accent-glow)` (runtime-derived in concept; precompute per F3-431) |
| Geometry | `--border-radius` | `4px` |
| Geometry | `--border-width` | `1px` |
| Geometry | `--radius-xs` | `2px` |
| Geometry | `--radius-sm` | `4px` |
| Geometry | `--radius-md` | `6px` |
| Geometry | `--radius-lg` | `8px` |
| Geometry | `--radius-xl` | `10px` |
| Geometry | `--radius-pill` | not defined (inherits root: `999px`) |
| Geometry | `--grid-gap` | `24px` |
| Motion | `--ease-default` | `var(--ease-smooth)` (resolves to `cubic-bezier(.4,0,.2,1)`) |
| Motion | `--motion-med` | `200ms` |
| Motion | `--sheen-dur` | not defined (inherits root: `.6s`) |
| Typography | `--display-font` | `'Inter', system-ui, sans-serif` |
| Typography | `--body-font` | `'Inter', system-ui, sans-serif` |
| Typography | `--base-font-size` | `15px` |
| Typography | `--line-height` | `1.6` |
| Typography | `--letter-spacing` | `0.02em` |

#### glass-dark (02-css-tokens.part.html:342-383)

| Group | Token | Value |
|---|---|---|
| Surfaces | `--background` | `#241B36` |
| Surfaces | `--surface` | `rgba(var(--glass-tint-rgb), var(--glass-alpha))` (runtime-derived in concept; precompute per F3-431) |
| Surfaces | `--surface-elevated` | `rgba(58,44,88, calc(var(--glass-alpha) + .08))` (runtime-derived in concept; precompute per F3-431) |
| Surfaces | `--surface-alt` | not defined at theme scope (glass sets `--surface-alt: transparent` locally on `.left-panel`; no root definition) |
| Text | `--text-primary` | `#EDE7F8` |
| Text | `--text-secondary` | `#CFC5E6` |
| Text | `--text-muted` | `rgba(237,231,248,.55)` |
| Borders | `--border` | `rgba(255,255,255,.14)` |
| Borders | `--border-light` | `rgba(255,255,255,.08)` |
| Accents | `--accent-blue` | `#B79CFF` |
| Accents | `--accent-magenta` | `#E58BC8` |
| Accents | `--accent-lime` | `#8FD9A5` |
| Accents | `--accent-orange` | `#F3B266` |
| Accents | `--accent-warning` | `#F6C888` |
| Accents | `--accent-error` | `#F0879B` |
| Accents | `--accent-primary` | not defined (inherits root: `var(--accent-blue)`; resolves to `#B79CFF` in this variant) |
| Accents | `--accent-primary-rgb` | `183,156,255` |
| Graph | `--graph-pending` | `rgba(207,197,230,.55)` |
| Graph | `--graph-running` | `#F3B266` |
| Graph | `--graph-passed` | `#8FD9A5` |
| Graph | `--graph-failed` | `#F0879B` |
| Graph | `--graph-planning` | `#93A2F2` |
| Graph | `--graph-gating` | `#E58BC8` |
| Elevation | `--shadow` | `0 8px 24px rgba(10,5,25,.45)` |
| Elevation | `--elev-1` | `0 2px 8px rgba(10,5,25,.35)` |
| Elevation | `--elev-2` | `0 8px 24px rgba(10,5,25,.45)` |
| Elevation | `--elev-3` | `0 16px 44px rgba(10,5,25,.55)` |
| Elevation | `--elev-hover` | not defined (inherits root: `0 10px 30px var(--accent-glow)`; runtime-derived in concept; precompute per F3-431) |
| Geometry | `--border-radius` | `14px` |
| Geometry | `--border-width` | `0px` |
| Geometry | `--radius-xs` | not defined (inherits root: `2px`) |
| Geometry | `--radius-sm` | not defined (inherits root: `6px`) |
| Geometry | `--radius-md` | not defined (inherits root: `10px`) |
| Geometry | `--radius-lg` | not defined (inherits root: `16px`) |
| Geometry | `--radius-xl` | not defined (inherits root: `22px`) |
| Geometry | `--radius-pill` | not defined (inherits root: `999px`) |
| Geometry | `--grid-gap` | `24px` |
| Motion | `--ease-default` | `var(--ease-out)` (resolves to `cubic-bezier(.22,1,.36,1)`) |
| Motion | `--motion-med` | `320ms` |
| Motion | `--sheen-dur` | `.7s` |
| Typography | `--display-font` | `'Inter', system-ui, sans-serif` |
| Typography | `--body-font` | `'Inter', system-ui, sans-serif` |
| Typography | `--base-font-size` | `14px` |
| Typography | `--line-height` | `1.5` |
| Typography | `--letter-spacing` | `0.01em` |

#### glass-light (02-css-tokens.part.html:385-426)

| Group | Token | Value |
|---|---|---|
| Surfaces | `--background` | `#E4CDE4` |
| Surfaces | `--surface` | `rgba(var(--glass-tint-rgb), var(--glass-alpha))` (runtime-derived in concept; precompute per F3-431) |
| Surfaces | `--surface-elevated` | `rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) + .18))` (runtime-derived in concept; precompute per F3-431) |
| Surfaces | `--surface-alt` | not defined at theme scope (glass sets `--surface-alt: transparent` locally on `.left-panel`; no root definition) |
| Text | `--text-primary` | `#453A5C` |
| Text | `--text-secondary` | `rgba(69,58,92,.75)` |
| Text | `--text-muted` | `rgba(69,58,92,.55)` |
| Borders | `--border` | `rgba(69,58,92,.16)` |
| Borders | `--border-light` | `rgba(69,58,92,.09)` |
| Accents | `--accent-blue` | `#8B6ED9` |
| Accents | `--accent-magenta` | `#C167B4` |
| Accents | `--accent-lime` | `#3E7D4E` |
| Accents | `--accent-orange` | `#B26A2A` |
| Accents | `--accent-warning` | `#8F6410` |
| Accents | `--accent-error` | `#C0566B` |
| Accents | `--accent-primary` | not defined (inherits root: `var(--accent-blue)`; resolves to `#8B6ED9` in this variant) |
| Accents | `--accent-primary-rgb` | `139,110,217` |
| Graph | `--graph-pending` | `rgba(69,58,92,.40)` |
| Graph | `--graph-running` | `#B26A2A` |
| Graph | `--graph-passed` | `#3E7D4E` |
| Graph | `--graph-failed` | `#C0566B` |
| Graph | `--graph-planning` | `#7E8BE0` |
| Graph | `--graph-gating` | `#C167B4` |
| Elevation | `--shadow` | `0 8px 24px rgba(93,63,133,.16)` |
| Elevation | `--elev-1` | `0 2px 8px rgba(93,63,133,.10)` |
| Elevation | `--elev-2` | `0 8px 24px rgba(93,63,133,.16)` |
| Elevation | `--elev-3` | `0 16px 44px rgba(93,63,133,.22)` |
| Elevation | `--elev-hover` | not defined (inherits root: `0 10px 30px var(--accent-glow)`; runtime-derived in concept; precompute per F3-431) |
| Geometry | `--border-radius` | `14px` |
| Geometry | `--border-width` | `0px` |
| Geometry | `--radius-xs` | not defined (inherits root: `2px`) |
| Geometry | `--radius-sm` | not defined (inherits root: `6px`) |
| Geometry | `--radius-md` | not defined (inherits root: `10px`) |
| Geometry | `--radius-lg` | not defined (inherits root: `16px`) |
| Geometry | `--radius-xl` | not defined (inherits root: `22px`) |
| Geometry | `--radius-pill` | not defined (inherits root: `999px`) |
| Geometry | `--grid-gap` | `20px` |
| Motion | `--ease-default` | `var(--ease-out)` (resolves to `cubic-bezier(.22,1,.36,1)`) |
| Motion | `--motion-med` | `320ms` |
| Motion | `--sheen-dur` | `.7s` |
| Typography | `--display-font` | `'Inter', system-ui, sans-serif` |
| Typography | `--body-font` | `'Inter', system-ui, sans-serif` |
| Typography | `--base-font-size` | `14px` |
| Typography | `--line-height` | `1.5` |
| Typography | `--letter-spacing` | `0.01em` |

#### friendly-dark (default; 02-css-tokens.part.html:436-493)

| Group | Token | Value |
|---|---|---|
| Surfaces | `--background` | `#211E26` |
| Surfaces | `--surface` | `#2A2731` |
| Surfaces | `--surface-elevated` | `#322E3A` |
| Surfaces | `--surface-alt` | `#262330` |
| Text | `--text-primary` | `#F0EDF4` |
| Text | `--text-secondary` | `#B4AEBE` |
| Text | `--text-muted` | `#8A8494` |
| Borders | `--border` | `rgba(240,237,244,.10)` |
| Borders | `--border-light` | `rgba(240,237,244,.06)` |
| Accents | `--accent-blue` | `#6FC6E8` |
| Accents | `--accent-magenta` | `#C3B1E4` |
| Accents | `--accent-lime` | `#6FDABC` |
| Accents | `--accent-orange` | `#FFAD93` |
| Accents | `--accent-warning` | `#FFD97F` |
| Accents | `--accent-error` | `#FF8A73` |
| Accents | `--accent-primary` | not defined (inherits root: `var(--accent-blue)`; resolves to `#6FC6E8` in this variant) |
| Accents | `--accent-primary-rgb` | `111,198,232` |
| Graph | `--graph-pending` | `#8A8494` |
| Graph | `--graph-running` | `#FFAD93` |
| Graph | `--graph-passed` | `#6FDABC` |
| Graph | `--graph-failed` | `#FF8A73` |
| Graph | `--graph-planning` | `#6FC6E8` |
| Graph | `--graph-gating` | `#C3B1E4` |
| Elevation | `--shadow` | `0 2px 6px rgba(0,0,0,.30), 0 10px 24px rgba(0,0,0,.22)` |
| Elevation | `--elev-1` | `0 1px 3px rgba(0,0,0,.26)` |
| Elevation | `--elev-2` | `0 2px 6px rgba(0,0,0,.30), 0 10px 24px rgba(0,0,0,.22)` |
| Elevation | `--elev-3` | `0 14px 40px rgba(0,0,0,.34)` |
| Elevation | `--elev-hover` | `0 12px 30px rgba(111,198,232,.20)` |
| Geometry | `--border-radius` | `14px` |
| Geometry | `--border-width` | `1px` |
| Geometry | `--radius-xs` | not defined (inherits root: `2px`) |
| Geometry | `--radius-sm` | not defined (inherits root: `6px`) |
| Geometry | `--radius-md` | `14px` |
| Geometry | `--radius-lg` | `20px` |
| Geometry | `--radius-xl` | not defined (inherits root: `22px`) |
| Geometry | `--radius-pill` | not defined (inherits root: `999px`) |
| Geometry | `--grid-gap` | `20px` |
| Motion | `--ease-default` | `var(--ease-spring)` (resolves to `cubic-bezier(.34,1.56,.64,1)`) |
| Motion | `--motion-med` | `260ms` |
| Motion | `--sheen-dur` | `.55s` |
| Typography | `--display-font` | `'Cal Sans', 'Nunito', system-ui, sans-serif` |
| Typography | `--body-font` | `'Quicksand', 'Nunito', system-ui, sans-serif` |
| Typography | `--base-font-size` | `14.5px` |
| Typography | `--line-height` | `1.55` |
| Typography | `--letter-spacing` | `normal` |

#### friendly-light (02-css-tokens.part.html:495-552)

| Group | Token | Value |
|---|---|---|
| Surfaces | `--background` | `#FBF7F3` |
| Surfaces | `--surface` | `#FFFFFF` |
| Surfaces | `--surface-elevated` | `#FFFFFF` |
| Surfaces | `--surface-alt` | `#F5EFEA` |
| Text | `--text-primary` | `#4A4550` |
| Text | `--text-secondary` | `#6B6473` |
| Text | `--text-muted` | `#9A93A0` |
| Borders | `--border` | `#E4DCEA` |
| Borders | `--border-light` | `#EFEAF3` |
| Accents | `--accent-blue` | `#3F9CC7` |
| Accents | `--accent-magenta` | `#9678C9` |
| Accents | `--accent-lime` | `#2FA183` |
| Accents | `--accent-orange` | `#F07A55` |
| Accents | `--accent-warning` | `#D9A62A` |
| Accents | `--accent-error` | `#E8654C` |
| Accents | `--accent-primary` | not defined (inherits root: `var(--accent-blue)`; resolves to `#3F9CC7` in this variant) |
| Accents | `--accent-primary-rgb` | `63,156,199` |
| Graph | `--graph-pending` | `#9A93A0` |
| Graph | `--graph-running` | `#F07A55` |
| Graph | `--graph-passed` | `#2FA183` |
| Graph | `--graph-failed` | `#E8654C` |
| Graph | `--graph-planning` | `#3F9CC7` |
| Graph | `--graph-gating` | `#9678C9` |
| Elevation | `--shadow` | `0 4px 16px rgba(122,109,140,.12)` |
| Elevation | `--elev-1` | `0 2px 8px rgba(122,109,140,.10)` |
| Elevation | `--elev-2` | `0 4px 16px rgba(122,109,140,.12)` |
| Elevation | `--elev-3` | `0 14px 40px rgba(122,109,140,.20)` |
| Elevation | `--elev-hover` | `0 10px 26px rgba(90,185,224,.25)` |
| Geometry | `--border-radius` | `14px` |
| Geometry | `--border-width` | `1px` |
| Geometry | `--radius-xs` | not defined (inherits root: `2px`) |
| Geometry | `--radius-sm` | not defined (inherits root: `6px`) |
| Geometry | `--radius-md` | `14px` |
| Geometry | `--radius-lg` | `20px` |
| Geometry | `--radius-xl` | not defined (inherits root: `22px`) |
| Geometry | `--radius-pill` | not defined (inherits root: `999px`) |
| Geometry | `--grid-gap` | `20px` |
| Motion | `--ease-default` | `var(--ease-spring)` (resolves to `cubic-bezier(.34,1.56,.64,1)`) |
| Motion | `--motion-med` | `260ms` |
| Motion | `--sheen-dur` | `.55s` |
| Typography | `--display-font` | `'Cal Sans', 'Nunito', system-ui, sans-serif` |
| Typography | `--body-font` | `'Quicksand', 'Nunito', system-ui, sans-serif` |
| Typography | `--base-font-size` | `14.5px` |
| Typography | `--line-height` | `1.55` |
| Typography | `--letter-spacing` | `normal` |

#### Diff-tint variables per variant (04-css-glass-b.part.html:138-192)

The concept defines seven diff-tint custom properties per variant for six variants. Friendly variants define none; friendly editors resolve through the consumer fallback constants baked into the `var()` second arguments at `Concepts/pm6-build/parts/07-css-components-b.part.html:3-29`, which equal the basic-dark values.

| Token | retro-dark | retro-light | basic-light | basic-dark | glass-dark | glass-light | friendly-dark | friendly-light |
|---|---|---|---|---|---|---|---|---|
| `--diff-added-bg` | `rgba(0,255,65,0.06)` | `rgba(0,200,50,0.08)` | `rgba(11,128,67,0.06)` | `rgba(61,214,140,0.07)` | `rgba(143,217,165,0.08)` | `rgba(62,125,78,0.06)` | not defined (consumer fallback `rgba(61,214,140,0.07)`) | not defined (consumer fallback `rgba(61,214,140,0.07)`) |
| `--diff-modified-bg` | `rgba(0,71,171,0.10)` | `rgba(0,71,171,0.06)` | `rgba(0,86,179,0.05)` | `rgba(100,181,246,0.07)` | `rgba(147,162,242,0.08)` | `rgba(126,139,224,0.08)` | not defined (consumer fallback `rgba(100,181,246,0.07)`) | not defined (consumer fallback `rgba(100,181,246,0.07)`) |
| `--diff-deleted-bg` | `rgba(255,20,147,0.06)` | `rgba(255,20,147,0.06)` | `rgba(211,47,47,0.05)` | `rgba(255,105,180,0.06)` | `rgba(229,139,200,0.06)` | `rgba(193,103,180,0.06)` | not defined (consumer fallback `rgba(255,105,180,0.06)`) | not defined (consumer fallback `rgba(255,105,180,0.06)`) |
| `--diff-conflict-bg` | `rgba(255,127,39,0.08)` | `rgba(255,127,39,0.07)` | `rgba(230,81,0,0.06)` | `rgba(255,163,71,0.08)` | `rgba(243,178,102,0.08)` | `rgba(178,106,42,0.06)` | not defined (consumer fallback `rgba(255,163,71,0.08)`) | not defined (consumer fallback `rgba(255,163,71,0.08)`) |
| `--diff-added-flash-bg` | `rgba(0,255,65,0.18)` | `rgba(0,200,50,0.2)` | `rgba(11,128,67,0.16)` | `rgba(61,214,140,0.18)` | `rgba(143,217,165,0.22)` | `rgba(62,125,78,0.16)` | not defined (consumer fallback `rgba(61,214,140,0.18)`) | not defined (consumer fallback `rgba(61,214,140,0.18)`) |
| `--diff-modified-flash-bg` | `rgba(0,71,171,0.22)` | `rgba(0,71,171,0.16)` | `rgba(0,86,179,0.14)` | `rgba(100,181,246,0.18)` | `rgba(147,162,242,0.22)` | `rgba(126,139,224,0.18)` | not defined (consumer fallback `rgba(100,181,246,0.18)`) | not defined (consumer fallback `rgba(100,181,246,0.18)`) |
| `--diff-conflict-flash-bg` | `rgba(255,127,39,0.2)` | `rgba(255,127,39,0.18)` | `rgba(230,81,0,0.16)` | `rgba(255,163,71,0.2)` | `rgba(243,178,102,0.22)` | `rgba(178,106,42,0.16)` | not defined (consumer fallback `rgba(255,163,71,0.2)`) | not defined (consumer fallback `rgba(255,163,71,0.2)`) |

Companion editor treatments carried in the same span (04-css-glass-b.part.html:144-196), for completeness of the :138-196 extraction:

| Family scope | Rule | Value |
|---|---|---|
| glass-dark | `.editor-minimap` | `background: rgba(16,10,32,0.5); border-left: 1px solid rgba(255,255,255,0.04);` |
| glass-dark | `.minimap-heat-strip` | `box-shadow: none;` |
| glass-dark | `.minimap-viewport` | `background: rgba(183,156,255,0.06); border-color: rgba(183,156,255,0.15);` |
| glass-dark | `.cursor-line-highlight` | `background: rgba(183,156,255,0.04);` |
| glass-light | `.editor-minimap` | `background: rgba(255,255,255,0.6); border-left: 1px solid rgba(69,58,92,0.08);` |
| glass-light | `.minimap-heat-strip` | `opacity: 0.7;` |
| glass-light | `.minimap-viewport` | `background: rgba(139,110,217,0.08); border-color: rgba(139,110,217,0.18);` |
| retro (both) | `.editor-minimap` | `background: var(--surface); border-left: 2px solid var(--border-light);` |
| retro (both) | `.minimap-viewport` | `border: 1px solid var(--accent-lime); background: rgba(0,255,65,0.04); border-radius: 0;` |
| retro (both) | `.minimap-heat-strip` | `border-radius: 0; width: 4px;` |
| retro (both) | `.editor-tabs .tab.active::after` | `background: var(--accent-lime);` |
| basic (both) | `.editor-minimap` | `background: var(--surface-elevated);` |
| basic (both) | `.minimap-viewport` | `background: rgba(100,181,246,0.06); border-color: rgba(100,181,246,0.15);` |
| basic (both) | `.minimap-heat-strip` | `border-radius: 2px;` |

#### Glass composition constants (03-css-glass-a.part.html:19-49; 04-css-glass-b.part.html:11-56; 29-js-settings-engine.part.html:60-63, 80-86)

| Constant | glass-dark | glass-light |
|---|---|---|
| `--glass-tint-rgb` | `46, 34, 72` | `246, 240, 255` |
| `--glass-alpha` default | `.60` | `.55` |
| Alpha clamp (settings engine `alphaBounds()`) | lo `0.35`, hi `0.85` | lo `0.45`, hi `0.88` |
| Alpha parse fallback when persisted value is not a number | `0.55` | `0.55` |
| `--glass-edge` | `rgba(255, 255, 255, .40)` | `rgba(255, 255, 255, .95)` |
| `--glass-hairline` | `rgba(255, 255, 255, .16)` | `rgba(255, 255, 255, .55)` |
| `--pm6-glass-a-rgb` | `183, 156, 255` (violet identity) | `139, 110, 217` (violet identity) |
| `--pm6-glass-b-rgb` | `229, 139, 200` (dusk-pink identity) | `193, 103, 180` (orchid identity) |
| `--pm6-glass-sat` | `1.6` | `1.6` |
| `--pm6-glass-floor` | `rgba(255, 255, 255, .10)` | `rgba(255, 255, 255, .45)` |
| `--pm6-glass-drop` | `0 12px 30px rgba(10, 5, 25, .45)` | `0 10px 28px rgba(93, 63, 133, .18)` |
| `--pm6-glass-pane-edge` | `rgba(255, 255, 255, .28)` | `rgba(255, 255, 255, .75)` |
| `--pm6-glass-pane-k1` | `.73` | `.62` |
| `--pm6-glass-pane-k2` | `.57` | `.36` |
| `--pm6-glass-pane-k3` | `.67` | `.47` |
| `--pm6-glass-pane-shadow` | `rgba(10, 5, 25, .60)` | `rgba(93, 63, 133, .35)` |
| `--pm6-glass-pane-shadow2` | `rgba(10, 5, 25, .40)` | `rgba(93, 63, 133, .22)` |
| `--pm6-glass-pane-sheen` | `rgba(255, 255, 255, .16)` | `rgba(255, 255, 255, .50)` |
| `--pm6-glass-pane-sheen2` | `rgba(255, 255, 255, .08)` | `rgba(255, 255, 255, .25)` |
| `--pm6-glass-inset` (sky ring around the pane; family-scoped) | `5px` | `5px` |
| `--pm6-glass-step-1` | `rgba(255, 255, 255, calc(var(--glass-alpha) * .10))` (runtime-derived in concept; precompute per F3-431) | `rgba(255, 255, 255, calc(var(--glass-alpha) * .25))` (runtime-derived in concept; precompute per F3-431) |
| `--pm6-glass-step-2` | `rgba(255, 255, 255, calc(var(--glass-alpha) * .16))` (runtime-derived in concept; precompute per F3-431) | `rgba(255, 255, 255, calc(var(--glass-alpha) * .55))` (runtime-derived in concept; precompute per F3-431) |
| `--pm6-glass-step-3` | `rgba(255, 255, 255, calc(var(--glass-alpha) * .28))` (runtime-derived in concept; precompute per F3-431) | `rgba(255, 255, 255, calc(var(--glass-alpha) * 1.1))` (runtime-derived in concept; precompute per F3-431) |
| `--pm6-glass-plate` | `rgba(16, 10, 32, calc(.35 + var(--glass-alpha) * .78))` (runtime-derived in concept; precompute per F3-431) | `rgba(255, 255, 255, calc(.42 + var(--glass-alpha) * .87))` (runtime-derived in concept; precompute per F3-431) |
| Pane fill gradient | `linear-gradient(165deg, rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) * var(--pm6-glass-pane-k1))), rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) * var(--pm6-glass-pane-k2))) 40%, rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) * var(--pm6-glass-pane-k3))))` (runtime-derived in concept; precompute per F3-431) | same formula with the glass-light tint, alpha, and k-factors (runtime-derived in concept; precompute per F3-431) |
| In-viewport backdrop blur (app shell and floating chat) | `blur(34px) saturate(160%)` | `blur(34px) saturate(160%)` |

#### Backdrop-filter budget (F3-431 enumeration)

| Scope | Surface | Filter | Concept source |
|---|---|---|---|
| Glass themes | `.app-shell` | `blur(34px) saturate(160%)` | 03-css-glass-a.part.html:71-72 |
| Glass themes | `.floating-chat` | `blur(34px) saturate(160%)` | 03-css-glass-a.part.html:148-149 |
| Friendly themes | `.title-bar` | `blur(14px)` | 10x-pm6-css-global.part.html:155-156 |
| Friendly themes | `.status-bar` | `blur(14px)` | 10x-pm6-css-global.part.html:164-165 |
| Friendly themes | `.bottom-panel` | `blur(14px)` | 10x-pm6-css-global.part.html:172-173 |
| Settings modal (all themes) | `.s4-bloom-backdrop` scrim | `blur(6px)` | 10-css-settings.part.html:585-586 |
| Settings modal (glass themes) | `.s4-panel`, `.s4-psm` slabs | `blur(34px) saturate(160%)` | 10-css-settings.part.html:933-934 |

#### Glass background mode layer inventory (02-css-tokens.part.html:554-733; baked per F3-431)

| Mode | Layers | Layer blur | Drift and parallax | Baked per F3-431 |
|---|---|---|---|---|
| `mesh` (default) | One cloudscape layer `.pm6-gbg-mesh-layer` (inset `-8%`): base sky gradient stack plus one billow `::before` layer | `blur(14px) saturate(1.15)` dark, `blur(14px) saturate(1.12)` light | One transform-only drift, `pm-sky-drift 140s ease-in-out infinite alternate` to `translate3d(-1.6%, 1.1%, 0) scale(1.05)` | One pre-blurred bitmap per variant |
| `depth` | Container carries the base sky plus blur; two parallax wrappers `.pm6-par-far` and `.pm6-par-near` (inset `-8%`); far wrapper `::before` billow layer; six cloud puffs `.pm6-gbg-shape` (three far, three near) | `blur(14px) saturate(1.15)` dark, `blur(14px) saturate(1.12)` light (on the container) | Far billow drift `pm-sky-drift 160s`; puff float `pm-float` with per-shape `--float-dur` of `100s`, `84s`, `72s` (far) and `68s`, `76s`, `64s` (near); pointer parallax `translate3d(calc(var(--par-x, 0) * 4px), calc(var(--par-y, 0) * 2px), 0)` far and `translate3d(calc(var(--par-x, 0) * 10px), calc(var(--par-y, 0) * 6px), 0)` near; all killed under reduced motion | Base sky, far billow layer, and near puff layer baked as separate pre-blurred bitmaps so `--par-x`/`--par-y` offsets still apply per layer |
| `minimal` | Base gradient sky only (`.pm6-gbg-minimal`), no billow layers | none (static gradients, no filter) | none (static) | One flat gradient bitmap per variant |

#### Friendly cozy pastel hooks (02-css-tokens.part.html:477-492, 536-551)

| Token | friendly-dark | friendly-light |
|---|---|---|
| `--pm6-cozy-mint` | `#6FDABC` | `#5FD0B0` |
| `--pm6-cozy-sky` | `#6FC6E8` | `#5AB9E0` |
| `--pm6-cozy-coral` | `#FFAD93` | `#FF9E80` |
| `--pm6-cozy-lav` | `#C3B1E4` | `#B39DDB` |
| `--pm6-cozy-butter` | `#FFD97F` | `#FFD166` |
| `--pm6-cozy-card-base` | `#2A2731` | `#FFFFFF` |
| `--pm6-cozy-mix` | `14%` | `11%` |
| `--pm6-cozy-border-mix` | `34%` | `30%` |
| `--pm6-cozy-chrome` | `rgba(40,36,48,.60)` | `rgba(255,255,255,.65)` |
| `--pm6-cozy-chrome-border` | `rgba(255,255,255,.08)` | `rgba(255,255,255,.85)` |
| `--pm6-cozy-field` | `rgba(255,255,255,.06)` | `rgba(255,255,255,.70)` |
| `--pm6-cozy-dot` | `rgba(190,180,210,.06)` | `rgba(122,109,140,.10)` |
| `--pm6-cozy-glow-mint` | `rgba(95,208,176,.10)` | `rgba(95,208,176,.16)` |
| `--pm6-cozy-glow-lav` | `rgba(179,157,219,.12)` | `rgba(179,157,219,.18)` |
| `--pm6-cozy-glow-sky` | `rgba(90,185,224,.09)` | `rgba(90,185,224,.14)` |

The friendly ground (10x-pm6-css-global.part.html:139-147) composes the dot grid as `radial-gradient(var(--pm6-cozy-dot) 1px, transparent 1.5px) 0 0 / 18px 18px` over three pastel corner glows and `var(--background)`; the dot-grid tile size `18px` is the F3-430 preserved token. Category pastels are consumed via `color-mix()` against `--pm6-cozy-card-base` with `--pm6-cozy-mix` and `--pm6-cozy-border-mix` ratios (runtime-derived in concept; precompute per F3-431).
