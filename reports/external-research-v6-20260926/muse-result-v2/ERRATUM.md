# Append-only A1-M diagnostic erratum

The frozen `a1-m/checks/failure.json` remains unchanged. Its `frozen_reader_expected_result` strings contain a relative `a1-m-20260928/ws/...` path; the actual reader binds an absolute workspace/path. Consequently the recorded `result_has_matching_prefix: false` does not demonstrate a wrong native path or byte count.

[The successor diagnostic](evidence/diagnostic-erratum.json) retains the original record's SHA-256, all six verbatim native result strings and the actual bound absolute paths. For each, the exact absolute completion header plus the evidenced advisory matches; equality with the bare completion sentence remains false. The old reader rejected that additional advisory with its generic path/count mismatch error.

This corrects only the explanation. A1-M remains closed **FAIL / INCOMPLETE**, with six pending payload captures, zero markers and zero acknowledgements. Its original reader, audit, failure record, timing, snapshots and usage are unchanged. New unknown result variants are reported as unrecognized rather than asserted byte/path corruption.
