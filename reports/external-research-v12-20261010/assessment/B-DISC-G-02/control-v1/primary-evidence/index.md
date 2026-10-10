# Independently retrieved primary evidence

Each text file has stable line numbers. The corresponding HTML/Markdown file preserves retrieved source bytes. Retrieval UTC, URL, HTTP metadata, SHA-256 and applicability are in [source-map.json](../source-map.json).

## S1: https://slsa.dev/spec/v1.2/verifying-artifacts

[Primary page](https://slsa.dev/spec/v1.2/verifying-artifacts) · [Numbered text](S1.txt) · [Retrieved bytes](S1.html)

Version/date: SLSA v1.2, Approved
Locator: `S1.txt:63-76,118-188`
Retrieved: 2026-10-10T05:05:15.546143+00:00 to 2026-10-10T05:05:15.971632+00:00
Raw SHA-256: `3922b210da9ea002d2c267edf89864382bf4e582d3da9bbc8164ef8fe977a8b1`

Artifact subject digest and provenance signature/predicate checks; configured builder-key identity/maximum-level roots; product-specific expected source, buildType and parameters. Approved ignored parameters and known safe value ranges are allowed; unrecognized parameters should fail. Equivalent-format checks are possible; recursive dependencies are optional/best effort. Accuracy against build-process compromise is level-dependent; platform compromise is excluded.

## S2: https://slsa.dev/spec/v1.2/provenance

[Primary page](https://slsa.dev/spec/v1.2/provenance) · [Numbered text](S2.txt) · [Retrieved bytes](S2.html)

Version/date: SLSA v1.2, Approved
Locator: `S2.txt:41-58`
Retrieved: 2026-10-10T05:05:15.971749+00:00 to 2026-10-10T05:05:16.057575+00:00
Raw SHA-256: `9a176a8193aff28144dbab80584f0e9dd707a7c24f98c436349674a4a0e51e44`

General provenance definition; distinguishes build from source provenance. Predicate-specific URL leads to Build Provenance rather than treating this definition page as a field schema.

## S3: https://in-toto.io/docs/getting-started/

[Primary page](https://in-toto.io/docs/getting-started/) · [Numbered text](S3.txt) · [Retrieved bytes](S3.html)

Version/date: Getting started; last modified 2024-12-13; no release tag
Locator: `S3.txt:45-54,63-79,109-130,146-158`
Retrieved: 2026-10-10T05:05:16.057670+00:00 to 2026-10-10T05:05:16.162827+00:00
Raw SHA-256: `9de19afb8ac5ca47bd8ae7017e50e26f45df6e5774f6d6c3ebcc046819171fd4`

Signed owner layout and authorized signed links; expiry, rules and inspections. Artifacts default to allowed unless disallowed. Only explicitly supplied files are recorded, and supplied files may be recorded even if not used. Inspecting link claims is not independent observation of actual dependency use. Inspections execute commands during verification; no candidate inspection was run.

## S4: https://docs.sigstore.dev/cosign/verifying/verify/

[Primary page](https://docs.sigstore.dev/cosign/verifying/verify/) · [Numbered text](S4.txt) · [Retrieved bytes](S4.html)

Version/date: Live Cosign documentation; release tag UNKNOWN
Locator: `S4.txt:311-333,356-362`
Retrieved: 2026-10-10T05:05:16.162931+00:00 to 2026-10-10T05:05:16.283480+00:00
Raw SHA-256: `cddc158241a16c414589b05f77674d24902660e61c722f9630414c16a753e298`

Identity/issuer-constrained verification; verify-blob consumes a file and bundle, while verify and verify-attestation examples target container images. Digest claim validation and --check-claims=false discussion concern image signature payloads, not arbitrary semantic validation of every predicate or a generic blob flag. Blob verification and predicate policy are separate operations. No installed version or compatible installer packaging is established.

## S5: https://reproducible-builds.org/docs/which-problems-do-reproducible-builds-solve/

[Primary page](https://reproducible-builds.org/docs/which-problems-do-reproducible-builds-solve/) · [Numbered text](S5.txt) · [Retrieved bytes](S5.html)

Version/date: Live Reproducible Builds documentation; no version tag
Locator: `S5.txt:13-30`
Retrieved: 2026-10-10T05:05:16.283537+00:00 to 2026-10-10T05:05:16.911581+00:00
Raw SHA-256: `d07c00981d0591578fd445039c3b315b70222678603381a04c72f4e4041b6f0e`

Independent agreement on build outputs can reveal compilation deviations. Requires reproducible source/environment; output equality does not select authoritative repository, policy, builder or actual dependency-use history.

## S6: https://reproducible-builds.org/docs/

[Primary page](https://reproducible-builds.org/docs/) · [Numbered text](S6.txt) · [Retrieved bytes](S6.html)

Version/date: Live Reproducible Builds documentation index; no version tag
Locator: `S6.txt:11-16,47-59`
Retrieved: 2026-10-10T05:05:16.911705+00:00 to 2026-10-10T05:05:17.535750+00:00
Raw SHA-256: `00c3015d70aeed3d68a6325747bc7097418821cbbd3925c4b59b30111c0ee32b`

Build-system changes and a method for recreating the environment may be needed. An index does not establish this installer is reproducible.

## S7: https://github.com/in-toto/attestation/blob/main/docs/validation.md

[Primary page](https://github.com/in-toto/attestation/blob/main/docs/validation.md) · [Numbered text](S7.txt) · [Retrieved bytes](S7.md)

Version/date: in-toto attestation main branch, commit UNKNOWN; retrieved bytes SHA-256 pinned
Locator: `S7.txt:3-15,19-49`
Retrieved: 2026-10-10T05:05:17.535841+00:00 to 2026-10-10T05:05:17.631769+00:00
Raw SHA-256: `dfd52035ca5e08557c113465237b723c24f52c7258516a68b73515cf9bdfbab4`

Single artifact/attestation pseudocode; recognized attesters, acceptable digest algorithms and matched artifact subjects precede output to a policy engine. Multiple artifacts/attestations remain TODO. It is a design model, not proof that a specific released verifier implements these checks.

## S8: https://slsa.dev/blog/2025/04/slsa-v1.1

[Primary page](https://slsa.dev/blog/2025/04/slsa-v1.1) · [Numbered text](S8.txt) · [Retrieved bytes](S8.html)

Version/date: SLSA v1.1 release announcement, 2025-04-21
Locator: `S8.txt:13-27`
Retrieved: 2026-10-10T05:05:17.631863+00:00 to 2026-10-10T05:05:18.028237+00:00
Raw SHA-256: `169681663a5ba908aaa1f08396bf77f00e31d08c7660aeb346d17acaa65b445f`

v1.1 replaced v1.0 at publication, was backwards compatible and added verifier metadata to VSA. Does not prove installed-tool field/schema support or make a universal claim about v1.2 tool support.

## P9: https://slsa.dev/spec/v1.2/build-track-basics

[Primary page](https://slsa.dev/spec/v1.2/build-track-basics) · [Numbered text](P9.txt) · [Retrieved bytes](P9.html)

Version/date: SLSA v1.2, Approved
Locator: `P9.txt:49-54,77-105,106-165`
Retrieved: 2026-10-10T05:06:54.137578+00:00 to 2026-10-10T05:06:54.427531+00:00
Raw SHA-256: `3a09da943842375118b49b2df3ae7983f972befd843b7e6b90bc93b20cd61a54`

L1 supports mistakes/documentation; L2 addresses post-build tampering; L3 adds resistance to tampering during builds, isolation and signing-secret protection. No supplier-wide certification or deployment is required for this review.

## P10: https://slsa.dev/spec/v1.2/build-requirements

[Primary page](https://slsa.dev/spec/v1.2/build-requirements) · [Numbered text](P10.txt) · [Retrieved bytes](P10.html)

Version/date: SLSA v1.2, Approved
Locator: `P10.txt:150-177,179-238,252-285`
Retrieved: 2026-10-10T05:06:54.427634+00:00 to 2026-10-10T05:06:54.519537+00:00
Raw SHA-256: `fb91571cef368dc080c7f0b12902b0fb62d7494d3a9b3705e28db1b61494fcf5`

Authenticity, accuracy and completeness are distinct. L2 control-plane generation has exceptions including tenant-generated non-required fields such as resolvedDependencies and no minimum anti-tamper strength. L3 adds strong tenant-forgery resistance, protects signing secrets from user build steps and enumerates external parameters; exceptions and best-effort dependency completeness remain. Isolation does not require a hermetic build or prohibit a producer from risky behavior or invoking external runners.

