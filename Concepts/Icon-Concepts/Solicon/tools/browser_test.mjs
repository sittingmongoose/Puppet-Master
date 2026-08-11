#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, "..");
const VERIFY = path.join(ROOT, "verification");
const CHROME_EXECUTABLE = process.env.SOLICON_CHROME_EXECUTABLE || process.env.CHROME_BIN;
const CHROME_CHANNEL = process.env.SOLICON_CHROME_CHANNEL || "chrome";
const PLAYWRIGHT_HELP = [
  "Playwright Core is required for Solicon browser verification.",
  "Install it in disposable scratch space and pass that node_modules directory:",
  '  solicon_modules="$(mktemp -d)"',
  '  npm install --prefix "$solicon_modules" --no-save playwright-core',
  '  node Concepts/Icon-Concepts/Solicon/tools/browser_test.mjs --modules "$solicon_modules/node_modules"',
].join("\n");

function modulesArgument(argv) {
  let modules = process.env.SOLICON_PLAYWRIGHT_MODULE || "";
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument !== "--modules") throw new Error(`Unknown argument: ${argument}\n\n${PLAYWRIGHT_HELP}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`--modules requires a directory\n\n${PLAYWRIGHT_HELP}`);
    modules = value;
    index += 1;
  }
  return modules;
}

async function loadChromium(modules) {
  const candidates = [];
  if (modules) {
    const moduleRoot = path.resolve(modules);
    candidates.push(pathToFileURL(path.join(moduleRoot, "playwright-core", "index.js")).href);
    candidates.push(pathToFileURL(path.join(moduleRoot, "playwright-core")).href);
  }
  candidates.push("playwright-core");

  const failures = [];
  for (const candidate of candidates) {
    try {
      const loaded = await import(candidate);
      const chromium = loaded.chromium || loaded.default?.chromium;
      if (chromium) return chromium;
      failures.push(`${candidate}: module does not export chromium`);
    } catch (error) {
      failures.push(`${candidate}: ${error.code || error.message}`);
    }
  }
  throw new Error(`${PLAYWRIGHT_HELP}\n\nResolution attempts:\n- ${failures.join("\n- ")}`);
}

const chromium = await loadChromium(modulesArgument(process.argv.slice(2)));
const manifest = JSON.parse(await readFile(path.join(ROOT, "manifest/manifest.json"), "utf8"));
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".zip": "application/zip",
  ".sha256": "text/plain; charset=utf-8",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function htmlEscape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function exists(target) {
  try {
    return (await stat(target)).isFile();
  } catch {
    return false;
  }
}

function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
      const target = path.resolve(ROOT, relative);
      if (target !== ROOT && !target.startsWith(`${ROOT}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(target);
      response.writeHead(200, {
        "Content-Type": MIME[path.extname(target)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

async function waitForDashboard(page) {
  await page.waitForFunction(() => Boolean(window.SOLICON && window.SOLICON.data));
  await page.waitForSelector("#static-grid .asset-card", { state: "attached" });
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert(dimensions.scrollWidth <= dimensions.clientWidth + 1, `${label} overflows horizontally: ${JSON.stringify(dimensions)}`);
}

async function verifyDownloads(page) {
  await page.evaluate(() => window.SOLICON.setView("downloads"));
  const paths = await page.locator("a[download]").evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean))]);
  for (const relative of paths) {
    if (/^(https?:|data:)/.test(relative)) continue;
    const target = path.resolve(ROOT, decodeURIComponent(relative.split("#")[0]));
    assert(target.startsWith(ROOT), `Download escapes Solicon: ${relative}`);
    assert(await exists(target), `Download target missing: ${relative}`);
  }
  return paths.length;
}

async function exerciseDashboard(page, url, mode, report) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
  const onPageError = (error) => pageErrors.push(error.message);
  const onRequestFailed = (request) => failedRequests.push(`${request.url()}: ${request.failure()?.errorText || "failed"}`);
  const onResponse = (response) => { if (response.status() >= 400 && !response.url().endsWith("favicon.ico")) badResponses.push(`${response.status()} ${response.url()}`); };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  await page.goto(url, { waitUntil: "load" });
  await waitForDashboard(page);
  assert(await page.locator("#static-grid .asset-card").count() === 8, `${mode}: expected eight static cards`);
  await assertNoOverflow(page, `${mode} static`);
  for (const theme of manifest.themes) {
    await page.selectOption("#canvas-theme", theme.id);
    assert(await page.locator("html").getAttribute("data-canvas-theme") === theme.id, `${mode}: canvas theme ${theme.id} did not apply`);
    assert((await page.locator("#hero-logo").getAttribute("src")).includes(theme.id), `${mode}: hero did not follow canvas theme ${theme.id}`);
  }
  await page.selectOption("#canvas-theme", "friendly-dark");
  await page.locator('[data-form="micro"]').click();
  assert((await page.locator("#static-grid img").first().getAttribute("src")).endsWith("-micro.svg"), `${mode}: micro form control failed`);
  await page.selectOption("#context-select", "tray");
  assert(await page.locator("#static-grid .tray-mock").count() === 8, `${mode}: tray context failed`);
  await page.locator('[data-form="full"]').click();
  await page.selectOption("#context-select", "app");

  await page.locator('[data-view="static"]').focus();
  await page.keyboard.press("ArrowRight");
  assert(await page.locator('[data-view="loaders"]').getAttribute("aria-selected") === "true", `${mode}: keyboard tab navigation failed`);
  await page.evaluate(() => window.SOLICON.mountAllLoaders());
  assert(await page.locator("#loader-grid .loader-card").count() === 64, `${mode}: default loader matrix should contain 64 cards`);
  assert(await page.locator("#loader-grid .preview-svg").count() === 64, `${mode}: explicit lazy-mount failed`);
  await page.locator('[data-presentation="transparent"]').click();
  await page.evaluate(() => window.SOLICON.mountAllLoaders());
  assert(await page.locator("#loader-grid .loader-card").count() === 64, `${mode}: transparent loader matrix should contain 64 cards`);
  await page.locator('[data-treatment="flat"]').click();
  await page.evaluate(() => window.SOLICON.mountAllLoaders());
  assert((await page.locator("#loader-grid .download-link").first().getAttribute("href")).includes("-flat-transparent.svg"), `${mode}: flat treatment control failed`);
  await page.selectOption("#tone-filter", "friendly-technical");
  assert(await page.locator("#loader-grid .loader-card").count() === 24, `${mode}: friendly tone filter should contain 24 cards`);
  await page.selectOption("#speed-select", "2");
  await page.locator("#replay").click();
  await page.locator("#toggle-play").click();
  assert(await page.locator("body").evaluate((body) => body.classList.contains("is-paused")), `${mode}: pause control failed`);
  await page.getByText("Reduced motion", { exact: true }).click();
  assert(await page.locator("#reduce-motion").isChecked(), `${mode}: reduced-motion switch did not check`);
  assert(await page.locator("body").evaluate((body) => body.classList.contains("reduce-motion")), `${mode}: reduced-motion control failed`);
  await page.selectOption("#context-select", "titlebar");
  await page.evaluate(() => window.SOLICON.mountAllLoaders());
  assert(await page.locator("#loader-grid .titlebar-mock").count() > 0, `${mode}: title-bar context did not render`);
  const downloadCount = await verifyDownloads(page);
  await assertNoOverflow(page, `${mode} downloads`);

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("requestfailed", onRequestFailed);
  page.off("response", onResponse);
  assert(consoleErrors.length === 0, `${mode}: console errors: ${consoleErrors.join(" | ")}`);
  assert(pageErrors.length === 0, `${mode}: page errors: ${pageErrors.join(" | ")}`);
  assert(failedRequests.length === 0, `${mode}: failed requests: ${failedRequests.join(" | ")}`);
  assert(badResponses.length === 0, `${mode}: HTTP errors: ${badResponses.join(" | ")}`);
  report.modes.push({ mode, url, static_cards: 8, loader_cards: 64, friendly_filter_cards: 24, download_links_checked: downloadCount, console_errors: 0 });
}

async function captureResponsive(page, baseUrl, report) {
  const widths = [360, 768, 1280, 1600];
  await mkdir(path.join(VERIFY, "dashboard"), { recursive: true });
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 900 });
    await page.goto(`${baseUrl}/index.html?viewport=${width}#static`, { waitUntil: "load" });
    await waitForDashboard(page);
    await assertNoOverflow(page, `localhost ${width}px`);
    const target = path.join(VERIFY, "dashboard", `dashboard-${width}.png`);
    await page.screenshot({ path: target, fullPage: false });
    report.viewports.push({ width, height: width === 360 ? 800 : 900, overflow: false, screenshot: path.relative(ROOT, target) });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${baseUrl}/index.html?viewport=loaders#loaders`, { waitUntil: "load" });
  await waitForDashboard(page);
  await page.evaluate(() => {
    window.SOLICON.mountAllLoaders();
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.querySelector(".workbench").offsetTop);
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(VERIFY, "dashboard", "dashboard-loaders-1280.png"), fullPage: false });
}

function rasterSheetHtml(title, cells, columns, cellHeight) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}html,body{margin:0;background:#111;color:#eee;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{padding:18px}
    h1{margin:0 0 14px;font-size:20px}.grid{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:6px}.cell{min-width:0;height:${cellHeight}px;display:grid;grid-template-rows:auto 1fr;gap:8px;padding:10px;border:1px solid #333;background:#181818;overflow:hidden}
    .title{font-size:11px;font-weight:700;letter-spacing:.04em}.images{display:flex;align-items:end;justify-content:space-around;gap:7px;min-width:0}.sample{display:grid;justify-items:center;gap:4px;color:#aaa;font-size:8px}.sample img{display:block;max-width:none;image-rendering:auto}
  </style></head><body><h1>${htmlEscape(title)}</h1><div class="grid">${cells.join("")}</div></body></html>`;
}

async function captureRasterSheets(page, baseUrl, report) {
  const directory = path.join(VERIFY, "raster-sheets");
  await mkdir(directory, { recursive: true });
  await page.setViewportSize({ width: 1600, height: 1000 });

  const appCells = [];
  for (const theme of manifest.themes) {
    for (const treatment of ["flat", "character"]) {
      const samples = [16, 32, 64, 256].map((size) => `<span class="sample"><img src="${baseUrl}/exports/app/${theme.id}/${treatment}/icon-${size}.png" width="${size}" height="${size}" alt=""><span>${size} px</span></span>`).join("");
      appCells.push(`<section class="cell"><span class="title">${htmlEscape(theme.label)} · ${htmlEscape(treatment)}</span><div class="images">${samples}</div></section>`);
    }
  }
  await page.setContent(rasterSheetHtml("App icon raster inspection · native 16, 32, 64, and 256 px", appCells, 4, 300), { waitUntil: "networkidle" });
  assert(await page.locator("img").evaluateAll((images) => images.length === 64 && images.every((image) => image.complete && image.naturalWidth > 0)), "An app raster failed to render in the inspection sheet");
  const appTarget = path.join(directory, "app-icons-16-32-64-256.png");
  await page.screenshot({ path: appTarget, fullPage: true });

  const trayCells = [];
  for (const theme of manifest.themes) {
    for (const treatment of ["flat", "character"]) {
      for (const state of ["idle", "running", "template"]) {
        const samples = [16, 20, 24, 32, 48].map((size) => `<span class="sample"><img src="${baseUrl}/exports/tray/${theme.id}/${treatment}/${state}/tray-${size}.png" width="${size}" height="${size}" alt=""><span>${size}</span></span>`).join("");
        trayCells.push(`<section class="cell"><span class="title">${htmlEscape(theme.label)} · ${htmlEscape(treatment)} · ${state}</span><div class="images">${samples}</div></section>`);
      }
    }
  }
  await page.setContent(rasterSheetHtml("Tray raster inspection · native 16, 20, 24, 32, and 48 px", trayCells, 6, 112), { waitUntil: "networkidle" });
  assert(await page.locator("img").evaluateAll((images) => images.length === 240 && images.every((image) => image.complete && image.naturalWidth > 0)), "A tray raster failed to render in the inspection sheet");
  const trayTarget = path.join(directory, "tray-icons-16-20-24-32-48.png");
  await page.screenshot({ path: trayTarget, fullPage: true });
  report.raster_sheets = [
    { kind: "app", sizes: [16, 32, 64, 256], samples: 64, screenshot: path.relative(ROOT, appTarget) },
    { kind: "tray", sizes: [16, 20, 24, 32, 48], samples: 240, screenshot: path.relative(ROOT, trayTarget) },
  ];
}

let sheetSequence = 0;

function injectPhase(svg, duration, phase) {
  const suffix = `sheet${++sheetSequence}`;
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]).sort((left, right) => right.length - left.length);
  let unique = svg.replace(/^<\?xml[^>]+>\s*/i, "");
  for (const id of ids) unique = unique.replaceAll(id, `${id}-${suffix}`);
  unique = unique.replaceAll(":root", `#pm-logo-${suffix}`);
  const phaseMs = Math.round(duration * phase);
  const pauseRule = `<style>#pm-logo-${suffix},#pm-logo-${suffix} *{animation-play-state:paused!important;animation-delay:-${phaseMs}ms!important}</style>`;
  return unique.replace("</svg>", `${pauseRule}</svg>`);
}

function contactSheetHtml(title, cells, columns = 16) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}html,body{margin:0;background:#111;color:#eee;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    body{padding:18px}h1{margin:0 0 14px;font-size:20px;letter-spacing:.04em}.grid{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:5px}
    .cell{min-width:0;height:92px;display:grid;grid-template-rows:1fr auto;place-items:center;padding:6px 4px 4px;border:1px solid rgba(255,255,255,.14);overflow:hidden}
    .asset-frame,.asset-frame svg{display:block;width:64px;height:64px}.meta{max-width:100%;overflow:hidden;color:rgba(255,255,255,.8);font-size:8px;line-height:1;white-space:nowrap;text-overflow:ellipsis}
  </style></head><body><h1>${htmlEscape(title)}</h1><div class="grid">${cells.join("")}</div></body></html>`;
}

async function phaseCell(entry, phase) {
  const theme = manifest.themes.find((candidate) => candidate.id === entry.theme_id);
  const source = await readFile(path.join(ROOT, entry.path), "utf8");
  const phased = injectPhase(source, entry.duration_ms, phase);
  return `<div class="cell" style="background:${htmlEscape(theme.tokens.background)}"><div class="asset-frame" title="${htmlEscape(entry.id)} at ${phase}">${phased}</div><span class="meta">${htmlEscape(entry.theme_id.replace("-", " "))} · ${htmlEscape(entry.treatment[0])}${htmlEscape(entry.presentation[0])} · ${Math.round(phase * 100)}%</span></div>`;
}

async function validateFrames(page, expected) {
  await page.waitForFunction((count) => document.querySelectorAll(".asset-frame").length === count, expected);
  const results = await page.locator(".asset-frame").evaluateAll((frames) => frames.map((frame) => {
    const svg = frame.querySelector('svg[id^="pm-logo-"]');
    const layers = ["pm-stick-back", "pm-stick-front", "pm-strings", "pm-monogram", "pm-braces"];
    return {
      loaded: Boolean(svg),
      visible: layers.every((id) => {
        const item = frame.querySelector(`[id^="${id}-"]`);
        if (!item) return false;
        const style = getComputedStyle(item);
        return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0;
      }),
      viewBox: svg?.getAttribute("viewBox"),
    };
  }));
  assert(results.length === expected && results.every((item) => item.loaded && item.visible && item.viewBox === "0 0 43.2 43.2"), "A phase-sheet loader is missing, clipped, or invisible");
}

async function captureMotionSheets(page, report) {
  const directory = path.join(VERIFY, "motion-sheets");
  await mkdir(directory, { recursive: true });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1600, height: 980 });
  for (const motion of manifest.motions) {
    const entries = manifest.loader_assets.filter((entry) => entry.motion_id === motion.id);
    const cells = [];
    for (const entry of entries) {
      for (const phase of [0, .25, .5, .75]) cells.push(await phaseCell(entry, phase));
    }
    assert(cells.length === 128, `${motion.id}: expected 128 phase cells`);
    await page.setContent(contactSheetHtml(`${motion.label} · 8 themes × 2 treatments × 2 presentations × 4 phases`, cells), { waitUntil: "domcontentloaded" });
    await validateFrames(page, 128);
    const screenshot = path.join(directory, `${motion.id}-four-phases.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    report.motion_sheets.push({ motion_id: motion.id, loader_assets: 32, phase_captures: 128, screenshot: path.relative(ROOT, screenshot), layers_visible: true });
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedCells = [];
  for (const entry of manifest.loader_assets) reducedCells.push(await phaseCell(entry, .5));
  await page.setContent(contactSheetHtml("Reduced motion · all 256 loaders · stationary layers with opacity signal", reducedCells), { waitUntil: "domcontentloaded" });
  await validateFrames(page, 256);
  const motionState = await page.locator(".asset-frame").evaluateAll((frames) => frames.map((frame) => {
    return {
      layer: getComputedStyle(frame.querySelector('[id^="pm-stick-back-"]')).animationName,
      mark: getComputedStyle(frame.querySelector('[id^="pm-mark-"]')).animationName,
      transform: getComputedStyle(frame.querySelector('[id^="pm-stick-back-"]')).transform,
    };
  }));
  assert(motionState.every((state) => state.layer === "none" && state.mark.includes("pm-rm-pulse") && state.transform === "none"), "Reduced-motion contract did not disable transforms for every loader");
  const reducedScreenshot = path.join(directory, "reduced-motion-all-loaders.png");
  await page.screenshot({ path: reducedScreenshot, fullPage: true });
  report.reduced_motion = { loader_assets: 256, opacity_only: true, screenshot: path.relative(ROOT, reducedScreenshot) };
  await page.emulateMedia({ reducedMotion: "no-preference" });
}

await mkdir(VERIFY, { recursive: true });
const { server, port } = await startServer();
const baseUrl = `http://127.0.0.1:${port}`;
const fileUrl = pathToFileURL(path.join(ROOT, "index.html")).href;
const launchOptions = { headless: true };
if (CHROME_EXECUTABLE) launchOptions.executablePath = CHROME_EXECUTABLE;
else launchOptions.channel = CHROME_CHANNEL;
const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const report = {
  schema_id: "pm.solicon.browser_verification.v1",
  status: "passed",
  modes: [],
  viewports: [],
  raster_sheets: [],
  motion_sheets: [],
  reduced_motion: null,
};

try {
  await exerciseDashboard(page, fileUrl, "file", report);
  await exerciseDashboard(page, `${baseUrl}/index.html`, "localhost", report);
  await captureResponsive(page, baseUrl, report);
  await captureRasterSheets(page, baseUrl, report);
  await captureMotionSheets(page, report);
  await writeFile(path.join(VERIFY, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ status: report.status, modes: report.modes.length, viewports: report.viewports.length, phase_captures: report.motion_sheets.reduce((sum, item) => sum + item.phase_captures, 0), reduced_loaders: report.reduced_motion.loader_assets })}\n`);
} catch (error) {
  report.status = "failed";
  report.error = error.stack || String(error);
  await writeFile(path.join(VERIFY, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
