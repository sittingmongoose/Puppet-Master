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
const SETTLE = 680;   /* past the ~370ms pill→card morph; a surface measured mid-spring
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

const ROOTS = ['qs-card', 'qs-morph', 'qs-sheet', 'qs-inspector', 'qs-seq', 'qs-tech', 'qs-stack', 'qs-split', 'qs-ask'];
/* Every behavioural assertion is scoped to the TAKE'S OWN ROOT. Unscoped, all
   forty C-assertions pass against a build with this module blanked — app.js's
   stock surface also has one close button, one title and a choice grid — which
   is forty vacuous passes proving nothing about the eight structures. The
   negative control is what exposed that; see WAVE4_DECISIONS_LOG.md. */
const rootSel = v => '.decision-host .' + ROOTS[v];
const TAKE_COUNT = ROOTS.length;

/* ======================================================================= A */
/* Structural distinctness — the explicit standard for this family. */
await openQuestion();
const sigs = [];
for (let v = 0; v < TAKE_COUNT; v++) {
  await setTake(v);
  const s = await page.evaluate(() => {
    const host = document.querySelector('.decision-host');
    if (!host) return null;
    const cls = new Set(), tags = {};
    host.querySelectorAll('*').forEach(el => { tags[el.tagName] = (tags[el.tagName] || 0) + 1; el.classList.forEach(c => cls.add(c)); });
    const take = host.querySelector('[data-qs]');
    return {
      root: take ? take.className : (host.firstElementChild ? host.firstElementChild.className : ''),
      qs: take ? take.getAttribute('data-qs') : null,
      classes: [...cls].sort().join(' '),
      tags: JSON.stringify(Object.keys(tags).sort().map(k => k + ':' + tags[k])),
      nodes: host.querySelectorAll('*').length
    };
  });
  const fp = await fingerprint(await hostClip());
  sigs.push({ v, ...s, fp });
}
for (let v = 0; v < TAKE_COUNT; v++) {
  await t(`A${v}. take ${v} emits its own root (.${ROOTS[v]}) and data-qs="${v}"`, async () => {
    must(sigs[v], 'no signature');
    must(String(sigs[v].root).includes(ROOTS[v]), `root was "${sigs[v].root}"`);
    must(sigs[v].qs === String(v), `data-qs was ${sigs[v].qs}`);
    return { nodes: sigs[v].nodes };
  });
}
await t('A12. all 9 class-sets are pairwise distinct', async () => {
  const set = new Set(sigs.map(s => s.classes));
  must(set.size === TAKE_COUNT, `only ${set.size} distinct class-sets`);
});
await t('A13. all 9 tag-count vectors are pairwise distinct (structure, not skins)', async () => {
  const set = new Set(sigs.map(s => s.tags));
  must(set.size === TAKE_COUNT, `only ${set.size} distinct tag vectors`);
});
await t('A14. all 9 painted luminance fingerprints are pairwise distinct', async () => {
  const seen = new Map();
  for (const s of sigs) {
    const k = s.fp.grid.join(',');
    if (seen.has(k)) throw new Error(`take ${s.v} paints the same pixels as take ${seen.get(k)}`);
    seen.set(k, s.v);
  }
  /* Near-identical also fails: two takes that differ by three luminance points
     are two skins, which is the defect. */
  for (let i = 0; i < TAKE_COUNT; i++) for (let j = i + 1; j < TAKE_COUNT; j++) {
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
  for (let v = 0; v < TAKE_COUNT; v++) {
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
for (let v = 0; v < TAKE_COUNT; v++) {
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
    await page.waitForTimeout(REDUCED ? 40 : 900);
    const s = await stateOf();
    must(s.decision === null, `decision is ${JSON.stringify(s.decision)}`);
  });
  await t(`C${v}d. take ${v}: exactly one element with exact text "Deployment questionnaire"`, async () => {
    await openQuestion(); await setTake(v);
    if (v === 8) {
      const prompt = await page.evaluate(() => (PM56_DEMO.getState().questions[0].prompt || '').trim());
      const title = await page.evaluate(() => (document.querySelector('.qs-ask-title')?.textContent || '').replace(/\s+/g, ' ').trim());
      must(title.indexOf(prompt.slice(0, 24)) >= 0, `Ask Card title was "${title}"`);
      const n = await page.getByText('Deployment questionnaire', { exact: true }).count();
      must(n === 0, 'Ask Card painted the flow title');
      return { title };
    }
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
await t('D5. header chrome has no queued/Required/Optional pills; queue peeks still match the fixture', async () => {
  await openQuestion(); await setTake(6);
  const pills = await page.evaluate(() => [...document.querySelectorAll('.decision-host .qs-pill, .decision-host .qs-head .meta-pill, .decision-host .qs-morph-under .meta-pill')]
    .map(e => e.textContent.trim()).filter(t => /queued$|queued this session|^Required$|^Optional$/.test(t)));
  must(!pills.length, `header pills still present: ${pills.join(' | ')}`);
  const rows = await page.evaluate(() => document.querySelectorAll('.decision-host .qs-stack-peek.is-queued').length);
  const expect = await page.evaluate(() => PM56_DATA.questionFlows.filter(f => f.id !== 'flow-deploy' && f.state === 'queued').length);
  must(rows === expect, `queued peeks ${rows}, fixture ${expect}`);
  return { rows, expect };
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

/* ======================================================================= Q */
await t('Q1. no take paints queued/Required/Optional header pills', async () => {
  await openQuestion();
  const bad = [];
  for (let v = 0; v < TAKE_COUNT; v++) {
    await setTake(v);
    const pills = await page.evaluate(() => [...document.querySelectorAll('.decision-host .qs-pill, .decision-host .qs-head .meta-pill, .decision-host .qs-morph-under .qs-pill')]
      .map(e => e.textContent.trim()).filter(t => /queued$|queued this session|^Required$|^Optional$/.test(t)));
    if (pills.length) bad.push(`t${v}: ${pills.join(',')}`);
  }
  must(!bad.length, bad.join(' | '));
});
await t('Q2. choice cards always expose a fifth Something else row', async () => {
  await openQuestion();
  for (let v of [0, 2, 7, 8]) {
    await setTake(v);
    const ph = await page.evaluate(() => {
      const el = document.querySelector('.decision-host [data-input="question-other"]');
      return el ? el.getAttribute('placeholder') : null;
    });
    must(ph === 'Something else…', `take ${v} placeholder was ${JSON.stringify(ph)}`);
  }
});
await t('Q3. step ticks dispatch qs-goto-question on every take, including 2 and 7', async () => {
  await openQuestion();
  for (let v of [0, 2, 7, 8]) {
    await setTake(v);
    const n = await page.evaluate(sel => document.querySelectorAll(sel + ' [data-action="qs-goto-question"]').length, rootSel(v));
    must(n >= 5, `take ${v} has ${n} goto ticks`);
  }
  await setTake(0);
  await clickPainted(rootSel(0) + ' [data-action="qs-goto-question"]', 2);
  must((await stateOf()).questionIndex === 2, 'tick did not jump to question 3');
});
await t('Q4. jump-bottom sits above an open questionnaire host', async () => {
  await openQuestion(); await setTake(0);
  const geo = await page.evaluate(() => {
    const stage = document.querySelector('.chat-stage');
    const j = document.querySelector('.jump-bottom');
    const d = document.querySelector('.decision-host');
    if (!stage || !j || !d) return null;
    const dh = getComputedStyle(stage).getPropertyValue('--decision-h').trim();
    const jr = j.getBoundingClientRect(), dr = d.getBoundingClientRect();
    return { dh, jBottom: Math.round(jr.bottom), dTop: Math.round(dr.top), empty: d.classList.contains('empty') };
  });
  must(geo, 'jump or host missing');
  must(!geo.empty, 'host was empty');
  must(parseFloat(geo.dh) > 8, `--decision-h was ${geo.dh}`);
  must(geo.jBottom <= geo.dTop + 2, `jump bottom ${geo.jBottom} vs host top ${geo.dTop}`);
  return geo;
});
await t('Q5. Ask Card matches composer width, right-side ticks, consecutive Something else', async () => {
  await openQuestion();
  await setTake(8);
  const geo = await page.evaluate(() => {
    const owns = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
    };
    const ask = document.querySelector('.qs-ask');
    const box = document.querySelector('.composer-box');
    const ticks = document.querySelector('.qs-spine');
    const foot = document.querySelector('.qs-ask-foot');
    const lastTick = ticks && [...ticks.querySelectorAll('.qs-spine-slot')].pop();
    const optNum = document.querySelector('.qs-ask-opt .qs-num');
    const otherNum = document.querySelector('.qs-other .qs-num');
    const otherMark = document.querySelector('.qs-other-ask .qs-ask-mark');
    if (!ask || !box || !ticks) return null;
    const ar = ask.getBoundingClientRect(), br = box.getBoundingClientRect(), tr = ticks.getBoundingClientRect();
    const fr = foot ? foot.getBoundingClientRect() : { top: ar.bottom, bottom: ar.bottom };
    return {
      askW: Math.round(ar.width), boxW: Math.round(br.width),
      askH: Math.round(ar.height),
      ticksW: Math.round(tr.width), ticksH: Math.round(tr.height),
      ticksRight: Math.round(ar.right - tr.right),
      ticksBottom: Math.round(tr.bottom), askBottom: Math.round(ar.bottom), footTop: Math.round(fr.top),
      lastTickOwns: owns(lastTick), footOwns: owns(foot),
      otherMarkClass: otherMark ? otherMark.className : null,
      otherEmpty: !!(otherMark && otherMark.classList.contains('qs-ask-mark-empty')),
      numX: optNum ? Math.round(optNum.getBoundingClientRect().x) : null,
      otherX: otherNum ? Math.round(otherNum.getBoundingClientRect().x) : null,
      nums: [...document.querySelectorAll('.qs-ask .qs-num')].map(n => n.textContent.trim())
    };
  });
  must(geo, 'Ask Card geometry missing');
  must(Math.abs(geo.askW - geo.boxW) <= 8, `ask ${geo.askW} vs composer ${geo.boxW}`);
  must(geo.askH < 380, `ask height ${geo.askH} still inflated`);
  must(geo.ticksW <= 28, `ticks width ${geo.ticksW}`);
  must(geo.lastTickOwns, 'last tick not painted');
  must(geo.footOwns, 'footer not painted');
  must(geo.ticksBottom <= geo.askBottom - 2, `ticks bottom ${geo.ticksBottom} vs ask ${geo.askBottom}`);
  must(geo.ticksBottom <= geo.footTop + 4, `ticks bottom ${geo.ticksBottom} vs foot top ${geo.footTop}`);
  must(geo.ticksRight <= 18, `ticks not on the right edge (inset ${geo.ticksRight})`);
  must(geo.numX != null && Math.abs(geo.numX - geo.otherX) <= 6, `other num x ${geo.otherX} vs ${geo.numX}`);
  must(geo.nums.join(' ') === '1. 2. 3. 4. 5.', `q1 nums ${geo.nums.join(' ')}`);
  must(geo.otherMarkClass && /qs-ask-mark-radio/.test(geo.otherMarkClass), `other mark ${geo.otherMarkClass}`);
  must(!geo.otherEmpty, 'Something else radio is the empty spacer');
  await clickPainted('.qs-ask [data-action="answer-choice"]', 0);
  const afterPreset = await page.evaluate(() => {
    const mark = document.querySelector('.qs-other-ask .qs-ask-mark');
    const otherOn = document.querySelector('.qs-other-ask.is-on');
    const presetOn = document.querySelectorAll('.qs-ask-opt.is-on').length;
    return { markOn: !!(mark && mark.classList.contains('is-on')), otherOn: !!otherOn, presetOn };
  });
  must(!afterPreset.markOn && !afterPreset.otherOn, `other still on after preset: ${JSON.stringify(afterPreset)}`);
  must(afterPreset.presetOn >= 1, 'preset did not select');
  await page.locator('.qs-ask .qs-other-input').fill('custom path');
  await page.waitForTimeout(120);
  const afterOther = await page.evaluate(() => {
    const mark = document.querySelector('.qs-other-ask .qs-ask-mark');
    const otherOn = !!document.querySelector('.qs-other-ask.is-on')
      || !!(mark && mark.classList.contains('is-on'));
    const presetOn = document.querySelectorAll('.qs-ask-opt.is-on').length;
    return { otherOn, presetOn, markClass: mark && mark.className };
  });
  must(afterOther.otherOn, `other not on after typing: ${JSON.stringify(afterOther)}`);
  must(afterOther.presetOn === 0, `presets still on after other: ${JSON.stringify(afterOther)}`);
  await clickPainted('.qs-ask [data-action="qs-goto-question"]', 2);
  await page.waitForTimeout(500);
  const n3 = await page.evaluate(() => {
    const owns = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
    };
    const ticks = document.querySelector('.qs-spine');
    const lastTick = ticks && [...ticks.querySelectorAll('.qs-spine-slot')].pop();
    const foot = document.querySelector('.qs-ask-foot');
    return {
      nums: [...document.querySelectorAll('.qs-ask .qs-num')].map(n => n.textContent.trim()),
      lastTickOwns: owns(lastTick), footOwns: owns(foot)
    };
  });
  must(n3.nums.join(' ') === '1. 2. 3. 4.', `q3 nums ${n3.nums.join(' ')} — Something else must be 4`);
  must(n3.lastTickOwns, 'q3 last tick not painted');
  must(n3.footOwns, 'q3 footer not painted');
  await clickPainted('.qs-ask [data-action="qs-goto-question"]', 3);
  await page.waitForTimeout(500);
  const n4 = await page.evaluate(() => {
    const owns = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
    };
    const ticks = document.querySelector('.qs-spine');
    const lastTick = ticks && [...ticks.querySelectorAll('.qs-spine-slot')].pop();
    const foot = document.querySelector('.qs-ask-foot');
    const mark = document.querySelector('.qs-other-ask .qs-ask-mark');
    const note = document.querySelector('.qs-ask-note-input, .qs-ask-note [data-input="question-other"]');
    return {
      lastTickOwns: owns(lastTick), footOwns: owns(foot), hasMark: !!mark,
      noteOwns: owns(note),
      nums: [...document.querySelectorAll('.qs-ask .qs-num')].map(n => n.textContent.trim()),
      leadingOne: !!document.querySelector('.qs-ask-opt .qs-num, .qs-ask-note .qs-num')
    };
  });
  must(n4.lastTickOwns, 'q4 last tick not painted');
  must(n4.footOwns, 'q4 footer not painted');
  must(!n4.hasMark, 'text question painted an extra Something else mark');
  must(n4.noteOwns, 'q4 note textarea not painted');
  must(!n4.leadingOne, `q4 still looks like option 1. (${n4.nums.join(' ')})`);
  must(!n4.nums.length, `q4 nums ${n4.nums.join(' ')}`);
  return { ...geo, n3, n4 };
});
await t('Q6. Ask Card paints Back + Next on q1 and a choice click does not auto-advance', async () => {
  await openQuestion();
  await setTake(8);
  const nav = await page.evaluate(() => {
    const back = document.querySelector('.qs-ask [data-action="prev-question"]');
    const next = document.querySelector('.qs-ask [data-action="next-question"]');
    const skip = document.querySelector('.qs-ask [data-action="skip-question"]');
    return {
      backDisabled: !!(back && back.disabled),
      next: !!next,
      skip: !!skip
    };
  });
  must(nav.backDisabled, 'Back missing or not disabled on q1');
  must(nav.next, 'Next missing on q1');
  must(nav.skip, 'Skip missing on q1');
  const nextPaint = await paintedRect('.qs-ask [data-action="next-question"]');
  must(nextPaint && nextPaint.owns, `Next not painted: ${JSON.stringify(nextPaint)}`);
  const i0 = (await stateOf()).questionIndex;
  must(i0 === 0, `started at ${i0}`);
  await clickPainted('.qs-ask [data-action="answer-choice"]', 1);
  await page.waitForTimeout(400);
  const i1 = (await stateOf()).questionIndex;
  must(i1 === 0, `choice auto-advanced to ${i1}`);
  return { nav, i0, i1 };
});
await t('Q7. Ask Card multi uses checkboxes, Select all that apply, and two is-on rows', async () => {
  await openQuestion();
  await setTake(8);
  await clickPainted('.qs-ask [data-action="qs-goto-question"]', 1);
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => {
    const sub = (document.querySelector('.qs-ask-sub')?.textContent || '').replace(/\s+/g, ' ').trim();
    const checks = document.querySelectorAll('.qs-ask-opt.is-multi .qs-ask-mark-check').length;
    const radios = document.querySelectorAll('.qs-ask-opt.is-choice .qs-ask-mark-radio').length;
    const on = document.querySelectorAll('.qs-ask-opt.is-on').length;
    return { sub, checks, radios, on, idx: PM56_DEMO.getState().questionIndex };
  });
  must(info.idx === 1, `on q${info.idx + 1}, expected q2`);
  must(/Select all that apply/.test(info.sub), `sub "${info.sub}"`);
  must(info.checks >= 3, `checkbox marks ${info.checks}`);
  must(info.radios === 0, `choice radios on multi (${info.radios})`);
  must(info.on >= 2, `only ${info.on} is-on rows`);
  return info;
});
await t('Q8. Ask Card review is tappable rows, not the summary grid', async () => {
  await openQuestion();
  await setTake(8);
  await clickPainted('.qs-ask [data-action="qs-goto-question"]', 4);
  await page.waitForTimeout(420);
  const info = await page.evaluate(() => {
    const owns = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const hit = document.elementFromPoint(x, y);
      return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
    };
    const rows = [...document.querySelectorAll('.qs-ask-review-row')];
    const last = rows[rows.length - 1];
    const submit = document.querySelector('.qs-ask [data-action="submit-questionnaire"]');
    const sample = rows[0];
    const q = sample && sample.querySelector('.qs-ask-review-q');
    const a = sample && sample.querySelector('.qs-ask-review-a');
    const qW = q ? parseFloat(getComputedStyle(q).fontWeight) : 0;
    const aW = a ? parseFloat(getComputedStyle(a).fontWeight) : 0;
    return {
      review: rows.length,
      summary: document.querySelectorAll('.qs-summary').length,
      skip: !!document.querySelector('.qs-ask [data-action="skip-question"]'),
      submit: !!submit,
      next: !!document.querySelector('.qs-ask [data-action="next-question"]'),
      idx: PM56_DEMO.getState().questionIndex,
      qText: q ? q.textContent.trim() : '',
      aText: a ? a.textContent.trim() : '',
      qW, aW,
      lastOwns: owns(last),
      submitOwns: owns(submit),
      other: !!document.querySelector('.qs-ask .qs-other')
    };
  });
  must(info.idx === 4, `on q${info.idx + 1}, expected review`);
  must(info.review >= 4, `review rows ${info.review}`);
  must(info.summary === 0, 'generic summary grid painted');
  must(!info.skip, 'Skip on review');
  must(info.submit, 'Submit missing on review');
  must(!info.next, 'Next on review');
  must(!info.other, 'Something else on review');
  must(info.qText.length > 8, `review question line "${info.qText}"`);
  must(info.aText.length > 0, 'review answer line missing');
  must(info.aW > info.qW, `answer weight ${info.aW} vs question ${info.qW}`);
  must(info.lastOwns, 'last review row not painted');
  must(info.submitOwns, 'Submit not painted');
  await clickPainted('.qs-ask-review-row', 0);
  await page.waitForTimeout(420);
  const back = (await stateOf()).questionIndex;
  must(back === 0, `review row jumped to ${back}`);
  return info;
});
await t('Q9. Ask Card reopen plays the pill morph', async () => {
  await openQuestion();
  await setTake(8);
  await clickPainted('.qs-ask [data-action="close-decision"]');
  await page.waitForTimeout(REDUCED ? 40 : 900);
  must((await stateOf()).decision === null, 'close did not clear the decision');
  await page.evaluate(() => PM56_DEMO.openQuestionnaire());
  const morph = await page.evaluate(() => {
    const shell = document.querySelector('.decision-host .qs-shell');
    if (!shell) return null;
    const opening = shell.classList.contains('qs-will-open') || shell.classList.contains('qs-opening');
    const heightAnim = typeof shell.getAnimations === 'function' && shell.getAnimations().some(a => {
      try {
        const k = a.effect && a.effect.getKeyframes && a.effect.getKeyframes();
        return !!(k && k.some(frame => frame.height != null));
      } catch (e) { return false; }
    });
    return { opening, heightAnim, cls: shell.className };
  });
  must(morph, 'shell missing after reopen');
  if (!REDUCED) must(morph.opening || morph.heightAnim, `reopen had no morph: ${morph.cls}`);
  await page.waitForTimeout(SETTLE);
  const settled = await paintedRect('.qs-ask');
  must(settled && settled.owns, `Ask Card not painted after remorph: ${JSON.stringify(settled)}`);
  return morph;
});
await t('Q10. Ask Card preparing pill is a row with a two-ring orrery', async () => {
  await page.evaluate(() => { PM56_DEMO.reset(); });
  await page.waitForTimeout(260);
  await page.evaluate(() => {
    PM56_DEMO.setVariant(6, 8);
    PM56_DEMO.trigger('Prepare questions');
  });
  await page.waitForSelector('.decision-host .qs-orrery', { timeout: 1500 });
  const info = await page.evaluate(() => {
    const pill = document.querySelector('.decision-host .qs-pill-beat');
    const label = document.querySelector('.decision-host .qs-pill-label');
    const orrery = document.querySelector('.decision-host .qs-orrery');
    if (!pill || !label || !orrery) {
      return { missing: true, pill: !!pill, label: !!label, orrery: !!orrery };
    }
    const pr = pill.getBoundingClientRect();
    const lr = label.getBoundingClientRect();
    const or_ = orrery.getBoundingClientRect();
    const ringN = pill.querySelectorAll('.qs-orrery-ring').length;
    const beadN = pill.querySelectorAll('.qs-orrery-bead').length;
    const ringA = pill.querySelector('.qs-orrery-a');
    const bead = pill.querySelector('.qs-orrery-bead');
    return {
      dir: getComputedStyle(pill).flexDirection,
      wrap: getComputedStyle(pill).flexWrap,
      labelCx: lr.left + lr.width / 2,
      orreryCx: or_.left + or_.width / 2,
      labelCy: lr.top + lr.height / 2,
      orreryCy: or_.top + or_.height / 2,
      ringN, beadN,
      pillH: Math.round(pr.height),
      orreryAnim: ringA ? getComputedStyle(ringA).animationName : '',
      beadAnim: bead ? getComputedStyle(bead).animationName : ''
    };
  });
  must(!info.missing, `preparing pill missing: ${JSON.stringify(info)}`);
  must(info.dir === 'row', `pill flex-direction ${info.dir}`);
  must(info.wrap === 'nowrap', `pill flex-wrap ${info.wrap}`);
  must(info.orreryCx > info.labelCx, `orrery cx ${info.orreryCx} not right of label ${info.labelCx}`);
  must(Math.abs(info.orreryCy - info.labelCy) <= 6, `orrery/label cy ${info.orreryCy} vs ${info.labelCy}`);
  must(info.ringN === 2, `orrery rings ${info.ringN}`);
  must(info.beadN === 3, `orrery beads ${info.beadN}`);
  if (REDUCED) {
    must(info.orreryAnim === 'none', `reduced orrery anim ${info.orreryAnim}`);
    must(info.beadAnim === 'none', `reduced bead anim ${info.beadAnim}`);
  }
  return info;
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
    for (let v = 0; v < TAKE_COUNT; v++) {
      await setTake(v);
      const mine = await page.evaluate(() => document.body.scrollWidth);
      if (mine > base + 4) worse.push(`${th}/t${v}: ${mine} vs stock ${base}`);
    }
  }
  await page.evaluate(() => PM56_DEMO.setTheme('basic-dark'));
  must(!worse.length, worse.join(' | '));
  return themes.length * TAKE_COUNT;
});
await t('E4. nothing escapes the decision host horizontally in any take', async () => {
  await openQuestion();
  const bad = [];
  for (let v = 0; v < TAKE_COUNT; v++) {
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
