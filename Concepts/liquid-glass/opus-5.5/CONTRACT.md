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
- Each baked sheet costs a cold bake on first show and on resize. Keep it to about three per page. The bake runs in a
  worker: the page only reads the sheet's size and place after a layout, and its rim arrives a frame or more later.
- A large floating dialog full of text (a Customize screen) adds `data-lg-dense` next to `data-lg-surface="menu"`:
  its tint is heavier, so what is behind never shows through its text. On the CPU tier (no live blur) every menu is
  near opaque anyway.
- `data-lg-kind` is my internal mark. Read it as a selector if you need to, but never set it.

## Ride the lens

A tab strip, segmented choice or progress rail that should carry the glass lens is added to `STRIPS` in `glass.js` by
me. Mail me the strip's selector, its items' selector, how the chosen item is marked, and whether a press on an item
can be refused (a progress rail takes no press). Paint no highlight of your own behind the chosen item: the lens is the
highlight.

A strip inside a window that floats above the app needs a lens layer of its own in that window, or its lens is drawn
under the window. Onboarding's window and dialogs in `#pmw-overlay` (the Customize screens) have one. Mark any other
floating window `data-lg-lens-host`. A strip whose items are not choices (a progress rail) takes no press: its lens
moves only when the app changes the current item. Disabled, `aria-disabled="true"` and inert items never take a
press either.

## The switcher: one tab, segment and list-selection component (Jared #22, 2026-10-15)

Every strip in `STRIPS` is one component: a track, a lens that travels on a spring to the chosen item, and labels that
change from the ink colour to the chosen colour. The strips are:
- the page tabs, Usage's navigation and range, the rail's tabs and the Orchestrator's views;
- Settings' left bar, section tabs, page index and manager tabs;
- the Wizard's work type, the theme menu and the Customize screens.

Choices that live in scrolling content wear the lens's material in place and do not travel: Settings' segmented
choices and service lists, and Home's segmented rows and panel tabs. Glass draws the component. **Any other look can
adopt it by tokens**, with no change to `glass.js` or `glass.css`:

```css
html[data-theme="basic-dark"] {
  --pm-switch: lens;                                  /* turns the component on in this look */
  --pm-switch-fill: rgba(100, 181, 246, .16);         /* the lens's body */
  --pm-switch-line: rgba(100, 181, 246, .7);          /* its hairline */
  --pm-switch-r: 4px; --pm-switch-r-in: 2px;          /* its corner, and a label's corner inside it */
}
```

`glass.js` reads `--pm-switch` when the look changes and marks `<html data-pm-switch="lens">`. The strips and lenses
then run in that look. Glass's sheets, frost, refraction, hover bead and the activity bar's icon lens stay Glass-only.
A token you leave out takes the default in `glass.css` section 12.

| Token | Default outside Glass | What it draws |
|---|---|---|
| `--pm-switch` | (unset: off) | `lens` turns the component on |
| `--pm-switch-track` | text colour at 6 % | The strip's track under the items |
| `--pm-switch-hover` | text colour at 8 % | A list row's hover fill |
| `--pm-switch-fill` / `--pm-switch-body` | accent at 18 % / clear | The lens's body; the in-place material's extra body |
| `--pm-switch-line` / `--pm-switch-edge` | accent at 55 % / clear | Its hairline; a faint outer edge |
| `--pm-switch-top` / `--pm-switch-bottom` | clear | A top catch light; a bottom shade |
| `--pm-switch-glint` / `--pm-switch-glint-blend` | clear / `normal` | A glint along the top edge, and its blend |
| `--pm-switch-shadow` | none | The drop shadow |
| `--pm-switch-r` / `--pm-switch-r-in` | 6 px / 3 px | The lens's corner; a label's corner inside it |
| `--pm-switch-ink` / `--pm-switch-ink-on` | `--text-secondary` / `--text-primary` | The labels' colour, at rest and chosen |
| `--pm-switch-ink-hover` | `--pm-switch-ink-on` | A resting label's colour under the pointer. A look whose chip is opaque sets it, because its `--pm-switch-ink-on` is meant for the chip and not for the bare ground. |
| `--pm-switch-mark` | `--accent-primary` | Small marks beside or inside a chosen row (the index's dot, Usage's icon) |
| `--pm-switch-mark-on` | `--pm-switch-mark` | A mark inside a chosen item when the chip is opaque (Usage's icon, the rail's tab icon) |
| `--pm-switch-layer` | (unset: over) | `under` draws each lens inside its own strip, over the track and under the labels: an opaque chip with its label in `--pm-switch-ink-on` (Retro's reverse video, NieR's ink bar). Mirrored on `<html data-pm-switch-layer>` |
| `--pm-switch-swell` | 1 | How much of the chosen label's swell the look keeps, 0 to 1 (its resting size and its size under a moving lens) |
| `--pm-switch-liquid` | 1 | How much of the drop's stretch, lift and landing wobble the look keeps, 0 to 1 |

The look's own chosen fills, accent bars, dots, underlines and sliding inks on these strips step aside while the
component is on.

Every look but Glass adopts it (Q16, 2026-10-15): the token blocks are in
`Concepts/onboarding/opus-5.5/src/css/60-switcher-looks.css` (Basic, Friendly and Retro, light and dark, and NieR Mode,
which is re-read whenever NieR Mode is turned on or off). In those looks a press marks the pressed item
`data-lg-press="on"` and the one it leaves `"off"` until the app chooses. Each label takes its chosen or resting ink at
once, with no transition, while the chip moves ahead of the app; with `--pm-switch-layer: under` its icons and second
lines do too. Scrubbing a strip is off in that mode. glass.js still marks `<html data-pm-switch="lens">` and
`data-pm-switch-layer="under"` for scripts. The CSS, though, names the looks themselves: `html:not([data-theme^="glass"])`
and `:is(html[data-theme^="retro"], html[data-o55-nier="on"])`, at the marks' specificity. So the switch changes in the
look's own restyle, not in a second one when glass.js flips the marks after layout (B5, 2026-10-16). A look that opts out
of the switcher, by setting `--pm-switch` to anything but `lens`, must also be excluded from those selectors. Glass sets none of these tokens. A new strip joins by being added to `STRIPS` (mail me, as under "Ride the lens"). Reduce Motion: the
lens jumps.

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
| `--pm-ctl-r` / `--pm-ctl-r-in` | 6 / 3 px | | Corners of a control, and of something inside a control |
| `--lg-r-sheet` / `--lg-r-card` / `--lg-r-bar` | 18 / 16 / 14 px | | Corners of `panel`, `card` and `bar` sheets. Content inset by *p* inside a sheet takes the sheet's radius minus *p* |

Text keeps the look's own `--text-primary`, `--text-secondary` and `--text-muted`.

Private, do not read: `--lg-ring`, `--lg-frost-*`, `--lg-fx` / `--lg-fy`, `--lg-vw` / `--lg-vh`, `--lg-spec`,
`--lg-glow`, `--lg-px` / `--lg-py`, `--lg-mat` and `--lg-ga*`. They are per-element bakes and change without notice.
`--lg-fx`, `--lg-fy`, `--lg-ring`, `--lg-spec`, `--lg-px` and `--lg-py` are registered non-inheriting, so they never reach
the elements inside a sheet.

## Light, motion and layers

- Every light is neutral white, tinted only by the glass it passes through. No colour split or rainbow edge: Jared
  rejected chromatic fringing.
- Never put `filter` or `backdrop-filter` on a sheet. Never transform a baked sheet (`panel`, `card`, `bar`): its
  frost is anchored to its layout position. A `menu` sheet blurs live, so it may scale or slide in and out (Glass's
  own menus grow out of their button).
- Layers: the lens layer `#lg-lenses` sits at z-index 51, above the title bar (40, and 50 while one of its menus is open),
  and lenses stay on top; a lens an open menu covers steps aside. The
  pointer light `#lg-shine` is at 2, clipped to the sheet under the pointer and off everywhere else. In Glass Light the
  light is instead a layer of the lit sheet's own background, under its words (GPU tier only).
- Reduced motion (`html[data-motion="reduced"]`, `data-reduced-motion="1"` or `prefers-reduced-motion`): no travel,
  so draw a static state.
- Springs: menus and sheets use stiffness 230 and damping 19 (about 8 % overshoot). Switches use 520 ms
  `cubic-bezier(.45, 0, .2, 1.15)`.

## Drive Glass from a host page

Set `data-lg-demo-host` on `<html>`, and the concept's own status-bar button stays away. Then use `window.PM_LG`:

- `set({'data-lg': 'on'|'off'})`: Liquid Glass or today's Glass.
- `set({'data-lg-tier': 'gpu'|'cpu'})`: the rendering path.
- `set({'data-motion': 'reduced'})`, or `null` to clear it.
- `wall('look'|id)` chooses through the wallpapers package when it is on the page, so its gallery follows; `walls()`
  lists the package's catalog.
- `version`.

Glass Dark or Light is the normal theme setting.

## Wallpapers

The wallpaper choice, its catalog and the Settings gallery belong to the wallpapers package and follow
`Concepts/wallpapers/opus-5.5/CONTRACT.md`. Glass owns `catalog.d/10-glass.json`. `glass.js` keeps no list or picker of
its own: it reads each look's default from `window.PM_WALLPAPERS_CATALOG` (Ribbons for Glass when the package is
absent) and follows the package's rule for `<html data-lg-wall>`.
