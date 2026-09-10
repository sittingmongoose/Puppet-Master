/* Settings managers refresh — 60 fps slow-motion filming for frame-by-frame review.
 * node Concepts/pm7-tools/verify/settings_refresh_film.mjs <artifact.html> <out-dir> [scene,scene,…] [chrome]
 * Method: Animation.setPlaybackRate(RATE) (default 0.05 = 20× slower) plus a scaled setTimeout so the
 * engine's settle timers keep pace; one screenshot every 16.667/RATE ms of wall time = one true 60 fps frame.
 * CDP virtual time does not slow compositor-driven CSS transitions; playback rate does (validated 2026-09-08).
 * Each frame is labelled with its true motion time in frames.json; settings_refresh_sheet.py tiles them.
 */
import { launch, sleep } from './pm_cdp.mjs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const [artifactArg, outArg, scenesArg, chromeArg] = process.argv.slice(2);
if (!artifactArg || !outArg) { console.error('usage: settings_refresh_film.mjs <artifact.html> <out-dir> [scenes] [chrome]'); process.exit(2); }
if (chromeArg) process.env.CHROME = chromeArg;
const RATE = Number(process.env.RATE || 0.05), STEP = 16.667 / RATE, THEME = process.env.THEME || 'Basic Dark';
const artifact = resolve(artifactArg), out = resolve(outArg);
const clipFull = { x: 536, y: 0, width: 1064, height: 1000 };
const clipDoc = { x: 700, y: 110, width: 890, height: 860 };

/* Scenes: setup runs before filming starts; trigger fires at t=0; frames = number of 16.67 ms frames to capture. */
const SCENES = {
  'open-settings': { frames: 48, clip: clipFull, setup: () => { document.querySelector('.page-tab[data-page="dashboard"], .page-tab[data-page="home"]')?.click(); }, trigger: () => document.getElementById('tab-settings').click() },
  'domain-switch': { frames: 36, clip: clipDoc, setup: () => window.PM12_KIMI.navigate('general', 'app-input'), trigger: () => window.PM12_KIMI.navigate('system', 'settings-transfer') },
  'manager-tab': { frames: 30, clip: clipDoc, setup: () => window.PM12_KIMI.navigate('system', 'servers'), trigger: () => document.querySelector('[data-workspace-block="servers"] .manager-tab:nth-child(2)').click() },
  'panel-open': { frames: 48, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('general', 'notifications'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="notifications"] .manager-tab[data-tab="events"]')?.click(); setTimeout(r, 500); }, 500)); }, trigger: () => [...document.querySelectorAll('#pm-settings-root [data-action="pm51-notifications-event"]')].find(x => x.getClientRects().length).click() },
  'panel-close': { frames: 30, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('general', 'notifications'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="notifications"] .manager-tab[data-tab="events"]')?.click(); setTimeout(() => { [...document.querySelectorAll('#pm-settings-root [data-action="pm51-notifications-event"]')].find(x => x.getClientRects().length).click(); setTimeout(r, 1100); }, 500); }, 500)); }, trigger: () => document.querySelector('#pm-settings-portals [data-action="close-overlay"]').click() },
  'dropdown-open': { frames: 30, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('general', 'app-input'); return new Promise(r => setTimeout(() => { const t = [...document.querySelectorAll('#pm-settings-root .setting-row .pm51-dd-trigger')].find(x => x.getClientRects().length); t.scrollIntoView({ block: 'center' }); setTimeout(r, 700); }, 500)); }, trigger: () => [...document.querySelectorAll('#pm-settings-root .setting-row .pm51-dd-trigger')].find(x => x.getClientRects().length).click() },
  'dropdown-close': { frames: 24, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('general', 'app-input'); return new Promise(r => setTimeout(() => { const t = [...document.querySelectorAll('#pm-settings-root .setting-row .pm51-dd-trigger')].find(x => x.getClientRects().length); t.scrollIntoView({ block: 'center' }); setTimeout(() => { t.click(); setTimeout(r, 800); }, 600); }, 500)); }, trigger: () => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) },
  'menu-open': { frames: 30, clip: clipFull, setup: () => window.PM12_KIMI.navigate('ai', 'providers'), trigger: () => document.querySelector('[data-workspace-block="providers"] .pm51-detail-actions .pm51-icon-btn').click() },
  'menu-close': { frames: 24, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('ai', 'providers'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="providers"] .pm51-detail-actions .pm51-icon-btn').click(); setTimeout(r, 800); }, 600)); }, trigger: () => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) },
  'inspector-open': { frames: 40, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('general', 'app-input'); return new Promise(r => setTimeout(() => { const b = [...document.querySelectorAll('#pm-settings-root .details-btn')].find(x => /density/i.test(x.closest('.setting-row')?.textContent || '')); b.scrollIntoView({ block: 'center' }); r(); }, 500)); }, trigger: () => { const b = [...document.querySelectorAll('#pm-settings-root .details-btn')].find(x => /density/i.test(x.closest('.setting-row')?.textContent || '')); b.click(); } },
  'inspector-close': { frames: 30, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('general', 'app-input'); return new Promise(r => setTimeout(() => { const b = [...document.querySelectorAll('#pm-settings-root .details-btn')].find(x => /density/i.test(x.closest('.setting-row')?.textContent || '')); b.scrollIntoView({ block: 'center' }); b.click(); setTimeout(r, 900); }, 500)); }, trigger: () => document.querySelector('#pm-settings-root [data-action="close-details"]').click() },
  'sound-play': { frames: 36, clip: clipDoc, setup: () => { window.PM12_KIMI.navigate('general', 'notifications'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="notifications"] .manager-tab[data-tab="sounds"]')?.click(); setTimeout(r, 600); }, 400)); }, trigger: () => document.querySelector('.sound-play[data-id="task-done"]').click() },
  'provider-signin': { frames: 40, clip: clipFull, setup: () => window.PM12_KIMI.navigate('ai', 'providers'), trigger: () => { const b = [...document.querySelectorAll('[data-workspace-block="providers"] .pm51-detail-actions button')][0]; b && b.click(); } },
  'theme-switch': { frames: 36, clip: clipFull, setup: () => window.PM12_KIMI.navigate('system', 'doctor'), trigger: () => window.PM12_KIMI.setSettingFromHost('general.visual.theme', 'Friendly Light') },
  'account-expand': { frames: 30, clip: clipDoc, setup: () => { window.PM12_KIMI.navigate('ai', 'providers'); return new Promise(r => setTimeout(() => { const sec = document.querySelector('[data-workspace-block="providers"] .pm51-acc-item'); if (sec) { const sc = document.querySelector('#settings-document'); const top = sec.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 140; sc.scrollTo({ top, behavior: 'instant' }); } setTimeout(r, 400); }, 700)); }, trigger: () => { const items = document.querySelectorAll('[data-workspace-block="providers"] .pm51-acc-item'); const it = items[1] || items[0]; it.querySelector('.pm51-acc-toggle').click(); } },
  'account-reorder': { frames: 30, clip: clipDoc, setup: () => { window.PM12_KIMI.navigate('ai', 'providers'); return new Promise(r => setTimeout(() => { const sec = document.querySelector('[data-workspace-block="providers"] .pm51-acc-item'); if (sec) { const sc = document.querySelector('#settings-document'); const top = sec.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 140; sc.scrollTo({ top, behavior: 'instant' }); } setTimeout(r, 400); }, 700)); }, trigger: () => { const b = [...document.querySelectorAll('[data-workspace-block="providers"] [data-action="pm51-providers-account-move"]')].find(x => x.getClientRects().length && x.getAttribute('aria-disabled') !== 'true'); b && b.click(); } },
  'route-reorder': { frames: 30, clip: clipDoc, setup: () => { window.PM12_KIMI.navigate('system', 'servers'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="servers"] .manager-tab[data-tab="away"]')?.click(); setTimeout(r, 600); }, 500)); }, trigger: () => document.querySelector('[data-workspace-block="servers"] .pm51-item[data-route="tailscale"] .pm51-servers-move-btn[data-dir="down"]').click() },
  'route-sheet-open': { frames: 48, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('system', 'servers'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="servers"] .manager-tab[data-tab="away"]')?.click(); setTimeout(r, 600); }, 500)); }, trigger: () => document.querySelector('[data-workspace-block="servers"] .pm51-item[data-route="tailscale"] [data-action="pm51-servers-remote"]').click() },
  'command-new': { frames: 30, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('code', 'commands'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="commands"] .manager-tab[data-tab="commands"]')?.click(); setTimeout(r, 600); }, 500)); }, trigger: () => document.querySelector('[data-workspace-block="commands"] [data-action="pm51-commands-new"]').click() },
  'command-dry-run': { frames: 48, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('code', 'commands'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="commands"] .manager-tab[data-tab="commands"]')?.click(); setTimeout(() => { [...document.querySelectorAll('[data-workspace-block="commands"] [data-action="pm51-commands-open"]')].find(x => x.getClientRects().length).click(); setTimeout(r, 1100); }, 600); }, 500)); }, trigger: () => document.querySelector('#pm-settings-portals .pm51-panel-foot .btn.primary').click() },
  'bsd-tab-findings': { frames: 30, clip: clipDoc, setup: () => window.PM12_KIMI.navigate('ai', 'bsd'), trigger: () => document.querySelector('[data-workspace-block="bsd"] .manager-tab[data-tab="findings"]').click() },
  'bsd-finding-open': { frames: 48, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('ai', 'bsd'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="bsd"] .manager-tab[data-tab="findings"]')?.click(); setTimeout(r, 600); }, 500)); }, trigger: () => [...document.querySelectorAll('[data-workspace-block="bsd"] [data-action="pm51-bsd-finding"]')].find(x => x.getClientRects().length).click() },
  'bsd-stage-change': { frames: 30, clip: clipDoc, setup: () => { window.PM12_KIMI.navigate('ai', 'bsd'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="bsd"] .manager-tab[data-tab="stages"]')?.click(); setTimeout(r, 600); }, 500)); }, trigger: () => [...document.querySelectorAll('[data-workspace-block="bsd"] .pm51-dd-trigger')].find(x => x.getClientRects().length).click() },
  'notif-add-event': { frames: 30, clip: clipFull, setup: () => { window.PM12_KIMI.navigate('general', 'notifications'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="notifications"] .manager-tab[data-tab="events"]')?.click(); setTimeout(r, 600); }, 500)); }, trigger: () => document.querySelector('[data-workspace-block="notifications"] [data-action="pm51-notifications-add-event"]').click() },
  'event-sound-inline': { frames: 30, clip: clipDoc, setup: () => { window.PM12_KIMI.navigate('general', 'notifications'); return new Promise(r => setTimeout(() => { document.querySelector('[data-workspace-block="notifications"] .manager-tab[data-tab="events"]')?.click(); setTimeout(r, 600); }, 500)); }, trigger: () => [...document.querySelectorAll('[data-workspace-block="notifications"] .pm51-event-row .pm51-dd-trigger')].find(x => x.getClientRects().length).click() },
  'roster-select': { frames: 30, clip: clipDoc, setup: () => window.PM12_KIMI.navigate('ai', 'providers'), trigger: () => { const rows = document.querySelectorAll('#provider-roster .resource-row'); (rows[3] || rows[1]).click(); } }
};
const scenes = (scenesArg && scenesArg !== 'all' ? scenesArg.split(',') : Object.keys(SCENES)).filter(s => SCENES[s]);
const { page, close } = await launch({ width: 1600, height: 1000 });
try {
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
  await page.goto(pathToFileURL(artifact).href); await sleep(2200);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /close onboarding/i.test(x.getAttribute('aria-label') || x.textContent)); if (b && b.getClientRects().length) b.click(); });
  await sleep(300); await page.evaluate(() => document.getElementById('tab-settings').click()); await sleep(700);
  await page.evaluate(t => window.PM12_KIMI.setSettingFromHost('general.visual.theme', t), THEME); await sleep(400);
  await page.bringToFront();
  await page.send('Animation.enable');
  const summary = {};
  for (const name of scenes) {
    const sc = SCENES[name];
    const dir = join(out, name); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    await page.evaluate(t => window.PM12_KIMI.setSettingFromHost('general.visual.theme', t), THEME);
    await page.evaluate(() => { document.querySelectorAll('#pm-settings-portals .drawer-wrap,#pm-settings-portals .overlay').forEach(el => el.remove()); window.PM12_KIMI.closeTransientUi && window.PM12_KIMI.closeTransientUi(); });
    await page.evaluate(`(${sc.setup.toString()})()`); await sleep(1100);
    /* slow the world: CSS/Web animations via playback rate, engine timers via a scaled setTimeout */
    await page.send('Animation.setPlaybackRate', { playbackRate: RATE });
    await page.evaluate(k => { if (!window.__pm51RealSetTimeout) { window.__pm51RealSetTimeout = window.setTimeout; } window.setTimeout = (fn, ms, ...rest) => window.__pm51RealSetTimeout(fn, (ms || 0) / k, ...rest); }, RATE);
    const t0 = Date.now(); const frames = [];
    await page.evaluate(`(${sc.trigger.toString()})()`);
    for (let i = 0; i < sc.frames; i++) {
      const target = t0 + i * STEP; const wait = target - Date.now(); if (wait > 0) await sleep(wait);
      const before = Date.now();
      await page.screenshot(join(dir, `f${String(i).padStart(3, '0')}.jpg`), { format: 'jpeg', quality: 82, clip: sc.clip });
      frames.push({ i, motionMs: +(((before - t0) * RATE)).toFixed(1) });
    }
    await page.send('Animation.setPlaybackRate', { playbackRate: 1 });
    await page.evaluate(() => { if (window.__pm51RealSetTimeout) { window.setTimeout = window.__pm51RealSetTimeout; window.__pm51RealSetTimeout = null; } });
    await sleep(700);
    writeFileSync(join(dir, 'frames.json'), JSON.stringify({ scene: name, rate: RATE, stepMs: 16.667, frames }, null, 1));
    summary[name] = { frames: frames.length, lastMotionMs: frames[frames.length - 1].motionMs };
    console.log(name, JSON.stringify(summary[name]));
  }
  writeFileSync(join(out, 'film-summary.json'), JSON.stringify({ artifact, rate: RATE, theme: THEME, scenes: summary, errors: page.errors }, null, 2));
  console.log('errors', page.errors.length, page.errors.slice(0, 5));
} finally { await close(); }
