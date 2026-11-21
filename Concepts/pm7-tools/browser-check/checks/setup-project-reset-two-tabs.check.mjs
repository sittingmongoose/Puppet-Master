// FO-230: a Project reset in one tab must stay forgotten when another tab creates a Project.
import { onboardingApp } from '../helpers/onboarding-fields.mjs';
import { resetProgress, toApp } from '../helpers/onboarding-project-reset.mjs';

async function saved(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('pm7:shell:setup-projects:v1') || '[]').map(p => p.id));
}
async function current(page) {
  return page.evaluate(() => ({
    active: window.PM_ACTIVE_PROJECT_ID,
    added: Array.from(document.querySelectorAll('#projectMenu [data-o55-added]')).map(r => r.dataset.project),
  }));
}

export default async function (t) {
  const a = onboardingApp(t, { sandboxDefault: false });
  if (a.sandboxed()) {
    t.log('This check requires two tabs with shared local storage.');
    return;
  }
  await t.viewport(1920, 1080);
  await a.boot({ look: ['basic', 'dark'] });
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
    await second.bringToFront();
    await second.reload();
    await second.waitForFunction(id => !!window.PM_PROJECT_BOX && Array.from(document.querySelectorAll('#projectMenu [data-o55-added]')).some(r => r.dataset.project === id), newId);
    const reloaded = await current(second);
    await t.check('Orchard stays forgotten after a second project is made in the other tab', !after.includes(oldId) && !reloaded.added.includes(oldId), JSON.stringify({ oldId, newId, after, reloaded }));
  } finally {
    await second.close();
  }
}
