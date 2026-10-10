# Independent critic review — A8-01-control

## Scope and judgment

Reviewed the complete brief, discovery, draft, investigator source map and source index, revealed plan, and plan-reveal record specified by the critic input map. Independently opened the cited primary sources and checked the consequential claims listed in the critic source map. No product, package, validator, gallery file, local copy, offsite copy, or restore was operated. The source review was read-only research, not product validation.

The draft is a coherent and substantially faithful response to the brief and corrects the central unsafe plan assumptions. It preserves the optional inventory, all negative constraints, explicit owner roles, and open algorithm/package-depth decisions. It does not claim research retrieval or proposed checks as product validation. I found no material wrong claim and no unsupported recommendation among the reviewed claims. One material validation detail remains underspecified.

## Obligation and plan coverage

| Brief obligation | Draft disposition | Critic finding |
|---|---|---|
| 1. Compare two packaging/versioning approaches and an analogous identity/custody mechanism | Recommendation; “Clause-by-clause disposition”; “Evidence-backed comparison and operating model” | Covered. BagIt 1.0 and OCFL 1.1 are compared for their distinct package/object-version responsibilities. Stable asset IDs and a PREMIS-shaped event log supply a suitably small analogue; git-annex is bounded as optional location history. Sources S01–S03 and S09–S11 support the distinctions. |
| 2. Explain identity, corrected versions, manifests, integrity, provenance and completeness | “Identity and boundaries”; BagIt/OCFL table | Covered. The draft separates logical ID and registrar-approved relationship from path/digest, describes a correction as a retained new version, and distinguishes integrity from completeness, custody/provenance and recoverability. |
| 3. Give bounded copy/restore checks and failure behavior | “Bounded copy, restore and mismatch protocol,” steps 1–6 and condition table | Mostly covered; see material incomplete finding C1 below. Missing paths, unlisted paths, changed names, digest mismatch, manifest/inventory mismatch, and untested restore are assigned explicit outcomes. |
| 4. Investigate released path/manifest/version history and local/offsite impact | Plan clause 4; source S04–S08; BagIt comparison | Covered. The Unicode normalization incident, fix, released implementation behavior, and later unsafe-path check change are distinguished from the BagIt format. The ordinary-copy implication is presented as a risk/inference and not as a guaranteed gallery failure. |
| 5. Preserve the authorized optional readable inventory | Plan clause 5; “Supported optional improvement” | Covered. CSV and staff usability are proposals to verify, not claimed technical capabilities or newly mandatory scope. The stated exclusion condition retains an owner-approved usable crosswalk. |
| 6. Assign owners and keep hash/depth as owner decisions | Plan clause 6; “Owner inputs to resolve” | Covered. Registrar owns completeness and version relationships; storage custodian owns copy/restore. SHA-512 and one bag per approved exhibition deposit are recommendations awaiting owner confirmation. |
| 7. Preserve negative constraints | Recommendation; plan clause 7; validation steps | Covered. Originals stay put, no account or new platform is required, the existing offsite copy remains, and checksum/recovery claims are bounded. |
| 8. Deliver evidence-backed proposal with executed/proposed validation separated | Entire draft; “Validation and execution record” | Covered. Public source review is labeled research only; package, copy, validator, fault-injection and restore activities are proposed/NOT_RUN. The source IDs remain traceable to the supplied register. |

## Findings

### C1 — Material incomplete: restore source is not stated

**Location:** draft.md, “Bounded copy, restore and mismatch protocol,” step 6; also the proposed restore row in “Validation and execution record.”

The draft says to restore a selected package to a clean temporary destination, but does not say whether the restore starts from the new offsite copy or the local staging/package copy. This is material to the scope of the proposed validation: a local-source restore could pass while leaving the existing offsite copy’s retrieval path unexercised. The brief specifically asks for copy/restore validation in the context of an existing offsite copy, and forbids representing an untested copy as recoverable. State the source of the restore explicitly; the relevant rehearsal should retrieve from the existing offsite copy if it is meant to exercise that copy. This is a finding about proposal specificity, not evidence that the author intended a local source or that any restore occurred.

**Evidence:** Brief obligations 3 and 8; draft step 5 copies to the existing offsite location, while step 6 names only the clean destination. BagIt’s manifest validates listed paths and bytes (S01); it does not itself demonstrate the custodian can retrieve from a particular location.

### C2 — Minor locator/wording: qualify “immutable” as a local retention practice

**Location:** draft.md, opening recommendation (“immutable prior deposit”) and comparison table (“retain every accepted package unchanged”).

This is sound as an owner-controlled practice, but BagIt is a filesystem layout and manifest format; the RFC does not provide an immutability or access-control mechanism. The surrounding draft explains retaining a new deposit and keeping the old one, so this is not a material error. Clarify that “immutable” means the custodian’s documented retention procedure for the pilot, not a property enforced by BagIt. OCFL, by comparison, expressly describes its version directories as intended to remain unchanged when later versions are added (S02–S03).

### C3 — Minor locator/wording: distinguish the issue reporter’s destination from a Linux reproduction

**Location:** investigator/source-map.json, S04; carried sources/index.md, S04.

The issue reporter says a bag validated on a Mac was copied to an “Archivematica transfer server”; the issue text does not identify that server as Linux. A later maintainer comment describes a separate reproduction on Linux. The issue and fix remain directly relevant, and the draft itself says “another server,” so this does not undermine the conclusion. Keep those two observations distinct when describing the historic path. See S04.

### C4 — Honestly unresolved external inputs; correctly left open

**Locations:** draft.md, “Owner inputs to resolve” and “Supported optional improvement.”

The authoritative inventory, asset-ID/version approval rules, staff usability of CSV, path mapping policy, selected digest policy, package depth, validator release, and check/restore cadence require gallery owner decisions or a local pilot. The draft identifies these as pending inputs rather than using them to avoid public research. They are legitimate open decisions, not findings of missing research.

### No material wrong or unsupported findings

The inspected BagIt evidence supports the draft’s SHA-512 SHOULD-versus-MUST distinction, separate complete/valid concepts, Payload-Oxum limit, direct file access, and path portability cautions (S01). OCFL’s stable ID, version state/inventory, intended version immutability and v1.1 clarifications are supported (S02–S03). The incident/fix claims, release-specific path behavior, PREMIS fixity limits, and git-annex whereis limitation are scoped to the inspected sources (S04–S11). The proposal does not treat a checksum as evidence of authorship, completeness, custody or future recovery.

## Validation status after independent review

| Activity | Status | Basis |
|---|---|---|
| Critic review of brief, plan and investigator packet | EXECUTED | Read the full frozen files listed in input-map.json, including the carried source index. |
| Independent public primary-source review | EXECUTED — research only | Read-only web open/find of sources S01–S11; see source-map.json and sources/index.md. |
| Product/package/validator operation; local or offsite copy; restore | NOT_RUN | No product or file operation was performed in this stage. |
| Proposed sample-package, offsite read-back, path-failure and restore exercises | PROPOSED / NOT_RUN | These remain future owner-approved checks. The restore origin needs clarification per C1. |

## Native Goal observation

The native Goal tool returned one created Goal with thread ID 01a12410-fd0b-77a3-8df3-d0e84861fe88, the frozen objective verbatim, and status active. It returned createdAt=1791606487 and updatedAt=1791606487 at creation. A direct get_goal snapshot returned status active, tokensUsed=71038, timeUsedSeconds=99, createdAt=1791606487, and updatedAt=1791606587. The tool exposed no separate activation receipt, provider/provenance field, or terminal timestamp; those are UNKNOWN. No terminal completion is claimed in this pre-terminal artifact.
