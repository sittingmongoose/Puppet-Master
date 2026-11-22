/* walk the open window from Keep your work safe to the app: Continue through the project chapter's remaining screens,
   skip AI, Enter on Ready (the same route chat-sweep-project walks) */
export async function toApp(a, t) {
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
export async function resetProgress(f, t) {
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
