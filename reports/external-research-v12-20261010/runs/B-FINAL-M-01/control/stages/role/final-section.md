# Catalog GET retry policy

The catalog fetcher makes one read-only HTTPS GET with curl 8.10.1. It preserves `request_deadline_seconds=45`, `max_attempts=4`, and `retry_scope=read_only_get`. This policy applies only to this GET; do not carry its retry settings to POSTs, updates, or other mutations. Publish a catalog only after curl succeeds and the response passes the catalog's expected HTTP-status and schema checks. Curl options below configure transfer and retry behavior; they do not alone impose a process-wide deadline.

Configure `--retry 3`: curl's number is retries after the initial transfer, so this permits at most four attempts when each failure is retryable. Success ends earlier, and non-transient errors do not consume all attempts. In curl 8.10.1, default transient conditions include a timeout and HTTP 408, 429, 500, 502, 503, or 504 (the manual also lists FTP 4xx, which does not apply to HTTPS). The default delay is one second, then doubles after each retry up to ten minutes. Curl honors a `Retry-After` response header when present, which can change the scheduled delay. Do not start another attempt if the process deadline has expired. [Target-version `--retry` documentation](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry.md#L16-L28).

Use `--fail-with-body` so an HTTP response of 400 or greater returns curl error 22 while retaining its body; without an HTTP-failure option, a fully received 404 can otherwise exit successfully. Retry only the default transient set. On terminal failure, suppress catalog publication and report the URL host, attempt count, final HTTP code when available, curl exit status, and elapsed time; omit credentials, path, and query from the diagnostic. Curl 8.10.1 write-out fields include response code and retry count, while the supervisor should measure end-to-end elapsed time. [Target-version HTTP failure behavior](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail-with-body.md#L16-L25), [write-out fields](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/write-out.md#L125-L130).

At request start, the supervisor sets a monotonic absolute deadline 45 seconds later. `--max-time 45` caps each transfer attempt and resets when curl retries. `--retry-max-time 45` limits when curl starts retries, but an attempt already started can continue beyond that retry window. The supervisor must cancel and terminate the curl child at its own cutoff; scheduling and termination latency can overshoot, so do not promise a strict 45-second bound from curl flags alone. [Target-version `--max-time`](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/max-time.md#L17-L25), [`--retry-max-time`](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-max-time.md#L14-L21).

If the caller cancels before completion, the supervisor stops the child, records cancellation, and does not return an empty or partial catalog as success. This is application lifecycle behavior, not a curl retry guarantee.

Prospective acceptance checks:

1. Return 503, 503, 503, then 200, with `Retry-After` on one 503; verify four total attempts at most, header-aware waiting, and publication only after the successful response validates.
2. Exercise a 404 and repeated 503 responses; verify the 404 fails without a retry, repeated transient responses stop after four total attempts, and both terminal failures produce the required diagnostic without publishing a catalog.
3. Cancel during a retry delay; verify the child stops, the run is recorded as cancelled, and no empty or partial catalog is published.

No runtime test has run. Remaining evidence needed is the deployed curl 8.10.1 build and its option wiring, supervisor deadline/cancellation behavior and overshoot, diagnostic redaction, and results from these three checks.

## Critique disposition

1. **Accept.** `--retry` is a retry count after the first attempt; use three retries for up to four transfers. [curl 8.10.1 `--retry`](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry.md#L16-L20).
2. **Accept.** `--max-time` resets per transfer, and `--retry-max-time` can allow an already-started transfer to continue past its limit; enforce the process deadline in the supervisor. [curl 8.10.1 timeout options](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/max-time.md#L19-L25), [`--retry-max-time`](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-max-time.md#L16-L21).
3. **Reject.** The original obligation O5 requires cancellation behavior. Specify it as supervisor behavior; curl documentation need not define the product feature.
4. **Reject.** O2/O3 constrain retries to `read_only_get`; retrying mutations is out of scope and `--retry-all-errors` warns of duplicate-data consequences. [curl 8.10.1 `--retry-all-errors`](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-all-errors.md#L15-L20).
5. **Accept.** HTTP error responses can otherwise exit successfully; `--fail-with-body` explicitly fails for HTTP 400+ while retaining the body. [curl 8.10.1 `--fail-with-body`](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail-with-body.md#L16-L25).
6. **Reject.** The target-version retry documentation says curl honors `Retry-After`, added in 7.66.0, before curl 8.10.1. [curl 8.10.1 `--retry`](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry.md#L27-L28).
