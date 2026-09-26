# Shard 015: Source Control, GitHub Actions, and Docker Manager Wiring Addendum (2026-03-12)

Source: `Plans/Wiring_Matrix.md`

Source lines: L487-L619

Source SHA256: `cf659115f6f2034ea117514feea93754d59b51584b0d84ef62f066ce14a5ee1f`

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
| Remote reconnect compatibility wrapper | `cmd.remote.reconnect` resolves one exact `ExecutionEnvironmentId` into canonical `cmd.environment.reconnect` | `Plans/Commands_System.md` + `Plans/Shared_Integration_Runtime.md` | `Plans/GitHub_Integration.md` and remote UI are consumers; one bounded auto-retry precedes this explicit action and no peer connection lifecycle is created. |

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
| `cmd.search.rebuild_index` | IndexBuilder `build_full` | User action or command | project_id -> full rebuild |
| Startup recovery | IndexSnapshot `load` | project open / app restart | highest valid generation -> checksum validation -> mmap / rebuild |
| IndexBuilder completion | ArcSwap publish | New generation ready | new `IndexSnapshot` -> atomic pointer swap through the `arc-swap` crate's production-proven, wait-free read-mostly `ArcSwap<T>` pattern used by tokio, hyper, and other production Rust projects |
| Status bar | IndexBuilder state | Build or refresh lasts >2s | build_state + progress -> `Indexing` / `Refreshing index` indicator |
| `cmd.search.evict_remote_cache` | RemoteCacheManager `evict_project` | User confirms per-project eviction | remove `r/{hash8}` cache root |
| `cmd.search.clear_all_remote_caches` | RemoteCacheManager `evict_all` | User confirms global clear | remove all remote cache roots |

**`cmd.search.rebuild_index` original/build/publication/response join (WM-029 prose-only proposal):**

This paragraph is the bounded WM-029 causal join for the existing command. It adds no command, alias, handler, event, storage value or family, permission class, scheduler, output enum, or runtime proof, and it re-owns neither storage durability nor remote correctness (those stay with `Plans/storage-plan.md`, `Plans/GitHub_Integration.md`, and `Plans/Tools.md` per the addendum boundary above). The historical `cmd.search.rebuild_regex_index` spelling stays source lineage only.

- Original request and operation. The genuine original is the authenticated `cmd.search.rebuild_index { project_id }` dispatch (UCC-087 identity and payload) through production row `catalog.search_rebuild_index` to the sole handler `handlers::search::rebuild_index`, with its command instance, operation identity, idempotency, and genuine caller return context preserved as one authenticated dispatch chain (SIR original and `CommandOutcomeRecord`, CV-333 request and outcome join). Availability and disabled reason reuse the production row's existing state selector and disabled-reason projection. `expected_event_types=[]` and the production effect is `receipt` via `cmd.search.rebuild_index.dispatch_receipt` (or an explicit no-persist route or open disposition where the wiring contract admits one). No generation, anchor, ref, or caller field is added to the request.
- Selected Project and currentness. The selected Project is the `{ project_id }` from that same original. Current index source and generation are resolved causally at effect time by the native builder and storage from the actual current source (current Git `HEAD` or `SHA` anchor; for non-Git projects the native builder and storage owner selects and reads the actual current source at build time under existing owner rules, with `anchor_sha` null and `build_timestamp_utc` recorded as build metadata, never as source authority), the current published generation, and the dirty-layer `build_generation` fence. No new source token or request generation is invented. Currentness is never matched from an opaque ref or string, never taken from a request-supplied generation, and never self-asserted by a fixture witness.
- Build result and durable publication. `IndexBuilder build_full` builds the next generation (`gen-{N+1}/` with `postings.bin`, `lookup.bin`, `file_map.bin`, and `index_meta.json`) for that Project and source. Durable publication follows the Storage-owned rules by reference only (SP-016, SP-018, and SP-019); checksum-validated files, `File::sync_all()` and `sync_all` on every new generation file before publication, one atomic `ArcSwap<Arc<IndexSnapshot>>` swap, readers holding `Arc` until query completion, old generation directories cleaned only after the last reader exits, and dirty-layer clearing of only `generation <= build_generation` so entries added during the build survive. The generation publication is the only durable rebuild effect and it creates no persisted domain event.
- Failure and recovery. A failed build, failed checksum or validation, or crash before the atomic swap leaves the prior published generation current, retains dirty-layer coverage, and keeps ripgrep fallback available until a later rebuild completes. The index stays a cache, so there is no data loss (WM-030 and storage rules by reference). Recovery is a later authenticated rebuild dispatch or the existing automatic project-open and startup validation path, not a retry invented here and not a second publication path.
- Owner result, receipt, and applicable work correlation. The terminal Search-owner typed result and the dispatch receipt above belong to the same original operation. The receipt records dispatch and attempt accounting, not index-content success. When the native implementation exposes this rebuild as shared work, it correlates through the same original operation to one SIR `ObservableWork` lifecycle (SIR-015 and SIR-042 primitives by reference). When it does not, no work identity is invented. `ObservableWork` completion stays owner-receipt-backed.
- Central response join. The dispatcher projects the outcome through the closed CV-333 `UICommandResponse` as `owner_operation` over the authenticated normalized request, the existing `CommandOutcomeRecord`, and the separately owned typed result or error. `accepted` (with `acknowledged` and `executing`) is durable admission only, never completed rebuild. Only an owner-verified terminal result completes the operation, and it is bound to the independently observed actual effect and generation state: a terminal success to the actually published new generation, and a terminal failure, cancelled, or recovery-required result to the retained prior generation only where no publication occurred. After the atomic swap the new generation is actual current even if later receipt, response, or operation settlement fails or is unknown, and no error label may be read as rollback, success, or prior-generation retention. Replay preserves the original request, operation, result, receipt, and response with zero repeated builds. The status-bar `Indexing` and `Refreshing index` indicator (build or refresh longer than 2s) is a progress projection only and never invents admission, denominator completion, or terminal success.
- Static definition versus native proof. This prose and the WM-029 acceptance below define the contract statically. They prove no native `IndexBuilder` execution, no Storage publication or durability act, no receipt writer, no `ObservableWork` producer, no dispatcher or handler registration, no permission or availability decision, and no runtime completion. Those need the separate companion (typed request, result, receipt, work, and response bindings) plus source-hashed native evidence. Fixture agreement and matching refs or hashes never substitute.
- Non-owner and non-scope. Settings stays a freshness-aware `Project Search Index` projection only (SSYS-023 requested and effective enablement, freshness, generation, coverage, disk use, policy, remote-cache state, active work, and Search-owner availability; Settings never builds, cancels, evicts, or repairs). This join does not cover search query or replace flows, regex AST, `evict_remote_cache` or `evict_all` eviction and staging choices, index-eager startup, or unrelated cleanup.
- Precise current-owner gap, not selected. The selected inputs do not fix whether two concurrent `cmd.search.rebuild_index` dispatches for the same Project coalesce to one `build_full`, serialize, or fail the second through the owner's existing typed unavailable or error vocabulary. This prose requires only that any admitted behavior preserve single-writer publication, the `build_generation` fence, one receipt per admitted original, and truthful `accepted`-versus-terminal reporting, and it leaves the coalescing, serialization, or busy choice to the Search owner.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md
