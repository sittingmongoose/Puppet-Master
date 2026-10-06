# ER9 exact positive archive finalizer

This standard-library Python tool materializes a separately authorized exact file list. It grants no authority to select new evidence and does not evaluate research quality. Selection preparation remains a separate responsibility: bind immutable or quiescent owned evidence to an existing positive freeze/capture receipt, retain failures, and exclude private or credential-bearing records.

Dependencies: Python 3.9+ standard library only. No package installation, network access, subprocesses, model calls, discovery scans, or Git operations.

Run:

```sh
python3 archive_positive.py --selection /absolute/selection.json --selection-sha256 EXPECTED_SHA256 --source-root /absolute/owned-source-root --archive-root /absolute/external-archive-root
```

Add `--check` to verify the exact selected inputs without writing evidence. The source root must be distinct from and not contain the archive root. The archive path contains the selection SHA-256, preserving earlier selections rather than overwriting their manifests. Existing archive files must match exact bytes. Each written file is read back and hash-verified; output files are made read-only. File count is bounded at 5,000, total selected bytes at 256 MiB, and each file at 16 MiB. Stable reads, exact SHA/length checks, path containment, symlink rejection and excluded path components fail closed. These mechanical checks are not credential detection; upstream positive selection is required.

Selection format:

```json
{"schema":"er9.exact-positive-archive-selection.v1","coverage":"PARTIAL_EXACT_SELECTED_EVIDENCE_ONLY","files":[{"path":"/absolute/owned-source-root/selected.body","sha256":"EXPECTED_FILE_SHA256","bytes":123}]}
```

Use source receipt byte length, not response-observed bytes, for truncated bodies. Preserve original failed, non-200 or incomplete responses whenever positively selected. Missing original paths remain UNKNOWN; this tool never guesses them or re-fetches sources. Raw evidence stays external to the research repository. Generated manifests contain file locators; publish only reviewed compact summaries, never raw manifests indiscriminately.

Verify the reusable boundary with `python3 -m unittest discover -s . -p test_archive_positive.py`. Six tests cover idempotence, source drift before writes, symlinks, source-root containment, file-size limits, and preserving an existing conflicting archive.

`COVERAGE.json` pins the already materialized campaign selections. Counts describe selected files per cohort, not unique content across cohorts or completed campaign coverage. Earlier incomplete archive selections and original judgments remain unchanged. No recommendation or semantic assessment is made here.
