# S3 evidence — issue/fix/release chain: bagit-python #177 / PR #174 / v1.9.0

## Issue #177 (OPEN at retrieval)
URL: https://github.com/LibraryOfCongress/bagit-python/issues/177 — retrieved 2026-10-07T18:30:03Z.
- Title: 'Validation always defaults to "fast"'. Opened 2024-05-02 by finoradin. No assignee, no labels, no further activity on the page.
- Body: "Related to #137. It seems there is an indentation error / bug causing validation to *always* default to fast validation — meaning checksums are not being checked — only the payload oxum. I think I fixed it here? #174"

## PR #174 (CLOSED UNMERGED 2024-09-18, by the author)
URL: https://github.com/LibraryOfCongress/bagit-python/pull/174 — retrieved 2026-10-07T18:30:21Z.
- "Update bagit.py", finoradin:patch-1 -> master, 2 commits (18f4b58...), opened 2024-03-14: "Fixing validation bug - oxum validation was outside the if fast condition, so validation was *always* defaulting to fast".
- Maintainer reply: "Can you give a little more detail about the scenario you encountered? We always want to validate the payload oxum value even if we're not doing a fast validation so the code appears to be correct and a brief review of the existing tests shows at least one test which relies on slow validation."
- Reporter follow-up: "If I intentionally modified a file in a bag, and validated, it would only complain about the payload oxum, but would not report anything regarding checksum validation failure - i.e. which file failed, etc. I thought it was just stopping at the oxum check, thus not validating the checksums."
- Author closing note + close event 2024-09-18: "Ok well in that case I'll close this PR since it sounds like it should be doing 'fast' validation (checking the oxum) *and* validating the payload checksums... We can continue discussing here: #177 because it def shouldn't stop and only report the failed oxum — how is someone supposed to fix their bag if they don't know *why* it failed after all."
- Net finding: the always-fast MECHANISM claim was refuted by the maintainer (full validation does recalculate fixities; a test relies on slow validation), but the REPORTING defect stands: oxum failure is raised before per-file checksum results, masking which files are corrupt. Consistent with v1.9.0 _validate_contents ordering (see S2).

## v1.9.0 release (applicability)
URL: https://github.com/LibraryOfCongress/bagit-python/releases/tag/v1.9.0 — retrieved 2026-10-07T18:30:41Z.
- Released by acdha, "13 Jun 17:43" (page shows no year); tree v1.9.0 = 861ddac (verified signature); "16 commits to master since this release".
- Behavioral changes: #154 (allow fetch.txt with file URLs to validate), #140 (is_valid passes processes to validate), #184 (remove expandvars in unsafe path check).
- Maintenance incl. #162 (CLI tests), #183 "Wait for pool to finish in validation" (multiprocess validation completeness fix), #167 (self.path None), plus CI/packaging PRs. Full changelog v1.8.0...v1.9.0.
- Applicability to this case: v1.9.0 does NOT contain a #177 reporting fix (issue still open; PR #174 closed unmerged). Adopters get the #183 pool fix and CLI tests (#162) but must work around the oxum-masks-checksum-details behavior (e.g. run completeness+fixity reporting that continues past oxum, or validate entries directly).
