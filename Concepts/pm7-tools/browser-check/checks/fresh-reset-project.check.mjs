// FO-230: on a fresh visit (?o55=fresh), a Project made during that visit is forgotten by Demo Studio > Reset >
// Progress, on both surfaces. The whole walk is real clicks and typing: the fresh install's window is walked to a new
// local Project and Enter hands it to the app; the Studio is opened by its status-bar item, its Reset rail tab and the
// Progress card's own Run/Confirm presses do the reset. After it, the made Project's row is gone from the Project box,
// no setup-added row is left, the page's default Project (tastebook) is the selected one and the box's label names it,
// and PM_ACTIVE_PROJECT_ID no longer names the made Project (on a page with storage, the active-id record and the
// made-projects record also no longer name it). A second run of the new install makes another Project and a second
// reset forgets that one too: the fresh-load exclusion is the boot's, not the whole visit's.
// On main's opaque sandbox surface the made-projects record (MADE) has no storage to live in and the fresh-load guard
// empties setupProjects() for the whole visit, so forgetSetup sees no made Project: its row stays listed and selected
// and PM_ACTIVE_PROJECT_ID still names it. --set sandbox=0 / =1 picks the surface; --set look=<family-mode> picks the
// look the walk runs in (default basic-dark); --set cycles=1 stops after the first reset.
import { onboardingApp } from '../helpers/onboarding-fields.mjs';

const DEFAULT_PROJECT = 'tastebook';   /* the first row the page's markup lists (base/shell.html) */
const MADE_KEY = 'pm7:shell:setup-projects:v1';
const ACTIVE_KEY = 'pm7:shell:active-project:v1';

/* what the Project box and the page say about the made Project right now */
const BOX = (madeId) => {
  const rows = [...document.querySelectorAll('#projectMenu [data-project]')];
  const sel = rows.find((r) => r.classList.contains('is-selected'));
  let active = null, activeRecord = null, madeRecord = null;
  try { active = window.PM_ACTIVE_PROJECT_ID || null; } catch (_) {}
  try { activeRecord = localStorage.getItem(ACTIVE_KEY); madeRecord = localStorage.getItem(MADE_KEY); } catch (_) {}
  return {
    madeRow: !!document.querySelector(`#projectMenu [data-project="${madeId}"]`),
    addedRows: [...document.querySelectorAll('#projectMenu [data-o55-added][data-project]')].map((r) => r.getAttribute('data-project')),
    selected: sel ? sel.getAttribute('data-project') : null,
    label: (document.getElementById('projectMenuLabel') || {}).textContent || '',
    active, activeRecord, madeRecord,
    fixtures: rows.filter((r) => !r.hasAttribute('data-o55-added')).map((r) => r.getAttribute('data-project'))
  };
};

/* walk the open window from Keep your work safe to the app: Continue through the project chapter's remaining screens,
   skip AI, Enter on Ready (the same route chat-sweep-project walks) */
async function toApp(a, t) {
  const f = a.frame();
  await a.click('next');
  for (let i = 0; i < 10; i++) {
    const s = await a.snap();
    if (s.screen === 'ai') break;
    t.log('route ' + s.screen);
    await f.locator('.o55-foot .o55-primary').filter({ visible: true }).last().click();
    await t.page.waitForTimeout(1200);
  }
  await a.screen('ai');
  await a.click('skip');
  await t.page.waitForTimeout(400);
  await a.click('next');
  await a.screen('ready');
  await a.click('enter');
  /* the window hands over to the app: it is gone and the Wizard is in place */
  await f.waitForFunction(() => window.O55 && O55.S && !O55.S.open, null, { timeout: 20000 });
  await t.page.waitForTimeout(800);
}

/* Demo Studio > Reset > Progress, by the sheet's own controls: the status-bar item opens it, the rail's Reset tab
   shows the cards, the Progress card's Run arms it and Confirm runs it. The reset opens a new install's window. */
async function resetProgress(a, t) {
  const f = a.frame();
  await f.locator('.pmds-entry').click();
  await f.waitForSelector('#pmds-sheet:not([hidden]) #pmds-tab-reset', { timeout: 15000 });
  await f.locator('#pmds-tab-reset').click();
  const card = f.locator('#pmds-sheet [data-pmds-reset="progress"]');
  await card.waitFor({ state: 'visible', timeout: 15000 });
  const run = card.locator('[data-pmds-do="reset"][data-arg="progress"]');
  await run.scrollIntoViewIfNeeded();
  await run.click();                                    /* arms the card */
  await f.waitForSelector('#pmds-sheet [data-pmds-reset="progress"].pmds-armed', { timeout: 10000 });
  await run.click();                                    /* Confirm: the reset runs */
  /* the new install's window opens on Welcome */
  await f.waitForFunction(() => window.O55 && O55.S && O55.S.open && O55.S.sess && O55.S.sess.screen === 'welcome', null, { timeout: 30000 });
  await t.page.waitForTimeout(600);
}

export default async function (t) {
  const a = onboardingApp(t);
  const surface = a.sandboxed() ? 'sandbox' : 'normal';
  const look = String(t.args.look || 'basic-dark').split('-');
  const cycles = Math.max(1, Number(t.args.cycles || 2));
  await t.viewport(1920, 1080);
  if (a.sandboxed()) {
    /* pre-existing on main in T3's sandbox, not FO-230's cause: a screen the page's own timer settles (Creating's work
       finishing) focuses its heading without user activation, which the sandbox's permissions policy refuses and logs.
       Allowed by its exact message so any other console error still fails the check. */
    t.cfg.consoleErrors.allow.push(/Permissions policy violation: focus-without-user-activation/);
  }
  const bad = [];
  let madeId = null;

  for (let cycle = 1; cycle <= cycles; cycle++) {
    const name = `FO230 ${cycle === 1 ? 'Fresh' : 'Second'} Project`;
    if (cycle === 1) await a.boot({ look });            /* ?o55=fresh: the new install's window opens by itself */
    else {
      /* the reset left a new install's window open on Welcome: walk it as the person would */
      await a.click('start', undefined, 'look');
      await a.click('pickFamily', look[0]); await a.click('pickMode', look[1]);
      await a.click('next', undefined, 'where');
    }
    await a.toSafe(name);
    await toApp(a, t);
    const f = a.frame();
    madeId = await f.evaluate(() => window.PM_ACTIVE_PROJECT_ID || null);
    await t.check(`cycle ${cycle} (${surface}): the made Project is the active one`, !!madeId && madeId !== DEFAULT_PROJECT, String(madeId), { hard: true });
    let box = await f.evaluate(BOX, madeId);
    await t.check(`cycle ${cycle} (${surface}): the made Project is listed and selected`, box.madeRow && box.selected === madeId && box.label === name, JSON.stringify(box), { hard: true });

    await resetProgress(a, t);
    box = await f.evaluate(BOX, madeId);
    t.log(`cycle ${cycle} (${surface}) after reset: ${JSON.stringify(box)}`);
    if (box.madeRow) bad.push(`cycle ${cycle}: the made Project's row (${madeId}) is still listed`);
    if (box.addedRows.length) bad.push(`cycle ${cycle}: setup-added rows left: ${box.addedRows.join(', ')}`);
    if (box.selected !== DEFAULT_PROJECT) bad.push(`cycle ${cycle}: selected is ${box.selected}, not the default ${DEFAULT_PROJECT}`);
    if (box.label.trim() !== DEFAULT_PROJECT) bad.push(`cycle ${cycle}: the box's label is "${box.label}", not ${DEFAULT_PROJECT}`);
    if (box.active === madeId) bad.push(`cycle ${cycle}: PM_ACTIVE_PROJECT_ID still names the made Project (${madeId})`);
    if (!a.sandboxed()) {
      if (box.activeRecord === madeId) bad.push(`cycle ${cycle}: the active-id record still names the made Project`);
      let made = [];
      try { made = JSON.parse(box.madeRecord || '[]'); } catch (_) {}
      if (made.some((p) => p && p.id === madeId)) bad.push(`cycle ${cycle}: the made-projects record still holds the made Project`);
    }
    await t.check(`cycle ${cycle} (${surface}): Reset > Progress forgets the made Project`, !bad.length, bad.join(' | ').slice(0, 1200), { hard: true });

    if (cycle === cycles) {
      /* the fixed screen: the new install paints Basic Dark by design, so a requested look other than Basic Dark is
         picked in the new run's own Look screen (real clicks; the surviving default Project is the one that receives
         it), then the window is closed by its own close button so the app shows the default Project selected in the
         box; original-size capture in the run's look */
      if (look.join('-') !== 'basic-dark') {
        await a.click('start', undefined, 'look');
        await a.click('pickFamily', look[0]); await a.click('pickMode', look[1]);
        await f.waitForFunction((m) => (document.documentElement.getAttribute('data-theme') || '').endsWith('-' + m), look[1], { timeout: 20000 }).catch(() => {});
        await t.page.waitForTimeout(1200);
      }
      const closeBtn = f.locator('#pm-o55-onboarding .o55-win [data-o55-do="close"], #pm-o55-onboarding [data-o55-do="close"]').filter({ visible: true }).first();
      if (await closeBtn.count()) { await closeBtn.click(); await f.waitForFunction(() => window.O55 && O55.S && !O55.S.open, null, { timeout: 15000 }).catch(() => {}); await t.page.waitForTimeout(900); }
      await f.waitForFunction((m) => (document.documentElement.getAttribute('data-theme') || '').endsWith('-' + m), look[1], { timeout: 15000 }).catch(() => {});
      await t.shot(`fo230-after-reset-${surface}-${look.join('-')}`, `FO-230 fixed: after Reset > Progress on a fresh visit, ${DEFAULT_PROJECT} selected, ${look.join(' ')} (${surface}), 1920x1080`);
    }
  }
}
