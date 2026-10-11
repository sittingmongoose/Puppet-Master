# PM7 rail follow-up mechanical preparation — 2026-10-11

Prepared for `home-redesign-planner` by `codex-pm7-rail-followup`. Landing remains held for the planner's source/test custody review and owner requirements. This worker has no main, shared-checkout, landing-lock, product/look/canon/policy, owner-wake, or front-end repair authority.

## Source custody

- Current composition base: `2f91e7a6228e5d3b50be997a562eb263bef059bc` (`origin/main` and clean bound worktree HEAD at start).
- Original owner branch: `fix/leftrail-check-dock-perf-20261011`, pushed head `60c76e6642b48a6fb1590292550f7dd4197ff1ea`; generated commit parent `02b7deb4ccaebc422ec6441eaf1561a8e93101ba`; that source/test commit's parent is `2c35101f93ab08da6f4597f38d4bc23e4fa27573`.
- Owner mail `1011203216-00f0` confirms Windows T3 thread `7140c950-23e7-4c5b-bc79-3eef756d7fb9` is held/quiescent. Its saved mail SHA-256 is `36e656c3f778f8d956d472ed44f4967f36a60cc1293607fa60ec63d5160ce2f4`.
- `30-motion.js` and `90-register.js` are the exact owner-reviewed rail half of `5d2d83465fb4850daa1dad709c803b71da33797b`; report commit `0506e8663a5575a7a973b115102cd417532bd782` was read. The unchanged `00-d.js` supplies `PANEL_IDS`, `PANEL_SEL`, and `inPanels`. `rail_boot.mjs` adds the owner's `L.dock` / `PMW.narrow.frozen` test-only change atop the already-landed settle wait `fb80d4a04bd4954473b01bf4ea43744d6d05d5fb`.
- All three current-base source/test files were byte-identical to the original base. Only their exact approved diff was applied with `git apply --check` and `git apply`; no source composition change, conflict, repair, or generated-HTML merge occurred. Composed source/test files equal the original owner head byte for byte.
- Original and current source patch SHA-256: `ed9c6f802b87f48db3b28bf1b461567e81ae54a39897bd271c216df2ac34127f`; both stable patch IDs: `f387ec4f720cc46f998a5f869af9b918ba2e3517`.
- Original owner evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/leftrail-check-dock-perf-20261011/`; `SHA256SUMS` SHA-256 `45b8f4adfea7841e00ff311c25b9b7c27338bf03e51e81a2d303ccd11019a572`. The manifest and all six entries verify. Prior results are historical, on the old base, and do not substitute for this composition's rerun. Glyph rail review and the Errored-word colour question remain NOT_DONE and outside this preparation.

## Exact owned change paths

Source/test:

- `Concepts/leftrail-redesign/src/concepts/d/30-motion.js`
- `Concepts/leftrail-redesign/src/concepts/d/90-register.js`
- `Concepts/leftrail-redesign/tools/rail_boot.mjs`

Required builder outputs:

- `Concepts/PMConcept7.html`
- `Concepts/Onboarding concepts/TestOpus5.5PmConcept.html`
- `Concepts/HomeTestPMConcept7.html`
- `Concepts/LeftRailPMConcept7.html`

Compact result files: this `NOTES.md` and `SHA256SUMS`. No Plans/governance/reseal changes. Original owner branch/worktree preserved.

## Mechanical gates — PASS

Linux regeneration followed the existing recipes, in dependency order:

```sh
python3 Concepts/leftrail-redesign/tools/build_d_css.py
python3 Concepts/onboarding/opus-5.5/tools/build.py --publish-pm7
python3 Concepts/home-redesign/tools/build_home.py
python3 Concepts/leftrail-redesign/tools/build_rail.py
```

All four corresponding `--check` commands pass; `parity.py --list` passes with zero missing fixture pairs (Files 87, Source 114, Docker 149). `git diff --check` passes. `node --check` passes for the three owned source/test files and unchanged helper, and for every executable inline script in all four generated pages: 117 source/generated entries, 30 unique generated scripts.

Each regenerated page equals its current-main bytes with only the exact approved `30-motion.js` and `90-register.js` source blocks replaced. Every other byte, including embedded look assets/styles and other current-main source, is preserved. `d.css` is unchanged. No unexpected generated path or content change occurred.

- Published/onboarding/Home HTML SHA-256: `322fc257b7e6822b14e6d9e610f86b51b1fca1a107170f9fa4397f52531c6f5a`.
- Rail review HTML SHA-256: `877f467de5a8fa4ad33f3f25b3f57c1c6a0ee9c6fd6151cfa34cd34ce1c78c23`.

Existing builder informational output about the onboarding universal selector was retained without repair or waiver.

## P1000 rerun — PENDING

Canonical GPU guide read. Initial normal-admission check at `2026-10-11T20:37:22Z` showed one other active helper browser, 38 GiB available memory, and 83 GiB free local disk. Other users remain present/allowed; this is a shared-device acceptance rerun with at most one owned helper browser at a time, no recording, exclusivity, performance, or certification claim.

The existing owner recipes will run serially with the unchanged composed `rail_boot.mjs`: Glass-first (`--themes glass-dark,glass-light`), review (default all eight themes), then published (`--page Concepts/PMConcept7.html`, default all eight themes), each `--concepts d --restore`, with the review `?rail=current` reference. Glass-first includes three restore looks (Glass dark/light plus NieR); review and published each include all nine restore looks (eight themes plus NieR). The previous Glass-first raw summary also records three looks, despite the owner's shorthand describing the overall nine-look result.

Any new failed source/test assertion stops approval and further dependent testing; evidence is preserved without worker repair or gate waiver.

## Evidence and checkpoint

Raw custody, command receipts, gate logs, and rerun evidence belong only under `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-rail-followup-merge-20261011/`. The adjacent `SHA256SUMS` binds the current evidence files; full source/blob/HTML hashes are in `custody/source-custody.json`, `gates/generated-custody.json`, and `gates/syntax.json` there.

At this preparation checkpoint, P1000 execution and cleanup are pending. The bound unlanded result worktree must remain for the planner. A bounded mailbox waiter remains armed during work; no worker/subagent was started.
