# PM7 coverage correction receipt

## Fix round 1

**A3 CSS readiness is unchanged.** Corrected summaries exclude keyframe steps, keep uncertified JS absence unknown, and preserve all original raw captures. No new browser campaign or repeat run was made.

- **Code head:** `94aabbafae5c213eb567c58697da973a58cd999a` on `concept/pm7-coverage-union-20261018`; the final documentation commit is above it. Every fix was committed and pushed to both configured remotes.
- **Worktree:** `/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-048d6b7d`; the lead checkout was read-only.
- **Correction evidence (`F`):** `/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A0-coverage/fix-round-1`.
- **Use now:** `F/unions/final-PMConcept7.union.json`, `F/unions/final-LeftRailPMConcept7.union.json`, and `F/unions/final-provenance.json`. The original union/summary section above is retained as history.

| Fix | Location, cause and correction | Commit |
|---|---|---|
| **Keyframe census** | `coverage_summary.mjs`: css-tree parses `from`, `to`, and percentages as `SelectorList`; skip rules under standard or prefixed keyframes. Their bytes stay unmeasured. Regression includes a touched animation and nested vendor keyframes. | `576eee7256` |
| **Transport compatibility** | `chrome.mjs` / `agent-browser-pipe.mjs`: the repair was unconditional. Chose to gate it, because coverage needs large replies while the task requires original flag-off behavior. Only `launch({coverageFile})` passes the child transport switch; flag-off selects the original Node WebSocket. Child argument and selection tests pass. | `d473fa3e1f` |
| **Matrix default** | `E/tools/matrix.mjs`: an unset override reached `require(undefined)`. Restored the original `/home/sittingmongoose/pmt-dev/pw/node_modules/playwright-core` fallback; `PM7_PLAYWRIGHT` is optional. Committed the external correction as `reports/pm7-coverage-fix-20261019/matrix-default.patch`. | `dc61330654` |
| **Navigation gaps** | `coverage_union.mjs`: page-initiated reloads could drop CSS deltas. Count unflushed main-frame navigations/reloads in `unsampled_navigations`, merge without double-counting, and report untapped CSS unknown whenever nonzero. Ignore subframes and the initially empty document; rejected and same-document navigations cannot leave a flush credit. | `7b20098ce8` |
| **Provenance / portable lock** | Corrected `E/merge-unions.mjs` and retained its patch. Early unmarked input lineage is not certified. The portable lock uses `node_modules/*` keys and no archive-relative root version; clean `npm ci` installs all five locked packages. Lock and patch are committed under `reports/pm7-coverage-fix-20261019/`. | `94aabbafae` |

### Corrected unions and totals

| Page | Previous complete-union SHA-256 | Corrected complete-union SHA-256 |
|---|---|---|
| `Concepts/PMConcept7.html` | `3b19d7f4b6ecdf52b19936104eb397f0e189e9e93f7b97d719ece395ac7089bb` | `aab8dd2b00fadd7c5a6855638271ca6917dfc317ad77f4152f1c10274606ae5f` |
| `Concepts/LeftRailPMConcept7.html` | `af0e0ebc5c7036e3e608a70e71758301bc5ec7309f97b28ded23cbe622f189ac` | `37f427c6e86281e8c1dcc72d7b0a3b657adf15b01fe7db5fb6ca79d29e23a2d0` |

| Page | CSS touched / ordinary rules | Explicit unused rules / bytes | Excluded keyframe steps / bytes | Runtime CSS hashes outside static blocks |
|---|---:|---:|---:|---:|
| `Concepts/PMConcept7.html` | 10322 / 19306 | 8984 / 1521629 | 1232 / 47266 | 19 |
| `Concepts/LeftRailPMConcept7.html` | 5999 / 20470 | 14471 / 2884276 | 1235 / 47323 | 11 |

CSS used bytes remain **7,419,040 PM7 / 6,190,624 rail**. CSS unmeasured bytes are **3,325,453 / 3,333,800**. Both pages have zero unresolved `sheet:<id>` identities; the 19 / 11 resolved runtime hashes above are a separate category, not static blocks. All original raw CSS rows are positive.

JS touched bytes remain **8,297,443 / 6,918,707**. Corrected receipts certify **537 PM7 / 0 rail** native-marked scripts and leave **429 / 66** merged entries uncertified. Both pages now report **0 certified unused JS bytes**; unmeasured JS bytes are **5,363,279 / 7,233,510**. PM7 uncertainty grows to 5,363,279 because unresolved, unverified source identities can touch the remaining bytes; rail has no unresolved identity, but its unmarked lineage cannot certify absence. **This wave removes no JS.**

The four early inputs are `E/coverage-campaign/matrix-union.json`, `E/coverage/draft-union.json`, `E/coverage/scenarios-union.json`, and `E/contrast/contrast-union.json`. They lack installed-sheet inventories and predate a provable committed collector revision. The former “74e5fbc0fb and successors” statement is withdrawn. Their bytes and saved positive ranges remain unchanged; new receipts do not promote their unmarked aggregates.

### Proof and remaining limits

**CSS join:** reran unchanged A1 `join-r3.mjs` against the same `static-inventory-r3.json`, both corrected unions, and the corrected receipt. All **582 ready CSS source ranges / 82,088 authored bytes** are identical. Ready ordinary `css-rule` rows remain **576 PM7 / 579 rail**, plus **3 declaration rows per page**. The full CSS-ready row/source JSON has identical before/after SHA-256 `eb91b683222a6f02e401b7232f123b6307c13061c53d1cfe63c6568a1e5e387c`; `F/css-ready.diff` is empty. Total ready source ranges fall 608 → 582 solely because 26 JS ranges lose uncertified absence evidence.

**Verification:** `verify4 --same-as-main` passes all four generators and page identities; 10/10 unit tests pass (collector, keyframes, navigation gaps, child transport, large replies). Existing summary/provenance/arrow/uncertainty fixtures pass all 20 assertions. Final union validation passes 12 checks per page, including exact raw-input reconstruction, ordinary-rule census, keyframe exclusion, offsets, source mapping, balanced byte totals, and partial provenance. All 1,860 original evidence files still hash-match, with original copies of the two corrected external tools preserved under `F/input-snapshots/`.

**Matrix no-env proof:** dependency resolution is intercepted in the browser-free test to verify both the default and override. This host lacks the original default Playwright installation. Real no-env baseline and corrected invocations both fail with the same `MODULE_NOT_FOUND` for that original path; the `require(undefined)` regression is gone. No browser is opened by these checks.

**Navigation history:** old raw captures predate `unsampled_navigations`. Corrected summaries report `null`, not a measured zero; the historical count cannot be reconstructed. Future nonzero counts suppress negative CSS evidence. Unit tests demonstrate main-frame reload counting, subframe exclusion, failed/same-document navigation handling, additive merging, and unknown summary output.

**Unexplained flag-off deltas:** no-pills **64 → 71 views**, Explorer **1 state / 1 failure → 6 / 0**, labels **2 failures → 0** remain observations with an unknown cause. Harness nondeterminism is possible but not proven. A sound repeat needs fresh baseline/candidate browser runs with the actual baseline child launcher; this fix round did not reopen those three browser comparisons. The previous raw-driver comparisons shared the repaired child transport and do not establish untouched-baseline parity. The restored flag-off transport is proved by deterministic selection and child argument tests; these historical deltas are not claimed equivalent.

### Evidence paths and hashes

Paths in this table are relative to `F` (full root above); raw unions remain at their original paths and hashes in the master receipt.

| Artifact | SHA-256 |
|---|---|
| `unions/final-PMConcept7.json` | `3caa863da07fd520ea88767fa8307e99fb1ff7ceb5bfdaa23730411eda2a6dc1` |
| `unions/final-PMConcept7.md` | `ee4355e6021092c1c9bd49c886c343ac9ef11f750ea8914e00c120928d595ae7` |
| `unions/final-LeftRailPMConcept7.json` | `b29cf28c94cc0bd12dddcffab9937333502070f9cf7ecdbf7768dd26cd670285` |
| `unions/final-LeftRailPMConcept7.md` | `385730cdf39d23cc645a8e90a8c824dc10fc651306463aa2c4ef8edbed13635b` |
| `unions/final-provenance.json` | `b804cc55b072e6c6fe71c2a16cd5063ca9e33524da50a4e62aad76a8baf1345e` |
| `unions/final-receipt.json` | `d1b5882f9c1fb46f3a1876324571a89a37219ee219666c32c571e2a4a48441f7` |
| `unions/final-validation.json` | `0e7fa1775d1ed03c7adf5658ca4d925a46abe9eadfa681e67b792ae6ca5fc9e7` |
| `final-joined-r3.json` | `f3c13b1c05f10a3e43afa12be334fbd1763215b54acaff6e8bd424442e28bed4` |
| `css-ready-comparison.json` | `450df9396da26430f362f43cd449c58e13ebb1286d31ff4c1af1d0ba8a1438f5` |
| `css-ready.diff` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `verify4.json` | `6aff22921ee710006049f0750c45254af681bca2d92733278b8535b88e2132ac` |
| `verify4.log` | `8d157c0c4d8b609fe48db7f239b9db0d63660d8b0d777946f880c12f1b977ecc` |
| `unit-tests.tap` | `3f1db9d40b06cc0b8604b3e9b2f30f725ca8964461ff23ac80911398cfc01351` |
| `fixture-replay.json` | `88ef99acf5a3774c9b532a40b0dd1d1584d38ac36624066e472b311c9e754511` |
| `matrix-default-checks.json` | `549a5db74ebdbe729492240d1fb8fad83b84a38419e098e362a3724c8704089c` |
| `matrix-no-env-comparison.json` | `467a9ea28cb17fb06da1436d2bec01ab1324df7a5fb3728fdbe430a5f75c7ff0` |
| `flag-off-deltas.json` | `8911e5936051a98bc46ac55409bd7646fc6f4faacb1464364eac876d3eea9685` |
| `npm-ci.log` | `a1c2fa23ace39d9b8ebb59ba245a14687dcb7eb50f977acbf3c4a69ed668b5df` |
| `original-evidence-validation.json` | `e3adc370f7dae29f1ec43ecab020273f1444ae7e9b730d9550be192b8132ce8b` |
| `cleanup.json` | `6f303774966534e897fa40f459a52f000f29d192bc13c975c87c9572cdf94f82` |
| `checks.json` | `a3ebe6bff4bd08db61a2bff8c3ad92450b79df0445789ca1e5abce675fa62c04` |
| `evidence-manifest.json` | `7351cf03d5f356ee8cc7d7a3f2e80565e1ec047a53c7b7557b08e161ad01640e` |

Reproduce with the committed portable lock (copy `deps.package.json` / `deps.package-lock.json` to `package.json` / `package-lock.json` outside the repository and run `npm ci --ignore-scripts --no-audit --no-fund`). Set `PM7_ANALYSIS_MODULES` to that installation's `node_modules`, run `F/rebuild-final.mjs` from this assigned checkout, then run `F/compare-css-ready.py`. The manifest retains exact runners, inputs, external tool corrections, and all hashes.

**Cleanup:** no browsers, recordings, servers, or temporary worktrees were started. The analysis dependency installation was removed. Only cited evidence remains; the supplied unlanded worktree/branch and mailbox waiter remain for the lead.

## F-coverage-fix: matrix wiring

`matrix-followup.patch` applies to the reviewed external `A0-coverage/tools/matrix.mjs` (SHA-256 `351ec6ae376ea4239e04f7a37002c8872265661f3a9af350e8fc751202631802`). It binds both lazy helper exports and moves help ahead of Playwright resolution. The corrected external file is `4a1a2b0290ccc69d182de3168fb4cc45f5a3a07e081a6c10a6845fc07f77246d`.

Browser-free replay: `python3 /mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/F-coverage-fix/matrix-proof.py` from the checkout. It covers help, flag-off, exact-file flag-on, script-relative flag-on, and the reviewed regression with the real helper plus Playwright/CDP stubs. It does not test matrix cells. Receipt: `/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A0-coverage/fix-followup-matrix-help.json`, SHA-256 `df53fe3cf777981667752389889485d27e04614cb7327d501b3c02705faacb88`. Both receipt before-files are retained in `/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/F-coverage-fix/input-snapshots`.

## Fix round 1 — F-coverage-fix (2026-10-19)

**Result:** the accepted CSS totals and readiness are reproducible with the current tool under the lead-authorized, evidence-bound historical navigation assumption. Original raw counts remain absent. Strict default regeneration certifies no absent CSS or JS bytes.

**Code head:** `bf3d9de09ab57f26af0c3fe0144903cf361bd01c`. Fix branch: `fix/pm7-coverage-fix1-20261019`; every implementation item was committed and pushed to it and fast-forwarded to `concept/pm7-coverage-union-20261018` on both configured push targets. Final documentation head is in `reports/F-coverage-fix.md` in the wave share. Main landing belongs to the lead.

**Evidence (`G`):** `/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/F-coverage-fix`. Use `G/unions/final-PMConcept7.union.json`, `G/unions/final-LeftRailPMConcept7.union.json`, and `G/unions/final-provenance.json` for the explicitly assumed historical result. Prior union files remain history.

| Location | Cause | Fix |
|---|---|---|
| `coverage_union.mjs` | Empty serialized unknown aggregates were mistaken for fresh accumulators. | Explicit nonserialized initializer marker; `emptyUnion()` is the public initializer. Collector and end-to-end census regressions keep the three-session `2 → absent → absent` chain unknown. |
| `coverage_summary.mjs`, raw CSS filter | A missing count passed the old `!(count > 0)` test. | Negative raw rows require tracked zero or the explicit assumption, including unmatched-sheet and non-rule spans. |
| `coverage_summary.mjs`, JS absence | Provenance checks alone allowed absence despite incomplete navigation tracking. | Gate unused bytes and static zero counts; keep native counters/positive touches; retain uncertain absence in the legacy byte projection. |
| `coverage_summary.mjs`, historical policy | Accepted captures predate the navigation counter. | `--assume-navigation-clean <evidence-file>` records its path/hash in caveats and census, preserves `navigation_unchecked`, and never overrides a known positive count. |
| External `A0-coverage/tools/matrix.mjs` | The lazy import discarded the `coverPage` binding; help resolved Playwright first. | Keep `cov` and bind both exports, move help before dependency resolution, preserve both before-files, and replay setup/finalization with the real helper and CDP stubs. Patch is committed as `reports/pm7-coverage-fix-20261019/matrix-followup.patch`. |

### Reproduced totals

| Page | Unused ordinary CSS rules | Unused UTF-8 bytes | Strict default unused rules / bytes |
|---|---:|---:|---:|
| `Concepts/PMConcept7.html` | 8984 | 1521629 | 0 / 0 |
| `Concepts/LeftRailPMConcept7.html` | 14471 | 2884276 | 0 / 0 |

**Equality:** all original fields in both accepted summaries and completed unions compare exactly; only additional assumption/caveat fields differ. Every affected explicit false CSS row remains `navigation_unchecked: true`. Raw union bytes and hash-bound provenance are unchanged.

**CSS join:** `582` ready source ranges / `82088` authored bytes remain identical. The complete ready CSS row/source projection has SHA-256 `eb91b683222a6f02e401b7232f123b6307c13061c53d1cfe63c6568a1e5e387c`; `G/css-ready.diff` is empty. The unchanged A1 join command and all input hashes are in `G/css-ready-comparison.json`.

**Verification:** both suites pass `14/14`, with `0` failed, skipped or cancelled. Syntax and whitespace checks pass. The recorded four-generator proof passes and all committed page bytes still match the reference; its proof head is retained in `G/verify4.json`. Matrix proof runs through coverage initialization, page setup, final sampling, detach and close; the reviewed driver reproduces its ReferenceError as an expected negative control. All matrix cells are skipped by the fixture filter, so this is wiring verification, not a new campaign.

**Navigation audit:** `G/assume-navigation-clean.md` lists every location reload/assign/replace call, the named popup, both forms, source file:line, and recipe reachability. The legacy reset controller is guarded out on covered default pages; the active Home layout reset stays in-document. Other mechanisms and local open/submit functions are adjudicated in the audit. No authored campaign recipe reaches a page-initiated main-document navigation. This remains an explicit assumption about historical captures, not a recovered zero count.

### Reproduction

```sh
PM7_ANALYSIS_MODULES=G/deps/node_modules node --test Concepts/onboarding/opus-5.5/tools/coverage_union.test.mjs Concepts/onboarding/opus-5.5/tools/coverage_summary.test.mjs
node G/navigation-scan.mjs
python3 G/navigation-markup.py
python3 G/navigation-audit.py
PM7_ANALYSIS_MODULES=G/deps/node_modules node G/regenerate.mjs
python3 G/join-and-compare.py
python3 G/matrix-proof.py
```

Replace G with the absolute evidence root above. Restore the portable committed dependency lock into `G/deps/` and run `npm ci --ignore-scripts --no-audit --no-fund` before replay. Command receipts retain the literal argument arrays, environment, results and full output. No browser recollection was made; previous campaign failures and early uncertified JS lineage remain as disclosed.

### Current artifact hashes

| Artifact | SHA-256 |
|---|---|
| `G/assume-navigation-clean.md` | `7ad78ea2ba77ca3bdb154e844a89fde7f30724e0e67a736d4ebe7b9a498819f3` |
| `G/navigation-audit.json` | `c6546f6fbdfb142dd6c12fe77e556915477f6a0394d463c1a8193233658ecc44` |
| `G/unions/final-PMConcept7.json` | `2ced4a40daa578e07ccaa27468a956fe2f145cf659ea3fde32e2e82d18cc2fb8` |
| `G/unions/final-PMConcept7.md` | `6ab59f7f83e1a50799a44f6fb738876f5298f3be153cc4c3f6c7a92fc2d65a78` |
| `G/unions/final-PMConcept7.union.json` | `6815513ce8cfd9edf7dfb74e6cdeea23b30d466f295724fea4a3bc4677ea937b` |
| `G/unions/final-LeftRailPMConcept7.json` | `86dea6265f9c452d807efe49f1536e6cae5c28d6e3487184561e5b9bee916ba4` |
| `G/unions/final-LeftRailPMConcept7.md` | `ee10ff5ce42d172815a429ab664f5b49b3a24b68979ad3f6eb62e7a8a0c8d36d` |
| `G/unions/final-LeftRailPMConcept7.union.json` | `bd2d4d0dcb44d1c75b8fbc757cfce7fdbd90577ba38156ed47fc9c7d17e44c43` |
| `G/unions/final-provenance.json` | `eed6cea9093af2c634250e7e0550b287b4d40cc4a140b5675433f477fc5d0a8b` |
| `G/unions/final-receipt.json` | `1374ce1fc2bd3a4dea8d3ac4f6eac016e6c33f9b9e64aca907744680516de4d7` |
| `G/unions/validation.json` | `b0fafdd21033bebf578d0216f50db0a2631e1adf2d9d79652f8a2133c3c9b220` |
| `G/final-joined-r3.json` | `c7d7b6f9c48773ec975739b88a17c467dfeb8f7baa23ff0dd458a5ed7f77915d` |
| `G/css-ready-comparison.json` | `ecff2ccf00821be4884c9e10ff4e48dbe711857c34dd76b87097dc05180df2e8` |
| `G/css-ready.diff` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `G/final-tests.stdout` | `93073cd83104332a9c94c0bd449a61c6dc362de4aa7889fbb8a985b47bc9c8e1` |
| `G/matrix-proof.json` | `df53fe3cf777981667752389889485d27e04614cb7327d501b3c02705faacb88` |
| `G/verify4.json` | `a7930b45aa3b106317a87b62a2cf94868ba9afff3f13f5047b0d0e0210a55c53` |
| `G/checks.json` | `66eb56dd51f1d3084d502b732d1790307c17e4f6290543e5a9867b48879a1a8d` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A0-coverage/tools/matrix.mjs` | `4a1a2b0290ccc69d182de3168fb4cc45f5a3a07e081a6c10a6845fc07f77246d` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A0-coverage/fix-followup-matrix-help.json` | `df53fe3cf777981667752389889485d27e04614cb7327d501b3c02705faacb88` |
