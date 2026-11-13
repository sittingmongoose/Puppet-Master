// At rest the page must not render a main-thread frame on every screen refresh (2026-11-10 performance pass).
//
// Before the pass every look rendered about 117 main-thread frames a second on a 120 Hz screen with nobody touching the
// page, each 3 to 5 ms: half the main thread, in every look, so every hover, scroll and typed letter started from a
// thread that was already half used. Four things kept it going, and this check pins each by what it IS (a count, a
// computed value), then the result by what Chrome did (a DevTools trace):
//
//   anchor    The Activity bar's focus-ring clip frame (.d-abclip, leftrail 80-bar.src.css) is positioned on the bar with
//             CSS anchor positioning. An anchored box whose anchor exists is laid out again after every whole-document
//             layout and asks for one more frame. The bar names its anchor only while the focus is inside it.
//   old chat  The first chat (.pm6-chat-root) stays in the page under the 5.6 chat. Hidden with content-visibility its
//             14 animations kept ticking on the main thread; it is display: none while it is covered (21-shell-perf.css).
//   listener  One animationiteration listener on the document (the chat's send/stop chip) makes Chrome wake the main
//             thread at every loop boundary of every CSS animation on the page (about 10 main frames a second at rest).
//             It is STILL THERE: the timer that replaced it was taken out of this landing on 2026-11-12 (the owner's
//             rule after its reviews kept finding edge cases; the work is kept on branch perf/stop-chip-timer-20261112).
//             Until it returns the listener and the events it hears are LOGGED here, not judged; the frame bound
//             below is judged with them in.
//   glyphs    A moving part inside an svg that is a flex or grid item dirties layout up to the document's root on every
//             tick; inside a block of the svg's own size the layout stays in the svg.
//
// Then, per look, on Settings and Home, after the page has settled and with the idle warm-up queue off (?pm-warm=0,
// its own check is perf-warm-watch), a 4 s trace:
//   - main-thread frames a second are at most 65% of the screen's refresh rate. First runs, 120 Hz Windows host,
//     2026-11-11: 94 to 99% before in all four looks; 3 to 21% after (3 to 25 frames a second: what is left is timers,
//     so the count does not grow with the refresh rate, and 65% keeps room on a 60 Hz screen too);
//   - whole-document layouts are at most 10 a second (a count, not a share: before, one a frame in Basic and Glass,
//     117 to 120 a second, and 14 to 25 a second in Retro and NieR whose glyphs step; after, 0 to 4.2);
//   - (logged, not judged, while the chip's listener stays: how many animationiteration events reached a listener.)
//
// --set looks=<a,b>   default basic-dark,glass-dark,retro-dark,nier-dark; all ten with looks=all
// --set settle=<ms>   wait after load before the first measurement (default 40000: start-up work and the chat's demo run)
// --set ms=<ms>       length of each trace (default 4000)
// --set frames=<pct>  the frames bound, percent of the refresh rate (default 65); --set layouts=<n> a second (default 10)
// Runs on both surfaces (--set sandbox=0 and 1). A cell that could not be judged (no trace, no refresh rate) fails.
import { traceWindow } from '../helpers/frame-trace.mjs';
import { muteSound, refreshRate, parkPointer } from '../helpers/quiet-page.mjs';

const ALL = ['basic-light', 'basic-dark', 'friendly-light', 'friendly-dark', 'glass-light', 'glass-dark', 'retro-light', 'retro-dark', 'nier-light', 'nier-dark'];
const VIEWS = { settings: 'settings', home: 'dashboard' };

// What the page is, read in the page.
const STRUCTURE = () => {
	const out = {};
	const desc = (el) => { if (!el) return 'none'; const c = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || ''; return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (c.trim() ? '.' + c.trim().split(/\s+/).slice(0, 3).join('.') : ''); };
	const bar = document.querySelector('#activityBar');
	const clip = document.querySelector('.d-abclip');
	const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height }; };
	out.bar = bar ? { anchorName: getComputedStyle(bar).anchorName, rect: rect(bar), focusInside: bar.contains(document.activeElement) } : null;
	out.clip = clip ? { display: getComputedStyle(clip).display, rect: rect(clip) } : null;
	// the covered first chat
	const panel = document.querySelector('#chatPanel');
	const old = panel && panel.querySelector(':scope > .float-content.pm6-chat-root');
	out.chat = {
		covered: !!(panel && panel.getAttribute('data-pm56') === 'on'), tour: document.documentElement.hasAttribute('data-o55-tour'), found: !!old,
		boxes: old ? old.getClientRects().length : -1,
		running: old ? old.getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length : -1
	};
	// every running animation inside a glyph svg: is that svg a flex or grid item?
	const hosts = new Map(); let glyphAnims = 0;
	for (const a of document.getAnimations()) {
		if (a.playState !== 'running') continue;
		const el = a.effect && a.effect.target; if (!el) continue;
		const svg = el.matches && el.matches('svg.nx') ? el : el.closest && el.closest('svg.nx'); if (!svg || !svg.parentElement) continue;
		glyphAnims++;
		const d = getComputedStyle(svg.parentElement).display;
		if (/flex|grid/.test(d)) { const k = desc(svg.parentElement) + ' (' + d + ')'; hosts.set(k, (hosts.get(k) || 0) + 1); }
	}
	out.glyphs = { animations: glyphAnims, itemHosts: [...hosts].map(([k, n]) => `${k} x${n}`) };
	return out;
};

export default async function (t) {
	const looks = String(t.args.looks || 'basic-dark,glass-dark,retro-dark,nier-dark') === 'all' ? ALL : String(t.args.looks || 'basic-dark,glass-dark,retro-dark,nier-dark').split(',').filter(Boolean);
	const ms = Number(t.args.ms || 4000), framesPct = Number(t.args.frames || 65), layoutsMax = Number(t.args.layouts || 10);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	const cdp = await t.page.context().newCDPSession(t.page);
	await t.page.waitForTimeout(Number(t.args.settle ?? 40000));

	// listeners on the document and the window of the page's own frame, where the DevTools protocol can name them (the
	// top page; in the sandbox surface the app is a frame inside it and the trace's dispatch count below judges alone)
	const sandbox = f !== t.page.mainFrame();
	if (!sandbox) {
		const heard = [];
		for (const expr of ['document', 'window']) {
			const { result } = await cdp.send('Runtime.evaluate', { expression: expr, objectGroup: 'perf-rest' });
			const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
			for (const l of listeners) if (l.type === 'animationiteration') heard.push(`${expr} ${l.scriptId}:${l.lineNumber}`);
		}
		await cdp.send('Runtime.releaseObjectGroup', { objectGroup: 'perf-rest' }).catch(() => {});
		t.log(`NOTE animationiteration listeners on the document or the window (the chat's Stop chip keeps one for now; logged, not judged): ${heard.length ? heard.join('; ') : 'none'}`);
	} else t.log('NOTE sandbox surface: document listeners are not named here; the dispatch count of each trace is logged');

	for (const look of looks) {
		await t.app.look(look);
		await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
		await t.page.waitForTimeout(Number(t.args.lookSettle ?? 5000));
		for (const [view, pageId] of Object.entries(VIEWS)) {
			await f.evaluate((id) => PM_PAGES.go(id), pageId);
			await parkPointer(t.page, W, H);
			await t.page.waitForTimeout(Number(t.args.viewSettle ?? 6000));
			const at = `${look} ${view}`;

			// ---- what the page is ----
			const s = await f.evaluate(STRUCTURE);
			await t.check(`${at}: the Activity bar names no anchor at rest`, !!s.bar && !s.bar.focusInside && s.bar.anchorName === 'none', s.bar ? `anchor-name ${s.bar.anchorName}${s.bar.focusInside ? ' (focus is inside the bar: not at rest)' : ''}` : 'no #activityBar');
			if (s.clip && s.clip.display !== 'none') {
				const r = s.clip.rect, off = r.w * r.h === 0 || r.right <= 0 || r.bottom <= 0 || r.left >= W || r.top >= H;
				await t.check(`${at}: the ring's clip frame is an empty box off the page at rest`, off, `${r.w.toFixed(1)}x${r.h.toFixed(1)} at ${r.left.toFixed(1)},${r.top.toFixed(1)}`);
			}
			await t.check(`${at}: the covered first chat has no box and no running animation`, s.chat.covered && !s.chat.tour && s.chat.found && s.chat.boxes === 0 && s.chat.running === 0,
				!s.chat.found ? 'no .pm6-chat-root under #chatPanel: could not judge' : !s.chat.covered || s.chat.tour ? `not covered here (data-pm56 ${s.chat.covered ? 'on' : 'off'}, tour ${s.chat.tour}): could not judge` : `${s.chat.boxes} boxes, ${s.chat.running} running animations`);
			await t.check(`${at}: no animated glyph's svg is a flex or grid item`, s.glyphs.animations > 0 && s.glyphs.itemHosts.length === 0,
				s.glyphs.animations ? (s.glyphs.itemHosts.length ? s.glyphs.itemHosts.join('; ') : `${s.glyphs.animations} running glyph animations, every svg in a block`) : 'no running glyph animation here: could not judge');

			// ---- what Chrome did ----
			const hz = await refreshRate(f);
			await parkPointer(t.page, W, H);
			await t.page.waitForTimeout(1500);
			let x = null, err = '';
			try { x = await traceWindow(cdp, { ms, url: f.url() }); } catch (e) { err = String(e && e.message || e); }
			const judged = !!x && x.secs > ms / 1000 * 0.8 && hz > 20 && hz < 400;
			if (!judged) { await t.check(`${at}: the rest trace could be judged`, false, err || `trace ${x ? x.secs + ' s' : 'missing'}, refresh ${hz.toFixed(1)} Hz`); continue; }
			const fr = x.mainFrames.perSec, pct = fr / hz * 100, lay = x.wholeLayoutsPerSec, it = (x.dispatched && x.dispatched.animationiteration) || 0;
			t.log(`${at}: ${hz.toFixed(0)} Hz, main frames ${fr}/s (${pct.toFixed(0)}%), frame p50 ${x.mainFrames.p50} p95 ${x.mainFrames.p95} ms, main thread ${Math.round(x.cost.main)} ms/s, layouts ${x.layoutPerSec}/s of which whole-document ${lay}/s, drawn ${x.drawn.perSec}/s`);
			await t.check(`${at}: main-thread frames at rest are at most ${framesPct}% of the refresh rate`, pct <= framesPct, `${fr}/s of ${hz.toFixed(0)} Hz = ${pct.toFixed(0)}%`);
			await t.check(`${at}: whole-document layouts at rest are at most ${layoutsMax} a second`, lay <= layoutsMax, `${lay}/s (${x.layoutPerSec}/s layouts of any kind)`);
			t.log(`${at}: NOTE ${it} animationiteration events reached a listener in ${x.secs} s (logged, not judged)`);
		}

		// ---- the anchor comes back with the focus, once per look ----
		const focus = await f.evaluate(() => {
			const bar = document.querySelector('#activityBar'), tile = bar && bar.querySelector('.icon');
			if (!tile) return { ok: false, why: 'no tile in #activityBar' };
			tile.focus({ preventScroll: true });
			if (document.activeElement !== tile) return { ok: false, why: 'the first tile did not take the focus' };
			const clip = document.querySelector('.d-abclip'), b = bar.getBoundingClientRect(), c = clip && getComputedStyle(clip).display !== 'none' ? clip.getBoundingClientRect() : null;
			const out = { ok: true, anchorName: getComputedStyle(bar).anchorName, bar: [b.left, b.top, b.right, b.bottom], clip: c ? [c.left, c.top, c.right, c.bottom] : null };
			tile.blur();
			out.after = getComputedStyle(bar).anchorName;
			return out;
		});
		if (!focus.ok) await t.check(`${look}: the Activity bar's focus could be judged`, false, focus.why);
		else {
			await t.check(`${look}: the Activity bar names its anchor while a tile has the focus, and drops it after`, focus.anchorName === '--d-abbar' && focus.after === 'none', `focused ${focus.anchorName}, after blur ${focus.after}`);
			if (focus.clip) {
				const [bl, bt, br, bb] = focus.bar, [cl, ct, cr, cb] = focus.clip;
				// the frame is the bar's box less the bar's own top and bottom borders (none, or Liquid Glass's 1 px sheet border)
				const fits = Math.abs(cl - bl) <= 0.6 && Math.abs(cr - br) <= 0.6 && ct - bt >= -0.6 && ct - bt <= 1.6 && bb - cb >= -0.6 && bb - cb <= 1.6;
				await t.check(`${look}: with the focus inside, the clip frame lies on the bar`, fits, `bar ${focus.bar.map((v) => v.toFixed(1)).join(',')} frame ${focus.clip.map((v) => v.toFixed(1)).join(',')}`);
			} else t.log(`${look}: NOTE no clip frame in this look (NieR's brackets draw the focus): only the anchor name is judged`);
		}
		await parkPointer(t.page, W, H);
	}
}
