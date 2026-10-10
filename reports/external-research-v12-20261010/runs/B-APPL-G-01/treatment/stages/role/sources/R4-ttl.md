# R4: Redis TTL (live primary, retrieved by treatment arm)

URL: https://redis.io/docs/latest/commands/ttl/
Version/scope: Live command reference at retrieval time; target deployment Redis Open Source 7.2; `since: "1.0.0"`.
Retrieval: HTTPS GET via harness web fetch, 2026-10-10 ~03:59Z (approx.; harness WebFetch, no JS executed, no code run).

## Verbatim passages relied on

"Returns the remaining time to live of a key that has a timeout."
"Starting with Redis 2.8 the return value in case of error changed:
- The command returns -2 if the key does not exist.
- The command returns -1 if the key exists but has no associated expire."

Return information: "TTL in seconds" / "-1 if the key exists but has no associated expiration" / "-2 if the key does not exist."

Use: grounds the persistent-key observable (`TTL == -1`) used in the claim 2/claim 4 analysis and in the acceptance checks.
