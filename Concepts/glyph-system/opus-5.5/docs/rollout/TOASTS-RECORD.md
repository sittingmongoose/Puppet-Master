# Rollout record: toasts and notifications (pm7-glyphs, D44)

Status: NON-BROWSER GATES PASSED on concept/pm7-glyphs-toasts-20261011. Surface 4. GPU gate (lead, P1000)
not run yet: one toast of each kind in all ten looks, contrast >= 3:1, arrival/dismiss film, Reduced Motion.

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
