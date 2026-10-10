# Shard 094: DL-173 to DL-179 — The Redesigned Usage Page In PMConcept7 (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L42787-L42969

Source SHA256: `8fac6b4ee9ae7ff85e815939520bcf4acab5620ca9ca45ca9cc6346101f29dac`

---

## DL-173 to DL-179 — The Redesigned Usage Page In PMConcept7 (2026-10-09)

This addendum compiles the owner decisions DL-173 to DL-179: Jared approved the redesigned Usage page, asked for it to replace the old one in PMConcept7, and added notes of 2026-10-09. Behaviour stays with its owners: `Plans/usage-feature.md#UF-107` and the Usage units it amends (what the page shows and does), `Plans/Multi-Account.md#MA-073` (per-provider auto-switch), `Plans/Widget_System.md#WS-017` to `#WS-020` (sizes, presets and the board transaction), `#F3-514` and `#F3-515` above (rooms, sizes and the settled-interaction boundary), `#F3-465` with `#F3-446` (hover), and `Plans/assistant-chat-design.md#ACD-475` (motion voices). The unit below owns the page's presentation only, and `Plans/DRY_Rules.md#DR-058` makes it the single owner of the Usage presentation grammar. The concept under `Concepts/usage-redesign/` is source lineage only: its class names, keys, switches, harness hooks and measured timings outside this unit are not canon.

### F3-628 — The Redesigned Usage Page's Presentation

```yaml
plan_unit_id: F3-628
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The redesigned Usage page (DL-173) is calm, polished and dense: it shows far more data per screen than the page it
  replaces and never trades a fact for space. It reads like the Daylight Atlas reference: a clear type hierarchy,
  small-caps micro-labels, row tables whose window columns line up, plate titles with one subtitle line, semantic
  colour pairs, and series colours by token type. There are no pills, no coloured side bars, no tinted side boxes
  and no emoji; icons are inline SVG, and the hero key light below is the one approved tint. Sizes are readable at a
  desktop distance (DL-175): values and body text 13 to 14 px, chart ticks, legends and small captions never below
  11 px, and rows and buttons 28 to 32 px tall for a mouse. Type is the theme family's own font from the app's one
  embedded font set (DR-058), and every fit is measured again once a face finishes loading, so a late face never
  leaves a label truncated or overflowing: no measurement taken in a fallback face is kept, the refit runs in slices
  with the cards in view first so that it never makes a long task, and text uses only glyphs the embedded faces
  carry. Each room has one explicit hero plate (DL-178). A soft top-left radial key light
  falls on the hero plate at 16% strength in dark themes and 9% in light themes; on arrival and on a room change
  only the hero number rolls, like an odometer, while supporting values appear final with a short fade, and rolls
  stay for live changes and for range and scope changes. Below the warn line, meters and skyline towers shade by
  value along a calm spectrum from indigo through cyan to mint; at and above the warn line the tones of the Settings
  thresholds take over, and every meter of a provider carries a notch at that provider's switch point (MA-073).
  Charts are one family (area, line, columns, budget and stacked) with gradient fills, soft depth on lines and
  marks, rounded caps, readable axes and legends, a hover crosshair with a readout card, draw-on with a leading
  glow, and morphs that read as one continuous shape, live changes included. Each series' end marker sits on that
  series' own last point, and chart values keep the value states of F3-418, so unknown never paints as zero. Every
  mark that sits on a line (hover dots, end and now dots with their glows, cost dots) moves on that line's own path
  tween, with its timing and progress, and is never animated beside it on its own; during a range morph a mark with
  no earlier position (a new series, a callout) appears when the morph finishes, and leaving cost dots shrink on the
  tween's frames over a fading copy of their old line, which cross-fades into the new one. A crosshair or readout
  mark that changes size keeps its anchor point. A plot of one token type, such as the savings trend, colours its
  line, end dot and hover dot with that token type, shows no all-tokens row in its readout and takes no part in the
  token trend's room-change flight. When a
  size cannot show every fact, the rest fold behind an "N more" control that opens on hover and in Details. Every
  provider row, legend, group header, chart series key and account card shows the provider's official mark, never
  recoloured, filtered, tinted or redrawn and never set on a disc or plate other than a published app-icon plate,
  in its light or dark variant where the provider publishes one, contained in a square box at its own optical
  scale; Free Models and Local model server use neutral interface icons, and a monogram is used only where no mark
  exists. Every dropdown on the page (scope, disclosure, range overflow, the card menu, the size menu, chart type and
  options, thresholds, provider and account filters, Export and the Live menu) is a menu of the chat assistant's menu
  family (F3-531's menus, portaled as F3-424 sets out, opening with the corner-origin sprout of F3-461), with arrows,
  Enter, Escape and type-to-search. The Accounts room groups providers as the Settings catalog does, one plate per
  provider with its mark and name and, for a provider with two or more accounts, its Auto-switch toggle and switch
  level in the plate head; each account is one row with its window columns aligned, and a provider not set up is one
  compact line. Plans & limits shows one row per account. The Live / Paused control sits beside the page name in
  the rail head as the word Live or Paused, with a small live dot and a chevron that opens its menu. A room change plays a camera move, a shared-element flight for the
  elements the two rooms share, the hero's reveal and the room's own signature beat; every room's entrance from
  every neighbour is visible and rich, and it may vary by direction or by what the rooms share but is never a plain
  cut. Its beats run in one order in every voice: camera, frames, the hero with its number first, the supporting
  plates, then the signature beat, the hero landing within about 200 ms of the click and the beat at about 1.1 s.
  The camera move is one visible move scaled to the distance along the rail; the old room fades only once the new
  room's frames are on the board, so no blank moment shows, and the first change after Usage opens meets the same
  floor as later ones. The signature beat is held until its time and plays on every entry, from any room. A shared
  element flies only from one fill to the matching fill, and one with no match dissolves into its home plate.
  Moving a widget lifts the card to follow the pointer one to one while a landing placeholder sits in the exact
  target slot and the peers in its way slide to make room; resizing shows a live outline of the snapped target size
  with its size name and its width by height while the peers in its way reflow; release morphs the card into place,
  after which board gravity floats the other cards up into the holes above them, and Escape glides it back.
  Width resizes from the right edge, the left edge and the corners at every board width. Tidy and board gravity
  (WS-019) each move the cards into place as one movement. The size menu previews each preset with its name before it
  is chosen. A card's head actions never cover its title or the head tools and always fit inside the card head at
  every width, taking the widest form that fits: all four tools, then the grip and the menu, then the menu alone,
  which then holds size, configure, details, move, resize, Tidy and hide. Showing or hiding them never reflows the
  head, whether the pointer enters or leaves: a title that gives room keeps its resting lines and ends in an
  ellipsis, a title whose word would break shows one line that ends in an ellipsis, centred level with the provider
  mark, the title takes its full lines back only once its room has returned, and the full title stays reachable in
  its hover tag, the card menu's title and Details.
  Hover on the page is the shell's one hover system (F3-465 driven through F3-446's single pointer handler), with no
  Usage-only hover engine; a hovered plate lifts by whole pixels only, with no scale and no lasting compositing
  layer, so its text stays sharp, and Retro and NieR plates do not lift. No blur outlives its moment: hover leaves
  no blurred or scaled raster behind, an entrance's blur ends with the entrance, a plate keeps an entrance's
  compositing layer only for its own entrance, and nothing on the page stays blurred at rest. Motion takes the theme
  family's voice from ACD-475, which owns each voice's character, Friendly's and Glass's distinctness from Basic
  included; Usage adds no voice and no per-view override (DR-043), and a rolling or counting value never
  overshoots its final value. Under NieR Mode the page is the app's NieR, with no second vocabulary and no colour of
  its own: it takes NieR's parts, tokens, timing and grammar (SSYS-043, F3-589, F3-598) and mirrors the page parts of
  DL-152, and it never plays the onboarding window's NieR effects (its page wipe, boot log and banner) or the reboot
  plate, which stays DR-056's one plate. A room change decodes the room title only, under the Text decode part; no
  other text on the page decodes. The menu cursor marks the rail's room buttons, menu rows and the range strip as an
  ink bar with paper text, the bar and the text changing in the same frame with no colour fade; a count or an
  official mark inside the bar sits on a square paper cell, never recoloured and never a pill; and the chosen range
  takes the target brackets. The rail kicker ([ROOM nn/13]) is a label and keeps the 11 px floor. The inspector
  opens from a line across its middle and closes back to it in three steps, refresh is a hollow diamond making one
  half turn per refresh and never a loop, the chart readout is the intel card with its ink band unfolding from the
  left, and the stage note speaks as Report:. Charts, heroes and motion are stepped, in ink and paper, with no glow,
  filter or blur, and under Reduce Motion, from the app's setting or the operating system's, NieR on Usage is
  instant. While Usage shows, the app's NieR idle loops (the scene parts and the Pod's bob) pause in place and the
  drifting motes hide, so nothing on Usage moves, or sits frozen mid-motion, at idle except a Live change; every
  other page keeps them as before. Continuous motion runs only on transform and opacity and targets 60 frames a
  second on a computer without a GPU; nothing loops at idle, the only motion at rest being one live change per
  applied batch while Live is on (UF-107); a room click never runs a main-thread task longer than about 50 ms,
  because the new room is built in slices and then released; and on a computer without a GPU, Glass shows its solid
  pane instead of the live backdrop blur while Usage is open. Reduce Motion is instant (DL-115): every beat lands
  at its end state, and every close path, Escape included, works under it. The Slint portability limits recorded
  for earlier Usage units do not bind this page's look (DL-173, after DL-139), and framework version pins are
  unchanged.
gui_related: true
gui_classification_reason: Defines the look, menus, marks, heroes, charts, previews, hover and motion of the redesigned Usage page.
split_recommended: false
depends_on: [DL-173, DL-174, DL-175, DL-176, DL-177, DL-178, DL-179, DL-115, DL-139, DL-152, UF-107, F3-418, F3-424, F3-446, F3-461, F3-465, F3-514, F3-515, F3-531, F3-589, F3-598, ACD-475, SSYS-043, MA-073, WS-019, DR-056]
unblocks: []
acceptance_criteria:
  - "No pill, coloured side bar, tinted side box or emoji appears on the page; values and body text are 13 to 14 px, no tick, legend or caption is below 11 px, and rows and buttons are 28 to 32 px tall."
  - "Fits are measured again after the fonts finish loading, and no label is truncated or overflows once they have."
  - "Each room has one hero plate with the top-left key light at 16% in dark themes and 9% in light themes; on arrival and on a room change only the hero number rolls."
  - "Below the warn line, meters and skyline towers shade from indigo through cyan to mint; at and above it the Settings threshold tones apply, and every meter of a provider shows that provider's switch-point notch."
  - "In every dual-series chart, in every look and size, each series' end marker sits on that series' own last point."
  - "Facts a size cannot show are reachable through N more on hover and in Details."
  - "Every provider mark is the official mark, unrecoloured and unfiltered, in a square box; only Free Models and Local model server use neutral icons."
  - "Every dropdown on the page is a chat-family menu with arrows, Enter, Escape and type-to-search."
  - "The Accounts room shows one plate per provider in Settings order with one row per account and aligned window columns; Plans & limits shows one row per account."
  - "Every room entered from every neighbour plays a visible entrance and never a plain cut, except under Reduce Motion, where it is instant."
  - "Moving and resizing show the lifted card, the landing placeholder or the live size outline with the size name and width by height, peers move live, release morphs into place and Escape glides back; width resizes from both edges and the corners at every board width."
  - "A card's head actions never overlap its title at any width, and showing or hiding them never reflows the head; a shortened title stays reachable in full in its hover tag, the card menu and Details."
  - "A hovered plate lifts by whole pixels with no scale, and Retro and NieR plates do not lift."
  - "A room change runs camera, frames, the hero with its number first, the supporting plates and the beat in that order, shows no blank moment between rooms, and the first change after Usage opens meets the same floor as later ones."
  - "Every mark on a line moves on that line's path tween; a mark with no earlier position appears when the morph finishes; a single-token plot uses its token colour and shows no all-tokens row."
  - "No label is truncated, and no measurement from a fallback face is kept, after an embedded face finishes loading late, and the refit makes no long task."
  - "After hover ends and after an entrance ends, nothing on the page stays blurred."
  - "Usage motion under Friendly and Glass is ACD-475's voice for that family, visibly distinct from Basic as ACD-475 requires, with no Usage-only voice, and no rolling or counting value overshoots its final value."
  - "Under NieR Mode the page draws no glow, filter or blur and the menu cursor marks the rail's room buttons, menu rows and range strip; a room change decodes only the room title; the onboarding window's NieR effects and the reboot plate never play on Usage; the rail kicker is at least 11 px; and the app's NieR idle loops are paused while Usage shows."
  - "Nothing animates at idle except one live change per applied batch while Live is on; no room click runs a main-thread task over about 50 ms; on a computer without a GPU, Glass shows its solid pane while Usage is open."
  - "Under Reduce Motion every beat lands at its end state and every close path, Escape included, works."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures
  - python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures
risk_class: usage_redesign_presentation_drift
reasoning_tier: high
context_scope: usage_redesign_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-173"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/DECISIONS-20261009.md, SHA-256 fd8d2d8a092e97f2964331dfe3befea99f2aa66691b5021313bae2cad0a25008"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/HANDOFF-usage-upgrade-20261009.md section 2, SHA-256 d009d908af6785fd19866b83821313d65165ed0169737ab72bcd70c04539fdd5"
  - "Concepts/usage-redesign/ (src/js, src/css, marks/sources.json; concept lineage only; branch concept/usage-pm7-20261009)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/b-motion-REPORT.md, SHA-256 a1f292802f9ae740765c721f8f6196b44ad98ec3a41271f208528c7c03fed87a (room-change floor)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/f-nier-REPORT.md, SHA-256 a25c0fc054711548cb82c14722dbe4664eae478a1e6d718bfbf9cabe884ef28b (NieR on Usage)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/g-fonts-REPORT.md, SHA-256 5886a8634de013933fe565badc478ee439afb232714fcf2bb0e97c3afddd080d (embedded fonts and fit)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/b-fix-REPORT.md, SHA-256 906a62d86051f7dea06d179a072d8cdf1a6af2c10532a6438852e06f98f572a3 (hover lift, blur and card-head actions)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/e-charts-REPORT.md, SHA-256 1c2f643776e5063f92bb62c1216ea5f7a152b1b33f1b8f1bf884471b46f14883 (marks riding the path tween)"
preserved_exact_tokens:
  - "N more"
  - "16%"
  - "9%"
  - "Live / Paused"
  - "50 ms"
  - "[ROOM nn/13]"
  - "Report:"
negative_constraints:
  - "Do not use pills, coloured side bars, tinted side boxes or emoji, and do not tint a box or plate other than the hero plate's key light."
  - "Do not recolour, filter, tint or redraw a provider mark, and do not draw a monogram where a mark exists."
  - "Do not build a Usage-only menu style, hover engine or motion voice."
  - "Do not leave a blur on after hover or an entrance ends, or loop any animation at idle."
  - "Do not let a rolling or counting value overshoot its final value."
  - "Do not play the onboarding window's NieR effects or the reboot plate on Usage, or decode any text there but the room title."
  - "Do not animate a mark that sits on a line apart from that line's path tween."
  - "Do not scale a hovered plate or keep a compositing layer on it after its entrance."
compatibility_only_notes: []
stale_retired_dispositions:
  - "The two-letter monogram system of the earlier Atlas design notes is retired wherever an official mark exists."
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-173, ContractName:Plans/Decision_Log.md#DL-175, ContractName:Plans/Decision_Log.md#DL-176, ContractName:Plans/Decision_Log.md#DL-178, ContractName:Plans/Decision_Log.md#DL-179, ContractName:Plans/usage-feature.md#UF-107, ContractName:Plans/FinalGUISpec.md#F3-465, ContractName:Plans/FinalGUISpec.md#F3-531, ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/Settings_System.md#SSYS-043, ContractName:Plans/Multi-Account.md#MA-073, ContractName:Plans/DRY_Rules.md#DR-058, ContractName:Plans/DRY_Rules.md#DR-043, ContractName:Plans/DRY_Rules.md#DR-056, ContractName:Plans/Decision_Log.md#DL-152
