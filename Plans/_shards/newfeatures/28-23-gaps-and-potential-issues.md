## 23. Gaps and Potential Issues

This section consolidates **gaps** (missing or underspecified areas) and **potential issues** (risks or ambiguities) so implementers can address them. DRY required: resolve gaps by referencing or extending single sources (usage-feature.md, FileSafe, agent-rules-context, etc.); duplication is never permitted.


### 23.1 Architecture Clarity

- **§19.1 vs our architecture:** Section 19.1 describes a "three-process" pattern (Tauri + React + Node). **We use a single Rust/Iced process.** The callout at the start of §19.1 now states this; ensure all technical descriptions (stream parsing, bounded buffers) assume in-Rust parsing and no middle server.
- **Summary table §19.25:** The row for "CLI integration" says "Middle server spawns CLI"; treat that as the *alternative* pattern. Our row is: "Rust app spawns CLI, reads stdout (optionally stream-json), bounded buffer, no extra process."

### 23.2 Usage and Ledger

- **5h/7d and ledger schema:** **Plans/usage-feature.md** documents current gaps: 5h/7d not in GUI, ledger vs usage_tracker schema misalignment (e.g. `action` vs `operation`, `tokens` vs `tokens_in`/`tokens_out`), alert threshold not configurable. Implement §3 and §7 in line with usage-feature.md; use one coherent schema for `usage.jsonl` and one code path for "current usage" consumed by the GUI.
- **State-file-first:** Prefer aggregating from `usage.jsonl` (and optional `summary.json`) before adding platform API calls; document which platforms support live vs after-run stats.

### 23.3 Recovery and Sync Versioning

- **Recovery snapshot:** Panic hook that writes a snapshot before exit is **best-effort**; a severe crash may not complete the write. Document this; rely on periodic timer snapshots as the primary recovery source. Include a **schema version** in the snapshot format so future app versions can migrate or skip incompatible snapshots.
- **Sync payload (§22):** Version the sync payload so that when the app is updated, import/pull can detect older payloads and apply migration or prompt the user. Avoid silent data loss when app version changes.

### 23.4 Restore Points and Background Agents

- **Restore/rollback conflict detection (Resolved):**
  - **Method:** Content hash (SHA-256 of file contents). Rationale: mtime is unreliable across filesystems and editors; content hash is deterministic.
  - **On conflict** (file has been modified since checkpoint):
    - Show per-file prompt: "File [X] has been modified since this checkpoint. [Overwrite with checkpoint] [Skip this file] [Show diff]"
    - Default action (if user dismisses or bulk-applies): **Skip** (non-destructive).
    - Bulk actions available: "Overwrite all" / "Skip all" for large restore sets.
  - Config: `restore.conflict_method` (default `"content_hash"`; future option: `"mtime_and_hash"`).
- **Restore with background agent active (Resolved):**
  - **Warn and require confirmation:** When a restore/rollback is attempted while a background run is active on the same project, show: "A background run is active on this project. Restoring files may conflict with in-progress changes. [Pause background run and restore] [Restore anyway] [Cancel]."
    - **Pause and restore:** sends cancellation signal to background agent, waits for graceful stop (5s timeout), then restores.
    - **Restore anyway:** proceeds with restore. Background agent's next file write triggers conflict detection (per §23.4 conflict policy above).
    - **Cancel:** no action taken.
- **Main run vs background run on same project (Resolved):** See §2 implementation directions (resolved inline there).

### 23.5 Hooks and FileSafe

**Hook Timeout (Resolved):**
- Default timeout: **5 seconds** per hook invocation.
- Config: `hooks.timeout_ms`, default `5000`. Per-hook override: `hooks.{hook_name}.timeout_ms`.
- On timeout: **continue** (hook invocation is skipped, warning logged as `hook.timeout` seglog event).
- Configurable behavior: `hooks.on_timeout` — `"continue"` (default) or `"block"` (halt execution until hook responds or is manually dismissed).
- Rationale: hooks are advisory; they should not block the critical path by default. Users who need blocking hooks can opt in.
- **Dangerous-command blocking:** Part of FileSafe (§15.1); one blocklist and one integration point in runner; see §9.3 and §17.3-17.4.

### 23.6 Compaction and Token Source

**Token Source Per Provider (Resolved):**

| Provider | Token Source | Type | Notes |
|----------|-------------|------|-------|
| Claude | `usage` field in stream-json events | Exact (input + output tokens) | Available per-turn in streaming mode |
| Codex | `usage` field in final JSONL event | Exact (input + output tokens) | Available after turn completes |
| Cursor | `usage` field in stream-json events | Exact (input + output tokens) | Same format as Claude |
| Gemini | `usageMetadata` in final response | Exact (prompt + candidates tokens) | Available after turn completes |
| Copilot | **Heuristic** | Estimated (4 chars ≈ 1 token) | Text-only output; no token counts exposed by Provider |

- **Preference:** Use exact stream usage events when available (Claude, Cursor). Use final-response exact counts for Codex and Gemini. Use heuristic only for Copilot.
- **Heuristic formula:** `estimated_tokens = ceil(char_count / 4)`. This is a rough approximation; actual tokenization varies by model.
- **SSOT:** This table is the canonical reference. Usage tracking code must check `platform_specs::token_source(provider)` to determine which method to use.

### 23.7 Database and Projections

- **§14 Database/projections:** Structured storage (seglog, redb, Tantivy or equivalent) is part of the rewrite design, not optional. Analytics, restore points, and queryable history are produced from this layer. See rewrite-tie-in-memo and §14.

### 23.8 Plugin and Catalog Versioning

- **Plugin API version:** When the app is updated, plugin manifests or hook contracts may change. Consider a **plugin API version** or min-app-version in the manifest so we can warn or disable incompatible plugins instead of failing at runtime.
- **Catalog (§15.14):** Same versioning idea for one-click install catalog items; document compatibility when the app version changes.

### 23.9 Error Handling and Retry

- **Cross-feature strategy:** No single "error handling and retry" section exists. Consider documenting a common approach for: recovery snapshot write failure, compaction failure, hook timeout or script error, sync push/pull failure, and restore-point rollback failure. Prefer: log, surface in UI where appropriate, and avoid silent failure; retry policy (e.g. exponential backoff for sync) where it makes sense.

### 23.10 Testing Strategy for New Features

- **Test coverage:** Recovery restore, hook script execution (continue/block/modify), restore-point rollback and conflict detection, sync export/import and conflict resolution, and bounded buffer behavior under load are good candidates for automated tests. Document test strategy in implementation phases; reuse existing test patterns (**cargo test**, headless, per AGENTS.md -- Vitest applies to legacy TypeScript if present; Rust is primary).
- **Edge cases:** Restore while HITL is paused; compaction failure mid-run; hook timeout with block; sync conflict when both devices edited the same section. Document expected behavior for each.

### 23.11 Accessibility

- **Beyond sound (§15.16):** Sound effects (§15.16) mention respecting system "reduce motion" / "silent" preferences. Extend accessibility consideration to: **command palette** (keyboard-only, focus management, screen reader labels), **stream event visualization** (alternative text or summary for event strip), **thinking display** (avoid information only in visual animation). Document a11y goals in implementation directions for §11, §12, and related UI.
- **HITL and Assistant:** When paused for HITL, ensure approval prompts are addressable via keyboard and screen reader; **Plans/assistant-chat-design.md** and **Plans/human-in-the-loop.md** define Dashboard CtAs and Assistant as a way to address them -- ensure a11y for those flows.

### 23.12 Instant Project Switch (§15.16)

- **Gaps and problems live in §15.17:** Section 15.18 now includes: **Snapshotting** (recovery snapshot includes project path; restore points keyed by project; optional per-project checkpoint on switch); **Database** (project_path as first-class key in seglog/redb/Tantivy); **GUI** (placement, collapsible, keyboard, accessibility, stable identity); **Gaps** (where project list is stored, path no longer exists, same path twice, in-flight run when switching, max list size, interaction with multi-tab); **Potential problems** (config load failure, dirty state, performance with many projects, sync across devices). Resolve these during implementation; keep §15.16 as the single place for instant-project-switch gaps and mitigations.

### 23.13 Built-in Browser and Click-to-Context (§15.17)

- **Gaps and problems live in §15.18:** Section 15.19 now includes: **Implementation** (Wry + winit, custom protocol vs IPC, initialization script, capture mode, element schema, Rust handler, Assistant integration); **Phased delivery** (separate window → schema v1 → Assistant → optional embedding → polish); **Element context schema** (required/optional fields, token cap, truncation); **Security** (arbitrary URLs, validate/sanitize, navigation/schemes, rate limit); **Gaps** (CSP/strict sites, Linux POST body, iframes, Wayland embedding, Slint + WebView, Assistant schema); **Potential problems** (spam capture, token budget, click vs double/right-click, accessibility, visibility/screenshot, fetch response); **Testing** (unit, integration, manual, security). Resolve during implementation; keep §15.17 as the single place for built-in-browser gaps and mitigations.

---

*This plan is a living document. Update the Task Status Log when implementation work begins or completes for any section.*

