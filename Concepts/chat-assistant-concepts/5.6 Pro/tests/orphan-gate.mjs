/* orphan-gate.mjs -- the standing gate the plan asked for:
   fail if a CSS selector matches nothing the JS can emit.

   Why this needs to be more than a grep.  Class names in this codebase are
   frequently INTERPOLATED (`working-variant-${v}`, `message-${role}`,
   `ph-status ${status}`), so a naive "is this literal in a .js file" check
   reports ~19 false positives and then gets switched off.  The emitted-token
   set is therefore built from three independent sources and UNIONed:

     1. static  -- `class="..."`, `classList.add/remove/toggle/replace(...)`,
                  `className = ...` across every source file, with the
                  interpolated forms kept as PATTERNS, not discarded;
     2. pattern -- each `${...}` becomes `[A-Za-z0-9_ -]*`, so `working-variant-7`
                  is recognised without anyone having to enumerate 24 takes;
     3. runtime -- a MutationObserver harvest over a driven page (all themes,
                  every variant family/option, every menu, every demo trigger,
                  four viewports), which catches classes written by code the
                  static pass cannot see at all.

   Run standalone:   node tests/orphan-gate.mjs [--src DIR] [--html FILE] [--json OUT]
   Or import runOrphanGate(browser, {src, html}) from the audit.

   Exit 1 if any orphan is found outside the documented allowlist. */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

/* Selectors that are allowed to match nothing, each with the reason.
   An entry here is a promise that someone owns it -- not a mute button.
   Empty is the goal state. */
export const ALLOWLIST = new Map([
  // ['some-class', 'why it may legitimately match nothing today'],
]);

const CLASS_RE = /\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g;
const ID_RE = /#(-?[A-Za-z_][A-Za-z0-9_-]*)/g;

export function staticTokens(src) {
  /* A gate that measures nothing reports zero orphans and looks green -- the
     exact failure this file exists to prevent, and it happened on the first
     run of this file (a `new URL().pathname` left `%20` in "5.6 Pro", so the
     source list was empty and the verdict was a confident 0). Both inputs are
     now asserted non-empty before any verdict is computed. */
  const files = fs.readdirSync(src)
    .filter(f => (f.endsWith('.js') || f.endsWith('.html')) && f !== 'index.html'
                 && !f.startsWith('PM_Chat_Assistant'))
    .map(f => path.join(src, f));
  const tokens = new Set(), patterns = [], ids = new Set();
  const SENTINEL = 'zzq9-orphan-sentinel-zzq9';
  let unconstrained = 0;
  /* Deliberately does NOT require the closing quote.  Every module in this
     tree builds markup by concatenation --
       '<button class="pmap-chip' + (on ? ' is-on' : '') + '" ...'
     -- so the class attribute is split across several JS string literals and a
     `class="([^"]*)"` regex extracts none of it.  That single missing quote is
     why the first run of this gate called 28 live activity-panel classes dead. */
  const attr = /class\s*=\s*(?:"([^"\n]*)|'([^'\n]*))/g;
  const clist = /classList\s*\.\s*(?:add|remove|toggle|contains|replace)\s*\(([^)]*)\)/g;
  const cname = /className\s*=\s*([`"'][^`"']*[`"'])/g;
  const strlit = /[`"']([^`"']*)[`"']/g;
  const idattr = /id\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  const idget = /getElementById\(\s*['"]([^'"]+)['"]/g;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const add = chunk => {
    chunk = (chunk || '').trim();
    if (!chunk) return;
    if (chunk.includes('${')) {
      for (const word of chunk.split(/\s+/)) {
        if (!word.includes('${')) { if (/^[A-Za-z0-9_-]+$/.test(word)) tokens.add(word); continue; }
        /* A word with holes becomes an anchored pattern -- but ONLY if enough
           of it is literal to constrain anything.  `class="${cls}"` yields
           `^[A-Za-z0-9_ -]*$`, which matches every class name in existence and
           silently turns the whole gate green.  That is exactly the "selector
           matching nothing / matcher matching everything" trap this gate is
           for, and it shipped in the first draft of this file: 68 of 111
           patterns were that wildcard, so 0 orphans was structurally
           guaranteed.  Classes that are entirely interpolated are covered by
           the runtime harvest instead. */
        const literal = word.split(/\$\{[^}]*\}/).join('');
        if (literal.replace(/[^A-Za-z0-9_-]/g, '').length < 3) { unconstrained++; continue; }
        const body = word.split(/\$\{[^}]*\}/).map(esc).join('[A-Za-z0-9_ -]*');
        let rx; try { rx = new RegExp('^' + body + '$'); } catch (e) { continue; }
        if (rx.test(SENTINEL)) { unconstrained++; continue; }
        patterns.push(rx);
      }
    } else {
      for (const t of chunk.split(/\s+/)) if (/^[A-Za-z0-9_-]+$/.test(t)) tokens.add(t);
    }
  };
  const literals = new Map();  // ident token -> [files]
  const anyStr = /'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`\\]*)`/g;
  /* Collapse class-building CONCATENATION into the same `${}` hole shape the
     template-literal path already understands:
         '<span class="goal-status-chip tone-' + s.tone + '" ...'
       -> '<span class="goal-status-chip tone-${x}" ...'
         cls(true, 'pm56-' + L.k + '-nomo')  ->  cls(true, 'pm56-${x}-nomo')
     Without this, every class name this codebase assembles at runtime -- which
     is most of the stateful ones -- reads as an orphan.  Measured: 31 "hard
     orphans" before this step, of which every single one was constructible. */
  const MERGE = /(['"])\s*\+\s*[^'"+]{1,80}?\s*\+\s*\1/g;
  const CLASSY = /^[A-Za-z0-9_ -]*\$\{[^}]*\}[A-Za-z0-9_ ${}-]*$/;
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8').replace(MERGE, '${x}');
    let m;
    // any post-merge literal that is nothing but class-ident characters plus
    // holes is treated as a class chunk -- that is how `cls('pm56-${x}-nomo')`
    // and other helper-function class builders get seen at all.
    const holed = /'([^'\n]*\$\{[^']*)'|"([^"\n]*\$\{[^"]*)"/g;
    while ((m = holed.exec(s))) {
      const body = m[1] ?? m[2] ?? '';
      if (body.length <= 120 && CLASSY.test(body)) add(body);
    }
    anyStr.lastIndex = 0;
    while ((m = anyStr.exec(s))) {
      const body = m[1] ?? m[2] ?? m[3] ?? '';
      if (body.length > 200) continue;
      for (const t of body.split(/[\s"'`<>=.,;:()\[\]{}]+/))
        if (/^-?[A-Za-z_][A-Za-z0-9_-]*$/.test(t)) {
          if (!literals.has(t)) literals.set(t, new Set());
          literals.get(t).add(path.basename(f));
        }
    }
    attr.lastIndex = 0; while ((m = attr.exec(s))) add(m[1] ?? m[2]);
    clist.lastIndex = 0; while ((m = clist.exec(s))) {
      let n; strlit.lastIndex = 0; while ((n = strlit.exec(m[1]))) add(n[1]);
    }
    cname.lastIndex = 0; while ((m = cname.exec(s))) add(m[1].slice(1, -1));
    idattr.lastIndex = 0; while ((m = idattr.exec(s))) {
      const v = (m[1] ?? m[2] ?? '').trim(); if (v && !v.includes('${')) ids.add(v);
    }
    idget.lastIndex = 0; while ((m = idget.exec(s))) ids.add(m[1]);
  }
  if (!files.length) throw new Error(`orphan gate: no JS/HTML sources found in ${src}`);
  if (tokens.size < 100) throw new Error(`orphan gate: only ${tokens.size} static class tokens extracted from ${src} -- the extractor is broken, not the code`);
  return { tokens, patterns, ids, unconstrained, literals, files: files.map(f => path.basename(f)) };
}

/* Every rule selector in a stylesheet, descending into @media/@supports/@container
   and skipping @keyframes bodies (their `from`/`to` are not selectors). */
export function ruleSelectors(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  let i = 0, buf = '';
  while (i < css.length) {
    const c = css[i];
    if (c === '{') {
      const sel = buf.trim(); buf = '';
      if (sel.startsWith('@')) {
        if (/^@(media|supports|layer|container|scope|document)/.test(sel)) { i++; continue; }
        let d = 1; i++;
        while (i < css.length && d) { if (css[i] === '{') d++; else if (css[i] === '}') d--; i++; }
        continue;
      }
      out.push(sel);
      let d = 1; i++;
      while (i < css.length && d) { if (css[i] === '{') d++; else if (css[i] === '}') d--; i++; }
      continue;
    }
    if (c === '}') { buf = ''; i++; continue; }
    buf += c; i++;
  }
  return out;
}

export async function harvestClasses(browser, html) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto(pathToFileURL(html).href, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO, { timeout: 15000 });
  await page.evaluate(() => {
    window.__CLS = new Set();
    const eat = root => {
      if (!root || !root.querySelectorAll) return;
      for (const el of [root, ...root.querySelectorAll('*')])
        if (el.classList) for (const c of el.classList) window.__CLS.add(c);
    };
    eat(document.documentElement);
    new MutationObserver(ms => {
      for (const m of ms) {
        for (const n of m.addedNodes) eat(n);
        if (m.type === 'attributes' && m.target.classList)
          for (const c of m.target.classList) window.__CLS.add(c);
      }
    }).observe(document.documentElement,
      { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  const ev = (fn, arg) => page.evaluate(fn, arg).catch(() => null);
  const tick = (ms = 40) => page.waitForTimeout(ms);

  const fams = await page.evaluate(() => PM56_DEMO.getState().variants.length);
  for (let f = 0; f < fams; f++) for (let o = 0; o < 26; o++)
    await ev(([f, o]) => { try { PM56_DEMO.setVariant(f, o); } catch (e) {} }, [f, o]);
  await ev(() => PM56_DEMO.reset());
  for (const t of ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light',
                   'retro-dark', 'retro-light', 'glass-dark', 'glass-light'])
    { await ev(t => PM56_DEMO.setTheme(t), t); await tick(20); }
  for (let i = 0; i < 24; i++) { await ev(i => PM56_DEMO.setRecipe(i), i); await tick(15); }
  await ev(() => PM56_DEMO.reset());
  await ev(() => PM56_DEMO.startWorking()); await tick(400);
  for (let i = 0; i < 12; i++) { await ev(i => PM56_DEMO.setWorkStep(i), i); await tick(50); }
  await ev(() => PM56_DEMO.completeWorking()); await tick(150);
  for (const k of ['openQuestionnaire', 'openPlan', 'openPermission'])
    { await ev(k => PM56_DEMO[k](), k); await tick(70); }
  await ev(() => PM56_DEMO.reset());
  for (const d of ['goal', 'todo', 'subagents', 'changes', 'artifacts'])
    { await ev(d => PM56_DEMO.openActivity(d), d); await tick(60); }
  await ev(() => PM56_DEMO.pinActivity()); await tick(80);
  await ev(() => PM56_DEMO.openContext()); await tick(120);
  await ev(() => PM56_DEMO.reset());
  const threads = await page.evaluate(() => PM56_DEMO.getState().threads?.map(t => t.id) || []);
  for (const t of threads) { await ev(t => PM56_DEMO.selectThread(t), t); await tick(40); }
  const menus = await page.evaluate(() =>
    [...document.querySelectorAll('[data-action="open-menu"]')].map(e => e.dataset.menu));
  for (const m of [...new Set(menus)]) {
    await page.evaluate(m => document.querySelector(
      `[data-action="open-menu"][data-menu="${m}"]`)?.click(), m).catch(() => {});
    await tick(120);
    await page.evaluate(() => document.querySelectorAll('.overlay-menu .menu-item')
      .forEach(el => { el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                       el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); }))
      .catch(() => {});
    await tick(120);
    await page.keyboard.press('Escape'); await tick(60);
  }
  await page.evaluate(() => document.querySelectorAll('.activity-item, [data-hover-domain]')
    .forEach(el => { el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
                     el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); }))
    .catch(() => {});
  await tick(400);
  const trigs = await page.evaluate(() => {
    try {
      const t = PM56_DEMO.listTriggers();
      return Array.isArray(t) ? t.map(x => typeof x === 'string' ? x : (x.id || x.key || x[0]))
                              : Object.keys(t);
    } catch (e) { return []; }
  });
  for (const t of trigs) { await ev(t => { try { PM56_DEMO.trigger(t); } catch (e) {} }, t); await tick(40); }
  await tick(500);
  const arts = await page.evaluate(() =>
    [...document.querySelectorAll('[data-artifact-id]')].map(e => e.dataset.artifactId));
  for (const a of [...new Set(arts)]) { await ev(a => { try { PM56_DEMO.openArtifact(a); } catch (e) {} }, a); await tick(60); }
  for (const v of [{ width: 700, height: 800 }, { width: 390, height: 844 },
                   { width: 1100, height: 800 }, { width: 1440, height: 900 }])
    { await page.setViewportSize(v); await tick(280); }
  const classes = await page.evaluate(() => [...window.__CLS].sort());
  await page.close();
  return { classes, pageErrors: errs };
}

export function judge({ src, statics, runtime }) {
  const LIVE = new Set([...statics.tokens, ...runtime]);
  const IDS = statics.ids;
  const sheets = fs.readdirSync(src).filter(f => f.endsWith('.css')).sort();
  if (!sheets.length) throw new Error(`orphan gate: no stylesheets found in ${src}`);
  if (runtime.length < 200) throw new Error(`orphan gate: runtime harvest returned only ${runtime.length} class names -- the harvest is broken, not the code`);
  const findings = [];
  for (const f of sheets) {
    const css = fs.readFileSync(path.join(src, f), 'utf8');
    for (const sel of ruleSelectors(css)) {
      for (let part of sel.split(',')) {
        part = part.trim();
        if (!part) continue;
        const dead = [];
        let m;
        CLASS_RE.lastIndex = 0;
        while ((m = CLASS_RE.exec(part))) {
          const c = m[1];
          if (LIVE.has(c)) continue;
          if (statics.patterns.some(rx => rx.test(c))) continue;
          if (ALLOWLIST.has(c)) continue;
          dead.push(c);
        }
        ID_RE.lastIndex = 0;
        while ((m = ID_RE.exec(part))) if (!IDS.has(m[1]) && !ALLOWLIST.has('#' + m[1])) dead.push('#' + m[1]);
        if (dead.length) {
          /* HARD  = the name appears NOWHERE in the JS, not even inside a
                     string literal -> nothing in the codebase can ever produce
                     it.  This is the item-15b defect class and it fails the gate.
             SOFT  = the name IS a literal in some module but was neither
                     statically extractable as a class token nor observed at
                     runtime -> almost always a state class the harvest did not
                     reach (`.is-selected`, `.tone-blocked`).  Reported, with the
                     owning file named, but does not fail the build: calling
                     those dead would be a false positive, and a gate that cries
                     wolf gets switched off, which is how the last one died. */
          const uniq = [...new Set(dead)];
          const hard = uniq.filter(d => !d.startsWith('#') && !statics.literals.has(d));
          const hardIds = uniq.filter(d => d.startsWith('#'));
          const soft = uniq.filter(d => !d.startsWith('#') && statics.literals.has(d));
          const rec = { sheet: f, selector: part, dead: uniq,
                        hard: [...hard, ...hardIds], soft,
                        softOwners: Object.fromEntries(soft.map(d => [d, [...statics.literals.get(d)]])) };
          findings.push(rec);
        }
      }
    }
  }
  const hardFindings = findings.filter(x => x.hard.length);
  const softFindings = findings.filter(x => !x.hard.length && x.soft.length);
  return { sheets, live: LIVE.size, findings, hardFindings, softFindings };
}

export async function runOrphanGate(browser, { src, html }) {
  const statics = staticTokens(src);
  const { classes, pageErrors } = await harvestClasses(browser, html);
  const report = judge({ src, statics, runtime: classes });
  report.staticTokens = statics.tokens.size;
  report.patterns = statics.patterns.length;
  report.unconstrainedPatterns = statics.unconstrained;
  report.runtimeClasses = classes.length;
  report.sources = statics.files;
  report.pageErrors = pageErrors;
  return report;
}

/* ---- standalone ---- */
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  // decodeURIComponent: the concept dir is literally named "5.6 Pro", and a
  // URL pathname carries that space as %20.
  const here = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
  const src = path.resolve(arg('--src') || path.join(here, '..'));
  const html = path.resolve(arg('--html') || path.join(src, 'index.html'));
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch (e) { ({ chromium } = await import('playwright-core')); }
  const browser = await chromium.launch({ headless: true,
    args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
  const rep = await runOrphanGate(browser, { src, html });
  await browser.close();
  console.log(`sources ${rep.sources.length}  static ${rep.staticTokens} + ${rep.patterns} usable patterns (${rep.unconstrainedPatterns} wildcard patterns DISCARDED)  runtime ${rep.runtimeClasses}  LIVE ${rep.live}`);
  console.log(`sheets ${rep.sheets.length}   HARD orphans: ${rep.hardFindings.length}   soft (unexercised state classes): ${rep.softFindings.length}`);
  for (const f of rep.hardFindings) console.log(`   HARD  ${f.sheet}  ${f.selector}   -> ${f.hard.join(', ')}`);
  const softBy = new Map();
  for (const f of rep.softFindings) for (const d of f.soft)
    if (!softBy.has(d)) softBy.set(d, new Set(f.softOwners[d]));
  for (const [d, owners] of [...softBy].sort()) console.log(`   soft  .${d}   (literal in ${[...owners].join(', ')})`);
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rep, null, 1));
  process.exit(rep.hardFindings.length ? 1 : 0);
}
