# Diagnostic review of the frozen proposal

**Target:** `inputs/seed/proposal.md`, SHA-256 `b50faea240a31cc53b4ec0a291defe944e88b08d57fe72766b341825e5bb0dc7`; associated lead catalog `inputs/seed/lead_inventory.json`, SHA-256 `e2aa174222501198afb33a30f71d2a0139c63f10e911047379c6e6c700fe7751`.

## Supported corrections

1. **CZI absence claim (seed L5; C4; support-boundary summary).** The seed says “tifffile does not read CZI” because CZI does not appear in the README. The complete tifffile README capture is the v2026.9.20 README (`cdd8ac84…`, S5); it positively lists TIFF-family reads and several TIFF-like formats but does not make an exhaustive statement that all unlisted formats are unsupported. The source module fetch returned only 524,288 of 988,932 bytes (S17), while the public GitHub code-search API request returned 403 rate limit (S18). Thus CZI support is **unresolved** in the inspected source scope. Preserve a v1 CZI exclusion as a product choice, but remove the library-wide negative. A current empty search result or wrong-path 404 would not settle it.

2. **NDPI/BIF overbroad exclusion (seed C4 and §11).** The same README explicitly says tifffile can read NDPI files above 4 GB and can read BIF/decode individual tiles, while saying BIF stitching is not performed (S5, Notes: NDPI and Ventana/Roche BIF). `CHANGES.rst` records BIF-series detection and a warning about unstiched tiles, and the v2026.9.20 changes mention NDPI fixes (S6). Correct “NDPI/BIF unsupported” to “the workspace may defer NDPI by product choice; tifffile documents NDPI reads; BIF tile reads are documented but BIF stitching is not.” This affects C4’s rationale and any claim that tifffile’s boundary itself excludes those formats. The team’s actual files still need validation.

3. **True negative and legitimate test target.** The v2026.9.20 README explicitly lists OJPEG compression, chroma subsampling without JPEG, color-space transforms, samples with differing types, and IPTC/ICC/XMP metadata as unimplemented (S5, TIFF Notes). This is a source-backed negative for the named features. A **valid OJPEG-compressed TIFF** is a legitimate proposed unsupported-feature fixture; arbitrary garbage or a nonexistent filename would only test malformed or missing input. No valid OJPEG fixture was supplied and no such test was executed.

4. **404 interpretation.** The frozen capture requested `.../CHANGELOG.rst` and received `404: Not Found` (S13). The captured repository root names `CHANGES.rst` (S12), whose complete capture contains the actual history (S6). The 404 is a path mismatch, not proof that release history or a capability is absent. The same distinction should appear in application errors: `MissingInput`, `UnsupportedFormat/Feature`, `MalformedInput`, and `UnrecognizedInput` are separate states.

5. **Issue-to-fix-to-test chain retained with bounds.** Issue #319 reports `PixelSizeX` about 1.4208 under v2026.2.20 and about 1.4208e−9 under v2026.2.24 (S7). Test commit `7d9eaedd` adds `test_issue_tvips_pixelsize` with the expected nm values and issue URL (S9); fix commit `edede600` removes the nm-to-m conversion and cites the issue (S8); the changelog and release commit pin v2026.3.3 and the correction (S6, S10). Commit parentage supports test → fix → changelog → release ordering. Preserve the calibration lesson and pin-specific recommendation. Limits: do not infer every intermediate release's runtime behavior without a matrix; the upstream regression fixture is a private test asset; this Goal did not run the upstream test suite. Issue #54 plus its changelog fallback entry is useful ambiguity evidence, but no matching fix/test commit chain was established (S6, S11).

## Valid proposal ideas preserved

- Keep original image bytes read-only and separate display mapping from sample data, while treating viewer documentation as precedent rather than app-level proof [S2, S5].
- Retain named axes/units, explicit coordinate convention and a provenance trail for geometric correction/resampling [S1, S3, S7-S10].
- Use chunk/tile-oriented access as a reader mechanism, but keep 3 GB latency/memory claims as an unverified app assumption [S2, S5].
- Keep a project-level identity/relocation policy and make export coordinate units/origin explicit [S14-S16].
- Keep selected codecs and 2–5 axes as a deliberately small application boundary if desired. Those are **product choices**; tifffile documents OME-TIFF up to 8 dimensions and several broader TIFF capabilities, and its v2026.9.20 documentation lists more codecs than the seed v1 selection [S5].
- Keep OME-NGFF, napari, tifffile, and QuPath as independent precedents: format contract, viewer mechanisms, TIFF reader behavior, and project/export structure, respectively [S1-S5, S14-S15]. Do not promote every competitor feature into v1.

## Uncertainty and dependencies

The CZI source/test search is incomplete; no conclusion about complete tifffile CZI support is adopted. VMS behavior, standalone OME-Zarr v0.4/v0.5 interoperability, and exact lab-file axis/calibration behavior remain unverified. The source docs do not prove bounded 3 GB performance, app save correctness, cancellation, or SMB/NFS durability. POSIX `rename(2)` describes useful replacement behavior but includes `EXDEV` and NFS caveats; W3 from the seed was not re-executed here [S16]. The seed’s W1–W3 execution records lack code/input in this Goal’s receipt stream, so the current proposal does not present them as current execution evidence.

## Affected candidate dependencies and revisions

- Reword L5 as “CZI is outside the proposed app v1; tifffile support is unresolved from this search.”
- Revise C4/§11 to distinguish documented tifffile support from the workspace’s chosen admission boundary; explicitly state BIF stitching as the known limit.
- Keep OJPEG as the supported true negative and add a valid unsupported-input fixture proposal, clearly UNEXECUTED.
- Add a missing-path discriminator so missing input cannot be mistaken for unsupported image format.
- Keep all performance, transform/export round-trip, crash/recovery, relocation, and per-instrument calibration checks proposed/UNEXECUTED until an application and fixtures exist.
