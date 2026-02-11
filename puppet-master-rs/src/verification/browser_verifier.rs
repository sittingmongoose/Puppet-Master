//! Browser Verifier
//!
//! Browser-based verification via Playwright (Node.js) spawned as a subprocess.
//! Generates a temporary Playwright script (CommonJS) and parses structured JSON output.

use crate::state::EvidenceStore;
use crate::types::{Criterion, Evidence, EvidenceType, Verifier, VerifierResult};
use anyhow::{Context, Result};
use async_trait::async_trait;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::Duration;
use tokio::process::Command;

struct TempDirGuard {
    path: PathBuf,
}

impl TempDirGuard {
    fn new(prefix: &str) -> Result<Self> {
        let path = std::env::temp_dir().join(format!("{}-{}", prefix, uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&path)
            .with_context(|| format!("Failed to create temp dir {}", path.display()))?;
        Ok(Self { path })
    }

    fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for TempDirGuard {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.path);
    }
}

/// Browser-based verifier powered by Playwright.
pub struct BrowserVerifier {
    config: BrowserVerifierConfig,
}

/// Configuration for browser verifier.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserVerifierConfig {
    /// URL to navigate to.
    pub url: String,
    /// CSS selectors to check.
    #[serde(default)]
    pub selectors: Vec<String>,
    /// Expected content on the page (substring match against full page text).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_content: Option<String>,
    /// Whether to take screenshots on failure.
    pub screenshot_on_failure: bool,
    /// Whether to capture a Playwright trace on failure.
    #[serde(default = "default_true")]
    pub trace_on_failure: bool,
    /// Whether to record console output (saved on failure).
    #[serde(default = "default_true")]
    pub record_console: bool,
    /// Whether to record network events (saved on failure).
    #[serde(default = "default_true")]
    pub record_network: bool,
    /// Max number of network events to keep (request/response combined).
    #[serde(default = "default_max_network_events")]
    pub max_network_events: usize,
    /// Browser to use (chromium, firefox, webkit).
    pub browser: BrowserType,
    /// Run headless.
    #[serde(default = "default_true")]
    pub headless: bool,
    /// Timeout in milliseconds.
    pub timeout_ms: u64,
    /// Viewport width.
    pub viewport_width: u32,
    /// Viewport height.
    pub viewport_height: u32,
    /// Optional explicit steps (advanced usage).
    #[serde(default)]
    pub steps: Vec<BrowserStep>,
}

fn default_true() -> bool {
    true
}

fn default_max_network_events() -> usize {
    200
}

/// Browser type for testing.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum BrowserType {
    /// Chromium browser.
    Chromium,
    /// Firefox browser.
    Firefox,
    /// WebKit browser (Safari).
    Webkit,
}

impl std::fmt::Display for BrowserType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Chromium => write!(f, "Chromium"),
            Self::Firefox => write!(f, "Firefox"),
            Self::Webkit => write!(f, "WebKit"),
        }
    }
}

/// A single browser step (optional; you can also rely on selectors/expected_content).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserStep {
    #[serde(flatten)]
    pub action: BrowserAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum BrowserAction {
    Navigate {
        url: String,
        #[serde(default)]
        wait_until: Option<String>,
    },
    WaitFor {
        selector: String,
        #[serde(default)]
        state: Option<String>,
        #[serde(default)]
        timeout_ms: Option<u64>,
    },
    AssertVisible { selector: String },
    AssertText {
        selector: String,
        text: String,
        #[serde(default)]
        exact: bool,
    },
    Click { selector: String },
    Fill { selector: String, value: String },
    Select { selector: String, value: String },
    Hover { selector: String },
}

impl Default for BrowserVerifierConfig {
    fn default() -> Self {
        Self {
            url: "http://localhost:3000".to_string(),
            selectors: Vec::new(),
            expected_content: None,
            screenshot_on_failure: true,
            trace_on_failure: true,
            record_console: true,
            record_network: true,
            max_network_events: default_max_network_events(),
            browser: BrowserType::Chromium,
            headless: true,
            timeout_ms: 30_000,
            viewport_width: 1280,
            viewport_height: 720,
            steps: Vec::new(),
        }
    }
}

impl BrowserVerifier {
    /// Create a new browser verifier with default configuration.
    pub fn new() -> Self {
        Self {
            config: BrowserVerifierConfig::default(),
        }
    }

    /// Create a new browser verifier with custom configuration.
    pub fn with_config(config: BrowserVerifierConfig) -> Self {
        Self { config }
    }

    fn repo_root_from_cwd(cwd: &Path) -> PathBuf {
        if cwd.file_name().is_some_and(|n| n == "puppet-master-rs") {
            cwd.parent().unwrap_or(cwd).to_path_buf()
        } else {
            cwd.to_path_buf()
        }
    }

    fn evidence_base_dir(repo_root: &Path) -> PathBuf {
        repo_root.join(".puppet-master").join("evidence")
    }

    fn build_request(&self, criterion: &Criterion, artifact_dir: &Path) -> BrowserScriptRequest {
        let mut expected_content = self.config.expected_content.clone();
        if expected_content.is_none() {
            // If criterion.expected isn't JSON, treat it as expected_content.
            if let Some(expected) = criterion.expected.as_deref() {
                if !expected.trim().starts_with('{') {
                    expected_content = Some(expected.to_string());
                }
            }
        }

        let mut req = BrowserScriptRequest {
            url: self.config.url.clone(),
            selectors: self.config.selectors.clone(),
            expected_content,
            screenshot_on_failure: self.config.screenshot_on_failure,
            trace_on_failure: self.config.trace_on_failure,
            record_console: self.config.record_console,
            record_network: self.config.record_network,
            max_network_events: self.config.max_network_events,
            browser: self.config.browser,
            headless: self.config.headless,
            timeout_ms: self.config.timeout_ms,
            viewport_width: self.config.viewport_width,
            viewport_height: self.config.viewport_height,
            steps: self.config.steps.clone(),
            artifact_dir: artifact_dir.to_string_lossy().to_string(),
        };

        // If criterion.expected is JSON, allow overriding config.
        if let Some(expected) = criterion.expected.as_deref() {
            let trimmed = expected.trim();
            if trimmed.starts_with('{') {
                if let Ok(ovr) = serde_json::from_str::<BrowserScriptRequestOverride>(trimmed) {
                    if let Some(url) = ovr.url {
                        req.url = url;
                    }
                    if let Some(selectors) = ovr.selectors {
                        req.selectors = selectors;
                    }
                    if let Some(expected_content) = ovr.expected_content {
                        req.expected_content = Some(expected_content);
                    }
                    if let Some(v) = ovr.screenshot_on_failure {
                        req.screenshot_on_failure = v;
                    }
                    if let Some(v) = ovr.trace_on_failure {
                        req.trace_on_failure = v;
                    }
                    if let Some(v) = ovr.record_console {
                        req.record_console = v;
                    }
                    if let Some(v) = ovr.record_network {
                        req.record_network = v;
                    }
                    if let Some(v) = ovr.max_network_events {
                        req.max_network_events = v;
                    }
                    if let Some(v) = ovr.browser {
                        req.browser = v;
                    }
                    if let Some(v) = ovr.headless {
                        req.headless = v;
                    }
                    if let Some(v) = ovr.timeout_ms {
                        req.timeout_ms = v;
                    }
                    if let Some(v) = ovr.viewport_width {
                        req.viewport_width = v;
                    }
                    if let Some(v) = ovr.viewport_height {
                        req.viewport_height = v;
                    }
                    if let Some(v) = ovr.steps {
                        req.steps = v;
                    }
                }
            }
        }

        req
    }

    async fn verify_async(&self, criterion: &Criterion) -> Result<VerifierResult> {
        let cwd = std::env::current_dir().context("Failed to get current directory")?;
        let repo_root = Self::repo_root_from_cwd(&cwd);

        let temp_dir = TempDirGuard::new("puppet-master-playwright")
            .context("Failed to create temp dir for Playwright")?;
        let artifact_dir = temp_dir.path().join("artifacts");
        std::fs::create_dir_all(&artifact_dir)
            .with_context(|| format!("Failed to create artifact dir {}", artifact_dir.display()))?;

        let script_path = temp_dir.path().join("run-playwright.cjs");
        std::fs::write(&script_path, PLAYWRIGHT_SCRIPT)
            .with_context(|| format!("Failed to write script {}", script_path.display()))?;

        let request = self.build_request(criterion, &artifact_dir);
        let request_path = temp_dir.path().join("request.json");
        std::fs::write(&request_path, serde_json::to_vec_pretty(&request)?)
            .with_context(|| format!("Failed to write request {}", request_path.display()))?;

        let mut cmd = Command::new("node");
        cmd.arg(&script_path).arg(&request_path);
        cmd.current_dir(&repo_root);
        cmd.stdout(std::process::Stdio::piped());
        cmd.stderr(std::process::Stdio::piped());

        let timeout = Duration::from_millis(request.timeout_ms.saturating_add(10_000));
        let output = run_with_timeout(cmd, timeout).await?;

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();

        let script_result = parse_script_output(&stdout)
            .with_context(|| format!("Invalid Playwright JSON output. stderr={stderr}"))?;

        let session_id = format!("browser_{}", Utc::now().format("%Y%m%d_%H%M%S"));
        let store = EvidenceStore::new(Self::evidence_base_dir(&repo_root))
            .context("Failed to initialize EvidenceStore")?;

        // Always store the JSON report from the script.
        let mut report_meta = HashMap::new();
        report_meta.insert("criterion_id".to_string(), criterion.id.clone());
        report_meta.insert("url".to_string(), request.url.clone());
        report_meta.insert("browser".to_string(), request.browser.to_string());
        report_meta.insert("passed".to_string(), script_result.passed.to_string());
        if !stderr.trim().is_empty() {
            report_meta.insert("stderr".to_string(), stderr.clone());
        }

        let report_evidence = store
            .store_evidence(
                &criterion.id,
                &session_id,
                EvidenceType::TestResult,
                serde_json::to_vec_pretty(&script_result)?.as_slice(),
                report_meta,
            )
            .context("Failed to store Playwright JSON report")?;

        // Optionally store artifacts on failure.
        let mut evidence_metadata = report_evidence.metadata.clone();
        evidence_metadata.insert(
            "report_path".to_string(),
            report_evidence.path.display().to_string(),
        );

        if !script_result.passed {
            if let Some(artifacts) = &script_result.artifacts {
                if let Some(p) = artifacts.screenshot.as_deref() {
                    if let Ok(bytes) = std::fs::read(p) {
                        let ev = store.store_evidence(
                            &criterion.id,
                            &session_id,
                            EvidenceType::Image,
                            &bytes,
                            HashMap::from([(String::from("kind"), String::from("screenshot"))]),
                        )?;
                        evidence_metadata.insert(
                            "screenshot_path".to_string(),
                            ev.path.display().to_string(),
                        );
                    }
                }

                if let Some(p) = artifacts.trace.as_deref() {
                    if let Ok(bytes) = std::fs::read(p) {
                        let ev = store.store_evidence(
                            &criterion.id,
                            &session_id,
                            EvidenceType::File,
                            &bytes,
                            HashMap::from([(String::from("kind"), String::from("trace"))]),
                        )?;
                        evidence_metadata.insert(
                            "trace_path".to_string(),
                            ev.path.display().to_string(),
                        );
                    }
                }

                if let Some(p) = artifacts.console.as_deref() {
                    if let Ok(bytes) = std::fs::read(p) {
                        let ev = store.store_evidence(
                            &criterion.id,
                            &session_id,
                            EvidenceType::CommandOutput,
                            &bytes,
                            HashMap::from([(String::from("kind"), String::from("console"))]),
                        )?;
                        evidence_metadata.insert(
                            "console_path".to_string(),
                            ev.path.display().to_string(),
                        );
                    }
                }

                if let Some(p) = artifacts.network.as_deref() {
                    if let Ok(bytes) = std::fs::read(p) {
                        let ev = store.store_evidence(
                            &criterion.id,
                            &session_id,
                            EvidenceType::CommandOutput,
                            &bytes,
                            HashMap::from([(String::from("kind"), String::from("network"))]),
                        )?;
                        evidence_metadata.insert(
                            "network_path".to_string(),
                            ev.path.display().to_string(),
                        );
                    }
                }
            }
        }

        let evidence = Evidence {
            evidence_type: "browser_verification".to_string(),
            path: report_evidence.path.clone(),
            timestamp: Utc::now(),
            description: Some(format!(
                "Browser verification via Playwright (passed={})",
                script_result.passed
            )),
            metadata: evidence_metadata,
        };

        Ok(VerifierResult {
            passed: script_result.passed,
            message: script_result.message,
            evidence: Some(evidence),
            timestamp: Utc::now(),
        })
    }
}

impl Default for BrowserVerifier {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Verifier for BrowserVerifier {
    fn verifier_type(&self) -> &str {
        "browser"
    }

    async fn verify(&self, criterion: &Criterion) -> VerifierResult {
        match self.verify_async(criterion).await {
            Ok(result) => result,
            Err(e) => VerifierResult::failure(format!("Browser verification error: {e:#}")),
        }
    }
}

/// Request payload passed to the Playwright script.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BrowserScriptRequest {
    pub url: String,
    #[serde(default)]
    pub selectors: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expected_content: Option<String>,
    pub screenshot_on_failure: bool,
    pub trace_on_failure: bool,
    pub record_console: bool,
    pub record_network: bool,
    pub max_network_events: usize,
    pub browser: BrowserType,
    pub headless: bool,
    pub timeout_ms: u64,
    pub viewport_width: u32,
    pub viewport_height: u32,
    #[serde(default)]
    pub steps: Vec<BrowserStep>,
    pub artifact_dir: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BrowserScriptRequestOverride {
    #[serde(default)]
    pub url: Option<String>,
    #[serde(default)]
    pub selectors: Option<Vec<String>>,
    #[serde(default)]
    pub expected_content: Option<String>,
    #[serde(default)]
    pub screenshot_on_failure: Option<bool>,
    #[serde(default)]
    pub trace_on_failure: Option<bool>,
    #[serde(default)]
    pub record_console: Option<bool>,
    #[serde(default)]
    pub record_network: Option<bool>,
    #[serde(default)]
    pub max_network_events: Option<usize>,
    #[serde(default)]
    pub browser: Option<BrowserType>,
    #[serde(default)]
    pub headless: Option<bool>,
    #[serde(default)]
    pub timeout_ms: Option<u64>,
    #[serde(default)]
    pub viewport_width: Option<u32>,
    #[serde(default)]
    pub viewport_height: Option<u32>,
    #[serde(default)]
    pub steps: Option<Vec<BrowserStep>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BrowserScriptResult {
    pub passed: bool,
    pub message: String,
    #[serde(default)]
    pub artifacts: Option<BrowserArtifacts>,
    #[serde(default)]
    pub error: Option<BrowserScriptError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BrowserArtifacts {
    #[serde(default)]
    pub screenshot: Option<String>,
    #[serde(default)]
    pub trace: Option<String>,
    #[serde(default)]
    pub console: Option<String>,
    #[serde(default)]
    pub network: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct BrowserScriptError {
    #[serde(default)]
    pub name: Option<String>,
    #[serde(default)]
    pub message: Option<String>,
    #[serde(default)]
    pub stack: Option<String>,
}

fn parse_script_output(stdout: &str) -> Result<BrowserScriptResult> {
    // The script is expected to emit JSON (and only JSON) to stdout. Be tolerant of extra lines.
    let candidate = stdout
        .lines()
        .rev()
        .find(|l| !l.trim().is_empty())
        .unwrap_or("");
    serde_json::from_str(candidate).context("Failed to parse Playwright JSON")
}

async fn run_with_timeout(mut cmd: Command, timeout: Duration) -> Result<std::process::Output> {
    let mut child = cmd.spawn().context("Failed to spawn Playwright node process")?;
    let pid = child.id();

    let output = tokio::time::timeout(timeout, child.wait_with_output()).await;
    match output {
        Ok(res) => Ok(res.context("Failed to wait for Playwright node process")?),
        Err(_) => {
            if let Some(pid) = pid {
                kill_process(pid);
            }
            Err(anyhow::anyhow!(
                "Playwright verification timed out after {:?}",
                timeout
            ))
        }
    }
}

#[cfg(unix)]
fn kill_process(pid: u32) {
    use nix::sys::signal::{kill, Signal};
    use nix::unistd::Pid;

    let _ = kill(Pid::from_raw(pid as i32), Signal::SIGKILL);
}

#[cfg(not(unix))]
fn kill_process(_pid: u32) {}

const PLAYWRIGHT_SCRIPT: &str = r#"/* eslint-disable */
// Generated by Rust BrowserVerifier (CommonJS to avoid ESM/package.json interactions).

const fs = require('fs');
const path = require('path');

function safeJson(value) {
  try { return JSON.stringify(value, null, 2); } catch { return 'null'; }
}

function serializeError(err) {
  if (!err) return null;
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
}

async function main() {
  const requestPath = process.argv[2];
  if (!requestPath) {
    return { passed: false, message: 'Missing request.json path', error: { message: 'missing_arg' } };
  }

  let req;
  try {
    req = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
  } catch (e) {
    return { passed: false, message: 'Failed to read request.json', error: serializeError(e) };
  }

  let playwright;
  try {
    playwright = require('playwright');
  } catch (e) {
    return { passed: false, message: 'Playwright module not available. Run: npm i && npx playwright install', error: serializeError(e) };
  }

  const browserName = req.browser || 'chromium';
  const browserType = browserName === 'firefox' ? playwright.firefox : browserName === 'webkit' ? playwright.webkit : playwright.chromium;

  const artifacts = {
    screenshot: path.join(req.artifactDir, 'failure.png'),
    trace: path.join(req.artifactDir, 'trace.zip'),
    console: path.join(req.artifactDir, 'console.json'),
    network: path.join(req.artifactDir, 'network.json'),
  };

  fs.mkdirSync(req.artifactDir, { recursive: true });

  let browser;
  let context;
  let page;

  const consoleEvents = [];
  const pageErrors = [];
  const networkEvents = [];

  function pushNetwork(evt) {
    if (!req.recordNetwork) return;
    if (networkEvents.length >= (req.maxNetworkEvents || 200)) return;
    networkEvents.push(evt);
  }

  try {
    browser = await browserType.launch({ headless: req.headless !== false });
    context = await browser.newContext({
      viewport: { width: req.viewportWidth || 1280, height: req.viewportHeight || 720 },
    });

    if (req.traceOnFailure) {
      await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    }

    page = await context.newPage();

    if (req.recordConsole) {
      page.on('console', (msg) => {
        consoleEvents.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
        });
      });
      page.on('pageerror', (err) => {
        pageErrors.push({ message: String(err) });
      });
    }

    if (req.recordNetwork) {
      page.on('request', (r) => {
        pushNetwork({
          kind: 'request',
          url: r.url(),
          method: r.method(),
          resourceType: r.resourceType(),
        });
      });
      page.on('response', (resp) => {
        const r = resp.request();
        pushNetwork({
          kind: 'response',
          url: resp.url(),
          status: resp.status(),
          ok: resp.ok(),
          method: r.method(),
          resourceType: r.resourceType(),
        });
      });
    }

    const timeout = req.timeoutMs || 30000;

    // If explicit steps are provided, run them. Otherwise run a simple default flow.
    const steps = Array.isArray(req.steps) && req.steps.length > 0 ? req.steps : [
      { type: 'navigate', url: req.url, waitUntil: 'load' },
      ...((req.selectors || []).map((s) => ({ type: 'waitFor', selector: s, state: 'visible' }))),
      ...((req.selectors || []).map((s) => ({ type: 'assertVisible', selector: s }))),
    ];

    async function runStep(step) {
      switch (step.type) {
        case 'navigate':
          await page.goto(step.url, { timeout, waitUntil: step.waitUntil || 'load' });
          return;
        case 'waitFor':
          await page.waitForSelector(step.selector, {
            timeout: step.timeoutMs || timeout,
            state: step.state || 'attached',
          });
          return;
        case 'assertVisible': {
          const locator = page.locator(step.selector).first();
          const visible = await locator.isVisible();
          if (!visible) throw new Error(`Expected selector to be visible: ${step.selector}`);
          return;
        }
        case 'assertText': {
          const locator = page.locator(step.selector).first();
          const txt = await locator.innerText();
          if (step.exact) {
            if (txt.trim() !== String(step.text).trim()) throw new Error(`Expected exact text for ${step.selector}. got=${txt}`);
          } else {
            if (!txt.includes(String(step.text))) throw new Error(`Expected text to include for ${step.selector}. wanted=${step.text} got=${txt}`);
          }
          return;
        }
        case 'click':
          await page.click(step.selector, { timeout });
          return;
        case 'fill':
          await page.fill(step.selector, String(step.value), { timeout });
          return;
        case 'select':
          await page.selectOption(step.selector, String(step.value), { timeout });
          return;
        case 'hover':
          await page.hover(step.selector, { timeout });
          return;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
    }

    for (const step of steps) {
      await runStep(step);
    }

    if (req.expectedContent) {
      const bodyText = await page.locator('body').innerText();
      if (!bodyText.includes(String(req.expectedContent))) {
        throw new Error(`Expected page to include content: ${req.expectedContent}`);
      }
    }

    // Success: stop tracing without persisting artifacts.
    if (req.traceOnFailure) {
      await context.tracing.stop();
    }

    return { passed: true, message: 'Browser verification passed', artifacts: null, error: null };
  } catch (e) {
    // Failure: write artifacts.
    try {
      if (req.screenshotOnFailure && page) {
        await page.screenshot({ path: artifacts.screenshot, fullPage: true });
      }
    } catch (_) {}

    try {
      if (req.traceOnFailure && context) {
        await context.tracing.stop({ path: artifacts.trace });
      }
    } catch (_) {}

    try {
      if (req.recordConsole) {
        fs.writeFileSync(artifacts.console, safeJson({ console: consoleEvents, pageErrors }));
      }
    } catch (_) {}

    try {
      if (req.recordNetwork) {
        fs.writeFileSync(artifacts.network, safeJson({ events: networkEvents }));
      }
    } catch (_) {}

    return {
      passed: false,
      message: `Browser verification failed: ${e && e.message ? e.message : String(e)}`,
      artifacts,
      error: serializeError(e),
    };
  } finally {
    try { if (page) await page.close(); } catch (_) {}
    try { if (context) await context.close(); } catch (_) {}
    try { if (browser) await browser.close(); } catch (_) {}
  }
}

main()
  .then((result) => {
    process.stdout.write(JSON.stringify(result));
  })
  .catch((e) => {
    process.stdout.write(JSON.stringify({ passed: false, message: 'Playwright runner crashed', error: serializeError(e) }));
  });
"#;

/// Builder for browser verifier configuration
pub struct BrowserVerifierBuilder {
    config: BrowserVerifierConfig,
}

impl BrowserVerifierBuilder {
    /// Create a new builder
    pub fn new() -> Self {
        Self {
            config: BrowserVerifierConfig::default(),
        }
    }

    /// Set the URL
    pub fn url(mut self, url: impl Into<String>) -> Self {
        self.config.url = url.into();
        self
    }

    /// Add a CSS selector to check
    pub fn add_selector(mut self, selector: impl Into<String>) -> Self {
        self.config.selectors.push(selector.into());
        self
    }

    /// Set expected content
    pub fn expected_content(mut self, content: impl Into<String>) -> Self {
        self.config.expected_content = Some(content.into());
        self
    }

    /// Enable/disable screenshot on failure
    pub fn screenshot_on_failure(mut self, enabled: bool) -> Self {
        self.config.screenshot_on_failure = enabled;
        self
    }

    /// Set browser type
    pub fn browser(mut self, browser: BrowserType) -> Self {
        self.config.browser = browser;
        self
    }

    /// Set timeout in milliseconds
    pub fn timeout_ms(mut self, timeout: u64) -> Self {
        self.config.timeout_ms = timeout;
        self
    }

    /// Set viewport dimensions
    pub fn viewport(mut self, width: u32, height: u32) -> Self {
        self.config.viewport_width = width;
        self.config.viewport_height = height;
        self
    }

    /// Build the browser verifier
    pub fn build(self) -> BrowserVerifier {
        BrowserVerifier::with_config(self.config)
    }
}

impl Default for BrowserVerifierBuilder {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_browser_verifier_creation() {
        let verifier = BrowserVerifier::new();
        assert_eq!(verifier.verifier_type(), "browser");
        assert_eq!(verifier.config.url, "http://localhost:3000");
    }

    #[test]
    fn test_browser_verifier_with_config() {
        let config = BrowserVerifierConfig {
            url: "https://example.com".to_string(),
            selectors: vec!["#app".to_string(), ".header".to_string()],
            expected_content: Some("Welcome".to_string()),
            screenshot_on_failure: true,
            trace_on_failure: true,
            record_console: true,
            record_network: true,
            max_network_events: 10,
            browser: BrowserType::Firefox,
            headless: true,
            timeout_ms: 60000,
            viewport_width: 1920,
            viewport_height: 1080,
            steps: Vec::new(),
        };

        let verifier = BrowserVerifier::with_config(config);
        assert_eq!(verifier.config.url, "https://example.com");
        assert_eq!(verifier.config.selectors.len(), 2);
        assert_eq!(verifier.config.browser, BrowserType::Firefox);
    }

    #[test]
    fn test_builder() {
        let verifier = BrowserVerifierBuilder::new()
            .url("https://test.com")
            .add_selector("#app")
            .add_selector(".content")
            .expected_content("Hello World")
            .browser(BrowserType::Firefox)
            .timeout_ms(120000)
            .viewport(1920, 1080)
            .screenshot_on_failure(false)
            .build();

        assert_eq!(verifier.config.url, "https://test.com");
        assert_eq!(verifier.config.selectors.len(), 2);
        assert_eq!(verifier.config.browser, BrowserType::Firefox);
        assert_eq!(verifier.config.timeout_ms, 120000);
        assert_eq!(verifier.config.viewport_width, 1920);
        assert_eq!(verifier.config.viewport_height, 1080);
        assert!(!verifier.config.screenshot_on_failure);
    }

    #[test]
    fn test_browser_type_display() {
        assert_eq!(BrowserType::Chromium.to_string(), "Chromium");
        assert_eq!(BrowserType::Firefox.to_string(), "Firefox");
        assert_eq!(BrowserType::Webkit.to_string(), "WebKit");
    }

    #[test]
    fn test_default_config() {
        let config = BrowserVerifierConfig::default();
        assert_eq!(config.url, "http://localhost:3000");
        assert!(config.selectors.is_empty());
        assert!(config.screenshot_on_failure);
        assert!(config.trace_on_failure);
        assert!(config.record_console);
        assert!(config.record_network);
        assert_eq!(config.browser, BrowserType::Chromium);
        assert_eq!(config.timeout_ms, 30000);
        assert_eq!(config.viewport_width, 1280);
        assert_eq!(config.viewport_height, 720);
    }

    #[test]
    fn test_parse_script_output() {
        let sample = r#"{"passed":false,"message":"fail","artifacts":{"screenshot":"/tmp/a.png","trace":"/tmp/t.zip","console":"/tmp/c.json","network":"/tmp/n.json"},"error":{"name":"Error","message":"boom"}}"#;
        let parsed = parse_script_output(sample).unwrap();
        assert!(!parsed.passed);
        assert_eq!(parsed.message, "fail");
        let artifacts = parsed.artifacts.unwrap();
        assert_eq!(artifacts.screenshot.as_deref(), Some("/tmp/a.png"));
        assert_eq!(artifacts.trace.as_deref(), Some("/tmp/t.zip"));
    }

    #[test]
    fn test_build_request_expected_content_fallback() {
        let verifier = BrowserVerifier::new();
        let tmp = tempfile::tempdir().unwrap();
        let criterion = Criterion {
            id: "browser-1".to_string(),
            description: "Check content".to_string(),
            met: false,
            verification_method: Some("browser".to_string()),
            expected: Some("Hello".to_string()),
            actual: None,
        };

        let req = verifier.build_request(&criterion, tmp.path());
        assert_eq!(req.expected_content.as_deref(), Some("Hello"));
        assert_eq!(req.url, "http://localhost:3000");
    }
}
