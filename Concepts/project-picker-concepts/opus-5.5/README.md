# Title-bar project box (Opus 5.5)

Four new looks for the project box in PMConcept7's title bar, the one beside the logo. Each is shown inside the real
PMConcept7, next to the Pip logo, in all ten looks. PMConcept7 itself is not edited: `index.html` frames it and adds this
folder's layer at runtime.

Open `index.html` through the Concept Hub or any local server, since it frames `../../PMConcept7.html`. For a file that
opens by double-click, see "Single file" below.

## Why it doesn't fit today

These measurements are from PMConcept7 itself.

- **Height:** the box is 20 px tall in a row of 28 px page tabs.
- **Type:** its text is 12 px, while the tabs and the wordmark beside it use their own sizes and weights.
- **Chevron:** it is a text ▼, while every other menu in the app uses a drawn chevron.
- **Material:** it has a form field's fill and border in every look. Retro draws it as a double-ruled field, and Friendly as a faint outlined box.
- **Content:** it shows the name only. FinalGUISpec 3.4 asks the title bar for the project's name and path summary, a badge when the project has background activity, blocked items or unsaved shell state, and a keyboard way in.

## The options

| | Option | What it is |
|---|---|---|
| A | **Tab** | The project becomes one of the title bar's tabs: the page tabs' 28 px height, type and resting ink, a folder mark and a drawn chevron. While its menu is open it wears the chosen tab's chip. A hairline separates it from the pages it owns. This is the smallest change. |
| B | **Breadcrumb** | *Puppet Master / tastebook.* The project reads as the next step after the app's name. It has no box until the pointer or the menu reaches it. The bar gets quieter, and the name reads as a place. |
| C | **Plate** | A two-line plate: a monogram tile in the chosen material, the name, and the path and branch that 3.4 asks the title bar to show. It carries the most information, at 32 px tall. |
| D | **Pip's sign** | The project's name is on a card that Pip holds up on a string from its control. The card swings once when it is picked up. Pip's face shows the project's state (working dots, needs-you alert, watching unsaved work), so the card carries no badge. |

**Today** shows PMConcept7's current box beside the new logo, for comparison.

All four share these behaviours:

- **Badge:** the project's state (calm, working, needs you, unsaved) uses the shared status marks. In D it is Pip's face instead.
- **Narrow windows:** PMConcept7's title-bar density folds the box down to its lead: a folder for A and B, the monogram tile for C and D.
- **Long names:** they truncate with an ellipsis.
- **Menu:** every option uses the same menu, described below.

## The menu

The menu has three parts:

- **Heading:** "Projects", with the switch shortcut, Ctrl Shift P (FinalGUISpec's keyboard table).
- **Project rows:** two lines each, with a monogram tile, the name, and the path and branch. Each row shows its project's state in words beside its status mark.
- **All projects:** a final row that opens the Projects page. 3.4 says switching is surfaced through the Projects view.

The chosen row keeps PMConcept7's own chosen-row material (DL-214: Basic's tinted chip, Friendly's mint plate, Glass's clear lens, Retro's reverse video, NieR's ink bar). The tile on that row turns over with it.

## Built from the platform

- **Materials:** every fill, line, corner and ink is a PMConcept7 token. These are the shared switcher material (`--pm-switch-*`, which every tab, segment and chosen row already uses), the text and border tokens, and Glass's own fills. So each option takes all ten looks from the tokens and has no per-look palette of its own.
- **Icons:** every icon comes from PMConcept7's single glyph registry (`window.PMG`): folder, chevron, grid, arrow and the status marks. The only new drawing is Pip, from the logo kit.
- **Hover:** PMConcept7's hover engine still draws hover on the box (including NieR's cursor and Retro's phosphor). The layer's rules stand aside whenever it is on.
- **PMConcept7's own code:** the button, its label and the menu stay PMConcept7's, and so does choosing a project. The layer adds parts around them and follows the label when it changes.
- **Motion:** Retro and NieR step the chevron and the sign's swing. Reduced motion stops both.

## The concept bar

The strip above PMConcept7 is for reviewing. It is not part of the design.

- **Option:** A to D, and Today (keys 1 to 4, and 0).
- **Look:** all ten. Looks are switched through PMConcept7's own theme menu (family, mode, NieR Mode), the way a person would.
- **Project state:** calm, working in the background, blocked and needs you, unsaved layout.
- **Long name:** a long project name.
- **Window width:** full, 1280, 1024 or 860 px, to see the folded box.
- **Open the menu.**

PMConcept7 keeps each project's look in that project's Settings, so the theme menu writes them. This page takes a copy of those values when it opens and puts them back when it closes.

## How it reaches PMConcept7

`index.html` frames `../../PMConcept7.html?o55=off` (the app, not first-run setup). It then adds three files to PMConcept7's document, in order:

1. `picker.css`
2. `../../Icon-Concepts/Opus5.5icon/pm-logo.js` (Pip's drawing kit, for the logo)
3. `picker.js`

`picker.js` exposes `window.PPK`, with `set`, `before`, `state`, `long`, `look`, `open`, `close` and `get`.

## Single file

    python3 tools/build_standalone.py OUTDIR [path/to/PMConcept7.html]

This writes `OUTDIR/project-box.html` (about 37 MB), with PMConcept7 and the layer inside the frame. A frame built this way has no address to carry `?o55=off`. So a first script writes an onboarding record if none exists, and the page removes that record again when it closes.

## What it would touch in Plans

- **FinalGUISpec 3.4 and the title-bar row of 3.2:**
  - the chosen option's look;
  - in C, the path summary shown in the bar;
  - in D, Pip's face as the 3.4 badge.
- **No new command, setting or glyph.**
  - Opening the menu is view state.
  - "All projects" opens an existing page.
  - Ctrl Shift P is already in FinalGUISpec's keyboard table.
  - Every icon is already in the registry.
  - I found no `pm7_control_bindings`, UI_Command_Catalog or Wiring_Matrix row that names the title-bar project box, so no wiring row changes.
- **D only:** Pip's face would carry the project's state. That is the logo concept's own idea ("the face is the status"), but it would need a ruling beside the notification stack, which 3.4 makes the title bar's only notification affordance.
