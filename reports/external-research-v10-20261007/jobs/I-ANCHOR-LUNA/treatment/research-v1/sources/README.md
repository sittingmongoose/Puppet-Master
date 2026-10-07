# Source evidence

manifest.json maps source IDs used by ../draft.md to exact public URLs or authorized local input paths, version/commit identity, observed retrieval window, locator, and limits. Each Sxx.md contains a small excerpt or precise locator rather than a full page. evidence_sha256 is SHA-256 of that local note, computed with Python hashlib; S00 also hashes the original input files mechanically.

Documentation pages using /stable/ or an unversioned official URL are labeled as rolling rather than passed off as patch-pinned. Candidate behavior claims are scoped to the exact version or commit stated on each note.
