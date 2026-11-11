# Writing a page of the Settings managers concept

Read this before you touch `layer/pages/`. It is the whole contract between the framework and a page.

## What this concept is

PMConcept7's Settings has 9 chapters, 29 pages and about 80 views. Its users are complete newcomers. The owner's words:
the managers are "poorly laid out and hard to use", there are "redundant settings all over the place and many settings
that are in wrong places", and "they shouldn't drop any features". This concept redesigns every manager.

It does not copy PMConcept7. `index.html` frames the real `Concepts/PMConcept7.html` and adds the files in `layer/` to
it. `layer/smx-core.js` hides PMConcept7's own Settings shell and draws a new one in its place: one navigation column
(chapters with their pages) and one page at a time. A page is made from PMConcept7's own parts, which stay alive under
the new view:

- **a setting row** is the real row of the Settings kit (`PM51`), bound to the same setting id, with the same control;
- **a button** carries one of PMConcept7's own `data-action` names, so the real guided flow, side panel, menu or check
  opens (the Settings engine handles the click);
- **lists of things** (accounts, computers, skills, backups) are read from the engine's own demo state.

So nothing is re-implemented and nothing can be dropped by accident. What you design is **where things are and how a
page is laid out**. Never edit `Concepts/PMConcept7.html`, anything under `Plans/`, or a file another builder owns.

## The shape every page has

A newcomer must be able to answer, from the top of any page: *is this working, does anything need me, what can I do
here?* In this order, leaving out what a page does not need:

1. **Title and one sentence** (`title`, `purpose`): what this is *for*, in everyday words. Explain the benefit, not the
   mechanism. If the page is about a product word a newcomer has never met (skill, plugin, MCP, persona, Goal,
   checkpoint, Back Seat Driver), the sentence says what that is.
2. **Summary** (`ui.summary`): what is set up, as one or two sentences. Words that can be changed are links
   (`ui.word`) to where they are changed.
3. **Needs you** (`ui.needs`): only when something is wrong. One line and **one button** each. Also push the same
   function onto `SMX.needSources` so Settings Home shows it.
4. **Your things** (`ui.things`): the list of what the person *has*, each with a plain status, the one most useful
   fact, and a row that opens that one thing. Things that are not set up do not sit in the list: they are behind
   "Add …" or a fold.
5. **Tasks** (`ui.tasks`): the two to four things people come to this page to do, each starting PMConcept7's own
   guided flow.
6. **The few settings that apply to all of them** (`sections`): at most about six rows before a fold.
7. **More options** (`more`) and **For experts** (`expert`): everything else, grouped. A row goes under "For experts"
   when a newcomer never needs it and a wrong value can break things.
8. **Quiet links** (`ui.links`): "Check everything", "How this works", once per page, never per tab.

One thing gets one page: a thing with more than a handful of settings (an account, a computer, a persona, a backup
destination) opens on its own page (`'<chapter>/<page>/:id'`) instead of unfolding inside a list. There are no tab
bars; a manager's old tabs became pages or sections.

**One home per choice.** A setting, a list or an action is drawn in exactly one place. A page that needs to refer to a
choice owned elsewhere says what it is set to and links there (`ui.word`, `ui.btn({go})`, `ui.links`). When the same
choice exists at several levels (everywhere, per provider, per account, per persona), show the rule once and show the
others as **exceptions** to it ("Follows the main rule: … [Give it its own]"), as `pages/ai.js` does.

## Words

- The Plans' words: **Computer** (by its name; "This computer"), **Server** (the computer that stays on and keeps your
  projects), **device** (the screen in front of a person; "Pair a device", "Paired devices"), **Project** (never
  "workspace"), **AI provider**, **account**, **model**, **Away From Home**, **Everywhere / This project**.
- Never in what a newcomer reads: host, client, endpoint, runtime, daemon, repository (say "online copy" or "project"
  unless it is the page about repositories), worktree (say "working copy"), token (unless it is an access token the
  person pastes), config, provision, bootstrap, payload, schema, enum names, command ids (`cmd.…`), setting ids,
  fingerprints (`SHA256:…`). Those may appear only under "For experts".
- Say what happens, not what the switch is called: "Lets the assistant build and test on this computer", not "Runs
  work".
- A status is a mark **and a word** (`ui.status(text, tone)`), tones: `ready`, `attention`, `blocked`, `info`, `off`.
- Buttons are verbs with their object ("Add a computer", "Sign in again"). One verb for one thing across the page
  (PMConcept7's ways-in list used Manage, Set Up, Connect and Configure for the same act).
- No exclamation marks, no emoji, no "simply/just/easily". Sentence case. Straight facts.

## Looks and layout

- All ten looks must work with no rule per look: colours, radii and shadows come only from the Settings tokens
  (`var(--k3-…)`: `text-1/2/3`, `surface-0/1`, `line`, `line-strong`, `accent`, `accent-ink`, `accent-soft`,
  `accent-soft-2`, `amber`, `red`, `green`, `radius-sm/md/lg`, `shadow-md`). Never a hex colour, with one exception: a
  picture of a look or of a named colour that is NOT the current one carries that look's own colours (the NieR card
  and the accent swatches on Look & feel). A `var()` falls back to a system colour (`Canvas`, `CanvasText`), not a hex.
- No pills (no shape whose corner is half its short side), no one-sided stripes, no gradients for decoration.
- Text is at least 11px. Icons are SVG through `SMX.icon(name)`.
- Layout answers to the width of the Settings area with container queries (`@container smx (max-width: …)`), never to
  the window (`@media` on width is forbidden). Check a page at 1600, 1280 and 860 wide.
- New CSS goes in the stylesheet beside your page file (`layer/pages/<same-name>.css`), and only if no existing part
  fits; prefer the parts below. Prefix `smx-`.

## The API

```js
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const ui = SMX.ui, d = SMX.d, h = SMX.h, S = SMX.sec, D = SMX.drawn;
  const kit = () => W.PM51;                       // PMConcept7's Settings kit

  SMX.extend('code/skills', {                     // a page already declared in layer/smx-plan.js
    lead: (ctx) => [ {key: 'summary', html: ui.summary({...})}, {key: 'things', html: ui.things({...})} ],
    changes: [ {was: 'what PMConcept7 does today, as a fact', now: 'what this page does instead'} ]
  });
  SMX.page({ id: 'code/skills/:id', chapter: 'code', parent: 'code/skills', title: (ctx) => ..., lead: (ctx) => [...] });
})(window);
```

**A page** (`SMX.page(def)`, or `SMX.extend(id, patch)` for one that `smx-plan.js` already declares):

| Field | What |
|---|---|
| `id`, `chapter`, `nav` | Route, chapter id, and the label in the navigation (leave `nav` out for a page of one thing, whose id ends in `/:id`). |
| `parent` | For a page of one thing: the route "Back" returns to. `crumbs(ctx)` may give `[[route, title], …]` instead. |
| `title`, `purpose` | String or `(ctx) => string`. |
| `blurb(ctx)`, `status(ctx)` | One line and `{text, tone}` shown for this page on its chapter's first page. |
| `lead(ctx)`, `tail(ctx)` | Arrays of blocks `{key, html}` above and below the settings. A block is redrawn when its html changes, so build it from `ctx.st` every time; never keep state in the DOM. |
| `sections`, `more`, `expert` | Arrays of sections. A section is `S('pm7-section-id', {title, help})` (that section of PMConcept7, with its rows), or `{key, title, help, ids: [...]}` (rows you name), or `{key, html: (ctx) => string}` (your own card between row sections). `moreLabel`, `moreHelp`, `expertLabel`, `expertHelp` reword the two folds. |
| `covers` | `{ 'setting.id': 'how this page draws it' }` for a setting your page draws as something other than a row (a list, a per-thing switch). `D('pm7-section-id', 'how')` covers every setting of a section. |
| `changes` | **Required.** What was wrong and what the page does about it, as `{was, now}` pairs of facts (counts, exact labels). Shown to the owner by the review strip. |
| `legacy` | `[[domain, workspace, tab, manager]]`: the PMConcept7 place this page replaces (used by "Today" and by links that still point at the old place). |
| `keywords` | Everyday words search should find this page by. |

`ctx` is `{st, params, route, local}`: `st` is a fresh copy of the engine's state (`st.providers`, `st.pm51.skills`,
`st.backup`, `st.sourceControl`, … see `census/state.json`), `params` the route's `:id` values, `local`
(`SMX.local.flags`) this concept's own demo state for things PMConcept7 has no state for.

**Data that moves.** `census/state.json` was captured after every manager had been opened. Some managers move their
example data the first time they draw (the Servers manager moves its SSH keys from `st.pm51.serverProject.sshKeys` into
the setting `code.execution.ssh-keys`), so a freshly loaded page can hold the same data in another place. Read a
manager's data through the functions it exports when it has them (search its source for `PM51.<name> = {`; for example
`PM51.sysSsh.keys()`), otherwise read both places. Test each list twice: on a fresh load, and after the old manager has
been opened once (`{"do":"view","view":"today"}`, then `{"do":"view","view":"new"}`, then `go` to your page).

**Parts** (`SMX.ui`, all return HTML):

| Part | Use |
|---|---|
| `ui.summary({icon, tone, lines: [html, html], side: html})` | The sentence or two at the top. Inside a line use `ui.b(text)` and `ui.word(text, {go})`. |
| `ui.needs([{tone, title, detail, fix: {label, action, data \| go}, also}])` | What needs the person. Empty list draws nothing. |
| `ui.tasks([{icon, title, sub, action, data \| go \| do}], {title, cols, anchor})` | Task tiles. |
| `ui.things({title, help, add: {label, action, data}, items: [{icon \| initials, name, tag, sub, sub2, meters, status: {text, tone}, side: html, go \| action+data}], empty: {icon, title, text, fix}})` | A list of things. `side` holds per-row buttons; the row itself opens the thing. |
| `ui.card({title, help, side, body})`, `ui.rows([{label, help, status, value, control}])` | The kit's card and row shapes for facts and for controls you draw yourself. |
| `ui.settings(ids, {title, help})`, `ui.setting(id, {label, help})` | Real setting rows by id (outside `sections`, only when a row must sit inside your own card; then also name it in `covers`). |
| `ui.select(id)`, `ui.toggle(id)` | A real setting's control without its row, for a sentence: `ui.sentence('<span>Warn me at</span>' + ui.select('ai.accounts.soft-warning-level'))`. |
| `ui.btn({label, icon, primary, danger, ghost, disabled, reason, label2})` + one of `action`+`data`, `go`, `do`+`data` | A button. `label2` is the accessible name of an icon-only button. A disabled button always gives `reason`. |
| `ui.links([...])`, `ui.status(text, tone)`, `ui.note(text)`, `ui.facts([[k, v]])`, `ui.meter({label, pct, reset})`, `ui.pages(chapter, ctx)` | Quiet links, a status, a note, a facts table, a usage meter, a chapter's pages as rows. |

**Doing things**

- **PMConcept7's own action:** `ui.btn({label, action: 'pm51-skills-add', data: {id}})`. `census/actions.json` lists
  every action of every manager with the data it needs; the manager's source (`Concepts/onboarding/opus-5.5/src/settings/managers/NN-<name>.js`,
  `PM51.on('…')`, `PM51.onChange('…')`) says what each does. Controls the kit builds work the same way:
  `kit().toggle(on, {action, data, label})`, `kit().dropdown(value, options, {action, data, label})`,
  `kit().input(value, {action, placeholder, label})`.
- **Per-thing settings** (a row that belongs to one account, one persona, …): `kit().scoped.row(id, value, {scope, data, label, help})`,
  with the `scope` and `data` the manager uses (search its source for `PM51.scoped.row`).
- **A menu that only exists as a closure in PMConcept7** (the "More actions" buttons; `actions.json` shows them as
  `callback:…`): prefer drawing its items as ordinary buttons where they belong. If the items do things only the
  manager's own code can do, `SMX.lends('my-more', (el) => ({domain, ws, manager, tab, select: {action, data}, find: (block) => originalButton}))`
  opens the real menu from your button `ui.btn({icon: 'more', label2: 'More for …', do: 'my-more', data})` (see
  `pages/computers.js`). Add `mode: 'click'` when the original is a plain button whose handler should just run.
  With `select`, PMConcept7 swaps the manager's detail and keeps the old one in the page for a moment: the core takes
  that leaving detail out before your `find` runs, so the first match is the new thing's control. Where the detail
  carries a title, let `find` check it as well (see `moreFor` in `pages/ai-more.js`). After the menu closes the core
  hands the engine back and keeps the page where it is; a page never needs to touch `SMX.borrowing` itself.
- **Where the engine is, and when the page follows it.** The engine is kept on its Home view. When something of
  PMConcept7's sends it elsewhere, the core goes to the page that holds that place: at once when it points at a
  setting or is in another chapter of PMConcept7. A page stands for the managers in its `legacy` (a page without one
  stands for those of the page above it). Saving one of PMConcept7's dialogs redraws its hidden page at the top of the
  chapter, which names the chapter's first manager: on a page that stands for a manager of that chapter the person
  stays put. What this costs: a link inside one of PMConcept7's menus or dialogs that only opens ANOTHER manager of
  the same PMConcept7 chapter, without pointing at a setting, is not followed from such a page. Three tests in
  `tools/settings-managers.check.mjs` hold these rules.
- **Your own handler:** `SMX.act('name', (el, event) => { … })` for `ui.btn({do: 'name', data})`; wrap a kit dropdown
  in `<span data-smx-do-change="name" data-id="…">` to hear its change. Change the engine's state with
  `const st = W.PM12_KIMI.getState(); …; W.PM12_KIMI.setState(st)`, confirm with `kit().confirm(title, text, label, onYes, danger)`,
  say what happened with `SMX.toast(title, text)`.
- **Going somewhere:** `ui.btn({go: 'safety/limits'})`, `SMX.go(route)`. To the row of a setting, wherever its home
  is: `ui.btn(Object.assign({label: 'Change'}, SMX.at('setting.id')))`, `ui.word(text, SMX.at('setting.id'))`.
- **A setting whose home is another page.** Every setting has one home. Where it also matters, say it in words with
  the way there: a section takes `also: ['setting.id', …]` (and `alsoTitle`), and anywhere else
  `ui.elsewhere(['setting.id', ['Name', 'value in words', 'route', 'setting.id or empty']], {title, help})` draws the
  same card. Moving a setting is then two edits: name its id in a section of its new home, and put it in `also` where
  it was.
- **Rewording a row:** `SMX.reword({'setting.id': {label, help, action, unit, options: {'old choice': 'new choice'}}})` replaces a PMConcept7 row's words as it
  is drawn (its id, value and control stay), and search and "Everything that moved" use the new words. Use it for
  jargon in a row's label, and to make one choice read the same way wherever it appears.
- **A field of your own** (a filter box): `<input data-smx-input="name" data-smx-key="name">` runs `SMX.act('name')`
  on every keystroke and redraws the page. Keep the field in a block whose markup does not change as you type, and
  read what was typed from the field itself (see the filter on `ai`).
- **A button inside a row that opens** does only its own job; the row does not open as well.

## Nothing may be dropped

Your audit file (`…/audit/<slice>.md`, sections 6 and 7) lists every setting, action, list, status and guided flow of
the managers you rebuild. For each entry, your pages must offer it. Keep a checklist as you go and put it at the end of
your report: `F-n | where it is now (route › block)`. A setting row is covered when `{"do":"coverage"}` reports all
settings placed and none drawn twice. Things the audit found broken go into `changes` (what was broken, what the page
does), and a defect that is PMConcept7's own (a dead button, a wrong count) is *not* silently fixed: say in `changes`
that the concept shows the intended behaviour, and list the defect in your report.

### A real button is not yet a working button

A page draws PMConcept7's real rows and real `data-action` buttons, and the engine handles the press. That is not
enough by itself: what the press DOES must show here. An action that changes saved state shows (the page redraws
from the state), and so does one that opens a menu, a dialog or a side panel (they live outside the page). An action
whose result PMConcept7 draws into its own page does not, because that page is hidden under these: the button is
then real and dead. Every row's "About" button was exactly that until 2026-11-11, on every page, through two review
rounds. So press what you draw, and look at what happened.

When a row's own button ("run this setting's action") shows nothing because of a defect in PMConcept7, answer the
press here with `SMX.instead('<setting id>', (button) => …)` and say so in `changes` (two rows do: the limits row on
Spending, whose PMConcept7 button leads to the tab it is on; and "Reset Home layout", which needs more than that
because another part of PMConcept7 takes the press at the document, see `pages/look.js`). To find such buttons,
press them all: `EVID/tools/sweep/dead-buttons.check.mjs` (run by `EVID/tools/final-run.sh sweep`) lists every press
that showed nothing; check each by hand before you call it dead, because a sweep misses what it does not look at.

The "About" panel itself needs nothing from a page. `layer/smx-details.js` lends the engine a place to draw it; the
title, the choices, the value and the default follow `SMX.reword`; the line above the title names the page of this
Settings that holds the row; "Next to it" lists the rows of the same section on that page. `SMX.details.close()`
closes it, and going to another page closes it too.

### The frame around a page is part of the page

PMConcept7 draws things AROUND each manager that no audit of the managers lists: at a Settings page's top right a
project button (four shortcuts) and "Page options" (Show all explanations, Show advanced controls, Reset this section,
Copy deep link). The census of controls was taken inside the managers, so the concept had none of this until
2026-11-11. The framework now gives every page "Page options" (`layer/smx-pageopts.js`: "Explain everything on this
page" from where each setting is placed, and "Copy a link to this page"); a page needs to do nothing for it. If you
compare a chapter with PMConcept7, look at the whole Settings area, not only at the manager's own block.

## Building and checking

```sh
E=/mnt/Cursor/PuppetMaster-Evidence/tests/settings-managers-20261110
mkdir -p $E/runs/<lane>
# steps: README-driver.md's steps, plus {"do":"go","route":"…"}, {"do":"coverage"}, {"do":"look","look":"glass-dark"}
$E/tools/smx-run.sh <lane> $E/runs/<lane>/steps-01.json $E/runs/<lane>/out-01 pages/<your-file>.js pages/<your-other-file>.js
cat $E/runs/<lane>/out-01/log.txt
```

Name every page file you own after the output folder. Other builders' page files are left out of your build (their
pages then show in their planned form from `smx-plan.js`), so nothing half-written disturbs your run.

`smx-run.sh` builds the concept into one page (in `/tmp/smx-lanes/<lane>/`) and runs your steps in a GPU browser,
writing text: what each click changed, page outlines (`{"do":"dump","name":"…"}`), and uncaught errors. It waits for a
shared browser slot, so run one at a time, in the foreground, at most 60 steps a run. Use `{"do":"shot","name":"…"}`
for at most ten screenshots in total, to judge layout in two or three looks; read them, fix what looks wrong, then
delete them.

Done means: every page of yours draws with no uncaught error; `coverage` reports every setting placed and none twice;
every action in your audit's section 7 is reachable and you clicked each one once; every guided flow opens from the
place a newcomer would look for it; the pages read correctly at 860 wide and in `basic-light`, `glass-dark` and
`nier-dark`; `changes` is filled in for every page.
