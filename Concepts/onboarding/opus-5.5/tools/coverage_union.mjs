/* Opt-in Chrome coverage for the PM7 harnesses. Off unless a harness is passed --coverage <file>.
 * Collects Profiler.startPreciseCoverage (JS) and CSS.startRuleUsageTracking, and merges every
 * recorded range into one union file. Native counters add only for identical recorded ranges;
 * a zero is not a byte-level liveness verdict, since another sample may cover those offsets
 * through an enclosing positive range. Use usedRanges, resolved within each sample before union,
 * for touched bytes. Missing sources/ranges remain unknown until the observed-source census.
 *
 *   takeCoverageFlag(argv)   removes --coverage <file> from argv and returns the absolute path, or null
 *   beginCoverage(session)   session.send(method, params) — call before the page loads
 *   endCoverage(session, file)  take the sample and merge it into file
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const digest = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);
export const USED_RANGES_PROVENANCE = 'per-sample-v1';
const stylesheetStates = new WeakMap();

export function takeCoverageFlag(argv) {
  const i = argv.indexOf('--coverage');
  if (i < 0) return null;
  const file = argv[i + 1];
  if (!file || file.startsWith('--')) {
    console.error('--coverage needs a file path');
    process.exit(2);
  }
  argv.splice(i, 2);
  return resolve(file);
}

function asSend(session) {
  if (typeof session === 'function') return session;
  if (session && typeof session.send === 'function') return (method, params) => session.send(method, params || {});
  throw new Error('coverage needs a CDP session');
}

export async function beginCoverage(session) {
  const send = asSend(session);
  await send('Profiler.enable');
  await send('Profiler.startPreciseCoverage', { callCount: true, detailed: true });
  await send('DOM.enable');
  // RuleUsage reports matching rules, but does not enumerate never-matched
  // sheets. Keep their installed content hashes too, for the static rule census.
  const state = { headers: new Map(), off: [], unsampledNavigations: 0,
    preflushedNavigation: false, documentUrl: null, navigationTracking: typeof session.on === 'function' };
  if (typeof session.on === 'function') {
    for (const [event, callback] of [
      ['CSS.styleSheetAdded', ({ header }) => state.headers.set(header.styleSheetId, header)],
      ['CSS.styleSheetRemoved', ({ styleSheetId }) => state.headers.delete(styleSheetId)],
      ['Page.frameNavigated', ({ frame }) => {
        if (!frame || frame.parentId) return;
        // A new empty tab has no document usage to lose. Every later main-frame
        // navigation needs its own pre-navigation sample, including page reloads.
        if (!state.preflushedNavigation && state.documentUrl !== 'about:blank') state.unsampledNavigations++;
        state.preflushedNavigation = false;
        state.documentUrl = frame.url;
        state.mainFrameId = frame.id;
      }],
      ['Page.navigatedWithinDocument', ({ frameId, url }) => {
        if (frameId !== state.mainFrameId) return;
        state.preflushedNavigation = false;
        state.documentUrl = url;
      }],
    ]) {
      const subscription = session.on(event, callback);
      state.off.push(typeof subscription === 'function' ? subscription : () => session.off?.(event, callback));
    }
  }
  stylesheetStates.set(session, state);
  if (state.navigationTracking) {
    await send('Page.enable');
    const tree = await send('Page.getFrameTree');
    state.documentUrl = tree.frameTree?.frame?.url || null;
    state.mainFrameId = tree.frameTree?.frame?.id;
  }
  await send('CSS.enable');
  await send('CSS.startRuleUsageTracking');
}

function rangeKey(range) {
  return `${range.startOffset}|${range.endOffset}`;
}
function functionKey(fn) {
  const whole = (fn.ranges && fn.ranges[0]) || { startOffset: 0, endOffset: 0 };
  return `${fn.functionName}|${whole.startOffset}|${whole.endOffset}`;
}
function cssKey(entry) {
  return `${entry.sheet}|${entry.startOffset}|${entry.endOffset}`;
}
function scriptKeyOf(entry) {
  return entry.script;
}

function copyRange(range) {
  return { startOffset: range.startOffset, endOffset: range.endOffset, count: range.count ?? 0 };
}
function copyFunction(fn) {
  return {
    functionName: fn.functionName || '',
    isBlockCoverage: !!fn.isBlockCoverage,
    ranges: (fn.ranges || []).map(copyRange),
  };
}
function copyScript(entry) {
  return {
    script: entry.script,
    url: entry.url || '',
    functions: (entry.functions || []).map(copyFunction),
    usedRanges: unionRanges(entry.usedRanges || []),
    usedRangesProvenance: Array.isArray(entry.usedRanges) && entry.usedRangesProvenance === USED_RANGES_PROVENANCE
      ? USED_RANGES_PROVENANCE : 'unknown-merged-counters',
  };
}

// CDP offsets are UTF-16 code units. Resolve each sample's nested zero ranges before
// merging samples: summing their counters first can hide a branch used by another run.
export function unionRanges(ranges) {
  const out = [];
  for (const r of [...ranges].sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset)) {
    if (r.endOffset <= r.startOffset) continue;
    const prev = out.at(-1);
    if (prev && r.startOffset <= prev.endOffset) prev.endOffset = Math.max(prev.endOffset, r.endOffset);
    else out.push({ startOffset: r.startOffset, endOffset: r.endOffset });
  }
  return out;
}

export function executedRanges(functions) {
  const ranges = functions.flatMap((fn) => fn.ranges || []);
  const end = Math.max(0, ...ranges.map((r) => r.endOffset));
  const used = new Uint8Array(end);
  // Broad ranges first, then more specific function/branch ranges override them.
  for (const r of ranges.sort((a, b) => (b.endOffset - b.startOffset) - (a.endOffset - a.startOffset) || (a.count > 0) - (b.count > 0))) {
    used.fill(r.count > 0 ? 1 : 0, r.startOffset, r.endOffset);
  }
  const out = [];
  for (let i = 0; i < used.length; i++) {
    if (!used[i]) continue;
    const startOffset = i;
    while (i < used.length && used[i]) i++;
    out.push({ startOffset, endOffset: i });
  }
  return out;
}

function mergeFunctions(baseFns, sampleFns) {
  const functions = new Map((baseFns || []).map((fn) => [functionKey(fn), copyFunction(fn)]));
  for (const fn of sampleFns || []) {
    const key = functionKey(fn);
    const prev = functions.get(key);
    if (!prev) {
      functions.set(key, copyFunction(fn));
      continue;
    }
    const ranges = new Map(prev.ranges.map((range) => [rangeKey(range), copyRange(range)]));
    for (const range of fn.ranges || []) {
      const id = rangeKey(range);
      const had = ranges.get(id);
      if (had) had.count += range.count ?? 0;
      else ranges.set(id, copyRange(range));
    }
    prev.isBlockCoverage = prev.isBlockCoverage || !!fn.isBlockCoverage;
    prev.ranges = [...ranges.values()].sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset);
  }
  return [...functions.values()].sort((a, b) => functionKey(a).localeCompare(functionKey(b)));
}

export function mergeCoverage(base, sample) {
  const js = new Map((base.js || []).map((entry) => [scriptKeyOf(entry), copyScript(entry)]));
  for (const entry of sample.js || []) {
    const key = scriptKeyOf(entry);
    const prev = js.get(key);
    if (!prev) js.set(key, copyScript(entry));
    else {
      prev.usedRanges = unionRanges([...prev.usedRanges, ...(entry.usedRanges || [])]);
      if (!Array.isArray(entry.usedRanges) || entry.usedRangesProvenance !== USED_RANGES_PROVENANCE) prev.usedRangesProvenance = 'unknown-merged-counters';
      prev.functions = mergeFunctions(prev.functions, entry.functions);
      if (!prev.url && entry.url) prev.url = entry.url;
    }
  }
  const css = new Map((base.css || []).map((entry) => [cssKey(entry), { ...entry }]));
  for (const entry of sample.css || []) {
    const key = cssKey(entry);
    const prev = css.get(key);
    if (!prev) css.set(key, { sheet: entry.sheet, startOffset: entry.startOffset, endOffset: entry.endOffset, used: !!entry.used });
    else prev.used = !!(prev.used || entry.used);
  }
  const byCss = (a, b) => cssKey(a).localeCompare(cssKey(b));
  // Navigation knowledge merges like provenance: a count from a tracked input
  // cannot speak for an input that was not tracked, so any missing count merges
  // to unknown. An empty base is the fresh-file placeholder, not an untracked input.
  const baseNav = base.unsampled_navigations, sampleNav = sample.unsampled_navigations;
  const baseEmpty = baseNav == null && !(base.js || []).length && !(base.css || []).length && !(base.stylesheets || []).length;
  const navigations = baseNav != null && sampleNav != null ? baseNav + sampleNav : baseEmpty ? sampleNav : null;
  return {
    version: 2,
    js: [...js.values()].sort((a, b) => a.script.localeCompare(b.script)),
    css: [...css.values()].sort(byCss),
    stylesheets: [...new Map([...(base.stylesheets || []), ...(sample.stylesheets || [])].map((s) => [s.sheet, s])).values()].sort((a, b) => a.sheet.localeCompare(b.sheet)),
    ...(navigations != null ? { unsampled_navigations: navigations } : {}),
  };
}

export function normalizeJsCoverage(scripts, keyFor) {
  const entries = [];
  for (const script of scripts || []) {
    const entry = {
      script: keyFor(script),
      url: script.url || '',
      functions: (script.functions || []).map((fn) => ({
        functionName: fn.functionName || '',
        isBlockCoverage: !!fn.isBlockCoverage,
        ranges: (fn.ranges || []).map((range) => ({
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          count: range.count ?? 0,
        })),
      })),
    };
    entry.usedRanges = executedRanges(entry.functions);
    entry.usedRangesProvenance = USED_RANGES_PROVENANCE;
    entries.push(entry);
  }
  return entries;
}

async function jsEntries(send, payload) {
  const scripts = Array.isArray(payload) ? payload : (payload && payload.result) || [];
  const keys = new Map();
  let debuggerOn = false;
  for (const script of scripts) {
    let scriptKey = script.url ? `url:${script.url}` : `script:${script.scriptId}`;
    try {
      if (!debuggerOn) { await send('Debugger.enable'); debuggerOn = true; }
      const { scriptSource } = await send('Debugger.getScriptSource', { scriptId: script.scriptId });
      if (typeof scriptSource === 'string') scriptKey = digest(scriptSource);
    } catch { /* keep the url key when the source cannot be read */ }
    keys.set(script, scriptKey);
  }
  if (debuggerOn) await send('Debugger.disable').catch(() => {});
  return normalizeJsCoverage(scripts, (script) => keys.get(script));
}

async function cssEntries(send, payload, state) {
  const rules = (payload && (payload.ruleUsage || payload.coverage)) || [];
  const sheets = new Map();
  const stylesheets = [];
  const entries = [];
  for (const header of [...(state?.headers.values() || [])]) {
    try {
      const { text } = await send('CSS.getStyleSheetText', { styleSheetId: header.styleSheetId });
      const sheet = digest(text); sheets.set(header.styleSheetId, sheet);
      stylesheets.push({ sheet, sourceURL: header.sourceURL || '', startLine: header.startLine, startColumn: header.startColumn,
        units: text.length, bytes: Buffer.byteLength(text), installed: true });
    } catch { /* a removed sheet is not evidence of an installed current source */ }
  }
  for (const rule of rules) {
    let sheet = sheets.get(rule.styleSheetId);
    if (!sheet) {
      try {
        const { text } = await send('CSS.getStyleSheetText', { styleSheetId: rule.styleSheetId });
        sheet = digest(text);
      } catch {
        sheet = `sheet:${rule.styleSheetId}`;
      }
      sheets.set(rule.styleSheetId, sheet);
    }
    entries.push({
      sheet,
      startOffset: rule.startOffset,
      endOffset: rule.endOffset,
      used: !!rule.used,
    });
  }
  return { css: entries, stylesheets };
}

function emptyUnion() {
  return { version: 2, js: [], css: [] };
}

function readUnion(file) {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    if (!parsed || !Array.isArray(parsed.js) || !Array.isArray(parsed.css)) throw new Error('not a coverage union');
    if (parsed.version !== 2) throw new Error('coverage union is an older shape; delete it and rerun');
    return parsed;
  } catch (err) {
    if (err && err.code === 'ENOENT') return emptyUnion();
    throw err;
  }
}

function coverageCounts(merged) {
  let functions = 0;
  let ranges = 0;
  let zero = 0;
  for (const script of merged.js) {
    for (const fn of script.functions || []) {
      functions += 1;
      for (const range of fn.ranges || []) {
        ranges += 1;
        if (!range.count) zero += 1;
      }
    }
  }
  const unused = (merged.css || []).filter((rule) => !rule.used).length;
  return { functions, ranges, zero, unused };
}

export async function sampleCoverage(session, file, { stop = false, beforeNavigation = false } = {}) {
  const send = asSend(session);
  const jsPayload = await send('Profiler.takePreciseCoverage');
  if (stop) await send('Profiler.stopPreciseCoverage').catch(() => {});
  const cssPayload = await send(stop ? 'CSS.stopRuleUsageTracking' : 'CSS.takeCoverageDelta');
  const sheets = await cssEntries(send, cssPayload, stylesheetStates.get(session));
  const state = stylesheetStates.get(session);
  const sample = {
    js: await jsEntries(send, jsPayload),
    ...sheets,
    ...(state?.navigationTracking ? { unsampled_navigations: state.unsampledNavigations } : {}),
  };
  const merged = mergeCoverage(readUnion(file), sample);
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(merged));
  renameSync(tmp, file);
  if (state) {
    state.unsampledNavigations = 0;
    if (beforeNavigation) state.preflushedNavigation = true;
  }
  const counts = coverageCounts(merged);
  console.error(`coverage union: ${file} scripts=${merged.js.length} functions=${counts.functions} ranges=${counts.ranges} zero=${counts.zero} css=${merged.css.length} unused=${counts.unused} bytes=${Buffer.byteLength(JSON.stringify(merged))}`);
  return merged;
}

export async function endCoverage(session, file) {
  try { return await sampleCoverage(session, file, { stop: true }); }
  finally {
    const state = stylesheetStates.get(session);
    for (const off of state?.off || []) off();
    stylesheetStates.delete(session);
  }
}

// A reload discards the previous document's stylesheet IDs and V8 contexts. Flush
// before goto/reload and once at close, including failed harness runs.
export async function coverPage(page, file, session = null) {
  if (!file) return async () => {};
  const owned = !session && typeof page.send !== 'function';
  const cdp = session || (owned ? await page.context().newCDPSession(page) : page);
  await beginCoverage(cdp);
  const originals = new Map();
  for (const method of ['goto', 'reload']) {
    if (typeof page[method] !== 'function') continue;
    const original = page[method]; originals.set(method, original);
    page[method] = async function (...args) {
      await sampleCoverage(cdp, file, { beforeNavigation: true });
      try { return await original.apply(this, args); }
      catch (error) { stylesheetStates.get(cdp).preflushedNavigation = false; throw error; }
    };
  }
  if (typeof page.send === 'function') {
    const original = page.send; originals.set('send', original);
    page.send = async function (method, ...args) {
      const navigating = method === 'Page.reload' || method === 'Page.navigate';
      if (navigating) await sampleCoverage(cdp, file, { beforeNavigation: true });
      try {
        const result = await original.call(this, method, ...args);
        if (navigating && result?.errorText) stylesheetStates.get(cdp).preflushedNavigation = false;
        return result;
      } catch (error) {
        if (navigating) stylesheetStates.get(cdp).preflushedNavigation = false;
        throw error;
      }
    };
  }
  let closed = false;
  return async () => {
    if (closed) return;
    closed = true;
    try { await endCoverage(cdp, file); }
    finally {
      for (const [method, original] of originals) page[method] = original;
      if (owned) await cdp.detach();
    }
  };
}
