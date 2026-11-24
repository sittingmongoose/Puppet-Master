// FO-229 (astra-max-12d A12D-7, 2026-11-16): in Retro Dark and Retro Light, Home's tab selection from Home to Agents blanked
// the chosen tab's label and kind glyph for about 233 ms. FO-197 gave Home's panel strips the shared switcher (glass.js
// STRIPS, '.pmw-strip'): its chip under the labels, and its ink on the pressed tab from the press on. Retro's own selection
// effects (home-redesign 35-retro.js: phosphor, CRT, DOS) still drew on the same tab after the app chose it, so two owners
// painted one face: the effects' phosphor ink on the switcher's phosphor chip, and the switcher's dark press ink on the
// effects' transparent phases. Now the switcher alone paints the chosen tab of a strip it has taken over.
//
// Judged on real pixels, in every frame we can get. A person's press (down, 90 ms, up) on Agents, then on Home, four times
// each, on the strip that holds both tabs. Each press is watched by a CDP screencast (compositor PNG frames) from just before
// the press until it has settled (900 ms); in every frame the two tabs' labels and kind glyphs are read against the same
// parts in the settled frame and the frame before the press (helpers/tab-face-pixels.mjs: a part's glyph pixels are those
// that are glyph in both, FO-236): a part is painted when strictly more than half (> 50%) of each group's settled core
// (a colon's dot, a letter's stroke; core = positions at or above (peak + STRONG) / 2 in the settled frame) reads 1.8:1 or
// more from the frame's ground colour (keeps Windows Chrome 158's five-pixel real press passing while rejecting partial
// paints, dimmed shifts and half-erased glyphs). Expected parts — Home's glyph and Agents' label and glyph — must be
// present before and after every press (Home's icon-only label exception is preserved; FO229-MISSING-PARTS). Every frame
// of every press must paint every part. A screencast keeps only some of the 60 frames a second: the run says how
// many it judged per press, and fails a press with fewer than 8. For every frame, record with
// `--record <file.mp4> --no-pointer-marker` (the pointer ring and press pulse sit on the label) and read the film with
// `node tools/home-retro-tab-face-film-reader.mjs <video> <run folder> <out.json>`, which applies the same rule to every
// native frame between each press's marks, and is the verdict for the films.
//
// The geometry of both tabs (tab, label and glyph boxes, window pixels) is read before each press and after it settles; a
// part that moved more than 1 px is a failure of its own (the reference would not line up). Home's tab shows its glyph only.
//
//   --set looks=retro-dark,retro-light   --set presses=8   --set sandbox=0|1 (run both surfaces)
//   --set film=1 marks each press for a recording and logs FO229-FILM rows for the film reader
//
// Must fail f0f66f2e28 (batch 12e before the fix): blank frames in both looks on both surfaces.
import { setLookBySetting } from '../helpers/settings-look.mjs';
import { decodePng } from '../helpers/activity-cover-pixels.mjs';
import { partMask, partContrast, missingTabParts, PAINTED } from '../helpers/tab-face-pixels.mjs';

const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);
const HOLD = 90, SETTLE = 900, MIN_FRAMES = 8;
const PAGE_TAB = '.title-bar nav.page-tabs .page-tab';

// in the page: the visible strip holding the Home and Agents tabs, marked data-fo229, and its two tabs' boxes
const GEOM = () => {
	const name = (t) => (t.querySelector('.pmw-tlabel') || t).textContent.trim();
	const s = [...document.querySelectorAll('.pmw-strip')].find((x) => x.getClientRects().length && ['Home', 'Agents'].every((n) => [...x.querySelectorAll('.pmw-tablist .pmw-tab')].some((t) => name(t) === n)));
	if (!s) return null;
	s.setAttribute('data-fo229', '');
	const box = (e) => { if (!e) return null; const cs = getComputedStyle(e), b = e.getBoundingClientRect(); return b.width < 2 || b.height < 2 || cs.visibility === 'hidden' || cs.display === 'none' ? null : [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 10) / 10); };
	// a part's box is the box of its text (a Range), not of its element (the label's element is as tall as the tab)
	const textBox = (e) => { if (!box(e)) return null; const r = document.createRange(); r.selectNodeContents(e); const b = r.getBoundingClientRect(); return b.width < 2 ? null : [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 10) / 10); };
	const tabs = {};
	for (const t of s.querySelectorAll('.pmw-tablist .pmw-tab')) {
		const n = name(t); if (n !== 'Home' && n !== 'Agents') continue;
		tabs[n] = { tab: box(t), label: textBox(t.querySelector('.pmw-tlabel')), glyph: textBox(t.querySelector('.pmw-kglyph')) || box(t.querySelector('.pmw-kico svg')), active: t.hasAttribute('data-active') };
	}
	return { tabs, lensed: s.hasAttribute('data-lg-lensed'), theme: document.documentElement.getAttribute('data-theme') };
};

async function offset(t, f) {
	if (f === t.page.mainFrame()) return { x: 0, y: 0 };
	const b = await (await f.frameElement()).boundingBox(); return { x: b.x, y: b.y };
}
const shift = (b, o) => (b ? [b[0] + o.x, b[1] + o.y, b[2], b[3]] : null);
const moved = (a, b) => (!a || !b ? !!a !== !!b : a.some((v, i) => Math.abs(v - b[i]) > 1));

export const tests = {
	async 'FO-229 Retro Home tab selection keeps the chosen tab\'s label and glyph painted in every frame'(t) {
		await t.viewport(1920, 1080);
		await t.emulate({ reducedMotion: 'no-preference' });
		const looks = list(t.args.looks, ['retro-dark', 'retro-light']), presses = Number(t.args.presses || 8);
		const cdp = t.run?.tabCapture ? null : await t.page.context().newCDPSession(t.page);
		if (!(await t.check('a compositor screencast is available (not the Mac recorder)', !!cdp, 'the Mac recorder freezes screencast frames: run on the VM, Nas1 or Windows'))) return;
		let frames = null;
		cdp.on('Page.screencastFrame', (e) => { cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); if (frames) frames.push({ wall: e.metadata.timestamp * 1000, data: e.data }); });
		for (const look of looks) {
			const f = await t.app.open();
			await f.locator(PAGE_TAB).nth(5).click(); await t.page.waitForTimeout(1500);
			await setLookBySetting(t, f, look);
			await f.locator(PAGE_TAB).nth(0).click(); await t.page.waitForTimeout(1600);
			const off = await offset(t, f);
			const g0 = await f.evaluate(GEOM);
			if (!(await t.check(`${look}: Home shows a panel strip with the Home and Agents tabs, taken over by the switcher`, !!g0 && !!g0.tabs.Home && !!g0.tabs.Home.tab && !!g0.tabs.Agents && !!g0.tabs.Agents.tab && g0.lensed && g0.theme === look, JSON.stringify(g0)))) continue;
			const blanks = [], thin = [], unread = [], shifted = [], wrong = [], counts = [], perPress = [], kept = {};
			let lowest = null;
			for (let i = 0; i < presses; i++) {
				const name = i % 2 ? 'Home' : 'Agents', tag = `${look} ${i + 1} ${name}`;
				const before = await f.evaluate(GEOM);
				if (!before || !before.tabs[name] || !before.tabs[name].tab) { unread.push(`${tag}: ${name} tab missing (before press)`); continue; }
				const tb = shift(before.tabs[name].tab, off), cx = tb[0] + Math.min(tb[2] - 6, Math.max(6, tb[2] / 2)), cy = tb[1] + tb[3] / 2;
				await t.page.mouse.move(cx, cy);
				frames = [];
				let rest = null;
				await t.unmarked(async () => {
					await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: 1920, maxHeight: 1080 });
					for (let k = 0; k < 60 && !frames.length; k++) await t.page.waitForTimeout(25);
					const w0 = Date.now() - 5;
					if (t.args.film) await t.mark(`press ${tag}`);
					await t.page.mouse.down(); await t.page.waitForTimeout(HOLD); await t.page.mouse.up();
					await t.page.waitForTimeout(SETTLE);
					if (t.args.film) await t.mark(`settled ${tag}`);
					await cdp.send('Page.stopScreencast').catch(() => {});
					// the first frame the screencast sent came before the press was sent: the parts at rest, before (FO-236)
					rest = frames.length ? frames.reduce((p, q) => (q.wall < p.wall ? q : p)).data : null;
					frames = frames.filter((x) => x.wall >= w0).sort((p, q) => p.wall - q.wall).map((x) => ({ wall: x.wall - w0, data: x.data }));
				});
				const got = frames; frames = null;
				const after = await f.evaluate(GEOM);
				if (!after || !after.tabs[name] || !after.tabs[name].active) wrong.push(tag);
				if (t.args.film) t.log('FO229-FILM ' + JSON.stringify({ look, i: i + 1, name, off, before: before.tabs, after: after ? after.tabs : null }));
				for (const [when, tabs] of [['before', before.tabs], ['after', after && after.tabs]]) {
					for (const miss of missingTabParts(tabs)) unread.push(`${tag}: ${miss} missing (${when} press)`);
				}
				for (const n of ['Home', 'Agents']) for (const part of ['label', 'glyph']) if (moved(before.tabs[n]?.[part], after?.tabs?.[n]?.[part])) shifted.push(`${tag}: ${n} ${part} ${JSON.stringify(before.tabs[n]?.[part])} -> ${JSON.stringify(after?.tabs?.[n]?.[part])}`);
				counts.push(got.length);
				if (got.length < MIN_FRAMES) { thin.push(`${tag}: ${got.length}`); continue; }
				const imgs = got.map((x) => ({ wall: x.wall, img: decodePng(Buffer.from(x.data, 'base64')) }));
				const ref = imgs[imgs.length - 1].img, pre = decodePng(Buffer.from(rest, 'base64'));
				const masks = [];
				for (const n of ['Home', 'Agents']) for (const part of ['label', 'glyph']) {
					const b = shift(after?.tabs?.[n]?.[part], off); if (!b) continue;
					const m = partMask(ref, b, pre); m.name = `${n} ${part}`;
					if (!m.ok) { unread.push(`${tag}: ${m.name} (${m.g.length} glyph px in both the settled frame and the one before the press, ${m.groupsKept}/${m.groupsSettled} of its dot and stroke groups kept)`); continue; }
					masks.push(m);
					// how many glyph pixels each part keeps in both frames, of those in the settled frame (FO-236)
					const k = kept[m.name] || (kept[m.name] = { lo: Infinity, hi: 0, of: [] });
					k.lo = Math.min(k.lo, m.g.length); k.hi = Math.max(k.hi, m.g.length); k.of.push(m.gSettled);
				}
				const had = blanks.length;
				for (const { wall, img } of imgs) for (const m of masks) {
					const r = partContrast(img, m);
					if (!lowest || r.c < lowest.c) lowest = { c: r.c, at: `${tag} +${Math.round(wall)}ms ${m.name}` };
					if (r.c < PAINTED) blanks.push(`${tag} +${Math.round(wall)}ms ${m.name} ${r.c}:1 ink ${r.ink} on ${r.ground}`);
				}
				perPress.push(blanks.length - had);
			}
			t.log(`${look}: screencast frames judged per press ${counts.join(',')}; blank part-frames per press ${perPress.join(',')}; lowest part contrast ${lowest ? `${lowest.c}:1 at ${lowest.at}` : 'none'}`);
			const ks = Object.entries(kept);
			t.log(`${look}: glyph pixels kept in both frames per part (of the settled frame's) ${ks.map(([n, k]) => `${n} ${k.lo}-${k.hi} (of ${Math.min(...k.of)}-${Math.max(...k.of)})`).join(', ')}; smallest ${ks.length ? Math.min(...ks.map(([, k]) => k.lo)) : 'none'}`);
			await t.check(`${look}: every press chose its tab (${presses - wrong.length}/${presses})`, wrong.length === 0, wrong.join(' | '));
			await t.check(`${look}: each press gave at least ${MIN_FRAMES} screencast frames to judge`, thin.length === 0, thin.join(' | '));
			await t.check(`${look}: every label and glyph has glyph pixels in its settled frame`, unread.length === 0, unread.join(' | '));
			await t.check(`${look}: no label or glyph moved between the press and the settle (1 px)`, shifted.length === 0, shifted.slice(0, 6).join(' | '));
			await t.check(`${look}: every frame paints both tabs' labels and glyphs (${blanks.length} blank part-frames, ${PAINTED}:1)`, blanks.length === 0, blanks.slice(0, 8).join(' | '));
			await t.app.resetLayout();
		}
	}
};
