# Seven new Settings concepts — test report

Model folder: `Concepts/settings-redesign-concepts/Opus 5`  
Packet: `PM_Settings_Seven_New_Concepts_Bakeoff_2026-08-18`  
Date: 2026-08-18, extended 2026-08-19 with the deep-link, scrollspy and popup-family suite

This report covers concepts **05–11 only**. `TEST_REPORT.md` is the 2026-08-13 report for
concepts 01–04 and is unchanged.

## How these were tested

One long-lived headless Chromium (the Playwright 1234 build), driven over raw Chrome DevTools
Protocol, one tab per page, every page loaded over `file://`. The harness asserts **geometry,
focus and attributes on screen** — element boxes, scroll positions, `document.activeElement`,
the locator attribute — never dispatch counts. A probe that trusts a dispatch count passes
happily while the reader stares at a blank pane.

**Documented deviation from CONCEPT_RULES rule 9.** The rule asks for testing through the
shared Hub on an OS-assigned port. In this sandbox headless Chromium hangs on every `http://`
request, so a server-driven run reports a timeout as a concept failure. The pages are therefore
driven over `file://`, which is how the Hub also serves them from disk, and the Hub manifest —
the part that actually depends on the server — is validated separately by
`Concepts/ConceptHub/validate.py`. Every browser process was started by this run and closed by it;
the browser profile lived in a scratch directory outside the repository and was deleted.

## Matrix

Seven concepts × eight themes (Friendly, Glass, Retro, Basic — dark and light) × six widths
(760, 900, 1280, 1700, 2200, 2500). Each cell asserts: zero console errors, zero page errors, no
true horizontal overflow, no element escaping the app frame, no clipped label or control, and no
Activity Bar overlap of Settings content. Reduced motion is checked for state and control parity,
not for the absence of animation.

| Concept | Matrix cells | Search cases | Manager routes | Inventory indexed | Deep routes | States | Hydration |
|---|---|---|---|---|---|---|---|
| 05 Directory | 48/48 | 64/64 | 50/50 | 828/828 | 64/64 | 21/21 | 0 at load, 0 by search |
| 06 Editorial | 48/48 | 64/64 | 50/50 | 828/828 | 64/64 | 21/21 | 0 at load, 0 by search |
| 07 Compendium | 48/48 | 64/64 | 50/50 | 828/828 | 64/64 | 21/21 | 0 at load, 0 by search |
| 08 Broadside | 48/48 | 64/64 | 50/50 | 828/828 | 64/64 | 21/21 | 0 at load, 0 by search |
| 09 Codex | 48/48 | 64/64 | 50/50 | 828/828 | 64/64 | 21/21 | 0 at load, 0 by search |
| 10 Command | 48/48 | 64/64 | 50/50 | 828/828 | 64/64 | 21/21 | 0 at load, 0 by search |
| 11 Folio | 48/48 | 64/64 | 50/50 | 828/828 | 64/64 | 21/21 | 0 at load, 0 by search |

## Manager coverage

Coverage is computed by **building every manager spec inside the running concept** and reading the
surface it rendered, then written to `manager-coverage.json`. A family cannot be recorded as
demonstrated because someone typed the word into a file. `shared_grammar` appears nowhere.

| Concept | Families | Demonstrated | Deferred named owner | Missing |
|---|---|---|---|---|
| 05 Directory | 54 | 44 | 10 | 0 |
| 06 Editorial | 54 | 44 | 10 | 0 |
| 07 Compendium | 54 | 44 | 10 | 0 |
| 08 Broadside | 54 | 44 | 10 | 0 |
| 09 Codex | 54 | 44 | 10 | 0 |
| 10 Command | 54 | 44 | 10 | 0 |
| 11 Folio | 54 | 44 | 10 | 0 |

The ten deferred entries are the named owner modules the packet allows: Product Onboarding,
Installation / Deployment, Server Claim / Bootstrap, Servers / Execution Hosts / Clients, Project
Hosting & Files, Remote Access, Project Sync / Move, application and content updates, the full
Server backup flow, and Usage. Each has a reachable destination, a named owner, a stated reason
for being separate, a return contract, and no fabricated backend.

## Search exactness

Every case types a query into the concept's own field, reads the rendered dropdown, then clicks a
result **by its immutable id** — including one result that is not the first, so a concept that
only wires the top hit fails. The landing is then compared against
`PM2Index.byId(id).destination`: the exact domain, page, manager, object, section and row, the
focus target, and the locator highlight. Back must restore the query text.

Cases include grouped results, duplicate labels, typo matches (`notifcations` → Notifications),
unavailable results, manager objects, deep rows, and a query that matches nothing.

## Inventory and scale

All **828** canonical records from `Plans/settings_inventory.json` are indexed in every concept,
verified by resolving each id through the index. A deterministic spread of 64 rows per concept is
then deep-linked and asserted to be **on screen and focused**, not merely present in the DOM.

Separately, a provenance-marked synthetic fixture of 2,400 settings plus large installation, tool,
server and model rosters is switched on and the compendium re-measured. Synthetic records carry
`provenance: "scale-fixture"` and are off by default, so no screenshot can mistake volume for
product inventory.

| Concept | Records indexed at scale | Rows in the DOM | Search at scale |
|---|---|---|---|
| 05 Directory | 3665 | 27 | 55.4 ms |
| 06 Editorial | 3665 | 64 | 50.2 ms |
| 07 Compendium | 3665 | 28 | 51.2 ms |
| 08 Broadside | 3665 | 21 | 52.3 ms |
| 09 Codex | 3665 | 23 | 53.8 ms |
| 10 Command | 3665 | 26 | 40.6 ms |
| 11 Folio | 3665 | 25 | 53.6 ms |

## Deep links, scrollspy and the popup family

Added after a re-read of the authority found twelve named behaviours the build did not
have while all nine existing suites were green (`SEVEN_NEW_CONCEPTS_FINDINGS.md` §1c).
Every check here exists because the suites beside it asserted that a page *rendered*
and never that the reader *arrived*.

| Concept | every manager object is routable | a section-level deep link lands on its group | a roster drill-down does not land on a not-found page | scrolling moves the navigation highlight | a submenu opens beside its parent and Escape closes one layer | retro themes snap the popup menus too | Escape closes the menu, then steps one Settings level at a time to Home | no console errors across the suite |
|---|---|---|---|---|---|---|---|---|
| 05 Directory | pass | pass | pass | pass | pass | pass | pass | pass |
| 06 Editorial | pass | pass | pass | pass | pass | pass | pass | pass |
| 07 Compendium | pass | pass | pass | pass | pass | pass | pass | pass |
| 08 Broadside | pass | pass | pass | pass | pass | pass | pass | pass |
| 09 Codex | pass | pass | pass | pass | pass | pass | pass | pass |
| 10 Command | pass | pass | pass | pass | pass | pass | pass | pass |
| 11 Folio | pass | pass | pass | pass | pass | pass | pass | pass |

The first column is the one that matters most: 786 roster items, 0 unroutable in every concept.
Before this pass, 633 of 786 manager roster items could not be reached by a link, and
eleven of twenty-eight sampled drill-downs landed on a not-found page.

The remaining columns assert, in order: that a section-level link puts its group on
screen with the arrival marker on it; that clicking a roster object from inside a
manager keeps the reader in that manager; that scrolling moves the navigation
highlight without a click; that a submenu opens beside its parent, fully in view, with
the first Escape closing it and leaving the parent menu standing; that the retro themes
snap the menus, which live on `document.body` outside every concept's root-scoped snap
rule and measured 0.12s before this pass; that a real Escape keypress closes the menu
without also stepping the route and then walks outward one Settings level at a time —
row, page, domain, Home — stopping at Home with Settings still open; and that none of
it logs a console error.

## Text fixtures

`long-label` and `long-explanation` are separate fixtures because a clipped name and a
clipped sentence are separate defects with separate fixes. Each stretches only its own
field, to the length a German or Finnish localisation reaches.

Both were run across all seven concepts at four themes × two widths (760 and 1280),
measuring `scrollWidth` against `clientWidth` on every text node. The only text that
truncates anywhere is concept 10's `cs-row-desc` — the one-line subtitle in its compact
index, whose full text sits in the editor directly beneath the row. Identity text wraps
everywhere. Concept 10's row *title* truncated at 760 until this pass; the fixture is
what found it.

## Original-concept regression

| Original | Loads clean | Nodes | Manager route |
|---|---|---|---|
| opus-5-atlas | yes | 629 | 687 nodes |
| opus-5-console | yes | 571 | 501 nodes |
| opus-5-stack | yes | 399 | 1713 nodes |
| opus-5-ledger | yes | 632 | 491 nodes |

`shared/**`, the four original pages and `concepts/**` are byte-identical to their committed state;
`git status --porcelain` over those paths prints nothing. Everything new lives in `shared2/`,
`tools/` and the seven new concept directories, so no change to the new work can reach the old.

## What was deleted

Browser profiles, per-suite JSON, failure screenshots and scratch scripts were written to a
scratch directory outside the repository and removed. What remains in the folder is the concept
code, the per-concept evidence, these reports, and the tools that regenerate them.
