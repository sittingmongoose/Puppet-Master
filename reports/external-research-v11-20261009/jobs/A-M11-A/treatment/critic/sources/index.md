# index.md — navigable index for the critic stage's sources

Case A-M11-A / treatment / critic · created 2026-10-09T20:49Z · usage/billing: unobserved, null.

## Inherited sources (immutable, not restated here)

S01–S22 — full records, locators, access timestamps (2026-10-09 20:19–20:27Z), and bounded
evidence files live in the predecessor map: `../../research/source-map.json`
(sha256 6cf438a6…) with evidence under `../../research/sources/`. No rebinding; this stage cites
them by ID exactly as registered there. Depth note: only S02 was fully read by the predecessor
(2273 B evidence file); S01/S03–S22 are search-capture depth per their observed_operations.

## New sources registered by this critic run (details in ../source-map.json)

| ID | Short name | Kind | Version | Accessed (UTC) | Evidence |
|----|-----------|------|---------|----------------|----------|
| S23 | Able Player README (main) | primary code README | main 2026-10 | 20:44 | S23-S34-critic-verifications.md#s23 |
| S24 | MDN `<track>` element | official docs | live | 20:44 | #s24 |
| S25 | WAI Selecting Tools (re-visit of S15) | primary guidance | live | 20:44 | #s25 |
| S26 | GitHub API releases list (20 newest) | primary releases (API) | v3.2..v5.1.0-beta2 | 20:45 | #s26 |
| S27 | GitHub API tag v4.4 | primary release (API) | v4.4 | 20:47 | #s27 |
| S28 | GitHub API tag v5.0.0 | primary release (API) | v5.0.0 | 20:47 | #s28 |
| S29 | GitHub API tag v4.5 | primary release (API) | v4.5 | 20:47 | #s29 |
| S30 | whisper/transcribe.py (main) | primary code | main 2026-10 | 20:48 | #s30 |
| S31 | whisper README (main) | primary code README | main 2026-10 | 20:44 | #s31 |
| S32 | W3C H95 (re-visit of S07) | WCAG technique | live | 20:45 | #s32 |
| S33 | SubtitleEdit repo (re-visit of S12, deeper) | primary code | 2026-10 | 20:45 | #s33 |
| S34 | Argos PyPI (re-visit of S22) | primary package | 1.11.0 | 20:45 | #s34 |

## Drift measured this run (live vs predecessor capture)

- Whisper `--model` default: predecessor "small" (S04) → live "turbo" (S30/S31). critique.md M1.
- Able Player releases: predecessor top entry v5.0.0-RC1 (S02) → live includes v5.0.0 stable
  2026-06-21 and v5.1.0 betas (S26/S28). critique.md M2.
- v4.4/v4.4.1/v4.5 dates: predecessor 2023-11-16/2023-11-21/2024-11-11 (S02) → live
  2021-11-16/2021-11-21/2022-11-11 (S26/S27/S29). critique.md M3.
- Argos "explicitly draft-grade": wording absent from S22 capture and live S34. critique.md M4.
- Subtitle Edit "(Windows)" (S12) → cross-platform Win/macOS/Linux (S33). critique.md M5.
