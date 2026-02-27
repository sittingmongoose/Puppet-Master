## 13. Git Status Integration

This section specifies how the File Manager integrates Git status overlays and connects to the Git panel defined in `Plans/GitHub_Integration.md`.

### 13.1 Git Status Overlay in File Tree

- Each file node in the File Manager tree displays a single-character status badge beside the filename when the project is a git repository:
  - `M` (modified) — unstaged edits
  - `A` (added/staged new file)
  - `D` (deleted — staged or unstaged)
  - `R` (renamed)
  - `U` (unmerged/conflict)
  - `?` (untracked)
  - No badge — file is clean/tracked with no changes
- Badge color: modified=amber, added=green, deleted=red, conflict=red, untracked=grey
- Badges update within 2 seconds of any git operation completing (file-watcher or post-command refresh)
- Toggle: "Show git status" in File Manager header (default: on); persisted in redb key `file_manager/show_git_status`
- If the project folder is not a git repo: badges are hidden; no error shown

### 13.2 Git Panel Strip

- A collapsible strip at the bottom of the File Manager panel (above the footer) shows:
  - Current branch name (or "no branch" if detached HEAD)
  - Working folder mode: local path OR `user@host:path` for SSH remote (ContractRef: Plans/GitHub_Integration.md §A.1, §C.3)
  - Change count badge: "N changes" (click opens the Git panel §A.2 in its own panel slot)
  - Sync status: ↑N ahead / ↓N behind / ✓ up-to-date
- "Open Git Panel" link or click on the strip opens the full Git panel (Plans/GitHub_Integration.md §A)
- Strip is hidden if the folder is not a git repo

### 13.3 Repo-Aware Filtering

- `.gitignore` patterns are respected by the file tree (existing behavior §1)
- Additionally, git-ignored files may be marked with a dimmed style distinct from untracked files
- The "Show git status" toggle (§13.1) and "Hide ignored" toggle (§1) are independent settings

ContractRef: Plans/GitHub_Integration.md §A, Plans/GitHub_Integration.md §C.3, Plans/DRY_Rules.md, Plans/Decision_Policy.md, Plans/Architecture_Invariants.md#INV-010
