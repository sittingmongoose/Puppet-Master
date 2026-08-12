# Opus 5 — Puppet Master Settings bakeoff

Four genuinely different Settings directions, built against the final cumulative packet
`PM_Settings_Bakeoff_Final_Cumulative_2026-08-08`. Every concept is a standalone page that runs from
disk, from the ConceptHub server, or inside the Hub's iframe. No build step, no framework, no network.

**No concept is recommended over another.** They are four answers to the same brief, built to be
compared side by side.

## The four concepts

| Concept | Thesis | Navigation shape | Manager families built here |
|---|---|---|---|
| [Atlas](opus-5-atlas.html) | Settings is a **place** | Destination directory, persistent outline, managers are rooms | Context, Memory, Personas, Goal, Crew, Permissions/FileSafe, Back Seat Driver |
| [Console](opus-5-console.html) | Settings is a **question** | The search field is the application; places are a numbered contents page | Notifications, Sounds, Appearance, Spellcheck/Dictionaries, Desktop/Tray, Teacher |
| [Stack](opus-5-stack.html) | Settings is a **route** | Pushed columns with kinetic depth | Files, Terminal, LSP, Formatters, Commands, MCP, Skills, Plugins, Tools, Testing |
| [Ledger](opus-5-ledger.html) | Settings is a **record** | State-of-record home, ledger rows, edge mini-map | Storage, Backup, Lifecycle, History, Artifacts, Source control, Actions, Containers, Web, Index, Cleanup, Server shell, Media |

Every concept also builds the **provider / account / model / installation** surface in its own idiom —
that is the one manager the four designs are meant to disagree about — plus the **Usage** boundary card,
which exists so that no concept quietly reimplements Usage inside Settings.

[**Open the folder index**](index.html) to see all four side by side with shared theme and width controls.

## Folder layout

```text
index.html                     side-by-side comparison of all four
opus-5-<slug>.html             the four concept pages
concept-hub.json               Hub manifest (four entries plus the index workspace)
IMPACT_REGISTER.json           rollup across the four concept registers
README.md  TEST_REPORT.md  FINDINGS.md

concepts/<slug>/
  concept.js  concept.css      the concept itself
  impact-register.json         plan-owner, inventory, schema, command, wiring and DRY impacts
  manager-coverage.json        every required family with its classification and evidence
  candidate-command-delta.json every action the concept invokes, adjudicated against the packet
  candidate-wiring-delta.json  route grammar, state keys, receipt and notification wiring
  candidate-dry-delta.json     the DRY component roles and where they actually live
  plan-owner-delta.md          what this concept's shape pressed on, in prose

shared/
  pm-themes.css                8 themes (4 families x light/dark) plus reduced motion
  pm-shell.css  pm-shell.js    the quiet PM shell: bars, rail, panel, review strip, notification inbox
  pm-store.js                  observable store; semantic state only, never layout
  pm-route.js                  hash deep-link grammar, back and forward
  pm-data.js                   the frozen demo dataset (categories, settings, providers, managers)
  pm-data-install.js           provider installation, authentication and update fixtures
  pm-data-taxonomy.js          taxonomy entry points for the manager families
  pm-data-agents.js            agent-domain manager builders (Atlas's families)
  pm-data-desktop.js           desktop-domain manager builders (Console's families)
  pm-data-dev.js               developer-tooling manager builders (Stack's families)
  pm-data-system.js            system and resource manager builders (Ledger's families)
  pm-data-seal.js              freezes window.PMData once every domain module has contributed
  pm-manager-kit.js            the ManagerSpec contract every manager renders through
  pm-semantics.js              the status vocabulary; one file owns the words
  pm-search.js                 fuzzy index across categories, settings, managers, actions and statuses
  pm-sections.js               scrollspy and deep-link jumps, measured at explicit checkpoints
  pm-sim.js                    seeded simulation; every operation returns a dated receipt
  pm-icons.js                  87 SVG glyphs; there is no emoji in any implementation file
  pm-spellcheck.js             the spellchecker used by text inputs
  concept-hub-bridge.js        Hub protocol bridge (theme, reduced motion, test width)
```

## How to read a concept

1. **Start at the home screen.** Each concept answers "where do I start" differently on purpose.
2. **Search for something you only half remember** — try `notifcations`, `half-life`, `podman`, or a
   filter token like `scope:project`. The index carries 416 records across nine kinds.
3. **Open a manager.** Every assigned manager renders through that concept's single ManagerSpec path,
   so the difference you see is the design, not one screen that got more attention than another.
4. **Change the demo state** in the review strip (normal / attention / loading / calm). The demo state
   travels in the deep link, so you can hand someone an exact screen.
5. **Press something.** Operations that cannot really happen in a standalone page return a dated
   *Simulated* receipt naming the call a production build would make, and every receipt lands in the
   title-bar notification inbox. Nothing pretends to have signed in, installed a CLI, spent money or
   contacted a provider.

## What is real and what is simulated

Real: navigation, deep links, back and forward, search and filtering, value changes and their
persistence, exposure filtering, notice dismissal, the notification inbox, theme and width switching,
reduced motion, scrollspy, and every layout decision.

Simulated: anything that would touch a network, a filesystem or a provider. `shared/pm-sim.js` is
seeded rather than random, so a demonstration repeats identically.

## Deep links

```text
#/home
#/search/<query>
#/c/<categoryId>[/<subcategoryId>[/<settingId>]]
#/m/<managerId>[/<sectionId>[/<itemId>]]
```

with an optional `?demo=<demoStateId>` tail on any of them. Arities are exact: a route with a stray
segment is malformed and goes home, while a well-formed route naming something the concept does not
contain renders home plus an inline notice quoting the link. Those are different failures and they look
different on purpose.
