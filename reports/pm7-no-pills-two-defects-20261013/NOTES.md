# Onboarding phase 3: two visible defects repaired (2026-10-13)

From pm-mail `pm7-no-pills` (Claude Me, Opus 5.5, xhigh, fast off), under
`/mnt/Cursor/share/puppet-master/2026-10-13-glass-review-feedback/ONBOARDING-TWO-DEFECTS-AMENDMENT.md` (SHA-256
`2b557102…0075`; Jared's yes through scheduler mail 1013185048-181c). The f109 source, its pages, reports, reviews and
evidence are unchanged historical inputs. Not landed; no lock.

## Where it is

- Branch `concept/pm7-onboarding-labels-20261013`. Start f109bad9f3 (clean). The repair is commit 89e724cbe3, which
  changes six paths:
  - `src/css/12-components.css` and `src/js/57-scenes-journey.js`;
  - the regenerated `PMConcept7.html`, `Onboarding concepts/TestOpus5.5PmConcept.html`, `HomeTestPMConcept7.html` and
    `LeftRailPMConcept7.html`.
- Generators: build.py --publish-pm7, build_home.py and build_rail.py, all --check ok. The page diff is exactly the
  source lines below.
- This report follows in its own commit.
- Pages (SHA-256): PMConcept7 = TestOpus = HomeTest `1d933da480123c2b318352ca7a767fb293eb51a3b0678c667ee93ee010a6f7a1`;
  LeftRail `7b8b36b2bf6f07ddaaefa1d3a66336af4646786953dce152783290d16bacd3e4`. At f109 they were `88ed754d…ba1c` and
  `13d002fc…bb`.
- Sources at 89e724cbe3 (SHA-256): 12-components.css `66181ec37845a0b4481aea1536535417b473a5c46a0181092c7898b11aef2432`, 57-scenes-journey.js `95cf00a37b59157953b8ca00b0234ab8314385c749d2f569256b7a59ed9870ae`.
- Evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-no-pills-two-defects-20261013/` (64 files, `SHA256SUMS`
  `38f1d723cc23d543ce1f93b09c7eee05634a51537a022b4361a0d74a2e4caeab`).

## 1. The dot over the F of "Fresh computer"

**Cause.**
- When Home docks the concept demo into its status strip, `home-redesign/src/panels/css/20-shell.css` (Home's file) does
  two things: it takes away the scenario's left padding, and it gives its `::before` a middot, a margin and a colour.
- The no-pills square rule in `12-components.css` still placed that `::before` absolutely at the scenario's left edge,
  6×6 px with a magenta fill.
- So a filled square carrying a middot sat on the first letter.
- It is on the e254 page too, and in every look; the strip is docked on Home and on Settings.

**Repair** (12-components.css only; Home's file is unchanged). Under Home's exact docked condition,
`html[data-pmw-home="on"] #o55-demo[data-pmw-docked]:not([data-o55-narrow])`, the `::before` is back in the line with
no fill. Home's middot now reads "Concept demo · Opus 5.5 · Fresh computer", as Home designed it. The floating pill keeps
its square.

## 2. The "home nas" caption over a puppet

**Cause.**
- In the begin scene's device beat (`57-scenes-journey.js`), the home NAS stood at x 372 and the right helper at x 370,
  in front of it.
- Its caption ran across the puppet in Basic and Glass, and hid behind it in Friendly and Retro.
- NieR alone had the helper step aside, because its solid ink units hid the NAS.

**Repair.** The helper steps aside in every look, with NieR's existing values: the NAS at 398, 452 (scale 1) and the
helper at 318. Other beats are unchanged, and NieR's layout keeps the same values.

## Checks (numeric, Nas1, 10 looks, before = f109 page, after = this page)

| Check | Before | After |
|---|---|---|
| Demo square's box overlaps the scenario's first letter (Home page and Settings page) | 10/10 looks | 0/10 (`::before` static, no fill) |
| NAS caption's box intersects the right helper's box (device beat) | 8/10 (all but NieR) | 0/10 |
| NAS drawing (without Glass's glow circles) intersects the helper | Glass 2/2 | 0/2 |

- In Glass the NAS group's box still meets the helper's only through its soft glow circles.
- The captions read in every look (sheets in the evidence). Retro's caption sits on the floor strip, where it always sat,
  no longer behind a puppet.
- The floating, undocked demo pill is not reachable at 1440x900 on this page, so its unchanged square stays unverified
  here.
- A separate Glass probe failed twice (it clicked before the screen settled) and is kept as a failed attempt.

## Scope kept

- Nothing else changed: labels, marks, action controls, flows, the tour, Home's and other owners' files, glyphs, GLY-4,
  Wizard and Plans.
- The labels' gate evidence and its open gaps (T1 word floor beyond Basic Light, T2 tour states, T3 remaining looks and
  narrow) are unchanged by this repair, and they are not waived.
- The repair touches only the demo strip outside the window and the stage art's positions. No label rule or label host
  is involved.
