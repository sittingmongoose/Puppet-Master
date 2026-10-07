# D-M03-B control / finalize-v2 — stage report (complete brief scope)

Stage: `D-M03-B/control/finalize-v2`. Role: finalize. Arm: control.
Predecessor: `jobs/D-M03-B/control/normal_retrieval-v2/report.md` (sha256 `efbc663b…a9451a`, carried as untrusted input, re-verified against frozen bytes).
No execution of project code. No additional sources acquired; nothing new preserved under `sources/`.
Stage final: `jobs/D-M03-B/control/finalize-v2/final.md`, byte-identical export to `cases/D-M03-B/outputs/control/final.md` (verified `cmp` IDENTICAL this stage). Word count 754 (within 1100 ceiling).

The complete brief scope follows verbatim from final.md.

---

# D-M03-B control final — pyproj 3.6.1 axis-order contract (EPSG:4326 → EPSG:3857)

## Recommended contract

```python
from pyproj import Transformer
t = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
x, y = t.transform(lon_deg, lat_deg)  # radians=False (default), FORWARD (default)
```

Governing conditions: input tuple is (longitude, latitude) in degrees; output is (easting, northing) in projected-CRS GIS order; `always_xy` is fixed at creation, not per call; set `errcheck` deliberately (default `False` returns `inf` on error, `True` raises). EPSG:4326 native axis order, EPSG:3857 unit string, and PROJ/grid behavior are CRS-definition/dependency facts outside these frozen bytes — see Uncertainty.

## Material findings (8)

F1. Creation path [O1]. `Transformer` is built via `from_crs`/`from_pipeline` (projcode L331–334). `from_crs(crs_from, crs_to, always_xy=False, …)` (L553–563) encodes both CRS via `CRS.from_user_input(…).srs` and defers to Cython `_Transformer.from_crs` through a thread-local maker (L625–637, L99–115). Per-call behavior is fixed by creation flags plus `transform(…)` args.

F2. Call signature [O1,O4]. `transform(xx, yy, zz=None, tt=None, radians=False, errcheck=False, direction=FORWARD, inplace=False)` (L716–726). `always_xy` is a creation flag only — on `from_crs`/`from_proj`/`TransformerGroup`, never on `transform`.

F3. Axis-order rule [O2,O3]. Default `always_xy=False` follows CRS-defined axis order; projdoc warns order "may be swapped" when the CRS first axis is northerly and to check with `pyproj.crs.CRS` (projdoc L14–20). `always_xy=True` forces "traditional GIS order … longitude, latitude for geographic CRS and easting, northing for most projected CRS" on input and output (L583–586; also L525–528, L179–182). Longitude-documented input requires `always_xy=True` at creation; order must never be inferred from CRS codes alone.

F4. `always_xy` limits [O3]. Order only. It does not set degrees/radians, validate ranges, select operation/accuracy, or appear on `transform`; `itransform` has a separate per-call `switch` flag (L883–885). Output is equally reordered — consumers must read (easting, northing).

F5. Angular/unit domain [O4]. `radians=False` (default) means degrees; `radians=True` expects radians and returns radians "if the projection is geographic" (L759–761). Degree input requires the default. Corpus states projected GIS order and geocentric metres (L1241–1244) but does not pin the EPSG:3857 unit string in these bytes; treat metres as CRS-metadata-conditioned (check P4).

F6. Selection/area/error limits [O5]. `area_of_interest` "help[s] select the transformation" (L587–588); `TransformerGroup` sorts candidates by area intersection then accuracy, unknown accuracy last (L146–152), exposing `transformers`, `unavailable_operations`, `best_available` (L222–244). `accuracy` is metres, `-1 if unknown` (L389–394); `allow_ballpark` default allows ballpark (L601–603); `only_best` can force error when best operation is unusable (L607–618, PROJ 9.2+). `errcheck=False` returns `inf`, `True` raises (L764–766). No numeric validity ranges for 4326→3857 appear in these bytes.

F7. One central-city success proves little [O1–O6]. The doc example `from_crs("EPSG:4326","EPSG:3857")` + `transform(33, 98)` (L779–782) runs under default `always_xy=False`, so one interior "looks right" point cannot establish: input order (both orders can yield plausible magnitudes near center), degrees-vs-radians, `errcheck` path (no error triggered), operation choice/accuracy/ballpark status, edge behavior (poles, antimeridian, out-of-range latitude), output units at extremes, or inverse/direction correctness.

F8. Dependency/environment uncertainty [O6]. PROJ 9.3.0 internals, Cython `_Transformer`, `CRS` axis/unit metadata, grid availability/network (`is_network_enabled` L461–471; grids L246–290), and env defaults (`PROJ_ONLY_BEST_DEFAULT` L614–616) are referenced but not pinned by these bytes; claims about them are unresolved here.

## Obligation dispositions

O1 traced (F1,F2,F7) — accepted. O2 bound to creation flag; native order unresolved from these bytes (F3) — accepted with condition. O3 stated with limits (F4) — accepted. O4 stated; 3857 unit conditioned (F5) — accepted/partially unresolved. O5 discussed within corpus limits; numeric ranges unresolved (F6) — partial. O6 proposed checks + uncertainty (F8, P1–P8) — accepted.

## Proposed discriminating checks (not executed; execution forbidden this stage)

P1 Axis contrast: same pair via `always_xy=True` vs `False`, plus swap-sensitive point (lon≠lat, both plausible) — orders must differ. P2 Unit confusion: degree pair vs radian pair under each `radians` setting — only one sane. P3 Error path: invalid input (e.g. latitude 98°) with `errcheck=False` vs `True` — `inf` vs exception. P4 Output units: `CRS("EPSG:3857").axis_info` / `target_crs` plus known-value witness (M06 scope). P5 Edges: near-pole, antimeridian bounds (`transform_bounds` densify note L1006–1013), out-of-range latitude. P6 Operation audit: `TransformerGroup(4326,3857,always_xy=True)` — `best_available`, `unavailable_operations`, `accuracy`. P7 Round-trip: FORWARD then INVERSE within tolerance. P8 Environment pin: PROJ version, grid/network state, `only_best` default at witness time.

## Claim ledger; executed vs proposed

Executed: manifest hash verification (both match, this stage); static reads of projdoc (47/47 lines) and projcode (creation, transform/itransform/transform_bounds, TransformerGroup). No project code executed. Proposed: P1–P8 (runtime witnesses, M06-qualified where executing). Accepted: F1–F4,F7 as carried from predecessor and re-verified; F5,F6,F8 accepted with stated conditions. Amended: none material (wording tightened to ceiling). Rejected: none. Unresolved: EPSG:4326 native order from these bytes alone; 3857 unit string; numeric validity ranges; PROJ/grid/env behavior.

## Sources

projdoc pyproj 3.6.1 (2026-10-07) sha256 `261a0a36…ade51`, `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/docs/api/transformer.rst`; projcode pyproj 3.6.1 (brief assumes PROJ 9.3.0, no execution) sha256 `f5f8a43c…dabda`, `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py`. No additional sources acquired.

---

## Stage operations log

See `timings.json` in this directory for actual UTC timestamps, operations, and usage fields.
