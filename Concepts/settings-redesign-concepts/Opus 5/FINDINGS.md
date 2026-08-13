# Findings — Opus 5 Settings bakeoff

*What building four Settings designs against the same packet actually surfaced. Generated 2026-08-12.*

No concept is recommended over another and nothing here ranks them. These are the problems that showed
up in all four, or that only showed up because a particular shape made them impossible to hide.

---

## 1. A manager is a contract, not a screen

Four concepts times thirty-eight manager families is one hundred and fifty-two screens. Hand-writing
them is not a design exercise, it is a copy-paste exercise, and the semantics drift on the second copy.

The build resolves this with one shape — `ManagerSpec` — that every family produces and every concept
renders exactly once:

```text
title, purpose, icon
health   { status, statusWord, headline, detail, counts[] }
primary, diagnostics[]
sections[] { id, label, summary, kind, columns[], items[], settings[], actions[] }
items[]    { id, name, secondary, status, badges[], fields, value, valueSource,
             editable[], detail[], actions[] }
owner      { name, why, insertionContract }
notes[]
```

**The finding for the plan:** the useful boundary is not "which managers does Settings contain" but
"what shape must a manager hand Settings". Once that shape exists, an unregistered manager still
resolves — the kit returns an honest cross-concept pointer rather than an empty screen — and a new
owner can insert a family without touching the Settings framework at all.

The one deliberate exception is the **provider / account / model / installation** surface, which stays
bespoke in all four. It is the surface the designs are supposed to disagree about; normalising it would
erase the thing the bakeoff exists to show.

---

## 2. Requested versus effective is the hardest thing to render, and the most important

Three route differences in the fixture carry `requested`, `effective`, `reason` and `scope`:
a work profile at 92% of included usage holding a model back for synthesis, a concurrency limit of 3
against a requested 5, and a crew size reduced by a reserve policy.

Every concept had to answer the same question in its own idiom: *why is this not what I asked for?*
A settings inventory that stores one value per key cannot express it, and a UI that shows only the
effective value looks like it lost the user's setting.

**The finding for the plan:** requested and effective are a pair at the schema level, with a reason
string. This is the single most common reason a Settings screen is accused of lying.

---

## 3. Detection is not readiness, and readiness is not authentication

The installation fixtures carry seven records with paths, versions, owners and update attempts. They
made three states that are usually collapsed stay separate:

- **installed but not signed in** — the binary is there, the profile is not;
- **authenticated but not usable** — the key validates and the catalogue still refuses;
- **updated and rolled back** — the current version works, an open thread is still pinned to the frozen
  previous generation.

A CLI-owned credential is never rendered as a PM secret and never gets a PM sign-in control; the only
honest action is to launch the tool's own login. That is one field on the spec (`secretKind: cliOwned`)
and it removes a whole class of wrong affordance.

**The finding for the plan:** installation state, authentication state and product readiness are three
fields, not one status colour.

---

## 4. Search is a surface, and exposure has to travel with every record

The index carries 416 records across nine kinds. Once search can reach *everything*, it can
reach things the user should not casually flip — which is why exposure (`standard / advanced / expert /
managed / diagnostic / unavailable`) is carried on every record rather than applied at render time.
Console's search-first shape made this unavoidable: a result list that presents an expert diagnostic
with the same weight as a default toggle is a hazard, not a feature.

**The finding for the plan:** exposure is required inventory metadata, not a UI decision.

---

## 5. One notification surface, or the guarantee is worthless

`PACKET/06` makes the title-bar stack and inbox canonical. The structural consequence is that the
**shell** owns the inbox and every receipt raised anywhere on the page bridges into it automatically.
Concepts never post to it. That is what makes "sound is never the only indication" true by construction:
an operation cannot appear twice, and it cannot fail to appear.

Verified by absence as well as presence: there is no toast stack, no status-bar bell, no rail shortcut
and no dedicated notifications panel in any file in this folder.

---

## 6. Ordered rules are a manager; a list of toggles is not

Permissions and FileSafe is the largest surface in the build (11 sections, 34 items, 8 ordinary setting
rows) for one reason: **order changes the verdict**. That makes "reset order" a real operation with a
receipt, and it makes a rule editor a manager rather than a settings page. Any plan that ships FileSafe
as toggles will grow this later.

---

## 7. Three lifecycles wearing one coat: skills, plugins, tools

Skills are *installed*. Plugins are *loaded*. Tools are *exposed*. Stack's developer-tooling assignment
made the funnel explicit — installed → enabled → available → selected for a turn → actually invoked —
which is the only honest way to answer "why didn't the model use this tool". A single "extensions" list
cannot hold five different numbers.

---

## 8. Storage answers "what is on disk"; Usage answers "what was spent"

Ledger's system assignment made the boundary sharp. `manager-usage` exists as a boundary card in
**every** concept precisely so no concept quietly reimplements Usage inside Settings. The command census
records the collision honestly: `cmd.storage.backup.open` is a navigation where the build needs both a
navigation and an operation, and `cmd.usage.refresh` has unresolved ownership.

---

## 9. The command catalog needs adjudication before anything is minted

222 distinct action ids were exercised. Against the packet's candidate families, counted per concept
scope (an id assigned to two concepts is counted in both):

| Verdict | Count |
|---|---|
| Maps cleanly onto a candidate (`reuse`) | 51 |
| Second entry point for the same operation (`alias`) | 57 |
| Candidate too narrow (`supersede`) | 1 |
| Names collide but operations differ (`conflict`) | 13 |
| No candidate family covers it (`new`) | 120 |
| Read-only diagnostic projections that must **not** mint commands | 46 distinct |

74 distinct concept action ids map onto the packet's candidate families; 102 distinct ids need new
names. The three headline conflicts are recorded in `IMPACT_REGISTER.json`. The 46 diagnostics matter:
they open an existing log or receipt, and minting a command for each would double the catalog for no
capability.

---

## 10. Malformed and missing are different failures

A route with a stray segment is malformed and goes home. A well-formed route naming something the
concept does not contain renders home *plus an inline notice quoting the link*. Blurring the two makes a
renamed setting id look like a blank screen, which is how deep links quietly rot.

34/34 route cases pass, including broken percent escapes, exact arities, demo-state tails and
format/parse round-trips.

---

## 11. What the layout sweep taught

1392 clean cells is the headline, but the four defects it found are more useful than the number, and all
four were the same mistake in different costumes: **a flex cluster that could not shrink**, or **a grid
borrowed from a different grammar**. Ledger's manager items reusing the setting-row grid
(`minmax(0,1fr) 156px 116px 92px`) put a 155px button in a 92px column at *every* width — a bug that a
screenshot at 1280px would never reveal and that only a control-level clipping check catches.

**The finding for the plan:** the layout test that matters is not "does it look right at three widths",
it is "is any interactive control outside the app box, at every width, in every theme, on every route".

---

## 12. One ARIA grammar per page

The shell and the row renderers used `aria-pressed`; the first manager-spec renderers used
`role="switch"` with `aria-checked`. Both are valid ARIA and both were on the same screen. They are now
uniformly `aria-pressed`. Two correct grammars in one page is still a defect.

---

## 13. The tests you skip are where the bugs are

A second audit pass ran the packet's full probe list rather than the subset the first pass covered. The
first pass ran 6 of the 17 required probes and never swept the shell-state axis at all. The 11 it skipped
found three real defects that 2,352 layout cells had not:

1. **Width mode could go stale.** `setWidth()` changed `--pm-app-width` and left reclassification to a
   `ResizeObserver`. RO delivery is tied to the rendering lifecycle, so a backgrounded tab could sit at
   900px still classified `normal` — normal-mode rules on a narrow box, and 40 clipped controls in Stack.
   An explicit width change is a resize checkpoint in its own right; it now schedules the evaluation
   directly. This had also been quietly corrupting the layout sweeps all along.
2. **Four persisted keys were dead.** `widthChoice`, `railOpen`, `panelOpen` and `reducedMotion` were
   declared in every concept's store, written once at startup, never updated and never restored — while
   the wiring delta documented them as persisted. The shell now reports every review-strip change through
   one `onShellState` channel and restores all five controls at mount.
3. **Two concepts booted the wrong identity theme.** Console and Ledger fell back to `friendly-light`
   instead of `glass-dark` and `retro-dark`, contradicting the folder index and the README.

**The finding for the plan:** a probe list is a contract. Running the cheap two-thirds of it and calling
the result "verified" is how a build acquires defects that no amount of re-running the *same* checks will
surface.

## 14. A preview that does not preview is a dead control

The packet asks for theme *preview* and *apply* as distinct transitions, and for an import *cancel*
alongside preview/apply/rollback. Neither existed. Adding buttons that only emit a receipt would have
satisfied the letter and violated the rule about dead controls, so preview and apply are now genuinely
different operations: preview paints the theme without recording a choice, apply goes through the shell
so the choice is remembered and survives a reload.

Building it surfaced its own bug: the first version passed the row id (`theme-friendly-dark`) where a
theme id (`friendly-dark`) was required, setting a `data-theme` that matches no rules — a page with no
theme at all — and persisting it. `setTheme()` now rejects unknown ids and falls back, so a poisoned or
hand-edited stored value can no longer strand the page.

---

## What could not be settled here

- Whether Settings may refresh Usage, or only display it.
- Whether an installation shared by two provider families is one record or two.
- Retention for update logs and failed staged installations.
- Formatter configuration precedence between project, workspace and PM defaults.
- Whether a plugin may register a manager module, and under whose insertion contract.
- Whether the future server module shell's destinations are reserved routes now, or only names.

Each is recorded, with its stakes, in the relevant `concepts/<slug>/impact-register.json` and rolled up
in `IMPACT_REGISTER.json`.
