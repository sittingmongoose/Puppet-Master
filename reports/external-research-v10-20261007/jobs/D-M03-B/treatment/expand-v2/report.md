# D-M03-B expand-v2 — dependency expansion (treatment)

Stage: D-M03-B / treatment / expand-v2. Role: expand.
Procedure: follow governing definitions, callers, dependency conditions beyond first match.
Read directly: brief.md; projdoc.rst (47 lines, full); projcode.py (1339 lines, focused sections); navigate-v2 + focused_read-v2 as locators only, every citation re-verified. No code executed, nothing installed, no additional sources acquired. Executed-check set: empty. All checks below are PROPOSALS.

Frozen sources:
- projdoc: pyproj 3.6.1, 2026-10-07, sha256 261a0a36…ade51, `.../inputs/sources/projdoc.rst`, url `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/docs/api/transformer.rst`.
- projcode: pyproj 3.6.1 (PROJ 9.3.0 assumed by brief, no execution implied), 2026-10-07, sha256 f5f8a43c…dabda, `.../inputs/sources/projcode.py`, url `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py`.

## E1. from_crs chain + all consuming callers

- Definition: `Transformer.from_crs(crs_from, crs_to, always_xy=False, area_of_interest=None, authority=None, accuracy=None, allow_ballpark=None, force_over=False, only_best=None)` (projcode.py:553-562). Body encodes both CRS via `CRS.from_user_input(...).srs` into `TransformerFromCRS` (L625-637), whose `__call__` passes all flags to Cython `_Transformer.from_crs` (L99-115). Governing C refs `proj_create_crs_to_crs[_from_pj]` (L568-569) are names only; bodies absent — creation internals past L99-115 are unobserved.
- Gate: `Transformer.__init__` accepts only a `TransformerMaker`, else `ProjError` (L325-338). Negative caller: `from_proj` deprecated in favor of from_crs (L505-551, L514); module `transform`/`itransform` deprecated (L1210-1211, L1274-1275), both delegate to `from_proj` (L1256-1258, L1337-1339) — do not recommend.
- Consuming callers sharing this construction contract: `transform(xx,yy,zz,tt,radians,errcheck,direction,inplace)` (L716-726, C `proj_trans_generic` L730); `itransform(points,switch,time_3rd,radians,errcheck,direction)` (L862-870, same C ref L874, sequence path L978-986); `transform_bounds(left,bottom,right,top,densify_pts,radians,errcheck,direction)` (L990-1000, C `proj_trans_bounds` L1004). Per-call flags compose with construction flags at each call.
- Required contract for lon/lat-degrees EPSG:4326→3857: `from_crs("EPSG:4326","EPSG:3857",always_xy=True)`, `transform(...,radians=False,direction=FORWARD)` defaults (L583-586, L759-763, L767-769).

## E2. Input order vs CRS metadata — second and third matches

- First match: projdoc.rst:14-20 warning — order "may be swapped if … first coordinate … northerly", check via `pyproj.crs.CRS`, `always_xy` preserves x,y. Second match: `always_xy` GIS-order definition repeats identically in from_crs (L583-586), `TransformerGroup.__init__` (L179-182), module `transform` (L1230-1233) and `itransform` (L1302-1305) — four synchronized wordings, one meaning. Third match: `itransform(points,switch)` (L883-885, module L1293-1294) is a SEPARATE iteration-layer swap (x,y↔y,x at sequence time, passed as `switch=` to `_transform_sequence` L981), not the construction-layer `always_xy`. Conflation is an error.
- Separation rule (supported): caller tuple claim (lon,lat) ≠ CRS native order (in `pyproj.crs`, NOT frozen) ≠ I/O contract (`always_xy`; default False L556/L160/L1205/L1269). With True the (lon,lat) call is correct regardless of native order; with False the same bytes are read as native-ordered. Native EPSG:4326 order cannot be established from these two files — unresolved, must stay conditioned.

## E3. Radians / units — dependency conditions across callers

- Radians contract identical in `transform` (L759-763: True = expect radians in, return radians iff geographic else degrees; pipeline "Ignored for pyproj 2, works in pyproj 3"), `itransform` (L888-892), `transform_bounds` (L1046-1048), module copies (L1223-1225, L1295-1297). Only worked radians example: geocent↔4326 round-trip, meters on geocent side, radians on geographic side (L791-811, itransform copy L919-940). For degree input: `radians=False` (default); True would misread degrees as radians. Pipeline + identity examples (L783-790, L812-815, L911-918, L941-948, L1323-1325) show radians/default passthrough but no 4326→3857 unit sentence.
- Output units: NO frozen sentence states 3857 units. Nearest: module `transform` doc geocentric x/y meters, z meters (L1241-1244); live introspection hooks `definition`/`description`/`name` (L361-380), `source_crs`/`target_crs` properties (L473+). Output-unit claim must be conditioned as outside-corpus or deferred to a later root-qualified witness — not asserted here.

## E4. Selection, area, error handling — full dependency surface

- Selection inputs: `area_of_interest` (L587-588; Group orders by it L183-185), `authority` (L589-597), `accuracy` metres filter (L598-600), `allow_ballpark` default-allow (L601-603; Group default True L198-200), `force_over` PROJ 9+ (L604-606), `only_best` PROJ 9.2+ incl. env/ini override (L607-618). Inspection outputs: `accuracy` (-1 unknown L390-394), `area_of_use` (L396-406), `operations` (L432-442), `get_last_used_operation` PROJ 9.1+ (L444-459), `is_network_enabled` (L461-471), `TransformerGroup.transformers/unavailable_operations/best_available` (L221-244), `download_grids` w/ missing-URL warning (L246-297).
- Ordering rule (quoted PROJ docs L146-152): descending area (transformation∩interest, else ∩CRS use), increasing accuracy, unknown-accuracy last. Operation choice is therefore area+accuracy dependent — a single point success cannot identify it.
- Error contract identical in `transform` (L764-766), `itransform` (L893-895), `transform_bounds` (L1049-1051), module copies (L1226-1229, L1298-1301): True raises, False (default) returns `inf`. `itransform` structural validation only: non-empty, stride 2-4, `time_3rd` only stride 3 (L953-963). No coordinate-range table; out-of-domain behavior beyond errcheck/inf unobserved. `transform_bounds` adds densify_pts=21 edge handling + antimeridian rule (right<left → two polygons L1009-1025); bounds inputs are first/second axis in source CRS (L1030-1041), so they inherit the axis-order contract.

## E5. What one central-city example fails to establish (expanded)

- The `from_crs("EPSG:4326","EPSG:3857")` + `transform(33,98)` → `10909310.098 3895303.963` example (L778-782) uses DEFAULT `always_xy=False`; what (33,98) denotes depends on unobserved native order (second example L812-815 shows 4326→4326 identity preserves input order, confirming order-sensitivity, not resolving it). `itransform` 4326→2100 example (L905-910) likewise uses defaults. One success therefore fails to establish: (a) axis-order correctness — swapped pair can still yield plausible-magnitude numbers at the wrong place; (b) operation/accuracy/area validity per L146-152 + §E4 introspection gap; (c) radians vs degrees; (d) output units; (e) edges (antimeridian per L1009-1025, poles, out-of-area, invalid input under each errcheck); (f) environment (PROJ version gates 9/9.1/9.2, grids/network per L240-297/L461-471).

## E6. Discriminating proposed checks + uncertainty (proposals only, none executed)

1. Axis pair: same city as (lon,lat) vs (lat,lon) under `always_xy` True/False; predict only the True+(lon,lat) matches known location.
2. Radians pair: one point with radians False vs True; predict degree/radians misread.
3. Introspection: `area_of_use`/`accuracy`/`operations`/`get_last_used_operation` (9.1+) after transform; `TransformerGroup(...).transformers` + `best_available` listing.
4. Error pair: invalid input (e.g. lat-98 reading) under errcheck False (expect `inf`) vs True (expect raise).
5. Bounds/edge: `transform_bounds` central vs antimeridian-crossing box; densify sensitivity.
6. Environment pins: pyproj/PROJ versions, `is_network_enabled`, grid availability; condition `force_over`/`only_best`/`get_last_used_operation` on gates.
- Uncertainty (observed gaps): Cython `_Transformer`/`proj_trans_generic`/`proj_create_crs_to_crs`/`proj_trans_bounds` bodies absent; `pyproj.crs` axis/unit metadata absent; PROJ 9.3.0 assumed, not executed; network/grid state only via §E4 hooks.

## Handoff dispositions

- Accepted: from_crs+always_xy=True+degrees+FORWARD contract for lon/lat-degrees input (L553-637, L583-586, L759-763). Rejected: from_proj/module-function path (deprecated); radians=True for degree input; `switch` as substitute for `always_xy`. Amended: none. Unresolved: native 4326 axis order; 3857 output units; operation choice/accuracy for this pair — need out-of-corpus or later-witness evidence, carried as conditions not facts.
