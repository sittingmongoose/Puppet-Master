# Offline documentation cache — investigator draft

## Ownership and lookup
This is a private user-agent cache, never a multi-user proxy. Store response bodies and metadata beneath an account partition, redact authorization headers, and clear or make inaccessible that partition when signing out. Public anonymous content can have its own partition; do not join account-specific entries just because the URL is public-looking. Apply a quota with LRU eviction of complete entries, publishing body and metadata as one cache generation. GET is the only supported cached request method for this release; other methods pass through.

A key is the request URI plus account partition. When the response names Vary request headers, record their original values and select a matching variant; field-specific equivalent normalizations may be used under their defined semantics [S1 §4.1]. Missing and present headers differ. `Vary: *` is just another string-valued variant that can be matched against the next request. The initial implementation preserves representation bytes and encoding metadata rather than treating every response body as decoded UTF-8.

## Freshness and offline reuse
Store receive time and `max-age`; use time since local receipt as the response's entire age. The Date and Age headers are unnecessary because this private reader has no downstream clients. A fresh entry avoids the network; a stale one uses If-None-Match when an ETag exists, with Last-Modified as a conditional alternative. Distinguish an unavailable network from an unchanged response and a failed request. Show last successful retrieval/validation and any stale status clearly rather than claiming a live view.

Treat no-cache and no-store identically: neither can be stored, so neither can benefit from conditional reuse. Discard private responses too, since private means they are unsuitable for caches. For other stale entries, offline mode permits use even with must-revalidate because the reader is explicitly disconnected and the user asked for offline documentation. This makes the advertised offline mode broadly useful but needs protocol review.

## Conditional updates
For 304, reuse the stored body, reset receive time and ignore the response's new header fields. A 304 carries no new body, so its metadata cannot change the cached representation's freshness or variant policy. If no corresponding body is available, perform a fresh GET rather than returning an empty document. The client must bind a validator to the selected response, rather than equating an ETag with a global URL-independent identifier.

## Alternatives and history
An earlier URL-only cache was rejected because accounts and content-negotiation variants can differ. A mature RFC-aware client/cache library can reduce protocol maintenance; audit its version, private-cache configuration and storage behavior before adopting it. A custom GET-only layer can be simpler but still owes the applicable cache rules. A user-requested permanent export is a separate product action with explicit provenance and account/privacy policy, not a reason to reinterpret HTTP cache directives. Always-live retrieval is a fallback for entries that cannot be reused; it loses offline convenience.

## Validation status
RFC sections were inspected; no HTTP implementation, fixture replay or real offline test ran. Propose protocol fixtures for variants/missing headers, response age across upstream caches, no-cache versus no-store, private authenticated entries, must-revalidate offline failure, 304 metadata updates and mismatched validators. Add quota eviction, corrupt disk entries, sign-out partition access, race/interruption and readable stale-state UI tests. The future evaluation should distinguish protocol correctness from representative latency/storage measurements. Unavailable account data is not a reason to omit source research into caching semantics.
