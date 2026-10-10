# Critic source index

This index preserves the investigator source IDs and exact URLs without rebinding. Original exact source identity fields and access_utc values remain in ../source-map.json. Critic rechecks used read-only web.open/web.find; their individual request UTC timestamps were not exposed. No source code or product workflow was executed.

| ID | Source | Critic check |
|---|---|---|
| S01 | [ODK Collect release v2026.3.5](https://github.com/getodk/collect/releases/tag/v2026.3.5) | Release title/date/verified commit and latest release tag. |
| S02 | [ODK Central release list and v2026.3.1 metadata](https://github.com/getodk/central/releases) | Latest release metadata in release list. |
| S03 | [Managing Forms in Collect](https://docs.getodk.org/collect-forms/) | Download forms; draft/finalize/send; editing finalized or sent forms, lines 124–198. |
| S04 | [Managing Submissions in Central](https://docs.getodk.org/central-submissions/) | Review states, attachment warnings, exports/media, OData and submission edits; lines 180–241, 294–317. |
| S05 | [Managing Forms in Central](https://docs.getodk.org/central-forms/) | Form version naming and previous submissions/exports; lines 248–261. |
| S06 | [OpenRosa Metadata Scheme](https://docs.getodk.org/openrosa-metadata/) | Required/optional OpenRosa metadata and revision linkage; lines 193–232. |
| S07 | [ODK Question Types: metadata](https://docs.getodk.org/form-question-types/) | Metadata question section on start/end/today; lines 2406–2432. |
| S08 | [Installing ODK Central](https://docs.getodk.org/central-install/) | Managed hosting vs self-hosting; lines 119–164. |
| S09 | [Collecting data using KoboCollect](https://support.kobotoolbox.org/data_collection_kobocollect.html) | Offline collection, queue/finalize and Delete after send; lines 49–115. |
| S10 | [Viewing and validating Kobo data](https://support.kobotoolbox.org/viewing_validating_data.html) | System-generated submission fields; lines 54–65. |
| S11 | [Editing and deleting Kobo data](https://support.kobotoolbox.org/editing_deleting_data.html) | Web/raw edit paths and edit side effects; lines 10–11, 44–61, 122–131. |
| S12 | [Exporting and downloading Kobo data](https://support.kobotoolbox.org/export_download.html) | Export types/repeats/media/timezone; lines 30–40, 67–74. |
| S13 | [Manually uploading submissions to KoboToolbox](https://support.kobotoolbox.org/manual_upload.html) | Experimental warning, app-instance ZIP recovery and duplicate wording; lines 7–46. |
| S14 | [Pulling data from an external CSV](https://support.kobotoolbox.org/pull_data_kobotoolbox.html) | pulldata external CSV purpose, index and upload flow; lines 14–31, 45–80. |
| S15 | [Creating a KoboToolbox account](https://support.kobotoolbox.org/creating_account.html) | Global/EU servers, Community Plan and collaboration; lines 7–50. |
| S16 | [Apache CouchDB 3.5.1 replication and conflict model](https://docs.couchdb.org/en/3.5.1/replication/conflicts.html) | Default deterministic winner, conflict visibility and resolution; sections 2.3.1–2.3.4. |
| S17 | [ODK Collect issue #4589: failed submission editing](https://github.com/getodk/collect/issues/4589) | Issue description/error and closure activity; lines 150–164, 426–439. |
| S18 | [ODK forum report: failed submissions no longer editable](https://forum.getodk.org/t/unable-to-edit-forms-that-fail-to-send/34867) | Version, failed-send behavior, field impact and maintainer response; lines 15–43. |
| S19 | [ODK Central API changelog](https://docs.getodk.org/central-api-changelog/) | Central API changelog: formVersion/edit/version/review feature notes. |
| S20 | [KoboToolbox data storage](https://support.kobotoolbox.org/data_storage.html) | AWS storage and export retention; lines 7–15. |
| S21 | [ODK Central issue #1612 with backend attachment-purge test code](https://github.com/getodk/central/issues/1612) | Issue condition and embedded backend test; lines 159–263. |

The critic source map records release/version context, exact locators, access time, operation, governing conditions and applicability for every ID, with independent-check notes and limitations.
