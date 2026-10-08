# D-M07-B v3 final — CRS import recommendation review (critical-first-protected-breadth-final)

Subject: untrusted candidate proposal P1–P8 — importing user-entered lon/lat via pyproj 3.6.1 (PROJ 9.3.0 assumed by brief), EPSG:4326 → EPSG:3857. Overall verdict: **adopt with amendments** — the order/unit/failure-mode core is corpus-grounded; the draft under-specifies boundary claims and omits documented controls that make its own applicability concerns manageable.

Sources (frozen, FROZEN_PUBLIC_PRIMARY_CORPUS; sha256-verified this stage): projdoc = https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/docs/api/transformer.rst (261a0a36…de51, captured 2026-10-07); projcode = https://raw.githubusercontent.com/pyproj4/pyproj/3.6.1/pyproj/transformer.py (f5f8a43c…abda, captured 2026-10-07). Static reading only; no project code executed. Working evidence: source_log.md, critical_check.md (FIRST), reserve_check.md (SECOND), all in this directory.

## Eight material findings

**F1 — Order contract: ACCEPTED.** Build one `Transformer.from_crs("EPSG:4326","EPSG:3857", always_xy=True)` so every call is (lon, lat). Executed check: the docstring example `transform(33, 98)` → (10909310.098, 3895303.963) (projcode L778–782) re-derived by static Mercator arithmetic (x = 6378137·rad(98°) = 10 909 310.1 m; y = 3 895 304.0 m for lat 33°) — matches, proving default mode reads (lat, lon); projdoc L14–20 warns axis order "may be swapped" and names `always_xy` + the CRS-class axis check as remedies. Unresolved residual: whether the upstream UI guarantees lon,lat per record (proposed: CRS-class axis assertion at runtime).

**F2 — Unit contract: ACCEPTED.** Default radians=False: degrees in, metres out for EPSG:3857 (projcode L759–763, L888–892); no auto-detection exists. Governing condition: any radian-feeding caller must set radians=True explicitly or coordinates silently misplace.

**F3 — Silent-failure channel: ACCEPTED.** With errcheck=False a failed transform returns inf without raising (projcode L764–766, L893–895). Use errcheck=True on the interactive path and/or an `isfinite` guard before persisting results.

**F4 — Which inputs fail: AMENDED; draft's failing-input identification REJECTED as a corpus claim.** The corpus grounds the silent-inf channel but never identifies failing input classes or any EPSG:3857 latitude cutoff. The draft's "poles and swapped coordinates are exactly the inputs that fail" is rejected as a corpus claim and kept as an unverified hypothesis. Proposed (not executed): probe transform(0, y) for y = 85, 89.9, 89.999, 90 and swapped tuples on the target runtime; record value/inf/exception per case.

**F5 — Applicability controls: AMENDED (draft incomplete, corpus supplies the fix).** The draft's ballpark-fallback and out-of-region worries are real but manageable with documented interfaces the draft omitted: `allow_ballpark=False` on from_crs/TransformerGroup (projcode L560, L601–603, L164, L198–200), `TransformerGroup.best_available` (L239–244), `authority="EPSG"` restriction (L587–597), `area_of_use` introspection (L397–406), and `transform_bounds` for region edges incl. the antimeridian rule (L990–1070). EPSG:3857's exact area polygon is not in the corpus — extract at runtime; treat out-of-region output as suspect.

**F6 — Optional batch opportunity: ACCEPTED as optional, assessed separately.** itransform streams lazily in 64-point buffers, accepts `switch` for systematically swapped tuples, raises ValueError on empty input, restricts tuples to 2–4 coordinates (projcode L953–988); transform() accepts arrays (L736–747). Thread caveat: Transformer keeps per-thread state via TransformerLocal (L300–310) while TransformerGroup-returned transformers are documented not thread-safe (L143–144). No performance measured; proposed check: 10k-point timing comparison itransform vs array transform. Batch path must carry the same errcheck/isfinite contract as F3.

**F7 — Validation preservation: ACCEPTED.** Import only through supported documented interfaces (Transformer.from_crs, errcheck, area_of_use, CRS-class axis check). Avoid the deprecated module-level transform()/itransform(), which emit FutureWarning (L1247–1255, L1328–1336). Keep the order contract user-facing: detect and reject or explicitly normalize swapped coordinates rather than silently coercing; itransform's `switch` is only for systematically swapped bulk data.

**F8 — Environmental dependency: UNRESOLVED, kept visible (obligation 6).** The corpus holds pyproj 3.6.1 sources but not the PROJ binary/data; PROJ 9.3.0 remains a brief-level assumption. Version-gated behavior exists: force_over (PROJ 9+), only_best (9.2+), get_last_used_operation (9.1+), network/grid availability (L444–471, L605–618, L246–290). Proposed (not executed): log proj_version_str and the data directory at startup before relying on any gated option; re-verify F1–F3 on the installed pair.

## Governing conditions (never omit)

1. always_xy=True is mandatory on every transformer construction; one default-mode call reintroduces the (lat, lon) swap.
2. Degrees-in/metres-out only under radians=False; radians require explicit opt-in.
3. errcheck=False returns inf silently — no consumer may persist transform output without an isfinite/errcheck guard.
4. Boundary claims (poles, cutoffs) are unverified until the F4 probes run on the target runtime.
5. The installed PROJ version/data are unverified; all gated options stay off the critical path until F8 logging runs.
6. If out-of-region use is possible, allow_ballpark must be set deliberately (False), not left at default.

## Actually-executed vs proposed checks

Executed (this stage, corpus-only): SHA-256 verification of both sources against the manifest; full reads of all six listed inputs; corpus line verifications for every draft citation; static Mercator arithmetic on the docstring example; six-obligation breadth mapping; identification of omitted controls (F5). Proposed, not executed: all runtime probes (F1 axis assertion, F4 pole/swap probes, F5 area_of_use/ballpark evaluation, F6 timing, F8 version/data logging). Rejected items: the F4 failing-input identification as a corpus claim.

## Uncertainty and optional-lead scope

Unresolved: installed PROJ version/data (F8); failing-input set and latitude cutoff (F4); EPSG:3857 area polygon (F5); upstream lon,lat guarantee (F1 residual); batch performance (F6). Optional lead, not required for adoption: batch migration via itransform/transform arrays once the timing probe and thread contract are checked. Full remaining-leads ledger (10 items, none deleted across phases) is preserved in reserve_check.md; limitations: static corpus only, no network captures, no execution — runtime behavior may differ with installed PROJ.
