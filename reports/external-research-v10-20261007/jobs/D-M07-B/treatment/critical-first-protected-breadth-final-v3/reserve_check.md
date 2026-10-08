# D-M07-B v3 — protected reserve (SECOND phase): explicit lower-risk check + breadth check

Written 2026-10-07T23:35:53Z, after critical_check.md (23:30:15Z) and before final.md. Per assignment: critical first, protected explicit lower-risk/breadth reserve second, never top-k delete remaining leads. Sources: the six INPUT_MAP-listed paths only; corpus identity as pinned in source_log.md (projdoc sha256 261a0a3602984e91ed13179990c535bf19a4e841302554ee4fad25b77e4ade51; projcode sha256 f5f8a43cb7030e5d0462121a54414be74504586dbb1d32d4c37857f1de9dabda; pyproj 3.6.1, captured 2026-10-07). No network fetches (limitation recorded).

## Explicit lower-risk check (protected; cheap, confirmatory, corpus-only)

Claim under test: the draft's remaining citation set (P2, P5, P6, P7, P8 specifics) and its proposed remedy text hold against the corpus, so the recommendation's support does not rest on the critical items alone.
- Actually-executed, corpus lines: (a) always_xy remedy text verified directly — from_crs L583–586: accepts/returns "traditional GIS order, that is longitude, latitude for geographic CRS and easting, northing for most projected CRS"; the same wording at L525–528 for from_proj. (b) P5 mechanisms — area_of_use L397–406; TransformerGroup sorting quote L146–154; unavailable_operations L231–237. (c) P6 — itransform 64-point buffer L971–974; switch L883–885; time_3rd L886–887 + L962–963; ValueError empty L953–956; stride 2–4 L958–960; transform() accepts arrays L736–747; TransformerLocal per-thread L300–310/L336; group transformers not thread-safe L143–144; TransformerUnsafe "not thread-safe" L57–64. (d) P7 — force_over PROJ 9+ L605–606; only_best PROJ 9.2+ L617–618; get_last_used_operation PROJ 9.1+ L444–448; is_network_enabled L461–471; download_grids L246–290. (e) P8 — module-level transform()/itransform() emit FutureWarning L1247–1255/L1328–1336; deprecated since 2.6.1 (L1210–1212, L1274–1276).
- Also executed: from_crs input flexibility (CRS.from_user_input applied to both CRS args, L627–629) — string "EPSG:4326" inputs are documented behavior, and the docstring identity example from_crs("EPSG:4326", 4326).transform(33, 98) → "33 98" (L812–815) shows mixed string/int CRS input is accepted.
- Result: every remaining draft citation checks out against the pinned bytes; none failed. Lower-risk reserve consumed as designed; it found no invalidating surprise.

## Explicit breadth check (all six brief obligations swept, not just the critical item)

- Actually-executed: full-corpus read (projdoc 47 lines, projcode 1339 lines) mapped against the six obligations: 1 order/unit — C1/C2 covered; 2 applicability + error handling — C3/C7 covered; 3 boundary behavior — C4 covered (unverified, probe proposed); 4 supported validation — P8 covered (FutureWarning, from_crs/errcheck/area_of_use all documented interfaces); 5 optional batch, assessed separately — P6 covered, no performance claim made; 6 environmental dependency — C5 kept visible. No obligation is uncovered; none was silently narrowed.
- New breadth findings the draft missed (all corpus-grounded, actually-executed line checks):
  1. allow_ballpark exists on both from_crs (L560, L601–603, default None → allowed) and TransformerGroup (L164, default True; docstring L198–200) — a documented, supported way to disallow ballpark transformations, which directly addresses the C7 ballpark-fallback risk. Candidate amendment to the recommendation: set allow_ballpark=False when out-of-region use must not silently degrade.
  2. TransformerGroup.best_available (L239–244) — documented signal for "the best possible transformer is available", i.e., a runtime check for the missing-grid/availability concern behind C7.
  3. authority parameter (L587–597) — restrict candidate operations to a namespace (e.g., EPSG) for reproducible operation selection.
  4. transform_bounds (L990–1070, versionadded 3.1.0) — supported densified boundary transformation with an antimeridian split rule (L1009–1013); a documented tool for obligation-3 boundary work on regions rather than points. Draft proposed no region-boundary tool.
  5. accuracy (L389–394, −1 when unknown), has_inverse (L383–387), operations (L432–442) — cheap runtime introspection to record which operation ran and its quality, complementing get_last_used_operation.
  6. direction (FORWARD default; L767–769) and inplace (3.2.0; L770–773) — round-trip validation and buffer-reuse options for the batch path.
- Breadth verdict: the recommendation is DIRECTIONALLY SOUND but INCOMPLETE — it omits the corpus-documented controls (allow_ballpark, best_available, authority, transform_bounds, accuracy/operations introspection) that would make its own C7/P5 concerns manageable. These enter final.md as amendments, attributed to the corpus, with the draft's P1–P8 retained as the base.

## Remaining-leads ledger (complete carry-forward; nothing deleted)

All leads from critical_check.md are restated and remain open; breadth added three. Enumerated in full:
1. Runtime pole/near-pole probe: transform(0, y), y = 85, 89.9, 89.999, 90 — record value/inf/exception (C4; unverified).
2. Runtime swapped-coordinate probe on the target environment (C4; unverified).
3. Startup environment log: proj_version_str + data directory before using gated options (C5; unverified — PROJ 9.3.0 remains a brief assumption).
4. area_of_use extraction for the selected EPSG:4326→3857 transformer; treat out-of-region output as suspect (C7; corpus-silent on the polygon).
5. allow_ballpark=False / best_available / authority evaluation at runtime (NEW, from breadth finding 1–3).
6. Batch decision: 10k-point timing comparison itransform vs array transform, plus switch/time_3rd contract check and errcheck on the bulk path (P6; unmeasured).
7. Swap-detection placement design choice: import path vs upstream UI (P8; corpus does not settle).
8. Deprecated module-function removal timeline: none stated in corpus; revisit in later pyproj releases (P8).
9. Region boundary handling via transform_bounds incl. antimeridian rule, if the import ever covers extents rather than points (NEW).
10. Round-trip (direction=INVERSE) sanity validation and inplace buffer reuse for high-volume paths (NEW).

No lead was top-k deleted by either the critical pass or this reserve; the ledger only grew.

## Proposed-vs-executed summary for this phase

Actually executed: corpus line verifications (a)–(e) above; full-corpus breadth mapping to the six obligations; identification of the six new corpus findings. Proposed and NOT executed: every runtime probe in the ledger (1–10 involve the target environment or timing; the brief forbids executing project code here). Off-policy exposure: none.
