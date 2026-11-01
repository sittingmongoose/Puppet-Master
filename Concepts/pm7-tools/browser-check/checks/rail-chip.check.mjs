// RV-7 and M6: a chip (Glass's switcher lens, drawn in the wizard window's own lens layer in every look that adopts the
// switcher, or inside its strip in the looks whose chip is an under-layer) must move with its strip in the same frame
// when the strip's neighbours move it without resizing it.
// - The step rail sits centred between the window's brand and its header controls: Plain English <-> Expert, the sound
//   button, the look menu and the window's width move it (RV-7), with the Computer chapter current, as in the films.
// - The SSH / SMB / NFS tabs on "Which device has the files?" (nas-find) sit in content centred in the pane: choosing a
//   device card adds or swaps the note under it, the content's height changes and it re-centres, moving the tabs (M6);
//   the window's height does it too. The scan's own arrival is checked where the chip ends.
// In all ten looks, with motion on (--set motion=reduce for Reduce Motion), each change is made inside a frame and the
// next frames are read: the chip's centre against its item's box (the rail's current bead and label, the chosen tab), as
// an offset from where it sat before the change. A frame where it is more than 1.5 px off is a late frame; there must be
// none, and it must end where it started on the item. The wizard has no language switch besides Plain English and Expert.
const FRAMES = 24;

// window.__chipKind picks the strip: 'rail' or 'seg'
function measureSrc() {
	return () => {
		const r1 = (v) => Math.round(v * 10) / 10, cx = (b) => (b.left + b.right) / 2, cy = (b) => (b.top + b.bottom) / 2;
		const kind = window.__chipKind || 'rail';
		const win = document.querySelector('#pm-o55-onboarding .o55-win');
		const head = win && win.querySelector('.o55-head');
		if (!head) return { ok: false, why: 'no wizard window' };
		const hb = head.getBoundingClientRect();
		let strip, box, label, name;
		if (kind === 'rail') {
			strip = head.querySelector('.o55-raillist');
			const cur = strip && strip.querySelector('.o55-railitem[data-state="current"]');
			if (!cur) return { ok: false, why: 'no current rail item' };
			const parts = [cur.querySelector('.o55-railnode'), cur.querySelector('.o55-raillabel')].map((e) => e && e.getBoundingClientRect()).filter((b) => b && b.width > 0 && b.height > 0);
			box = { left: Math.min(...parts.map((b) => b.left)), right: Math.max(...parts.map((b) => b.right)), top: Math.min(...parts.map((b) => b.top)), bottom: Math.max(...parts.map((b) => b.bottom)) };
			label = cur.querySelector('.o55-raillabel').getBoundingClientRect(); name = cur.getAttribute('data-chapter');
		} else {
			strip = win.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-seg');
			const on = strip && strip.querySelector('button.o55-on, button[aria-checked="true"]');
			if (!on) return { ok: false, why: 'no chosen tab' };
			box = label = on.getBoundingClientRect(); name = on.textContent.trim();
		}
		const sb = strip.getBoundingClientRect();
		const pos = { x: r1(sb.left), y: r1(sb.top), name };
		const own = [...strip.querySelectorAll('.lg-lens')];
		const pool = (own.length ? own : [...win.querySelectorAll('.lg-lens')].filter((e) => !e.closest('.o55-layer.o55-out') && !e.closest('.lg-lenses-under')))
			.map((e) => ({ e, b: e.getBoundingClientRect(), op: +getComputedStyle(e).opacity }))
			.filter((x) => x.b.width > 0 && x.b.height > 0 && x.op > 0.05 && x.b.right > sb.left && x.b.left < sb.right
				&& (kind === 'rail' ? x.b.top < hb.bottom && x.b.bottom > hb.top : x.b.top >= hb.bottom - 1 && Math.abs(cy(x.b) - cy(sb)) < 120))
			.sort((a, b) => Math.abs(cy(a.b) - cy(sb)) - Math.abs(cy(b.b) - cy(sb)));
		if (!pool.length) return { ok: true, lens: false, pos };
		const L = pool[0].b;
		return {
			ok: true, lens: true, pos,
			dx: r1(cx(L) - cx(box)), dy: r1(cy(L) - cy(box)),
			covers: L.left <= label.left + 0.5 && L.right >= label.right - 0.5,
			under: !!pool[0].e.closest('.lg-lenses-under')
		};
	};
}

// do `act` inside a frame, then read the chip in each of the next frames (each read shows what the frame before painted)
async function framesAfter(f, act, n) {
	return f.evaluate(([actSrc, mSrc, n]) => new Promise((res) => {
		const measure = (0, eval)('(' + mSrc + ')'), act = (0, eval)('(' + actSrc + ')');
		const out = [];
		requestAnimationFrame(() => {
			const before = measure();
			act();
			const tick = () => { out.push(measure()); if (out.length < n) requestAnimationFrame(tick); else res({ before, out }); };
			requestAnimationFrame(tick);
		});
	}), [act.toString(), measureSrc().toString(), n]);
}
const framesNow = (f, n) => f.evaluate(([mSrc, n]) => new Promise((res) => { const m = (0, eval)(mSrc), o = []; const tick = () => { o.push(m()); if (o.length < n) requestAnimationFrame(tick); else res(o); }; requestAnimationFrame(tick); }), [measureSrc().toString(), n]);

const talkBtn = () => { document.querySelector('#pm-o55-onboarding .o55-talkslot button').click(); };
const soundBtn = () => { document.querySelector('#pm-o55-onboarding .o55-soundslot button').click(); };
const lookBtn = () => { document.querySelector('#pm-o55-onboarding .o55-lookslot .o55-lookbtn, #pm-o55-onboarding .o55-lookslot button').click(); };
const card = (title) => new Function(`[...document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]')].find((c) => (c.querySelector('.o55-cardtitle') || c).textContent.trim() === ${JSON.stringify(title)}).click();`);

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((fam) => [`${fam}-light`, `${fam}-dark`]);
const sign = (v) => (v >= 0 ? '+' : '') + v;

// one pass over the ten looks for one strip: its changes, then the window's size
async function pass(t, f, kind, steps, sizes, out) {
	const measure = measureSrc();
	await f.evaluate((k) => { window.__chipKind = k; }, kind);
	for (const look of LOOKS) {
		// the wizard's own look switch (the kit's look helper changes the app's theme, which the open wizard holds)
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		const applied = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || ''; const nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
		if (!applied) { out.bad.push(`${kind} ${look}: the look did not apply (${await f.evaluate(() => document.documentElement.getAttribute('data-theme'))})`); continue; }
		await f.waitForTimeout(2000);
		const rest = await f.evaluate(measure);
		if (!rest.ok) { out.bad.push(`${kind} ${look}: ${rest.why}`); continue; }
		if (!rest.lens) { out.noChip.push(`${kind}:${look}`); continue; }
		out.withChip.push(`${kind}:${look}`);
		if (!rest.covers) out.bad.push(`${kind} ${look} at rest: the chip does not cover "${rest.pos.name}"`);
		const judge = (name, before, frames, end) => {
			const last = frames[frames.length - 1];
			const mx = Math.round((last.pos.x - before.pos.x) * 10) / 10, my = Math.round((last.pos.y - before.pos.y) * 10) / 10;
			const off = (m) => !m.lens || Math.abs(m.dx - rest.dx) > 1.5 || Math.abs(m.dy - rest.dy) > 1.5;
			const late = frames.filter(off).length;
			const endOff = end.lens ? `${sign(Math.round((end.dx - rest.dx) * 10) / 10)}, ${sign(Math.round((end.dy - rest.dy) * 10) / 10)} px` : 'gone';
			out.rows.push(`${kind} ${look} ${name}: strip moved ${sign(mx)}, ${sign(my)} px; late frames ${late}/${FRAMES}; chip at the end ${endOff}${end.under ? ' (under-layer)' : ''}`);
			if (late || off(end)) out.bad.push(`${kind} ${look} ${name}: strip moved ${mx}, ${my} px; ${late} late frame(s); chip ends ${endOff} off`);
		};
		for (const [name, act] of steps) {
			const r = await framesAfter(f, act, FRAMES);
			await f.waitForTimeout(700);
			judge(name, r.before, r.out, await f.evaluate(measure));
		}
		// the window's size: the strip re-centres; read the frames from the resize on
		for (const [w, h] of sizes) {
			const before = await f.evaluate(measure);
			await t.viewport(w, h);
			const frames = await framesNow(f, FRAMES);
			await f.waitForTimeout(700);
			judge(`window ${w}x${h}`, before, frames, await f.evaluate(measure));
		}
	}
}

export default async function (t) {
	await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	const f = t.page;
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });   // --set motion=reduce: under Reduce Motion
	const go = (ids) => f.evaluate((pick) => {
		const defs = window.O55.screens.defs;
		for (const id of pick) { if (!defs[id]) continue; try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { continue; } if (window.O55.S.sess.screen === id) return id; }
		return window.O55.S.sess.screen;
	}, ids);
	await f.evaluate(() => { if (!window.O55.talk.eli5()) window.O55.talk.set('ELI5', 'test'); });
	const out = { withChip: [], noChip: [], bad: [], rows: [] };

	// RV-7: the rail, the Computer chapter current (Welcome done before it, three chapters after)
	const rail = await go(['c-route'].concat(await f.evaluate(() => Object.keys(window.O55.screens.defs).filter((id) => window.O55.screens.defs[id].chapter === 'computer'))));
	await f.waitForTimeout(1200);
	t.log(`rail: screen ${rail}`);
	await pass(t, f, 'rail', [
		['Expert', talkBtn], ['Plain English', talkBtn],
		['sound off', soundBtn], ['sound on', soundBtn],
		['look menu open', lookBtn], ['look menu closed', lookBtn]
	], [[1500, 1000], [1920, 1080]], out);

	// M6: the SSH tabs, once the scan has listed the devices
	const nas = await go(['nas-find']);
	await t.check('M6: the SSH tabs screen opens (nas-find)', nas === 'nas-find', `screen ${nas}`, { hard: true });
	await f.waitForFunction(() => document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]').length >= 2, null, { timeout: 15000 });
	await f.waitForTimeout(1200);
	// the scan's arrival re-centres the content too: SMB, then SSH again, and the chip must end on SSH once the list is back
	await f.evaluate(() => { window.__chipKind = 'seg'; });
	const tab = (v) => f.evaluate((a) => document.querySelector(`#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg button[data-arg="${a}"]`).click(), v);
	await tab('smb'); await f.waitForTimeout(1200); await tab('ssh');
	const scanBefore = await f.evaluate(measureSrc());
	await f.waitForFunction(() => document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]').length >= 2, null, { timeout: 15000 });
	await f.waitForTimeout(900);
	const scanAfter = await f.evaluate(measureSrc());
	t.log(`seg scan: tabs moved ${scanAfter.pos.y - scanBefore.pos.y} px as the list came back; chip at ${scanAfter.lens ? scanAfter.dx + ', ' + scanAfter.dy : 'gone'} px from SSH`);
	await t.check('M6: after a scan lists the devices, the chip is on the SSH tab', scanAfter.lens && Math.abs(scanAfter.dy) <= 1.5 && Math.abs(scanAfter.dx) <= 1.5 && scanAfter.pos.name === 'SSH', JSON.stringify(scanAfter));
	await pass(t, f, 'seg', [
		['Media server chosen', card('Media server')], ['Home NAS chosen', card('Home NAS')]
	], [[1920, 900], [1920, 1080]], out);

	out.rows.forEach((r) => t.log(r));
	t.log(`with a chip: ${out.withChip.join(' ') || 'none'}; without: ${out.noChip.join(' ') || 'none'}`);
	await t.check('the chips are drawn in Basic and Glass (the filmed looks)', ['rail:basic-light', 'rail:glass-dark', 'seg:basic-light', 'seg:glass-dark'].every((l) => out.withChip.includes(l)), `with: ${out.withChip.join(' ')}`);
	await t.check(`each chip moves with its strip in the same frame (${out.withChip.length} look passes; rail: Expert, Plain English, sound, look menu, window; SSH tabs: device cards, window)`, out.bad.length === 0, out.bad.slice(0, 10).join('; ') + (out.bad.length > 10 ? ` (+${out.bad.length - 10} more)` : ''));
	await f.evaluate(() => { if (!window.O55.talk.eli5()) window.O55.talk.set('ELI5', 'test'); });
}
