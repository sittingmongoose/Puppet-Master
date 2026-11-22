import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {captureResize, classifyResize} from '../helpers/resize-raster.mjs';
import {rasterAbVerdict, rasterAbStrict, shrinkResolution} from '../helpers/raster-ab-verdict.mjs';

// SW-36: Basic Dark, chat column 760, selected agent Detail docked at 1390x900, the frame shrinks to 1177x900 (the
// boundary where it must cover). Painted frames, not a rAF sampler. In T3's opaque iframe the child runs its resize
// event before its first new-sized frame, so that frame must already be the settled cover (no docked panel beside under
// 360 px of messages, no panel fading back in), and the parent must not show the old child image clipped to the new
// width for longer than on the control build. On a normal page Chrome lays a same-process frame out at its new size in
// the parent's frame and fires its resize event one rendering update later, so the first new-sized frame is the column
// at its old width beside the shrunk centre (the dock still beside 479 px), on every build; there the cover must arrive
// no later than on the control and stay once shown. The 360 px floor in every frame is also chat-sweep's rAF case.
// On both surfaces the child's first new-sized frame must come no later than on the control: the time from the resize
// to the first frame that is no longer the old image (firstNewMs), judged on its own, not through the time to the
// settled cover; on the opaque surface also the time the parent shows the old image clipped (retainedMs).
// The A/B judgement is paired and gap-aware (F12E-SB-AB-RASTER-NOISE, helpers/raster-ab-verdict.mjs). A tiny
// compositor-only animation on this test parent's magenta ground (outside the iframe and every measured region) keeps
// a frame flowing every vsync, so a gap in the screencast is delivery loss, not page timing. Each measure edge carries
// its resolution; a pair whose edge gap exceeds R = min(3 x median frame interval, 50 ms) on either side is unresolved
// and not judged. The median of head - control over the resolved pairs must stay within a fixed ms tolerance
// (30 ms for firstNewMs and settledMs, 25 ms for retainedMs, capped below the 50/50/100 ms bite thresholds). --set control=<page>
// measures a control in the same browser, order-balanced (C H H C C H ...); --set reps=N resolved pairs wanted per
// measure (default 6), shrinking until N resolved pairs or 2N attempted (the 2 x run-time cap). Fewer than N resolved
// pairs is a failing "could not judge" row, never a silent pass. The old strict head-median <= control-median compare
// is kept in the log, not judged. The summary keeps every value, sorted, with the pairwise differences, the per-shrink
// resolution and the verdict.
// --set sandbox=1 opaque only, =0 normal only; both by default.
const FROM = 1390, TO = 1177, HEIGHT = 900;
const url = p => /^https?:/.test(p) ? p : pathToFileURL(p).href;
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const r1 = v => v == null ? null : Math.round(v * 10) / 10;
// every value, sorted, with min, median and max: a median alone hid how far three pairs scattered
const dist = a => { const v = a.filter(x => x != null).sort((x, y) => x - y).map(r1); return {n: v.length, min: v[0] ?? null, median: r1(median(v)), max: v.at(-1) ?? null, sorted: v}; };

async function shrinkOnce(t, f, page, opaque, label, dir) {
	const el = await f.frameElement();
	await el.evaluate((e, w) => Object.assign(e.style, {width: w + 'px', minWidth: w + 'px', maxWidth: 'none', height: '900px'}), FROM);
	await f.goto(url(page) + '?o55=off&raster=' + encodeURIComponent(label), {timeout: 60000});
	await f.waitForFunction(() => window.__PM56_BOOT_OK && window.PM56_PORT?.ready, null, {timeout: 60000});
	await f.locator('#o55np-reboot').waitFor({state: 'detached', timeout: 20000});
	const setup = await f.evaluate(() => {
		PMW.chatCol.setWidth(760); PMW.chatCol.show();
		const ok = PM56_DEMO.openActivity('subagents', 'agent-schema');
		return {ok, theme: document.documentElement.dataset.theme, opaque: (() => { try { return !window.localStorage; } catch (_) { return true; } })()};
	});
	await t.page.waitForTimeout(2500);
	const docked = await f.evaluate(() => ({w: innerWidth, stage: document.querySelector('#pmRoot .chat-stage').getBoundingClientRect().width,
		cover: !!document.querySelector('#pmRoot .activity-panel.cover'), selected: PM56_APP.state.activity.selected?.id, nodes: document.querySelectorAll('#pmRoot *').length}));
	await t.check(label + ' docked Detail before the shrink', setup.ok && setup.theme === 'basic-dark' && setup.opaque === opaque && docked.w === FROM && !docked.cover && docked.stage >= 360 && docked.selected === 'agent-schema', JSON.stringify({setup, docked}));
	const box = await el.boundingBox();
	const cap = await captureResize(t.page, async () => { await t.mark(label + ' shrink'); return el.evaluate((e, w) => { const wall = performance.timeOrigin + performance.now(); e.style.width = w + 'px'; e.style.minWidth = w + 'px'; return wall; }, TO); });
	await t.mark(label + ' settled');
	const settled = await f.evaluate(() => ({w: innerWidth, cover: !!document.querySelector('#pmRoot .activity-panel.cover'), stage: document.querySelector('#pmRoot .chat-stage').getBoundingClientRect().width,
		column: document.getElementById('pmw-chat56').getBoundingClientRect().toJSON()}));
	let r;
	try { r = classifyResize(cap, box, TO, settled.column); } catch (error) { r = {error: error.message}; }
	const out = join(dir, label); mkdirSync(out, {recursive: true});
	writeFileSync(join(out, 'before.png'), cap.before); writeFileSync(join(out, 'after.png'), cap.after);
	cap.frames.forEach((fr, i) => writeFileSync(join(out, String(i).padStart(3, '0') + '.png'), fr.png));
	writeFileSync(join(out, 'raster.json'), JSON.stringify({box, settled, docked, resizeWall: cap.wall, frames: cap.frames.map(fr => fr.wall), result: r}, null, 1));
	const {samples, ...summary} = r;
	t.log(label + ' ' + JSON.stringify({...summary, settled: {w: settled.w, cover: settled.cover, stage: settled.stage}}));
	return {...r, settledState: settled};
}

async function surface(t, opaque) {
	await t.emulate({reducedMotion: 'no-preference'});
	const [f] = await t.openSideBySide([{url: 'about:blank', width: FROM, height: HEIGHT}], {height: HEIGHT, settleMs: 0});
	// a ground nothing in the app paints, so the strip the parent takes back is unmistakable
	await t.page.evaluate(() => { document.documentElement.style.background = document.body.style.background = '#ff00ff'; });
	// Capture fidelity (F12E-SB-AB-RASTER-NOISE): a compositor-only opacity animation on a 2 px marker on the parent's
	// magenta ground at the far right edge — outside the iframe box and every measured region (strip/chat are inside the
	// iframe). It forces a compositor frame every vsync so a screencast gap is delivery loss, not an idle compositor.
	// Never in the product page; magenta on magenta paints nothing the app paints and cannot touch the child.
	await t.page.evaluate(() => {
		const s = document.createElement('style');
		s.textContent = '@keyframes rnVsync { from { opacity: 0.5; } to { opacity: 1; } }';
		document.head.appendChild(s);
		const d = document.createElement('div');
		d.id = 'rn-vsync-marker';
		Object.assign(d.style, {position: 'fixed', right: '0', top: '0', width: '2px', height: '2px', background: '#ff00ff',
			willChange: 'opacity', animation: 'rnVsync 1s linear infinite alternate', pointerEvents: 'none', zIndex: '2147483647'});
		document.body.appendChild(d);
	});
	if (opaque) await (await f.frameElement()).evaluate(e => e.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups allow-downloads'));
	const head = t.args.page || new URL('../../../PMConcept7.html', import.meta.url).pathname;
	const control = t.args.control;
	const reps = Number(t.args.reps || 6);           // resolved pairs wanted per measure
	const maxPairs = control ? reps * 2 : reps;      // 2 x run-time cap on attempted pairs
	const measures = ['firstNewMs', 'settledMs', ...(opaque ? ['retainedMs'] : [])];
	const dir = join(t.run.dir, opaque ? 'opaque' : 'normal');
	const runs = {head: [], control: []};
	const order = [];
	let n = 0;
	// one balanced-order pair per index: head - control, and whether both sides' measure edges are resolved
	const resolvedPairs = key => runs.head.map((r, i) => {
		const c = runs.control[i];
		const diff = c && r[key] != null && c[key] != null ? r1(r[key] - c[key]) : null;
		return {diff, resolved: !!(c && r.res?.[key]?.resolved && c.res?.[key]?.resolved)};
	});
	const enough = () => measures.every(k => resolvedPairs(k).filter(p => p.resolved && p.diff != null).length >= reps);
	for (let p = 0; p < maxPairs; p++) {
		const pairOrder = control ? (p % 2 ? ['head', 'control'] : ['control', 'head']) : ['head'];
		for (const which of pairOrder) {
			order.push(which);
			const r = await shrinkOnce(t, f, which === 'head' ? head : control, opaque, which + '-' + (n++), dir);
			r.res = shrinkResolution(r, measures);
			runs[which].push(r);
			if (which !== 'head') continue;
			const tag = (opaque ? 'opaque ' : 'normal ') + (runs.head.length - 1);
			await t.check(tag + ' settles to the cover at 1177', r.settledState.w === TO && r.settledState.cover, JSON.stringify(r.settledState));
			await t.check(tag + ' frames classified', !r.error && r.firstNewMs != null && r.settled, r.error || JSON.stringify({firstNewMs: r.firstNewMs, settled: r.settled}));
			if (opaque) await t.check(tag + ' first new-sized frame is the settled cover, no docked or other intermediate frame', !r.error && r.firstNewKind === 'final' && r.intermediate.length === 0, JSON.stringify({firstNewKind: r.firstNewKind, intermediate: r.intermediate}));
			await t.check(tag + ' the cover stays once shown', !r.error && r.unsettled.length === 0, JSON.stringify({unsettled: r.unsettled}));
		}
		if (control && enough()) break;
	}
	const name = opaque ? 'opaque' : 'normal';
	const of = (which, key) => runs[which].map(r => r[key] ?? null);
	// every pairwise head - control in run order, resolved or not (the summary keeps every value)
	const pairs = key => resolvedPairs(key).map(p => p.diff).filter(v => v != null);
	const verdict = control ? rasterAbVerdict(Object.fromEntries(measures.map(k => [k, resolvedPairs(k)])), {minResolved: reps}) : null;
	const summary = {surface: name, reps, maxPairs, pairsAttempted: runs.head.length, order,
		measures: Object.fromEntries(measures.map(k => [k, {head: dist(of('head', k)), control: dist(of('control', k)), headMinusControl: dist(pairs(k)),
			resolved: dist(resolvedPairs(k).filter(p => p.resolved).map(p => p.diff)), verdict: verdict?.[k] ?? null}])),
		headResolution: runs.head.map(r => r.res), controlResolution: runs.control.map(r => r.res),
		headFirstNewKind: runs.head.map(r => r.firstNewKind), controlFirstNewKind: runs.control.map(r => r.firstNewKind),
		headIntermediate: runs.head.map(r => r.intermediate?.length ?? null), controlIntermediate: runs.control.map(r => r.intermediate?.length ?? null)};
	t.log('resize raster ' + JSON.stringify(summary));
	writeFileSync(join(dir, 'summary.json'), JSON.stringify(summary, null, 1));
	const m = summary.measures;
	await t.check(`${name} first new-sized frame measured on every head shrink`, m.firstNewMs.head.n === runs.head.length, JSON.stringify(m.firstNewMs.head));
	if (opaque) await t.check('opaque parent shows the old image clipped (measured) on the head', m.retainedMs.head.n === runs.head.length, JSON.stringify(m.retainedMs.head));
	if (control) {
		const AB_LABEL = {firstNewMs: 'first new-sized frame after the resize (firstNewMs)', retainedMs: 'old image shown clipped (retainedMs)', settledMs: 'settled cover (settledMs)'};
		for (const k of measures) {
			const v = verdict[k];
			const strict = rasterAbStrict(of('head', k), of('control', k));
			t.log(`${name} ${k} old strict rule (log only): head median ${strict.headMedianMs} ms <= control median ${strict.controlMedianMs} ms: ${strict.ok ? 'PASS' : 'FAIL'}`);
			// the first new-sized frame on its own: the cover settling sooner does not excuse a later first frame
			await t.check(`${name} ${AB_LABEL[k]}: ${v.rule}`, v.ok === true,
				JSON.stringify({head: m[k].head, control: m[k].control, headMinusControl: m[k].headMinusControl, resolved: m[k].resolved, verdict: v}));
		}
	}
	if (t.args.maxMs) await t.check(`${name} firstNewMs head median <= ${t.args.maxMs} ms`, m.firstNewMs.head.median != null && m.firstNewMs.head.median <= Number(t.args.maxMs), JSON.stringify(m.firstNewMs.head));
}

export const tests = {
	'SW36 opaque resize raster': async t => { if (t.args.sandbox == null || Number(t.args.sandbox) === 1) await surface(t, true); },
	'SW36 normal resize first frame': async t => { if (t.args.sandbox == null || Number(t.args.sandbox) === 0) await surface(t, false); }
};
