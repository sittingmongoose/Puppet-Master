# D-M07-B v3 — critical dependency check (FIRST phase; no breadth work before this file)

Written 2026-10-07T23:29:40Z. Ordering: ticket-1 source log 23:26:48Z → this critical check → ticket-3 protected reserve (file will be created after this one). Subject: the untrusted draft's selected recommendation (pyproj 3.6.1, EPSG:4326→EPSG:3857, P1–P8) — verify the assumptions that could invalidate it before spending anything on breadth.

Sources used: the six INPUT_MAP-listed paths only. Corpus identity re-verified against cases/D-M07-B/inputs/sources.json: projdoc = https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/docs/api/transformer.rst, sha256 261a0a3602984e91ed13179990c535bf19a4e841302554ee4fad25b77e4ade51; projcode = https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py, sha256 f5f8a43cb7030e5d0462121a54414be74504586dbb1d32d4c37857f1de9dabda. Version/capture: pyproj 3.6.1, captured 2026-10-07, frozen bytes. No network fetches this phase (recorded limitation; additional primary checks remain available within policy if budget allows).

## C1. Axis-order contract (highest invalidation power: every downstream coordinate depends on it)

Claim under test: `Transformer.from_crs("EPSG:4326","EPSG:3857", always_xy=True)` makes every call (lon, lat); without it, EPSG:4326 inputs are read (lat, lon).
- Actually-executed: corpus re-read. projdoc L14–20 warns axis order "may be swapped" when the first axis points northerly and names the CRS-class axis check and `always_xy` as the remedies. projcode L778–782 docstring example: `from_crs("EPSG:4326","EPSG:3857")` (default always_xy=False) `.transform(33, 98)` → `10909310.098  3895303.963`. Static arithmetic re-derivation from the Mercator formulas: x = 6378137 × rad(98°) = 10 909 310.1 m; y = 6378137 × ln(tan(45° + 33°/2)) = 3 895 304.0 m. Both match the printed example to <1 m, so the first argument was latitude and the second longitude in default mode.
- Verdict: ACCEPTED as corpus-grounded. Residual (outside corpus): whether the upstream UI truly delivers lon,lat per record — UNRESOLVED. Proposed (not executed): assert source axis order via the CRS class at runtime.

## C2. Unit contract

Claim: default radians=False → degrees in, metres out for EPSG:3857; no auto-detection.
- Actually-executed: projcode L759–763 and L888–892: radians=True expects/returns radians for geographic projections, "Otherwise, it uses degrees."
- Verdict: ACCEPTED. Governing condition: callers feeding radians must set radians=True explicitly.

## C3. Silent-failure channel

Claim: errcheck=False returns inf instead of raising.
- Actually-executed: projcode L764–766 (transform) and L893–895 (itransform): "If False, ``inf`` is returned for errors."
- Verdict: ACCEPTED.

## C4. WHICH inputs actually fail (draft claims poles and swapped coordinates "are exactly the inputs that fail")

- Actually-executed: corpus search — transform()/itransform() docs document the error channel (C3) but enumerate no failing input classes and state no EPSG:3857 latitude cutoff.
- Verdict: AMENDED. The silent-inf channel is corpus-grounded; the identification of poles/swaps as THE failing inputs is not settled by the corpus and stays marked unverified. Proposed (not executed): probe transform(0, y) for y = 85, 89.9, 89.999, 90 and swapped tuples on the target runtime; record value/inf/exception per case.

## C5. Version binding (environmental dependency)

Claim: behavior of pyproj 3.6.1 with PROJ 9.3.0 assumed by the brief.
- Actually-executed: hash verification of both corpus files against the manifest (ticket 1, re-verified this phase). Corpus contains the 3.6.1 Python sources only — no PROJ binary, data, or grids. Version-gated options confirmed in corpus: force_over PROJ 9+ (L605–618), only_best PROJ 9.2+ (L615–618), get_last_used_operation PROJ 9.1+ (L444–448), is_network_enabled (L461–471), TransformerGroup.download_grids (L246–290).
- Verdict: ACCEPTED for pyproj-3.6.1-scoped claims; the installed-PROJ question UNRESOLVED and kept visible (brief obligation 6). Proposed (not executed): log proj_version_str and the data directory at startup before relying on any gated option.

## C6. API-existence dependencies (does every mechanism the recommendation proposes exist in the pinned release?)

- Actually-executed, corpus lines: always_xy (versionadded 2.2.0, L571–575); errcheck (2.1.1, L732); area_of_use (2.3.0, L397–406); TransformerGroup with PROJ area/accuracy sorting quote and unavailable_operations (L137–154, L231–237); itransform 64-point buffering (L971–974), switch flag (L883–885), ValueError on empty input and >4 coordinates (L953–963); per-thread TransformerLocal inside Transformer (L300–310, L336); TransformerGroup thread-unsafety warning (L143–144); FutureWarning on module-level transform/itransform (L1247–1255, L1328–1336).
- Verdict: ACCEPTED — no proposed mechanism is absent from the pinned release.

## C7. EPSG:3857 applicability to the use case

Claim: area_of_use should gate out-of-region transforms; ballpark fallback is a risk.
- Actually-executed: corpus exposes area_of_use (L397–406) and the TransformerGroup ordering/unavailable-operations machinery (L137–154, L231–237), but contains no EPSG:3857 area polygon and no statement about ballpark fallback for this specific pair.
- Verdict: UNRESOLVED (corpus-silent). Proposed (not executed): read the selected transformer's area_of_use at runtime and treat out-of-region results as suspect. This is the explicit lower-risk/breadth reserve subject (ticket 3) — preserved, not deleted.

## Proposed-vs-executed summary

Actually executed this phase: corpus re-reads with line citations; SHA-256 verification; static Mercator arithmetic on the docstring example. Proposed and NOT executed anywhere: runtime probes (pole/near-pole latitudes, swapped tuples), CRS-class axis assertions, proj_version_str/data-dir logging, area_of_use extraction, itransform-vs-array timing, grid/network availability checks. No project code executed (brief forbids it).

Remaining-leads ledger (nothing top-k deleted by this critical pass): C4 runtime probes; C5 environment logging; C7 area-of-use/ballpark breadth; P6 batch/timing comparison; P8 swap-detection placement design choice; deprecated-function removal-timeline question.

Off-policy exposure: none (no failedscience/evaluatorfacts/parenthistory/rootfailureanalysis/sibling/otherarm/othercase/campaignstate path read).
