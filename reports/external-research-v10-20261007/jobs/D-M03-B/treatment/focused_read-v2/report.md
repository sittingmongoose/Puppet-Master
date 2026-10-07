# D-M03-B focused_read-v2 — focused implementation read (treatment)

Stage: D-M03-B / treatment / focused_read-v2. Role: focused_read.
Read: brief.md, projdoc.rst (47 lines, full), projcode.py (1339 lines; focused sections opened and read), navigate-v2 map as locator only (verified before citing). No code executed, nothing installed. All line refs 1-based against frozen bytes below.

Frozen sources:
- projdoc: pyproj 3.6.1, 2026-10-07, sha256 261a0a36…ade51, `.../inputs/sources/projdoc.rst`, url `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/docs/api/transformer.rst`.
- projcode: pyproj 3.6.1 (PROJ 9.3.0 assumed by brief, not executed), 2026-10-07, sha256 f5f8a43c…dabda, `.../inputs/sources/projcode.py`, url `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py`.

## 1. from_crs configuration → creation → transform use

- `Transformer.from_crs(crs_from, crs_to, always_xy=False, area_of_interest=None, authority=None, accuracy=None, allow_ballpark=None, force_over=False, only_best=None)` (projcode.py:553-562) is the governing constructor. It encodes both CRS inputs via `CRS.from_user_input(...).srs` into a `TransformerFromCRS` dataclass (L625-637), whose `__call__` delegates to Cython `_Transformer.from_crs` with the same flags (L99-115). The Cython body and `proj_create_crs_to_crs` are NOT in the frozen corpus: creation internals past this boundary are unobserved.
- `Transformer.__init__` accepts only a `TransformerMaker` (i.e. from_crs/from_pipeline products), else raises `ProjError` (L325-338). `from_proj` is deprecated in favor of from_crs (L514) — do not recommend.
- Call contract: `transformer.transform(xx, yy, zz=None, tt=None, radians=False, errcheck=False, direction=FORWARD, inplace=False)` (L716-726). Per-call flags (`radians`, `errcheck`, `direction`) combine with construction flags (`always_xy`, area/authority/accuracy/ballpark). Scalar fast path via `_transform_point`, array path via `_transform` (L818-860); both are Cython, unobserved.
- Required configuration for lon/lat-degrees tuples EPSG:4326→EPSG:3857: `Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)` with default `radians=False`, `direction=FORWARD`. Governing condition: `always_xy=True` per L583-586; degrees per L759-763.

## 2. Input order vs CRS native axis metadata

- Axis order is a property of the CRS definitions, not of the caller's tuple claim. projdoc.rst:14-20 warns the axis order "may be swapped if the source and destination CRS's are defined as having the first coordinate component point in a northerly direction", points to `pyproj.crs.CRS` for checking, and names `always_xy` as the x,y-preserving option. CRS axis metadata lives in `pyproj.crs`, NOT in the frozen corpus — native EPSG:4326 axis order cannot be established from these two files alone.
- `always_xy` doc (L583-586, repeated L179-182, L1230-1233): True = accept input and return output in "traditional GIS order, that is longitude, latitude for geographic CRS and easting, northing for most projected CRS". Default False (L556): input reading follows CRS native order, whatever it is.
- Separation rule: caller says "my tuples are (lon, lat)"; CRS metadata says "my native order is …"; `always_xy` binds the two. With True, (lon,lat) is correct regardless of native order; with False (default), the same tuple is read as native-ordered and silently swaps meaning if native is (lat,lon).
- `itransform(switch)` (L883-885) is a SEPARATE iteration-layer axis swap, not the construction-layer `always_xy`. Do not conflate.

## 3. always_xy meaning and limits

- Meaning: input/output axis-order contract for `transform`/`itransform` (L583-586, L888-892 context). Applies symmetrically to both ends (input accepted and output returned in GIS order).
- Observed limits: (a) default False — must be set explicitly; (b) does not change CRS definitions, only the I/O contract; (c) corpus states nothing about it affecting units, radians handling, grid selection, or area-of-interest ordering — absence noted, not a positive claim; (d) `TransformerGroup` carries its own `always_xy` ordering flag (L160) for candidate listing.

## 4. Radians and output unit domains

- `transform(radians=...)` (L759-763): True = expect radians in, return radians if the projection is geographic, else degrees. Default False = degrees. Same for `itransform` (L888-892). Pipeline note: ignored in pyproj 2, works in pyproj 3 (L762-763, L891-892). Only worked radians example is geocent↔4326 round-trip (L796-811); input is meters on the geocent side, radians on the geographic side.
- For this case: input is degrees → `radians=False` (default). Setting True would misread degree values as radians.
- Output units: NO sentence in the frozen bytes states EPSG:3857 output units. Nearest observed: deprecated module `transform` doc says geocentric x/y in meters, z always meters (L1241-1244); `definition`/`description` properties (L368-380) are introspection hooks for the live object. Output-unit claim for 3857 must be conditioned as outside-corpus or verified at a later executed-witness stage — not asserted from these files.

## 5. Area-of-use, operation selection, invalid input / errors

- Selection machinery: `area_of_interest` (L587-588), `authority`/`accuracy` (L589-600), `allow_ballpark` (L601-603), `force_over` PROJ 9+ (L604-606), `only_best` PROJ 9.2+ (L607-618). Inspection: `accuracy` (-1 unknown, L390-394), `area_of_use` (L396-406), `operations` (L432-442), `get_last_used_operation` PROJ 9.1+ (L444-459), `is_network_enabled` (L461-471). Candidate/grid surface: `transformers` / `unavailable_operations` / `best_available` (L221-244), `download_grids` (L246-297).
- Ordering rule quoted from PROJ docs (L146-152): most relevant first by descending area (transformation∩interest, or transformation∩CRS use) then increasing accuracy; unknown accuracy sorts last. A single central-city success therefore cannot establish which operation was selected, its accuracy, or its area validity — that needs `accuracy`/`area_of_use`/`get_last_used_operation`/`TransformerGroup` introspection.
- Error contract: `errcheck=True` raises on errors; False (default) returns `inf` for errors (L764-766; same L893-895, L1226-1229). `itransform` validates iterable non-empty, stride 2-4, `time_3rd` only for stride 3 (L953-963). No invalid-coordinate-range table in corpus; out-of-domain behavior beyond errcheck/inf is unobserved here.

## 6. What one central-city example fails to establish; boundary checks; uncertainty

- The docstring example `from_crs("EPSG:4326","EPSG:3857")` + `transform(33, 98)` → `10909310.098 3895303.963` (L778-782) uses DEFAULT `always_xy=False`, so what (33,98) denotes depends on unobserved native axis order. One success at a central city fails to establish: (a) axis-order correctness (a swapped pair can still produce plausible-looking numbers far from the true point); (b) operation choice/accuracy/area validity (§5 rule); (c) radians vs degrees handling; (d) output-unit interpretation; (e) edge behavior (antimeridian, poles, out-of-area, invalid input under each errcheck setting); (f) environment dependence (PROJ version, grids, network).
- Proposed checks (PROPOSALS, none executed — executed set is empty): axis-order pair probe (same city as (lon,lat) vs (lat,lon) under each always_xy, predict which matches known location); radians on/off pair on one point; `area_of_use`/`accuracy`/`get_last_used_operation` introspection after a transform; `TransformerGroup(...).transformers` + `best_available` listing; errcheck True vs False on invalid input (e.g. lat 98 reading, inf vs raise); `transform_bounds` (L990+) edge/antimeridian behavior; environment pins (pyproj/PROJ versions, grid availability, `is_network_enabled`).
- Dependency/environment uncertainty (all observed gaps): Cython `_Transformer` / `proj_trans_generic` / `proj_create_crs_to_crs` bodies absent; `pyproj.crs` axis/unit metadata absent; PROJ 9.3.0 behavior assumed by brief, not executed; version gates `force_over` 9+, `only_best` 9.2+, `get_last_used_operation` 9.1+ must be conditioned on the actual runtime; network/grid state only observable via L240-297/L461-471 hooks.

## Handoff

- Dispositions: accepted — from_crs+always_xy=True+degrees contract for lon/lat-degrees input (L553-637, L583-586, L759-763); amended — none at this stage; rejected — from_proj path (deprecated L514), radians=True for degree input (L759-763); unresolved — native EPSG:4326 axis order, 3857 output units, operation choice/accuracy for this pair (all need out-of-corpus or later-witness evidence).
- No additional sources acquired. No code executed. Predecessor navigate-v2 used as locator only; every citation above re-verified against frozen bytes.
