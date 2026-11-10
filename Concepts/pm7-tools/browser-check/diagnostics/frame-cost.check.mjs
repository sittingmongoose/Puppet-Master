// Frame cost per look and view (diagnostic, asserts nothing about speed): what each look costs per second while the
// page rests, while the pointer sweeps it and while it scrolls, read from a DevTools trace (helpers/frame-trace.mjs),
// plus a census of what is running: animations and what they animate, callbacks per second by source, backdrop
// filters, filters, blend modes and compositor layers.
//   browser-check run diagnostics/frame-cost.check.mjs --set page=<build> --set out=<file.json>
//   --set looks=glass-dark,retro-dark   --set views=home,usage,settings,orchestrator,wizard,projects,onboarding
//   --set windows=idle,sweep,scroll     --set ms=3000   --set traces=<dir> keeps each raw trace   --set size=1920x1080
//   --set css='<rules>' adds a trial stylesheet   --set warm=0 loads with ?pm-warm=0   --set timeline=<s> rests and samples   --set floor=1 prices one frame
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { LOOKS } from '../browser-check.config.mjs';
import { traceWindow } from '../helpers/frame-trace.mjs';

// Counts callbacks by source while armed; passes straight through otherwise
const PROBE = () => {
	const P = window.__fc = { armed: false, raf: new Map(), timer: new Map(), mut: 0, styleWrites: new Map() };
	const site = () => {
		const lines = String(new Error().stack || '').split('\n').slice(3, 7).map((l) => l.trim().replace(/^at /, '').replace(/\(?file:\/\/[^:)]*/, '').replace(/[()]/g, ''));
		return lines.filter(Boolean).slice(0, 2).join(' < ') || '?';
	};
	const bump = (map, k) => map.set(k, (map.get(k) || 0) + 1);
	const raf = window.requestAnimationFrame;
	window.requestAnimationFrame = function (fn) {
		if (!P.armed || typeof fn !== 'function') return raf.call(window, fn);
		const k = site();
		return raf.call(window, function (ts) { bump(P.raf, k); return fn.call(this, ts); });
	};
	for (const kind of ['setTimeout', 'setInterval']) {
		const real = window[kind];
		window[kind] = function (fn, ...rest) {
			if (!P.armed || typeof fn !== 'function') return real.call(window, fn, ...rest);
			const k = kind + ' ' + (rest[0] | 0) + 'ms ' + site();
			return real.call(window, function (...a) { if (P.armed) bump(P.timer, k); return fn.apply(this, a); }, ...rest);
		};
	}
	const setProp = CSSStyleDeclaration.prototype.setProperty;
	CSSStyleDeclaration.prototype.setProperty = function (name, ...rest) {
		if (P.armed && typeof name === 'string' && name.startsWith('--')) {
			const owner = this === document.documentElement.style ? ':root' : this === document.body?.style ? 'body' : 'el';
			bump(P.styleWrites, owner + ' ' + name);
		}
		return setProp.call(this, name, ...rest);
	};
	P.arm = () => { P.raf.clear(); P.timer.clear(); P.styleWrites.clear(); P.mut = 0; P.t0 = performance.now(); P.armed = true; if (!P.mo) { P.mo = new MutationObserver((l) => { if (P.armed) P.mut += l.length; }); P.mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true }); } };
	P.read = () => {
		P.armed = false; const s = (performance.now() - P.t0) / 1000;
		const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => [Math.round(v / s * 10) / 10, k]);
		const tot = (m) => Math.round([...m.values()].reduce((a, b) => a + b, 0) / s * 10) / 10;
		return { rafPerSec: tot(P.raf), raf: top(P.raf, 8), timersPerSec: tot(P.timer), timers: top(P.timer, 8), mutationsPerSec: Math.round(P.mut / s), varWritesPerSec: tot(P.styleWrites), varWrites: top(P.styleWrites, 8) };
	};
};

// What is on screen and running, read once
const CENSUS = () => {
	const vw = innerWidth, vh = innerHeight, view = vw * vh;
	const desc = (el, pseudo) => {
		const c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') : '';
		return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (c ? '.' + c : '') + (pseudo || '');
	};
	const area = (el) => {
		const r = el.getBoundingClientRect();
		const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)), h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
		return { a: w * h, w: Math.round(r.width), h: Math.round(r.height) };
	};
	const shown = (el) => { try { return el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true }); } catch (e) { return !!el.getClientRects().length; } };
	const COMPOSITED = new Set(['transform', 'opacity', 'translate', 'rotate', 'scale']);
	const anims = new Map();
	for (const a of document.getAnimations()) {
		if (a.playState !== 'running') continue;
		const eff = a.effect; if (!eff) continue;
		const target = eff.target; if (!target) continue;
		const timing = eff.getComputedTiming();
		let props = [];
		try { props = [...new Set(eff.getKeyframes().flatMap((k) => Object.keys(k)))].filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)); } catch (e) { /* none */ }
		const vis = shown(target), ar = vis ? area(target) : { a: 0, w: 0, h: 0 };
		const name = a.animationName || (a.transitionProperty ? 'transition:' + a.transitionProperty : 'waapi');
		const k = name + ' | ' + props.join(',');
		const row = anims.get(k) || { name, props, n: 0, shown: 0, area: 0, endless: timing.iterations === Infinity, ms: timing.duration, onCompositor: props.length > 0 && props.every((p) => COMPOSITED.has(p)), eg: desc(target, eff.pseudoElement) };
		row.n++; if (vis && ar.a > 0) { row.shown++; row.area += ar.a; }
		anims.set(k, row);
	}
	const backdrop = [], filters = [], blends = [], overlays = [];
	let nodes = 0, rendered = 0, willChange = 0;
	const look = (el, pseudo) => {
		const cs = getComputedStyle(el, pseudo || undefined);
		if (pseudo && (cs.content === 'none' || cs.content === 'normal') ) return;
		if (cs.display === 'none') return;
		const bf = cs.backdropFilter || cs.webkitBackdropFilter, fl = cs.filter, mb = cs.mixBlendMode;
		if (cs.willChange && cs.willChange !== 'auto') willChange++;
		const need = (bf && bf !== 'none') || (fl && fl !== 'none') || (mb && mb !== 'normal') || cs.position === 'fixed';
		if (!need) return;
		const ar = area(el); if (!ar.a) return;
		const d = desc(el, pseudo), pct = Math.round(ar.a / view * 1000) / 10;
		if (bf && bf !== 'none') backdrop.push([pct, d, bf.slice(0, 60)]);
		if (fl && fl !== 'none') filters.push([pct, d, fl.slice(0, 60)]);
		if (mb && mb !== 'normal') blends.push([pct, d, mb]);
		if (cs.position === 'fixed' && pct >= 40 && cs.visibility !== 'hidden' && cs.opacity !== '0') overlays.push([pct, d, (cs.animationName !== 'none' ? 'anim ' + cs.animationName + ' ' : '') + (cs.pointerEvents === 'none' ? 'no-pointer ' : '') + 'z' + cs.zIndex + ' op' + cs.opacity]);
	};
	const walk = (root) => {
		for (const el of root.querySelectorAll('*')) {
			nodes++;
			if (!shown(el)) continue;
			rendered++;
			look(el); look(el, '::before'); look(el, '::after');
			if (el.shadowRoot) walk(el.shadowRoot);
		}
	};
	walk(document);
	const top = (rows, n) => rows.sort((a, b) => b[0] - a[0]).slice(0, n);
	const sum = (rows) => Math.round(rows.reduce((a, r) => a + r[0], 0));
	const A = [...anims.values()].map((r) => ({ ...r, area: Math.round(r.area / view * 1000) / 10 })).sort((a, b) => (b.shown > 0) - (a.shown > 0) || a.onCompositor - b.onCompositor || b.area - a.area);
	return {
		nodes, rendered, willChange,
		anims: { running: A.reduce((a, r) => a + r.n, 0), shown: A.reduce((a, r) => a + r.shown, 0), mainThreadShown: A.filter((r) => !r.onCompositor).reduce((a, r) => a + r.shown, 0), rows: A.slice(0, 40) },
		backdrop: { n: backdrop.length, areaPct: sum(backdrop), top: top(backdrop, 12) },
		filters: { n: filters.length, areaPct: sum(filters), top: top(filters, 12) },
		blends: { n: blends.length, areaPct: sum(blends), top: top(blends, 8) },
		overlays: top(overlays, 10),
		theme: document.documentElement.getAttribute('data-theme')
	};
};

const VIEWS = {
	home: (f) => f.evaluate(() => PM_PAGES.go('dashboard')),
	projects: (f) => f.evaluate(() => PM_PAGES.go('projects')),
	wizard: (f) => f.evaluate(() => PM_PAGES.go('wizard')),
	orchestrator: (f) => f.evaluate(() => PM_PAGES.go('orchestrator')),
	usage: (f) => f.evaluate(() => PM_PAGES.go('usage')),
	settings: (f) => f.evaluate(() => PM_PAGES.go('settings'))
};

export default async function (t) {
	const looks = String(t.args.looks || LOOKS.join(',')).split(',').filter(Boolean);
	const views = String(t.args.views || 'home,usage,settings,orchestrator,wizard,projects').split(',').filter(Boolean);
	const windows = String(t.args.windows || 'idle,sweep,scroll').split(',').filter(Boolean);
	const ms = Number(t.args.ms || 3000);
	const [W, H] = String(t.args.size || '1920x1080').split('x').map(Number);
	const traces = t.args.traces ? path.resolve(String(t.args.traces)) : null;
	if (traces) mkdirSync(traces, { recursive: true });
	await t.viewport(W, H);
	await t.page.addInitScript(PROBE);
	// no sound from a measuring browser (Jared's PC): every AudioContext stays suspended and media elements do not play
	if (String(t.args.mute ?? '1') !== '0') await t.page.addInitScript(() => {
		for (const name of ['AudioContext', 'webkitAudioContext']) {
			const Real = window[name]; if (!Real) continue;
			const Muted = function (...a) { const c = new Real(...a); try { c.suspend(); } catch (e) { /* none */ } c.resume = () => Promise.resolve(); return c; };
			Muted.prototype = Real.prototype; window[name] = Muted;
		}
		try { HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; } catch (e) { /* none */ }
	});
	// --set warm=0 turns the page's idle warm-up queue off (?pm-warm=0): the resting state without its frame loop
	const warmQuery = String(t.args.warm ?? '') === '0' ? 'pm-warm=0' : '';
	const onboarding = views.includes('onboarding');
	const appViews = views.filter((v) => v !== 'onboarding');
	const rows = [];
	const cdp = await t.page.context().newCDPSession(t.page);
	const gpu = await t.page.evaluate(() => { try { const c = document.createElement('canvas').getContext('webgl'); const e = c.getExtension('WEBGL_debug_renderer_info'); return c.getParameter(e.UNMASKED_RENDERER_WEBGL); } catch (e) { return String(e); } });
	t.log('GPU ' + gpu);

	const layers = async () => {
		const got = new Promise((resolve) => { const on = (e) => { if (e.layers) { cdp.off('LayerTree.layerTreeDidChange', on); resolve(e.layers); } }; cdp.on('LayerTree.layerTreeDidChange', on); setTimeout(() => resolve(null), 4000); });
		await cdp.send('LayerTree.enable');
		const ls = await got;
		let out = null;
		if (ls) {
			const drawn = ls.filter((l) => l.drawsContent);
			const big = drawn.slice().sort((a, b) => b.width * b.height - a.width * a.height).slice(0, 6);
			const reasons = [];
			for (const l of big) { try { const r = await cdp.send('LayerTree.compositingReasons', { layerId: l.layerId }); reasons.push([l.width + 'x' + l.height, (r.compositingReasonIds || r.compositingReasons || []).join('+')]); } catch (e) { reasons.push([l.width + 'x' + l.height, '?']); } }
			out = { n: ls.length, drawn: drawn.length, megapixels: Math.round(drawn.reduce((a, l) => a + l.width * l.height, 0) / 1e5) / 10, big: reasons };
		}
		await cdp.send('LayerTree.disable');
		return out;
	};

	const measure = async (f, look, view) => {
		const url = f.url();
		await t.page.mouse.move(W - 6, Math.round(H / 2));
		await t.page.waitForTimeout(900);
		const row = { look, view, size: `${W}x${H}`, gpu };
		row.census = await f.evaluate(CENSUS);
		if (t.args.shots) await t.shot(`${look}-${view.replace(/[^a-z0-9]+/gi, '-')}`, `${look} ${view} as measured`);
		row.layers = await layers().catch((e) => ({ error: String(e) }));
		await f.evaluate(() => window.__fc.arm());
		await t.page.waitForTimeout(2000);
		row.callbacks = await f.evaluate(() => window.__fc.read());
		const box = await f.evaluate(() => {
			const o = document.getElementById('pm-o55-onboarding'); const p = (o && o.querySelector('.o55-window, .o55-win, .o55-pane')) || document.querySelector('.page.active') || document.body; const r = p.getBoundingClientRect();
			return { x: r.left, y: r.top, w: r.width, h: r.height };
		});
		for (const w of windows) {
			const keep = traces ? path.join(traces, `${look}-${view}-${w}.json`) : null;
			let during;
			if (w === 'sweep') during = async (until) => {
				// a slow zigzag over the view: about 120 real moves a second
				let i = 0;
				while (Date.now() < until) {
					const k = (i++ % 240) / 240, x = box.x + 20 + (box.w - 40) * (k < 0.5 ? k * 2 : 2 - k * 2), y = box.y + 20 + (box.h - 40) * ((i % 720) / 720);
					await t.page.mouse.move(Math.round(x), Math.round(y));
					await new Promise((r) => setTimeout(r, 6));
				}
			};
			if (w === 'scroll') during = async (until) => {
				await t.page.mouse.move(Math.round(box.x + box.w * 0.5), Math.round(box.y + box.h * 0.55));
				let i = 0;
				while (Date.now() < until) { await t.page.mouse.wheel(0, (Math.floor(i++ / 30) % 2 ? -1 : 1) * 40); await new Promise((r) => setTimeout(r, 14)); }
			};
			row[w] = await traceWindow(cdp, { ms, during, url, keep });
			await t.page.mouse.move(W - 6, Math.round(H / 2));
			await t.page.waitForTimeout(400);
		}
		rows.push(row);
		const n = (v) => Math.round(v || 0);
		const c = (x) => x ? `main ${n(x.cost.main)} (style ${n(x.split.style)} layout ${n(x.split.layout)} paint ${n((x.split.paint || 0) + (x.split.prepaint || 0))} script ${n(x.split.script)} hit ${n(x.split.hittest)}) comp ${n(x.cost.compositor)} raster ${n(x.cost.raster)} viz ${n(x.cost.viz)} gpu ${n(x.cost.gpuMain)} | main frames ${x.mainFrames.perSec}/s p50 ${x.mainFrames.p50} p95 ${x.mainFrames.p95} ms | drawn ${x.drawn.perSec}/s gap p95 ${x.drawn.gapP95} dropped ${x.frames.droppedPerSec}/s` : '-';
		t.log(`${look} ${view}: nodes ${row.census.nodes}/${row.census.rendered} anims ${row.census.anims.shown} (main-thread ${row.census.anims.mainThreadShown}) backdrop ${row.census.backdrop.n} (${row.census.backdrop.areaPct}% of view) filters ${row.census.filters.n} blends ${row.census.blends.n} layers ${row.layers?.drawn ?? '?'} (${row.layers?.megapixels ?? '?'} MP) rAF ${row.callbacks.rafPerSec}/s timers ${row.callbacks.timersPerSec}/s mutations ${row.callbacks.mutationsPerSec}/s`);
		for (const w of windows) t.log(`  ${w.padEnd(6)} ms/s: ${c(row[w])}`);
		if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(rows, null, 1));
	};

	if (appViews.length) {
		const f = await t.app.open({ query: warmQuery });
		await f.evaluate(() => document.fonts.ready.then(() => true));
		// --set css=<rules>: a trial stylesheet added to the page, to price a change before it is built
		if (t.args.css) await f.evaluate((css) => { const s = document.createElement('style'); s.id = 'fc-trial'; s.textContent = css; document.head.appendChild(s); }, String(t.args.css));
		// the page works for about 25 s after it loads (start-up tasks, the chat's demo run): measure after that
		await t.page.waitForTimeout(Number(t.args.settle ?? 30000));
		for (const look of looks) {
			await t.app.look(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await t.page.waitForTimeout(Number(t.args.lookSettle ?? 5000));
			for (const view of appViews) {
				if (!VIEWS[view]) throw new Error('unknown view ' + view);
				await VIEWS[view](f);
				await t.page.waitForTimeout(Number(t.args.viewSettle ?? 3000));
				if (t.args.animscan) {
					// which running animations make the main thread render: all paused, then one group (by keyframes name) at a time
					await t.page.mouse.move(W - 6, Math.round(H / 2));
					const groups = await f.evaluate(() => {
						const G = window.__fcGroups = new Map();
						const desc = (el, pseudo) => { const c = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') : (el.className && el.className.baseVal || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.'); return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (c ? '.' + c : '') + (pseudo || ''); };
						for (const a of document.getAnimations()) {
							if (a.playState !== 'running') continue;
							const eff = a.effect, el = eff && eff.target; if (!el) continue;
							const name = a.animationName || (a.transitionProperty ? 'transition:' + a.transitionProperty : 'waapi');
							let props = []; try { props = [...new Set(eff.getKeyframes().flatMap((k) => Object.keys(k)))].filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)); } catch (e) { /* none */ }
							let vis = false; try { vis = el.checkVisibility({ checkVisibilityCSS: true }); } catch (e) { vis = !!el.getClientRects().length; }
							const r = el.getBoundingClientRect(), on = vis && r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
							const g = G.get(name) || { name, anims: [], n: 0, onScreen: 0, inSvg: 0, props: new Set(), eg: desc(el, eff.pseudoElement), endless: eff.getComputedTiming().iterations === Infinity };
							g.anims.push(a); g.n++; if (on) g.onScreen++; if (el.ownerSVGElement) g.inSvg++; props.forEach((p) => g.props.add(p));
							G.set(name, g);
						}
						return [...G.values()].map((g) => ({ name: g.name, n: g.n, onScreen: g.onScreen, inSvg: g.inSvg, props: [...g.props], eg: g.eg, endless: g.endless }));
					});
					const only = (name) => f.evaluate((name) => { for (const [k, g] of window.__fcGroups) for (const a of g.anims) { try { if (name === '*' || k === name) a.play(); else a.pause(); } catch (e) { /* gone */ } } }, name);
					// restarting the group inside the trace makes Chrome say again whether it composited each animation
					const restart = (name) => f.evaluate((name) => { const g = window.__fcGroups.get(name); if (!g) return; for (const a of g.anims) { try { const at = a.currentTime; a.cancel(); a.play(); a.currentTime = at; } catch (e) { /* gone */ } } }, name);
					const shot = async (name) => { await only(name); await t.page.waitForTimeout(350); const x = await traceWindow(cdp, { ms: 1200, url: f.url(), during: () => restart(name) }); const n = Math.max(1, x.mainFrames.perSec); return { perSec: x.mainFrames.perSec, p50: x.mainFrames.p50, mainMs: Math.round(x.cost.main), style: Math.round((x.split.style || 0) / n * 100) / 100, layout: Math.round((x.split.layout || 0) / n * 100) / 100, paint: Math.round((x.split.paint || 0) / n * 100) / 100, elems: Math.round(x.style.elementsPerSec / n), drawn: x.drawn.perSec, gpu: Math.round(x.cost.gpuMain), viz: Math.round(x.cost.viz), why: x.notComposited.map((r) => r[0].split(' | ').slice(1).join(' | ')).filter((v, i, a) => a.indexOf(v) === i).join(' ; ') }; };
					const none = await shot('\u0000none');
					t.log(`${look} ${view} ANIM [all paused]: main frames ${none.perSec}/s, main ${none.mainMs} ms/s, drawn ${none.drawn}/s`);
					const out = [];
					for (const g of groups) {
						const m = await shot(g.name);
						out.push({ ...g, ...m });
						t.log(`${look} ${view} ANIM ${g.name} x${g.n} (on screen ${g.onScreen}, in svg ${g.inSvg}) [${g.props.join(',')}] ${g.eg.slice(0, 50)}: main frames ${m.perSec}/s p50 ${m.p50} ms, main ${m.mainMs} ms/s (style ${m.style} layout ${m.layout} paint ${m.paint} per frame, ${m.elems} elements), drawn ${m.drawn}/s gpu ${m.gpu} viz ${m.viz} | ${m.why ? 'NOT COMPOSITED: ' + m.why : 'no refusal reported'}`);
					}
					await only('*');
					rows.push({ look, view, animscan: out, none });
					if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(rows, null, 1));
					continue;
				}
				if (t.args.floor) {
					// what one main-thread frame costs when nothing but a do-nothing rAF loop asks for it, with the page's
					// animations running, then paused, then with named groups of them paused: the fixed price of a frame
					await t.page.mouse.move(W - 6, Math.round(H / 2));
					await f.evaluate(() => { try { window.PM_WARM && PM_WARM.stop && PM_WARM.stop(); } catch (e) { /* none */ } });
					const loop = (on) => f.evaluate((on) => { window.__fcLoop = on; if (on) { const k = () => { if (window.__fcLoop) requestAnimationFrame(k); }; requestAnimationFrame(k); } }, on);
					const per = (x) => { const n = Math.max(1, x.mainFrames.perSec); const g = (k) => Math.round((x.split[k] || 0) / n * 100) / 100; return `frames ${x.mainFrames.perSec}/s p50 ${x.mainFrames.p50} p95 ${x.mainFrames.p95} ms | per frame: style ${g('style')} layout ${g('layout')} prepaint ${g('prepaint')} paint ${g('paint')} layerize ${g('layerize')} commit ${g('commit')} hit ${g('hittest')} script ${g('script')} animate ${g('animate')} other ${g('other')} | style elements/frame ${Math.round(x.style.elementsPerSec / n)} | comp ${Math.round(x.cost.compositor)} viz ${Math.round(x.cost.viz)} gpu ${Math.round(x.cost.gpuMain)} ms/s drawn ${x.drawn.perSec}/s`; };
					const cases = [
						['no rAF, as is', null, false],
						['rAF loop, animations running', null, true],
						['rAF loop, all animations paused', () => document.getAnimations().forEach((a) => { try { a.pause(); } catch (e) { /* none */ } }), true],
						['no rAF, all animations paused', null, false]
					];
					for (const [name, prep, raf] of cases) {
						if (prep) await f.evaluate(prep);
						await loop(raf);
						await t.page.waitForTimeout(500);
						const x = await traceWindow(cdp, { ms: 2500, url: f.url() });
						await loop(false);
						t.log(`${look} ${view} FLOOR [${name}]: ${per(x)}`);
						rows.push({ look, view, floor: name, idle: x });
					}
					await f.evaluate(() => document.getAnimations().forEach((a) => { try { a.play(); } catch (e) { /* none */ } }));
					if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(rows, null, 1));
					continue;
				}
				if (t.args.timeline) {
					// how the resting cost changes with time since the look and view were set: warm-up work, then the steady state
					await t.page.mouse.move(W - 6, Math.round(H / 2));
					const t0 = Date.now(), total = Number(t.args.timeline) * 1000, step = Number(t.args.step || 5000);
					while (Date.now() - t0 < total) {
						const at = Math.round((Date.now() - t0) / 1000);
						await f.evaluate(() => window.__fc.arm());
						const x = await traceWindow(cdp, { ms: 1500, url: f.url() });
						const cb = await f.evaluate(() => window.__fc.read());
						const warm = await f.evaluate(() => { try { const w = window.PM_WARM; return w ? JSON.stringify(typeof w.state === 'function' ? w.state() : Object.keys(w)).slice(0, 300) : 'no PM_WARM'; } catch (e) { return String(e); } });
						t.log(`${look} ${view} +${at}s: main ${Math.round(x.cost.main)} ms/s, main frames ${x.mainFrames.perSec}/s p50 ${x.mainFrames.p50}, drawn ${x.drawn.perSec}/s, rAF ${cb.rafPerSec}/s [${cb.raf.slice(0, 3).map((r) => r[0] + ' ' + r[1].replace(/https?:\/\/[^ ]*?:(\d+:\d+)/g, ':$1').slice(0, 60)).join(' | ')}] timers ${cb.timersPerSec}/s mut ${cb.mutationsPerSec}/s | ${warm}`);
						rows.push({ look, view, at, idle: x, callbacks: cb });
						await t.page.waitForTimeout(Math.max(0, step - 1500 - 600));
					}
					if (t.args.out) writeFileSync(String(t.args.out), JSON.stringify(rows, null, 1));
					continue;
				}
				await measure(f, look, view);
			}
		}
	}
	if (onboarding) {
		const screens = String(t.args.screens || 'welcome').split(',').filter(Boolean);
		for (const look of looks) for (const screen of screens) {
			const f = await t.app.open({ onboarding: true, query: 'o55=screen=' + screen + (warmQuery ? '&' + warmQuery : '') });
			await f.evaluate(() => document.fonts.ready.then(() => true));
			await t.app.look(look);
			await f.waitForFunction(() => !(window.PM_THEME_TRANSITION?.busy?.() || window.PM_LOOK_COVERED?.()), null, { timeout: 20000 }).catch(() => {});
			await t.page.waitForTimeout(3500);
			await measure(f, look, 'onboarding:' + screen);
		}
	}
	await cdp.detach().catch(() => {});
	await t.check('frame cost rows written', rows.length > 0, String(rows.length));
}
