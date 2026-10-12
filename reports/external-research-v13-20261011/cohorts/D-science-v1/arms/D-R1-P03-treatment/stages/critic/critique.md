# Independent critique and finalization record — D-P03

## Review basis and limits

This is the critic/finalizer stage for run D-R1-P03-treatment. I reviewed the complete original brief, investigator discovery and draft, investigator source map and source index, and the exact revealed plan. I checked the discovery and plan hashes against the recorded single-use plan-reveal receipt: both matched. I independently opened the governing primary sources cited below, including the current SQLite WAL bug notice and the age v1.1.0 specification. The exact native Goal activation was checked before this review; the preserved activation receipt is in this directory.

No application, archive, storage engine, migration, encryption, fault-injection, or user-data check was executed. This review does not claim that an application or real workspace was restored. The prospective validations remain proposals. Source IDs S01–S09 retain their meanings; S10–S13 add separately identified primary pages where the investigator source map combined sources or used a now-older specification.

## Coverage audit against the brief and exact revealed plan

| Revealed-plan clause / brief obligation | Critic assessment | Resolution in final |
|---|---|---|
| Export records and preferences, copy attachments, and include member digests. | Adequately retained; the draft adds stable identities, inventory, size, hashes, and a generation. | Keep, and require the exact expected member set, exclusions with reasons, and schema/container version separation. |
| Mark backup current after closing the archive and reading its manifest. | Correctly rejected. Closure and readable metadata do not establish source consistency, complete selection, or usable data. | Publish only from a consistent capture after finalization, inventory and digest verification, and applicable sync checks; keep the last verified backup. |
| Assume consistency while users edit; review concurrency and snapshot boundaries. | Correctly rejected, with the important caveat that a database snapshot does not atomically capture separate attachments/preferences. | Require one coordinated generation, or detect/retry/fail when components changed; select and test the engine-specific primitive after the storage design is known. |
| Extract to temporary space, verify digests, and preview conflicts/counts. | Correct direction. Count-only preview and digest-only checks are insufficient; the draft correctly adds exact inventory, path safety, migration and semantic validation, references, and per-entity effects. | Retain staged, read-only preflight; make each verification level explicit and keep live data unchanged. |
| Replace an empty store after a new-workspace restore. | Correctly strengthens this: build and validate a candidate, perform an app-level open/read/use check, and preserve the prior workspace through promotion. | Retain guarded promotion and rollback/recovery requirements. |
| Merge by record IDs and attachment filenames, renaming conflicts. | Correctly retains record identity while rejecting filename as attachment identity and silent overwrite. | Compare IDs and content; offer explicit keep/replace/import-as-new choices and remap references on import-as-new. |
| Review references, ID collisions, and migration order. | Correctly elevated to requirements. | Migrate isolated staging data before merge simulation; block unknown newer schema; expose dangling references and recompute conflicts after migration. |
| Encrypt the complete package with a passphrase and an outer format header. | Direction is sound. “Complete package” hides inner names and payload under encryption, while visible envelope metadata remains a choice. | Keep archive, envelope, and application-schema versions distinct; document visible outer fields and do not put secrets in metadata/logs. |
| Use one corruption message for every failed opening attempt. | Correctly rejected, with one diagnostic qualification needed: an unverified visible header can be parsed but cannot establish the archive’s authentic format. | Report an unknown visible version marker as unverified metadata; report decryption/authentication failure as passphrase incorrect or archive damaged/unverifiable; classify inner errors only after complete authenticated decryption. |
| Compare protection, usability, credential failure, damage, version, and metadata exposure without impossible promises. | Mostly complete. The draft should distinguish keyed tamper detection from author/origin authentication, and should scope its claim about unsupported public headers. | Amend the encryption section accordingly; no signing, provenance, recovery, or authorship promise. |
| Give evidence-backed dispositions for consistency, publication, integrity, migration, and merge. | Supported. SQLite, ZIP, and restic claims have conditions and applicability; the security advisory includes the triggering symlink sequence and fixed version. | Retain those conditions, and add the conditional VACUUM INTO interruption case. |
| Compare direct/staged restore and incremental/whole backup. | Supported and appropriately recommendation-level: staged restore and self-contained whole archives for v1, with alternatives retained. | Keep owner choice open for container and engine; benchmark a repository/delta design only if measured needs justify it. |
| Propose witnesses for interruption, missing members, duplicate names, schema changes, failed merge, and passphrase loss. | Adequate broad matrix. A selected SQLite VACUUM INTO path also needs its documented incomplete-output-on-interruption case. | Add a conditional VACUUM INTO witness; all listed future application and user-data tests stay proposed. |
| Label executed checks and avoid claiming real/future workspace restoration. | Correct. The investigator reports documentation research and the plan-reveal helper only; no product validation is claimed. | Preserve that status and separately identify this critic’s primary-source review and static plan-hash comparison. |

## Findings that change or qualify the final

### CR-01 — Material incomplete: encryption integrity is not authorship

**Draft locator:** “Complete brief-scope treatment,” item 7; “Compare protection and usability choices,” which says authenticated encryption “authenticates ciphertext.”

**Evidence:** The age format is an encryption format with keyed header and payload authentication, not a signature or proof of who created an archive [S06, S10]. Anyone holding the passphrase can create an archive that decrypts under that passphrase. Its authentication can reject alteration without the key, but does not establish author identity, source-workspace validity, or provenance.

**Disposition:** Accepted. Final wording says “keyed integrity/tamper detection after successful decryption,” and explicitly denies author, origin, or source-state proof. No product choice is made.

### CR-02 — Material incomplete: an unverified public header is only a clue

**Draft locator:** Exact released-plan clause on “one corruption message”; proposed statement that an unsupported outer envelope can be identified before decryption.

**Evidence:** Age places a public version line and recipient stanza in the header, with a header MAC that requires the file key [S06, S10]. Before the header is authenticated, an unknown visible version can be reported as an observed marker, but not treated as proof of the file’s genuine format or intended version.

**Disposition:** Accepted. Final diagnostics call this an “unverified visible envelope/version marker.” A successful full decryption/authentication is required before inner archive or manifest details are trusted.

### CR-03 — Minor version/evidence update: the cited age specification is no longer latest

**Draft locator:** S06 and the passphrase-protection disposition.

**Evidence:** The v1.0.0 page identifies itself as an older edition and points to v1.1.0 [S06, S10]. I checked the current v1.1.0 passphrase stanza and payload rules: scrypt remains the passphrase wrapping mechanism; a scrypt stanza remains the only stanza in the header; payload authentication still uses 64 KiB chunks and requires a valid final chunk. The newer spec adds tagged recipient types, which are not a second recipient that can be mixed with the passphrase stanza.

**Disposition:** Accepted as an evidence/version update, not a rejection of the underlying mechanism. Preserve S06 for its pinned v1.0.0 claims, add S10, and require the eventual implementation to qualify against the selected library and supported spec edition. Do not represent age as selected.

### CR-04 — Material incomplete, conditional: state the VACUUM INTO interruption limit

**Draft locator:** “Consistency” and “Engine snapshot and migrations,” where SQLite Online Backup API or VACUUM INTO is proposed; SQLite snapshot validation row.

**Evidence:** SQLite describes VACUUM INTO as a consistent database snapshot, but documents that unplanned shutdown or power loss can leave its output incomplete and corrupt. Its post-completion durability statement is conditional on synchronous mode and functioning OS/filesystem/hardware [S13].

**Disposition:** Accepted. Final proposal says any VACUUM INTO output is private staging until completion and independent validation; inject interruption if this primitive is selected. This does not alter the general staging/publish recommendation or make SQLite a product assumption.

### CR-05 — Minor traceability improvement: split multi-page source identities

**Draft locator:** Investigator source-map entries S03 and S07, each of which records one exact_url but also uses a companion page.

**Evidence:** The PRAGMA and ALTER TABLE documents are separate official pages; restic backup and repository-check behavior are separate official pages [S03, S07, S11, S12].

**Disposition:** Accepted. Preserve S03 and S07 exactly as the existing primary identities and add S11 and S12 for the companion pages. Do not silently rebind a source ID.

## Claims independently checked and retained

- SQLite’s Online Backup API reads the source in steps, permits normal source activity between step calls, may restart after external source changes, permits retry for BUSY/LOCKED, treats IOERR/NOMEM/READONLY as fatal, and requires the destination connection not be used during the operation [S01].
- In WAL mode, committed data may remain in the WAL; separating the database from its WAL can lose committed transactions. The current WAL-reset notice applies only to a narrow two-connection, separate-thread/process write/checkpoint race, and names SQLite 3.51.3+ plus 3.44.6 and 3.50.7 backports as fixed releases [S02].
- SQLite user_version is an application-owned integer. integrity_check does not find foreign-key violations; foreign_key_check is separate. Foreign-key enforcement historically defaulted OFF, may be changed at compile time or in a future release, and should be set explicitly [S03].
- Python zipfile.testzip checks CRCs and file headers; zipfile.Path leaves filename sanitization to its caller. This documents an implementation boundary, not a requirement to use Python [S04].
- The Rust zip advisory’s trigger is an earlier symlink followed by a later file extracted through it; it lists affected zip crate versions >=1.3.0 and patch 2.3.0 [S05].
- Restic documents exit status 3 for an incomplete snapshot when some source files could not be read; its default check does not read every repository pack, while --read-data does [S07, S12].
- Rust rename is same-filesystem and platform-sensitive for replacement of directories; its standard-library docs do not prove power-loss durability of a multi-resource workspace swap [S08].
- NIST describes FIPS 180-4 digests as a way to detect message changes; a digest does not by itself authenticate the source of the digest [S09].

No additional selection of archive format, storage engine, crypto implementation, recovery method, or migration policy is authorized by the evidence. They remain owner decisions. The complete resolved proposal and proposed validation plan follow in final.md.
