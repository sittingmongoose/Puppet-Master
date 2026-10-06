# Research proposal — local-first field observation & map exchange tool ("FieldBook", working name)

Stage: research (ER9 confirmation brief H2). Date: 2026-10-06. Candidate-authored.
Labeling: **[FACT]** = stated by a captured public source (pin in `sources.json`, cited as [Sx]); **[INFERENCE]** = my engineering reasoning from facts; **[CHOICE]** = product decision this proposal makes; **[UNCERTAIN]** = unresolved. Execution labels: **executed by candidate** (isolated stdlib sandbox, receipts in `witnesses.json`) vs **proposed/UNEXECUTED**.

This is an implementable proposal, not a mapping product. Nothing here is emergency navigation or a hosted service.

---

## 1. Scope and method

The brief asks for a local-first fieldwork app for a small environmental survey group: import a bounded map area plus a local observation table, record points, short tracks, notes and optional photos offline, reopen on another machine, combine a colleague's diverged copy, export a table + map overlay, with originals intact and no silent data loss.

Discovery method: I selected public primary sources myself across five mechanism families (spatial index, projection/transform, changeset merge, tile container, data licensing) rather than whole-product competitors, per the protected-discovery rule. Precedents carried to depth: **SQLite R*Tree** [S1], **SQLite Session changesets** [S12], **pyproj/PROJ transformation layer** [S2, S3] with a real issue→fix→regression chain [S6, S7]. Whole-product evidence (Mergin Maps docs [S13]) was found but its body content was not machine-readable in my capture, so it is recorded as a lead, not a supporting claim.

Two tiny synthetic witnesses were executed by me in the admitted isolated sandbox (stdlib arithmetic only; no PROJ, no SQLite involved): W1 antimeridian track discontinuity, W2 divergent-merge semantics. Their scope is component-level illustration, not proof of application behavior.

## 2. Product shape and session workflow [CHOICE]

- **Desktop/tablet local app**; one project = one directory bundle (`project.fb/`) containing a SQLite database plus media files; the whole directory is the exchange unit (USB stick/shared disk between surveyors).
- Typical session mapped to brief: open project → provenance/CRS inspector on load → search/preview records (paged, bounded) → add/edit observation offline → save (commit) → copy bundle to another machine → **combine** a colleague's bundle → export table + overlay. Original imported files are never modified: imports land in immutable `sources/` with content hashes; all editing happens in the derived store.

## 3. Data model and identity

**[CHOICE]** Identity is layered and permanent:

- `project_id` — UUID generated at project creation; bundles carry it; combining two bundles with different `project_id`s is refused as "not the same project" (no heuristic adoption).
- `record_id` — UUID per observation/track/note; stable across edits, merges and exports. Row autoincrement integers are internal only and never exported as identity.
- `edit_id` — every committed change appends one row to `edits` (append-only oplog): (edit_id, record_id, op ∈ {create,update,delete}, field-level old/new values, actor device id, wall-clock timestamp, base_state_hash). The `observations` table is a materialized projection of the oplog.
- Revision: per-record `rev` = count of applied edits; per-merge: records carry `last_common_rev` vs each diverged copy (see §7).
- Provenance per record: source import batch id, source file SHA-256, original row number, import CRS + axis order + units as observed, transform descriptor id (§5), altitude reference and time reference with their provenance class (measured / device-declared / unknown).

**[FACT]** The SQLite session extension requires declared PRIMARY KEYs and silently ignores rows with NULL primary-key values [S12 §1.3]. **[INFERENCE]** Therefore record UUIDs are stored in a declared `TEXT PRIMARY KEY` column, and NULL in that column is impossible at the schema level; the oplog projection keeps session-style changesets well-defined.

## 4. Coordinate contract: stored vs displayed vs exported

**[CHOICE]** Four distinct coordinate spaces, explicitly separated:

1. **Stored coordinates** — the record's geometry in its *record CRS* exactly as imported/entered (axis order, angular/linear units, and altitude reference pinned in provenance). Stored values are never rewritten in place by a CRS change.
2. **Working geographic coordinates** — a derived, recomputable cache in WGS 84 lon/lat (x=lon) used for indexing and export defaults; always rebuildable from (1) + the recorded transform descriptor.
3. **Displayed coordinates** — projection of (2) into the map view (Web-Mercator tile space for the MBTiles basemap, §10) *at render time only*.
4. **Exported coordinates** — generated from (1) or (2) at export time, with the export CRS, axis order and units written into export metadata.

**[FACT]** PROJ respects the axis order defined by the CRS authority (ISO 19111); EPSG:4326 is latitude-first, and "most GIS software" does not follow the standard; PROJ < 6 did not either; the `proj` utility itself expects lon/lat [S2 #why-is-the-axis-ordering-in-proj-not-consistent]. **[FACT]** pyproj's Transformer warns that "the axis order may be swapped" and offers `always_xy` to force traditional GIS order (lon,lat / E,N), added to `from_crs` in pyproj 2.2.0 [S3]. **[FACT]** Real users are still burned by this: closed issues #1377 (WGS 84 → Swiss LV95 EPSG:2056 printed inverted coordinates) and #1368 are labeled "Issue related to axis order changes introduced in PROJ 6" [S4, S5].

**[CHOICE]** Internally the app *always* calls transforms with `always_xy=True`, converts to/from record axis order only at the record-provenance boundary, and stores axis order explicitly per record. This single choke point is the anti-#1377 measure.

**A displayed pin is not proof of correct export** — treated as a requirement, not a slogan: export re-derives coordinates from stored values through a recorded transform, then runs a round-trip check (re-transform export → record CRS; reject/flag if distance exceeds tolerance) and writes the transform descriptor id into export metadata. **[FACT]** Transformer exposes `accuracy` ("-1 if unknown") and `area_of_use` [S3]; exports of records outside the transform's area of use are flagged. **[INFERENCE]** This catches the "pin looked right, export drifted" class structurally.

Altitude and time: altitude reference (ellipsoidal vs orthometric/geoid) and time reference (UTC offset, device clock trust) are provenance-class fields; records with unknown altitude/time provenance are displayed with an explicit "unknown reference" badge, never silently assumed. **[UNCERTAIN]** Geoid transformations (e.g. EPSG:4979↔EGM) depend on downloadable grids and have a history of environment-dependent silent failures [S8, S9]; v1 treats vertical transformation as opt-in and clearly labeled.

## 5. CRS/geometry support boundary and transformation versioning

**Support boundary [CHOICE]:**
- CRSs: whatever PROJ accepts as WKT2 or EPSG codes via pyproj `CRS` [FACT: PROJ accepts WKT/WKT2/PROJ strings; WKT2 preferred because PROJ-string round trips lose information and "potentially leading to erroneous transformations" — S2 #what-is-the-best-format].
- Geometry types v1: point, polyline (track), text note attached to a point; optional photo attachment. No polygon editing, no topology. Bounded and stated.
- Unknown/ambiguous CRS metadata (e.g. a CSV with coordinates but no CRS, or grid/local CRS not in EPSG): the import stops in a **bounded correction dialog** — choose among candidate interpretations (crs-explorer/projinfo-style lookup is what PROJ recommends for CRS lookup [S2 #which-crs-apply]), preview the interpreted extent on the map, or accept import as "CRS UNKNOWN — not placed". Untyped guesses are prohibited; "CRS UNKNOWN" records stay visible, searchable and unplaceable.

**Transformation versioning [FACT+CHOICE]:** every applied transform is persisted as a descriptor: (source CRS WKT2, target CRS WKT2, PROJ pipeline string or EPSG operation code, `always_xy=true`, accuracy, area of use, PROJ version, proj.db/EPSG database version, grid file names + SHA-256 if any). **[FACT]** PROJ loads `proj.db` from `PROJ_DATA` (formerly `PROJ_LIB` before PROJ 9.1) [S2 #why-am-i-getting-the-error-cannot-find-proj-db], and pyproj user environments report explicit `EPSG Database: v11.022` / `PROJ DATA (recommended version)` versions [S8 body]. **[CHOICE]** Re-open validation: if the runtime descriptor no longer matches the stored descriptor (different EPSG version or missing grid), the project opens in "revalidation needed" state; coordinates are shown from store, but transforms are re-run only after the user accepts re-derivation, and the change is logged. **[FACT]** Gridded transformations may require network downloads at first use (pyproj #1474: grid "download on the fly" broke between pyproj 3.6.1 and 3.7 in clean environments; a `files.geojson` manifest in the user data dir was involved) [S8], and a 2026 defect (#1644, open, milestone 3.8.1) can make transforms **silently return `inf`** when a grid download fails due to a freed CA-bundle path [S9]. **[CHOICE/INFERENCE]** Therefore: for offline use, all grids named by a project's transform descriptors must be pre-downloaded at map-area import time; after every transform, output is checked for non-finite values and records whose transform produced non-finite output are quarantined, never displayed as placed.

Validation of transformations (proposed, UNEXECUTED as product code): a fixed corpus of (CRS pair, point, expected) cases pinned to specific EPSG codes including lat-first targets like EPSG:2056 and EPSG:4326, asserting the always_xy contract; equivalence tests mirroring the shape of the upstream regression tests [S6] (pipeline vs TransformerGroup agreement).

## 6. Edge cases (bounded, per-case behavior — no invented universals)

- **Near coordinate/domain boundary:** records whose stored coordinates fall outside the transform's declared area of use, or outside the imported map bounds, are placed but flagged `OUT_OF_BOUNDS` with the reason; they are never clipped away. **[FACT]** Transformers expose `area_of_use` [S3]; PROJ documents CRS USAGE/BBOX in WKT2 [S2].
- **Tracks spanning a discontinuity (antimeridian, projection zone edge, raster-less region):** segments are split where consecutive stored points imply an unphysical jump (heading/length heuristic with a generous threshold), rendered as separate segments, and exported as the original uninterrupted geometry with a `rendered_split` annotation. **Executed by candidate (W1):** naive midpoint interpolation of lon 179.99 → −179.99 lands at lon 0.0 (~19,100 km per side; 32,469 km path vs 2.127 km true segment; ratio ≈ 15,267×), while longitude unwrapping yields lon −180.0 and the true path. Scope: pure stdlib arithmetic demonstration of the failure mode; it validates the hazard, not any product code. **[UNCERTAIN]** Zone-edge (e.g. UTM boundary) crossings get a distance-tolerance flag, not a split; the threshold needs field tuning.
- **Incomplete coordinates:** missing lat/lon/altitude/time → record imported with `PLACEMENT_INCOMPLETE`, excluded from the spatial index, listed in the record browser with reasons; completing it is a normal edit that moves it out of quarantine.
- **Conflicting identifiers:** duplicate `record_id` in one import → hard import error for that row (quarantined, reason shown); same external key (`site_code`) on different records → flagged as possible duplicate for human resolution (§7), never auto-unified.
- **Sample preview ≠ valid import:** **[CHOICE]** preview is explicitly labeled "random sample of N rows"; import validation runs full-file structural checks (column typing, CRS resolvability, coordinate range checks, per-row errors) and reports total counts before commit; the import is transactional — commit or nothing, with the error report preserved.

## 7. Revision, duplicates, merge, recovery

**Append/edit/delete semantics [CHOICE]:** edits are oplog appends (§3); delete is a tombstone edit (no row removal); undo = append of an inverse edit (UI-level undo of the last local unshared edits). **[FACT]** The SQLite session extension's changesets record INSERT/DELETE/UPDATE with old and new values, changesets can be **inverted** to undo a session, and combined via changegroup [S12 §1, §2.1, §4]. **[INFERENCE/CHOICE]** v1 implements this merge contract in the app layer (portable across SQLite builds; see dependency caveat below) using session-style field-level three-way semantics:

1. Each bundle records, per record, the `base_rev` the other copy diverged from (written at exchange time).
2. Merge = compare (base, copy A, copy B) field-by-field: single-sided change applies cleanly; both-changed-same applies once; both-changed-differently → conflict.
3. **Conflicts are explicit.** **Executed by candidate (W2):** last-writer-wins on two divergent note edits silently discarded copy B's edit (`LWW silently dropped B's edit: True`), while the explicit three-way comparison produced one inspectable conflict record (base/copy_a/copy_b all preserved) and kept the committed base value pending resolution; an uncommitted draft (rev 0, no commit marker) was classified `uncommitted` at reopen and kept out of the merged set. Scope: synthetic dict-based model; demonstrates the semantics contract, not product code.
4. Duplicate detection: candidate pairs (same site_code, or distance ≤ tolerance within a time window) are surfaced as `POSSIBLE_DUPLICATE` with side-by-side view; resolution is a user action creating an explicit link edit. No automatic dedup.
5. Failed records are never hidden: every rejected/quarantined row persists in a `rejects` table with reason, source hash and row number; merge reports list applied/conflicted/rejected counts per source bundle. Provenance is never rewritten to make a merge succeed.

**Recovery after interrupted save/import/merge [FACT+INFERENCE]:** all writes go through staging tables; a merge writes `merge_state` rows and flips one commit marker in the final transaction. On open, the app finds staged-but-uncommitted work, classifies it *incomplete* (distinct UI section), and offers resume/discard; committed records never mix with staged ones. **[FACT]** For the R*Tree specifically, SQLite documents `rtreecheck()` for integrity checking [S1 §7.2] — run at open after a crash; a failed check triggers index rebuild from the observations table (the index is derived, never authoritative). **[FACT]** Changeset application under the session extension either applies or aborts with configurable conflict handling (omit change / abort all / apply despite conflict) [S12 §2.2] — the "abort all" mode is what makes the marker-flip design sound. **[UNCERTAIN]** SQLite WAL/rollback behavior across power loss is trusted platform behavior here; an explicit crash-injection test suite is proposed (§13) and UNEXECUTED.

**Re-import and relocation [CHOICE]:** re-importing a byte-identical source (same SHA-256) is a no-op with an "already imported" report; a changed source creates a new import batch with lineage, never overwrites. Media (photos, MBTiles) are stored content-hashed under `media/` and referenced by relative path + hash; moving the project directory or renaming a drive cannot orphan records — a missing file is shown per record with a "re-link" action (hash-based match).

## 8. Architecture

- **Core (local library):** storage (SQLite), oplog/merge engine, CRS service, import/export workers. No network dependency at runtime except optional grid pre-fetch.
- **UI:** desktop GUI with map canvas + record browser; offline state is the only mode (a persistent "OFFLINE — everything is local" banner; no hidden cloud calls).
- **CRS service:** pyproj ≥ 3.8.0 over PROJ ≥ 9.x (binding below), single choke point, always_xy, non-finite output guard.
- **Index:** `observations` plain table (session-compatible) + `obs_rtree` R*Tree virtual table storing id + bbox only, maintained in the same transaction as commits; rebuildable.
- **Map renderer:** MBTiles basemap reader + overlay of derived GeoJSON for the current viewport.
- **Export workers:** streaming, cancellable.

## 9. Scale plan — 250,000 observations on 4 cores / 8 GB (engineering target, not a benchmark)

**[FACT]** SQLite's R*Tree is a virtual table doing bounding-box range queries "even if the R*Tree contains many entries"; it "does not normally provide the exact answer but merely reduces the set of potential answers from millions to dozens"; coordinates are stored as 32-bit floats by default with outward rounding (lower bounds down, upper bounds up), so *contained-within* queries must slightly expand their query box (docs suggest 0.000012%); `rtree_i32` stores 32-bit integers instead; auxiliary `+` columns exist since SQLite 3.24.0 but their constraints/affinities are ignored; you cannot reliably modify an R*Tree mid-scan (SQLITE_LOCKED) [S1 §3–§5].

**[INFERENCE/CHOICE]** Consequently:
- Viewport query = R*Tree coarse pass (expanded query box for contained-within semantics; buffer in projected working space) → exact filter on candidate ids via the plain table. Both stages bounded with LIMIT and paged.
- 32-bit float roundoff is acceptable for a *filter* because the exact stage re-checks full-precision stored coordinates; the docs' expansion factor is applied at the R*Tree stage.
- Query-then-update flows materialize ids first (temporary table), avoiding mid-scan writes [S1 §3.5].
- Cache invalidation: a monotonic project `change_counter` bumped per commit; viewport render caches keyed by (change_counter, viewport, zoom) so nothing stale survives a merge/undo.
- Import of 250k rows: batched transactional inserts, progress + cancel checked per batch; R*Tree populated in the same batches.
- Export: streaming by id ranges, cancellable, progress in record counts; never materializes the whole table in RAM.
- Search: indexed columns (site_code, timestamps) + LIMIT; full-text search is an optional lead.
- **[UNCERTAIN]** A 250k-row synthetic-project benchmark (viewport latency, export throughput, memory ceiling) is proposed/UNEXECUTED; the numbers above are targets, per the brief.

## 10. Map and photograph storage, and the licensing boundary

**Bounded map area [CHOICE]:** v1 imports a pre-built **MBTiles** tileset into the project. **[FACT]** MBTiles 1.3 is a SQLite container: required `metadata` rows `name` and `format` (`pbf`/`jpg`/`png`/`webp`); recommended `bounds` (WGS 84 left,bottom,right,top), `center`, `minzoom`, `maxzoom`; optional `attribution`; tiles keyed `zoom_level, tile_column, tile_row` in **TMS order with the Y axis reversed** relative to "XYZ" URLs (`tile_row = 2^z − 1 − y`); core SQLite features only, no extensions [S10].

**License investigation (actual selected source: OpenStreetMap-based tiles/data):**
- **[FACT]** OSM data is ODbL: free to copy/distribute/adapt with credit to OSM and its contributors; derived databases must be distributed under ODbL (share-alike); attribution must be displayed and the ODbL availability made clear; documentation is CC BY-SA 2.0 [S11].
- **[FACT]** OSMF states it "cannot provide a free-of-charge map API or map tiles for third-parties" and publishes a Tile Usage Policy [S11]. **[INFERENCE/CHOICE]** Shipping the app must NOT proxy osm.org tile servers; bundles must contain tiles produced from licensed sources (e.g. OSM planet extracts rendered by the group or from an openly licensed provider) with the source + license recorded in the MBTiles `attribution` metadata and displayed in-app. Offline availability does **not** follow from a web viewer — this is a brief requirement confirmed by the OSMF policy statement.
- **[FACT]** OSM embeds openly-licensed third-party data (national agencies, CC BY 4.0 etc.) with per-country attribution entries [S11]; the bundle's credits screen must render these per-source attributions.
- **[UNCERTAIN]** The Tile Usage Policy page itself failed to load in this session (one boundary error); its exact bulk-extraction limits are UNREAD — must be reviewed before any bulk tile download is coded (see leads L4).

**Photographs [CHOICE]:** stored content-hashed under `media/`, EXIF capture time/coordinates recorded into provenance as *device-declared* (never auto-trusted as record placement); thumbnails cached; original files immutable.

## 11. User-facing requirements carried from the brief

Legible coordinate/provenance inspector on every record (record CRS, axis order, units, transform descriptor, altitude/time provenance, source batch); visible quarantine/reject lists; obvious offline banner; undo via inverse edits for unshared local history; conflict inspector showing base/local/incoming with map context and one-click resolutions, all logged; keyboard navigation through record browser and forms; screen-reader-labelable fields (these are product requirements **[CHOICE]**; WCAG conformance testing is proposed/UNEXECUTED).

## 12. Critical dependencies and release binding (V10)

| Component | Bound version | Basis |
|---|---|---|
| PROJ (docs line) | stable docs = 9.9.0 (2026-10-03 build) | [S2 page title/footer] |
| pyproj | design assumes ≥ **3.8.0**; stable docs today = 3.7.2 | [S3]; `always_xy` on `from_pipeline` ships in 3.8.0 per PR #1566 (merged 2026-01-10, milestone 3.8.0) [S6, S7]; issue #1644 reports pyproj 3.8.0 in the wild [S9] |
| SQLite | ≥ 3.24.0 for R*Tree aux columns; session extension requires a build with `SQLITE_ENABLE_SESSION` + `SQLITE_ENABLE_PREUPDATE_HOOK` (disabled by default; in amalgamation since 3.13.0) | [S1 §4.1; S12 §1.2] |
| Tile container | MBTiles 1.3 | [S10] |
| Basemap data | ODbL + per-source attribution; no OSMF tile proxying | [S11] |

**Consequential caveats:** (a) the app-layer merge (§7) was chosen partly because the session extension needs a non-default SQLite build flag and does not support virtual tables at all [S12 §1.3] — so changesets cannot track the R*Tree index directly; the index must be derived/rebuilt, which my design already treats as derived. If a session-enabled build is undesirable, the same field-level three-way contract applies over the app oplog (bounded alternative, no behavior change). (b) pyproj 3.7.2 → 3.8.0 binding: if 3.8.0 wheels are unavailable on a target platform, `from_pipeline` loses `always_xy` — workaround is to construct pipelines only via `from_crs` (which has `always_xy` since 2.2.0 [S3]) until the platform upgrades; recorded as dependency L11.

## 13. Validation plan (justified; executed vs proposed)

**Executed by candidate (isolated stdlib sandbox; scope: component illustration only):**
- **W1** antimeridian track discontinuity — naive vs unwrapped midpoint; hazard quantified (15,267× detour). Receipt `exec-5zu1odb2`, exit 0.
- **W2** divergent-copy merge semantics — LWW silent loss vs explicit three-way conflict + uncommitted-draft classification. Receipt `exec-8tn24g2_`, exit 0.

**Proposed / UNEXECUTED (product-level):**
1. CRS corpus tests pinned to lat-first targets (EPSG:2056, EPSG:4326) asserting always_xy behavior and area-of-use flagging — modeled on upstream regression tests [S6].
2. Transactional import: 250k-row synthetic CSV with 1% malformed rows → all-or-nothing commit + full error report.
3. Merge property tests: for random divergences, no silent value loss — every differing field ends in {applied, conflict, rejected-with-reason} (W2's contract at scale).
4. Kill-during-merge/save recovery: SIGKILL at staged intervals; reopen must classify staged vs committed and pass `rtreecheck` [S1 §7.2].
5. Antimeridian/zone-edge track suite including W1's coordinates; export must equal stored geometry bit-for-bit, display may split.
6. 250k viewport-latency and streaming-export benchmark (the brief's engineering target — research target, not a claimed result).
7. License conformance: bundle credits screen vs MBTiles `attribution` and OSM attribution guidelines [S11].
8. Accessibility pass (keyboard-only record editing, screen-reader labels).

## 14. Opportunities and alternatives

- **Opportunity (later, optional):** real-time peer sync of the same oplog to a hosted or LAN service; the oplog/changeset design is the natural substrate. Distinct from v1 minimums.
- **Opportunity (later):** broad map-source support (vector MBTiles from multiple providers) and automated species classification hooks; both additive.
- **Alternative A (credible, bounded):** CRDT-based merge (e.g. Automerge) instead of explicit three-way conflicts — automatic convergence, but v1 rejects it as default because the brief demands *inspectable* conflicts and evidence of silent-drop hazards under naive merge is exactly what W2 shows; CRDT could be an opt-in later lane (lead L3).
- **Alternative B (container):** OGC GeoPackage instead of a custom SQLite+MBTiles bundle — likely better interoperability (lead L2, uninvestigated here); blocked in v1 on a license/extension audit I have not performed.
- **Alternative C (merge engine):** use SQLite session changesets natively if a `SQLITE_ENABLE_SESSION` build is acceptable [S12 §1.2]; behavior contract identical to §7.

## 15. Uncertainty register

1. OSM Tile Usage Policy exact limits unread (fetch failed) — L4 blocks any bulk tiling code.
2. Mergin Maps' documented conflict-file mechanism (whole-product precedent) not machine-read — L1; the §7 contract stands on S12 + W2 regardless.
3. GeoPackage license/extension audit not done — L2.
4. 250k performance numbers are targets; no benchmark executed.
5. Vertical (geoid) transformation offline behavior is defect-prone per S8/S9; v1 keeps it opt-in; exact grid pre-fetch API behavior must be verified on the chosen pyproj build.
6. WAL/power-loss assumptions are platform trust, not tested here; validation item 4 is the gate.

## Source index (details, pins and capture identities in sources.json)

[S1] SQLite R*Tree docs · [S2] PROJ 9.9.0 FAQ · [S3] pyproj 3.7.2 Transformer API · [S4] pyproj#1377 · [S5] pyproj#1368 · [S6] pyproj PR #1566 diff · [S7] pyproj PR #1566 metadata (milestone 3.8.0) · [S8] pyproj#1474 · [S9] pyproj#1644 · [S10] MBTiles 1.3 spec · [S11] OSM copyright/licence page · [S12] SQLite Session extension · [S13] Mergin Maps synchronisation docs (capture-limited; lead L1)
