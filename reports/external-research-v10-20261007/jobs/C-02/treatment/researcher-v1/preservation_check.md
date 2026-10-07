# Preservation and scientific-scope check

**Assignment:** C-02/treatment/researcher-v1  
**Inputs:** `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/C-02/treatment/researcher-v1/input-map.json`  
**Output set:** `artifact.md`, `source-map.json`, and `sources/` under this stage directory.

## Input and scope preservation

- Read the exact mapped hypothetical brief and frozen plan. Recomputed SHA-256 values match the map: brief `7943b8d93e04df133363b786fca60039f1e46cc9ee2701c930bb6dc04df9716f`; plan `5d6708c613038dc8e84a07b981e8d81b0215d6f972c8bffbb80521b0509b598f`.
- The map declares no own-arm predecessor files or sources. No other arm, repetition, campaign state/results, review, history, cost, evaluator key, sibling answer/cache, secret, or private repository was read. Source discovery used public primary sources selected from the brief.
- No product, account, service, canon, main branch, WorkNode, or build was created or changed. Research outputs and immutable captures are confined to the assigned stage directory. No nested workers or external candidate runners were started.
- Public text was treated as evidence only. No public issue/PR was created or changed, no purchase was made, and no external account was modified.

## Full obligation audit

| Obligation | Checked / preserved in the proposal |
|---|---|
| **O1 — Open discovery first** | Started from the club's user-level workflow and broad primary-source discovery before opening PLAN.md. The first pass found astronomy log exchange, portable package, and annotation standards; then compared central and local-first collaboration options. No assigned component list or defect key was followed. |
| **O2 — Mechanism comparison** | Compares a self-hosted authority with conditional revisions against Automerge-style local-first CRDT sync, including the package-transfer adjunct, OAL compatibility lead, and shared-live-database risk. Trade-offs and decision conditions are explicit. |
| **O3 — Semantics/version/applicability** | Records FITS v4.0 `DATE-OBS` time-scale and start semantics; Astropy 8.0.1 pixel origin and `(x,y)` versus array order; Media Fragments `xywh` pixel/percent and origin; W3C selector semantics; HTTP `If-Match` strong comparison; BagIt byte-integrity boundary; Automerge 3.5.0 conflict behavior. Unvalidated application-level consequences are labeled as proposals. |
| **O4 — Pinned code/history** | Inspected Astropy v8.0.1 code and tests at commit `7c5a9c124ce84c76992016e89631566ad398aff7`, Automerge 3.5.0 implementation/tests at `4d2a8f6bfecfb7f1e4fca126e6d2122ac526f903`, and OAL 2.1 schema at commit `59cc9dd4ecbd7569d90f86b0313e0430578f18fb`. Astropy issue reports and PR 20473 show proposed regression coverage but no merged fix in the pinned release. Automerge issue 889 is retained as an unresolved caution; its applicability to 3.5.0 was not proven. No upstream tests were executed. |
| **O5 — Exact plan comparison** | Dispositions are given for every frozen section A-P1 through A-P7, preserving already-covered scope and distinguishing keep/amend/replace/defer. |
| **O6 — Complete proposal and validation** | Artifact includes integrated workflow, identity/provenance, annotation, access, deletion/retention, recovery, handoff/export, option decisions, optional leads, limitations, open conditions, and observable proposed checks. It distinguishes source inspection/hash calculations from product/component tests. |
| **O7 — Bounded integrated scope** | Covers ingest, file and event identity, annotation/collaboration, private/public access, retention/deletion, interruption and recovery, backup/restore, and portable handoff. Keeps the user's explicit exclusions intact. |

## Claims checked, repaired, or deliberately limited

| Risky assumption | Preservation / correction in artifact |
|---|---|
| A submitted timestamp is necessarily UTC or a precise instant. | Preserve the raw value and source. FITS time scale may be non-UTC; do not infer a zone or interval interpretation. |
| Equal file hashes identify the same observation or processing event. | A hash identifies bytes for integrity/deduplication only. Keep logical asset and provenance identities separate. |
| A region on today's preview remains meaningful after replacing or reprocessing the image. | Bind it to a rendition ID/hash, dimensions, declared `xywh` unit, and origin. Keep the older target; require reviewed migration. |
| A WCS conversion or issue title proves behavior on every member file. | Pin Astropy 8.0.1 implementation; record the DEC-before-RA issues and closed, unmerged PR separately; applicability to club samples remains unvalidated. Do not use world-coordinate migration in the MVP. |
| “Last write wins” means most recent wall-clock edit, or a CRDT enforces club identity and approval. | Automerge documentation/code use an operation-ID winner plus a separate conflict view. Author metadata is opaque; application identity, visibility, retention, and conflict resolution remain separate work. |
| A valid BagIt package proves metadata or scientific interpretation. | BagIt verifies listed payload bytes only. It does not prove metadata provenance claims, image correctness, or scientific truth. |
| Hiding or deleting a record retracts exports and backup copies. | Distinguish withdrawal from hard deletion and state that already-exported copies cannot be recalled. |
| The proposed validation list records completed tests. | It is explicitly proposed only. No product or component test was run, no sample image was checked, and no isolated experiment was performed. |

## Governing constraints retained

The artifact retains: one hypothetical small club; practical and affordable public components; portability and no permanent commercial-account dependence; low-connectivity session entry with later collaborative review; private drafts versus club-visible publication; predictable edit conflicts; interrupted-import recovery; original/derived image and annotation lineage; provenance without claims of scientific truth; and a selected, inspectable handoff packet. It excludes telescope control, autonomous observing, precision scientific reduction, sky-event prediction, and public social networking. Specialized conversion remains conditional on later validation. The assignment is research/planning only; no canonical Plans writing, WorkNodes, build, account change, purchase, or publishing action was performed.

## Artifact integrity and remaining objections

`source-map.json` maps each source identity to its retrieval URL/time, version or commit, source path and locator, captured byte path, and SHA-256. The mapped brief and plan hashes were recomputed and matched. A final structural check confirmed the JSON parses, all 30 source IDs are unique, all 30 files under `sources/` are mapped exactly once, every stored byte count and SHA-256 matches, all artifact source IDs resolve, and the three required files are present. Source/test files were inspected as text, not executed. These are artifact-integrity checks, not product/component tests.

Unresolved evidence is intentionally visible: no real member files or sample session were supplied; accepted preview formats and size limits are unknown; a host/backup operator and retention policy have not been chosen; current OAL adoption in the club is unknown; no cross-version annotation migration is proven; no device clock was validated for offline capture; and the Automerge issue report was not reproduced against v3.5.0. These are conditions for future validation, not silently filled assumptions.
