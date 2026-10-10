# Independent primary evidence

These captures were retrieved independently for this review. Text line numbers refer to the adjacent .txt files; raw HTML hashes and retrieval UTC/operation are in [source-map.json](../source-map.json). A blocked PDF is described explicitly rather than represented as a saved capture.

## P1 — Restic v0.18.1

[Governing primary locator](https://restic.readthedocs.io/en/v0.18.1/design.html#backups-and-deduplication)

[Local text](restic-design-v0.18.1.txt) · [Retrieved HTML](restic-design-v0.18.1.html)

restic-design-v0.18.1.txt:575–587, 628–636, 678–684

Backups and Deduplication; Threat Model

512 KiB unsplit-small-file threshold; 64-byte Rabin window; 8 MiB maximum; documented approximate 1 MiB target. Pack randomization is a 0.18.0 mitigation, not a claim that volume/timing leakage disappears. Copy/new-repository master-key change is version-specific.

## P2 — Restic stable title 0.19.1 observed

[Governing primary locator](https://restic.readthedocs.io/en/stable/100_references.html#keys-encryption-and-mac)

[Local text](restic-references-stable.txt) · [Retrieved HTML](restic-references-stable.html)

restic-references-stable.txt:318–380

Keys, Encryption and MAC

16-byte random nonce for restic AES-CTR/Poly1305-AES; multiple password files wrap the same master keys. Password change is not compromise revocation or master-key rotation. Stable is mutable.

## P3 — Borg live 2.0.0b26.dev100 observed; candidate recorded dev82

[Governing primary locator](https://borgbackup.readthedocs.io/en/latest/internals/security.html#fingerprinting)

[Local text](borg-security-latest.txt) · [Retrieved HTML](borg-security-latest.html)

borg-security-latest.txt:128–151, 427–481

Encryption; Fingerprinting; Stored chunk sizes; buzhash and buzhash64; fixed chunker; Secret key usage against fingerprinting

Encryption modes and keyed IDs must be distinguished from authentication-only modes. Legacy buzhash uses a 32-bit seed; buzhash64 uses a derived 256-bit table key. Stored sizes include compression/encryption/authentication effects. Candidate makes no default, universal security, or deployment claim; its exact dev82 bytes remain unavailable.

## P4 — USENIX ATC 2016, pages 101–114

[Governing primary locator](https://www.usenix.org/conference/atc16/technical-sessions/presentation/xia)

[Local text](fastcdc-atc2016.txt) · [Retrieved HTML](fastcdc-atc2016.html)

fastcdc-atc2016.txt:70–72

Official abstract and proceedings citation

Gear-based FastCDC combines judgment simplification, cut-point skipping and normalization. Reported approximate 10x Rabin throughput is the authors’ evaluated benchmark, not this desktop or a security property.

## P5 — arXiv 2504.02095v1; manuscript March 2025

[Governing primary locator](https://arxiv.org/html/2504.02095v1#S2.SS1)

[Local text](cdc-attacks-arxiv-v1.txt) · [Retrieved HTML](cdc-attacks-arxiv-v1.html)

cdc-attacks-arxiv-v1.txt:52–115, 203–334, 506–515

Sections 1, 2.1–2.3, 3.2–3.3, 4, 5.1–5.2

Model assumes observable compressed chunk lengths and usually known/chosen plaintext for parameter extraction. Algebraic constructions and compression conditions matter; its older/simplified Borg construction does not establish an attack on every modern keyed chunker. Candidate explicitly scopes it and links a later Restic mitigation.

## P7 — Live Kopia docs, modified March 21 2023; embedded v0.3.0 example

[Governing primary locator](https://kopia.io/docs/advanced/encryption/)

[Local text](kopia-encryption.txt) · [Retrieved HTML](kopia-encryption.html)

kopia-encryption.txt:44–112

format blob; encryptedBlockFormat; ContentFormat; object Format

Envelope separation is supported. Fields are an example/configuration description, not current defaults; MasterKey field is SIV-mode only. Candidate source notes make no default/version inference and discovery.md does not use this page for an adopted scheme.

## P8 — Public restic/chunker repository, mutable master

[Governing primary locator](https://github.com/restic/chunker)

[Local text](restic-chunker-repository.txt) · [Retrieved HTML](restic-chunker-repository.html)

restic-chunker-repository.txt:144–169

README and root file listing

Confirms inspectable rolling-Rabin implementation lead and chunker.go. Reviewer did not execute it; candidate explicitly did not open or validate it.

## P9 — Public Borg repository, unstable Borg2/master

[Governing primary locator](https://github.com/borgbackup/borg)

[Local text](borg-repository.txt) · [Retrieved HTML](borg-repository.html)

borg-repository.txt:158–159, 205–249

README: This is borg2; supported chunkers; source directory

Confirms an inspectable implementation lead with src/borg and Buzhash support. Beta compatibility warning applies. No candidate claim of production readiness or executed implementation audit.

## P6 — EUROCRYPT 2013 proceedings, 17 pages

[Governing primary locator](https://www.iacr.org/archive/eurocrypt2013/78810294/78810294.pdf#page=4)

[Observed PDF evidence and limits](mle-observation.md)

1.1–1.4; 3

Conventional convergent encryption is deterministic; MLE includes randomized RCE and distinguishes D-MLE from R-MLE. Guessable message spaces defeat strong confidentiality. Family terminology does not change the candidate’s same-user choice.

