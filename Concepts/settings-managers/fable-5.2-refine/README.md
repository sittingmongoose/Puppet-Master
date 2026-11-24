# Settings managers, refined (Fable 5.2)

PMConcept7's own Settings managers, made easier to look at and use. Same chapters, same managers, same tabs, same
controls. Jared, 2026-11-20: "make the existing managers easier to use/easier to look at/ more digestible... Refine the
current managers."

This folder is not a second design. It is an **overlay of PMConcept7's sources**: changed copies of a few of its files
and a few added files, built by PMConcept7's own build. Nothing of PMConcept7 in the repository is edited.

## Build and open

```sh
tools/build.sh [out.html]     # default out: ~/.cache/smx-refine/serve/refined.html (about one minute)
tools/take.sh <path under Concepts/>   # copy one of PMConcept7's files into overlay/ before changing it
```

`proposed/*.json` holds Settings rows this concept proposes, in the shape of `Plans/settings_inventory.json`'s
`settings`. The build adds them to its scratch copy of the inventory, so PMConcept7's own build draws them as ordinary
rows; the repository's inventory is never touched (see the sixth pass, the browser).

`BASE` names the commit of PMConcept7's sources the overlay sits on. A build of `BASE` with an empty overlay is
byte-identical to `Concepts/PMConcept7.html` at that commit.

## Checks

```sh
browser-check run Concepts/settings-managers/fable-5.2-refine/tools --set page=<refined.html> --set before=<PMConcept7.html of the same base>
```

Fourteen tests by real clicks (`tools/refine.check.mjs`): the chapter move and old links; Explain; the centred tab
strips (the chapter's now over the middle of the page, on the manager's axis) and the side column; Servers' Overview
map at two sizes; the things that looked wrong
(the band, the covered title, the chosen row, the light, no stripe down one side, the side column's chip and the
words it carries); Providers' account rows and Add a service; the fourth pass (the list column, the row grids of
Search services and Doctor, the two Add a destination sheets and their forms, one right edge in a detail); the fifth
pass (a detail with no ground of its own; one start for titles and row names, one end for controls, one row height
and edge-to-edge lines on a page with both kinds of card; Away From Home's columns; More options); the sixth pass
(a tab strip's box follows its chip; the one bar on top of a chapter with its three buttons, its line and its axis; a
chapter with one manager; a long chapter in a narrow window; a crew's model pickers and the Models step; the
browser's four tabs, their rows, the video formats, and the line of facts following a change); the one home of
a service's switching rules; the example staying in view in Editor and Terminal Customize, Customize Pip and Adjust
NieR; the examples being as wide as they were and the editor's following what is typed; and **nothing was
dropped**: every setting id and every action of the unchanged page is still on some page of the refined one (920
settings, 73 views, on 2026-11-20; the refined page has three views more, the browser's new tabs, and the fifty
proposed rows). Pass `--set before=` as a `file://` address.

Five more tools, for looking and measuring rather than asserting, live with the evidence (not in this repository):
`tabs.check.mjs` (every "pick one" strip in every view of a look: the box's corner against the chip's corner plus the
gap between them, and the gap on each side), `shots.check.mjs` (a list of steps and pictures, any of the ten looks), `adds.check.mjs` (opens every Add, New, Link
or Connect button and pictures what appears), `icons.check.mjs` (lists every button that shows no word) and
`align.check.mjs` (in every view, in any look: where each line of words starts, where each control ends, each row's
height, rows with no line or a line that stops short of its card, and any painted pane that sits inside a card of
another tone).

## Sixth pass (2026-11-24), after Jared's fifth review

Jared: "Outside of that, the new designs look awesome." Five things:

**1. The tab selector and its box.** "This tab selector doesnt fit in the box, the shapes arent right. This needs to
be addressed all over the settings page and in all themes." A tab strip is a chip in a box. The chip is the look's
own (3 px corners in Basic, 9 in Friendly, square in Retro and NieR, Glass's lens); PMConcept7 gave the box one 12 px
corner in every look. Now the box's corner is the chip's corner plus the gap between them, so the two curves run side
by side, and a square chip gets a square box (`styles.d/98-refine-bar.css`, `--rf-chip-r`). By look:

| Look | Was | Now |
|---|---|---|
| Basic | 3 px chip in a 12 px box | 6 px box (3 + the 3 px gap) |
| Friendly | 9 px chip whose hard shadow sat on the box's line | 2 px more room inside; 14 px box |
| Retro | Square keys in a round box with a soft shadow | Keys with no box round them, as Retro's other selectors are |
| NieR | Square in square | Unchanged |
| Glass | The glass chip (6 px corner) in a 14 px box | 10 px box, for a manager's strip, the chapter's track and the small selectors |

The small "pick one of these words" selectors (`.segmented`) had the same fault in Friendly and Glass (a box as round
as its chip, 4 px outside it) and follow the same rule. `tabs.check.mjs` (with the evidence) finds every strip in every
view of a look and compares the box's corner with the chip's corner plus the gap.

**2. The top of a chapter.** "This area looks unfinished and unpolished. See what you can do to improve it, that
applies to all the settings sections that are like this." It was three things on top of each other: the chapter's
managers as loose tabs on a band, a row holding only Explain, the project and the page options at its right end, and
the lines where that row met the side column. It is **one bar** now, the same on every chapter
(`managers/90-refine-frame.js` section 4):

- the chapter's managers in a track in the middle: the same selector as a manager's own tabs
- the three buttons at the bar's right end; the row they sat in is empty and has no height
- one line under the bar, the whole width; the side column and the page start under it, on one line
- the track stands over the middle of the page under it, so it shares an axis with the manager's title and tabs (it
  stood over the middle of the bar, 74 px off them). With less room it moves left; with none (a long chapter in a
  narrow window) Explain first drops its word, then the buttons go under the track
- a chapter with one manager shows the manager's name where the track would be, so the page no longer opens with the
  name a second time
- the 2 px line under the chosen tab is gone: the chip already marks it

**3. Models for a crew.** "In the crew manager there is no way to set the models when you make a crew template."
`managers/32-personas.js` is taken into the overlay. A crew's members are a list now, each with the shared model picker
(depth inside it) on its row; "New crew" and "Edit" have a Models step before Teamwork. The picker's first choice is
"Follow the model route", so a crew made before this behaves as it did. "Model route" (Per persona, or a route by name)
is kept, beside the pickers, as what members without a model of their own use. Stored as `crew.models[member]`, with
the depth under the picker's own depth store (`crew:<id>:<member>`).

**4. Automations.** "In goals and automation, how do automations run? Are those goals?" Nothing in Settings makes or
lists an automation: the word is in two titles ("Memory & Automation", "Goals & Automation"). The page holds Goal
defaults, templates, recovery, checks and five rules for scheduled runs. In the Plans the word covers anything that
runs without the person pressing Send (`Plans/Scheduling_and_Quota_Resume.md`): a scheduled message, a scheduled build
of a plan, working hours, carrying on after a usage reset, and a Goal, plan or crew continuing. Nothing was changed
for this; whether to rename the two titles is asked of Jared (card SM-AUTOMATION-NAME).

**5. The browser.** "There also needs to be a lot more settings for browser, browser work, recordings, etc. Like gpu
acceleration, formats, and all that stuff." The page "Browser & SCM" (one card and two small groups) is **Browser &
Recordings**, in four tabs (`managers/36-browser-scm.js`, rewritten):

| Tab | Groups |
|---|---|
| Browser | what is true now (ready, where it runs, the graphics card) with Check browser; Graphics; Window and page; Signing in to websites; Downloads and pop-ups; Depends on; Limits under More options |
| Browser work | What the assistant may do; Pace and waiting; What counts as a problem |
| Recordings | what recording comes to right now; When to record; Picture and motion; Format; Storage |
| Screenshots | the card the page always had; Picture; Comparing pictures; Pointing at things |

Fifty rows are new. They are ordinary Settings rows (search, About, restore and transfer know them), and they are
**proposed, not in the Plans inventory**: `proposed/browser-rows.json` holds them in the inventory's own shape, and
`tools/build.sh` adds them to the scratch copy of `Plans/settings_inventory.json` it builds from (the repository's
file is never touched). `o55/placement.d/36-browser-scm.json` (sections and tabs) and `24a-browser-rows.json` (the ids;
a file of its own because it has to sort before Testing's rules) place them, `o55/rows.d/36-browser-scm.json` words
them. Where the Plans already decide, the defaults follow (`Plans/Test_Capture_and_Motion_Evidence.md` section 2:
hardware AV1 or HEVC first with H.264 and VP9 as fall-backs, 30 frames a second and 60 for motion, MP4 as the file you
save, sound off unless asked). Two of canon's rows moved within the page: the assistant's DevTools rule to Browser
work, "Screenshot button captures" to the screenshot's Picture group. Nothing was removed. The name is changed in the
two other managers that point at the page (`11-web.js`, taken for one label; `25-testing.js`).

**To merge this into PMConcept7,** the fifty rows need a home the build accepts: admission to the Plans inventory (a
Plans task, with the six capture defaults the Plans already name), or a pending-rows list in PMConcept7's build.

## Fifth pass (2026-11-23), after Jared's fourth review

Jared: "Getting much closer! Did you go through all the managers? If not, do that. I found a couple of small issues.
There is still a black box or color box behind the managers that looks unfinished, it needs to be adjusted so it
looks more cohesive... There are some spots where the text seems uneven, that need to be cleaned up. Like the
alignment, spacing." On the box: "This box, and its in most managers and I think all themes."

**The box.** A list's detail pane was painted one tone off its card (PMConcept7's `.resource-detail`) and was only as
tall as its rows, so under a short detail the card showed again: a box that stops short, in all ten looks. The
detail has no ground of its own now; its rows sit on the card as the rows of every other card do. The list keeps its
own column, the whole height.

**Uneven text.** Every view was measured (`align.check.mjs`), corrected, and measured again:

| What was uneven | Cause | Now |
|---|---|---|
| A section title inside a detail, More options or an opened row started 16 px right of its rows | This concept's own compact-heading rule (second pass) gave every section head 16 px of side padding | Titles start where their rows start |
| A card's title started 2 px left of its rows; a list's icons 2 px right of the title | The head had 16 px of padding, the body 18 | 16 and 16 |
| One-line rows were 40, 42, 46 or 48 px tall | Each control set its row's height | 48 px for every one-line row of a page |
| Two cards on one page had lines of two lengths | A card built from the settings list draws lines edge to edge (FO-124); a manager's own card drew them as wide as its words | Edge to edge in both, the row highlight too. Inside a detail, More options and an opened row they stay as wide as the words |
| Some rows had no line over them | Two lists of rows in one card; the second list's first row had none | A line over every row after the first |
| The line of a list item that opens curled down at both ends | A border on a box with round corners | A straight line |
| Controls ended 4 px apart and "?" sat 6 px apart between the two kinds of card | Two row grids | One |
| Groups inside More options were boxes inside the box, 17 px further in | The settings-section card style | Parts of the one box |
| Away From Home: "In use" started 89 px right of "Not set up"; "Manage" wider than "Set up" | The first row has no order arrows | One grid; an empty place where a row has nothing |
| Notifications: the master switch stood bare on the page, 17 px off the cards at both ends | No card | A card |
| Back Seat Driver: a line between the card's title and its first row | An inline list's own top border | None |
| A note touching the line over it (Media, Personas) or the search box over it (Commands) | No margin | 12 px |
| A value stacked over its button ("Ready to format" over "Check formatter") | Values of 15 to 18 characters still took the long-value width | Beside it, up to 18 characters |
| Glass: a settings-list card's text 19 px further in than the card over it; lighter boxes inside More options | Glass pads and fills every settings section | No second padding or fill inside a manager |
| Retro: a line under "More options" that ran to the right edge and turned a corner | Retro's bevel on every details box | None on this quiet line |
| Containers: "Server & Project Location" in its first line | PMConcept7's placement text | "Servers & Remote Access" (`o55/placement.d/20-toolchain.json` is taken into the overlay for that one phrase) |

Every one of the 74 views was then opened at full size in Basic dark, and the measuring was run in all ten looks.

## Fourth pass (2026-11-23), after Jared's third review

Jared: "This approach looks MUCH better. Now you just need to take this new approach and apply it to all the
managers.(excluding Pip, Terminal, Editor, Nier). I reviewed the ai providers and the server changes, they look
good." With four things marked on screenshots.

| What he marked | Cause | Now |
|---|---|---|
| "DO NOT USE THESE SIDE COLORED TABS!" (a chosen list row and a chosen side-column entry, each with an accent edge) | The third pass marked both with a 3 px stripe | No stripe anywhere. A chosen list row is a soft fill with a thin outline all round, in the colour of that look's own chip. The side column has the app's own chip again |
| "As you scroll, the side bar has the indicator jump, it also doesnt display correctly, for example the friendly theme is wrong" | The third pass hid the chip's resting copy and drew its own mark. The chip's travelling copy still played, so in Friendly a green slab flew across after the mark had already moved | The shared chip does all of it, as on every other strip. What made the words move in the first place is corrected at its cause: while the chip travels it carries copies of the rows' words (liquid-glass `.lg-twin`), and the copies had no bullet, so the words sat 9 px to the left until it landed. The copies get the bullet. A chosen sub-row is no longer bold |
| The list of a list-and-detail card: "it just looks unfinished because it ends abruptly" | The list is sticky and only as tall as its rows; its fill and its dividing line stopped there | The card draws the list's column the whole height (`.pm51-split::before`); the list sits on it |
| "This black box behind sections doesnt look good. It looks cut off and unfinished" (Glass) | Glass gives a card on the wallpaper a dark ground. A section inside a detail counted as such a card, inset from its own card | The whole list-and-detail card takes the ground; the sections in it are plain |
| "there is a box around the indicator light" (from the review before; still there in Retro and NieR) | The ring was drawn on the light's 1 em square box | No ring in Basic, Friendly and Retro; in NieR the light is a solid mark in the bar's ink |

All of it was looked at in the ten looks (Basic, Friendly, Glass, Retro, NieR, each dark and light), and a tour of the
75 views in Glass found no other inset dark box.

The approach of Providers and Servers, on the other managers:

| Where | Was | Now |
|---|---|---|
| Readiness & Doctor | The time and the fix button of a check were as wide as their words; each row ended in a bare ">" | One grid: when it was checked, the one thing to do, "Details". The rows run to the card's edge, under "Check Again" |
| Web & Research › Search services | The state words started at different places; a bare ">" | State, switch and "Manage" each in their own column |
| Notifications › Destinations › Add; Backup › Destinations › Add | A form whose first field was a closed "Type" list | The sheet Providers has: every kind, grouped, with what it is and what it will ask for. Picking one goes on to the form that was there, with that kind chosen; a destination on this computer is not asked for an address |
| Notifications › Events; App Updates › History | Bare ">" | "Edit"; "Details" |
| Source Control › Actions & Pipelines | An icon-only pin | "Pin" / "Unpin" |
| A list's detail (Source Control, Toolchain, Web & Research and others) | Two right edges: a manager's own rows ran 50 px further than the setting rows under them, and a wide row's button 46 px further | One right edge |
| Permissions › a profile | "4 rules" sat over its "See rules" button | Beside it: a short value is placed by its own width (up to 14 characters in this pass, 18 from the fifth) |
| Every plain form | A field's name sat right under the field before it | 14 px between fields |
| Testing & Debug › History › Captured evidence | Each fact's value was pushed right and dropped under its name when it did not fit | Name and value side by side, one column. The words are another stream's and are unchanged |
| Containers, Doctor, Source Control | Sentences that still sent people to "Server & Project Location" | They name the chapter as it is: "Servers & Remote Access" |

Found and left alone: most other "Add" buttons already open a guided setup that shows the choices as tiles (language
servers, formatters, MCP servers, skills, plugins, test and debug profiles, templates, personas, crews, repositories).
The short forms that remain have no list of kinds to show (Add memory, New session, Add rule, Add protected path,
Create worktree).

**For the merge:** the first-run tour and Pip still say "Settings › Server & Project Location" in PMConcept7's copy
files (`src/copy.json`, `src/copy.d/48-pip.json`); they should say "Servers & Remote Access".

## Third pass (2026-11-23), after Jared's second review

Jared: "This is better but it doesnt go far enough to make it nice to look at. There are also some visual bugs."
He does not want options removed; the words, chrome and layout were to improve; Providers was "close"; Servers and
Remote Access needed "the most work" ("It isnt clear where my files are stored, where work is being done"). The
Editor, Terminal, Pip and NieR screens are good and were not touched. Gemini 4 Neon and Astra 6.2 gave layout ideas
at his request (`consult/`); they agree on the main points, and those are what was built.

| What he named | Cause | Now |
|---|---|---|
| "Black bars when you scroll" | A manager's stuck tab strip laid a band of the page's colour across the grey card | The strip floats with a shadow; no band |
| "the persona word is covered by adding a new persona button" | The list's add button carried its whole label | A short "New", "Add" or "Link"; the title has its own column |
| "the left side icons are washed out by the highlight" | The shared switcher paints a chosen row as a solid slab | A soft tint; the icon keeps its colours (the accent edge of this pass went in the fourth) |
| "a box around the indicator light" | The same rule ringed the status light | A plain light |
| "the label highlight on the left ... moves the text over as you scroll" | The slab travelled between the side column's rows, and a chosen row's text turned bold | One text weight (the in-place mark of this pass went in the fourth; the chip is back and its words are aligned) |
| Providers: "The bars are all uneven, the text isnt even, and there are 3 different arrows" | The account row was a wrapping line | One grid: bars of one length in two columns, a status column that never wraps, the two order arrows, and a named "Manage" button in place of the third arrow |
| "The add a new service pop up menu is not at all sufficient" | It was a three-field form for a service not in the list | A sheet with every service grouped by how you pay, a search, each one's state and its next step; the old form is its last row |
| Servers: "It isnt clear where my files are stored, where work is being done" | The first tab was three rows | "Overview": a map. Files are kept on / Work runs on / You steer from, with Away from home under them. Each setting sits in the card it is about |

The first four causes are PMConcept7's own (the same on the unchanged page); they are corrected here inside
Settings only, for the Basic and Friendly looks (`styles.d/96-refine-look.css`). Retro, NieR and Glass keep theirs.

Also in this pass: the Servers tab's list says what each computer does ("Keeps your files · Runs work"); "Link a
server" for a computer that does work and "Connect a device" for one you steer from (the two verbs of T3 Code
nightly's Link and Connect); the headings of Limits & switching's table sit over their own controls; the closed
"When both sides changed" field shows a short name instead of a cut-off sentence; the order buttons of Away From
Home are arrows, as in Providers. The example has four more computers, so the map shows a setup of several.

**Not yet done for the third, fourth and fifth passes:** stream F's kit has not been run on this build, and the list of
its checks below still describes the second pass. Jared asked to see looks first; the kit is to be run, against the
unchanged page too, before any landing. It will need at least these: the first Servers tab is "Overview" (was "Home
& Location") and its three rows are in the map's cards; "Connect a device" (was "Pair another device"), "Your
devices" (was "Paired devices"), "Link a server" (was "Add a server"); four more example servers; Add a service and
the two Add a destination buttons open a sheet first; the stuck tab strip has no band; a list's add button reads
"Add", "New" or "Link"; Doctor's, Events' and Updates' last button and the pin carry a word; a chosen list row is not
the solid chip; one-line rows are 48 px tall and a detail pane has no background of its own.

## What changed, everywhere

| Change | Where it is made |
|---|---|
| **A row is its name and its control.** The sentence under a row, a section, a tab or a page shows when **Explain** is on (one button beside Page options, remembered) and in the row's "?" as before. | `styles.d/95-refine.css`, `managers/90-refine-frame.js` |
| **Less repeated around a manager.** The chapter list names the chapters. A chapter with one manager has no tab strip above it. The first manager's name is not repeated under its own tab. | same |
| **A page is a column you can read** (at most 1080 px wide), so a row's name and its control stay within reach. | `95-refine.css` |
| **Status is one line of facts**, not rows that look like settings (`PM51.facts`). | `90-refine-frame.js` |
| **Nothing here yet** is one line, not a tall box. **More options** is a quiet line, not a dashed box. Counters are one line. A list's add button says what it adds. | `95-refine.css` |
| **Settings Home:** the search box leads, then what needs you. The rail's "Essential setup" and "Settings health" boxes repeated Home; the rail keeps one count beside Settings Home. | both |

## What changed, by manager

| Manager | Change |
|---|---|
| **Servers & Remote Access** | Its own chapter, right under AI & Providers (it was the second tab of System). Same manager, same five tabs. Every old link, search hit or saved place that names it lands on the new chapter. |
| Servers › Home & Location | One line of facts (connected over, this device, work in progress, last change), then the three choices: Home server, Runs on, Files. |
| Servers › Servers | The server's rows are the things you can change or act on. More options is one list. |
| Servers › Away From Home | One card: the ways in, in the order they are tried, with "right now" and "when away" as facts above them. One filled button (the guided setup); each way in says "Set up". |
| **Providers** › Services | The list and the service you picked come first; the three whole-list jobs sit under the list as quiet buttons. |
| Providers › Limits & switching | Each service's own switching rules are on its line here, and only here: on or off, switch at, warn at, rest. |
| **Editor and Terminal Customize** | Up to 1400 px wide. The options scroll on the left; the example, its meter, the presets and Try it stay on the right. The example is never narrower than it was (about 640 px), and the editor's example follows its caret sideways, so what "Type" types is always in view. A line under the example names what you just changed. |
| **Customize Pip, Adjust NieR** | 960 px wide. The parts scroll on the left; the picture, meter, presets and Play stay on the right, the picture no narrower than it was. The same "Changed" line. |
| Customize Pip | Six small scenes under the team show the places Pip appears (sheets, lists, the Orbit, plans, the wand menu, empty lists). Pip is in a scene while that part is on. The team alone could not show these. |

## Removed because it was there twice, or only led elsewhere

Nothing a person can do was removed. Each line says where the same thing still is.

| Removed | From | Still at |
|---|---|---|
| "Essential setup" and "Settings health" boxes | the chapter rail | Settings Home (same rows, same count) |
| Rows Connection, Away from home, Work in progress, Last change, This device | Servers › Home & Location › Status | The facts line on the same tab; "Away from home" is the Away From Home tab |
| Rows Role and Address | Servers › a server's details | The line under the server's name |
| "Claim this server" (shown disabled), "Set up a new server", "Add another server", "Check this server" | Servers › a server › More options | The claim steps (when a server is not yours yet), "Add a server" on the list, "Test connection" on the server |
| "Full server backup › Open Backup & Restore" | Servers › a server › More options | The server's menu: "Back up this server…" |
| "Topology diagnostics" (counts of servers, devices, routes) | Servers › a server › More options | The tabs themselves; "Check server and devices" at the foot |
| The status card "Away from home" (Right now, Preferred when away) | Servers › Away From Home | The facts line in the one card |
| Link "Open Readiness & Doctor" | foot of Servers, Backup & Restore, App Updates | System › Readiness & Doctor |
| Link "Check every service" | foot of Providers | The button of the same name under the list, which now opens that same check (it used to open a general preview) |
| The switch "Switch accounts by themselves" and the fields Switch when, Warn when, Rest after | Providers › Services › This service | Limits & switching › Each service, on that service's line |
| Rows "Screenshots" and "Browser status" | Testing & Debug › What it can test | Source Control › Browser & SCM, where they are set |
| Row "Runs on" (a value, not a choice) | Source Control › Local Tools › a tool | Servers & Remote Access › Home & Location › Runs on |

## Renamed, because two different settings had one name

| Was | Is | Where |
|---|---|---|
| New chats start in (Regular / No pauses) | Pauses in new chats | Safety & Permissions › Profiles |
| Safety level (Strict / Standard / Relaxed) | Branch safety | Source Control › Defaults & Safety |

## Left alone on purpose

- **The centred tab strips and the side column with its scroll highlight.** Jared asked for both (2026-11-13, and
  again on 2026-11-20). A first pass of this work moved the tabs to the left and hid the side column on managers with
  tabs; stream F's own checks caught it and both are back exactly as PMConcept7 has them.

- Personas' model lines, tag input, details line and list filter; every "Same as the project" line; every model
  field; the Abilities "For the whole project" highlight; account-model persistence in the Models manager. Streams F
  and P are changing those.
- Browser & SCM › "Depends on": a check of stream F's kit names it.

## Stream F's checks that need a small change when this is merged

**Not yet run on the sixth pass.** It changes things stream F's checks are likely to read, to be run and listed here
before any merge: the chapter's tabs are inside `.rf-bar-track` (no longer children of `nav.workspace-tabs`) and stand
over the middle of the page, not of the strip (FO-184's own measure); Explain, the project button and the page options
are in that bar, and `.document-toolbar` is empty with no height; a chapter with one manager shows its bar, with the
name; every chapter's first page has no title of its own; a tab strip's box has another corner; the browser's page
has another name, four tabs and fifty more rows; New crew has a fifth step.

The table below is the second pass's, still true; what the third, fourth and fifth passes add is under it.

All 40 of stream F's Settings checks were run on 2026-11-21 against this build (on main `56f82e6dae`), and every one
that failed was run against the unchanged page the same way on the same computer. **27 pass.** Four fail on the
unchanged page too (`own-servers`, `servers-away-guide`, `settings-base-words`, `settings-safety-source`), so they
are not this work. The rest fail only here, each for a change made on purpose:

| Check | Why it fails here | What it should read instead |
|---|---|---|
| `servers-manager` (N-1) | It reads the "Role" row of a server | The line under the server's name, which says the role |
| `settings-look-editors` (B-16) | It expects the small docked copy of Pip's team | The team itself, which now stays in view |
| `settings-menus-customize` (N-4) | After "Update…" it looks for the server's menu on the same page | Servers is its own chapter, so "Update…" leaves it; go back first |
| `settings-providers-truth` (A2 B-3) | It reads the rail's health box | The count beside Settings Home |
| `settings-detail-values` | It opens Servers as `system/servers` and waits for the System chapter to be the open one | The chapter is `servers-access` |
| `settings-dialog-lines`, `settings-confirm-once` | Their walker presses every item of a server's menu; "Update…" and "Back up this server…" leave the Servers chapter, so its next tabs are not there | Open the chapter again after an item that leaves it |
| `settings-min-text` | It matches each page by the chapter's line in the rail, summary included; the rail now shows the name only, so none of its 2,730 saved pages is matched | The chapter names; and the Servers chapter |

Two things failed once and passed when run again: `settings-inspector-fit` (a notice hung over the button it
clicks; two more runs pass) and the Adjust NieR part of `settings-look-editors` in the sandbox view.

After the examples were made as wide as they were (the same day, later), the seven checks that touch the Customize
dialogs or the editor were run again on that build. `settings-sheet-in-view`, `editor-build-completion`,
`editor-build-input`, `editor-style-scope` and `look-menu-over-editor` pass. `settings-look-editors` and
`settings-menus-customize` fail only on the rows in the table above, and the second passes on the unchanged page.

**Not proven by stream F's kit on this build:** `settings-min-text`'s "no label wraps to more lines" comparison could
not run, for the reason in the table. What stands in for it: this work only removes text or leaves it as it is (no
size grows), nothing in the Settings styles is under 11 px, and at 740 and 860 px wide none of the 74 views has
anything spilling sideways, the same as the unchanged page (measured 2026-11-21).
