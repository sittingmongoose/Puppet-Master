# I-FAST-03 — Independent same-family critique of research-v1

## Stage and scope

**Role:** fresh control-arm critic, following the locked competent-researcher → independent critic → fresh final-reviser sequence. This is the critic artifact; it does not replace the final reviser’s one authoritative proposed-change artifact.

**Inputs:** the frozen input map, complete `brief.md`, `plan.md`, `INPUTS.md`, the full research-v1 `artifact.md` and `source-map.json`, and the 27 retained captures listed there. The frozen brief and plan hashes matched the map. I read the predecessor’s full text and source map, loaded and hashed every mapped capture, and checked the cited code, issue and product passages needed for this independent review. I did not inspect coordinator material or other arms.

**First useful critic finding:** 2026-10-07T21:42:01Z, when independent primary-source search surfaced open rust-csv issue #422 about line locations with mismatched columns. **Complete authored output persisted:** recorded in the adjacent source map after final write.

**Critic status:** `DIAGNOSTIC_UNQUALIFIED`. No application was built; no application or dependency tests were run. All validation below is proposed. No speed, billing, or source-pass result is claimed. Researcher/model-specific usage and billing are unknown (`null`); native Goal counters are separate and recorded only from the native terminal projection.

## Overall assessment

Research-v1 is a substantial, scope-respecting proposal. It treats P1–P6 as open choices, preserves the user’s no-billing/no-control/no-verified-savings boundary, compares all six frozen plan sections, separates source parsing from energy semantics, and provides a coherent replacement sandbox plan with alternatives, validation proposals and uncertainty. Its OpenEnergyMonitor, Home Assistant and Polars findings are useful and are kept with their limits. The pinned `csv` 1.4.0 code inspection and the issue #46 → implementation → regression → release chain are real, not documentation-only.

The final reviser should retain that foundation but make four material adjustments: (1) weaken any implication that the parser’s displayed line number is always trustworthy; (2) specify invalid-encoding handling rather than implying every original row becomes text; (3) avoid turning “local on a normal laptop” into an unapproved “no network service or account connection” product rule; and (4) decide or visibly defer how interval energy crossing a day/period boundary is assigned. These adjustments preserve the frozen product constraints and improve the reviewable evidence path.

## Consequential findings and dispositions

### 1. `csv` row positions are useful, with an open locator caveat — correct P1/P2 and validation

Research-v1 accurately identifies `ReaderBuilder`’s default `flexible=false`, the `Reader::read_record` → `ReaderState::add_record` path, and `UnequalLengths` carrying a record position and expected/actual widths. The release tests establish strict rejection, flexible acceptance and continued reads after a shape error. That supports a review-first parser candidate. In the pinned source, however, the row position’s line field is sourced from `CoreReader::line()`; the existence of a position does not establish that every line number is accurate.

Independent upstream reports expose two directly relevant cases: rust-csv issue [#422](https://github.com/BurntSushi/rust-csv/issues/422) shows an off-by-one reported line after a mismatched-width row; issue [#395](https://github.com/BurntSushi/rust-csv/issues/395) describes stale line reporting with CRLF terminators. Both issue pages were open in the 2026-10-07 captures; neither is a fix or proof of a fix shipped in 1.4.0. The existing draft’s plan to show row/position findings should therefore not present the parser’s line number as a verified physical line in these conditions.

**Disposition for final:** retain `csv = 1.4.0` only as a candidate parser, and retain row-shape findings. For stable provenance, identify a source record using the immutable file identity plus an app-owned logical record ordinal and, if verified, a byte offset; display library line numbers as advisory until validated. Add proposed fixtures for ragged records and CRLF, including the exact reader mode used. Include quoted multiline records so “record number” is not confused with physical line. Do not claim these upstream issues are fixed or shipped. The new captures C01–C04 and inherited S12–S13/S15 support this correction.

### 2. UTF-8 and byte-preservation behavior is underspecified — add a P1 preview decision

The pinned reader documentation says `StringRecord`/`String` reading strictly enforces UTF-8; invalid UTF-8 returns an error. It points to `ByteRecord` for byte-oriented reading and says other encodings require explicit transcoding. The proposal retains the original file and raw cells but does not say how an invalid-UTF-8 export appears in preview or whether it can be reviewed without loss. A local importer should not silently replace characters or claim that all rows are decoded.

**Disposition for final:** state that the original byte sequence is always retained, decode failures are visible and exclude affected content from measured summaries, and any transcoding policy is explicit/versioned and reversible to the retained bytes. Add a proposed invalid-UTF-8 fixture. Whether the MVP supports only UTF-8/byte review or offers selected transcoding remains a product decision. This is a parser limitation and design gap, not a reason to replace `csv` without evidence.

### 3. “Local” was strengthened into an unresolved product constraint — narrow the proposal

Frozen P5 asks for work on a normal laptop and local storage. Research-v1’s revised P5 additionally says “Run without a network service or account connection.” That may be a reasonable local-first implementation recommendation, but it is stronger than the frozen text and the cited component research does not establish a product requirement to prohibit optional network-dependent features. Do not silently make it canonical.

**Disposition for final:** keep local operation and storage as requirements. Phrase offline operation as an MVP design option or “core import/review works locally without a required service,” and leave optional sync/account connectivity undecided unless the product owner supplies that decision. Keep P5’s explicit export rule: account identifiers omitted by default, included only by explicit review-package choice.

### 4. Period-boundary allocation for interval readings remains open — record the dependency

The revised plan distinguishes interval energy, average power and cumulative readings and asks for exact selected period bounds, but it never defines how an interval-energy record that spans midnight or a user-selected comparison boundary contributes to daily totals or period comparisons. Assigning all energy to the interval start/end, splitting it proportionally, or excluding/flagging the boundary record can yield different descriptive totals. There is no supplied export example or product decision that justifies choosing one.

**Disposition for final:** preserve the uncertainty explicitly. Proposed validation should include a boundary-crossing interval and verify the chosen, labelled rule. Until selected, flag the affected boundary calculation or show the interval intact without implied allocation. Do not silently prorate; this is not an invitation to assert causal savings or billing accuracy.

## Complete frozen-plan comparison

| Plan scope | Critic disposition |
|---|---|
| **P1 — CSV ingestion and preview** | **Keep and clarify.** Mapping of meter, timestamp semantics, units, value kind and duration is necessary. Keep originals immutable and rows reviewable. Add encoding/decode failure behavior and qualify library line numbers under ragged/CRLF cases. Preview confirmation before summary inclusion is supported. Comment parsing stays opt-in/profile-specific; the issue #363 / PR #396 history means no claim that EOF comments without a final newline are fixed in 1.4.0. |
| **P2 — local evidence, repeated/overlapping files, provenance** | **Keep.** Preserve original records and user review decisions; do not silently deduplicate or overwrite. Make the row identity robust to physical-line errors: app-owned logical record ordinal and file identity, plus byte offset only after its behavior is validated. Decide duplicate and overlap resolution per retained interpretation; an overlap flag alone must not imply either row is invalid. |
| **P3 — totals, profiles, comparisons, gaps and exclusions** | **Keep and clarify.** No interpolation or silent conversion is strongly supported by the cited gap-joining examples and frozen constraint. Keep units, local calendar, timezone, interpretation, coverage and exclusions visible. If the expected cadence/denominator is unknown or exports are irregular, report coverage as unavailable rather than inventing a ratio. Add the unchosen boundary-allocation rule for energy intervals. |
| **P4 — alternative interpretations and operator events** | **Keep.** Competing interpretations and dated closure annotations remain separate from measurements. Continue to describe differences without causal attribution. No verified savings, tariff/billing conclusions, equipment advice or automated control. The Home Assistant reset behavior is a failure analogue only; do not import its threshold as meter truth. |
| **P5 — components and privacy** | **Retain candidate, not approval.** `csv` 1.4.0 is a supported parser candidate for raw records and shape findings, with the position/UTF-8 caveats above. Polars remains optional pending representative profiling; storage and charting remain open. Keep export privacy defaults. Narrow the new no-network/account statement to a proposal until confirmed. No security, maintenance or dependency-policy review was performed. |
| **P6 — comparison export and checks** | **Keep, with additions.** Existing proposals cover reset/drop, overlaps, DST, units, gaps/exclusions, reproducibility and opt-in comments; no tests were run. Add invalid UTF-8, ragged-row/CRLF location, quoted multiline record identity and boundary-crossing interval cases. State exactly which displayed numbers each test can validate; synthetic tests do not validate building data or real-world savings. |

## Obligation review

- **O1 — open discovery:** satisfied to a useful bounded level. The brief-led search found a close local monitoring analogue (OpenEnergyMonitor), gap-joining and reset mechanisms worth rejecting as defaults, Home Assistant’s differently scoped statistic behavior, a Rust-compatible Polars option, and timezone ambiguity handling. These support rather than prove a particular product design. Preserve the negative/optional findings; do not treat documentation examples as a requirement or infer full-project coverage from the supplied P1–P6 slice.
- **O2 — pinned code/mechanism/context:** satisfied in substance. The 1.4.0 release commit and tag, reader and error definitions, `csv-core` context, caller and tests are mapped. My independent check confirms the versioned source and adds the position caveat; UTF-8 behavior should also enter the revised proposal.
- **O3 — issue/fix/regression/release:** the #46 comment-line issue trace is adequately evidenced: the issue was closed, commit `a267ded…` says it fixes #46 and contains the parser change/tests, and 1.4.0 retains the public comment path and comment tests. This is pertinent to the optional CSV dialect choice, but not the main row-shape behavior. Keep #363/#396 explicitly unresolved; my #422/#395 checks add further open position risks, not additional shipped fixes. Do not equate their existence with a demonstrated defect in the app.
- **O4 — all plan decisions:** research-v1 explicitly compares P1–P6 and preserves all the stated non-goals. The row-location, encoding, local/offline, and interval-boundary points above are additions or qualifiers, not permission to rewrite the user’s scope. No cross-reference beyond this bounded plan was assumed.
- **O5 — flash-family criticism:** this artifact supplies the independent substantive critic review and makes the dispositions explicit for the next stage.
- **O6 — complete proposed-change artifact:** research-v1 already supplies a coherent revised sandbox plan rather than only research leads. The final reviser should carry forward the accepted sections and incorporate the four adjustments above in its single authoritative artifact. This critique is not itself that final plan.

## Validation, preservation and unresolved questions

No application, parser integration or dependency test was executed here or in research-v1. Keep every listed researcher check labelled **proposed**. The final proposal should add a compact deterministic fixture set for (a) UTF-8 failure and preserved original bytes; (b) strict/flexible ragged rows with CRLF and quoted multiline fields, checking record identity and display locators; and (c) an interval crossing a calendar/comparison boundary. Retain the proposed counter decrease, overlap, timezone transition, unit conversion, gap/exclusion, repeat-export and opt-in comment cases. None proves the behavior of real meter files until public-safe representative formats are supplied.

Unresolved product choices remain: timezone and offset encoding; intervals-as-start/end versus cumulative reading instant; nominal cadence and coverage denominator; reset/rollover policy; duplicate and partial-overlap resolution; whether and how period-crossing intervals are allocated; encoding/transcoding support; optional network/account behavior; review-package details and whether identifiers may be included; storage, chart and optional aggregation components; event vocabulary. The final reviser must show these as options/questions instead of deciding by inference.

## Handoff

Carry forward: all frozen P1–P6 obligations and non-goals; the supported `csv` candidate with explicit parser caveats; the correct #46 history and unmerged #396 limitation; gap-preserving and provenance-first defaults; all proposal-versus-execution distinctions; and the four adjustments above. Retain disagreements and uncertainty even if the final writer chooses a product option. No repository, canonical Plans, WorkNodes, accounts, third parties, other cases/arms, nested agents, purchases, installations, external runners or code execution were used. The only message to another thread was the authorized activation-only notice.
