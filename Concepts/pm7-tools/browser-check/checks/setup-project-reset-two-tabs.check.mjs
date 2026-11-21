// FO-230: a Project reset in one tab must stay forgotten when another tab creates a Project.
import { onboardingApp } from '../helpers/onboarding-fields.mjs';
import { resetProgress, toApp } from '../helpers/onboarding-project-reset.mjs';

async function saved(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('pm7:shell:setup-projects:v1') || '[]').map(p => p.id));
}
async function current(page) {
  return page.evaluate(() => ({
    active: window.PM_ACTIVE_PROJECT_ID,
    label: document.querySelector('#projectMenuLabel').textContent.trim(),
    selected: document.querySelector('#projectMenu [data-project].is-selected')?.dataset.project,
    added: Array.from(document.querySelectorAll('#projectMenu [data-o55-added]')).map(r => r.dataset.project),
  }));
}

async function openMenu(page) {
  const box = page.locator('#projectMenuBtn');
  if (await box.getAttribute('aria-expanded') !== 'true') await box.click();
  await page.locator('#projectMenuBtn[aria-expanded="true"]').waitFor({ state: 'visible' });
  return page.locator('#projectMenu');
}

async function inspectMenu(page, oldId, { tryPick = false } = {}) {
  const menu = await openMenu(page);
  const orchard = menu.locator(`[data-project="${oldId}"]`);
  const listed = await orchard.count() > 0;
  if (tryPick && listed) await orchard.click();
  const state = await current(page);
  const box = page.locator('#projectMenuBtn');
  if (await box.getAttribute('aria-expanded') === 'true') await box.click();
  return { listed, ...state };
}

export default async function (t) {
  const a = onboardingApp(t, { sandboxDefault: false });
  await t.viewport(1920, 1080);
  await a.boot({ look: ['basic', 'dark'] });
  if (a.sandboxed()) {
    const persistent = await a.frame().evaluate(() => O55.store.persistent);
    await t.check('The opaque preview has no shared project storage', persistent === false, String(persistent));
    await t.noConsoleErrors('console (sandbox focus policy)', { allow: [/Permissions policy violation: focus-without-user-activation/] });
    return;
  }
  await a.toSafe('Orchard Project');
  await toApp(a, t);
  const first = a.frame();
  const oldId = (await current(first)).active;
  const initial = await saved(first);
  await t.check('Orchard is the active project and is persisted', !!oldId && initial.includes(oldId), JSON.stringify({ oldId, initial }), { hard: true });

  const second = await t.window.context().newPage();
  try {
    await second.setViewportSize({ width: 1920, height: 1080 });
    const addr = new URL(first.url());
    addr.searchParams.set('o55', 'off');
    await second.goto(addr.href);
    await second.waitForFunction(id => !!window.PM_PROJECT_BOX && Array.from(document.querySelectorAll('#projectMenu [data-o55-added].is-selected')).some(r => r.dataset.project === id), oldId);
    await resetProgress(second, t);
    const reset = { saved: await saved(second), ...await current(second) };
    await t.check('The second tab forgets Orchard and selects tastebook', !reset.saved.includes(oldId) && !reset.added.includes(oldId) && reset.active === 'tastebook', JSON.stringify(reset), { hard: true });

    await t.window.bringToFront();
    const afterReset = await inspectMenu(first, oldId);
    await t.check('The first live menu drops Orchard and falls back to tastebook after the peer reset',
      !afterReset.listed && afterReset.active === 'tastebook' && afterReset.selected === 'tastebook' && afterReset.label === 'tastebook',
      JSON.stringify(afterReset));

    await first.locator('#tab-settings').click();
    const home = first.locator('#pm-settings-root [data-action="home"]').filter({ visible: true }).first();
    if (await home.count()) await home.click();
    await first.locator('[data-action="replay-onboarding"]').filter({ visible: true }).first().click();
    await a.screen('welcome');
    await a.click('start', undefined, 'look');
    await a.click('pickFamily', 'basic');
    await a.click('pickMode', 'dark');
    await a.click('next', undefined, 'where');
    await a.toSafe('Harbor Notes');
    await toApp(a, t);
    const newId = (await current(first)).active;
    const after = await saved(first);
    await t.check('Harbor Notes is a distinct project and is persisted', !!newId && newId !== oldId && after.includes(newId), JSON.stringify({ oldId, newId, after }), { hard: true });
    const livePeer = await current(second);
    await t.check('The second live tab lists and selects the newly shared Harbor Notes project',
      livePeer.active === newId && livePeer.selected === newId && livePeer.label === 'Harbor Notes' && livePeer.added.includes(newId) && !livePeer.added.includes(oldId),
      JSON.stringify(livePeer));

    await second.bringToFront();
    await second.reload();
    await second.waitForFunction(id => !!window.PM_PROJECT_BOX && Array.from(document.querySelectorAll('#projectMenu [data-o55-added]')).some(r => r.dataset.project === id), newId);
    const reloaded = await current(second);
    await t.check('Orchard stays forgotten after a second project is made in the other tab', !after.includes(oldId) && !reloaded.added.includes(oldId), JSON.stringify({ oldId, newId, after, reloaded }));

    await t.window.bringToFront();
    const afterCreate = await inspectMenu(first, oldId, { tryPick: true });
    await t.check('The first live menu cannot pick Orchard after creating Harbor Notes',
      !afterCreate.listed && afterCreate.active === newId && afterCreate.selected === newId && afterCreate.label === 'Harbor Notes',
      JSON.stringify(afterCreate));

    // Read the live peer after Chrome has delivered the active-only event.
    await second.evaluate(() => {
      window.addEventListener('storage', function sawFixturePick(event) {
        if (event.key !== 'pm7:shell:active-project:v1' || event.newValue !== 'tastebook') return;
        window.__fo230SawFixturePick = true;
        window.removeEventListener('storage', sawFixturePick);
      });
    });
    const menu = await openMenu(first);
    await menu.locator('[data-project="tastebook"]').click();
    await second.waitForFunction(() => window.__fo230SawFixturePick === true);
    const peerSwitch = await current(second);
    await t.check('An ordinary fixture pick updates the other live tab',
      peerSwitch.active === 'tastebook' && peerSwitch.selected === 'tastebook' && peerSwitch.label === 'tastebook' && peerSwitch.added.includes(newId),
      JSON.stringify(peerSwitch));
  } finally {
    await second.close();
  }
}
