# I-FAST-03 final revised proposed plan

## Stage record and qualification

**Stage:** fresh final reviser in the frozen competent researcher → independent same-family critic → final reviser sequence. This is the single authoritative revised plan for the supplied P1–P6 slice.

**Qualification:** DIAGNOSTIC_UNQUALIFIED. No application, parser integration, or dependency tests were run. Every check below is proposed. There is no SourcePASS, speed, billing, savings, or whole-project coverage claim.

**Frozen inputs:** input map at `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/I-FAST-03/control/reviser-v1/input-map.json`; predecessor research artifact/map and critic artifact/map exactly as listed there. I read only those predecessor files and mapped captured source bytes from the declared research-v1 and critic-v1 source directories. I did not inspect the original campaign brief, plan, other cases, other arms, coordinator material, or repository/canon.

**First useful reviser finding observed:** 2026-10-07T21:48:58Z. Immediately after reading the complete critic artifact, I confirmed its first material correction: a parser position exists, but open captured issue reports show cases where its line field may misidentify the physical line. The timestamp is the native clock read immediately after that complete read.

**Source activity in this stage:** no new public searches, page opens, or HTTP requests. Four mapped critic captures were hash-checked against their source map and inspected for the challenged claims. Their exact bytes are linked under this stage’s sources directory. Researcher/critic source counts are inherited records, not this stage’s activity.

**Usage:** model-specific input, cached input, generated output, reasoning, cache hits, and billing are unknown/null. Native Goal aggregate counters are a separate measure and are reported from the native terminal projection.

## Decision summary

Keep the researcher’s P1–P6 plan, product discoveries, parser candidate, privacy defaults, alternatives, non-goals, and proposed validation. Apply the critic’s four corrections with bounded language:

1. **Record locations:** retain the parser’s positioned shape findings, but treat its line number as advisory. Reports for ragged records and CRLF describe concrete open upstream examples; they do not establish that every position is wrong or that a fix shipped. Give each emitted source record an application-owned ordinal within its immutable file identity. Treat byte offsets as stable locators only after the app’s fixtures validate them. Keep the library’s line and record position as diagnostic metadata.
2. **Encoding:** preserve original bytes unconditionally. The pinned reader says StringRecord/String parsing enforces UTF-8; ByteRecord offers byte-oriented reading, while other encodings require explicit transcoding. Show decode errors, exclude undecoded content from measured summaries, and make any transcoding rule explicit, versioned, and traceable to the original bytes. Whether MVP offers byte review only or selected reversible transcoding remains open.
3. **Local operation:** retain local storage and the normal-laptop workflow. Remove the stronger requirement that no network service or account connection may exist. The core import/review workflow should work locally without a required service; optional sync/account connectivity remains undecided. Keep account identifiers out of exports by default.
4. **Interval boundaries:** do not infer how an interval-energy record crossing midnight or a selected comparison boundary is allocated. Until a product choice exists, flag the affected total or show the interval intact without implying an allocation. Never prorate silently.

## Research and evidence retained

### Product mechanisms and alternatives

- OpenEnergyMonitor/emonCMS documents fixed-interval and timestamped feeds, visible gaps for absent fixed-feed values, CSV import/export, and home-energy views. Its join and accumulator options can bridge gaps or remove resets. Keep gaps visible by default; a joined/adjusted series, if later chosen, must be separate from raw evidence and visibly labelled. These are product analogies, not requirements or evidence about this building. [S01](https://docs.openenergymonitor.org/emoncms/feeds.html) [S02](https://docs.openenergymonitor.org/emoncms/daily-kwh.html) [S03](https://docs.openenergymonitor.org/applications/home-energy.html)
- Home Assistant’s Energy and long-term-statistics model is an adjacent, differently scoped dashboard. Its reset and aggregation behavior is a failure cue only. In particular, do not import its documented 10% decrease rule as a meter reset rule, or sum resettable sources on that basis. [S04](https://www.home-assistant.io/docs/energy/) [S05](https://www.home-assistant.io/docs/configuration/long-term-statistics/) [S06](https://www.home-assistant.io/docs/energy/faq/)
- Polars is a Rust-compatible CSV/dataframe and lazy-scan option. The supplied research found no row-count or interval evidence that justifies selecting it now. Keep it optional pending representative profiling; retain raw values and provenance if it is later used. [S07](https://docs.pola.rs/user-guide/io/csv/) [S08](https://docs.pola.rs/user-guide/transformations/time-series/parsing/)
- The supplied research also inspected chrono-tz 0.10.4 as a supporting example: local-time conversion can distinguish an ambiguous repeated time from a nonexistent time. It is not a selected dependency. Preserve both daylight-saving cases as unresolved input interpretations where the source lacks an offset or other disambiguation. [S25](https://docs.rs/chrono-tz/latest/src/chrono_tz/timezone_impl.rs.html)

### Parser candidate and issue history

The supplied research pins Rust csv 1.4.0, published 2025-10-17, to commit 4a3997e91d668ea1d8595bdef15625a77cf2308a. In that source, ReaderBuilder defaults to headers enabled and flexible parsing disabled. Strict mode reports unequal record widths with expected and actual field counts and a position; flexible mode allows the raw records through, so the app must then validate each row against the selected mapping. This supports a review-first candidate, not automatic semantic validation. The app must decide its header and row-shape policy, and must not deserialize into fixed application types before the operator selects the column interpretation. [S09](https://crates.io/api/v1/crates/csv) [S10](https://api.github.com/repos/BurntSushi/rust-csv/git/tags/1.4.0) [S11](https://github.com/BurntSushi/rust-csv/commit/4a3997e91d668ea1d8595bdef15625a77cf2308a) [S12](https://raw.githubusercontent.com/BurntSushi/rust-csv/4a3997e91d668ea1d8595bdef15625a77cf2308a/src/reader.rs) [S13](https://raw.githubusercontent.com/BurntSushi/rust-csv/4a3997e91d668ea1d8595bdef15625a77cf2308a/src/error.rs) [S15](https://raw.githubusercontent.com/BurntSushi/rust-csv/4a3997e91d668ea1d8595bdef15625a77cf2308a/csv-core/src/reader.rs)

The critic’s exact captures support two narrow locator cautions. Issue #422 shows a mismatched-width example where a following record is reported at line 4 although the example expects line 5. Issue #395 describes a CRLF case where Position::line reports the last record’s line instead of the next record’s starting line. The captures show issue reports, not a verified defect in every input and not a fix or release history. Therefore retain positions for diagnostics, but do not present their line number as verified physical provenance. [C01](sources/rust-csv-issue-422.html) [C02](sources/rust-csv-issue-395.html)

The pinned reader documentation says StringRecord/String reading strictly enforces UTF-8 and errors on invalid UTF-8; it points to ByteRecord for byte-oriented reading and says other encodings need explicit transcoding. The original byte sequence therefore remains the evidence even where a text interpretation fails. [C03](sources/rust-csv-1.4.0-reader.txt)

The optional comment-line path has a supported issue → implementation → regression → release trace: issue #46 led to the comment builder and parser implementation, tests were added, and the pinned 1.4.0 source still contains the public path and comment tests. Comments are disabled by default in the core reader. Keep comment handling profile-specific and off unless the export establishes it. Do not say every case is fixed: issue #363 and PR #396 remain unresolved in the captured research map, and PR #396’s EOF/no-final-newline case is not evidence of behavior shipped in 1.4.0. [S17](https://github.com/BurntSushi/rust-csv/issues/46) [S18](https://github.com/BurntSushi/rust-csv/issues/46/timeline) [S19](https://github.com/BurntSushi/rust-csv/commits/a267ded9dfd595e013a074a9cd3ef1dc6cfb6373) [S20](https://github.com/BurntSushi/rust-csv/commits/6f24780f26a81336bc919e4e2b07cdcadb0c309d) [S21](https://raw.githubusercontent.com/BurntSushi/rust-csv/a267ded9dfd595e013a074a9cd3ef1dc6cfb6373/csv-core/src/reader.rs) [S22](https://raw.githubusercontent.com/BurntSushi/rust-csv/a267ded9dfd595e013a074a9cd3ef1dc6cfb6373/src/reader.rs) [S23](https://github.com/BurntSushi/rust-csv/issues/363) [S24](https://github.com/BurntSushi/rust-csv/pull/396) [S26](https://api.github.com/repos/BurntSushi/rust-csv/issues/46/comments)

## Complete frozen-plan comparison

| Frozen section | Disposition | Final treatment |
|---|---|---|
| **P1 — Ingestion** | Retain and specify. | Keep immutable input bytes and a preview that makes meter, header, timestamp column/format, timezone or offset, timestamp convention, value column, unit, value kind, and interval duration explicit. Add visible decode failures and a versioned encoding/transcoding choice. Preserve malformed or irregular records for review. Library line numbers are advisory; record identity is app-owned. |
| **P2 — Evidence and overlap review** | Retain. | Keep local originals, interpretations, review flags, repeat imports and overlaps with provenance. Identify an emitted record by immutable file identity plus app-owned logical-record ordinal. Keep parser line/position as advisory; include byte offset only after validated. Do not overwrite or silently merge records. |
| **P3 — Dashboard and comparison** | Retain and clarify. | Keep daily/monthly views, time-of-day profiles, selected-period comparisons, visible missing/excluded records and coverage where a valid denominator exists. Do not interpolate or silently promote estimates. Leave allocation of intervals crossing day/comparison boundaries unresolved and visible. |
| **P4 — Decisions and alternatives** | Retain unchanged. | Keep competing interpretations and optional dated closure/event annotations separate from measurements. Describe differences without causal attribution. No verified savings, tariffs, billing certification, equipment advice, or automated control. |
| **P5 — Components and privacy** | Retain as candidate/open choices. | Keep csv 1.4.0 a parser candidate subject to project dependency review; keep Polars optional after profiling; leave aggregation, chart and storage components open. Require local storage and a locally usable core workflow. Optional account/network capability remains a decision. Omit account identifiers from exports unless the operator explicitly selects a review package that needs them. |
| **P6 — Export and validation** | Retain and extend proposed checks. | Export period bounds/timezone, source and import identities, interpretation versions, coverage and exclusions, units/value kind, review resolutions, calculation method and uncertainty. Add encoding, locator, and boundary-crossing fixtures to the existing proposed checks. No check is represented as run. |

## Proposed replacement sandbox plan

### Goal and bounds

Build a local dashboard for operators of one community-centre building using CSV exports from three meters over one year. Help them inspect when energy is used, compare periods, and review inconsistent exports. Preserve the P1–P6 scope. Do not certify bills or tariffs, claim verified savings or causation, advise equipment purchases, or control equipment.

### P1 — Import and interpretation preview

Retain the original file bytes immutably and assign each import a source-file identity. Preview the raw header and sample records before including anything in summaries. Let the operator select or confirm the meter, timestamp column and format, timezone/offset interpretation, whether a timestamp denotes an interval start/end or cumulative-reading instant, value column, unit, value kind, and interval duration where applicable. Keep parsed candidates beside their original bytes/cells and attach a versioned interpretation.

Use csv 1.4.0 only as a candidate record parser. Choose strict row-width checking with positioned findings, or flexible mode to expose records followed by explicit app validation; in either path, no mismatched-width record enters measured totals without a recorded review resolution. Assign an app-owned ordinal as each source record is emitted in order within the immutable file identity. Do not use the library’s line field as verified physical provenance. A byte offset may be displayed as a locator only after tests confirm its behavior for supported input forms. Quoted multiline records count as one logical record even when they span multiple physical lines.

Show UTF-8 decode errors rather than replacing characters silently. The original byte sequence remains available. A ByteRecord or other byte-oriented preview may support review of undecodable records, but undecoded content is excluded from measured summaries. Decide whether MVP supports only UTF-8 plus byte review or also selected transcoding. Any transcoding must be explicit, versioned, reproducible, and traceable back to the untouched original. Enable comment-line parsing only for a confirmed export profile; leave it disabled otherwise.

### P2 — Local evidence store and review history

Keep source files and raw records immutable. Store the import identity, record ordinal, available parser diagnostics, mapping and version, derived time/interval, review flags, operator resolution, and links to the original record. If a parse failure prevents reliable record boundaries, retain the file-level error and any available offset only as an advisory locator; do not invent a row identity.

Compare repeated exports for exact duplicates and overlapping meter/time ranges only after a timestamp interpretation exists. Show both provenance paths and let the operator retain, exclude, or resolve records. Preserve each decision and interpretation version. Do not automatically overwrite, collapse competing sources into one “true” record, sum an overlap twice, or infer meter rollover limits. An overlap flag alone does not establish which record is valid.

### P3 — Calculations and dashboard

Provide daily and monthly totals, time-of-day profiles, and user-selected period comparisons. Derive interval-energy totals only from reviewed interval-energy rows with compatible units. Convert power to energy only if the value is known to be interval-average power and duration/time interpretation is known; label the calculation. Derive cumulative-reading differences only between ordered readings under one interpretation. Flag decreases as possible reset/rollover cases; do not apply a generic 10% threshold or infer a rollover maximum. Missing, undecoded, malformed, and excluded readings stay visible and are not silently interpolated, carried forward, or converted to measured values.

Show units, selected timezone/calendar, exact period boundaries, interpretation version, valid/missing/excluded counts and coverage only when the expected cadence and denominator are known. Otherwise report coverage as unavailable rather than inventing a ratio. Preserve source timestamps and offsets. A naive local time that is ambiguous or nonexistent at a daylight-saving transition remains unresolved unless the input disambiguates it; do not silently shift or merge it.

An interval-energy row may cross midnight or a user-selected period boundary. No supplied evidence chooses whether to assign it to its start/end, split it, or exclude/flag it. Until a product choice is made, keep the interval intact and flag affected daily/period totals so they do not imply one of those allocations. Do not silently prorate.

### P4 — Alternative interpretations and operator context

Allow saved competing interpretations and comparisons between them. Allow optional dated annotations such as a closure period, visibly separated from meter measurements. Describe what selected records show without attributing cause. Keep verified savings, billing, tariffs, equipment advice and automated control outside the product boundary.

### P5 — Components, local workflow, and privacy

Candidate parser: Rust csv 1.4.0 at the pinned commit, pending later dependency-policy and project review. Its record parsing does not validate meter identity, timestamp meaning, units, energy semantics, or comparability. Keep app interpretation and validation separate. Consider Polars only if representative file-size and interaction profiling shows the simpler approach is insufficient; no chart or storage library is selected by this research.

Keep the originals and core import/review workflow local and usable without a required network service. Whether optional sync or account connectivity is offered remains open. Default comparison exports omit account identifiers; include them only through an explicit review-package choice. Storage format, chart component, aggregation engine, package details, event vocabulary, and identifier treatment in a selected package remain product choices.

### P6 — Comparison export and proposed validation

Export the selected period boundaries and timezone, meter/import/source identities, interpretation versions, units and value kind, included/missing/excluded coverage, review decisions, calculation method, boundary allocation status, and unresolved uncertainty. Preserve enough provenance to reproduce the displayed comparison from retained inputs. Omit account identifiers by default.

**Proposed checks only; none has been run:**

1. Import a UTF-8 sample with headers, quoted delimiters, a ragged row, and a later valid row. In strict and flexible modes, confirm raw evidence is retained, each row’s app-owned ordinal is stable, width errors remain review findings, and no unresolved row enters totals.
2. Use CRLF and a mismatched-width record followed by another record. Compare the parser’s reported position with the app ordinal and expected fixture. Show library line numbers as advisory. Include a quoted multiline record to ensure logical-record ordinal is not confused with physical line count. Validate byte offsets before using them as provenance.
3. Supply invalid UTF-8. Confirm original bytes remain unchanged, decode failure is visible, undecoded content is excluded from measured totals, and byte-oriented preview behavior is explicit. If transcoding is supported, confirm it is versioned, reproducible, and reversible to original bytes.
4. Use interval-energy records that cross midnight and a selected comparison boundary. Confirm the chosen allocation rule is labelled, or the affected total remains flagged/unallocated while the choice is open. No silent proration.
5. Re-import identical bytes and an overlapping export. Confirm both identities remain visible, duplicate/overlap flags are stable, and explicit review changes calculations without rewriting source evidence.
6. Use synthetic interval-energy and interval-average-power examples with known units and duration. Confirm only declared compatible value kinds are included and changing the mapping version causes reproducible recalculation.
7. Use a cumulative series with increases, a drop, and an unknown rollover limit. Confirm the drop is flagged and no negative consumption or guessed rollover is silently produced.
8. Use timezone fixtures for a spring-forward gap and fall-back repeated wall-clock value. Confirm supplied offsets map to distinct instants and ambiguous/naive values remain unresolved unless explicitly interpreted.
9. Remove one interval and exclude one suspect record. Confirm gaps, exclusions, reasons, coverage and reviewed totals are visible; no gap joining or imputation occurs.
10. Export an unchanged comparison twice. Confirm period boundaries, interpretations, provenance and aggregates are reproducible and account identifiers are absent by default.
11. If comment parsing is enabled for a confirmed profile, test comments between records and at EOF without a trailing newline against the selected parser version. Until verified, keep that profile’s comment handling disabled.

These synthetic fixtures validate only the behavior they encode. They do not establish the format or correctness of real building exports, actual savings, billing accuracy, performance, or product suitability.

## Criticism disposition and open decisions

- **Criticism 1, row positions:** accept the reported ragged-row and CRLF risks and the proposed app-owned record identity. Bound the conclusion: the two issues are captured upstream reports, not evidence that every parser position is wrong or a fix has shipped. Keep line and byte location metadata useful for diagnosis only until validated.
- **Criticism 2, invalid encoding:** accept. Preserve raw bytes, expose decode failure, prevent undecoded content from entering measured summaries, and make transcoding explicit/versioned. MVP encoding support remains undecided.
- **Criticism 3, network/account restriction:** accept. Remove “no network service or account connection” as a product constraint. Keep local storage and local core workflow; optional account/network behavior remains open.
- **Criticism 4, period boundary:** accept the missing allocation rule. Keep the interval whole and the affected result flagged until a product choice is made; add the boundary fixture. Start/end assignment, proportional split, and exclusion/flagging remain alternatives, not decisions.

Still unresolved: actual CSV formats and header policy; time-zone/offset encoding; interval-start/end versus cumulative-instant convention; value kinds and durations; encoding/transcoding scope; row-shape handling; which record locators can be trusted; nominal cadence and coverage denominator; duplicate and partial-overlap resolution; reset/rollover policy; interval allocation at daily and comparison boundaries; comparability cutoffs; optional sync/account support; storage, chart and aggregation components; review-package structure and identifiers; operator-event vocabulary. No supplied sample or product-owner decision resolves these choices.

## Obligation disposition

- **O1 — open discovery:** retain the brief-led product and implementation discovery from research-v1. Keep its negative and optional mechanisms with their limits: gaps rather than default joins, Home Assistant reset behavior as analogy only, Polars optional pending scale evidence, and timezone ambiguity as a mechanism example. No additional broad discovery was done here.
- **O2 — pinned code and mechanism:** retain the pinned csv 1.4.0 inspection, strict/flexible row-width behavior, error position and candidate-parser recommendation, qualified by issue-reported line-location cases and strict UTF-8 behavior. No dependency approval is claimed.
- **O3 — issue/fix/regression/release:** retain the bounded #46 comment-path trace through implementation, tests and 1.4.0. Keep #363/#396 unresolved; add #422/#395 as captured position reports only. Claim no fix for those position reports.
- **O4 — plan decisions:** compare every supplied P1–P6 section above and preserve the frozen boundaries and no-billing/no-control/no-verified-savings constraints.
- **O5 — independent criticism:** disposition all four critic findings above, including their supporting evidence, bounded disagreements, and unresolved product choices.
- **O6 — complete proposed change:** this artifact is one coherent revised sandbox plan across P1–P6, retaining supported choices, alternatives, validation proposals, and explicit uncertainty. It is not a list of research leads.

No application or dependency tests, performance work, SourcePASS evaluation, new campaign reads, or extra stage were performed.
