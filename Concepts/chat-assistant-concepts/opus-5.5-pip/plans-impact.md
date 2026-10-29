# Pip in the chat: what it would touch in Plans

This is a map of every place in the planning canon that Pip in the chat would change if it moved from concept to product. It covers DRY, wiring, commands, settings and the documents that own each surface. Nothing in `Plans/` has been edited. Line numbers are from this branch's copy of `Plans/` (2026-10-29). Unit ids such as F3-594 are stable; the line numbers will drift.

## The headline

Pip is not a new character in an empty slot. **The chat's agents are already marionettes in canon.** DL-149 records Jared's answers of 2026-10-07 on decision cards 6 and 8. FinalGUISpec F3-594 specifies the result: one puppet primitive draws every agent, with a role prop, a seat hue, a family material and puppet-native states. DR-044 forbids a second primitive.

So the product path is to **redraw that one primitive as Pip**: amend F3-594 and record a new decision that supersedes parts of DL-149. A layer drawn on top of the existing puppets, which is what this concept does, would not be allowed in the product. Once the primitive is Pip, most surfaces follow with no edits of their own: team rows, cast plates, specialist rows, run cards, Activity rows and the live agents card.

## Owner decisions Pip reopens (Jared's call)

| # | Canon today | Where | What the concept does |
|---|---|---|---|
| 1 | Puppets hold still in setup sheets, act once on run cards and run views, and sway only on the live agents card | DL-149 (Decision_Log L3245, L12472), F3-594 L42305, ACD-475 L26586 ("nothing animates at idle") | The sheet's Pip sways, blinks, follows the pointer and reacts |
| 2 | States are drawn on the puppet: taut strings while working, slack and dimmed while queued, a raised hand for needs-you, a check notch for done, a cut string for failed | F3-594 L42301-42304 | Faces carry the state: dots, sleep, wonder, happy, oops |
| 3 | Lists use one status set; no surface draws a competing mark for a meaning | F3-658 L49179, L49215; F3-585; DR-051; SQR-012/014 (Scheduled); AMS-047 (Memory) | Scheduled and Memory rows show Pip faces instead of the status glyph |
| 4 | The Orbit and its choreography are protected | assistant-chat-design L25099 (Cumulative v3 item 9), ACD-473, F3-586 L41698 | Pip sits in the centre disc and the tool glyph becomes a badge |
| 5 | Checkers and reviewers hold a **magnifier** | F3-594 L42285 | Glasses (from the onboarding's Reviewer); NieR already shows a magnifier |
| 6 | The Coordinator keeps the text colour or its seat colour, never the accent; colour is kept for status | F3-594 L42283, DL-111, F3-584 | The crown and hard hat are gold in every look |
| 7 | Every agent under NieR Mode is PMConcept7's NieR puppet unit | F3-594 L42293, F3-598 | NieR Pip comes from the logo kit (`pipNier`), which is a different figure |
| 8 | Cast plates use straight strings only | F3-595, F3-601 L42942 | The "Strings" part can remove them |
| 9 | Sheet head: the kind mark, title, one lead sentence, the close control, and nothing else | F3-566 L40171 | Adds a Pip holding the sheet's sign beside the close control |
| 10 | The build-window mark sits in a 16 px column | F3-607 L43093 | A 22 px sleeping Pip |
| 11 | Onboarding art differs by family and is not one recoloured figure | F3-520 L36639, F3-656 | One Pip across every look (onboarding concept) |

Items 1 to 4 are the real choices. The rest are small adjustments to the drawing.

## DRY

| Rule | Where | Effect on Pip |
|---|---|---|
| One puppet primitive draws every agent; a module never forks or restyles it | DR-044 L2734, F3-594 L42279 | Pip becomes that primitive. Its role table stays F3-594's: full Persona name, then last word, and an unknown role gets the hard hat |
| No surface keeps its own icon table or status glyphs | DR-051 | List faces must map to the `glyph_catalog.json` mark. `scripts/pm7-canon-check.py` L235 pins 22 status keys, so faces cannot be added as new keys |
| Seat hues come from one table | F3-635 L45594 | Pip reads them; it never has its own |
| Motion voices are tokens for each theme family; no per-view override | DR-043, DR-075, ACD-475 | Retro stepping and NieR cuts come from the family voice. A "Motion" parts group is close to a per-view motion setting |
| No second sound player, registry or setting | DR-043, F3-599, SSYS-039 ("No new sound … key"), SSYS-055 | Pip's voice must play through the Notifications & Sounds owner's one player and obey the master switch. A separate voice on/off would need a ruling |
| No surface keeps its own pointer-move listener or animation loop | DR-072 L3393, ACD-501 | Gaze and the 0.42 s watch would have to run on the shared hover engine |
| The chat keeps no overlay layer of its own | DR-067 | The lift-off copy opens in the one overlay root |
| A settings sheet and the Settings page edit the same admitted row; localStorage is concept lineage | DR-056, DR-074, DR-075 | `pip-chat:v1` is not a product store |
| Demo Studio is never product | DR-070, F3-649 | Demo Studio's Pip section stays lab-only |
| Status and tag chips are never full capsules | DR-069 | The part chips must keep their square-ish corners |

`glyph_catalog.json` L399: `pip-done` is the Guided Tour's progress dot (a "tour pip"), not the mascot. The name collision is worth knowing about.

## Settings (the NieR Mode pattern)

NieR Mode's Plug-in Chips are a close precedent:

- **Rows:** three inventory rows, `general.visual.nier-mode`, `general.visual.nier-parts` and `general.visual.nier-background`, admitted in a user-approved inventory wave (SSYS-043 L2897, Settings_System L1323-1327, F3-441).
- **Parts:** one multi-choice row. Each part is an option. A preset is just one value of that row.
- **Editor:** a row editor, not a manager. It opens, closes and plays through local actions `ui.settings.nier_editor.open`, `.close` and `.replay`, which write nothing.
- **Edits:** every edit goes through `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply`.
- **Scope:** the Project, like the theme pair. There is no app-global or browser copy (SSYS-002, SSYS-010, Settings_System L1396).

Pip copied that pattern:

| Needed | Where |
|---|---|
| A `general.visual.pip-parts` row (24 options, presets as values), plus `general.visual.pip` if Pip itself is a switch | `settings_inventory.json`; a user-approved inventory wave; an F3-441 amendment and new count |
| A unit next to SSYS-043, plus a §4.4 paragraph after L1327 (motion, sound, how it relates to NieR) | `Settings_System.md` |
| The chat sheet named as a host of those rows | SSYS-044 L2988 |
| Lift the "no additional … setting" line | SSYS-055 |
| Motion parts follow Reduce motion **and Animation speed**; status feedback keeps working under Reduce motion | SSYS-010, L1327 |
| Which wins in the chat when NieR and Pip are both on (NieR has "Pod companion" and "Ink empty states" parts) | A rule in the new unit; F3-589 L41909-41911 |
| Presets are not appearance quick sets (that schema allows only `editor` and `terminal`) | No edit to `appearance_quick_sets.json` |

Stale counts were found along the way: SSYS-004, SSYS-017 and F3-441 say 828 rows, but `settings_inventory.json` has 1009.

## Commands

- **No new `cmd.*` command.** Part changes and presets use the settings transaction pair (SSYS-038, UCC-120). Hosted chat surfaces add producers, not command identities (UCC-208).
- **New local actions** modelled on NieR: `ui.settings.pip_editor.open`, `.close` and `.replay`. These names are proposals; canon has none yet.
- **The wand's "Pip…" row** is a Settings disposition in the UCC-170 census, like "New chat defaults" (UI_Command_Catalog L14143). The count goes from 195 to 196.
- **The wand's "Preferences" group is not canon.** It exists only in the 5.6 Pro concept (`delivery-polish.js` L14). Canon groups wand actions into compact submenus (assistant-chat-design L25100) without naming them.
- **Demo Studio:** no command (F3-649, CS-093).
- **Files:** `UI_Command_Catalog.md` (UCC-170, UCC-188, UCC-208, UCC-120); `Commands_System.md` (CDRY-021, CS-093).

## Wiring

- **Exempt: presentation-only changes to existing surfaces.** Sheets, repaint and hover dispatch no command (UCC-208 L16347; WM-096 L6541; UIW-013 L949). The `WiringEntry` schema has no visual field. None of the 1258 production rows names a puppet, orbit, seat colour or status mark. No existing row changes.
- **New rows needed:**
  - Pip editor rows in `pm7_control_bindings.json`, following `nier.editor.parts` (L6440) and the `ui.settings.nier_editor.*` rows (L6478-6504).
  - TCP-SET-LOCAL rows for open, close and Play in `touch_closure.json` (L10828-10843).
  - Pip added to the `ui_location` and acceptance text of `catalog.settings_transaction_apply` (`Wiring_Matrix.production.json` L55986) and `_preview` (L56057).
  - No new production entry, so the pinned count of 1258 stays.
- **Rule text to amend:**
  - UIW-043 and UIW-044: census scope.
  - UIW-024: teardown must release Pip's timers, animations and the lift-off copy.
  - WM-093 and WM-096: wording.
- **The click delay:**
  - The ~30 ms deferral on main buttons is within the 100 ms acknowledgement bar of ACD-475 (L26599).
  - It must apply equally to keyboard and pointer (each row's "identical typed request").
  - It must open no window for a double commit (UIW-025 L1874).
  - In the product the stall it works around would itself fail that bar, so the deferral should not be needed.
- **Disabled buttons:** "Oops" on a disabled button must never activate it (UIW-013 L928).

## Governance

- **Pinned files:** `Spec_Lock.json` pins DRY_Rules, UI_Command_Catalog, FinalGUISpec, Wiring_Matrix.md, UI_Wiring_Rules and glyph_catalog. Editing them leaves governance staleness, so the landing reports a reseal request.
- **Derived files and checks:** each Plans edit regenerates shards and the plan index, and runs the landing check.
- **A new decision** goes in `Decision_Log.md`, superseding DL-149's card 6 motion rule and the magnifier prop. It also touches DL-111 and DL-140.

## Not affected

- **Plans docs:** Run_Graph_View, Orchestrator_Page, Widget_System, Named_Plan_System, Personas, feature-list, Back_Seat_Driver (only through F3-566), the onboarding and tour schemas.
- **Wiring files:** `Wiring_Matrix.schema.json`, `Wiring_Matrix.production.exclusions.json`, both PMConcept control reconciliations.

## Files to edit, in order

1. **`Decision_Log.md`:** the new decision. It names what Jared rules on items 1 to 4.
2. **`FinalGUISpec.md`:** F3-594 is the core change. Then F3-595, F3-601, F3-566, F3-584, F3-585, F3-586, F3-588 with §21/F3-539, F3-589, F3-580, F3-593, F3-596, F3-606, F3-607, F3-635, F3-658, §10.5 empty states, and F3-441. For the wider Pip program also F3-520, F3-598, F3-600, F3-656 and §3.3 (tray icon).
3. **`DRY_Rules.md`:** DR-044 and DR-051, or a new DR that names Pip as the primitive. Also DR-043 (voice), DR-072 (gaze) and DR-067 (lift-off copy).
4. **`assistant-chat-design.md`:** ACD-475 (idle motion, sound cues), ACD-473 and Cumulative v3 item 9 (Orbit), ACD-469, ACD-501.
5. **`Settings_System.md` and `settings_inventory.json`:** the new unit and rows, SSYS-044, SSYS-055, SSYS-039.
6. **`UI_Command_Catalog.md` and `Commands_System.md`:** the census and dispositions above.
7. **`UI_Wiring_Rules.md`, `Wiring_Matrix.md`, `Wiring_Matrix.production.json`, `pm7_control_bindings.json`, `touch_closure.json`:** the rows above.
8. **`Scheduling_and_Quota_Resume.md` and `assistant-memory-subsystem.md`:** SQR-012, SQR-014 and AMS-047, but only if list faces stay.
9. **`Collaborative_Workflows.md`:** CWR-019 and CWR-028, light wording.
10. **`Glossary.md`:** a "Pip" entry. **`00-plans-index.md`:** a dated change line.
