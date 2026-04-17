## A. Git Panel (IDE Surface)

The legacy heading remains for document continuity, but the canonical user-facing surface defined here is **Source Control**.

Source Control is Git-first and owns:
- working tree changes
- diff and compare workflows
- stage / unstage / discard / commit / amend
- fetch / pull / push / sync
- branch and stash workflows
- history and commit-detail browsing
- commit graph parity
- worktree inventory, lineage, and recovery

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/UI_Command_Catalog.md

### A.1 Source Control information architecture

Source Control MUST present these stable subviews as vertically stacked collapsible accordion sections (not horizontal tabs):

**Section order (top to bottom, fixed — not user-reorderable in MVP):**
1. `Changes`
2. `Worktrees`
3. `Branches / Stash`
4. `History`
5. `Graph`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

**Accordion behavior:**
- Section headers always visible, full panel width
- Click header to expand/collapse
- Multiple sections can be open simultaneously
- Header shows section name + item count badge (e.g. "Changes (3)", "Worktrees (2)")
- Expanded section content gets full panel width, scrolls independently within its region
- When total expanded content exceeds panel height, the accordion itself scrolls vertically (section headers stay in scroll flow, not pinned)

**Default open sections on first load:** Changes (expanded), all others collapsed.

**Persistence:** Section open/close state persisted in redb per project: `config:project:{pid}:source_control.accordion_state` — JSON object mapping section names to booleans. Section order is fixed; scroll position within sections is NOT persisted.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

**Minimum width:** Accordion layout must work at the Source Control panel's minimum width of 240px. Section headers truncate with ellipsis at small sizes; item count badges always visible.

**Keyboard navigation:** Tab between section headers. Enter/Space to toggle expand/collapse. Arrow keys move between headers. When expanded, Tab into content; Escape returns to header.

**Accessible labels:** Each section header: `accessible-role: button`, `accessible-label: "{section_name}, {item_count} items, {expanded|collapsed}"`.

**Two-level scroll model:** Each expanded section has a `max-height` constraint (e.g. 50% of panel height) with internal scroll. Outer container scrolls when total exceeds panel height. These are independent scroll regions.

### A.2 Changes

The `Changes` subview is the Source Control owner for day-to-day file mutation review.

It MUST present:
- unstaged files
- staged files
- untracked files
- conflicted files
- file-level diff entrypoints
- hunk-level Git actions
- conflict-review entrypoints

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Default compare targets:

| Origin | Default compare target |
|---|---|
| unstaged file | `index <-> working tree` |
| staged file | `HEAD <-> index` |
| untracked file | `empty <-> working tree` |
| conflicted file | `base`, `ours`, `theirs`, `result` |

ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

Rules:
- hunk stage/unstage/discard are Git mutations, not editor undo
- diff-local search is owned by the diff/review surface and MUST NOT be routed through project Search
- conflict review uses explicit base/ours/theirs/result context and structured resolution actions
- tree badges and editor markers consume Source Control projections but do not replace Source Control ownership

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md

### A.3 History and Graph
Source Control remains the Git/worktree owner surface.

Rules:
- History and Graph pivots that mention Orchestrator now point at `Plans/Orchestrator_Page.md#Source Control boundary` rather than the stale numbered anchor.
- Git lineage remains authoritative even when Orchestrator metadata is present.
