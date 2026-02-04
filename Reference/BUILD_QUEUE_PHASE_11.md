# RWM Puppet Master — BUILD_QUEUE_PHASE_11.md

> Phase 11: Consolidated Issue Remediation (from problems1–4)  
> Date compiled: 2026-01-26  
> Source docs: `problems1.md`, `problems2.md`, `problems3.md`, `problems4.md`  
> Scope: **No fixes applied** — this phase file is a work queue.

---

## Phase Overview

This phase consolidates outstanding issues and risks discovered by multiple reviewers into a single, prioritized build queue. It focuses on:

1. **GUI security correctness** (auth + CORS) — currently failing tests and likely unsafe defaults
2. **React GUI reachability & correctness** (is it default? do API contracts match?)
3. **Doc/spec drift** (GUI_SPEC vs implemented routes; build queue docs out of sync)
4. **Verification quality** (missing evidence artifacts, coverage claims, flaky/hanging tests)

### Current known evidence

- Root test suite currently has at least one failure:
  - `src/gui/gui.integration.test.ts` auth test fails: expected 401, got 200 (see problems1.md and reproduced by running the focused test).
- React GUI build output directory **does not exist** in repo by default:
  - `src/gui/react/dist/` not present until `npm run gui:build` runs.
- React GUI is **not enabled by default**:
  - `GuiServer` config defaults `useReactGui: false`.
  - `puppet-master gui` (CLI) does not pass `useReactGui`.

---

## Parallel Groups

| Group | Focus | Tasks | Can Start After |
|------:|-------|-------|-----------------|
| A | GUI Security (Auth + CORS) | PH11-T01..T05 | Immediately |
| B | React GUI Wiring & API Contracts | PH11-T06..T11 | After A1/A2 recommended |
| C | GUI Spec/Doc Drift | PH11-T12..T16 | Immediately |
| D | Verification/Evidence Quality | PH11-T17..T20 | Immediately |

---

## Task Status Log

| Task | Status | Date | Summary |
|------|--------|------|---------|
| PH11-T01 | ⏳ PENDING | | Fix GUI auth enforcement for API routes (P0-G07) |
| PH11-T02 | ⏳ PENDING | | Ensure GUI startup path initializes auth (P0-G07) |
| PH11-T03 | ⏳ PENDING | | Reconcile CORS policy with “secure by default” acceptance criteria (P0-G07) |
| PH11-T04 | ⏳ PENDING | | Add documented dev escape hatch (e.g., --no-auth and/or relaxed CORS) |
| PH11-T05 | ⏳ PENDING | | Add/repair tests that prove auth + CORS behave as intended |
| PH11-T06 | ⏳ PENDING | | Decide React GUI default strategy (flag/config) and document it |
| PH11-T07 | ⏳ PENDING | | Fix React GUI controls endpoint contract mismatches |
| PH11-T08 | ⏳ PENDING | | Fix React GUI projects endpoint contract mismatches |
| PH11-T09 | ⏳ PENDING | | Fix React GUI config endpoint contract mismatches |
| PH11-T10 | ⏳ PENDING | | Fix React GUI tiers endpoint contract mismatches |
| PH11-T11 | ⏳ PENDING | | Add a minimal “React GUI smoke test” that hits real server endpoints |
| PH11-T12 | ⏳ PENDING | | Resolve GUI_SPEC vs implemented route inventory mismatch |
| PH11-T13 | ⏳ PENDING | | Resolve PH-GUI-T07 Select component status (implement vs skip) |
| PH11-T14 | ⏳ PENDING | | Fix BUILD_QUEUE_PHASE_GUI.md issue-mapping table inconsistencies |
| PH11-T15 | ⏳ PENDING | | Validate Sidebar “SKIPPED” decision with legacy parity evidence |
| PH11-T16 | ⏳ PENDING | | Reconcile icons stack (Lucide in spec vs inline/custom) |
| PH11-T17 | ⏳ PENDING | | Verify/record coverage evidence for React GUI (>80% claim) |
| PH11-T18 | ⏳ PENDING | | Add/record screenshot parity evidence (required by GUI phase) |
| PH11-T19 | ✅ PASS | 2026-02-02 | Added deterministic doctor registry + fast capability probing to prevent GUI/E2E test timeouts |
| PH11-T20 | ⏳ PENDING | | Reconcile BUILD_QUEUE_GAPS.md summary vs per-issue sections |
| PH11-T21 | ✅ PASS | 2026-02-04 | Fix Windows native module rebuild validation, block GUI launch until ready, auto-create config on first boot, dedupe wizard errors |
| GUI e.map hardening | ✅ PASS | 2026-01-27 | Fixed `e.map is not a function`: hardened API (`getTiers`, `listProjects`, `getDoctorChecks`, `runDoctorChecks`) and all GUI pages (Projects, Tiers, Doctor, History, Evidence, Coverage, Metrics, Dashboard). `.map`/`Object.entries` guarded with `Array.isArray` / array fallbacks. Deleted `.test-cache`/`.test-quota` (none found). `npm run gui:typecheck` and React GUI unit tests pass. |
| GUI e.map hardening round 2 | ✅ PASS | 2026-01-27 | Projects: `projectsToShow` + `safeList` guards; malformed `listProjects` unit tests (null, undefined, `{}`, `{ projects: null }`). UsageChart: `safeData` guard, empty handling. API `listProjects` JSDoc. Audited Doctor, Tiers, Evidence, Coverage, Metrics, Dashboard — already guarded. Root `npm run typecheck` PASS. `.test-cache`/`.test-quota` not present. |

### Task status log (PH11-T19)
Status: PASS  
Date: 2026-02-02  
Summary of changes: Added a mock doctor registry for GUI integration tests and fast-fail capability probing for multi-platform E2E tests to eliminate timeouts; wired the registry factory into GUI server routes and updated tests to use test mode probing.  
Files changed:  
- src/gui/test-helpers/mock-doctor-registry.ts  
- src/gui/gui.integration.test.ts  
- src/gui/routes/doctor.ts  
- src/gui/server.ts  
- src/platforms/capability-discovery.ts  
- tests/e2e/multi-platform.test.ts  
Commands run + results:  
- npm test -- --run tests/e2e/multi-platform.test.ts: PASS  
- npm test -- --run src/gui/gui.integration.test.ts: PASS  
- npm run typecheck: PASS  
- npm run gui:build: PASS  
If FAIL: N/A  

---

### Task status log (PH11-T21)
Status: PASS  
Date: 2026-02-04  
Summary of changes: Hardened Windows installer native module rebuild with retries and hard failure when better-sqlite3 is missing; blocked GUI launch until /health is ready to prevent first-launch blank screens; auto-created default config.yaml on first boot or corrupt config; deduped wizard error messages on retry.  
Files changed:  
- installer/win/puppet-master.nsi  
- scripts/build-installer.ts  
- src/cli/commands/gui.ts  
- src/config/config-manager.ts  
- src/config/config-manager.test.ts  
- src/gui/routes/config.ts  
- src/gui/routes/platforms.ts  
- src/gui/react/src/components/wizard/PlatformSetupWizard.tsx  
Commands run + results:  
- npm test -- --run src/config/config-manager.test.ts: PASS  
- npm run lint: PASS  
- npm run typecheck: PASS  
- npm run build: PASS  
If FAIL: N/A  

---

## Group A — GUI Security (Auth + CORS)

### PH11-T01: Fix GUI auth enforcement for API routes (P0-G07)

**Problem:** Auth is enabled by default (`authEnabled ?? true`) but API routes are currently not protected.

**Evidence:**
- Failing test (reproduced):
  - `src/gui/gui.integration.test.ts` expects `/api/status` to return `401` without auth; observed `200`.
  - Failure snippet:
    - `expected 401 "Unauthorized", got 200 "OK"` at `src/gui/gui.integration.test.ts:316`.
- Likely root cause: auth middleware only installed when `initializeAuth()` is called; normal startup paths do not call it.

**Files to inspect/modify:**
- `src/gui/server.ts`
- `src/gui/gui.integration.test.ts`

**Acceptance criteria:**
- [ ] With auth enabled, requests to protected `/api/*` endpoints return `401` without valid auth
- [ ] With auth enabled, requests succeed when auth header/token is provided
- [ ] Integration test(s) pass

**Tests to run:**
```bash
npx vitest run --config vitest.config.ts src/gui/gui.integration.test.ts -t "Auth initialization" --no-file-parallelism
```

---

### PH11-T02: Ensure GUI startup path initializes auth (P0-G07)

**Problem:** Auth initialization is not wired into normal entrypoints.

**Evidence:**
- `src/gui/start-gui.ts` creates `GuiServer` and calls `start()` without `initializeAuth()`.
- `src/cli/commands/gui.ts` creates `GuiServer` and calls `start()` without `initializeAuth()`.

**Files to inspect/modify:**
- `src/gui/start-gui.ts`
- `src/cli/commands/gui.ts`

**Acceptance criteria:**
- [ ] Default GUI startup path initializes auth when `authEnabled` is true
- [ ] Startup displays where to find token / how to authenticate (existing token path output acceptable)

---

### PH11-T03: Reconcile CORS policy with “secure by default” acceptance criteria (P0-G07)

**Problem:** CORS allows broad dev ports and LAN IPs.

**Evidence:** `src/gui/server.ts` CORS logic allows:
- any origin on ports `3000–9999` (`devPortPattern`)
- LAN ranges (`192.168.*`, `10.*`, `172.16–31.*`)

**Acceptance criteria (from gaps docs):**
- [ ] Restrict CORS to localhost only by default (or clearly make configurable)

---

### PH11-T04: Add documented dev escape hatch (e.g., --no-auth and/or relaxed CORS)

**Problem:** Review notes call for a development flag (and/or config) to disable auth or relax CORS safely.

**Acceptance criteria:**
- [ ] There is a documented and explicit way to run GUI in dev mode (local-only)
- [ ] Default remains secure

---

### PH11-T05: Add/repair tests that prove auth + CORS behave as intended

**Acceptance criteria:**
- [ ] Tests cover: auth ON blocks unauth; auth OFF allows; CORS default rules match documentation

---

## Group B — React GUI Wiring & API Contracts

### PH11-T06: Decide React GUI default strategy (flag/config) and document it

**Problem:** React GUI exists but is not the default or reachable in normal usage.

**Evidence:**
- `GuiServer` defaults `useReactGui: false`.
- `puppet-master gui` passes `{ port, host, baseDirectory }` only.
- React build artifacts are not present unless built (`src/gui/react/dist` not in repo).

**Acceptance criteria:**
- [ ] There is a clear, documented way to launch React GUI (flag/env/config)
- [ ] Document whether vanilla GUI remains supported and when

---

### PH11-T07: Fix React GUI controls endpoint contract mismatches

**Problem:** React client calls `/api/control/*`; server exposes `/api/controls/*`.

**Evidence:**
- React: `src/gui/react/src/lib/api.ts` uses `/api/control/start|pause|...|kill`
- Server: `src/gui/routes/controls.ts` uses `/controls/start|pause|...|kill-spawn` mounted under `/api`.

**Acceptance criteria:**
- [ ] React controls actions work against the real server without special proxies/adapters

---

### PH11-T08: Fix React GUI projects endpoint contract mismatches

**Problem:** Response shape mismatch.

**Evidence:**
- Server `GET /api/projects` returns `{ projects }` (`src/gui/routes/projects.ts`).
- React `listProjects()` expects `Project[]` directly.

**Acceptance criteria:**
- [ ] React Projects page loads data from real server without runtime errors

---

### PH11-T09: Fix React GUI config endpoint contract mismatches

**Evidence:**
- Server `GET /api/config` returns `{ config }` (`src/gui/routes/config.ts`).
- React `getConfig()` expects `Config` directly.

---

### PH11-T10: Fix React GUI tiers endpoint contract mismatches

**Evidence:**
- Server `GET /api/tiers` returns `{ root, metadata }` (`src/gui/routes/state.ts`).
- React `getTiers()` expects `TierItem[]` directly.

---

### PH11-T11: Add a minimal “React GUI smoke test” that hits real server endpoints

**Goal:** Prevent a repeat where React tests pass but real integration fails.

**Acceptance criteria:**
- [ ] A test starts the real `GuiServer` and exercises at least: projects, config, controls (mock orchestrator), tiers

---

## Group C — GUI Spec/Doc Drift

### PH11-T12: Resolve GUI_SPEC vs implemented route inventory mismatch

**Problem:** GUI_SPEC screen inventory includes `/start`, `/phases`, `/logs`, `/capabilities`, `/budgets`, `/memory`.

**Evidence:**
- React routes currently include `/wizard` and omit the above (see `src/gui/react/src/routes.tsx`).

**Acceptance criteria:**
- [ ] Decide whether GUI_SPEC is authoritative or outdated
- [ ] Align either implementation or spec (and update phase docs accordingly)

---

### PH11-T13: Resolve PH-GUI-T07 Select component status (implement vs skip)

**Problem:** Phase doc shows PENDING; implementation uses native `<select>` in multiple pages.

**Acceptance criteria:**
- [ ] Either implement Select component + migrate usages OR mark task skipped with justification

---

### PH11-T14: Fix BUILD_QUEUE_PHASE_GUI.md issue-mapping table inconsistencies

**Problem:** Issue tracker mapping shows PENDING items despite PASS tasks.

**Acceptance criteria:**
- [ ] Mapping table reflects current truth (PASS/PENDING/SKIPPED)

---

### PH11-T15: Validate Sidebar “SKIPPED” decision with legacy parity evidence

**Problem:** Skipping sidebar may break parity; needs explicit justification.

**Acceptance criteria:**
- [ ] Confirm legacy GUI does not require sidebar or provide alternate nav parity evidence

---

### PH11-T16: Reconcile icons stack (Lucide in spec vs inline/custom)

**Problem:** GUI_SPEC lists Lucide React, but `src/gui/react/package.json` has no `lucide-react`.

**Acceptance criteria:**
- [ ] Decide whether to add Lucide or update spec to “inline SVG only” (as phase doc currently suggests)

---

## Group D — Verification/Evidence Quality

### PH11-T17: Verify/record coverage evidence for React GUI (>80% claim)

**Problem:** Docs claim >80% coverage / 353 tests, but phase file doesn’t reference concrete coverage artifacts.

**Acceptance criteria:**
- [ ] `npm --prefix src/gui/react test:coverage` produces a report and its numbers are recorded

---

### PH11-T18: Add/record screenshot parity evidence (required by GUI phase)

**Problem:** Phase requires screenshot comparison; no evidence referenced.

**Status:** 📝 Evidence location and naming convention documented

**Evidence Location:**
- Screenshots should be stored in `.puppet-master/evidence/screenshots/`
- Subdirectories: `vanilla-gui/` and `react-gui/` for comparison
- Further subdirectories: `light/` and `dark/` for theme variants

**Naming Convention:**
- Format: `{page-name}-{theme}.png` (e.g., `dashboard-light.png`, `projects-dark.png`)
- Key pages to capture: `/`, `/projects`, `/wizard`, `/config`, `/tiers`, `/evidence`, `/doctor`, `/settings`, `/history`, `/metrics`, `/coverage`

**Acceptance criteria:**
- [x] Evidence location and naming convention documented
- [ ] Screenshots exist for key pages in light/dark (manual capture required)

---

### PH11-T19: Investigate/harden against hanging GUI test runs

**Problem:** Reported that `npm test` may hang due to lingering vitest processes.

**Acceptance criteria:**
- [ ] Identify root cause (open handles, servers not closed, etc.)
- [ ] Make test runs reliably terminate

---

### PH11-T20: Reconcile BUILD_QUEUE_GAPS.md summary vs per-issue sections

**Problem:** Document inconsistency: summary says “fixed/verified” while body checklists and headers disagree.

**Acceptance criteria:**
- [ ] Summary table, section headers, and acceptance checklist states are consistent
- [ ] High-risk items (esp. P0-G07) reflect reality

---

## Notes / Key Cross-Cutting Risks

### React GUI is currently likely non-functional against real server
Based on direct code inspection:
- Controls: `/api/control/*` vs `/api/controls/*` mismatch
- Projects: `{ projects }` wrapper mismatch
- Config: `{ config }` wrapper mismatch
- Tiers: `{ root, metadata }` mismatch

This strongly suggests the React GUI may “look complete” but fail at runtime when wired to the real Express server.

### Express middleware ordering
Per Express docs, middleware execution is in definition order; auth middleware must be registered before protected routes. (See Context7 Express docs: middleware order matters; `app.use()` before route handlers is the standard pattern.)

### React Router future flags
React Router v6 warns about enabling v7 future flags; Context7 notes these can be enabled via the `future` prop on `BrowserRouter`.

---

## Commands (reference)

- Root tests:
```bash
npm test
```
- Focused auth test:
```bash
npx vitest run --config vitest.config.ts src/gui/gui.integration.test.ts -t "Auth initialization" --no-file-parallelism
```
- React GUI build:
```bash
npm run gui:build
```
- React GUI tests:
```bash
npm --prefix src/gui/react test
```

---

<ralph>COMPLETE</ralph>
