# R4 evidence — bagit-python v1.9.0 pinned source, reviser independent re-read (read, not executed)

Provenance: https://raw.githubusercontent.com/LibraryOfCongress/bagit-python/v1.9.0/bagit.py
Retrieved: 2026-10-07T18:45:28Z (HTTP 200, text, 54632 bytes; matches S2/C1 byte counts).
Range: defaults; validate/is_valid/_validate_contents/_validate_oxum/_validate_entries; CLI flags;
tagmanifest handling.

Independent observations:
- DEFAULT_CHECKSUMS = ["sha256", "sha512"] (L128); HASH_BLOCK_SIZE = 512*1024.
- validate(processes=1, fast=False, completeness_only=False): docstring "If you supply the parameter
  fast=True the Payload-Oxum (if present) will be used ... instead of re-calculating fixities ...
  By default validate() will re-calculate fixities (fast=False)."
- _validate_contents: ALWAYS calls self._validate_oxum() with comment "Perform the fast file
  count + size check so we can fail early"; then `if fast: return`; then _validate_completeness();
  then `if completeness_only: return`; then _validate_entries(processes).
- _validate_entries: COLLECTS every ChecksumMismatch into `errors` and raises ONE
  BagValidationError("Bag validation failed", errors) — full per-file detail whenever this stage
  runs. An oxum failure preempts this stage (the #177 reporting gap).
- CLI --fast help: "only test whether the bag directory has the number of files and total size
  specified in Payload-Oxum without performing checksum validation to detect corruption." main()
  rejects --fast/--completeness-only without --validate. Success: fast -> "valid according to
  Payload-Oxum"; full -> "is valid".
- _load_manifests: `if self.version_info >= (0, 97)` adds tagmanifest files to verification.
  missing_optional_tagfiles docstring: "we can only check for entries with missing files (not
  missing entries for existing files)" — untracked NEW tag files are invisible to validation;
  tagmanifest must be regenerated after every authorized tag change.
- Multiprocess path present (pool.map + pool.close + pool.join); #183 pool-completion fix is in tag.

No code executed; no download run. Raw file kept only in /tmp, not in evidence (bounded).
