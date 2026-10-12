# PM7 Settings without pills: final current-base preparation (2026-10-12 UTC)

Prepared by `pm7-no-pills` for `home-redesign-planner`. Preparation only: no landing lock, shared checkout, main push,
snapshot, baseline or reseal. Approved scope: Jared's cards NP-SWITCH, NP-CHOICE, NP-BARS, NP-STATUS, NP-CORNERS and
NP-SCOPE (`/mnt/Cursor/share/puppet-master/2026-10-10-no-pills-patterns/`) and the planner's account wording; no new
design, look, canon or policy decision. Phase 3 (onboarding window and tour) is not part of this branch.

## Custody

- Base: `9324862e3456e7a9d3836225cfd972d2e6b0170b` (actual main, verified on GitHub and NAS; parent `239956e854`, the
  hover landing). Branch `concept/pm7-no-pills-20261010`; its first commit's parent is the base.
- The 15 accepted source/Plans commits were replayed onto `239956e854` (the three earlier publish commits and the old
  merge dropped, their outputs regenerated), then rebased onto `9324862e34`. Every branch source and Plans file is
  byte-identical to the accepted `429edced4a` (the tested acceptance head `639d3dc712` and this head differ only by
  main's legacy `TestOpusPMConcpet.html` and its NOTES).
- Canon passages re-read in current owner prose at `2f91e7a622`, `2581fcb07b`, `239956e854` and `9324862e34`, byte-identical
  at all four (SHA-256 of the unit or rule block):
  - FinalGUISpec F3-438 `1f11add812142496c465debe1917f7e0ae59d06e259d5c912bf09fb0ca569587` (amended by this branch)
  - Settings_System rule 11 `20bba12cc4fb9698e4b3bcb18c1125a6db0d04f9c7fce61d734f3e81d38a6c64` (amended by this branch)
  - FinalGUISpec F3-648 `1b4f150849a1943680176c5f2b362e09d73f931503e432e6ac853029788e1e8d` (cited)
  - Decision_Log DL-184 `6977550459f176b54e27adeefc226b8a84366cfff027c96dac1b7eddef04eddf` (cited)
- Plans derived scope: regenerated with the repo scripts; only `Plans/_shards/finalguispec` (99 files) and
  `Plans/.plan_index` (6 files) differ from main; a second regeneration differs only in `generated_at_utc`.

## Branch source and Plans files (SHA-256 at this head)

| File | SHA-256 |
|---|---|
| `Concepts/onboarding/opus-5.5/README.md` | `11f4aba2f4039f99ce2acdb53061cd65fe228ae6cd327e1fff9986d1abb3ab4a` |
| `Concepts/onboarding/opus-5.5/src/css/06-corners.css` | `26da75dead9cdf7973cd5e53231f1354806f6afa940c390e301701d14d15f042` |
| `Concepts/onboarding/opus-5.5/src/css/10-window.css` | `cf93b08774cf9265a65ae5f083acbdd82b7dc44f2e729ba78c11853b658b9ec1` |
| `Concepts/onboarding/opus-5.5/src/css/12-components.css` | `d87999857e8e35c2ec13fd464bf3b7e0a923dbdfb0d75ce830bc8b1f32fc88ca` |
| `Concepts/onboarding/opus-5.5/src/css/24-no-pills.css` | `799ff89adafa9c33a582a445595bb750bc36dd19f091737a570b1054ecba30fe` |
| `Concepts/onboarding/opus-5.5/src/settings/kit.d/10-values.js` | `930340a07e8fd30aa4fd8aef16be677c0bcfa26e2b8559fe6145818587f7b62b` |
| `Concepts/onboarding/opus-5.5/src/settings/kit.d/26-switch-motion.js` | `318c80c0c87f01f8f44d62a92302c4696cbcb1c605b35702b1a842cc631f05f2` |
| `Concepts/onboarding/opus-5.5/src/settings/kit.d/45-scoped.js` | `3c52a5bb59f508969eccbb954a16b8df9e047f5194542aa136c071bbf8ef2888` |
| `Concepts/onboarding/opus-5.5/src/settings/kit.js` | `331d450ff720abea6e2ffdc0339690ddf5934534cd53394061c8fac081abac42` |
| `Concepts/onboarding/opus-5.5/src/settings/managers/05-notifications.js` | `6356c9594f6e3cb1e3238c8c8fbd6fb2a56aebb7aeffaa7b7bf7264f8bb00eed` |
| `Concepts/onboarding/opus-5.5/src/settings/managers/10-providers.js` | `722c872934c8b1ba8ad1995c9623b3c4bc499f25f1f7d9a51db880a34e43f735` |
| `Concepts/onboarding/opus-5.5/src/settings/managers/11-web.js` | `2d7dee2f5997bb6431cf9a7eaef189435c7212e3cb5f9ffd8a5fdc74a4be7529` |
| `Concepts/onboarding/opus-5.5/src/settings/managers/30-memory.js` | `a24dbb376b77edd0307e0bf24e6afe5cbf5d3a7977c4e3eff56abae84da257b6` |
| `Concepts/onboarding/opus-5.5/src/settings/styles.d/90-restraint.css` | `0d1b2958c215df3cd5b41d9c83b54ffd40d90737dcf89f05d6b067d1c7cdec21` |
| `Concepts/onboarding/opus-5.5/src/settings/styles.d/91-no-pills.css` | `262ab4c0891aba5d9a2bdb439f70a2d1c5957d0efc947be54eaede4c4b05c849` |
| `Concepts/onboarding/opus-5.5/src/settings/styles.d/92-switch-motion.css` | `0ff5001b8af020f418f8ff160860dcd530ea2e13200aafeaa8d9058b8bbc5314` |
| `Concepts/onboarding/opus-5.5/tools/pill_check.mjs` | `a1fc6b95d757d2cdf2b16e982124d0c0e9f116b31bfdea179cf354b506477994` |
| `Concepts/onboarding/opus-5.5/tools/settings_nopills_accept.mjs` | `f0f9293cc82498e866c1eadac5a8c5eb70b62ca76da102a9bc9bb5e3cc3c2728` |
| `Plans/FinalGUISpec.md` | `f884f6a1d8d9ac7ade3931dca847010cd6a0690faff184e1f7091221a892f2e5` |
| `Plans/Settings_System.md` | `8ca3cee74152838fc35187efd5add6ac6e9d6b9e520fc49baddf177605962c28` |

## Generation (all four pages, never text-merged)

`build_d_css.py` (unchanged), `build.py --publish-pm7`, `build_home.py`, `build_rail.py`, in that order; all four
`--check` pass; `pm-shard-plans.py --check` and `pm-plan-index.py validate` pass; `git diff --check` clean.
Regenerating on `9324862e34` reproduced the tested bytes exactly:
- `PMConcept7.html`, `TestOpus5.5PmConcept.html`, `HomeTestPMConcept7.html`: `b612df00caa2e2fb13b9b2307a17f283358845b596f33a27a31ba55d40266451`
- `LeftRailPMConcept7.html`: `57904010d6d6d14ca192cc45bb7b7e710a40f184c72df50a73df4f78375b541c`
- drivers: `tools/pill_check.mjs` `a1fc6b95d757d2cdf2b16e982124d0c0e9f116b31bfdea179cf354b506477994`,
  `tools/settings_nopills_accept.mjs` `f0f9293cc82498e866c1eadac5a8c5eb70b62ca76da102a9bc9bb5e3cc3c2728`

## P1000 acceptance on those bytes

Normal admission through a private helper (one owned agent-browser session at a time, no recording, no exclusivity or
performance claim); every run reports `ANGLE (NVIDIA Corporation, Quadro P1000/PCIe/SSE2, OpenGL 4.5.0)` and every
session was stopped. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-no-pills-final-20261011/`
(`SHA256SUMS` `e74bfe1d0a739e88e5b95fe000f83e50ab8b2f22131f139bd6dd7d9cb9d46197`, 334 entries; `receipt.json`
`be082cdf92a1cf9e669f2a8ce3b1024319c9e265155dfc8b6795b16621159701`).

| Run | Page | Result |
|---|---|---|
| Functional, 10 looks x normal/reduced x 1920x1080, 1600x1000, 1280x900, 890x860 | PMConcept7 | 80/80 pass, 0 page errors |
| Functional, 10 looks x normal/reduced x 1600x1000 | LeftRail | 20/20 pass, 0 page errors |
| Pill/stripe gate --quick, 10 looks, 250 views each: 1600x1000 and 890x860 normal; all four viewports reduced; 1280x900 normal (rerun) | PMConcept7 | 0 findings, 0 failed views, 0 page errors |
| Pill/stripe gate --quick, 1920x1080 normal | LeftRail | 0 findings |
| Pill/stripe gate --quick, 1920x1080 normal (2 runs), 1280x900 normal (first run) | PMConcept7 | exit 2 at setup, see below |

Functional checks per combination: the redrawn switch moves as drawn (normal: starts from the state it left, passes
between its ends, lands; Reduced Motion: no in-between key position, the colour fades), two clicks restore the setting;
the theme menu's Light/Dark/Auto is one radiogroup with one checked radio and no capsule corner; every status slot is a
1em box-less square with a shared-vocabulary key; the Claude roster row reads "3 of 4 accounts"; meter tracks have
square ends.

## Finding (HOLD item)

The gate could not start its walk at 1920x1080 normal motion: its first look change did not paint ("look did not
apply: basic-light got basic-dark"). Reproduced in the gate's exact flow on main's own `PMConcept7.html`
(`5f87466e...`) 2 of 2 and on this branch's page 2 of 2; fresh incognito contexts apply correctly on both (6 of 6).
Existing main behaviour in a fresh agent-browser default profile, not introduced by this branch; no source or tool
was changed in response. Details: `gate-1920-normal-diagnosis.md` in the evidence folder.

## Not run on the final base

- The gate's full `--dialogs` walk. Earlier, on Nas1 before the hover base: all ten looks with every one-click dialog
  (2505 views) found only the dropdown search, fixed by `7407af13de`; after the fix the two affected looks (Friendly
  Light, Glass Dark, 496 views) were re-walked clean.
- The landing check in the shared checkout (landing only). Worktree dry run at `639d3dc712` (base `239956e854`): exit 1,
  nothing stops; governance staleness for the two edited Plans documents and readiness growth 23 to 25 (reseal request);
  16 `json_syntax` rows from the worktree lacking the ignored `tests/agent_packet_restrictions` link (present in the
  shared checkout).
