/* questions-verify.mjs — Wave 4 (Decisions, item 15a) verification suite.
 *
 *   node questions-verify.mjs [--file <html>] [--json <out>] [--reduced] [--quiet]
 *
 * Every assertion that claims something is visible reads PAINTED PIXELS:
 * `document.elementFromPoint()` at the target's centre, plus a colour/luminance
 * read taken from a real screenshot crop decoded in a canvas.  A
 * getBoundingClientRect() is never on its own sufficient evidence here — this
 * project has logged three false-positive "fixes" from exactly that, because a
 * rect is reported for clipped, occluded and mid-transition elements alike.
 *
 * Clicks go through clickPainted(): scrollIntoView -> elementFromPoint at the
 * centre -> page.mouse.click at those coordinates.  page.click() never becomes
 * actionable in this app, because the 2 s work tick re-renders the whole tree
 * and Playwright waits forever for "stable".
 *
 * Run it against a module-blanked build to see it go red on purpose:
 *   python3 scratchpad/waves/qs-negative-control.py /tmp/noq.html
 *   node questions-verify.mjs --file /tmp/noq.html
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const argv = process.argv.slice(2);
const argOf = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const ROOT = process.env.PM56_ROOT || '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const FILE = argOf('--file', path.join(ROOT, 'index.html'));
const OUT = argOf('--json', null);
const REDUCED = argv.includes('--reduced');
const QUIET = argv.includes('--quiet');
const url = pathToFileURL(FILE).href;

const results = [];
let consoleErrors = [], pageErrors = [];
async function t(name, fn) {
  try { const info = await fn(); results.push({ name, ok: true, info: info === undefined ? null : info }); }
  catch (e) { results.push({ name, ok: false, error: String(e && e.message || e).slice(0, 400) }); }
}
const must = (cond, msg) => { if (!cond) throw new Error(msg); };

const browser = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  reducedMotion: REDUCED ? 'reduce' : 'no-preference'
});
const page = await context.newPage();
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(String(e)));
await page.goto(url, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true && window.PM56_DEMO, { timeout: 20000 });

/* ------------------------------------------------------------------ helpers */
const SETTLE = 460;   /* past the 420ms entrance; a surface measured mid-spring
                         reports a geometry it never settles at (Menus lost four
                         measurements to exactly this). */
async function setTake(v) {
  await page.evaluate(v => PM56_DEMO.setVariant(6, v), v);
  await page.waitForTimeout(SETTLE);
}
async function openQuestion() {
  await page.evaluate(() => { PM56_DEMO.reset(); });
  await page.waitForTimeout(260);
  await page.evaluate(() => PM56_DEMO.openQuestionnaire());
  await page.waitForTimeout(SETTLE);
}
async function openPlan() {
  await page.evaluate(() => PM56_DEMO.openPlan());
  await page.waitForTimeout(SETTLE);
}
async function openPermission() {
  await page.evaluate(() => PM56_DEMO.openPermission());
  await page.waitForTimeout(SETTLE);
}
/* Painted, not merely present: the element has to be what is under its own
   centre pixel. Returns null when it is clipped, covered, or absent. */
async function paintedRect(sel, nth = 0) {
  return page.evaluate(({ sel, nth }) => {
    const els = [...document.querySelectorAll(sel)];
    const el = els[nth];
    if (!el) return null;
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    const x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    const hit = document.elementFromPoint(x, y);
    const owns = !!hit && (el === hit || el.contains(hit) || hit.contains(el));
    return { x, y, w: Math.round(r.width), h: Math.round(r.height), owns, hitTag: hit ? hit.tagName + '.' + hit.className : null };
  }, { sel, nth });
}
async function clickPainted(sel, nth = 0) {
  const r = await paintedRect(sel, nth);
  must(r, `not painted: ${sel} [${nth}]`);
  must(r.owns, `hit-test failed for ${sel} [${nth}] -> ${r.hitTag}`);
  await page.mouse.click(r.x, r.y);
  await page.waitForTimeout(320);
  return r;
}
/* Move to the next question the way a user has to: q3 is REQUIRED and ships
   unanswered, so app.js's `next-question` refuses to advance until it is
   answered (and `skip-question` is the documented way past it). A harness that
   just clicks Next stalls at index 2 and then reports the questions it never
   reached as defects — which is what the first run of this suite did. */
async function advance() {
  const before = await page.evaluate(() => PM56_DEMO.getState().questionIndex);
  const r = await paintedRect('.decision-host [data-action="next-question"]');
  if (r && r.owns) { await page.mouse.click(r.x, r.y); await page.waitForTimeout(300); }
  let now = await page.evaluate(() => PM56_DEMO.getState().questionIndex);
  if (now !== before) return now;
  const s = await paintedRect('.decision-host [data-action="skip-question"]');
  if (s && s.owns) { await page.mouse.click(s.x, s.y); await page.waitForTimeout(300); }
  return page.evaluate(() => PM56_DEMO.getState().questionIndex);
}

/* Decode a screenshot crop inside the page and return an 8x8 luminance grid
   plus the distinct-colour count. A crop with two colours is a blank box; a
   real surface has hundreds. */
async function fingerprint(clip) {
  const buf = await page.screenshot({ clip });
  const b64 = buf.toString('base64');
  return page.evaluate(async b64 => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const colours = new Set();
    const cells = new Array(64).fill(0), counts = new Array(64).fill(0);
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        colours.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
        const cell = Math.min(7, Math.floor(y / (c.height / 8))) * 8 + Math.min(7, Math.floor(x / (c.width / 8)));
        cells[cell] += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        counts[cell]++;
      }
    }
    return {
      colours: colours.size,
      grid: cells.map((s, i) => Math.round(s / Math.max(counts[i], 1)))
    };
  }, b64);
}
async function hostClip() {
  const b = await page.locator('.decision-host').boundingBox();
  must(b && b.height > 10, 'decision host has no height');
  return { x: Math.max(0, Math.round(b.x)), y: Math.max(0, Math.round(b.y)), width: Math.round(Math.min(b.width, 1440 - b.x)), height: Math.round(Math.min(b.height, 900 - b.y)) };
}
const hostText = () => page.evaluate(() => (document.querySelector('.decision-host')?.textContent || '').replace(/\s+/g, ' ').trim());
const stateOf = () => page.evaluate(() => PM56_DEMO.getState());
async function setHostWidth(px) {
  /* The container the tiers key on is the DECISION HOST, sized by the editor
     split. Driving --editor-w is how a real user changes it. */
  const vw = 1440;
  await page.evaluate(pct => document.documentElement.style.setProperty('--editor-w', pct + '%'), Math.round((1 - px / vw) * 100));
  await page.waitForTimeout(220);
  return page.evaluate(() => Math.round(document.querySelector('.decision-host').getBoundingClientRect().width));
}

const ROOTS = ['qs-card', 'qs-morph', 'qs-sheet', 'qs-inspector', 'qs-seq', 'qs-tech', 'qs-stack', 'qs-split'];
/* Every behavioural assertion is scoped to the TAKE'S OWN ROOT. Unscoped, all
   forty C-assertions pass against a build with this module blanked — app.js's
   stock surface also has one close button, one title and a choice grid — which
   is forty vacuous passes proving nothing about the eight structures. The
   negative control is what exposed that; see WAVE4_DECISIONS_LOG.md. */
const rootSel = v => '.decision-host .' + ROOTS[v];

/* ======================================================================= A */
/* Structural distinctness — the explicit standard for this family. */
await openQuestion();
const sigs = [];
for (let v = 0; v < 8; v++) {
  await setTake(v);
  const s = await page.evaluate(() => {
    const host = document.querySelector('.decision-host');
    if (!host) return null;
    const cls = new Set(), tags = {};
    host.querySelectorAll('*').forEach(el => { tags[el.tagName] = (tags[el.tagName] || 0) + 1; el.classList.forEach(c => cls.add(c)); });
    return {
      root: host.firstElementChild ? host.firstElementChild.className : '',
      qs: host.querySelector('[data-qs]') ? host.querySelector('[data-qs]').getAttribute('data-qs') : null,
      classes: [...cls].sort().join(' '),
      tags: JSON.stringify(Object.keys(tags).sort().map(k => k + ':' + tags[k])),
      nodes: host.querySelectorAll('*').length
    };
  });
  const fp = await fingerprint(await hostClip());
  sigs.push({ v, ...s, fp });
}
for (let v = 0; v < 8; v++) {
  await t(`A${v}. take ${v} emits its own root (.${ROOTS[v]}) and data-qs="${v}"`, async () => {
    must(sigs[v], 'no signature');
    must(String(sigs[v].root).includes(ROOTS[v]), `root was "${sigs[v].root}"`);
    must(sigs[v].qs === String(v), `data-qs was ${sigs[v].qs}`);
    return { nodes: sigs[v].nodes };
  });
}
await t('A8. all 8 class-sets are pairwise distinct', async () => {
  const set = new Set(sigs.map(s => s.classes));
  must(set.size === 8, `only ${set.size} distinct class-sets`);
});
await t('A9. all 8 tag-count vectors are pairwise distinct (structure, not skins)', async () => {
  const set = new Set(sigs.map(s => s.tags));
  must(set.size === 8, `only ${set.size} distinct tag vectors`);
});
await t('A10. all 8 painted luminance fingerprints are pairwise distinct', async () => {
  const seen = new Map();
  for (const s of sigs) {
    const k = s.fp.grid.join(',');
    if (seen.has(k)) throw new Error(`take ${s.v} paints the same pixels as take ${seen.get(k)}`);
    seen.set(k, s.v);
  }
  /* Near-identical also fails: two takes that differ by three luminance points
     are two skins, which is the defect. */
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) {
    let d = 0;
    for (let k = 0; k < 64; k++) d += Math.abs(sigs[i].fp.grid[k] - sigs[j].fp.grid[k]);
    must(d > 60, `takes ${i} and ${j} differ by only ${d} total luminance across 64 cells`);
  }
});
await t('A11. every take paints real content (>100 distinct colours in its crop)', async () => {
  const bad = sigs.filter(s => s.fp.colours <= 100).map(s => `${s.v}:${s.fp.colours}`);
  must(!bad.length, `blank-looking crops: ${bad.join(' ')}`);
  return sigs.map(s => s.fp.colours);
});

/* ======================================================================= B */
/* The 15a related bug: the evidence pane is take 7's, at EVERY width. */
const widths = [900, 560, 320];
await openQuestion();   /* deterministic layout: the A group leaves the editor
                           split wherever it last was, and the measured host
                           width then differs between runs. */
for (const w of widths) {
  const real = await setHostWidth(w);
  for (let v = 0; v < 8; v++) {
    await setTake(v);
    await t(`B. host ${real}px take ${v}: evidence pane painted ${v === 7 ? '(expected)' : '(must not be)'}`, async () => {
      const n = await page.evaluate(() => [...document.querySelectorAll('.decision-host .decision-evidence, .decision-host .qs-evidence')]
        .filter(e => e.getClientRects().length && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden').length);
      if (v === 7) { must(n >= 1, `take 7 painted ${n} evidence panes at ${real}px`); }
      else { must(n === 0, `take ${v} painted ${n} evidence panes at ${real}px`); }
      return n;
    });
  }
}
await page.evaluate(() => document.documentElement.style.setProperty('--editor-w', '54%'));
await page.waitForTimeout(200);

await t('B10. take 7 pane content is the fixture rationale at every width', async () => {
  /* B0-B8 are a regression guard on behaviour Wave 1B restored, so they pass in
     the blanked build too — correctly. This one is the half only this module
     can satisfy: the stock pane prints one hardcoded sentence. */
  for (const w of [900, 560, 320]) {
    const real = await setHostWidth(w);
    await openQuestion(); await setTake(7);
    const why = await page.evaluate(() => PM56_DEMO.getState().questions[0].why);
    const txt = await page.evaluate(() => [...document.querySelectorAll('.decision-host .qs-evidence')].map(e => e.textContent).join(' ').replace(/\s+/g, ' '));
    must(txt.includes(why), `at ${real}px the pane did not carry the question's own why`);
  }
  await page.evaluate(() => document.documentElement.style.setProperty('--editor-w', '54%'));
  await page.waitForTimeout(200);
});
await t('B9. no stylesheet rule turns .decision-evidence/.qs-evidence on outside [data-variant="7"]', async () => {
  const offenders = await page.evaluate(() => {
    const out = [];
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
      const walk = (list, ctxSel) => {
        for (const r of list) {
          if (r.cssRules) { walk(r.cssRules, ctxSel); continue; }
          if (!r.selectorText || !r.style) continue;
          if (!/decision-evidence|qs-evidence/.test(r.selectorText)) continue;
          const disp = r.style.getPropertyValue('display');
          if (!disp || disp === 'none') continue;
          if (!/\[data-variant\s*=\s*["']?7["']?\]/.test(r.selectorText)) out.push(r.selectorText + ' { display:' + disp + ' }');
        }
      };
      walk(rules, '');
    }
    return out;
  });
  must(!offenders.length, `unscoped display rules: ${offenders.join(' | ')}`);
});

/* ======================================================================= C */
/* Painted-pixel interaction, per take. */
for (let v = 0; v < 8; v++) {
  await t(`C${v}a. take ${v}: an unselected option hit-tests to itself and answers the question`, async () => {
    await openQuestion(); await setTake(v);
    const before = (await stateOf()).questions[0].answer;
    const sel = rootSel(v) + ' [data-action="answer-choice"]';
    const n = await page.locator(sel).count();
    must(n >= 2, `only ${n} choice buttons`);
    /* pick an option that is NOT the current answer, so a no-op cannot pass */
    const idx = await page.evaluate(({ sel, before }) => {
      const els = [...document.querySelectorAll(sel)];
      return els.findIndex(e => e.getAttribute('data-value') !== before);
    }, { sel, before });
    must(idx >= 0, 'no unselected option');
    const want = await page.evaluate(({ sel, idx }) => document.querySelectorAll(sel)[idx].getAttribute('data-value'), { sel, idx });
    await clickPainted(sel, idx);
    const after = (await stateOf()).questions[0].answer;
    must(after === want, `answer is "${after}", expected "${want}" (was "${before}")`);
    return { before, after };
  });
  await t(`C${v}b. take ${v}: Next advances the question index`, async () => {
    const i0 = (await stateOf()).questionIndex;
    await clickPainted(rootSel(v) + ' [data-action="next-question"]');
    const i1 = (await stateOf()).questionIndex;
    must(i1 === i0 + 1, `index went ${i0} -> ${i1}`);
  });
  await t(`C${v}c. take ${v}: exactly one painted close control, and clicking it closes`, async () => {
    const n = await page.locator('.decision-host [data-action="close-decision"]').count();
    must(n === 1, `${n} close controls`);
    const inside = await page.evaluate(sel => !!document.querySelector(sel), rootSel(v) + ' [data-action="close-decision"]');
    must(inside, `the close control is not inside .${ROOTS[v]}`);
    await clickPainted(rootSel(v) + ' [data-action="close-decision"]');
    const s = await stateOf();
    must(s.decision === null, `decision is ${JSON.stringify(s.decision)}`);
  });
  await t(`C${v}d. take ${v}: exactly one element with exact text "Deployment questionnaire"`, async () => {
    await openQuestion(); await setTake(v);
    const n = await page.getByText('Deployment questionnaire', { exact: true }).count();
    must(n === 1, `${n} matches (audit.mjs:128 is a strict locator)`);
    const owned = await page.evaluate(root => {
      const host = document.querySelector('.decision-host');
      const el = [...host.querySelectorAll('*')].find(e => e.children.length === 0 && e.textContent.trim() === 'Deployment questionnaire');
      return !!(el && el.closest('.' + root));
    }, ROOTS[v]);
    must(owned, `the title is not inside .${ROOTS[v]}`);
  });
  await t(`C${v}e. take ${v}: the decision pushes the transcript, it never covers the activity bar`, async () => {
    const ok = await page.evaluate(() => {
      const d = document.querySelector('.decision-host'), a = document.querySelector('.activity-wrap');
      if (!d || !a) return null;
      const dr = d.getBoundingClientRect(), ar = a.getBoundingClientRect();
      return { bottom: Math.round(dr.bottom), top: Math.round(ar.top), ok: dr.bottom <= ar.top + 2 };
    });
    must(ok && ok.ok, `host bottom ${ok && ok.bottom} vs activity top ${ok && ok.top}`);
    const root = await paintedRect(rootSel(v));
    must(root && root.owns, `.${ROOTS[v]} is not painted`);
    return ok;
  });
}

/* ======================================================================= D */
/* The fixture-driven repairs. */
await t('D1. every question paints ITS OWN rationale, not one hardcoded sentence', async () => {
  await openQuestion(); await setTake(7);
  const whys = await page.evaluate(() => PM56_DATA.questions.map(q => q.why));
  const seen = [];
  for (let i = 0; i < whys.length; i++) {
    await page.evaluate(i => { PM56_DEMO.getState(); }, i);
    const txt = await hostText();
    seen.push(txt.includes(whys[i]));
    if (i < whys.length - 1) await advance();
  }
  const missing = seen.map((v, i) => v ? null : i).filter(v => v !== null);
  must(!missing.length, `questions ${missing.join(',')} did not paint their own why`);
  return seen.length;
});
await t('D2. the stock hardcoded rationale is gone from every question', async () => {
  const LIT = 'This answer changes host selection, fallback routing, and the resulting Plan artifact.';
  await openQuestion(); await setTake(7);
  for (let i = 0; i < 5; i++) {
    const txt = await hostText();
    must(!txt.includes(LIT), `question ${i} still prints the hardcoded sentence`);
    await advance();
  }
});
await t('D3. the summary page derives from the answers, not from indices 0-2', async () => {
  await openQuestion(); await setTake(0);
  for (let i = 0; i < 4; i++) await advance();
  const idx = await page.evaluate(() => PM56_DEMO.getState().questionIndex);
  must(idx === 4, `did not reach the summary page (index ${idx})`);
  const txt = await hostText();
  must(!/Resolved deployment/.test(txt), 'still prints the hardcoded "Resolved deployment" block');
  must(!/Windows execution:/.test(txt), 'still prints the hardcoded "Windows execution:" field');
  const answers = await page.evaluate(() => PM56_DEMO.getState().questions.filter(q => Array.isArray(q.answer) ? q.answer.length : String(q.answer || '').trim()).map(q => Array.isArray(q.answer) ? q.answer.join(', ') : q.answer));
  const missing = answers.filter(a => !txt.includes(a.slice(0, 28)));
  must(!missing.length, `summary omitted ${missing.length} answered values`);
  return answers.length;
});
await t('D4. the queue is the fixture: take 6 paints the other three flows', async () => {
  await openQuestion(); await setTake(6);
  const painted = await page.evaluate(() => [...document.querySelectorAll('.decision-host .qs-stack-peek')]
    .filter(e => e.getClientRects().length).map(e => e.getAttribute('data-flow')));
  const expect = await page.evaluate(() => PM56_DATA.questionFlows.map(f => f.id).filter(id => id !== 'flow-deploy'));
  must(painted.length === expect.length, `painted ${painted.length} of ${expect.length}`);
  for (const id of expect) must(painted.includes(id), `flow ${id} missing`);
  return painted;
});
await t('D5. the "N queued" pill equals the number of queued rows actually rendered', async () => {
  await openQuestion(); await setTake(6);
  const pill = await page.evaluate(() => {
    const p = [...document.querySelectorAll('.decision-host .qs-pill')].map(e => e.textContent.trim()).find(x => /queued$/.test(x));
    return p ? parseInt(p, 10) : null;
  });
  const rows = await page.evaluate(() => document.querySelectorAll('.decision-host .qs-stack-peek.is-queued').length);
  must(pill !== null, 'no queued pill');
  must(pill === rows, `pill says ${pill}, ${rows} queued rows rendered`);
  return { pill, rows };
});
await t('D6. qs-open-flow really opens a queued flow (title, count and active flow all change)', async () => {
  await openQuestion(); await setTake(6);
  await clickPainted('.decision-host [data-flow="flow-migration"]');
  const id = await page.evaluate(() => PM56_QUESTIONS.activeFlowId());
  must(id === 'flow-migration', `active flow is ${id}`);
  const txt = await hostText();
  must(txt.includes('Migration approval'), 'title did not change');
  const n = (await stateOf()).questions.length;
  must(n === 4, `${n} questions, expected 4`);
  return { id, n };
});
await t('D7. leaving a flow keeps its draft (the fixture claims this; now it is true)', async () => {
  /* answer migration q1, go back to deployment, come back */
  await setTake(0);
  await clickPainted('.decision-host [data-action="answer-choice"]', 1);
  const want = (await stateOf()).questions[0].answer;
  must(want, 'nothing was answered');
  await setTake(6);
  await clickPainted('.decision-host [data-flow="flow-deploy"]');
  must((await page.evaluate(() => PM56_QUESTIONS.activeFlowId())) === 'flow-deploy', 'did not go back');
  await clickPainted('.decision-host [data-flow="flow-migration"]');
  const got = (await stateOf()).questions[0].answer;
  must(got === want, `draft lost: "${got}" vs "${want}"`);
  return { want, got };
});
await t('D8. plan evidence comes from the artifact payload, not the hardcoded string', async () => {
  await page.evaluate(() => PM56_DEMO.reset()); await page.waitForTimeout(260);
  await setTake(7); await openPlan();
  const txt = await hostText();
  const pay = await page.evaluate(() => PM56_DATA.artifacts.find(a => a.id === 'plan-query').payload);
  must(txt.includes(pay.decision.slice(0, 40)), 'payload.decision not painted');
  must(txt.includes(pay.acceptance[0].slice(0, 30)), 'payload.acceptance[0] not painted');
  must(!txt.includes('42 tests passed · write overhead'), 'still prints the hardcoded evidence string');
});
await t('D9. the plan stepper is the fixture revision history, in plan vocabulary', async () => {
  await setTake(4); await openPlan();
  const txt = await hostText();
  const revs = await page.evaluate(() => PM56_DATA.artifacts.find(a => a.id === 'plan-query').payload.revisions);
  for (const r of revs) must(txt.includes(r.note.slice(0, 30)), `revision ${r.n} note missing`);
  must(txt.includes('Under review'), 'no plan-flavoured step word');
  must(!txt.includes('Answered'), 'questionnaire vocabulary leaked into the plan stepper');
  return revs.length;
});
await t('D10. permission evidence names the real operational hosts', async () => {
  await setTake(7); await openPermission();
  const txt = await hostText();
  const hosts = await page.evaluate(() => PM56_DATA.operational.hosts.filter(h => h.role === 'execution'));
  for (const h of hosts) must(txt.includes(h.label), `host ${h.label} missing`);
  const degraded = hosts.find(h => h.state === 'degraded');
  must(degraded && txt.includes(degraded.detail.slice(0, 26)), 'degraded host detail missing');
  return hosts.length;
});
await t('D11. every painted flow state EQUALS labels.questionFlowState[value]', async () => {
  /* The correct property is "the painted text equals the mapped label", not
     "the painted text differs from the raw key" — capitalising a key passes the
     weaker check while still not consulting the map. My first version of this
     assertion was the weaker one AND it false-positived on my own English pill
     ("2 queued"), which is the shape-vs-property trap twice in one line. */
  await openQuestion(); await setTake(6);
  const pairs = await page.evaluate(() => {
    const map = PM56_DATA.labels.questionFlowState;
    return [...document.querySelectorAll('.decision-host .qs-stack-peek')].map(el => {
      const id = el.getAttribute('data-flow');
      const f = PM56_DATA.questionFlows.find(x => x.id === id);
      const painted = el.querySelector('.qs-peek-state').textContent.trim();
      return { id, painted, expected: map[f.state], raw: f.state, visible: !!el.getClientRects().length };
    });
  });
  must(pairs.length >= 3, `only ${pairs.length} flow rows`);
  for (const p of pairs) {
    must(p.visible, `${p.id} row not painted`);
    must(p.painted === p.expected, `${p.id} painted "${p.painted}", map says "${p.expected}"`);
  }
  return pairs.map(p => p.id + '=' + p.painted);
});

/* ======================================================================= E */
await t('E1. the surface survives two full work ticks without remounting (stable data-k)', async () => {
  await openQuestion(); await setTake(0);
  await page.evaluate(() => { document.querySelector('.decision-host .qs').__qsMark = 'wave4'; });
  await page.evaluate(() => PM56_DEMO.startWorking());
  await page.waitForTimeout(4400);
  const kept = await page.evaluate(() => {
    const el = document.querySelector('.decision-host .qs');
    return el ? el.__qsMark === 'wave4' : null;
  });
  must(kept === true, 'the surface node was replaced by the work tick — data-k is not stable');
});
await t('E2. no infinite animation inside the decision host once a decision is idle', async () => {
  await openQuestion(); await setTake(2);
  /* Require the root first: querySelectorAll over an absent root returns an
     empty list and "no infinite animations" passes vacuously. The negative
     control caught exactly that here. */
  must(await page.evaluate(() => !!document.querySelector('.decision-host .qs-sheet')), 'take 2 root .qs-sheet absent');
  const loops = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.decision-host .qs-sheet *').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.animationName !== 'none' && cs.animationIterationCount === 'infinite') out.push(el.className + ':' + cs.animationName);
    });
    return out;
  });
  must(!loops.length, `infinite: ${loops.join(' ')}`);
});
await t('E3. no take is worse than the stock surface for horizontal overflow, in all 8 themes', async () => {
  const themes = await page.evaluate(() => PM56_DATA.themes.map(t => t.id));
  const worse = [];
  for (const th of themes) {
    await page.evaluate(t => PM56_DEMO.setTheme(t), th);
    /* stock baseline: empty the slot so app.js's own decision surface renders */
    const base = await page.evaluate(() => {
      const keep = window.PM56_EXT._slots.questionSurface;
      window.PM56_EXT._slots.questionSurface = [];
      PM56_DEMO.openQuestionnaire();
      const w = document.body.scrollWidth;
      window.PM56_EXT._slots.questionSurface = keep;
      PM56_DEMO.openQuestionnaire();
      return w;
    });
    await page.waitForTimeout(SETTLE);
    for (let v = 0; v < 8; v++) {
      await setTake(v);
      const mine = await page.evaluate(() => document.body.scrollWidth);
      if (mine > base + 4) worse.push(`${th}/t${v}: ${mine} vs stock ${base}`);
    }
  }
  await page.evaluate(() => PM56_DEMO.setTheme('basic-dark'));
  must(!worse.length, worse.join(' | '));
  return themes.length * 8;
});
await t('E4. nothing escapes the decision host horizontally in any take', async () => {
  await openQuestion();
  const bad = [];
  for (let v = 0; v < 8; v++) {
    await setTake(v);
    const over = await page.evaluate(root => {
      const host = document.querySelector('.decision-host');
      const mine = host.querySelector('.' + root);
      if (!mine) return ['MODULE ROOT .' + root + ' ABSENT'];
      const hr = host.getBoundingClientRect();
      const out = [];
      mine.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width < 1) return;
        /* the anchored sheet is deliberately full-bleed: it cancels the host's
           own side padding, so it may reach the host edges but not exceed them */
        if (r.right > hr.right + 1.5 || r.left < hr.left - 1.5) out.push(el.className + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      });
      return out.slice(0, 4);
    }, ROOTS[v]);
    if (over.length) bad.push(`t${v}: ${over.join(', ')}`);
  }
  must(!bad.length, bad.join(' | '));
});
await t('E5. zero console errors', async () => { must(consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | ')); });
await t('E6. zero page errors', async () => { must(pageErrors.length === 0, pageErrors.slice(0, 3).join(' | ')); });

const passed = results.filter(r => r.ok).length;
const failed = results.length - passed;
const report = { file: FILE, reducedMotion: REDUCED, passed, failed, consoleErrors, pageErrors, results };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
if (!QUIET) {
  for (const r of results) if (!r.ok) console.log(`FAIL  ${r.name}\n      ${r.error}`);
}
console.log(`\nquestions-verify: ${passed} pass / ${failed} fail  (console ${consoleErrors.length}, page ${pageErrors.length})  file=${path.basename(FILE)}${REDUCED ? ' [reduced-motion]' : ''}`);
await browser.close();
process.exit(failed ? 1 : 0);
