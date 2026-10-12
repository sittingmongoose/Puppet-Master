# Independent critic — Durable references to local project attachments

**Run/stage:** B11-P01-treatment / critic  
**Scope:** Full brief and one-shot released plan, reviewed against the complete investigator discovery, draft, source map, plan reveal, and source index. The released plan SHA-256 in plan-reveal.json is 8fb50111ed44f6ff62a1041cfb9f2fb39d9787599ad24efcadaa3d45e02e8353.  
**Disposition:** The investigator draft substantially answers the brief and rejects the plan’s unsafe automatic-relink, single-path, watcher-rewrite, and stale whole-table-write choices. It preserves the brief’s scope and user-control constraints. One material incomplete issue below should be resolved by the fresh reviser. This critique makes no final or implementation change.

## Brief-obligation coverage

| Brief obligation | Draft coverage and judgment |
|---|---|
| Separate attachment record from file location and identity | Strong coverage: stable record UUID, locator kind/anchor, last-known path, optional time-stamped identity/metadata observations; project-relative, configured-root, and local-absolute locators are distinguished. File IDs, bookmarks, portal grants, URIs, and digests are not presented as universal identity. |
| Find or verify a candidate replacement | Strong coverage: bounded search after user intent, candidate reasons and details, ambiguity shown, explicit confirmation, no newest-match or digest-only automatic relink. Keep exact-path opening caveat in Issue M1. |
| OS/filesystem differences | Strong coverage: macOS sandbox bookmarks and same-volume document IDs, Linux device/inode and portal access, Windows file IDs and Distributed Link Tracking conditions, path/URI root differences, and watcher failure modes are separated. These remain conditional pending the owner’s OS/version, packaging, and filesystem matrix. |
| Preserve user control and missing/removable-drive states | Strong coverage: missing, denied, and volume-unavailable states; persistent records on failure; cancelable recovery; no silent copy, upload, mutation, or relink. The mismatch-at-open policy is the material gap in M1. |
| Compare simple portable and stronger mechanisms | Strong coverage: project-relative paths, configured base-root mapping, absolute fallback, platform access/identity aids, DLT, digest, and managed-copy alternative have useful trade-offs and do not overpromise recovery. |
| Make a realistic component proposal and integration boundaries | Strong coverage: attach/link action, persistence boundary, locator/access resolver, bounded candidate discovery, relink, status, open, and export disclosure; excludes a general file manager and background global index. |
| Retain/revise/reject exact plan choices | All C1–C11 are addressed below. The draft preserves the useful table/record IDs/path-first attempt/status/Browse/export/locality constraints while correcting the unsafe choices. |
| Unresolved user-specific facts and meaningful validation | Eight concrete owner questions cover OS/sandbox, storage/process model, external roots, network filesystems, token/digest/export policy, and removal. Proposed validation is detailed and adversarial; it is clearly separated from executed checks. |

## Exact plan disposition review

| Plan clause | Draft disposition | Critic assessment |
|---|---|---|
| C1: one table, ID/name, absolute path, size/date, mandatory first-link digest | Retain record/ID/name; replace single path with explicit locator and make observations/digest optional | Supported. The plan conflates location with identity; a digest can cost I/O, go stale after edits, and match byte-identical copies. Version/time metadata and target-platform policy remain product choices. |
| C2: try saved path first | Retain with locator-specific resolution and access handling | Direction is sensible, but the policy for a path now naming a different file is materially incomplete; see M1. |
| C3: scan project/recent folders by size+digest and auto-choose newest | Replace with bounded, user-requested search and confirmed relink | Supported. Digest/content equality, size, name, and modification time are candidate evidence, not authority or safe tie-breakers. Zotero provides a relevant bounded-base and offer-to-relink precedent (V07–V08). |
| C4: removable-drive current mount path | Reject as sole durable locator; retain volume-relative path and scoped platform hints | Supported as a direction. macOS document IDs can survive same-volume moves/restarts, but are not copied, only unique within a volume, and unsupported on some volumes; volume UUID may be unavailable (V02–V03). Windows FILE_ID_INFO is a live same-computer comparison, not a portable locator (V04). |
| C5: watch folders and rewrite paths on rename | Optional best-effort status refresh; reject automatic durable rewrite | Supported. FSEvents requires rescans on coalesced/dropped/root-changed events, Windows notifications discard buffers on overflow, and Linux inotify has event-loss and rename limitations. The proposed UI refresh/recovery use is safer than treating events as identity proof (V05–V06, V11). |
| C6: each window replaces a whole stale table file | Reject; shared revision-aware persistence and conflicts | Supported. SQLite’s one simultaneous writer does not itself establish application merge semantics (V09). Atomic replacement alone likewise does not prevent lost updates. |
| C7: export table/list and optional explicit copy | Retain with clear external-file omission and explicit inclusion results | Supported. The draft prevents implying linked files are packaged and preserves explicit-copy boundaries. Add a path/token privacy decision to the existing export questions; see m2. |
| C8: available/missing plus Browse | Retain and expand recoverable states/actions | Supported and useful. Removing a reference is separated from touching its source file. |
| C9: same behavior on every desktop OS | Reject; common flow with platform adapters | Supported. Locator syntax, access grants, object-ID scope, removable volumes, and watchers materially differ. |
| C10: local, preserve IDs, no privileged service or silent copy | Retain as hard constraints | Faithful to brief. Cloud sync/upload and broad indexing are also correctly excluded. |
| C11: proposal, not implementation evidence | Retain | Accurate. Research and proposal do not claim application implementation or runtime validation. |

## Findings

### M1 — Material incomplete: define what “open the saved path” means after path reuse

**Draft locators:** C2; “Open and status flow”; “Reference record”; “Relink flow.”  
The draft says to resolve the saved locator first and verify that the item can be opened; it also recommends inspecting available identity observations. It does not state the user-visible action when the path exists but now resolves to another file, the identity differs, or the platform cannot provide a comparable identifier. C4 addresses a different volume/file during removable-drive handling, but “without verification” does not establish a universal verification method or say whether ordinary open is blocked, warned, or treated as path semantics.

This matters because the brief explicitly distinguishes a file’s location from identity and requires user control. A reused path can silently open unrelated or replacement content even when all missing-file and relink flows are safe. The cited identifiers cannot settle this uniformly: Apple’s document identifier is same-volume and unsupported on some volumes (V02); Windows FILE_ID_INFO compares open handles on one computer (V04); Linux inode/device pairs are filesystem-scoped in the carried S06. No portable ID is guaranteed.

**Request to reviser:** State the product semantic for a linked reference (path-following versus same-object expectation) and the default when a stored observation mismatches or is unavailable. At minimum make the event visible and avoid silently changing the locator or claiming same-file identity; decide whether a warning/confirmation is required before opening. Keep this conditional on owner policy where necessary.

**Classification:** material incomplete. This is a design gap, not evidence that the recommendation’s overall direction is wrong.

### m2 — Minor locator/wording: make local-path and token export privacy explicit

**Draft locators:** C7; “Project move and export”; owner decisions #5.  
The draft does disclose that links stay external, asks whether opaque access tokens travel, and makes file inclusion explicit. It does not say whether readable export manifests may reveal user names, private folder names, share names, or volume labels through absolute/last-known paths and observations. Those details can be sensitive even though the source bytes are not copied.

**Request to reviser:** Add a product decision or unresolved owner question for path redaction/visibility and for inclusion of native tokens, digests, and volume hints in exports. This is a policy clarification, not a reason to drop readable export.

**Classification:** minor locator/wording.

### m3 — Minor locator/wording: qualify archived watcher evidence

**Draft locators:** C5; “Alternatives and trade-offs”; proposed watcher validation.  
The Apple File System Events guide is an archive last updated in 2012 (V11). Its described coalescing, dropped-event, and rescan requirements support the draft’s conservative conclusion. Since watching is optional and explicitly not authoritative, this is not a material correction. Keep the source labeled archived and verify current SDK/platform requirements if a watcher is implemented.

**Classification:** minor locator/wording.

## Discovery, alternatives, and source quality

The frozen discovery already covers stable records versus locators, configured roots, platform identity limits, persistent access mechanisms, bounded relink, removable media, two-window writes, export, and unresolved product facts. Its post-plan pivot usefully compares Windows Distributed Link Tracking and the Linux XDG document portal against the brief: DLT is conditional and excludes removable media; portal IDs represent access grants rather than portable file identity. The draft retains these as alternatives/adapters rather than replacing the cross-platform core. This is a good response to the released plan, not scope drift.

The carried index and map contain 20 stable IDs with URLs, version/commit descriptions, locators, access observations, conditions, and applicability. I independently inspected the primary references indexed here: V01–V11. In particular, Apple documents the different persistence and scope of document IDs, transient resource IDs, and persistent-but-optional volume UUIDs (V02–V03); Microsoft limits FILE_ID_INFO identity to a single computer and documents watcher overflow/rescan and DLT’s NTFS/removable-media constraints (V04–V05, V10); Apple’s archived FSEvents guide documents coalescing and full-rescan cases (V11); and the Zotero 6.0.20 implementation, 6.0.16/6.0.20 release history, and SQLite docs support the draft’s concrete implementation/history and concurrency examples (V07–V09). Linux inotify was available from its indexed manual text after a direct page-fetch timeout; the limitation is recorded in the critic source map (V06).

No evidence reviewed here establishes this notebook’s OS matrix, sandbox/distribution model, project storage format, network-share support, path privacy policy, or owner preference about changed content. The draft correctly leaves these unresolved rather than presenting documentation examples as product decisions.

## Executed work versus proposed validation

**Executed by this critic:** read the complete brief, discovery, draft, investigator source map, plan reveal, plan-reveal metadata, and source index; directly checked the primary references recorded as V01–V11. The Linux inotify direct page fetch timed out; the primary manual’s indexed text was inspected instead. No source code was downloaded or run. No product code, filesystem simulation, application runtime, or automated test was run.

**Proposed only:** every validation in the investigator draft (project relocation; duplicates and modified content; removable-volume/path reuse; denied/stale access; path forms; watcher loss; concurrent windows; export; digest performance). These are useful future checks, not executed evidence. Keep that distinction in any final proposal.