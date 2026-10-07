# D-M03-B control / normal_retrieval-v2 — bounded intermediate

Stage: `D-M03-B/control/normal_retrieval-v2`. Role: normal_retrieval (ordinary native read, reasonable scope; no exhaustive prescription). Predecessor artifacts: none. No execution of project code.

## Sources (frozen corpus, hash-verified this stage)

| id | version/capture | sha256 (verified `sha256sum`) | path |
|---|---|---|---|
| projdoc | pyproj 3.6.1, 2026-10-07 | `261a0a36…ade51` match | `cases/D-M03-B/inputs/sources/projdoc.rst` (47 lines) |
| projcode | pyproj 3.6.1 (brief assumes PROJ 9.3.0; no execution) | `f5f8a43c…dabda` match | `cases/D-M03-B/inputs/sources/projcode.py` (1339 lines) |

URLs: `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/docs/api/transformer.rst`, `.../pyproj/transformer.py`. No additional sources acquired; nothing new preserved under `sources/`.

## Recommended contract (source-linked, conditioned)

```python
from pyproj import Transformer
t = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
x, y = t.transform(lon_deg, lat_deg)  # radians=False (default), direction FORWARD (default)
```

Conditions: input is (longitude, latitude) in degrees; output is (easting, northing) in projected-CRS order. Set `errcheck` deliberately (default `False` returns `inf` on error; `True` raises). Unit magnitude (metres) and EPSG:4326 native axis order are CRS-definition properties outside these frozen bytes — see Uncertainty.

## Material findings (≤8; obligation map in brackets)

F1. Creation path [O1]. `Transformer` must be built via `from_crs`/`from_pipeline` (projcode L331–334). `from_crs(crs_from, crs_to, always_xy=False, …)` (L553–563) encodes both CRS via `CRS.from_user_input(…).srs` and defers to Cython `_Transformer.from_crs` through a thread-local maker (L625–637, L99–115). Per-call behavior is then fixed by creation flags plus `transform(…)` args.
F2. Call signature [O1,O4]. `transform(xx, yy, zz=None, tt=None, radians=False, errcheck=False, direction=FORWARD, inplace=False)` (L716–726). `always_xy` is a creation flag, not a per-call flag — it appears on `from_crs`/`from_proj`/`TransformerGroup`, never on `transform`.
F3. Axis-order rule [O2,O3]. Default `always_xy=False` follows CRS-defined axis order; projdoc warns the order "may be swapped" when the CRS first axis is northerly and to check with `pyproj.crs.CRS` (projdoc L14–20). `always_xy=True` forces "traditional GIS order … longitude, latitude for geographic CRS and easting, northing for most projected CRS" on both input and output (L583–586, repeated L525–528, L179–182). Longitude-documented input therefore requires `always_xy=True` at creation; input order must never be inferred from CRS codes alone.
F4. `always_xy` limits [O3]. It fixes order only. It does not set degrees/radians, does not validate ranges, does not select operation/accuracy, and does not appear on `transform`; `itransform` has a separate per-call `switch` flag (L883–885). Output side is equally reordered — consumers must read (easting, northing).
F5. Angular/unit domain [O4]. `radians=False` (default) means degrees for geographic CRS; `radians=True` expects radians and returns radians "if the projection is geographic" (L759–761). Degree input requires the default. Corpus states projected GIS order (easting, northing) and geocentric metres (L1241–1244) but does not pin EPSG:3857's unit string in these bytes; treat metres as CRS-metadata-conditioned (proposed check P4).
F6. Selection/area/error limits [O5]. `area_of_interest` "help[s] select the transformation" (L587–588); `TransformerGroup` sorts candidates by area intersection then accuracy, unknown accuracy last (L146–152), exposing `transformers`, `unavailable_operations`, `best_available` (L222–244). `accuracy` is metres, `-1 if unknown` (L389–394); `allow_ballpark` default allows ballpark (L601–603); `only_best` can force an error when the best operation is unusable (L607–618, PROJ 9.2+). `errcheck=False` returns `inf` on failure, `True` raises (L764–766). No numeric validity ranges for 4326→3857 appear in these bytes.
F7. One central-city success proves little [O1–O6]. The doc example `from_crs("EPSG:4326","EPSG:3857")` + `transform(33, 98)` (L779–782) runs under default `always_xy=False`, so a "looks right" interior point cannot establish: input order (both orders can yield plausible magnitudes near the center), degrees-vs-radians, `errcheck` behavior (no error triggered), operation choice/accuracy/ballpark status, edge behavior (poles, antimeridian, out-of-range latitude), output units at extremes, or inverse/direction correctness.
F8. Dependency/environment uncertainty [O6]. PROJ 9.3.0 internals, the Cython `_Transformer` layer, `CRS` axis/unit metadata, grid availability/network (`is_network_enabled`, L461–471; grid download L246–290), and env defaults (`PROJ_ONLY_BEST_DEFAULT`, L614–616) are referenced but not pinned by these bytes. Claims about them are unresolved here.

## Obligation dispositions

O1 traced (F1,F2,F7) — accepted. O2 bound to creation flag, native order explicitly unresolved from these bytes (F3) — accepted with condition. O3 stated with limits (F4) — accepted. O4 stated; 3857 unit magnitude conditioned (F5) — accepted/partially unresolved. O5 discussed within corpus limits; numeric ranges unresolved (F6) — partial. O6 proposed checks + uncertainty (F8, below) — accepted.

## Proposed discriminating checks (not executed; execution forbidden this stage)

P1 Axis contrast: same pair through `always_xy=True` vs `False`; plus a swap-sensitive point (e.g. lon≠lat, both in plausible range) — orders must differ. P2 Unit confusion: degree pair vs radian pair under each `radians` setting — only one is sane. P3 Error path: invalid input (e.g. latitude 98°) with `errcheck=False` vs `True` — expect `inf` vs exception. P4 Output units: `CRS("EPSG:3857").axis_info` / `transformer.target_crs` plus a known-value witness (M06 scope). P5 Edges: near-pole, antimeridian-crossing bounds (`transform_bounds` densify/antimeridian note, L1006–1013), out-of-range latitude. P6 Operation audit: `TransformerGroup(4326, 3857, always_xy=True)` — inspect `best_available`, `unavailable_operations`, `accuracy`. P7 Round-trip: FORWARD then INVERSE returns input within tolerance. P8 Environment pin: record PROJ version, grid/network state, `only_best` default at witness time.

## Executed vs proposed; claim ledger

Executed: manifest hash verification (both match); static reads of projdoc (all 47 lines) and projcode (from_crs, transform/itransform/transform_bounds, TransformerGroup, module-level deprecated wrappers). Proposed: P1–P8 (runtime witnesses, M06-qualified where executing). Accepted: F1–F4,F7; amended: none (no predecessors); rejected: none; unresolved: EPSG:4326 native order from these bytes alone, 3857 unit string, numeric validity ranges, PROJ/grid/env behavior.

Downstream receives these exact bytes as the intermediate. Word count ≈ 700 (within 1100 ceiling).
