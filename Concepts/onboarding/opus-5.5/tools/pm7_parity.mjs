#!/usr/bin/env node
/* PM7 page-wide exact style/pixel parity. Node >=22; browser admission/cleanup via chrome.mjs. */
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hostname } from 'node:os';
import { execFileSync } from 'node:child_process';
import { launch } from './pm7_parity_chrome.mjs';
import { installParityRuntime, normalizeBlobValue } from './pm7_parity_browser.mjs';
import { diffPng, baselineEnvelopePng } from './pm7_parity_png.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const help = `Usage: node pm7_parity.mjs BASELINE.html CANDIDATE.html [options]
  --out DIR                       JSON, Markdown, screenshots and heat maps
  --matrix FILE                   State data (default pm7_parity_states.json)
  --subset looks=a,b;pages=a,b;states=a,b;viewports=wide,narrow;motions=reduced,full
                                  Repeat --subset to combine filters; quote semicolons
  --concurrency N                 Browser/worker cap, default 4; integer 1..6
  --tolerance N                   RGBA channel delta allowed, default 0 (0..255)
  --max-diff-pixels N             Pixels above tolerance allowed, default 0
  --baseline-repeats N            Explicit measured pixel envelope, 2..8 baseline captures
                                  Default 1 (exact); cannot combine with tolerance or --deep
  --noise-max-channel-span N      Baseline channel-range cap, default 8 (0..255)
  --noise-max-pixels N            Variable baseline pixel cap; default 0.05% of viewport
  --first N                       First differing elements to detail, default 8
  --deep                          Exhaustive JS sampler, including hidden/custom styles (slow)
  --list                          Print selected matrix without opening browsers
  --help                          This help
Exit: 0 parity, 1 differences, 2 harness error. Styles always compare exactly.
GPU agent-browser sessions only. A pair stays on this host. No remote mode.
`;

export function parseArgs(argv) {
  const options = { concurrency: 4, tolerance: 0, maxDiffPixels: 0, baselineRepeats: 1, noiseMaxChannelSpan: 8, noiseMaxPixels: null, first: 8, filters: {},
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
          const match = /^(looks|pages|states|viewports|motions)=(.+)$/.exec(part);
          if (!match) throw Error('Subset must be looks=...;pages=...;states=...;viewports=...;motions=...');
          options.filters[match[1]] = [...new Set([...(options.filters[match[1]] || []), ...match[2].split(',')])];
        }
      } else if (['concurrency', 'tolerance', 'max-diff-pixels', 'baseline-repeats', 'noise-max-channel-span', 'noise-max-pixels', 'first'].includes(key)) {
        const number = Number(value);
        if (!Number.isSafeInteger(number) || number < 0) throw Error(`${arg} requires a nonnegative integer`);
        options[{ 'max-diff-pixels': 'maxDiffPixels', 'baseline-repeats': 'baselineRepeats', 'noise-max-channel-span': 'noiseMaxChannelSpan', 'noise-max-pixels': 'noiseMaxPixels' }[key] || key] = number;
      } else if (key === 'out' || key === 'matrix') options[key] = resolve(value);
      else throw Error(`Unknown option ${arg}`);
    } else files.push(resolve(arg));
  }
  if (options.concurrency < 1 || options.concurrency > 6 || options.tolerance > 255 || options.first < 1) throw Error('Invalid concurrency (1..6), tolerance (0..255) or first (>=1)');
  if (options.baselineRepeats < 1 || options.baselineRepeats > 8) throw Error('Invalid baseline repeats (1..8)');
  if (options.baselineRepeats > 1 && (options.tolerance || options.maxDiffPixels || options.deep)) throw Error('Baseline repeats cannot combine with tolerance or --deep');
  if (options.noiseMaxChannelSpan > 255) throw Error('Invalid noise channel cap (0..255)');
  if (!options.help && files.length !== 2) throw Error('Pass baseline and candidate file paths');
  [options.baseline, options.candidate] = files;
  options.out ||= resolve('/mnt/Cursor/PuppetMaster-Evidence/scratch/2026-10-18-pm7-purge/A0-parity', new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid);
  return options;
}
export function selectMatrix(matrix, filters) {
  if (matrix.version !== 1) throw Error('Unsupported state matrix version');
  const selected = {};
  for (const key of ['looks', 'pages', 'states', 'viewports', 'motions']) {
    const items = key === 'motions' ? matrix.motions || ['reduced'] : matrix[key];
    if (!Array.isArray(items) || !items.length) throw Error(`Empty matrix ${key}`);
    const id = x => typeof x === 'string' ? x : x.id;
    const ids = items.map(id);
    if (ids.some(x => !/^[a-z0-9-]+$/.test(x)) || new Set(ids).size !== ids.length) throw Error(`Invalid/duplicate ${key} IDs`);
    for (const name of filters[key] || []) if (!ids.includes(name)) throw Error(`Unknown ${key} subset: ${name}`);
    selected[key] = items.filter(x => !filters[key] || filters[key].includes(id(x)));
  }
  for (const look of selected.looks) if (!/^(basic|friendly|glass|retro|nier)-(dark|light)$/.test(look)) throw Error(`Unknown look ${look}`);
  const groups = [];
  for (const motion of selected.motions) for (const viewport of selected.viewports) {
    if (!['reduced', 'full'].includes(motion)) throw Error('Unknown motion mode ' + motion);
    if (![viewport.width, viewport.height].every(n => Number.isInteger(n) && n >= 200 && n <= 4096)) throw Error('Invalid viewport');
    for (const look of selected.looks) for (const page of selected.pages) {
      const states = selected.states.filter(s => (s.pages === '*' || s.pages.includes(page.id)) && (!s.motions || s.motions.includes(motion)));
      if (states.length) groups.push({ viewport, look, page, states, motion });
    }
  }
  if (!groups.length) throw Error('Subset selects no reachable states');
  return { ...selected, groups, count: groups.reduce((n, g) => n + g.states.length, 0) };
}
export function discoverCustomReads(sources) {
  const names = new Set(), prefixes = new Set(), declared = new Set();
  for (const text of sources) {
    for (const match of text.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) declared.add(match[1]);
    for (const match of text.matchAll(/\.getPropertyValue\s*\(\s*\\?(['"])(--[a-zA-Z0-9_-]+)\\?\1\s*([+)]?)/g)) {
      if (match[3] === '+' || match[2].endsWith('-')) prefixes.add(match[2]); else names.add(match[2]);
    }
    for (const match of text.matchAll(/\.getPropertyValue\s*\(\s*`(--[a-zA-Z0-9_-]+)\$\{/g)) prefixes.add(match[1]);
  }
  for (const name of declared) if ([...prefixes].some(prefix => name.startsWith(prefix))) names.add(name);
  return { names: [...names].sort(), prefixes: [...prefixes].sort() };
}
function deadline(promise, label, ms = 180_000) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(`Timeout: ${label}`)), ms); })]).finally(() => clearTimeout(timer));
}
function seedStorage(look, motion = 'reduced') {
  const [family, mode] = look.split('-');
  const title = value => value[0].toUpperCase() + value.slice(1);
  return { 'pm7:settings:tome-tabs:v1:tastebook': { settings: {
    'general.visual.theme': title(family === 'nier' ? 'basic' : family) + ' ' + title(mode),
    'general.visual.theme-mode': title(mode), 'general.visual.nier-mode': family === 'nier',
    'general.visual.reduce-animations': motion === 'reduced', 'general.audio.sound-enabled': false
  } } };
}
async function configurePage(browser) {
    const page = browser.page;
    await page.bringToFront();
    if (process.env.PM7_PARITY_DEBUG) page.on('Runtime.consoleAPICalled', e => {
      if (e.args[0]?.value === 'PM7_PARITY_SNAPSHOT') console.log(e.args.map(a => a.value).join(' '));
    });
    await page.send('Network.enable');
    // CDP blocked-URL globs also match text inside data: SVG URLs (for example
    // an http:// namespace). Fetch below tests the actual scheme instead.
    await page.send('Network.setBlockedURLs', { urls: [] });
    await page.send('Emulation.setTimezoneOverride', { timezoneId: 'UTC' });
    await page.send('Emulation.setLocaleOverride', { locale: 'en-US' });
    await page.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await page.send('Animation.enable'); await page.send('Animation.setPlaybackRate', { playbackRate: 0 });
    const interceptErrors = browser.interceptErrors = [];
    const requests = new Map(); browser.blocked = new Set(); browser.failedRequests = [];
    browser.currentUrl = 'file:///__pm7_parity__/input.html?o55=off&o55scenario=fresh&pm-warm=0';
    page.on('Network.requestWillBeSent', e => requests.set(e.requestId, e.request.url));
    page.on('Network.loadingFinished', e => requests.delete(e.requestId));
    page.on('Network.loadingFailed', e => {
      const url = requests.get(e.requestId); requests.delete(e.requestId);
      if (url && !url.startsWith('file:///__pm7_parity_asset__/')) browser.failedRequests.push({ url, error: e.errorText, blockedReason: e.blockedReason || null });
    });
    page.on('Fetch.requestPaused', event => {
      const uri = event.request.url;
      let request;
      if (event.resourceType === 'Document' && uri === browser.currentUrl) {
        request = page.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 200,
          responseHeaders: [{ name: 'Content-Type', value: 'text/html; charset=utf-8' }],
          body: browser.storageProbe ? Buffer.from('<!doctype html><title>Storage isolation probe</title>').toString('base64') : browser.input.body });
      } else if (/^(?:data:|blob:|file:)/.test(uri) && !uri.startsWith('file:///__pm7_parity_asset__/')) {
        request = page.send('Fetch.continueRequest', { requestId: event.requestId });
      } else {
        if (!uri.startsWith('file:///__pm7_parity_asset__/')) browser.blocked.add(uri);
        request = page.send('Fetch.failRequest', { requestId: event.requestId, errorReason: 'BlockedByClient' });
      }
      request.catch(error => interceptErrors.push(String(error)));
    });
    await page.send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
}
async function assertEmptyStorage(browser) {
  browser.storageProbe = true;
  try { await browser.page.goto(browser.currentUrl); } finally { browser.storageProbe = false; }
  const { frameTree } = await browser.page.send('Page.getFrameTree');
  const { storageKey } = await browser.page.send('Storage.getStorageKeyForFrame', { frameId: frameTree.frame.id });
  const { databaseNames } = await browser.page.send('IndexedDB.requestDatabaseNames', { storageKey });
  const { cookies } = await browser.send('Storage.getCookies', { browserContextId: browser.contextId });
  const storage = await browser.page.evaluate(async () => {
    const unavailable = [];
    const check = async (name, fn) => { try { return await fn(); } catch (e) { unavailable.push(name + ':' + e.name); return null; } };
    return { localStorage: localStorage.length, sessionStorage: sessionStorage.length,
      cacheKeys: await check('CacheStorage', () => caches.keys()),
      serviceWorkers: await check('ServiceWorker', async () => navigator.serviceWorker ? (await navigator.serviceWorker.getRegistrations()).length : 0), unavailable };
  });
  if (databaseNames.length || cookies.length || storage.localStorage || storage.sessionStorage || storage.cacheKeys?.length || storage.serviceWorkers) throw Error('Fresh context contains persistent storage: ' + JSON.stringify({ databaseNames, cookies: cookies.length, ...storage }));
  browser.storageAudit = { freshContext: true, databaseNames, cookieCount: cookies.length, ...storage };
}
async function createBrowser(input, telemetry) {
  const browser = await launch({ width: 1600, height: 900, scale: 1 });
  telemetry.live.add(browser); browser.input = input;
  try {
    const info = await browser.send('SystemInfo.getInfo');
    const renderer = info.gpu?.auxAttributes?.glRenderer || info.gpu?.devices?.map(d => d.deviceString).join('; ');
    if (!renderer || /swiftshader|llvmpipe|software/i.test(renderer)) throw Error('GPU renderer required: ' + renderer);
    telemetry.renderers.add(renderer);
    browser.version = await browser.send('Browser.getVersion');
    return browser;
  } catch (error) { await browser.close(); telemetry.live.delete(browser); throw error; }
}
async function loadGroup(browser, group, input = browser.input) {
  browser.input = input;
  await browser.resetContext(); await configurePage(browser);
  await assertEmptyStorage(browser);
  const motion = group.motion || 'reduced';
  const config = { epoch: 1789000000000, seed: 0x9e3779b9, storage: seedStorage(group.look, motion) };
  const init = await browser.page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(${installParityRuntime.toString()})(${JSON.stringify(config)}, ${normalizeBlobValue.toString()})` });
  browser.initId = init.identifier;
  await browser.page.setViewport(group.viewport.width, group.viewport.height);
  // A pointer left over a menu control can populate hidden tooltip DOM on reload.
  await browser.page.mouse(1, 1, { down: false, up: false });
  await browser.page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: motion === 'reduced' ? 'reduce' : 'no-preference' }, { name: 'prefers-color-scheme', value: group.look.endsWith('-light') ? 'light' : 'dark' }] });
  await browser.page.goto(browser.currentUrl);
  await browser.page.evaluate(async () => {
    if (!window.__pm7Parity) throw Error('Runtime was not installed');
    await __pm7Parity.settle(5000);
    if (!(window.PM_THEME && window.PM_NIER && window.PM_PAGES && window.O55)) throw Error('PM7 APIs missing');
    if (window.PM_WARM && !PM_WARM.state().off) throw Error('Idle GPU prewarming did not stop');
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, async img => { if (!img.complete) await img.decode().catch(() => {}); }));
    if (window.PM_DEMO?.clock?.pause) PM_DEMO.clock.pause();
    // Font completion schedules terminal metrics/ResizeObserver work. Flush that
    // while Home is still visible, before a route can hide its terminal gutter.
    await __pm7Parity.settle(1000);
  });
  await browser.page.evaluate(async (route, prepare, look, motion) => {
    const [family, mode] = look.split('-');
    PM_NIER.setTransition(repaint => repaint());
    PM7_SETTINGS_TOME.setChromeThemeFamily(family === 'nier' ? 'basic' : family);
    PM7_SETTINGS_TOME.setChromeThemeMode(mode);
    PM12_KIMI.setSettingFromHost('general.visual.reduce-animations', motion === 'reduced');
    if (PM_NIER.wanted() !== (family === 'nier')) PM_NIER.set(family === 'nier', { sound: false });
    PM_PAGES.go(route);
    if (prepare) (0, eval)(prepare);
    await document.fonts.ready;
    await __pm7Parity.settle(1200);
    const root = document.documentElement;
    if (root.getAttribute('data-theme') !== (family === 'nier' ? 'basic' : family) + '-' + mode || PM_NIER.on() !== (family === 'nier')) throw Error('Requested look did not paint: ' + look);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches !== (motion === 'reduced') || (root.getAttribute('data-motion') === 'reduced') !== (motion === 'reduced')) throw Error('Motion mode did not apply: ' + motion);
  }, group.page.route, group.page.prepare || '', group.look, motion);
  await visible(browser.page, group.page.assert, 'page ' + group.page.id);
}
async function loadPreparedGroup(browser, group, input) {
  await loadGroup(browser, group, input);
  // Preview/terminal canvases measure their fonts during construction. A cold
  // first navigation can cache fallback metrics even after fonts.ready resolves.
  // Warm every declared face and paint once, then measure a fresh navigation on
  // both sides. This fixed preparation is applied before every input/group.
  await browser.page.evaluate(async () => {
    await Promise.all(Array.from(document.fonts, face => face.load()));
    await document.fonts.ready;
    await __pm7Parity.settle(1000);
  });
  await browser.page.screenshot();
  await loadGroup(browser, group, input);
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
        if (!el.matches(':focus-visible')) throw Error('Keyboard focus did not activate :focus-visible');
      }, step.selector);
    } else if (step.action === 'click' || step.action === 'hover') {
      const pt = await point(page, step.selector);
      await page.mouse(pt.x, pt.y, { down: step.action === 'click', up: step.action === 'click' });
    } else throw Error('Unknown state action ' + step.action);
    await page.evaluate(() => __pm7Parity.settle(600));
  }
  await page.evaluate(() => __pm7Parity.settle(600));
  if (state.assert) await visible(page, state.assert, state.id);
  if (state.check && !(await page.evaluate(state.check))) throw Error('State ownership/readiness assertion failed: ' + state.id);
}
async function nativeSnapshot(browser) {
  const start = performance.now();
  if (process.env.PM7_PARITY_DEBUG) console.log('NATIVE property names');
  browser.standardProperties ||= await browser.page.evaluate(() => Array.from(getComputedStyle(document.documentElement)).filter(p => !p.startsWith('--')).sort());
  const namesDone = performance.now();
  const snapshot = await browser.page.send('DOMSnapshot.captureSnapshot', { computedStyles: browser.standardProperties, includeDOMRects: true });
  const blobIdentities = await browser.page.evaluate(() => __pm7Parity.blobIdentities());
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
    if (byPath.has(path)) throw Error('Non-unique native DOM path: ' + path);
    const indices = layoutStyles.get(i);
    let vector = null;
    if (indices) {
      const key = indices.join(','); vector = vectors.get(key);
      if (!vector) {
        if (indices.length !== browser.standardProperties.length) throw Error('Incomplete native property vector');
        const rawValues = indices.map(index => strings[index] ?? null), values = rawValues.map(value => normalizeBlobValue(value, blobIdentities));
        vector = { values, rawValues, hash: digest(namesHash + '\0' + JSON.stringify(values)) }; vectors.set(key, vector);
      }
    }
    byPath.set(path, vector); elements.push([path, vector?.hash || absentHash]);
  }
  const customStart = performance.now();
  const rootCustomNames = await browser.page.evaluate(() => Array.from(getComputedStyle(document.documentElement)).filter(p => p.startsWith('--')));
  const runtimeReadNames = await browser.page.evaluate(() => __pm7Parity.readCustomProperties());
  const policy = browser.customReads || { names: [], prefixes: [] };
  const customNames = [...new Set([...policy.names, ...runtimeReadNames, ...rootCustomNames.filter(name => policy.prefixes.some(prefix => name.startsWith(prefix)))])].sort();
  const layoutPaths = elements.filter(([path]) => byPath.get(path)).map(([path]) => path);
  const custom = customNames.length ? await browser.page.evaluate((names, paths) => __pm7Parity.customSnapshot(names, paths), customNames, layoutPaths)
    : { names: [], values: [], styles: [], rows: [], unmatchedLayoutPaths: [], internedImageUrls: 0, auditRecords: 0 };
  Object.assign(blobIdentities, await browser.page.evaluate(() => __pm7Parity.blobIdentities()));
  const customDone = performance.now();
  const normalized = custom.values.map(value => normalizeBlobValue(value, blobIdentities));
  const valueHashes = normalized.map(value => digest(value));
  const customNameHash = digest(JSON.stringify(customNames));
  const customVectors = custom.styles.map(ids => ({ rawValues: ids.map(id => custom.values[id]), values: ids.map(id => normalized[id]),
    hash: digest(customNameHash + '\0' + ids.map(id => valueHashes[id]).join('')) }));
  const customByPath = new Map(custom.rows.map(([path, index]) => [path, customVectors[index]]));
  const propertyNames = [...browser.standardProperties, ...customNames];
  const entries = elements.map(([path, hash]) => {
    const standard = byPath.get(path); if (!standard) return [path, hash];
    const extra = customByPath.get(path), absent = customNames.map(() => null);
    const vector = { values: [...standard.values, ...(extra?.values || absent)], rawValues: [...standard.rawValues, ...(extra?.rawValues || absent)],
      hash: customNames.length ? digest(standard.hash + '\0' + (extra?.hash || 'custom-unavailable')) : standard.hash };
    byPath.set(path, vector); return [path, vector.hash];
  });
  browser.nativeDetails = byPath;
  return { hash: digest(JSON.stringify(entries)), entries, propertyNames, elements: nodes.nodeType.filter(t => t === 1).length,
    uniqueStyles: new Set(entries.map(e => e[1])).size, internedImageUrls: custom.internedImageUrls, interningAudit: custom.auditRecords, blobIdentities,
    customSampling: { names: customNames, runtimeReadNames, sampledRecords: custom.rows.length, unmatchedLayoutPaths: custom.unmatchedLayoutPaths },
    styledRecords: elements.filter(([path]) => byPath.get(path) !== null).length,
    unstyledDomRecords: elements.filter(([path]) => byPath.get(path) === null).length,
    phases: { names: namesDone - start, response: responseDone - namesDone, standardHash: customStart - responseDone,
      customCSSOM: customDone - customStart, hash: performance.now() - customDone } };
}
async function prepareCapture(browser) {
  await browser.page.bringToFront();
  await browser.page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, async image => { if (!image.complete) await image.decode().catch(() => {}); }));
    await __pm7Parity.settle(0);
  });
}
async function capture(browser, audit, deep) {
  if (browser.interceptErrors.length) throw Error(browser.interceptErrors.join('\n'));
  await prepareCapture(browser);
  if (process.env.PM7_PARITY_DEBUG) console.log('CAPTURE screenshot start');
  const screenshot = await browser.page.screenshot();
  if (process.env.PM7_PARITY_DEBUG) console.log('CAPTURE screenshot done');
  const styleStarted = performance.now();
  let styles;
  await browser.page.evaluate(() => __pm7Parity.setCaretHidden(false));
  try { styles = deep ? await browser.page.evaluate(async audit => __pm7Parity.snapshot(audit), audit) : await nativeSnapshot(browser); }
  finally { await browser.page.evaluate(() => __pm7Parity.setCaretHidden(true)); }
  const styleMilliseconds = performance.now() - styleStarted;
  const state = await browser.page.evaluate(() => ({ time: __pm7Parity.now, theme: document.documentElement.getAttribute('data-theme'),
    motion: document.documentElement.getAttribute('data-motion'), reducedMedia: matchMedia('(prefers-reduced-motion: reduce)').matches,
    nier: PM_NIER.on(), page: PM_PAGES.current, focus: document.activeElement?.id || document.activeElement?.className || '',
    fonts: document.fonts.status, idlePrewarmingOff: window.PM_WARM?.state().off ?? null,
    viewport: [innerWidth, innerHeight, devicePixelRatio] }));
  const rawSpecialRules = await browser.page.evaluate(() => __pm7Parity.specialRules());
  const identities = await browser.page.evaluate(() => __pm7Parity.blobIdentities());
  const specialRules = rawSpecialRules.map(rule => ({ ...rule, text: normalizeBlobValue(rule.text, identities) }));
  const canonicalUrl = url => identities[url] || (url.startsWith('data:') ? 'data:sha256:' + digest(url) : url);
  const runtimeBlocked = await browser.page.evaluate(() => __pm7Parity.blockedRequests());
  const requests = { blocked: [...new Set([...browser.blocked, ...runtimeBlocked])].map(canonicalUrl).sort(),
    failed: browser.failedRequests.map(item => ({ ...item, url: canonicalUrl(item.url) })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) };
  return { screenshot, styles, state, styleMilliseconds, nativeDetails: deep ? null : browser.nativeDetails,
    specialRules, specialRuleHash: digest(JSON.stringify(specialRules)), requests, storageAudit: browser.storageAudit,
    errors: [...new Set(browser.page.errors)] };
}
export function differingPaths(a, b) {
  const left = new Map(a), right = new Map(b);
  return [...new Set([...left.keys(), ...right.keys()])].filter(path => left.get(path) !== right.get(path));
}
async function readDeepDetails(browser, paths) {
  return browser.page.evaluate(paths => {
    __pm7Parity.setCaretHidden(false);
    try { return __pm7Parity.details(paths); } finally { __pm7Parity.setCaretHidden(true); }
  }, paths);
}
async function styleDetails(browsers, paths, deep, captures) {
  const [a, b] = deep ? await Promise.all(browsers.map(browser => readDeepDetails(browser, paths))) : (captures || browsers).map((capture, i) => paths.map(path => {
    const records = capture.nativeDetails, record = records.get(path);
    return !records.has(path) ? { path, absent: true } : { path, label: path,
      properties: record ? Object.fromEntries((capture.styles.propertyNames || (browsers[i] || browsers[0]).standardProperties).map((name, j) => [name, record.values[j]])) : null,
      rawProperties: record ? Object.fromEntries((capture.styles.propertyNames || (browsers[i] || browsers[0]).standardProperties).map((name, j) => [name, record.rawValues[j]])) : null };
  }));
  return formatStyleDetails(a, b, paths);
}
function formatStyleDetails(a, b, paths) {
  return paths.map((path, i) => {
    const x = a[i], y = b[i];
    if (x.absent || y.absent) return { path, baseline: x.absent ? 'absent' : x.label, candidate: y.absent ? 'absent' : y.label };
    if (!x.properties || !y.properties) return { path, baseline: x.properties ? 'layout style present' : 'no layout style', candidate: y.properties ? 'layout style present' : 'no layout style' };
    const properties = [...new Set([...Object.keys(x.properties), ...Object.keys(y.properties)])].filter(name => x.properties[name] !== y.properties[name]);
    return { path, baseline: x.label, candidate: y.label, properties: properties.map(property => ({ property, baseline: x.properties[property] ?? null, candidate: y.properties[property] ?? null,
      ...(x.rawProperties && x.rawProperties[property] !== x.properties[property] ? { baselineRaw: x.rawProperties[property] } : {}),
      ...(y.rawProperties && y.rawProperties[property] !== y.properties[property] ? { candidateRaw: y.rawProperties[property] } : {}) })) };
  });
}
async function run(options) {
  const started = Date.now(), matrix = JSON.parse(readFileSync(options.matrix, 'utf8'));
  const selected = selectMatrix(matrix, options.filters);
  if (options.list) { console.log(JSON.stringify(selected, null, 2)); return 0; }
  const inputs = [options.baseline, options.candidate].map(path => {
    const bytes = readFileSync(path); return { path, sha256: digest(bytes), bytes: bytes.length, body: bytes.toString('base64') };
  });
  const customReads = discoverCustomReads([readFileSync(options.baseline, 'utf8'), readFileSync(options.candidate, 'utf8')]);
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
  let gitHead = null;
  try { gitHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: resolve(here, '../../../..'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
  const sourceFiles = ['pm7_parity.mjs', 'pm7_parity_browser.mjs', 'pm7_parity_chrome.mjs', 'pm7_parity_png.mjs', 'cdp-websocket.mjs'];
  const report = { version: 1, started: new Date(started).toISOString(), host: hostname(), input: inputs.map(({ body, ...rest }) => rest),
    harness: { gitHead, files: sourceFiles.map(name => ({ name, sha256: digest(readFileSync(join(here, name))) })) },
    matrix: { path: options.matrix, sha256: digest(readFileSync(options.matrix)), looks: selected.looks,
      pages: selected.pages.map(p => p.id), states: selected.states.map(s => s.id), viewports: selected.viewports, motions: selected.motions, planned: selected.count },
    customPropertyReads: customReads,
    options: { concurrency: options.concurrency, browserCap: options.concurrency,
      tolerance: options.tolerance, maxDiffPixels: options.maxDiffPixels, baselineRepeats: options.baselineRepeats,
      noiseMaxChannelSpan: options.noiseMaxChannelSpan, noiseMaxPixels: options.noiseMaxPixels ?? 'ceil(viewport pixels * 0.0005)', first: options.first, deep: !!options.deep },
    mode: options.baselineRepeats > 1 ? 'explicit measured baseline pixel envelope; exact styles' : options.tolerance || options.maxDiffPixels ? 'explicit pixel tolerance; exact styles' : 'exact',
    determinism: { epoch: 1789000000000, seed: '0x9e3779b9', clock: 'manual deterministic timers/rAF; Date, performance.now, document.timeline and Event.timeStamp share clock',
      animations: 'CDP playback rate 0; finite animations finished, infinite paused at 0; SVG paused at 0', motionModes: selected.motions,
      storage: 'fresh browser context per load; IndexedDB/cookies/local/session/cache/service-worker emptiness checked on inert same-origin probe before real navigation; local/session seeded before app code', network: 'only file:, data: and blob: allowed; blocked/failed requests recorded and compared',
      documentUrl: 'same intercepted file: URL on both sides; source bytes supplied unmodified',
      pairing: 'one browser per worker; baseline group then candidate group with identical state prefixes; shared GPU process',
      idlePrewarming: 'disabled through the page-owned pm-warm=0 test hook; transient shader warm-up DOM is never started',
      baselineEnvelope: options.baselineRepeats > 1 ? `${options.baselineRepeats} baseline captures for raw-pixel failures with exact styles; same-browser navigation replays, per-pixel RGBA ranges, every repeat must have identical styles/state/errors; original candidate proof capture never retried/replaced` : 'disabled; zero pixel allowance in exact mode',
      styleHash: options.deep ? 'Deep: SHA256 over DOM paths and per-vector SHA256 over sorted property names and original-value SHA256; all elements incl hidden and open shadow roots' : 'DOMSnapshot standard computed properties plus CSSOM sample of JS-read custom properties from both inputs on accessible layout elements/generated pseudos; other custom properties excluded; all DOM paths retained',
      caret: 'hidden for screenshots only; override disabled for native/deep style capture and diagnostics',
      specialPseudoRules: 'serialized CSSOM rule guard for selection, scrollbar, slider and search pseudos; differences reported independently of visible layout styles',
      imageInterning: 'temporary lossless CSSOM image URL interning for custom/deep sampling; original values reconstructed before hashing; direct audit before each custom sample and first deep capture',
      blobUrls: 'Opaque Blob URL identifiers canonicalized by SHA256 of exact bytes and MIME type; fragments preserved; unknown Blob URLs are errors',
      limits: ['Viewport screenshots, not offscreen scroll contents. DPR 1 only; high-resolution media rules are not exercised.', 'Closed shadow-root completeness is not asserted; CSSOM custom sampling covers accessible layout elements/generated pseudos and reports unmatched layout paths. Child frames are unsupported.',
        'Checks only listed reachable states, not every possible interaction.', 'No cross-host pixel equivalence claimed.',
        'Full-motion coverage is the declared rest/menu/popover subset; hover and focus remain reduced-motion cases. Add states before removing other rule families.',
        'Fresh self-contained PM7 inputs required; relative external files resolve from the shared intercepted URL.',
        'Manual clock freezes live data and decorative motion; animation timing itself is outside this parity check.',
        ...(options.deep ? [] : ['Native mode excludes custom properties not read by JS and cannot sample computed properties of nodes without layout objects or non-generated pseudos. Use --deep for these.'])] },
    rows: [], errors: [], browsers: [] };
  let cursor = 0;
  async function replayPrefix(browser, group, input, through, takeCapture) {
    await deadline(loadPreparedGroup(browser, group, input), 'noise replay load');
    for (let i = 0; i <= through; i++) {
      await deadline(enterState(browser, group.states[i], group), 'noise replay ' + group.states[i].id);
      if (i === through && takeCapture) return deadline(capture(browser, false, false), 'noise baseline capture');
      await prepareCapture(browser); await browser.page.screenshot();
    }
  }
  async function completeSequence(browser, group, after) {
    for (const state of group.states.slice(after + 1)) {
      await deadline(enterState(browser, state, group), 'noise sequence ' + state.id);
      await prepareCapture(browser); await browser.page.screenshot();
    }
  }
  async function measureNoise(browser, group, state, baseline, candidate, prefix) {
    const samples = [], hashes = [baseline.styles.hash], artifacts = {}, stateIndex = group.states.findIndex(s => s.id === state.id);
    let stable = true;
    const instability = [];
    // Each navigation follows the full group sequence, including open overlays.
    // A prefix-only repeat would give the GPU a different preceding paint history.
    await completeSequence(browser, group, stateIndex);
    for (let n = 2; n <= options.baselineRepeats; n++) {
      console.log(`NOISE ${group.look} ${group.page.id} ${state.id} ${group.viewport.id} baseline=${n}/${options.baselineRepeats}`);
      const sample = await replayPrefix(browser, group, inputs[0], stateIndex, true);
      const same = sample.styles.hash === baseline.styles.hash && JSON.stringify(sample.state) === JSON.stringify(baseline.state)
        && JSON.stringify(sample.errors) === JSON.stringify(baseline.errors) && sample.specialRuleHash === baseline.specialRuleHash
        && JSON.stringify(sample.requests) === JSON.stringify(baseline.requests);
      stable &&= same; hashes.push(sample.styles.hash); samples.push(sample.screenshot);
      if (!same) {
        const paths = differingPaths(baseline.styles.entries, sample.styles.entries);
        instability.push({ sample: n, state: sample.state, errors: sample.errors, requests: sample.requests,
          specialRuleHash: sample.specialRuleHash, differingElements: paths.length,
          differences: await styleDetails([browser, browser], paths.slice(0, options.first), false, [baseline, sample]) });
      }
      const path = `${prefix}.noise-baseline-${n}.png`; writeFileSync(path, sample.screenshot);
      artifacts['baseline' + n] = { path, sha256: digest(sample.screenshot) };
      await completeSequence(browser, group, stateIndex);
    }
    const envelope = baselineEnvelopePng(baseline.screenshot, candidate.screenshot, samples);
    for (const [name, bytes] of [['low', envelope.lowPng], ['high', envelope.highPng], ['heatmap', envelope.heatmap]]) {
      const path = `${prefix}.noise-${name}.png`; writeFileSync(path, bytes); artifacts[name] = { path, sha256: digest(bytes) };
    }
    delete envelope.lowPng; delete envelope.highPng; delete envelope.heatmap;
    const caps = { channelSpan: options.noiseMaxChannelSpan, variablePixels: options.noiseMaxPixels ?? Math.ceil(group.viewport.width * group.viewport.height * 0.0005) };
    const withinCaps = envelope.maxObservedChannelSpan <= caps.channelSpan && envelope.noisePixels <= caps.variablePixels;
    // Continue the candidate sequence at the exact original state/clock. Its
    // measured screenshot is never replaced by this restoration navigation.
    await replayPrefix(browser, group, inputs[1], stateIndex, false);
    return { requested: options.baselineRepeats, applied: true, ...envelope, caps, baselineWithinCaps: withinCaps,
      unstableBaseline: !stable || !withinCaps, baselineStylesAndStateStable: stable,
      baselineStyleHashes: hashes, instability, artifacts, pass: stable && withinCaps && envelope.pass };
  }
  async function compare(group, state, captures, browsers, detailOverride) {
    const [a, b] = captures, key = `${group.look}--${group.page.id}--${state.id}--${group.viewport.id}--${group.motion}`;
    const prefix = join(options.out, 'states', key);
    const pixels = diffPng(a.screenshot, b.screenshot, options.tolerance, options.maxDiffPixels);
    const paths = differingPaths(a.styles.entries, b.styles.entries);
    const sameErrors = JSON.stringify(a.errors) === JSON.stringify(b.errors);
    const sameState = JSON.stringify(a.state) === JSON.stringify(b.state), sameRequests = JSON.stringify(a.requests) === JSON.stringify(b.requests);
    const sameRules = a.specialRuleHash === b.specialRuleHash;
    const sameBehavior = sameErrors && sameState && sameRequests && sameRules;
    const domOnlyPaths = options.deep ? [] : paths.filter(path => !a.nativeDetails.get(path) && !b.nativeDetails.get(path));
    const row = { id: key, look: group.look, page: group.page.id, state: state.id, viewport: group.viewport, motion: group.motion,
      styles: { baseline: a.styles.hash, candidate: b.styles.hash, differingElements: paths.length,
        baselineElements: a.styles.elements, candidateElements: b.styles.elements, styleRecords: [a.styles.entries.length, b.styles.entries.length],
        pseudoRecords: [a.styles.entries.filter(([path]) => path.includes('::')).length, b.styles.entries.filter(([path]) => path.includes('::')).length],
        uniqueStyles: [a.styles.uniqueStyles, b.styles.uniqueStyles], sampling: options.deep ? 'deep CSSOM including custom and hidden styles' : 'native standard styles plus CSSOM JS-read custom values on accessible layout nodes; all DOM paths retained',
        styledRecords: [a.styles.styledRecords, b.styles.styledRecords], unstyledDomRecords: [a.styles.unstyledDomRecords, b.styles.unstyledDomRecords],
        nonRenderedDomOnlyDifferences: options.deep ? null : domOnlyPaths.length, nonRenderedDomOnlyPaths: domOnlyPaths.slice(0, options.first),
        layoutStyleDifferences: options.deep ? null : paths.length - domOnlyPaths.length,
        customSampling: [a, b].map(cap => cap.styles.customSampling ? { propertyCount: cap.styles.customSampling.names.length,
          runtimeReadNames: cap.styles.customSampling.runtimeReadNames,
          sampledRecords: cap.styles.customSampling.sampledRecords, unmatchedCount: cap.styles.customSampling.unmatchedLayoutPaths.length,
          unmatchedPaths: cap.styles.customSampling.unmatchedLayoutPaths.slice(0, options.first) } : null),
        milliseconds: [a.styleMilliseconds, b.styleMilliseconds], phases: [a.styles.phases, b.styles.phases], blobIdentities: [a.styles.blobIdentities, b.styles.blobIdentities], internedImageUrls: [a.styles.internedImageUrls, b.styles.internedImageUrls],
        interningAuditRecords: [a.styles.interningAudit, b.styles.interningAudit] },
      pixels: { ...pixels, heatmap: undefined }, baselineState: a.state, candidateState: b.state,
      runtimeErrors: { baseline: a.errors, candidate: b.errors, equal: sameErrors },
      stateEqual: sameState, requests: { baseline: a.requests, candidate: b.requests, equal: sameRequests },
      storageAudit: { baseline: a.storageAudit, candidate: b.storageAudit },
      specialRuleGuard: { baseline: a.specialRuleHash, candidate: b.specialRuleHash, equal: sameRules,
        differences: sameRules ? [] : Array.from({ length: Math.max(a.specialRules.length, b.specialRules.length) }, (_, index) => ({ index, baseline: a.specialRules[index] || null, candidate: b.specialRules[index] || null }))
          .filter(item => JSON.stringify(item.baseline) !== JSON.stringify(item.candidate)).slice(0, options.first) },
      rawExactVerdict: !paths.length && a.styles.hash === b.styles.hash && !pixels.rawDiffPixels && sameBehavior ? 'PASS' : 'FAIL',
      verdict: !paths.length && a.styles.hash === b.styles.hash && pixels.pass && sameBehavior ? 'PASS' : 'FAIL', artifacts: {} };
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
    if (options.baselineRepeats > 1) {
      row.pixelNoise = pixels.rawDiffPixels && !paths.length && a.styles.hash === b.styles.hash && sameBehavior
        ? await measureNoise(browsers[0], group, state, a, b, prefix)
        : { requested: options.baselineRepeats, applied: false, reason: paths.length || a.styles.hash !== b.styles.hash || !sameBehavior ? 'style/state/request/rule difference; no pixel allowance' : 'pixels already exact' };
      if (row.pixelNoise.applied && row.pixelNoise.pass) row.verdict = 'PASS-MEASURED';
    }
    if (row.verdict === 'PASS' && row.rawExactVerdict === 'FAIL') row.verdict = 'PASS-TOLERANT';
    row.rawExactReasons = [paths.length || a.styles.hash !== b.styles.hash ? 'style' : null, pixels.rawDiffPixels ? 'pixels' : null,
      !sameState ? 'state' : null, !sameErrors ? 'runtime-errors' : null, !sameRequests ? 'requests' : null,
      !sameRules ? 'special-pseudo-rules' : null].filter(Boolean);
    row.verdictReasons = row.verdict === 'FAIL' && row.pixelNoise?.applied
      ? [...row.rawExactReasons, row.pixelNoise.unstableBaseline ? 'unstable-baseline' : 'outside-baseline-envelope'] : row.rawExactReasons;
    report.rows.push(row); appendFileSync(join(options.out, 'progress.jsonl'), JSON.stringify(row) + '\n');
    console.log(`${row.verdict} ${report.rows.length}/${selected.count} ${key} styles=${paths.length} pixels=${pixels.diffPixels} raw=${pixels.rawDiffPixels}${row.pixelNoise?.applied ? ' envelope=' + (row.pixelNoise.pass ? 'PASS' : 'FAIL') : ''}`);
  }
  async function worker(index) {
    const browsers = [];
    try {
      browsers.push(await deadline(createBrowser(inputs[0], telemetry), 'launch baseline'));
      browsers[0].customReads = customReads;
      for (const browser of browsers) {
        report.browsers.push({ worker: index, sessionId: browser.session.id, pid: browser.chrome.pid, version: browser.version });
        console.log(`BROWSER worker=${index} session=${browser.session.id} pid=${browser.chrome.pid}`);
      }
      const browser = browsers[0];
      let audit = true;
      for (;;) {
        const group = selected.groups[cursor++]; if (!group) break;
        console.log(`LOAD worker=${index} ${group.look} ${group.page.id} ${group.viewport.id} ${group.motion}`);
        if (options.deep) {
          // Deep diagnostics need the live CSSOM. Replay each side's exact prefix,
          // restoring the baseline only when a differing property needs details.
          for (let s = 0; s < group.states.length; s++) {
            const caps = [];
            for (const input of inputs) {
              await deadline(loadPreparedGroup(browsers[0], group, input), 'serial load');
              for (const state of group.states.slice(0, s + 1)) await deadline(enterState(browsers[0], state, group), state.id);
              caps.push(await deadline(capture(browsers[0], audit, options.deep), 'serial capture', options.deep ? 1200000 : 180000));
            }
            let details;
            const paths = differingPaths(caps[0].styles.entries, caps[1].styles.entries).slice(0, options.first);
            if (paths.length && options.deep) {
              const right = await readDeepDetails(browsers[0], paths);
              await loadPreparedGroup(browsers[0], group, inputs[0]);
              for (const state of group.states.slice(0, s + 1)) await enterState(browsers[0], state, group);
              await prepareCapture(browsers[0]);
              const left = await readDeepDetails(browsers[0], paths);
              details = formatStyleDetails(left, right, paths);
            }
            await compare(group, group.states[s], caps, browsers, details); audit = false;
          }
        } else {
          // Chrome GPU processes can rasterize a few Glass edge pixels differently.
          // Keep both inputs in one browser; reload/reset storage between them and
          // replay the same ordered states. Native captures retain their own details.
          const baseline = [];
          await deadline(loadPreparedGroup(browser, group, inputs[0]), 'load baseline group');
          for (const state of group.states) {
            await deadline(enterState(browser, state, group), 'enter baseline ' + state.id);
            baseline.push(await deadline(capture(browser, false, false), 'capture baseline ' + state.id));
          }
          await deadline(loadPreparedGroup(browser, group, inputs[1]), 'load candidate group');
          for (let i = 0; i < group.states.length; i++) {
            const state = group.states[i];
            await deadline(enterState(browser, state, group), 'enter candidate ' + state.id);
            const candidate = await deadline(capture(browser, false, false), 'capture candidate ' + state.id);
            await compare(group, state, [baseline[i], candidate], [browser, browser]);
            baseline[i] = null; audit = false;
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
  try { await Promise.all(Array.from({ length: options.concurrency }, (_, i) => worker(i))); }
  finally { clearInterval(interval); await sampleMemory(); }
  report.rows.sort((a, b) => a.id.localeCompare(b.id));
  report.wallSeconds = (Date.now() - started) / 1000;
  report.memory = { peakAggregateRssBytes: telemetry.peakRssBytes, peakNodeRssBytes: telemetry.peakNodeRssBytes, samples: telemetry.samples,
    method: '2-second RSS sum for harness, adapter children and Chrome SystemInfo process IDs; shared pages counted per process; Linux only' };
  report.renderers = [...telemetry.renderers];
  report.counts = { planned: selected.count, completed: report.rows.length, pass: report.rows.filter(r => r.verdict.startsWith('PASS')).length,
    fail: report.rows.filter(r => r.verdict === 'FAIL').length, errors: report.errors.length,
    measuredNoiseAccepted: report.rows.filter(r => r.pixelNoise?.applied && r.pixelNoise.pass).length };
  report.verdict = report.errors.length || report.rows.length !== selected.count ? 'ERROR' : report.counts.fail ? 'FAIL'
    : report.rows.some(r => r.verdict === 'PASS-MEASURED') ? 'PASS-MEASURED' : report.rows.some(r => r.verdict === 'PASS-TOLERANT') ? 'PASS-TOLERANT' : 'PASS';
  report.rawExactCounts = { pass: report.rows.filter(r => r.rawExactVerdict === 'PASS').length };
  report.rawExactCounts.fail = report.rows.length - report.rawExactCounts.pass;
  report.rawExactVerdict = report.verdict === 'ERROR' ? 'ERROR' : report.rawExactCounts.fail ? 'FAIL' : 'PASS';
  writeFileSync(join(options.out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  const failed = report.rows.filter(r => !r.verdict.startsWith('PASS'));
  const noisy = report.rows.filter(r => r.pixelNoise?.applied);
  const summary = [`# PM7 parity: ${report.verdict}`, '', `Mode: ${report.mode}. Host: ${report.host}. GPU: ${report.renderers.join('; ')}.`, '',
    `States: ${report.counts.completed}/${selected.count}; PASS ${report.counts.pass}; FAIL ${report.counts.fail}; errors ${report.errors.length}.`,
    `Raw exact verdict: ${report.rawExactVerdict}; PASS ${report.rawExactCounts.pass}; FAIL ${report.rawExactCounts.fail}. Measured-noise acceptances: ${report.counts.measuredNoiseAccepted}.`,
    `Wall time: ${report.wallSeconds.toFixed(2)} s. Peak aggregate RSS: ${(telemetry.peakRssBytes / 2 ** 30).toFixed(2)} GiB (sampled every 2 s).`, '',
    '| Input | SHA-256 |', '|---|---|', ...report.input.map(i => `| ${i.path} | ${i.sha256} |`), '',
    `Matrix: ${selected.looks.length} looks × ${selected.pages.length} surfaces × ${selected.viewports.length} viewports × ${selected.motions.join('/')} motion; page-specific states in ${options.matrix}.`,
    options.deep ? 'Deep style hashes include all computed properties, hidden nodes, ::before/::after, form ::placeholder and list ::marker.' : 'Native hashes combine standard layout styles with JS-read custom values from CSSOM on accessible layout elements/generated pseudos. All DOM paths are retained. Hidden/no-layout and non-generated pseudo styles remain unsampled; unused custom properties are excluded. Use --deep for these.', '',
    ...(failed.length ? ['| State | Style elements | Pixels above tolerance | Raw differing pixels | Reasons |', '|---|---:|---:|---:|---|', ...failed.map(r => `| ${r.id} | ${r.styles.differingElements} | ${r.pixels.diffPixels} | ${r.pixels.rawDiffPixels} | ${r.verdictReasons.join(', ')} |`), ''] : []),
    ...(noisy.length ? ['| Measured baseline envelope | Raw candidate pixels | Variable baseline pixels | Max channel span | Outside envelope | Styles/state stable |', '|---|---:|---:|---:|---:|---|',
      ...noisy.map(r => `| ${r.id} | ${r.pixels.rawDiffPixels} | ${r.pixelNoise.noisePixels} | ${r.pixelNoise.maxObservedChannelSpan} | ${r.pixelNoise.outsidePixels} | ${r.pixelNoise.baselineStylesAndStateStable} |`), ''] : []),
    ...report.errors.map(e => `Harness error: ${e.error || e.cleanup}`), '',
    'See report.json and progress.jsonl for every state, full property differences and artifact SHA-256 values.',
    'Exact mode never retries, masks differences or increases tolerance automatically. Explicit baseline-repeat mode retains the original candidate capture and reports every raw difference and measured per-pixel range.', '', ...report.determinism.limits.map(l => '- ' + l), ''].join('\n');
  writeFileSync(join(options.out, 'summary.md'), summary);
  console.log(JSON.stringify({ verdict: report.verdict, mode: report.mode, rawExactVerdict: report.rawExactVerdict,
    rawExactCounts: report.rawExactCounts, ...report.counts, wallSeconds: report.wallSeconds, report: join(options.out, 'report.json') }));
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
