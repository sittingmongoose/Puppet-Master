# REV-M review: OME05 Slide Scout, results X1 and X2

TEST_ONLY_NEVER_PROMOTE. Offline evaluation of sandbox work. Evaluator: claude-opus-5-5 at xhigh, 2026-09-27. Configuration labels were withheld and not guessed. The machine-readable record is `out/grades.json`; this file carries the same content.

**What was graded.** Only `delivered.md`, by its asserted meaning:
- Section 1 (CONFIRMED blocks, or the verifier's replacement text for QUALIFIED blocks) and section 4 (verifier additions) count.
- Sections 2 and 3 and the section 5 history, including every block marked NOT A CLAIM, get no retention credit.
- Upstream material was opened only after the step 2–4 results were saved. One exception: a grep over `results/` earlier printed three upstream observation lines (O-009, O-010, O-028). No status depends on them.

**Evidence convention.** Source handle plus line range; the catalog `view_sha256` for each decisive handle is listed in `grades.json`. Excerpt hashes weren't computed because the toolset has no shell. The host validates JSON and hashes.

---

## 1. Reference facets and input eligibility (step 1)

No reference proved mistaken at this snapshot. Statuses count eligible facets only.

| Ref | Facets derived from the full clause | Eligibility | Decisive source |
|---|---|---|---|
| **C01** Versioned metadata admission | a) v3 `zarr.json` + `attributes.ome.version "0.5"` vs legacy flat `.zattrs`; b) version consistent within a hierarchy (MUST); c) explicit validation or a truthful unsupported result; d) no implicit legacy reinterpretation; e) legacy vs 0.5 check, plus a mixed-version check | all eligible | S003 67-72, 149-165; S058 301-329; S019 58-66 (reference reader silently switches format); S048 166-170 |
| **C02** Axis-to-array identity | a) axes length = rank, order rules; b) unique names = `dimension_names`; c) navigation from validated axis identity, not fixed 5D, shape or names; d) **absent vs length-one dimensions**; e) reject mismatches without inventing sliders | all eligible | S003 81, 168-174, 296-307; S034 70 (real shape `1,1,1,93184,144384`); S033 333-337 |
| **C03** Declared pyramid selection | a) `datasets` order is authoritative (group-relative paths, arbitrary names); b) per-level transform, no factor-2, anisotropic/non-2 steps; c) no folder sorting; d) **explicit missing-level handling**; e) UI/performance policy is a product choice | all eligible | S003 91-94, 304-312; S043 2-35, 80-108 |
| **C04** Composed coordinate calibration | a) dataset scale then translation, then multiscales-level transforms; b) offsets included; c) units from axes, none invented; d) **scale may be a relative factor when calibration is unavailable** (S003 310); e) **concrete check exposing reversed composition or omitted offsets** | all eligible | S003 169-172, 293, 308-316 |
| **C05** Label discovery and registration | a) `labels` key/listing, intermediate groups; b) same level count; c) **`image-label.source.image` association resolved before overlay**; d) transform alignment, label dims equal image or 1, not folder/dims matching; e) unsupported geometry explicit | all eligible | S003 102-117, 431-474 (106-108 dims rule) |
| **C06** Categorical label identity | a) 8 integer dtypes incl. 64-bit; b) colors/properties keyed by label-value; c) **identity through resampling/lookup, exact 64-bit precision**; d) or a declared exact range with refusal; e) palette is a reader SHOULD | all eligible | S003 434-471; S025 84-86; S048 609-661, 706-708 |
| **C07** Metadata-driven chunk decoding | a) declared codec chain incl. sharding/index codecs; b) reverse-order decode semantics; c) **bytes endianness**; d) **transpose handling or truthful refusal**; e) explicit support boundary, unsupported data never shown as pixels | a, c, d (handling), e eligible. **b and normative transpose semantics: unassessable_missing_input** (no Zarr v3 spec in corpus) | S055 16-57 (endian declared); S033 356-359; S013 325; S109 553-600, 2720 (fixed adjudication); S038 58 |
| **C08** Absent data vs failed reads | a) fill_value semantics for absent chunks; b) **valid absent (fill, sparse wells) vs read/decode/cancellation failure**; c) show the actual state, never zero-fill failures; d) read-only incl. reader-side writes; e) store absence semantics | b, c, d eligible. **a, e: unassessable_missing_input** (only fill_value values in S055 65, S109 600) | S003 128-129, 641-642; S018 425-439, 540-558; brief 5; Plan 7, 9; S034 154-156 |

---

## 2. X1

### 2.1 Reference statuses (step 2)

| Ref | Status | Retained facets | Missing facets | Where (delivered) |
|---|---|---|---|---|
| C01 | **retained** | a–e | none (the hedge "invalid-or-uncertain" is weaker than "invalid") | s1 B-004, B-010, B-030 (0.4 fixture), B-065 (per-row malformed battery); s4 A2, N3 |
| C02 | **narrowed** | a, b, c, e | d (length-one axes); F4 validation idea only in history B-047 | s1 B-005, B-045/046, B-055, B-065 |
| C03 | **narrowed** | a (group-relative not stated), b, c, e | d (missing declared level); F2 validation only in history B-037 | s1 B-005, B-035/036, B-020, B-085, B-100 |
| C04 | **narrowed** | a, b, c (partial) | d; no explicit "no invented units"; e only in history B-057; its non-finding says the corpus never gives napari's combination (S048 260-291 does) | s1 B-005, B-055/056, B-020, B-092 |
| C05 | **narrowed** | a, b, d (transform alignment), e | c (source.image linkage); equal-or-1 dims rule | s1 B-007, B-050, B-051 |
| C06 | **narrowed** | a, b, d, e | c (resampling identity, 64-bit precision) | s1 B-007, B-050, B-070/071, B-094 |
| C07 | **narrowed** | a, e | c (endianness), d (transpose); b unassessable | s1 B-004, B-035/036, B-065, B-069..071, B-019; s4 A8 |
| C08 | **narrowed** | c (partial: no silent zero-fill, never silent no-chunks), d | b (F8 lists "missing wells/fields" as a failure next to P5's valid sparse plates; cancelled work isn't distinguished from failure); F10 hash check only in history; a/e unassessable | s1 B-013, B-019, B-022, B-065, B-075/076 |

### 2.2 Unsupported, overstated or contradicted claims (step 3)

| ID | Claim (location) | Counterevidence | Type / severity |
|---|---|---|---|
| X1-U1 *(shared)* | AGAVE "hard-codes dimorder T,C,Z,Y,X" (B-015; B-045 reason) | S098 256 is only a default in unchanged diff context; a `getAxes(axes)` parser exists (S098 234, S092 60); the use site isn't in the corpus | unsupported code fact; low-moderate |
| X1-U2 | napari "resolves arbitrary entry points by walking up, and tolerates rotation/affine/sequence with warn-and-skip" (B-014 CONFIRMED); F1 constraint "arbitrary entry-point walk-up (S048 672-689)" (B-030) | S048 81-133: these transforms are composed; only unknown types warn and skip. S048 664-699: walk-up only from Labels (1) / Label (2) roots; a no-match prints and returns nothing. Also contradicts X1's own B-093 reason | code fact wrong and carried into a Plan constraint; low-moderate |
| X1-U3 | OME-Zarr dialog "claims only resolution/channel/sub-region"; time slider "only" in old docs (B-015, N6) | S117 111-116: Time selection plus a Time Panel in the OME-Zarr Load Settings | omission stated as negation; low |
| X1-U4 | "Full-resolution stitched canvases are risky: napari … crashes on zoom" (B-022) | S043 218-220 gives no cause | causal overreach; low |
| X1-U5 | N2 heading "plate labels come from the first well's first field only" | S048 535-537: label data comes from the plate-wide `get_pyramid_lazy`; only metadata comes from the first well/field (body text is correct) | overgeneralised; low |
| X1-U6 *(shared)* | P15 calibration survey with no version qualifier (B-020) | S043 318-470 rows are "(v0.4)" samples | lost version qualifier; low |
| X1-U7 *(shared)* | F1 requires "user choice by name"; O-C3 calls the same UI optional (B-030 vs B-091) | S003 388-397 is permissive | internal tension; low |
| X1-U8 *(shared)* | F8 row "missing wells/fields" as a failure vs P5 valid sparse plates (B-065 vs B-008) | S003 128-129, 641-642; S018 543-557 zero-fills both cases | ambiguous disposition; low-moderate |

**False dismissal.** X1-FD1: B-112 and the section-4 non-finding say "the corpus never states the fixed napari reader's transform combination". S048 260-291, which B-112 itself cites, states it: datasets[0]'s first transform plus the first matching top-level transform, so a dataset translation is dropped. The verifier's S048 read ranges skip lines 250-328. Severity low-moderate: it loses an omitted-offset precedent relevant to C04.

**Verifier defect.** X1-VD1 (shared): all 12 validation-idea blocks were marked NOT A CLAIM although they are substantive. Four were restated in replacements (F1, F5, F7, F8). Eight survive only in history: F2, F3, F4, F6 (the hand-computed cursor check), F9, F10 (fileset hash), F11, F12.

### 2.3 Novel supported findings and correct non-findings (step 4)

Shared with X2 (N1–N14):
- **N1** resave whole-array shards (S034 291-307).
- **N2** interop failure precedents (S038 58; S014 139-143; S011 151-157).
- **N3** HCS navigation precedents (S043 207-238; S018 404-567).
- **N4** bioformats2raw precedence (S003 256-275).
- **N5** HCS hierarchy and sparse plates (S003 118-129, 515-560, 740-752).
- **N6** omero defaults and per-channel degradation (S003 398-430; S018 375-383; S048 316-323).
- **N7** multi-multiscales handling (S003 388-397; S043 277-316).
- **N8** AGAVE bounding dialog (S117 94-135).
- **N9** AGAVE TIFF/CZI-era limits (S108).
- **N10** reader release timeline (S052).
- **N11** validator plus sample catalogs as an oracle (S031, S034).
- **N12** AGAVE scenes = `multiscales.size()` (S098 226-233).
- **N13** labels hidden by default in both readers (S018 315-318; S048 652-659).
- **N14** absolute-path settings trap (S108 27).

X1 only:
- **N15** The mixed v04/v05 exception is write-path only. On read, ome-zarr-py detects the format, logs "version mismatch" and silently switches (S013 157-164; S019 58-66), so Slide Scout's errors must not copy that switch.
- **N16** Plate-label sourcing is routed to an explicit product decision (S048 507-555).
- **N17** The validator's `schemas=` override (S031 8-15).
- **N18** PR123 merge date, 8 May 2026 (S027 126-131).

Correct non-findings:
- **NF1** No implemented background/cancel precedent exists. S103, the AGAVE issue on blocking, non-cancellable loads, corroborates this; X1 didn't cite it.
- **NF2** No PR594 rule detail (S052 128).
- **NF3** Read-path compressor/codecs spelling is unaddressed (S013 166-186).
- **NF4** The validator rule list is absent (S031).
- **NF5** Empty captures are absence of evidence (S002, S005, S007).
- **NF6** The U1–U4 dispositions (general overlay, out-of-scope items, scene, zlib).
- **NF7** No frequency data. Accepted as bounded; full-corpus absence is PENDING_HIGH_END_VERIFICATION.

### 2.4 Handoff (step 5)

The upstream (O-001..O-068 plus the draft) is shared with X2.

- **Distortions kept.** O-063 (walk-up) and O-064 (transform composition) were correct upstream but distorted in the draft. X1 kept both distortions.
- **Lost or narrowed:**
  - O-010's "source.image drives linkage", which is C05.c.
  - O-028's 64-bit label renderer gap, narrowed (C06).
  - O-022's crc32c index codec (minor).
  - 8 of 12 validation ideas, moved to history.
  - O-061's caution (low value).
- **Over-correction.** O-052 was corrected but the time capability was dropped with it (X1-U3).
- **Error carried.** O-053's dimorder overreach.
- **Corrected:** O-032 (OMERO row), O-062 (plate labels, now a decision), the draft's F7 "corpus proves", and O-049's date.
- **Gains beyond upstream:** O-046's open question answered (N3). O-044's question, however, was wrongly closed (FD1).
- **Acquisition gaps, not handoff losses:** length-one axes, missing level, relative scale, label resampling/precision, endianness (S055 and S033 356-359 were never noted), transpose (S109 never visited), and absent-vs-failure (O-020 itself lumps "missing/failed").

### 2.5 Coherence and decision burden

**Coherence.** Coherent; the replacements stand alone and section 4 matches them. Internal contradictions:
- P10 vs the B-093 reason.
- F1 vs O-C3.
- The F8 missing-wells row vs P5.
- R4 vs the S048 lines it cites.

The shared host layout is untidy: the reading guide sits inside section 1, headings collide, and the host report shows `complete:false`. That's readability, not a research defect.

**Burden:**

| Kind | Count | Items |
|---|---|---|
| Blocking | 4 | D1 plate navigation plus plate-label sourcing; D2 channel rendering architecture; D3 pyramid UX/bounding; D4 strictness posture |
| Nonblocking | 2 groups | D5 overlay scope (the Plan already scopes overlays to labels); D6 optionals gate listing O-C1..O-C8 individually (10 options including the O-C4/O-C5 sub-choices) |
| Clarification | 11 | R1–R7, A2–A5 |
| Redundant | 3 | R1 (settled by S003), R4 (answered by S048), D5 (largely resolved by the Plan's canonical choice) |

### 2.6 Coverage

**Assessed:**
- Full `delivered.md`.
- Every section 1 block and section 4 item.
- Source windows listed in `grades.json` (S003 in full; S018, S019, S013, S027, S033, S034, S043, S048, S055, S058, S092, S096, S098, S108, S109, S117, S028, S050, S052, S016, S004, S008, S031, S025, S014, S011, S038, S044, S005, S007).
- Corpus-wide greps for endian, fill_value, transpose, cancel, layout, scene and plate.py.

**PENDING_HIGH_END_VERIFICATION:**
- S053 schema counts; S054/S056 example details (P13).
- S023, S017, S061, S062, S072, S010, S059 beyond grep; S048 1-59; S033 1-149 (P12 pyramid defaults).
- Full-corpus absence claims over the large dumps.
- Byte identity of the X1 upstream draft with the X2 copy.
- All runtime behaviour: nothing was executed.

---

## 3. X2

### 3.1 Reference statuses (step 2)

| Ref | Status | Retained facets | Missing facets | Where (delivered) |
|---|---|---|---|---|
| C01 | **retained** | a–e | per-row malformed battery only in history (B-067); 0.4 detect-and-explain left as a nonblocking open question | s1 B-004, B-010, B-030 (0.4 fixture), B-065; s4 U-B |
| C02 | **narrowed** | a, b, c, e | d; F4/F8 validation ideas only in history | s1 B-005, B-045/046, B-055, B-065 |
| C03 | **narrowed** | a, b, c, e | d; F2 validation only in history | s1 B-005, B-035/036, B-020, B-085, B-100 |
| C04 | **narrowed** | a, b (+ N3 omitted-offset precedent), c (partial; units rule required in G3) | d; no explicit "no invented units"; e only in history B-057 | s1 B-005, B-055/056, B-020, B-092; s4 N3, G2, G3 |
| C05 | **narrowed** | a, b, d (transform alignment + N6 equal-or-1 rule), e | c (source.image linkage) | s1 B-007, B-050, B-051; s4 N6 |
| C06 | **narrowed** | a, b, d, e | c | s1 B-007, B-050, B-070/071, B-094; s4 G4 |
| C07 | **narrowed** | a, e | c, d; b unassessable | s1 B-004, B-035/036, B-065, B-069..071, B-019; s4 N1 |
| C08 | **narrowed** | c (partial), d | b; F10 hash check only in history; a/e unassessable | s1 B-013, B-019, B-022, B-065, B-075/076 |

### 3.2 Unsupported, overstated or contradicted claims (step 3)

| ID | Claim (location) | Counterevidence | Type / severity |
|---|---|---|---|
| X2-U1 *(shared)* | AGAVE "assumes a fixed T,C,Z,Y,X dimorder" (B-015; B-045; U-B) | as X1-U1 | unsupported code fact; low-moderate |
| X2-U2 | "conforming groups MUST carry the **string** value "3""; reason: "the value is the string "3" … not the bare number 3" (B-009) | S003 200, 213 (and 0.4 S059 255, 261) show the integer `3` in the spec's own examples; only the prose at S003 256 quotes "3" | overstated, loses the ambiguity; a type-strict check would hide spec-example-shaped collections; **moderate-low** |
| X2-U3 | F5 constraint: "for plates, derive label metadata from the first well/first field …" (B-050) | a napari shortcut (S048 507-555), not a spec rule; X2 itself says the per-well behaviour is unverifiable; S003 740-752 allows heterogeneous wells | unjustified Plan requirement that silently approves one alternative; low-moderate |
| X2-U4 | "corpus proves both automatic background/cancel (Plan) and explicit pre-load bounding" (B-060 CONFIRMED) | no corpus implementation; S103 records blocking, non-cancellable loading as an open request | evidence basis overstated; low |
| X2-U5 | N6: the 0.5 spec is "without this rule" (label dims equal image or 1) | S003 106-108 states the rule; S058 333-337 copies the 0.5 layout | false absence claim; low (the rule itself is right) |
| X2-U6 | N5: maintainers "propose to retire" ome-zarr-py reading | S028 3051: the Oct-2025 update calls that "a bit extreme" and says the reading API is "still undecided" | lost update qualifier; low |
| X2-U7 | L1: the reference "builds the full dask pyramid eagerly … memory model … must beat" | S018 298-322 builds lazy dask arrays; no pixels are read at open | mischaracterised code fact; low |
| X2-U8 | G1: "first-only like all surveyed viewers" | S043 293-313 (three fail to open; OMERO imports all), and X2's own B-021/L4 | internal contradiction; low |
| X2-U9..U11 *(shared)* | P15 missing v0.4 qualifier; F1 vs O-C3 tension; F8 missing-wells row | as X1-U6..U8 | low / low / low-moderate |

**False dismissals.** None. R2–R7 sit in section 3 as honest open questions.

**Verifier defect.** X2-VD1 (shared): all 12 validation ideas were marked NOT A CLAIM. Only F1 and F5 were restated, so ten survive only in history. That includes the F7 cancel check and the F8 per-row battery, which X1 kept.

### 3.3 Novel supported findings and correct non-findings (step 4)

Shared with X1: N1–N14 (same identities as in §2.3).

X2 only:
- **N15** The current napari reader applies only datasets[0]'s first transform plus the first matching top-level transform, so a plain 0.5 dataset translation is dropped (S048 260-283 vs S043 370-371). This is an omitted-offset precedent, adjacent to C04.
- **N16** napari composes rotation/affine/sequence; only unknown types warn and skip (S048 81-133).
- **N17** Walk-up happens only from label roots; a no-match silently returns nothing, so Slide Scout needs an explicit error and a bare-labels-subgroup test (S048 664-699).
- **N18** Plate opening amplifies metadata reads, row × col × levels (S050 3644, 3691). Scope caveat: this is a v2-era remote-HTTP report and X2 doesn't note Slide Scout is local-only.
- **N19** Most surveyed viewers ignore omero metadata (S043 38-78).
- **N20** AGAVE has a scene-selection dialog and an error dialog that names the reason (S117 63-70).
- **N21** bioformats2raw layout-3 lineage (S033 339-349); low value.
- **N4 refinement** When plate metadata is present, matching `series` SHOULD still be provided (S003 261-263).

Correct non-findings:
- **NF1** R1 resolved: in released 0.5 the labels list lives in the labels-group `zarr.json`, and PR206 was superseded intent (S003 102-112, 441-450; S004 149-157).
- **NF2** No scene/coordinateSystem in S003 (evaluator grep: 0 hits).
- **NF3** napari `plate.py` is absent (only the S047 200 tree entry; the other hits are `expand_template.py`).
- **NF4** No PR594 detail.
- **NF5** No read-path compressor evidence.
- **NF6** Validator coverage unknown.
- **NF7** The U1–U4 dispositions.

### 3.4 Handoff (step 5)

- **Restored:** O-063 and O-064 to their correct readings, which X1 did not do; O-061's caution (L2).
- **Restored with distortion:** O-019, now described as an "eager" memory model (L1).
- **Corrected:** O-052 (time now kept in the OME-Zarr dialog), O-032, O-062 (as fact, but then turned into a constraint).
- **Introduced by the verifier:** the string-typed layout value (U2).
- **Carried through:** the draft's F7 "corpus proves" (U4) and O-053's dimorder.
- **Lost:** the same as X1 — O-010 linkage, O-028 64-bit gap, O-022 crc32c — plus 10 validation ideas.
- **Gains beyond upstream:** O-044 answered (N3); the series SHOULD (L5).
- **Questions re-listed:** the upstream open questions come back as 22 U-B bullets.
- **Acquisition gaps:** as X1.

### 3.5 Coherence and decision burden

**Coherence.** Coherent and more precise than X1 on reader code and survey scope. Section 4 is long. Internal contradictions:
- G1 vs B-021.
- F1 vs O-C3 (partly reconciled by the G1 recommendation).
- The F8 missing-wells row vs P5.
- N6 vs S003.

The shared host layout issues are the same as X1's.

**Burden:**

| Kind | Count | Items |
|---|---|---|
| Blocking | 6 | plate navigation; channel rendering; pyramid UX/bounding; strictness; which support-matrix cells to claim; acceptance large-case threshold |
| Nonblocking | 10 | multi-multiscales UI, finder, raw fallback, overlay scope, translation, transform tolerance, scalebar/coordinates, units rule, RO-Crate plus label properties, transfer functions/ROI |
| Silently approved | 1 | plate-label sourcing, stated as a constraint (X2-U3) instead of a decision |
| Clarification | 28 | R2–R7 plus 22 U-B bullets |
| Redundant | 13 | G3 contrast degradation (decided in F3), G3 taxonomy verbosity (decided in F8), G2 overlay scope (Plan choice), G3 units rule (duplicates G2), and 9 U-B bullets that duplicate decided or listed items |

Most groups carry a recommendation, which lowers the effective burden per item.

### 3.6 Coverage

As X1, plus S028 3051, S050 3644/3691, S117 63-70, S033 339-349, S043 38-78, S018 298-318, and the NF1/NF3 greps. The same items are PENDING_HIGH_END_VERIFICATION. In addition, the U-B questions weren't individually re-investigated (they're bounded unknowns, not defects), and the L2 caution was accepted as hedged.

---

## 4. X1 vs X2 by finding identity

### 4.1 Reference key

| Ref | X1 | X2 | Identity note |
|---|---|---|---|
| C01 | retained | retained | **Both.** X1 gains: per-row battery in s1, read-path detect/warn/switch (N15), mixed-namespace row. X2: 0.4 message left as an open question. |
| C02 | narrowed | narrowed | **Both narrowed**; **neither** has length-one axes |
| C03 | narrowed | narrowed | **Both narrowed**; **neither** handles a missing level |
| C04 | narrowed | narrowed | **Both narrowed**. **X2 gains** the omitted-offset precedent (N15) and a required units rule. **Neither** has the concrete check in s1 (history-only in both); **neither** has relative-factor scale |
| C05 | narrowed | narrowed | **Both narrowed**. **X2 gains** the equal-or-1 dims rule (mis-sourced). **Neither** has source.image linkage |
| C06 | narrowed | narrowed | **Both narrowed**; **neither** has resampling identity or 64-bit precision |
| C07 | narrowed | narrowed | **Both narrowed**; **neither** has endianness or transpose; decode order unassessable |
| C08 | narrowed | narrowed | **Both narrowed**; **neither** separates valid absence from failure or cancellation; fill/store semantics unassessable |

No reference status differs, so there is no critical loss either way. Per the frozen rules, no fractional or net score is given, and extra findings don't offset losses.

### 4.2 Novel findings

- **Both (14):**
  - resave whole-array shards
  - interop failure precedents
  - HCS navigation precedents
  - bioformats2raw precedence
  - HCS hierarchy and sparse plates
  - omero defaults and degradation
  - multi-multiscales survey
  - AGAVE bounding dialog
  - AGAVE TIFF/CZI-era limits
  - reader timeline
  - validator oracle
  - AGAVE scenes = multiscales
  - labels hidden by default
  - absolute-path settings trap
- **Gained by X1 only (lost by X2):**
  - read-path version-mismatch behaviour
  - plate-label sourcing as an explicit decision (X2 has the fact but makes it a constraint)
  - the validator `schemas=` override
  - the PR123 date pin
  - the "no background/cancel implementation precedent" non-finding
- **Gained by X2 only (lost by X1):**
  - napari translation drop (C04-adjacent)
  - napari transform composition
  - label-root-only walk-up with an explicit no-match error
  - plate metadata-read amplification
  - omero ignored by most viewers
  - AGAVE scene/error dialogs
  - layout-3 lineage
  - R1 resolution
  - series SHOULD alongside plate
- **Neither:**
  - transpose/endian layout
  - absent-vs-failed data
  - source.image linkage
  - label resampling/precision
  - missing levels
  - length-one axes
  - S103 (blocking, non-cancellable loads as a counter-precedent)

### 4.3 Unsupported, defective or contradicted

- **Both:**
  - AGAVE dimorder asserted as fact
  - P15's v0.4 qualifier lost
  - F1 vs O-C3 tension
  - F8 missing-wells row
  - validation ideas marked NOT A CLAIM (X1 loses 8, X2 loses 10)
- **X1 only:**
  - napari walk-up and warn-and-skip misdescribed in P10 and the F1 constraint
  - AGAVE time omitted
  - stitched-canvas crash causation
  - N2 heading
  - **R4 false dismissal**
- **X2 only:**
  - **string-typed `"3"` MUST (moderate-low)**
  - **first-well plate-label constraint (low-moderate)**
  - "corpus proves" background/cancel kept
  - N6 misattribution
  - N5 walk-back omitted
  - L1 "eager"
  - G1 contradiction

### 4.4 Handoff

- **X2 restored, X1 did not:** O-063, O-064, O-061, and O-019 (with distortion).
- **X1 corrected, X2 did not:** the draft's F7 "corpus proves background/cancel".
- **Both lost:** O-010 source.image linkage, O-028 64-bit gap, O-022 crc32c, and the draft validation ideas.
- **Both corrected:** O-032, O-062 (with different dispositions), the P14 auto-shard framing, and the P20 "published matrices" claim.

### 4.5 Burden (exact sets, not a quality score)

| | Blocking | Nonblocking | Clarification | Redundant |
|---|---|---|---|---|
| X1 | 4 | 2 groups (10 options) | 11 | 3 |
| X2 | 6 | 10 | 28 | 13 |

X1's lower count isn't a quality win: it includes one wrongly closed question (R4) and one question that's already settled (R1). X2's higher count mostly comes from re-listing upstream questions, many of them redundant, though it attaches recommendations to most decisions.

### 4.6 Bottom line

Both reach the same reference outcome: C01 retained, C02–C08 narrowed. The losses sit in the same layout, precision, association and absent-vs-failed facets, driven mainly by upstream acquisition gaps and by the shared NOT A CLAIM treatment of validation ideas.

- **X2** corrected two inherited reader-code misdescriptions and adds more verified code-level findings. Its verifier also introduced more new errors, including the string-typed layout claim and a silently approved plate-label rule.
- **X1** keeps more checks in section 1 and correctly removes the background/cancel overstatement. It retains two draft misdescriptions of napari and makes one false dismissal.

Neither dominates. Items not assessed are listed as PENDING_HIGH_END_VERIFICATION above and in `grades.json`, not passes.
