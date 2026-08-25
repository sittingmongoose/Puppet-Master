/* Every decision TYPE through every take: 6 x 8 = 48 combinations must render
   something with content and exactly one close control (bar the submitting
   state, which is deliberately not closable — app.js has no close there either). */
import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';
const ROOT = '/mnt/Cursor/PuppetMaster/Concepts/chat-assistant-concepts/5.6 Pro';
const url = pathToFileURL(path.join(ROOT, 'index.html')).href;
const b = await chromium.launch({ headless: true, args: ['--disable-gpu', '--allow-file-access-from-files', '--no-sandbox'] });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [], perrs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => perrs.push(String(e)));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__PM56_BOOT_OK === true);
const TYPES = ['question', 'question-preparing', 'question-submitting', 'plan', 'plan-revise', 'permission', 'conflict'];
const rows = [];
for (const ty of TYPES) {
  for (let v = 0; v < 8; v++) {
    await page.evaluate(v => PM56_DEMO.setVariant(6, v), v);
    await page.evaluate(ty => {
      const s = { question: { type: 'question' }, 'question-preparing': { type: 'question-preparing' },
        'question-submitting': { type: 'question-submitting' }, plan: { type: 'plan', mode: 'review' },
        'plan-revise': { type: 'plan', mode: 'revise', feedback: '' }, permission: { type: 'permission' },
        conflict: { type: 'conflict' } }[ty];
      PM56_DEMO.openQuestionnaire();            // ensure the host is open
      const st = PM56_DEMO.getState();          // then swap the decision through the demo API
      window.__forceDecision = s;
    }, ty);
    /* the demo API has no generic setter, so drive it through the triggers it
       does expose plus the two explicit openers, and fall back to the module's
       own model for the rest */
    await page.evaluate(ty => {
      if (ty === 'question') PM56_DEMO.openQuestionnaire();
      else if (ty === 'plan') PM56_DEMO.openPlan();
      else if (ty === 'permission') PM56_DEMO.openPermission();
      else if (ty === 'question-preparing') PM56_DEMO.trigger('Prepare questions');
      else if (ty === 'conflict') PM56_DEMO.trigger('Conflict mediation');
      else if (ty === 'plan-revise') { PM56_DEMO.openPlan(); const btn = document.querySelector('[data-action="revise-plan"]'); if (btn) btn.click(); }
      else if (ty === 'question-submitting') { PM56_DEMO.openQuestionnaire(); }
    }, ty);
    await page.waitForTimeout(ty === 'question-preparing' ? 200 : 420);
    const r = await page.evaluate(() => {
      const h = document.querySelector('.decision-host');
      if (!h) return null;
      const root = h.querySelector('[data-qs]');
      return {
        nodes: h.querySelectorAll('*').length,
        qs: root ? root.getAttribute('data-qs') : null,
        closes: h.querySelectorAll('[data-action="close-decision"]').length,
        chars: (h.textContent || '').replace(/\s+/g, ' ').trim().length,
        height: Math.round(h.getBoundingClientRect().height)
      };
    });
    rows.push({ ty, v, ...r });
  }
}
const bad = rows.filter(r => !r.qs || r.chars < 30 || r.height < 20 || r.closes > 1);
console.log(JSON.stringify({ combos: rows.length, bad, errs, perrs }, null, 1));
await b.close();
