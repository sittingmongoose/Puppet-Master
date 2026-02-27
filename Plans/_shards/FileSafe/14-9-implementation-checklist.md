## 9. Implementation Checklist

- [ ] **Create FileSafe module structure**
  - [ ] `src/filesafe/mod.rs`
  - [ ] `src/filesafe/bash_guard.rs`
  - [ ] `src/filesafe/destructive_patterns.rs`
  - [ ] `src/filesafe/file_guard.rs` (Section 11.1)
  - [ ] `src/filesafe/security_filter.rs` (Section 11.2)
  - [ ] Add `pub mod filesafe;` to `src/lib.rs`
  - [ ] Tag all reusable items with DRY comments

- [ ] **Port pattern file**
  - [ ] Create `config/destructive-commands.txt`
  - [ ] Verify all 40+ patterns compile as Rust regex
  - [ ] Test pattern matching

- [ ] **Implement BashGuard**
  - [ ] Complete `BashGuard::new()` implementation (pattern file resolution, env var check)
  - [ ] Implement `BashGuard::find_bundled_patterns_file()` helper
  - [ ] Implement `BashGuard::disabled()` fallback
  - [ ] Pattern loading from file (`load_patterns()`)
  - [ ] Command checking logic (`check_command()`)
  - [ ] Prompt content checking (`check_prompt()` + `extract_commands_from_prompt()`)
  - [ ] Environment variable override (`PUPPET_MASTER_ALLOW_DESTRUCTIVE`)
  - [ ] Config file integration (read from `FileSafeConfig`)
  - [ ] Project-specific pattern loading (`.puppet-master/destructive-commands.local.txt`)
  - [ ] Error handling (graceful degradation on init failure)

- [ ] **Integrate with BaseRunner**
  - [ ] Add `bash_guard: Arc<BashGuard>`, `file_guard: Arc<FileGuard>`, `security_filter: Arc<SecurityFilter>` fields to `BaseRunner`
  - [ ] Initialize all guards in `BaseRunner::new()` (with pattern file resolution)
  - [ ] Add guard checks in platform runners (e.g., `CursorRunner::execute()`) **after context compilation**:
    - [ ] Compile context files into prompt (`append_prompt_attachments()`)
    - [ ] Check **compiled prompt** for destructive commands (`check_prompt()` on compiled prompt)
    - [ ] Check context files against security filter (`check_file_access()`)
    - [ ] Check if verification gate/interview operation (allow destructive if tagged)
  - [ ] Add guard checks in `BaseRunner::execute_command()` before spawn (after quota/rate limit, before permission audit):
    - [ ] Build command string and check for destructive patterns (`check_command()`)
    - [ ] Extract file paths from request (`extract_file_paths_from_request()`)
    - [ ] Resolve and normalize file paths (handle worktree symlinks)
    - [ ] Check file writes against write scope (`check_file_write()`)
    - [ ] Check file access against security filter (`check_file_access()`)
  - [ ] Implement `is_verification_gate_operation()` helper
  - [ ] Implement `is_interview_operation()` helper
  - [ ] Implement `extract_file_paths_from_request()` helper
  - [ ] Integrate with verification gates (allow destructive during QA if tagged)
  - [ ] Handle guard errors gracefully (return clear error messages, log to event log)

- [ ] **Add configuration**
  - [ ] Add `FileSafeConfig` to config system
  - [ ] Wire to GUI config (optional, can be CLI-only initially)
  - [ ] Document config options

- [ ] **Event logging**
  - [ ] Create `FileSafeEvent` struct
  - [ ] Integrate with existing event logging system (Section 11.5)
  - [ ] Log blocked commands, file access violations, security filter blocks
  - [ ] Include command preview, pattern matched, timestamp, agent context

- [ ] **Testing**
  - [ ] Unit tests for pattern matching (bash guard)
  - [ ] Unit tests for write scope (allowed/blocked files)
  - [ ] Unit tests for security filter (sensitive file patterns)
  - [ ] Unit tests for prompt content extraction
  - [ ] Unit tests for override mechanisms
  - [ ] Integration tests with platform runners
  - [ ] Test all 40+ destructive command patterns
  - [ ] Test verification gate integration (allow destructive during QA)
  - [ ] Test false positive scenarios (documentation, comments)

- [ ] **Documentation**
  - [ ] Add to AGENTS.md FileSafe section:
    - [ ] FileSafe: Command blocklist
    - [ ] FileSafe: Write scope
    - [ ] FileSafe: Security filter
    - [ ] Override mechanisms
    - [ ] Project-specific patterns
  - [ ] Document integration with verification gates
  - [ ] Document prompt content checking behavior
  - [ ] Add to REQUIREMENTS.md
  - [ ] Update GUI widget catalog if new widgets added

- [ ] **Pre-completion verification**
  - [ ] `cargo check` passes
  - [ ] `cargo test` passes
  - [ ] No hardcoded platform data
  - [ ] DRY compliance (tag reusable items)

- [ ] **Context compilation (Part B)**
  - [ ] Create `src/context/` module: `mod.rs`, `compiler.rs`, `role.rs`, `filters.rs`, `skills.rs`
  - [ ] Implement `compile_context(phase_id, role, plan_path, working_directory)` and role-specific compilers (Phase, Task, Subtask, Iteration)
  - [ ] Requirement filtering (phase-mapped only); convention extraction from AGENTS.md; decision extraction from state/progress
  - [ ] Skill bundling: parse plan frontmatter `skills_used`, resolve paths, append to Task/Iteration context; handle missing skills
  - [ ] Delta context: git diff since last phase, code slices, "Changed Files (Delta)" section; config `context.delta_context`
  - [ ] Context cache: `context-index.json` with key (paths + mtimes/hashes); skip compile when valid; invalidate on change; config `context.context_cache`
  - [ ] Structured handoff schemas: define message types and JSON schemas; `HandoffMessage` enum + validation in orchestrator; reference doc in docs/
  - [ ] Compaction-aware re-reads: `.compaction-marker` lifecycle (clear on session start, set on compaction); consult before including plan in context
  - [ ] Add `ContextConfig` to GuiConfig and `puppet-master.yaml`; wire to orchestrator (Option B); call compiler in platform runner before building prompt; graceful degradation on failure
  - [ ] Unit and integration tests for compiler, cache, handoff parsing; document token savings and config in AGENTS.md

---

