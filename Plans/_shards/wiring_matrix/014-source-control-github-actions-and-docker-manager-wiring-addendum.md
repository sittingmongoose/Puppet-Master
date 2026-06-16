# Shard 014: Source Control, GitHub Actions, and Docker Manager Wiring Addendum (2026-03-12)

Source: `Plans/Wiring_Matrix.md`

Source lines: L428-L546

Source SHA256: `250de630c47a555a13afc1944c5379ee1ca1c76f2624e71bc783073e6456a7a7`

---

## Source Control, GitHub Actions, and Docker Manager Wiring Addendum (2026-03-12)

### Assistant Worktree Wiring Addendum

Cross-component wiring for the assistant thread-to-worktree binding feature.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Contracts_V0.md

**Chat ↔ WorktreeManager wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Chat header button `Create Worktree` | WorktreeManager `create_worktree` | User clicks header button or `cmd.chat.worktree.create` | thread_id, branch_name, base_ref → worktree_id, path |
| Chat dropdown `Remove Worktree` | WorktreeManager `remove_worktree` | User confirms removal | worktree_id → success/error |
| Chat dropdown `Bind Existing` | WorktreeManager `list_worktrees` | User opens bind dialog | → unbound worktree list |
| Chat merge dialog | WorktreeManager `merge_worktree` | User confirms merge | worktree_id, target_branch, strategy → result |
| Chat merge dialog | WorktreeManager `create_pr` | User clicks Create PR | worktree_id, branch, target → pr_url |
| Auto-create (thread creation) | WorktreeManager `create_worktree` | `branching.assistant_auto_worktree` is true | thread_id, auto-generated branch name |

**Chat ↔ Source Control wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| SC Worktrees accordion `Open Thread` | Chat panel navigation | User clicks Open Thread in worktree row | thread_id → scroll to thread |
| SC Worktrees accordion expanded-row `Merge` / `PR` | Chat merge dialog / PR panel | User clicks Merge or PR in a thread-owned expanded-row | worktree_id, thread_id → merge dialog or PR panel |
| SC filter control | redb filter key | User changes filter | filter enum → persisted key |
| Chat worktree bound/unbound events | SC worktree list refresh | Seglog event processed | worktree_id → refresh row |

**Chat ↔ File Manager wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Thread switch (with worktree) | File manager root | Thread selected, `worktree_follow_thread` true | worktree_path → set FM root |
| Breadcrumb worktree toggle | File manager root | User clicks worktree crumb | toggle between worktree_path and project_root |
| Worktree unbound/removed | File manager root reset | Binding removed | → reset FM root to project_root |
| Chat `Open Worktree Files` | File manager panel | User clicks from header dropdown | worktree_path → open FM panel at path |

**Chat ↔ LSP wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Thread switch (with worktree) | LSP root_identity | Thread selected | worktree_path → LSP session key (host_id, server_id, root_identity) |
| Worktree created | LSP warm-start | New worktree available | worktree_path → background indexing |

**Chat ↔ Executor wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Thread with worktree enters Agent/Plan/Debug mode | Executor working_directory | Execution unit created | worktree_path → execution context |
| Pre-merge test | Executor | Merge dialog test phase | command, worktree_path → terminal execution |

Execution context population is deterministic: when a thread has a binding, `execution_unit_context.worktree_id = binding.worktree_id` and `execution_unit_context.working_directory = binding.worktree_path`; when unbound, `worktree_id = null` and `working_directory = project_root`.

Terminology for thread worktree binding, accordion layout, `working_directory`, merge lock, and pre-merge test gate stays in `Plans/Glossary.md` (`/Glossary.md` compatibility references); Wiring Matrix records producer/consumer edges only.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Run_Modes.md


This wiring addendum also covers Search, File Manager action handoff, chat restore/file-reference actions, and host-aware LSP/remote projections because those seams now share one shell slot and one cross-surface identity model.

| Surface / flow | Canonical command / route | Owner doc | Downstream consumers / notes |
|---|---|---|---|
| Show Search panel | `cmd.search.show` | `Plans/FinalGUISpec.md` + `Plans/UI_Command_Catalog.md` | Right-hand side panel owner for find/replace-in-files |
| Run find/replace in files | `cmd.search.find_in_files`, `cmd.search.replace_in_files` | `Plans/UI_Command_Catalog.md` | Query-session state persists in `Plans/storage-plan.md`; remote execution rules live in `Plans/GitHub_Integration.md` |
| Open Search result | `cmd.search.open_result` | `Plans/UI_Command_Catalog.md` | Uses shared open-file contract from `Plans/FileManager.md` |
| File-tree actions | `cmd.file.*` | `Plans/FileManager.md` + `Plans/UI_Command_Catalog.md` | Reuse FileSafe-backed transfer/mutation path |
| Add file to chat | `cmd.chat.add_file_reference` | `Plans/assistant-chat-design.md` | Visible composer chips; file-only in MVP |
| Revert last agent edit | `cmd.chat.revert` | `Plans/assistant-chat-design.md` | Refreshes editors via canonical mutation pipeline |
| Rewind chat only | `cmd.chat.rewind` | `Plans/assistant-chat-design.md` | Must not restore files |
| Source Control subview switch | `cmd.source_control.switch_subview` | `Plans/GitHub_Integration.md` | Keeps Source Control in the right-hand side-panel slot |
| Source Control review, diff, and conflict actions | `cmd.source_control.open_review`, `cmd.source_control.set_compare_target`, `cmd.source_control.toggle_generated_filter`, `cmd.source_control.open_conflict`, `cmd.source_control.open_merge_editor`, `cmd.source_control.resolve_conflict_side`, `cmd.source_control.mark_conflict_resolved`; `cmd.git.diff_set_compare_target { target_kind: "head"\|"index"\|"merge_base"\|"branch"\|"commit"\|"parent", ref? }`, `cmd.git.diff_search { query, direction?: "next"\|"prev" }`, `cmd.git.stage_hunks { path, hunk_ids: string[] }`, `cmd.git.unstage_hunks { path, hunk_ids: string[] }`, `cmd.git.discard_hunks { path, hunk_ids: string[] }`, and `cmd.git.conflict_apply_resolution { path, conflict_id, resolution: "ours"\|"theirs"\|"both" }` remain lower-level diff operations | `Plans/UI_Command_Catalog.md` + `Plans/WorktreeGitImprovement.md` | Review mode and Conflict assistant stay Source Control owned; `cmd.git.*` rows are lower-level diff/git operations, not substitutes for `cmd.source_control.*` GUI entrypoints. Diff-local `local-search` belongs to the git diff/review surface and must not route through project-wide `cmd.search.find_in_files`; `/hunk/conflict/search-in-diff` affordances route through Source Control review and the git diff command family. |
| Host-aware LSP session projection | `(host_id, server_id, root_identity)` session key | `Plans/LSPSupport.md` | Consumed by editor, Problems, status, and persistence |
| Remote reconnect | `cmd.remote.reconnect` | `Plans/GitHub_Integration.md` | One bounded auto-retry precedes this explicit action |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md


### Search Index Acceleration Wiring Addendum

Cross-component wiring for the sparse n-gram regex index that transparently accelerates grep and Search-panel regex.

Lifecycle, file-format, and remote-correctness canon remain owned by `Plans/storage-plan.md`, `Plans/GitHub_Integration.md`, and `Plans/Tools.md`. This addendum records cross-component edges only.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

**Grep tool <-> Index Engine wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Agent/subagent `grep` call | IndexEngine `query` | Tool invocation | pattern, path/glob filters -> candidate file IDs |
| Search-panel regex query | IndexEngine `query` | User executes find-in-files with regex ON | pattern, scope -> candidate file IDs |
| IndexEngine candidates | ripgrep verification | Query returns candidate set | file IDs -> paths -> verification on authoritative content -> final matches |
| PM-mediated file write | DirtyLayer `insert` | Tool write returns | path -> generation-aware dirty entry before write success is surfaced |
| File watcher event | DirtyLayer `insert` | External file change detected | path -> dirty entry (backup/dedup for PM writes) |
| Remote Git re-anchor | IndexBuilder `build_incremental` | staged dirty content + fetched diff ready | staged paths + `old_anchor..new_HEAD` diff -> changed-file set |

Freshness and dirty-layer wiring rules:
- PM-mediated writes insert into the dirty layer SYNCHRONOUSLY before returning success. This is the agent-write-then-grep CRITICAL FIX: agent tool writes, editor saves, and remote write relays add the written path before the caller can immediately grep, while file watchers remain backup/dedup for external changes.
- DirtyLayer storage is a `HashMap` with generation stamps, not a plain `HashSet`, so re-anchor clearing can distinguish entries created before and during a rebuild.
- On project open, background index build waits for the project-ready signal after file watcher, LSP, and Tantivy startup, then anchors to current Git `HEAD` / `SHA` or to a filesystem snapshot timestamp for non-Git projects.
- Crash recovery treats the dirty layer as in-memory cache state: if PM restarts and the anchor `SHA` / `HEAD` mismatch indicates movement, PM triggers automatic incremental rebuild. First grep after restart may use ripgrep fallback until rebuild completes, and there is no data loss because the index is only a cache.
- In MVP, remote cache refresh starts on project open, on a timer every 5 minutes after the previous fetch+build cycle completes, and on explicit pull or `/sync/refresh`; webhook or push notification remains aspirational. When fetch advances `HEAD`, PM immediately runs `git diff --name-only old_anchor..new_HEAD` (`name-only`) and inserts changed paths into the dirty layer BEFORE incremental rebuild. This closes the false-negative window between fetch and rebuild completion; generation-stamped entries are cleared only when the rebuild re-anchors safely.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

**Index build <-> Storage wiring:**

| Source | Target | Trigger | Data flow |
|---|---|---|---|
| Project open | IndexBuilder `build_full` or `validate` | Project-ready signal | project_id + current anchor -> validation or full build |
| Git fetch (remote) | IndexBuilder `build_incremental` | New commits detected | `old_anchor..new_HEAD` diff -> dirty paths -> incremental rebuild |
| `cmd.search.rebuild_regex_index` | IndexBuilder `build_full` | User action or command | project_id -> full rebuild |
| Startup recovery | IndexSnapshot `load` | project open / app restart | highest valid generation -> checksum validation -> mmap / rebuild |
| IndexBuilder completion | ArcSwap publish | New generation ready | new `IndexSnapshot` -> atomic pointer swap through the `arc-swap` crate's production-proven, wait-free read-mostly `ArcSwap<T>` pattern used by tokio, hyper, and other production Rust projects |
| Status bar | IndexBuilder state | Build or refresh lasts >2s | build_state + progress -> `Indexing` / `Refreshing index` indicator |
| `cmd.search.evict_remote_cache` | RemoteCacheManager `evict_project` | User confirms per-project eviction | remove `r/{hash8}` cache root |
| `cmd.search.clear_all_remote_caches` | RemoteCacheManager `evict_all` | User confirms global clear | remove all remote cache roots |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md
