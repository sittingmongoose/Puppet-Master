# Rollout record: toasts and notifications (pm7-glyphs, D44)

Status: GATES PASSED; merged into concept/pm7-glyphs-20261010 (2107a86893) with the lead's ink fixes (141790bc20,
cb314e3d33, 74b83ff1d4). Surface 4.

## Step 1: how the base renders toasts and the inbox

Base: `Concepts/Onboarding concepts/TestPMConcept.html` (pinned SHA `b3888fad…`; never edited).
The live system is the title-bar notify in `#notifySlot`, built by the `window.toast` IIFE in the
PMConcept6 globals block (~line 56017). The bottom `#pmToastStack` / `.pm-toast` stack is retired:
`display: none !important` (lines 4489-4490, 16641, 16694), an empty hidden div (line 34170), no JS
builds a `.pm-toast` anymore. The Usage page's own `#pm7uToast` (text only) is out of scope per spec.

Hosts (static markup, lines 25834-25855): `#rsStack` (the card stack; `role="button"`,
`aria-label="Notifications"`) with the inline empty-bell svg (`.rs-empty-bell`, 16×16,
`stroke-width="2"`), `#rsClip` (stack cards), `#rsBadge` (count), `#rsStage` (arriving toasts),
`#rsPanel` (the inbox dialog, `aria-label="Notification inbox"`) with `#rsList` rows.

Flows: `toast(string)` → ephemeral stage card that fades (`stageToast`, kind `ephemeral`);
`toast.important` / `toast.push` / object form → stage card that joins the durable stack
(`pushMsg`), capped at 12 items, 4 visible; clicking the stack opens the inbox panel.
Kind classes are `n-sev-info|success|warn|error` (`--n-accent` tint; base spells it `warn`).
Callers push `info` (default), `success` (Settings `showToast`, line 42948), `warn` (`addNote`
warn flag, line 78423; `showToast` warning), `error` (gate-decline recovery, line 56351).
Warning and error arrive `important`; success and info are ephemeral.

Three render sites, each drawing a 7 px `.n-sev-dot` before the text and a text `×` dismiss
(`button.n-x`, every one already carries `aria-label="Dismiss"`); no site draws an icon today:
- stack cards (`renderStackNow`, line 56124): dot + `.n-title` + dismiss, in a 28 px flex card;
- inbox rows (`fillPanelContent`, line 56230): dot + `.meta` (kind tag, title, body) + dismiss;
- stage toasts (`stageToast`, line 56455): `.n-row` of dot + title + dismiss over `.n-body`.

## Change

Seven patches in `glyph_layer.py` PATCHES (replace-exactly-once; one published_problems probe each),
regenerated into the built pages (23 lines each, patch hunks only):
- `toast kind-mark helpers`: `pmgSev` (success->complete, warn->warning, error->failed, else info),
  `pmgMark` (`PMG.status(key, 16, 'nx-still')`, dot fallback), `pmgX` (`PMG.icon('close', 14,
  'nx-r-control')`, × fallback);
- `toast stack card marks`, `toast inbox row kind mark` + `toast inbox row dismiss`, `toast stage
  marks`: the three render sites draw the mark before the text and the close glyph in the same
  button (aria-label kept); text, titles and bodies untouched;
- `toast empty bell`: boot swaps the bell svg for one `PMG.icon('bell', 16)` element keeping its
  `rs-empty-bell` class (same CSS); base svg stays without PMG;
- `toast dismiss seating`: `.n-card .n-x > svg.nx { display: block; }`, so the glyph sits on the
  button's box as the × did. No pills, stripes or emoji; marks are nx-still, and the neon CSS stops
  every act under Reduced Motion (media query, `html[data-motion]`, NieR).

## Gates

- `build.py --publish-pm7` then `--check`: pass (`check ok`); `glyph_layer.py`: block 237,054 bytes,
  0 body[data-theme left.
- `build_rail.py --check`: stale after the republish (expected: PMConcept7 is its input);
  regenerated, then `check ok`.
- `node --check` on all 26 scripts extracted from the built PMConcept7: pass, including the patched
  `pm6-js-globals` and `pm-glyph-js`.
- Node smoke test (/tmp, not committed): the real glyph layer loads with zero registry problems;
  success/warn/error/info render `nx-still` marks in tones done/attention/blocked/idle, unknown
  severities fall back to info, and the no-PMG fallbacks are byte-exact base markup.

## GPU gate (lead, P1000 Quadro P1000; /mnt/Cursor/PuppetMaster-Evidence/tests/pm7-glyphs-20261010/toasts-gate/)

`scripts/toasts.mjs` pushes one `toast.important` of each kind (success, warn, error, info) in all ten looks and
measures every neon glyph in the stage, the stack and the inbox: its computed ink (times its rendered opacity) against
the median of the pixels rendered behind it with every glyph hidden (so Glass's blur and the severity tints count).

- Run 1 (the worker's build): the info mark read 2.1-3.0:1 on its blue-tinted card (it was the idle tone, the quiet
  just-over-the-gate grey); four live marks read 2.8-3.0 on cards tinted their own hue; the dismiss (the base's x at .72
  of the muted ink) 1.4-2.7; the empty bell 1.9-3.6. The deck's back cards (opacity .37-.84) are faded on purpose and are
  not counted.
- Fixes (lead): info takes the paused tone (a notice to read, still an unlit grey); `tools/tune_inks.py` also fits each
  tone to the toast fields its tokens do not name, measured in run 1 (`src/data/ink-fields.json`, to 3.2:1 there, since a
  toast's arrival and Glass's blur move them); a quiet tone lifts past its window only as far as a toast needs (Glass
  Dark's paused); NieR Dark's paused alpha .6; the dismiss takes the secondary ink at full strength and the empty bell
  the primary ink (pm7-bridge.css).
- Final run on 74b83ff1d4 (`results/final-toast-marks.json`, sha256 a50ca05a9ff40ae2...): 204 front-card marks, lowest
  3.16:1 (NieR Dark failed); dismiss lowest 3.83; empty bell lowest 4.24; 0 page errors. Frames:
  `results/stage-grid.png` (the four kinds arriving, every look) and `results/inbox-grid.png`.
- Film (`films/toasts-film.mp4`, 3 min 26 s, H.264 1920x1080, sha256 8ad27032c17c108a..., on a3ce78ba49; all ten looks then
  Reduced Motion in Basic Dark and Retro Dark): the four kinds arrive, join the stack,
  the inbox opens, each dismiss is hovered (the control ignites) and pressed. Frame review: marks and dismisses read in
  every look; Reduced Motion still and lit. Seen in passing, not ours: Friendly drew the toast cards as capsules (told
  pm7-no-pills, who squared them on their branch).

