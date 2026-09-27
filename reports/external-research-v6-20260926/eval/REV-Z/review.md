# REV-Z evaluation: X1 and X2 (case `ome-zarr-thin`)

TEST_ONLY_NEVER_PROMOTE. This is an independent evaluation by Opus 5.5 at extra-high effort. Configuration labels were withheld and not guessed.

The only scored artifacts are `results/X1/delivered.md` and `results/X2/delivered.md`. The rules come from `key/SCORING.md`, ignoring its Jujutsu, Phase 1A/1B and economics parts. Each reference gets exactly one status. There is no fractional or net score, and upstream-only material earns no credit. The machine-readable companion is `out/grades.json`.

## Headline

- **No reference is retained by either result.**
  - X1: 7 narrowed, 1 lost (C02).
  - X2: 6 narrowed, 2 lost (C05, C06).
  - Neither result has a contradicted reference.
- **Both deliveries are verifier reports on an upstream draft.** Each says it "stands alone", but refers to the draft's obligations only by ID (P1–P13 and rows A–R in X1; "§1 obligation list" in X2). Both drafts carried near-complete material for C02, C04 and C05, and checks.md confirmed it. Almost none of it reached the scored artifact. This is a material handoff loss, not a style preference.
- **Each result makes one false "unsupported" correction of a correct size figure from the same source (S034).**
  - X1 says "21.6 GB" exists nowhere in the corpus. S034 L69–70 states 21.57 GB.
  - X2 says "no terabyte size exists anywhere". S034 L77–83 lists 190129.zarr at 1.0 TB, 190206 at 485 GB and 190211 at 704 GB. X2's error is more consequential: it tells planners to use the 21.6 GB and 66 GB sets as the large-data anchors, dropping the TB-scale plates.
- **The two results preserve different facets.** Neither dominates the other.

---

## 1. Reference eligibility (decided before grading)

All eight references are consistent with the pinned 0.5 spec (S003, edition 8 Sep 2026). No reference adjudication was needed. Zarr v3 normative texts (zarr-specs core, codecs, stores) are **absent** from the admitted catalog, so two facets are unassessable.

| Ref | Decisive corpus material (handle: lines) | Eligibility |
|---|---|---|
| C01 Versioned admission | S003 25–27, 67–69, 152–156 (Zarr v3, `attributes.ome`, version MUST be consistent within the hierarchy); S059 129–134, 347 (0.4 = Zarr v2, version inside multiscales); S082 55 (AGAVE infers 0.5 from zarr.json); S018 280–287 (reference reader defaults a missing version to "0.1") | eligible |
| C02 Axis identity | S003 81, 166–174, 296–307, 825–827 (dimension_names MUST match); S055 59–64; S048 222–223 (napari assumes 5D) | eligible |
| C03 Declared pyramid | S003 93–94, 305–310; S043 1–35, 80–108 (Z-downsample, non-2 factors); S016 276–294 (per-level centred translation) | eligible |
| C04 Composed calibration | S003 170, 293, 311, 314–315; S043 318–471; S048 266–283; S018 293–295. The probe arithmetic (196, 465) checks out | eligible |
| C05 Label discovery and registration | S003 102–117, 437–474; S018 216–227; S035 2770 (equal level count does not imply the same downscaling or origin) | eligible |
| C06 Categorical labels | S003 438–471; S020 192 (nearest-neighbour for labels); S112 1052, 1125 (interpolation artefacts). 64-bit precision is derived, not stated | eligible; C06.d partial |
| C07 Chunk decoding | S055 16–65 (sharding, bytes with little endian, blosc, crc32c); S003 70–72; S013 325; S033 356–359; S109 600 (transpose); S096 25–28 | partial. **C07.b (reverse decode order) is unassessable_missing_input** |
| C08 Absent vs failed | S018 435–438, 552–557 (zero-fill on ValueError); S028 3887 (parse_url reads all zeros); S019 223–231; S008 418–431 (write-mode wipe); S052 515 | partial. **C08.a (fill_value semantics) is unassessable_missing_input** |

---

## 2. Reference statuses (each delivery graded on its own)

| Ref | X1 | X2 |
|---|---|---|
| C01 | **narrowed** | **narrowed** |
| C02 | **lost** | **narrowed** |
| C03 | **narrowed** (thin) | **narrowed** |
| C04 | **narrowed** | **narrowed** (thin) |
| C05 | **narrowed** | **lost** |
| C06 | **narrowed** (thin) | **lost** |
| C07 | **narrowed** | **narrowed** |
| C08 | **narrowed** (thin) | **narrowed** |

### X1 facet detail

- **C01 narrowed** (F7, §3.1, §2 L172).
  - Kept:
    - 0.4 and 0.5 differ by `.zattrs` vs namespace.
    - The version decision must "never silently misparse": refuse with a version-naming message or read deliberately.
    - A fixture using a 0.4 IDR sample and a 0.6-draft fileset.
  - Missing:
    - The MUST that the version be consistent within a hierarchy, and a mixed-version probe.
    - Zarr v3 storage as an admission check. It is understated as "cheap".
- **C02 lost.** It appears only as "P1–P3 … verified" (§2 L166). There is no proposition about axes, rank, dimension_names, or absent vs length-one dimensions. This is an unvisited proposition, not a checked false dismissal.
- **C03 narrowed (thin).**
  - Kept: non-2× and Z-downsample failures (named as counterexamples); "per-level shapes"; the level picker as an optional product choice.
  - Missing: declared order with arbitrary paths; level-specific transforms as an explicit rule; handling of a missing level.
- **C04 narrowed.**
  - Kept: the draft's row-F composition correction (dataset-level, then group-level) is endorsed as mandatory; ome-zarr-py ignores group-level transforms.
  - Weakened: scale-before-translation is contradicted inside F4 (see X1-U3).
  - Missing: a unit-absent or unknown-calibration state; a concrete composed-coordinate check.
- **C05 narrowed.**
  - Kept: discovery through the parent `labels` list (S035 L5043/5100); `source.image` named as covered by row E; entry at a labels subfolder walks up to the parent (F5).
  - Missing: equal level count; registration before overlay; no attaching by basename or shape.
- **C06 narrowed (thin).**
  - Kept: labels are integer; the colour fallback is a product choice and the spec's colour requirement is itself under debate.
  - Missing: lookup keyed by label-value; categorical identity through resampling; precision.
- **C07 narrowed.**
  - Kept: a dtype support matrix ("decide + document + message"); the library choice, with evidence of tensorstore codec-merge and rectilinear-grid gaps.
  - Missing: the codec pipeline requirement; per-array endianness; transpose; refusing unsupported codecs rather than showing garbage pixels.
- **C08 narrowed (thin).**
  - Kept: only the reader-side write hazard (S008 wipe and fix; v0.12.1 read-only), as a named counterexample.
  - Missing: distinguishing fill data from failed reads; the zero-fill anti-pattern; showing the actual state.

### X2 facet detail

- **C01 narrowed** (F-11 item 3, F-8).
  - Kept: an explicit version policy with informative refusal on an unknown `ome.version`; the 0.4 convention of putting version inside multiscales; recording provenance for each fixture.
  - Missing:
    - Zarr v3 plus namespace as an admission check.
    - Hierarchy consistency.
    - A rule against implicit legacy reinterpretation. The "permissive" option cites AGAVE's format sniffing as precedent without calling it a hazard (X2-U2).
- **C02 narrowed** (F-10 L67).
  - Kept: real 0.5 data runs from XY to XYZCT; axes are identified by type, not name; the channel axis may be absent; controls appear only where relevant.
  - Missing: rank and dimension_names validation; absent vs length-one dimensions; rejecting mismatches.
- **C03 narrowed** (F-11 item 5).
  - Kept: "either way", level geometry must handle Z-downsampled pyramids, non-2 factors and centred translations. The geometry obligation is correctly kept separate from the UI choice.
  - Missing: declared order with arbitrary paths; a missing level.
- **C04 narrowed (thin).**
  - Kept: per-level translations; napari's unapplied group-level scale (named).
  - Missing: composition order; scale-then-translation; unit-absent state; a composed check.
- **C05 lost.** The only related content is a deferred question: "whether real label images satisfy the equal-level-count MUST" (§3 item 10). Discovery, association and registration are absent.
- **C06 lost.** No proposition about label identity appears.
- **C07 narrowed** (F-10 L70, F-11 item 2).
  - Kept: the real v3 pipeline (`sharding_indexed` with inner bytes+blosc/zstd and a bytes+crc32c index, and chunks larger than the array) as a floor that any library must cover.
  - Missing: a support boundary with refusal (there is no dtype decision); per-array endianness; transpose.
- **C08 narrowed** (F-10, F-11 item 4).
  - Kept: parse_url collapses errors to `None`, so Slide Scout needs its own error taxonomy; stitched plates contain synthetic zeros that must be disclosed.
  - Missing: that the zeros also hide load failures (S018 L555–557); the read-only claim is made without considering reader-side writes (S008).

---

## 3. Reverse-direction checks: unsupported claims and false dismissals

### X1

| ID | Severity | Claim | Counterevidence | Consequence |
|---|---|---|---|---|
| X1-U1 | moderate-low | F1: "no corpus source states 21.6 GB"; the figure is called a "fake datum" and replaced with "≈12.5 GiB at uint8"; §6 counts it among only two figures that "could not be reproduced" | **S034 L69–70:** "9822152.zarr … Size `21.57 GB`" | This is a **false 'unsupported' dismissal**. It removes a correct large-dataset anchor (Plan L11). |
| X1-U2 | low | F9, §4 item 8, §6(d): S042 and S045 contents "appear swapped" relative to the catalog | S042 is the 36-byte "HTTP Error 404" message and S045 the ~207-byte FileNotFoundError. Both match the catalog byte counts | Records a false corpus anomaly |
| X1-U3 | low-moderate | F4: a schema-valid translation-first fileset is "rejected by the reference library"; "hard validation would refuse a conforming file" | S003 L311: translation "MUST be listed after scale", so the file is not conforming. S016 L296–330 is a writer-side check that the S018 reader never calls | Blurs C04's ordering rule. This is an internal contradiction (F4 cites L311 itself) |
| X1-U4 | low | §3 item 1: reading 0.4 is "cheap: metadata identical modulo .zattrs/namespace" | S059 L129–134 (Zarr v2); S016 L147–149, 216–218 (chunk keys); S033 L159–162 (codec sets differ) | Understates the cost of legacy support. Inherited from the draft |
| X1-U5 | low | F9: path-referenced transforms are "verified spec-legal" | S053 L218–264 requires inline arrays; S003 L312 | The conflict between prose and schema is not acknowledged. Impact is minimal because the item is deferred |

- **Borderline:** F7 says refusing 0.4 with a version message is "covered by the Plan". Plan L7 covers explaining failures, not detecting the version. This is not scored as a false covered dismissal, because "never silently misparse" is kept.
- **Internal contradiction:** the bottom line says every proposition and plan-fit row "checks out", while F1, F2 and F7 report defects in those same items.

### X2

| ID | Severity | Claim | Counterevidence | Consequence |
|---|---|---|---|---|
| X2-U1 | **moderate** | F-4: "no terabyte size exists anywhere in the corpus … largest evidenced 21.57 GB and 66.04 GB"; keep those as the large-data anchors | **S034 L77–83:** 190129.zarr "Size `1.0 TB`", 190206 "485 GB", 190211 "704 GB". S056 confirms 190129 is a 0.5 plate | This is a **false 'unsupported' dismissal** of a correct draft claim. It shrinks the evidenced large-data anchor about 15-fold, and the TB figures sit eight lines below the lines X2 cites |
| X2-U2 | low | F-11 item 3 cites "AGAVE format-sniffing, S082 L55" as precedent for a permissive policy | S082 L55: "The big assumption … zarr.json ⇒ 0.5 … Anything outside this assumption will error out" | Treats the C01 anti-pattern as a model. X2's own draft called it a "counterexample to avoid" |
| X2-U3 | low | F-8: BR00109990_C2 exercised "as a v0.5 plate" | S024 L39: "Nine images in bioformats2raw layout"; S010 L1130 | Mislabel. The version conflict itself is correct |
| X2-U4 | negligible | S052 L122 cited for #594 | The text is at S052 L128 | none |

- **Internal contradictions:** the header says nine unresolved items but the list has ten; F-8 calls one fileset both a collection and a plate.

Bounded unknowns, which are not defects:
- **X1:** group-level or `path` transforms in real data, per-level sharding, the 6001240_labels hierarchy, and how current the 2025 viewer matrix is.
- **X2:** the true version of BR00109990_C2, reader-side auto-sharding, and equal level counts in real labels.

---

## 4. Novel supported findings and correct non-findings

Novel findings (source-backed and within this Plan's scope):

| ID | X1 | X2 | Source |
|---|---|---|---|
| NF-HCS: plates need a presentation decision | yes (§3 item 2) | yes (F-11 item 4, adds zero disclosure) | S043 207–238; S010 1027–1051; S018 438/547/557 |
| NF-MULTIMS: multiple multiscales entries | yes, thin (deferred chooser) | yes, richer (spec choose-by-name, first fallback; 4995115 fixture) | S003 388–397; S018 279–284; S043 277–316 |
| NF-OMERO: omero optional, so defaults are needed | yes | yes, richer (vizarr fails to load labels without omero, S050 L2436) | S003 426; S018 330–391 |
| NF-RDEFS: honour defaultT/defaultZ (optional) | yes | — | S043 67–70; S054 109–113 |
| NF-SINGLESCALE: groups without multiscales need defined behaviour | yes | — | S004 371–373; S018 593–596 |
| NF-LABELMARK: the image list must not show label images as images | yes | — | S035 5043/5100 |
| NF-ENTRYPOINT: opening at labels/ goes to the parent; unknown roots get a message | yes (F5) | — | S048 664–699 |
| NF-VALIDATOR: cross-check fixtures with ome-ngff-validator | yes (minor) | — | S031 8–15 |
| NF-NONIMAGE: discovery must skip ro-crate and OME-XML | — | yes | S034 45–46; S003 184–191 |
| NF-LABELVIS: initial overlay visibility | — | yes (minor) | S048 654 |
| NF-PROVENANCE: record the captured version per fixture | — | yes (minor) | S010 1125–1134; S024 39 |

Correct non-findings:
- **X1:**
  - The .ozx and zip deferral is right (RFC-9 is unreleased), and its citation is fixed (S035 L4500, S052 #619).
  - The viewer matrix has 11 viewers, not 12 (S043).
  - "÷3" for 9846318 is unverified (S043 L81).
  - Optional capabilities are not treated as requirements.
  - AGAVE prior art supports the Plan's existing background-read and cancel obligation (S103, S108 L27).
  - Ecosystem dates are correct (S052, S064, S065, S082, S091, S014).
- **X2:**
  - Handle scramble fixed: the dtype whitelist is at S096 L25–28, S120 is a placeholder, and S121 holds the getOmero extract.
  - "Most-upvoted" is unsupported (S103 reactions total 0).
  - The volume cache is a stack of draft PRs, while the memory estimate is shipped (S114, S117 L102).
  - The multi-multiscales fixture gap applies to 0.5 only.
  - The plate has 49 wells, not 50 (S056, S010 L1046).
  - The shard layout claimed for 4496763 is unsupported.
  - AGAVE extras are optional under L9.
  - Covered: read-only and session settings, remote exclusions, where-relevant controls, and the sharding floor.

Useful corpus propositions that **neither** result delivered:
- ome-zarr-py defaults a missing multiscales version to "0.1", so 0.5 axes are parsed under 0.1 rules (S018 L280–287).
- napari main keeps only `datasets[0].coordinateTransformations[0]` and the first group-level transform, so translations are dropped (S048 L266–283).
- Equal label level counts do not guarantee alignment (S035 L2770).
- Nearest-neighbour resampling is needed for labels (S020 L192; S112 L1052).
- tensorstore has a transpose+sharding bug (S109 L600).
- A parse_url store can read all zeros (S028 L3887), and the reference reader zero-fills on load errors (S018 L552–557).

---

## 5. Handoff loss (examined only after sections 2–4 were saved)

**X1.** The upstream draft and checks.md contained, verified and linked to the Plan the following. The delivery names these rows but does not state them.
- **C02:** P2 has "dimension_names MUST match axes"; row D says "derive t/z roles from axes types, never position; hide controls when axes absent".
- **C04:** row F includes "fall back to pixels with an explicit 'no units' state" and a composed-offset fixture using 13457539 vs 13457537.
- **C05:** row E resolves `source.image` and defines behaviour for a label pyramid whose depth does not match; row P says "alignment must be asserted".
- **C08:** row L requires read-only stores and a byte-hash test.
- **C07:** O-043 says "endianness must be handled or clearly reported".

Three distortions were introduced during verification:
- The correct 21.6 GB figure, miscited upstream as O-034/S010, became "exists nowhere" (X1-U1).
- O-032's mislabel of the 404 message (attributed to S045) became the false "swap" anomaly (X1-U2).
- O-020's correct "writer-side" check became "rejected by the reference reader" in checks C57, then "conforming" in F4 (X1-U3).

Recoveries: F4–F6 restored O-020, O-026 and O-040; F2 and F8 fixed a count and a citation.

**X2.** The upstream draft was close to the full level on C04 and C05:
- **C04:** composed dataset and group transforms; an explicit "unspecified" unit state; never derive units from axis names; a synthetic group-level time scale that must "degrade to pixel".
- **C05:** "use the labels-group listing as the source of truth and verify level geometry at runtime"; fixtures for level-count mismatch and for registration at two zoom levels.

It was also strong on:
- **C01:** hierarchy consistency, plus "version mismatch, inconsistent hierarchy" in the error taxonomy.
- **C02:** dimension_names.
- **C06:** a float-label fixture.

The delivery reduces all of this to "the full §1 obligation list … verified", which is a major loss for C04, C05 and C06. Distortions:
- The 1 TB claim, true but uncited upstream (O-046 cites only S034 L70), became "no terabyte size exists" (X2-U1).
- The draft's "counterexamples to avoid" qualifier on AGAVE sniffing was dropped (X2-U2).
- "Plate" was carried over from checks C-36 (X2-U3).

Recoveries: F-1, F-2, F-3, F-5, F-6 and F-7 correctly fixed draft errors.

---

## 6. Final coherence and decision burden

**Coherence.**
- **X1:** a well-structured verifier report, but not standalone. Its bottom line conflicts with its own findings, F4 contradicts itself, and two of its corrections are false.
- **X2:** more self-contained. F-10 and F-11 state propositions with sources and "either way" obligations. It has a count mismatch and one moderate false correction.

**Decision burden.** Both results ask zero clarification questions and zero redundant questions.

| | X1 | X2 |
|---|---|---|
| Blocking decisions | 3: storage library, dtype support matrix, HCS plates | 2: storage strategy, plate presentation |
| Non-blocking choices | 9: version scope (Plan L5 default exists), colour-less labels, rdefs, level UX (Plan L5 already automatic), single-scale groups, label marking, plus F4–F6 optional capabilities | 4: multiple multiscales (spec default exists), version policy (Plan L5 default), level choice plus override (Plan L5 already automatic), label visibility |
| Deferrals it concurs with (not asked) | 5 | 1 optional-extras group (F-9) |

Neither result silently approves an alternative. X2 has fewer decisions **because it omits the dtype support matrix**, which is a real open decision (S003 L70–72 vs S096 and S025). That omission is not a quality win.

---

## 7. X1 vs X2 by finding identity

**Reference status:** X2 gains C02 over X1 (narrowed vs lost). X2 loses C05 and C06 relative to X1 (lost vs narrowed). The other five references are narrowed in both, with different facets.

| Category | Findings |
|---|---|
| **Only in X1** | C01 no-misparse rule and legacy fixture · C04 composition order as a correction, and ome-zarr-py ignoring group-level transforms · C05 discovery via the labels list and the labels-subfolder entry point · C06 integer labels and palette-not-mandate · C07 dtype support boundary with messaging · C08 reader-side write hazard · NF-RDEFS, NF-SINGLESCALE, NF-LABELMARK, NF-ENTRYPOINT, NF-VALIDATOR · non-findings on .ozx, the 11-viewer count and ÷3 |
| **Only in X2** | C01 refusal on unknown version and fixture provenance · C02 type-driven axes and where-relevant controls · C03 level geometry as an obligation with centred translations · C07 codec pipeline floor · C08 own error taxonomy and synthetic-zero disclosure · NF-NONIMAGE, NF-LABELVIS, NF-PROVENANCE · richer NF-MULTIMS and NF-OMERO · non-findings on handles, "most-upvoted", the volume cache, 49 wells, the 4496763 layout, multi-multiscales scope and remote exclusions |
| **In both** | C01 version policy as a product choice with truthful refusal · C03 non-2 and Z-downsample failures, with the picker as a product choice · C04 the napari group-level gap · C07 the storage-library decision · NF-HCS, NF-MULTIMS, NF-OMERO · AGAVE extras optional and session settings covered · **one false S034 size dismissal each** |
| **In neither** | C01 hierarchy consistency, a mixed-version probe, and the "0.1" default · C02 dimension_names and rank validation, absent vs length-one · C03 declared order and arbitrary paths, missing level · C04 unit-absent state, composed probe, napari dropping translations · C05 registration before overlay · C06 label-value keying, nearest resampling, precision · C07 endianness per array, transpose, codec refusal · C08 fill vs failure, zero-filled failed loads, all-zeros reads |
| **Defects only in X1** | U1 false 21.6 GB · U2 false S042/S045 swap · U3 "conforming" translation-first · U4 "cheap" 0.4 · U5 path transforms called spec-legal |
| **Defects only in X2** | U1 false 1 TB (moderate) · U2 sniffing as precedent · U3 collection called a plate · U4 citation slip |

**Overall.**
- X1 keeps more reference facets overall, including C05 and C06, and has more distinct novel findings.
- X2 keeps C02, states its C03, C07 and C08 facets more usably, and its corrections are more often right.
- X2's one false correction is more consequential than any single X1 defect, while X1 has more low-severity false or overstated claims.

By finding identity neither dominates. No net score is computed, and the historical seven-to-eight finding difference is not treated as a permitted loss margin.

---

## 8. Coverage

**Assessed.**
- Brief, Plan, SCORING and key.
- Both delivered.md files in full.
- Both checks.md files and both upstream drafts in full; X1's observations in full; X2's observations for the reference-bearing blocks and all headers.
- Every decisive delivered claim that X1 or X2 made about corpus content or corpus absence, verified in `case/sources`. This includes S003, S010, S016, S018, S019, S024, S031, S033, S034, S042, S043, S045, S048, S053–S056, S059, S082, S096, S103, S120 and S121 read directly, plus targeted lines of S008, S013, S014, S015, S028, S035, S041, S044, S050, S052, S058, S064, S065, S091, S108, S109, S112, S114, S117, S122, S123 and S125.

**PENDING_HIGH_END_VERIFICATION.** None of the following is scored as a pass:
- Delivered claims resting on sources the evaluator did not open:
  - X1: S017, S049, S051 L112, S061, S066, S067, S099, S104, S105, S115, S119.
  - X2: S011, S027, S029, S070, S102, S111, S113, S051 titles.
- Bodies of the large API dumps beyond the cited lines. Contrary evidence in them is not excluded.
- X2's upstream observation bodies outside the reference-bearing set.
- X2's `stage1/evidence-bundle.md`, which is absent from the workspace.
- Recomputing SHA-256 and excerpt hashes. The hashes in grades.json are the catalog's recorded values, because no shell was available.
- A machine parse of `out/grades.json`. Its syntax was checked by manual review only.

X1's F3 bookkeeping items about the draft were all confirmed against the upstream draft and observations.

**Facet-level source limitations.**
- C07.b (reverse decode order) and C08.a (fill_value semantics) are unassessable, because no Zarr v3 normative text is in the corpus.
- C06.d (64-bit precision) is only partially eligible.
