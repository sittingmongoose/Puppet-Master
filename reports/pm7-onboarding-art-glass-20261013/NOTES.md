# Onboarding art + Glass controls (2026-10-13)

From pm-mail `pm7-onboarding-art-glass` (claude_party, Opus 5.5, xhigh, fast off), under
`share/puppet-master/2026-10-13-glass-review-feedback/PARTY-ONBOARDING-ART-GLASS-GO.md` (SHA-256 `27c06098…6eefa`) and
the coordinator's added items (home-redesign-planner, 2026-10-13: Glass captions and nameplates, the project-name field,
the step rail left to the Glass owner, the Create Project theme flicker, Planning Wizard and Orchestrator untouched).
First implementation only: not landed, no landing lock, no Plans or canon edits.

## Where it is

- Branch `concept/pm7-onboarding-art-glass-20261013`, stacked on `2e512390d8` (no-pills phase 3 plus the two repairs,
  unchanged). Source commits: `dbe1873ace` (art, rig, name field, Glass controls, theme preview hold), `37db1de920` (tour
  chat labels; the Glass curtain seam and switch timing from the frame review), `9c28f69792` (the label on its own line;
  the step rail's halo under the Glass layer). This report follows in its own commit. GitHub and NAS tips verified equal
  after every push.
- 20 paths change from `2e512390d8`; no Plans path:
  - art and rig: `src/js/51-art-basic.js`, `52-art-friendly.js`, `53-art-glass.js`, `55-scenes.js`, `58-rig.js`,
    `66-family-window.js`; `src/css/30-art.css`;
  - name field: `src/js/61-components.js`, `69-screens-project.js`, `src/css/10-window.css`;
  - Glass controls: `src/css/45-glass-controls.css` (new); guided-message labels: `src/css/43-chat-labels.css` (new);
  - theme preview hold: `src/js/60-ui-core.js`, `tools/build.py`;
  - test: `tools/art_joints.mjs` (new); `README.md`;
  - four generated pages at `9c28f69792`: `PMConcept7.html` = `Onboarding concepts/TestOpus5.5PmConcept.html` =
    `HomeTestPMConcept7.html` `e9b4544b86271316fae6fae7cded66202b26bb1c171ac280181afb0782508689`, `LeftRailPMConcept7.html`
    `74d1321ab565d55de160c8ff0af0cf161684c4cdbb5c4b1103c9fb25a4c0914c`.
- Generators: `build.py --publish-pm7`, `build_home.py`, `build_rail.py`, each `--check` ok. Outside the onboarding's own
  `O55:CSS` and `O55:BODY` blocks, the page differs from frozen `2e512390d8`'s by exactly two lines (the `applyPaint`
  hold below).

## What changed, and why

**The art (Jared: "redesign how the images/animations look on the onboarding left side graphics ... their limbs are
currently not really connected well to the bodies").** Every puppet's limbs now share their joints.
- Glass: a ball-jointed crystal marionette. A cut-glass torso with sockets at its corners; glass-rod limbs with light
  piped through them in the puppet's tint; glass beads at the neck, shoulders, elbows, hands, hips and knees; planted
  glass feet. Before, capsule arms floated beside a hex torso and the legs hung either side of its pointed base.
- Glass scene: the Glass wallpaper's language (Liquid Glass, Ribbons). A clear sky for the bar and strings, five layered
  waves of tinted glass rising behind the stage (opaque colour mixed from the look's tokens, lit crests, soft shadows,
  a slow sideways swell), a few lens droplets instead of the old shard debris, and a thick glass plinth for a stage.
  Light mode deepens the glass edge so the puppets keep their outline on a pale sky.
- Friendly: two-part felt sleeves folded at the elbow, mitten hands, and short legs running up under the hem, so the
  shoes are always attached (before, the shoes floated below the dress). The art's dots are stronger (Jared likes them).
- Basic: every joint is drawn, the elbows too. Retro: unchanged drawings. NieR's units: unchanged (approved showpiece).
- A waving arm is the rig's `.o55-arm` holding an `.o55-fore`; the rig bends the forearm at the elbow a quarter cycle
  behind the upper arm, and the hand's string follows through both.

**Captions and nameplates (coordinator item 1: "the capsule-shaped captions and nameplates ... redesigned").** Glass
captions have no box: a filament leaves a bead on the thing, turns at a small lit square and runs on as a fading shelf
of light the words stand on. Glass signs (the name sign, the ready sign, the plan's notes) are cut-glass plates with
chamfered corners, a bevel and a line of the accent along the foot. Friendly's pills went the same way: stitched paper
cards for signs, and squiggle-underlined words for captions and node names.

**The project-name field (item 2: "it looks almost like it is missing and the words dont sit right").** Two causes.
In the Liquid Glass preview Jared saw, the Glass layer's section 11 boxes the whole `.o55-field` wrapper, so the label
and the "Good name" hint sat inside the glass box (reported to pm7-liquid-glass with line numbers). In the source, the
hint line appeared only once a name was valid, which pushed the suggestions down while typing. Now: a 56 px nameplate
field with the words set large on its centre line, the hint line always reserved, one clear focus signal (the accent
edge and a ring; the app's own blue outline no longer rings it twice), and each look's material (a lit glass well in
Glass, a paper card in Friendly, pixel edges in Retro; NieR keeps its own field).

**Glass controls (Jared: "update the buttons and switches in the onboarding to match your new look").** The Glass
owner's approved section 11, rolled out into the onboarding's own source and reading its `--lg-*` tokens with the same
values as fallbacks: glass buttons, a tinted-glass main action (a deeper blue in Glass Dark, where white words on the
pale accent read about 2:1), glass rows that light up when chosen, segments on a glass track (the Glass layer's lens
takes the selection when it is on), the curved glass switch with a slower spring, and the tour's callout, bar and
buttons. The step rail is not restyled (the Glass owner's page selector). The app's left rail and top bar are not
touched (coordinator: the Glass owner's).

**The guided messages' tags in the shell's Chat (Jared via the coordinator: the no-pills rule covers "Guided example"
and "Teacher message").** The Teacher adapter and Pod 042 relabel the shell's capsule runtime tag on the messages they
mark (`data-o55-guided`, `data-o55-pod042`). `src/css/43-chat-labels.css` turns exactly those tags into the approved
no-pills label: the word in small capitals after a 5 px square in its own ink, no box, border or fill; the reply's ink is
the secondary text colour, the person's own bubble keeps its text colour (Retro Light its approved readable ink), Retro
sets it in its display face and NieR Mode in its ink and mono face. The Chat's own runtime tags on ordinary messages
are the Chat surface's and are left alone. The frozen `2e512390d8` edition, which the Sol worker is testing, is
unchanged.

**The Create Project theme flicker (item 4).** Sol's diagnosis (`share/puppet-master/2026-10-13-hover-themeflash-diagnosis/`)
named the wrong temporary theme writes. Its spec pointed at `pm7-tools/settings_tome_source.py`, but `applyPaint`
reaches PMConcept7 only through the SHA-pinned base page, so the fix is a guarded patch in `tools/build.py`
(`THEME_PREVIEW_PATCHES`, coordinator approval 1013211956) and `window.O55_PAINT_PAIR` in `60-ui-core.js`: while the
window owns a look preview, `applyPaint` paints the window's pair. Nothing is stored; NieR's paint hook, the seed, the
save and its timing are unchanged.

**Three rig defects found by the new test, all present on the frozen base too:**
- the stage rule `.o55-in, .o55-am { transform-box: fill-box; transform-origin: 50% 50% }` turned the rig's groups about
  their box centre, where the rig computes (and documents) turning about the puppet's feet: leaning puppets slid their
  feet and their strings drifted 0.2–0.6 units; the rig's own groups now keep the attribute's meaning;
- Retro hopped a hung prop in its own (2×) units while its string followed in scene units: a constant 4-unit gap on the
  computer and the name sign;
- the curtain call let the rig cache its hook places while the springy rise was settling: strings hung up to 2.5 units
  off the knots afterwards; the call now re-measures when it ends.

## Checks

All on GPU fleet browsers (P1000, ANGLE Quadro P1000; Windows RTX 3090 for the first stills), pages loaded from the
share as files, no Nas1 browser after the first "before" stills. Raw evidence:
`/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-onboarding-art-glass-20261013/` (`SHA256SUMS` there). Failed and
superseded attempts are kept under `joints-attempt1-unheld-sampling/`, `superseded/` and
`themeflash/attempt-final-dirty-profile/`.

**Strings and joints (`tools/art_joints.mjs`, new).** Each scene with a troupe, every look, dark and light, 12 held
poses each (the troupe moves for 180–420 ms, the motion clock is held, two rig frames later every string's two ends are
measured against their hooks):

| Page | Motion | Scenes | Failed | Largest gap (units) | Forearm bend |
|---|---|---|---|---|---|
| frozen `2e512390d8` | normal | 16 (welcome, where, name, ready) | 5 | Ready 0.75–2.55; Retro 4.0 | none (no elbow) |
| `df5d5e48` (commit `37db1de920`) | normal | 56 | 0 | 0.079 | up to 29.7° on tied waving arms |
| `df5d5e48` | Reduced Motion | 56 | 0 | 0.050 | 0.00° (still) |

The first attempt measured a moving troupe between rig frames, which reads a frame's travel as a gap; it is kept as a
failed attempt and the tool now measures held poses. One later run found the Reduced Motion forearm following a cheer;
the rig now keeps the forearm still with the ambient motion held.

**Create Project theme flicker (Sol's `theme-trace-final.mjs`, unchanged, SHA-256 `8c5a9d58…7def84`).**
- Frozen `2e512390d8`, Glass Light Fresh and Copy: FAIL `noOffLookWrite` (the wrong temporary writes).
- Candidate: PASS in 7 of 7 cases on an intermediate build (Glass Light Fresh/Copy, Glass Dark Copy, Friendly Dark,
  Retro Light Copy, Basic Light, NieR Light), Glass Light Fresh and Friendly Dark Fresh inside the film on page
  `88559d6c`, and on the final page `e9b4544b` in a fresh profile: Glass Light Fresh and Copy and Friendly Dark Fresh
  PASS. Creation finishes, frames unchanged, no page errors.
- Two runs on page `df5d5e48` failed at setup (a look tile click blocked by the window scrim) after the two-defect check
  had left NieR Mode on in the same profile; kept as failed attempts and rerun in a fresh profile (above).

**The two repaired defects (that repair's own `check.mjs`, predicates unchanged, run over CDP).** Page `df5d5e48`, 10
looks: demo square over the scenario's first letter 0/10 (Home and Settings), Home NAS caption over the puppet 0/10, NAS
drawing over the puppet 0/10 (in Glass only the NAS's soft glow circles touch, as the repair recorded).

**Guided-message labels.** Reached through the tour's own Next and Show Me (no forced state), six looks (Glass Dark
and Light, Friendly Light, Retro Light, Basic Dark, NieR Dark): every label has no radius, fill or border and its square
is the word's ink. The capture showed the label running into the person's message text; it now has its own line
(re-captured on `e9b4544b` in the same six looks).

**Film and frame review.** One P1000 1080p60 H.264 recording, 180 s, 10,808 frames, six clips: Glass Dark (opening,
scene change, typing the name, Ready), Friendly Light (name, Ready), Basic Dark (Ready), Glass Light controls (Light/Dark,
the main action, the README switch), Glass Dark tour, Glass Dark Reduced Motion; plus Sol's two Create Project traces.
Frames were cut at every third frame (and every frame for the switch) after colour markers placed at each step. Found and
fixed: the Glass curtain's hard white flare bar; the switch knob covering four fifths of its travel in one frame.
Everything else held: no blank or torn frames in scene changes, the sign widening with its strings on its corners,
limbs and strings attached through every bow, Reduced Motion one short cross-fade with the troupe still. File metadata
says 60 fps; distinct frames were checked only where reviewed, not across the whole file. A second, 35 s recording on
the final page `e9b4544b` checked the two fixes: the seam now blooms as a soft band from the middle and fades with no
hard edge; the knob now travels over about seven frames (16–23 of the sheet) and settles. The evidence worker's browser
starts may have overlapped that short film; the reviewed frames show no hitch. Strings on `e9b4544b` (Welcome and Ready,
all looks, both modes, 12 held poses): 32 runs, 0 failed.

**Generators and page delta.** `build.py --check`, `build_home.py --check`, `build_rail.py --check` ok at each commit.
Outside the `O55:CSS` and `O55:BODY` blocks, the page differs from frozen `2e512390d8` by exactly the two `applyPaint`
lines. No rule added names a label class (static check over the CSS diff).

## Not changed, and open items

Kept exactly as they were:
- every no-pills label rule (no added rule names a label class; `12-components.css`, `24-no-pills.css`, `40-tour.css`
  and `41-tour-nier.css` are untouched), the action semantics, the flow, the named states and the tour steps;
- the two repaired defects (`57-scenes-journey.js` and the demo strip rule are untouched; the begin screen's device beat
  was re-checked in seven looks: the Home NAS caption stays clear of the stepped-aside puppet);
- the scene glyphs and prop silhouettes (GLY-4 stays open), `25-glyphs.css` and the glyph catalog;
- NieR's units, Retro's drawings, the step rail, the app's left rail and top bar, Settings, the Planning Wizard and
  Orchestrator pages (no change there, so nothing to list under Jared's 18:38 update);
- the frozen `2e512390d8` page, its evidence, its tests and the T1–T3 release work bound to it;
- `90-demo.js` and the demo strip (pm7-demo-studio is taking them over; told about the approved dot repair).

Open, for their owners:
- pm7-liquid-glass, agreed by mail: its lens already covers the step rail (contract: `#pm-o55-onboarding .o55-raillist`,
  items `.o55-railitem`, active `[data-state="current"]`, labels not magnified; this branch drops the node halo under
  `data-lg="on"`); its checkpoint `34e5452f8e` removed the three colliding section 11 rules (field wrapper, tour bar
  buttons, card hover) and adopted this branch's switch curve; at integration section 11 shrinks to the lens, the
  held-knob lens, the scrim veil and the stage well. The troupe study `8a94be0853` (card LG2-ART) was a reference only;
  LG2-ART itself was never answered and is not decided here.
- Canon (a proposal for the Plans owner, not made here): the no-pills record could say that art captions and signs are
  labels too (box-less captions; plates, not capsules), and that the onboarding's Glass controls follow the Glass
  owner's section 11.
- pm7-perf-impl-sol: its M6 replaces `applyPaint`'s setter pair; it keeps the `O55_PAINT_PAIR` override (agreed). The
  generated pages differ, so the second branch to land rebases and regenerates.
- Release: the evidence gaps T1–T3 of the frozen `2e512390d8` edition are untouched and still the Sol worker's. This
  edition has its own evidence below, not a relabelled copy.

## Evidence and packet

- Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-onboarding-art-glass-20261013/` (338 files, 142 MB),
  `SHA256SUMS` `be04dfdc841049a822cbb8e65ccdbed6c52b93969871970c3242c9b7c8f0585f`; the capture and film scripts are in
  `scripts/` there.
- Review packet: `/mnt/Cursor/share/puppet-master/2026-10-13-onboarding-art-glass/` (README, previews at `9c28f69792`,
  one under the Glass owner's checkpoint `34e5452f8e`, before/after sheets, both films and their frame sheets).

## Resources at close

No GPU fleet session, browser, profile, recording, server or tunnel of this thread is left running; the waiter is
consumed at the final stop. The worktree stays, clean, for review until the landing.
