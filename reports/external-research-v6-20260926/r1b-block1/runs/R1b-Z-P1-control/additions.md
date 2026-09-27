# Additions — independent verification pass (ome-zarr-thin)

Material from stage1/observations.md that the draft lost, findings established during verification, correct non-findings, grouped product decisions, and outstanding gaps. All line references were read directly in case/sources/ during this verification pass.

## 1. Corrections to the draft's source-handle inventory (verified)

- **The AGAVE grep extract cited as "S120" is actually S096.** S096 lines 25-28 contain the `renderlib/VolumeDimensions.cpp` four-dtype whitelist (int32, uint16, uint8, float32); S096 line 9 additionally pins **tensorstore v0.1.78** in AGAVE's CMakeLists (`URL .../tensorstore/archive/refs/tags/v0.1.78.tar.gz`), corroborated by the tag captures S076 and S116. S120 contains only "No literal matches. This does not establish semantic absence." (S120 line 1) — it is a failed search. This corrects B-019 (decided qualify) and the B-107 coverage lists.
- **S121 is not a failed capture.** S121 lines 1-9 contain AGAVE's `FileReaderZarr::getOmero` grep extract: the reader looks for omero first under the 0.5 namespace (`ome["omero"]`) and falls back to legacy top-level `attrs["omero"]` — a dual 0.4/0.5 omero lookup. The draft lists S121 as failed (B-107) and never uses this evidence.
- **Failed/empty captures re-confirmed by direct read** (each contains only an error string, no substantive content): S002 (0 bytes per catalog), S005 ("Clone exceeded 256 MiB..."), S007 ("Git metadata is not a document source"), S030 (403), S042 (404), S045/S046 (FileNotFoundError during clone), S077 (422), S095 ("Incomplete clone is not a source"), S120 ("No literal matches").

## 2. Material observations from stage1/observations.md that the draft lost

- **AGAVE's omero dual-layout shim (O-024, S121 lines 1-9).** The closest desktop analog reads omero from the 0.5 namespace first and falls back to the 0.4 flat attribute. The draft's 0.4/0.5 discussion (B-014) cites only the napari/ome-zarr-py dual reads. For a 0.5-only product this remains an optional capability, but its cost is small and the corpus mixes versions.
- **Exact version-string matching (O-025, S016 lines 13-21).** ome-zarr-py's `format_from_version` matches the string exactly (floats normalized via `str()`) and raises ValueError otherwise — so "0.5.0"-style or float version variants hit the error path in reference tooling. Slide Scout's version handling (B-089) should normalize before comparing.
- **Reader-side strictness of ome-zarr-py (O-028, S016 lines 296-365).** Validation enforces exactly one scale, scale FIRST in the list, vector length == ndim, numeric values, raising ValueError — the reference stack hard-fails on reorderings a viewer might prefer to salvage. Strictness per error class is a product choice; feeds the error-taxonomy consequence in B-055.
- **ome-zarr-py scene behavior unresolved (O-037, S009 lines 21-72).** The repo tree contains `ome_zarr/classes/scene.py` and sharding/transforms docs, but scene.py's content is not in the corpus — the draft's unresolved list (B-107) omits this item.
- **bioformats2raw synthesizes plates from raw acquisitions (O-049, S033 lines 459-503, 335-337).** ND2PlateReader groups multiple .nd2 files into a single HCS plate purely by filename pattern; BioTekReader likewise — so plate filesets are common even outside IDR, and TCZYX is the writer default since 0.3.0 with `--dimension-order` deprecated as producing invalid data. Relevant to B-059's producer set and B-009's plate fixtures.
- **The analog caps concurrent channels at four (O-062, S117 lines 26-28; S108 line 17).** Current AGAVE docs: "can present up to 4 channels concurrently"; the older HELP doc states the same cap with a 16-bit-unsigned limit. Concrete precedent that "channel visibility controls" (Plan line 5) does not imply unlimited concurrent channels, and for explicit capability-limit messaging.
- **AGAVE tracker has zero "shard" mentions (O-077, S102 lines 1-6).** A correct non-finding: textual absence is not evidence of capability or incapability (tensorstore may handle shards transparently). The desktop analog cannot serve as a tested sharding reference point either way.
- **Desktop packaging precedent (O-076, S091 lines 30-44).** AGAVE ships versioned installers (macOS arm64/x86, Windows) through v1.10.0 (2026-07-13) — desktop OME-Zarr viewing is a maintained product category; context for the product case.
- **Python-stack packaging constraints (O-079, S015 lines 47-63).** If building on ome-zarr: 0.19.2 requires Python >=3.12, zarr>=3.0.0, and ome-zarr-models>=1.8.1 — floors to plan for in the stack decision (B-088).

## 3. New supported findings (established during this verification)

- **S051 contains the RFC-5 proposal text, not just an index.** S051 lines 126-304 include the RFC-5 document itself: "Coordinate Systems and Transformations", document version 0.6.dev3, status "This RFC is currently in RFC state S3 (Update implementations)", overview, background, and user stories (registration/alignment, stitching/tiling, acquisition artefacts, annotation/analysis). This (a) corrects B-098's "RFC text not in corpus" (decided qualify) and B-107's "S051 grepped" characterization, (b) partially resolves the draft's carried-forward unresolved item (2), and (c) strengthens the 0.6-approaching signal alongside S052 (v0.19.0 0.6 PRs) and S035 (0.6rc0 schema issues).
- **AGAVE #84 has zero reactions** (S103 lines 60-64). The draft's "most-upvoted issue" framing (B-049, decided qualify) is unsupported; the issue remains open since 2023-02-09, which still evidences a long-standing uncancellable-blocking-loads pain point.
- **The multiple-multiscales matrix sample exists: 4995115.zarr** (v0.4, remote URL; S043 lines 277-283). "No multi-entry-multiscales fixture exists anywhere" (B-076, decided qualify) is overstated; the accurate gap is: none in 0.5, none local.
- **Proxy-failure evidence for the storage-related failure class** (S028 line 3080: "OME-Zarr does not run behind proxy"; body line 3127: aiohttp ignores HTTP_PROXY env vars). Additional corroboration for B-068's reasoning that the corpus's storage failures are remote-specific and out of scope by construction.
- **The tensorstore version behind the C++ route option is pinned in-corpus**: v0.1.78 (S096 line 9, with tag captures S076/S116). Sharpens the build-vs-library option list in B-088.

## 4. Correct non-findings

- **No consolidated-metadata obligation in 0.5.** "consolidated" does not appear anywhere in the S003 spec text (full read plus corpus grep); it exists only as an open question in ome-zarr-py's tracker (S028 lines 1609-1611, 1657). Absence of an obligation is established; absence of ecosystem relevance is not claimed.
- **S068 (the 0.4 .zattrs capture) supports no claim in either direction** — it is retained as opaque binary (S068 line 1). No 0.4-attribute-layout claim may rest on it.
- **S057 is an empty JSON array** — no vizarr release history, no AGAVE #220 comment content, and no tensorstore release list content is in evidence; no claims were made from it and none should be.
- **Zero "shard" hits in the AGAVE tracker (S102)** — absence of mentions is not evidence about AGAVE's sharding behavior (see §2).

## 5. Grouped product decisions for the user

1. **Discovery scope** (B-023/024/025/087): enumerate all images in a fileset (b2r series members, plate wells and fields, labels/label entry points, plain multiscale groups) and decide explicitly whether every multiscales entry is selectable (spec-faithful) or first-entry-only (ecosystem behavior). The multi-multiscales acceptance fixture must be synthesized locally (B-076 replacement).
2. **Zarr v3 storage strategy** (B-003/012/058/059/088/103): the observed 0.5 floor is sharding (incl. upcoming "auto") over bytes+{blosc, gzip, zstd, null} with crc32c indexes and explicit endianness. Choose the stack — tensorstore (v0.1.78 pinned by the analog) vs zarr-python >=3 vs a native minimal reader — and verify shard/codec coverage per version. Correctness first; performance tuning stays deferred pending measurement.
3. **Version policy** (B-004/089 + additions §2): read `attributes.ome.version` first, normalize strings, tolerate legacy placements (`multiscales[0].version`, plate/well/image-label), and decide strict 0.5-only vs SpatialData-style permissive; fail informatively on 0.6/editor's-draft markers.
4. **Level selection** (B-042..046/091): automatic choice requires level-geometry math (Z-downsampled levels, non-2 factors, centering translations, shard-aware reads) plus a manual override or picker with per-level memory estimates — the pattern the closest desktop analog ships.
5. **omero defaults and fallbacks** (B-028..031/095): specify the missing/partial-omero path (colors, names, windows, active flags, greyscale model, defaultZ clamping, computed contrast limits). Honoring omero faithfully is a differentiator; the fallback path is mandatory because producers legitimately omit it.
6. **Label overlays** (B-032..036): treat the labels-group listing as the source of truth, verify level counts/geometry at runtime, and give alignment its own acceptance fixtures (composed dataset+group transforms at two zoom levels).
7. **Error UX** (B-052..056): build a first-party error taxonomy (missing metadata, unreadable array, unsupported codec/shard/dtype/transform, version mismatch, inconsistent hierarchy) that names the offending node and keeps the image list usable; do not inherit library None-collapses.
8. **Plate presentation** (B-093): stitched-with-zero-fill vs well-by-well navigation is a conscious product choice; stitching must disclose synthetic zero regions if adopted.
9. **Channel concurrency** (additions §2, O-062): decide whether Slide Scout caps simultaneously-displayed channels (the analog's answer is four) — a display-capacity choice, not a format obligation.

## 6. Unresolved and unchecked items

- Reader-side auto-shard support/latency in current zarr libraries (S044 evidences the writer path; S049/S028 are title-only).
- Whether current viewer versions have fixed the O-050 matrix failures (matrix pinned April 2025, mostly v0.4 samples).
- Exact nature of the omero schema inconsistency (S035 line 3943 title only).
- Which bioformats2raw release first defaults to 0.5 output (S033 documents `--ngff-version {0.4,0.5}` and 0.4-convention defaults at capture; no default-change date).
- AGAVE's actual behavior on sharded files (S102 zero hits; untestable within the corpus).
- Rectilinear chunk grids in the wild (S109/S113 titles only; no sample in corpus; legality under 0.5 follows from S003 lines 67-72 unless disallowed, which it is not).
- Content of S068 (binary; unreadable in-corpus).
- Remainder of RFC-5's technical semantics beyond the S051 proposal text, and ome-zarr-py `classes/scene.py` behavior (file not in corpus; S009 tree only) — narrowed but open.
- Not independently re-verified in this pass beyond cited lines: the bulk title dumps S090, S097, S100, S101, S109, S112 (beyond cited titles), S114 (beyond cited titles); AGAVE issue bodies S110 (#395 "Failing to build on osx.") and S118 (#55 "load zarr") were spot-checked for identity only, consistent with B-107's coverage description but not load-bearing for any decided claim.

## 7. Coverage of this verification

- Every block B-001…B-107 in stage1/draft-blocks.md has exactly one decision in out/decisions.md (68 confirm, 5 qualify, 34 not_a_claim, 0 reject, 0 unresolved).
- Substantive claims were checked against the cited source lines read directly in this session: S003 (full spec text), S053, S054, S055, S056 (plus grep for version/acquisitions), S016, S018, S019, S048, S043 (full), S041, S010, S004, S059, S011, S014, S044, S013, S008, S029 (cited lines plus grep), S065, S015, S052, S024, S051, S017, S009, S023, S025, S062, S115, S072, S117, S108, S125, S103, S104, S105, S119, S081, S082, S083, S098, S096 (full), S120, S121, S102, S091, S111, S113, S058, S070, S033, S034, S022, S066, S067, S001, S050/S035/S028 (cited title lines plus targeted greps for "zip", "proxy", "consolidated", "Labels not loaded"), and the failed-capture set S005/S007/S030/S042/S045/S046/S068/S077/S095.
- Corpus searches run with ripgrep over case/sources/: `version|acquisition` (S056), `cxyz|\[1, 1, 1, 1, 1\]|...` (S029), `consolidated metadata|Labels not loaded` (S028), `"title"` sweeps (S028, S104, S105, S112, S114, S110, S118), `zip|Zip` and `proxy` (S028), `VolumeDimensions\.cpp` and dtype-equality patterns (all sources), `0\.1\.78` (all sources), `rotation|affine|displacement|sequence|coordinateSystems` (S004), `nd2|plate` (S033), `absolute|Save JSON` (S117), `RFC-3|RFC-4: Axis Orientation` (S051), `consolidated` (S003). Scope: the fixed corpus only; no live fetching.
- Result: 3 blocks corrected via replacement (B-019 wrong source handle S120→S096; B-049 unsupported "most-upvoted" superlative; B-076 overstated fixture-gap claim), 1 block corrected on a subsidiary reason (B-098 "RFC text not in corpus"), and the coverage inventory fixed (B-107: S096/S121 are grep extracts, S120 is the failed search). All other substantive blocks were supported as written.
