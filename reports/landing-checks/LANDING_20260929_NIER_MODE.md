# Landing record: NieR Mode for PMConcept7 and the All Settings row fix, 2026-09-29

**Branch and result.**
- Branch `concept/nier-mode-20260928`. It merged `fix/all-settings-rows-20260928`, `concept/nier-engine-20260928` and
  `concept/nier-scenes-20260928`, then `origin/main` `a53ee30e21`, and ends with the publish commit `1361e87251`.
- `main` was fast-forwarded from `a53ee30e21`. The only hand-resolved merge conflict was one README line
  (`src/js/80–84`). `_shards` and `.plan_index` were regenerated, not merged.

**What lands.**
- **NieR Mode (Jared, 2026-09-28).**
  - A Settings switch, off by default, under App & Input > Theme & colors.
  - It paints the whole app in the NieR: Automata ink-and-parchment palette: SunkenInTime's T3 theme, verbatim in
    `src/settings/nier/nier-automata.json`.
  - It is a hidden theme over Basic. The chosen family is kept and comes back exactly when NieR is turned off. Light
    and dark follow Light/Dark/Auto.
  - Type: embedded M PLUS 1 and JetBrains Mono (OFL), with no network.
- **29 individually switchable parts**, all installed by default:
  - Look: 6 parts.
  - Motion: 7 parts.
  - Sound & voice: 3 parts.
  - Pointer: 1 part.
  - World: 12 parts, including Pod 042 in Chat.
  - Edited in a Plug-in Chips row editor, with presets Full install, Quiet, Still and Colors only.
- **Six original ink background scenes** plus Follow the page.
- **Settings > All Settings:** rows get their own bordered box instead of the clipped group-row slab.
- **Canon:** three inventory rows (916 rows), with the prose in `Settings_System.md` §4.4/§10, `FinalGUISpec.md`
  F3-441/F3-426 and `00-plans-index.md`.
- **Sources:**
  - `Concepts/onboarding/opus-5.5/src/settings/`: `kit.d/18-22`, `styles.d/13-17`, `nier/`.
  - `src/js/84-pod042-chat.js`.
  - Tools: `nier_palette.py`, `nier_scene_art.py`, `nier_scenes.py`, `nier_hue_audit.mjs`.
  - `build.py`: the themeApply paint hook and the Pod 042 persona patch.
- **Published:** `Concepts/PMConcept7.html` = `Concepts/TestOpus5.5PmConcept.html`
  (sha256 `f185cc09332f1cbc…`, 9,316,346 bytes).

**Checks.**
- `build.py --check`: ok. The shard check passed in the worktree and in the shared checkout.
- **Browser runs on jared-mac's M3 GPU (Jared's rule):**
  - Tour t1–t7: 7/7 on the merged build.
  - Onboarding `scenarios.mjs`: 55/69. All 14 failures fail identically on the pre-NieR build `3d1f5a479b`: s01, s09,
    s09b, b5, a1, a4, a6, x1, x2, b1, b2, lc4, lc6, v1. They are pre-existing on the Mac; the likely cause is that no
    owner host is set, so the GitHub, Server and NAS flows wait.
  - NieR-on smoke in light and dark: 0 console errors.
  - Engine acceptance: 8 families × light/dark, pixel-checked.
  - Hue audit: 0 off-palette pixels in 38 views.
- **Main-thread frames at rest** (the compositor held ~59.5 in every case):

  | | GPU | `--disable-gpu` |
  |---|---|---|
  | NieR off | 59.5 | 59.4 |
  | All parts | 8.5 | 8.8 |

- **Film:** 60 fps on the Mac GPU, max frame gap 33 ms (one duplicated frame in 2,890).
- **Landing check** (`pm-landing-check.py --base origin/main`, baseline `c2f98fd9ea`, current): exit 1, nothing stops
  the landing.
  - Governance staleness on the edited documents:
    - Spec Lock `stale_hash` for `00-plans-index.md` and `FinalGUISpec.md`.
    - Artifact and evidence hash staleness.
    - The readiness growth counter, 24 → 29, on this branch's files.
    - **Reseal requested from the Plans agent.**
  - Off-branch totals, reported to Jared:
    - plan_migration 2 → 14 (run-gates and audit-governance).
    - plan-migration-validate 38,569 → 38,578.
    - spec_lock 0 → 2.

**Open (for Jared).**
- The scenes show only between panels. On the dense dashboard and Settings pages the scene layer barely changes the
  picture; the film found a mean change of about 0.03 of 255 there. Deciding whether panels should let a little of the
  scene through is a design call.
- The Plug-in Chips editor may not close on Escape after a background tile is clicked.

**Landing lock.** Taken at 09:58:43Z and held through the fast-forward, both shard checks, the landing check, this
record, the push and the cleanup.
