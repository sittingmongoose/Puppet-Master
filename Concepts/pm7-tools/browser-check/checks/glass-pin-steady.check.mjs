// FO-242: in Glass, turning the wheel over a panel pins ancestor-indexed sheets' frost to the viewport
// ([data-lg-fixed], glass.css) until the scroll settles 160 ms later, when glass.js anchors each sheet's frost
// again (--lg-fx / --lg-fy). Both states must paint the same wallpaper behind every panel: if [data-lg-fixed]
// lists more background layers than the sheet stack (six entries for five layers after f58faa070f dropped
// --lg-glow), CSS truncates the trailing `fixed` so the frost draws as `scroll` at `0 0` from each panel's own
// corner and jumps back and forth on every wheel turn.
//
// Covers Glass dark, Glass light, and Basic dark (non-Glass no-change control), with real wheel turns over
// the Files panel (div.left-panel) and the Settings rail (#pm-settings-root aside.domain-rail), on both
// surfaces via `--set sandbox=0` / `--set sandbox=1`. Also checks that both `[data-lg-fixed]` and its
// `[data-lg-fixed][data-lg-xf]::after` crossfade twin pin the final (frost) background layer to `fixed`.
//
// Optional args:
//   --set looks=glass-dark,glass-light,basic-dark
//   --set w=1920 --set h=1080
//   --set saveShots=/abs/dir --set shotPrefix=main
import fs from 'node:fs';
import path from 'node:path';
import { decodePng } from '../../../onboarding/opus-5.5/tools/pm7_parity_png.mjs';
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';

const DEFAULT_LOOKS = ['glass-dark', 'glass-light', 'basic-dark'];
const CHANNEL_DELTA = 8;
const MAX_CHANGED_PX = 20; // fixed/control measure 0 px across files-body + domain-rail; main jumps ~215k-250k px
const SCROLLBAR_GUTTER = 14; // exclude overlay scrollbar fade (pm6-sb-active) on the right edge of scrollable panels
const MAX_CAPTURE_ATTEMPTS = 4;

const list = (v, all) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : all);

async function offsetOf(t, f) {
	const fe = f === t.page.mainFrame() ? null : await f.frameElement();
	if (!fe) return { x: 0, y: 0 };
	const box = await fe.boundingBox();
	return box ? { x: box.x, y: box.y } : { x: 0, y: 0 };
}

function splitTopLevelCommas(str) {
	const out = [];
	let depth = 0, start = 0;
	for (let i = 0; i < str.length; i++) {
		const ch = str[i];
		if (ch === '(') depth++;
		else if (ch === ')' && depth > 0) depth--;
		else if (ch === ',' && depth === 0) {
			out.push(str.slice(start, i).trim());
			start = i + 1;
		}
	}
	const tail = str.slice(start).trim();
	if (tail) out.push(tail);
	return out;
}

// Read the 4x4 frame-atomic pin witness at viewport (0, 0) (outside every panel):
// green (#00ff00) => both left panels had data-lg-fixed in this exact painted frame;
// magenta (#ff00ff) => not both pinned in this exact painted frame.
function readWitnessPixel(img, sx, sy) {
	const x = Math.min(img.width - 1, Math.max(0, Math.round(2 * sx)));
	const y = Math.min(img.height - 1, Math.max(0, Math.round(2 * sy)));
	const i = (y * img.width + x) * 4;
	const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
	return { r, g, b, pinned: g > 200 && r < 50 && b < 50, unpinned: r > 200 && b > 200 && g < 50 };
}

function diffRect(imgA, imgB, rect, clipOrigin, sx, sy, insetRight = 2) {
	const x0 = Math.max(0, Math.round((rect.x - clipOrigin.x + 2) * sx));
	const y0 = Math.max(0, Math.round((rect.y - clipOrigin.y + 2) * sy));
	const x1 = Math.min(imgA.width, Math.round((rect.x + rect.width - clipOrigin.x - insetRight) * sx));
	const y1 = Math.min(imgA.height, Math.round((rect.y + rect.height - clipOrigin.y - 2) * sy));
	if (x1 <= x0 || y1 <= y0) return { changed: 0, total: 0, maxDelta: 0 };
	let changed = 0, maxDelta = 0, total = 0;
	for (let y = y0; y < y1; y++) {
		for (let x = x0; x < x1; x++) {
			const i = (y * imgA.width + x) * 4;
			const d = Math.max(
				Math.abs(imgA.data[i] - imgB.data[i]),
				Math.abs(imgA.data[i + 1] - imgB.data[i + 1]),
				Math.abs(imgA.data[i + 2] - imgB.data[i + 2])
			);
			if (d > maxDelta) maxDelta = d;
			if (d > CHANNEL_DELTA) changed++;
			total++;
		}
	}
	return { changed, total, maxDelta };
}

// Event-driven wait for anchored rest state: MutationObserver + ResizeObserver + CSSStyleDeclaration hook,
// zero setTimeout delays and zero polling loops.
async function waitGlassReady(f, isGlass) {
	await f.evaluate(() => document.fonts.ready);
	await f.evaluate((glass) => new Promise((resolve, reject) => {
		const SELECTORS = ['header.title-bar', 'div.left-panel', '#pm-settings-root aside.domain-rail', '#pm7GlobalStatusBar'];
		const ready = () => {
			const sheets = SELECTORS.map((s) => document.querySelector(s));
			if (sheets.some((e) => !e)) return false;
			if (sheets.some((e) => { const r = e.getBoundingClientRect(); return r.width < 20 || r.height < 20; })) return false;
			if (!glass) return true;
			const html = document.documentElement;
			if (html.getAttribute('data-lg') !== 'on' || html.hasAttribute('data-lg-wall-hold')) return false;
			const st = document.getElementById('lg-frost');
			const rule = st && st.sheet && st.sheet.cssRules && st.sheet.cssRules[0];
			if (!rule || !rule.style.getPropertyValue('--lg-frost-heavy') || !rule.style.getPropertyValue('--lg-frost-light')) return false;
			for (const e of sheets) {
				if (!e.hasAttribute('data-lg-kind')) return false;
				if (e.hasAttribute('data-lg-fixed') || e.hasAttribute('data-lg-xf')) return false;
				const fx = parseFloat(e.style.getPropertyValue('--lg-fx'));
				const fy = parseFloat(e.style.getPropertyValue('--lg-fy'));
				const r = e.getBoundingClientRect();
				if (!Number.isFinite(fx) || !Number.isFinite(fy)) return false;
				if (Math.abs(-fx - r.left) > 2 || Math.abs(-fy - r.top) > 2) return false;
			}
			return true;
		};
		let done = false;
		const origSet = CSSStyleDeclaration.prototype.setProperty;
		let mo = null, ro = null, timer = 0;
		const finish = (err) => {
			if (done) return;
			done = true;
			if (mo) mo.disconnect();
			if (ro) ro.disconnect();
			if (timer) clearTimeout(timer);
			CSSStyleDeclaration.prototype.setProperty = origSet;
			if (err) reject(err);
			else requestAnimationFrame(() => requestAnimationFrame(resolve));
		};
		const check = () => { if (!done && ready()) finish(null); };
		if (ready()) { finish(null); return; }
		mo = new MutationObserver(check);
		mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-lg', 'data-lg-wall-hold', 'data-lg-kind', 'data-lg-fixed', 'data-lg-xf', 'style', 'class'] });
		ro = new ResizeObserver(check);
		ro.observe(document.body);
		for (const s of SELECTORS) { const e = document.querySelector(s); if (e) ro.observe(e); }
		CSSStyleDeclaration.prototype.setProperty = function (name, value, pri) {
			const res = origSet.call(this, name, value, pri);
			if (name === '--lg-frost-heavy' || name === '--lg-frost-light' || name === '--lg-fx' || name === '--lg-fy') queueMicrotask(check);
			return res;
		};
		timer = setTimeout(() => finish(new Error('Glass sheets did not reach anchored rest state within 20s')), 20000);
	}), isGlass);
}

async function waitAnimationsIdle(f) {
	await f.evaluate(async () => {
		const panels = [document.querySelector('div.left-panel'), document.querySelector('#pm-settings-root aside.domain-rail')].filter(Boolean);
		const anims = panels.flatMap((p) => p.getAnimations({ subtree: true })).filter((a) => {
			if (a.playState !== 'running' || !(a.playbackRate > 0)) return false;
			const timing = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
			return timing && Number.isFinite(timing.endTime) && timing.endTime > 0 && timing.endTime < 2000;
		});
		if (anims.length) {
			await Promise.race([
				Promise.all(anims.map((a) => a.finished.catch(() => {}))),
				new Promise((r) => setTimeout(r, 2500))
			]);
		}
		await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
	});
}

async function openSettingsAndFiles(t, f) {
	const clicked = await f.evaluate(() => {
		const tab = document.getElementById('tab-settings');
		if (tab && tab.getBoundingClientRect().width > 0) { tab.click(); return true; }
		if (window.PM_PAGES && typeof PM_PAGES.go === 'function') { PM_PAGES.go('settings'); return true; }
		return false;
	});
	await t.check('Settings page navigation triggered', clicked, 'could not navigate to settings', { hard: true });
	await f.evaluate(() => new Promise((resolve, reject) => {
		const ready = () => {
			const rail = document.querySelector('#pm-settings-root aside.domain-rail');
			if (!rail) return false;
			const r = rail.getBoundingClientRect();
			return r.width > 40 && r.height > 100;
		};
		if (ready()) { resolve(); return; }
		let done = false;
		const mo = new MutationObserver(() => { if (!done && ready()) { done = true; mo.disconnect(); clearTimeout(tm); resolve(); } });
		mo.observe(document.body, { subtree: true, childList: true, attributes: true });
		const tm = setTimeout(() => { if (!done) { done = true; mo.disconnect(); reject(new Error('Settings domain-rail did not appear within 20s')); } }, 20000);
	}));
	const filesOpen = await f.evaluate(() => {
		const lp = document.querySelector('div.left-panel');
		const fp = document.querySelector('#panel-files');
		return !!(lp && lp.getBoundingClientRect().width > 120 && fp && fp.classList.contains('active') && fp.getBoundingClientRect().width > 80);
	});
	if (!filesOpen) {
		await f.evaluate(() => { const b = document.querySelector('#activityBar .icon[data-target="panel-files"]'); if (b) b.click(); });
		await f.evaluate(() => new Promise((resolve, reject) => {
			const ready = () => {
				const lp = document.querySelector('div.left-panel');
				const fp = document.querySelector('#panel-files');
				return !!(lp && lp.getBoundingClientRect().width > 120 && fp && fp.classList.contains('active') && fp.getBoundingClientRect().width > 80);
			};
			if (ready()) { resolve(); return; }
			let done = false;
			const mo = new MutationObserver(() => { if (!done && ready()) { done = true; mo.disconnect(); clearTimeout(tm); resolve(); } });
			mo.observe(document.body, { subtree: true, childList: true, attributes: true });
			const tm = setTimeout(() => { if (!done) { done = true; mo.disconnect(); reject(new Error('Files panel did not open within 10s')); } }, 10000);
		}));
	}
	// Expand collapsed folders in #panel-files so the Files panel has genuine vertical overflow:
	// a real wheel turn over Files then fires a real scroll event and arms glass.js's 160 ms settle window.
	await f.evaluate(() => {
		const lp = document.querySelector('div.left-panel');
		const hasOverflow = () => {
			if (!lp) return false;
			for (const el of [lp, ...lp.querySelectorAll('*')]) {
				const oy = getComputedStyle(el).overflowY;
				if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 120) return true;
			}
			return false;
		};
		const root = document.querySelector('#panel-files') || lp;
		if (!root) return;
		for (const row of root.querySelectorAll('.fm-node > .fm-row')) {
			if (hasOverflow()) break;
			const node = row.parentElement;
			if (node && !node.classList.contains('open') && node.querySelector(':scope > .fm-children')) row.click();
		}
	});
}

async function pickWheelPoint(f, which) {
	return f.evaluate((kind) => {
		const panel = kind === 'files' ? document.querySelector('div.left-panel') : document.querySelector('#pm-settings-root aside.domain-rail');
		if (!panel) return null;
		const r = panel.getBoundingClientRect();
		if (kind === 'rail') {
			const scroller = panel.querySelector('.rail-scroll') || panel;
			const sr = scroller.getBoundingClientRect();
			// Right 3 px padding inside .rail-scroll: hits .rail-scroll natively without hovering any .domain-link
			// and stays ~230 px away from div.left-panel (avoiding 22-hover.css box-edge proximity glow on Basic).
			return {
				x: Math.round(sr.right - 3),
				y: Math.round(sr.top + sr.height * 0.5),
				deltaY: -40,
				panelRect: { x: r.left, y: r.top, width: r.width, height: r.height }
			};
		}
		let scroller = null;
		for (const el of [panel, ...panel.querySelectorAll('*')]) {
			const cs = getComputedStyle(el);
			if (cs.display === 'none' || cs.visibility === 'hidden') continue;
			if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 20) {
				const er = el.getBoundingClientRect();
				if (er.width > 40 && er.height > 80) scroller = el;
			}
		}
		const body = scroller || panel.querySelector('#panel-files .fm-tree, #panel-files .fm-body, #panel-files') || panel;
		const sr = body.getBoundingClientRect();
		// Left 3 px padding inside the Files scroller: scrolls genuinely without hovering rows or nearing domain-rail.
		return {
			x: Math.round(sr.left + 3),
			y: Math.round(sr.top + Math.min(sr.height * 0.5, sr.height - 24)),
			deltaY: 60,
			panelRect: { x: r.left, y: r.top, width: r.width, height: r.height }
		};
	}, which);
}

// Position the target scroller (rail at bottom so Settings Home stays off-top; files at top) and wait
// event-driven for the resulting scroll event, any Glass pin/unpin settle, and any off-top rail lens hide.
async function resetScrollAndWaitSettle(f, target, isGlass) {
	await f.evaluate(({ kind, glass }) => new Promise((resolve) => {
		const changed = [];
		const watch = [];
		let railScroll = null;
		let railSheet = null;
		if (kind === 'rail') {
			railScroll = document.querySelector('#pm-settings-root aside.domain-rail .rail-scroll');
			railSheet = document.querySelector('#pm-settings-root aside.domain-rail');
			if (railSheet) watch.push(railSheet);
			if (railScroll) {
				const maxTop = Math.max(0, railScroll.scrollHeight - railScroll.clientHeight);
				if (Math.abs(railScroll.scrollTop - maxTop) > 1) {
					changed.push(railScroll);
					railScroll.scrollTop = railScroll.scrollHeight;
				}
			}
		} else {
			const lp = document.querySelector('div.left-panel');
			if (lp) {
				watch.push(lp);
				for (const el of [lp, ...lp.querySelectorAll('*')]) {
					if (el.scrollTop > 0) {
						changed.push(el);
						el.scrollTop = 0;
					}
				}
			}
		}
		const needRailLensHidden = () => {
			if (!glass || kind !== 'rail' || !railScroll || !railSheet) return false;
			const active = railScroll.querySelector('.side-link.active, .domain-link.active');
			if (!active) return false;
			const ar = active.getBoundingClientRect();
			const sr = railScroll.getBoundingClientRect();
			return ar.bottom <= sr.top + 2;
		};
		const railLensHidden = () => {
			if (!needRailLensHidden()) return true;
			const rr = railSheet.getBoundingClientRect();
			for (const l of document.querySelectorAll('.lg-lens')) {
				const cs = getComputedStyle(l);
				if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.02) continue;
				const lr = l.getBoundingClientRect();
				if (lr.width < 2 || lr.height < 2) continue;
				if (lr.right > rr.left && lr.left < rr.right && lr.bottom > rr.top && lr.top < rr.bottom) return false;
			}
			return true;
		};
		if (!changed.length && railLensHidden()) {
			requestAnimationFrame(() => requestAnimationFrame(resolve));
			return;
		}
		let done = false;
		let sawPin = false;
		let sawScroll = !changed.length;
		let mo = null;
		const finish = () => {
			if (done) return;
			done = true;
			if (mo) mo.disconnect();
			for (const el of changed) el.removeEventListener('scroll', onScroll);
			clearTimeout(tm);
			requestAnimationFrame(() => requestAnimationFrame(resolve));
		};
		const anyPinned = () => watch.some((e) => e.hasAttribute('data-lg-fixed'));
		const nonePinned = () => watch.every((e) => !e.hasAttribute('data-lg-fixed'));
		const checkReady = () => {
			if (done || !sawScroll) return;
			if (!glass) { finish(); return; }
			if (anyPinned()) { sawPin = true; return; }
			if (nonePinned() && railLensHidden()) finish();
		};
		const onScroll = () => {
			sawScroll = true;
			requestAnimationFrame(() => requestAnimationFrame(checkReady));
		};
		for (const el of changed) el.addEventListener('scroll', onScroll, { passive: true });
		if (glass) {
			mo = new MutationObserver(checkReady);
			mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-lg-fixed', 'style', 'class'] });
			if (!changed.length) checkReady();
		}
		const tm = setTimeout(finish, 3000);
	}), { kind: target, glass: isGlass });
}

async function checkAfterCrossfadePin(f) {
	return f.evaluate(() => {
		const samples = [
			['panel', document.querySelector('div.left-panel[data-lg-kind="panel"]')],
			['bar', document.querySelector('header.title-bar[data-lg-kind="bar"]')],
			['card', document.querySelector('#panel-settings [data-lg-kind="card"], [data-lg-kind="card"]')]
		];
		const out = [];
		for (const [kind, el] of samples) {
			if (!el) continue;
			const hadFixed = el.hasAttribute('data-lg-fixed');
			const prevXf = el.getAttribute('data-lg-xf');
			try {
				el.setAttribute('data-lg-fixed', '');
				el.setAttribute('data-lg-xf', 'a');
				const cs = getComputedStyle(el, '::after');
				out.push({
					kind,
					bgImage: cs.backgroundImage,
					bgAttachment: cs.backgroundAttachment,
					bgPosition: cs.backgroundPosition
				});
			} finally {
				if (!hadFixed) el.removeAttribute('data-lg-fixed');
				if (prevXf === null) el.removeAttribute('data-lg-xf');
				else el.setAttribute('data-lg-xf', prevXf);
			}
		}
		return out;
	});
}

// Find a scrollable element in the Settings main column (outside left panels) and return its center + a wheel
// delta guaranteed to have scroll room so glass.js's 160 ms scrollSettleT arms naturally.
async function findSettleWheel(f) {
	return f.evaluate(() => {
		const left = document.querySelector('div.left-panel');
		const rail = document.querySelector('#pm-settings-root aside.domain-rail');
		const root = document.querySelector('#panel-settings');
		if (!root) return null;
		let best = null;
		for (const el of [root, ...root.querySelectorAll('*')]) {
			if ((left && left.contains(el)) || (rail && rail.contains(el))) continue;
			const cs = getComputedStyle(el);
			if (cs.visibility === 'hidden' || cs.display === 'none') continue;
			const oy = cs.overflowY;
			if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 20) {
				const r = el.getBoundingClientRect();
				if (r.width > 120 && r.height > 120) {
					const cx = Math.round(r.left + r.width * 0.5);
					const cy = Math.round(r.top + r.height * 0.5);
					const hit = document.elementFromPoint(cx, cy);
					if (hit && el.contains(hit)) {
						best = { x: cx, y: cy, deltaY: el.scrollTop > 0 ? -120 : 120 };
					}
				}
			}
		}
		return best;
	});
}

// Capture a clean full-resolution screenshot pair (mid-wheel pinned + settled) without the 4x4 witness marker,
// resetting scroll containers to top so main and fix frames match identically at the same moment and size.
async function saveCleanFullResPair(t, f, off, pt, saveShots, look, shotPrefix, surface) {
	for (let attempt = 1; attempt <= MAX_CAPTURE_ATTEMPTS; attempt++) {
		await f.evaluate(() => {
			for (const el of document.querySelectorAll('#panel-settings, #panel-settings *, div.left-panel, div.left-panel *')) {
				if (el.scrollTop) el.scrollTop = 0;
			}
		});
		await waitGlassReady(f, true);
		await t.page.mouse.move(off.x + pt.x, off.y + pt.y);
		await waitAnimationsIdle(f);
		await f.evaluate(() => {
			const WATCH = ['header.title-bar', 'div.left-panel', '#pm-settings-root aside.domain-rail', '#pm7GlobalStatusBar'];
			const els = WATCH.map((s) => document.querySelector(s)).filter(Boolean);
			const rec = window.__fo242Clean = {
				pinnedAt: 0, _pinWaiters: [], _unpinWaiters: [],
				cleanup() { this.mo?.disconnect(); }
			};
			rec.mo = new MutationObserver(() => {
				const n = els.filter((e) => e.hasAttribute('data-lg-fixed')).length;
				if (n > 0 && !rec.pinnedAt) { rec.pinnedAt = performance.now(); rec._pinWaiters.splice(0).forEach((fn) => fn()); }
				if (rec.pinnedAt && n === 0) rec._unpinWaiters.splice(0).forEach((fn) => fn());
			});
			for (const e of els) rec.mo.observe(e, { attributes: true, attributeFilter: ['data-lg-fixed'] });
		});
		try {
			await t.page.mouse.wheel(0, 240);
			const pinnedBeforeShot = await f.evaluate(() => new Promise((resolve) => {
				const rec = window.__fo242Clean;
				const both = () => !!(document.querySelector('div.left-panel')?.hasAttribute('data-lg-fixed') && document.querySelector('#pm-settings-root aside.domain-rail')?.hasAttribute('data-lg-fixed'));
				if (rec.pinnedAt) { requestAnimationFrame(() => resolve(both())); return; }
				let done = false;
				const tm = setTimeout(() => { if (!done) { done = true; resolve(both()); } }, 3000);
				rec._pinWaiters.push(() => { if (!done) { done = true; clearTimeout(tm); requestAnimationFrame(() => resolve(both())); } });
			}));
			const wheelBuf = await t.page.screenshot();
			const stillPinned = await f.evaluate(() => {
				const lp = document.querySelector('div.left-panel');
				const rail = document.querySelector('#pm-settings-root aside.domain-rail');
				return !!(lp?.hasAttribute('data-lg-fixed') && rail?.hasAttribute('data-lg-fixed'));
			});
			// Settle via a real scroll with guaranteed direction room
			if (stillPinned) {
				const sw = await findSettleWheel(f);
				if (sw) {
					await t.page.mouse.move(off.x + sw.x, off.y + sw.y);
					await t.page.mouse.wheel(0, sw.deltaY);
				}
			}
			await f.evaluate(() => new Promise((resolve) => {
				const rec = window.__fo242Clean;
				const WATCH = ['header.title-bar', 'div.left-panel', '#pm-settings-root aside.domain-rail', '#pm7GlobalStatusBar'];
				const none = () => WATCH.every((s) => !document.querySelector(s)?.hasAttribute('data-lg-fixed'));
				if (none()) { requestAnimationFrame(() => requestAnimationFrame(resolve)); return; }
				let done = false;
				const go = () => { if (!done && none()) { done = true; clearTimeout(tm); requestAnimationFrame(() => requestAnimationFrame(resolve)); } };
				rec._unpinWaiters.push(go);
				const tm = setTimeout(() => { if (!done) { done = true; resolve(); } }, 5000);
			}));
			await f.evaluate(() => {
				for (const el of document.querySelectorAll('#panel-settings, #panel-settings *')) {
					if (el.scrollTop) el.scrollTop = 0;
				}
			});
			await waitGlassReady(f, true);
			await t.page.mouse.move(off.x + pt.x, off.y + pt.y);
			await waitAnimationsIdle(f);
			const settledBuf = await t.page.screenshot();
			if (pinnedBeforeShot || attempt === MAX_CAPTURE_ATTEMPTS) {
				fs.writeFileSync(path.join(saveShots, `${look}-${shotPrefix}-${surface}-wheel.png`), wheelBuf);
				fs.writeFileSync(path.join(saveShots, `${look}-${shotPrefix}-${surface}-settled.png`), settledBuf);
				t.log(`saveShots ${look} ${shotPrefix} ${surface}: saved full-res pair (attempt ${attempt}, pinnedBeforeShot=${pinnedBeforeShot}, stillPinnedAfterShot=${stillPinned})`);
				return;
			}
		} finally {
			await f.evaluate(() => { window.__fo242Clean?.cleanup(); delete window.__fo242Clean; }).catch(() => {});
		}
	}
}

export default async function (t) {
	const W = Number(t.args.w || 1920);
	const H = Number(t.args.h || 1080);
	const looks = list(t.args.looks, DEFAULT_LOOKS);
	const saveShots = t.args.saveShots ? String(t.args.saveShots) : '';
	const shotPrefix = String(t.args.shotPrefix || 'build');
	const surface = t.app.sandboxed(false) ? 'sandbox' : 'normal';
	if (saveShots) fs.mkdirSync(saveShots, { recursive: true });

	await muteSound(t.page);
	await t.viewport(W, H);
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open({ query: 'pm-still=off&pm-warm=0' });
	await openSettingsAndFiles(t, f);

	for (const look of looks) {
		const isGlass = look.startsWith('glass-');
		await t.app.look(look);
		await waitGlassReady(f, isGlass);
		await waitAnimationsIdle(f);

		let afterChecked = false;
		for (const target of ['files', 'rail']) {
			const tag = `${look} ${surface} wheel-${target}`;
			await parkPointer(t.page, W, H);
			await waitGlassReady(f, isGlass);
			await waitAnimationsIdle(f);

			const off = await offsetOf(t, f);
			const pt = await pickWheelPoint(f, target);
			await t.check(`${tag}: target panel is visible`, !!pt && pt.panelRect.width > 40, JSON.stringify(pt), { hard: true });
			if (!pt) continue;

			const initialGeom = await f.evaluate(() => {
				const box = (sel) => {
					const e = document.querySelector(sel);
					if (!e) return null;
					const r = e.getBoundingClientRect();
					return { x: r.left, y: r.top, width: r.width, height: r.height };
				};
				const filesBodyBox = () => {
					const b = box('#sidePanelSlot') || box('div.left-panel');
					if (!b) return null;
					// Stop above .sh-foot so the unrelated 2.6 s breathing watcher dot (.fm-footstat .dot) never adds noise.
					const foot = document.querySelector('#panel-files .sh-foot');
					if (foot) {
						const fr = foot.getBoundingClientRect();
						if (fr.top > b.y + 40 && fr.top < b.y + b.height) b.height = fr.top - b.y;
					}
					return b;
				};
				return {
					files: box('div.left-panel'),
					filesBody: filesBodyBox(),
					rail: box('#pm-settings-root aside.domain-rail'),
					mainScroll: (() => {
						const m = document.querySelector('#pm-settings-root .document-scroll, #pm-settings-root .document-main, #pm-settings-root');
						if (!m) return null;
						const r = m.getBoundingClientRect();
						return { x: Math.round(r.left + r.width * 0.5), y: Math.round(r.top + r.height * 0.5) };
					})()
				};
			});

			// Clip covers viewport (0,0) (for the 4x4 frame-atomic pin witness) through both left panels.
			const clipX = Math.max(0, Math.floor(off.x));
			const clipY = Math.max(0, Math.floor(off.y));
			const clipR = Math.min(W, Math.ceil(off.x + Math.max(initialGeom.files.x + initialGeom.files.width, initialGeom.rail.x + initialGeom.rail.width)));
			const clipB = Math.min(H, Math.ceil(off.y + Math.max(initialGeom.files.y + initialGeom.files.height, initialGeom.rail.y + initialGeom.rail.height)));
			const clip = { x: clipX, y: clipY, width: Math.max(1, clipR - clipX), height: Math.max(1, clipB - clipY) };
			const clipOrigin = { x: clip.x, y: clip.y };

			let pinnedPngBuf = null;
			let settledPngBuf = null;
			let restPngBuf = null;
			let pinSnapshot = null;
			let settledScrolls = null;
			let pinnedWitness = null;
			let settledWitness = null;

			for (let attempt = 1; attempt <= MAX_CAPTURE_ATTEMPTS; attempt++) {
				await resetScrollAndWaitSettle(f, target, isGlass);
				await waitGlassReady(f, isGlass);
				await t.page.mouse.move(off.x + pt.x, off.y + pt.y);
				await waitAnimationsIdle(f);
				restPngBuf = await t.page.screenshot({ clip });

				// Install frame-atomic 4x4 witness pixel at viewport (0,0) outside every panel + event-driven observers.
				await f.evaluate(() => {
					const WATCH = ['header.title-bar', 'div.left-panel', '#pm-settings-root aside.domain-rail', '#pm7GlobalStatusBar'];
					const els = WATCH.map((s) => document.querySelector(s)).filter(Boolean);
					const lp = document.querySelector('div.left-panel');
					const rail = document.querySelector('#pm-settings-root aside.domain-rail');
					let badge = document.getElementById('bc-fo242-witness');
					if (!badge) {
						badge = document.createElement('div');
						badge.id = 'bc-fo242-witness';
						badge.style.cssText = 'position:fixed;left:0;top:0;width:4px;height:4px;z-index:2147483647;pointer-events:none;background:#ff00ff;';
						document.documentElement.appendChild(badge);
					}
					const syncBadge = () => {
						const both = !!(lp?.hasAttribute('data-lg-fixed') && rail?.hasAttribute('data-lg-fixed'));
						badge.style.backgroundColor = both ? '#00ff00' : '#ff00ff';
						return both;
					};
					syncBadge();
					const rec = window.__fo242 = {
						wheeled: false,
						scrolled: false,
						pinnedAt: 0,
						unpinnedAt: 0,
						_pinWaiters: [],
						_unpinWaiters: [],
						cleanup() {
							this.mo?.disconnect();
							document.removeEventListener('wheel', this.onWheel, true);
							document.removeEventListener('scroll', this.onScroll, true);
							document.getElementById('bc-fo242-witness')?.remove();
						}
					};
					rec.onWheel = () => { rec.wheeled = true; };
					rec.onScroll = () => { rec.scrolled = true; };
					document.addEventListener('wheel', rec.onWheel, { capture: true, passive: true });
					document.addEventListener('scroll', rec.onScroll, { capture: true, passive: true });
					rec.mo = new MutationObserver(() => {
						const both = syncBadge();
						const n = els.filter((e) => e.hasAttribute('data-lg-fixed')).length;
						if (both && !rec.pinnedAt) {
							rec.pinnedAt = performance.now();
							rec._pinWaiters.splice(0).forEach((fn) => fn());
						}
						if (rec.pinnedAt && n === 0) {
							if (!rec.unpinnedAt) rec.unpinnedAt = performance.now();
							rec._unpinWaiters.splice(0).forEach((fn) => fn());
						}
					});
					for (const e of els) rec.mo.observe(e, { attributes: true, attributeFilter: ['data-lg-fixed'] });
				});

				try {
					await t.page.mouse.wheel(0, pt.deltaY);

					pinSnapshot = await f.evaluate((glass) => new Promise((resolve) => {
						const rec = window.__fo242;
						const WATCH = ['header.title-bar', 'div.left-panel', '#pm-settings-root aside.domain-rail', '#pm7GlobalStatusBar'];
						const readScrolls = () => {
							const out = [];
							for (const sel of ['div.left-panel', '#pm-settings-root aside.domain-rail']) {
								const root = document.querySelector(sel);
								if (!root) continue;
								for (const el of [root, ...root.querySelectorAll('*')]) {
									const oy = getComputedStyle(el).overflowY;
									if ((oy === 'auto' || oy === 'scroll') && (el.scrollHeight > el.clientHeight + 1 || el.scrollTop !== 0)) {
										out.push({ sel, tag: el.tagName.toLowerCase(), id: el.id || '', top: Math.round(el.scrollTop), max: Math.round(el.scrollHeight - el.clientHeight) });
									}
								}
							}
							return out;
						};
						const readLayers = () => WATCH.map((sel) => {
							const e = document.querySelector(sel);
							if (!e) return null;
							const cs = getComputedStyle(e);
							return { sel, kind: e.getAttribute('data-lg-kind'), fixedAttr: e.hasAttribute('data-lg-fixed'), bgImage: cs.backgroundImage, bgAttachment: cs.backgroundAttachment, bgPosition: cs.backgroundPosition };
						}).filter(Boolean);
						const snap = () => ({
							wheeled: rec.wheeled,
							scrolled: rec.scrolled,
							pinnedAt: rec.pinnedAt,
							unpinnedAt: rec.unpinnedAt,
							pinnedNow: WATCH.filter((s) => document.querySelector(s)?.hasAttribute('data-lg-fixed')),
							layers: glass ? readLayers() : [],
							scrolls: readScrolls()
						});
						const afterPin = () => {
							let prev = null;
							const step = () => {
								const cur = JSON.stringify(readScrolls());
								if (rec.unpinnedAt || (prev !== null && cur === prev)) { resolve(snap()); return; }
								prev = cur;
								requestAnimationFrame(step);
							};
							requestAnimationFrame(step);
						};
						if (!glass) { afterPin(); return; }
						if (rec.pinnedAt) { afterPin(); return; }
						let done = false;
						const tm = setTimeout(() => { if (!done) { done = true; resolve(snap()); } }, 3000);
						rec._pinWaiters.push(() => { if (!done) { done = true; clearTimeout(tm); afterPin(); } });
					}), isGlass);

					pinnedPngBuf = await t.page.screenshot({ clip });

					const afterInfo = await f.evaluate(() => {
						const rec = window.__fo242;
						const WATCH = ['header.title-bar', 'div.left-panel', '#pm-settings-root aside.domain-rail', '#pm7GlobalStatusBar'];
						return { scrolled: rec.scrolled, pinnedNow: WATCH.filter((s) => document.querySelector(s)?.hasAttribute('data-lg-fixed')) };
					});

					// Settle the pin naturally via a real scroll with guaranteed direction room
					if (isGlass && afterInfo.pinnedNow.length > 0 && !afterInfo.scrolled) {
						const sw = await findSettleWheel(f);
						if (sw) {
							await t.page.mouse.move(off.x + sw.x, off.y + sw.y);
							await t.page.mouse.wheel(0, sw.deltaY);
						}
					}
					if (isGlass) {
						await f.evaluate(() => new Promise((resolve, reject) => {
							const rec = window.__fo242;
							const WATCH = ['header.title-bar', 'div.left-panel', '#pm-settings-root aside.domain-rail', '#pm7GlobalStatusBar'];
							const nonePinned = () => WATCH.every((s) => !document.querySelector(s)?.hasAttribute('data-lg-fixed'));
							if (nonePinned()) { requestAnimationFrame(() => requestAnimationFrame(resolve)); return; }
							let done = false;
							const go = () => {
								if (done || !nonePinned()) return;
								done = true; clearTimeout(tm);
								requestAnimationFrame(() => requestAnimationFrame(resolve));
							};
							rec._unpinWaiters.push(go);
							const tm = setTimeout(() => { if (!done) { done = true; reject(new Error('data-lg-fixed did not lift after settle')); } }, 5000);
						}));
					}
					await t.page.mouse.move(off.x + pt.x, off.y + pt.y);
					await waitAnimationsIdle(f);
					settledScrolls = await f.evaluate(() => {
						const out = [];
						for (const sel of ['div.left-panel', '#pm-settings-root aside.domain-rail']) {
							const root = document.querySelector(sel);
							if (!root) continue;
							for (const el of [root, ...root.querySelectorAll('*')]) {
								const oy = getComputedStyle(el).overflowY;
								if ((oy === 'auto' || oy === 'scroll') && (el.scrollHeight > el.clientHeight + 1 || el.scrollTop !== 0)) {
									out.push({ sel, tag: el.tagName.toLowerCase(), id: el.id || '', top: Math.round(el.scrollTop), max: Math.round(el.scrollHeight - el.clientHeight) });
								}
							}
						}
						return out;
					});
					settledPngBuf = await t.page.screenshot({ clip });
				} finally {
					await f.evaluate(() => { window.__fo242?.cleanup(); delete window.__fo242; }).catch(() => {});
				}

				const pImg = decodePng(pinnedPngBuf);
				const sImg = decodePng(settledPngBuf);
				const sx = pImg.width / clip.width;
				const sy = pImg.height / clip.height;
				pinnedWitness = readWitnessPixel(pImg, sx, sy);
				settledWitness = readWitnessPixel(sImg, sx, sy);
				const frameValid = isGlass ? (pinnedWitness.pinned && settledWitness.unpinned) : (pinnedWitness.unpinned && settledWitness.unpinned);
				if (frameValid) break;
				t.log(`${tag}: attempt ${attempt}/${MAX_CAPTURE_ATTEMPTS} witness mismatch (pinned=${JSON.stringify(pinnedWitness)}, settled=${JSON.stringify(settledWitness)}); retrying`);
			}

			const pinnedImg = decodePng(pinnedPngBuf);
			const settledImg = decodePng(settledPngBuf);
			const restImg = decodePng(restPngBuf);
			const sx = pinnedImg.width / clip.width;
			const sy = pinnedImg.height / clip.height;

			if (isGlass) {
				await t.check(
					`${tag}: captured frame painted with data-lg-fixed active on both left panels and settled frame unpinned (non-vacuous)`,
					pinnedWitness.pinned && settledWitness.unpinned,
					`pinnedWitness=${JSON.stringify(pinnedWitness)}, settledWitness=${JSON.stringify(settledWitness)}`
				);

				const badLayers = [];
				for (const item of pinSnapshot.layers) {
					const imgs = splitTopLevelCommas(item.bgImage);
					const atts = splitTopLevelCommas(item.bgAttachment);
					const poss = splitTopLevelCommas(item.bgPosition);
					const lastAtt = atts[imgs.length - 1];
					const lastPos = poss[imgs.length - 1];
					if (imgs.length < 2 || lastAtt !== 'fixed' || lastPos !== '0px 0px') {
						badLayers.push(`${item.sel}: ${imgs.length} layers, frost att=${lastAtt}, pos=${lastPos}`);
					}
				}
				await t.check(
					`${tag}: pinned sheets attach frost layer as fixed at 0 0`,
					badLayers.length === 0,
					badLayers.join('; ')
				);

				if (!afterChecked) {
					afterChecked = true;
					const xfRows = await checkAfterCrossfadePin(f);
					const badXf = [];
					for (const row of xfRows) {
						const imgs = splitTopLevelCommas(row.bgImage);
						const atts = splitTopLevelCommas(row.bgAttachment);
						const poss = splitTopLevelCommas(row.bgPosition);
						const lastAtt = atts[imgs.length - 1];
						const lastPos = poss[imgs.length - 1];
						if (imgs.length < 2 || lastAtt !== 'fixed' || lastPos !== '0px 0px') {
							badXf.push(`${row.kind}::after: ${imgs.length} layers, frost att=${lastAtt}, pos=${lastPos}`);
						}
					}
					await t.check(
						`${look} ${surface}: [data-lg-fixed][data-lg-xf]::after attaches frost layer as fixed at 0 0`,
						xfRows.length >= 2 && badXf.length === 0,
						xfRows.length < 2 ? `only ${xfRows.length} sheet kinds found` : badXf.join('; ')
					);
				}
			} else {
				await t.check(
					`${tag}: non-Glass control sets no data-lg-fixed`,
					pinSnapshot.pinnedNow.length === 0 && pinnedWitness.unpinned,
					`pinned=${JSON.stringify(pinSnapshot.pinnedNow)}, witness=${JSON.stringify(pinnedWitness)}`
				);
			}

			const filesShifted = { x: off.x + initialGeom.filesBody.x, y: off.y + initialGeom.filesBody.y, width: initialGeom.filesBody.width, height: initialGeom.filesBody.height };
			const railShifted = { x: off.x + initialGeom.rail.x, y: off.y + initialGeom.rail.y, width: initialGeom.rail.width, height: initialGeom.rail.height };
			const dFiles = diffRect(pinnedImg, settledImg, filesShifted, clipOrigin, sx, sy, SCROLLBAR_GUTTER);
			const dRail = diffRect(pinnedImg, settledImg, railShifted, clipOrigin, sx, sy, SCROLLBAR_GUTTER);
			const dFilesRest = diffRect(restImg, pinnedImg, filesShifted, clipOrigin, sx, sy, SCROLLBAR_GUTTER);
			const dRailRest = diffRect(restImg, pinnedImg, railShifted, clipOrigin, sx, sy, SCROLLBAR_GUTTER);

			const leftChanged = dFiles.changed + dRail.changed;
			const leftMaxDelta = Math.max(dFiles.maxDelta, dRail.maxDelta);
			const scrollSame = JSON.stringify(pinSnapshot.scrolls) === JSON.stringify(settledScrolls);
			const summary = {
				'files-panel': { pinVsSettled: dFiles.changed, maxD: dFiles.maxDelta, restVsPin: dFilesRest.changed },
				'domain-rail': { pinVsSettled: dRail.changed, maxD: dRail.maxDelta, restVsPin: dRailRest.changed }
			};
			t.log(`${tag}: leftPanels=${leftChanged}px (maxD=${leftMaxDelta}), witness=pin:${pinnedWitness.pinned}/set:${settledWitness.unpinned}, scrollSame=${scrollSame}, detail=${JSON.stringify(summary)}, scrolls=${JSON.stringify(pinSnapshot.scrolls)}`);

			await t.check(
				`${tag}: scroller positions match between pinned and settled shots`,
				scrollSame,
				`pinned=${JSON.stringify(pinSnapshot.scrolls)} vs settled=${JSON.stringify(settledScrolls)}`
			);
			await t.check(
				`${tag}: pixels behind left panels stay steady during wheel pin (${leftChanged} px <= ${MAX_CHANGED_PX})`,
				leftChanged <= MAX_CHANGED_PX,
				`${leftChanged} px changed > ${CHANNEL_DELTA} levels (maxD=${leftMaxDelta}); ${JSON.stringify(summary)}`
			);

			if (saveShots && isGlass && target === 'files') {
				await saveCleanFullResPair(t, f, off, pt, saveShots, look, shotPrefix, surface);
			}
		}
	}
}
