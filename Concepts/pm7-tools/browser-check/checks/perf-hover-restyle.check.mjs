// A hover, a press or a selection change restyles only what it changes (2026-11-11 performance pass, lane J).
//
// Chrome keeps ONE invalidation set per pseudo-class, class or attribute for the whole page, saying what to restyle
// below an element whose state changes. A few rules (mostly NieR cursor rules, which cost in every look) made the
// :hover, .pmh-on, .active, aria-selected, :active and :has() sets "whole subtree" or put bare tags (svg, span, b, path)
// into them, so a pointer moving from one Usage card to the next restyled about 750 elements (12.8 ms of style on a
// 120 Hz screen whose whole frame is 8.3 ms; lane I). Those rules are keyed on classes now, and build.py's lint
// (tools/invalidation_sets.py) fails a build that brings one back.
//
// Here, in each look, for real input: the pointer moving between two Usage cards, two Files rows, two rows of a rail
// menu, onto and off a title-bar control; a Home panel tab switch (click); a notification arriving; and, with the
// onboarding window open, a press on one of its buttons (:active is set on the whole ancestor chain of what is pressed).
// Each change is marked from inside its own input task (a capture listener on pointermove / pointerdown / click; the
// notification marks just before it is posted) and traced. Count the largest UpdateLayoutTree elementCount
// from the start of the renderer RunTask containing that mark through 60ms after it. Native hover processing can
// resolve style before any JavaScript event listener, so post-mark-only counting misses real input work. The exact
// containing task supplies the start, never a guessed look-back; missing task coverage is unjudgeable.
// DevTools holds the animation clock at playback rate 0 during each trace,
// then restores 1: existing loader/icon animation work cannot answer a question about this input. The input's selector
// changes and a transition's first restyle still happen at the held time (perf-hover-hold proves both). This never
// calls WAAPI pause/play, which would override the still page's CSS play state on Chrome 157. The median must stay under the bound,
// which sits between what main does and what the change does (counts, not milliseconds). A cell that could not be
// judged fails: ALL n intended changes must have finite, nonnegative element counts. Missing marks/counts are logged;
// the same complete-coverage rule applies to presses.
// Attribution only: --set traceDir=<folder> retains gzip traces; --set track=1 adds invalidation tracking + state.
// Both surfaces.   --set looks=<a,b>  --set scen=<a,b>  --set n=<triggers>  --set report=1 (no bounds: numbers only)
import { muteSound } from '../helpers/quiet-page.mjs';
import { withAnimationHold } from '../helpers/animation-hold.mjs';
import { LOOKS } from '../browser-check.config.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';

// Ten looks x both surfaces, Windows 120 Hz, medians of 4, origin/main's page (main5) -> this branch (j-6):
//   Usage card to card   main 216-297 in every cell -> 62-160                         bound 190 (bites in all 20)
//   Files row to row     main 81-179 -> 78-150 (main over 160 in 7 cells)             bound 160 (bites in those)
//   rail menu rows, title-bar control: 67-143 on both builds, the high and low values trading places between runs
//   whatever the build (the hover light's own frames): guards at 180, not bites
//   press on a window button 5-106 on both, tab switch 49-97, notification 69-90: guards
// So the change is measured where whole subtrees are big (a Usage card's charts); rows, whose subtrees are small, move
// little. A bound sits above the change's worst cell and below main's worst; where the builds match it is a guard.
const BOUND = { usage: 190, files: 160, rail: 180, titlebar: 180, tab: 400, notify: 300, press: 150 };

const CATS = ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing'].join(',');

export async function trace(cdp, during, opts = {}) {
	if (!opts.frame?.evaluate) throw new Error('input trace requires a renderer completion barrier');
	await cdp.send('Tracing.start', { categories: CATS + (opts.track ? ',disabled-by-default-devtools.timeline.invalidationTracking,disabled-by-default-devtools.timeline.stack' : ''), transferMode: 'ReturnAsStream' });
	let failure;
	try {
		await during();
		// Node's delay does not acknowledge the renderer's last input task. This mark is outside every input window.
		await opts.frame.evaluate(() => performance.mark('jr:trace:done'));
	} catch (e) { failure = e; }
	const done = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
	await cdp.send('Tracing.end');
	const { stream } = await done;
	const parts = [];
	for (;;) { const r = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); parts.push(r.base64Encoded ? Buffer.from(r.data, 'base64').toString('utf8') : r.data); if (r.eof) break; }
	await cdp.send('IO.close', { handle: stream });
	if (failure) throw failure;
	const raw = parts.join('');
	if (opts.keep) { mkdirSync(dirname(opts.keep), { recursive: true }); writeFileSync(opts.keep, gzipSync(raw)); }
	const t = JSON.parse(raw);
	return Array.isArray(t) ? t : t.traceEvents || [];
}

// Diagnostic flags leave the default categories and assertions unchanged; raw evidence stays in the caller's folder.
const traceOptions = (t, tag) => ({ track: String(t.args.track || '0') === '1', keep: t.args.traceDir ? join(String(t.args.traceDir), tag + '.json.gz') : null });
const DEBUG_STATE = () => {
 const loops = new Map();
 for (const a of document.getAnimations()) {
  try {
   if (a.playState !== 'running' || a.effect.getTiming().iterations !== Infinity) continue;
   const e = a.effect.target, cls = typeof e?.className === 'string' ? e.className : e?.className?.baseVal || '';
   const key = `${a.animationName || '?'} on ${e?.tagName || '?'}#${e?.id || ''}.${cls}`;
   loops.set(key, (loops.get(key) || 0) + 1);
  } catch (_) { /* an animation removed during inspection */ }
 }
 return { loops: [...loops], tabs: [...document.querySelectorAll('[role="tab"]')].filter((e) => e.getClientRects().length).map((e) => ({ text: e.textContent?.trim().slice(0, 80), id: e.id, selected: e.getAttribute('aria-selected'), cls: e.className })) };
};

// per mark named prefix*: the elements the change restyled
function restyled(events, prefix) {
	const marks = events.filter((e) => e.cat && e.cat.includes('blink.user_timing') && typeof e.name === 'string' && e.name.startsWith(prefix));
	const out = [];
	for (const m of marks) {
		const same = (e) => e.pid === m.pid && e.tid === m.tid;
		const ult = [];
		const open = [];
		const tasks = [], taskOpen = [];
		for (const e of events) {
			if (e.name === 'RunTask' && same(e)) {
				if (e.ph === 'X') tasks.push({ start: e.ts, end: e.ts + (e.dur || 0) });
				else if (e.ph === 'B') taskOpen.push(e);
				else if (e.ph === 'E') { const st = taskOpen.pop(); if (st) tasks.push({ start: st.ts, end: e.ts }); }
			}
			if (e.name !== 'UpdateLayoutTree' || !same(e)) continue;
			if (e.ph === 'X') ult.push({ ts: e.ts, end: e.ts + (e.dur || 0), n: e.args?.elementCount ?? e.args?.endData?.elementCount ?? null });
			else if (e.ph === 'B') open.push(e);
			else if (e.ph === 'E') { const b = open.pop(); if (b) ult.push({ ts: b.ts, end: e.ts, n: e.args?.elementCount ?? e.args?.endData?.elementCount ?? b.args?.elementCount ?? b.args?.endData?.elementCount ?? null }); }
		}
		// The animation clock is held before tracing. Keep the largest input recalc in the existing 60ms window,
		// including the first recalc of a transition the input starts; never subtract elements by a heuristic.
		const task = tasks.filter((t) => t.start <= m.ts && t.end >= m.ts).sort((a,b) => b.start-a.start)[0];
		if (!task) { out.push(null); continue; }
		const win = ult.filter((u) => u.ts >= task.start && u.ts <= m.ts + 60000 && validCount(u.n));
		out.push(win.length ? Math.max(...win.map((u) => u.n)) : null);
	}
	return out;
}
const validCount = (x) => Number.isFinite(x) && x >= 0;
// Coverage precedes the median: no unmeasured change is silently removed from the sample.
const median = (a, expected = a.length) => {
 if (!(expected > 0) || a.length !== expected || !a.every(validCount)) return null;
 const v = a.slice().sort((x, y) => x - y);
 return v[Math.floor((v.length - 1) / 2)];
};
const measurementDetail = (counts, n) => {
 const missing = counts.flatMap((x, i) => validCount(x) ? [] : [i]);
 return `${counts.filter(validCount).length}/${n} valid, ${counts.length} marks; missing measurements at marks ${JSON.stringify(missing)}, missing marks ${Math.max(0, n - counts.length)}, extra marks ${Math.max(0, counts.length - n)}; counts ${JSON.stringify(counts)}`;
};

// in the page: mark each change from inside its own input task
const ARM = () => {
	if (window.__jArm) return;
	window.__jArm = { tag: null, i: 0 };
	const on = (type) => document.addEventListener(type, () => { const a = window.__jArm; if (a.tag && a.type === type) performance.mark('jr:' + a.tag + ':' + (a.i++)); }, true);
	['pointermove', 'pointerdown', 'pointerup', 'click'].forEach(on);
};
const ready = (f) => f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
const center = (r) => ({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) });

// each returns [pointA, pointB] (or a plan) inside the app frame, offset by the frame's own position in the window
const SCEN = {
	usage: { view: 'usage', type: 'pointermove', find: () => {
		const c = [...document.querySelectorAll('.pmu-card')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 80 && r.top > 80 && r.bottom < innerHeight - 20; });
		return c.length >= 2 ? c.slice(0, 2).map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }) : null;
	} },
	files: { view: 'dashboard', type: 'pointermove', find: () => {
		const rows = [...document.querySelectorAll('.fm-row')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 60 && r.height > 12 && r.top > 80 && r.bottom < innerHeight - 40 && document.elementFromPoint(r.left + Math.min(90, r.width / 2), r.top + r.height / 2)?.closest('.fm-row') === e; });
		return rows.length >= 4 ? rows.slice(2, 4).map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left + Math.min(90, r.width / 2)), y: Math.round(r.top + r.height / 2) }; }) : null;
	} },
	rail: { view: 'dashboard', type: 'pointermove', setup: () => {
		const names = [...new Set([...Object.keys(window.PMR?.neonMap || {}), ...Object.keys(window.PM_ICONS || {})])].slice(0, 8);
		window.PMR.menu.open({ id: 'jr-rail', label: 'Check', value: 'v1', groups: [{ items: names.map((n, i) => ({ label: n, icon: n, value: 'v' + i, meta: i % 2 ? 'meta' : '' })) }] }, document.querySelector('.activity-bar .icon') || document.body);
	}, find: () => {
		const rows = [...document.querySelectorAll('.pmr-menu .pmr-mi')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 60 && r.height > 12 && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('.pmr-mi') === e; });
		return rows.length >= 4 ? rows.slice(2, 4).map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }) : null;
	}, teardown: () => { try { window.PMR.menu.closeAll(); } catch (e) { /* none */ } } },
	titlebar: { view: 'dashboard', type: 'pointermove', find: () => {
		const bar = document.querySelector('.title-bar'); if (!bar) return null;
		const ctl = [...bar.querySelectorAll('button, select, [role="button"]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 14 && r.height > 14 && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('button, select, [role="button"]') === e; });
		const c = ctl.find((e) => e.id === 'themeSelect') || ctl[ctl.length - 1]; if (!c) return null;
		const r = c.getBoundingClientRect(), y = Math.round(r.top + r.height / 2), b = bar.getBoundingClientRect();
		for (let x = Math.round(b.left + b.width / 2); x > b.left + 20; x -= 12) {
			const el = document.elementFromPoint(x, y);
			if (el && bar.contains(el) && !el.closest('button, select, input, a, [role="button"], [role="tab"], [data-pmh-kind]')) return [{ x, y }, { x: Math.round(r.left + r.width / 2), y }];
		}
		return null;
	} },
	tab: { view: 'dashboard', type: 'click', find: () => {
		const lists = [...document.querySelectorAll('#panel-dashboard [role="tablist"], .page.active [role="tablist"]')].map((l) => [...l.querySelectorAll('[role="tab"]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 10 && r.top > 40 && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('[role="tab"]') === e; })).filter((x) => x.length >= 2);
		return lists[0] ? lists[0].slice(0, 2).map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }) : null;
	} },
	notify: { view: 'dashboard', type: 'none', find: () => (typeof window.toast === 'function' ? [] : null) }
};

async function frameOffset(t, f) {
	if (f === t.page.mainFrame()) return { x: 0, y: 0 };
	const el = await f.frameElement(); const b = await el.boundingBox(); return { x: b ? b.x : 0, y: b ? b.y : 0 };
}

async function runScenario(t, f, cdp, animationCdp, name, n, S) {
	const sc = SCEN[name];
	await f.evaluate((v) => window.PM_PAGES && PM_PAGES.go(v), sc.view);
	await t.page.mouse.move(1914, 1060);
	await t.page.waitForTimeout(1400);
	if (sc.setup) { await f.evaluate(sc.setup).catch(() => {}); await t.page.waitForTimeout(800); }
	const pts = await f.evaluate(sc.find).catch(() => null);
	const off = await frameOffset(t, f);
	if (!pts) { if (sc.teardown) await f.evaluate(sc.teardown).catch(() => {}); return { name, judged: false, why: 'nothing to point at' }; }
	const P = pts.map((p) => ({ x: p.x + off.x, y: p.y + off.y }));
	if (P.length) { await t.page.mouse.move(P[1].x, P[1].y); await t.page.waitForTimeout(700); }
	await f.evaluate(ARM);
	const tag = name + '-' + Date.now();
	const traceOpts = traceOptions(t, tag);
	await f.evaluate(([tg, ty]) => { window.__jArm.tag = tg; window.__jArm.type = ty; window.__jArm.i = 0; }, [tag, sc.type]);
	const ev = await withAnimationHold(animationCdp, f, () => trace(cdp, async () => {
		for (let i = 0; i < n; i++) {
			if (name === 'notify') {
				await f.evaluate(([tg, k]) => { performance.mark('jr:' + tg + ':' + k); window.toast('Run finished ' + k, 'lane J check', 'success'); }, [tag, i]);
				await t.page.waitForTimeout(1300);
			} else if (name === 'tab') {
				const p = P[i % 2]; await t.page.mouse.click(p.x, p.y); await t.page.waitForTimeout(1100);
			} else {
				const p = P[i % 2]; await t.page.mouse.move(p.x, p.y); await t.page.waitForTimeout(450);
			}
		}
	}, { ...traceOpts, frame: f }));
	await f.evaluate(() => { window.__jArm.tag = null; });
	if (sc.teardown) await f.evaluate(sc.teardown).catch(() => {});
	const counts = restyled(ev, 'jr:' + tag + ':');
	const med = median(counts, n);
	return { name, judged: med != null, counts, med, why: measurementDetail(counts, n), traceFile: traceOpts.keep || undefined, debugState: traceOpts.track ? await f.evaluate(DEBUG_STATE) : undefined };
}

export default async function (t) {
	const looks = String(t.args.looks || LOOKS.join(',')).split(',');
	const scen = String(t.args.scen || 'usage,files,rail,titlebar,tab,notify,press').split(',');
	const n = Number(t.args.n || 4);
	const report = String(t.args.report || '0') === '1';
	const css = t.args.css ? readFileSync(String(t.args.css), 'utf8') : null;
	await muteSound(t.page);
	await t.viewport(1920, 1080);
	const rows = [];
	for (const surface of t.app.surfaces()) {
		const S = `[${surface}] `;
		const app = scen.filter((s) => s !== 'press');
		if (app.length) {
			const f = await t.app.open({ query: 'pm-warm=0', sandbox: surface === 'sandbox' });
			if (css) await f.addStyleTag({ content: css });
			const cdp = await t.page.context().newCDPSession(t.page);
			// An opaque sandbox can be an OOPIF: its animation clock belongs to its own DevTools target.
			const animationCdp = await t.page.context().newCDPSession(f);
			for (const look of looks) {
				await t.app.look(look); await ready(f); await t.page.waitForTimeout(1500);
				const lookState = await f.evaluate(DEBUG_STATE);
				const pmlFlip4 = lookState.loops.filter(([key]) => key.startsWith('pml-flip4 on ')).reduce((sum, [, count]) => sum + count, 0);
				t.log(`${S}${look}: before holds, ${pmlFlip4} running pml-flip4 loops; clock held through CDP only during input traces`);
				for (const name of app) {
					const r = await runScenario(t, f, cdp, animationCdp, name, n, S).catch((e) => ({ name, judged: false, why: String(e.message).slice(0, 120) }));
					rows.push({ surface, look, pmlFlip4, lookState, ...r });
					const b = BOUND[name];
					if (report) { t.log(`${S}${look} ${name}: median ${r.med} (${r.why})`); continue; }
					await t.check(`${S}${look} ${name}: restyled by the change under ${b}`, r.judged && r.med < b, r.judged ? `median ${r.med}; ${r.why}` : `could not judge: ${r.why || 'no marks'}`);
				}
			}
			await cdp.detach().catch(() => {});
			await animationCdp.detach().catch(() => {});
		}
		if (scen.includes('press')) {
			const f = await t.app.open({ onboarding: true, query: 'o55=screen=welcome&pm-warm=0', sandbox: surface === 'sandbox' });
			if (css) await f.addStyleTag({ content: css });
			await f.waitForFunction(() => !!document.querySelector('#pm-o55-onboarding .o55-win') && window.O55?.ui?.applyLook, null, { timeout: 60000 }).catch(() => {});
			const cdp = await t.page.context().newCDPSession(t.page);
			const animationCdp = await t.page.context().newCDPSession(f);
			for (const look of looks) {
				const [fam, mode] = look.split('-');
				await f.evaluate(([a, b]) => window.O55.ui.applyLook(a, b), [fam, mode]).catch(() => {});
				await t.page.waitForTimeout(2200);
				const lookState = await f.evaluate(DEBUG_STATE);
				const pmlFlip4 = lookState.loops.filter(([key]) => key.startsWith('pml-flip4 on ')).reduce((sum, [, count]) => sum + count, 0);
				t.log(`${S}${look} press: before holds, ${pmlFlip4} running pml-flip4 loops`);
				// a look change can leave the window mid-transition: wait up to 5 s for a button that is on top
				const btn = await f.waitForFunction(() => {
					const b = [...document.querySelectorAll('#pm-o55-onboarding .o55-layer:not(.o55-out) .o55-btn')].find((e) => { const r = e.getBoundingClientRect(); return r.width > 30 && r.height > 20 && !e.hasAttribute('aria-disabled') && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('.o55-btn') === e; });
					if (!b) return null; const r = b.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: r.width };
				}, null, { timeout: 5000, polling: 200 }).then((h) => h.jsonValue(), () => null);
				const off = await frameOffset(t, f);
				let r = { name: 'press', judged: false, why: 'no button' };
				if (btn) {
					const p = { x: btn.x + off.x, y: btn.y + off.y };
					await t.page.mouse.move(p.x, p.y); await t.page.waitForTimeout(500);
					await f.evaluate(ARM);
					const tag = 'press-' + Date.now();
					const traceOpts = traceOptions(t, tag);
					await f.evaluate((tg) => { window.__jArm.tag = tg; window.__jArm.type = 'pointerdown'; window.__jArm.i = 0; }, tag);
					const ev = await withAnimationHold(animationCdp, f, () => trace(cdp, async () => {
						for (let i = 0; i < n; i++) {
							await t.page.mouse.move(p.x, p.y); await t.page.waitForTimeout(250);
							await t.page.mouse.down(); await t.page.waitForTimeout(260);
							// released off the button: a press with no click (no screen change)
							await t.page.mouse.move(p.x, p.y + 240); await t.page.mouse.up(); await t.page.waitForTimeout(350);
						}
					}, { ...traceOpts, frame: f }));
					await f.evaluate(() => { window.__jArm.tag = null; });
					const counts = restyled(ev, 'jr:' + tag + ':');
					const med = median(counts, n);
					r = { name: 'press', judged: med != null, counts, med, why: measurementDetail(counts, n), traceFile: traceOpts.keep || undefined, debugState: traceOpts.track ? await f.evaluate(DEBUG_STATE) : undefined };
				}
				rows.push({ surface, look, pmlFlip4, lookState, ...r });
				if (report) { t.log(`${S}${look} press: median ${r.med} (${r.why})`); continue; }
				await t.check(`${S}${look} press: restyled by the press under ${BOUND.press}`, r.judged && r.med < BOUND.press, r.judged ? `median ${r.med}; ${r.why}` : `could not judge: ${r.why}`);
			}
			await cdp.detach().catch(() => {});
			await animationCdp.detach().catch(() => {});
		}
	}
	if (t.args.out) (await import('node:fs')).writeFileSync(String(t.args.out), JSON.stringify(rows, null, 1));
	if (report) await t.check('report written', rows.length > 0, `${rows.length} cells`);
}

// The isolation witness reuses the exact tracing/counting path of this check.
export { restyled };
