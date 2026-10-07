# Preservation and self-critique check

**Assignment:** C-02/control/researcher-v1  
**Native Goal:** `01a117f1-e750-7d41-8762-facacb512e85`; created fresh and confirmed `active` before reading the assignment map or research sources. Scientific delivery was completed before the planned terminal update.  
**Inputs:** the exact map at `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/C-02/control/researcher-v1/input-map.json`, which names only C-02 `BRIEF.md` and `PLAN.md`. The map declares no own-arm predecessor files or sources. Brief/plan byte counts and SHA-256 values were checked against the map.

## Preserved governing conditions and corrections

- This is a hypothetical small astronomy club proposal, not a report about a real club or validated dataset. The frozen plan is a thin prospective proposal, not an endorsed architecture or answer key.
- Stay within session preparation, ingest, image inspection, comments/regions, uncertain/incomplete review, later collaborative review, and selected packet export. Exclude telescope control, autonomous observing, scientific reduction, event prediction, and public social networking. Do not claim that supplied image content, time, target, or observation metadata is correct.
- Favor affordable public components and portable data; consider low-connectivity entry and later review. Keep optional conversion/analysis conditional on later validation.
- Preserve originals. A byte hash is a byte identity, not observation identity, image truth, or processing lineage. Keep observation/session/file/derivative identities distinct.
- A displayed-preview coordinate is not a durable reference. Tie regions to an exact asset/derivative, plane/HDU, dimensions, and explicit transform; mark anchors stale and request human review after replacement.
- Do not treat a later arriving revision as safe conflict resolution. Retain both branches/drafts and surface a review. Keep drafts private until an explicit publication action.
- A withdrawal cannot recall a packet already downloaded by a member. Retention, backup expiry, and permanent purge require a club policy.
- No product, WorkNodes, canonical Plans/main, account changes, purchases, third-party issue/PR, private repo, worktree, external candidate runner, nested worker, or pm-mail was used. No excluded arm/repetition, campaign analysis/results, reviewer/evaluation feedback, sibling answer/cache, secret, or parent history was read.
- Public text and code were treated only as evidence. No instructions in source content were followed.

## Full obligation coverage

| Obligation | Coverage in `artifact.md` | Status |
|---|---|---|
| O1: Open public-primary discovery from the user problem before plan defects | “Research method and evidence labels” states the discovery order and domains. The exact plan comparison appears later under “Frozen-plan dispositions.” | Covered; source selection is scoped, not exhaustive. |
| O2: Compare substantially different mechanisms, competing options, analogies, trade-offs | “Meaningful alternatives” compares PouchDB/CouchDB multi-master replication with server authority plus conditional revisions and treats CRDT as deferred. Annotation, IIIF, PROV-O, and BagIt are cross-domain analogies. | Covered. |
| O3: Verify consequential semantics, units/coordinates, versions and applicability | FITS v4 time semantics; Astropy v8.0.1 pixel/WCS origin and axis order; IIIF pixel regions; RFC 9110 `If-Match`; exact PouchDB release/dependency commits; scope limits marked. | Covered; proposed coordinate UI transform still requires fixture validation. |
| O4: Inspect pinned code and issue/fix/regression/release history or justify equivalent | PouchDB 9.0.0 pinned replication/IndexedDB code and conflict tests; release history; issue #8298 treated only as an old, stale risk report with no applicability inference. Astropy v8.0.1 source/tests also inspected. Remaining applicability gaps are explicit. | Covered with gaps disclosed; no tests were run. |
| O5: Compare exact frozen plan sections and dispositions | A-P1–A-P7 table retains existing coverage and marks keep/amend/replace, with reasons and evidence. | Covered. |
| O6: Complete proposed changes, choices, optional leads, uncertainty, conditions, validation | Recommendation, alternatives, full lifecycle, uncertainties, optional leads, and six proposed observable acceptance checks are in `artifact.md`. | Covered; proposed checks are not reported as executed. |
| O7: Manageable integrated scope | Ingest/provenance, identity, annotations/collaboration, retention/deletion, access, errors/recovery, and handoff/export are addressed without expanding into excluded science or build tasks. | Covered. |

## Claims checked or repaired during self-critique

1. **FITS time is not a generic timestamp.** The source standard ties `DATE-OBS` to an HDU time system/scale, states the usual start-of-observation interpretation, and documents `TIMESYS` behavior. The proposal retains raw text and parser status instead of flattening every source into a presumed UTC fact.
2. **WCS and display order are not interchangeable.** The cited Astropy docs, pinned implementation, and tests distinguish zero/one-based origin and `(x,y)` vs `(row,column)`. The proposal requires an explicit saved convention and transform test; it does not claim that the club’s headers are valid WCS.
3. **Hash deduplication is not semantic identity.** The plan’s proposed byte-level retry key is kept for blob integrity, but records remain distinct for separate import and observation events.
4. **Offline sync does not resolve human meaning.** PouchDB documentation and pinned tests demonstrate immediate revision rejection and eventual competing branches. A deterministic winner is not treated as conflict resolution; the recommended API uses conditional edits and preserves the stale draft.
5. **Database-level membership is not private/public record ACL.** CouchDB’s documented database member capability reads/writes all ordinary documents in that database. The proposal requires application authorization for each endpoint and does not present one shared DB as a sufficient privacy design.
6. **Local browser storage is not the only durable copy.** The current WHATWG Storage Standard permits best-effort bucket removal under storage pressure. The proposal makes local-only/pending work visible and offers recovery/export; persistence requests are conditional, not a guarantee.
7. **Package checksums do not establish scientific truth or recall exports.** BagIt is used as a verifiable transfer shape, not as a signature, archival guarantee, or remote deletion mechanism.

## Performed checks versus proposed checks

**Actually performed:** validated the brief and plan hashes/byte counts against the exact map; retrieved 28 selected public sources with HTTP 200; recomputed each captured body’s bytes and SHA-256 against `source-map.json`; inspected the pinned source/test code and documentation locators. This was source/evidence QA only.

**Not performed:** PouchDB or Astropy tests, application code/build, package installation, browser testing, synthetic FITS parsing, ingest simulation, conflict simulation, export/restore, or access-control tests. Those remain proposed acceptance checks in `artifact.md`; no scientific correctness test was run.

**Unresolved objections and conditions:** real input formats and representative file sizes are unknown; no club host or responsible operator is identified; authentication provider and threat model are unchosen; expected simultaneous editing and whether notes need live co-editing are unknown; retention and purge authority are unspecified; preview/WCS conversion support is not validated against club data. These uncertainties are recorded rather than answered from excluded inputs. No independent reviewer was run and no reviewer feedback was read or incorporated.

## Deliverable check

- `artifact.md` — full integrated proposal and exact A-P1–A-P7 dispositions.
- `source-map.json` — source identities, exact source URLs/access times/version/commit/path/locator and capture digests.
- `sources/` — selected captured public response bodies.
- `preservation_check.md` — this scope/obligation/self-critique record.
