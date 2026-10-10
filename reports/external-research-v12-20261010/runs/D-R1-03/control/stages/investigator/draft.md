# Research proposal — uncertain provenance after an oral-history archive migration

**Case:** ER12-D-R1-03-FRESH / slot D-R1-03  
**Stage:** investigator, run D-R1-03-control  
**Evidence base:** assigned synthetic brief; public primary standards, tool documentation and implementation history referenced by source IDs in source-map.json. No archive material was supplied.

## Proposal in brief

Run a bounded, read-only provenance investigation that reports separate conclusions for (1) bit-level continuity, (2) recorded-interview identity, (3) completeness, and (4) transcript-to-recording relationships. Use an authorized inventory and any trustworthy pre-move manifests first; add technical metadata and documented relationship/event records next; use content comparison only to nominate candidates; independently adjudicate a declared sample. Maintain an unresolved relationship queue and current-path crosswalk. Preserve current files and names during this stage.

A reasonable starting design is a staged hybrid. It begins with fixity and inventory because those checks can find exact continuity evidence cheaply when a prior baseline exists. It then applies metadata and relationship records to explain renamed or differently encoded versions. Human review resolves selected candidates under approved access rules. This is a provisional sequence, not a finding that one evidence source or product is the right solution. A manual-only route remains useful for a very small inventory or where processing tools and permissions are unavailable.

## Scenario facts and boundaries

The supplied scenario describes an oral-history archive that moved audio and transcripts from an older shared drive to new storage; some transcript filenames no longer exist; some recordings have two apparently different copies; a volunteer recalls batch renaming; and no complete migration log has been found. The brief says the case is synthetic and supplies no actual files or personal records. These are scenario premises, not findings independently verified by this research. The unresolved source-drive availability, formats, naming rules, transcript origin, consent restrictions, counts, baselines, migration tools, and copy roles remain open.

The requested 60-minute research session could not fit the investigator stage clock: the native Goal was activated at 2026-10-10T06:24:43Z and this stage has a hard deadline of 2026-10-10T06:54:08.010Z, a maximum window of about 29 minutes 25 seconds including setup and delivery. This draft does not claim a 60-minute session or empirical archive study. The stage's absolute deadline remains binding; any additional research time is an owner decision.

## Exact clause disposition

The quoted clauses below reproduce the brief's scope. “Preserve” means the draft retains the obligation. It does not indicate that a case-level check has passed.

| Exact clause | Disposition | What the proposal supports / what remains |
|---|---|---|
| “Use a 60-minute research session to develop a proposal for studying file continuity, recording identity, and transcript relationships across the migration.” | Preserve scope; delivery-time limitation recorded | The proposal covers all three subject areas plus the separately required completeness question. The stage's 29m25s maximum envelope is shorter than 60 minutes. No extra time is assumed. |
| “Compare useful strategies, explain what each mechanism establishes and leaves unresolved, and investigate implementation and preservation history.” | Preserve; evidence and limits stated below | Compare manifests/fixity, metadata and content methods, plus manual sampling. Public product docs and issue/release records inform likely processing behavior; they do not identify the archive's actual workflow. |
| “Give a reversible pilot plan with clear evidence limits, not an archive-management tool or a complete migration repair.” | Preserve | Pilot uses a read-only snapshot/copy, append-only evidence ledger, source/target crosswalk and unresolved queue. It performs no file cleanup or repair. No product is requested. |
| “Separate bit-level continuity, identity of the recorded interview, completeness, and the correctness of transcript-to-recording links.” | Preserve; make four separate finding fields mandatory | A report should never use a single “same/different” status for all four. Each conclusion needs its own cited evidence, scope and uncertainty. |
| “Compare manifest or fixity approaches with metadata and content-based relationship investigation and a useful manual sampling alternative.” | Preserve | Four strategies and their reach/limits are compared in the following section. A hybrid is a provisional planning sequence; manual review is a viable fallback. |
| “Address renamed files, transcoded versions, partial recordings, and ambiguous duplicates without assuming equal names or unequal hashes settle identity.” | Preserve | Treat names, hashes, metadata and fingerprints as different evidence. Classify candidates separately and retain unresolved cases; do not merge, rename, or infer an identity from one clue. |
| “Include migration and comparable implementation history, specifying which missing records would change the evidential interpretation.” | Preserve; add condition-specific examples | Archivematica documentation shows original/derivative co-existence and versioned policies/events; issue #346 reports a duplicate-checksum validator edge case. Missing inventories, logs, tool versions, mappings, recording extents and transcript provenance are listed below. None proves Archivematica was used here. |
| “Propose a reversible pilot, independent checks of sampled relationships, provenance recording, and handling of unresolved items; distinguish proposed validation from any checks actually executed.” | Preserve | The pilot specifies a second reviewer, independent sample, retained logs and event provenance. The final status section lists executed artifact/process checks separately from proposed case checks. |
| “Do not delete, merge, rename, transcode, publish, or upload archive material.” | Preserve as a hard boundary | All case-facing actions are read-only and local to an authorized copy or permitted metadata inventory. No archive material was available or changed in this research. |
| “Do not infer consent, authenticity, or completeness from a checksum match or a plausible transcript.” | Preserve as a hard evidential rule | Consent must be established by the archive's policy/records. Fixity and transcript plausibility have narrower evidential reach described below. |
| “Do not access personal interviews, contact interviewees, create accounts, or invent recovered migration records.” | Preserve as a hard boundary | No interviews, transcripts or personal records were accessed; no interviewee was contacted; no account was created; no missing record is represented as recovered. |
| “The old-drive availability, formats, naming rules, transcript origin, consent restrictions, file counts, baseline checksums, and migration tools are unknown.” | Keep unresolved; seek only from archive custodians in a later authorized phase | These unknowns determine which comparisons are possible and permissible. Research does not fill them by analogy. |
| “We have not said whether both apparent copies are preservation originals, access derivatives, or incomplete exports.” | Keep unresolved; use explicit competing hypotheses | Retain original/derivative, same-session transcode, repeated/partial recording, duplicate copy, and unresolved as distinct possibilities until supported. |
| “Keep these questions unresolved until evidence supports a conclusion.” | Preserve as an evidential rule | No hypothesis is upgraded to a case finding without new, attributable evidence; disagreement and missing evidence remain visible. |

## Evidence model and comparison

| Evidence route | Positive result can support | Negative result or missing record means | Recommended use |
|---|---|---|---|
| Prior and current manifests/fixity | If a dated, trusted source manifest is tied to the pre-move objects and matching hashes are checked against identified destination objects, it supports byte-level continuity for that scope. BagIt 1.0 defines completeness against its manifest and validity against successful checksum verification [S01]. | A current-only hash is a future monitoring baseline, not a past migration witness. A mismatch may follow a transcode or metadata rewrite; it does not prove a different interview. A valid package can still omit objects absent from the declared inventory. | Compare exact source/destination object IDs and paths, retaining each manifest, algorithm, command, tool version, UTC, validation output and errors. BagIt recommends SHA-512 by default and requires SHA-256/SHA-512 support; older manifests may use legacy algorithms [S01]. |
| Filesystem and embedded metadata | Stable IDs, original/new path events, sizes, creation/modification times, format/codec, channels, sample rate, duration, BWF originator/coding fields, and transcript IDs can corroborate candidate links. ffprobe provides selectable container/stream metadata but its seeking intervals are not exact [S05]. | Names and timestamps can change during migration; embedded values can be absent, copied, stale or generated by different clocks. A duration or matching speaker label is not proof of a full interview. | Preserve raw metadata output and tool version. Interpret BWF clues only if the file is BWF [S04]. Require agreement across independent fields and records. |
| Preservation relationships and events | PREMIS provides File/Representation/Intellectual Entity objects, derivation/structural relationships, event time, agents, detail and outcomes [S02]. PBCore provides audiovisual instantiation relation types and identifiers [S03]. Archivematica documents specific events for fixity, normalization and filename changes [S15]. | PREMIS detail/outcome fields can be optional; their absence does not prove no migration. A stored relation is an assertion, not independently verified fact. A product's current defaults cannot identify historical local settings. | Request source-target IDs, the event and actor/tool/version, commands/configuration, times with zone, results and preserved reports. Keep each object as a node and each supported relation as a separately sourced edge. |
| Content comparison | A near-identical audio fingerprint or reviewed, permissioned audio alignment can nominate a same-recording or excerpt candidate. Chromaprint is intended for near-identical audio and identifies its performance/robustness trade-off [S09]. | No fingerprint hit may reflect short input, partial overlap, transcoding, alignment, decoding/version behavior or a different recording; a positive score does not establish provenance, authenticity, full extent or transcript correctness. Chromaprint v1.6.1 fixed partial-frame handling, and an open issue reports a Test3-specific short-input behavior [S10–S11]. | Pin the algorithm/version, record windows/settings and treat scores as triage only. Do not use unvalidated short-window negatives. Listen only after authorization. |
| Manual sample and adjudication | For small sets, two people can compare a declared sample using inventory, metadata, available records, and authorized content anchors. A case ledger keeps reasons readable. | An unstructured sample cannot estimate whole-archive error rates or exhaustively establish every link. Human agreement is not a substitute for missing source records. | Include every anomaly class plus a separate random sample. Have the second reviewer choose and assess cases independently before comparing results. Report sample design, coverage, conflicts, and unreviewed material. |

### Interpret the reported anomalies as competing hypotheses

- **Renamed files:** path changes alone do not alter the bytes hashed. Compare retained source and destination paths, stable IDs, rename batches, event records and manifest rows. Archivematica documents a filename-change PREMIS event that can include old and new names [S15]. Its manual-normalization workflow can use matching filenames as an association key only inside a prescribed folder structure with constrained cardinality [S16]. That is a workflow-specific behavior, not general evidence that equal names identify the same recording.
- **Two apparent copies with equal hashes:** under the selected algorithm and checked scope, this supports byte-identical contents. It does not establish which copy is original, whether both are independently preserved, or whether either is complete. Retain both path/object IDs in the inventory until custodial roles are known.
- **Two apparent copies with different hashes:** consider metadata-only rewrite, container change, transcode, different technical representation, truncation, different recording, or corruption. Do not conclude “different interview” from hash inequality. Compare media metadata, stable IDs, source/target events and authorized content anchors.
- **Transcoded versions:** a transcode normally changes bytes. Archivematica 1.17.1 documents keeping ingested originals while creating preservation/access versions under format policy [S06, S12]. Recover the policy revision and actual tool/command/version, input/output IDs, event details/outcome, and validation before calling an extant pair source/derivative. Product docs are a comparable implementation, not evidence of this archive's use.
- **Partial recordings:** compare against expected session/reel/segment inventories and duration/stream data; if approved, inspect several separated content anchors with a qualified reviewer. A shared excerpt can indicate relationship while leaving boundaries, order and completeness unknown. Fingerprint failure on a short window is not proof of difference [S11].
- **Transcript references:** preserve the transcript's original filename as evidence, then use transcript version/origin, interview/session ID, timestamps or segment labels, and independent text/audio anchors to adjudicate the link. A plausible transcript can still be stale, partial, edited or linked to another take. Do not treat this as a consent or authenticity decision.

## Implementation and preservation history

The standards and product records suggest which operational documents are most valuable to seek, subject to confirmation that the archive used the relevant practice:

1. **BagIt / manifests.** RFC 8493 treats the payload as opaque octets; package path/names do not carry semantic identity. Its “complete” and “valid” states are scoped to the package and its manifests, not the archive's unstated intended holdings [S01]. A prior source inventory plus per-item hashes can support continuity; a manifest generated only after the move cannot recreate the missing link.
2. **PREMIS and PBCore.** PREMIS object categories let a repository distinguish a File from a broader intellectual entity and its Representation; a derivation relation and linked Event can express source/output and operation [S02]. PBCore instantiation relations provide labels such as derivative/source or version relationships with a related identifier [S03]. Ask for object identifiers and the evidence behind each relationship rather than accepting a detached metadata statement.
3. **Archivematica configuration and records.** Its 1.17.1 documentation describes external checksum verification during Transfer, per-object UUID/checksum assignment, and METS capture of original transfer order [S13]. It describes original retention plus preservation/access normalization under a Format Policy Registry; local rules can differ and rule revision history is available [S06, S12]. Its PREMIS implementation records fixity checks when a checksum manifest was ingested, normalizing events for derivative workflows, and filename-change events when that microservice ran [S15]. The release-specific policy/configuration, transfer manifest, UUID/path crosswalk, METS, PREMIS, command version, event details and job logs would materially change interpretation if this implementation was actually used.
4. **Error handling and validator history.** In Archivematica 1.17.1, checksum verification failures are documented as transfer-halting; normalization failures may be reported while work continues, with review/redo decisions available; a user can reject a workflow item [S14]. These states differ, so collect exact error stage and job output rather than summarizing all “errors” as failed migration. Issue #346 reports an older duplicate-checksum case with an aggregate error despite per-file passes [S08]; its closure/milestone do not reveal the shipped fix. No rollback guarantee is established by these docs. A safe pilot should avoid changing the source and keep any transforms outside the preservation copy.

The most important missing evidence is:
- source-drive availability and a dated pre-move item inventory/fixity record;
- a source-to-destination path and stable-ID crosswalk, rename batch rules, and inventory scope;
- migration tool, release, commands/configuration, operator/automation identity, times/time zone, errors/retries, per-item outcomes and rollback/decision logs;
- a trustworthy expected session/reel/segment inventory and evidence defining what a “complete” recording means;
- origin and version history of each transcript, stable interview ID and prior link data;
- file formats/codecs, embedded metadata and records of intentional transcodes/derivative policy;
- permission/consent limits and approved location/method for any content review;
- baseline hash algorithm, manifest scope, generating tool and validation logs.

Records made before the move carry stronger temporal evidence than a retrospective inventory. A post-move inventory remains useful for preserving current state and future monitoring, but it cannot be promoted into a historical migration log.

## Reversible pilot

### Gate before any content access

The archive owner supplies the authorized item set, confirms whether the old drive is available, identifies what constitutes an expected interview/session, explains transcript provenance, and approves the least-sensitive inspection permitted by consent/access restrictions. If permission does not cover listening or transcript review, stop at approved metadata/record-level evidence and list the decision as unresolved. Do not contact interviewees.

### Read-only setup and inventory

1. Use a read-only snapshot/copy or a permitted metadata inventory. Record snapshot identifier, time, storage scope, path observation rules and access custodian. Keep an untouched reference. Use opaque pilot IDs with a separately restricted identity crosswalk.
2. Produce an item-level inventory with current and any known prior path, stable source/destination identifiers, size, reported timestamps and their field/source, format/codec identification, selected embedded fields, and SHA-256 or SHA-512. Record command, tool/version, UTC with zone, operator, input scope, exit/result, exceptions, and digest of each report.
3. If pre-move manifests exist, compare them item by item. Keep three result categories distinct: exact fixity match, fixity difference needing relationship investigation, and no reference baseline. Preserve the original manifests and raw per-item results. Independently rerun a declared subset with a second qualified implementation; retain both outputs and explain disagreements. A present-day manifest is labeled a new baseline.
4. Build a candidate relationship table, not a merged collection. Each row contains source object ID, candidate target ID, proposed relation type, evidence source IDs, supporting/contradicting observations, scope, confidence rationale, reviewer, status and next evidence needed. Use explicit statuses such as byte-identical, possible transcode/derivative, possible partial/segment, possible duplicate, distinct candidate, and unresolved. These are working labels, not determinations.

### Relationship checks and independent sample

5. Characterize only authorized audio with a pinned tool/version; preserve raw metadata. Compare BWF fields when applicable. For candidates with different hashes, check expected codec/sample-rate/channel changes, duration, segment cues and source/target events. Use an audio fingerprint only as candidate ranking. Record input ranges and algorithm. Do not infer identity from a single fingerprint score.
6. Sample every anomaly category and separately choose a random sample from ordinary rows. A reviewer who did not create the candidate links independently checks the underlying records and available anchors, records a provisional decision and rationale, then compares decisions with the first reviewer. Record disagreements and the adjudication step. The sample is not a whole-archive accuracy claim unless a formal sampling design is separately approved.
7. For transcript relations, use transcript IDs/version history and references to stable interview/session IDs. If permitted, verify more than one separated anchor; if timing or partial coverage is unknown, label extent unverified. Do not claim transcript correctness based only on a plausible text/audio match.

### Provenance, reversibility and exit

8. Record each inventory, comparison, review and decision as an event: unique event ID, input/output object IDs, action, UTC/time zone, agent, tool/version, configuration/parameters, outcome, exceptions, report/log URI and report digest. PREMIS 3.0 provides a model for events, object relationships and agents [S02]. Keep the first observations immutable and add corrections as new, linked entries.
9. Keep unresolved candidates in a non-mutating queue with the strongest supporting and contradicting evidence, missing record, access limitation and next request. The pilot's useful outcome may be a bounded set of high-confidence links plus explicitly unresolved cases.
10. End by preserving the inventory, source documents, manifests, tool reports, sample selections, independent assessments, open-item queue, and an account of what was not examined. Reconcile object counts against the authorized scope. Do not delete, merge, rename, transcode, publish or upload anything. No production migration or repair is part of this proposal.

### Manual alternative

If the collection is sufficiently small and approved tools are unavailable, two reviewers can use the same inventory/candidate ledger without fingerprint generation. Select all anomaly types plus a documented random subset, compare only records and content access explicitly allowed, and independently record each decision. This route reduces automation and may be easier to audit, while leaving unexamined items and statistical limits explicit.

## Corrections, optional improvements, and owner decisions

### Corrections to any premature conclusion

No correction to the original brief is proposed. Any later report should correct these unsupported conclusions if they appear:

- A matching checksum proves only matching bytes for the compared scope and trusted baseline; it does not prove consent, authenticity, interview completeness or transcript correctness.
- Different hashes do not prove different interview identity; names do not prove equality or relationship.
- A present-day manifest cannot be described as the missing historical migration record.
- A tool's current default cannot stand in for historical release/configuration.
- A fingerprint match or plausible transcript is a candidate relationship, not a provenance finding.

### Optional improvements to the research method

- Use a stable object-ID layer and explicit typed relation edges, preserving all names as attributes/crosswalks rather than changing them. PREMIS and PBCore offer candidate models [S02–S03].
- Use a staged hybrid—fixity first, metadata/event reconstruction second, content comparison only where needed, independent sampling last—when authorization and records make these stages feasible.
- Include both anomaly-stratified and random sampling, a second reviewer, and a separate record of disagreements.
- Add a restricted uncertainty register with evidence lineage and next evidence request; set no automatic “duplicate” or “repair” rule.
- Preserve an untouched snapshot and report digests so that the pilot can be discarded without changing archival holdings.

### Decisions only the archive owner can supply

- Whether the source drive or backups can be read and which prior inventories/manifests are trusted.
- The authorized collection scope and whether any audio/transcript content may be examined under consent and access rules.
- The archival definition of one interview, segment, take, reel and complete recording, including expected counts/order.
- Which, if any, copy is the preservation source, an access derivative or an incomplete export; the research begins with these as open hypotheses.
- Transcript origin, revision history and stable identifiers; local naming rules and any batch rename conventions.
- Whether to authorize an extended research window or a later implementation phase beyond this stage's deadline.
- Whether a later catalog crosswalk or naming policy is useful. Restoring old names is not required for this investigation; preserve current names and document mappings unless the owner sets a later requirement.

## Executed versus proposed validation

**Executed in this stage:** the exact-goal binding guard passed for the one activated native Goal; the discovery and source-map artifacts were checked for size, JSON parsing and unique source IDs; the plan-release helper ran once and recorded the discovery SHA-256 before revealing the plan; public primary source pages were opened as listed in the source map.

**Proposed only:** reading archive inventories/manifests; computing or verifying archive checksums; characterizing audio; generating fingerprints; checking completeness; listening or inspecting transcript passages; independent sample review; source/target link adjudication. None of these case-facing checks ran because no archive files, personal records, migration logs or authorized inventory were supplied.

**Evidence limit:** this research supports a careful study design and names potentially useful records/tools. It supports no finding about the actual archive's continuity, interview identities, completeness, transcript relationships, consent or authenticity.
