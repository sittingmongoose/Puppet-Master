# Liquid Glass: the contract for other owners (pm7-liquid-glass, 2026-10-14)

How a surface, strip or light owned by someone else takes part in Liquid Glass without editing `glass.js` or
`glass.css`. Everything here applies only while `html[data-lg="on"]` and the look is Glass
(`html[data-lg="on"][data-theme^="glass"]`); scope your own Glass rules the same way. Nothing here is canon yet.

## Put a surface on glass

Set `data-lg-surface` on the element:

| Value | What it is | Use it for |
|---|---|---|
| `menu` | A floating sheet that blurs live whatever is behind it | Popovers, toasts, dropdowns, a studio panel |
| `panel` | A baked sheet that frosts the wallpaper at its own position | A large column sitting directly on the wallpaper |
| `card` | The same, with a smaller bevel | A free-standing card sitting directly on the wallpaper |
| `bar` | The same, thin and lighter | A toolbar or header strip on the wallpaper |

- No JS call is needed. `glass.js` mounts a visible element that carries the attribute on the next frame, and
  unmounts it when the attribute or the element goes.
- `panel`, `card` and `bar` are baked: they frost the wallpaper, not what is drawn under them. Put them directly on
  the wallpaper and clear any filled wrapper between. Never put a sheet on a sheet (one blur, F3-427). Inner cards
  are plain fills (below), with no `backdrop-filter`.
- Each baked sheet costs a cold bake on first show and on resize. Keep it to about three per page.
- `data-lg-kind` is my internal mark. Read it as a selector if you need to, but never set it.

## Ride the lens

A tab strip, segmented choice or progress rail that should carry the glass lens is added to `STRIPS` in `glass.js` by
me. Mail me the strip's selector, its items' selector, how the chosen item is marked, and whether a press on an item
can be refused (a progress rail takes no press). Paint no highlight of your own behind the chosen item: the lens is the
highlight.

A strip inside a window that floats above the app (`#pmw-overlay`, onboarding's window) needs a lens layer of its
own in that window. Onboarding's has one. Strips in `#pmw-overlay` wear the lens's material in place until theirs
lands (after M3).

## Public tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `--lg-fill` / `--lg-fill-hover` / `--lg-fill-press` | white .075 / .13 / .18 | ink .055 / .09 / .13 | Controls and inner cards on a sheet |
| `--lg-line` | white .10 | ink .09 | Hairlines and borders on a sheet |
| `--lg-sel` / `--lg-on-sel` | blue .52 / white | blue .88 / white | A selected row and its text |
| `--lg-tint-menu`, `-panel`, `-card`, `-bar` | | | The sheet tints. They follow Settings' panel transparency |
| `--lg-edge-top` / `--lg-edge-bot` | white .30 / black .28 | white .90 / navy .14 | Rim catch light and rim shade |
| `--lg-shadow` / `--lg-shadow-near` | | | Far and near shadows |
| `--lg-lens-glint` | white .24 | white .70 | The lens's catch light |
| `--lg-lens-glint-blend` | `plus-lighter` | `normal` | The blend for any light you add; never additive over Light's dark text |
| `--lg-lens-hair` | white .17 | white .90 | The lens's hairline rim |
| `--lg-shine-c` / `--lg-shine-blend` | | | The pointer's light (a 96 px disc, `--pmf-r`) |
| `--lg-switch-off` | white .16 | ink .14 | A switch's off track |
| `--pm-ctl-r` / `--pm-ctl-r-in` / `--lg-r-card` | 6 / 3 / 16 px | | Corners: controls, inside a control, cards |

Text keeps the look's own `--text-primary`, `--text-secondary` and `--text-muted`.

Private, do not read: `--lg-ring`, `--lg-frost-*`, `--lg-fx` / `--lg-fy`, `--lg-vw` / `--lg-vh`, `--lg-spec`,
`--lg-mat` and `--lg-ga*`. They are per-element bakes and change without notice.

## Light, motion and layers

- Every light is neutral white, tinted only by the glass it passes through. No colour split or rainbow edge: Jared
  rejected chromatic fringing.
- Never put `filter` or `backdrop-filter` on a sheet. Never transform a baked sheet (`panel`, `card`, `bar`): its
  frost is anchored to its layout position. A `menu` sheet blurs live, so it may scale or slide in and out (Glass's
  own menus grow out of their button).
- Layers: the lens layer `#lg-lenses` sits at z-index 45, above the title bar's 40, and lenses stay on top. The
  pointer light `#lg-shine` is at 2, clipped to the sheet under the pointer and off everywhere else.
- Reduced motion (`html[data-motion="reduced"]`, `data-reduced-motion="1"` or `prefers-reduced-motion`): no travel,
  so draw a static state.
- Springs: menus and sheets use stiffness 230 and damping 19 (about 8 % overshoot). Switches use 520 ms
  `cubic-bezier(.45, 0, .2, 1.15)`.

## Drive Glass from a host page

Set `data-lg-demo-host` on `<html>`, and the concept's own status-bar button stays away. Then use `window.PM_LG`:

- `set({'data-lg': 'on'|'off'})`: Liquid Glass or today's Glass.
- `set({'data-lg-tier': 'gpu'|'cpu'})`: the rendering path.
- `set({'data-motion': 'reduced'})`, or `null` to clear it.
- `wall('look'|id)` and `walls()`.
- `version`.

Glass Dark or Light is the normal theme setting.

## Wallpapers

The wallpaper choice, its catalog and the Settings gallery follow `Concepts/wallpapers/opus-5.5/CONTRACT.md`. Glass
owns `catalog.d/10-glass.json`.
