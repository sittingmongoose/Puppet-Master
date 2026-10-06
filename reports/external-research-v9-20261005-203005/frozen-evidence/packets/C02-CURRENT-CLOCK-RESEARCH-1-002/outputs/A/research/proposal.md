# Fieldmark — offline field observations and map exchange (research proposal)

Stage: research (fresh, brief-only). Date: 2026-10-06. Role budget: 1200 s; this proposal plus
`sources.json`, `witnesses.json`, `leads.json` in `out/research/` are the stage deliverables.
Claim labels: **[FACT]** = external, pinned in `sources.json`; **[INF]** = engineering inference
from facts/experience; **[CHOICE]** = product decision this proposal makes; **[UNCERTAIN]** =
open dependency, see `leads.json`. Executed checks are labeled "executed by candidate" with
receipt pointers in `witnesses.json`; everything else is **proposed/UNEXECUTED**.

---

## 0. Summary

Fieldmark is a local-first desktop/tablet application for a small environmental survey group.
A **project bundle** is a portable directory: one SQLite database (WAL mode) holding
observations plus an append-only revision log, content-addressed photographs, and a bounded
raster map extract with its license file. All editing happens offline; copies are exchanged by
file transfer and merged with **explicit, inspectable conflict resolution** — never a silent
auto-merge. Coordinates are stored twice by design: the **original coordinates exactly as
imported** (with full CRS provenance) and a **canonical WGS 84 longitude/latitude rendering**
produced by a versioned, pinned transform pipeline; exports regenerate from originals, so a
displayed pin never silently rewrites the source of record. Two independently useful precedents
are examined in depth — SQLite's R*Tree spatial index and WAL journaling, and the GDAL/PROJ
axis-order machinery including a live 2026 defect (PROJ #4876) and the 2022 fix/regression
chain (PR #3477) for the same defect class.

## 1. Scope and session workflow

**[CHOICE]** Users: 2–10 surveyors, laptops/tablets, no server, no accounts. Out of scope for
v1: real-time sync, route guidance, hosted service, broad map-source support, automated
classification (kept as leads).

Typical session, mapped to contract sections:

1. **Load project** — open bundle directory; verify manifest hashes; show project identity,
   schema version, CRS inventory, offline state banner (§2, §4).
2. **Inspect coordinate/reference metadata** — provenance panel per import batch: CRS (WKT2),
   declared axis order, units, altitude datum, time provenance; unknown fields stay visibly
   "unknown" (§2.2).
3. **Search / preview records** — indexed text search + bounded spatial viewport queries;
   preview is explicitly labeled *preview*, never an import validation (§2.5, §4.4).
4. **Add / edit offline** — form with keyboard-first navigation; edits append to the oplog;
   undo is an inverse oplog entry (§3.2, §4.5).
5. **Save** — one SQLite transaction per logical save; WAL commit (§3.4).
6. **Reopen on another machine** — bundle relocation rule; media integrity check (§3.6).
7. **Merge a colleague's copy** — three-way against the common base snapshot; explicit
   conflict cards; quarantine for failed records (§3.3).
8. **Export table + map overlay** — streaming export; GeoJSON overlay follows RFC 7946;
   originals exported bit-faithfully with provenance columns (§2.4).

## 2. Coordinate, geometry and provenance contract

### 2.1 The four coordinate identities [INF]

| Identity | What it is | Where it lives |
|---|---|---|
| **Stored original** | Coordinates byte-exactly as imported/entered, in their source CRS | `obs_original` table + import-batch CRS metadata |
| **Canonical rendering** | WGS 84 longitude/latitude (degrees) + ellipsoidal height, produced by a pinned pipeline | `obs_canonical` (derived, regenerable) |
| **Displayed pin** | Web Mercator (EPSG:3857) pixel space derived from canonical at render time | ephemeral, never persisted |
| **Exported coordinates** | Written from *stored originals* + provenance columns; GeoJSON exports use canonical lon/lat per RFC 7946 §4 [FACT-S5] | export stream |

The load-bearing rule **[CHOICE]**: *transforms are computed at import/edit time, recorded with
their pipeline version, and never re-run implicitly.* Re-projection of stored data is an
explicit, logged user action. This is the direct answer to "a displayed pin is not proof that
exported data retained its correct location": export reads `obs_original`, so no rendering bug
can corrupt source-of-record; and the canonical copy is what the spatial index, viewport and
map use, so a bad transform is *visible* (pin far from where the surveyor stood) instead of
silently mutating originals. Every record carries `batch_id`; every batch carries the CRS
contract below. Geometry/edit identity is a UUID (v7, time-ordered) minted once at record
creation; revisions reference that UUID, so merging never re-keys geometry.

### 2.2 CRS support boundary [FACT-S4, FACT-S6, INF]

External facts pinned: PROJ ≥6 honors the authority's axis order per ISO 19111 — EPSG:4326 is
declared **latitude-first** even though GIS convention is longitude-first, and PROJ's own FAQ
recommends checking a CRS's axis list via `projinfo` WKT2 output. GDAL 3.0+ defaults to
`OAMS_AUTHORITY_COMPLIANT` and offers `SetAxisMappingStrategy(OAMS_TRADITIONAL_GIS_ORDER)` as
the explicit escape hatch. WKT2 is preferred over lossy PROJ strings. PROJ needs its `proj.db`
resource file at runtime — an **offline bundling requirement**, not an optional extra.

**v1 support boundary [CHOICE]:**
- Geodetic CRSs from the EPSG registry with WKT2 available, plus WGS 84 (EPSG:4326) both axis
  orders and EPSG:3857 for display. Projected CRSs supported **only** with a WKT2 definition
  and a successfully validated pipeline; everything else is "unknown CRS".
- Axis order is **never inferred** from value ranges. A CRS is stored with its declared axis
  list; import of metadata-less data requires the bounded correction dialog: (a) pick a CRS
  from candidates scoped to the project's declared region, (b) import as "unknown CRS"
  (record quarantined from maps/merges of geometry, still searchable/exportable), or (c) cancel.
  Value-range guessing (e.g. "looks like lat/lon") is prohibited **[CHOICE]** — the PROJ issue
  chain in §5.3 shows exactly this class of guess failing silently.
- Units: angle/length units come from the WKT2 `CS` block; grad vs degree, foot vs metre are
  read, displayed, and converted only by the pipeline. Altitude provenance (ellipsoidal vs
  orthometric vs "unknown") is a required batch field; "unknown" is a legal, visible value and
  canonical rendering then stores height as `NULL`, not 0.

**Transform pipeline versioning [CHOICE/INF]:** each batch records
`{source_crs_wkt2, declared_axis_list, target: WGS84 lon/lat, proj_version, pipeline_proj_string,
pipeline_accuracy_m, created_at, validation_status}`. Validation at import: transform a
built-in check point (region-appropriate, from the EPSG check points or a user-surveyed point)
round-trip; tolerance from pipeline accuracy; failure → batch stays in quarantine, records are
committed only as "unlocated/unknown-CRS", and the failure is surfaced, not swallowed. A PROJ
upgrade does **not** retroactively re-transform anything; the stored `pipeline_proj_string`
reproduces the original numbers on demand.

### 2.3 Boundary and pathological cases [INF, investigated individually]

- **Coordinate/domain boundary (bbox edge):** SQLite R*Tree stores bounds as 32-bit floats and
  rounds outward; its own documentation warns contained-within queries can exclude entries at
  edges and says to expand query boxes slightly [FACT-S1]. Design: viewport queries are
  *overlapping* queries with a fixed epsilon expansion, and the exact containment test re-runs
  on the double-precision canonical values — the index narrows, it does not decide [FACT-S1
  "Key Point"]. Witness W1 showed a 1474-vs-1473 hit divergence between an inclusive B-tree
  range query and strict R*Tree containment on the same synthetic set — the edge effect is
  real, small, and handled by the epsilon + recheck rule.
- **Track spanning the antimeridian / projection discontinuity:** RFC 7946 §3.1.9 says
  geometries crossing the antimeridian *should* be cut, and §5.2 defines the spanning-bbox
  convention (east < west) [FACT-S5]. Design: a track whose successive longitudes wrap is
  split into segments at the discontinuity; the stored track keeps segment boundaries, the
  spatial index stores per-segment boxes, and bbox display shows the spanning form. Witness W2:
  the naive span of 179.5°E→170°W is 349.5° (≈ global) vs 10.5° wrapped. For non-geographic
  CRSs with their own seams, no universal rule is claimed; such tracks are flagged for manual
  review if segment jumps exceed a per-CRS sanity threshold **[UNCERTAIN → leads L4]**.
- **Incomplete coordinates:** a record with missing/invalid coordinates is a *valid record with
  null geometry* — RFC 7946 explicitly allows Feature `geometry: null` for unlocated features
  [FACT-S5]. Stored, searchable, editable, exported with `geometry:null`; excluded from the
  spatial index and from map rendering; the record list shows an "unlocated" badge.
- **Conflicting identifiers:** imported IDs are never trusted as primary keys. Each record has
  a minted UUID plus a provenance key `(batch_id, source_row_id)`. Two records with the same
  provenance key within one merge are surfaced as an identifier conflict card; nothing is
  auto-deduplicated **[CHOICE]**. Duplicate *detection* (same rounded coordinate + timestamp
  within tolerance, different provenance keys) produces *suggestions*, never actions.

### 2.4 Exports [FACT-S5, CHOICE]

Table export (CSV): all original-coordinate columns verbatim, plus batch CRS identifiers,
axis order, units, height provenance, time provenance, revision, device id, and quarantine
state. GeoJSON overlay export: canonical values, positions `[lon, lat]` "precisely in that
order" with optional metres-above-WGS84-ellipsoid third element; antimeridian-spanning
features cut per §3.1.9; the number of digits is not an uncertainty signal (§3.1.10).
Exports stream in bounded pages (same paging mechanism witness-tested in W1); a cancelled
export leaves a partial file clearly marked `.partial`.

### 2.5 Preview ≠ validation [CHOICE]

Record preview samples are for *orientation only*. Import validity is established per batch by
the pipeline check-point test (§2.2) plus full-scan structural checks (parse every row,
range-check against the CRS's declared domain, count failures). A batch with any failed rows
still imports: good rows commit, failed rows land in **quarantine** with per-row reasons, and
the import report shows both counts. Failed records are never hidden to make a merge look
clean.

## 3. Identity, revision and merge contract

### 3.1 Identity [INF]

- **Project identity:** `project_uuid` + `schema_version` + `base_snapshot_seq`. Copies
  created by file exchange carry the same `project_uuid`; a merge of two bundles with
  different `project_uuid` is refused with a plain-language error (wrong project), while
  same-uuid is the merge path.
- **Record identity:** UUID v7 per record; per-record `rev` integer; per-revision oplog entry
  `{record_uuid, rev, device_id, utc_time, change_type, fields, transformed_by}`.
- **Media identity:** photographs stored as `photos/<sha256>` (content-addressed); the DB rows
  reference hashes, so relocation of the bundle directory cannot break references, and a
  missing file is a visible "media missing" state rather than a corrupt DB.

### 3.2 Append/edit/delete semantics [CHOICE]

Append creates rev 1. Edit appends rev N+1 (whole-record field deltas). Delete is a
**tombstone** revision — deletion is itself a revision that merges like any other; undelete is
possible while the tombstone is the head. The oplog is append-only; compaction beyond the last
merged base snapshot is prohibited so a future three-way merge always has its base.

### 3.3 Merge of two diverged copies [CHOICE, witness-tested mechanism]

Three-way per record against the highest common base snapshot: unchanged-in-one-copy takes the
other's change; changed-in-both → **explicit conflict card** listing both versions side by
side with coordinates, provenance, photos; the user picks one, keeps both (the loser becomes a
new sibling record), or defers (card persists; deferred conflicts are counted in the UI badge).
No field-level auto-merge in v1 — record-level is legible and auditable; field-union is a
listed alternative (§7.2). Witness W3 (executed by candidate, isolated): 3 committed records
kept, 1 both-changed record surfaced as `explicit_user_choice_required`, an uncommitted draft
excluded, and an assertion that nothing was silently dropped. Scope: toy model only; it
demonstrates the *rule set*, not the shipped product.

### 3.4 Interrupted save / import / merge — recovery [FACT-S2, INF]

SQLite WAL gives atomic commit: a crash mid-write leaves the last committed state, and WAL's
guarantees (single writer, commit marker appended to the WAL, readers on a consistent
snapshot) are the documented mechanism [FACT-S2]. Design rules:
- `PRAGMA synchronous=FULL` for the observation DB (survey laptops lose power); the WAL doc's
  durability tradeoff for NORMAL is accepted only for the derived tile cache [FACT-S2, INF].
- **Bundle relocation rule** straight from WAL semantics: the `-wal` file "is part of the
  persistent state" and separating it from the DB can lose committed transactions [FACT-S2].
  Therefore "Export/Share bundle" and "close project" always run `wal_checkpoint(TRUNCATE)`
  first, so the shared directory is one self-contained `.db` + files; raw directory copies
  while open are warned against in the UI.
- **Merge is transactional with a marker:** the merge result is written inside one transaction
  tagged `merge_id`; an interrupted merge reopens as *not applied*, with a recoverable
  "merge in progress" entry listing what was about to change — incomplete work is distinguishable
  from committed records because committed records are exactly the oplog prefix.
- **Reopen integrity gate:** on open, run `PRAGMA integrity_check`/`rtreecheck()` [FACT-S1]
  cheaply on the spatial shadow tables, validate the oplog tail (rev chain per record), and if
  anything is off, open **read-only** with a repair offer instead of silently "fixing".
- Draft (unsaved form) state lives outside the DB transaction; after a crash it reopens as
  "unfinished draft" and can be discarded or saved — it never auto-commits (W3 covers the
  merge-side rule).

### 3.5 Re-importing the same source [CHOICE]

Re-import is keyed on `(source_id, source_fingerprint)`: identical fingerprint → no-op report;
changed fingerprint with overlapping provenance keys → diff report (changed / new / vanished
rows) and a per-row user choice; vanished source rows never delete local records. Import
always creates a new `batch_id` so provenance stays truthful.

### 3.6 Failed records and provenance under merge [CHOICE]

Quarantined rows and their reasons merge like normal records (quarantine state is just a
field); provenance columns are merge-immutable. A merge report ends with explicit counts:
applied, conflicted, quarantined, skipped — and the UI refuses to show "merge complete" while
any conflict card is deferred.

## 4. Architecture (bounded)

### 4.1 Bundle layout [CHOICE]

```
<project>/            manifest.json      identity, schema_version, CRS inventory, licenses
  project.db          SQLite WAL: obs_original, obs_canonical, obs_rtree (R*Tree vtab),
                      oplog, quarantined, batches, conflicts, photos index
  photos/<sha256>     content-addressed originals
  tiles/              bounded raster extract (MBTiles-style SQLite or tile tree) + LICENSE
  exports/            streamed export outputs
```

Alternative considered: a **GeoPackage single file** (OGC standard, SQLite-based) as the whole
bundle — more interoperable, but WAL-mode write-ahead files complicate "copy one file"
exchange (§3.4), and GPKG licensing of bundled tiles is identical work; kept as bounded
alternative **[UNCERTAIN → leads L6]**.

### 4.2 Storage and indexing [FACT-S1, FACT-S2, INF, W1]

Single writer process; WAL mode; R*Tree virtual table over canonical bbox (per-segment for
tracks) + auxiliary columns for record UUID; ordinary B-tree indexes for provenance key, time,
and text search (FTS5). Cache invalidation is trivially keyed: canonical rows are immutable per
revision; the map layer re-queries on viewport change with an epoch counter bumped by any
committed write. R*Tree read-while-write can raise `SQLITE_LOCKED` [FACT-S1] — the UI never
writes inside a scroll/browse query; edits collect ids first, then write, per the documented
workaround.

### 4.3 Map rendering and licensing [FACT-S7, FACT-S8, UNCERTAIN L1]

Map = pre-bundled raster extract rendered locally. External facts: OpenStreetMap data is
ODbL-licensed; you must credit OSM, state ODbL, and share alike if you alter and distribute
the data [FACT-S7/S8]; OSM's copyright page explicitly states OSMF **cannot provide a free
map API or tiles for third parties** and links the Tile Usage Policy [FACT-S7]. Therefore
**[CHOICE]**: the bundle's tiles must be produced by the group from an OSM **planet extract**
(or another openly licensed source) with the license file and attribution string shipped
inside `tiles/`; the app displays the attribution and refuses to enable the map layer if
`LICENSE` is missing or unrecognized. Scraping OSMF tile servers into the bundle is
prohibited by product policy. *The tile policy page itself could not be captured during this
stage (two fetch attempts failed at the host) — treat exact bulk-extract limits as
unverified* **[UNCERTAIN L1]**.

### 4.4 Performance plan for 250,000 observations [INF, W1]

Target hardware 4-core/8 GB. No full-table loads on interactive paths: list view = keyset
pagination; map view = R*Tree viewport window (W1: ~0.2–0.7 ms per viewport query at 50k
synthetic points in a constrained sandbox; extrapolation to 250k is an inference, **not** a
measured benchmark — the 5× row growth with bounded node fan-out should stay sub-10 ms
**[INF/UNEXECUTED at 250k]**). Import/export stream in bounded pages; cancellation is honored
between pages (W1 exercised the LIMIT pattern). Tile cache and raster tiles live outside the
DB; photo thumbnails pre-generated at import. Cancellation of long merges: merge phases are
chunked per record batch; abort leaves the "merge in progress" recoverable state (§3.4).
What works with no network: everything — the only network use in v1 is *none*; map tiles,
`proj.db`, fonts all bundled.

### 4.5 UI: legibility, accessibility, offline, undo [CHOICE]

Persistent offline banner (there is no online mode; the banner states data location instead).
Every record detail shows a provenance panel (CRS name, axis order, units, height datum, time
source, batch, device). Errors are plain-language with a "show details" disclosure. Keyboard:
full form navigation, map jump-to-next-record, export/merge shortcuts; all conflict cards are
keyboard-operable. Undo: inverse-oplog entries for the last N user edits, with a visible
history list (merge resolutions are undoable until the next merge starts).

## 5. Precedents investigated

### 5.1 SQLite R*Tree + WAL (storage precedent) [FACT-S1, S2]

Mechanism fit: embedded, file-based, single-writer — matches laptop/tablet field use and file
exchange. Concrete lessons adopted: 32-bit bound rounding + expand-contained-within (§2.3);
SQLITE_LOCKED read/write interaction shapes the UI's query/write split (§4.2); WAL persistence
and the "keep `-wal` with the DB" rule became the bundle relocation rule (§3.4); `rtreecheck()`
in the reopen gate.

### 5.2 GDAL/PROJ CRS + axis order (projection precedent) [FACT-S4, S6]

Mechanism fit: the exact hazard in the brief (axis order, units, altitude provenance differing
per import). Lessons adopted: authority axis order is real and must be honored/read from WKT2
(not guessed); an *explicit mapping strategy* between "data order" and "CRS order" (GDAL's
`OAMS_TRADITIONAL_GIS_ORDER` vs `OAMS_AUTHORITY_COMPLIANT`) is the established mitigation and
Fieldmark's batch metadata records it explicitly; WKT2 over lossy PROJ strings; `proj.db` is
an offline runtime dependency to bundle and version-pin.

### 5.3 Real defect → fix → regression chain [FACT-S9, S10, S11]

- **Open issue:** PROJ #4876, opened 2026-10-01, **still open at capture**: `always_xy` /
  `proj_normalize_for_visualization()` does not normalize an *EngineeringCRS*, and Cartesian
  Grid Offsets ignores its axis order — coordinates come out **transposed with no error** for
  user-defined (northing, easting) grids; the reporter shows EPSG v12.029 (in PROJ 9.8.1)
  cannot expose it via registry data, i.e., custom CRSs are the victims [FACT-S9].
- **Same-class fix:** PR #3477 "Implement normalizeForVisualization for DerivedProjected",
  opened 2022-11-18, merged 2022-11-19 (merge commit `b4ead8c939ba7c9efa86ae49eb396ba3c0aa3012`,
  merged by rouault): adds `DerivedProjectedCRS` handling to
  `mustAxisOrderBeSwitchedForVisualization`, `applyAxisOrderReversal`,
  `normalizeForVisualization` in `src/iso19111/crs.cpp`, with regression tests
  `normalizeForVisualization_derivedprojected` and `..._derivedprojected_operation` in
  `test/unit/test_crs.cpp` (asserting exact `axisswap` pipeline strings) [FACT-S10/S11].
- **Lessons adopted:** (1) the "which CRS types does normalization cover?" bug class recurs
  across years (derived projected 2022 → engineering 2026, plus referenced #3598 BoundCRS and
  #4848); a tool that accepts user CRSs must *not* assume a library helper covers every CRS
  type — Fieldmark's import validation therefore asserts the axis order of the *output* of any
  normalize/transform call against the declared expectation, and refuses silent passthrough
  (an unchanged CRS object from a "normalize" call is treated as a validation failure, not
  success). (2) Regression tests pinned exact pipeline strings — Fieldmark's per-batch
  check-point test does the same. (3) Release applicability: the fix merged to master
  2022-11-19; **which released PROJ version first contained it is UNVERIFIED** [L3], and
  #4876 remains open, so the EngineeringCRS case is a live risk for any "plant grid" style
  custom CRS a survey group might use.

## 6. Support, resource and recovery limits (explicit)

- Supported CRSs: EPSG-registry geographic + WKT2-described projected; no ESRI-proprietary
  grids, no transformations requiring grid shift files beyond what the bundled PROJ data
  ships **[UNCERTAIN L5 — bundled dataset coverage to be enumerated at implementation]**.
- Geometry types: point, track (LineString, segments), note (null geometry), photo attachment.
  No polygons/areas in v1.
- 250k observations is an engineering target researched via the mechanisms above, **not a
  measured benchmark**; the executed witnesses ran at 50k in a constrained sandbox.
- Photo library size unbounded by design but v1 has no dedup beyond sha256 identity and no
  inline preview above a size cap.
- Recovery: guaranteed reopen to last committed oplog prefix; drafts and in-progress merges
  recoverable as clearly-labeled incomplete states; **no** guarantee for external partial
  copies made while the DB was open and checkpoint was not run (UI warns).
- Licensing: bundling tiles is a per-source legal task with ODbL share-alike consequences for
  distribution of derived data; the group's own observations are NOT ODbL-covered merely by
  display over OSM tiles — but tiles+extract redistribution is **[INF; ODbL text captured
  through §4.0 conditions; full share-alike section wording not in capture → L2]**.

## 7. Opportunities and alternatives

### 7.1 Later opportunities (optional, distinct from minimums)
- **Real-time collaborative sync** via CRDT/oplog replication over the existing oplog.
- **Vector basemaps (PMTiles/MBTiles)** for smaller bundles and styling.
- **Route guidance** and **automated classification** of observations (e.g., species id).
- **Hosted exchange service** when the group outgrows USB-stick merges.

### 7.2 Bounded alternatives
- **GeoPackage single-file bundle** (interoperability up, exchange-simplicity down) — L6.
- **Field-union merge** (auto-merge disjoint field edits, conflict only on same field) —
  smaller conflict volume, harder to explain; v1 keeps record-level.
- **Pure CSV+GeoJSON store** instead of SQLite — simplest possible, rejected for the 250k
  bounded-access target; retained for one-way export/import interop.
- **No-transform mode** ("store what arrived, render nothing") for unknowable CRSs — the
  quarantine path in §2.2(c) is its bounded form.

## 8. Validation plan

**Executed by candidate (isolated component checks; receipts + hashes in `witnesses.json`; none
establish whole-application behavior):**
- **W1** bounded spatial access: 50k synthetic points, R*Tree viewport 0.21 ms / B-tree range
  0.68 ms / paged LIMIT 0.23 ms; observed the documented 1474 vs 1473 bbox-edge divergence
  between inclusive range and strict containment (motivates the epsilon+recheck rule).
- **W2** axis-order and antimeridian math: misread axis order displaces a point by 6793 km;
  wrapped longitude span 10.5° vs naive 349.5°. Illustrative spherical arithmetic only — not a
  PROJ equivalent.
- **W3** merge rules: both-changed → explicit conflict; uncommitted draft excluded; assertion
  `nothing_silently_dropped: True`.

**Proposed / UNEXECUTED (planned, labeled):** kill -9 recovery harness against a seeded WAL
project; 250k-row synthetic import with viewport/export timing and cancellation; CRS-metadata
fuzzing (missing axes, grad units, unknown height datum) against the quarantine path; merge
property tests (commutativity of idempotent re-merges, tombstone revival); tile-license
compliance checklist per bundled source; retrieval of OSMF Tile Usage Policy before any tile
tooling ships; enumeration of the bundled PROJ dataset's supported transformations; PR #3477
first-release mapping.

## 9. Source index (full pins in `sources.json`)

S1 SQLite R*Tree docs · S2 SQLite WAL docs · S4 PROJ 9.9.0 FAQ (axis order; proj.db) ·
S5 RFC 7946 (position order; CRS; antimeridian; null geometry; precision) · S6 GDAL OSR
tutorial (axis order; mapping strategies) · S7 OSM copyright page (ODbL, attribution, no free
third-party tiles) · S8 ODbL v1.0 text · S9 PROJ issue #4876 (open, 2026-10-01) · S10/S11 PR
#3477 metadata + patch/test files. Captures that failed: OSMF tile policy (2× host error, L1).
