# Portable build provenance verification — brief-only discovery

Case ER12-B-DISC-G-02-FRESH. Scope: bind one artifact to source, dependencies, and builder identity with a verify-or-explain decision. Out of scope: supply-chain programs, certificate operations, installer code.

## Mechanism-diverse shortlist

1. SLSA v1 Provenance. Source: provenance is verifiable where/when/how info, predicateType `https://slsa.dev/provenance/v1` in the in-toto framework, with `buildDefinition` and `runDetails.builder.id` identifying the trusted build platform (slsa.dev v1.0 Provenance, Purpose/Model). Verify by checking builder identity, envelope signature, and `buildType`/`externalParameters`, failing on unrecognized parameters (slsa.dev v1.0 Verifying artifacts). Inference: covers the compromised-job claim via signed source, resolved deps, and builder ID. Failure boundary: missing/untrusted provenance gives no affirmation; stolen builder keys or off-map builders defeat it.

2. Sigstore keyless signing plus transparency. Source nav documents Fulcio CA with OIDC, Rekor log, Bundle format, and cosign verify/verify-attestation including in-toto attestations (docs.sigstore.dev, About/Cosign/Verifying). Inference: short-lived OIDC certificates avoid long-lived keys; Rekor gives a checkable issuance record. Failure boundary: needs trust roots and identity policy; wrong OIDC identity must fail closed; transparency proves issuance, not build correctness, so pair with a provenance predicate.

3. in-toto layout verification. Sources confirm in-toto as the attestation framework for SLSA predicates and cosign-verified attestations, with spec, demo, and Python implementation docs (in-toto.io Docs index; slsa.dev Model; docs.sigstore.dev Verifying). Inference: a signed layout encodes which steps/keys must attest, generalizing single checks to multi-step policy. Failure boundary: layout/link/threshold sections not retrieved here, so field semantics are unresolved; needs a trusted layout root and per-step keys, adding policy cost.

4. TUF update metadata. Source: TUF is libraries, formats, and utilities for securing update systems and limiting key-compromise impact, built to integrate with existing updaters (theupdateframework.io Docs Overview, Purpose). Inference: the channel still needs freshness/rollback resistance so old signed artifacts cannot replay. Failure boundary: roles/spec pages not retrieved, so role/threshold/expiry details are unresolved; TUF complements provenance rather than replacing it.

## Inspectable implementation leads

A. SLSA verifier logic. Inspect verification steps plus schema sections BuildDefinition, RunDetails, Builder, BuildMetadata (slsa.dev v1.0 Provenance/Verifying artifacts). Minimal check: digest-match subject, verify DSSE signature, enforce trusted `builder.id` set, compare source digest and buildType. Lead: slsa-framework verifier/generator repos (named only; not fetched).

B. cosign attestation verification. Inspect verify/verify-attestation pages, bundle format, and OIDC cheat sheet (docs.sigstore.dev). Minimal check: `cosign verify-attestation` with expected predicate and certificate identity, plus Rekor inclusion. Lead: sigstore/cosign repo (named only; not fetched).

## Historical/version lead

SLSA v1.0 header states Status Retired with v1.2 current, keeps predicateType `https://slsa.dev/provenance/v1` resolving to latest minor, and lists migrating-from-0.2 plus change history v0.1–v1.0 (slsa.dev v1.0 Provenance). Inference: pin parsing to predicate URI plus version handling and test v1.0 vs v1.2 without silently widening trust.

## Tradeoff comparison

| Mechanism | Binds | Installer needs | Main cost | Fails closed on |
|---|---|---|---|---|
| SLSA provenance | source, deps, builder | trust map, sig verify, expectation match | expectation maintenance | missing/untrusted provenance |
| Sigstore + Rekor | identity, issuance | trust root, identity policy | network/policy config | wrong identity, no inclusion |
| in-toto layout | steps, keys, policy | layout root, step keys | policy authoring | missing step, threshold miss |
| TUF channel | freshness, authority | TUF client metadata | metadata service | rollback, expired metadata |

## Discriminating questions and prospective tests

1. Missing provenance: does the installer refuse with a provenance-missing explanation rather than installing on signature alone? Test with a signed artifact stripped of its attestation; pass is a blocked install plus a named missing predicate.
2. Dependency substitution: does changing one resolved dependency digest while keeping the source commit cause verification to fail? Test by editing the lockfile entry named in provenance; pass is failure naming the mismatched digest.
3. Builder substitution: does a validly signed provenance from an unlisted `builder.id` fail even when source and deps match? Test with a self-hosted builder attestation; pass is failure naming the untrusted builder.

## Capabilities versus product choices

Capabilities: signed provenance can carry source/dependency/builder claims; signatures and transparency are independently checkable; verifiers can enforce builder and parameter expectations. Product choices (not inferred): trusted builder list and rotation; block-or-warn on missing provenance; allow-listed `externalParameters`; offline trust roots; explanation wording.

## Uncertainty and bounded next step

Unresolved: TUF role/threshold and in-toto layout/link semantics not retrieved; cosign flags and SLSA v1.2 deltas need direct reads; offline trust-root storage unexamined. Retrieval: six primary pages across four projects, all HTTP 200, no failures; depth limits noted, not invented. Next step: fetch TUF roles spec, in-toto spec, and SLSA v1.2 diff, then encode the three tests against one sample artifact.

## Retrieval log

SLSA v1.0 Provenance; SLSA v1.0 Verifying artifacts; Sigstore About Overview; Sigstore Cosign Verifying Attestation; TUF Docs Overview; in-toto Docs index. Full URLs, versions, and timestamps in source-map.json.
