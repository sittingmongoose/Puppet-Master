# Slide Scout corpus research — independent verification (delivered result)

Case `ome-zarr-thin` (TEST_ONLY_NEVER_PROMOTE sandbox). This report stands alone: it re-verified every consequential claim in `stage1/draft.md` against the fixed corpus `case/sources/S001–S125`, the frozen Plan `case/plan/Viewer.md` and `case/brief.md`, using `stage1/evidence-bundle.md` as the first view and opening sources directly wherever a quote was marked not found, the window was too narrow, or contrary evidence was plausible. Per-check detail with verdicts is in `out/checks.md` (C-01…C-41).

**Overall verdict:** the draft is substantively sound. All ten "established format obligations" (§1), all seven compatibility findings (§2), and the great majority of the line-by-line Plan-fit claims (§3–§4) are confirmed against the cited sources at the cited lines. Verification found **six corrections** (one systemic citation/classification error around source handles S096/S120/S121, plus five overstated or misscoped specifics), **two qualifications**, a set of correctly-labeled product choices and optional capabilities, and **nine unresolved items** (eight carried by the draft, one new). No fabricated evidence was found: every consequential claim traces to real corpus content; the defects are wrong handles, wrong counts, and overstatements.

---

## 1. Findings (each with disposition, consequence, validation idea)

### F-1 — Correction: source-handle scramble around S096 / S120 / S121 (draft §2 "whitelists four dtypes (O-023, S120)"; §6 coverage lists; observations O-022/O-023/O-070)
- **Exact condition:** The AGAVE four-dtype whitelist grep extract (`int32/uint16/uint8/float32`, `renderlib/VolumeDimensions.cpp:288–297`) exists in the corpus at **S096 L25–28**, not S120. **S120 is a one-line "No literal matches" placeholder** containing no evidence. **S121 holds a genuine 9-line grep extract** of AGAVE's `getOmero` dual lookup (`ome["omero"]` then `attrs["omero"]`, S121 L1–9 — the evidence for O-024). AGAVE's vendoring of tensorstore v0.1.78 is at **S096 L8–9**, not "S120 lines 9, 38" as O-070 cites.
- **Where the draft is wrong:** §2 cites the dtype whitelist to "(O-023, S120)". §6 lists S096 under "Failed or empty captures — no evidence either way" while listing "S120/S121 (AGAVE grep extracts)" under read-in-full; S121 also appears in the failed/empty list, contradicting both itself and O-022. The three handles' classifications are scrambled: S096 is substantive, S120 is a no-match placeholder, S121 is substantive.
- **Disposition:** correction (citations and coverage classification; the underlying claims — dtype whitelist, dual omero shim, tensorstore vendoring — are all real and confirmed).
- **Consequence:** broken evidence traceability for the dtype-whitelist and dual-shim claims, and wrong corpus-limitation statements (a reader would believe two evidence-bearing sources are empty and one placeholder is evidence). Downstream conclusions do not change.
- **Validation idea:** re-run the mechanical quote check for O-022/O-023/O-024/O-070 after swapping the handles; assert the dtype extract matches S096 L25–28 and the getOmero extract matches S121 L1–9.

### F-2 — Correction: "most-upvoted issue" is unsupported (draft §3 L7, first bullet)
- **Exact condition:** the draft calls AGAVE issue #84 ("Data loading currently blocks the whole application and is not easy to cancel", S103 L58) "the direct desktop analog's most-upvoted issue". S103 records `reactions.total_count: 0` (S103 L60–62); nothing in the corpus ranks issues by popularity. Observation O-064 said "dominated", which was already loose; the draft strengthened it to a falsifiable ranking claim.
- **Disposition:** correction. Reword to "a long-standing open issue that names exactly this problem".
- **Consequence:** low for conclusions (the Plan's background-read/cancellation obligation is independently motivated by Plan L7 itself plus S043/S050 crash evidence), but the sentence as written would not survive review.
- **Validation idea:** before any "most-upvoted/top pain point" claim, require a reaction or duplicate-count in the cited capture.

### F-3 — Correction: "shipped answers were an in-memory volume cache and memory-estimate UI" overstates shipping status (draft §3 L7)
- **Exact condition:** the memory-estimate load dialog **is shipped** (S117 L102: "The Load Settings dialog presents you with a memory estimate"). The in-memory volume cache exists in-corpus only as a **stacked draft PR series** ("[volumecache 01/12] Add in-memory volume cache manager", "Stacked draft PR 1 of 12…", S114 L235/L279, L91/L135/L163) — no merge evidence.
- **Disposition:** correction. Reword: "the analog's shipped memory-estimate dialog and its in-progress (draft-PR) volume-cache series".
- **Consequence:** the cache-policy question the draft raises (what to keep when work is cancelled) remains valid, but should be framed as "a peer is still solving this", which strengthens rather than weakens the draft's point.
- **Validation idea:** check merge state of the volumecache series before citing it as an implemented answer.

### F-4 — Correction: "1 TB plates … are real 0.5 data (O-046)" (draft §3 L11)
- **Exact condition:** no terabyte size exists anywhere in the corpus. S010 (the IDR sample table) carries dimensions but no sizes; the largest evidenced sizes are **21.57 GB** (9822152.zarr, single plane 93184×144384, S034 L69–70) and **66.04 GB** (9846151.zarr, S034 L71–72); "multi-TB" appears only as a converter's positioning text (S070).
- **Disposition:** correction (unsupported figure inherited from observation O-059's implication). Replace with the evidenced sizes; the argument (2D-canvas avoids volume-rendering memory ceilings) survives unchanged.
- **Consequence:** minor; prevents an inflated number entering acceptance planning.
- **Validation idea:** only cite sizes that appear in a captured table or listing; keep 21.6 GB / 66 GB as the large-data anchors.

### F-5 — Correction: "no multi-entry-multiscales fixture exists anywhere" (draft §3 L11)
- **Exact condition:** the viewer matrix cited in the same paragraph (O-050) documents a **real multi-multiscales sample**: `https://livingobjects.ebi.ac.uk/idr/zarr/v0.4/idr0050A/4995115.zarr` with per-viewer results (S043 L277–316). What is true: no **0.5** multi-entry fixture is evidenced in-corpus, and no tested viewer opens beyond the first entry (S043 L277–316; reference readers read only `multiscales[0]` — S018 L279–284, O-029; S048 L199–213, O-033).
- **Disposition:** correction (scope the gap to 0.5). The conclusion "the multi-multiscales case needs a deliberate product decision" stands (see F-11/PD-1).
- **Consequence:** acceptance planning can use a named v0.4 sample for the multi-entry behavior class in addition to a synthetic 0.5 fixture.
- **Validation idea:** fixture matrix entry: 4995115.zarr (v0.4, real) + a synthetic 0.5 two-entry multiscales group.

### F-6 — Correction (minor): the 190129 plate has 49 wells, not 50 (draft §3 L5 fixture list; observation O-019 "50 sparse wells")
- **Exact condition:** S056 contains 49 `rowIndex` entries (well objects) and S010 L1046 records "49" for 190129.zarr (49 wells / 32 fields). The plate indeed lacks `version` and `acquisitions` (only `ome.version` at S056 L4 and `_creator.version` at L7 exist in the file).
- **Disposition:** correction (numeric).
- **Consequence:** cosmetic, but fixture descriptions should match the captured artifact exactly.
- **Validation idea:** derive counts mechanically from the capture (count `rowIndex`) rather than by eye.

### F-7 — Qualification: "single-shard-per-Z layout like 4496763" (draft §3 L9 validation idea)
- **Exact condition:** 4496763.zarr is named in-corpus only at S034 L67–68 (shape 4,25,2048,2048; 589.81 MB; O-047 context). No source describes its shard layout; the `0/c/0/0/0/0` chunk-key listing belongs to 6001240.zarr (S034 L52–62, O-047) and does not by itself establish "single-shard-per-Z".
- **Disposition:** unsupported (an unsupported specific inside a proposed validation idea, not a factual claim about the product or corpus). Keep the fixture idea; drop or re-derive the layout assertion after local capture.
- **Consequence:** none if reworded; prevents an unverifiable acceptance detail.
- **Validation idea:** when the fixture is captured, assert the shard layout from its `zarr.json` instead of pre-asserting it.

### F-8 — Qualification / new unresolved item: BR00109990_C2 version conflict
- **Exact condition:** the IDR samples table records BR00109990_C2.zarr (9-image b2r collection) as **0.4**, row dated 2025-09-22 (S010 L1125–1134), while napari PR #123 exercises it at a `/zarr/v0.5/` URL as a v0.5 plate (S024 L39; S027). Both captures are in-corpus and contradict each other.
- **Disposition:** unresolved (which version the live file currently carries cannot be decided without fetching, which is out of scope). The draft's careful "BR00109990_C2-**like**" phrasing avoids the trap; note that 0.5 b2r collections are independently evidenced (idr0051/idr0026 rows, S010 L1090–1113), so the L11 claim "0.5 … b2r collections" remains supported.
- **Consequence:** only for fixture provenance bookkeeping.
- **Validation idea:** record producer + captured version per fixture; treat sample-page metadata as time-varying.

### F-9 — Optional capability (confirmed, correctly framed by the draft): AGAVE-style extras
- **Evidence:** timestamp overlay in physical time units and per-timepoint transfer-function adaptation (S117 L299–317, L521–536); memory-estimate-per-level load dialog (S117 L95–134; S125 L55); user-demanded channel LUTs, masking, opacity, interpolation toggles, tooltips (S112 titles at L15/91/167/315/622/785/1005/1081).
- **Disposition:** optional_capability under the Plan L9 review gate — none are required corrections; the draft lists them in §3/§4 appropriately.

### F-10 — Covered decisions re-verified as covered (non-findings, listed because they are load-bearing)
- **Read-only + session-local settings:** Plan L9 supported; the counterexample the draft cites is real — AGAVE's saved-settings JSON stores an absolute data path (S108 L27).
- **Exclusions (no remote/editing/interpretation):** boundary holds; remote-specific failures (labels from buckets S028 L4368; proxy S028 L3080) are out of scope by construction; non-image payloads inside filesets (ro-crate S034 L45–46, OME-XML S003 L186–189) are correctly assigned to discovery, not storage.
- **"Channel/time/plane where relevant":** correct and load-bearing — real 0.5 data spans XY-only to XYZCT (S010 L1026–1130), axes identified by type not name (S003 L300–303), channel axis may be absent.
- **omero as optional with fallback defaults:** required path, not edge case — `bioformats2raw --no-minmax` legitimately omits it (S033 L351–354); ome-zarr-py degrades gracefully (S018 L335–391); vizarr's coupled label-loading bug is the counterexample to avoid (S050 L2436).
- **Failure UX cannot be inherited from libraries:** parse_url None-collapse (S019 L223–231) and the reference tracker's open error-UX gaps (S028 titles) confirm the draft's "own error taxonomy" consequence.
- **Sharding/codecs as the compatibility floor:** the flagship IDR 0.5 level-0 array is `sharding_indexed` over blosc/zstd with crc32c and chunk shape exceeding array extent (S055 L1–74); codec floor bytes+{blosc,gzip,zstd,null} and little-endian default (S033 L152–162, L356–359); auto-sharding arriving (S044 L126–154).

### F-11 — Product decisions the user must make (grouped disposition: product_choice; all correctly left unresolved by the draft, each evidenced on both sides)
1. **Multi-entry `multiscales`:** spec-faithful listing (user choice by name, first-entry fallback — S003 L298/317/390–397) vs ecosystem behavior (first entry only: S018 L279–284, S048 L199–213; zero viewer support, some crash: S043 L277–316). Listing entries is spec-correct and a differentiator; it must not inherit first-entry geometry assumptions.
2. **Zarr v3 storage strategy:** tensorstore C++ (S111/S113; AGAVE vendors v0.1.78, S096 L8–9; build weight S125 L55), zarr-python ≥3 (S015 L47–61), or napari-style direct-zarr rewrite (S024 L39). Must cover sharding + bytes/blosc/gzip/zstd/null + crc32c indexes regardless of choice (S055, S033, S058, S044).
3. **Version-handling policy:** strict 0.5 vs permissive (SpatialData precedent in ome-zarr-py v0.19.0, S052 L122; AGAVE format-sniffing, S082 L55; 0.6rc0 approaching, S035 L356/1340). Either way: informative refusal on unknown `ome.version` (S003 L25–27: editor's drafts "will not necessarily be supported").
4. **Plate presentation:** well-by-well navigation vs ome-zarr-py-style stitching with zero-filled tiles (S018 L438/547/557); if stitching, disclose synthetic zeros.
5. **Pyramid level choice:** automatic (Plan L5) vs AGAVE's manual picker with memory estimate (S117 L95–134, S125 L55). If automatic, keep a manual override; either way level geometry must handle Z-downsampled pyramids, non-2 factors, and centered translations (S043 L1–86; S016 L276–294).
6. **Initial label-overlay visibility:** established viewers hide labels initially (S048 L654); a deliberate choice with an obvious toggle is needed.

---

## 2. Correct non-findings (checked and accurate — no action needed)

The following consequential draft claims were verified and are correct as written: the full §1 obligation list (S003 L65–474, L507–568, L740–752, L801–835; S053; S054–S056; S033; S044; S058); §2's break-by-design history including the draft-only transform types (S004 L149–157, L188–293) and 0.4 version-in-multiscales convention (S059 L347–353 — note: spec text, not a captured data file); degenerate writer metadata (S029 L294–295, L334); the April-2025 viewer-matrix failure classes including napari's unapplied group-level scale (S043 L318–421); vizarr #307 and the napari zarr-2/3 schism (S014; S011); the tool-version timeline (S008, S013, S065, S015, S052, S035); the Plan-fit dispositions for L5/L7/L9/L11 including the "correction" on image-list scope, "product_choice" on level selection, and "unsupported as written" on "representative"; §4's alternatives (stitching, finder+BFF, 2D-slice class with 8 dtypes S025 L84–85, differentiators); §5's deferrals (RFC titles verified S051 L79–129); and §6's S027-is-a-duplicate note (S027 L1/126/150). The eight unresolved items the draft carries forward were each re-checked and remain unresolved in-corpus.

Also noted for the record: the bundle's many `not_found_in_cited_sources` statuses are almost all artifacts of the observations' ellipsis-joined quotes; the underlying fragments were verified at the cited lines via the bundle windows and direct source reads. Only O-022/O-023/O-070 (F-1) are genuine citation failures.

## 3. Unresolved items (carried)

1. BR00109990_C2 true version: 0.4 per S010 L1134 vs v0.5 URL in S024/S027 (F-8). **New.**
2. Reader-side auto-shard support/latency in current zarr libraries (O-045; only issue-title evidence, S049).
3. Full RFC-5/scene metadata semantics (O-053; napari handles a `coordinateSystems` form it labels "v0.6+", S048 L218–221).
4. Exact nature of the omero schema inconsistency (title only, S035 L3943).
5. Which bioformats2raw release defaults to 0.5 output (S033 says only "current supported values are 0.4 and 0.5"; default follows 0.4 conventions, S033 L213–226).
6. Whether AGAVE v1.10 opens sharded 0.5 samples (zero "shard" hits in its tracker, S102 — textual absence, not capability).
7. Whether current viewer versions fixed the S043 matrix failures (matrix pinned April 2025, S041 L1–20).
8. Rectilinear chunk grids in the wild (tensorstore issue title only, S109).
9. Content of the 0.4 `.zattrs` capture S068 (binary placeholder line, no readable evidence).
10. (Deferred, from O-010/O-019) whether real label images satisfy the equal-level-count MUST — no labels-group capture in-corpus to test with; whether any producer emits plate `version`.

## 4. Unchecked / out-of-scope items

- Sources never opened by this verification beyond their bundle windows and targeted greps: S090, S092–S094, S097, S100, S101, S107, S110, S116, S118, S122–S124 (none carries a consequential draft claim; the draft itself marks most as sampled-or-unread). S026 (napari releases list), S030–S031, S037–S040, S047, S063–S064, S073–S075, S078–S080, S084–S089, S091 (beyond the v1.10.0 window), S099 were spot-checked only where citations touched them.
- Large issue-dump sources (S028, S035, S050, S109, S112, S114) were verified at the cited title lines, not read in full; bodies beyond cited ones were not inspected, so additional contrary evidence inside those dumps cannot be excluded.
- No live fetching, shell execution, or access outside the workspace was performed, per the assignment; "validation ideas" remain proposals.

## 5. Coverage and limitations of this verification

- **Coverage:** all 10 §1 items, all 7 §2 bullets, all 12 §3 Plan-fit rows (including every disposition), all 6 §4 entries, the §5 deferral table, and the §6 coverage/unresolved claims were checked (C-01…C-41). Every source handle the draft cites for a consequential claim was either matched in the bundle or opened directly. Deferred/omitted observations were checked beyond the draft's own set: O-024 (omitted; confirmed via S121), O-023 (miscited; confirmed via S096), O-019 and O-010 open questions (remain unresolved), O-053 (deferral confirmed), O-077/O-078 (empty-capture handling confirmed).
- **Limitations:** verdicts rest on the frozen corpus as captured (versions and dates are those of the captures, e.g. spec edition 8 September 2026; ome-zarr-py repo snapshot 94eaf20 vs releases to v0.19.2). Quote-match proved text presence, not claim correctness — claims were therefore judged against surrounding context wherever a window was narrow. Two known corpus-wide blind spots shape the residuals: no readable 0.4 metadata capture (S068 binary) and no 0.5 multi-entry-multiscales or labels-group capture, so 0.4-layout and equal-level-count behavior remain verified only via code and spec text.
