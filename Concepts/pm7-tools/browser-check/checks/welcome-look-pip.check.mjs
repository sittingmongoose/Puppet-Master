// FO-40 and FO-44, Welcome after a look change: Pip and its greeting bubble are painted where the stage puts them.
// FO-40 (films K20-28 1725, K21-31, D1-cancel, PM-positive): after a look change the greeting Pip showed a tiny pose at
// the stage's upper-left for one or more frames. Cause: Retro Light's printer-head rule (30-art.css, `.pst-head`, a 50 ms
// transform transition) also matched Pip's own head group (<g class="pst-head">), so the head eased toward every pose it
// was given and, rebuilt for the new look, started from no transform at all (the identity: the kit's 64-unit head at the
// SVG's origin); and NieR's switch rebuilt the rig after that frame's draw, so it painted once unplaced.
// FO-44 (reader-e K21-23 E-01): the bubble overlapped the moving Pip's outline. The bubble is placed from Pip's pose in
// the same draw, but the head was painted elsewhere (FO-40's transition) and the bubble's pop scaled its own placement
// (its `scale` applied over the inline `transform: translate()`), so for its first frames it sat between the stage's
// corner and its place.
// The look is changed as a person does on Welcome: the window's look menu, its family and Light / Dark, by real clicks,
// into each of the ten looks (`--set reps=N` cycles N times; `--set looks=a,b`). After each click, every frame until the
// stage has settled is read at its end, after the frame's animation callbacks (a ResizeObserver, the last thing before
// paint), from painted geometry: getBoundingClientRect follows CSS transitions and animations, so a head easing from
// another pose, or a bubble scaled about another point, reads as painted. A frame fails when
//   - a rebuilt rig part (Pip's head or its control) carries no pose (no transform),
//   - Pip's head is not painted where its own pose puts it (more than 2 px off), or its box leaves the band of its
//     settled pose for that look, measured in the stage's own frame (the svg's box, which Retro's power-on and paper
//     feed move and scale): width off by more than 30 %, height by more than 40 % (a hop's squash, a tilt), or its
//     centre more than 0.6 of its width away (the tiny pose is under 40 % of its size, at the stage's corner),
//   - the bubble, shown, is not painted at its placement (its tail corner more than 2 px off), or overlaps Pip's head or
//     control as painted.
// Probes can read a state that was never painted: the films (`--record`) are the claim; this check is the regression
// gate on the causes. Both surfaces (`--set sandbox=1` for T3's sandbox); `--set motion=reduce` for Reduce Motion;
// `--set size=740x900` for another window size (headless: a recording keeps 1920x1080).
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const FRAMES = 96;        // about 1.6 s at 60 fps: the cover or reveal, the rebuild and the bubble's pop
const NIER_FRAMES = 300;  // NieR's moment plays its plate first

function installSampler() {
	if (window.__wlp) return;
	const S = window.__wlp = { on: false, left: 0, frames: [], done: null };
	const d = document.createElement('div');
	d.setAttribute('aria-hidden', 'true');
	d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;contain:strict';
	document.body.appendChild(d);
	let w = 1;
	const tick = () => { if (S.on) { w = w === 1 ? 2 : 1; d.style.width = w + 'px'; } requestAnimationFrame(tick); };
	requestAnimationFrame(tick);
	const r1 = (v) => Math.round(v * 10) / 10;
	const box = (b) => [r1(b.left), r1(b.top), r1(b.right), r1(b.bottom)];
	// the box a node's own pose (its transform attribute) puts its content at, on screen
	const poseBox = (g) => {
		const list = g.transform && g.transform.baseVal, m0 = list && list.numberOfItems ? list.consolidate().matrix : null;
		const P = g.parentNode && g.parentNode.getScreenCTM ? g.parentNode.getScreenCTM() : null;
		if (!m0 || !P) return null;
		const m = P.multiply(m0), b = g.getBBox();
		const pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
		return [r1(Math.min(...pts.map((p) => p[0]))), r1(Math.min(...pts.map((p) => p[1]))), r1(Math.max(...pts.map((p) => p[0]))), r1(Math.max(...pts.map((p) => p[1])))];
	};
	new ResizeObserver(() => {
		if (!S.on) return;
		const host = document.querySelector('#pm-o55-onboarding .o55-stage'), st = host && host.__pipStage;
		const fr = { t: Math.round(performance.now()) };
		if (st && !st.dead && st.gHead && st.gHead.isConnected) {
			const hd = st.gHead, ctl = st.gCtl, b = st.bubble, svg = st.svg.getBoundingClientRect();
			fr.svg = box(svg);
			fr.hx = hd.hasAttribute('transform') ? 1 : 0; fr.cx = ctl && ctl.hasAttribute('transform') ? 1 : 0;
			fr.hp = box(hd.getBoundingClientRect()); fr.hq = poseBox(hd);
			fr.cp = ctl ? box(ctl.getBoundingClientRect()) : null;
			fr.gp = st.gPip && st.gPip.style.transform ? 1 : 0;   // Pip trying on a look (its flip): its own scale
			if (b && b.isConnected) {
				const cs = getComputedStyle(b), alpha = +cs.opacity, txt = (b.textContent || '').trim();
				fr.bo = r1(alpha); fr.bt = txt ? 1 : 0; fr.bp = box(b.getBoundingClientRect());
				// the place the stage gave it: its offset in the overlay plus its placement, at its laid-out size, in the overlay's
				// painted scale (Retro Dark's tube powers on from a line: the whole picture, bubble and all, is scaled)
				const op = b.offsetParent, ov = op ? op.getBoundingClientRect() : null;
				const tr = /translate\(\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(b.style.translate ? `translate(${b.style.translate.split(' ').map((v) => v.endsWith('px') ? v : v + 'px').join(', ')})` : b.style.transform || '');
				if (ov && tr) {
					const kx = op.offsetWidth ? ov.width / op.offsetWidth : 1, ky = op.offsetHeight ? ov.height / op.offsetHeight : 1;
					const x0 = b.offsetLeft + +tr[1], y0 = b.offsetTop + +tr[2];
					fr.bq = [r1(ov.left + x0 * kx), r1(ov.top + y0 * ky), r1(ov.left + (x0 + b.offsetWidth) * kx), r1(ov.top + (y0 + b.offsetHeight) * ky)];
				}
				fr.nier = st.famName === 'nier' ? 1 : 0;
			}
			fr.th = st.theme;
		} else fr.none = 1;
		fr.cov = typeof window.PM_LOOK_COVERED === 'function' && window.PM_LOOK_COVERED() ? 1 : 0;
		fr.vt = window.O55 && window.O55.S && window.O55.S.vt ? 1 : 0;
		S.frames.push(fr);
		if (--S.left <= 0) { S.on = false; const done = S.done; S.done = null; if (done) done(S.frames); }
	}).observe(d);
}

// the frames a change makes: armed now, collected until `n` frames have ended
const arm = (f, n) => f.evaluate((k) => { const S = window.__wlp; S.frames = []; S.left = k; S.on = true; S.p = new Promise((res) => { S.done = res; }); }, n);
const collect = (f) => f.evaluate(() => window.__wlp.p);

// judge one change's frames: { bad: the first reasons, kinds: frame indexes by kind, n: frames read, calib: settled fit }
function judge(frames) {
	const live = frames.filter((x) => !x.none);
	const out = { bad: [], kinds: {}, why: {}, n: live.length };
	if (live.length < 12) { out.kinds['no-stage'] = [0]; out.why['no-stage'] = `the stage was on the page in ${live.length} frames`; return out; }
	const med = (a) => { const s = a.slice().sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
	// the settled pose of each look the stage shows: the old look's from the frames before the change reaches it, the new
	// one's from the last frames (Pip's head differs by look: NieR's is another drawing)
	// in the stage's own frame (the svg's box: Retro Dark's tube powers on from a line, Retro Light's paper feeds in, and
	// the whole picture moves with them), as fractions of its width and height
	const norm = (x) => { const sw = (x.svg[2] - x.svg[0]) || 1, sh = (x.svg[3] - x.svg[1]) || 1; return { w: (x.hp[2] - x.hp[0]) / sw, h: (x.hp[3] - x.hp[1]) / sh, cx: ((x.hp[0] + x.hp[2]) / 2 - x.svg[0]) / sw, cy: ((x.hp[1] + x.hp[3]) / 2 - x.svg[1]) / sh }; };
	const settled = (xs) => { const n = xs.map(norm); return { W: med(n.map((v) => v.w)), H: med(n.map((v) => v.h)), CX: med(n.map((v) => v.cx)), CY: med(n.map((v) => v.cy)) }; };
	const first = live[0].th, last = live[live.length - 1].th;
	const pose = { [last]: settled(live.slice(-12)) };
	if (first !== last) pose[first] = settled(live.slice(0, 4).filter((x) => x.th === first));
	const hit = (a, b, g = 2) => a && b && a[0] + g < b[2] && b[0] + g < a[2] && a[1] + g < b[3] && b[1] + g < a[3];
	const add = (kind, i, x, why) => { (out.kinds[kind] = out.kinds[kind] || []).push(i); if (out.bad.length < 6) out.bad.push(`frame ${i + 1} ${kind}: ${why}`); if (!out.why[kind]) out.why[kind] = `frame ${i + 1}: ${why}`; };
	live.forEach((x, i) => {
		if (!x.hx || !x.cx) add('unplaced', i, x, `head transform ${x.hx ? 'set' : 'none'}, control transform ${x.cx ? 'set' : 'none'}`);
		const { w, h, cx, cy } = norm(x);
		// (Pip trying on a look flips its whole figure through a scale of its own: not a pose; none on Welcome)
		if (!x.gp && x.hq && Math.max(...x.hp.map((v, k) => Math.abs(v - x.hq[k]))) > 2) add('off-pose', i, x, `head painted ${x.hp} but posed ${x.hq}`);
		const P = pose[x.th];
		// (the band takes Pip's own life: a hop's squash, a tilt or a nod grows its box by up to a third; the tiny pose is
		// under 40 % of its size, at the stage's corner)
		if (!x.gp && P && (Math.abs(w - P.W) > 0.3 * P.W || Math.abs(h - P.H) > 0.4 * P.H || Math.hypot(cx - P.CX, (cy - P.CY) * 1.4) > 0.6 * P.W)) add('out-of-band', i, x, `head ${x.hp} in stage ${x.svg} (${(w * 100).toFixed(1)}% x ${(h * 100).toFixed(1)}% at ${(cx * 100).toFixed(1)}%, ${(cy * 100).toFixed(1)}%) against settled ${(P.W * 100).toFixed(1)}% x ${(P.H * 100).toFixed(1)}% at ${(P.CX * 100).toFixed(1)}%, ${(P.CY * 100).toFixed(1)}%`);
		if (x.bo > 0.05 && x.bt && !x.nier) {
			// the pop grows the bubble from its tail corner (transform-origin 0 100%): that corner stays where it was placed
			if (x.bq && (Math.abs(x.bp[0] - x.bq[0]) > 2 || Math.abs(x.bp[3] - x.bq[3]) > 2)) add('bubble-off-place', i, x, `bubble painted ${x.bp} but placed ${x.bq}`);
			if (hit(x.bp, x.hp)) add('bubble-over-pip', i, x, `bubble ${x.bp} over head ${x.hp}`);
			else if (hit(x.bp, x.cp)) add('bubble-over-pip', i, x, `bubble ${x.bp} over control ${x.cp}`);
		}
	});
	out.calib = Math.max(0, ...live.slice(-12).filter((x) => x.hq).map((x) => Math.max(...x.hp.map((v, k) => Math.abs(v - x.hq[k])))));
	return out;
}

export default async function (t) {
	// --set size=740x900: another window size (the stage is a tall pane when wide, a strip when narrow or short)
	const size = /^(\d+)x(\d+)$/.exec(String(t.args.size || ''));
	if (size) await t.viewport(+size[1], +size[2]);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome' });
	await f.waitForFunction(() => { const h = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(h && h.__pipStage && h.__pipStage.svg); }, null, { timeout: 60000 });
	const reduce = t.args.motion === 'reduce';
	await t.emulate({ reducedMotion: reduce ? 'reduce' : 'no-preference' });
	await f.waitForTimeout(1200);
	// a real arrival wakes Pip (59-cheer.js wake: the pointer travelling); then the greeting is typed
	const win = await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-stage').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
	const off = t.sandboxed ? await t.page.evaluate(() => { const fr = document.querySelector('iframe'); const r = fr ? fr.getBoundingClientRect() : { left: 0, top: 0 }; return [r.left, r.top]; }) : [0, 0];
	for (let i = 0; i < 14; i++) await t.page.mouse.move(off[0] + win[0] - 120 + i * 18, off[1] + win[1] + (i % 2 ? 24 : -24));
	await f.waitForFunction(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage; return st && !st.sleepZ && st.bubble && /\S/.test(st.bubble.textContent || ''); }, null, { timeout: 15000 }).catch(() => {});
	await f.waitForTimeout(2500);
	t.check('Welcome: Pip is awake and greeting', await f.evaluate(() => { const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage; return !!st && !st.sleepZ && window.O55.S.sess.screen === 'welcome'; }));
	await f.evaluate(installSampler);

	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	const reps = Math.max(1, +(t.args.reps || 1));
	const btn = f.locator('#pm-o55-onboarding .o55-lookslot .o55-lookbtn');
	const menuOpen = async () => { if (!(await f.locator('#pm-o55-onboarding .o55-lookmenu').count())) { await btn.click(); await f.waitForSelector('#pm-o55-onboarding .o55-lookmenu', { timeout: 5000 }); await f.waitForTimeout(350); } };
	const rows = [], bad = [], tally = {}, dumps = [], causes = [];
	let changes = 0, frames = 0;
	for (let rep = 0; rep < reps; rep++) for (const look of looks) {
		const [fam, mode] = look.split('-');
		const th = await f.evaluate(() => window.O55.theme());
		const steps = [];
		if (th.chosen !== fam) steps.push(['family', fam, 'lookFamily']);
		if (th.mode !== mode) steps.push(['mode', mode, 'lookMode']);
		for (const [kind, arg, act] of steps) {
			await menuOpen();
			const sel = `#pm-o55-onboarding .o55-lookmenu [data-o55-do="${act}"][data-arg="${arg}"]`;
			const nier = arg === 'nier' || (await f.evaluate(() => window.O55.theme().nier));
			await arm(f, nier ? NIER_FRAMES : FRAMES);
			t.mark(`${look}: ${kind} ${arg}`);
			await f.locator(sel).click();
			const fr = await collect(f);
			if (t.args.dump) dumps.push({ look, kind, arg, frames: fr });   // --set dump=<file.json>: every frame read, for review
			// the causes, read off the page in each look: Pip's head group has no transition of its own; the bubble is placed with
			// `translate` (NieR's dialogue box is not placed by the stage)
			causes.push(await f.evaluate(() => {
				const st = document.querySelector('#pm-o55-onboarding .o55-stage').__pipStage, cs = getComputedStyle(st.gHead);
				const dur = cs.transitionDuration.split(',').map((v) => parseFloat(v) || 0);
				return { look: st.theme, prop: cs.transitionProperty, dur: Math.max(...dur), placed: st.famName !== 'nier', bubbleTransform: st.bubble.style.transform, bubbleTranslate: st.bubble.style.translate };
			}));
			const j = judge(fr);
			changes++; frames += j.n;
			Object.entries(j.kinds).forEach(([k, v]) => { tally[k] = (tally[k] || 0) + v.length; });
			const kinds = Object.entries(j.kinds).map(([k, v]) => `${k} ${v.length} (frames ${v.slice(0, 8).map((i) => i + 1).join(',')}${v.length > 8 ? ',…' : ''})`).join('; ');
			rows.push(`rep ${rep + 1} ${look} ${kind} ${arg}: ${j.n} frames; ${kinds || 'clean'} (settled pose fit ${j.calib} px)`);
			Object.entries(j.why).forEach(([k, w]) => bad.push({ k, text: `${look} ${kind} ${arg}, ${k} ${w}` }));
			await f.waitForTimeout(500);
		}
		// the menu is closed between looks, as a person leaves it
		if (await f.locator('#pm-o55-onboarding .o55-lookmenu').count()) { await btn.click(); await f.waitForTimeout(300); }
		await f.waitForTimeout(600);
	}
	if (t.args.dump) (await import('node:fs')).writeFileSync(String(t.args.dump), JSON.stringify(dumps));
	rows.forEach((r) => t.log(r));
	t.log(`${changes} look changes, ${frames} frames read; bad frames by kind: ${Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`);
	await t.check('every look change was made on Welcome', changes >= looks.length && (await f.evaluate(() => window.O55.S.sess.screen)) === 'welcome', `${changes} changes`);
	const kindsBad = (ks) => bad.filter((b) => ks.includes(b.k)).map((b) => b.text);
	await t.check(`FO-40: after each look change Pip is painted in its pose in every frame (${changes} changes, ${frames} frames)`, !tally['no-stage'] && !tally.unplaced && !tally['off-pose'] && !tally['out-of-band'], kindsBad(['no-stage', 'unplaced', 'off-pose', 'out-of-band']).slice(0, 6).join('; '));
	await t.check(`FO-44: the greeting bubble is painted at its place and never over Pip (${changes} changes)`, !tally['bubble-off-place'] && !tally['bubble-over-pip'], kindsBad(['bubble-off-place', 'bubble-over-pip']).slice(0, 6).join('; '));
	const eased = causes.filter((c) => c.dur > 0), placed = causes.filter((c) => c.placed), moved = placed.filter((c) => !c.bubbleTranslate || /translate/.test(c.bubbleTransform || ''));
	await t.check('FO-40 cause: Pip\'s head group has no CSS transition in any look (the printer head\'s rule stays on the printer)', causes.length > 0 && !eased.length, eased.slice(0, 3).map((c) => `${c.look}: transition ${c.prop} ${c.dur}s`).join('; '));
	await t.check('FO-44 cause: the bubble is placed with `translate`, which its pop (`scale`) leaves where it is, in every look the stage places it', placed.length > 0 && !moved.length, moved.slice(0, 3).map((c) => `${c.look}: transform "${c.bubbleTransform}", translate "${c.bubbleTranslate}"`).join('; ') || `${placed.length} looks read`);
}
