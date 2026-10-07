# Investigation notes — transport-side vs local-object-side (D-M15-A treatment scout)

Working notes, ticket 3. All source refs are SHA-256-pinned in `sources/index.json`.
Evidence quotes below were extracted directly from the captured bytes this round.

## Side A — transport/transfer mechanisms (independent analysis)

A1. **Byte-range resume with a validator guard (RFC 9110 §14, §13.1.5 If-Range).**
Captured text: If-Range "instructs the recipient to ignore the Range header field if the
validator doesn't match, resulting in transfer of the new selected representation instead
of a 412 (Precondition Failed) response." A client resuming with `Range` plus a strong
ETag in `If-Range` gets a clean semantic: resume only if the server-side representation is
still the one the partial copy came from; otherwise restart from the *new* representation.
Retry bound: cap resume attempts and fall back to full re-GET (the standard-conformant
degraded path).

A2. **Session-offset resume (tus 1.0.0).** Captured text: "Given the offset, the Client
uses the PATCH method to resume the upload ... Upload-Offset: 70". Resume state is a
positional offset in a server-side session keyed by upload URL (`/files/24e533e0...`).
Bounded retries are natural (re-HEAD for offset, PATCH the remainder, max attempts).
Key structural fact: **tus has no representation identity in the core protocol** — the
offset binds to a session, not to content bytes.

A3. **Part-based upload (S3 CreateMultipartUpload, as captured).** Object upload is
split into numbered parts; the client must present part numbers + part ETags at
completion. Per-part ETags give per-chunk content identity, but S3's composite ETag has
no public hash semantics (uncertainty recorded), and the pattern requires up-front
session creation and a completion call — a commit-style protocol, not an automatic
resume.

## Side B — local-object identity/lifecycle mechanisms (independent analysis)

B1. **Atomic path replacement (rename(2), man-pages 6.19).** Captured text: "If newpath
already exists, it will be atomically replaced, so that there is no point at which another
process attempting to access newpath will find it missing." Consequence for this app: a
user "replace" is (or should be) an atomic rename, so a transfer holding an open fd keeps
a consistent old inode; nothing on the transport side signals the change. (Uncertainty:
fd-continuation on the old inode is standard POSIX behavior implied by atomicity; the
captured excerpt does not state it in those words.)

B2. **In-place write risks (open(2)).** If the app replaces content by truncating and
rewriting (`O_TRUNC`) instead of rename, a concurrent reader/transfer observes a
truncated-or-mixed file; no transport mechanism can repair a corrupted local read side.

B3. **Validator semantics (RFC 9110 §8.8).** Strong validators (strong ETags) change when
representation data changes; the spec's own warning — captured: strong validators "might
change for reasons other than a change to the representation data" — cuts both ways.
For local identity the analogous key is a content hash computed over the bytes at enqueue
time, stored with the pending transfer record.

## Overlap — reconciliation (not two answers concatenated)

The single binding key is a **strong content hash of the local bytes** (e.g. SHA-256),
computed when the transfer is enqueued and carried in the transfer/session record.
Two enforcement points, one identity:

- **Local gate (before every resume, not just at start):** re-read the attachment path,
  re-hash, compare with the stored hash. Equal → safe to resume (bytes unchanged since
  partial transfer). Unequal → the attachment was replaced (detectable regardless of
  whether replacement was rename or in-place, since content changed); abandon the old
  session and start a fresh transfer of the new bytes. Re-hashing at resume is required
  because rename(2) atomicity protects in-flight reads but guarantees nothing about the
  *next* open.
- **Transport gate (server side of the same identity):** byte-range resume must carry
  `If-Range`/`If-Match` with a strong server-side validator (RFC 9110 A1), so a
  server-side replacement also yields "restart from new representation" instead of a
  mixed 206. For tus-style sessions the local gate is the only identity check that
  exists; the session offset is content-blind (A2), so the client-supplied hash gate is
  what binds "this session" to "these bytes".

Net: resume correctness is a property of the *pair* (identity key + enforcement point),
not of either side alone. A transport that resumes positionally without an identity gate
silently mixes replaced content; an identity check without an atomic local write still
corrupts via O_TRUNC-style replacement (B2).

## Negative leads (examined and rejected, with why)

N1. **mtime+size as the identity key — rejected.** Not collision-safe: replacements can
preserve mtime/size; RFC 9110 itself treats Last-Modified as inherently weaker (captured:
dates can "go back in time" after clock correction or backup restore). A content-equal
but mtime-changed file would falsely abort; a replaced file could falsely resume.
N2. **Weak ETags (`W/`) for the transport gate — rejected.** Weak validators define
"semantically equivalent" matches; a replaced photo is *not* semantically equivalent to
the original, so only a strong validator is usable in If-Range/If-Match here.
N3. **Path/filename as identity across resume — rejected.** rename(2) shows the same path
can atomically denote different content at different times; the path is not a stable
identity for a pending transfer.
N4. **Unbounded resume retries — rejected.** Rural flaps are exactly the case where a
resume loop without an attempt/byte-progress bound never terminates; bounded attempts
with full-restart fallback is the retained alternative.

## Uncertainties retained

U1. Server family is unstated by the brief; If-Range/ETag support, tus adoption, and
multipart-style APIs have different availability — recommendation must be conditional.
U2. Whether the app's replace operation is rename-based or in-place (determines whether
B2 corruption risk is live).
U3. fd-continuation after rename is asserted from POSIX semantics, not from an explicit
captured sentence.
U4. S3 composite ETag hash semantics are not publicly specified; part-level identity is
usable only inside the S3 protocol itself.
U5. Cost of re-hashing large photos at each resume on rural devices (bounded, photos are
typically ≤ tens of MB; untested assumption).

## Discriminating validation sketch (proposed now, executed never)

V1. Replace-then-resume test: enqueue a large transfer, replace the file (both via
rename and via in-place write), force a resume; correct behavior is fresh transfer of new
bytes in both cases — discriminating between identity-gated and position-only resume.
V2. Kill-and-resume test: drop the connection mid-transfer, resume via Range+If-Range
(strong ETag) vs via offset-only session; observe whether a server-side replacement
between attempts yields a mixed 206 (position-only) or a clean restart (identity-gated).
