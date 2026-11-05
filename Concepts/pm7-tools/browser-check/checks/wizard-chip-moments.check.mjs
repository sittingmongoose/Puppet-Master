// SW-24 and SW-25: the onboarding window's tab chip (the switcher lens, drawn in the window's lens layer) in two moments
// that rail-chip's p77 and M6 rows did not judge. Every frame is read at its end (a ResizeObserver, after the frame's
// animation callbacks and Liquid Glass's after-layout sync, the last thing before paint).
// - SW-24 (lane found p77 limit, 2026-11-01): on nas-find with Home NAS chosen, in Basic Dark, Glass is picked from the
//   window's look menu and Continue is pressed (a real mouse click) 120-520 ms later, inside the look's reveal. No frame
//   may show a chip that is not on a chosen tab of the screen now showing. Cause: Liquid Glass's settle check
//   (glass.js settleNow, 480 ms after a chip arrives; a switch into Glass gives every chip a fresh arrival) showed the
//   leaving screen's parked chip again over the next screen for 2-10 frames.
// - SW-25 (lane found M6 limit): on nas-find, in each of the ten looks, the device cards are chosen (the content changes
//   height under a held column; the screen came in once, with nothing chosen), then the window goes 1080 -> 900 -> 1080
//   high. At least one resize must move the column inside the window (the case under test). The chip must stay on the SSH tab (its
//   offset from the tab within 1.5 px of where it rested) in every frame. Cause: the resize re-centres the held column
//   (60-ui-core.js holdColumn) with no box changing size, so Liquid Glass's size follow never fired; the held top is now
//   the layer's data-col-top, which glass.js watches. Also asserted: the layer's data-col-top is its held top.
// Normal page by default; `--set sandbox=1` runs it in T3's sandbox. Headless (the window's size changes).
// `--set only=sw24|sw25` runs one case. About 2 minutes.
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);

function install() {
	if (window.__wcm) return;
	const S = window.__wcm = { on: false, left: 0, frames: [], mode: 'stray' };
	const d = document.createElement('div');
	d.setAttribute('aria-hidden', 'true');
	d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;contain:strict';
	document.body.appendChild(d);
	let w = 1;
	const r1 = (v) => Math.round(v * 10) / 10;
	const lensesBelowHead = (win) => {
		const hb = win.querySelector('.o55-head').getBoundingClientRect();
		// (a lens parked by a look whose chips live in another layer is hidden by visibility, its opacity untouched)
		return [...win.querySelectorAll('.lg-lens')].filter((e) => !e.closest('.lg-lenses-under')).map((e) => { const cs = getComputedStyle(e); return { b: e.getBoundingClientRect(), op: cs.visibility === 'hidden' ? 0 : +cs.opacity }; })
			.filter((x) => x.op > 0.05 && x.b.width > 0 && x.b.top >= hb.bottom - 1);
	};
	// SW-24: chips below the header that sit on no chosen tab of the screen now showing
	const strays = () => {
		const win = document.querySelector('#pm-o55-onboarding .o55-win'); if (!win) return null;
		const on = [...win.querySelectorAll('.o55-pane > .o55-layer:not(.o55-out) .o55-seg button.o55-on')].map((e) => e.getBoundingClientRect());
		return lensesBelowHead(win).filter((x) => !on.some((o) => Math.abs((o.left + o.right) / 2 - (x.b.left + x.b.right) / 2) < 3 && Math.abs((o.top + o.bottom) / 2 - (x.b.top + x.b.bottom) / 2) < 3))
			.map((x) => [Math.round(x.b.left), Math.round(x.b.top), Math.round(x.b.width), Math.round(x.b.height), r1(x.op)]);
	};
	// SW-25: the chip nearest the strip, its centre's offset from the chosen tab's
	const offset = () => {
		const win = document.querySelector('#pm-o55-onboarding .o55-win'); if (!win) return null;
		const strip = win.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-seg'), on = strip && strip.querySelector('button.o55-on');
		if (!on) return null;
		const ob = on.getBoundingClientRect(), sb = strip.getBoundingClientRect(), cy = (b) => (b.top + b.bottom) / 2;
		const L = lensesBelowHead(win).sort((a, b) => Math.abs(cy(a.b) - cy(sb)) - Math.abs(cy(b.b) - cy(sb)))[0];
		return L ? [r1((L.b.left + L.b.right) / 2 - (ob.left + ob.right) / 2), r1(cy(L.b) - cy(ob))] : 'none';
	};
	const read = () => ({ t: Math.round(performance.now()), screen: window.O55.S.sess.screen, v: S.mode === 'stray' ? strays() : offset() });
	const tick = () => { if (S.on) { w = w === 1 ? 2 : 1; d.style.width = w + 'px'; } requestAnimationFrame(tick); };
	requestAnimationFrame(tick);
	new ResizeObserver(() => { if (!S.on) return; S.frames.push(read()); if (--S.left <= 0) { S.on = false; const done = S.done; S.done = null; if (done) done(S.frames); } }).observe(d);
	S.offset = offset;
}
const arm = (f, n, mode) => f.evaluate(([k, m]) => { const S = window.__wcm; S.mode = m; S.frames = []; S.left = k; S.on = true; S.p = new Promise((res) => { S.done = res; }); }, [n, mode]);
const collect = (f) => f.evaluate(() => window.__wcm.p);
const chooseNas = (f, title) => f.evaluate((tt) => [...document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]')].find((c) => (c.querySelector('.o55-cardtitle') || c).textContent.trim() === tt).click(), title);
const toNasFind = async (f) => {
	await f.evaluate(() => { window.O55.ui.go('nas-find', { noHistory: true }); });
	await f.waitForFunction(() => document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]').length >= 2 && !document.querySelector('#pm-o55-onboarding .o55-layer.o55-out'), null, { timeout: 15000 });
};
const settled = (f) => f.waitForFunction(() => !window.O55.S.vt && !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy()) && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy()), null, { timeout: 30000 }).catch(() => {});

export default async function (t) {
	await t.viewport(1920, 1080);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
	await t.emulate({ reducedMotion: 'no-preference' });
	await f.evaluate(install);
	const only = t.args.only;

	if (!only || only === 'sw24') {
		const rows = [], bad = [];
		const btn = f.locator('#pm-o55-onboarding .o55-lookslot .o55-lookbtn');
		const delays = [120, 200, 280, 360, 440, 520];
		for (const [i, delay] of delays.entries()) {
			const to = i % 2 ? 'light' : 'dark';   // into Glass Dark and Glass Light, from Basic in the same mode
			await f.evaluate((m) => window.O55.ui.applyLook('basic', m), to);
			await settled(f);
			await toNasFind(f);
			await chooseNas(f, 'Home NAS');
			await f.waitForTimeout(1500);
			if (!(await f.locator('#pm-o55-onboarding .o55-lookmenu').count())) { await btn.click(); await f.waitForSelector('#pm-o55-onboarding .o55-lookmenu'); await f.waitForTimeout(400); }
			const pri = await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
			const off = t.sandboxed ? await t.page.evaluate(() => { const fr = document.querySelector('iframe'); const r = fr ? fr.getBoundingClientRect() : { left: 0, top: 0 }; return [r.left, r.top]; }) : [0, 0];
			const glass = f.locator('#pm-o55-onboarding .o55-lookmenu [data-o55-do="lookFamily"][data-arg="glass"]');
			await glass.click({ trial: true });
			await arm(f, 90, 'stray');
			await glass.click();
			await f.waitForTimeout(delay);
			await t.page.mouse.click(off[0] + pri[0], off[1] + pri[1]);
			const fr = await collect(f);
			const strayAt = fr.map((x, k) => (x.v && x.v.length ? k + 1 : 0)).filter(Boolean);
			const screens = [...new Set(fr.map((x) => x.screen))].join(' > ');
			rows.push(`glass-${to}, Continue +${delay} ms: ${screens}; frames with a stray chip ${strayAt.length}/${fr.length}${strayAt.length ? ' (' + strayAt.slice(0, 10).join(',') + ') e.g. ' + JSON.stringify(fr[strayAt[0] - 1].v) : ''}`);
			if (strayAt.length) bad.push(`glass-${to} +${delay} ms: ${strayAt.length} frame(s) from frame ${strayAt[0]}`);
			if (!/nas-identity/.test(screens)) bad.push(`glass-${to} +${delay} ms: the screen did not change (${screens})`);
			await f.waitForTimeout(600);
		}
		rows.forEach((r) => t.log('SW-24 ' + r));
		await t.check('SW-24: a screen changed inside the reveal of a switch into Glass leaves no chip of the old screen in any frame (6 tries, Glass Dark and Light)', bad.length === 0, bad.join('; '));
	}

	if (!only || only === 'sw25') {
		const rows = [], bad = [];
		let held = 0, heldOk = 0;
		// the screen comes in once, with nothing chosen (its column held for that content); each look then picks the
		// devices, whose note grows the content under the held column, as in rail-chip's seg pass and the films
		await f.evaluate(() => window.O55.ui.applyLook('basic', 'dark'));
		await settled(f);
		await toNasFind(f);
		await f.waitForTimeout(1200);
		for (const look of (t.args.looks ? t.args.looks.split(',') : LOOKS)) {
			const [fam, mode] = look.split('-');
			await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
			await settled(f);
			await f.waitForTimeout(1200);
			await chooseNas(f, 'Media server'); await f.waitForTimeout(900); await chooseNas(f, 'Home NAS'); await f.waitForTimeout(1400);
			for (const [w, h] of [[1920, 900], [1920, 1080]]) {
				const rest = await f.evaluate(() => window.__wcm.offset());
				const at = () => f.evaluate(() => { const w = document.querySelector('#pm-o55-onboarding .o55-win'), s = w.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-seg'); return s ? Math.round(s.getBoundingClientRect().top - w.getBoundingClientRect().top) : null; });
				const at0 = await at();
				await arm(f, 24, 'offset');
				await t.viewport(w, h);
				const fr = await collect(f);
				// the cause: the held top is the layer's data-col-top
				const col = await f.evaluate(() => { const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'); return l ? { attr: l.getAttribute('data-col-top'), held: l.hasAttribute('data-col-held'), top: l.style.getPropertyValue('--o55-col-top') } : null; });
				if (col && col.held) { held++; if (col.attr != null && col.attr + 'px' === col.top.trim()) heldOk++; }
				if (!Array.isArray(rest)) { rows.push(`${look} ${w}x${h}: no chip at rest (${rest})`); continue; }
				const late = fr.filter((x) => !Array.isArray(x.v) || Math.abs(x.v[0] - rest[0]) > 1.5 || Math.abs(x.v[1] - rest[1]) > 1.5);
				const at1 = await at();
				rows.push(`${look} ${w}x${h}: column moved ${at1 - at0} px in the window; ${late.length}/${fr.length} frames off the tab${late.length ? ' (first ' + JSON.stringify(late[0].v) + ' against rest ' + JSON.stringify(rest) + ')' : ''}`);
				if (late.length) bad.push(`${look} ${w}x${h}: ${late.length} frame(s) off the tab`);
				await f.waitForTimeout(700);
			}
		}
		rows.forEach((r) => t.log('SW-25 ' + r));
		await t.check('SW-25: a window-height change keeps the SSH tabs\' chip on its tab in every frame, in every look with a chip', bad.length === 0 && rows.some((r) => /frames off the tab/.test(r)) && rows.some((r) => /column moved -?[1-9]/.test(r)), bad.slice(0, 8).join('; '));
		await t.check('SW-25 cause: the held column\'s top is on its layer as data-col-top (what Liquid Glass watches)', held > 0 && heldOk === held, `${heldOk}/${held} layers`);
	}
	await t.viewport(1920, 1080);
}
