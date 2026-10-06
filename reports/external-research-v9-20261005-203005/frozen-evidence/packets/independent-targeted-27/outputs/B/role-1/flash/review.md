# Flash review — replay and invalidation claims

## Scope

This is a scoped flash review of the supplied proposal’s replay/invalidation claims, especially §§2.2, 4, 6–8, 13–14 and witness W3. It is not a full review of the product proposal or an autonomous source-discovery claim. I checked the seed proposal/catalogs, their source captures, and fresh public captures of marimo PR #10912 and issue #9881. No new code check was executed in this review.

## Findings and required edits

### F1 — `current` needs dependency-version lineage, not only a cell run generation

**Evidence [F].** marimo PR #10912 was merged to `main` on 2026-10-02 at merge commit `fc918bdcd097937ab560e2586bbdef7e9f520158`; its head is `e4525cf2a3cc348d83412300ca61e71aad285069` (PR API capture `12ce9fd745d08790373f8d0b1a40ea0231731430416a45060f89537205236eef`, capture `2a99113c2a044ed0b6ec7bebc2dc1d4a`). The changed-file patch adds per-cell run/generation tracking to marimo’s **module autoreloader and watcher**, plus tests in `tests/_runtime/reload/test_module_watcher.py` (files API capture SHA-256 `71eadccd5888bb8eec8648b65d2ef6faa217b5940876dd590f18e21c122418bc`, capture `3ec32f324b374e5c9e553fea57a5acf2`). The tests include `test_watcher_does_not_restale_cells_rerun_after_reload`, `test_watcher_marks_reader_that_ran_before_its_importer`, and `test_watcher_marks_descendants_of_a_stale_reader`. They cover both suppressing a late stale mark for an importer that reran with the new module and marking readers/descendants that still hold old values.

**Correction [I].** The proposal’s §6 definition says an output is `current` when its own code hash, input identities and environment hash match. §6 also says generation counters prevent late invalidation from re-staling a rerun cell. Those checks do not by themselves prove which upstream output/version the cell consumed. The PR’s tests demonstrate why: a downstream cell can rerun yet still read an old imported binding, or run before its importer and retain old data. Treating “ran after generation N” as sufficient could incorrectly label that result current.

**Action.** In §6, require `current` to match the exact dependency snapshot as well as the cell code, declared source identities, environment and graph version. Record the upstream output/event identities consumed by each run (including relevant generation/version tokens); if an upstream value is stale, unresolved or cannot be identified, the dependent output cannot be `current`. Add these references to the §4 sidecar/event record and §7 replay bundle. Keep the existing stale/unverified statuses and conservative invalidation behavior.

**Validation consequence.** Extend §13 V5 with controlled races: a reader reruns against an old upstream binding before its importer; an importer reruns before a late invalidation arrives; and a multi-hop descendant reruns while an intermediate output is stale. Assert that only results tied to current dependency versions can become `current`. W3 remains useful as a model check, but its 3-cell state simulation does not test this kernel/order race.

### F2 — Narrow the marimo precedent and do not imply release applicability

**Evidence [F].** The fresh PR record identifies the change as a module-watching autoreload fix, merged to `main` at the commit above. The patch and regression tests are specifically about edited Python modules, watcher timing, importers and their readers. The supplied S21 capture (`https://api.github.com/search/issues?q=repo:marimo-team/marimo+stale+in:title&per_page=10`, SHA-256 `82f775d151d93285a8dba4ffc363e7c9454747d80b2ce609d7a4f4db95e681b6`, capture `ac8fe25b4f6f4285ae74d0d2653804f2`) is a volatile search response; it reports the PR as merged but is not a release pin. No marimo release/tag applicability was established here.

**Action.** Retain the useful mechanism, but replace the broad §6 wording “Reload/edit races use generation counters” with a bounded claim: *marimo’s merged module-autoreload fix uses per-cell run/generation bookkeeping to avoid a specific late watcher stale-marking race; it is a design precedent, while this product’s code/data/environment invalidation and dependency-lineage rules still require their own validation.* Do not present #10912 as evidence that the proposed full status model is already correct or shipped in a released version. Preserve the caveat that #10915/#10602 is a separate, unresolved cross-app staleness thread; #10912 does not establish its resolution.

### F3 — Describe #9881 as a user report, not independently established runtime behavior

**Evidence [F].** The supplied S21 capture and fresh issue API capture both show #9881 open. The fresh capture is `https://api.github.com/repos/marimo-team/marimo/issues/9881`, SHA-256 `5130ee772c15a9352991cd40e0fb4a2a86c3cb5c0e2022abd4cad15513472d44`, capture `7607c5c2612642d1903588fd68f68984`, retrieved 2026-10-06. Its body gives a user’s account and reproduction sketch of a cached stale exception after reconnect; this capture contains no fix, regression test, or release-specific behavior evidence.

**Action.** Keep #9881 as a strong motivating report for distinguishing cached outputs from live outputs, but call it a *reported incident/reproduction*, not a verified marimo behavior or a resolved precedent. Retain the proposal’s open-status/uncertainty note. Do not connect #10912’s module-watcher fix to #9881; the supplied records describe different issues.

## Supported content to preserve

- The distinction among displayed cell order, actual execution events, live kernel state and saved-output provenance is necessary and supported by the brief and nbformat’s document-only schema; the status overlay remains a product choice.
- The static dependency graph and conservative descendant invalidation are a coherent proposed mechanism. marimo documents static refs/defs analysis, but also states that variable mutations are not tracked (supplied S6: `https://raw.githubusercontent.com/marimo-team/marimo/main/docs/guides/reactivity.md`, content SHA-256 `e75fd96912f666f8213c13c19c96d01f9f80d9d0c4a34dae02d14510d1be9e2f`, capture `b93bf458d9dc41328c75cc3e7262e02b`). Continue to label these as design choices and document the limits for hidden mutation or undeclared dependencies.
- The fresh PR evidence supports generation/run bookkeeping as a useful *narrow race-control technique*. Its added test cases also support the need to track dependency lineage and execution ordering, as F1 describes.
- Keep W3 labeled as an executed candidate model simulation with its stated limits; it does not establish behavior of a real notebook runtime. The marimo PR tests are source evidence, not checks executed by this candidate.

## Applicability and remaining uncertainty

The PR metadata establishes merge to `main`, and the patch establishes the changed mechanism and added tests. This flash review did not establish which marimo release first includes it, independently run the upstream tests, or verify the PR’s CI result. The issue #9881 capture establishes that the report remains open at retrieval, not that every installation exhibits it. No production implementation, race suite, or candidate execution was run here.