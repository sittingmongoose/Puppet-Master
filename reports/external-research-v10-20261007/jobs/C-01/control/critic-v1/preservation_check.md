# C-01/control/critic-v1 — preservation and execution check

## Assignment and evidence boundary

- **Stage:** exactly C-01/control/critic-v1. Required Goal was created once and confirmed ACTIVE before Source work; activation-only notification was sent once to the supplied parent thread with request ID `er10-C-01-control-critic-v1-active`. Native Goal terminal confirmation is pending after these files are saved.
- **Admitted inputs:** exact task input map, its named case BRIEF.md and frozen PLAN.md, exact own-arm researcher-v1 artifact/source-map, public primary sources freshly captured for this critic. The input map, brief, plan and own predecessor paths/hashes are recorded in `source-map.json`.
- **Excluded:** other arms/repetitions, campaign results/state/reviews/evaluator keys, other answers/caches, parent history, credentials/secrets, repo canon, WorkNodes and product build. No pm-mail, nested workers, external runners, worktree, purchase, account change, canonical Plans/main change, or product build was used.
- **Write boundary:** scientific outputs and raw public-source response bodies are under this critic stage directory only. No temporary files outside it were created.

## Full scientific obligations retained

| Obligation | Retained in artifact | Status / evidence boundary |
|---|---|---|
| **O1 — Open user-level discovery before plan narrowing** | “Evidence-led mechanism comparison” records discovery from the club brief: Automerge local-first sync, CouchDB replication, W3C annotation/Media Fragments, and IIIF image delivery. Searches preceded reading PLAN.md and predecessor proposal. | **Done.** Public-primary results captured freshly as D01–D04; later tus/Yjs/FITS/BagIt sources were selected to verify consequential claims. No assigned source/defect catalog was used as an answer key. |
| **O2 — Compare substantially different mechanisms, competitors/analogies, options and trade-offs** | Central authoritative service + local queue vs local-first CRDT (Automerge/Yjs) vs CouchDB multi-master conflict leaves vs BagIt packet exchange. Benefits, operational costs, semantics and decisions are explicit. | **Done.** Recommendation conditional on operator/host acceptance; true shared offline work remains unmet by a delayed-upload queue. |
| **O3 — Verify consequential semantics, units/coordinates, release boundaries/applicability; distinguish evidence/inference/proposal** | tus byte offsets/lengths and conditional 409; `xywh` pixel frame and exact preview target; FITS time context; digest vs record identity; BagIt integrity limit; explicit evidence vs design inference vs open deployment questions. | **Done with stated limits.** Version/release and applicability are recorded in `source-map.json`; protocol/spec claims are not presented as application guarantees. |
| **O4 — Pinned code and pertinent issue/fix/regression/release history, or justified equivalent with gaps** | tusd v2.10.1 source at commit `388a27cb81c33b2349e0308b5e97e23797e86fd9`, issue #1386, PR #1397 patch/tests and release API; Yjs v13.6.33 source/test at `9ea3a4fb57b814292ce18dfd13c4f422e44e6c5c`, issue #768, fix `713a2895e78d13dd6cc257fdd4d46dbdec6d4fa7`, release API. | **Done for the two implementation histories used to assess researcher claims.** Code and regression test were inspected, not executed. CouchDB and Automerge are mechanism alternatives, not selected implementations; their code/release history remains a prerequisite if either becomes a candidate component. No database/host/storage adapter was selected. |
| **O5 — Exact frozen PLAN section dispositions, including existing coverage** | A-P1 through A-P7 table says keep/amend/replace/defer/unresolved; retains scope, originals, human review, portability and proposed validation, with specific evidence/conditions. | **Done.** Frozen plan checksum matches admitted input map. |
| **O6 — Complete integrated proposal, optional opportunities, uncertainty, conditions, observable validation** | Integrated records, ingestion, provenance, annotation, collaboration, access, retention/deletion, export, alternatives, unresolved decisions and six observable validation scenarios. | **Done.** All six tests are proposals, not completed checks. Optional RO-Crate/OAL/IIIF/CRDT paths remain optional. |
| **O7 — Manageable integrated scope for ingest/provenance, identity, annotation/collaboration, retention/deletion, access, recovery, handoff/export** | Integrated planning proposal and exact-plan dispositions cover every listed lifecycle area while keeping the group/scope bounded. | **Done.** No scientific correctness claim is made for any image, metadata, conversion or interpretation. |

## Corrections and objections preserved for a final reviser

1. Keep the central-service proposal provisional. It satisfies later connected review after offline intake, not live shared review while disconnected; an operator, host, internet reachability, backups, account lifecycle, security and retention add work. Host affordability/maintainability is unverified.
2. Preserve stable IDs and SHA-256 as distinct mechanisms. A digest is about bytes/transfer equality, not observation identity or truth.
3. Preserve the `tusd` #1386 condition: reproduction requires experimental IETF draft opt-in (`-enable-experimental-protocol`, off by default); v2.10.1 records PR #1397; do not generalize to default tusd or all adapters. The per-upload cap does not supply authentication, global quota or permission checks.
4. Pin annotations to exact immutable preview bytes plus dimensions/orientation/transforms. Standards define selector representation, not usable UI, client support, permission, storage or automatic region remapping.
5. A stale-write token rejects stale updates; the app must keep drafts and implement comparison/merge/review. 412 is not a merge.
6. FITS time conventions are conditional on supported FITS inputs and do not validate a header or generalize to mixed camera formats. BagIt hashes payloads but does not make their manifest semantically true.
7. Yjs issue #768 fix and release apply to a narrow observer-path regression; they do not establish suitability for this application. The file records the code/test pin and says the test was inspected, not executed.
8. Keep private/public distinction, no silent latest-revision-wins, no silent annotation remapping, no automatic scientific classification, no telescope control/reduction/prediction/social scope, and inability to recall previously downloaded exports.

## Executed work vs proposed checks

**Actually executed:** read exact admitted text inputs; completed open web discovery; fetched raw HTTP response bodies for D01–D18 from the listed public-primary endpoints into `sources/`; recorded request-start UTC, final URL/status, release/commit/path/locator, bytes and SHA-256 in `source-map.json`; inspected the captured standards, tusd/Yjs release and issue metadata, pinned implementation/test/patch files, CouchDB and Automerge docs; manually searched relevant source locations and extracted FITS PDF text. This is source inspection, not a product test.

**Not executed:** application build or test; tus/tusd or Yjs regression tests; actual upload/network interruption; storage-adapter, auth, access, retention/deletion or backup test; image decode/conversion or coordinate UI test; FITS/OAL schema validation; hosting cost or reliability check; astronomy ground-truth check. Proposed validations are explicitly labeled **NOT executed** in artifact.md.

## Final handoff condition

Deliver exactly these scientific files plus the required captures directory:

- `artifact.md` — integrated proposal, critique and exact A-P1–A-P7 dispositions.
- `source-map.json` — admitted-input digests and D01–D18 primary capture metadata.
- `preservation_check.md` — this obligation, correction and execution ledger.
- `sources/` — raw response-body captures identified by D01–D18.

Goal completion is appropriate only after these files and source map are present and the native tool confirms terminal status on the same Goal ID. Do not describe proposed tests as executed.
