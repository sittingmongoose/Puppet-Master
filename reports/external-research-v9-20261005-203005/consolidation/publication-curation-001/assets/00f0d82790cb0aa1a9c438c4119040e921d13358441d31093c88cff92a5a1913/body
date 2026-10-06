# FieldBook — local-first offline field observations and map exchange
## Research-stage proposal (brief H2), research arm, 2026-10-06

**Labeling used throughout**
- **[FACT]** external fact from a captured public primary source, with pin (URL + locator + capture sha256 in `sources.json`).
- **[INF]** engineering inference by the candidate from those facts.
- **[CHOICE]** product decision this proposal makes; a different defensible choice is possible.
- **[UNCERT]** unresolved uncertainty; see `leads.json`.
- **[EXEC-candidate]** executed by the candidate inside the admitted isolation (receipt ids given; isolated component checks only). **[PROPOSED/UNEXECUTED]** designed but not run in this stage.

---

## 1. Product scope

**[CHOICE]** FieldBook v1 is a desktop application (laptops/tablets) for a small environmental survey group. A *project* is a plain folder bundle that can be copied on USB stick or shared folder: `project.sqlite` (observations, revisions, indexes), `manifest.json` (identity, CRS registry, license manifest), `blobs/` (content-addressed photos and attachments), `tiles/` (bundled basemap tiles + license manifest). Two group members edit their copies offline and later *combine* them by exchanging project bundles; the app reconciles them with explicit conflicts. It is a research field tool — not emergency navigation, not a hosted/cloud service, not real-time collaborative sync.

Minimum v1: offline record/create/edit of points, short tracks, notes, optional photos; search and preview; bounded map viewport over a bundled area; import of an observation table with heterogeneous coordinate metadata; merge of two divergent copies with inspectable conflicts; recovery after interrupted save/import/merge; table + map-overlay export with originals intact.

Explicitly out of v1: route guidance, hosted accounts, automated classification, broad map-source support, real-time sync (see §9 for these as later opportunities).

---

## 2. External facts the design stands on

**F1 — Axis order is a chronic, documented failure class. [FACT]** GDAL's own tutorial: axis order "is a constant matter of confusion and vary depending on conventions used by geodetic authorities, GIS user, file format and protocol specifications, etc. This is the source of various interoperability issues." Since GDAL 3.0, the authority-mandated order is honoured by default (`OAMS_AUTHORITY_COMPLIANT`), and `OAMS_TRADITIONAL_GIS_ORDER` exists as an explicit escape hatch.
Pin: `https://gdal.org/en/stable/tutorials/osr_api_tut.html` § "CRS and axis order" (anchor `#crs-and-axis-order`), capture sha256 `db51c071…8b14` (full hash in `sources.json`).

**F2 — A real issue → fix → regression-test chain in PROJ (axis-order normalization). [FACT]**
- Failure: issue `OSGeo/PROJ#4631` (opened & closed 2025-12-04): `proj_normalize_for_visualization()` returned NULL/throw for *valid* concatenated operations whose sub-operations have non-overlapping validity areas — concrete case EPSG:8047 (ED50→ED87→WGS84, sub-ops EPSG:1147 Norway-area and EPSG:1146 North Sea). This breaks the standard route to (x,y)/(lon,lat) working order — pyproj's `always_xy=True` calls this function. The user workaround was a hand-built `+step +proj=axisswap +order=2,1` pipeline wrapper, described as "error-prone".
- Fix: PR `OSGeo/PROJ#4632` "fix normalizeForVisualization to skip extent checks for axis-swap operations", `merged_at 2025-12-04T19:20:30Z`, milestone **9.8.0** (milestone closed 2026-03-02). Patch (3 files, head commit `6e42eb13b903a9c9225acf62ba1a7334711dbadc`):
  - `src/iso19111/operation/singleoperation.cpp` (+35/−2): `normalizeForVisualization()` now builds the result via `ConcatenatedOperation::create` over *flattened* sub-operations, preserving domains, and names it `"<op> (with axis order normalized for visualization)"`.
  - `src/iso19111/operation/concatenatedoperation.cpp` (+4): propagates `hasBallparkTransformation` through concatenated operations — i.e., the fix *also* repairs a provenance-propagation defect (a ballpark (unknown-accuracy) step inside a concatenation was not flagged on the whole).
  - `test/unit/test_operation.cpp` (+27): regression test inside `TEST(operation, normalizeForVisualization)` — creates EPSG:8047, asserts normalization now succeeds (previously threw), PROJ string exports, name suffix, domains preserved.
- Release/branch applicability: fix is in the 9.8 milestone; current stable per a captured issue body is "PROJ 9.8.1 (Rel. 9.8.1, April 10th, 2026)" (reporter's claim in `OSGeo/PROJ#4842`). Whether it was backported to 9.7.x is **[UNCERT]** (a `backport 9.8` label exists on a sibling PR #4708, not on #4632 in the captured data). Consequence for FieldBook: *pin and record the PROJ version per project*; do not assume uniform behavior across library versions.
- Lessons for this design: (1) axis-order handling and domain/extent validation are entangled in real libraries — a pure "reorder" request can fail for valid data; (2) provenance flags (ballpark) can silently fail to propagate; (3) manual pipeline workarounds are error-prone — the app should carry explicit axis-order metadata rather than rely on library defaults.

Pins: `https://github.com/OSGeo/PROJ/issues/4631` (capture sha256 `fb7983ef…43d9`, complete 8915 B); `https://github.com/OSGeo/PROJ/pull/4632` files API (sha256 `30befc66…1edf7`, complete 6438 B, includes the three file patches above).

**F3 — The same failure class is still live elsewhere (open regression). [FACT]** Issue `OSGeo/gdal#15337` (created 2026-10-04, **open** at capture time): "OpenFileGDB: spatial index misses features on Web Mercator layers with PROJ 9.7.1". Reporter's reproduction table: a spatial-index helper transforms (0, ±89.9) from `CloneGeogCS()` *without* `OAMS_TRADITIONAL_GIS_ORDER`; with PROJ 9.7.1 the cloned CRS axis order differs and "both northing limits come out 0", so box queries return 0 features (with `OPENFILEGDB_USE_SPATIAL_INDEX=NO` they find them). Reporter also warns the *writer* path may persist zero northings into index files. No merged fix visible at capture; status open.
Lessons: (1) deriving *index* coordinates through implicit axis mapping silently misses data — the exact "displayed pin / successful query ≠ exported or indexed correctness" trap in the brief; (2) an open issue title or a passing isolated test is not whole-product correctness; FieldBook must generate index coordinates only from its own explicit axis-order metadata and re-verify after library upgrades.
Pin: `https://github.com/OSGeo/gdal/issues/15337` (via search API capture sha256 `4a0e9f4e…e214e60`, item 1).

**F4 — SQLite R*Tree storage behavior (bounding-box index facts). [FACT]** sqlite.org/rtree.html: R*Tree coordinate pairs are stored as **32-bit floats** (`rtree`) or 32-bit ints (`rtree_i32`), silently narrowed on write; lower bounds round down, upper bounds round up, so "contained-within" style queries **can miss entries at exact edges** — the doc's remedy is for applications to expand query boxes (by ~0.000012%). Writing to an R*Tree during an unfinished scan of the same tree fails with `SQLITE_LOCKED`; the doc recommends materializing result ids into a temporary table before updating. Auxiliary `+columns` (SQLite ≥ 3.24.0) avoid joins; `rtreecheck()` verifies index integrity.
Pins: `https://www.sqlite.org/rtree.html` §3.4 "Roundoff Error", §3.5 "Reading And Writing At The Same Time", §3.1 (types), §4.1 (aux columns), §7.2 (`rtreecheck`), capture sha256 `de560a2e…4cd55`.

**F5 — Offline divergence done right: CouchDB's replication conflict model. [FACT]** docs.couchdb.org §2.3 "Replication and conflict model": concurrent edits produce *both* versions on both peers; a deterministically-chosen "winner" is what a plain read returns — "It could look as if the changes … have been lost - but of course they have not … [but] eventually she'll need these changes merged … otherwise they will effectively have been lost. Any sensible … application will, at minimum, have to present the conflicting versions." Revision trees branch, losers are deleted-but-recoverable leaves, compaction drops non-leaf bodies but keeps revision identity lists; `?conflicts=true` / `open_revs=all` expose conflicts; on a single node, conflicting writes are rejected (409) instead of silently stored.
Lesson: FieldBook should *never* show a silent arbitrary winner across machine merges; conflicts must be first-class, queryable records; identity/revision lists must survive compaction/pruning.
Pin: `https://docs.couchdb.org/en/stable/replication/conflicts.html` §2.3.1–2.3.4, capture sha256 `18adf909…b30aec5`.

**F6 — Bundled basemap license for the selected source: Natural Earth. [FACT]** Terms of Use page: "All versions of Natural Earth raster + vector map data … are in the public domain. You may use the maps in any manner, including modifying the content and design…"; "No permission is needed to use Natural Earth. Crediting the authors is unnecessary."; accuracy disclaimers; embedded third-party components (Washington Post, EC JRC IES, XNR, International Mapping) released for the world base map; names from Wikidata under CC0. This makes offline bundling and modification of Natural Earth-derived tiles permissible without share-alike obligations.
Pin: `https://www.naturalearthdata.com/about/terms-of-use/`, capture sha256 `1ef41cb2…f7db9f92c`.

**F7 — OSM/ODbL tile-policy verification is blocked in this environment. [FACT/UNCERT]** Three fetch attempts to `operations.osmfoundation.org/policies/tiles/`, `osmfoundation.org/wiki/Tile_usage_policy`, and `wiki.openstreetmap.org/wiki/Tile_usage_policy` all failed with transport (`OSError`) errors on 2026-10-06. Consequence: ODbL attribution/share-alike and tile-usage constraints for OSM-derived offline bundles are **UNVERIFIED here**; v1 therefore does not bundle any ODbL-licensed source (see §8 and `leads.json` L1).

---

## 3. Identity contract [INF/CHOICE]

Four identities are kept distinct — conflating them is what makes "a displayed pin" lie about exported data.

| Identity | Definition | Where it lives |
|---|---|---|
| **Project identity** | `project_id` = UUIDv4 minted at project creation; never regenerated by copies. Copies carry the same `project_id` + a per-copy `replica_id` (UUID) and a monotonically increasing `op_seq` counter. | `manifest.json`, `project.sqlite` |
| **Observation identity** | `obs_id` = UUIDv4 minted at record creation (import row or field capture). Source primary keys are *provenance*, never identity: the importer always mints `obs_id` and stores `(import_session_id, source_pk, source_row_hash)`. Two rows with the same source key are duplicates-to-review, not the same record. | `obs` table |
| **Geometry/edit identity** | A record's current content is identified by `rev = hash(prev_rev ‖ canonical_payload ‖ author ‖ replica_id ‖ hlc_ts)` (hash chain). Geometry identity is *not* separate from record identity in v1: a geometry edit is an update of the record payload; the raw stored geometry (original values, original CRS declaration) is carried per revision so every historical placement is auditable. | `ops_log` |
| **Media identity** | Photos/attachments = sha256 content address; stored once under `blobs/ab/<sha256>`; referenced by relative path only. Moving the bundle root cannot break references; a missing blob surfaces as `media_missing`, never as a silent blank. | `blobs/`, manifest |

**Re-importing the same source [CHOICE]:** import computes a content hash of the source file; a re-import creates a *new* `import_session` referencing the previous hash and emits normal `update` ops with provenance `reimport_of:<hash>`. Original rows are never mutated in place; every prior revision remains in `ops_log`. If the file hash is identical, import is a no-op aside from recording the session.

---

## 4. Coordinate contract [INF/CHOICE], grounded in F1–F4

**Stored vs displayed vs exported.**
1. **Storage** keeps each geometry in its *declared source form*: raw numeric values verbatim, plus `crs_id` (FK into the project CRS registry), plus the declared axis order and linear/angular units. Storage never silently rewrites coordinates. (Reason from F1/F3: any implicit reinterpretation is the historic source of silent corruption.)
2. **Display** coordinates are computed on demand: storage CRS → map CRS (EPSG:3857-class) through a PROJ pipeline built with *explicit* axis mapping (FieldBook's registry carries axis order explicitly — the moral of `OAMS_TRADITIONAL_GIS_ORDER` in F1 and the F3 regression). Display values are a cache keyed by `(obs_rev, transform_id)` and are invalidated when either changes. A pin on screen is a rendering of this cache — the export path does **not** read from the pin.
3. **Export** coordinates are regenerated from *stored raw values* through the pinned pipeline at export time, and each export writes per-record: target CRS, axis order, `transform_id`, and a summary of records that could not be transformed (see below). Originals also ship untouched: export = `observations.csv` (working CRS) + `source_originals.csv` (verbatim values + declaration) + `overlay.geojson` + `unresolved.csv`. Nothing that failed appears as a normal row.

**CRS registry and unknown metadata.** Registry rows: `{crs_id, kind ∈ {epsg, wkt2_2018, projjson, unknown}, definition, axis_order_declared, unit_angles, unit_lengths, validated_against(projdb_version)}`. Imports whose metadata is missing or ambiguous (no CRS; both values plausible lon/lat and lat/lon; mixed units) are stored with `kind=unknown` and status `undetermined`: they appear in tables, searches and counts, but **no map pin is drawn** — displaying a pin for an unknown-CRS record would fabricate placement. The user resolves via a bounded correction dialog: pick a CRS from candidate lists filtered by the project region, with an option to keep as unknown. Candidate preview shows where *sample* rows would land **and is labelled "preview — not validation"** (brief requirement: sampling cannot establish whole-import validity; a full-file structural pass — row count, checksum, per-column type/domain scan — runs at import and reports what was and was *not* validated).

**Transform identity, versioning, validation.** Every pipeline gets `transform_id = sha256(pipeline_string, PROJ lib version, proj.db version, grid filenames+sha256)`. `transform_id` is stored on every derived artifact (display cache entries, export rows, overlay files). On app or PROJ upgrade, a revalidation job recomputes `transform_id`s; changed ones raise a visible "recheck" badge batch (grounded in F2: behavior differences between library versions are real, e.g. the 9.7.x→9.8 axis/ballpark changes). Silent ballpark/unknown-accuracy fallbacks are disabled in FieldBook's PROJ configuration; where PROJ itself could only offer a ballpark (the F2 pre-9.8.0 vertical case), FieldBook refuses and records `unresolved_transform` instead of inventing a position. Round-trip validation (forward/inverse within tolerance over the supported CRS list) is **[PROPOSED/UNEXECUTED]** (§10 V1).

**Support boundary v1 [CHOICE].** Horizontal: geographic and projected CRS expressible in WKT2/PROJJSON with declared axis order and units (proj.db is bundled and version-pinned). Vertical: altitude is stored as a labelled attribute with recorded datum/units and provenance; **no automatic vertical-datum transformation in v1** (motivated by F2's vertical ballpark fallback history; PROJ's improved vertical chaining ≥ 9.8.0, PR #4708, is a later-upgrade lead — `leads.json` L5). Time: stored as UTC instant + `clock_provenance ∈ {gps, device, manual}`; non-parsable timestamps are quarantined, never guessed. Geometry types: Point, LineString (tracks), attribute-only notes, photo with optional capture point. Unsupported types (polygons, M-measured geometries) are imported as quarantined raw payloads with a reason — visible, exportable, not dropped.

**Boundary and discontinuity cases (bounded, per-case behavior — no invented universals):**
- *Near coordinate/domain boundaries* (lat ±90, |lon|→180, projection-zone edges): storage never clips or shifts. Display paths may be clipped with a rendered "clipped at domain edge" mark. At export, values whose position sits within the CRS domain's margin (when proj.db exposes an extent) get a `suspect_boundary` flag; export never auto-corrects.
- *Tracks spanning a discontinuity* (antimeridian, projection seam): rendering splits the polyline where consecutive points jump beyond a configurable threshold in display space; stored vertices are untouched; export writes original vertices and adds `suspect_discontinuity` with segment indices. **[EXEC-candidate W1]** shows the raw failure arithmetic: a point stored at −180.0005° against a query box [179.999, 180] is a naive **MISS** that wrap-normalisation turns into a **HIT** — so viewport queries themselves must be wrap-expanded when the project touches ±180.
- *Incomplete coordinates* (missing lat or lon, missing altitude/time): imported into `quarantine` with reason codes, searchable, counted, exportable to `unresolved.csv`; never auto-filled from context.
- *Conflicting identifiers* (duplicate source PKs within one import, or against earlier imports): both records kept with distinct `obs_id`s and a `duplicate_candidate` link; resolution is an explicit user decision; auto-merge is not attempted. Merge-time duplicate *detection* (same source_key, or proximity ≤ ε only when both records have validated, identical `transform_id` display geometry) presents candidates — never silently merges.
- *Preview vs whole-file validity:* see the import pass above — preview is human orientation only.

---

## 5. Revision and merge contract [INF/CHOICE], grounded in F4–F5

**Write model.** Every change appends one op to `ops_log(op_id, obs_id, op ∈ {create, update, delete, restore}, base_rev, payload_delta, replica_id, hlc_ts, author)`; the current-state table is a materialized view of the log. A save is one SQLite transaction (WAL) that writes the op **and** a commit-marker row; "committed" ⇔ reachable from the committed marker chain. Draft/incomplete UI state lives in a separate `drafts` table and is visually distinct from committed records after any crash — reopening replays the log, so an interrupted save/import/merge reopens into a consistent, labeled state (incomplete work marked `uncommitted:import session X crashed at row N`, etc.). **[PROPOSED/UNEXECUTED]** kill-switch recovery harness: §10 V3.

**Merge of two divergent copies.** Each bundle export carries, per observation, the ancestor revision each replica started from. Merge is field-level three-way per record (CouchDB-style in spirit, F5, but field-granular so disjoint edits co-exist):
- fields changed on one side only → take that side;
- identical changes → idempotent;
- same field changed differently on both sides, or delete-vs-edit → **conflict record** `{obs_id, field, base, local, remote}` surfaced in a conflict inspector; the merged project marks such records `needs_decision` and displays base+both candidates; nothing is hidden behind a "winner" (the F5 lesson: deterministic arbitrary winners make lost work *look* saved);
- both deleted → resolved delete.
**[EXEC-candidate W2]** demonstrates this contract on a synthetic record: taxon and note merge automatically; `height_m` (12→15 local, 12→14 remote) becomes an explicit conflict, while a last-writer-wins baseline provably *silently* loses the note and one height value. Scope: toy JSON, not the production engine.
Bulk resolution affordances (accept all local/remote for a field) are provided; results are logged as new ops with `resolution_of:<conflict_id>` provenance.

**Copy/merge crash safety.** Import and merge run in a staging area; a crash leaves a `session` row `status=incomplete` and the main tables untouched; reopening offers resume-or-discard with a diff summary. Failed rows go to `quarantine`/`unresolved` with reasons — hiding them to make a merge "look successful" is prohibited by contract.

**Media relocation.** All references are bundle-relative, media is content-addressed (§3); relocating the folder is safe by construction; integrity check (`rtreecheck()`-style for our own structures + blob hash sweep) is **[PROPOSED/UNEXECUTED]** as V6.

---

## 6. Architecture [INF/CHOICE], grounded in F3–F4

- **Shell/UI:** Tauri-class desktop shell with an embedded web map view (Leaflet-class library; renderer CRS handled by FieldBook, not by per-tile defaults). *Bounded alternative A2:* native Qt + QPainted map canvas — heavier to build, fewer web-view variables; kept as fallback, not v1.
- **Storage (single engine):** SQLite in WAL mode. Tables: `obs`, `obs_geom_raw` (verbatim values + declaration), `ops_log`, `crs_registry`, `import_sessions`, `quarantine`, `conflicts`, `drafts`, `blobs_index`; spatial access via an R*Tree virtual table **over display-CRS bboxes built by FieldBook's own explicit-axis transform** (F3 lesson: never derive index coordinates through a library's implicit mapping). Consequences of F4 adopted as rules: (i) expand contained-within viewport queries per §3.4 (or use overlap queries + exact post-filter); (ii) never update the R*Tree while its scan cursor is open — collect ids into a temp table first (§3.5); (iii) run `rtreecheck()` in the integrity job. Text search via FTS5.
- **Viewport access at 250k records:** R*Tree intersect + keyset-paginated fetch (page ≈ 2 000 rows, incl. cached display geometry); map and table views share the same bounded cursor; every long task (import, merge, export, thumbnail sweep) is cancellable at page boundaries and reports progress; cancellation leaves the staging/session model consistent (§5). Photos are never loaded for table/spatial queries; thumbnails are generated lazily into `blobs/`.
- **Cache invalidation:** display-geometry cache keyed `(obs_rev, transform_id)`; tile store immutable; basemap area manifest records tile provenance and license.
- **Offline state:** a permanent status control distinguishes *fully offline-capable* (default: everything except acquiring new basemap areas) from *degraded* (e.g., CRS candidates needing an online registry lookup — avoided in v1 since proj.db ships inside the bundle). The app makes **no network calls** outside explicit user-initiated import/basemap dialogs [CHOICE]. Undo: edits are reversible by reverting to `base_rev` (ops log makes undo a first-class op); destructive actions (merge resolution) are individually reversible until the next bundle export.

---

## 7. Resource envelope and honest limits

**[INF]** Target: 4 cores / 8 GB RAM; 250 000-observation project *inspectable* (pan/zoom/search/open record) via the bounded paths above. This is an engineering plan, not a measured result: SQLite page-cache budgeted ≈ 256 MB; exports stream in `rowid` batches; per-track vertex caps with continuation records. The 250k synthetic benchmark is **[PROPOSED/UNEXECUTED]** (§10 V5).
**Not promised in v1:** semantic correctness proof of any import (only structural validation + flags); vertical datum transformation; OSM/ODbL-derived basemaps (license unverified, F7); real-time sync; map sources other than the bundled Natural Earth-derived set; forensic EXIF verification of photos (EXIF capture point is displayed as *claimed* metadata with provenance, not verified truth — [INF]).

---

## 8. Critical dependencies and licenses

| Dependency | Role | License/permission status |
|---|---|---|
| PROJ (+proj.db + grids), version-pinned per project | all transforms | MIT-class (per PROJ project docs — general knowledge; **[UNCERT]** pin of license page not captured this stage) |
| SQLite (with R*Tree, FTS5) | storage/index | Public domain (sqlite.org) |
| Natural Earth-derived tiles | bundled basemap | **Captured**: public domain; no permission or credit required; disclaimers apply (F6) |
| Leaflet-class renderer | map display | (license page not captured this stage — **[UNCERT]**, lead L6) |
| OSM/Geofabrik-class detail basemap | *not in v1* | ODbL/tile-policy verification blocked in this environment (F7) |

A `license_manifest.json` in every bundle records each included source, its capture URL, license statement locator, and derivation steps — audit-aligned with the brief's requirement that bundled-data permissions be investigated for the *actual selected* source (Natural Earth, F6).

---

## 9. Alternatives and later opportunities

- **A1 [CHOICE, alternative]** *Single-file GeoPackage-style container* instead of folder bundle + SQLite: better single-file interchange with the wider GIS world; cost: harder incremental ops-log storage and media dedupe inside one file, and the spec's specific provisions were **not verified from the primary spec this stage** (lead L2). The folder-bundle keeps the design honest about crash-safe staging.
- **OPP1:** CouchDB-protocol-style later sync between tablets in the field (F5 shows the conflict machinery generalizes); real-time collaboration is a separate, much larger step.
- **OPP2:** OSM/ODbL detail basemaps once license/tile-policy verification is possible (L1), with per-area bundle licensing states.
- **OPP3:** duplicate-detection assist: clustered candidate review (spatial + attribute scoring) — advisory only, decisions stay with the user.
- **OPP4:** vertical-datum transformation after upgrading to PROJ ≥ 9.8.0 and validating the vertical chaining improvements (PR #4708 lineage) (L5).

---

## 10. Validation plan

**Executed this stage [EXEC-candidate]** (isolated component checks in the admitted sandbox; *they do not establish whole-application behavior*):
- **W1 — axis/boundary arithmetic** (`exec-cvrzkozd`, exit 0): EPSG:4326 values misread as (lon,lat) displace Tokyo 6 471 km, Reykjavík 12 007 km, Sydney 6 988 km *silently* (|lat|>90 cases are detectable); antimeridian naive bbox MISS vs wrap-normalised HIT; float32 narrowing demo for 179.99995. Known cosmetic defect: a stray `exit_code_placeholder` line was printed to stdout (code artifact; numeric assertions unaffected). Scope: spherical haversine approximation, pure arithmetic — not a projection engine.
- **W2 — merge semantics toy** (`exec-pd8aieyw`, exit 0): field-level three-way merge auto-merges disjoint fields and surfaces `height_m` as an explicit conflict; a last-writer-wins baseline silently loses the note and one height value; delete-vs-edit requires explicit conflict. Scope: synthetic JSON records only — not the production merge engine.

**Proposed, UNEXECUTED** (each with pass criteria to be defined in implementation):
- **V1** transform round-trip suite over the supported CRS list with pinned PROJ version (tolerances per CRS class); includes known-point checks.
- **V2** golden-file exports: same project + same `transform_id` ⇒ byte-identical export.
- **V3** crash/kill harness: SIGKILL during save/import/merge at injected points; reopen must classify every record committed/uncommitted/quarantined with no silent loss.
- **V4** merge property tests: commutativity, idempotence, no-loss (every non-conflicting local+remote change survives; every conflicting change is present in the conflict set) — randomized ops.
- **V5** 250k synthetic project benchmark: viewport p95, search p95, export throughput, peak RSS < budget, cancellation latency.
- **V6** integrity sweep: `rtreecheck`, ops-log chain verification, blob hash audit after simulated media relocation.
- **V7** license-manifest audit test: every tile/source in bundle has a manifest entry with locator.
- **V8** accessibility pass: full keyboard record-editing path, labelled coordinate/provenance readouts, visible offline state (manual checklist, WCAG-informed — not certified this stage).

**Gate [CHOICE]:** v1 ships only when V1–V4, V6, V7 pass and V5/V8 results are published as measured, not aspirational.

---

## 11. Uncertainty register (top items; full list in `leads.json`)

1. ODbL/OSM tile-policy terms unverified here (transport-blocked); any OSM-derived bundling is blocked until reviewed (F7/L1).
2. PROJ #4632 backport status to 9.7.x unknown; version-pin + revalidation job is the mitigation (F2).
3. GDAL #15337 open — do not treat the ecosystem's spatial-index axis handling as fixed; FieldBook's own index path is designed to bypass the failure class, but the claim "bypasses it" must be proven by V1/V3, not asserted.
4. Renderer (Leaflet-class) and PROJ license pages not captured this stage; capture before implementation (L6).
5. GeoPackage-as-container provisions unverified from the primary spec (L2).
