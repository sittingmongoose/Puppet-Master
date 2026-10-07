# R2 evidence — bagit-python v1.9.0 release record + issue #177 state (GitHub API)

Provenance (all api.github.com, HTTP 200, retrieved 2026-10-07T18:45:32Z):
- https://api.github.com/repos/LibraryOfCongress/bagit-python/releases/tags/v1.9.0 (4260 bytes; matches C5)
- https://api.github.com/repos/LibraryOfCongress/bagit-python/issues/177 (3149 bytes; matches C5)

Independent observations:
- v1.9.0: tag_name "v1.9.0", published_at 2025-06-13T17:43:22Z, created_at 2025-06-13T17:42:48Z.
  Resolves predecessor U2 (release year is 2025).
- "What's Changed" behavioral: pull/154 (fetch.txt with file URLs validate), pull/140
  (is_valid passes processes to validate), pull/184 (remove expandvars in unsafe path check).
- "What's Changed" maintenance: pull/162 (CLI tests), pull/183 ("Wait for pool to finish in
  validation"), pull/167 (self.path None), plus CI/packaging PRs. Full changelog v1.8.0...v1.9.0.
- Release body contains no reference to issue 177: no #177 reporting fix in v1.9.0.
- Issue #177: state "open", created_at 2024-05-02T16:46:00Z, title
  'Validation always defaults to "fast"'. Still open at reviser retrieval.
- Applicability judgment (unchanged): adopt v1.9.0+ for the #183 pool-completion fix and #162
  CLI tests, but wrap validation so per-file fixity detail is captured even when oxum fails.

Raw JSON verified and discarded (bounded); full JSON retained in critic evidence
(C5-release190.json, C5-issue177.json).
