# Source index — B03-P02-control reviser

This index preserves every source identity S01–S23 from the investigator and critic maps. IDs and exact URLs are unchanged. Reviewer access notes distinguish direct reviser checks from carried predecessor observations. See [source-map.json](../source-map.json) for complete machine-readable records and source-use mapping.

## Sources

<a id="s01"></a>
### S01 — SQLite isolation

- **Exact URL:** https://www.sqlite.org/isolation.html
- **Released version/commit:** SQLite official living documentation; WAL supported since 3.7.0 (2010-07-21)
- **Locator:** Isolation between connections; WAL; Summary
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened the SQLite isolation page; inspected transaction isolation, WAL read-transaction snapshot behavior, rollback-mode current default, and the shared-cache/read_uncommitted exception.
- **Governing condition/default/exception:** Separate connections see committed transactions; WAL read txn sees stable snapshot; rollback mode is current default; exception is shared cache plus read_uncommitted.
- **Applicability:** Database-specific example of snapshot semantics; target DB is unknown.
- **Limits:** DB snapshots do not pin external files.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened official SQLite isolation documentation; confirmed WAL read-transaction snapshots, rollback mode as current default, and the shared-cache/read_uncommitted exception.
- **Reviser result:** SQLite-specific example only; conditional on actual transaction setup and unrelated to external blob pinning.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s02"></a>
### S02 — SQLite Online Backup API

- **Exact URL:** https://www.sqlite.org/backup.html
- **Released version/commit:** SQLite official living documentation
- **Locator:** Sections 1, 1.1, 3, 3.1
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened the SQLite Online Backup API; inspected snapshot-at-commencement statement, incremental read-lock behavior, source-write restart and possible noncompletion under frequent writes.
- **Governing condition/default/exception:** Incremental API releases read locks between steps; successful copy is snapshot from commencement; source writes can restart steps.
- **Applicability:** Use only if target uses SQLite; alternative for point-in-time database view.
- **Limits:** Not a portable project archive; may include unrelated data.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened official SQLite Online Backup API documentation; checked snapshot-at-commencement semantics and incremental locking/restart behavior.
- **Reviser result:** Conditional SQLite mechanism, not a portable project export or a pin for external attachment bytes.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s03"></a>
### S03 — PostgreSQL transaction isolation

- **Exact URL:** https://www.postgresql.org/docs/18/transaction-iso.html
- **Released version/commit:** PostgreSQL 18 docs
- **Locator:** 13.2.2 Repeatable Read, lines 90-104
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened PostgreSQL 18 transaction isolation docs; checked Repeatable Read snapshot behavior and its DB-specific scope.
- **Governing condition/default/exception:** Repeatable Read sees data committed before transaction start and successive reads see same snapshot; same guarantee is DB-specific.
- **Applicability:** Example if target DB is PostgreSQL; supports avoiding independent paged reads as consistency guarantee.
- **Limits:** Do not generalize to other DBs or cross-store files.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened PostgreSQL 18 transaction isolation documentation, including Repeatable Read and the Read Committed contrast.
- **Reviser result:** Stable snapshot only if the target uses PostgreSQL and the export uses that isolation level.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s04"></a>
### S04 — RFC 8259 JSON

- **Exact URL:** https://www.rfc-editor.org/rfc/rfc8259
- **Released version/commit:** RFC 8259, Standards Track, Dec. 2017
- **Locator:** Sections 4, 8.1, 9, 10
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened RFC 8259; checked UTF-8 requirement and JSON interoperability guidance; confirmed it does not define NDJSON.
- **Governing condition/default/exception:** External JSON MUST be UTF-8; keys SHOULD be unique; parser may limit document size/depth/number/string ranges.
- **Applicability:** Structured text records; NDJSON is a line-oriented application convention, not defined by this RFC.
- **Limits:** No product schema or identifier rules.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened RFC 8259 sections 4 and 8.1; checked unique object-name guidance and UTF-8 requirement.
- **Reviser result:** Supports UTF-8 JSON and unique keys; RFC 8259 does not define NDJSON or require a record-per-line representation.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s05"></a>
### S05 — RFC 3339 timestamps

- **Exact URL:** https://www.rfc-editor.org/rfc/rfc3339
- **Released version/commit:** RFC 3339, July 2002; RFC Editor says updated by RFC 9557
- **Locator:** Sections 4.1-4.4 and 5.6
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened RFC 3339 and RFC 9557; checked -00:00 distinction and timestamp update relationship.
- **Governing condition/default/exception:** Timestamp denotes an instant with UTC relationship; -00:00 means local offset unknown and differs from Z/+00:00; unqualified local time is not an interoperable instant.
- **Applicability:** Use for actual instants; preserve date-only values separately and named time zone for local schedules.
- **Limits:** Do not invent timezone semantics for naive dates.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened RFC 3339 sections 4.2-4.4 and 5.6; checked numeric offset, -00:00, and unqualified local time semantics.
- **Reviser result:** Preserve unknown offset distinctly; use RFC 3339 only when source semantics establish an instant; do not infer date-only or local-schedule meaning.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s06"></a>
### S06 — PKWARE ZIP APPNOTE

- **Exact URL:** https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
- **Released version/commit:** ZIP APPNOTE 6.3.10 FINAL, revised 2022-11-01
- **Locator:** Sections 4.3.5, 4.3.8-4.3.9, 4.3.14-4.3.16
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened ZIP APPNOTE 6.3.10; checked streaming data descriptors, ZIP64 records, and central-directory/end records at archive end.
- **Governing condition/default/exception:** Data descriptors support streaming; central directory/end records complete archive; ZIP64 expands fields when classic limits are too small.
- **Applicability:** Compare stream-to-destination ZIP64 with folder and tar/PAX outputs.
- **Limits:** Final archive structure alone does not prove record coverage/authenticity.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened PKWARE ZIP APPNOTE 6.3.10 sections 4.3.5-4.3.16; checked streaming data descriptors, per-file central-directory records, and ZIP64/end records.
- **Reviser result:** Supports streamed member data and container-aware completion; central-directory metadata grows with entry count; does not choose the product's reader matrix.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s07"></a>
### S07 — GNU tar manual

- **Exact URL:** https://www.gnu.org/software/tar/manual/tar.html
- **Released version/commit:** GNU tar 1.35, released 2023-08-22
- **Locator:** Sections 8/8.3.5/8.3.6, 9, Appendix E
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Attempted the exact GNU tar manual URL; browser returned an internal error, so no source text was independently inspected.
- **Governing condition/default/exception:** ustar limits names, links and file sizes (<8 GiB); POSIX/PAX is more flexible but some older tools have issues; entries are sequential.
- **Applicability:** Tar/PAX streaming alternative.
- **Limits:** GNU manual does not establish behavior of every tar reader.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Retried the exact GNU tar manual URL recorded in the source map; web retrieval returned an internal error again.
- **Reviser result:** No new independent verification; retain prior PAX notes as caveated and require compatibility checks.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — retrieval limited; content not independently verified in critic stage

<a id="s08"></a>
### S08 — GitLab export docs

- **Exact URL:** https://docs.gitlab.com/user/project/settings/import_export/
- **Released version/commit:** GitLab living docs accessed 2026-10-12, not version-pinned
- **Locator:** Compatibility; exported/not-exported lists; history; security; offline package
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened GitLab's living export docs; inspected exclusions, offline package, scope warning and version dependence.
- **Governing condition/default/exception:** Items depend on GitLab release; page says NDJSON, excludes some links, warns exports are not complete backups; compatibility window is finite.
- **Applicability:** First-party tracker migration precedent for explicit coverage/omission declarations.
- **Limits:** Not target product requirements; living page may change.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s09"></a>
### S09 — GitLab project export schema

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/import_export.yml
- **Released version/commit:** GitLab 19.2 stable EE branch head, commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** tree/common-vs-EE associations; included_attributes for custom_attributes/issues/comments; import_only_tree
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned GitLab 19.2 project schema at commit fc45538465514c4777fc196641900b63470c6236; inspected explicit relationship and attribute allowlists.
- **Governing condition/default/exception:** Associations/attributes are explicitly selected; EE/common split and import-only legacy fields are called out.
- **Applicability:** Primary-code example for explicit schema coverage and compatibility.
- **Limits:** Not the target product's actual schema.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s10"></a>
### S10 — GitLab project TreeSaver

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/tree_saver.rb
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** save, stream_export, exportable, json_writer
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned GitLab TreeSaver; checked current_user is passed into the serializer and writer closure in ensure.
- **Governing condition/default/exception:** Uses current_user and excluded relations; retries Net::OpenTimeout; records errors and closes writer in ensure.
- **Applicability:** Code example for caller-aware serializer and writer closure.
- **Limits:** Does not itself establish cross-relation snapshot.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s11"></a>
### S11 — GitLab StreamingSerializer

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/json/streaming_serializer.rb
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** BATCH_SIZE; execute; serialize_many_relations; authorization; batch
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned GitLab StreamingSerializer; checked BATCH_SIZE=100 and relation-batch errors are logged and skipped, which must not become a complete unqualified export.
- **Governing condition/default/exception:** Batch size 100; ordering/keyset where configured; restricted associations use current_user; relation batch errors are logged and skipped.
- **Applicability:** Prior art for bounded batches/order/permission filtering; skip-on-error is a caution—never call a partial export complete.
- **Limits:** Excerpt does not show global transaction/snapshot.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s12"></a>
### S12 — GitLab ExportService

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/app/services/projects/import_export/export_service.rb
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** execute, exporters, save_all!, tree saver, cleanup
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned GitLab ExportService; checked project authorization, saver/archive orchestration, errors and cleanup.
- **Governing condition/default/exception:** Authorization gate; runs component savers then archive; notifies errors and cleans work directory in ensure.
- **Applicability:** Caller evidence for authorization, binary/data saver coverage, errors and cleanup.
- **Limits:** Product-specific flow.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s13"></a>
### S13 — GitLab ExportTask caller

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/export_task.rb
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** export, path checks, ExportService call
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned GitLab ExportTask caller; checked project/path validation and ExportService invocation.
- **Governing condition/default/exception:** Checks project/path, calls ExportService with move-file after-export strategy, returns shared errors.
- **Applicability:** Shows task/job layer is distinct from serializer and final destination.
- **Limits:** Does not describe target app authorization.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s14"></a>
### S14 — GitLab NDJSON writer

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/json/ndjson_writer.rb
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** write_attributes, write_relation_array, with_file
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned GitLab NDJSON writer; checked per-line relation writing and file-opening behavior.
- **Governing condition/default/exception:** Root attrs as JSON; relations one JSON value per line; opens files append mode.
- **Applicability:** Practical prior art for streamable records.
- **Limits:** Application convention; fresh paths and finalization still required.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened pinned GitLab 19.2 NDJSON writer at commit fc45538465514c4777fc196641900b63470c6236; confirmed relation items are serialized one JSON value followed by newline.
- **Reviser result:** Application-specific line-oriented convention; not a JSON-RFC or target-product requirement.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s15"></a>
### S15 — GitLab TreeSaver tests

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/spec/lib/gitlab/import_export/project/tree_saver_spec.rb
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** RSpec contexts for root/issues/comments/nested relations
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned TreeSaver tests; inspected included/excluded field, relation and nested content assertions; tests not run.
- **Governing condition/default/exception:** Assertions cover included/excluded fields, comments/authors and relation contents.
- **Applicability:** Seed for field/relationship export validation matrix.
- **Limits:** Tests are intended assertions, no test result claimed.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s16"></a>
### S16 — GitLab NDJSON writer tests

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/spec/lib/gitlab/import_export/json/ndjson_writer_spec.rb
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** writer tests for root, appending relations, arrays
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned NDJSON writer tests; inspected write/read assertions; tests not run.
- **Governing condition/default/exception:** Checks root JSON and that written relation arrays can be read back.
- **Applicability:** Seed format and round-trip tests; add truncation/corruption coverage.
- **Limits:** Not executed during research.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s17"></a>
### S17 — GitLab EE permission tests

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/ee/spec/lib/ee/gitlab/import_export/project/tree_saver_spec.rb
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** “when epic is not readable”; “restricted associations”
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened pinned EE permission tests; inspected inaccessible/restricted relation assertions; tests not run.
- **Governing condition/default/exception:** Inaccessible epic omitted; one denied note filtered while other notes retained.
- **Applicability:** Test pattern for inaccessible relation metadata/content.
- **Limits:** GitLab-specific ACLs only.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s18"></a>
### S18 — NIST Secure Hash Standard

- **Exact URL:** https://csrc.nist.gov/pubs/fips/180-4/upd1/final
- **Released version/commit:** FIPS 180-4 final 2015-08-04; revision planned per NIST page
- **Locator:** Abstract and standard overview
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened NIST FIPS 180-4 page; checked SHA-256 digest purpose and distinction from authentication.
- **Governing condition/default/exception:** Digest detects message change with high probability; algorithm spec does not itself sign archive.
- **Applicability:** Use SHA-256 for byte length/digest checks; call it corruption detection, not authenticity.
- **Limits:** Manifest hashes can be rewritten; trusted signature/key is separate.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened NIST FIPS 180-4 publication page and planning note.
- **Reviser result:** Digests detect message changes; a digest with editable data is not archive authentication.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s19"></a>
### S19 — OWASP archive security test guide

- **Exact URL:** https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/10-Business_Logic/09-Upload_of_Malicious_Files/
- **Released version/commit:** OWASP WSTG latest living page, version not pinned
- **Locator:** Archive Directory Traversal; Symlink Attacks; ZIP Bombs
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened OWASP WSTG archive upload page; checked traversal, symlink and expanded-data risks for extraction.
- **Governing condition/default/exception:** Unsafe extraction may traverse paths or follow symlinks; expanded data can exhaust disk/memory.
- **Applicability:** Future importer/verifier: prefer in-place inspection; if extracting, quarantine and bound names/count/expanded bytes.
- **Limits:** Security testing guidance, not generation-format standard.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened OWASP WSTG archive extraction guidance for traversal, symlinks, and expanded-size exhaustion.
- **Reviser result:** Threats apply to unsafe extraction/processing; supports importer safeguards but not content-addressed exporter names.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s20"></a>
### S20 — GitLab large export issue

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/issues/436638
- **Released version/commit:** Reporter says self-managed GitLab 16.5.3 on Kubernetes; no fix status established in reviewed page
- **Locator:** Summary, reproduction, expected/current behavior, logs
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Opened the exact issue URL; it redirected to an 11-line work-item shell without issue details, so only the carried caveated record is available.
- **Governing condition/default/exception:** Reporter saw regeneration_in_progress/download unavailable; archive-saved but not archive-uploaded log; suspected cause is unverified.
- **Applicability:** Failure/observability scenario, not verified root cause or current status.
- **Limits:** Single issue report.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened exact GitLab issue URL; it redirected to a work-item shell without issue details.
- **Reviser result:** Reported large-export stall and suspected cause remain unverified.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — retrieval limited; content not independently verified in critic stage

<a id="s21"></a>
### S21 — GitLab relation export MR

- **Exact URL:** https://gitlab.com/gitlab-org/gitlab/-/merge_requests/90650
- **Released version/commit:** Merged MR, June 2022; release adoption not established
- **Locator:** Overview and rationale
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Attempted the exact merge-request URL; browser returned an internal error, so no source text was independently inspected.
- **Governing condition/default/exception:** MR says worker/service were not used yet then; staging in object store adds steps and partial files.
- **Applicability:** Alternative for partitioning/retries; informs scratch/cost tradeoff.
- **Limits:** Do not represent MR design as current behavior.
- **Reviser access window UTC:** 2026-10-12T01:31:07Z through 2026-10-12T01:32:43Z
- **Reviser observed operation:** Reopened exact GitLab merge request page; it describes separate relation files staged temporarily and combined into a tarball, and says the worker/service were not yet used at that time.
- **Reviser result:** Confirms a historical proposal only; not current GitLab behavior or target-product suitability.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — retrieval limited; content not independently verified in critic stage

<a id="s22"></a>
### S22 — GitLab direct-transfer release history

- **Exact URL:** https://about.gitlab.com/blog/how-to-migrate-gitlab-groups-and-projects-more-efficiently/
- **Released version/commit:** First-party blog 2023-08-02; describes GitLab 15.10/16.3
- **Locator:** Timeout problem; batching change and release notes
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened GitLab's 2023 first-party migration history; inspected the stated 16.3 relation-batching context, retained as GitLab-specific history.
- **Governing condition/default/exception:** GitLab says 16.3 batched relations to avoid one massive archive, improve performance and parallelism.
- **Applicability:** Evidence to test relation count/cardinality dimensions and consider smaller checkpoints.
- **Limits:** Migration/direct-transfer context differs from this product.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

<a id="s23"></a>
### S23 — GitLab repository backup performance history

- **Exact URL:** https://about.gitlab.com/blog/how-we-decreased-gitlab-repo-backup-times-from-48-hours-to-41-minutes/
- **Released version/commit:** First-party blog 2025-06-05; improvements in GitLab 18.0
- **Locator:** Root cause, benchmark and availability
- **Prior access UTC:** 2026-10-12T01:01:57Z
- **Prior observed operation:** Reopened GitLab's 2025 backup performance post; checked the O(N^2) cause concerned Git references, not task export.
- **Governing condition/default/exception:** O(N²) cause was Git bundle reference dedup, not task export; 100,000 refs benchmark 6.12x improvement.
- **Applicability:** General lesson to benchmark cardinality; not evidence of same bottleneck here.
- **Limits:** Repository backup only.
- **Reviser status:** carried predecessor record; not reopened during this stage.
- **Critic access UTC/status:** 2026-10-12T01:27:03Z — independently reopened and inspected

## Source-use navigation

Plan-clause to source-ID mapping is in source-map.json. Core snapshot claims use S01-S03; text/date use S04-S05; archive lifecycle uses S06-S07; reference implementation and tests use S08-S17; integrity/extraction use S18-S19; reported history uses S20-S23.

## Retrieval and scope limits

- S07 (GNU tar manual): exact URL returned an internal error in critic and reviser stages; PAX notes are carried and compatibility remains to be verified.
- S20 (large GitLab export issue): exact URL redirects to a work-item shell without details; report and cause remain unverified.
- S21 (relation export MR): directly inspected in the reviser stage; it describes a proposal that said its worker/service were not yet used at that time.
- S22-S23: first-party history checked in the critic stage and carried here; their contexts are limited in final.md.
- No target tracker repository was provided. GitLab code/callers/tests are reference evidence, not target behavior; predecessor tests were inspected, not run.
