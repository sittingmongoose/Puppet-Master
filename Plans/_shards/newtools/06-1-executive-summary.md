## 1. Executive Summary

Today, the interviewer can generate **Playwright** requirements and wire them into the test strategy so agents run E2E tests. Playwright only applies to **web-based GUIs**. Many projects use native or framework-specific GUIs (e.g. Iced, Dioxus, Qt, Electron, Tauri). For those:

- There may be **existing tools** (e.g. Dioxus hot reload + web preview, Iced headless runner, framework-specific test utilities) that the interviewer should **discover and offer**.
- When no suitable tool exists, the interviewer should offer to **plan or build a custom headless GUI tool** that allows headless navigation and produces a **full debug log** after tests, so agents can run smoke tests and interpret results.

This plan adds:

1. **Discovery:** During the interview (especially Architecture and Testing phases), detect GUI stack and search a **single source of truth** for framework-specific tools (existing tools, docs, hot reload, headless options).
2. **User choice:** Present options to the user (use existing tools, plan to build custom tool, or both).
3. **Plan and test strategy:** Write into the generated plans/PRD and test strategy: get existing tools (if chosen), and/or plan to build the custom tool; then integrate tool usage into testing instructions so agents use them during execution.

Result: **More thorough and deeper testing** across web and non-web projects, with agents using the right tools per framework and a consistent path for custom headless + debug logging when needed.

**Success criteria (how we know the plan succeeded):** (1) When a non-web GUI framework is detected, the interview offers framework tools and the custom headless option from the catalog. (2) User choices are persisted and drive test strategy and PRD/plan content (tasks + instructions). (3) Agents receive test strategy that includes framework tools and/or custom headless instructions and evidence paths. (4) When the user chose custom headless, a Doctor check can verify the tool exists and runs (conditional on that choice). (5) MCP (e.g. Context7) is configurable for all supported providers via GUI and applied at run time. (6) Existing Playwright-only flow and existing test strategy behavior remain unchanged when no new options are selected (no regression).

---

