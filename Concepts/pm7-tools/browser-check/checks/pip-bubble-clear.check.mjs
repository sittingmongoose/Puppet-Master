// FO-59 (Astra's welcome review, new finding 2): Pip's speech bubble keeps off Pip, its control bar included. The bubble
// is placed clear of Pip's face and of the props (58-rig.js placeBubble); where a prop beside Pip took its usual place,
// the fallback could go up over the control bar Pip hangs from (Retro Dark's Look, 'Soft and cosy. I like it.'; Computer
// after a Server hover). The bar is now one of the bubble's obstacles.
// Astra's route, in each of the ten looks at 1920x1080: Look; Computer (Where), then a Server card hovered, then pressed,
// then This computer; Name with a name typed; Review. In each state every frame for about a second is read at its end
// (a ResizeObserver, after the frame's callbacks, the last thing before paint): the shown bubble (opacity over 0.05, with
// words; NieR's dialogue box at the stage's foot is not placed by the stage and is left out) must overlap neither Pip's
// head nor its control bar as painted (2 px tolerance). `--set looks=a,b`; `--set sandbox=1` for T3's sandbox;
// `--set motion=reduce`; `--set size=740x900` (headless). Headless or `--record`. About 3 minutes.
// FO-34 R1 (Sol's stage review, residual): on a direct screen jump the stage is held for a frame or more while the new
// screen comes in, and the new line was written into the bubble then: the bubble grew to the line's size at its old
// place and was painted there (Basic Dark at 740x768, Begin to Away: over the page) until the stage was let go. Case
// 'jumps' (Sol's route): a Name with 'Book club', Basic Dark, 740x768, then safe, begin, away, where, welcome and name
// at 900 ms, three times, and once in each of the ten looks; a key wakes Pip before each run (it sleeps from Welcome). In every frame, read at its end, a shown bubble must be
// painted at a placement made for its present size (placeBubble is wrapped on the stage to note the size it placed),
// and must overlap no prop at rest. QA-4 trade: entering props may pass behind a settled bubble (lead ruling 18:40Z):
// a prop coming in (or leaving) may be covered only while the bubble does not move at all (its placement against the
// speech point, read per frame) and only until it rests (or is gone); during any entry the bubble must not move,
// covered or not, which is what bites the old dodge-then-settle. Headless (the window's size changes).
// `--set only=bar|jumps`.
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const FRAMES = 60;

function installSampler() {
	if (window.__pbc) return;
	const S = window.__pbc = { on: false, left: 0, frames: [] };
	const d = document.createElement('div');
	d.setAttribute('aria-hidden', 'true');
	d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;contain:strict';
	document.body.appendChild(d);
	let w = 1;
	const tick = () => { if (S.on) { w = w === 1 ? 2 : 1; d.style.width = w + 'px'; } requestAnimationFrame(tick); };
	requestAnimationFrame(tick);
	const box = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
	S.wrap = () => {
		const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
		if (!st || st.__wrapped) return;
		const place = st.placeBubble;
		st.placeBubble = function (H, ang) { const r = place.call(this, H, ang); this.__placedFor = [this.bubble.offsetWidth, this.bubble.offsetHeight]; try { const s2 = this.toScreen(this.headXf(this.layoutName === 'portrait' ? [44, 30] : [58, 44], H, ang, 1, 1)), m = /^(-?[\d.]+)px (-?[\d.]+)px$/.exec(this.bubble.style.translate || ''); this.__relAtPlace = m ? [Math.round((+m[1] - s2[0]) * 100) / 100, Math.round((+m[2] - s2[1]) * 100) / 100] : null; } catch (e) { this.__relAtPlace = null; } return r; };
		st.__wrapped = true;
	};
	S.wrap();
	new ResizeObserver(() => {
		if (!S.on) return;
		S.wrap();
		const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage;
		const fr = { t: Math.round(performance.now()) };
		if (st && !st.dead && st.gHead && st.gHead.isConnected) {
			const b = st.bubble, cs = getComputedStyle(b);
			fr.nier = st.famName === 'nier' ? 1 : 0;
			fr.shown = +cs.opacity > 0.05 && cs.visibility !== 'hidden' && /\S/.test(b.textContent || '') ? 1 : 0;
			fr.text = (b.textContent || '').trim().slice(0, 40);
			fr.b = box(b); fr.h = box(st.gHead); fr.c = st.gCtl ? box(st.gCtl) : null;
			// QA-4 trade: the placement itself, as the wrapper read it at the moment it was made (style.translate against
			// the speech point of that same pose), so a bubble that follows Pip's sway reads still and only a change of
			// place counts as moving; its screen place too, for a bubble pinned against an obstacle while Pip sways
			fr.rel = st.__relAtPlace || null;
			{ const m = /^(-?[\d.]+)px (-?[\d.]+)px$/.exec(b.style.translate || ''); fr.tr = m ? [Math.round(+m[1] * 100) / 100, Math.round(+m[2] * 100) / 100] : null; }
			// FO-34 R1: the size the last placement was made for, against the size now laid out
			const pf = st.__placedFor; fr.size = [b.offsetWidth, b.offsetHeight]; fr.stale = pf && (pf[0] !== fr.size[0] || pf[1] !== fr.size[1]) ? 1 : 0;
			fr.screen = window.O55.S.sess.screen;
			fr.props = []; st.props.forEach((pr, id) => { if (!pr.el || !pr.el.isConnected) return; const o = +(pr.el.getAttribute('opacity') || 0); if (o > 0.05) fr.props.push({ id, kind: pr.spec && pr.spec.kind, out: pr.state === 'out' ? 1 : 0, settled: pr.settled ? 1 : 0, op: Math.round(o * 100) / 100, b: box(pr.el) }); });
		} else fr.none = 1;
		S.frames.push(fr);
		if (--S.left <= 0) { S.on = false; const done = S.done; S.done = null; if (done) done(S.frames); }
	}).observe(d);
}
const stop = (f) => f.evaluate(() => { const S = window.__pbc; S.on = false; S.done = null; const fr = S.frames; S.frames = []; return fr; });
const arm = (f, n) => f.evaluate((k) => { const S = window.__pbc; S.frames = []; S.left = k; S.on = true; S.p = new Promise((res) => { S.done = res; }); }, n);
const collect = (f) => f.evaluate(() => window.__pbc.p);
const hit = (a, b, g = 2) => !!(a && b) && a[0] + g < b[2] && b[0] + g < a[2] && a[1] + g < b[3] && b[1] + g < a[3];

export default async function (t) {
	// --set size=740x900: the narrow strip or the short one (headless: a recording keeps 1920x1080)
	const size = /^(\d+)x(\d+)$/.exec(String(t.args.size || ''));
	if (size) await t.viewport(+size[1], +size[2]);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.gHead); }, null, { timeout: 60000 });
	await t.emulate({ reducedMotion: t.args.motion === 'reduce' ? 'reduce' : 'no-preference' });
	await f.evaluate(installSampler);
	t.log(`window ${await t.page.evaluate(() => innerWidth + 'x' + innerHeight)}, stage layout ${await f.evaluate(() => document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.layoutName)}`);
	const quiet = () => f.waitForFunction(() => !window.O55.S.vt && !(window.O55.nierLook && window.O55.nierLook.busy && window.O55.nierLook.busy()) && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy()), null, { timeout: 30000 }).catch(() => {});
	const go = async (id) => { await f.evaluate((sid) => window.O55.ui.go(sid, { noHistory: true }), id); await quiet(); await f.waitForTimeout(500); return f.evaluate(() => window.O55.S.sess.screen); };
	const bad = [], rows = [];
	let states = 0, shownFrames = 0;
	const watch = async (label, act) => {
		await arm(f, FRAMES);
		t.mark(label);
		if (act) await act();
		const fr = (await collect(f)).filter((x) => !x.none);
		states++;
		const over = fr.filter((x) => x.shown && !x.nier && (hit(x.b, x.h) || hit(x.b, x.c)));
		shownFrames += fr.filter((x) => x.shown && !x.nier).length;
		rows.push(`${label}: ${fr.length} frames, bubble shown in ${fr.filter((x) => x.shown).length}${over.length ? `; over Pip in ${over.length} ('${over[0].text}' bubble ${over[0].b} head ${over[0].h} bar ${over[0].c})` : ''}`);
		if (over.length) bad.push(`${label}: ${over.length} frame(s), '${over[0].text}' ${hit(over[0].b, over[0].c) ? 'over the control bar' : 'over the head'}`);
	};
	const only = String(t.args.only || '');
	for (const look of (only === 'jumps' ? [] : t.args.looks ? String(t.args.looks).split(',') : LOOKS)) {
		const [fam, mode] = look.split('-');
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		await quiet(); await f.waitForTimeout(900);
		for (const screen of ['look', 'where', 'name', 'review']) {
			const at = await go(screen);
			if (at !== screen) { rows.push(`${look} ${screen}: not opened (${at})`); continue; }
			await watch(`${look} ${screen} idle`);
			if (screen === 'where') {
				const card = f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="pick"][data-arg="server"]');
				await watch(`${look} hover Server`, async () => { await card.hover(); });
				await watch(`${look} hover Server, settled`);
				await watch(`${look} press Server`, async () => { await card.click(); });
				await watch(`${look} press Server, settled`);
				await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) [data-o55-do="pick"][data-arg="this"]').click();
				await f.waitForTimeout(600);
			}
			if (screen === 'name') await watch(`${look} name typed`, async () => { await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) input').first().fill('Orchard'); });
		}
	}
	rows.forEach((r) => t.log(r));
	if (only !== 'jumps') await t.check(`FO-59: the bubble overlaps neither Pip's head nor its control bar in any frame (${states} states, ${shownFrames} frames with the bubble shown)`, states > 0 && shownFrames > 0 && bad.length === 0, bad.slice(0, 8).join('; ') + (bad.length > 8 ? ` (+${bad.length - 8} more)` : ''));
	if (only === 'bar') return;

	// FO-34 R1: Sol's direct jumps at 740x768. Basic Dark three times, then each other look once (`--set looks=` for others)
	const ROUTE = ['safe', 'begin', 'away', 'where', 'welcome', 'name'], gapMs = t.args.motion === 'reduce' ? 250 : 900;
	const jl = t.args.looks ? String(t.args.looks).split(',') : ['basic-dark', 'basic-dark', 'basic-dark'].concat(LOOKS.filter((l) => l !== 'basic-dark'));
	const stale = [], overRest = [], movedCover = [], jrows = [];
	let jFrames = 0, jShown = 0, reached = 0;
	await go('name');
	await f.locator('#o55f-name').fill('Book club');
	let n = 0;
	for (const look of jl) {
		const [fam, mode] = look.split('-');
		await t.viewport(1920, 1080);
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, mode]);
		await quiet(); await f.waitForTimeout(750);
		await t.viewport(740, 768); await f.waitForTimeout(700);
		await f.evaluate(() => window.O55.ui.go('name', { noHistory: true })); await f.waitForTimeout(900);
		/* Pip sleeps from Welcome (the route's fifth screen) until a real arrival: a key wakes it, so every run talks */
		await f.locator('#pm-o55-onboarding .o55-layer:not(.o55-out) #o55f-name').press('Shift');
		await f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.sleepZ, null, { timeout: 5000 }).catch(() => {});
		await f.waitForTimeout(1200);
		const tag = `${look} 740x768 jumps ${++n}${await f.evaluate(() => document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage.sleepZ) ? ' (Pip asleep)' : ''}`;
		t.mark(tag);
		await arm(f, 1e6);
		const seen = new Set();
		for (const sid of ROUTE) { await f.evaluate((s) => window.O55.ui.go(s, { noHistory: true }), sid); await f.waitForTimeout(gapMs); }
		const fr = (await stop(f)).filter((x) => !x.none);
		fr.forEach((x) => seen.add(x.screen));
		if (ROUTE.every((s) => seen.has(s))) reached++;
		const sh = fr.filter((x) => x.shown && !x.nier);
		jFrames += fr.length; jShown += sh.length;
		const st0 = sh.filter((x) => x.stale), r0 = sh.filter((x) => x.props.some((p) => !p.out && p.settled && hit(x.b, p.b)));
		const say = (x, sel) => { const p = x.props.find((q) => sel(q) && hit(x.b, q.b)); return `${x.screen} '${x.text}' bubble ${x.b} size ${x.size}${p ? ` over ${p.out ? 'leaving ' : ''}${p.kind} ${p.b} (opacity ${p.op})` : ''}`; };
		if (st0.length) stale.push(`${tag}: ${st0.length} frame(s), first ${say(st0[0], () => true)}`);
		if (r0.length) overRest.push(`${tag}: ${r0.length} frame(s), first ${say(r0[0], (p) => !p.out && p.settled)}`);
		// QA-4 trade: per prop and line, an entry (first shown to first at rest) with the bubble still, and a leaving
		// prop covered only while the bubble is still; still = its placement against the speech point within 0.5 px
		let entries = 0, covered = 0;
		const byProp = new Map();
		sh.forEach((x, xi) => x.props.forEach((p) => { const k = `${p.id}|${x.screen}|${x.text}`; if (!byProp.has(k)) byProp.set(k, []); byProp.get(k).push({ x, xi, p }); }));
		// still in whichever frame each axis of its place is anchored to: against the speech point when it follows
		// Pip, on the screen when an obstacle or the stage edge pins that axis (Retro's cramped banner pins one
		// axis to a prop's edge while the other still follows Pip)
		const relSpan = (rows) => { const rs = rows.map(({ x }) => x.rel).filter(Boolean), ts = rows.map(({ x }) => x.tr).filter(Boolean); if (!rs.length || !ts.length) return 0; const sp = (vs, i) => Math.max(...vs.map((r) => r[i])) - Math.min(...vs.map((r) => r[i])); return Math.max(Math.min(sp(rs, 0), sp(ts, 0)), Math.min(sp(rs, 1), sp(ts, 1))); };
		for (const rows of byProp.values()) {
			const segs = []; let cur = [rows[0]];
			for (let i = 1; i < rows.length; i++) { if (rows[i].xi === rows[i - 1].xi + 1 && rows[i].p.out === rows[i - 1].p.out) cur.push(rows[i]); else { segs.push(cur); cur = [rows[i]]; } }
			segs.push(cur);
			for (const seg of segs) {
				if (seg[0].p.out) {
					const cov = seg.filter(({ x, p }) => hit(x.b, p.b));
					covered += cov.length;
					if (cov.length && relSpan(seg) > 0.5) movedCover.push(`${tag}: bubble moved ${relSpan(seg).toFixed(1)} px while leaving ${seg[0].p.kind} passed behind it on ${seg[0].x.screen} (${cov.length} covered frame(s))`);
				} else {
					const si = seg.findIndex(({ p }) => p.settled), entry = si < 0 ? seg : seg.slice(0, si + 1);
					if (entry.length < 2) continue;
					entries++;
					covered += entry.filter(({ x, p }) => !p.settled && hit(x.b, p.b)).length;
					if (relSpan(entry) > 0.5) movedCover.push(`${tag}: bubble moved ${relSpan(entry).toFixed(1)} px during ${seg[0].p.kind}'s entry on ${seg[0].x.screen} (${entry.length} frames)`);
				}
			}
		}
		jrows.push(`${tag}: ${fr.length} frames, ${sh.length} with the bubble shown, screens ${[...seen].join(' ')}; painted before its placement in ${st0.length}, over a resting prop in ${r0.length}, props passing behind it while it stood still in ${covered} frame(s) of ${entries} entries`);
	}
	await t.viewport(size ? +size[1] : 1920, size ? +size[2] : 1080);
	jrows.forEach((r) => t.log(r));
	await t.check(`FO-34 R1: on direct jumps at 740x768 a grown bubble is placed before it is painted (${jl.length} runs, ${jFrames} frames, ${jShown} with the bubble shown)`, reached === jl.length && jShown > 0 && stale.length === 0, (reached < jl.length ? `the route reached all six screens in ${reached} of ${jl.length} runs; ` : '') + stale.slice(0, 6).join('; '));
	await t.check(`FO-34 R1 + QA-4 trade: on those jumps the bubble covers no resting prop, and does not move during any entry (a prop coming in or leaving may pass behind it only while it stands still, and only until it rests or is gone)`, overRest.length === 0 && movedCover.length === 0, overRest.concat(movedCover).slice(0, 6).join('; '));
}
