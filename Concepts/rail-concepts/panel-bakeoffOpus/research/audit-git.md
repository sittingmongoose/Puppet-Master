# Feature-completeness re-audit — GitHub Actions panel (`git`)

**Second pass, against the enriched fixture.** This file supersedes the first
audit. Requirement numbering, citations and scoring rules are carried over
unchanged so the two passes are directly comparable.

Source of requirements: `research/actions.md`. Source of implementations:
`versions/v0-baseline.js`, `versions/vA-ledger.js`, `versions/vB-gutter-sheet.js`,
`versions/vC-lens-deck.js`, `versions/vD-drill-stack.js`, `versions/vE-cockpit.js`,
`versions/vF-stream.js`. `grep -l "git:" versions/*.js` still returns exactly those
seven; `x-docker.js`, `x-source.js` and `x-artifacts.js` declare only their own
panel. `v0-baseline` is the shipped PMConcept7 markup and is the control.

## Method, and why this pass differs

The first pass scored largely by reading source. This pass **rendered** every
panel. Each `panels.git` entry is a pure `(D, cfg) -> HTML` function, so all
seven were invoked directly at 240 / 320 / 380 / 440 / 480px and the emitted
markup inspected; the load-bearing findings were then re-confirmed in Chrome
against the harness at `http://127.0.0.1:47821` (identity checked:
`harness: puppet-master-panel-bakeoff`, root `.../Concepts/panel-bakeoff`,
`dataSha1 169fa176b09e`) with computed styles read off the live DOM. Designs
that gate content behind their own navigation were driven into it: `vC` by
setting each lens active, `vD` by pre-seeding each stack frame.

Scoring rules are unchanged from pass 1: a feature reachable through an
overflow, context menu, picker or drill level **counts as present**; a feature
disclosed only at a wider bucket is present with the bucket recorded; a
requirement met in an unexpected shape is judged on the requirement; and the
six items `research/actions.md` §10 marks as spec gaps are not scored.

Coverage is `(Y + 0.5 x P) / 36`.

---

## 1. What is new in `_pm-data.js`

The fixture's own STATE VARIETY markers name the additions. For this panel:

| New | What it poses |
|---|---|
| `actions.blockedTable[7]` | the Actions Blocked Reason Table verbatim (`GitHub_Integration.md:L2091-L2099`), with `severity` — and **three of the seven are `warning`, a tier that had never existed in this fixture** |
| `actions.readinessCodes[14]` | the `GI-017` taxonomy verbatim (`GitHub_Integration.md:L1047-L1060`) |
| `actions.repository` | `GI-021` lifecycle: `lifecycle: 'archived'`, `mutationDisabled: true`, `capabilitySentence`, a closed `capabilities` map with `dispatch/rerun/cancel: false`, `hostPolicy: 'github.com_only'` |
| run `#304` | `status: 'cancelled'` — a token the shared status map gained in this pass, going from 9 to 11 |
| run `#306` | left **deliberately mis-encoded** as `status: 'stale'` + `detail: 'cancelled by jared'`, as the control for `#304` |
| run `#17` | `status: 'queued'` carrying a **`warning`-severity** blocked block with the table's verbatim message |
| `triage.changedFiles` / `changedCount` / `likelyNext` | on all four triage blocks — the data M17 needed |
| `paging.runs` | `{ shown: 26, total: 320, pageSize: 26, initialWindow: 12 }` |

Run count went 24 to 26 and branch count 7 to 8 (`spike/meilisearch-swap` is new).

---

## 2. Requirement checklist

### MUST

| # | Requirement | Citation |
|---|---|---|
| M1 | **Header region always visible**: panel label plus a panel-level overflow | `FinalGUISpec.md:L820`, `FinalGUISpec.md:L950` (brief §1 row 1) |
| M2 | **Header refresh affordance** | `FinalGUISpec.md:L950` (brief §1 row 1) |
| M3 | **Header detach grip** — the panel owns detachable state | `FinalGUISpec.md:L687`, `FinalGUISpec.md:L820` (brief §1 row 1, §5 opening) |
| M4 | **Account / capability strip, one line**, carrying the effective account | `GitHub_API_Auth_and_Flows.md:L439` (brief §1 row 2) |
| M5 | **`requested` vs `effective` disclosure** plus switch reason | `GitHub_API_Auth_and_Flows.md:L439` (brief §1 row 2, §2 P2) |
| M6 | **Blocked banner renders the reason code verbatim**, never hidden behind a native `title` | `GitHub_Integration.md:L1022`, `GitHub_Integration.md:L1065` (brief §5, §5 closing) |
| M7 | **Blocked banner carries the user-message sentence** | `GitHub_Integration.md:L2091-L2099` (brief §5b) |
| M8 | **Blocked banner exposes ordered `allowed_action_ids[]` as real buttons** | `GitHub_Integration.md:L1061` (brief §5a, §9.1) |
| M9 | **Active repo/branch context is visible alongside the banner**, and the banner is never suppressed for space | `GitHub_Integration.md:L1061`, brief §9.1 |
| M10 | **`attention_required` kept distinct from `blocked`**, and state legible without colour | `GitHub_Integration.md:L1062-L1063`, `FinalGUISpec.md:L1237` |
| M11 | **Subview switcher**: `Current Branch` / `Workflows` / `Settings` as stable subviews, persistently visible, `Current Branch` default | `GitHub_Integration.md:L563`, `FinalGUISpec.md:L723` |
| M12 | **Current Branch readiness line**: branch/worktree binding, readiness count, observation freshness and transport | `GitHub_Integration.md:L716` |
| M13 | **Run list bound to the current branch**; never silently aggregate multiple worktrees into one branch stream | brief §1 row 6, `GitHub_Integration.md:L1066` |
| M14 | **Run row identity**: workflow name plus run number plus branch plus age plus status; every truncation an explicit ellipsis, never a clip | brief §4 (against `PMConcept7.html:15521`) |
| M15 | **Failure triage capsule names the failing job and step** | `GitHub_Integration.md:L920`, `GitHub_Integration.md:L949-L950` |
| M16 | **Failure triage shows a short log excerpt** | `GitHub_Integration.md:L957` |
| M17 | **Failure triage shows changed files and likely next action** | brief §1 row 7, §2 P1 |
| M18 | **Rerun and Cancel on the selected run**, with the precondition-derived disabled reason available before dispatch | `UI_Command_Catalog.md:L589-L602` |
| M19 | **Rerun failed jobs**, gated on `has_failed_jobs` | `UI_Command_Catalog.md:L589-L602` |
| M20 | **Logs route out** to the bottom runtime zone; the panel renders no step-log level | `FinalGUISpec.md:L668`, `GitHub_Integration.md:L957`, brief §7 |
| M21 | **Run to job, level 2**: job rows revealed in place with name, status, duration and (when failed) the failing step name | brief §7 |
| M22 | **Pinned workflows with health badges** | `GitHub_Integration.md:L616`, `FinalGUISpec.md:L717` |
| M23 | **Pin / unpin management and stale-pin cleanup** | `cmd.github.actions.pin` / `.unpin`, `FinalGUISpec.md:L717` |
| M24 | **All-workflows inventory**, identity = display name falling back to file path | `GitHub_Integration.md:L563`, brief §4 |
| M25 | **Dispatch control per workflow** carrying dispatchability state and a disabled reason that is not a native `title` | brief §2 P1, §5 closing |
| M26 | **Settings inventory of secrets / variables / environments, names only** | `GitHub_Integration.md:L563` (brief §1 row 10, §2 P2) |
| M27 | **Connect / Disconnect / reconnect-with-scope** | `UI_Command_Catalog.md:L297-L310`, `UI_Command_Catalog.md:L312-L321` |
| M28 | **Run overflow command set**: Compare Last Success, Open in browser, Open related diff, Open related worktree | brief §3 command table |
| M29 | **Status filter** `all` / `failed` / `running` / `success` | `storage-plan.md:L1049` |
| M30 | **Run list paging**: a load-older or windowed-list affordance | `FinalGUISpec.md:L721`, brief §7 |
| M31 | **Keyboard on run/job lists** (Up/Down, Enter, Escape, Home/End, type-ahead) and every control at least 24px | `FinalGUISpec.md:L2131-L2134`, `FinalGUISpec.md:L2146` |
| M32 | **Scopes render as wrapping chips or move to the overflow sheet** — key-value rows are banned in this panel | brief §4 (against `PMConcept7.html:15507`) |
| M33 | **Effective-account change invalidates** pins, last-opened run/job/log focus and admin-readiness snapshots | `FinalGUISpec.md:L713`, `storage-plan.md:L1060`, `storage-plan.md:L8093` |
| M34 | **`GI-021` capability limits shown as effective capability state, not hidden controls** ("can view runs but cannot dispatch") | `GitHub_Integration.md:L1271-L1272`, `GitHub_Integration.md:L1275` |
| M35 | **`GAAAF-005` host policy**: under `github.com_only`, GHES gets deterministic disabled-state UX, not a hidden fallback | `GitHub_API_Auth_and_Flows.md:L336`, `GitHub_API_Auth_and_Flows.md:L370` |
| M36 | **Runner labels** in the Settings inventory | `GitHub_Integration.md:L563` (brief §1 row 10, §2 P2) |

### SHOULD

| # | Requirement | Citation |
|---|---|---|
| S1 | Auto-refresh interval control | brief §2 P1 |
| S2 | Notification prefs `notify_on_failure` / `notify_on_success` | `storage-plan.md:L1053-L1056` (brief §2 P2) |
| S3 | Two-line run row at 40px: glyph plus name on line 1, `#312 - main - 2h` on line 2 | brief §4 decision |
| S4 | Observation freshness state fresh / `stale` / `unknown` surfaced as a token | `GitHub_Integration.md:L1528` (brief §4) |
| S5 | A manual `validate_dispatch_readiness` trigger. *Surface undecided (§10.4) — recorded, not scored.* | `GitHub_Integration.md:L766`, `GitHub_Integration.md:L802` |
| S6 | Pin health `active` / stale / `renamed` | `GitHub_Integration.md:L649`, `GitHub_Integration.md:L652` (brief §4) |

---

## 3. Coverage, before and after

| Version | Before | After | Delta | Y/P/N after |
|---|---|---|---|---|
| v0-baseline (control) | 36.1% | **36.1%** | 0.0 | 6/14/16 |
| vA-ledger | 68.1% | **65.3%** | -2.8 | 21/5/10 |
| vB-gutter-sheet | 45.8% | **41.7%** | -4.1 | 10/10/16 |
| vC-lens-deck | 75.0% | **70.8%** | -4.2 | 22/7/7 |
| vD-drill-stack | 73.6% | **68.1%** | -5.5 | 19/11/6 |
| vE-cockpit | 55.6% | **51.4%** | -4.2 | 13/11/12 |
| vF-stream | 56.9% | **54.2%** | -2.7 | 16/7/13 |

**Every score fell and none rose.** The control is flat, which is the expected
result and confirms the deltas are real: `v0-baseline` is extracted markup that
reads nothing from `_pm-data.js`, so no fixture change can move it.

### 3.1 The answer to "which previously-absent requirements are now present"

**None.** Not one MUST moved from `N` to `Y` or from `N` to `P` in any of the
seven designs.

This is the pass's most consequential result, because it falsifies the first
audit's central mitigating hypothesis for this panel. Pass 1 argued many
absences were fixture-caused — authors obeying kit rule 8 could not render
state the data did not carry. The enriched fixture now carries that state, and
the rendered output is unchanged:

- `triage.changedFiles` / `changedCount` / `likelyNext` are on all four triage
  blocks. **Zero of six redesigns render any of them** (M17). Searching the
  emitted markup for `src/services/units.rs` and
  `migrations/0003_quantity_precision.sql` — strings that exist only in
  `changedFiles` — returns nothing in vA, vB, vC, vD, vE or vF at any width.
  M17 was never fixture-blocked in the way the first audit allowed for; it is
  genuine design absence, and all six still ship a triage capsule strictly less
  useful than the one already in PMConcept7.
- `repository.lifecycle`, `capabilitySentence`, `capabilities` and `hostPolicy`
  are present. **No version reads any of them** (M34, M35 as data-driven).
- `blockedTable` and `readinessCodes` are present. **No version reads either**,
  and two versions still invent codes that are in neither vocabulary (§4.7).
- `paging.runs.total = 320` is present. **No version reads it** (M30).

The only requirements that were genuinely fixture-blocked and remain so are
M36 (runner labels) and S6 (pin health) — see §5.

### 3.2 Matrix

`Y` present, `P` partial, `N` absent. A cell that changed this pass is marked
with its previous value, e.g. `P (was Y)`.

| # | Requirement | v0 | vA | vB | vC | vD | vE | vF |
|---|---|---|---|---|---|---|---|---|
| M1 | Header label + panel overflow | P | Y | Y | Y | Y | Y | Y |
| M2 | Header refresh | N | Y | Y | Y | Y | Y | P |
| M3 | Detach grip | N | N | N | N | N | N | N |
| M4 | Account strip, one line | P | Y | P | Y | P | Y | Y |
| M5 | requested vs effective | Y | Y | N | Y | Y | N | N |
| M6 | Blocked code verbatim | N | Y | Y | P | P (was Y) | P (was Y) | Y |
| M7 | Blocked sentence | P | Y | P (was Y) | Y | Y | Y | Y |
| M8 | Ordered allowed_action_ids as buttons | P | P (was Y) | P (was Y) | P (was Y) | P (was Y) | P (was Y) | P (was Y) |
| M9 | Repo/branch context with banner | P | Y | Y | P (was Y) | Y | Y | Y |
| M10 | attention distinct from blocked, non-colour | P | P (was Y) | P (was Y) | P (was Y) | P (was Y) | P (was Y) | P (was Y) |
| M11 | Subview switcher, 3 stable subviews | N | P | P | Y | P | P | P |
| M12 | Readiness line | Y | Y | Y | Y | Y | Y | Y |
| M13 | Branch-bound run list | N | P | P | Y | Y | P (b4) | Y |
| M14 | Run row identity + explicit elision | P | Y | P | Y | P (b2) | P (b3) | P (b2) |
| M15 | Triage names job + step | Y | Y | Y | Y | Y | Y | P |
| M16 | Triage log excerpt | Y | P (b2) | Y | Y | Y | Y | P |
| M17 | Triage changed files + likely next | Y | N | N | N | N | N | N |
| M18 | Rerun + Cancel with disabled reason | P | Y | P | Y | Y | Y | Y |
| M19 | Rerun failed jobs, gated | N | Y | P | Y | P | P | Y |
| M20 | Logs route out, no step level | P | Y | P | Y | Y | Y | Y |
| M21 | Run to job, level 2 | N | N | N | N | P (was Y) | N | N |
| M22 | Pinned workflows + health badges | N | Y | N | Y | Y | Y (b1) | N |
| M23 | Pin / unpin + stale-pin cleanup | N | Y | N | P | P | P | N |
| M24 | All-workflows inventory | P | N | N | Y | Y | N | Y |
| M25 | Dispatch + dispatchability reason | P | N | N | Y | Y | N | Y |
| M26 | Settings names-only inventory | P | N | N | Y | Y | N | N |
| M27 | Connect / Disconnect / reconnect | P | Y | Y | Y | Y | P | Y |
| M28 | Compare / browser / related diff / worktree | P | Y | Y | P | P | P | Y |
| M29 | Status filter (4 storage values) | N | Y | N | Y | Y | N | N |
| M30 | Load-older / paging | N | Y | N | P | N | N | Y |
| M31 | Keyboard + 24px controls | N | Y | Y | Y | Y | Y | Y |
| M32 | Scopes as chips, not key-value | N | Y | N | Y | P | P (b3) | N |
| M33 | Account-change invalidation | N | N | N | N | Y | N | N |
| M34 | GI-021 capability-state copy | Y | N | N | N | N | N | N |
| M35 | GAAAF-005 host policy disabled UX | N | N | N | N | N | Y | N |
| M36 | Runner labels | N | N | N | N | N | N | N |
| | **present / partial / absent** | 6/14/16 | 21/5/10 | 10/10/16 | 22/7/7 | 19/11/6 | 13/11/12 | 16/7/13 |
| | **MUST coverage** | **36.1%** | **65.3%** | **41.7%** | **70.8%** | **68.1%** | **51.4%** | **54.2%** |

SHOULD, recorded separately — unchanged from pass 1 except S3, where vE's
credit is withdrawn (§4.3):

| # | SHOULD | v0 | vA | vB | vC | vD | vE | vF |
|---|---|---|---|---|---|---|---|---|
| S1 | Auto-refresh interval | N | N | N | N | Y | N | N |
| S2 | Notification prefs | N | N | N | N | N | N | N |
| S3 | Two-line run row | N | Y (b0-b2) | N | Y (b0-b1) | N | N (was P) | P (b2+) |
| S4 | Observation staleness token | P | P | P | P | P | P | P |
| S5 | Manual validate-readiness trigger | N | Y | N | Y | N | Y | N |
| S6 | Pin health active/stale/renamed | N | N | N | N | N | N | N |

---

## 4. WHAT BROKE

Ordered by severity. Each names the version, the exact state, and what renders
instead.

### 4.1 A cancelled run is pixel-identical to a queued run — vA, vB, vC, vD, vE, vF

**State:** run `#304`, `status: 'cancelled'`.

`_pm-kit.js:73-77` keeps its own `GLYPH` and `DASH` maps keyed by the original
nine status tokens. `K.statusMark('cancelled')` therefore falls through
`GLYPH[token] || 'circle'` to the **queued circle**, and `DASH['cancelled']` is
undefined so the rail stays **solid**. The tone survives — but
`_pm-kit.css:132-135` paints `.pmk-t-idle .pmk-glyph` and `.pmk-t-off .pmk-glyph`
the **same** `var(--text-muted)`.

Measured in Chrome on the live DOM, glass-dark, every affected version:

```
Cancelled  shape=<circle cx="12" cy="12" r="8">  color=rgba(237, 231, 248, 0.55)  cls="pmk-rail"
Queued     shape=<circle cx="12" cy="12" r="8">  color=rgba(237, 231, 248, 0.55)  cls="pmk-rail"
```

Glyph shape, glyph colour and rail dash are identical. Three of the four
non-colour channels `FinalGUISpec.md:L1237` depends on collapse at once, and the
fourth (the status word) is width-gated. What is left is the `aria-label` and a
3px rail background.

Where the word does not rescue it:

| Version | 240px | 320px | 380px | 480px |
|---|---|---|---|---|
| vA | **collapsed** | **collapsed** | **collapsed** — `#304`'s meta overflows to `+2` and eats the word while neighbouring queued rows still print `queued` | ok (`cancelled`) |
| vB | **collapsed** | **collapsed** | ok | ok |
| vC | n/a (filtered off the Branch lens) | n/a | **collapsed** on the Runs lens — vC prints no status word in run rows at any width | **collapsed** |
| vD | **collapsed** | **collapsed** | **collapsed** — list rows carry no status word | **collapsed** |
| vE | **collapsed** | **collapsed** | **collapsed** | **collapsed** — vE never prints a status word in git run rows |
| vF | **collapsed** | ok (`cancelled`) | ok | ok |

vA at 380px is the sharpest case: `CI - build + test #304 - spike/meilisearch-swap
+2 1d`. The 22-character branch pushes the status word into the `+2` overflow, so
the one row whose status is novel is the one row that does not say what its
status is.

vE is the worst overall — a cancelled run renders as `CI - build + test #304`
with an empty circle, directly under `Publish Unraid template ...` (queued) with
an identical empty circle.

**Fix is two lines in `_pm-kit.js`**: add `cancelled: 'slash'` (and
`inconclusive: 'info'`) to `GLYPH`, and `cancelled: 'dashed'` to `DASH`. The
fixture already carries the correct values on `D.status.cancelled.glyph` and
`.rail`; no version reads them.

### 4.2 The same event renders two different ways, and neither says what happened — all seven

**State:** `#304` (`status: 'cancelled'`) and `#306` (`status: 'stale'`,
`detail: 'cancelled by jared'`) are the same event, deliberately encoded two ways.

Every version renders `#306` as **stale** — clock glyph, dotted rail, word
`stale` where the word appears — and **drops `detail` entirely**. Searching all
seven renders at all five widths for `cancelled by jared` returns zero hits. So
one cancelled run reads `cancelled`, the other reads `stale`, and no user can
tell that either was cancelled by a person. `#304`'s own richer detail
(`cancelled by jared at job 2 of 5`, `cancelledBy`, `receiptsRetained`) is
likewise unrendered everywhere.

### 4.3 vE truncates the reason code, and elides run numbers out of six rows

**State A:** runs `#88` / `#41` and pinned `Deploy to production`, blocked with
`actions_environment_review_required`.

`gitPanel` sets the row sub-line to `r.blocked.code` and then elides it to the
column. Rendered:

- 240px: `actions_environment_review_r...`
- 320px: `actions_environment_review_requi...`
- 380px and up: full

`GitHub_Integration.md:L1022` / `L1065` require the code **verbatim**. A
tail-elided code is not verbatim and is not resolvable back to the 14-code
taxonomy by a reader. M6 drops Y to P.

**State B:** the three `Publish Unraid template` runs (`#19`, `#18`, `#17`) and
the three `Nightly integration matrix` runs (`#902`, `#901`, `#900`).

vE's identity is `r.name + ' ' + r.run` as a single elided string. At 240px the
run number is elided **off the end** for every name over about 20 characters.
Six of 26 rows lose their number at 240px and three at 320px, producing three
consecutive rows that all read exactly `Publish Unraid template ...` with no
number, no branch, no age and no status word — verified in the live DOM
(`#17`, `#18` and `#19` are absent from the 240px markup entirely).

This **withdraws the first audit's specific praise** for vE, which credited it
with carrying "the run number inside the identity at every bucket ... the
cheapest correct answer to the three-identical-names problem". That is false at
240px, and the new `#17` row turns a two-way collision into a three-way one.

### 4.4 vD drills into the wrong run

**State:** `Deploy to staging #88` (`status: 'blocked'`,
`actions_environment_review_required`) and `Release #88` (`status: 'failed'`)
share a run number. So do `Deploy to staging #87` and `Release #87`.

`pGit`'s run view resolves the frame by number alone:

```js
var r0 = A.runs[0];
A.runs.forEach(function (x) { if (x.run === f.arg) r0 = x; });
```

The `forEach` keeps the **last** match. Rendered after clicking the blocked
`Deploy to staging #88` row:

```
Back    Deploy to staging #88
        Release #88
        failed
        Run #88 | Branch main | Duration 1m 04s | Age 1d ago | Status Failed
        Jobs 1 -> publish / cargo publish --dry-run
```

The back bar and the body name **different runs**. The user asked for a blocked
deploy and got a failed release, and the blocked block that row carries — code,
sentence and its `allowedActionIds` — is never shown. The job level inherits the
same resolver, so M21 drops Y to P.

The `#88` collision predates this pass; it surfaces now because this pass drilled
rather than read. It is a correctness defect either way.

Separately, vD's **run list renders no blocked state at all**: `runRow` passes
only `status`, `id`, `meta` and `tail`, so `#17`, `#88` and `#41` are visually
ordinary rows. The blocked block appears only after drilling into run detail
(where, for `#17`, vD renders it correctly and completely).

### 4.5 vB drops the user message at the two narrowest widths

**State:** run `#17`, `actions_runner_unavailable`, message
"No runner is available for this workflow."

`why()` gates the sentence on bucket:

```js
(b >= 2 && sentence ? ' <span>' + esc(sentence) + '</span>' : '')
```

At 240px and 320px the run-level blocked surface is the bare code and nothing
else:

```html
<div class="vB-why"><span class="vB-code2">actions_runner_unavailable</span></div>
```

`research/actions.md` §9.1 is explicit that the banner "is never suppressed for
space", and the message is the only part a non-expert can act on. M7 drops Y to P.

### 4.6 vC has no account-blocked disclosure at all at 240px

**State:** `connection.blocked` = `actions_missing_scope_runtime`, on the default
`Branch` lens.

The first audit recorded that vC degrades the account banner to a clickable
`mark()` badge outside the Workflows and Settings lenses. Rendering shows it is
worse than partial at the narrowest width. With portaled templates excluded, the
visible Branch-lens surface contains:

| width | code visible | sentence visible |
|---|---|---|
| 240 | **no** | **no** |
| 320 | yes (badge) | no |
| 380 | yes (badge) | no |
| 480 | yes (badge) | no |

At 240px — the width the brief says the banner must survive — the panel shows no
account-blocked state whatever on the lens it opens on. M9 drops Y to P.

vC is otherwise the strongest blocked-state renderer: on runs it prints code,
verbatim message and a real recovery button at every width.

### 4.7 Run-level blocked banners render zero recovery buttons — vA, vB, vC, vD, vE, vF

**State:** the `actions_environment_review_required` blocks on runs `#88`, `#41`
and pinned `Deploy to production` carry
`allowedActionIds: ['github.open_environment', 'github.request_review']` and no
`actions[]` array.

`K.blocked` renders buttons from `b.actions` only. **No version anywhere reads
`allowedActionIds`** — `grep -n allowedActionIds versions/*.js` returns nothing.
So those three banners render a code and a sentence and no way to act on either,
while the account banner and `#17` (which happen to carry `actions[]`) render
theirs. `GitHub_Integration.md:L1061` requires the ordered `allowed_action_ids[]`
exposed. M8 drops Y to P in all six redesigns.

This is the clearest case of the first pass over-scoring: M8 was marked `Y`
across the board on the strength of one hand-written `actions[]` array.

### 4.8 The `warning` severity tier renders nowhere — all seven

**State:** run `#17` is `severity: 'warning'`; run `#41` is `severity: 'blocked'`.

No version reads `severity`. `K.blocked(b, tone)` takes tone as an explicit
second argument and defaults to the non-error style; the only two callers that
pass a tone (`vB`, `vF`) never derive it from the data. So a warning renders
identically to a wall, exactly as the fixture predicted: "A banner design that
only knows how to be red has no answer for the bottom three rows." Three of the
seven `blockedTable` codes are `warning`.

### 4.9 Two versions still invent reason codes — vC, vF (and v0)

Off-vocabulary codes in the rendered markup, checked against the union of the
14 `GI-017` codes and the 7 table codes:

| Version | invented |
|---|---|
| v0 | `not_configured` (pre-existing, plus a native `title`) |
| vC | `actions_no_failed_jobs`, `actions_run_not_in_progress` |
| vF | `actions_no_failed_jobs`, `actions_run_not_cancellable` |

Pass 1 could argue the fixture forced this — it carried two codes and no
vocabulary list. It no longer can: `readinessCodes[14]` and `blockedTable[7]` are
both in the fixture verbatim, so a real code was available.

vF's invention is also self-contradictory. On queued runs `#17` and `#18` it
disables Cancel with `sentence: 'Only queued or running runs can be cancelled.'`
— copy that states a queued run **can** be cancelled, attached to a control
disabled on a queued run.

### 4.10 Every version offers live mutation on an archived repository — all seven

**State:** `repository.lifecycle = 'archived'`, `mutationDisabled: true`,
`capabilities: { view_runs: true, dispatch: false, rerun: false, cancel: false }`,
`capabilitySentence: 'You can view runs but cannot dispatch.'`

`GitHub_Integration.md:L1271-L1275` requires archived / deleted / historical-only
to disable mutation **deterministically**, with the limit shown as effective
capability state rather than a hidden control. Rendered:

| Version | Rerun controls | of which disabled |
|---|---|---|
| vA | 60 | 6 (all for unrelated `has_failed_jobs` / `run_in_progress` reasons) |
| vB | 52 | 0 |
| vC | 15 | 0 |
| vE | 27 | 4 (unrelated reasons) |
| vF | 26 | 0 |
| vD | Dispatch disabled — but for the scope reason, not the lifecycle | |
| v0 | Rerun enabled; Dispatch disabled via `not_configured` + native `title` | |

Not one of the seven cites the lifecycle, and not one disables rerun because of
it. This state did not exist before this pass, so this is a genuine new failure
rather than an exposed old one: the data now poses the question and every design
answers it wrong.

### 4.11 vE and vB aggregate eight branches into one stream

**State:** 26 runs across 8 branches under a subview labelled `Current Branch`.

Counting the ten distinct branch strings present in the visible surface
(portaled templates excluded):

| Version | 240 | 320 | 380 | 480 |
|---|---|---|---|---|
| vA | 6/10 | 8/10 | 9/10 | 5/10 |
| vB | branch absent from rows below b3 | | | 4/10 |
| vC | 1/10 — correct, the Branch lens filters to `main` | 1/10 | 1/10 | 1/10 |
| vE | **0 branch strings in the markup at all** | 0 | 0 | 10/10 |
| vF | axis in a portaled picker (counts as present) | picker | 9/10 | 10/10 |

vE emits no branch token anywhere below 480px — not on a row, not in a chip, not
in a menu — while showing `main` as the readiness identity above a list of 26
runs from 8 branches. `GitHub_Integration.md:L1066` forbids exactly this. It is
scored `P (b4)` under the progressive-disclosure rule, but 480px is the maximum
column width, so the disclosure never happens at the default 380px.

vF's chip axis, its whole answer to L1066, is portaled into a picker at 240 and
320px and its row line-2 (`branch - dur`) is dropped, so nothing on the visible
surface carries a branch at those widths either. It stays `Y` under the rules,
but the axis is one tap away rather than in view.

### 4.12 Nobody reads `paging`

`paging.runs` now declares `total: 320` against `shown: 26`. No version reads it.
vC's Runs-lens footer prints `26 runs`; vA and vF have load-older affordances
bound to nothing. Every design that shows a count is telling the user it has 26
runs when the fixture says it has 320.

---

## 5. Still blind

Requirements no version satisfies even now, with the cause classified.

| # | Requirement | Cause | Note |
|---|---|---|---|
| M3 | Detach grip | **design** | `FinalGUISpec.md:L687` / `L820`. Zero of seven emit one, and `index.html` / `_pm-shell.js` provide none a level up. Never fixture-dependent. |
| M17 | Triage changed files + likely next | **design** (was believed fixture) | `changedFiles` / `changedCount` / `likelyNext` are now on all four triage blocks. Still rendered only by v0, from hard-coded strings. **Reclassified from fixture to design this pass.** |
| M34 | `GI-021` capability state | **design** (was fixture) | `repository.capabilitySentence`, `capabilities` and `mutationDisabled` are now present. Zero redesigns read them; see §4.10. |
| M36 | Runner labels | **fixture** | Still no `runners[]` and no runner-label field. Run `#17`'s `detail` names `self-hosted, unraid` in prose, but there is no inventory to render and no version renders the detail. |
| S2 | Notification prefs | **design** | `notify_on_failure` / `notify_on_success` (`storage-plan.md:L1053-L1056`) appear in no menu, sheet or settings body. Not one of the seven has a place a per-panel preference could live. |
| S6 | Pin health | **fixture** | `pinned[]` still carries `status` and `badge` and no pin-health field. `active` / stale / `renamed` (`GitHub_Integration.md:L649`, `L652`) cannot be rendered from this data. |
| M35 | `GAAAF-005` host policy | **fixture** | vE branches on `connection.state === 'host_excluded'`, which the fixture never sets — `hostPolicy: 'github.com_only'` was added to `repository`, not to `connection.state`, so vE's implementation is still never exercised. Scored `Y` on presence; it has never rendered. |
| — | `GI-021` lifecycle **states** | **design** | All seven states are now in `repository.lifecycleStates`. No version renders any of them, and `remote_mismatch`, `transferred`, `renamed_redirected`, `deleted` and `historical_only` remain entirely untested. |
| — | Variables and environments as distinct inventories | **fixture** | The Settings region is "secrets / variables / environments". The fixture still ships `secrets[]` only; environments survive as a `scope` value. vC and vD build secrets and nothing else. |
| — | The other 18 blocked reason codes | **design** | `blockedTable[7]` and `readinessCodes[14]` are now both in the fixture verbatim. No version renders a code it was not handed on a specific object, no version shows that a code belongs to a family, and no version renders the `warning` tier (§4.8). |
| — | `unknown` observation state and `staleness_reason_code` | **fixture** | S4 stays partial in all seven. The fixture still carries no `unknown` observation and no `staleness_reason_code` (`GitHub_Integration.md:L2073`), so "no fresh observation" still cannot be distinguished from "failed" (`GitHub_Integration.md:L1530`). |

### The shared kit is now a blocker, not just the designs

Two of the findings above are not design defects and cannot be fixed in any
version file:

1. `_pm-kit.js:73-77` — `GLYPH` and `DASH` are keyed by the original nine
   tokens, so `cancelled` and `inconclusive` render as queued (§4.1).
2. `_pm-kit.js:257` — `K.blocked` renders buttons from `b.actions` only and
   ignores both `allowedActionIds` (§4.7) and `severity` (§4.8).

Both are small edits. Until they land, no design can score `Y` on M8 or on the
non-colour half of M10, however it is authored — which means the current M8 and
M10 columns measure the kit, not the bakeoff.

---

## 6. What this changes about the ranking

The ordering is stable — vC still leads, vD second, vA third — but the gaps
narrowed and the reasons shifted.

- **vC (70.8%)** keeps the lead and is now clearly the best blocked-state
  renderer at the row level: code, verbatim message and a real button at every
  width. Its one serious defect is that the account banner vanishes entirely at
  240px on its default lens (§4.6).
- **vD (68.1%)** takes the largest drop. It is still the only version with a job
  level and the only one implementing M33, but the job level resolves runs by a
  non-unique number and can open the wrong one (§4.4), and its run list shows no
  blocked state at all.
- **vA (65.3%)** is the most robust blocked-state renderer at narrow widths — it
  renders `#17`'s code, message and button in full at 240px — and holds the run
  number at every bucket. Its cancelled row is the one that loses its status word
  to meta overflow (§4.1).
- **vE (51.4%)** is the version the enriched data damaged most. Truncated reason
  codes, six rows losing their run number at 240px, no status word anywhere, and
  no branch token below 480px. The first audit's praise for its row identity does
  not survive rendering.
- **vF (54.2%)** held up best against the new states — it is the only version
  that prints `cancelled` from 320px up and renders `#17` completely at every
  width — but it invents two reason codes and ships contradictory disabled copy.
- **vB (41.7%)** remains the thinnest and now also drops the user message at the
  two widths where it matters most.

The single change that would most improve every design at once is the two-line
kit fix in §5. The single change that would most improve the winner is putting
M17 back: the fixture now carries changed files and likely-next-action, and
whatever ships will otherwise be a triage capsule worse than the one already in
PMConcept7 — for the second audit running.
