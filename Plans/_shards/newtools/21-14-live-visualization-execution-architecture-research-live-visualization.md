## 14. Live Visualization Execution Architecture (research-live-visualization)

This section defines the deterministic architecture for **non-headless visual execution** so users can watch automation in real time across web, desktop, iOS, and Android while preserving the same evidence contract from §13.

### 14.1 End-to-end flow: tool selection → launch → interaction → evidence capture → chat display

**Unified orchestrator flow (all platforms):**
1. **Select provider/tool profile** from interview + detected stack:
   - `web.playwright.visible`
   - `desktop.appium.windows` / `desktop.appium.mac2`
   - `ios.appium.xcuitest.simulator` (optional `ios.xcode.preview`)
   - `android.appium.uiautomator2.emulator`
2. **Preflight checks** run (see §14.2). If any hard dependency fails, degrade per §14.3.
3. **Launch visible target** and emit `live.session.started` with:
   - `run_id`, `platform`, `provider`, `pid/session_id`, `display_target`, `artifact_root`
4. **Execute interactions** through scenario/action catalog (same contract as headless; only backend driver differs).
5. **Capture evidence in parallel** (timeline + screenshots + optional recording/trace) into `.puppet-master/evidence/gui-automation/<run_id>/`.
6. **Stream progress to chat** with low-latency status cards:
   - current step, pass/fail, latest thumbnail, "open live window/simulator/emulator" hints.
7. **Finalize run** with `manifest.json`, `summary.md`, `checks.json`, then emit `live.session.completed`.
8. **Render evidence in chat** using §13 media rules (inline image/video + deterministic fallback links).

**Platform-specific launch contracts:**

- **Web apps (local browser run/attach):**
  - Primary: Playwright headed run (`npx playwright test --headed`) for visible browser execution.[LV1]
  - Attach mode: connect to an existing local Chromium endpoint (CDP) when user wants to watch an already-open browser/profile.
  - Evidence: Playwright screenshots/video/trace config mapped into §13 manifest fields.[LV1]

- **Desktop apps (native launch + visible state capture):**
  - Windows: Appium Windows Driver with `appium:app` (launch) or `appium:appTopLevelWindow` (attach existing window).[LV4]
  - macOS: Appium `mac2` driver (`appium driver install mac2`) for native visible automation.[LV3]
  - Evidence: `GET /screenshot` each checkpoint + optional recording pipeline when driver/plugin supports it.[LV3]

- **iOS (Xcode previews and/or simulator runs):**
  - Preview mode: Xcode previews for rapid visual iteration of UI states (non-automation viewing mode).[LV6]
  - Automation mode: Appium XCUITest simulator session (`platformName=iOS`, `automationName=XCUITest`, `deviceName`, `platformVersion`).[LV5]
  - Evidence: `mobile: startXCTestScreenRecording` / `stopXCTestScreenRecording` + screenshots; simulator cleanup semantics preserved.[LV5]

- **Android (emulator-driven runs):**
  - Launch emulator with deterministic AVD profile (`appium:avd`, launch/ready timeouts), then run UiAutomator2 session.[LV7]
  - Optional direct emulator lifecycle via Android emulator CLI for boot/teardown control.[LV8]
  - Evidence: screenshot + MediaProjection recording (`mobile: startMediaProjectionRecording` / stop) into run artifacts.[LV7]

### 14.2 Runtime dependencies and environment checks

Add Doctor preflight category: **`doctor.live_visualization`**.

**Required checks (deterministic):**
- **Common**
  - Node/npm available (for JS-based providers and MCP servers).
  - Writable evidence path `.puppet-master/evidence/gui-automation/`.
  - Display availability check (`DISPLAY`/Wayland on Linux, desktop session on macOS/Windows) unless provider supports virtual displays.
- **Web**
  - Playwright installed and browser binaries present.
  - Target dev server reachable (health URL or configured port).
- **Desktop**
  - Appium server reachable.
  - Windows mode: WinAppDriver present/reachable.
  - macOS mode: `appium driver list --installed` includes `mac2`.[LV3]
- **iOS**
  - Xcode CLI tools installed (`xcode-select -p`), simulator runtime exists.
  - Appium XCUITest driver installed; WebDriverAgent build prerequisites pass.
  - If preview mode selected, Xcode previews capability present in local toolchain.[LV6]
- **Android**
  - Android SDK + emulator + adb available.
  - Requested AVD exists and boots within timeout.
  - UiAutomator2 driver installed; device/emulator visible to adb.

**Preflight output contract:** emit machine-readable failures:
`{ code, severity, dependency, expected, observed, remediation }`.

### 14.3 Coexistence with headless mode (default/CI fallback policy)

Policy:
- **Default local policy:** `visual_mode = auto`.
  - Prefer visible mode when interactive desktop session is available.
  - Fall back to headless if a required visual dependency is missing.
- **CI default policy:** `visual_mode = headless` unless explicitly overridden.
  - Rationale: deterministic CI stability and no hard display dependency.
- **Manual override:**
  - `visual_mode = forced_visible` → fail fast if visible prerequisites missing.
  - `visual_mode = forced_headless` → skip all visible launch steps.

**Required run metadata fields:**
- `requested_visual_mode` (`auto|forced_visible|forced_headless`)
- `effective_visual_mode` (`visible|headless`)
- `fallback_reason` (nullable string enum, e.g., `missing_display`, `simulator_unavailable`, `emulator_boot_timeout`)

### 14.4 Deterministic additions required in this plan file

Implementation MUST add the following concrete schema/config entries:
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#config-wiring, ContractName:Plans/Contracts_V0.md#EventRecord

1. **`InterviewGuiConfig` + `InterviewOrchestratorConfig` fields**
   - `live_visualization_enabled: bool`
   - `visual_mode: "auto" | "forced_visible" | "forced_headless"`
   - `visual_targets: { web?: bool, desktop?: bool, ios?: "preview"|"simulator"|"both", android?: bool }`
2. **`GuiToolCatalog` capability flags**
   - `supports_visible_run`, `supports_attach_existing`, `supports_recording`, `requires_display_server`.
3. **Test strategy schema extension (additive)**
   - `test_type` include `visual_web`, `visual_desktop`, `visual_ios`, `visual_android`.
   - optional `visual_launch_command`, `attach_command`, `evidence_capture_mode`.
4. **Seglog events**
   - `live.session.started`, `live.step.updated`, `live.artifact.created`, `live.session.completed`, `live.session.degraded`.
5. **Doctor checks**
   - `doctor.live_visualization` (platform dependency checks)
   - `doctor.live_visualization.evidence` (media + manifest integrity reuse from §13)
6. **Chat renderer contract**
   - New card type `live_run_card` (status, current step, latest thumbnail, open-target action).
   - Must resolve to artifact links using `manifest.json` IDs only (no raw path guessing).

---

