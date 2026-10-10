# Bounded primary-source evidence

Retrieval window: 2026-10-10 04:18:36–04:19:40 UTC; web search and direct HTTPS page opens through the web tool. The versioned option pages below are from the official curl/curl repository tag `curl-8_10_1`, matching the requested CLI. Excerpts are short; notes are paraphrases.

## P1 — `--retry`
URL: https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry.md
Locator: `--retry`, lines 16–28. Applicability: curl 8.10.1; GET transient errors, retry count, default backoff and Retry-After.
Excerpt: “retries this number of times before giving up” and “Retry-After: response header” (curl docs also record it as added in 7.66.0).
Note: The target version's default HTTP retry list is 408, 429, 500, 502, 503, 504; timeout also qualifies. Its default wait starts at one second and doubles up to ten minutes.

## P2 — `--retry-all-errors`
URL: https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-all-errors.md
Locator: `--retry-all-errors`, lines 15–20 and 30–36. Applicability: extra retry scope and HTTP error handling.
Excerpt: “there may be unintended consequences such as sending or receiving duplicate data.”
Note: Target docs caution against using this broadly; HTTP statuses are not generally curl errors without `--fail`-family handling.

## P3 — `--retry-max-time`
URL: https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-max-time.md
Locator: `--retry-max-time`, lines 16–21. Applicability: retry-window gate, not a process cutoff.
Excerpt: “it may take longer than this given time period.”

## P4 — `--max-time`
URL: https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/max-time.md
Locator: `--max-time`, lines 17–25. Applicability: per-transfer timer and its reset on retry.
Excerpt: “maximum time in seconds that you allow each transfer to take.”

## P5 — `--fail-with-body`
URL: https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail-with-body.md
Locator: `--fail-with-body`, lines 16–25. Applicability: HTTP 400+ reporting while preserving response body.
Excerpt: “response code is 400 or greater” and “return error 22.”

## P6 — `--write-out`
URL: https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/write-out.md
Locator: `num_retries` lines 125–130; `response_code` lines 154–156; `time_total` lines 222–224. Applicability: final transfer metadata; supervisor still measures whole process elapsed time.
Excerpt: “Number of retries actually performed.”

## Local corpus locator context
- S1: https://curl.se/docs/manpage.html; the supplied snapshot observed online manual 8.23.0. Its navigation helped locate options, but its newer semantics were checked against the 8.10.1 tag above.
- S2: https://curl.se/docs/optionsall.html; the supplied introduction table identifies option-introduction versions, but introduction dates alone do not prove later semantic details.
