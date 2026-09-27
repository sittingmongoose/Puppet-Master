# Additions: lost observations, new findings, non-findings, decisions, unresolved items, coverage

## 1. Material observations the draft lost (restated with sources)

- A1. AGAVE scene count equals multiscales list size. AGAVE's `loadNumScenes` returns `multiscales.size()` (S098 lines 226-233), i.e. one scene per multiscales entry. The draft never states this mapping; it matters for the O-C3 multi-multiscales choice UI (scene-per-entry is the attested AGAVE precedent).
- A2. Mixed namespaced/flat metadata keys are unhandled territory. The v3 reader unwraps `attributes.ome` (S019 lines 87-90; S048 lines 166-170), but no source describes groups mixing namespaced and legacy flat keys (O-018 open question, S019). F1/F8 should add a taxonomy row: mixed-namespace group.
- A3. Bioformats2raw XML failure modes are open. The napari OME-XML parse path (S048 lines 348-365) has no stated behavior for missing `OME/METADATA.ome.xml` or non-numeric Image IDs (O-027 open question). F1's precedence needs a fallback row for these.
- A4. Which label channel survives the squeeze is unknown. Napari pops `channel_axis` and squeezes per level for label layers (S048 lines 707-716); for multi-channel label data the surviving channel is unstated (O-062 open question). F5 should require documenting this.
- A5. Whether 0.5 writers emit `dimension_names` is unknown. The spec MUST (S003 line 174) is clear, but writer compliance frequency is unattested (O-004 open question). F8's mismatch row needs a prevalence check on real filesets.
- A6. MoBIE is a second plate precedent the draft drops. The survey marks MoBIE plate support with no crash note (S043 lines 223-224); P17/F1 cite only vizarr. Plate navigation has two working implementations, one described pattern.
- A7. Validator `?schemas=` override. The validator accepts a custom schema-branch override (S031 lines 10-15). Useful for testing edge fixtures (e.g. scene-era schemas) in F12; the draft cites only the base URL pattern.
- A8. Resave shard-shape defaults explain real-world shards. Default shard shape is the full array shape, and shards over 100M pixels force explicit `--output-shards` (S034 lines 291-304). Expect full-shape single shards (cf. S038 line 58) in challenge-era filesets; F9 matrix should include a single-shard row.
- A9. PR123 merged May 2026, later than the draft's 2025 framing. The PR record shows merge of 33 commits on May 8, 2026 (S027 lines 126-132); O-049/P10 describe it as 2025-era. Behavior claims stand, but release-version questions (R6) must target post-May-2026 napari-ome-zarr releases.
- A10. Empty captures bound specific questions. S002 is 0 bytes (ngff latest/tools pages per catalog), S005 is a clone-cap refusal, S007 is HTTP 403 (each file line 1). Questions answerable only from the live latest/tools pages stay unresolved; an empty capture is absence of evidence, not evidence of absence.

## 2. New supported findings (from verifier's own checks)

- N1. OMERO multi-multiscales row is ambiguous, not negative. The survey's OMERO entry reports "All images imported but sample image is corrupted" with no supported field (S043 lines 311-313). Correct counts: 10x supported:no, 3x fail-to-open, 1x ambiguous.
- N2. Napari plate labels come from the first well's first field only. `PlateLabels.metadata` reads the label group under first-well/first-field (S048 lines 543-555) and enumerates that field's labels listing (S048 lines 513-527). Per-well/per-field label sourcing is undesigned.
- N3. Mixed-format rejection is write-path only. The v04/v05 mix exception (S013 lines 157-164) fires in write_image flows; the read path detects format and logs a version-mismatch warning (S019 lines 58-66). Discovery errors must use mismatch wording.
- N4. Background/cancel has no implementation precedent in the corpus. Lazy dask loads (S018 line 145; S048 line 202) prove laziness, not background scheduling with cancellation. F7's automatic half rests on Plan L7 alone.
- N5. v0.15 release confirms deprecation + download fix. v0.15.0 deprecates writing v01-v03 and fixes downloading 0.5 (S052 line 343); v0.16.0 adds sharding (S052 line 300). Pin behavior-drift claims to these tags.
- N6. Older AGAVE limits are TIFF/CZI-era, not OME-Zarr. The <=4 channels, time slider, 16-bit-only, first-sample-only, few-GB limits (S108 lines 4-29) describe the TIFF/CZI desktop viewer; the OME-Zarr dialog (S117 lines 101-128) claims only resolution/channel/sub-region choice plus memory estimate.

## 3. Correct non-findings (checked, correctly absent from required findings)

- The corpus contains no frequency data for translations, top-level transforms, multi-multiscales groups, custom hierarchies, or dtype histograms (R5 stands).
- The corpus never details what permissive-0.5/PR594 accepts (one-line release note, S052 line 128; R2 stands).
- The corpus never addresses read-path `compressor`-vs-`codecs` spelling acceptance (write-path only, S013 lines 166-186; R3 stands).
- The corpus never states the fixed napari reader's transform combination (R4 stands).
- The corpus never gives the validator's rule list (S031 is 15 lines; R7 stands) or the vizarr #307 root cause (issue open, S014), neuroglancer's later v3/shard support, Vol-E 0.5 support, or AGAVE out-of-switch dtype behavior (R6 stands).
- The corpus never demonstrates background loading with cancellation in any implementation (N4).

## 4. Grouped product decisions for the user

- D1. Navigation model (P-C1 + F1 + P17 as qualified). Options: (a) vizarr-style low-res overview plus drill-down (only fully described pattern, S043 lines 213-215); (b) MoBIE-style plates (working, undescribed); (c) per-well/per-field lists; (d) stitched canvas (crash/zero-fill risk). Recommendation: (a) with (c) as fallback; decide plate-label sourcing per N2.
- D2. Channel rendering (P-C2 + F3). Split-per-channel layers (napari, S048) vs blended composite (Viv, S025). Either satisfies Plan L5; decide before contrast-limit architecture.
- D3. Pyramid UX and bounding (P-C3 + F7 as qualified + F2). Automatic background/cancel (Plan-specified, no corpus precedent) vs explicit pre-load dialog with memory estimate (AGAVE precedent) vs hybrid low-res-first. TB-scale acceptance forces a bounding rule regardless.
- D4. Strictness posture (P-C4 + F8 as qualified). Strict schema rejection (S053/S016) vs permissive-with-notice (v0.19 spatial-data precedent, S052 line 128). Decide per taxonomy row; read-path version rows use mismatch wording (N3).
- D5. Overlay scope (P-C5 + F5 as qualified). Labels-only aligned layer (recommended; spec-defined) vs general multi-image overlay (3/11 viewers). Decide before transform/alignment work; translations (O-C4) and richer transforms (O-C5) are sub-decisions.
- D6. Optionals gate (O-C1..O-C8). None is required by brief/Plan; nearest to free are O-C2 raw fallback (reference precedent) and O-C7 finder browsing (shipped precedent). RO-Crate display (O-C1) only pays off on challenge-lineage filesets.

## 5. Unresolved and unchecked items

- Unresolved (corpus-insufficient, kept from draft): R1 labels-registration contradiction; R2 permissive-0.5 acceptance set; R3 read-path codec-spelling acceptance; R4 fixed-napari transform combination; R5 all real-world frequencies; R6 deferred reader gaps (PR123 TODOs in releases, #307 root cause, neuroglancer/Vol-E/AGAVE-dtype status); R7 validator rule coverage. Plus A2 (mixed-namespace groups), A3 (missing XML / non-numeric IDs), A4 (surviving label channel), A5 (dimension_names writer compliance).
- Unchecked by this verifier: large issue/API dumps (S015, S024, S026, S028, S035, S040, S047, S050, S051, S057, S063-S065, S073, S075-S076, S078-S095, S097, S099-S107, S109-S116, S118-S125), full 0.4 spec (S059), converter/webknossos remainders (S033-rest, S058-rest), PR/issue-body remainders (S004/S008/S013/S023/S027/S029-rests), S010 beyond head, S020, S096-context beyond grep lines, S098-rest. These could still move R2/R5/R6/R7; nothing in them is needed for the confirmed findings above.

## 6. Coverage

- Decisions: 129/129 blocks decided (B-001..B-129): 72 confirm, 10 qualify (B-015, B-019, B-021, B-022, B-026, B-030, B-050, B-060, B-065, B-091), 0 reject, 0 unresolved-as-decision, remainder not_a_claim (headings, method notes, validation proposals, B-116..B-128 bookkeeping ranges). R1-R7 items (B-109..B-115) are confirmed as correctly-unresolved statements.
- Sources read by verifier: S003 (full), S053, S054, S055, S056, S016, S018, S019, S043 (full), S034, S025, S031, S011, S014, S038, S044, S048 (lines 1-249, 329-380, 480-555, 600-722), S033 (lines 1-380), S058 (lines 289-398), S052 (tag lines + v0.12.0/v0.15.0/v0.16.0/v0.19.0 bodies), S072, S096, S098 (lines 195-275), S108 (head), S117 (lines 99-129), S061 (head), S062 (head), S070, S009 (head), S010 (head), S017 (head), S027 (lines 99-190, 259-290), S004/S008/S013/S023 (cited heads), S005, S007, catalog/brief/Plan/README, stage1 observations + draft-blocks (full).
- Corpus searches run: `594`, `spatial[ -]?data` (regex), `compressor`, `sharding`, `permissive`, `deprecat`, `tag_name` (regex), `dimorder|dimension_order|Order|order` (regex) in S098, `dimorder|dimOrder|T,C,Z|loadMultiscaleDims`, `3.0.8` in S027, `v0.15|writing v01|spatial-data ome|tag_name` (regex, no match), `dim|order|assume` in S098 (literal, no match); scope case/sources or the named file.
