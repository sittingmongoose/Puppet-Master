/* railkit.mjs — shared Playwright helpers for the Mac review tools (railshots.mjs, railfilm.mjs). Runs on jared-mac
 * (Apple M3, Metal GPU) in ~/pm-motion-lab, where playwright is installed. Never on the VM (use rail_boot.mjs there). */
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';

export async function openPage(html, { width = 1440, height = 900, reduced = false } = {}) {
  const browser = await chromium.launch({ channel: 'chromium', args: ['--no-sandbox', '--enable-gpu', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e.message).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text().slice(0, 300)); });
  await page.goto(pathToFileURL(html).href + '?o55=off');
  await page.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1', null, { timeout: 30000 });
  await page.bringToFront();
  const wait = (ms) => page.waitForTimeout(ms);
  const ev = (f, a) => page.evaluate(f, a);
  const pm = {
    page, ctx, browser, errors, wait, ev,
    async concept(id) { await ev((c) => window.PMR.concepts.set(c), id); await wait(700); },
    async theme(slug, nier = false) {
      await ev(async ([s, n]) => {
        if (window.PM_NIER && window.PM_NIER.setTransition) window.PM_NIER.setTransition((repaint) => repaint());
        if (window.PM_NIER) { if (n && !window.PM_NIER.on()) await window.PM_NIER.set(true); if (!n && window.PM_NIER.on()) await window.PM_NIER.set(false); }
        const [f, m] = s.split('-'); window.PM_THEME.setFamily(f); window.PM_THEME.setMode(m);
      }, [slug, nier]);
      await wait(900);
    },
    async panel(id) {
      await ev((p) => {
        const slot = document.getElementById('sidePanelSlot'), orig = document.getElementById('panel-' + p);
        if (orig && orig.classList.contains('active') && !slot.classList.contains('hidden')) return;
        document.querySelector(`#activityBar .icon[data-target="panel-${p}"]`).click();
      }, id);
      await wait(700);
    },
    async click(sel, i = 0) { const hs = (await page.$$(sel)); const vis = []; for (const h of hs) if (await h.isVisible()) vis.push(h); if (!vis[i]) return false; await vis[i].click(); return true; },
    async hover(sel) { const h = await page.$(sel); if (h) await h.hover(); },
    async key(k) { await page.keyboard.press(k); },
    async expandBar(on = true) { await ev((o) => { const b = document.getElementById('activityBar'); if (b.classList.contains('collapsed') === o) document.getElementById('activityBarToggle').click(); }, on); await wait(500); },
    /* the rail plus room for anything beside it (the Lens): x from the bar, width bar+slot+extra */
    async railClip(extra = 0) {
      return ev((x) => {
        const a = document.getElementById('activityBar').getBoundingClientRect(), s = document.getElementById('sidePanelSlot').getBoundingClientRect();
        const top = Math.min(a.top, s.top), bottom = Math.max(a.bottom, s.bottom);
        let w = Math.ceil(s.right - a.left + x);
        const ov = document.querySelector('#pmr-overlay > *');
        if (ov) { const r = ov.getBoundingClientRect(); if (r.width > 4) w = Math.max(w, Math.ceil(r.right - a.left + 12)); }
        w = Math.min(w, window.innerWidth - Math.floor(a.left));
        return { x: Math.floor(a.left), y: Math.floor(top), width: w - (w % 2), height: Math.ceil(bottom - top) - (Math.ceil(bottom - top) % 2) };
      }, extra);
    },
  };
  return pm;
}
