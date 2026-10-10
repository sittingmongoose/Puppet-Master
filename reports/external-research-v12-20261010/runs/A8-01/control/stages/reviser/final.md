# Research proposal — revision-aware exhibition asset deposits

Run: A8-01-control  
Stage: reviser  
Evidence register: [sources/index.md](sources/index.md) and [source-map.json](source-map.json)

## Recommendation

For the pilot, use a directly readable BagIt 1.0 directory for each registrar-approved exhibition deposit on the gallery’s existing local storage. Keep each accepted deposit intact under a documented storage-custodian retention procedure. When a caption is corrected, create a later deposit/version, retain the earlier one, and let the registrar record the relationship between them. Do not overwrite the prior caption in place.

Assign each logical gallery asset a stable registrar-controlled asset ID, separate from its filename and digest. Give each accepted state a version ID. Keep the version relationship, role, exhibition, title, approval/current status and delivered payload path in an approved human-readable inventory. BagIt’s payload manifest should record each payload path and its digest. Recommend SHA-512 for new manifests because RFC 8493 requires BagIt 1.0 tools to support SHA-256 and SHA-512 and says SHA-512 should be enabled by default; the owners still choose and document the gallery’s actual algorithm and compatibility policy. A full file-by-file validation is needed; Payload-Oxum is only an incomplete-bag shortcut, not digest validation. [S01]

Retain OCFL 1.1 as the alternative if the gallery later needs richer object-level version history or deduplication and can own its more structured layout and validation. OCFL is a filesystem/object-storage layout, not a requirement to adopt a hosted preservation service. For the bounded pilot, BagIt is the simpler handoff package; neither format decides whether the registrar’s inventory is complete or proves that an offsite copy can be restored. [S02–S03]

Use a small controlled custody/event log as an analogy to PREMIS, recording actor and role, UTC time, action, asset/version/package, manifest reference, source and destination labels, tool/release, outcome and exception. This separates who did what and when from a digest’s narrower evidence about bytes. A git-annex location report is a possible future location-history aid, but its whereis manual says the report is based on last-received information and does not contact remotes to verify current content. It is not copy validation. [S09–S11]

The proposal does not move gallery originals, require accounts, claim that a checksum proves authorship, provenance, completeness or future recovery, or replace the existing offsite copy with an untested alternative.

## Disposition of the released plan clauses

| Clause | Evidence-based disposition |
|---|---|
| **1. Compare packaging/versioning approaches and an analogous identity/custody mechanism.** The draft says to create a ZIP per exhibition, call it immutable, and overwrite a corrected caption inside it. | Retain the per-exhibition deposit idea; reject in-place correction. Overwriting loses the earlier state. Prefer the readable BagIt directory for the pilot; a ZIP may only be a transport wrapper if every accepted version is retained and a separate enumerating manifest is checked. Compare BagIt with OCFL below. Use stable IDs and a small PREMIS-shaped event log as the analogous identity/custody mechanism; do not represent the log as PREMIS conformance. |
| **2. Explain identity, corrected versions, manifests, and integrity versus provenance/completeness.** The draft names BagIt and OCFL but does not compare their roles. | Expand the comparison. BagIt supplies a path-and-digest package manifest; it does not supply the gallery’s logical identity/version registry. OCFL supplies a structured versioned-object layout and digest-backed inventories. Use registrar IDs and relationships to explain which logical asset/version is current. Keep integrity, gallery completeness, custody/provenance and recovery as separate judgments. |
| **3. Give bounded copy/restore validation and behavior for missing files, changed names or manifest mismatch.** The draft treats one ZIP checksum as proof that all expected assets are preserved and gives no reconciliation/restore method. | Reject that proof claim. Use an approved inventory for expected coverage, a per-file manifest for paths and byte digests, and a separate custody log. Validate the local package, copied offsite destination and a restore from the existing offsite copy. Missing, extra, renamed or changed files fail or remain unresolved until reviewed; do not silently rewrite a manifest. The complete proposed protocol and failure table follow. |
| **4. Investigate released path/manifest/version history and its ordinary-storage impact.** The draft has no history and expects a successful copy to establish provenance and recovery. | Add the bounded bagit-python Unicode-path issue/fix history and the later release-specific unsafe-path check change. Correct the scope of the issue report: its reporter names an Archivematica transfer server but does not identify that destination as Linux; a later maintainer comment separately describes an OS X/Linux reproduction. These sources show a portability risk, not a guaranteed gallery failure. A successful copy/digest check records agreement with the checked reference for that operation; it does not identify authorship, establish complete inventory or prove a future restore. [S04–S08] |
| **5. Preserve and investigate the human-readable inventory as authorized optional scope, not a mandatory or established capability.** | Retain the option conditionally. Propose a plain UTF-8 CSV crosswalk and, if useful, a field guide. The registrar owns its completeness and reconciliation. Test ordinary staff usability during the pilot; no such usability test has run. If an existing authoritative catalogue already supplies prose, owners may approve a usable crosswalk instead of duplicate prose, but do not remove all human-readable inventory without an evidence-based owner finding. |
| **6. Make owner decisions explicit: registrar owns completeness/version relationships; custodian owns copy/restore; hash algorithm and package depth are recommendations for owner choice.** | Accept and operationalize these roles. Recommend SHA-512 and one full BagIt snapshot per approved exhibition deposit, but leave the actual algorithm/compatibility policy and package depth to owner approval. |
| **7. Preserve the constraints: do not move originals, create storage accounts, claim checksum authorship or backup recoverability, or replace the existing offsite copy with an untested platform.** | Accept as binding. Build only from copies in a staging area; no account or live production access is needed. Keep and use the existing offsite copy during any future approved pilot. A copy/hash pass is not a claim of restore success. |
| **8. Deliver one coherent evidence-backed proposal for obligations 1–8, with recommendations, applicability, discoveries, open owner inputs and an executed-versus-proposed validation table.** | This document is the complete proposal, with source/version evidence, owner inputs, failure handling and separate research and validation status. Public-source retrieval is research only; package, copy, validator and restore operations remain NOT_RUN. |

## Observed evidence, inference and gallery choice

### Observed behavior in the cited sources

BagIt RFC 8493 v1.0 describes a hierarchical directory layout for storage and transfer. Payload files remain directly accessible. At least one payload manifest is required and each payload manifest must list every payload file once with a path and checksum. “Complete” and “valid” have format-specific meanings: a valid bag is complete and its listed checksums verify. Those terms do not establish that the registrar supplied every item required for an exhibition. BagIt 1.0 tools must support SHA-256 and SHA-512; SHA-512 creation default is a SHOULD. Payload-Oxum is an optional quick check for incomplete bags and does not replace checksum verification. The RFC warns that platforms and filesystems differ in case sensitivity, Unicode normalization, path separators and filename limits. It also says BagIt is not designed to be secure against active attacks. [S01]

OCFL 1.1 describes a stable object ID, sequential version directories, version state/inventory and digest-to-content-path mapping. A root inventory is required, while version inventories and logs have their own optional/recommended rules. The specification says existing version directories are intended to remain unchanged when a later version is added. The 1.1 change log identifies clarification/correction work, including version-directory immutability, UTF-8 inventory and stable ID rules. These are layout/version behaviors, not evidence that a particular gallery copy or restore works. [S02–S03]

In bagit-python issue #51, the reporter says a large bag validated on a Mac and then produced missing/unexpected path warnings after copying it to an Archivematica transfer server. The issue body does not call that destination Linux. Later comments separately discuss an OS X/Linux reproduction and filesystem-dependent Unicode normalization. Commit 16f34b6 added NFD normalization for manifest filename handling and a regression test. The v1.6.0 release-tagged code uses NFC normalization-aware comparison and detects normalized-name conflicts. This is implementation- and version-specific behavior, not a universal BagIt normalization rule. [S04–S06]

A separate bagit-python v1.9.0 release and merged PR #184 document removal of environment-variable expansion from an unsafe-path check. That is a narrow implementation path-safety change, not a change to BagIt manifest semantics. Qualify and pin any future validator release rather than treating “BagIt” as evidence that a particular executable has been tested. [S07–S08]

PREMIS v3.0 supplies a useful distinction: a digest comparison using the same algorithm at two points can indicate whether bytes changed over that interval, while the event, time and outcome record the check. This does not establish authorship or authenticity. The proposed simple log borrows Event/Agent field ideas only; it is not a claim that CSV implements PREMIS. The cited PDF and HTML semantic listing phrase the entity count differently, so this proposal does not depend on an entity count. [S09–S10]

### Inference for ordinary local/offsite copies

A file-tree copy can expose path differences or collisions even where filenames look equivalent to a person. A receiving filesystem or validator may treat a composed and decomposed Unicode name differently, and case-only collisions can also be ambiguous. A byte digest alone does not detect that the intended path or inventory row changed. The issue/fix history makes this a plausible portability risk to test on the gallery’s actual source, offsite and restore environments; it does not establish that the gallery currently has such a collision or that every copy will fail.

A manifest can validate only the members it enumerates. If the registrar never added a required exhibition item to the expected inventory, a self-consistent bag cannot reveal that omission. A verified offsite copy shows that the checked copy matched the referenced package under the checks performed; it does not prove a later restore will succeed. These boundaries follow from the manifest scope and the distinct owner roles, and are not product-test results.

### Local product choice for the pilot

Use one BagIt directory per approved exhibition deposit as the initial working choice. Put the approved inventory snapshot in the payload so its bytes are included in the payload manifest. Keep the delivered filename and package path; record any explicitly approved mapping rather than silently renaming. Store the prior accepted deposit unchanged by custodian procedure and issue a new snapshot for an accepted correction. The registrar records asset/version identity, correction meaning and current status. The custodian records copying, read-back, verification, restore and exception events.

A second full snapshot may duplicate unchanged files, but it makes a small deposit independently copyable and easy to inspect. If correction-level history becomes frequent or duplicate storage matters, reassess OCFL. Package depth remains an owner choice: one bag per approved exhibition deposit is recommended initially; per-asset bags are an alternative if owners prefer smaller independent restores and accept the added package/inventory overhead.

## Comparison and operating model

| Approach | What it provides | Version/correction behavior | Fit and limits for this gallery |
|---|---|---|---|
| BagIt 1.0 directory deposit [S01] | Directly accessible payload files, a bag declaration, manifest path/digest entries and optional tag metadata/manifests. | BagIt is a package convention, not an asset/version registry. Retain the old approved deposit and issue a new snapshot; the registrar’s inventory records stable IDs and the relationship. | Best first pilot for a few file-based deposits on existing storage. Full snapshots may duplicate data. It cannot detect an item omitted from the registrar’s expected inventory. |
| OCFL 1.1 versioned object [S02–S03] | Stable object identity, ordered version directories, states, digest/path inventory and inventory digest. Files remain in a transparent filesystem/object-storage layout. | Add a later version state; prior versions are intended to remain unchanged. This represents object history more natively; the registrar still decides correction meaning and which exhibition set is complete. | Strong alternative if repeated object-level corrections or deduplication justify its rules and validator ownership. It does not require a hosted service and does not prove gallery-specific completeness or successful restore. |
| PREMIS-shaped custody log; optional git-annex [S09–S11] | A controlled human-readable event record can connect person, time, action, object, location and outcome. git-annex can record location history. | Append an event for deposit, correction, verification, copy, restore or failure/retry; preserve earlier events. | A short controlled log is sufficient for this pilot. git-annex is not needed now; whereis reports last-known remote information, not a live check. Neither the log nor the location report validates remote bytes or recovery. |

A logical asset ID is not a filename and not a digest. For example, the registrar might keep asset ID CAP-042 across caption versions, assign version 2 to the corrected caption, record that it supersedes version 1, and state why it was approved. The package manifest answers which bytes were found at which path. The human inventory answers which exhibition asset/version the registrar intended to include. A renamed path is an explicit mapping or exception, never an automatic identity change.

Keep these four judgments separate:

1. **Integrity/fixity:** do the files at the expected paths match the recorded digests?
2. **Completeness:** did the registrar approve all required exhibition assets, and does each row resolve to a package member?
3. **Custody/provenance:** who prepared, approved, copied or checked the item; when, where, with which process, and with what recorded outcome?
4. **Recoverability:** can the custodian retrieve a copy from the existing offsite location to a clean destination and use the restored files?

## Bounded copy, restore and mismatch protocol

1. The registrar freezes and approves the expected exhibition inventory, required asset classes/counts, asset IDs, version IDs and relationships. Record explicit omissions or exceptions. Do not move or alter the gallery originals.
2. Copy selected originals to a staging area. Preserve delivered names unless an approved mapping is necessary; record both names and the stable asset ID. Inspect for case-only and Unicode-normalization collisions before acceptance.
3. Build a BagIt 1.0 directory from the staging copy. Include the approved inventory snapshot as payload; create the chosen payload manifest and, if selected, a tag manifest. Record the chosen digest policy and package/version ID. SHA-512 is recommended for a new bag, subject to owner choice. Do not rely on Payload-Oxum instead of full per-file verification.
4. Run a full validator on the local package and separately reconcile the package’s complete relative-path list to the registrar-approved inventory. Record tool and pinned release, exact operation/configuration, UTC time, result, counts and exceptions. A validator’s “valid” result alone does not approve the registrar’s completeness decision.
5. Copy the exact accepted package tree to the existing offsite location. Read back from that destination. Compare paths and verify every file against the already approved reference manifest; reconcile the inventory again. Do not edit the reference manifest to make a mismatch pass. Preserve the source and destination copies when a check fails.
6. For the pilot’s restore rehearsal, retrieve the package from the existing offsite copy, using the documented custodian procedure, into a clean temporary destination. Recheck all manifest paths and digests, reconcile the inventory, and open representative photograph, caption, diagram and catalogue PDF files. Record retrieval path, tool/version, elapsed time, result and any failed/retried steps. This proposed rehearsal tests that retrieval route; one pass still does not guarantee a future disaster recovery.

| Observed condition | Required response |
|---|---|
| A manifest-listed path is absent | Fail the check and report the exact path. Investigate source, copy and destination. Do not delete the manifest row or regenerate a manifest without owner review. |
| A file appears under an unlisted or changed name | Report the unexpected and missing paths. Preserve both names and bytes. Ask the registrar to resolve an approved path mapping against the stable ID; do not auto-rename or mark complete while unresolved. |
| Path exists but its digest differs | Record integrity failure and preserve both copies. Never overwrite the source or silently replace the reference digest. If the registrar accepts the bytes as a correction, issue a new version and deposit, retaining the prior one. |
| Inventory, manifest, bag metadata or trusted reference disagree | Block acceptance pending reconciliation. The manifest cannot reveal an expected item the inventory omitted. If a manifest changes, check it against a previously trusted tag manifest, receipt or approved original package; hashing a replacement manifest against itself is not an independent baseline. |
| Unicode/case normalization conflict is reported | Fail closed, preserve names, and require explicit registrar/custodian resolution. Any comparison normalization must be part of the qualified validator behavior; it is not permission to rewrite originals. |
| Copy check passes but no offsite restore has been run | Record “copy validation passed; restore NOT_RUN.” Do not state “recoverable” or “backup proven.” |

## Supported optional inventory and owner inputs

The brief authorizes a human-readable exhibition inventory as an option; it does not make it mandatory or establish that a particular format is usable. Retain the option. Propose plain UTF-8 CSV with exhibition ID, asset ID, version ID, role, display title, payload path, current/prior relationship and exception fields. A short field guide may help staff use it. Include the approved snapshot in the package and test whether staff can open, read and reconcile it with ordinary tools during the pilot. That usability test has not run.

If a prose catalogue already serves as the authoritative human inventory, owners may approve a smaller CSV crosswalk instead of duplicating prose. Exclude the entire readable inventory only if the registrar demonstrates that an equivalent usable record already supplies the asset/version/path view. Lack of a BagIt or OCFL gallery screen is not evidence to remove the option.

Owner inputs before operational use:

1. **Registrar:** authoritative source inventory/catalogue; required asset classes and expected counts per exhibition; stable ID scheme; correction/version approval rule; who marks a version current; treatment of reused assets, aliases and path changes.
2. **Storage custodian:** local and existing offsite locations; copy method; validator and pinned release; read-back cadence; restore sample and frequency; clean temporary destination; event/exception retention procedure.
3. **Joint:** SHA-512 policy or another supported choice; compatibility and future digest-upgrade approach; one deposit bag versus per-asset bags; tolerance for duplicate snapshot bytes; control of the custody log and its independent reference.
4. **Staff:** whether CSV plus a field guide is usable without specialist repository software, and whether existing names require explicit mapping.

## Criticism dispositions in detail

- **C1 — Accept and amend (material restore detail).** The reviewer correctly observed that “restore to a clean destination” left its source unspecified. The brief is about an existing offsite copy and asks for copy/restore validation; a restore from a local staging package could leave offsite retrieval untested. The revised step 6 explicitly retrieves from the existing offsite copy, then checks the clean restored copy. The BagIt manifest checks the listed content but does not by itself demonstrate retrieval from any particular location. This is a specification correction, not a claim that a restore occurred.
- **C2 — Accept and amend (terminology).** BagIt describes a directory/package and manifests; the RFC passages reviewed do not define write protection or a retention control. “Immutable” in this proposal therefore means the custodian’s documented practice of leaving each accepted deposit unchanged and making a new deposit for corrections. OCFL’s v1.1 specification separately says its existing version directories are intended not to change when later versions are added. [S01–S03]
- **C3 — Accept (historical locator precision).** Recheck of issue #51 confirms the reporter’s Mac-to-Archivematica transfer-server report does not identify that destination as Linux. A later commenter separately says a test worked on OS X and Linux and further comments discuss platform/filesystem normalization differences. The final report keeps those observations separate; it retains the path-portability conclusion as a risk, not a claim about the reporter’s server OS or the gallery’s own files. [S04]
- **C4 — Retain as uncertainty.** Inventory authority, ID/version approval, CSV usability, path mapping, algorithm, package depth, validator, copy cadence and restore procedure remain owner/pilot inputs. They are not reasons to stop answering public questions. No owner choices or local behaviors are invented.
- **Overall reviewer agreement — not treated as authority.** The dispositions above rely on the brief and primary source checks recorded in the source map. The source-backed central recommendations remain supported; no new product defect is inferred.

## Validation and execution record

| Activity | Status | What was actually done or remains |
|---|---|---|
| Read the assigned brief, full frozen investigator discovery/draft/source map/revealed plan/plan reveal, critic critique/source map, and the two source indexes | **EXECUTED — stage review** | Read the complete listed packet. The predecessor files remain frozen and unchanged. |
| Recheck primary sources for the disputed restore, immutability and issue-location points | **EXECUTED — research only** | Direct read-only web opens/finds of RFC 8493, OCFL v1.1 specification/change log, issue #51, commit 16f34b6 and the v1.6.0 source. Exact identities, locators and reviser operation are in source-map.json. |
| Use inherited primary-source dossier for comparison/history outside the disputed subset | **REVIEWED AS CARRIED EVIDENCE — not re-opened in this stage** | S07–S11 remain linked to the predecessor source register and its exact access record. The final preserves their bounded applicability. |
| Create a BagIt package from gallery/sample assets | **PROPOSED / NOT_RUN** | No gallery assets were accessed and no package was created. |
| Run a full validator on a local package or offsite read-back | **PROPOSED / NOT_RUN** | No validator, package, local gallery copy or offsite location was operated or accessed. |
| Exercise missing file, changed name, digest mismatch or incomplete inventory | **PROPOSED / NOT_RUN** | Failure behavior was designed from source requirements and history; no local fault injection was run. |
| Restore from existing offsite copy and open representative exhibition files | **PROPOSED / NOT_RUN** | No copy or restore took place. Restore source is now explicit in the proposed protocol. |
| Test ordinary staff CSV usability or choose the actual digest/package policy | **PROPOSED / OWNER INPUT** | No staff test or owner decision was performed. |
| Create account, install software, access production, or replace existing storage | **NOT RUN / outside scope** | No such action was needed or taken. |

## Native Goal record at artifact save

The frozen objective was used verbatim:

> ER12 reviser stage, run A8-01-control: execute ER12_RUNTIME/runs/A8-01/control/stages/reviser/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.

The native Goal creation call directly returned thread ID 01a12419-aa75-7b82-ba66-7ec4c9bd564b, status active, that objective, createdAt 1791607061, updatedAt 1791607061, and tokensUsed 0. A later direct pre-terminal get_goal snapshot returned status active, tokensUsed 48120, timeUsedSeconds 76, createdAt 1791607061 and updatedAt 1791607138. These are the fields directly observed. No separate activation receipt, provider/provenance field or distinct activation timestamp was exposed; those values are UNKNOWN. Terminal status is UNKNOWN at this pre-terminal artifact save and must be taken only from the native Goal completion result.
