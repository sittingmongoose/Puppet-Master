# C5 evidence — bagit-python issue #177 / PR #174 / v1.9.0, independent API re-check

Provenance (all api.github.com, HTTP 200, retrieved 2026-10-07T18:39:03–04Z; raw JSON kept: C5-issue177.json,
C5-pr174.json, C5-release190.json):
- https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177
- https://api.github.com/repos/LibraryOfCongress/bagit-python/pulls/174
- https://api.github.com/repos/LibraryOfCongress/bagit-python/releases/tags/v1.9.0
- https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/174/comments (6 comments)

Independent observations:
- Issue #177: state=OPEN, created 2024-05-02T16:46:00Z, title 'Validation always defaults to "fast"',
  comments=0 (no activity beyond the body; the discussion lives on #174). Still open at critic retrieval.
- PR #174: state=CLOSED, merged=false (merged_at null), created 2024-03-14T19:25:28Z, closed
  2024-09-18T22:59:32Z. NOT a fix to adopt — matches predecessor S3.
- Maintainer refutation verified in #174 comments (acdha): "We always want to validate the payload oxum
  value even if we're not doing a fast validation so the code appears to be correct and a brief review of
  the existing tests shows at least [one test relying on slow validation]" — the always-fast MECHANISM
  claim is refuted; the REPORTING defect stands (reporter: validation "would only complain about the
  payload oxum, but would not report anything regarding checksum validation failure - i.e. which file
  failed"). Author closed the PR as the wrong change. Consistent with C1 _validate_contents ordering.
- v1.9.0: tag v1.9.0, published 2025-06-13T17:43:22Z, created 2025-06-13T17:42:48Z. RESOLVES draft U2
  (release year is 2025). "What's Changed" confirms behavioral #154 (fetch.txt file URLs validate), #140
  (is_valid passes processes), #184 (remove expandvars in unsafe path check); maintenance #162 (CLI tests),
  #183 ("Wait for pool to finish in validation"), #167 (self.path None), plus CI/packaging. No #177
  reporting fix in this release — the draft's applicability judgment (adopt for pool/CLI fixes, wrap
  validation for per-file detail) stands.
