// Lead's mechanism rule (2026-11-12): 42+60 measured toggles, H=21–92, R/H=2.033–2.792,
// max(R-2H)=19. About two elements per marked element plus nineteen independent elements were measured.
// Allow three per marked element, plus nineteen, so a few unrelated elements in that frame are not a regression.
// This still rejects Usage118/H21 (limit82) and the old650–730-element generator at ~50 loops (limit169).
export function toggleCost(restyled, held) {
 const valid = Number.isFinite(restyled) && restyled >= 0 && Number.isInteger(held) && held >= 0;
 const limit = valid ? 3 * held + 19 : null;
 return { pass: valid && restyled <= limit, limit, held, restyled, ratio: valid ? restyled / Math.max(1, held) : null };
}
