// RV-7: the wizard's step rail sits centred between the window's brand and its header controls, so any change in the
// width of those controls (Plain English <-> Expert, the sound button, the look menu) or of the window moves the rail
// without resizing it. The current chapter's chip (Glass's switcher lens, drawn in the window's own lens layer in every
// look that adopts the switcher) must move with it in the same frame. In all ten looks, with motion on (--set
// motion=reduce for Reduce Motion), each change is made inside a frame and the next frames are read: the chip's centre
// against the current chapter's bead and label (their union, the box the chip is fitted to), as an offset from where it
// sat before the change. A frame where it is more than 1.5 px off is a late frame; there must be none, and it must end
// where it started on the item. The wizard has no language switch besides Plain English and Expert.
const FRAMES = 24;

function measureSrc() {
	return () => {
		const win = document.querySelector('#pm-o55-onboarding .o55-win');
		const head = win && win.querySelector('.o55-head');
		const list = head && head.querySelector('.o55-raillist');
		const cur = list && list.querySelector('.o55-railitem[data-state="current"]');
		if (!cur) return { ok: false, why: 'no current rail item' };
		const parts = [cur.querySelector('.o55-railnode'), cur.querySelector('.o55-raillabel')].map((e) => e && e.getBoundingClientRect()).filter((b) => b && b.width > 0 && b.height > 0);
		const u = { l: Math.min(...parts.map((b) => b.left)), r: Math.max(...parts.map((b) => b.right)) };
		const lab = cur.querySelector('.o55-raillabel').getBoundingClientRect();
		const hb = head.getBoundingClientRect(), lb = list.getBoundingClientRect();
		const lenses = [...win.querySelectorAll('.lg-lens')].map((e) => ({ e, b: e.getBoundingClientRect(), op: +getComputedStyle(e).opacity }))
			.filter((x) => x.b.width > 0 && x.b.height > 0 && x.op > 0.05 && x.b.top < hb.bottom && x.b.bottom > hb.top && x.b.right > lb.left && x.b.left < lb.right);
		const rail = { x: Math.round(lb.left * 10) / 10, label: cur.getAttribute('data-chapter') };
		if (!lenses.length) return { ok: true, lens: false, rail };
		const L = lenses[0].b;
		return {
			ok: true, lens: true, rail, count: lenses.length,
			off: Math.round(((L.left + L.right) / 2 - (u.l + u.r) / 2) * 10) / 10,
			covers: L.left <= lab.left + 0.5 && L.right >= lab.right - 0.5,
			under: !!lenses[0].e.closest('.lg-lenses-under')
		};
	};
}

// do `act` inside a frame, then read the chip in each of the next frames (each read shows what the frame before painted)
async function framesAfter(f, act, n) {
	return f.evaluate(([actSrc, mSrc, n]) => new Promise((res) => {
		const measure = (0, eval)(mSrc), act = (0, eval)(actSrc);
		const out = [];
		requestAnimationFrame(() => {
			const before = measure();
			act();
			const tick = () => { out.push(measure()); if (out.length < n) requestAnimationFrame(tick); else res({ before, out }); };
			requestAnimationFrame(tick);
		});
	}), [act.toString(), measureSrc().toString(), n]);
}

const talkBtn = () => { document.querySelector('#pm-o55-onboarding .o55-talkslot button').click(); };
const soundBtn = () => { document.querySelector('#pm-o55-onboarding .o55-soundslot button').click(); };
const lookBtn = () => { document.querySelector('#pm-o55-onboarding .o55-lookslot .o55-lookbtn, #pm-o55-onboarding .o55-lookslot button').click(); };

export default async function (t) {
	await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	const f = t.page;
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });   // --set motion=reduce: under Reduce Motion
	// the Computer chapter current, as in the films (Welcome done before it, three chapters after)
	const screen = await f.evaluate(() => {
		const defs = window.O55.screens.defs, ids = Object.keys(defs);
		const pick = ['c-route'].concat(ids.filter((id) => defs[id].chapter === 'computer'));
		for (const id of pick) { try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { continue; } if (window.O55.S.sess.screen === id) return id; }
		return window.O55.S.sess.screen;
	});
	await f.waitForTimeout(1200);
	t.log(`screen ${screen}`);
	await f.evaluate(() => { if (!window.O55.talk.eli5()) window.O55.talk.set('ELI5', 'test'); });
	const measure = measureSrc();
	const looks = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((fam) => [`${fam}-light`, `${fam}-dark`]);
	const withChip = [], noChip = [], bad = [], rows = [];
	for (const look of looks) {
		// the wizard's own look switch (the kit's look helper changes the app's theme, which the open wizard holds)
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const applied = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || ''; const nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		if (!applied) { bad.push(`${look}: the look did not apply (${await f.evaluate(() => document.documentElement.getAttribute('data-theme'))})`); continue; }
		await f.waitForTimeout(2000);
		const rest = await f.evaluate(measure);
		if (!rest.ok) { bad.push(`${look}: ${rest.why}`); continue; }
		if (!rest.lens) { noChip.push(look); continue; }
		withChip.push(look);
		if (!rest.covers) bad.push(`${look} at rest: the chip does not cover "${rest.rail.label}"`);
		const steps = [
			['Expert', talkBtn], ['Plain English', talkBtn],
			['sound off', soundBtn], ['sound on', soundBtn],
			['look menu open', lookBtn], ['look menu closed', lookBtn]
		];
		for (const [name, act] of steps) {
			const r = await framesAfter(f, act, FRAMES);
			await f.waitForTimeout(700);
			const end = await f.evaluate(measure);
			const shift = Math.round((r.out[r.out.length - 1].rail.x - r.before.rail.x) * 10) / 10;
			const late = r.out.filter((m) => !m.lens || Math.abs(m.off - rest.off) > 1.5).length;
			const endOff = end.lens ? Math.round((end.off - rest.off) * 10) / 10 : null;
			rows.push(`${look} ${name}: rail ${shift >= 0 ? '+' : ''}${shift} px, late frames ${late}/${FRAMES}, chip at the end ${endOff === null ? 'gone' : (endOff >= 0 ? '+' : '') + endOff + ' px'}${end.under ? ' (under-layer)' : ''}`);
			if (late || endOff === null || Math.abs(endOff) > 1.5) bad.push(`${look} ${name}: rail moved ${shift} px; ${late} late frame(s); chip ends ${endOff === null ? 'gone' : endOff + ' px'} off`);
		}
		// the window's width: the rail re-centres in the header; read the frames from the resize on
		for (const [w, h] of [[1500, 1000], [1920, 1080]]) {
			const before = await f.evaluate(measure);
			await t.viewport(w, h);
			const out = await f.evaluate(([mSrc, n]) => new Promise((res) => { const m = (0, eval)(mSrc), o = []; const tick = () => { o.push(m()); if (o.length < n) requestAnimationFrame(tick); else res(o); }; requestAnimationFrame(tick); }), [measure.toString(), FRAMES]);
			await f.waitForTimeout(700);
			const end = await f.evaluate(measure);
			const shift = Math.round((out[out.length - 1].rail.x - before.rail.x) * 10) / 10;
			const late = out.filter((m) => !m.lens || Math.abs(m.off - rest.off) > 1.5).length;
			const endOff = end.lens ? Math.round((end.off - rest.off) * 10) / 10 : null;
			rows.push(`${look} window ${w}x${h}: rail ${shift >= 0 ? '+' : ''}${shift} px, late frames ${late}/${FRAMES}, chip at the end ${endOff === null ? 'gone' : (endOff >= 0 ? '+' : '') + endOff + ' px'}`);
			if (late || endOff === null || Math.abs(endOff) > 1.5) bad.push(`${look} window ${w}x${h}: rail moved ${shift} px; ${late} late frame(s); chip ends ${endOff === null ? 'gone' : endOff + ' px'} off`);
		}
	}
	rows.forEach((r) => t.log(r));
	t.log(`looks with a rail chip: ${withChip.join(' ') || 'none'}; without: ${noChip.join(' ') || 'none'}`);
	await t.check('the rail chip is drawn in Basic and Glass (the filmed looks)', ['basic-light', 'glass-dark'].every((l) => withChip.includes(l)), `with: ${withChip.join(' ')}`);
	await t.check(`the rail chip moves with the rail in the same frame (${withChip.length} looks; Expert, Plain English, sound, look menu, window size)`, bad.length === 0, bad.slice(0, 10).join('; ') + (bad.length > 10 ? ` (+${bad.length - 10} more)` : ''));
	await f.evaluate(() => { if (!window.O55.talk.eli5()) window.O55.talk.set('ELI5', 'test'); });
}
