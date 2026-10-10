# Bounded source index — A2-01-control / investigator

Each ID is stable and maps to the exact URL in [`../source-map.json`](../source-map.json); do not reuse an ID for a different URL. S01–S14 were directly reopened on 2026-10-10; access time recorded: **2026-10-10T04:14:55Z**. S15–S16 were reopened at **2026-10-10T04:21:28Z**. Evidence is summarized, not represented as product testing. Versions are stated only where the source provides them; rolling docs are not treated as pinned releases.

## ODK Collect and Central

- **S01 — Collect local states and client corrections** — [ODK Managing Forms in Collect](https://docs.getodk.org/collect-forms/), §§ Finalizing drafts; Sending finalized forms; Editing finalized or sent forms. Offline finalized forms appear in Ready to send; on-device corrections are opt-in from Collect v2025.2.0 + Central v2025.1.4, tracked in Central, use the original form version, and manually queued edits must go in order. Current page has no single deployed-build guarantee.
- **S02 — Identity and client time fields** — [ODK/OpenRosa Metadata Scheme](https://docs.getodk.org/openrosa-metadata/), §§ Form Identity, Version, Completed Form Metadata / Fields. Form ID+version distinguish form definitions; unique `instanceID` distinguishes a submission. `timeStart`/`timeEnd` are client timestamps; optional `deprecatedID` can link a revised submission where supported. This does not verify phone clock correctness.
- **S03 — Form lifecycle, permissions, versioned forms** — [ODK Managing Forms in Central](https://docs.getodk.org/central-forms/), §§ Form Drafts, Updating Forms, Older Form Versions. App Users need explicit Form access; old submissions persist when publishing a new version, but current-schema exports may omit removed fields unless export options include them. ODK Cloud managed hosting and Central installation paths are linked.
- **S04 — Exports, review and web offline exception** — [ODK Managing Submissions in Central](https://docs.getodk.org/central-submissions/), §§ Downloading Submissions as CSVs; Editing Submissions; Web Forms offline. CSV/ZIP may contain root table, repeat tables, and `files/` grouped by submission instance ID. An edit creates a new version and review state Edited. ODK Web Forms require connection to submit; Enketo queued auto-send depends on the form staying open.
- **S05 — Server ID/timestamp/API boundary** — [ODK Submission Management API](https://docs.getodk.org/central-api-submission-management/), §§ Submission identity; Creating a Submission; Getting metadata; export endpoints. Duplicate `instanceId` yields 409; `createdAt` means server receipt time; REST create takes XML and does not take attachments in that request. Reviewed docs establish CSV export, not a native CSV-to-submission import; this does not rule out external tooling.

## Bounded ODK issue/fix/release history

- **S06 — Report and maintainer analysis** — [ODK Collect issue #4589](https://github.com/getodk/collect/issues/4589). Opened 2021-06-02; reports a server-accepted body with a lost response, then same-ID/different-XML retry after editing the failed item. Maintainer discussion identifies this narrow limbo case.
- **S07 — Source-code change and regression witness** — [Collect commit 0bc6cde](https://github.com/getodk/collect/commit/0bc6cde). June 2021 source history excludes `STATUS_SUBMISSION_FAILED` from the editable unsent list and adds a form resubmission test. This is a code review only; no downloaded code was run.
- **S08 — Released boundary** — [ODK Collect v2021.2.0](https://github.com/getodk/collect/releases/tag/v2021.2.0). Released 2021-07-27 and lists PR #4655, “Prevent editing of submissions that failed to send.” This bounds the historical fix; it is not proof of current deployment state or exactly-once delivery.

## Survey123 alternative

- **S09 — Offline delivery** — [Survey123 Submit survey results](https://doc.arcgis.com/en/survey123/capture/field-app/submitsurveyresults.htm), Outbox procedure. Saves unsent survey in Outbox while offline; user sends it after reconnecting; post-submit editing depends on configuration.
- **S10 — Sync and sent-edit defaults** — [Survey123 Publish a survey](https://doc.arcgis.com/en/survey123/create/connect/publishsurvey.htm), Publish options and Sent folder. Feature-layer sync is off by default; Enterprise offline maps may need extra configuration; editing sent surveys is disabled by default.
- **S11 — Correction authorization and limits** — [Survey123 Edit existing survey data](https://doc.arcgis.com/en/survey123/capture/web-app/editexistingdata.htm), Individual response and Limitations. Editing requires owner or specific update privileges; attachments can be changed in supported edits; nested repeats are unsupported and older Enterprise attachment surveys are out of scope for that edit path.
- **S12 — Export tradeoffs** — [Survey123 View your results](https://doc.arcgis.com/en/survey123/analyze/viewresults.htm), Download results. CSV and GIS exports exist; CSV choice values are coded names, not labels; attachment keyword handling may matter for export/republication.

## Synchronization analogy

- **S13 — Restartable replication** — [Apache CouchDB 3.5.1 replication introduction](https://docs.couchdb.org/en/3.5.1/replication/intro.html), Replication procedure. Changes feeds and checkpoint documents enable restart after failure; directionality and continuous mode are explicit.
- **S14 — Conflict branches** — [Apache CouchDB 3.5.1 conflict model](https://docs.couchdb.org/en/3.5.1/replication/conflicts.html), Conflict behavior and leaf-revision examples. Conflicts can preserve multiple leaves, expose a winner, and leave resolution to the application. Analogy only: a survey coordinator must not inherit implicit last/winning-revision selection.

For locators, exact release/commit information, conditions, exceptions, access operations, and applicability, use the corresponding full record in `source-map.json`.

## Additional shortlist lead screened

- **S15 — KoboCollect offline use** — [KoboToolbox Collecting data using KoboCollect](https://support.kobotoolbox.org/data_collection_kobocollect.html), page last updated 2026-07-17. After initial form download, data collection works offline; settings control Draft / Ready to send / automatic send behavior, and default data retention keeps local data until manually deleted.
- **S16 — Kobo corrections and lineage** — [KoboToolbox Editing and deleting your data](https://support.kobotoolbox.org/editing_deleting_data.html), page last updated 2026-05-06. Corrections happen in the server product after KoboCollect submission; edit changes `_uuid` while `rootUuid` remains stable. Web-form edits can recalculate against latest form version; raw edits cannot be undone and require an external log. This makes Kobo a real candidate but not the main recommended comparator without additional change-history testing.
