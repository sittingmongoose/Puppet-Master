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
Instant project switch is no longer an open problem statement in this file.

Canonical rules now live in `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, and `Plans/WorktreeGitImprovement.md`.

This file retains only the historical note that project switching must preserve stable project identity, restore per-project state deterministically, and keep background activity visible after a switch.
### 23.13 Built-in Browser and Click-to-Context (§15.17)
Built-in browser and click-to-context are no longer open exploratory gaps here.

Canonical rules now live in `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FileManager.md`, `Plans/FinalGUISpec.md`, `Plans/Permissions_System.md`, and `Plans/storage-plan.md`.

This file retains only the historical note that browser/preview/auth/automation surfaces must remain distinct and cross-platform behavior must stay deterministic under Slint + native WebView constraints.
### 24.1 Core framing

The product must not ship four disconnected implementations for:

- Markdown preview
- Mermaid preview/export
- HTML file preview
- browser/click-to-context

Instead, use one rendering family with:

- a native document core
- a shared PreviewSession abstraction
- a browser-like runtime where browser behavior is truly required
- native image handling for image-first artifacts

### 24.2 Relationship to built-in browser and click-to-context

- The browser surface remains real and important.
- Full HTML preview uses the browser-oriented path.
- Generated Markdown/Mermaid preview does **not** require being treated as arbitrary full-trust browser content.
- Click-to-context stays aligned with the browser/HTML surface, not with raw chat Markdown rendering.

### 24.3 Platform and embedding strategy

- Detached preview/browser windows are guaranteed.
- Embedded webviews are optional per-platform optimization.
- Linux Wayland is detached-first or GTK-bridged behind the same abstraction.
- The architecture should not depend on hidden embedded panes being available everywhere.

### 24.4 Transport split

### 24.4A Browser surface modes and HTML preview transport normalization

The product uses two browser-capable modes with different authority.

#### A) `workspace_preview`
This is the canonical mode for file-backed HTML preview and browser-faithful workspace rendering.

Rules:
- Backed by the loopback preview server.
- Rooted to the active project/workspace.
- Relative assets resolve through the preview server, not `file://`.
- Click-to-context is supported here.
- Agent-initiated navigation/reload is allowed only within the active workspace preview origin.
- Source-mutation privileges are still separate from browser rendering privileges.

#### B) `external_browse`
This is an optional user convenience mode for manually opened HTTP/HTTPS pages.

Rules:
- It is not the canonical path for project rendering.
- It does not imply source-edit privileges, preview editing, or workspace mutation.
- If click-to-context is enabled here, it remains user-triggered only.
- Agent automation for external browsing is out of scope unless a separate tool/capability contract is added later.

#### HTML preview server contract
- Canonical transport: `http://127.0.0.1:<port>/preview/<project_id>/<document_id>/...`
- Canonical preview origin is loopback localhost.
- `file://` is not an MVP transport for full HTML preview.
- `WebViewBuilder::with_html` is prohibited as the primary transport for file-backed HTML preview.
- Generated Markdown/Mermaid previews continue to use the internal preview origin/route and must not share the workspace HTML trust tier.

#### Fallback order
1. embedded browser/runtime path when supported
2. detached preview/browser window using the same preview session and origin contract
3. explicit degraded error state

A static screenshot is not an acceptable steady-state replacement for HTML/browser functionality.

#### Normalized defaults
- Canonical hot-reload debounce: `app.preview.hot_reload_debounce_ms = 500`
- Browser tab capacity applies to in-shell browser tabs; detached windows are outside that cap
- Any earlier `browser instances` language should be treated as pre-normalization text and aligned to this section

- Use localhost preview for file-backed HTML/browser mode.
- Use an internal preview origin/route for generated Markdown/Mermaid/read-only previews.
- Do not use `with_html` as the main transport contract.

### 24.5 Editing contract

- Source text remains canonical.
- Preview-mode edits are allowed only as validated structured commands.
- Ambiguous or unsupported edits jump the user to source instead of mutating rendered DOM state.
- Mermaid remains text-canonical even when rendered on a dedicated canvas/window.

### 24.6 Security split

- Generated preview surfaces are sanitized, restricted, and narrowly bridged.
- Full workspace HTML preview is explicitly a different trust tier.
- Full HTML preview must not receive source-mutation powers by default simply because it is rendered in a webview.

### 24.7 Performance expectations

- lazy rendering
- caching of repeated diagrams/previews
- virtualization for large conversations/documents
- hot reload for HTML and linked assets
- stable fallback behavior rather than blank/failed panes

### 24.8 Suggested implementation phasing

1. **Phase 1:** shared PreviewSession, native Markdown/Mermaid rendering pipeline, detached preview/browser windows, native image surface, localhost HTML preview.
2. **Phase 2:** embedded webview support where stable, richer split-pane integration, improved source/preview synchronization.
3. **Phase 3:** expanded structured preview editing beyond the v1 whitelist, if deterministic mapping continues to hold.

### 24.9 Non-goals

- do not require universal embedded-webview parity before shipping the feature set
- do not make arbitrary WYSIWYG editing the definition of “full Markdown support”
- do not allow generated preview trust boundaries to collapse into workspace-browser trust boundaries

