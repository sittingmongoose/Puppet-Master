# Bounded source evidence

Retrieval observation: 2026-10-10 04:59:27 UTC, after the web retrieval batch. The web tool did not expose individual fetch timestamps. Operations were official-domain search, open, and two link clicks. These are concise source notes, not full-page captures. Exact URLs, version/date details, and locators are in `../source-map.json`.

- **S1 — SLSA v1.2 verification:** the approved guidance checks envelope signature and subject digest, requires expected builder identity and compares canonical source, build type, and external parameters; dependency recursion is optional/best effort. Its threat model assumes the chosen platform is trusted and excludes compromise of that platform.
- **S2 — SLSA provenance:** defines provenance as verifiable information about where, when, and how an artifact was produced; build provenance tracks output back to source.
- **S3 — in-toto:** signed layouts enumerate authorized functionaries and steps; signed links record step data. The verifier checks layout/signatures, expiry, steps, rules, and inspections. Only explicitly passed material/product files are recorded; unspecified artifacts are allowed by default unless disallowed.
- **S4 — Sigstore/Cosign:** documents keyless identity and issuer constraints, blob bundles, digest checking, and attestation verification. Its warning states claim checks can be disabled, leaving claims unverified.
- **S5 — Reproducible Builds:** states that identical outputs from a given source let multiple parties compare results and flag deviations.
- **S6 — Reproducible Builds docs:** notes that build-system changes and a plan for recreating the environment may be needed.
- **S7 — in-toto Attestation Framework validation:** verification checks recognized attesters and the artifact digest, then hands predicate data to a policy engine; current pseudocode is scoped to one artifact and one attestation, with multi-attestation processing left open.
- **S8 — SLSA v1.1 release note:** dated 2025-04-21; says v1.1 replaced v1.0, is backward compatible with v1.0, and adds verifier metadata to VSA. This is a specification statement, not evidence about any installed verifier.

**Inference boundary:** the four mechanisms differ in what they establish: provenance expectations, workflow authorization, signed identity/digest, or independent output equality. Combining them may improve coverage, but which combination is justified depends on the product’s source/builder policy, dependency evidence requirement, artifact packaging, and reproduction cost. No source establishes a universal winner.
