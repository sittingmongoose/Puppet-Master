# C2 "Cozy Shelves" — Design Review

**Subject:** `Concepts/rail-concepts/c2-cozy-shelves.html` (799 lines)
**Shared layer:** `Concepts/rail-concepts/_shared/{base.css, themes.css, chrome.js, menu.js, icons.js}`
**Date:** 2026-07-26
**Status:** Review only. No file under `Concepts/rail-concepts/` or `Plans/` was modified.

Sources: seven per-panel specialist reports, six cross-cutting reports, the measured
ground-truth sweep (`c2-ground-truth.md`), and my own direct verification against the
source files. Every claim below is either (a) confirmed by me against the file at the
cited line, (b) attributed to a reviewer and marked as their measurement, or
(c) explicitly marked **unverified**. Where reviewers disagree I adjudicate and say why.

---

## 1. Verdict

**Cozy Shelves is the right foundation. Keep it.** It is the only entry in the set that
has a *grammar* rather than a *layout* — a small, closed vocabulary of primitives that
composes the same way in every panel. That is why it reads as calm, and it is the
property that must survive every fix in this document.

### Why it works structurally (preserve these five things)

**1. Every screen answers "what am I looking at, and how many?" before it shows anything.**
`.sh-shelf` (c2:101) is a titled container whose head (`.sh-head`, c2:109) is a fixed
three-part contract: icon chip (`.sh-hico`), display-font label (`.sh-hlabel`, c2:123),
and a right-aligned count pill (`.sh-hcount`, c2:124). That contract is honoured in all
seven panels without exception. It is the single biggest reason the panel does not read
as a wall — the eye lands on a heading, not on data.

**2. One row anatomy, two lines, fixed height.**
`.sh-row` (c2:141) is dot + `.sh-main` + optional chip, where `.sh-main` stacks
`.sh-name` (11.5px, identity) over `.sh-meta` (9.5px, context) — c2:152-153. Identity
above, qualification below, always in the same place. Reviewers measured search hit rows
at a clean fixed 21.7px. Fixed-height rows are also exactly what a virtualized list and
Slint's `ListView` need, so this choice pays twice.

**3. A single accent channel, `--cat`, carries category identity.**
Set once per shelf as an inline custom property and consumed by ~24 rules. Whatever its
implementation problems (section 4), the *idea* — one colour token per shelf, inherited
by everything inside it — is what makes eight different shelves in one scroller read as
eight things rather than eighty.

**4. Item-level disclosure already exists in the grammar.**
`.sh-accb` (c2:135) with `[data-acc].open > .sh-accb` (c2:136) and a rotating chevron
`.sh-accchev` (c2:137-138) is a complete, working expand-in-place primitive. It is used
by Docker containers (`.sh-ctr`, c2:245), Source worktrees (`.sh-wt`, c2:205), Tests runs
and Agents (`.sh-run`, c2:286). **The user's most important request is already half-built
inside this design.** See §2(a) — the ground-truth sweep reported the opposite and was
wrong.

**5. Responsive tiers are discrete and JS-set, not measured.**
`chrome.js:330` sets `data-wtier` to `min` / `mid` / `wide` from three integer
thresholds. This is the cheapest possible thing to port to Slint (one expression, no
text measurement), and it is the correct model. The *thresholds* are wrong (§2b); the
*mechanism* is right and should be copied by everything else.

### The honest counterweight

Three things must be said plainly so the phase plan is not built on optimism.

- **Part of the calm is smallness, not design.** Ground truth F10 catalogues 20+ rules
  at 8 / 8.5 / 9 / 9.5px, including the segmented tab labels at **8px in the display
  font** (c2:92). In retro that is Orbitron at 8px. The density is real but it is bought
  with legibility, and the trade is invisible until you compare like-for-like at the
  same type size. This needs an explicit decision (§8, Decision 3), not a silent accept.

- **It is under-wired, and slightly mis-wired.** I extracted every `data-demo-action`
  and checked it against `Plans/Wiring_Matrix.production.json` (548 distinct
  `ui_command_id` values): C2 carries **43 distinct `cmd.*` ids, of which 36 exist in the
  matrix and 7 do not.** Against ~207 ids specced across these panels, that is roughly
  21% coverage. Under-population is normal in a prototype; **invented ids are not**, and
  the seven are listed in §7.

- **Three capabilities have no home in the grammar at all** (as opposed to being merely
  unpopulated): a data-entry surface, a blocked-state component, and an overflow menu.
  These are the genuinely severe findings and they are the spine of §3.

None of this argues for a different design. Every fix below is content, primitive, or
token work inside the shelf grammar. The bones are right.

---

## 2. The user's seven reported issues

### (a) Fields should expand on click for detail

**This is the most important item, and the ground truth sweep got it materially wrong.**

Ground truth F12 states: *"NO ROW IN C2 EXPANDS. ANYWHERE. … `rowsExpandable: 0` in
every panel … the 25 accordions are all SECTION-level."* I checked the source directly.
That is not correct. C2 contains **33 `data-acc` elements and 32 `data-collapse`
triggers**, and 31 of them are **item-level**, not section-level:

| Panel | Item-level expanders | Class | Body |
|---|---|---|---|
| Docker | 9 containers | `.sh-ctr` (c2:245), markup c2:609-617 | `.sh-accb` |
| Source Control | 6 worktrees | `.sh-wt` (c2:205), markup c2:486-491 | `.sh-wt-b` |
| Testing | 7 runs | `.sh-run` (c2:286) | `.sh-accb` |
| Agents | 9 subagents | `.sh-run` (c2:286) + `.sh-agdetail` (c2:291) | `.sh-accb` |
| **Search / Actions / Artifacts** | **0** | — | — |

The measurement counted `.sh-row` and `.sh-card` only. Those genuinely never expand — but
Docker containers, worktrees, test runs and agents are not `.sh-row`s, and they do.

**Why the correction matters more than the error.** The recommendation changes from
"invent a disclosure mechanism" to "**promote the one that already exists to a universal
row primitive**". That is a much smaller, much safer piece of work, and it means the
visual language for expansion is already settled and already looks right.

**Where it is missing is exactly where it hurts most:**

- **Search** (c2:323-438) — reviewers measured, at the 280px default, that **4 of 15
  highlighted match rows render the search term entirely off-screen**, because
  `.sh-hit code` (c2:196) is `nowrap` + ellipsis from column 0. Expansion is the *only*
  way this design can ever show a line 2-3x the panel width.
- **Actions** (c2:528-586) — 7 run rows are leaf nodes with one verb. The failure triage
  for run #310 lives in a detached shelf below the list rather than under the run it
  explains, and failed run #306 (c2:546) gets no explanation at all.
- **Artifacts** (c2:736-798) — 14 `.sh-card` receipts, none expandable; `.sh-card`
  (c2:252) is `cursor:pointer` and dispatches straight to an open action.

**Three defects in the existing implementation must be fixed while generalising it:**

1. **Two competing implementations.** `.sh-accb` (c2:135) is a bare `display:none` /
   `display:block` toggle — it pops instantly. `.sh-wt-b` is in the shared spring
   accordion list (`base.css:614-628`, `grid-template-rows: 0fr -> 1fr`) and animates.
   Meanwhile *both* chevrons animate over `--motion-med` (c2:137). So on 25 of 31
   expanders the chevron rotates for up to 320ms after the content has already appeared.
2. **The animated implementation is the a11y-broken one.** The `0fr` grid accordion
   keeps collapsed content in the tab order (`base.css:614-639`), so each closed
   worktree body leaves 3-5 `.pm-btn`s tabbable (c2:486-491). The `display:none` one
   does not have this bug. Pick the `display:none` semantics and animate height properly.
3. **Zero keyboard access.** `grep -c tabindex` over c2 returns **0**. Every
   `[data-collapse]` is a plain `<div>`, so none of the 31 expanders can be opened from
   the keyboard, and `[data-collapse]:focus-visible` (`base.css:560`) can never fire.

Full unified proposal in **§5**.

---

### (b) Docker top-button labels cut off across a wide width band

**Confirmed, and it is the best-measured finding in the set.**

Mechanism, in three parts:

1. **A single hard threshold.** `.side-panel-slot[data-wtier="min"] .pm-segtab-item > span
   { display: none }` (c2:307), with `data-wtier` flipping to `mid` at exactly 250px
   (`chrome.js:330`). Labels are all-or-nothing: below 250 they are hidden (clean, icon
   only); at 250 they all appear at once, whether or not they fit.
2. **Six tabs need far more than 250px.** Ground truth F1/F9 measured, fonts asserted
   loaded, transitions disabled: the first width at which every Docker label is intact is
   **370px in friendly, 380-390 in basic/glass, and 430 in retro**. The default panel
   width is 280. So Docker's labels are cut at the default width **in all eight themes**.
3. **The type choice costs the last 60px.** `.pm-segtab-item` sets
   `font-family: var(--display-font); font-size: 8px; letter-spacing: 1px` (c2:92). In
   retro that is Orbitron at 8px, roughly 30% wider per glyph than Inter — which is
   precisely why retro needs 430 where friendly needs 370.

**Scope beyond Docker.** Source Control (4 tabs) is affected in 6 of 8 themes (retro
needs 290, basic/glass 260). Search (2), Actions (3) and Artifacts (4) are clean
everywhere. The defect scales with tab count, so the fix must be **count-aware**.

**Recommended fix (three changes, all cheap):**

- **Apply PMConcept7's own retro-readability rule.** The app carries a repeated,
  commented governance rule that sub-12px display type repoints to `--display-font-sm`
  (Rajdhani); C2 defines the token in both retro themes but applies the rule at exactly
  **one** of ~15 eligible sites. Adding `.pm-segtab-item` to that rule recovers most of
  retro's 60px penalty **before any layout change**, using a rule that already exists in
  the product.
- **Make the label threshold count-aware, not global.** Replace the single 250px tier
  test with a per-tab-bar fit test: show labels only when
  `panel_width >= tab_count * (icon + max_label + padding)`. In CSS today that means a
  per-bar `data-labels` attribute set from the same `setW` function that already sets
  `data-wtier` (chrome.js:330). In Slint this becomes a real fit test, because Slint can
  read a `Text`'s `preferred-width` — see §4.
- **Do not leave icon-only tabs unlabelled.** At min tier the tab strip currently renders
  as icon buttons with **no `title`, no `aria-label`, no `aria-selected`** — verified in
  the markup at c2:591-598 and c2:530-534. `display:none` also removes the span from the
  accessibility tree, so at 220px the Docker tab bar is six anonymous buttons. Add
  `accessible-label` / `aria-label` to the item regardless of tier.

**Design note that outlives the CSS fix.** Six top-level tabs in a 220-280px rail is
itself the problem; the Docker reviewer notes the canonical subview roster is eleven
(Containers, Images, Compose, Registries, Build, Publish, Networks, Volumes, Contexts,
Kubernetes, Hosts). An equal-flex chip strip with `overflow:hidden` on the parent
(c2:85-88) has **no slot to add the missing five to** — see §3, "no overflow home". A
single-line dropdown subview selector is the only control that scales to eleven at 220px.

---

### (c) The orange left border on the Compose import-worker row

**Confirmed; it is a cross-cutting rule, not a Compose or import-worker phenomenon.**

`_shared/base.css:643-666`:

```css
.sh-row:has(.dot-run) { position: relative; overflow: hidden;
  background: linear-gradient(90deg, color-mix(in srgb, var(--graph-running) 7%, transparent), transparent 62%); }
.sh-row:has(.dot-run)::after { content:''; position:absolute; left:0; top:0; bottom:0; width:2px;
  background: var(--graph-running); animation: liveRail 1.8s var(--ease-out) infinite; }
@keyframes liveRail { 0%,100% { opacity:.35 } 50% { opacity:1 } }
```

It fires on **any** row containing `.dot-run`, in every panel, in all six concepts (16
selectors in that one rule). Reviewers measured a 2px x 44.5px bar in `rgb(255,173,147)`
plus a horizontal wash. There is a second, different treatment at c2:246
(`.sh-ctr:has(.dot-run)` tints the whole container border), so the same state has two
renderings.

**Four problems, in ascending order of importance:**

1. **It is applied to a non-interactive row.** The Compose import-worker row is
   `class="sh-row flat"` (c2:637) — `.flat` means non-clickable — yet it receives the
   strongest affordance in the panel. The busiest visual mark in Compose sits on the one
   row you cannot click.
2. **"Running" has five different renderings across C2.** `.sh-row` gets wash + rail;
   `.sh-row.flat` also gets wash + rail; `.sh-ctr` gets only a border tint (c2:246);
   `.sh-run` gets only a pulsing dot; the Artifacts live card (c2:766) gets two pulsing
   dots plus a shimmer sweep and no rail. A user cannot learn one signal.
3. **It never repeats in phase with anything else.** Five infinite animations run
   concurrently at 1.4s (`dotPulse`, base.css:321), 1.6s (`shPulse`, c2:239-240), 1.8s
   (`liveRail`), 2s (`pmShimmer`, base.css:674) and 3.4s (`hgShimmer`, base.css:752).
   The composite visual period is roughly 100 seconds. That is what reads as nervous
   rather than alive.
4. **Three separate Slint blockers converge on this one rule.** `:has()` has no
   equivalent, `::after` needs a real element, and `infinite` `@keyframes` has no Slint
   form. It also sets `overflow:hidden` on the row, which will clip any row overflow
   menu added later (§3).

**Recommended fix:** delete the `:has()` rule. Put `is-running` on the row from the data
model (the dot is already rendered from data, so the channel exists), and define **one**
running treatment applied to every list-item primitive — `.sh-row`, `.sh-ctr`, `.sh-run`,
`.sh-card`, `.pm-li` — consisting of a 2px `--graph-running` left edge as a **real
element** plus **one** animated dot, driven from a single shared phase. Never apply it to
`.flat` rows. This simultaneously removes the taste problem, unifies the vocabulary, and
converts the largest Slint blocker in the file into a property read.

---

### (d) Compose has no visible way to enter data / no YAML / unclear how it works

**Confirmed, and worse than reported: the input problem is panel-wide, not Compose-wide.**

Ground truth F3 measured zero `<input>`/`<textarea>`/`<select>` inside
`[data-pane="compose"]`. I extended the count: **the entire Docker panel (c2:589-673)
contains zero form controls of any kind.** So do Actions, Testing, Agents and Artifacts.
The whole of C2 contains four `<input>` elements — three in Search, one in the Source
Control commit row.

What Compose (c2:632-646) actually is: one shelf listing seven services as `.sh-row flat`
(status dot + service name + image tag), one full-width `Compose up` button
(`cmd.docker.compose_up`), and a second SCENARIOS shelf with three rows and three
run/blocked mini-buttons. It is a read-only status board with one global verb.

**What has no surface at all** (checked against the 78 `cmd.docker.*` ids in
`Plans/Wiring_Matrix.production.json`):

- Which compose file is in play. No file name, no path, no override-file handling, no
  profile or env selection anywhere in the pane.
- `cmd.docker.compose_down` — present in the matrix, absent from the design.
- `cmd.docker.compose.up_subset` / `cmd.docker.compose.down_subset` — per-service up,
  down, restart, logs. The service rows are `.flat` and carry no action slot.
- `cmd.docker.compose.scenario.edit` / `.save` / `.delete` — the scenario at c2:640 is
  literally labelled `stale — compose changed` with a disabled Run and a
  `demo.reason` toast, and there is no edit affordance to un-stale it.
- Any YAML view, diff or validation surface.

**Recommended fix.** Compose needs three things the shelf grammar can hold without
strain:

1. **A source header.** A `.sh-kv`-shaped identity block at the top of the pane naming
   the compose file(s) in play, the override chain, the active profile, and the project
   name — with the file path as a menu trigger (`cmd.docker.compose`) rather than
   prose. This is the "how does it work" answer the user is missing.
2. **Service rows become expandable rows** (§5). Collapsed: dot + service + image, as
   now, but not `.flat`. Expanded: resolved image digest, ports, depends_on, health,
   env source, and a chunked action row — Up, Down, Restart, Logs, Exec — which is where
   `up_subset` / `down_subset` finally get a home.
3. **A YAML surface reached by disclosure, not a new panel.** A `Show compose file`
   expander using the existing `.sh-log` mono block (c2:200-201) with `white-space:pre`
   instead of `nowrap`, height-capped with internal scroll, read-only in v1 and marked
   as such. Editing YAML in a 280px rail is a bad idea; *seeing* it is the difference
   between "unclear how it works" and "obvious".

Do **not** add a modal or sheet primitive for this. C2 has no sheet/dialog primitive
anywhere (verified: zero `sheet|modal|dialog` matches in `base.css`, and the only four
matches in c2 are `rel="stylesheet"`), and introducing one for Compose alone would break
the grammar. Disclosure is the right host.

---

### (e) The Registries box is messy and off-grammar

**Confirmed, and the reviewers correctly widened it.**

The Registries pane (c2:647-654) is one shelf containing five `.sh-kvwrap` rows and one
button. It has **zero `.sh-row`**, zero inputs, and its only action is
`data-demo-action="demo.toast"` (c2:653) — nothing in the tab is wired to a real command
id. It is the only Docker tab that abandons the shelf/row grammar, which is exactly why
it reads as messy next to Containers.

**Two mechanisms, not one:**

1. **Off-grammar structure.** A registry is an *entity with state and actions* — exactly
   what `.sh-row` models (identity + qualifier + status chip + action slot). Rendering it
   as a key/value pair says "this is a fact about something else", which is false. The
   fix is a straight substitution: five `.sh-row`s with `.sh-name` = host,
   `.sh-meta` = account or transport, chip = `authenticated` / `reachable` /
   `not_configured`, and an expander (§5) revealing credential source, last-checked,
   mirror/pull-through role, and Login / Logout / Test / Remove.

2. **`.sh-kvwrap` is a broken primitive** — ground truth F5. Measured in Registries with
   transitions off, the key overlaps the value by **190px at 220, 210px at 240, 234px at
   the 280 default**, clean from 320. Offender: `registry.unraid.local:5000` (26 chars),
   `text-overflow: clip`, no ellipsis. This reproduces the PMConcept7 `.pm6-kv` overlap
   bug the whole redesign exists to kill.

**Scope of the `.sh-kvwrap` problem — this is where reviewers disagree, and the nuance is
real.** The primitive appears **31 times**: 22 in Docker (8 in Images c2:622-629, 5 in
Registries, 9 image-digest rows inside container bodies) and 6 in Actions, 3 elsewhere.
But the Actions reviewer correctly observes that the overlap **does not reproduce** in
Actions, and gives the mechanism: Registries nests a `.pm-chip` inside a `.sh-v`
(nowrap + `overflow:hidden`), whereas Actions pairs `.sh-k` with a **bare** `.pm-chip`,
which `c2:163` pins to `flex:none`.

**My adjudication:** both are right, and the correct statement is more useful than
either. `.sh-kvwrap .sh-k` is `flex: 1 1 auto; overflow-wrap:anywhere; word-break:
break-word` (c2:162), so the key *wraps*; it is the **second child** that decides the
outcome. A `flex:none` chip is safe; a `.sh-v` (c2:159, `nowrap` + `text-overflow:
ellipsis` + `min-width:0`) is not, because it can be squeezed to zero and then overrun.
So:

- **Registries and Images are broken** (both pair a wrapping key with a `.sh-v`).
- **Actions is not broken** but does have a second-order defect: a 26-char secret name
  breaks mid-identifier with no continuation marker.
- The fix is one CSS change, not 31 markup changes: give `.sh-kvwrap .sh-v`
  `flex: 0 0 auto` and let the key wrap beneath it, or convert `.sh-kvwrap` into a true
  two-line block (label line, value line). Then audit all 31 sites once.

**Also fix:** `not_configured` is used as a user-facing status string in Registries
(c2:649, c2:652) and again as a *blocked reason code* in Actions (c2:563). In Actions it
is an invented code — the canonical one is `actions_missing_scope_runtime`. Do not let a
display string and a reason code share a spelling.

---

### (f) The File Manager must be redesigned to match

**Status changed since the ground-truth sweep was written, and this needs the user's
decision before any work starts.**

Three separate artifacts are in play and they must not be confused:

1. **The throwaway mock.** `filesPanelHTML()` in `_shared/chrome.js` using `pm-fm-*`
   classes. Shared demo scaffolding for all six concepts. Not the target.
2. **The real one.** `Concepts/PMConcept7.html` — markup at **PMConcept7.html:15025**
   (`<div class="side-panel-view" id="panel-files">`), breadcrumb at 15031, tree at
   15053; CSS block at **PMConcept7.html:14705-14733** (`.pm6-fm-crumb`,
   `.pm6-fm-rootbtn`, `.pm6-fm-rootdd`, `.pm6-fm-search`, `.pm6-fm-tree`,
   `.pm6-fm-folder`, `.pm6-fm-file`) plus a glass override at 1127 and a worktree
   breadcrumb block at 6844. This is what the user means.
3. **A new C2-language File Manager that now exists.**
   `Concepts/rail-concepts/c2-cozy-shelves-files.html` (74KB), created after the
   ground-truth document was written. Its header comment states it re-cuts the File
   Manager in cozy-shelves language — pill banner carrying the worktree-root picker and
   Hide-ignored toggle, a segmented tab bar (Explorer / Changed / Open), a nested tree of
   pill rows with hover-reveal quick actions, a reskinned PM sprout context menu, and a
   sticky status footer — and that tree behaviour defers to `Plans/FileManager.md`
   (virtualized 24px rows, lazy expand, 10k row cap plus Show more, current-file reveal,
   read-only git badges from Source Control, worktree-keyed roots).

**I have not reviewed that file in depth** — it is another agent's in-flight work, it
landed after my brief was set, and reviewing it properly is a separate pass. What I can
say from its header and structure is that it is targeting the right spec
(`Plans/FileManager.md` exists and covers the tree, git overlays in §13, and the editor)
and the right visual language.

**The decision the user must make (Decision 6 in §8):** is
`c2-cozy-shelves-files.html` the baseline for the File Manager, or is the target a
direct re-skin of the PMConcept7 markup at 15025-15053? These produce different amounts
of work and different risk. My recommendation: **treat the new file as the design
proposal and PMConcept7:15025 as the feature contract** — i.e. review the new file
against `Plans/FileManager.md` and against the PMConcept7 markup for feature parity,
rather than starting again. But that review has not happened and should be scheduled
before it is trusted.

**Three constraints the File Manager inherits from this review regardless of baseline:**

- The tree row is a list item, so it gets the same expander, the same fixed height, the
  same keyboard model, and the same 24px floor as every other row (§5).
- Its context menu must be the PM sprout (`.pm6-tb-menu`), which is `min-width: 210px`
  (`base.css:135-137`) — wider than the 194px content box at the 220px min tier. C2
  currently makes this work by setting `.side-panel-slot { overflow: visible }` (c2:76)
  so the menu overhangs the editor. That is deliberate and it works, but it must be
  reproduced in Slint as a `PopupWindow` permitted to exceed its parent bounds, and it
  must be confirmed against real window chrome before it is relied on.
- Path truncation must middle-elide the directory and keep the basename. There is **no
  middle-elide helper anywhere** in c2, `base.css` or `chrome.js` — I checked. That
  helper is a prerequisite for the File Manager, for Search file-group headers, and for
  Source Control paths, so build it once (§3, item 2).

---

### (g) Source Control's branch selector disappears when narrow

**Confirmed. This is the clearest single design defect in the file.**

```css
/* c2:297-298 */
.side-panel-slot[data-wtier="min"] .sh-bbranch,
.side-panel-slot[data-wtier="min"] .sh-owner { display: none; }
```

Below 250px the branch picker (`.sh-bbranch`, c2:69-71, markup at c2:451) and the
worktree owner label (`.sh-owner`, c2:215, on all six worktree rows c2:486-491) are
deleted with **no replacement affordance**. At the 220px minimum the Changes pane renders
STAGED and UNSTAGED shelves with no answer to "of what repo, on what branch?" — and
branch switching, a primary action, becomes unreachable.

Two aggravating details:

- **`.sh-bbranch` is used out of position.** Its CSS (`margin-left:auto; flex: 0 1 46%`)
  is written for a *banner* child, but the markup places it as a block-level element
  inside the Changes pane (c2:451). So half its rules are inert, and the min-tier
  `display:none` now deletes a pane element rather than shedding a banner ornament.
- **`.sh-owner` is deleted, not relocated.** The spec permits moving owner into expanded
  detail at 240px. But `.sh-wt-b` (c2:486-491) carries only Path and Base/PR — owner
  appears nowhere in the expanded body. So below 250px ownership information is
  destroyed rather than moved.

**Recommended fix.** Replace both `display:none` rules with a persistent context strip in
the banner. `.sh-bstatus` (c2:51-58) is already built for exactly this — it is a
right-aligned pill with an optional chevron that opens a disclosure panel
(`.sh-idxpanel`, c2:60-62), and Search already uses that pattern. Source Control uses
neither. The strip should carry, at **every** width including 220px: branch, dirty /
conflict / ahead / behind numerals, and a `+N parallel contexts` chip that expands to
list every active worktree. Owner moves into `.sh-wt-b`, where it belongs.

**Generalise the rule.** `display:none` with no overflow home is a feature deletion. It
appears at c2:297-298 (branch, owner) and c2:307 (tab labels). Adopt a hard project rule:
**nothing may be hidden by a width tier unless it has a named home at the narrower
tier** — expanded row body, overflow menu, or banner strip.

---

## 3. Systemic defects the user has not yet seen

Ranked. "Will break in production" means it produces wrong, unreachable or
inaccessible behaviour with real data. "Polish" means it looks unfinished but works.

### 3.1 Will break in production

**1. There is no keyboard model at all.**
`grep -c tabindex` over `c2-cozy-shelves.html` returns **0**, across 799 lines and
roughly 106 clickable elements — 49 `.sh-row`, 14 `.sh-card`, 16 `.sh-hit`, 9 `.sh-ctr-h`,
6 `.sh-wt-h`, 16 `.sh-run-h`, 6 `.sh-fileh`. `chrome.js` wires `[data-demo-action]` on
click only. Consequences: no row is reachable, no accordion is openable, no result is
selectable, and `[data-collapse]:focus-visible` (`base.css:560`) is dead code because
every `[data-collapse]` is a `<div>`. The focus-ring selector list (`base.css:556-565`)
covers `.pm-btn`, `.pm-minibtn`, `.pm-chipbtn`, menu parts, `[role=tab]`, inputs — and
none of the seven row classes. Additionally `.sh-flag` (c2:175) is a real `<button>` but
is absent from the list even though its siblings `.st-flag` / `.cr-flag` / `.ad-flag` are
present, and `.ab-icon` carries `role="button" tabindex="0"` (chrome.js:209) with no ring
at all.
*This is not a prototype gap. It is an un-made design decision, and Slint has no implicit
focusability — you cannot port a decision that was never taken.* Fix as part of §5.

**2. Identity truncation destroys the identifying part of the string, in four places.**
- `.sh-name` (c2:152) is `display:flex` **and** `text-overflow:ellipsis`. `text-overflow`
  does not apply to a flex container's anonymous text child, and that child keeps
  `min-width:auto`, so the text hard-clips with no ellipsis and the `margin-left:auto`
  status letter is pushed outside the clip box entirely. (The `display:flex` is
  deliberate — rows embed a `.pm-chip` in the name, e.g. c2:766. The fix is to wrap the
  text in its own `<span>` that carries the ellipsis, not to remove the flex.)
- `.sh-fileh` (c2:191) renders a repo path as a bare text node with **no overflow rule at
  all**; its parent `.sh-file` (c2:190) is `overflow:hidden`. Reviewers measured
  scrollWidth 361-392 against clientWidth 238 at 280px — cut mid-glyph, no ellipsis, and
  the cut lands on the basename.
- `.sh-branch` (c2:214) tail-elides, so `orch/lane-b-api` and `orch/lane-d-infra` both
  render as `orch/l…` on adjacent rows (c2:486-487).
- `.sh-hlabel` (c2:123) has **no** `min-width`, `overflow`, `text-overflow` or
  `white-space` — the only text element in the shelf head with no truncation handling.
  `REMOTE PROJECTION` (c2:475) and `BRANCHES & STASH` (c2:509) are the exposure.

There is **no middle-elide helper anywhere in the shared layer**. Building one is a
prerequisite for Search, Source Control and the File Manager.

*Reviewer caveat, honoured:* the Source Control reviewer's pixel figures here are static
estimates, not browser measurements, and are marked as such in their report. The CSS
mechanisms above I verified directly; the pixel counts should be re-measured.

**3. There is no blocked-state component, anywhere in the design.**
Every gated control in C2 explains itself through a **transient toast** —
`aria-disabled="true" data-demo-reason="…" data-demo-action="demo.reason"` — or through a
native `title=`. Example: the only disabled control in Source Control is the worktree
Remove at c2:486, whose entire explanation is a toast reading "Owned by run #47". Actions
puts its blocked payload in a `.pm-footnote` (c2:563) carrying an invented reason code.
The specs require a reason to be non-hover, keyboard-reachable, carrying a reason-family
code, a severity word, and the ordered `allowed_action_ids[]` **as real buttons**.
A toast can carry none of that. `.pm-btnrow` (`base.css:373`) has no reason slot.
This is the single largest correctness gap after the keyboard model.

**4. There is no data-entry surface outside Search.**
Four `<input>` elements in the whole file: three in Search (c2:344 and the Replace pane),
one in the Source commit row (c2:471). Zero `<select>`, zero `<textarea>`. Every panel
therefore has capabilities that literally cannot be reached: Docker Compose (§2d), Search
scope as a glob pair and the seven indexing controls, Actions `workflow_dispatch` inputs,
Search's 10 MB large-file threshold and exclusion patterns. And there is no sheet, modal
or dialog primitive to host them (verified: 0 matches in `base.css`). The only overlay is
`.pm6-tb-menu` at `min-width: 210px` (`base.css:135`), which can carry menu items but not
a numeric field or a pattern list.
**This is the capability that most needs a decision** (Decision 5, §8): either the
expanded row body becomes the universal form host, or a sheet primitive is added.
My recommendation is the former — it fits the grammar and it is the only thing that works
at 220px.

**5. There is no overflow home.**
No banner in any of the seven panels has an overflow trigger — verified across c2:324,
442, 529, 590, 677, 712, 735. `.sh-banner` is icon + title + status chip, and
`.sh-bstatus` takes `margin-left:auto` with `max-width:50%` (c2:51), so the right edge is
occupied by design. No row has an overflow either: `.sh-rowact` (c2:155) is defined and
**never used**. Consequence: every P2 control the specs assign to a panel overflow menu is
homeless, and the missing five Docker subviews have nowhere to go. Room exists —
`.sh-title` is `flex:1 1 auto` — so this is unpopulated rather than impossible, but it is
the doorway that everything else needs.

**6. 47 of 138 interactive elements are under the 24px hit-target floor** (ground truth
F11, measured identically in three themes so it is structural): `.pm-minibtn` x25 at
22px, `.sh-hit` x16 at 22px, `<input>` x2 at 19px, `.pm6-tb-menu-trigger` x2 at 19 and
21px, `.sh-bstatus` at 21px. Add `.sh-acts .pm-btn { min-height: 22px }` (c2:217), which
governs up to five buttons per worktree row across six rows. Two of the offenders are
**Puppet Master menu triggers** — the components that exist to replace OS-native
controls. FinalGUISpec mandates 24px.

**7. 28 native `title=` attributes are used as the sole affordance** — verified count. The
severe subset is the six search flag buttons (c2:347-349 and 413-415) whose visible labels
are `.*`, `Aa` and `\b`; their meaning exists **only** in `title="Regex"` /
`"Case sensitive"` / `"Whole word"`. The rest are Stage / Unstage / Discard / Pop / Drop
mini-buttons — every one a mutating or destructive action labelled by an OS tooltip.
This violates the project rule directly, and Slint has no native tooltip, so on port the
strings simply vanish. A `Tooltip` component (delayed `PopupWindow`) must be built and
all 28 routed through it.

**8. Search cannot show the search term.** `.sh-hit code` (c2:196) renders from column 0
with `nowrap` + ellipsis. Reviewers measured, transitions off: the `<em>` is entirely
outside the visible box on **6 of 15 rows at 220px, 4 of 15 at the 280px default**, 3 at
380, 0 at 480. The panel displays code lines that visibly do not contain the query. Fix:
window the match — trim indentation, take ~8 characters of context before the match,
ellipsis on each cut side, guarantee the highlight is never scrolled out. Also drop the
fixed 22px `.sh-ln` gutter (c2:195), which costs 17% of the row content box at 220px.

**9. Destructive actions dispatch with no confirmation surface.** Discard x6, worktree
Remove x4, stash Drop x2 in Source Control alone. `confirm()` is banned (correctly — zero
occurrences), but nothing replaces it: the word "confirm" appears only inside
`data-demo-arg` toast text. This is an unbuilt component, and it should be built as an
expansion-in-place (scope, consequence, and a typed confirm), not a modal.

**10. Header counts disagree with the rows beneath them.** Search reports `16 in 6`
(c2:364), `18 matches / 6 files` (c2:345), `3 / 18` in the footer (c2:434), and
`18 in 6` in the Replace pane (c2:408) — for a DOM containing exactly 16 `.sh-hit` rows
whose six per-file badges sum to 16. Two of the six Search file-group headers also name a
different file from the one their rows route to (c2:367-371, c2:380-382). Fixture-level,
but it undermines the panel's one invariant.

**11. Row heights are not constant where virtualization needs them to be.** Search match
rows are a clean 21.7px, but file-group headers measured 28.3 / 44.5 / 61px depending on
hyphens, width and theme, because `.sh-fileh` (c2:191) lets the path wrap. Slint's
`ListView` needs a constant delegate height per row kind.

**12. Accessibility state is missing from every tab bar.** `role="tablist"` / `role="tab"`
are present (e.g. c2:335-336, 443-447, 530-533, 591-597) but with **no `aria-selected`,
no `aria-controls`, no `role="tabpanel"` on the panes, and no roving tabindex**. Assistive
tech is told there are N tabs and none is selected.

**13. Retro-dark inverts the tab selection signal.** `.pm-segtab-item.active` (c2:98)
resolves `--cat`, and four of the five tab bars set `--cat: var(--accent-blue)`
(c2:335, 443, 591, 736), so the `--accent-primary` fallback never fires. `--accent-primary`
is overridden to lime **only in retro-dark** precisely because `--accent-blue` is a navy
meant for light grounds. Reviewer-computed on the composited tab background: active label
and 2px underline at **1.79:1**, inactive labels at **4.72:1**. The selected tab is 2.6x
less visible than the unselected ones, in four of five panels. Substituting
`var(--accent-primary)` gives 11.03:1 and is a no-op in the other seven themes.
*One-token fix; I have not independently recomputed the ratios, so the contrast figures
are the reviewer's and are marked as such — but the token mechanism I verified at c2:98
and c2:335/443/591/736.*

### 3.2 Polish

**14. Motion is three systems that do not know about each other** — C2's own `<style>`,
the shared "motion & craft layer" (`base.css:540-756`), and the JS layer
(`chrome.js:412-445`). Specific items worth fixing:
- The scroll-reveal writes a **permanent inline `transition-delay` of up to 192ms** on
  ~134 elements (`chrome.js:440`). Because an inline declaration overrides the class
  `transition` shorthand and applies to every property in the list, `.sh-row` hover
  feedback is delayed by up to a fifth of a second **for the lifetime of the page**.
  This is probably the largest single contributor to the panels feeling unresponsive.
- The width tier flips synchronously (`chrome.js:330`) inside a 300ms width transition
  (`base.css:247`), so the tab strip visibly unfolds on every preset, slider move and
  resize, and there is no hysteresis at the 250/400 boundaries.
- `.sh-row:hover { transform: translateX(2px) }` (c2:147) reads as text reflow, not a
  nudge, because `.sh-name`/`.sh-meta` are ellipsis-clipped — shifting the row changes
  where the ellipsis falls. The shared rule that justified the nudge
  (`base.css:578-583`, a 2px inset accent edge) is scoped to `.sh-row.click`, which
  appears **zero times** in c2.
- `.sh-row.flat:hover` cancels only the transform (c2:149), so 27 non-interactive rows
  still light up on hover — an affordance lie.
- `.sh-card:hover` lifts 1px while claiming `--elev-hover`, which is a 30px glow in
  friendly and a hard `4px 4px 0` down-right offset in retro (c2:252-253).
- Focusing `.pm-minibtn` or `.pm-chipbtn` animates their corners from pill to 6px,
  because `base.css:564` sets `border-radius` on the element inside the `:focus-visible`
  rule and both use `transition: all`.
- `--motion-fast` is never themed (a single global 120ms), `--motion-slow` and
  `--sheen-dur` are defined in all eight themes and used **zero** times, and 16 durations
  are hardcoded. Retro does not snap.

**15. Theme fidelity against PMConcept7.** The reviewer's mechanical diff is worth
recording: the token tables are **byte-identical** to `parts/02-css-tokens.part.html`,
C2 hardcodes **zero** hex or `rgb()` colours in its CSS, and the backdrop-filter budget is
clean (3 surfaces, all matching the app at identical values, none new). The divergence is
in which tokens are read. See §6.

**16. `.pm-note` is duplicated verbatim in both Search panes** (c2:401 and c2:428),
measuring 79-94px each at the default width — more vertical space than three match rows,
spent on static prose, twice.

**17. `.sh-idxpanel` has a magic `max-height: 260px` with `overflow:hidden` and no
scrollbar** (c2:60-61, repeated at c2:63). Reviewers measured current content at
215-227px — about 33px of headroom. Adding one required control silently clips it.

**18. Two grammar drifts worth correcting while the panels are touched.** `.sh-graph` /
`.sh-gn` / `.sh-gind` in Source Control (c2:230-231, markup c2:519-522) is a bespoke
sub-grammar with no rows, no counts, no actions and no data. And `.sh-foot` (c2:185-188),
the sticky bottom footer, is used by Search (c2:433) and by nobody else — Source Control
keeps its commit composer inline in the scroller (c2:471) where it scrolls away.

---

## 4. Slint 1.17.1 portability — the honest cost

### The two headline blockers, correctly framed

Ground truth F7 counts **106 `color-mix()`** and **33 `:has()`**. Both numbers are right;
both framings need correcting, and in opposite directions.

**`:has()` is the cheapest item on the table, not the scariest.** All 33 uses test for the
presence of `.dot-run` (or `.run`) inside a row — `base.css:643-665` and `c2:246`. But
`.dot-run` is itself rendered from data: the row already knows it is running. `:has()` is
a CSS workaround for a missing data channel, not an expression of something structurally
impossible. In Slint the delegate reads `row.state` and writes
`background: row.state == RunState.running ? Tokens.live-wash : transparent`. There is no
parent selector needed because Slint is not selector-based. Furthermore only **2 of the
32 selectors** in `base.css:643-665` target c2 classes — the other 30 belong to the five
other concepts and are dead weight for this port. **Adjudication: the Slint reviewer is
right and the ground-truth framing ("no equivalent at all") overstates it.** Recommended
action: add `data-state` to the rows in the HTML prototype now, delete the `:has()` rules,
and prove the data channel exists before the port.

**`color-mix()` splits 82 / 24, and only the 24 are hard.** A balanced-paren scan
(reviewer, and consistent with F7's totals) finds **82 of 106** take only fixed theme
tokens as inputs, so each has exactly eight possible resolved values — one per theme.
Those are a build-script problem, and the `build_pm7.py` pipeline is the existing
precedent. The remaining **24 depend on `--cat`**, and those are the real cost, for a
reason that is not about `color-mix` at all:

**The actual structural blocker is `--cat` inheritance.** `--cat` is set once on a shelf
via an inline `style` attribute (49 sites: c2:326, 335, 341, 363, 443, 461, 475, 484, 497,
509, 519, 530, 537, 548, 554, 558, 568, 575, 591, 600, 621, 632, 642, 647, 655, 661, 679,
690, 699, 703, 714, 736, 753-768) and read by ~24 descendant rules through CSS
inheritance. **Slint has neither property inheritance nor a cascade**, and a global will
not work because several shelves with different values are visible at once. Every
component in the grammar — `Shelf`, `ShelfHead`, `ShelfIcon`, `ShelfCount`, `Row`, `Card`,
`Fam`, `Hit`, `FileGroup`, `Commit`, `Chain`, `Stage`, `Flag`, `SegTab`, `SegTabItem` —
needs an explicit `in property <ShelfCat> cat` that its parent forwards.

Two aggravations to fix while doing it:

- **11 of the 24 expressions use bare `var(--cat)` with no fallback** (c2:175, 177, 178,
  190, 191, 194, 197, 221, 222, 231, 235, 237); the other 13 use
  `var(--cat, var(--accent-blue))`; three tab rules use
  `var(--cat, var(--accent-primary))`. In CSS a missing `--cat` silently drops the
  declaration. In Slint it is a compile error — better, but the three spellings must be
  reconciled into one required property.
- **The 24 expressions use 15 ad-hoc percentages** (5, 6, 7, 8, 9, 10, 11, 14, 16, 18, 20,
  22, 24, 30, 40) with no system, and five of them blend into an opaque surface rather
  than `transparent`. Naively precomputing gives 8 themes x 8 cats x 15 = **1,536
  constants**. Snapping to a six-role ladder (`ink`, `wash`, `head`, `tint`,
  `tint-strong`, `edge`) and trimming the cat set to five real categories gives
  **8 x 5 x 6 = 240**. Do this before the token generator is written, not after.

### The rest of the port, by cost

| Item | Count / location | Cost | Note |
|---|---|---|---|
| `--cat` threading | 49 sites, ~24 rules | **Structural** | Do first; everything depends on it |
| Nested scroll containers | `.sh-scroll` (c2:73) holding `.sh-shelf` sections | **Structural** | Slint virtualizes flat lists only; needs a kind-tagged flat model with `edge: top/middle/bottom/solo` so delegates paint the shelf outline |
| 5 infinite `@keyframes` | base.css:321, 664, 674, 752; c2:239 | **Structural** | Slint animations are property-level; needs one shared phase, gated on window focus |
| `box-shadow` spread / inset | base.css:323, 368, 582, 101, 739; c2:240 | **Structural** | Slint drop-shadow has neither; every focus ring, hover edge, tab underline and pulse becomes a real Rectangle |
| Inline `<em>` highlight | c2:197, 15 uses in Search | **Structural** | Slint has no rich text; hit becomes `[TextRun]` in a HorizontalLayout, and the visible window must be computed in Rust |
| Scroll-reveal IntersectionObserver | chrome.js:427-444 | **Drop it** | Incompatible with delegate recycling — would strobe on fast scroll |
| Two accordion mechanisms | c2:60-61 (`max-height:260px`), base.css:614-639 (`0fr->1fr`) | **Improves** | Slint does `height: open ? content.preferred-height : 0px` with `animate height` — no magic number, no wrapper element |
| `.pm-segtab` tier mechanism | c2:79-98, 296-308; chrome.js:330 | **Ports 1:1** | And Slint can do the real fit test CSS cannot — see §2(b) |
| 53 `::before` / `::after` | base.css 47, themes 4, c2 6 | **Mechanical** | Half are one-Rectangle substitutions (graph elbow c2:231, chain spine c2:235, shelf hairline base.css:592-600) |
| 3 `display:grid` | c2:166 (`.pm-eqrow`), base.css x2 | **Mechanical** | `HorizontalLayout` with equal stretch |
| `repeating-linear-gradient`, stacked layers | c2:266-268 (`.sh-th-*`), c2:279 (`.sh-ticks`) | **Mostly free** | The thumbnails become `Image`; `.sh-ticks` becomes a Repeater of Rectangles, which is better anyway |
| `max-width: 50vw` | base.css:243 | **Fix now** | Ground truth F8 — makes max width viewport-dependent instead of the spec's 480px envelope, so the `wide` tier is not reproducible |
| 11 hardcoded font sizes | c2 uses `var(--fs-*)` **zero** times | **Fix now** | 7 / 8 / 8.5 / 9 / 9.5 / 10 / 10.5 / 11 / 11.5 / 12 / 15px as literals; fractional halves interact badly with Slint's physical-pixel rounding |
| `transition: all` x5 | c2:175; base.css:353, 395, 497, 504 | **Mechanical** | Slint requires each property named; enumerate them in CSS first so the port is transcription, not inference |
| `text-transform: uppercase` | c2:274 only (everywhere else baked into markup) | **Trivial** | Uppercase in the model, consistently |
| `-webkit-line-clamp: 2` | c2:288 (`.sh-runmeta`) | **Verify** | Slint has no line-clamp; behaviour of elide-with-wrap at fixed height is unconfirmed |

### Explicitly unverified — do not treat as settled

- **Does Slint 1.17.1 support an arbitrary 2D scale transform with a transform-origin?**
  The ACD-439 sprout menu is `translate3d(...) scale3d(0.72, 0.48, 1)` with a
  corner-selected origin (`base.css:143-173`, `menu.js:19-40`). If scale is unavailable,
  emulating it by animating width/height **reflows the menu text mid-animation**, which
  looks materially different. This is the canonical PM menu used everywhere, so it is a
  decision, not a detail. **Prototype it in Slint before treating the sprout as settled.**
- Per-corner `border-radius` (used at c2:84, 113, 231) support in 1.17.1.
- `animation-tick()` semantics, `Text` elide-with-wrap at fixed height, `wrap: char-wrap`,
  `font-variant-numeric` equivalent (`base.css:550-553`), and the `accessible-role` enum
  membership of `menu` / `menu-item`.
- Whether feeding a child `Text`'s `preferred-width` back into a parent layout decision
  creates a layout cycle (this affects the §2(b) fit-test fix; the fallback is a
  per-theme constant table, which still fixes F1, just less elegantly).

### Is C2 harder or easier to port than the alternatives?

**Easier, on balance — but only after one expensive decision is taken early.**

Easier because: its depth is flat (fills, 1px borders, one shadow token), it has no
blur inside the panel (backdrop-filter count in c2 itself is **zero**), its responsive
model is three integer buckets rather than container queries, its rows are fixed height,
and its `:has()` usage collapses to a data field rather than requiring a selector engine.
Its one signature motion (the accordion) is something Slint does *better* than CSS.

Harder because: `--cat` is the most CSS-dependent idea in the design, and it is
load-bearing for the whole visual identity. A design that used one accent per *panel*
instead of one per *shelf* would port almost for free; C2 chose the richer thing and must
pay for it once, in the component API.

**The decision that must be taken before any Slint work starts:** whether the corner-origin
scale sprout survives (unverified above), and whether `--cat` becomes a five-value enum
with a six-role token ladder (recommended) or stays a free brush. Retrofitting either
later touches every component.

---

## 5. Disclosure design — one mechanism for all panels

The user asked for click-to-expand generally, so this must be **one primitive applied
consistently**, not eight bespoke ones. C2 already has the primitive; it needs promoting,
unifying and completing.

### The primitive

**Name:** `.sh-ex` (expandable row). It replaces `.sh-ctr`, `.sh-wt`, `.sh-run` and
`.sh-agdetail`, and is added to `.sh-row`, `.sh-card`, `.sh-hit`, `.sh-fileh` and the File
Manager tree row.

**Collapsed state.** Exactly today's row. Same fixed height, same two-line anatomy
(`.sh-name` over `.sh-meta`), same status dot and chip. One addition: a leading 10px
chevron (`.sh-accchev`, c2:137) rotating 90 degrees on open. **The collapsed row must not
grow** — the whole point is that the list stays scannable.

**Expanded state.** A `.sh-accb` body (c2:135) beneath the row, inside the same container,
pushing subsequent rows down. Its payload is a fixed, ordered set of five slots. A row
uses the slots it needs and omits the rest; it never invents new ones:

| Slot | Content | Existing primitive |
|---|---|---|
| 1. Identity | Full untruncated name/path, wrapped not elided, plus the ids that were too long for the row (digest, sha, run/node/attempt triple, worktree_id) | `.sh-kv` (c2:157) |
| 2. Facts | Key/value pairs. Keys short and fixed; values may wrap | `.sh-kv`, **not** `.sh-kvwrap` until §2(e) is fixed |
| 3. Sentence | Free-wrapping prose — the "why", the likely-next, the freshness statement. **Never** in a clamped value slot | `.pm-note` (base.css:376) |
| 4. Blocked | Reason-family code verbatim, severity word, templated sentence, and `allowed_action_ids[]` **as real focusable buttons**. Always visible when present; never a toast, never a `title` | **New — must be built (§3.1 item 3)** |
| 5. Preview | Monospace excerpt (log lines, diff, YAML, code line), height-capped with internal scroll | `.sh-log` (c2:200), with `white-space: pre` |
| 6. Actions | Chunked action row; destructive verbs last and separated | `.sh-acts` (c2:216), raised to 24px |

**Behaviour rules.**

- One implementation only: `height: 0 -> content height` with `clip`, animated over
  `--motion-med` with `--ease-default`, chevron on the **same** duration and easing.
  Delete both current mechanisms (the `display:none` toggle at c2:135 and the
  `0fr -> 1fr` grid at `base.css:614-639`), and with them the 260px magic number at c2:61.
- Collapsed content must be **out of the tab order** (the grid version currently is not).
- Body is height-capped with internal scroll, so you never get three nested scrollers.
- One open at a time **per shelf**, not per panel (see Decision 5).
- Keyboard: rows are a roving-tabindex list. Up/Down moves, Right/Enter opens, Left/Escape
  closes, Home/End jump, type-ahead selects. `aria-expanded` on the row, `role="group"` on
  the body. The focus ring renders the **same** mark as hover — a 2px inset accent edge —
  not a separate outline.
- The row's default click action moves **into** the expansion as the first button. Today
  clicking a Search file-group header opens a file (c2:367) instead of collapsing the
  group; clicking an Artifacts card opens the artifact (c2:252). Both become "expand", with
  "Open" as the primary button inside.

### What expands, per panel

| Panel | Row | Reveals |
|---|---|---|
| **Search** | `.sh-hit` (c2:368-398) | Wrapped source line with the match highlighted in place, 2 lines of context each side, full `path:line:col`, and Open / Replace this match / Copy path:line. **This is the single change that makes Search usable at 280px** — it is the only way to see the 4-of-15 matches currently rendered off-screen |
| **Search** | `.sh-fileh` (c2:367 etc.) | Collapse/expand the group (not "open a file"), full path, the per-file match count that is currently clipped, Replace-in-this-file, Exclude, Copy path |
| **Search** | `.sh-bstatus` (c2:324) — repurpose the existing disclosure | Replace the Documents/Engine/Segments/Heap payload the spec explicitly deletes with: the freshness state sentence (indexed / stale / unindexed / fallback / disabled / cancelled), the no-silent-local-fallback sentence, and the seven indexing controls. **This is where six homeless P2 controls get a home.** Delete the 260px clamp |
| **Source Control** | `.sh-row` changed files (c2:462-469) | Basename + dimmed dirname split apart, full path as accessible name, churn numerals, compare target labelled with its source, hunk count, Open diff / Stage / Unstage / Discard with a consequence sentence |
| **Source Control** | `.sh-wt` worktrees (c2:486-491) — **already expands, payload is the problem** | Path *or* an explicit "no checkout on disk", Base, **Age** (never rendered today), lifecycle word verbatim beside the clean/dirty pill, owning package, lane/run/node/attempt/worktree ids, blocked state. Highest leverage in the panel: the container exists and carries two facts where the spec names about a dozen |
| **Source Control** | `.sh-commit` (c2:498-503) | Full subject and body — two of the six subjects are 96 and 100 characters and `.sh-msg` (c2:224) is a single elided line — plus sha, author, ahead/behind, changed files, owning run, and Open commit / Set compare target / Open Review Mode |
| **Source Control** | branch (c2:510-515), stash (c2:516-517) | Upstream, ahead/behind, owning worktree, read-only gate reason; full 76-char WIP message, source branch, file list, Apply / Pop / Drop |
| **Actions** | run rows (c2:540-546) | **The job level** — this is spec level 2 and the panel's missing half — plus full branch, sha + subject, trigger, actor, attempt, duration, blocked payload, and Rerun / Rerun failed / Cancel / View logs / Compare last success / Open related diff / Pin |
| **Actions** | triage log lines (c2:550) | Each line to a wrapped mono block, resolving the `panicked at src/services/import.rs:58:9` tail that is off-screen at every width up to 480 |
| **Actions** | workflow rows (c2:559-562) | Last-run health, pinned state, full trigger set, and **the dispatch input form** — the only plausible home for `workflow_dispatch` inputs, which have no surface anywhere today |
| **Docker** | `.sh-ctr` (c2:609-617) — already expands | Keep. Add: ports, mounts, networks, restart policy, health, env source, and the missing verbs (exec, inspect, remove) |
| **Docker** | Compose service rows (c2:633-639) | Resolved digest, ports, depends_on, health, env source, Up / Down / Restart / Logs / Exec — the home for `up_subset` / `down_subset` |
| **Docker** | Registry rows (after §2e conversion) | Credential source, last-checked, mirror role, Login / Logout / Test / Remove |
| **Docker** | Image rows (after §2e conversion) | Full digest, tags, created, layers, parents, used-by, and Pull / Push / Tag / Remove |
| **Testing** | `.sh-run` (7 rows) — already expands | Keep. Add per-test failure detail and the flaky/quarantine story |
| **Agents** | `.sh-run` (9 rows) — already expands | Keep. Add the command surface (1 `cmd.*` id today) |
| **Artifacts** | `.sh-card` (14 cards) | Full provenance chain, approval record, payload metadata, and the actions currently reachable only via `demo.toast` |
| **File Manager** | tree row | Git status detail, size, modified, LSP diagnostics count, and the context-menu verbs as buttons |

### Behaviour at 240px

This is the width where the design must prove itself, so state it precisely.

- **The collapsed row is unchanged at every width.** No tier hides the chevron.
- **The expanded body is single-column at min and mid tier.** `.sh-kv` (c2:157) is
  `justify-content: space-between` with `.sh-k` at `flex:none` — at 240px that leaves too
  little for the value, so at `min` and `mid` tiers `.sh-kv` becomes a two-line block:
  label above at 9.5px muted, value below at 11.5px, wrapping. This removes the entire
  `.sh-kvwrap` overlap class of bug at the widths where it occurs.
- **The action row wraps and never shrinks below 24px.** `.sh-acts` (c2:216) already has
  `flex-wrap: wrap`; raise `min-height` from 22px (c2:217) to 24px and accept two rows of
  buttons at 240px. Do **not** degrade to icon-only without an accessible label.
- **The expanded body may be taller than the viewport.** It scrolls internally, capped at
  roughly 60% of panel height, so the row you expanded stays on screen.
- **Nothing in the body is hidden by tier.** The min-tier rules at c2:299-308 adjust
  padding only — that is correct and should stay correct. The two `display:none` rules at
  c2:297-298 are the exception and are removed (§2g).

### Slint expression

```
component ExpandableRow {
    in property <RowModel> row;
    in property <ShelfCat> cat;
    in-out property <bool> open;
    callback activate();

    VerticalLayout {
        header := TouchArea {
            height: 34px;                       // fixed; never data-dependent
            FocusScope { key-pressed(e) => { /* Right/Enter open, Left/Esc close */ } }
            // chevron rotation-angle: root.open ? 90deg : 0deg
        }
        body := Rectangle {
            clip: true;
            height: root.open ? min(inner.preferred-height, parent.height * 0.6) : 0px;
            animate height { duration: Motion.med; easing: Motion.default-easing; }
            inner := VerticalLayout { /* the six slots */ }
        }
    }
}
```

No magic numbers, no wrapper element, no grid tracks, no `max-height` — and the same
component serves all nineteen row kinds in the table above.

---

## 6. Theming and motion — matching PMConcept7

The reviewer's mechanical diff is the useful starting point and it is good news: the token
tables in `_shared/themes.css` are **byte-identical** to
`Concepts/pm6-build/parts/02-css-tokens.part.html` (`:root` 70 tokens plus all eight theme
blocks, zero value drift); C2 hardcodes **zero** hex or `rgb()` colours in its own CSS; and
the backdrop-filter budget is untouched (three surfaces — `base.css:64`, `:84`, `:480` —
all present in the app at identical values, none added).

So the "doesn't quite match" impression is **not** value drift. It is which tokens are read
and which theme-scoped layers were never ported. Ranked:

**Must fix (correctness or accessibility):**

1. **Retro-dark tab selection inversion.** Change `--cat: var(--accent-blue)` to
   `var(--accent-primary)` in the four tab-bar style attributes (c2:335, 443, 591, 736),
   and make `--cat`'s ultimate fallback `--accent-primary` everywhere (three spellings
   exist today — see §4). One-token fix; no-op in seven themes. (§3.1 item 13)
2. **`color-scheme: dark` is hardcoded on `body`** (`base.css:19`) and, because the property
   is inherited, overrides the correct per-theme value the bootstrap sets on
   `documentElement` (c2:7, `chrome.js:268`). All four light themes render UA chrome —
   the width-harness `<input type=range>`, text inputs, `::selection` — in dark. Delete it
   or use `light dark`.
3. **Apply PMConcept7's own retro-readability rule** to `.pm-segtab-item` and the other
   ~14 sub-12px display-font sites. C2 defines `--display-font-sm` in both retro themes
   and applies the rule at exactly one site (`base.css:230`). This is the F1/F9 width fix
   and it is free. (§2b)
4. **Small-accent-on-tinted-ground text fails AA in five themes.** `--cat` is used as ink
   at 8-11px on a ground tinted with the same hue (c2:98, 124, 177, 191, 222). The
   reviewer's computed figures show all four category hues failing in friendly-light,
   glass-light and retro-light, and two failing in basic-light — where FinalGUISpec
   mandates AA. Keep `--cat` for fills, borders, dots and icon chips; move text to
   `--text-primary` / `--text-secondary`. *I have not recomputed these ratios; the
   mechanism at the cited lines I verified.*

**Should fix (the "doesn't match" feeling):**

5. **Friendly loses both of its signature surfaces.** The app's title and status bars are
   floating rounded/pill cards with margin, max-width, a border and `--elev-2`; C2 ports
   only the background and the blur (`base.css:81-85`, `:480`), leaving flat edge-to-edge
   strips. And the friendly "paper" ground — an 18px dot grid plus three pastel corner
   glows — is never applied (`base.css:11-20`), even though all four
   `--pm6-cozy-dot` / `-glow-*` tokens are defined in `themes.css` and used nowhere. These
   two are very likely the largest share of the impression.
6. **C2 defines all 15 `--pm6-cozy-*` tokens and consumes 2.** It tints surfaces from the
   `--accent-*` family — which the app deliberately deepens for use as **ink** on light
   themes — rather than from the pastel surface tokens, and it replaces the sanctioned
   `var(--pm6-cozy-mix)` / `var(--pm6-cozy-border-mix)` ratios with fixed 7% / 16% mixed
   into `transparent`, yielding ~21%-alpha shelf borders where the app's are opaque.
7. **The glass family is the weakest port.** The side panel composites to roughly 79%
   opaque violet (`base.css:252` plus c2:32) where the app's contract makes it the clearest
   region at ~6% white, and the entire 18-token `--pm6-glass-*` pane material — inset,
   radius, edge, gradient, sheen — is absent.
8. **Category hues collide with meanings PMConcept7 has already assigned.** The app
   reserves coral for errors and gates, butter for warnings, sky for selection; C2 gives
   coral to five ordinary shelves and sky to six. Separately, on the four light themes the
   7% shelf tint is at or below the just-noticeable difference (reviewer: minimum
   inter-category channel delta 3.3-4.8 of 255; retro-light orange measures 1.001:1
   against the ground). **The shelf tint cannot carry category alone.** Move the category
   signal onto the `.sh-hico` chip and a left edge on `.sh-head`, both of which can carry
   a 3:1 mark without washing the card. This ties into Decision 2 in §8.

**Motion — the four changes that matter most** (full inventory in §3.2 item 14):

- Clear the inline `transitionDelay` in the IntersectionObserver callback, or drive the
  reveal with `animation-delay` instead of `transition-delay` (`chrome.js:440`). This one
  change removes up to 192ms of lag from every hover on ~134 elements.
- Apply the width tier on `transitionend` (or drop the width transition and snap, which
  the drag path at `chrome.js:355` already proves is acceptable), and add hysteresis at
  the 250/400 boundaries.
- Delete `translateX(2px)` on row hover (c2:147); keep the background tint and add the 2px
  inset accent edge as the shared hover **and** focus mark.
- Give status motion one period and one phase, one animated element per row, and theme
  `--motion-fast` / `--motion-slow` (retro 70/250, basic 100/350, friendly 120/450,
  glass 160/600) so retro actually snaps. Use the `--sheen-dur` token that already exists
  in all eight themes and is consumed zero times (c2:264 hardcodes .7s, the glass value,
  for every theme).

---

## 7. Command ids and the Plans update plan

### Verified state

I extracted every `data-demo-action="cmd.*"` from `c2-cozy-shelves.html` and checked it
against the 548 distinct `ui_command_id` values in
`Plans/Wiring_Matrix.production.json`:

- **43 distinct `cmd.*` ids in C2.** 36 exist in the matrix; **7 do not.**
- Per panel (distinct ids): Search 7, Source Control 9, Actions 5, Docker 12, Testing 6,
  Agents 1, Artifacts 7.

**The seven invented ids, with the correct target where one exists:**

| Invented id | Location | Correct id |
|---|---|---|
| `cmd.docker.set_context` | c2:604-606 | **`cmd.docker.context.select`** (in matrix) |
| `cmd.git.stash_pop` | c2:516 | Matrix has only `cmd.source_control.stash` — **spec gap** |
| `cmd.git.stash_drop` | c2:517 | Same — **spec gap** |
| `cmd.artifacts.play_recording` | c2 Artifacts | Matrix has only `cmd.artifacts.show_in_ledger` / `.show_in_usage` — **known spec gap** |
| `cmd.artifacts.watch_recording` | c2 Artifacts | Same |
| `cmd.artifacts.sort` | c2 Artifacts sort menu | Same |
| `cmd.testing.quarantine` | c2 Testing | Not in matrix — **spec gap** |

Two further id problems reviewers raised that I verified independently: the Source Control
"Create PR" button dispatches `git.create_pr` (a bare demo action, c2:487) while naming
`cmd.github.pr.create` in its argument string — the matrix id is
**`cmd.source_control.pr.create`**. And `cmd.git.commit` / `pull` / `push` / `fetch` /
`switch_branch` appear only inside `data-demo-arg` text, not as actions, so they are
neither wired nor invented — they are the known `source.md §10.1` spec gap.

**Genuine spec gaps found by reviewers that need resolving in Plans, not in the design:**
re-anchor index (required by FinalGUISpec but has no id in either
`UI_Command_Catalog.md` or the matrix); `cmd.search.toggle_regex` /
`toggle_case_sensitive` / `toggle_whole_word` / `clear_scope` / `expand_all` /
`collapse_all` / `replace_one` (canonical per FinalGUISpec, absent from the matrix — I
confirmed `clear_scope` and `find_in_files`: the latter exists, the former does not);
Search replace-preview surface (`research/search.md §10.4` records no surface is specified
anywhere); the orchestrator record-hit row spec (`research/search.md §10.6`).

### Update ordering

`Plans/Wiring_Matrix.production.json` is an **authored** artifact validated against
`Plans/Wiring_Matrix.schema.json` and checked by `scripts/pm-plans-verify.py:3363`, with
`Plans/Wiring_Matrix.production.exclusions.json` recording non-production tokens. It is
not generated from the specs, so it must be edited in step with them, in this order:

1. **Source spec** — the document that owns the capability:
   - `Plans/FinalGUISpec.md` (panel regions, control inventory, 24px floor at §13.5)
   - `Plans/GitHub_Integration.md` (Actions blocked codes, run/branch binding, GI-004/017/019/021)
   - `Plans/WorktreeGitImprovement.md` (W-014/W-018 identity and context strip)
   - `Plans/FileManager.md` (tree, git overlays §13, editor)
   - `Plans/Commands_System.md`, `Plans/UI_Wiring_Rules.md` (id conventions)
2. **`Plans/UI_Command_Catalog.md`** — add the missing canonical ids, and record the
   disabled/precondition contract for each. Note the Search panel's 11 matrix rows all
   carry `preconditions: null` and `disabled_reason: null`, which is the upstream cause of
   the design having no disabled-reason surface to render.
3. **`Plans/Wiring_Matrix.production.json`** — one entry per binding, keyed by
   `ui_element_id`, carrying `ui_command_id`, handler, event types, acceptance checks,
   evidence, state selector, **disabled-reason projection**, effect contract and
   accessibility contract. Validate against `Plans/Wiring_Matrix.schema.json`.
4. **`Plans/Wiring_Matrix.production.exclusions.json`** — only if a token is genuinely a
   family root or parser artefact.
5. **Shards** — `python3 scripts/pm-shard-plans.py --generate`, then `--check`.
   Never hand-edit `Plans/_shards/**` or `Plans/.evidence/**`.
6. **Gates** — `python3 scripts/pm-plans-verify.py run-gates`. The healthy baseline is
   24/26 with two pre-existing failures; anything below that is a regression from this
   work.

Do not touch `Plans/Spec_Lock.json` or `Plans/auto_decisions.jsonl` unless the prompt for
that specific task says to.

### Scope note

Fixing the seven invented ids is a one-hour job. Resolving the spec gaps is not, and it is
**already tracked** as an open task ("Post-pick: resolve command-ID and blocked-state spec
gaps"). That task is a **prerequisite** for Phase 3 below, because the blocked-state
component cannot be designed until the reason-family taxonomy and `allowed_action_ids[]`
contract are settled in Plans.

---

## 8. Recommended work plan

Effort is rough and assumes one person working in the prototype, not the Slint port.
**P** marks a prerequisite for later phases.

### Decisions the user must make before work starts

| # | Decision | Why it blocks |
|---|---|---|
| **1** | **Does the ACD-439 corner-scale sprout survive?** Requires a Slint spike to confirm scale + transform-origin exist in 1.17.1. If not: animate width/height and accept text reflow, or drop to opacity + offset. | Every menu in the app inherits it; it is a named contract |
| **2** | **Category colour model.** Adopt PMConcept7's semantic assignment (coral = errors/gates, butter = warnings, sky = selection) and pick a neutral for the rest, or keep arbitrary category hues and accept the collision? Related: raise the shelf tint and move the category signal to the icon chip and head edge, since the 7% tint is below JND on four themes. | Sets the `--cat` enum, the token ladder size, and 240 vs 384 generated constants |
| **3** | **Type scale.** Keep 8-9.5px (density, current calm) or raise the floor to 10px (legibility, ~10% more vertical space consumed)? | Changes every fit measurement, including the F1 tab-label numbers |
| **4** | **Panel width envelope.** `max-width: 50vw` (`base.css:243`) or the spec's 480px (FinalGUISpec §12.2, 240/380/480)? | Until fixed, "wide tier" is viewport-dependent and no width measurement is reproducible |
| **5** | **Is the expanded row body the universal form host**, or does a sheet primitive get added? | Determines whether Docker Compose, Search indexing controls and Actions dispatch inputs are a §5 payload or a new component |
| **6** | **File Manager baseline** — is `c2-cozy-shelves-files.html` the design, or a re-skin of `PMConcept7.html:15025`? | Different work and different risk; also needs a review pass that has not happened |
| **7** | **Search Replace: tab or disclosure?** Today it is the second `.pm-segtab` tab (c2:337), which swaps the whole view so the result tree disappears while composing a replacement, duplicates the query field, flags and scope menu, and costs 48px of permanent chrome. | Changes the Search tab bar and the §5 payload |

### Phase 0 — Corrections and cheap wins (0.5-1 day) **P**

Everything here is a small, isolated change with disproportionate effect.

- Fix the four `--cat: var(--accent-blue)` tab attributes to `--accent-primary` (c2:335,
  443, 591, 736). Restores retro-dark tab selection.
- Delete `color-scheme: dark` from `base.css:19`.
- Add `.pm-segtab-item` and the other ~14 sub-12px display sites to the retro
  `--display-font-sm` rule.
- Clear the inline `transitionDelay` at `chrome.js:440`.
- Delete `translateX(2px)` on row hover (c2:147); remove hover treatment from
  `.sh-row.flat` (c2:149).
- Fix `max-width: 50vw` to 480px (`base.css:243`).
- Fix the seven invented command ids (§7); replace `cmd.docker.set_context` with
  `cmd.docker.context.select`.
- Fix the Search count inconsistency (16 vs 18, c2:345/364/408/434) and the two mismatched
  file-group headers (c2:367-371, c2:380-382).
- Raise `.sh-acts .pm-btn` `min-height` from 22 to 24px (c2:217) and `.pm-minibtn` /
  `.sh-hit` to 24px.

### Phase 1 — Truncation and the middle-elide helper (1-2 days) **P**

Prerequisite for the File Manager, Search and Source Control.

- Build the middle-elide helper (none exists anywhere in the shared layer).
- Fix `.sh-name` (c2:152): wrap the text in its own span so ellipsis applies.
- Give `.sh-fileh` (c2:191) an overflow rule and a fixed height; middle-elide the
  directory, keep the basename.
- Give `.sh-hlabel` (c2:123) truncation handling.
- Fix `.sh-kvwrap` (c2:161-163) — give `.sh-v` `flex: 0 0 auto`, then audit all 31 sites.
- Convert `.sh-kv` to a two-line block at min and mid tiers.
- Window the Search match around the highlight (c2:196) and remove the fixed `.sh-ln`
  gutter (c2:195).

### Phase 2 — The disclosure primitive (3-5 days) **P**

The centrepiece. Depends on Decision 5 and on Phase 1.

- Build `.sh-ex` per §5: one height-animated body, chevron on the same timing, collapsed
  content out of the tab order, height cap with internal scroll.
- Migrate the 31 existing expanders (`.sh-ctr`, `.sh-wt`, `.sh-run`, `.sh-agdetail`) onto
  it and delete the `0fr -> 1fr` grid accordion, the `.pm-acc-inner` JS injection
  (`chrome.js:414-423`) and the 260px clamp (c2:61).
- Add the keyboard model: roving tabindex, Up/Down/Enter/Escape/Home/End/type-ahead,
  `aria-expanded`, focus ring = hover mark. Extend the focus-visible list
  (`base.css:556-565`) to cover the seven row classes, `.sh-flag` and `.ab-icon`.
- Extend expansion to Search hits and file groups, Actions runs and workflows, Artifacts
  cards, Source Control changed files / commits / branches / stashes, Docker compose
  services / registries / images.

### Phase 3 — Blocked state, confirmation and tooltips (2-3 days)

Depends on Phase 2 (slot 4 lives inside the expansion) and on the open Plans task
resolving the reason taxonomy.

- Build the blocked component: verbatim code, severity word, templated sentence, ordered
  `allowed_action_ids[]` as focusable buttons, `aria-describedby` to the disabled control.
- Build the destructive-action confirmation as an in-place expansion (scope, consequence,
  typed confirm). Wire Discard x6, worktree Remove x4, stash Drop x2, Replace All.
- Build the `Tooltip` component and route all 28 native `title=` uses through it; give the
  three search flag glyphs real accessible names.

### Phase 4 — The seven reported issues, remaining (3-4 days)

- **(b)** Count-aware tab-label threshold, plus accessible labels at min tier, plus the
  eleven-subview dropdown for Docker (Decision 2 on the roster is not needed; the control
  choice is settled by the 220px arithmetic).
- **(c)** Delete the `:has()` live-rail rules; add `is-running` to the row model; define
  one running treatment across all five list-item primitives.
- **(d)** Compose source header, expandable service rows, read-only YAML disclosure.
- **(e)** Registries and Images converted from `.sh-kvwrap` to `.sh-row` + expansion.
- **(g)** W-018 context strip in `.sh-banner` using `.sh-bstatus`; remove c2:297-298;
  relocate owner into `.sh-wt-b`.
- Add the banner overflow menu to all seven panels and `.sh-rowact` to the row primitive.

### Phase 5 — Panel completeness against the briefs (5-8 days)

Per-panel work driven by the specialist reports and
`Concepts/panel-bakeoff/research/{search,source,actions,docker,tests,agents,artifacts}.md`
plus the matching `audit-*.md`. Largest items, in order: Docker (12 of 78 ids, five
missing subviews), Source Control (9 ids, no conflict group, no review entry point, no
lifecycle vocabulary), Actions (branch binding, job level, dispatch), Search (indexing
controls, freshness state model, scope glob pair), Agents (one command id).

**Correction to carry into this phase:** ground truth F14 reports Tests and Agents as
"empty stubs with 0 rows". That is not correct — Testing has 7 expandable `.sh-run` rows
with ~35 `.sh-kv` pairs inside them, and Agents has 9 expandable rows plus three
`.pm-sumcard` blocks. The counter looked for `.sh-row`/`.sh-card` only. What **is** true is
the command surface: Agents carries exactly **one** `cmd.*` id and Testing six. Scope this
phase to wiring and to the missing spec features, not to building the panels from nothing.

### Phase 6 — File Manager (unscoped until Decision 6)

Review `c2-cozy-shelves-files.html` against `Plans/FileManager.md` and against
`PMConcept7.html:15025-15053` for feature parity, then decide. Depends on Phases 1 and 2
(middle-elide helper, expandable row, keyboard model, PM sprout context menu).

### Phase 7 — Slint port preparation (2-3 days, can run in parallel from Phase 2)

- Run the Slint spikes for the unverified items in §4 (scale transform, per-corner radius,
  `animation-tick`, elide-with-wrap, `accessible-role` enum).
- Design the `ShelfCat` enum and the six-role token ladder; write the build-script resolver
  for the 82 theme-static `color-mix` calls first, then the `--cat` table.
- Flatten one panel's scroll model to a kind-tagged list with `edge: top/middle/bottom/solo`
  and prove the shelf outline survives virtualization. Search is the right test case
  because it is genuinely two-level and unbounded.

---

## Appendix: reviewer claims I could not verify, or that are wrong

| Claim | Source | Status |
|---|---|---|
| "NO ROW IN C2 EXPANDS. ANYWHERE. `rowsExpandable: 0` in every panel" | ground truth F12 | **Wrong.** 31 item-level expanders exist (Docker 9, Source 6, Testing 7, Agents 9). The measurement counted `.sh-row`/`.sh-card` only, and those genuinely never expand |
| "Tests and Agents are still empty stubs … 0 rows, 0 cards" | ground truth F14 | **Wrong.** Testing has 7 `.sh-run` rows, Agents 9 plus 3 summary cards. The command-surface finding in the same section is correct |
| ":has() has no equivalent at all" | ground truth F7 | **Overstated.** All 33 are content-derived and collapse to a model field; 30 of 32 base.css selectors target other concepts entirely |
| "Docker surfaces 11 of 78 wired ids" | Docker reviewer | **12**, verified by extraction |
| "the friendly theme spends more space (larger spacing tokens)" | implied in several places | **False.** `--xs/--sm/--md/--lg` are declared once at `themes.css:11-14` and overridden by no theme block. Friendly's cost is its typeface, not its spacing |
| `.sh-kvwrap` overlap affects all 31 sites | implied by F5 | **Partly.** Overlap requires a `.sh-v` second child; sites pairing the key with a bare `.pm-chip` (`flex:none`, c2:163) do not overlap — Actions is clean, Registries and Images are not |
| Source Control pixel measurements (145px for `.sh-name`, 48px for `.sh-branch`, etc.) | Source reviewer, self-declared | **Unverified** — static estimates, no browser. The CSS mechanisms are confirmed; the numbers should be re-measured |
| Contrast ratios (1.79:1 retro-dark active tab, the AA failure table) | theme reviewer | **Unverified by me.** Computed by the reviewer; the token mechanisms at c2:98 and c2:335/443/591/736 I confirmed directly |
| Slint has no scale transform / no transform-origin | Slint reviewer, self-declared | **Unverified.** Needs a spike before the sprout is treated as settled |
| Slint per-corner `border-radius`, `animation-tick()`, elide-with-wrap, `wrap: char-wrap`, `accessible-role` membership | Slint reviewer, self-declared | **Unverified.** All flagged for the Phase 7 spike |
| `c2-cozy-shelves-files.html` quality and completeness | not reviewed | **Not assessed.** File landed after the review brief was set; needs its own pass |
