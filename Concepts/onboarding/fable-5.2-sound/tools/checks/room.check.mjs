// The listening room: loads clean, plays a tune from the table after a real click, steps through "how far along",
// makes Pip talk, and stays inside the window at three widths.  --set shots=1 lists frames for viewing.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const tests = {
	async 'room'(t) {
		await t.goto('index.html');
		await t.page.waitForFunction(() => !!(window.__room && window.PipSound && window.__room.stage()));
		const before = await t.evaluateNoGesture(() => ({ unlocked: window.PipSound.unlocked, cells: document.querySelectorAll('.rm-cell').length, cards: document.querySelectorAll('#rmConcepts .rm-card').length }));
		await t.check('24 tunes in the table (6 looks x 4 columns), 3 concept cards, silent before a gesture', before.cells === 24 && before.cards === 3 && before.unlocked === false, JSON.stringify(before));
		await t.page.locator('.rm-cell[data-c="c3"][data-k="friendly"]').click();
		await t.page.waitForFunction(() => window.PipSound.transport().playing && window.PipSound.transport().song === 'c3-friendly', null, { timeout: 12000 });
		await t.check('pressing a cell plays that look\'s tune in that concept', true);
		await t.text('#rmTitle', /Toybox Waltz/);
		await t.page.locator('#rmSteps [data-step="1"]').click(); await sleep(300);
		const few = await t.page.evaluate(() => window.PipSound.parts().filter((p) => p.on).length);
		await t.page.locator('#rmSteps [data-step="5"]').click(); await sleep(300);
		const many = await t.page.evaluate(() => window.PipSound.parts().filter((p) => p.on).length);
		await t.check(`more parts at Ready (${many}) than at Welcome (${few})`, many > few);
		await t.page.locator('.rm-cell[data-c="c2"][data-k="nier"]').click();
		await t.page.waitForFunction(() => window.PipSound.transport().song === 'c2-nier', null, { timeout: 12000 });
		const th = await t.page.evaluate(() => ({ theme: document.body.dataset.theme, stage: window.__room.stage().theme, dressed: window.__room.stage().px.concept }));
		await t.check('the page and the stage take on the look and the concept', /^nier-/.test(th.theme) && th.stage === th.theme && th.dressed === 'c2', JSON.stringify(th));
		await t.page.locator('#rmLines [data-line="2"]').click();
		const open = await t.page.evaluate(async () => { let m = 0; const t0 = performance.now(); while (performance.now() - t0 < 1400) { m = Math.max(m, window.PipSound.mouth().open); await new Promise((r) => setTimeout(r, 16)); } return m; });
		await t.check(`Pip's mouth opens when it is made to talk (${open.toFixed(2)})`, open > 0.25);
		await t.page.locator('#rmEvents [data-ev="confetti"]').click(); await sleep(400);
		await t.page.locator('#rmStop').click(); await sleep(400);
		await t.check('Stop stops the tune', await t.page.evaluate(() => !window.PipSound.transport().playing));
		for (const w of [1440, 900, 420]) {
			await t.viewport(w, 900); await sleep(500);
			// NieR's decorative data column scrolls through its clip on purpose (the PM7 kit exempts the same group)
			await t.noOverflow(`no overflow at ${w}`, { noSideways: true, ignore: ['svg.pst-svg g.st-data', 'svg.pst-svg g.st-data text'] });
			if (t.args.shots) await t.shot(`room-${w}`, `the listening room at ${w} px`);
		}
	}
};
