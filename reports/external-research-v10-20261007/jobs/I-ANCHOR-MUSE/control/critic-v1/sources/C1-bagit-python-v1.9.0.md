# C1 evidence — bagit-python v1.9.0 pinned source, independent re-read (read, not executed)

Provenance: https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py
Retrieved: 2026-10-07T18:37:55Z (HTTP 200, text, 54632 bytes; matches predecessor S2 byte count).
Range: defaults; validate/is_valid/_validate_contents/_validate_oxum/_validate_entries; CLI flags; tagmanifest handling.

Independent observations (line numbers in fetched text):
- L128: DEFAULT_CHECKSUMS = ["sha256", "sha512"]; L131: HASH_BLOCK_SIZE = 512*1024.
- validate(processes=1, fast=False, completeness_only=False): docstring "If you supply the parameter
  fast=True the Payload-Oxum (if present) will be used ... instead of re-calculating fixities ...
  By default validate() will re-calculate fixities (fast=False)."
- _validate_contents (L778): ALWAYS calls self._validate_oxum() with comment "Perform the fast file
  count + size check so we can fail early" (L784-785); then `if fast: return`; then
  _validate_completeness(); then `if completeness_only: return`; then _validate_entries(processes).
- _validate_oxum: returns silently if no oxum; warns and uses first on multiple values; raises BagError
  on malformed value; raises BagValidationError with expected-vs-found file/byte counts on mismatch.
- _validate_entries: COLLECTS every ChecksumMismatch into `errors` (logs each as warning) and raises ONE
  BagValidationError("Bag validation failed", errors) — full per-file detail is available whenever this
  stage runs. The #177 gap is therefore precisely that an oxum failure preempts this stage.
- CLI --fast help: "only test whether the bag directory has the number of files and total size specified
  in Payload-Oxum without performing checksum validation to detect corruption." main() rejects
  --fast/--completeness-only without --validate. Success messages: fast -> "valid according to
  Payload-Oxum"; completeness-only -> "complete and valid according to Payload-Oxum"; full -> "is valid".
- _load_manifests: `if self.version_info >= (0, 97)` adds tagmanifest files to verification.
  _make_tagmanifest_file hashes every file from _find_tag_files except tagmanifest-*.txt itself, so a
  freshly generated tagmanifest covers bag-info.txt; untracked tag files added later without regenerating
  are NOT detected (cf. missing_optional_tagfiles docstring: "we can only check for entries with missing
  files (not missing entries for existing files)").
- Multiprocess path present (pool.map + pool.close + pool.join); #183 pool-completion fix is in this tag.

No code executed; no download run. Raw fetch excerpted here; raw file removed to keep evidence bounded.
