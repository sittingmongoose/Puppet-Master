### Catalog GET retry policy

The catalog fetcher issues one read-only HTTPS GET using curl 8.10.1. Its policy is `request_deadline_seconds=45`, `max_attempts=4`, and `retry_scope=read_only_get`. A response is delivered only when the request completes successfully. Failures retain a diagnostic containing URL host, attempt count, curl exit status, and elapsed time; credentials are excluded.

Transient handling uses `--retry`, which retries transient errors only. In curl 8.10.1 a transient error is a timeout, an FTP 4xx code, or HTTP 408, 429, 500, 502, 503, or 504. `--retry <num>` counts retries after the first attempt (0 means no retries), so `max_attempts=4` maps to `--retry 3`: one initial attempt plus three retries. Most 4xx statuses, such as 404, are not transient and are never retried by `--retry` alone.

Backoff follows curl's default exponential schedule: a one-second wait before the first retry, doubling for each further retry up to a ten-minute cap. The server's `Retry-After:` response header, honored since curl 7.66.0 and present in 8.10.1, overrides the computed delay for the next retry. `--retry-delay` would disable the exponential algorithm and is not set, so backoff stays automatic and server-influenced.

HTTP failure reporting is explicit because curl's default is lenient: a fully received error page such as 404 Not Found still exits 0. The launcher therefore passes `--fail-with-body`, which returns curl error 22 for HTTP 400 and above while still saving the response body for diagnostics. Combined with `--retry`, failure semantics extend retries to HTTP error statuses; without this option the draft's claim that every unsuccessful status already fails is wrong. `--retry-all-errors` is deliberately not used: it is the documented "sledgehammer" that retries any error with duplicate-data risk, and `retry_scope=read_only_get` forbids extending all-error retries to mutating requests.

Deadlines come in three distinct layers. `--max-time 45` caps each transfer attempt, but its counter resets on every retry. `--retry-max-time 45` bounds the retry schedule, yet an attempt already in progress is allowed to run past the limit. Neither flag, alone or combined, guarantees a 45-second absolute wall-clock bound, so the supervisor enforces `request_deadline_seconds=45` as the process-level absolute deadline, terminating and reaping the child at expiry. No strict timing is promised from curl flags alone.

Cancellation terminates the curl child and reports an interrupted fetch rather than an empty catalog; partial output is discarded and the diagnostic records cancellation with the attempts made and elapsed time.

Acceptance checks are prospective and none has run: (1) a transient 503 followed by success completes within four attempts with backoff observed; (2) a persistent 500 exhausts all four attempts, returns error 22, and records host, attempt count, exit status, and elapsed time; (3) cancellation during a retry delay stops the child promptly and reports an interrupted fetch. The implementation is still pending; the team will collect attempt timings and exit statuses before rollout. Remaining evidence needed: measured timings, exit statuses, `Retry-After` override behavior against a stub server, and supervisor kill latency at the 45-second deadline.

## Critique dispositions

1. Accept. `--retry <num>` counts retries after the initial attempt ("retries this number of times before giving up"; 0 means no retries), so the draft's `--retry 4` allows five attempts, not four. Fixed with `--retry 3` for `max_attempts=4`. (curl 8.10.1 `docs/cmdline-opts/retry.md`; manual §`--retry`.)
2. Accept. `--max-time` is per transfer and "the maximum time counter is reset each time the transfer is retried", while `--retry-max-time` only gates new attempts: an in-progress request "may take longer than this given time period". The flags alone give no absolute wall-clock guarantee, so a supervisor deadline enforces `request_deadline_seconds=45`. (curl 8.10.1 `max-time.md`, `retry-max-time.md`.)
3. Reject. Cancellation is an original product obligation (O5), and product constraints stand unless the product changes them: the curl manual neither requires nor forbids a product cancellation feature, so its silence cannot delete one. Cancellation is retained as specified.
4. Reject. `--retry-all-errors` is the documented "sledgehammer" with "unintended consequences such as sending or receiving duplicate data", and `retry_scope=read_only_get` plus O3 confine retries to the read-only GET. Expanding all-error retries to mutating POST endpoints is unsafe and out of scope. (curl 8.10.1 `retry-all-errors.md`.)
5. Accept. By default "curl does not consider HTTP response codes to indicate failure": a fully received 404 "is not an error" and exits 0. The draft's no-handling claim was wrong; the section now uses `--fail-with-body` (added 7.76.0) so HTTP 400+ returns error 22 with the body saved. (curl 8.10.1 `fail.md`, `fail-with-body.md`.)
6. Reject. `Retry-After:` compliance for `--retry` was "added in 7.66.0" and is present verbatim in the 8.10.1 manual source, so the claim that support arrived after 8.10.1 is factually wrong. Server-influenced scheduling is retained. (curl 8.10.1 `retry.md`.)

## Remaining uncertainty

Retry counts, backoff, `Retry-After`, failure default, and both timer behaviors are verified against version-exact 8.10.1 primary sources. Still unmeasured: stub-server `Retry-After` override timing, attempt timing distributions, and supervisor kill latency at the deadline. No runtime test has run.
