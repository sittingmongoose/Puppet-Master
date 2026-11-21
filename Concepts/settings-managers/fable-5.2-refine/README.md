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

`BASE` names the commit of PMConcept7's sources the overlay sits on. A build of `BASE` with an empty overlay is
byte-identical to `Concepts/PMConcept7.html` at that commit.

## Checks

```sh
browser-check run Concepts/settings-managers/fable-5.2-refine/tools --set page=<refined.html> --set before=<PMConcept7.html of the same base>
```

Eight tests by real clicks (`tools/refine.check.mjs`): the chapter move and old links; Explain; the centred tab
strips and the side column, left as they are; Servers' Home tab; the one home of a service's switching rules; the example staying in view in Editor and
Terminal Customize, Customize Pip and Adjust NieR; and **nothing was dropped**: every setting id and every action of
the unchanged page is still on some page of the refined one (920 settings, 73 views, on 2026-11-20).

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
| **Editor and Terminal Customize** | Up to 1240 px wide. The options scroll on the left; the example, its meter, the presets and Try it stay on the right at full size. A line under the example names what you just changed. |
| **Customize Pip, Adjust NieR** | 860 px wide. The parts scroll on the left; the picture, meter, presets and Play stay on the right. The same "Changed" line. |
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

Run on 2026-11-20 against this build and against the unchanged page, the same way on the same computer. These fail
only here, and each for a change made on purpose:

| Check | Why it fails here | What it should read instead |
|---|---|---|
| `servers-manager` (N-1) | It reads the "Role" row of a server | The line under the server's name, which says the role |
| `settings-look-editors` (B-16) | It expects the small docked copy of Pip's team | The team itself, which now stays in view |
| `settings-menus-customize` (N-4) | After "Update…" it looks for the server's menu on the same page | Servers is its own chapter, so "Update…" leaves it; go back first |
| `settings-providers-truth` (A2 B-3) | It reads the rail's health box | The count beside Settings Home |
| `settings-detail-values`, `settings-dialog-lines`, `settings-confirm-once`, `settings-min-text` | Their walkers open Servers as `system/servers` and wait for the System chapter to be the open one, or stay on Servers after "Update…" | The chapter is `servers-access` |

Failing on the unchanged page too (not this work): `own-servers`, `servers-away-guide`, `settings-base-words`,
`settings-folder-rows`.

