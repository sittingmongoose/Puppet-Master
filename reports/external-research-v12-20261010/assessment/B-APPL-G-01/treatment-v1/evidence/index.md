# Independent evidence index

[Assessment](../assessment.md) · [Detailed source map](../source-map.json) · [Raw retrieval operations](retrievals.json)


## P1-expire

[Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/commands/expire/) · [raw](P1-expire.html) · [readable](P1-expire.readable.txt)

SHA-256 `92cf8b506f8c6c40062f488e05924eabd11a91b1ce984022488316b315b34f8b`; retrieved 2026-10-10T04:12:51.042229+00:00.

- [Description: in-place HSET changes](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P1-expire.readable.txt:172) (lines 172–179); [primary](https://redis.io/docs/latest/commands/expire/).

- [Description: non-positive timeout event](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P1-expire.readable.txt:188) (lines 188–191); [primary](https://redis.io/docs/latest/commands/expire/).

- [Optional arguments: NX/XX/GT/LT](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P1-expire.readable.txt:197) (lines 197–206); [primary](https://redis.io/docs/latest/commands/expire/).

- [Appendix: accuracy, timestamps, expiration, replication](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P1-expire.readable.txt:3738) (lines 3738–3773); [primary](https://redis.io/docs/latest/commands/expire/).

- [Return information and history](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P1-expire.readable.txt:3786) (lines 3786–3796); [primary](https://redis.io/docs/latest/commands/expire/).

## P2-set

[Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/commands/set/) · [raw](P2-set.html) · [readable](P2-set.readable.txt)

SHA-256 `7b75af37422a19ec020d047b51e7425a781ecdfb526776e9c3ffd6ad4c0971b7`; retrieved 2026-10-10T04:12:50.851242+00:00.

- [Description and optional arguments](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P2-set.readable.txt:186) (lines 186–219); [primary](https://redis.io/docs/latest/commands/set/).

- [History: KEEPTTL 6.0, EXAT/PXAT 6.2, comparison additions 8.4](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P2-set.readable.txt:1099) (lines 1099–1104); [primary](https://redis.io/docs/latest/commands/set/).

## P3-hset

[Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/commands/hset/) · [raw](P3-hset.html) · [readable](P3-hset.readable.txt)

SHA-256 `2d522748307439110904f335f3c30560c25587b20403ca938df77e3978c0da0a`; retrieved 2026-10-10T04:12:51.155009+00:00.

- [Since 2.0.0; fields overwritten; absent hash created](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P3-hset.readable.txt:140) (lines 140–154); [primary](https://redis.io/docs/latest/commands/hset/).

## P4-ttl

[Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/commands/ttl/) · [raw](P4-ttl.html) · [readable](P4-ttl.readable.txt)

SHA-256 `a2d3748fb5de8db65976f305e3b0d670337f9b89448e596af2f35899de0da2d4`; retrieved 2026-10-10T04:12:50.949772+00:00.

- [Description: seconds resolution; -1 persistent, -2 missing](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P4-ttl.readable.txt:67) (lines 67–74); [primary](https://redis.io/docs/latest/commands/ttl/).

## P5-notifications

[Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/) · [raw](P5-notifications.html) · [readable](P5-notifications.readable.txt)

SHA-256 `eac5aa9353b6386e05acdc84695180f40863dbd7c91798b78d89c5718fe715a6`; retrieved 2026-10-10T04:12:50.834031+00:00.

- [Pub/Sub disconnected delivery loss](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P5-notifications.readable.txt:9) (lines 9–11); [primary](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).

- [Configuration defaults and event masks](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P5-notifications.readable.txt:32) (lines 32–62); [primary](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).

- [DEL and EXPIRE events](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P5-notifications.readable.txt:67) (lines 67–68); [primary](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).

- [Ordinary expiration event](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P5-notifications.readable.txt:117) (lines 117–117); [primary](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).

- [Events require actual modification](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P5-notifications.readable.txt:122) (lines 122–122); [primary](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).

- [Event timing and no TTL-zero delivery guarantee](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P5-notifications.readable.txt:134) (lines 134–140); [primary](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).

## P6-v720-expire-c

[Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/src/expire.c) · [raw](P6-v720-expire-c.txt) · [readable](P6-v720-expire-c.txt)

SHA-256 `b3c7bb30c6bbc2cd99307fb81a917a9c3499d8749b27fdf7060e0da186d53d65`; retrieved 2026-10-10T04:12:50.916371+00:00.

- [activeExpireCycle: configured effort](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P6-v720-expire-c.txt:140) (lines 140–159); [primary](https://github.com/redis/redis/blob/7.2.0/src/expire.c#L140).

- [activeExpireCycle: time budget and incremental dictionary scanning](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P6-v720-expire-c.txt:195) (lines 195–275); [primary](https://github.com/redis/redis/blob/7.2.0/src/expire.c#L195).

- [checkAlreadyExpired: primary/loading conditions](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P6-v720-expire-c.txt:477) (lines 477–483); [primary](https://github.com/redis/redis/blob/7.2.0/src/expire.c#L477).

- [parseExtendedExpireArgumentsOrReply](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P6-v720-expire-c.txt:491) (lines 491–532); [primary](https://github.com/redis/redis/blob/7.2.0/src/expire.c#L491).

- [expireGenericCommand: seconds, domain, conditions, del/expire events](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P6-v720-expire-c.txt:549) (lines 549–664); [primary](https://github.com/redis/redis/blob/7.2.0/src/expire.c#L549).

- [ttlGenericCommand: rounding; TTL/PTTL/EXPIRETIME/PEXPIRETIME](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P6-v720-expire-c.txt:687) (lines 687–727); [primary](https://github.com/redis/redis/blob/7.2.0/src/expire.c#L687).

## P7-v720-t-string-c

[Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/src/t_string.c) · [raw](P7-v720-t-string-c.txt) · [readable](P7-v720-t-string-c.txt)

SHA-256 `9fae89d4f0c7355612fe2e5daa8fa859d4df2d8f419fffa78719b07daac60b9f`; retrieved 2026-10-10T04:12:50.923917+00:00.

- [setGenericCommand: conditional abort, KEEPTTL, explicit deadline](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P7-v720-t-string-c.txt:84) (lines 84–129); [primary](https://github.com/redis/redis/blob/7.2.0/src/t_string.c#L84).

- [getExpireMillisecondsOrReply: units and domain](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P7-v720-t-string-c.txt:153) (lines 153–188); [primary](https://github.com/redis/redis/blob/7.2.0/src/t_string.c#L153).

- [parseExtendedStringArgumentsOrReply: options and mutual exclusions](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P7-v720-t-string-c.txt:209) (lines 209–287); [primary](https://github.com/redis/redis/blob/7.2.0/src/t_string.c#L209).

- [SET command](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P7-v720-t-string-c.txt:293) (lines 293–305); [primary](https://github.com/redis/redis/blob/7.2.0/src/t_string.c#L293).

## P8-v720-t-hash-c

[Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/src/t_hash.c) · [raw](P8-v720-t-hash-c.txt) · [readable](P8-v720-t-hash-c.txt)

SHA-256 `e506d6f1ce57ea8fa7aa13406865fe1b5c0816357b22ffe97e8b969abe4d24f6`; retrieved 2026-10-10T04:12:50.991229+00:00.

- [hashTypeLookupWriteOrCreate: type and create conditions](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P8-v720-t-hash-c.txt:443) (lines 443–451); [primary](https://github.com/redis/redis/blob/7.2.0/src/t_hash.c#L443).

- [hsetCommand: existing object mutated, expiry not removed](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P8-v720-t-hash-c.txt:606) (lines 606–633); [primary](https://github.com/redis/redis/blob/7.2.0/src/t_hash.c#L606).

## P9-v720-redis-conf

[Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/redis.conf) · [raw](P9-v720-redis-conf.txt) · [readable](P9-v720-redis-conf.txt)

SHA-256 `319286fcdc3d98e9c248d9730f28c3e5bae106a58173f64302039e15507dca14`; retrieved 2026-10-10T04:12:51.004319+00:00.

- [Default replica-read-only yes](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P9-v720-redis-conf.txt:583) (lines 583–583); [primary](https://github.com/redis/redis/blob/7.2.0/redis.conf#L583).

- [Default lazyfree-lazy-expire no](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P9-v720-redis-conf.txt:1259) (lines 1259–1259); [primary](https://github.com/redis/redis/blob/7.2.0/redis.conf#L1259).

- [Keyspace events, masks, KEA classes, default disabled](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P9-v720-redis-conf.txt:1869) (lines 1869–1919); [primary](https://github.com/redis/redis/blob/7.2.0/redis.conf#L1869).

## P10-v720-db-c

[Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/src/db.c) · [raw](P10-v720-db-c.txt) · [readable](P10-v720-db-c.txt)

SHA-256 `f20c593e10b02fbc79b1af2ec199ae2d7cb48515ec4c623f682b33b4657720f6`; retrieved 2026-10-10T04:12:51.050085+00:00.

- [lookupKey: read-only replica and force-delete conditions](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P10-v720-db-c.txt:88) (lines 88–109); [primary](https://github.com/redis/redis/blob/7.2.0/src/db.c#L88).

- [setKey: TTL removed unless KEEPTTL flag](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P10-v720-db-c.txt:282) (lines 282–315); [primary](https://github.com/redis/redis/blob/7.2.0/src/db.c#L282).

- [setExpire/getExpire: absolute milliseconds](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P10-v720-db-c.txt:1649) (lines 1649–1677); [primary](https://github.com/redis/redis/blob/7.2.0/src/db.c#L1649).

- [deleteExpiredKeyAndPropagate/propagateDeletion](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P10-v720-db-c.txt:1679) (lines 1679–1726); [primary](https://github.com/redis/redis/blob/7.2.0/src/db.c#L1679).

- [expireIfNeeded: logical expiration versus physical deletion; writable-replica exception](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/evidence/P10-v720-db-c.txt:1746) (lines 1746–1817); [primary](https://github.com/redis/redis/blob/7.2.0/src/db.c#L1746).


## Assigned-row terminal provenance

[Preserved actual freeze](terminal-science-freeze.preserved.json) · [Preserved assigned-row provider evidence](assigned-row-provider-native-evidence.preserved.json) · [Provenance addition](../provenance-addendum.md)
