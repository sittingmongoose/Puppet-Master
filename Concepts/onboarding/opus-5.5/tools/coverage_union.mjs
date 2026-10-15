/* Opt-in Chrome coverage for the PM7 harnesses. Off unless a harness is passed --coverage <file>.
 * Collects Profiler.startPreciseCoverage (JS) and CSS.startRuleUsageTracking, and merges every
 * used range into one union file so later runs add to it. A range is kept when any run executed it.
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

function jsKey(entry) {
  return `${entry.script}|${entry.startOffset}|${entry.endOffset}`;
}
function cssKey(entry) {
  return `${entry.sheet}|${entry.startOffset}|${entry.endOffset}`;
}

export function mergeCoverage(base, sample) {
  const js = new Map((base.js || []).map((entry) => [jsKey(entry), { ...entry }]));
  for (const entry of sample.js || []) {
    const key = jsKey(entry);
    const prev = js.get(key);
    if (prev) prev.count += entry.count;
    else js.set(key, { ...entry });
  }
  const css = new Map((base.css || []).map((entry) => [cssKey(entry), { ...entry }]));
  for (const entry of sample.css || []) {
    css.set(cssKey(entry), { sheet: entry.sheet, startOffset: entry.startOffset, endOffset: entry.endOffset });
  }
  const byJs = (a, b) => jsKey(a).localeCompare(jsKey(b));
  const byCss = (a, b) => cssKey(a).localeCompare(cssKey(b));
  return { version: 1, js: [...js.values()].sort(byJs), css: [...css.values()].sort(byCss) };
}

async function jsEntries(send, payload) {
  const scripts = Array.isArray(payload) ? payload : (payload && payload.result) || [];
  const entries = [];
  let debuggerOn = false;
  for (const script of scripts) {
    let scriptKey = script.url ? `url:${script.url}` : `script:${script.scriptId}`;
    try {
      if (!debuggerOn) { await send('Debugger.enable'); debuggerOn = true; }
      const { scriptSource } = await send('Debugger.getScriptSource', { scriptId: script.scriptId });
      if (typeof scriptSource === 'string') scriptKey = digest(scriptSource);
    } catch { /* keep the url key when the source cannot be read */ }
    for (const fn of script.functions || []) {
      for (const range of fn.ranges || []) {
        if (!range.count) continue;
        entries.push({
          script: scriptKey,
          url: script.url || '',
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          count: range.count,
        });
      }
    }
  }
  if (debuggerOn) await send('Debugger.disable').catch(() => {});
  return entries;
}

async function cssEntries(send, payload) {
  const rules = (payload && payload.ruleUsage) || [];
  const sheets = new Map();
  const entries = [];
  for (const rule of rules) {
    if (!rule.used) continue;
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
    entries.push({ sheet, startOffset: rule.startOffset, endOffset: rule.endOffset });
  }
  return entries;
}

function readUnion(file) {
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    if (!parsed || !Array.isArray(parsed.js) || !Array.isArray(parsed.css)) throw new Error('not a coverage union');
    return parsed;
  } catch (err) {
    if (err && err.code === 'ENOENT') return { version: 1, js: [], css: [] };
    throw err;
  }
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
  console.error(`coverage union: ${file} js=${merged.js.length} css=${merged.css.length} bytes=${Buffer.byteLength(JSON.stringify(merged))}`);
  return merged;
}
