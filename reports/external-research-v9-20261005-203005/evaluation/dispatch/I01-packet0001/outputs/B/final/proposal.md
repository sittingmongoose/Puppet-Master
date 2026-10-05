# Proposal — Local Biomedical Image Review Workspace

- Stage: fresh final author deliverable (candidate stage I-01, revision a001, brief A)
- Date: 2026-10-05
- Status: standalone current proposal. It supersedes the frozen research-stage deliverable by resolving all supported critique findings (F1–F11); §13 records each resolution.
- Evidence catalogs: `sources.json` (S1–S19), `witnesses.json` (W1–W3 executed by this stage, V1–V8 proposed/UNEXECUTED), `leads.json` (L1–L12).
- Labeling convention used throughout:
  - **[FACT Sx]** — external fact read from a pinned public source (see `sources.json`).
  - **[INFER]** — engineering inference by the candidate, not a fact of any cited product.
  - **[CHOICE]** — a product decision this team could reverse.
  - **[EXEC Wx]** — check executed by this stage's candidate in an isolated stdlib-only sandbox; **[VALIDATION Vx]** — proposed check, UNEXECUTED.
- Source-pin stability note [FACT S1–S16]: all 16 frozen catalog sources were re-fetched by this stage on 2026-10-05 (21:43–21:46 UTC) and reproduced byte-identically against the frozen catalog sha256 values; S12's cited v0.2.x–v0.3.x entries were additionally verified by reading byte range 65536–98304 of the capture. S17–S19 are new pins captured by this stage. Branch-head pins (napari/docs@main, tifffile@master, qupath@main) are moving pins — the content sha256 recorded in `sources.json` is the pin of record; future work should prefer release/tag pins.
- No full application was built; nothing below claims application-level behavior. Executed checks are isolated component checks only.

---

## 1. Executive summary

Six researchers need a desktop workspace where a project bundles references to immutable local images, per-image geometry (axes, units, transforms), display state, and annotations, and where every geometric or unit operation is an explicitly recorded transformation. The plan adopts **four independent precedents**, each contributing one load-bearing mechanism:

1. **OME-NGFF 0.5 (OME-Zarr) specification** — the *data contract*: named axes with types and UDUNITS-2 units, and per-level `coordinateTransformations` restricted to `scale` and `translation`, applied sequentially in order, with any `translation` required to come *after* `scale` (a translation is optional; only its placement is mandatory) [FACT S1].
2. **napari** — the *viewer architecture precedent*: display mapping (contrast limits) is metadata that "do[es] not change the underlying values of the image"; layers accept lazy NumPy-like arrays so data is fetched just before display; multiscale lists; per-layer `scale`/`units` in world coordinates; shapes as a list of NxD vertex arrays with per-shape style properties [FACT S2, S3, S4].
3. **tifffile** — the *bounded-I/O and metadata-precedence precedent*: one maintainer-supported reader for TIFF/BigTIFF/OME-TIFF/ImageJ/MMStack/NDTiff and more, reading strips/tiles/pages/SubIFDs/pyramidal levels as NumPy or Zarr arrays, memory-mapping contiguous data, and resolving ambiguous in-file metadata with explicit precedence rules [FACT S5, S6].
4. **QuPath** — the *project/relocation/export-honesty precedent*: a small JSON `project.qpproj` referencing image servers by URI plus a per-entry `data/` directory; documented per-machine `.qpproj` copies for shared drives; and an explicit export contract — GeoJSON/ROI coordinates are pixel units with origin at the top-left of the **full-resolution** image, and this "may be different from how other software expects" [FACT S13, S14].

**Why these are independent precedents [INFER]:** they are four unrelated projects/specifications — a community-governed format spec (OME/NGFF), a Python desktop viewer application (napari), a single-maintainer Python reader library (tifffile), and a Java desktop application (QuPath) — whose mechanisms (geometry schema, display/data separation with lazy access, bounded tile I/O plus metadata precedence, project/relocation/export contract) were developed and tested independently of each other. A mechanism that all four converge on from different directions (e.g. explicit, versioned geometry metadata) is unlikely to be an artifact of one codebase.

The required issue→fix→regression-test chain is **tifffile issue #319**: release 2026.2.24 silently changed the meaning of TVIPS `PixelSizeX` by dividing by 1e9 ("convert nm to m") without changing any unit label; a downstream maintainer filed #319 with a reproducible value change (1.4208036661148071 → 1.4208036661148072e-09); the maintainer removed the conversion in commit `edede600`, added regression test `test_issue_tvips_pixelsize` asserting the file-native nanometer values in commit `7d9eaedd`, and released v2026.3.3 in commit `503cb4eb` [FACT S7–S10]. This is precisely the failure class the brief warns about ("lose calibration context"); it motivates the central rule of the data contract: **calibration is stored as (value, unit) pairs in file-native units, and any unit or geometry change is a recorded, user-visible transformation — never a silent coercion.**

Architecture in one paragraph: a **project directory** (small JSON files: `project.json`, `sources.json`, `annotations/*.json`, `derived/`, ignorable `cache/`) over a **reader service** that serves bounded tiles/chunks from source files opened read-only, behind a **frame model** that pins pixel→physical mapping in float64 with explicit units, under a **command-stack UI** (undo/redo) whose display settings live only in project state. Saves use write-temp-then-`os.replace` per file plus a recovery sweep of orphaned temp files; exports are generated artifacts with an honest manifest of what is preserved.

## 2. Minimum workflow coverage (brief → design)

| Brief step | Where it happens | Key rule |
|---|---|---|
| Create project | `project.json` created atomically; empty `annotations/` | Project file is small; never embeds image bytes |
| Import without rewriting originals | Source registry records absolute path or file URI, size, sha256, format kind; file opened read-only | Reader service never holds a write handle to source; import failure leaves at most a project entry flagged `unresolved` |
| Inspect metadata & provenance | Metadata pane shows parsed metadata **plus a verbatim copy** of original metadata blobs (OME-XML, ImageJ string, TVIPS header, ...) | Original metadata is retained in `sources.json`; the UI distinguishes "as read" vs "as corrected" |
| Navigate & adjust display | View state (visible channels, window/level, slice/time, zoom) in project state only | Contrast/window edits never touch samples [FACT S2 wording adopted as invariant] |
| Annotate | Points/polygons/masks with scope (`plane{z,t}` / `volume` / `acquisition`), styles, undo/redo | Coordinates stored in **pixel-index float64** + the source frame definition; physical µm derived, not duplicated as authority |
| Save / close / reopen elsewhere | Atomic per-file save; relocation rules; bundle vs reference choice | Reopen on machine B resolves via relocation rules (§7.4) |
| Export table / overlay / derived image | Exporter writes CSV/GeoJSON/PNG **plus `export-manifest.json`** | Manifest states coordinate space, units, CRS status, transform chain applied, and source identity hash |
| Verify what transformed vs unchanged | Every derived artifact records its recorded-operation chain; source hash checked at export | "Unchanged" = source sha256 unchanged and annotations referenced to that hash |

## 3. External facts (source-backed)

### 3.1 Geometry vocabulary — OME-NGFF 0.5 and 0.4 [FACT S1, S17]

From the NGFF 0.5 specification (`ome/ngff-spec` at `d9164040`, v0.5, W3C CG-FINAL, 2025-01-28):

- `axes` entries: `name` MUST be unique; `type` SHOULD be `space`/`time`/`channel`; `unit` SHOULD be a UDUNITS-2 string from a fixed list (e.g. `micrometer`, `nanometer`, `second`). 2–5 dimensions; axis order MUST match array order and MUST be ordered time, channel/custom, then space; `zyx` ordering SHOULD be used when a volume has two in-plane axes [FACT S1, §"axes", §"multiscales"].
- `coordinateTransformations` are a list applied **sequentially and in order**; only `identity`, `translation`, `scale` (or `path`) are allowed in the multiscale context; each dataset MUST contain exactly one `scale` giving pixel size in physical units; it MAY contain exactly one `translation`, and if a `translation` is given it MUST come **after** `scale` (so it is expressed in physical coordinates); group-level transforms apply after dataset-level ones [FACT S1, §"coordinateTransformations", §"multiscales"]. Design consequence: the project's frame schema may keep `origin` as an always-present default-zero field, but interoperable NGFF export must not emit a mandatory translation.
- Multiscale `datasets` are ordered largest → smallest; each level's `scale` expresses the pixel size (or the factor relative to level 0) — i.e. geometry is per-level and explicit [FACT S1].
- Transitional `omero` metadata carries per-channel display: `color` (6 hex digits) and `window {start, end, min, max}`, plus `rdefs.defaultZ/defaultT` — i.e. the ecosystem already has a small, deployable format for "how to display a channel" that is explicitly *not* pixel data [FACT S1, §"omero"].
- Label images (masks) are integer-valued sibling arrays under `labels` with color/property metadata under `image-label` [FACT S1, §"labels"].
- Storage: NGFF 0.5 uses Zarr v3 (`zarr.json`) [FACT S1, §"Storage format"]. NGFF 0.4 mandates the other half of the versioning reality any importer must state: "Arrays MUST be defined and stored in a hierarchical organization as defined by the version 2 of the Zarr specification", with group/array attributes in `.zattrs`/`.zgroup`/`.zarray` files per its layout diagrams [FACT S17, §2 "On-disk (or in-cloud) layout"].

**Why it matters:** the brief demands that origin, axis order, orientation, sampling, scale and display transforms be representable with enough precision to reopen and export reliably. NGFF gives a tested, community-governed schema for exactly the axes/units/scale/translation subset, and its *restrictions* (no free-form matrices in multiscales; strict ordering) are lessons in keeping the contract checkable by a small team.

### 3.2 Viewer architecture — napari [FACT S2, S3, S4]

From napari's docs (napari/docs@main, captured 2026-10-05):

- **Display mapping is not data:** contrast limits map data values onto the colormap; "the values set in the contrast limits do not change the underlying values of the image, only the visualization of the colormap." Large data should have limits set explicitly because auto-computing min/max can be very costly [FACT S2, §"Adjusting contrast limits"].
- **Bounded, lazy access:** image layers accept any NumPy-like array (NumPy, dask, xarray, zarr); napari "will also wait until just before it displays data onto the screen to actually generate a NumPy array", enabling browsing of >100 GB zarr stores [FACT S2, §"Image data and NumPy-like arrays"].
- **Multiscale:** a multiscale image is a list of arrays of decreasing shape; napari picks the level from zoom/viewport; a `locked_data_level` property can pin it [FACT S2, §"Multiscale images"].
- **Channels:** `channel_axis` splits an nD array into per-channel layers, each with its own colormap/contrast limits [FACT S2, §"Loading multichannel images"].
- **Units and world space:** `scale` and `units` are per-layer metadata; scale transforms data coordinates into world coordinates for both vector and raster layers; units use Pint with aliasing (`um`/`µm`/`micrometer`); the scale bar is tied to world units and falls back to pixels; units do not rename axes (labels vs units are distinct metadata) [FACT S3].
- **Shapes (annotations):** a shapes layer is a list of NxD vertex arrays; five shape types (`Lines`, `Rectangles`, `Ellipses`, `Polygons`, `Paths`); per-shape face/edge color, edge width, z-index; vertex insert/remove; copy-paste across slices updates non-displayed coordinates to the new slice; in 3D rendering, a shape displays only if all of its non-displayed coordinates match the view slice, and the adding/selecting/editing tools are disabled in 3D (2D only) [FACT S4].

**Why it matters:** napari demonstrates that the brief's hardest UX invariants (display-vs-data separation, bounded reading, nD slicing, per-slice vs 3D annotation semantics) are implementable with a layer/world separation — and it documents the sharp edges (3D editing disabled; auto-contrast cost on big data).

### 3.3 Bounded I/O and metadata precedence — tifffile [FACT S5, S6, S11]

From tifffile README (v2026.9.20) and CHANGES.rst:

- Reads TIFF, BigTIFF, OME-TIFF, ImageJ hyperstack, Micro-Manager MMStack/NDTiff, MetaMorph STK, Zeiss LSM, SVS/NDPI/SCN/BIF slides, EER and more; data can be read "as NumPy arrays or Zarr arrays/groups from strips, tiles, pages (IFDs), SubIFDs, higher-order series, and pyramidal levels" — i.e. bounded, region-scoped reads without decoding whole files [FACT S5].
- Contiguous ImageJ data can be memory-mapped (`memmap`); a Zarr store over a TIFF exposes tile reads (`z['0'][2, 0, 128:384, 256:]`) and dask chunking — the concrete mechanism for a 3 GB source on a 16 GB machine [FACT S5, examples].
- OME-TIFF: "The UTF-8 encoded OME-XML metadata found in the ImageDescription tag of the first IFD defines the position of TIFF IFDs in the high-dimensional image data" — the geometry lives in a sidecar XML, not in the raster [FACT S5, Notes].
- ImageJ hyperstacks carry shape/calibration in a Latin-1 `ImageDescription` (dims, `spacing`, `unit`, `finterval`, `axes`) [FACT S5, examples].
- Metadata precedence is explicit and has evolved: CHANGES 2020.8.13 "Use tifffile metadata over OME and ImageJ for TiffFile.series (breaking)"; 2021.1.14 "Try ImageJ series if OME series fails (#54)" — issue #54 ("can not parse positions from ome-tiff generated by micro-manager", filed 2021-01-14 by bryantChhun via an image.sc thread, closed 2021-01-15) shows a real OME-declared series that produced inconsistent shapes ((50,5,3,2048,2048) vs a partial (510,2048,2048)) and the fallback policy that resulted [FACT S6, S11].
- The support boundary is honestly stated: OJPEG, chroma subsampling without JPEG, color-space transforms, differing sample types, IPTC/ICC/XMP are not implemented; many vendor quirks are enumerated as *known* (NDPI wrong tags correctable via tag 65441, Philips padded widths, ScanImage >2 GB recovery, MMStack "often corrupted or wrong", BIF tiles un-stitched) [FACT S5, Notes].

**Why it matters:** this is a realistic template for the brief's "support boundary a small team could test and maintain": prefer tile/page-bounded reads over whole-file decodes; record which metadata family won (OME vs ImageJ vs shaped) and keep the original strings; treat ambiguity as a surfaced decision, not a guess.

### 3.4 Project layout, relocation, export honesty — QuPath [FACT S12, S13, S14, S16]

From QuPath 0.7.0 docs (stable per S16) and CHANGELOG:

- `project.qpproj` is a JSON list of entries; each has a **serverBuilder** (reader library, e.g. OpenSlide or Bio-Formats, plus the URI of the image), a unique **entryID**, and names. Per-entry `data/<id>/` holds `data.qpdata` plus `summary.json`, "written at the same time as data.qpdata", so previews don't open the large file [FACT S14].
- Relocation is a first-class topic: duplicate `.qpproj` files per computer are an officially documented pattern for shared drives where image paths differ per machine [FACT S14]; historically "Unable to resolve project URIs when moving a project across file systems (#543)" (v0.2.2) and "Project cannot be loaded if no previous URI is available (#568)" (v0.2.2) were real failures; v0.6.0 stopped prompting when projects are self-contained ("Self-contained projects that contain all images inside the project directory no longer prompt the user to update URIs if moved", PR #1668) [FACT S12].
- Durability failures are documented: "Closing QuPath abnormally can result in broken data files (#512)" (v0.2.1) and "PathIO doesn't restore backup if writing ImageData fails (#1252)" (v0.5.0) — i.e. even a mature project format needed an explicit backup-and-restore discipline [FACT S12].
- Export contract is explicit: "All of the shape export methods below define coordinates in pixel units, taking the origin (0, 0) as the top left corner of the full-resolution image ... may be different from how other software expects the origin and units to be defined"; GeoJSON forces ellipses to polygons; labeled-image export has draw-order semantics (later-provided labels overwrite earlier ones per pixel) [FACT S13].
- Calibration/transform failures recur: "Experimental AffineTransformImageServer did not update pixel calibration values (#528)" (v0.2.1); "The requestedPixelSize option for TileExporter calculated the wrong downsample (#648)" (v0.3.x); "TileExporter with ImageJ TIFF can lose pixel size and channel color information (#1516)" (v0.6.0); "Using the lowest resolution image for brightness/contrast settings can be problematic (#1958)" (v0.7.0) [FACT S12].

**Why it matters:** QuPath shows the second-order costs the brief worries about — path relocation across machines, partial writes, exports that silently lose calibration — and shows the mitigations (entry IDs decoupled from names, per-machine project files, summary sidecars, explicit export coordinate contracts).

### 3.5 Atomic replacement semantics — POSIX rename(2) [FACT S15]

From the Linux man-pages 6.19 page (dated 2026-02-08):

- "If `newpath` already exists, it will be atomically replaced, so that there is no point at which another process attempting to access `newpath` will find it missing." And on failure, "rename() guarantees to leave an instance of `newpath` in place."
- Cross-filesystem rename fails with `EXDEV` ("rename() does not work across different mount points, even if the same filesystem is mounted on both").
- NFS caveat (directly relevant to this team's shared storage): "On NFS filesystems, you can not assume that if the operation failed, the file was not renamed." The page adds that the application is expected to deal with this.

### 3.6 GeoJSON conformance status — RFC 7946 [FACT S19]

- §3.1.1: positions are "longitude and latitude, or easting and northing, precisely in that order"; §4: "The coordinate reference system for all GeoJSON coordinates is a geographic coordinate reference system, using the World Geodetic System 1984 (WGS 84) datum, with longitude and latitude units of decimal degrees"; the previous version's alternative-CRS mechanism was removed.
- §7.1: implementations MUST NOT change the semantics of GeoJSON members; §8: "A specification that alters the semantics of GeoJSON members or otherwise modifies the format does not create a new version of this format; instead, it defines an entirely new format that MUST NOT be identified as GeoJSON."
- §4 also concedes the practical carve-out this team actually needs: "where all involved parties have a prior arrangement, alternative coordinate reference systems can be used without risk of data being misinterpreted." §6.1 allows foreign members, with reduced interoperability.
- **Consequence for this design [INFER from S19, S13]:** emitting plain pixel x/y under the `GeoJSON` name is, strictly, *not* RFC 7946 GeoJSON — QuPath does it anyway and documents the caveat [S13]. Our exporter therefore treats "GeoJSON" as a prior-arrangement profile: it stays machine-readable for lab tooling, and the export manifest MUST state `crs: "pixel-index, non-geographic; NOT RFC 7946 WGS84 lon/lat"` plus the origin/units contract. A strictly-conformant WGS84 mode would be meaningless for microscopy and is not planned.

### 3.7 The issue → fix → regression-test chain (required lesson)

**Failure.** tifffile release 2026.2.24 changed TVIPS tag parsing: the issue's reproduction shows `read_tvips_header` dividing `PixelSizeX/Y` and `PhysicalPixelSizeX/Y` by 1e9 ("convert nm to m"), so downstream consumers received meters where release 2026.2.20 had returned nanometers [FACT S7]. (The changelog entry for 2026.2.24 lists a `TiffPages` refactor and CLI rewrites but does not name TVIPS; the TVIPS attribution rests on the issue reproduction, not the changelog [FACT S6, S7].)

**Issue.** 2026-02-26, `ericpre` (hyperspy maintainer) filed issue #319, exact title **"Breaking changes in parsing tags changed in release 2026.2.26"**, with a reproducible file (`TVIPS_bin4.tif`, reporter-attached) and both outputs: `PixelSizeX: 1.4208036661148072e-09` (tifffile 2026.2.24) vs `1.4208036661148071` (2026.2.20) — a ratio of 1e9 to within float64 rounding, i.e. nm silently reinterpreted as m with no unit-label change [FACT S7]. Note the issue title names release 2026.2.26 while the reproduction outputs attribute the change to 2026.2.24; the fix commit's version bump (2026.2.24 → 2026.3.3) corroborates the 2026.2.24 attribution — a real-world example of exactly the metadata sloppiness this proposal designs against.

**Fix.** 2026-03-03, commit `edede6002c817f056d75125ade0b20332d549cca` ("Update tifffile/tifffile.py") replaces the conversion block with `# https://github.com/cgohlke/tifffile/issues/319` / `# do not convert nm to m`, commenting the conversion lines out; the same commit bumps `__version__` to 2026.3.3 and embeds the revision list "Do not convert TVIPS pixel sizes to m (#319)." [FACT S8]. **The fix commit is not single-purpose:** it also adds CCITT read support, packints changes and imshow fixes (+126/−25 across `tifffile.py`) [FACT S8].

**Regression test.** Commit `7d9eaeddc710af068f9e8c2cf30b10a7d0e5c938` ("Update tests/test_tifffile.py", authored 10 minutes before the fix commit, whose parent it is) adds `test_issue_tvips_pixelsize` — docstring "Test read TVIPS PixelSize is nm.", citing the issue URL, gated on `SKIP_FILE`, asserting `tvips['PixelSizeX'] == 1.4208036661148071` and `tvips['PhysicalPixelSizeY'] == 15600.0` for the reporter's file — and adds the same-value assertions (`PixelSizeX == 162.0779266357422`, `PhysicalPixelSizeY == 15600.0`) to the existing `test_read_tvips_tietz_16bit` [FACT S9]. That test commit likewise bundles unrelated work (new CCITT read tests, PyPy cleanup) — with single-maintainer, multi-purpose commits, per-issue regression tests are the only durable guard.

**Release.** The commits listing shows the exact ordering `2798a136 → 7d9eaedd` (tests, 18:56:28Z) `→ edede600` (fix, 19:06:33Z) `→ 8c91499e` (CHANGES.rst, 19:08:41Z) `→ 503cb4eb` "Release v2026.3.3" (19:14:38Z); CHANGES.rst carries "Do not convert TVIPS pixel sizes to m (#319)." under 2026.3.3, and the release notes state "Pass 5137 tests" [FACT S8, S10]. The tests landed *before* the fix in the same maintenance burst — the parent-commit chain is direct evidence, not inference from timestamps.

**Applicability.** Projects pinning tifffile 2026.2.20–2026.3.2 for TVIPS files received meters instead of nanometers; the corrected semantics hold from v2026.3.3 onward. For the proposed workspace this is the canonical argument for: file-native (value, unit) storage; import-time unit confirmation UI; recorded unit conversions; and pinning reader versions with a calibration regression fixture per instrument [INFER from S7–S10].

**Limits of the chain.**
- The maintainer works directly on master without PRs; both commit messages are generic. The issue→fix linkage is carried by (a) the issue URL in the code comment, (b) the changelog `(#319)` reference, (c) the test docstring/URL — not by a PR merge record; and the commits bundle unrelated work.
- The regression test depends on `tests/data/tvips/TVIPS_bin4.tif`, which does **not exist in the public repository**: `GET repos/cgohlke/tifffile/contents/tests/data/tvips` returns HTTP 404 (captured this stage) [FACT S18]; the reporter linked the file as a GitHub user-attachment. tifffile's policy of separating public from private test files dates to CHANGES 2019.3.8 ("Separate public from private test files (WIP)") [FACT S6]. The test therefore cannot be re-run from the public repo alone.
- A previous, related chain (issue #54 → "Try ImageJ series if OME series fails (#54)", release 2021.1.14) is documented in the changelog and issue record [FACT S6, S11], but no individual fix commit or specific regression test was retrieved for #54; no commit→test chain is claimed for it.

## 4. Engineering inferences [INFER]

1. **Two coordinate spaces, one authority.** The workspace keeps *pixel/index coordinates* (float64, per axis, in stored array order) as the annotation authority, plus a *frame definition* per source (axis names/types/units, per-axis scale and origin, optional full affine for orientation) that converts to physical units. Physical coordinates are always derived on read/export. This mirrors NGFF's data→physical mapping [S1] and napari's data→world scale [S3].
2. **float64 or nothing.** W1 shows float32 at ~1×10⁵ px already loses ~1.6×10⁻³ px; JSON round-trips binary64 exactly. So the project schema requires IEEE-754 binary64 (JSON number or float64 arrays) for all stored coordinates and transforms; float32 is legal only inside renderers.
3. **Transform order must be a schema constant.** W2 shows translate-then-scale vs scale-then-translate differ ((22,84) vs (12,24) for the same point). The project schema therefore stores, for each source, either (a) NGFF-style per-axis `scale` then `translation` (ordered list), or (b) a full affine with a pinned column-vector convention `p_world = A·[p,1]` and an explicit `convention` field — never both unnamed.
4. **Display state is quarantined.** Window/level, channel visibility, LUTs, zoom are view-state only, following napari's documented behavior [S2] and NGFF's `omero` window block [S1]; a code-level rule forbids any write path from view state into source readers.
5. **Bounded access is a reader-service property, not a viewer nicety.** Tile/chunk reads via a Zarr-like store over TIFF (tifffile `return_as='zarr'`) or via OME-Zarr chunks, an LRU chunk cache (~512 MB–1 GB, configurable), prefetch of the current viewport only, and cancellation tokens per request. A second full in-memory copy of a 3 GB source never exists by construction: decoded tiles are the only materialized form [INFER from S2, S5].
6. **Atomicity has OS-supported building blocks and known limits.** Write-temp-then-`rename` per project file gives atomic replacement with old-file preservation on failure [S15]; W3 confirms the practical pattern in-sandbox, including that a crashed save leaves an orphaned temp file (observed) that the recovery sweep must handle. Because `EXDEV` forbids cross-mount renames and NFS weakens failure assumptions [S15], temp files must be created in the target directory, and the shared-storage case additionally warrants the QuPath-style sidecar backup (`annotations.json.bak` from the previous successful save) [INFER from S12 #512/#1252, S15].
7. **Identity = content hash at import.** The source registry records sha256 (streamed at import) + size + path + URI; every annotation set and export references that hash. On reopen, re-hashing a few MB (or size+mtime+hash-on-demand) detects silent file replacement. W3 shows hash sensitivity to any byte change.
8. **Export honesty is a manifest problem.** Following QuPath's documented coordinate/origin contract [S13] and the RFC 7946 status analysis [S19], every export ships `export-manifest.json` declaring: coordinate space (pixel indices, origin at pixel (0,0) corner), units of every column, `crs` status (`"pixel-index, non-geographic; NOT RFC 7946 WGS84 lon/lat"` for the GeoJSON profile), the exact transform chain applied (or "none"), which channels/window (if any) were baked into rendered outputs, and the source sha256. Consumers should never need to ask "same image?" again — the brief's stated disagreement.
9. **Unsupported input must fail into the project, not out of it.** A failed/ambiguous import registers the source with `status: unsupported|ambiguous`, stores the verbatim original metadata blob, and blocks annotation until the user records an explicit correction (which is itself a recorded, revertible operation). This generalizes tifffile's #54 fallback experience [S6, S11] into a user-visible policy.
10. **Original vs derived is a *visible* distinction, not only a provenance record.** [INFER, closes a coverage gap] The viewer rule: an original-data view is titled with its source ID and carries a persistent text badge `SOURCE`; a derived view is titled with its derived-image ID, badged `DERIVED`, and names the recorded-operation chain that produced it; badges are text-plus-shape (never color-only); the status bar always names the data space on screen. Testable (V7).

## 5. Product choices [CHOICE] (reversible decisions)

- **C1 — Native project format is a directory of small JSON files, not OME-Zarr and not SQLite.** Human-inspectable, diff-friendly, trivially atomic per file. (Alternative bounded in §8.3.)
- **C2 — Annotation authority in pixel-index float64; frame definition per source.** Physical units are derived. (Alternative: authoritative µm coordinates — rejected: resampling or calibration corrections would then invalidate annotations; pixel indices survive level changes when paired with the frame definition.)
- **C3 — Desktop: Python + Qt (PySide6) + an OpenGL canvas via VisPy**, reusing napari's *patterns* (not embedding napari) for v1. Rationale: team knows Python; reader ecosystem (tifffile, zarr, imagecodecs) is Python-native [S5]; single GUI thread + worker threads for I/O. (Full alternative bounded in §8.2.)
- **C4 — v1 read formats (support boundary):** plain tiled/multi-page TIFF (uncompressed, LZW, Deflate), OME-TIFF (single-file, up to 5D, tile or strip, uncompressed/LZW/Deflate), ImageJ hyperstack TIFF (incl. >4 GB contiguous), OME-Zarr 0.4 (Zarr v2 [S17]) and 0.5 (Zarr v3 [S1]) read. Everything else: explicit unsupported path. Writer/export formats: CSV table, GeoJSON pixel-index profile (with the manifest CRS notice of §3.6), 8/16-bit PNG/TIFF overlays and derived images, OME-TIFF for derived rasters. Justification: tifffile documents these as first-class and testable paths [S5]; NGFF 0.4/0.5 are both in active ecosystem use [S1, S17]; excludes stitching-required slide formats (NDPI/BIF overlap), OJPEG, and proprietary axes — each enumerated as unsupported with a reason [S5].
- **C5 — Bundle vs reference is a per-source import choice:** *reference* (default; record absolute path + URI; relocation dialog on reopen) or *copy into project* (`data/` subtree, allowed only ≤ ~1 GB per file in v1; project then relocates silently like QuPath self-contained projects [S12]). A `.birw-bundle` zip export concatenates the directory for exchange.
- **C6 — Undo/redo is a per-project command stack** (annotation add/edit/delete/move/vertex; style apply; recorded correction ops), persisted as an `oplog` ring buffer (last 200 ops) so undo survives reopen. Styles are named records (color, edge width, fill alpha, z-order) referenceable by annotation rows.
- **C7 — Accessibility floor:** all canvas operations reachable via keyboard (arrow/`[`/`]` slice stepping, `+`/`-` zoom, tool hotkeys, focus order through panels); every metadata/error surface is text (no color-only status); contrast-checked theme; errors carry the failing source ID, expected vs found values, and the recovery action. This is a floor, not the full WCAG audit (§10).

## 6. Architecture (primary proposal)

```
<project>/
  project.json          # schema_version, name, created, app versions, view-state snapshots
  sources.json          # per-source registry (see §7.2)
  annotations/
    <source-id>.json    # annotation rows for that source + oplog tail
  derived/
    <id>/               # recorded-operation outputs (small images), each with provenance.json
  exports/              # generated, regenerable, never authoritative
  cache/                # chunk cache + orphan temp files; fully deletable
  backups/              # previous-good copies of project/sources/annotation files
```

Components (single process, worker threads for I/O):

1. **Reader service** — opens sources read-only; exposes `read_region(source, level, z, t, bbox)`; implementations: `TiffBoundedReader` (tifffile zarr store / page-tile reads), `OmeZarrReader` (zarr 0.4/0.5). Chunk LRU + prefetch; cancellation token per request; progress events.
2. **Frame model** — per source: axis list (name, type, unit), stored-axis order, per-axis scale/origin (NGFF-style), optional affine + convention field; pixel↔physical conversions; the only component that multiplies scales.
3. **View controller** — channels/visible, window/level per channel, displayed slice/time, zoom/pan; subscribes to reader for tiles; writes only to view state. Enforces the §4.10 visible original-vs-derived rule (SOURCE/DERIVED badges, status-bar data-space label).
4. **Annotation store** — rows `{id, kind: point|polygon|mask, scope: plane{z,t}|volume|acquisition, coords_px_f64[...], style_id, labels, created_by, created_at, source_hash}`; masks stored as run-length or PNG-in-project (small) rather than full raster; per-source JSON file + oplog.
5. **Op recorder** — every mutation (annotation edit, unit correction, resample, channel-derive) appends a record `{op, params, inputs(hash), outputs(hash), timestamp, tool_version}` to the source's provenance chain; undo/redo and the export manifest both read this chain.
6. **Exporter** — CSV/GeoJSON-profile/PNG + manifest per §4.8; refuses to export when the on-disk source hash ≠ recorded hash unless `--allow-drift` is set (then it stamps the drift in the manifest).
7. **Recovery** — on open: delete `cache/*.tmp` older than session start (orphans, as observed in W3), compare `backups/` when a JSON file fails schema validation, and surface a project-health report.

## 7. Data contract (v1)

### 7.1 Coordinate systems and precision
- `pixel`: index coordinates in **stored axis order**, origin at pixel (0,0), one unit = one sample step; float64 only. This matches the QuPath-documented export convention (origin = top-left of full-resolution image) [S13].
- `physical`: derived `physical_i = pixel_i * scale_i + origin_i` per axis (order pinned as in the W2 discussion); units from the frame definition (UDUNITS-2 strings per NGFF [S1]).
- Frame definition fields: `axes: [{name, type, unit}]`, `scale: [f64...]`, `origin: [f64...]` (default zeros; emitted only when non-zero in NGFF export, per §3.1), optional `affine: {matrix: [f64], convention: "column_vector_row_major"}` and `affine_applies_to: "pixel"`; `ambiguous_metadata: {verbatim_blob, reason}` when import needed a user correction.
- All JSON numbers for coordinates/transforms are binary64; consumers must not truncate to float32 (rationale W1).

### 7.2 Source registry entry
`{source_id, kind, uri, resolved_path, size_bytes, sha256, sha256_scope: "whole-file", axes_frame (§7.1), native_metadata_verbatim: {...}, reader: {library, version}, imported_at, import_policy: "reference"|"copy", status: "ok"|"unsupported"|"ambiguous"}`.

### 7.3 Annotation scoping
`scope: {type: "plane", z: int, t: int}` | `{type: "volume", t?: int}` | `{type: "acquisition"}`. Rendering: plane rows render only on their plane; volume rows render on all z of one timepoint; acquisition rows always render. (Mirrors napari's slice-match rule for nD shapes [S4], made explicit per row instead of implied by coordinates.)

### 7.4 Reopen and relocation
Order: (1) resolved_path exists and hash matches → open; (2) path missing → search recorded directory and project-relative candidates; (3) user picks new file → re-hash must **match** to relink silently, else a mismatch dialog offers "accept new identity (annotations marked suspect)" or "keep unresolved"; (4) `import_policy: "copy"` sources resolve inside the project and relocate silently [pattern per S12, S14].

### 7.5 Save, recovery, and the 3 GB rule
- Save = for each dirty file: serialize → write temp **in same directory** → `fsync` → `os.replace` → then rotate previous good file into `backups/` [S15; QuPath-side justification S12 #512/#1252].
- Recovery on open: schema-validate; on failure restore `backups/` copy and report; sweep `cache/` orphans.
- Interrupted export: exporters write into `exports/<id>.partial` then rename; a crash leaves the old export intact and a `.partial` for cleanup.
- 3 GB target: no component materializes more than (viewport tiles × bytes) + cache; imported source is never copied except by explicit user choice; annotated-region reads are tile-scoped [INFER from S2/S5; benchmark plan V2].
- Cancel/progress: every reader/export request carries a cancellation token; UI shows byte-range/percent progress; cancel leaves partial temp files only.

### 7.6 Unsupported/ambiguous input path
Reader returns `UnsupportedInput(reason, verbatim_metadata)` or `AmbiguousInput(conflicts: [{family: "ome"|"imagej"|"tvips", values}])`. UI shows the conflicts side by side (legible text, no color-only) and lets the user pick one family or "treat as uncalibrated" — the choice is recorded as a correction op; original blobs stay in `native_metadata_verbatim`. The project always opens; the source is marked; annotation on that source is blocked until resolved. (Generalizes tifffile #54/#319 experience [S6–S9, S11].)

## 8. Alternatives (bounded)

### 8.1 Alternative A — store calibration/geometry natively in OME-Zarr 0.5 and make it the project interchange format
Adopt NGFF 0.5 wholesale for sources *and* derived images, keeping annotations in the JSON project. Pros: exact-standalone geometry vocabulary [S1]; growing tool support — tifffile's ZarrTiffStore exposes multiscales metadata conforming to NGFF 0.5 as of 2026.5.2 (breaking change) [S5, S6], and QuPath 0.6+ reads *and writes* OME-Zarr (PR #1474) [S12]. Cons: tifffile itself does not write standalone OME-Zarr filesets (its README write list is TIFF/BigTIFF/OME-TIFF/ImageJ only [S5]), so writing OME-Zarr 0.5 derived images means zarr-python assembling the NGFF group metadata directly against the spec [S1] — a real dependency and schema-assembly cost, not a free win; zarr directory trees are not atomic as a whole (no single-file rename); heavier for six-person sharing; and NGFF label/annotation models cover raster labels, not vector rows. **Verdict:** use NGFF as *derived-image and interchange* format (opportunity, §9.1), not as the project store.

### 8.2 Alternative B — build on napari directly (embed or plugin)
Pros: the display/data separation, lazy arrays, multiscale, shapes, and units machinery already exist and are documented [S2–S4]; a napari plugin would reach v0 faster. Cons: inherits Qt+VisPy+plugin machinery the team doesn't control; annotation persistence would still be entirely ours; version churn is real (docs at `main` move; behavior between releases changes — cf. tifffile's own breaking 2026 releases [S6]). **Verdict:** keep as the fallback if custom canvas work overruns; recorded as L2.

### 8.3 Alternative C — single-file project (SQLite or one JSON)
Pros: one file to relocate; atomic whole-project saves. Cons: merge/diff hostility, one corrupt file kills all state (contrast QuPath's per-entry split with summary sidecars [S14]), and JSON blobs in SQLite re-create the schema problem anyway. **Verdict:** rejected for v1; revisit only if annotation counts make per-source files unwieldy.

## 9. Opportunity and alternatives note (brief requirement)

- **Opportunity (justified): OME-Zarr 0.5 as the derived/export geometry format.** Because NGFF 0.5 already standardizes axes/units/scale/translation and channel windows [S1], exporting derived images + calibration as OME-Zarr makes the workspace's outputs first-class citizens of Bio-Formats/napari/QuPath pipelines, and its versioned spec protects against silent semantic drift — the #319 failure class [S7–S9]. Cost is honest but bounded: the writer is zarr-python assembling NGFF 0.5 group metadata (tifffile exposes NGFF-0.5 multiscales only over TIFF stores, it does not write standalone OME-Zarr [S5, S6]); QuPath demonstrates the interop target by reading and writing OME-Zarr since 0.6 [S12].
- **Plausible alternative: QuPath as the platform** (Java/OpenCV/Bio-Formats, whole-slide strengths, project+GeoJSON+backup machinery already field-tested [S12–S14]). Rejected for v1 because the group's data is microscopy volumes/time-series more than slides, and the team's language is Python; retained in `leads.json` (L3) as the pragmatic fallback if slide-format breadth becomes a requirement.

## 10. Accessibility

Keyboard: full navigation and annotation without mouse (documented hotkey map; all single-key tool shortcuts live behind an explicit "keyboard mode" toggle to avoid capture conflicts). Feedback: metadata and errors in a scrollable text pane with monospace value dumps (copyable), never color-only; error entries include source_id, expected/found, and the recovery action. The SOURCE/DERIVED badges of §4.10 are text-plus-shape, not color-only. Contrast: theme meets 4.5:1 for text. This is a stated floor; a full WCAG audit is a proposed later activity (noted as a validation gap in `leads.json`, not claimed here).

## 11. Critical assumptions and unsupported cases

- **Assumption A1:** tifffile+zarr (or equivalent) delivers tile-latency adequate for review on the 8-core/16 GB envelope for the team's actual files. UNVERIFIED by execution — this is the single most load-bearing performance assumption; V2 tests it first. tifffile's design (tile/page-level reads, memmap, dask chunks) is *consistent* with the target [S5] but no benchmark was run. **Effect if wrong:** the reader service abstraction exists precisely so a second implementation (e.g. pre-tiled OME-Zarr conversion at import) can replace the direct-TIFF path without touching the frame model or UI.
- **Assumption A2:** NFS/shared-storage semantics observed by rename(2) docs (atomicity caveats, failure≠not-renamed [S15]) are acceptable with temp-in-same-dir + backups; V3 (kill-during-save on the actual share) must confirm. **Effect if wrong:** the bundle export (C5) plus local-workspace/save-to-share sequencing becomes the supported mode instead of in-place shared saves.
- **Assumption A3:** instrument calibration in the team's files is trustworthy enough that per-source user confirmation at import (once, recorded) is not a recurring burden. The #319 chain shows even maintained readers get units wrong [S7–S9]; if the team's files are worse, import friction rises and C2 may need a per-instrument preset table.
- **Unsupported in v1 (explicit):** CZI/NDPI/VMS/BIF stitching, OJPEG, chroma-subsampled JPEG, >5D arrays, float16 axes, non-UDUNITS units, anisotropic tile grids, annotations on derived images that were later regenerated (must re-derive or re-attach) [S5 boundary; CHOICE C4].
- **Out of scope:** in-place source modification, cloud sync, concurrent multi-writer editing, automatic segmentation/registration (leads L9–L10).

## 12. Validation

### Executed by this stage's candidate
Isolated stdlib-only sandbox; receipts in `witnesses.json` with code/stdout sha256 and exit codes. *Component checks only — they do not establish application behavior.* (Equivalent checks were also executed and receipted by the research-stage candidate; `witnesses.json` records both.)

- **W1** (`exec-k5j_1d86`, exit 0) coordinate precision: float32 storage of a 104857.6 px coordinate errs 0.0015625 px (physical error ~1.5×10⁻⁴ µm at 0.065 µm/px); binary64 JSON round-trip is bit-exact; the float32 value itself survives JSON (loss is at storage width, not serialization) → §7.1's float64 rule.
- **W2** (`exec-ygfz3rwq`, exit 0) transform order: with t=(10,20), s=(2,4), p=(1,1), translate→scale = (22,84) and scale→translate = (12,24); orders unequal → §4.3's schema-constant transform order.
- **W3** (`exec-54y7y15g`, exit 0) atomic save: temp-in-same-dir + `os.replace` leaves the old project file byte-identical after a simulated mid-save crash and **strands an orphan `.tmp` file (observed)** → §6.7's recovery sweep; sha256 identity stable and byte-sensitive → §4.7.

### Proposed, UNEXECUTED
- **V1** reopen round-trip: project moved to a second machine/directory reopens; annotations identical to the bit; relocation dialog appears only when expected.
- **V2** 3 GB bounded-read benchmark on the envelope: p95 tile latency <100 ms at review zoom; peak RSS <4 GB; cancel takes effect <250 ms (tests A1).
- **V3** kill -9 during save and during export on the shared filesystem; verify old state opens and `.partial`/temp cleanup works (also probes the NFS rename caveat [S15]; tests A2).
- **V4** export→reimport assertion: GeoJSON/CSV coordinates re-parse to the stored float64 values bit-exactly; manifest matches applied transform chain.
- **V5** cross-filesystem relocation (`EXDEV` path): save falls back to copy+rename safely [S15].
- **V6** port of the tifffile #319 regression approach: a per-instrument calibration fixture asserting file-native units through our import path (mirroring `test_issue_tvips_pixelsize`), so a reader upgrade that changes unit semantics is caught before annotations are made [S9, S18].
- **V7** original-vs-derived visible distinction: open a source view and a derived view; assert the UI presents a non-color-only, text-readable indicator distinguishing them (DERIVED title/badge + provenance pointer), e.g. via a UI-tree/DOM dump containing the derived identifier.
- **V8** GeoJSON manifest conformance notice: assert every GeoJSON-profile export carries the manifest `crs` notice of §3.6 and the pixel-origin/units contract (the RFC 7946 text itself is now verified and pinned [S19]; only the exporter assertion remains).

## 13. Critique resolution record

How each supported finding from the critique stage was resolved (IDs refer to `inputs/prior/critique/critique/review.md`):

| Finding | Resolution |
|---|---|
| F1 [MAJOR] | §8.1/§9.1/L1 rewritten: ZarrTiffStore exposes NGFF-0.5 multiscales as of 2026.5.2; tifffile does not write standalone OME-Zarr (README write list re-verified [S5]); standalone writing requires zarr-python [S1]. |
| F2 | Header now counts V1–V8. |
| F3 | §3.6 quotes the exact title "…release 2026.2.26" and states the title-vs-body discrepancy with the fix-commit corroboration. |
| F4 | §3.1 now cites S17 (NGFF 0.4 page, captured this stage) for the Zarr-v2 half; the `.zattrs` detail is taken from S17's own layout diagrams. |
| F5 | §1 item 1 reworded: any `translation` required to come *after* `scale`; §3.1 and §7.1 note translation is optional and NGFF export must not emit a mandatory translation. |
| F6 | "ratio 1e9 to within float64 rounding"; napari shape types pluralized; 2026.2.24 TVIPS attribution phrased as resting on the issue reproduction, not the changelog. |
| F7 | §3.6 adds that the fix commit bundles CCITT/packints/imshow work, and that the test commit likewise bundles unrelated tests. |
| F8 | §3.6 limits cite S18 (tests/data/tvips → HTTP 404, captured this stage). |
| F9 | §1 adds the precedent-independence argument. |
| F10 | §4.10 adds the explicit SOURCE/DERIVED viewer rule; V7 added. |
| F11 | Header pin-stability note added; content sha256 declared the pin of record for branch pins. |
| (new) L7/V8 | RFC 7946 fetched and pinned (S19); lead L7 upgraded from UNVERIFIED to source-backed; §3.6 states the conformance consequence; V8 reduced to the exporter-manifest assertion. |

Preserved supported content: the NGFF/napari/tifffile/QuPath/rename(2) fact base, the #319 chain, the architecture, data contract, alternatives, accessibility floor, assumptions, and validation plan are carried forward from the frozen research deliverable (verified byte-identically by both the critique stage and this stage) with the corrections above applied. No unsupported assertion was strengthened: A1–A3 remain explicitly unverified; the executed witnesses are component checks only.

## 14. Source index

Full pins, locators, and capture identities in `sources.json` (S1–S19; all re-verified or newly captured by this stage on 2026-10-05). Headline pins:
- S1 NGFF 0.5 spec, `ome/ngff-spec@d9164040` (v0.5, 2025-01-28), sha256 `7ca44265…`.
- S2–S4 napari docs (`napari/docs@main`, captured 2026-10-05): image.md `2897310c…`, units.md `ef71dd31…`, shapes.md `d1c391de…`.
- S5–S6 tifffile README v2026.9.20 (`cdd8ac84…`) and CHANGES.rst master (`fd4abd60…`).
- S7–S10 tifffile issue #319 (`0b200363…`), fix commit `edede600` (`fb9c86d8…`), test commit `7d9eaedd` (`c7a90e96…`), commits window (`a5e2ca8b…`).
- S11 tifffile issue #54 (`654ab708…`).
- S12 QuPath CHANGELOG.md main (`c2ce5425…`; cited entries verified in byte ranges 0–32768 and 65536–98304).
- S13–S14, S16 QuPath 0.7.0 docs: exporting_annotations (`df12ec58…`), projects_structure (`d4369157…`), docs index (`2e5b0725…`).
- S15 rename(2) man page, man-pages 6.19 (`8772946a…`).
- S17 NGFF 0.4 specification page (`ca4780a3…`, 163120 bytes; storage clause read at bytes 60000–100000).
- S18 tifffile `tests/data/tvips` contents → HTTP 404 (`e45906ce…`).
- S19 RFC 7946, The GeoJSON Format (`cb52f07b…`).
