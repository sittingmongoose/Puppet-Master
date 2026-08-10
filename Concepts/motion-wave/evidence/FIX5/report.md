# FIX5 — artifacts family tabs: reuse Docker Manager pane-switch animation

User feedback after FIX4: "still seems a little off — can you not use the
animation from the docker manager tab switching?"

## What changed
FIX4's bespoke exit/enter unit transition (pm-fam-out / pm-fam-in / pmFamOut /
pmFamIn) was DELETED. Family-tab switching now runs the exact same animation
the Docker Manager pane tabs use:
- instant content swap (no exit pass, no FLIP)
- the shared `shPaneInDir` direction-aware stagger on the visible cards
  (.3s, var(--ease-out), per-row delay = --pi x --pm-row-step, cap 7)
- direction from the same --pm-pane-dir convention wireTabber uses

New CSS (cozy-shelves block):
  .pm-fam-switch > .sh-card:not(.pm-hidden) { animation: shPaneInDir .3s
    var(--ease-out) both; animation-delay: calc(var(--pi,0) * var(--pm-row-step)); }
Reduced-motion kill blocks updated (both shapes) for .pm-fam-switch > .sh-card.
wireArtifacts tab path rewritten: filter + scrollTop reset + --pi assignment +
class re-fire (remove/reflow/add), cleanup timer; same-tab click is a no-op;
reduce() snaps.

## Verification (live, built artifact)
- Signature match: docker pane child vs artifacts card mid-enter BOTH =
  shPaneInDir / 0.3s / cubic-bezier(0.22,1,0.36,1) — identical.
- Fresh-load matrix: all->evidence 10/10 cards animating, stagger delays
  0/.026/.052s; evidence->browser backward dir=-1 sliding from left;
  already-active tab click = no-op (0 animations), same as docker.
- 12-switch direction matrix: every switch correct dir + exact counts
  (all 15 / web 2 / browser 3 / evidence 10); one "0/2" reading was a stale
  same-tab no-op from harness state, re-proven clean on fresh load.
- Interrupt spam x8: settles on last tab, 0 stuck classes.
- Sort menu FLIP intact (15 cards mid-flight, order changes, decel ease).
- Reduced motion: instant filter, 0 shPaneInDir running, correct set.
- Console: 0 errors / 0 warnings.

## Governance
- BASE_SHA 8ef31df9 -> 4a7551fba55a3e6915536d4c0263c42248e2f1354c28a53859e1ca9bd6076b80
- Gates 4/4 PASS; artifact rebuilt via pipeline only.
