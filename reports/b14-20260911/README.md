# Batch 14 integration verification

Applied all 29 guarded Batch 14 paths with exact before/after SHA-256 matches, without modifying delivered payload bytes. Verification began on main `bc7569b3f5` with Batch 13 cherry-pick `62cacae740` (equivalent to original `fe7d8f0867`), because Batch 13 had not landed. Main subsequently added the unrelated report commit `f8b43905fa`. The final landing branch carries unchanged Batch 13 and Batch 14 patches as `3a0fe68071` and `414a49ac50` on that newer main; the previously pushed branches were not rewritten.

Batch 14 package SHA-256: `c176059115d6b5d6dd047bd33cee4d60e6d53bfcbced0dbd638001d348b047a1`.

## Verification

- Generated HTML build check passed; both delivered HTML files have SHA-256 `5a3a4776b194edc727112e7052b4b9dfeb20462f9e520595981b76088ce9fa60`.
- 79 protocol tests passed.
- Four browser workflows passed: Thorough 34, Exhaustive 38, budget 55, blocker 55 checks (182 total).
- 103 integration assertions across 13 cases passed.
- Settled-layout verification passed 21 checks; two screenshots inspected as spot checks.
- 22 guarded installer tests passed, using exact repository-derived baseline target bytes. This reconstruction is not the original cumulative Batch 13 ZIP.
- All six inherited regression runner groups passed against the final HTML, with a targeted Batch 11 repair retry after adding the async browser-path adapter. Original failed runs are retained; `regression-summary.json` records the composite result.
- Isolated shard check and CRLF-aware staged diff check passed. Full plan-governance gates were not rerun for this concept-only update.

## Reproduction boundaries

The repository lacks 43 historical source-only test files required by the inherited regression launcher. The first attempt records missing-runner failures. Matching copies were recovered from the shared checkout, checked against every SHA-256 in the supplied Batch 14 delivery manifest, and used only in an external test tree. These files were not added to this bounded delta or removed from the shared checkout. The raw evidence includes their source bytes and hashes. A fresh checkout needs those historical test dependencies to reproduce the full regression command; Batch 14's own verification and visual runners ran in the worktree.

The first recovered Batch 11 repair attempt could not launch its hardcoded browser because it uses Playwright’s async API. A targeted rerun passed with that API mapped to the installed browser as well. The supplied Python tests used an external launcher adapter selecting locally installed Google Chrome instead of hardcoded `/usr/bin/chromium`; application/test source bytes remained unchanged. Browser tests loaded the complete delivered HTML with `set_content`. This integration pass does not claim double-click or persistent-origin verification, complete visual/motion acceptance, or a new motion recording review.

No canonical Plans, governance artifacts, Settings/onboarding concepts, or native runtime code were changed. The delivery retains `full_feature_acceptance=false`. Native persistence/provider execution, complete production compilation, Browser Event Authority admission, formal packet audit, and the package's remaining visual/motion obligations remain open.

Raw evidence archive: `/mnt/Cursor/PuppetMaster-Evidence/misc/b14-20260911/verification.tar.gz`

SHA-256: `7ce8cef5aa7642f17e2b210fee6f3ddb5cac310b45c7858d966e76717ceabf88`
