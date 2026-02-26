## 17. Implementation Order and Dependencies

Use this section to derive a phased implementation plan. Dependencies are stated so an agent can order tasks and avoid gaps.

**Phase 1 -- Core guards (no GUI, no Assistant)**  
1. Create `src/filesafe/` module (mod, bash_guard, destructive_patterns, file_guard, security_filter).  
2. Implement pattern loading (§2.3), bundled + project-local resolution (§2.2).  
3. Implement `BashGuard` (new, disabled, check_command, **commands_match** §2.2, approved_commands from config).  
4. Implement **check_prompt** and **extract_commands_from_prompt** (§11.3).  
5. Implement `FileGuard` (allowed set, **per-request update** §11.1, check_file_write).  
6. Implement `SecurityFilter` (**default_sensitive_patterns** §11.2, check_file_access).  
7. Add `FileSafeConfig` to `GuiConfig` and YAML (§2.4, §5.2); config load/save only (no UI yet).  
8. Integrate into **BaseRunner**: add guard fields, init in `new()` (with config from orchestrator when wired), in **execute_command()** call check_command (after building full command string), then compute `allowed_files` from request (§11.1), then check_file_write and check_file_access for extracted file paths.  
9. **ExecutionRequest:** ensure allowed files and operation type are passed via env_vars (`PUPPET_MASTER_ALLOWED_FILES`, `PUPPET_MASTER_OPERATION_TYPE`).  
10. Implement **extract_file_paths_from_request** (§15.2), **is_verification_gate_operation**, **is_interview_operation** (§15.2).  
11. In **platform runners** (e.g. Cursor): after **append_prompt_attachments**, call **check_prompt** on compiled prompt and **security_filter** on context files; respect `PUPPET_MASTER_OPERATION_TYPE` (`verification_gate`/`interview`).  
12. Event logging: **FileSafeEvent** struct (§6), write to `filesafe-events.jsonl` (or seglog when available).  
13. Pattern file: create `config/destructive-commands.txt` (§4); verify regexes.  
14. Unit tests: pattern match, commands_match, check_prompt extraction, FileGuard allowed/blocked, SecurityFilter, disabled/override behavior.

**Phase 2 -- Config wiring and GUI**  
15. Wire **GuiConfig::filesafe** → **PuppetMasterConfig::filesafe** at orchestrator start (Option B per `Plans/WorktreeGitImprovement.md` §5.2).  
16. Pass FileSafe config (and approved_commands) into BaseRunner construction.  
17. **Advanced tab:** Add **FileSafe Guards** collapsible card (§15.5, FinalGUISpec §7.4): three toggles, override with warning, approved commands list (scrollable, remove, optional add), optional event log link. Use existing widgets and help_tooltip keys.  
18. Message enum and update handlers for all FileSafe toggles and list actions.  
19. Persist approved_commands; ensure runtime blocklist checks whitelist from config.

**Phase 3 -- Assistant Chat and YOLO**  
20. When YOLO is on and FileSafe enabled: show **warning chip** "YOLO active -- FileSafe guards still apply" (§15.5, FinalGUISpec §7.16).  
21. **In-chat approval UI:** On block, show inline card (orange border, command in mono, guard name, "Approve once" / "Approve & add to list"), 60s timeout, log to event log.  
22. Terminal: on block, output RED with "[BLOCKED] Blocked by FileSafe".  
23. Optional: Dashboard FileSafe status card with link to Settings > Advanced.

**Phase 4 -- Context compilation (Part B)**  
24. Implement context compiler (§14), delta context, cache, handoff schemas, compaction marker, skill bundling; wire to platform runner and config. (Can be a separate implementation plan from Part A.)

**Risks and mitigations:**  
- **Gap -- plan metadata:** Orchestrator must set allowed files on each ExecutionRequest for write scope; implement **get_allowed_files_for_current_subtask** and pass via env or request field (§15.9 Gap 2).  
- **Gap -- worktree paths:** Normalize paths relative to `working_directory` and handle symlinks (§15.9 Gap 4).  
- **False positives:** Log all blocks; allow override and approved list; tune patterns from feedback (§12.2).

---

**End of Implementation Plan**
