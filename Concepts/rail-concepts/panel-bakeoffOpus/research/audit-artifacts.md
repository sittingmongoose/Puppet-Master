# Runtime Artifacts — feature-completeness audit (pass 2, enriched fixture)

Panel id: `artifacts`. Audited against `research/artifacts.md`, which cites
`Plans/Runtime_Artifacts_Panel.md` (below: `RAP`, bare `L` numbers are this
doc), `Plans/FinalGUISpec.md` (`FGS`), `Plans/UI_Command_Catalog.md` (`UCC`) and
the runtime-artifact schema files.

**This supersedes the first pass.** Pass 1 concluded that four requirements
(R3, R12, R18, R29) scored `absent` everywhere because `_pm-data.js` never posed
the state — version authors were obeying kit rule 8, not failing. The fixture has
since been extended with adversarial state variety. This pass re-scores against
it and, more importantly, reports what now renders **wrong**.

## What changed in the fixture

`_pm-data.js` `artifacts`: 38 rows to **47**, `paging.total` 412 to **421**,
and `retention` / `freshness` / `health` injected on **every** row. Nine rows
were appended (indices 38-46, so `rows[0]` never moves):

| id | the state it poses | requirement it unblocks |
|---|---|---|
| `art-3ab77f10` | no `title`, **has** `summary` | R3 |
| `art-9c4471e2` | no `title`, no `summary`, no `preview` | R3 |
| `art-1e08b3d5` | evicted; `health: unavailable`, `recordOnly`, `availability`, `allowedActionIds` | R27 |
| `art-6d2f90ba` | generated media, provider URL **expired 4h ago**, `media{}` block | R29 / S34 |
| `art-b74c1e93` | `truncation{}` with 5 gap classes, `health: degraded` | R29 |
| `art-2f60c8a1` | blocked `storage_read_only` | R12 |
| `art-5c19d7e4` | blocked `integrity_block` | R12 |
| `art-8e33b6c7` | blocked `preflight_drift` | R12 |
| `art-c1d0472b` | `freshness: refreshing` **and** `health: degraded` | R20 |

Distribution now: `health` healthy 40 / degraded 6 / unavailable 1;
`freshness` current 38 / stale 6 / refreshing 3; `status` gains one `disabled`.
The fixture is internally consistent — every declared family count matches the
actual rows — so **every count disagreement below is the version's fault.**

## Method

Ten versions implement this panel: six full systems (vA vB vC vD vE vF), three
artifacts-only variants in `versions/x-artifacts.js` (xA1 Glyph Column, xA2
Casefile, xA3 Monoculture), and `v0-baseline` as the control.

Unlike pass 1, this pass **renders**. Each panel function was executed against
the live fixture at 240 / 320 / 380 / 480 via a headless harness, and every
finding below was then re-confirmed in the browser at
`http://127.0.0.1:47821` (identity verified: harness
`puppet-master-panel-bakeoff`, root `.../Concepts/panel-bakeoff`, 47 rows,
`paging.total` 421). Row presence was tested elision-tolerantly, and
"dropped vs blank" was settled by re-rendering with a sentinel title.

Scoring is unchanged: `+` present, `~` partial, `-` absent; coverage counts
partial as half of a MUST over 29 MUSTs. Excluded from scoring, as before: the
17 proposed `cmd.artifacts.*` ids, the status-precedence order and 19-kind
abbreviation mapping, the missing `generated_media` type, the `retention_class`
enum conflict (the *indicator* is scored, the vocabulary is not), filter-state
persistence, the unvalidatable investigation grouping fields, and the undefined
`usage_event_ref` format.

---

## 1. Requirement checklist (carried forward from pass 1)

### MUST

| # | Requirement | Citation |
|---|---|---|
| R1 | Kind indicator that never leads as a **text chip** below 360px; the full 19-value `artifact_type` stays recoverable | brief §8, §11.1; `FGS:L2084-L2089` |
| R2 | Identity is the **sole growing and sole eliding** slot; elision computed, never left to CSS | brief §8, §11.2; `RAP:L318` |
| R3 | Identity **fallback chain** when `summary` is absent: per-kind derived label from the 5 strict schemas, else truncated `artifact_id` | brief §11.2; envelope schema (`summary` optional) |
| R4 | Exactly **one** state indicator per row, and never painted when the row is healthy | brief §6 P0.3; `RAP:L98-L106` |
| R5 | Relative time from `created_at_utc` on every row at every width | brief §6 P0.4, §8 |
| R6 | Family filter covering **all six** families — receipt and bundle included | brief §1; `FGS:L723` |
| R7 | Row activation is **identity-native** (`artifact_id` to `routing_refs`); no filesystem path as primary affordance | `RAP:L310`, `:L112`; RAP-008 `:L547` |
| R8 | Investigation group header carrying `final_state` / `verification_strength` / member count | RAP-012 `:L571`, RAP-013 `:L577`; `:L216-L233` |
| R9 | Member rows led by `evidence_role`, in the deterministic 6-value order | `RAP:L200-L209`; brief §5 |
| R10 | `omitted_items_summary` stays visible (count badge at 240px) | `RAP:L240` |
| R11 | Blocked / prohibited rows stay **browsable** with their exact reason code and a disabled (not hidden) action | `RAP:L2048`, `:L2060`; brief §6 P0.8 |
| R12 | **Five** distinct blocked presentations — denial, approval-required, storage-read-only, integrity-block, preflight-drift — never collapsed | `RAP:L2060` |
| R13 | Rows stay **metadata-first**; previews demand-loaded | `RAP:L312` |
| R14 | Curated / Raw preview mode for `cost_usage` and `tool_llm_trace` | RAP-044 `:L1952`; brief §6 P1.11 |
| R15 | `Show in Usage` and `Show in Ledger` — the only two **wired** commands | `UCC:L1133-L1140` |
| R16 | Open / Watch pair for `browser_recording` | `RAP:L330-L335`; RAP-021 `:L625` |
| R17 | Sources / citations drill for `api_web_call` | `runtime_artifact_api_web_call.schema.json`; brief §6 P1.13 |
| R18 | `retention_class` indicator (envelope-required field) | envelope schema §2; brief §6 P1.14 |
| R19 | Redaction indicator: `redaction_profile_id`, `raw_payload.redaction_status`, or a redacted-field count | `RAP:L179`; RAP-044 `:L1952`; brief §9 |
| R20 | `projection_freshness` and `projection_health` as **two non-collapsed** signals, at panel scope, not painted onto rows | `RAP:L2037-L2042`; RAP-019 `:L613` |
| R21 | Paging: shown-of-total plus a load-older affordance | `RAP:L312`; `FGS:L723` |
| R22 | Export in **three distinct classes** — record / bundle / view | RAP-014 `:L583`; `:L242-L248` |
| R23 | Export investigation **and** import bundle | `RAP:L237`, `:L239` |
| R24 | Compare-target selection (persisted, picker is a sheet) | `FGS:L2312`; brief §6 P2.17 |
| R25 | Refresh — viewer mode is a "frozen, manually refreshable read snapshot" | `RAP:L2056` |
| R26 | Bridge-field viewer: the seven ref fields, sheet-only | `RAP:L389-L397`; brief §6 P2.15 |
| R27 | Evicted / missing artifacts degrade to **record-backed views**; a missing row is never an empty row | `RAP:L314`, `:L2056`; RAP-020 `:L619` |
| R28 | Provenance / attribution disclosure reachable per row | `RAP:L181`; brief §6 P2.19 |
| R29 | Gap rendering / `truncation_state`: unacknowledged tail, exact event, exact byte range, bounded sequence range, unknown segment remainder | `RAP:L181`, `:L2037-L2042` |

### SHOULD

| # | Requirement | Source |
|---|---|---|
| S30 | Second metadata line at 380px, at most two fields, per kind | brief §6 P1.9 |
| S31 | Kind-level filter beyond family | brief §1, §11.1 |
| S32 | Correct empty-state taxonomy (`no-data` vs `no-results`) | brief §4; kit five-way taxonomy |
| S33 | Entry point to the dedicated searchable audit/log surface | `RAP:L187` |
| S34 | Provider-native detail: `provider_entry_id`, `account_profile_ref`, `media_route_id`, `permission_snapshot_id` | RAP-032 `:L432`; brief §6 P2.20 |
| S35 | Group / accordion headers are accessible buttons with `aria-expanded` | brief §10; kit `PMK.section` |

---

## 2. Coverage, before and after

| version | pass 1 | pass 2 | delta | why it moved |
|---|---|---|---|---|
| v0-baseline (control) | 28% | **28%** | 0 | static markup; never reads the fixture, so no new state can reach it |
| vA Ledger | 62% | **62%** | 0 | survives the new states; identity goes blank on title-less rows |
| vB Gutter and Sheet | 52% | **0%** | **-52** | **panel throws; nothing renders at any width** |
| vC Lens Deck | 64% | **62%** | -2 | R20 strip is hard-coded, now contradicts the rows |
| vD Drill Stack | 45% | **43%** | -2 | Bundles drill lists no bundle-family rows |
| vE Cockpit | 50% | **50%** | 0 | survives; identity goes blank on title-less rows |
| vF Stream | 41% | **41%** | 0 | survives, but leaks the literal string `undefined` |
| xA1 Glyph Column | 66% | **66%** | 0 | R3 gained (`~`), R11 lost (`+` to `~`) |
| xA2 Casefile | 76% | **74%** | -2 | R3 gained, R11 and R27 lost |
| xA3 Monoculture | 66% | **66%** | 0 | R3 gained, R11 lost |

**No version's coverage went up.** The enriched data moved three designs down and
destroyed one. The one genuine gain — an identity fallback in the three
x-variants — was offset by a blocked-state regression in the same three files.

### Matrix (bold = changed since pass 1)

| # | v0 | vA | vB | vC | vD | vE | vF | xA1 | xA2 | xA3 |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 kind not a leading chip | - | + | **-** | + | ~ | ~ | ~ | + | + | + |
| R2 identity sole grow/elide | - | + | **-** | + | + | + | + | + | + | + |
| R3 identity fallback chain | - | - | - | - | - | - | - | **~** | **~** | **~** |
| R4 one state, never healthy | ~ | + | **-** | + | + | + | ~ | + | + | + |
| R5 time at every width | + | ~ | **-** | ~ | ~ | ~ | + | + | ~ | + |
| R6 all six families | ~ | + | **-** | + | **~** | + | + | + | ~ | + |
| R7 identity-native open | - | + | **-** | + | + | + | + | + | + | + |
| R8 investigation header | + | + | **-** | + | + | + | + | - | + | - |
| R9 evidence_role members | + | + | **-** | + | + | + | ~ | - | + | - |
| R10 omitted_items_summary | - | + | **-** | - | - | - | - | - | + | - |
| R11 blocked reason + disabled | - | ~ | **-** | ~ | ~ | ~ | ~ | **~** | **~** | **~** |
| R12 five blocked shapes | - | - | - | - | - | - | - | ~ | ~ | ~ |
| R13 metadata-first preview | - | + | **-** | + | + | + | ~ | + | + | + |
| R14 Curated / Raw | - | - | **-** | + | - | + | + | + | + | + |
| R15 Usage / Ledger | - | + | **-** | + | - | + | - | + | + | + |
| R16 Open / Watch | + | - | - | - | - | - | - | + | + | + |
| R17 api_web_call sources | + | ~ | **-** | ~ | ~ | ~ | - | + | + | + |
| R18 retention_class | - | - | - | - | - | - | - | - | - | - |
| R19 redaction indicator | + | ~ | **-** | + | ~ | ~ | - | + | + | + |
| R20 freshness x health | - | - | - | **~** | - | - | - | - | - | - |
| R21 paging shown-of-total | - | ~ | - | ~ | - | ~ | ~ | + | + | + |
| R22 export three classes | - | + | **-** | ~ | + | ~ | ~ | + | + | + |
| R23 export inv + import | - | ~ | **-** | + | + | + | ~ | + | + | + |
| R24 compare target | - | + | - | + | - | - | + | + | + | + |
| R25 refresh snapshot | - | + | - | + | ~ | + | - | + | + | + |
| R26 bridge-field viewer | - | + | - | - | - | - | - | - | - | - |
| R27 evicted record-backed | - | - | - | - | - | - | - | - | **~** | - |
| R28 provenance / attribution | + | + | **-** | + | + | - | + | ~ | ~ | ~ |
| R29 gap rendering | - | - | - | - | - | - | - | - | - | - |
| **MUST coverage** | **28%** | **62%** | **0%** | **62%** | **43%** | **50%** | **41%** | **66%** | **74%** | **66%** |
| S30 second meta line | - | + | - | + | + | ~ | ~ | + | ~ | + |
| S31 kind-level filter | - | + | - | - | - | - | - | + | - | + |
| S32 empty-state taxonomy | ~ | - | - | + | + | + | - | - | + | - |
| S33 audit surface entry | - | - | - | - | - | - | - | - | - | - |
| S34 provider-native detail | - | - | - | - | - | - | - | - | - | - |
| S35 accessible group headers | - | + | - | + | + | + | - | - | + | + |

---

## 3. WHAT BROKE

Ordered by severity. Every item was reproduced in the browser, not only read.

### B1. vB Gutter and Sheet — the panel throws. Nothing renders, at any width.

`versions/vB-gutter-sheet.js:1158`:

```
var idKind = a.title.indexOf('/') >= 0 ? 'path' : 'default';
```

`a.title` is `undefined` for `art-3ab77f10` and `art-9c4471e2`. The `forEach`
at `:1153` throws `TypeError: Cannot read properties of undefined (reading
'indexOf')` on row 39 of 47. `pArtifacts` never returns, and
`_pm-shell.js:113` calls the panel function with **no try/catch**, so the
exception propagates out of `render()` and the stage is never built.

Verified in the browser at `#v=vB&panel=artifacts`: the page is blank below the
control bar, `document.querySelectorAll('.pm-stage').length === 0`, and the
version buttons are gone too — the whole harness UI dies with it. This is not a
degraded panel; it is a white screen, at 240, 320, 380 and 480 alike.

The 38 rows built before the throw are discarded with the function. vB's pass-1
score of 52% described a design that can no longer draw a single pixel, which is
why it is scored 0% here. One `|| a.kind` would restore it.

### B2. xA1, xA2, xA3 — three blocked states relabelled as a fourth.

`versions/x-artifacts.js:824`, `:1045`, `:1377` all derive the reason code from a
binary:

```
esc(r.status === 'prohibited' ? 'policy_denied' : 'approval_required')
```

The fixture now carries four `blocked` rows whose `blockedReasonCode` fields are
`artifact_storage_read_only`, `artifact_integrity_mismatch`,
`artifact_preflight_drift` and the original approval row. All four render
`approval_required`. Across every render of all three variants, exactly two
distinct codes appear (`policy_denied` and `approval_required`); the three exact
codes the fixture supplies appear **zero** times.

The result is a row that contradicts itself, confirmed on screen at xA1 480px:

```
Pre-migration restore point 0003     restore_point   40m
storage is read-only, the point ca…
blocked   read only · run #47
approval_required
storage is read-only, the point cannot be written
```

The code says a reviewer must approve; the sentence directly beneath says
storage is mounted read-only. Same shape on `art-5c19d7e4`
(`approval_required` over "content hash does not match the recorded digest")
and `art-8e33b6c7` (`approval_required` over "preflight drift - 2 members
changed since the bundle was sealed").

This is the exact failure `RAP:L2060` legislates against — five
non-interchangeable reasons must not collapse. In pass 1 the collapse was
invisible because the data posed only two of them. R11 drops from `+` to `~`
in all three variants: the reason code is present, prominent, and wrong.

### B3. vC Lens Deck — the projection strip asserts a state the rows contradict.

`versions/vC-lens-deck.js:2276-2277`:

```
ctx: [p.name, A.families[0].count + ' artifacts', 'current', 'healthy'],
ctxTip: p.name + ' · ' + A.families[0].count + ' artifacts · current, healthy',
```

Both axes are string literals. vC was pass 1's **sole holder of R20** and was
praised for rendering the two axes uncollapsed at panel scope. The shape is
still right; the values were never bound to data. The fixture now contains 6
rows with `health: degraded`, 1 with `health: unavailable`, 6 with
`freshness: stale` and 3 with `freshness: refreshing` — and the strip still
reads `47 artifacts · current` with `healthy` behind the `+1` overflow at 380px.

A panel-level badge claiming `healthy` while an `unavailable` row sits in the
list is worse than omitting the badge, because `RAP:L2037-L2042` makes this
strip the authoritative disclosure of a proven hole. R20 drops to `~`.

### B4. vC Lens Deck — the footer states a total it does not have.

The footer reads `47 of 47`, computed from loaded rows, while
`PM_DATA.artifacts.paging.total` is **421**. Pass 1 caught the same bug as
`1-38 of 38` against a total of 412; it has tracked the fixture rather than been
fixed. The panel tells the user the projection is complete when 374 rows are
unloaded. Contrast the three x-variants, which read `R.paging` and correctly
render `showing 47 of 421`. R21 stays `~`.

### B5. vD Drill Stack — the Bundles family is advertised, then not listed.

Two defects compound. `versions/vD-drill-stack.js:2022`:

```
var loaded = fam.id === 'bundle' ? 1 : rowsFor(fam.id).length;
```

The hub row renders `Bundles  4  /  1 loaded in this projection` — vD's own two
numbers disagree, on the one design pass 1 singled out as "the only version that
refuses to conflate the two numbers".

Then `:2038` short-circuits the drill entirely: selecting Bundles returns a
hand-built list containing the single `R.bundle` investigation object, never
`rowsFor('bundle')`. Drilling every level of vD reaches 46 of 47 rows but
**`art-8e33b6c7` — the new `preflight_drift` blocked bundle — is reachable at no
level at all.** A blocked row that `RAP:L2048` requires to stay browsable is
absent from the product. R6 drops to `~`.

### B6. vF Stream — the literal string `undefined` on the surface.

`versions/vF-stream.js:1456`:

```
line2: r.kind + DOT + r.preview,
```

`art-9c4471e2` has no `preview`. The rendered row, confirmed in the browser:

```
2h    ok    context_snapshot · undefined
```

The identity span is emitted empty (`<span class="vF-subj"></span>`, from
`subj: r.title` at `:1455`), so the row shows a status word, a raw kind token
and the word `undefined`, and nothing a user could act on. This is the only
literal token leak in the bakeoff, and it is visible at 380px and 480px.

### B7. Four designs render an identity-less row.

vA, vC, vE and vF all bind the identity slot straight to `r.title`. Neither
title-less row is dropped — a sentinel re-render confirms both are emitted — but
the slot comes out blank:

| version | 380px render of `art-9c4471e2` |
|---|---|
| vA | `(blank) · context_snapshot · pre-compact · run #46 · 2h` |
| vC | `CS  (blank)  pre-compact  run #46  2h` |
| vE | `(blank)  2h` |
| vF | `(blank)  ok  context_snapshot · undefined` |

`RAP:L318` and brief §11.2 make identity a *computed* field with 19 branches.
Four designs treat it as a data field and get an empty row, which is precisely
the "never an empty row" posture `RAP:L314` forbids. All four stay `-` on R3.

### B8. vD Drill Stack — the L2 object view now lands on the title-less row.

`versions/vD-drill-stack.js:2076` selects the artifact by kind, keeping the
**last** match:

```
R.rows.forEach(function (x) { if (x.kind === f.arg) r0 = x; });
```

For `context_snapshot` and `tool_llm_trace` the last match is now a title-less
row. The object view — the one place vD gives the artifact its whole band —
renders with `ident: undefined`:

```
Back
context_snapshot
Kind      context_snapshot
Family    evidence
Status    Succeeded
Meta      pre-compact, run #46, 2h
```

No identity line, and the `Summary` KV vanishes too because `r0.preview` is
undefined. The row that pass 1 praised for giving the kind its full band now has
nothing else to show.

### B9. Eviction is rendered as `disabled` in four designs.

`art-1e08b3d5` is an evicted artifact: the record survives, the payload does
not. The fixture encodes it as `status: 'disabled'`, whose shared entry is
`{ word: 'disabled', label: 'Unavailable' }`. vA, vF, xA1 and xA3 print
`.word` at bucket 2 and above, so the row reads:

```
…/import from paprika export     browser_recording   6d
record only - the trace payload wa…
disabled   evicted · lane-c
```

`disabled` is a raw status token where a human word belongs, and it names the
wrong condition — nothing was disabled. The correct word is in the same map
(`.label`, "Unavailable") and is already being emitted into the `aria-label`, so
the accessible name and the visible word disagree on the same element.

### B10. No design reads any of the new state fields.

A grep across all ten version files for the fields the fixture added returns
zero hits in the artifacts panel for every one of:

`blockedFamily`, `blockedReasonCode`, `allowedActionIds`, `availability`,
`recordOnly`, `evictionReason`, `evictedAt`, `media`, `truncation`,
`degradedReason`, `executed`, `permissionSnapshotId`, `approvalScopeKey`,
`retention`, `freshness`, `health`.

Where a state word does appear on screen — `evicted`, `truncated`, `read only`,
`integrity`, `preflight`, `minimax image-01` — it is being rendered incidentally
because the fixture author also placed it in `meta[0]`, which the meta run
prints. No design consulted the state. This distinction matters for the scoring
below: rendering the word `truncated` is not R29, and rendering `read only` is
not R11's exact reason code.

### B11. xA2 Casefile — the record-only mechanism does not fire on the evicted row.

xA2 was pass 1's sole holder of R27. Its mechanism still works — two unbound
bundle members render as `record-only` with a `Why this member is record-only`
action. But it is keyed to *unbound members*, not to artifact state. The fixture
now contains an explicit evicted artifact carrying `availability: 'evicted'`,
`recordOnly: true`, an `evictionReason`, a sentence and an `allowedActionIds`
pair, and xA2 binds none of it: `art-1e08b3d5` renders as an ordinary unfiled
row. The one design that models eviction does not recognise the eviction the
data actually poses. R27 drops to `~`.

### B12. vE Cockpit — the focus card still describes a healthy row.

Not a regression, but worth recording now that it can be measured: vE's focus
card is hard-bound to `A.rows[0]` (`versions/vE-cockpit.js:1548`), which is
still `code_diff` / healthy / current / titled. vE's richest surface — six KVs,
a stats triplet, a seven-item overflow — cannot be pointed at any of the nine
adversarial rows. The states arrived; the surface that could have explained them
is not reachable from them.

---

## 4. Which previously-absent requirements are now present

Only one requirement moved from absent toward present anywhere.

**R3, the identity fallback chain — xA1, xA2, xA3 move from `-` to `~`.**
`versions/x-artifacts.js:794`, `:1005`, `:1037`, `:1267` all use
`r.title || r.kind`. The identity slot never goes blank, which is a real and
deliberate fallback that the other seven designs do not have, and it was
invisible in pass 1 because every row had a title.

It is `~` and not `+` for three reasons:

1. It skips `summary`. `art-3ab77f10` **has** a summary — "retry ladder for the
   unit normalisation call, 4 tool calls, 1 fallback" — which is the spec's
   first fallback. All three variants ignore it and print `tool_llm_trace`.
2. It stops at the kind. There is no truncated-`artifact_id` terminal branch,
   so two different `context_snapshot` artifacts with no summary are
   indistinguishable.
3. It duplicates. The kind is already rendered as the glyph tooltip (xA1), the
   short code (xA2 `CTX`) or the run header (xA3), so the row prints the same
   token twice: at xA1 480px, `tool_llm_trace  tool_llm_trace  4 tool calls…`.

**Everything else that pass 1 blamed on the fixture stayed absent.** R12, R18
and R29 now have data behind them and are still unrendered — see §5. This is the
headline result of the re-run: the fixture was a real limiting factor for exactly
one of the four requirements pass 1 attributed to it, and for R3 the limitation
was hiding a partial credit, not a full one.

---

## 5. Still blind

Requirements no version satisfies even now, with the cause re-attributed.

| # | requirement | pass 1 cause | pass 2 cause |
|---|---|---|---|
| R3 | identity fallback chain (full) | fixture | **genuine design absence** — data present; 7 of 10 render a blank identity, 3 render a duplicated kind token, 0 reach `artifact_id` |
| R12 | five blocked presentations | fixture | **genuine design absence** — all five states present; best is 2 distinct codes, and 3 are actively mislabelled (B2) |
| R18 | `retention_class` | fixture (field absent from `_pm-data.js`) | **genuine design absence** — now on all 47 rows; read by no version, in no menu, in no sheet |
| R29 | gap rendering / `truncation_state` | fixture | **genuine design absence** — `truncation{}` supplies all five gap classes, the byte range and `inferFromTimestamps: false`; no version reads it |
| S33 | audit surface entry point | genuine | **genuine, and kit-adjacent** — no route exists anywhere; not a fixture question |
| S34 | provider-native detail | fixture | **genuine design absence** — `providerEntryId`, `accountProfileRef`, `mediaRouteId`, `permissionSnapshotId` now present in `media{}`; read by no version |

Two further blind spots the enriched data exposes for the first time:

- **Generated-media expiry has no representation.** `art-6d2f90ba` carries an
  expired provider URL, `expiredAgo: '4h'`, a `24h` window, a null
  `durableLocalRef` and a C2PA caveat. RAP-033 `:L475` requires a persistent
  expiry indicator on a real clock. Every version renders the generic status
  word `failed` and nothing else. (Scored under R29 / S34; the missing
  `generated_media` type itself remains excluded per brief §12.4.)
- **`projection_health = degraded` is still invisible.** Six rows carry it. No
  version paints it, and the one panel-level surface that could (vC) is
  hard-coded to `healthy` (B3).

**Near-blind spots — satisfied by exactly one version, all three now weaker:**

- **R20** freshness x health — vC only, and now `~` because the values are
  fabricated (B3).
- **R26** bridge-field viewer — vA only, unchanged at `+`.
- **R27** evicted record-backed — xA2 only, and now `~` because the mechanism
  does not fire on the evicted row (B11).

Pass 1 called these "one deletion away from joining the list above". Two of the
three have since degraded without anyone deleting anything — the data simply
asked them a harder question.

---

## 6. Cross-cutting observations

**The fixture was masking fragility, not only absence.** Pass 1's central claim
was that four requirements were unscoreable because the data never posed the
state. That was true, but it understated the problem: the uniform data was also
holding up code that cannot survive variety. One design crashes outright, one
leaks `undefined`, four render an empty identity, and three assert a reason code
that contradicts their own sentence. None of that is visible against 38 healthy,
titled, current rows.

**`a.title` is the single point of failure.** Seven of the ten designs bind the
identity slot directly to it. The brief's §11.2 opens by stating there is no
`title` field in the envelope and that the identity line is a computed field with
19 branches; pass 1 recorded that no design implemented it and attributed the
gap to the fixture. The correct reading is stronger — the field the whole row
grammar hangs on is optional in the schema, and the bakeoff built ten row
grammars on it.

**The x-variants' command surface is now a liability as well as an asset.** The
same shared `rowActions` block that gives xA1/xA2/xA3 the best action set in the
bakeoff also hard-codes the two-value reason vocabulary. Because it is shared,
one wrong ternary produces the same defect in all three files, and the merged
design pass 1 proposed would inherit it. Fixing `x-artifacts.js:824`, `:1045`
and `:1377` to read `r.blockedReasonCode` is a three-line change that would move
R11 back to `+` and R12 from `~` toward `+` in all three.

**The winner-selection picture changes.** xA2 remains the highest at 74%, and
the merged-design ceiling pass 1 estimated at roughly 90% still holds, but the
merge now has to import four fixes rather than only features: an identity
fallback that reaches `summary` then `artifact_id`, a data-bound reason code, a
data-bound projection strip, and a paging footer that reads `R.paging`. vB
cannot be evaluated for the pick until `:1158` is repaired.

**One fixture note, offered as a finding rather than a correction.** The bundle
member roles now include `attempts` and `rollback`, which are not in the
`evidence_role` enum at `RAP:L200-L204` (`baseline|repro|diagnosis|fix|verification|cleanup`).
xA2 accommodates them with an 8-value ladder and sorts unknown roles last; every
other design prints them verbatim. R9's "deterministic 6-value order" therefore
cannot be validated against this fixture as written — worth an owner decision on
whether the enum or the fixture is wrong before the next pass.
