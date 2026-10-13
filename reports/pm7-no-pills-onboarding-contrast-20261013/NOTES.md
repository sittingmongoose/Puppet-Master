# Onboarding label words: contrast amendment (no-pills phase 3, 2026-10-13)

From pm-mail `pm7-no-pills` (Claude Me, Opus 5.5, xhigh, fast off), under
`/mnt/Cursor/share/puppet-master/2026-10-13-creative-queue/ONBOARDING-CONTRAST-AMENDMENT.md` (SHA-256 `9b1d8ee1…2424`) with
GO v2 (`2ba171bb…20ec`). The phase 3 checkpoint report (`reports/pm7-no-pills-onboarding-20261013/NOTES.md`) and its
144-file evidence are unchanged. Not landed; no lock.

## Where it is

- Branch `concept/pm7-onboarding-labels-20261013`. Start 29cdc86e3c9078d94260b79905e6ae49c169305c (clean).
- 5c08689c4a: `src/css/10-window.css`, `12-components.css`, `40-tour.css`, `41-tour-nier.css` and the regenerated
  `PMConcept7.html`, `Onboarding concepts/TestOpus5.5PmConcept.html`, `HomeTestPMConcept7.html`, `LeftRailPMConcept7.html`
  (build.py --publish-pm7, build_home.py, build_rail.py, all --check ok; each page differs from 29cdc86e3c only inside
  the O55 CSS block). This report follows in its own commit.
- Pages (SHA-256): checkpoint PM7 = TestOpus = HomeTest `11348f49…36b8`, LeftRail `4661f3c2…021d`; now PM7 = TestOpus =
  HomeTest `88ed754dab14c13980dbfb25bb9eee510ae830110b2cef5397ded6b7ba1eba1c`, LeftRail
  `13d002fc7057c17270cbc149457cee588df423b8a3543fa5a5359901d7cba8bb`.
- Sources now: 10-window.css `a2b5882d…5792`, 12-components.css `21233de3…66e3`, 40-tour.css `d4684716…d7f9`,
  41-tour-nier.css `8eba8cf4…a0b1`; 11-window-nier.css (`fa48cbe6…`) and 13-nier-look.css (`25df6a7c…`) unchanged.
  Frozen and unchanged: `tools/onboarding_label_check.mjs` `bce699eb…4b6c`, `tools/pill_check.mjs` `2d2ed65d…0041`,
  `tools/settings_nopills_accept.mjs` `f0f9293c…2728`.
- Evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-no-pills-onboarding-contrast-20261013/` (60 files, `SHA256SUMS`
  `bb96ea189abdc3ce03b68036f7efa8475c7b975a527a7ea5e70795a6b1ea7528`, README there).

## What changed: label inks

A bare label word reads 4.5:1 or more on what it sits on. It keeps its tone's hue; where a look's tone is too light for a
word it takes that tone toward black (`color-mix(in srgb, tone K%, #000)`, Slint's `mix`) by the least that reads on its
darkest measured ground, with a few points of margin. Custom properties on `#pm-o55-onboarding` and `.o55t-root` (no
global theme token changed):

| Look | Word (selector) | Ink | Before -> after (lowest ground) |
|---|---|---|---|
| Basic Light | Needs sign-in, Rate limited (`.o55-pill-needs`) | orange 74% | 3.03 -> 5.00 |
| Basic Light | Git (`.o55-pill-ready`) | lime 88% | 4.01 -> 4.91 |
| Friendly Light | tags, route, Checking…, Needs sign-in, Try it | coral 66% (terracotta) | 2.64-3.15 -> 4.94-5.70 (4.94: a tag on a chosen card) |
| Friendly Light | Git | lime 76% | 3.07 -> 4.96 |
| Glass Light | tags, route, Checking… | blue 70% | 3.32-4.77 -> 4.90-7.04 (4.90: a tag on a chosen card) |
| Glass Light | Needs sign-in / Git / Try it | orange 88% / lime 94% / magenta 72% | 4.06 / 4.49 / 3.42 -> 5.01 / 4.96 / 4.75 |
| Retro Light | Needs sign-in / Git | orange 61% / lime 93% | 2.11 / 4.42 -> 5.02 / 4.94 |
| NieR Light | practice marker (`.o55p-badge`) | NieR ink | 4.21 -> 7.97 |

Every other look and word keeps its checkpoint ink exactly (dark looks read 6.1:1 or more; NieR Dark's practice marker
keeps its 5.7:1). The status marks keep their tone: `.o55-pill-ready > .o55-sg` and `.o55-pill-wait > .o55-spin` are
pinned to the tone they had (not under NieR, whose marks follow NieR's status inks as before).

## Source-owner look

Reviewed on amended screenshots (where, c-review, free, safe in Friendly, Glass, Basic and Retro Light). Friendly Light's
tags, route and statuses become one warm terracotta that sits well on its paper; Glass Light's tags and route a deep blue
that holds on the blue tint of a chosen card; the needs words a burnt orange; Git a deeper green. The words read as part
of each look, not as warnings, and their marks keep the brighter tone beside them. Nothing else moved.

## Targeted checks run (Nas1, probe in the evidence)

- Before, on the checkpoint page, 12 look variants: window views and tour words. Real lows were the Light-look words
  above and NieR Light's marker. NieR readings at 2.6 s caught the stepped ink inversion still arriving; settled at 4 s
  NieR's chosen card and NieR row read 10:1 and more in both modes and with the Square part off (shots in evidence).
- After, on the amended build, 12 variants: 384 readings, none under 4.5:1, every look's lowest >= 4.75:1; only the words
  above changed ink (286 readings identical); 60 status marks with identical computed ink. On the final page the NieR
  tour words were re-measured after the marker rule was limited to NieR Light (the only rule that differs).
- Generators: build.py, build_home.py and build_rail.py --check ok. Frozen tools not run or changed; no matrix.

## Unchanged and still open

- The original checker's own judgement is not used here (it lists low contrast without failing); Sol's successor gate
  is separate.
- Unverified: the Wizard header's "Practice" marker has no visible size at 1440x900; `.o55-pill-fail` and
  `.o55-officialurl` have no renderer (their inks are unchanged).
- Planning Wizard `.pm6-wiz-schip`, `.pm6-wiz-statepill`, `.pm6-wiz-topic-prog`, the rail art, swatches and list box: as
  in the checkpoint report, unchanged and open.
- Procedure: in NieR the probe's tour reached the planning step through the app's own page switch (PM_PAGES.go) when its
  Show Me did not finish within 8 s; recorded in the probe logs.
