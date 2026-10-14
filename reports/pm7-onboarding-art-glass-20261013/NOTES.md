# Onboarding art + Glass controls (2026-10-13)

From pm-mail `pm7-onboarding-art-glass` (claude_party, Opus 5.5, xhigh, fast off), under
`share/puppet-master/2026-10-13-glass-review-feedback/PARTY-ONBOARDING-ART-GLASS-GO.md` (SHA-256 `27c06098…6eefa`) and
the coordinator's added items (home-redesign-planner, 2026-10-13: Glass captions and nameplates, the project-name field,
the step rail left to the Glass owner, the Create Project theme flicker, Planning Wizard and Orchestrator untouched).
First implementation only: not landed, no landing lock, no Plans or canon edits. The contrast amendment (coordinator,
2026-10-14: the focused landing check's nine Glass Light readings, then every onboarding and tour screen in all five
looks) is its own section below.

## Where it is

- Branch `concept/pm7-onboarding-art-glass-20261013`, rebased on 2026-10-14 onto `main` `916059849e` (the coordinator
  asked for `b94e6183b1`, then the Wizard and Orchestrator landing and perf M1 reached `main`; the branch was pushed on
  `b94e6183b1` as `928c7b997c` first) together with the no-pills phase 3 stack it sits on (frozen tip `2e512390d8`,
  rebased as `fe1dff9bc5`, its own commits unchanged). Source commits: `842e237feb` (art, rig, name field, Glass
  controls, theme preview hold), `c3d8a095ea` (tour chat labels; the Glass curtain seam and switch timing from the
  frame review), `da3702fa02` (the label on its own line; the step rail's halo under the Glass layer), `3d2b75cc2f` (the
  contrast amendment, its tool and the regenerated pages), `af0d8ae6b7` (Ready's celebration under its lettered emblem,
  after landing2's stop), `1e059c334b` (Ready's curtain-call polish: the stamp's exit, ALL CLEAR's type-on). This
  report follows in its own commit. GitHub and NAS tips
  verified equal after every push.
- The one source conflict of the rebase was `tools/build.py`: perf M1's `shared_fitting_patch` and this branch's
  `THEME_PREVIEW_PATCHES` are both applied (M1 first; they touch different regions of the base page). Every commit's
  pages were regenerated as it was replayed.
- 30 paths change from `fe1dff9bc5`; no Plans path:
  - art and rig: `src/js/50-art-core.js`, `51-art-basic.js`, `52-art-friendly.js`, `53-art-glass.js`, `54-art-nier.js`,
    `54-art-retro.js`, `55-scenes.js`, `58-rig.js`, `59-cheer.js`, `66-family-window.js`, `74-screens-ready.js`;
    `src/css/30-art.css`;
  - name field: `src/js/61-components.js`, `69-screens-project.js`, `src/css/10-window.css`;
  - Glass controls: `src/css/45-glass-controls.css` (new); guided-message labels: `src/css/43-chat-labels.css` (new);
  - contrast inks: `src/css/10-window.css`, `11-window-nier.css`, `12-components.css`, `40-tour.css`, `41-tour-nier.css`;
  - theme preview hold: `src/js/60-ui-core.js`, `tools/build.py`;
  - tests: `tools/art_joints.mjs` (new), `tools/contrast_worst.mjs` (new); `README.md`;
  - four generated pages at `1e059c334b`: `PMConcept7.html` = `Onboarding concepts/TestOpus5.5PmConcept.html` =
    `HomeTestPMConcept7.html` `5bcd1987fe4d1a332bdd0d782b698333c7aebe21c70d46f461ca9987c45850e0`,
    `LeftRailPMConcept7.html` `2c37fcc66f210b48998cab885dae4d9ff3d21b9895b54ed75b1bb3cb20c81cc3` (at `3d2b75cc2f`, where the full table below was measured: `9cdead9d…`, `92d0625c…`).
- Generators: `build.py --publish-pm7`, `build_home.py`, `build_rail.py`, each `--check` ok. Outside the onboarding's own
  `O55:CSS` and `O55:BODY` blocks, the page differs from `main`'s (and from `fe1dff9bc5`'s) by exactly two lines (the
  `applyPaint` hold below).

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
- Basic: every joint is drawn, the elbows too. Retro: unchanged drawings (its curtain call's ALL CLEAR and its accent
  sign's words changed for contrast, below). NieR's units: unchanged (approved showpiece; their labels' ink, below).
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
Outside the `O55:CSS` and `O55:BODY` blocks, the page differs from frozen `2e512390d8` (and, after the rebase, from
`fe1dff9bc5` and from `main` `916059849e`) by exactly the two `applyPaint` lines. No rule added in the onboarding window
names a label class (static check over the CSS diff; the guided-message labels in `43-chat-labels.css` restyle the
shell's `.runtime-snapshot` tag, as assigned).

## Contrast amendment (2026-10-14)

**The ask** (home-redesign-planner, 2026-10-14). The focused landing check stopped on nine readings under the floor,
all in Glass Light, Pick a look, normal motion, 1440 x 900: the step rail's four labels (2.78 to 2.79), "the plan"
(2.82), "Make it yours" (3.93), the Paper theatre and Light lab tile lines (4.10, 3.78) and Continue (3.63). Fix them in
the design without losing the look ("Jared's bar applies"); then run the same worst-case method over every onboarding
and tour screen in all five looks, light and dark, normal and Reduced Motion, until nothing reads under 4.5:1 (3:1 for
large text); rebase on `main` `b94e6183b1`.

**Method: `tools/contrast_worst.mjs` (new).** The landing check's arithmetic (`pixels.mjs` in
`PuppetMaster-Evidence/tests/pm7-onboarding-landing-focused-20261013/scripts/`): for each rendered text run a native
screenshot between two read-only text snapshots, both snapshots' glyphs drawn on a detached canvas, unioned and grown by
two pixels, every other pixel inside the text's own boxes a background pixel, the ink's alpha and every ancestor's
opacity composited over it, the lowest WCAG ratio kept. Floors 4.5:1 and 3:1 for large text (24 px, or 18.67 px bold;
SVG text scaled by its transform); text in an inactive control is exempt, as in the landing check. The image analysis
runs in Node, not in the page. On the rebased head before any change (page `c1be6838`) it reproduced all nine: the rail
labels 2.78 to 2.79, Continue 3.63, Light lab 3.78, Make it yours 3.93, Paper theatre 4.10, and "the plan" 2.14 at worst
over two frames of the moving art (the landing's single frame read 2.82). One difference, found on the Mac: the glyphs
are drawn clipped to what the overflow shows grown by the two-pixel guard, where `pixels.mjs` clips them exactly. At a
scrolling list's bottom edge the page drew the comma of "plan," a pixel higher than the canvas did; clipped exactly,
the canvas copy lost that row before the guard could cover it, and the comma's own ink read as its background (Glass
Dark, All providers: 2.25; 4.74 with the grown clip; map and both runs in `contrast/diagnostics/`). The landing check
would read that view the same way on a GPU browser, so its owner may want the same one-line change.
- Coverage: the 44 onboarding screens in `src/coverage.json` plus the guided tour's 20 steps, reached by Show Me and Next
  as a person goes. The six SSH steps for files on another device (`nas-identity`, `-key`, `-signin`, `-install`,
  `-pmpair`, `-folder`) refuse a direct jump without a chosen device; the tool now chooses the first device found on
  Find it first, as a person does, and all six are measured.
- Normal motion: two frames 0.9 s apart, the lower reading kept; Reduced Motion: one frame (the art holds still).
- A view is measured once it has settled: one screen layer, entrances finished, NieR's cold-open log gone, the tour's
  spotlight arrived (`O55.tour.afterGlide`), and the callout, the screen, its words and its scroll unchanged over six
  reads. A capture is taken again (twice at most, each retry recorded in `contrast.json`) when a window or tour word
  moved between the two snapshots around it. Each of these rules came from a reading that was not about colour; all of
  those runs are kept (below).
- Exempt or held, as in the landing check and listed per row in `contrast.json`: inactive controls; the tour's guided
  Chat messages under the tour's scrim outside its spotlight; and words too short for any background pixel to survive
  the two-pixel guard (Basic's art labels such as STAGE and WHERE, the rail's "AI"), which have no reading at all.

**What changed, by cause.** Every hue stays. Words moved to the inks each look already uses for words, and where a word
lay on part of a drawing, the word or that part moved.
- *Glass Light* (the nine): a step still to come is lettered in the secondary ink (the muted ink at 48% read 2.8:1 on
  Light's pale sheet); the accent as words (each title's eyebrow, links, a card's arrow) is the accent mixed 68% with the
  text colour; the main action is a deeper blue with a light sheen at its top, so white words read 4.5:1 or more over its
  whole face; choice rows and tiles sit on a whiter sheet; a tile's line is the text colour at 82%; "the plan" and the
  art's other captions stand on a frosted slip under the words (the shelf of light stays, just under the slip), and
  plates are measured to their words. The tour's kicker and brand are its accent mixed 64% with black (the callout's
  clear glass shows whatever the app has behind it).
- *Friendly Light*: Paper theatre's orange read 2.8:1 as words on white and under white words. Words take the brick the
  labels already use (orange 66% with black), the main action a slightly lighter brick (70%, 5.2:1 under white), in the
  window and the tour.
- *Quiet words in every look* (group titles, hints, phase labels, review keys, the rail's later steps): each look's muted
  ink is mixed toward its body text by the least that reads (Basic Light 92%, Basic Dark 66%, Friendly Light 44%,
  Friendly Dark 70%, Glass 45%, Retro Dark 82%), in the window and the tour; NieR keeps its own (below). The tour bar's
  "Tips" label is the secondary ink.
- *Links*: the underline runs under the descenders (`text-underline-position: under`, 2 px), clear of the words' own box,
  instead of through the bottom of the letters; NieR keeps its ink hairline there.
- *NieR*: in the window and the tour the quieter ink is one step further from the ground (Light `#3f3d33`, where the
  theme's `#4d4b3f` read 4.16:1 on a grid line; Dark `#c0bca7`, where `#a8a593` and `#9d9986` read 3.5 to 4.2:1 on a
  lifted panel); the art's mono labels are the ink at 90% (62% read 3.6:1, 80% 4.15:1 on a dark grid line); the brand's
  "Setup · 03/05" 84%; Pod 042's header 90%; a look tile's line is NieR's ink, not the previewed look's text colour; a
  failed step's error ink is a step further from the ground (light `#7d3427` read 4.2:1 on a grid line, dark `#d98a77`
  3.9:1); a prop's caption stands on a knock-out of the ground the width of its line; the drifting motes are the ink at
  16% (at 26 to 30% a caption a mote lay on read 3.7:1); a device's identity words sit over its card and carry
  `data-o55fx-avoid`, so Pod 042 and its speech box keep clear of them (under the card Pod hovered on them: 1.00). The
  "Guided example" label on the person's own Chat bubble takes the bubble's text colour in NieR too: NieR inverts that
  bubble, and in NieR's ink the label vanished into it (1.00 in both modes, where a step's spotlight takes in the whole
  Chat). The theme's tokens are untouched.
- *Art*: Basic's words are its text ink and its accent words a deepened orange on light paper; Basic's APPROVED stamp
  is a solid tinted field with every line clear of its words and turned 2 degrees instead of 6; Friendly's squiggles sit
  below the words; the shared folder's name is above the folder where it sits on the NAS's corner (under it, it ran
  across the NAS's outline) and under it elsewhere (above it, it met the sun); a device's four identity words are two
  lines of two (in one line they ran out under the stage's curtain: 1.00); Retro's ALL CLEAR is set in a game's message box hung in front of the strings (it used to cast an offset copy of itself, and
  the strings crossed both: 1.1:1), its SETUP 100% is the orange deepened toward black on cream (2.0:1 before), an
  accent sign's words are cream on Light's cobalt (ink read 1.9:1), PRESS START keeps its words steady and blinks a
  block cursor after them (the whole sign blinked down to a quarter: 1.1:1), and a prop's caption stands on a knock-out
  of the ground drawn under the sprite (a twinkling star inside SAFE HISTORY read 1.2:1). Friendly Dark's third
  backdrop star moved from behind the identity words (1.2:1) up into the sky.
- *The tour's guided Chat*: the "Simpler explanation of the reply above" line is the secondary ink (the Chat's muted ink
  read 3.0:1 in Friendly Light, where a step's spotlight takes in the whole Chat).
- *Small items*: the provider logos' letter is 21% lightness on light sheets (it read 2.3 to 4.4:1) and 76% on dark;
  a failed step is lettered in the look's needs-attention ink, a step deeper on light sheets, and its "!" mark is white
  on that ink there (the raw orange read 3.2:1, dark on Glass Light's orange 4.2:1); the pairing code keeps its
  font's own figures, because tabular figures put a "1" where no glyph mask taken from the text expects it, which read
  as ink on ink (1.00) whenever the random code held a 1.

**Result on the final page** (page `9cdead9d`, the committed page after the rebase onto `916059849e`; GPU fleet browsers
on the Mac for Basic, Friendly and Retro Light and on Windows for Glass, NieR and Retro Dark; pages loaded from the
share as files), every view of every look, 1440 x 900:

| Look | Mode | Motion | Views (tour steps) | Words measured | Held | Exempt | Under the floor | Lowest reading (its floor) |
|---|---|---|---|---:|---:|---:|---:|---|
| Basic | light | normal | 64 (20) | 1234 | 92 | 154 | 0 | 4.69 (4.5:1) "Paper theatre · warm and playf", look |
| Basic | light | Reduced Motion | 64 (20) | 1229 | 92 | 126 | 0 | 4.69 (4.5:1) "Paper theatre · warm and playf", look |
| Basic | dark | normal | 64 (20) | 1234 | 92 | 154 | 0 | 4.77 (4.5:1) "Unraid", s-wait |
| Basic | dark | Reduced Motion | 64 (20) | 1230 | 92 | 126 | 0 | 4.77 (4.5:1) "Unraid", s-wait |
| Friendly | light | normal | 64 (20) | 1158 | 3 | 145 | 0 | 4.71 (4.5:1) "Explain this reply simply", tour:answer_stream |
| Friendly | light | Reduced Motion | 64 (20) | 1146 | 11 | 118 | 0 | 4.71 (4.5:1) "Explain this reply simply", tour:answer_stream |
| Friendly | dark | normal | 64 (20) | 1150 | 3 | 154 | 0 | 4.74 (4.5:1) "its id", nas-identity |
| Friendly | dark | Reduced Motion | 64 (20) | 1146 | 11 | 118 | 0 | 4.74 (4.5:1) "its id", nas-identity |
| Glass | light | normal | 64 (20) | 1142 | 10 | 154 | 0 | 4.57 (4.5:1) "Tips: switch to ELI5 on the ba", tour:comfort_intro |
| Glass | light | Reduced Motion | 64 (20) | 1137 | 9 | 126 | 0 | 4.57 (4.5:1) "Tips: switch to ELI5 on the ba", tour:comfort_intro |
| Glass | dark | normal | 64 (20) | 1143 | 9 | 154 | 0 | 4.75 (4.5:1) "G", ai |
| Glass | dark | Reduced Motion | 64 (20) | 1137 | 9 | 126 | 0 | 4.75 (4.5:1) "G", ai |
| Retro | light | normal | 64 (20) | 1148 | 12 | 145 | 0 | 4.66 (4.5:1) "Guided example", tour:workspace_orientation |
| Retro | light | Reduced Motion | 64 (20) | 1135 | 12 | 126 | 0 | 4.86 (4.5:1) "Paper theatre · warm and playf", look |
| Retro | dark | normal | 64 (20) | 1142 | 10 | 154 | 0 | 5.10 (4.5:1) "undefined · undefined", c-pair |
| Retro | dark | Reduced Motion | 64 (20) | 1136 | 10 | 126 | 0 | 5.10 (4.5:1) "undefined · undefined", c-pair |
| NieR | light | normal | 64 (20) | 1752 | 65 | 145 | 0 | 4.89 (4.5:1) "Explain this reply simply", tour:answer_stream |
| NieR | light | Reduced Motion | 64 (20) | 1732 | 56 | 126 | 0 | 4.89 (4.5:1) "Explain this reply simply", tour:answer_stream |
| NieR | dark | normal | 64 (20) | 1752 | 63 | 145 | 0 | 4.58 (4.5:1) "Tips: switch to ELI5 on the ba", tour:comfort_intro |
| NieR | dark | Reduced Motion | 64 (20) | 1729 | 56 | 126 | 0 | 4.58 (4.5:1) "Tips: switch to ELI5 on the ba", tour:comfort_intro |
| **all** | | | **1280** | **25612** | 717 | 2748 | **0** | |

Every screen and every tour step was reached in every look and motion: 64 views each (44 onboarding screens with the
six SSH steps, 20 tour steps), no unreachable view, no screen layer held. 44 captures were taken again because a window
or tour word moved during them, none more than twice in a row. *Held* words have no reading: 684 too short for any
background pixel to survive the two-pixel guard (Basic's art labels such as STAGE and WHERE, the rail's "AI") and 33
whose text or paint changed during the capture (Pod 042's lines as they type, the pairing countdown, guided Chat
messages as the tour's spotlight moves onto them); *exempt* words are 2,320 of the tour's guided Chat messages under its
scrim outside the spotlight and 428 words of inactive controls, as in the landing check. The lowest readings are 4.57
(Glass Light, the tour bar's Tips line) and 4.58 (NieR Dark, the same line). The same pass on the page before the
rebase (`d6c37d17`, on `b94e6183b1`) also read nothing under the floor (`final-wip7/`; its one tour step the walk passed
over, Glass Light Reduced Motion's `open_planning`, was measured on its own: 4.57). One thing seen in passing, not a
contrast item: reached by a direct jump, the pairing screen's identity line reads "undefined · undefined" (no device
is chosen on that path); a person reaches it with a device.

**Earlier runs, kept** (`contrast/` in the raw evidence, with every failing view's screenshot):
- `attempt0-before-head-701f665/`: the rebased head before any change (Basic Light: 184 readings under the floor in 58
  views; the nine reproduced; Glass Light Reduced Motion).
- `attempt1-wip1-first-fixes/` (page `29640473`): the first fixes. Basic Light down to items fixed next; Basic Dark,
  Friendly Light and NieR Light and Dark failing on muted ink, Friendly's orange, NieR's quiet ink and links; three
  readings that were not colour: the tour callout still gliding during a capture (1.0), NieR's cold-open log left over
  a screen by a jump made during it (1.1), Friendly's folder name across the NAS outline (1.00, real).
- `attempt2-wip2/` (page `c1cb9e09`): Basic Dark, Friendly Dark and Glass Dark clean but for the items below; Glass
  Light's links and tour kicker (2.96 to 3.67), Retro's curtain call and accent sign (1.06 to 1.98), NieR's look tiles
  (3.96, 4.35), the pairing code's tabular "1" (1.00), the failed-step orange (3.2), a provider row still updating
  during a capture in Glass Dark (2.25; 4.82 measured again alone), the tour callout again in Friendly Light (1.0), and
  NieR's orphaned cold-open log again. Each led to a fix above or to a settling rule.
- `attempt3-wip3-stopped/` (page `324f49dd`, Mac) and `attempt4-wip4-stopped/` (page `51454da3`, Windows), stopped
  once they had shown what was left: Basic Light and Glass Light clean in both motions but for Glass Light's failed step
  (fixed in wip4); on the six newly reached SSH steps, Friendly Light's identity words (1.00), its projects folder name
  under the sun (2.69) and a card line cut by the list's edge (4.496); Friendly Light's guided Chat line (2.98); Glass
  Dark's "plan," comma at the list's edge (2.25, the clip above).
- `attempt5-wip5-full/` (page `a823a748`): the first full pass over every look. Basic and Glass clean in all four
  combinations; Friendly Dark's identity words on a backdrop star; Retro's PRESS START caught mid-blink and SAFE
  HISTORY's star; NieR's identity words under Pod, its failed-step inks, a mote on a caption, and the Chat label on the
  person's bubble (both modes).
- `targeted-wip6/`, `targeted-wip7/` (pages `7a43d666`, `d6c37d17`): those screens again after each fix (Retro's
  screens in both modes, Friendly Dark's screens, NieR's affected screens in both modes and motions); clean on wip7.
- `final-wip7/` (page `d6c37d17`, on `b94e6183b1`) and `final-rebased-9cdead9d/` (the committed page): the two full
  passes above.
- `diagnostics/`: the six SSH steps reached through Find it; Glass Dark's providers list measured alone on Nas1 and on
  the Mac, before and after the grown clip, with the pixel map.

**Follow-up: Ready's celebration (landing2's stop and the coordinator's go, 2026-10-14).** landing2's reader caught
Ready's curtain-call confetti mid-flight with a cobalt piece inside Retro's ALL CLEAR box: the same cobalt as the
words, so 1.00. The settled box reads 5.92, and the full pass above measured after the burst. Still, the code meant
the burst to play under the emblem, and it was drawn over it. Now (`af0d8ae6b7`):
- the burst's group goes beneath Ready's first lettered emblem (Basic's stamp, Retro's ALL CLEAR and score;
  `A.famCall.lettered`), in the curtain call and in the Reduced Motion / low-resource celebration on Ready. Checked in
  the DOM mid-burst: in Retro and Basic the confetti sits in the front layer before the emblem; Friendly and Glass have
  no lettered emblem and keep theirs as before;
- Basic's impression shows its words at C+340 ms, once the lifting stamp is clear of them (its edge crossed them,
  1.07); the word on the stamp's own face is in the solid ink (3:1 in Dark); Retro's SETUP 100% stands on a ground
  knock-out like its captions;
- `tools/contrast_worst.mjs --during` measures a screen at set moments before it settles.

Ready in all five looks, light and dark, normal and Reduced Motion, measured settled and at eight moments 1.3 to 3.4 s
into the curtain call (180 views, `contrast/ready-burst/final-ready-*`): no confetti reading, no ALL CLEAR or stamp
reading after the burst, Glass, NieR and Friendly clean at every moment. Two one-shot moments inside the curtain call
still read low, both motion rather than ink: Basic Light at 1.9 s, the stamp flying off up and to the right over the
control bar's "CONTROL · 224" label (1.00, about 0.2 s); Retro at 1.3 s, ALL CLEAR's box wiping in with its words for
360 ms, so the strings showed inside the words' box (1.04 to 1.25). The coordinator ruled brief motion moments in a
one-shot celebration are not contrast failures, and asked for both to be fixed to the polish bar (`1e059c334b`): the
stamp lifts a little up and to the right and fades out by C+320 ms, near the paper; ALL CLEAR's message box opens
whole and only its words type on inside it. Ready again in every look, both modes and both motions, settled and at
eleven moments 1.1 to 3.5 s in: 240 views, none under the floor (`contrast/ready-burst/polish-ready-*`).

## Not changed, and open items

Kept exactly as they were:
- every no-pills label rule and label ink (`24-no-pills.css` is untouched; the contrast amendment adds no rule naming a
  label class and changes no `--o55-ink-tag`, `-wait`, `-ready`, `-needs` or `--o55t-ink-try` value; it edits
  `12-components.css`, `40-tour.css` and `41-tour-nier.css` only for the words listed under the amendment), the action
  semantics, the flow, the named states and the tour steps;
- the two repaired defects (`57-scenes-journey.js` and the demo strip rule are untouched; the begin screen's device beat
  was re-checked in seven looks: the Home NAS caption stays clear of the stepped-aside puppet);
- the scene glyphs and prop silhouettes (GLY-4 stays open), `25-glyphs.css` and the glyph catalog;
- NieR's units and the NieR theme's tokens, Retro's sprites, the step rail's styling (only the ink of its later steps' words,
  as for every quiet word), the app's left rail and top bar, Settings, the Planning Wizard and Orchestrator pages (no change there, so
  nothing to list under Jared's 18:38 update);
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
- The landing check's owner: `pixels.mjs` draws its glyph mask clipped exactly to the overflow, so on a GPU browser a
  word cut by a scrolling list's edge can read its own ink as background (Glass Dark, All providers: 2.25 where the
  grown clip reads 4.74; `contrast/diagnostics/glass-dark-ai-all-mask-map.txt`). Growing that clip by the two-pixel
  guard (one line, as in `tools/contrast_worst.mjs`) keeps the landing from stopping on it. The SSH steps of Files on
  another device (`nas-identity` to `nas-folder`) need a device chosen on Find it before a direct jump reaches them.

## Evidence and packet

- Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-onboarding-art-glass-20261013/` (971 files, 283 MB),
  `SHA256SUMS` `39ca1dddc91617c77f2dc85d099aefb3910eafa09b0c10abd5ac52bf1fb43790`; the capture and film scripts are in
  `scripts/` there; the contrast amendment's runs, diagnostics, stills, page hashes (`PAGES.sha256`) and scripts are
  under `contrast/` (every failed attempt kept).
- Review packet: `/mnt/Cursor/share/puppet-master/2026-10-13-onboarding-art-glass/` (README, previews at `9c28f69792`,
  one under the Glass owner's checkpoint `34e5452f8e`, before/after sheets, both films and their frame sheets).

## Resources at close

No GPU fleet session, browser, profile, recording, server or tunnel of this thread is left running (the contrast
amendment's Mac and Windows sessions were stopped and purged; its scratch pages were deleted after their hashes went
into `contrast/PAGES.sha256`); the waiter is consumed at the final stop. The worktree stays, clean, for review until
the landing.
