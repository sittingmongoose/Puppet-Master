# Onboarding pill labels: no-pills phase 3, source checkpoint (2026-10-13)

From pm-mail `pm7-no-pills` (Claude Me, Opus 5.5, effort xhigh, fast off), under
`/mnt/Cursor/share/puppet-master/2026-10-13-creative-queue/ONBOARDING-LABELS-GO-v2.md` (SHA-256 `2ba171bb…20ec`) and the
planner's amendment of 2026-10-13 (Sol takes the remaining mechanical gates). Not landed; no landing GO.

Jared, 2026-10-11 (`share/puppet-master/2026-10-11-onboarding-no-pills/README.md`): the pill LABELS go (status chips,
dashed suggestion chips, state badges); pill-shaped ACTION buttons stay. Patterns: NP-1..6 as approved
(`share/puppet-master/2026-10-10-no-pills-patterns/`).

## Where it is

- Evidence `SHA256SUMS` (144 files): `2c80bac2cb4af4303243f3860d6750495b69a542635814cb2ab2e89e3106d820`. Check tool `tools/onboarding_label_check.mjs`: `bce699ebc9fce3234abdc5c3f5c2884fcc36e7c0f8e23b1f249e53d539b24b6c`.
- Branch `concept/pm7-onboarding-labels-20261013`, worktree `~/pm-worktrees/pm7-onboarding-labels-20261013` (T3-bound).
- Base: `main` e254a56477c7b8da424b7485ba17f358fdbf3ec5.
- Source and pages: a22855989c37852b3ca617ed5e305d18797c54cb (pushed to GitHub and the NAS mirror). The check tool and
  this report follow in later commits on the same branch.
- Pages (SHA-256): base `PMConcept7.html` = `TestOpus5.5PmConcept.html` = `b612df00caa2…6451`; at a22855989c
  `PMConcept7.html` = `TestOpus5.5PmConcept.html` = `HomeTestPMConcept7.html` = `11348f491ed0…36b8`,
  `LeftRailPMConcept7.html` = `4661f3c205c1…021d`. Each differs from its base only inside the O55 CSS block.

## What changed (CSS only, box rules only)

| Label | Was | Now (pattern) |
|---|---|---|
| Row status `.o55-pill` (Checking…, Needs sign-in, Not installed, Ready, Git) | tinted capsule | its mark and a word in the status ink, no box (NP-STATUS) |
| Quick checks `.o55-chip` (212 GB free, Safe History ready, Online) | outlined capsules | mark and word, set in a row 22px apart, the word turning to full ink when done (NP-STATUS) |
| Tags `.o55-tag` (Recommended, SSH on/off, New folder, NieR's Add-on) | tinted capsule | a plain word after a 5px square (NP-SCOPE's scenario tag) |
| Suggestions `.o55-suggestchip` (Book club website…, Home server…) | dashed capsules | joined cells in the look's rectangle (`--pm-ctl-r`), the chosen one filled; a wrapped row stays joined cells (NP-CHOICE) |
| Route name `.o55-routelink span` (On this network) | capsule over the dashed line | a word in the middle of the line, the dashes running out from both sides |
| Tour "Try it" `.o55t-trylabel` / NieR "Objective" | tinted capsule / ink block | plain word after a square |
| Practice marker `.o55p-badge` (Guided example, Practice) | tinted capsule | plain word after a square |
| Official address `.o55-officialurl` | capsule | the look's rectangle (no renderer draws it on this page) |

Word inks: tags, the route name, Try it and the practice marker take their accent 88% toward the text ink, so a bare word
reads at least as well as it did on its tinted capsule; status words keep their own tone (their marks follow that ink).
NieR: the same words in ink (mono capitals), no ink blocks or hairline frames; ready reads in NieR's ok ink. The chosen
suggestion keeps the old 12% fill. Retro fills the chosen suggestion in its accent (reverse video).

Unchanged: every renderer and all JS, glyph marks (markup, size, animation), tour structure, Settings, and every action
control: Install, Sign in, Continue/Back, the window's switches and Light/Dark segment, the look menu, the tour's buttons,
bar and segments, Explain this reply simply. Friendly keeps its rounded action buttons. No Plans, no Glass/Edge work.

## Look and behaviour review (source owner)

Reviewed on Nas1 screenshots (software rendering), 1440x900 and 390x844: where, look, begin, c-review, name (empty and
chosen), s-confirm, ai, safe in Basic Light/Dark, Friendly Light, Glass Light/Dark, Retro Light/Dark, NieR Light/Dark;
the tour's Try it in Friendly Light and NieR Dark. The quick checks read as a calm line of ticks; "▪ RECOMMENDED" sits by
the radio like an eyebrow; status words sit right-aligned in the rows with their marks; the suggestion row reads as
pick-one cells and wraps to two joined rows on a phone; the route word sits on its line in every look. Two suggestion
designs were tried (joined cells A, square-marker list B, `prototypes-suggestions/`); A was chosen: the approved pattern
verbatim and the clearer affordance. A click or Enter still writes the suggestion into the field.

## Tests run (evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-no-pills-onboarding-20261013/`, `SHA256SUMS`)

- `build.py --check`, `build_home.py --check`, `build_rail.py --check`: ok at base and at a22855989c.
- Base inventory (frozen pill_check predicate, all 44 screens opened directly, 10 looks, 440 views; `inventory-base/`):
  every label capsule above, plus non-label shapes (below). NieR with its Square part draws no capsule (all corners 0).
- Candidate sweep (same, cand2 build; `inventory-cand2/`): no label capsule in any look; only the empty `.o55-path` on
  nas-smb/nas-nfs opened without a device (those screens throw on base and candidate alike when opened directly).
- Tour inventory on base (Friendly Light, NieR Dark, up to the drag step; `tour-inventory-base/`).
- New tool `tools/onboarding_label_check.mjs` (see its header), smoke runs on Nas1 kept with their failures in
  `check-smoke/` (README there): five harness corrections and three source corrections came out of them. The last full
  run of the window and tour (olc-smoke5: Friendly Light + NieR Dark without Square, normal motion) found no label pill,
  no change to any kept control, mark or markup, no contrast regression, both suggestion flows OK; its only failure was
  NieR's working ring caught mid-turn inside a status word (a glyph mark, now left to the mark comparison; confirmation
  in olc-smoke6: exit 0).
- Frozen `tools/pill_check.mjs` (`2d2ed65d…0041`) and `tools/settings_nopills_accept.mjs` (`f0f9293c…2728`) are unchanged
  and were not replayed: nothing they walk changed.

## Remaining NEW gates (for the Sol worker)

1. Full matrix of the new check on the branch head, base = the published page at e254a56477 (`git show
   e254a56477:"Concepts/Onboarding concepts/TestOpus5.5PmConcept.html"`): `node tools/onboarding_label_check.mjs
   Concepts/PMConcept7.html --base <base> --looks basic-light,friendly-light,glass-dark,retro-dark,basic-dark,friendly-dark,glass-light,retro-light,nier-light,nier-dark,nier-light-plain,nier-dark-plain
   --motion normal,reduced --sweep --parallel 2 --out <evidence>` (Nas1 is enough: computed styles, pixels of static words).
2. Narrow: the same with `--viewport 390x844 --motion normal --no-tour`.
3. Optional, root's call: `tools/scenarios.mjs` on the head (CSS moved some content a few pixels; no flow touches the
   changed labels), and a P1000 look pass if root wants GPU-rendered images. No film is needed: no label moves.

## Unresolved, for the coordinator

- Planning Wizard pill labels drawn by the tour's practice with the Wizard's own classes (82-tour-wizard.js, Wizard CSS,
  outside phase 3's files): `.pm6-wiz-schip` ("Not started", "Open", "Ready"), `.pm6-wiz-statepill` ("Practice · nothing
  will be built"), `.pm6-wiz-topic-prog` (4px round-ended meter). Real pill labels; need an owner and a ruling.
- Non-label shapes the rule calls pills, kept and listed OPEN by the check: Friendly's 6px chapter rail bar
  (`.o55-railbar-friendly`), the look menu's swatch bars (`.o55-lookswatch > i`, 3px corners on 7px), and the folder list
  box while it holds only "Empty folder" (`.o55-treelist`, the card corner in Friendly and Glass).
- Controls kept per the GO and PHASE3-MAP's open rulings: `.o55-switch`, `.o55-seg` (onboarding), `.o55t-bar`, `.o55t-seg`.
- Marks: needs and fail statuses have no mark element (glyph owner); `.o55-pill-fail` has no renderer on main (its CSS
  was updated for consistency, unverified); `.o55-officialurl` has no renderer (unverified).
- Friendly Light's accent words stay under 4.5:1 (2.6-3.2:1, all higher than before): the look's own coral and teal.
- Not touched: the resume notice's Basic Light pairing question (Jared's), the stage art's signs, glyph sources.
