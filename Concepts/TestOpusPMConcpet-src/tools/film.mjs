/* =====================================================================
   film.mjs — frame-accurate motion capture.

   Drives the concept, records a CDP screencast at the compositor's own
   rate, and writes numbered frames. A SLOW factor multiplies every CSS
   animation/transition duration uniformly, so the same easing curve is
   sampled at N times the effective frame rate — 4x slow at ~25fps yields
   ~100fps of real motion for frame-by-frame review.

   Usage:  SHOT=<name> SLOW=4 MS=2600 node tools/film.mjs
   ===================================================================== */
import { launch } from './drive.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';

const SHOT  = process.env.SHOT  || 'scene';
const SLOW  = Number(process.env.SLOW || 4);
const MS    = Number(process.env.MS   || 2600);
const THEME = process.env.THEME || 'friendly-dark';
const DIR   = `/tmp/claude-1000/-mnt-Cursor-PuppetMaster/b39dbd86-951c-408b-bab8-5d2199315c1f/scratchpad/frames_${SHOT}`;

/* What each named shot does: [setup, trigger]. Both run in the page. */
const SHOTS = {
  open: [
    () => {},
    () => window.PMO_ONBOARDING.open('film')
  ],
  scene: [
    () => { window.PMO_ONBOARDING.open('film'); },
    () => window.PMO_ONBOARDING.go('where')
  ],
  choice: [
    () => { window.PMO_ONBOARDING.open('film'); window.PMO_ONBOARDING.go('where'); },
    () => document.querySelector('#pmo [data-pmo-act="where"][data-arg="new-server"]').click()
  ],
  theme: [
    () => { window.PMO_ONBOARDING.open('film'); },
    () => document.querySelector('#pmo [data-pmo-act="set-family"][data-arg="retro"]').click()
  ],
  commit: [
    () => { window.PMO_ONBOARDING.open('film'); window.PMO_FLOW.set({ name: 'Book club website' });
            window.PMO_ONBOARDING.go('review'); },
    () => document.querySelector('#pmo .pmo-foot-actions .pmo-btn--primary').click()
  ],
  tourstep: [
    () => { window.PMO_TOUR.start({ source: 'film' }); },
    () => { const b = document.querySelector('#pmot [data-pmot-act="next"]'); if (b) b.click(); }
  ],
  showme: [
    () => { window.PMO_TOUR.start({ source: 'film' });
            const i = window.PMO_TOUR.steps.findIndex(s => s.id === 'dock');
            window.PMO_TOUR.goStep(i); },
    () => { const b = document.querySelector('#pmot [data-pmot-act="showme"]'); if (b) b.click(); }
  ],
  spotlight: [
    () => { window.PMO_TOUR.start({ source: 'film' });
            const i = window.PMO_TOUR.steps.findIndex(s => s.id === 'widget-open');
            window.PMO_TOUR.goStep(i); },
    () => { const i = window.PMO_TOUR.steps.findIndex(s => s.id === 'wiz-open');
            window.PMO_TOUR.goStep(i); }
  ],
  consequence: [
    () => { window.PMO_TOUR.start({ source: 'film' });
            window.PM_PAGES.go('wizard');
            const wait = (t) => new Promise(r => setTimeout(r, t));
            const byText = (x) => [...document.querySelectorAll('button,[role="button"],a')]
              .find(b => (b.textContent||'').trim().toLowerCase().startsWith(x.toLowerCase()) && b.offsetParent);
            return wait(700).then(() => { byText('Brand-new product').click(); return wait(400); })
              .then(() => { byText('Continue').click(); return wait(900); })
              .then(() => { byText('Build them with the PRD Builder').click(); return wait(1200); })
              .then(() => { const i = window.PMO_TOUR.steps.findIndex(s => s.id === 'wiz-answer');
                            window.PMO_TOUR.goStep(i); return wait(600); }); },
    () => { const b = document.querySelector('#pmot [data-pmot-act="showme"]'); if (b) b.click(); }
  ]
};

const [setup, trigger] = SHOTS[SHOT] || SHOTS.scene;

rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });

const { browser, page, errs } = await launch({ theme: THEME, width: 1440, height: 900 });

/* Uniformly slow every animation and transition. Easing curves, delays and
   sequencing are preserved; only the clock changes. */
if (SLOW > 1) {
  /* rewrite every declared duration/delay in the page stylesheets */
  await page.evaluate((k) => {
    /* Every PMO duration comes from a token, so scaling the tokens scales the
       whole system exactly while preserving easing, delay ratios and order. */
    const R = document.documentElement.style;
    const TOK = { '--pmo-t-quick': 170, '--pmo-t-base': 280, '--pmo-t-travel': 460,
                  '--pmo-t-scene': 640, '--pmo-stagger': 44 };
    for (const t in TOK) R.setProperty(t, (TOK[t] * k) + 'ms');
    const style = document.createElement('style');
    style.id = 'pmo-film-slow';
    document.head.appendChild(style);
    // Rewrite durations/delays on every rule that declares them.
    const scale = (v) => v.replace(/([\d.]+)(ms|s)\b/g, (_, n, u) => {
      const ms = u === 's' ? parseFloat(n) * 1000 : parseFloat(n);
      return (ms * k) + 'ms';
    });
    const out = [];
    for (const ss of document.styleSheets) {
      let rules; try { rules = ss.cssRules; } catch (e) { continue; }
      for (const r of rules) {
        if (!r.style) continue;
        const d = r.style.animationDuration, t = r.style.transitionDuration;
        const ad = r.style.animationDelay, td = r.style.transitionDelay;
        if (!d && !t && !ad && !td) continue;
        let decl = '';
        if (d)  decl += `animation-duration:${scale(d)} !important;`;
        if (t)  decl += `transition-duration:${scale(t)} !important;`;
        if (ad) decl += `animation-delay:${scale(ad)} !important;`;
        if (td) decl += `transition-delay:${scale(td)} !important;`;
        if (decl) out.push(`${r.selectorText}{${decl}}`);
      }
    }
    style.textContent = out.join('\n');
    return out.length;
  }, SLOW);
}

await page.evaluate(setup);
await page.waitForTimeout(1400 * Math.min(SLOW, 2));

const cdp = await page.context().newCDPSession(page);
const FPS = Number(process.env.FPS || 60);
const STEP = 1000 / FPS;                 // virtual ms per captured frame
const REAL_MS = MS;                      // real (un-slowed) duration to cover
const STEPS = Math.round((REAL_MS * SLOW) / STEP);

/* Virtual time makes capture deterministic: the page clock only advances when
   we grant it a budget, so every frame lands exactly STEP ms apart no matter
   how slow the screenshot itself is. */
await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' });

const budgetExpired = () => new Promise(res => {
  const h = () => { cdp.off('Emulation.virtualTimeBudgetExpired', h); res(); };
  cdp.on('Emulation.virtualTimeBudgetExpired', h);
});

await page.evaluate(trigger);

const t0 = Date.now();
const shots = [];
for (let i = 0; i < STEPS; i++) {
  const done = budgetExpired();
  await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: STEP });
  await done;
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 90, optimizeForSpeed: true });
  shots.push(data);
}
shots.forEach((d, i) => writeFileSync(`${DIR}/f${String(i).padStart(4, '0')}.jpg`, Buffer.from(d, 'base64')));

console.log(JSON.stringify({
  shot: SHOT, slow: SLOW, fps: FPS,
  frames: shots.length,
  realMsCovered: REAL_MS,
  effectiveSampleHz: Math.round(FPS * SLOW),
  msPerFrameOfRealMotion: +(STEP / SLOW).toFixed(2),
  wallMs: Date.now() - t0,
  dir: DIR, errors: errs.slice(0, 4)
}, null, 1));
await browser.close();
