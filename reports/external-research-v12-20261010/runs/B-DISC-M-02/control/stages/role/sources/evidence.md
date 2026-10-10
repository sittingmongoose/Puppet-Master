# B-DISC-M-02 bounded source evidence

Retrieval window: 2026-10-10T04:38Z, approximate; the web tool did not expose per-page UTC timestamps. Operation was web search followed by direct open of the listed primary documentation/paper pages. Summaries below preserve locators and conditions; they are not full-page copies.

1. **Restic design, v0.18.1**  
   URL: https://restic.readthedocs.io/en/v0.18.1/design.html  
   Locator: Backups and Deduplication; Threat Model.  
   Evidence summary: documents a 64-byte Rabin window, 512 KiB to 8 MiB blobs, roughly 1 MiB average, and re-use after arbitrary-position inserts/removals. Threat section says 0.18.0 randomized chunks into packs to make per-file chunk-size mapping harder; says observed sizes/access patterns remain risks and a password change does not change master data keys.  
   Applicability limit: one implementation and version; not a product recommendation or proof of all CDC security.

2. **Restic references, v0.19.1 stable**  
   URL: https://restic.readthedocs.io/en/stable/100_references.html  
   Locator: Keys, Encryption and MAC; config and masterkey descriptions.  
   Evidence summary: random nonce authenticated encryption; multiple repository password key files can avoid re-encrypting stored data when changing password.  
   Applicability limit: password rewrap differs from content-master-key rotation; cited behavior is restic-specific.

3. **Borg security, 2.0.0b26.dev82**  
   URL: https://borgbackup.readthedocs.io/en/latest/internals/security.html  
   Locator: Stored chunk sizes; buzhash and buzhash64; Secret key usage against fingerprinting.  
   Evidence summary: fixed chunker is available; secret seed/key influence Buzhash boundaries; keyed ID generation uses a secret id_key; stored chunk sizes are not hidden.  
   Applicability limit: beta documentation is mutable; match source code and exact release before transferring assumptions.

4. **Kopia encryption documentation**  
   URL: https://kopia.io/docs/advanced/encryption/  
   Locator: format blob, encryptedBlockFormat, ContentFormat struct.  
   Evidence summary: envelope encryption separates passphrase-derived keys from repository content configuration; format fields expose hash, encryption, HMAC secret, master key, and splitter. The example contains buildVersion v0.3.0; the page itself notes last modified 2023-03-21.  
   Applicability limit: example version is not asserted as current product version or default configuration; used only as an inspectable architecture lead.

5. **FastCDC, USENIX ATC 2016**  
   URL: https://www.usenix.org/conference/atc16/technical-sessions/presentation/xia  
   Locator: abstract / paper summary; proceedings citation, pages 101-114.  
   Evidence summary: combines simplified hash judgment, skipping sub-minimum cut points, and normalization; authors report about 10x faster than the best open-source Rabin CDC tested with nearly the same dedup ratio.  
   Applicability limit: authors' benchmark setup; not a device-level performance claim.

6. **Alexeev, Percival, Zhang, Chunking Attacks on File Backup Services using CDC, March 2025 preprint**  
   URL: https://arxiv.org/abs/2504.02095  
   Locator: abstract; sections 1, 2.1-2.2, 3.2-3.3, 5.1-5.2.  
   Evidence summary: analyzes parameter extraction for specific Tarsnap, Borg, and Restic constructions and post-parameter size leakage; assumes server-side size observation and, for many attacks, known or chosen plaintext. It explicitly ties attacks to implementation/model assumptions.  
   Applicability limit: preprint and version-specific attack constructions; do not transfer an attack result to a different keyed algorithm without review.

7. **Bellare, Keelveedhi, Ristenpart, Message-Locked Encryption, EUROCRYPT 2013**  
   URL: https://iacr.org/archive/eurocrypt2013/78810294/78810294.pdf  
   Locator: sections 1.1-1.2.  
   Evidence summary: defines message-locked encryption; describes convergent encryption as deriving a key from a message and notes identical messages yield the same ciphertext, enabling deduplication.  
   Applicability limit: formal MLE constructions/security definitions are not a validation of an arbitrary product implementation; cross-user sharing is outside this assignment.

**Retrieval failure:** Opening https://eprint.iacr.org/2025/532.pdf returned the web tool's raw response Internal Error (). The arXiv HTML record above was opened as the alternate primary preprint page. No technical claim is based on the failed PDF request.

**Executed checks:** listed pages opened, subject to the recorded PDF retrieval failure. No local corpus, code implementation, benchmark, restore, or key-rotation experiment was executed.  
**Proposed checks:** the three tests in discovery.md; not executed.
