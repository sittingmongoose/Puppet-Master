# TOKENS.md — quick-reference token contract (distilled from contracts/design_system.md; that file is authoritative on conflicts)

## 1. NEW :root tokens (added by theme-tokens agent in part 02 / pm6-css-global; themes override; verbatim block)

```css
--radius-xs:2px; --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --radius-xl:22px; --radius-pill:999px;
--accent-primary:var(--accent-blue); --accent-primary-rgb:0,71,171;
--accent-soft:color-mix(in srgb, var(--accent-primary) 12%, transparent);
--accent-glow:color-mix(in srgb, var(--accent-primary) 25%, transparent);
--elev-1:0 1px 2px rgba(0,0,0,.12); --elev-2:0 4px 14px rgba(0,0,0,.16);
--elev-3:0 12px 36px rgba(0,0,0,.22); --elev-hover:0 10px 30px var(--accent-glow);
--motion-fast:120ms; --motion-med:240ms; --motion-slow:420ms;
--ease-out:cubic-bezier(.22,1,.36,1); --ease-spring:cubic-bezier(.34,1.56,.64,1);
--ease-smooth:cubic-bezier(.4,0,.2,1); --ease-snap:cubic-bezier(.2,0,0,1);
--ease-default:var(--ease-smooth); --sheen-dur:.6s;
--fs-2xs:10px; --fs-xs:11px; --fs-sm:12px; --fs-md:14px; --fs-lg:16px; --fs-xl:20px; --fs-2xl:26px; --fs-3xl:32px;
--lh-tight:1.2; --lh-body:1.55; --2xl:24px; --3xl:32px; --density:1;
--activity-bar-w:72px; --files-panel-w:260px; --chat-panel-w:550px; --chat-sidebar-w:200px;
--tile-size:220px; --floating-chat-w:550px;
--glass-alpha:.55; --glass-tint-rgb:16,20,34; --panel-blur:16px; --panel-blur-sm:10px;
--glass-edge:rgba(255,255,255,.35); --glass-hairline:rgba(255,255,255,.08);
```

## 2. NEVER-RENAME var census (existing PMConcept4 vars, usage counts — rename nothing, only override values per theme)

`--sm`×536, `--md`×423, `--accent-blue`×369, `--border-light`×365, `--text-muted`×355, `--accent-lime`×309, `--xs`×265, `--surface-elevated`×259, `--text-primary`×235, `--text-secondary`×227, `--surface`×196, `--accent-orange`×163, `--border`×137, `--border-radius`×133, `--border-width`×109, `--display-font`×99, `--accent-magenta`×99, `--lg`×97, `--xl`×72, `--wg-accent`×58, `--body-font`×50, `--pm-tab-hi`×36, `--accent-error`×33, `--accent-warning`×26, `--shadow`×23, plus `--terminal-*`, `--graph-*`, `--background`, `--surface-alt`, `--mono-font`.

**Baseline defect (measured at carve, 2026-07-08):** six vars are *referenced but never defined* in PMConcept4: `--mono-font`, `--font-mono`, `--bg`, `--accent-red`, `--accent-blue-rgb`, `--glass-glow-color` (fallback or silent-inherit today; allowlisted in check_css BASELINE_UNDEFINED). theme-tokens agent should DEFINE `--mono-font` in :root (and may alias the others or migrate call sites); new code must not reference any of the six undefined names — when a var gains a real definition, prune it from the allowlist in checks/check_css.py.

## 3. `.pm-sheen` / `.pm-hover-icon` utility API (defined once in pm6-css-global; replaces ALL pink-glow hovers)

- Host requirements: `position:relative; overflow:hidden;` add class `pm-sheen`.
- Mechanics: `.pm-sheen::before { content:""; position:absolute; top:0; left:-70%; width:45%; height:100%; background:linear-gradient(105deg, transparent, color-mix(in srgb, var(--text-primary) 8%, transparent), transparent); transform:skewX(-18deg); transition:left var(--sheen-dur) ease; pointer-events:none }` — on `:hover` → `left:130%`.
- Host hover: `translateY(-4px)` + `box-shadow:var(--elev-hover)`.
- Child `.pm-hover-icon` on host hover: `scale(1.1) rotate(-4deg)` over `var(--motion-med) var(--ease-spring)`.
- Apply to: bento cards, project cards, dashboard tiles, s4 settings cards, widget headers, wizard topic cards. Existing glass hover glows (bento-card:hover ~497, wizard-btn:hover ~757, glow tabs 733-811) and s4 pink glow (~9134-9138) get deleted/overridden by their owners.

## 4. pm6-css token-only rule (hard, enforced by check_css.py)

New CSS lives ONLY in your own `pm6-css-<name>` style block. **No raw hex colors outside `[data-theme…]`-scoped rules** — everything else styles via `var(--…)` tokens from sections 1-2. Theme-specific accents go in `[data-theme="…"] .pm6-…` overrides inside your own block. New ids/classes prefixed `pm6-<yourname>-` (contract hooks in HOOKS.md exempt). Any `var(--x)` you use must have a definition somewhere in the document.

## 5. Per-theme motion personality

| theme family | --ease-default | --motion-med | --sheen-dur |
|--------------|----------------|--------------|-------------|
| friendly (dark/light) | var(--ease-spring) | 260ms | .55s |
| glass (dark/light) | var(--ease-out) | 320ms | .7s |
| retro (dark/light) | var(--ease-snap) | 140ms | .35s (fast glint) |
| basic (dark/light) | var(--ease-smooth) | 200ms | (root default .6s) |

Motion keyframes (pm6-css-global): `pm-enter-up`, `pm-enter-scale`, `pm-pop`, `pm-press`, `pm-page-in`, `pm-celebrate`, `pm-shake-subtle`. Stagger via `animation-delay:calc(var(--i,0)*50ms)`, cap 8. Reduced-motion block appended LAST in pm6-css-global: `@media (prefers-reduced-motion: reduce)` + duplicate rules under `[data-motion="reduced"]`; `#glass-bg * { animation:none !important }`.

## 6. `data-glass-bg` / `--glass-alpha` mechanics

- `<html>` ships `data-theme="friendly-dark" data-glass-bg="mesh"`. Modes: `mesh | depth | minimal` (default mesh).
- Single `<div id="glass-bg" aria-hidden="true">` FIRST in body — `position:fixed; inset:0; z-index:0; contain:strict` — with 3 mode sub-trees (inactive ones `display:none`).
- Transparency slider writes `--glass-alpha` on `documentElement` + `localStorage pm.glassAlpha`. Range: dark .35–.85, light .45–.88 (glass-light floor .45 = legibility guarantee).
- Boot snippet (inline `<script>` in head BEFORE CSS): read `pm.theme` (default friendly-dark), `pm.glassBg`, `pm.glassAlpha` → set attributes/vars.
- Glass surface recipe (single element — no pseudo-blur, no SVG filter):
  - `background: linear-gradient(180deg, rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) + .06)), rgba(var(--glass-tint-rgb), var(--glass-alpha)));`
  - `backdrop-filter: blur(var(--panel-blur)) saturate(1.5);`
  - `box-shadow: inset 0 1px 0 var(--glass-edge), inset 0 0 0 1px var(--glass-hairline), inset 0 -12px 24px -18px rgba(255,255,255,.10), 0 8px 24px rgba(0,0,0,.38);`
- Backdrop-filter budget: 8 declared / ≤6 visible (title-bar 16px, activity-bar 14px, files/left panel 12px, chat-panel 12px, floating-chat 20px, status-bar+bottom-panel 10px, modal/popover 20px). Everything else = pre-baked rgba fill `rgba(var(--glass-tint-rgb), calc(var(--glass-alpha) + .10))` + inset specular/hairline.

## 7. Type + spacing guardrails (for any pm6-css block)

10–11px = meta/kickers only (tracking +.06em, weight 600+); 12px list meta; 16px card titles; 20px panel headers; 26px page titles; 32px hero stats. New spacing quantizes to the 4px grid; card padding ≥ `var(--xl)`. Contrast: AA 4.5:1 primary+secondary, 4.0:1 muted (≥12px only), 3:1 boundaries/focus. Focus ring: `outline:2px` + `outline-color:var(--accent-primary)`.
