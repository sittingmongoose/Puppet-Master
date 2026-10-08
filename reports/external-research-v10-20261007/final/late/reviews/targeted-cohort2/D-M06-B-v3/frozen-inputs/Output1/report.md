# D-M06-B control arm candidate-v3 — report

Case: D-M06-B (affine raster coordinates and inverse applicability). Mode: FROZEN_PUBLIC_PRIMARY_CORPUS (GDAL 3.9.0 geotransforms tutorial and gcore/gdal_misc.cpp, byte-verified against `INPUT_MAP.json`; see `sources.json`). This report holds the adjudication of the untrusted common seed draft (`jobs/D-M06-B/common/seed-v3/draft.md`, sha256 `6dc0086bc4dc3893ff9f919f8a42180f319d7a87b941cb4465f59d1730a62959` — treated as untrusted test input, not truth). Method evidence/substeps and timings are appended in the later sections of this file.

Evidence classes used below: **witnessed** = stated by the frozen source bytes (line-cited); **proposed** = asserted on candidate authority; **executed corroboration** = observed by the sandboxed witness (`witness-receipt.json`, isolation `namespace_and_seccomp_enforced`, process exit 0, 22/22 checks passed). Executed corroboration is process evidence for the tested fixtures only; it never upgrades a proposed number into a witnessed one.

## Claim adjudication (seed draft C1–C6)

**C1 — coefficient order, units, origin: ACCEPTED (witnessed).** Order GT(0) x-origin, GT(1) w-e pixel resolution, GT(2) row rotation, GT(3) y-origin, GT(4) column rotation, GT(5) n-s pixel height (negative for north-up) is witnessed at geotransform.rst 15–20; forward equations at 27–28. The draft's uncertainty note (1-based indexing silently transposes the matrix) is kept as a real hazard. Executed corroboration: the transcription control (source-literal formula vs matrix form) agreed exactly over 8 geotransforms × 6 queries, and all 10 hand-computed forward expectations matched.

**C2 — corners vs centers: ACCEPTED (witnessed distinction; caller duty proposed).** Corner origin (0,0) and top-left pixel center (0.5,0.5) are witnessed at geotransform.rst 30–32. The world-file loader's center-to-corner conversion is witnessed at gdal_misc.cpp 2189–2193 (comment at 2189; arithmetic shift of gt[0] by 0.5·gt[1] and 0.5·gt[2] and of gt[3] by 0.5·gt[4] and 0.5·gt[5] at 2190–2193); the draft's citation "2190–2193" is correct for the arithmetic. The +0.5 caller-side mapping remains **proposed** duty. Executed corroboration: world(0.5,0.5) − world(0,0) equals 0.5·(gt1+gt2, gt4+gt5) to 2.4e-15 for all geotransforms, and corner ≠ center for every nonconstant map (the constant zero-scale map legitimately coincides — added during witnessing).

**C3 — rotation/shear is general, north-up special: ACCEPTED (witnessed).** "Typically zero" markers are witnessed verbatim at geotransform.rst 17 and 19; the named north-up special case at 34–38. Assessing any algorithm on the general affine block gt[1], gt[2], gt[4], gt[5] is **proposed** discipline, accepted. Executed corroboration: the rotated fixture's block columns are orthogonal with equal norms and its adjugate inverse equals transpose/det (algebraic identity, 3 sampled points); the sheared fixture's block is non-orthogonal (scale-relative ratio 0.882) — confirming the draft's point that shear vs rotation is read from the whole 2×2 block, not GT(2)'s sign.

**C4 — invertibility and tolerance: ACCEPTED AS PROPOSED (no source-witnessed tolerance exists; one point unresolved).** The sources witness no invertibility criterion or tolerance value; the brief's degenerate fixtures are inputs, not source text. Executed corroboration supports the draft's algebra: det computes to exactly 0.0 in binary floating point for `degenerate_rank1` and `degenerate_zero_scale`; `near_singular` has det ≈ 2.0e-6 but scale-relative ratio r ≈ 1e-6 with inverse amplification ≈ 2e6, so it is formally invertible yet numerically untrustworthy. The draft's insistence that an absolute tolerance misjudges scale (geographic_degrees: |det| = 1e-6 with r = 1, perfectly conditioned) was confirmed. **Unresolved:** the concrete tolerance (proposed tol_rel = 1e-9, ill-conditioning flag r ≤ 1e-4) remains dataset-dependent and unjustified by any source; it is a proposed engineering choice, not a finding.

**C5 — independent derivation, not paired self-test: ACCEPTED WITH AMENDMENT.** The method claim is correct and was executed: the inverse was re-derived by elimination from the two forward equations (adjugate) and checked against hand-computed single-point expectations — both proposed controls (a) and (c) of the draft. Amendment 1: proposed control (b), the GDALGCPsToGeoTransform fit-from-GCPs path (witnessed to exist at gdal_misc.cpp 1811 and 2006), is **not executable** inside the offline stdlib-only sandbox, so here it stands as a witnessed source concept and a recommended external control, not an executed oracle. Amendment 2: an additional executed algebraic control — the transpose/det identity on the orthogonal rotated block — strengthens independence beyond the draft's list. The mutual round-trip was run and explicitly labeled weak evidence (max recovery error 3.3e-10 over 36 round-trips, corroboration only).

**C6 — witnessed/proposed separation and applicability: ACCEPTED WITH AMENDMENT.** The draft's witnessed/proposed partition checks out item by item (bindings and source facts witnessed as cited above; thresholds, caller mapping duty, and pseudocode proposed). Amendments: (i) applicability said "untested against any executed implementation by design of this module" — now partially superseded, since the candidate algorithms were executed in the sandbox on the seed fixtures; the scoping statement becomes: executed on tested fixtures only, GDAL itself never executed, full-claim strength requires the hand/algebraic controls. (ii) Applicability domain (six-coefficient affine geotransforms in any CRS; not polynomial/RPC; extent containment is caller policy because the affine map is total on R² — out-of-extent queries returned finite values) is accepted with executed corroboration.

## Disposition summary

| Claim | Disposition | Key citations |
|---|---|---|
| C1 order/units/origin | accepted (witnessed) | geotransform.rst 15–20, 27–28 |
| C2 corners vs centers | accepted (witnessed); caller duty proposed | geotransform.rst 30–32; gdal_misc.cpp 2189–2193 |
| C3 rotation/shear general | accepted (witnessed) | geotransform.rst 17, 19, 34–38 |
| C4 invertibility/tolerance | accepted as proposed; tol value unresolved | gdal_misc.cpp (no source tolerance); witness receipt |
| C5 independent controls | accepted with amendment | gdal_misc.cpp 1811, 2006; witness receipt |
| C6 separation/applicability | accepted with amendment | all of the above |

No claim required outright rejection; no blanket rejection was applied. Open items carried forward: the concrete tolerance values (C4) and the question whether a reviewed module may invoke external GCP-fit controls (C5) are unresolved design questions, not settled findings.

## Method evidence and substeps

1. Byte-verified both frozen sources against `INPUT_MAP.json` (sha256 match) and re-read every cited locator against the frozen bytes; recorded in `sources.json` (verification entries, 2026-10-08T01:54:20Z).
2. Read the brief, the untrusted seed draft (hash matched the frozen seed declaration before adjudication), fixtures, and seed source identities; treated draft claims C1–C6 and all fixture values as untrusted inputs.
3. Authored `witness-input.json`: the 8 fixture geotransforms and 6 query points as inputs, plus candidate-derived hand expectations (10 forward, 3 inverse) each with its hand derivation, a proposed scale-relative invertibility policy (tol_rel = 1e-9, ill-conditioned flag r ≤ 1e-4), and applicability/units statements.
4. Authored `witness.py` (stdlib-only, reads `/input.bin`): source-literal forward, matrix-form transcription control, adjugate inverse derived by elimination, hand-expectation comparisons, transpose/det algebraic control on the orthogonal rotated block, labeled-weak mutual round-trip, half-pixel displacement identity, invertibility classification with exact-zero guards, amplification report for near-singular, out-of-extent totality note. Exit 0 only if all checks pass.
5. Executed once via the er10 mechanical sandbox (`--wall-seconds 5`): run 1 exposed a defect in my own distinctness check (corner==center legitimately holds for the constant zero-scale map); the check was corrected to exclude zero 2×2 blocks and run 2 passed 22/22. Both receipts are retained (`witness-receipt-run1-checkbug.json`, `witness-receipt.json`).
6. Distinguished throughout: **process success** (sandbox receipt isolation/exit) ≠ **valid scientific witness** (22/22 executed checks passing = a valid witness of the proposed algorithms on the tested fixtures only) ≠ **full claims** (GDAL not executed; tolerance values proposed, not witnessed; full forward/inverse claims need the hand/algebraic controls, not the weak mutual round-trip alone).
7. Adjudicated C1–C6 against the primary text (section above); wrote `final.md` within the soft ceilings.

### Executed commands (actual, in session)

- `sha256sum cases/D-M06-B/inputs/sources/geotransform.rst cases/D-M06-B/inputs/sources/gdaltransform.cpp` — both matched `INPUT_MAP.json` (2026-10-08T01:54:20Z).
- `sha256sum jobs/D-M06-B/common/seed-v3/draft.md` — matched the frozen seed declaration `6dc0086b…62959` before adjudication.
- `python3 -m py_compile candidate-v3/witness.py` and `python3 -m json.tool candidate-v3/witness-input.json` — pre-run syntax/data checks (host side only; no science executed on host).
- Run 1 (02:01:37Z): `python3 -B /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/mechanical/sandbox.py --code candidate-v3/witness.py --input candidate-v3/witness-input.json --wall-seconds 5 --receipt candidate-v3/witness-receipt.json` — process exit 0 at the sandbox level, witness checks 21/22; the failing check was a defect in my own distinctness check, receipt retained as `witness-receipt-run1-checkbug.json`.
- After correcting that check: receipt moved aside, identical command re-run (run 2, 02:02:27Z) — sandbox command exit 0, `process_exit` 0, isolation `namespace_and_seccomp_enforced`, 22/22 checks, saved as `witness-receipt.json` (code sha256 `fd82a82f…c37`, input sha256 `1fe06ef6…c12`, matching the on-disk files).
- Post-run verification: receipt parse, `checks_total == checks_passed`, and sha256 equality of code/input against receipt fields.

## Timings

- Arm preparation T0 (frozen): 2026-10-08T01:51:28.689459+00:00; arm deadline 2026-10-08T02:21:28.689459+00:00; case deadline 2026-10-08T02:25:00.781858+00:00.
- First useful finding (source hashes verified, locators confirmed): 2026-10-08T01:54:20Z (actual, from `sources.json` verification entries).
- Witness run 1 (checks executed; one candidate-check defect found): 2026-10-08T02:01:37Z (actual, receipt timestamps).
- Witness run 2 (final, 22/22): 2026-10-08T02:02:27Z (actual, receipt timestamps; elapsed 0.10 s in-sandbox).
- Adjudication written: 2026-10-08T02:06Z (actual, file mtime); `final.md` completed: 2026-10-08T02:09Z (actual, file mtime).
- Full detail: `timings.json`. Unknown usage: billed harness/queue/startup time not directly observable by this agent; recorded as unknown there rather than estimated.
