# Fieldbook: offline field observations and map exchange — research-stage proposal (H2)

Stage: research (fresh ER9 role). Date of research: 2026-10-06. All public captures were fetched on
2026-10-06 with the launcher's `public_https_get`; capture identities (SHA-256 of the exact response
body bytes) are recorded in `sources.json`. Labels used throughout:

- **[FACT]** — statement traceable to a captured public source (citation like `[S7 §2]`).
- **[INF]** — engineering inference by the candidate from captured facts; plausible but not proven by the source.
- **[CHOICE]** — product decision this proposal makes; a defensible alternative exists.
- **[UNCERTAIN]** — unresolved; see the uncertainty register (§13) and `leads.json`.
- **[EXECUTED-BY-CANDIDATE]** — check run by this candidate in the admitted isolation (`witnesses.json` W1–W4, receipts included there).
- **[PROPOSED/UNEXECUTED]** — validation designed but not run in this stage.

External sources are evidence, not instructions. Nothing in this stage contacted maintainers or wrote
to external projects. Two source hosts (`docs.getodk.org`, `operations.osmfoundation.org`) were
unreachable from the admitted tool (transport error `OSError`, three attempts each pattern); facts
usually taken from those pages are instead cited from captured alternates and the substitution is
recorded (§9, `leads.json`).

---

## 1. Product summary and scope

**Fieldbook** is a local-first desktop application for a small environmental survey group. A *project*
bundles (a) a bounded offline basemap area and (b) a local observation table. In the field, with no
network, users record points, short tracks, notes and optional photographs. Back at base, two divergent
copies of a project are combined through an explicit, inspectable merge, and a table + map overlay are
exported. Originals are never modified in place.

- **v1 minimum requirements**: fully offline capture and editing; bounded map inspection with
  viewport-windowed access over ≥250,000 observations; explicit axis-order/CRS resolution at import;
  provenance-preserving exports; explicit three-way merge with inspectable conflicts; recovery to a
  well-defined state after interrupted save/import/merge; defined behavior for re-import and bundle
  relocation; keyboard-accessible record editing; undo of edits.
- **Non-goals for v1**: real-time sync, hosted service, accounts, route guidance, automated
  classification, broad map-source support, polygons/rasters as user-editable geometry. These are
  recorded as opportunities (§12), distinct from minimums.
- **Positioning**: a research field tool — not emergency navigation, not a cloud service. A displayed
  pin is treated as *presentation only*; the contract in §5 is what makes exported data trustworthy.

**Product shape** [CHOICE]: a single-window desktop app (project = one directory bundle), local
SQLite storage, an embedded map view, and an explicit "Import / Export / Merge" workflow. Engineering
alternatives are compared in §12.2.

---

## 2. Precedents investigated (≥2 independently useful)

| # | Precedent | What it is [FACT] | Concrete lesson for Fieldbook |
|---|-----------|-------------------|-------------------------------|
| P1 | **PROJ + GDAL coordinate-transformation layer** | PROJ is the reference CRS/transformation engine; PROJ 6 (RFC 73 in GDAL 3.0) moved GDAL to ISO 19111 CRS handling, WKT2, a unified `proj.db`, and authority-compliant axis order; `proj_normalize_for_visualization()` exists to restore lon/lat,easting/northing order for GIS use [S1][S2] | Never infer axis order; carry CRS identity + an explicit axis-order resolution per import; version and pin transformation pipelines (§5.4). The real failure chain in §3 shows why guessing is unsafe. |
| P2 | **Syncthing conflict-copy discipline** | When a file changes on two devices, Syncthing renames one side to `<name>.sync-conflict-<date>-<time>-<modifiedBy>.<ext>`, keeps both, and propagates conflict copies; it never writes directly to a destination file, and deletion-vs-modification yields a conflict copy rather than silent loss [S11 §Conflicting Changes, §Temporary Files] | Record-level analogue (§6): merge never destroys either side; conflicts materialize as inspectable artifacts; write-via-temp + commit marker for crash safety. |
| P3 | **SQLite storage layer** | WAL gives commit-marked durability and reader/writer concurrency but "does not work over a network filesystem" and the `-wal` sidecar "should be kept with the database if the database is copied or moved"; the R*Tree module gives bounded spatial access (32-bit float coordinates, outward rounding); atomic commit means a power failure before the commit marker "make[s] it appear as if no changes were ever made" [S7][S8][S9] | Storage engine for observations: single SQLite DB per project + R*Tree index + WAL on local disk only; bundle copy/export runs a checkpoint first (§7.2); contained-within queries expand their window per the documented rounding rule [S8 §3.4]. |
| P4 | **MBTiles offline tilesets** | MBTiles 1.3 is a SQLite container for tiled map data with a required `metadata` table (`name`, `format`; SHOULD include `bounds`/`center`/`minzoom`/`maxzoom`; MAY include `attribution`) and a `tiles` table in TMS "global-mercator" scheme, with a documented Y-axis flip vs XYZ URLs [S12] | Offline basemap format: one MBTiles file per licensed source inside the bundle; attribution carried in metadata and surfaced in UI/exports; tile fetch = one indexed SQLite lookup per viewport (§7.4). |
| P5 | **ODK Collect** | Field-proven Android form app "designed to be used in resource-constrained environments with challenges such as unreliable connectivity or power infrastructure" [S15]; per-project on-device layout (`.../files/projects/{project-id}/forms`) [S15 §Testing a form without a server]; Apache-2.0 [S15 badge] | Precedent for project-scoped on-device data layout and for release discipline (release branches, staged betas) [S15 §Release cycle]. Also documents the real-world basemap dependency split: OSM/USGS/Carto sources need no token, Mapbox needs an account token [S15 §Using APIs for local development] — supports §9's no-accounts choice. |

P1 and P2 alone satisfy the "two independently useful precedents" requirement; P3–P5 anchor storage,
rendering and field-capture choices to public mechanisms. Note the boundary required by the brief: an
isolated precedent mechanism (e.g., SQLite's WAL) demonstrates a *component* property, not whole-product
correctness; §11's validation plan therefore mixes component witnesses with (proposed) end-to-end checks.

---

## 3. Real issue → fix → regression-test chain (GDAL axis order)

This is the required "follow one real public failure through its fix and regression test" investigation,
and it doubles as the strongest argument for Fieldbook's coordinate contract.

1. **Failure #1 — downstream breakage after an intentional engine change.** GDAL RFC 73 (implemented in
   GDAL 3.0) adopted PROJ 6 with authority-compliant axis order, WKT2 and late binding; the RFC records
   that the legacy WGS84-pivot workaround could "introduce error of about two meters", motivating the
   rewrite [S2 §Motivation, §WGS84 Pivot]. Immediately downstream, GDAL 3.0.1 users hit `TransformPoint`
   returning `inf inf inf` for EPSG:3879 (axis order "Northing, Easting") where GDAL 2.2.3 returned
   correct lat/lon — issue #1974, opened 2019-11-01 [S4].
2. **Failure #2 — silent wrong-order writes.** Issue #906 (2018, GDAL 2.3.1): `ogr2ogr` writing SRID 4326
   points to MySQL 8 produced `POINT (136.88… 35.17…)` (lon/lat) where MySQL 8 enforces authority order,
   rejecting the insert with "Latitude 136.881499 is out of range" [S3]. The data was not corrupted on
   disk — it was *wrongly ordered at the boundary between two components*, exactly the class of defect a
   fieldwork exchange tool must not reproduce.
3. **Fix.** PR #3311 (merged 2020-12-22, head commit `7ff336af4184f53ecd9b0bf60f717f5e66764a77`) changed
   `ogrgeojsonwriter.cpp` to swap X/Y on GeoJSON export when the CRS is lat/long or northing/easting per
   authority *and* the data-axis mapping is `{1,2}` — and to swap back after writing [S5 patch]. The PR
   body is explicit about residual risk: "this fix has the potential to break use cases of GDAL < 3 that
   still worked up to now. Sigh..." [S5 PR body].
4. **Regression test.** The same PR added `test_ogr_geojson_export_geometry_axis_order` to
   `autotest/ogr/ogr_geojson.py` (+47 lines, hunk `@@ -3107,3 +3107,50`), covering six cases: EPSG:4326
   authority order (`POINT (49 2)` must export as `[2.0, 49.0]`), EPSG:4326 with
   `OAMS_TRADITIONAL_GIS_ORDER`, `OGC:CRS84`, EPSG:32631 (easting/northing), EPSG:2393
   (northing/easting), and no-CRS [S5 test patch].
5. **Release/branch applicability.** Verified release dates: GDAL 3.2.0 published 2020-11-02 [S6a]
   — *before* the merge, so **not** in 3.2.0; GDAL 3.3.0 published 2021-05-03 [S6b] — the first
   major release window after the merge, so by timeline the fix **first shipped in 3.3.x**
   [INF from S5+S6b; direct blob presence in v3.3.0 not byte-verified in this stage]. Current stable at
   capture time: GDAL v3.13.3 (published 2026-08-18) [S6c], PROJ 9.9.0 (2026-09-15, EPSG db v13.102) [S18].
   **Applicability to Fieldbook**: the mechanism (explicit axis-mapping strategy at every boundary +
   regression tests per CRS class) is current practice in the PROJ 9.x line the proposal builds on;
   the *residual risk documented in the PR body* is why Fieldbook also runs its own round-trip check
   (§5.4) instead of trusting the library release. An issue title or a passing isolated test does not
   prove whole-product correctness — the six-case regression test above covers GeoJSON export only,
   not other drivers [FACT from S5 scope].

Related evidence that map *renderers* still have open dateline problems: Leaflet issue #1005 (2012)
reported `LatLngBounds` "does the exact wrong thing" across the 180th meridian [S16a]; an attempted fix
(PR #5164) was never merged [S16c]; antimeridian polyline handling was pushed out to the
Leaflet.Antimeridian plugin via PR #5903 (merged 2017-11-09) [S16b]; and issue #9878 (2025-09, **still
open**) reports tile flashes when panning near the antimeridian [S16d]. Consequence: Fieldbook owns
dateline handling in its own display/export layer (§5.5) and treats renderer behavior as an
implementation detail to be tested, not assumed.

---

## 4. Typical session (workflow)

1. **Load project.** Open bundle directory → integrity check (SQLite `integrity_check` + manifest hash
   verification) → show project header: CRS of each imported source, units, altitude reference, time
   provenance tags, offline status, license/attribution of the bundled basemap [CHOICE].
2. **Inspect coordinate/reference metadata.** A "References" panel lists every source with its stored
   CRS identity, axis-order resolution, transformation pipeline id and the PROJ/db versions used at
   import [CHOICE; grounded in P1].
3. **Search & preview.** Table search (indexed), map preview of a *sample* flagged as "preview of N of
   M records" — the UI states explicitly that preview is not validation (§5.5.5).
4. **Add/edit offline.** New observation gets a fresh local identity (§5.1), revision 1, provenance
   (device, time source), optional photo reference. Save = one SQLite transaction + R*Tree row +
   media manifest update; undo writes a compensating revision (§8).
5. **Save / close.** WAL commit marker; checkpoint before bundle copy [S7].
6. **Reopen elsewhere.** Bundle is self-contained; absolute paths never stored (§6.6).
7. **Merge colleague's copy.** Three-way merge against recorded common ancestor (§6.4). Conflicts are
   listed, inspectable, and resolved explicitly; result is committed atomically; a merge report is
   stored in the bundle.
8. **Export.** Streaming export of table (CSV/GeoJSON) + overlay (GeoJSON in a declared CRS, with
   provenance block). Originals untouched; export records its own provenance (transform versions, time).

---

## 5. Data and coordinate contract

### 5.1 Identity model

- **Project identity**: `project_id` = random UUIDv4 generated at creation, stored in the manifest;
  two copies of a project share `project_id` (they are copies, not siblings) and each carries a
  monotone `bundle_seq` plus device id for its own local edits [CHOICE].
- **Source identity**: each import gets `source_id` and is fingerprinted by
  (`content_sha256`, declared CRS text, axis-order resolution, importer version). Re-importing the
  same source yields the same fingerprint (§6.6).
- **Record identity**: `record_uuid` (UUIDv4) minted on the device that created the record; a numeric
  local `rowid` is a display convenience only and is never used for merging [CHOICE].
- **Geometry/edit identity**: every mutation appends a revision row
  (`record_uuid, rev_no, author_device, wallclock_utc, mono_counter, op ∈ {insert,edit,delete},
   fields_changed, geometry_changed, provenance_id`). The *edit identity* is
  (`record_uuid, rev_no`); the current state is the highest rev with op ≠ delete-tombstone. Geometry
  values are immutable once written into a revision — corrections add revisions [CHOICE; modeled on
  the append-only lesson of P2/P3].

### 5.2 Stored vs displayed vs exported coordinates

- **Stored**: each record's geometry is stored **exactly as authored/imported** in its *native CRS*
  with the `source_id`'s CRS reference. No silent unit conversion, no axis reordering, no precision
  normalization at storage time [CHOICE; consequence of P1 failures].
- **Displayed**: the map view is EPSG:3857 (Web Mercator, the tiling scheme MBTiles mandates for
  basemaps [S12 §Content]) — display coordinates are computed on demand
  `native → EPSG:4326 (pinned pipeline) → EPSG:3857 tile space`, cached per (record-rev, pipeline-id,
  viewport) with cache invalidation keyed on those three (§7.3). The displayed pin is a *rendering*;
  it carries no authority over stored data.
- **Exported**: exports re-read stored native coordinates and transform to the *export CRS chosen by
  the user at export time* (default: stored native CRS, i.e., zero transformation). The export writes a
  provenance block: source CRS, axis-order resolution, pipeline id, PROJ/PROJ-db versions, export time
  [CHOICE]. This directly addresses the brief's warning: a correct pin on screen is *not* accepted as
  proof of correct export; export verification is a separate check (§11, P4).
- **Geometry/edit identity vs coordinates**: merging uses `record_uuid`/revisions, never coordinate
  equality; coordinate equality is only a *duplicate heuristic* input (§6.5).

### 5.3 Support boundary (v1) — stated, not universalized

- **CRS**: any CRS PROJ can resolve (EPSG code or WKT2) — which in practice is the EPSG database
  shipped in `proj.db` (v13.102 in PROJ 9.9.0 [S18]) — *provided* axis order is resolvable by one of:
  (a) authority definition (e.g., EPSG:4326 = lat/lon [S5 test case 1]), (b) declared
  traditional-GIS order, or (c) an **explicit user choice at import** recorded in provenance. Unknown
  identifiers (e.g., a national registry code not in EPSG — cf. the real `fguuid:jgd2024.bl` case in
  GDAL issue #12897 [S3-related search capture, item 12897]) put the import into *review-required*
  state with the unknown metadata displayed verbatim; nothing is imported on a guess.
- **Geometry types**: points and linestring tracks; notes are text fields; photographs are referenced
  media. Polygons, multi-geometries, measured (M) geometries, curves and rasters are **out of v1
  scope** [CHOICE]. GDAL's own curve/measured support history (RFC 49/61 [S19]) shows these are
  separable modules; Fieldbook defers them deliberately.
- **Units**: angular units and linear units are taken from the CRS definition (PROJ reports them);
  user-entered "distances" are always meters in UI text and tagged as such. Altitude: stored as given,
  with a mandatory tagged reference per record: `ellipsoidal | orthometric-<model> | unknown | none`;
  `unknown` altitude is displayed as such and never silently mixed with other references [CHOICE].
- **Time**: stored UTC with a provenance tag `gnss | device-clock | manual | imported`, original
  timezone string retained. PROJ 9.9 added `proj_crs_is_dynamic()` and `cs2cs` now *warns* when a
  dynamic CRS is used without an epoch [S18]; Fieldbook adopts the stricter rule: transformations
  involving a dynamic CRS **refuse to run** until the user picks an epoch, which is recorded
  (coordinate-epoch support is an explicit GDAL concern in RFC 81 [S19]).

### 5.4 Transformation versioning and validation

- Every import stores: CRS identity text (WKT2), axis-order resolution, and the *pinned pipeline*
  actually used for the import's validation round-trip, plus `proj_version`, `proj_db_version` (EPSG
  version) [CHOICE, grounded in S1/S2/S18].
- **Import validation** [PROPOSED/UNEXECUTED as product check; arithmetic core executed as W1]:
  (1) all records round-trip `native → WGS84 → native` with per-axis tolerance (default 1 mm linear
  equivalent or 1e-9 degrees); (2) domain check: resulting longitudes within [-180,180], latitudes
  within [-90,90] (projected CRS: values within the CRS area-of-use reported by PROJ); (3) boundary
  scan (§5.5.1). Failures do not abort the import silently: failed records go to the visible
  `needs-review` bin with the failure reason; imported-but-unvalidated records are marked
  `unvalidated`, never `clean`.
- **Re-validation on version change**: if the app's PROJ/EPSG versions differ from those recorded at
  import, the project opens read-only-*safe*: transforms re-run and are re-validated before any
  further edit; the References panel shows "engine changed since import: 9.7.1 → 9.9.0, revalidation
  result: pass/fail". [INF from the RFC 73 experience: transformation results genuinely change across
  engine versions, cf. late binding removing the 2 m WGS84-pivot error S2 §WGS84 Pivot.]
- **Export validation**: after writing an export, the tool re-imports it in-memory (round-trip through
  the same reader path) and compares a bounded sample + all *boundary-adjacent* records; mismatches
  fail the export loudly [PROPOSED/UNEXECUTED, P4]. This encodes the brief's rule that a pretty map is
  not evidence.

### 5.5 Edge cases investigated (no universal behavior invented)

1. **Domain/coordinate boundary proximity.** Points near the CRS validity edge (e.g., EPSG:3879
   Finland — the CRS from real failure #1974 [S4]) or near lat ±90 (Web Mercator's own domain edge;
   inverse of ±90° is ±∞ in the formulas W1 executed). Design: records whose distance to a declared
   domain boundary is below a configurable epsilon (default 1e-6 deg) are flagged
   `boundary-adjacent` at import and always included in export verification, not just sampled.
   Contained-within spatial queries expand their window by the R*Tree rounding rule
   (0.000012%, outward) so boundary points are never dropped from viewport results [S8 §3.4;
   applied in W2's design]. [INF/CHOICE]
2. **Tracks spanning a discontinuity.** A track crossing the antimeridian (or any two-point segment
   whose display longitudes jump > 180°) is *never* rewritten in storage; the display layer splits the
   polyline at the discontinuity for rendering only, and exports keep native vertices with a warning
   entry in the export provenance. Rationale: the renderer ecosystem still exhibits open dateline
   defects (Leaflet #1005/#9878; plugin-only fix path #5164/#5903 [S16]), so Fieldbook must not depend
   on renderer wrapping; and "fixing" data at render time would violate §5.2. Whether a long jump is a
   dateline crossing or a bad vertex is **not guessed**: segments flagged `suspect-jump` are surfaced
   for review. [CHOICE]
3. **Incomplete coordinates.** Missing latitude, missing altitude, or unparseable values: the record is
   committed as `partial` with the missing components null and a machine-readable reason; it appears in
   tables/search and in a "Needs review" counter; it is excluded from map display (nothing is invented)
   and exports include it with an explicit `location_status=partial` field rather than silently
   dropping it. [CHOICE; grounded in the brief's "do not hide failed records"]
4. **Conflicting identifiers.** External keys (site codes) are mapped through an `identifier_map`
   table (`identifier → record_uuid, source_id`). If two different `record_uuid`s claim the same
   external identifier at merge time, that is a *merge conflict of type identifier-dupe* — listed and
   resolved by explicit user choice (link/keep both/rename); never auto-resolved. [CHOICE]
5. **Preview ≠ validation.** The UI never states or implies that previewing a sample validates the
   import; sample previews are labeled "previewing N of M records". Whole-file validation is the
   bounded full-scan in §5.4 (250k round-trips are cheap arithmetic — W1-class cost), which is
   affordable precisely because it is arithmetic, not rendering. [CHOICE]

---

## 6. Revision, merge, and recovery contract

### 6.1 Offline editing semantics

- **Append**: `insert` revision; visible immediately in the author's copy.
- **Edit**: new revision with only changed fields; old revisions immutable (undo = compensating
  revision, §8).
- **Delete**: `delete` tombstone revision; tombstoned records hidden by default, restorable until a
  merge *commits* the tombstone against a clean ancestor; after that, restore is still possible as a
  new `insert` revision referencing the old record (provenance preserved). No physical deletion in v1
  [CHOICE].
- All writes are single SQLite transactions touching the record table, revision table, R*Tree, and
  FTS index together [INF from S9's atomic-commit guarantee: the commit marker makes the group of
  changes all-or-nothing].

### 6.2 Divergence and merge

- Two copies diverge after exchanging at a common ancestor `bundle_seq`. Merge = 3-way at **record
  revision** granularity: for each `record_uuid` present in both, compare revision chains against the
  ancestor chain recorded in the last exchange state (the "exchange card" JSON both sides write when
  bundling for hand-off; if absent, merge still works using each side's full revision history and the
  older of the two bundles' creation manifests as a weak ancestor — flagged as `ancestor-uncertain`) [CHOICE].
- **Auto-merge only when safe**: disjoint field edits merge automatically; identical changes collapse;
  anything else (same-field divergence, edit-vs-delete, identifier-dupe, duplicate-candidates) becomes
  a conflict entry with base/mine/theirs values [CHOICE; executed semantics in W3].
- **Conflict presentation**: a merge report (stored at `merge/merge-<utc>-<seq>.json` + a UI screen)
  lists counts per type and each conflict with three panes (ancestor / local / incoming) plus
  provenance for each side. Resolution choices: keep mine / take theirs / keep both as separate
  records (with cross-links) / manual combined value. No silent resolution, including for deletions
  [CHOICE; lesson from P2: even Syncthing keeps the losing side as a named conflict copy and
  propagates it [S11]].
- **Failed records**: a merge never discards provenance or hides failures to appear successful;
  per-record apply failures land in the report with reasons and stay in `needs-review`.

### 6.3 Duplicates

Detection heuristic (bounded, reviewable, never auto-applied): two records are *possible duplicates*
if same source import AND geometry within tolerance (default 2 m) AND capture times within 60 s AND
name similarity ≥ 0.9. They are flagged; a human decides. [CHOICE; heuristic validation
PROPOSED/UNEXECUTED, P5.]

### 6.4 Merge execution and interrupted merges

Merge writes into `staging_*` tables inside **one transaction** and finishes by writing a
`merge_commit` marker row (merge report id, timestamp) in the same transaction. On reopen:
- staging tables present + marker present → merge is complete, staging is cleared;
- staging present + marker absent → **interrupted merge**: all staging rows are quarantined into
  `quarantine/` tables, surfaced as "incomplete work" with a review screen (adopt / discard
  whole-quarantine only), and the project's committed state is exactly as before the merge attempt.
This is the storage-level commit boundary demonstrated in W4 [EXECUTED-BY-CANDIDATE]: a second
connection saw only the committed record while the transaction was open, and after a crash-like close
only committed rows remained — consistent with SQLite's documented atomic-commit guarantee [S9 §3.11,
§4]. Import runs the same staging+marker pattern. **Scope limit**: W4 exercised the SQLite boundary
on a synthetic table in a sandbox, not the Fieldbook product; the product-level claim is
[PROPOSED/UNEXECUTED, P6].

### 6.5 Recovery after interrupted save

A save is one transaction (§6.1); an interrupted save therefore leaves the project at the last
committed state, and the UI's draft buffer (unsaved form contents) is additionally journaled to a
`drafts/` file written via temp-file-rename (P2's discipline [S11 §Temporary Files]) so an interrupted
*edit session* can be offered for recovery on reopen. Committed records vs drafts are distinguished in
the UI at all times. [CHOICE]

### 6.6 Re-import and relocation

- **Re-import of the same source**: fingerprint match (§5.1) → the app reports "identical source
  already imported" and makes **no changes**; fingerprint differs → the new file becomes
  `source_id#rev2`; existing records stay linked to their original revision; a diff report
  (added/changed/unchanged rows vs prior rev) is shown before commit. No silent overwrite. [CHOICE]
- **Relocation of project media**: the bundle stores no absolute paths; photos live in
  `media/<sha256-prefix>/<sha256>.<ext>` and are referenced by content hash; moving or renaming the
  bundle directory cannot break references. Verified referential integrity is part of open-time
  integrity check [CHOICE; product check PROPOSED/UNEXECUTED, P7].

---

## 7. Architecture and resource plan (4 cores / 8 GB / 250k observations target)

### 7.1 Bundle layout

```
project.fb/
  manifest.json            # project_id, bundle_seq, schema_version, licenses, source fingerprints
  data/obs.db              # SQLite (WAL): records, revisions, rtree, fts, identifier_map, staging, quarantine
  media/<sha>/...          # photographs, content-addressed
  maps/<source>.mbtiles    # offline basemap(s), one per licensed source [S12]
  merge/                   # merge reports
  drafts/                  # unsaved-form journals
  provenance/              # import/export records, pinned pipelines
```

### 7.2 Storage

One SQLite database in WAL mode on local disk [S7]. WAL was chosen for concurrent map reads during
writes; its documented constraints are respected: **WAL does not work over network filesystems**
[S7 §Overview disadvantages] — the app refuses to open a project from a network share read-write
(read-only or copy-to-local is offered) — and **`-wal` must travel with the DB**, so bundle
export/copy always checkpoints first and verifies both files [S7 §4]. Large-transaction behavior is
not a concern at v1 scale (WAL handles large transactions since 3.11 [S7 §6]). Photographs are stored
outside the DB because SQLite's own guidance is that BLOBs larger than ~100 KB read faster from
files, and photos are typically >100 KB; the same page's caveat "double-check these figures on target
hardware" is honored by the validation plan (P8) [S10]. [CHOICE, factually grounded]

### 7.3 Indexing and cache invalidation

- **Spatial**: R*Tree virtual table over record bounding boxes (points: degenerate boxes; tracks:
  true bbox) [S8]. Viewport query joins R*Tree to the record table by integer key; W2 shows the plan
  using the virtual-table index (`SCAN r VIRTUAL TABLE INDEX 2:D0B1D2B3`) [EXECUTED-BY-CANDIDATE].
- **Text**: SQLite FTS5 over notes/names (v1 field tool; search is by prefix/substring, no ranking
  promises). [CHOICE]
- **Invalidation**: every cached artifact (display transforms, tile decodes, export previews) is keyed
  by `(project bundle_seq, record rev set hash for the viewport, pipeline-id, PROJ version, mbtiles
  sha256)`. Any commit bumps `bundle_seq`; GeoPackage interop note: external GeoPackages carry only an
  *informative* `last_change` timestamp that "should be treated as informative" [S17, byte range
  250000–256000, Requirement 15] — therefore Fieldbook never trusts foreign `last_change` for
  invalidation and recomputes content hashes for imported files instead. [INF + CHOICE]

### 7.4 Viewport access and cancellation

Map frame requests `(bbox, limit)` batches; the data layer returns at most `limit` (default 5,000)
records per frame prioritized by insertion into the R*Tree result, plus an "N shown of K in view"
badge. Track simplification for display is cached per zoom band. **Cancellation**: every long task
(import, merge, export, revalidation) runs on a worker with cooperative cancellation checks every
bounded row batch; cancel leaves the staging+marker state well-defined (§6.4). [CHOICE]

### 7.5 The 250k target — what is promised

- *Inspect* a 250k-observation project: open, search, viewport browsing, bounded exports — target:
  open < 3 s warm, viewport interaction < 100 ms p95 on the reference machine. [ENGINEERING TARGET as
  the brief defines; not a benchmark.]
- Evidence to date: W2 [EXECUTED-BY-CANDIDATE] on synthetic data in the admitted sandbox (SQLite
  3.46.1, RTREE compiled in): 250k inserts in 2.73 s; indexed viewport query 0.65 ms vs 16.2 ms
  unindexed full scan; identical hit counts (196) both ways. **Scope limits**: in-memory DB, sandbox
  CPU/RAM (component limit 256 MB per the receipt), synthetic uniform points, one viewport shape; not
  a benchmark of the 4-core/8 GB target and not whole-app evidence. Photo/track loads, FTS, and UI
  costs are not covered.
- Memory plan: streaming cursors (no full-table materialization), bounded page cache
  (`PRAGMA cache_size` cap ≈ 256 MB), export in 10k-row batches with progress + cancel; the 8 GB
  budget is dominated by map rendering, so tile decode cache is capped (e.g., 512 MB) with LRU
  eviction. [INF/CHOICE]
- Export of large tables is streamed to a temp file and atomically renamed (P2 discipline), so an
  interrupted export never replaces a good file. [CHOICE]

### 7.6 Offline envelope

v1 performs **no network I/O at all** except the user-initiated basemap download at project creation.
"Offline state" is therefore trivially honest: a status chip shows `Offline by design; basemap: bundled
(<source>, <license>)`. Everything in §4–§6 works with radios off. [CHOICE; consequences in §9]

---

## 8. UX requirements

- **Coordinate/provenance legibility**: every coordinate display shows native value + CRS name +
  axis order used; every record has a provenance view (who/when/device/time-source/CRS/pipeline).
  [CHOICE; direct response to §5.2]
- **Error feedback**: errors state (a) what failed, (b) which records, (c) what state the project is
  in now, (d) the bounded choices. No modal-only failures; the Needs-Review bin is a first-class list.
- **Accessibility**: standard toolkit widgets, full keyboard operation of the table/form flows
  (tab order, arrow-key grid navigation, shortcuts for new/save/undo/next-conflict), visible focus,
  WCAG 2.1 AA contrast target; map interaction is complemented by table-first editing so map mouse
  use is never the only path. [CHOICE; a11y conformance testing is PROPOSED/UNEXECUTED, P9]
- **Offline state**: explicit chip + "no network calls performed" note in About (§7.6).
- **Undo**: session undo stack where every entry is an applied compensating revision (so undo survives
  restart as a visible "revert to revision" action); undo of a *merge commit* is a new revert-merge
  operation, never a history rewrite. [CHOICE]

---

## 9. Bundled map/source data licensing

Investigated for the sources actually proposed for bundling:

- **OpenStreetMap (vector extract → rendered offline tiles)**: OSM data is ODbL; "If you alter or
  build upon our data, you may distribute the result only under the same license", attribution notice
  and license-link requirements apply, and the OSM Foundation states it "cannot provide a free-of-charge
  map API or map tiles for third-parties" [S13]. Consequences: bundling an OSM-derived basemap in a
  project bundle that leaves the machine is redistribution of an ODbL derived database — attribution
  metadata must ride in `manifest.json` and the MBTiles `attribution` row [S12], and whether the
  group's *observation* records (their own data) remain unencumbered requires the produced-works
  analysis to be done against the group's sharing practice [UNCERTAIN → L1]. Engineering rule chosen:
  keep OSM-derived layers in clearly separated files with license metadata, never mingled with
  observation data. [CHOICE]
- **Natural Earth**: public domain — "No permission is needed… Crediting the authors is unnecessary"
  [S14]. Suitable as the permissive small-scale default basemap; detail is limited at survey scale
  [INF]. v1 default: Natural Earth for context + optional OSM extract where detail is required.
- **Tile-service assumption check**: the brief's warning is confirmed — free access to a web map
  (osm.org) does not confer bulk/offline tile rights; the OSM copyright page points third-party tile
  use to a usage policy that the site explicitly frames as an additional service constraint [S13
  §Additional services]. The dedicated tile-policy page itself was unreachable from the admitted tool
  (3 attempts, `OSError`) — recorded in `leads.json` (L6) with the substitution noted.
- **Precedent corroboration**: ODK Collect ships the same split — OSM/USGS/Carto basemaps need no
  token, Mapbox requires an account token [S15 §Using APIs for local development]. Fieldbook's v1
  accepts **no accounts, no keys** [CHOICE].

---

## 10. Support, resource and recovery limits (honest boundary)

- Supported in v1: points + tracks; CRS via PROJ with bounded axis-order resolution; SQLite-scale
  projects (~250k observations); MBTiles basemaps (raster or vector — vector rendering cost is a risk,
  see L4); photos as files; single-user-per-device editing; bundle hand-exchange merge.
- Not supported / not promised in v1: real-time sync; hosted service; polygon editing; raster
  observation imports; automatic conflict resolution; datum-transformation grids beyond those shipped
  in the bundled PROJ data set — datum shifts that require grid files absent from the bundle will fail
  *loudly* with the missing-grid named, rather than silently degrading [INF from PROJ's grid-based
  transformation model; grid-availability behavior is a PROJ concern to verify, L2].
- Recovery envelope: interrupted save/import/merge/relocate recoverable per §6; a *corrupted* bundle
  (bit rot, partial copy) is detected by manifest hash mismatch and recoverable only from the last
  good export/backup the user made — v1 adds no replication. Stated plainly: **Fieldbook does not
  promise perfect merge**; it promises that nothing is lost silently and every conflict is inspectable.

---

## 11. Validation plan

Executed in this stage [EXECUTED-BY-CANDIDATE] — receipts (code, data hash, stdout, exit, sandbox
limits) in `witnesses.json`:

- **W1 axis-order trap (arithmetic)**: Web Mercator forward/inverse in pure Python; correct
  round-trip for (lon 13.405, lat 52.520); feeding the values swapped lands the point 5,556.1 km away;
  exit 0. *Scope*: arithmetic only, not PROJ; demonstrates the failure class of §3, not library
  behavior.
- **W2 R*Tree viewport at 250k (component)**: SQLite 3.46.1 in-sandbox; RTREE compiled in; indexed
  viewport 0.65 ms (196 hits) vs 16.23 ms full scan, plan confirms virtual-table index; identical hit
  counts. *Scope*: synthetic uniform points, in-memory DB, sandbox hardware; supports feasibility of
  §7.3/§7.5 only.
- **W3 merge semantics (toy)**: three-way merge over record fields — disjoint edits auto-merge;
  same-field divergence and delete-vs-edit produce structured conflicts with base/mine/theirs. *Scope*:
  a 20-line function; not the product merger.
- **W4 commit boundary (component)**: WAL DB; second connection sees only the committed row while a
  transaction is open; after crash-like close, uncommitted row is gone. *Scope*: SQLite behavior
  sample consistent with [S9]; not Fieldbook's staging logic.

Proposed / UNEXECUTED (designed, require the implementation to exist):

- **P1 import validation suite**: CRS corpus with known-good answers (incl. EPSG:3879, EPSG:2393,
  CRS84, boundary-adjacent points) through the real import path.
- **P2 axis-order regression port**: port `test_ogr_geojson_export_geometry_axis_order`'s six cases
  [S5] to Fieldbook's export tests.
- **P3 kill-point recovery matrix**: inject failures at every phase of import/merge (before staging,
  mid-staging, after staging before marker) and assert reopen state matches §6.
- **P4 export round-trip verification** (§5.4) incl. boundary-adjacent records.
- **P5 duplicate-heuristic evaluation** on labeled synthetic data (precision/recall report).
- **P6 merge fuzz**: generated divergence pairs; assert no-loss invariant (union of surviving
  values ⊇ inputs except explicit user deletions) and report completeness.
- **P7 relocation test**: move bundle across filesystems (and a FAT-formatted stick, to exercise
  name/hash discipline); assert integrity check passes.
- **P8 photo-access benchmark on reference hardware** honoring [S10]'s "double-check" caveat.
- **P9 accessibility audit** (keyboard-only pass + screen-reader labels + contrast).

An executed component check never establishes whole-product behavior; P1–P9 exist because only
end-to-end tests on the real tool can.

---

## 12. Opportunities and alternatives

### 12.1 Opportunities (optional adoption, not minimums)

- **O1 EXIF-assisted capture**: prefill observations from photo EXIF GPS/time (user confirms; never
  auto-writes coordinates). High field value.
- **O2 device-to-device direct exchange**: merge over a local Wi-Fi/USB link using the same
  revision/merge machinery (same exchange-card format), removing the "two laptops on one desk" step.
- **O3 hosted exchange later**: the revision log is already the right substrate for a
  pull-based sync service; the conflict UI is unchanged. Deliberately not v1 (no accounts rule).
- **O4 broader map sources**: the MBTiles adapter is source-agnostic; additional sources are new
  *license reviews*, not new code (lesson of §9).
- **O5 automated classification** of observations (photos/audio) as assist-only suggestions.

### 12.2 Plausible alternative architecture

**Alt-A (viable alternative to the chosen shape)**: build Fieldbook as a **QGIS profile + offline
editing workflow** — QGIS already bundles PROJ/GDAL (P1), reads/writes GeoPackage (gpkg_contents
provides the informative-change metadata [S17]), and has an established undo framework. *Bounded
trade-off*: far less new code and stronger CRS ergonomics, but merge of two divergent project copies
would remain a manual/GDAL-assisted step, the UX could not guarantee the §6 contract without plugins,
and packaging a 300 MB+ desktop GIS for tablets is heavy. Chosen v1 (custom, small) vs Alt-A is a
**product choice**; if the group already runs QGIS, Alt-A is the faster first deployment [INF].

**Alt-B (storage)**: SpatiaLite/GeoPackage as the on-disk format instead of plain SQLite+R*Tree —
better interop with the GIS ecosystem, at the cost of native-library packaging and the informative-only
change tracking [S17]. Kept as a lead (L3).

---

## 13. Uncertainty register (consequential unresolved dependencies)

- **U1 / L1 ODbL produced-works boundary** for group-shared bundles (§9): needs a license review
  against the group's actual sharing practice; if unresolvable, the bounded fallback is
  Natural-Earth-only basemaps (public domain) with OSM extracts used only where legally cleared.
- **U2 / L2 PROJ datum-grid availability offline**: which transformations need downloadable grids, and
  what PROJ does when a grid is missing, was not pinned in this stage; v1 must verify and fail loudly
  (L2).
- **U3 docs.getodk.org and the OSMF tile-policy page were unreachable** from the admitted tool; ODK
  facts rest on the captured repo metadata/README [S15] and the tile-policy point on the captured OSM
  copyright page [S13]. Retry from a permitted network later.
- **U4 vector-MBTiles rendering cost** on 4-core/8 GB for dense areas (raster fallback exists).
- **U5 the 250k target** is an engineering target, not a measurement; only the W2 component evidence
  exists so far.
- **U6 first-release containing GDAL PR #3311** inferred as 3.3.x from verified merge/release dates;
  direct blob verification pending (§3.5).

Useful supported content preserved despite deferrals: O2/O3 (exchange-card format), Alt-B (GeoPackage
storage), O1/O4/O5 — all grounded above and listed with status in `leads.json`.
