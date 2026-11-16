// FO-215 round 2 (the blind recheck of FO-214/215, 2026-11-15): a cold Start -> Look in a look already put on. The Look
// line is written by Pip's wake, about 650 ms after the pointer travelled to Start, while Pip still lies on the floor; Pip
// then rises about 130-155 px and the bubble rides up with it. A place chosen for where Pip lay was carried into the props
// as it rose and the bubble went elsewhere in one frame: Friendly Light, "Dress me up" from under Pip's chin to above it,
// 170 px (sol-recheck-fo214, a film); Retro Dark, where the tube's crop leaves no room beside the palette, 150-210 px
// down and back. Each walk: a fresh context, onboarding opened fresh, the look put on while Welcome shows
// (O55.ui.applyLook, as a look set before onboarding opens), 3 s, then the pointer to Start, a rest of R ms and a press
// held about 90 ms. Every frame of the Start -> Look segment is read where the page paints it, and one thing is judged
// while the Look line shows:
//   kept   the bubble never moves more than 12 px in a frame against Pip's head (onboarding-dialog-steady's speech rule,
//          except that a bubble its own entrance clips away entirely does not show: Retro's box is wiped in, in steps);
// and logged, not judged: the frames where a prop over 5% opacity is under the part of the bubble that is painted (its
// box less its entrance's clip) by more than 0.5 px (stage-keepoff's meet). 739f238d81 and its fix both show a few: the
// palette, lowered against the pane's right edge, swings 1-3 px (once 8) into the bubble's right edge, where fit has no
// room to keep it off (an older contact, reported to the stream F lead as its own item).
// Rests (`--set rests=`, default 120,300,540,700 ms) move the wake against the Start press, its held stage and its first
// render. Default looks Friendly Light, Retro Dark, Retro Light, Basic Light and Glass Dark at 1694x1000@1 (the film size),
// and Friendly Light and Retro Dark at 1694x1290@1.5 (`--set looks=`, `--set sizes=`). Fresh context per walk, so headless.
// Fails 739f238d81 (Retro Dark at rests 120-540, 150-210 px, on both surfaces). `--set sandbox=0|1`; `--set out=<file.json>` keeps
// the frames.
import fs from 'node:fs';

function sampler() {
	if (window.__fo215) return;
	const L = window.__fo215 = { f: [], step: '' };
	const tr = (s) => { const m = /(-?[\d.]+)px (-?[\d.]+)px/.exec(s || ''); return m ? [+m[1], +m[2]] : null; };
	/* (the painted part of the bubble: its box less the right and bottom of an inset() clip, which Retro's entrance animates
	   from inset(0 100% 100% 0) in steps; a length, a percentage or calc(a% +/- bpx)) */
	const len = (v, full) => {
		v = String(v).trim(); let m;
		if ((m = /^(-?[\d.]+)px$/.exec(v))) return +m[1];
		if ((m = /^(-?[\d.]+)%$/.exec(v))) return +m[1] / 100 * full;
		if ((m = /^calc\((-?[\d.]+)% ([+-]) ([\d.]+)px\)$/.exec(v))) return +m[1] / 100 * full + (m[2] === '+' ? 1 : -1) * +m[3];
		return 0;
	};
	const painted = (r, clip) => {
		const m = /^inset\((.*)\)$/.exec(clip || '');
		if (!m) return [r.left, r.top, r.right, r.bottom];
		const p = m[1].replace(/calc\([^)]*\)/g, (c) => c.replace(/ /g, '~')).split(/\s+/).map((s) => s.replace(/~/g, ' '));
		const [t, ri, b, l] = p.length === 1 ? [p[0], p[0], p[0], p[0]] : p.length === 2 ? [p[0], p[1], p[0], p[1]] : p.length === 3 ? [p[0], p[1], p[2], p[1]] : p;
		return [r.left + Math.max(0, len(l, r.width)), r.top + Math.max(0, len(t, r.height)), r.right - Math.max(0, len(ri, r.width)), r.bottom - Math.max(0, len(b, r.height))];
	};
	const tick = () => {
		const root = document.getElementById('pm-o55-onboarding');
		if (root && !root.hidden) {
			const l = root.querySelector('.o55-pane > .o55-layer:not(.o55-out)');
			const sg = root.querySelector('.o55-stage'), st = sg && sg.__pipStage;
			const fr = { t: Math.round(performance.now()), step: L.step, scr: l ? l.dataset.screen : null, fam: root.dataset.family, mode: root.dataset.mode };
			if (st && st.bubble && !st.dead && st.famName !== 'nier' && st.H) {
				const b = st.bubble, cs = getComputedStyle(b), at = tr(b.style.translate), hp = st.toScreen(st.H), pb = painted(b.getBoundingClientRect(), cs.clipPath);
				fr.say = st.saying || '';
				fr.vis = pb[2] - pb[0] > 0.5 && pb[3] - pb[1] > 0.5 ? 1 : 0;
				fr.shown = +cs.opacity > 0.05 && cs.visibility !== 'hidden' && fr.vis && b.classList.contains('on') && /\S/.test(b.textContent || '') ? 1 : 0;
				fr.off = at && hp ? [Math.round((at[0] - hp[0]) * 10) / 10, Math.round((at[1] - hp[1]) * 10) / 10] : null;
				fr.at = at ? at.map(Math.round) : null; fr.hp = hp ? hp.map(Math.round) : null;
				if (fr.shown) {
					const meet = (a, c) => a[0] < c[2] - 0.5 && a[2] > c[0] + 0.5 && a[1] < c[3] - 0.5 && a[3] > c[1] + 0.5;
					fr.under = [];
					st.root.querySelectorAll('.pst-prop').forEach((p) => {
						const op = +p.getAttribute('opacity'); if (!(op > 0.05)) return;
						const r = p.getBoundingClientRect(), q = [r.left, r.top, r.right, r.bottom];
						if (r.width >= 1 && meet(q, pb)) fr.under.push(`${p.dataset.kind} (opacity ${op.toFixed(2)}) at ${q.map(Math.round)} vs ${pb.map(Math.round)}`);
					});
				}
			}
			L.f.push(fr);
		}
		requestAnimationFrame(tick);
	};
	requestAnimationFrame(tick);
}

const sizes = (t) => String(t.args.sizes || '1694x1000@1,1694x1290@1.5').split(',').map((s, i) => {
	const m = /^(\d+)x(\d+)(?:@([\d.]+))?$/.exec(s.trim()); if (!m) throw new Error(`--set sizes: ${s}`);
	return { w: +m[1], h: +m[2], dpr: +(m[3] || 1), first: i === 0, name: s.trim() };
});
const looksFor = (t, size) => (t.args.looks ? String(t.args.looks).split(',') : size.first ? ['friendly-light', 'retro-dark', 'retro-light', 'basic-light', 'glass-dark'] : ['friendly-light', 'retro-dark']);
const cur = (d) => `#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out) [data-o55-do="${d}"]`;
const quiet = (f) => f.waitForFunction(() => !window.O55.S.vt && !(window.PM_THEME_TRANSITION && window.PM_THEME_TRANSITION.busy && window.PM_THEME_TRANSITION.busy()), null, { timeout: 30000 }).catch(() => {});

export default async function (t) {
	const rests = String(t.args.rests || '120,300,540,700').split(',').map(Number), keep = [];
	let previous = null;
	for (const size of sizes(t)) for (const look of looksFor(t, size)) for (const rest of rests) {
		const [fam, mode] = look.split('-'), label = `${size.name} ${look} rest ${rest}`;
		let guard = null;
		await t.step(label, () => Promise.race([new Promise((_, no) => { guard = setTimeout(() => no(new Error(`${label}: the walk did not end in 120 s`)), 120000); }), (async () => {
			if (previous) await previous.close();
			const opened = await t.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dpr });
			previous = opened.context;
			await t.context.addInitScript(sampler);
			await t.emulate({ reducedMotion: 'no-preference' });
			const f = await t.app.open({ onboarding: true, query: 'o55=fresh', settleMs: 0 });
			await f.waitForSelector('#pm-o55-onboarding .o55-layer[data-screen="welcome"]', { timeout: 60000 });
			await f.waitForFunction(() => { const s = document.querySelector('#pm-o55-onboarding .o55-stage'); return !!(s && s.__pipStage && s.__pipStage.gHead); }, null, { timeout: 60000 });
			await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, mode]); await quiet(f); await t.page.waitForTimeout(3000);
			/* the pointer travels to Start (Pip's wake starts its 650 ms then), rests, and presses */
			const loc = f.locator(cur('start')).first();
			await loc.waitFor({ state: 'visible', timeout: 20000 });
			const b = await loc.boundingBox();
			await t.page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
			await t.page.waitForTimeout(rest);
			await f.evaluate(() => { window.__fo215.step = 'cold Start'; });
			await t.page.mouse.down(); await t.page.waitForTimeout(90); await t.page.mouse.up();
			await t.page.waitForTimeout(4000);
			const F = await f.evaluate(() => window.__fo215.f);
			const seg = F.filter((x) => x.step === 'cold Start' && x.scr === 'look');
			const moves = [], under = [];
			for (let i = 1; i < seg.length; i++) {
				const a = seg[i - 1], c = seg[i];
				if (c.shown && c.under && c.under.length) under.push(`t${c.t}: ${c.under.join('; ')}`);
				if (!(a.shown && c.shown && a.say === c.say && a.off && c.off)) continue;
				const dx = c.off[0] - a.off[0], dy = c.off[1] - a.off[1];
				if (Math.abs(dx) > 12 || Math.abs(dy) > 12) moves.push(`t${c.t} ${dx.toFixed(0)},${dy.toFixed(0)} px (box ${a.at} -> ${c.at}, Pip's head ${a.hp} -> ${c.hp}; "${c.say.slice(0, 24)}")`);
			}
			const first = seg.find((x) => x.shown && x.say), lk = seg.length ? `${seg[0].fam}-${seg[0].mode}` : '-';
			await t.check(`${label}: the cold Start ran in the look asked, the Look line shown (${seg.length} Look frames)`, lk === look && seg.length > 60 && !!first, `look ${lk}, ${seg.length} frames, line ${first ? `first shown at ${first.off} from Pip's head` : 'never shown'}`);
			await t.check(`${label}: kept: the Look line keeps its first place`, moves.length === 0, `${moves.length} moves: ${moves.slice(0, 4).join('; ')}`);
			t.log(`${label}: line first shown at ${first ? first.off : '-'}; ${moves.length} moves; prop under the painted bubble in ${under.length} frames${under.length ? `: ${under.slice(0, 2).join(' | ')}` : ''}`);
			if (t.args.out) keep.push({ size: size.name, look, rest, frames: seg, moves, under });
		})()]).finally(() => clearTimeout(guard)));
	}
	if (t.args.out) fs.writeFileSync(String(t.args.out), JSON.stringify(keep));
}
