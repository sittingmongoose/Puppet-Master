# S1 excerpts: curl command manual (current online manual)

- URL: https://curl.se/docs/manpage.html
- Retrieved: 2026-10-10T04:19:23Z via HTTPS GET (operation: single curl fetch, HTTP 200, 465220 bytes)
- Observed version: online manual as served on retrieval date; newest in-page version string seen: curl 8.22.0. All passages below were cross-checked against version-exact curl 8.10.1 sources in sources/v8101-*.md; where wording differs, the 8.10.1 text governs.
- Navigation: --retry; --retry-all-errors; --retry-max-time; --max-time; --fail; --fail-with-body

## --retry (abridged to cited sentences)

> If a transient error is returned when curl tries to perform a transfer, it retries this number of times before giving up. Setting the number to 0 makes curl do no retries (which is the default). Transient error means either: a timeout, an FTP 4xx response code or an HTTP 408, 429, 500, 502, 503, 504, 522 or 524 response code.

> When curl is about to retry a transfer, it first waits one second and then for all forthcoming retries it doubles the waiting time until it reaches 10 minutes, which then remains the set fixed delay time between the rest of the retries. By using --retry-delay you disable this exponential backoff algorithm. See also --retry-max-time to limit the total time allowed for retries.

> curl complies with the Retry-After: response header if one was present to know when to issue the next retry (added in 7.66.0).

NOTE: the 8.10.1 transient set omits 522/524 (see sources/v8101-retry.md); the deliverable uses the 8.10.1 set.

## --retry-all-errors (abridged to cited sentences)

> Retry on any error. This option is used together with --retry.

> This option is the "sledgehammer" of retrying. Do not use this option by default (for example in your curlrc), there may be unintended consequences such as sending or receiving duplicate data.

> By default curl does not return an error for transfers with an HTTP response code that indicates an HTTP error, if the transfer was successful. For example, if a server replies 404 Not Found and the reply is fully received then that is not an error. When --retry is used then curl retries on some HTTP response codes that indicate transient HTTP errors, but that does not include most 4xx response codes such as 404. If you want to retry on all response codes that indicate HTTP errors (4xx and 5xx) then combine with --fail.

Added in 7.71.0.

## --retry-max-time (abridged to cited sentences)

> The retry timer is reset before the first transfer attempt. Retries are done as usual (see --retry) as long as the timer has not reached this given limit. Notice that if the timer has not reached the limit, the request is made and while performing, it may take longer than this given time period. To limit a single request's maximum time, use --max-time.

> A transfer that has already started is allowed to run to completion even if this makes the total wall clock time exceed the limit. Use --max-time to also cap the duration of each individual transfer attempt.

NOTE: the decimal-seconds acceptance (added 8.16.0) postdates 8.10.1 and is not used.

## -m, --max-time (abridged to cited sentences)

> Set the maximum time in seconds that you allow each transfer to take.

> If you enable retrying the transfer (--retry) then the maximum time counter is reset each time the transfer is retried. You can use --retry-max-time to limit the retry time.

## --fail / --fail-with-body (abridged to cited sentences)

> By default, curl does not consider HTTP response codes to indicate failure.

> (HTTP) Return an error on server errors where the HTTP response code is 400 or greater. [...] This option allows curl to output and save that content but also to return error 22.

--fail-with-body added in 7.76.0. --fail and --fail-with-body are mutually exclusive.
