// FO-253 (Jared, 2026-11-28, relayed by pm7-build: "I decided on hide the live app behind the onboarding weeks ago. I
// said to hide it. Do that."; pm7-perf README decision 2): while the onboarding window is open the live app is not drawn
// behind it, on every computer and in every look; the dim lies over the plain page background. Every redraw of Pip made
// Chrome re-sort the whole page's layers, three quarters of them the dimmed app's. Until now only a computer that could
// not composite the app at full rate got this (data-o55-solid, 60-ui-core.js); a fast one kept the dimmed live app.
// By the app's own controls: Settings' Theme and "Light or dark" rows set the look (helpers/settings-look.mjs), Settings
// Home's Run Onboarding Again opens the window, its close button closes it. Per look and surface:
// (1) open: html carries data-o55-solid, every part of the app beneath (body > [data-o55-held]) computes visibility
//     hidden, and no element inside it draws anyway (a descendant set back to visibility: visible would show through);
//     the look painted is the look set; logged: whether the browser renders in software and O55.solid.get();
// (2) pixels under the dim: a strip of the screen left of the window (where the Activity bar and the Files panel are)
//     carries no edges (under 0.2 % of its pixels differ from a neighbour by more than 24 levels), while the same strip
//     with the window closed is the app's, with edges (at least 1 %);
// (3) close: the app is back: no data-o55-solid, no held or inert mark left, every part visible, the same tab, look,
//     Settings scroll and layout boxes as before the open (no layout shift, no lost state), and the strip's edges back
//     within a few percent of before;
// (4) no flash: in every frame from the close press until 600 ms after the window is gone, the app is never hidden
//     while the scrim is less than fully dim (a hidden app under a fading scrim would flash the bare background).
// Default looks Basic Dark and Glass Dark (--set looks=basic-light,glass-light,... picks), both surfaces, and Basic Dark
// once under Reduced Motion (--set extra=0 leaves it out). Fails on main from 2026-11-28 on a GPU computer: rows (1)
// and (2) (the dimmed live app is drawn); passes on the FO-253 branch.
import { setLookBySetting } from '../helpers/settings-look.mjs';
import { decodePng } from '../helpers/activity-cover-pixels.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DEFAULT_LOOKS = ['basic-dark', 'glass-dark'];

/* the app's state a close must give back unchanged */
const STATE = () => {
	const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
	const sel = ['#tab-settings', '.page-tabs .page-tab.active', '#pm-settings-root', '#settings-document', '.left-panel', 'aside.domain-rail', '[data-action="replay-onboarding"]'];
	const sc = (() => { const all = [...document.querySelectorAll('#pm-settings-root *')].filter((el) => el.scrollHeight - el.clientHeight > 40 && /auto|scroll/.test(getComputedStyle(el).overflowY) && el.getClientRects().length); all.sort((a, b) => b.clientHeight - a.clientHeight); return all[0] || null; })();
	return {
		theme: document.documentElement.getAttribute('data-theme') || '',
		tab: (document.querySelector('.page-tabs .page-tab.active') || {}).id || (document.querySelector('.page.active') || {}).id || '',
		scroll: sc ? Math.round(sc.scrollTop) : null,
		boxes: Object.fromEntries(sel.map((s) => [s, box(document.querySelector(s))])),
	};
};
/* while open: what the window has done to the app beneath */
const OPEN_STATE = () => {
	const held = [...document.querySelectorAll('body > [data-o55-held]')];
	window.__fo253held = held.filter((n) => (window.__fo253shown || []).includes(n));
	/* an element that would draw something: text of its own, a picture, a ground, a border or a shadow */
	const paints = (el, cs) => {
		if (/^(IMG|SVG|CANVAS|VIDEO|svg|INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName)) return true;
		if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return true;
		if (cs.backgroundImage !== 'none') return true;
		const bg = cs.backgroundColor; if (bg && bg !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(bg)) return true;
		if (cs.boxShadow !== 'none' || cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) return true;
		return ['Top', 'Right', 'Bottom', 'Left'].some((k) => parseFloat(cs['border' + k + 'Width']) > 0 && cs['border' + k + 'Style'] !== 'none');
	};
	let leaks = 0, quiet = 0; const leakAt = [], quietAt = [];
	for (const root of held) {
		if (getComputedStyle(root).visibility !== 'hidden') continue;
		for (const el of root.querySelectorAll('*')) {
			const cs = getComputedStyle(el);
			if (cs.visibility !== 'visible') continue;
			const r = el.getBoundingClientRect();
			if (r.width < 1 || r.height < 1) continue;
			const name = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
			if (paints(el, cs)) {
				leaks++;
				if (leakAt.length < 6) {
					const chain = []; for (let a = el; a && a !== document.documentElement; a = a.parentElement) chain.push((a.id ? '#' + a.id : a.tagName.toLowerCase()) + ':' + getComputedStyle(a).visibility + (a.hasAttribute('data-o55-held') ? '[held]' : ''));
					leakAt.push(`${name} {${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} bg ${cs.backgroundColor} op ${cs.opacity} inline-vis "${el.style.visibility}"} up: ${chain.slice(0, 5).join(' < ')}`);
				}
			}
			else { quiet++; if (quietAt.length < 6) quietAt.push(name + ' (' + el.childElementCount + ' children)'); }
		}
	}
	const win = document.querySelector('#pm-o55-onboarding .o55-win');
	const wr = win ? win.getBoundingClientRect() : null;
	let soft = null; try { soft = !!O55.motion.softwareRendered(); } catch (_) {}
	let solid = null; try { solid = O55.solid.get(); } catch (_) {}
	return {
		solidAttr: document.documentElement.hasAttribute('data-o55-solid'),
		held: held.length,
		hiddenHeld: held.filter((n) => getComputedStyle(n).visibility === 'hidden').length,
		leaks, leakAt, quiet, quietAt,
		theme: document.documentElement.getAttribute('data-theme') || '',
		win: wr ? { left: Math.round(wr.left), top: Math.round(wr.top), right: Math.round(wr.right), bottom: Math.round(wr.bottom) } : null,
		soft, solid,
	};
};
const CLOSED_STATE = () => ({
	solidAttr: document.documentElement.hasAttribute('data-o55-solid'),
	open: document.documentElement.hasAttribute('data-o55-open'),
	held: document.querySelectorAll('[data-o55-held]').length,
	/* the parts the window held, as it held them */
	hidden: (window.__fo253held || []).filter((n) => getComputedStyle(n).visibility === 'hidden').map((n) => n.id || String(n.className || '') || n.tagName),
	heldCount: (window.__fo253held || []).length,
	inert: [...document.body.children].filter((n) => n.id !== 'pm-o55-onboarding' && n.hasAttribute('inert')).map((n) => n.id || n.tagName),
});

/* the strip left of the window, in page coordinates (the sandbox's frame offset added) */
async function strip(t, f, win) {
	let ox = 0, oy = 0;
	if (f !== t.page.mainFrame()) { const el = await f.frameElement().catch(() => null); const fb = el && (await el.boundingBox()); if (fb) { ox = fb.x; oy = fb.y; } }
	const right = Math.max(40, (win ? win.left : 180) - 8);
	return { x: ox + 6, y: oy + 60, width: right - 6, height: Math.max(100, (win ? win.bottom : 840) - 60 - 20) };
}
/* the share of pixels that differ from their right or lower neighbour by more than 24 levels in any channel */
async function edges(t, clip) {
	const png = decodePng(await t.page.screenshot({ clip }));
	const { width: w, height: h, data: d } = png;
	let n = 0, e = 0;
	for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) {
		const i = (y * w + x) * 4, r = i + 4, b = i + w * 4;
		const diff = Math.max(Math.abs(d[i] - d[r]), Math.abs(d[i + 1] - d[r + 1]), Math.abs(d[i + 2] - d[r + 2]), Math.abs(d[i] - d[b]), Math.abs(d[i + 1] - d[b + 1]), Math.abs(d[i + 2] - d[b + 2]));
		n++; if (diff > 24) e++;
	}
	return { share: n ? e / n : 0, w, h };
}
/* the whole screen around the window: the share of its pixels whose largest channel differs by more than 8 levels
   between two pictures, and the mean difference (the window's box, grown by 12 px, left out) */
async function screenOf(t) { return decodePng(await t.page.screenshot()); }
function aroundDiff(a, b, box) {
	if (a.width !== b.width || a.height !== b.height) return { share: 1, mean: Infinity };
	let n = 0, off = 0, sum = 0;
	for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
		if (box && x >= box.left - 12 && x <= box.right + 12 && y >= box.top - 12 && y <= box.bottom + 12) continue;
		const i = (y * a.width + x) * 4;
		const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]));
		n++; sum += d; if (d > 8) off++;
	}
	return { share: n ? off / n : 0, mean: n ? sum / n : 0 };
}
const pct = (x) => (x * 100).toFixed(2) + ' %';

async function cycle(t, surface, look, { reduced = false } = {}) {
	const tag = `${look}${reduced ? ' Reduced Motion' : ''} (${surface})`;
	if (reduced) await t.emulate({ reducedMotion: 'reduce' });
	await t.viewport(1440, 900);
	const f = await t.app.open({ sandbox: surface === 'sandbox', settleMs: 800 });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click({ timeout: 15000 });
	await f.locator('#pm-settings-root').first().waitFor({ timeout: 15000 });
	await sleep(600);
	await setLookBySetting(t, f, look);
	await f.locator('#pm-settings-root [data-action="home"]').first().click({ timeout: 10000 }).catch(() => {});
	await sleep(800);
	/* a scrolled Settings page, so a close that loses the scroll shows */
	const scrolled = await f.evaluate(() => { const sc = (() => { const all = [...document.querySelectorAll('#pm-settings-root *')].filter((el) => el.scrollHeight - el.clientHeight > 40 && /auto|scroll/.test(getComputedStyle(el).overflowY) && el.getClientRects().length); all.sort((a, b) => b.clientHeight - a.clientHeight); return all[0] || null; })(); if (!sc) return null; sc.scrollTop = Math.min(120, sc.scrollHeight - sc.clientHeight); return Math.round(sc.scrollTop); });
	t.log(`${tag}: the Settings scroller scrolled to ${scrolled}`);
	await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 15000 }).catch(() => {});
	await sleep(600);
	const before = await f.evaluate(STATE);
	const clipBefore = await strip(t, f, null);
	const eBefore = await edges(t, clipBefore);
	t.log(`${tag}: before the open, the strip left of the window has ${pct(eBefore.share)} edge pixels (${eBefore.w}x${eBefore.h})`);
	await t.check(`${tag}: the look set is painted before the open`, before.theme === look, before.theme, { hard: true });

	/* (1) open, the way a person does: Settings Home's Run Onboarding Again */
	const replay = f.locator('#pm-settings-root [data-action="replay-onboarding"]').first();
	await replay.scrollIntoViewIfNeeded();
	const before2 = await f.evaluate(STATE);   /* the press may scroll the row into view: the state the close gives back is the one at the press */
	/* the parts of the app drawn before the open (some, a probe or a closed menu, are hidden at rest) */
	await f.evaluate(() => { window.__fo253shown = [...document.body.children].filter((n) => n.id !== 'pm-o55-onboarding' && n.tagName !== 'SCRIPT' && getComputedStyle(n).visibility === 'visible'); });
	await replay.click({ timeout: 10000 });
	await f.waitForFunction(() => document.documentElement.hasAttribute('data-o55-open'), null, { timeout: 15000 });
	await f.waitForFunction(() => { const r = document.getElementById('pm-o55-onboarding'); return !!r && !r.classList.contains('o55-opening') && !!document.querySelector('#pm-o55-onboarding .o55-pane > .o55-layer[data-screen]'); }, null, { timeout: 20000 });
	await sleep(1800);   /* well past the opening's 0.9 s frame sample, so a computer the old rule judged slow has had its say */
	const open = await f.evaluate(OPEN_STATE);
	t.log(`${tag}: open: ${JSON.stringify(open)}`);
	await t.check(`${tag}: (1) open: html carries data-o55-solid`, open.solidAttr, `solid attribute ${open.solidAttr}; O55.solid.get() ${open.solid}; software rendered ${open.soft}`);
	await t.check(`${tag}: (1) open: every part of the app beneath computes visibility hidden`, open.held > 0 && open.hiddenHeld === open.held, `${open.hiddenHeld} of ${open.held} held parts hidden`);
	await t.check(`${tag}: (1) open: nothing inside the hidden app draws anyway`, open.hiddenHeld === open.held && open.leaks === 0, open.hiddenHeld !== open.held ? 'the app is not hidden' : `${open.leaks} visible descendants that draw: ${open.leakAt.join(', ')}`);
	if (open.quiet) t.log(`${tag}: open: ${open.quiet} visible descendants inside the hidden app that draw nothing of their own: ${open.quietAt.join(', ')}`);
	await t.check(`${tag}: (1) open: the look painted is the look set`, open.theme === look, open.theme);
	/* (2) pixels under the dim */
	const clipOpen = await strip(t, f, open.win);
	const eOpen = await edges(t, clipOpen);
	t.log(`${tag}: open, the strip left of the window has ${pct(eOpen.share)} edge pixels`);
	await t.check(`${tag}: (2) the strip before the open is the app's, with edges (1 % or more)`, eBefore.share >= 0.01, pct(eBefore.share), { hard: true });
	await t.check(`${tag}: (2) open: under the dim the strip is the plain page background (under 0.2 % edge pixels)`, eOpen.share < 0.002, `${pct(eOpen.share)} edge pixels (before the open ${pct(eBefore.share)})`);
	/* (2) also against the plain page background under the same dim: the reference is the same strip with the app
	   hidden by the page's own switch (O55.solid.set(true), the slow computers' path on main too), then put back as it
	   was. Glass blurs under its dim, so its edges alone cannot tell the app from the wallpaper. */
	let fbox = open.win;
	if (fbox && f !== t.page.mainFrame()) { const el = await f.frameElement().catch(() => null); const fb = el && (await el.boundingBox()); if (fb) fbox = { left: fbox.left + fb.x, right: fbox.right + fb.x, top: fbox.top + fb.y, bottom: fbox.bottom + fb.y }; }
	const actual = await screenOf(t);
	const prev = await f.evaluate(() => O55.solid.get());
	await f.evaluate(() => O55.solid.set(true));
	await sleep(700);
	const ref = await screenOf(t);
	await f.evaluate((v) => O55.solid.set(v), prev);
	await sleep(500);
	const md = aroundDiff(actual, ref, fbox);
	t.log(`${tag}: open, around the window ${pct(md.share)} of the pixels differ from the plain page background under the same dim by more than 8 levels (mean ${md.mean.toFixed(2)}; O55.solid was ${JSON.stringify(prev)})`);
	await t.check(`${tag}: (2) open: around the window the screen is the plain page background under the same dim (under 0.5 % of pixels differ by more than 8 levels)`, md.share < 0.005, `${pct(md.share)} differ (mean ${md.mean.toFixed(2)} levels)`);
	await t.shot(`fo253-open-${look}${reduced ? '-reduced' : ''}-${surface}`, `${tag}: the onboarding window open; the dim lies over the plain page background`);

	/* (3) + (4) close by its own button, every frame logged */
	await f.evaluate(() => {
		const log = window.__fo253 = [];
		const t0 = performance.now(); let gone = 0;
		const tick = () => {
			const scrim = document.querySelector('#pm-o55-onboarding .o55-scrim');
			const root = document.getElementById('pm-o55-onboarding');
			const shown = !!root && !root.hidden && root.getClientRects().length > 0;
			const op = scrim && shown ? Number(getComputedStyle(scrim).opacity) : 0;
			const hidden = (window.__fo253held || []).some((n) => getComputedStyle(n).visibility === 'hidden');
			const open = document.documentElement.hasAttribute('data-o55-open');
			log.push({ t: Math.round(performance.now() - t0), op: Math.round(op * 1000) / 1000, hidden, open, shown });
			if (!open && !gone) gone = performance.now();
			if (!gone || performance.now() - gone < 600) requestAnimationFrame(tick); else window.__fo253done = true;
		};
		window.__fo253done = false;
		requestAnimationFrame(tick);
	});
	await f.locator('#pm-o55-onboarding .o55-close').first().click({ timeout: 10000 });
	await f.waitForFunction(() => window.__fo253done === true, null, { timeout: 20000 }).catch(() => {});
	await f.waitForFunction(() => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()), null, { timeout: 15000 }).catch(() => {});
	await sleep(1200);
	const frames = await f.evaluate(() => window.__fo253 || []);
	const flash = frames.filter((x) => x.hidden && x.op < 0.98);
	t.log(`${tag}: close: ${frames.length} frames; the app hidden in ${frames.filter((x) => x.hidden).length}; first frames ${JSON.stringify(frames.slice(0, 4))}`);
	await t.check(`${tag}: (4) no flash: the app is never hidden while the scrim is less than fully dim`, frames.length > 3 && flash.length === 0, frames.length <= 3 ? `only ${frames.length} frames logged` : JSON.stringify(flash.slice(0, 4)));
	const closed = await f.evaluate(CLOSED_STATE);
	await t.check(`${tag}: (3) closed: the window is gone and no solid, held or inert mark is left`, !closed.open && !closed.solidAttr && closed.held === 0 && closed.inert.length === 0, JSON.stringify(closed));
	await t.check(`${tag}: (3) closed: every part of the app the window held is visible again`, closed.heldCount > 0 && closed.hidden.length === 0, `${closed.heldCount} held parts; hidden now: ${JSON.stringify(closed.hidden)}`);
	const after = await f.evaluate(STATE);
	const diff = [];
	for (const k of ['theme', 'tab', 'scroll']) if (after[k] !== before2[k]) diff.push(`${k}: ${JSON.stringify(before2[k])} -> ${JSON.stringify(after[k])}`);
	for (const k of Object.keys(before2.boxes)) if (JSON.stringify(after.boxes[k]) !== JSON.stringify(before2.boxes[k])) diff.push(`${k}: ${JSON.stringify(before2.boxes[k])} -> ${JSON.stringify(after.boxes[k])}`);
	await t.check(`${tag}: (3) closed: the same tab, look, Settings scroll and layout boxes as at the press`, diff.length === 0, diff.join('; '));
	const eAfter = await edges(t, clipBefore);
	t.log(`${tag}: after the close, the strip has ${pct(eAfter.share)} edge pixels (before ${pct(eBefore.share)})`);
	await t.check(`${tag}: (3) closed: the app is drawn again (the strip's edges within 25 % of before)`, Math.abs(eAfter.share - eBefore.share) <= Math.max(0.0025, eBefore.share * 0.25), `${pct(eAfter.share)} against ${pct(eBefore.share)}`);
	if (reduced) await t.emulate({ reducedMotion: 'no-preference' });
}

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };
	T('FO-253 the live app is hidden behind the onboarding window', async (t) => {
		const looks = t.args.looks ? String(t.args.looks).split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_LOOKS;
		for (const look of looks) await cycle(t, surface, look);
		if (String(t.args.extra ?? '1') !== '0') await cycle(t, surface, 'basic-dark', { reduced: true });
	});
}
