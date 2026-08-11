# Feature-completeness audit — Agents panel (`agents`) — PASS 2, enriched fixture

Supersedes the first pass. Same requirement checklist, same seven
implementations, **new data**. The first pass found that most `A` scores were
fixture-blocked: kit rule 8 says all content comes from `_pm-data.js`, so a
version author who never rendered an unresolvable registry entry was obeying
the rules, not failing. `_pm-data.js` has since grown adversarial state
variety. This pass re-scores against it and, more importantly, records what
now renders **wrong**.

Method: every number below comes from a headless render of the registered
`agents` panel function at 240 / 320 / 380 / 480 (`basic-dark`), driven
directly from `_pm-data.js`, with the two stateful designs pushed into the
levels their default state hides (vC's lens set to `available` / `history`,
vD's back-stack seeded to `blocked` / `queued` / `available` and to an object
view). Server identity confirmed before measuring: `/__whoami` reports harness
`puppet-master-panel-bakeoff`, root
`/Users/jaredsmacbookair/Documents/PuppetMaster/Concepts/panel-bakeoff`,
`_pm-data.js` 150686 bytes, sha1 `169fa176b09e`.

## What is new in the fixture

`_pm-data.js:1363-1569`. Active grew 11 → **15**, completed 12 → **13**,
available 14 → **16**. Every pre-existing row and key survives, and the new
active rows are appended so `active[2]` and `active[3]` — which vD reads by
index — do not move.

| New state | Where | Answers |
|---|---|---|
| `blockedFor` / `blockedAt` on all 5 blocked rows | `:1386`, `:1402`, `:1438`, `:1445`, `:1461` | M12 |
| `allowedActionIds[]`, **different per row** | same rows | M13 |
| `session: 'disconnected'` / `'restoring'` as blocked rows | `:1435-1448` | M16 |
| `remediation: {generation 3, ceiling 3, autoRetry false}` + `remediation_ceiling_exceeded` | `:1458-1467` | M15 |
| `requestedPersona` / `effectivePersona` / `personaDiverged` | `:1476-1483` (active), `:1540-1543` (registry) | M9 |
| `resolution: 'unresolvable'`, `enabled: false`, `error`, `detail` | `:1547-1556` | M8 |
| `provenance: protected_core / bundled / user_created` on all 16 | `:1527-1556` | M22 |
| `outcome: 'cancelled'` with real `status: 'cancelled'` | `:1503-1504` | M5 third outcome |
| `specStatus` carrying the exact F3-147 lifecycle token | several rows | M3 |

Two things the fixture deliberately did **not** add: the §7.19 compact audit
summary row and its time-range / export controls (`:1360-1362`). Those are a
second surface, not a field, so M20 and M21 stay fixture-blocked by design.

Also relevant, and it bites below: the shared status vocabulary was extended
from 9 tokens to 11 (`_pm-data.js:127-162`), but `_pm-kit.js:73-77` keeps its
**own** `GLYPH` and `DASH` maps keyed by the original nine. `K.statusMark('cancelled')`
therefore falls back to `GLYPH[token] || 'circle'` and `DASH['cancelled'] === undefined`.

---

## 1. Requirement checklist

Unchanged from pass 1 — same 24 MUSTs, same 12 SHOULDs, same exclusions
(`research/agents.md` §4 and §9 items marked proposed or as spec gaps). The
final column is new: whether the enriched fixture now poses the state at all.

### MUST (24)

| # | Requirement | Plans citation | Fixture poses it? |
|---|---|---|:--:|
| M1 | Region `active_runs` — live child-run rows projected from the registry | `FinalGUISpec.md:L30373-L30421` (F3-452), `:L1720-L1728` (§7.19) | yes (15) |
| M2 | Every active row the registry supplies is rendered; nothing silently filtered | `orchestrator-subagent-integration.md:L1334` | yes |
| M3 | Five lifecycle states as exact tokens, visibly distinguished: `running`, `queued`, `blocked`, `remediation`, `completed` | `FinalGUISpec.md:L1720-L1728`; F3-147 `:L11889-L11935` | **new** (`specStatus`) |
| M4 | §7.19's four required fields on active rows: status, owning thread, target, outcome | `FinalGUISpec.md:L1720-L1728` | yes |
| M5 | Historical / completed child-run activity carrying its outcome | `FinalGUISpec.md:L1720-L1728` | **new** (`cancelled`) |
| M6 | Region `available_subagents` — launchable registry entries ("active **and** available") | `FinalGUISpec.md:L30373-L30421` | yes (16) |
| M7 | Each available entry resolves to a Persona and the resolution is surfaced | `orchestrator-subagent-integration.md:L1157` | yes |
| M8 | Unresolvable entries render **disabled with the resolution error**, never hidden | `orchestrator-subagent-integration.md:L1334` | **new** (2 rows) |
| M9 | Requested vs effective identity surfaced where they diverge | `orchestrator-subagent-integration.md:L1157`, `:L1169` | **new** (2 rows) |
| M10 | Lineage entrypoint on every active and completed row | `FinalGUISpec.md:L30373-L30421` | yes |
| M11 | Blocked rows carry `blocked_reason_code` **verbatim**; no agents-local authority state minted | `FinalGUISpec.md:L3984-L4005`, `:L4005` | yes (6 codes) |
| M12 | Blocked rows carry time since blocked | `FinalGUISpec.md:L3743` | **new** (`blockedFor`) |
| M13 | Blocked rows expose the primary `allowed_action_ids[]` as action buttons | `FinalGUISpec.md:L3743`, `:L3755-L3758`, `:L3984-L4005` | **new** (per-row) |
| M14 | Multiple concurrent blocked episodes MUST NOT collapse; each is a distinct actionable item | `FinalGUISpec.md:L3745` | yes (5 now) |
| M15 | Remediation ceiling: "Remediation limit reached", lineage visible, Replan / Manual fix / Abort, **no automatic-retry affordance** | `FinalGUISpec.md:L3749-L3760` | **new** |
| M16 | `disconnected` and `restoring` surface as `blocked` plus a reason code | `FinalGUISpec.md:L3993-L3994` | **new** |
| M17 | Mirror-only: no panel-held subagent state, no panel-local launch control | `FinalGUISpec.md:L30373-L30421`; `orchestrator-subagent-integration.md:L1176` | n/a |
| M18 | Edit affordances route to Agent-Config; no persona / crew / tier / provider UI | `FinalGUISpec.md:L1398-L1415`; `orchestrator-subagent-integration.md:L1108-L1113` | n/a |
| M19 | Per-row links to chat messages, artifacts, investigation records, review bundles | `FinalGUISpec.md:L1720-L1728` | yes |
| M20 | The 5-item compact audit summary row format | `FinalGUISpec.md:L1729-L1747` | **no, by design** |
| M21 | Activity query controls: event family, tool/operation search, time range, drill-down, export | `FinalGUISpec.md:L1729-L1747` | **no, by design** |
| M22 | `protected_core` / bundled / user-created provenance badges | `FinalGUISpec.md:L1398-L1415` | **new** (all 16) |
| M23 | Every row and badge at least 24px, single focusable element, arrow / Enter / Escape / Home / End | `FinalGUISpec.md:L2144-L2147`, `:L2129-L2135` | n/a |
| M24 | At 240px all extras sit behind an overflow menu | `FinalGUISpec.md:L2081-L2090` (§12.2) | n/a |

### SHOULD (12)

| # | Requirement | Brief |
|---|---|---|
| S1 | Header carries active and blocked counts; blocked count is a **button** | §7.1 |
| S2 | Regions 1, 2, 4 are one list surface with group headers | §1 closing note |
| S3 | Exactly one lifecycle group expanded at a time at 240px | §8.1 |
| S4 | Blocked opens a filtered full-height list, not an inline expansion at 240px | §6 rule 1, §8.1 |
| S5 | Available is collapsed, count-first, expands to a sheet, never interleaved | §7.5, §8.2 |
| S6 | Elapsed time on active rows | §3 P1 |
| S7 | Filter control by lifecycle state | §3 P1 |
| S8 | Owning thread is second-line metadata at 380+, dropped at 240, reachable from overflow | §8.3 |
| S9 | Row activation is the lineage route at 240px | §7.7 |
| S10 | Watch and Cancel on active rows; Cancel destructive and confirm-gated | §5, §4 |
| S11 | Route to the §7.19 Agent Activity surface | §4 |
| S12 | Remediation generation counter and lineage-tree entry | §3 P2 |

---

## 2. Coverage, before and after

`P` = 1, `~` = 0.5, `A` = 0, over 24 MUSTs. "Before" is the pass-1 figure.

| Version | MUST before | MUST after | Delta | One-line reason |
|---|:--:|:--:|:--:|---|
| vA-ledger | 67% | **69%** | +2 | Renders all 5 blocked episodes with codes; M13 drops to partial now that per-row action ids exist and it still emits a fixed triple. |
| vC-lens-deck | 60% | **65%** | +5 | Only version rendering all 15 active rows *and* every reason code; leaks `unresolved` into the registry lens. |
| vE-cockpit | 56% | **60%** | +4 | Session and ceiling rows land in its Blocked group intact; still drops 3 rows and still offers navigation where actions are required. |
| vB-gutter-sheet | 56% | **60%** | +4 | Still the only version rendering all 15 active rows; the mandated Available region is still empty, which now means it hides the two rows L1334 forbids hiding. |
| vD-drill-stack | 56% | **58%** | +2 | Blocked screen is still reason-less and action-less, now for 5 rows; new duplicate-name collision opens the wrong record. |
| vF-stream | 52% | **50%** | **-2** | The hardcoded 4-element array now drops 11 of 15 active rows and 4 of 5 blocked episodes. |
| v0-baseline (control) | 6% | **6%** | 0 | Static markup. Unaffected by any fixture change, which is the point of the control. |

Five of six redesigns improved without an edit — those were real fixture
blocks. The band tightened from 52-67 to 50-69, and the block of requirements
**no** version meets is still larger than the spread.

### MUST matrix, after

| # | v0 | vA | vB | vC | vD | vE | vF |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| M1 active_runs | ~ | P | P | P | P | P | P |
| M2 no silent filtering | A | ~ | P | P | ~ | ~ | A |
| M3 five lifecycle tokens | A | P | ~ | ~ | ~ | ~ | ~ |
| M4 status / thread / target / outcome | A | P | ~ | ~ | P | ~ | ~ |
| M5 completed + outcome | A | P | P | P | P | P | P |
| M6 available_subagents | A | P | **A** | P | P | P | P |
| M7 persona resolution | A | **~** | A | **~** | **~** | **~** | **~** |
| M8 unresolvable entries | A | A | A | A | A | A | A |
| M9 requested vs effective | A | A | A | A | A | A | A |
| M10 lineage entrypoint | A | P | P | P | P | P | P |
| M11 reason code verbatim | A | P | P | P | ~ | P | ~ |
| M12 time since blocked | A | A | A | A | A | A | A |
| M13 allowed_action_ids as buttons | A | **~** | ~ | ~ | A | A | ~ |
| M14 blocked never collapsed | A | P | P | P | ~ | P | A |
| M15 remediation ceiling | A | **~** | **~** | **~** | **~** | **~** | A |
| M16 disconnected / restoring | A | **P** | **P** | **P** | **~** | **P** | A |
| M17 mirror-only, no launch | P | P | P | P | P | P | P |
| M18 route to Agent-Config | A | P | P | P | P | P | P |
| M19 per-row §7.19 links | A | P | P | ~ | P | ~ | P |
| M20 audit summary row format | A | A | A | A | A | A | A |
| M21 activity query controls | A | ~ | ~ | ~ | ~ | ~ | ~ |
| M22 provenance badges | A | A | A | A | A | A | A |
| M23 24px + list keyboard nav | A | P | P | P | P | P | P |
| M24 240px overflow pattern | A | P | P | P | P | P | P |
| **MUST** | **6%** | **69%** | **60%** | **65%** | **58%** | **60%** | **50%** |

Bold = changed from pass 1. Note the shape of the change: M15 and M16 moved
for five versions at once, because both were pure fixture blocks and the
designs already had blocked-row machinery. M7 moved the other way for five
versions at once, because all five print `a.persona` unconditionally.

### SHOULD, changes only

| # | Change | Versions |
|---|---|---|
| S6 | Elapsed still renders, but on blocked rows it is now the **wrong number** — see B4 | vA vC vD vE vF |
| S7 | vC's state filter is the only one offering `Remediation`; still no version filters on `session` | — |
| S12 | Fixture now supplies `remediation.generation` / `.ceiling`; no version reads either | all |

Everything else in the SHOULD table is unchanged from pass 1.

---

## 3. WHAT BROKE

Ten findings, ordered by damage. Each names the version, the exact state, and
what it renders instead. All were rendered and read, not inferred.

### B1. vF-stream drops 11 of 15 active rows and 4 of 5 blocked episodes

`versions/vF-stream.js:1352`:

    var order = [G.active[1], G.active[0], G.active[2], G.active[3]];

Unchanged since pass 1, and the enriched fixture makes it four times worse.
The render at every width is **17 events: 4 active + 13 completed**. Absent
entirely: `lane-a core worker`, `lane-c web worker`, `Migration Warden`,
`Rounding Investigator` (both of them), `Perf Prospector`, `Doc Scribe`,
`Dependency Steward`, `Media Pipeline Wrangler`, `Schema Cartographer`,
`Import Regression Hunter`.

The panel's own pinned strip is computed from the full array
(`:1321-1322, 1331-1333`) and renders `5 blocked` and
`15 active . 13 recent . 16 available`. So **the header says 5 blocked and
the list shows 1**, and `needs_approval`, `agent_session_disconnected`,
`agent_session_restoring` and `remediation_ceiling_exceeded` appear nowhere in
the markup at any width. `FinalGUISpec.md:L3745` — concurrent blocked episodes
must not collapse — is violated four times over by one line.
The chip strip also renders `All 28` above 17 events.
**Damage: disqualifying**, and it is the only version whose score went down.

### B2. vB-gutter-sheet hides both unresolvable registry entries

`versions/vB-gutter-sheet.js:1111` is still
`K.section('Available', G.available.length, false)` with **no rows emitted at
any bucket** — verified: the section button is literally the last node in the
body, `aria-expanded="false"`, `Available 16`.

In pass 1 this was an empty region. It is now a **fail-fast violation**:
`security-auditor` and `schema-cartographer-v2` carry
`resolution: 'unresolvable'` and an `error` string, and
`orchestrator-subagent-integration.md:L1334` says in as many words *"Do not
silently filter."* vB filters all 16, including those two. A registry entry
that is not listed is indistinguishable from one that never existed — the
exact failure the rule exists to prevent. **Damage: high.**

### B3. Every version renders blocked actions the row does not allow

The fixture now supplies `allowedActionIds[]` per blocked row, and they
differ. **No version reads the field** — `grep allowedActionIds versions/*.js`
returns nothing. Each emits a fixed set:

| Row / reason code | `allowedActionIds[]` | vA renders | vC renders |
|---|---|---|---|
| Deploy Sentinel / `needs_authority` | grant_authority, abort_node | Replan node, Manual fix, Abort node | Open lineage, Replan node, Abort node |
| Migration Warden / `needs_approval` | approve_node, open_for_edit, abort_node | same fixed triple | same fixed triple |
| Media Pipeline Wrangler / `agent_session_disconnected` | reconnect_session, abort_node | same fixed triple | same fixed triple |
| Schema Cartographer / `agent_session_restoring` | **open_for_edit only** | same fixed triple | same fixed triple |
| Rounding Investigator / `remediation_ceiling_exceeded` | replan_node, open_for_edit, abort_node | same fixed triple | same fixed triple |

vA's hardcoded triple is correct for exactly **one of five** rows (the
ceiling row, by coincidence). vC's is correct for **zero** — it never offers
`open_for_edit` at all.

Two consequences worth naming individually:

- The only action that can unblock `Deploy Sentinel` is **grant_authority**,
  and no version offers it. vA and vC offer Replan and Abort instead. A user
  looking at the panel's most prominent blocked delegation can do everything
  except the one thing that would help.
- `Schema Cartographer` is `restoring`; its sentence reads *"The session is
  restoring from a checkpoint. No action is needed yet."* and its only allowed
  action is `open_for_edit`. vA and vC render **Abort node** next to that
  sentence. Offering a destructive action on a self-healing session, directly
  beside prose saying no action is needed, is the worst single pairing in the
  bakeoff.

vE (`:1396-1401`) still supplies `Open owning thread` and `Open lineage` —
navigation, not actions. vD supplies the same two (`:1884-1885`). vF supplies
a minted `Request authority` (`:1375-1376`), as does vB's row overflow
(`:1082`) — and vB now attaches "Request authority" to the ceiling row and the
restoring row, where authority is not the issue at all. `research/agents.md`
§6 is explicit: do not mint an agents-local authority state.
**Damage: high, and uniform.** This is the single requirement the fixture
change most sharply exposed.

### B4. Blocked rows are ranked by the wrong clock

`blockedFor` and `blockedAt` are read by no version. All five that show a time
on blocked rows (vA `:1536`, vC `:2019`, vD `:1798`, vE `:1447`, vF `:1357`)
show `elapsed`, which is the age of the **run**, not the time since blocked.
For two of five rows those differ:

| Row | `elapsed` shown | true `blockedFor` |
|---|---|---|
| Deploy Sentinel | 3h 12m | 3h 12m |
| Rounding Investigator (ceiling) | 1h 04m | 1h 04m |
| **Media Pipeline Wrangler** | **52m 04s** | **12m 31s** |
| **Schema Cartographer** | **18m 47s** | **38s** |
| Migration Warden | 41s | 41s |

The visible ordering is therefore wrong. By true blocked age the queue is
Deploy Sentinel, Rounding Investigator, Media Pipeline, Migration Warden,
Schema Cartographer. By the number on screen, **Schema Cartographer — blocked
for 38 seconds, self-restoring, explicitly no action needed — outranks
Migration Warden**, which has been waiting 41 seconds for approval on a
destructive column type change. The panel sorts the least urgent item above a
destructive-migration approval. Pass 1 called M12 "the cheapest gap to close
and the most operationally costly to leave"; the fixture closed its half and
nothing moved. **Damage: moderate-to-high**, and the fix is one field name.

### B5. vD-drill-stack opens the wrong record on a duplicate name

`versions/vD-drill-stack.js:1807-1813`:

    function find(arg) {
      var parts = String(arg || '').split(':');
      var list = parts[0] === 'completed' ? G.completed : parts[0] === 'available' ? G.available : G.active;
      var out = list[0];
      list.forEach(function (x) { if (x.name === parts[1]) out = x; });
      return out;
    }

Last match wins, and rows are keyed by display name. `Rounding Investigator`
now appears **twice** in `G.active` — index 7 (`queued`, `elapsed: '--'`) and
index 13 (`blocked`, the remediation ceiling). Both rows emit
`data-vd-arg="active:Rounding Investigator"`.

Verified: drilling the **queued** row from the Queued list renders the
**blocked ceiling** record — `Elapsed 1h 04m`, `Run #46`, and a blocked banner
reading `remediation_ceiling_exceeded` / "Remediation limit reached after 3
attempts." The queued row is unreachable; its record cannot be opened at all.
The fallback is worse than the collision: on any unmatched arg `find` silently
returns `list[0]`, so a stale back-stack entry renders a different agent's
record under the previous title with no error. **Damage: high** — a row that
opens someone else's record is a correctness failure, not a layout one.

### B6. The cancelled outcome renders with the queued mark

`_pm-data.js:146-158` warns about this and it happens exactly as predicted.
`_pm-kit.js:73-77` keys `GLYPH` and `DASH` to the original nine tokens, so
`K.statusMark('cancelled')` produces `GLYPH['cancelled'] || 'circle'` and
`DASH['cancelled'] === undefined`. Rendered mark on the completed
`Perf Prospector` row in **vA, vB, vC, vE and vF**:

    <span class="pmk-mark pmk-t-off" role="img" aria-label="Cancelled">
      <span class="pmk-rail"></span>
      <svg class="pmk-glyph" ...><circle cx="12" cy="12" r="8"/></svg>

Solid circle, solid rail — byte-identical in shape and dash to `queued`. The
documented contract is glyph `slash`, rail `dashed` (`_pm-data.js:159`). Of
the four non-color channels `FinalGUISpec.md:1237` requires, **two collapse**;
only the accessible label and the status word survive, and the surviving
colour difference (`pmk-t-off` vs `pmk-t-idle`) is the one channel that does
not count. A cancelled child run and a queued one are the same shape.
This is a **kit** defect, not a version defect — a two-line edit to the GLYPH
and DASH maps fixes all five at once — but it reaches the user through five
panels, and `_pm-kit.js` was out of scope for the fixture pass.

### B7. `unresolved` leaks to the UI as if it were a Persona

Every version that renders the registry prints `a.persona` unconditionally.
For the two unresolvable entries that field is the literal string
`'unresolved'`, and it renders in the Persona slot:

| Version | What renders |
|---|---|
| vA `:1629` | Row `security-auditor`, meta segment `unresolved` |
| vC `:2047-2048` | Persona column `unresolved`, and the row tooltip reads **"security-auditor resolves to persona unresolved"** — a false sentence about a row whose whole point is that it does not resolve |
| vD `:1853` | Available list meta `unresolved`; the object view renders exactly **one** KV, `Persona: unresolved`, and suppresses the other six as empty |
| vE `:1490` | Overflow item `security-auditor`, hint `unresolved` |
| vF `:1326` | Roster option text `security-auditor  unresolved` |

None of the five renders `error`, `detail` or `enabled: false`; all five leave
the row fully enabled with an "Open in Agent Config" action that cannot
succeed. vC additionally hardcodes `status: 'queued'` on every available row,
so the unresolvable entries carry `aria-label="Queued"` and the queued circle
glyph — **a broken registry entry is announced to a screen reader as
queued**, i.e. as something about to run.

### B8. vD's hub asserts two counts the panel cannot support

`versions/vD-drill-stack.js:1823` prints `G.active.length + ' live'` = **"15
live"**, but the drills are `want = 'running' | 'blocked' | 'queued'`
(`:1869-1876`), so only 12 rows are reachable. `lane-c web worker`
(`attention`), `Perf Prospector` (`prohibited`) and `Dependency Steward`
(`stale`) have no route. Pass 1 flagged this at 11-vs-8; the gap is now
15-vs-12 and it is still the only *visible arithmetic contradiction* in the
bakeoff rather than a silent drop.

New this pass, at `:1839`: the Available hub row summary reads
`G.available.length + ' personas resolve'` = **"16 personas resolve"**. Two do
not. The one line of prose the hub devotes to the registry is now false, and
it is false about precisely the state the fixture added to test it.

### B9. vB's Running group is three states wide and the header counts them

`versions/vB-gutter-sheet.js:1017-1022` classifies
`if blocked ... else if queued ... else running`. That is still the right
instinct — vB is one of two versions that renders all 15 active rows — but
`attention`, `prohibited` and `stale` fall into the `running` bucket, and the
header at `:1029` is computed from that bucket:

    HEADCOUNT  8 running · 5 blocked        (rendered, every width)

Five agents are running. The panel says eight, and lists a policy-prohibited
delegation and a 46-minute-stalled one under a header reading **Running**. The
per-row status mark is still correct, so the contradiction is between the
header and the rows beneath it. An `Other` group fixes it.

### B10. Persona substitution renders as ordinary identity

`Import Regression Hunter` requested `Investigator`, got `Implementer`, and
carries `personaDiverged: true` plus a sentence. No version reads any of the
four divergence fields. vA, vB, vC and vE all render the row with
`Implementer` in the Persona slot and nothing else — indistinguishable from
the four rows that genuinely are Implementers. The same is true of the
registry entry `Performance Prospector`, which renders `Investigator` while
resolving to `Implementer`.

This is M9 scoring `A` as it did in pass 1, but the character has changed: in
pass 1 the state did not exist, so `A` meant "untested". It now exists, is
rendered, and is rendered **as its opposite** — a silently substituted persona
presented as a normal one is exactly the drift `research/agents.md` §2 says
the panel exists to expose. vF is the accidental exception: it drops the row
entirely (B1), so it cannot mis-render it.

---

## 4. Still blind

Requirements no version satisfies even now, with the cause attributed.

| # | Requirement | Cause | Note |
|---|---|---|---|
| M8 | Unresolvable entries disabled with the resolution error | **design** | Fixture supplies `resolution`, `enabled: false`, `error`, `detail`. Five versions render the row enabled with a leaked token (B7); vB hides it (B2). Nobody has a disabled/unresolvable code path. |
| M9 | Requested vs effective identity | **design** | Four fields supplied and unread (B10). Every version already implements this idea in the **Actions** panel for the GitHub account (vA `:944-946`, vC `:1441-1442`, vD `:1192-1194`) — the pattern exists, it was simply never carried into Agents. |
| M12 | Time since blocked | **design** | `blockedFor` / `blockedAt` supplied and unread; `elapsed` substituted, and it is the wrong number for 2 of 5 rows (B4). |
| M13 | `allowed_action_ids[]` as action buttons | **design** | Supplied per row and unread by all seven (B3). The single highest-value fix in the panel. |
| M22 | Provenance badges | **design** | `protected_core` / `bundled` / `user_created` on all 16 entries, read by nobody. All 16 rows still read identically, so a user cannot tell a shipped subagent from one they wrote, and cannot tell why a `protected_core` row's edit action is disabled. |
| M20 | 5-item compact audit summary row format | **fixture, deliberate** | `_pm-data.js:1360-1362` records the decision: this is a second surface, not a field, and was left out rather than faked with a stub. Unscorable until an Agent Activity fixture exists. |
| M21 | Time-range query and export | **fixture, deliberate** | Same source. Drill-down is universal, free-text search exists in four of six, a state filter in five; time-range and export exist in zero and cannot be attempted. |
| S9 | Row activation is the lineage route | **kit / harness** | `_pm-shell.js` has no row-activation dispatch at all — `grep 'data-pm-act\|data-pm-go'` returns nothing. Rows are selection-only in every version. This is one harness gap, not six design failures, but it means §7.7's load-bearing 240px behaviour has never been tested. |
| S12 | Remediation generation counter and lineage-tree entry | **design** | `remediation: {generation: 3, ceiling: 3, lineageRef}` supplied; no version renders "3 of 3" or follows `lineageRef` to `cmd.runtime.open_remediation_lineage`. |
| — | `cancelled` and `inconclusive` marks | **kit** | B6. `_pm-kit.js:73-77` needs two map entries. Not a version defect and not fixable in a version. |

Attribution summary: pass 1 listed nine blind spots, six of which it called
fixture-blocked. After the fixture grew, **one** of those six (M15/M16, the
ceiling and session states) closed on its own for five versions, **two**
(M20, M21) remain deliberately fixture-blocked, and **the rest turned out to
be design absences that the thin fixture had been concealing**. That is the
headline result of this pass: the fixture was not hiding six missing features,
it was hiding four missing features and five wrong renders.

### The negative constraint held

`FinalGUISpec.md:L3749-L3760` forbids an automatic-retry affordance on a
remediation ceiling. No version renders one — `grep -i 'retry\|run again'`
over the seven agents panels returns nothing. That is worth stating plainly:
it is the one M15 clause that is satisfied everywhere, and it is satisfied
because no version models the state at all rather than because any version
decided to withhold the button. The distinction matters if the state is ever
implemented properly.

---

## 5. Ranking after re-scoring

| Rank | Version | Before | After | The sentence that decides it |
|---|---|:--:|:--:|---|
| 1 | vA-ledger | 67% | **69%** | Renders all five blocked episodes with codes, sentences and a full action bar, and is the only version whose sections are the lifecycle vocabulary; the action bar is the same three buttons on all five rows and is right on one. |
| 2 | vC-lens-deck | 60% | **65%** | The only version that renders all 15 active rows *and* all six reason codes; its registry lens announces a broken entry as "Queued" and tells the user it resolves to persona "unresolved". |
| 3 | vB-gutter-sheet | 56% | **60%** | Still renders every active row, which is the hardest thing to get right; its Available region is still empty, which now means it hides the two rows the spec names as un-hideable. |
| 3 | vE-cockpit | 56% | **60%** | Best 240px first-glance in the bakeoff and the session/ceiling rows land in its Blocked group intact; its blocked actions are still two navigation routes. |
| 5 | vD-drill-stack | 56% | **58%** | Only version that satisfies §8.1 literally; its blocked screen is five bare names, its hub claims 15 live and 16 resolving when 12 and 14 are true, and a duplicate name opens the wrong record. |
| 6 | vF-stream | 52% | **50%** | The only score that fell: one hardcoded array drops 11 of 15 active rows and 4 of 5 blocked episodes while the header counts all of them. |
| — | v0-baseline | 6% | **6%** | Static markup, unmoved by the fixture — three literal rows whose asserted states (`done`, `waiting`) now contradict the fixture as well as the vocabulary. |

Two conclusions the numbers support:

1. **Volume tested fit; variety tested truth, and truth is where the spread
   is.** The MUST band barely moved (52-67 to 50-69) but the *character* of
   the failures changed completely. Pass 1's findings were mostly omissions.
   This pass's top three findings — B1, B3, B5 — are a panel that contradicts
   its own header, a panel that offers actions the domain forbids, and a panel
   that opens the wrong object. None of those is visible on nominal data, and
   none would have been caught by the fit checker, which scored zero failures.

2. **The winner-picking question is unchanged and the fixing question is
   sharper.** B3 (allowed action ids), B4 (blocked clock), B7 (unresolved
   leak) and M22 (provenance) are four field reads that would move every
   version at once, and B6 is two lines in `_pm-kit.js`. Those five edits are
   worth more than the 19-point gap between first and last place.
