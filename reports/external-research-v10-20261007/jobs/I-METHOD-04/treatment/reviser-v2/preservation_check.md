# Preservation check — I-METHOD-04/treatment/reviser-v2

Completed at 2026-10-07 21:40:40 UTC.

## Inputs and source identity

- Used the exact candidate input map and dispatch bound, full research and critic drafts with their source maps, the linked same-arm captured primary-source bytes, and only the named generic M14 contract and renderer.
- The inherited semantic JSON was read from the exact authored-input block inside research-v2/artifact.md. The separate predecessor semantic.json and preservation_check.md were not read.
- The revised source map links all 16 captured sources and verifies 8,426,094 bytes. Every copied file matches its mapped size and SHA-256. No new source retrieval occurred, and no downloaded code was executed.
- Changed path-safety claims were checked against the captured bagit-python v1.9.0 source and tests, RFC 8493 §§2.2.1 and 5.1, and the captured PREMIS event definitions. The validator's file-walk, path-check, validation caller, and file-open path were statically inspected. Issue #157 and the encoder's CR/LF/percent handling remain separately bound.
- Inherited source claims not changed in this stage remain linked to their exact source IDs, versions, locators, and hashes; they were not represented as new independent retrievals.

## Scope and criticism preservation

- All inherited findings remain represented with the same required field sets; O5_CRITIC_PENDING is resolved as O5_CRITIC_DISPOSITION, and O6_CHOICES_AND_LIMITS makes O6 explicit.
- The complete replacement in FULL_PLAN_REPLACEMENT contains the inherited scope and all six P1–P6 decisions. Copy, inspection, derivatives, package, component alternatives, and proposed synthetic acceptance remain together in one coherent plan.
- Every one of the critic's nine identified concerns has an explicit disposition. The sibling-prefix path trace is accepted as static analysis, not a runtime exploit. Adoption conditions, symlink/reparse and race safeguards, PREMIS schema choice, optional review export, tag-manifest rules, P1–P6 details, and file-check/listening separation are all visible.
- No objection is silently dropped. The decision whether to retain an event schema, the remaining component choices, and institutional policy remain open where evidence does not decide them.
- Existing source identities and hashes were not rebound. All inherited source IDs still occur in the revised set and resolve through source-map.json. The exact URLs, versions, locators, and full captured bytes remain linked.

## Renderer output and completeness

- Ran the named generic renderer exactly once to produce artifact.md. Renderer version is m14-renderer-1.0.0; it reports input SHA-256 56967ba0417074a3a0c599b6f881972ca0121b23a2fa5d65a267fbc842f27e83.
- The nine mechanical views each contain all 9 finding IDs; the exact authored semantic JSON is embedded verbatim. No projection was hand-edited and no substantive content was supplied by the renderer.
- Every finding has all ten required semantic fields; the complete view includes summary, disposition, evidence, conditions, options, optional leads, validation, uncertainty, and sources for every record.
- Renderer structural validation and this field/scope preservation review passed. The renderer cannot detect scientific omissions or false claims; this check records the candidate's substantive review rather than claiming a host certification.

## Validation limits and operations

- No application build/test, BagIt suite, runtime path reproducer, package validation, audio parse/conversion/listening review, no-egress run, performance check, or quality assessment was executed. All P6 product checks remain proposals.
- Status remains DIAGNOSTIC_UNQUALIFIED; no quality, speed, deployment, or shipping claim is made.
- Input/cache/generated/reasoning token categories and billing amount/currency remain null/unknown, not zero. Native Goal aggregates are separate, unsummed counters.
- Generic preparation lower bound is 454.056 seconds; qualification lower bound is 0.316 seconds. Qualification wall time/billing remain unknown, and cold and amortized economics remain separate.

## Output evidence

- semantic.json — 80,585 bytes; SHA-256 56967ba0417074a3a0c599b6f881972ca0121b23a2fa5d65a267fbc842f27e83.
- artifact.md — 238,470 bytes; SHA-256 f87735349d1462d60d633688f0a53050b5055ae7629ccc45263c48a141c73704.
- source-map.json — 33,567 bytes; SHA-256 ccb22a3ec372e0c9d8c7576280774d0e0338de7c0314fc4ca990081614d3b0df before recording this preservation-check hash in the map.
- Captured sources — 16 files; 8,426,094 bytes; individual SHA-256 values are in source-map.json.
