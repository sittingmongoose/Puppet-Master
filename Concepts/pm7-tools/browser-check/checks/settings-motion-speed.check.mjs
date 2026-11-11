// Stream F batch 11, lane C, FO-153 (review/OPEN-AND-FOUND.md section C 3): Settings › General › App & Input ›
// Animation speed (Fast / Measured / Cinematic) is followed by the app's CSS transitions, not only saved. Most of the
// app names its times through custom properties (transition: opacity var(--motion-fast) var(--k3-ease-out)); such a
// shorthand leaves its longhands empty in the CSSOM, so those rules were never scaled and almost nothing changed.
// Measured on the page's own elements: every visible element in Settings (and the title bar's page tabs) whose
// transition has a duration at Measured must have it times 0.6 at Fast and times 1.6 at Cinematic (each transition
// in its list; durations that already carry their own speed are left out by the page). Usage keeps its own speed
// (--pmu-speed, read per look): it must follow a change of the setting at once, without a look change.
// The existing motion-token-speed check keeps covering scripted animations (Element.animate).
// Each test runs on the surfaces asked for (normal and T3's sandbox unless --set sandbox= picks one).

const RATIO = { Fast: 0.6, Cinematic: 1.6 };
async function settings(t, surface) {
	await t.viewport(1600, 1000);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
const setSpeed = (f, v) => f.evaluate((x) => PM12_KIMI.setSettingFromHost('general.visual.animation-speed', x), v);
/* every visible element in Settings and the page tabs, by a stable index, with its transition durations in ms */
const durations = (f) => f.evaluate(() => {
	const ms = (s) => s.split(',').map((x) => { x = x.trim(); return x.endsWith('ms') ? parseFloat(x) : parseFloat(x) * 1000; });
	const out = [];
	const nodes = [...document.querySelectorAll('#pm-settings-root *, .page-tabs .page-tab')];
	nodes.forEach((n, i) => {
		if (!n.getClientRects().length) return;
		const r = n.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
		const d = ms(getComputedStyle(n).transitionDuration);
		if (d.some((x) => x > 0)) out.push({ i, name: `${n.tagName.toLowerCase()}.${String(n.className).split(' ')[0]}`, d });
	});
	return out;
});

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const skip = async (t) => { if (t.app.surfaces().includes(surface)) return false; await t.check(`${surface} surface not asked for`, true); return true; };

	tests[`FO-153 Settings' transitions follow Animation speed (${surface})`] = async (t) => {
		if (await skip(t)) return;
		const f = await settings(t, surface);
		await f.evaluate(() => PM51.go('general', 'app-input'));
		await f.waitForSelector('[data-continuous-workspace-body="app-input"][data-workspace-mounted="true"]', { timeout: 15000 });
		await t.settle();
		try {
			await t.check('Measured accepted', await setSpeed(f, 'Measured'));
			await t.page.waitForTimeout(400);
			const base = await durations(f);
			await t.check('elements with a transition are on screen', base.length >= 40, `${base.length}`);
			for (const speed of ['Cinematic', 'Fast']) {
				await t.check(`${speed} accepted`, await setSpeed(f, speed));
				await t.page.waitForTimeout(500);
				const now = new Map((await durations(f)).map((x) => [x.i, x]));
				const off = [];
				for (const b of base) {
					const n = now.get(b.i); if (!n || n.d.length !== b.d.length) continue;
					if (b.d.some((x, k) => x > 0 && Math.abs(n.d[k] - x * RATIO[speed]) > Math.max(1.5, x * 0.02))) off.push(`${b.name} ${b.d.join('/')}→${n.d.join('/')}`);
				}
				const names = [...new Set(off.map((x) => x.split(' ')[0]))];
				await t.check(`${speed}: every transition on screen is ×${RATIO[speed]} its Measured time`, off.length === 0, `${off.length} of ${base.length} did not follow: ${names.slice(0, 8).join(', ')} (${off.slice(0, 3).join('; ')})`);
			}
		} finally { await setSpeed(f, 'Measured'); }
	};

	tests[`FO-153 Usage takes a new Animation speed at once (${surface})`] = async (t) => {
		if (await skip(t)) return;
		await t.viewport(1600, 1000);
		const f = await t.app.open({ sandbox: surface === 'sandbox' });
		await t.app.resetLayout();
		const tab = f.locator('.page-tabs .page-tab', { hasText: /^\s*Usage\s*$/ }).first();
		await tab.click();
		const shell = await f.waitForFunction(() => document.querySelector('#panel-usage .pmu-shell'), null, { timeout: 15000 }).then(() => true).catch(() => false);
		if (!(await t.check('the Usage page is drawn', shell))) return;
		await t.settle();
		const speedNow = () => f.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#panel-usage .pmu-shell')).getPropertyValue('--pmu-speed')) || 1);
		try {
			await setSpeed(f, 'Measured'); await t.page.waitForTimeout(300);
			const m = await speedNow();
			await setSpeed(f, 'Cinematic'); await t.page.waitForTimeout(400);
			const c = await speedNow();
			await t.check('Usage\'s --pmu-speed follows Cinematic at once (×1.6 of Measured)', Math.abs(c - m * 1.6) < 0.01, `Measured ${m}, Cinematic ${c}`);
			await setSpeed(f, 'Fast'); await t.page.waitForTimeout(400);
			const q = await speedNow();
			await t.check('Usage\'s --pmu-speed follows Fast at once (×0.6 of Measured)', Math.abs(q - m * 0.6) < 0.01, `Measured ${m}, Fast ${q}`);
		} finally { await setSpeed(f, 'Measured'); }
	};
}
