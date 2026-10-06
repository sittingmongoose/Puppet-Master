# FieldLedger — offline field observations and map exchange (research proposal)

Stage: research (Confirmation brief H2). Date of work: 2026-10-06. Author: admitted candidate model (research role).
Deliverables frozen here: `out/research/proposal.md` (this file), `out/research/sources.json`, `out/research/witnesses.json`, `out/research/leads.json`.

**Label legend.** Every substantive claim is tagged: **FACT [Sn]** = external fact with a pinned source in `sources.json`; **INF** = engineering inference by the candidate from facts; **CHOICE** = product decision the team could reasonably take differently; **UNCERTAIN** = open dependency or unverified assumption. Checks are tagged **W1–W4** (executed by candidate, isolated sandbox) or **P1–P8** (proposed/UNEXECUTED). No evaluator-provided executions exist at this stage.

---

## 1. Product definition and scope

**CHOICE.** V1 is *FieldLedger*, a local-first desktop/tablet application for a small environmental survey group. A **project** is a portable directory bundle:

```
<project>/
  project.sqlite        # schema below: observations, geometry, revision log, imports, conflicts
  originals/            # byte-exact copies of imported source files + manifest (hashes)
  media/                # photographs etc., content-addressed by sha256
  mappack/              # bundled basemap tiles + license/attribution file
  manifest.json         # project id, schema version, app version history
```

A session: open project → inspect coordinate/reference metadata → search/preview records → add or edit an observation fully offline → save → copy the bundle to another machine → merge a colleague's changed copy → export a table plus a map overlay. Originals stay intact by construction (imports write new revisions; `originals/` is never rewritten).

**Non-goals for v1** (kept as leads): real-time collaboration, route guidance, hosted accounts, broad multi-vendor map-source support, automated species classification.

**Minimum requirement:** every editing function works with no network at all; the network is never required at runtime. The UI shows a permanent "offline by design — no network required" state rather than a failure state (CHOICE).

---

## 2. Evidence base (external facts used, all pinned in sources.json)

- **S1** RFC 7946 (GeoJSON): position is "longitude and latitude … precisely in that order" (§3.1.1); winding right-hand rule with "parsers SHOULD NOT reject Polygons that do not follow the right-hand rule" (§3.1.6); antimeridian cutting SHOULD split geometries (§3.1.9); bbox across antimeridian has east < west (§5.2); coordinate digit count "MUST NOT be interpreted as an indication … of uncertainty" (§3.1.10); CRS is WGS 84 only, alternative-CRS support was *removed* because it "has proven to have interoperability issues", and "GeoJSON processing software is not expected to have access to coordinate reference system databases" (§4); a Feature with no location uses `"geometry": null` (§3.2).
- **S2** SQLite R\*Tree docs: R-tree is a virtual table; the first column is a 64-bit integer key and **coordinate columns are stored as 32-bit floats** (rtree) or 32-bit ints (`rtree_i32`); out-rounded bboxes mean contained-within queries should be expanded by ~0.000012%; a write during an open R-tree scan fails with SQLITE_LOCKED (collect ids first, then update); auxiliary columns exist since 3.24.0; `rtreecheck()` exists; "An R\*Tree index does not normally provide the exact answer but merely reduces the set of potential answers."
- **S3** SQLite current release at capture: **3.53.4 (2026-07-24)**; public-domain code.
- **S4** GeoPackage official site: "OGC has adopted GeoPackage 1.4.0" (document 12-128r19); GeoPackage = conventions *inside an SQLite container*, storing vector features, tile matrix sets, attributes, extensions; designed for "mobile devices … where there is limited connectivity"; media type `application/geopackage+sqlite3`; MBTiles vs GeoPackage differences (tile numbering, projections, multiple tile sets).
- **S6/S7** PROJ 9.9.0 docs (stable docs build; captured 2026-10-06): FAQ "Why is the axis ordering in PROJ not consistent?" — PROJ respects **authority-defined axis order** per ISO 19111 ("Before version 6, PROJ did not respect the standard either"); "In most cases coordinate reference systems with geodetic coordinates expect the input ordered as latitude/longitude (typically with the EPSG dataset), however, internally PROJ expects a longitude/latitude ordering"; `projinfo EPSG:4326` shows WKT2 `AXIS["geodetic latitude",north,ORDER[1]]` then longitude ORDER[2]; WKT or SRID preferred over PROJ strings because "Conversions between WKT and PROJ strings will in most cases cause a loss of information, potentially leading to erroneous transformations"; `projinfo -s … -t …` lists candidate operations; `proj.db` is a resource file found via `PROJ_DATA` (formerly `PROJ_LIB`).
- **S8** OpenStreetMap copyright page: OSM data is ODbL; users must display attribution and make clear data is under ODbL; derived databases must be shared alike; "Although OpenStreetMap is open data, we cannot provide a free-of-charge map API or map tiles for third-parties" with links to API/Tile/Nominatim usage policies.
- **S9** OSMF Tile Usage Policy (operations.osmfoundation.org/policies/tiles/): **not captured** — fetch failed (OSError) from both `operations.osmf.org` and `operations.osmfoundation.org` in this environment; limitation recorded; the policy's existence and linkage are pinned via S8.
- **S10** Natural Earth terms of use: "All versions of Natural Earth raster + vector map data found on this website are in the public domain … No permission is needed to use Natural Earth. Crediting the authors is unnecessary."
- **S11** Syncthing docs (written for v2.1.0): conflicting simultaneous edits are resolved by **renaming one copy** to `<filename>.sync-conflict-<date>-<time>-<modifiedBy>.<ext>` (older mtime loses); conflict copies are themselves synced; modification-vs-deletion can also produce a conflict copy; writes go to a temp file then are moved into place.
- **S12/S13** Turf.js issue #737 → merged PR #741 (details §5 below).
- **S14** Leaflet issue search capture: Leaflet **#9878** (2025, open) "Map flashes white when panning near antimeridian"; earlier PR #5164 for antimeridian wrapping was **not merged**.
- **S15** Leaflet site (capture): ships `leaflet@1.9.4` (SRI-pinned); features include "Keyboard navigation" and "Custom map projections (with EPSG:3857/4326/3395 out of the box)"; 2.0.0-alpha.1 announced 2025.

**Method note (V14 breadth).** Discovery deliberately covered five mechanism families before deepening: storage/indexing (SQLite/GeoPackage), coordinate transformation (PROJ), local sync conflict handling (Syncthing), geometry semantics/standards (RFC 7946 + turf issue chain), and rendering (Leaflet), plus the licensing lane (OSM/ODbL, Natural Earth). Roughly a third of discovery effort went to families outside the primary storage lead. Deferred leads are in `leads.json` (CRDT merge, vector tiles/PMTiles, FTS5 search, EXIF photo provenance). Elapsed timings are not claimed.

---

## 3. Implementation precedents (two required, both independently useful + a third)

### Precedent A — SQLite R\*Tree + GeoPackage conventions for bounded spatial storage (S2, S3, S4)
**What it is:** the storage layer used by FieldLedger: a plain SQLite table of observations plus an R\*Tree virtual table holding only per-record bounding boxes, GeoPackage (SQLite-conventions standard, adopted v1.4.0) as the interchange/export format.
**Concrete lessons extracted:**
1. The R\*Tree stores bbox coordinates as **32-bit floats** [FACT S2] — it is a filter, not an authority. Authoritative coordinates must live in the observations table at full precision; the index only narrows candidates ("does not normally provide the exact answer" [FACT S2]). **INF:** store canonical coords as REAL (IEEE-754 double) columns; never read positions back out of the index.
2. Contained-within queries against outward-rounded boxes can miss edge entries; the docs prescribe expanding query boxes by ~0.000012% [FACT S2]. **INF:** implement viewport queries as *overlap* queries (which never miss per S2) plus a precise post-filter.
3. You cannot write to an R\*Tree while a scan is open (SQLITE_LOCKED) [FACT S2]. **INF:** all bulk operations (merge, re-index, export) materialize id lists into a temp table first; this also gives natural cancellation points.
4. `rtreecheck()` exists for integrity verification [FACT S2]; **INF:** run at project open after abnormal shutdown, alongside SQLite's own integrity check.
5. GeoPackage shows that an SQLite file is a viable, standard, offline-first exchange container with an OGC executable test suite available [FACT S4]. **INF:** exporting to GeoPackage gives free interop with QGIS-style tooling and an external conformance target.

### Precedent B — PROJ for CRS identification and transformation versioning (S6, S7)
**What it is:** the transformation engine and CRS authority model. FieldLedger records CRSs as WKT2 and applies transformations only through PROJ, storing the exact operation used.
**Concrete lessons extracted:**
1. **Axis order is authority-defined, not conventional.** EPSG:4326's WKT2 declares latitude first; GeoJSON declares longitude first; PROJ internally expects lon/lat for projections [FACT S7, S1]. Any importer that guesses order will eventually be wrong. **INF/CHOICE:** axis order is a *per-import, explicitly confirmed* attribute recorded with provenance; the wizard derives it from WKT2 axes via `projinfo` and asks only when the source is ambiguous.
2. Keep CRS descriptions in **WKT2**, not PROJ strings — WKT→PROJ conversion is lossy and "potentially leading to erroneous transformations" [FACT S7]. **INF:** `crs_wkt2` is the stored form; PROJ strings are derived, never persisted as the definition.
3. `projinfo -s X -t Y` enumerates candidate operations with identifiers/accuracy [FACT S7]. **INF:** import-time validation asks PROJ whether a *bounded, known* transformation exists before accepting a batch; if not, rows go to quarantine with a user-visible reason.
4. PROJ depends on the `proj.db` resource file located via `PROJ_DATA` [FACT S7]. **INF:** transformation records pin the PROJ library version **and the proj.db file hash** at transform time so a transformation can be reproduced or flagged as no longer reproducible after upgrades. *(UNCERTAIN: exact proj.db internal versioning scheme not captured — see P5.)*
5. Transformation is a versioned, re-runnable artifact, not an invisible side effect — this is the core of the "displayed pin ≠ exported truth" defense (§6.4).

### Precedent C (breadth lane) — Syncthing's conflict-copy mechanism for file divergence (S11)
**What it teaches:** when two replicas diverge, never overwrite silently: rename the loser to a named conflict copy that itself propagates; equal-mtime ties break by device id, deterministically; writes are temp-file-then-rename so interrupted transfers leave recoverable artifacts [FACT S11].
**INF/CHOICE adopted:** FieldLedger's merge never discards either side; conflicts become first-class rows shown in a review screen; every logical save is transactional so an interrupted save is visible at reopen. Unlike Syncthing's file-granularity model, FieldLedger merges at record/field granularity because it owns the schema — but the *presentation* lesson (visible, named, inspectable conflict artifacts) is adopted directly.

---

## 4. Why "a passing test proves nothing" — the investigated issue → fix → regression chain

**Chain investigated (real, public):** Turf.js issue **#737** "Exterior ring CCW for `@turf/rewind`" [FACT S12] → merged PR **#741** "Reverse winding @turf/rewind" (merged 2017-05-13, milestone 4.3.0) [FACT S13].

- The bug: `@turf/rewind` forced polygons to the **opposite** of RFC 7946 §3.1.6 winding (outer ring clockwise instead of counterclockwise); the issue body cites RFC 7946 §3.1.6 directly [FACT S12].
- The fix (from the PR diff [FACT S13]): the outer-ring test flipped from `isClockWise(coords[0]) === reverse` to `!== reverse` (inner rings inverted correspondingly); README wording corrected; FeatureCollection/GeometryCollection support added.
- The regression tests added: `packages/turf-rewind/test.js` gained two tests ("Support Geometry Objects", "Prevent Input Mutation"), and the fixture `test/in/polygon-clockwise.geojson` was **replaced with a genuinely clockwise ring** `[[0,0],[1,1],[1,0],[0,0]]`, with matching `test/out` expectations updated [FACT S13].
- **Load-bearing lesson:** the *pre-fix* fixture named `polygon-clockwise.geojson` actually contained a counter-clockwise ring, so the old suite **passed while the library violated the standard** [FACT S13 — visible in the diff as replaced content]. This is a concrete instance of the brief's warning that "an issue title or a passing isolated test does not prove whole-product correctness." A test can only validate against its fixture; if the fixture encodes the same misunderstanding as the code, both are wrong together. **INF adopted:** every FieldLedger fixture that encodes a standard-derived expectation (winding, axis order, antimeridian split) must have its *label* independently derived (e.g., winding computed by signed area at fixture-authoring time), and label-vs-content checks run in CI.
- **Release/branch applicability:** the fix landed in turf milestone **4.3.0 (May 2017)**, about nine months after RFC 7946 (August 2016) [FACT S12, S13]. Applicability today: winding normalization is still the importer's job; and per RFC 7946 §3.1.6 FieldLedger must **tolerate and flag** wrong-winding input, never reject it [FACT S1]. *(Not re-verified against current turf 7.x source — out of scope for this stage; recorded in leads.json as L-07.)*
- **Related live limitation:** Leaflet **#9878** (opened 2025, still open) — map flashes white when panning near the antimeridian; an earlier antimeridian-wrapping PR (#5164) was never merged [FACT S14]. **INF:** renderer-level antimeridian handling cannot be assumed from the map library; FieldLedger must split dateline-crossing tracks itself for both display and export rather than relying on the renderer.

---

## 5. Workflow (typical session mapped to components)

1. **Load project** — open `project.sqlite`; run integrity sweep (SQLite integrity + `rtreecheck()` [FACT S2]; staged-but-uncommitted batches detected → recovery prompt, §7.5).
2. **Inspect reference metadata** — provenance panel shows project canonical CRS (WKT2), per-batch source CRS, axis order, units, altitude datum, time provenance, and the transform record used [FACT S7 pins WKT2 choice].
3. **Search/preview** — attribute search via covering indexes; map pane queries the R\*Tree for the viewport bbox with overlap + post-filter [FACT S2]. Preview renders a *sample*; the full-import validation summary (counts accepted / quarantined / needs-confirmation) is what establishes batch state — a sample never validates a batch (§6.5).
4. **Add/edit offline** — the editor writes a new revision row (§7.1); undo appends a compensating revision. Edits are impossible without a network because nothing needs one.
5. **Save** — single SQLite transaction per logical save (WAL mode).
6. **Move to another machine** — copy the bundle directory; media referenced by content hash so relocation is safe (§7.4).
7. **Combine colleague's copy** — merge engine (§7.2/7.3) produces auto-merges + an explicit conflict review queue.
8. **Export** — table (CSV/GeoPackage attributes) + map overlay (GeoJSON per RFC 7946 and/or GeoPackage); export recomputes coordinates from canonical storage through recorded transforms and is independent of the display path (§6.4).

---

## 6. Data and coordinate contract

### 6.1 Identity model
**CHOICE/INF.** `project_id` (UUID, in manifest), `machine_id` (per-install UUID, names originates), `observation_id` (UUIDv7, time-ordered, globally unique), `geometry_id` (UUID per geometry version), `revision_id` (monotonic per project, per machine prefix), `import_batch_id` (UUID per import run), `attachment_sha256` (content address). External/source identifiers are **never** primary keys; they are stored as `(source_batch, source_id)` pairs and namespaced per import batch.

### 6.2 Coordinate planes (stored vs displayed vs exported)
**CHOICE.** Three planes, explicitly distinct:

| Plane | CRS | Axis order | Role |
|---|---|---|---|
| **Original** | source CRS as imported | as declared/confirmed | immutable verbatim text/values from the source file, kept in `originals/` + raw columns |
| **Canonical** | project canonical CRS (WGS 84 lon/lat by default) | lon,lat enforced at the storage API | the only plane used for indexing, merging, export computation |
| **Display** | EPSG:3857 or 4326 as needed by renderer | per renderer | derived cache only, invalidation keyed on revision; **never persisted as authoritative** |

Rationale: GeoJSON fixes WGS 84 lon/lat as the interchange CRS [FACT S1 §4]; PROJ demonstrates axis order must be explicit per CRS [FACT S7]; the R\*Tree must be fed one consistent, unambiguous plane (INF from S2). Because the canonical plane equals the GeoJSON plane, the most common export needs **no transformation at all**, eliminating a whole class of export errors; when the canonical CRS is not WGS 84 (CHOICE option for large metric-area projects), exports always pass through a recorded transform instead.

**A displayed pin is not proof of exported truth** — mitigations (INF/CHOICE): (a) display reads from the cache table, export reads only from canonical + transform records; (b) export runs an audit: recompute export coordinates, then inverse-transform them and compare against canonical within tolerance, reporting per-row mismatches (proposed check P3); (c) exported files carry a provenance header (project id, batch list, transform records, licenses).

### 6.3 Support boundary (CRS and geometry)
**CHOICE, with the boundary stated rather than universalized:**
- **Supported in v1:** geographic and projected CRSs expressible as EPSG codes or WKT2 that PROJ resolves, whose declared area of use contains the project bbox (checked via PROJ metadata; INF from S7 `projinfo`); horizontal 2D mandatory; altitude accepted as a value plus an explicit datum field — if the vertical datum is unknown it is stored flagged `vertical_datum=unknown` and **never silently assumed** to be ellipsoidal or geoid heights (this matters because RFC 7946's optional third element is specifically height above the WGS 84 ellipsoid [FACT S1 §4]).
- **Rejected to quarantine (not guessed):** CRSs PROJ cannot resolve; CRSs whose area of use does not cover the project region (user can override with an explicit recorded assertion); axis order that cannot be determined from metadata — the wizard requires a bounded choice (lat/lon vs lon/lat vs other declared order), records `axis_order_source: metadata | user-asserted`, and *shows the consequence* by rendering the confirmed point on the basemap before commit.
- **Geometry types in v1:** Point and LineString (tracks), with notes and photographs as attributes/attachments. Polygons, Multi\* and GeometryCollections are **out of v1** (lead L-05) — this keeps the winding/antimeridian surface minimal while RFC 7946 semantics are still honored on export [FACT S1].
- **Time provenance:** every observation carries `time_value`, `time_source` (device clock | GNSS fix | manual), and optional `clock_offset_seconds`; unknown provenance is a visible flag, not a default (CHOICE).

### 6.4 Transformation versioning and validation
**INF/CHOICE.** Each applied transform is a row in `transform_records`: (source WKT2, target WKT2, PROJ library version, proj.db sha256, PROJ operation id/name + accuracy when PROJ reports one, created_at, inverse-available flag). Reopening a project after a PROJ upgrade marks affected records `transform_stale` and offers recompute + diff report; exports may proceed on stale transforms only with an explicit user acknowledgement (CHOICE). Round-trip validation: on import, a bounded sample *and* a full inverse check at export time (P2/P3) compare `T⁻¹(T(x))` against the original within a per-CRS tolerance. Scope honesty: W1–W4 did **not** execute real PROJ; all transform claims here are design + P-checks UNEXECUTED.

### 6.5 Boundary and adversarial cases (investigated, not universalized)
- **Near coordinate/domain boundary** (edges of the CRS area of use, ±90 latitude, ±180 longitude): transformations may fail or lose meaning at domain edges. **INF:** per-row transform failure → quarantine table with row content + reason; quarantine is a *visible, countable* state; nothing is dropped. RFC 7946 also forbids latitude >90 as a bbox trick [FACT S1 §5.3] — imported values outside ±90/±180 in a declared geographic CRS go to quarantine.
- **Tracks spanning the antimeridian:** stored unsplit in canonical lon/lat; **display** splits for rendering (renderer cannot be trusted to do this — Leaflet #9878 still open [FACT S14]); **GeoJSON export** splits into MultiLineString per RFC 7946 §3.1.9 SHOULD [FACT S1]; bbox computation uses the RFC 7946 §5.2 antimeridian convention (east < west) [FACT S1]. W2 quantifies the stake: naive linear-longitude handling of a 0.02° dateline crossing yields a ~40,028 km path vs the true 2.2 km (17,999× error) [W2].
- **Incomplete coordinates:** a record may have null geometry (GeoJSON explicitly models unlocated features with null geometry [FACT S1 §3.2]). W3 shows the operative behavior in SQLite 3.46.1: an R\*Tree row with NULL bounds is *accepted*, and such rows simply never match a `minx<=x AND maxx>=x` style constraint (NULL comparison semantics), i.e. **exclusion from the spatial index is implicit, not a guaranteed documented constraint** [W3 — observed behavior contradicted the initial expectation of an insert error; finding corrected accordingly]. **INF/CHOICE:** geometry-less records live in the main table with `has_geometry=0`, are excluded from the R\*Tree, and the UI shows a persistent "N records without coordinates" count so they cannot be silently invisible.
- **Conflicting identifiers:** source IDs collide across batches or with an existing record → bounded choice dialog (link / keep both with namespaced ids / remap); the collision is recorded as provenance either way (CHOICE, mirroring the explicit-conflict classes exercised in W4).
- **Winding (polygon future case, informed by the turf chain):** import normalizes a *copy* for spatial predicates and flags non-RFC winding on the original [FACT S1 §3.1.6 "SHOULD NOT reject"; S12/S13].
- **Preview ≠ validation:** a sample preview is for orientation only; batch acceptance is defined by the full per-row validation pass whose counts (accepted / quarantined / needs-confirmation) are displayed and stored with the batch manifest. This is a direct design answer to the brief's warning and to the turf fixture lesson (§4).

---

## 7. Revision, merge, and recovery contract

### 7.1 Revision log (offline editing minimum)
**CHOICE/INF.** Append-only `revisions` table: `(revision_id, observation_id, op: insert|update|delete, field_diffs JSON, machine_id, wall_time, parent_revision_id)`. Current state = replay of log. Semantics: update writes a field-level diff; delete writes a tombstone revision (row retained); undo appends an inverse revision (v1: single-level undo + full history browser — reversible rather than magical). Save = one WAL transaction. Time provenance of *edits* uses machine wall clock + monotonic sequence, never trusted for conflict ordering by itself (see 7.3).

### 7.2 Identity of project copies and the merge input
Each bundle carries `project_id` and a per-machine `replica_id`. A merge is only offered when `project_id` matches; otherwise the second file is an import, not a merge (CHOICE). Both replicas keep their complete revision logs, so the common ancestor is derived from shared revision history (revisions carry the importing replica's ids — union by id, not by position). *(INF; warrants the P6 test.)*

### 7.3 Merge semantics — explicit, bounded, no perfect-merge promise
**CHOICE (grounded in S11's precedent and W4):**
- **Auto-resolve** only: identical changes (same content hash), non-overlapping record sets, and both-inserted-identical-content (dedupe by content hash).
- **Conflict classes presented explicitly** (exercised toy-scale in W4): `both-edited` (field-level diff shown), `edit-vs-delete`, `duplicate-source-id` (two machines created records from the same source row), `geometry-diverged` (different canonical coordinates for the same observation). LWW-by-timestamp is rejected: W4 shows it silently destroys A's edit, deletes R2 without trace, and ignores the R3/R4 source-id collision [W4].
- Unresolved conflicts remain in an `unresolved` state, listed in a review screen with field diffs and side-by-side mini-maps; export either includes them flagged (`unresolved_conflict=true`, default) or blocks on export-of-record — user choice recorded [CHOICE]. Nothing is hidden to make the merge look clean, mirroring Syncthing's propagating conflict copies [FACT S11].
- **Duplicate detection v1:** exact (source_batch, source_id) key + content-hash dedupe at merge; a *fuzzy* spatial/temporal duplicate finder (same time ± window within X m) is an optional tool that flags, never auto-merges (CHOICE; lead L-08).

### 7.4 Re-import and relocation
- **Re-import same source:** the batch manifest stores the source file sha256. Identical hash → no-op with an "already imported" report; changed content → new batch, per-record diff against the previous batch, updates land as new revisions with provenance linking both batches (INF/CHOICE).
- **Relocating media:** all attachments are content-addressed (`media/<sha256>`), no absolute paths in the DB; moving or renaming the project directory is safe by construction; a missing/corrupt attachment is shown as a per-record media badge plus a project-level missing-media list — never silently pruned (INF; P7 validates).

### 7.5 Interrupted save / import / merge → recoverable reopen
**INF/CHOICE.** WAL mode + single-writer transactions make *saves* atomic. Imports and merges write into **staging tables** stamped with `batch_status: staging`, then flip to `committed` in one final transaction with a commit marker row. On open: any `staging` batch (crash leftover) is surfaced as "Incomplete import/merge (N rows) — Resume / Inspect / Discard", clearly separated from committed records; the app never auto-discards staging data. `rtreecheck()` + SQLite integrity check run at open after abnormal shutdown [FACT S2]. *(P4 is the kill-mid-import validation; UNEXECUTED.)*

---

## 8. Architecture (coherent, with the bounded alternative)

**CHOICE — selected architecture:** six modules over one SQLite file: (1) `store` (schema, WAL, revisions), (2) `import` (wizard, validators, staging, quarantine), (3) `geo` (transform service wrapping PROJ; transform_records; canonical/display planes), (4) `map` (viewport queries + display cache invalidation keyed on max revision), (5) `media` (content-addressed files), (6) `export` (GeoPackage + GeoJSON/CSV, audit). Renderer: Leaflet 1.9.4 pinned [FACT S15] drawing local raster tiles from `mappack/`; vector overlays drawn from the display cache; dateline splitting done by FieldLedger, not the renderer [FACT S14].

**Bounded alternative (seriously considered, deferred):** make the project file itself a **GeoPackage 1.4 container** with FieldLedger tables as registered extensions [FACT S4]. Pros: one-file portability, instant QGIS interop, conformance-testable. Cons (why deferred): revision-log/quarantine tables are app-private either way (GeoPackage extensions would be non-standard to other readers), and the bundle needs a media directory regardless; a GPKG-native core would couple crash recovery and merge staging to a standard that does not model them. GPKG remains the **export/interchange** format in v1 — preserving the interop benefit without the coupling (INF).

---

## 9. Resources, scale, and performance plan (research targets — not benchmarks)

Target hardware: 4 cores / 8 GB RAM; target dataset: 250,000 observations. **All numbers below are engineering targets, UNMEASURED at this stage** (P1).
- **Bounded spatial access:** viewport reads go through the R\*Tree overlap query + precise post-filter, `LIMIT`-windowed with a stable keyset pagination; attribute search uses covering B-tree indexes; no code path loads the full observations table [FACT S2 basis; INF].
- **Index maintenance:** R\*Tree rows updated only inside the per-save transaction; bulk ops (merge/recompute) collect ids into a temp table first to avoid SQLITE_LOCKED mid-scan failures [FACT S2 §3.5] and to provide cancellation checkpoints.
- **Cache invalidation:** display cache keyed by `(viewport, max(revision_id))`; any write bumps the generation and the map pane refetches its window. Recompute of display coordinates is lazy per viewport.
- **Map/photograph storage:** raster tile pack (Natural Earth-derived world base at low zoom [FACT S10]; optionally an OSM-derived regional pack under ODbL §10); photographs content-addressed, loaded per visible record only; a photo strip is not loaded by list queries.
- **Cancellation:** long operations (import, merge, export) are chunked with a checked cancel flag; partial artifacts live in staging and are never committed (§7.5).
- **Large export:** streaming row cursor → file, with progress, cancel, and a final audit (P3); export of 250k rows writes O(n) without holding the table in memory (INF).
- **Offline usability:** everything above needs no network; the map pack and all validation run on local files. PROJ resource files must be present locally (`PROJ_DATA`) [FACT S7] — the app ships/bundles them (INF; disk-space budget to be measured, lead L-06).
- **Memory discipline:** SQLite page cache sized ≤ ~512 MB; JSON diff blobs kept small by field-level storage; no unbounded in-process arrays over 250k rows (INF).

---

## 10. Licensing and attribution of bundled map/source data (investigated for the selected sources)

- **Selected v1 basemap: Natural Earth-derived raster tiles** — explicitly public domain, "No permission is needed … Crediting the authors is unnecessary" [FACT S10]. CHOICE: still embed a courtesy credit in exports.
- **Optional regional detail: OpenStreetMap-derived data** is ODbL [FACT S8]: attribution notice + license link must accompany any bundled pack and exports; a *derived database* must remain under ODbL (share-alike applies to the bundled pack itself) [FACT S8]. This is a real product obligation, not a formality — it must attach to `mappack/LICENSE.json` and propagate into exports (INF).
- **Hard limit:** OSM's public tile servers are **not** a bulk source — "we cannot provide a free-of-charge map API or map tiles for third-parties" [FACT S8]; an offline pack must be produced from a permitted data extract, not scraped tiles. *(The OSMF Tile Usage Policy page itself could not be captured in this environment — fetch failed twice; the policy's existence is pinned via S8's links. Recorded as S9 limitation; treat exact policy numeric limits as UNCERTAIN until captured.)*
- No proprietary, account-gated, or paid sources are used anywhere in v1 (brief constraint honored).

---

## 11. Users, feedback, and accessibility

- **Provenance legibility:** one record inspector pane shows CRS (WKT2 id + name), axis order and its source (metadata vs user-asserted), units, altitude datum state, time provenance, import batch + file hash, full revision chain [FACT S1 §3.1.10 motivates showing precision separately from digits; FACT S7 motivates showing axis order].
- **Errors:** quarantine lists with per-row reasons, counts surfaced at batch completion; transform failures name the failing CRS pair (INF).
- **Offline state:** permanent status affordance "Offline by design — all data local" (CHOICE).
- **Undo/reversibility:** compensating revisions + history browser (§7.1).
- **Keyboard navigation:** table-first navigation with full keyboard editing; the map supports keyboard navigation as provided by Leaflet [FACT S15]; every conflict queue item is reachable and resolvable by keyboard (CHOICE; WCAG-style contrast/focus review is a P-check dependency, lead L-09).
- **Inspectable conflicts:** field-level diffs, both sides drawn on the map (§7.3).

---

## 12. Validation plan (justified, labeled)

**Executed by candidate (isolated sandbox; receipts in witnesses.json):**
- **W1 axis-order swap:** misreading a (lon,lat) tuple as (lat,lon) displaces a London-ish point by **7,490.6 km** [W1]. Scope: haversine arithmetic only; not a projection engine. Justifies mandatory explicit axis-order confirmation (§6.3).
- **W2 antimeridian track:** naive linear-longitude path 40,028 km vs true 2.2 km (17,999× ) [W2]. Scope: arithmetic only. Justifies storage-unsplit + display/export splitting (§6.5).
- **W3 R-tree NULL behavior (corrected finding):** SQLite **3.46.1** runtime accepted a NULL bounding-box row (expected rejection did **not** occur); such rows are invisible to bbox-constrained queries via NULL comparison semantics; `rtreecheck()` returned ok [W3]. Scope: one stdlib build, one behavior; does not establish other SQLite versions' behavior (docs captured describe the 3.53.4-era docs site [S2, S3] — version gap recorded honestly). Revised design consequence: exclusion of geometry-less records is enforced by *our* schema (`has_geometry` gate), not delegated to the index.
- **W4 merge semantics:** last-writer-wins silently drops A's edit, deletes R2 without trace, and ignores the R3/R4 source-id collision; explicit three-way classification surfaces all three [W4]. Scope: toy dict semantics; not the real engine. Justifies §7.3 conflict classes.

**Proposed / UNEXECUTED (with pass criteria):**
- **P1** 250k-row synthetic project: viewport query p95 < 200 ms, attribute search p95 < 300 ms, RSS < 1.5 GB, on the target-class machine. *(Target, not promise.)*
- **P2** Transform fixtures through real PROJ 9.9: axis-swapped EPSG:4326 input, a projected CRS (e.g., a national grid), unknown vertical datum; pass = quarantine/flag behaviors of §6.3/6.4 and round-trip within tolerance.
- **P3** Export audit: export→reimport→canonical-equality on 10k rows incl. antimeridian tracks and null-geometry records; pass = zero silent differences, audit report matches.
- **P4** Crash recovery: kill -9 mid-import/mid-merge; reopen shows staging vs committed exactly as §7.5; pass = no committed-looking partial batches.
- **P5** proj.db pinning: transform record reproduces after a PROJ upgrade or is flagged `transform_stale`; pass = no unflagged divergence.
- **P6** Merge matrix: both-edit, edit-vs-delete, duplicate-source-id, geometry-diverged, both-insert-identical; pass = classification matches §7.3 and nothing unreviewed is dropped.
- **P7** Relocation/re-import: move bundle, re-import same & changed source; pass = §7.4 behaviors.
- **P8** Fixture-label integrity: all standard-derived fixtures carry computed labels (winding signed-area, axis-order from WKT2); pass = the turf-style mislabeled-fixture failure mode (§4) is structurally impossible.

---

## 13. Opportunity, alternatives, and later chances

- **Opportunity (kept distinct from minimums):** *region map-pack exchange* — teams share bounded GeoPackage tile/feature packs for their survey regions; FieldLedger only needs to import a file and record its license. This turns the licensing work (§10) into a feature and needs no infrastructure (CHOICE; lead L-01).
- **Plausible alternative architecture (preserved, §8):** GeoPackage-native project container — revisit if single-file portability outweighs the staging/recovery coupling (INF).
- **Later:** CRDT real-time sync (Automerge-family) would subsume parts of §7 but is explicitly *not* promised; vector-tile rendering (PMTiles/MapLibre) when raster basemaps limit quality; FTS5 full-text search over notes; EXIF/GPS provenance extraction from photographs (leads L-02…L-04).

## 14. Uncertainties and unresolved dependencies (explicit)

1. **PROJ proj.db versioning internals** were not captured; the pin-by-hash design (§6.4) is INF pending P5. UNCERTAIN.
2. **OSMF Tile Usage Policy numeric limits** not captured (S9 failed); only S8's no-bulk-tiles statement is pinned. UNCERTAIN — matters only if an OSM-derived pack is produced; Natural Earth path is unaffected.
3. **W3 version gap:** witness ran on SQLite 3.46.1 (sandbox) vs 3.53.4 docs-site era; NULL-bbox behavior should be re-verified on the shipping SQLite (P-check addition; recorded).
4. **Merge-ancestor reconstruction** from unioned revision logs is INF; P6 must confirm on multi-generation histories before implementation commits to it.
5. **Current-state re-verification of turf's rewind** (post-2017) not performed (lead L-07); the §4 lessons do not depend on it.
6. **Renderer assumptions** (Leaflet 1.9.4 raster path, keyboard support) pinned to site claims [S15]; integration behavior is P-check territory, not yet evidence.

---

*Sources S1–S15 with exact locators, capture hashes, and applicability: `sources.json`. Executed/proposed checks W1–W4, P1–P8 with receipts and scope: `witnesses.json`. Deferred/optional leads: `leads.json`.*
