# D-M02-A finalization record

**Continuity.** Finalization used the same author context and native Goal 01a11824-c7fb-7ca2-9eda-c309609bd5e0. The active Goal was reread before terminalization. Batch scope remained within the six obligations and 1100-word ceiling.

**Shared-condition map checked.** Candidate use first requires a storable response for the matching URI/method and correct cache identity. Then the request must match that stored response’s Vary selectors, or the cache must forward and successfully revalidate. Only after those gates does freshness, successful validation, or expressly permitted stale service authorize reuse; response no-cache, no-store, must-revalidate and applicable shared-cache restrictions still govern. A 304 updates only candidates eligible for the validation request and selected by validators; its updated Vary and Cache-Control metadata feed back through the same selector and reuse gates for later requests. This keeps the language-variant question, Authorization boundary, freshness and 304 handling consistent.

**Identity check.** batch-v3/report.md and finalize-v3/final.md were compared byte-for-byte; cmp exited 0. Both have SHA-256 67e25be679befc92218c56be83af552f90920d91e8f0d0f5c805dc010642f9be and 958 words. The accepted, amended, rejected and unresolved dispositions remain visible.

**Evidence status.** The two supplied RFC hashes match sources.json. Only source inspection and hash verification were executed. Boundary fixtures are proposals; no cache implementation or downloaded code was run.
