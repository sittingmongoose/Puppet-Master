// Lane M calibration (2026-11-12): H=21/24/36/38 marked elements, 18 on/off first-frame measurements.
// Counts cluster near 2H; the largest remainder R-2H was 19. Retain the original 150/~50 allowance as a
// conservative ratio cap of three per marked element (treating every original loop as a separate element).
// This scales with the mechanism's population; it does not excuse the old 650–730-element selector spread.
// Validated on H=40 with natural Agents loaders and H=92 with 17 real product loaders (68 extra frame groups):
// the latter restyles 187–192 elements, versus 51–58 at H=24, and stays below 2H+19 without changing the envelope.
export function toggleCost(restyled, held, legacyCap = 150) {
 const valid = Number.isFinite(restyled) && restyled >= 0 && Number.isInteger(held) && held >= 0 && Number.isFinite(legacyCap) && legacyCap >= 0;
 const ratioCap = legacyCap / 50;
 const limit = valid ? Math.min(2 * held + 19, ratioCap * Math.max(1, held)) : null;
 return { pass: valid && restyled <= limit, limit, held, restyled, ratio: valid ? restyled / Math.max(1, held) : null, ratioCap };
}
