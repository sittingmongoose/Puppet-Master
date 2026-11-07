// FO-97 (guard): the onboarding footer's Back shows a visible focus mark when a real Tab reaches it. Read from painted
// pixels: the band just outside Back's box (1 to 9 px out) is captured with nothing focused and again 450 ms after a real
// Tab lands on Back (the element before it focused first); at least 40 pixels of the band must change by more than 40
// luminance levels, at a median contrast of 3:1 or more against what was there before (WCAG 1.4.11's non-text minimum).
// In NieR the mark is NieR's own: four ink brackets (the brackets part, kit.d/19-nier-parts.js #o55np-reticle, which
// replaces every outline, 14-nier-parts.css); --set nierParts=nobrackets takes that part away, and NieR's outline must
// then show. All ten looks by default (--set look= picks some): FO-97's NieR Light and Dark, and FO-99's Friendly Light,
// whose 2 px orange outline measured 2.64:1 (it takes the look's brick now, 10-window.css --o55-focus). 1920x1080, 860
// and 740; c-ready (Back, Enter Puppet Master and Take the Guided Tour, each with its ?: at 860 the two leave Back its
// chevron alone, as the narrow window does at 740) and Where (Back and Continue); both surfaces. The log gives Back's
// width and the window's layout.
//   --set size=740x900   --set look=nier-dark   --set screen=c-ready   --set selftest=noring (must fail)

const SIZES = [[1920, 1080], [860, 900], [740, 900]];
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';
const lum = (r, g, b) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

async function cell(t, surface, w, h) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.viewport(w, h);
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.O55?.S?.open, null, { timeout: 30000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
	/* the check's own test: --set selftest=noring takes every focus mark away (the reticle and any outline); it must fail */
	if (t.args.selftest === 'noring') await f.evaluate(() => { const st = document.createElement('style'); st.textContent = '#o55np-reticle { display: none !important; } :focus-visible { outline: none !important; box-shadow: none !important; }'; document.head.appendChild(st); });
	const settle = () => f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-layer.o55-entering, #pm-o55-onboarding .o55-layer.o55-out') && !O55.nierLook.busy() && !document.getElementById('o55np-reboot'), null, { timeout: 15000 }).catch(() => {});
	for (const look of list(t.args.look, LOOKS)) {
		await t.page.mouse.move(2, 2);
		await f.evaluate((v) => { document.documentElement.setAttribute('data-motion', 'full'); O55.S.lookOpen = false; O55.ui.applyLook(...v); }, look.split('-'));
		await f.waitForTimeout(1600); await settle();
		/* --set nierParts=nobrackets: NieR without its brackets part (the outline is its focus mark then) */
		if (t.args.nierParts === 'nobrackets' && look.startsWith('nier')) { await f.evaluate(() => { const s = PM_NIER.store('preview'); s.setParts(s.parts().filter((p) => p !== 'brackets')); }); await f.waitForTimeout(800); }
		for (const screen of list(t.args.screen, ['c-ready', 'where'])) {
			const tag = `${screen} ${look} ${surface} ${w}x${h}`;
			await f.evaluate((s) => O55.ui.go(s, { noHistory: true }), screen); await settle(); await f.waitForTimeout(500);
			const box = await f.evaluate((L) => { document.activeElement?.blur?.(); const b = document.querySelector(L + ' .o55-foot .o55-back'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, LAYER);
			if (!box) { await t.check(`FO-97 fixture: the footer has Back ${tag}`, false); continue; }
			const P = 9, region = { x: off.x + Math.floor(box.x) - P, y: off.y + Math.floor(box.y) - P, width: Math.ceil(box.w) + 2 * P + 1, height: Math.ceil(box.h) + 2 * P + 1 };
			await f.waitForTimeout(300);
			const rest = await t.pixels(region);
			const how = await f.evaluate((L) => { const l = document.querySelector(L), b = l.querySelector('.o55-foot .o55-back'); const all = [...l.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((e) => e.getClientRects().length && !e.closest('[inert]')); const i = all.indexOf(b); if (i > 0) { all[i - 1].focus(); return 'tab'; } b.focus(); return 'shift'; }, LAYER);
			if (how === 'tab') await t.page.keyboard.press('Tab'); else { await t.page.keyboard.press('Shift+Tab'); await t.page.keyboard.press('Tab'); }
			await f.waitForTimeout(450);
			const state = await f.evaluate((L) => { const b = document.querySelector(L + ' .o55-foot .o55-back'); return { focused: document.activeElement === b, fv: b.matches(':focus-visible'), backW: Math.round(b.getBoundingClientRect().width), layout: document.getElementById('pm-o55-onboarding').getAttribute('data-o55-layout') }; }, LAYER);
			const focus = await t.pixels(region);
			/* the band outside Back's box: 1 to 9 px out */
			const bx0 = Math.floor(box.x) - region.x + off.x, by0 = Math.floor(box.y) - region.y + off.y, bx1 = bx0 + Math.ceil(box.w), by1 = by0 + Math.ceil(box.h);
			let band = 0, changed = 0; const ratios = [];
			for (let y = 0; y < rest.height; y++) for (let x = 0; x < rest.width; x++) {
				const inside = x >= bx0 && x < bx1 && y >= by0 && y < by1; if (inside) continue;
				band++;
				const i = 4 * (y * rest.width + x), a = lum(rest.data[i], rest.data[i + 1], rest.data[i + 2]), c = lum(focus.data[i], focus.data[i + 1], focus.data[i + 2]);
				if (Math.abs(0.2126 * (focus.data[i] - rest.data[i]) + 0.7152 * (focus.data[i + 1] - rest.data[i + 1]) + 0.0722 * (focus.data[i + 2] - rest.data[i + 2])) <= 40) continue;
				changed++; ratios.push((Math.max(a, c) + 0.05) / (Math.min(a, c) + 0.05));
			}
			ratios.sort((p, q) => p - q);
			const median = ratios.length ? +ratios[Math.floor(ratios.length / 2)].toFixed(2) : 0;
			t.log(`FO-97 ${tag} ` + JSON.stringify({ ...state, band, changed, median }));
			await t.check(`FO-97 Back shows a visible focus mark when Tab reaches it ${tag}`, state.focused && state.fv && changed >= 40 && median >= 3, JSON.stringify({ ...state, band, changed, median }));
			await f.evaluate(() => document.activeElement?.blur?.());
		}
	}
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) for (const [w, h] of SIZES) {
	tests[`FO-97 Back focus ${surface} ${w}x${h}`] = async (t) => {
		if (t.args.size && !list(t.args.size, []).includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
		return cell(t, surface, w, h);
	};
}
