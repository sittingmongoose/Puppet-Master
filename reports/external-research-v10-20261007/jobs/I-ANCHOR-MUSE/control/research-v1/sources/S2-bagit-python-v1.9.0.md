# S2 evidence — bagit-python v1.9.0 pinned source behavior (read, not executed)

Provenance: https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py — tag v1.9.0 (commit 861ddac per release page). Retrieved 2026-10-07T18:30:03Z (HTTP 200, text/plain, 54632 bytes).

Observed behavior (function : lines in fetched text):

- Defaults: DEFAULT_CHECKSUMS = ["sha256", "sha512"]; HASH_BLOCK_SIZE = 512*1024 for streaming file hashing.
- Bag.validate(processes=1, fast=False, completeness_only=False): validates structure, bagit.txt, fetch URLs (validate_fetch: each URL must have scheme+netloc, or file: scheme), then _validate_contents. Docstring: fast=True uses Payload-Oxum instead of re-calculating fixities; default re-calculates fixities.
- Bag.is_valid(...): same parameters, returns bool, swallows BagError.
- _validate_contents: (1) if fast and no oxum -> raise; (2) ALWAYS runs _validate_oxum() ("fail early"); (3) if fast: return (skips completeness + checksum recalculation); (4) _validate_completeness(); (5) if completeness_only: return; (6) _validate_entries(processes) — the actual per-file checksum recomputation.
- _validate_oxum: parses "bytes.files" from Payload-Oxum; raises BagError on malformed value; warns (not error) on multiple oxum values, uses first. Consequence: a failed/stale oxum raises BEFORE per-file checksum errors are computed, so the caller learns count/size mismatch but not WHICH files failed fixity (this is the #177 reporting complaint; see S3).
- CLI: --validate validates instead of creating; --fast "only test whether the bag directory has the number of files and total size specified in Payload-Oxum without performing checksum validation to detect corruption"; --completeness-only similar; main() rejects --fast/--completeness-only without --validate; on success logs "valid according to Payload-Oxum" (fast) vs "is valid" (full).
- _load_manifests: for version >= 0.97, tag manifests are also verified (tag files covered, not just payload).

No execution was performed; no code was downloaded to run. All claims above come from reading this pinned text.
