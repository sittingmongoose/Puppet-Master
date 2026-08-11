# PMConcept7 Production Reference — for Usage Concept (U3–U9) Alignment

Source: `Concepts/PMConcept7.html` (READ-ONLY, 44,226 lines). Line anchors are approximate (±5).
Companion diff target: `Concepts/usage-concepts/_shared/{base.css,themes.css,usage-shared.css,usage-context.js,usage-context.css,usage-tabs.css}`.

Section map (banners in file): core-css @132 (themes+glass), settings-css @7240, global-css @8226 (tabstrips/scrollbars/cozy skins), orchestrator-css @11627, chat-css @12507 (context ring/lens/cdp), usage-grid-css @18766, usage-page-js @19160 (demo data), dashboard-js @31347 (context-tab renderer), orchestrator-js @35336, chat-js @38237 (ring JS).

---

## 1. GLASS EFFECT (highest priority)

### 1a. Theme tokens — `[data-theme^="glass"]` safety block, **L820–850**

```css
[data-theme^="glass"] {
  --glass-alpha: .60;                 /* transparency slider (clamped per theme by boot script L113) */
  --glass-tint-rgb: 46, 34, 72;
  --panel-blur: 16px;  --panel-blur-sm: 10px;
  --glass-edge: rgba(255,255,255,.40);       /* top edge highlight */
  --glass-hairline: rgba(255,255,255,.16);   /* 1px borders / separators */
  --motion-fast: 120ms; --motion-med: 320ms;
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --pm6-glass-a-rgb: 183, 156, 255;   /* violet identity */
  --pm6-glass-b-rgb: 229, 139, 200;   /* dusk-pink identity */
  --pm6-glass-sat: 1.6;
  --pm6-glass-floor: rgba(255,255,255,.10);
  --pm6-glass-drop: 0 12px 30px rgba(10, 5, 25, .45);
  /* pane material (the one slab) */
  --pm6-glass-pane-edge: rgba(255,255,255,.28);
  --pm6-glass-pane-k1: .73;  --pm6-glass-pane-k2: .57;  --pm6-glass-pane-k3: .67;
  --pm6-glass-pane-shadow: rgba(10,5,25,.60);  --pm6-glass-pane-shadow2: rgba(10,5,25,.40);
  --pm6-glass-pane-sheen: rgba(255,255,255,.16);  --pm6-glass-pane-sheen2: rgba(255,255,255,.08);
  --pm6-glass-inset: 5px;             /* sky ring around the pane */
  /* transparency steps — ALL slider-driven, plain rgba (no blur) */
  --pm6-glass-step-1: rgba(255,255,255, calc(var(--glass-alpha) * .10));  /* clearest: side panels */
  --pm6-glass-step-2: rgba(255,255,255, calc(var(--glass-alpha) * .16));  /* light frost: toolbars/cards */
  --pm6-glass-step-3: rgba(255,255,255, calc(var(--glass-alpha) * .28));  /* pill/selection */
  --pm6-glass-plate: rgba(16,10,32, calc(.35 + var(--glass-alpha) * .78)); /* near-opaque reading plate */
}
```

Glass theme palettes: `glass-dark` **L483–524** (`--background:#241B36`, tint `46,34,72`, alpha `.60`, `--border-radius:14px`, `--border-width:0px`, `--grid-gap:24px`, motion-med `320ms`, ease `--ease-out`, sheen `.7s`, accents `--accent-blue:#B79CFF` etc.); `glass-light` **L526–567** (`--background:#E4CDE4`, tint `246,240,255`, alpha `.55`, grid-gap `20px`, `--glass-edge:rgba(255,255,255,.95)`, `--glass-hairline:rgba(255,255,255,.55)`).

### 1b. THE PANE — app shell is the one glass slab, **L860–892**

```css
[data-theme^="glass"] .app-shell {
  position: relative; z-index: 1;
  height: calc(100vh - (2 * var(--pm6-glass-inset)));
  margin: var(--pm6-glass-inset);             /* 5px sky ring */
  border-radius: 20px; overflow: hidden;
  border: 1px solid var(--pm6-glass-pane-edge);
  background: linear-gradient(165deg,
    rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) * var(--pm6-glass-pane-k1))),
    rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) * var(--pm6-glass-pane-k2))) 40%,
    rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) * var(--pm6-glass-pane-k3))));
  backdrop-filter: blur(34px) saturate(160%);
  -webkit-backdrop-filter: blur(34px) saturate(160%);
  box-shadow:
    0 40px 90px var(--pm6-glass-pane-shadow),
    0 6px 18px var(--pm6-glass-pane-shadow2),
    inset 0 1.5px 0 var(--glass-edge),
    inset 0 0 0 1px rgba(255,255,255,.05);
}
[data-theme^="glass"] .app-shell::after {      /* soft sheen, L881 */
  content:""; position:absolute; inset:0; z-index:80; border-radius:inherit; pointer-events:none;
  background: linear-gradient(120deg, var(--pm6-glass-pane-sheen), transparent 30%,
    transparent 82%, var(--pm6-glass-pane-sheen2));
  mix-blend-mode: screen;
}
```

Rule: **ONE backdrop-filter inside the viewport** (the pane). Interior structure = transparency steps only, "no nested backdrop-filter anywhere inside the pane" (L894–897). Interior step examples L899–983: panels `step-1` + `inset 0 1px 0 var(--glass-edge), inset 0 0 0 1px var(--glass-hairline)`; status bar transparent + `inset 0 1px 0 var(--glass-hairline)`; popovers/settings-inspector = `--pm6-glass-plate` + hairline + `inset 0 1px 0 var(--glass-edge), var(--pm6-glass-drop)` (L969–983). Cards are pre-baked gradients, no blur (L1004–1013). Floating chat = second slab of same material, allowed because it floats OUTSIDE the pane (L938–954) + gradient-hairline mask ring (L986–1002).

### 1c. Wallpaper / orb background — `#glass-bg` stage, **L694–801**

- Single fixed div, `position:fixed; inset:0; z-index:0; contain:strict; pointer-events:none; display:none`; `[data-theme^="glass"] #glass-bg { display:block }` (L711–722).
- Modes via `html[data-glass-bg="mesh|depth|minimal"]` (L725–727):
  - **mesh** (default): one PRE-BAKED cloudscape WebP (base64 inline, L731–736; baked by `Concepts/pm7-tools/bake_wallpaper.mjs` — runtime blur/saturate filter and sky-drift animation were REMOVED in T16).
  - **depth**: baked base sky + baked far-billow on `.pm6-par-far::before` (L738–755); pointer parallax `--par-x/--par-y` → far `translate3d(x*4px, y*2px)`, near `*10px/*6px` (L745–748); cloud puffs = flat radial-gradient ellipses, **transform-only float** `pm-float` 64–100s ease-in-out alternate (L756–783). Pre-saturated colors, e.g. glass-dark near puff `radial-gradient(closest-side, rgba(184,117,189,.5), transparent 75%)`.
  - **minimal**: static gradient sky only (L785–801), e.g. glass-dark:
    ```css
    background:
      radial-gradient(ellipse 50% 38% at 15% 10%, #6E4FA3 0%, transparent 68%),
      radial-gradient(ellipse 46% 34% at 85% 8%,  #46387E 0%, transparent 70%),
      radial-gradient(ellipse 62% 44% at 50% 102%,#B25E8E 0%, transparent 72%),
      radial-gradient(ellipse 38% 28% at 98% 60%, #D08256 0%, transparent 70%),
      linear-gradient(168deg, #3A2B58 0%, #2C2148 48%, #52325C 100%);
    ```

### Alignment note (glass)
The chosen concept must adopt: the `--pm6-glass-step-1/2/3/plate` system + pane tokens verbatim, the 5px sky inset / 20px radius slab, the single `blur(34px) saturate(160%)`, and pre-baked-or-gradient wallpaper (no live `filter: blur()` orbs). Any surface inside the shell uses steps/plate, never its own backdrop-filter.

### DIFF vs current `_shared`
1. `_shared/base.css:36–54` glass-bg = **live gradient + 3 orbs with `filter: blur(60px)`** — PMConcept7 forbids runtime blur on the wallpaper (pre-baked/transform-only). Reconcile: replace orb blur with `minimal`-mode gradients (L785–801) or baked images.
2. `_shared/base.css:56–65` `.app-shell` glass = transparent + blur(34px) but **no 5px inset margin, no 20px radius, no pane gradient (k1/k2/k3), no sheen, no pane-edge border/shadow stack**.
3. `_shared/themes.css` defines NO `--pm6-glass-step-1/2/3`, `--pm6-glass-plate`, or pane tokens — `usage-shared.css:254` references `var(--pm6-glass-plate, fallback)` with fallback only. Build must add the L820–850 block to themes.css.
4. `_shared/themes.css:315–316` glass-light = tint `248,244,255`, alpha `.80` — PMConcept7 = tint `246,240,255`, alpha `.55`. Adopt PMConcept7 values.
5. Glass popovers: `_shared/usage-shared.css:254` approximates plate already — keep, but drop `var(--elev-3)` in favor of `inset 0 1px 0 var(--glass-edge), var(--pm6-glass-drop)` + `border-radius:12px` (L6650–6668).

---

## 2. CONTEXT RING + POPUP ("Context Lens" family)

### Ring element
Built by `ctxModuleHtml()` **L38911–38930** (chat header; docked + floating):

```html
<span class="context-usage pm6-chat-ctx" role="button" tabindex="0" aria-haspopup="dialog" aria-expanded="false"
      title="Context usage — click for breakdown">
  <svg width="15" height="15" viewBox="0 0 24 24" style="transform: rotate(-90deg);">
    <circle cx="12" cy="12" r="10" fill="transparent" stroke="var(--border-light)" stroke-width="4"/>
    <circle class="pm6-chat-ctx-arc" cx="12" cy="12" r="10" fill="transparent" stroke="var(--accent-primary)"
            stroke-width="4" stroke-dasharray="62.8" stroke-dashoffset="42"/>
  </svg>
  <div class="context-hover-module">…popup…</div>
</span>
```

Ring CSS **L12685–12710**: `.pm6-chat-ctx > svg { width:15px; height:15px }` ("ring alone in the header; token label removed; ~25% larger than the old 12px"). Hover=glow (NOT an outline), **L12703–12709**:

```css
.pm6-chat-ctx:hover > svg,
.pm6-chat-ctx.is-ctx-open > svg {
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--accent-blue) 70%, transparent))
          drop-shadow(0 0 7px color-mix(in srgb, var(--accent-blue) 40%, transparent));
}
```

Arc update JS `setContext()` **L40334–40342**: `stroke-dashoffset = 62.8 * (1 - used/max)`; popup value `used.toLocaleString() + ' / ' + max.toLocaleString()`; `.chm-bar-fill` width = pct. Demo default **42,180 / 128,000** (L31974, L38921); live values ride `PM_DEMO.state.chat.context {used, max}`.

### Status popup (`.context-hover-module`) — CSS **L6413–6476**, content **L38920–38929**

Fields in PMConcept7 production: `Usage 42,180 / 128,000` → 4px bar (`--accent-blue` fill) → `Input 38.2k tokens` → `Output 3.9k tokens` → `Est. Cost $0.19 this thread` → actions row (border-top hairline): **Compact now** (`.chm-compact-btn`, bg `var(--accent-orange)`, color `#1A1A1A`, always visible L13493) + **More details** (`.chm-details-link`, accent-blue text link). Popup chrome: `min-width:220px; font-size:11px; background:var(--surface-elevated); border:1px solid var(--border); border-radius:var(--radius-md); box-shadow:var(--elev-3); z-index:200`.

NOTE: PMConcept7's popup does NOT contain role breakdown, cache hit, or 5h/weekly remaining — those rows exist only in `_shared/usage-context.js` (`cp-row` roles, `cp-cache`, per Plans spec). **Reconcile**: keep PMConcept7 chrome/motion/glow, keep the concept-spec field set (windows/used-limit/bar/roles/cache/5h-weekly/Compact/More Details); PMConcept7 is the visual+motion reference, not the field list.

### Corner-origin sprout animation (shared contract), **L6426–6465**

```css
--pm6-sprout-ox: 88%; --pm6-sprout-oy: 0%;      /* top-right corner origin */
--pm6-sprout-tx: 0px; --pm6-sprout-ty: -10px;
--pm6-sprout-sx: 0.72; --pm6-sprout-sy: 0.48;
transform-origin: var(--pm6-sprout-ox) var(--pm6-sprout-oy);
/* closed */ opacity:0; transform: translate3d(tx,ty,0) scale3d(sx,sy,1); visibility:hidden;
transition: opacity 160ms var(--ease-out),
            transform 300ms cubic-bezier(0.22, 1.55, 0.36, 1),   /* overshoot spring */
            visibility 0s linear 300ms;
/* .is-open */ opacity 140ms var(--ease-out), transform 300ms cubic-bezier(0.22,1.55,0.36,1), visibility 0s;
/* .is-closing */ opacity 45ms ease-in 175ms, transform 220ms cubic-bezier(0.45,0.05,0.55,0.2), visibility 0s linear 220ms;
```

`portalOpenAnim`/`portalCloseAnim` **L39713–39744**; `setPopoutSprout` **L39695–39711** snaps origin to the anchor corner (ox ∈ {8,92}, oy ∈ {0,100}, ty flips ±10px when opening downward).

### One-popup-at-a-time + keyboard
`closeHeaderSprouts(except)` **L40472–40488** closes `.context-lens-popover, .pm6-chat-more-menu, .wt-bind-dropdown, .context-hover-module` before any open; `ctxModuleOpen` also closes other ring modules (L40522–40537). Outside-click close L40658–40660. Enter/Space toggle on focused ring **L40678–40698**. Context Lens button (sibling control) L6479–6512: 28px square, `cl-active` = accent-blue border + `box-shadow: 0 0 8px color-mix(accent-blue 18%)`; glass override drops the blue for `step-2/edge` hover and `step-3` active (L6627–6649, re-asserted L12737–12751).

### Glass treatment for popup, **L6650–6668**

```css
[data-theme^="glass"] .context-hover-module, … .context-lens-popover, … {
  background: var(--pm6-glass-plate);
  border: 1px solid var(--glass-hairline);
  box-shadow: inset 0 1px 0 var(--glass-edge), var(--pm6-glass-drop);
  border-radius: 12px;
}
```

### Alignment note
Ring = 15px SVG, dasharray 62.8, `--accent-primary` arc; hover/open = dual drop-shadow glow; popup sprouts from 88%/0% with the exact spring above; strictly one sprout open. `_shared/usage-context.js` already uses identical sprout timing and glow (`usage-shared.css:246–258`, `usage-context.css:2–3`) and a 16px ring in a 22px chip button — close enough; align ring size 16→15px and stroke `--accent-blue`→`--accent-primary` if exact parity is wanted.

---

## 3. MORE DETAILS / CONTEXT DETAIL

`More details` (`.chm-details-link`) closes the popup and opens **"Context: <thread>" as an editor tab** (`PM6_OPEN_CONTEXT_TAB` pseudo-path `context:<threadId>`), handler **L40584–40602**; renderer `pm6ContextHtml()` **L31992–32110** mirrors the standalone `#contextDetailPane` markup **L17538–17687**.

Structure (Curated view):
- `.cdp-tab-bar` with two `.cdp-tab`: **Curated** | **Raw** (L17545–17548); active tab = accent-blue text + 2px accent-blue bottom border (L6681–6682); glass active = `var(--pm6-glass-step-3)` (L1167).
- **Overview** (L17553–17563): Thread, Messages `6`, Provider `Claude`, Model `Sonnet 4.6`, Mode `Agent`, Persona `product-manager`, Worker `assistant`, Tokens `42,180 / 128,000`.
- **Breakdown** (L17565–17589): `Context Usage — NN%`; stacked 6px bar, 4 segments `System 19.5% var(--accent-blue) / User 29.4% var(--accent-lime) / Assistant 43% var(--accent-orange) / Tool 8.1% var(--accent-magenta)` + 8×8px swatch legend `8.2k/12.4k/18.1k/3.5k`; then **By Role** kv rows: User 12,400 · Assistant 18,100 · System 8,200 · Tool 3,480 · Reasoning 4,200 · Cache Read 2,100 · Cache Write 800.
- **Browser Context** (L17592–17600): Active Sessions 2 (`localhost:5173` lime, `test-runner (paused)` orange), Captured Elements 3, Screenshots 1, Traces 1.
- **Messages** (L17602–17651): expandable `.cdp-msg-row` (role color · mode · model · think-time · N tok) toggling `.cdp-msg-detail` with Provider/Model/Effort/Persona/Input/Output/Thinking/`Context at Send`/Requested vs Effective Model (`fallback: rate_limit_5h`, orange) /Reasoning Tokens/Tools row. Every row is inline-expandable — there is **no "show N messages" button** in PMConcept7.
- **Raw view** (L17655–17685): full JSON dump — `thread_id, title, project, provider, model, mode, persona, requested_/effective_model_provider_id, requested_/effective_runtime_platform_id, context{used 42180, limit 128000, input_tokens 38200, output_tokens 3980, reasoning_tokens 4200, cache_read_tokens 2100, cache_write_tokens 800}, messages[]`. **Not redacted.**

`.cdp-*` CSS **L6677–6697** (pane `background:var(--surface); font-size:12px`; section titles 11px/700/uppercase; kv rows hairline-divided; bar 6px radius-3). Tab-strip recipe also covers `.cdp-tab-bar` (L8914). In-tab tweaks `.pm6-ctx-tab .cdp-*` **L9480–9502**.

### Alignment note / DIFF
The U-concepts' More Details (`_shared/usage-context.js:32–64`, `.pm-md`) intentionally EXTENDS PMConcept7: modal-style card grid, **three-way cost (API billed / Plan included / Combined)** (PMConcept7 has only "Est. Cost … this thread"), **"show N session breakdowns"** toggle (PMConcept7: per-row expand), and **redacted Raw** (`raw_payload_ref:'[redacted]'`, `provider_payload_hash`, `omitted_evidence_counts`, `permission_state:'redacted'` — PMConcept7's Raw is full JSON with no redaction). Build agents: keep the concept field set (cost three-way + redaction per Plans), borrow PMConcept7's Curated/Raw tab switch, section-title/kv/stacked-bar styling (`.cdp-*`), and the 4-role color mapping (blue/lime/orange/magenta).

---

## 4. ORCHESTRATOR-STYLE TOP TABS

Shared "PM6 tabstrip recipe" **L8906–8941** — one behavior for 7 strips (`.page-tabs, .orch-tabs, .editor-tabs, .sc-subview-tabs, .cdp-tab-bar, .dashboard-tabs`): nowrap flex, `overflow-x:auto` with hidden scrollbar, tabs `flex:0 0 auto; min-width:56px; max-width:180px; height:28px; font-size:var(--fs-xs); ellipsis`.

Base orch strip **L5393–5448**:
```css
.orch-tabs { display:flex; align-items:center; gap:var(--xs); height:36px; min-height:36px;
  padding:0 var(--md); border-bottom:var(--border-width) solid var(--border);
  background:var(--surface); font-size:12px; }
.orch-tab { padding:var(--sm) var(--md); color:var(--text-secondary); border-bottom:3px solid transparent; }
.orch-tab:hover { color:var(--text-primary); }
.orch-tab.active { color:var(--text-primary); font-weight:600; border-bottom-color:var(--accent-lime); }
[data-theme="basic-*"] .orch-tab.active { border-bottom-color: var(--accent-blue); }
.orch-tab-badge { font-size:10px; color:var(--text-muted); }  /* + 6px orange badge-dot */
```

Glass override **L12371–12393** — strip becomes a rounded frosted bar:
```css
[data-theme^="glass"] .orch-tabs { height:auto; margin:var(--sm) var(--xl); padding:var(--md) var(--lg);
  gap:var(--md); background:var(--pm6-glass-step-2); border:var(--border-width) solid var(--glass-hairline);
  border-radius:var(--border-radius); border-bottom:none;
  box-shadow: inset 0 1px 0 var(--glass-hairline), var(--shadow); }
[data-theme^="glass"] .orch-tab { border-bottom:none; border-radius:var(--border-radius); padding:6px 12px; }
[data-theme^="glass"] .orch-tab.active { background:var(--pm6-glass-step-3);
  box-shadow: inset 0 1px 0 var(--glass-edge); color:var(--text-primary); }
```

Friendly override **L12450–12472**: pill bar on `--pm6-cozy-card-base`, tabs `border-radius:var(--radius-pill); font-weight:700`, active = `color-mix(pm6-cozy-mint 20%, card-base)` + accent-lime text + `box-shadow: 0 0 14px color-mix(pm6-cozy-mint 35%, transparent)`.

Markup/a11y **L18479–18480**: `role="tablist"` / `role="tab" tabindex="0" aria-selected`. Click switching via delegated handler **L36653–36662**; **no arrow-key navigation** on the strip itself (keyboard arrows exist only for the run-graph canvas, L36375+). Panel swap = class toggle `.orch-tab-content.active { display:flex }` (L5438–5448) — no crossfade in PMConcept7.

### Alignment note / DIFF
PMConcept7 has **no ink/magnet element and no crossfade** — the sliding `.pm-tab-ink` pill + `pmTabIn/Out` 300ms/150ms translate crossfade in `_shared/usage-tabs.css:8–17` is a concept-side invention. It is consistent with (not contradictory to) PMConcept7's glass/friendly pill-active treatments; keep the ink, but its per-theme skins must match above: glass ink = `--pm6-glass-step-3` + `inset 0 1px 0 var(--glass-edge)` + pill radius (already in usage-tabs.css:10); friendly = cozy base + mint glow (usage-tabs.css:11 ≈ L12467–12472). Base/retro should use the 3px underline (lime default, accent-blue on basic) when ink is off.

---

## 5. SETTINGS SCROLLBAR (global scroll recipe)

Global recipe **L198–276** ("hidden everywhere by default; real scroll panes opt in"):

```css
:root {
  --pm6-sb-thumb: color-mix(in srgb, var(--text-primary) 16%, transparent);
  --pm6-sb-thumb-hover: color-mix(in srgb, var(--text-primary) 30%, transparent);
  --pm6-sb-radius: 8px;
}
* { scrollbar-width: none; }   /* + webkit width:0 */
*::-webkit-scrollbar-thumb { background: var(--pm6-sb-thumb);
  border: 3px solid transparent; background-clip: padding-box;   /* fakes inset overlay */
  border-radius: var(--pm6-sb-radius); }
/* opt-in panes (incl. .s4-shell, .s4-stage, .s4-rail, .s4-panel-body, .s4-psm-body,
   .settings-inspector-panel .inspector-body, .pm6-usage-wrap [class*="scroll"],
   .context-detail-pane, .cdp-raw-view …) get: */
scrollbar-width: thin; scrollbar-color: var(--pm6-sb-thumb) transparent;
:is(…)::-webkit-scrollbar { width: 10px; height: 10px; }
```

Scroll-idle auto-hide (chat streams + **settings shelf rail `.s4-rail`**) **L249–276**: thumb transparent until `.pm6-sb-active` (JS toggles after ~2s idle) or `:hover`; `transition: background 0.25s ease`. Chat streams also `scrollbar-gutter: stable` (L248). Theme tints **L8887–8895**: retro = square (`--pm6-sb-radius:0`) + accent-primary 50%/70%; glass = text-primary 26%/40%. `.s4-rail` glow gutter **L7430–7441** (12px padding + negative margins so hover rings aren't clipped; `scroll-snap-type: x proximity`).

### Alignment note / DIFF
`_shared` has no equivalent opt-in scrollbar system. Concepts should adopt the `--pm6-sb-*` hooks + thin/10px/8px-radius/3px-inset-border thumb and the hover-fade behavior for their scroll surfaces; retro square + glass 26%/40% tints come free with the token hooks.

---

## 6. THEME TOKENS (8 themes)

Root contract block **L172–195**:
```
--radius-xs:2 --radius-sm:6 --radius-md:10 --radius-lg:16 --radius-xl:22 --radius-pill:999
--accent-soft: color-mix(accent-primary 12%)   --accent-glow: color-mix(accent-primary 25%)
--elev-1: 0 1px 2px rgba(0,0,0,.12)  --elev-2: 0 4px 14px rgba(0,0,0,.16)  --elev-3: 0 12px 36px rgba(0,0,0,.22)
--elev-hover: 0 10px 30px var(--accent-glow)
--motion-fast:120ms --motion-med:240ms --motion-slow:420ms
--ease-out: cubic-bezier(.22,1,.36,1)  --ease-spring: cubic-bezier(.34,1.56,.64,1)
--ease-smooth: cubic-bezier(.4,0,.2,1) --ease-snap: cubic-bezier(.2,0,0,1)  --sheen-dur:.6s
--fs-2xs:10 --fs-xs:11 --fs-sm:12 --fs-md:14 --fs-lg:16 --fs-xl:20 --fs-2xl:26 --fs-3xl:32
--grid-gap:24  --density:1
--glass-alpha:.55 --glass-tint-rgb:46,34,72 --panel-blur:16px --panel-blur-sm:10px
--glass-edge:rgba(255,255,255,.35) --glass-hairline:rgba(255,255,255,.08)
```

Per-theme deltas that matter for concepts:
- retro-dark **L281–299**: `--background:#1A1A1A`, square corners, `--accent-primary:var(--accent-lime)`; retro-light similar; snap motion.
- basic-dark/light: flat, `--border-radius:10px` (L470), motion-med 200ms.
- glass-dark/light: §1a above.
- friendly-dark **L577–634** / friendly-light **L636–693**: `--display-font:'Cal Sans'`, `--body-font:'Quicksand'`, `--base-font-size:14.5px`, `--border-radius:14px`, `--border-width:1px`, `--radius-md:14`, `--radius-lg:20`, `--grid-gap:20`, `--ease-default:var(--ease-spring)`, `--motion-med:260ms`, `--sheen-dur:.55s`; cozy hooks: dark `--pm6-cozy-mint:#6FDABC --pm6-cozy-sky:#6FC6E8 --pm6-cozy-coral:#FFAD93 --pm6-cozy-lav:#C3B1E4 --pm6-cozy-butter:#FFD97F --pm6-cozy-card-base:#2A2731 --pm6-cozy-mix:14% --pm6-cozy-border-mix:34% --pm6-cozy-chrome:rgba(40,36,48,.82) --pm6-cozy-field:rgba(255,255,255,.06) --pm6-cozy-dot:rgba(190,180,210,.06) --pm6-cozy-glow-{mint,lav,sky}`; light: `#FBF7F3` paper, mint `#5FD0B0`, chrome `rgba(255,255,255,.88)`, mix 11%.

**Friendly grid ground** **L8521–8529**:
```css
[data-theme^="friendly"] body {
  background:
    radial-gradient(var(--pm6-cozy-dot) 1px, transparent 1.5px) 0 0 / 18px 18px,
    radial-gradient(46% 38% at 16% 6%,  var(--pm6-cozy-glow-mint), transparent 65%),
    radial-gradient(50% 42% at 88% 12%, var(--pm6-cozy-glow-lav),  transparent 65%),
    radial-gradient(55% 40% at 55% 108%,var(--pm6-cozy-glow-sky),  transparent 65%),
    var(--background);
}
```

**Glass containment**: §1a pane tokens (`--pm6-glass-inset:5px`, k1/k2/k3) + perf containment **L8507–8509**: `contain: layout paint` on cards/panels; `.page:not(.active) { content-visibility:auto; contain-intrinsic-size:auto 600px }`.

### Alignment note / DIFF
`_shared/themes.css` mirrors the root block and glass/friendly palettes, but with the glass-light drift noted in §1 (alpha .80 vs .55) and WITHOUT the `--pm6-glass-step-*/plate/pane-*` tokens. Add them; then glass containment/stepping works with no per-concept CSS.

---

## 7. DEMO-FLOW DATA

Baseline dataset `D` in usage-page-js **L19168–19277** (`pm6UsagePageInit`), overlaid live by `PM_DEMO.state.usage` via `ENGINE_QUOTA_MAP` **L19302–19317**. Shape:

```js
D = {
  spend: { '5h': 14.27, '24h': 28.41, '7d': 142.83 },                    // $ totals per window
  quotas: [ { id, name, plan, five: 0-100, seven: 0-100, vs, note? } ],  // 12 providers
  donuts: [ { name, pct, tone: ok|warn|hot } ],                          // 6 providers
  cache:  [ { name, state, hit, cin, cw, cr, save } ],                   // hit%, cache in/write/read, $ saved
  tools:  [ { tool, calls, p50, p95, err, idx } ],
  accounts: [ { prov, name, mail, requested, effective, dot: working|resting|standby|pressure, status, cooldown? } ],
  anomalies: [ { kind: token_spike|output_spike, state: blocked|allowed, title, body, why: [[k,v]] } ],
  chart: { '5h'|'24h'|'7d': { cols: [[label, total, a, b, c]], note } },
  ledger: [ { t, ev: completion|tool|guard|switch|error, run:'pcr-47', lane, prov, model, acct,
              tin, tout, cin, cw, cr, rep: measured|estimated|unsupported, cost, lat, detail{}, ref:'ue-47-…' } ],
  livePool: [ …same row shape… ]
}
```

Canonical provider set (quotas L19173–19190): **Claude (Pro, 78/61), Claude Code (Max, 64/52), Codex·Plus plan (34/33), Codex·API key (hidden-byok), Copilot (Business, 91/66), Gemini Direct (AI Studio, 41/30 est), Antigravity CLI (28/21 stale), Cursor (56/44 est), OpenCode (unknown), Gemini·Workspace (hidden-subscription), Windsurf (disabled), Ollama·local (not-exposed)**. Value-state closed vocab **L19330–19334**: `measured | estimated | stale | unknown | disabled | not-exposed | hidden-byok | hidden-subscription` — "a missing bar NEVER means zero; the chip says why". Tones: `pct>=90 hot, >=70 warn, else ok` (L19326). Per-widget windows `CFG` **L19287–19297** (quota_summary/alerts/donuts/multi_account/ledger = 5h; chart/cache/tool/anomaly = 24h).

Chat ring data: `PM_DEMO.state.chat.context {used, max}` → default 42,180 / 128,000; dashboard CTA "Claude 5h window at 78%" (L17722, L27516: `{ id:'q-claude-5h', pct:78, level:'orange', plan:'Max' }`).

### Alignment note
Concepts' `_shared/usage-data.js` should keep this provider list, window names (`5h/24h/7d`), the vs-chip vocab, tone thresholds, and the ledger row shape so all U-concepts render one coherent dataset; ring fixtures should stay at 42,180/128,000 with the 4-role split (System 8.2k / User 12.4k / Assistant 18.1k / Tool 3.5k ≈ 19.5/29.4/43/8.1%).

---

## Top reconciliation deltas (build checklist)

1. **Glass step tokens missing** in `_shared/themes.css` — port L820–850 verbatim (`--pm6-glass-step-1/2/3`, `--pm6-glass-plate`, pane k/edge/shadow/drop/inset). Fix glass-light to tint `246,240,255` / alpha `.55`.
2. **Glass shell geometry** — add 5px sky inset, 20px radius, k1/k2/k3 gradient pane, edge-highlight shadow stack, sheen `::after` to `_shared/base.css` `.app-shell`.
3. **Wallpaper** — replace `filter: blur(60px)` orbs with PMConcept7 `minimal` gradients (or baked images); puffs must be transform-only.
4. **Popup field set** — PMConcept7 popup is Usage/Input/Output/EstCost only; concepts must keep Plans-spec rows (windows, roles, cache hit, 5h/weekly remaining) inside PMConcept7 chrome (`.chm-*` layout, 220px, sprout, glow).
5. **More Details** — adopt `.cdp-*` Curated/Raw structure + stacked bar colors and per-row message expansion from PMConcept7; retain concept-only three-way cost and redacted-Raw fields. Tabs: concepts' `.pm-tab-ink` crossfade is an accepted extension — theme its skins to match glass step-3 / friendly mint-glow / basic+retro 3px underline.
6. (Bonus) **Scrollbar** — port the `--pm6-sb-*` opt-in recipe (+retro square, glass 26%/40%, idle auto-hide) for all concept scroll surfaces.
