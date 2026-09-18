# Independent v3 workflow review

Verdict: **no blocking defect found in the assigned scope; one minor smoke limitation.** Reviewed after the workflow author declared these files stable. Ran `python3 v3-smoke.py` exactly once: exit 0, all 11 checks passed. No providers, native Goals or campaigns were launched. The smoke refreshed its standard `v3-smoke-result.json`; no code or protocol was edited.

Reviewed bytes:
- `pilot_v3.py`: `933708e8b8266e263db1f0ae536c010326db556d5727615ed2fe8a4e7f9fc57f`
- `research_shared_v3.py`: `354e943a59610fc9b45c3e2f2e41db2f98797863c6743edaafb67e3d3f8a30a2`
- `v3-smoke.py`: `8a3717970d80175f652058c295f1f836b535e38390211e74226b1ba1a625c90c`

## Scoped conclusions

- **Per-ID partial delivery:** `pilot_v3.py:149–175` requires the assigned ID in its own Markdown heading and an allowed phase marker, ignores fenced examples, and does not treat prose mentions as delivery. `ready` at lines 200–208 checks the individual ID and current report hash. A timed-out review can deliver explicitly marked IDs while missing IDs stay pending; marker delivery does not prove substantive review quality. Deep-study delivery additionally requires a successful native outcome.
- **Stale downstream evidence:** fingerprints at lines 140–147 bind lead bytes and permitted upstream job/report identities. Readiness compares those fingerprints and requires current reconciliation before comparison. The smoke demonstrates that new study evidence invalidates both downstream stages and that refreshing reconciliation alone does not revive an old comparison.
- **Mixed-note retention:** lines 62–79 retain dedicated Markdown leads and aggregate discovery/study notes as separately identified unresolved intake; repeated unchanged ingestion is idempotent. Aggregate intake is excluded from recursive deep-study admission but remains eligible for review. Raw reports remain retained. New leads emitted during later review may remain pending after that campaign pass, which is visible rather than a claim of complete coverage.
- **Finished-job recovery:** lines 177–190 attach outcome-bearing jobs idempotently, retaining partial notes and preventing an older recovered attempt from replacing a newer phase pointer. Recovery depends on `outcome.json`; an interrupted native attempt without that scheduler outcome still needs manual salvage. This limitation is not covered by the finished-outcome smoke.
- **Actual helper and hash wiring:** init records `research_shared_v3.py` and base-helper protocol hashes at line 49. `make_job` validates them, copies v3 into the job as `research.py` at line 97, configures the shared-cache/base-helper paths at line 99, and captures workspace input hashes at line 118. Execution checks those inputs at lines 123–125. This is concrete wiring, not merely a v3 label. No live participant jobs were inspected.
- **Cache integrity:** `research_shared_v3.py:31–50` validates URL, raw and extracted-text digests on reuse and retains acquisition metadata; the base Store records job-local evidence. Lines 61–74 reject dirty checkouts and changed pinned commits; lines 78–85 restrict the Git ownership exception to the v3 cache subtree. These are cooperative integrity checks, not immutable storage or race-proof sandbox isolation. The smoke verifies selected corruption cases, not source quality or hostile filesystem resistance.

## Minor actionable limitation

**[P3] The “offline/no network” smoke still requires DNS.** `v3-smoke.py:92–94` mocks `original_fetch`, but `research_shared_v3.py:32` still invokes `base.public_url`; `protocol/research_base.py:35` resolves `example.com` through `socket.getaddrinfo`. Thus a disconnected/DNS-restricted environment can fail this advertised offline cache smoke without a cache defect. Either describe it as no HTTP/provider acquisition with a DNS dependency, or isolate URL validation in the smoke. This did not prevent the observed pass and is not a blocker for the reviewed pilot behavior.

No broader scheduler, production isolation, model quality, source correctness, cost, timing or campaign-completion claim follows from this bounded review.
