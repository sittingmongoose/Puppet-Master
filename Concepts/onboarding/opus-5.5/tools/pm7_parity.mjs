#!/usr/bin/env node
/* PM7 page-wide exact style/pixel parity. Node >=22; browser admission/cleanup via chrome.mjs. */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hostname } from 'node:os';
import { launch } from './pm7_parity_chrome.mjs';
import { installParityRuntime } from './pm7_parity_browser.mjs';
import { diffPng } from './pm7_parity_png.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const help = `Usage: node pm7_parity.mjs BASELINE.html CANDIDATE.html [options]
  --out DIR                       JSON, Markdown, screenshots and heat maps
  --matrix FILE                   State data (default pm7_parity_states.json)
  --subset looks=a,b;pages=a,b;states=a,b;viewports=wide,narrow
                                  Repeat --subset to combine filters; quote semicolons
  --concurrency N                 Browser cap, default 4; integer 1..6 (1 runs serially)
  --tolerance N                   RGBA channel delta allowed, default 0 (0..255)
  --max-diff-pixels N             Pixels above tolerance allowed, default 0
  --first N                       First differing elements to detail, default 8
  --deep                          Exhaustive JS sampler, including hidden/custom styles (slow)
  --list                          Print selected matrix without opening browsers
  --help                          This help
Exit: 0 parity, 1 differences, 2 harness error. Styles always compare exactly.
GPU agent-browser sessions only. A pair stays on this host. No remote mode.
`;

export function parseArgs(argv) {
  const options = { concurrency: 4, tolerance: 0, maxDiffPixels: 0, first: 8, filters: {},
    matrix: join(here, 'pm7_parity_states.json') };
  const files = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help') options.help = true;
    else if (arg === '--list') options.list = true;
    else if (arg === '--deep') options.deep = true;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2), value = argv[++i];
      if (!value || value.startsWith('--')) throw Error(`${arg} requires a value`);
      if (key === 'subset') {
        for (const part of value.split(';')) {
          const match = /^(looks|pages|states|viewports)=(.+)$/.exec(part);
          if (!match) throw Error('Subset must be looks=...;pages=...;states=...;viewports=...');
          options.filters[match[1]] = match[2].split(',');
        }
      } else if (['concurrency', 'tolerance', 'max-diff-pixels', 'first'].includes(key)) {
        const number = Number(value);
        if (!Number.isSafeInteger(number) || number < 0) throw Error(`${arg} requires a nonnegative integer`);
        options[{ 'max-diff-pixels': 'maxDiffPixels' }[key] || key] = number;
      } else if (key === 'out' || key === 'matrix') options[key] = resolve(value);
      else throw Error(`Unknown option ${arg}`);
    } else files.push(resolve(arg));
  }
  if (options.concurrency < 1 || options.concurrency > 6 || options.tolerance > 255 || options.first < 1) throw Error('Invalid concurrency (1..6), tolerance (0..255) or first (>=1)');
  if (!options.help && files.length !== 2) throw Error('Pass baseline and candidate file paths');
  [options.baseline, options.candidate] = files;
  options.out ||= resolve('/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A0-parity', new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid);
  return options;
}
export function selectMatrix(matrix, filters) {
  if (matrix.version !== 1) throw Error('Unsupported state matrix version');
  const selected = {};
  for (const key of ['looks', 'pages', 'states', 'viewports']) {
    if (!Array.isArray(matrix[key]) || !matrix[key].length) throw Error(`Empty matrix ${key}`);
    const id = x => typeof x === 'string' ? x : x.id;
    const ids = matrix[key].map(id);
    if (ids.some(x => !/^[a-z0-9-]+$/.test(x)) || new Set(ids).size !== ids.length) throw Error(`Invalid/duplicate ${key} IDs`);
    for (const name of filters[key] || []) if (!ids.includes(name)) throw Error(`Unknown ${key} subset: ${name}`);
    selected[key] = matrix[key].filter(x => !filters[key] || filters[key].includes(id(x)));
  }
  for (const look of selected.looks) if (!/^(basic|friendly|glass|retro|nier)-(dark|light)$/.test(look)) throw Error(`Unknown look ${look}`);
  const groups = [];
  for (const viewport of selected.viewports) {
    if (![viewport.width, viewport.height].every(n => Number.isInteger(n) && n >= 200 && n <= 4096)) throw Error('Invalid viewport');
    for (const look of selected.looks) for (const page of selected.pages) {
      const states = selected.states.filter(s => s.pages === '*' || s.pages.includes(page.id));
      if (states.length) groups.push({ viewport, look, page, states });
    }
  }
  if (!groups.length) throw Error('Subset selects no reachable states');
  return { ...selected, groups, count: groups.reduce((n, g) => n + g.states.length, 0) };
}
function deadline(promise, label, ms = 180_000) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(`Timeout: ${label}`)), ms); })]).finally(() => clearTimeout(timer));
}
function seedStorage(look) {
  const [family, mode] = look.split('-');
  const title = value => value[0].toUpperCase() + value.slice(1);
  return { 'pm7:settings:tome-tabs:v1:tastebook': { settings: {
    'general.visual.theme': title(family === 'nier' ? 'basic' : family) + ' ' + title(mode),
    'general.visual.theme-mode': title(mode), 'general.visual.nier-mode': family === 'nier',
    'general.visual.reduce-animations': true, 'general.audio.sound-enabled': false
  } } };
}
async function createBrowser(input, telemetry) {
  const browser = await launch({ width: 1600, height: 900, scale: 1 });
  telemetry.live.add(browser);
  try {
    const page = browser.page;
    await page.bringToFront();
    if (process.env.PM7_PARITY_DEBUG) page.on('Runtime.consoleAPICalled', e => {
      if (e.args[0]?.value === 'PM7_PARITY_SNAPSHOT') console.log(e.args.map(a => a.value).join(' '));
    });
    await page.send('Network.enable');
    await page.send('Network.setBlockedURLs', { urls: ['http://*', 'https://*', 'ws://*', 'wss://*', 'ftp://*', 'file:///__pm7_parity_asset__/*'] });
    await page.send('Emulation.setTimezoneOverride', { timezoneId: 'UTC' });
    await page.send('Emulation.setLocaleOverride', { locale: 'en-US' });
    await page.send('Animation.enable'); await page.send('Animation.setPlaybackRate', { playbackRate: 0 });
    browser.input = input; browser.interceptErrors = []; browser.blocked = new Set();
    browser.currentUrl = 'file:///__pm7_parity__/input.html?o55=off&o55scenario=fresh';
    page.on('Fetch.requestPaused', event => {
      const uri = event.request.url;
      let request;
      if (event.resourceType === 'Document' && uri === browser.currentUrl) {
        request = page.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }], body: browser.input.body });
      } else if (/^(?:data:|blob:|file:)/.test(uri) && !uri.startsWith('file:///__pm7_parity_asset__/')) {
        request = page.send('Fetch.continueRequest', { requestId: event.requestId });
      } else {
        browser.blocked.add(uri.slice(0, 200));
        request = page.send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'BlockedByClient' });
      }
      request.catch(error => browser.interceptErrors.push(String(error)));
    });
    await page.send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
    const info = await browser.send('SystemInfo.getInfo');
    const renderer = info.gpu?.auxAttributes?.glRenderer || info.gpu?.devices?.map(d => d.deviceString).join('; ');
    if (!renderer || /swiftshader|llvmpipe|software/i.test(renderer)) throw Error('GPU renderer required: ' + renderer);
    telemetry.renderers.add(renderer);
    browser.version = await browser.send('Browser.getVersion');
    return browser;
  } catch (error) { await browser.close(); telemetry.live.delete(browser); throw error; }
}
async function loadGroup(browser, group, input = browser.input) {
  browser.input = input; browser.page.errors.length = 0;
  if (browser.initId) await browser.page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: browser.initId });
  const config = { epoch: 1789000000000, seed: 0x9e3779b9, storage: seedStorage(group.look) };
  const init = await browser.page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(${installParityRuntime.toString()})(${JSON.stringify(config)})` });
  browser.initId = init.identifier;
  await browser.page.setViewport(group.viewport.width, group.viewport.height);
  await browser.page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }, { name: 'prefers-color-scheme', value: group.look.endsWith('-light') ? 'light' : 'dark' }] });
  await browser.page.goto(browser.currentUrl);
  await browser.page.evaluate(async () => {
    if (!window.__pm7Parity) throw Error('Runtime was not installed');
    await __pm7Parity.settle(5000);
    if (!(window.PM_THEME && window.PM_NIER && window.PM_PAGES && window.O55)) throw Error('PM7 APIs missing');
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, async img => { if (!img.complete) await img.decode().catch(() => {}); }));
    if (window.PM_DEMO?.clock?.pause) PM_DEMO.clock.pause();
  });
  await browser.page.evaluate(async (route, prepare, look) => {
    const [family, mode] = look.split('-');
    PM_NIER.setTransition(repaint => repaint());
    PM7_SETTINGS_TOME.setChromeThemeFamily(family === 'nier' ? 'basic' : family);
    PM7_SETTINGS_TOME.setChromeThemeMode(mode);
    PM12_KIMI.setSettingFromHost('general.visual.reduce-animations', true);
    if (PM_NIER.wanted() !== (family === 'nier')) PM_NIER.set(family === 'nier', { sound: false });
    PM_PAGES.go(route);
    if (prepare) (0, eval)(prepare);
    await __pm7Parity.settle(1200);
    const root = document.documentElement;
    if (root.getAttribute('data-theme') !== (family === 'nier' ? 'basic' : family) + '-' + mode || PM_NIER.on() !== (family === 'nier')) throw Error('Requested look did not paint: ' + look);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches || root.getAttribute('data-motion') !== 'reduced') throw Error('Reduced motion did not apply');
  }, group.page.route, group.page.prepare || '', group.look);
  await visible(browser.page, group.page.assert, 'page ' + group.page.id);
}
async function visible(page, selector, label = selector) {
  const found = await page.evaluate(sel => Array.from(document.querySelectorAll(sel)).some(el => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0 && !el.closest('[hidden],[inert]');
  }), selector);
  if (!found) throw Error('State target not visible: ' + label + ' (' + selector + ')');
}
async function point(page, selector) {
  await visible(page, selector);
  const result = await page.evaluate(sel => {
    const el = Array.from(document.querySelectorAll(sel)).find(el => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return r.width && r.height && cs.display !== 'none' && cs.visibility !== 'hidden' && !el.closest('[hidden],[inert]');
    });
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = el.getBoundingClientRect();
    let left = Math.max(0, r.left), right = Math.min(innerWidth, r.right), top = Math.max(0, r.top), bottom = Math.min(innerHeight, r.bottom);
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      const cs = getComputedStyle(parent), clip = parent.getBoundingClientRect();
      if (/hidden|clip|scroll|auto/.test(cs.overflowX)) { left = Math.max(left, clip.left); right = Math.min(right, clip.right); }
      if (/hidden|clip|scroll|auto/.test(cs.overflowY)) { top = Math.max(top, clip.top); bottom = Math.min(bottom, clip.bottom); }
    }
    for (const fy of [.5, .2, .8]) for (const fx of [.5, .2, .8]) {
      const x = left + (right - left) * fx, y = top + (bottom - top) * fy, hit = document.elementFromPoint(x, y);
      if (right > left && bottom > top && hit && (hit === el || el.contains(hit))) return { x, y, hit: true, disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true' };
    }
    return { hit: false, disabled: !!el.disabled };
  }, selector);
  if (!result.hit || result.disabled) throw Error('State target covered/offscreen/disabled: ' + selector);
  return result;
}
async function enterState(browser, state, group) {
  const page = browser.page;
  for (let i = 0; i < 3; i++) { await page.key('Escape'); await page.evaluate(() => __pm7Parity.settle(100)); }
  if (group?.page.prepare) await page.evaluate(group.page.prepare);
  await page.mouse(1, 1, { down: false, up: false });
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.evaluate(() => __pm7Parity.settle(400));
  for (const step of state.steps) {
    if (step.action === 'eval') await page.evaluate(step.script);
    else if (step.action === 'focus') {
      await visible(page, step.selector);
      // Set keyboard focus modality without tabbing through unrelated product controls first.
      await page.evaluate(() => window.addEventListener('keydown', event => {
        if (event.key === 'Tab') { event.preventDefault(); event.stopImmediatePropagation(); }
      }, { capture: true, once: true }));
      await page.key('Tab');
      await page.evaluate(sel => {
        const el = Array.from(document.querySelectorAll(sel)).find(el => el.getClientRects().length && !el.closest('[hidden],[inert]'));
        el.focus(); if (document.activeElement !== el) throw Error('Focus did not reach target');
      }, step.selector);
    } else if (step.action === 'click' || step.action === 'hover') {
      const pt = await point(page, step.selector);
      await page.mouse(pt.x, pt.y, { down: step.action === 'click', up: step.action === 'click' });
    } else throw Error('Unknown state action ' + step.action);
    await page.evaluate(() => __pm7Parity.settle(600));
  }
  await page.evaluate(() => __pm7Parity.settle(600));
  if (state.assert) await visible(page, state.assert, state.id);
}
async function nativeSnapshot(browser) {
  const start = performance.now();
  if (process.env.PM7_PARITY_DEBUG) console.log('NATIVE property names');
  browser.standardProperties ||= await browser.page.evaluate(() => Array.from(getComputedStyle(document.documentElement)).filter(p => !p.startsWith('--')).sort());
  const namesDone = performance.now();
  const snapshot = await browser.page.send('DOMSnapshot.captureSnapshot', { computedStyles: browser.standardProperties, includeDOMRects: true });
  const responseDone = performance.now();
  if (process.env.PM7_PARITY_DEBUG) console.log('NATIVE snapshot received');
  const { strings } = snapshot, doc = snapshot.documents[0], { nodes, layout } = doc;
  if (snapshot.documents.length !== 1) throw Error('Child frame document found; add explicit frame sampling');
  const sparseMap = sparse => new Map((sparse?.index || []).map((index, i) => [index, sparse.value[i]]));
  const pseudos = sparseMap(nodes.pseudoType), counts = new Map(), paths = new Map(), elements = [];
  const layoutStyles = new Map(layout.nodeIndex.map((node, i) => [node, layout.styles[i]]));
  const byPath = new Map(), vectors = new Map();
  const namesHash = digest(JSON.stringify(browser.standardProperties)), absentHash = digest(namesHash + '\0null');
  for (let i = 0; i < nodes.nodeType.length; i++) {
    const parent = nodes.parentIndex[i];
    if (nodes.nodeType[i] === 9) { paths.set(i, ''); continue; }
    if (nodes.nodeType[i] === 11) { paths.set(i, (paths.get(parent) || '') + '/#shadow-root'); continue; }
    if (nodes.nodeType[i] !== 1 && !pseudos.has(i)) continue;
    let path;
    if (pseudos.has(i)) path = (paths.get(parent) || '') + '::' + strings[pseudos.get(i)];
    else {
      const tag = strings[nodes.nodeName[i]].toLowerCase(), key = parent + ':' + tag, n = (counts.get(key) || 0) + 1;
      counts.set(key, n); path = (paths.get(parent) || '') + '/' + tag + '[' + n + ']';
    }
    paths.set(i, path);
    const indices = layoutStyles.get(i);
    let vector = null;
    if (indices) {
      const key = indices.join(','); vector = vectors.get(key);
      if (!vector) {
        if (indices.length !== browser.standardProperties.length) throw Error('Incomplete native property vector');
        const values = indices.map(index => strings[index] ?? null);
        vector = { values, hash: digest(namesHash + '\0' + JSON.stringify(values)) }; vectors.set(key, vector);
      }
    }
    byPath.set(path, vector); elements.push([path, vector?.hash || absentHash]);
  }
  browser.nativeDetails = byPath;
  return { hash: digest(JSON.stringify(elements)), entries: elements, elements: nodes.nodeType.filter(t => t === 1).length,
    uniqueStyles: new Set(elements.map(e => e[1])).size, internedImageUrls: 0, interningAudit: 0,
    styledRecords: elements.filter(([path]) => byPath.get(path) !== null).length,
    unstyledDomRecords: elements.filter(([path]) => byPath.get(path) === null).length,
    phases: { names: namesDone - start, response: responseDone - namesDone, hash: performance.now() - responseDone } };
}
async function capture(browser, audit, deep) {
  if (browser.interceptErrors.length) throw Error(browser.interceptErrors.join('\n'));
  await browser.page.bringToFront();
  if (process.env.PM7_PARITY_DEBUG) console.log('CAPTURE screenshot start');
  const screenshot = await browser.page.screenshot();
  if (process.env.PM7_PARITY_DEBUG) console.log('CAPTURE screenshot done');
  const styleStarted = performance.now();
  const styles = deep ? await browser.page.evaluate(async audit => __pm7Parity.snapshot(audit), audit) : await nativeSnapshot(browser);
  const styleMilliseconds = performance.now() - styleStarted;
  const state = await browser.page.evaluate(() => ({ time: __pm7Parity.now, theme: document.documentElement.getAttribute('data-theme'),
    nier: PM_NIER.on(), page: PM_PAGES.current, focus: document.activeElement?.id || document.activeElement?.className || '',
    fonts: document.fonts.status, viewport: [innerWidth, innerHeight, devicePixelRatio] }));
  return { screenshot, styles, state, styleMilliseconds, nativeDetails: deep ? null : browser.nativeDetails,
    errors: [...new Set(browser.page.errors)] };
}
export function differingPaths(a, b) {
  const left = new Map(a), right = new Map(b);
  return [...new Set([...left.keys(), ...right.keys()])].filter(path => left.get(path) !== right.get(path));
}
async function styleDetails(browsers, paths, deep, captures) {
  const [a, b] = deep ? await Promise.all(browsers.map(browser => browser.page.evaluate(paths => __pm7Parity.details(paths), paths))) : (captures || browsers).map((capture, i) => paths.map(path => {
    const records = capture.nativeDetails, record = records.get(path);
    return !records.has(path) ? { path, absent: true } : { path, label: path,
      properties: record ? Object.fromEntries((browsers[i] || browsers[0]).standardProperties.map((name, j) => [name, record.values[j]])) : null };
  }));
  return formatStyleDetails(a, b, paths);
}
function formatStyleDetails(a, b, paths) {
  return paths.map((path, i) => {
    const x = a[i], y = b[i];
    if (x.absent || y.absent) return { path, baseline: x.absent ? 'absent' : x.label, candidate: y.absent ? 'absent' : y.label };
    if (!x.properties || !y.properties) return { path, baseline: x.properties ? 'layout style present' : 'no layout style', candidate: y.properties ? 'layout style present' : 'no layout style' };
    const properties = [...new Set([...Object.keys(x.properties), ...Object.keys(y.properties)])].filter(name => x.properties[name] !== y.properties[name]);
    return { path, baseline: x.label, candidate: y.label, properties: properties.map(property => ({ property, baseline: x.properties[property] ?? null, candidate: y.properties[property] ?? null })) };
  });
}
async function run(options) {
  const started = Date.now(), matrix = JSON.parse(readFileSync(options.matrix, 'utf8'));
  const selected = selectMatrix(matrix, options.filters);
  if (options.list) { console.log(JSON.stringify(selected, null, 2)); return 0; }
  const inputs = [options.baseline, options.candidate].map(path => {
    const bytes = readFileSync(path); return { path, sha256: digest(bytes), bytes: bytes.length, body: bytes.toString('base64') };
  });
  if (existsSync(join(options.out, 'report.json')) || existsSync(join(options.out, 'progress.jsonl'))) throw Error('Output directory already contains a run; use a new --out');
  mkdirSync(join(options.out, 'states'), { recursive: true });
  const telemetry = { live: new Set(), renderers: new Set(), peakRssBytes: 0, peakNodeRssBytes: 0, samples: 0 };
  let sampling = false;
  async function sampleMemory() {
    if (sampling) return; sampling = true;
    try {
      const pids = new Set([process.pid]);
      for (const browser of telemetry.live) {
        pids.add(browser.chrome.pid);
        const info = await browser.send('SystemInfo.getProcessInfo').catch(() => ({ processInfo: [] }));
        for (const proc of info.processInfo) pids.add(proc.id);
      }
      let rss = 0;
      for (const pid of pids) { try { rss += Number(/^VmRSS:\s+(\d+)/m.exec(readFileSync(`/proc/${pid}/status`, 'utf8'))?.[1] || 0) * 1024; } catch {} }
      telemetry.peakRssBytes = Math.max(telemetry.peakRssBytes, rss);
      telemetry.peakNodeRssBytes = Math.max(telemetry.peakNodeRssBytes, process.memoryUsage().rss); telemetry.samples++;
    } finally { sampling = false; }
  }
  const interval = setInterval(() => { sampleMemory().catch(() => {}); }, 2000);
  const report = { version: 1, started: new Date(started).toISOString(), host: hostname(), input: inputs.map(({ body, ...rest }) => rest),
    matrix: { path: options.matrix, sha256: digest(readFileSync(options.matrix)), looks: selected.looks,
      pages: selected.pages.map(p => p.id), states: selected.states.map(s => s.id), viewports: selected.viewports, planned: selected.count },
    options: { concurrency: options.concurrency, browserCap: options.concurrency === 1 ? 1 : Math.floor(options.concurrency / 2) * 2,
      tolerance: options.tolerance, maxDiffPixels: options.maxDiffPixels, first: options.first, deep: !!options.deep },
    mode: options.tolerance || options.maxDiffPixels ? 'explicit pixel tolerance; exact styles' : 'exact',
    determinism: { epoch: 1789000000000, seed: '0x9e3779b9', clock: 'manual deterministic timers/rAF; Date and performance.now share clock',
      animations: 'CDP playback rate 0; finite animations finished, infinite paused at 0; SVG paused at 0', reducedMotion: true,
      storage: 'localStorage/sessionStorage cleared and seeded before each group', network: 'only file:, data: and blob: allowed',
      documentUrl: 'same intercepted file: URL on both sides; source bytes supplied unmodified',
      styleHash: options.deep ? 'Deep: SHA256 over DOM paths and per-vector SHA256 over sorted property names and original-value SHA256; all elements incl hidden and open shadow roots' : 'Native: DOMSnapshot standard computed properties on layout nodes; all DOM paths retained, including nodes without layout styles; custom properties excluded',
      imageInterning: options.deep ? 'temporary lossless CSSOM image URL interning, original values reconstructed before hashing; 12-node audit each browser first capture' : 'unused in native mode',
      limits: ['Viewport screenshots, not offscreen scroll contents.', 'Closed shadow roots and child-frame documents are not traversed.',
        'Checks only listed reachable states, not every possible interaction.', 'No cross-host pixel equivalence claimed.',
        'Fresh self-contained PM7 inputs required; relative external files resolve from the shared intercepted URL.',
        'Manual clock freezes live data and decorative motion; animation timing itself is outside this parity check.',
        ...(options.deep ? [] : ['Native mode excludes custom properties and cannot sample computed properties of nodes without layout objects or non-generated pseudo elements. Use --deep for these.'])] },
    rows: [], errors: [], browsers: [] };
  let cursor = 0;
  async function compare(group, state, captures, browsers, detailOverride) {
    const [a, b] = captures, key = `${group.look}--${group.page.id}--${state.id}--${group.viewport.id}`;
    const prefix = join(options.out, 'states', key);
    const pixels = diffPng(a.screenshot, b.screenshot, options.tolerance, options.maxDiffPixels);
    const paths = differingPaths(a.styles.entries, b.styles.entries);
    const sameErrors = JSON.stringify(a.errors) === JSON.stringify(b.errors);
    const row = { id: key, look: group.look, page: group.page.id, state: state.id, viewport: group.viewport,
      styles: { baseline: a.styles.hash, candidate: b.styles.hash, differingElements: paths.length,
        baselineElements: a.styles.elements, candidateElements: b.styles.elements, pseudoRecords: [a.styles.entries.length, b.styles.entries.length],
        uniqueStyles: [a.styles.uniqueStyles, b.styles.uniqueStyles], sampling: options.deep ? 'deep CSSOM including custom and hidden styles' : 'native standard properties on layout nodes; all DOM paths retained',
        styledRecords: [a.styles.styledRecords, b.styles.styledRecords], unstyledDomRecords: [a.styles.unstyledDomRecords, b.styles.unstyledDomRecords],
        milliseconds: [a.styleMilliseconds, b.styleMilliseconds], phases: [a.styles.phases, b.styles.phases], internedImageUrls: [a.styles.internedImageUrls, b.styles.internedImageUrls],
        interningAuditRecords: [a.styles.interningAudit, b.styles.interningAudit] },
      pixels: { ...pixels, heatmap: undefined }, baselineState: a.state, candidateState: b.state,
      runtimeErrors: { baseline: a.errors, candidate: b.errors, equal: sameErrors },
      verdict: !paths.length && a.styles.hash === b.styles.hash && pixels.pass && sameErrors ? 'PASS' : 'FAIL', artifacts: {} };
    for (const [side, cap] of [['baseline', a], ['candidate', b]]) {
      const path = `${prefix}.${side}.png`; writeFileSync(path, cap.screenshot);
      row.artifacts[side] = { path, sha256: digest(cap.screenshot) };
    }
    if (pixels.heatmap) {
      const path = `${prefix}.diff.png`; writeFileSync(path, pixels.heatmap);
      row.artifacts.heatmap = { path, sha256: digest(pixels.heatmap) };
    }
    if (paths.length) {
      row.styles.differences = detailOverride || await styleDetails(browsers, paths.slice(0, options.first), options.deep, captures);
      if (row.styles.differences.some(d => d.properties?.length === 0)) throw Error('Style hash differs but live details no longer match capture: ' + key);
    }
    report.rows.push(row); appendFileSync(join(options.out, 'progress.jsonl'), JSON.stringify(row) + '\n');
    console.log(`${row.verdict} ${report.rows.length}/${selected.count} ${key} styles=${paths.length} pixels=${pixels.diffPixels} raw=${pixels.rawDiffPixels}`);
  }
  async function worker(index) {
    const browsers = [];
    try {
      browsers.push(await deadline(createBrowser(inputs[0], telemetry), 'launch baseline'));
      if (options.concurrency > 1) browsers.push(await deadline(createBrowser(inputs[1], telemetry), 'launch candidate'));
      for (const browser of browsers) report.browsers.push({ worker: index, version: browser.version });
      let audit = true;
      for (;;) {
        const group = selected.groups[cursor++]; if (!group) break;
        console.log(`LOAD worker=${index} ${group.look} ${group.page.id} ${group.viewport.id}`);
        if (browsers.length === 1) {
          // One-browser mode replays the same state prefix for each side, avoiding state sharing.
          for (let s = 0; s < group.states.length; s++) {
            const caps = [];
            for (const input of inputs) {
              await deadline(loadGroup(browsers[0], group, input), 'serial load');
              for (const state of group.states.slice(0, s + 1)) await deadline(enterState(browsers[0], state, group), state.id);
              caps.push(await deadline(capture(browsers[0], audit, options.deep), 'serial capture', options.deep ? 1200000 : 180000));
            }
            let details;
            const paths = differingPaths(caps[0].styles.entries, caps[1].styles.entries).slice(0, options.first);
            if (paths.length && options.deep) {
              const right = await browsers[0].page.evaluate(paths => __pm7Parity.details(paths), paths);
              await loadGroup(browsers[0], group, inputs[0]);
              for (const state of group.states.slice(0, s + 1)) await enterState(browsers[0], state, group);
              const left = await browsers[0].page.evaluate(paths => __pm7Parity.details(paths), paths);
              details = formatStyleDetails(left, right, paths);
            }
            await compare(group, group.states[s], caps, browsers, details); audit = false;
          }
        } else {
          await deadline(Promise.all(browsers.map(browser => loadGroup(browser, group))), 'load group');
          for (const state of group.states) {
            await deadline(Promise.all(browsers.map(browser => enterState(browser, state, group))), 'enter ' + state.id);
            const caps = await deadline(Promise.all(browsers.map(browser => capture(browser, audit, options.deep))), 'capture ' + state.id, options.deep ? 1200000 : 180000);
            await compare(group, state, caps, browsers); audit = false;
          }
        }
      }
    } catch (error) {
      report.errors.push({ worker: index, error: String(error.stack || error) });
      cursor = selected.groups.length; console.error(error.stack || error);
    } finally {
      for (const browser of browsers) {
        await browser.close().catch(error => report.errors.push({ worker: index, cleanup: String(error) }));
        telemetry.live.delete(browser);
      }
    }
  }
  try { await Promise.all(Array.from({ length: options.concurrency === 1 ? 1 : Math.floor(options.concurrency / 2) }, (_, i) => worker(i))); }
  finally { clearInterval(interval); await sampleMemory(); }
  report.rows.sort((a, b) => a.id.localeCompare(b.id));
  report.wallSeconds = (Date.now() - started) / 1000;
  report.memory = { peakAggregateRssBytes: telemetry.peakRssBytes, peakNodeRssBytes: telemetry.peakNodeRssBytes, samples: telemetry.samples,
    method: '2-second RSS sum for harness, adapter children and Chrome SystemInfo process IDs; shared pages counted per process; Linux only' };
  report.renderers = [...telemetry.renderers];
  report.counts = { planned: selected.count, completed: report.rows.length, pass: report.rows.filter(r => r.verdict === 'PASS').length,
    fail: report.rows.filter(r => r.verdict === 'FAIL').length, errors: report.errors.length };
  report.verdict = report.errors.length || report.rows.length !== selected.count ? 'ERROR' : report.counts.fail ? 'FAIL' : 'PASS';
  writeFileSync(join(options.out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  const failed = report.rows.filter(r => r.verdict !== 'PASS');
  const summary = [`# PM7 parity: ${report.verdict}`, '', `Mode: ${report.mode}. Host: ${report.host}. GPU: ${report.renderers.join('; ')}.`, '',
    `States: ${report.counts.completed}/${selected.count}; PASS ${report.counts.pass}; FAIL ${report.counts.fail}; errors ${report.errors.length}.`,
    `Wall time: ${report.wallSeconds.toFixed(2)} s. Peak aggregate RSS: ${(telemetry.peakRssBytes / 2 ** 30).toFixed(2)} GiB (sampled every 2 s).`, '',
    '| Input | SHA-256 |', '|---|---|', ...report.input.map(i => `| ${i.path} | ${i.sha256} |`), '',
    `Matrix: ${selected.looks.length} looks × ${selected.pages.length} surfaces × ${selected.viewports.length} viewports; page-specific states in ${options.matrix}.`,
    options.deep ? 'Deep style hashes include all computed properties, hidden nodes, ::before/::after, form ::placeholder and list ::marker.' : 'Native style hashes include standard properties on layout nodes and generated pseudo nodes. All DOM paths are retained. Hidden nodes without layout and non-generated pseudo styles are unsampled; custom properties are excluded. Use --deep to inspect them.', '',
    ...(failed.length ? ['| State | Style elements | Pixels above tolerance | Raw differing pixels |', '|---|---:|---:|---:|', ...failed.map(r => `| ${r.id} | ${r.styles.differingElements} | ${r.pixels.diffPixels} | ${r.pixels.rawDiffPixels} |`), ''] : []),
    ...report.errors.map(e => `Harness error: ${e.error || e.cleanup}`), '',
    'See report.json and progress.jsonl for every state, full property differences and artifact SHA-256 values.',
    'Exact mode never retries, masks differences or increases tolerance automatically.', '', ...report.determinism.limits.map(l => '- ' + l), ''].join('\n');
  writeFileSync(join(options.out, 'summary.md'), summary);
  console.log(JSON.stringify({ verdict: report.verdict, ...report.counts, wallSeconds: report.wallSeconds, report: join(options.out, 'report.json') }));
  return report.verdict === 'ERROR' ? 2 : report.verdict === 'FAIL' ? 1 : 0;
}
export { createBrowser, loadGroup, enterState };
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) console.log(help);
    else process.exitCode = await run(options);
  } catch (error) { console.error(String(error.stack || error)); console.error(help); process.exitCode = 2; }
}
