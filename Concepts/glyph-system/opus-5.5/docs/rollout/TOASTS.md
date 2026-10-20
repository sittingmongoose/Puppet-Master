# Rollout spec: toasts and notifications adopt the neon glyph set (pm7-glyphs, D44)

Status: READY (planner's go, 2026-10-11). Surface 4. No other thread owns the toast code today.

## Where toasts live
The toast stack and the notification inbox are in the pinned base page `Concepts/Onboarding concepts/TestPMConcept.html`
(search `#pmToastStack`, `.pm-toast`, `toast.important`, `window.toast`, `#notifySlot`); the base is pinned by SHA in
`Concepts/onboarding/opus-5.5/tools/build.py` and is NEVER edited. The Usage page's own `#pm7uToast` (text only) is out
of scope. The runtime census saw the toast dismiss as a text "×" and the four durable kinds (success, warning, error,
info) pushed through `toast.important`.

## Edit
1. Read how the base builds a toast (markup, the kind classes, the dismiss button, any icon it already draws) and the
   notification inbox's rows. Write down what you find in the step's record first.
2. Make the change through the glyph layer, never the base: add a `PATCHES` list to
   `Concepts/glyph-system/opus-5.5/tools/glyph_layer.py` (old text, new text, label), applied in `apply_published` with
   the `need`/replace-exactly-once discipline `build.py` uses (`replace_once`: fail loudly when the old text is not found
   exactly once), and list each patch's label in `published_problems`' checks. Keep each patch as small as possible.
3. Kind marks: success -> `PMG.status('complete', 16, 'nx-still')`, warning -> `'warning'`, error -> `'failed'`,
   info -> `'info'`, placed before the toast's text, beside it, never replacing it; when `window.PMG` is missing the toast
   renders exactly as before. Dismiss "×" -> `PMG.icon('close', 14, 'nx-r-control')` inside the same button (keep its
   aria-label, add one if it has none: "Dismiss").
4. The notification inbox rows: the same kind marks; the bell -> `bell`.
5. Reduced Motion: the marks are lit and still (nx-still). No pills, side stripes or emoji.

## Gates
- `python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7` and `--check`; `build_rail.py --check` (or `build_rail.py --out PATH` for a private comparison).
- A P1000 GPU check: push one toast of each kind (`toast.important(...)`, read the base for the call) in all ten looks,
  screenshot each, and measure each mark's contrast against its toast's field (>= 3:1); a short H.264 film of the four
  kinds arriving and being dismissed, plus Reduced Motion.

## Notes from the step (2026-10-11)
- The live toasts are the title-bar notify (`#rsStage`, `#rsStack`, `#rsPanel`); `#pmToastStack` / `.pm-toast` is retired
  in the base. The base spells the warning severity `warn`.
- The gate measures marks on the toasts' own severity-tinted cards; the inks are fitted to those fields too
  (`src/data/ink-fields.json`). Record: TOASTS-RECORD.md.
