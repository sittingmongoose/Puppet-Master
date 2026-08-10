# PMConcept7 — Left-Panel Redesign Prototypes

Six distinct design directions for the seven overcrowded left-side panels of PMConcept7 (Search, Source Control, GitHub Actions, Docker Manager, Testing, Agents, Runtime Artifacts). Each design is applied to all seven panels; a live picker lets you compare them head-to-head across all 8 themes and at min/default/max panel widths.

Open **`index.html`** in a browser.

> Run a local server if fonts/menus act oddly with `file://`:
> ```sh
> cd Concepts/pm7-panel-protos && python3 -m http.server 8765
> # then open http://localhost:8765/index.html
> ```

---

## Why this exists

The current left panels (`Concepts/pm6-build/parts/12-html-side-panels.part.html`) are overcrowded: stacked accordions, border-on-border nested cards, text that spills, controls that don't line up. The hard constraint is the **220px minimum panel width** (the `.side-panel-slot` resize floor; usable interior ≈ 140px after the 72px activity bar). This prototype explores six genuinely different spatial philosophies for fitting dense information into that narrow column.

## The six designs

| | ID | Name | Philosophy | Best for |
|---|---|---|---|---|
| **A** | A | **Progressive Reveal** | One primary action + compact list at rest; everything else collapses into "show more" disclosures. Resting state is minimal. | Default, all-purpose |
| **B** | B | **Segmented Sub-nav** | A pill segmented control picks the sub-view; only that view renders. Eliminates accordion stacking. | Many peer sub-sections (Source, Docker) |
| **C** | C | **Command-Rail** | Every row is a strict 2-column: fixed 26px icon/status gutter + flexing text column. Never a third column. | Power users, dense lists |
| **D** | D | **Vertical Timeline** | A status spine down the left edge; each entry is a node + card. Ordered by time/lineage. | History, runs, artifacts, agents |
| **E** | E | **Dense KV Grid** | Maximum density, minimal chrome — hairline dividers instead of boxes, monospace-aligned KV rows. | Terminal/IDE-inspector feel |
| **F** | F | **Floating Cards** | The anti-cramped option — detached rounded cards with breathing room, one concept per card. | Calm, premium, friendly/glass themes |

They span the full density spectrum (E densest → F airiest) so you can pick a direction to carry forward.

## The controls

The floating bar at the bottom:

- **Design** (A–F) — switch design direction. Keys: `[` `]`
- **Panel** (Sch/Src/Act/Dkr/Tst/Agt/Art) — switch which of the 7 panels is shown. Keys: `,` `.`
- **Width** (220 / 260 / 320 / 480) — set the left-panel width. 220 = min floor, 260 = default, 480 = max.
- **Density** (Sparse / Realistic / Extreme) — **content volume**. Sparse = calm day (the volume the original concept ships with). Realistic = a normal session (2–3x). Extreme = the nightmare volume that broke the old panels: 47 search hits across 14 files, 18 staged + 12 unstaged changes, 60 test sessions, 32 artifacts, 18 containers, 9 agents. **Use Extreme to stress-test the designs — this is where the old UI fell apart.** Key: `d` to cycle.
- **Theme** (top-right, the sun icon) — the PM sprout menu, all 8 themes. (This menu is itself one of the components being prototyped.)

> **Tip:** to see crowding behavior at its worst, set Density = Extreme, Width = 220, and flip through the designs on the Source and Artifacts panels.

## Honest assessment (which designs are actually good for this constraint)

All six pass the hard constraints, but they are **not equally well-suited** to a 220px panel at extreme volume. Ranked by how well they solve the actual problem:

**Strongest — these scale gracefully to nightmare volume:**
- **C (Command-Rail)** — the fixed-gutter + flexing-text discipline handles any list length cleanly; the most "real product" of the six. Best default if you want one direction.
- **A (Progressive)** — the disclosure pattern is purpose-built for narrow panels: collapses 30 changes into sections, expands on demand. Hides complexity well.

**Middle — good but with caveats:**
- **B (Segmented)** — eliminates accordion stacking (great for Docker/Source's many sub-sections), but 6 segments eat vertical space at 220px before any content shows.
- **E (Dense KV)** — highest density, fits the most rows; risk is the all-hairline look can read as flat/cheap and is harder to scan than it looks.

**Weakest for this specific constraint:**
- **F (Floating)** — the breathing-room aesthetic *fights* the constraint; at extreme volume it's a long scroll of pretty cards. Lovely at Sparse, wrong tool for crowding.
- **D (Timeline)** — wonderful for History/Runs/Artifacts (genuinely the best of the six on those), but forcing Docker containers and Tests onto a timeline is artificial, and the spine eats ~22px of an already-narrow column.

**Recommendation:** carry **C** or **A** forward as the base, and steal D's timeline treatment specifically for the History/Artifacts/Agents sub-views where time is the natural axis. The segmented control from B is also worth keeping as a sub-view switcher within C or A.

## Hard constraints honored (non-negotiable)

1. **No native OS menus.** No `<select>`, `<dialog>`, `confirm()`/`prompt()`/`alert()`, or native `oncontextmenu`. The PM "sprout" popout menu (`.pm6-tb-menu-wrap` + `PROTO_SPROUT` engine in `js/proto-sprout.js`) is used everywhere a dropdown is needed — Search scope, Source branch, etc. See `NATIVE_MENU_AUDIT.md` for the full app-wide catalogue of native menus to replace.
2. **No emojis.** SVG icons only.
3. **Survives 220px** across all 8 themes. Verified: zero horizontal overflow on every panel at every theme at the 220px floor (worst cases: `retro-dark` 2px borders, `glass-dark` 14px radius + translucent fills).
4. **Theme-appropriate.** Every design consumes CSS custom properties from `css/proto-tokens.css`; nothing is hardcoded. Themes change radius (`--radius-*`), border width (`--border-width`), grid gap, fonts, and (glass) translucency — the designs adapt.
5. **Slint 1.17.1 compatible** in spirit. Layouts use flexbox columns/rows (→ Slint `ColumnLayout`/`RowLayout`), standard `border-radius`/`box-shadow`/`transform`/`transition`. Avoided: `:has()`, `clamp()`, `aspect-ratio`, complex `backdrop-filter`. See "Slint notes" below.

## File structure

```
pm7-panel-protos/
├── index.html                      entry — the app shell + pickers
├── README.md                       this file
├── NATIVE_MENU_AUDIT.md            file:line catalogue of native OS menus app-wide
├── SUBAGENT_BRIEF.md               the spec each design was built against
├── css/
│   ├── proto-tokens.css            PM design tokens + all 8 themes (extracted from part 02)
│   ├── proto-sprout-menu.css       the PM sprout popout menu (extracted from part 10x-css-chat)
│   ├── proto-shell.css             title bar, activity bar, center stage, panel slot, controls bar
│   └── proto-polish.css            shared motion/hover polish (entrance, stagger, disclosures, pulse)
├── js/
│   ├── proto-data.js               static sample data for all 7 panels (PROTO_DATA)
│   ├── proto-theme.js              PM theme engine — data-theme switch, 8 themes (PROTO_THEME)
│   ├── proto-sprout.js             sprout menu engine — open/close/sprout-anchor (PROTO_SPROUT)
│   └── proto-picker.js             design/panel/width orchestration (PROTO_PICKER)
└── designs/
    ├── A-progressive/{design.css, design.js}
    ├── B-segmented/{design.css, design.js}
    ├── C-command-rail/{design.css, design.js}
    ├── D-timeline/{design.css, design.js}
    ├── E-dense-kv/{design.css, design.js}
    └── F-floating/{design.css, design.js}
└── screenshots/                   captured states (sparse + extreme density, multiple themes/widths)
```

The sample data lives in `js/proto-data.js` and has three tiers selected by `PROTO_DATA.setDensity('sparse'|'realistic'|'extreme')`. The Extreme tier is generated by `genExtreme()` — it deep-clones the sparse data and explodes every list to nightmare volumes with realistic long content (long code lines that must wrap/truncate, long branch names, long image tags). This is what stress-tests the layouts.

Each design registers itself as `window.PROTO_DESIGNS.<ID> = { id, name, render(panelId) }`. The picker lazy-loads a design's CSS+JS on first selection, then calls `render(panelId)` to produce the panel HTML.

## Data model

`js/proto-data.js` (`window.PROTO_DATA`) is the single source of sample data — one object per panel (`search`, `source`, `actions`, `docker`, `tests`, `agents`, `artifacts`). It's faithful to the canonical concept markup (`12-html-side-panels.part.html`) and the Plans feature requirements. Every design renders the **same** data, so you're comparing layouts, not content.

## Slint notes (for the eventual port)

This HTML prototype is a design exploration. When porting the chosen direction to Slint 1.17.1:

- **Tokens** → a `Theme` enum + a global `palette` struct bound to root-level properties. The 8 `[data-theme="..."]` blocks become 8 enum variants setting the palette. `color-mix()` expressions must be **precomputed** to solid color values (Slint has no runtime color-mix); bake them per-theme.
- **Layout** → `ColumnLayout` / `RowLayout` / `GridLayout` mirror the flexbox used here. `min-width:0` flex children → Slint `min-width: 0px` on the layout children to allow shrinking.
- **Truncation** → `Text { overflow: elide; horizontal-alignment: right; }` mirrors `text-overflow:ellipsis`.
- **Sprout menu** → a `PopupWindow` (or a `Window` with `visible` binding) with a springy scale animation via a `states` block + `animate`. Corner-anchored grow origin = animate `scale` from a `scale-origin` point. Click-away/Escape = focus handling on the popup.
- **Themes changing radius/spacing** → these are just properties the components bind to (`border-radius: root.radius-md;`), exactly as the CSS variables do.
- **Glass theme** → `backdrop-filter` is unsupported in Slint. Approximate with a translucent solid background color (the prototype already does this for the glass themes — see `proto-tokens.css` glass blocks where `--surface` is `rgba(...)` rather than a backdrop-filter chain).
- **8-theme spacing check** → re-run the verification logic (see "Verification" below) against the Slint build; the 220px floor + retro's 2px borders + glass's radius are the stress cases.

## Verification

The prototype was verified at **two** density tiers (Sparse and Extreme):

- **Overflow (Sparse):** 1344 automated checks = 6 designs × 7 panels × 4 widths × 8 themes. **0 failures** (0 native menus, 0 emojis).
- **Overflow (Extreme):** the same 1344-check matrix re-run with the nightmare data volumes (47 search hits, 18+12 changes, 60 test sessions, 32 artifacts, 18 containers). **0 failures** — every design holds at maximum crowding + minimum width. This is the test the *original* concept couldn't pass; the redesigns can because there are no content caps hiding crowding and all rows truncate.
- **Sprout menus:** open/close with the spring animation, anchor to the trigger's nearest corner, single-select updates the trigger label, click-away + Escape close.
- **Theme switch:** all 8 themes apply via `data-theme`; fonts, colors, radius, and border-width all change; layouts hold.
- **Motion:** entrance fade+rise on render, staggered row cascade (capped at 10), animated disclosure heights (grid-rows 0fr→1fr), running-status pulse ring, hover lift on cards, focus-visible rings. All motion respects `prefers-reduced-motion` and the `data-motion="reduced"` flag.

To re-run a quick overflow check yourself at the current density, in the browser console:
```js
PROTO_DATA.setDensity('extreme'); PROTO_PICKER.switchPanel('source'); PROTO_PICKER.setWidth(220);
PROTO_THEME.THEMES.forEach(t => { PROTO_THEME.set(t,{persist:false});
  const h = document.getElementById('panelHost');
  console.log(t, h.scrollWidth > h.clientWidth ? 'OVERFLOW' : 'ok'); });
```

## What this prototype deliberately does NOT do

- It does **not** modify `PMConcept7.html`, the `pm6-build` parts pipeline, or any Plans/governance artifact. It's a standalone exploration.
- It does **not** plumb real data — sample data is static in `proto-data.js`. Filters/toggles show their visual states but don't drive live results.
- The center stage is a simplified placeholder (the focus is the left panel).
- It does **not** replace native menus app-wide — only the ones in the redesigned panels. The full app-wide list is in `NATIVE_MENU_AUDIT.md` for the real build pass.
