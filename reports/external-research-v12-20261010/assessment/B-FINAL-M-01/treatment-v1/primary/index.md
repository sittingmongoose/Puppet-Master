# Independently retrieved primary evidence

All retrievals were HTTPS GETs on 2026-10-10 UTC. Exact response bytes and SHA-256 values are in [retrievals.json](../retrievals.json). Data was read, never executed.

The target is curl 8.10.1. Live manual content describes 8.23.0 and is used only for context.

- **P1**: [retry.md](retry.md) — [primary URL](https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/cmdline-opts/retry.md), curl-8_10_1 tag; HTTP 200; 1088 bytes; SHA-256 `d164104079fbac52eefc1147bfb1eb152bfbb1d883e6c0f963df25a4e7a505e2`.
- **P2**: [retry-all-errors.md](retry-all-errors.md) — [primary URL](https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/cmdline-opts/retry-all-errors.md), curl-8_10_1 tag; HTTP 200; 1763 bytes; SHA-256 `a98f60938760f9d35232b3da2f7b45da4aa239411a142a52e5e8dccf6a5fb916`.
- **P3**: [fail-with-body.md](fail-with-body.md) — [primary URL](https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/cmdline-opts/fail-with-body.md), curl-8_10_1 tag; HTTP 200; 771 bytes; SHA-256 `76754bbc3cf336c31e5826642bb18f8cba261f6878378a1c72e33b4172d09488`.
- **P4**: [fail.md](fail.md) — [primary URL](https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/cmdline-opts/fail.md), curl-8_10_1 tag; HTTP 200; 1082 bytes; SHA-256 `1c6ea656161a83257ad346aab0bb6e38d476e7a2785656aa3a24df501fcd0966`.
- **P5**: [max-time.md](max-time.md) — [primary URL](https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/cmdline-opts/max-time.md), curl-8_10_1 tag; HTTP 200; 884 bytes; SHA-256 `36ffc3a4f0b6615359c480f9bc1bb5e5f22d5a59cfbcd6439e0a363d4b8b948b`.
- **P6**: [retry-max-time.md](retry-max-time.md) — [primary URL](https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/cmdline-opts/retry-max-time.md), curl-8_10_1 tag; HTTP 200; 715 bytes; SHA-256 `9505140824bf47fe04d4c8b929c16b3371e02399301c153b9f1071718ae53f33`.
- **P7**: [tool_operate.c](tool_operate.c) — [primary URL](https://raw.githubusercontent.com/curl/curl/curl-8_10_1/src/tool_operate.c), curl-8_10_1 tag; HTTP 200; 107334 bytes; SHA-256 `c93873c49643fbb87211aa0d6c50ab8799a170d3287854c1f0f5a66fdc9af1b2`.
- **P8**: [CURLINFO_RETRY_AFTER.md](CURLINFO_RETRY_AFTER.md) — [primary URL](https://raw.githubusercontent.com/curl/curl/curl-8_10_1/docs/libcurl/opts/CURLINFO_RETRY_AFTER.md), curl-8_10_1 tag; HTTP 200; 1529 bytes; SHA-256 `9bbdcddb7a55af12d2d2d49e97201ab2e08ef0a9546d7ac437d24f9f8647e363`.
- **S1-live**: [manpage.html](manpage.html) — [primary URL](https://curl.se/docs/manpage.html), live; not target-version authority; HTTP 200; 465220 bytes; SHA-256 `0ef77bad12997946fd2663bb2222b4201ab5cf3b2d724595cb099ca2ef58283d`.
- **S2-live**: [optionsall.html](optionsall.html) — [primary URL](https://curl.se/docs/optionsall.html), live; not target-version authority; HTTP 200; 37181 bytes; SHA-256 `93039371c310ab7f52be750004b3a2a5aeaa0a04973d93c15204d2cbc02968d1`.

## Material-finding navigation

- F1: [8.10.1 scheduling implementation lines 634–655](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L634-L655), [saved source](tool_operate.c), plus [Retry-After units/parser documentation](CURLINFO_RETRY_AFTER.md).
- F2: [8.10.1 failure reporting lines 491–501](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L491-L501) and [retry classification lines 568–620](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L568-L620), [saved source](tool_operate.c).

GitHub blob line numbers refer to the original saved bytes. The web text extractor removes some blank lines; its displayed line numbers are not used as GitHub locators.
