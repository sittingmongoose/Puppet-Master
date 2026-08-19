# Seven new Settings concepts — findings

Model folder: `Concepts/settings-redesign-concepts/Opus 5`
Packet: `PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18`
Date: 2026-08-18, extended 2026-08-19 (section 1c)

This is the honest account of what went wrong, what is still wrong, and what was
deliberately not done. `FINDINGS.md` is the 2026-08-13 report for concepts 01–04 and is
unchanged.

---

## 1. Defects found and fixed during this pass

All of these were found by running the work, not by reading it. Each is recorded because
a report that only lists successes is not evidence of anything.

### 1.1 The copy preview counted nothing into the right bucket

`pm2-copy.js` derived its counter name from the outcome word — `"unchanged" + "s"`
produced `unchangeds`, a key nothing read. The preview therefore reported **zero
additions** on a transaction that genuinely had them. Fixed with an explicit
outcome → counter map. Verified: a full twelve-area copy from *Customer Support Bot*
now previews 28 additions, 107 replacements, 620 unchanged, 10 re-pointed account
references, 29 unavailable and 34 policy conflicts, applies 145 values atomically, and
rolls back to exactly zero changed values.

### 1.2 Search returned results a reader could not tell apart

Several scale-fixture installations share a label (`ImageMagick`, `uv`) *and* a path,
so the dropdown showed four identical-looking rows. Distinct ids are enough to route
correctly, but not enough to **choose**. `pm2-index.js` now runs a collision pass after
the index is built: any label+path collision gains a distinguishing detail drawn from
the record itself — version, host, path, then its own identifier — and never a counter.

### 1.3 The provider manager advertised a subpage that did not exist

`pm2-managers-extra.js` described *Installations* as a subpage and gave it a status
line, but never listed the installations. The search index, reading `PMData.installations`
directly, produced a result per installation whose destination had **no row to land on** —
a broken deep link for every detected installation. The provider spec now carries the real
installation rows, with human identity first (command, host, version) and resolved
launcher, real path, owner and architecture as advanced detail, per the provider CLI
adjudication.

### 1.4 Typing in the search field threw the caret away

Every concept writes the query into the route so Back can restore it. The route write
notifies subscribers, the subscriber re-rendered, and the re-render rebuilt the input
under the cursor — measurably moving focus to `BODY` after one keystroke. Each concept
now suppresses its own render for bookkeeping writes. This is recorded in
`shared2/CONCEPT_BRIEF.md` so it cannot be rediscovered a seventh time.

### 1.5 The arrival scroll ran after the measurement

A smoothed scroll, and `scrollIntoView`, both left the destination row off-screen at the
moment the reveal was checked — and `scrollIntoView` additionally scrolled the *window*,
sliding the shell out from under the reader. Arrival scrolling is now instant and
container-scoped in every concept. The locator highlight carries the explanation instead.

### 1.6 Two demo-state controls on every page

The PM shell ships its own `Demo state` select, wired to `window.PMData.demoStates` —
the fixture list belonging to concepts 01–04 — and a Reset that clears a storage
namespace these concepts do not own. Alongside each concept's own control it offered
situations the page does not implement. `PM2States.removeShellControl()` now detaches
the stale pair after mount. Nothing in `shared/` was modified; only live nodes are
detached.

### 1.7 Navigation labels that could not be read

Concept 07's left nav and concept 09's right-edge tab strip were ellipsising their area
names — `AI Brains & Provid…`, `Planning & Verificat…`, `Skills, Plugins & Co…`. The
harness missed both because its clipping probe only scans inside the Settings surface and
these rails sit outside it. Both now wrap. A navigation label that cannot be read is not
navigation.

### 1.8 An All Settings that threw on every paint

Concept 05's compendium was written against a `PM2Index.all()` that returns `records`
with object-keyed facets. It returns `rows`, and its facets are ordered
`{ id, label, count }` arrays. The compendium threw on every paint and rendered nothing.

It passed the performance suite anyway, which is the more interesting half of this
finding — see 1.10.

### 1.9 Two surfaces that were never built

Concept 10's `renderAll` and `renderCopy` were one-line stubs — the exact step its
builder was terminated at. All Settings and the Copy transaction are both required of
every concept. Implemented in that concept's own idiom: a facet-chip strip over a
windowed 32px table, and four transactional panels ending in a receipt with rollback.

### 1.10 A performance probe that proved nothing

The suite counted `[data-pm-row]` to check that the compendium was virtualized. Five of
the seven concepts mark compendium rows with `[data-pm-result]` instead, so the probe
read **zero rows** and scored it as perfect virtualization — while concept 05 was
throwing and concept 10 had no compendium at all. The check now counts both markers and
requires the list to be non-empty *and* bounded. Every concept now reports between 19
and 64 rows in the document against 3,665 indexed records.

A probe that cannot fail is not evidence. This one had been reporting a pass for two
genuinely broken surfaces.

### 1.11 A surface marker on the whole application

Concept 06 set `data-pm-surface` on its outermost element, so every node and character
count taken of a manager included the navigation rail. It also made the audit's
drill-down click land on the rail's "Skills, Plugins & Commands" instead of the
manager's own "Skills" section. The marker now sits on the content sheet.

### 1.12 A manager check that was too weak, then too strong

Worth recording as three iterations, because the middle one was wrong in a way that
looked right:

1. **nodes and text** — a page with only a manager's title and purpose passed. Concept
   10 scored a false 50/50 while rendering no manager content at all.
2. **the spec's item names must appear** — too strong. Concept 06 legitimately lands on
   the manager's *contents* and holds each section one click in, which is the
   sub-navigation-inside-the-sheet design it was asked for. It scored a false 19/50.
3. **items, or section headings plus a drill-down that works** — the audit clicks
   through the way a reader would and the items must then appear. A first attempt
   clicked the *first* section, which is often an empty preference block and proved
   nothing; it now opens the richest section.

### 1.13 A harness check that was wrong

The static suite flagged an emoji in concept 08. It was `→`, in a from/to diff. The
regex included the arrows block (U+2190–21FF), which is typography. Narrowed to the
pictographic blocks, the regional indicators and the emoji variation selector, then
re-verified against real emoji, arrows and tick marks. **The concept was right and the
check was wrong** — recorded because a harness is only as trustworthy as its last
false positive.

---

## 1b. The visual pass — what only looking could find

Everything in section 1 was found by running the work. This section was found by
**looking at it**, after the structural suites were already green. That distinction is
the point: none of the following would ever have failed a test.

### 1b.1 The flagship manager showed the wrong subject

Concept 05's provider manager rendered the **installations** roster instead of the
**providers** roster, so the detail sheet was titled with a raw executable path —
`/Users/jared/.npm-global/bin/claude` — which is precisely what the provider CLI
adjudication says must never be the normal identity. Cause: `pickRoster()` chose the
*largest* list section. A manager's sections are written in importance order, so the
first is the subject; the rule now takes the first, and also considers `cards` sections,
which it had been skipping entirely. The manager now leads with Claude, OpenAI, Ollama
and answers connected state, selected account, models, usage-end behaviour and routing.

### 1b.2 A CSS reset outranked every component it reset

Five concepts carried `.<root> button { color: inherit }`. As a descendant selector that
scores (0,1,1) and **beats** every single-class modifier — so `.c7-btn--primary` lost its
own colour and painted pale text on the pale accent fill at **1.34:1** in Retro Dark.
Rewritten as `:where(.root) :where(button)`, which carries zero specificity. A reset must
never outrank the components it resets.

### 1b.3 White-on-white action links

Concept 11 used `--pm-accent-text` — the colour for text drawn *on* an accent fill — as a
standalone link colour. In every light theme "Fix", "Rebuild", "Open", "Why this value?"
and the chosen-category tick were invisible; the selected roster name measured **1.2:1**.

### 1b.4 A path column that told you nothing

Concepts 07 and 10 truncated the compendium's path from the **left**, so all 1,265 rows
read `AI Brains & Providers › Accou…`. The end of a path is the part that differs; both
now show the last two steps, with the full path on hover.

### 1b.5 Identity text cut mid-word

A provider named `Open…`, a status cut by 14px, breadcrumbs losing their own steps, pane
titles and destination names clipped. Roster *subtitles* truncating to one line is a
defensible pattern; identity and orientation text is not. Found by measuring
`scrollWidth` against `clientWidth` on every ellipsised leaf node rather than by eye,
after fixing the same class of defect twice by guesswork.

### 1b.6 Internal vocabulary on screen

Concept 06 printed the raw archetype contract word — "Resource roster and detail sheet" —
as a UI label, and concept 08 as a sentence. Both now map through a humaniser.

### 1b.7 Composition flaws

Concept 10's four-stat grid ran three across and left a dangling empty cell at narrow
widths; it now divides evenly, two then four. Concept 08's compendium panels were capped
at a literal 560px, wasting ~800px on a tall display and making the facet list *read* as
cut at its second heading even though it scrolled; they now fill the window. Concept 11's
scrolled tab rail cut a word against a hard border with no affordance; it now carries an
edge mask, and its breadcrumb no longer wraps to three lines.

### 1b.7b Fixed pixel ceilings on three compendiums

Concepts 05, 08 and 09 capped their All Settings list at a literal 560-660px. On a tall
display that left most of the page empty under a list of 1,265 records, and in concept
08 it also made the facet column *read* as cut at its second heading. All three now scale
with the window: 37, 28 and 32 rows respectively instead of 27, 19 and 23, still
virtualized against roughly 55,000px of scroll content.

Worth naming as a pattern: **every one of these passed the performance suite**, because
"few rows in the DOM" is precisely what correct virtualization looks like. The test could
not tell *correctly windowed* from *needlessly small*, and only looking at the page could.

### 1b.7c Concept 10's copy flow, rebuilt after seeing it

The weakest surface in the folder, and mine. Driving it through its steps rather than
deep-linking to its entry point showed three failures at once:

- **Step 2 had no affordance.** Twelve selectable areas rendered as centred plain text
  with counts — no checkbox, no border, no selected state, and all twelve were already
  selected with nothing on screen saying so. Cause: I reused `.cs-chip`, which in this
  concept styles *breadcrumb* chips. Rebuilt as a two-column grid of real checkboxes
  with each area's purpose and count, a live "12 of 12 areas selected · 828 records in
  range" heading, and select-all / clear-all.
- **Step 3 overflowed its own container.** The diff table's wrapper never applied its
  overflow, so the "What is not copied" block and the action buttons were painted *on
  top of* the rows. The table now has its own declared scroller.
- **Step 3's names were unreadable.** "Reduce A…", "Corner R…", "Notifi…" — two thirds of
  each row went to the values and the setting's own name was cut. Name and path now
  stack, and the name is never truncated.
- The five preview counts sat in a four-across grid, orphaning "Cannot be copied" beside
  three empty cells; they are now a wrapping row of facts.

Recorded because it is the clearest example of the general lesson: this surface passed
every structural suite in every one of these states.

### 1b.8 Motion — what I got wrong about it

I first judged motion by counting `transition:` declarations and concluded it was thin.
That measurement was wrong: most concepts animate with **keyframes**. Every concept's
stated metaphor is in fact implemented — 07 cross-fades facets in place while the detail
pushes from the right, 08 scale-and-settles, 09 staggers a three-step reveal at 90ms and
220ms, 10 runs a 160ms pane cascade with the leftmost pane pinned, 11 cross-slides sheets
at 190ms while the tabs hold still. No easing anywhere overshoots, which the measured
Puppet Master motion canon forbids, and reduced motion is genuinely wired through
`--pm-motion-transform: 0`.

The one canon rule none of them implemented was **Retro themes snap rather than ease**.
That is now in all seven. It is an *interpretation*: the canon records that rule for
PM7's tab motion, and applying it to Settings is a judgement that Retro should be its own
material rather than a recoloured Friendly. Flagged as a decision, not a measurement.

### 1b.9 A contrast finding that is not a concept defect

`--pm-text-3` measures about **3.4:1** against its own surfaces in Basic Dark and
Friendly Light — below 4.5:1 for the informative counts and secondary lines that use it.
The PM shell's own labels fail the same check, so this is a **theme-token finding for the
product**, not something to fix by diverging from the tokens. Recorded here rather than
patched around.

---

## 1c. The packet re-read — behaviours the authorities name that the build did not have

Sections 1 and 1b came from testing and from looking. This one came from reading the
authority files again, line by line, against what was on screen. Everything here is a
requirement written down in the packet that the build did not meet, found by re-reading
rather than by any check I had already written — which is the point worth keeping: my
harness was green through all of it. Twelve named requirements were unmet. The tenth
suite (`deeplinks`) was written afterwards so that none of them can go quiet again.

### 1c.1 A deep link to a manager's object landed on a not-found page

The worst defect in the build, and the one no suite caught.

Clicking a provider inside the provider manager wrote
`#/m/manager-providers/prov-claude`, and the router answered *"That link points
somewhere this Project does not have."* Eleven of twenty-eight sampled
concept × manager drill-downs ended on that page. A full crawl of every roster item in
every manager put it at **633 of 786 objects unroutable**.

Two causes, both mine:

1. **Two vocabularies for one object.** `shared2/pm2-managers-extra.js` minted roster ids
   as `"prov-" + p.id` while `shared2/pm2-index.js` indexed the same provider under
   `p.id`. Search routed to `claude` and worked; the manager's own row routed to
   `prov-claude` and did not. Three concepts had already noticed and written private
   workarounds — concept 08 even has a comment explaining the mismatch — which is how a
   defect survives: locally patched, never traced.
2. **"Cannot verify" was reported as "does not exist."** `PM2Route` asked
   `PM2Index.objectExists`, and the index only carries objects worth a *search result*.
   A subpage card or an acquisition-mode card is a real thing a reader can click and no
   kind of search hit, so every one of them failed validation.

Fixed by naming one object one way — the roster now uses the provider's own id — and by
letting a built spec tell the index what it contains
(`PM2Managers.spec` → `PM2Index.registerObjects`). That runs only *because* a manager was
already hydrated, so it never becomes a reason to hydrate one. Verified: 786 of 786
roster items routable, and all seven concepts' drill-downs land.

### 1c.2 A section-level deep link stopped at the top of the page

`01_CORE_ARCHITECTURE.md:60` — "The requested subcategory/setting/manager scrolls into
view." Setting links worked. Section links did not: every concept's reveal read
`route.settingId` then `route.objectId` and stopped. A link to
`#/d/general/general.visual/general.visual.s03` left "Chat layout" between 1,518 and
2,285 pixels below the fold in six of the seven, unmarked.

Fixed in each concept's own reveal, plus the destination branch, plus a
`[data-pm-section]` step in the node lookup.

### 1c.3 Scrolling did not move the navigation highlight

`01_CORE_ARCHITECTURE.md:61` — "Scrolling updates the active left-nav subcategory", and
the navigation video description is blunter: the highlight changes *without requiring a
click*. Every concept had the click direction and none had the scroll direction. A page
index that only answers clicks tells the reader where they asked to go, never where they
are.

`shared2/pm2-spy.js` binds the frozen, headless `shared/pm-sections.js` and each concept
paints the result in its own idiom. Two things had to be got right afterwards:

- **The scroller is not always the first ancestor with an overflow rule.** A concept may
  declare `overflow:auto` on a wrapper whose *child* is the one that grows. `scrollerFor`
  now takes the first ancestor that both permits scrolling and actually overflows.
- **A jump must beat the measurement.** After a controlled jump, the raw measurement is
  wrong in two ways: a concept that centres the target leaves the *previous* section
  across the anchor line, and a jump near the foot of a short page clamps at the bottom
  so the *last* section is across it. Concept 05 highlighted "Theme" and concept 10
  highlighted "Padding scale" for a link that asked for "Chat layout". `PM2Spy.pin`
  holds the highlight on what was asked for and releases it on the reader's own wheel,
  touch or scroll key — never on a programmatic scroll, which is what an arrival is.

### 1c.4 Concept 10 had no continuous document to scroll

The same authority line describes the right side as "a continuous document of that
category's subcategories". Concept 10's cascade put one group in the rightmost pane, so
there was no crossing into a later section to detect — it was the only concept that could
not satisfy item 4 by binding a spy, because it had nothing to bind one to.

Its settings pane now holds the whole page, and the group list in the pane to its left is
the left-nav that scrolling updates. Clicking a group is still a controlled jump into the
document. The cascade and the authority turned out to be the same design; they were just
not built that way.

### 1c.5 Popup menus had no submenus

`07_THEME_MOTION_RESPONSIVE_AND_SLINT.md:19` asks for the Model/Mode selector family
"including collision handling, layering, submenus, and open/close behavior". Placement,
flipping, layering and Escape were there. Submenus were not — `PM2Menu` had supported
`entry.parent` since it was written and nothing ever passed one.

Added `PM2Menu.placeSide` (opens beside the panel, flips at the right edge, clamps
vertically) and `PM2Menu.groupsFor`, a short explicit table of the two option lists that
genuinely have two levels: the eight themes by family, and the eleven providers by how
each is reached. The table refuses to group at all if any option falls outside it, so a
provider added later gets an honest flat list rather than an invented category. All seven
concepts open a submenu beside its parent, in view, with Escape closing the second level
and leaving the first standing.

### 1c.6 Notices were one toned list, not three groups

`01_CORE_ARCHITECTURE.md:33-41` names three: `Needs attention`, `Continue setup`,
`Recommended`. Every concept drew one list with a tone dot, which makes an unfinished
setup look like a fault. `PM2States.attentionGroups` / `attentionFlat` supply the runs;
each concept draws the labels in its own typography, and concept 10's "needs attention"
count on the At a glance panel now counts only the first group so the number stays true.

### 1c.7 Retro themes did not snap the popups

Every concept scopes its retro snap to its own root — and menus are appended to
`document.body`, outside it. Measured: `animationDuration: 0.12s` on the menu panel in
all seven concepts under `retro-dark`. A retro theme that fades its popups is not a retro
theme. The snap rule now names the menu classes explicitly. Reduced motion was never
affected: that rule is global in `shared/pm-themes.css` and reaches body-level nodes.

### 1c.8 Menus were see-through in the glass themes

Found only by opening a submenu in `glass-light` and reading the page text through it.
`--pm-surface-2` is `rgba(248, 250, 255, .68)` in the glass palettes and the concepts'
menus set no backdrop filter, so the rail behind the panel showed through the rows. PM's
own popup solves this at `shared/pm-shell.css:563` with `backdrop-filter:
var(--pm-surface-blur)`, which is `none` in the six non-glass themes. Applied the same
way. The open-submenu parent also needed an inset hairline: glass puts `surface-3` within
a few percent of `surface-2`, so a background change alone was invisible there.

### 1c.9 The two long-text fixtures were one

`08_CONCEPT_COVERAGE_AND_FIXTURES.md` lists "Long explanation" and "Long localized label"
separately, and they are separate defects with separate fixes — one clips the name, the
other the sentence. Split into `long-label` and `long-explanation`, each stretching only
its own field. Under both, at four themes × two widths, the only text that truncates
anywhere in the seven concepts is concept 10's `cs-row-desc`: the subtitle in its compact
index, whose full text is in the editor beneath. Concept 10's *row title* did truncate
until this pass, which is exactly the defect the fixture exists to expose.

### 1c.9b The continuous-document change broke concept 10's search arrival

Worth recording because it is the counter-example to everything above. Making concept
10's settings pane hold the whole page (§1c.4) added a deferred jump that cleared the
arrival marker the concept's own reveal had just set — so a search result landed on the
right row, focused, with the right breadcrumb, and no highlight. The **existing** search
suite caught it immediately: 19 of 64 in concept 10, green in the other six.

That suite asserts the locator attribute is on the row the result named, which is the
kind of assertion the other suites were missing. The fix splits ownership: when a link
names a row, the row reveal owns the scroll and the marker and the page document only
holds the navigation on the group that contains it; when a link names a group, the
document owns both.

### 1c.10 A fixture the packet lists that this build answers differently

`08_CONCEPT_COVERAGE_AND_FIXTURES.md` lists `Inherited` among the general fixtures. The
2026-08-18 packet forbids inheritance outright — no scope selector, no inherited values,
no linked Projects. The August 8 fixture list is superseded on this point and there is no
`Inherited` fixture here; what replaces it is the requested/effective distinction
(provider fixture 16), where a Project asked for one thing and something else is in
effect, with the reason named. That is a fact about *this* Project, not a scope.

---

### 1c.10b Concept 10's table gave the setting's name away last

The continuous document (§1c.4) put a whole page in a pane that had been holding one
group, and the compact table's `table-layout: fixed` subtracts its 208px value column
and 136px status column from the **name** column first. At three panes that left the
name roughly 26px — "Gla", "Ret", "UI S" — and the fix I had already applied to let the
title wrap made it worse: `overflow-wrap: break-word` puts the title's min-content width
at zero, so flex shrank it to nothing and the name painted on top of the explanation
beside it.

Four changes, all in the same direction — the column that says what a row *is* is the
last one to give way:

- the settings pane is the wide one in the cascade, because it is the one being read;
- the value and status columns are 190px and 124px, not 208 and 136;
- the name cell opts out of the table's `nowrap`, the row height became a minimum
  rather than a fixed 32px, and the title keeps a floor of eight characters so it can
  never be shrunk to nothing;
- the inline explanation is drawn only at four panes. Below that it had room for two or
  three characters — "Wh…", "H…", "C…" — which is noise, not a subtitle. It is never the
  only copy of that text: the full sentence is in the editor beneath the row.

Found by looking at a screenshot, not by any check. The clipping probe reported the page
clean throughout, because nothing was clipped: the text was drawn, at the wrong size, on
top of other text.

### 1c.11 One Escape did two things, and the wrong number of levels

`03_HOME_SEARCH_AND_NAVIGATION.md` § Location and exit gives Escape a four-step order:
close the popup, close the detail drawer, move **one** Settings level outward, and stop
at Settings Home rather than closing Settings. Two halves of it were wrong.

**One keypress, two actions.** `pm2-menu.js` called `e.stopPropagation()` precisely so
the concept's own Escape handler would not also step the route. It did not work, and the
reason is worth stating: every concept registers its handler on `document` in the capture
phase — the same node and the same phase as the menu's — and `stopPropagation` only stops
the event reaching the *next* node in the path. A listener already attached to the same
node still runs. In six of seven concepts a single Escape closed the theme menu **and**
navigated away from the row the reader was editing. `stopImmediatePropagation` is what
that comment always meant.

**Three levels, not one.** From `#/d/general/general.visual/general.visual.s01/general.visual.theme`
six concepts stepped straight to `#/d/general`, skipping the page the reader had been
reading. `backTarget` had no case for a route deeper than a page, so it fell through to
the domain — and because the same function names the visible *Back to …* control, the
label was wrong in the same way. All seven now walk row → page → domain → Home and stop
there with Settings still open.

Both are asserted per concept by the eighth check in the deep-links suite, which presses
Escape for real and records the route after each press.

### 1c.12 Needs attention held one item, not two to four

`03_HOME_SEARCH_AND_NAVIGATION.md` § Settings Home asks for "a compact `Needs attention`
list with normally two to four unresolved items". Splitting the notices into the three
required groups (§1c.6) exposed that the demo data had toned a non-responding MCP server
and a six-day-stale search index as *setup* — so `Needs attention` was left holding a
single item while `Continue setup` held three. Neither of those is half-finished setup;
both are things that are not working. Retoned, and Home now reads 3 / 1 / 1.

## 2. Known limitations

### 2.1 The ConceptHub server route is not used to drive the pages

`CONCEPT_RULES` rule 9 asks for testing through the shared Hub on an OS-assigned port.
In this sandbox headless Chromium hangs on every `http://` request, so a server-driven
run reports a timeout as a concept failure. The pages are driven over `file://` instead —
which is also how the Hub serves them from disk — and the Hub manifest, the part that
actually depends on the server, is validated by `Concepts/ConceptHub/validate.py`. This
is a deviation from the letter of rule 9 and is stated rather than hidden.

### 2.2 Section grouping is derived, not canonical

The inventory has 12 categories and 36 subgroups, but one subgroup holds 75 records. A
75-row page is not a readable page, so the generator cuts each subgroup into 180 sections
of four to eight adjacent related rows, naming each from words its own rows already use.
**73% of section headings find a genuine shared subject**; the remaining 27% fall back to
naming the page ("More execution environment"). That grouping is a projection this pass
invented and every concept shares it — if two surfaces ever derive it differently they
will disagree. Recorded in each `impact-register.json` as a candidate schema impact:
the section id should become canon.

### 2.3 The exposure ladder is inferred

The inventory carries two tiers, `simple` and `advanced`. Four levels are needed to keep
a diagnostic switch out of an ordinary page, so `standard | advanced | expert |
diagnostic` is inferred from the tier plus the record id. That inference is a guess about
21 `expert` and 16 `diagnostic` records. It should be explicit in the schema.

### 2.4 Demo state is seeded, not real

Every row's state — default, changed, recommended, automatic, not set, managed,
unavailable — is derived from a hash of its own id. It is stable and reproducible, and
the distribution is realistic, but it is not what any real Project contains. The same is
true of the copy preview's diff: which values differ between two Projects is seeded from
`(sourceId, settingId)`.

### 2.5 Simulated operations

No page here can sign in, install a CLI, reach a provider or touch a filesystem. Every
operation returns a dated receipt naming the call a production build would invoke and
marks itself simulated. Nothing pretends to have succeeded at something it did not do.

### 2.6 Coverage counts what was built, not how well

`manager-coverage.json` proves that each of the 54 destinations renders a real surface
with real sections and items in that concept's own layout. It does not — and cannot —
assert that every manager is designed as well as the provider manager, which is the one
surface each concept builds bespoke.

### 2.7 Per-concept limitations reported by their builders

- **06 Editorial** — the rail collapses below an inner width of 820px, so at app width
  900 (one of the six tested widths) the concept is already in its push-stack mode. That
  is a deliberate breakpoint: a 208px rail plus a 72-character measure needs ~830px. A
  reviewer expecting a rail at 900 will not see one. Its All Settings filter commits on
  Enter or blur rather than per keystroke, to keep facet counts and list in step.
- **07 Compendium** — its builder was terminated before it finished a pass on how deeply
  each fixture reaches into manager specs. Manager specs *are* decorated by
  `PM2States.decorate`, and all 21 fixtures change the page, but the depth of that change
  varies between fixtures.
- **10 Command** — its All Settings and Copy transaction were completed by hand after its
  builder was terminated. They are functionally complete and pass every suite, but they
  had less design iteration than the rest of that concept. Its settings pane was rebuilt
  late (§1c.4) from one-group-per-pane to a continuous page document, which is the change
  that let it satisfy the workspace behaviour the other six already did; the pane's
  typography has had one pass since, not several.

### 2.7b The popup menu is deliberately the same control in all seven

`07_THEME_MOTION_RESPONSIVE_AND_SLINT.md:19` asks the concepts to use *the* Puppet Master
Model/Mode selector family, so the menu's structure — trigger, panel, roving focus,
submenu beside its parent, Escape one layer at a time — is identical across the seven and
only the tokens, radius, shadow and entrance distance differ. That is intentional and it
is the one visible control here that is not concept-native, because a product-wide
selector that changed shape per concept would be a different product each time. Every
other visible surface — Home, navigation, workspace, search dropdown, managers, motion —
is written per concept.

### 2.8 Four builders were terminated mid-task

Concepts 07, 08, 09, 10 and 11 all had their builders killed by a usage limit before they
finished. Every one of them had been saving after each step, so the work survived and the
gaps were visible rather than silent — but it means five of the seven concepts had less
polish applied than their authors intended. The harness result is the same for all seven;
the amount of hand-finishing behind them is not.

---

## 3. What was deliberately not done

- **Concepts 01–04 were not repaired.** The packet freezes them. They still contain
  behaviour this packet supersedes — collective coverage, `shared_grammar`, inherited
  state vocabulary — and that is left visible as historical evidence.
- **No winner was selected.** The seven are seven answers to one brief.
- **Canon was not edited.** No change to PMConcept7, Plans, the settings inventory or
  schema, the Command Catalog, the Wiring Matrix, DRY owners, Usage, Assistant Chat,
  ConceptHub, or any other model folder. Every proposed id is a candidate.
- **`shared/**` was not modified.** Concepts 01–04 keep their own layer untouched; all
  new work lives in `shared2/`. This was chosen over editing shared code precisely so
  that "the originals did not regress" is a fact about the filesystem rather than a claim.
