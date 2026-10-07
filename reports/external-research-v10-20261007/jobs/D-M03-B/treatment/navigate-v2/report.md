# D-M03-B navigate-v2 — evidence navigation map (treatment)

Role: navigate. Index hits are not conclusions. All locations below were opened and read; downstream must verify prose before citing.

## Frozen corpus (read directly)

- `brief.md`: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M03-B/inputs/brief.md` — EPSG:4326→EPSG:3857, lon/lat-degrees input claim; 6 obligations; frozen-corpus mode; no execution.
- `projdoc` (pyproj 3.6.1, 2026-10-07, sha256 `261a0a36…ade51`): `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M03-B/inputs/sources/projdoc.rst` (47 lines). URL `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/docs/api/transformer.rst`.
- `projcode` (pyproj 3.6.1; PROJ 9.3.0 assumed by brief, no execution implied; 2026-10-07, sha256 `f5f8a43c…dabda`): `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M03-B/inputs/sources/projcode.py` (1339 lines). URL `https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py`.

## Navigation by obligation

### 1. from_crs → creation → transform use
- `projcode.py:553-637` `Transformer.from_crs` — full signature + docstring; delegates to `TransformerFromCRS` + `CRS.from_user_input(...).srs` (L625-637). Governing for config trace.
- `projcode.py:78-115` `TransformerFromCRS` dataclass — fields `crs_from/crs_to/always_xy/area_of_interest/authority/accuracy/allow_ballpark/force_over/only_best`; `__call__` → Cython `_Transformer.from_crs` (L105-115). Boundary: Cython impl not in frozen corpus.
- `projcode.py:325-338` `Transformer.__init__` — only `from_crs`/`from_pipeline` allowed, else `ProjError`.
- `projcode.py:505-551` `Transformer.from_proj` — deprecated path, still shows `always_xy`/`area_of_interest` passthrough; do not recommend.
- `projcode.py:639-677` `from_pipeline` — alternative constructor; out of scope for from_crs question but confirms pipeline/radians note.

### 2. Input order vs CRS native axis metadata
- `projdoc.rst:14-20` axis-order warning — swap condition (first component northerly), `CRS` class check pointer, `always_xy` pointer. Key framing; external PROJ FAQ link not fetched.
- `projcode.py:583-586` `always_xy` doc (from_crs) — "traditional GIS order… longitude, latitude… easting, northing".
- `projcode.py:179-182` same wording in `TransformerGroup.__init__`.
- `projcode.py:778-782` `transform` docstring example `from_crs("EPSG:4326","EPSG:3857")` + `transform(33, 98)` — promising for single-example critique: input reading depends on default `always_xy=False`; downstream must establish what (33,98) denotes under each setting, not assume.
- `projcode.py:883-885` `itransform(switch)` — separate axis-swap mechanism at iteration layer; distinguish from `always_xy` at construction.

### 3. always_xy meaning and limits
- Same as §2 plus: `projcode.py:1230-1233` (module `transform`) and `projcode.py:1302-1305` (module `itransform`) repeat GIS-order definition.
- Limits visible in corpus: applies to `transform` input/output contract (L583-586); does not change CRS definitions; default `False` (L556); `TransformerGroup` ordering flag (L160). No statement in corpus that it fixes units, radians, grids, or area selection — absence to note, not to overclaim.

### 4. Radians and output unit domains
- `projcode.py:759-763` `transform(radians)` — True = expect radians in, return radians if geographic, else degrees; "Ignored for pipeline… pyproj 2, but will work in pyproj 3".
- `projcode.py:796-811` geocent↔4326 radians round-trip example — only radians worked example in file.
- `projcode.py:888-892` `itransform(radians)` — same contract.
- `projcode.py:1223-1225`, `1295-1297` module-level `transform`/`itransform` radians wording.
- Output units: `projcode.py:1241-1244` (geocentric meters, z meters) in deprecated `transform` doc; `projcode.py:376-380` `definition`, `369-373` `description` properties as introspection hooks. No 3857-unit sentence in frozen bytes — downstream must condition output-unit claims accordingly.

### 5. Area-of-use and invalid-input/error handling
- Selection: `projcode.py:587-588` `area_of_interest`; `589-600` `authority`/`accuracy`; `601-603` `allow_ballpark`; `604-618` `force_over` (PROJ 9+), `only_best` (PROJ 9.2+).
- Inspection: `projcode.py:390-394` `accuracy` (-1 unknown); `397-406` `area_of_use`; `432-442` `operations`; `444-459` `get_last_used_operation` (PROJ 9.1+); `462-471` `is_network_enabled`.
- Ordering: `projcode.py:147-153` PROJ sorting rule (descending area ∩ interest/use, increasing accuracy, unknown last) — relevant to why one city example cannot establish operation choice.
- Candidates: `projcode.py:222-258` `transformers` / `unavailable_operations` / `best_available`; `260-297` `download_grids` — grid/network dependency surface.
- Errors: `projcode.py:764-766` `transform(errcheck)` — True raises, False returns `inf`; `893-895` same for `itransform`; `1226-1229`, `1298-1301` module copies. `itransform` input validation `projcode.py:953-963` (empty iterable, stride 2-4, `time_3rd`). No invalid-coordinate-range table in corpus.

### 6. Boundary checks / dependency-environment uncertainty
- Provenance gaps (all observed, not inferred): Cython `_Transformer` / `proj_create_crs_to_crs` / `proj_trans_generic` bodies absent; CRS axis/unit metadata lives in `pyproj.crs` (not frozen); PROJ 9.3.0 behavior assumed by brief, not executed; network/grid state via `is_network_enabled`/`download_grids`/`best_available` only.
- Version gates to condition on: `force_over` PROJ 9+ (L604-606); `only_best` PROJ 9.2+ (L607-618); `get_last_used_operation` PROJ 9.1+ (L448).
- Proposed-check seeds (proposals only, not executed): axis-order pair probe (lon/lat vs lat/lon under each `always_xy`); radians on/off pair; `area_of_use`/`accuracy`/`get_last_used_operation` introspection; `TransformerGroup` candidate listing; `errcheck` True/False on invalid input; out-of-area and antimeridian/bounds behavior via `transform_bounds` (`projcode.py:990-1129`); environment pins (pyproj/PROJ/grid/network). Downstream owns selection and wording.

## Handoff notes
- No predecessor artifacts. No additional sources acquired. No code executed, nothing installed.
- Line numbers are 1-based against the frozen files above.
- Single central-city example caution: `transform(33, 98)` example (L778-782) plus sorting/selection machinery (§5) are the promising loci for "what one example fails to establish"; exact failure modes are for the authoring stage to bind to quoted conditions.
