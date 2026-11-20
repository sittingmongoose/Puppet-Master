// FO-209 (astra-max-12h follow-up, 2026-11-14): in onboarding at phone width the NieR look's "Change the look"
// header control was covered by li.o55-railitem, so a real click timed out (390x844, light and dark; 360 px is a
// supported kit width). At 360x800 and 390x844, in NieR light and dark: no rail item overlaps the control, an
// elementFromPoint at its centre (and just inside its corners) is the control itself, and a real click opens the
// look palette. Desktop widths are not touched by the fix and are not this case's subject.
// Both surfaces (--set sandbox=0 / =1).
const SIZES = [[360, 800], [390, 844]];
const MODES = ['light', 'dark'];
const BTN = '#pm-o55-onboarding .o55-headctl .o55-lookbtn';

// the control's box, what owns its centre and inner corners, and any rail item lying over it
const REACH = (sel) => {
	const b = document.querySelector(sel);
	if (!b) return { found: false };
	const r = b.getBoundingClientRect();
	const pts = [[r.left + r.width / 2, r.top + r.height / 2]];
	for (const [fx, fy] of [[0.1, 0.15], [0.9, 0.15], [0.1, 0.85], [0.9, 0.85]]) pts.push([r.left + r.width * fx, r.top + r.height * fy]);
	const hits = pts.map(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e === b || b.contains(e) ? 'self' : (e.closest && e.closest('.o55-railitem') ? 'railitem' : e.tagName + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''))) : 'none'; });
	const over = [...document.querySelectorAll('#pm-o55-onboarding .o55-railitem')].map((li) => {
		const q = li.getBoundingClientRect();
		return !(q.right <= r.left || r.right <= q.left || q.bottom <= r.top || r.bottom <= q.top);
	});
	return { found: true, w: Math.round(r.width), h: Math.round(r.height), hits, covered: over.some(Boolean), layout: document.getElementById('pm-o55-onboarding').getAttribute('data-o55-layout') };
};

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	for (const mode of MODES) for (const [w, h] of SIZES) {
		T(`FO-209 NieR ${mode} ${w}x${h}: Change the look is reachable by a real click`, async (t) => {
			await t.viewport(w, h);
			const f = await t.app.open({ onboarding: true, query: 'o55=screen=look', sandbox: surface === 'sandbox' });
			// the look is chosen the way a person chooses it, on the Look screen
			const fam = f.locator('[data-o55-do="pickFamily"][data-arg="nier"]').last();
			await fam.scrollIntoViewIfNeeded();
			await fam.click();
			const pick = f.locator(`[data-o55-do="pickMode"][data-arg="${mode}"]`).last();
			await pick.scrollIntoViewIfNeeded();
			await pick.click();
			await f.waitForFunction((m) => O55.theme().chosen === 'nier' && O55.theme().mode === m, mode, { timeout: 15000 });
			await f.waitForSelector('#pm-o55-onboarding[data-o55-layout="narrow"]', { timeout: 15000 });
			await t.settle();
			await t.page.waitForTimeout(1200); // the rail's cold entry steps finish before the hit-test
			const r = await f.evaluate(REACH, BTN);
			await t.check('the control is drawn in the narrow layout', r.found && r.layout === 'narrow' && r.w >= 28 && r.h >= 28, JSON.stringify(r));
			await t.check('no rail item lies over the control', r.found && !r.covered, JSON.stringify(r));
			await t.check('elementFromPoint at its centre and inner corners is the control itself', r.found && r.hits.every((x) => x === 'self'), JSON.stringify(r.hits));
			// a real click opens the look palette
			await f.locator(BTN).click({ timeout: 8000 });
			const open = await f.waitForFunction(() => {
				const b = document.querySelector('#pm-o55-onboarding .o55-headctl .o55-lookbtn');
				const m = document.querySelector('#pm-o55-onboarding .o55-lookmenu');
				return !!(b && b.getAttribute('aria-expanded') === 'true' && m && m.getClientRects().length);
			}, null, { timeout: 8000 }).then(() => true).catch(() => false);
			await t.check('a real click opens the look palette', open);
			await t.page.keyboard.press('Escape');
			await t.page.waitForTimeout(300);
		});
	}
}
