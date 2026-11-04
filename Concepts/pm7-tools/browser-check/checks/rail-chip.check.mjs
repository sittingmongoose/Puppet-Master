// RV-7 and M6: a chip (Glass's switcher lens, drawn in the wizard window's own lens layer in every look that adopts the
// switcher, or inside its strip in the looks whose chip is an under-layer) must move with its strip in the same frame
// when the strip's neighbours move it without resizing it.
// - The step rail sits centred between the window's brand and its header controls: Plain English <-> Expert, the sound
//   button, the look menu and the window's width move it (RV-7), with the Computer chapter current, as in the films.
// - The SSH / SMB / NFS tabs on "Which device has the files?" (nas-find) sit in content centred in the pane: choosing a
//   device card adds or swaps the note under it, the content's height changes and it re-centres, moving the tabs (M6);
//   the window's height does it too. The scan's own arrival is checked where the chip ends.
// - p77: when the next screen comes in, the old screen's tab chip leaves with it, in the same frame.
// In all ten looks, with motion on (--set motion=reduce for Reduce Motion), each change is made inside a frame and the
// next frames are read: the chip's centre against its item's box (the rail's current bead and label, the chosen tab), as
// an offset from where it sat before the change. A frame where it is more than 1.5 px off is a late frame; there must be
// none, and it must end where it started on the item. The wizard has no language switch besides Plain English and Expert.
// --set selftest=throw (a rail step that throws inside its frame callback) and --set selftest=jump (p77's Continue replaced
// by a jump past nas-identity) break the case on purpose: the check must fail, the first in that frame; --set
// selftest=cached (the scan case meets a cached list) must fail too.
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

// do `act` inside a frame, then read the chip in each of the next frames (each read shows what the frame before painted).
// Every frame callback here answers its promise either way: one that throws (a missing strip, an act that fails) rejects
// at once with the error, so the case fails with it in that frame instead of waiting on a promise nothing will answer
// (browser-check 2.0.6 gives up on such a wait only 15 s later)
async function framesAfter(f, act, n) {
	return f.evaluate(([actSrc, mSrc, n]) => new Promise((res, rej) => {
		const measure = (0, eval)('(' + mSrc + ')'), act = (0, eval)('(' + actSrc + ')');
		const out = [];
		requestAnimationFrame(() => {
			try {
				const before = measure();
				act();
				const tick = () => { try { out.push(measure()); if (out.length < n) requestAnimationFrame(tick); else res({ before, out }); } catch (e) { rej(e); } };
				requestAnimationFrame(tick);
			} catch (e) { rej(e); }
		});
	}), [act.toString(), measureSrc().toString(), n]);
}
const framesNow = (f, n) => f.evaluate(([mSrc, n]) => new Promise((res, rej) => { const m = (0, eval)(mSrc), o = []; const tick = () => { try { o.push(m()); if (o.length < n) requestAnimationFrame(tick); else res(o); } catch (e) { rej(e); } }; requestAnimationFrame(tick); }), [measureSrc().toString(), n]);

const talkBtn = () => { document.querySelector('#pm-o55-onboarding .o55-talkslot button').click(); };
const soundBtn = () => { document.querySelector('#pm-o55-onboarding .o55-soundslot button').click(); };
const lookBtn = () => { document.querySelector('#pm-o55-onboarding .o55-lookslot .o55-lookbtn, #pm-o55-onboarding .o55-lookslot button').click(); };
const card = (title) => new Function(`[...document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]')].find((c) => (c.querySelector('.o55-cardtitle') || c).textContent.trim() === ${JSON.stringify(title)}).click();`);

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((fam) => [`${fam}-light`, `${fam}-dark`]);
const sign = (v) => (v >= 0 ? '+' : '') + v;

// the wizard's own look switch (the kit's look helper changes the app's theme, which the open wizard holds)
async function lookOn(f, look) {
	const [fam, mode] = look.split('-');
	await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
	const ok = await f.waitForFunction(([fm, m]) => { const th = document.documentElement.getAttribute('data-theme') || ''; const nier = document.documentElement.getAttribute('data-o55-nier') === 'on'; return (fm === 'nier' ? nier : !nier && th.startsWith(fm + '-')) && th.endsWith('-' + m); }, [fam, mode], { timeout: 20000 }).then(() => true, () => false);
	return ok ? null : `the look did not apply (${await f.evaluate(() => document.documentElement.getAttribute('data-theme'))})`;
}

// one pass over the ten looks for one strip: its changes, then the window's size
async function pass(t, f, kind, steps, sizes, out) {
	const measure = measureSrc();
	await f.evaluate((k) => { window.__chipKind = k; }, kind);
	for (const look of LOOKS) {
		const why = await lookOn(f, look);
		if (why) { out.bad.push(`${kind} ${look}: ${why}`); continue; }
		await f.waitForTimeout(2000);
		const rest = await f.evaluate(measure);
		if (!rest.ok) { out.bad.push(`${kind} ${look}: ${rest.why}`); continue; }
		if (!rest.lens) { out.noChip.push(`${kind}:${look}`); continue; }
		out.withChip.push(`${kind}:${look}`);
		if (!rest.covers) out.bad.push(`${kind} ${look} at rest: the chip does not cover "${rest.pos.name}"`);
		// strict: late frames fail, the window's size rows of both strips too. The SSH tabs' window-height rows were only
		// reported (1-2 late frames since 61b70dca1f) until SW-25: 60-ui-core's holdColumn re-centred the held column on a
		// resize inside an unchanged scroller, which glass.js's size watch never saw (fo-welcome b49b1402a4); they are strict
		// now, and fail on a page without that fix
		const judge = (name, before, frames, end, strict = true) => {
			const last = frames[frames.length - 1];
			const mx = Math.round((last.pos.x - before.pos.x) * 10) / 10, my = Math.round((last.pos.y - before.pos.y) * 10) / 10;
			const off = (m) => !m.lens || Math.abs(m.dx - rest.dx) > 1.5 || Math.abs(m.dy - rest.dy) > 1.5;
			const late = frames.filter(off).length;
			const endOff = end.lens ? `${sign(Math.round((end.dx - rest.dx) * 10) / 10)}, ${sign(Math.round((end.dy - rest.dy) * 10) / 10)} px` : 'gone';
			out.rows.push(`${kind} ${look} ${name}: strip moved ${sign(mx)}, ${sign(my)} px; late frames ${late}/${FRAMES}${strict ? '' : ' (reported)'}; chip at the end ${endOff}${end.under ? ' (under-layer)' : ''}`);
			if ((strict && late) || off(end)) out.bad.push(`${kind} ${look} ${name}: strip moved ${mx}, ${my} px; ${late} late frame(s); chip ends ${endOff} off`);
		};
		for (const [name, act] of steps) {
			const t0 = Date.now();
			const r = await framesAfter(f, act, FRAMES).catch((e) => { throw new Error(`${kind} ${look} ${name}: a frame callback threw, ${Date.now() - t0} ms after the change: ${String(e && e.message || e).split('\n')[0]}`); });
			await f.waitForTimeout(700);
			judge(name, r.before, r.out, await f.evaluate(measure));
		}
		// the window's size: the strip re-centres; read the frames from the resize on
		for (const [w, h] of sizes) {
			const before = await f.evaluate(measure);
			await t.viewport(w, h);
			const t0 = Date.now();
			const frames = await framesNow(f, FRAMES).catch((e) => { throw new Error(`${kind} ${look} window ${w}x${h}: a frame callback threw, ${Date.now() - t0} ms after the resize: ${String(e && e.message || e).split('\n')[0]}`); });
			await f.waitForTimeout(700);
			judge(`window ${w}x${h}`, before, frames, await f.evaluate(measure));
		}
	}
}

export default async function (t) {
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });   // the page, or T3's sandbox (--set sandbox=1)
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });   // --set motion=reduce: under Reduce Motion
	const go = (ids) => f.evaluate((pick) => {
		const defs = window.O55.screens.defs;
		for (const id of pick) { if (!defs[id]) continue; try { window.O55.ui.go(id, { noHistory: true }); } catch (e) { continue; } if (window.O55.S.sess.screen === id) return id; }
		return window.O55.S.sess.screen;
	}, ids);
	await f.evaluate(() => { if (!window.O55.talk.eli5()) window.O55.talk.set('ELI5', 'test'); });
	const out = { withChip: [], noChip: [], bad: [], rows: [] };

	const only = t.args.only;   // --set only=rail|seg|p77: that case alone
	if (!only || only === 'rail') {
	// RV-7: the rail, the Computer chapter current (Welcome done before it, three chapters after)
	const rail = await go(['c-route'].concat(await f.evaluate(() => Object.keys(window.O55.screens.defs).filter((id) => window.O55.screens.defs[id].chapter === 'computer'))));
	await f.waitForTimeout(1200);
	t.log(`rail: screen ${rail}`);
	// --set selftest=throw: a step that throws inside its frame callback; the case must fail with that error at once
	const selfThrow = ['selftest: a throw inside a frame callback', () => { throw new Error('rail-chip selftest: thrown inside a frame callback'); }];
	await pass(t, f, 'rail', [
		...(t.args.selftest === 'throw' ? [selfThrow] : []),
		['Expert', talkBtn], ['Plain English', talkBtn],
		['sound off', soundBtn], ['sound on', soundBtn],
		['look menu open', lookBtn], ['look menu closed', lookBtn]
	], [[1500, 1000], [1920, 1080]], out);
	}

	if (!only || only === 'seg') {
	// M6: the SSH tabs, once the scan has listed the devices
	const nas = await go(['nas-find']);
	await t.check('M6: the SSH tabs screen opens (nas-find)', nas === 'nas-find', `screen ${nas}`, { hard: true });
	await f.waitForFunction(() => document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]').length >= 2, null, { timeout: 15000 });
	await f.waitForTimeout(1200);
	await f.evaluate(() => { window.__chipKind = 'seg'; });
	const tab = (v) => f.evaluate((a) => document.querySelector(`#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg button[data-arg="${a}"]`).click(), v);
	const listed = () => f.waitForFunction(() => document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]').length >= 2, null, { timeout: 15000 });
	// SW-42: the scan case once went SMB, then SSH again, and met the cached list, so nothing arrived. Now the page's own
	// discovery is reset first (O55.flow.reset of 'discover:ssh', as on a first visit to the step), so going back to SSH
	// shows "Looking for devices" and then the list. In each look the frames from the tab press until 24 frames after the
	// list arrives are read: the scan must have run, and the chip must end on SSH. The tabs do not move as the list
	// arrives: the column's top is held from the moment the screen comes in (60-ui-core holdColumn, p76) and only a resize
	// centres it again, so a scan is not a re-centre and the chip has nothing to follow here (the device-card and window
	// rows test that). Movement and the frames off the tab are logged, not judged: they are rAF reads, and a one-frame
	// reading needs a film to confirm. --set selftest=cached keeps the cached list (the old case): it must fail.
	const scanBad = [], scanRows = [];
	for (const look of (t.args.looks ? t.args.looks.split(',') : LOOKS)) {
		const why = await lookOn(f, look); if (why) { scanBad.push(`${look}: ${why}`); continue; }
		await go(['nas-find']); await listed(); await f.waitForTimeout(1200);
		await tab('smb'); await f.waitForTimeout(1200); await tab('ssh'); await listed(); await f.waitForTimeout(900);
		const rest = await f.evaluate(measureSrc());
		await tab('smb'); await f.waitForTimeout(1200);
		if (t.args.selftest !== 'cached') await f.evaluate(() => window.O55.flow.reset(window.O55.S, 'discover:ssh'));
		const r = await f.evaluate(([mSrc]) => new Promise((res, rej) => {
			const m = (0, eval)('(' + mSrc + ')'), L = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) ', out = []; let arrived = -1, looked = false;
			requestAnimationFrame(() => { try {
				document.querySelector(L + '.o55-seg button[data-arg="ssh"]').click();
				const tick = () => { try {
					const cards = document.querySelectorAll(L + '.o55-card[data-o55-do="device"]').length, looking = !!document.querySelector(L + '[data-key="scan"]');
					looked = looked || looking; out.push(Object.assign(m(), { cards, looking }));
					if (arrived < 0 && looked && cards >= 2) arrived = out.length - 1;
					if ((arrived >= 0 && out.length >= arrived + 24) || out.length >= 360) res({ out, arrived, looked }); else requestAnimationFrame(tick);
				} catch (e) { rej(e); } };
				requestAnimationFrame(tick);
			} catch (e) { rej(e); } });
		}), [measureSrc().toString()]);
		if (!r.looked || r.arrived < 0) { scanBad.push(`${look}: no scan ran (the list was there at once: a cached scan proves nothing)`); scanRows.push(`${look}: cached`); continue; }
		const pre = r.out[Math.max(0, r.arrived - 1)], last = r.out[r.out.length - 1], moved = Math.round((last.pos.y - pre.pos.y) * 10) / 10;
		const judged = r.out.slice(Math.max(0, r.arrived - 2));
		const off = (x) => !x.lens || Math.abs(x.dx - rest.dx) > 1.5 || Math.abs(x.dy - rest.dy) > 1.5;
		const late = rest.lens ? judged.filter(off).length : 0;
		scanRows.push(`${look}: scan ran, list after ${r.arrived} frames; tabs moved ${sign(moved)} px as it arrived; ${rest.lens ? `frames off the tab ${late}/${judged.length} (logged); chip at the end ${last.lens ? sign(Math.round((last.dx - rest.dx) * 10) / 10) + ', ' + sign(Math.round((last.dy - rest.dy) * 10) / 10) + ' px' : 'gone'}` : 'no chip in this look'}`);
		if (rest.lens && off(last)) scanBad.push(`${look}: once the scan's list arrived the chip ended off the SSH tab (${last.lens ? last.dx + ', ' + last.dy : 'gone'})`);
	}
	scanRows.forEach((x) => t.log('seg scan ' + x));
	await t.check('M6/SW-42: a scan that really runs (not a cached list) ends with the chip on the SSH tab, in every look', scanBad.length === 0, scanBad.join('; '));
	await pass(t, f, 'seg', [
		['Media server chosen', card('Media server')], ['Home NAS chosen', card('Home NAS')]
	], [[1920, 900], [1920, 1080]], out);
	} else if (only === 'p77') {
		await go(['nas-find']);
		await f.waitForFunction(() => document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]').length >= 2, null, { timeout: 15000 });
		await f.evaluate(card('Home NAS'));
	}

	if (!only || only === 'p77') {
	// p77: the next screen starts inside a frame; in each of the next frames, a chip in the window's own lens layer that is
	// not on a strip of the screen now showing is the old screen's chip left over it (the film: the QNAP tab's chip over
	// "Set up truenas.local" for 10 frames). A chip inside its strip leaves with its screen and is not counted.
	const ghostRows = [], ghostBad = [];
	for (const look of (t.args.looks ? t.args.looks.split(',') : LOOKS)) {   // --set looks=glass-light,glass-dark: those alone
		const why = await lookOn(f, look);
		if (why) { ghostBad.push(`${look}: ${why}`); continue; }
		await go(['nas-find']);
		await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg button.o55-on'), null, { timeout: 15000 });
		// a look change undoes a pick not yet continued (the lead's rule 3), so the NAS is chosen again for each look: the
		// identity screen the case jumps to needs a chosen NAS
		await f.waitForFunction(() => document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-card[data-o55-do="device"]').length >= 2, null, { timeout: 15000 });
		await f.evaluate(card('Home NAS'));
		// a look change finishes with a reveal of its own that draws the screen again; the case starts once it is over
		await f.waitForFunction(() => !window.O55.S.vt && !document.querySelector('#pm-o55-onboarding .o55-layer.o55-out'), null, { timeout: 15000 });
		await f.waitForTimeout(1500);
		const r = await f.evaluate(([n, selftest]) => new Promise((res, rej) => {
			const ghosts = () => {
				const win = document.querySelector('#pm-o55-onboarding .o55-win'), hb = win.querySelector('.o55-head').getBoundingClientRect();
				const on = [...win.querySelectorAll('.o55-pane > .o55-layer:not(.o55-out) .o55-seg button.o55-on')].map((e) => e.getBoundingClientRect());
				return [...win.querySelectorAll('.lg-lens')].filter((e) => !e.closest('.lg-lenses-under')).map((e) => ({ b: e.getBoundingClientRect(), op: +getComputedStyle(e).opacity, e }))
					.filter((x) => x.op > 0.05 && x.b.width > 0 && x.b.top >= hb.bottom - 1 && !on.some((o) => Math.abs((o.left + o.right) / 2 - (x.b.left + x.b.right) / 2) < 3 && Math.abs((o.top + o.bottom) / 2 - (x.b.top + x.b.bottom) / 2) < 3))
					.map((x) => { const old = document.querySelector('#pm-o55-onboarding .o55-layer.o55-out .o55-seg button.o55-on'), ob = old && old.getBoundingClientRect(); (window.__p77 = window.__p77 || []).push(`${Math.round(x.b.left)},${Math.round(x.b.top)} ${Math.round(x.b.width)}x${Math.round(x.b.height)} op ${x.op.toFixed(2)}, ${x.e.getAnimations().length} animations, old tab ${ob ? Math.round(ob.left) + ',' + Math.round(ob.top) : 'gone'}, ${document.querySelectorAll('#pm-o55-onboarding .o55-pane > .o55-layer').length} layers`); return 1; }).length;
			};
			const before = ghosts(), frames = [];
			requestAnimationFrame(() => {
				const lens = !document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-seg .lg-lenses-under .lg-lens');
				// the next screen comes in as a person brings it in: Continue on the chosen NAS (a pick is only an answer once
				// continued, the lead's rule 3, so a bare jump would reach the identity screen with no NAS); a click that throws
				// ends the case with the error, rather than leaving this promise unanswered. --set selftest=jump jumps past the
				// identity screen to Name instead, which the guard below must fail
				try { if (selftest === 'jump') window.O55.ui.go('name'); else document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) .o55-foot .o55-primary').click(); } catch (e) { res({ before, frames, lens, screen: window.O55.S.sess.screen, error: String(e && e.message || e) }); return; }
				const tick = () => { try { frames.push(ghosts()); if (frames.length < n) requestAnimationFrame(tick); else res({ before, frames, lens, screen: window.O55.S.sess.screen, history: (window.O55.S.sess.history || []).slice(-3) }); } catch (e) { rej(e); } };
				requestAnimationFrame(tick);
			});
		}), [FRAMES, t.args.selftest || '']);
		if (r.error) { ghostBad.push(`${look}: the jump to nas-identity threw: ${r.error}`); continue; }
		// the frames above measure nas-find giving way to the identity screen, as the film did: a Continue that lands anywhere
		// else (a jump past nas-identity: a NAS already trusted, a Puppet Master NAS's pairing, a forced go) measured another
		// transition, and fails the case rather than passing it silently
		if (r.screen !== 'nas-identity') { ghostBad.push(`${look}: Continue from nas-find reached ${r.screen}, not nas-identity (history ${(r.history || []).join(' > ')}): a jump past the identity screen is not the transition this case measures`); continue; }
		const late = r.frames.filter((g) => g > 0).length;
		// and back: the tabs' screen comes in, and its chip, where one is shown, sits on the chosen tab as painted (with the
		// entrance's movement) in every frame
		await f.waitForTimeout(900);
		const back = await f.evaluate((n) => new Promise((res, rej) => {
			const off = () => {
				const win = document.querySelector('#pm-o55-onboarding .o55-win'), hb = win.querySelector('.o55-head').getBoundingClientRect();
				const on = win.querySelector('.o55-pane > .o55-layer:not(.o55-out) .o55-seg button.o55-on'); if (!on) return 'none';
				const o = on.getBoundingClientRect();
				const ls = [...win.querySelectorAll('.lg-lens')].map((e) => ({ b: e.getBoundingClientRect(), op: +getComputedStyle(e).opacity })).filter((x) => x.op > 0.05 && x.b.width > 0 && x.b.top >= hb.bottom - 1);
				if (!ls.length) return 'none';
				return Math.min(...ls.map((x) => Math.hypot((o.left + o.right) / 2 - (x.b.left + x.b.right) / 2, (o.top + o.bottom) / 2 - (x.b.top + x.b.bottom) / 2)));
			};
			const frames = [];
			requestAnimationFrame(() => { try { window.O55.ui.go('nas-find'); const tick = () => { try { frames.push(off()); if (frames.length < n) requestAnimationFrame(tick); else res(frames); } catch (e) { rej(e); } }; requestAnimationFrame(tick); } catch (e) { rej(e); } });
		}), FRAMES);
		const astray = back.filter((d) => d !== 'none' && d > 3).length, shown = back.filter((d) => d !== 'none').length;
		ghostRows.push(`${look}: to ${r.screen}; ${r.lens ? 'chip in the window layer' : 'chip inside its strip'}; frames with the old chip left: ${late}/${FRAMES}${late ? ' (' + r.frames.map((g) => (g ? 'x' : '.')).join('') + ')' : ''}; back: chip shown ${shown}/${FRAMES}, off its tab ${astray} (${back.map((d) => (d === 'none' ? '-' : d > 3 ? 'x' : '.')).join('')})`);
		if (r.before) ghostBad.push(`${look}: a stray chip before the change`);
		if (late) ghostBad.push(`${look}: the old screen's chip stayed ${late} frame(s)`);
		if (astray) ghostBad.push(`${look}: coming back, the chip was off its tab in ${astray} frame(s)`);
	}
	ghostRows.forEach((x) => t.log('p77 ' + x));
	const strays = await f.evaluate(() => (window.__p77 || []).slice(0, 12));
	if (strays.length) t.log(`p77 chips left (x,y w x h): ${strays.join(' | ')}`);
	await t.check('p77: a screen change leaves no chip of the old screen over the next one, in any look', ghostBad.length === 0, ghostBad.join('; '));
	}

	if (only === 'p77') return;
	const want = only === 'rail' ? ['rail:basic-light', 'rail:glass-dark'] : only === 'seg' ? ['seg:basic-light', 'seg:glass-dark'] : ['rail:basic-light', 'rail:glass-dark', 'seg:basic-light', 'seg:glass-dark'];
	out.rows.forEach((r) => t.log(r));
	t.log(`with a chip: ${out.withChip.join(' ') || 'none'}; without: ${out.noChip.join(' ') || 'none'}`);
	await t.check('the chips are drawn in Basic and Glass (the filmed looks)', want.every((l) => out.withChip.includes(l)), `with: ${out.withChip.join(' ')}`);
	await t.check(`each chip moves with its strip in the same frame (${out.withChip.length} look passes; rail: Expert, Plain English, sound, look menu, window; SSH tabs: device cards, window)`, out.bad.length === 0, out.bad.slice(0, 10).join('; ') + (out.bad.length > 10 ? ` (+${out.bad.length - 10} more)` : ''));
	await f.evaluate(() => { if (!window.O55.talk.eli5()) window.O55.talk.set('ELI5', 'test'); });
}
