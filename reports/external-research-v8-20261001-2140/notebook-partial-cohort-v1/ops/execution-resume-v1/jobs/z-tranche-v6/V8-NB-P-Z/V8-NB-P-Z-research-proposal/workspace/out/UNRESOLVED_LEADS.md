# V8-NB-P-Z — Unresolved leads (remaining consequential dependencies/uncertainty only)

Companion to `out/PROPOSAL.md`. Each lead is consequential for the prototype's correctness; none blocks the proposal's obligations, and each carries a concrete verification step. All verifications are **UNEXECUTED** in this stage.

1. **Does the nbformat *read path* mutate identity? (highest priority)**
   Captured S3 (`nbformat/validator.py` at v5.11.1) shows the public `validate()` defaults to `repair_duplicate_cell_ids=True` (it rewrites duplicate ids), and `_normalize` fills missing ids — but I did not capture `nbformat/reader.py` / `nbformat/v4/nbjson.py`, so whether `nbformat.reads()`/`read()` invokes `validate()` (and thus repairs) at load time is **unverified**. Consequence: if it does, any capture pipeline that round-trips through nbformat would silently rewrite identifiers before comparison. The proposal already mandates plain-JSON parsing in the capture path (N1), so the prototype is safe either way; this lead affects only how strongly the mandate is worded in implementation docs.
   Verification (proposed, UNEXECUTED): load a crafted duplicate-id 4.5 notebook via `nbformat.reads(..., as_version=4)` and compare the in-memory dict to the input string; observe `DuplicateCellId` warnings.

2. **nbdime's multi-level sequence alignment internals were not captured.**
   Captured S5 pins the *predicate precedence* and `compare_cell_by_ids` at tag v4.0.4, but `nbdime/diffing/generic.py` (`diff_sequence_multilevel`) was not fetched. The prototype's two-pass matcher therefore **models the layering policy, it is not a port**; output equality with nbdime on the same fixtures is not claimed and should not be expected. If conformance with nbdime results is ever required, capture `generic.py` at v4.0.4 and design an equivalence subset; otherwise treat divergent pairings on pathological fixtures as acceptable product behavior.

3. **nbdime's comparison constants are provisional in-source.**
   The approximate threshold (0.7), strict threshold (0.95), and the <10-char auto-align are marked TODO in v4.0.4 source ("TODO: Add this to configuration framework"). The precedent in this proposal is pinned to tag v4.0.4; if the precedent is ever re-consulted at a newer nbdime, re-capture the file rather than assuming these values persisted. Our own threshold (0.5, `≥`) is a product choice tested by T2 and is independent of nbdime's values.

4. **Exact introduction version of the public `normalize()` API is only weakly pinned.**
   The nbformat 5.1.0 GitHub release body contains only "Release 5.1.0" (captured), and the `MissingIDFieldWarning` text in v5.11.1's validator says `normalize()` has been "available since nbformat 5.1.4". The proposal's version claims do not depend on this (they rest on the v5.11.1 code and the v4.4/v4.5 schemas), but if a historical changelog locator for cell-id normalization is ever required, capture PyPI release metadata or the 5.1.x-era commit history rather than the release-notes page.

5. **Diff-side dedicated unit tests for `compare_cell_by_ids` at v4.0.4 were not verified.**
   The issue→fix→test chain's test-side evidence rests on the `17caf86f` patch to `nbdime/tests/test_merge_notebooks.py` (present at v4.0.4 per the captured directory listing). The listing shows no `test_diff_notebooks.py` under that name at v4.0.4; diff-side id tests, if any, would live in `test_diff.py` or `test_notebook_diff.py`. Impact: low — the chain is complete as cited — but anyone extending the precedent study should check those two files at the same tag.
