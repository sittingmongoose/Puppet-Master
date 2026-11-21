// A viewing aid: Pip's area of the listening room in every look, as native crops to judge by eye.
//   browser-check run tools/checks/look.check.mjs [--set page=index.html] [--set sel=.rm-stagebox] [--set looks=glass-dark,nier-light]
const LOOKS = ['friendly-dark', 'friendly-light', 'glass-dark', 'glass-light', 'basic-dark', 'basic-light', 'retro-dark', 'retro-light', 'nier-dark', 'nier-light'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const tests = {
	async 'looks'(t) {
		const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS, sel = String(t.args.sel || '.rm-stagebox');
		await t.goto(String(t.args.page || 'index.html'));
		await t.page.waitForFunction(() => !!(window.PipSound && document.querySelector('#rmLook')));
		for (const look of looks) {
			await t.page.locator('#rmLook').selectOption(look);
			await sleep(1500);
			const box = await t.page.evaluate((s) => { const n = document.querySelector(s), r = n.getBoundingClientRect(), svg = n.querySelector('svg'); return { w: Math.round(r.width), h: Math.round(r.height), svg: svg ? Math.round(svg.getBoundingClientRect().width) + 'x' + Math.round(svg.getBoundingClientRect().height) : 'none', bg: getComputedStyle(n).backgroundColor }; }, sel);
			await t.check(`${look}: Pip's area is ${box.w}x${box.h}, its drawing ${box.svg}`, box.svg !== 'none' && box.h > 120, JSON.stringify(box));
			await t.page.locator(sel).scrollIntoViewIfNeeded();
			await t.crop(`room-${look}`, sel, `${look}: Pip's area in the listening room`);
			if (look === looks[0]) { await t.page.evaluate(() => scrollTo(0, 0)); await t.shot(`room-${look}-page`, `${look}: the top of the listening room (are the two numbered blocks clear?)`); }
		}
	}
};
