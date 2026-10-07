# D-M15-A — Resume and identity for inspection photo attachments (final)

Scope: one bounded module — interrupted transfers, bounded retries, and identity across replace-during-transfer for photo attachments on unreliable rural links. Sources are self-selected primary public docs (open discovery; none supplied); every quote is from captured bytes, sha256-verified (`sources/index.json`). No downloaded code executed.

## Recommendation (bounded mechanism)

Bind every transfer job to content identity, resume with validator-bound conditional requests, and bound all retrying:

1. **Local identity.** At transfer start, snapshot the bytes and compute a digest (SHA-256); that digest is the object's identity, on the content-addressable model (Git §10.2: "insert any kind of content… hand you back a unique key"). Jobs transfer an (identity, bytes) pair, never a path.
2. **Replace semantics.** A user replacement mints a new object under a new digest. The in-flight job is *superseded, not killed*: it finishes or is abandoned as a unit, so replacement never interleaves bytes. POSIX storage already provides the mechanics: rename(2) replacement is atomic ("no point at which another process… will find it missing") and open descriptors are "unaffected"; a deleted-but-open file persists "until the last file descriptor… is closed". Superseding just stops retries of the old job (a bound) and enqueues the new digest.
3. **Transport resume.** Downloads: HTTP Range with If-Range (RFC 9110 §13.1.5) — on validator mismatch the server sends "the new selected representation instead of a 412", i.e. the transport natively converts a stale resume into a clean restart. Uploads: an offset-probe protocol (tus 1.0.0: HEAD returns authoritative `Upload-Offset`; PATCH appends at that offset; optional per-chunk Upload-Checksum), because generic HTTP has no dependable resumable upload (RFC 9110 §14.5: Partial PUT "is inconsistent and depends on private agreements with user agents").
4. **Bounded retries.** Retry only a declared transient class, bounded by count and wall-clock with exponential backoff (curl: timeout plus HTTP 408/429/5xx-class; first wait 1 s, doubling; `--retry-max-time`), honoring Retry-After (§10.2.3) as the server's pacing hint. Amend the class with what rural links actually produce — connection reset mid-body — since bounds must also cover failures that return no response.
5. **Explicitly not a sync service.** A per-attachment transfer manager: identity + resume + bounds + supersede. No conflict merge, no daemon, no offline store.

## Reconciliation (one answer, not two)

The transport and local-object answers are one convention split across a boundary. The strong validator the transport needs (If-Range §13.1.5; If-Match §13.1.1) and the identity the local store needs (F5's digest) are the same kind of object: a content-derived strong identifier. The local digest is the app-side ETag. A replace-during-transfer then resolves without per-case analysis: locally, replacement mints a new identity while the OS/platform keeps the old bytes readable until the transfer releases them (rename/unlink; on web stacks, Blob "snapshot state" in the File API fixes read semantics); remotely, the next resume carries If-Range/If-Match, and a mismatch means the representation changed — the protocol answer (restart from the new representation, or 412) coincides with the local answer (new job for the new digest; old job superseded). The one mechanism that must be rejected is resuming by path or row id without a digest: that is what produces interleaved or corrupt photos.

## Material findings

- **F1 (transport, read-resume).** RFC 9110 §14/§13.1.5: byte-range resume is real but conditional — server range support is optional (discover via Accept-Ranges) and If-Range requires a strong validator. Uncertainty: no per-server support data captured.
- **F2 (transport, upload-resume).** tus 1.0.0: offset-probe resume with optional per-chunk checksums; requires deploying the protocol server-side. Negative lead: generic HTTP cannot do this (F4).
- **F3 (transport, bounded retry).** curl documents the full pattern — named transient class, count bound, backoff from 1 s, wall-clock bound — plus server Retry-After. Negative lead: transient classification is client policy; reset-mid-body fits only "timeout".
- **F4 (transport, negative).** RFC 9110 §14.5: no standard resumable upload write path; draft-ietf-httpbis-resumable-upload-13 exists but is an active, non-normative draft.
- **F5 (local, identity).** Content-derived identity (Git §10.2, SHA-1 there): replacement mints a new name; the in-flight old-name transfer stays well-defined. Conditions: digest over snapshot bytes; keep the old object until the job is terminal. Negative lead: nothing guarantees the server's ETag agrees with the local digest.
- **F6 (local, lifecycle).** rename(2)/unlink(2): atomic replacement, FD isolation, unlink-while-open persistence — local replacement cannot corrupt an in-flight read. Negative lead: POSIX-only evidence; Windows share modes not captured.
- **F7 (local, platform).** W3C File API (WD 2026-09-12): Blob "snapshot state… set to the state of the underlying storage" — web-stack reads of replaced files reflect snapshot-at-start. Condition: snapshot at transfer start. Uncertainty: Working-Draft status.
- **F8 (boundary, unresolved).** If-Match is the write-side twin of the digest convention, but server ETag strength/content-derivation is server-dependent — unresolved until the capability probe below runs.

## Validation — proposed vs actually executed

Actually executed here: sha256 verification of all eight captures; every quote above extracted and checked against the captured bytes; section anchors grepped in-capture. No target server probed; no app code run.

Proposed discriminating checks (cheap; no sync service):
1. **Capability probe** (decides the F1-vs-F2 transport fork): `GET` with `Range` + `If-Range` on a stored photo — 206 ⇒ validator-bound range resume is viable; weak ETag (`W/`) or unconditional 200 ⇒ it is not, choose the offset protocol if we control the server.
2. **Replace-during-transfer test** (decides supersede-vs-abandon): slow upload of A, replace with B mid-flight; assert A completes as A's digest, B transfers as its own job, no mixed bytes.
3. **Digest round-trip** (decides whether F8's assumption can ever be made): compare server-exposed checksum with local SHA-256 where available.

## Dispositions

- **Accepted:** content-digest identity (F5); supersede-don't-kill (F5/F6); validator-bound range resume for downloads (F1); offset-probe resume for uploads (F2).
- **Amended:** curl's transient class (F3) — add reset-mid-body while keeping the count/time bounds.
- **Rejected:** path/row-id resume identity (corruption risk, Reconciliation); reliance on Partial PUT (F4); treating draft-13 as shippable.
- **Unresolved:** server ETag strength (needs check 1); Windows share-mode behavior; tus-vs-draft choice where the server is not under our control.

## Obligation coverage

1. Interrupted transfers + bounded retries — F2, F3; Recommendation §3–4. 2. Replacement/version identity during resume — F5, F7, F8; Recommendation §1–2. 3. Independent investigation — transport from RFC 9110/tus/curl/draft (index rows 0–3); local-object from rename/unlink/File API/Git (rows 4–7); derived separately before reconciliation. 4. Reconciled overlap — Reconciliation section: one identity convention, not two concatenated answers. 5. Findings — exactly 8, each with source identity, conditions, and retained uncertainty/negative leads. 6. Bounded recommendation + discriminating validation without a full sync service — Recommendation + Validation; explicitly excluded in §5.
