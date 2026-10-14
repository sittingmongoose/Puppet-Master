# PM7 terminal customizer (2026-10-13)

Branch `concept/pm7-terminal-customizer-20261013` is stacked on `611b2404e4`. `origin/main` has since moved to
`d6afa4b281` (hover and press polish), which touches the four generated pages and two onboarding sources but none of
this branch's sources, so a rebase only needs the pages regenerated. The source head is `077642db7c`; the branch head
with regenerated pages is listed in `result.json`. The published `Concepts/PMConcept7.html` has SHA-256
`0931519ed261ea5f08717ab882ca052e16310e833fb30dedb6c75f247d0071b7`. It is not landed. There was no landing lock,
main push, snapshot, baseline or reseal.

## What it is

The terminal's More menu → **Appearance…** now opens a **Customize screen** instead of the long options popover.
It is drawn after NieR Mode's Plug-in Chips popup:
- a kicker band, title and lead;
- a live preview beside a side column (a change meter, quick sets, try-it actions);
- every option grouped into Colors, Text, Cursor, Background, Effects and Behavior, as tiles that show what they
  choose and chips that say what they turn on;
- Done at the foot.

The preview is a real terminal view on a session that never starts a program, drawn by the terminal's own renderer
and effects. When its own place scrolls away it docks under the group index. The real terminal stays uncovered
through a cut-out in the scrim. Each look draws the screen its own way:
- Basic: crisp.
- Friendly: dot ground, cards that lift.
- Glass: menu plate and rims, no new blur.
- Retro: square, reverse video, bracketed headings.
- NieR: clipped-corner chips with pins and ink bands, only through installed parts.
- Light and dark, Reduced Motion, and narrow windows down to 360 px.

The editor keeps its compact popover; it is the same component and the same scheme catalog (DR-068).

There are two entry points, both approved by Jared (coordinator mail 1013211937):
- the terminal ⋮ → Appearance… opens it for **This terminal**;
- Settings → Editor & Terminal → Terminal look → **Open Customize** opens it for **All terminals**.

## Persistence and binding

- **This terminal** is the tab layer, saved with the tab.
- **All terminals** is the Project's Settings rows (`code.terminal.*`, SSYS-051). They are written through the
  Settings transaction by one new additive Settings file, `kit.d/24-terminal-look.js`
  (`window.PM_TERMINAL_SETTINGS`).
- The terminal resolves fields in this order: tab, then Settings, then the earlier local copy, then the look.
- Settings > Editor & Terminal now drives the terminal. The audit's case (size 24 saved, the terminal stayed 13) now
  draws 24.
- The Terminal Colors and Terminal Font rows get their canon choices, and Import a Color Scheme imports.

## Repairs (each verified in the matrix, the Settings pass or on the GPU)

| Option | Before (main `a1ca`; audit and source) | Now |
|---|---|---|
| Every Terminal look Settings row (41) | stored in Settings, never read by the terminal | bound both ways |
| Scanline and glow strength (no-GPU path) | stored; always drawn at .30 and .45 (audit paint proof) | `52-fx.js` sets the CSS strengths |
| Blur on your own picture | the picture was returned before the blur (audit: identical PNGs) | baked once; box-blur fallback without canvas filters |
| Text drawing (Font Rendering) | no field | Crisp draws whole device pixels; Smooth draws unhinted outlines |
| Sixtyfour scanlines and bleed | "native renderer only" | drawn through FontFace instances with SCAN and BLED |
| Text weight | 400–600 | each face's own range; one-weight faces say so |
| Opacity | applied in every look once set | Glass only (SSYS-051) |
| Import error | covered by the open popover (audit) | shown inside the screen |
| Keyboard | focus lost after each change (audit: innerHTML re-render) | the screen paints in place; repeated keys work |
| Switch with light and dark | a hovered light scheme in dark mode previewed its dark sibling; a light pick painted the sibling | a preview shows the hovered scheme; a cross-mode pick is kept, the switch turns off for that scope, and the screen says so |
| Dim terminals I'm not in | never applied: the panel host never called the kind's `onFocus`/`onBlur` (audit, two panels); Glass faded at a fixed .8 even when off | the host calls them for the shown tab of the focused panel (`22-render.js`); every look dims by its own amount through real focus, off dims nothing, Glass's fade is 1 − the amount |
| Text typed under Custom (Terminal Colors, Terminal Font) | lost on reload: the Settings tome's `save()` omitted `pm51.o55Custom` (audit) | kept: a guarded exactly-once `build.py` patch writes the typed strings, never for a credential setting |
| Allowed Shell Profiles | stored; New terminal and the "+" menu offered zsh, bash, pwsh and SSH whatever it said (audit) | once a person sets it, both menus offer only what it allows; with nothing allowed here, New terminal says so. Left as it came, everything is offered (proposal 12) |
| All terminals on a terminal with its own choices | read as if All terminals did not apply: the tab's own choice stays on top by contract (audit) | the screen shows and previews All terminals, and says how many choices this terminal keeps on top |
| Import a Color Scheme in Settings | an example-only toast (audit) | opens the file chooser, imports into the terminal's catalog and makes it Terminal Colors; a bad file says why and changes nothing |

These were found and fixed during this work, and are covered by tests or films:
- Settings numbers kept a binary remainder (1.4500000000000002) and snapped Departure's 13.75-based sizes.
- Quick sets cleared other choices.
- The preview scrolled out of view.
- NieR's scaleY slice squashed the screen's text.

## Verification

Everything below ran on the final page (`0931519e`, source `077642db7c`; `matrix-page.sha256` in the evidence) unless
it says otherwise. Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-terminal-customizer-20261013/`, with
the harness hashed in `harness.sha256`. `MATRIX.html`, `matrix.json` and `matrix.tsv` here are generated from it by
`summarize.py`.

- **The option matrix.** It covers 40 options, every look (Basic, Friendly, Glass, Retro and NieR, each light and
  dark), and both scopes: 20 runs and 4,176 recorded cases on Nas1 Chrome.
  - Each case sets the option through the screen's own control. It then checks three things: the control shows the
    choice, the scope holds it (the tab, or the Settings row marked changed), and the terminal draws it.
  - Every case also records the page's look, and fails if the look drifted.
  - Results: 23 options WORKS, 10 FIXED and 6 WORKS_GPU. Burn-in is WORKS_GPU_FILM. No case failed.
  - A bundle of 32 values (33 in Glass) was set, the page reloaded, and each value read back: 644 of 644 came back.
  - The screen opened from More → Appearance… in 20 of 20 runs. Valid and invalid imports, the four quick sets, and
    your own picture's blur (sharpness 50.8 → 15.0 → 2.9 at 0 / 12 / 24 px) behaved in every run.
- **What the matrix cannot see on Nas1.** Software rendering cannot draw these, so they were measured in a Windows
  RTX 3090 browser on the final page:
  - CRT curvature, burn-in, grain and flicker. Numbers are in the share's `films/FILMS.md`.
  - Glass's Soft and Trace trails. On Nas1, Glass's long frame gaps outlast them (8 cases). On the GPU every trail
    draws in Glass and NieR, light and dark, with frame gaps of at most 18 ms.
  - Smooth scrolling's motion is not measured. Its state and resolution are.
- **Settings > Editor & Terminal.** Every Terminal look row was set through Settings' own controls in three
  bundles, then read on Home. The result is 47 of 47 rows in Basic dark, Glass dark and Retro light, in the Windows
  browser, with the look held.
- **Real focus dims.** Two panels; click into the other one and back. All 10 looks:
  - Away from focus, the terminal dims by the look's amount: Basic 0, Friendly .18, Glass .22 (text to .78),
    Retro .40, NieR .32.
  - With the option off, nothing dims. With it on, the terminal dims, and it clears back in focus.
- **Custom text survives a reload.** The earlier page `ef27f4bd` loses the typed names, as the audit found. The final
  page keeps them, and the terminal draws Dracula in DejaVu Sans Mono after the reload. Text typed under a credential
  row is never written.
- **The audit's last items, through the real menus** (`audit-items-final.txt`):
  - Allowed Shell Profiles:
    - Left as it came: zsh, bash, pwsh and SSH devbox.
    - Fish only: "None of the allowed profiles is on this computer", and the "+" menu lists no shells.
    - System Default and bash: zsh and bash.
    - PowerShell and devbox: pwsh and the SSH host.
  - All terminals on a terminal with a choice of its own says so.
  - Settings' Import a Color Scheme opens a file chooser and imports ("Saved: Terminal colors: Solarized Dark."). A
    bad file says why and changes nothing.
- **Keyboard** (Windows browser):
  - 47 tab stops, trapped and wrapping. Arrows move within the radio groups.
  - Two arrow presses step a slider twice, with focus kept.
  - Escape ends a scheme preview, then closes the screen with focus back in the terminal.
- **Narrow** (Windows browser, Glass dark and NieR light): the screen opens at 1280, 980, 700, 420 and 360 px. It
  turns narrow from 700 px down, with no sideways scroll and nothing outside the window.
- **Motion.** Three 1080p60 films on the RTX 3090 were reviewed frame by frame (the share's `films/FILMS.md`). The
  films ran on earlier pages. Every later change is listed there, and none touches entrance or effect motion.
- **Unit checks.** All nine terminal harness checks pass, including `customize.test.mjs` (10 cases). The three
  generators' `--check` passes.

Two harness defects were found and fixed along the way. Their rows are kept in `superseded-*`:
- The look was set with a bare `PM_THEME.setFamily`, which the first All-terminals save put back to the stored look.
  Most All-terminals runs therefore measured Basic dark. The harness now stores the look as the look menu does and
  guards every case.
- The first "Dim terminals I'm not in WORKS" checked only the amount and a forced dim of the preview, never the real
  trigger. The real-focus pass above replaced it.

## Changed paths

Source:
- `Concepts/home-redesign/src/terminal/js/77-customize.js` (new): the Customize screen.
- `Concepts/home-redesign/src/terminal/css/26-customize.css` (new): its look.
- `Concepts/home-redesign/src/terminal/js/42-appearance.js`: Settings link, layers, faces, weights, text
  drawing, Sixtyfour axes, Glass-only opacity, picture blur, import, preview pairing.
- `Concepts/home-redesign/src/terminal/js/76-popover.js`: the terminal surface goes to the screen; the editor
  popover is unchanged; New terminal says when none of the allowed profiles is here.
- `Concepts/home-redesign/src/terminal/js/20-metrics.js`, `js/24-renderer.js`: Crisp and textRendering.
- `Concepts/home-redesign/src/terminal/js/52-fx.js`: CPU strengths.
- `Concepts/home-redesign/src/terminal/js/70-view.js`: Crisp measure, close on hide, recolour origin.
- `Concepts/home-redesign/src/terminal/js/90-kind.js`: `PMT.Appearance.importFile`; `profiles()` honours Allowed
  Shell Profiles.
- `Concepts/home-redesign/src/terminal/css/60-motion.css`: the `.pmt-cz` motion tokens.
- `Concepts/home-redesign/src/terminal/css/30-looks.css`: Glass's inactive fade follows the dim amount.
- `Concepts/home-redesign/src/panels/js/22-render.js`: `syncBodies` calls `onFocus`/`onBlur` (8 lines; asked by the
  coordinator, mailed with the exact lines because pm7-panel-dnd also edits this file, in other hunks).
- `Concepts/onboarding/opus-5.5/tools/build.py`: `CUSTOM_TEXT_PATCHES`, the tome `save()` patch (asked by the
  coordinator; lines mailed to pm7-perf-impl-sol).
- `Concepts/home-redesign/src/terminal/harness/checks/customize.test.mjs` (new).
- `Concepts/onboarding/opus-5.5/src/settings/kit.d/24-terminal-look.js` (new, additive; coordinated with the
  coordinator, the Settings owners and pm7-wallpapers).

Generated with `build.py --publish-pm7`, `build_home.py` and `build_rail.py`:
- `Concepts/PMConcept7.html`
- `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html`
- `Concepts/HomeTestPMConcept7.html`
- `Concepts/LeftRailPMConcept7.html`

Page delta against the base: only the `pm-home-js`, `pm-home-css` and `pm4-settings-js` blocks changed. 61 of 64
blocks and all markup are byte-identical. The Settings script's change is the new file plus the tome's one `save()`
line.
