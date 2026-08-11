# Docker Manager — feature-completeness RE-AUDIT (pass 2, enriched fixture)

Panel id: `docker` (`docker_manager`). Audited against `research/docker.md`, which
cites `Plans/Containers_Registry_and_Unraid.md` (below: `CRAU`),
`Plans/FinalGUISpec.md` (`FGS`) and `Plans/UI_Command_Catalog.md` (`UCC`).

**This file supersedes the first pass.** The first pass ended with a root-cause
finding: six of its ten blind spots were not design failures but fixture
failures — `_pm-data.js` never carried the state, kit rule 8 forbids inventing
it, so a version that scored `absent` was obeying the rules. The fixture has now
been extended with adversarial state variety. This pass re-scores against it and,
more importantly, asks the question the first pass could not: **which designs
render something wrong now that the data poses the hard case.**

Ten implementations: the six full systems (vA vB vC vD vE vF), the three
docker-only variants in `versions/x-docker.js` (xD1 xD2 xD3), and `v0-baseline`
— the shipped PMConcept7 markup, kept as the control so pre-existing gaps stay
distinguishable from regressions.

Method, this pass: every panel was **rendered**, not only read. Each version's
`panels.docker(D, state)` was rendered to markup in Node at 240 / 320 / 380 /
520px, and then driven in a real browser (Chromium, harness at
`http://127.0.0.1:47821`, identity-checked against `/__whoami` reporting harness
`puppet-master-panel-bakeoff` and root `Concepts/panel-bakeoff`) — subview
pickers opened, every roster entry selected, hub rows drilled, xD3's command
index queried. Scoring rule is unchanged: **present** if it renders or is
reachable through a real control, **partial** if some clauses land or it is
reachable only in a degraded shape, **absent** if it exists nowhere but a
comment.

---

## 0. What is new in the fixture, and what it asks of this panel

Five additions, all inside `docker`, all flagged `STATE VARIETY` in the file:

| Fixture block | Lines | The state it poses | Requirement it unblocks |
|---|---|---|---|
| `runtime` extra fields | `_pm-data.js:909-911` | `host` / `hostId` / `writable` / `stale` / `degraded` / `observedAt` on the live runtime | M4, M5, M29 |
| `auth` | `:939-968` | Requested vs Effective divergence, `state: 'degraded'`, `degradedReason: 'credential_expired'`, the closed 5-value DockerHub capability enum with `images:push` **absent**, two `gated` controls with their sentences, `allowedActionIds` | M20, and the gating rule at `CRAU:L323` |
| `hosts` + `hostReasons` | `:989-1021` | 5 hosts: 1 local writable, 4 remote carrying the complete `CRAU:L449` family — `offline_cached`, `network_blocked_by_policy`, `host_unreachable`, `host_untrusted` — each with `readable` / `writable` / `terminalCapable` as **separate** booleans | M28, M29 |
| `subviews[10]` = Docker / Hosts | `:1043-1045` | An **eleventh roster row**, `available: true` but `degraded: true` with `degradedReason: 'host_partially_unreachable'` and a sentence. A third state between available and unavailable | M1, M2, M28 |
| `compose.scenarios` | `:1120-1139` | 4 scenarios, two of them `stale` with `drift`, `driftSummary` and a `repair` CTA | M21 |

Three of these are **new keys** (`auth`, `hosts`, `scenarios`) — invisible to a
version that does not read them. One is a **new row** in a collection every
version already renders (`subviews`), so it is visible to everyone whether they
designed for it or not. That asymmetry produced almost all of this pass's
findings.

Nothing else in `docker` moved: `containers` (24), `images` (16),
`compose.services` (10), `registries` (4), `build`, `publish.stages` (5) and
`paging` are byte-identical to pass 1, so every pass-1 number below is a valid
baseline.

---

## 1. Requirement checklist

Unchanged from pass 1 — same 32 MUST, same 5 SHOULD, same citations, so the
before/after columns are comparable. **MUST** = the brief cites a Plans
requirement. **SHOULD** = the brief recommends it but cites no mandate. Items the
brief marks as its own gap (its §8) are excluded except where the brief mandates
the surface regardless.

### MUST

| # | Requirement | Citation |
|---|---|---|
| M1 | Canonical subview roster, in CRAU-007 order | `CRAU:L1278-L1342`, `:L105-L116` |
| M2 | Unavailable subviews stay **visible with a disabled reason**, never hidden | `CRAU:L144`, CRAU-009 `:L1404-L1455` |
| M3 | Subview selector is a single-line dropdown at 240px, not a chip strip | `FGS:L2144`, brief §7.1 |
| M4 | Runtime identity strip: engine (`docker`/`podman`), effective context, detection tri-state | `CRAU:L224` |
| M5 | Stale / cached / read-only marker when runtime access is unavailable | `CRAU:L144` |
| M6 | Networks / Volumes / Contexts / Kubernetes reachable via a persistent visible subview affordance **and** an explicit Show Advanced action | `FGS:L723` |
| M7 | Identity truncation is middle-ellipsis, tail-preserving (last 8 chars unconditional) | brief §4, `CRAU:L2222-L2288` |
| M8 | Per-row status token that does not depend on colour | `FGS:L1237` |
| M9 | Per-row overflow (24px kebab) carrying the row's full action set, mirrored to the context menu | brief §6.6, §7.3 |
| M10 | One primary CTA, scoped to the active subview, living outside the list | brief §6.5, §7.3 |
| M11 | Blocked/degraded banner rendering `blocked_reason_code` plus the first `allowed_action_ids[]` entry | `CRAU:L980-L986` |
| M12 | `No direct access URL detected` verbatim, with the open action disabled rather than guessed | `CRAU:L427` |
| M13 | Disabled controls: inline reason + hover/focus tooltip + recovery CTA, still keyboard-focusable; copy from the closed six-word family | `CRAU:L168`, `UCC:L698` |
| M14 | Containers row actions: open, view_logs, attach_shell, stats, inspect | `CRAU:L1623-L1682` |
| M15 | Images: push, tag, inspect, delete, with digest / size / created visible | `CRAU:L130`, brief §4 |
| M16 | Compose: project lifecycle plus per-service up_subset / down_subset / logs / restart | `CRAU:L131` |
| M17 | Registries: browse, reconnect, pull, inspect, with capability and lifecycle state | `CRAU:L132`, `:L230` |
| M18 | Build / Bake: select_target, run, bake preview, override | `CRAU:L133` |
| M19 | Publish chain as a 5-node stepper with per-node state, plus open receipt / retry / resume / explain | `CRAU:L134`, `:L152` |
| M20 | Requested vs Effective identity block using the exact labels `Requested`, `Effective`, `Reason`, `Support`, `Inherited from`, `Overridden by` | `CRAU:L927` |
| M21 | Compose scenario list with `stale` badges and a repair CTA | `CRAU:L148` |
| M22 | Filter / sort control; project-aware ordering is mandatory | `CRAU:L144` |
| M23 | `Explain this state` affordance on status pills, disabled buttons, blocked banners, receipt rows | `CRAU:L168` |
| M24 | Every destructive action behind overflow / context menu / detail sheet | brief §2 P2.17 |
| M25 | Panel-level maintenance: cleanup advisor (scan and prune) and drift compare | `cmd.docker.cleanup.scan/.prune`, `.drift.compare` |
| M26 | Registry promotion and the hard-gated repository-creation flow | `cmd.docker.registry.promote`, `.create_repository(.confirm/.cancel)` |
| M27 | Kubernetes command family reachable, carrying its disabled reason | `CRAU:L135`, `:L224`; 9 wired `cmd.docker.k8s.*` |
| M28 | The Docker/Hosts destination and its 11 `cmd.docker.host.*` commands | `UCC:L7789-L7804` |
| M29 | CRAU-021 row states: local vs remote host context, writable vs read-only/degraded/offline, single vs multi-select, exact disabled reason | `CRAU:L2097-L2157`, `:L218` |
| M30 | First-open disclosure cards for `Containers`, `Publish / Unraid`, `Kubernetes` — one-time, dismissible to overflow | `CRAU:L236` |
| M31 | Receipt detail, publish history, `include historical publishes` toggle | `CRAU:L152` |
| M32 | Template repo lifecycle: commit, push, `Review repo state`, with the 9-value state enum | `CRAU:L776-L788`, `:L812-L825` |

### SHOULD

| # | Requirement | Source |
|---|---|---|
| S33 | Second metadata line per row at 380px (image ref, size, ports, uptime, digest prefix) | brief §2 P1.9 |
| S34 | Inline 2-action cluster at 380px (Containers: Logs + Open; Images: Push + Tag) | brief §2 P1.10 |
| S35 | Advanced foldouts (Networks / Volumes / Contexts) as collapsed accordions | brief §2 P1.16 |
| S36 | Unraid `ca_profile.xml` editor, template repo config, maintainer metadata | brief §2 P2.20, `CRAU:L66-L71` |
| S37 | Digest as a separate control rather than inline text | brief §7.2 |

---

## 2. Matrix, after the enrichment

`+` present · `~` partial · `-` absent · **bold** = changed since pass 1

| # | v0 | vA | vB | vC | vD | vE | vF | xD1 | xD2 | xD3 |
|---|---|---|---|---|---|---|---|---|---|---|
| M1 roster | - | + | + | + | + | + | + | + | + | + |
| M2 disabled-visible | - | + | + | + | + | + | + | + | + | + |
| M3 dropdown switcher | - | + | + | + | + | + | + | + | + | + |
| M4 runtime identity | + | + | ~ | + | ~ | + | ~ | + | + | + |
| M5 stale marker | - | + | - | + | - | ~ | + | - | - | - |
| M6 advanced + Show Advanced | - | + | + | + | ~ | ~ | ~ | + | ~ | ~ |
| M7 middle-ellipsis | - | + | + | + | + | + | + | + | + | + |
| M8 non-colour status | - | + | + | + | + | + | + | + | + | + |
| M9 row kebab | - | + | + | + | + | + | + | + | + | + |
| M10 one primary CTA | ~ | ~ | + | + | ~ | + | ~ | + | + | + |
| M11 blocked banner | - | + | ~ | + | + | - | + | + | + | ~ |
| M12 no-access-URL copy | - | + | + | + | - | + | + | + | + | + |
| M13 disabled discipline | - | + | ~ | + | ~ | ~ | + | + | + | ~ |
| M14 container actions | - | + | ~ | ~ | ~ | ~ | ~ | + | + | + |
| M15 image actions | ~ | - | ~ | ~ | + | - | ~ | + | + | + |
| M16 compose actions | ~ | - | + | + | ~ | ~ | + | + | + | + |
| M17 registry actions | ~ | - | - | ~ | ~ | - | ~ | ~ | ~ | ~ |
| M18 build / bake | ~ | - | - | ~ | ~ | ~ | ~ | ~ | ~ | + |
| M19 publish stepper | ~ | - | - | + | + | - | + | + | + | + |
| M20 requested vs effective | - | - | - | - | - | - | - | - | - | - |
| M21 scenario list | + | - | - | - | - | - | - | - | - | ~ |
| M22 filter / sort | - | + | - | ~ | ~ | - | + | + | - | + |
| M23 Explain this state | - | + | + | - | - | - | - | ~ | + | - |
| M24 destructive in overflow | + | + | + | + | ~ | + | + | + | + | + |
| M25 cleanup + drift | ~ | + | ~ | + | ~ | + | ~ | + | + | + |
| M26 promote + create repo | - | - | - | ~ | - | - | - | ~ | ~ | + |
| M27 k8s family | - | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | + |
| M28 Docker/Hosts | - | ~ | **~** | ~ | **~** | ~ | **~** | ~ | ~ | + |
| M29 CRAU-021 row states | - | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ | ~ |
| M30 first-open cards | - | - | - | - | - | - | - | - | - | - |
| M31 receipts / history | - | - | - | ~ | ~ | - | ~ | ~ | ~ | ~ |
| M32 template repo lifecycle | ~ | - | - | - | - | - | - | ~ | ~ | ~ |
| S33 second meta line | ~ | + | ~ | + | + | + | + | + | + | + |
| S34 inline action pair | - | + | ~ | - | + | ~ | - | - | - | - |
| S35 foldout accordions | - | - | - | ~ | ~ | - | - | ~ | - | ~ |
| S36 Unraid settings | - | - | - | - | - | - | - | - | - | - |
| S37 digest as control | - | - | ~ | ~ | ~ | - | ~ | ~ | + | ~ |

### Before / after coverage (MUST only, partial counts half, of 32)

| Version | Coverage before | Coverage after | Delta | What moved |
|---|---|---|---|---|
| xD3 Command Line | 75% | **75%** | 0 | — |
| xD1 Triage Board | 73% | **73%** | 0 | — |
| xD2 Column Ledger | 70% | **70%** | 0 | — |
| vC Lens Deck | 69% | **69%** | 0 | — |
| vF Stream | 61% | **63%** | +2 | M28 `-` to `~` (roster entry) |
| vA Ledger | 59% | **59%** | 0 | — |
| vB Gutter/Sheet | 50% | **52%** | +2 | M28 `-` to `~` (roster entry) |
| vD Drill Stack | 50% | **52%** | +2 | M28 `-` to `~` (hub row) |
| vE Cockpit | 48% | **48%** | 0 | — |
| v0 Baseline (shipped) | 22% | **22%** | 0 | — |

**The headline number is the zero.** Six of ten versions did not move at all, and
the three that moved gained the same half-point for the same reason: the fixture
now ships Docker / Hosts as a roster row, and a version that renders the roster
renders it whether it designed for it or not. Not one requirement anywhere became
`present` because a design had quietly handled a state it had never been shown.

That is the answer to question A, and it is worth stating plainly: **the pass-1
hypothesis was only half right.** The fixture was indeed blocking six
requirements — but unblocking them did not reveal latent capability, because the
three richest additions (`auth`, `hosts`, `scenarios`) are new *keys*, and
`grep -n "\.hosts\b\|\.auth\b\|scenario" versions/*.js` returns nothing but
command ids in menus. No version reads them. M20, M21, M28's content, M29's axes
and M5's evidence therefore stay unrendered, but their cause has changed from
**fixture** to **design**, which is the material result of this pass.

---

## 3. WHAT BROKE

Everything in this section was reproduced in the browser at 380px unless a width
is named, and the copy is quoted exactly as it renders.

### 3.1 Four versions now assert, in the UI, that data they were given does not exist

The Docker / Hosts subview carries `count: '5'` and the fixture carries five host
rows. Every version routes an unknown subview id into a "no rows" empty state
written for `networks` / `volumes` / `contexts`, which genuinely have counts and
no rows. That copy is now false, and in three of the four cases a count in the
frame contradicts the body directly beneath it.

**vC Lens Deck** — select `Docker / Hosts` in the lens picker
(`vC-lens-deck.js:1699-1705`, the `else` arm after the `k8s` branch):

> Docker / Hosts — 5 items
> The shared fixture carries a count for this lens but no rows.

with the frame count reading `5` and the footer reading `5 items·default`. Five
rows exist; zero render; the panel says so in its own voice.

**vD Drill Stack** — the hub row `Docker / Hosts 5` drills to
(`vD-drill-stack.js:1544` falls through to `emptyFor` at `:1321-1325`):

> DOCKER / HOSTS
> Docker / Hosts
> 5 recorded, none loaded into this projection yet.
> [Refresh]

This is vD's worst case because the hub is the whole navigation model: the row
advertises a count, promises a destination, and the destination is a full-level
denial.

**xD2 Column Ledger** — `modelFor` falls to `m.kind = 'empty'`
(`x-docker.js:534`) and `emptyFor` (`:549-556`):

> Docker / Hosts
> 5 recorded upstream, none carried in this projection.
> [Refresh]
> **0 rows**

The subview picker directly above still reads `Docker / Hosts 5`. Header count 5,
footer count 0, same frame, same instant.

**xD3 Command Line** — the sharpest of the four, because it contradicts the
version's own thesis. Clicking the `Docker / Hosts` roster row sets the scope
(`x-docker.js:1359` `var feeds = scope ? [scope] : FEEDS;`), the scoped feed
returns nothing, and the Commands group is gated off entirely when a scope is set
with an empty query (`:1366`). Result:

> Scoped to Docker / Hosts · type : for subviews, > for the 78 commands
> **No match**
> **Nothing in this runtime or the command catalogue matches.**

The catalogue demonstrably matches: typing `>host` in the same field returns
`COMMANDS 11` — `cmd.docker.hosts.open`, `cmd.docker.host.refresh`,
`.preflight`, `.profile.save`, `.session.launch`, `.instance.start/.stop/
.restart/.retain`, `.access.open_app`, `.receipt.open`. So the panel that is the
only `+` on M28 tells the user nothing exists at the one destination where all
eleven live. xD3 keeps its `+` because the commands remain reachable by query,
but the roster path to them is a dead end that lies.

### 3.2 Five versions advertise the new destination through a switcher that cannot go there

vA, vB, vE, vF and xD1 all render the eleventh roster row and all update the
switcher label when it is chosen — and none changes a pixel of the body. This is
the pass-1 "dead switcher" defect (vA hard-codes `var active = 'containers'` at
`vA-ledger.js:1149`; vB commits to `'compose'` at `:789`; vE's strip is a picker
that changes nothing; vF's feed is not subview-driven; xD1 navigates by problem,
not taxonomy) — but the enriched roster makes its *visible* consequence worse,
because the label now names a destination none of them has:

- **vA** after selecting Docker / Hosts: switcher reads `Docker / Hosts 5`, the
  header two lines above still reads `Containers · 16/24`, and the body is the
  `RUNNING 16` container ledger. Two different subviews named in one frame.
- **vB**: switcher `Docker / Hosts 5` over the compose spine and the
  `k8s_kubeconfig_missing` strip.
- **vE**: `Docker / Hosts 5` over the tastebook focus card.
- **vF**: `Docker / Hosts 5` over the event stream.
- **xD1**: `Docker / Hosts 5` over the `NEEDS YOU 14` triage feed.

(The same is true for `Images` in all five, so this is not new behaviour — what
is new is that the roster now contains a destination that exists in the data and
nowhere in the design, so the label is not merely stale, it is a promise.)

### 3.3 The degraded third state is silently mapped onto "healthy" in all ten

`subviews[10]` is `available: true, degraded: true` with
`degradedReason: 'host_partially_unreachable'` and the sentence
`Four of five hosts are read-only, unreachable or untrusted.` Every version keys
its disabled-reason disclosure off `available === false` only, so:

- The sentence **is** carried into the DOM by all seven picker-based versions
  (verified: the option div carries
  `data-sentence="Four of five hosts are read-only, unreachable or untrusted."`)
  and is **never rendered**, because `_pm-components.js:86` gates the reason line
  on `it.disabled`, and the option is not disabled.
- **vD**'s hub row for Docker / Hosts renders with no status mark and no summary
  line — `subStatus()` (`vD-drill-stack.js:1302-1309`) and `subSummary()`
  (`:1310-1319`) both fall through to `null` / `''` for an unknown id — so in a
  hub whose whole claim is "a live count, a status mark, and a one-line summary",
  the one degraded destination is the only row that reads as clean.
- **xD1**'s triage feed injects subviews only when `s.available === false`
  (`x-docker.js:571`), so the panel that promises "the default view is the
  exception set" omits the one subview whose own sentence describes four broken
  hosts.

A version cannot be faulted for not reading a field invented after it shipped.
It can be faulted for the shape of the miss: every one of them renders a
three-state value as a two-state one, and the state that vanishes is the
unhealthy one.

### 3.4 A raw `unknown` token is now one gate away from the surface (xD1, xD2)

`x-docker.js:275` — `return { code: code || 'unknown', sentence: say };` — is the
defensive read that was written so an unfamiliar row shape would not throw. The
new subview has a `sentence` but no `reason` (its code is under `degradedReason`),
so `why()` now returns the literal string `unknown` as a reason code, and
`subOptions` (`:592-603`) stamps it onto the picker option:
`data-reason="unknown"` on the `Docker / Hosts` entry in both xD1 and xD2
(verified in the DOM; vA/vB/vC/vE/vF pass `i.reason`, which is `undefined`, so
they carry no attribute). It does not paint today only because the same
`disabled` gate that suppresses the sentence also suppresses the reason line. The
moment any of the three conditions changes — the option is disabled, the design
shows reasons on enabled options, or a degraded subview is treated as blocked —
`unknown` renders where a `CRAU:L449` reason code belongs. `CRAU:L226` permits
the literal `unknown` for an unresolved *effective state*; it does not permit it
as a substitute for a code the row actually carries.

### 3.5 The control, v0-baseline

v0 renders a hard-coded 6-chip strip and reads nothing from `subviews`, so the
eleventh row is invisible to it: it now shows **6 of 11** subviews rather than 6
of 10, and Networks, Volumes, Contexts, Kubernetes and Docker / Hosts have no
chip, no menu entry and no reason code. Its `CRAU:L144` / `FGS:L723` failure got
one row deeper without a line of code changing — which is the exact property that
makes it useful as a control: **every finding above is a redesign finding.** v0's
own defects are unchanged (96 R4 hit-target failures across 4 widths x 4 themes,
the known baseline defect the fit checker exists to detect).

### 3.6 What did NOT break

Worth recording, because it was the obvious risk. The eleventh roster row
introduced **zero** new layout failures: 10 versions x 4 widths x 4 themes = 160
docker combinations, `0` R-tier findings for all nine redesigns (warn counts
unchanged in shape: vF 0, vA/xD1/xD3 8, vD 10, vC 15, vE 21, vB 23, xD2 24), and
v0's expected 96. The reason is that `_pm-kit.js:286-309` collapses the lens strip
**by arithmetic, not by bucket** — ten subviews already needed 578px against a
464px band, so the strip was already a dropdown at every width and an eleventh
item changed a list length, not a layout. vD's hub is vertical and xD3's roster is
a vertical list; neither has a width budget to blow.

No version threw. No `undefined`, `NaN`, `[object Object]` or empty identity
appears in any rendered docker panel at any of the four widths.

---

## 4. Still blind — and whose fault it is now

| # | Requirement | Versions satisfying | Cause, after the enrichment |
|---|---|---|---|
| 1 | **M20** Requested vs Effective block, six exact labels (`CRAU:L927`) | 0 of 10 | **Design.** Was fixture. `docker.auth` now ships the six labels spelled out, a `degraded` state, `credential_expired`, and the closed capability enum with `images:push` absent and two `gated` controls naming it. `CRAU:L323`'s rule — visible but disabled, citing the missing capability — has a surface to attach to and no taker. vC and vD already build this exact block in the **Actions** panel for the GitHub account. |
| 2 | **M21** Compose scenario list, `stale` badge, repair CTA (`CRAU:L148`) | v0 only (hard-coded) | **Design, and still a regression.** `compose.scenarios` now ships 4 rows, 2 stale, with `drift`, `driftSummary` and a `repair` action. Nine of nine redesigns render none of it. Shipping any redesign as-is still costs users a feature they have today. |
| 3 | **M28** content: the 5 hosts and 11 `cmd.docker.host.*` commands | xD3 (commands only, and its roster path is broken — §3.1) | **Design.** `hosts` ships 5 rows; the destination renders in 0 of 10. |
| 4 | **M29** local-vs-remote host context and writable-vs-read-only (`CRAU:L2097-L2157`, `:L218`) | 0 of 10 | **Design.** The fixture now supplies `kind: local/remote`, `readable`, `writable`, `terminalCapable` as separate booleans and the complete `CRAU:L449` family (`offline_cached`, `network_blocked_by_policy`, `host_unreachable`, `host_untrusted`), precisely so `Download / Save Local Copy` (readable, not writable) and `Open in Terminal` (`terminalCapable`) become testable. Nothing renders any of it. Only xD2 still does single-vs-multi-select. |
| 5 | **M5** stale / cached read-only runtime marker | vA, vC, vF (vE unreachable) | **Mixed.** The live `runtime` is deliberately clean (`stale: false`, `state: 'ok'`), so the marker still has nothing to show on the runtime strip — but `hosts[1]` is `state: 'stale'`, `writable: false`, `offline_cached`, so the *state* now exists in the panel's data. All three xD variants still compute `runtime.state` in `runtimeOf` (`x-docker.js:278-287`) and discard it. |
| 6 | **M30** first-open disclosure cards (`CRAU:L236`) | 0 of 10 | **Fixture.** No disclosure/one-time-card record exists anywhere in `_pm-data.js`. Under rule 8 this is still unbuildable. |
| 7 | **M31** receipt detail, publish history, `include historical publishes` (`CRAU:L152`) | 0 of 10 | **Fixture.** `publish.stages` still carries five `{n, id, label, status}` and nothing else — no `build_result_id`, no `publish_result_id`, no receipt, no history. (`tests.runs` gained `receiptId`; `docker.publish` did not.) |
| 8 | **M32** template repo 9-state enum and `Review repo state` (`CRAU:L776-L788`) | 0 of 10 | **Fixture.** The nine states render nowhere because none of them is in the file; `Commit template` / `Push template` stay unconditioned commands. |
| 9 | **M27** K8s workload half (`CRAU:L135`) | xD3 (commands only) | **Fixture.** The k8s subview carries `k8s_kubeconfig_missing` and no workloads, manifests or Helm sources, so `apply` / `diff` / `logs` / `exec` / `port_forward` have no rows to attach to. Commands are reachable; the surface is not buildable. |
| 10 | **M26** the hard-gated repository-creation confirm dialog | 0 of 10 (xD3 lists the ids) | **Kit.** There is no `PMK.confirm`, `PMK.sheet` or `PMK.dialog` in `_pm-kit.js` — the exported surface is `blocked`, `empty`, `row`, `section`, `select`, `overflow`, `lenses`, `kv`, `metaRun`, `card`, `btn`, `chip`, `filter`, `head`, `strip`, `panel`, `icon`, `esc`, `elide`, `idChars`, `statusMark`, `statusOf`. No version can render a protected confirm flow without inventing a component. Same for the promotion form and tag template editor. |
| 11 | **M17** registry `pull` and `inspect` | 0 of 10 | **Spec.** `pull` is a known catalog gap (brief §8.4: neither `cmd.docker.pull` nor `cmd.docker.image.pull` is registered); `inspect` is not, and is simply absent from every menu. |
| 12 | **M23** `Explain this state` (`CRAU:L168`) | vA, vB, xD2 (+ xD1 at bucket 3 only) | **Design.** Six of ten still have none. Unchanged by the enrichment and still the most frequently dropped mandated control in the panel. |

**Score of the causes.** Pass 1 named six requirements as fixture-blocked. Four of
them (M20, M21, M28 content, M29) are now unblocked and unbuilt — they have moved
into the design column and are legitimately scoreable against any version that
ships. Three (M30, M31, M32) plus M27's workload half remain genuinely
fixture-blocked and should not count against any design until the fixture carries
receipts, template-repo state, k8s workloads and a first-open record. One (M26)
is blocked by the kit, not by the data or the design.

---

## 5. Per-version deltas since pass 1

Only what changed. Pass-1 findings not repeated here still stand.

**v0-baseline (22%, control)** — unchanged code, one degraded fact: 6 of 11
subviews, and the new destination is invisible to it. Still the only
implementation with a compose scenario list, which the enriched
`compose.scenarios` now makes an even sharper regression against the field.

**vA Ledger (59%)** — no change. The 11-item picker is still correct and still
inert; §3.2 is its cost. The best disabled-control story in the bakeoff (M13) is
also the one that would have made `auth.gated` render for free had it read the
key: `Push to registry` disabled with `images:push` cited is exactly its existing
row grammar.

**vB Gutter/Sheet (50% to 52%)** — M28 gains a roster entry that goes nowhere.
Everything else stands, including the inverted `Open access URL` (reachable only
for the failed container) and the missing filter against 24 rows.

**vC Lens Deck (69%)** — the most complete full system is also, this pass, one of
the four that renders a false statement (§3.1). Its lens fallback was honest when
it was written and is not any more. Cheapest fix in the audit: the `else` arm at
`vC-lens-deck.js:1699` needs one more branch, and `hosts` is a list of five rows
with a status token and a reason code — the exact shape `row()` already takes.

**vD Drill Stack (50% to 52%)** — gains the hub row, loses credibility at the
destination (§3.1, §3.3). The pass-1 M12 finding is unchanged and still the most
serious correctness defect in the panel: `vD-drill-stack.js:1396`
`{ label: c0.url ? 'Open app' : 'Inspect' }` silently substitutes a different
action where `CRAU:L427` mandates a verbatim string and a disabled control.

**vE Cockpit (48%)** — no change; still the least coverage of the mandated
surface. Its `Docker / Hosts` overflow item and its roster entry now both name a
destination it does not have.

**vF Stream (61% to 63%)** — gains the roster entry. Its pinned `RUNTIME` strip
reads `containers 16/24 · images 16 · volumes 9` from fixed indices
(`vF-stream.js:1058-1060`); the new row was appended at index 10, so those
indices still resolve — a fixture discipline note, not a version credit.

**xD1 Triage Board (73%)** — no score change, two new observations: the triage
feed omits the degraded subview (§3.3) and it is one of the two versions now
carrying a literal `unknown` in the option markup (§3.4). Its CRAU-009 treatment
of the *unavailable* subview remains the best in the bakeoff.

**xD2 Column Ledger (70%)** — no score change; the only version whose switcher
actually switches to the new subview, which is why it is the only one that
renders a header count and a body count that contradict each other in one frame
(§3.1). Still the only multi-select implementation, which is now more valuable
than it was: with five hosts and four host states, batch scope is a real question.

**xD3 Command Line (75%)** — no score change; the roster path to Docker / Hosts
is broken (§3.1) while the query path to all eleven host commands works. Its
`Subviews 11` header is the only count in the bakeoff that tracked the fixture
change automatically.

---

## 6. What this pass says about picking a winner

The enrichment did not reorder the field: the same three variants lead, the same
control trails. What it changed is the character of the remaining gaps. Before
this pass, "no version renders Requested vs Effective" was an indictment of the
fixture. After it, it is an indictment of nine designs, and the four requirements
that moved from fixture to design (M20, M21, M28 content, M29) are all
concentrated in the same place: **the panel has no surface for identity, host
context or capability** — only for inventory. Every version in this bakeoff is a
list of things you own. None of them is an account of what you are allowed to do
with them, which is what the Publish / Unraid story is made of.

That is the gap the winner has to close, and it is now buildable.
