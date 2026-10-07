# Preservation and critical check — C-01/treatment/researcher-v1

This is the researcher's in-arm preservation critique, not an independent review, evaluator finding, or scientific acceptance. No reviewer/evaluation feedback, other-arm material, campaign results, or sibling answer was accessed.

## Input, source, and output integrity

- Read only the mapped case brief, the exact frozen case plan, the requested arm runtime budget/input map, applicable actual AGENTS instructions, and public primary sources selected for this research. The input map declares no own-arm predecessor files or sources. No other-arm/repetition, review, history, evaluator key, canonical Plans, `main`, or WorkNodes input was read.
- The brief matched its input-map identity: 6,458 bytes, SHA-256 `7943b8d93e04df133363b786fca60039f1e46cc9ee2701c930bb6dc04df9716f`. The frozen plan matched its input-map identity: 3,507 bytes, SHA-256 `5d6708c613038dc8e84a07b981e8d81b0215d6f972c8bffbb80521b0509b598f`.
- `source-map.json` parses and contains 24 unique stable source IDs. Each capture under `sources/` has the byte count and SHA-256 recorded in the map. Captures were obtained afresh for this arm; OpenSeadragon tag-addressed implementation captures were compared against the corresponding full-commit URLs and the bytes matched.
- All source IDs used in `artifact.md` exist in `source-map.json`. The artifact refers to frozen sections A-P1 through A-P7.
- The three requested outputs are present in this stage directory: `artifact.md`, `source-map.json`, and `preservation_check.md`.

## Claim checks and repairs made while drafting

| Claim or risk checked | Correction/preservation action |
|---|---|
| The brief's situation could be misread as an existing astronomy club, dataset, or validated pipeline. | Kept the hypothetical status explicit. No scientific correctness is attributed to files, targets, times, metadata, processing, or annotations. |
| A file digest could be mistaken for an observation/session identity. | Separated session, packet/attempt, asset instance, immutable version, and content digest. A digest match is only a byte-duplicate hint; context-specific attach/skip decisions remain explicit. |
| A screen/preview region could be mistaken for durable scientific or celestial coordinates. | Replaced the unvalidated preview-position assumption with a rendition-bound, top-left, zero-origin image-pixel selector. FITS/WCS is called out as a separate, normally one-based coordinate frame; no celestial mapping is proposed without later validation. |
| A newer offline note could be misdescribed as guaranteed last-write-wins. | Preserved A-P5's explicit unresolved state for simultaneous edits, reconnects, deletion, and access. The proposal uses expected revisions and preserves stale candidates for human resolution. |
| Generic file versioning could be mistaken for archival retention. | Described Nextcloud Server 35's documented pruning and storage cap. Retention and backup bounds are separate policy decisions; no deployment behavior is claimed. |
| A public issue might be over-applied based on a similar title. | The OpenSeadragon issue #2873 regression/fix is tied to concurrent `addTiledImage` callback items, exact PR, release, and current source. Issue #2925 is described as an unresolved report tied to dynamic `addTiledImage`, slow IIIF, and WebGL; applicability to a single prepared preview is explicitly unvalidated. |
| An adjacent tool/analogy could be promoted as an evaluated component. | Tropy and AstroLog are labeled analogies/leads, not selected dependencies. AstroLog source code, release artifact, and license version were not evaluated. Nextcloud docs describe a comparison mechanism, not a deployed club server/client. |
| A proposed validation could be reported as an executed test. | All application tests, harnesses, format experiments, builds, and deployments are marked proposed/not executed. Only input hash checks, source capture/hash checks, and read-only code/history inspection were performed. |

## Scientific obligations and governing conditions retained

- **O1 — Open discovery:** started from the user-level community workflow and searched broad public primary material before opening the frozen plan; source selection was based on workflow relevance, not an assigned library/defect list.
- **O2 — Competing mechanisms:** compares a server-authoritative catalog with file-folder sync and local photo-catalog exchange; includes Nextcloud, Tropy, AstroLog as bounded candidates/analogies and W3C/FITS standards as outside-domain models. Trade-offs and a maintenance condition are explicit.
- **O3 — Semantics, units, versions:** distinguishes documented standard behavior, pinned OpenSeadragon code, report/release history, and proposed design. Pins OpenSeadragon v6.0.2 to commit `7842cd92e6799d97c18227a79cb69af4f706b023`; identifies FITS Standard v4.0, W3C Recommendation editions, Nextcloud Server 35 manual scope, and the unpinned Nextcloud desktop-manual limitation. Records image-pixel, FITS/WCS-pixel, and time-scale boundaries.
- **O4 — Code and history:** inspected justified OpenSeadragon source files at a full commit and traced issue #2873 → PR #2874 → v6.0.1 release → retained callback code in v6.0.2. Records open issue #2925 with applicability and remaining uncertainty. Other products are not selected implementation dependencies; their documentation-only comparison limits are disclosed.
- **O5 — Frozen plan:** all exact sections A-P1 through A-P7 have a disposition and proposed change, including covered material to keep and new constraints to amend/replace/defer.
- **O6 — Complete proposal:** includes options, records, ingest/provenance, identity, annotations, collaboration, access, retention/deletion, failure/recovery, and handoff/export. Conditions, unresolved choices, optional leads, and a proposed observable validation matrix are explicit; performed checks are separate.
- **O7 — Integrated bounded scope:** retains the one-club workflow and offline intake/later review while excluding telescope control, autonomous observing, scientific reduction, event prediction, and public social networking. It makes no claim that supplied observation metadata or images are correct.

## Unresolved objections and approval conditions for any later product phase

1. No representative club files, typical maximum image sizes, format mix, host topology, support budget, or named system operator were supplied. Preview formats, decoder, database, and host remain pilot choices.
2. A public manual or standard cannot establish that a member's actual file conforms, that its metadata are true, or that its WCS/time conventions are complete. Preserve raw bytes/values and validate only against representative inputs.
3. Nextcloud documentation does not prove the behavior of a particular deployed patch/client, backup setup, or network. Pin exact releases and repeat concurrency, access, chunk-resume, and retention checks before depending on it.
4. W3C selector portability cannot prove semantic correspondence after a crop, rotation, stretch, stack, or reprocessing. Default to a specific version target; make re-anchoring human-reviewed.
5. The club has not decided member identity, export rights, private metadata policy, deletion requests, backup expiry, or whether downloaded packets may be redistributed. Resolve these before production use. The proposed 30-day recovery window is a recommendation requiring club approval, not a fact or current policy.
6. A service is conditional on an accountable maintainer and a successful restore drill. Without that, the packet/coordinator fallback is the bounded direction.

## Executed work versus proposed tests

**Executed:** read-only input identity verification; public-source retrieval and byte hashing; source-map/capture consistency check; read-only inspection of OpenSeadragon v6.0.2 source and public issue/PR/release pages; comparison of code captures to full-commit permalinks.

**Not executed:** product code/build; preview rendering; astronomy decoder or WCS/time conversion; upload interruption/retry; multi-user editing; access-control probe; retention/deletion; export/import; backup restore; browser experiment; or test harness. Every validation in `artifact.md` is a proposal and has no pass result.

## Negative constraints preserved

No product build, WorkNode, canonical Plans/main change, account modification, purchase, public issue/PR, private-repository access, external runner, nested worker, other-arm read, or reviewer/evaluation feedback was used or requested by this research.
