# R2: Redis SET (live primary, retrieved by treatment arm)

URL: https://redis.io/docs/latest/commands/set/
Version/scope: Live command reference at retrieval time; target deployment Redis Open Source 7.2. Live metadata includes options newer than the target (e.g. IFEQ/IFNE/IFDEQ/IFDNE `"since":"8.4.0"`), so live syntax alone does not establish 7.2 availability — each option is checked against its `since`.
Retrieval: HTTPS GET via harness web fetch, 2026-10-10 ~03:57Z (approx.; harness WebFetch, no JS executed, no code run).

## Verbatim passages relied on

Description:
"Set key to hold the string value. If key already holds a value, it is overwritten, regardless of its type. Any previous time to live associated with the key is discarded on successful SET operation."

Options:
"The condition options (NX, XX, ...) are mutually exclusive, as are the expiration options (EX, PX, EXAT, PXAT, KEEPTTL)."
"KEEPTTL — Retain the time to live associated with the key."
Metadata: keepttl token `"since":"6.0.0"`; EX/PX `"since":"2.6.12"`; EXAT/PXAT `"since":"6.2.0"`; GET `"since":"6.2.0"`.

Corpus agreement: S2's verbatim excerpt ("Retain the time to live associated with the key.") matches this page's KEEPTTL text word for word (9 words).
