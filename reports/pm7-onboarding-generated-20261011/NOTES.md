# PM7 onboarding generated-artifact refresh

Final current-base preparation: **2026-10-11 UTC**.
Base: `239956e8547ca6fd236b87159ab064fd0ab4aa0c`.
Branch: `fix/pm7-onboarding-generated-20261011`.

Preparation and push only for `home-redesign-planner` to review and land.
The historical checkpoint was rebased cleanly; its generated legacy HTML blob
was unchanged upstream, so no generated HTML was merged or conflict-selected.
The clean unlanded worktree remains for root removal.

Exact diff paths against this base:

- `Concepts/Onboarding concepts/TestOpusPMConcpet.html`: mechanically regenerated;
  11,742 inserted / 357 deleted lines; 6,986,659 bytes; SHA-256
  `6691bd47bb80582a6baef98bbb713492fa61db095f28b4f26fbfc20a4c15225f`.
- `reports/pm7-onboarding-generated-20261011/NOTES.md`: this report.

The legacy copy is authored by `Concepts/TestOpusPMConcpet-src/src/`.
Both existing generation recipes ran twice because the current publisher changed
upstream. No source, design, Plans, governance or additional tracked path changed.

```sh
python3 Concepts/TestOpusPMConcpet-src/tools/build.py
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7
python3 Concepts/onboarding/opus-5.5/tools/build.py --check
python3 Concepts/home-redesign/tools/build_home.py --check
python3 Concepts/leftrail-redesign/tools/build_rail.py --check
```

Current input and source custody were re-read, not assumed from the old report:

- `Concepts/Onboarding concepts/TestPMConcept.html`: 7,444,795 bytes; SHA-256
  `b3888fad4993f484ab4548e9ff212ec0042fa0a912947a7f316514db939326be`;
  matches current-main blob `1dc846a5eb819e51819e371cff37f4e1eb9addea`.
- Legacy builder SHA-256:
  `c73eff0e1b2b9822fddce8f1f213610c8a9996a6d76e4264f85e337f423cd0dc`.
- Current publisher SHA-256:
  `aba6ac80215eaa5d9f2b7405aaaffc4e72e8edf2a00b46e70112e20be6b31b2c`.
- Legacy authored-source Git tree: `869f84e5e593f90cf91af6ebff8652e472685459`.
  All 11 recorded inputs/source files match their exact current-main blobs.

Proof and existing checks pass:

- Both generations have identical byte lengths and full SHA-256 hashes for all
  three generated artifacts.
- All six complete `pmo-*` script/style elements, including their tags, are
  unchanged from current main and match their authored source bytes. Exact
  authored markup occurs once in both versions and is unchanged.
- All 12 changed/added inherited named elements match the actual current base
  whole bytes, including opening tags, contents and closing tags.
- Publisher, Home and Rail `--check` each exit 0: existing lint, syntax, guards,
  markers and publication/review parity. Home/Rail were checked read-only.
- Existing legacy `build_pm7.py` gates: 33/33 style blocks balanced; 28/28
  JavaScript blocks parse; three non-JavaScript data blocks skipped.
- `git diff --check` passes. No synthetic tests or functional/visual campaign.

All four parent pages remain exact current-main bytes:

- `Concepts/PMConcept7.html`,
  `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html`,
  `Concepts/HomeTestPMConcept7.html`: 18,568,114 bytes each; SHA-256
  `5f87466ece4cb8167b40a68b4acaa1da3ecb4d5b268a95afae38abddde6522fb`.
- `Concepts/LeftRailPMConcept7.html`: 19,202,661 bytes; SHA-256
  `5234f3fb4000752fbd4e01f5233c1cf9bfa6daafb1ef710f47e71e4dcd8e1161`.

Raw proof: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-onboarding-generated-20261011/current-base-239956e854-qnsqfqxd/proof.json`;
SHA-256 `2319eece67a0eaa4419415d07273bf675cc7732ef9fe54a50b2e1139cb574739`.
It records input/blob identities, whole-block hashes, both generations, four-page
parity and static results, plus paths and hashes for check logs. Own temporary
scratch is removed; no owned runtime, browser, waiter or autowake is retained.
No main, shared-checkout, landing-lock, snapshot, baseline or reseal action.

Historical validation — **2026-10-11, before current-base preparation**:
pushed checkpoint `f256264a19ad99f75470e8f5f42745c38f7bc9b1` at base
`0fd763294610e8e30cc52a62b738c5034c8a9150`. The same legacy recipes ran twice
deterministically; the legacy copy changed from
`eedd328202e4c92a4fe82abccc66449cba63478fb4c4ca6dfd55bc05292c94e9` to
`6691bd47bb80582a6baef98bbb713492fa61db095f28b4f26fbfc20a4c15225f`.
The historical PM7/Opus pair regenerated unchanged at
`5e1ac1863c886f4a349448513a85d8021fe1917cbff02754e02cc2cb0002fd82`.
Pre/post publisher checks, CSS 33/33, JS 28/28 (three data blocks skipped), diff
checks and inherited/PMO source attribution passed. The current parent-page
hashes above supersede that historical pair's receipt.
