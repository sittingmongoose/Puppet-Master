# Independent discovery: reconnect-safe volunteer observation intake

**Run/stage:** A2-01-control / investigator  
**Discovery input:** the complete brief at `control/inputs/brief.md` (read before research). The released plan was not available or consulted for this discovery.  
**Research boundary:** public primary documentation, source history, and versioned release records; no product, account, installation, purchase, service write, or implementation check was performed. Source identities and bounded evidence notes are in [`sources/index.md`](sources/index.md) and [`source-map.json`](source-map.json).

## Early recommendation

For a 25-person pilot with intermittent connectivity and Android devices, start by evaluating **ODK Collect + ODK Central**. Its current documentation gives a directly relevant local Draft → Finalized/Ready to send → Sent workflow, and its server retains submission and form version information, review states, comment/activity, and downloadable CSV tables plus media. ODK Cloud is the managed-hosting option; Central can also be self-hosted, which adds an operator duty. This is a product fit hypothesis, not a tested result or final procurement decision. Use versioned forms and require durable IDs and a deliberate coordinator workflow before moving any field data into a current-view projection.

Keep **ArcGIS Survey123** as the second full candidate when the charity already has ArcGIS Online/Enterprise ownership and a GIS-capable coordinator. The field app saves offline submissions in Outbox and sends them after reconnection; offline feature-layer sync is a publishing choice and is off by default. Export supports CSV and GIS formats, while edits, permissions, hosted feature-layer configuration, and attachment keywords create more ArcGIS-specific operating constraints. A public survey can be opened without signing in, but owner/stakeholder access and correction permissions still require a deliberate deployment design.

Use **CouchDB 3.5.1 replication** as an analogous sync model, not as the recommended volunteer survey product: stable document IDs, per-document revisions and checkpoints help explain idempotent transfer and recovery. Conflicting leaves are retained while a deterministic winning revision is surfaced; application owners still decide what a conflict means. That model is instructive for preserving corrections, but adding a general-purpose replicated database to this small pilot would add engineering and operational work.

## Discovery findings and product implications

### Offline creation, delivery, retries, and state

ODK Collect documents editable Drafts, finalized offline forms in a Ready to send list, and Sent forms after upload. Finalized items are normally not editable. Starting with Collect v2025.2.0 and Central v2025.1.4, an opt-in `client_editable=true` form can allow finalized or sent submissions still on the device to be edited; each edit is tracked in Central, uses the form version originally used, and manually queued edits must be sent in order. If a client loses the server response after Central accepted a POST, a user retry must be treated as uncertain delivery: query by stable submission identity and reconcile before generating anything new. Preserve the exact original payload for transport retries. ODK’s API documents `instanceId` uniqueness and a 409 when that ID already exists. A duplicate-key response is therefore a reconciliation signal, not permission to make a new observation.

Survey123’s Android field app exposes offline Outbox items and lets the user send them after connectivity returns. Its Sent-folder editing is disabled by default; Inbox/Sent coexistence can leave another device’s update out of date. This is a workable option where the ArcGIS team, permissions, feature-layer sync, and maintenance are already in place, but should be tested against the intended volunteer access model.

Proposed coordinator-facing states should remain distinct: `Draft (device only)`, `Queued/offline`, `Sending/receipt unknown`, `Received (with server_received_at)`, `Late arrival`, `Duplicate candidate (retained for investigation)`, `Correction received (linked to original)`, and a human-reviewed display state. The queue must preserve payload, observation ID, attachment IDs, and attempt history across retry. Server receipt time describes ingestion, not when the field visit occurred. A delivery retry repeats one observation identity; a correction is a new, linked change/event; two apparently similar but separately identified visits remain separate records until a human investigates.

### Stable identity, forms, time, and photos

ODK’s OpenRosa metadata requires a unique `instanceID` per submission, identifies forms with `form_id` plus `version`, and documents client `timeStart`/`timeEnd`. Central exposes server receipt `createdAt`; its current APIs and exports carry form-version metadata. For the pilot, use separate `site_code`, a generated immutable `visit_id`, `observation_id`/ODK `instanceID`, `form_id`, and `form_version`. A site may have repeated visits, so site + a nearby timestamp is not a key. Store the volunteer-entered observation time and its precision/time-zone or “unknown” qualifier separately from the server’s UTC receipt time. Treat the device clock value as uncertain; never order corrections, infer exact lateness, or deduplicate solely from it. This clock policy is a design recommendation, not a claim that a phone timestamp is accurate.

A photo should be an attachment entity linked by `observation_id` (or correction event), form question key, and a generated stable `attachment_id`. Retain original filename, MIME type, byte size, and preferably a content digest to detect repeated transfer; retries reuse the same attachment identities and bytes. Limit the pilot form to three images. Do not request GPS, add a geopoint, extract or display location from photo EXIF, or use any photo-derived location. Preserve the submitted original; do not remotely delete it. Decide separately whether a privacy-preserving derivative is needed before publishing/exporting photos.

ODK Central keeps old form submissions when a new form version is published, but a default export uses the current form definition and may omit removed fields; export options can include deleted fields. Its CSV/ZIP export separates the root table, repeat tables, and a `files/` tree grouped by instance ID. Survey123 provides CSV/Excel and GIS exports; choice columns use stored choice names, and its attachment keywords matter for association when exporting/reusing data. The coordinator should receive a repeatable export recipe and an export manifest connecting row IDs and attachment IDs, not assume one flat CSV preserves every relationship.

### Corrections, duplicates, and owner authority

Keep original observations immutable in the proposed evidence model. Represent an explicit correction as an append-only correction event with its own ID, `corrects_observation_id`, reason, author, correction time, received time, and changed fields or replacement attachment references. The derived “current view” is only a projection over those events. If the steward chooses “replace in current view,” retain the original and correction history behind it; if the steward chooses “beside,” show both. No client retry, similarity score, or sync engine chooses a merge winner. Candidate duplicate rules may use exact stable identity first, then flag likely matches on site, entered observation time, answer signature, and image digest for a person to inspect. Preserve all candidates and investigation outcomes.

The two given owner choices are carried verbatim as authoritative: the field coordinator accepts duplicates for investigation; the data steward decides whether a correction replaces the current view or appears beside it. These choices do not imply silent deduplication or an automatic merge. A useful optional product setting is whether to enable ODK’s versioned client edits or use a separate correction form; pilot both workflows with volunteers before settling the affordance.

### Bounded reconnect history

ODK Collect issue #4589 (opened 2021-06-02) describes a real delivery-ambiguity failure: the server may already have accepted a submission but the response is lost; opening/editing the “failed” local submission changes its XML/time-end, and a resubmission under the same ID is then rejected because the ID exists with different XML. Maintainers discussed this limbo state. Commits including `0bc6cde` changed the local sent/unsent query to exclude `STATUS_SUBMISSION_FAILED` from editing and added an integration resubmission test. The issue was closed by Collect PR #4655; the official Collect v2021.2.0 release dated 2021-07-27 lists that fix. This is a bounded, applicable warning about retrying unchanged data, not evidence that the current released app still has the bug or that the fix handles repeated independent observations. A later opt-in edit capability (Collect v2025.2.0 / Central v2025.1.4) explicitly enables versioned correction of finalized/sent submissions; it is a different, tracked action from editing a failed transport attempt.

## CSV import option

Retain coordinator-reviewed legacy CSV import as an **authorized option**, not a mandatory pilot capability and not a proven feature of either selected survey product. Public ODK docs establish CSV export and XML/API submission creation; they do not establish a native CSV-to-submission import. Do not generalize that finding into “import is impossible.” If an import adapter is supported, require a coordinator preview, frozen field/version mapping, row-level validation with reject reasons, stable source-row identity and import-batch/source-file digest, generated IDs that cannot collide with live submissions, attachment mapping, idempotent re-runs, and explicit duplicate flags. It must never overwrite a field observation silently. If a small, safe mapping cannot be demonstrated during the pilot, keep import deferred as an authorized later option and document the exact blocker rather than removing the scope.

## What remains to investigate or decide

- Confirm the current released Collect/Central and Survey123 versions, Android device support, data retention/security settings, managed hosting terms, identities and permissions, and local retention policy before any pilot.
- Check form/update behavior with submissions captured under the older form version while volunteers are offline; preserve the captured version and avoid breaking unfinished offline work.
- Run controlled delivery tests with connection loss after server receipt, retry of the exact payload, repeated visit IDs, attachment interruption, and edits arriving out of order.
- Get the data steward’s required current-view policy. The assigned brief already establishes that the steward owns it; no policy is inferred here.
- Test the coordinator CSV workflow only as a proposal until the adapter and attachment/identity mapping are demonstrated.

## Validation status boundary

| Check | Status | Result or next action |
|---|---|---|
| Public primary docs/source/release history review | Executed as research only | Sources S01–S14 are identified in `source-map.json`; this did not exercise either product. |
| Offline entry, photos, upload, retry after server receipt, and late arrival | NOT_RUN | Proposed pilot scenario: use two Android devices and a controlled server; interrupt at each transport stage and verify identity/payload/attachment preservation. |
| Correction version history and out-of-order edits | NOT_RUN | Proposed on a nonproduction form with both phone and coordinator edits. |
| Duplicate candidate flagging and owner-selected current view | NOT_RUN | Proposed with synthetic records; retain originals and require coordinator/steward action. |
| Legacy CSV import/re-run and attachment mapping | NOT_RUN | Proposed only if an adapter is built; no product capability is claimed as executed. |
| Device-clock uncertainty and no photo-location extraction | NOT_RUN | Proposed with a test device clock offset and photos containing EXIF; verify no inferred coordinates are surfaced. |
| Product install, accounts, or production deployment | NOT_RUN | None performed or needed for this research stage. |

## Native Goal activation record

Directly observed from the native Goal creation tool: objective exactly as configured in `freeze.json`; `threadId=01a12401-f364-7642-9ce6-0e342871af49`; status at creation `active`; `tokensUsed=0`; `timeUsedSeconds=0`; raw `createdAt=1791605500`; raw `updatedAt=1791605500`; `remainingTokens=null`; `completionBudgetReport=null`. Tool output identifies both timestamps as numeric fields but does not label their timezone/provenance beyond the native tool; any separate timestamp semantics are UNKNOWN. Completion status will be recorded only after terminalization is directly observed.
