# R5: Redis keyspace notifications (live primary, retrieved by treatment arm)

URL: https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/
Retrieval note: first attempt at https://redis.io/docs/latest/develop/use/keyspace-notifications/ returned HTTP 404; this page (the URL the EXPIRE reference links) was fetched instead.
Version/scope: Live development docs at retrieval time; history rows captured: ">= 6.0: Key miss events were added", ">= 7.0: Event type new added". Target deployment Redis Open Source 7.2.
Retrieval: HTTPS GET via harness web fetch, 2026-10-10 ~04:02Z (approx.; harness WebFetch, no JS executed, no code run).

## Verbatim passages relied on

Configuration gate:
"By default keyspace event notifications are disabled because while not very sensible the feature uses some CPU power. Notifications are enabled using the notify-keyspace-events of redis.conf or via the CONFIG SET."
"At least K or E should be present in the string, otherwise no event will be delivered regardless of the rest of the string."
"You can use the string KEA to enable most types of events."

EXPIRE vs non-positive timeout events:
"EXPIRE and all its variants (PEXPIRE, EXPIREAT, PEXPIREAT) generate an expire event when called with a positive timeout (or a future timestamp). Note that when these commands are called with a negative timeout value or timestamp in the past, the key is deleted and only a del event is generated instead."

Ordinary expiry events:
"Every time a key with a time to live associated is removed from the data set because it expired, an expired event is generated."

Timing of expired events:
"Keys with a time to live associated are expired by Redis in two ways: When the key is accessed by a command and is found to be expired. Via a background system that looks for expired keys in the background, incrementally..."
"Expired (expired) events are generated when the Redis server deletes the key and not when the time to live theoretically reaches the value of zero."
"If no command targets the key constantly, and there are many keys with a TTL associated, there can be a significant delay between the time the key time to live drops to zero, and the time the expired event is generated."

Delivery semantics:
"Note: Redis Pub/Sub is fire and forget; that is, if your Pub/Sub client disconnects, and reconnects later, all the events delivered during the time the client was disconnected are lost."
