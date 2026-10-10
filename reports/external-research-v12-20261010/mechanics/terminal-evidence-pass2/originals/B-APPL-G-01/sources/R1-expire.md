# R1: Redis EXPIRE (live primary, retrieved by treatment arm)

URL: https://redis.io/docs/latest/commands/expire/
Version/scope: Live command reference at retrieval time; target deployment assessed against Redis Open Source 7.2. Metadata carries `"condition" ... "since":"7.0.0"` for NX/XX/GT/LT.
Retrieval: HTTPS GET via harness web fetch, 2026-10-10 ~03:57Z (approx.; harness WebFetch, no JS executed, no code run).
Operation context: page fetched whole; passages below are verbatim quotes relied on.

## Verbatim passages relied on

Timeout clearing and HSET (Description):
"The timeout will only be cleared by commands that delete or overwrite the contents of the key, including DEL, SET, GETSET and all the `*STORE` commands. This means that all the operations that conceptually alter the value stored at the key without replacing it with a new one will leave the timeout untouched. For instance, incrementing the value of a key with INCR, pushing a new value into a list with LPUSH, or altering the field value of a hash with HSET are all operations that will leave the timeout untouched."

Optional arguments (mutual exclusivity and condition semantics):
"These options are mutually exclusive."
"NX — Set the expiry only when the key has no expiry."
"XX — Set the expiry only when the key already has an expiry."
"GT — Set the expiry only when the new expiry is greater than the current one. A non-volatile key is treated as an infinite TTL for the purpose of `GT`."
"LT — Set the expiry only when the new expiry is less than the current one. A non-volatile key is treated as an infinite TTL for the purpose of `LT`."

Non-positive timeout vs expiry event:
"Note that calling EXPIRE/PEXPIRE with a non-positive timeout or EXPIREAT/PEXPIREAT with a time in the past will result in the key being deleted rather than expired (accordingly, the emitted key event will be `del`, not `expired`)."

Return information:
"`0` if the timeout was not set; for example, the key doesn't exist, or the operation was skipped because of the provided arguments."
"`1` if the timeout was set."

Example sequence (Redis CLI panel):
`SET mykey "Hello World"` then `TTL mykey` → `(integer) -1`; `EXPIRE mykey 10 XX` → `(integer) 0`; `EXPIRE mykey 10 NX` → `(integer) 1`.

Appendix: Redis expires:
"Redis keys are expired in two ways: a passive way and an active way. A key is passively expired when a client tries to access it and the key is timed out. However, this is not enough as there are expired keys that will never be accessed again. These keys should be expired anyway, so periodically, Redis tests a few keys at random amongst the set of keys with an expiration."
"Since Redis 2.6 the expire error is from 0 to 1 milliseconds."
"Keys expiring information is stored as absolute Unix timestamps (in milliseconds in case of Redis version 2.6 or greater)."

Replication:
"In order to obtain a correct behavior without sacrificing consistency, when a key expires, a DEL operation is synthesized in both the AOF file and gains all the attached replicas nodes. This way the expiration process is centralized in the master instance... However while the replicas connected to a master will not expire keys independently (but will wait for the DEL coming from the master), they'll still take the full state of the expires existing in the dataset, so when a replica is elected to master it will be able to expire the keys independently, fully acting as a master."

History note: live metadata shows the NX/XX/GT/LT condition group as `"since":"7.0.0"`; no separate per-token history section was captured.
