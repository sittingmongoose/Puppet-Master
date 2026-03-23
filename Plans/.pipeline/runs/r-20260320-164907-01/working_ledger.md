# Working Ledger

## Work Item

- **work_id:** `w-20260320-164907`
- **run_prefix:** `r-20260320-164907` (for future packetize runs; `run_id` is null until packetized)

## Mode

- `research`

## Topic / Scope

- Investigate a **debug mode analogous to Cursor’s**: fast loop from failure → structured context (logs, stacks, locations) → assisted diagnosis/edits, without turning this ledger into a product spec.
- Framed for **Puppet Master rewrite / planning** work across Assistant chat, shared tool/tool-permission infrastructure, runtime artifacts, browser/debug surfaces, and PM-managed remote-mode execution.
- **User intent (refined in chat):** user **points PM at a debug target** — e.g. **local app, dev server, website,** or other runnable surface — and expects a **Cursor-like** loop (hypotheses → evidence from that target → fix in workspace). **Also** wants **Copilot-style** affordances to **feed the chat agent structured info** (session/telemetry snapshot attach), including for **PM’s own** agent run when that helps.

## Objective

- Clarify what “Cursor-like” means for this project: **tight feedback loop**, **agent-assisted** interpretation, **grounding** failures to file/line or stable IDs.
- Identify plausible implementation **shapes** and **tradeoffs** (safety, noise, local vs remote) before reconciliation/packetize.

## Constraints / Non-Goals

- Ledger is **execution memory only** — not canonical, not cited in planning docs.
- Research mode: **no edits to** `Plans/*.md` planning documents from this thread; steward/packetize stages own those updates.
- Do not treat this file as a draft planning document.

## Current completeness verdict (2026-03-22 final audit pass)

- The operative design in this ledger is now **implementation-ready at the planning level**.
- No remaining product/architecture gaps should force reconciliation or implementation to invent primary behavior for Debug Mode.
- Remaining work after this pass is:
  - translating these decisions into canonical planning docs
  - tuning numeric defaults during implementation/prototyping
  - optional future enhancements explicitly marked later as non-blocking follow-ons
- Earlier exploratory sections such as **Initial gaps** and **Historical candidate fixes** remain in the ledger for research continuity, but the **authoritative current defaults** are the later sections beginning with **1) Proposed implementation-ready shape** and the closure sections added below.

## Key Facts and Findings

- **Terminology anchor:** “Cursor-like debug mode” was informal; align with **Cursor’s product “Debug Mode”** (agent workflow), which is **not** the same as a classic breakpoint debugger unless we explicitly scope that in.
- **Reference behavior (Cursor Debug Mode — synthesized from Cursor’s public docs/blog, 2.2 era):**
  - **Hypothesis-first:** agent proposes multiple causes before large edits.
  - **Runtime evidence:** agent adds **temporary instrumentation** (logging) to test hypotheses.
  - **Local collection:** logs flow to a **local debug server** (editor-side), user **reproduces** the bug while data is captured.
  - **Tight loop:** interpret logs → small targeted patch → user re-verifies; iterate.
  - **Cleanup:** instrumentation removed after verification (hygiene / noise control).
  - **Fit:** regressions, timing/races, perf, “reproduces but unclear from static read” — less ideal for pure compile-time failures unless paired with build/test capture.
- **Repo pointers (targeted, non-exhaustive):**
  - `Plans/FileManager.md`: **presets** tie into **run/debug** and toolchains (dependency ordering with LSP/editor work); debug is part of the broader workbench story, not a free-floating panel.
  - Related research (`w-20260319-030558` ledger, not canonical): themes include **Debug Console / Output / Problems** following **dev-session / terminal context**, **build/debug integration** as a sparse area, and **remote run/debug deferred** behind remote-edit MVP — relevant if PM’s debug story touches remote or SSH workflows.
  - Derived storage-plan shards mention **JSONL mirror** and **`logsearch` / “why did this fail”** style retrieval — historical hint toward a future “debug/diagnostics” retrieval plane (treat as hint until reconciled into hand-authored plans).
- **Competitive / OSS landscape (web + docs pass, Mar 2026 — not vendor truth forever):**
  - **Few public clones** of Cursor’s full loop (**temp app instrumentation → dedicated local collector in IDE → user repro → auto cleanup**). Most tools split the problem across chat, tests, or observability.
  - **GitHub Copilot / VS Code — orthogonal “debug”:** [Agent Debug Log](https://code.visualstudio.com/docs/copilot/chat/chat-debug-view) + **Chat Debug view** instrument **the Copilot session** (tool calls, prompts, OTLP export, `/troubleshoot`) — **not** your running app via injected logs. Valuable as a **second product axis** (“debug the assistant”).
  - **Windsurf:** **Cascade Hooks** = governance/audit around **assistant** actions (`pre_read_code`, `post_write_code`, shell hooks); **Download Diagnostics** = support-style logs — **not** the Cursor runtime-evidence pipeline ([hooks](https://docs.windsurf.com/windsurf/cascade/hooks)).
  - **JetBrains AI Assistant:** **Explain runtime error / console** = reactive AI on **existing** output — no bundled probe+collector+cleanup workflow ([docs](https://www.jetbrains.com/help/ai-assistant/explain-code-with-ai.html)).
  - **Amazon Q, Gemini Code Assist, Tabnine “fix”:** chat + diagnostics / suggest logging / fix from errors — **no** first-party match to Cursor’s integrated local log sink + cleanup story in materials reviewed.
  - **Devin (example of different axis):** **production/data-plane** context (e.g. MCP to observability, bug-from-report playbooks) — **fleet telemetry** vs **local ephemeral probes** ([gallery](https://docs.devin.ai/use-cases/gallery/fix-bug-from-report)).
  - **Replit:** strong **hosted runtime + verification** narrative (agent self-testing, console/Ask AI) — **tight feedback** but **cloud-coupled**, not desktop extension log server.
  - **OSS agents (OpenHands, SWE-agent / mini-swe-agent, Cline, Roo Code, Continue, Aider):** dominant pattern = **terminal/test observe loop** + edits; **Continue** adds **rich LLM interaction logging** (PR-level) and **debugger/stack context** threads ([issue landscape](https://github.com/continuedev/continue/issues/4619)) — still not Cursor’s packaged instrumentation server.
  - **Cutting-edge research:** **InspectCoder / InspectWare** (arXiv 2510.18327, OSS framework) pushes **LLM ↔ interactive debugger** (breakpoints, state inspection, “perturbations”) — closer to **DAP-grade** feedback than printf loops; **snooper-ai** = **trace-to-LLM** (PySnooper-style) as a **printf alternative**.
- **Puppet Master capability (from user, planning assumption):** PM has **built-in browser** affordances; **agents can drive that browser** to assist debugging (navigate, repro steps, gather visible/client-side signals). Treat this as a **first-class web debug adapter** — not only “external Playwright MCP” or paste-only workflows.
- **Documented PM browser capabilities (`Plans/` — parallel read-only scan, Mar 2026):**
  - **SSOT:** `Plans/Section15_MVP_Promoted_Features_Spec.md` §3.18 defines the **built-in browser** contract (distinct from `web_search` / `web_fetch` / Site Reader): real PM-controlled surface; **CEF-class embedded Chromium**, bundled pinned runtime, **`runtime_unavailable`** on failure, no silent fallback to unrelated legacy system webview; **editor/workspace tab** = canonical in-shell host; **bottom panel** = browser-adjacent only (evidence, DevTools-linked panes, summaries); session classes **`workspace_preview`**, **`detached_preview`**, **`automation_session`** (watchable agent-driven; ephemeral profile default), **`auth_session`**.
  - **Named action contract (agent/user tooling):** §3.18 lists guaranteed actions including **`navigate`**, interaction primitives, **`snapshot`**, **`screenshot`**, **`console`**, **`network`**, viewport, trace/video, PDF, storage/cookie mutations (advanced tier); **raw CDP** explicitly **not** the guaranteed core contract.
  - **DevTools:** docked DevTools default, single focused instance; user can **watch live automation** in visible **`automation_session`**; user takeover flows (pause/continue/stop) per §1.3 themes in same doc.
  - **Chat capture:** explicit only — `browser_selection_context`, `browser_element_context`; chips must not auto-send (`Section15` + `Plans/assistant-chat-design.md`).
  - **Supporting normative docs:** `Plans/FileManager.md` (HTML preview = same runtime; open flows), `Plans/UI_Command_Catalog.md` (`cmd.browser.*`), `Plans/storage-plan.md` (session/profile state, `browser.context_captured`), `Plans/rewrite-tie-in-memo.md` (CEF baseline, no silent webview swap), `Plans/Permissions_System.md` (trust tiers vs browser-capable modes), `Plans/newtools.md` / shard `newtools/21-14-*` (`web.pm_browser.visible`, `doctor.browser.runtime`, automation vs Playwright compat).
  - **Spec drift (called out in `Plans/.pipeline/work_items/w-20260319-030558/working_ledger.md`):** older **`FinalGUISpec.md`** + appendix still mention **bottom-panel Browser tab** and **`wry`** implementation sketch; **canonical** story is **editor-tab-first** + **CEF-class** per §3.18 and `rewrite-tie-in-memo.md` — reconciliation pending, not research-owned here.
  - **`feature-list.md` / shard:** “embedded webviews optional optimizations” vs other docs treating bundled browser as core — treat as **reconciliation** item.
  - **External Playwright / Browser MCP:** documented for **interview**, **test strategy**, **tool discovery** (`newtools`, `interview-subagent-integration`) — **orthogonal** to the **promoted named-action** browser contract unless explicitly bridged.
- **Mapping “point at app / website” → research artifacts:**
  - **Cursor loop (A)** helps when the **running thing is built from the open workspace** so PM can **inject temporary logs** and ship them to a **local collector**; user **reproduces** on that target. Same codebase = tight coupling.
  - **Websites / browser targets:** combine **server/workspace instrumentation** (when applicable) with **PM-controlled built-in browser** for **repro automation** and **capture** (console, network summaries, DOM/screenshot-style evidence as PM exposes) — competitive OSS analog is **agent + browser tools** (Cline-class), but PM’s **native** browser stack is the preferred integration point for **permissions, session identity, and attach-to-chat bundles**.
  - **Binary / app you didn’t build in workspace:** **instrumentation in source** may be impossible; fallbacks = **attach logs**, **DAP** (G), **external observability** (F), or **black-box repro** + user-pasted evidence.
  - **Copilot attach (E)** helps **any** target: user (or PM) attaches **structured bundles** to chat — **runtime evidence**, **agent debug snapshot**, **last N tool calls**, etc. It does **not** replace Cursor-style **probe + collect** for the **app**; it **feeds the model** and improves **assistant-side** transparency.

### Verification pass — architecture constraints confirmed (2026-03-22)

- **Chat/runtime model separation is already real:** `Plans/Run_Modes.md` and `Plans/assistant-chat-design.md` confirm that `Ask`, `Plan`, `Deep Plan`, and `Agent` are chat-facing labels or overlays over canonical runtime modes `ask | plan | regular | yolo`. Implication: a PM “debug” experience should be modeled as a **workflow overlay and target/evidence package**, not as a brand-new runtime mode. If PM exposes a visible `Debug` picker, it still needs to normalize into the existing runtime mode family.
- **One tool registry already spans PM surfaces:** `Plans/Tools.md` defines a **central tool registry** for built-in, MCP, provider, custom, and skill-backed tools, with shared permissions and eventing. Implication: **debug adapters/evidence collectors should plug into that registry** and be available to Assistant, Interview, Orchestrator, Crew/subagents, etc. — not invented as a chat-only side system.
- **Web/debug substrate already exists in PM docs:** `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/Permissions_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/storage-plan.md`, and `Plans/Runtime_Artifacts_Panel.md` already define most of the **browser-backed debug path**:
  - `automation_session` is explicitly for **testing, verification, debugging, and other live automation**
  - browser readback actions such as `navigate`, `snapshot`, `screenshot`, `console`, and `network` are allowed when the runtime is healthy
  - interaction/trace/video are permissioned separately
  - browser evidence routes through the shared runtime-artifact pipeline with canonical `browser_session_id` and `session_class`
  Implication: **web/app debug MVP can be grounded in existing browser/session/evidence contracts** rather than invented from scratch.
- **Normal browser capture cannot silently feed chat:** `Plans/assistant-chat-design.md` explicitly requires visible composer chips for browser capture and says capture **MUST NOT silently inject a hidden message**. Implication: any agent-fed debug evidence channel needs its **own visible, bounded attach contract** (for example an investigation bundle or debug-context chip/card), not a covert reuse of normal browser share/capture behavior.
- **PM already has many of the right artifact types:** `Plans/Runtime_Artifacts_Panel.md` already includes `runtime_artifact.evidence`, `tool_llm_trace`, `context_snapshot`, `failed_attempts`, `before_after_snapshot`, and `browser_recording`. Implication: PM may **not need a wholly new artifact family** for debugging if existing artifact types can be grouped by a shared investigation or bundle identity.
- **Naming collision is stronger than the prior ledger captured:** `Plans/FinalGUISpec.md` and related docs already reserve **Debug** / **Debug tab** for **classical DAP debugging**. The collision between **breakpoint debugging**, **agentic app/runtime investigation**, and **assistant-session inspection** is not hypothetical; PM needs explicit terminology separation.
- **Important missing contract:** there is **no current plan contract** for a temporary-instrumentation patch pipeline, collector lifecycle, cleanup guarantees, or debug-specific mutation rules for “add logs, repro, auto-cleanup.” This does **not** forbid Cursor-like instrumentation later, but it is **not currently planned enough to claim as grounded MVP behavior**. Any instrumentation-first story needs an explicit write/cleanup/rollback contract instead of being treated as a free extension of existing tools.

### Clarification from user — Debug Mode vs debug-capable tools (2026-03-22)

- **Debug-capable tools are platform-wide capabilities:** the browser automation/testing path, tracers/logging/debugging tools, log inspection, and related evidence tools are **not chat-mode-exclusive**. Any PM agent surface (for example Orchestrator) may use them when relevant under the shared tool registry and permission model.
- **Debug Mode is still an explicit Assistant chat mode:** in the Assistant chat window, **Debug Mode** should appear as a deliberate user choice alongside the other chat modes. When the user chooses it, they describe the problem and the assistant agent and/or subagents should run the evidence-first debugging workflow using the shared debug-capable toolchain.
- **This resolves the earlier tension between “global tools” and “chat mode”:** Debug Mode is the **chat entry posture and workflow contract** for Assistant conversations, while the tools themselves remain **cross-surface PM capabilities**.
- **Implication for reconciliation:** `Plans/assistant-chat-design.md` needs to grow from the current visible chat mode set (`Ask`, `Agent`, `Plan`, `Deep Plan`) to include **Debug Mode** explicitly, while `Plans/Run_Modes.md` can still keep runtime posture separate because Debug Mode is modeled as a chat/workflow overlay rather than a new execution-posture enum.

## Initial gaps / problems identified (historical; resolved below)

These were the starting seams from the early audit. They are preserved for research continuity, but they are **not** the current blocker list. Later sections in this ledger resolve the operative design defaults.

- **Primary failure domain** still unknown: Rust tests, long-running agent/daemon, Tauri/UI, integration tests, provider round-trips, etc.
- **Operator model** unclear: human-first (read + assist) vs agent-first (drives reruns and instrumentation).
- **Environment constraints** unknown: sandbox-only, no arbitrary shell, CI-only, etc.
- **Parity target unclear:** match Cursor’s **instrumentation + repro + cleanup** loop vs lighter **“structured failure bundle”** (test output + stack + file refs) without auto-instrumentation.
- **Naming collision in market:** many vendors say **“debug”** for **AI-session introspection** (Copilot) or **support diagnostics** (Windsurf) — easy to build the wrong feature if PM copies a label without the **dual-plane** distinction (**app under debug** vs **assistant under debug**).
- **Debug target taxonomy** not specified: **local process**, **URL + browser**, **mobile**, **remote env**, **no repo** — each needs different **evidence adapters** and **permission** stories.
- **Current PM specs do not define a visible attach path for tool-emitted debug evidence:** browser capture is explicit-user-attach only; agent/session traces and runtime bundles need a bounded, user-visible debug attach model if they are to enter chat automatically or semi-automatically.
- **Debug identity model is incomplete:** PM already has `terminal_session_id`, `dev_session_id`, `browser_session_id`, and DAP-style debug identity, but the work item has not yet decided whether it needs a higher-level `investigation` / `bundle` identity to group evidence across those existing anchors.
- **Mode taxonomy risk:** PM’s current chat/runtime model strongly suggests **overlay + target/evidence model**, while the original request also framed this as a **fifth chat mode**. That needed explicit reconciliation so UI labels, compact labels, runtime normalization, and permission posture did not drift apart.

## Historical candidate fixes / design directions

- **A — Cursor-parity “instrumentation loop”:** policy + UI for temporary logs, local sink, explicit “repro now” handoff, cleanup pass. *Pros:* strong for heisenbugs. *Cons:* highest trust/safety/review surface; needs clear diff visibility and rollback.
- **B — Test/build-first debug:** structured `cargo test` / build failure objects, maps to paths, optional verbosity. *Pros:* narrow, auditable, no code mutation. *Cons:* weak for runtime-only failures.
- **C — Process / session debug:** correlate by `dev_session_id` / trace id, tail allowed channels, link to Output/Problems. *Pros:* matches workbench/session model. *Cons:* needs clear retention and redaction rules.
- **D — Replay capsule:** bounded event + config snapshot for repro. *Pros:* great for CI/support. *Cons:* privacy, storage, determinism hard problems.
- **E — “Copilot-style” assistant introspection plane:** chronological **agent** event log, flow chart, OTLP export, attach snapshot to chat — **complements** A–D; does not replace app runtime evidence.
- **F — Observability-first bridge (Devin-class):** MCP or read-only connectors to **APM/logs/metrics** for production-like failures — different trust model than local probes.
- **G — Research-grade:** DAP/session tools + **perturbation** in debugger (InspectCoder direction) or **execution trace → LLM** (snooper-style) — high novelty, higher implementation risk.
- **H — Debug target registry + adapters:** user picks **target** (launch config, URL, attach PID, etc.); PM routes to **collector** (log sink, **built-in browser session** + agent tools, DAP) — unifies “point at X” UX.
- **I — Debug overlay + investigation bundle:** expose debug as a **workflow overlay** that normalizes to existing runtime modes while introducing one explicit **investigation/bundle grouping** for evidence, attachments, and export. *Pros:* fits PM’s mode architecture and existing artifact/event model. *Cons:* requires new terminology/UI language and bundle contracts.
- **J — Artifact reuse before artifact invention:** reuse existing runtime-artifact families (`evidence`, `context_snapshot`, `tool_llm_trace`, `browser_recording`, `failed_attempts`, `before_after_snapshot`) under a shared investigation/bundle identity before inventing a parallel debug-only artifact silo. *Pros:* aligns with current SSOT and avoids duplicate pipelines. *Cons:* may require careful grouping/open/export semantics.
- **Recommendation (revised after user direction on naming + MVP scope):** treat **H + I + J + E + A** as the grounded PM core:
  - **H** for the “point PM at a target” experience
  - **I** so debug fits PM’s overlay/runtime architecture instead of adding a new runtime mode
  - **J** so evidence rides the existing runtime-artifact and seglog pipeline
  - **E** so PM can also support **assistant/session inspection** in a Copilot-like way
  - **A** because the user wants **temporary instrumentation in MVP**, with explicit cleanup/rollback requirements
  Then:
  - use **PM built-in browser + `automation_session`** as the strongest MVP path for web/debug repro
  - use **`dev_session_id`** / existing output-problems-ports linkage for process/test/dev-server correlation
  - keep **classical DAP debugging** as a separate but related surface/adapter
  - include **Cursor-like temporary instrumentation** in MVP only under an explicit instrumentation contract (visibility, cleanup, rollback, failure handling)

## Proposed implementation-ready shape (current recommendation)

### 1) Product split: one Debug Mode, three related debug planes

- **Plane A — App / runtime investigation:** the agentic “debug my app/site/process” loop
- **Plane B — Assistant/session inspection:** Copilot-style “show me what the agent did / what tools it called / why it failed”
- **Plane C — Classical debugger:** existing DAP-oriented debugger surface for breakpoints, call stacks, variables, etc.

Recommendation:
- PM should expose **Debug Mode** as the umbrella workflow/mode across all three planes
- PM should **share infrastructure** across all three planes through the shared tool registry, artifacts, permissions, and identity models already defined in PM
- **All agents keep access to the same tools at any time** under the shared tool registry and permission model; Debug Mode is **not** an exclusive capability gate
- **Debug Mode is specifically an explicit Assistant chat mode choice**
- Debug Mode should be treated as an **evidence-first investigation posture**, not a weak suggestion
- when Debug Mode is active, the agent should **proactively prefer** debug-capable tools and flows (target selection, evidence capture, repro, verification, cleanup) as the default path
- Debug Mode still retains the **full general toolset** and may use non-debug-specific tools whenever the investigation needs them
- PM still needs UI copy that distinguishes the **overall Debug Mode** from the **classical debugger surface/controls** when both are present in the same area

### 1.1) Mode semantics

- **Debug Mode is an explicit Assistant chat-surface mode / workflow overlay**, not a tool silo
- Recommended persisted fields:
  - `requested_mode_overlay = debug`
  - `effective_mode_overlay = debug`
  - compact label / summary label = `Debug`
- Debug Mode carries an **evidence-first operating contract**
- when Debug Mode is active, the agent should default to:
  - choosing or confirming a debug target
  - gathering bounded runtime evidence early rather than waiting too long on static speculation
  - using browser/dev-session/debugger/session-trace/instrumentation tools proactively when relevant
  - verifying fixes and cleaning up temporary instrumentation
- when Debug Mode is not active, **agents may still use the same tools** whenever they are relevant and permitted
- Debug Mode is therefore best understood as an **explicit investigation posture with stronger tool-selection expectations**, not as a separate permission silo or a tool whitelist
- Assistant-chat reconciliation should account for Debug Mode as a **visible peer mode** to the existing Assistant chat modes, even though the underlying debug-capable tools remain reusable by non-Debug surfaces

### 1.2) Assistant mode IA reconciliation

- Recommended visible primary Assistant mode set:
  - `Ask`
  - `Agent`
  - `Debug`
  - `Plan`
  - `Deep Plan`
- For Debug Mode reconciliation, treat `Interview`, `BrainStorm`, and `Crew` as **secondary workflows / overlays / launch paths** rather than peers in the primary Assistant mode strip.
- Entering **Debug Mode** should create a clear **execution-capable** posture, not a read-only posture. It is not another planning variant.
- If no project is open, Debug Mode should degrade to only those target kinds that remain meaningful without a project (for example `agent_session` or `imported_bundle`) and explicitly disclose what is unavailable.
- Assistant-chat reconciliation should add:
  - `/mode debug`
  - persisted restore semantics for thread reopen / resume
  - transcript/status labeling that makes Debug investigations visually distinct from Ask/Agent/Plan threads

### 1.3) Fully automated default behavior

- The normal Debug Mode path should be **fully automated**:
  - target discovery/selection
  - environment/tool preparation
  - browser/test/process repro
  - evidence capture
  - tracer/instrumentation install or activation
  - analysis
  - tentative fix
  - automated verification
  - cleanup / rollback
- Manual repro, manual attach, or manual evidence selection should be **fallbacks** when PM cannot automate a specific step (for example CAPTCHA, hardware/device dependency, missing credentials, or hard policy denial), not the normal path.
- This is a deliberate product divergence from Cursor’s more human-driven repro loop: PM should aim for **agent-driven reproduction and verification first**, with human intervention only when automation hits a real boundary.

### 1.4) Recommended automation authority model

The hardest reconciliation seam is “fully automated” Debug Mode vs the existing permission/run-mode architecture. Recommended model:

- **Debug Mode remains a chat/workflow overlay**, not a new runtime enum.
- **Default runtime posture under Debug Mode should remain `regular`.**
- **Default execution strategy under Debug Mode should be HTE**, not DAE.
- **Selecting Debug Mode and submitting the debug request counts as the user’s up-front authorization to start an automated investigation.**
- PM should realize that authorization as a **run-scoped Debug Automation Profile** layered into the existing permission snapshot rather than inventing new permission verbs or a fifth runtime enum.
- This keeps Debug Mode fully automated while still fitting the current permission stack.

Recommended behavior by posture:
- **Debug Mode + `regular` posture**
  - full automation is still the default experience
  - PM uses HTE plus the Debug Automation Profile to suppress ordinary per-step prompts for in-scope debugging actions
  - capabilities outside the profile or impossible under policy/runtime constraints surface as **requested vs effective degradation**
- **Debug Mode + `yolo` posture**
  - remains broader and less constrained than normal Debug Mode
  - should be treated as an explicit power-user opt-in, not the default Debug experience
- **Debug Mode + `ask`**
  - should not be offered as a stable combination
  - entering Debug Mode should switch the Assistant into an execution-capable posture
- **Debug Mode + `plan`**
  - plan-mode reasoning may be used *inside* investigations, but the user-facing mode should still remain Debug rather than pretending the session is read-only

Recommended auto-allowed actions under the Debug Automation Profile:
- browser automation for the chosen URL/domain/session
- process/test rerun control for the linked `dev_session_id`
- bounded evidence auto-ingestion into the active investigation bundle
- temporary instrumentation write scope for the specific files/processes targeted by the investigation
- tracer/debugger attach/install permissions for the active target environment
- bounded local build/test/bash execution inside project scope
- read/search/log-summary/debug-trace actions across the active target surfaces

Actions that should still require explicit confirmation / remain non-bypassable:
- `external_publish_side_effect`-class actions and equivalent irreversible/external side effects
- browser actions already modeled as `explicit_confirmation` (for example cookie/storage mutation, storage import/export, offline/mock routing, promotion into normal browsing)
- external directory access outside current policy/allowlist
- any capability currently modeled as unavailable or degraded for the active runtime/browser health state

Important caveat:
- this should not be described as “all permissions bypassed”
- it is better framed as **one explicit front-door authorization for the investigation**, after which PM runs the debug loop automatically within the granted scope and visibly reports any degraded/unavailable capabilities
- blocked episodes should reuse the existing PM blocked-action approval machinery rather than inventing a Debug-only approval lane

### 1.5) Naming and DAP relationship

- **Debug Mode** should refer to the assistant-led investigation workflow.
- Classical DAP debugging should remain a supported adapter/surface, but it should not own the umbrella word “Debug” in user-facing copy once Debug Mode ships.
- Reconciliation should rename the classical surface/tab label to **Debugger** and may use **DAP Debugger** in explanatory copy where extra precision helps.

### 2) Core object model

- **`debug_target_kind`** (proposed planning term):  
  `dev_session | browser_target | dap_session | agent_session | imported_bundle`
- **`investigation_id`** (recommended new grouping identity): groups the evidence, attachments, verification steps, and fixes for one debugging attempt across existing session IDs
- `investigation_id` should link, when present, to:
  - `thread_id`
  - `run_id`
  - `dev_session_id`
  - `terminal_session_id`
  - `browser_session_id`
  - `session_class`
  - DAP/debugger session identity when available

Rationale:
- PM already has strong per-surface identities; the missing piece is a **cross-surface grouping identity** for “this is the same investigation”
- this is cleaner than inventing a parallel debug-only session model for browser, terminal, and artifacts

### 2.1) Investigation lifecycle / state model

Recommended high-level investigation states:
- `draft`
- `discovering_targets`
- `preparing_environment`
- `capturing_baseline`
- `instrumenting`
- `reproducing`
- `collecting_evidence`
- `analyzing`
- `applying_fix`
- `verifying`
- `cleaning_up`
- `resolved`
- `attention_required`
- `blocked`
- `failed`
- `failed_cleanup`
- `cancelled`
- `superseded`

Important rules:
- one investigation may span multiple concrete surfaces (for example browser + dev session + agent-session trace)
- the user-facing status should always surface the **current phase**, the **primary target**, and whether **temporary instrumentation is active**
- cleanup failure is not the same as analysis failure; it needs a separate state because the app bug might be fixed while temporary debug mutations still remain
- final-state mapping is deterministic:
  - `resolved` pairs with `stop_reason_code = investigation.resolved_verified` or `investigation.analysis_only_completed`
  - `attention_required` pairs with `stop_reason_code = investigation.attention_required` plus `attention_required_reason_code`
  - `blocked` pairs with `stop_reason_code = investigation.blocked` plus shared `blocked_reason_code`
  - `failed` pairs with `stop_reason_code = investigation.verification_failed | investigation.no_repro_observed | investigation.budget_exhausted | investigation.runtime_unavailable | investigation.target_unreachable | investigation.adapter_unavailable`
  - `failed_cleanup` pairs with `stop_reason_code = investigation.cleanup_failed`
  - `cancelled` pairs with `stop_reason_code = investigation.cancelled_by_user`
  - `superseded` pairs with `stop_reason_code = investigation.superseded`

### 3) Adapter model

- **Dev-session adapter**
  - entry points: active dev session, failing run/test, explicit “debug this dev server/session”
  - canonical correlation key: **`dev_session_id`**
  - default evidence: linked Output / Problems / Ports, bounded recent terminal command-block context, latest failure summary, explicit rerun/verify actions
- **Browser adapter**
  - entry points: active workspace preview, URL target, browser-backed app repro
  - runtime surface: visible **`automation_session`**
  - default evidence: `snapshot`, `screenshot`, console/network summaries, browser recordings/traces/videos where enabled, takeover/promote flows unchanged
  - canonical correlation keys: **`browser_session_id` + `session_class`**
- **Agent-session adapter**
  - entry points: “why did the agent fail / what did it do / troubleshoot this run”
  - evidence source should reuse existing runtime-artifact types such as **`tool_llm_trace`**, **`context_snapshot`**, **`failed_attempts`**, and **`subagent_lineage`**
  - must support bounded attach to the thread plus later export/import under the same investigation model
- **DAP adapter**
  - classical debugger stays a separate UI/surface
  - investigation flows may attach bounded debugger state (stack, frame, variable summary, stopped location) when available, but this does not redefine DAP as the same feature as runtime investigation
- **Imported-bundle adapter**
  - fallback for targets PM cannot drive directly
  - accepts user-provided logs/screenshots/traces/error bundles and converts them into the same investigation grouping model

### 3.1) Global debug-capable tool groups

To reconcile “global tools” with “Debug Mode prefers them”, PM should use **debug-capable tool groups / tags** inside the central tool registry. Suggested groups:
- `debug.target_discovery`
- `debug.browser_automation`
- `debug.logs_and_console`
- `debug.network_and_http`
- `debug.trace_and_profile`
- `debug.instrumentation`
- `debug.process_and_test_control`
- `debug.dap`
- `debug.agent_session_trace`
- `debug.bundle_export`

Rules:
- these are **selection/orchestration hints**, not a separate permission system
- any PM agent may use tools from these groups when relevant
- Debug Mode should **prefer these groups first** before falling back to more general-purpose tools

### 3.2) Debug strategy ladder

Recommended automatic escalation order:
1. Reuse existing evidence already available from the target or prior failed run.
2. Use non-invasive readback and capture (logs, console, network, Problems, Output, traces already available).
3. Enable/install non-invasive tracers, wrappers, or debugger attachments when the active target and policy permit them.
4. Apply temporary instrumentation patches only when prior tiers are insufficient.
5. Apply tentative durable fix.
6. Re-run automated verification.
7. Remove temporary instrumentation and finalize or enter explicit cleanup-recovery state.

This keeps Debug Mode powerful without jumping to source mutation before easier evidence paths are exhausted.

### 3.3) Suggested subagent orchestration model

Because the user explicitly wants the assistant **and/or subagents** to drive Debug Mode, a strong orchestration model should be part of the design:

- **Debug manager / coordinator**
  - owns the `investigation_id`
  - selects targets/adapters
  - tracks current phase, budgets, and stop reasons
  - decides when to escalate from passive capture to instrumentation to fix/verify
- **Target discovery / environment prep subagent**
  - detects stack/runtime
  - prepares dev session, browser session, debugger attach, or imported bundle intake
  - installs/activates tracers or debug tooling when required
- **Repro / capture subagent**
  - drives browser automation, test reruns, process restarts, or debugger repro loops
  - captures baseline and post-change evidence
- **Evidence analysis subagent**
  - compares logs/traces/snapshots
  - narrows hypotheses and identifies the next evidence gap
- **Fix / verify / cleanup subagent**
  - applies the durable fix
  - runs automated verification
  - removes temporary instrumentation and handles rollback/restore when cleanup fails

Rules:
- subagents operate under the same shared tool registry and investigation scope
- their work should still land in one canonical investigation timeline and artifact set
- subagents may specialize, but the manager must prevent them from creating parallel, contradictory debug loops

### 3.4) Environment preparation and tool provisioning

To satisfy the user’s “install the tracers/logging/debugging tools on whatever the target is” direction, Debug Mode should explicitly support an automated **prepare environment** phase:

- detect runtime / framework / process shape
- choose the best available debug strategy for that environment
- install or enable tracer/debug/profiler tooling when missing and when policy allows
- restart or relaunch the target under the right env/config/wrapper settings
- attach browser/debugger/profiler tools to the correct process/session

Recommended preparation outputs:
- chosen adapter
- chosen strategy tier
- requested vs effective capabilities
- installed/activated temporary tooling
- restart / relaunch requirements
- cleanup obligations for any temporary provisioning work

### 3.5) Target discovery, auto-selection, and workspace-binding rules

Debug Mode needs deterministic target binding because the user expects the default flow to be fully automated.

Target-selection precedence:
1. **explicit user-chosen target** in the current debug request
2. **existing investigation target** when resuming or continuing the same investigation
3. **workspace-bound live target** already linked to the current project/thread:
   - active `dev_session_id`
   - active workspace preview / `automation_session`
   - active DAP session
4. **attached imported bundle** when the current request is explicitly about supplied evidence rather than a live target
5. **agent_session** when the request is explicitly about PM’s own run/session behavior or no project-backed target is available

Tie-breaking rules:
- if exactly one candidate exists at the highest precedence tier, PM selects it automatically
- if multiple candidates exist at the same highest precedence tier and one is already linked to the current thread/investigation, reuse that one
- if multiple same-tier candidates remain and no deterministic winner exists, enter `attention_required` with `attention_required_reason_code = target_selection_required`; PM must not guess

Workspace-binding rules:
- a target is **workspace-bound** when PM can map it to the current project identity through one of:
  - `project_id`
  - `dev_session_id`
  - workspace preview/browser identity
  - DAP session identity
  - explicit user-confirmed project binding
- durable fixes are allowed only for workspace-bound targets or for PM-owned surfaces such as `agent_session`
- arbitrary URL investigations start as **diagnose/verify-only browser investigations**
- an arbitrary URL may upgrade into a durable-fix investigation only after PM binds it to a workspace-backed target

Arbitrary-URL binding precedence:
1. matching workspace preview/browser subject already open for the current project
2. matching active dev-session port/base URL for the current project
3. explicit user confirmation that the URL belongs to the current workspace/project

If no workspace binding can be established:
- PM may still reproduce, capture, analyze, export, and produce an implementation suggestion
- PM must not apply a durable fix to project files under the fiction that the arbitrary URL is already bound

### 4) Evidence and attach contract

- **Tool/runtime evidence should remain bounded at source**
  - browser actions return bounded summaries
  - session/debug traces attach bounded snapshots rather than raw unbounded logs by default
- **Persistent evidence should reuse the existing runtime-artifact pipeline**
  - grouped under `investigation_id` using existing artifact kinds first
  - open/focus actions must route back to canonical browser/dev/debugger/session identities
- **Debug mode does not monopolize these artifacts/tools**
  - any agent surface may produce or consume them when relevant
  - Debug Mode changes the **default operating behavior** toward structured evidence loops and proactive use of the debug-capable toolchain, but it does not limit the agent to only those tools
- **Chat attach must stay visible**
  - PM must not violate the current “no hidden browser capture injection” rule
  - when an investigation is active, PM materializes a visible **Investigation Context** card/chip/panel state representing the current bounded debug bundle
  - attach/removal/revocation should be explicit and user-visible even if the active run can directly consume tool results during the same turn

### 4.1) Automated evidence ingestion in Debug Mode

Because the user wants Debug Mode to be fully automated:
- tool-emitted evidence for the **active investigation** should be **auto-ingested** into the investigation bundle by default
- that auto-ingestion must still remain **visible**, inspectable, and revocable on the owning Debug Mode surface
- this should be treated as a **new explicit Debug Mode contract**, not as a silent exception to the normal browser-capture-to-chat rules

Recommended model:
- normal browser/document capture outside Debug Mode remains manual/explicit via chips/cards
- Debug Mode creates a visible **live investigation bundle** whose contents update automatically as tools emit bounded evidence
- the active debug run may consume that live bundle automatically without waiting for manual per-capture attach clicks

### 4.1.1) Live Investigation Context contract

Canonical user-visible term: **Investigation Context**.

Exactly one active Investigation Context may be attached to a given Assistant Debug thread at a time.

Required Investigation Context header fields:
- `investigation_id`
- `primary_target`
- `current_phase`
- `final_or_intermediate_state`
- `stop_reason_code?`
- `attention_required_reason_code?`
- `blocked_reason_code?`
- `active_instrumentation`
- `last_updated_at_utc`

Required per-item states inside the Investigation Context:
- `active`
- `redacted`
- `revoked`
- `blocked`
- `expired`
- `omitted`

Attach/revoke rules:
- in-scope tool-emitted evidence for the active investigation enters the Investigation Context as `active` unless redaction/truncation forces another state
- `revoked` items remain in artifact/audit history but are excluded from future prompt assembly
- `blocked` and `expired` items never serialize as successful prompt attachments
- `omitted` items are counted in summary metadata and export manifests but do not auto-enter prompt assembly

Lifecycle rules:
- reopening a thread with an active or interrupted investigation restores the Investigation Context from persisted investigation state
- completed investigations reopen as **historical Investigation Context** records by default; they do not auto-resume execution
- the Investigation Context must always show whether the linked runtime identities are currently healthy, stale, or unavailable

### 4.2) Investigation bundle contents

Required live-bundle components:
- target metadata
- current phase/status
- latest failure summary
- active evidence set
- active instrumentation state
- relevant runtime artifacts
- current fix candidate / fix status
- verification outcome
- cleanup outcome

The bundle should be a first-class grouping surface in chat/artifacts, not just an invisible prompt-construction detail.

### 4.2.1) Evidence bundle budgets and redaction defaults

Recommended default policy: **summary-first, raw-second**.

- agent/tool evidence should auto-enter the live investigation bundle only as **bounded summaries** plus stable artifact refs
- raw logs, full trace payloads, full DOM dumps, request/response bodies, cookies/storage values, and binary blobs should **not** auto-inline into model context by default
- full artifacts remain in the runtime-artifact system and may be opened/focused/exported from there

Recommended starting budgets for prompt-consumable evidence:
- per evidence item: max **8 KB normalized text equivalent** or **120 lines**, whichever is hit first
- per active investigation turn: max **32 KB normalized text equivalent** of raw excerpts total, with the rest collapsed into a structured digest
- auto-ingest at most the **top 5 evidence items** by current relevance/severity before summarization-only mode kicks in
- screenshots/video/traces are represented inline by metadata + summary + optional thumbnail, not raw binary payloads

Recommended redaction rules:
- always redact or hash obvious secrets/tokens (`Authorization`, cookies, session IDs, API keys, passwords, private tokens)
- default network evidence to method, URL, status, timing, initiator, and allowlisted headers; bodies are omitted unless explicitly requested and policy allows
- default storage/auth evidence to state summaries rather than raw values
- if PM cannot confidently sanitize a candidate evidence item, convert it to a blocked/redacted placeholder with explicit reveal/export controls

Recommended inclusion rules:
- inside an active Debug investigation, **agent-emitted in-scope evidence** may auto-enter the visible Investigation Context because the user already authorized the investigation at the front door
- **user-supplied external files/logs** remain explicit additions
- removing an item from the Investigation Context stops future prompt assembly from using it, but does not erase the underlying artifact/audit record

### 4.3) Automation budgets and stop conditions

Fully automated Debug Mode needs explicit loop budgets such as:
- max instrumentation passes
- max repro attempts
- max verification attempts
- max package/tool installs
- max elapsed wall time
- max browser scenario branches
- max consecutive no-new-evidence loops

If a budget trips, the investigation should stop with a machine-readable stop reason and a user-visible explanation rather than spinning or quietly degrading.

### 4.3.1) Recommended numeric default budgets

Recommended initial defaults for MVP packetization:
- `max_target_discovery_attempts = 3`
- `max_prepare_attempts = 2`
- `max_instrumentation_passes = 2`
- `max_invasive_instrumentation_passes = 1`
- `max_fix_candidates = 2`
- `max_repro_attempts_per_strategy_tier = 3`
- `max_verification_attempts_per_fix_candidate = 2`
- `max_package_or_tool_installs = 2` per investigation
- `max_browser_scenario_branches = 3`
- `max_consecutive_no_new_evidence_loops = 2`
- `max_active_temporary_instrumentation_lanes = 1`
- `max_cleanup_retries = 2`
- `max_attention_required_resume_cycles = 3`
- `max_elapsed_wall_time_s = 1200`

Interpretation rules:
- only installs that persist beyond a single process lifetime count toward `max_package_or_tool_installs`
- a strategy-tier change resets `repro_attempts_per_strategy_tier` but does **not** reset wall-clock or no-new-evidence budgets
- a verification rerun after cleanup still counts toward `max_verification_attempts_per_fix_candidate`
- Debug Mode should stop escalating after one active temporary instrumentation lane; if another lane is needed, the current one must be removed, promoted into the durable fix lane, or the investigation must stop with explanation

### 4.3.2) Stop-reason and attention-reason taxonomy

PM should keep using the shared runtime `blocked_reason_code` model for blocked episodes. Debug Mode should add two Debug-specific fields:

- **`stop_reason_code`** (final investigation-level outcome explanation)
- **`attention_required_reason_code?`** (why the current investigation is waiting for a human-in-the-loop assist without yet being hard-blocked)

Recommended `stop_reason_code` enum:
- `investigation.resolved_verified`
- `investigation.analysis_only_completed`
- `investigation.cleanup_failed`
- `investigation.verification_failed`
- `investigation.no_repro_observed`
- `investigation.budget_exhausted`
- `investigation.attention_required`
- `investigation.blocked`
- `investigation.runtime_unavailable`
- `investigation.target_unreachable`
- `investigation.adapter_unavailable`
- `investigation.cancelled_by_user`
- `investigation.superseded`

Recommended `attention_required_reason_code` enum:
- `auth_handoff_required`
- `manual_repro_required`
- `manual_verification_required`
- `target_selection_required`
- `workspace_binding_required`
- `import_bundle_required`
- `external_app_start_required`
- `session_reconnect_required`
- `missing_credentials_or_secret`
- `degraded_evidence_review_required`
- `sensitive_capture_review_required`
- `adapter_switch_recommended`

Recommended auxiliary field:
- `budget_kind?` with values:
  - `target_discovery_attempts`
  - `prepare_attempts`
  - `instrumentation_passes`
  - `invasive_instrumentation_passes`
  - `fix_candidates`
  - `repro_attempts`
  - `verification_attempts`
  - `package_or_tool_installs`
  - `browser_scenario_branches`
  - `no_new_evidence_loops`
  - `active_temporary_instrumentation_lanes`
  - `cleanup_retries`
  - `attention_required_resume_cycles`
  - `elapsed_wall_time`

Rules:
- when a flow is waiting for a human assist but can continue in the same investigation after that assist, state = `attention_required` with `attention_required_reason_code`
- when automation truly cannot continue until a prerequisite changes, state = `blocked` with the shared `blocked_reason_code`
- when a budget trips, state may be `failed` or `attention_required` depending on whether user recovery is meaningful, but `stop_reason_code` MUST still be `investigation.budget_exhausted` with `budget_kind`
- when a cleanup residue remains after the app issue appears fixed, use lifecycle state `failed_cleanup` and `stop_reason_code = investigation.cleanup_failed`

### 4.4) Export / import bundle recommendation

The investigation bundle should be exportable/importable as a first-class object rather than forcing users to manually reassemble logs and screenshots.

Recommended minimum exported bundle contents:
- investigation metadata (`investigation_id`, target kind, adapter, timestamps, final status)
- latest failure summary
- bounded evidence set (logs, snapshots, screenshots, trace summaries, debugger summaries)
- active/removed instrumentation history
- fix summary and verification outcome
- cleanup outcome
- bounded agent/session trace explaining what PM did

Recommended rule:
- imported bundles should map back into the **Imported-bundle adapter** and preserve the same investigation object model, even when PM can no longer drive the original target directly.
- Debug export/import should use a **new investigation-bundle schema**, not an extension of the existing verifier evidence schema; existing verifier evidence remains an optional referenced artifact inside the bundle rather than the bundle container itself.

### 4.4.1) Proposed `investigation_bundle` schema shape

Recommended root object:
- `schema_id = pm.investigation_bundle.schema.v1`
- `bundle_id`
- `schema_version`
- `bundle_kind = investigation_bundle`
- `investigation_id`
- `exported_at_utc`
- `export_scope` (`summary_only` | `summary_plus_refs`)
- `final_state`
- `stop_reason_code`

- `source`
  - `product = Puppet Master`
  - `exporter_surface`
  - `workspace_scope` (`local` | `pm_remote` | `imported`)
  - `redaction_profile_id`
  - `partial_export`
  - `truncation_flags[]`

Recommended required nested objects:

- `target`
  - `debug_target_kind`
  - `adapter_id`
  - `display_label`
  - `requested_target?`
  - `effective_target?`

- `identity_links`
  - `project_id?`
  - `thread_id?`
  - `run_id?`
  - `dev_session_id?`
  - `terminal_session_id?`
  - `browser_session_id?`
  - `session_class?`
  - `dap_session_id?`

- `permission_summary`
  - `permission_profile`
  - `requested_capabilities`
  - `effective_capabilities`
  - `capability_degradations`
  - `blocked_actions`

- `failure_summary`
  - `symptom_summary`
  - `original_failure_signature`
  - `latest_failure_signature?`
  - `first_seen_at_utc?`

- `timeline[]`
  - `phase`
  - `started_at_utc`
  - `ended_at_utc?`
  - `outcome?`
  - `detail_ref?`

- `evidence_manifest[]`
  - `artifact_id`
  - `artifact_kind`
  - `summary`
  - `source_surface`
  - `created_at_utc`
  - `redaction_state` (`none` | `partial` | `full` | `blocked`)
  - `truncation_state`
  - `detail_ref?`
  - `content_ref?`
  - `relevance_rank?`

- `instrumentation_manifest[]`
  - `instrumentation_id`
  - `scope`
  - `state`
  - `targets_or_files`
  - `introduced_at_utc`
  - `removed_at_utc?`
  - `restore_point_id?`
  - `cleanup_outcome`

- `verification_summary`
  - `adapter_kind`
  - `attempt_count`
  - `passed`
  - `heuristic_version`
  - `latest_receipt_ref?`
  - `notes[]?`

- `cleanup_summary`
  - `outcome`
  - `restore_point_id?`
  - `rollback_used`
  - `residual_items[]`
  - `recommended_recovery_action_ids[]`

- `agent_trace_summary`
  - `subagent_count`
  - `tool_span_count`
  - `failed_attempt_count`
  - `artifact_refs[]`

Recommended optional nested objects:
- `fix_summary`
  - `status`
  - `diff_artifact_id?`
  - `summary_text`
  - `file_refs[]?`
- `import_lineage`
  - `source_bundle_id?`
  - `source_origin?`
  - `imported_at_utc?`
- `omitted_items_summary`
  - `omitted_evidence_count`
  - `omitted_raw_payload_count`
  - `omission_reason_codes[]`

### 4.4.2) Export size and omission defaults

Recommended export defaults:
- manifest JSON target size <= **256 KB**
- max embedded evidence summaries = **50**
- max embedded timeline entries = **40**
- raw binaries are never embedded directly in the manifest; they remain artifact refs or external payload refs
- if export exceeds limits, PM keeps the manifest stable and pushes overflow into `omitted_items_summary`

Import rules:
- imported bundles must preserve `redaction_state`, `truncation_state`, and omission metadata
- missing raw payload refs do **not** invalidate the import; they import as unavailable-but-known evidence
- imported bundles always hydrate as the **Imported-bundle adapter** first, even if later rebound to a workspace-backed target

### 4.5) Authenticated browser/app-session recommendation

Fully automated browser-backed debugging needs a default rule for authenticated apps.

Recommended MVP behavior:
- default to an **ephemeral automation profile/session**
- if the target requires auth and no valid automation session is present, move to `attention_required`
- offer an explicit handoff path to authenticate the active investigation session
- once the user completes the one-time auth handoff, automation may resume under the visible investigation context

This keeps the normal case automated without pretending PM can silently seize or mutate real user sessions.

### 4.5.1) Browser handoff / co-piloting recommendation

Recommended MVP browser handoff model:
- **agent-driven by default**
- **no concurrent mixed steering** between user and agent during active automation
- when PM needs help (auth, CAPTCHA, one-off repro, blocked modal flow), it pauses the live `automation_session`, focuses the exact tab/step, and moves the investigation to `attention_required`
- handoff scope should remain limited to the current isolated browser session/profile and the current investigation
- once the user finishes the requested action, PM resumes from the paused step pointer or explicitly restarts the current repro step

Recommended recovery controls:
- `Resume automation`
- `Retry this step`
- `Stop agent and keep browser`
- `Promote to normal browsing` (still explicit-confirmation)
- `Cancel investigation`

Recommended nuance:
- app-debug login handoff should normally happen in the **same isolated automation session** so the resulting authenticated state is available to the resumed investigation
- PM-owned provider/device/login flows may still use dedicated `auth_session` behavior when that is the canonical flow
- storage import/export, cookie mutation, and similar high-risk session shaping remain explicit-confirmation operations; they are not part of the ordinary handoff path

### 4.6) Fallback / attention-required model

When Debug Mode cannot continue automatically, the normal fallback should be **`attention_required`**, not a silent downgrade.

Recommended recovery actions from `attention_required`:
- provide credentials or complete browser auth handoff
- take over / demonstrate the repro once, then return control
- import an external bundle
- approve a blocked action
- switch target/adapter
- cancel the investigation

### 4.6.1) Resume, reopen, and interrupted-investigation behavior

Resume/reopen rules:
- `attention_required`: do not auto-resume execution; reopen the Investigation Context with the current reason code and allowed recovery actions
- `blocked`: render the canonical blocked-state UI and do not auto-execute until the prerequisite changes
- `failed_cleanup`: reopen directly into cleanup-recovery state; PM must not start a new mutation-capable debug loop against the same target until the residue is resolved, rolled back, or explicitly promoted into the durable fix lane
- `resolved`, `failed`, `cancelled`, and `superseded`: reopen as historical records only unless the user explicitly starts a new investigation or resumes cleanup on a retained residue state

Session revalidation rules on reopen:
- PM must revalidate linked `dev_session_id`, `browser_session_id`, DAP session identity, and remote authority before resuming execution
- if the linked runtime identity is stale but recoverable, enter `attention_required` with `session_reconnect_required`
- if the linked runtime identity no longer exists and no deterministic rebinding target exists, enter `attention_required` with `target_selection_required`
- PM must not silently mint a different target identity on reopen just to continue execution

### 5) MVP boundary recommendation

**In scope for MVP**
- target picker / target registry
- dev-session adapter
- browser adapter backed by existing `automation_session`
- assistant/session-inspection adapter using existing artifact families
- visible investigation grouping/attach model
- verification loop (`re-run`, `re-check`, `still failing`, `fixed`) tied to the active investigation
- requested-vs-effective capability disclosure for debug adapters and browser/runtime state
- temporary instrumentation/logging edits with explicit cleanup/rollback rules
- support for **PM-managed remote-mode projects** where PM already owns remote file/git/terminal/agent/provider execution under the existing remote authority model

**Explicitly not MVP by default**
- production observability / APM connectors
- arbitrary ad-hoc remote host attach or non-project remote debugging outside PM’s existing remote-mode project model
- silent background evidence injection into chat
- a new execution-posture enum beyond the existing runtime mode family

### 5.1) Remote MVP scope recommendation

Recommended remote stance: **local-first, but not local-only**.

- Debug Mode should work for normal local projects
- Debug Mode should also work for **PM-managed remote-mode projects** that already follow the SSH remote contract:
  - files mutate on the remote
  - git runs on the remote
  - terminals/sessions run on the remote
  - PM agents and provider CLIs run on the remote
- investigations must respect the owning project authority model rather than silently splitting work across local and remote execution

Recommended exclusions for MVP:
- arbitrary “attach to any host over SSH and debug it” workflows
- automatic installation of missing PM/provider prerequisites on remote hosts when current remote policy says explicit consent is required
- feature claims that promise every local debug adapter has immediate full remote parity

Recommended fallback:
- when a remote investigation lacks required remote prerequisites or loses SSH continuity, move to `attention_required` / `blocked` with explicit recovery actions rather than silently retargeting locally

### 5.2) Cross-investigation ownership and conflict policy

Because debug-capable tools are shared across PM surfaces, PM needs a deterministic ownership rule whenever multiple investigations touch the same mutable target.

Ownership rules:
- only one **mutation-capable** active investigation may own a given `project_id` at a time
- only one active investigation may own temporary instrumentation for a given workspace tree / `dev_session_id` / `browser_session_id`
- non-owning investigations may still consume existing evidence/artifacts in read-only fashion

Conflict handling:
- if a second investigation tries to start mutation-capable work against an owned target, PM must either:
  - keep it read-only, or
  - explicitly supersede the current owner
- superseding transitions the older owner to lifecycle state `superseded`
- PM must not allow two active investigations to add overlapping temporary instrumentation to the same target concurrently

Cross-surface rule:
- this ownership policy applies equally to Assistant Debug, Orchestrator, and any other PM agent surface that uses the shared debug-capable toolchain

### 6) MVP instrumentation contract

Because the user wants temporary instrumentation **in MVP**, the ledger should require all of the following:
- `instrumentation_id` for each temporary instrumentation lane
- explicit write/execute permission treatment under existing FileSafe + tool policy
- instrumentation is tied to the active `investigation_id` and disclosed as present
- instrumentation changes are bounded, reviewable, and distinguishable from the proposed durable fix
- cleanup semantics with verification and failure handling
- rollback / restore-point behavior if cleanup fails
- secrets/PII logging constraints and bounded log shape rules
- user-visible disclosure of whether instrumentation is **present**, **removed successfully**, or **removal failed and needs attention**
- if cleanup cannot complete automatically, PM must not pretend the investigation ended cleanly; it must surface the remaining instrumentation state and the recovery path explicitly

### 6.1) Instrumentation scopes

Recommended instrumentation scopes to distinguish in planning:
- **env/config activation** — enable existing debug logs, tracing flags, verbose modes, or profiler toggles without source edits
- **ephemeral tool install** — install tracer/debug packages or helper binaries for the current environment/investigation
- **wrapper/launcher instrumentation** — modify launch commands, env vars, or wrapper scripts for the run
- **temporary source patch instrumentation** — add/remove code-level probes or logging statements
- **debugger/profiler attach instrumentation** — capture variables, stacks, timings, heap/cpu data through debugger/profiler integration rather than code edits

Rules:
- PM should prefer the least invasive scope that can answer the current question
- each active scope must be visible in the investigation state
- installs/config changes that persist beyond the process lifetime need cleanup/rollback treatment just like source patches

### 6.1.1) Instrumentation lifecycle

Recommended lifecycle:
- `planned`
- `active`
- `collecting`
- `cleanup_pending`
- `cleaned`
- `cleanup_failed`

Rules:
- every instrumentation lane should be linked to both `investigation_id` and `instrumentation_id`
- PM should create/update a safe point before the first invasive temporary mutation
- durable fixes and temporary instrumentation must remain separate artifact/diff lineages
- cleanup failure must remain visible even if the app issue itself appears fixed

### 6.1.2) Per-scope cleanup and rollback rules

Each instrumentation scope needs deterministic cleanup behavior:

- **env/config activation**
  - revert the exact temporary flag/toggle/value PM introduced
  - if the change lived only in process env, cleanup occurs by stopping/restarting without the temporary env
  - if PM edited a config file, treat that edit under the same rollback rules as `temporary source patch instrumentation`

- **ephemeral tool install**
  - uninstall only tooling/packages that PM installed during the current investigation
  - never uninstall pre-existing user tooling just because PM used it
  - if deterministic uninstall is unavailable, leave explicit residue, emit the uninstall/recovery steps, and enter `failed_cleanup`

- **wrapper/launcher instrumentation**
  - revert the exact wrapper/launch-command/env deltas introduced for the investigation
  - if a wrapper script or launcher file was edited, restore from restore point or generated revert patch

- **temporary source patch instrumentation**
  - remove only the temporary instrumentation hunks/markers added for the investigation
  - if a durable fix overlaps the same file/hunk, PM must preserve the durable fix lane while stripping the temporary instrumentation lane
  - if PM cannot separate the two safely, it must stop and require explicit recovery/review rather than silently dropping one

- **debugger/profiler attach instrumentation**
  - detach the temporary attach/profiler session
  - if detach fails but no durable workspace mutation remains, keep the failure localized to the runtime/session state and do not pretend cleanup succeeded

Shared rules:
- cleanup state is tracked per instrumentation lane, not just per investigation
- any residual item that survives cleanup must be listed in `cleanup_summary.residual_items[]`

### 6.2) Durable-fix vs temporary-debug mutations

Debug Mode must keep at least three mutation classes distinct:
- **temporary instrumentation**
- **temporary environment/tooling changes**
- **durable fix**

The user and runtime need to know:
- what is expected to be removed automatically
- what is expected to remain as the actual fix
- what failed to revert or clean up

This distinction should flow into artifacts, diff presentation, and recovery behavior.

### 6.3) Restore-point expectations

Before invasive instrumentation or temporary dependency/tooling changes, PM should create or update a **restore point** sufficient to revert the investigation’s temporary state if cleanup fails. Existing artifact support for `runtime_artifact.restore_point` is a natural anchor for this.

### 6.4) Automated verification and cleanup

Debug Mode should try to verify and clean up automatically:
- re-run the same browser scenario / test / command / attach flow after applying the fix
- compare the post-fix result against the failure criterion
- if verification succeeds, remove temporary instrumentation immediately
- if verification fails, either escalate the evidence strategy or explicitly stop with remaining instrumentation state surfaced
- if cleanup fails, enter `failed_cleanup` rather than pretending success

### 6.4.1) Interruption, cancel, and disconnect semantics

Interruption rules when temporary mutations are active:
- **user cancels investigation**
  - transition immediately to `cleaning_up`
  - if cleanup succeeds, final state = `cancelled`
  - if cleanup fails or residue remains, final state = `failed_cleanup`

- **investigation is superseded by another owner**
  - older investigation transitions to `cleaning_up`
  - if cleanup succeeds, final state = `superseded`
  - if cleanup fails or residue remains, final state = `failed_cleanup`

- **PM/agent process crash or app restart while temporary mutations may still be active**
  - on restore, reopen as `attention_required` unless cleanup can resume immediately and deterministically
  - before any new mutation-capable step, PM must either resume cleanup, roll back to restore point, or explicitly convert surviving temporary mutations into the durable fix lane

- **browser/runtime/SSH disconnect while temporary mutations are active**
  - if the owning target can be revalidated, resume cleanup or the investigation under the same `investigation_id`
  - if the owning target cannot currently be revalidated, enter `attention_required` with `session_reconnect_required`
  - after cleanup retries are exhausted, unresolved residue becomes `failed_cleanup`

### 6.4.2) Verification heuristics by adapter

Common rules for all adapters:
- every investigation should capture an **original failure signature** before trying the durable fix
- verification should compare against the original failure signature plus the target’s expected healthy signal; absence of the old error alone is not sufficient when the target also has a positive success criterion
- verification should prefer rerunning the exact failing path before exploring nearby alternatives
- every verification step should classify itself as `verification_strength = strong | weak`
- PM should auto-resolve only on **strong** verification; weak verification should land in `attention_required`, not silent success

**Dev-session adapter**
- primary verification action:
  - rerun the exact failing command/test/process when available; otherwise rerun the nearest canonical runner for that target
- pass when:
  - exit code / process status matches the expected healthy state
  - original failure signature is absent from bounded stdout/stderr/log summaries
  - Problems/diagnostic summaries do not show the same blocking error class
  - if the target is a server, the expected port/health check responds
- fail when:
  - the same failure signature recurs
  - the process crashes, hangs past timeout, or the expected health signal never appears
- degrade to `attention_required` when:
  - no canonical rerun command exists
  - the failure depends on local hardware/device/manual interaction
  - the environment is too flaky to classify automatically

**Browser adapter**
- primary verification action:
  - rerun the same named-action scenario in the active isolated automation session, unless the failure was caused by corrupted state and a fresh isolated session is required
- pass when:
  - the original symptom is absent
  - the prior failing assertion/selector/text/network signature is absent
  - no new severe console/network regressions appear above baseline
- fail when:
  - the same assertion timeout or user-visible symptom recurs
  - a new blocking modal/challenge stops the flow
  - browser runtime recovery leaves the target unavailable
- degrade to `attention_required` when:
  - auth handoff, CAPTCHA, media permissions, device prompts, or manual one-off repro is required

**Agent-session adapter**
- primary verification action:
  - rerun the minimal failing prompt/tool path with the same bounded inputs or replay the failed attempt path when available
- pass when:
  - the prior `failure_class`, `blocked_reason_code`, or tool error signature does not recur
  - the agent reaches the expected terminal state for that run
- fail when:
  - the same tool/runtime/provider failure recurs
  - the rerun produces the same blocked episode without new recovery signal
- degrade to `attention_required` when:
  - the run needs new human clarification or approval to proceed

**DAP adapter**
- primary verification action:
  - rerun the scenario with the same breakpoint/watch plan when the fix needs debugger confirmation; otherwise rerun the user-visible scenario without requiring the debugger to remain attached
- pass when:
  - the original stopped-location / stack / watched-value invariant is no longer violated
  - the user-visible symptom is also gone
- fail when:
  - the same failing stack shape, variable invariant, or crash path returns
- degrade to `attention_required` when:
  - debugger attach becomes unavailable
  - the target requires manual debugger steering that PM does not own in MVP

**Imported-bundle adapter**
- primary verification action:
  - none by default unless the imported bundle is later bound to a live workspace-backed or runtime-backed target
- pass when:
  - PM successfully binds the bundle to a live target and that live target passes the relevant adapter verification rules
- analysis-only complete when:
  - the imported bundle validates
  - PM derives a stable failure fingerprint and bounded root-cause hypothesis
  - the result is explicitly labeled diagnostic-only rather than verified fixed
- fail when:
  - imported evidence contradicts the proposed fix or a bound live rerun disproves it
- degrade to `attention_required` when:
  - no live target exists and PM can only produce a manual verification plan

Recommended extra field:
- `heuristic_version = debug_verify.v1` so future tuning can evolve without making older exported investigation bundles ambiguous

### 6.4.3) Cleanup guarantee default

Recommended MVP cleanup default:
- **automatic strip/cleanup is the normal path**
- PM should not require a user-approved cleanup patch series for ordinary temporary instrumentation removal
- PM should not require sandbox worktree/jail semantics for MVP; instead it should use the canonical workspace/remote project plus safe points, restore points, and explicit temporary-vs-durable mutation lineage

Required cleanup behavior:
- create/update a safe point before the first invasive temporary mutation
- create a user-visible restore point before temporary source or durable environment/tooling changes
- after a successful fix verification, remove temporary instrumentation immediately
- run a lightweight post-cleanup verification to make sure the cleanup itself did not re-break the scenario
- if cleanup fails, emit explicit residual state: affected files, active tooling/config leftovers, and the recommended recovery action
- provide at least one deterministic recovery path: retry cleanup, restore point rollback, or review/apply generated revert patch

Important nuance:
- if the user intentionally wants to keep a temporary mutation, PM must convert it into the **durable fix lane** instead of silently leaving it mislabeled as temporary instrumentation

### 6.5) Canonical reconciliation payload (not remaining design gaps)

The following items are **already resolved above** and must be translated into canonical docs during reconciliation:
- Assistant mode-strip and Debug overlay model
- `investigation_id` / live Investigation Context schema and lifecycle
- target discovery, auto-selection, and workspace-binding rules
- auto-ingestion / visible Investigation Context contract for evidence
- per-scope instrumentation cleanup and rollback semantics
- Debug-specific enums and bundle-record placement in canonical event/storage docs
- target-discovery heuristics and adapter selection defaults
- file-by-file canonical doc changes for Assistant chat, Run Modes, Permissions, Runtime Artifacts, Section 15, and Final GUI copy

### 7) Implementation-ready acceptance criteria for reconciliation

- user can start an investigation by **pointing PM at a target** rather than only at a crate/file
- PM chooses an adapter based on target kind and surfaces the active adapter explicitly
- browser-backed investigations use **`automation_session`** and preserve canonical browser identity and artifact routing
- dev/test/process investigations correlate through **`dev_session_id`** and reveal the linked Output / Problems / Ports surfaces instead of inventing shadow output stores
- assistant/session inspection can show a bounded chronological trace of what the agent did and attach/export that trace without conflating it with app-runtime debugging
- evidence artifacts are grouped under one investigation concept and remain visible/revocable to the user
- requested vs effective capability/permission differences are disclosed on the owning surfaces
- Debug Mode can drive browser/dev-session/assistant-trace/DAP-backed workflows without restricting those tools to Debug Mode only
- Debug Mode causes the agent to actively prefer evidence-producing debug flows first, while still allowing the broader shared toolset when needed
- if temporary instrumentation is used, PM discloses it, verifies it, and either removes it cleanly or leaves an explicit rollback/recovery state
- target binding is deterministic; PM either auto-selects a single highest-precedence target or enters `attention_required` rather than guessing
- interruption/cancel/disconnect behavior with active temporary mutations is explicit and does not leave residue as a silent side effect
- cross-investigation ownership prevents concurrent overlapping mutation-capable debug loops against the same target
- machine-readable `stop_reason_code`, `attention_required_reason_code`, and `budget_kind` are persisted and surfaced
- auto-resolution requires `verification_strength = strong`; weak verification cannot silently produce success
- post-cleanup verification is required before PM can claim a clean resolved state after temporary instrumentation

### 7.1) Reconciliation checklist by file

This is the minimum file-by-file checklist the reconciliation pass should cover.

- **`Plans/assistant-chat-design.md`**
  - add `Debug` to the primary Assistant mode model and compact labels
  - define `requested_mode_overlay` / `effective_mode_overlay` semantics for Debug Mode
  - define `/mode debug`
  - define thread resume / restore behavior for Debug investigations
  - add the visible Investigation Context / live bundle surface contract
  - clarify that Debug Mode is execution-capable and evidence-first

- **`Plans/Run_Modes.md`**
  - explicitly keep runtime modes closed to `ask | plan | regular | yolo`
  - describe Debug Mode as a workflow overlay, not a new runtime enum
  - define the recommended default runtime/execution model as `Debug Mode + regular + HTE`
  - describe optional `Debug Mode + yolo` as an advanced opt-in, not the default

- **`Plans/Permissions_System.md`**
  - add the Debug Automation Profile concept as a run-scoped permission overlay/profile
  - list the action families that auto-run under that profile
  - list the explicit-confirmation / non-bypassable actions that remain blocked
  - clarify that blocked Debug episodes reuse the normal blocked-action approval path

- **`Plans/storage-plan.md`**
  - add `investigation_id` as a cross-surface grouping key
  - add `instrumentation_id` and instrumentation lifecycle persistence
  - persist links from investigations to `run_id`, `thread_id`, `dev_session_id`, `browser_session_id`, DAP identity, and relevant artifact IDs
  - persist Debug Mode overlay state sufficiently for restore/reopen UX

- **`Plans/Runtime_Artifacts_Panel.md`**
  - define investigation grouping/filtering by `investigation_id`
  - define how existing artifact families participate in Debug investigations
  - add cleanup/restore/instrumentation visibility requirements
  - define export/import bundle expectations for investigations

- **`Plans/Section15_MVP_Promoted_Features_Spec.md`**
  - anchor browser-backed Debug investigations on visible `automation_session`
  - define the Debug-specific visible auto-ingestion contract without violating normal browser capture rules
  - define auth handoff / `attention_required` behavior for browser-backed investigations
  - keep takeover/promote flows consistent with existing browser session-class rules

- **`Plans/UI_Command_Catalog.md`**
  - add `/mode debug`
  - add or reconcile any Investigation Context, export, or recovery commands if command-surface exposure is needed
  - ensure command semantics reflect visible attach/revoke behavior rather than hidden injection

- **`Plans/FinalGUISpec.md`**
  - add Debug Mode to Assistant mode IA
  - add a visible Investigation Context / investigation status card/panel
  - rename or qualify classical DAP “Debug” copy to `Debugger` / `DAP Debugger` where needed
  - remove or reconcile stale browser architecture wording that conflicts with Section 15

- **`Plans/Tools.md` / `Plans/newtools.md`**
  - document debug-capable tool groups/tags in the shared registry
  - clarify that the same tools remain reusable by non-Debug surfaces
  - document target discovery, evidence capture, instrumentation, verification, and bundle-export roles

- **`Plans/feature-list.md` and downstream summaries**
  - present Debug Mode as the assistant-led automated investigation workflow
  - separately describe the classical Debugger/DAP surface to avoid collapsing them together

### 7.2) Suggested canonical wording anchors

These are candidate wording anchors reconciliation can reuse to keep terminology aligned.

- **Assistant chat**
  - `Debug Mode is an Assistant workflow overlay that starts a visible, evidence-first investigation against a chosen target.`
- **Run Modes**
  - `Debug Mode does not add a new runtime enum; it overlays the existing runtime posture and defaults to regular + HTE.`
- **Permissions**
  - `When a Debug investigation starts, Puppet Master applies a run-scoped Debug Automation Profile to the active permission snapshot.`
- **Section 15 / browser**
  - `In Debug Mode, bounded evidence from the active automation_session may auto-enter the visible Investigation Context without changing the normal explicit capture rules outside Debug Mode.`
- **Artifacts/storage**
  - `Debug investigations group existing runtime artifacts under investigation_id; they do not create a parallel artifact system.`

## Impacted Docs

- `Plans/FileManager.md` (presets, run/debug dependencies — touchpoint when reconciling).
- **`Plans/Section15_MVP_Promoted_Features_Spec.md` §3.18** — SSOT for **built-in browser** named actions, session classes, DevTools, capture.
- **`Plans/rewrite-tie-in-memo.md`**, **`Plans/FinalGUISpec.md`** (reconcile stale bottom-panel / `wry` wording vs CEF/editor-tab canon).
- **`Plans/UI_Command_Catalog.md`**, **`Plans/storage-plan.md`**, **`Plans/assistant-chat-design.md`**, **`Plans/Permissions_System.md`**, **`Plans/newtools.md`**, **`Plans/Runtime_Artifacts_Panel.md`**, **`Plans/feature-list.md`**.
- Shard mirrors under `Plans/_shards/{FileManager,FinalGUISpec,assistant-chat-design,storage-plan,newtools,...}/**` echo the same themes.
- Downstream: any plan sections covering **dev sessions**, **terminal/output surfaces**, **tool permissions**, **remote MVP** (if debug spans remote).
- **Do not hand-edit** `Plans/_shards/**` from this research thread; reconciliation should route through normal plan updates.

## Decisions Already Resolved

- Work item **`w-20260320-164907`** created for this topic; research may read repo **targeted** (no broad sweep unless requested).
- **Product direction (from user):** prioritize **Cursor-like debugging of user-chosen targets** (app, site, …), and **also** want **Copilot-style “give the agent info”** (attach structured context to chat), not pick one exclusively.
- **Built-in browser:** user confirms PM can use **agents to control the built-in browser** as part of the **debug / repro** story (not deferred to generic external automation only).
- **Repo-verified constraint:** debug must fit PM’s existing **runtime-mode + workflow-overlay** model; it should not assume a new execution-posture enum unless broader mode architecture changes.
- **Repo-verified constraint:** debug tooling should reuse PM’s **central tool registry** and **runtime-artifact pipeline** rather than creating a chat-only shadow stack.
- **Repo-verified constraint:** any debug evidence auto-feed must avoid contradicting the existing **no hidden browser-to-chat injection** rule; it needs a dedicated visible attach/bundle contract if introduced.
- **User direction:** the umbrella mode should be called **Debug** across these related features; Debug mode is a **nudge** toward using the debug-capable tools and flows, not an exclusive permission gate.
- **User direction:** **all agents** should have access to the same debug-capable tools under the shared registry/permission model and may use them whenever relevant.
- **User direction:** **temporary instrumentation is in MVP**, provided it ships with explicit cleanup/rollback requirements.
- **Refinement from user:** call it **Debug Mode** explicitly, and treat it as stronger than a nudge — an **evidence-first default posture** that should proactively use the debug-capable tools and flows without limiting the agent to only those tools.
- **Further clarification from user:** Debug Mode is an **explicit choice in the Assistant chat window alongside the other chat modes**; when chosen, the assistant and/or its subagents should debug the problem using the shared toolchain, while those same tools remain usable by other PM agents such as Orchestrator outside Debug Mode.
- **Recommended MVP remote scope:** support both local projects and PM-managed remote-mode projects that already run files/git/terminal/agents/providers on the remote host; do not promise arbitrary ad-hoc remote attach or silent local fallback.
- **Recommended MVP cleanup contract:** automatic cleanup is the default, safe point + restore point are required before invasive temporary mutations, and failed cleanup remains a first-class explicit outcome instead of hidden residue.
- **Recommended evidence policy:** live investigation bundles are summary-first, bounded, and redacted by default; raw artifacts stay in the runtime-artifact pipeline and user-supplied external evidence remains explicit.
- **Recommended browser handoff model:** use explicit pause/resume inside an isolated automation session with `attention_required` for auth/manual-repro boundaries; do not support chaotic concurrent mixed steering as the MVP co-pilot model.
- **Web-validated direction:** current agent-debugging and browser-automation guidance aligns with PM favoring redacted summary packs, bounded evidence windows, isolated session handoff, resume/audit trails, and least-privilege browser takeover rather than raw dump attachment or broad shared-session control.
- **Recommended detail defaults:** initial budgets, stop-reason codes, attention-required reason codes, export bundle schema, export size limits, and adapter-specific verification heuristics are now specified for MVP packetization.
- **Final audit result:** no remaining implementation-blocking product/architecture gaps remain in this ledger; downstream work is canonical-doc reconciliation plus optional tuning/future enhancements.

## Non-blocking follow-ons / future tuning

- Future tuning after prototyping: whether initial numeric defaults need relaxing/tightening once real investigations are exercised.
- Future enhancement: richer arbitrary-URL-to-workspace binding UX beyond the deterministic MVP binding rules above.
- Future expansion beyond the MVP handoff model: richer co-piloting, collaborative browser steering, or broader remote parity once the default pause/resume model proves stable.

## Packetization Notes

- When packetizing, bind `run_id` to `run_prefix` + seq; keep this ledger updated for compaction survival — still not canonical for Spec/plan text.
- Carry forward: **Cursor Debug Mode = hypothesis + instrument + repro + collect + fix + cleanup** so packetize doesn’t collapse it into “add a debugger panel.”
- Carry forward: user wants **target picker** (“point at app/site/…”) as the **entry**, not only “debug this Rust crate.”
- Carry forward: PM already has a strong **browser/debug substrate**, **central tool registry**, and **runtime-artifact pipeline**; reconciliation should build on those instead of inventing a second stack.
- Carry forward: **Debug** is the umbrella workflow name even though PM also has a classical debugger surface; reconciliation needs copy/IA that keeps those understandable without changing the user’s chosen umbrella naming.
- Carry forward: prefer the explicit label **Debug Mode** in prose/UI planning where that helps distinguish the umbrella workflow from the classical debugger surface.
- Carry forward: temporary instrumentation is **in MVP only with an explicit contract**; packetization should preserve the cleanup/rollback requirements and not reduce this to “agent can freely add logs.”
- Carry forward: Debug-capable tools remain **cross-surface platform capabilities**, but **Debug Mode** itself is a **specific Assistant chat mode entrypoint** and needs explicit chat-mode reconciliation.
- Carry forward: fully automated Debug Mode means **agent-driven repro, evidence capture, verification, and cleanup by default**; manual repro/attach should be fallback, not the primary story.
- Carry forward: remote Debug Mode should honor PM’s existing **remote-mode project authority model** rather than inventing ad-hoc remote attach semantics or silently falling back to local execution.
- Carry forward: evidence bundles should stay **summary-first, bounded, and redacted**, with raw artifacts living in the shared runtime-artifact system and remaining user-visible/revocable.
- Carry forward: MVP browser handoff should be **pause/resume in an isolated automation session**, not simultaneous mixed human+agent control.

## Do-Not-Forget Details

- Preserve **non-citation** rule for this ledger in downstream stages.
- If implementing **instrumentation**, plan for **secrets in logs**, **PII**, and **diff fatigue** — use allowlisted log shapes or structured fields rather than free-form dump capture.
- Contrast **user-visible “debug mode”** (agent mode) with **developer logging level** `debug` to avoid terminology collisions in plans and UI.
- Competitors often **do not** replicate Cursor’s **app instrumentation + extension log sink**; they **combine** test loops, explain-error, assistant telemetry, or **external** observability — position PM clearly vs those axes.
- **Built-in browser** is a **differentiator** for **web/debug**: plan reconciliation should tie **debug targets**, **agent browser tools**, and **attach-to-chat** payloads into one coherent story.
- PM already has a rule that **normal browser capture is visible and explicit**; any debug-evidence auto-feed that bypasses manual chip capture must be intentionally specified as a separate mechanism.
- PM already has **Debug/classical debugger** language in core GUI docs; because the user still wants **Debug** as the umbrella mode, reconciliation must handle the copy and IA carefully instead of pretending the collision does not exist.
- `dev_session_id` should remain the first candidate correlation key for process/test/dev-server debug; `terminal_session_id` remains for exact shell continuity; `browser_session_id` / `session_class` remain for web/debug evidence.
- Do not describe Debug Mode as merely a gentle hint; it is an explicit evidence-first workflow posture with stronger default tool-selection expectations.
- Do not accidentally narrow debug-capable tools to Assistant-only; the user explicitly wants them reusable by other PM agents, with Debug Mode serving as the Assistant chat-specific workflow choice.
- Do not fall back into a Cursor-style mandatory human repro loop in planning language; PM’s target direction is automated repro/verify first.

## Reconciliation Coverage Pass (2026-03-23)

### Raw coverage ledger

- Considered **30 non-derived planning docs** across these clusters:
  - primary feature-owner docs for chat/runtime/permissions/storage/browser/artifacts/tools/UI
  - contract/prompt/command docs where new IDs, overlays, attachments, or slash-command semantics can drift
  - cross-surface/runtime docs for remote authority, shared agents/subagents, cleanup/recovery, and wiring
  - summary/index/terminology docs that can remain misleading even after owner-doc updates
- Highest drift-risk seams:
  - **Debug Mode vs runtime modes** (`debug` must not become a fifth runtime enum)
  - **Debug Mode vs Debugger vs Debug Console** naming collisions
  - **visible Investigation Context** vs existing **no hidden browser capture injection** rules
  - new **requested/effective** overlay + **investigation_id / instrumentation_id** identity/state fields across storage/contracts/prompt
  - **remote MVP** rules vs PM’s existing remote authority/no-local-fallback contract
  - **shared debug-capable tools** across Assistant/Orchestrator/Interview vs Debug Mode as an Assistant-only entrypoint

### Final three-bucket register

#### MUST CHANGE

- `Plans/assistant-chat-design.md`
- `Plans/Run_Modes.md`
- `Plans/Permissions_System.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/FinalGUISpec.md`
- `Plans/Tools.md`
- `Plans/newtools.md`
- `Plans/feature-list.md`
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/GitHub_Integration.md`

Why these are MUST CHANGE:
- they directly own the new Debug Mode contract, or
- they directly own new canonical fields/IDs/attachment semantics/remote rules that packetization must update, or
- leaving them untouched would preserve stale canonical wording rather than merely omit an adjacent example

#### MUST RECONCILE

- `Plans/Commands_System.md`
- `Plans/Glossary.md`
- `Plans/FileManager.md`
- `Plans/human-in-the-loop.md`
- `Plans/Architecture_Invariants.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/interview-subagent-integration.md`
- `Plans/Wiring_Matrix.md`
- `Plans/rewrite-tie-in-memo.md`
- `Plans/00-plans-index.md`
- `Plans/MiscPlan.md`

Why these are MUST RECONCILE:
- they are not the primary feature-owner docs, but they own terminology, command collisions, cleanup/recovery expectations, cross-surface agent behavior, or owner/consumer routing that will drift if the packet updates only the obvious feature docs

#### MUST VERIFY

- `Plans/Executor_Protocol.md`
- `Plans/Decision_Policy.md`
- `Plans/Progression_Gates.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Orchestrator_Page.md`
- `Plans/LSPSupport.md`
- `Plans/assistant-memory-subsystem.md`
- `Plans/Models_System.md`

Why these are MUST VERIFY:
- they are likely overlap surfaces for blocked-vs-attention semantics, safe-point/restore language, evidence/export terminology, DAP/LSP/debugger wording, or model/memory budget assumptions
- they may not need direct edits, but packetization should not emit until they are checked for contradictory canon

### Same-file supersession / stale-canon reminders

- **`Plans/FinalGUISpec.md`**
  - retire or rewrite classical bottom-panel **`Debug`** naming where it means the DAP surface; the user-facing label there must reconcile to **`Debugger` / `DAP Debugger`**
  - retire stale bottom-panel / `wry` browser wording that conflicts with Section 15 browser canon
- **`Plans/assistant-chat-design.md`**
  - keep **Debug Mode**, **Debug Console**, and **Debugger** explicitly distinct inside the same file; do not let old “debug console” wording absorb the new mode
- **`Plans/storage-plan.md`**
  - reconcile any existing browser-context capture persistence wording so Debug auto-ingestion remains **visible, bounded, and revocable**, not silent capture
- **`Plans/Permissions_System.md`**
  - distinguish **run-scoped Debug Automation Profile** from existing global/static permission profiles; do not append it in a way that implies a new global profile family
- **`Plans/Section15_MVP_Promoted_Features_Spec.md`**
  - clarify that Debug investigation auto-ingestion is a **separate visible contract**, not an exception that weakens the normal explicit browser-capture rule

### Packetization defect warnings

- If the packet only follows the earlier minimum checklist and omits **`Plans/Contracts_V0.md`**, **`Plans/Prompt_Pipeline.md`**, or **`Plans/GitHub_Integration.md`**, canon will drift on persisted fields, prompt assembly, and remote Debug scope even if the primary UI/runtime docs are updated.
- If the packet omits **`Plans/Commands_System.md`**, **`Plans/Glossary.md`**, or **`Plans/Wiring_Matrix.md`**, the shipped canon will still drift on slash-command semantics, terminology, and command-routing coverage.
- If the packet omits **`Plans/00-plans-index.md`**, future agents will have an outdated owner/consumer map for the reconciled Debug packet.

### Derived / regen-only checks

- `Plans/_shards/**` remain **regen-only** after canonical doc edits; do not hand-edit them during packetization.
- Any cross-plan generated mirrors or coverage exports that reflect the updated owner docs should be regenerated only after the canonical packet lands.
