// FO-90 / FO90-N1: a Look-menu row keeps its name and its ? readable in every state. Under NieR's cursor part a chosen or
// hovered row is an ink bar. On 611e505ecf the option inside took the bar's paper ink only when the option itself was
// hovered, so with the pointer on the ? the name stayed ink on ink; on 6970c8c6e9 the ? under the pointer drew in NieR's
// accent ink on the bar; and on f242ccd473 the bar's paper ? lost to NieR's own ? rule, so the chosen row's ?, and a
// hovered row's with the pointer on its name, drew ink on the bar. For every row with a name and a ?, the chosen one
// included (and Adjust NieR's under NieR), in six states (at rest; pointer on its name; held on its name; pointer on its
// ?; held on its ?; keyboard focus on its ?, reached by Tab), the row's name and its ? are read from painted pixels:
// each must show strokes standing off its ground (at least 3% of its box more than 60 luminance levels from the box's
// most common level); t.painted must find the name drawn while the ? is held. Held presses' clicks are held back from
// the page, so nothing is picked and no note opens. Ten looks, 1920x1080 and 740x768, both motion preferences, both
// surfaces; the editor closed, and under NieR once more over Adjust NieR's editor.
//   --set size=1920x1080   --set look=nier-light   --set motion=no-preference
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[1920, 1080], [740, 768]];
// T73 (tool batch 5; opus-recheck-b7f K-A2): the ? was read by its whole box, whose 1 px border alone gives about 0.2 of
// the share on an 18 px box, so a ? whose glyph had gone ink on ink inside a border that stayed would pass. Its glyph is
// now also read on its own, inside the border (the box inset by its border width and 1.5 px), and must reach GLYPH_MIN
// (the real page's least is 0.11). --set selftest=q-glyph-gone draws every ? glyph transparent with its border kept, and
// must fail.
const GLYPH_MIN = 0.05;
const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);

function strokes(img) {
	const { data } = img, n = data.length / 4, hist = new Map(), lum = new Float32Array(n);
	for (let i = 0; i < n; i++) { const l = 0.2126 * data[4 * i] + 0.7152 * data[4 * i + 1] + 0.0722 * data[4 * i + 2]; lum[i] = l; const k = Math.round(l / 4); hist.set(k, (hist.get(k) || 0) + 1); }
	let mode = 0, best = -1; for (const [k, c] of hist) if (c > best) { best = c; mode = k * 4; }
	let off = 0; for (let i = 0; i < n; i++) if (Math.abs(lum[i] - mode) > 60) off++;
	return { share: +(off / n).toFixed(3), ground: Math.round(mode), px: n };
}

async function cell(t, surface, w, h) {
	if (!t.app.surfaces().includes(surface)) { t.log(`skipped: the sandbox switch leaves out the ${surface} surface`); return; }
	await t.viewport(w, h);
	const f = await t.app.open({ onboarding: true, query: 'o55=fresh', sandbox: surface === 'sandbox' });
	await f.waitForFunction(() => window.O55?.S?.open && !!document.querySelector('#pm-o55-onboarding .o55-lookbtn'), null, { timeout: 30000 });
	const fe = f === t.page.mainFrame() ? null : await f.frameElement(), off = fe ? await fe.boundingBox() : { x: 0, y: 0 };
	if (t.args.selftest === 'q-glyph-gone') await f.evaluate(() => { const st = document.createElement('style'); st.textContent = '#pm-o55-onboarding .o55-lookmenu .o55-tipq, #pm-o55-onboarding .o55-lookmenu .o55-tipq * { -webkit-text-fill-color: transparent !important; }'; document.head.appendChild(st); });
	await f.evaluate(() => { window.__fo90 = false; window.addEventListener('click', (e) => { if (!window.__fo90) return; e.stopImmediatePropagation(); e.preventDefault(); }, true); });
	for (const motion of list(t.args.motion, ['no-preference', 'reduce'])) {
		await t.emulate({ reducedMotion: motion === 'attribute' ? 'no-preference' : motion });
		for (const look of list(t.args.look, LOOKS)) {
			for (const editor of look.startsWith('nier') ? [false, true] : [false]) {
				const tag = `${look} ${motion} ${surface} ${w}x${h}${editor ? ' editor' : ''}`;
				await t.page.mouse.move(2, 2);
				await f.evaluate(([fam, mode, m]) => { O55.nierLook.closePanel({ silent: true }); if (O55.S.lookOpen) { O55.S.lookOpen = false; O55.ui.refresh(); } O55.S.tip = null; document.documentElement.setAttribute('data-motion', m === 'attribute' ? 'reduced' : 'full'); O55.ui.applyLook(fam, mode); }, [...look.split('-'), motion]);
				await f.waitForTimeout(1600);
				await f.waitForFunction(() => !O55.nierLook.busy() && !document.getElementById('o55np-reboot'), null, { timeout: 15000 }).catch(() => {});
				await f.evaluate((ed) => { O55.ui.go('look', { noHistory: true }); if (ed) O55.nierLook.adjust(); }, editor);
				await f.waitForTimeout(editor ? 1200 : 500);
				await f.locator('#pm-o55-onboarding .o55-head .o55-lookbtn').click();
				await f.waitForFunction(() => O55.S.lookOpen && !!document.querySelector('#pm-o55-onboarding .o55-lookmenu'), null, { timeout: 5000 });
				await f.evaluate(async () => { const m = document.querySelector('#pm-o55-onboarding .o55-lookmenu'); await Promise.all(m.getAnimations({ subtree: true }).filter((a) => Number.isFinite(a.effect.getComputedTiming().endTime)).map((a) => a.finished.catch(() => {}))); });
				/* every row with a name and a ?, the chosen one included (Adjust NieR's under NieR); the mode row is not a bar */
				const rows = await f.evaluate(() => [...document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu:not(.o55-lookmoderow)')].map((r, i) => { r.__fo90 = i; return { i, arg: r.querySelector('.o55-lookopt')?.getAttribute('data-arg') || '', chosen: r.classList.contains('o55-opt-on'), hasQ: !!r.querySelector(':scope > .o55-tipq') }; }).filter((r) => r.hasQ));
				/* the row's name and ? as window rects (pixels are read from the window) */
				const rects = (i) => f.evaluate((i) => { const r = [...document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu')].find((n) => n.__fo90 === i); r.scrollIntoView({ block: 'nearest' }); const box = (e) => { const q = e.getBoundingClientRect(); return { x: q.x, y: q.y, width: q.width, height: q.height }; }; const n = r.querySelector('.o55-lookname'), q = r.querySelector(':scope > .o55-tipq'), cs = getComputedStyle(q), bw = Math.max(...['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs[`border${k}Width`]) || 0)) + 1.5, qb = box(q); return { name: box(n), q: qb, qGlyph: { x: qb.x + bw, y: qb.y + bw, width: Math.max(1, qb.width - 2 * bw), height: Math.max(1, qb.height - 2 * bw) }, opt: box(r.querySelector('.o55-lookopt')) }; }, i);
				const win = (b) => ({ x: off.x + b.x, y: off.y + b.y, width: b.width, height: b.height });
				const read = async (rc) => ({ name: strokes(await t.pixels(win(rc.name))), q: strokes(await t.pixels(win(rc.q))), glyph: strokes(await t.pixels(win(rc.qGlyph))) });
				const bad = [], seen = [];
				for (const row of rows) {
					const rc = await rects(row.i), at = (b, dx) => ({ x: off.x + b.x + (dx == null ? b.width / 2 : dx), y: off.y + b.y + b.height / 2 });
					const states = {};
					await t.page.mouse.move(2, 2); await f.waitForTimeout(200);
					states.rest = await read(rc);
					const onName = at(rc.name, Math.min(8, rc.name.width / 2));
					await t.page.mouse.move(onName.x, onName.y); await f.waitForTimeout(300);
					states.nameHover = await read(rc);
					await f.evaluate(() => { window.__fo90 = true; });
					await t.page.mouse.down(); await f.waitForTimeout(250);
					states.namePress = await read(rc);
					await t.page.mouse.up(); await f.waitForTimeout(120);
					const onQ = at(rc.q);
					await t.page.mouse.move(onQ.x, onQ.y); await f.waitForTimeout(300);
					states.qHover = await read(rc);
					await t.page.mouse.down(); await f.waitForTimeout(250);
					states.qPress = await read(rc);
					const painted = await t.painted(win(rc.name), `FO-90 a row's name is drawn while its ? is held ${row.arg} ${tag}`);
					await t.page.mouse.up(); await f.waitForTimeout(120);
					await f.evaluate(() => { window.__fo90 = false; });
					/* keyboard: the row's option focused, then Tab to its ? (a real key, so :focus-visible) */
					await t.page.mouse.move(2, 2); await f.waitForTimeout(150);
					await f.evaluate((i) => [...document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu')].find((n) => n.__fo90 === i).querySelector('.o55-lookopt').focus(), row.i);
					await t.page.keyboard.press('Tab'); await f.waitForTimeout(200);
					const onQFocus = await f.evaluate((i) => { const q = [...document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu')].find((n) => n.__fo90 === i).querySelector(':scope > .o55-tipq'); return document.activeElement === q && q.matches(':focus-visible'); }, row.i);
					states.qFocus = { ...(await read(rc)), focused: onQFocus };
					const lost = Object.entries(states).filter(([k, v]) => v.name.share < 0.03 || v.q.share < 0.03 || v.glyph.share < GLYPH_MIN || (k === 'qFocus' && !v.focused)).map(([k]) => k);
					seen.push({ row: row.arg, chosen: row.chosen, states: Object.fromEntries(Object.entries(states).map(([k, v]) => [k, [v.name.share, v.q.share, v.glyph.share]])) });
					if (lost.length || !painted) bad.push({ row: row.arg, chosen: row.chosen, lost, painted, states });
				}
				await t.page.mouse.move(2, 2);
				await t.check(`FO-90 every row's name and ? stay visible at rest, pointer on name or ?, held, keyboard focus, chosen included ${tag}`, rows.length >= 5 && rows.some((r) => r.chosen) && !bad.length, JSON.stringify({ bad, seen }));
				if (t.args.shots && list(t.args.shots, []).includes(look) && seen.length) {
					const q = await f.evaluate(() => { const b = document.querySelector('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu:not(.o55-opt-on):not(.o55-lookmoderow) > .o55-tipq'), r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
					await t.page.mouse.move(off.x + q.x, off.y + q.y); await f.waitForTimeout(300);
					await t.crop(`${look}-${motion}-${surface}-${w}x${h}${editor ? '-editor' : ''}-row-q-hover`, f.locator('#pm-o55-onboarding .o55-lookmenu'), 'FO-90: the hovered row\'s name stays readable on its bar with the pointer on its ?');
					await t.page.mouse.move(2, 2);
				}
			}
		}
	}
	await f.evaluate(() => { O55.nierLook.closePanel({ silent: true }); O55.S.lookOpen = false; document.documentElement.setAttribute('data-motion', 'full'); });
	await t.emulate({ reducedMotion: 'no-preference' });
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) for (const [w, h] of SIZES) {
	tests[`FO-90 row name on ? ${surface} ${w}x${h}`] = async (t) => {
		if (t.args.size && !list(t.args.size, []).includes(`${w}x${h}`)) { t.log(`skipped: --set size leaves out ${w}x${h}`); return; }
		return cell(t, surface, w, h);
	};
}
