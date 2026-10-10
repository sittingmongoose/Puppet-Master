# ER12 B-APPL-G-01/treatment — Redis session timeout applicability verification

Case ER12-B-APPL-G-01-FRESH; target: Redis Open Source 7.2 (one primary + replicas), key `sess:42` as string or hash. Tags: [S] = primary-source statement (quoted/closely paraphrased); [I] = my inference. Corpus S1/S2 frozen 2026-10-10T03:53:40Z; live fetches R1–R5 (~03:57–04:02Z): locators in `source-map.json`, excerpts in `sources/`.

## Claim 1 — HSET preserves existing expiry — SUPPORTED (key-level TTL)

[S] EXPIRE reference (R1): operations "that conceptually alter the value stored at the key without replacing it with a new one will leave the timeout untouched", explicitly naming "altering the field value of a hash with HSET". [S] HSET reference (R3) overwrites fields, not the key. Applicability: Redis 7.2, key-level TTL; HSET since 2.0.0. Corrected bounded wording: "HSET on an existing session hash leaves the key's existing timeout unchanged — it neither clears nor refreshes it; the original deadline keeps counting down [I; R1: expiries are absolute Unix timestamps]." Exceptions: HSET that creates the key has no prior expiry to preserve; later field-level expiration additions (HEXPIRE appears in live docs) need their own applicability check — unresolved; a 7.2-pinned changelog would resolve it.

## Claim 2 — every successful SET replacement preserves TTL without an expiration option — REFUTED

[S] SET reference (R2): "Any previous time to live associated with the key is discarded on successful SET operation." [S] EXPIRE example (R1): after plain `SET mykey "Hello World"`, `TTL` returns −1. Applies to 7.2 (SET since 1.0.0). Corrected wording: "A successful SET with no expiration option removes any existing TTL (the key becomes persistent); EX/PX/EXAT/PXAT install a new one; only KEEPTTL retains it." Exception: an unsuccessful SET (condition such as NX fails) leaves the existing TTL untouched — the discard is scoped to a successful operation.

## Claim 3 — SET KEEPTTL changes the value while retaining the timeout — SUPPORTED, applicable

[S] SET reference (R2): KEEPTTL = "Retain the time to live associated with the key", `since 6.0.0`, therefore available on 7.2; expiration options are mutually exclusive. [I] Because expiries are absolute timestamps (R1), KEEPTTL retains the original deadline rather than restarting the countdown. Corrected wording: "`SET sess:42 <new> KEEPTTL` replaces the string value and keeps the existing expiry time; the remaining TTL continues to decrease." Exception: on a key without a TTL, KEEPTTL leaves it persistent (nothing to retain).

## Claim 4 — EXPIRE GT attaches a finite timeout to a persistent key — REFUTED

[S] EXPIRE reference (R1), GT: "Set the expiry only when the new expiry is greater than the current one. A non-volatile key is treated as an infinite TTL for the purpose of GT." [I] No finite duration exceeds infinite, so on persistent `sess:42`, `EXPIRE ... GT` returns 0 and the key stays persistent; the claim's premise inverts the documented rule. Applicability: NX/XX/GT/LT exist since 7.0.0 (R1 metadata), so availability on 7.2 is not the defect — the semantics are. Corrected wording: "`EXPIRE sess:42 <sec> NX` attaches a timeout to a key with no expiry; GT only tightens keys that already have a finite TTL." [S] Return convention: 0 when "skipped because of the provided arguments".

## Claim 5 — EXPIRE with a zero timeout emits the same key event as ordinary timeout expiry — REFUTED

[S] EXPIRE reference (R1): a non-positive timeout results in the key "being deleted rather than expired (accordingly, the emitted key event will be `del`, not `expired`)". [S] Keyspace notifications (R5): EXPIRE variants generate an `expire` event only with a positive timeout; with a negative timeout value "the key is deleted and only a `del` event is generated instead". Exceptions: notifications are disabled by default and require `notify-keyspace-events`; Pub/Sub delivery is fire-and-forget [S, R5]. [S, R5] `expired` events fire when the server actually deletes the key, which can lag the TTL's logical zero by a "significant delay" — so delivery timing differs too [I].

## Claim 6 — sources prove p99 cleanup latency below 25 ms under replica failover — UNSUPPORTED (unproven)

[S] None of S1–S2/R1–R5 contains a latency measurement, benchmark, or service-specific data. [I] R1's "expire error is from 0 to 1 milliseconds" is timer accuracy, not cleanup/p99 latency. [S] Cleanup is passive (on access) or an active background cycle testing keys "at random"; expiration is centralized on the primary with a synthesized DEL propagated to replicas, and replicas do not expire independently until promoted (R1). Nothing bounds a p99, under failover or otherwise. Disposition: command references cannot prove this assertion. Resolution requires service-side p99 latency histograms for expiry handling on this deployment, captured during a failover drill.

## Preserved uncertainty

1. Later-version additions in live docs (SET IFEQ/IFNE since 8.4.0; HEXPIRE) sit outside the 7.2 target; a 7.2-pinned manual would close claims 1 and 3's residual questions.
2. Per-event-class notification availability on exactly 7.2 is not pinned (R5 is live docs).
3. Claim 6 is unproven, not disproven: no permitted evidence speaks to this service's latency.

## Acceptance checks for the service

1. TTL semantics: `SET sess:42 a EX 60`; `SET sess:42 b`; assert `TTL sess:42 == -1`. Then `SET sess:42 c EX 60`; `SET sess:42 d KEEPTTL`; assert value `d` and `TTL sess:42 > 0` (smaller than before the KEEPTTL write).
2. Conditional expiry and events: on a persistent key assert `EXPIRE sess:42 3600 GT` returns 0 with `TTL sess:42 == -1`, while `EXPIRE sess:42 3600 NX` returns 1. With `notify-keyspace-events` enabled (e.g. `KEA`), assert `EXPIRE sess:42 0` publishes `__keyevent@0__:del` and never `expired`.
