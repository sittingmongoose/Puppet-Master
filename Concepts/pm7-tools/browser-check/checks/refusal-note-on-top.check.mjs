// FO87-N1: the refusal note a disabled Continue shows is on top of the screen, in every frame, the screen's entry
// included. On f242ccd473 the note was the footer's child and the scroller ranked above the footer (FO-87): while the
// footer faded in (.o55-entering, up to about a second) the footer was a stacking context under the scroller and the
// scroller's words painted over the note. Cases, on AI (no AI added) and on Name (no name): a real press on the disabled
// Continue as soon as it can be hit during the screen's entry, and a real double-click on the Continue of the screen
// before it (Begin with New chosen, Creating once done), the second click landing on the new screen's disabled Continue
// during its entry. Each frame the note shows (opacity over 0.3) it must be the top box at its centre and four inset
// points (the note alone takes the pointer for the read); one capture taken during the entry must show the note's own
// paint (at least 85% of its box in its own ground or ink); and, settled, it keeps the place it had as the footer's
// child: 7 px over the footer's top rule, 22 px from the layer's right. Ten looks, 1920x1080 and 1280x500, both
// surfaces, normal motion (`--set motion=` for more).
//   --set size=1280x500   --set look=basic-light   --set screen=ai,name   --set route=press,double
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[1920, 1080], [1280, 500]];
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const LAYER = '#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)';

/* in the page: sample every frame for ms after a press; the note alone takes the pointer for each read */
const SAMPLE = async (ms) => {
	const out = []; const t0 = performance.now();
	while (performance.now() - t0 < ms) {
		await new Promise((r) => requestAnimationFrame(r));
		const layer = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'), rs = layer && layer.querySelector('.o55-reason.o55-reason-show');
		if (!rs) continue;
		const op = +getComputedStyle(rs).opacity; if (op <= 0.3) continue;
		const q = rs.getBoundingClientRect(), pts = [[0.5, 0.5], [0.12, 0.25], [0.88, 0.25], [0.12, 0.75], [0.88, 0.75]].map(([a, b]) => [q.left + a * q.width, q.top + b * q.height]);
		const old = rs.style.pointerEvents; rs.style.pointerEvents = 'auto';
		const lost = pts.map(([x, y]) => document.elementFromPoint(x, y)).filter((e) => !(e && rs.contains(e))).map((e) => e && (e.tagName.toLowerCase() + '.' + String(e.className?.baseVal ?? e.className).split(' ')[0]));
		rs.style.pointerEvents = old;
		out.push({ t: Math.round(performance.now() - t0), entering: layer.classList.contains('o55-entering'), op: +op.toFixed(2), lost });
	}
	return { frames: out.length, entering: out.filter((x) => x.entering).length, under: out.filter((x) => x.lost.length), firstUnder: out.find((x) => x.lost.length) || null };
};

async function cell(t, surface, w, h) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.viewport(w, h);
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.O55?.S?.open, null, { timeout: 30000 });
	const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
	const prim = () => f.evaluate((L) => { const b = document.querySelector(L + ' .o55-foot .o55-primary'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, disabled: b.getAttribute('aria-disabled') === 'true', screen: O55.S.sess.screen }; }, LAYER);
	const settle = () => f.waitForFunction(() => !document.querySelector('#pm-o55-onboarding .o55-layer.o55-entering, #pm-o55-onboarding .o55-layer.o55-out') && !O55.nierLook.busy() && !document.getElementById('o55np-reboot'), null, { timeout: 15000 }).catch(() => {});
	for (const motion of list(t.args.motion, ['no-preference'])) {
		await t.emulate({ reducedMotion: motion === 'attribute' ? 'no-preference' : motion });
		for (const look of list(t.args.look, LOOKS)) {
			await t.page.mouse.move(2, 2);
			await f.evaluate(([fam, mode, m]) => { document.documentElement.setAttribute('data-motion', m === 'attribute' ? 'reduced' : 'full'); O55.S.lookOpen = false; O55.ui.applyLook(fam, mode); }, [...look.split('-'), motion]);
			await f.waitForTimeout(1600); await settle();
			for (const screen of list(t.args.screen, ['ai', 'name'])) {
				for (const route of list(t.args.route, ['press', 'double'])) {
					const tag = `${screen} ${route} ${look} ${motion} ${surface} ${w}x${h}`;
					await t.page.mouse.move(2, 2);
					let landed = null;
					if (route === 'press') {
						await f.evaluate((s) => { if (s === 'name') O55.S.draft().project_name = ''; O55.ui.go(s, { noHistory: true }); }, screen);
						landed = await f.waitForFunction((L) => { const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer.o55-entering:not(.o55-out)'), b = l && l.querySelector('.o55-foot .o55-primary'); if (!b) return null; const r = b.getBoundingClientRect(), e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e && b.contains(e) ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null; }, LAYER, { timeout: 4000, polling: 'raf' }).then((hd) => hd.jsonValue(), () => null);
						if (landed) await t.page.mouse.click(off.x + landed.x, off.y + landed.y);
					} else {
						/* the screen before, its Continue ready, then two real clicks 150 ms apart (the second a double-click's) */
						if (screen === 'name') {
							await f.evaluate(() => { O55.S.draft().project_name = ''; O55.ui.go('begin', { noHistory: true }); });
							await settle(); await f.waitForTimeout(300);
							await f.locator(LAYER + ' .o55-card[data-arg="new"]').first().click(); await f.waitForTimeout(400);
						} else {
							await f.evaluate(() => { O55.S.sess.commit = Object.assign(O55.S.sess.commit || {}, { state: 'done' }); O55.S.sess.backup = Object.assign(O55.S.sess.backup || {}, { dest: null }); O55.ui.go('creating', { noHistory: true }); });
							await f.waitForFunction((L) => { const b = document.querySelector(L + ' .o55-foot .o55-primary'); return O55.S.sess.screen === 'creating' && b && b.getAttribute('aria-disabled') !== 'true'; }, LAYER, { timeout: 15000 }).catch(() => {});
							await settle();
						}
						const p = await prim();
						if (p && !p.disabled) {
							landed = p;
							await t.page.mouse.click(off.x + p.x, off.y + p.y); await t.page.waitForTimeout(150); await t.page.mouse.click(off.x + p.x, off.y + p.y, { clickCount: 2 });
						}
					}
					await t.check(`FO87-N1 fixture: the route reaches the screen's disabled Continue ${tag}`, !!landed, JSON.stringify(landed));
					if (!landed) { await settle(); continue; }
					/* sample every frame, and one capture during the entry */
					const sampling = f.evaluate(SAMPLE, 1700);
					const shot = await f.waitForFunction((L) => { const l = document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer:not(.o55-out)'), rs = l && l.querySelector('.o55-reason.o55-reason-show'); return rs && l.classList.contains('o55-entering') && +getComputedStyle(rs).opacity > 0.97 ? true : null; }, LAYER, { timeout: 1500, polling: 'raf' }).then(() => true, () => false);
					let paint = null;
					if (shot) {
						const note = f.locator(LAYER + ' .o55-reason.o55-reason-show');
						const colors = await note.evaluate((e) => { const s = getComputedStyle(e), rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number); return { ground: rgb(s.backgroundColor), ink: rgb(s.color) }; });
						const img = await t.pixels(note);
						const still = await f.evaluate((L) => !!document.querySelector(L.replace(':not(.o55-out)', '.o55-entering:not(.o55-out)')), LAYER);
						let own = 0; const n = img.data.length / 4;
						for (let i = 0; i < n; i++) { const px = [img.data[4 * i], img.data[4 * i + 1], img.data[4 * i + 2]]; const near = (c) => Math.max(...c.map((v, k) => Math.abs(v - px[k]))) <= 48; if (near(colors.ground) || near(colors.ink)) own++; }
						paint = { share: +(own / n).toFixed(3), duringEntry: still, px: n };
					}
					const s = await sampling;
					const screenNow = await f.evaluate(() => O55.S.sess.screen);
					await t.check(`FO87-N1 the refusal note is on top in every frame it shows, entry included ${tag}`, screenNow === screen && s.frames >= 3 && s.under.length === 0, JSON.stringify({ screenNow, frames: s.frames, entering: s.entering, under: s.under.length, firstUnder: s.firstUnder }));
					await t.check(`FO87-N1 the note's own paint shows during the entry ${tag}`, !shot || (paint && (!paint.duringEntry || paint.share >= 0.85)), JSON.stringify({ shot, paint }));
					await settle();
					/* settled: the note's place, as before: 7 px over the footer's top rule, 22 px from the right */
					const place = await f.evaluate((L) => { const l = document.querySelector(L), rs = l && l.querySelector('.o55-reason'), ft = l && l.querySelector('.o55-foot'); if (!rs || !ft) return null; const q = rs.getBoundingClientRect(), fr = ft.getBoundingClientRect(), lr = l.getBoundingClientRect(), st = getComputedStyle(rs).transform, m = new DOMMatrix(st === 'none' ? undefined : st); /* (its own slide in and out left out) */ return { gapToFooter: +(fr.top - (q.bottom - m.m42)).toFixed(2), rightInset: +(lr.right - (q.right - m.m41)).toFixed(2), transform: st }; }, LAYER);
					await t.check(`FO87-N1 the note keeps its place over the footer ${tag}`, !!place && Math.abs(place.gapToFooter - 7) < 0.6 && Math.abs(place.rightInset - 22) < 0.6, JSON.stringify(place));
					await f.waitForTimeout(2700);
				}
			}
		}
	}
	await f.evaluate(() => document.documentElement.setAttribute('data-motion', 'full'));
	await t.emulate({ reducedMotion: 'no-preference' });
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) for (const [w, h] of SIZES) {
	tests[`FO87-N1 refusal note on top ${surface} ${w}x${h}`] = async (t) => {
		if (t.args.size && !list(t.args.size, []).includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
		return cell(t, surface, w, h);
	};
}
