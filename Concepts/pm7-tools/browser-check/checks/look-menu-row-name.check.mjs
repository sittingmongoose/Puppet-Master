// FO-90: a Look-menu row keeps its name readable while the pointer is on the row's ? (hovered, and held down). Under
// NieR's cursor part a hovered row turns into an ink bar; the option inside took the bar's paper ink only when the
// option itself was hovered, so with the pointer on the ? the name stayed ink on ink, unseen (611e505ecf). For every row
// but the chosen one (and Adjust NieR's under NieR), a real pointer on its ?, then held down: the row's name, read from
// painted pixels, must show strokes that stand off its ground (at least 3% of its box more than 60 luminance levels from
// the box's most common level), and t.painted must find it drawn. The held press's click is held back from the page, so
// no note opens between rows. Ten looks, 1920x1080 and 740x768, both motion preferences, both surfaces; the editor closed,
// and under NieR once more over Adjust NieR's editor.
//   --set size=1920x1080   --set look=nier-light   --set motion=no-preference
import { LOOKS } from '../browser-check.config.mjs';

const SIZES = [[1920, 1080], [740, 768]];
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
				const rows = await f.evaluate(() => [...document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu:not(.o55-opt-on):not(.o55-lookmoderow)')].map((r, i) => { r.__fo90 = i; return { i, arg: r.querySelector('.o55-lookopt')?.getAttribute('data-arg') || '', hasQ: !!r.querySelector(':scope > .o55-tipq') }; }));
				const bad = [], seen = [];
				for (const row of rows.filter((r) => r.hasQ)) {
					const q = await f.evaluate((i) => { const r = [...document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu')].find((n) => n.__fo90 === i), b = r.querySelector(':scope > .o55-tipq'); b.scrollIntoView({ block: 'nearest' }); const q = b.getBoundingClientRect(); return { x: q.x + q.width / 2, y: q.y + q.height / 2 }; }, row.i);
					const name = f.locator('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu:not(.o55-opt-on):not(.o55-lookmoderow) .o55-lookname').nth(rows.indexOf(row));
					await t.page.mouse.move(off.x + q.x, off.y + q.y); await f.waitForTimeout(300);
					const hover = { ...strokes(await t.pixels(name)), rowHovered: await f.evaluate((i) => [...document.querySelectorAll('#pm-o55-onboarding .o55-lookmenu .o55-opt-menu')].find((n) => n.__fo90 === i).matches(':hover'), row.i) };
					await f.evaluate(() => { window.__fo90 = true; });
					await t.page.mouse.down(); await f.waitForTimeout(250);
					const press = strokes(await t.pixels(name));
					const painted = await t.painted(name, `FO-90 a row's name is drawn while its ? is held ${row.arg} ${tag}`);
					await t.page.mouse.up(); await f.waitForTimeout(120);
					await f.evaluate(() => { window.__fo90 = false; });
					seen.push({ row: row.arg, hover, press });
					if (!hover.rowHovered || hover.share < 0.03 || press.share < 0.03 || !painted) bad.push({ row: row.arg, hover, press, painted });
					await t.page.mouse.move(2, 2); await f.waitForTimeout(150);
				}
				await t.check(`FO-90 every row's name stays visible with the pointer on its ? (hovered and held) ${tag}`, rows.filter((r) => r.hasQ).length >= 4 && !bad.length, JSON.stringify({ bad, seen }));
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
