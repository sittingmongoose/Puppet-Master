# R3: Redis HSET (live primary, retrieved by treatment arm)

URL: https://redis.io/docs/latest/commands/hset/
Version/scope: Live command reference at retrieval time; target deployment Redis Open Source 7.2; `since: "2.0.0"`.
Retrieval: HTTPS GET via harness web fetch, 2026-10-10 ~03:59Z (approx.; harness WebFetch, no JS executed, no code run).

## Verbatim passages relied on

"Sets the specified fields to their respective values in the hash stored at key. This command overwrites the values of specified fields that exist in the hash. If key doesn't exist, a new key holding a hash is created."

Return: "the number of fields that were added."

Note: the HSET page itself makes no statement about time to live. The TTL-preserving behavior of HSET is sourced from the EXPIRE page (R1), which names HSET explicitly among operations that leave the timeout untouched. Page content on field-level expiration features of later Redis versions was not retrieved; applicability of any such feature to 7.2 is unresolved in this arm.
