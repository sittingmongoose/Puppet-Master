# Independent critic — B11-P01-control

## Scope and method

I read this stage's `assignment.md` and `input-map.json`, then the complete released brief, investigator `discovery.md`, `draft.md`, `source-map.json`, `revealed-plan.md`, `plan-reveal.json`, and `sources/index.md` at the exact input-map paths. The discovery and plan byte counts and SHA-256 values match the one-shot release record in `plan-reveal.json`; I reviewed only that released plan. I did not read campaign history, other candidates, other stage assignments, or unlisted files.

I independently opened the governing primary/product sources listed in the source map. Source-by-source recheck status, exact inherited identities, locators, conditions, and limits are retained in this critic's `source-map.json`. Primary-page fetches for S09, S12, and S13 did not yield independently reviewable content; those points remain unresolved rather than disproved. No source code was executed, no application was built, and no feature-level validation was run.

## Overall assessment

The draft is a strong, substantially complete proposal against the full brief and exact released plan. It directly separates an app reference record from a locator and identity evidence; treats portable relative roots and platform-native aids as conditional alternatives; requires user-selected candidate scope and confirmation; distinguishes offline, denied, absent, and changed-target states; addresses two-window stale writes; and separates linking from explicit export copying. It respects the no-copy-by-default, no-privilege, no-account, no-cloud, no-whole-disk-index, and no-guaranteed-recovery constraints. Its future validation list is explicitly labeled proposed and is not represented as executed.

I found no material false correction among the clauses whose governing source claims I could independently verify. The findings below identify bounded gaps or source limits; they are not authority to narrow the user's brief or to replace the investigator's proposal.

## Findings

### C1 — Material incomplete: define project containment for aliases and links

**Draft locators:** “Proposed record and status behavior,” first paragraph (project-relative location); “Validation plan — proposed, not run,” item 4 (aliases/symlinks “as supported”); export discussion under P2.2.

The draft recommends a project-relative locator when a target is “physically within” the project tree, but does not state how it determines that condition when a selected path crosses a symlink, alias, junction, mount point, or other filesystem indirection. Nor does it say whether a stored relative locator follows the indirection after a project move, or when an apparently project-contained link must instead be treated as external. This affects the portability promise and export inclusion description. Add a platform-aware policy before implementation: support and resolve a given indirection under a stated rule, or preserve/report it as external; test the chosen behavior. This is an unresolved component boundary, not a reason to drop project-relative links.

### C2 — Unsupported as cited: watcher failure modes

**Draft locator:** exact-plan row P1.5 (“startup gaps, dropped/out-of-scope events, unmounted drives, permission boundaries, and network filesystems require a fresh filesystem check”), which cites S08.

S08 governs Apple bookmarks and security-scoped access; it does not document filesystem-watcher delivery guarantees or the listed event-loss modes. The conclusion that correctness should use a fresh probe and that a watcher must remain optional is conservative and sound, but this particular causal rationale is not supported by its cited source. Either attach primary watcher documentation for the supported platforms or present the list as an explicit engineering assumption to validate. The scope remains user-selected roots only.

### C3 — Minor wording: make exported identity-evidence defaults explicit

**Draft locators:** P2.2 disposition and “Proposed record and status behavior.”

The draft's stated default manifest fields omit content digests and native file/volume identifiers, and it already treats paths and bookmark data as privacy-sensitive. Make the default exclusion explicit for digests, file IDs, volume identifiers, and access tokens as well, with any opt-in export requiring disclosure. This closes an ambiguity; the current field list does not affirmatively propose exporting those values.

### C4 — Honestly unresolved external input: a cited stage deadline

**Draft locator:** exact-plan row P3.1.

The draft says its assignment's earlier stage deadline was `2026-10-12T01:31:20.924Z`. The current critic assignment supplied to me gives this critic stage deadline `2026-10-12T01:35:29.833Z` and whole deadline `2026-10-12T02:01:20.218Z`. The investigator-stage assignment that would establish whether the draft's cited earlier deadline was correct is not among the authorized input-map paths, so I cannot call the draft's figure wrong. For this critic stage, use the current assignment's 01:35:29.833Z stage deadline; do not transfer the draft's stage-specific timestamp to this context. The draft correctly preserves the brief's no-minimum / finish-early rule.

### C5 — Honestly unresolved external input: three platform claims not independently rechecked

**Draft locators:** P2.4 disposition and its S09/S12/S13 citations.

The inherited source map records official Apple and Linux primary references, but my direct retrieval of S09 (Apple file resource identifier) and S12/S13 (Linux inode and file-handle manuals) failed. I therefore did not independently confirm the non-persistence, filesystem scope, or privilege details in those claims. The investigator's applicability cautions are appropriate and I found no contrary evidence; retain these as provisional until those primary pages are rechecked. This is an evidence-access limit, not a finding that the claims are false.

## Exact-plan disposition audit

| Released clause | Critic assessment of investigator disposition |
| --- | --- |
| P1.1 — table fields, absolute path, size/time, digest at link | **Change is well supported.** Keep a stable reference ID and display name; do not make the path sole identity or force a whole-file digest. S01/S03 confirm the real linked-versus-copied distinction. |
| P1.2 — open saved path first | **Retain with changes is sound.** A fresh probe and access-aware status are appropriate; a reachable path alone is not proof of unchanged intent. |
| P1.3 — scan project/recent folders and auto-select newest size+digest match | **Reject auto-selection and bound discovery is sound.** Candidate signals are evidence, not consent; the proposal preserves explicit user choice. S02/S04/S06/S07 support recovery patterns, with S04 correctly treated as issue history rather than proof of shipped behavior. |
| P1.4 — removable drive by current mount path | **Change is sound.** Preserve the locator and report unavailable volume separately; use platform/volume hints only conditionally. |
| P1.5 — watcher rewrites paths after rename | **Change / optional watcher is sound.** C2 concerns only the uncited event-loss rationale, not the disposition. |
| P2.1 — stale windows replace whole table | **Reject is sound.** Per-record expected revision plus atomic mutation addresses lost updates; the owner-store, cross-process, and network-storage decisions are correctly left open. SQLite transactions/WAL do not by themselves solve stale application state. |
| P2.2 — export table/list and optional copy | **Retain with changes is sound.** Distinguish linked from included files and make copy explicit; resolve C3's export evidence privacy wording. |
| P2.3 — available/missing plus Browse | **Change is sound and useful.** Offline, denied, unchecked, changed, and candidate-review states avoid false “missing” claims. |
| P2.4 — assume parity, defer platform-specific identity | **Reject the parity assumption is sound.** Windows path/file-ID limits, RFC path representation, and APFS variants support the adapter boundary. S09/S12/S13 remain provisional as C5 records. |
| P2.5 — local, stable IDs, no privileged service or silent copy | **Retain and enforce is faithful** to the brief. |
| P2.6 — proposal, not implementation evidence | **Retain is correct.** The draft clearly separates research, proposed validation, and absent implementation evidence. |
| P3.1 — maximum elapsed time, no minimum, finish early | **Retain is correct on the timing rule.** The draft's cited investigator deadline is unresolved under C4; this critic's binding deadline is the one in this stage assignment. |

## Discovery, alternatives, and evidence quality

The discovery package found useful options without presupposing a product: absolute paths, project-relative paths, named-root mapping, Apple bookmarks, platform-specific IDs, Linux handles, optional digests, and explicit reviewed relinking. The draft makes their trade-offs legible and keeps external root setup optional. Zotero's official linked/stored behavior and current pinned implementation provide a relevant product example; its issue #2084 closure is not overclaimed as proof of the exact shipped implementation. Final Cut Pro is an analogy for candidate review, not a general file-reference standard. S10/S11, S14-S18 support the platform/URI and SQLite cautions I could recheck. Keep the source limits in `source-map.json`.

Useful owner facts are carried forward: project store and multi-window contract; network filesystem support; supported OS/filesystem versions and macOS sandbox status; user-selected search scope; digest size/privacy policy; removable-root mapping; and export copy/privacy rules. These are real implementation decisions that the brief does not settle.

## Proposed versus executed validation

**Executed in this critic stage:** read and hash-checked the released discovery/plan against `plan-reveal.json`; inspected the bounded primary-source set as recorded in `source-map.json`; wrote this critique and source map. No feature executable, application, or downloaded code was run.

**Proposed only in the investigator draft:** no-copy behavior; project-relative move and external-link behavior; identity and duplicate-candidate cases; OS/filesystem matrix; bounded/cancellable search and optional watcher behavior; two-window conflict scenarios; and export inclusion/privacy scenarios. None of those product scenarios has been demonstrated by this research package.
