# Independent evaluation — ome-zarr-thin, results X1 and X2

This is an offline evaluation of TEST_ONLY_NEVER_PROMOTE sandbox work, by an independent evaluator at extra-high effort. Configuration labels were withheld and I did not guess them. The machine-readable record is `out/grades.json`; this file has the same content in readable form.

**Scored material.** Only `delivered.md` counts. Credit comes from section 1 (a confirmed block, or the verifier's replacement text) and section 4 (verifier additions). Sections 2, 3 and 5 earn nothing. The upstream files were opened only after steps 1–4 were saved.

**Hashes.** Whole-file view SHA-256 values for the decisive sources are copied from `case/catalog.json` into `grades.json` (`decisive_source_hashes`). I did not compute excerpt hashes: I had no hashing tool, and the host validates hashes.

---

## 1. Reference eligibility (fixed before grading)

| Ref | Eligibility | Decisive corpus material | Adjudication |
|---|---|---|---|
| C01 Versioned metadata admission | eligible | S003 L67-72, L152-156; S016 L81-96; S019 L83-90; S048 L166-170 | holds |
| C02 Axis-to-array identity | eligible | S003 L81, L168-174, L296-307, L825-827; counterexample S048 L222-234 | holds |
| C03 Declared pyramid selection | eligible | S003 L91-94, L304-312; S043 L2-35, L80-108; S016 L285-286 | holds |
| C04 Composed coordinate calibration | eligible | S003 L170, L293, L308-316, L341-374 | holds; probe checked: (7,11) → (24,53) → (96,265) → (196,465) |
| C05 Label discovery and registration | eligible | S003 L102-117, L431-474; S048 L178-197 | holds |
| C06 Categorical label identity | eligible | S003 L434, L438-439, L456-471; S051 L368-379 (draft RFC-5: nearest neighbour for labels); S025 L84-85 and S096 L25-28 (viewers lack 64-bit types) | holds |
| C07 Metadata-driven chunk decoding | partially eligible | S003 L67-72; S055 L16-57 (sharding, bytes endian, blosc, crc32c); S033 L356-359; S109 L553-600, L2720 (transpose) | Fixed split. Transpose handling or refusal is eligible. Normative decode-order semantics (F3b) are **unassessable_missing_input**, because no Zarr v3 core or codec spec is in the corpus. |
| C08 Absent data vs failed reads | partially eligible | S019 L213-233; S018 L429-439; S008 L161-162; S052 L515; brief L3/L5; Plan L7/L9/L11 | My decision: fill_value semantics (F1) are **unassessable_missing_input**. The corpus has only the `fill_value` key (S055 L65). The other facets are eligible. |

The facet lists for each reference are in `grades.json` under `step1_reference_eligibility`. No reference proved mistaken at this snapshot.

---

## 2. Reference grades

| Ref | X1 | X2 |
|---|---|---|
| C01 | **retained** | **retained** |
| C02 | narrowed | narrowed |
| C03 | **retained** | narrowed |
| C04 | narrowed | narrowed |
| C05 | **retained** | narrowed |
| C06 | narrowed | narrowed |
| C07 | narrowed (F3b unassessable) | narrowed (F3b unassessable) |
| C08 | narrowed (F1 unassessable) | narrowed (F1 unassessable) |

**Totals.** X1: 3 retained, 5 narrowed. X2: 1 retained, 7 narrowed. Neither result has a reference lost or contradicted.

### X1

- **C01 — retained.**
  - Present: version location (B-004 L23), the hierarchy-consistency MUST, and the 0.4→0.5 break (B-014 L106).
  - Present: error classes "version mismatch, inconsistent hierarchy" naming the node (B-055 L409), an explicit strict-vs-permissive decision (B-089 L647), and "unsupported version" messaging (B-098 L717).
  - Validation: an unknown-`ome.version` fixture (B-056 L418).
  - Missing: fixtures for an inconsistent-version hierarchy and a legacy container.
  - Caveat: "tolerate legacy placements" (L837) leans permissive, but it sits inside a disclosed policy decision.
- **C02 — narrowed.**
  - Present: rank, order and `dimension_names` rules (B-005 L32); UI keyed to axis type, with axes possibly absent (B-005, B-028, B-029).
  - Missing: separating an absent dimension from a length-one dimension; explicit handling of axis or `dimension_names` mismatches (the error taxonomy has no such class); a mismatch probe.
- **C03 — retained.**
  - Present: the declared ordered list with arbitrary names (B-006); per-level geometry, including Z-downsampling, non-2 and non-uniform factors, and centring translations (B-044 L328).
  - Present: "missing dataset path" in the malformed-input fixture pack, with a specific message (B-056); automatic vs manual selection as a product choice (B-043, B-045); a zoom test on a Z-downsampled pyramid with a factor-3 level (B-046 L346).
- **C04 — narrowed.**
  - Present: the composition rule with translation after scale (B-039 L292), an explicit "unspecified" unit state, and composed per-level readout (B-040 L301).
  - Missing: a distinguishing check. B-041 (L310) uses only scales, which commute, and no translation, so it cannot expose reversed order or an omitted offset.
  - B-041's "degrade to pixel" also contradicts B-040's "unspecified" state.
- **C05 — retained.**
  - Present: association through the labels listing inside the parent image group (valid per S003 L437-442); runtime verification of the level-count MUST; alignment by composed base transforms (B-034 L256).
  - Present: a spec-violating level-count fixture that must be explained, not silently misaligned (B-036 L274).
  - Caveat: the "source.image is broken" generalisation is overstated (see §3).
- **C06 — narrowed.** This matches the half rubric.
  - Present: integer label pixels; per-label-value `rgba` described as optional; a float-label fixture.
  - Missing: identity through resampling or interpolation; a precision or range boundary for 64-bit IDs; explicit "keyed by label-value, not position".
- **C07 — narrowed.**
  - Present: the full v3 surface, sharding with crc32c indexes and codecs (B-003, B-012, B-059); an "unsupported codec/shard/dtype/transform" error class; a codec-matrix pixel-compare (B-061 L454).
  - Missing: any obligation to honour the declared endianness. Only "little-endian default" appears.
  - Missing: transpose pipelines are never mentioned.
- **C08 — narrowed.**
  - Present: missing vs broken must be distinguished and cannot be inherited from `parse_url` (B-016, B-053..B-055); a cancellation policy and a no-stale-repaint test (B-050, B-051).
  - Present: a checksum immutability test (B-066); synthetic zeros disclosed, but only for plate stitching (B-093, §4 decision 5).
  - Missing: the reference reader also zero-fills *failed* field loads (S018 L435-439), and this is not generalised; the risk of reader-side writes (S008 L161-162; S052 L515) is not identified.

### X2

- **C01 — retained.** Same asserted substance as X1, plus "fail informatively on 0.6/editor's-draft markers" (§4 decision 3 L745).
  - Missing: any validation idea. B-056 was marked not_a_claim at L917-918.
- **C02 — narrowed.** Same as X1, but with no fixtures at all (B-026 and B-031 are not_a_claim).
- **C03 — narrowed.** Declared order, level geometry and the product choice survive.
  - Missing: handling of a missing or unreadable level (only a generic "unreadable array" class remains).
  - Missing: the Z-downsample and factor-3 test (B-046 is not_a_claim).
- **C04 — narrowed.** Composition, units and composed readout survive. There is no check at all (B-041 is not_a_claim).
- **C05 — narrowed.** It keeps "verify level counts/geometry at runtime" and "alignment ... at two zoom levels" (§4 decision 6 L748).
  - Missing: what happens when verification fails ("explain mismatch, not silently misalign"). That was in B-036, which is not_a_claim.
- **C06 — narrowed.** As X1, minus the float-label fixture.
- **C07 — narrowed.**
  - Present: "explicit endianness" in the floor and "verify shard/codec coverage per version" (§4 decision 2 L744), both slightly better than X1.
  - Missing: any decode validation (B-061 is not_a_claim) and transpose.
- **C08 — narrowed.**
  - Present: the error distinction; a cancellation test inside the B-049 replacement (L319).
  - Missing: a checksum test (B-066 is not_a_claim) and the malformed-input pack; reader-side writes are not identified.

---

## 3. Unsupported, overstated or contradicted claims (checked in the sources)

### X1 only

| ID | Severity | Location | Claim | Counterevidence | Consequence |
|---|---|---|---|---|---|
| X1-UA1 | **moderate** | B-081 replacement L593; §4 correction 8 L812; non-finding L829 | "No in-corpus source states a 1 TB dataset"; "largest stated is 21.57 GB"; the plate size "is not stated anywhere" | S034 L77-79 "190129.zarr Size `1.0 TB`"; L80-83 485 GB and 704 GB; L71-72 66.04 GB | Understates the scale Plan L11 acceptance must cover by about 50×. The verifier falsely corrected a supported draft claim. |
| X1-UA2 | low-moderate | B-019 replacement L155; §4 corrections 2 and 4 (L806, L808); §4 new finding 1 L817 | The four-dtype whitelist "is not in evidence"; S096 holds only build greps | S096 L25-28 (`VolumeDimensions.cpp`: int32, uint16, uint8, float32) | Discards code-level evidence. It also contradicts X1's own claim to have verified S096 in full (L859). |
| X1-UA3 | low | B-049 L364 | AGAVE #84 is the "most-upvoted issue" | S103 L38 (0 comments); L60-70 (0 reactions) | Overstates prioritisation. The pain itself is supported (S103 L58). |
| X1-UA4 | low | B-049 L364 | The volume cache was "shipped" | S114 L91, L163, L235 are PR titles only | Minor overclaim. |
| X1-UA5 | low | B-041 L310 vs B-040 L301 | Readout should "degrade to pixel" when a unit is absent | S003 L170, L310; B-040 requires "unspecified" | Mislabelled calibration in an acceptance test; internal contradiction. |
| X1-UA10 | low | B-020 replacement L166 | 0.5 read support "came via" PR #404 | S008 L132-134: #404 "Closed", "wants to merge" | The date was correctly hedged; the vehicle is unestablished. |

### X2 only

| ID | Severity | Location | Claim | Counterevidence | Consequence |
|---|---|---|---|---|---|
| X2-UA1 | **low-moderate** | B-020 L162 (confirmed); B-060 reason L379 | 0.5 read support arrived in ome-zarr-py in "Nov 2024" | S017 L21-28: 0.10.2 (Nov 2024) "pin zarr at < 3"; S008 L132-134: #404 Closed/unmerged; no release lists #404 | A wrong provenance date inside the finding that tells the Plan to name producer and version. |
| X2-UA2 | low | B-017 L133 (confirmed) | "No tested viewer opens images beyond the first multiscales entry" | S043 L311-313 OMERO: "All images imported but sample image is corrupted" | Minor overstatement. |
| X2-UA3 | low-moderate | §4 O-028 L718 | "Reader-side strictness": the reference stack hard-fails on transform reorderings | `validate_coordinate_transformations` (S016 L296-365) has no read-path caller in the corpus; S018 never calls it | Unverified implementation claim that may miscalibrate strictness. |
| X2-UA4 | low | §4 O-025 L717 | "Float version variants hit the error path" | S016 L15-17 converts floats with `str()` first | Self-contradictory sentence. The upstream observation was correct, so this is a handoff distortion. |

### Both (identical asserted text)

- **B-014 L106** says "a 0.5-only viewer still needs this dual read". This is an unjustified Plan requirement: the brief (L3) and Plan (L5) scope is 0.5, and a truthful unsupported result suffices. It also sits in tension with B-089, which leaves the policy unresolved. Low.
- **B-008 L59 and B-034** say "the spec community itself considers source.image broken". The evidence is a single open issue title (S035 L2704), while S003 L472-474 keeps `source.image` normative. Low.
- **B-092** claims GPU-memory ceilings bind "AGAVE/Vol-E". S062 L7 has no memory statement; only AGAVE is evidenced (S115 L14; S108 L11). X2's reason (L554) even says "verified for both". Low.
- **B-035** takes its evidence from the multi-image overlay row (S043 L473-507) rather than the labels row (S043 L171-205, where 5 of 12 viewers support labels). The conclusion still holds numerically. Low.

### False dismissals and false confirmations

- **X1** declared two supported facts unsupported, and in both cases the verifier had read the source: the 1 TB plate (S034 L79) and the four-dtype whitelist (S096 L25-28).
- **X2** marked 12 substantive "Distinguishing validation idea" blocks as not_a_claim, at L845, L857, L869, L881, L893, L905, L917, L929, L941, L953, L971 and L983. It also confirmed the Nov 2024 date and the "no tested viewer" wording despite counterevidence.

### Verifier defects

- **X1, low.** B-107 (coverage and carried-forward questions) was marked not_a_claim. Its substance is restated and corrected in §4.
- **X2, high.** The 12 validation-idea blocks marked not_a_claim. This removes every per-row acceptance test from the asserted content and directly narrows C03, C04 and C05. Two pieces survive: B-051's test inside the B-049 replacement, and a fragment of B-036 in §4 decision 6.
- **Both.** The host report shows `complete:false` and `carrier_defects:1`. This is mechanical and I did not assess it.

---

## 4. Novel supported findings (beyond the key) and correct non-findings

### In both results

| ID | Finding | Sources |
|---|---|---|
| NF01 | Discovery is a node-classifying subsystem: bioformats2raw collections SHOULD NOT open only the first image; plates, wells and fields; labels groups as entry points. Plan L5 is under-specified. | S003 L118-129, L253-275, L388-397 |
| NF02 | Multiple multiscales entries are a spec-defined user choice; reference readers use only `[0]`; no viewer supports more. A product decision is needed. | S003 L388-397; S018 L279-283; S048 L199-202; S043 L277-316 |
| NF03 | `omero` is optional and transitional, so a fallback is required. Greyscale forces white; window start/end is the display range vs min/max data range; `defaultZ` must be bounds-checked. | S003 L398-430; S018 L336-391; S033 L351-354; S054 L87-112 |
| NF04 | Real 0.5 files violate MUSTs, so tolerant admission with explanation is needed. | S003 L550; S056; S029 L294-296 |
| NF06 | Plate presentation (stitched with zero-filled gaps vs well-by-well) is a product choice. | S018 L394-439; S003 L274 |
| NF07 | Simplification: a manual level picker with memory estimate and sub-region, or an override on automatic selection. | S117 L97-128; S125 L55 |
| NF08 | Time-series scrubbing is the stress case; cancellation needs a partial-read policy; memory must return to baseline. | S103 L58; S104 L58; S119 L68 |
| NF09 | Name producer and version for interop claims; support dates differ across tools. | S013; S065 L37; S015; S034 L41-46 |
| NF10 | Non-image payloads (`METADATA.ome.xml`, `ro-crate-metadata.json`) must be classified, not listed as images. | S003 L184-191, L275; S034 L45-46 |
| NF11 | Acceptance fixtures can come from the IDR 0.5 list; the multi-multiscales case must be synthetic. | S010 L1026-1143; S043 L277-283 |
| NF12 | The 2D canvas avoids the GPU-memory ceiling (evidenced for AGAVE). | S115 L14; S108 L11 |
| NF13 | Settings persistence crosses the L9 review gate; AGAVE's absolute-path JSON is the counterexample. | S108 L27 |
| NF15 | Review-gate candidates. Partly PENDING: S112 and S117 L294+ were not re-read. | S051 L63-112; S112; S117 |
| NF19 | RFC-5 draft text is in the corpus as the reference for a later 0.6 review. | S051 L126-130, L312-379 |
| NF26 | The analog pins tensorstore v0.1.78. | S096 L9; S076; S116 |

### X1 only

- **NF16.** napari-ome-zarr keeps `None` units per axis so the scale bar survives when one layer lacks units (S048 L249-258).
- **NF17.** vizarr has open issues on z-plane changes, contrast metadata and 3D translation (S050 L2208, L2360, L2812, L3264).
- **NF18.** AGAVE's docs limit dtypes to 8-bit, 16-bit unsigned and 32-bit float (S117 L45).
- **NF20.** Zip-store write ordering breaks group attributes in ome-zarr-py (S028 L2292).

### X2 only

- **NF21.** The analog caps concurrent channels at four, which makes channel concurrency a decision (S117 L26-28; S108 L17).
- **NF22.** AGAVE's `omero` dual lookup (S121 L1-9).
- **NF24.** bioformats2raw synthesises plates from file names; TCZYX is the default (S033 L335-337, L459-503).
- **NF25.** Stack packaging floors (S015 L47-61; S091 L30-44).
- **NF27.** The proxy failure is remote-only (S028 L3080, L3127).

Four items were not counted as novel because they refine a reference: the error taxonomy (C08/C01/C07), the sharding surface (C07), the dataset-vs-group scale correction (C04), and exact version-string matching (C01).

### Correct non-findings

Both results:
- **CNF01** Consolidated metadata is not a 0.5 obligation (S003 contains no "consolidated").
- **CNF02** Remote storage is out of scope.
- **CNF03** 0.6/RFC-5, **CNF04** RFC-3/4 and **CNF05** RFC-9 are future work.
- **CNF06** 3D rendering is out of scope.
- **CNF07** Shard performance tuning is deferred.
- **CNF08** There is no 0.5 multi-multiscales fixture.
- **CNF09** There is no readable mixed-version hierarchy.
- **CNF10** S120 and S102 are null results.
- **CNF11** The failed or empty captures are not evidence either way.

X2 only:
- **CNF12** S096 and S121 are real grep extracts.

**Invalid non-finding (X1):** "No in-corpus source states a 1 TB dataset size." S034 L79 says otherwise.

---

## 5. Handoff fidelity (after steps 1–4 were saved)

The upstream `observations.md` and `draft.md` are shared. X1/upstream and X2/upstream match on line counts (645 and 180) and on four spot strings at identical lines. I did not byte-compare them.

| Upstream item | First acquired | X1 delivered | X2 delivered |
|---|---|---|---|
| Endianness "must be read from the bytes codec" (C07.F2) | O-048(c) | lost ("little-endian default") | partial ("explicit endianness") |
| Transpose + sharding codec failure (C07.F3a) | O-074 (title) | lost | lost |
| Check label dtype coverage; labels may be int64 (C06.F5) | O-023, O-058 | lost, and whitelist evidence falsely voided | lost (whitelist kept only as an AGAVE counterexample) |
| "parse_url ... reads arrays with all zeros" (C08) | O-071 (S028 L3840) | lost | lost |
| ome-zarr-py silent format auto-switch (C01) | O-036 (S019 L58-66) | lost | lost |
| Resolve `source.image` relative to the label (C05.F3) | O-011 | distorted into "broken; use the labels listing" | same |
| Four-channel cap | O-062 | lost | restored |
| bioformats2raw plate synthesis | O-049 | lost | restored |
| AGAVE `omero` dual lookup | O-024 | correction only | restored |
| Exact version-string match (floats normalised) | O-025 | lost | restored, but distorted (X2-UA4) |
| 1 TB plate | O-059 (uncited) | **falsely removed** | kept, correctly re-sourced to S034 L79 |
| Four-dtype whitelist (mis-cited to S120) | O-023 | **declared void** | correctly re-sourced to S096 |
| "most-upvoted" (draft) / "#1 pain" (O-064) | draft B-049 | carried | corrected (0 reactions) |
| "Nov 2024" read support | O-041 | correctly qualified | carried |
| "RFC text not in corpus" | O-053 | corrected | corrected |
| Reader-side strictness (no caller) | O-028 | not carried | carried as "reader-side" |
| Draft validation ideas (12) | draft | all preserved | lost to not_a_claim (B-051 partly rescued) |
| Minor (O-035 silent failure mode, O-043 finder gap, O-068 nanometre units, O-054 grid) | various | lost | lost; O-037 `scene.py` restored as unresolved |

Some facts are my own finds and are not credited to either result as a participant discovery:
- S018 L435-439: failed field loads are zero-filled.
- S008 L161-162 and S052 L515: reader-side writes.
- S051 L377-379: nearest-neighbour interpolation for labels.

## 6. Coherence and decision burden

**Coherence.**
- **X1** is coherent, with these localised defects:
  - "unspecified" (B-040) vs "pixel" (B-041);
  - B-014 vs B-089;
  - a self-reported full read of S096 set against its own dismissal of S096 L25-28.
- **X2** is coherent, with these defects:
  - B-085 (asserted) points to the L7 validation idea, which is not asserted;
  - B-035 and B-065 call for fixtures and tests that are absent from the asserted content;
  - the O-025 sentence contradicts itself.

**Decision burden.**

| | Blocking | Nonblocking | Clarification questions | Redundant | Research unknowns carried |
|---|---|---|---|---|---|
| X1 | 3 | 5 | 0 | 1 | 10 |
| X2 | 3 | 5 | 0 | 2 | 9 |

- **Same blocking decisions in both:** the multiple-multiscales and discovery policy, the Zarr v3 storage strategy and stack, and the version admission policy. No canonical choice exists for any of them.
- **Nonblocking, X1:** the level override (the Plan's automatic choice already exists and is correctly treated as canonical), plate presentation, label initial visibility, the `omero` fallback, and the cancellation cache policy.
- **Nonblocking, X2:** the same, except channel concurrency replaces label initial visibility.
- **Redundant:** both present the error taxonomy as a decision, though it is an obligation with no alternative. X2 also lists label overlays as a decision without offering an alternative.

---

## 7. X1 vs X2 by finding identity

- **Gained by X1 (absent from X2's asserted content):**
  - Retained status on C03 and C05. The missing-level fixture; the Z-downsample/factor-3 zoom test; the "explain the level-count mismatch" outcome.
  - A partial calibration check; the float-label fixture; the codec-matrix pixel-compare; the checksum immutability test; the malformed-input pack; the non-image-payload fixture; the fixture matrix.
  - Novel NF16, NF17, NF18 and NF20.
  - Correct qualification of the Nov 2024 date and of the OMERO nuance in the multi-multiscales row.
- **Gained by X2 (absent from X1's asserted content):**
  - "Explicit endianness" and per-version reader-coverage verification (C07).
  - Correct retention of the 1 TB plate and the S096 whitelist; the #84 zero-reaction correction; the full S096/S121 correction.
  - Novel NF21, NF22, NF24, NF25 and NF27; CNF12.
- **In both:**
  - C01 retained. C02, C04, C06, C07 and C08 narrowed, with their shared facets.
  - Novel NF01–NF04, NF06–NF13, NF15, NF19 and NF26. Non-findings CNF01–CNF11.
  - The shared low-severity overstatements: B-014, `source.image`, Vol-E GPU ceiling, B-035 evidence.
- **Unsupported claims that only one result has:**
  - X1: X1-UA1 (moderate), UA2, UA3, UA4, UA5, UA10.
  - X2: X2-UA1 (low-moderate), UA2, UA3, UA4.
- **Neither result has:**
  - transpose handling or refusal (S109 L553-600, L2720);
  - label resampling and 64-bit precision (S051 L377-379; S003 L439 vs S025 L84-85);
  - axis-mismatch handling, and absent vs length-one dimensions;
  - zero-filled failed reads (S018 L435-439);
  - the silent format auto-switch (S019 L58-66);
  - reader-side write risk (S008 L161-162; S052 L515).

**Summary.** Neither result dominates, and the counts do not offset one another.
- **X1** keeps more reference substance: 3 retained vs 1, and all 12 validation ideas. Its verifier, though, introduced two checked-false corrections and kept an unsupported superlative.
- **X2** makes more accurate source corrections and restores more upstream observations. Its verifier's not_a_claim defect removed every per-row acceptance test, and it confirmed an unsupported date and a strictness claim whose caller is unverified.

---

## 8. Coverage accounting (evaluator)

**Assessed.**
- Both `delivered.md` files in full, and the upstream files in full.
- S003 and S043 in full.
- Direct line reads of S008, S010, S015–S019, S025, S033, S034, S048, S051, S052, S055, S056, S062, S091, S096, S103, S108, S109 (L545-605, L2700-2741, titles), S117 (L20-139), S120, S121 and S123.
- Targeted greps of S028, S029, S035, S050, S054, S065, S082, S098, S104, S105, S114, S115, S119, S125, S076 and S116, plus corpus-wide greps for fill_value, transpose, endian, uint64 and validate_.

**PENDING_HIGH_END_VERIFICATION** (claims rest on sources I did not independently re-read):
- S004 and S059 (B-014, B-054)
- S041 (B-017 version pins)
- The S013 body (the Aug 7 2025 merge is corroborated only by S052 L601)
- S024 (B-076)
- S022, S023, S066, S067 (B-094)
- S058 and S070 (B-012, B-059)
- S112 and S117 L294+ (B-073, B-096, B-102)
- S053 (B-004)
- S111 and S113 (B-088)
- S009 (X2 O-037)
- The long-line bodies of S065 L41 and S125 L55
- S028 titles at L1609, L2396, L2776 and L4368
- Byte identity of the two upstream copies

**Not assessed at all.** The remaining handles are listed in `grades.json` under `evaluator_coverage.not_assessed_at_all`. No grade here rests solely on them.

**Not performed.** Excerpt hashes, host JSON and hash validation, and runtime behaviour (neither result claims any).

**Ignored by instruction.** Jujutsu, Phase 1A/1B and economics.
