// SW-04: family-only Settings choices share one scheme selector with the title-bar quick switch.
const FAMILIES = ['Basic', 'Friendly', 'Retro', 'Glass', 'NieR'];
const THEME = 'general.visual.theme', MODE = 'general.visual.theme-mode';
const select = id => `select[data-setting="${id}"]`;
async function settings(f) {
  await f.locator('#tab-settings').click();
  await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
  await f.waitForSelector(select(THEME), {state: 'attached'});
}
async function pick(f, id, label) {
  await f.locator(select(id)).locator('..').locator('.pm51-dd-trigger').click();
  await f.getByRole('option', {name: label, exact: true}).click();
}
export default async function (t) {
  let f = await t.app.open();
  await t.viewport(1390, 900);
  await settings(f);
  const choices = await f.locator(`${select(THEME)} option`).allTextContents();
  await t.equal('five family choices', choices, FAMILIES);
  await t.count(select(MODE), 1, 'one Settings scheme selector');
  await t.count('select[data-setting="general.visual.basic-color-scheme"]', 0, 'no older Basic scheme selector');
  await t.equal('scheme values', await f.locator(`${select(MODE)} option`).evaluateAll(es => es.map(e => e.value)), ['Light', 'Dark', 'Auto']);
  if (choices.join() !== FAMILIES.join()) return; // same assertion fails on the old ten-choice list
  for (const family of FAMILIES) {
    for (const mode of ['Light', 'Dark', 'Auto']) {
      await t.step(`${family} ${mode}`, async () => {
        await pick(f, MODE, mode === 'Auto' ? 'Match my computer' : mode);
        await pick(f, THEME, family);
        await f.waitForFunction(([family, mode]) => PM_THEME.getFamily() === family.toLowerCase() && PM_THEME.getMode() === mode.toLowerCase(), [family, mode]);
        await t.equal('selected family', await f.locator(select(THEME)).inputValue(), family);
        await t.equal('selected scheme', await f.locator(select(MODE)).inputValue(), mode);
        await t.equal('saved family and mode', await f.evaluate(() => [PM51.value('general.visual.theme').split(' ')[0], PM51.value('general.visual.theme-mode')]), [family, mode]);
        await f.waitForFunction(([family, mode]) => {
          const light = mode === 'Light' || mode === 'Auto' && !matchMedia('(prefers-color-scheme: dark)').matches;
          return PMLogo.look() === family.toLowerCase() + (light ? '-light' : '-dark');
        }, [family, mode]);
        if (mode === 'Auto') {
          for (const scheme of ['light', 'dark']) {
            await t.page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
            await f.waitForFunction(([family, scheme]) => PMLogo.look() === family.toLowerCase() + '-' + scheme, [family, scheme]);
            await t.equal('Auto follows OS and stays Auto', await f.locator(select(MODE)).inputValue(), 'Auto');
          }
        }
        // Opaque T3 frames deliberately have no durable storage. Test their in-session re-render;
        // the normal surface additionally reloads the document and reads its saved Project pair.
        if (!t.app.sandboxed()) {
          await f.goto(f.url());
          await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1');
        } else await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="source"]').first().click();
        await settings(f);
        await t.equal('family survives reopen/reload', await f.locator(select(THEME)).inputValue(), family);
        await t.equal('mode survives reopen/reload', await f.locator(select(MODE)).inputValue(), mode);
      });
    }
  }
  await f.locator('#themeSelect').click();
  await t.equal('titlebar has five family quick switches', await f.locator('#themeMenu .pm6-tt-family[data-family]').evaluateAll(es => es.map(e => e.dataset.family).sort()), FAMILIES.map(s => s.toLowerCase()).sort());
  await t.equal('titlebar has one three-way scheme switch', await f.locator('#themeMenu .pm6-tt-mode').evaluateAll(es => es.map(e => e.dataset.modeValue).sort()), ['auto','dark','light']);
  await f.locator('#themeSelect').click();
  for (const width of [740,860,1024,1280,1390,1920]) {
    await t.viewport(width, 900);
    await t.equal(`${width}px family choices`, await f.locator(`${select(THEME)} option`).allTextContents(), FAMILIES);
  }
  await t.viewport(1280, 500);
  await t.equal('short window family choices', await f.locator(`${select(THEME)} option`).allTextContents(), FAMILIES);
}
