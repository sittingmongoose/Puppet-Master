# Round 4 contrast result (2026-10-14 night)

From pm7-editor-customizer. Head `0475f5713f`, final page `a86f94f0e6e8518d…`. Everything was measured on Nas1 with the
landing worker's harness (`/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-editor-customizer-landing-20261014/`), copied
unchanged except for an `ariaHidden` flag on each row. Raw runs and the scripts are in
`/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-editor-customizer-20261014/round4/`.

## Result

- **Customize screens (editor and terminal), the editor and the terminal preview:** 0 words confirmed under 4.5:1 in
  any of the ten looks, with Reduced Motion and without. That includes:
  - placeholders;
  - selected text, focused and blurred;
  - the pseudo-element pictures;
  - the terminal canvas.
- **Runs:**
  - The full sweep ran on page `20fe7aec…`, all ten looks, both motion settings. Motion never changed a reading.
  - The screens and the terminal ran again on page `cb1e07dc…`, all ten looks, after the last colour fixes.
  - The final page adds only the caret and current line drawn on the editor beside the screen, which changes no
    colour.
- **A stricter pixel pass:**
  - The harness confirms a word only when its estimated colour pair appears on the screenshot. Small text and text
    drawn under effects never match exactly, so I also measured every remaining estimate under 4.5:1 from its
    pixels.
  - I measured the terminal's words as drawn too.
  - That found three more, all fixed: Friendly light's green kicker (3.21), NieR dark's hovered scheme meta (3.41) and
    Retro dark's branch name under scanlines and glow (3.84, now 4.59).
  - What that pass still lists is not text under the floor:
    - "Tokyo Night" sits under the screen's footer at that scroll.
    - "and" and "->" in NieR's Ligatures card have small boxes that hold only anti-aliased edge pixels. The same
      line's letters read 6.71 in light and 5.36 in dark.

## The lowest reading per look

The lowest of four readings: screen text, selected text, the pseudo-element pictures and the terminal canvas.

| Look | Screen text | Selected text | Pictures | Terminal | Lowest |
| --- | --- | --- | --- | --- | --- |
| Basic dark | 4.61 | 4.75 | 5.66 | 4.51 | **4.51** |
| Basic light | 4.60 | 4.70 | 4.55 | 4.51 | **4.51** |
| Friendly dark | 4.74 | 4.65 | 5.95 | 5.54 | **4.65** |
| Friendly light | 4.55 | 4.66 | 4.91 | 4.61 | **4.55** |
| Glass dark | 4.81 | 4.91 | 7.67 | 5.29 | **4.81** |
| Glass light | 5.38 | 4.69 | 4.94 | 4.50 | **4.50** |
| NieR dark | 4.70 | 4.74 | 7.02 | 4.53 | **4.53** |
| NieR light | 4.56 | 4.69 | 4.69 | 4.50 | **4.50** |
| Retro dark | 4.98 | 5.28 | 9.25 | 4.59 | **4.59** |
| Retro light | 4.88 | 6.60 | 6.31 | 4.51 | **4.51** |

Where each reading comes from:

- **Screen text:** the scanner's conservative estimate where it holds 4.5, or the pixel ratio where a candidate was
  confirmed. It is from page `cb1e07dc`.
- **Selected text and pictures:** from the pixels on page `20fe7aec`. No editor colour changed after it.
- **Terminal:** the words as drawn, on page `cb1e07dc`. Retro dark is read under its scanlines and glow, with the
  renderer's floor raised to 5.43.

## Exemptions

- **Scheme thumbnails.** They are pictures, hidden from screen readers (`aria-hidden`), and the scheme names beside
  them read 4.5:1. The sample code inside a thumbnail keeps the scheme's own colours, so it shows what the scheme
  looks like.
- Nothing else. Disabled text reads 4.5:1 (EC-01 allowed 3:1).

## EC-11: Settings rows already under 4.5:1 on main (listed, not fixed)

Each row below is confirmed by the landing harness's pixels on the final page, and the same row reads under 4.5:1 on
main `fbc3871593`. Main was scanned the same way, with the groups' scroll reveal held at its end state. None of these
styles is in a file this branch touches, so per the ruling they are listed here, not fixed.

| Lowest | What | Looks | Where it comes from |
| --- | --- | --- | --- |
| 1.76 | The chosen "Balanced" button (`button.active`) | NieR dark, Retro dark | shared Settings segmented button |
| 2.38 | Placeholders "Automatic" and "Nothing" (`input.text-control`) | 7 looks | shared Settings input placeholder |
| 2.66 | "System Default" (an inherited value's label) | Friendly light | `settings/kit.d/10-values.js` style |
| 3.09 | "Set a number" (`button.o55-textbtn`) | Friendly light | shared Settings text button |
| 3.25 | Rail headings "Chapters", "Essential setup" | 6 looks | Settings rail |
| 3.73 | Rail subtitles (`small`) | Basic light, Friendly dark, NieR dark, Retro dark | Settings rail |
| 4.04 | NieR dark descriptions, search placeholder, index links and page index titles | NieR dark | NieR's Settings colours |
| 4.35 | NieR dark project line and workspace tabs | NieR dark | NieR's Settings colours |

The branch's own new Editor look rows inherit NieR dark's description colour and read 4.04 there, the same as main's
rows. Seven looks are identical on main and the branch, and the branch adds no Settings row under the floor of its own.

## How the Settings comparison was made

`settings-audit3.mjs`, in the round 4 harness folder, is the landing scanner limited to Settings > Editor & Terminal.

- It ran on main's page and on the branch's, in a fresh browser per page and look.
- The groups' scroll reveal (`is-revealed`, which fades a group in from 55 %) is held at its end state.
- Without that, the scan read groups mid-fade under load, and the branch seemed to add rows that were only a frame of
  the fade.
- It does not confirm with pixels, so in Glass dark and NieR it reads layered grounds lower than the landing
  harness's pixel-confirmed list does.
