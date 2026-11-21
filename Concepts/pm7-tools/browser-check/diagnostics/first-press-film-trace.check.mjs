// FO-240 round 6b diagnostic. One trusted first press (Home > Agents, or --set route=rail for Files Explorer >
// Changed) in Friendly Dark, as home-agents-first-press does, with an optional same-press DevTools trace that includes
// the GPU process (--set trace=1) and an in-page probe of the chip's carry clock. Writes native-press.json (for
// tools/home-agents-first-press-film-reader.mjs), probe.json and, with trace=1, press-trace.json.gz to the run folder.
// Record with --record <film> --no-pointer-marker to pair the film with the trace.
import { writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { setLookBySetting } from '../helpers/settings-look.mjs';

const CATS = ['toplevel', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame',
	'blink', 'blink.animations', 'cc', 'viz', 'gpu', 'benchmark', 'blink.user_timing', 'v8.execute', 'graphics.pipeline'];
const SKIA = ['skia', 'disabled-by-default-skia', 'disabled-by-default-skia.gpu', 'gpu.dawn', 'disabled-by-default-gpu.dawn', 'gpu.graphite'];

export default async function (t) {
	await t.viewport(1920, 1080);
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open(t.args.query ? { query: String(t.args.query) } : undefined);
	await f.locator('#tab-settings').click();
	await t.settle();
	await setLookBySetting(t, f, String(t.args.look || 'friendly-dark'));
	await f.locator('.title-bar nav.page-tabs .page-tab').first().click();
	await t.page.waitForTimeout(Number(t.args.wait || 1700));

	const rail = t.args.route === 'rail';
	const strip = rail ? f.locator('#panel-files > .pm-segtab:visible')
		: f.locator('.pmw-strip:visible').filter({ has: f.locator('.pmw-tab[data-tab-id="dashboard:agents"]') }).first();
	const item = rail ? '.pm-segtab-item' : '.pmw-tab';
	const tab = rail ? 'data-tab' : 'data-tab-id';
	const from = strip.locator(`${item}[${tab}="${rail ? 'explorer' : 'dashboard:home'}"]`);
	const targetId = rail ? 'changed' : 'dashboard:agents';
	const to = strip.locator(`${item}[${tab}="${targetId}"]`);
	const homeBox = await from.boundingBox(), agentsBox = await to.boundingBox();
	const isSelected = async (locator) => rail ? locator.evaluate((e) => e.classList.contains('active'))
		: await locator.getAttribute('aria-selected') === 'true';
	const cold = rail || await f.evaluate(() => !window.PMW.instances['dashboard:agents']);
	if (!(await t.check(rail ? 'Fresh Files rail with Explorer selected' : 'Settled Home and an unmounted Agents panel',
		!!homeBox && !!agentsBox && cold && await isSelected(from) && !(await isSelected(to))))) return;

	await f.evaluate(({ item, tab, scope }) => {
		const read = window.__fo240Native = { clicks: [], animation: null };
		const P = window.__r6b = { ev: [], frames: [], anims: [], loaf: [], t0: performance.now() };
		document.addEventListener('click', (e) => {
			const button = e.target.closest(item);
			if (button?.closest(scope)) read.clicks.push({ id: button.getAttribute(tab), trusted: e.isTrusted });
		}, true);
		['pointerdown', 'pointerup', 'click'].forEach((type) => document.addEventListener(type, (e) => P.ev.push({ type, at: performance.now(), ts: e.timeStamp }), true));
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (frames, timing) {
			const a = animate.call(this, frames, timing);
			if (this.matches('.lg-carry') && this.closest(scope) && frames?.[0]?.transform) {
				if (!read.animation) read.animation = { frames, dur: timing.duration, width: parseFloat(this.style.width), height: parseFloat(this.style.height) };
				P.anims.push({ a, made: performance.now() });
			}
			return a;
		};
		try {
			new PerformanceObserver((l) => l.getEntries().forEach((e) => P.loaf.push({ start: e.startTime, dur: e.duration, render: e.renderStart, style: e.styleAndLayoutStart, blocking: e.blockingDuration,
				scripts: (e.scripts || []).map((s) => ({ inv: s.invoker, src: s.sourceURL, ch: s.sourceCharPosition, at: s.startTime, dur: s.duration, forced: s.forcedStyleAndLayoutDuration })) })))
				.observe({ type: 'long-animation-frame', buffered: false });
		} catch (_) { /* none */ }
		P.held = [];
		new MutationObserver((recs) => recs.forEach((r) => { const e = r.target; if (e.matches && e.matches('.pmw-tabbody')) P.held.push({ at: performance.now(), tab: e.getAttribute('data-pmw-tab'), attr: r.attributeName, held: e.hasAttribute('data-pmw-held'), hidden: e.hidden }); }))
			.observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['data-pmw-held', 'hidden'] });
		const tick = (now) => {
			const c = P.anims[0]?.a;
			P.frames.push({ now, at: performance.now(), tl: document.timeline.currentTime, ct: c ? c.currentTime : null, st: c ? c.startTime : null, ps: c ? c.playState : null,
				mounted: !!window.PMW?.instances?.['dashboard:agents'] });
			if (performance.now() - P.t0 < 4000) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}, { item, tab, scope: rail ? '#panel-files' : '.pmw-strip' });
	await t.page.mouse.move(agentsBox.x + agentsBox.width / 2, agentsBox.y + agentsBox.height / 2);
	await t.page.waitForTimeout(Number(t.args.hover || 300));

	const trace = t.args.trace === '1' || t.args.trace === 1;
	const cdp = trace ? await t.page.context().newCDPSession(t.page) : null;
	if (cdp) {
		await cdp.send('Tracing.start', { categories: CATS.concat(t.args.skia ? SKIA : []).join(','), transferMode: 'ReturnAsStream', bufferUsageReportingInterval: 0 });
		await t.page.waitForTimeout(150);
	}
	await t.mark(rail ? 'First Explorer to Changed press' : 'First Home to Agents press');
	await t.page.mouse.down();
	await t.page.waitForTimeout(Number(t.args.hold || 90));
	await t.page.mouse.up();
	await t.page.waitForTimeout(1400);
	await t.mark(rail ? 'Changed settled' : 'Agents settled');
	let dataLoss = null;
	if (cdp) {
		const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
		await cdp.send('Tracing.end');
		const done = await complete; dataLoss = !!done.dataLossOccurred;
		const parts = [];
		for (;;) { const r = await cdp.send('IO.read', { handle: done.stream, size: 1 << 22 }); parts.push(r.base64Encoded ? Buffer.from(r.data, 'base64') : Buffer.from(r.data, 'utf8')); if (r.eof) break; }
		await cdp.send('IO.close', { handle: done.stream });
		writeFileSync(t.run.dir + '/press-trace.json.gz', gzipSync(Buffer.concat(parts)));
		await cdp.detach();
	}

	const { clicks, animation } = await f.evaluate(() => window.__fo240Native);
	const probe = await f.evaluate(() => { const P = window.__r6b; return { ev: P.ev, frames: P.frames, loaf: P.loaf, anims: P.anims.map((x) => ({ made: x.made, start: x.a.startTime, state: x.a.playState })),
		warm: (window.__pmWarmLog || []).filter((r) => r.owner === 'glass' || /carry|agents|dashboard/i.test(r.name || '')).map((r) => ({ owner: r.owner, name: r.name, t: r.t, at: r.at, frameMs: r.frameMs, late: r.late, outcome: r.outcome })),
		warmState: window.PM_WARM && window.PM_WARM.state ? window.PM_WARM.state() : null, held: P.held, dbg: window.__lgDbg || null }; });
	const selected = await isSelected(to);
	const firstPress = clicks.length === 1 && clicks[0].trusted && clicks[0].id === targetId;
	await t.check(`One trusted press selected ${rail ? 'Changed' : 'Agents'} and had a carried chip`, firstPress && selected && !!animation);
	writeFileSync(t.run.dir + '/native-press.json', JSON.stringify({ homeBox, agentsBox, animation, firstPress, selected, ...(rail ? { route: 'rail' } : {}) }));
	writeFileSync(t.run.dir + '/probe.json', JSON.stringify({ dataLoss, ...probe }));
}
