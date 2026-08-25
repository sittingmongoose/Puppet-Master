# HANDOFF — 5.6 Pro, closeout complete 2026-08-25

**Supersedes the Wave 6 mid-session handoff.** Product fixes for the open register
are landed with negative controls. Detail: `handoff/closeout-record/WAVE6_FIXES_LOG.md` (until
evidence cleanup removes `w6/`; the summary below is the durable record).

---

## 0. State of the tree

```bash
python3 build.py --check
node tests/audit.mjs reports/audit.json ./tests
```

Last closeout-verified: **447 pass / 0 fail / 0 console / 0 page**. Rebuild after
any source edit; never hand-edit `index.html` or the standalone.

## 1. USER DECISIONS — binding

1. Finish everything the handoff owed — done for confirmed product defects.
2. Pinned drawer resize handle — DONE (earlier in Wave 6).
3. Evidence cleanup at the end — this closeout.
4. Path-scoped commit + push to `origin` and `truenas-backup`.
5. Accessibility / WCAG DESCOPED — contrast defects recorded, not fixed.
6. Reduced motion: only the decision-take split — DONE (`.decision-surface` in
   `questions.css` reduced-motion list). `motion.css` untouched.

## 2. Closed this closeout

| id | result |
|---|---|
| G1 | DONE earlier (vanish/re-arrive) |
| T1 / T2 / WT | DONE earlier |
| Orbit DEFECT 1 | DONE earlier; DEFECT 2 REFUTED |
| **RM** | DONE — `.decision-surface` → 1ms under reduce |
| **D1** | DONE — exit holds children through `.empty` max-height collapse |
| **D2 / D3** | DONE — take 7 actions pinned; ≤400 aside peek 72px; ans+Next reachable at 360 |
| **L1** | DONE — Focus elevation layout-neutral |
| **T6** | DONE — `overflow-anchor: none` on `.transcript` |
| **G10** | DONE — `data-flip-move`; reorder animates (~14%/frame) |
| **G11 / G12** | Arrival half via G1; movement FLIP opted in; no remaining teleport measured |
| **G2** | DONE — `renderGoalSurfaces()` scoped patch; ~0.27–0.6× bare `renderApp` |
| Layout | Named `assistantPane` / `activityPanel` containers; `.wa-label` ellipsis |
| Harness 15a / 12 / Context / ThreadOps C2c | Completed (see handoff/closeout-record/HARNESS_LOG while present) |
| History status film | 24 rows / status-dot classes filmed |
| Orbit ~40ms blank-core | REFUTED (0 blank frames; controls green) |

## 3. Descope (do not reopen)

- `--subtle` contrast fails in all 8 themes
- retro-light / friendly-light accent AA
- Broad reduced-motion policy beyond the decision-take one-liner
- C11 compact-menu snap (suspected; reference `.mov` only)

## 4. Rules that remain

- Author cannot certify own green; negative controls required.
- Painted pixels + `elementsFromPoint` plural; pause `workTimer` before steady state.
- Never hand-edit built HTML; do not reindent `  renderApp(false);` in `app.js`.
- No emojis — inline SVG only.
- Serialize the tree: one editor rebuilds.

## 5. Cleanup note

Superseded evidence directories listed in the prior handoff §6 are deleted in this
closeout. **Deleting them does NOT shrink `.git`.** Blobs remain until an explicit
`git filter-repo`/BFG + force-push the user previously declined.

## 6. Post-closeout re-film (2026-08-25 evening)

Targeted CDP contact-sheet re-film of D1, D2/D3, RM, L1, G1, G10, T1, T6, G2:
**OVERALL GREEN** (see `handoff/closeout-record/refilm-verdict.json`).
Film PNGs and temporary `handoff/refilm/film/` + `handoff/w5/` tooling were deleted
after the green pass per owner request. Deleting evidence does not shrink `.git`.
