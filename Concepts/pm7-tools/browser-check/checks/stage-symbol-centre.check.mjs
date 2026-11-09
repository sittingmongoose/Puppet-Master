// QA-5 (Jared, 2026-11-08: "The spiral symbol in the left art area next to pip that is inside a circle, inside a box,
// is not centered. That happens across multiple screens and symbols. that needs to be checked on all the screens for
// others that do that."): every symbol a stage prop frames in a circle or a box is centred in that frame, read from
// painted pixels the QA-2 way. Each prop is drawn with its own world's pen (PW.pen + PW.PROPS, the code the stage
// itself runs) in a harness svg at 2 px per prop unit; the symbol's ink box is what changes when the symbol alone is
// repainted magenta (half-peak edges), the frame's centre likewise when the frame alone is — magenta, not
// transparent, so a pale part on a pale ground still differs by a full scale. Tolerance 0.5 prop units on each
// axis, QA-2's half-pixel bound at the stage's own scale. On b3456fac54: Restore's rewind mark centred
// (-2.3, -2.2) off its circle and the circle 1 below its box's centre, Creating's history block 2 low and its
// folder 1.5, the Recovery Kit's key 1 right of its circle, a clipboard tick 1.5 right of its box, the laptop's
// face and the lock's keyhole 0.75 and 0.5 off. The vault dial, globe meridians, QR finders, key hole and the
// phone's eyes are the guards that already centred. Ten looks, both surfaces (--set sandbox picks one);
// --set looks=a,b narrows it. About 20 s per look.
//   browser-check run Concepts/pm7-tools/browser-check/checks/stage-symbol-centre.check.mjs --set page=<build>
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';

const LOOKS = ['basic', 'friendly', 'retro', 'glass', 'nier'].flatMap((f) => [`${f}-light`, `${f}-dark`]);
const TOL = 0.5, SCALE = 2;
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

const diffAt = (a, b, i) => Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
function inkBox(a, b) {
	const rows = new Array(a.height).fill(0), cols = new Array(a.width).fill(0);
	for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) { const d = diffAt(a, b, (y * a.width + x) * 4); if (d > rows[y]) rows[y] = d; if (d > cols[x]) cols[x] = d; }
	const peak = Math.max(0, ...rows);
	if (peak < 40) return null;
	const edge = (p) => {
		const h = peak / 2, f = p.findIndex((v) => v >= h), l = p.length - 1 - [...p].reverse().findIndex((v) => v >= h);
		const a0 = f > 0 ? p[f - 1] : 0, b0 = l < p.length - 1 ? p[l + 1] : 0;
		return [f - 0.5 + (h - a0) / Math.max(1e-6, p[f] - a0), l + 0.5 + (p[l] - h) / Math.max(1e-6, p[l] - b0)];
	};
	const [t, bo] = edge(rows), [l, rr] = edge(cols);
	return { cx: (l + rr) / 2, cy: (t + bo) / 2, w: rr - l, h: bo - t, peak };
}

/* the cases: frame and symbol picked from the prop's own children (the pen emits them in the same order in
   every world), by index, by a circle's radius, by "the rest after the frame", or against a named point */
const CASES = [
	{ id: 'restore: rewind in its circle', prop: 'restore', frame: { r: 15 }, glyph: 'after' },
	/* the box's visible face below its lid, -10..38 (the body is -16..38, the lid covers it to -10): centre 14, as the kit's
	   emblem field below its band (sol-review-b9a, lead ruling 1109041410-795a) */
	{ id: 'restore: circle in its box', prop: 'restore', frame: { point: [0, 14] }, glyph: { r: 15 } },
	{ id: 'vault: dial in its ring', prop: 'vault', frame: { r: 18 }, glyph: 'after-norect' },
	...['folder', 'history', 'cloud', 'check', 'globe', 'dot', 'nas', 'restore', 'stack'].map((icon) => ({ id: `block ${icon}: in its block`, prop: 'block', params: { icon, hue: 'a' }, frame: { idx: [0] }, glyph: 'rest' })),
	{ id: 'kit: key in its circle', prop: 'kit', frame: { r: 11 }, glyph: 'after' },
	{ id: 'kit: emblem in its field', prop: 'kit', frame: { point: [0, 7] }, glyph: { r: 11 } },
	{ id: 'lock: keyhole in its body', prop: 'lock', frame: { idx: [1] }, glyph: 'after' },
	{ id: 'clipboard: tick in its box', prop: 'clipboard', params: { ticks: 2, rows: 4 }, frame: { idx: [3] }, glyph: { idx: [5] } },
	{ id: 'laptop: face on its screen', prop: 'laptop', frame: { idx: [1] }, glyph: { idx: [2, 3, 4] } },
	{ id: 'phone: eyes on its screen', prop: 'phone', frame: { idx: [1] }, glyph: { idx: [3, 4] } },
	{ id: 'sign: name in its panel', prop: 'sign', params: { text: 'Loom' }, frame: { idx: [1] }, glyph: { tag: 'text' } },
	{ id: 'orb: label in its circle', prop: 'orb', params: { lit: true, label: 'Cl', hue: 'e' }, frame: { r: 22 }, glyph: { tag: 'text' } },
	{ id: 'qr: finder in its corner', prop: 'qr', frame: { idx: [1] }, glyph: { idx: [2, 3] } },
	{ id: 'key: hole in its bow', prop: 'key', frame: { point: [-20, 0] }, glyph: { idx: [1] } },
	{ id: 'globe: meridians in its circle', prop: 'globe', frame: { idx: [0] }, glyph: { idx: [1] } }
];

/* build one prop in the harness and mark its frame (qa5-f) and symbol (qa5-g); returns the harness's rect */
const BUILD = (spec) => {
	const PW = window.O55.pipWorlds, w = PW.WORLDS[spec.look];
	let host = document.getElementById('qa5-host');
	if (!host) { host = document.createElement('div'); host.id = 'qa5-host'; host.style.cssText = 'position:fixed;left:0;top:0;width:480px;height:480px;background:#888;z-index:2147483000'; document.body.appendChild(host); }
	const P = PW.pen(w, 'qa5-'); P.theme = spec.look;
	const made = PW.PROPS[spec.prop](P, spec.params || {});
	host.innerHTML = `<svg viewBox="-120 -120 240 240" width="480" height="480"><defs>${P.defs()}</defs><g id="qa5-prop">${made.svg}</g></svg>`;
	const kids = [...host.querySelectorAll('#qa5-prop > *')];
	const pick = (sel, frameEl) => {
		if (!sel) return [];
		if (sel === 'after') return kids.slice(kids.indexOf(frameEl) + 1);
		if (sel === 'after-norect') return kids.slice(kids.indexOf(frameEl) + 1).filter((e) => e.tagName !== 'rect');
		if (sel === 'rest') return kids.slice(1);
		if (sel.idx) return sel.idx.map((i) => kids[i]).filter(Boolean);
		if (sel.r !== undefined) return kids.filter((e) => e.tagName === 'circle' && Math.abs(+e.getAttribute('r') - sel.r) < 0.01).slice(0, 1);
		if (sel.tag) return kids.filter((e) => e.tagName === sel.tag);
		return [];
	};
	const fEls = spec.frame.point ? [] : pick(spec.frame);
	const gEls = pick(spec.glyph, fEls[0]);
	fEls.forEach((e) => e.classList.add('qa5-f'));
	gEls.forEach((e) => e.classList.add('qa5-g'));
	const b = host.getBoundingClientRect();
	return { x: b.left, y: b.top, w: b.width, h: b.height, nf: fEls.length, ng: gEls.length };
};
const PAINT5 = (mode) => {
	let st = document.getElementById('qa5-paint');
	if (!st) { st = document.createElement('style'); st.id = 'qa5-paint'; document.head.appendChild(st); }
	st.textContent = mode === 'g' ? '.qa5-g, .qa5-g * { fill: #f0f !important; stroke: #f0f !important; }'
		: mode === 'f' ? '.qa5-f, .qa5-f * { fill: #f0f !important; stroke: #f0f !important; }' : '';
};
const UNBUILD = () => { const h = document.getElementById('qa5-host'); if (h) h.remove(); const s = document.getElementById('qa5-paint'); if (s) s.remove(); };

async function frameOffset(t) {
	if (t.root === t.page) return { x: 0, y: 0 };
	return t.page.evaluate(() => { const fr = document.querySelector('iframe'); if (!fr) return { x: 0, y: 0 }; const b = fr.getBoundingClientRect(); return { x: b.left + fr.clientLeft, y: b.top + fr.clientTop }; });
}

async function run(t, mode) {
	const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
	await t.newContext({ viewport: { width: 1390, height: 900 }, deviceScaleFactor: 1 });
	await t.emulate({ reducedMotion: 'reduce' });
	for (const look of looks) {
		await t.step(`${look} ${mode}`, async () => {
			const f = await t.app.open(t, { sandbox: mode === 'sandbox' });
			await t.app.look(t, look);
			await t.page.waitForTimeout(600);
			const off = await frameOffset(t);
			const fails = [], log = [];
			for (const c of CASES) {
				const built = await f.evaluate(BUILD, { look, prop: c.prop, params: c.params || null, frame: c.frame, glyph: c.glyph });
				if (!built.ng || (!built.nf && !c.frame.point)) { fails.push(`${c.id}: frame or symbol not found (f=${built.nf} g=${built.ng})`); continue; }
				const clip = { x: Math.round(off.x + built.x), y: Math.round(off.y + built.y), width: 480, height: 480 };
				const shot = async (m) => { await f.evaluate(PAINT5, m); await t.page.waitForTimeout(50); return decodePng(await t.page.screenshot({ clip, animations: 'disabled', caret: 'hide' })); };
				const A = await shot(''), B = await shot('g'), C = c.frame.point ? null : await shot('f');
				await f.evaluate(PAINT5, '');
				if (t.args.crops && c.prop === 'restore' && c.frame.point) await t.crop(`restore-visible-face-${look}-${mode}`,
					{ x: off.x + built.x + 156, y: off.y + built.y + 160, width: 168, height: 168 }, 'Restore emblem centred in the visible face below its lid, native 2 px per prop unit');
				const g = inkBox(A, B);
				const fc = c.frame.point ? { cx: (120 + c.frame.point[0]) * SCALE, cy: (120 + c.frame.point[1]) * SCALE } : inkBox(A, C);
				if (!g || !fc) { fails.push(`${c.id}: ${!g ? 'no symbol ink' : 'no frame ink'}`); continue; }
				const dx = +((g.cx - fc.cx) / SCALE).toFixed(2), dy = +((g.cy - fc.cy) / SCALE).toFixed(2);
				log.push(`${c.id} ${dx},${dy}`);
				if (Math.abs(dx) > TOL || Math.abs(dy) > TOL) fails.push(`${c.id}: symbol ink centre off by dx ${dx}, dy ${dy} units`);
			}
			await f.evaluate(UNBUILD);
			t.log(`${look}: ${log.join('; ')}`);
			await t.check(`${look}: every framed stage symbol centred (${CASES.length} cases, ${TOL} units)`, !fails.length, fails.slice(0, 8).join(' | '));
		});
	}
}

export const tests = {
	'stage symbols centred (normal page)': on('normal', run),
	'stage symbols centred (T3 sandbox)': on('sandbox', run)
};
