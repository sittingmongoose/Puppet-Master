# Working Ledger

## Work Item

- **work_id:** `w-20260320-164907`
- **run_prefix:** `r-20260320-164907` (for future packetize runs; `run_id` is null until packetized)

## Mode

- `research`

## Topic / Scope

- Investigate a **debug mode analogous to Cursor’s**: fast loop from failure → structured context (logs, stacks, locations) → assisted diagnosis/edits, without turning this ledger into a product spec.
- Framed for **Puppet Master rewrite / planning** work (exact product surface TBD by research).
- **User intent (refined in chat):** user **points PM at a debug target** — e.g. **local app, dev server, website,** or other runnable surface — and expects a **Cursor-like** loop (hypotheses → evidence from that target → fix in workspace). **Also** wants **Copilot-style** affordances to **feed the chat agent structured info** (session/telemetry snapshot attach), including for **PM’s own** agent run when that helps.

## Objective

- Clarify what “Cursor-like” means for this project: **tight feedback loop**, **agent-assisted** interpretation, **grounding** failures to file/line or stable IDs.
- Identify plausible implementation **shapes** and **tradeoffs** (safety, noise, local vs remote) before reconciliation/packetize.

## Constraints / Non-Goals

- Ledger is **execution memory only** — not canonical, not cited in planning docs.
- Research mode: **no edits to** `Plans/*.md` planning documents from this thread; steward/packetize stages own those updates.
- Do not treat this file as a draft planning document.

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
  - Derived storage-plan shards mention **JSONL mirror** and **`logsearch` / “why did this fail”** style retrieval — **possible** alignment for a future “debug/diagnostics” retrieval plane (treat as hint until reconciled into hand-authored plans).
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

## Gaps / Problems Identified

- **Primary failure domain** still unknown: Rust tests, long-running agent/daemon, Tauri/UI, integration tests, provider round-trips, etc.
- **Operator model** unclear: human-first (read + assist) vs agent-first (drives reruns and instrumentation).
- **Environment constraints** unknown: sandbox-only, no arbitrary shell, CI-only, etc.
- **Parity target unclear:** match Cursor’s **instrumentation + repro + cleanup** loop vs lighter **“structured failure bundle”** (test output + stack + file refs) without auto-instrumentation.
- **Naming collision in market:** many vendors say **“debug”** for **AI-session introspection** (Copilot) or **support diagnostics** (Windsurf) — easy to build the wrong feature if PM copies a label without the **dual-plane** distinction (**app under debug** vs **assistant under debug**).
- **Debug target taxonomy** not specified: **local process**, **URL + browser**, **mobile**, **remote env**, **no repo** — each needs different **evidence adapters** and **permission** stories.

## Candidate Fixes / Design Directions

- **A — Cursor-parity “instrumentation loop”:** policy + UI for temporary logs, local sink, explicit “repro now” handoff, cleanup pass. *Pros:* strong for heisenbugs. *Cons:* highest trust/safety/review surface; needs clear diff visibility and rollback.
- **B — Test/build-first debug:** structured `cargo test` / build failure objects, maps to paths, optional verbosity. *Pros:* narrow, auditable, no code mutation. *Cons:* weak for runtime-only failures.
- **C — Process / session debug:** correlate by `dev_session_id` / trace id, tail allowed channels, link to Output/Problems. *Pros:* matches workbench/session model. *Cons:* needs clear retention and redaction rules.
- **D — Replay capsule:** bounded event + config snapshot for repro. *Pros:* great for CI/support. *Cons:* privacy, storage, determinism hard problems.
- **E — “Copilot-style” assistant introspection plane:** chronological **agent** event log, flow chart, OTLP export, attach snapshot to chat — **complements** A–D; does not replace app runtime evidence.
- **F — Observability-first bridge (Devin-class):** MCP or read-only connectors to **APM/logs/metrics** for production-like failures — different trust model than local probes.
- **G — Research-grade:** DAP/session tools + **perturbation** in debugger (InspectCoder direction) or **execution trace → LLM** (snooper-style) — high novelty, higher implementation risk.
- **H — Debug target registry + adapters:** user picks **target** (launch config, URL, attach PID, etc.); PM routes to **collector** (log sink, **built-in browser session** + agent tools, DAP) — unifies “point at X” UX.
- **Recommendation (revised after user clarification):** treat **H + A** as the **Cursor-shaped core** for **in-workspace** runnable code; treat **PM built-in browser + agent control** as the **default path** for **web/targeted-URL** repro and evidence alongside **E (attach to chat)**; add **E** as **cross-cutting** (runtime bundle + optional **PM agent introspection**) so the model always gets **auditable context** — not only printf evidence.

## Impacted Docs

- `Plans/FileManager.md` (presets, run/debug dependencies — likely touchpoint when reconciling).
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

## Open Questions / Uncertainties

- Top pain: **tests**, **daemon**, **desktop shell**, **LLM/tool pipeline**, or **mix**?
- Should PM ship **instrumentation** (mutates project temporarily) or stay **read-only diagnostics** until a policy gate exists?
- **Cleanup guarantees:** automatic strip vs user-approved patch series vs sandbox worktree only?
- **Remote:** debug mode **local workspace only** for MVP vs must work with deferred remote run/debug?
- Naming for users: **Debug mode** vs **Diagnostics** vs **Investigate** (permissions and trust differ).
- Should PM intentionally ship **two surfaces**: (1) **debug/fix the user’s app** and (2) **inspect the assistant run** (Copilot-style), or merge metaphors? *(User leans **both**; UX merge vs separate panels still open.)*
- For **website** debugging: is MVP **workspace-owned** frontend/backend only, or **arbitrary URL** (third-party) with limited capture?
- **Attach payloads:** max size, redaction, and whether **user** vs **agent** can attach without confirmation.
- **Browser in debug mode:** when **user** drives repro vs **agent** drives built-in browser (co-piloting, approval gates, domain allowlists); what evidence is **auto-attached** vs **on demand**.

## Packetization Notes

- When packetizing, bind `run_id` to `run_prefix` + seq; keep this ledger updated for compaction survival — still not canonical for Spec/plan text.
- Carry forward: **Cursor Debug Mode = hypothesis + instrument + repro + collect + fix + cleanup** so packetize doesn’t collapse it into “add a debugger panel.”
- Carry forward: user wants **target picker** (“point at app/site/…”) as the **entry**, not only “debug this Rust crate.”

## Do-Not-Forget Details

- Preserve **non-citation** rule for this ledger in downstream stages.
- If implementing **instrumentation**, plan for **secrets in logs**, **PII**, and **diff fatigue** — likely need allowlisted log shapes or structured fields.
- Contrast **user-visible “debug mode”** (agent mode) with **developer logging level** `debug` to avoid terminology collisions in plans and UI.
- Competitors often **do not** replicate Cursor’s **app instrumentation + extension log sink**; they **combine** test loops, explain-error, assistant telemetry, or **external** observability — position PM clearly vs those axes.
- **Built-in browser** is a **differentiator** for **web/debug**: plan reconciliation should tie **debug targets**, **agent browser tools**, and **attach-to-chat** payloads into one story where possible.
