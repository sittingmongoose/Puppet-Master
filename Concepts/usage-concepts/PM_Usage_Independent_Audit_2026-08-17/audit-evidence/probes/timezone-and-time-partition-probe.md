# GAP 3 — Timezone rendering under a non-US zone, and the time-partition arithmetic

Independent audit, 2026-08-17. Read-only against the concept.

- Harness: `audit-evidence/harness/gap3-timezone-time-partition-probe.mjs`
- Raw evidence: `audit-evidence/probes/timezone-and-time-partition-probe.json`
- Screenshots: `audit-evidence/screenshots/gap3-rundetail-goal47-{1-TZ-unset-default,2-TZ-UTC,3-TZ-Asia-Kolkata}.png`
- Fixture: theme `friendly-dark`, disclosure `advanced`, all 13 rooms visited per launch
- Page errors in all three launches: **0**

## Method

**Three separate browser processes**, each with its own isolated temp profile, its own debug port, and
its own **process `env.TZ`**:

| launch | `env.TZ` |
|---|---|
| 1 | unset (sandbox default) |
| 2 | `UTC` |
| 3 | `Asia/Kolkata` |

Every number below is scraped from **rendered text** or measured geometry. The pinned instant
`2026-08-04T18:42:00Z` (`u11-data.js:27 NOW_ISO`) is pushed through every public `U11time` renderer, and
the whole rendered text of all 13 rooms is swept for clock strings, zone labels, AM/PM markers and
zone-less times. Run detail is opened for all three fixture runs in each launch.

---

## (a) + (b) The rendered timezone label, and the pinned instant

| | 1 · TZ unset | 2 · TZ=UTC | 3 · TZ=Asia/Kolkata |
|---|---|---|---|
| `Intl.DateTimeFormat().resolvedOptions().timeZone` | `UTC` | `UTC` | `Asia/Calcutta` |
| `U11time.zone` | **`America/New_York`** | **`America/New_York`** | `Asia/Calcutta` |
| `U11time.zoneIsFallback` | **`true`** | **`true`** | `false` |
| `U11time.atClock(18:42Z)` | **`14:42 EDT`** | **`14:42 EDT`** | `00:12 GMT+5:30` |
| `U11time.stamp` | `Aug 4 · 14:42 EDT` | `Aug 4 · 14:42 EDT` | `Aug 5 · 00:12 GMT+5:30` |
| `U11time.full` | `Tue Aug 4, 2026 14:42:00 EDT · America/New_York` | same | `Wed Aug 5, 2026 00:12:00 GMT+5:30 · Asia/Calcutta` |
| `U11time.when(+4h,'reset')` | `resets in 4h 00m · 18:42 EDT` | same | `resets in 4h 00m · 04:12 GMT+5:30` |
| **correct rendering for the system zone** | **`Aug 4, 2026, 18:42 UTC`** | **`Aug 4, 2026, 18:42 UTC`** | `Aug 5, 2026, 00:12 GMT+5:30` |
| distinct zone labels on screen, all 13 rooms | `EDT` x 75 | `EDT` x 75 | `GMT+5:30` x 75 |

### Finding A06-06 — **CONFIRMED, and the defect is broader than the finding claimed**

The gate is `u11-time.js:20`:

```js
var z = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (z && typeof z === 'string' && z.indexOf('/') !== -1) return z;
return FALLBACK_ZONE;                    // 'America/New_York'
```

`'UTC'.indexOf('/') === -1`, so a machine whose zone genuinely **is** UTC has its correct, fully
resolvable IANA zone thrown away and silently replaced with `America/New_York`. Measured under
`TZ=UTC`: `zoneIsFallback: true`, and the pinned instant renders **`14:42 EDT`** where the honest
rendering is **`18:42 UTC`** — every displayed clock is **4 hours wrong**, and 75 on-screen labels
assert a zone the machine is not in.

Two things sharpen this beyond the original finding:

1. **The defect was already firing throughout this entire audit.** The sandbox's default zone is `UTC`
   (launch 1 measured `Intl` resolved zone `UTC`, `zoneIsFallback: true`). So the familiar
   `14:42 EDT` seen in every earlier probe, screenshot and AX name — including the room button
   accessible name `"Overview as of 14:42 EDT"` recorded in GAP 1 — is **the defect's output, not the
   intended behaviour**. Any earlier evidence that treated `14:42 EDT` as correct was reading a
   mis-rendered clock.
2. **The reject rule is wrong in principle, not just for `UTC`.** `indexOf('/') !== -1` rejects every
   valid slash-free IANA identifier — `UTC`, `GMT`, `Zulu`, `EST5EDT`, `CET`, `MET`, `WET`, `EET`,
   `PRC`, `ROK`, `NZ`, `Cuba`, `Egypt`, `Iceland`, `Israel`, `Japan`, `Libya`, `Poland`, `Portugal`,
   `Singapore`, `Turkey`, `Universal` — and substitutes US Eastern for all of them. `UTC` is the single
   most likely value on a server, a container, and a CI runner. The file header claims
   *"the system IANA zone is resolved once at the UI boundary; if it cannot be determined we fall back"*
   — but `UTC` **was** determined; the code discarded it.

### The non-US zone works, with two caveats

Under `TZ=Asia/Kolkata` the zone **is** honoured and the rendering is substantively correct: the
half-hour offset is applied (`18:42Z → 00:12`), the calendar day correctly rolls forward to **Aug 5**,
and `zoneAbbr()` degrades gracefully to the offset form `GMT+5:30` where no 3-letter abbreviation
exists. `zoneIsFallback: false`.

3. **DEFECT G3-1 (minor) — the zone identity displayed is the alias, not the configured id.**
   `U11time.full` renders `… · Asia/Calcutta` on a machine configured as `Asia/Kolkata`. This is
   Chromium's canonicalisation surfacing verbatim in `U11time.zone`, which the UI prints as the
   authoritative zone identity in the detail tooltip. A user in Kolkata is shown a zone name they did
   not configure.

---

## (c) 12-hour clocks and ambiguity

| | 1 · TZ unset | 2 · TZ=UTC | 3 · TZ=Asia/Kolkata |
|---|---|---|---|
| AM/PM or 12-hour matches across all 13 rooms | **0** | **0** | **0** |
| any rendered hour > 12 (proof the clock is really 24-hour) | **yes** | **yes** | **yes** |
| clock strings rendered with no zone label | **1** | **1** | **1** |

**No rendered time is 12-hour.** This holds even though `Intl` resolves `hourCycle: h12` for the
`en-US` locale in all three launches — `U11time.fmt()` explicitly forces `hourCycle: 'h23'`
(`u11-time.js:41`), and the measured hour histogram contains hours above 12 in every launch. The
24-hour clause of the §14 contract is **upheld**.

### One ambiguous instant, and it is a contract violation

4. **DEFECT G3-2 (new) — one rendered instant bypasses the shared formatter entirely.**
   Measured, identically in all three launches: the Free models room renders
   **`Trial ends Aug 16 00:00`** — a clock with **no zone label**, and byte-identical under
   `America/New_York` and under `Asia/Calcutta`.

   Source: `u11-data.js:279` — `detail: 'Trial ends Aug 16 00:00'` (and the sibling
   `label: 'Free until Aug 16'`) are **hard-coded display strings**, not instants. They never reach
   `U11time`, so they never localise and never carry an abbreviation.

   This breaks three stated rules in `u11-time.js`'s own header at once: *"Demo instants are canonical
   UTC timestamps"*, *"ONE shared formatter; widgets never re-implement date math"*, and the display
   pattern *"`Aug 16 00:00 EDT`"* which every other renderer follows. For a user in Kolkata the string
   is off by 5h30m and may name the wrong calendar day, with nothing on screen to signal it. It is the
   only zone-invariant time in the entire surface, which is exactly why a zone sweep was needed to find
   it.

*Measurement note for the record:* the aggregate zone-label histogram reports the key `GMT` (count 75)
in launch 3 because the probe's alternation captured the `GMT` prefix before the `GMT±HH:MM` branch.
The rendered strings are the full `GMT+5:30` — see `perRoom.overview.zoneLabelSamples`
(`"current · as of 00:12 GMT+5:30"`) and the run-detail scan (`"22:02 GMT+5:30"`). This is a probe
artifact, not a product defect.

---

## (d) Run detail — the time partitions, measured as rendered text

Only `run:goal-47` carries a `timing` block. `run:plan-12` and `run:crew-3` render
`partitionCount: 0` and no Timing section (their section headers are `ADMISSION…`, `ROUTE PLAN`,
`CAPACITY FORECAST`, `ACTIVITY…` / `MEMBERS 5`), so there is nothing to reconcile for those two.

`run:goal-47`, **identical in all three launches**:

Section header, as rendered (`text-transform: uppercase` on `.u11rd-sech`,
`u11-rundetail.css:56–57`): **`TIMING ELAPSED 2H 04M`**

| # | partition label (rendered) | duration (rendered) | `data-fill` | measured fill / bar width |
|---|---|---|---|---|
| 1 | Provider/model active | `12m` | 10% | geometry recorded per launch in the JSON |
| 2 | Waiting for test device | `47m` | 38% | |
| 3 | Waiting for worktree | `31m` | 25% | |
| 4 | Waiting for provider capacity | `9m` | 7% | |
| 5 | Waiting for approval | `6m` | 5% | |
| 6 | Waiting for reset/cooldown | `0m` | 0% | |
| 7 | Local tool/runtime time | `19m` | 15% | |
| 8 | Outbox/offline wait | `0m` | 0% | |
| 9 | Reconnect / sync / replay | `4m` | 3% | |
| | **sum of rendered durations** | **128 m** | **103%** | |
| | **elapsed per the rendered header** | **124 m** | (100% expected) | |
| | **discrepancy** | **+4 m** | **+3 pp** | |

`Started` key/value row, as rendered:

| launch | rendered `Started` | rendered "now" in the same launch | implied elapsed |
|---|---|---|---|
| 1 · TZ unset | `12:32 EDT` | `14:42 EDT` | **2h 10m** |
| 2 · TZ=UTC | `12:32 EDT` | `14:42 EDT` | **2h 10m** |
| 3 · TZ=Asia/Kolkata | `22:02 GMT+5:30` | `00:12 GMT+5:30` | **2h 10m** |

### Finding A06-05 — **CONFIRMED in full, by measured rendered text, in every zone**

Every element of the claim reproduces exactly:

- **9 partitions** — `partitionCount: 9`.
- **Sum to 128 m** — `partitionMinuteSum: 128`, parsed back out of the rendered `<b>` strings.
- **Bars total 103%** — `barPercentSum: 103`, summed from the rendered `data-fill` attributes.
- **Header reads "ELAPSED 2H 04M"** — `TIMING ELAPSED 2H 04M`, i.e. 124 m.
- **"Started 12:32 EDT" implying 2h 10m** — `{"key": "Started", "value": "12:32 EDT"}` against a
  rendered "now" of `14:42 EDT`, a 130-minute span.

So the panel presents **three mutually inconsistent elapsed values for one run**: 124 m in the header,
128 m as the sum of its own partitions, and 130 m implied by its own start time. The bar row visually
over-fills to 103% because `u11-rundetail.js:143` computes each bar as
`Math.round(row.ms / tm.elapsedMs * 100)` against the 124 m denominator while the rows describe 128 m.

The underlying fixture confirms the arithmetic is structural rather than a rounding artifact
(`u11-data.js:848–860`): `elapsedMs: 124 * MIN`, `startedAt: at(-130 * MIN)`, and rows
`12 + 47 + 31 + 9 + 6 + 0 + 19 + 0 + 4 = 128`. Three different numbers are authored for one quantity.

5. **DEFECT G3-3 (severity note) — the discrepancy is zone-independent and therefore not a formatting
   bug.** It reproduces byte-identically under `America/New_York` (fallback), `UTC` and
   `Asia/Calcutta`. This is a data-integrity defect in a panel whose own footer promises
   *"Queue and local-resource time never inflate provider tokens, cost, or allowance."* — a claim about
   accounting rigour rendered directly beneath a set of partitions that do not add up to the elapsed
   time they partition.

---

## GAP 3 summary

| id | statement | verdict |
|---|---|---|
| A06-06 | `u11-time.js` has a timezone fallback defect | **CONFIRMED** — `TZ=UTC` → `'UTC'` has no `/` → silently replaced by `America/New_York`, `zoneIsFallback: true` |
| A06-06 | The pinned instant renders as `14:42 EDT` | **CONFIRMED** — and it is 4 h wrong; the honest rendering is `18:42 UTC`. 75 wrong zone labels per launch |
| A06-06 (extension) | The defect was latent in this audit's own evidence | **CONFIRMED** — the sandbox default zone is `UTC`, so every prior `14:42 EDT` observation was the defect firing |
| — | A non-US, half-hour zone with no US abbreviation | **WORKS** — `Asia/Kolkata` honoured; `00:12 GMT+5:30`; day correctly rolls to Aug 5 |
| — | Any rendered time is 12-hour | **REFUTED** — 0 AM/PM matches in all 3 zones across all 13 rooms; hours > 12 present, so the 24-h clock is genuinely in force |
| G3-1 | `U11time.full` prints the alias `Asia/Calcutta` for a machine configured `Asia/Kolkata` | **NEW DEFECT** (minor) |
| G3-2 | `Trial ends Aug 16 00:00` is a hard-coded string that bypasses `U11time`: no zone label, zone-invariant, wrong for any non-Eastern user | **NEW DEFECT** (`u11-data.js:279`) |
| A06-05 | 9 partitions sum to 128 m; bars total 103%; header reads `ELAPSED 2H 04M`; `Started 12:32 EDT` implies 2h 10m | **CONFIRMED in full, from rendered text, in all three zones** |
| G3-3 | The 124 / 128 / 130-minute inconsistency is zone-independent — a data-integrity defect, not a formatting one | **NEW (severity) FINDING** |
