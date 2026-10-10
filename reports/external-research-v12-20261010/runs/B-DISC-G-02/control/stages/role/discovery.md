# Portable build provenance verification

## Scope and evidence

The brief asks how an installer can decide whether a signed artifact is tied to the intended source, dependencies, and builder, and explain missing provenance. No supplier-wide certification policy is chosen. This is a discovery shortlist, not a specification or a claim that any one mechanism is universally sufficient. I reviewed eight primary documentation pages from SLSA, Sigstore, in-toto, and Reproducible Builds.

## Four mechanisms to compare

1. **SLSA build provenance with consumer-side expectations.** SLSA v1.2’s verification procedure binds the provenance subject digest to the artifact, validates the envelope signature and predicate type, and compares builder identity, canonical source repository, `buildType`, and `externalParameters` against verifier expectations. Inference: this directly addresses a job claiming the right commit while using another builder or changing build parameters. Dependency checks can recurse through `resolvedDependencies`, but the spec describes those as optional and best effort; it specifically notes that v1.0 did not require dependency completeness. The verifier still needs a trustworthy mapping from product to allowed source and builder. SLSA’s own boundary is material: consumers must trust the selected build platform, because the model does not cover compromise of that platform itself. [S1](https://slsa.dev/spec/v1.2/verifying-artifacts) [S2](https://slsa.dev/spec/v1.2/provenance)

2. **in-toto signed layout and step link metadata.** A project-owner-signed layout can name authorized functionaries, ordered steps, material/product rules, and inspections; signed link metadata records what each functionary did. `in-toto-verify` checks the layout, expiry, signatures, authorized steps, rules, and inspections. Inference: this can make a multi-step chain inspectable where a single build statement is too coarse. Its protection depends on policy owners defining the right steps and keys and on producers explicitly recording relevant files: the documentation says unpassed materials/products are not captured. Rules also default to allowing unspecified artifacts, so the docs recommend a final `DISALLOW *` for most step definitions. [S3](https://in-toto.io/docs/getting-started/)

3. **Sigstore/Cosign signed artifact or attestation.** Cosign can verify a detached blob bundle or an image signature, constrain keyless identity and OIDC issuer, and check that the signed digest matches the artifact. `cosign verify-attestation` exposes an attestation verification path. Inference: this is a practical signing and identity layer that can accompany SLSA or in-toto claims. A valid signature establishes that an accepted identity signed a payload; it does not by itself establish that the payload’s source, dependency, or builder claims meet product policy. The verifier must inspect those claims. Cosign documents that `--check-claims=false` keeps signature verification while skipping claim validation, which would be unsuitable for the intended decision unless another policy check replaces it. [S4](https://docs.sigstore.dev/cosign/verifying/verify/)

4. **Independent reproducible rebuild.** Rebuild the claimed source and environment independently, then compare the resulting artifact digest. The Reproducible Builds project describes identical outputs from a given source as enabling multiple parties to detect deviations in compilation. Inference: this is a useful cross-check against a compromised build job, but it is not a provenance document: by itself it does not identify the accepted source repository, builder identity, or dependency set. Reproducibility may require build-system changes and a strategy for recreating the environment, so feasibility and cost are product-specific. Treat this as corroboration or a higher-assurance option, not a universal prerequisite. [S5](https://reproducible-builds.org/docs/which-problems-do-reproducible-builds-solve/) [S6](https://reproducible-builds.org/docs/)

| Option | Strongest inspectable signal | Main cost or failure boundary |
|---|---|---|
| SLSA provenance | Digest, source, builder, parameters | Requires trusted builder roots and product expectations; dependencies may be incomplete |
| in-toto | Authorized workflow steps and material/product chain | Policy/key upkeep and complete recording; broad layouts take effort |
| Cosign | Signature, identity/issuer, artifact digest | Needs separate semantic policy over attestation claims |
| Rebuild | Independent output equality | Requires reproducible environment; does not name trusted source/builder on its own |

## Inspectable implementation leads

- **Cosign:** prototype detached installer verification with the documented `cosign verify-blob --bundle … --certificate-identity … --certificate-oidc-issuer …` surface, then test how the chosen attestation predicate is parsed and policy-checked. Confirm whether the installer format is a blob or container; the docs distinguish these paths. This is a proposed lead, not an executed command. [S4](https://docs.sigstore.dev/cosign/verifying/verify/)
- **in-toto:** inspect `in-toto-verify` with a signed layout, link files, and project-owner public key; exercise one step that binds the source revision and dependency lockfile to the produced installer. Review artifact rules and inspection behavior before trusting a layout. This is also proposed, not executed. The in-toto attestation validation model separately feeds extracted predicate and matched subjects to a policy engine, and its current page is scoped to one artifact/one attestation with multi-attestation handling left as future work. [S3](https://in-toto.io/docs/getting-started/) [S7](https://github.com/in-toto/attestation/blob/main/docs/validation.md)

## Version lead and discriminating next steps

The SLSA project’s April 2025 v1.1 release note says v1.1 replaced v1.0 and was backward compatible, while the current verifier and provenance references used here are v1.2. A useful version lead is to test representative producer output against the actual installed verifier and record supported predicate/schema and VSA fields; specification compatibility does not prove a particular tool version accepts every field. [S8](https://slsa.dev/blog/2025/04/slsa-v1.1) [S1](https://slsa.dev/spec/v1.2/verifying-artifacts)

Three discriminating questions/tests:

1. What exact product identity maps to its canonical repository and allowed revision pattern? Try absent provenance, an unofficial fork, and a correct source with the wrong builder; each should produce an explainable rejection.
2. Which builder/workflow identities are accepted, and should unknown parameters fail closed? Test a trusted builder with a changed build parameter and a signed artifact whose digest no longer matches.
3. Must dependencies be fully resolved, including transitive inputs, or is a direct lockfile sufficient? Compare emitted provenance against the lockfile, then assess whether an independent rebuild is feasible for the installer’s platforms.

**Uncertainty and next step.** The public sources establish available mechanisms, not whether this CI emits complete dependency provenance or whether the installer can reproduce its builds. A bounded next step is a small fixture matrix containing one valid artifact, one wrong-source case, one wrong-builder case, one missing-provenance case, and one dependency mismatch; run candidate verifiers only after selecting expected source/builder policy. No software was installed, no candidate command or local verification was executed, and no universal winner is inferred.
