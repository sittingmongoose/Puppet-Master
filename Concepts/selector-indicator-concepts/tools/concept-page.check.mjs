// The concept page: audit (overflow, clipped text, covered controls, console errors) at desktop and phone widths,
// with High Contrast preview on and off; every strip's indicator sits on its chosen item after clicks and keys in
// every concept and mode; the live contrast table is written out (--set contrastOut=<file>); one crop per concept.
const wait = (t) => t.until('page ready', () => document.documentElement.dataset.ready === '1', null, { timeout: 20000, hard: true });
async function indOnItems(t, label) {
	const bad = await t.page.evaluate(() => {
		const out = [];
		document.querySelectorAll('[data-strip]').forEach((s) => {
			if (!s.offsetParent) return;
			const kind = s.dataset.strip, ind = s.querySelector(':scope > .ind:not(.ghost)');
			const item = kind === 'steps' ? s.querySelector('.o55-railitem[data-state="current"] .o55-raillabel') : s.querySelector('.active');
			// the indicator's own layout box (offset*), so a concept that tilts its chip (F3) is judged unrotated
			const sr = s.getBoundingClientRect(), b = item.getBoundingClientRect();
			const a = { left: sr.left + ind.offsetLeft, top: sr.top + ind.offsetTop }; a.right = a.left + ind.offsetWidth; a.bottom = a.top + ind.offsetHeight;
			const off = Math.max(Math.abs(a.left - b.left), Math.abs(a.right - b.right), Math.abs(a.top - b.top), Math.abs(a.bottom - b.bottom));
			if (off > 2.5) out.push(`${s.closest('.concept').id} ${s.closest('.demo').dataset.mode} ${kind}: off by ${off.toFixed(1)} px`);
		});
		return out;
	});
	await t.check(`${label}: every indicator sits on its chosen item`, bad.length === 0, bad.slice(0, 6).join('; '));
}
export const tests = {
	async 'desktop: audit, moves, contrast'(t) {
		await t.goto(t.app.url()); await wait(t);
		await t.audit('desktop 1920', { maxStops: 60 });
		await indOnItems(t, 'at load');
		// clicks: second tab, fourth step, third option, second file tab, in every demo; then keys
		for (const id of ['f1', 'f2', 'f3', 'b1', 'b2']) for (const mode of ['light', 'dark']) {
			const d = `#${id} .demo.${mode}`;
			await t.page.click(`${d} .page-tab:nth-child(4)`);
			await t.page.click(`${d} .o55-railitem:nth-child(4)`);
			await t.page.click(`${d} .o55-opt:nth-child(3) .o55-card`);
			await t.page.click(`${d} .pm-segtab-item:nth-of-type(3)`);
		}
		await t.page.waitForTimeout(800);
		await indOnItems(t, 'after clicks');
		await t.page.focus('#f2 .demo.light .page-tab.active'); await t.page.keyboard.press('ArrowRight'); await t.page.keyboard.press('ArrowRight');
		await t.page.waitForTimeout(700);
		const name = await t.page.evaluate(() => document.querySelector('#f2 .demo.light .page-tab.active').textContent);
		await t.equal('ArrowRight twice from Planning Wizard picks Usage', name, 'Usage');
		await indOnItems(t, 'after keys');
		const contrast = await t.page.evaluate(() => window.__contrast);
		if (t.args.contrastOut) (await import('node:fs')).writeFileSync(t.args.contrastOut, JSON.stringify(contrast, null, 1));
		const fails = [];
		for (const [id, modes] of Object.entries(contrast)) for (const [m, R] of Object.entries(modes)) for (const [k, v] of Object.entries(R)) if (!(v[1] >= v[2])) fails.push(`${id} ${m} ${k} ${v[1] && v[1].toFixed(2)}`);
		await t.check('every measured state meets its contrast need', fails.length === 0, fails.join('; '));
		if (t.args.shots) for (const id of ['f1', 'f2', 'f3', 'b1', 'b2']) await t.crop(`concept-${id}`, `#${id} .pair`, `concept ${id} after clicks`);
		await t.page.click('[data-hc="on"]'); await t.page.waitForTimeout(300);
		await t.audit('desktop 1920, High Contrast preview', { maxStops: 60 });
		if (t.args.shots) await t.crop('hc-f2', '#f2 .pair', 'F2 in High Contrast preview');
		if (t.args.shots) await t.crop('hc-b2', '#b2 .pair', 'B2 in High Contrast preview');
	},
	async 'Edge-like 1366 and phone 390: audit'(t) {
		await t.viewport(1366, 768); await t.goto(t.app.url()); await wait(t);
		await t.audit('1366', { maxStops: 60 });
		await indOnItems(t, '1366');
		await t.viewport(390, 844); await t.goto(t.app.url()); await wait(t);
		await t.audit('phone 390', { maxStops: 90 });
		const sideways = await t.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		await t.check('no sideways page scroll at 390', sideways <= 0, `${sideways} px`);
		await indOnItems(t, 'phone 390');
	},
	async 'Windows 125 % scaling and real forced colors'(t) {
		// a 1920 x 1080 screen at Windows' default 125 % scaling is a 1536 x 864 CSS viewport at device scale 1.25
		await t.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 });
		await t.goto(t.app.url()); await wait(t);
		await t.audit('1536 at 1.25', { maxStops: 120 });
		await indOnItems(t, '1536 at 1.25');
		// Windows High Contrast as Edge reports it: (forced-colors: active). The page must switch its demos to system colours
		await t.page.emulateMedia({ forcedColors: 'active' });
		await t.until('forced colors seen', () => document.documentElement.classList.contains('fc'));
		const hc = await t.page.evaluate(() => ['f1', 'f2', 'f3', 'b1', 'b2'].map((id) => {
			const d = document.querySelector(`#${id} .demo.light`), ind = d.querySelector('.page-tabs > .ind'), tab = d.querySelector('.page-tab.active');
			const probe = document.createElement('span'); probe.style.cssText = 'background:Highlight;color:HighlightText'; d.appendChild(probe);
			const hl = getComputedStyle(probe).backgroundColor, hlt = getComputedStyle(probe).color; probe.remove();
			const s = getComputedStyle(ind), want = id === 'b2' ? s.borderTopColor : s.backgroundColor;
			return { id, ok: want === hl && (id === 'b2' || getComputedStyle(tab).color === hlt), got: want, hl };
		}));
		await t.check('forced colors: every concept marks the chosen tab with the system Highlight', hc.every((x) => x.ok), JSON.stringify(hc.filter((x) => !x.ok)));
		await t.audit('1536 at 1.25, forced colors', { maxStops: 120 });
		if (t.args.shots) await t.crop('fc-f1', '#f1 .pair', 'F1 under real forced colors');
	}
};
