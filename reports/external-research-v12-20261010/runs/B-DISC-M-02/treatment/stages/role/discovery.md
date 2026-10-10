# Encrypted incremental backup: chunk-reuse discovery (B-DISC-M-02)

Case ER12-B-DISC-M-02-FRESH. Scope: chunk-boundary selection and chunk-identity/encryption interaction for one user's incremental backup. Scheduling, UI, and full restore architecture are out of scope.

## Evidence base

Three primary sources, three projects (retrieved 2026-10-10; excerpts in `sources/`): Restic References/Design (Repository Format, CDC, Threat Model, Changes); Borg 1.4.5 Internals + Security (chunker, attack model, Encrypt-then-MAC, keyblob); Tarsnap cryptography + deduplication-explanation (per-archive keys, HMAC names, chunkification). Two guessed Restic URLs 404'd (see `sources/retrieval-log.md`); the eight-page budget stopped further retrieval. Cited sentences are source statements; the rest is marked inference.

## Shortlist: four mechanisms

**1. CDC + plaintext-hash identity + random-IV AEAD (Restic pattern).** Source: variable-length blobs "cut at offsets defined by a sliding window of 64 bytes" via "Rabin Fingerprints", with a random per-repository polynomial in `config` "so that watermark attacks are much harder"; blobs 512 KiB–8 MiB (avg 1 MiB), files under 512 KiB unsplit, and inserts/removals "at arbitrary positions" re-upload only modified blobs. Identity is SHA-256 of plaintext (pack headers, index); ciphertext is AES-256-CTR + Poly1305-AES, fresh random IV per file. Passphrase rotation re-wraps master keys via scrypt key files "without having to re-encrypt all data". Failure boundaries: the store sees plaintext hashes, so (inference) a candidate chunk's presence is confirmable — identity doubles as a confirmation oracle. Chunk sizes leak structure: the threat model cites the 2025 chunking-attacks paper (polynomial recovery from observed sizes), mitigated in 0.18.0 by random pack assignment.

**2. CDC + keyed chunk identity + Encrypt-then-MAC (Borg pattern).** Source: Buzhash CDC ("buzhash") or fixed blocks ("fixed"), dedup via client-side chunks cache; "The object ID in Borg is a MAC of the object's plaintext" under an independent `id_key` (HMAC-SHA-256 or keyed BLAKE2b-256); AES-256-CTR Encrypt-then-MAC; passphrase-wrapped keyblob (PBKDF2-HMAC-SHA256, random salt; keyfile/repokey modes). Failure boundaries: keyed IDs close the confirmation oracle, but (inference) rotating `id_key` invalidates every identity — passphrase rotation is cheap, data-key rotation is not. Borg's attack model drops confidentiality for multi-client repositories, so (inference) this fits only because the brief excludes cross-user sharing.

**3. Content-dependent chunkify + per-archive keys + HMAC names (Tarsnap pattern).** Source: variable, context-dependent splits ("the location of each split depends on the context"); "each archive is expressed as a list of chunks"; "per-archive random AES-256 keys" (RSA-wrapped); HMAC-SHA256 block names, since "using HMACs instead of raw SHA256 hashes prevents any information from leaking via the hashes"; encrypted chunk labels, archive lists, and a locally cached chunk list. Failure boundaries: per-archive keys bound blast radius, but key loss is total ("Anyone includes you"). The wordification table shows delete-then-re-add re-uploads data — (inference) retention/GC ordering directly affects upload cost.

**4. Fixed-size chunking + the same AEAD (contrast).** Source: Borg ships a "fixed" chunker, so this is an attested option. (Inference) Cheapest to build, uniform sizes reveal least structure — but front-insert shifts every boundary, so the brief's headline case re-uploads nearly the whole file. Keep only as a measured baseline or for append-only data; it fails the core scenario.

## Implementation leads

- **Restic chunker (Go).** Documented Rabin CDC (64-byte window, random polynomial, 512 KiB–8 MiB) with a shipped implementation in the Restic repo linked from the docs; inspect boundary rules, min/max/avg enforcement, and the 0.18.0 random pack-assignment mitigation (#5295). Not inspected here (page budget).
- **Tarsnap `tar/multitape/chunkify.c`.** Docs cite it for "the exact method" of content-dependent chunking, plus EuroBSDCon13 slides (§2.1) for the algorithm overview — an independent CDC design with different parameters. Not retrieved here (page budget).

## Historical/version lead

- **Restic format v1 → v2 ("Changes").** Adds zstandard compression for blobs and metadata files. (Inference) A template for extending a chunk/pack encoding without breaking readers — read before freezing any on-disk format.

## Tradeoff comparison

| | Front-insert reuse | Store-visible leakage | Rotation cost | Complexity |
|---|---|---|---|---|
| 1. Restic | Full (CDC) | Plaintext-hash oracle; sizes (mitigated) | Passphrase cheap; polynomial rotation re-chunks | Medium |
| 2. Borg | Full (CDC) | Keyed IDs: none; sizes visible | Passphrase cheap; `id_key` rotation breaks dedup | Med-high |
| 3. Tarsnap | Full (chunkify) | HMAC names: minimal; per-archive keys | No observed rotation story; key loss fatal | High |
| 4. Fixed | Fails brief case | Uniform sizes, least structure | Same as chosen encryption layer | Low |

All four withhold plaintext (AES-256-class AEAD throughout); they differ in what the store can confirm or measure.

## Three discriminating questions / tests

1. **Front-insert probe (test).** Insert 1 KB at offset 0 of a ~100 MB file; measure re-uploaded bytes under fixed blocking vs. two CDC parameter sets. One number decides the boundary mechanism.
2. **Confirmation-oracle question (product input + test).** May the store, given a candidate chunk, confirm it is backed up? Plaintext-hash IDs say yes, keyed/HMAC IDs say no. Test by hashing a known chunk and looking it up in a trial repository. The owner must rule whether confirmation is an accepted leak.
3. **Rotation drill (product input + test).** Rotate passphrase/key; measure bytes re-encrypted/re-uploaded and whether pre-rotation chunks still deduplicate. Distinguishes re-wrap-only rotation (cheap, keeps data keys) from true re-keying (expensive, breaks cross-epoch dedup). The owner must rule whether old versions stay readable without re-encryption.

## Capabilities vs. product choices

Capability (evidenced): single-user encrypted dedup with front-insert resilience via CDC + client-side AEAD under plaintext-hash or keyed identity. Product choices: accepted store-visible leakage (oracle? sizes/counts?); whether rotation preserves cross-epoch dedup; retention/GC semantics given delete-then-re-add cost; file-size mix (drives CDC min/avg/max).

## Uncertainty and next step

Unresolved: CDC parameters for this tool's mix; whether the store observes sizes/counts (transport unknown); Tarsnap's exact algorithm and the 2025 paper's full preconditions (summaries only); no Kopia/Duplicacy/Bup comparison (page budget). Next step: run the front-insert probe with two CDC parameter sets in the arm output directory, recording re-upload ratio and chunk-count/size leakage per set — enough to freeze the boundary mechanism before format work.
