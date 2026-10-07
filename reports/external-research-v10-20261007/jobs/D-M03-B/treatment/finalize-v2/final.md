# D-M03-B Final — pyproj axis-order contract (treatment, finalize-v2)

Case D-M03-B; arm treatment; role finalize. Brief: a pyproj 3.6.1 / PROJ 9.3.0 import
stage accepts tuples documented as (longitude, latitude) degrees and converts
EPSG:4326 to EPSG:3857. This final gives the required `from_crs` configuration and
call contract, with governing conditions.

Frozen sources read directly (no additional sources, no code executed):
- projdoc: pyproj 3.6.1, capture 2026-10-07, sha256 `261a0a36…ade51`,
  `docs/api/transformer.rst` (47 lines).
- projcode: pyproj 3.6.1 (PROJ 9.3.0 assumed by brief, not executed), capture
  2026-10-07, sha256 `f5f8a43c…dabda`, `pyproj/transformer.py` (1339 lines).
Predecessor navigate/focused_read/expand reports were used as locators only; every
citation below was re-verified against these frozen bytes. Line refs are 1-based.

## Recommendation

```python
transformer = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)
x, y = transformer.transform(lon, lat)  # radians=False, direction=FORWARD (defaults)
```

Set `errcheck=True` when failures must raise; the default `False` returns `inf`
on error. All conditions below govern this recommendation.

## Material findings (8)

1. **Config trace (obl 1).** `Transformer.from_crs(crs_from, crs_to,
   always_xy=False, area_of_interest=None, authority=None, accuracy=None,
   allow_ballpark=None, force_over=False, only_best=None)` (projcode.py:553-562)
   encodes both CRS inputs via `CRS.from_user_input(...).srs` into a
   `TransformerFromCRS` object (L625-637), whose `__call__` passes all flags to
   Cython `_Transformer.from_crs` (L99-115). `Transformer.__init__` accepts only
   such maker products, else raises `ProjError` (L325-338). Creation internals
   past L99-115 (`proj_create_crs_to_crs`, `proj_trans_generic`) are names only;
   bodies are not in the frozen corpus. Per-call flags (`radians`, `errcheck`,
   `direction`) on `transform` (L716-726) compose with construction flags at each
   call. `from_proj` is deprecated in favour of `from_crs` (L514): do not use it.
2. **Input order vs native order (obl 2).** Axis order belongs to the CRS
   definitions, not to the caller's tuple claim. projdoc.rst:14-20 warns order
   "may be swapped if the source and destination CRS's are defined as having the
   first coordinate component point in a northerly direction", points to
   `pyproj.crs.CRS` for checking, and names `always_xy` as the x,y-preserving
   option. CRS axis metadata lives in `pyproj.crs`, which is NOT frozen here, so
   the native EPSG:4326 order cannot be established from these two files and stays
   an explicit unresolved condition. Rule: with `always_xy=True`, (lon, lat) is
   correct regardless of native order; with the default `False` (L556) the same
   bytes are read as native-ordered and silently swap meaning if native is
   (lat, lon).
3. **always_xy meaning and limits (obl 3).** True means `transform` accepts input
   and returns output in "traditional GIS order, that is longitude, latitude for
   geographic CRS and easting, northing for most projected CRS" (L583-586;
   identical wording L179-182, L1230-1233, L1302-1305). Limits observed: default
   is False so it must be set explicitly; it changes the I/O contract, not the
   CRS definitions; the corpus states nothing about it affecting units, radians,
   grids, or operation ordering (absence noted, not a positive claim).
   `itransform(points, switch)` (L883-885) is a SEPARATE iteration-layer swap, not
   a substitute for construction-layer `always_xy`.
4. **Radians (obl 4).** `transform(radians=True)` expects radians in and returns
   radians if the projection is geographic, else degrees; default False uses
   degrees (L759-763; same contract `itransform` L888-892, `transform_bounds`
   L1046-1048). Degree input therefore requires `radians=False`; True would
   misread degrees as radians. The only worked radians example is a
   geocent↔4326 round-trip (L791-811).
5. **Output units unresolved (obl 4).** NO frozen sentence states EPSG:3857 output
   units. Nearest observed text: deprecated module `transform` doc (geocentric
   x/y in metres, z in metres, L1241-1244) and live introspection hooks
   (`definition`/`description`, L361-380). Any 3857-unit claim is conditioned as
   outside-corpus, deferred to a later root-qualified witness — not asserted here.
6. **Area selection and error handling (obl 5).** Selection inputs:
   `area_of_interest` (L587-588), `authority` (L589-597), `accuracy` metres filter
   (L598-600), `allow_ballpark` default-allow (L601-603), `force_over` PROJ 9+
   (L604-606), `only_best` PROJ 9.2+ (L607-618). Inspection outputs: `accuracy`
   (-1 unknown, L390-394), `area_of_use` (L396-406), `operations` (L432-442),
   `get_last_used_operation` PROJ 9.1+ (L444-459), `is_network_enabled`
   (L461-471), `TransformerGroup.transformers/unavailable_operations/
   best_available` (L221-244), `download_grids` (L246-297). PROJ sorts candidate
   operations by descending area then increasing accuracy, unknown accuracy last
   (L146-152). Error contract, identical everywhere (L764-766, L893-895,
   L1049-1051): `errcheck=True` raises, default False returns `inf`. `itransform`
   validates only structure (non-empty, stride 2-4, L953-963); no
   coordinate-range table exists in the corpus.
7. **What one central-city success fails to establish.** The docstring example
   `from_crs("EPSG:4326","EPSG:3857")` + `transform(33, 98)` → `10909310.098
   3895303.963` (L778-782) uses DEFAULT `always_xy=False`, so what (33, 98)
   denotes depends on unobserved native order. One success cannot establish:
   (a) axis-order correctness (a swapped pair still yields plausible-magnitude
   numbers at the wrong place); (b) operation choice, accuracy, or area validity
   (per the L146-152 sorting rule); (c) radians vs degrees; (d) output units;
   (e) edge behaviour (antimeridian per L1009-1025, poles, out-of-area, invalid
   input per errcheck setting); (f) environment dependence (PROJ version, grids,
   network).
8. **Dependency/environment uncertainty (obl 6).** Observed gaps: Cython
   `_Transformer` / `proj_trans_generic` / `proj_create_crs_to_crs` /
   `proj_trans_bounds` bodies absent; `pyproj.crs` axis/unit metadata absent;
   PROJ 9.3.0 behaviour assumed, not executed. Condition `force_over` (9+),
   `get_last_used_operation` (9.1+), `only_best` (9.2+) on the actual runtime;
   network/grid state is observable only via §6 hooks.

## Claim dispositions

- Accepted: from_crs + `always_xy=True` + `radians=False` + FORWARD contract for
  (lon, lat)-degrees input (L553-637, L583-586, L759-763, L767-769).
- Amended: none.
- Rejected: `from_proj`/module-function path (deprecated, L514, L1210-1211,
  L1274-1275); `radians=True` for degree input (L759-763); `switch` as a
  substitute for `always_xy` (L883-885 vs L583-586).
- Unresolved (explicit conditions, not facts): native EPSG:4326 axis order;
  EPSG:3857 output units; operation choice/accuracy for this pair. Each needs
  out-of-corpus evidence or a later root-qualified witness.

## Discriminating proposed checks (PROPOSALS — executed set is empty)

1. Axis pair: same city as (lon, lat) vs (lat, lon) under `always_xy` True/False;
   predict only True+(lon, lat) matches the known location.
2. Radians pair: one point with radians False vs True; predict the degree/radian
   misread.
3. Introspection: `area_of_use`/`accuracy`/`operations`/`get_last_used_operation`
   (9.1+) after a transform; `TransformerGroup(...).transformers` +
   `best_available` listing.
4. Error pair: invalid input under `errcheck` False (expect `inf`) vs True
   (expect raise).
5. Bounds/edge: `transform_bounds` central vs antimeridian-crossing box; densify
   sensitivity.
6. Environment pins: pyproj/PROJ versions, `is_network_enabled`, grid
   availability; gate `force_over`/`only_best`/`get_last_used_operation`.

## Uncertainty statement

The axis-order contract above is fully determined by the frozen bytes. Native CRS
order, output units, operation identity, and all runtime behaviour past the
Cython boundary are justified uncertainty carried as conditions; nothing in this
final executes project code or asserts beyond the cited lines.
