# Independent curl 8.10.1 primary evidence

All files were retrieved independently over HTTPS. Static code inspection is not runtime validation.

## P1 — retry.md

[Captured bytes](retry.md) · [Official target-tag source](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry.md)

Retrieved: 2026-10-10T04:29:20.289091+00:00 · SHA-256: `d164104079fbac52eefc1147bfb1eb152bfbb1d883e6c0f963df25a4e7a505e2`

Target CLI tag 8.10.1; retries are additional to initial transfer; HTTP list is 408/429/500/502/503/504, timeout; FTP is outside this HTTPS assignment. Default backoff can be overridden by retry-delay. Retry-After predates target.

- [retry count and transient criteria — lines 18–22](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry.md#L18-L22)
- [default backoff, retry-delay override — lines 24–28](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry.md#L24-L28)
- [Retry-After and introduction in 7.66.0 — lines 30–31](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry.md#L30-L31)

## P2 — retry-all-errors.md

[Captured bytes](retry-all-errors.md) · [Official target-tag source](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-all-errors.md)

Retrieved: 2026-10-10T04:29:20.334508+00:00 · SHA-256: `a98f60938760f9d35232b3da2f7b45da4aa239411a142a52e5e8dccf6a5fb916`

Only with retry; broad errors risk duplicate data, especially redirected input/output; ordinary successful HTTP transport is not equivalent to acceptable HTTP status. Candidate excludes this option and all mutations.

- [explicit all-error expansion, duplicate data warning and external scheduling alternative — lines 17–23](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-all-errors.md#L17-L23)
- [redirected input/output exception — lines 25–32](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-all-errors.md#L25-L32)
- [HTTP status is not an error by default; 404 not default transient — lines 34–40](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-all-errors.md#L34-L40)

## P3 — max-time.md

[Captured bytes](max-time.md) · [Official target-tag source](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/max-time.md)

Retrieved: 2026-10-10T04:29:20.366252+00:00 · SHA-256: `36ffc3a4f0b6615359c480f9bc1bb5e5f22d5a59cfbcd6439e0a363d4b8b948b`

Seconds, each transfer; resets on retries. Not elapsed lifetime of supervisor or process.

- [seconds per transfer, resetting timer — lines 21–27](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/max-time.md#L21-L27)

## P4 — retry-max-time.md

[Captured bytes](retry-max-time.md) · [Official target-tag source](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-max-time.md)

Retrieved: 2026-10-10T04:29:20.401846+00:00 · SHA-256: `9505140824bf47fe04d4c8b929c16b3371e02399301c153b9f1071718ae53f33`

Seconds for retry eligibility; not cancellation of an already-started transfer. Zero means no retry timeout. Candidate separately requires supervisor cutoff.

- [retry scheduling window, active transfer overrun, zero disables limit — lines 18–23](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/retry-max-time.md#L18-L23)

## P5 — fail-with-body.md

[Captured bytes](fail-with-body.md) · [Official target-tag source](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail-with-body.md)

Retrieved: 2026-10-10T04:29:20.432599+00:00 · SHA-256: `76754bbc3cf336c31e5826642bb18f8cba261f6878378a1c72e33b4172d09488`

Completed HTTP response 400 or above yields error 22 while retaining body; pre-existing transport/output errors may retain their own code. Retained body must not be published as successful catalog.

- [HTTP 400+ error 22 with retained body; fail alternative — lines 20–27](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail-with-body.md#L20-L27)

## P6 — write-out.md

[Captured bytes](write-out.md) · [Official target-tag source](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/write-out.md)

Retrieved: 2026-10-10T04:29:20.468807+00:00 · SHA-256: `a4d0d66f6aab752518bd805e3bb8a74e4794e10c39813af81a62ec49fff2c6ef`

Metadata after transfer, independent of success; num_retries exists since 8.9.0 and is available in 8.10.1. Supervisor cancellation may preclude normal write-out, so supervisor instrumentation remains needed.

- [num_retries added 8.9.0 — lines 138–140](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/write-out.md#L138-L140)
- [response_code — lines 170–172](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/write-out.md#L170-L172)
- [time_total — lines 244–245](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/write-out.md#L244-L245)
- [completed-transfer output semantics and output failures — lines 20–49](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/write-out.md#L20-L49)

## P7 — tool_operate.c

[Captured bytes](tool_operate.c) · [Official target-tag source](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c)

Retrieved: 2026-10-10T04:29:20.568229+00:00 · SHA-256: `c93873c49643fbb87211aa0d6c50ab8799a170d3287854c1f0f5a66fdc9af1b2`

Static target-tag implementation evidence, not an executed test or deployment. Default retries also cover host/proxy resolution failures; connection refusal requires opt-in. Retry-After is evaluated for selected transient HTTP responses, takes the longer of existing/header delay, and may stop retries if beyond retry-max-time.

- [preserve pre-existing transfer error; post-process fail-with-body — lines 482–503](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L482-L503)
- [retry window, DNS/timeout defaults, opt-in connection refusal and HTTP statuses — lines 539–593](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L539-L593)
- [Retry-After uses greater delay and can suppress retry past window — lines 617–654](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L617-L654)
- [decrement remaining retries and cap exponential delay — lines 664–670](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L664-L670)
- [retry accounting — lines 703–705](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L703-L705)

## P8 — fail.md

[Captured bytes](fail.md) · [Official target-tag source](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail.md)

Retrieved: 2026-10-10T04:30:17.641281+00:00 · SHA-256: `1c6ea656161a83257ad346aab0bb6e38d476e7a2785656aa3a24df501fcd0966`

Useful alternative if body retention is unwanted; mutually exclusive with fail-with-body. Its authentication caveat cannot be blindly attributed to the distinct CLI post-processing implementation of fail-with-body.

- [fail without body, default HTTP behavior and authentication caveat — lines 21–35](https://github.com/curl/curl/blob/curl-8_10_1/docs/cmdline-opts/fail.md#L21-L35)

