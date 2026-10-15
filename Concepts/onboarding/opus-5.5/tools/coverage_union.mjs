/* Opt-in Chrome coverage for the PM7 harnesses. Off unless a harness is passed --coverage <file>.
 * Collects Profiler.startPreciseCoverage (JS) and CSS.startRuleUsageTracking, and merges every
 * recorded range into one union file. A count of 0 means the range was recorded and never ran.
 * A range that is absent was not recorded. Later runs add to a count; they do not drop a zero.
 *
 *   takeCoverageFlag(argv)   removes --coverage <file> from argv and returns the absolute path, or null
 *   beginCoverage(session)   session.send(method, params) — call before the page loads
 *   endCoverage(session, file)  take the sample and merge it into file
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const digest = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);

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
  };
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
  return {
    version: 2,
    js: [...js.values()].sort((a, b) => a.script.localeCompare(b.script)),
    css: [...css.values()].sort(byCss),
  };
}

export function normalizeJsCoverage(scripts, keyFor) {
  const entries = [];
  for (const script of scripts || []) {
    entries.push({
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
    });
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

async function cssEntries(send, payload) {
  const rules = (payload && payload.ruleUsage) || [];
  const sheets = new Map();
  const entries = [];
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
  return entries;
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

export async function endCoverage(session, file) {
  const send = asSend(session);
  const jsPayload = await send('Profiler.takePreciseCoverage');
  await send('Profiler.stopPreciseCoverage').catch(() => {});
  const cssPayload = await send('CSS.stopRuleUsageTracking');
  const sample = {
    js: await jsEntries(send, jsPayload),
    css: await cssEntries(send, cssPayload),
  };
  const merged = mergeCoverage(readUnion(file), sample);
  mkdirSync(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(merged));
  renameSync(tmp, file);
  const counts = coverageCounts(merged);
  console.error(`coverage union: ${file} scripts=${merged.js.length} functions=${counts.functions} ranges=${counts.ranges} zero=${counts.zero} css=${merged.css.length} unused=${counts.unused} bytes=${Buffer.byteLength(JSON.stringify(merged))}`);
  return merged;
}
