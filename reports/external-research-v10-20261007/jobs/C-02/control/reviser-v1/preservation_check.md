# Preservation and final-revision check — C-02/control/reviser-v1

## Frozen assignment and limits retained

- This is the exact final reviser stage, not a product implementation or evaluation. Inputs used: only the mapped BRIEF.md and PLAN.md, the exact own-arm researcher-v1 and critic-v1 artifacts/source maps, fresh public-primary material captured in this stage, and the exact own-arm captures needed to understand their cited claims.
- No other arm/repetition, sibling answer, campaign state, evaluator key, parent conversation/history, private repository, credential, or account was accessed. No pm-mail, child agent, external runner, nested repository, worktree, purchase, canonical Plan/main change, WorkNode, or product build was made.
- The artifact preserves the brief’s exclusions: no telescope control, autonomous observing, precision scientific reduction, sky-event prediction, or public social network. It does not claim image content, target labels, timestamps, or observation metadata are scientifically correct.
- All artifacts are in the authorized stage directory; public captures and their exact identities are indexed in source-map.json. No temporary runner, screenshot, log, or scratch output was retained.

## Full obligations O1–O7

| Obligation | Retained and addressed in artifact |
|---|---|
| **O1 — Open user-level discovery** | Began from volunteer ingest, disconnected entry, provenance, annotation, shared review and portable handoff before opening PLAN.md. Compared public-primary standards and mechanisms first. |
| **O2 — Substantially different mechanisms** | Compared server-authoritative conditional writes, PouchDB/CouchDB multi-master replication, and portable files/sidecars/folder sync; stated trade-offs and conditions. Included W3C, IIIF, FITS and BagIt as outside-component analogies. |
| **O3 — Semantics and boundaries** | Distinguished documented protocol/standard behavior, inspected implementation, inference and proposed app behavior. Pinned PouchDB replication 9.0.0 and Astropy 8.0.1 evidence; recorded package-manifest mismatch, applicable paths and boundaries. Explicitly defined a proposed pixel-edge schema and conversion to Astropy center coordinates. |
| **O4 — Pinned code/history** | Inspected PouchDB 9.0.0 shipped implementation, registry identity, gitHead source and conflict-test path; checked issue #8298 without inferring an unrelated defect/fix. Inspected Astropy v8.0.1 implementation/tests and signed release commit; identified why no issue/fix claim is needed for its optional coordinate API role. Unresolved release-specific test equivalence and app implementation are disclosed. |
| **O5 — Exact plan dispositions** | Disposed each exact section A-P1 through A-P7 as keep, amend or replace; named what each already covers and the governing evidence/condition. |
| **O6 — Complete decisions and validation** | Included integrated workflow, optional leads, unresolved conditions, proposed observable checks and a separate statement of checks actually performed. No product validation is represented as run. |
| **O7 — Full manageable scope** | Covered ingest/provenance, identity, annotation/collaboration, retention/deletion, access, error/recovery and export/handoff while preserving the small-club boundary. |

## Researcher/critic claims checked or repaired

- **Repaired geometry claim:** the earlier phrase equating integer rectangle positions with pixel centers is withdrawn. Final proposal separates sample centers, pixel-edge rectangle bounds, array `(row,column)`, Cartesian `(x,y)`, WCS coordinates, HDU/plane identity and display transforms; use of standard selectors is conditional on round-trip validation.
- **Conditional writes bounded:** `If-Match` only prevents a stale write if the application compares a strong ETag atomically before mutation. The RFC does not supply the draft-retention UI or merge behavior.
- **Offline durability bounded:** persistent-storage requests are not a guarantee; local notes need an export/recovery route and source media stays until server verification.
- **FITS time claim refined:** raw keyword/comment/HDU and time-scale context are preserved; default interpretations are not simplified into a universal UTC or correctness claim.
- **Portable integrity bounded:** BagIt/hash verification establishes payload integrity only, not identity, scientific correctness, durability or recall of downloaded copies.
- **PouchDB version evidence resolved with caveat:** npm metadata and the published tarball identify `pouchdb-replication@9.0.0`, while the gitHead points to the inspected source/test tree. A repository-local manifest at that commit reads `7.0.0-prerelease`; it does not match the published package manifest. Final proposal relies on the registry/tarball for release identity and shipped code, uses gitHead tests as linked implementation evidence, and leaves exact release-test equivalence unresolved. Issue #8298 is not applied to this workflow/version.
- **Implementation boundaries retained:** no database, auth stack, web framework, component build, browser quota, multi-gigabyte transfer, FITS fixture, or real authorization topology was tested or selected. SQLite and folder-sync limitations are used only to bound alternatives.

## Validation status

**Actually checked:** mapped input hashes are recorded in artifact.md; all captured source files referenced by source-map.json exist and match their recorded SHA-256. Public source retrieval status, exact access time, version/commit, repository path and locator are recorded per source.

**Proposed only:** all application behavior and acceptance checks in the artifact, including geometry, time parsing, interrupted ingest, conflict UI, ACLs, deletion, backup/restore and packet round-trip. No product/library test suite or browser experiment was run.
