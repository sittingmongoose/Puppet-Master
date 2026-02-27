## 5. Design Overview

- **Where it happens:** Interview flow, primarily **Architecture & Technology** (to detect GUI stack) and **Testing & Verification** (to choose tools and coverage). Optionally use **Product/UX** phase for GUI type (web vs native).
- **Data flow:**
  1. During or after Architecture (and optionally UX), derive **GUI type** and **framework** (e.g. web, Iced, Dioxus, Qt, Flutter, Tauri, Electron).
  2. **Lookup** framework in a **single source of truth** (see §6) to get: existing tools (with names, install/setup, capabilities), and whether a custom headless tool is typically needed.
  3. In Testing phase (or a dedicated "GUI testing tools" step), **present options** to the user: existing tools, custom headless tool plan, or both.
  4. **Persist** user choices in interview state and config (e.g. "use_playwright", "use_framework_tools", "plan_custom_headless_tool", "selected_framework_tools").  
     ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring
  5. On interview completion, **write into plans/PRD and test strategy:**
     - Tasks to **obtain/set up** existing tools when selected.
     - Tasks to **plan or build** the custom headless tool when selected (with requirement: headless navigation + full debug log after test runs).
     - **Testing instructions** that tell agents to use Playwright (web), selected framework tools, and/or the custom tool for smoke and GUI tests; reference debug log location and format where applicable.

---

