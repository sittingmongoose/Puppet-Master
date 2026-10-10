# Shard 092: DL-162 — The Left Rail Takes The Polish Design (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L42135-L42590

Source SHA256: `ffbec4a7a1ba043acf9904aed68ff9db0f2c7e7aa90125640c443b7d2ceca151`

---

## DL-162 — The Left Rail Takes The Polish Design (2026-10-09)

This addendum compiles the owner decision DL-162: on 2026-10-09 Jared chose concept D, "Polish", of the left-rail review copy `Concepts/LeftRailPMConcept7.html` for the left rail. Polish keeps the Cozy Shelves structure and its coloured shelf boxes (F3-472, F3-474, F3-497) and polishes them: tighter geometry where horizontal space is short, one readable type ladder, statuses as glyph and word instead of pills, text that fits by layout instead of by abbreviation, the chat's picker for every dropdown, and motion in each theme family's own voice. The units below own the rail's presentation only; behaviour, state vocabularies and commands stay with the panel owners (`Plans/FileManager.md`, `Plans/Source_Control_System.md`, `Plans/Jujutsu_Integration.md`, `Plans/WorktreeGitImprovement.md`, `Plans/GitHub_Integration.md`, `Plans/Containers_Registry_and_Unraid.md`, `Plans/Automated_Testing_System.md`, `Plans/Runtime_Artifacts_Panel.md`, and the Run & Debug and Agents units F3-482 to F3-496, F3-452 and F3-477), and `Plans/DRY_Rules.md#DR-057` keeps this grammar in one place. F3-480 (3) is amended in place for the rail. The concept is source lineage only (`Concepts/leftrail-redesign/src/concepts/d/` at commit c93e341606): its class names, its measured pixel values outside these units and its demo data are not canon. Settled later on 2026-10-09 under the same decision: the Jujutsu view of Source Control has its own five tabs (DL-163, F3-623 and F3-624); the remaining six panels and the bottom Debug tab take this grammar through amendments in their owner units, with no new command, action or wiring row; and the activity bar's More tray is F3-625. Published on 2026-10-09: `Concepts/PMConcept7.html` carries the Polish rail, built into it through the opus-5.5 build from the same concept sources the review copy uses, and the review copy `Concepts/LeftRailPMConcept7.html` keeps concepts A, B and C and "Original", the rail before Polish (still reached as `current`), for comparison. The NieR Mode kit reaches the rail through two hooks it now names, a cursor hook for rail rows and picker items and a brackets hook for chosen tabs whose box changes when chosen (F3-621); both are concept plumbing, not canon.

### F3-618 — The Left Rail's Geometry, Shelves And Type

```yaml
plan_unit_id: F3-618
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The nine left-rail panels (Files, Search, Source Control, Actions & Pipelines, Docker Manager, Testing, Debug &
  Run, Agents, Runtime Artifacts) take the Polish design (DL-162), which keeps the Cozy Shelves structure and its
  coloured shelf boxes and polishes them. Geometry: a 3 px horizontal gutter from the panel edge to a box and 6 px
  between boxes; a 2 px inset from a box's edge to the rows inside it; 5 px of text inset inside a row or a head;
  4 px between a chevron, a status glyph and the text; row names start 24 px from the rail edge. One outer radius R
  serves every box that groups (shelves, tab strips, cards, the Git and Jujutsu switch) and an inner radius r = R -
  inset serves everything inside one (rows, the tab ink, buttons, inputs), so every hover, open and selection fill
  is drawn on its own row's box, concentric with its shelf; a control under 26 px high never rounds past 6 px.
  Basic has R 8 px and r 4 px, Friendly R 12 px and r 10 px with a 6 px text inset, Glass R 13 px and r 10 px, and
  Retro and NieR Mode are square. The shelf is the only box: its head is a band flush with the shelf's top that
  takes the shelf's own corners, a collapsed shelf is only its head with no strip under it, and the rows inside are
  flat, never a card inside a card. Heads are at least 34 px high and rows at least 28 px. Shelf tints are roles over
  the category colour of F3-474: fill 7%, head band 13%, edge hairline 22%, row hover 11% and open row 8%; Glass uses
  9%, 15% and 26% for fill, head and hairline, Retro 6%, 12% and 34%, and Basic Light and Friendly Light 6%, 11% and
  26%. Type is one ladder in sentence case: panel titles 13 px, labels and tab labels 12 px semibold, row names
  12.5 px medium, facts, meta lines and monospace text 11.5 px, small text 11 px, line height 1.38; Retro, whose IBM
  Plex Mono runs wide, takes half a pixel less (12.5, 11.5, 12, 11 and 11 px). Nothing in the rail is under 11 px
  before general.visual.font-size scales it. Text uses the look's bundled faces (F3-430). A button is one quiet
  filled rectangle 28 px high with the inner radius and a 12 px sentence-case label, the primary action has the
  accent fill, and icon buttons are 24 px squares. Selection and focus inside the rail are a fill or an outline on
  the element's own box, never section 3.5's 3 px left-edge stripe.
gui_related: true
gui_classification_reason: Defines the left rail's visible geometry, shelf treatment, type ladder and controls.
split_recommended: false
depends_on: [DL-162, F3-472, F3-474, F3-471, F3-430]
unblocks: [F3-619, F3-620, F3-621, F3-622]
acceptance_criteria:
  - "In every theme variant and NieR Mode, at 240 px and 280 px, row names start 24 px from the rail edge and every hover, open and selection fill sits 2 px inside its shelf with the inner radius."
  - "A collapsed shelf renders only its head band, with no strip under it."
  - "No text in the nine rail panels computes under 11 px at the default text size."
  - "No rail row, card or shelf draws a coloured left-edge stripe."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - node Concepts/leftrail-redesign/tools/rail_boot.mjs (concept acceptance on GPU Chrome)
risk_class: rail_presentation_drift
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-162"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06"
  - "Concepts/leftrail-redesign/src/concepts/d/css/10-tokens.src.css, 30-shelves.src.css, 40-rows.src.css, 60-controls.src.css (concept lineage only, commit c93e341606)"
preserved_exact_tokens:
  - "inner radius"
  - "24 px from the rail edge"
  - "under 11 px"
negative_constraints:
  - "Do not draw a card inside a shelf or a strip under a collapsed shelf."
  - "Do not set rail text under 11 px or use a coloured side bar to mark state or selection."
compatibility_only_notes:
  - "The concept realises the tints with runtime colour mixing; the product precomputes them per theme (F3-426, F3-431)."
stale_retired_dispositions:
  - "The Cozy Shelves concept's 8-9.5 px label and meta band (the 2026-07-26 concept ruling, never written into these Plans) is retired for the rail by the type ladder here."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/FinalGUISpec.md#F3-472, ContractName:Plans/FinalGUISpec.md#F3-474, ContractName:Plans/FinalGUISpec.md#F3-430, ContractName:Plans/DRY_Rules.md#DR-057

### F3-619 — Rail Statuses Are A Glyph And A Word, Counts Are Plain Numbers

```yaml
plan_unit_id: F3-619
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  In the left rail nothing is drawn as a pill or capsule and no box carries a coloured side bar (DL-162). A status
  is a 12 px glyph whose shape is the state, followed by the state's full name in sentence case as a word in the
  glyph's colour. The glyphs share one 16-unit grid. Done or ready is a solid disc with a check knocked out; failed a
  solid disc with a cross knocked out; warning, attention, degraded, partial and not configured a solid triangle with
  an exclamation mark knocked out; blocked a solid disc with a bar knocked out; info a solid disc with an i knocked
  out; conflict a solid diamond with a cross knocked out; live or running a dot with a soft halo, whose halo pulses
  only while something is restarting, building or being watched; the current branch or bookmark a ring around a dot;
  stopped or idle an empty ring; pending, queued or waiting a dashed ring that turns slowly, one turn in 7 s, or in
  eight steps over 4 s under Retro; stale a ring with clock hands; unknown a dashed ring with a question mark; changed a
  half-filled circle; orphaned an open arc with a dot; a stash a tray; paused (a debug session) a solid disc with two
  bars knocked out; immutable (a Jujutsu change) a solid disc with a padlock knocked out. Errored, a harness
  failure, takes the failed shape in its own colour so it stays distinct from failed; needs input and flaky take the
  warning triangle; and skipped, cancelled, superseded and terminated take the stopped ring. A row's state is the
  same in its head and in its opened details. Knock-outs show whatever is behind the glyph,
  a shelf tint or a selected row. Colours are token roles: done and live --graph-passed, running --graph-running,
  warning, stale and changed --accent-warning, failed and blocked --graph-failed, pending and info --accent-blue,
  idle, unknown and immutable the muted text colour, paused --accent-warning, conflict --accent-magenta, orphaned
  and errored --accent-orange, and current --accent-primary, the selection colour; under NieR Mode every state
  glyph and word draws in the NieR ink, running, stale, warning, orphaned and errored included (amended 2026-10-09
  after the shared cleanup, DL-162; until then only done, live, idle and paused did), and only the failure colour
  (failed and blocked) and conflict keep NieR's red, the shape telling the inked states apart. In the light looks and NieR Mode dark the word takes a deeper tone of its
  colour, mixed toward the text colour, so it reads at about 4:1, while the glyph keeps more of the colour. Shape
  and word always carry the state, so it
  never rests on colour alone. Counts are plain numbers in tabular figures, right-aligned in one column across a
  panel's shelf heads, never in a capsule, and a count that changes rolls to its new value. The File Manager's git
  letters (F-074) stay letters, without a capsule, in one fixed column. Wherever a rail panel's owner unit says chip,
  pill or badge for a status or a count, it renders as this unit's glyph and word or plain number, and a chip that is
  an action (a clear-filter chip) is one of F3-618's quiet buttons; the owner keeps the state vocabulary, the action
  and their meaning.
gui_related: true
gui_classification_reason: Defines how every status and count in the left rail is drawn.
split_recommended: false
depends_on: [DL-162, F3-618, F-074]
unblocks: []
acceptance_criteria:
  - "The pill detector (an element whose corner radius is at least half its height and which has a fill or a border) and the coloured side-border detector find nothing in the nine rail panels in any theme variant or NieR Mode."
  - "Every status in the rail shows a glyph and a word; every glyph listed here has a silhouette distinct from every other in grayscale."
  - "Counts render as plain tabular numbers; no count or status sits in a capsule."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - node Concepts/leftrail-redesign/tools/rail_boot.mjs (concept acceptance on GPU Chrome)
risk_class: rail_presentation_drift
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-162"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06"
  - "Concepts/leftrail-redesign/src/concepts/d/00-d.js and css/50-status.src.css (concept lineage only, commit c93e341606)"
  - "Concepts/leftrail-redesign/src/concepts/d/css/10-tokens.src.css, NieR state colours in ink (shared cleanup lane commit a136797dad; concept lineage only)"
preserved_exact_tokens:
  - "glyph and word"
  - "tabular figures"
  - "knocked out"
negative_constraints:
  - "Do not draw a status or a count in a capsule, and do not mark state with a coloured side bar."
  - "Do not show a status by colour alone."
compatibility_only_notes: []
stale_retired_dispositions:
  - "Pill, chip and badge presentation of statuses and counts in the Cozy Shelves rail panels (F3-497 lineage, F3-477's lifecycle chips, RAP-049's staleness chip, F-074's count chip, ATS-028's attempt badges) is retired for the rail by this unit; the owners' state vocabularies stand."
owner_boundary_notes:
  - "F3-585 owns the assistant chat's 13 status marks and this unit owns the rail's glyphs; neither restates the other. The two sets differ (the chat's failed is a triangle, the rail's warning is), and whether one set should serve both is an open owner question recorded in DL-162."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/FinalGUISpec.md#F3-618, ContractName:Plans/FileManager.md#F-074, ContractName:Plans/DRY_Rules.md#DR-057

### F3-620 — Rail Text Fits By Layout, Never By Abbreviation

```yaml
plan_unit_id: F3-620
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  In the left rail text fits by layout and is never abbreviated (DL-162). Labels are sentence case and use whole
  words. A shelf head whose summary does not fit beside its label moves the summary onto a line under the label,
  aligned with the label's text, instead of shortening either; a row whose fact line does not fit moves it onto the
  next line, and a registry row's account takes a third line. Source Control change rows show the file name on line
  1 and its folder and diff counts on line 2. A long name that is a path or an identifier keeps its head and its end
  and loses its middle (ci-build-…-publish.yml, tastebook-…-worker-batch), measured in the element's own font, with
  the full name in the row's hover tag (F3-523); the kept end starts at a separator (/, - or _), keeps the whole
  file name whenever it fits, never ends in a bare extension, and two different names in one list never get the
  same label. A change row's folder is cut in its middle while the change kind is never cut and moves under the
  folder when it does not fit beside it. A repository location breaks between its parts, never inside one. A fact
  line breaks only between its parts, the separator dot ending its line; a count never leaves its word, a date and
  a short id or ref never split, and code and paths break only at their joints (/, ::, _, before @ or a file
  extension). No facts line is clamped; a long code value in an opened row sits under its label at full width.
  Segmented tab strips fit by measurement: every tab shows its icon and full label when all fit; otherwise the active
  tab keeps its full label and the others show their icon only; otherwise every tab shows its icon only. Every tab
  keeps its full label as its accessible name and hover tag, and no tab label is ever shortened. Fitting is measured
  at the current rail width and redone on a resize, a theme change and a tab change, and a panel shown again at an
  unchanged width is not refitted. This amends F3-480 (3) for the rail, whose fit ladder loses its abbreviated form,
  and replaces F3-445's scroll-and-ellipsis recipe for the rail's segmented strips; the width tiers still gate chrome
  only (F3-498). Amended 2026-10-09 after the shared cleanup (DL-162): no abbreviation applies to ages either; ages
  and durations are spelled out in words ("4 minutes", "2 hours ago", "1 minute 48 seconds"), never cut to unit
  letters, while a decimal measurement keeps its unit symbol ("3.4s").
gui_related: true
gui_classification_reason: Defines how labels, names and tabs fit the narrow left rail.
split_recommended: false
depends_on: [DL-162, F3-480, F3-445, F3-498, F3-523]
unblocks: []
acceptance_criteria:
  - "At 240, 280, 320 and 480 px no rail panel overflows horizontally and no label is replaced by an abbreviation."
  - "A head summary that does not fit beside its label renders on the next line; a long path or identifier keeps its end and its full text is in the hover tag."
  - "Tab strips show all labels, then only the active label, then icons only, as width falls, and every tab's accessible name is its full label."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - node Concepts/leftrail-redesign/tools/rail_boot.mjs (concept acceptance on GPU Chrome)
risk_class: rail_presentation_drift
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/GitHub_Integration.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-162"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06"
  - "Concepts/leftrail-redesign/src/concepts/d/20-fit.js (concept lineage only, commit c93e341606)"
  - "Concepts/leftrail-redesign/src/concepts/d/00-d.js AGE_RX and 10-skin.js applyWords, ages spelled out (shared cleanup lane commit a136797dad; concept lineage only)"
preserved_exact_tokens:
  - "never abbreviated"
  - "keeps its head and its end"
negative_constraints:
  - "Do not abbreviate a rail label or tab label at any width."
  - "Do not cut the end off a path or identifier when its middle can go."
compatibility_only_notes: []
stale_retired_dispositions:
  - "The abbreviated mid-width tab labels of CRAU-098, UCC-136 and GI-039 (user decision 2026-07-27) are retired by DL-162; those units are amended in place."
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/FinalGUISpec.md#F3-480, ContractName:Plans/Containers_Registry_and_Unraid.md#CRAU-098, ContractName:Plans/GitHub_Integration.md#GI-039, ContractName:Plans/UI_Command_Catalog.md#UCC-136

### F3-621 — Rail Dropdowns Use The Chat Picker, And Rail Motion Follows The Theme Family

```yaml
plan_unit_id: F3-621
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Every dropdown opened from the left rail, the File Manager's context and root menus, the branch, sort, context and
  reference pickers and any former native select included, opens in the assistant chat's picker style (DL-162): the
  composer pickers' plate, items of 12 px semibold text with a 14 px check on the chosen item and muted trailing
  meta, group labels and dividers, a search field for long lists, and the chat's corner-origin sprout (ACD-439),
  with the chat pickers' Retro, Glass and NieR Mode treatments, items in the look's body face, and a plate as wide
  as its longest item from the trigger's width up to 360 px, wrapping beyond that. On top it is portaled and unclipped (F3-480 (1)),
  flips above its trigger when it would leave the window, opens side submenus, and has roving keyboard focus,
  type-ahead and Escape with focus returned to the trigger; picking an item runs the same action as before. Rail
  motion has the same beats in every theme family and each family's own voice: the panel's chrome settles first and
  its shelves and rows deal in once behind it, capped and never replayed on scroll (F3-473 (6)); a tab change deals
  the new pane in from the side of the tab it came from; an expander grows to its measured height, its rows fade
  down a beat behind, and it scrolls into view when it opens near the bottom; a status word the panel rewrites pops
  its glyph; a changed count rolls; and the activity bar's open-panel tile, the size of an icon's hover tile, glides to
  the next icon. Basic is crisp, a short rise with an ease-out, about 240 ms. Friendly is springy, a taller rise with
  overshoot, about 420 ms. Glass glides, a long soft rise of about 480 ms in which only the shelf boxes come out of a
  light blur, never a row and never a backdrop blur, so F3-431's blur budget is unchanged. Retro is stepped, the same
  moves in three or four hard steps, about 200 ms. NieR Mode is ink: rows are wiped in from left to right and the bar
  tile moves as an ink cut. A tab change in any rail strip, the two Source Control strips included, is one
  relayout: the chosen tab's label appears in one step with no width morph, one ink sits exactly on the chosen
  tab's box, and every animation of the change, the ink, the tabs and the new pane, starts together on one clock.
  Basic glides the ink, Friendly springs it with the overshoot held inside the strip, and Glass glides it with a
  liquid stretch. Retro runs on a 33 ms tick: the ink hops tab by tab, the chosen tab keeps the colour it had
  before the click until the ink lands on it, shows one tick of inverse video and then its active colours, so only
  the tab under the ink ever looks chosen, and the new view prints line by line with its boxes growing with their
  lines, as Retro panel entrances and expanders also do. Under NieR Mode hovering a tab inks it with the same box
  as the chosen ink; a click cuts the ink straight to the tab, and once the click has landed the Target brackets
  part locks onto the chosen tab's final box, so the brackets match the selector, while the Menu cursor's square,
  which a chosen tab no longer takes, moves to the new box's centre and fades out. Every rail animation follows
  general.visual.animation-speed, lands at its end state at
  once under reduced motion (general.visual.reduce-animations or the operating system), and none persists on the
  active view (F3-480 (4)). Amended 2026-10-09 after the shared cleanup (DL-162): Arrow Left and Right, Home and
  End move along every rail tab strip and choose the tab they reach, focus following it, in Files, Search, Source
  Control's Git and Jujutsu strips (F3-623), Actions & Pipelines, Docker Manager, Runtime Artifacts, Testing and
  Debug & Run; under NieR Mode the Target brackets lock onto the tab chosen by a key move exactly as after a click.
  NieR Mode's entrance wipe never blocks input: a click on a tab strip during a panel's entrance always chooses the
  tab. When the home layer folds the rail in a narrow window and opens the side panel as an overlay over the
  centre, the rail draws that overlay in each family's voice, an opaque plate with a hairline edge all round and the
  family's shadow and entrance, Glass keeping the shell's frosted box and nothing moving under reduced motion, and
  its fitting follows the overlay's width; when the side panel eases or folds, and Pin, belong to the home layer,
  and the fold is view-local, never saved, with no command or wiring row.
gui_related: true
gui_classification_reason: Defines the left rail's dropdown look and its motion in each theme family.
split_recommended: false
depends_on: [DL-162, ACD-439, F3-473, F3-480, F3-431]
unblocks: []
acceptance_criteria:
  - "Every popup opened from the nine rail panels is the chat picker plate with its sprout, portaled and unclipped, keyboard operable and closed by Escape."
  - "Under reduced motion every rail animation is instant, and Animation speed scales every scripted rail animation."
  - "Under Glass no rail row animates a blur and no rail element adds a backdrop blur."
  - "In Retro, at every frame of a tab change, at most one tab shows the chosen colours; under NieR Mode the target brackets settle on the chosen tab's final box."
  - "On every rail tab strip Arrow Left and Right, Home and End choose the tab they reach and focus follows; under NieR Mode the brackets settle on a tab chosen by key, and a click during a NieR entrance chooses its tab."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - node Concepts/leftrail-redesign/tools/rail_boot.mjs (concept acceptance on GPU Chrome)
risk_class: rail_presentation_drift
reasoning_tier: high
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-162"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/leftrail-polish-20261009/JARED-REQUEST-20261009.md, SHA-256 4923cfc785f4dc020d5bd3ae86e4bf62946a2155572013ee353182dd9bf46b06"
  - "Concepts/leftrail-redesign/src/js/20-menu.js and src/concepts/d/10-skin.js, 30-motion.js, 40-bar.js (concept lineage only, commit c93e341606)"
  - "Concepts/leftrail-redesign/src/concepts/d/31-tabs.js and css/22-tabs.src.css, tab switches redone per family for the owner's issue 3 of 2026-10-09 (lane commits 9e8e75acab and 95e0259ab1; concept lineage only)"
  - "Concepts/leftrail-redesign/src/concepts/d/ shared cleanup: keys on every strip and the NieR wipe as a mask (lane commits a136797dad and b56efb00cc), and css/24-fold.src.css with 20-fit.js for the narrow-window overlay (commit 2f3a4ac7df); concept lineage only"
preserved_exact_tokens:
  - "chat's picker style"
  - "general.visual.animation-speed"
  - "general.visual.reduce-animations"
negative_constraints:
  - "Do not open a rail dropdown in any other menu style or as a native select."
  - "Do not blur a rail row or add a backdrop blur for rail motion."
compatibility_only_notes:
  - "The concept times its motion with the theme tokens it has (about 240, 420, 480 and 200 ms); the product's motion tokens own exact durations and the beats and voices here bind."
  - "The concept reaches NieR Mode's Menu cursor and Target brackets parts through two hooks in the NieR kit (opus-5.5 settings kit, 19-nier-parts.js): .pmr-cur in its cursor selector list, and a .pmr-lock branch in its bracket placement that places the brackets after the click lands; the hooks are concept plumbing, the behaviour above is canon."
  - "In the concept the home layer writes data-pm-rail-fold, eased or overlay, on #sidePanelSlot and dispatches pm:rail-fold with the mode and width, and the rail styles and refits from them; the attribute and event are concept plumbing agreed with the home redesign thread on 2026-10-09."
stale_retired_dispositions: []
owner_boundary_notes:
  - "ACD-439 owns the sprout motion and the chat pickers' look; this unit applies them to the rail and adds only placement and keyboard."
  - "The home redesign owns the narrow-window behaviour (the side panel eased to 240 px, then below a 760 px centre the rail folded to its icon bar with the side panel as an overlay, Pin restoring docking, never saved); its canon is not on main at this amendment (DL-180 on plans/home-panels-terminal-canon-20261009). This unit owns only how the rail draws and fits in that overlay."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/assistant-chat-design.md#ACD-439, ContractName:Plans/FinalGUISpec.md#F3-473, ContractName:Plans/FinalGUISpec.md#F3-480, ContractName:Plans/FinalGUISpec.md#F3-431

### F3-622 — The Worktree Owner Dropdown And The Folding Publish Card

```yaml
plan_unit_id: F3-622
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Polish design adds two Source Control behaviours (DL-162). First, the Worktrees owner filter is one dropdown
  labelled Owner, in the chat picker style of F3-621, that lists All and the owner classes (Threads, Orchestrator,
  Agents, Manual) with each chosen class checked, in place of a row of filter chips; picking applies the same
  owner-class filter with W-075's selection rules and persistence, and any other W-075 filter dimension the panel
  shows uses the same dropdown; the Jujutsu Workspaces view uses the same Owner dropdown (F3-624).
  Second, the publish and review card stays at the foot of the Git view and of the Jujutsu view (F3-623) and its
  facts (destinations, expected head, review state) fold away and back from a fold button or from the card's head,
  the height moving in the family's voice; a button inside the card never folds it, and folded or open is one
  state for both engines, kept with the Source Control panel state (source_control_panel_state.v1, F3-475). Neither adds a command or an action: the filter is W-075's filter state
  and the fold is panel state.
gui_related: true
gui_classification_reason: Defines two visible Source Control behaviours the Polish design adds.
split_recommended: false
depends_on: [DL-162, F3-621, W-075, F3-475, F3-529]
unblocks: []
acceptance_criteria:
  - "The Worktrees owner filter opens as the chat picker, lists All and the four owner classes, and filters as the chips did."
  - "The publish and review card folds and unfolds from its fold button and its head, never from a button inside it, and comes back in the state it was left in."
  - "No command, action or wiring row is added for either behaviour."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: rail_presentation_drift
reasoning_tier: standard
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-162"
  - "Concepts/leftrail-redesign/src/concepts/d/10-skin.js applyWorktreeFilter and 20-fit.js wirePublish (concept lineage only, commit c93e341606)"
preserved_exact_tokens:
  - "Owner"
  - "source_control_panel_state.v1"
negative_constraints:
  - "Do not mint a command, a ui.* action or a wiring row for the owner dropdown or the publish fold."
compatibility_only_notes:
  - "The concept keeps the fold per viewer in local storage; the product keeps it in the per-project panel state."
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/WorktreeGitImprovement.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/WorktreeGitImprovement.md#W-075, ContractName:Plans/FinalGUISpec.md#F3-475, ContractName:Plans/FinalGUISpec.md#F3-529

### F3-625 — The Activity Bar's More Tray In The Polish Design

```yaml
plan_unit_id: F3-625
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The activity bar's More tray (F3-419) opens as the chat picker of F3-621 beside the More button, under the heading
  "Hidden from the bar" (DL-162). Each hidden item is a row with the bar's own icon and the item's real name, never
  its internal id (Actions & Pipelines, not repository_automation). Picking a row restores the item at the end of
  the bar; pressing a row and dragging it onto the bar restores it at the drop position; dragging a bar icon onto
  More hides it; a second click on More closes the tray. With nothing hidden, More still opens and says how to hide
  an icon instead of doing nothing. The tray's keyboard is the picker's (arrows, Enter, Escape with focus back on
  More), and More itself is reachable by keyboard. The More button shows its hover, open and drop-target states in
  the look's own treatment, and the drag ghost and drop line use the rail's radii and ink. The rail's resize handle
  keeps the shell's glow in Basic, Friendly and Glass, is a hard square light in Retro and an ink mark under NieR
  Mode. The gestures, the activity_bar_order:v1 persistence with its separator position and the hotkey order are
  F3-419's and are unchanged; no command, action or storage key is added.
gui_related: true
gui_classification_reason: Defines the visible More tray and the rail resize handle in the Polish design.
split_recommended: false
depends_on: [DL-162, F3-419, F3-621]
unblocks: []
acceptance_criteria:
  - "More opens the chat picker listing every hidden item with its icon and real name; click restores at the end of the bar, drag restores at the drop position, and dragging a bar icon onto More hides it."
  - "With nothing hidden, More opens a picker that explains how to hide an icon."
  - "The tray is operable by keyboard and Escape returns focus to More."
  - "No command, action, wiring row or storage key is added."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: rail_presentation_drift
reasoning_tier: standard
context_scope: left_rail_polish
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-162"
  - "Concepts/leftrail-redesign/src/concepts/d/41-more.js, 40-bar.js and css/80-bar.src.css, css/81-more.src.css (lane commit 8d4ce13e3e; concept lineage only)"
preserved_exact_tokens:
  - "Hidden from the bar"
  - "activity_bar_order:v1"
negative_constraints:
  - "Do not show an item's internal id in the More tray."
  - "Do not add a storage key or a command for the More tray."
compatibility_only_notes:
  - "The concept builds the picker from the shell's own hidden tray and hands picks and drags to it; its More button is not yet keyboard-focusable and it stores the order under its own local key."
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-162, ContractName:Plans/FinalGUISpec.md#F3-419, ContractName:Plans/FinalGUISpec.md#F3-621
