// QA-1 round 2 (Jared, 2026-11-08: "the section around the text cuts down into the other section"; sol-recheck-qa1
// QA1-R1 and SOL-QA1-K1): the current step's section on the onboarding header rail, read from painted pixels, in every
// chapter (Welcome, Computer, Project, AI, Ready), at 1920, 1390, 1024, 860 and 740 wide (740 is the narrow layout), in
// all ten looks, on both surfaces. The section is every chip the looks draw for the current step: the switcher's chip in
// the window's own lens layer (Glass's lens) or in the strip's under-layer (Friendly's sticker, Basic's block, Retro's
// and NieR's chips), a hop or carried frame of one, NieR's ink box (the current item's ::after) and NieR's walk block.
// In each cell, with Reduced Motion and the header at rest, a band 16 px above and below the header is captured with
// the section shown, with it hidden, with Pip hidden, and shown again (the two shown captures must match: a cell that
// moves under the capture is retried and then fails as unsettled). What the section paints is what changes when it is
// hidden (any channel by more than 24 levels); what Pip paints is what changes when he is hidden, less a 1 px edge:
// - inside the header: no pixel the section paints lies above the header's top or below its foot;
// - never over Pip: no pixel of Pip's figure changes when the section is hidden (a chip under him changes only his
//   anti-aliased edge, which the 1 px erosion leaves out; a lens over him tints all of him);
// - drawn where labelled: where the current step's word shows, the section paints at least 20 pixels, so a build that
//   drew no chip at all, or a capture that saw none, cannot pass the two above.
// The walk: with motion on, at 740 and 1390, Pip walks Where -> Welcome -> Where in each look, and every frame the
// section's boxes (lenses, hop and carry frames, NieR's walk block and ink box) are read: none may reach past the header.
// On 714f6a006a and on main 78a1fd64cd the narrow layout's chip was the whole rail item plus the look's pad, 63 to 69 px
// tall in the 58 px header, in all ten looks and every chapter (Glass's lens lying over Pip), and Glass's lens lay over
// Pip's feet at every wide width. --set film=1 --grep film --record <mp4>: the narrow walk for frame review. --set looks=a,b,
// --set widths=740,1390, --set screens=where, --set walk=0 skips the walk; the switch picks one surface. About 12 min.
//   browser-check run Concepts/pm7-tools/browser-check/checks/rail-section-bounds.check.mjs --set page=<build>
const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const SCREENS = ['welcome', 'where', 'name', 'ai', 'ready'];   // one per chapter
const T = 24, BAND = 16, MIN_DRAWN = 20;
const list = (v, d) => (v ? String(v).split(',') : d);
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

// the look applied and every change it started over (as wizard-header reads it)
function lookSettled([fam, mode]) {
	const html = document.documentElement, theme = html.getAttribute('data-theme') || '', O = window.O55;
	const nier = !!(window.PM_NIER && window.PM_NIER.on()) || theme.startsWith('nier');
	return nier === (fam === 'nier') && theme.endsWith('-' + mode) && (fam === 'nier' || theme.startsWith(fam)) && !O.S.vt
		&& !(O.nierLook && O.nierLook.busy && O.nierLook.busy()) && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy());
}
// the header at rest: no cold NieR opening, its controls laid out, no screen change, no finite header animation running
function headerReady() {
	const r = document.querySelector('#pm-o55-onboarding'), head = r && r.querySelector('.o55-win .o55-head');
	if (!head || r.hasAttribute('data-o55nw-cold') || r.hasAttribute('data-o55nw-go') || r.classList.contains('o55-opening') || window.O55.S.vt) return false;
	if ([...head.querySelectorAll('.o55-headctl button')].filter((b) => b.getClientRects().length).length < 4) return false;
	if (r.querySelector('.o55-pane > .o55-layer.o55-out, .o55-pane > .o55-layer.o55-entering')) return false;
	if (head.querySelector('.o55nw-railcur, .lg-hop')) return false;
	return !head.getAnimations({ subtree: true }).some((a) => (a.playState === 'running' || a.pending) && a.effect && a.effect.getComputedTiming().endTime !== Infinity);
}
const painted = (f) => f.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => res()))));

// the hide switches (a style the check adds once): the section, Pip
const HIDE_CSS = `html[data-qa1rb-hide~="sec"] [data-qa1rb-sec] { visibility: hidden !important; }
html[data-qa1rb-hide~="sec"] #pm-o55-onboarding .o55-railitem[data-state="current"]::after { visibility: hidden !important; }
html[data-qa1rb-hide~="sec"] #pm-o55-onboarding .o55nw-railcur { visibility: hidden !important; }
html[data-qa1rb-hide~="pip"] #pm-o55-onboarding .o55-railpip { visibility: hidden !important; }`;

/* the cell's geometry: the header, Pip, whether the current word shows, and the section's elements (every lens, hop or
   carried frame of the switcher in the onboarding window whose box meets the header's band, in either layer), marked
   for hiding */
function cellGeo(band) {
	const r1 = (v) => Math.round(v * 10) / 10;
	const root = document.getElementById('pm-o55-onboarding'), head = root && root.querySelector('.o55-win .o55-head');
	if (!head) return null;
	const hb = head.getBoundingClientRect(), strip = head.querySelector('.o55-raillist');
	const cur = strip && strip.querySelector('.o55-railitem[data-state="current"]');
	const label = cur && cur.querySelector('.o55-raillabel');
	const lb = label && label.getBoundingClientRect();
	const pip = head.querySelector('.o55-railpip'), pb = pip && pip.getBoundingClientRect();
	document.querySelectorAll('[data-qa1rb-sec]').forEach((e) => e.removeAttribute('data-qa1rb-sec'));
	const sec = [...root.querySelectorAll('.lg-lens, .lg-hop')].filter((e) => {
		const b = e.getBoundingClientRect();
		return b.width > 0 && b.height > 0 && b.bottom > hb.top - band && b.top < hb.bottom + band && b.right > hb.left && b.left < hb.right;
	});
	sec.forEach((e) => e.setAttribute('data-qa1rb-sec', ''));
	const af = cur && getComputedStyle(cur, '::after');
	return {
		layout: root.getAttribute('data-o55-layout'), chapter: cur && cur.getAttribute('data-chapter'),
		head: { left: hb.left, top: hb.top, right: hb.right, bottom: hb.bottom },
		labelled: !!(lb && lb.width > 1 && lb.height > 1 && getComputedStyle(label).visibility !== 'hidden'),
		pip: pb && pb.width > 0 ? { left: pb.left, top: pb.top, right: pb.right, bottom: pb.bottom } : null,
		boxes: sec.map((e) => { const b = e.getBoundingClientRect(); return `${e.closest('.lg-lenses-under') ? 'under' : 'lens'} ${r1(b.top)}..${r1(b.bottom)}`; })
			.concat(af && af.content !== 'none' ? [`::after top ${af.top} h ${af.height}`] : [])
	};
}

const diffMask = (a, b) => {
	const m = new Uint8Array(a.width * a.height);
	for (let i = 0, p = 0; p < m.length; p++, i += 4) m[p] = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > T ? 1 : 0;
	return m;
};
const count = (m) => m.reduce((s, v) => s + v, 0);
// the mask less a 1 px edge: a pixel stays when it and its four neighbours are all set
function erode(m, w, h) {
	const o = new Uint8Array(m.length);
	for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const p = y * w + x; o[p] = m[p] && m[p - 1] && m[p + 1] && m[p - w] && m[p + w] ? 1 : 0; }
	return o;
}

async function cell(t, f, off, tag, out) {
	for (let attempt = 0; attempt < 4; attempt++) {
		const g = await f.evaluate(cellGeo, BAND);
		if (!g) { out.bad.push(`${tag}: no header`); return; }
		const x0 = Math.floor(off.x + g.head.left), y0 = Math.floor(off.y + g.head.top) - BAND;
		const region = { x: x0, y: y0, width: Math.ceil(off.x + g.head.right) - x0, height: Math.ceil(off.y + g.head.bottom) - Math.floor(off.y + g.head.top) + 2 * BAND };
		const hide = async (what) => { await f.evaluate((w) => document.documentElement.setAttribute('data-qa1rb-hide', w), what); await painted(f); };
		await painted(f);
		const A = await t.pixels(region);
		await hide('sec'); const B = await t.pixels(region);
		await hide('pip'); const C = await t.pixels(region);
		await hide(''); const D = await t.pixels(region);
		const moved = diffMask(A, D);
		if (count(moved)) {
			await f.waitForTimeout(600); if (attempt < 3) continue;
			let x0m = Infinity, y0m = Infinity, x1m = -1, y1m = -1;
			moved.forEach((v, p) => { if (!v) return; const x = p % A.width, y = (p - x) / A.width; x0m = Math.min(x0m, x); y0m = Math.min(y0m, y); x1m = Math.max(x1m, x); y1m = Math.max(y1m, y); });
			out.unsettled.push(`${tag}: the band changed between two captures with nothing hidden (${count(moved)} px, x ${x0m + region.x - off.x}..${x1m + 1 + region.x - off.x}, y ${y0m + y0 - off.y}..${y1m + 1 + y0 - off.y})`); return;
		}
		const W = A.width, H = A.height, sec = diffMask(A, B), pipCore = erode(diffMask(A, C), W, H);
		// the header's rows in the capture: a row is outside when it lies wholly above the header's top or below its foot
		const top = off.y + g.head.top - y0, bottom = off.y + g.head.bottom - y0;
		let outside = 0, minY = Infinity, maxY = -Infinity, over = 0, drawn = 0;
		for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
			const p = y * W + x; if (!sec[p]) continue;
			drawn++; minY = Math.min(minY, y); maxY = Math.max(maxY, y);
			if (y + 1 <= top + 0.01 || y >= bottom - 0.01) outside++;
			if (pipCore[p]) over++;
		}
		let pTop = Infinity, pBot = -Infinity; pipCore.forEach((v, p) => { if (v) { const y = Math.floor(p / W); pTop = Math.min(pTop, y); pBot = Math.max(pBot, y); } });
		const pipSpan = pBot >= 0 ? `Pip's figure rows ${Math.round((pTop + y0 - off.y) * 10) / 10}..${Math.round((pBot + 1 + y0 - off.y) * 10) / 10}` : 'no Pip painted';
		const span = drawn ? `paints rows ${Math.round((minY + y0 - off.y) * 10) / 10}..${Math.round((maxY + 1 + y0 - off.y) * 10) / 10}` : 'paints nothing';
		const row = `${tag} (${g.layout}, ${g.chapter}, header ${Math.round(g.head.top * 10) / 10}..${Math.round(g.head.bottom * 10) / 10}): ${span}; ${drawn} px, ${outside} outside the header, ${over} over Pip (${pipSpan}); [${g.boxes.join(', ')}]`;
		out.rows.push(row); out.cells++;
		if (g.labelled) out.labelled++; else out.unlabelled++;
		if (outside) out.outside.push(row);
		if (over) out.over.push(row);
		if (g.labelled && drawn < MIN_DRAWN) out.undrawn.push(row);
		if ((outside || over) && out.evidence < 6) { out.evidence++; await t.crop(`fail-${tag.replace(/\s+/g, '-')}`, region, `the current step's section against the header (${outside} px outside) and Pip (${over} px over him)`, { pad: 0 }); }
		return;
	}
}

async function frameOff(t, f) {
	const fe = f === t.page.mainFrame() ? null : await f.frameElement();
	const b = fe ? await fe.boundingBox() : null;
	return b ? { x: b.x, y: b.y } : { x: 0, y: 0 };
}
async function settle(f, out, what, fn, arg) {
	const ok = await f.waitForFunction(fn, arg, { timeout: 30000 }).then(() => true, () => false);
	if (!ok) out.unsettled.push(`${what}: did not settle`);
	await painted(f);
	return ok;
}

async function rest(t, mode) {
	const widths = list(t.args.widths, ['1920', '1390', '1024', '860', '740']).map(Number);
	const screens = list(t.args.screens, SCREENS);
	await t.emulate({ reducedMotion: 'reduce' });
	const out = { rows: [], outside: [], over: [], undrawn: [], unsettled: [], bad: [], cells: 0, labelled: 0, unlabelled: 0, evidence: 0 };
	let f = null;
	for (const look of list(t.args.looks, LOOKS)) {
		const [fam, lmode] = look.split('-');
		if (f) await t.app.resetLayout();
		await t.viewport(1920, 1080);
		f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome', sandbox: mode === 'sandbox' });
		await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
		await f.evaluate((css) => { const s = document.createElement('style'); s.id = 'qa1rb-style'; s.textContent = css; document.head.appendChild(s); }, HIDE_CSS);
		await t.page.mouse.move(2, 2);
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, lmode]);
		await settle(f, out, `${look}: the look`, lookSettled, [fam, lmode]);
		await settle(f, out, `${look}: the header`, headerReady);
		for (const id of screens) {
			// walked with history, as wizard-header does: the chapters behind carry their jump buttons
			const at = await f.evaluate((sid) => { try { window.O55.ui.go(sid, sid === 'welcome' ? { noHistory: true } : {}); } catch (e) { return null; } return window.O55.S.sess.screen; }, id);
			if (at !== id) { out.bad.push(`${look} ${id}: not opened (${at})`); continue; }
			for (const w of widths) {
				await t.viewport(w, w === 1920 ? 1080 : 900);
				await settle(f, out, `${look} ${id} ${w}: the width`, (ww) => document.documentElement.clientWidth <= ww && document.documentElement.clientWidth > ww - 40, w);
				await settle(f, out, `${look} ${id} ${w}: the header`, headerReady);
				await f.waitForTimeout(250);
				await cell(t, f, await frameOff(t, f), `${look} ${mode} ${id} ${w}`, out);
			}
			await t.viewport(1920, 1080);
		}
	}
	out.bad.forEach((r) => t.log(r));
	out.unsettled.forEach((r) => t.log(`not settled: ${r}`));
	if (t.args.rows) out.rows.forEach((r) => t.log(r));
	t.log(`${mode}: ${out.cells} cells, ${out.labelled} with the current word shown, ${out.unlabelled} without`);
	const first = (a) => a.slice(0, 6).join(' | ') + (a.length > 6 ? ` (+${a.length - 6} more)` : '');
	await t.check(`${mode}: every cell measured, at rest (${out.cells} cells)`, out.cells > 0 && !out.bad.length && !out.unsettled.length, first(out.bad.concat(out.unsettled)));
	await t.check(`${mode}: the current step's section paints inside the header (${out.cells} cells)`, out.cells > 0 && !out.outside.length, first(out.outside));
	await t.check(`${mode}: the current step's section never paints over Pip (${out.cells} cells)`, out.cells > 0 && !out.over.length, first(out.over));
	await t.check(`${mode}: the section is drawn wherever the current word shows (${out.labelled} cells)`, out.labelled > 0 && !out.undrawn.length, first(out.undrawn));
	await t.viewport(1920, 1080);
	await t.app.resetLayout();
}

/* every frame of a walk: the section's boxes (lenses and hop or carry frames meeting the header's columns, NieR's walk
   block, NieR's ink box) against the header */
const WALK = () => new Promise((res) => {
	const head = document.querySelector('#pm-o55-onboarding .o55-win .o55-head'), hb = head.getBoundingClientRect();
	const bad = []; let frames = 0, seen = 0; const t0 = performance.now();
	const tick = () => {
		frames++;
		const boxes = [...document.querySelectorAll('#pm-o55-onboarding :is(.lg-lens, .lg-hop, .o55nw-railcur)')].filter((e) => {
			const b = e.getBoundingClientRect(), cs = getComputedStyle(e);
			return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && b.right > hb.left && b.left < hb.right && b.bottom > hb.top - 20 && b.top < hb.bottom + 20;
		}).map((e) => e.getBoundingClientRect());
		const cur = head.querySelector('.o55-railitem[data-state="current"]'), af = cur && getComputedStyle(cur, '::after');
		if (af && af.content !== 'none' && af.backgroundColor !== 'rgba(0, 0, 0, 0)') { const cb = cur.getBoundingClientRect(); boxes.push({ top: cb.top + parseFloat(af.top), bottom: cb.top + parseFloat(af.top) + parseFloat(af.height) }); }
		seen += boxes.length ? 1 : 0;
		for (const b of boxes) if (b.top < hb.top - 0.5 || b.bottom > hb.bottom + 0.5) { bad.push(`${Math.round(performance.now() - t0)} ms ${Math.round(b.top * 10) / 10}..${Math.round(b.bottom * 10) / 10}`); break; }
		if (performance.now() - t0 < 2600) requestAnimationFrame(tick); else res({ bad: bad.slice(0, 4), n: bad.length, frames, seen, head: `${Math.round(hb.top * 10) / 10}..${Math.round(hb.bottom * 10) / 10}` });
	};
	requestAnimationFrame(tick);
});

async function walk(t, mode) {
	if (t.args.walk === '0') return t.check(`${mode}: walk not run (--set walk=0)`, true);
	await t.emulate({ reducedMotion: 'no-preference' });
	const bad = [], rows = [];
	let f = null;
	for (const look of list(t.args.looks, LOOKS)) {
		const [fam, lmode] = look.split('-');
		if (f) await t.app.resetLayout();
		await t.viewport(1390, 900);
		f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome', sandbox: mode === 'sandbox' });
		await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, lmode]);
		await f.waitForFunction(lookSettled, [fam, lmode], { timeout: 30000 }).catch(() => bad.push(`${look}: the look did not settle`));
		for (const w of list(t.args.walkWidths, ['740', '1390']).map(Number)) {
			await t.viewport(w, 900);
			await f.waitForTimeout(1500);
			for (const [from, to] of [['welcome', 'where'], ['where', 'welcome']]) {
				await f.evaluate((s) => window.O55.ui.go(s, { noHistory: true }), from);
				await f.waitForFunction(headerReady, null, { timeout: 30000 }).catch(() => null);
				await f.waitForTimeout(1200);
				const watching = f.evaluate(WALK);
				await f.waitForTimeout(80);
				await f.evaluate((s) => window.O55.ui.go(s), to);
				const r = await watching;
				const row = `${look} ${mode} ${w} ${from}->${to}: ${r.frames} frames, ${r.seen} with a section, header ${r.head}, ${r.n} past it ${r.bad.join(', ')}`;
				rows.push(row);
				if (r.n) bad.push(row);
			}
		}
	}
	rows.forEach((r) => t.log(r));
	await t.check(`${mode}: walking, no frame's section reaches past the header (${rows.length} walks)`, rows.length > 0 && !bad.length, bad.slice(0, 6).join(' | '));
	await t.viewport(1920, 1080);
	await t.app.resetLayout();
}

/* --set film=1 (alone, with --record): the narrow walk forward and back, Welcome to Ready and back, at 740 x 900 with motion
   on, each move marked, in --set looks= (default Basic, Friendly, Glass and NieR, light and dark), for frame review */
async function film(t) {
	if (!t.args.film) { t.log('skipped: --set film=1 (record this test alone with --record)'); return; }
	await t.emulate({ reducedMotion: 'no-preference' });
	await t.viewport(+(t.args.w || 740), 900);
	const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome', sandbox: t.app.sandboxed() });
	await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win .o55-raillist'), null, { timeout: 60000 });
	await t.page.mouse.move(2, 2);
	const route = ['welcome', 'where', 'name', 'ai', 'ready', 'ai', 'name', 'where', 'welcome'];
	for (const look of list(t.args.looks, ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'nier-light', 'nier-dark'])) {
		const [fam, lmode] = look.split('-');
		await f.evaluate(() => window.O55.ui.go('welcome', { noHistory: true }));
		await f.evaluate(([fm, m]) => window.O55.ui.applyLook(fm, m), [fam, lmode]);
		await f.waitForFunction(lookSettled, [fam, lmode], { timeout: 30000 }).catch(() => t.log(`${look}: the look did not settle`));
		await f.waitForTimeout(2500);
		for (let i = 1; i < route.length; i++) {
			t.mark(`${look} ${route[i - 1]}->${route[i]}`);
			await f.evaluate((s) => window.O55.ui.go(s), route[i]);
			await f.waitForTimeout(1700);
		}
	}
	await t.check('film walked', true);
}

export const tests = {
	'current section at rest, every chapter, width and look (normal page)': on('normal', rest),
	'current section at rest, every chapter, width and look (T3 sandbox)': on('sandbox', rest),
	'current section while Pip walks (normal page)': on('normal', walk),
	'current section while Pip walks (T3 sandbox)': on('sandbox', walk),
	'film': film
};
