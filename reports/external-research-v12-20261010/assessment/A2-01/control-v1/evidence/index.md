# Independent primary evidence — A2-01 control-v1

Read-only captures belong to this assessment, not candidate research. E identifiers never rebind candidate S/C/R identifiers. Raw HTML/patch is inert; no downloaded code was run. Full metadata and SHA-256 are in [../source-map.json](../source-map.json) and [../retrieval-manifest.json](../retrieval-manifest.json). Original hashes: [../original-inspected-manifest.json](../original-inspected-manifest.json).

## E01 — ODK Collect form lifecycle and client edits

[Primary source](https://docs.getodk.org/collect-forms/) · [Raw capture](E01.html) · [Text](E01.txt) · [HTTP metadata](E01.metadata.json)

Version: Living docs; explicit Collect v2025.2.0 / Central v2025.1.4 feature gate. Access: 2026-10-10T04:55:52.834275+00:00. Operation: Collect device-local Draft/Ready to send/Sent; opt-in edits of retained finalized/sent submissions.

Off by default; settings.client_editable=true. Edits use the original form definition, are tracked in Central, and manually queued edits must be sent in order. A Central-side edit makes that submission no longer editable from Collect. Entities are not updated by these edits.

Applicability: Final lines 11,25,38,47–56,62,101 and inherited S01/C01/R01. Conditional product fit and correction option are supported. Limit: No deployed versions observed. Final prose compresses the Central-edit lockout, retained explicitly in inherited source-map S01. Queue visibility beyond the device is an inference/proposal, not built-in evidence.

Locators: Finalizing drafts; Sending finalized forms; Editing finalized or sent forms (text lines 133–166).

Raw SHA-256: `2f2023a20521a9ae3565317549d01cd92db24da3f15aedc1b75dc19419bf687e`.

## E02 — OpenRosa metadata identity and client time

[Primary source](https://docs.getodk.org/openrosa-metadata/) · [Raw capture](E02.html) · [Text](E02.txt) · [HTTP metadata](E02.metadata.json)

Version: Living protocol documentation; no product build pinned. Access: 2026-10-10T04:55:52.835332+00:00. Operation: XForm identity/version and submission metadata.

Form version is a string. instanceID is required and universally unique; timeStart/timeEnd are optional ISO 8601 form-entry timestamps. deprecatedID identifies the preceding submission; consolidation is server behavior. IDs use scheme:value.

Applicability: Final lines 71–81, S02/C02; separates site/visit/event, form definition, reported observation time, and unverified client clock. Limit: Metadata is not proof of accurate device time, immutable audit history, or a correction display policy. Attachment IDs/digests are proposed application fields.

Locators: Form Identity; Version; Completed Form Metadata; ID constraints (text lines 138–205).

Raw SHA-256: `974bf68eb0f2ed0a6aea5713f25716d928706e88974bdf97d410af44065bc080`.

## E03 — Central form versions, access, and export schema

[Primary source](https://docs.getodk.org/central-forms/) · [Raw capture](E03.html) · [Text](E03.txt) · [HTTP metadata](E03.metadata.json)

Version: Living docs; drafting/version updates since Central 0.8. Access: 2026-10-10T04:55:52.838646+00:00. Operation: Publishing a new form version and exporting old submissions.

Explicit App User access is required. Prior submissions remain unchanged after republishing; default export uses current fields, with an option for previously removed fields. Reused fields retain their datatype, except conversion to text.

Applicability: Final 11,62,74 and S03/C03; version-preserving record model and export warning. Limit: Actual old-form intake, roles, and deployed schema compatibility remain untested; no universal arbitrary schema migration is promised.

Locators: Forms; Drafts; App User access (text lines 121–150); Updating Forms; Older Versions (text lines 189–212).

Raw SHA-256: `c852d7a6a8d1e2952d5f5c2f8dc89bcac4b5a30af61c374bc5480406f3415da9`.

## E04 — Central exports, review states, versions, and browser offline exception

[Primary source](https://docs.getodk.org/central-submissions/) · [Raw capture](E04.html) · [Text](E04.txt) · [HTTP metadata](E04.metadata.json)

Version: Living docs; review states since Central 1.2; diff display since 1.3. Access: 2026-10-10T04:55:52.841741+00:00. Operation: CSV ZIP download and submission review/version workflow.

ZIP includes root/repeat join CSVs and files/submission-instanceId directories. Filters affect exports. Edits create versions and Edited state. ODK Web Forms need connectivity to submit; Enketo offline queue auto-send needs the form open.

Applicability: Final 11,40–41,62; C-04 locator correction; inherited S04/C04/R02. Limit: Ordinary CSV export is not an audit export of every correction; the final correctly proposes checking history/export and does not claim this test ran.

Locators: Downloading Submissions as CSVs (text lines 172–186); Review States; Editing; Offline Web Forms (text lines 218–269).

Raw SHA-256: `9867abb3f0294f65155bb8e56a91bdc4d9dec7f6630ca1560a3b1375050dd1db`.

## E05 — Central REST submission management

[Primary source](https://docs.getodk.org/central-api-submission-management/) · [Raw capture](E05.html) · [Text](E05.txt) · [HTTP metadata](E05.metadata.json)

Version: Living API; attachment upload since 0.4, versions since 1.2, device metadata since 1.4. Access: 2026-10-10T04:55:52.844027+00:00. Operation: REST POST /v1/projects/{projectId}/forms/{xmlFormId}/submissions; expected attachment uploads; version retrieval.

POST requires XML Content-Type and creates from submission XML; attachments are separate expected slots. Existing instanceId returns 409. createdAt is ISO string server receive time, distinct from currentVersion.createdAt. Initial instanceId stays the logical submission ID; each version has its own ID.

Applicability: Final 29,39,50,62,73,77,91,95 and S05/C05/R03. Limit: Does not establish a native CSV importer. Different from Collect's OpenRosa retry endpoint (E19); the final's reconciliation advice is safe but its short 409 wording should be read with that endpoint scope.

Locators: Logical submission versus version identity (text lines 119–126); createdAt schema (text lines 210–220); Creating a Submission (text lines 397–405); Attachment upload; Submission Versions (text lines 2010–2080).

Raw SHA-256: `3e2e4c1a31743f5bd3ae03e9e51dbcf1a375c5c1d23e09eda227f8bd0831c948`.

## E06 — Collect issue #4589 original report and discussion

[Primary source](https://github.com/getodk/collect/issues/4589) · [Raw capture](E06.html) · [Text](E06.txt) · [HTTP metadata](E06.metadata.json)

Version: Opened 2021-06-02; closed 2021-07-07 by #4655. Access: 2026-10-10T04:55:52.953883+00:00. Operation: Lost server response followed by editing failed local XML and retrying the same instance ID.

A changed end timestamp can cause changed XML and server rejection. Maintainer analysis chooses failed-status edit exclusion rather than a blanket finalization lock. Discussion includes uncertainty and cancellation as another lead.

Applicability: Final 28,99–101; S06/C06. Historical bounded example, not current deployment diagnosis. Limit: Issue discussion is not a live reproduction or universal network guarantee.

Locators: Report and maintainer implementation lead (text lines 119–172); Ambiguous response; failed status; closure (text lines 197–284).

Raw SHA-256: `88f77b8ed6de9b342c3e4758ed81cd9c6a5ad2c99e782ba385a89f5e567dcd68`.

## E07 — Collect commit 0bc6cde page

[Primary source](https://github.com/getodk/collect/commit/0bc6cde) · [Raw capture](E07.html) · [Text](E07.txt) · [HTTP metadata](E07.metadata.json)

Version: Full SHA independently recovered from E21: 0bc6cdefe1b49256218726e3fb0059498e450378; dated 2021-06-29. Access: 2026-10-10T04:55:53.243400+00:00. Operation: Historical source change linked from issue #4589.

Patch adds FormResubmissionTest and excludes STATUS_SUBMISSION_FAILED in the single-argument unsent query. It is an intermediate commit, not by itself the full released change.

Applicability: Final 28,99 and S07/C07. Patch wording supports the described narrow change. Limit: No code was executed. The stub witness is not proof of production server acceptance before a lost acknowledgment; E20/E08 establish merged/released lineage.

Locators: Complete commit patch, test and CursorLoaderFactory filter (text lines 1–218).

Raw SHA-256: `7fa500883b0f0be483fa635a99e0be57d28d04f4ea3c88422839b01c9f603cb8`.

## E08 — Collect v2021.2.0 release

[Primary source](https://github.com/getodk/collect/releases/tag/v2021.2.0) · [Raw capture](E08.html) · [Text](E08.txt) · [HTTP metadata](E08.metadata.json)

Version: v2021.2.0; raw release datetime 2021-07-27T20:59:18Z. Access: 2026-10-10T04:55:53.307754+00:00. Operation: Released fix milestone.

Tagged release lists #4655 Prevent editing of submissions that failed to send.

Applicability: Final 28,99; S08/C08. Limit: A release note does not certify later product versions or the charity's installed build.

Locators: Release tag (text lines 108–136); #4655 entry (text lines 185–199); Release publication timestamp.

Raw SHA-256: `b8fb13b29638376e388cf264ce68c74687d9d591e9453924fa87cb66b1ea6030`.

## E09 — Survey123 field-app Outbox

[Primary source](https://doc.arcgis.com/en/survey123/capture/field-app/submitsurveyresults.htm) · [Raw capture](E09.html) · [Text](E09.txt) · [HTTP metadata](E09.metadata.json)

Version: Living docs; field app path explicitly. Access: 2026-10-10T04:55:53.322684+00:00. Operation: Offline response staging and later submission.

Save in Outbox when offline; responses can be edited before submission; Send after reconnection submits all unsent responses. Post-submit edits depend on configuration.

Applicability: Final 13,48,63 and S09/C09. Limit: No live coordinator pending-queue feed is established; offline collection is distinct from layer sync for offline maps.

Locators: Submit survey results (text lines 4–19).

Raw SHA-256: `7438455df9f845097d553ac43579594be71fc17f316213ace3dcb85370f0c5ed`.

## E10 — Survey123 Connect publish and Sent options

[Primary source](https://doc.arcgis.com/en/survey123/create/connect/publishsurvey.htm) · [Raw capture](E10.html) · [Text](E10.txt) · [HTTP metadata](E10.metadata.json)

Version: Living docs; defaults apply to described publish workflow. Access: 2026-10-10T04:55:53.422264+00:00. Operation: Publish-time layer sync and field-app Sent editing.

Enable sync is off when publishing new feature layers; offline map areas need it. Only applicable publish options are shown for existing layers. Sent editing is off by default; Sent+Inbox can retain stale records changed elsewhere.

Applicability: Final 13,63; S10/C10. Limit: Final prose uses a compact default statement; no claim that existing charity layers are all sync-disabled or that Outbox needs sync is warranted.

Locators: Publish options (text lines 41–51); Sent folder (text lines 60–67).

Raw SHA-256: `2595915a9f669c2f81b08db139ff060b8fcb74dcaf5f3d3dd63ff6f8e05adbde`.

## E11 — Survey123 correction paths and limits

[Primary source](https://doc.arcgis.com/en/survey123/capture/web-app/editexistingdata.htm) · [Raw capture](E11.html) · [Text](E11.txt) · [HTTP metadata](E11.metadata.json)

Version: Global-ID URL editing from 3.9; older Enterprise attachment edit limit before 10.8.1. Access: 2026-10-10T04:55:53.846728+00:00. Operation: Editing an individual response versus directly editing table cells.

Individual response: submitter AND viewer plus add/update privileges. URL edit: submitter OR owner with add/update. Attachments editable in individual/web form paths; not in table cells. Nested repeats unsupported; older Enterprise attachment surveys unsupported. Table edits bypass constraints/calculations and cannot be undone.

Applicability: Final 63 and S11/C11 conditional correction recommendation. Limit: These are edit-path permissions, not proof of append-only history. Brief-authorized separate correction events remain a proposed route.

Locators: Table edits (text lines 9–19); Individual/web edits and limitations (text lines 29–68).

Raw SHA-256: `09cc1ab659fde547b6e53782339462653ef6921539571b27786aa6929b1957b8`.

## E12 — Survey123 export and attachment associations

[Primary source](https://doc.arcgis.com/en/survey123/analyze/viewresults.htm) · [Raw capture](E12.html) · [Text](E12.txt) · [HTTP metadata](E12.metadata.json)

Version: Living docs; no specific deployment pinned. Access: 2026-10-10T04:55:53.850942+00:00. Operation: Survey123 website download of eligible survey results.

CSV, Excel, KML, shapefile, file geodatabase; choices use names rather than labels. FGDB removes attachment KEYWORD. ArcGIS Server feature-layer surveys cannot be downloaded in this website route; unmatched attachment keywords prevent website editing.

Applicability: Final 13,26,40,63; C-03 corrected omission; S12/C12/R04. Limit: Does not exclude all Enterprise exports. Final source-map retains keyword specifics; final prose gives a broader attachment warning.

Locators: View data; Download results (text lines 42–66).

Raw SHA-256: `dba6c70476d4821369e623765051ae8df2ed8a6880ce0db9845ddc29164aaff6`.

## E13 — CouchDB replication checkpoints

[Primary source](https://docs.couchdb.org/en/3.5.1/replication/intro.html) · [Raw capture](E13.html) · [Text](E13.txt) · [HTTP metadata](E13.metadata.json)

Version: Apache CouchDB 3.5.1 documentation. Access: 2026-10-10T04:55:54.011855+00:00. Operation: One-way document replication and restart recovery.

Changes-feed batches compare existing revisions; checkpoints allow restarted tasks to resume. Persistent versus transient task lifecycle differs; two directions require two tasks.

Applicability: Final 17,65; S13/C15. Architectural analogy only. Limit: No custom sync implementation or exactly-once guarantee is established.

Locators: Replication Procedure; Master-Master Replication (text lines 82–109).

Raw SHA-256: `f5ceaff9abe6d9260172469c66d0c85b9442b55e19196739b0d3f71864c721c1`.

## E14 — CouchDB conflict leaves and winner visibility

[Primary source](https://docs.couchdb.org/en/3.5.1/replication/conflicts.html) · [Raw capture](E14.html) · [Text](E14.txt) · [HTTP metadata](E14.metadata.json)

Version: Apache CouchDB 3.5.1 documentation. Access: 2026-10-10T04:55:54.015821+00:00. Operation: Concurrent leaf revisions, ordinary reads, and explicit application conflict resolution.

Default reads/views expose only a deterministic winner; conflicts can be retrieved. Non-leaf bodies are discarded by compaction; revision pruning exists. Revision trees are not an unlimited immutable audit log.

Applicability: Final 17,65; S14/C16. Keeps owner policy separate from database winner. Limit: Candidate uses branches as an analogy, not an actual retention design. No material audit-history dependency on CouchDB is proposed.

Locators: Replication conflicts and default winner (text lines 63–136); Revision tree; compaction; conflict reads (text lines 153–223); Old-body/diff limitation (text lines 416–438).

Raw SHA-256: `30423a9a6159213eac7d251e5403b005a07580ceec5c5208970abb5ce7851536`.

## E15 — KoboCollect offline Android alternative

[Primary source](https://support.kobotoolbox.org/data_collection_kobocollect.html) · [Raw capture](E15.html) · [Text](E15.txt) · [HTTP metadata](E15.metadata.json)

Version: Support page last updated 2026-07-17; app build not pinned. Access: 2026-10-10T04:55:54.113615+00:00. Operation: Download forms online, collect offline, submit later.

Initial deployed/shared form and configured project needed. Updates need connectivity. Drafts editable; finalize/send conditions follow settings. Originals remain locally by default; optional Delete after send changes that.

Applicability: Final 15,64,93; S15/C13/R07. Limit: Original personal-phone retention policy is not selected or exercised. No native legacy CSV import conclusion follows.

Locators: Download; collect; ready-to-send; upload (text lines 16–78).

Raw SHA-256: `82788080344a48991119da279ab97952cf6ac4334a31638a5089ba8d7e351e47`.

## E16 — Kobo correction identity and history conditions

[Primary source](https://support.kobotoolbox.org/editing_deleting_data.html) · [Raw capture](E16.html) · [Text](E16.txt) · [HTTP metadata](E16.metadata.json)

Version: Support page last updated 2026-05-06; app build not pinned. Access: 2026-10-10T04:55:54.165535+00:00. Operation: Server-side edits to submitted KoboCollect data.

No post-submit edit/delete in KoboCollect. Saved edits update _uuid; rootUuid stays stable. Web edits use latest form and can remove old fields. Raw edits cannot be undone; external log/comments recommended. Project history logs can track edit/deletion events.

Applicability: Final 15,64,93; S16/C14/R08. Screening caveat is evidence-based. Limit: External-log wording is stronger than the source's recommendation; built-in activity history is an additional opportunity, not demonstrated before/after retention. Conditional Kobo screening is not an evidence-based product ban.

Locators: Post-submit edits; metadata; raw/web methods (text lines 16–45); History note and version/export troubleshooting (text lines 61–94).

Raw SHA-256: `394277663ec886566754655763e75012490dbd78ce1e29859b61978f3294dcba`.

## E17 — Survey123 CSV lookup versus submission import

[Primary source](https://doc.arcgis.com/en/survey123/create/main/xlsformformulas.htm) · [Raw capture](E17.html) · [Text](E17.txt) · [HTTP metadata](E17.metadata.json)

Version: Living docs; Connect/field-app capability, not Studio/Mobile. Access: 2026-10-10T04:55:54.190789+00:00. Operation: pulldata retrieves values into a form.

Four-argument CSV lookup; not bulk creation of legacy survey responses. Specific lookup limits include field lengths, keys, and select_multiple.

Applicability: Final 29,39; C17/R05. Limit: A lookup-only page cannot prove all ArcGIS import paths absent; final makes that distinction.

Locators: pulldata function (text lines 203–208); Retrieve a value from .csv (text lines 463–480).

Raw SHA-256: `949b412395f4a70220bd9d697d3c4095c320d19fac6e8a8502e4267bbe144db2`.

## E18 — ArcGIS feature-service Append route and photo exclusion

[Primary source](https://developers.arcgis.com/rest/services-reference/enterprise/append-feature-service-layer/) · [Raw capture](E18.html) · [Text](E18.txt) · [HTTP metadata](E18.metadata.json)

Version: Living Enterprise REST docs; capability gate 11.1; imageCollection 11.5; portal item 10.9+. Access: 2026-10-10T04:55:54.297674+00:00. Operation: Conditional CSV loading into a supported feature-service layer/table, separate from Survey123-native import.

Target must advertise supportsAppend and CSV in supportedAppendFormats. Owners/admins bypass needing Append capability; other callers need it. Upsert updates matching records and is blocked with sync/changeTracking. Non-upsert allocates new ObjectID/GlobalID. imageCollection creates geometry from EXIF; absent-location images skipped by default.

Applicability: Final 29,31,39,63,92,95; R06. Proposed safe import and negative-constraint exclusion are supported. Limit: No safe photo association, idempotency, schema, timestamps, or service configuration is established. Final proposes validating them and does not adopt upsert as the dedupe mechanism.

Locators: Upsert; capability; supportsAppend; formats; sync; images (text lines 142–242); appendSourceInfo (text lines 511–519); Image collection default (text lines 769–770); CSV to nonspatial table example (text lines 937–950).

Raw SHA-256: `bea9ac7d4207280e2cb8448b836c23c3776e94722921af0bfe6eddf745189f11`.

## E19 — Central OpenRosa submission endpoint governing Collect retries

[Primary source](https://docs.getodk.org/central-api-openrosa-endpoints/) · [Raw capture](E19.html) · [Text](E19.txt) · [HTTP metadata](E19.metadata.json)

Version: Living Central OpenRosa API; submission endpoint since 0.1. Access: 2026-10-10T04:55:54.315280+00:00. Operation: Multipart OpenRosa POST, including repeated attachment requests and explicit updates.

Same-ID XML must stay identical across multipart/retry requests; changed XML or deleted submission returns 409. Explicit updates use deprecatedID, replace XML entirely, reject a stale predecessor, and carry media by filename reference.

Applicability: Independently checks final 25,49–52,91,99–101 and E05 scope. Reinforces immutable retry and distinct corrections. Limit: REST-create 409 is not the precise identical-payload Collect retry rule. No guaranteed success under every network failure is asserted.

Locators: Form Submission API and updates (text lines 180–231).

Raw SHA-256: `bbd456ff961bf8033988ddf1d373473581a84dc34e558c7b26b53722565479eb`.

## E20 — Merged Collect PR #4655

[Primary source](https://github.com/getodk/collect/pull/4655) · [Raw capture](E20.html) · [Text](E20.txt) · [HTTP metadata](E20.metadata.json)

Version: Merged 2021-07-07; six commits. Access: 2026-10-10T04:55:54.342500+00:00. Operation: Final historical change and testing account.

Closes #4589; source author describes stub-based FormResubmissionTest and manual intervention. Combined with E08 establishes shipped milestone.

Applicability: Final 28,99; historical lineage corroboration independent of candidate agreement. Limit: Developer testing account is not reviewer execution and not a current app/server end-to-end oracle.

Locators: Merge record and verification/design notes (text lines 108–163).

Raw SHA-256: `9b21e3392f5006e7dac597722806fd56e53da56fe4336a07d021c3b94fc21ba3`.

## E21 — Complete raw patch for 0bc6cde

[Primary source](https://github.com/getodk/collect/commit/0bc6cde.patch) · [Raw capture](E21.patch) · [Text](E21.txt) · [HTTP metadata](E21.metadata.json)

Version: 0bc6cdefe1b49256218726e3fb0059498e450378. Access: 2026-10-10T04:55:54.348331+00:00. Operation: Read-only source-code witness for E07.

Full patch read; UI test uses StubOpenRosaServer, simulated unavailable response, failed-item edit exclusion and later resend. Single-argument loader filter excludes failed status.

Applicability: Final 99 and validation row115. Limit: Downloaded as inert text, never executed; cannot substantiate production retry timing or complete current-product correctness.

Locators: Entire patch (text lines 1–218).

Raw SHA-256: `f8d97d1c6edf6a776049f2955cc343421c2b2c99305b2d578ab112974b3a37b9`.

## E22 — ODK Central managed versus self-hosted deployment

[Primary source](https://docs.getodk.org/central-install/) · [Raw capture](E22.html) · [Text](E22.txt) · [HTTP metadata](E22.metadata.json)

Version: Living installation docs; no deployed build selected. Access: 2026-10-10T04:55:54.537203+00:00. Operation: ODK Cloud versus operator-owned self-hosting.

Official paid managed hosting and free software self-hosting are documented. Self-hosting needs Linux administration, infrastructure expenses, ongoing maintenance and a domain name.

Applicability: Final 11,62; first-route deployment tradeoff. Limit: No costs, subscription availability, capacity measurement, or charity hosting configuration is inferred from the old benchmark.

Locators: Cloud; Self-hosting; installation requirements (text lines 119–151).

Raw SHA-256: `ca8c180bae7b722627447e81a495a90825b435de7c74653a7433ddb25292fe61`.

## E23 — Central user roles and access

[Primary source](https://docs.getodk.org/central-users/) · [Raw capture](E23.html) · [Text](E23.txt) · [HTTP metadata](E23.metadata.json)

Version: Living Central user-management docs. Access: 2026-10-10T04:55:54.650016+00:00. Operation: Role access for coordinator/staff versus App User submission.

Documentation distinguishes management/review/download roles and App User form access. E03 explicitly requires granting form access after creation.

Applicability: Final 11,62,107; roles remain an owner configuration input. Limit: No live volunteer credentials/accounts or authorization configuration was examined.

Locators: User roles; Project Form Submissions; Project App Users.

Raw SHA-256: `8e4f003d13115424e2bb42c7933c7347a9ce520109d063baff0e1e40ae2463dd`.

## E24 — Survey123 Android and organization requirements

[Primary source](https://doc.arcgis.com/en/survey123/get-started/systemrequirements.htm) · [Raw capture](E24.html) · [Text](E24.txt) · [HTTP metadata](E24.metadata.json)

Version: Living requirements; currently Enterprise 10.9.1+; field app Android 7+ distinct from Mobile Android13+. Access: 2026-10-10T04:58:59.983764+00:00. Operation: Usability of the chosen Survey123 field app on Android and public versus private access.

Field app supports Android7+ ARMv7/ARMv8; newer Survey123 Mobile has different OS requirements. Organization roles control features; anonymous public surveys require no ArcGIS account. Internet is required to download/submit, not throughout offline collection.

Applicability: Independent verification of final 13,63 and discovery/draft public-survey alternative. Limit: Personal devices were not inventoried, and the charity's app/Enterprise version remains an honest external input.

Locators: ArcGIS requirements; Supported operating systems for field app and Connect.

Raw SHA-256: `f067020541d815832b8654cf489f54e5576737150bab60b63682a773241f2685`.

