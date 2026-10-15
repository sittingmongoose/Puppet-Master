# PM7 final hover composition — 2026-10-11

**Preparation READY for root review.** Mechanical/test-only worker `codex-pm7-hover-final-compose` carried the COMPLETE final owner diff and verbatim owner reports, then regenerated all four pages from source. No source repair or algorithm selection. Root reviews and lands separately; this is no landing approval or census waiver.

## Exact custody and ancestry

- Worktree/branch: T3-bound `fix/pm7-hover-final-compose-20261011`; retained for root. Fresh branch HEAD and fetched `origin/main` were exactly `2581fcb07b89573794bcf05ad3de8c1769e3d329` before any edit, and again after the checks. Independent GitHub and NAS-mirror main queries both returned that base.
- Source owner: `pm7-hover`, T3 `mcp:0e288964-5096-42b3-ac66-84fe14846c21`, mailbox receipt `1011230952-4792`; root supplied final READY/quiescent run80 ending 23:10:02 UTC. Owner branch `fix/pm7-hover-return-20261011`, complete final head `8ba33908b898ff245b91836d9587e5cd002626a4`; actual Git merge-base with current main is `2581fcb07b89573794bcf05ad3de8c1769e3d329`. Owner head parent is `547c9ca5ced0cb997407772079e196eed6018193`; first rebased owner commit `40a5a7d916a1259ed3914739dadc4703dfbaf5e4` directly parents current base. Full ancestry is in the external byte-identity proof. The prepared result is a new commit on that exact base, not a reconstruction of older failed candidates; exact prepared HEAD and remote refs are recorded in `delivery/commit-push-proof.json` and the root handoff.
- Three-source `git diff --full-index --binary 2581..8ba`: **18396 bytes**, SHA-256 `bd79afd4f69c000ef89b6b55053d9ffd9dfecc09bc525c0cdbf5773c7a1c168a`, stable ID `21d5a3ad659200f2968ac03954dfb132e9e94930`. `git apply --check` passed; unchanged patch applied cleanly with no offsets, fuzz or conflicts. The resulting complete source diff matched the owner diff byte for byte and every whole source file matched its final owner blob.
- Complete lineage, independently rechecked on the rebased owner commits: original `f7ae33b54e5708078368340a43b30f4b6ee51f65`; supplement `b5d26b9a05f04590bf0cc7b189eef47bbd39c7f6`; return repair `d26a37e4e968cd9b8008ca94d97eeca739acf981`; search repair `e3e22d0c621fdeed83d6eae628c39ce1853cd7c6`. Only the owner's `18-hover.js` structural/hidden-change wake and wanted-target visibility repair is new this owner round; the worker authored no hover source.

| Whole final source | Git blob | SHA-256 |
|---|---|---|
| `Concepts/onboarding/opus-5.5/src/js/18-hover.js` | `75ca79e63b99234a023d759f0c23c376d770f4bb` | `f4a03dd60d38d8f6fb463290d94f29a6f6a8cbd5ebd7f246e1ecb411492bdb62` |
| `Concepts/onboarding/opus-5.5/tools/build.py` | `1e38ecfd981fbcf7b6086729f874296d161c42fd` | `aba6ac80215eaa5d9f2b7405aaaffc4e72e8edf2a00b46e70112e20be6b31b2c` |
| `Concepts/pm7-tools/global_hover_tags_source.py` | `7b474c63cabe690f225f56b5565a84787d2b7bce` | `01454f59234d85669bf2bc266cff64c0ac596173431cae4d53e6e5752a4cfd12` |

## Four pages regenerated; complete byte equality

Executed on Linux, in order, with `PYTHONDONTWRITEBYTECODE=1`:

1. `python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7`
2. `python3 Concepts/home-redesign/tools/build_home.py`
3. `python3 Concepts/leftrail-redesign/tools/build_rail.py`

All exits were zero. Every entire regenerated file equals committed final owner `8ba3390` bytes, independently verified by direct byte comparison, size, SHA-256 and Git blob. No generated HTML cherry-pick or text merge.

| Regenerated pages | Bytes each | SHA-256 |
|---|---:|---|
| `Concepts/PMConcept7.html`, `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html`, `Concepts/HomeTestPMConcept7.html` | 18568114 | `5f87466ece4cb8167b40a68b4acaa1da3ecb4d5b268a95afae38abddde6522fb` |
| `Concepts/LeftRailPMConcept7.html` | 19202661 | `5234f3fb4000752fbd4e01f5233c1cf9bfa6daafb1ef710f47e71e4dcd8e1161` |

Current-main Panels sources remain untouched and whole-byte equal to both base/current main and the final owner: `Concepts/home-redesign/src/panels/css/62-kind-dashboard.css`, blob `98ae54402d78d255976052a183439434f2ade0a6`, SHA-256 `23c66d1ab1707a4e2e3d01fbda88fa764b58df5c7421d8654702aab6df2948ea`; `Concepts/home-redesign/src/panels/kinds/30-dashboard.js`, blob `db68d8654e7ccbfc335cece13692bb176d935da0`, SHA-256 `1aae0d6c1593aa603003f3998be53e5305b6c7847062400e9dd39f910ebe6439`. Already-landed disabled Undo is preserved.

PASS: all three existing builders' `--check` modes; `Concepts/leftrail-redesign/tools/parity.py` (Files 87, Source Control 114, Docker 149, zero missing); `Concepts/usage-redesign/tools/boards.py --check`; `node --check Concepts/onboarding/opus-5.5/src/js/18-hover.js`; `git diff --check`. The builder's known universal-selector note at `src/css/10-window.css:13` remains an inherited note. No Plans generation/check writes or governance work.

## Verbatim owner reports; dated scope

All three files below are the final owner's complete report blobs, copied without rewriting historical claims. Their older base/head references and verdicts keep their dated scope.

| Preserved report | Scope | SHA-256 |
|---|---|---|
| `reports/pm7-hover-merge-20261011/NOTES.md` | 2026-10-11 historical failed composition on `2f91e7a622`; first Glass return failed and later cases stayed NOT_RUN. | `b8de5362e47aaa0f8fcba8519de24bc2a1a8d89a827dac07c147199468a757b7` |
| `reports/pm7-hover-return-20261011/NOTES.md` | 2026-10-11 older successful stationary-return repair on `cc2371eb29`; before the final Projects-search repair and current Panels base. | `c8ba08caea2a879d9a16bc5c59075922ac6f941e7010fad45c4d9da4df68bbd1` |
| `reports/pm7-hover-search-20261011/NOTES.md` | 2026-10-11 CURRENT final source-owner result on `2581fcb07b`; source owner `8ba33908b898ff245b91836d9587e5cd002626a4`. | `f5fe21ee81c322a23471ae2124e86f3e442d560146c5020903f52373b36a330b` |

## Inherited functional evidence; no repeated campaign

Exact four-page byte equality retains the final source owner's functional tests. This worker started no browser, GPU session, server or functional campaign. The final evidence manifest and all seven entries were independently hash-verified, and the existing JSON observations were read and bound to actual Git/artifact identities:

- Existing matrix: candidate **26/26**, all seven actual stationary returns hover with pointer delta 0 and page errors 0. Main `2581` has **16/19**, three menu-suppression failures and seven observed returns without hover; no imposed hover-null success rule.
- Trusted actual Projects search `x` / Backspace: final candidate **8/8** across Nas1 software Basic and P1000 Glass, Retro, NieR, Basic, Friendly, Reduced Basic and Reduced Glass. Experiment alone is hovered after `x`, no hidden/zero-rect target is hovered, Tastebook returns after Backspace, pointer counts stay unchanged and page errors are zero. Main `2581` fails the same stale-hidden case in all eight samples; this is pre-existing, also observed on earlier main `cc2371eb29` and previous owner `f8e14f6093`. The old Sol failure is preserved history; the repaired final owner source intentionally differs.
- Final raw `matrix-2581-vs-final.json` has **stale copied metadata** `candidate_parent=017f4e8aa6a9d4eebd9d7d6ce9b9d480899e9fa3`. It is NOT current ancestry. Raw evidence remains unchanged. Actual candidate input SHA-256 is `5f87466ece4cb8167b40a68b4acaa1da3ecb4d5b268a95afae38abddde6522fb`, bound to owner `8ba33908b898ff245b91836d9587e5cd002626a4` with actual merge-base `2581fcb07b89573794bcf05ad3de8c1769e3d329` and identical worker rebuilds. Actual main input is `4687b1ecb639c100425e25eeb35bf400089132d796d3be4b38b18caa1cb933a9`, independently checked against base's committed PMConcept7.
- Typing frame counts in retained evidence are observations only, not performance evidence or certification.

**Census remains NON-GREEN; no waiver or policy choice.** All five comparable samples have no new diagnostics: each Glass/Retro/NieR Usage menu has 7 actionable(menu), the labelled field has 1 actionable(labelled-field), and Settings dropdowns have 18 undocumented(dropdown) plus 18 actionable(dropdown). Twenty-two undocumented diagnostics were removed. Predicate/exemption policy is unchanged by this mechanical task; Jared's alternatives remain pending and root chooses neither here.

Final owner raw root: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-hover-search-20261011/final-2581-20261011T230819Z/`. SHA-256 pins: `SHA256SUMS` `e28e0bdc0ab682a3bc2622103b529de7e9dbec5e8194c7341481cb821150e431`; `matrix-2581-vs-final.json` `212d28aff597b151a8d0e8e91e503f9e3d25a57339f945698592a2a1bb8c208a`; `search-gpu-final.json` `bfc717e6cee670492ad2c63b53e36af9f68e5c84687cd04082b8e150837edf6a`; `search-nas1-final.json` `da5cc728ab32163b0b58933e809447a5f50e38cf458bf51c87ff164ac0532887`. Interim `cc2371eb29` manifest `c4fee7552742e66196c1fd7d0e6adc0c347777c94ea2e41d343077583b5f1b86` remains historical.

## Evidence, exact scope and handoff

Preparation proof/check logs, patch and JSON are external at `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-hover-final-compose-20261011/`, pinned by its preparation `SHA256SUMS` SHA-256 `39bbce437a4c5513e0dc0e604f2a15107142d464d91065deaeb7c5cd8b634220` (22 retained files). This committed directory's `SHA256SUMS` pins the eleven other result files. Post-commit push/ref/cleanup receipts are external under `delivery/`, separately hashed there. No raw captures or check logs enter the repository.

Exact authorized scope is **12 paths**: three owner sources, four builder outputs, three verbatim owner reports, and this new `NOTES.md` plus `SHA256SUMS`. No unexpected tracked path. Push only the clean result branch to both configured destinations and verify its exact head independently; root receives exact base/head/diff/blob/output identities. At final handoff, own command/test/waiter/automatic-wake resources are zero, with no owned browser/server and no scratch/cache made for this task retained. The unlanded result worktree/branch and meaningful hashed evidence are retained. Original owner and old failed ca2/d8 worktrees/branches are untouched. No shared-checkout/main edit, landing lock, main push/landing, Plans/governance/snapshot/baseline/reseal, owner wake, worker/subagent or product/policy selection. Root reviews/lands/removes/settles separately.
