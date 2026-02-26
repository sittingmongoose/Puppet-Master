## 13. Evidence-in-Chat Contract and Flow (research-evidence-media-chat)

This addendum defines how automation evidence should be captured and surfaced directly in chat (inline images, playable recordings/links, and structured metadata for test runs).

### 13.1 Evidence artifact contract (layout + schema + manifest)

**Canonical run layout (per run):**

```text
.puppet-master/evidence/gui-automation/<run_id>/
  manifest.json
  timeline.jsonl
  summary.md
  checks.json
  media/
    screenshots/
      step-001.png
      step-002.png
    recordings/
      run.webm
      run.mp4            # optional fallback transcode
    traces/
      trace.zip          # optional (framework/tool dependent)
    state/
      step-002-dom.html  # optional state dump
```

**Manifest contract (`manifest.json`):**
- `schema_id`, `run_id`, `scenario_id`, `started_at_utc`, `ended_at_utc`, `status`, `tool_name`, `tool_version`
- `timeline_path`, `summary_path`, `checks_path`
- `artifacts[]` list with stable IDs and media metadata:
  - `artifact_id`, `kind` (`screenshot|recording|trace|state|log`), `relative_path`, `mime_type`, `sha256`, `size_bytes`
  - optional render hints: `width`, `height`, `duration_ms`, `poster_path`
  - optional linking: `step_id`, `test_id`, `timeline_seq`, `created_at_utc`
- `chat_cards[]` (pre-ranked "top evidence") for fast rendering in chat:
  - `title`, `artifact_id`, `step_id`, `reason` (e.g., `assertion_failure`), `priority` (0-100)

**Timeline linkage (`timeline.jsonl`):** each event SHOULD reference `artifact_ids[]` so timeline, summary, and media are joinable without path guessing.

**Schema contract (Resolved):**
- `manifest.json` MUST validate against `Plans/gui_automation_manifest.schema.json` (`SchemaID:pm.gui_automation_manifest.schema.v1`).
- `Plans/evidence.schema.json` remains the evidence bundle schema and is **not** extended by this plan.
ContractRef: SchemaID:pm.gui_automation_manifest.schema.v1, SchemaID:evidence.schema.json, PolicyRule:Decision_Policy.md§2

### 13.2 Chat rendering behavior + fallback behavior

**Preferred render order (per artifact):**
1. **Inline image card** for `image/*` screenshots/photos (PNG/JPEG/WebP) using markdown image syntax and alt text.[C5][C6]
2. **Inline video player** for `video/webm` or `video/mp4` when client supports it; include poster and controls.[C4]
3. **Playable link fallback** when inline video fails: show signed/local file link + metadata (`duration`, `size`, `sha256`).
4. **Download link fallback** for traces/zip/state dumps with short description.

**Rendering rules:**
- Always show a compact structured header before media:
  - `Run`, `Scenario`, `Status`, `Failed step`, `Timestamp`, `Tool version`.
- For failed tests, render **first failure screenshot + nearest recording segment** first.
- Limit inline payload size; prefer path/resource references over base64 in normal chat.
- If rendering fails, show deterministic fallback message:
  - `Media preview unavailable. Open artifact: <relative_path> (mime=<mime>, sha256=<hash>).`

**MCP-aware behavior:** if tool responses include MCP image/resource content, client can render directly from typed content (`type: image` or `type: resource`) with MIME-aware handling.[C3]

### 13.3 Tool-call and evidence-capture flow during test execution

**Flow (during automation):**
1. `gui_run_scenario` starts run, creates run folder, initializes `manifest.json` + `timeline.jsonl`.
2. For each action/step:
   - append `step.started` event
   - on checkpoint/failure, capture screenshot; append artifact + `step_id` linkage
   - if recording enabled, keep rolling capture and finalize on run end
   - append `step.passed|step.failed` with `artifact_ids[]`
3. On completion:
   - finalize recording (ensure context/runner close semantics for persisted video files).[C1]
   - write `summary.md` and `checks.json`
   - optionally write trace bundle (`trace.zip`) for failed/retried runs.[C2]
   - finalize manifest status and "chat_cards" selections.
4. Chat adapter reads only `manifest.json` first, then lazily loads referenced artifacts.

**Interop note:** for Playwright-based capture, keep attachment metadata (`contentType`, file path) aligned with report attachments semantics so artifacts remain portable across reporters.[C7]

### 13.4 Validation / Doctor checks for evidence usability

Add **Doctor (Evidence Media)** checks:

1. **Layout check:** required files exist (`manifest.json`, `timeline.jsonl`, `summary.md`) for latest run.
2. **Manifest integrity:**
   - every `artifacts[].relative_path` exists
   - MIME is valid for extension
   - `sha256` matches on disk
   - `timeline` references resolve to declared `artifact_id`
3. **Renderability check:**
   - at least one `image/*` artifact for failed runs
   - if recording enabled, at least one playable `video/webm|video/mp4` artifact or explicit `recording_disabled_reason`
   - fallback link generation succeeds for non-inline artifacts
4. **Chat-card quality gate:** at least one `chat_cards` entry for failure, with non-empty `reason`.
5. **Output:** emit `doctor.evidence_media.checked` event with PASS/FAIL + actionable remediation.

**Failure severity:**
- Missing manifest/timeline: **FAIL (block release/testing gate)**
- Missing media for failed run: **WARN** (unless policy requires mandatory video)
- Hash mismatch or broken paths: **FAIL**

---

