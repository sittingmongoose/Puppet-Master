# Public-source index — final proposal

Source identities, exact URLs, version/commit where applicable, locators, access UTC, observed operation, governing conditions, and applicability are recorded in [source-map.json](../source-map.json). Dates are access times after read-only web retrieval. These are source reviews, not product tests.

| ID | Source | Use |
|---|---|---|
| S01 | [ODK Collect v2026.3.5 release](https://github.com/getodk/collect/releases/tag/v2026.3.5) | Release tag/commit. |
| S02 | [ODK Central releases](https://github.com/getodk/central/releases) | Current release tag/commit. |
| S03 | [Managing Forms in Collect](https://docs.getodk.org/collect-forms/) | Draft, finalized/queued state, edit settings. |
| S04 | [Managing Submissions in Central](https://docs.getodk.org/central-submissions/) | Review state, history, CSV ZIP and media exports. |
| S05 | [Managing Forms in Central](https://docs.getodk.org/central-forms/) | Form versioning and older-submission exports. |
| S06 | [OpenRosa metadata](https://docs.getodk.org/openrosa-metadata/) | Unique instance ID and revision link field. |
| S07 | [ODK metadata questions](https://docs.getodk.org/form-question-types/) | Device clock limitation. |
| S08 | [Installing ODK Central](https://docs.getodk.org/central-install/) | Managed/self-hosted tradeoffs. |
| S09 | [KoboCollect data collection](https://support.kobotoolbox.org/data_collection_kobocollect.html) | Offline workflow and local retention. |
| S10 | [Kobo system fields](https://support.kobotoolbox.org/viewing_validating_data.html) | Version, submission IDs, root UUID, server receipt. |
| S11 | [Kobo editing/deleting](https://support.kobotoolbox.org/editing_deleting_data.html) | Corrections, edit side-effects, undo limits. |
| S12 | [Kobo exports](https://support.kobotoolbox.org/export_download.html) | XLS/CSV and media export choices. |
| S13 | [Kobo manual upload](https://support.kobotoolbox.org/manual_upload.html) | Experimental ZIP recovery; duplicate-language conflict. |
| S14 | [Kobo external CSV](https://support.kobotoolbox.org/pull_data_kobotoolbox.html) | Lookup/preload data, not a submission import. |
| S15 | [Kobo account/server setup](https://support.kobotoolbox.org/creating_account.html) | Public servers, free plan, private-server caveat. |
| S16 | [CouchDB 3.5.1 conflicts](https://docs.couchdb.org/en/3.5.1/replication/conflicts.html) | Revision leaves and default winner. |
| S17 | [ODK issue #4589](https://github.com/getodk/collect/issues/4589) | Historical same-ID/different-payload retry failure. |
| S18 | [ODK forum report](https://forum.getodk.org/t/unable-to-edit-forms-that-fail-to-send/34867) | v2021.2.4 edit restriction and field impact. |
| S19 | [ODK Central API changelog](https://docs.getodk.org/central-api-changelog/) | Version introductions for edits/review/formVersion. |
| S20 | [Kobo data storage](https://support.kobotoolbox.org/data_storage.html) | AWS location and ten-export retention. |
| S21 | [ODK Central issue #1612](https://github.com/getodk/central/issues/1612) | Public backend test code on attachment retention across submission revisions. |

Applicability notes: S01/S02 are the current release tags seen at retrieval; living documentation is not pinned to those binaries. Kobo pages give last-updated dates but often no tested app version. S17/S18 are historical and do not establish a current regression. S16 is a database analogue, not a survey product. S21 is test code inspected in an issue body, not a test run. Product validation is NOT_RUN.

## Retained-author primary-source rechecks

These read-only rechecks address the independent critic's three findings. Exact original source identities and versions remain under the same IDs in [source-map.json](../source-map.json); the rechecks are supplemental fields and do not rebind those IDs.

| ID | Rechecked source | Observation and condition |
|---|---|---|
| S03 | [Managing Forms in Collect](https://docs.getodk.org/collect-forms/) | Collect edits to finalized/sent forms are off by default, require client_editable, apply only while on-device, use the original form version, and manually sent edits must be ordered (lines 181-198). |
| S04 | [Managing Submissions in Central](https://docs.getodk.org/central-submissions/) | Web edits create a new submission version/activity; prior-version viewing is described as future availability, so recoverability is not assumed for the selected build (lines 303-317). |
| S11 | [Editing and deleting your data](https://support.kobotoolbox.org/editing_deleting_data.html) | Web edits can alter/remove answers under current form logic; raw edits cannot be undone and should be logged externally; roles can separate edit/delete permissions (lines 10-13, 19-27, 40-61, 122-131). |
| S12 | [Exporting and downloading your data](https://support.kobotoolbox.org/export_download.html) | XLS is .xlsx and supports repeats; CSV omits repeats; timezone data is dropped unless dates are exported as text (lines 28-40, 67-74). |

Read-only page responses were observed by actual clock samples 2026-10-10T04:38:16Z–2026-10-10T04:41:41Z; exact per-request timestamps were not exposed. These checks and the full critic packet are research only. No form, server, account, export or correction workflow was operated.
