# Shard 086: DL-152 — NieR Mode Where A Look Is Chosen, NieR Onboarding And Tour, And Their Sounds (2026-10-07)

Source: `Plans/FinalGUISpec.md`

Source lines: L41097-L41346

Source SHA256: `c7c82becfc1761e3bfcfcae84ee4785729ece53a4113a3528b7f09fda1bef191`

---

## DL-152 — NieR Mode Where A Look Is Chosen, NieR Onboarding And Tour, And Their Sounds (2026-10-07)

This addendum compiles the owner decision DL-152, Jared's request of 2026-10-07 for PMConcept7's onboarding, Guided Tour and sounds. Behaviour stays with its owners: `Plans/Settings_System.md` section 4.4 (NieR Mode, its parts, scenes and editor), `Plans/Planning_Wizard.md` PWIZ-021 to PWIZ-023 (onboarding and tour orchestration and their closed action lists), `Plans/FinalGUISpec.md#F3-405` (Notifications & Sounds, the sound library and preview), `#F3-564` and `Plans/assistant-chat-design.md#ACD-475` (the chat cue category and the cue limits). The units below own the presentation only. The concept is source lineage only: its class names, keys, event identifiers, synth recipes, harness hooks and every measured timing outside these units are not canon.

### F3-598 — NieR Mode In Product Onboarding And The Guided Tour

```yaml
plan_unit_id: F3-598
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  NieR Mode (Settings_System section 4.4) is reached wherever a look is chosen, and onboarding and the Guided Tour have
  a NieR presentation of their own (DL-152). The title-bar theme selector (F3-082), the onboarding look choice at
  welcome and the Look menu (`Change the look`) of the onboarding header and of the Tour bar each show, below their
  family and Light/Dark choices and never among them, one NieR Mode checkbox, a menuitemcheckbox in the menus, checked
  while NieR Mode is on, with an Adjust NieR look button beside it that opens the NieR Mode editor (parts, presets and
  background). Over the application the editor is a popup dialog above the Tour and the title bar, with a scrim, focus
  containment, a close button, Escape and focus returned to the button; inside the onboarding window it is a panel of
  that window, never a nested dialog. Toggling keeps a menu open, and family and mode choices stay menuitemradio
  options. On the look choice the NieR row is a checkbox outside the eight-theme choice's options and shows a small NieR
  preview that paints NieR's own tables inside its bounds even while NieR Mode is off (F3-426). Inside the onboarding
  window the checkbox and the editor change a preview only: it paints exactly as the stored values would, writes
  nothing, and is written with the theme pair through the Settings owner when the look is committed to the Project
  (F3-520). Closing or skipping setup before then writes nothing; the NieR preview ends together with the onboarding
  look preview (in the concept both stay painted until the next Settings write or Project load), and resuming setup
  paints it again from the onboarding session, never from the closed setup draft. A settings copy into the new
  Project never proposes the three NieR rows (SSYS-036). The title-bar and Tour-bar controls change the setting itself
  through the Settings owner under the verified current Project binding. Choosing a family while NieR Mode is on keeps
  NieR Mode on, records the family that shows when it is turned off, and says so in plain words: in the title bar a
  short note says the theme is saved and shows when NieR Mode is off, with a button to turn it off; inside the
  onboarding window the NieR row's own line says NieR Mode is painting over the chosen look and that look shows again
  when NieR Mode is turned off, and never claims anything was saved. While NieR Mode is painted, its preview included,
  onboarding and the Tour take a NieR direction in place of Basic's. The illustration system becomes the NieR unit
  marionettes, original line art drawn for Puppet Master with no game asset and no character likeness: small android
  units whose shield-shaped head is crossed by a rigid ink visor band that overhangs it on both sides and is the
  unit's only face (a scan notch at rest, two chevrons for joy, two dashes in a bow), with a high collar, one coat
  silhouette per variant (long coat, short cape, hood, pauldron), square pins at shoulders, elbows and knees, square
  hands, and hairline strings tied to an ink diamond knot on the head; head to torso is 1.21 to 1 at scene and icon
  scale. A solid-ink figure with a paper visor slit, the only unstrung one, steers the floating control unit from a
  broken column, a small machine lifeform watches from the snapped corner of a ruined stage, and the icon form keeps
  the same unit on the 28-unit marionette grid, dropping detail as it shrinks (pins below 36 px, hands below 28 px,
  one string below 22 px, a pixel map at 14 to 16 px). The art paints only NieR's ink, paper and raised-surface
  roles, strings in ink at about half strength, the accent ochre on one item per scene and rust only in a fifth of
  the confetti; no NieR part gates the units or their visor, which follow NieR Mode being painted, while the parts
  gate the scene's decoration and motion (YoRHa headers the kicker, Machine glyphs the glyph strip, Parchment ground
  the dot grid, Map ticks the map label and ruler ticks, Scan sweep the visor scan, Menu cursor the blinks, Target
  brackets the lock-on corners of a cheer, Slice open and Text decode the scene changes). The window and the Tour
  callout gain, each under its own part: the YoRHa header band, kicker and ink rail (YoRHa headers); square fields and
  switches (Square hairlines); the menu cursor on cards, tiles, switches and choice rows (Menu cursor); ink target
  brackets on the chosen card or tile and around the Tour's target (Target brackets); labels of 8 characters or fewer
  decode, and longer words type on (Text decode); slice-opening panels and callouts (Slice open); a page wipe on a
  back move (Page wipe); a block progress meter (Block progress); and, under Quest banners, the cards named below
  rather than a chapter banner. A torn alert marks an error or a missing Tour target (Alert glitch). Pod 042 docks
  in the Tour callout, flies Show Me's pointer and reports each screen once, led by `Report:`, `Proposal:`, `Alert:`
  or `Query:` (Pod companion for the unit, Pod voice for the words), and never covers an actor, a hung card or the
  stage kicker. No part is added. In the concept the moments, as built, are these. Ticking NieR: the reboot cover
  grows from the NieR thumbnail, a check list types on, slats tear the cover away and the troupe is lowered in;
  unticking powers the units down and folds the world back into the thumbnail. The cold open: the window opens empty
  and a boot log types in the pane, and each of its stamps wakes the puppets. At a chapter's end in onboarding an
  ink act card is lowered on two strings, and on landing the ink block walks the rail to the next chapter, instead
  of a chapter banner. The Project's name is stamped Created, and at Ready a two-panel curtain closes over the last
  scene and opens on the troupe standing in a line, for a curtain call that re-stamps the rail. Ready hands the
  window over as one ink line into the tour's first callout, and the same Pod flies into that callout. In the tour,
  Show Me is Pod 042 taking the strings inside a frame that reads In control and Press any key to stop. Each new
  tour chapter hangs a chapter card while the bar's ink block walks from the old chapter's name to the new one. At
  the finish the callout folds, a results card opens, and then Pod flies home. The reboot cover's flicker-out is
  replaced by that slat tear-out, in onboarding and on the page: turned on or off from Settings, the title-bar theme
  menu or the Tour's look menu, the cover is the same plate in NieR's ground of the look's own tone, grown from the
  control pressed, and wake plays at its reveal. The NieR boot log on the Settings page paints in the stored Light,
  Dark or Auto mode from its first frame. NieR motion is stepped, with no glow, filter or blur, loops only by
  transform or opacity, and scales with Animation speed. Words longer than 8 characters type on, with their final
  layout reserved from the first frame. No surface larger than 340x256 px reverses its opacity more than once a
  second: a large area leaves one way, by a fold, a wipe or slats, and only a small element such as a caret, a stamp
  or a tick may flicker. Input never waits: a key or a press snaps a running performance to its end state. Every
  beat is gated by an existing part. Reduced Motion, the Still and Colors only presets and low resource show each
  moment's end state, and Quiet drops the Pod beats. A background change made from the editor cross-fades as F3-589
  sets out. The application beneath the onboarding window stays still while the window is open. No settings key,
  NieR part, theme family, theme variant, `ui.onboarding.*` action or `ui.guided_tour.*` action is added.
gui_related: true
gui_classification_reason: Defines where NieR Mode is turned on and how onboarding and the Guided Tour look under it.
split_recommended: false
depends_on: [DL-152, SSYS-043, F3-082, F3-426, F3-441, F3-520, F3-521, F3-589]
unblocks: []
acceptance_criteria:
  - "The title-bar theme selector, the onboarding look choice and both Look menus show one NieR Mode checkbox with an Adjust NieR look button below their family and Light/Dark choices; NieR Mode never appears as a family choice or a ninth variant, and the selector still exposes exactly eight built-in variants."
  - "The checkbox and the button are keyboard reachable and the checkbox exposes its checked state; the editor opens as a popup dialog over the application or as a panel inside the onboarding window, closes on Escape and returns focus to the button."
  - "Before a verified current Project exists no NieR choice writes a setting; committing the look writes the three NieR rows with the theme pair to that Project, and closing setup first leaves the stored values in place."
  - "With NieR Mode painted every onboarding stage draws the NieR unit marionettes and the window and every Tour step draw the NieR touches of the installed parts; with it off no NieR touch draws, moves or plays, and the four family directions are unchanged."
  - "The unit marionette keeps its visor, collar, square pins and strings under every part selection and preset, and keeps the 1.21 head-to-torso ratio and the size-gated detail of its icon form."
  - "Every NieR beat is gated by an existing installed part, and Animation speed still scales the motion."
  - "Words longer than 8 characters type on with their final layout reserved from the first frame, and a label of 8 characters or fewer may decode."
  - "No surface larger than 340x256 px reverses its opacity more than once a second, and a large area leaves one way. The reboot cover tears out in slats in onboarding and on the Settings page, and the NieR boot log's first frame on the Settings page is the stored Light, Dark or Auto mode."
  - "Pod's narration never covers an actor, a hung card or the stage kicker."
  - "A key or a press during a NieR performance snaps that performance to its end state, and input never waits on it."
  - "Reduced Motion, the Still and Colors only presets and low resource show each of these moments in its end state, and Quiet drops the Pod beats."
  - "No settings key, NieR part, theme variant, onboarding action or tour action is added."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 Concepts/onboarding/opus-5.5/tools/build.py --check
risk_class: nier_onboarding_tour_drift
reasoning_tier: high
context_scope: nier_onboarding_tour
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/Planning_Wizard.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-152"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-onb-20261007/JARED-REQUEST-20261007.md, SHA-256 416638453431ef6bac2b4a8066560214c4fa3bcd8e0663cf778fba89bc63e652"
  - "Concepts/onboarding/opus-5.5/README.md (concept lineage only; branch t3/concept/polish-nier-onboarding-sounds)"
  - "/home/sittingmongoose/pm-scratch/nier-onb-20261007/design/puppets-final/spec.md (the unit marionette design, concept lineage only)"
preserved_exact_tokens:
  - "NieR Mode"
  - "Adjust NieR look"
  - "menuitemcheckbox"
negative_constraints:
  - "Do not list NieR Mode as a family, a theme variant or a menuitemradio option."
  - "Do not open the NieR Mode editor as a dialog over the onboarding window."
  - "Do not write a NieR choice durably before the Project binding exists."
  - "Do not use a game asset, game audio or a character likeness."
  - "Do not add a NieR part, a settings key, a theme or an onboarding or tour action."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-152, ContractName:Plans/FinalGUISpec.md#F3-520, ContractName:Plans/FinalGUISpec.md#F3-521, ContractName:Plans/FinalGUISpec.md#F3-082, ContractName:Plans/Settings_System.md#SSYS-043

### F3-599 — Onboarding And Guided Tour Sound Cues In Notifications And Sounds

```yaml
plan_unit_id: F3-599
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Product Onboarding and the Guided Tour play sound cues for their own moments, and those cues form one onboarding and
  Guided Tour cue category in the Notifications & Sounds routing matrix (F3-405), beside the chat cue category
  (F3-564): mapped through general.interaction.sound-mapping, switched by general.interaction.sound-effects (on by
  default, DL-107) and silenced by the onboarding and Tour sound controls, which toggle that same key (F3-520, F3-521).
  Its moments, as the concept plays them, are: in setup, the window opening, moving forward or back, entering a new
  chapter, choosing a card or tile, a tap, a switch turned on or off, a sheet or panel opening or closing, a reveal,
  typing, a phase of owner work, something found, a warning, a failure, a copy, moving through folders, the Project
  made, a helper's cheer, the celebration, and the finish or a close; in the Tour, its opening, a callout arriving,
  next, back and skip, a step done, Show Me's pointer setting off, picking up, dropping, pressing and arriving,
  typing, moving through parts, a phase, a missing target, an interruption, pause and resume, a choice, and the
  finish or a close; NieR Mode turned on or off; and, while NieR Mode is painted, the reboot cover, a title decode,
  the act card or hung chapter card, Pod's chirp and the menu cursor's tick. The cues added for these moments are
  wake, which falls back to a reveal, string to a tap, land to a drop, bow to back, save to a success, showPointer
  to the pointer and showInterrupt to an interruption. wake plays when the cover reveals, string when strings go
  taut or the name sign or Show Me's string sounds, land when a unit or prop is set down, bow when a unit bows,
  save when the Project is stamped made, showPointer while Pod demonstrates and showInterrupt when that
  demonstration hands control back. A moment without a sound of its own in a kit plays the sound of a fixed related
  moment, never silence by accident and never an unrelated sound; pointer hover alone is silent outside NieR Mode. A kit per theme family provides the
  default cues, dark and light sharing one, and a NieR kit, original sounds made for Puppet Master in the spirit of
  the game's menus, replaces the painted Basic kit while NieR Mode is painted, its onboarding preview included, and
  its Menu sounds part is installed; turning NieR Mode on or off and the reboot cover use the NieR kit whenever Menu sounds is
  installed, even mid-change. Pod's chirp plays only while Pod companion or Pod voice is installed and a Pod is on
  screen to turn toward what it reports; it is the NieR kit's chirp with Menu sounds installed and the painted kit's
  tap otherwise. Frequent cues (a tap, a choice, next, back, the switches, a step, typing, moves, callouts, steps
  done, and in the NieR kit Pod, decode, quest and the cursor tick) draw from pools of three to five takes in a
  shuffle that never repeats the last take; every cue follows the journey's pitch (a chord per chapter, forward
  steps climbing with progress, back descending). Each look also has a four-note motif that a chapter sting builds
  one note per chapter and resolves at Ready: Basic E G B D, Friendly G A B D, Glass C G D A, Retro C E G C, and
  NieR A C E G. A chapter already stung in the current run does not sting again, so moving Back and then forward
  plays the plain forward cue. A take never changes a cue's meaning, loudness tier or timing.
  Cues requested in one task or within 70 ms merge by importance: only the most important plays (a commit, then a
  celebration, then the finish, then NieR Mode turning on or off and wake, then the reboot, then an outcome such as
  a success and then save, then a chapter sting, then screen changes, moves and choices, then taps, with title
  decode, typing and hover last), and a lesser cue already sounding gives way to a more important one arriving
  inside the window. Each moment has one signature cue: no two cues of priority 75 or higher play within 1000 ms,
  except the designed layers. Those layers are the texture ticks (a title decode's chatter, typing, moves and the
  cursor's hover) and the stage's foley (a string, a landing and a bow) under anything, the celebration's sparkles
  over a commit or the finish, and Pod's chirp just after a callout, a quest card, a chapter or a step. Before a
  resolution, Ready's chord and the tour's finish, the other cues rest for 150 ms. Very frequent cues keep a
  minimum gap between two of the same, and a burst of six sounds within half a second keeps only the important ones. These limits are the
  onboarding and Guided Tour category's; the chat's cues keep ACD-475's. Every onboarding, Tour and NieR sound, the
  NieR parts' menu sounds included, plays through the Notifications & Sounds owner's one player with its one switch,
  volume and gesture gate: audio starts only after a user gesture, each cue accompanies a visible change and never
  carries information alone, and Reduced Motion does not mute. With no Project the onboarding sound control starts
  on, as general.interaction.sound-effects's factory default (DL-107), as a session-only preview that writes
  nothing. The Settings sound library lists every take of every onboarding and Tour cue of every kit, the NieR kit
  included, as its own built-in entry in styles of their own beside the notification sounds (Setup & tour, one per
  look, and NieR), the main take of each moment first and the other takes behind a Show N more takes control; each
  is previewed after an explicit gesture under F3-405's preview rules. In the concept that library holds 354
  entries (Basic 69 takes, Friendly, Glass and Retro 66 each, and the NieR kit 87), generated demonstration tones
  labelled as such and previewed through the onboarding's own player. This pass changes the four family kits'
  sounds and leaves the four families' pixels unchanged. Production built-in cues carry source, licence, version,
  duration and hash metadata, and no game audio is used.
gui_related: true
gui_classification_reason: Places onboarding and Guided Tour sound cues, their kits and the NieR kit in the sound settings model.
split_recommended: false
depends_on: [DL-152, DL-107, SSYS-039, SSYS-043, F3-405, F3-564, F3-520, F3-521, ACD-475, UCC-103]
unblocks: []
acceptance_criteria:
  - "Onboarding and Tour cues appear as one category in the Notifications & Sounds mapping, beside the chat category."
  - "The onboarding and Tour sound controls, the chat header mute and the Settings switch always show the same state, and no onboarding-, tour- or NieR-only sound setting, registry, volume or player exists."
  - "While NieR Mode is painted with Menu sounds installed every onboarding and Tour cue comes from the NieR kit, otherwise from the painted family's kit."
  - "Every frequent cue has a pool of at least three takes in every kit and never plays the same take twice running; cues requested within 70 ms play only the most important one, except the designed layers; and nothing plays before a user gesture."
  - "wake falls back to a reveal, string to a tap, land to a drop, bow to back, save to a success, showPointer to the pointer and showInterrupt to an interruption when a kit has no take of its own."
  - "Each look's chapter sting builds that look's four-note motif one note per chapter and resolves at Ready, and a chapter already stung in the run does not sting again after Back."
  - "No two cues of priority 75 or higher play within 1000 ms except the designed layers, and Ready's chord and the tour's finish each wait through 150 ms of rest."
  - "The sound library lists every take of each onboarding and Tour cue of each kit with its moment and style (Setup & tour per look, and NieR), 354 entries in the concept, main takes first and the rest behind Show N more takes, labelled as a generated demonstration tone in the concept, and previews it only after an explicit gesture. The four family kits' sounds change with this pass, and the four families' pixels do not."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 Concepts/onboarding/opus-5.5/tools/build.py --check
risk_class: onboarding_tour_sound_drift
reasoning_tier: high
context_scope: onboarding_tour_sound
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Plans/DRY_Rules.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-152"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/nier-onb-20261007/JARED-REQUEST-20261007.md, SHA-256 416638453431ef6bac2b4a8066560214c4fa3bcd8e0663cf778fba89bc63e652"
  - "Concepts/onboarding/opus-5.5/README.md (concept lineage only; branch t3/concept/polish-nier-onboarding-sounds)"
preserved_exact_tokens:
  - "general.interaction.sound-effects"
  - "general.interaction.sound-mapping"
  - "Menu sounds"
  - "generated demonstration tones"
  - "Show N more takes"
negative_constraints:
  - "Do not add an onboarding-, tour- or NieR-only sound setting, sound registry, volume, player or kit choice."
  - "Do not let a cue be the only signal."
  - "Do not use game audio or present demonstration tones as licensed recordings."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-152, ContractName:Plans/FinalGUISpec.md#F3-405, ContractName:Plans/FinalGUISpec.md#F3-564, ContractName:Plans/assistant-chat-design.md#ACD-475, ContractName:Plans/Settings_System.md#SSYS-039
