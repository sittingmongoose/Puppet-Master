# D-M06-B treatment/candidate-v3 — witness report (method evidence and reconciliation)

Case: D-M06-B, mode FROZEN_PUBLIC_PRIMARY_CORPUS, arm preparation T0 2026-10-08T01:51:28.689459+00:00.
Every material finding below carries a disposition and cites either `witness-receipt.json` or a frozen
primary-source locator. **Witnessed** = stated by frozen source bytes or produced by the sandboxed witness
run; **proposed** = this arm asserts it on its own authority.

## 1. Substeps and actual timings (UTC)

1. 01:53:48 — hashed all mapped inputs; all five sha256 values matched `INPUT_MAP.json` / `frozen_exact_bytes` (evidence: this arm's shell run, recorded in `sources.json` `verification_note`).
2. 01:53–01:54 — read `brief.md`, seed `draft.md`/`fixtures.json`/`sources.json`, and both raw sources; every seed-cited locator re-verified verbatim (geotransform.rst lines 15-20, 27-28, 30-32, 34-38; gdal_misc.cpp lines 1811, 2006, 2121-2202, 2182-2187, 2190-2193); bindings written to `sources.json`.
3. 01:59 — authored `witness-input.json` (8 fixtures copied verbatim from seed `fixtures.json`, 6 query points, 22 hand-derived point oracles, 8 hand determinants, metamorphic/geometry/rejection control constants, 4 wrong-control definitions) and `witness.py` (witnessed forward, hand-derived adjugate inverse, wrong variants).
4. 02:03:03 — sandbox run 1: child KeyError (`note` key iterated as a fixture); harness admitted the code (isolation enforced), my code was faulty. Fixed the loop guard.
5. 02:03:39 — sandbox run 2: control C9 correctly FAILED — my frozen constant was wrong (I had frozen the determinant 1.999999e-06 as the expected scale-relative margin instead of hand-dividing: margin = 1.999999e-06 / 1.999998000001 ≈ 1.0000005e-06). The control did its job; the input constant was corrected.
6. 02:04:18 — sandbox run 3 (final): `python3 -B /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/helpers/mechanical/sandbox.py --code .../candidate-v3/witness.py --input .../candidate-v3/witness-input.json --wall-seconds 5 --receipt .../candidate-v3/witness-receipt.json` — sandbox exit 0, child `process_exit=0`, `isolation=namespace_and_seccomp_enforced`, no truncation, elapsed 0.134 s, `code_sha256` 37db1bae9eda1ad5c35d4403ced6bdb7045ff16468e11437814de5b02c099856, `input_sha256` dde69e394982b670801220f6921ea0f94bba5e2ec007cfc33ab9d46fe49eb25f. All 9 correct controls pass, all 4 wrong controls detected (`witness-receipt.json` stdout summary `witness_scientifically_valid: true`).
7. Unknown usage: none identified; all queue/startup/read/tool time above is the arm's own accounting, no external billing observable.

## 2. Oracle selection and independence justification

No control validates a forward function by its own inverse. Independence map (all executed in `witness-receipt.json`):

| Oracle | Derivation source | Independent of |
|---|---|---|
| Fixed point fwd(0,0)=(GT0,GT3) | direct substitution, geotransform.rst lines 27-28 | inverse entirely |
| Half-pixel center identity | geotransform.rst lines 30-32; cpp lines 2138-2141, 2190-2193 | inverse entirely |
| 22 hand-derived points | algebraic substitution + adjugate arithmetic done by hand, frozen as constants | code never computes expectations at runtime |
| 8 hand determinants | hand expansion of GT1*GT5 - GT2*GT4 | forward/inverse code paths |
| Translation metamorphic (dx=17, dy=-6) | affine structure property | all point oracles |
| Half-pixel-shift corroboration | inverse of the cpp lines 2190-2193 loader shift | point oracles |
| Block geometry (dot/norm/cosine) | linear algebra classification | inverse entirely |
| Singular rejection + collisions | rank argument | inverse entirely |
| Roundtrip | used ONLY as a negative discriminator (W4) | — |

Adjugate inverse used (hand-derived, from the witnessed forward system): dp = (GT5*(X-GT0) - GT2*(Y-GT3))/det, dl = (-GT4*(X-GT0) + GT1*(Y-GT3))/det, det = GT1*GT5 - GT2*GT4 — agreed with all hand oracle points where invertible (`witness-receipt.json` C3: 22/22).

## 3. Reconciliation of seed draft claims C1–C6 and new findings M1–M8

**M1 — Coefficient order, units, origin: 0-based GT array. Disposition: accepted (witnessed, corroboration upgraded).**
Witnessed binding: geotransform.rst lines 15-20 and 27-28, read verbatim. The draft's uncertainty about a 1-based reading is now resolved with released-code evidence: gdal_misc.cpp lines 2182-2187 map world-file lines 1-6 to GT(1),GT(4),GT(2),GT(5),GT(0),GT(3) — world-file line numbers are not GT indexes. Witness: C1 fixed point 8/8, C4 determinants 8/8 (`witness-receipt.json`).

**M2 — Pixel corners vs centers, with a caller-side +0.5 duty. Disposition: accepted (the proposed duty is now corroborated by released code and witness).**
Witnessed: (0,0) is the top-left corner, center of top-left pixel is (0.5,0.5) (geotransform.rst lines 30-32); the loader itself converts center->corner by subtracting half a pixel per axis (gdal_misc.cpp lines 2190-2193). The draft had marked the caller duty "proposed"; it is corroborated twice: C2 center identity 8/8 and C6 half-pixel-shift corroboration 8/8 (`witness-receipt.json`). W1 shows conflating corner with center is detected on every tested fixture.

**M3 — Rotation/shear is the general case; north-up is special. Disposition: accepted (witnessed).**
Witnessed: GT(2)/GT(4) are first-class terms "typically zero"; north-up is the named special case (geotransform.rst lines 17, 19, 34-38). Witness C7 classified the fixtures: rotated block columns (2,-1),(1,2) orthogonal (dot=0) with equal norms — pure rotation+scale; sheared columns dot=1 — non-orthogonal shear (`witness-receipt.json`). W3: forcing GT2=GT4=0 is detected on both rotated and sheared fixtures.

**M4 — Transposition is INVISIBLE on north-up fixtures. Disposition: accepted (new; witnessed by the run).**
W2 (`witness-receipt.json`): swapping GT(2)<->GT(4) changes nothing on all three north-up fixtures (expected-invisible list confirmed) while being detected on rotated and sheared; the transposed inverse returned (2.2, 0.4) against oracle (1, 2). Proposed consequence: any review or test suite for coefficient-order bugs MUST include rotated/sheared cases; north-up-only coverage cannot detect transposition.

**M5 — Invertibility and tolerance: det condition accepted; absolute-only tolerance amended.**
The inverse exists iff det = GT1*GT5 - GT2*GT4 != 0 — witnessed by derivation from geotransform.rst lines 27-28 and by C3/C8 (`witness-receipt.json`): both degenerate fixtures produce no finite inverse, and both collisions (rank1: fwd(2,3)=fwd(5,0)=(15,25); zero-scale: all points to (10,20)) are confirmed. AMENDED relative to the draft: an absolute `abs(det) <= tol` test alone misjudges scale — geographic_degrees is healthy with |det|=1e-6 while near_singular is treacherous with |det|≈2e-6. The discriminating test is the scale-relative margin |det| / (|GT1*GT5|+|GT2*GT4|): healthy fixtures sit at O(1) (rotated: 5/5=1.0; sheared: 1.875/2.25≈0.833), near_singular at ≈1.0e-6. C9 confirms the margin. The 1e-5 threshold remains proposed; sources witness no tolerance figure.

**M6 — Independent derivation required; roundtrip-only checking is insufficient: accepted (upgraded to witnessed).**
The draft proposed this; the witness demonstrated it: the self-consistent WRONG pair (transposed forward + its own adjugate inverse) roundtrips to max error 1.1e-10 on every invertible fixture while violating the hand oracles on rotated and sheared (W4, `witness-receipt.json`). A mutually paired forward/inverse can be consistently wrong together; only oracles independent of the pair (M1's table) discriminate.

**M7 — GCP-fit trusted-operation control: unresolved.**
The draft's control (b) — GDALGCPsToGeoTransform fitting a geotransform from ground control points — has witnessed call sites (gdal_misc.cpp lines 1811, 2006), but the function body lies outside the mapped frozen corpus, so its fitting behavior is NOT witnessed here, and this arm's qualified primitive executes pure stdlib Python only (no GDAL binding; sandbox limits in `witness-receipt.json`: read-only fs, no network). External trusted-operation execution therefore remains available in principle but unevaluated in this arm.

**M8 — Witnessed-vs-proposed boundary and applicability: accepted (amended).**
Now witnessed: the six-coefficient binding and forward equations, corner/center text, north-up special case, world-file remap and half-pixel shift, GCP call-site existence, plus everything the sandbox run produced (all C/W control outcomes above). Still proposed: the 1e-5 scale-relative threshold, any production tolerance choice, and the +0.5 duty as a caller-side convention for consumers of raw integer indices (mathematically corroborated, but no API contract text was in the corpus). Applicability: six-coefficient GDAL-style affine geotransforms in any CRS; NOT applicable to polynomial or RPC georeferencing; conclusions are valid for the frozen GDAL 3.9.0 bytes and the eight fixture geotransforms (`fixtures.json`, seed sha256 0856a17ade2bddaf99d8f62e6b61cb8e72ae0329aa43a06573a561358bfb59f8).

## 4. Discrimination and integrity notes

- Discrimination: every wrong control was rejected (W1 corner-center conflation; W2 row/col swap; W3 north-up assumption; W4 roundtrip-insufficient wrong pair), each against oracles from a different independence class than the model under test (`witness-receipt.json`).
- Two earlier runs were discarded and their receipts replaced: one code KeyError, one genuine control failure caused by my mis-frozen C9 constant. The final receipt alone is the executed evidence; the earlier failures are retained in this narrative as method evidence only.
- The sandbox certifies process isolation only, never oracle truth; all scientific validity claims above rest on the frozen oracle constants and their primary-source derivations.
- Unresolved: M7 (external trusted operation); production tolerance figures (M5); no executed check exists for GDAL API consumers' index conventions beyond the +0.5 arithmetic (M8).
