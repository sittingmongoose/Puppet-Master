// QA-1 (Jared, 2026-11-08, on the string rail's beads and its current label's section): "when you go back a page, the
// bead that it was just on sits there on that spot as well"; "the line runs right through the circle beads when pip
// is not on them. It should be cut at each bead"; "the section around the text can't extend below (or above) the
// boundary where the text area is". Three reads, in all ten looks, both surfaces:
// - the current label's section (the switcher lens where one is drawn, read as rail-chip reads it; otherwise the
//   label's own box plus the 6 px pad a chip draws around it) ends inside the 58 px header;
// - at rest, the string is cut at each upcoming hollow bead: on painted pixels the bead's centre matches the header
//   ground above it, not the string sampled midway to the neighbouring bead;
// - walking home (Where back to Welcome, motion on), no drawn bead's centre is ever under Pip's rail figure while
//   the bead is visible.
// On b3456fac54 the string ran at 14 px with the names ending at 52 px, so a padded chip crossed the header's foot,
// the string was one unbroken line through every bead, and a spot Pip left stayed drawn under him the whole walk.
// --set looks=a,b narrows it. About 30 s per look.
//   browser-check run Concepts/pm7-tools/browser-check/checks/rail-string.check.mjs --set page=<build>
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

/* header, current item, its section and every bead, in page coordinates */
const GEOMETRY = () => {
	const R = (b) => b && { x: b.left, y: b.top, w: b.width, h: b.height, cx: (b.left + b.right) / 2, cy: (b.top + b.bottom) / 2, bottom: b.bottom, top: b.top };
	const win = document.querySelector('#pm-o55-onboarding .o55-win');
	const head = win && win.querySelector('.o55-head');
	if (!head) return null;
	const hb = head.getBoundingClientRect();
	const strip = head.querySelector('.o55-raillist');
	const cur = strip && strip.querySelector('.o55-railitem[data-state="current"]');
	const label = cur && cur.querySelector('.o55-raillabel');
	const sb = strip && strip.getBoundingClientRect();
	/* the strip's own chip first (an under-layer: Friendly's sticker, Basic's block, Retro's and NieR's chips), else the
	   window's lens layer, as rail-chip reads it (SOL-QA1-K1: the under-layer chips were left out, so those looks were
	   judged by their label plus 6 px instead) */
	const own = strip ? [...strip.querySelectorAll('.lg-lens')] : [];
	const lenses = (own.length ? own : [...win.querySelectorAll('.lg-lens')].filter((e) => !e.closest('.o55-layer.o55-out') && !e.closest('.lg-lenses-under')))
		.map((e) => ({ b: e.getBoundingClientRect(), op: +getComputedStyle(e).opacity }))
		.filter((x) => x.b.width > 0 && x.b.height > 0 && x.op > 0.05 && sb && x.b.right > sb.left && x.b.left < sb.right && x.b.top < hb.bottom && x.b.bottom > hb.top)
		.sort((a, b) => Math.abs(((a.b.top + a.b.bottom) / 2) - ((sb.top + sb.bottom) / 2)) - Math.abs(((b.b.top + b.b.bottom) / 2) - ((sb.top + sb.bottom) / 2)));
	const beads = [...strip.querySelectorAll('.o55-railitem')].map((li) => {
		const n = li.querySelector('.o55-railnode');
		return { ch: li.getAttribute('data-chapter'), state: li.getAttribute('data-state') || '', node: R(n && n.getBoundingClientRect()) };
	}).filter((b) => b.node && b.node.w > 0);
	/* NieR's window writes its own rail text (its current item may carry no .o55-raillabel box); its section is
	   the item's ::after box, measured from the item as 66-nier-window reads it */
	let nierChip = null;
	if (cur) {
		const af = getComputedStyle(cur, '::after');
		const cb = cur.getBoundingClientRect(), at = parseFloat(af.top), ah = parseFloat(af.height);
		if (af.content !== 'none' && isFinite(at) && isFinite(ah) && ah > 0) nierChip = { top: cb.top + at, bottom: cb.top + at + ah };
	}
	const labelBox = (label && label.getBoundingClientRect()) || (cur && cur.getBoundingClientRect());
	return { head: R(hb), label: labelBox ? R(labelBox) : null, lens: lenses.length ? R(lenses[0].b) : null, nierChip, beads };
};

/* watch Pip walk: any frame where a visible bead's centre is under his rail figure (2 px in from its edge) */
const WATCH = () => new Promise((res) => {
	const bad = []; let frames = 0;
	const t0 = performance.now();
	const tick = () => {
		frames++;
		const pip = document.querySelector('#pm-o55-onboarding .o55-railpip');
		const pr = pip && pip.getBoundingClientRect();
		if (pr && pr.width > 0) {
			for (const n of document.querySelectorAll('#pm-o55-onboarding .o55-railnode')) {
				const b = n.getBoundingClientRect(), cs = getComputedStyle(n);
				if (cs.display === 'none' || cs.visibility === 'hidden' || b.width === 0) continue;
				const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
				if (cx > pr.left + 2 && cx < pr.right - 2 && cy > pr.top + 2 && cy < pr.bottom - 2) bad.push(Math.round(performance.now() - t0));
			}
		}
		if (performance.now() - t0 < 2400) requestAnimationFrame(tick); else res({ bad: bad.slice(0, 6), n: bad.length, frames });
	};
	requestAnimationFrame(tick);
});

async function frameOffset(t) {
	if (t.root === t.page) return { x: 0, y: 0 };
	return t.page.evaluate(() => { const fr = document.querySelector('iframe'); if (!fr) return { x: 0, y: 0 }; const b = fr.getBoundingClientRect(); return { x: b.left + fr.clientLeft, y: b.top + fr.clientTop }; });
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

async function run(t, mode) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	await t.newContext({ viewport: { width: 1390, height: 900 }, deviceScaleFactor: 1 });
	await t.emulate({ reducedMotion: 'no-preference' });
	for (const look of looks) {
		await t.step(`${look} ${mode}`, async () => {
			const f = await t.app.open(t, { sandbox: mode === 'sandbox' });
			await t.app.look(t, look);
			await f.evaluate(() => window.O55.ui.open({ fresh: true, screen: 'where' }));
			/* a skin may hold the rail in its old state through its opening beat (NieR's assembly): measure at rest */
			await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-railitem[data-state="current"]'), null, { timeout: 25000 }).catch(() => null);
			await t.page.waitForTimeout(3000);
			const g = await f.evaluate(GEOMETRY);
			t.check(`${look}: rail found`, !!(g && g.head && g.label && g.beads.length >= 4), g ? `beads ${g.beads.length}` : 'no rail');
			if (!g || !g.label) return;
			// the current label's section inside the header
			const sec = g.lens || g.nierChip || { top: g.label.top - 6, bottom: g.label.bottom + 6 };
			t.check(`${look}: current section inside the header`, sec.bottom <= g.head.bottom + 0.5 && sec.top >= g.head.top - 0.5,
				`${g.lens ? 'lens' : g.nierChip ? 'nier ::after' : 'label+6'} ${Math.round(sec.top * 10) / 10}..${Math.round(sec.bottom * 10) / 10} vs header ${Math.round(g.head.top * 10) / 10}..${Math.round(g.head.bottom * 10) / 10}`);
			// the string cut at each upcoming hollow bead, on painted pixels
			const off = await frameOffset(t);
			const img = decodePng(await t.page.screenshot({ animations: 'disabled', caret: 'hide' }));
			const px = (x, y) => { const i = ((Math.round(y) * img.width) + Math.round(x)) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };
			const cutFails = [];
			const upcoming = g.beads.filter((b) => b.state !== 'done' && b.state !== 'current');
			for (const b of upcoming) {
				const prev = g.beads[g.beads.indexOf(b) - 1];
				if (!prev) continue;
				const cx = off.x + b.node.cx, cy = off.y + b.node.cy;
				const S = px(off.x + (b.node.cx + prev.node.cx) / 2, cy);
				/* the bead's own interior, 2 px off the string's row each way: a bead's inside is not the header's
				   ground in every look (Glass's beads are dark wells), but a cut string leaves the centre row
				   the interior's colour where a through string paints the string's */
				const i1 = px(cx, cy - 2), i2 = px(cx, cy + 2), I = [(i1[0] + i2[0]) / 2, (i1[1] + i2[1]) / 2, (i1[2] + i2[2]) / 2];
				const C = px(cx, cy);
				if (!(dist(C, S) > dist(C, I) + 20)) cutFails.push(`${b.ch}: centre ${C} vs string ${S} interior ${I}`);
			}
			t.check(`${look}: string cut at ${upcoming.length} upcoming beads`, upcoming.length > 0 && !cutFails.length, cutFails.join(' | ') || 'no upcoming beads');
			// no bead drawn under Pip while he walks home
			await f.evaluate(() => { window.__qa1 = null; });
			const watching = f.evaluate(WATCH);
			await t.page.waitForTimeout(120);
			await f.evaluate(() => window.O55.ui.go('welcome'));
			const w = await watching;
			t.check(`${look}: no bead under Pip walking home`, w.n === 0, `${w.n} frames with a bead under Pip (${w.bad.join(',')} ms of ${w.frames})`);
		});
	}
}

export const tests = {
	'rail string and beads (normal page)': on('normal', run),
	'rail string and beads (T3 sandbox)': on('sandbox', run)
};
