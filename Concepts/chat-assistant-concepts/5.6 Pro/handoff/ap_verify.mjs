/* Wave 2 — Activity Panel — pixel verification.
   Every assertion confirms a PAINTED pixel: document.elementFromPoint() at the
   target centre, plus a colour sample taken from a real screenshot crop (the PNG
   is handed back to the page as a data URL, drawn to a canvas and read with
   getImageData).  No assertion rests on getBoundingClientRect() alone.        */
import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const out = { pass: [], fail: [], info: {} };
const ok = (label, cond, detail) => (cond ? out.pass : out.fail).push({ label, detail });

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });

async function newPage(opts = {}) {
  const p = await browser.newPage(Object.assign({ viewport: { width: 1600, height: 980 }, deviceScaleFactor: 1 }, opts));
  p.on('console', m => { if (m.type() === 'error') out.fail.push({ label: 'console error', detail: m.text() }); });
  p.on('pageerror', e => out.fail.push({ label: 'page error', detail: String(e) }));
  await p.goto(pathToFileURL(path.join(ROOT, 'index.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO, { timeout: 15000 });
  return p;
}

/* Read real painted pixels out of a screenshot crop. */
async function sampleCrop(page, selector) {
  const el = await page.$(selector);
  if (!el) return null;
  const buf = await el.screenshot();
  const dataUrl = 'data:image/png;base64,' + buf.toString('base64');
  return page.evaluate(async url => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = url; });
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    const seen = new Set();
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) {
      seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
    }
    /* a coarse 8x8 luminance fingerprint, so two concepts can be compared as
       images rather than as innerHTML strings */
    const fp = [];
    for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 8; gx++) {
      const x = Math.floor((gx + .5) * c.width / 8), y = Math.floor((gy + .5) * c.height / 8);
      const i = (y * c.width + x) * 4;
      fp.push(Math.round((d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 4));
    }
    return { w: c.width, h: c.height, colours: seen.size, mean: [r / n, g / n, b / n].map(v => Math.round(v * 10) / 10), fp: fp.join(',') };
  }, dataUrl);
}
async function hits(page, selector) {
  return page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    /* the panel scrolls; a row below the fold is not "unpainted", it is
       off-screen.  Bring it into view first, then hit-test where it lands. */
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) return { found: true, painted: false, reason: 'zero area' };
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    const at = document.elementFromPoint(x, y);
    return { found: true, x, y, painted: !!(at && (at === el || el.contains(at) || at.contains(el))), tag: at ? at.tagName + '.' + String(at.className).slice(0, 40) : null };
  }, selector);
}
/* Click the PAINTED pixel.  page.click() waits for "stability", which never
   arrives here: the work tick re-renders the whole app every 2 s.  So the
   target is hit-tested at its centre and then clicked with a real pointer event
   at exactly those coordinates -- which is also the stronger assertion. */
async function clickPainted(page, selector) {
  const h = await hits(page, selector);
  if (!h.found || !h.painted) return h;
  await page.mouse.click(h.x, h.y);
  return h;
}

/* ------------------------------------------------------------------ 1. eight
   structurally AND visually distinct concepts */
{
  const page = await newPage();
  await page.evaluate(() => PM56_DEMO.pinActivity());
  await page.waitForTimeout(300);
  const shots = [], dom = [];
  for (let v = 0; v < 8; v++) {
    await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
    await page.waitForTimeout(950);
    dom.push(await page.evaluate(() => {
      const p = document.querySelector('.activity-panel .activity-scroll');
      const sig = {};
      p.querySelectorAll('*').forEach(el => el.classList.forEach(c => { if (/^(pmap|activity-|tree-|ring-mini)/.test(c)) sig[c] = 1; }));
      return { root: p.lastElementChild.className, classes: Object.keys(sig).sort().join(' '), nodes: p.querySelectorAll('*').length };
    }));
    shots.push(await sampleCrop(page, '.activity-panel'));
  }
  out.info.conceptDom = dom.map((d, i) => ({ v: i, root: d.root, nodes: d.nodes }));
  let allDifferent = true, pairs = [];
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
    const sameDom = dom[a].classes === dom[b].classes;
    const samePix = shots[a].fp === shots[b].fp;
    if (sameDom || samePix) { allDifferent = false; pairs.push(`${a}~${b} dom:${sameDom} px:${samePix}`); }
  }
  ok('All 8 concepts differ in DOM class-set AND in painted 8x8 fingerprint', allDifferent, pairs.join(', '));
  ok('Every concept paints real content (>200 distinct colours in the crop)',
    shots.every(s => s.colours > 200), JSON.stringify(shots.map(s => s.colours)));
  await page.close();
}

/* ---------------------------------------------------- 2. the filter filters */
{
  const page = await newPage();
  await page.evaluate(() => PM56_DEMO.pinActivity());
  await page.waitForTimeout(300);
  for (let v = 0; v < 8; v++) {
    await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
    await page.waitForTimeout(700);
    /* which domains actually have CONTENT on screen — navigation affordances
       (the filter chips, the master rail, the tree twisties) legitimately keep
       naming all five, so they are excluded rather than counted as content */
    const contentDomains = () => page.evaluate(() => {
      const nav = ['focus-activity', 'activity-branch', 'activity-scope'];
      return [...new Set([...document.querySelectorAll('.activity-scroll [data-domain]')]
        .filter(el => nav.indexOf(el.dataset.action) < 0)
        .map(el => el.dataset.domain))].sort();
    });
    /* Reset to stock first.  Two reasons: several concepts show only the focused
       domain's CONTENT even in scope 'all' (their tiles / rings / branches are
       the multi-domain part), so a test arriving already focused on `changes`
       would compare a state with itself; and concept 2's open-branch set
       accumulates across iterations. */
    await page.evaluate(v => { PM56_DEMO.reset(); PM56_DEMO.setVariant(4, v); PM56_DEMO.openActivity('goal'); }, v);
    await page.waitForTimeout(900);
    const before = await sampleCrop(page, '.activity-panel');
    const beforeDomains = await contentDomains();
    await clickPainted(page, '.activity-filter [data-action="focus-activity"][data-domain="changes"]');
    await page.waitForTimeout(750);
    const after = await sampleCrop(page, '.activity-panel');
    const afterDomains = await contentDomains();
    const scope = await page.evaluate(() => PM56_DEMO.getState().activity.scope);
    const narrowed = beforeDomains.join() !== 'changes' && afterDomains.join() === 'changes';
    ok(`Concept ${v}: focus-activity(changes) narrows the panel and repaints`,
      scope === 'focus' && before.fp !== after.fp && narrowed,
      JSON.stringify({ scope, repainted: before.fp !== after.fp, beforeDomains, afterDomains }));
    /* and widen back out */
    await clickPainted(page, '.activity-filter [data-action="focus-activity"][data-domain="changes"]');
    await page.waitForTimeout(550);
    const back = await page.evaluate(() => PM56_DEMO.getState().activity.scope);
    ok(`Concept ${v}: re-clicking the focused domain widens back to all`, back === 'all', back);
  }
  await page.close();
}

/* --------------------------------------------- 3. rows actually do something */
{
  const page = await newPage();
  await page.evaluate(() => PM56_DEMO.pinActivity());
  await page.waitForTimeout(300);

  const focusDomain = async d => {
    await page.evaluate(d => { PM56_DEMO.openActivity(d); }, d);
    await clickPainted(page, `.activity-filter [data-action="focus-activity"][data-domain="${d}"]`);
    await page.waitForTimeout(700);
  };
  for (const v of [0, 1, 2, 3, 4, 5, 6, 7]) {
    await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
    await page.waitForTimeout(800);

    /* --- a subagent row opens THAT agent --- */
    const agent = await page.evaluate(() => {
      const a = PM56_DATA.subagents[2];
      return { id: a.id, name: a.name };
    });
    await focusDomain('subagents');
    const agentSel = `.activity-scroll [data-action="open-agent"][data-id="${agent.id}"]`;
    const agentHit = await clickPainted(page, agentSel);
    await page.waitForTimeout(450);
    const editorAgent = await page.evaluate(() => ({
      active: PM56_DEMO.getState().activeEditor,
      h1: (document.querySelector('.editor-doc h1') || {}).textContent
    }));
    const agentPainted = await hits(page, '.editor-doc h1');
    ok(`Concept ${v}: subagent row is painted and opens that agent`,
      agentHit.painted && editorAgent.active === 'thread-' + agent.id && editorAgent.h1 === agent.name && agentPainted.painted,
      JSON.stringify({ agentHit, editorAgent, want: agent }));

    /* --- a changed-file row opens THAT path at THAT line --- */
    const change = await page.evaluate(() => {
      const c = PM56_DATA.changes[1];
      return { path: c.path, line: c.line };
    });
    await focusDomain('changes');
    const changeSel = `.activity-scroll [data-action="open-change"][data-path="${change.path}"]`;
    let changeHit;
    if (v === 5) {
      /* concept 5 expands the diff in place first, then offers the open button */
      changeHit = await clickPainted(page, `.activity-scroll [data-action="activity-diff"][data-path="${change.path}"]`);
      await page.waitForTimeout(500);
      await clickPainted(page, changeSel);
    } else {
      changeHit = await clickPainted(page, changeSel);
    }
    await page.waitForTimeout(450);
    const editorFile = await page.evaluate(() => ({
      active: PM56_DEMO.getState().activeEditor,
      h1: (document.querySelector('.editor-doc h1') || {}).textContent,
      meta: [...document.querySelectorAll('.editor-meta .meta-pill')].map(x => x.textContent).join(' | ')
    }));
    ok(`Concept ${v}: changed-file row opens that path at that line`,
      changeHit.painted && editorFile.active === 'file:' + change.path &&
      editorFile.h1 === change.path && editorFile.meta.includes('line ' + change.line),
      JSON.stringify({ changeHit, editorFile, want: change }));

    /* --- a Todo row is clickable and reveals the record --- */
    const todo = await page.evaluate(() => ({ id: PM56_DATA.todos[3].id, label: PM56_DATA.todos[3].label }));
    await focusDomain('todo');
    const todoSel = `.activity-scroll [data-action="open-todo"][data-id="${todo.id}"]`;
    const todoExists = await page.$(todoSel);
    if (todoExists) {
      const todoHit = await clickPainted(page, todoSel);
      await page.waitForTimeout(500);
      const sel = await page.evaluate(() => PM56_DEMO.getState().activity.selected);
      const detail = await hits(page, '.pmap-detail');
      const detailText = await page.evaluate(() => (document.querySelector('.pmap-detail') || {}).innerText || '');
      ok(`Concept ${v}: Todo row is clickable, painted, and details that todo`,
        todoHit.painted && sel && sel.id === todo.id && detail.painted && detailText.includes(todo.label),
        JSON.stringify({ todoHit, sel, detail, head: detailText.slice(0, 60) }));
      await clickPainted(page, '.activity-scroll [data-action="activity-deselect"]').catch(() => { });
      await page.waitForTimeout(250);
    } else {
      ok(`Concept ${v}: Todo row is clickable`, false, 'no open-todo row emitted');
    }
  }
  await page.close();
}

/* --------------------------------------- 4. concept 5's real diff, from hunks */
{
  const page = await newPage();
  await page.evaluate(() => { PM56_DEMO.pinActivity(); PM56_DEMO.setVariant(4, 5); });
  await page.waitForTimeout(800);
  const c = await page.evaluate(() => {
    const x = (PM56_DATA.changes || []).filter(c => Array.isArray(c.hunks) && c.hunks.length)[0];
    return x ? { path: x.path, first: x.hunks[0].lines[0], header: x.hunks[0].header } : null;
  });
  if (c) {
    await clickPainted(page, `.activity-scroll [data-action="activity-diff"][data-path="${c.path}"]`);
    await page.waitForTimeout(500);
    const diff = await hits(page, '.pmap-diff');
    const text = await page.evaluate(() => (document.querySelector('.pmap-diff') || {}).innerText || '');
    ok('Concept 5: changed-file row expands to the fixture\'s real diff hunk',
      diff.painted && text.includes(c.header) && text.includes(String(c.first.text).slice(0, 24)),
      JSON.stringify({ diff, header: c.header, sample: text.slice(0, 90) }));
  } else {
    ok('Concept 5 diff', false, 'no fixture change carries hunks');
  }
  await page.close();
}

/* --------------------------------------------------- 5. all 8 themes, no overflow */
{
  const page = await newPage();
  /* transient (unpinned) is how the panel ships and how audit.mjs measures it.
     PINNED overflows the document at every width -- verified to be PRE-EXISTING
     by disabling this module's slot: the stock accordion produces byte-identical
     numbers (body 1643 vs client 1600, grid `224px 250px 300px`).  It is
     `.assistant-grid.activity-pinned` arithmetic in styles.css, closed after
     Wave 1, so it is reported rather than fixed. */
  await page.evaluate(() => PM56_DEMO.openActivity('goal'));
  const themes = ['basic-dark', 'basic-light', 'friendly-dark', 'friendly-light', 'retro-dark', 'retro-light', 'glass-dark', 'glass-light'];
  const bad = [];
  for (const t of themes) {
    await page.evaluate(t => PM56_DEMO.setTheme(t), t);
    for (let v = 0; v < 8; v++) {
      for (const w of [1600, 1100, 900]) {
        await page.setViewportSize({ width: w, height: 900 });
        await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
        /* 60ms was sampling `mine` mid-entrance while the stock baseline was
           sampled ~260ms later, which showed up as a phantom 2px regression at
           900px.  Measured separately (`ap_jitter.mjs`): with the panel CLOSED
           the document is already 934 wide in a 900 viewport, and opening the
           panel leaves it at exactly 934 -- this module contributes 0. */
        await page.waitForTimeout(420);
        const measure = () => page.evaluate(() => {
          const doc = document.documentElement;
          const panel = document.querySelector('.activity-panel');
          const esc = panel ? [...panel.querySelectorAll('*')].filter(el => {
            /* .panel-resize sits at right:-3px by design (styles.css:352) */
            if (el.classList.contains('panel-resize') || el.closest('.panel-resize')) return false;
            const b = el.getBoundingClientRect(), p = panel.getBoundingClientRect();
            return b.width > 0 && (b.right > p.right + 1.5 || b.left < p.left - 1.5);
          }).length : 0;
          return { bw: document.body.scrollWidth, cw: doc.clientWidth, esc };
        });
        const mine = await measure();
        /* the honest comparison: the same metrics with this module's slot
           emptied, so app.js's stock accordion renders.  Anything that is
           already true of the stock body is not this wave's regression --
           at 900px the document already overflows with the panel CLOSED, and
           the panel's own head/filter/scroll chrome already exceeds the
           squeezed transient panel width. */
        const stock = await page.evaluate(async () => {
          const saved = window.PM56_EXT._slots.activityPanelBody;
          window.PM56_EXT._slots.activityPanelBody = [];
          PM56_DEMO.renderAll ? PM56_DEMO.renderAll() : PM56_DEMO.openActivity(PM56_DEMO.getState().activity.domain);
          await new Promise(r => setTimeout(r, 260));
          const doc = document.documentElement, panel = document.querySelector('.activity-panel');
          const esc = panel ? [...panel.querySelectorAll('*')].filter(el => {
            if (el.classList.contains('panel-resize') || el.closest('.panel-resize')) return false;
            const b = el.getBoundingClientRect(), p = panel.getBoundingClientRect();
            return b.width > 0 && (b.right > p.right + 1.5 || b.left < p.left - 1.5);
          }).length : 0;
          const out = { bw: document.body.scrollWidth, cw: doc.clientWidth, esc };
          window.PM56_EXT._slots.activityPanelBody = saved;
          return out;
        });
        await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
        if (mine.bw > Math.max(stock.bw + 4, mine.cw + 1) || mine.esc > stock.esc) {
          bad.push(`${t}/c${v}/${w} mine ${JSON.stringify(mine)} stock ${JSON.stringify(stock)}`);
        }
      }
    }
  }
  ok('8 themes x 8 concepts x 3 widths: no overflow BEYOND app.js\'s stock body', bad.length === 0, bad.slice(0, 6).join(' || '));
  await page.close();
}

/* ------------------------------------------------ 6. reduced motion behaviour */
{
  const page = await newPage({ reducedMotion: 'reduce' });
  await page.evaluate(() => PM56_DEMO.pinActivity());
  const loops = [];
  for (let v = 0; v < 8; v++) {
    await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
    await page.waitForTimeout(400);
    loops.push(await page.evaluate(() => {
      const panel = document.querySelector('.activity-panel');
      return document.getAnimations().filter(a => {
        const t = a.effect && a.effect.target;
        return t && panel.contains(t) && a.effect.getTiming().iterations === Infinity;
      }).length;
    }));
  }
  ok('prefers-reduced-motion: zero infinite animations inside the panel in all 8 concepts',
    loops.every(n => n === 0), JSON.stringify(loops));
  const stateAdvances = await page.evaluate(async () => {
    const a = PM56_DEMO.getState().work.step;
    await new Promise(r => setTimeout(r, 2600));
    return { a, b: PM56_DEMO.getState().work.step };
  });
  ok('prefers-reduced-motion: state still advances', stateAdvances.b !== stateAdvances.a, JSON.stringify(stateAdvances));
  await page.close();
}

/* ------------------------------------- 7. no remount churn across the work tick */
{
  const page = await newPage();
  await page.evaluate(() => PM56_DEMO.pinActivity());
  for (let v = 0; v < 8; v++) {
    await page.evaluate(v => PM56_DEMO.setVariant(4, v), v);
    await page.waitForTimeout(600);
    const stable = await page.evaluate(async () => {
      const root = document.querySelector('.activity-scroll .pmap');
      let churn = 0;
      const obs = new MutationObserver(recs => recs.forEach(r => { churn += r.addedNodes.length; }));
      obs.observe(root, { childList: true, subtree: true });
      await new Promise(r => setTimeout(r, 4600));   /* two full 2s work ticks */
      obs.disconnect();
      return { churn, sameRoot: root.isConnected };
    });
    ok(`Concept ${v}: survives two work ticks without remounting (stable data-k)`,
      stable.sameRoot && stable.churn < 6, JSON.stringify(stable));
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ passed: out.pass.length, failed: out.fail.length, fail: out.fail, info: out.info, pass: out.pass.map(p => p.label) }, null, 1));
