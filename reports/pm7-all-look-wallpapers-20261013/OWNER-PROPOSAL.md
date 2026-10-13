# Owner proposal: wallpapers for every look (pm7-wallpapers, 2026-10-13)

This is a proposal only. It makes no Plans, canon or governance edit. It lists what Jared's direction needs from the
owners of canon, Settings, commands, wiring and Glass once he approves the set. His words, 2026-10-11: "add a setting
in settings to change wallpapers ... The user should be able to choose any wallpaper for their background though.
Ribbon is default for the glass theme. This will require a plan, dry, command, wiring update as well." His words,
2026-10-13: "5 options for wallpapers for the other themes each. All are selectable by any theme."

What exists now, on branch `concept/pm7-all-look-wallpapers-20261013`, is a concept overlay. `Concepts/wallpapers/opus-5.5/`
holds the catalog, 40 new prints, thumbnails, the gallery and the paint, and `CONTRACT.md` explains them. The review
page in `share/2026-10-13-wallpapers/` layers it onto the published PMConcept7 and Glass.

## Decisions for Jared (cards)

| Card | Question | Proposed answer |
|---|---|---|
| W1 | Approve the 20 new wallpapers (5 each for Basic, Friendly, Retro, NieR)? | Yes, from the review page and the gallery sheet. |
| W2 | Does a look other than Glass get a default wallpaper, or keep its own ground until the user picks one? | Keep its own ground. The Friendly dot ground, the Retro grid and NieR's scenes are part of those looks. If Jared wants defaults, the candidates are Dot Wave (Friendly), Blueprint (Basic), Horizon (Retro) and Archive (NieR). The catalog's `default_for` takes them with no code change, after Glass follow-up G2. |
| W3 | One wallpaper choice for every look (as built), or one per look? | One choice for every look, as Jared asked ("any wallpaper for their background"). "Look's own" gives each look its own default. |
| W4 | Should a chosen wallpaper replace NieR Mode's ink scene while it is chosen? | Yes, as built. "Look's own" brings NieR's background setting back. |
| W5 | Under Liquid Glass, the old "Glass background" row (Mesh, Depth, Minimal; F3-428) paints nothing, because the wallpaper replaced the cloudscape. Retire it, or keep it for Glass without Liquid Glass? | Retire it when Liquid Glass ships, and let Wallpaper be the one background control. This row was not changed here. |

## Canon (Plans owners; one reseal after Jared's answers)

1. Decision Log: one entry recording the two quotes above and Jared's answers to W1 to W5.
2. `Plans/settings_inventory.json`: a new row `general.visual.wallpaper`.
   - App & Input > Theme & colors, right after `general.visual.theme-mode`.
   - Kind `gallery`. Values: `look` (default) or a catalog id.
   - Not family-gated, because it shows in every look. This is a stated exception to the family-row rule in
     `Plans/Settings_System.md#SSYS-010`.
   - Saved with the project's other look settings, as Theme is, and applied before the first frame with them
     (DL-153 / F3-600 pre-paint).
3. `Plans/FinalGUISpec.md`:
   - Amend F3-427 / F3-428: the Liquid Glass wallpaper replaces the cloudscape modes. If W5 is accepted,
     `glass_background_mode:v1` retires in the F3-444 storage tables.
   - Add one unit for the wallpaper gallery: one radiogroup, "Look's own" first, families in catalog order,
     thumbnails, the keyboard model, no motion, five columns falling to two, and the look's control tokens with no
     pills (DL-184 / F3-648).
   - Add one unit for the paint in each look: Glass's frost and rims come from the chosen print. Basic, Friendly,
     Retro and NieR Mode show it around the opaque panels, with a light veil on the Usage board and Settings Home.
     A missing or stale id falls back to "Look's own".
4. `Plans/DRY_Rules.md`, one rule: there is one wallpaper catalog and every surface reads it. Today that is
   `catalog.d` merged by `build_walls.py`. In the product it is one registry. No surface keeps its own list, the way
   `glass.js` keeps `WALLS` today. Each print comes as a dark and a light pair, and the mode picks the print.
5. `Plans/UI_Command_Catalog.md` and `Plans/Commands_System.md`: one command, for example
   `cmd.appearance.wallpaper.set { id | "look" }`. The gallery and any future palette entry ("Wallpaper: Hills")
   both use it, with the same refusal for an unknown id: it falls back to "look" and says so.
6. `Plans/Wiring_Matrix.md`: the gallery leads to the command, then to the setting write (the existing
   `commitSettingValue` path, so the settings owner transaction and refusals apply), then to the paint on
   `<html data-lg-wall>`.
7. Settings search: once the inventory row exists, the row is found as "Wallpaper", "background" or "backdrop". The
   overlay row is not in the search index today.

## Product wiring (Settings owner, onboarding/generator owner)

- Render the row from the inventory instead of injecting it, and keep the markup and classes in `CONTRACT.md`, so the
  CSS carries over unchanged.
- Persist through the project settings transaction instead of `localStorage['pm-lg-wallpaper']`. The concept key
  migrates once.
- Load prints as files, not data URLs, so the page does not grow by about 4.9 MB for 56 prints. Keep the 320 x 180
  thumbnails for the gallery.
- First paint: apply `data-lg-wall` in the pre-paint layer with the theme, so a reload never shows the look's own
  ground for a frame.

## Glass follow-ups (pm7-liquid-glass)

- G1: drop `WALLS`, `pickerHtml`, `mountPicker` and `renderPickers`, the concept control's three wallpaper buttons,
  and the per-id rules in `glass.css` sections 1 and 9. The catalog-generated rules cover every id.
- G2: `applyWall` reads the catalog for "Look's own" (`default_for`) instead of hard-coding Ribbons. This is needed
  before W2 can give another look a default.
- G3: confirm the transcription in `catalog.d/10-glass.json` and the 10 byte-identical prints copied from 6b18ee4755.
  Glass owns that file from then on.
- G4: swap the wallpaper and its frost in one frame inside `glass.js`. A 60 fps film on the RTX 3090 (2026-10-13)
  shows the sheets keeping the old print's frost for 17 to 29 frames (283 to 483 ms) after each wallpaper change,
  because the frost is baked after `--lg-wall` changes. `wallpapers.js` now covers this from outside: in Glass, the
  body keeps the previous print until glass.js writes the new `--lg-frost-*`, then both change together, with a
  1.5 s cap. The same lag applies to glass.js's own concept control, which this does not cover. Inside glass.js the
  fix is to keep painting the old print until `applyFrost` lands the new one, after which the hold here can go.

## Jared's broader direction (context, not done here)

These were in the same message and belong to other owners: spreading Friendly's dot pattern to Settings, Usage, the
left rail and the new chat transcript; the new chat's Glass effect; the tab-switch aberration and switch shape; the
Usage animations; the search boxes; the theme switcher; and the onboarding art. The dot pattern now appears in every
Friendly wallpaper, and the gallery shows Friendly's dot ground for "Look's own", but the spreading itself is not
done here.
