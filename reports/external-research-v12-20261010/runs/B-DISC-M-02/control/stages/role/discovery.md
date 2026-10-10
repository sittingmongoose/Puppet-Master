# Discovery: encrypted incremental backup chunking

**Case:** ER12-B-DISC-M-02-FRESH  
**Role:** Brief-only discovery  
**Scope:** One user's folder, encrypted before storage on an untrusted object store.

Early-file insertions make boundary stability central to upload cost. Chunking must precede encryption because strong ciphertext looks random. Encryption still leaves observables: repeated identifiers, object and pack sizes, request timing, and total backup volume. The sources do not establish a universal winner for this product's files or hardware.

## Four mechanisms to shortlist

1. **Fixed-size chunks, keyed IDs, randomized authenticated encryption.** This is the simplest control and suits same-length overwrites. An insertion near the start shifts later boundaries, potentially requiring broad re-upload. Borg documents fixed chunking; the 2025 CDC preprint explains this shift problem (Borg 2.0.0b26.dev82, Security, Stored chunk sizes; Alexeev et al., section 1). Compare it against CDC to see whether improved reuse justifies complexity.

2. **Rabin CDC with versioned parameters.** Rolling fingerprints tend to recover later boundaries after a local insertion. Restic 0.18.1 documents a 64-byte window, 512 KiB minimum, 8 MiB maximum, and roughly 1 MiB average (Backups and Deduplication). These are one implementation's settings, not product defaults. Tradeoffs include rolling-hash CPU and visible variable sizes. A 2025 preprint analyzes parameter extraction against particular Restic and Borg constructions and broader size leakage; treat the attacks as threat-model-specific evidence, not proof that every CDC scheme is broken.

3. **FastCDC-style Gear CDC.** This performance-oriented choice combines simpler hash judgment, skipped sub-minimum cut points, and size normalization. The USENIX ATC 2016 paper reports about 10x the best open-source Rabin implementation with nearly the same deduplication ratio in its benchmark. That is not a desktop guarantee. Skipping affects boundaries and ratio; pin algorithm and parameters in repository metadata to preserve compatibility. The paper does not show that size leakage disappears.

4. **Secret-keyed Buzhash boundaries and keyed IDs.** Borg 2.0.0b26.dev82 documents a per-repository chunk seed plus a secret ID key. Keyed IDs avoid publishing plain SHA-256 fingerprints that could reveal small or predictable chunks, while repeated IDs still expose same-user equality. Secret boundaries may frustrate fingerprinting under key secrecy, but stored sizes remain visible; the 2025 attacks show that secret CDC parameters are not a security proof. This adds key and format complexity and needs version-specific review.

## Identity, encryption, and key changes

A plausible same-user design separates identity from ciphertext: ID = HMAC(Kid, chunk), then random-nonce AEAD under a content key, authenticating ID and format as associated data. This is a design inference, not an inspected implementation. The client can recognize old chunks without deterministic ciphertext, but the store learns equality from repeated IDs and sees sizes/access patterns.

Restic 0.19.1 documents random nonces and multiple password key files: changing a password need not rewrite data because the files provide access to the same master material. Its 0.18.1 threat section says changing the master key instead requires copying to a new repository or starting a new one. Product input must define whether "change key" means password rewrap, content-key rotation, ID-key rotation, or revocation. Rotating content or ID keys can require re-encryption/re-upload or staged migration to keep old snapshots restorable.

Message-locked/convergent encryption derives keys from plaintext and creates deterministic ciphertext, so equal messages deduplicate (Bellare, Keelveedhi, Ristenpart, EUROCRYPT 2013, sections 1.1-1.2). It targets a different sharing problem, unnecessary here because cross-user reuse is excluded. It reveals equality and needs explicit confirmation-attack review for guessable chunks; security depends on the scheme and message assumptions.

| Candidate | Insert resilience | Cost / failure |
| --- | --- | --- |
| Fixed | Poor after length change | Low CPU; shifted suffixes re-upload |
| Rabin CDC | Good after local edit | Rolling work; size/parameter leakage |
| FastCDC | Good in tested workloads | Ratio and version compatibility |
| Keyed Buzhash | Good after local edit | More key machinery; sizes remain visible |

## Implementation leads and version lead

- **Restic:** inspect the [chunker library](https://github.com/restic/chunker) and [restic source](https://github.com/restic/restic), alongside the versioned design and format docs, for a Rabin baseline and key/pack behavior. These repositories were not opened in this run.
- **Borg:** inspect the [Borg source](https://github.com/borgbackup/borg) for Buzhash and keyed chunk-ID code. The live security docs identify as 2.0.0b26.dev82; pin a tag and verify code before adopting it.
- **Historical/version lead:** restic's v0.18.1 threat page says random chunk-to-pack assignment arrived in 0.18.0 to make it harder to map sizes to files. Compare that change with the 2025 attack preprint; it changes attack applicability, but does not hide total size or network volume.

## Discriminating questions and proposed checks

1. On representative large files, compare all four after a 16-byte front insertion, same-length overwrite, and 1 MiB middle edit. Measure bytes read/uploaded, reuse, CPU, and restore compatibility at similar target chunk sizes.
2. Which object-store leaks are acceptable: repeated IDs, encrypted sizes, pack sizes, timing, and total growth? On synthetic data, test whether a reviewer can infer boundaries or confirm a guessed chunk. Secret parameters alone are not a pass.
3. Does rotation mean a new password, content key, ID key, or revocation of a compromised key? On a disposable repository, separately test rewrap and full rotation: restore old snapshots, reject old credentials, and measure bytes rewritten.

**Uncertainty and next step:** No corpus, edit distribution, performance target, leakage tolerance, or rotation semantics were supplied. A bounded next step is to run these proposed checks on two leading candidates and return measured bandwidth, CPU, leakage, and rotation cost for product input. No test was executed here, and no universal winner is inferred.
