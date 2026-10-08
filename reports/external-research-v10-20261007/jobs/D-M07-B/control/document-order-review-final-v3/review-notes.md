# D-M07-B v3 document-order-review-final — review notes (ticket 2)

Reviewer pass in normal document order over the INPUT_MAP.json-listed paths only:
INPUT_MAP.json → brief.md → sources.json → projdoc.rst → projcode.py → boundary.json → draft.md (untrusted candidate proposal P1–P8).
Base directory abbreviated `B` = /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5.

Documents (all `test -f` verified):
- B/jobs/D-M07-B/control/document-order-review-final-v3/INPUT_MAP.json
- B/cases/D-M07-B/inputs/brief.md (six obligations; optional batch opportunity; soft ceiling 1100 words / 8 findings)
- B/cases/D-M07-B/inputs/sources.json (FROZEN_PUBLIC_PRIMARY_CORPUS manifest, 2 sources)
- B/cases/D-M07-B/inputs/sources/projdoc.rst (pyproj 3.6.1 transformer.rst)
- B/cases/D-M07-B/inputs/sources/projcode.py (pyproj 3.6.1 transformer.py, 1339 lines)
- B/jobs/D-M07-B/control/document-order-review-final-v3/boundary.json (T0, deadlines)
- B/jobs/D-M07-B/common/fresh-untrusted-seed-v3/draft.md (untrusted input P1–P8; not truth, not evaluator judgment)

## Actually-executed checks this stage (static reading only; no code executed, per brief.md line 16)
- E1. All 6 INPUT_MAP-listed paths resolve (`test -f`): 6 OK, 0 missing.
- E2. sha256 of projdoc.rst = 261a0a3602984e91ed13179990c535bf19a4e841302554ee4fad25b77e4ade51 and of projcode.py = f5f8a43cb7030e5d0462121a54414be74504586dbb1d32d4c37857f1de9dabda; both byte-match sources.json. This corroborates draft.md line 21's "sha256-verified this stage" claim (executed here, not taken from the draft).
- E3. Static line-level verification of every draft-cited mechanism in projdoc.rst / projcode.py (grep, see per-obligation lines below).

All other checks named below are PROPOSED by the draft/brief, not executed.

## Obligation 1 — order/unit assumptions governing all downstream coordinates (draft P1, P2)
- ACCEPTED: axis-swap warning for first-axis-north CRSs — projdoc.rst:14-17; `always_xy` as the fix — projdoc.rst:18-20, projcode.py:583-586 (from_crs param doc) and 179-182 (TransformerGroup param doc).
- ACCEPTED: default-mode inputs read as (lat, lon): docstring example `from_crs("EPSG:4326","EPSG:3857").transform(33, 98)` → 10909310.098 / 3895303.963 — projcode.py:778-782. Governing condition: this example is illustrative doctest output, not an axis-order contract statement; the contract statement is the projdoc warning plus CRS-class check (projdoc.rst:18).
- ACCEPTED: `radians=False` default on transform (projcode.py:759-761) and itransform (projcode.py:888-890); degrees for geographic, no auto-detection anywhere in the corpus — unresolved by corpus.
- AMENDED: draft P2 says output is "in the target CRS's linear unit — metres for EPSG:3857 (projcode, transform()/itransform radians parameter)". The cited parameter docs state degrees/radians for geographic input/output only (projcode.py:759-761, 888-890); "metres for EPSG:3857" is general knowledge, not corpus text. Keep the conclusion, mark the unit claim as corpus-extrapolated.
- UNRESOLVED: whether the upstream UI truly delivers lon,lat per record (draft P1 uncertainty; corpus cannot answer).
- PROPOSED (not executed): assert source axis order via CRS class (projdoc.rst:18 recommendation); explicit radians=True contract for radian data.

## Obligation 2 — selected transform applicability and error handling (draft P3, P5)
- ACCEPTED: errcheck=False default returns `inf` on error instead of raising — transform projcode.py:764-766; itransform projcode.py:893-895; deprecated module functions projcode.py:1226-1229, 1298-1301. Governing condition: this is the default on every documented path, so silent-inf is the system norm absent an explicit errcheck=True.
- ACCEPTED: applicability tooling — Transformer.area_of_use property projcode.py:397-406; TransformerGroup ordering "by descending area (intersection … with the area of use of the CRS)" projcode.py:146-154; unavailable_operations (missing grids) projcode.py:230-237; best_available projcode.py:239-244.
- ACCEPTED: ballpark-fallback concern is corpus-grounded: from_crs `allow_ballpark` defaults to allowing Ballpark transformations (projcode.py:601-603, and TransformerGroup:198-200); allow_ballpark=None in from_crs passes through (projcode.py:633).
- UNRESOLVED: whether specific out-of-range inputs (e.g. latitude 98) raise, return inf, or extrapolate — corpus is silent (draft P3 uncertainty); needs runtime probe.
- UNRESOLVED: EPSG:3857's exact area-of-use polygon is not in the corpus; extract at runtime.
- PROPOSED (not executed): errcheck=True on the interactive path or math.isfinite post-check; read/record area_of_use of the selected transformer and treat out-of-region results as suspect.

## Obligation 3 — boundary behavior, not only ordinary city points (draft P4)
- ACCEPTED: neither projdoc.rst nor projcode.py states EPSG:3857's usable latitude cutoff or pole behavior; transform/itransform docs cover error returns only (projcode.py:764-766, 893-895). Web-Mercator pole divergence itself is general knowledge, not corpus text — mark as such.
- ACCEPTED: brief.md line 3 explicitly says inputs "can include poles and swapped coordinates", so boundary review is in scope, not optional.
- UNRESOLVED: behavior at ±90° and near-pole (85, 89.9, 89.999, 90) — treat as unverified.
- PROPOSED (not executed): probe `transform(0, y)` for y ∈ {85, 89.9, 89.999, 90} recording value/inf/exception per case.

## Obligation 4 — preserve supported validation and user-facing constraints (draft P8)
- ACCEPTED: supported interfaces = Transformer.from_crs, errcheck, area_of_use, CRS-class axis check (projdoc.rst:18-20; projcode.py:552-637, 764-766, 397-406).
- ACCEPTED: module-level transform()/itransform() are deprecated and emit FutureWarning at call time — projcode.py:1210-1211 + 1247-1255, and 1274-1275 + 1328-1336. Avoidance rule is sound for this release.
- AMENDED: "deprecated" carries no removal timeline anywhere in the corpus, so P8's avoidance rule is release-specific (3.6.1) and may need revisiting — draft already flags this; keep as standing condition.
- UNRESOLVED: where swap detection best belongs (import path vs upstream UI) — design choice the corpus does not settle (draft P8).
- GOVERNING CONDITION (accepted): keep the order contract user-facing — detect/reject or explicitly normalize swapped coordinates instead of silently coercing (draft P8; consistent with projdoc.rst:14-20 warning).

## Obligation 5 — optional batch-processing opportunity, assessed separately (draft P6)
- ACCEPTED: itransform streams lazily in 64-point buffers ("64*stride*8 bytes") — projcode.py:971-988 (esp. 972-974); raises ValueError("iterable must contain at least one point") on empty input projcode.py:953-956; restricts stride to 2/3/4 ("points can contain up to 4 coordinates") projcode.py:958-960; `switch` flag for systematically swapped tuples projcode.py:883-885; time_3rd stride-3 restriction projcode.py:962-963.
- ACCEPTED: transform() accepts scalars/lists/tuples/array.array/numpy/xarray/pandas inputs — projcode.py:736-747.
- ACCEPTED: threading caveat — Transformer keeps per-thread state via TransformerLocal(threading.local) projcode.py:300-310 and 348-359 (lazy per-thread rebuild 357-359); TransformerGroup-returned transformers documented "not thread-safe" projcode.py:143-144 (and TransformerUnsafe, projcode.py:57-74, 217-219). Note TransformerGroup.__init__ wraps each in TransformerUnsafe.
- AMENDED: P6 says itransform "accepts a switch flag" — correct, but it is an input-order switch applied per buffer in _transform_sequence (projcode.py:978-986), not a validation of data order; does not substitute for obligation-4 explicit normalization.
- PROPOSED (not executed): 10k-point timing comparison itransform vs array transform; no performance numbers exist in the corpus.
- SEPARATENESS (accepted, brief.md line 11): batch opportunity is an optimization, gated behind obligations 1–4 correctness; adopting it must not weaken the errcheck/order contracts (errcheck is available on itransform too, projcode.py:893-895).

## Obligation 6 — unresolved environmental dependency kept visible (draft P7)
- ACCEPTED: version-gated options — force_over "Requires PROJ 9+" projcode.py:604-606; only_best "Requires PROJ 9.2+" projcode.py:607-618; get_last_used_operation "Requires PROJ 9.1+" projcode.py:444-448. Network/data dependence — is_network_enabled projcode.py:461-471; TransformerGroup.download_grids projcode.py:246-290.
- ACCEPTED: proj_version_str is importable from the module (projcode.py:25-30), so the proposed startup logging is implementable through supported interfaces.
- GOVERNING CONDITIONS (accepted): the frozen corpus holds pyproj 3.6.1 sources only — no PROJ binary, no PROJ data, no grids (sources.json kind: "public primary raw bytes"); PROJ 9.3.0 is the brief's assumption and is unverified (sources.json line 18). Every runtime-flavored claim above is conditional on the installed PROJ.
- PROPOSED (not executed): log proj_version_str and data directory at startup before relying on any gated option.

## Optional lead (brief.md line 11 context; draft P4 lead)
- AMENDED-ACCEPTED: gate high-latitude inputs by the documented area of use rather than an assumed cutoff. Corpus support exists for the mechanism (area_of_use, projcode.py:397-406) but the specific EPSG:3857 polygon and any latitude cutoff are not in the corpus (see obligation 2/3 unresolved items); the lead's normative force comes from general knowledge beyond the corpus and is marked as such (draft P4), consistent with the review's corpus discipline.

## Consequential claims / governing conditions register (never omit)
1. errcheck=False → silent inf is the default on every documented transform path (projcode.py:764-766, 893-895) — governs obligations 2, 3, 5.
2. Axis order for EPSG:4326 defaults to (lat, lon); always_xy flips to (lon, lat) (projdoc.rst:14-20) — governs all downstream coordinates.
3. Degrees-not-radians default, no auto-detection (projcode.py:759-761, 888-890) — governs units.
4. Ballpark transformations allowed by default (projcode.py:601-603) — applicability results may silently be lower-accuracy.
5. Corpus = pyproj 3.6.1 static bytes only; PROJ 9.3.0 assumed, unverified; no binary/data/grids in corpus (sources.json; brief.md line 14) — governs every runtime claim.
6. boundary.json: common T0 2026-10-07T23:14:13.527092+00:00; absolute case deadline 2026-10-08T00:04:13.527092+00:00; stage ceiling 30 min; all queue/startup/handoff time included — governs process, not science content.
7. Draft is an untrusted test input, not truth or evaluator judgment (brief.md line 16; draft.md line 1) — every P-claim re-derived from sources above, none adopted on the draft's authority.

## Disposition summary
- Accepted: P1 axis contract + example reading; P2 radians default (with amendment); P3 errcheck/inf mechanism; P4 corpus-silence on cutoffs; P5 applicability tooling + ballpark default; P6 all cited mechanisms incl. threading; P7 version gates + data dependence; P8 supported-interface rule + FutureWarning.
- Amended: P2 unit claim (metres-for-3857 not corpus text); P6 switch-flag framing (input-order switch, not validation); P4/P5 lead (mechanism corpus-grounded, cutoff/polygon not).
- Rejected: none — no draft claim contradicted the frozen sources.
- Unresolved: lat-98 behavior; pole/near-pole behavior; EPSG:3857 area polygon; UI lon,lat guarantee; swap-detection placement; deprecated-function removal timeline; installed PROJ version/data state.
- Proposed vs executed: executed = E1–E3 above (existence, hashes, line-level static verification); everything else proposed only, requiring runtime probes on the target environment.

Exposure report: none — reads this stage were confined to INPUT_MAP-listed paths; no sibling/other-arm/campaign-state files opened.
