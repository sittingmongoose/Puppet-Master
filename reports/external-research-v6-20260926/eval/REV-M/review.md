# Independent review of X1 and X2 (Slide Scout, OME-Zarr 0.5)

- **Evaluator:** Opus 5.5, extra-high effort, offline.
- **Scope:** TEST_ONLY_NEVER_PROMOTE sandbox. Configuration labels were withheld and not guessed.
- **Scored artifacts:** only `results/X1/delivered.md` and `results/X2/delivered.md`.
- **Lock order:** steps 1–4 (reference eligibility, reference grading, unsupported claims, novel findings) were saved to `out/grades.json` before any `upstream/` file or `checks.md` was opened. Step 5 (handoff, coherence, burden) and step 6 (coverage) were added afterwards. One post-lock evaluator correction is recorded openly under X1-U1.
- **Machine-readable version:** `out/grades.json`. Line numbers below are delivered-file lines (`Lnn`) or source lines (`Sxxx Lnn`). Whole-file hashes come from `case/MANIFEST.sha256.json`.

---

## 1. Reference facets and input eligibility

Each reference was split into facets from its full clause. Its decisive material was then checked against the admitted corpus. No reference proved mistaken at this snapshot. For C04 I recomputed the key's worked example: (7,11) → dataset (24,53) → group (196,465).

| Ref | Facets | Eligibility | Decisive admitted sources |
|---|---|---|---|
| C01 Versioned admission | a) v3 + `attributes.ome` + version string; b) version consistent in hierarchy; c) explicit validation or truthful unsupported result; d) no implicit legacy reinterpretation | eligible | S003 L68-72, L152-165; S053 L8-30; counterexample S019 L58-66 |
| C02 Axis identity | a) axes length = rank, order = dims; b) unique names, `dimension_names` MUST match; c) 2–5 dims, custom axes, arbitrary names; d) navigation tied to validated axes, **absent ≠ length-one**; e) mismatches rejected, no invented sliders | eligible | S003 L81, L166-174, L296-303, L307; S053 L126-195; S055 L59-64 |
| C03 Declared pyramid | a) declared order, not folder sort; b) group-relative, arbitrary names; c) per-level geometry, no fixed ×2, anisotropic; d) **missing declared level handled**; e) UI is a product choice | eligible | S003 L91-94, L304-310; S054 L31-73; S043 L2-35, L80-108 |
| C04 Composed calibration | a) dataset transforms, then multiscales transforms; b) scale before translation; c) active level's own transform; d) units are SHOULD, no invented calibration; e) concrete check exposing reversed composition or missing offsets | eligible | S003 L170-172, L276-293, L308-316; S053 L196-266 |
| C05 Label association | a) declared `labels` list; b) multiscales + same level count; c) `source.image` relative (default `../../`); d) coordinate relationship resolved, equal shape ≠ registration; e) intermediate groups; f) unsupported geometry explicit | eligible | S003 L102-117, L431-474; S018 L183-227; S048 L178-197, L558-599, L672-689 |
| C06 Categorical labels | a) integer IDs; b) keyed by `label-value`, not position; c) colors are SHOULD, palette is a product decision; d) identity preserved through resampling; e) 64-bit precision or declared range | eligible (d, e are derived from the admitted dtype/semantics) | S003 L431-474; S048 L607-661 |
| C07 Chunk decoding | a) per-array declared codec chain incl. sharding; b) reverse-order decode; c) **bytes-codec endian**; d) transpose layout; e) explicit support boundary, no guessed pixels | **partial**: b and d are `unassessable_missing_input` (zarr-specs pages not admitted) | S055 L16-57; S033 L157-162, L356-359; S014 L139-141; S038 L58; S043 L99 |
| C08 Absent vs failed | a) `fill_value` semantics; b) absent vs read/decode/cancel failure, no zero-filled failures; c) read-only incl. reader-side writes | **partial**: a is `unassessable_missing_input` | S018 L425-439, L540-558; S016 L156-173; S019 L91-100; S008 L161-162; S052 L515; S055 L65 (field only) |

For C07 and C08, the facets marked unassessable are not charged against either result. Status is graded on the admitted facets.

---

## 2. Reference statuses (delivered.md only)

### X1

| Ref | Status | Retained | Missing | Where |
|---|---|---|---|---|
| C01 | **retained** | a, b, c, d | – | F1 L7-11, F8 L53, F12 L71 |
| C02 | **narrowed** | b, c, e; d partly (selectors from axes, plane counts per level) | d: absent vs length-one; a/b uniqueness and rank only implicit | F4 L25-29, F6 L39, F8 L53 |
| C03 | **narrowed** | a, b, c (incl. Z-downsample), e (D-C) | d: missing declared level has no disposition | F2 L13-17, D-C L100 |
| C04 | **narrowed** | a partly ("composed with" top-level), c, e partly (hand-computed fixtures incl. translation) | **order not stated** (dataset→group, scale→translation); unit rule deferred ("state rule…") | F6 L37-41, N6 L82 |
| C05 | **narrowed** | b, f; a partly; d partly ("level-to-level (proposal)") | c: `source.image` absent (fixed walk-up adopted instead); e: intermediate groups absent; probing weakens a | F1 L9, F5 L31-35 |
| C06 | **narrowed** | a; b weakly (colors from image-label) | label-value keying; SHOULD/palette-as-decision; resampling; 64-bit precision | F5 L33, O-C6 L92 |
| C07 | **narrowed** | a (sharding_indexed + blosc/gzip/zstd/null), e (published matrix, fail loudly, S014/S038 bad modes, zlib not assumed) | c: endian | F2 L15, F8, F9 L57-61, N4 L80 |
| C08 | **narrowed** | c (read-only handles + before/after tree hash), b partly (silent no-chunks as a bad mode, unlisted-vs-unreadable labels, avoid zero-stitched default) | chunk-level absent vs failed read; failed-read zero-fill; cancel vs failure | F7a, F8, F10 L63-64, D-A L98 |

**X1 counts:** retained 1, narrowed 7, lost 0, contradicted 0.

### X2

| Ref | Status | Retained | Missing | Where |
|---|---|---|---|---|
| C01 | **retained** | a, b, c, d | – | V8 L61-66, D-BACKCOMPAT L144, V13 L97 |
| C02 | **narrowed** | a, b, c (+ D-CUSTOM), e | d: absent vs length-one | V3 L25-30, V4 L33, V8 L62-66 |
| C03 | **narrowed** | a, b, c, e (D-UI) | d: missing/unordered path left as open question O-005 | V2 L18-23, L150 |
| C04 | **retained** | a, b (explicit `(index×scale+translation)` then group), c, d (SHOULD units, None-tolerant, no drop), e (group-scale + unitless checks; V5 translation check) | minor: S003 L310 non-physical scale factor | V4 L32-37, V5 L39-44 |
| C05 | **retained** | a, b, c (named with default), d (transform-aware; same-shape overlay "breaks"), e, f | minor: `source.image` not operationalised as a check | V6 L46-51 |
| C06 | **narrowed** | a; b partly (label-value MUST); c (colors SHOULD + D-PALETTE) | keyed lookup not stated; resampling; 64-bit precision | V6 L47, D-PALETTE L138 |
| C07 | **narrowed** | a, e (document supported set, per-array cannot-decode explanation) | c: endian | V9 L68-73, V14 L103-108 |
| C08 | **narrowed** | b partly (missing wells shown as missing, never black; per-level attribution) | failed-read zero-fill; cancel vs failure; c: read-only only restated, no reader-side write control | V8, V9 L69, V12 L89-94 |

**X2 counts:** retained 3, narrowed 5, lost 0, contradicted 0.

---

## 3. The other direction: unsupported claims, false dismissals and lost qualifiers

I checked decisive claims against the source lines, not against model knowledge. Bounded unknowns (the R-/O- lists) are not counted as defects.

### X1

| ID | Location | Claim | Class / severity | Counterevidence and consequence |
|---|---|---|---|---|
| X1-U1 | F1 L9 | "Labels/Label parent walk-up" required for opening at a label node | Unjustified requirement / **low** | The declared association is `source.image` (S003 L472-474), which ome-zarr-py resolves (S018 L214-227). napari's fixed `parent.parent` (S048 L681-689) lands on `labels/` when an intermediate group exists (S003 L110, L439-440). *Post-lock evaluator revision:* I had also charged the parenthetical "(only walk-up evidenced)" as a false source fact. It is ambiguous, and most plausibly means "only the Labels/Label walk-up is evidenced", which is accurate. That charge is withdrawn and severity lowered to low. No reference status changed. |
| X1-U2 | F1 L9, F5 L33 | Label discovery = "listing UNION directory probing" (required) | Unjustified requirement / **low** | Listing is the declared mechanism (S003 L441-442), and reference readers only use the listing (S018 L193-199; S048 L181-196, L558-569). No qualifying test is stated for probed groups, which risks attaching undeclared arrays (the C05 "missed" pattern). |

- **Lost qualifiers:**
  - composition order (F6), which affects C04;
  - endian (F2/F9);
  - window `min/max` also MUST (F3, minor).
- **False dismissals:** none found.
- **Internal contradictions:** none material.
  - F10 is marked "covered" while adding an enforcement check.
  - The coverage pointer says `out/checks.md` instead of `results/X1/checks.md` (trivial).
- **Minor citation issue:** F7b calls S061 L39 ("too slow to be very usable") a "chunk/request cost warning". This is immaterial.

### X2

| ID | Location | Claim | Class / severity | Counterevidence and consequence |
|---|---|---|---|---|
| X2-U1 | non-findings L127 | "AGAVE TensorStore-backed" overstates S072 (build dependency only) | **False unsupported dismissal (partial)** / low | S096 L12-24: AGAVE's `FileReaderZarr.cpp` includes tensorstore headers, calls `tensorstore::Open`/`Read` and holds a `TensorStore` member. X2 never read S096. This dismisses reader-library precedent on an incomplete read. |
| X2-U2 | V2 L21 | non-2 sample: vizarr fails, "others pass" | Unsupported evidence summary / low | Avivator is "supported: no" and neuroglancer fails on a `>u1` dtype (S043 L84-85, L98-99). This hides an endian-typed failure on the same row; the finding itself is unaffected. |
| X2-U3 | V5 L40 | "most viewers ignore or hard-fail" translations | Overstated / low | Four viewers are recorded as "not possible to assess" (S043 L357-392). The requirement, which rests on S003 L311/L315, is unaffected. |

- **Lost qualifiers:**
  - endian (V9/V14);
  - read-only enforcement beyond restating Plan L9.
- **Internal contradictions:** V11 is marked optional while its text says "silent misrender is a defect". The warning duty sits in V8, so this is minor scoping.
- **Checked and cleared:**
  - V1's "MUST-NOT (SHOULD-NOT)" labels the spec strength and is justified by Plan L5.
  - Rejecting labels-group-as-open-root is correct (S003 L438).

---

## 4. Novel supported findings and correct non-findings

### X1 novel findings (source-backed, scoped to the Plan)

- **N1:** hierarchy-aware discovery: plate > well > field; layout precedence (plate, then series, then numbered groups). S003 L118-148, L176-275, L515-560, L740-752.
- **N2:** omero is optional; its MUST subset drives defaults; one bad window should degrade only that channel, not wipe contrast for all channels as ome-zarr-py does. S003 L398-430; S018 L375-383.
- **N3:** per-level plane counts, with selectors remapped on level switch for Z-downsampled pyramids. S043 L2-35.
- **N4:** large-data bounding beyond background/cancel. S034 L67-83; S117 L97-128.
- **N5:** interop matrix including converter hierarchy quirks; the converter's codec table is not a format floor. S033 L157-162, L251-325; S003 L70-72.
- **N6:** multi-multiscales: first by default, no crash, choice UI optional. S003 L388-397; S043 L277-316.
- **N7:** layout value accepted as string or number. S003 L200, L256.
- **N8:** failure taxonomy naming node + rule + recovery. S018 L598-600; S048 L698-699; S038 L58.
- **N9:** acceptance as a fixture matrix with a validator oracle. S008 L158; S031.
- **N10:** Viv's dtype bound conflicts with 64-bit labels. S025 L84-86; S003 L439.
- **N11:** absolute-path settings are a portability trap. S108 L27.
- **N12:** optional raw-array fallback, RO-Crate panel, finder browsing and label properties.

### X1 correct non-findings

- General fusion is not required (S043 L473-507).
- Remote, export, edit and clinical work are out of scope.
- Scene graphs are not part of 0.5.
- zlib is not "unsupported".
- Multi-multiscales choice UI is optional.
- The PR206 labels move was only a proposal (S004 L149-156 vs S003 L441-450).
- F7a is covered by Plan L7.

### X2 novel findings

- **N1:** discovery by root kind, with the SHOULD NOT against opening only the first image; all-series precedent. S003 L118-129, L200-205, L254-275; S026 L257.
- **N2:** axis-driven controls and omero MUST subset, with viewer divergence; custom-axis and omero-default decisions. S003 L398-430; S043 L51, L70, L78.
- **N3:** bounded I/O, never eager-load full resolution; AGAVE dialog is only a sufficiency precedent. S034; S058 L387-389; S117.
- **N4:** schema-checkable vs spec-only rules (`len==axes` is not in the schema). S053 L196-256; S003 L312.
- **N5:** interop pinning to writer rollout (pre/post-#413, sharding release). S008 L149-163; S013; S052 L300, L558.
- **N6:** multi-multiscales as a product choice, excluding silent first-only.
- **N7:** RFC-5 transforms: warn, don't implement. S051 L515-523.
- **N8:** plate truthfulness: missing wells are never shown as black. S018 L404-567; S043 L207-238; S041 L12-15.
- **N9:** optional browsing via zarr.json traversal. S023 L150-154.
- **N10:** no codec floor established; document the supported set. S003 L70-72; S033 L157.
- **N11:** RO-Crate sidecar must not be misclassified. S034 L43-46, L193-198.
- **N12:** Zarr v2/v3 dependency split-brain. S011 L151-157.
- **N13:** multi-channel label presentation decision. S048 L204-213, L580-584.
- **N14:** layout string/number tolerance.
- **N15:** Viv dtype bound.

### X2 correct non-findings

- The labels group is not an image.
- The Plan never states fixed 5D.
- omero `active`/`label`/`rdefs` are example-only.
- UDUNITS is a SHOULD.
- napari squeeze mechanics are not MUSTs.
- The AGAVE dialog is not required.
- The schema does not enforce `len==axes`.
- Failure explanation is not "covered".
- The FormatV05 docstring is stale (S016 L370 vs L387; S052 L558).
- There is no codec floor.

---

## 5. Handoff fidelity (performed after the lock)

Upstream-only material does **not** change any status above.

### X1 (O-001..O-068 → draft → checks → delivered)

- **C04 order lost in handoff.**
  - Draft P2 stated "top-level transform applies after per-dataset ones" and "translation after scale", and checks C-P2 confirmed it.
  - Plan-fit F6 dropped both, and delivery never restored them.
- **C05 facets lost.**
  - O-009/O-010 and draft P4 had intermediate groups and `source.image ../../`. Both were dropped at draft F5.
  - O-050's qualifier on probing ("groups implementing multiscales + image-label") was dropped at F5.
  - Checks C-F5 labelled "align using each side's transforms" a proposal, so delivery weakened it.
  - Checks C-F1's "probing is not MUST" was **not** applied.
- **C06 narrowed.** Upstream "SHOULD image-label colors (label-value …)" became "colors from image-label" in delivery.
- **C08 facet lost.** O-020 had "zeros for missing/**failed** fields". Draft P9 reduced this to "missing tiles" and delivery kept only "S018 zeros".
- **Positive changes.**
  - Double dispositions (F3/F7) were fixed.
  - The zlib "unsupported" claim was rejected (N4).
  - Multi-multiscales choice was demoted to optional.
  - The panel-vs-render translation distinction was added.
  - Weak read-only citations were disclosed.
  - Layout-type and S055 wording caveats were surfaced.

### X2 (O-001..O-040 → draft → checks → delivered)

- **C08 facet lost.** O-039 had "zeros for missing wells/**failed** tiles". Draft F12 and delivery kept only missing wells.
- **C04 minor loss.** O-006 and draft P4 had the S003 L310 relative-factor case, which checks C-P4 confirmed. It was dropped from V4.
- **C01 minor distortion.** O-013 correctly recorded S019's "version mismatch → warning + re-init". Checks C-O013 searched only S019 L70-101, missed L58-66, and demoted the fact to an open question.
- **Verification-induced error.** Upstream "AGAVE TensorStore-backed" was demoted using S072 only and became a delivered non-finding. S096 L12-24 supports the upstream claim (see X2-U1).
- **C07.** The raw `bytes(little)` field was acquired in O-019 but never interpreted.
- **Positive changes.**
  - The false "covered" on F8 was fixed.
  - The labels-entry clause was rejected.
  - napari mechanics, the AGAVE dialog and omero example-only fields were demoted.
  - The schema `len==axes` overstatement was corrected.
  - D-STACK, D-PALETTE, D-CUSTOM, D-MULTILABEL and D-OMERO were surfaced from the checks.

### Coherence

- **X1:** coherent. One disposition per finding; stands alone apart from provenance tags.
- **X2:** coherent. One disposition per finding; decisions grouped with options and exclusions; minor V11 scoping tension.

### Decision burden

Definitions used:

- **Blocking:** gates a Plan-required behaviour and the result gives no default or recommendation.
- **Nonblocking:** has a default or recommendation, gates only an optional capability, or is an implementation note.

| | X1 | X2 |
|---|---|---|
| Blocking | 3: D-B channel rendering, D-C bounding strategy, D-D strictness | 7: D-PLATE, D-UI, D-MULTI, D-PALETTE, D-OMERO, D-CUSTOM, D-MULTILABEL |
| Nonblocking | 9: D-A (recommended), O-C1..O-C8 | 4: D-ROCRATE, D-BROWSE, D-BACKCOMPAT, D-STACK (an implementation note filed as a decision) |
| Redundant | 1: D-E labels-only (already set by brief/Plan) | 2: O-010 duplicates D-PLATE; O-006 and O-026 duplicate each other |
| Clarification questions to user | 0 | 0 |
| Research unknowns carried | 9 (R1–R7, U1–U2) | 17 |
| Hidden or silently approved | omero fallbacks, missing-color palette ("invent colormap"), custom-axis presentation, multi-channel labels ("strip channel") | none found |

X1's lower count is **not** a quality win. Several decisions X2 surfaces are settled silently in X1. X2 gives exclusions and safe minima but no recommendation for any blocking decision.

---

## 6. X1 vs X2 by finding identity

Direction convention: **gained** = in X2 but absent or weaker in X1; **lost** = in X1 but absent or weaker in X2. This implies nothing about configurations.

### References

| Ref | X1 | X2 | Identity |
|---|---|---|---|
| C01 | retained | retained | both |
| C02 | narrowed | narrowed | both partial; absent-vs-length-one: neither |
| C03 | narrowed | narrowed | both partial; missing level: neither; X1 has the Z-downsample remap facet (lost in X2) |
| C04 | narrowed | **retained** | **gained**: explicit order, unit treatment; S003 L310 relative factor: neither |
| C05 | narrowed | **retained** | **gained**: `source.image`, intermediate groups, transform-aware alignment |
| C06 | narrowed | narrowed | both partial; **gained** facets: label-value MUST, SHOULD/palette decision; resampling and 64-bit precision: neither |
| C07 | narrowed | narrowed | both partial (support boundary in both); endian: neither |
| C08 | narrowed | narrowed | both partial; **lost**: read-only enforcement vs reader-side writes (X1 only); **gained**: missing wells never black (X2 only); failed-read zero-fill and cancel vs failure: neither |

### Novel findings

- **Both:**
  - hierarchy-aware discovery;
  - omero optional/fallbacks;
  - large-data bounding;
  - interop matrix;
  - multi-multiscales handling;
  - layout type tolerance;
  - failure taxonomy;
  - RFC-5/scenes out of 0.5;
  - browsing optional;
  - RO-Crate;
  - Viv dtype bound;
  - converter codec table ≠ format floor.
- **Lost (X1 only):**
  - per-level plane remap;
  - per-channel omero degradation;
  - converter hierarchy quirks;
  - explicit acceptance fixture matrix;
  - read-only enforcement with tree hash;
  - absolute-path settings trap;
  - raw-array fallback;
  - panel-vs-render translation distinction.
- **Gained (X2 only):**
  - schema-vs-spec checkability;
  - writer-rollout pinning;
  - missing wells never black;
  - RO-Crate not misclassified;
  - Zarr v2/v3 dependency split-brain;
  - explicit custom-axis, multi-channel-label, palette and omero-default decisions;
  - stale FormatV05 non-finding;
  - translations as a standalone apply-or-explain correction.
- **Defects:**
  - X1: X1-U1, X1-U2 (both low).
  - X2: X2-U1 (a false dismissal), X2-U2, X2-U3 (all low).

### Neither: admitted-corpus items missing from both deliveries (evaluator-observed; no participant credit)

1. Absent vs length-one axes (S003 L106-108, L301-302).
2. Missing declared pyramid level (S003 L305-306; Plan L5).
3. Scale as a non-physical inter-level factor (S003 L310). X2 acquired this upstream and dropped it.
4. Label resampling: ome-zarr-py `write_labels` defaults to nearest-neighbour only from v0.13.0 (S052 L429), so older label pyramids may hold interpolated IDs.
5. 64-bit label ID precision (S003 L439).
6. Bytes-codec endianness varies by writer (S055 L27-30; S033 L356-359; S043 L99 `>u1`).
7. ome-zarr-py zero-fills `ValueError` load failures in well/plate stitching (S018 L435-438, L555-557). Both results acquired this upstream and both dropped it.
8. Write-mode opens create metadata (S008 L161-162; S019 L91-98), and ome-zarr-py opens read-only only from v0.12.1 (S052 L515).
9. The reference reader silently re-detects format on mismatch (S019 L58-66) and defaults a missing multiscales version to "0.1" (S018 L279-285).
10. Pinned napari-ome-zarr uses only `datasets[0].coordinateTransformations[0]` and the first top-level transform (S048 L260-283), so 0.5 translations are dropped. The v0.4-era matrix's "napari supports translation" (S043 L370-371; S041 L4) predates this code. This is a static reading; runtime was not verified.
11. napari's fixed two-level label walk-up fails with spec-permitted intermediate groups (S048 L681-689; S003 L110, L439-440).

### Summary

- Neither result contradicts or outright loses a reference.
- X2 fully keeps two more references (C04, C05). X1 keeps one C08 facet (reader-side write enforcement) that X2 lacks.
- Both miss the same admitted facets: absent-vs-length-one axes, missing level, label resampling and precision, endian, and failed-read zero-fill.
- Novel findings are complementary rather than nested:
  - X1 is stronger on navigation remap, omero degradation, converter layout quirks, the acceptance matrix and read-only enforcement.
  - X2 is stronger on schema/spec separation, rollout pinning, plate truthfulness, RO-Crate, the stack conflict and explicit decisions.
- Unsupported assertions are few and low-severity in both.
- Per the frozen rules, I compute no net score and let no count offset a loss. Historic seven-to-eight finding differences were not used as a loss margin.

---

## 7. Coverage accounting

### Assessed

- **Read in full:**
  - brief, Plan, README, SCORING, key, MANIFEST;
  - both `delivered.md`;
  - both `checks.md` and all `upstream/` files, after the lock.
- **Sources read in full:** S003, S009, S016, S018, S019, S025, S031, S038, S043, S048, S053, S054, S055, S062, S096, S108.
- **Sources read at targeted ranges:**
  - S004 L145-164; S008 L140-167; S010 L1-60; S011 L130-211; S013 L140-339;
  - S023 L140-161; S026 L126-128, L255-257; S027 L165-184, L260-275;
  - S033 L100-369; S034 L1-210; S041 L1-24; S051 L510-549, L785-804;
  - S052 release bodies (L42-644); S058 L300-397; S059 L120-155, L218-227;
  - S061 L30-43; S072 L1-40; S098 L195-226; S117 L1-140.
- **Pattern searches:**
  - corpus-wide greps for endian/transpose, `fill_value`/missing-chunk and error handling;
  - S014, S020, S044, S056, S085, S109 hit lines;
  - catalog URI index (to confirm the zarr-specs pages were not admitted).
- **Per result:** every reference graded, and every delivered finding and non-finding read and checked for material claims.
  - **X1:** all 123 lines; F1–F12, N1–N7, O-C1..O-C8, D-A..D-E, R1–R7, U1–U2.
  - **X2:** all 161 lines; V1–V15, non-findings, D-MULTI..D-STACK, carried open questions.

### PENDING_HIGH_END_VERIFICATION (not a pass)

- **Excerpt hashes:**
  - Excerpt-level SHA-256 values were **not computed**. Neither this evaluator session nor the mechanical helper had a shell.
  - Only whole-file hashes (from `case/MANIFEST.sha256.json`) are recorded in `grades.json`.
  - The helper did confirm, by reading only, that every cited decisive line range lies inside its source file.
- **JSON validity:**
  - `out/grades.json` was checked by manual inspection only (full structural read; every line has an even number of double quotes).
  - It was not machine-parsed.
- **Unopened sources:**
  - S001–S002, S005–S007, S012, S015, S017, S020–S022, S024, S028–S030, S032, S035–S037, S039–S040, S042, S045–S047, S049–S050, S057, S060, S063–S071, S073–S084, S086–S095, S097, S099–S107, S110–S125;
  - unread ranges of the partially read sources above.
  - A counterexample or novel finding inside them cannot be excluded.
- **Delivered citations not individually re-read:**
  - X1 F4's AGAVE "fixed-order risk" (S098 outside L195-226);
  - X1 O-C8's link from S062 to transfer functions;
  - X1 R6 status claims;
  - a few X2 unresolved-list citations.
- **No runtime evidence:**
  - All implementation behaviour is static reading of the pinned captures.
  - Non-admitted callers (`ome_zarr/axes.py`, napari `plate.py`) were not traced.
- **Handoff trace:** covers the eight references and the material deltas listed; not every O-block was traced.
- **Blocking/nonblocking split:** evaluator judgement under the stated definition.
