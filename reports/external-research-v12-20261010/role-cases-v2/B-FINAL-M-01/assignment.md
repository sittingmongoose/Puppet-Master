# B-FINAL-M-01: Bounded curl catalog GET retries

Case ID: ER12-B-FINAL-M-01-FRESH

Role: Criticism adjudication and complete bounded finalization

## Equal arm policy and time boundary
This complete assignment and its listed corpus are identical for both arms. Fresh context; same permitted tools and effort policy. You have 900 seconds total, including saving the output. Spend at most 600 seconds investigating and reserve the final 300 seconds for writing. No delegation or communication with other arms. Read local fixture files and retrieve public primary documentation with web search/open or HTTPS retrieval; at most eight additional primary pages. Do not read other cases, campaign results, assessor files, repository canon, or old answers. Do not execute downloaded code, install software, log into services, or modify this fixture. Any local probe must be tiny, use already installed tools, and run only in the arm's root-assigned output directory. Cite source URLs plus section/version and distinguish source statements from inference. Document retrieval failures and unresolved evidence rather than inventing observations. Root supplies an arm-specific writable output directory; if absent, return the complete output in your response. Do not write in the input directory.

## Exact original obligations
O1. Write the whole section titled `Catalog GET retry policy`; scope is one read-only HTTPS GET with curl 8.10.1.
O2. Preserve exact policy tokens `request_deadline_seconds=45`, `max_attempts=4`, and `retry_scope=read_only_get`.
O3. Define transient response handling, backoff, Retry-After, and HTTP failure reporting without expanding to mutation requests.
O4. Distinguish a process-level absolute deadline from per-attempt and retry scheduling limits; no promise of strict timing from flags alone.
O5. Include cancellation, a failed-run diagnostic, and three prospective acceptance checks.
O6. State remaining implementation evidence needed; do not claim any runtime test has run.

## Complete draft section
### Catalog GET retry policy
The catalog fetcher issues one read-only HTTPS GET using curl 8.10.1. Its policy is `request_deadline_seconds=45`, `max_attempts=4`, and `retry_scope=read_only_get`. A response is delivered only when the request completes successfully. Failures retain a diagnostic containing URL host, attempt count, curl exit status and elapsed time; credentials are excluded.

For transient failure the launcher uses `--retry 4 --retry-all-errors`. This admits four total attempts and is safe for all future endpoints, including update requests. Backoff doubles from one second; a Retry-After response may influence scheduling. All unsuccessful HTTP status codes already produce curl errors without a failure option, so the launcher needs no explicit HTTP status handling.

The command adds `--max-time 45 --retry-max-time 45`. These two flags are an absolute 45-second wall-clock guarantee for the process across attempts, so no supervisor deadline is needed. Cancellation terminates the child and reports an interrupted fetch rather than an empty catalog.

Acceptance checks will simulate a transient response followed by success, exhaust retries, and cancel during a delay. The implementation is still pending and none of these checks has run. The team will collect attempt timings and exit statuses before rollout.

## Received critique
1. The retry number is additional retries rather than the entire attempt count; align it with max_attempts.
2. The absolute deadline claim overlooks an attempt already in progress and the resetting per-attempt timer.
3. Remove all mentions of cancellation because curl retry documentation does not require a product cancellation feature.
4. Always expand retry-all-errors to mutating POST endpoints to avoid inconsistent behavior across APIs.
5. HTTP failure handling needs explicit treatment; do not assume every HTTP error status yields a failure exit by default.
6. Delete Retry-After handling because curl did not support it until after 8.10.1.

## Required output
Save `final-section.md`: a complete standalone replacement section of 400–650 words satisfying every original obligation, followed by a numbered disposition for every critique item (accept, reject, or qualify with reason and primary citation). Keep the entire deliverable below 1100 words. No patch-only response, missing subsection, silent obligation deletion, or automatic acceptance of all criticism. Preserve exact tokens where required. Evidence may correct draft facts, but does not authorize changing the original product constraints. Include a short remaining-uncertainty statement. This is a bounded finalization role, not a whole-pipeline qualification.

## Navigable primary corpus

Read [corpus/index.json](corpus/index.json). Primary passages are in [S1](corpus/S1.md), [S2](corpus/S2.md). Local text is deliberately short; retrieve surrounding sections and history as needed.
