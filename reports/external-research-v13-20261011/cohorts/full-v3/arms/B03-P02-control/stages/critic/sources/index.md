# Critic source index — B03-P02-control

Stable source IDs S01–S23 are preserved from the investigator map. Exact URLs and source identities are unchanged. The access time is the recorded time for this direct-review batch; exact per-page fetch start was not captured.

<a id="s01"></a>
## S01 — SQLite isolation

- **URL:** [https://www.sqlite.org/isolation.html](https://www.sqlite.org/isolation.html)
- **Released version/commit:** SQLite official living documentation; WAL supported since 3.7.0 (2010-07-21)
- **Locator:** Isolation between connections; WAL; Summary
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened the SQLite isolation page; inspected transaction isolation, WAL read-transaction snapshot behavior, rollback-mode current default, and the shared-cache/read_uncommitted exception.
- **Governing condition/default/exception:** Separate connections see committed transactions; WAL read txn sees stable snapshot; rollback mode is current default; exception is shared cache plus read_uncommitted.
- **Applicability:** Database-specific example of snapshot semantics; target DB is unknown.
- **Limits:** DB snapshots do not pin external files.

<a id="s02"></a>
## S02 — SQLite Online Backup API

- **URL:** [https://www.sqlite.org/backup.html](https://www.sqlite.org/backup.html)
- **Released version/commit:** SQLite official living documentation
- **Locator:** Sections 1, 1.1, 3, 3.1
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened the SQLite Online Backup API; inspected snapshot-at-commencement statement, incremental read-lock behavior, source-write restart and possible noncompletion under frequent writes.
- **Governing condition/default/exception:** Incremental API releases read locks between steps; successful copy is snapshot from commencement; source writes can restart steps.
- **Applicability:** Use only if target uses SQLite; alternative for point-in-time database view.
- **Limits:** Not a portable project archive; may include unrelated data.

<a id="s03"></a>
## S03 — PostgreSQL transaction isolation

- **URL:** [https://www.postgresql.org/docs/18/transaction-iso.html](https://www.postgresql.org/docs/18/transaction-iso.html)
- **Released version/commit:** PostgreSQL 18 docs
- **Locator:** 13.2.2 Repeatable Read, lines 90-104
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened PostgreSQL 18 transaction isolation docs; checked Repeatable Read snapshot behavior and its DB-specific scope.
- **Governing condition/default/exception:** Repeatable Read sees data committed before transaction start and successive reads see same snapshot; same guarantee is DB-specific.
- **Applicability:** Example if target DB is PostgreSQL; supports avoiding independent paged reads as consistency guarantee.
- **Limits:** Do not generalize to other DBs or cross-store files.

<a id="s04"></a>
## S04 — RFC 8259 JSON

- **URL:** [https://www.rfc-editor.org/rfc/rfc8259](https://www.rfc-editor.org/rfc/rfc8259)
- **Released version/commit:** RFC 8259, Standards Track, Dec. 2017
- **Locator:** Sections 4, 8.1, 9, 10
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened RFC 8259; checked UTF-8 requirement and JSON interoperability guidance; confirmed it does not define NDJSON.
- **Governing condition/default/exception:** External JSON MUST be UTF-8; keys SHOULD be unique; parser may limit document size/depth/number/string ranges.
- **Applicability:** Structured text records; NDJSON is a line-oriented application convention, not defined by this RFC.
- **Limits:** No product schema or identifier rules.

<a id="s05"></a>
## S05 — RFC 3339 timestamps

- **URL:** [https://www.rfc-editor.org/rfc/rfc3339](https://www.rfc-editor.org/rfc/rfc3339)
- **Released version/commit:** RFC 3339, July 2002; RFC Editor says updated by RFC 9557
- **Locator:** Sections 4.1-4.4 and 5.6
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened RFC 3339 and RFC 9557; checked -00:00 distinction and timestamp update relationship.
- **Governing condition/default/exception:** Timestamp denotes an instant with UTC relationship; -00:00 means local offset unknown and differs from Z/+00:00; unqualified local time is not an interoperable instant.
- **Applicability:** Use for actual instants; preserve date-only values separately and named time zone for local schedules.
- **Limits:** Do not invent timezone semantics for naive dates.

<a id="s06"></a>
## S06 — PKWARE ZIP APPNOTE

- **URL:** [https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT)
- **Released version/commit:** ZIP APPNOTE 6.3.10 FINAL, revised 2022-11-01
- **Locator:** Sections 4.3.5, 4.3.8-4.3.9, 4.3.14-4.3.16
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened ZIP APPNOTE 6.3.10; checked streaming data descriptors, ZIP64 records, and central-directory/end records at archive end.
- **Governing condition/default/exception:** Data descriptors support streaming; central directory/end records complete archive; ZIP64 expands fields when classic limits are too small.
- **Applicability:** Compare stream-to-destination ZIP64 with folder and tar/PAX outputs.
- **Limits:** Final archive structure alone does not prove record coverage/authenticity.

<a id="s07"></a>
## S07 — GNU tar manual

- **URL:** [https://www.gnu.org/software/tar/manual/tar.html](https://www.gnu.org/software/tar/manual/tar.html)
- **Released version/commit:** GNU tar 1.35, released 2023-08-22
- **Locator:** Sections 8/8.3.5/8.3.6, 9, Appendix E
- **Critic status:** retrieval limited; content not independently verified in critic stage
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Attempted the exact GNU tar manual URL; browser returned an internal error, so no source text was independently inspected.
- **Governing condition/default/exception:** ustar limits names, links and file sizes (<8 GiB); POSIX/PAX is more flexible but some older tools have issues; entries are sequential.
- **Applicability:** Tar/PAX streaming alternative.
- **Limits:** GNU manual does not establish behavior of every tar reader.

<a id="s08"></a>
## S08 — GitLab export docs

- **URL:** [https://docs.gitlab.com/user/project/settings/import_export/](https://docs.gitlab.com/user/project/settings/import_export/)
- **Released version/commit:** GitLab living docs accessed 2026-10-12, not version-pinned
- **Locator:** Compatibility; exported/not-exported lists; history; security; offline package
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened GitLab's living export docs; inspected exclusions, offline package, scope warning and version dependence.
- **Governing condition/default/exception:** Items depend on GitLab release; page says NDJSON, excludes some links, warns exports are not complete backups; compatibility window is finite.
- **Applicability:** First-party tracker migration precedent for explicit coverage/omission declarations.
- **Limits:** Not target product requirements; living page may change.

<a id="s09"></a>
## S09 — GitLab project export schema

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/import_export.yml](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/import_export.yml)
- **Released version/commit:** GitLab 19.2 stable EE branch head, commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** tree/common-vs-EE associations; included_attributes for custom_attributes/issues/comments; import_only_tree
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned GitLab 19.2 project schema at commit fc45538465514c4777fc196641900b63470c6236; inspected explicit relationship and attribute allowlists.
- **Governing condition/default/exception:** Associations/attributes are explicitly selected; EE/common split and import-only legacy fields are called out.
- **Applicability:** Primary-code example for explicit schema coverage and compatibility.
- **Limits:** Not the target product's actual schema.

<a id="s10"></a>
## S10 — GitLab project TreeSaver

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/tree_saver.rb](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/tree_saver.rb)
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** save, stream_export, exportable, json_writer
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned GitLab TreeSaver; checked current_user is passed into the serializer and writer closure in ensure.
- **Governing condition/default/exception:** Uses current_user and excluded relations; retries Net::OpenTimeout; records errors and closes writer in ensure.
- **Applicability:** Code example for caller-aware serializer and writer closure.
- **Limits:** Does not itself establish cross-relation snapshot.

<a id="s11"></a>
## S11 — GitLab StreamingSerializer

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/json/streaming_serializer.rb](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/json/streaming_serializer.rb)
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** BATCH_SIZE; execute; serialize_many_relations; authorization; batch
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned GitLab StreamingSerializer; checked BATCH_SIZE=100 and relation-batch errors are logged and skipped, which must not become a complete unqualified export.
- **Governing condition/default/exception:** Batch size 100; ordering/keyset where configured; restricted associations use current_user; relation batch errors are logged and skipped.
- **Applicability:** Prior art for bounded batches/order/permission filtering; skip-on-error is a caution—never call a partial export complete.
- **Limits:** Excerpt does not show global transaction/snapshot.

<a id="s12"></a>
## S12 — GitLab ExportService

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/app/services/projects/import_export/export_service.rb](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/app/services/projects/import_export/export_service.rb)
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** execute, exporters, save_all!, tree saver, cleanup
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned GitLab ExportService; checked project authorization, saver/archive orchestration, errors and cleanup.
- **Governing condition/default/exception:** Authorization gate; runs component savers then archive; notifies errors and cleans work directory in ensure.
- **Applicability:** Caller evidence for authorization, binary/data saver coverage, errors and cleanup.
- **Limits:** Product-specific flow.

<a id="s13"></a>
## S13 — GitLab ExportTask caller

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/export_task.rb](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/project/export_task.rb)
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** export, path checks, ExportService call
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned GitLab ExportTask caller; checked project/path validation and ExportService invocation.
- **Governing condition/default/exception:** Checks project/path, calls ExportService with move-file after-export strategy, returns shared errors.
- **Applicability:** Shows task/job layer is distinct from serializer and final destination.
- **Limits:** Does not describe target app authorization.

<a id="s14"></a>
## S14 — GitLab NDJSON writer

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/json/ndjson_writer.rb](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/lib/gitlab/import_export/json/ndjson_writer.rb)
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** write_attributes, write_relation_array, with_file
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned GitLab NDJSON writer; checked per-line relation writing and file-opening behavior.
- **Governing condition/default/exception:** Root attrs as JSON; relations one JSON value per line; opens files append mode.
- **Applicability:** Practical prior art for streamable records.
- **Limits:** Application convention; fresh paths and finalization still required.

<a id="s15"></a>
## S15 — GitLab TreeSaver tests

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/spec/lib/gitlab/import_export/project/tree_saver_spec.rb](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/spec/lib/gitlab/import_export/project/tree_saver_spec.rb)
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** RSpec contexts for root/issues/comments/nested relations
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned TreeSaver tests; inspected included/excluded field, relation and nested content assertions; tests not run.
- **Governing condition/default/exception:** Assertions cover included/excluded fields, comments/authors and relation contents.
- **Applicability:** Seed for field/relationship export validation matrix.
- **Limits:** Tests are intended assertions, no test result claimed.

<a id="s16"></a>
## S16 — GitLab NDJSON writer tests

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/spec/lib/gitlab/import_export/json/ndjson_writer_spec.rb](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/spec/lib/gitlab/import_export/json/ndjson_writer_spec.rb)
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** writer tests for root, appending relations, arrays
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned NDJSON writer tests; inspected write/read assertions; tests not run.
- **Governing condition/default/exception:** Checks root JSON and that written relation arrays can be read back.
- **Applicability:** Seed format and round-trip tests; add truncation/corruption coverage.
- **Limits:** Not executed during research.

<a id="s17"></a>
## S17 — GitLab EE permission tests

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/ee/spec/lib/ee/gitlab/import_export/project/tree_saver_spec.rb](https://gitlab.com/gitlab-org/gitlab/-/raw/fc45538465514c4777fc196641900b63470c6236/ee/spec/lib/ee/gitlab/import_export/project/tree_saver_spec.rb)
- **Released version/commit:** GitLab 19.2 branch commit fc45538465514c4777fc196641900b63470c6236
- **Locator:** “when epic is not readable”; “restricted associations”
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened pinned EE permission tests; inspected inaccessible/restricted relation assertions; tests not run.
- **Governing condition/default/exception:** Inaccessible epic omitted; one denied note filtered while other notes retained.
- **Applicability:** Test pattern for inaccessible relation metadata/content.
- **Limits:** GitLab-specific ACLs only.

<a id="s18"></a>
## S18 — NIST Secure Hash Standard

- **URL:** [https://csrc.nist.gov/pubs/fips/180-4/upd1/final](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)
- **Released version/commit:** FIPS 180-4 final 2015-08-04; revision planned per NIST page
- **Locator:** Abstract and standard overview
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened NIST FIPS 180-4 page; checked SHA-256 digest purpose and distinction from authentication.
- **Governing condition/default/exception:** Digest detects message change with high probability; algorithm spec does not itself sign archive.
- **Applicability:** Use SHA-256 for byte length/digest checks; call it corruption detection, not authenticity.
- **Limits:** Manifest hashes can be rewritten; trusted signature/key is separate.

<a id="s19"></a>
## S19 — OWASP archive security test guide

- **URL:** [https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/10-Business_Logic/09-Upload_of_Malicious_Files/](https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/10-Business_Logic/09-Upload_of_Malicious_Files/)
- **Released version/commit:** OWASP WSTG latest living page, version not pinned
- **Locator:** Archive Directory Traversal; Symlink Attacks; ZIP Bombs
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened OWASP WSTG archive upload page; checked traversal, symlink and expanded-data risks for extraction.
- **Governing condition/default/exception:** Unsafe extraction may traverse paths or follow symlinks; expanded data can exhaust disk/memory.
- **Applicability:** Future importer/verifier: prefer in-place inspection; if extracting, quarantine and bound names/count/expanded bytes.
- **Limits:** Security testing guidance, not generation-format standard.

<a id="s20"></a>
## S20 — GitLab large export issue

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/issues/436638](https://gitlab.com/gitlab-org/gitlab/-/issues/436638)
- **Released version/commit:** Reporter says self-managed GitLab 16.5.3 on Kubernetes; no fix status established in reviewed page
- **Locator:** Summary, reproduction, expected/current behavior, logs
- **Critic status:** retrieval limited; content not independently verified in critic stage
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Opened the exact issue URL; it redirected to an 11-line work-item shell without issue details, so only the carried caveated record is available.
- **Governing condition/default/exception:** Reporter saw regeneration_in_progress/download unavailable; archive-saved but not archive-uploaded log; suspected cause is unverified.
- **Applicability:** Failure/observability scenario, not verified root cause or current status.
- **Limits:** Single issue report.

<a id="s21"></a>
## S21 — GitLab relation export MR

- **URL:** [https://gitlab.com/gitlab-org/gitlab/-/merge_requests/90650](https://gitlab.com/gitlab-org/gitlab/-/merge_requests/90650)
- **Released version/commit:** Merged MR, June 2022; release adoption not established
- **Locator:** Overview and rationale
- **Critic status:** retrieval limited; content not independently verified in critic stage
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Attempted the exact merge-request URL; browser returned an internal error, so no source text was independently inspected.
- **Governing condition/default/exception:** MR says worker/service were not used yet then; staging in object store adds steps and partial files.
- **Applicability:** Alternative for partitioning/retries; informs scratch/cost tradeoff.
- **Limits:** Do not represent MR design as current behavior.

<a id="s22"></a>
## S22 — GitLab direct-transfer release history

- **URL:** [https://about.gitlab.com/blog/how-to-migrate-gitlab-groups-and-projects-more-efficiently/](https://about.gitlab.com/blog/how-to-migrate-gitlab-groups-and-projects-more-efficiently/)
- **Released version/commit:** First-party blog 2023-08-02; describes GitLab 15.10/16.3
- **Locator:** Timeout problem; batching change and release notes
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened GitLab's 2023 first-party migration history; inspected the stated 16.3 relation-batching context, retained as GitLab-specific history.
- **Governing condition/default/exception:** GitLab says 16.3 batched relations to avoid one massive archive, improve performance and parallelism.
- **Applicability:** Evidence to test relation count/cardinality dimensions and consider smaller checkpoints.
- **Limits:** Migration/direct-transfer context differs from this product.

<a id="s23"></a>
## S23 — GitLab repository backup performance history

- **URL:** [https://about.gitlab.com/blog/how-we-decreased-gitlab-repo-backup-times-from-48-hours-to-41-minutes/](https://about.gitlab.com/blog/how-we-decreased-gitlab-repo-backup-times-from-48-hours-to-41-minutes/)
- **Released version/commit:** First-party blog 2025-06-05; improvements in GitLab 18.0
- **Locator:** Root cause, benchmark and availability
- **Critic status:** independently reopened and inspected
- **Prior investigator access UTC:** 2026-10-12T01:01:57Z
- **Critic access UTC:** 2026-10-12T01:27:03Z
- **Observed operation:** Reopened GitLab's 2025 backup performance post; checked the O(N^2) cause concerned Git references, not task export.
- **Governing condition/default/exception:** O(N²) cause was Git bundle reference dedup, not task export; 100,000 refs benchmark 6.12x improvement.
- **Applicability:** General lesson to benchmark cardinality; not evidence of same bottleneck here.
- **Limits:** Repository backup only.
