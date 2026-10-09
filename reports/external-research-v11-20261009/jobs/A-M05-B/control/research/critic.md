# Critic pass on the complete researcher draft

**Role/pass:** research-draft critique after `draft.md` existed. This is a role-separated pass by the same thread/agent, not an independent fresh actor; nested agents are explicitly barred by the assignment. Keep that limitation visible.

## Checks against the assignment

- **O1 — useful tools/approaches:** Covered by Able Player/VTS, Subtitle Edit 5, Amara, YouTube Studio, and the native HTML track architecture. They are materially distinct. Better show explicitly that the plan's WebVTT element is already covered while the remaining specifications are corrections/additions.
- **O2 — primary behavior/defaults/types/limits:** Good details on `kind`, `srclang`, one default, cue start/end ordering and allowed overlaps, player remote-caption loss, and mixed local/remote ASR. Add explicit timing units/form (WebVTT millisecond timestamps/playback offsets) and distinguish the WebVTT specification's requirements from project house-style readability thresholds.
- **O3 — issue/fix/release chain:** Adequate, accurately attributes the 17/60 report to its author and distinguishes `develop` merge from a shipped release. The proposed regression fence should check that the fresh build and production bundle are both tested.
- **O4 — every P clause and categories:** All six clauses are quoted, but the row-level tags do not literally distinguish “already covered” from “corrected”; make the P1 disposition explicit. P2 is a user decision among alternatives; P3's draft-only automation is optional; P6's scanner is optional. Make those classifications explicit rather than leaving them in prose.
- **O5 — self-contained scope and uncertainty:** Covered with user decisions, alternatives, conditions, risk, and explicit legal-jurisdiction uncertainty. Preserve the original forty-recording scope and avoid turning WCAG guidance into a legal conclusion.
- **O6 — discriminating checks:** Checks are separated from executed actions and are specific enough to distinguish native controls from Able Player, format conversion, draft language quality, rights, and correction publication. They are proposals, not test results.

## Corrections for the reviser

1. In P1, say WebVTT is already the useful web-delivery choice in the plan, then specify missing track semantics, per-language tracks, format/browser matrix, hosting/rights decision.
2. Add explicit cross-clause categories: **already covered**, **correction**, **optional enhancement**, **user decision**, **rejected as sufficient**, and **uncertain**. Do not force a category where it does not apply.
3. Specify cue timestamps as playback offsets represented in WebVTT timestamps at millisecond precision; validate timing against the actual file rather than frame assumptions. Do not invent a required CPS/line-length number.
4. Add a directly located source for WCAG 2.2 SC 1.2.5 audio description and, if used, a small supplementary source record; do not mutate the frozen pre-plan discovery.
5. Keep claim attribution for project issue reports, do not state that #778 shipped, and keep all implementation/accessibility/rights checks in the “proposed” lane.

