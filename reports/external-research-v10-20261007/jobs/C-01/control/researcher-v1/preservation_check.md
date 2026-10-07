# Preservation and obligation check — C-01/control/researcher-v1

## Assignment and lifecycle

- Exact stage: `C-01/control/researcher-v1`.
- Exact input map: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/C-01/control/researcher-v1/input-map.json`.
- The input map declares no own-arm predecessor files or sources. None were read. No sibling arm, campaign state/results, reviews, parent history, costs, evaluator key, or other-arm answer was accessed.
- Created one fresh native Goal for this exact assignment, then used native get to confirm the same Goal ID `01a117f1-3a9a-7720-a5e9-b7104d5edd31` was ACTIVE. Immediately afterward, sent one activation-only notice to the supplied parent thread with request ID `er10-C-01-control-researcher-v1-active`. The notice contained stage, Goal ID, and ACTIVE status only.
- Read the actual cwd Puppet Master `AGENTS.md` and `/home/sittingmongoose/.codex/AGENTS.md`. No `AGENTS.md` exists under the admitted assignment tree. The T3 rules supersede the global mailbox/worker sections inside T3; no pm-mail, worker, external runner, nested worker, worktree, browser, or server operation was used.
- The fixed runtime budget was read and not reset: stage deadline `2026-10-07T20:17:26.822552+00:00`; whole-arm deadline `2026-10-07T20:42:26.822552+00:00`; 2-minute writing reserve. Scientific files were saved inside the stage directory before native terminalization.

## Preservation of the brief and constraints

- Treated the telescope notebook as hypothetical. All architecture and behavior are labelled proposal, inference, documented behavior, implementation evidence, or unvalidated as applicable.
- Kept one-club scope and the exclusions: telescope command/control, autonomous observing, precision scientific reduction, sky-event prediction, public social networking, scientific correctness claims, product build, WorkNodes, canonical Plans/main, account modification, purchase, private repository, and third-party issue/PR publication.
- Preserved the workflow: prepare a session list; ingest one session’s files and notes; inspect images; attach comments/regions; review uncertain entries; share a selected packet; retain and explain original/derived-image/annotation provenance; revisit annotations after reprocessing; recover interrupted ingest; distinguish private drafts from club-visible content; define concurrent-edit behavior.
- Open discovery began from the user-level need and compared mechanisms before the exact section-by-section PLAN disposition. The frozen PLAN was treated as prospective and unvalidated, not as canon or an answer key.
- Public captures are stored under this stage’s `sources/`; `source-map.json` records 39 successful source captures with URL, UTC access time, version/release/commit where available, locator, path, byte count, and SHA-256. Four admitted input files are mapped separately. No arbitrary installer or software execution occurred.

## Full scientific obligations

- **O1 — Open discovery:** addressed through broad discovery from session capture, offline entry, later collaborative review, and portable handoff; then narrowed to the seven exact plan sections. Discovery includes Observation Manager/OpenAstronomyLog as a domain analogy.
- **O2 — Mechanism comparison:** compares a central revisioned service with local intake against a local-first Yjs/CRDT mechanism, and separately evaluates packet-first interchange. Includes trade-offs and conditions.
- **O3 — Semantics and pinning:** records tus 1.0.0 byte-offset/length semantics; `HEAD`/`PATCH`/409 behavior; FITS v4.0 time-scale qualifications; pixel `xywh` units; W3C target/selector semantics; RFC 9110 `If-Match`/412; BagIt v1.0 and RO-Crate 1.3. Final implementation pins use tusd v2.10.1 commit `388a27cb81c33b2349e0308b5e97e23797e86fd9` and Yjs v13.6.33 commit `9ea3a4fb57b814292ce18dfd13c4f422e44e6c5c`. Applicability limits are stated.
- **O4 — Code and history:** inspected tusd v2.10.1 handler/hooks code and tests; followed #1320 → PR #1337 → current pinned code/test; inspected #1386 → #1397 → v2.10.1 release. Inspected Yjs v13.6.33 update/transaction code and regression test; followed #768 report → fix commit → v13.6.33 release. Tagged source tests were inspected but not run.
- **O5 — Exact plan disposition:** A-P1 through A-P7 each has a keep/amend/replace/defer/unresolved disposition tied to evidence or an explicit condition.
- **O6 — Complete proposal:** includes decisions, optional OAL/RO-Crate/Yjs leads, uncertainties, retention/hosting conditions, source identities, self-critique, and observable validation proposals.
- **O7 — Integrated scope:** includes ingest state, provenance, record identity, annotations and collaboration, member access/private publication, withdrawal/erasure/backups, interrupted-transfer recovery, and selected-session handoff/export.

## Checks performed versus proposed

**Actually performed:** verified BRIEF.md and PLAN.md SHA-256 against the exact input map; captured public primary-source response bytes; calculated hashes/byte counts for all captured sources in `source-map.json`; inspected pinned source, release, issue, patch, and test text; read and cross-checked current release/tag metadata. No runtime test, upload, image conversion, application build, or astronomy-data check was executed.

**Proposed only:** all checks in the artifact’s “Observable validation proposal” section, including metadata fixtures, forced transfer interruption, digest confirmation, annotation after reprocessing, two-member stale revision, authorization checks, withdraw/erase behavior, and offline package verification.

## Corrections and unresolved objections

- Interim discovery inspected tusd v2.9.2 and Yjs v13.6.32. Fresh release/tag APIs identified v2.10.1 and v13.6.33. The older captures are marked superseded in `source-map.json`; the artifact’s final release conclusions use the newer pins.
- Yjs v13.6.29’s event-path regression was fixed in v13.6.33 with a regression test. That establishes this narrow fix; it does not establish Yjs suitability for application permissions, data model, blob sync, or deletion.
- Remaining decisions: club-controlled host and backup owner; retention interval and erasure authority; actual input formats, sizes, devices, and supported preview pipeline; offline draft privacy on shared devices; and whether OAL/RO-Crate interoperability is needed. No missing evidence is treated as established behavior.
